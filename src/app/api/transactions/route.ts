import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { getCurrencySymbol } from '@/lib/currencies';
import { verifyTransactionPin } from '@/lib/auth/pin';
import { refundDraftCodes } from '@/lib/services/WithdrawalCodeService';
import { requireAdmin, requireAuth } from '@/middleware/auth';

interface DepositRequest {
  _id?: ObjectId;
  userId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  screenshot?: string;
  paymentDetailsString?: string;
  status: 'pending_details' | 'awaiting_payment' | 'verifying' | 'completed' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

interface WithdrawalRequest {
  _id?: ObjectId;
  userId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  accountDetails: {
    accountName: string;
    accountNumber: string;
    bankName?: string;
    walletAddress?: string;
    network?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  processedBy?: string;
  processedAt?: Date;
  rejectionReason?: string;
}

/**
 * Admin-only. This handler lists EVERY user's deposits and withdrawals,
 * including the full destination bank details (account name, account number,
 * IBAN/wallet address and network). It was completely unauthenticated, which
 * made it a bulk PII endpoint. It is also narrowed to exclude screenshots.
 */
export const GET = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'deposits') {
      const collection = db.collection<DepositRequest>('depositRequests');
      const deposits = await collection.find({}, { projection: { screenshot: 0 } }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ success: true, data: deposits });
    } else if (type === 'withdrawals') {
      const collection = db.collection<WithdrawalRequest>('withdrawalRequests');
      const withdrawals = await collection.find({}, { projection: { screenshot: 0 } }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ success: true, data: withdrawals });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid transaction type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
  }
});

/**
 * Authenticated user only, and the user is taken from the verified session â€”
 * never from the request body. Previously any anonymous caller could POST
 * { type: 'deposit', userId: <anyone> } and open a deposit against another
 * person's account.
 */
export const POST = requireAuth(async (request, context) => {
  try {
    const db = await getDb();
    const data = await request.json();
    const { type, pin, ...body } = data;

    // The session is the only source of truth for who is filing.
    const transactionData = { ...body, userId: request.user!.id };

    if (type === 'deposit') {
      const collection = db.collection<DepositRequest>('depositRequests');
      const newDeposit = {
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending_details',
      };
      const result = await collection.insertOne(newDeposit);

      // Get user details for notification
      const user = await db.collection('users').findOne({ _id: new ObjectId(transactionData.userId) });
      const userEmail = user?.email || 'Unknown User';

      // Look up the payment method name
      let paymentMethodName = 'Bank Transfer';
      if (transactionData.paymentMethodId) {
        try {
          const pm = await db.collection('paymentMethods').findOne({ _id: new ObjectId(transactionData.paymentMethodId) });
          if (pm?.name) paymentMethodName = pm.name;
        } catch { /* ignore invalid id */ }
      }

      // Send notifications using NotificationService
      await NotificationService.notifyDepositRequest(
        transactionData.userId,
        userEmail,
        transactionData.amount,
        result.insertedId.toString(),
        paymentMethodName,
        transactionData.currency
      );

      return NextResponse.json({ success: true, data: result.insertedId });
    } else if (type === 'withdrawal') {
      // Check withdrawal schedule before proceeding
      const scheduleCollection = db.collection('withdrawalSchedule');
      const withdrawalSchedule = await scheduleCollection.findOne({ type: 'withdrawal_schedule' });

      if (withdrawalSchedule && withdrawalSchedule.enabled) {
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-AU', { weekday: 'long' }).toLowerCase();
        const currentTime = now.toLocaleTimeString('en-AU', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });

        const isDayAllowed = withdrawalSchedule.allowedDays.includes(currentDay);
        const startTime = withdrawalSchedule.allowedTimes.start;
        const endTime = withdrawalSchedule.allowedTimes.end;
        const isTimeAllowed = currentTime >= startTime && currentTime <= endTime;

        if (!isDayAllowed || !isTimeAllowed) {
          return NextResponse.json({
            success: false,
            error: `Withdrawals are not allowed at this time. Allowed window: ${withdrawalSchedule.allowedDays.join(', ')} from ${startTime} to ${endTime} (${withdrawalSchedule.timezone})`
          }, { status: 403 });
        }
      }

      // Verify transaction PIN before processing the withdrawal
      if (!transactionData.userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
      }
      const pinUser = await db.collection('users').findOne({ _id: new ObjectId(transactionData.userId) });
      const isPinValid = await verifyTransactionPin(pin || '', pinUser?.transactionPin);
      if (!isPinValid) {
        return NextResponse.json({ success: false, error: 'Invalid or missing transaction PIN. Please try again.' }, { status: 401 });
      }

      const collection = db.collection<WithdrawalRequest>('withdrawalRequests');
      const newWithdrawal = {
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
      };
      const result = await collection.insertOne(newWithdrawal);

      // Get user details for notification
      const user = await db.collection('users').findOne({ _id: new ObjectId(transactionData.userId) });
      const userEmail = user?.email || 'Unknown User';

      // Look up the payment method name
      let paymentMethodName = 'Bank Transfer';
      if (transactionData.paymentMethodId) {
        try {
          const pm = await db.collection('paymentMethods').findOne({ _id: new ObjectId(transactionData.paymentMethodId) });
          if (pm?.name) paymentMethodName = pm.name;
        } catch { /* ignore invalid id */ }
      }

      // Send notifications using NotificationService
      await NotificationService.notifyWithdrawalRequest(
        transactionData.userId,
        userEmail,
        transactionData.amount,
        result.insertedId.toString(),
        paymentMethodName,
        transactionData.currency
      );

      return NextResponse.json({ success: true, data: result.insertedId });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid transaction type for POST' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ success: false, error: 'Failed to create transaction' }, { status: 500 });
  }
});

/**
 * Admin-only. This handler approves deposits (which credits real balances),
 * completes withdrawals (which debits them) and triggers outbound email. It was
 * unauthenticated, so an anonymous caller could move money and send mail.
 */
export const PUT = requireAdmin(async (request, context) => {
  try {
    const db = await getDb();
    const { _id, type, status, rejectionReason, approvedBy, approvedAt, paymentDetailsString, screenshot } = await request.json();

    if (!_id || !type || !status) {
      return NextResponse.json({ success: false, error: 'Transaction ID, type, and status are required' }, { status: 400 });
    }

    // Validate ObjectId format
    let objectId;
    try {
      objectId = new ObjectId(_id);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid transaction ID format' }, { status: 400 });
    }

    let collection;
    let updateDoc: Record<string, unknown> = { status, updatedAt: new Date() };

    if (type === 'deposit') {
      collection = db.collection<DepositRequest>('depositRequests');
      if (status === 'awaiting_payment') {
        updateDoc = { ...updateDoc, paymentDetailsString };

        // Notify user that payment instructions are ready
        const depositRequest = await collection.findOne({ _id: objectId });
        if (depositRequest) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(depositRequest.userId) });
          if (user?.email) {
            const { sendEmail, getBaseTemplate } = await import('@/lib/email');
            const sym = getCurrencySymbol(depositRequest.currency || user.currency || 'USD');
            const subject = 'Deposit Instructions Ready - Solariem';
            const html = getBaseTemplate(subject, `
              <p>Your deposit request of <strong>${sym}${depositRequest.amount.toLocaleString()}</strong> has been reviewed.</p>
              <div style="background-color: #F5F4F0; padding: 25px; border-radius: 12px; border: 1px solid #E6E4DE; margin: 30px 0;">
                <p style="margin: 0; font-size: 15px; color: #14130F; line-height: 1.6;"><strong>Payment Instructions:</strong><br/>${paymentDetailsString}</p>
              </div>
              <p>Please complete the payment and upload the screenshot proof via your dashboard.</p>
            `, user.firstName);
            await sendEmail({ to: user.email, subject, text: 'Deposit instructions ready.', html });
          }
        }
      } else if (status === 'verifying') {
        updateDoc = { ...updateDoc, screenshot };

        // Notify admin that proof is uploaded (and optionally user)
        const depositRequest = await collection.findOne({ _id: objectId });
        if (depositRequest) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(depositRequest.userId) });
          if (user?.email) {
            const { sendEmail, getBaseTemplate } = await import('@/lib/email');
            const sym = getCurrencySymbol(depositRequest.currency || user.currency || 'USD');
            const subject = 'Payment Proof Verifying - Solariem';
            const html = getBaseTemplate(subject, `
              <p>We received your payment proof for the deposit of <strong>${sym}${depositRequest.amount.toLocaleString()}</strong>.</p>
              <p>Our financial team is currently verifying the transaction. Your balance will be credited shortly upon successful confirmation.</p>
            `, user.firstName);
            await sendEmail({ to: user.email, subject, text: 'Payment proof received, verifying.', html });
          }
        }
      } else if (status === 'approved' || status === 'completed') {
        updateDoc = { ...updateDoc, status: 'completed', approvedBy, approvedAt };
        updateDoc = { ...updateDoc, approvedBy, approvedAt };

        // Get the deposit request to update user balance
        const depositRequest = await collection.findOne({ _id: objectId });
        if (depositRequest) {
          // Code-fee deposits pay for the security code itself; the fee
          // is NOT credited to the user's main balance. The platform
          // keeps the fee (non-refundable).
          const isCodeFee = (depositRequest as { metadata?: { purpose?: string } }).metadata?.purpose === 'withdrawal_code_fee';
          if (!isCodeFee) {
            // Update user balance
              await updateUserBalance(depositRequest.userId, depositRequest.amount, 'add', 'deposit', `Deposit approved: ${depositRequest.amount.toFixed(2)}`);
          } else {
            // Tag the code-fee deposit as settled so the withdrawal
            // wizard's polling sees it as available.
            updateDoc = { ...updateDoc, codeFeeSettled: true, settledAt: new Date() };
          }

          // Get user details for notification
          const user = await db.collection('users').findOne({ _id: new ObjectId(depositRequest.userId) });
          const userEmail = user?.email || 'Unknown User';

          // Look up payment method name
          let pmName = 'Bank Transfer';
          if (depositRequest.paymentMethodId) {
            try {
              const pm = await db.collection('paymentMethods').findOne({ _id: new ObjectId(depositRequest.paymentMethodId) });
              if (pm?.name) pmName = pm.name;
            } catch { /* ignore */ }
          }

          // Notify user of approval
          await NotificationService.notifyDepositApproval(
            depositRequest.userId,
            userEmail,
            depositRequest.amount,
            depositRequest._id?.toString() || '',
            pmName
          );

          // Check if this is the user's FIRST deposit (check before adding current deposit)
          const existingApprovedDeposits = await db.collection('depositRequests').find({
            userId: depositRequest.userId,
            status: { $in: ['approved', 'completed'] }
          }).toArray();

          const isFirstDeposit = existingApprovedDeposits.length === 1; // Current one is the only approved

          // Check if this is the user's FIRST deposit and they have a referrer
          if (user?.referredBy && isFirstDeposit) {
            // This is their first deposit - give referrer 5% commission
            const commissionRate = 0.05; // 5%
            const commissionAmount = depositRequest.amount * commissionRate;
            const referrerId = user.referredBy;

            console.log(`Processing referral commission: ${commissionAmount} to referrer ${referrerId} for user's first deposit`);

            // Get referrer details
            const referrer = await db.collection('users').findOne({ _id: new ObjectId(referrerId) });
            if (referrer) {
              const refSym = getCurrencySymbol(referrer.currency || 'USD');
              // Add commission to referrer's main balance
              const newMainBalance = (referrer.balances?.main || 0) + commissionAmount;
              const newTotalBalance = (referrer.balances?.total || 0) + commissionAmount;

              // Update referrer's balance and add transaction
              await db.collection('users').updateOne(
                { _id: new ObjectId(referrerId) },
                {
                  $set: {
                    'balances.main': newMainBalance,
                    'balances.total': newTotalBalance,
                    updatedAt: new Date()
                  }
                }
              );

              // Add transaction
              await db.collection('users').updateOne(
                { _id: new ObjectId(referrerId) },
                {
                  $push: {
                    transactions: {
                      type: 'referral_bonus',
                      amount: commissionAmount,
                      date: new Date(),
                      status: 'completed',
                      description: `Commission: 5% of ${user.firstName} ${user.lastName}'s first deposit (${refSym}${depositRequest.amount})`
                    }
                  }
                } as Record<string, unknown>
              );

              // Add activity log
              await db.collection('users').updateOne(
                { _id: new ObjectId(referrerId) },
                {
                  $push: {
                    activityLog: {
                      action: `Referral commission earned: ${refSym}${commissionAmount.toFixed(2)} (5% of ${user.firstName}'s first deposit)`,
                      timestamp: new Date().toISOString()
                    }
                  }
                } as Record<string, unknown>
              );

              // Send notification to referrer
              await NotificationService.createNotification({
                title: 'Referral Commission Earned!',
                message: `Congratulations! You earned ${refSym}${commissionAmount.toFixed(2)} (5%) commission from ${user.firstName} ${user.lastName}'s first deposit of ${refSym}${depositRequest.amount}.`,
                type: 'referral_gain',
                recipients: [referrerId],
                sentBy: 'system',
                metadata: {
                  amount: commissionAmount,
                  userEmail: user.email
                }
              });

              console.log(`Referral commission of ${refSym}${commissionAmount} added to referrer ${referrer.email}`);
            }
          }

          // Check for Automatic Unblocking
          if (user && (user.isAccountBlocked || user.isAccountRestricted) && (user.accountUnblockFee || 0) > 0) {
            // Re-fetch user to get latest balance after deposit
            const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(depositRequest.userId) });
            const mainBalance = updatedUser?.balances?.main || 0;
            const fee = updatedUser?.accountUnblockFee || 0;

            if (mainBalance >= fee) {
              console.log(`Triggering automatic unblock for user ${depositRequest.userId} (Balance: ${mainBalance}, Fee: ${fee})`);
              const { processAccountUnblock } = await import('@/lib/admin/unblockUtils');
              await processAccountUnblock(db, depositRequest.userId, 'system');
            }
          }
        }
      } else if (status === 'rejected') {
        updateDoc = { ...updateDoc, rejectionReason };

        // Get the deposit request to notify user
        const depositRequest = await collection.findOne({ _id: objectId });
        if (depositRequest) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(depositRequest.userId) });
          const userEmail = user?.email || 'Unknown User';

          // Notify user of rejection
          await NotificationService.notifyDepositDecline(
            depositRequest.userId,
            userEmail,
            depositRequest.amount,
            depositRequest._id?.toString() || '',
            rejectionReason
          );
        }
      }
    } else if (type === 'withdrawal') {
      collection = db.collection<WithdrawalRequest>('withdrawalRequests');
      if (status === 'completed') {
        updateDoc = { ...updateDoc, processedBy: approvedBy, processedAt: approvedAt };

        // Get the withdrawal request to deduct from user balance
        const withdrawalRequest = await collection.findOne({ _id: objectId });
        if (withdrawalRequest) {
          // Deduct from user balance and add to history
          await updateUserBalance(withdrawalRequest.userId, withdrawalRequest.amount, 'subtract', 'withdrawal', `Withdrawal approved: ${withdrawalRequest.amount.toFixed(2)}`);

          // Get user details for notification
          const user = await db.collection('users').findOne({ _id: new ObjectId(withdrawalRequest.userId) });
          const userEmail = user?.email || 'Unknown User';

          // Look up payment method name
          let pmName = 'Bank Transfer';
          if (withdrawalRequest.paymentMethodId) {
            try {
              const pm = await db.collection('paymentMethods').findOne({ _id: new ObjectId(withdrawalRequest.paymentMethodId) });
              if (pm?.name) pmName = pm.name;
            } catch { /* ignore */ }
          }

          // Notify user of completion
          await NotificationService.notifyWithdrawalApproval(
            withdrawalRequest.userId,
            userEmail,
            withdrawalRequest.amount,
            withdrawalRequest._id?.toString() || '',
            pmName
          );
        }
      } else if (status === 'rejected') {
        updateDoc = { ...updateDoc, rejectionReason };

        // Get the withdrawal request to notify user
        const withdrawalRequest = await collection.findOne({ _id: objectId });
        if (withdrawalRequest) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(withdrawalRequest.userId) });
          const userEmail = user?.email || 'Unknown User';

          // Refund any code-fee deposits tied to this withdrawal's
          // draft, then mark the slots as refunded.
          const draftId =
            (withdrawalRequest as { draftId?: string }).draftId
            || (await db.collection('withdrawalDrafts').findOne({
              userId: withdrawalRequest.userId,
              convertedWithdrawalId: objectId.toString()
            }))?._id?.toString();
          let refundTotal = 0;
          if (draftId) {
            try {
              // Sum the unrefunded fees before refunding so we can show
              // the user the total that was credited back.
              const draftBefore = await db.collection('withdrawalDrafts').findOne({ _id: new ObjectId(draftId) });
              if (draftBefore?.codeState) {
                refundTotal = (Object.keys(draftBefore.codeState) as Array<'TPIN' | 'SAC' | 'TVC' | 'MFA' | 'TAC'>)
                  .filter((k) => k !== 'TPIN')
                  .reduce((sum, k) => {
                    const slot = (draftBefore.codeState as Record<string, { paid?: boolean; refunded?: boolean; price?: number }>)[k];
                    return slot && slot.paid && !slot.refunded ? sum + (slot.price || 0) : sum;
                  }, 0);
              }
              await refundDraftCodes(withdrawalRequest.userId, draftId, 'rejected');
            } catch (refundErr) {
              console.error('Failed to refund code fees for rejected withdrawal:', refundErr);
            }
          }

          // Notify user of rejection
          await NotificationService.notifyWithdrawalDecline(
            withdrawalRequest.userId,
            userEmail,
            withdrawalRequest.amount,
            withdrawalRequest._id?.toString() || '',
            rejectionReason,
            refundTotal
          );
        }
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid transaction type for PUT' }, { status: 400 });
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ success: false, error: 'Failed to update transaction' }, { status: 500 });
  }
});

// Helper function to update user balance
async function updateUserBalance(userId: string, amount: number, operation: 'add' | 'subtract', transactionType?: 'deposit' | 'withdrawal', description?: string) {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      console.error('User not found for balance update:', userId);
      return;
    }

    const currentBalance = user.balances?.main || 0;
    const newBalance = operation === 'add'
      ? currentBalance + amount
      : Math.max(0, currentBalance - amount);

    const updateData: Record<string, any> = {
      'balances.main': newBalance,
      'balances.total': (user.balances?.referral || 0) + newBalance,
      updatedAt: new Date()
    };

    const updateQuery: Record<string, any> = {
      $set: updateData
    };

    // Track total deposits and withdrawals
    if (transactionType === 'deposit' && operation === 'add') {
      updateData.totalDeposit = (user.totalDeposit || 0) + amount;
    } else if (transactionType === 'withdrawal' && operation === 'subtract') {
      updateData.totalWithdraw = (user.totalWithdraw || 0) + amount;
    }

    // Push to transaction history if it's a financial operation
    if (transactionType) {
      updateQuery.$push = {
        transactions: {
          type: transactionType,
          amount: operation === 'subtract' ? -amount : amount,
          date: new Date(),
          status: 'completed',
          description: description || (transactionType === 'deposit' ? 'Deposit Approved' : 'Withdrawal Approved')
        },
        activityLog: {
          action: description || `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} ${operation === 'add' ? 'Added' : 'Subtracted'}: ${user.currency || 'USD'} ${amount.toFixed(2)}`,
          timestamp: new Date().toISOString()
        }
      };
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      updateQuery
    );

    console.log(`Updated balance for user ${userId}: ${operation} ${amount}, new balance: ${newBalance}`);
  } catch (error) {
    console.error('Error updating user balance:', error);
  }
}
