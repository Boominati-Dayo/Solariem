'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    User,
    MapPin,
    Phone,
    DollarSign,
    Calendar,
    Globe,
    FileText,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Lock,
    Zap,
    ShieldCheck,
    Upload,
    ImageIcon,
    Loader2
} from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const scamTypes = [
    'Crypto Wealth / Mining Scams',
    'Forex / Investment Fraud',
    'Romance / Social Engineering',
    'Phishing / Wallet Hacks',
    'Overcharge Agency Fee',
    'Shipment / Logistics Agency Fraud',
    'Identity Theft / Account Takeover'
];

const CaseReportPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [claimNumber, setClaimNumber] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        scamType: '',
        amountLost: '',
        dateOfIncident: '',
        platformName: '',
        details: '',
        screenshotUrl: ''
    });
    const [uploading, setUploading] = useState(false);

    const nextStep = () => {
        if (step === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone)) {
            showError('Please fill in all personal details.');
            return;
        }
        if (step === 2 && (!formData.scamType || !formData.amountLost || !formData.platformName)) {
            showError('Please provide essential scam details.');
            return;
        }
        setStep(s => s + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showError('File size must be less than 5MB.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // The upload endpoint is not an open proxy: anonymous visitors
            // need a short-lived single-use grant before it will accept a file.
            const grantRes = await fetch('/api/upload/grant', { method: 'POST' });
            const grantData = await grantRes.json();
            if (!grantRes.ok || !grantData?.grant) {
                showError(grantData?.error || 'Could not start the upload.');
                return;
            }

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'X-Upload-Grant': grantData.grant },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, screenshotUrl: data.url }));
                showSuccess('Screenshot uploaded successfully.');
            } else {
                showError(data.error || 'Upload failed.');
            }
        } catch (err) {
            showError('Network error during upload.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/public-recovery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Your forensic report has been transmitted.');
                setClaimNumber(data.data.claimNumber);
                setIsSubmitted(true);
            } else {
                showError(data.error || 'Transmission failed.');
            }
        } catch (err) {
            showError('A network error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full text-center space-y-8 p-12 rounded-[40px] bg-navy-900 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary-500"></div>
                    <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto text-primary-500">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black uppercase tracking-tight">Report Logged</h2>
                        <p className="text-white/60 font-medium">Your case has been successfully filed in our forensic registry. An intake officer will be assigned shortly.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Claim Reference</p>
                        <p className="text-4xl font-mono font-black text-primary-500 tracking-widest uppercase">{claimNumber}</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs text-white/40 italic">Check your email for confirmation and further instructions.</p>
                        <div className="flex flex-col mobile:flex-row gap-4 pt-4">
                            <button
                                onClick={() => window.location.href = '/track-claim'}
                                className="flex-1 py-5 bg-primary-500 text-navy-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-400 transition-all"
                            >
                                Track Case Progress
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl mobile:text-6xl font-black text-navy-900 tracking-tighter"
                        >
                            FILE FORENSIC <span className="text-primary-600">REPORT</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 font-medium max-w-xl mx-auto"
                        >
                            Tell us what happened and roughly how much you lost. We will read it and tell you whether the money can be traced.
                        </motion.p>
                    </div>

                    {/* Stepper */}
                    <div className="relative mb-12 max-w-md mx-auto">
                        <div className="flex items-center justify-between relative z-10">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step >= i ? 'bg-navy-900 text-navy-50 shadow-xl' : 'bg-white text-gray-300'
                                        }`}>
                                        {i}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-0">
                            <motion.div
                                className="h-full bg-navy-900"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(step - 1) * 50}%` }}
                            ></motion.div>
                        </div>
                    </div>

                    {/* Form */}
                    <motion.div
                        layout
                        className="bg-white rounded-[40px] p-8 mobile:p-12 shadow-2xl shadow-navy-900/5 border border-gray-100"
                    >
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-600">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-navy-900 uppercase tracking-tight">Personal Identity</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Who are we assisting today?</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">First Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. John"
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium placeholder:text-gray-300"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Doe"
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium placeholder:text-gray-300"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="e.g. john@example.com"
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium placeholder:text-gray-300"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. +1 (555) 000-0000"
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium placeholder:text-gray-300"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Residential Address</label>
                                            <input
                                                type="text"
                                                placeholder="Full physical address"
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium placeholder:text-gray-300"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-600">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-navy-900 uppercase tracking-tight">What happened</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Details of the scam event.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Scam Methodology</label>
                                            <select
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium"
                                                value={formData.scamType}
                                                onChange={(e) => setFormData({ ...formData, scamType: e.target.value })}
                                            >
                                                <option value="">Select Scenerio...</option>
                                                {scamTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Total Amount Lost ($)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 15000"
                                                    className="w-full px-6 py-4 pl-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-black placeholder:text-gray-300"
                                                    value={formData.amountLost}
                                                    onChange={(e) => setFormData({ ...formData, amountLost: e.target.value })}
                                                />
                                                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Date of Incident</label>
                                            <input
                                                type="date"
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium"
                                                value={formData.dateOfIncident}
                                                onChange={(e) => setFormData({ ...formData, dateOfIncident: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Platform / Entity Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. FTX, Binance Impersonator, Trading Platform Name"
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium placeholder:text-gray-300"
                                                value={formData.platformName}
                                                onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-navy-900 uppercase tracking-tight">Case Narrative</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Explain the event in depth.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Evidence & Chronology</label>
                                        <textarea
                                            placeholder="Please describe how you were contacted, what instructions were given, and any communication IDs or wallet addresses involved..."
                                            className="w-full px-6 py-5 bg-gray-50 border-none rounded-[32px] focus:ring-2 focus:ring-primary-500/20 text-navy-950 font-medium min-h-[250px] resize-none"
                                            value={formData.details}
                                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        />
                                    </div>

                                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs text-amber-900/60 font-medium leading-relaxed">
                                            <strong>Affidavit of Truth:</strong> By submitting this report, you certify that all provided information is accurate to the best of your knowledge. Giving us information you know to be false is prohibited.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Screenshot Proof of Scam (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                id="screenshot-upload"
                                                disabled={uploading}
                                            />
                                            <label
                                                htmlFor="screenshot-upload"
                                                className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[32px] cursor-pointer transition-all ${
                                                    formData.screenshotUrl 
                                                    ? 'border-green-500 bg-green-50/30' 
                                                    : 'border-gray-200 hover:border-primary-500 bg-gray-50'
                                                }`}
                                            >
                                                {uploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Uploading files...</span>
                                                    </div>
                                                ) : formData.screenshotUrl ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white">
                                                            <img src={formData.screenshotUrl} alt="Screenshot" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                                <CheckCircle2 className="text-white w-6 h-6" />
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Evidence Secured</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                        <div className="text-center">
                                                            <span className="text-xs font-bold text-navy-900 uppercase tracking-widest">Click to Upload Evidence</span>
                                                            <p className="text-[10px] text-gray-400 font-medium">PNG, JPG up to 5MB</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-12 pt-12 border-t border-gray-50">
                            {step > 1 ? (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-navy-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                            ) : <div></div>}

                            {step < 3 ? (
                                <button
                                    onClick={nextStep}
                                    className="px-12 py-5 bg-navy-900 text-navy-50 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10 flex items-center gap-2 active:scale-95"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className={`px-12 py-5 bg-navy-900 text-navy-50 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-navy-900/10 flex items-center gap-3 transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-navy-800'}`}
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : <Zap className="w-4 h-4" />}
                                    Send report
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Trust Footer */}
                    <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-40">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">ISO 27001 Certified</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">GDPR Compliant</span>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default CaseReportPage;
