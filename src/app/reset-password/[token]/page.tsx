'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ResetPasswordTokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

const ResetPasswordTokenPage = ({ params }: ResetPasswordTokenPageProps) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [step, setStep] = useState<'validating' | 'form' | 'success' | 'error'>('validating');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/auth/validate-reset-token?token=${resolvedParams.token}`);
        const data = await response.json();

        if (response.ok) {
          setStep('form');
        } else {
          setStep('error');
          setMessage({
            type: 'error',
            text: data.error || 'Invalid or expired reset token.'
          });
        }
      } catch (error) {
        setStep('error');
        setMessage({
          type: 'error',
          text: 'Network error. Please try again.'
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    // Validate password requirements
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setMessage({
        type: 'error',
        text: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const resolvedParams = await params;
      const response = await fetch('/api/auth/confirm-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        setMessage({
          type: 'success',
          text: 'Your password has been successfully reset!'
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to reset password. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'validating') {
    return (
      <div className="min-h-screen bg-[#14130F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#0E5A50] animate-spin mx-auto mb-4" />
          <p className="text-white/70 font-medium">Securing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0E5A50]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#14130F]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center text-gray-500 hover:text-[#0E5A50] transition-colors mb-8 font-semibold text-sm group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Secure Login
          </button>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-[#0E5A50]" />
          </div>

          <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {step === 'success' ? 'Security Updated' : 'New Credentials'}
          </h2>
          <p className="text-gray-600 font-medium">
            {step === 'success'
              ? 'Your account is now secured with your new password.'
              : 'Enter a strong, unique password for your account.'
            }
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-10 shadow-2xl shadow-black/5 border border-gray-100"
        >
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" title="New Password" id="new-password-label" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E5A50]/20 focus:border-[#0E5A50] transition-all"
                    placeholder="Create new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#0E5A50]" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-[#0E5A50]" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" title="Confirm Password" id="confirm-password-label" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E5A50]/20 focus:border-[#0E5A50] transition-all"
                    placeholder="Verify new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#0E5A50]" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-[#0E5A50]" />
                    )}
                  </button>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'error'
                  ? 'bg-[#EDF2F0] border border-[#0E5A50]/30 text-[#0A463E]'
                  : 'bg-green-50 border border-green-200 text-green-700'
                  }`}>
                  {message.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#14130F] hover:bg-[#1a2b4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E5A50] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-black/10"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 text-white mr-3" />
                    Updating Security...
                  </div>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-8 py-4">
              <div className="bg-green-50 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto border border-green-100">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Password Updated
                </h3>
                <p className="text-gray-500 font-medium">
                  Your identity has been verified and your new password is active.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#0E5A50] hover:bg-[#0A463E] transition-all active:scale-[0.98] shadow-[#0E5A50]/20"
              >
                Sign In to Dashboard
              </Link>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-8 py-4">
              <div className="bg-[#EDF2F0] rounded-3xl w-24 h-24 flex items-center justify-center mx-auto border border-[#0E5A50]/20">
                <AlertCircle className="w-12 h-12 text-[#0E5A50]" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  Link Expired
                </h3>
                <p className="text-gray-500 font-medium">
                  {message.text}
                </p>
              </div>

              <div className="space-y-4">
                <Link
                  href="/reset-password"
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#14130F] hover:bg-[#1a2b4a] transition-all active:scale-[0.98]"
                >
                  Request New Link
                </Link>
                <Link
                  href="/login"
                  className="block text-sm font-bold text-[#0E5A50] hover:text-[#0A463E] transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordTokenPage;



