import { NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const POST = requireAdmin(async (request, context) => {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');
    
    // Get user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Get all approved deposits for this user
    const depositRequests = await db.collection('depositRequests').find({
      userId: userId,
      status: 'approved'
    }).toArray();

    // Get all completed withdrawals for this user
    const withdrawalRequests = await db.collection('withdrawalRequests').find({
      userId: userId,
      status: 'completed'
    }).toArray();

    // Calculate correct balances
    const totalDeposits = depositRequests.reduce((sum, deposit) => sum + deposit.amount, 0);
    const totalWithdrawals = withdrawalRequests.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
    
    // Calculate referral earnings from activity log
    let referralEarnings = 0;
    if (user.activityLog) {
      user.activityLog.forEach((activity: { action: string }) => {
        if (activity.action.includes('Referral bonus')) {
          const match = activity.action.match(/\$(\d+)/);
          if (match) {
            referralEarnings += parseFloat(match[1]);
          }
        }
      });
    }

    // Calculate daily gains from transactions
    let totalDailyGains = 0;
    if (user.transactions) {
      user.transactions.forEach((transaction: { type: string; amount: number }) => {
        if (transaction.type === 'daily_gain') {
          totalDailyGains += transaction.amount;
        }
      });
    }

    // Calculate correct balances
    const mainBalance = totalDeposits - totalWithdrawals + totalDailyGains;
    const referralBalance = referralEarnings;
    const totalBalance = mainBalance + referralBalance;

    // Update user with correct balances
    const updateData = {
      'balances.main': mainBalance,
      'balances.referral': referralBalance,
      'balances.total': totalBalance,
      totalDeposit: totalDeposits,
      totalWithdraw: totalWithdrawals,
      referralEarnings: referralEarnings,
      updatedAt: new Date()
    };

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: 'Balances recalculated and updated',
      data: {
        userId,
        balances: {
          main: mainBalance,
          referral: referralBalance,
          total: totalBalance
        },
        totalDeposits,
        totalWithdrawals,
        referralEarnings
      }
    });

  } catch (error) {
    console.error('Error fixing balances:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
});
