import { NextResponse } from 'next/server';
import { issueCode } from '@/lib/services/WithdrawalCodeService';
import { requireAuth, type AuthenticatedRequest } from '@/middleware/auth';
import { WITHDRAWAL_CODE_TYPES, type WithdrawalCodeType } from '@/lib/withdrawal-codes';

// POST /api/withdrawal/codes/[type]/issue
// Charges the per-user price for the given code, generates a 6-digit
// code, emails it to the user, and returns the code in the response.
export const POST = requireAuth(async (
  request: AuthenticatedRequest,
  context: { params: Promise<{ type: string }> }
) => {
  try {
    const { type } = await context.params;
    if (!WITHDRAWAL_CODE_TYPES.includes(type as WithdrawalCodeType)) {
      return NextResponse.json({ success: false, error: 'Invalid code type' }, { status: 400 });
    }
    if (type === 'TPIN') {
      return NextResponse.json({ success: false, error: 'TPIN does not use a paid code' }, { status: 400 });
    }
    const userId = request.user!.id;
    const body = await request.json();
    const draftId = String(body.draftId || '');
    if (!draftId) {
      return NextResponse.json({ success: false, error: 'draftId is required' }, { status: 400 });
    }
    const draft = await issueCode(userId, draftId, type as WithdrawalCodeType);
    return NextResponse.json({ success: true, data: draft });
  } catch (error) {
    console.error('Issue code error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to issue code' },
      { status: 400 }
    );
  }
});
