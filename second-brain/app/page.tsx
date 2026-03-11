'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getMemories, getTasks } from './actions';
import { DollarSign, Target, MessageSquare, Handshake, Radar, ArrowRight, Timer, AlertTriangle, RefreshCw } from 'lucide-react';
import type {
  DailyBriefing,
  FreedomMetricsResponse,
  MarketScout,
  Memory,
  Opportunity,
  RevenueBridge,
  Task,
  TechnicalPain,
} from '@/types';
import { deriveOpportunitiesFromSchema, opportunitySeed, rankOpportunities, scoreOpportunity, topRevenueActions } from '@/lib/revenue';
import { supabase } from '@/lib/supabase';

const EMPTY_METRICS: FreedomMetricsResponse = {
  leadsGenerated: 0,
  offersSent: 0,
  conversationsActive: 0,
  cashClosed: 0,
  daysRemaining: 0,
  periodStart: '',
  periodEnd: '',
};

export default function MissionControlDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(opportunitySeed);
  const [freedom, setFreedom] = useState<FreedomMetricsResponse>(EMPTY_METRICS);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapshotNow] = useState(() => Date.now());
  const [tracking, setTracking] = useState<string>('');
  const [briefingNotice, setBriefingNotice] = useState('');

  async function fetchFreedomMetrics() {
    const res = await fetch('/api/freedom/metrics');
    const data = await res.json();
    if (res.ok) setFreedom(data as FreedomMetricsResponse);
  }

  async function fetchBriefing() {
    const res = await fetch('/api/briefing/daily');
    const data = await res.json();
    if (res.ok) setBriefing(data as DailyBriefing);
  }

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

      await Promise.all([fetchFreedomMetrics(), fetchBriefing()]);
      setLoading(false);
    }
    init();
  }, []);

  const rankedOpportunities = useMemo(() => rankOpportunities(opportunities), [opportunities]);
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
    { name: 'Outcome', count: freedom.cashClosed, href: '/briefs' },
    { name: 'Memory Update', count: memories.filter((m) => /lesson|insight|update/i.test(m.content)).length, href: '/memory' },
  ];

  async function trackMetric(metricType: 'lead' | 'offer' | 'conversation' | 'cash') {
    setTracking(metricType);
    await fetch('/api/freedom/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metricType, value: 1 }),
    });
    await fetchFreedomMetrics();
    setTracking('');
  }

  async function saveBriefing() {
    if (!briefing) return;

    const content = [
      `Ops Briefing ${briefing.date}`,
      `Summary: ${briefing.summary}`,
      `Metrics: leads=${briefing.metrics.leadsGenerated}, offers=${briefing.metrics.offersSent}, conversations=${briefing.metrics.conversationsActive}, cash=${briefing.metrics.cashClosed}, daysRemaining=${briefing.metrics.daysRemaining}`,
      `Top actions:\n- ${briefing.topActions.join('\n- ')}`,
      `Stale tasks:\n- ${briefing.staleTasks.join('\n- ') || 'None'}`,
    ].join('\n\n');

    const res = await fetch('/api/briefing/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    setBriefingNotice(res.ok ? 'Briefing saved to database.' : 'Failed to save briefing.');
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight mb-3">Freedom Scoreboard</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Mission-critical control loop focused on income replacement: Memory Insight to Opportunity to Offer to Task to Outcome to Memory Update.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <MetricCard label="Leads Generated" value={freedom.leadsGenerated} icon={<Target className="w-4 h-4 text-blue-400" />} />
        <MetricCard label="Offers Sent" value={freedom.offersSent} icon={<Handshake className="w-4 h-4 text-purple-400" />} />
        <MetricCard label="Conversations Active" value={freedom.conversationsActive} icon={<MessageSquare className="w-4 h-4 text-amber-400" />} />
        <MetricCard label="Cash Closed" value={freedom.cashClosed} icon={<DollarSign className="w-4 h-4 text-emerald-400" />} />
        <MetricCard label="Days to Checkpoint" value={freedom.daysRemaining} icon={<Timer className="w-4 h-4 text-rose-400" />} emphasis />
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <ScoreAction label="+ Lead" busy={tracking === 'lead'} onClick={() => trackMetric('lead')} />
        <ScoreAction label="+ Offer" busy={tracking === 'offer'} onClick={() => trackMetric('offer')} />
        <ScoreAction label="+ Conversation" busy={tracking === 'conversation'} onClick={() => trackMetric('conversation')} />
        <ScoreAction label="+ Cash Close" busy={tracking === 'cash'} onClick={() => trackMetric('cash')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <section className="lg:col-span-2 pixel-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Top 3 Revenue Actions</h2>
            <Link href="/opportunities" className="text-xs text-blue-400 hover:text-blue-300">Open Opportunity Radar</Link>
          </div>
          <ul className="space-y-3">
            {actionList.map((action, idx) => (
              <li key={idx} className="pixel-card-light px-4 py-3 text-sm text-zinc-800 flex items-start gap-3">
                <span className="text-[10px] font-bold text-blue-400 mt-1">0{idx + 1}</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-500 mt-4">
            Automation target: run this list every morning via cron + end-of-day conversion review.
          </p>
        </section>

        <section className="pixel-card p-6">
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

      <section className="pixel-card p-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Operational Briefing</h2>
          <button onClick={fetchBriefing} className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loading || !briefing ? (
          <p className="text-sm text-slate-500">Generating briefing...</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-200">{briefing.summary}</p>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">Top Actions</p>
              <ul className="space-y-1 text-sm text-slate-300">
                {briefing.topActions.map((action, idx) => <li key={idx}>- {action}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">Stale Tasks</p>
              <ul className="space-y-1 text-sm text-slate-300">
                {(briefing.staleTasks.length > 0 ? briefing.staleTasks : ['None']).map((task, idx) => <li key={idx}>- {task}</li>)}
              </ul>
            </div>
            <button onClick={saveBriefing} className="pixel-btn px-3 py-2 text-sm">
              Save Briefing Snapshot
            </button>
            {briefingNotice && <p className="text-xs text-blue-300">{briefingNotice}</p>}
          </div>
        )}
      </section>

      <section className="pixel-card p-6 mb-10">
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

      <section className="pixel-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Opportunity Radar Snapshot</h2>
          <Radar className="w-4 h-4 text-emerald-400" />
        </div>

        {loading ? (
          <div className="text-sm text-slate-600 animate-pulse">Loading pipeline data...</div>
        ) : (
          <div className="space-y-3">
            {rankedOpportunities.slice(0, 3).map((opp: Opportunity) => (
              <div key={opp.id} className="pixel-card-light p-4 flex items-center justify-between gap-4">
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
    <div className={`pixel-card p-4 ${emphasis ? 'ring-2 ring-rose-500/40' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function ScoreAction({ label, onClick, busy }: { label: string; onClick: () => void; busy: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="pixel-btn px-3 py-1.5 disabled:opacity-50 text-xs"
    >
      {busy ? 'Saving...' : label}
    </button>
  );
}

