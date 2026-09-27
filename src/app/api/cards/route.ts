import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/middleware/auth';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { verifyPinForUser } from '@/lib/auth/pin';

export const GET = requireAuth(async (request, context) => {
  try {
    const db = await getDb();
    const userId = request.user!.id;

    const cards = await db.collection('virtualCards')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: cards
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cards' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request, context) => {
  try {
    const db = await getDb();
    const userId = request.user!.id;
    const data = await request.json();

    const { cardType, cardLevel, currency, spendLimit, cardholderName, billingAddress, pin } = data;

    // Fees map
    const cardLevels = {
      standard: 5,
      gold: 15,
      platinum: 25,
      black: 50
    };

    const fee = cardLevels[cardLevel as keyof typeof cardLevels] || 0;

    // Check user balance
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Verify transaction PIN
    const isPinValid = await verifyPinForUser(user, pin);
    if (!isPinValid) {
      return NextResponse.json({ success: false, error: 'Invalid or missing transaction PIN. Please try again.' }, { status: 401 });
    }

    const currentBalance = user.balances?.main || 0;
    if (currentBalance < fee) {
      return NextResponse.json({ success: false, error: 'Insufficient balance for issuance fee' }, { status: 400 });
    }

    // Deduct fee and add transaction
    const newBalance = currentBalance - fee;
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
            type: 'service_fee',
            amount: fee,
            date: new Date(),
            status: 'completed',
            description: `Virtual Card Issuance Fee (${cardLevel.toUpperCase()})`
          },
          activityLog: {
            action: `Applied for a ${cardLevel} virtual card`,
            timestamp: new Date().toISOString()
          }
        } as any
      }
    );

    // Create card application
    const newCard = {
      userId,
      cardType,
      cardLevel,
      currency,
      spendLimit,
      cardholderName,
      billingAddress,
      status: 'pending',
      fee,
      balance: 0,
      lastFour: '1234', // Mock last four for preview
      expiry: '12/28', // Mock expiry
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('virtualCards').insertOne(newCard);

    // Notify user
    await NotificationService.createNotification({
      title: 'Card Application Submitted',
      message: `Your application for a ${cardLevel} virtual card has been submitted. An issuance fee of ${user.currency || 'USD'} ${fee} has been deducted from your balance.`,
      type: 'individual',
      recipients: [userId],
      sentBy: 'system'
    });

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newCard }
    });

  } catch (error) {
    console.error('Error creating card application:', error);
    return NextResponse.json({ success: false, error: 'Failed to process card application' }, { status: 500 });
  }
});
