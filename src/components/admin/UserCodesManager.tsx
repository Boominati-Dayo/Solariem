'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Save,
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Mail,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

type WithdrawalCodeType = 'TPIN' | 'TAC' | 'MFA' | 'TVC' | 'SAC';

interface CodePricing {
  enabled: boolean;
  price: number;
}

interface UserCodePricing {
  TPIN: CodePricing;
  TAC: CodePricing;
  MFA: CodePricing;
  TVC: CodePricing;
  SAC: CodePricing;
}

interface PricingResponse {
  success: boolean;
  data?: {
    userId: string;
    userLabel: string;
    currency: string;
    pricing: UserCodePricing;
    codeTypes: WithdrawalCodeType[];
  };
  error?: string;
}

const CODE_META: Record<WithdrawalCodeType, {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  ring: string;
  bg: string;
}> = {
  TPIN: {
    name: 'Transaction PIN',
    description: 'Legacy 4-digit PIN. Always free and always required.',
    icon: Key,
    accent: 'text-navy-900',
    ring: 'ring-navy-900/20',
    bg: 'bg-navy-50'
  },
  SAC: {
    name: 'Secure Access Code',
    description: 'A code required to access the withdrawal flow.',
    icon: Lock,
    accent: 'text-indigo-500',
    ring: 'ring-indigo-500/20',
    bg: 'bg-indigo-50'
  },
  TVC: {
    name: 'Transaction Verification Code',
    description: 'A code that confirms the specific withdrawal details.',
    icon: ShieldCheck,
    accent: 'text-emerald-500',
    ring: 'ring-emerald-500/20',
    bg: 'bg-emerald-50'
  },
  MFA: {
    name: 'Multi-Factor Authentication',
    description: 'A second-factor code sent to your verified contact.',
    icon: Shield,
    accent: 'text-amber-500',
    ring: 'ring-amber-500/20',
    bg: 'bg-amber-50'
  },
  TAC: {
    name: 'Transaction Authorization Code',
    description: 'A final code authorizing the withdrawal to proceed.',
    icon: CheckCircle,
    accent: 'text-primary-500',
    ring: 'ring-primary-500/20',
    bg: 'bg-primary-50'
  }
};

const CODE_ORDER: WithdrawalCodeType[] = ['TPIN', 'SAC', 'TVC', 'MFA', 'TAC'];

const UserCodesManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Array<{ _id: string; email: string; firstName?: string; lastName?: string; userCode?: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserLabel, setSelectedUserLabel] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [pricing, setPricing] = useState<UserCodePricing | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [saving, setSaving] = useState(false);

  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setUsers([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data.slice(0, 10));
      } else {
        setUsers([]);
      }
    } catch (err) {
      setUsers([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      searchUsers(searchTerm);
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchPricing = async (userId: string) => {
    setLoadingPricing(true);
    setPricing(null);
    try {
      const res = await fetch(`/api/admin/user-codes?id=${encodeURIComponent(userId)}`);
      const data: PricingResponse = await res.json();
      if (data.success && data.data) {
        setPricing(data.data.pricing);
        setCurrency(data.data.currency || 'USD');
        setSelectedUserLabel(data.data.userLabel);
        setSelectedUserId(data.data.userId);
      } else {
        showError(data.error || 'Failed to load pricing');
      }
    } catch (err) {
      showError('Network error loading pricing');
    } finally {
      setLoadingPricing(false);
    }
  };

  const handleSelectUser = (userId: string, label: string) => {
    setSearchTerm('');
    setUsers([]);
    fetchPricing(userId);
    setSelectedUserLabel(label);
    setSelectedUserId(userId);
  };

  const handleClearSelection = () => {
    setSelectedUserId(null);
    setSelectedUserLabel('');
    setPricing(null);
    setSearchTerm('');
    setUsers([]);
  };

  const updateCode = (key: WithdrawalCodeType, patch: Partial<CodePricing>) => {
    if (!pricing || key === 'TPIN') return;
    setPricing({
      ...pricing,
      [key]: { ...pricing[key], ...patch }
    });
  };

  const handleSave = async () => {
    if (!pricing || !selectedUserId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/user-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, pricing })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Withdrawal code pricing updated');
        if (data.data?.pricing) {
          setPricing(data.data.pricing);
        }
      } else {
        showError(data.error || 'Failed to save pricing');
      }
    } catch (err) {
      showError('Network error saving pricing');
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = pricing
    ? CODE_ORDER.filter((k) => pricing[k]?.enabled).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 uppercase tracking-tighter">
            Withdrawal Code Pricing
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Toggle which security gates apply to a user and set per-gate fees
          </p>
        </div>
        {selectedUserId && (
          <button
            onClick={handleClearSelection}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 hover:text-navy-900 border border-gray-100 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Select Another User
          </button>
        )}
      </div>

      {!selectedUserId && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by email, name, or user code..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {users.length > 0 ? (
              users.map((u) => (
                <button
                  key={u._id}
                  onClick={() =>
                    handleSelectUser(
                      u._id,
                      `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
                        u.email ||
                        u._id
                    )
                  }
                  className="w-full flex items-center justify-between gap-4 p-5 hover:bg-gray-50 transition-all text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center font-black text-navy-900 uppercase shrink-0">
                      {(u.firstName?.[0] || u.email[0] || 'U')}
                      {(u.lastName?.[0] || '')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-navy-900 truncate">
                        {u.firstName} {u.lastName}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">
                        {u.userCode || u.email}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              ))
            ) : searchTerm.trim() && !searching ? (
              <div className="py-12 text-center text-gray-400">
                <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  No users match that search
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Start typing to find a user
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedUserId && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 bg-navy-900 text-navy-50 rounded-2xl flex items-center justify-center font-black uppercase">
              {selectedUserLabel
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-navy-900 text-lg truncate">
                {selectedUserLabel}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Configure 5 withdrawal security gates
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-navy-900">
                {enabledCount}/5 Enabled
              </span>
            </div>
          </div>

          {loadingPricing ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
              <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                Loading Pricing Configuration...
              </p>
            </div>
          ) : pricing ? (
            <>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                    Set any fee per code
                  </p>
                  <p className="text-xs text-amber-700/80 font-medium mt-1">
                    No upper cap. The user pays exactly the fee you set for each gate when they withdraw. Fees are refunded to the user's balance if the withdrawal is later declined by an admin. TPIN is always free and always required.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {CODE_ORDER.map((key) => {
                  const meta = CODE_META[key];
                  const Icon = meta.icon;
                  const cfg = pricing[key];
                  const isLocked = key === 'TPIN';
                  const isEnabled = cfg?.enabled ?? false;

                  return (
                    <div
                      key={key}
                      className={`bg-white rounded-3xl border transition-all p-6 group ${
                        isEnabled
                          ? 'border-primary-500/30 shadow-sm'
                          : 'border-gray-100'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                              isEnabled
                                ? `${meta.bg} ring-2 ${meta.ring}`
                                : 'bg-gray-50'
                            }`}
                          >
                            <Icon
                              className={`w-6 h-6 ${
                                isEnabled ? meta.accent : 'text-gray-300'
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-black text-navy-900 uppercase tracking-tight text-base">
                                {meta.name}
                              </h3>
                              {isLocked && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-navy-900 text-navy-50 px-2 py-0.5 rounded-full">
                                  Always On
                                </span>
                              )}
                              <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                {key}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              {meta.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex flex-col">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                              Fee ({currency})
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                disabled={isLocked || !isEnabled}
                                value={cfg?.price ?? 0}
                                onChange={(e) =>
                                  updateCode(key, {
                                    price: Math.max(0, Number(e.target.value) || 0)
                                  })
                                }
                                className="w-32 pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold text-xs text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() =>
                              updateCode(key, { enabled: !isEnabled })
                            }
                            className={`relative w-14 h-8 rounded-full transition-all ${
                              isEnabled
                                ? 'bg-primary-500'
                                : 'bg-gray-200'
                            } ${
                              isLocked
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                                isEnabled ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleClearSelection}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-50 text-gray-500 hover:text-navy-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-navy-900 text-navy-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-navy-800 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Pricing
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserCodesManager;
