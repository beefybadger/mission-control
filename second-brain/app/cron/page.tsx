'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap, RefreshCw, Activity, ShieldAlert } from 'lucide-react';

export default function CronManager() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const response = await fetch('/api/cron');
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : (data.jobs || []));
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white italic">Cron Monitor</h2>
          <p className="text-slate-400 text-lg mt-2">View the current state of automated system loops.</p>
        </div>
        <button 
          onClick={fetchJobs}
          className="bg-white/5 hover:bg-white/10 text-slate-300 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all border border-white/5"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh State
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Querying Scheduler...</div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center bg-[#090909] border border-dashed border-white/5 rounded-3xl">
            <ShieldAlert size={32} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No active cron jobs found in the system.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const jobId = job.jobId || job.id;
            return (
              <div key={jobId} className={`bg-[#090909] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all group ${!job.enabled ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-6">
                    <div className={`w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center ${job.enabled ? 'text-blue-500' : 'text-slate-600'}`}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{job.name || 'Unnamed Job'}</h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Zap size={12} className="text-amber-500" /> {job.schedule?.expr || job.schedule?.kind || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><Activity size={12} /> Target: {job.sessionTarget}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                      job.enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {job.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Next Sync: <span className="text-slate-400">{job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toLocaleString() : 'N/A'}</span>
                  </p>
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest italic select-none">Read Only Mode</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
