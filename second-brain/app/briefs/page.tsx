'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Newspaper, Lightbulb, CheckSquare, Zap } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BriefsPage() {
  const [briefs, setBriefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefs();
  }, []);

  async function fetchBriefs() {
    // For now, we fetch the daily memory logs as 'briefs'
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setBriefs(data);
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-black tracking-tighter text-white mb-4 italic">Morning Briefs</h2>
        <p className="text-slate-400 text-lg">Your historical archive of daily intelligence and business ideas.</p>
      </header>

      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse font-medium tracking-widest uppercase text-xs">Syncing Intelligence...</div>
      ) : (
        <div className="space-y-8">
          {briefs.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-slate-600 font-medium italic">Your first brief is scheduled for tomorrow at 08:30 GMT+1.</p>
            </div>
          ) : (
            briefs.map((brief) => (
              <div key={brief.id} className="bg-[#151515] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/20 transition-all">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-white uppercase tracking-widest text-sm">
                      {new Date(brief.updated_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Delivered via Telegram</span>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-tighter text-xs">
                        <Newspaper className="w-4 h-4" /> Market Intelligence
                      </div>
                      <div className="text-slate-400 leading-relaxed italic">
                        Logs archived from {brief.file_path}. Click vault for full content.
                      </div>
                   </div>
                   <div className="space-y-4 text-slate-400">
                      <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-tighter text-xs">
                        <Lightbulb className="w-4 h-4" /> Strategic Decisions
                      </div>
                      <p className="line-clamp-3 leading-relaxed">
                        {brief.content.substring(0, 300)}...
                      </p>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
