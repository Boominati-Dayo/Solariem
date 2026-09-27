'use client';

import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Zap, CheckCircle, Users, Check } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrencyForCountry, getCurrencySymbol } from '@/lib/currencies';

const ACCOUNT_TYPES = [
  { id: 'checking', name: 'Checking Account', desc: 'Perfect for daily transactions and bill payments' },
  { id: 'savings', name: 'Savings Account', desc: 'Earn interest on your deposits' },
  { id: 'fixed_deposit', name: 'Fixed Deposit Account', desc: 'Highest interest rates for fixed terms' },
  { id: 'current', name: 'Current Account', desc: 'For everyday business transactions' },
  { id: 'crypto', name: 'Crypto Currency Account', desc: 'For digital currency management' },
  { id: 'business', name: 'Business Account', desc: 'For small to medium businesses' },
  { id: 'non_resident', name: 'Non Resident Account', desc: 'For international customers' },
  { id: 'corporate', name: 'Corporate Business Account', desc: 'For large corporations' },
];

const SignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    zip: '',
    accountType: '',
    password: '',
    confirmPassword: '',
    transactionPin: '',
    confirmPin: '',
    agreeToTerms: false,
    otherCountry: '',
    currency: 'USD',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const errorRef = useRef<HTMLDivElement>(null);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(password)) errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain at least one special character');
    return errors;
  };

  const scrollToError = () => {
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const validateStep = (step: number): string[] => {
    const stepErrors: string[] = [];

    if (step === 1) {
      if (!formData.firstName.trim()) stepErrors.push('First name is required');
      if (!formData.lastName.trim()) stepErrors.push('Last name is required');
      if (!formData.username.trim()) stepErrors.push('Username is required');
    } else if (step === 2) {
      if (!formData.email.trim()) {
        stepErrors.push('Email address is required');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        stepErrors.push('Please enter a valid email address');
      }
      if (!formData.phone.trim()) stepErrors.push('Phone number is required');
      if (!formData.country.trim()) {
        stepErrors.push('Country is required');
      } else if (formData.country === 'Other' && !formData.otherCountry.trim()) {
        stepErrors.push('Please specify your country');
      }
    } else if (step === 3) {
      if (!formData.accountType) stepErrors.push('Please select an account type');
    } else if (step === 4) {
      if (!formData.password) {
        stepErrors.push('Password is required');
      } else {
        stepErrors.push(...validatePassword(formData.password));
      }
      if (!formData.confirmPassword) {
        stepErrors.push('Please confirm your password');
      } else if (formData.password !== formData.confirmPassword) {
        stepErrors.push('Passwords do not match');
      }
      if (!formData.transactionPin) {
        stepErrors.push('Transaction PIN is required');
      } else if (!/^\d{4}$/.test(formData.transactionPin)) {
        stepErrors.push('Transaction PIN must be exactly 4 digits');
      }
      if (!formData.confirmPin) {
        stepErrors.push('Please confirm your transaction PIN');
      } else if (formData.transactionPin !== formData.confirmPin) {
        stepErrors.push('Transaction PINs do not match');
      }
      if (!formData.agreeToTerms) {
        stepErrors.push('You must agree to the Terms of Service and Privacy Policy');
      }
    }

    return stepErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      const stepErrors = validateStep(currentStep);
      if (stepErrors.length > 0) {
        setErrors(stepErrors);
        scrollToError();
        setIsLoading(false);
        return;
      }

      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
        setIsLoading(false);
        return;
      }

      const pin = formData.transactionPin;

      // Combine otherCountry if 'Other' is selected
      const finalCountry = formData.country === 'Other' ? formData.otherCountry : formData.country;
      const signupData = { ...formData, country: finalCountry, transactionPin: pin, currency: formData.currency || 'USD' };

      const success = await register(signupData);
      if (success) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors(['Registration failed. Please try again.']);
      scrollToError();
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Personal Information";
      case 2: return "Contact Information";
      case 3: return "Account Setup";
      case 4: return "Security Details";
      default: return "";
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="flex max-w-6xl w-full mx-auto shadow-2xl rounded-lg overflow-hidden">
        {/* Left Column - Signup Form */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 md:p-10 h-full flex flex-col justify-center"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Create your Solariem account</p>

              {/* Step Indicator */}
              <div className="flex items-center justify-center mt-6 mb-4">
                <div className="flex items-center space-x-2 md:space-x-4">
                  {[1, 2, 3, 4].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${currentStep === step ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' :
                          currentStep > step ? 'bg-navy-900 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {currentStep > step ? <Check className="w-4 h-4" /> : step}
                      </div>
                      {index < 3 && (
                        <div className={`w-8 md:w-12 h-1 mx-2 md:mx-4 rounded ${currentStep > step ? 'bg-navy-900' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm font-semibold text-primary-600 uppercase tracking-widest mt-4">
                Step {currentStep}: {getStepTitle()}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.length > 0 && (
                <div ref={errorRef} className="bg-primary-50 border border-primary-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-primary-600">Please fix the following errors:</h3>
                      <div className="mt-2 text-sm text-primary-600">
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

              {/* STEP 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Legal First Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name (Optional)</label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="David"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Legal Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="johnsmith123"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Contact Information */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="john.smith@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+1 (234) 567-8901"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <select
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        country: e.target.value,
                        currency: e.target.value === 'Other' ? 'USD' : getCurrencyForCountry(e.target.value),
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select your country</option>
                      <option value="AU">Australia</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                      <option value="NL">Netherlands</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {formData.country && (
                    <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-lg px-4 py-3">
                      <span className="text-sm font-medium text-primary-700">Account Currency</span>
                      <span className="text-sm font-bold text-navy-900">{formData.currency} ({getCurrencySymbol(formData.currency)})</span>
                    </div>
                  )}
                  {formData.country === 'Other' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Please specify your country *</label>
                      <input
                        type="text"
                        required
                        value={formData.otherCountry}
                        onChange={(e) => setFormData({ ...formData, otherCountry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your country"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* STEP 3: Account Setup */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Account Type *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1 pr-2">
                      {ACCOUNT_TYPES.map((acc) => (
                        <div
                          key={acc.id}
                          onClick={() => setFormData({ ...formData, accountType: acc.id })}
                          className={`cursor-pointer border rounded-lg p-4 transition-all ${formData.accountType === acc.id
                              ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-navy-900 text-sm">{acc.name}</span>
                            {formData.accountType === acc.id && <CheckCircle className="w-5 h-5 text-primary-500" />}
                          </div>
                          <p className="text-xs text-gray-500">{acc.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* STEP 4: Security */}
              {currentStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction PIN *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={formData.transactionPin}
                        onChange={(e) => setFormData({ ...formData, transactionPin: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent tracking-[0.5em] text-center"
                        placeholder="••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      You will use this PIN to confirm transfers, withdrawals, and other money-motion actions.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Transaction PIN *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={formData.confirmPin}
                        onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent tracking-[0.5em] text-center"
                        placeholder="••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start mt-4">
                    <input
                      type="checkbox"
                      required
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      I agree to the <LinkButton onClick={() => router.push('/terms')}>Terms of Service</LinkButton> and <LinkButton onClick={() => router.push('/privacy')}>Privacy Policy</LinkButton>.
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex space-x-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </button>
                )}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-[2] flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-primary-500 hover:bg-primary-400 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy-900"></div>
                  ) : (
                    <>
                      {currentStep < 4 ? 'Continue' : 'Create Account'}
                      {currentStep < 4 && <ArrowRight className="ml-2 h-5 w-5" />}
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-navy-900 hover:text-primary-500 font-bold transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Promotional Content */}
        <div className="hidden lg:flex lg:flex-1 bg-white">
          <div className="w-full p-8 flex flex-col justify-center space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Global Private <span className="text-navy-600">Banking</span>
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Join thousands of clients worldwide who trust Solariem with their banking and asset recovery needs.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-50 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Bank-Grade Security</h4>
                    <p className="text-gray-600">AES-256 encryption and multi-factor authentication protect your assets 24/7.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-50 p-2 rounded-lg">
                    <Zap className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Instant Access</h4>
                    <p className="text-gray-600">Your custom dashboard is provisioned immediately upon verification.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary-50 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Dedicated Advisors</h4>
                    <p className="text-gray-600">Private wealth managers are assigned to assist with large transfers.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for terms/privacy links to avoid nested <button> tags inside labels
const LinkButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
  <span
    onClick={onClick}
    className="text-primary-600 hover:text-primary-500 font-bold cursor-pointer underline decoration-primary-500/30 underline-offset-2"
  >
    {children}
  </span>
);

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div></div>}>
      <SignupForm />
    </Suspense>
  );
}
