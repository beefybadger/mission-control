'use client';

import { useState, useEffect } from 'react';
import { getMemories, getTasks } from './actions';
import { Plus, MoreHorizontal, TrendingUp, DollarSign, Cpu, Clock } from 'lucide-react';

export default function MissionControlDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const t = await getTasks();
      const m = await getMemories();
      setTasks(t);
      setMemories(m);
      
      try {
        const res = await fetch('/api/usage');
        const u = await res.json();
        setUsage(u);
      } catch (e) { console.error(e); }
      
      setLoading(false);
    }
    init();
  }, []);

  const backlog = tasks.filter(t => t.status === 'pending');
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  
  const recentActivity = memories.slice(0, 5).map(m => ({
    user: 'baron',
    time: 'Recent',
    action: m.content.slice(0, 100) + '...'
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 📊 Intelligence Header: Token & Cost Usage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <UsageCard 
          label="Session Cost" 
          value={`$${usage?.sessionCost || '0.00'}`} 
          sub="Current interaction" 
          icon={<DollarSign className="w-4 h-4 text-emerald-500" />} 
        />
        <UsageCard 
          label="Token Burn" 
          value={usage?.sessionTokens || '0'} 
          sub="Total tokens processed" 
          icon={<Cpu className="w-4 h-4 text-blue-500" />} 
        />
        <UsageCard 
          label="Monthly Est." 
          value={`$${usage?.monthlyEstimated || '0.00'}`} 
          sub="Projected overhead" 
          icon={<TrendingUp className="w-4 h-4 text-purple-500" />} 
        />
        <UsageCard 
          label="Budget" 
          value={usage?.budgetUsed || '0%'} 
          sub="of monthly threshold" 
          icon={<Clock className="w-4 h-4 text-slate-500" />} 
        />
      </div>

      <div className="flex items-center gap-8 mb-12 border-b border-white/5 pb-8">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-500">{backlog.length}</span>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Backlog</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-500">{inProgress.length}</span>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">In progress</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{tasks.length}</span>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Total Ops</span>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 flex gap-6">
          <Column title="Backlog" count={backlog.length}>
            {backlog.map(task => (
              <TaskCard key={task.id} title={task.title} tag="Mission" tagColor="blue" time="Queued" />
            ))}
          </Column>
          <Column title="In Progress" count={inProgress.length}>
            {inProgress.map(task => (
              <TaskCard key={task.id} title={task.title} tag="Active" tagColor="emerald" time="Live" />
            ))}
          </Column>
        </div>

        <div className="w-80 flex-shrink-0">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6 px-2">Live Activity</h3>
          <div className="space-y-6 px-2">
            {recentActivity.map((act, i) => (
              <ActivityItem key={i} user={act.user} time={act.time} action={act.action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageCard({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#090909] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-all">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-white tracking-tighter mb-1">{value}</div>
      <div className="text-[10px] font-medium text-slate-600">{sub}</div>
    </div>
  );
}

function Column({ title, count, children }: { title: string, count: number, children: React.ReactNode }) {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${title === 'Backlog' ? 'bg-slate-500' : 'bg-blue-500'}`} />
          <h3 className="text-xs font-bold text-slate-400">{title}</h3>
          <span className="text-[10px] text-slate-600 font-bold ml-1">{count}</span>
        </div>
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-slate-600 hover:text-white cursor-pointer" />
          <MoreHorizontal className="w-4 h-4 text-slate-600" />
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function TaskCard({ title, tag, tagColor, time }: { title: string, tag: string, tagColor: string, time: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    purple: 'text-purple-500',
  };
  return (
    <div className="bg-[#151515] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all cursor-pointer group">
      <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors leading-snug mb-4">{title}</h4>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <span className={`text-[10px] font-bold uppercase tracking-tight ${colors[tagColor]}`}>{tag}</span>
        </div>
        <span className="text-[10px] font-medium text-slate-700">{time}</span>
      </div>
    </div>
  );
}

function ActivityItem({ user, time, action }: { user: string, time: string, action: string }) {
  return (
    <div className="relative pl-6 pb-6 border-l border-white/5 last:pb-0">
      <div className="absolute left-[-4.5px] top-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-black" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5">
          <span className="w-3 h-3 bg-slate-700 rounded-full" /> {user}
        </span>
        <span className="text-[10px] text-slate-600">{time}</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">{action}</p>
    </div>
  );
}
