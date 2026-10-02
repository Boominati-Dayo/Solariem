'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toast';
import { AuthShell, AuthHeading, FormError, FormField } from '@/components/AuthForm';

type Status = 'checking' | 'done' | 'failed';

/**
 * Land here from the verification email and the address gets confirmed.
 *
 * THE NAVIGATION IS A FULL PAGE LOAD ON PURPOSE. A soft `router.push` can leave
 * a cached user profile in memory, and the dashboard then re-renders the "verify
 * your email" banner against an address that is already verified. `window.location`
 * forces `/me` to run again and read the real state.
 *
 * What changed is the eight-second timer. The page used to navigate away on its
 * own a moment after verifying, which meant the confirmation was never actually
 * read by anyone using a screen reader, and by anyone who simply looked away.
 * The button does the same navigation; it just waits to be asked.
 */
function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState<Status>('checking');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const started = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('failed');
      setMessage('That link is missing its code, so there was nothing to check. Enter your address below and we will send a new one.');
      return;
    }

    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const ok = await verifyEmail(token);
        if (ok) {
          setStatus('done');
          setMessage('Your address is confirmed.');
        } else {
          setStatus('failed');
          setMessage('That link is no longer valid. Enter your address below and we will send a new one.');
        }
      } catch {
        setStatus('failed');
        setMessage('We could not check that link just now. Enter your address below and we will send a new one.');
      }
    })();
  }, [searchParams, verifyEmail]);

  /** Full load on purpose — see the note at the top of this file. */
  function goToDashboard() {
    const target = new URL(window.location.href);
    target.pathname = '/dashboard';
    target.search = '?verified=1';
    target.hash = '';
    window.location.replace(target.toString());
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (resending) return;

    if (!resendEmail.trim()) {
      setResendError('Enter the email address on your account.');
      setTimeout(() => errorRef.current?.focus(), 50);
      return;
    }

    setResending(true);
    setResendError(null);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      // A non-JSON body (an error page, say) must not throw past the catch and
      // be reported as a network failure, which would be a lie.
      const result: { error?: string; message?: string } = await response
        .json()
        .catch(() => ({}));

      if (response.ok) {
        showSuccess('A new verification email is on its way. Check your inbox.');
      } else if (response.status === 404) {
        setResendError('No account is using that address.');
        setTimeout(() => errorRef.current?.focus(), 50);
      } else if (result.message?.toLowerCase().includes('already verified')) {
        showSuccess('That address is already verified. You can sign in.');
      } else {
        setResendError(result.error || 'We could not send that email. Try again in a moment.');
        setTimeout(() => errorRef.current?.focus(), 50);
      }
    } catch {
      setResendError('We could not reach the server. Try again in a moment.');
      setTimeout(() => errorRef.current?.focus(), 50);
    } finally {
      setResending(false);
    }
  }

  if (status === 'checking') {
    return (
      <AuthShell>
        <AuthHeading title="Checking your address" intro="One moment while we confirm that link." />
      </AuthShell>
    );
  }

  if (status === 'done') {
    return (
      <AuthShell
        aside={
          <div className="border border-border bg-muted p-6 lg:p-8">
            <h2 className="text-h3 font-normal text-foreground">What is now unlocked</h2>
            <ul className="mt-6 space-y-3 text-body-sm text-muted-foreground">
              <li className="border-l border-border pl-4">
                Sending and receiving payments from your account.
              </li>
              <li className="border-l border-border pl-4">
                Opening a recovery case, and following where it gets to.
              </li>
            </ul>
          </div>
        }
      >
        <AuthHeading title="Address confirmed" intro={message} />
        <div className="mt-8 flex max-w-measure flex-wrap items-center gap-3">
          <button type="button" onClick={goToDashboard} className="btn-ink">
            Go to your account
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      aside={
        <div className="border border-border bg-muted p-6 lg:p-8">
          <h2 className="text-h3 font-normal text-foreground">Check the address bar first.</h2>
          <p className="mt-4 max-w-measure text-body-sm text-muted-foreground">
            We will never ring you or message you to ask you to confirm an address, and we will
            never ask for a code from your phone to get into your account. If a page asking for that
            got you here, close it and come to the site yourself.
          </p>
          <Link href="/blog" className="btn-line mt-7">
            How these scams work
          </Link>
        </div>
      }
    >
      <AuthHeading title="We could not confirm that address" intro={message} />

      <form onSubmit={handleResend} noValidate className="mt-9 max-w-measure">
        <FormField
          id="resend-email"
          label="Email address"
          hint="We will send a fresh link to whichever address is on the account."
        >
          <input
            id="resend-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field mt-2"
            placeholder="you@example.com"
            aria-invalid={resendError ? true : undefined}
            value={resendEmail}
            onChange={(e) => {
              setResendEmail(e.target.value);
              if (resendError) setResendError(null);
            }}
          />
        </FormField>

        {resendError ? <FormError errorRef={errorRef}>{resendError}</FormError> : null}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={resending} className="btn-ink disabled:opacity-50">
            {resending ? 'Sending…' : 'Send a new link'}
          </button>
          <Link href="/login" className="btn-line">
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  // Neutral skeleton, not a copy of the page — see the note in signup/page.tsx.
  return (
    <Suspense fallback={<div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
