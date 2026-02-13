'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, FileText, Calendar, ArrowRight, Brain, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MemoryVault() {
  const [memories, setMemories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error) setMemories(data);
    setLoading(false);
  }

  const filteredMemories = memories.filter(m => 
    m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.file_path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto flex flex-col min-h-full">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Archival</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Memory Vault</h1>
        <p className="text-[13px] text-slate-500 font-medium max-w-lg">Access and search all project logs and core decisions stored within the second brain.</p>
      </header>

      {/* Modern Search */}
      <div className="relative mb-12 group">
        <div className="absolute inset-0 bg-blue-600/[0.02] blur-xl group-focus-within:bg-blue-600/[0.05] transition-all" />
        <div className="relative flex items-center bg-[#0c0c0c] border border-white/5 group-focus-within:border-white/10 rounded-xl transition-all shadow-lg">
          <Search className="absolute left-4 text-slate-600 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search through your 2nd brain..."
            className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-[14px] text-white focus:outline-none placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 w-full bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMemories.map((memory, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={memory.id} 
                className="group bg-[#0c0c0c] border border-white/5 rounded-xl p-6 hover:border-white/10 hover:bg-[#111] transition-all cursor-pointer shadow-sm relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-lg group-hover:border-blue-500/30 transition-colors">
                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] mb-1">{memory.file_path}</h4>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold">
                              <Calendar size={12} />
                              {new Date(memory.updated_at).toLocaleDateString()}
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-600 text-[10px] font-bold">
                              <Clock size={12} />
                              {new Date(memory.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-slate-500 text-[13px] line-clamp-2 leading-relaxed font-medium group-hover:text-slate-400 transition-colors italic">
                    "{memory.content}"
                  </p>
                </div>
                
                {/* Subtle background glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
