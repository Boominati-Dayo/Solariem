import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getDb } from '@/lib/mongodb';

export const POST = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const { userCode } = await request.json();
    const userId = request.user!.id;

    if (!userCode) {
      return NextResponse.json(
        { success: false, error: 'User code is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const notificationsCollection = db.collection('notifications');

    // Mark all notifications as read for this specific user
    const result = await notificationsCollection.updateMany(
      {
        $or: [
          { recipients: userId },
          { recipients: userCode },
          { recipients: 'all' }
        ],
        read: false
      },
      {
        $set: { read: true }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});



