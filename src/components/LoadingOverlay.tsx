'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';

const LoadingOverlay = () => {
  const { isLoading, loadingMessage } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-[#0E5A50] animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-[#14130F]"></div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {loadingMessage}
                </h3>
                <div className="flex space-x-1 justify-center">
                  <div className="w-2 h-2 bg-[#0E5A50] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#0E5A50] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#0E5A50] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
