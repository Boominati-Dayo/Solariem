'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminNewsletterPage() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to send this newsletter to ALL subscribers?')) {
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            const response = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subject, message }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send newsletter');
            }

            setStatus({ type: 'success', message: data.message });
            setSubject('');
            setMessage('');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Send Newsletter</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl">
                    {status && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-[#EDF2F0] text-[#0A463E]'
                            }`}>
                            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSend} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent"
                                placeholder="e.g., New Recovery Updates"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message Content (HTML supported)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={12}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E5A50] focus:border-transparent font-mono text-sm"
                                placeholder="<h1>Hello!</h1><p>We have updates...</p>"
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                You can use HTML tags for formatting.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#0E5A50] hover:bg-[#0A463E] disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Newsletter
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
