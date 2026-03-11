import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) return true;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${apiKey}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        opportunityId?: string;
        title?: string;
        category?: string;
        nextMoneyAction?: string;
        proofSignal?: string;
      }
    | null;

  if (!body?.title || !body?.nextMoneyAction) {
    return NextResponse.json({ error: 'Missing opportunity payload' }, { status: 400 });
  }

  const offerCopy = [
    `Offer Draft from Opportunity: ${body.title}`,
    `Category: ${body.category ?? 'service'}`,
    `Next action: ${body.nextMoneyAction}`,
    `Proof: ${body.proofSignal ?? 'N/A'}`,
  ].join('\n');

  const [bridgeRes, taskRes, logRes] = await Promise.all([
    supabaseServer.from('revenue_bridges').insert([
      {
        bridge_type: 'offer_sprint',
        asset_copy: offerCopy,
        status: 'draft',
      },
    ]).select('id').single(),
    supabaseServer.from('tasks').insert([
      {
        title: `[Pipeline] ${body.title} -> Offer Sprint -> Outreach`,
        status: 'pending',
        priority: 'high',
      },
    ]).select('id').single(),
    supabaseServer.from('agent_logs').insert([
      {
        agent_name: 'baron-os',
        action: 'pipeline.opportunity_to_offer',
        status: 'success',
        metadata: {
          opportunityId: body.opportunityId ?? null,
          opportunityTitle: body.title,
          category: body.category ?? null,
        },
      },
    ]),
  ]);

  if (bridgeRes.error || taskRes.error || logRes.error) {
    return NextResponse.json({
      error: 'Failed to execute pipeline transition',
      details: {
        bridge: bridgeRes.error?.message,
        task: taskRes.error?.message,
        log: logRes.error?.message,
      },
    }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    bridgeId: bridgeRes.data?.id,
    taskId: taskRes.data?.id,
  });
}
