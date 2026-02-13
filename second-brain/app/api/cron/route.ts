import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) return true; // No key configured = open access (dev mode)
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${apiKey}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { stdout } = await execAsync('openclaw cron list --json');
    const data = JSON.parse(stdout);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Cron API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cron jobs', jobs: [] },
      { status: 500 }
    );
  }
}
