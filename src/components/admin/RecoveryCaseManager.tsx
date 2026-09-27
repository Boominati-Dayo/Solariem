'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Search,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Clipboard,
  Shield,
  Scale,
  Building2,
  RefreshCcw,
  Trash2
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface RecoveryUpdate {
  status: string;
  message: string;
  timestamp: string;
}

interface RecoveryCase {
  _id: string;
  userId?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isPublic: boolean;
  claimNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  amountClaimed?: number;
  serviceFee?: number;
  unblockFee?: number;
  scamType: string;
  amountLost: number;
  currency?: string;
  dateOfIncident: string;
  platformName: string;
  details: string;
  status: string;
  adminNotes?: string;
  updates: RecoveryUpdate[];
  createdAt: string;
}

const RecoveryCaseManager = () => {
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update state
  const [updateData, setUpdateData] = useState({
    status: '',
    adminNotes: '',
    updateMessage: '',
    amountClaimed: '',
    serviceFee: '',
    unblockFee: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/recovery');
      const data = await res.json();
      if (data.success) setCases(data.data);
    } catch (err) {
      showError('Failed to load recovery cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOpenModal = (item: RecoveryCase) => {
    setSelectedCase(item);
    setUpdateData({
      status: item.status,
      adminNotes: item.adminNotes || '',
      updateMessage: '',
      amountClaimed: item.amountClaimed?.toString() || '',
      serviceFee: item.serviceFee?.toString() || '',
      unblockFee: item.unblockFee?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/recovery/${selectedCase._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Case updated');
        setIsModalOpen(false);
        fetchCases();
      } else {
        showError(data.error || 'Update failed');
      }
    } catch (err) {
      showError('Network error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this case permanently? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/recovery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Protocol item purged');
        fetchCases();
      }
    } catch (err) {
      showError('Failed to purge item');
    }
  };

  const filteredCases = cases.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const userName = c.isPublic ? `${c.email}` : `${c.userId?.firstName} ${c.userId?.lastName}`;
    return userName.toLowerCase().includes(searchLower) ||
      c.platformName.toLowerCase().includes(searchLower) ||
      c.scamType.toLowerCase().includes(searchLower) ||
      (c.claimNumber && c.claimNumber.toLowerCase().includes(searchLower));
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-primary-500" />;
      case 'investigating': return <FileSearch className="w-4 h-4 text-blue-500" />;
      case 'forensic_phase': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'legal_action': return <Scale className="w-4 h-4 text-orange-500" />;
      case 'funds_frozen': return <Building2 className="w-4 h-4 text-indigo-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved': return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const XCircle = ({ className }: { className?: string }) => <X className={className} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-navy-900 uppercase tracking-tight">Recovery cases</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Global Asset Tracking & Repatriation</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-navy-900/5 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-gray-400 uppercase">Active Cases</span>
              <span className="text-sm font-black text-navy-900">{cases.filter(c => c.status !== 'completed' && c.status !== 'rejected').length}</span>
            </div>
            <div className="w-[1px] h-6 bg-gray-200"></div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-gray-400 uppercase">Recovered Total</span>
              <span className="text-sm font-black text-primary-600">USD {cases.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.amountLost, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Filter cases (customer, platform, scam type)"
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-xs uppercase tracking-wider"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-50">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Syncing Global Recovery Database...</p>
          </div>
        ) : filteredCases.length > 0 ? (
          filteredCases.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary-500/50 transition-all group">
              <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.status === 'completed' ? 'bg-green-50 text-green-500' :
                    c.status === 'rejected' ? 'bg-red-50 text-red-500' :
                      'bg-primary-50 text-primary-600'
                    }`}>
                    {c.status === 'pending' ? <Clock /> :
                      c.status === 'investigating' ? <FileSearch /> :
                        c.status === 'forensic_phase' ? <Shield /> :
                          c.status === 'legal_action' ? <Scale /> :
                            c.status === 'funds_frozen' ? <Building2 /> :
                              c.status === 'completed' ? <CheckCircle /> :
                                <AlertCircle />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-navy-900 text-sm uppercase">
                        {c.isPublic ? `${c.email} (Public)` : `${c.userId?.firstName} ${c.userId?.lastName}`}
                      </h3>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] font-black text-navy-900/40 uppercase tracking-widest">{c.claimNumber || c._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-black text-gray-500 uppercase tracking-widest">{c.scamType}</span>
                      <span className="bg-navy-900 text-navy-50 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{c.currency || 'USD'} {c.amountLost.toLocaleString()}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-black text-gray-500 uppercase tracking-widest">{c.platformName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-1.5 mb-1">
                      {getStatusIcon(c.status)}
                      <span className="text-[10px] font-black uppercase tracking-widest text-navy-900">{c.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Reported {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(c)}
                      className="p-3 bg-navy-900 text-navy-50 rounded-xl hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-50">
            <Clipboard className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No cases found</p>
          </div>
        )}
      </div>

      {/* Detail & Management Modal */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#F5F4F0] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 flex flex-col">

            {/* Modal Header */}
            <div className="p-8 bg-navy-900 text-white flex justify-between items-start shrink-0">
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white">
                  <FileSearch className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Case: {selectedCase.claimNumber || selectedCase._id.slice(-8).toUpperCase()}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedCase.status === 'completed' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-primary-500/20 text-primary-500 border-primary-500/30'
                      }`}>
                      {selectedCase.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    {selectedCase.isPublic ? `Public Submission: ${selectedCase.email}` : `Registered Target: ${selectedCase.userId?.firstName} ${selectedCase.userId?.lastName}`}
                    • Exposure: {selectedCase.currency || 'USD'} {selectedCase.amountLost.toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Intel Details */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4">Incident Parameters</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Scam Classification</p>
                          <p className="text-xs font-black text-navy-900 uppercase">{selectedCase.scamType}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Incident Date</p>
                          <p className="text-xs font-black text-navy-900 uppercase">{selectedCase.dateOfIncident}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Facilitating Platform</p>
                        <p className="text-xs font-black text-navy-900 uppercase">{selectedCase.platformName}</p>
                      </div>
                      <div className="bg-navy-900 p-4 rounded-xl text-white">
                        <p className="text-[8px] font-black text-primary-500 uppercase mb-2">Detailed Intel Segment</p>
                        <p className="text-xs font-medium leading-relaxed opacity-80">{selectedCase.details}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4">Operations Timeline</h4>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {selectedCase.updates.map((upd, i) => (
                        <div key={i} className="flex gap-4 relative">
                          {i < selectedCase.updates.length - 1 && <div className="absolute left-[7px] top-4 bottom-[-16px] w-[2px] bg-gray-100"></div>}
                          <div className={`w-4 h-4 rounded-full mt-1 shrink-0 ${i === 0 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-black text-navy-900 uppercase tracking-tight">{upd.status.replace('_', ' ')}</p>
                              <span className="text-[8px] text-gray-400 font-bold uppercase">{new Date(upd.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight">{upd.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Command Controls */}
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Operational Controls</h4>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Mission Status</label>
                      <select
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 font-black text-xs uppercase text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={updateData.status}
                        onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      >
                        <option value="pending">Pending Assignment</option>
                        <option value="investigating">Initial Investigation</option>
                        <option value="forensic_phase">Forensic Tracing Active</option>
                        <option value="legal_action">Legal Demands Issued</option>
                        <option value="funds_frozen">Assets Locked/Frozen</option>
                        <option value="approved">Approved & Ready</option>
                        <option value="completed">Recovery Finalized (Payout)</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Forensic Notes (Privileged)</label>
                      <textarea
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-navy-900 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter privileged case notes here..."
                        value={updateData.adminNotes}
                        onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Verified Recovery Amount ($)</label>
                        <input
                          type="number"
                          className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 font-black text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g. 15000"
                          value={updateData.amountClaimed}
                          onChange={(e) => setUpdateData({ ...updateData, amountClaimed: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-primary-500 uppercase tracking-widest ml-1">Agency Service Fee ($)</label>
                        <input
                          type="number"
                          className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 font-black text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g. 1500"
                          value={updateData.serviceFee}
                          onChange={(e) => setUpdateData({ ...updateData, serviceFee: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Account Unblock Fee ($)</label>
                        <input
                          type="number"
                          className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 font-black text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g. 500"
                          value={updateData.unblockFee}
                          onChange={(e) => setUpdateData({ ...updateData, unblockFee: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1">Transmission to Target (Update Message)</label>
                      <textarea
                        className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-xl font-bold text-xs text-navy-900 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What should the client see in their tracker?"
                        value={updateData.updateMessage}
                        onChange={(e) => setUpdateData({ ...updateData, updateMessage: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full h-14 bg-navy-900 text-navy-50 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-navy-900/10 hover:bg-navy-800 transition-all flex items-center justify-center gap-3"
                    >
                      {isUpdating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 'Save changes'}
                    </button>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-900/70 font-bold leading-relaxed uppercase tracking-widest">
                      Status transitions are logged and visible to the target user. Ensure forensic accuracy before authorising protocol phase shifts.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveryCaseManager;
