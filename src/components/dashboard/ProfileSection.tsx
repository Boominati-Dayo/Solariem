'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Copy,
  Info,
  Zap,
  LogOut,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const ProfileSection = () => {
  const { userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinInputs, setShowPinInputs] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard');
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      showError('New PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      showError('New PINs do not match');
      return;
    }

    setIsChangingPin(true);
    try {
      const response = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPin, newPin }),
      });
      const result = await response.json();

      if (result.success) {
        showSuccess('Transaction PIN updated successfully');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setShowPinInputs(false);
      } else {
        showError(result.error || 'Failed to change PIN');
      }
    } catch (error) {
      console.error('Change PIN error:', error);
      showError('Failed to change PIN. Please try again.');
    } finally {
      setIsChangingPin(false);
    }
  };

  const initials = `${userProfile?.firstName?.[0] || ''}${userProfile?.lastName?.[0] || ''}`.toUpperCase() || 'MB';
  const fullName = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim().toLowerCase() || 'metro boominati';

  return (
    <div className="animate-in fade-in duration-700 px-0 py-4 mobile:px-0 mobile:py-0">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mobile:gap-8">
        {/* Left Sidebar Column */}
        <div className="lg:col-span-4 space-y-4 mobile:space-y-6">
          {/* User Profile Card */}
          <div className="bg-[#14130F] rounded-2xl mobile:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-navy-900/40 border border-white/5">
            {/* Header with Pattern */}
            <div className="h-24 mobile:h-32 bg-gradient-to-br from-primary-600/30 via-primary-500/10 to-transparent relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,30 50,50 T100,50 V100 H0 Z" fill="currentColor" className="text-primary-500" />
                </svg>
              </div>
              <div className="absolute top-4 right-4 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 text-primary-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="px-5 mobile:px-8 pb-8 mobile:pb-10 -mt-14 mobile:-mt-16 relative z-10 text-center">
              <div className="inline-flex relative mb-4 mobile:mb-6">
                <div className="w-24 h-24 mobile:w-32 mobile:h-32 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-full border-[6px] mobile:border-[8px] border-[#14130F] flex items-center justify-center text-3xl mobile:text-5xl font-black text-navy-900 shadow-2xl">
                  {initials}
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 mobile:w-10 mobile:h-10 bg-white rounded-full border-4 border-[#14130F] flex items-center justify-center shadow-lg">
                  <Zap className="w-3 h-3 mobile:w-4 mobile:h-4 text-primary-600" />
                </div>
              </div>
              <h3 className="text-lg mobile:text-2xl font-black text-white lowercase tracking-tight mb-1">{fullName}</h3>
              <p className="text-[11px] font-black text-primary-500 uppercase tracking-[0.2em] opacity-80">Account #{userProfile?.userCode || 'L853E8PR'}</p>
            </div>

            {/* Navigation Navigation */}
            <div className="bg-navy-900/50 p-6 border-t border-white/5">
              <button
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-3xl transition-all ${activeTab === 'profile'
                    ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/10 font-black'
                    : 'text-gray-400 hover:text-white font-bold'
                  }`}
              >
                <div className={`p-2 rounded-xl ${activeTab === 'profile' ? 'bg-navy-900/10' : 'bg-white/5'}`}>
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase tracking-widest">Core Credentials</span>
              </button>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-2xl mobile:rounded-[2.5rem] p-5 mobile:p-8 border border-gray-100 shadow-sm group">
            <div className="w-10 h-10 mobile:w-12 mobile:h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4 mobile:mb-6 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5 mobile:w-6 mobile:h-6" />
            </div>
            <h4 className="text-base mobile:text-lg font-black text-navy-900 uppercase tracking-tight mb-2">Need Help?</h4>
            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4 mobile:mb-6">
              Contact our support team if you need assistance with your account settings or have any questions.
            </p>
            <button className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all group/btn">
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Logout Card - Standard for all devices */}
          <div className="bg-red-50 rounded-2xl mobile:rounded-[2.5rem] p-5 mobile:p-8 border border-red-100 shadow-sm group">
            <div className="w-10 h-10 mobile:w-12 mobile:h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 mobile:mb-6 group-hover:scale-110 transition-transform">
              <LogOut className="w-5 h-5 mobile:w-6 mobile:h-6" />
            </div>
            <h4 className="text-base mobile:text-lg font-black text-red-900 uppercase tracking-tight mb-2">Secure Logout</h4>
            <p className="text-xs text-red-700/60 font-medium leading-relaxed mb-4 mobile:mb-6">
              Terminate your current session and clear all active ledger credentials from this device.
            </p>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to terminate your current session?')) {
                  setIsLoggingOut(true);
                  try {
                    await logout();
                    window.location.href = '/';
                  } catch (e) {
                    console.error('Logout failed:', e);
                    setIsLoggingOut(false);
                  }
                }
              }}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between px-6 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all disabled:opacity-50"
            >
              <span>{isLoggingOut ? 'Terminating...' : 'Terminate Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl mobile:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Content Header */}
            <div className="p-5 mobile:p-8 mobile:p-10 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-base mobile:text-xl font-black text-navy-900 uppercase tracking-tight flex items-center gap-3">
                <div className="p-2 mobile:p-2.5 bg-navy-900 rounded-xl text-navy-50 shadow-lg shadow-navy-900/10">
                  <ShieldCheck className="w-5 h-5 mobile:w-6 mobile:h-6" />
                </div>
                Profile Information
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                Your personal credentials and validated account details
              </p>
            </div>

            {/* Information Grid */}
            <div className="p-5 mobile:p-8 mobile:p-10 space-y-5 mobile:space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      disabled
                      value={userProfile?.firstName || '---'}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-navy-900 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      disabled
                      value={userProfile?.lastName || '---'}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-navy-900 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Account Number */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                  <div className="relative group">
                    <Hash className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      disabled
                      value={userProfile?.userCode || '---'}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-navy-900 cursor-not-allowed"
                    />
                    <button
                      onClick={() => copyToClipboard(userProfile?.userCode || '')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-navy-900"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1.5 ml-1">This is your unique account identifier</p>
                  </div>
                </div>

                {/* Email */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      disabled
                      value={userProfile?.email || '---'}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-navy-900 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* DOB */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      disabled
                      value={userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'mm/dd/yyyy'}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-navy-900 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      disabled
                      value={userProfile?.phone || 'Not provided'}
                      className="w-full pl-10 mobile:pl-12 pr-6 py-3 mobile:py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs mobile:text-sm font-bold text-navy-900 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Residence Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-5 top-6 text-gray-300" />
                    <textarea
                      disabled
                      value={[
                        userProfile?.city,
                        userProfile?.state,
                        userProfile?.country,
                        userProfile?.zip
                      ].filter(Boolean).join(', ') || 'No address logged'}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold text-navy-900 cursor-not-allowed min-h-[120px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Transaction PIN */}
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-6 mobile:p-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 mobile:w-12 mobile:h-12 bg-primary-500/15 text-primary-500 rounded-2xl flex items-center justify-center">
                      <Lock className="w-5 h-5 mobile:w-6 mobile:h-6" />
                    </div>
                    <div>
                      <h5 className="text-sm mobile:text-base font-black text-white uppercase tracking-tight">Transaction PIN</h5>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        Used to confirm transfers and withdrawals
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPinInputs(!showPinInputs)}
                    className="px-4 py-2.5 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-400 transition-colors"
                  >
                    {showPinInputs ? 'Cancel' : 'Change PIN'}
                  </button>
                </div>

                {showPinInputs && (
                  <form onSubmit={handleChangePin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current PIN</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          required
                          value={currentPin}
                          onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white tracking-[0.4em] placeholder:text-gray-500 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 outline-none"
                          placeholder="••••"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New PIN</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          required
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white tracking-[0.4em] placeholder:text-gray-500 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 outline-none"
                          placeholder="••••"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New PIN</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            required
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white tracking-[0.4em] placeholder:text-gray-500 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 outline-none"
                            placeholder="••••"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isChangingPin}
                          className="px-5 py-3 bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-400 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          {isChangingPin ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-navy-900/30 border-t-navy-900"></div>
                          ) : (
                            'Save'
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Status Banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4 animate-pulse">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-1">Account Information Integrity</h5>
                  <p className="text-[10px] font-bold text-blue-700/70 leading-relaxed uppercase">
                    To maintain core ledger security and profile integrity, please contact our authorised support team to update any of the personal metrics shown above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
