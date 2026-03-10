import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type LocalCronJob = {
  jobId?: string;
  id?: string;
  name?: string;
  enabled?: boolean;
  schedule?: { expr?: string; kind?: string };
  sessionTarget?: string;
};

const REVENUE_JOBS = [
  {
    name: 'Baron OS - Daily Top 3 Revenue Actions',
    description: 'Morning reminder to execute the top 3 revenue actions.',
    cron: '0 8 * * *',
    systemEvent:
      'Reminder: Daily Top 3 revenue actions. Focus on cash-first execution today. Choose three actions with the shortest time-to-cash and complete them before noon.',
  },
  {
    name: 'Baron OS - Stale Deal Alert Sweep',
    description: 'Recurring stale-deal follow-up reminder.',
    cron: '0 */6 * * *',
    systemEvent:
      'Reminder: Stale-deal sweep. Review open deals older than 72h, send follow-up messages, and update task statuses so pipeline momentum does not stall.',
  },
  {
    name: 'Baron OS - End of Day Conversion Review',
    description: 'Nightly conversion and memory update checkpoint.',
    cron: '0 21 * * *',
    systemEvent:
      'Reminder: End-of-day conversion review. Log leads, offers sent, active conversations, cash closed, and update memory with one lesson from today.',
  },
] as const;

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) return true;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${apiKey}`;
}

async function run(command: string) {
  const { stdout } = await execAsync(command);
  return stdout;
}

async function listJobs(): Promise<LocalCronJob[]> {
  const raw = await run('openclaw cron list --json');
  const parsed = JSON.parse(raw) as LocalCronJob[] | { jobs?: LocalCronJob[] };
  if (Array.isArray(parsed)) return parsed;
  return parsed.jobs ?? [];
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const jobs = await listJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Cron API error:', error);
    return NextResponse.json({ error: 'Failed to fetch cron jobs', jobs: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    if (action === 'installRevenueOps') {
      const jobs = await listJobs();
      const existingNames = new Set(jobs.map((j) => j.name).filter(Boolean));
      const created: string[] = [];
      const skipped: string[] = [];

      for (const job of REVENUE_JOBS) {
        if (existingNames.has(job.name)) {
          skipped.push(job.name);
          continue;
        }

        const command = [
          'openclaw cron add',
          `--name "${job.name.replaceAll('"', '\\"')}"`,
          `--description "${job.description.replaceAll('"', '\\"')}"`,
          `--cron "${job.cron}"`,
          '--tz "Europe/Bucharest"',
          '--session main',
          `--system-event "${job.systemEvent.replaceAll('"', '\\"')}"`,
          '--json',
        ].join(' ');

        await run(command);
        created.push(job.name);
      }

      const refreshed = await listJobs();
      return NextResponse.json({ ok: true, created, skipped, jobs: refreshed });
    }

    if (action === 'removeRevenueOps') {
      const jobs = await listJobs();
      const targetNames = new Set<string>(REVENUE_JOBS.map((j) => j.name));
      const removed: string[] = [];

      for (const job of jobs) {
        const id = job?.jobId ?? job?.id;
        const name = job?.name;
        if (!id || !name || !targetNames.has(name)) continue;

        await run(`openclaw cron rm ${id} --json`);
        removed.push(name);
      }

      const refreshed = await listJobs();
      return NextResponse.json({ ok: true, removed, jobs: refreshed });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Cron action error:', error);
    return NextResponse.json({ error: 'Failed to apply cron action' }, { status: 500 });
  }
}
