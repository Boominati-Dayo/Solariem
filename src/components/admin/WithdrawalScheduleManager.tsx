'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, Save, AlertCircle, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface WithdrawalSchedule {
  enabled: boolean;
  allowedDays: string[];
  allowedTimes: {
    start: string;
    end: string;
  };
  timezone: string;
}

const WithdrawalScheduleManager = () => {
  const [schedule, setSchedule] = useState<WithdrawalSchedule>({
    enabled: false,
    allowedDays: [],
    allowedTimes: { start: '09:00', end: '17:00' },
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/admin/withdrawal-schedule');
      const result = await response.json();

      if (result.success) {
        setSchedule(result.data);
      }
    } catch (error) {
      console.error('Error fetching withdrawal schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/withdrawal-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(schedule)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Protocol Synced Successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update schedule' });
      }
    } catch (error) {
      console.error('Error updating withdrawal schedule:', error);
      setMessage({ type: 'error', text: 'Failed to update withdrawal schedule' });
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      allowedDays: prev.allowedDays.includes(day)
        ? prev.allowedDays.filter(d => d !== day)
        : [...prev.allowedDays, day]
    }));
  };

  const handleTimeChange = (field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      allowedTimes: {
        ...prev.allowedTimes,
        [field]: value
      }
    }));
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
        <div className="space-y-6">
          <div className="h-20 bg-gray-50 rounded-3xl"></div>
          <div className="grid grid-cols-2 gap-8">
            <div className="h-40 bg-gray-50 rounded-3xl"></div>
            <div className="h-40 bg-gray-50 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 text-navy-900">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center shadow-xl shadow-navy-900/10 shrink-0">
          <Clock className="w-8 h-8 text-primary-500" />
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-navy-900">Temporal Restriction</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure active disbursement windows</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-10 p-6 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center gap-4 transition-all animate-in slide-in-from-top duration-300 ${message.type === 'success'
          ? 'bg-primary-50 border border-primary-100 text-primary-600 shadow-sm'
          : 'bg-red-50 border border-red-100 text-red-500 shadow-sm'
          }`}>
          <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-primary-500/10' : 'bg-red-500/10'}`}>
            {message.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-10">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6">
          <button
            onClick={() => {
              setSchedule(prev => ({ ...prev, enabled: false }));
              // Use a slight delay to ensure state update if needed, or just call save with local state
              setTimeout(handleSave, 100);
            }}
            disabled={saving || !schedule.enabled}
            className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center justify-between group ${
              !schedule.enabled 
                ? 'bg-primary-50 border-primary-200 cursor-default' 
                : 'bg-navy-900 border-navy-800 hover:bg-navy-800 active:scale-[0.98]'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${!schedule.enabled ? 'bg-primary-500/20 text-primary-600' : 'bg-primary-500 text-white'}`}>
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h4 className={`text-lg font-black uppercase tracking-tighter ${!schedule.enabled ? 'text-primary-600' : 'text-primary-500'}`}>Allow Withdrawals At All Times</h4>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${!schedule.enabled ? 'text-primary-400' : 'text-gray-400'}`}>
                  {!schedule.enabled ? 'System currently open for all participants' : 'Disable all temporal restrictions instantly'}
                </p>
              </div>
            </div>
            {schedule.enabled && (
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowRight className="w-6 h-6 text-primary-500" />
              </div>
            )}
          </button>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-8 bg-gray-50 border border-gray-100 rounded-[2rem] hover:border-gray-200 transition-all group">
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight group-hover:text-primary-500 transition-colors">Manual Schedule Control</h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure specific active windows</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={schedule.enabled}
              onChange={(e) => setSchedule(prev => ({ ...prev, enabled: e.target.checked }))}
            />
            <div className="w-16 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-navy-900"></div>
          </label>
        </div>

        {schedule.enabled && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Allowed Days */}
            <div className="p-8 border border-gray-100 rounded-[2.5rem] bg-white shadow-sm space-y-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-navy-900 flex items-center gap-4">
                <div className="p-2.5 bg-primary-50 text-primary-500 rounded-xl"><Calendar className="w-4 h-4" /></div>
                Operation Days
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {daysOfWeek.map(day => (
                  <label key={day.value} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${schedule.allowedDays.includes(day.value) ? 'bg-primary-50 border-primary-100' : 'bg-gray-50/50 border-transparent hover:border-gray-200'
                    }`}>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={schedule.allowedDays.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${schedule.allowedDays.includes(day.value) ? 'bg-navy-900 border-navy-900' : 'bg-white border-gray-200'
                        }`}>
                        {schedule.allowedDays.includes(day.value) && <CheckCircle className="w-3 h-3 text-primary-500" />}
                      </div>
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${schedule.allowedDays.includes(day.value) ? 'text-navy-900' : 'text-gray-400'
                      }`}>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              {/* Allowed Times */}
              <div className="p-8 border border-gray-100 rounded-[2.5rem] bg-white shadow-sm space-y-8">
                <h4 className="text-xs font-black uppercase tracking-widest text-navy-900 flex items-center gap-4">
                  <div className="p-2.5 bg-primary-50 text-primary-500 rounded-xl"><Clock className="w-4 h-4" /></div>
                  Disbursement Window
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">
                      Entry Time
                    </label>
                    <input
                      type="time"
                      value={schedule.allowedTimes.start}
                      onChange={(e) => handleTimeChange('start', e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-black text-navy-900"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary-500 transition-colors">
                      Exit Time
                    </label>
                    <input
                      type="time"
                      value={schedule.allowedTimes.end}
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-black text-navy-900"
                    />
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock className="w-24 h-24 text-navy-900" />
                </div>
                <div className="flex items-start gap-6">
                  <div className="p-3 bg-white rounded-2xl shadow-sm"><AlertCircle className="w-6 h-6 text-primary-600" /></div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">Technical Advisory</h4>
                    <p className="text-[11px] font-bold text-gray-400 mt-2 leading-relaxed uppercase tracking-wide">
                      Participants will only be authorised to submit disbursement requests during the specified sequence.
                      Base Reference: <span className="text-primary-600 font-black">{schedule.timezone}</span> temporal zone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-navy-50 px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-4 group active:scale-95"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            )}
            <span>{saving ? 'Synchronizing...' : 'Authorise Protocol Update'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalScheduleManager;
