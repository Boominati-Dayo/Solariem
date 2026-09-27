import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/middleware/auth';
import { NotificationService } from '@/lib/notifications/NotificationService';

/**
 * Admin-only. This route moves real balances, so it must never be reachable
 * without a verified admin session. It used to export a bare `POST` with no
 * authorisation at all, which meant any unauthenticated caller who could reach
 * the host could credit themselves an arbitrary amount by posting { userId, amount }.
 */
export const POST = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const data = await request.json();
    const { userId, amount, action, reason, adminId } = data;

    if (!userId || !amount || !action || !reason) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const userObjectId = new ObjectId(userId);
    const user = await db.collection('users').findOne({ _id: userObjectId });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Default to the spendable balance; referral credit is not adjusted here.
    const balanceType = 'main';

    // Calculate new balance
    const currentBalance = user.balances?.[balanceType] || 0;
    const adjustedAmount = action === 'add' ? Number(amount) : -Number(amount);
    const newSpecificBalance = Math.max(0, currentBalance + adjustedAmount);
    
    // Update main total as well
    const diff = newSpecificBalance - currentBalance;
    const currentTotal = user.balances?.total || 0;
    const newTotalBalance = currentTotal + diff;

    // Update User Document
    const updateResult = await db.collection('users').updateOne(
      { _id: userObjectId },
      {
        $set: {
          [`balances.${balanceType}`]: newSpecificBalance,
          'balances.total': newTotalBalance,
          updatedAt: new Date()
        },
        $push: {
          transactions: {
            type: 'manual_adjustment',
            amount: Math.abs(adjustedAmount),
            action: action, // add or subtract
            date: new Date(),
            status: 'completed',
            description: reason,
            adjustedBy: adminId || 'admin'
          },
          activityLog: {
            action: `Manual balance adjustment: ${action} ${user.currency || 'USD'} ${Math.abs(adjustedAmount)}. Reason: ${reason}`,
            timestamp: new Date().toISOString()
          }
        } as any
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ success: false, error: 'Failed to update balance' }, { status: 500 });
    }

    // Send Notification
    await NotificationService.createNotification({
      title: 'Account Balance Adjusted',
      message: `Your ${balanceType} balance has been ${action === 'add' ? 'credited' : 'debited'} with ${user.currency || 'USD'} ${Math.abs(adjustedAmount).toLocaleString()}. Reason: ${reason}`,
      type: action === 'add' ? 'deposit_approval' : 'withdrawal_decline',
      recipients: [userId],
      sentBy: 'system',
      metadata: {
        amount: Math.abs(adjustedAmount),
        balanceType,
        action,
        reason
      }
    });

    return NextResponse.json({ success: true, message: 'Balance adjusted successfully' });
  } catch (error) {
    console.error('Error in balance adjustment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
