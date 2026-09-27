'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Shield,
  Globe,
  Zap,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { getCurrencySymbol } from '@/lib/currencies';
import { usePinPrompt } from './PinPrompt';

const VirtualCardsSection = () => {
  const { userProfile, refreshUser } = useAuth();
  const { promptForPin } = usePinPrompt();
  const currencyCode = userProfile?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currencyCode);
  const [view, setView] = useState<'overview' | 'apply'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [topUpModalCard, setTopUpModalCard] = useState<any | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('50');
  const [isToppingUp, setIsToppingUp] = useState(false);

  // Card Data State
  const [cards, setCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});

  // Form State
  const [cardType, setCardType] = useState<'Visa' | 'Mastercard' | 'American Express'>('Visa');
  const [cardLevel, setCardLevel] = useState('');
  const [currency, setCurrency] = useState(currencyCode);
  const [spendLimit, setSpendLimit] = useState('1000');
  const [cardholderName, setCardholderName] = useState(`${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim());
  const [billingAddress, setBillingAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const cardLevels = [
    { id: 'standard', name: 'Standard', fee: 5, limit: '1,000 - 2,500' },
    { id: 'gold', name: 'Gold', fee: 15, limit: '2,500 - 5,000' },
    { id: 'platinum', name: 'Platinum', fee: 25, limit: '5,000 - 10,000' },
    { id: 'black', name: 'Black', fee: 50, limit: '10,000 - 50,000' },
  ];

  const faqs = [
    {
      q: "What is a virtual card?",
      a: "A virtual card is a digital-only version of a traditional credit card. It's specifically designed for secure online payments, providing you with a card number, expiry date, and CVV without a physical card."
    },
    {
      q: "How soon can I use it?",
      a: "Once your application is approved by our team, your card is generated instantly. You can access its details from your dashboard and start using it for online purchases immediately."
    },
    {
      q: "Is it safe to use online?",
      a: "Absolutely. Virtual cards offer an extra layer of security for your main account. You can set specific spending limits and easily freeze or cancel the card if you suspect any unauthorised activity."
    },
    {
      q: "Where is the card accepted?",
      a: "Our virtual cards are accepted globally at millions of online merchants where Visa, Mastercard, or American Express are supported."
    },
    {
      q: "Can I manage my subscriptions?",
      a: "Yes, virtual cards are perfect for recurring payments. You can monitor all transactions in real-time and maintain full control over your subscription spending."
    }
  ];

  const fetchCards = async () => {
    setLoadingCards(true);
    try {
      const response = await fetch('/api/cards');
      const result = await response.json();
      if (result.success) {
        setCards(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch cards');
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const toggleReveal = (cardId: string) => {
    setRevealedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardLevel || !agreeTerms) {
      showError('Please select a card level and agree to the terms.');
      return;
    }

    const selectedLevel = cardLevels.find(l => l.id === cardLevel);
    if (userProfile && (userProfile.balances?.main || 0) < (selectedLevel?.fee || 0)) {
      showError('Insufficient balance to cover the card issuance fee.');
      return;
    }

    const pin = await promptForPin(`Enter your transaction PIN to apply for the ${selectedLevel?.name || ''} card. A ${currencySymbol}${selectedLevel?.fee || 0} issuance fee will be deducted.`);
    if (!pin) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardType,
          cardLevel,
          currency,
          spendLimit: parseFloat(spendLimit),
          cardholderName,
          billingAddress,
          pin
        })
      });

      const result = await response.json();
      if (result.success) {
        showSuccess('Card application submitted successfully!');
        setView('overview');
        fetchCards();
        await refreshUser();
      } else {
        showError(result.error || 'Failed to apply for card');
      }
    } catch (error) {
      showError('An error occurred during application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpModalCard || !topUpAmount || parseFloat(topUpAmount) <= 0) return;

    if (userProfile && (userProfile.balances?.main || 0) < parseFloat(topUpAmount)) {
      showError('Insufficient main balance.');
      return;
    }

    const pin = await promptForPin(`Enter your transaction PIN to top up ${topUpModalCard.cardholderName || 'your card'} with ${currencySymbol}${parseFloat(topUpAmount).toLocaleString()}.`);
    if (!pin) return;

    setIsToppingUp(true);
    try {
      const response = await fetch('/api/cards/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: topUpModalCard._id,
          amount: parseFloat(topUpAmount),
          pin
        })
      });

      const result = await response.json();
      if (result.success) {
        showSuccess('Top-up request submitted for approval.');
        setTopUpModalCard(null);
        setTopUpAmount('50');
        await refreshUser();
        fetchCards();
      } else {
        showError(result.error || 'Top-up failed');
      }
    } catch (error) {
      showError('An error occurred.');
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="px-0 py-4 mobile:px-6 mobile:py-6">
      <AnimatePresence mode="wait">
        {view === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Hero Header */}
            <div className="bg-[#14130F] rounded-2xl mobile:rounded-3xl p-4 mobile:p-6 mobile:p-8 text-white relative overflow-hidden border border-primary-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-4 mobile:gap-8">
                <div className="max-w-xl text-center lg:text-left">
                  <h2 className="text-xl mobile:text-3xl font-bold mb-2 mobile:mb-4">Virtual Cards Made Easy</h2>
                  <p className="text-gray-400 mb-4 mobile:mb-6 leading-relaxed text-xs mobile:text-base">
                    Create virtual cards for secure online payments, subscription management, and more. Our virtual cards offer enhanced security and control over your spending.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-primary-500">
                      <Shield className="w-4 h-4" /> <span>Secure Payments</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-primary-500">
                      <Globe className="w-4 h-4" /> <span>Global Acceptance</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-primary-500">
                      <Zap className="w-4 h-4" /> <span>Instant Issuance</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-primary-500">
                      <CheckCircle className="w-4 h-4" /> <span>Spending Controls</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('apply')}
                    className="w-full mobile:w-auto px-6 mobile:px-8 py-2.5 mobile:py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20 text-sm mobile:text-base"
                  >
                    Apply Now
                  </button>
                </div>
                <div className="relative group w-full mobile:w-auto flex justify-center">
                  <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-white/20 rounded-2xl p-4 mobile:p-6 w-full max-w-[320px] aspect-[1.58/1] shadow-2xl relative transition-transform group-hover:scale-105">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary-500" />
                      </div>
                      <span className="text-xs font-bold tracking-widest text-primary-500">VIRTUAL</span>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xl font-mono tracking-[0.2em] text-white">•••• •••• •••• 1234</p>
                      <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                          <p className="text-[6px] text-gray-400 uppercase tracking-widest leading-none">Card Holder</p>
                          <p className="text-xs font-semibold tracking-wide uppercase">{userProfile?.firstName || 'YOUR NAME'}</p>
                        </div>
                        <div>
                          <p className="text-[6px] text-gray-400 uppercase tracking-widest leading-none text-right">EXP</p>
                          <p className="text-xs font-mono">12/25</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mobile:gap-6">
              <div className="bg-white p-4 mobile:p-6 rounded-xl mobile:rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Applications</p>
                <p className="text-base mobile:text-3xl font-black text-navy-900">{cards.filter(c => c.status === 'pending').length}</p>
              </div>
              <div className="bg-white p-4 mobile:p-6 rounded-xl mobile:rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active Cards</p>
                <p className="text-base mobile:text-3xl font-black text-navy-900">{cards.filter(c => c.status === 'approved').length}</p>
              </div>
              <div className="bg-white p-4 mobile:p-6 rounded-xl mobile:rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Card Balance</p>
                <p className="text-base mobile:text-3xl font-black text-navy-900">{currencySymbol}{(cards.filter(c => c.status === 'approved').reduce((acc, c) => acc + (c.balance || 0), 0)).toFixed(2)}</p>
              </div>
            </div>

            {/* Cards List */}
            <div className="space-y-4 mobile:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg mobile:text-xl font-bold text-navy-900">Your Cards</h3>
                <button
                  onClick={() => setView('apply')}
                  className="flex items-center space-x-2 text-primary-600 font-bold hover:text-primary-500 transition-colors"
                >
                  <Plus className="w-4 h-4" /> <span className="text-xs mobile:text-base">New Card</span>
                </button>
              </div>

              {loadingCards ? (
                <div className="py-20 flex justify-center">
                  <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : cards.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {cards.map((card) => (
                    <div key={card._id} className="group relative">
                      <div className={`relative bg-gradient-to-br transition-all duration-500 ${card.cardLevel === 'black' ? 'from-gray-800 to-black' : card.cardLevel === 'platinum' ? 'from-gray-300 to-gray-500' : card.cardLevel === 'gold' ? 'from-primary-400 to-primary-600' : 'from-navy-800 to-navy-900'} rounded-3xl p-6 mobile:p-8 aspect-[1.58/1] shadow-xl overflow-hidden text-white flex flex-col justify-between border border-white/10`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                        <div className="flex justify-between items-start relative z-10">
                          <div className="w-8 h-8 flex-col rounded-lg flex items-start">
                            <p className="text-[8px] font-black tracking-widest opacity-60">VIRTUAL</p>
                            <p className={`text-xs font-black uppercase tracking-widest ${card.cardLevel === 'gold' ? 'text-navy-900' : 'text-primary-500'}`}>{card.cardLevel}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] opacity-60 uppercase tracking-widest leading-none mb-1">Balance</p>
                            <p className={`text-base font-black font-mono ${(card.cardLevel === 'platinum' || card.cardLevel === 'standard') ? 'text-white' : (card.cardLevel === 'gold' ? 'text-navy-900' : 'text-primary-500')}`}>
                              {currencySymbol}{(card.balance || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 space-y-6">
                          <div>
                            {card.status === 'approved' ? (
                              <div className="space-y-1">
                                <p className="text-lg mobile:text-2xl font-mono tracking-[0.2em] flex items-center">
                                  {revealedCards[card._id] ? (
                                    card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()
                                  ) : (
                                    `•••• •••• •••• ${card.lastFour}`
                                  )}
                                </p>
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <p className="text-[8px] opacity-60 uppercase tracking-widest">Valid Thru</p>
                                    <p className="text-sm font-mono">{card.expiry}</p>
                                  </div>
                                  <div>
                                    <p className="text-[8px] opacity-60 uppercase tracking-widest">CVV</p>
                                    <p className="text-sm font-mono">{revealedCards[card._id] ? card.cvv : '•••'}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="py-4 px-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center space-x-3">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Application {card.status}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[8px] opacity-60 uppercase tracking-widest mb-1">Card Holder</p>
                              <p className="text-sm font-black uppercase tracking-widest">{card.cardholderName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] opacity-60 uppercase tracking-widest mb-1">Network</p>
                              <p className="text-sm font-black uppercase tracking-widest">{card.cardType}</p>
                            </div>
                          </div>
                        </div>

                        {card.status === 'approved' && (
                          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                            <button
                              onClick={() => toggleReveal(card._id)}
                              className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                              {revealedCards[card._id] ? 'Hide' : 'Reveal'}
                            </button>
                            <button
                              onClick={() => setTopUpModalCard(card)}
                              className="px-5 py-2.5 bg-white text-navy-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                              Add Funds
                            </button>
                          </div>
                        )}
                      </div>

                      {card.status === 'rejected' && (
                        <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-3">
                          <Info className="w-5 h-5 text-red-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-1">Decline Reason</p>
                            <p className="text-xs text-red-600 leading-relaxed font-medium">{card.rejectionReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 text-center py-8 mobile:py-12 bg-white rounded-2xl mobile:rounded-3xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 mobile:w-16 mobile:h-16 bg-navy-50 text-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 mobile:w-8 mobile:h-8" />
                  </div>
                  <h3 className="text-lg mobile:text-xl font-bold text-navy-900">No cards yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-4 mobile:mb-8 text-xs mobile:text-sm px-4">You haven't applied for any virtual cards yet. Apply for a new card to get started with secure online payments.</p>
                  <button
                    onClick={() => setView('apply')}
                    className="px-6 py-2.5 bg-navy-900 text-navy-50 rounded-xl font-bold hover:bg-navy-800 transition-colors"
                  >
                    Apply for Card
                  </button>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-navy-900">How Virtual Cards Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: 1, name: 'Apply', desc: 'Complete the application form for your virtual card. Select your preferred card type and set your spending limits.' },
                  { step: 2, name: 'Activate', desc: 'Once approved, your virtual card will be ready to use. View the card details and activate it from your dashboard.' },
                  { step: 3, name: 'Use', desc: 'Use your virtual card for online transactions anywhere major credit cards are accepted. Monitor transactions in real-time.' },
                ].map(s => (
                  <div key={s.step} className="bg-white p-8 rounded-2xl border border-gray-100 relative shadow-sm h-full">
                    <span className="absolute top-4 right-4 text-6xl font-black text-primary-500/10">{s.step}</span>
                    <h4 className="text-lg font-bold text-navy-900 mb-3">{s.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="space-y-4 mobile:space-y-6">
              <h3 className="text-lg mobile:text-2xl font-bold text-navy-900">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {faqs.map((f, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-bold text-sm mobile:text-base text-navy-900">{f.q}</span>
                      {openFaq === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 text-xs mobile:text-sm text-gray-500 leading-relaxed"
                        >
                          {f.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="apply"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <button
              onClick={() => setView('overview')}
              className="flex items-center text-primary-600 font-bold hover:-translate-x-1 transition-transform mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cards
            </button>

            <div className="bg-white rounded-2xl mobile:rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="bg-navy-900 p-5 mobile:p-8 text-white relative h-36 mobile:h-48 flex items-end">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                <div className="relative z-10">
                  <h2 className="text-xl mobile:text-3xl font-bold mb-1 mobile:mb-2">Apply for a Virtual Card</h2>
                  <p className="text-gray-400 text-xs mobile:text-sm">Get instant access to a virtual card for online payments and subscriptions</p>
                </div>
                <div className="absolute -bottom-10 right-8 transform rotate-12 hidden md:block">
                  <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-white/20 rounded-xl p-4 w-64 aspect-[1.58/1] shadow-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-8 h-6 bg-primary-500/20 rounded-md"></div>
                      <div className="w-10 h-6 bg-primary-500/10 rounded-sm"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 w-40 bg-white/10 rounded"></div>
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <div className="h-2 w-12 bg-white/5 rounded"></div>
                          <div className="h-2 w-20 bg-white/10 rounded"></div>
                        </div>
                        <div className="h-4 w-4 bg-primary-500/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleApply} className="p-4 mobile:p-8 lg:p-12 space-y-6 mobile:space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Column 1: Card Selection */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-navy-50 text-navy-600 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                        Card Selection
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Card Type</label>
                          <div className="grid grid-cols-3 gap-3">
                            {['Visa', 'Mastercard', 'American Express'].map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setCardType(type as any)}
                                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${cardType === type ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                              >
                                <span className={`text-[10px] font-black tracking-tighter ${cardType === type ? 'text-primary-600' : 'text-gray-400'}`}>{type.toUpperCase()}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Card Level *</label>
                          <div className="grid grid-cols-2 gap-3">
                            {cardLevels.map(level => (
                              <button
                                key={level.id}
                                type="button"
                                onClick={() => setCardLevel(level.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left group ${cardLevel === level.id ? 'border-navy-900 bg-navy-50' : 'border-gray-100 hover:border-gray-200'}`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-navy-900">{level.name}</span>
                                  <span className="text-xs font-bold text-primary-600">{currencySymbol}{level.fee}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Limit: {level.limit}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Currency</label>
                            <select
                              value={currency}
                              onChange={(e) => setCurrency(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 text-sm font-semibold"
                            >
                              <option value={currencyCode}>{currencyCode} - {currencyCode === 'USD' ? 'US Dollar' : currencyCode === 'EUR' ? 'Euro' : currencyCode === 'GBP' ? 'British Pound' : currencyCode === 'AUD' ? 'Australian Dollar' : currencyCode === 'CAD' ? 'Canadian Dollar' : currencyCode}</option>
                              {!['USD', 'EUR', 'GBP', 'AUD', 'CAD'].includes(currencyCode) && (
                                <>
                                  <option value="USD">USD - US Dollar</option>
                                  <option value="EUR">EUR - Euro</option>
                                  <option value="GBP">GBP - British Pound</option>
                                  <option value="AUD">AUD - Australian Dollar</option>
                                  <option value="CAD">CAD - Canadian Dollar</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Daily Limit</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currencySymbol}</span>
                              <input
                                type="number"
                                value={spendLimit}
                                onChange={(e) => setSpendLimit(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 text-sm font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Column 2: Billing Info & Fees */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-navy-50 text-navy-600 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                        Billing Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 text-sm font-semibold"
                            placeholder="Name on card"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Billing Address</label>
                          <textarea
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 text-sm font-semibold resize-none"
                            placeholder="Your registered billing address"
                            required
                          ></textarea>
                        </div>
                      </div>
                    </section>

                    <section className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                      <div className="flex items-center space-x-2 text-primary-800 font-bold mb-3">
                        <Info className="w-5 h-5" />
                        <span>Issuance Fee</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-primary-700 leading-relaxed">
                          There is a one-time issuance fee for your virtual card based on the selected level. The fee will be deducted from your main balance immediately.
                        </p>
                        <div className="pt-2 flex justify-between items-end">
                          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">Selected Level Fee:</span>
                          <span className="text-2xl font-black text-primary-700 font-mono">
                            {currencySymbol}{cardLevels.find(l => l.id === cardLevel)?.fee || '0'}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50">
                  <label className="flex items-start space-x-3 cursor-pointer group mb-8">
                    <div className="relative flex items-center justify-center mt-1">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="peer h-5 w-5 bg-gray-100 border-2 border-gray-200 rounded-md checked:bg-navy-900 checked:border-navy-900 transition-all cursor-pointer opacity-0 absolute"
                      />
                      <div className={`h-5 w-5 border-2 rounded-md transition-all ${agreeTerms ? 'bg-navy-900 border-navy-900' : 'border-gray-200 group-hover:border-gray-300 bg-gray-50'}`}>
                        {agreeTerms && <CheckCircle className="w-4 h-4 text-primary-500 mx-auto" />}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 font-medium select-none">
                      I agree to the <span className="text-navy-900 font-bold hover:underline">Terms of Service</span> and the <span className="text-navy-900 font-bold hover:underline">Card Agreement</span>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || !agreeTerms || !cardLevel}
                    className="w-full h-12 mobile:h-14 bg-navy-900 text-navy-50 rounded-2xl font-black text-sm mobile:text-lg uppercase tracking-widest hover:bg-navy-800 disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-xl shadow-navy-100 flex items-center justify-center space-x-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6" />
                        <span>Apply for Card</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { q: "How soon will my virtual card be ready?", a: "Virtual cards are typically issued within minutes after approval. You'll receive a notification when your card is ready to use." },
                { q: "Can I use my virtual card for all online purchases?", a: "Yes, your virtual card works for most online merchants that accept Visa or Mastercard. Some merchants may require a physical card for verification purposes." },
              ].map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-navy-900 mb-2">{f.q}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Up Modal */}
      {topUpModalCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-md" onClick={() => setTopUpModalCard(null)}></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div className="p-6 mobile:p-8 mobile:p-10">
              <div className="flex justify-between items-center mb-6 mobile:mb-8">
                <div>
                  <h3 className="text-lg mobile:text-2xl font-black text-navy-900 uppercase tracking-tighter">Top Up Card</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Transfer from Main Balance</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${topUpModalCard.cardLevel === 'black' ? 'bg-black text-navy-50' : 'bg-navy-900 text-navy-50'}`}>
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Main</span>
                  <span className="text-sm font-black text-navy-900 font-mono">{currencySymbol}{(userProfile?.balances?.main || 0).toFixed(2)}</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 w-[60%]"></div>
                </div>
              </div>

              <form onSubmit={handleTopUp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Top-up Amount ({currencyCode})</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-navy-900">{currencySymbol}</span>
                    <input
                      required
                      type="number"
                      className="w-full h-16 pl-10 pr-6 bg-gray-50 border border-gray-100 rounded-2xl text-2xl font-black text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-4">
                  <Info className="text-primary-600 w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-primary-700 font-bold leading-relaxed uppercase tracking-widest">
                    Funds will be moved from your main vault to this virtual card. This transaction requires admin verification and usually processes within 5-15 minutes.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTopUpModalCard(null)}
                    className="flex-1 h-14 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isToppingUp || parseFloat(topUpAmount) <= 0 || parseFloat(topUpAmount) > (userProfile?.balances?.main || 0)}
                    className="flex-[2] h-14 bg-navy-900 text-navy-50 rounded-xl font-black uppercase tracking-widest hover:bg-navy-800 transition-all shadow-lg shadow-navy-100 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {isToppingUp ? 'Processing...' : 'Authorise'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VirtualCardsSection;
