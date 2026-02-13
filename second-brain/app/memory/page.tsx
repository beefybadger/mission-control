'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Brain, Search, Clock } from 'lucide-react';
import type { Memory } from '@/types';

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) setMemories(data as Memory[]);
    setLoading(false);
  }

  const filtered = search
    ? memories.filter(m =>
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.file_path.toLowerCase().includes(search.toLowerCase())
    )
    : memories;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-black tracking-tighter text-white mb-4 italic underline decoration-blue-500/30 text-shadow">Memory Bank</h2>
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
          Browse and search through the agent&apos;s stored knowledge and context files.
        </p>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search memories..."
          className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-slate-600 text-sm">Loading memories...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((memory) => (
            <div key={memory.id} className="bg-[#090909] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[11px] font-bold text-blue-400 tracking-tight">{memory.file_path}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Clock className="w-3 h-3" />
                  {new Date(memory.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3 group-hover:text-slate-300 transition-colors">
                {memory.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
