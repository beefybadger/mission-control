'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, CheckCircle2, Circle, Search, Filter, MoreHorizontal, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TaskForce() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setTasks(data);
    setLoading(false);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: newTask, status: 'pending', priority: 'medium' }])
      .select();

    if (!error && data) {
      setTasks([data[0], ...tasks]);
      setNewTask('');
    }
  }

  async function toggleTask(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Deployment</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Task Force</h1>
          <p className="text-[13px] text-slate-500 font-medium">Directives and execution tracking for the current mission.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-lg border border-white/5">
          <FilterButton active={filter === 'all'} label="All" onClick={() => setFilter('all')} count={tasks.length} />
          <FilterButton active={filter === 'active'} label="Active" onClick={() => setFilter('active')} count={tasks.filter(t => t.status === 'pending').length} />
          <FilterButton active={filter === 'completed'} label="Done" onClick={() => setFilter('completed')} count={tasks.filter(t => t.status === 'completed').length} />
        </div>
      </header>

      <form onSubmit={addTask} className="relative mb-10 group">
        <div className="absolute inset-0 bg-blue-600/5 blur-xl group-focus-within:bg-blue-600/10 transition-all rounded-2xl" />
        <div className="relative flex items-center bg-[#0c0c0c] border border-white/10 group-focus-within:border-blue-500/30 rounded-xl transition-all shadow-lg overflow-hidden">
          <div className="pl-5 text-slate-500 group-focus-within:text-blue-500 transition-colors">
            <Plus size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Add objective to backlog..."
            className="flex-1 bg-transparent border-none py-5 px-4 text-[15px] text-white focus:outline-none placeholder:text-slate-600"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <div className="pr-4">
             <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.05] border border-white/5 text-[10px] font-bold text-slate-500">
                RETURN
             </div>
          </div>
        </div>
      </form>

      <div className="flex-1 space-y-1">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-slate-600">
            <Layout className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No missions matching current criteria.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key={task.id} 
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                  task.status === 'completed' 
                    ? 'bg-transparent border-transparent opacity-40 hover:opacity-60' 
                    : 'bg-[#0c0c0c] border-white/5 hover:border-white/10 hover:bg-[#111]'
                )}
              >
                <button 
                  onClick={() => toggleTask(task.id, task.status)}
                  className="relative flex items-center justify-center"
                >
                  {task.status === 'completed' ? (
                    <div className="bg-emerald-500/20 rounded-full p-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className={cn(
                    "text-[14px] font-medium transition-all",
                    task.status === 'completed' ? 'line-through text-slate-600' : 'text-slate-200'
                  )}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Added {new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className={cn(
                     "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                     task.priority === 'high' ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-slate-800 text-slate-500"
                   )}>
                     {task.priority}
                   </div>
                   <button className="text-slate-700 hover:text-white transition-colors">
                     <MoreHorizontal size={16} />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function FilterButton({ active, label, onClick, count }: { active: boolean, label: string, onClick: () => void, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all",
        active 
          ? "bg-white/[0.05] text-white shadow-sm" 
          : "text-slate-500 hover:text-slate-300"
      )}
    >
      {label}
      <span className={cn(
        "px-1.5 py-0.5 rounded-full text-[9px] transition-colors",
        active ? "bg-blue-500/20 text-blue-400" : "bg-white/[0.03] text-slate-600"
      )}>
        {count}
      </span>
    </button>
  )
}
