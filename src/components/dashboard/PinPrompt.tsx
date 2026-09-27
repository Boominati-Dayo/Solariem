'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ShieldCheck, X } from 'lucide-react';

interface PinPromptContextType {
  promptForPin: (description?: string) => Promise<string | null>;
}

const PinPromptContext = createContext<PinPromptContextType | undefined>(undefined);

export function usePinPrompt(): PinPromptContextType {
  const context = useContext(PinPromptContext);
  if (!context) {
    throw new Error('usePinPrompt must be used within a PinPromptProvider');
  }
  return context;
}

export function PinPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('Enter your 4-digit transaction PIN to confirm this action.');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const resolverRef = useRef<((value: string | null) => void) | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const promptForPin = useCallback((descriptionText = 'Enter your 4-digit transaction PIN to confirm this action.') => {
    return new Promise<string | null>((resolve) => {
      resolverRef.current = resolve;
      setDescription(descriptionText);
      setPin('');
      setError('');
      setShowPin(false);
      setIsOpen(true);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const close = useCallback((value: string | null) => {
    setIsOpen(false);
    resolverRef.current?.(value);
    resolverRef.current = null;
    setPin('');
    setError('');
    setIsVerifying(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pin }),
      });
      const result = await response.json();

      if (result.success) {
        close(pin);
      } else {
        setError(result.error || 'Incorrect transaction PIN. Please try again.');
        setPin('');
      }
    } catch (err) {
      console.error('PIN verification error:', err);
      setError('Could not verify PIN. Please try again.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <PinPromptContext.Provider value={{ promptForPin }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => close(null)}
              className="absolute inset-0 bg-navy-900/80 backdrop-blur-md"
            />

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 px-6 py-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">Confirm Action</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Transaction PIN required</p>
                </div>
                <button
                  type="button"
                  onClick={() => close(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 font-medium mb-5">{description}</p>

                <button
                  type="button"
                  onClick={() => inputRef.current?.focus()}
                  className="w-full flex justify-center gap-3 mb-5 cursor-text"
                >
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                        pin.length > index
                          ? 'border-primary-500 bg-primary-50 text-navy-900'
                          : 'border-gray-200 bg-gray-50 text-gray-300'
                      }`}
                    >
                      {showPin ? (pin[index] || '') : pin.length > index ? '•' : ''}
                    </div>
                  ))}
                </button>

                <input
                  ref={inputRef}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  className="absolute opacity-0 pointer-events-none"
                  style={{ left: '-9999px' }}
                  aria-label="Transaction PIN"
                />

                {error && (
                  <p className="text-center text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between mb-5">
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-navy-900 transition-colors"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPin ? 'Hide PIN' : 'Show PIN'}
                  </button>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                    <ShieldCheck className="w-4 h-4" />
                    Securely verified
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-primary-500 hover:bg-primary-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-navy-900/30 border-t-navy-900"></div>
                      Verifying...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </PinPromptContext.Provider>
  );
}
