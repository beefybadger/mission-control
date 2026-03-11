import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) return true;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${apiKey}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? 'all';
  const since = url.searchParams.get('since');
  const limit = Math.min(500, Number(url.searchParams.get('limit') ?? 120));

  let query = supabaseServer
    .from('agent_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (since) {
    query = query.gte('created_at', since);
  }

  if (type === 'metrics') {
    query = query.like('action', 'metric.%');
  } else if (type === 'pipeline') {
    query = query.like('action', 'pipeline.%');
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch ops logs' }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}
