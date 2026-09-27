// Withdrawal code configuration: per-user pricing the admin can toggle
// for each of the 5 codes that gate a withdrawal. TPIN is the legacy
// 4-digit PIN the user already enters (always free, but listed here so
// the admin UI is uniform). The other 4 are paid gates: the user must
// pay the configured price to obtain a code, then enter it to clear the
// gate. If a withdrawal is rejected, all code fees are refunded.

export type WithdrawalCodeType = 'TPIN' | 'TAC' | 'MFA' | 'TVC' | 'SAC';

export const WITHDRAWAL_CODE_TYPES: WithdrawalCodeType[] = ['TPIN', 'TAC', 'MFA', 'TVC', 'SAC'];

// Order the user steps through. TPIN first because it's already required
// everywhere; then SAC, TVC, MFA, TAC.
export const WITHDRAWAL_CODE_ORDER: WithdrawalCodeType[] = ['TPIN', 'SAC', 'TVC', 'MFA', 'TAC'];

export interface CodePricing {
  enabled: boolean;
  price: number;
}

export type UserCodePricing = Record<WithdrawalCodeType, CodePricing>;

export const defaultUserCodePricing = (): UserCodePricing => ({
  TPIN: { enabled: true, price: 0 },
  TAC: { enabled: false, price: 0 },
  MFA: { enabled: false, price: 0 },
  TVC: { enabled: false, price: 0 },
  SAC: { enabled: false, price: 0 }
});

export const CODE_LABELS: Record<WithdrawalCodeType, { name: string; description: string }> = {
  TPIN: {
    name: 'Transaction PIN',
    description: 'Your 4-digit security PIN. Free, always required.'
  },
  SAC: {
    name: 'Secure Access Code',
    description: 'A code required to access the withdrawal flow.'
  },
  TVC: {
    name: 'Transaction Verification Code',
    description: 'A code that confirms the specific withdrawal details.'
  },
  MFA: {
    name: 'Multi-Factor Authentication',
    description: 'A second-factor code sent to your verified contact.'
  },
  TAC: {
    name: 'Transaction Authorization Code',
    description: 'A final code authorizing the withdrawal to proceed.'
  }
};
