export interface FedSignal {
  id: string;
  timestamp: string;
  source: string;
  headline: string;
  sentiment: 'dovish' | 'hawkish' | 'neutral';
  score: number; // -1 to +1 (Hawkish to Dovish)
  interpretation: string;
  recommendedAllocation: { [symbol: string]: number };
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  price: number;
  quantity: number;
  allocation: number; // current percentage
  targetAllocation: number; // target percentage
  change24h: number;
  value: number;
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  asset: string;
  action: 'BUY' | 'SELL' | 'HOLD' | 'SYSTEM_SAFETY_ABORT';
  price: number;
  quantity: number;
  value: number;
  rationale: string;
  txHash: string; // Verifiable hash for MVP audits
}

export interface AgentStatusState {
  status: 'idle' | 'thinking' | 'rebalancing';
  lastThought: string;
  activeTaskId?: string;
}

export interface SimulationPreset {
  name: string;
  source: string;
  headline: string;
  sentiment: 'dovish' | 'hawkish' | 'neutral';
  score: number;
  interpretation: string;
  thought: string;
  recommendedAllocation: { [symbol: string]: number };
}

