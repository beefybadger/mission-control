'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Send, X, User, Brain } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChatModal({ member, isOpen, onClose }: { member: any, isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // For now, we simulate the "Live" feel by fetching recent memories related to the council
      fetchMessages();
      const subscription = supabase
        .channel('public:memories')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, () => {
          fetchMessages();
        })
        .subscribe();
      
      return () => { supabase.removeChannel(subscription); };
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setMessages(data.reverse());
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMsg = input;
    setInput('');

    // Logic: In a real NextJS app, this hits an API route that calls OpenClaw tools.
    // For now, we push to Supabase to trigger the "Real-time" update
    const { error } = await supabase.from('memories').insert([{
      file_path: `chat/${member.id}`,
      content: `[User to ${member.name}]: ${userMsg}`
    }]);

    if (error) console.error(error);
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-2xl h-[600px] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${member.color}-500/10 border border-${member.color}-500/20`}>
              <Brain className={`w-5 h-5 text-${member.color}-500`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none mb-1">{member.name}</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Connection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((m, i) => {
            const isUser = m.content.includes('[User to');
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                    : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
                }`}>
                  {m.content.replace(/\[.*?\]: /, '')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-6 border-t border-white/5 bg-black/20">
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Message ${member.name}...`}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50"
              disabled={loading}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
