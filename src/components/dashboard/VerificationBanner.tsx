'use client';

import React from 'react';
import { Mail, ShieldAlert, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VerificationBannerProps {
    onNavigate: (section: string) => void;
    hideEmail?: boolean;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({ onNavigate, hideEmail = false }) => {
    const { userProfile } = useAuth();

    if (!userProfile) return null;

    const showEmailBanner = !userProfile.emailVerified && !hideEmail;
    const showKycBanner = userProfile.kycStatus !== 'verified';

    if (!showEmailBanner && !showKycBanner) return null;

    return (
        <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {showEmailBanner && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl mobile:rounded-2xl p-4 mobile:p-5 flex items-center justify-between group cursor-pointer hover:bg-amber-100/50 transition-all"
                    onClick={() => onNavigate('activate-email')}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs mobile:text-sm font-black text-amber-900 uppercase tracking-tight">Email Verification Required</h4>
                            <p className="text-[10px] mobile:text-xs text-amber-900/60 font-medium">Please verify your email address to secure your account and enable withdrawals.</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
            )}

            {showKycBanner && (
                <div className="bg-navy-900 border border-primary-500/20 rounded-xl mobile:rounded-2xl p-4 mobile:p-5 flex items-center justify-between group cursor-pointer hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10"
                    onClick={() => onNavigate('kyc')}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs mobile:text-sm font-black text-primary-500 uppercase tracking-tight">Identity Verification (KYC)</h4>
                            <p className="text-[10px] mobile:text-xs text-white/60 font-medium">Complete your identity verification to access premium banking services and high-volume limits.</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary-500/50 group-hover:translate-x-1 transition-transform" />
                </div>
            )}
        </div>
    );
};

export default VerificationBanner;
