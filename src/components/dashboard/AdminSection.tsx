'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Search,
  Shield,
  User,
  UserCheck,
  RefreshCw,
  Ban,
  CheckCircle,
  XCircle,
  Bell,
  Mail,
  Phone,
  MapPin,
  Activity,
  AlertTriangle,
  MessageSquare,
  Clock,
  ShieldCheck,
  Download,
  Upload,
  ExternalLink,
  X,
  AlertCircle,
  Briefcase,
  FileText,
  Globe,
  ArrowLeftRight,
  FileSearch,
  ArrowRight,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { canAccessAdmin } from '@/utils/adminUtils';
import { getPaymentMethods } from '@/lib/services/PaymentMethodService';
import { getCurrencySymbol } from '@/lib/currencies';
import WithdrawalScheduleManager from '@/components/admin/WithdrawalScheduleManager';

import SupportMessagesManager from '@/components/admin/SupportMessagesManager';
import NewsletterManager from '@/components/admin/NewsletterManager';
import TestimonialManager from '@/components/admin/TestimonialManager';
import CardTopUpManager from '@/components/admin/CardTopUpManager';
import RecoveryCaseManager from '@/components/admin/RecoveryCaseManager';
import UserCodesManager from '@/components/admin/UserCodesManager';
// Note: UserService is server-side only, we'll use API calls instead

interface PaymentMethod {
  _id?: string;
  name: string;
  logo: string;
  accountDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    walletAddress?: string;
    network?: string;
  };
  instructions?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminUser {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  emailVerified: boolean;
  userCode: string;
  currency?: string;
  isAdmin: boolean;
  isActive: boolean;
  profilePicture?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  totalDeposit: number;
  totalWithdraw: number;
  referralEarnings: number;
  referredBy?: string;
  referredByCode?: string;
  balances?: {
    main: number;
    referral: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  activityLog?: Array<{
    action: string;
    timestamp: string;
  }>;
  kycDocuments?: {
    idFront?: string;
    idBack?: string;
    selfie?: string;
    documentType?: string;
    status?: string;
    rejectionReason?: string;
    submittedAt?: string;
  };
  kycStatus?: 'not_started' | 'pending' | 'verified' | 'rejected';
  accountType?: string;
  isAccountBlocked?: boolean;
  isAccountRestricted?: boolean;
  accountBlockReason?: string;
  accountUnblockFee?: number;
}

interface DepositRequest {
  _id?: string;
  userId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  screenshot?: string;
  paymentDetailsString?: string;
  status: 'pending_details' | 'awaiting_payment' | 'verifying' | 'completed' | 'rejected' | 'pending' | 'approved';
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

interface WithdrawalRequest {
  _id?: string;
  userId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  accountDetails: {
    accountName: string;
    accountNumber: string;
    bankName?: string;
    walletAddress?: string;
    network?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  processedBy?: string;
  processedAt?: Date;
  rejectionReason?: string;
}

const AdminSection = () => {
  const { user, userProfile } = useAuth();
  const adminCurrency = userProfile?.currency || 'USD';
  const adminCurrencySymbol = getCurrencySymbol(adminCurrency);
  const [activeTab, setActiveTab] = useState<'users' | 'kyc-requests' | 'card-requests' | 'card-topups' | 'loan-requests' | 'tax-refunds' | 'payments' | 'transactions' | 'support' | 'withdrawal-schedule' | 'recovery-ops' | 'newsletter' | 'testimonials' | 'user-codes'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [kycRequests, setKycRequests] = useState<AdminUser[]>([]);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [cardRequests, setCardRequests] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cardRejectionReason, setCardRejectionReason] = useState('');
  const [loanRequests, setLoanRequests] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [loanRejectionReason, setLoanRejectionReason] = useState('');
  const [taxRefundRequests, setTaxRefundRequests] = useState<any[]>([]);
  const [loadingTaxRefunds, setLoadingTaxRefunds] = useState(false);
  const [showTaxRefundModal, setShowTaxRefundModal] = useState(false);
  const [selectedTaxRefund, setSelectedTaxRefund] = useState<any>(null);
  const [taxRefundRejectionReason, setTaxRefundRejectionReason] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');


  // User detail states
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [userDetailData, setUserDetailData] = useState<AdminUser | null>(null);
  const [userIndividualMessage, setUserIndividualMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [newPayment, setNewPayment] = useState<Partial<PaymentMethod>>({});
  const [paymentLogoFile, setPaymentLogoFile] = useState<File | null>(null);
  const [paymentLogoPreview, setPaymentLogoPreview] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Transaction modal states
  const [selectedTransaction, setSelectedTransaction] = useState<DepositRequest | WithdrawalRequest | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<'deposits' | 'withdrawals'>('deposits');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminPaymentDetails, setAdminPaymentDetails] = useState('');
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedKycUser, setSelectedKycUser] = useState<AdminUser | null>(null);
  const [kycRejectionReason, setKycRejectionReason] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deleteUser' | 'deletePayment';
    id: string;
    name: string;
  } | null>(null);

  const [taxRefundAmountToCredit, setTaxRefundAmountToCredit] = useState<number>(0);

  // Notification states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationType, setNotificationType] = useState<'individual' | 'broadcast'>('individual');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationDetails, setNotificationDetails] = useState('');
  const [notificationFiles, setNotificationFiles] = useState<File[]>([]);
  const [selectedUsersForNotification, setSelectedUsersForNotification] = useState<string[]>([]);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationPreview, setNotificationPreview] = useState<string | null>(null);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);

  // Status manual action states
  const [showStatusActionModal, setShowStatusActionModal] = useState(false);
  const [statusActionType, setStatusActionType] = useState<'block' | 'restrict' | 'normal'>('block');
  const [statusActionFee, setStatusActionFee] = useState('0');
  const [statusActionReason, setStatusActionReason] = useState('');
  const [isProcessingStatus, setIsProcessingStatus] = useState(false);

  // New Balance Adjustment states
  const [showBalanceAdjustmentModal, setShowBalanceAdjustmentModal] = useState(false);
  const [balanceAdjustmentData, setBalanceAdjustmentData] = useState({
    amount: '',
    action: 'add' as 'add' | 'subtract',
    reason: ''
  });
  const [isProcessingBalanceAdjustment, setIsProcessingBalanceAdjustment] = useState(false);

  // Check if user is admin
  const isAdmin = canAccessAdmin(userProfile);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Check initial status
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'kyc-requests') {
      loadKycRequests();
    } else if (activeTab === 'card-requests') {
      loadCardRequests();
    } else if (activeTab === 'loan-requests') {
      loadLoanRequests();
    } else if (activeTab === 'tax-refunds') {
      loadTaxRefundRequests();
    }
  }, [activeTab]);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        console.error('Error loading users:', result.error);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadPaymentMethods();
      loadTransactions();
    }
  }, [isAdmin, loadUsers]);



  const loadPaymentMethods = async (forceRefetch = false) => {
    setLoadingPayments(true);
    try {
      const methods = await getPaymentMethods(forceRefetch);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setPaymentMethods([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      // Load deposit requests
      const depositsResponse = await fetch('/api/transactions?type=deposits');
      const depositsResult = await depositsResponse.json();

      if (depositsResult.success) {
        setDepositRequests(depositsResult.data);
      }

      // Load withdrawal requests
      const withdrawalsResponse = await fetch('/api/transactions?type=withdrawals');
      const withdrawalsResult = await withdrawalsResponse.json();

      if (withdrawalsResult.success) {
        setWithdrawalRequests(withdrawalsResult.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      showError('Failed to load transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const openTransactionModal = async (transaction: any) => {
    setIsLoadingTransactions(true);
    try {
      const response = await fetch(`/api/transactions/${transaction._id}`);
      const result = await response.json();
      if (result.success) {
        setSelectedTransaction(result.data);
        setShowTransactionModal(true);
      } else {
        showError('Failed to load transaction details.');
      }
    } catch (e) {
      showError('Error loading transaction details.');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const openKycModal = async (userParam: any) => {
    setLoadingKyc(true);
    try {
      const response = await fetch(`/api/users/${userParam._id}`);
      const result = await response.json();
      if (result.success) {
        setSelectedKycUser(result.data);
        setShowKycModal(true);
      } else {
        showError('Failed to load KYC details.');
      }
    } catch (e) {
      showError('Error loading KYC details.');
    } finally {
      setLoadingKyc(false);
    }
  };

  const getUserInfo = (userId: string) => {
    const user = users.find(u => u._id === userId);
    return user ? {
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      userCode: user.userCode || 'N/A',
      userId: user._id || 'N/A',
      email: user.email || 'N/A',
      currency: user.currency || adminCurrency,
      currencySymbol: getCurrencySymbol(user.currency || adminCurrency)
    } : {
      name: 'Unknown User',
      userCode: 'N/A',
      userId: userId,
      email: 'N/A',
      currency: adminCurrency,
      currencySymbol: adminCurrencySymbol
    };
  };

  // Group deposit statuses into human-readable buckets for the filter
  // and the list/status badges. New deposits are created with
  // 'pending_details' so the 'pending' filter has to be a union.
  const DEPOSIT_STATUS_GROUPS: Record<string, string[]> = {
    pending: ['pending_details', 'awaiting_payment', 'verifying', 'pending'],
    approved: ['approved', 'completed'],
    rejected: ['rejected']
  };
  const formatDepositStatus = (status: string) => {
    switch (status) {
      case 'pending_details': return 'Awaiting Details';
      case 'awaiting_payment': return 'Awaiting Payment';
      case 'verifying': return 'Verifying Payment';
      case 'approved': return 'Approved';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };
  const depositsInGroup = (group: string) => {
    const statuses = DEPOSIT_STATUS_GROUPS[group] || [];
    return depositRequests.filter((d) => statuses.includes(d.status));
  };

  const getFilteredDeposits = () => {
    let filtered = depositRequests;

    // Filter by status (group-aware so 'pending' shows all open deposits)
    if (depositFilter !== 'all') {
      const statuses = DEPOSIT_STATUS_GROUPS[depositFilter] || [depositFilter];
      filtered = filtered.filter(deposit => statuses.includes(deposit.status));
    }

    // Filter by search term
    if (transactionSearchTerm) {
      filtered = filtered.filter(deposit => {
        const userInfo = getUserInfo(deposit.userId);
        const searchLower = transactionSearchTerm.toLowerCase();
        return (
          userInfo.name.toLowerCase().includes(searchLower) ||
          userInfo.email.toLowerCase().includes(searchLower) ||
          userInfo.userCode.toLowerCase().includes(searchLower) ||
          deposit.amount.toString().includes(searchLower) ||
          deposit._id?.toString().includes(searchLower)
        );
      });
    }

    return filtered;
  };

  const getFilteredWithdrawals = () => {
    let filtered = withdrawalRequests;

    // Filter by status
    if (withdrawalFilter !== 'all') {
      filtered = filtered.filter(withdrawal => withdrawal.status === withdrawalFilter);
    }

    // Filter by search term
    if (transactionSearchTerm) {
      filtered = filtered.filter(withdrawal => {
        const userInfo = getUserInfo(withdrawal.userId);
        const searchLower = transactionSearchTerm.toLowerCase();
        return (
          userInfo.name.toLowerCase().includes(searchLower) ||
          userInfo.email.toLowerCase().includes(searchLower) ||
          userInfo.userCode.toLowerCase().includes(searchLower) ||
          withdrawal.amount.toString().includes(searchLower) ||
          withdrawal._id?.toString().includes(searchLower)
        );
      });
    }

    return filtered;
  };

  const handleBalanceAdjustment = async () => {
    if (!userDetailData || !userDetailData._id) return;
    if (!balanceAdjustmentData.amount || !balanceAdjustmentData.reason) {
      showError('Please provide amount and reason');
      return;
    }

    setIsProcessingBalanceAdjustment(true);
    try {
      const response = await fetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userDetailData._id,
          amount: balanceAdjustmentData.amount,
          action: balanceAdjustmentData.action,
          reason: balanceAdjustmentData.reason,
          adminId: userProfile?.email || 'admin'
        })
      });

      const result = await response.json();
      if (result.success) {
        showSuccess('Balance adjusted successfully');
        setShowBalanceAdjustmentModal(false);
        setBalanceAdjustmentData({ amount: '', action: 'add', reason: '' });
        // Refresh users to get latest balances
        loadUsers();
        // Update local detail view if possible
        const updatedUser = users.find(u => u._id === userDetailData._id);
        if (updatedUser) {
           setUserDetailData({
              ...userDetailData,
              balances: updatedUser.balances
           } as AdminUser);
        }
      } else {
        showError(result.error || 'Failed to adjust balance');
      }
    } catch (error) {
      console.error('Error adjusting balance:', error);
      showError('An error occurred while adjusting balance');
    } finally {
      setIsProcessingBalanceAdjustment(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, type: 'deposit' | 'withdrawal', status: string, rejectionReason?: string, paymentDetailsString?: string) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: transactionId,
          type,
          status,
          rejectionReason,
          paymentDetailsString,
          approvedBy: user?._id,
          approvedAt: new Date(),
          userId: selectedTransaction?.userId,
          amount: selectedTransaction?.amount
        })
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(`Transaction ${status} successfully!`);
        loadTransactions();
      } else {
        showError(result.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      showError('An error occurred while updating the transaction');
    }
  };

  const loadKycRequests = async () => {
    setLoadingKyc(true);
    try {
      const response = await fetch('/api/admin/kyc');
      const result = await response.json();
      if (result.success) {
        setKycRequests(result.data);
      } else {
        showError(result.error || 'Failed to load KYC requests');
      }
    } catch (error) {
      console.error('Error loading KYC requests:', error);
      showError('Failed to load KYC requests');
    } finally {
      setLoadingKyc(false);
    }
  };

  const loadCardRequests = async () => {
    setLoadingCards(true);
    try {
      const response = await fetch('/api/admin/cards?status=pending');
      const result = await response.json();
      if (result.success) {
        setCardRequests(result.data);
      } else {
        showError(result.error || 'Failed to load card requests');
      }
    } catch (error) {
      console.error('Error loading card requests:', error);
      showError('Failed to load card requests');
    } finally {
      setLoadingCards(false);
    }
  };

  const loadLoanRequests = useCallback(async () => {
    setLoadingLoans(true);
    try {
      const response = await fetch('/api/admin/loans');
      const result = await response.json();
      if (result.success) setLoanRequests(result.data);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoadingLoans(false);
    }
  }, []);

  const loadTaxRefundRequests = useCallback(async () => {
    setLoadingTaxRefunds(true);
    try {
      const response = await fetch('/api/admin/tax-refunds');
      const result = await response.json();
      if (result.success) setTaxRefundRequests(result.data);
    } catch (error) {
      console.error('Error loading tax refunds:', error);
    } finally {
      setLoadingTaxRefunds(false);
    }
  }, []);

  const updateLoanStatus = async (id: string, status: string, reason?: string) => {
    try {
      const response = await fetch('/api/admin/loans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, rejectionReason: reason })
      });
      const result = await response.json();
      if (result.success) {
        showSuccess(`Loan application ${status} successfully.`);
        loadLoanRequests();
      } else {
        showError(result.error || 'Failed to update loan status');
      }
    } catch (error) {
      showError('An error occurred.');
    }
  };

  const updateTaxRefundStatus = async (id: string, status: string, reason?: string) => {
    try {
      const payload: any = { id, status, rejectionReason: reason };
      if (status === 'approved') {
        payload.amountToCredit = taxRefundAmountToCredit;
      }
      const response = await fetch('/api/admin/tax-refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        showSuccess(`Tax refund request ${status} successfully.`);
        loadTaxRefundRequests();
      } else {
        showError(result.error || 'Failed to update request status');
      }
    } catch (error) {
      showError('An error occurred.');
    }
  };

  const updateCardStatus = async (cardId: string, action: 'approve' | 'decline', reason?: string) => {
    try {
      const response = await fetch('/api/admin/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, action, reason })
      });
      const result = await response.json();
      if (result.success) {
        showSuccess(`Card request ${action}d successfully`);
        loadCardRequests();
      } else {
        showError(result.error || `Failed to ${action} card request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing card request:`, error);
      showError(`Failed to ${action} card request`);
    }
  };

  const updateKycRequestStatus = async (userId: string, action: 'approve' | 'decline', reason?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, reason })
      });
      const result = await response.json();
      if (result.success) {
        showSuccess(`KYC request ${action}d successfully`);
        loadKycRequests();
        return true;
      } else {
        showError(result.error || `Failed to ${action} KYC request`);
        return false;
      }
    } catch (error) {
      console.error(`Error ${action}ing KYC request:`, error);
      showError(`Failed to ${action} KYC request`);
      return false;
    }
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('User updated successfully');
        loadUsers();
        return true;
      } else {
        showError(result.error || 'Failed to update user');
        return false;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Failed to update user');
      return false;
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    await updateUser(userId, { isActive });
  };

  const makeAdmin = async (userId: string, isAdmin: boolean) => {
    await updateUser(userId, { isAdmin });
  };

  const handleDeletePayment = (paymentId: string, paymentName: string) => {
    setConfirmAction({ type: 'deletePayment', id: paymentId, name: paymentName });
    setShowConfirmModal(true);
  };

  const executeDeleteAction = async () => {
    if (!confirmAction) return;

    setIsDeleting(true);
    try {
      switch (confirmAction.type) {
        case 'deleteUser':
          try {
            const response = await fetch(`/api/users/${confirmAction.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            const result = await response.json();

            if (result.success) {
              showSuccess('User deleted successfully');
              loadUsers();
            } else {
              showError(result.error || 'Failed to delete user');
            }
          } catch (error) {
            console.error('Error deleting user:', error);
            showError('Failed to delete user');
          }
          break;

        case 'deletePayment':
          const response = await fetch(`/api/payment-methods?id=${confirmAction.id}`, {
            method: 'DELETE'
          });
          const result = await response.json();

          if (result.success) {
            setMessage({ type: 'success', text: 'Payment method deleted successfully' });
            loadPaymentMethods(true);
          } else {
            setMessage({ type: 'error', text: result.error || 'Failed to delete payment method' });
          }
          break;
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage({ type: 'error', text: 'Failed to delete item' });
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const savePaymentMethod = async () => {
    setIsProcessingPayment(true);
    try {
      // Upload logo if file is selected
      let logoUrl = newPayment.logo || '';

      if (paymentLogoFile) {
        setIsUploadingLogo(true);
        const formData = new FormData();
        formData.append('file', paymentLogoFile);
        formData.append('folder', 'payment-methods');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          logoUrl = uploadResult.url;
        } else {
          setMessage({ type: 'error', text: 'Failed to upload logo image' });
          setIsProcessingPayment(false);
          setIsUploadingLogo(false);
          return;
        }
        setIsUploadingLogo(false);
      }

      // Validate required fields
      if (!newPayment.name || !logoUrl) {
        setMessage({ type: 'error', text: 'Gateway Name and Logo are required' });
        setIsProcessingPayment(false);
        return;
      }

      const paymentData = {
        name: newPayment.name,
        logo: logoUrl,
        isActive: newPayment.isActive !== false
      };

      if (editingPayment) {
        // Update existing payment method
        const response = await fetch('/api/payment-methods', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            _id: editingPayment._id,
            ...paymentData
          })
        });

        const result = await response.json();

        if (result.success) {
          setMessage({ type: 'success', text: 'Payment method updated successfully' });
          loadPaymentMethods(true);
          setShowPaymentModal(false);
          setEditingPayment(null);
          setNewPayment({});
          setPaymentLogoFile(null);
          setPaymentLogoPreview('');
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update payment method' });
        }
      } else {
        // Create new payment method
        const response = await fetch('/api/payment-methods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.success) {
          setMessage({ type: 'success', text: 'Payment method created successfully' });
          loadPaymentMethods(true);
          setShowPaymentModal(false);
          setNewPayment({});
          setPaymentLogoFile(null);
          setPaymentLogoPreview('');
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to create payment method' });
        }
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving the payment method' });
    } finally {
      setIsProcessingPayment(false);
    }
  };


  // Notification functions
  const sendNotification = async () => {
    if (!notificationMessage.trim() || !notificationTitle.trim()) return;

    setSendingNotification(true);
    try {
      // Upload files first if any
      const attachments = [];
      for (const file of notificationFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          attachments.push(uploadResult.data);
        }
      }

      const notificationData = {
        title: notificationTitle,
        message: notificationMessage,
        details: notificationDetails,
        type: notificationType,
        recipients: notificationType === 'broadcast' ? 'all' : selectedUsersForNotification,
        sentBy: user?._id,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      // Save notification to MongoDB via API
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setNotificationMessage('');
        setNotificationTitle('');
        setNotificationDetails('');
        setNotificationFiles([]);
        setSelectedUsersForNotification([]);
        setShowNotificationModal(false);

        showSuccess('Notification sent successfully!');
      } else {
        showError('Failed to send notification: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      showError('Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const openUserDetail = async (user: AdminUser) => {
    // Use the user's actual balances from the database
    setUserDetailData({
      ...user,
      balances: user.balances || {
        main: 0,
        referral: 0,
        total: 0
      },
      activityLog: [
        {
          action: 'Account Created',
          timestamp: user.createdAt ? (typeof user.createdAt === 'string' ? user.createdAt : new Date(user.createdAt).toISOString()) : new Date().toISOString()
        },
        ...(user.activityLog || [])
      ]
    });
    setShowUserDetailModal(true);
  };

  const sendUserNotification = async (userId: string, message: string) => {
    if (!message.trim()) return;

    setIsSendingMessage(true);

    try {
      const notificationData = {
        title: 'SECURE ADMINISTRATIVE BRIEFING',
        message,
        type: 'individual',
        recipients: [userId], // Using userId instead of referral code for MongoDB compatibility
        sentBy: user?._id
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      const result = await response.json();

      if (result.success) {
        setUserIndividualMessage('');
        showSuccess('Message sent successfully!');
      } else {
        showError('Failed to send message: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending user notification:', error);
      showError('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to unblock/unrestrict this account and refund the unblock fee?')) return;

    try {
      const response = await fetch('/api/admin/users/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Account restored and fee refunded successfully!');
        // Update local state
        if (userDetailData && userDetailData._id === userId) {
          setUserDetailData({
            ...userDetailData,
            isAccountBlocked: false,
            isAccountRestricted: false,
            accountBlockReason: '',
            accountUnblockFee: 0,
            balances: result.data.balances
          });
        }
        loadUsers();
      } else {
        showError('Failed to unblock account: ' + result.error);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      showError('Failed to unblock account');
    }
  };

  const handleUpdateUserStatus = async () => {
    if (!userDetailData || !userDetailData._id) return;

    setIsProcessingStatus(true);
    try {
      const response = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userDetailData._id,
          action: statusActionType,
          fee: statusActionFee,
          reason: statusActionReason
        })
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(`Account ${statusActionType}ed successfully!`);
        // Update local state
        setUserDetailData({
          ...userDetailData,
          ...result.data
        });
        setShowStatusActionModal(false);
        loadUsers();
      } else {
        showError(`Failed to ${statusActionType} account: ` + result.error);
      }
    } catch (error) {
      console.error(`Error updating user status:`, error);
      showError(`Failed to update account status`);
    } finally {
      setIsProcessingStatus(false);
    }
  };

  const handleFixBalances = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/fix-balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Balances fixed successfully!');
        // Reload user details to show updated balances
        await openUserDetail(userDetailData!);
        // Reload users list
        await loadUsers();
      } else {
        showError('Failed to fix balances: ' + result.error);
      }
    } catch (error) {
      console.error('Error fixing balances:', error);
      showError('Failed to fix balances');
    }
  };

  const filteredUsers = users
    .filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(user => {
      if (userStatusFilter === 'active' && user.isActive === false) return false;
      if (userStatusFilter === 'inactive' && user.isActive !== false) return false;
      return true;
    })
    .filter(user => {
      if (emailVerifiedFilter === 'verified' && user.emailVerified !== true) return false;
      if (emailVerifiedFilter === 'unverified' && user.emailVerified === true) return false;
      return true;
    })
    ;

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don&apos;t have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-[#14130F] border border-navy-800 text-white rounded-2xl p-6 mobile:p-8 relative overflow-hidden shadow-2xl shadow-navy-900/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl mobile:text-3xl font-black tracking-tighter uppercase mb-1">Admin Panel</h2>
            <p className="text-primary-500/80 font-medium text-xs mobile:text-base">Platform Management & Command Center</p>
          </div>
          <ShieldCheck className="w-12 h-12 mobile:w-16 mobile:h-16 text-primary-500/20" />
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success'
          ? 'bg-primary-500/10 border border-primary-500/20 text-primary-500 font-bold'
          : 'bg-red-500/10 border border-red-200 text-red-500 font-bold'
          }`}>
          {message.text}
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white rounded-2xl mobile:rounded-3xl border border-gray-100 shadow-sm p-4 mobile:p-8">
        <div className="flex flex-nowrap lg:flex-wrap gap-2 mobile:gap-3 mb-6 mobile:mb-10 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          {[
            { id: 'users', label: 'Users', icon: <Users className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'kyc-requests', label: 'KYC', icon: <UserCheck className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'card-requests', label: 'Cards', icon: <CreditCard className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'loan-requests', label: 'Loans', icon: <Briefcase className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'tax-refunds', label: 'Tax', icon: <FileText className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'transactions', label: 'Ledger', icon: <DollarSign className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'card-topups', label: 'Top-ups', icon: <ArrowLeftRight className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'testimonials', label: 'Feedback', icon: <MessageSquare className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'newsletter', label: 'Mail', icon: <Mail className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'support', label: 'Support', icon: <MessageSquare className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'recovery-ops', label: 'Recovery', icon: <FileSearch className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'withdrawal-schedule', label: 'Schedules', icon: <Clock className="w-4 h-4 mobile:w-5 mobile:h-5" /> },
            { id: 'user-codes', label: 'Codes', icon: <ShieldCheck className="w-4 h-4 mobile:w-5 mobile:h-5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 mobile:space-x-3 px-4 py-2.5 mobile:px-6 mobile:py-3.5 rounded-xl mobile:rounded-2xl font-black uppercase tracking-widest text-[9px] mobile:text-[11px] transition-all duration-300 group shrink-0 ${activeTab === tab.id
                ? 'bg-navy-900 text-navy-50 shadow-lg shadow-navy-900/10 scale-105'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
            >
              <div className={`transition-all duration-300 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-navy-900'}`}>
                {tab.icon}
              </div>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Card Requests Tab */}
        {activeTab === 'card-requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-navy-900 uppercase tracking-tighter">Virtual Card Bureau</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Pending Issuance Requests</p>
              </div>
              <button
                onClick={loadCardRequests}
                className="p-3 bg-gray-50 text-gray-400 hover:text-navy-900 rounded-xl transition-all"
                title="Refresh Records"
              >
                <RefreshCw className={`w-5 h-5 ${loadingCards ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingCards ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Querying issuance ledger...</p>
              </div>
            ) : cardRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cardRequests.map((request: any) => (
                  <div key={request._id} className="bg-white p-5 mobile:p-6 rounded-2xl mobile:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-navy-900/5 transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-4 mobile:mb-6">
                      <div className="flex items-center gap-3 mobile:gap-4">
                        <div className="w-10 h-10 mobile:w-12 mobile:h-12 bg-navy-900 rounded-xl mobile:rounded-2xl flex items-center justify-center text-navy-50 font-black shadow-lg shadow-navy-900/10 text-xs mobile:text-base">
                          {request.user?.firstName?.charAt(0)}{request.user?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] mobile:text-[11px] font-black uppercase tracking-tight text-navy-900">
                            {request.user?.firstName} {request.user?.lastName}
                          </p>
                          <p className="text-[8px] mobile:text-[9px] font-black text-primary-600 uppercase tracking-widest">{request.user?.userCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] mobile:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5 mobile:mb-1">Fee Paid</p>
                        <p className="text-xs mobile:text-sm font-black text-navy-900">{getCurrencySymbol(request.currency || request.user?.currency || adminCurrency)}{request.fee}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                        <span className="text-[10px] font-black text-navy-900 uppercase tracking-widest">{request.cardType}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Level</span>
                        <span className="px-3 py-1 bg-primary-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">{request.cardLevel}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Limit</span>
                        <span className="text-[10px] font-black text-navy-900 uppercase tracking-widest">{getCurrencySymbol(request.currency || request.user?.currency || adminCurrency)}{request.spendLimit?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedCard(request);
                          setShowCardModal(true);
                        }}
                        className="flex-1 bg-navy-900 hover:bg-navy-800 text-navy-50 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-navy-900/10 active:scale-95"
                      >
                        Audit Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                <CreditCard className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h4 className="text-sm font-black text-navy-900 uppercase tracking-widest">No Card Requests</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Issuance ledger is currently synchronized</p>
              </div>
            )}
          </div>
        )}

        {/* Loan Requests Tab */}
        {activeTab === 'loan-requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-navy-900 uppercase tracking-tighter">Loan Underwriting Bureau</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Pending Credit Applications</p>
              </div>
              <button
                onClick={loadLoanRequests}
                className="p-3 bg-gray-50 text-gray-400 hover:text-navy-900 rounded-xl transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${loadingLoans ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingLoans ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Checking credit ledger...</p>
              </div>
            ) : loanRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loanRequests.map((loan) => (
                  <div key={loan._id} className="bg-white p-5 mobile:p-6 rounded-2xl mobile:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4 mobile:mb-6">
                      <div className="flex items-center gap-3 mobile:gap-4">
                        <div className="w-10 h-10 mobile:w-12 mobile:h-12 bg-navy-900 rounded-xl mobile:rounded-2xl flex items-center justify-center text-navy-50 font-black text-xs mobile:text-base">
                          {loan.userDetails?.firstName?.[0]}{loan.userDetails?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-[10px] mobile:text-[11px] font-black uppercase text-navy-900">{loan.userDetails?.firstName} {loan.userDetails?.lastName}</p>
                          <p className="text-[8px] mobile:text-[9px] font-black text-primary-600 uppercase tracking-widest">{loan.userDetails?.userCode}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                        <span className="text-[10px] font-black text-navy-900">{getCurrencySymbol(loan.currency || loan.userDetails?.currency || adminCurrency)}{loan.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Facility</span>
                        <span className="text-[10px] font-black text-navy-900 uppercase tracking-widest">{loan.facility}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${loan.status === 'pending' ? 'bg-primary-50 text-primary-600 border border-primary-100' :
                          loan.status === 'approved' ? 'bg-green-50 text-green-500 border border-green-100' :
                            'bg-red-50 text-red-500 border border-red-100'
                          }`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedLoan(loan); setShowLoanModal(true); }}
                      className="w-full bg-navy-900 text-navy-50 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Audit App
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h4 className="text-sm font-black text-navy-900 uppercase tracking-widest">No Loan Requests</h4>
              </div>
            )}
          </div>
        )}

        {/* Tax Refunds Tab */}
        {activeTab === 'tax-refunds' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-navy-900 uppercase tracking-tighter">Tax Refund Portal</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Rebate Applications</p>
              </div>
              <button
                onClick={loadTaxRefundRequests}
                className="p-3 bg-gray-50 text-gray-400 hover:text-navy-900 rounded-xl transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${loadingTaxRefunds ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingTaxRefunds ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auditing tax records...</p>
              </div>
            ) : taxRefundRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {taxRefundRequests.map((req: any) => (
                  <div key={req._id} className="bg-white p-5 mobile:p-6 rounded-2xl mobile:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4 mobile:mb-6">
                      <div className="flex items-center gap-3 mobile:gap-4">
                        <div className="w-10 h-10 mobile:w-12 mobile:h-12 bg-navy-900 rounded-xl mobile:rounded-2xl flex items-center justify-center text-navy-50 font-black text-xs mobile:text-base">
                          {req.fullName?.[0]}
                        </div>
                        <div>
                          <p className="text-[10px] mobile:text-[11px] font-black uppercase text-navy-900">{req.fullName}</p>
                          <p className="text-[8px] mobile:text-[9px] font-black text-primary-600 uppercase tracking-widest">{req.country}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID Type</span>
                        <span className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Tax ID</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${req.status === 'pending' ? 'bg-primary-50 text-primary-600 border border-primary-100' :
                          req.status === 'processing' ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                            'bg-green-50 text-green-500 border border-green-100'
                          }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTaxRefundAmountToCredit(0);
                        setSelectedTaxRefund(req);
                        setShowTaxRefundModal(true);
                      }}
                      className="w-full bg-navy-900 text-navy-50 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Audit Identity
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h4 className="text-sm font-black text-navy-900 uppercase tracking-widest">No Rebate Requests</h4>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 mb-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
              <div className="flex flex-wrap items-center gap-4 flex-1">
                {isOffline && (
                  <div className="flex items-center space-x-2 bg-red-50 text-red-500 font-bold px-4 py-3 rounded-2xl border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Offline</span>
                  </div>
                )}
                <div className="relative group flex-1 min-w-[240px]">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900"
                  />
                </div>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 text-xs shadow-sm cursor-pointer min-w-[140px]"
                    title="Status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  <select
                    value={emailVerifiedFilter}
                    onChange={(e) => setEmailVerifiedFilter(e.target.value as 'all' | 'verified' | 'unverified')}
                    className="px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 text-xs shadow-sm cursor-pointer min-w-[140px]"
                    title="Email Verified"
                  >
                    <option value="all">All Verifications</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>
              </div>
              <button
                onClick={loadUsers}
                disabled={loadingUsers}
                className="bg-navy-900 hover:bg-navy-800 disabled:bg-navy-900/50 text-navy-50 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-navy-900/10 flex items-center gap-3 active:scale-95 shrink-0"
              >
                {loadingUsers ? (
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{loadingUsers ? 'Syncing...' : 'Sync Data'}</span>
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0E5A50]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                  <div
                    key={user._id}
                    className="bg-white rounded-2xl mobile:rounded-3xl p-4 mobile:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-500 cursor-pointer group"
                    onClick={() => openUserDetail(user)}
                  >
                    <div className="flex items-center justify-between mb-4 mobile:mb-6">
                      <div className="flex items-center space-x-3 mobile:space-x-4">
                        <div className="w-10 h-10 mobile:w-14 mobile:h-14 bg-gray-50 rounded-xl mobile:rounded-2xl flex items-center justify-center border border-gray-200 group-hover:bg-primary-50 group-hover:border-primary-200 transition-colors">
                          <Users className="w-5 h-5 mobile:w-7 mobile:h-7 text-gray-300 group-hover:text-primary-500" />
                        </div>
                        <div>
                          <div className="font-black text-navy-900 uppercase tracking-tight text-xs mobile:text-sm">{user.firstName} {user.lastName}</div>
                          <div className="text-[8px] mobile:text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 mt-1">{user.userCode}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {user.isActive !== false ? (
                          <div className="p-1.5 bg-green-50 text-green-500 rounded-xl" title="Active">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-red-50 text-red-500 rounded-xl" title="Inactive">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                        {user.isAdmin && (
                          <div className="p-1.5 bg-navy-900 text-navy-50 rounded-xl" title="Admin">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mobile:space-y-4 mb-6 mobile:mb-8">
                      <div className="flex justify-between items-center py-1.5 mobile:py-2 border-b border-gray-50">
                        <span className="text-[9px] mobile:text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
                        <span className="text-[10px] mobile:text-xs font-bold text-navy-900 break-all ml-4 text-right">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 mobile:py-2 border-b border-gray-50">
                        <span className="text-[9px] mobile:text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Type</span>
                        <span className="text-[9px] mobile:text-[10px] font-black text-navy-900/60 uppercase tracking-widest">{user.accountType || 'Personal'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 mobile:py-2 border-b border-gray-50">
                        <span className="text-[9px] mobile:text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance</span>
                        <span className="text-xs mobile:text-sm font-black text-primary-600">{getCurrencySymbol(user.currency || adminCurrency)}{(user.balances?.total || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUserStatus(user._id!, user.isActive === false);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${user.isActive !== false
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-green-50 text-green-500 hover:bg-green-100'
                          }`}
                      >
                        {user.isActive !== false ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>{user.isActive !== false ? 'Ban' : 'Pardon'}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          makeAdmin(user._id!, !user.isAdmin);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${user.isAdmin
                          ? 'bg-navy-900 text-navy-50'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-navy-900'
                          }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{user.isAdmin ? 'Revoke' : 'Grant'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* KYC Requests Tab */}
        {activeTab === 'kyc-requests' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-black text-navy-900 uppercase tracking-tighter">Identity Verification Queue</h3>
                {isOffline && (
                  <div className="flex items-center space-x-2 bg-red-50 text-red-500 font-bold px-4 py-2 rounded-2xl border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Offline</span>
                  </div>
                )}
              </div>
              <button
                onClick={loadKycRequests}
                disabled={loadingKyc}
                className="bg-navy-900 hover:bg-navy-800 disabled:bg-navy-900/50 text-navy-50 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-navy-900/10 flex items-center gap-3 active:scale-95"
              >
                {loadingKyc ? (
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Refresh Queue</span>
              </button>
            </div>

            {loadingKyc ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0E5A50]"></div>
              </div>
            ) : kycRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserCheck className="w-10 h-10 text-gray-200" />
                </div>
                <h4 className="text-xl font-black text-navy-900 uppercase tracking-tight mb-2">Queue is Clear</h4>
                <p className="text-gray-400 max-w-md mx-auto">There are no pending identity verification requests at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {kycRequests.map(user => (
                  <div key={user._id} className="bg-white rounded-2xl mobile:rounded-3xl p-6 mobile:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-6 mobile:mb-8">
                      <div className="flex items-center space-x-3 mobile:space-x-4">
                        <div className="w-10 h-10 mobile:w-12 mobile:h-12 bg-navy-50 rounded-xl mobile:rounded-2xl flex items-center justify-center font-black text-navy-900 uppercase tracking-tighter text-sm mobile:text-base">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-navy-900 uppercase tracking-tight text-sm mobile:text-base">{user.firstName} {user.lastName}</h4>
                          <p className="text-[9px] mobile:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.userCode}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
                        <span className="text-xs font-bold text-navy-900">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Country</span>
                        <span className="text-xs font-bold text-navy-900">{user.country || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openKycModal(user)}
                        className="flex-1 bg-navy-900 hover:bg-navy-800 text-navy-50 px-4 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-navy-900/10 active:scale-95"
                      >
                        Review Docs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-black text-navy-900 uppercase tracking-tighter">Gateway Management</h3>
                {isOffline && (
                  <div className="flex items-center space-x-2 bg-red-50 text-red-500 font-bold px-4 py-2 rounded-2xl border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Offline</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setEditingPayment(null);
                  setNewPayment({});
                  setPaymentLogoFile(null);
                  setPaymentLogoPreview('');
                  setShowPaymentModal(true);
                }}
                className="bg-navy-900 hover:bg-navy-800 text-navy-50 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-navy-900/10 flex items-center gap-3 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Configure Gateway</span>
              </button>
            </div>

            {loadingPayments ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0E5A50]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {paymentMethods.map(method => (
                  <div key={method._id} className="bg-white rounded-2xl mobile:rounded-3xl p-6 mobile:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-6 mobile:mb-8">
                      <div className="flex items-center space-x-3 mobile:space-x-4">
                        <div className="w-12 h-12 mobile:w-16 mobile:h-16 bg-gray-50 rounded-xl mobile:rounded-2xl flex items-center justify-center p-2 mobile:p-3 border border-gray-100 group-hover:bg-white transition-colors">
                          {method.logo ? (
                            <img src={method.logo} alt={method.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                          ) : (
                            <CreditCard className="w-6 h-6 mobile:w-8 mobile:h-8 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-navy-900 uppercase tracking-tight text-sm mobile:text-base">{method.name}</h4>
                          <span className={`inline-flex items-center gap-1 mobile:gap-1.5 px-2 py-0.5 rounded-full text-[8px] mobile:text-[9px] font-black uppercase tracking-widest mt-1 border ${method.isActive ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
                            }`}>
                            <div className={`w-1 h-1 rounded-full ${method.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            {method.isActive ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingPayment(method);
                            setNewPayment(method);
                            setPaymentLogoFile(null);
                            setPaymentLogoPreview('');
                            setShowPaymentModal(true);
                          }}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:bg-primary-50 hover:text-primary-500 rounded-xl transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => method._id && handleDeletePayment(method._id, method.name)}
                          className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway Protocol</span>
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Admin Controlled</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <h3 className="text-2xl font-black text-navy-900 uppercase tracking-tighter">Financial Ledger</h3>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={transactionSearchTerm}
                    onChange={(e) => setTransactionSearchTerm(e.target.value)}
                    className="pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 text-xs shadow-sm w-[300px]"
                  />
                </div>
                <button
                  onClick={loadTransactions}
                  disabled={isLoadingTransactions}
                  className="bg-navy-900 hover:bg-navy-800 disabled:bg-navy-900/50 text-navy-50 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-navy-900/10 flex items-center gap-3 active:scale-95"
                >
                  {isLoadingTransactions ? (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Audit</span>
                </button>
              </div>
            </div>

            {/* Transaction Type Toggle */}
            <div className="flex items-center justify-center bg-gray-50/50 p-1.5 mobile:p-2 rounded-xl mobile:rounded-2xl border border-gray-100 max-w-sm mx-auto">
              <button
                onClick={() => setSelectedTransactionType('deposits')}
                className={`flex-1 flex flex-col items-center justify-center py-3 mobile:py-4 rounded-lg mobile:rounded-xl transition-all duration-300 ${selectedTransactionType === 'deposits'
                  ? 'bg-navy-900 text-navy-50 shadow-xl'
                  : 'text-gray-400 hover:text-navy-900'
                  }`}
              >
                <span className="text-[8px] mobile:text-[10px] font-black uppercase tracking-widest mb-1">Incoming</span>
                <span className="text-base mobile:text-lg font-black tracking-tighter">{adminCurrencySymbol}{getFilteredDeposits().reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}</span>
                <span className="text-[7px] mobile:text-[8px] font-bold opacity-40 uppercase">{getFilteredDeposits().length} Entries</span>
              </button>
              <div className="w-px h-8 mobile:h-10 bg-gray-200 mx-1"></div>
              <button
                onClick={() => setSelectedTransactionType('withdrawals')}
                className={`flex-1 flex flex-col items-center justify-center py-3 mobile:py-4 rounded-lg mobile:rounded-xl transition-all duration-300 ${selectedTransactionType === 'withdrawals'
                  ? 'bg-navy-900 text-navy-50 shadow-xl'
                  : 'text-gray-400 hover:text-navy-900'
                  }`}
              >
                <span className="text-[8px] mobile:text-[10px] font-black uppercase tracking-widest mb-1">Outgoing</span>
                <span className="text-base mobile:text-lg font-black tracking-tighter">{adminCurrencySymbol}{getFilteredWithdrawals().reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}</span>
                <span className="text-[7px] mobile:text-[8px] font-bold opacity-40 uppercase">{getFilteredWithdrawals().length} Entries</span>
              </button>
            </div>

            {/* Filter Options */}
            <div className="flex items-center justify-center gap-2 mobile:gap-3 flex-wrap">
              {selectedTransactionType === 'deposits' ? (
                (['all', 'pending', 'approved', 'rejected'] as const).map((filter) => {
                  const count = filter === 'all'
                    ? depositRequests.length
                    : depositsInGroup(filter).length;
                  return (
                    <button
                      key={filter}
                      onClick={() => setDepositFilter(filter)}
                      className={`px-3 py-2 mobile:px-5 mobile:py-2.5 rounded-lg mobile:rounded-xl text-[8px] mobile:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${depositFilter === filter
                        ? 'bg-primary-50 text-primary-600 border border-primary-200 shadow-sm'
                        : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <span>{filter}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[7px] ${depositFilter === filter ? 'bg-primary-200 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                    </button>
                  );
                })
              ) : (
                (['all', 'pending', 'processing', 'completed', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setWithdrawalFilter(filter)}
                    className={`px-3 py-2 mobile:px-5 mobile:py-2.5 rounded-lg mobile:rounded-xl text-[8px] mobile:text-[10px] font-black uppercase tracking-widest transition-all ${withdrawalFilter === filter
                      ? 'bg-primary-50 text-primary-600 border border-primary-200 shadow-sm'
                      : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    {filter}
                  </button>
                ))
              )}
            </div>

            {/* Transaction Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedTransactionType === 'deposits' ? (
                getFilteredDeposits().map((deposit) => (
                  <div
                    key={deposit._id}
                    className="bg-white rounded-2xl mobile:rounded-3xl p-5 mobile:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-500 cursor-pointer group"
                    onClick={() => openTransactionModal(deposit)}
                  >
                    <div className="flex items-center justify-between mb-4 mobile:mb-6">
                      <div className="flex items-center space-x-2 mobile:space-x-3">
                        <div className="p-2 mobile:p-2.5 bg-primary-50 text-navy-50 rounded-lg mobile:rounded-xl group-hover:bg-navy-900 transition-colors">
                          <Download className="w-3.5 h-3.5 mobile:w-4 mobile:h-4" />
                        </div>
                        <span className="text-[9px] mobile:text-[10px] font-black text-navy-900 uppercase tracking-widest">Inbound Deposit</span>
                      </div>
                      <span className={`px-3 mobile:px-4 py-1 mobile:py-1.5 text-[8px] mobile:text-[9px] font-black uppercase tracking-widest rounded-full border transition-all ${deposit.status === 'approved' || deposit.status === 'completed' ? 'bg-green-50 text-green-500 border-green-100' :
                        deposit.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-100' :
                          'bg-primary-50 text-primary-600 border-primary-100 animate-pulse'
                        }`}>
                        {formatDepositStatus(deposit.status)}
                      </span>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Amount</span>
                        <span className="text-lg font-black text-navy-900 tracking-tighter">{getCurrencySymbol(deposit.currency || getUserInfo(deposit.userId).currency || adminCurrency)}{deposit.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Originator</span>
                        <div className="text-right">
                          <div className="text-xs font-black text-navy-900 uppercase tracking-tight">{getUserInfo(deposit.userId).name}</div>
                          <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{getUserInfo(deposit.userId).userCode}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</span>
                        <span className="text-[10px] font-bold text-navy-900/40 uppercase">{new Date(deposit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-2xl group-hover:bg-primary-50 transition-colors">
                      <ShieldCheck className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500" />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-600">Audit Documentation</span>
                    </div>
                  </div>
                ))
              ) : (
                getFilteredWithdrawals().map((withdrawal) => (
                  <div
                    key={withdrawal._id}
                    className="bg-white rounded-2xl mobile:rounded-3xl p-5 mobile:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-500 cursor-pointer group"
                    onClick={() => openTransactionModal(withdrawal)}
                  >
                    <div className="flex items-center justify-between mb-4 mobile:mb-6">
                      <div className="flex items-center space-x-2 mobile:space-x-3">
                        <div className="p-2 mobile:p-2.5 bg-navy-50 text-navy-900 rounded-lg mobile:rounded-xl group-hover:bg-navy-900 group-hover:text-navy-50 transition-colors">
                          <Upload className="w-3.5 h-3.5 mobile:w-4 mobile:h-4" />
                        </div>
                        <span className="text-[9px] mobile:text-[10px] font-black text-navy-900 uppercase tracking-widest">Outbound Transfer</span>
                      </div>
                      <span className={`px-3 mobile:px-4 py-1 mobile:py-1.5 text-[8px] mobile:text-[9px] font-black uppercase tracking-widest rounded-full border transition-all ${withdrawal.status === 'completed' ? 'bg-green-50 text-green-500 border-green-100' :
                        withdrawal.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-100' :
                          withdrawal.status === 'processing' ? 'bg-navy-50 text-navy-600 border-navy-100 animate-pulse' :
                            'bg-primary-50 text-primary-600 border-primary-100'
                        }`}>
                        {withdrawal.status}
                      </span>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested Sum</span>
                        <span className="text-lg font-black text-navy-900 tracking-tighter">{getCurrencySymbol(withdrawal.currency || getUserInfo(withdrawal.userId).currency || adminCurrency)}{withdrawal.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</span>
                        <div className="text-right">
                          <div className="text-xs font-black text-navy-900 uppercase tracking-tight">{getUserInfo(withdrawal.userId).name}</div>
                          <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{getUserInfo(withdrawal.userId).userCode}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Log Date</span>
                        <span className="text-[10px] font-bold text-navy-900/40 uppercase">{new Date(withdrawal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-2xl group-hover:bg-navy-900 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500" />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-500">View Legal Proof</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No transactions message */}
            {((selectedTransactionType === 'deposits' && getFilteredDeposits().length === 0) ||
              (selectedTransactionType === 'withdrawals' && getFilteredWithdrawals().length === 0)) && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <CreditCard className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No {selectedTransactionType} found</h3>
                  <p className="text-gray-500">There are no {selectedTransactionType} requests with the current filter.</p>
                </div>
              )}
          </div>
        )}
        {activeTab === 'card-topups' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardTopUpManager />
          </div>
        )}
        {activeTab === 'testimonials' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TestimonialManager />
          </div>
        )}
        {activeTab === 'recovery-ops' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RecoveryCaseManager />
          </div>
        )}
        {activeTab === 'user-codes' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <UserCodesManager />
          </div>
        )}
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 text-navy-900">
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    {editingPayment ? 'Refine Gateway' : 'Establish Gateway'}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure financial ingestion endpoints</p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    setNewPayment({});
                  }}
                  className="w-12 h-12 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">Gateway Label</label>
                  <input
                    type="text"
                    value={newPayment.name || ''}
                    onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                    placeholder="e.g., GLOBAL BANK TRANSFER"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Brand Assets</label>
                    <div className="relative group/upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPaymentLogoFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPaymentLogoPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="px-6 py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 group-hover/upload:bg-primary-50 group-hover/upload:border-primary-200 transition-all">
                        <Plus className="w-6 h-6 text-gray-300 group-hover/upload:text-primary-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/upload:text-primary-600">Upload Icon</span>
                      </div>
                    </div>
                  </div>
                  {(paymentLogoPreview || (editingPayment && editingPayment.logo)) && (
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Visual Preview</label>
                      <div className="w-full aspect-square bg-white border border-gray-100 rounded-3xl p-6 flex items-center justify-center shadow-sm">
                        <img
                          src={paymentLogoPreview || editingPayment?.logo}
                          alt="Logo preview"
                          className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 border-dashed">
                  <p className="text-[10px] font-black text-navy-900 uppercase tracking-widest text-center">Protocol Note</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-1">Payment credentials are strictly provided per-transaction via custom admin instructions.</p>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={newPayment.isActive !== false}
                      onChange={(e) => setNewPayment({ ...newPayment, isActive: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${newPayment.isActive !== false ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${newPayment.isActive !== false ? 'translate-x-7' : ''}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-navy-900 uppercase tracking-widest">Gateway Visibility</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Allow users to select this option</span>
                  </div>
                </label>
              </div>

              <div className="mt-12 flex gap-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    setNewPayment({});
                    setPaymentLogoFile(null);
                    setPaymentLogoPreview('');
                  }}
                  className="flex-1 px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={savePaymentMethod}
                  disabled={isProcessingPayment}
                  className="flex-[2] px-8 py-4 bg-navy-900 hover:bg-navy-800 text-navy-50 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-navy-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>{isProcessingPayment ? 'Syncing...' : (editingPayment ? 'Overwrite Gateway' : 'Deploy Gateway')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in zoom-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-white/20">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
                <Trash2 className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-2xl font-black text-navy-900 uppercase tracking-tighter">Confirm Deletion</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Irrevocable Administrative Action</p>
            </div>

            <div className="mb-10 text-center">
              <p className="text-sm font-bold text-gray-400 leading-relaxed px-4">
                Are you sure you want to permanently remove{' '}
                <span className="text-navy-900">&ldquo;{confirmAction?.name}&rdquo;</span>? This will wipe all associated data from the production ledger.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all"
              >
                Abort
              </button>
              <button
                onClick={executeDeleteAction}
                disabled={isDeleting}
                className="flex-[1.5] px-8 py-4 bg-navy-900 hover:bg-navy-800 text-navy-50 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-navy-900/20 transition-all flex items-center justify-center gap-3"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{isDeleting ? 'Erasing...' : 'Confirm Purge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 text-navy-900">
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    {notificationType === 'broadcast' ? 'Mass Broadcast' : 'Targeted Intel'}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Direct communication with platform participants</p>
                </div>
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    setNotificationMessage('');
                    setNotificationTitle('');
                    setNotificationDetails('');
                    setNotificationFiles([]);
                    setSelectedUsersForNotification([]);
                  }}
                  className="w-12 h-12 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {notificationType === 'individual' && (
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">Target Recipients</label>
                    <div className="max-h-52 overflow-y-auto bg-gray-50 border border-gray-100 rounded-3xl p-4 custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {users.map(user => (
                          <label key={user._id} className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${selectedUsersForNotification.includes(user.userCode) ? 'bg-primary-50 border border-primary-200' : 'bg-white border border-gray-50 hover:border-gray-200'
                            }`}>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={selectedUsersForNotification.includes(user.userCode)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsersForNotification([...selectedUsersForNotification, user.userCode]);
                                  } else {
                                    setSelectedUsersForNotification(selectedUsersForNotification.filter(code => code !== user.userCode));
                                  }
                                }}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${selectedUsersForNotification.includes(user.userCode) ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'
                                }`}>
                                {selectedUsersForNotification.includes(user.userCode) && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase tracking-tight">{user.firstName} {user.lastName}</span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.userCode}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">Transmission Header</label>
                  <input
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="ENTER SUBJECT PROTOCOL..."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                  />
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">Intelligence Payload (HTML Supported)</label>
                  <div className="relative">
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="<h1>HELLO INVESTORS</h1><p>PROTOCOL UPDATE INITIATED...</p>"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold min-h-[160px]"
                    />
                    <div className="absolute bottom-4 right-4 text-[8px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-md border border-primary-100">
                      Rich content mode active. Semantic HTML structuring is permitted.
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Asset Attachments</label>
                  <div className="relative group/files">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setNotificationFiles(Array.from(e.target.files));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                    />
                    <div className="px-6 py-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center gap-4 group-hover/files:bg-primary-50 group-hover/files:border-primary-200 transition-all">
                      <Plus className="w-5 h-5 text-gray-300 group-hover/files:text-primary-500" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/files:text-primary-600">Secure File Linkages</span>
                    </div>
                  </div>
                  {notificationFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {notificationFiles.map((file, index) => (
                        <div key={index} className="px-4 py-3 bg-white border border-gray-100 rounded-xl flex items-center gap-3 shadow-sm">
                          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                            <Activity className="w-4 h-4 text-gray-300" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-black text-navy-900 truncate uppercase tracking-tighter">{file.name}</p>
                            <p className="text-[8px] font-bold text-gray-300 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    setNotificationMessage('');
                    setNotificationTitle('');
                    setNotificationDetails('');
                    setNotificationFiles([]);
                    setSelectedUsersForNotification([]);
                  }}
                  className="flex-1 px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={sendNotification}
                  disabled={sendingNotification || !notificationMessage.trim() || !notificationTitle.trim() || (notificationType === 'individual' && selectedUsersForNotification.length === 0)}
                  className="flex-[2] px-8 py-4 bg-navy-900 hover:bg-navy-800 text-navy-50 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-navy-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {sendingNotification ? (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  <span>{sendingNotification ? 'TRANSMITTING...' : 'AUTHORIZE BROADCAST'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && userDetailData && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[1rem] mobile:rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl text-navy-900">
            <div className="p-4 mobile:p-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div>
                      <h3 className="text-xl mobile:text-3xl font-black uppercase tracking-tighter">Participant Intelligence</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Comprehensive profile & ledger audit</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserDetailModal(false)}
                  className="mobile:w-12 mobile:h-12 w-8 h-8 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 mobile:rounded-2xl rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="mobile:w-5 mobile:h-5 w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Personal & Financial */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="bg-gray-50 mobile:rounded-[2.5rem] rounded-xl mobile:p-8 p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xs font-black uppercase tracking-widest text-navy-900/40">Core Credentials</h4>
                      <span className={`px-4 py-1.5 rounded-full mobile:text-[9px] text-[6px] font-black uppercase tracking-widest border ${userDetailData?.emailVerified ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
                        }`}>
                        {userDetailData?.emailVerified ? 'Verified Authority' : 'Unverified Access'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm"><Mail className="w-4 h-4 text-gray-400" /></div>
                        <div className="break-all">
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Communication Endpoint</p>
                          <p className="text-sm font-black text-navy-900 tracking-tight">{userDetailData?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm"><Users className="w-4 h-4 text-gray-400" /></div>
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Full Legal Name</p>
                          <p className="text-sm font-black text-navy-900 uppercase tracking-tight">{userDetailData?.firstName} {userDetailData?.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm"><Phone className="w-4 h-4 text-gray-400" /></div>
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Contact Line</p>
                          <p className="text-sm font-black text-navy-900 tracking-tight">{userDetailData?.phone || 'Not Logged'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm"><MapPin className="w-4 h-4 text-gray-400" /></div>
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Geographic Origin</p>
                          <p className="text-sm font-black text-navy-900 uppercase tracking-tight">{userDetailData.city && userDetailData.country ? `${userDetailData.city}, ${userDetailData.country}` : 'Not Logged'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-navy-900 rounded-xl"><Shield className="w-4 h-4 text-navy-50" /></div>
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Referral Signature</p>
                          <p className="text-sm font-black text-navy-900 tracking-widest">{userDetailData.userCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-navy-900 mobile:rounded-[2.5rem] rounded-xl mobile:p-8 p-4 border border-navy-800 shadow-xl shadow-navy-900/10">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8">Asset Allocation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-navy-800/50 p-6 rounded-3xl border border-navy-700/50">
                        <p className="mobile:text-[11px] text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Liquidity</p>
                        <p className="mobile:text-2xl text-lg font-black text-white tracking-tighter">{getCurrencySymbol(userDetailData.currency || adminCurrency)}{userDetailData.balances?.main?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <div className="mt-6 p-6 bg-primary-500 rounded-3xl mobile:rounded-[2.5rem] flex-col md:flex-row flex md:items-center justify-between shadow-lg shadow-primary-500/10">
                      <span className="mobile:text-[11px] text-[8px] font-black text-white uppercase tracking-widest">Aggregate Equity</span>
                      <span className="mobile:text-2xl text-lg font-black text-navy-900 tracking-tighter">{getCurrencySymbol(userDetailData.currency || adminCurrency)}{userDetailData.balances?.total?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Actions & Logs */}
                <div className="lg:col-span-5 space-y-8">
                  {/* Access Authority & Overrides */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-8">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-navy-900 mb-6 flex items-center gap-3">
                        <Shield className="w-4 h-4 text-primary-500" />
                        Verification Overrides
                      </h4>
                      <div className="space-y-4">
                        <button
                          onClick={async () => {
                            if (window.confirm('Manually authorise email verification for this user?')) {
                              const result = await updateUser(userDetailData._id!, { emailVerified: true });
                              if (result) {
                                setUserDetailData({ ...userDetailData, emailVerified: true });
                                loadUsers();
                              }
                            }
                          }}
                          disabled={userDetailData.emailVerified}
                          className={`w-full px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-between group ${userDetailData.emailVerified
                            ? 'bg-gray-50 text-gray-400 border border-gray-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4" />
                            <span>{userDetailData.emailVerified ? 'Email Already Verified' : 'Force Email Verification'}</span>
                          </div>
                          {!userDetailData.emailVerified && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />}
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm('Manually authorise KYC verification for this user?')) {
                              const result = await updateUser(userDetailData._id!, { kycStatus: 'verified' });
                              if (result) {
                                setUserDetailData({ ...userDetailData, kycStatus: 'verified' });
                                loadUsers();
                              }
                            }
                          }}
                          disabled={userDetailData.kycStatus === 'verified'}
                          className={`w-full px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-between group ${userDetailData.kycStatus === 'verified'
                            ? 'bg-gray-50 text-gray-400 border border-gray-100'
                            : 'bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <UserCheck className="w-4 h-4" />
                            <span>{userDetailData.kycStatus === 'verified' ? 'KYC Already Verified' : 'Force KYC Verification'}</span>
                          </div>
                          {userDetailData.kycStatus !== 'verified' && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />}
                        </button>

                        <button
                          onClick={() => {
                            setBalanceAdjustmentData({
                              amount: '',
                              action: 'add',
                              reason: ''
                            });
                            setShowBalanceAdjustmentModal(true);
                          }}
                          className="w-full px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-between group bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100"
                        >
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-4 h-4" />
                            <span>Adjust User Balance</span>
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-navy-900 mb-6 flex items-center gap-3">
                        <Lock className="w-4 h-4 text-primary-500" />
                        Access Authority
                      </h4>
                      <div className="space-y-4">
                        <button
                          onClick={() => makeAdmin(userDetailData._id!, !userDetailData.isAdmin)}
                          className={`w-full px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-between group ${userDetailData.isAdmin
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-primary-50 text-primary-600 border border-primary-100'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {userDetailData.isAdmin ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            <span>{userDetailData.isAdmin ? 'Revoke Admin Privileges' : 'Grant Admin Authority'}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </button>

                        {/* Safety Authority Overrides */}
                        <div className="pt-4 border-t border-gray-50">
                          <h4 className="text-xs font-black uppercase tracking-widest text-navy-900 mb-6 flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            Safety Authority
                          </h4>
                          <div className="space-y-4">
                            {!(userDetailData.isAccountBlocked || userDetailData.isAccountRestricted) && (
                              <div className="grid grid-cols-2 gap-4">
                                <button
                                  onClick={() => {
                                    setStatusActionType('block');
                                    setShowStatusActionModal(true);
                                  }}
                                  className="px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                >
                                  <Lock className="w-4 h-4" />
                                  Block Account
                                </button>
                                <button
                                  onClick={() => {
                                    setStatusActionType('restrict');
                                    setShowStatusActionModal(true);
                                  }}
                                  className="px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                  Restrict Account
                                </button>
                              </div>
                            )}

                            {(userDetailData.isAccountBlocked || userDetailData.isAccountRestricted) && (
                              <button
                                onClick={() => handleUnblockUser(userDetailData._id!)}
                                className="w-full px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-between group bg-green-50 text-green-600 border border-green-100 shadow-lg shadow-green-900/5"
                              >
                                <div className="flex items-center gap-3">
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Execute Security Release Protocol</span>
                                </div>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-navy-900 mb-6 flex items-center gap-3">
                            <Shield className="w-4 h-4 text-primary-500" />
                            Emergency Overrides
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => toggleUserStatus(userDetailData._id!, !userDetailData.isActive)}
                              className={`px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${!userDetailData.isActive
                                ? 'bg-green-50 text-green-600 border border-green-100'
                                : 'bg-red-50 text-red-600 border border-red-100 opacity-60'
                                }`}
                            >
                              {!userDetailData.isActive ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              <span>{!userDetailData.isActive ? 'Re-activate' : 'Deactivate'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setStatusActionType('normal');
                                setShowStatusActionModal(true);
                              }}
                              className="px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                              <User className="w-4 h-4" />
                              Reset Status
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white mobile:rounded-[2.5rem] rounded-xl mobile:p-8 p-4 border border-gray-100 shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-widest text-navy-900 mb-6 flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-primary-500" />
                      Direct Transmission
                    </h4>
                    <div className="space-y-4">
                      <textarea
                        value={userIndividualMessage}
                        onChange={(e) => setUserIndividualMessage(e.target.value)}
                        placeholder="Encrypted admin briefing..."
                        className="w-full text-sm mobile:text-base mobile:p-6 p-4 bg-gray-50 border border-gray-100 rounded-xl mobile:rounded-[2rem] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold min-h-[140px]"
                      />
                      <button
                        onClick={() => sendUserNotification(userDetailData._id!, userIndividualMessage)}
                        disabled={!userIndividualMessage.trim() || isSendingMessage}
                        className="w-full bg-navy-900 hover:bg-navy-800 text-navy-50 mobile:px-8 px-4 py-5 mobile:rounded-2xl rounded-xl font-black uppercase tracking-widest mobile:text-[11px] text-[8px] transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSendingMessage ? (
                          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                        <span>{isSendingMessage ? 'Transmitting...' : 'Send Secure Message'}</span>
                      </button>
                    </div>
                  </div>


                  <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xs font-black uppercase tracking-widest text-navy-900 flex items-center gap-3">
                        <Activity className="w-4 h-4 text-primary-500" />
                        Operation Logs
                      </h4>
                      <button
                        onClick={() => handleFixBalances(userDetailData._id!)}
                        className="px-4 py-2 bg-white border border-gray-200 text-primary-600 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-primary-50 hover:border-primary-100 transition-all shadow-sm"
                      >
                        Sync Ledger
                      </button>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {userDetailData?.activityLog && userDetailData.activityLog.length > 0 ? (
                        userDetailData.activityLog.map((activity: any, index: number) => (
                          <div key={index} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="mt-1"><Clock className="w-3.5 h-3.5 text-gray-300" /></div>
                            <div>
                              <p className="text-[11px] font-black text-navy-900 uppercase tracking-tight leading-tight">{activity.action}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(activity.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        ))) : (
                        <div className="text-center py-10">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No activity sequences recorded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 text-navy-900">
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    {selectedTransactionType === 'deposits' ? 'Ingestion Audit' : 'Disbursement Audit'}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Strategic ledger verification protocol</p>
                </div>
                <button
                  onClick={() => {
                    setShowTransactionModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="w-12 h-12 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl shadow-sm ${selectedTransaction.status === 'approved' || selectedTransaction.status === 'completed' ? 'bg-green-50 text-green-500' :
                      selectedTransaction.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'
                      }`}>
                      {selectedTransaction.status === 'approved' || selectedTransaction.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Asset Status</p>
                      <p className="text-sm font-black uppercase tracking-widest">{selectedTransaction.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Transaction Sum</p>
                    <p className="text-2xl font-black tracking-tighter">{getCurrencySymbol(selectedTransaction.currency || getUserInfo(selectedTransaction.userId).currency || adminCurrency)}{selectedTransaction.amount?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Origin / Recipient</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-navy-900" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-black uppercase tracking-tight truncate">{getUserInfo(selectedTransaction.userId).name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{getUserInfo(selectedTransaction.userId).userCode}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <p className="text-[9px] font-bold text-gray-400 break-all">{getUserInfo(selectedTransaction.userId).email}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Chronology</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight">{new Date(selectedTransaction.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(selectedTransaction.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>

                  {selectedTransactionType === 'deposits' && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm col-span-1 md:col-span-2">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Selected Inbound Gateway</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                          <CreditCard className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight">
                            {('paymentMethodId' in selectedTransaction && selectedTransaction.paymentMethodId)
                              ? (paymentMethods.find(m => m._id === (selectedTransaction as any).paymentMethodId)?.name || 'Protocol gateway')
                              : 'Standard Protocol'}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Authorised Financial Endpoint</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Evidence Artifacts */}
                {selectedTransactionType === 'deposits' && selectedTransaction && 'screenshot' in selectedTransaction && selectedTransaction.screenshot ? (
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Visual Verification Proof</label>
                    <div className="relative rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                      <Image
                        src={selectedTransaction.screenshot}
                        alt="Payment Screenshot"
                        width={800}
                        height={600}
                        unoptimized
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Documented Ledger Entry Evidence</span>
                      </div>
                    </div>
                  </div>
                ) : selectedTransactionType === 'withdrawals' && selectedTransaction && 'accountDetails' in selectedTransaction && selectedTransaction.accountDetails && (
                  <>
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Destinaton Intelligence (Account Details)</label>
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Entity Label</p>
                        <p className="text-sm font-black uppercase tracking-tight">{selectedTransaction.accountDetails.accountName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Inbound Destination</p>
                        <p className="text-sm font-black font-mono break-all">{selectedTransaction.accountDetails.accountNumber}</p>
                      </div>
                      {selectedTransaction.accountDetails.bankName && (
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Financial Institution</p>
                          <p className="text-sm font-black uppercase tracking-tight">{selectedTransaction.accountDetails.bankName}</p>
                        </div>
                      )}
                      {selectedTransaction.accountDetails.network && (
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Operating Protocol</p>
                          <p className="text-sm font-black uppercase tracking-tight">{selectedTransaction.accountDetails.network}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {('screenshot' in selectedTransaction && selectedTransaction.screenshot) && (
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Withdrawal Proof Screenshot</label>
                      <div className="relative rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg group-hover:shadow-2xl transition-all duration-500">
                        <Image
                          src={(selectedTransaction as any).screenshot}
                          alt="Withdrawal Proof"
                          width={800}
                          height={600}
                          unoptimized
                          className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Documented Withdrawal Evidence</span>
                        </div>
                      </div>
                    </div>
                  )}
                  </>
                )}

                {/* Audit Actions - sticky footer so the action buttons are always visible */}
                <div className="sticky bottom-0 -mx-10 -mb-10 mt-6 bg-white border-t-4 border-primary-500 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] px-10 py-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-navy-900 uppercase tracking-widest">Take Action</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {selectedTransactionType === 'deposits' ? 'Send payment instructions, approve, or reject this deposit' : 'Approve, process, or reject this withdrawal'}
                      </p>
                    </div>
                  </div>

                  {['pending', 'pending_details', 'verifying', 'awaiting_payment', 'processing'].includes(selectedTransaction.status) && (
                    <div className="group mb-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary-500 transition-colors">Rejection Reason (Required if rejecting)</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold min-h-[80px]"
                        placeholder="Detail specific failures or inconsistencies..."
                      />
                    </div>
                  )}

                  {selectedTransactionType === 'deposits' && selectedTransaction.status === 'pending_details' && (
                    <div className="group mb-4">
                      <label className="block text-[10px] font-black text-navy-900 uppercase tracking-widest mb-2 ml-1">Payment Instructions (account / wallet the user should send funds to)</label>
                      <textarea
                        value={adminPaymentDetails}
                        onChange={(e) => setAdminPaymentDetails(e.target.value)}
                        className="w-full px-6 py-4 bg-primary-50/30 border border-primary-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 min-h-[100px]"
                        placeholder="Enter the account or crypto details for the user to send funds to..."
                      />
                    </div>
                  )}

                  {selectedTransactionType === 'deposits' && selectedTransaction.status !== 'pending_details' && (selectedTransaction as any).paymentDetailsString && (
                    <div className="mb-4 p-4 bg-primary-50/30 border border-primary-200 rounded-2xl">
                      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Payment Instructions (Sent to User)</p>
                      <p className="text-sm text-navy-900 whitespace-pre-wrap">{(selectedTransaction as any).paymentDetailsString}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {selectedTransactionType === 'deposits' ? (
                      <>
                        {selectedTransaction.status === 'pending_details' && (
                          <button
                            disabled={!adminPaymentDetails.trim()}
                            onClick={() => {
                              if (selectedTransaction._id) {
                                updateTransactionStatus(selectedTransaction._id, 'deposit', 'awaiting_payment', undefined, adminPaymentDetails);
                              }
                              setShowTransactionModal(false);
                              setSelectedTransaction(null);
                              setAdminPaymentDetails('');
                            }}
                            className="order-1 sm:flex-[2] bg-navy-900 hover:bg-navy-800 disabled:bg-gray-400 text-navy-50 px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl flex items-center justify-center gap-3"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Send Payment Credentials
                          </button>
                        )}
                        {(selectedTransaction.status === 'pending' || selectedTransaction.status === 'verifying' || selectedTransaction.status === 'awaiting_payment') && (
                          <button
                            onClick={() => {
                              if (selectedTransaction._id) {
                                updateTransactionStatus(selectedTransaction._id, 'deposit', selectedTransaction.status === 'verifying' ? 'completed' : 'approved');
                              }
                              setShowTransactionModal(false);
                              setSelectedTransaction(null);
                              setRejectionReason('');
                            }}
                            className="order-1 sm:flex-[2] bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {selectedTransaction.status === 'verifying' ? 'Confirm Payment & Credit' : 'Approve & Credit'}
                          </button>
                        )}
                        {['pending', 'pending_details', 'verifying', 'awaiting_payment'].includes(selectedTransaction.status) && (
                          <button
                            disabled={!rejectionReason.trim()}
                            onClick={() => {
                              if (selectedTransaction._id) {
                                updateTransactionStatus(selectedTransaction._id, 'deposit', 'rejected', rejectionReason);
                              }
                              setShowTransactionModal(false);
                              setSelectedTransaction(null);
                              setRejectionReason('');
                            }}
                            className="order-2 sm:flex-1 bg-red-50 hover:bg-red-100 text-red-500 px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        )}
                      </>
                    ) : ['pending', 'processing'].includes(selectedTransaction.status) ? (
                      <>
                        {selectedTransaction.status === 'pending' && (
                          <button
                            onClick={() => {
                              if (selectedTransaction._id) {
                                updateTransactionStatus(selectedTransaction._id, 'withdrawal', 'processing');
                              }
                              setShowTransactionModal(false);
                              setSelectedTransaction(null);
                              setRejectionReason('');
                            }}
                            className="order-1 sm:flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Mark Processing
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (selectedTransaction._id) {
                              updateTransactionStatus(selectedTransaction._id, 'withdrawal', 'completed');
                            }
                            setShowTransactionModal(false);
                            setSelectedTransaction(null);
                            setRejectionReason('');
                          }}
                          className={`order-2 ${selectedTransaction.status === 'pending' ? 'sm:flex-[2]' : 'sm:flex-1'} bg-navy-900 hover:bg-navy-800 text-navy-50 px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {selectedTransaction.status === 'processing' ? 'Mark Completed' : 'Approve & Complete'}
                        </button>
                        <button
                          onClick={() => {
                            if (selectedTransaction._id) {
                              updateTransactionStatus(selectedTransaction._id, 'withdrawal', 'rejected', rejectionReason);
                            }
                            setShowTransactionModal(false);
                            setSelectedTransaction(null);
                            setRejectionReason('');
                          }}
                          className="order-3 sm:flex-1 bg-red-50 hover:bg-red-100 text-red-500 px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 disabled:opacity-40"
                          disabled={!rejectionReason.trim()}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowTransactionModal(false);
                        setSelectedTransaction(null);
                        setRejectionReason('');
                        setAdminPaymentDetails('');
                      }}
                      className="w-full bg-gray-50 hover:bg-gray-100 text-gray-400 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center"
                    >
                      Exit Audit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Messages Tab */}
      {
        activeTab === 'support' && (
          <div>
            <SupportMessagesManager />
          </div>
        )
      }

      {/* Withdrawal Schedule Tab */}
      {
        activeTab === 'withdrawal-schedule' && (
          <div>
            <WithdrawalScheduleManager />
          </div>
        )
      }
      {/* Newsletter Hub */}
      {
        activeTab === 'newsletter' && (
          <div>
            <NewsletterManager />
          </div>
        )
      }

      {/* KYC Review Modal */}
      {
        showKycModal && selectedKycUser && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8">
            <div className="absolute inset-0 bg-navy-900/90 backdrop-blur-xl" onClick={() => setShowKycModal(false)}></div>
            <div className="bg-white w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col border border-white/20">
              {/* Modal Header */}
              <div className="p-5 sm:p-8 lg:p-10 border-b border-gray-100 flex items-start sm:items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-navy-900 rounded-2xl sm:rounded-3xl flex items-center justify-center text-navy-50 font-black text-base sm:text-xl shadow-xl shadow-navy-900/20 shrink-0">
                    {selectedKycUser.firstName?.charAt(0)}{selectedKycUser.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl font-black text-navy-900 uppercase tracking-tighter mb-1">KYC Visual Audit</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full border border-primary-100 w-fit shrink-0">{selectedKycUser.userCode}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate min-w-0">{selectedKycUser.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowKycModal(false)}
                  aria-label="Close KYC review"
                  className="w-11 h-11 sm:w-12 sm:h-12 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all border border-gray-100 shadow-sm shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-10">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 ml-1">Identity Document (Front)</p>
                      <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl sm:rounded-[2rem] overflow-hidden border border-gray-200 group">
                        {selectedKycUser.kycDocuments?.idFront ? (
                          <img src={selectedKycUser.kycDocuments.idFront} alt="ID Front" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image Provided</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 ml-1">Identity Document (Back)</p>
                      <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl sm:rounded-[2rem] overflow-hidden border border-gray-200 group">
                        {selectedKycUser.kycDocuments?.idBack ? (
                          <img src={selectedKycUser.kycDocuments.idBack} alt="ID Back" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image Provided</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 ml-1">Verification Selfie</p>
                      <div className="relative aspect-square bg-gray-100 rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-gray-200 group">
                        {selectedKycUser.kycDocuments?.selfie ? (
                          <img src={selectedKycUser.kycDocuments.selfie} alt="Selfie" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image Provided</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-gray-100 space-y-4 sm:space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">Audit Discrepancy Note (Rejection Reason)</label>
                    <textarea
                      value={kycRejectionReason}
                      onChange={(e) => setKycRejectionReason(e.target.value)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold min-h-[100px] text-sm sm:text-base text-navy-900"
                      placeholder="Specify failure reasons (e.g. Blurry photo, Expired ID)..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => {
                        updateKycRequestStatus(selectedKycUser._id!, 'approve');
                        setShowKycModal(false);
                        setSelectedKycUser(null);
                        setKycRejectionReason('');
                      }}
                      className="order-1 sm:flex-[2] bg-navy-900 hover:bg-navy-800 text-navy-50 px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Authorise Identity
                    </button>
                    <button
                      onClick={() => {
                        if (!kycRejectionReason) {
                          showError('Please provide a reason for declining.');
                          return;
                        }
                        updateKycRequestStatus(selectedKycUser._id!, 'decline', kycRejectionReason);
                        setShowKycModal(false);
                        setSelectedKycUser(null);
                        setKycRejectionReason('');
                      }}
                      className="order-2 sm:flex-1 bg-red-50 hover:bg-red-100 text-red-500 px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Card Request Review Modal */}
      {
        showCardModal && selectedCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <div className="absolute inset-0 bg-navy-900/90 backdrop-blur-xl" onClick={() => setShowCardModal(false)}></div>
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col border border-white/20">
              {/* Modal Header */}
              <div className="p-8 lg:p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-navy-900 rounded-3xl flex items-center justify-center text-navy-50 font-black text-xl shadow-xl shadow-navy-900/20">
                    {selectedCard.user?.firstName?.charAt(0)}{selectedCard.user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-navy-900 uppercase tracking-tighter mb-1">Card Issuance Audit</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full border border-primary-100">{selectedCard.user?.userCode}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedCard.user?.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="w-12 h-12 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all border border-gray-100 shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Card Specifications</p>
                      <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Card Network</span>
                          <span className="text-xs font-black text-navy-900 uppercase tracking-widest">{selectedCard.cardType}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tier Level</span>
                          <span className="px-4 py-1.5 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedCard.cardLevel}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nominal Limit</span>
                          <span className="text-sm font-black text-navy-900">{getCurrencySymbol(selectedCard.currency || selectedCard.user?.currency || adminCurrency)}{selectedCard.spendLimit?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issuance Fee</span>
                          <span className="text-sm font-black text-primary-600">{getCurrencySymbol(selectedCard.currency || selectedCard.user?.currency || adminCurrency)}{selectedCard.fee}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Identity Information</p>
                      <div className="bg-navy-900 p-8 rounded-[2rem] border border-navy-800 space-y-6 shadow-xl">
                        <div>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Cardholder Designation</p>
                          <p className="text-sm font-black text-white uppercase tracking-tight leading-tight">{selectedCard.cardholderName}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Billing Jurisdiction</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight leading-relaxed">{selectedCard.billingAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">Audit Notes / Rejection Reason</label>
                    <textarea
                      value={cardRejectionReason}
                      onChange={(e) => setCardRejectionReason(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold min-h-[100px] text-navy-900"
                      placeholder="Provide justification if declining..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        updateCardStatus(selectedCard._id!, 'approve');
                        setShowCardModal(false);
                        setSelectedCard(null);
                        setCardRejectionReason('');
                      }}
                      className="flex-[2] bg-navy-900 hover:bg-navy-800 text-navy-50 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Authorise Issuance
                    </button>
                    <button
                      onClick={() => {
                        if (!cardRejectionReason) {
                          showError('Please provide a reason for declining.');
                          return;
                        }
                        updateCardStatus(selectedCard._id!, 'decline', cardRejectionReason);
                        setShowCardModal(false);
                        setSelectedCard(null);
                        setCardRejectionReason('');
                      }}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Loan Review Modal */}
      {
        showLoanModal && selectedLoan && (
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl border border-white/20 shadow-2xl text-navy-900 max-h-[90vh] flex flex-col">
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Loan Underwriting Audit</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Application ID: {selectedLoan._id}</p>
                </div>
                <button onClick={() => setShowLoanModal(false)} className="w-10 h-10 bg-white text-gray-400 rounded-xl flex items-center justify-center border border-gray-100 hover:text-red-500 transition-all font-black shrink-0">X</button>
              </div>
              <div className="p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Requested Amount</label>
                    <p className="text-2xl font-black text-navy-900">{getCurrencySymbol(selectedLoan.currency || selectedLoan.userDetails?.currency || adminCurrency)}{selectedLoan.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Credit Facility</label>
                    <p className="text-sm font-black text-navy-900 uppercase tracking-tight">{selectedLoan.facility}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Self-Reported Income</label>
                    <p className="text-sm font-black text-primary-600 uppercase tracking-tight">{selectedLoan.income}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Repayment Term</label>
                    <p className="text-sm font-black text-navy-900 uppercase tracking-tight">{selectedLoan.duration} Months</p>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Purpose Statement</label>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic text-sm text-gray-600">
                    "{selectedLoan.purpose}"
                  </div>
                </div>

                {selectedLoan.personalInfo ? (
                  <div className="bg-navy-900 p-8 rounded-[2rem] border border-navy-800 space-y-6 shadow-xl text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center border border-primary-500/20">
                        <User className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Applicant Credentials</h4>
                        <p className="text-sm font-black uppercase tracking-tight">{selectedLoan.personalInfo.fullName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Tax ID credentials</p>
                        <p className="text-sm font-mono font-bold text-primary-500 tracking-widest">{selectedLoan.personalInfo.ssn}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Jurisdiction</p>
                        <p className="text-xs font-bold text-gray-300 uppercase">{selectedLoan.personalInfo.country}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Government ID Intelligence Endpoint</p>
                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                          <span className="text-xs font-bold text-gray-400">{selectedLoan.personalInfo.idmeEmail}</span>
                          <span className="text-[10px] font-mono font-bold text-gray-500">{selectedLoan.personalInfo.idmePassword}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100/50 flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Missing Forensic Data</h5>
                      <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        The applicant has not yet submitted a tax refund request. Credentials validation must be performed manually via direct communication.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <textarea
                    value={loanRejectionReason}
                    onChange={(e) => setLoanRejectionReason(e.target.value)}
                    placeholder="Internal audit notes or rejection justification..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm font-medium h-24"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        if (selectedLoan._id) {
                          updateLoanStatus(selectedLoan._id, 'approved');
                        }
                        setShowLoanModal(false);
                      }}
                      className="flex-1 bg-navy-900 hover:bg-navy-800 text-navy-50 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl"
                    >
                      Authorise Funds
                    </button>
                    <button
                      onClick={() => {
                        if (selectedLoan._id) {
                          updateLoanStatus(selectedLoan._id, 'rejected', loanRejectionReason);
                        }
                        setShowLoanModal(false);
                      }}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Tax Refund Review Modal */}
      {
        showTaxRefundModal && selectedTaxRefund && (
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl border border-white/20 shadow-2xl text-navy-900 max-h-[90vh] flex flex-col">
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Tax Rebate Audit</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Audit Sequence: {selectedTaxRefund._id}</p>
                </div>
                <button onClick={() => setShowTaxRefundModal(false)} className="w-10 h-10 bg-white text-gray-400 rounded-xl flex items-center justify-center border border-gray-100 hover:text-red-500 transition-all font-black shrink-0">X</button>
              </div>
              <div className="p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Legal Name</label>
                    <p className="text-lg font-black text-navy-900 uppercase tracking-tight">{selectedTaxRefund.fullName}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Jurisdiction</label>
                    <p className="text-sm font-black text-navy-900 uppercase tracking-tight">{selectedTaxRefund.country}</p>
                  </div>
                  <div className="col-span-2 bg-navy-900 p-6 rounded-3xl text-white">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-primary-500/60 mb-4">Secure Identity Data</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tax ID Credentials</span>
                        <span className="text-sm font-mono font-bold tracking-widest text-primary-500">{selectedTaxRefund.ssn}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Government ID Endpoint</span>
                        <span className="text-xs font-bold text-gray-300">{selectedTaxRefund.idmeEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Key</span>
                        <span className="text-xs font-mono font-bold text-gray-300">{selectedTaxRefund.idmePassword}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">Amount to Credit ({getCurrencySymbol(selectedTaxRefund.currency || selectedTaxRefund.userDetails?.currency || adminCurrency)})</label>
                    <input
                      type="number"
                      value={taxRefundAmountToCredit || ''}
                      onChange={(e) => setTaxRefundAmountToCredit(parseFloat(e.target.value) || 0)}
                      className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold min-h-[50px] text-navy-900"
                      placeholder="Enter amount to be added to user's balance upon approval..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      disabled={!taxRefundAmountToCredit || taxRefundAmountToCredit <= 0}
                      onClick={() => {
                        if (selectedTaxRefund._id) {
                          updateTaxRefundStatus(selectedTaxRefund._id, 'approved');
                        }
                        setShowTaxRefundModal(false);
                        setTaxRefundAmountToCredit(0);
                      }}
                      className="bg-navy-900 hover:bg-navy-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-navy-50 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all shadow-xl"
                    >
                      Authorise
                    </button>
                    <button
                      onClick={() => {
                        if (selectedTaxRefund._id) {
                          updateTaxRefundStatus(selectedTaxRefund._id, 'processing');
                        }
                        setShowTaxRefundModal(false);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-navy-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all"
                    >
                      Processing
                    </button>
                    <button
                      onClick={() => {
                        if (selectedTaxRefund._id) {
                          updateTaxRefundStatus(selectedTaxRefund._id, 'rejected');
                        }
                        setShowTaxRefundModal(false);
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      {/* Status Action Modal */}
      <AnimatePresence>
        {showStatusActionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusActionModal(false)}
              className="absolute inset-0 bg-navy-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusActionType === 'block' ? 'bg-red-50 text-red-600' : statusActionType === 'restrict' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'}`}>
                    {statusActionType === 'block' ? <Lock className="w-6 h-6" /> : statusActionType === 'restrict' ? <ShieldAlert className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-navy-900 uppercase tracking-tighter">Configure {statusActionType}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Safety Protocol Deployment</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {statusActionType !== 'normal' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-navy-900 uppercase tracking-widest mb-3">Release Fee ({userDetailData?.currency || adminCurrency})</label>
                        <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">{getCurrencySymbol(userDetailData?.currency || adminCurrency)}</div>
                          <input
                            type="number"
                            value={statusActionFee}
                            onChange={(e) => setStatusActionFee(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-12 pr-6 text-navy-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-navy-900 uppercase tracking-widest mb-3">Protocol Reason</label>
                        <textarea
                          value={statusActionReason}
                          onChange={(e) => setStatusActionReason(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-navy-900 font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all min-h-[120px]"
                          placeholder="State the reason for this action..."
                        />
                      </div>
                    </>
                  )}

                  {statusActionType === 'normal' && (
                    <p className="text-sm font-bold text-gray-500">
                      This will reset the user's status to Normal. Note: This manual reset does not perform balance refunds. Use "Restore" if a fee was paid.
                    </p>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setShowStatusActionModal(false)}
                      className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateUserStatus}
                      disabled={isProcessingStatus}
                      className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white transition-all shadow-xl ${statusActionType === 'block' ? 'bg-red-600 shadow-red-900/20 hover:bg-red-700' : statusActionType === 'restrict' ? 'bg-amber-600 shadow-amber-900/20 hover:bg-amber-700' : 'bg-navy-900 shadow-navy-900/20 hover:bg-navy-800'}`}
                    >
                      {isProcessingStatus ? 'Processing...' : `Confirm ${statusActionType}`}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {showBalanceAdjustmentModal && (
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full border border-white/20 overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-navy-900 uppercase tracking-tighter">Manual Balance Adjust</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Authorised Financial Override Profile</p>
                  </div>
                  <button
                    onClick={() => setShowBalanceAdjustmentModal(false)}
                    className="w-12 h-12 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-navy-900 uppercase tracking-widest mb-3">Adjustment Action</label>
                    <select
                      value={balanceAdjustmentData.action}
                      onChange={(e) => setBalanceAdjustmentData({ ...balanceAdjustmentData, action: e.target.value as 'add' | 'subtract' })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-navy-900 font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="add">Add Funds (+)</option>
                      <option value="subtract">Deduct Funds (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-navy-900 uppercase tracking-widest mb-3">Adjustment Amount ({userDetailData?.currency || adminCurrency})</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">{getCurrencySymbol(userDetailData?.currency || adminCurrency)}</div>
                      <input
                        type="number"
                        value={balanceAdjustmentData.amount}
                        onChange={(e) => setBalanceAdjustmentData({ ...balanceAdjustmentData, amount: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-12 pr-6 text-navy-900 font-bold focus:ring-2 focus:ring-primary-500/20 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-navy-900 uppercase tracking-widest mb-3">Adjustment Protocol Reason</label>
                    <textarea
                      value={balanceAdjustmentData.reason}
                      onChange={(e) => setBalanceAdjustmentData({ ...balanceAdjustmentData, reason: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-navy-900 font-bold focus:ring-2 focus:ring-primary-500/20 outline-none min-h-[100px]"
                      placeholder="e.g., Manual bonus credit for verification..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setShowBalanceAdjustmentModal(false)}
                      className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all"
                    >
                      Abort
                    </button>
                    <button
                      onClick={handleBalanceAdjustment}
                      disabled={isProcessingBalanceAdjustment}
                      className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-navy-900 text-navy-50 hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/20 flex items-center justify-center gap-2"
                    >
                      {isProcessingBalanceAdjustment ? (
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      <span>Authorise Adjustment</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSection;
