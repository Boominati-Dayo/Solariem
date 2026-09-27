import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/middleware/auth';

/**
 * Admin-only.
 *
 * This endpoint previously authorised on a query-string parameter called
 * `adminCode`, which is a *referral code* — a value published to users as part
 * of a signup link, not a secret. It therefore granted no access control at all,
 * and it also bypassed the auth middleware's cookie check.
 *
 * Scoping now comes from the verified session instead, so a caller can only read
 * notifications addressed to their own account, broadcasts, and admin-only items.
 */
export const GET = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const adminId = request.user!.id;

    const notifications = await db
      .collection('notifications')
      .find({
        $or: [
          { recipients: 'all' },
          { recipients: adminId },
          { type: 'admin-only' },
          { type: 'broadcast' },
        ],
      })
      .sort({ sentAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const adminId = request.user!.id;
    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const result = await db.collection('notifications').updateOne(
      {
        _id: new ObjectId(notificationId),
        $or: [
          { recipients: 'all' },
          { recipients: adminId },
          { type: 'admin-only' },
          { type: 'broadcast' },
        ],
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
});
