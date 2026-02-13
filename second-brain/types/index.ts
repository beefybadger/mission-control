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
