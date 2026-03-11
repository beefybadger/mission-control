import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { CHECKPOINT_DATE } from '@/lib/revenue';

type MetricType = 'lead' | 'offer' | 'conversation' | 'cash';

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) return true;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${apiKey}`;
}

function metricAction(metric: MetricType) {
  return `metric.${metric}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseServer
    .from('agent_logs')
    .select('*')
    .gte('created_at', start.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }

  const rows = data ?? [];

  const sumMetric = (metric: MetricType) =>
    rows
      .filter((row) => row.action === metricAction(metric) && row.status === 'success')
      .reduce((acc, row) => {
        const value = Number((row.metadata as { value?: number } | null)?.value ?? 1);
        return acc + (Number.isFinite(value) ? value : 1);
      }, 0);

  const checkpoint = new Date(CHECKPOINT_DATE);
  const diffMs = checkpoint.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return NextResponse.json({
    leadsGenerated: sumMetric('lead'),
    offersSent: sumMetric('offer'),
    conversationsActive: sumMetric('conversation'),
    cashClosed: sumMetric('cash'),
    daysRemaining,
    periodStart: start.toISOString(),
    periodEnd: now.toISOString(),
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { metricType?: MetricType; value?: number }
    | null;

  const metricType = body?.metricType;
  const value = Number(body?.value ?? 1);

  if (!metricType || !['lead', 'offer', 'conversation', 'cash'].includes(metricType)) {
    return NextResponse.json({ error: 'Invalid metricType' }, { status: 400 });
  }

  const { error } = await supabaseServer.from('agent_logs').insert([
    {
      agent_name: 'baron-os',
      action: metricAction(metricType),
      status: 'success',
      metadata: {
        value: Number.isFinite(value) ? value : 1,
        source: 'scoreboard',
      },
    },
  ]);

  if (error) {
    return NextResponse.json({ error: 'Failed to track metric' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
