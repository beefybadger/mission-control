// ─── Core Domain Types ───────────────────────────────────────────

export interface Memory {
  id: string;
  file_path: string;
  content: string;
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: 'affiliate' | 'service' | 'content-offer';
  source: string;
  timeToCash: number;
  estimatedPayout: number;
  complexity: number;
  demandProof: number;
  nextMoneyAction: string;
  proofSignal: string;
}

export interface FreedomMetrics {
  leadsGenerated: number;
  offersSent: number;
  conversationsActive: number;
  cashClosed: number;
  daysRemaining: number;
}

export interface OfferTemplate {
  id: string;
  title: string;
  icp: string;
  painToOutcome: string;
  offerStack: string[];
  riskReversal: string;
  cta: string;
  closeScript: string;
}

export interface TechnicalPain {
  id: string;
  created_at: string;
  title: string | null;
  description: string | null;
  severity: number | null;
  target_audience: string | null;
  discovered_by: string | null;
  source_url: string | null;
  source_platform: string | null;
  status: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RevenueBridge {
  id: string;
  created_at: string;
  pain_id: string | null;
  bridge_type: string | null;
  asset_copy: string | null;
  status: string | null;
}

export interface MarketScout {
  id: string;
  created_at: string;
  source: string | null;
  content: string | null;
  url: string | null;
}

// ─── Agent Council ───────────────────────────────────────────────

export type AgentColor = 'blue' | 'emerald' | 'purple';

export interface CouncilMember {
  id: string;
  name: string;
  role: string;
  level: string;
  status: 'Active' | 'Standby';
  description: string;
  capabilities: string[];
  color: AgentColor;
}

// ─── Usage & Cron ────────────────────────────────────────────────

export interface UsageData {
  sessionCost: string;
  sessionTokens: string;
  monthlyEstimated: string;
  projectedTokens?: string;
  budgetUsed: string;
  lastUpdate?: string;
  isFallback?: boolean;
}

export interface CronJob {
  jobId?: string;
  id?: string;
  name?: string;
  enabled: boolean;
  schedule?: {
    expr?: string;
    kind?: string;
  };
  sessionTarget?: string;
  state?: {
    nextRunAtMs?: number;
  };
}

// ─── Chat ────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  file_path: string;
  content: string;
  created_at: string;
  updated_at: string;
}
