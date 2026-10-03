'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthList, AuthShell, AuthHeading, NotePanel } from '@/components/AuthForm';

/**
 * Told to check your inbox, and how to get unstuck if nothing arrived.
 *
 * THREE THINGS WERE WRONG BEYOND THE LOOKING.
 *
 * The page drew its own white header bar with the word "Solariem" set in bold —
 * a hand-typed stand-in for the logo, on a page that also had the real site
 * header one click away. Dropped; the site header is the only one.
 *
 * The address came from `localStorage.getItem('signupEmail')` as a last resort.
 * Nothing anywhere writes that key — it is read on this page and set on no
 * other — so the fallback could never fire and only looked like it worked. The
 * address is now the query string or the signed-in account, both of which are
 * real.
 *
 * "I've activated my email" called `window.location.reload()`. A reader who
 * clicked it before the link had been followed got the same unanswered page
 * back, and `ProtectedRoute` sends unverified readers here, so it could amount
 * to reloading the same page indefinitely. It now re-reads the account once and
 * then says plainly what to do, instead of reloading.
 */
function ActivateEmailForm() {
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  // Derived rather than stored: nothing to synchronise, and no effect that
  // sets state on mount just to fill in a value already in hand.
  const address = searchParams.get('email') || user?.email || '';

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState<'idle' | 'notyet' | 'confirmed'>('idle');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleResend() {
    if (countdown > 0 || resending || !address) return;

    setResending(true);
    setResendError(null);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address }),
      });
      const result: { error?: string } = await response.json().catch(() => ({}));

      if (response.ok) {
        setResent(true);
        setCountdown(60);
      } else {
        setResendError(result.error || 'We could not send that email. Try again in a moment.');
      }
    } catch {
      setResendError('We could not reach the server. Try again in a moment.');
    } finally {
      setResending(false);
    }
  }

  async function handleCheck() {
    if (checking) return;
    setChecking(true);
    setChecked('idle');
    try {
      await refreshUser();
      // `confirmed` below reads `user.emailVerified` straight off context, which
      // `refreshUser` has just replaced. Setting 'notyet' here only matters when
      // it is still false: that is the branch that explains why, instead of the
      // old `window.location.reload()`, which could bounce an unverified reader
      // back to this same page indefinitely.
      setChecked('notyet');
    } catch {
      setResendError('We could not reach the server. Try again in a moment.');
    } finally {
      setChecking(false);
    }
  }

  const confirmed = user?.emailVerified === true;

  return (
    <AuthShell
      aside={
        <NotePanel
          heading="If nothing arrives."
          points={[
            <>
              Check the spam folder first. Verification mail is the mail most likely to be filed
              away by a filter.
            </>,
            <>
              Use the same address you registered with. An account with a verification email
              outstanding still works for everything else in the meantime.
            </>,
            <>
              Still nothing, or nothing at all in your inbox? Ask us and we will check from our end
              rather than sending a third email.
            </>,
          ]}
          action={
            <Link href="/contact" className="btn-line">
              Contact support
            </Link>
          }
        />
      }
    >
      <AuthHeading
        title="Check your inbox"
        intro={
          address ? (
            <>
              We sent a verification link to <span className="text-foreground">{address}</span>.
            </>
          ) : (
            <>We sent you a verification link.</>
          )
        }
      />

      <AuthList
        ordered
        className="mt-8 max-w-measure"
        points={[
          <>Open the email we sent you.</>,
          <>Follow the link in it.</>,
          <>Come back here to confirm.</>,
        ]}
      />

      {confirmed ? (
        <>
          <p className="mt-8 max-w-measure border-l-2 border-foreground pl-4 text-body-sm text-foreground">
            Your address is confirmed. You can sign in.
          </p>
          <div className="mt-7 flex max-w-measure flex-wrap items-center gap-3">
            <Link href="/login" className="btn-ink">
              Sign in
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="mt-8 flex max-w-measure flex-wrap items-center gap-3">
            <button type="button" onClick={handleCheck} disabled={checking} className="btn-ink disabled:opacity-50">
              {checking ? 'Checking…' : 'I have followed the link'}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || countdown > 0 || !address}
              className="btn-line"
            >
              {countdown > 0
                ? `Send again in ${countdown}s`
                : resending
                  ? 'Sending…'
                  : 'Send the email again'}
            </button>
          </div>

          {checked === 'notyet' && !resendError ? (
            <p className="mt-6 max-w-measure border-l-2 border-border pl-4 text-body-sm text-muted-foreground">
              Still showing as unconfirmed. If you have followed the link, give it a few seconds and
              check again — or send yourself another email, which is harmless.
            </p>
          ) : null}

          {resendError ? (
            <p
              role="alert"
              className="mt-6 max-w-measure border-l-2 border-destructive pl-4 text-body-sm text-destructive"
            >
              {resendError}
            </p>
          ) : null}

          {resent ? (
            <p className="mt-6 max-w-measure border-l-2 border-foreground pl-4 text-body-sm text-foreground">
              Another email is on its way.
            </p>
          ) : null}
        </>
      )}

      <p className="mt-10 max-w-measure text-body-sm text-muted-foreground">
        By using an account you accept our{' '}
        <Link href="/terms" className="text-foreground underline underline-offset-4 hover:text-accent">
          terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-accent">
          privacy policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}

export default function ActivateEmailPage() {
  // Neutral skeleton, not a copy of the page — see the note in signup/page.tsx.
  return (
    <Suspense fallback={<div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28" />}>
      <ActivateEmailForm />
    </Suspense>
  );
}
