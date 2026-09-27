// Per-user withdrawal draft that holds the in-progress multi-step flow:
// the user's chosen amount + account details + per-code payment/issue/
// verify state. When all required codes are verified and the user
// submits, the draft is converted into a normal withdrawalRequest.

import type { ObjectId } from 'mongodb';
import type { WithdrawalCodeType, UserCodePricing, CodePricing } from './withdrawal-codes';

export interface CodeSlotState {
  required: boolean;
  price: number; // final price after server-side cap clamp
  paid: boolean;
  paidAt?: Date | null;
  // Issued code (server-generated, emailed + returned to the client).
  // Stored in plain text on the draft so the verify endpoint can match
  // without re-issuing. The draft is server-side and never exposed to
  // other users.
  code?: string | null;
  issuedAt?: Date | null;
  // The user must enter the issued code to clear the gate. Tracked so
  // we can require a fresh entry on every code and audit the attempts.
  verified: boolean;
  verifiedAt?: Date | null;
  attempts: number;
  // Refunded if the withdrawal is rejected.
  refunded: boolean;
  refundedAt?: Date | null;
}

export type WithdrawalCodeState = Record<WithdrawalCodeType, CodeSlotState>;

export interface WithdrawalDraft {
  _id?: ObjectId | string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  accountDetails: {
    accountName: string;
    accountNumber: string;
    bankName?: string;
    walletAddress?: string;
    network?: string;
  };
  pricingSnapshot: UserCodePricing; // snapshot of user's pricing at draft time so admin changes mid-flow don't change the bill
  codeState: WithdrawalCodeState;
  // Cumulative fees paid so far across all codes (sum of paid prices).
  totalFeesPaid: number;
  // 0 = pre-submission, but we still store the status
  status: 'draft' | 'submitted' | 'rejected' | 'expired' | 'converted';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // drafts expire after 30 minutes
  submittedAt?: Date | null;
  // Set when the draft is converted into a withdrawalRequest
  convertedWithdrawalId?: string | null;
}

export const DRAFT_TTL_MINUTES = 30;
export const MAX_CODE_ATTEMPTS = 5;

export function clampPricing(pricing: UserCodePricing): UserCodePricing {
  const out: UserCodePricing = { ...pricing };
  (Object.keys(out) as WithdrawalCodeType[]).forEach((key) => {
    if (out[key].price < 0) out[key] = { ...out[key], price: 0 };
  });
  return out;
}

export function buildInitialCodeState(pricing: UserCodePricing, withdrawalAmount: number): WithdrawalCodeState {
  const clamped = clampPricing(pricing);
  const state: Partial<WithdrawalCodeState> = {};
  (Object.keys(clamped) as WithdrawalCodeType[]).forEach((key) => {
    const cfg: CodePricing = clamped[key];
    // TPIN is always required (free, no fee, no code issuance).
    if (key === 'TPIN') {
      state.TPIN = {
        required: true,
        price: 0,
        paid: true, // TPIN is collected separately at submit time, not as a paid gate
        paidAt: null,
        code: null,
        issuedAt: null,
        verified: false,
        verifiedAt: null,
        attempts: 0,
        refunded: false,
        refundedAt: null
      };
      return;
    }
    // For all other codes: enabled means the gate applies, regardless
    // of price. A free enabled code just means the user must enter a
    // code without paying for it. The admin can mix-and-match freely.
    state[key] = {
      required: cfg.enabled,
      price: cfg.price,
      paid: cfg.price === 0, // free codes don't need a payment step
      paidAt: cfg.price === 0 ? new Date() : null,
      code: null,
      issuedAt: null,
      verified: false,
      verifiedAt: null,
      attempts: 0,
      refunded: false,
      refundedAt: null
    };
  });
  return state as WithdrawalCodeState;
}

export function areAllRequiredCodesVerified(state: WithdrawalCodeState): boolean {
  return (Object.keys(state) as WithdrawalCodeType[]).every((key) => {
    const slot = state[key];
    if (!slot.required) return true;
    if (key === 'TPIN') return slot.verified; // TPIN verified at submit
    return slot.paid && slot.verified;
  });
}

export function totalUnrefundedFees(state: WithdrawalCodeState): number {
  return (Object.keys(state) as WithdrawalCodeType[])
    .filter((key) => key !== 'TPIN')
    .reduce((sum, key) => (state[key].paid && !state[key].refunded ? sum + state[key].price : sum), 0);
}
