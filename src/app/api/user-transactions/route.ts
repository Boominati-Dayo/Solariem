import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request, context) => {
  try {
    const userId = request.user!.id;
    const db = await getDb();

    // Fetch all transaction types for the user
    const [deposits, withdrawals, transfers, cards, loans, taxRefunds, recoveryCases] = await Promise.all([
      // Deposit requests
      db.collection('depositRequests').find({ userId }, { projection: { screenshot: 0 } }).sort({ createdAt: -1 }).limit(100).toArray(),

      // Withdrawal requests
      db.collection('withdrawalRequests').find({ userId }, { projection: { screenshot: 0 } }).sort({ createdAt: -1 }).limit(100).toArray(),

      // Money transfers
      db.collection('transfers').find({
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }).sort({ createdAt: -1 }).limit(100).toArray(),

      // Virtual Cards
      db.collection('virtualCards').find({ userId }).sort({ createdAt: -1 }).limit(100).toArray(),

      // Loans
      db.collection('loans').find({ userId }).sort({ createdAt: -1 }).limit(100).toArray(),

      // Tax Refunds
      db.collection('taxRefunds').find({ userId }).sort({ createdAt: -1 }).limit(100).toArray(),

      // Recovery Cases (using raw db for consistency)
      db.collection('recoverycases').find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).limit(100).toArray()
    ]);

    // Fetch payment methods to resolve IDs to names
    const paymentMethods = await db.collection('paymentMethods').find({}).toArray();
    const paymentMethodMap = paymentMethods.reduce((acc, pm) => ({
      ...acc,
      [pm._id.toString()]: pm.name
    }), {} as Record<string, string>);

    // Transform deposits
    const depositTransactions = deposits.map(deposit => {
      const methodName = paymentMethodMap[deposit.paymentMethodId] || 'Bank Transfer';
      return {
        id: deposit._id.toString(),
        type: 'deposit',
        date: deposit.createdAt,
        amount: deposit.amount,
        currency: 'USD',
        status: deposit.status === 'approved' ? 'completed' : deposit.status === 'rejected' ? 'failed' : 'pending',
        details: `Deposit via ${methodName}`,
        method: methodName,
        transactionId: deposit._id.toString()
      };
    });

    // Transform withdrawals
    const withdrawalTransactions = withdrawals.map(withdrawal => ({
      id: withdrawal._id.toString(),
      type: 'withdrawal',
      date: withdrawal.createdAt,
      amount: withdrawal.amount,
      currency: 'USD',
      status: withdrawal.status === 'completed' ? 'completed' : withdrawal.status === 'rejected' ? 'failed' : 'pending',
      details: `Withdrawal to ${withdrawal.accountDetails?.accountName || 'Account'}`,
      method: withdrawal.accountDetails?.bankName || 'Bank Transfer',
      transactionId: withdrawal._id.toString()
    }));

    // Transform transfers
    const transferTransactions = transfers.map(transfer => ({
      id: transfer._id.toString(),
      type: 'transfer',
      date: transfer.createdAt,
      amount: transfer.amount,
      currency: 'USD',
      status: transfer.status === 'completed' ? 'completed' : transfer.status === 'failed' ? 'failed' : 'pending',
      details: transfer.senderId === userId 
        ? `Transfer to ${transfer.receiverEmail}`
        : `Transfer from ${transfer.senderEmail}`,
      sender: transfer.senderEmail,
      receiver: transfer.receiverEmail,
      fee: transfer.fee || 0,
      transactionId: transfer._id.toString(),
      isSent: transfer.senderId === userId
    }));

    // Transform cards
    const cardTransactions = cards.map(card => ({
      id: card._id.toString(),
      type: 'card',
      date: card.createdAt,
      amount: card.fee || 0,
      currency: card.currency || 'USD',
      status: card.status === 'approved' ? 'completed' : card.status === 'rejected' ? 'failed' : 'pending',
      details: `Virtual Card Issuance (${card.cardLevel?.toUpperCase()})`,
      cardType: card.cardType,
      transactionId: card._id.toString()
    }));

    // Transform loans
    const loanTransactions = loans.map(loan => ({
      id: loan._id.toString(),
      type: 'loan',
      date: loan.createdAt,
      amount: loan.amount,
      currency: 'USD',
      status: loan.status === 'approved' ? 'completed' : loan.status === 'rejected' ? 'failed' : 'pending',
      details: `${loan.facility} Loan Application`,
      purpose: loan.purpose,
      transactionId: loan._id.toString()
    }));

    // Transform tax refunds
    const taxTransactions = taxRefunds.map(tax => ({
      id: tax._id.toString(),
      type: 'tax_refund',
      date: tax.createdAt,
      amount: 0, // Tax refunds don't have a fixed amount at start
      currency: 'USD',
      status: tax.status === 'approved' ? 'completed' : tax.status === 'rejected' ? 'failed' : 'pending',
      details: `Tax Rebate Claim`,
      transactionId: tax._id.toString()
    }));

    // Transform recovery cases
    const recoveryTransactions = recoveryCases.map(rc => ({
      id: rc._id.toString(),
      type: 'recovery',
      date: rc.createdAt,
      amount: rc.amountLost,
      currency: rc.currency || 'USD',
      status: rc.status === 'completed' ? 'completed' : rc.status === 'rejected' ? 'failed' : 'pending',
      details: `Legal Asset Recovery (${rc.scamType})`,
      platform: rc.platformName,
      transactionId: rc._id.toString()
    }));

    // Get user's transaction history from user document
    const userDoc = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { transactions: 1 } }
    );
    const userTransactions = userDoc?.transactions || [];

    // Transform user transactions (daily gains, referral bonuses, transfers, etc.)
    const userTransactionLogs = userTransactions.map((transaction: Record<string, unknown>, index: number) => {
      const isTransfer = transaction.type === 'transfer_sent' || transaction.type === 'transfer_received';
      const isSent = transaction.type === 'transfer_sent';
      
      // Determine transaction type and details
      let txType = 'other';
      let details = transaction.description || 'Transaction';
      
      if (transaction.type === 'daily_gain') {
        txType = 'earning';
        details = transaction.description || 'Account credit';
      } else if (transaction.type === 'referral_bonus') {
        txType = 'earning';
        details = `Referral bonus from user ${transaction.referredUserCode || 'Unknown'}`;
      } else if (transaction.type === 'fee' || transaction.type === 'unblock_fee' || transaction.type === 'recovery_fee') {
        txType = 'recovery'; // Use recovery type for positive sign in UI
        details = transaction.description || 'Protocol Fee';
        // Ensure amount is positive for these types
        if (typeof transaction.amount === 'number') {
          transaction.amount = Math.abs(transaction.amount);
        }
      } else if (transaction.type === 'refund') {
        txType = 'deposit'; // Show as deposit to get positive sign
        details = transaction.description || 'Refund';
      } else if (transaction.type === 'manual_adjustment') {
        txType = transaction.action === 'add' ? 'deposit' : 'other';
        details = transaction.description || 'Account Adjustment';
      } else if (isTransfer) {
        txType = 'transfer';
        details = transaction.description || 'Transfer';
      }
      
      return {
        id: `${userId}_${index}`,
        type: txType,
        date: transaction.date || new Date(),
        amount: transaction.amount,
        currency: 'USD',
        status: 'completed',
        details: details,
        transactionId: `${userId}_${index}`,
        isSent: isSent,
        metadata: transaction.metadata || {}
      };
    });

    // Combine all transactions
    const allTransactions = [
      ...depositTransactions,
      ...withdrawalTransactions,
      ...transferTransactions,
      ...cardTransactions,
      ...loanTransactions,
      ...taxTransactions,
      ...recoveryTransactions,
      ...userTransactionLogs
    ];

    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      data: allTransactions
    });

  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions'
    }, { status: 500 });
  }
});


