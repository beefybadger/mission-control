'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HardDrive, FileText, ChevronRight } from 'lucide-react';
import type { Memory } from '@/types';

export default function ExplorerPage() {
  const [files, setFiles] = useState<Memory[]>([]);
  const [selected, setSelected] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('file_path', { ascending: true });

      if (!error && data) setFiles(data as Memory[]);
      setLoading(false);
    }

    loadFiles();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-black tracking-tight text-white mb-3">File Explorer</h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          Navigate through the agent&apos;s knowledge files and memory store.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-auto lg:h-[500px]">
        {/* File List */}
        <div className="w-full lg:w-80 flex-shrink-0 pixel-card overflow-y-auto max-h-64 lg:max-h-none">
          {loading ? (
            <div className="p-6 text-sm text-slate-600">Loading...</div>
          ) : (
            files.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelected(file)}
                className={`w-full text-left p-4 border-b border-white/[0.03] flex items-center gap-3 transition-all hover:bg-white/[0.03] ${selected?.id === file.id ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
                  }`}
              >
                <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="text-[12px] font-medium text-slate-300 truncate">{file.file_path}</span>
                <ChevronRight className="w-3 h-3 text-slate-600 ml-auto flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 pixel-card overflow-y-auto p-4 md:p-6 min-h-[320px]">
          {selected ? (
            <>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <HardDrive className="w-4 h-4 text-blue-500" />
                <span className="text-[12px] font-bold text-blue-400">{selected.file_path}</span>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {selected.content}
              </pre>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <HardDrive className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Select a file to view contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

