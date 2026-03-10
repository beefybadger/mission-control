'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getMemories, getTasks } from './actions';
import { DollarSign, Target, MessageSquare, Handshake, Radar, ArrowRight, Timer, AlertTriangle } from 'lucide-react';
import type { Memory, Opportunity, Task, MarketScout, RevenueBridge, TechnicalPain } from '@/types';
import { buildFreedomMetrics, deriveOpportunitiesFromSchema, opportunitySeed, rankOpportunities, scoreOpportunity, topRevenueActions } from '@/lib/revenue';
import { supabase } from '@/lib/supabase';

export default function MissionControlDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(opportunitySeed);
  const [loading, setLoading] = useState(true);
  const [snapshotNow] = useState(() => Date.now());

  useEffect(() => {
    async function init() {
      const [t, m, painsRes, bridgesRes, scoutRes] = await Promise.all([
        getTasks(),
        getMemories(),
        supabase.from('technical_pains').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('revenue_bridges').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('market_scout').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      setTasks(t);
      setMemories(m);

      const pains = (painsRes.data ?? []) as TechnicalPain[];
      const bridges = (bridgesRes.data ?? []) as RevenueBridge[];
      const scout = (scoutRes.data ?? []) as MarketScout[];
      setOpportunities(deriveOpportunitiesFromSchema(pains, bridges, scout));

      setLoading(false);
    }
    init();
  }, []);

  const rankedOpportunities = useMemo(() => rankOpportunities(opportunities), [opportunities]);
  const freedom = useMemo(() => buildFreedomMetrics(tasks, memories), [tasks, memories]);
  const actionList = useMemo(() => topRevenueActions(rankedOpportunities, 3), [rankedOpportunities]);

  const staleDeals = useMemo(() => tasks.filter((task) => {
    const ageDays = Math.floor((snapshotNow - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24));
    return task.status !== 'completed' && ageDays >= 3;
  }), [tasks, snapshotNow]);

  const loopStages = [
    { name: 'Memory Insight', count: memories.length, href: '/memory' },
    { name: 'Opportunity', count: rankedOpportunities.length, href: '/opportunities' },
    { name: 'Offer', count: tasks.filter((t) => /offer|proposal|script/i.test(t.title)).length, href: '/offers' },
    { name: 'Task', count: tasks.length, href: '/tasks' },
    { name: 'Outcome', count: memories.filter((m) => /closed|won|paid|cash/i.test(m.content)).length, href: '/memory' },
    { name: 'Memory Update', count: memories.filter((m) => /lesson|insight|update/i.test(m.content)).length, href: '/memory' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight mb-3">Freedom Scoreboard</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Mission-critical control loop focused on income replacement: Memory Insight to Opportunity to Offer to Task to Outcome to Memory Update.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        <MetricCard label="Leads Generated" value={freedom.leadsGenerated} icon={<Target className="w-4 h-4 text-blue-400" />} />
        <MetricCard label="Offers Sent" value={freedom.offersSent} icon={<Handshake className="w-4 h-4 text-purple-400" />} />
        <MetricCard label="Conversations Active" value={freedom.conversationsActive} icon={<MessageSquare className="w-4 h-4 text-amber-400" />} />
        <MetricCard label="Cash Closed" value={freedom.cashClosed} icon={<DollarSign className="w-4 h-4 text-emerald-400" />} />
        <MetricCard label="Days to Checkpoint" value={freedom.daysRemaining} icon={<Timer className="w-4 h-4 text-rose-400" />} emphasis />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <section className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Top 3 Revenue Actions</h2>
            <Link href="/opportunities" className="text-xs text-blue-400 hover:text-blue-300">Open Opportunity Radar</Link>
          </div>
          <ul className="space-y-3">
            {actionList.map((action, idx) => (
              <li key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 flex items-start gap-3">
                <span className="text-[10px] font-bold text-blue-400 mt-1">0{idx + 1}</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-500 mt-4">
            Automation target: run this list every morning via cron + end-of-day conversion review.
          </p>
        </section>

        <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Stale Deal Alerts</h2>
          {staleDeals.length === 0 ? (
            <p className="text-sm text-slate-500">No stale deals detected.</p>
          ) : (
            <div className="space-y-3">
              {staleDeals.slice(0, 4).map((deal) => (
                <div key={deal.id} className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-200">{deal.title}</p>
                    <p className="text-[11px] text-amber-300/70">Needs follow-up before it goes cold.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 mb-10">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Mission-Critical Control Loop</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {loopStages.map((stage, idx) => (
            <Link key={stage.name} href={stage.href} className="group">
              <div className="bg-white/[0.02] border border-white/5 group-hover:border-blue-500/30 rounded-xl p-4 min-h-[108px] flex flex-col justify-between transition-all">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Step {idx + 1}</span>
                <h3 className="text-sm font-semibold text-slate-200">{stage.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-black text-white">{stage.count}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Opportunity Radar Snapshot</h2>
          <Radar className="w-4 h-4 text-emerald-400" />
        </div>

        {loading ? (
          <div className="text-sm text-slate-600 animate-pulse">Loading pipeline data...</div>
        ) : (
          <div className="space-y-3">
            {rankedOpportunities.slice(0, 3).map((opp: Opportunity) => (
              <div key={opp.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{opp.title}</p>
                  <p className="text-[11px] text-slate-500">{opp.source}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-400 font-bold">Score {scoreOpportunity(opp).toFixed(1)}</p>
                  <p className="text-[11px] text-slate-500">ETA cash: {opp.timeToCash}d</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon, emphasis = false }: { label: string; value: number; icon: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className={`bg-[#0a0a0a] border rounded-2xl p-4 ${emphasis ? 'border-rose-500/20' : 'border-white/5'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}
