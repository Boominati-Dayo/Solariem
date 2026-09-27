import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/middleware/auth';

export const GET = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();

    const requests = await db.collection('taxRefunds').aggregate([
      {
        $addFields: {
          userObjectId: { $toObjectId: "$userId" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userObjectId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          userObjectId: 0,
          "userDetails.password": 0,
          "userDetails.transactions": 0,
          "userDetails.activityLog": 0
        }
      }
    ]).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching admin tax refunds:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tax refund requests' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const { id, status, rejectionReason, amountToCredit } = await request.json();

    if (!['approved', 'rejected', 'processing'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const taxRefund = await db.collection('taxRefunds').findOne({ _id: new ObjectId(id) });
    if (!taxRefund) {
      return NextResponse.json({ success: false, error: 'Tax Refund not found' }, { status: 404 });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(taxRefund.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await db.collection('taxRefunds').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
          rejectionReason: rejectionReason || null,
          amountCredited: status === 'approved' ? amountToCredit : (taxRefund.amountCredited || 0)
        }
      }
    );

    // If approved, update user's balance
    if (status === 'approved' && amountToCredit > 0 && taxRefund.status !== 'approved') {
      await db.collection('users').updateOne(
        { _id: new ObjectId(user._id) },
        {
          $inc: {
            'balances.main': Number(amountToCredit),
            'balances.total': Number(amountToCredit)
          },
          $push: {
            activityLog: {
              action: `Tax Refund Approved: ${user.currency || 'USD'} ${amountToCredit.toLocaleString()} credited.`,
              timestamp: new Date().toISOString()
            }
          } as any
        }
      );
    }

    // Send Status Email
    let subject = '';
    let emailContent = '';

    if (status === 'approved') {
      subject = 'Tax Refund Approved - Solariem';
      emailContent = `We are pleased to inform you that your Tax Refund request has been approved.<br><br>An amount of <strong>${user.currency || 'USD'} ${amountToCredit ? amountToCredit.toLocaleString() : '0'}</strong> has been successfully credited to your main balance.`;
    } else if (status === 'rejected') {
      subject = 'Tax Refund Rejected - Solariem';
      emailContent = `Unfortunately, your Tax Refund request has been rejected.<br><br><strong>Reason:</strong> ${rejectionReason || 'No specific reason provided.'}`;
    } else if (status === 'processing') {
      subject = 'Tax Refund Processing - Solariem';
      emailContent = 'Your Tax Refund request is currently being processed by our forensic team. We will notify you once a final decision has been made.';
    }

    if (subject && emailContent && user.email) {
      const { sendEmail, getBaseTemplate } = await import('@/lib/email');
      const html = getBaseTemplate(subject, emailContent, user.firstName);
      await sendEmail({
        to: user.email,
        subject,
        text: emailContent.replace(/<[^>]+>/g, ''), // strip html for text version
        html
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating tax refund status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update tax refund status' }, { status: 500 });
  }
});
