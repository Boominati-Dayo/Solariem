'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, Camera, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { compressImage } from '@/lib/imageCompressor';
import Image from 'next/image';

const KYCSection = () => {
    const { user, userProfile, forceRefresh } = useAuth();
    const [step, setStep] = useState(1);
    const [isResubmitting, setIsResubmitting] = useState(false);
    const [idFront, setIdFront] = useState<string | null>(null);
    const [idBack, setIdBack] = useState<string | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
        const file = e.target.files?.[0];
        if (file) {
            // Allow very large files; compressImage will always shrink them to under 800KB.
            if (file.size > 50 * 1024 * 1024) {
                showError('File is too large. Maximum 50MB allowed.');
                e.target.value = '';
                return;
            }
            try {
                // Cap each image at ~700KB so three KYC images stay well under the 4MB Next.js body limit
                const compressedBase64 = await compressImage(file, { maxWidth: 1400, maxHeight: 1400, quality: 0.75, maxBytes: 700 * 1024 });
                if (type === 'front') setIdFront(compressedBase64);
                if (type === 'back') setIdBack(compressedBase64);
                if (type === 'selfie') setSelfie(compressedBase64);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to process image. Please try another.';
                console.error("Image compression error:", error);
                showError(message);
                e.target.value = '';
            }
        }
    };

    const handleSubmit = async () => {
        if (!idFront || !idBack || !selfie) {
            showError('Please upload all required documents.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/kyc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?._id,
                    documents: { idFront, idBack, selfie }
                })
            });

            const result = await response.json();
            if (result.success) {
                showSuccess('KYC documents submitted successfully! Our team will review them within 24-48 hours.');
                await forceRefresh();
            } else {
                showError(result.error || 'Failed to submit KYC documents.');
            }
        } catch (error) {
            console.error('KYC submission error:', error);
            showError('An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (userProfile?.kycStatus === 'verified') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Account Verified</h3>
                <p className="text-gray-500 max-w-md">Your identity has been successfully verified. You now have full access to all financial features.</p>
            </div>
        );
    }

    if (userProfile?.kycStatus === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Verification Pending</h3>
                <p className="text-gray-500 max-w-md">We are currently reviewing your documents. This process usually takes 24-48 hours. Thank you for your patience.</p>
            </div>
        );
    }

    if (userProfile?.kycStatus === 'rejected' && !isResubmitting) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <X className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Verification Declined</h3>
                <p className="text-gray-500 max-w-md mb-8">Unfortunately, your identity verification was declined. This could be due to unclear document photos or mismatched information.</p>
                <div className="bg-red-50 p-4 rounded-xl mb-8 w-full max-w-md border border-red-100">
                    <p className="text-red-600 text-sm font-medium">Reason: {userProfile.kycRejectionReason || "No specific reason provided."}</p>
                </div>
                <button 
                    onClick={() => {
                        setIdFront(null);
                        setIdBack(null);
                        setSelfie(null);
                        setStep(1);
                        setIsResubmitting(true);
                    }}
                    className="px-8 py-3 bg-navy-900 text-navy-50 rounded-xl font-bold transition-all hover:bg-navy-800"
                >
                    Resubmit Documents
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Identify Verification (KYC)</h2>
                <p className="text-gray-500">To comply with financial regulations and ensure the security of your account, please complete your identity verification.</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                {[1, 2, 3].map((s) => (
                    <div key={s} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-primary-500 text-[#14130F]' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                            {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                        </div>
                        <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${step >= s ? 'text-navy-900' : 'text-gray-400'}`}>
                            {s === 1 ? 'ID Front' : s === 2 ? 'ID Back' : 'Selfie'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 mobile:p-10 border border-gray-100">
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-xl font-bold text-navy-900 mb-6">Upload Front of ID Card</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white">
                            {idFront ? (
                                <div className="relative inline-block">
                                    <Image src={idFront} alt="ID Front" width={400} height={250} unoptimized className="rounded-xl shadow-lg h-auto w-full max-w-md mx-auto" />
                                    <button onClick={() => setIdFront(null)} className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full"><X className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'front')} />
                                    <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-navy-900 font-bold">Select ID Front Image</p>
                                    <p className="text-gray-400 text-sm mt-1">PNG, JPG or WEBP (Max 15MB)</p>
                                </label>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={() => setStep(2)} disabled={!idFront} className="px-8 py-3 bg-navy-900 text-navy-50 rounded-xl font-bold disabled:opacity-50">Next Step</button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-xl font-bold text-navy-900 mb-6">Upload Back of ID Card</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white">
                            {idBack ? (
                                <div className="relative inline-block">
                                    <Image src={idBack} alt="ID Back" width={400} height={250} unoptimized className="rounded-xl shadow-lg h-auto w-full max-w-md mx-auto" />
                                    <button onClick={() => setIdBack(null)} className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full"><X className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'back')} />
                                    <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-navy-900 font-bold">Select ID Back Image</p>
                                    <p className="text-gray-400 text-sm mt-1">PNG, JPG or WEBP (Max 15MB)</p>
                                </label>
                            )}
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button onClick={() => setStep(1)} className="px-8 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold">Back</button>
                            <button onClick={() => setStep(3)} disabled={!idBack} className="px-8 py-3 bg-navy-900 text-navy-50 rounded-xl font-bold disabled:opacity-50">Next Step</button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-xl font-bold text-navy-900 mb-6">Take a Selfie</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white">
                            {selfie ? (
                                <div className="relative inline-block">
                                    <Image src={selfie} alt="Selfie" width={300} height={300} unoptimized className="rounded-xl shadow-lg h-auto w-full max-w-[250px] mx-auto" />
                                    <button onClick={() => setSelfie(null)} className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full"><X className="w-5 h-5" /></button>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'selfie')} />
                                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-navy-900 font-bold">Select or Take Selfie</p>
                                    <p className="text-gray-400 text-sm mt-1">Ensure your face is clearly visible</p>
                                </label>
                            )}
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button onClick={() => setStep(2)} className="px-8 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold">Back</button>
                            <button onClick={handleSubmit} disabled={!selfie || isSubmitting} className="px-8 py-3 bg-primary-500 text-[#14130F] rounded-xl font-bold disabled:opacity-50 flex items-center">
                                {isSubmitting ? 'Submitting...' : 'Complete Submission'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-10 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-4">
                <ShieldCheck className="w-10 h-10 text-blue-600 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-navy-900">Your data is safe with us</h4>
                    <p className="text-sm text-gray-600 mt-1">We use end-to-end encryption to protect your identity documents. Your information will only be used for verification purposes.</p>
                </div>
            </div>
        </div>
    );
};

export default KYCSection;
