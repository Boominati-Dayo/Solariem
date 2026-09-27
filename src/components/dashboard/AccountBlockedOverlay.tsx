'use client';

import React from 'react';
import { Lock, AlertCircle, ShieldAlert, ArrowRight, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccountBlockedOverlayProps {
    reason: string;
    unblockFee: number;
    currency?: string;
    onPayFee: () => void;
}

const AccountBlockedOverlay: React.FC<AccountBlockedOverlayProps> = ({ reason, unblockFee, currency = 'USD', onPayFee }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-[#171614]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative bg-[#14130F] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-6 mobile:p-12 shadow-2xl text-center max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
                <div className="w-20 h-20 mobile:w-24 mobile:h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 mobile:mb-8 border border-red-500/20">
                    <ShieldAlert className="w-10 h-10 mobile:w-12 mobile:h-12 text-red-500" />
                </div>

                <h2 className="text-2xl mobile:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                    Access Restricted
                </h2>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 mb-6 mobile:mb-8">
                    <Lock className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Account restricted</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mobile:p-6 text-left mb-6 mobile:mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="w-4 h-4 text-primary-500" />
                        <span className="text-xs font-black text-primary-500 uppercase tracking-widest">Why it is restricted</span>
                    </div>
                    <div className="max-h-[20vh] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-gray-300 text-sm font-medium leading-relaxed">
                            {reason || "Your account has been temporarily restricted due to a large asset injection. To comply with international anti-money laundering regulations, a verification fee is required for full account activation."}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6 mobile:mb-8">
                    <div className="bg-navy-900 border border-primary-500/20 rounded-2xl p-4 mobile:p-6">
                        <p className="text-[9px] mobile:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 text-center">Fee to lift the restriction</p>
                        <p className="text-3xl mobile:text-4xl font-black text-primary-500 flex items-center justify-center gap-2">
                            <span className="text-base mobile:text-lg opacity-50">{currency}</span>
                            {unblockFee.toLocaleString()}
                        </p>
                        <p className="text-[8px] mobile:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2 text-center">Refunded when the account is restored</p>
                    </div>
                </div>

                <button
                    onClick={onPayFee}
                    className="w-full h-14 mobile:h-16 bg-primary-500 text-white rounded-xl mobile:rounded-2xl font-black text-xs mobile:text-sm uppercase tracking-widest hover:bg-primary-400 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 mobile:gap-3 group"
                >
                    <CreditCard className="w-4 h-4 mobile:w-5 mobile:h-5" />
                    Pay the fee and lift the restriction
                    <ArrowRight className="w-4 h-4 mobile:w-5 mobile:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-8">
                    Solariem Compliance • Secure Core Compliance
                </p>
            </motion.div>
        </motion.div>
    );
};

export default AccountBlockedOverlay;
