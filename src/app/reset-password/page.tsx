'use client';

import { useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token');

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  };

  const scrollToError = () => {
    setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError('Invalid reset token');
      return;
    }

    // Validate passwords
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      scrollToError();
      return;
    }

    if (password !== confirmPassword) {
      setErrors(['Passwords do not match']);
      scrollToError();
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const success = await resetPassword(token, password);
      if (success) {
        showSuccess('Password reset successfully! You can now login with your new password.');
        router.push('/login');
      }
    } catch (error) {
      showError('Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0E5A50] hover:bg-[#0A463E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E5A50]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0E5A50]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#14130F]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-sm p-3 inline-block mb-6 border border-gray-100">
            <Lock className="h-10 w-10 text-[#0E5A50]" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Strengthen your account security with a new password
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-10 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.length > 0 && (
              <div ref={errorRef} className="bg-[#EDF2F0] border border-[#0E5A50]/20 rounded-xl p-4 transition-all animate-in fade-in slide-in-from-top-2">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-[#0A463E]">
                      Security Requirements:
                    </h3>
                    <div className="mt-2 text-sm text-[#0A463E]/80">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" title="New Password" id="new-password-label" className="block text-sm font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E5A50]/20 focus:border-[#0E5A50] transition-all bg-gray-50/50 focus:bg-white sm:text-sm pr-11"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#0E5A50] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" title="Confirm Password" id="confirm-password-label" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E5A50]/20 focus:border-[#0E5A50] transition-all bg-gray-50/50 focus:bg-white sm:text-sm pr-11"
                  placeholder="Verify your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#0E5A50] transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#14130F] hover:bg-[#1a2b4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E5A50] active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-black/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset My Password'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-sm font-semibold text-[#0E5A50] hover:text-[#0A463E] transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                Back to Secure Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
