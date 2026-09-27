'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLoaderProps {
  children: React.ReactNode;
}

export default function DashboardLoader({ children }: DashboardLoaderProps) {
  const { user, userProfile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true when component mounts
    if (loading === false) {
      setMounted(true);
    }
  }, [loading]);

  // Show loading spinner until auth is initialized AND component is mounted
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0E5A50]"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}











