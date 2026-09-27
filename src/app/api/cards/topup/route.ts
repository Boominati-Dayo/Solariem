import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/middleware/auth';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { verifyPinForUser } from '@/lib/auth/pin';

export const POST = requireAuth(async (request, context) => {
  try {
    const db = await getDb();
    const userId = request.user!.id;
    const { cardId, amount, pin } = await request.json();

    if (!cardId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid card or amount' }, { status: 400 });
    }

    // Check card exists and belongs to user
    const card = await db.collection('virtualCards').findOne({ 
      _id: new ObjectId(cardId),
      userId 
    });

    if (!card) {
      return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
    }

    if (card.status !== 'approved') {
      return NextResponse.json({ success: false, error: 'Card must be active to top up' }, { status: 400 });
    }

    // Check user balance
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // Verify transaction PIN
    const isPinValid = await verifyPinForUser(user, pin);
    if (!isPinValid) {
      return NextResponse.json({ success: false, error: 'Invalid or missing transaction PIN. Please try again.' }, { status: 401 });
    }

    const currentBalance = user.balances?.main || 0;
    if (currentBalance < amount) {
      return NextResponse.json({ success: false, error: 'Insufficient main balance' }, { status: 400 });
    }

    // Create top-up request
    const topUpRequest = {
      userId,
      cardId,
      amount: parseFloat(amount),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const topUpResult = await db.collection('cardTopUps').insertOne(topUpRequest);

    // Deduct from main balance immediately
    const newBalance = currentBalance - amount;
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          'balances.main': newBalance,
          'balances.total': (user.balances?.referral || 0) + newBalance,
          updatedAt: new Date()
        },
        $push: {
          transactions: {
            type: 'card_topup',
            amount: amount,
            date: new Date(),
            status: 'processing',
            description: `Card Top-up Request (Card ending in ${card.lastFour})`,
            topUpId: topUpResult.insertedId
          },
          activityLog: {
            action: `Requested ${user.currency || 'USD'} ${amount} card top-up`,
            timestamp: new Date().toISOString()
          }
        } as any
      }
    );

    // Notify user
    await NotificationService.createNotification({
      title: 'Top-up Request Received',
      message: `Your request to top up ${user.currency || 'USD'} ${amount} to your virtual card has been received and is pending admin approval.`,
      type: 'individual',
      recipients: [userId],
      sentBy: 'system'
    });

    return NextResponse.json({ success: true, data: { _id: topUpResult.insertedId } });

  } catch (error) {
    console.error('Card Top-up Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
