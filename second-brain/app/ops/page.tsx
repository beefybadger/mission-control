'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Download, Filter, RefreshCw } from 'lucide-react';

type AgentLog = {
  id: string;
  created_at: string;
  agent_name: string;
  action: string;
  status: string;
  metadata?: Record<string, unknown> | null;
};

type FilterType = 'all' | 'metrics' | 'pipeline';

function startOfTodayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown) {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export default function OpsPage() {
  const [rows, setRows] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<FilterType>('all');
  const [todayOnly, setTodayOnly] = useState(true);

  async function loadLogs(nextType = type, nextTodayOnly = todayOnly) {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('type', nextType);
    params.set('limit', '200');
    if (nextTodayOnly) params.set('since', startOfTodayIso());

    const res = await fetch(`/api/ops/logs?${params.toString()}`);
    const data = await res.json();
    setRows((data?.rows ?? []) as AgentLog[]);
    setLoading(false);
  }

  useEffect(() => {
    async function initialLoad() {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('type', 'all');
      params.set('limit', '200');
      params.set('since', startOfTodayIso());

      const res = await fetch(`/api/ops/logs?${params.toString()}`);
      const data = await res.json();
      setRows((data?.rows ?? []) as AgentLog[]);
      setLoading(false);
    }

    initialLoad();
  }, []);

  const summary = useMemo(() => {
    const metrics = rows.filter((row) => row.action.startsWith('metric.')).length;
    const pipeline = rows.filter((row) => row.action.startsWith('pipeline.')).length;
    const failed = rows.filter((row) => row.status !== 'success').length;
    return { metrics, pipeline, failed };
  }, [rows]);

  function exportJson() {
    const stamp = new Date().toISOString().replaceAll(':', '-');
    downloadFile(JSON.stringify(rows, null, 2), `ops-logs-${stamp}.json`, 'application/json');
  }

  function exportCsv() {
    const header = ['id', 'created_at', 'agent_name', 'action', 'status', 'metadata'];
    const lines = rows.map((row) => [
      csvEscape(row.id),
      csvEscape(row.created_at),
      csvEscape(row.agent_name),
      csvEscape(row.action),
      csvEscape(row.status),
      csvEscape(row.metadata ? JSON.stringify(row.metadata) : ''),
    ].join(','));

    const csv = [header.join(','), ...lines].join('\n');
    const stamp = new Date().toISOString().replaceAll(':', '-');
    downloadFile(csv, `ops-logs-${stamp}.csv`, 'text/csv;charset=utf-8');
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Execution Audit</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Ops Log Viewer</h1>
        <p className="text-sm text-slate-400">Review metric and pipeline events to verify daily execution quality.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Stat label="Metric Events" value={summary.metrics} />
        <Stat label="Pipeline Events" value={summary.pipeline} />
        <Stat label="Failed Events" value={summary.failed} danger={summary.failed > 0} />
      </section>

      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <FilterButton active={type === 'all'} onClick={() => { setType('all'); loadLogs('all', todayOnly); }} label="All" />
          <FilterButton active={type === 'metrics'} onClick={() => { setType('metrics'); loadLogs('metrics', todayOnly); }} label="Metrics" />
          <FilterButton active={type === 'pipeline'} onClick={() => { setType('pipeline'); loadLogs('pipeline', todayOnly); }} label="Pipeline" />

          <button
            onClick={() => {
              const next = !todayOnly;
              setTodayOnly(next);
              loadLogs(type, next);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${todayOnly ? 'bg-blue-600 text-white' : 'bg-white/[0.04] text-slate-300'}`}
          >
            {todayOnly ? 'Today only' : 'All dates'}
          </button>

          <button onClick={exportJson} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-200 flex items-center gap-1">
            <Download className="w-3 h-3" /> JSON
          </button>

          <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-200 flex items-center gap-1">
            <Download className="w-3 h-3" /> CSV
          </button>

          <button onClick={() => loadLogs()} className="ml-auto px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-200 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </section>

      <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading logs...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">No events found for selected filter.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-200 font-semibold">{row.action}</p>
                    <p className="text-[11px] text-slate-500">{row.agent_name} · {new Date(row.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${row.status === 'success' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-300 border-rose-500/30 bg-rose-500/10'}`}>
                    {row.status}
                  </span>
                </div>
                {row.metadata && (
                  <pre className="mt-2 text-[11px] text-slate-400 whitespace-pre-wrap">{JSON.stringify(row.metadata, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={`bg-[#0a0a0a] border rounded-2xl p-4 ${danger ? 'border-rose-500/20' : 'border-white/5'}`}>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`text-2xl font-black mt-1 ${danger ? 'text-rose-300' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${active ? 'bg-blue-600 text-white' : 'bg-white/[0.04] text-slate-300'}`}
    >
      {label}
    </button>
  );
}
