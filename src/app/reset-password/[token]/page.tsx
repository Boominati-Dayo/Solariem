'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AuthShell, AuthHeading, FormError, PasswordField, NotePanel } from '@/components/AuthForm';
import { missingHint, unmetRules } from '@/lib/auth/passwordPolicy';

/**
 * Choose a new password from an emailed reset link.
 *
 * This is the route the email actually points at — `${APP_URL}/reset-password/${token}`,
 * a path segment. See the note on `/reset-password` for why the two used to be
 * the same page and no longer are.
 *
 * TWO THINGS CHANGED BEYOND THE LOOK.
 *
 * The success state used to `router.push('/login')` after three seconds. A page
 * that navigates away on a timer takes the confirmation with it, which is
 * exactly the message someone using a screen reader has not finished hearing.
 * There is a link now, and the page waits.
 *
 * "Request New Link" used to point at `/reset-password`, which then rendered an
 * "Invalid Reset Link" dead end — so the one action offered to someone whose
 * link had expired did nothing. That page asks for an address and sends a real
 * link now, so this button works.
 */
export default function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'validating' | 'form' | 'success' | 'error'>('validating');
  const [message, setMessage] = useState('');
  const errorRef = useRef<HTMLParagraphElement>(null);
  const validated = useRef(false);

  useEffect(() => {
    // Guarded because React remounts effects in StrictMode, and this is a
    // network call. Without it every render pass in development asks the server
    // whether the token is still good.
    if (validated.current) return;
    validated.current = true;

    let cancelled = false;

    (async () => {
      try {
        const { token } = await params;
        const res = await fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
        if (cancelled) return;
        if (res.ok) {
          setStep('form');
        } else {
          const data = await res.json().catch(() => ({}));
          if (cancelled) return;
          setStep('error');
          setMessage(data.error || 'That link is no longer valid.');
        }
      } catch {
        if (cancelled) return;
        setStep('error');
        setMessage('We could not reach the server to check that link. Try again in a moment.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      setMessage('Those two passwords are not the same.');
      setTimeout(() => errorRef.current?.focus(), 50);
      return;
    }

    // Same policy the server enforces, from the same module — see
    // src/lib/auth/passwordPolicy.ts. This page used to carry its own looser
    // copy, which accepted passwords the server then refused.
    const missing = unmetRules(password);
    if (missing.length > 0) {
      setMessage(`A password needs ${missingHint(password)}.`);
      setTimeout(() => errorRef.current?.focus(), 50);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const { token } = await params;
      const res = await fetch('/api/auth/confirm-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStep('success');
      } else {
        setMessage(data.error || 'We could not change the password. Ask for a new link.');
        setTimeout(() => errorRef.current?.focus(), 50);
      }
    } catch {
      setMessage('We could not reach the server. Try again in a moment.');
      setTimeout(() => errorRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'validating') {
    return (
      <AuthShell>
        <AuthHeading
          title="Checking your link"
          intro="One moment while we confirm this link is still good."
        />
      </AuthShell>
    );
  }

  if (step === 'error') {
    return (
      <AuthShell
        aside={
          <NotePanel
            heading="Links expire."
            points={[
              <>A reset link can only be used once, and only for a limited time.</>,
              <>
                Asking for a new one is safe and does not affect your account. Your old password keeps
                working until you successfully set a new one.
              </>,
            ]}
          />
        }
      >
        <AuthHeading title="That link has expired" intro={message} />
        <div className="mt-8 flex max-w-measure flex-wrap items-center gap-3">
          <Link href="/reset-password" className="btn-ink">
            Request a new link
          </Link>
          <Link href="/login" className="btn-line">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (step === 'success') {
    return (
      <AuthShell
        aside={
          <NotePanel
            heading="You are signed out of everywhere."
            points={[
              <>
                Changing a password ends every other session, so anyone holding the old one is locked
                out.
              </>,
            ]}
          />
        }
      >
        <AuthHeading
          title="Password changed"
          intro="Your new password is in place and every other session has been ended."
        />
        <div className="mt-8 flex max-w-measure flex-wrap items-center gap-3">
          <Link href="/login" className="btn-ink">
            Sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      aside={
        <NotePanel
          heading="Pick something you have not used here before."
          points={[
            <>
              Reusing a password from another site is the single most useful thing a thief can do
              with yours, because sites get broken into in bulk.
            </>,
            <>
              Nothing here will ever ask you to read your password back to us. If a page offering to
              help does, close it.
            </>,
          ]}
        />
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthHeading
          title="Choose a new password"
          intro="Pick something you have not used on another site. You will use it from now on to sign in."
        />

        <PasswordField
          id="new-password"
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (message) setMessage('');
          }}
        />

        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Type it again"
          show={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            if (message) setMessage('');
          }}
        />

        {message ? <FormError errorRef={errorRef}>{message}</FormError> : null}

        <div className="mt-7 flex max-w-measure flex-wrap items-center gap-3">
          <button type="submit" disabled={loading} className="btn-ink disabled:opacity-50">
            {loading ? 'Changing…' : 'Change password'}
          </button>
          <Link href="/login" className="btn-line">
            Cancel
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
