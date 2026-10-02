'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthShell, AuthHeading, FormError, FormField, NotePanel } from '@/components/AuthForm';

/**
 * Ask for a password reset link.
 *
 * WHY THIS PAGE IS THE REQUEST FORM AND NOT THE FORM WITH THE TOKEN. There are
 * two reset routes. `/reset-password/[token]` is the live one — the email sends
 * `${APP_URL}/reset-password/${token}`, a path segment. This page used to read
 * `?token=` off the query string, so it could only ever do anything if a reader
 * hand-assembled a URL, and arriving here on a bare link produced an "Invalid
 * Reset Link" dead end.
 *
 * That dead end was load-bearing: the expired-link page pointed its "Request New
 * Link" button here, so a customer whose reset link had expired was told to
 * request a new one and then landed on a page that could not request anything.
 *
 * So the token moved to the route that receives it and this page took over the
 * job it was obviously meant for — asking for the link in the first place. Sign
 * in points here now rather than carrying its own copy of this form, which is
 * how two reset forms drifted into saying different things.
 */
export default function ResetPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  function focusError() {
    setTimeout(() => errorRef.current?.focus(), 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email.trim()) {
      setError('Enter the email address on your account.');
      focusError();
      return;
    }

    setLoading(true);
    try {
      const ok = await forgotPassword(email.trim());
      if (ok) {
        setSent(true);
        setEmail('');
      }
    } catch {
      setError('We could not send that email. Try again in a moment.');
      focusError();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      aside={
        <NotePanel
          heading="The link expires."
          points={[
            <>
              Open it on the device you will use to sign in. Once you set a password the link is
              spent, and setting a second one invalidates the first.
            </>,
            <>
              If nothing arrives, check the spam folder before asking for another — a second email
              does not replace the first.
            </>,
            <>
              We will never ring you, email you, or message you to ask for your password or a code
              from your phone. If someone does, it is not us.
            </>,
          ]}
          action={
            <Link href="/login" className="btn-line">
              Back to sign in
            </Link>
          }
        />
      }
    >
      {sent ? (
        <>
          <AuthHeading title="Check your email" />
          <p className="mt-5 max-w-measure text-body text-muted-foreground">
            If that address is on an account, a reset link is on its way. The link expires, so use it
            reasonably promptly.
          </p>
          <p className="mt-4 max-w-measure text-body-sm text-muted-foreground">
            Nothing arrived? Check the spam folder, then ask for another. And never send anyone a
            code from an email in order to sign in to this site.
          </p>
          <div className="mt-7 flex max-w-measure flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setError(null);
              }}
              className="btn-ink"
            >
              Send it again
            </button>
            <Link href="/login" className="btn-line">
              Back to sign in
            </Link>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <AuthHeading
            title="Reset your password"
            intro={
              <>
                Tell us the email address on your account and we will send you a link to set a new
                password.
              </>
            }
          />

          <FormField id="reset-email" label="Email address" invalid={error != null}>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              className="field mt-2"
              placeholder="you@example.com"
              aria-invalid={error ? true : undefined}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
            />
          </FormField>

          {error ? <FormError errorRef={errorRef}>{error}</FormError> : null}

          <div className="mt-7 flex max-w-measure flex-wrap items-center gap-3">
            <button type="submit" disabled={loading} className="btn-ink disabled:opacity-50">
              {loading ? 'Sending…' : 'Send the link'}
            </button>
            <Link href="/login" className="btn-line">
              Back
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
