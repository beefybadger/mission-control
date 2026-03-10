import type { Memory, Opportunity, Task, FreedomMetrics, OfferTemplate, TechnicalPain, RevenueBridge, MarketScout } from '@/types';

export const CHECKPOINT_DATE = '2026-03-12T00:00:00+02:00';

export const opportunitySeed: Opportunity[] = [
  {
    id: 'opp-affiliate-security-bundle',
    title: 'Senior security bundle comparison page + CTA',
    category: 'affiliate',
    source: 'Buyer intent keyword cluster: call blocker for seniors',
    timeToCash: 2,
    estimatedPayout: 180,
    complexity: 2,
    demandProof: 5,
    nextMoneyAction: 'Publish comparison page and push one direct outreach message to warm leads.',
    proofSignal: 'Repeated memory mentions around spam calls and security guides.',
  },
  {
    id: 'opp-service-setup-audit',
    title: 'Done-for-you home tech setup audit (remote)',
    category: 'service',
    source: 'Pain cluster from support requests and troubleshooting logs',
    timeToCash: 1,
    estimatedPayout: 250,
    complexity: 3,
    demandProof: 4,
    nextMoneyAction: 'Offer 3 paid audit slots this week with a one-page checklist deliverable.',
    proofSignal: 'High-frequency task friction around Wi-Fi, camera, and laptop setup questions.',
  },
  {
    id: 'opp-content-ai-risk-brief',
    title: 'AI risk brief + lightweight advisory call',
    category: 'content-offer',
    source: 'Fresh AI trend and security incident commentary',
    timeToCash: 3,
    estimatedPayout: 320,
    complexity: 3,
    demandProof: 4,
    nextMoneyAction: 'Ship one practical brief, then invite 5 qualified contacts to a paid advisory call.',
    proofSignal: 'Strong conversation velocity around AI tooling reliability and privacy concerns.',
  },
  {
    id: 'opp-affiliate-doorbell-no-sub',
    title: 'No-subscription doorbell shortlist with urgency CTA',
    category: 'affiliate',
    source: 'Niche pain cluster: recurring subscription fatigue',
    timeToCash: 2,
    estimatedPayout: 140,
    complexity: 2,
    demandProof: 4,
    nextMoneyAction: 'Publish shortlist and send to recent home entry security conversations.',
    proofSignal: 'Repeated memory references to home entry and subscription objections.',
  },
];

export const offerTemplates: OfferTemplate[] = [
  {
    id: 'template-audit',
    title: 'Home Tech Stability Audit',
    icp: 'Busy professional with recurring tech setup failures and low time tolerance.',
    painToOutcome: 'From recurring outages and support frustration to a stable setup with a clear action plan in 48 hours.',
    offerStack: ['45-minute diagnostic call', 'Prioritized fix roadmap', 'One follow-up optimization review'],
    riskReversal: 'If no top 3 fixes are identified, client pays nothing.',
    cta: 'Reply "audit" and I will send the intake form today.',
    closeScript: 'Based on your current setup and downtime cost, this gives you a clear fix path by tomorrow. Do you want the first slot this week?',
  },
  {
    id: 'template-security',
    title: 'Senior Security Stack Setup',
    icp: 'Families managing spam/scam exposure for older relatives.',
    painToOutcome: 'From high scam anxiety to a practical protection stack with easy daily use.',
    offerStack: ['Threat profile snapshot', 'Tool stack recommendation', 'Simple family handoff checklist'],
    riskReversal: 'If setup steps feel too complex after walkthrough, receive a simplified replacement plan free.',
    cta: 'Send "protect" and I will share the one-page starter checklist.',
    closeScript: 'The goal is fewer scam calls and less stress this week, not more complexity. Want me to map the exact setup for your family?',
  },
];

export function deriveOpportunitiesFromSchema(
  pains: TechnicalPain[],
  bridges: RevenueBridge[],
  scout: MarketScout[]
): Opportunity[] {
  const bridgeByPain = new Map<string, RevenueBridge[]>();

  for (const bridge of bridges) {
    if (!bridge.pain_id) continue;
    const bucket = bridgeByPain.get(bridge.pain_id) ?? [];
    bucket.push(bridge);
    bridgeByPain.set(bridge.pain_id, bucket);
  }

  const inferred = pains.map((pain) => {
    const linkedBridge = (bridgeByPain.get(pain.id) ?? [])[0];
    const bridgeType = (linkedBridge?.bridge_type ?? 'service').toLowerCase();
    const category: Opportunity['category'] = bridgeType.includes('affiliate')
      ? 'affiliate'
      : bridgeType.includes('content')
        ? 'content-offer'
        : 'service';

    const matchingScout = scout.find((s) => {
      const text = `${s.content ?? ''} ${s.source ?? ''}`.toLowerCase();
      const key = `${pain.title ?? ''} ${pain.description ?? ''}`.toLowerCase();
      return key.length > 0 && text.includes((pain.title ?? '').toLowerCase());
    });

    const severity = Math.max(1, Math.min(5, pain.severity ?? 3));
    const complexity = Math.max(1, 6 - severity);

    return {
      id: pain.id,
      title: pain.title ?? 'Untitled opportunity',
      category,
      source: matchingScout?.source ?? pain.source_platform ?? 'Council signal',
      timeToCash: severity >= 4 ? 1 : 2,
      estimatedPayout: severity >= 4 ? 320 : 180,
      complexity,
      demandProof: severity,
      nextMoneyAction: linkedBridge?.asset_copy ?? `Create a concrete paid offer around: ${pain.title ?? 'this pain point'}`,
      proofSignal: pain.description ?? matchingScout?.content ?? 'Pain signal captured from recent intelligence.',
    } satisfies Opportunity;
  });

  return inferred.length > 0 ? inferred : opportunitySeed;
}

export function scoreOpportunity(opp: Opportunity): number {
  const payoutScore = Math.min(5, Math.max(1, Math.round(opp.estimatedPayout / 80)));
  const speedScore = Math.max(1, 6 - opp.timeToCash);
  const complexityScore = Math.max(1, 6 - opp.complexity);
  return (speedScore * 0.35) + (payoutScore * 0.3) + (complexityScore * 0.15) + (opp.demandProof * 0.2);
}

export function rankOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return [...opportunities].sort((a, b) => scoreOpportunity(b) - scoreOpportunity(a));
}

export function buildFreedomMetrics(tasks: Task[], memories: Memory[], now = new Date()): FreedomMetrics {
  const leadsGenerated = memories.filter((m) => /lead|buyer|intent|outreach/i.test(m.content)).length;
  const offersSent = tasks.filter((t) => /offer|proposal|quote/i.test(t.title)).length;
  const conversationsActive = tasks.filter((t) => t.status !== 'completed' && /call|dm|conversation|follow-up/i.test(t.title)).length;
  const cashClosed = memories.filter((m) => /closed|paid|cash|invoice/i.test(m.content)).length;

  const checkpoint = new Date(CHECKPOINT_DATE);
  const diffMs = checkpoint.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    leadsGenerated,
    offersSent,
    conversationsActive,
    cashClosed,
    daysRemaining,
  };
}

export function topRevenueActions(opportunities: Opportunity[], limit = 3): string[] {
  return rankOpportunities(opportunities)
    .slice(0, limit)
    .map((opp) => opp.nextMoneyAction);
}

export function getMemoryPainSignals(memories: Memory[], limit = 5): string[] {
  const signals = memories
    .map((m) => m.content.trim())
    .filter((line) => /pain|frustrat|need|stuck|problem|blocked|slow/i.test(line))
    .slice(0, limit)
    .map((line) => line.slice(0, 160));

  return signals;
}
