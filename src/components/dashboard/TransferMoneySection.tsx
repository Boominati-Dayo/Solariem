'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { getCurrencySymbol } from '@/lib/currencies';
import { ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { usePinPrompt } from './PinPrompt';

const TransferMoneySection = () => {
  const { userProfile, refreshUser } = useAuth();
  const { promptForPin } = usePinPrompt();
  const currencyCode = userProfile?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currencyCode);
  const [currentStep, setCurrentStep] = useState(1);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [receiverUserCode, setReceiverUserCode] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [receiverValid, setReceiverValid] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Track the last validated combination to avoid re-validating
  const lastValidatedRef = useRef({ email: '', code: '' });

  const validateReceiver = useCallback(async () => {
    // Prevent multiple simultaneous validations
    if (isValidating) return false;

    // Check user code length first
    if (receiverUserCode.length !== 8) {
      setValidationError('User code must be exactly 8 characters');
      setReceiverValid(false);
      setIsValidating(false);
      return false;
    }

    if (!receiverEmail || !receiverUserCode) {
      setValidationError('Please enter both email and user code');
      setReceiverValid(false);
      return false;
    }

    setIsValidating(true);
    setError('');
    setValidationError('');

    try {
      // Check if user exists with matching email and user code using MongoDB API
      const response = await fetch('/api/users/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: receiverEmail,
          userCode: receiverUserCode
        })
      });

      const result = await response.json();

      if (!result.success) {
        setValidationError(result.error || 'Email and user code do not match. Please verify the details.');
        setReceiverValid(false);
        setIsValidating(false);
        return false;
      }

      setReceiverValid(true);
      setValidationError('');
      setIsValidating(false);
      lastValidatedRef.current = { email: receiverEmail, code: receiverUserCode };
      return true;
    } catch (error) {
      console.error('Error validating receiver:', error);
      setValidationError('Error validating receiver. Please try again.');
      setIsValidating(false);
      return false;
    }
  }, [receiverEmail, receiverUserCode]);

  // Removed auto-validation useEffect to reduce API hits

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiverValid) {
      setError('Please validate the receiver first');
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) < 500 || parseFloat(transferAmount) > 10000) {
      setError(`Please enter a valid transfer amount between ${currencySymbol}500 and ${currencySymbol}10,000`);
      return;
    }

    const pin = await promptForPin(`Enter your transaction PIN to confirm the transfer of ${currencySymbol}${parseFloat(transferAmount).toLocaleString()} to ${receiverEmail}.`);
    if (!pin) return;

    setIsTransferring(true);
    setError('');

    try {
      // Here you would make the actual transfer API call
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverEmail,
          receiverUserCode,
          amount: parseFloat(transferAmount),
          pin
        })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Transfer failed. Please try again.');
        return;
      }

      // Success - show success message and reset form
      showSuccess('Transfer completed successfully!');
      await refreshUser();


      // Reset form
      setReceiverEmail('');
      setReceiverUserCode('');
      setTransferAmount('');
      setError('');
      setReceiverValid(false);
      setCurrentStep(1);
      lastValidatedRef.current = { email: '', code: '' };

    } catch (error) {
      console.error('Transfer error:', error);
      setError('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const transferFee = 2; // 2% fee
  const feeAmount = parseFloat(transferAmount) * (transferFee / 100);
  const totalAmount = parseFloat(transferAmount) + feeAmount;

  const handleNext = async () => {
    // Check if basic requirements are met
    if (!receiverEmail || receiverUserCode.length !== 8) {
      setValidationError('Please enter a valid email and 8-character user code');
      return;
    }

    // Check if we already validated this exact combination
    if (receiverValid && 
        receiverEmail === lastValidatedRef.current.email && 
        receiverUserCode === lastValidatedRef.current.code) {
      setCurrentStep(2);
      return;
    }

    // Perform validation
    const isValid = await validateReceiver();
    if (isValid) {
      setCurrentStep(2);
      setError('');
      setValidationError('');
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setTransferAmount('');
  };

  return (
    <div className="space-y-4 mobile:space-y-6">
      {/* KYC Verification Warning */}
      {userProfile?.kycStatus !== 'verified' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-bold text-orange-800 mb-2">
                KYC Verification Required
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                To ensure the security of your transactions and comply with financial regulations, you must complete your identity verification before sending money.
              </p>
              <div className="flex items-center space-x-4">
                {userProfile?.kycStatus === 'pending' ? (
                  <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-xl font-bold flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Verification Pending Review</span>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-navy-900 border-b-2 border-primary-500 pb-1">
                    Please complete Identity Verification via the sidebar
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white rounded-lg shadow-sm p-4 mobile:p-6 ${userProfile?.kycStatus !== 'verified' ? 'opacity-50 pointer-events-none' : ''}`}>
        <p className="text-sm mobile:text-base text-gray-600 mb-4 mobile:mb-6">
          Transfer money to other users using their email and unique user code. Enter the recipient details and amount.
        </p>

        <div className="mb-4 mobile:mb-6 p-3.5 mobile:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs mobile:text-sm text-gray-600">Available Balance (Transferable)</p>
          <p className="text-xl mobile:text-2xl font-bold text-gray-900">
            {currencySymbol}{(userProfile?.balances?.main || 0).toFixed(2)} {currencyCode}
          </p>
          <p className="text-[10px] mobile:text-xs text-gray-500 mt-0.5 mobile:mt-1">
            Referral credit is accrued separately and cannot be transferred
          </p>
        </div>

        {/* Step 1: Receiver Details */}
        {currentStep === 1 && (
          <div className="space-y-4 mobile:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receiver Email
              </label>
              <input
                type="email"
                className={`w-full px-4 py-2.5 mobile:py-3 border rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent text-sm mobile:text-base ${receiverValid ? 'border-green-300 bg-green-50' :
                  error && receiverEmail ? 'border-red-300 bg-[#EDF2F0]' :
                    'border-gray-300'
                  }`}
                placeholder="receiver@example.com"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                disabled={isValidating || receiverValid}
                required
              />
              {isValidating && (
                <p className="text-sm text-blue-600 mt-2">✓ Checking and validating...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receiver User Code
              </label>
              <input
                type="text"
                className={`w-full px-4 py-2.5 mobile:py-3 border rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent transition-colors text-sm mobile:text-base ${receiverValid ? 'border-green-500 bg-green-50' :
                  validationError && receiverUserCode.length === 8 ? 'border-[#0E5A50] bg-[#EDF2F0]' :
                    receiverUserCode.length > 0 && receiverUserCode.length !== 8 ? 'border-orange-300 bg-orange-50' :
                      'border-gray-300'
                  }`}
                placeholder="ABC12345"
                value={receiverUserCode}
                onChange={(e) => setReceiverUserCode(e.target.value.toUpperCase())}
                minLength={8}
                maxLength={8}
                disabled={isValidating || receiverValid}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Ask the receiver for their unique user code (8 characters)
              </p>
              {receiverUserCode.length > 0 && receiverUserCode.length !== 8 && !receiverValid && (
                <p className="text-sm text-orange-600 mt-1">
                  User code must be exactly 8 characters (currently {receiverUserCode.length})
                </p>
              )}
              {validationError && (
                <p className="text-sm text-[#0E5A50] mt-1">{validationError}</p>
              )}
              {receiverValid && (
                <p className="text-sm text-green-600 mt-1">✓ Validated successfully!</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-[#EDF2F0] border border-red-200 rounded-lg">
                <p className="text-[#0A463E] text-sm">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!receiverEmail || receiverUserCode.length !== 8 || isValidating || userProfile?.kycStatus !== 'verified'}
              className="w-full bg-[#14130F] hover:bg-[#232220] disabled:bg-gray-400 disabled:cursor-not-allowed text-primary-500 py-2.5 mobile:py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center text-sm mobile:text-base border border-primary-500/20"
            >
              {isValidating ? 'Validating Receiver...' : 'Next: Enter Amount →'}
            </button>
          </div>
        )}

        {/* Step 2: Transfer Amount */}
        {currentStep === 2 && (
          <div className="space-y-4 mobile:space-y-6">
            <div className="flex items-center justify-between mb-3 mobile:mb-4">
              <p className="text-xs mobile:text-sm font-medium text-gray-700">Receiver Details (Verified)</p>
              <button
                type="button"
                onClick={handleBack}
                className="text-xs mobile:text-sm text-blue-600 hover:text-blue-800"
              >
                Change
              </button>
            </div>

            <div className="p-3.5 mobile:p-4 bg-green-50 border border-green-200 rounded-lg mb-4 mobile:mb-6">
              <div className="flex items-center space-x-2 mb-1.5 mobile:mb-2">
                <span className="text-xs mobile:text-sm font-semibold text-green-900">Receiver Email:</span>
                <span className="text-xs mobile:text-sm text-green-800">{receiverEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs mobile:text-sm font-semibold text-green-900">User Code:</span>
                <span className="text-xs mobile:text-sm text-green-800">{receiverUserCode}</span>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4 mobile:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Amount
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent text-sm mobile:text-base"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  min="500"
                  step="0.01"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-[#EDF2F0] border border-red-200 rounded-lg">
                  <p className="text-[#0A463E] text-sm">{error}</p>
                </div>
              )}

              {transferAmount && (
                <div className="p-3.5 mobile:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm mobile:text-base font-semibold text-blue-900 mb-2">Transfer Summary</h4>
                  <div className="space-y-1 text-xs mobile:text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Transfer Amount:</span>
                      <span className="font-semibold">{currencySymbol}{parseFloat(transferAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer Fee ({transferFee}%):</span>
                      <span className="font-semibold">{currencySymbol}{feeAmount.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Deducted:</span>
                      <span>{currencySymbol}{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3.5 mobile:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs mobile:text-sm text-yellow-800">
                  <strong>Transfer Charge:</strong> {transferFee}%
                </p>
                <p className="text-xs mobile:text-sm text-yellow-800 mt-1">
                  <strong>Min Transfer Amount:</strong> 500 {currencyCode}
                </p>
                <p className="text-xs mobile:text-sm text-yellow-800">
                  <strong>Max Transfer Amount:</strong> 10000 {currencyCode}
                </p>
              </div>

              <div className="flex space-x-3 mobile:space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 mobile:py-3 px-6 rounded-lg font-semibold transition-colors duration-200 text-sm mobile:text-base"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={!transferAmount || parseFloat(transferAmount) < 500 || parseFloat(transferAmount) > 10000 || isTransferring || userProfile?.kycStatus !== 'verified'}
                  className="flex-1 bg-[#14130F] hover:bg-[#232220] disabled:bg-gray-400 disabled:cursor-not-allowed text-primary-500 py-2.5 mobile:py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center text-sm mobile:text-base border border-primary-500/20"
                >
                  {isTransferring ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 mobile:h-5 mobile:w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    'Transfer Money'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferMoneySection;
