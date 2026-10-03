'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrencyForCountry, getCurrencySymbol } from '@/lib/currencies';
import {
  AuthList,
  AuthShell,
  AuthHeading,
  FormError,
  FormField,
  NotePanel,
  PasswordField,
} from '@/components/AuthForm';
import { PASSWORD_RULES, missingHint, unmetRules } from '@/lib/auth/passwordPolicy';

/**
 * Open an account.
 *
 * WHAT CHANGED. Presentation only, plus three things that were broken.
 *
 * The four-step structure stayed: this form collects an unusual amount for an
 * account opening — including a transaction PIN, which has to be set before it
 * is needed — and one long page with fifteen fields is worse than four short
 * ones. What changed is that every step now reads as the sign-in form: the same
 * hairline controls, the same full-width primary button, the same plain row of
 * secondary links underneath it, and none of the boxes.
 *
 * THREE THINGS WERE MAKING THIS PAGE HEAVIER THAN IT NEEDED TO BE.
 *
 * The step marker was a numbered list of underlined words, which is the only
 * place on the site where text carries an underline to mark state. It is a
 * caption and four hairlines now: the words say where you are, the rule shows
 * it at a glance, and the rule is `aria-hidden` because it says nothing the
 * words have not already said.
 *
 * THE ACCOUNT TYPES WERE A GRID OF BOXES. Eight bordered cards, each with its
 * own description, in two columns — a shape that appears nowhere else on the
 * site and made choosing a savings account look like a different product. They
 * are a ruled list of radios now, which is what they always were underneath: one
 * hairline between rows, the native radio carrying the selection, and no tick
 * badge to keep in step with it.
 *
 * The primary button was sized to its label while every field above it ran the
 * full measure, so the form had a ragged left edge and two widths of button on
 * one page. It spans the measure like the sign-in button does, and "Back" is a
 * text link beneath it rather than a second box beside it — which is what
 * sign-in does with everything that is not the primary action.
 *
 * ALSO TRUE OF THE PREVIOUS VERSION, KEPT FOR THE RECORD.
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

// `intro` is the sentence under the heading. It changes with the step because
// the steps ask for unrelated things, and a heading that says "Open an account"
// above a field asking for a country would leave the reader guessing.
const STEPS = [
  {
    n: 1,
    label: 'Name',
    intro: 'Four short steps. Nothing on this form takes longer than it should.',
  },
  { n: 2, label: 'Contact', intro: 'How we reach you, if we ever need to.' },
  { n: 3, label: 'Account', intro: 'Pick the kind of account you are opening.' },
  {
    n: 4,
    label: 'Security',
    intro: 'The password you sign in with, and the PIN that confirms money moving.',
  },
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

  // `step` is the number; `current` is this step's copy.
  const current = STEPS[step - 1];

  return (
    <AuthShell
      aside={
        <NotePanel
          heading="What happens next"
          ordered
          points={[
            <>We ask for a PIN now so it is set before you need it to move money.</>,
            <>You confirm your email address from a link we send you. Nothing works until you do.</>,
            <>Then you sign in, and the account is yours to use.</>,
          ]}
          action={
            <div className="flex flex-wrap gap-3">
              <Link href="/banking" className="btn-line">
                What an account costs
              </Link>
              <Link href="/terms" className="btn-quiet">
                The terms
              </Link>
            </div>
          }
        >
          We will never ask you for your password or for a code from your phone — not by phone, not
          by email, not in a chat. If anyone does, it is not us.
        </NotePanel>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthHeading title="Open an account" intro={current.intro} />

        {/* Where you are. A caption and a hairline. The words carry the
            information; the rule only shows it at a glance, so it is hidden from
            assistive tech rather than announced as four empty list items. */}
        <div className="mt-8 max-w-measure">
          <p className="text-caption text-muted-foreground">
            Step <span className="text-foreground">{step}</span> of {STEPS.length} —{' '}
            {current.label.toLowerCase()}
          </p>
          <div aria-hidden="true" className="mt-3 flex gap-1.5">
            {STEPS.map((s) => (
              <span
                key={s.n}
                className={`h-px flex-1 ${s.n <= step ? 'bg-foreground' : 'bg-border'}`}
              />
            ))}
          </div>
        </div>

        {/* The summary, not a message under each control. It is the only thing
            that names what is wrong, so the fields carry `aria-invalid` for the
            red border and nothing else. */}
        {problems.length > 0 || submitError ? (
          <div ref={errorRef} tabIndex={-1} className="outline-none">
            <FormError heading="Before you go on">
              <AuthList
                className="mt-3"
                tone="destructive"
                points={(submitError
                  ? [{ field: 'submit' as FieldKey, message: submitError }]
                  : problems
                ).map((p) => p.message)}
              />
            </FormError>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <div className="mt-7 grid gap-x-6 sm:grid-cols-2">
              <FormField id="firstName" label="First name">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  className="field mt-2"
                  aria-invalid={invalid.has('firstName') ? true : undefined}
                  value={formData.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                />
              </FormField>
              <FormField id="middleName" label="Middle name" optional>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  autoComplete="additional-name"
                  className="field mt-2"
                  value={formData.middleName}
                  onChange={(e) => set('middleName', e.target.value)}
                />
              </FormField>
            </div>

            <FormField id="lastName" label="Last name">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                className="field mt-2"
                aria-invalid={invalid.has('lastName') ? true : undefined}
                value={formData.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </FormField>

            <FormField
              id="username"
              label="Username"
              hint="This is how you sign in, alongside your password."
            >
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="field mt-2"
                aria-invalid={invalid.has('username') ? true : undefined}
                value={formData.username}
                onChange={(e) => set('username', e.target.value)}
              />
            </FormField>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <FormField id="email" label="Email address">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="field mt-2"
                aria-invalid={invalid.has('email') ? true : undefined}
                value={formData.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </FormField>

            <FormField
              id="phone"
              label="Phone number"
              hint="Only used if we need to reach you about the account."
            >
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className="field mt-2"
                aria-invalid={invalid.has('phone') ? true : undefined}
                value={formData.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </FormField>

            <FormField id="country" label="Country">
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
            </FormField>

            {formData.country === 'Other' ? (
              <FormField id="otherCountry" label="Which country?">
                <input
                  id="otherCountry"
                  name="otherCountry"
                  type="text"
                  required
                  className="field mt-2"
                  aria-invalid={invalid.has('otherCountry') ? true : undefined}
                  value={formData.otherCountry}
                  onChange={(e) => set('otherCountry', e.target.value)}
                />
              </FormField>
            ) : null}

            {formData.country && formData.country !== 'Other' ? (
              <p className="mt-5 max-w-measure border-l-2 border-border pl-4 text-body-sm text-muted-foreground">
                Your account will be held in {formData.currency} ({getCurrencySymbol(formData.currency)}).
              </p>
            ) : null}
          </div>
        ) : null}

        {/* The account types are a list with rules between the rows, which is how
            the rest of the site marks a list. They were eight bordered cards in
            two columns, and the box around a savings account made it look like a
            separate product from the one you were opening. The radio is the
            selection marker; nothing else has to agree with it, and nothing else
            can get out of step with it. */}
        {step === 3 ? (
          <fieldset className="mt-7 max-w-measure">
            <legend className="label">What kind of account?</legend>
            <div className="mt-3 border-t border-border">
              {ACCOUNT_TYPES.map((acc) => (
                <label
                  key={acc.id}
                  className="flex cursor-pointer items-start gap-3 border-b border-border py-3 transition-colors duration-150 hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={acc.id}
                    checked={formData.accountType === acc.id}
                    onChange={() => set('accountType', acc.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-foreground"
                  />
                  <span className="min-w-0">
                    <span className="block text-body-sm font-medium text-foreground">
                      {acc.name}
                    </span>
                    <span className="mt-1 block text-caption text-muted-foreground">{acc.desc}</span>
                  </span>
                </label>
              ))}
            </div>
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

        {/* One width of button on the whole form. Sign-in runs its primary
            action the full measure of the fields above it, and puts everything
            secondary underneath as plain text; this is that, with "Back" as the
            one extra line the four steps need. */}
        <button type="submit" disabled={loading} className="btn-ink mt-7 w-full max-w-measure">
          {loading
            ? 'Opening your account…'
            : step < STEPS.length
              ? 'Continue'
              : 'Open the account'}
        </button>

        <div className="mt-5 max-w-measure">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-body-sm text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-accent"
            >
              Back
            </button>
          ) : null}

          <p className="mt-5 text-body-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-accent">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
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
