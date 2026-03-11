'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileStack, Copy, MessageSquareQuote, Sparkles } from 'lucide-react';
import type { Memory, OfferTemplate, RevenueBridge, TechnicalPain } from '@/types';
import { getMemoryPainSignals, offerTemplates } from '@/lib/revenue';

const starter = offerTemplates[0];

export default function OfferSprintPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [template, setTemplate] = useState<OfferTemplate>(starter);
  const [dynamicTemplates, setDynamicTemplates] = useState<OfferTemplate[]>(offerTemplates);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const [memRes, bridgeRes, painRes] = await Promise.all([
        supabase.from('memories').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('revenue_bridges').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('technical_pains').select('*').order('created_at', { ascending: false }).limit(30),
      ]);

      const memRows = (memRes.data as Memory[]) ?? [];
      setMemories(memRows);

      const bridges = (bridgeRes.data as RevenueBridge[]) ?? [];
      const pains = (painRes.data as TechnicalPain[]) ?? [];

      const mapped = bridges.slice(0, 5).map((bridge) => {
        const linkedPain = pains.find((pain) => pain.id === bridge.pain_id);
        return {
          id: `bridge-${bridge.id}`,
          title: linkedPain?.title ?? bridge.bridge_type ?? 'Bridge Offer',
          icp: linkedPain?.target_audience ?? 'Qualified buyer with active operational pain.',
          painToOutcome: linkedPain?.description ?? 'Convert a recurring pain into a practical paid outcome.',
          offerStack: [bridge.asset_copy ?? 'Bridge asset copy', 'Quick implementation walkthrough', 'Follow-up execution support'],
          riskReversal: 'If no practical next step is identified, no charge.',
          cta: 'Reply to activate this sprint today.',
          closeScript: 'You already have the pain signal. This sprint converts it into a paid, executable offer this week.',
        } satisfies OfferTemplate;
      });

      const merged = [...mapped, ...offerTemplates];
      setDynamicTemplates(merged);
      setTemplate(merged[0] ?? starter);
    }
    load();
  }, []);

  const painSignals = useMemo(() => getMemoryPainSignals(memories), [memories]);

  async function saveOfferToTasks() {
    const title = `[Offer Sprint] ${template.title} — Ship outreach + close script`;

    await Promise.all([
      supabase.from('tasks').insert([{ title, status: 'pending', priority: 'high' }]),
      supabase.from('revenue_bridges').insert([
        {
          bridge_type: 'offer_sprint',
          asset_copy: `${template.painToOutcome}\n\nCTA: ${template.cta}\nClose: ${template.closeScript}`,
          status: 'draft',
        },
      ]),
    ]);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Maurice Layer</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Offer Sprint + Conversion Workspace</h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Build and ship one-page offers fast: ICP snapshot, pain-to-outcome promise, stack, risk reversal, CTA, and close script.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 pixel-card p-6 space-y-5">
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-widest">Offer Template</label>
            <select
              value={template.id}
              onChange={(e) => setTemplate(dynamicTemplates.find((t) => t.id === e.target.value) ?? starter)}
              className="mt-2 w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              {dynamicTemplates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          <Field label="ICP Snapshot" value={template.icp} onChange={(value) => setTemplate({ ...template, icp: value })} />
          <Field label="Pain to Outcome Promise" value={template.painToOutcome} onChange={(value) => setTemplate({ ...template, painToOutcome: value })} multiline />

          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-widest">Offer Stack</label>
            <textarea
              value={template.offerStack.join('\n')}
              onChange={(e) => setTemplate({ ...template, offerStack: e.target.value.split('\n').filter(Boolean) })}
              className="mt-2 w-full h-28 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <Field label="Risk Reversal" value={template.riskReversal} onChange={(value) => setTemplate({ ...template, riskReversal: value })} multiline />
          <Field label="CTA" value={template.cta} onChange={(value) => setTemplate({ ...template, cta: value })} />
          <Field label="Close Script" value={template.closeScript} onChange={(value) => setTemplate({ ...template, closeScript: value })} multiline />

          <div className="flex items-center gap-3">
            <button
              onClick={saveOfferToTasks}
              className="pixel-btn px-4 py-2 text-sm"
            >
              Ship to Task Force
            </button>
            {saved && <span className="text-xs text-emerald-400">Saved to tasks and revenue_bridges.</span>}
          </div>
        </section>

        <section className="space-y-6">
          <div className="pixel-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileStack className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">One-page Offer Output</h2>
            </div>
            <OfferOutput template={template} />
          </div>

          <div className="pixel-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareQuote className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Memory Explorer Signals</h2>
            </div>
            {painSignals.length === 0 ? (
              <p className="text-sm text-slate-500">No pain signals detected in recent memory.</p>
            ) : (
              <ul className="space-y-2">
                {painSignals.map((signal, idx) => (
                  <li key={idx} className="text-sm text-zinc-800 pixel-card-light p-3">{signal}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="pixel-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Outreach Script</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Quick note — I reviewed your setup and spotted where time and money are leaking. I can map a practical fix path in one session and leave you with a clear checklist. If that sounds useful, I can send the one-page outline now.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="text-[11px] text-slate-500 uppercase tracking-widest">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full h-24 bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
      )}
    </div>
  );
}

function OfferOutput({ template }: { template: OfferTemplate }) {
  return (
    <div className="text-sm text-slate-300 space-y-3">
      <p><span className="text-slate-500">ICP:</span> {template.icp}</p>
      <p><span className="text-slate-500">Promise:</span> {template.painToOutcome}</p>
      <div>
        <p className="text-slate-500 mb-1">Offer Stack:</p>
        <ul className="list-disc list-inside space-y-1">
          {template.offerStack.map((line, idx) => <li key={idx}>{line}</li>)}
        </ul>
      </div>
      <p><span className="text-slate-500">Risk Reversal:</span> {template.riskReversal}</p>
      <p><span className="text-slate-500">CTA:</span> {template.cta}</p>
      <p><span className="text-slate-500">Close:</span> {template.closeScript}</p>
    </div>
  );
}


