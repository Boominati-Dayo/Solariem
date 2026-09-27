'use client';

import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  showPageTransition: (message?: string) => void;
  hidePageTransition: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const setLoading = (loading: boolean, message: string = 'Loading...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };

  const showPageTransition = (message: string = 'Loading page...') => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const hidePageTransition = () => {
    setIsLoading(false);
    setLoadingMessage('Loading...');
  };

  const value = {
    isLoading,
    loadingMessage,
    setLoading,
    showPageTransition,
    hidePageTransition,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};













