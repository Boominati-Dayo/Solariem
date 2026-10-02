'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { showSuccess, showError } from '@/utils/toast';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  emailVerified: boolean;
  userCode: string;
  isAdmin: boolean;
  isActive: boolean;
  profilePicture?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  currency?: string;
  totalDeposit: number;
  totalWithdraw: number;
  referralEarnings: number;
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  kycDocuments?: {
    idFront?: string;
    idBack?: string;
    selfie?: string;
  };
  kycSubmittedAt?: Date;
  kycVerifiedAt?: Date;
  kycRejectionReason?: string;
  balances?: {
    main: number;
    referral: number;
    total: number;
  };
  isAccountBlocked?: boolean;
  isAccountRestricted?: boolean;
  accountBlockReason?: string;
  accountUnblockFee?: number;
  transactions?: Array<{
    type: 'daily_gain' | 'referral_bonus' | 'deposit' | 'withdrawal';
    amount: number;
    date: Date;
    status: 'completed' | 'pending' | 'failed';
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  activityLog?: Array<{
    action: string;
    timestamp: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  userProfile: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    transactionPin: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    accountType: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    zip?: string;
    /**
     * Present because the register route reads it and passes it to
     * UserService — it was missing here, so a caller passing `currency` got a
     * type error and the account was silently created without one.
     */
    currency?: string;
    referralCode?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Start polling when user is authenticated
  useEffect(() => {
    if (user) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUser(result.data.user);
          setUserProfile(result.data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // Clear any existing polling
    stopPolling();

    // Poll every 60 seconds for user data updates (reduced frequency to prevent flicker)
    const interval = setInterval(async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 60000); // 60 seconds

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const forceRefresh = async () => {
    await refreshUser();
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.data.user);
        setUserProfile(result.data.user);
        showSuccess('Login successful!');
        return true;
      } else {
        showError(result.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    transactionPin: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    accountType: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    zip?: string;
    referralCode?: string;
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        // Don't set user as authenticated - they need to verify email first
        // Clear any existing auth state
        setUser(null);
        setUserProfile(null);

        showSuccess('Registration successful! Please check your email to verify your account, then login.');
        return true;
      } else {
        showError(result.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      setUserProfile(null);
      showSuccess('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setUserProfile(null);
    }
  };


  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess(result.message || 'Password reset email sent');
        return true;
      } else {
        showError(result.error || 'Failed to send password reset email');
        return false;
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showError('Failed to send password reset email. Please try again.');
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Password reset successfully!');
        return true;
      } else {
        showError(result.error || 'Password reset failed');
        return false;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showError('Password reset failed. Please try again.');
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Profile updated successfully!');
        // Refresh user data
        await refreshUser();
        return true;
      } else {
        showError(result.error || 'Profile update failed');
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showError('Profile update failed. Please try again.');
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Only update if data has changed to prevent infinite re-render loops or flickering
          const newUser = result.data.user;
          const currentUserStr = JSON.stringify(user);
          const newUserStr = JSON.stringify(newUser);

          if (currentUserStr !== newUserStr) {
            setUser(newUser);
            setUserProfile(newUser);
          }
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Email verified successfully!');
        // Refresh user data to get updated emailVerified status
        await refreshUser();
        return true;
      } else {
        showError(result.error || 'Email verification failed');
        return false;
      }
    } catch (error) {
      console.error('Email verification error:', error);
      showError('Email verification failed. Please try again.');
      return false;
    }
  }, [refreshUser, showSuccess, showError]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshUser,
    forceRefresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
