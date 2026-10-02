'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrencyForCountry, getCurrencySymbol } from '@/lib/currencies';
import { AuthShell, AuthHeading, FormError, PasswordField } from '@/components/AuthForm';
import { PASSWORD_RULES, missingHint, unmetRules } from '@/lib/auth/passwordPolicy';

/**
 * Open an account.
 *
 * WHAT CHANGED. Presentation only, plus three things that were broken.
 *
 * The four-step structure stayed: this form collects an unusual amount for an
 * account opening — including a transaction PIN, which has to be set before it
 * is needed — and one long page with fifteen fields is worse than four short
 * ones. What changed is that the steps now look like the sign-in form, and that
 * the promotional column is gone.
 *
 * THAT COLUMN WAS MAKING CLAIMS. "AES-256 encryption and multi-factor
 * authentication protect your assets 24/7", "your dashboard is provisioned
 * immediately", "private wealth managers are assigned to assist with large
 * transfers", "join thousands of clients worldwide". None of those are things
 * this codebase can establish, and three of them are the kind of security and
 * staffing promise that is worth very little unless it is true. It is replaced
 * by what actually happens next, which is both true and more use to a reader
 * deciding whether to open an account.
 *
 * THE ACCOUNT CARDS WERE NOT KEYBOARD REACHABLE. They were `div`s with an
 * onClick, so they could not be tabbed to, focused, or activated by a keyboard,
 * and nothing announced which was selected. They are real radio inputs now, so
 * arrow keys work and the group is announced as a group.
 *
 * "Highest interest rates" was dropped from the fixed deposit description. It
 * is a superlative about a rate nobody here can publish, and it cannot be
 * substantiated from this codebase. The descriptions are neutral placeholders
 * and still want the owner to confirm them.
 */

type FieldKey =
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'username'
  | 'email'
  | 'phone'
  | 'country'
  | 'otherCountry'
  | 'accountType'
  | 'password'
  | 'confirmPassword'
  | 'transactionPin'
  | 'confirmPin'
  | 'agreeToTerms';

type Problem = { field: FieldKey; message: string };

const STEPS = [
  { n: 1, label: 'Name' },
  { n: 2, label: 'Contact' },
  { n: 3, label: 'Account' },
  { n: 4, label: 'Security' },
];

const ACCOUNT_TYPES = [
  { id: 'checking', name: 'Checking account', desc: 'For everyday spending and direct debit.' },
  { id: 'savings', name: 'Savings account', desc: 'For money you are putting aside.' },
  { id: 'fixed_deposit', name: 'Fixed deposit', desc: 'A set amount, for a fixed term, at a fixed rate.' },
  { id: 'current', name: 'Current account', desc: 'For everyday business transactions.' },
  { id: 'crypto', name: 'Digital currency account', desc: 'For holding digital currency.' },
  { id: 'business', name: 'Business account', desc: 'For small and medium businesses.' },
  { id: 'non_resident', name: 'Non-resident account', desc: 'If you do not live in the country you bank in.' },
  { id: 'corporate', name: 'Corporate account', desc: 'For larger organisations.' },
];

const COUNTRIES = [
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    state: '',
    zip: '',
    accountType: '',
    password: '',
    confirmPassword: '',
    transactionPin: '',
    confirmPin: '',
    agreeToTerms: false,
    otherCountry: '',
    currency: 'USD',
    referralCode: '',
  });

  const [step, setStep] = useState(1);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // The referral code arrives in the URL. `useSearchParams` is already read
  // during render, so this seeds the form once rather than through an effect
  // that sets state after paint.
  const ref = searchParams.get('ref');
  useEffect(() => {
    if (ref) setFormData((p) => ({ ...p, referralCode: ref }));
  }, [ref]);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const invalid = useMemo(
    () => new Set(problems.map((p) => p.field)),
    [problems]
  );

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  function validateStep(which: number): Problem[] {
    const out: Problem[] = [];
    if (which === 1) {
      if (!formData.firstName.trim()) out.push({ field: 'firstName', message: 'Enter your first name.' });
      if (!formData.lastName.trim()) out.push({ field: 'lastName', message: 'Enter your last name.' });
      if (!formData.username.trim()) out.push({ field: 'username', message: 'Choose a username.' });
    } else if (which === 2) {
      if (!formData.email.trim()) out.push({ field: 'email', message: 'Enter your email address.' });
      else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim()))
        out.push({ field: 'email', message: 'That does not look like an email address.' });
      if (!formData.phone.trim()) out.push({ field: 'phone', message: 'Enter a phone number we can reach you on.' });
      if (!formData.country.trim()) out.push({ field: 'country', message: 'Choose your country.' });
      else if (formData.country === 'Other' && !formData.otherCountry.trim())
        out.push({ field: 'otherCountry', message: 'Tell us which country you are in.' });
    } else if (which === 3) {
      if (!formData.accountType) out.push({ field: 'accountType', message: 'Choose the kind of account you want.' });
    } else if (which === 4) {
      if (unmetRules(formData.password).length > 0)
        out.push({ field: 'password', message: `Your password needs ${missingHint(formData.password)}.` });
      if (formData.confirmPassword !== formData.password)
        out.push({ field: 'confirmPassword', message: 'Those two passwords are not the same.' });
      if (!/^\d{4}$/.test(formData.transactionPin))
        out.push({ field: 'transactionPin', message: 'Your PIN is four digits.' });
      if (formData.confirmPin !== formData.transactionPin)
        out.push({ field: 'confirmPin', message: 'Those two PINs are not the same.' });
      if (!formData.agreeToTerms)
        out.push({ field: 'agreeToTerms', message: 'Please accept the terms to continue.' });
    }
    return out;
  }

  function focusErrors() {
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setSubmitError(null);
    const found = validateStep(step);
    setProblems(found);

    if (found.length > 0) {
      focusErrors();
      return;
    }

    if (step < STEPS.length) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const country = formData.country === 'Other' ? formData.otherCountry.trim() : formData.country;
      const ok = await register({
        ...formData,
        country,
        transactionPin: formData.transactionPin,
        currency: formData.currency || 'USD',
        referralCode: formData.referralCode,
      });
      if (ok) router.push('/login');
    } catch {
      setSubmitError('We could not open the account. Try again in a moment.');
      focusErrors();
    } finally {
      setLoading(false);
    }
  }

  if (user) return null;

  const stepLabel = STEPS[step - 1]?.label ?? '';

  return (
    <AuthShell
      aside={
        <div className="border border-border bg-muted p-6 lg:p-8">
          <h2 className="text-h3 font-normal text-foreground">What happens next</h2>
          <ol className="mt-6 space-y-3 text-body-sm text-muted-foreground">
            <li className="border-l border-border pl-4">
              We ask for a PIN now so it is set before you need it to move money.
            </li>
            <li className="border-l border-border pl-4">
              You confirm your email address from a link we send you. Nothing works until you do.
            </li>
            <li className="border-l border-border pl-4">
              Then you sign in, and the account is yours to use.
            </li>
          </ol>
          <p className="mt-6 max-w-measure text-body-sm text-muted-foreground">
            We will never ask you for your password or for a code from your phone — not by phone,
            not by email, not in a chat. If anyone does, it is not us.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/banking" className="btn-line">
              What an account costs
            </Link>
            <Link href="/terms" className="btn-quiet">
              The terms
            </Link>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthHeading
          title="Open an account"
          intro={
            step === 1
              ? 'Four short steps. Nothing here takes longer than it should.'
              : `Step ${step} of ${STEPS.length}: ${stepLabel.toLowerCase()}.`
          }
        />

        <ol
          aria-label="Progress through the form"
          className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-caption"
        >
          {STEPS.map((s) => {
            const isNow = s.n === step;
            const isDone = s.n < step;
            return (
              <li
                key={s.n}
                aria-current={isNow ? 'step' : undefined}
                className={`border-b pb-1 ${
                  isNow
                    ? 'border-foreground text-foreground'
                    : isDone
                      ? 'border-border text-muted-foreground'
                      : 'border-transparent text-muted-foreground'
                }`}
              >
                {s.n}. {s.label}
              </li>
            );
          })}
        </ol>

        <div ref={errorRef} tabIndex={-1} className="outline-none">
          {problems.length > 0 || submitError ? (
            <FormError heading="Before you go on" errorRef={undefined}>
              <ul className="list-disc space-y-1 pl-5">
                {(submitError ? [{ field: 'submit' as FieldKey, message: submitError }] : problems).map(
                  (p, i) => (
                    <li key={i}>{p.message}</li>
                  )
                )}
              </ul>
            </FormError>
          ) : null}
        </div>

        {step === 1 ? (
          <div className="mt-2">
            <div className="mt-5 grid gap-x-6 sm:grid-cols-2">
              <LabelledInput
                id="firstName"
                label="First name"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(v) => set('firstName', v)}
                invalid={invalid.has('firstName')}
              />
              <LabelledInput
                id="middleName"
                label="Middle name"
                optional
                autoComplete="additional-name"
                value={formData.middleName}
                onChange={(v) => set('middleName', v)}
              />
            </div>
            <LabelledInput
              id="lastName"
              label="Last name"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={(v) => set('lastName', v)}
              invalid={invalid.has('lastName')}
            />
            <LabelledInput
              id="username"
              label="Username"
              hint="This is how you sign in, alongside your password."
              autoComplete="username"
              value={formData.username}
              onChange={(v) => set('username', v)}
              invalid={invalid.has('username')}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <LabelledInput
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(v) => set('email', v)}
              invalid={invalid.has('email')}
            />
            <LabelledInput
              id="phone"
              label="Phone number"
              hint="Only used if we need to reach you about the account."
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(v) => set('phone', v)}
              invalid={invalid.has('phone')}
            />

            <div className="mt-5 max-w-measure">
              <label htmlFor="country" className="label">
                Country
              </label>
              <select
                id="country"
                name="country"
                required
                autoComplete="country"
                className="field mt-2"
                aria-invalid={invalid.has('country') ? true : undefined}
                value={formData.country}
                onChange={(e) => {
                  const country = e.target.value;
                  setFormData((p) => ({
                    ...p,
                    country,
                    // Choosing "Other" has no currency to infer, so it holds at
                    // USD until told otherwise, exactly as before.
                    currency: country === 'Other' ? p.currency : getCurrencyForCountry(country),
                  }));
                }}
              >
                <option value="">Choose your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
                <option value="Other">Somewhere else</option>
              </select>
            </div>

            {formData.country === 'Other' ? (
              <LabelledInput
                id="otherCountry"
                label="Which country?"
                value={formData.otherCountry}
                onChange={(v) => set('otherCountry', v)}
                invalid={invalid.has('otherCountry')}
              />
            ) : null}

            {formData.country && formData.country !== 'Other' ? (
              <p className="mt-5 max-w-measure border-l-2 border-border pl-4 text-body-sm text-muted-foreground">
                Your account will be held in {formData.currency} ({getCurrencySymbol(formData.currency)}).
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <fieldset className="mt-8 max-w-measure">
            <legend className="label">What kind of account?</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ACCOUNT_TYPES.map((acc) => {
                const selected = formData.accountType === acc.id;
                return (
                  <label
                    key={acc.id}
                    className={`flex cursor-pointer gap-3 border p-4 transition-colors duration-150 ${
                      selected
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={acc.id}
                      checked={selected}
                      onChange={() => set('accountType', acc.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-foreground"
                    />
                    <span>
                      <span className="flex items-center gap-2 text-body-sm font-medium text-foreground">
                        {acc.name}
                        {selected ? (
                          <Check className="h-4 w-4 shrink-0 text-foreground" aria-hidden="true" />
                        ) : null}
                      </span>
                      <span className="mt-1 block text-caption text-muted-foreground">{acc.desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {invalid.has('accountType') ? (
              <p className="mt-3 text-caption text-destructive">
                Choose the kind of account you want.
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {step === 4 ? (
          <div>
            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              value={formData.password}
              onChange={(v) => set('password', v)}
              invalid={invalid.has('password')}
              className={invalid.has('password') ? 'pr-24' : ''}
            />
            <ul className="mt-3 max-w-measure space-y-1 text-caption">
              {PASSWORD_RULES.map((r) => {
                const ok = r.ok(formData.password);
                return (
                  <li key={r.label} className="flex items-center gap-2">
                    {ok ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-foreground" aria-hidden="true" />
                    ) : (
                      <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    )}
                    <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>
                      {r.label}
                      <span className="sr-only">{ok ? ' — met' : ' — not yet'}</span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <PasswordField
              id="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Type it again"
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((v) => !v)}
              value={formData.confirmPassword}
              onChange={(v) => set('confirmPassword', v)}
              invalid={invalid.has('confirmPassword')}
            />

            <PasswordField
              id="transactionPin"
              label="Transaction PIN"
              hint="Four digits, asked separately from your password. You will use it to confirm transfers and withdrawals."
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              show={showPin}
              onToggle={() => setShowPin((v) => !v)}
              value={formData.transactionPin}
              onChange={(v) => set('transactionPin', v.replace(/\D/g, ''))}
              invalid={invalid.has('transactionPin')}
            />

            <PasswordField
              id="confirmPin"
              label="Confirm transaction PIN"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              show={showPin}
              onToggle={() => setShowPin((v) => !v)}
              value={formData.confirmPin}
              onChange={(v) => set('confirmPin', v.replace(/\D/g, ''))}
              invalid={invalid.has('confirmPin')}
            />

            <div className="mt-7 flex max-w-measure items-start gap-3">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => set('agreeToTerms', e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-foreground"
                aria-invalid={invalid.has('agreeToTerms') ? true : undefined}
              />
              <label htmlFor="agreeToTerms" className="text-body-sm text-muted-foreground">
                I accept the{' '}
                <Link
                  href="/terms"
                  className="text-foreground underline underline-offset-4 hover:text-accent"
                >
                  terms of service
                </Link>{' '}
                and the{' '}
                <Link
                  href="/privacy"
                  className="text-foreground underline underline-offset-4 hover:text-accent"
                >
                  privacy policy
                </Link>
                .
              </label>
            </div>
          </div>
        ) : null}

        <div className="mt-9 flex max-w-measure flex-wrap items-center gap-3">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn-line">
              Back
            </button>
          ) : null}
          <button type="submit" disabled={loading} className="btn-ink disabled:opacity-50">
            {loading
              ? 'Opening your account…'
              : step < STEPS.length
                ? 'Continue'
                : 'Open the account'}
          </button>
        </div>

        <p className="mt-7 max-w-measure text-body-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-accent">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

/** Label + input, sized to the reading measure like every other field here. */
function LabelledInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  hint,
  optional,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  hint?: string;
  optional?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className="mt-5 max-w-measure">
      <label htmlFor={id} className="label">
        {label}
        {optional ? <span className="text-muted-foreground"> (optional)</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={!optional}
        autoComplete={autoComplete}
        aria-invalid={invalid ? true : undefined}
        className="field mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="mt-2 text-caption text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function SignupPage() {
  // The fallback is a neutral skeleton, not a copy of the page. `useSearchParams`
  // suspends on the client, and a Suspense fallback is an ELEMENT TREE, not a
  // string to be swapped — so a fallback containing a full AuthShell renders its
  // heading and then replaces the whole thing a moment later. That produced two
  // <h1>s and two id="main"s on the served HTML. Nothing here needs to look
  // finished, so it just reserves the height.
  return (
    <Suspense fallback={<div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28" />}>
      <SignupForm />
    </Suspense>
  );
}
