import { NextResponse } from 'next/server';
import { getActiveDraft, preflight, createDraft, cancelDraft } from '@/lib/services/WithdrawalCodeService';
import { requireAuth, type AuthenticatedRequest } from '@/middleware/auth';

// GET /api/withdrawal/draft
// Returns the user's current active draft (if any) and the per-user
// preflight info (pricing, codeState shape, total max fees) so the
// client can render the multi-step wizard.
export const GET = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const userId = request.user!.id;
    const url = new URL(request.url);
    const amount = parseFloat(url.searchParams.get('amount') || '0');
    const currency = url.searchParams.get('currency') || 'USD';

    const draft = await getActiveDraft(userId);
    const pre = await preflight(userId, amount, currency);
    return NextResponse.json({
      success: true,
      data: {
        draft,
        preflight: pre
      }
    });
  } catch (error) {
    console.error('Withdrawal preflight error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Preflight failed' },
      { status: 500 }
    );
  }
});

// POST /api/withdrawal/draft
// Creates a new withdrawal draft. Validates the TPIN against the user
// record, verifies the amount, computes the per-code pricing for the
// requested amount (with server-side hard cap clamp), and returns the
// draft.
export const POST = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const userId = request.user!.id;
    const body = await request.json();
    const {
      amount,
      currency = 'USD',
      paymentMethodId,
      accountDetails,
      pin
    } = body || {};

    const draft = await createDraft({
      userId,
      amount: Number(amount),
      currency: String(currency),
      paymentMethodId: String(paymentMethodId),
      accountDetails: accountDetails || {},
      pin: String(pin || '')
    });

    return NextResponse.json({ success: true, data: draft });
  } catch (error) {
    console.error('Create draft error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create draft' },
      { status: 400 }
    );
  }
});

// DELETE /api/withdrawal/draft
// Cancels the current active draft and refunds all paid code fees.
export const DELETE = requireAuth(async (request: AuthenticatedRequest, context: any) => {
  try {
    const userId = request.user!.id;
    const url = new URL(request.url);
    const draftId = url.searchParams.get('id');
    if (!draftId) {
      return NextResponse.json({ success: false, error: 'draft id is required' }, { status: 400 });
    }
    await cancelDraft(userId, draftId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel draft error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to cancel draft' },
      { status: 500 }
    );
  }
});
