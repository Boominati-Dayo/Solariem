'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

function VerifyEmailForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();

  const verificationStarted = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Enter your email below to receive a new link.');
      return;
    }

    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const handleVerification = async () => {
      try {
        const success = await verifyEmail(token);
        if (success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now access all features.');
          // Hard navigation so the dashboard re-runs /me and re-reads the
          // fresh emailVerified state. A soft router.push() can keep a
          // stale userProfile cached in memory and re-trigger the
          // "Email Verification Required" banner.
          const target = new URL(window.location.href);
          target.pathname = '/dashboard';
          target.search = '?verified=1';
          target.hash = '';
          // Defer slightly so the user can read the success message.
          setTimeout(() => {
            window.location.replace(target.toString());
          }, 800);
        } else {
          setStatus('error');
          setMessage('This verification link is invalid or has expired. Enter your email below to receive a new one.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during email verification. Enter your email below to receive a new link.');
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail, router]);

  const handleResend = async () => {
    if (!resendEmail) {
      showError('Please enter your email address');
      return;
    }
    setResending(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      let result: { error?: string; message?: string; success?: boolean } = {};
      try {
        result = await response.json();
      } catch {
        // Non-JSON response (e.g. HTML error page) — treat as generic failure
      }
      if (response.ok) {
        showSuccess('A new verification email has been sent. Check your inbox.');
      } else if (response.status === 404) {
        showError('No account found with that email address.');
      } else if (response.status === 200 && result.message?.toLowerCase().includes('already verified')) {
        showSuccess('This email is already verified. You can log in.');
      } else {
        showError(result.error || 'Failed to send verification email');
      }
    } catch {
      showError('Failed to send verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Email Verification
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="mx-auto h-12 w-12 text-navy-600 animate-spin" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Email Verified!</h3>
                <p className="text-gray-600">{message}</p>
                <p className="text-sm text-gray-500">
                  Taking you to the dashboard...
                </p>
                <button
                  onClick={() => {
                    const target = new URL(window.location.href);
                    target.pathname = '/dashboard';
                    target.search = '?verified=1';
                    target.hash = '';
                    window.location.replace(target.toString());
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="mx-auto h-12 w-12 text-[#0E5A50]" />
                <h3 className="text-lg font-medium text-gray-900">Verification Failed</h3>
                <p className="text-gray-600">{message}</p>
                <div className="pt-2 space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50"
                  >
                    {resending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send New Verification Link'
                    )}
                  </button>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E5A50]"
                  >
                    Create New Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
