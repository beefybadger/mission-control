'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, CheckCircle2, Circle, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

export default function TaskForce() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    async function loadTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setTasks(data as Task[]);
      setLoading(false);
    }

    loadTasks();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: newTask, status: 'pending' as const, priority: 'medium' as const }])
      .select();

    if (!error && data) {
      setTasks([data[0] as Task, ...tasks]);
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
      setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Task Force</h1>
          <p className="text-sm text-slate-400 mt-1">Practical execution queue for daily revenue actions.</p>
        </div>

        <div className="wire-soft p-1 flex items-center gap-1">
          <FilterButton active={filter === 'all'} label="All" onClick={() => setFilter('all')} count={tasks.length} />
          <FilterButton active={filter === 'active'} label="Active" onClick={() => setFilter('active')} count={tasks.filter((t) => t.status === 'pending').length} />
          <FilterButton active={filter === 'completed'} label="Done" onClick={() => setFilter('completed')} count={tasks.filter((t) => t.status === 'completed').length} />
        </div>
      </header>

      <form onSubmit={addTask} className="wire-panel p-2 mb-8 flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg border-2 border-black bg-yellow-300 flex items-center justify-center">
          <Plus className="w-4 h-4 text-black" />
        </div>
        <input
          type="text"
          placeholder="Add objective to backlog..."
          className="flex-1 bg-transparent border-none px-2 py-2 text-[14px] text-black focus:outline-none placeholder:text-zinc-500"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button type="submit" className="pixel-btn px-4 py-2 text-sm">Add</button>
      </form>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 w-full pixel-card-light animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="wire-panel flex flex-col items-center justify-center py-20 text-zinc-600">
          <Inbox className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-semibold">No tasks in this filter.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'pixel-card-light flex items-center gap-4 p-4 transition-all',
                  task.status === 'completed' && 'opacity-60'
                )}
              >
                <button onClick={() => toggleTask(task.id, task.status)}>
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-500" />
                  )}
                </button>

                <div className="flex-1">
                  <p className={cn('text-sm font-semibold', task.status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-900')}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-zinc-500">Added {new Date(task.created_at).toLocaleDateString()}</p>
                </div>

                <span className={cn(
                  'px-2 py-1 rounded-md text-[10px] border-2 font-bold uppercase',
                  task.priority === 'high' ? 'text-rose-700 border-rose-600 bg-rose-100' : 'text-zinc-700 border-zinc-700 bg-zinc-100'
                )}>
                  {task.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

function FilterButton({ active, label, onClick, count }: { active: boolean; label: string; onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-md text-[11px] font-bold border-2 flex items-center gap-1.5',
        active ? 'bg-yellow-300 text-black border-black' : 'bg-white text-black border-black'
      )}
    >
      {label}
      <span className="text-[9px]">{count}</span>
    </button>
  );
}
