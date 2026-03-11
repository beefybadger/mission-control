import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
import { supabaseServer } from '@/lib/supabaseServer';

const exec = promisify(execCb);

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) return true;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${apiKey}`;
}

async function checkSupabase() {
  const { error } = await supabaseServer.from('tasks').select('id').limit(1);
  return !error;
}

async function checkOpenClawAgent() {
  try {
    await exec('openclaw status');
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [supabaseOk, agentOk] = await Promise.all([checkSupabase(), checkOpenClawAgent()]);

  return NextResponse.json({
    supabase: supabaseOk ? 'connected' : 'disconnected',
    openclawAgent: agentOk ? 'connected' : 'pending',
  });
}
