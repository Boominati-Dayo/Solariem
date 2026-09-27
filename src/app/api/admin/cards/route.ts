import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/middleware/auth';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { generateCardNumber, generateCVV, generateExpiryDate } from '@/lib/utils/cardUtils';
import { sendEmail, emailTemplates } from '@/lib/email';

export const GET = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const cards = await db.collection('virtualCards')
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray();

    // Map user info to cards
    const userIds = [...new Set(cards.map(c => new ObjectId(c.userId)))];
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .project({ firstName: 1, lastName: 1, email: 1, userCode: 1, currency: 1 })
      .toArray();

    const userMap = users.reduce((acc, u) => ({
      ...acc,
      [u._id.toString()]: u
    }), {} as any);

    const enrichedCards = cards.map(card => ({
      ...card,
      user: userMap[card.userId] || null
    }));

    return NextResponse.json({
      success: true,
      data: enrichedCards
    });
  } catch (error) {
    console.error('Error fetching card requests:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch card requests' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const { cardId, action, reason } = await request.json();

    if (!cardId || !action) {
      return NextResponse.json({ success: false, error: 'Card ID and action are required' }, { status: 400 });
    }

    const card = await db.collection('virtualCards').findOne({ _id: new ObjectId(cardId) });
    if (!card) {
      return NextResponse.json({ success: false, error: 'Card request not found' }, { status: 404 });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(card.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const cardNumber = generateCardNumber(card.cardType);
      const cvv = generateCVV(card.cardType);
      const expiry = generateExpiryDate();

      await db.collection('virtualCards').updateOne(
        { _id: new ObjectId(cardId) },
        {
          $set: {
            status: 'approved',
            cardNumber, // In a real system, these would be encrypted/PCI DSS compliant
            cvv,
            expiry,
            lastFour: cardNumber.slice(-4),
            approvedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      // Notify user
      await NotificationService.createNotification({
        title: 'Virtual Card Approved',
        message: `Your ${card.cardLevel} ${card.cardType} virtual card has been approved and is now ready for use.`,
        type: 'individual',
        recipients: [card.userId],
        sentBy: 'system'
      });

      // Send Email
      if (user.email) {
        const subject = 'Your Virtual Card is Ready - Solariem';
        const html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0E5A50;">Virtual Card Approved</h2>
            <p>Hello <strong>${user.firstName}</strong>,</p>
            <p>Your request for a <strong>${card.cardLevel} ${card.cardType}</strong> virtual card has been approved.</p>
            <p>Your card is now ready for use. You can securely access your full card details, including the card number and CVV, directly from your dashboard.</p>
            <div style="margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #0E5A50; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Your Card</a>
            </div>
            <p>If you did not request this card, please contact our support team immediately.</p>
            <p>Best regards,<br/>The Solariem Team</p>
          </div>
        `;
        await sendEmail({
          to: user.email,
          subject,
          text: `Hello ${user.firstName}, your ${card.cardLevel} ${card.cardType} virtual card has been approved and is ready for use. View it on your dashboard.`,
          html
        });
      }

    } else if (action === 'decline') {
      await db.collection('virtualCards').updateOne(
        { _id: new ObjectId(cardId) },
        {
          $set: {
            status: 'rejected',
            rejectionReason: reason || 'Information provided was insufficient.',
            updatedAt: new Date()
          }
        }
      );

      // Notify user
      await NotificationService.createNotification({
        title: 'Virtual Card Declined',
        message: `Unfortunately, your application for a ${card.cardLevel} virtual card was declined. Reason: ${reason || 'Insufficient information'}`,
        type: 'individual',
        recipients: [card.userId],
        sentBy: 'system'
      });

      // Send Email
      if (user.email) {
        const subject = 'Virtual Card Request Declined - Solariem';
        const html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #d9534f;">Card Request Declined</h2>
            <p>Hello <strong>${user.firstName}</strong>,</p>
            <p>Unfortunately, your application for a <strong>${card.cardLevel}</strong> virtual card was declined.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br/>The Solariem Team</p>
          </div>
        `;
        await sendEmail({
          to: user.email,
          subject,
          text: `Hello ${user.firstName}, your virtual card request was declined. Reason: ${reason || 'Not specified'}`,
          html
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating card request:', error);
    return NextResponse.json({ success: false, error: 'Failed to update card request' }, { status: 500 });
  }
});
