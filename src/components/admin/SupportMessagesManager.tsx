'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Reply, Clock, User, Mail, AlertCircle, CheckCircle, XCircle, Shield, ShieldCheck, Filter, Send, ArrowLeft, Search } from 'lucide-react';

interface SupportMessage {
  _id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  adminReplies: Array<{
    adminId: string;
    adminEmail: string;
    reply: string;
    createdAt: string;
  }>;
}

const SupportMessagesManager = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchSupportMessages();
  }, [statusFilter, priorityFilter]);

  const fetchSupportMessages = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await fetch(`/api/admin/support-messages?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Error fetching support messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setReplying(true);
    try {
      const response = await fetch('/api/admin/support-messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: selectedMessage._id,
          adminReply: replyText.trim(),
          status: 'replied'
        })
      });

      const result = await response.json();

      if (result.success) {
        setReplyText('');
        fetchSupportMessages();
        // Update selected message
        const updatedMessage = messages.find(m => m._id === selectedMessage._id);
        if (updatedMessage) {
          setSelectedMessage(updatedMessage);
        }
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setReplying(false);
    }
  };

  const updateStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/support-messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          status
        })
      });

      const result = await response.json();

      if (result.success) {
        fetchSupportMessages();
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage({ ...selectedMessage, status });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 animate-pulse">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-50 rounded-lg w-48"></div>
            <div className="h-4 bg-gray-50 rounded-lg w-64"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="h-[500px] bg-gray-50 rounded-3xl"></div>
          <div className="h-[500px] bg-gray-50 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-navy-900">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center shadow-xl shadow-navy-900/10 shrink-0">
            <MessageSquare className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Support messages</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage participant requests & communications</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-6 py-4 pr-12 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-black text-navy-900 text-[11px] uppercase tracking-widest shadow-sm hover:border-gray-200 cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="open">Open Cases</option>
              <option value="replied">Processed</option>
              <option value="closed">Resolved</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
              <Filter className="w-4 h-4" />
            </div>
          </div>

          <div className="relative group">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none px-6 py-4 pr-12 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-black text-navy-900 text-[11px] uppercase tracking-widest shadow-sm hover:border-gray-200 cursor-pointer"
            >
              <option value="all">Priority: All</option>
              <option value="high">Critical</option>
              <option value="normal">Standard</option>
              <option value="low">Passive</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Messages List */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h4 className="text-xs font-black uppercase tracking-widest text-navy-900">Communication Queue</h4>
            <span className="bg-navy-900 text-navy-50 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-navy-900/10">{messages.length} Active Sequences</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 border border-dashed border-gray-200">
                  <MessageSquare className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">No messages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-6 rounded-[2rem] cursor-pointer transition-all border ${selectedMessage?._id === message._id
                      ? 'bg-primary-50 border-primary-200 shadow-lg shadow-primary-500/5'
                      : 'bg-white border-gray-50 hover:border-gray-200 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <h5 className={`font-black uppercase tracking-tight truncate text-[13px] ${selectedMessage?._id === message._id ? 'text-navy-900' : 'text-navy-900/60'}`}>{message.subject}</h5>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Mail className="w-3 h-3 text-primary-500" />
                          <span className="text-[10px] font-bold text-gray-400 truncate">{message.userEmail}</span>
                        </div>
                      </div>
                      <div className={`shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${message.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' :
                          message.priority === 'normal' ? 'bg-primary-50 text-primary-600 border-primary-200' :
                            'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                        {message.priority === 'high' ? 'Critical' : message.priority === 'normal' ? 'Standard' : 'Passive'}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold line-clamp-1 mb-4 leading-relaxed uppercase tracking-tighter">{message.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIconSmall status={message.status} />
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                          {new Date(message.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {message.adminReplies.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-navy-900 text-navy-50 rounded-lg shadow-sm">
                          <Reply className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">
                            {message.adminReplies.length} SECURE REPLIES
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Details and Reply */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {selectedMessage ? (
            <>
              <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h4 className="text-xl font-black uppercase tracking-tighter text-navy-900 leading-tight pr-8">{selectedMessage.subject}</h4>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Message ID: {selectedMessage._id}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${selectedMessage.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' :
                      selectedMessage.priority === 'normal' ? 'bg-primary-50 text-primary-600 border-primary-200' :
                        'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                    {selectedMessage.priority} CLASSIFICATION
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                      <User className="w-4 h-4 text-primary-500" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-navy-900/40">{selectedMessage.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <span className="text-[11px] font-black uppercase tracking-tight text-gray-300">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-gray-50/20">
                {/* User Message */}
                <div className="flex items-start gap-4 animate-in slide-in-from-left duration-500">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                    <User className="w-6 h-6 text-gray-300" />
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 text-navy-900 shadow-sm max-w-[85%]">
                    <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                    <p className="text-[9px] font-black text-gray-300 uppercase mt-4 tracking-widest">TRANSMITTED BY ORIGIN</p>
                  </div>
                </div>

                {/* Admin Replies */}
                {selectedMessage.adminReplies.map((reply, index) => (
                  <div key={index} className="flex items-start gap-4 justify-end animate-in slide-in-from-right duration-500">
                    <div className="bg-navy-900 rounded-3xl p-6 border border-navy-800 text-white shadow-xl shadow-navy-900/10 max-w-[85%] order-1">
                      <div className="flex items-center justify-between mb-4 gap-12">
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{reply.adminEmail}</span>
                        <span className="text-[9px] font-bold text-white/30 truncate">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{reply.reply}</p>
                      <p className="text-[9px] font-black text-primary-500/40 uppercase mt-4 tracking-widest">ENCRYPTED ADMIN RESPONSE</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shrink-0 border border-primary-400 shadow-lg order-2 scroll-mt-20">
                      <ShieldCheck className="w-6 h-6 text-navy-900" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions & Reply */}
              <div className="p-8 border-t border-gray-100 bg-white space-y-6">
                <div className="relative group">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Synthesize secure response protocol..."
                    className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none text-[13px] font-bold text-navy-900 shadow-inner min-h-[120px]"
                  />
                  <div className="absolute right-6 bottom-6 opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <ShieldCheck className="w-6 h-6 text-primary-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(selectedMessage._id, 'closed')}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${selectedMessage.status === 'closed'
                        ? 'bg-green-50 text-green-500 border-green-100 cursor-default'
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500 hover:border-green-100'
                        }`}
                    >
                      Archive message
                    </button>
                    <button
                      onClick={() => updateStatus(selectedMessage._id, 'open')}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${selectedMessage.status === 'open'
                        ? 'bg-primary-50 text-primary-600 border-primary-100 cursor-default'
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100'
                        }`}
                    >
                      Re-Open Protocol
                    </button>
                  </div>
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                    className="bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-navy-50 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-navy-900/10 flex items-center gap-4 group active:scale-95"
                  >
                    {replying ? (
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                    <span>{replying ? 'TRANSMITTING...' : 'AUTHORIZE RESPONSE'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
              <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-10 border border-dashed border-gray-200">
                <MessageSquare className="w-16 h-16 text-gray-300" />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter text-navy-900">Sequence Inactive</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 max-w-[320px]">Select a message to reply to</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper components
const StatusIconSmall = ({ status }: { status: string }) => {
  switch (status) {
    case 'open': return <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20" title="Active Protocol" />;
    case 'replied': return <div className="w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-primary-500/20" title="Replied" />;
    case 'closed': return <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-500/20" title="Sequence Resolved" />;
    default: return <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />;
  }
};

export default SupportMessagesManager;
