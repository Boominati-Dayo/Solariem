import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/middleware/auth';
import { NotificationService } from '@/lib/notifications/NotificationService';

export const GET = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const requests = await db.collection('cardTopUps')
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich with user and card details
    const userIds = requests.map(r => new ObjectId(r.userId));
    const cardIds = requests.map(r => new ObjectId(r.cardId));

    const [users, cards] = await Promise.all([
      db.collection('users').find({ _id: { $in: userIds } }).project({ email: 1, firstName: 1, lastName: 1, userCode: 1, currency: 1 }).toArray(),
      db.collection('virtualCards').find({ _id: { $in: cardIds } }).toArray()
    ]);

    const userMap = users.reduce((acc, u) => ({ ...acc, [u._id.toString()]: u }), {} as any);
    const cardMap = cards.reduce((acc, c) => ({ ...acc, [c._id.toString()]: c }), {} as any);

    const enriched = requests.map(r => ({
      ...r,
      user: userMap[r.userId] || null,
      card: cardMap[r.cardId] || null
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Admin Top-up GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const { requestId, action } = await request.json();

    if (!requestId || !['approve', 'decline'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    const topUp = await db.collection('cardTopUps').findOne({ _id: new ObjectId(requestId) });
    if (!topUp || topUp.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Request not found or already processed' }, { status: 404 });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(topUp.userId) });
    const userCurrency = user?.currency || 'USD';

    if (action === 'approve') {
      // 1. Update card balance
      await db.collection('virtualCards').updateOne(
        { _id: new ObjectId(topUp.cardId) },
        { $inc: { balance: topUp.amount }, $set: { updatedAt: new Date() } }
      );

      // 2. Mark request as approved
      await db.collection('cardTopUps').updateOne(
        { _id: new ObjectId(requestId) },
        { $set: { status: 'approved', approvedAt: new Date(), updatedAt: new Date() } }
      );

      // 3. Notify user
      await NotificationService.createNotification({
        title: 'Card Top-up Successful',
        message: `Your card top-up of ${userCurrency} ${topUp.amount} has been approved and added to your card balance.`,
        type: 'individual',
        recipients: [topUp.userId],
        sentBy: 'system'
      });
    } else {
      // 1. Refund user main balance
      if (user) {
        const newMain = (user.balances?.main || 0) + topUp.amount;
        await db.collection('users').updateOne(
          { _id: new ObjectId(topUp.userId) },
          { 
            $set: { 
              'balances.main': newMain,
              'balances.total': (user.balances?.referral || 0) + newMain,
              updatedAt: new Date()
            },
            $push: {
              transactions: {
                type: 'refund',
                amount: topUp.amount,
                date: new Date(),
                status: 'completed',
                description: 'Refund: Card Top-up Declined'
              }
            } as any
          }
        );
      }

      // 2. Mark request as declined
      await db.collection('cardTopUps').updateOne(
        { _id: new ObjectId(requestId) },
        { $set: { status: 'declined', updatedAt: new Date() } }
      );

      // 3. Notify user
      await NotificationService.createNotification({
        title: 'Card Top-up Declined',
        message: `Your card top-up request of ${userCurrency} ${topUp.amount} was declined. The funds have been returned to your main balance.`,
        type: 'individual',
        recipients: [topUp.userId],
        sentBy: 'system'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Top-up PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
