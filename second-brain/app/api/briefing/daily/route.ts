import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { CHECKPOINT_DATE, topRevenueActions, rankOpportunities, deriveOpportunitiesFromSchema } from '@/lib/revenue';
import type { DailyBriefing, MarketScout, RevenueBridge, TechnicalPain } from '@/types';

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) return true;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${apiKey}`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [tasksRes, painsRes, bridgesRes, scoutRes, logsRes] = await Promise.all([
    supabaseServer.from('tasks').select('*').order('created_at', { ascending: false }).limit(200),
    supabaseServer.from('technical_pains').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseServer.from('revenue_bridges').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseServer.from('market_scout').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseServer.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  if (tasksRes.error || painsRes.error || bridgesRes.error || scoutRes.error || logsRes.error) {
    return NextResponse.json({ error: 'Failed to build briefing' }, { status: 500 });
  }

  const tasks = tasksRes.data ?? [];
  const logs = logsRes.data ?? [];

  const sum = (action: string) =>
    logs
      .filter((log) => log.action === action && log.status === 'success')
      .reduce((acc, log) => acc + Number((log.metadata as { value?: number } | null)?.value ?? 1), 0);

  const opportunities = rankOpportunities(
    deriveOpportunitiesFromSchema(
      (painsRes.data ?? []) as TechnicalPain[],
      (bridgesRes.data ?? []) as RevenueBridge[],
      (scoutRes.data ?? []) as MarketScout[]
    )
  );

  const staleTasks = tasks
    .filter((task) => task.status !== 'completed')
    .filter((task) => {
      const age = Date.now() - new Date(task.created_at).getTime();
      return age > 1000 * 60 * 60 * 24 * 3;
    })
    .slice(0, 5)
    .map((task) => task.title);

  const diffMs = new Date(CHECKPOINT_DATE).getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const briefing: DailyBriefing = {
    date: todayIsoDate(),
    summary: 'Revenue operations check: focus on top opportunities, clear stale follow-ups, and close one conversion loop today.',
    metrics: {
      leadsGenerated: sum('metric.lead'),
      offersSent: sum('metric.offer'),
      conversationsActive: sum('metric.conversation'),
      cashClosed: sum('metric.cash'),
      daysRemaining,
    },
    topActions: topRevenueActions(opportunities, 3),
    staleTasks,
  };

  return NextResponse.json(briefing);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { content?: string } | null;

  if (!body?.content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 });
  }

  const { error } = await supabaseServer.from('briefings').insert([
    {
      date: todayIsoDate(),
      content: body.content,
      type: 'ops',
    },
  ]);

  if (error) {
    return NextResponse.json({ error: 'Failed to store briefing' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
