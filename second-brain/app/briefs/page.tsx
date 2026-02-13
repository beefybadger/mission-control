'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Search, BookOpen } from 'lucide-react';
import type { Memory } from '@/types';

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefs();
  }, []);

  async function fetchBriefs() {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .ilike('file_path', '%brief%')
      .order('created_at', { ascending: false });

    if (!error && data) setBriefs(data as Memory[]);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-black tracking-tighter text-white mb-4 italic underline decoration-blue-500/30 text-shadow">Daily Briefs</h2>
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
          Aggregated intelligence and status updates from Baron&apos;s daily operations.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-slate-600 text-sm">Loading briefs...</div>
        </div>
      ) : briefs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-slate-600">
          <BookOpen className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm font-medium">No briefs available yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {briefs.map((brief) => (
            <div key={brief.id} className="bg-[#090909] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {new Date(brief.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {brief.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
