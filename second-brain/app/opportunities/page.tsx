'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Radar, TrendingUp, Clock3, Coins, Gauge } from 'lucide-react';
import { deriveOpportunitiesFromSchema, opportunitySeed, rankOpportunities, scoreOpportunity } from '@/lib/revenue';
import type { MarketScout, Opportunity, RevenueBridge, TechnicalPain } from '@/types';

export default function OpportunitiesPage() {
  const [creating, setCreating] = useState<string | null>(null);
  const [pipelining, setPipelining] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>(opportunitySeed);

  useEffect(() => {
    async function load() {
      const [painsRes, bridgesRes, scoutRes] = await Promise.all([
        supabase.from('technical_pains').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('revenue_bridges').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('market_scout').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      const pains = (painsRes.data ?? []) as TechnicalPain[];
      const bridges = (bridgesRes.data ?? []) as RevenueBridge[];
      const scout = (scoutRes.data ?? []) as MarketScout[];
      setOpportunities(deriveOpportunitiesFromSchema(pains, bridges, scout));
    }

    load();
  }, []);

  const ranked = useMemo(() => rankOpportunities(opportunities), [opportunities]);

  async function pushToKanban(opp: Opportunity) {
    setCreating(opp.id);
    setNotice('');
    const title = `[Opportunity] ${opp.title} — Next money action: ${opp.nextMoneyAction}`;
    await supabase
      .from('tasks')
      .insert([{ title, status: 'pending', priority: opp.timeToCash <= 2 ? 'high' : 'medium' }]);
    setNotice('Pushed to Task Force.');
    setCreating(null);
  }

  async function moveToOfferPipeline(opp: Opportunity) {
    setPipelining(opp.id);
    setNotice('');

    try {
      const response = await fetch('/api/pipeline/opportunity-to-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opp.id,
          title: opp.title,
          category: opp.category,
          nextMoneyAction: opp.nextMoneyAction,
          proofSignal: opp.proofSignal,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setNotice(payload?.error ?? 'Failed to transition opportunity.');
      } else {
        setNotice('Opportunity moved into Offer Sprint + execution task created.');
      }
    } catch (error) {
      console.error(error);
      setNotice('Failed to transition opportunity.');
    }

    setPipelining(null);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Radar className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scotty Layer</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Revenue Opportunity Radar</h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Live opportunities derived from technical pains, market scout signals, and revenue bridge assets.
        </p>
      </header>

      {notice && <p className="text-xs text-blue-300 mb-4">{notice}</p>}

      <div className="space-y-4">
        {ranked.map((opp) => (
          <div key={opp.id} className="pixel-card p-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{opp.category.replace('-', ' ')}</p>
                <h2 className="text-lg font-bold text-white">{opp.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{opp.source}</p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Radar Score</p>
                <p className="text-2xl font-black text-white">{scoreOpportunity(opp).toFixed(1)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Signal label="Time-to-cash" value={`${opp.timeToCash}d`} icon={<Clock3 className="w-3.5 h-3.5 text-blue-400" />} />
              <Signal label="Est. payout" value={`$${opp.estimatedPayout}`} icon={<Coins className="w-3.5 h-3.5 text-emerald-400" />} />
              <Signal label="Complexity" value={`${opp.complexity}/5`} icon={<Gauge className="w-3.5 h-3.5 text-amber-400" />} />
              <Signal label="Demand proof" value={`${opp.demandProof}/5`} icon={<TrendingUp className="w-3.5 h-3.5 text-purple-400" />} />
            </div>

            <div className="pixel-card-light p-4 mb-4">
              <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">Proof Signal</p>
              <p className="text-sm text-zinc-800">{opp.proofSignal}</p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <div>
                <p className="text-[11px] text-blue-300 uppercase tracking-widest mb-1">Strict Next Money Action</p>
                <p className="text-sm text-blue-100">{opp.nextMoneyAction}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => moveToOfferPipeline(opp)}
                  disabled={pipelining === opp.id}
                  className="pixel-btn px-4 py-2 text-sm"
                >
                  {pipelining === opp.id ? 'Moving...' : 'Move to Offer Sprint'}
                </button>
                <button
                  onClick={() => pushToKanban(opp)}
                  disabled={creating === opp.id}
                  className="pixel-btn px-4 py-2 text-sm"
                >
                  {creating === opp.id ? 'Pushing...' : 'Push to Kanban'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Signal({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="pixel-card-light p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm text-zinc-900 font-semibold">{value}</p>
    </div>
  );
}

