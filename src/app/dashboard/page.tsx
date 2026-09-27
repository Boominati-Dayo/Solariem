'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Settings,
  LogOut,
  Bell,
  BarChart3,
  History,
  AlertCircle,
  ArrowUpDown,
  ArrowDownUp,
  Users,
  Menu,
  X,
  Copy,
  CheckCircle,
  CreditCard,
  User,
  HelpCircle,
  Shield,
  ShieldCheck,
  Zap,
  MoreVertical,
  Plus,
  Send,
  PieChart,
  Globe,
  HeadphonesIcon,
  Calendar,
  Mail,
  Search,
  LayoutDashboard,
  ArrowLeftRight,
  Briefcase,
  FileText,
  Landmark,
  ArrowRight,
  Activity,
  ChevronRight
} from 'lucide-react';
import VerificationBanner from '@/components/dashboard/VerificationBanner';
import Wordmark from '@/components/Wordmark';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessAdmin } from '@/utils/adminUtils';
import { getCurrencySymbol } from '@/lib/currencies';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { showError } from '@/utils/toast';
import DashboardLoader from '@/components/DashboardLoader';
import { AnimatePresence } from 'framer-motion';

// Navigation components (keep existing if possible, but redesigning core)
import dynamic from 'next/dynamic';

const DepositSection = dynamic(() => import('@/components/dashboard/DepositSection'));
const WithdrawSection = dynamic(() => import('@/components/dashboard/WithdrawSection'));
const TransferMoneySection = dynamic(() => import('@/components/dashboard/TransferMoneySection'));
const UnifiedLogsSection = dynamic(() => import('@/components/dashboard/UnifiedLogsSection'));
const ProfileSection = dynamic(() => import('@/components/dashboard/ProfileSection'));
const NotificationsSection = dynamic(() => import('@/components/dashboard/NotificationsSection'));
const SupportSection = dynamic(() => import('@/components/dashboard/SupportSection'));
const KYCSection = dynamic(() => import('@/components/dashboard/KYCSection'));
const AdminSection = dynamic(() => import('@/components/dashboard/AdminSection'));
const VirtualCardsSection = dynamic(() => import('@/components/dashboard/VirtualCardsSection'));
const LoanSection = dynamic(() => import('@/components/dashboard/LoanSection'));
const TaxRefundSection = dynamic(() => import('@/components/dashboard/TaxRefundSection'));
const RecoverySection = dynamic(() => import('@/components/dashboard/RecoverySection'));
const AccountBlockedOverlay = dynamic(() => import('@/components/dashboard/AccountBlockedOverlay'));
const AccountRestrictedBanner = dynamic(() => import('@/components/dashboard/AccountRestrictedBanner'));

const TransactionsHub = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      {[
        { id: 'transfer', name: 'Send Money', icon: <Send className="w-4 mobile:w-5 h-4 mobile:h-5" />, desc: 'Transfer funds securely', color: 'text-primary-500 bg-primary-500/5' },
        { id: 'deposit', name: 'Deposit', icon: <Plus className="w-4 mobile:w-5 h-4 mobile:h-5" />, desc: 'Add funds to your account', color: 'text-primary-500 bg-primary-500/5' },
        { id: 'withdraw', name: 'Withdrawal', icon: <ArrowUpDown className="w-4 mobile:w-5 h-4 mobile:h-5" />, desc: 'Request your earnings', color: 'text-primary-500 bg-primary-500/5' },
        { id: 'logs', name: 'History', icon: <History className="w-4 mobile:w-5 h-4 mobile:h-5" />, desc: 'Detailed transaction logs', color: 'text-primary-500 bg-primary-500/5' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="w-full flex items-center justify-between p-4 mobile:p-6 bg-white rounded-xl mobile:rounded-3xl border border-gray-100 hover:border-primary-500/30 hover:shadow-xl hover:shadow-navy-900/5 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-5">
            <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <div className="text-left">
              <h4 className="text-xs mobile:text-base font-black text-navy-900 uppercase tracking-tight leading-none mb-1.5">{item.name}</h4>
              <p className="text-[8px] mobile:text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.desc}</p>
            </div>
          </div>
          <div className="w-8 mobile:w-10 h-8 mobile:h-10 rounded-full bg-navy-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
            <ChevronRight className="w-4 mobile:w-5 h-4 mobile:h-5 text-navy-600" />
          </div>
        </button>
      ))}
    </div>
  );
};

const AccountHub = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  const { userProfile } = useAuth();
  const isAdmin = canAccessAdmin(userProfile);

  const items = [
    { id: 'profile', name: 'Identity Management', icon: <User className="w-5 h-5" />, desc: 'Core ledger & credentials', color: 'text-navy-50 bg-navy-900 border-navy-800' },
    { id: 'support', name: 'Authorized Support', icon: <HeadphonesIcon className="w-5 h-5" />, desc: 'Talk to us directly', color: 'text-navy-900 bg-navy-50 border-gray-100' },
    ...(isAdmin ? [{
      id: 'admin',
      name: 'Network Administration',
      icon: <ShieldCheck className="w-5 h-5" />,
      desc: 'System-wide governance',
      color: 'text-primary-600 bg-primary-50 border-primary-200/50'
    }] : []),
    ...(userProfile?.kycStatus !== 'verified' ? [{
      id: 'kyc',
      name: 'Identity Verification',
      icon: <ShieldCheck className="w-5 h-5" />,
      desc: 'Security clearance & KYC',
      color: 'text-navy-900 bg-navy-50 border-gray-100'
    }] : [])
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full flex items-center justify-between p-4 mobile:p-6 rounded-xl mobile:rounded-3xl border transition-all group active:scale-[0.98] ${item.id === 'profile' ? 'bg-[#14130F] border-white/5 shadow-2xl shadow-navy-900/10' : 'bg-white border-gray-100 shadow-sm hover:border-primary-500/30'
            }`}
        >
          <div className="flex items-center gap-5">
            <div className={`w-8 mobile:w-14 h-8 mobile:h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${item.id === 'profile' ? 'bg-white/5 text-primary-500' : item.id === 'admin' ? 'bg-primary-50 text-primary-600' : 'bg-navy-50 text-navy-900'
              }`}>
              {item.icon}
            </div>
            <div className="text-left">
              <h4 className={`text-xs mobile:text-base font-black uppercase tracking-tight leading-none mb-1.5 ${item.id === 'profile' ? 'text-primary-500' : 'text-navy-900'
                }`}>{item.name}</h4>
              <p className={`text-[8px] mobile:text-[10px] font-black uppercase tracking-widest ${item.id === 'profile' ? 'text-white/40' : 'text-gray-400'
                }`}>{item.desc}</p>
            </div>
          </div>
          <div className={`w-8 mobile:w-10 h-8 mobile:h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 ${item.id === 'profile' ? 'bg-white/5' : 'bg-navy-50'
            }`}>
            <ChevronRight className={`w-4 mobile:w-5 h-4 mobile:h-5 ${item.id === 'profile' ? 'text-primary-500' : 'text-navy-600'}`} />
          </div>
        </button>
      ))}
    </div>
  );
};

const ServicesHub = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      {[
        { id: 'cards', name: 'Virtual Cards', icon: <CreditCard className="w-5 h-5" />, desc: 'Secure online payments', color: 'text-primary-500 bg-primary-500/5' },
        { id: 'loans', name: 'Loan Services', icon: <Briefcase className="w-5 h-5" />, desc: 'Financial assistance', color: 'text-primary-500 bg-primary-500/5' },
        { id: 'tax-refund', name: 'Tax Refund', icon: <FileText className="w-5 h-5" />, desc: 'Tax rebate claims', color: 'text-primary-500 bg-primary-500/5' },
        { id: 'recovery', name: 'Asset Recovery', icon: <Shield className="w-5 h-5" />, desc: 'Recover lost assets', color: 'text-primary-500 bg-primary-500/5' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="w-full flex items-center justify-between p-4 mobile:p-6 bg-white rounded-xl mobile:rounded-3xl border border-gray-100 hover:border-primary-500/30 hover:shadow-xl hover:shadow-navy-900/5 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-5">
            <div className={`w-8 mobile:w-14 h-8 mobile:h-14 ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <div className="text-left">
              <h4 className="text-xs mobile:text-base font-black text-navy-900 uppercase tracking-tight leading-none mb-1.5">{item.name}</h4>
              <p className="text-[8px] mobile:text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.desc}</p>
            </div>
          </div>
          <div className="w-8 mobile:w-10 h-8 mobile:h-10 rounded-full bg-navy-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
            <ChevronRight className="w-4 mobile:w-5 h-4 mobile:h-5 text-navy-600" />
          </div>
        </button>
      ))}
    </div>
  );
};

const DashboardClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('en-AU', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString('en-AU', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return { formattedDate, formattedTime };
};

const BalanceSlideshow = ({ mainBalance, stats, totalCardBalance, currencySymbol }: {
  mainBalance: number;
  stats: { volumeTotal: number; pendingTotal: number };
  totalCardBalance: number;
  currencySymbol: string;
}) => {
  const [statIndex, setStatIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-32 w-full">
      <AnimatePresence mode="wait">
        {statIndex === 0 && (
          <motion.div
            key="main-balance"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex flex-col justify-center md:items-start items-center"
          >
            <p className="text-4xl mobile:text-5xl lg:text-6xl font-black text-white tracking-tighter whitespace-nowrap">
              {currencySymbol}{mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-primary-500 font-bold uppercase tracking-widest text-[10px] mobile:text-xs mt-2 opacity-80">Available Liquid Assets</p>
          </motion.div>
        )}

        {statIndex === 1 && (
          <motion.div
            key="integrity-level"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex flex-col justify-center md:items-start items-center"
          >
            <p className="text-4xl mobile:text-5xl lg:text-6xl font-black text-white tracking-tighter whitespace-nowrap">
              {currencySymbol}{stats.volumeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-primary-500 font-bold uppercase tracking-widest text-[10px] mobile:text-xs mt-2 opacity-80">Total Account Volume</p>
          </motion.div>
        )}

        {statIndex === 2 && (
          <motion.div
            key="active-cases"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex flex-col justify-center md:items-start items-center"
          >
            <p className="text-4xl mobile:text-5xl lg:text-6xl font-black text-white tracking-tighter whitespace-nowrap">
              {currencySymbol}{stats.pendingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-primary-500 font-bold uppercase tracking-widest text-[10px] mobile:text-xs mt-2 opacity-80">Pending Asset Transfers</p>
          </motion.div>
        )}

        {statIndex === 3 && (
          <motion.div
            key="security-score"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex flex-col justify-center md:items-start items-center"
          >
            <p className="text-4xl mobile:text-5xl lg:text-6xl font-black text-white tracking-tighter whitespace-nowrap">
              {currencySymbol}{totalCardBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-primary-500 font-bold uppercase tracking-widest text-[10px] mobile:text-xs mt-2 opacity-80">Virtual Card Liquidity</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Slide Indicators */}
      <div className="absolute bottom-[-20px] left-0 md:left-0 right-0 flex justify-center md:justify-start gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${statIndex === i ? 'w-4 bg-primary-400' : 'w-1 bg-white/20'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const { user, userProfile, logout, loading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currencySymbol = getCurrencySymbol(userProfile?.currency);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingDepositAmount, setPendingDepositAmount] = useState<number | undefined>(undefined);
  // When the verify-email page redirects here with ?verified=1, suppress
  // the "Email Verification Required" banner for a short grace period
  // so the user isn't sent to /activate-email while their /me cache is
  // still stale.
  const [suppressEmailBanner, setSuppressEmailBanner] = useState(() => searchParams.get('verified') === '1');

  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      setSuppressEmailBanner(true);
      const timer = setTimeout(() => setSuppressEmailBanner(false), 30_000);
      // Clear the ?verified=1 query so a hard refresh doesn't keep hiding it.
      const url = new URL(window.location.href);
      if (url.searchParams.get('verified')) {
        url.searchParams.delete('verified');
        window.history.replaceState({}, '', url.toString());
      }
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const { formattedDate, formattedTime } = DashboardClock();

  // Mock unreadCount if not provided by auth (to fix lint)
  const unreadCount = 0;

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [stats, setStats] = useState({
    pendingTotal: 0,
    volumeTotal: 0,
    accountAge: '1 second',
    activeCases: 0,
    integrityLevel: 15,
    securityScore: 75
  });
  const [totalCardBalance, setTotalCardBalance] = useState(0);

  const formatAge = (createdAt: string | Date | undefined) => {
    if (!createdAt) return '1 second';
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffInSeconds = Math.max(1, Math.floor((now - start) / 1000));

    if (diffInSeconds < 60) return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'}`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'}`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'}`;
  };

  const fetchCardBalance = async () => {
    try {
      const response = await fetch('/api/cards');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const approvedCards = result.data.filter((c: any) => c.status === 'approved');
        const total = approvedCards.reduce((sum: number, c: any) => sum + (c.balance || 0), 0);
        setTotalCardBalance(total);
      }
    } catch (error) {
      console.error('Failed to fetch card balance');
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      setLoadingRecent(true);
      const txRes = await fetch('/api/user-transactions');
      const result = await txRes.json();

      if (result.success) {
        setRecentTransactions(result.data.slice(0, 5));

        // Calculate Statistics
        // Include 'pending' from any specialised collection
        const pending = result.data
          .filter((tx: any) => tx.status === 'pending' || tx.status === 'processing' || tx.status === 'in_review')
          .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount || 0), 0);

        const volume = result.data
          .filter((tx: any) => tx.status === 'completed' || tx.status === 'processed')
          .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount || 0), 0);

        let integrity = 15;
        if (userProfile?.kycStatus === 'verified') integrity = 100;
        else if (userProfile?.kycStatus === 'pending') integrity = 65;
        else if (userProfile?.kycStatus === 'rejected') integrity = 25;

        // Calculate active recovery cases from the unified data
        const recoveryCasesCount = result.data.filter((tx: any) => tx.type === 'recovery' && tx.status !== 'completed' && tx.status !== 'failed').length;

        setStats(prev => ({
          ...prev,
          pendingTotal: pending,
          volumeTotal: volume,
          activeCases: recoveryCasesCount,
          integrityLevel: integrity,
          securityScore: userProfile?.kycStatus === 'verified' ? 94 : 75
        }));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchRecentTransactions();
      fetchCardBalance();

      // Check for pending recovery claim (Auth Bridge)
      const pendingClaim = sessionStorage.getItem('pendingRecoveryClaim');
      if (pendingClaim) {
        try {
          const data = JSON.parse(pendingClaim);
          // Only pivot if the claim is relatively fresh (e.g., within last 30 mins)
          if (Date.now() - data.timestamp < 30 * 60 * 1000) {
            setActiveSection('recovery');
          } else {
            // Clear stale claim
            sessionStorage.removeItem('pendingRecoveryClaim');
          }
        } catch (e) {
          console.error('Error parsing pending claim:', e);
          sessionStorage.removeItem('pendingRecoveryClaim');
        }
      }
    }
  }, [activeSection]);

  useEffect(() => {
    if (userProfile?.createdAt) {
      setStats(prev => ({
        ...prev,
        accountAge: formatAge(userProfile.createdAt)
      }));
    }
  }, [userProfile]);


  const dashboardLinks = useMemo(() => {
    const isAdmin = canAccessAdmin(userProfile);

    const links = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: <BarChart3 className="w-5 h-5" />,
      },
      {
        id: 'transactions_hub',
        name: 'Transactions',
        icon: <ArrowLeftRight className="w-5 h-5" />,
        subItems: ['transfer', 'deposit', 'withdraw', 'logs'],
      },
      {
        id: 'account_hub',
        name: 'Account',
        icon: <User className="w-5 h-5" />,
        // Include admin in the account hub logic if user is admin
        subItems: ['profile', 'support', ...(isAdmin ? ['admin'] : []), ...(userProfile?.kycStatus !== 'verified' ? ['kyc'] : [])],
      },
      {
        id: 'services_hub',
        name: 'Services',
        icon: <Zap className="w-5 h-5" />,
        subItems: ['cards', 'loans', 'tax-refund'],
      },
    ];

    return links;
  }, [userProfile]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (e) { console.error(e); }
  };

  const handleNavigate = (id: string) => {
    // 1. Basic Navigation
    if (id === 'dashboard' || id === 'logs' || id === 'admin' || id === 'support' || id === 'profile' || id === 'kyc' || id === 'account_hub' || id === 'transactions_hub' || id === 'services_hub') {
      if (pendingDepositAmount !== undefined) setPendingDepositAmount(undefined);
      setActiveSection(id);
      setIsSidebarOpen(false);
      return;
    }

    // 2. Deposit handled separately for Blocked accounts
    if (id === 'deposit') {
      setActiveSection(id);
      setIsSidebarOpen(false);
      return;
    }

    // 3. Restriction Check for Financial/Premium Actions
    const financialActions = ['transfer', 'withdraw', 'cards', 'loans', 'tax-refund'];
    if (userProfile?.isAccountRestricted && financialActions.includes(id)) {
      showError('Financial actions are restricted. Please resolve the account restriction to proceed.');
      return;
    }

    // 4. Verification Check
    const isVerified = userProfile?.emailVerified && userProfile?.kycStatus === 'verified';
    if (!isVerified) {
      showError('Please verify your email and complete KYC to access this feature.');
      return;
    }

    // 5. Success
    setActiveSection(id);
    setIsSidebarOpen(false);
  };

  // Helper to determine if we are in a sub-section
  const currentHub = useMemo(() => {
    return dashboardLinks.find(link => link.id === activeSection || (link.subItems && link.subItems.includes(activeSection)));
  }, [activeSection, dashboardLinks]);

  const isSubSection = currentHub && currentHub.id !== activeSection && activeSection !== 'dashboard';

  // Hub Components
  // Moved outside to prevent re-renders

  return (
    <ProtectedRoute>
      <DashboardLoader>
        <div className="flex h-screen bg-[#F5F4F0] overflow-hidden">
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#14130F] text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} hidden lg:block`}>
            <div className="flex flex-col h-full">
              <div className="p-4 bg-white flex items-center justify-between">
                <Wordmark />
              </div>

              <nav className="flex-1 px-3 mobile:px-4 py-4 mobile:py-8 space-y-1 mobile:space-y-2 overflow-y-auto">
                {/* Auth Check Helper */}
                {(() => {
                  const isVerified = userProfile?.emailVerified && userProfile?.kycStatus === 'verified';
                  const checkAuthAndNavigate = (id: string) => {
                    handleNavigate(id);
                  };
                  return (
                    <>
                      {/* 1. Dashboard Hub Section */}
                      <div className="pt-2 pb-2 px-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#0E5A50] font-bold">Dashboard</p>
                      </div>
                      <button
                        onClick={() => checkAuthAndNavigate('dashboard')}
                        className={`w-full flex items-center space-x-3 px-3.5 mobile:px-4 py-2.5 mobile:py-3 rounded-xl transition-all ${activeSection === 'dashboard' ? 'bg-primary-500 text-[#14130F] shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:bg-navy-800 hover:text-white'}`}
                      >
                        <BarChart3 className="w-5 h-5 scale-90 mobile:scale-100" />
                        <span className="text-sm mobile:text-base font-semibold">Overview</span>
                      </button>

                      {/* 2. Transactions Hub Section */}
                      <div className="pt-4 pb-2 px-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#0E5A50] font-bold">Transactions</p>
                      </div>
                      {['transfer', 'deposit', 'withdraw', 'logs'].map(id => {
                        const link = {
                          transfer: { name: 'Send Money', icon: <Send className="w-5 h-5" /> },
                          deposit: { name: 'Deposit', icon: <ArrowDownUp className="w-5 h-5" /> },
                          withdraw: { name: 'Withdrawal', icon: <ArrowUpDown className="w-5 h-5" /> },
                          logs: { name: 'History', icon: <History className="w-5 h-5" /> }
                        }[id as 'transfer' | 'deposit' | 'withdraw' | 'logs'];
                        return (
                          <button
                            key={id}
                            onClick={() => checkAuthAndNavigate(id)}
                            className={`w-full flex items-center space-x-3 px-3.5 mobile:px-4 py-2.5 mobile:py-3 rounded-xl transition-all ${activeSection === id ? 'bg-primary-500 text-[#14130F] shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:bg-navy-800 hover:text-white'}`}
                          >
                            <span className="scale-90 mobile:scale-100">{link.icon}</span>
                            <span className="text-sm mobile:text-base font-semibold">{link.name}</span>
                          </button>
                        );
                      })}

                      {/* 3. Account Hub Section */}
                      <div className="pt-4 pb-2 px-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#0E5A50] font-bold">Account</p>
                      </div>
                      {['profile', 'support', ...(userProfile?.kycStatus !== 'verified' ? ['kyc'] : [])].map(id => {
                        const link = {
                          profile: { name: 'Account Info', icon: <User className="w-5 h-5" /> },
                          support: { name: 'Contact Support', icon: <HeadphonesIcon className="w-5 h-5" /> },
                          kyc: { name: 'Identity Verification', icon: <ShieldCheck className="w-5 h-5" /> }
                        }[id as 'profile' | 'support' | 'kyc'];

                        const showDot = (id === 'profile' && !userProfile?.emailVerified) ||
                          (id === 'kyc' && userProfile?.kycStatus !== 'verified');
                        const dotColor = (id === 'profile') ? 'bg-amber-500' :
                          (userProfile?.kycStatus === 'pending' ? 'bg-amber-500' : 'bg-red-500');

                        return (
                          <button
                            key={id}
                            onClick={() => checkAuthAndNavigate(id)}
                            className={`relative w-full flex items-center space-x-3 px-3.5 mobile:px-4 py-2.5 mobile:py-3 rounded-xl transition-all ${activeSection === id ? 'bg-primary-500 text-[#14130F] shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:bg-navy-800 hover:text-white'}`}
                          >
                            <span className="scale-90 mobile:scale-100">{link.icon}</span>
                            <span className="text-sm mobile:text-base font-semibold">{link.name}</span>
                            {showDot && (
                              <span className={`absolute right-4 w-2 h-2 rounded-full ${dotColor} animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]`}></span>
                            )}
                          </button>
                        );
                      })}

                      {/* 4. Services Section */}
                      <div className="pt-4 pb-2 px-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#0E5A50] font-bold">Services</p>
                      </div>
                      {['cards', 'loans', 'tax-refund', 'recovery'].map(id => {
                        const link = {
                          cards: { name: 'Virtual Cards', icon: <CreditCard className="w-5 h-5" /> },
                          loans: { name: 'Loan Services', icon: <Briefcase className="w-5 h-5" /> },
                          'tax-refund': { name: 'Tax Refund', icon: <FileText className="w-5 h-5" /> },
                          recovery: { name: 'Asset Recovery', icon: <Shield className="w-5 h-5" /> }
                        }[id as 'cards' | 'loans' | 'tax-refund' | 'recovery'];
                        return (
                          <button
                            key={id}
                            onClick={() => checkAuthAndNavigate(id)}
                            className={`w-full flex items-center space-x-3 px-3.5 mobile:px-4 py-2.5 mobile:py-3 rounded-xl transition-all ${activeSection === id ? 'bg-primary-500 text-[#14130F] shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:bg-navy-800 hover:text-white'}`}
                          >
                            <span className="scale-90 mobile:scale-100">{link.icon}</span>
                            <span className="text-sm mobile:text-base font-semibold">{link.name}</span>
                          </button>
                        );
                      })}

                      {/* 5. Admin Section */}
                      {canAccessAdmin(userProfile) && (
                        <>
                          <div className="pt-4 pb-2 px-4">
                            <p className="text-[10px] uppercase tracking-widest text-[#0E5A50] font-bold">Admin</p>
                          </div>
                          <button
                            onClick={() => checkAuthAndNavigate('admin')}
                            className={`w-full flex items-center space-x-3 px-3.5 mobile:px-4 py-2.5 mobile:py-3 rounded-xl transition-all ${activeSection === 'admin' ? 'bg-primary-500 text-[#14130F] shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:bg-navy-800 hover:text-white'}`}
                          >
                            <ShieldCheck className="w-5 h-5 scale-90 mobile:scale-100" />
                            <span className="text-sm mobile:text-base font-semibold">Administration</span>
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </nav>

              <div className="p-4 mobile:p-6 border-t border-navy-800">
                <button onClick={handleLogout} className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors w-full">
                  <LogOut className="w-4 h-4 mobile:w-5 mobile:h-5" />
                  <span className="text-sm mobile:text-base font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Restriction Banner */}
            {userProfile?.isAccountRestricted && (
              <AccountRestrictedBanner
                reason={userProfile.accountBlockReason || ''}
                fee={userProfile.accountUnblockFee || 0}
                currency={userProfile.currency || 'USD'}
                onPayFee={() => {
                  setPendingDepositAmount(userProfile.accountUnblockFee || 0);
                  setActiveSection('deposit');
                }}
              />
            )}
            {/* Navbar */}
            <header className="h-16 mobile:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 mobile:px-6 shrink-0">
              <div className="flex items-center space-x-4">
                <div className="lg:hidden">
                  <Wordmark />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-400">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right mr-4 hidden sm:block">
                  <p className="text-lg mobile:text-xl font-bold text-navy-900">{currencySymbol}{(userProfile?.balances?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="flex items-center space-x-3 p-1 pl-3 bg-gray-50 rounded-full border border-gray-100">
                  <span className="inline font-semibold text-navy-900">{userProfile?.firstName || 'User'}</span>
                  <div className="relative w-8 h-8 mobile:w-10 mobile:h-10 bg-navy-900 text-navy-50 rounded-full flex items-center justify-center font-bold text-xs mobile:text-sm">
                    {(userProfile?.firstName?.[0] || 'U')}{(userProfile?.lastName?.[0] || 'U')}
                    {(!userProfile?.emailVerified || userProfile?.kycStatus !== 'verified') && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-3.5 mobile:p-6 bg-white space-y-4 mobile:space-y-8 pb-48 mobile:pb-48 relative">
              <VerificationBanner
                hideEmail={suppressEmailBanner}
                onNavigate={(section) => {
                  if (section === 'activate-email') {
                    router.push('/activate-email');
                  } else {
                    setActiveSection(section);
                  }
                }}
              />
              {activeSection === 'dashboard' ? (
                <>
                  {/* Top Stats Cards Removed per request - replaced by slideshow in Welcome section */}

                  {/* Main Overview Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-4 mobile:space-y-8">
                      {/* Welcome & Balance */}
                      <div className="bg-[#14130F] rounded-2xl mobile:rounded-3xl p-5 mobile:p-8 text-white relative overflow-hidden min-h-[300px] mobile:min-h-[350px] flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full">
                          <div className="w-full md:w-auto text-center md:text-left">
                            <h2 className="text-2xl mobile:text-3xl font-bold mb-4 mobile:mb-6 leading-tight">
                              Welcome back, <br className="hidden mobile:block" /> {userProfile?.firstName || 'User'}
                            </h2>

                            <div className="relative h-32 w-full">
                              <BalanceSlideshow
                                mainBalance={userProfile?.balances?.main || 0}
                                stats={stats}
                                totalCardBalance={totalCardBalance}
                                currencySymbol={currencySymbol}
                              />
                            </div>
                          </div>

                          <div className="mt-6 md:mt-0 text-center md:text-right border-t md:border-t-0 border-white/10 pt-6 md:pt-0 w-full md:w-auto">
                            <p className="text-gray-400 text-[10px] mobile:text-xs mb-1 uppercase tracking-widest font-bold">Account Authority</p>
                            <p className="text-xl mobile:text-2xl font-mono font-bold tracking-widest text-white mb-2 uppercase">{userProfile?.userCode || 'SOLARIEM_USER'}</p>
                            <div className="flex flex-col md:items-end items-center gap-2">
                              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${userProfile?.emailVerified
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  }`}>
                                  {userProfile?.emailVerified ? 'Email Verified' : 'Email Pending'}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${userProfile?.kycStatus === 'verified'
                                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                  : userProfile?.kycStatus === 'pending'
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                  }`}>
                                  {userProfile?.kycStatus === 'verified' ? 'System Verified' : userProfile?.kycStatus === 'pending' ? 'Verification Pending' : 'KYC Required'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Transfer & Card Actions */}
                      <div className="space-y-4 mobile:space-y-6">
                        <div className="flex flex-col space-y-1">
                          <h3 className="text-lg mobile:text-xl font-bold text-navy-900">Financial Actions</h3>
                          <p className="text-sm mobile:text-base text-gray-400">Choose from our popular actions below</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mobile:gap-6">
                          {/* Deposit Action */}
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary-500 transition-all group overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-50 rounded-full group-hover:bg-primary-100 transition-colors"></div>
                            <Plus className="relative z-10 w-8 h-8 text-primary-600 mb-4" />
                            <h4 className="relative z-10 font-bold text-navy-900 mb-1 text-sm mobile:text-base uppercase tracking-tighter">Deposit</h4>
                            <p className="relative z-10 text-[10px] text-gray-400 mb-4 font-black uppercase tracking-widest">Add funds to your account</p>
                            <button onClick={() => {
                              const isVerified = userProfile?.emailVerified && userProfile?.kycStatus === 'verified';
                              setActiveSection('deposit');
                            }} className="relative z-10 text-xs font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center">
                              Add Now <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                          </div>

                          {/* Loan Action */}
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#14130F] transition-all group overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-50/10 rounded-full group-hover:bg-primary-50/20 transition-colors"></div>
                            <Briefcase className="relative z-10 w-8 h-8 text-[#14130F] mb-4" />
                            <h4 className="relative z-10 font-bold text-navy-900 mb-1 text-sm mobile:text-base uppercase tracking-tighter">Loan Services</h4>
                            <p className="relative z-10 text-[10px] text-gray-400 mb-4 font-black uppercase tracking-widest">Instant financial assistance</p>
                            <button onClick={() => {
                              if (userProfile?.isAccountRestricted) {
                                showError('Financial actions are restricted. Please resolve the account restriction to proceed.');
                                return;
                              }
                              const isVerified = userProfile?.emailVerified && userProfile?.kycStatus === 'verified';
                              if (!isVerified) {
                                showError('Please verify your email and complete KYC to access this feature.');
                                return;
                              }
                              setActiveSection('loans');
                            }} className="relative z-10 text-xs font-black text-[#14130F] uppercase tracking-widest hover:underline flex items-center">
                              Apply Now <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                          </div>

                          {/* Tax Refund Action */}
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary-500 transition-all group overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-50 rounded-full group-hover:bg-primary-100 transition-colors"></div>
                            <FileText className="relative z-10 w-8 h-8 text-primary-600 mb-4" />
                            <h4 className="relative z-10 font-bold text-navy-900 mb-1 text-sm mobile:text-base uppercase tracking-tighter">Tax Refund</h4>
                            <p className="relative z-10 text-[10px] text-gray-400 mb-4 font-black uppercase tracking-widest">Claim your tax rebate</p>
                            <button onClick={() => {
                              if (userProfile?.isAccountRestricted) {
                                showError('Financial actions are restricted. Please resolve the account restriction to proceed.');
                                return;
                              }
                              const isVerified = userProfile?.emailVerified && userProfile?.kycStatus === 'verified';
                              if (!isVerified) {
                                showError('Please verify your email and complete KYC to access this feature.');
                                return;
                              }
                              setActiveSection('tax-refund');
                            }} className="relative z-10 text-xs font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center">
                              Submit Claim <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Recent Transactions */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-700">
                        <div className="p-4 mobile:p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                          <h3 className="font-black text-navy-900 text-sm mobile:text-base uppercase tracking-tighter">Recent Activity</h3>
                          <button onClick={() => setActiveSection('logs')} className="text-primary-600 font-black text-[10px] mobile:text-xs uppercase tracking-widest hover:underline">View Ledger</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {loadingRecent ? (
                            <div className="p-12 text-center">
                              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                          ) : recentTransactions.length > 0 ? (
                            recentTransactions.map((tx) => (
                              <div key={tx.id} className="p-4 mobile:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 mobile:gap-4">
                                  <div className={`w-10 h-10 mobile:w-12 mobile:h-12 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'deposit' ? 'bg-green-50 text-green-600' :
                                    tx.type === 'withdrawal' ? 'bg-red-50 text-red-600' :
                                      tx.type === 'transfer' ? 'bg-blue-50 text-blue-600' :
                                        tx.type === 'card' ? 'bg-navy-50 text-navy-600' :
                                          tx.type === 'loan' ? 'bg-purple-50 text-purple-600' :
                                            tx.type === 'tax_refund' ? 'bg-primary-50 text-primary-600' :
                                              tx.type === 'recovery' ? 'bg-orange-50 text-orange-600' :
                                                'bg-gray-50 text-gray-600'
                                    }`}>
                                    {tx.type === 'deposit' ? <Plus className="w-5 h-5" /> :
                                      tx.type === 'withdrawal' ? <ArrowDownUp className="w-5 h-5" /> :
                                        tx.type === 'transfer' ? <ArrowLeftRight className="w-5 h-5" /> :
                                          tx.type === 'card' ? <CreditCard className="w-5 h-5" /> :
                                            tx.type === 'loan' ? <Briefcase className="w-5 h-5" /> :
                                              tx.type === 'tax_refund' ? <FileText className="w-5 h-5" /> :
                                                tx.type === 'recovery' ? <Activity className="w-5 h-5" /> :
                                                  <Activity className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <p className="text-[11px] mobile:text-xs font-black text-navy-900 uppercase tracking-tight truncate max-w-[120px] mobile:max-w-none">{tx.details}</p>
                                    <p className="text-[9px] mobile:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                      {new Date(tx.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xs mobile:text-sm font-black ${tx.type === 'deposit' || (tx.type === 'transfer' && !tx.isSent) ? 'text-green-600' :
                                    (tx.type === 'tax_refund' || tx.type === 'recovery') ? 'text-navy-900' :
                                      'text-red-500'
                                    }`}>
                                    {tx.type === 'deposit' || (tx.type === 'transfer' && !tx.isSent) ? '+' :
                                      (tx.type === 'tax_refund' || tx.type === 'recovery') ? '' : '-'}{currencySymbol}
                                    {Math.abs(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: tx.amount > 0 ? 2 : 0 })}
                                  </p>
                                  <p className={`text-[8px] mobile:text-[9px] font-black uppercase tracking-widest ${tx.status === 'completed' || tx.status === 'processed' ? 'text-green-500' :
                                    tx.status === 'failed' || tx.status === 'rejected' ? 'text-red-500' :
                                      'text-primary-500'
                                    }`}>{tx.status}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-12 text-center">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <History className="text-gray-200 w-8 h-8" />
                              </div>
                              <p className="font-black text-navy-900 text-xs uppercase tracking-tight">No active ledger items</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-6">Your transaction history will materialize here</p>
                              <button onClick={() => setActiveSection('deposit')} className="px-6 py-2 bg-navy-900 text-navy-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10">Initialize Deposit</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column (1/3) */}
                    <div className="space-y-4 mobile:space-y-8">
                      {/* Time & Card Section */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mobile:p-6 space-y-4 mobile:space-y-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 mobile:space-x-3 text-navy-900">
                            <Calendar className="w-4 h-4 mobile:w-5 mobile:h-5 text-primary-600" />
                            <span className="font-bold uppercase tracking-wider text-[10px] mobile:text-xs">{formattedDate.split(',')[0]}</span>
                          </div>
                          <span className="text-xl mobile:text-2xl font-black text-navy-900">{formattedTime}</span>
                        </div>

                        <div className="pt-4 mobile:pt-6 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-navy-900 text-sm mobile:text-base">Asset Overview</h3>
                            <PieChart className="w-4 h-4 text-primary-600" />
                          </div>

                          {(() => {
                            const settles = userProfile?.balances?.main || 0;
                            const cardLiquidity = totalCardBalance;
                            const total = settles + cardLiquidity;
                            const circum = 251.32;

                            const settlesP = total > 0 ? (settles / total) * circum : 0;
                            const liquidityP = total > 0 ? (cardLiquidity / total) * circum : 0;

                            return (
                              <div className="flex flex-col items-center">
                                <div className="relative w-40 h-40">
                                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    {/* Background Circle */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F5F4F0" strokeWidth="12" />

                                    {/* Settled Funds */}
                                    <circle
                                      cx="50" cy="50" r="40"
                                      fill="transparent"
                                      stroke="#14130F"
                                      strokeWidth="12"
                                      strokeDasharray={`${settlesP} ${circum}`}
                                      className="transition-all duration-1000"
                                    />

                                    {/* Card Liquidity */}
                                    <circle
                                      cx="50" cy="50" r="40"
                                      fill="transparent"
                                      stroke="#EAB308"
                                      strokeWidth="12"
                                      strokeDasharray={`${liquidityP} ${circum}`}
                                      strokeDashoffset={-settlesP}
                                      className="transition-all duration-1000"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-navy-900 leading-none">
                                      {total > 0 ? '100%' : '0%'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Equity</span>
                                  </div>
                                </div>

                                <div className="mt-6 w-full space-y-2">
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-[#14130F] rounded-sm"></div>
                                      <span className="text-gray-500 uppercase">Settled Funds</span>
                                    </div>
                                    <span className="text-navy-900">{currencySymbol}{settles.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-primary-500 rounded-sm"></div>
                                      <span className="text-gray-500 uppercase">Card Liquidity</span>
                                    </div>
                                    <span className="text-navy-900">{currencySymbol}{cardLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Account Statistics (Swapped to Top) */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mobile:p-6">
                        <h3 className="font-bold text-navy-900 mb-4 mobile:mb-6 text-sm mobile:text-base">Account Statistics</h3>
                        <div className="space-y-3 mobile:space-y-4">
                          {[
                            { label: 'Transaction Limit', value: `${currencySymbol}500,000.00` },
                            { label: 'Pending Transactions', value: `${currencySymbol}${stats.pendingTotal.toLocaleString()}` },
                            { label: 'Transaction Volume', value: `${currencySymbol}${stats.volumeTotal.toLocaleString()}` },
                            { label: 'Account Age', value: stats.accountAge },
                          ].map((stat, i) => (
                            <div key={i} className="flex justify-between items-center py-2.5 mobile:py-3 border-b border-gray-50 last:border-0">
                              <span className="text-gray-400 text-xs mobile:text-sm">{stat.label}</span>
                              <span className="text-navy-900 font-bold text-xs mobile:text-sm">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Promotional Side (Swapped to Bottom) */}
                      <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-4 mobile:p-6 text-white overflow-hidden relative border border-primary-500/20 shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full -mr-16 -mt-16 blur-xl"></div>
                        <h3 className="font-bold mb-3 mobile:mb-4 relative z-10 text-sm mobile:text-base">Virtual Card</h3>
                        <div className="mb-4 relative z-10">
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 aspect-[1.6/1] flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <CreditCard className="w-8 h-8 text-primary-500/80" />
                              <span className="text-[10px] font-bold tracking-widest text-primary-500 opacity-60">VISA</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-lg font-mono tracking-[0.2em]">•••• •••• •••• 1234</p>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-[6px] uppercase tracking-widest text-gray-400">VALID THRU</p>
                                  <p className="text-[10px] font-mono">12/25</p>
                                </div>
                                <div className="w-8 h-5 bg-primary-500/20 rounded-sm"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-4 relative z-10">Create virtual cards for secure online payments and subscription management.</p>
                        <button
                          onClick={() => handleNavigate('cards')}
                          className="w-full py-2 bg-primary-500 text-white rounded-xl font-bold text-xs mobile:text-sm hover:bg-primary-400 transition-colors"
                        >
                          Apply Now
                        </button>
                      </div>

                      {/* Help & Support */}
                      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mobile:p-6 text-center">
                        <HeadphonesIcon className="w-8 h-8 mobile:w-10 mobile:h-10 text-primary-600 mx-auto mb-2 mobile:mb-3" />
                        <h4 className="font-bold text-navy-900 text-sm mobile:text-base">Need Help?</h4>
                        <p className="text-navy-900/60 text-[10px] mobile:text-xs mt-1 mb-3 mobile:mb-4 leading-relaxed">Our support team is here to assist you 24/7</p>
                        <button onClick={() => setActiveSection('support')} className="w-full py-2 bg-navy-900 text-navy-50 rounded-xl font-bold text-xs mobile:text-sm">Contact Support</button>
                      </div>

                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-transparent min-h-[500px]">
                  {/* Section Content (Header removed per request if it's redundant) */}
                  {!(activeSection === 'profile' || activeSection === 'support' || activeSection === 'settings' || activeSection === 'account_hub') && (
                    <div className="flex flex-col space-y-4 mb-6 mobile:mb-8 pb-4 mobile:pb-6 border-b border-gray-50">
                      {/* Breadcrumbs/Back button for mobile */}
                      {isSubSection && (
                        <button
                          onClick={() => setActiveSection(currentHub?.id || 'dashboard')}
                          className="flex items-center text-primary-600 text-xs mobile:text-sm font-bold hover:translate-x-[-4px] transition-transform w-fit"
                        >
                          <ArrowUpDown className="w-3 h-3 rotate-90 mr-1.5" />
                          Back to {currentHub?.name}
                        </button>
                      )}
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl mobile:text-2xl font-bold text-navy-900 flex items-center">
                          {isSubSection
                            ? (
                              {
                                deposit: 'Deposit',
                                withdraw: 'Withdrawal',
                                transfer: 'Send Money',
                                logs: 'History',
                                notifications: 'Notifications',
                                profile: 'Account Info',
                                kyc: 'Identity Verification',
                                support: 'Contact Support',
                                cards: 'Virtual Cards',
                                loans: 'Loan Services',
                                'tax-refund': 'Tax Refund',
                              } as Record<string, string>
                            )[activeSection]
                            : currentHub?.name}
                        </h2>
                        <button
                          onClick={() => {
                            if (activeSection === 'kyc') {
                              setActiveSection('account_hub');
                            } else {
                              setActiveSection('dashboard');
                            }
                          }}
                          className="text-gray-400 hover:text-navy-900 flex items-center text-xs mobile:text-sm font-bold"
                        >
                          <X className="w-4 h-4 mr-1" /> Close
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sections and Hubs */}
                  {activeSection === 'transactions_hub' && <TransactionsHub onNavigate={handleNavigate} />}
                  {activeSection === 'account_hub' && <AccountHub onNavigate={handleNavigate} />}
                  {activeSection === 'services_hub' && <ServicesHub onNavigate={handleNavigate} />}

                  {activeSection === 'deposit' && (
                    <DepositSection
                      initialAmount={pendingDepositAmount}
                      isFixedAmount={!!pendingDepositAmount}
                    />
                  )}
                  {activeSection === 'withdraw' && <WithdrawSection />}
                  {activeSection === 'transfer' && <TransferMoneySection />}
                  {activeSection === 'logs' && <UnifiedLogsSection />}
                  {activeSection === 'profile' && <ProfileSection />}
                  {activeSection === 'support' && <SupportSection />}
                  {activeSection === 'loans' && <LoanSection />}
                  {activeSection === 'tax-refund' && <TaxRefundSection />}
                  {activeSection === 'recovery' && <RecoverySection />}
                  {activeSection === 'kyc' && (
                    userProfile?.kycStatus === 'verified'
                      ? null
                      : <KYCSection />
                  )}
                  {activeSection === 'admin' && <AdminSection />}
                  {activeSection === 'cards' && <VirtualCardsSection />}
                </div>
              )}
            </div>

            {/* Account Blocked Overlay */}
            {userProfile?.isAccountBlocked && activeSection !== 'deposit' && (
              <AccountBlockedOverlay
                reason={userProfile.accountBlockReason || ''}
                unblockFee={userProfile.accountUnblockFee || 0}
                currency={userProfile.currency || 'USD'}
                onPayFee={() => {
                  setPendingDepositAmount(userProfile.accountUnblockFee || 0);
                  setActiveSection('deposit');
                }}
              />
            )}

            {/* Bottom Nav for Mobile - Grouped for all links */}
            <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[96vw] max-w-[480px]">
              <div className="bg-[#14130F]/95 backdrop-blur-xl border border-navy-800 rounded-full p-1 flex items-center justify-between gap-1 shadow-2xl">
                {dashboardLinks.map((link) => {
                  const isActive = activeSection === link.id || (link.subItems && link.subItems.includes(activeSection));

                  const hasUnverifiedEmail = !userProfile?.emailVerified && link.id === 'account_hub';
                  const hasUnverifiedKyc = userProfile?.kycStatus !== 'verified' && link.id === 'account_hub';
                  const showMobileDot = hasUnverifiedEmail || hasUnverifiedKyc;
                  const dotColor = hasUnverifiedEmail ? 'bg-amber-500' : (userProfile?.kycStatus === 'pending' ? 'bg-amber-500' : 'bg-red-500');

                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavigate(link.id)}
                      className={`relative flex items-center transition-all duration-500 ease-out group ${isActive
                        ? 'bg-primary-500 text-[#14130F] rounded-full pr-3 pl-0.5 py-0.5'
                        : 'text-gray-400 p-2 hover:text-white'
                        }`}
                    >
                      <div className={`w-9 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${isActive ? 'bg-[#14130F] text-primary-500 shadow-sm' : 'bg-transparent'
                        }`}>
                        {link.icon}
                      </div>
                      {isActive && (
                        <span className="text-xs font-bold ml-1 whitespace-nowrap overflow-hidden">
                          {link.name}
                        </span>
                      )}
                      {showMobileDot && !isActive && (
                        <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${dotColor} animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]`}></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </DashboardLoader>
    </ProtectedRoute >
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#14130F]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary-500 font-bold tracking-widest uppercase text-xs">Solariem Secure Login...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
