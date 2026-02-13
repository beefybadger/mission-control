import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { UsageData } from '@/types';

const execAsync = promisify(exec);

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

  try {
    const { stdout } = await execAsync('openclaw status --json');
    const raw = JSON.parse(stdout);

    const inputTokens = raw.totalInputTokens ?? 0;
    const outputTokens = raw.totalOutputTokens ?? 0;
    const totalTokens = inputTokens + outputTokens;

    const inputCost = (inputTokens / 1_000_000) * 0.15;
    const outputCost = (outputTokens / 1_000_000) * 0.60;
    const sessionCost = inputCost + outputCost;

    const usage: UsageData = {
      sessionCost: sessionCost.toFixed(4),
      sessionTokens: totalTokens.toLocaleString(),
      monthlyEstimated: (sessionCost * 30).toFixed(2),
      projectedTokens: (totalTokens * 30).toLocaleString(),
      budgetUsed: `${Math.min(100, Math.round((sessionCost * 30 / 10) * 100))}%`,
      lastUpdate: new Date().toISOString(),
      isFallback: false,
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Usage API error:', error);

    // Return clearly-flagged fallback data
    const fallback: UsageData = {
      sessionCost: '0.00',
      sessionTokens: '0',
      monthlyEstimated: '0.00',
      projectedTokens: '0',
      budgetUsed: '0%',
      lastUpdate: new Date().toISOString(),
      isFallback: true,
    };

    return NextResponse.json(fallback);
  }
}
