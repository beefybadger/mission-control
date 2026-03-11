import { NextResponse } from 'next/server';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
import { supabaseServer } from '@/lib/supabaseServer';

const exec = promisify(execCb);

type MemberStatus = 'working' | 'idle' | 'offline';

type MemberState = {
  id: string;
  status: MemberStatus;
  lastActiveAt: string | null;
  room: 'baron-office' | 'cubicles' | 'relax-room';
};

const MEMBER_IDS = ['baron', 'scotty', 'maurice', 'hacker', 'oracle', 'sentinel'] as const;

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) return true;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${apiKey}`;
}

async function checkOpenClaw() {
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

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [logsRes, openclawUp] = await Promise.all([
    supabaseServer
      .from('agent_logs')
      .select('created_at,agent_name,action,status')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(300),
    checkOpenClaw(),
  ]);

  const logs = logsRes.data ?? [];

  const mostRecent = (agentNames: string[]) => {
    const row = logs.find((log) => agentNames.includes((log.agent_name ?? '').toLowerCase()));
    return row?.created_at ?? null;
  };

  const now = Date.now();
  const isWorking = (iso: string | null) => {
    if (!iso) return false;
    const ageMin = (now - new Date(iso).getTime()) / 60000;
    return ageMin <= 20;
  };

  const states: MemberState[] = MEMBER_IDS.map((id) => {
    const aliases: Record<string, string[]> = {
      baron: ['baron-os', 'baron'],
      scotty: ['scotty'],
      maurice: ['maurice'],
      hacker: ['hacker'],
      oracle: ['oracle'],
      sentinel: ['sentinel'],
    };

    const last = mostRecent(aliases[id]);

    let status: MemberStatus = 'idle';
    if (id === 'baron' && !openclawUp) {
      status = 'offline';
    } else if (isWorking(last)) {
      status = 'working';
    }

    const room = id === 'baron'
      ? 'baron-office'
      : status === 'working'
        ? 'cubicles'
        : 'relax-room';

    return {
      id,
      status,
      lastActiveAt: last,
      room,
    };
  });

  return NextResponse.json({ states, updatedAt: new Date().toISOString() });
}
