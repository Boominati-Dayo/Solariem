'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Mail, ShieldCheck, Zap } from 'lucide-react';

export default function NewsletterManager() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to broadcast this transmission to ALL subscribers? This action cannot be revoked.')) {
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
                throw new Error(data.error || 'Failed to dispatch transmission');
            }

            setStatus({ type: 'success', message: 'Transmission Dispatched Successfully' });
            setSubject('');
            setMessage('');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown protocol error occurred';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 text-navy-900">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center shadow-xl shadow-navy-900/10 shrink-0">
                    <Mail className="w-8 h-8 text-primary-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Broadcast Intelligence</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Global dissemination of secure updates</p>
                </div>
            </div>

            {status && (
                <div className={`mb-10 p-6 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center gap-4 transition-all animate-in slide-in-from-top duration-300 ${status.type === 'success'
                    ? 'bg-primary-50 border border-primary-100 text-primary-600 shadow-sm'
                    : 'bg-red-50 border border-red-100 text-red-500 shadow-sm'
                    }`}>
                    <div className={`p-2 rounded-xl ${status.type === 'success' ? 'bg-primary-500/10' : 'bg-red-500/10'}`}>
                        {status.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <span>{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSend} className="space-y-10">
                <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">
                        Transmission Header
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-black text-navy-900 placeholder:text-gray-300"
                        placeholder="ENTER SUBJECT PROTOCOL..."
                        required
                    />
                </div>

                <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">
                        Intelligence Payload (HTML Supported)
                    </label>
                    <div className="relative">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={12}
                            className="w-full px-8 py-8 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono text-[13px] text-navy-900 shadow-inner placeholder:text-gray-300"
                            placeholder="<h1>HELLO INVESTORS</h1><p>PROTOCOL UPDATE INITIATED...</p>"
                            required
                        />
                        <div className="absolute right-6 bottom-6 opacity-10 pointer-events-none group-focus-within:opacity-100 text-primary-500 transition-opacity">
                            <Zap className="w-8 h-8 fill-current" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-navy-900/5 rounded-xl border border-navy-900/5">
                        <AlertCircle className="w-4 h-4 text-primary-500" />
                        <p className="text-[9px] font-black text-navy-900/40 uppercase tracking-widest">Rich content mode active. Semantic HTML structuring is permitted.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-50">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-navy-50 px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-navy-900/10 flex items-center gap-4 group active:scale-95"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        )}
                        <span>{isLoading ? 'DISPATCHING...' : 'AUTHORIZE BROADCAST'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
