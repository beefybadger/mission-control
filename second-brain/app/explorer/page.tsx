'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { File, Folder, HardDrive, RefreshCw, ChevronRight, X, Save } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function FileExplorer() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoading(true);
    const { data } = await supabase
      .from('memories')
      .select('file_path, content, updated_at')
      .order('file_path');
    if (data) setFiles(data);
    setLoading(false);
  }

  const openFile = (file: any) => {
    setSelectedFile(file);
    setFileContent(file.content);
  };

  const saveFile = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('memories')
      .update({ content: fileContent, updated_at: new Date() })
      .eq('file_path', selectedFile.file_path);
    
    if (!error) {
      setFiles(files.map(f => f.file_path === selectedFile.file_path ? { ...f, content: fileContent } : f));
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      <header className="mb-8">
        <h2 className="text-4xl font-black tracking-tighter text-white italic">VPS Explorer & Editor</h2>
        <p className="text-slate-400 text-sm mt-2">Browse and edit your OpenClaw workspace files directly.</p>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* File List */}
        <div className="w-80 bg-[#090909] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <HardDrive size={12} className="text-blue-500" /> Workspace
            </span>
            <button onClick={fetchFiles} className="text-slate-500 hover:text-white transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {files.map((file, i) => (
              <button 
                key={i} 
                onClick={() => openFile(file)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedFile?.file_path === file.file_path ? 'bg-blue-600/10 border border-blue-500/20 text-white' : 'hover:bg-white/5 text-slate-400 border border-transparent'}`}
              >
                <File size={16} className={selectedFile?.file_path === file.file_path ? 'text-blue-400' : 'text-slate-600'} />
                <span className="text-xs font-medium truncate">{file.file_path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-[#090909] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
          {selectedFile ? (
            <>
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <File size={14} className="text-blue-400" />
                  <span className="text-xs font-bold text-slate-200">{selectedFile.file_path}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={saveFile} 
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setSelectedFile(null)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <textarea 
                className="flex-1 bg-transparent p-6 text-sm font-mono text-slate-300 focus:outline-none resize-none leading-relaxed"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                spellCheck={false}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <File size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Select a file to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
