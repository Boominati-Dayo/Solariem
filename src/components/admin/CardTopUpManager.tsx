'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  User, 
  DollarSign,
  Search,
  Clock,
  ArrowRight
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface TopUpRequest {
  _id: string;
  userId: string;
  cardId: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    userCode: string;
    currency?: string;
  };
  card: {
    lastFour: string;
    cardType: string;
    cardLevel: string;
  };
}

const CardTopUpManager = () => {
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cards/topup?status=pending');
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (err) {
      showError('Failed to load top-up requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, action: 'approve' | 'decline') => {
    setProcessingId(requestId);
    try {
      const res = await fetch('/api/admin/cards/topup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(`Top-up ${action}d successfully`);
        fetchRequests();
      } else {
        showError(data.error || 'Operation failed');
      }
    } catch (err) {
      showError('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.user?.userCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.card?.lastFour.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 uppercase tracking-tighter">Card Liquidity Queue</h2>
          <p className="text-sm text-gray-500 font-medium">Verify and authorise manual card top-up requests</p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 hover:text-navy-900 border border-gray-100 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Sync Queue
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Filter by email, user code, or card ends with..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Processing Financial Intel...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((r) => (
            <div key={r._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-8 group hover:border-primary-500/30 transition-all">
              <div className="flex items-center gap-4 min-w-[250px]">
                <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center font-black text-navy-900 uppercase">
                  {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-navy-900">{r.user?.firstName} {r.user?.lastName}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{r.user?.userCode}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Card Reference</p>
                  <p className="text-xs font-black text-navy-900 flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-primary-500" />
                    {r.card?.cardType} •••• {r.card?.lastFour}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Amount</p>
                  <p className="text-lg font-black text-navy-900 font-mono">{r.user?.currency || 'USD'} {r.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Status</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100 text-[9px] font-black uppercase tracking-widest">
                    Pending
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Requested</p>
                  <p className="text-[10px] font-bold text-navy-900 uppercase tracking-tighter">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full lg:w-auto">
                <button
                  disabled={processingId === r._id}
                  onClick={() => handleAction(r._id, 'decline')}
                  className="flex-1 lg:px-6 h-12 bg-red-50 text-red-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
                >
                  Decline
                </button>
                <button
                  disabled={processingId === r._id}
                  onClick={() => handleAction(r._id, 'approve')}
                  className="flex-1 lg:px-6 h-12 bg-navy-900 text-navy-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-navy-800 transition-all flex items-center justify-center gap-2"
                >
                  {processingId === r._id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Authorise
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No pending top-up requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardTopUpManager;
