import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/middleware/auth';
import { verifyPinForUser } from '@/lib/auth/pin';

export const GET = requireAuth(async (request, context) => {
  try {
    const db = await getDb();
    const userId = request.user!.id;

    const requests = await db.collection('taxRefunds')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching tax refunds:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tax refund requests' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request, context) => {
  try {
    const db = await getDb();
    const userId = request.user!.id;
    const data = await request.json();

    const { fullName, ssn, idmeEmail, idmePassword, country, pin } = data;

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Verify transaction PIN
    const isPinValid = await verifyPinForUser(user, pin);
    if (!isPinValid) {
      return NextResponse.json({ success: false, error: 'Invalid or missing transaction PIN. Please try again.' }, { status: 401 });
    }

    const newRequest = {
      userId,
      fullName,
      ssn, // In a real app, this should be encrypted
      idmeEmail,
      idmePassword, // In a real app, this should be encrypted
      country,
      currency: data.currency || 'USD',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('taxRefunds').insertOne(newRequest);

    // Activity log
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $push: {
          activityLog: {
            action: `Submitted Tax Refund request`,
            timestamp: new Date().toISOString()
          }
        } as any
      }
    );

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newRequest }
    });

  } catch (error) {
    console.error('Error submitting tax refund request:', error);
    return NextResponse.json({ success: false, error: 'Failed to process tax refund request' }, { status: 500 });
  }
});
