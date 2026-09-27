'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Info } from 'lucide-react';

interface AccountRestrictedBannerProps {
    reason: string;
    fee: number;
    currency?: string;
    onPayFee: () => void;
}

const AccountRestrictedBanner: React.FC<AccountRestrictedBannerProps> = ({ reason, fee, currency, onPayFee }) => {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-amber-500 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 mobile:px-8 mobile:py-4 flex flex-col mobile:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-white">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs mobile:text-sm font-black uppercase tracking-widest leading-none">Account Activity Restricted</p>
                        <p className="text-[10px] mobile:text-[11px] font-bold opacity-90 mt-1 uppercase tracking-wider">
                            Reason: {reason || 'Security Verification Required'} • Release Fee: {currency || 'USD'} {fee.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onPayFee}
                        className="bg-white text-amber-600 px-6 py-2 rounded-full text-[10px] mobile:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-navy-900 hover:text-navy-50 transition-all flex items-center gap-2 group"
                    >
                        <span>Resolve Restriction</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AccountRestrictedBanner;
