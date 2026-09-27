import { NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const GET = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const userCode = searchParams.get('userCode');
    const userId = request.user!.id;

    if (!userCode) {
      return NextResponse.json(
        { success: false, error: 'User code is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const notificationsCollection = db.collection('notifications');
    const usersCollection = db.collection('users');

    // Get user info to check if admin
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const isAdmin = user?.isAdmin || false;

    let query;
    if (isAdmin) {
      // Admins see all notifications including user activity, login/logout, etc.
      query = {
        $or: [
          { recipients: userId },
          { recipients: userCode },
          { recipients: 'all' },
          { type: { $in: ['login', 'logout', 'user_activity', 'deposit_request', 'withdrawal_request', 'support_sent'] } }
        ]
      };
    } else {
      // Regular users only see their own notifications
      query = {
        $or: [
          { recipients: userId },
          { recipients: userCode }
        ]
      };
    }

    // Fetch notifications and include all fields including attachments
    const notifications = await notificationsCollection.find(query)
      .sort({ sentAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const { notificationId, userCode } = await request.json();
    const userId = request.user!.id;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const notificationsCollection = db.collection('notifications');

    // Mark notification as read by adding userId and userCode to readBy array
    const result = await notificationsCollection.updateOne(
      { _id: new ObjectId(notificationId) },
      {
        $addToSet: {
          readBy: { userId, userCode: userCode || userId, readAt: new Date() }
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Also update the read status directly for backward compatibility
    await notificationsCollection.updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const { notificationId } = await request.json();
    const userId = request.user!.id;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const notificationsCollection = db.collection('notifications');

    // Delete the notification for this specific user
    const result = await notificationsCollection.deleteOne({
      _id: notificationId,
      recipients: userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});
