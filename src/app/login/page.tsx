'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Sign in.
 *
 * Behaviour is unchanged from the previous version — same AuthContext calls,
 * same redirect to /dashboard, same forgot-password flow. Only the presentation
 * and the copy were rebuilt, to match the rest of the public site (hairlines,
 * no rounded corners, no shadow, no icon set).
 *
 * The "Remember me" checkbox was removed rather than restyled. It was wired to
 * state that was never passed anywhere: AuthContext exposes
 * `login(email, password)` with no such argument, so the control did nothing
 * while appearing to offer a security choice. A checkbox that silently does
 * nothing is worse than no checkbox.
 *
 * It is deliberately NOT built on `AuthShell`, unlike the four sibling pages.
 * Sign-in carries a security aside that is specific to signing in, and folding
 * it into the shared component would mean a heading and a bullet list on every
 * auth page to accommodate one. The outer element is a `div` rather than a
 * `main` for the same reason as the others: `ConditionalLayout` supplies the
 * landmark, and two nested `main`s is not a valid page.
 */
export default function LoginPage() {
  const { login, forgotPassword, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<'signin' | 'reset'>('signin');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  function focusError() {
    setTimeout(() => errorRef.current?.focus(), 50);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email || !password) {
      setError('Enter your email address and password.');
      focusError();
      return;
    }

    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) router.push('/dashboard');
    } catch {
      setError('We could not sign you in. Check your details and try again.');
      focusError();
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (resetLoading) return;
    setError(null);

    if (!resetEmail) {
      setError('Enter the email address on your account.');
      focusError();
      return;
    }

    setResetLoading(true);
    try {
      const ok = await forgotPassword(resetEmail);
      if (ok) {
        setResetSent(true);
        setResetEmail('');
      }
    } catch {
      setError('We could not send that email. Try again in a moment.');
      focusError();
    } finally {
      setResetLoading(false);
    }
  }

  if (user) return null;

  return (
    <div id="main">
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            {/* Form */}
            <div className="lg:col-span-6">
              {mode === 'signin' ? (
                <form onSubmit={handleSignIn} noValidate>
                  <h1 className="font-display text-display-1">Sign in</h1>
                  <p className="mt-5 max-w-measure text-body text-muted-foreground">
                    Use the email address and password on your account.
                  </p>

                  <div className="mt-9 max-w-measure">
                    <label htmlFor="login-email" className="label">
                      Email address
                    </label>
                    <input
                      id="login-email"
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
                  </div>

                  <div className="mt-5 max-w-measure">
                    <label htmlFor="login-password" className="label">
                      Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        className="field pr-24"
                        aria-invalid={error ? true : undefined}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 px-3 text-caption text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                        <span className="sr-only"> password</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p
                      ref={errorRef}
                      role="alert"
                      tabIndex={-1}
                      className="mt-6 max-w-measure border-l-2 border-destructive pl-4 text-body-sm text-destructive outline-none"
                    >
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={loading} className="btn-ink mt-7 w-full max-w-measure">
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>

                  <div className="mt-5 flex max-w-measure flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setError(null);
                      }}
                      className="text-body-sm text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-accent"
                    >
                      Forgotten your password?
                    </button>
                    <p className="text-body-sm text-muted-foreground">
                      No account?{' '}
                      <Link
                        href="/signup"
                        className="text-foreground underline underline-offset-4 hover:text-accent"
                      >
                        Open one
                      </Link>
                    </p>
                  </div>
                </form>
              ) : resetSent ? (
                <div className="max-w-measure">
                  <h1 className="font-display text-display-1">Check your email</h1>
                  <p className="mt-5 text-body text-muted-foreground">
                    If that address is on an account, a reset link is on its way. The link expires, so
                    use it reasonably promptly.
                  </p>
                  <p className="mt-4 text-body-sm text-muted-foreground">
                    Nothing arrived? Check the spam folder, then try again — and never send anyone a
                    code from an email to sign in to this site.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setResetSent(false);
                    }}
                    className="btn-line mt-8"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} noValidate>
                  <h1 className="font-display text-display-1">Reset your password</h1>
                  <p className="mt-5 max-w-measure text-body text-muted-foreground">
                    Enter the email address on your account and we will send you a link.
                  </p>

                  <div className="mt-9 max-w-measure">
                    <label htmlFor="reset-email" className="label">
                      Email address
                    </label>
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
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (error) setError(null);
                      }}
                    />
                  </div>

                  {error && (
                    <p
                      ref={errorRef}
                      role="alert"
                      tabIndex={-1}
                      className="mt-6 max-w-measure border-l-2 border-destructive pl-4 text-body-sm text-destructive outline-none"
                    >
                      {error}
                    </p>
                  )}

                  <div className="mt-7 flex max-w-measure flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="btn-ink disabled:opacity-50"
                    >
                      {resetLoading ? 'Sending…' : 'Send the link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError(null);
                      }}
                      className="btn-line"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>

            {mode === 'signin' && !resetSent && (
              // Security note. A login page is the most credible place a
              // phisher can point someone, so the warning belongs here.
              <aside className="lg:col-span-6 lg:pl-8">
                <div className="border border-border bg-muted p-6 lg:p-8">
                  <h2 className="text-h3 font-normal text-foreground">
                    We will never ask for your password.
                  </h2>
                  <p className="mt-4 max-w-measure text-body-sm text-muted-foreground">
                    Not by phone, not by email, not by SMS, and not in a chat. No one who is genuinely
                    us needs to know it, and no one who asks for it is us.
                  </p>
                  <ul className="mt-6 space-y-3 text-body-sm text-muted-foreground">
                    <li className="border-l border-border pl-4">
                      If a link brought you here, check the address bar before you type anything.
                      Or open the site yourself and navigate in — never through a link someone sent
                      you.
                    </li>
                    <li className="border-l border-border pl-4">
                      We will never ask for a one-time code, and we will never ask you to move money
                      to a &ldquo;safe&rdquo; account.
                    </li>
                    <li className="border-l border-border pl-4">
                      Recovery work happens inside your account. If you are asked to log in
                      somewhere else, or to send money to release funds, it is not us.
                    </li>
                  </ul>
                  <Link href="/blog" className="btn-line mt-7">
                    How these scams work
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
