'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Mail, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

const ProtectedRoute = ({ children, requireEmailVerification = false }: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect unauthenticated users to login page
        router.push('/login');
        return;
      }

      if (requireEmailVerification && !user.emailVerified) {
        // Redirect to email activation if verification is required
        router.push('/activate-email');
        return;
      }
    }
  }, [user, loading, router, requireEmailVerification]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-[#0E5A50] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // Show email verification warning if user is not verified
  if (requireEmailVerification && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verification Required
          </h2>

          <p className="text-gray-600 mb-6">
            Please verify your email address to access this feature.
            Check your inbox for a verification link.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/activate-email')}
              className="w-full bg-[#0E5A50] hover:bg-[#0A463E] text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
            >
              Verify Email Address
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;













