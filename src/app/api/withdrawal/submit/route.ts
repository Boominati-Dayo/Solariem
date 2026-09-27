import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { requireAuth, type AuthenticatedRequest } from '@/middleware/auth';
import { areAllRequiredCodesVerified } from '@/lib/WithdrawalDraft';
import { verifyTransactionPin } from '@/lib/auth/pin';
import { NotificationService } from '@/lib/notifications/NotificationService';
import { getCurrencySymbol } from '@/lib/currencies';

// POST /api/withdrawal/submit
// Finalises the draft into a real withdrawalRequest. The user must
// supply their TPIN (so the TPIN gate is verified here, not as a paid
// code). All required paid codes must already be verified.
export const POST = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const userId = request.user!.id;
    const body = await request.json();
    const draftId = String(body.draftId || '');
    const pin = String(body.pin || '');
    if (!draftId || !pin) {
      return NextResponse.json({ success: false, error: 'draftId and pin are required' }, { status: 400 });
    }

    const db = await getDb();
    const draft = await db.collection('withdrawalDrafts').findOne({ _id: new ObjectId(draftId), userId });
    if (!draft) return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    if (draft.status !== 'draft') return NextResponse.json({ success: false, error: 'Draft is no longer active' }, { status: 400 });
    if (new Date(draft.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'Draft has expired. Please start a new withdrawal.' }, { status: 400 });
    }

    // Block if the user already has a pending or processing withdrawal
    // request. They must wait for it to be approved/rejected before
    // starting a new one.
    const pendingWithdrawal = await db.collection('withdrawalRequests').findOne({
      userId,
      status: { $in: ['pending', 'processing'] }
    });
    if (pendingWithdrawal) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending withdrawal request. Please wait for it to be processed before starting a new one.' },
        { status: 400 }
      );
    }

    // Verify TPIN against user FIRST. TPIN verification is what marks
    // the TPIN slot as verified — it has to happen before the
    // "all required codes verified" gate check, otherwise that check
    // would always fail on TPIN.
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const pinOk = await verifyTransactionPin(pin, (user as { transactionPin?: string }).transactionPin);
    if (!pinOk) {
      return NextResponse.json({ success: false, error: 'Invalid transaction PIN' }, { status: 401 });
    }

    // Mark TPIN slot verified on the draft so the audit snapshot
    // reflects the user's actual submission state.
    if (draft.codeState?.TPIN && !draft.codeState.TPIN.verified) {
      await db.collection('withdrawalDrafts').updateOne(
        { _id: new ObjectId(draftId) },
        { $set: { 'codeState.TPIN.verified': true, 'codeState.TPIN.verifiedAt': new Date(), updatedAt: new Date() } }
      );
      draft.codeState.TPIN.verified = true;
    }

    // Now check all required codes (paid + verified for non-TPIN,
    // verified for TPIN — which we just set).
    if (!areAllRequiredCodesVerified(draft.codeState)) {
      return NextResponse.json({ success: false, error: 'All required security codes must be verified before submission.' }, { status: 400 });
    }

    // Insert the real withdrawal request. Snapshot the code state for
    // audit but drop the codes themselves (we don't want to store
    // issued codes long-term in the main withdrawals collection).
    const now = new Date();
    const codeStateAudit = Object.fromEntries(
      Object.entries(draft.codeState as Record<string, { required: boolean; price: number; paid: boolean; paidAt: Date | null | undefined; verified: boolean; verifiedAt: Date | null | undefined; refunded: boolean; refundedAt: Date | null | undefined; attempts: number }>).map(([k, v]) => [
        k,
        {
          required: v.required,
          price: v.price,
          paid: v.paid,
          paidAt: v.paidAt,
          verified: v.verified,
          verifiedAt: v.verifiedAt,
          refunded: v.refunded,
          refundedAt: v.refundedAt,
          attempts: v.attempts
        }
      ])
    ) as Record<string, unknown>;
    const newWithdrawal = {
      userId,
      paymentMethodId: draft.paymentMethodId,
      amount: draft.amount,
      currency: draft.currency,
      accountDetails: draft.accountDetails,
      status: 'pending' as const,
      codeState: codeStateAudit,
      totalCodeFees: draft.totalFeesPaid,
      draftId: draftId.toString(),
      createdAt: now,
      updatedAt: now
    };
    const result = await db.collection('withdrawalRequests').insertOne(newWithdrawal);
    await db.collection('withdrawalDrafts').updateOne(
      { _id: new ObjectId(draftId) },
      { $set: { status: 'converted', convertedWithdrawalId: result.insertedId.toString(), updatedAt: now } }
    );

    // Notify admins
    let paymentMethodName = 'Bank Transfer';
    if (draft.paymentMethodId) {
      try {
        const pm = await db.collection('paymentMethods').findOne({ _id: new ObjectId(draft.paymentMethodId) });
        if (pm?.name) paymentMethodName = pm.name;
      } catch { /* ignore */ }
    }
    await NotificationService.notifyWithdrawalRequest(
      userId,
      (user as { email?: string }).email || 'Unknown User',
      draft.amount,
      result.insertedId.toString(),
      paymentMethodName,
      draft.currency
    );

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: { withdrawalId: result.insertedId.toString() }
    });
  } catch (error) {
    console.error('Submit withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit withdrawal' },
      { status: 500 }
    );
  }
});
