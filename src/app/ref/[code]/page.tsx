'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess } from '@/utils/toast';

export default function ReferralPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const referralCode = params.code as string;

  useEffect(() => {
    if (referralCode) {
      // Store the referral code in localStorage
      localStorage.setItem('referralCode', referralCode);
      
      // Show success message
      showSuccess(`Referral code ${referralCode} applied!`);
      
      // If user is already logged in, stay on current page or redirect to dashboard
      if (user) {
        router.push('/dashboard');
      } else {
        // If not logged in, redirect to signup with referral code
        router.push(`/signup?ref=${referralCode}`);
      }
    }
  }, [referralCode, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E5A50] to-[#0b3b35]">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        <p className="text-lg">Processing your referral code...</p>
      </div>
    </div>
  );
}

