'use client';

import { useState, useEffect } from 'react';
import { Clock, RefreshCw, Play, Pause } from 'lucide-react';
import type { CronJob } from '@/types';

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await fetch('/api/cron');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.jobs ?? []);
    } catch (e) {
      console.error('Failed to fetch cron jobs:', e);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white mb-4 italic underline decoration-blue-500/30 text-shadow">Cron Operations</h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
            Scheduled tasks and automated job management.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 bg-white/5 hover:bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-slate-600 text-sm">Loading cron jobs...</div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-slate-600">
          <Clock className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm font-medium">No cron jobs configured.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, i) => (
            <div key={job.jobId || job.id || i} className="bg-[#090909] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${job.enabled ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-500/10 border border-white/5'}`}>
                  {job.enabled ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4 text-slate-500" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{job.name || job.jobId || `Job ${i + 1}`}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {job.schedule?.expr || 'No schedule'} · {job.sessionTarget || 'default'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${job.enabled
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-500 border-white/5'
                  }`}>
                  {job.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
