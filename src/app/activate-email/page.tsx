'use client';

import { motion } from 'framer-motion';
import { Mail, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ActivateEmailPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from URL params, localStorage, or Firebase user
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');

    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      // Fallback to localStorage if no URL param
      const storedEmail = localStorage.getItem('signupEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      // Use custom email verification instead of Firebase
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setCountdown(60); // 60 second cooldown
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Failed to resend email:', error);
      // You could add error state handling here if needed
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckActivation = () => {
    // Check if user's email is verified
    if (user?.emailVerified) {
      // Redirect to login with success message
      window.location.href = '/login?activated=true&email=' + encodeURIComponent(email);
    } else {
      // Refresh user data to check verification status
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14130F] via-[#232220] to-[#14130F]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-navy-900">
              Solariem
            </Link>
            {!user && (
              <Link
                href="/login"
                className="text-gray-700 hover:text-navy-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Back to Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center mb-6"
            >
              <Mail className="w-10 h-10 text-navy-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Activate Your Account
            </h1>
            <p className="text-gray-300 text-lg">
              We&apos;ve sent a verification link to your email
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-gray-700 font-medium">Check Your Email</span>
              </div>

              {email && (
                <p className="text-gray-600 mb-4">
                  We sent an activation link to:
                  <br />
                  <span className="font-semibold text-gray-900">{email}</span>
                </p>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-blue-800 font-medium mb-1">Next Steps:</p>
                    <ol className="text-blue-700 text-sm space-y-1">
                      <li>1. Check your email inbox (and spam folder)</li>
                      <li>2. Click the activation link in the email</li>
                      <li>3. Return here to complete your registration</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCheckActivation}
                className="w-full bg-navy-600 hover:bg-navy-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                I&apos;ve Activated My Email
              </button>

              <div className="text-center">
                <p className="text-gray-600 text-sm mb-3">
                  Didn&apos;t receive the email?
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || countdown > 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${countdown > 0 || isResending
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Activation Email
                    </>
                  )}
                </button>
              </div>

              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center"
                >
                  <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                  Activation email sent successfully!
                </motion.div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Need help?{' '}
                <Link href="/contact" className="text-navy-600 hover:text-navy-700 font-medium">
                  Contact Support
                </Link>
              </p>
            </div>
          </motion.div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              By activating your account, you agree to our{' '}
              <Link href="/terms" className="text-red-400 hover:text-red-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-red-400 hover:text-red-300">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivateEmailPage;
