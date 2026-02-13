import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Standardizing on the correct CLI syntax: 'openclaw cron list' (without --includeDisabled)
    const { stdout } = await execAsync('openclaw cron list --json');
    const jobs = JSON.parse(stdout);
    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error('Cron GET error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
