export interface JournalRule {
  id: string;
  text: string;
}

export interface CustomProperty {
  id: string;
  name: string;
  value: string;
}

export interface JournalBook {
  id: string;
  name: string;
  strategy?: string;
  startingBalance: number;
  currency?: string;
  rules: JournalRule[];
  createdAt: string;
  description?: string;
}

export interface TradeEntry {
  id: string;
  journalBookId: string;
  tradeNumber: number;
  date: string; // YYYY-MM-DD
  entryTime: string; // HH:mm
  pair: string;
  timeframe: string; // "1M" | "5M" | "15M" | "30M" | "1H" | "4H" | "1D" | "1W" | custom
  direction: "Buy" | "Sell";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice: number;
  followedRules: "Yes" | "No";
  pnl: number; // Dollar profit or loss
  riskReward: string; // e.g. "1:2.5"
  pips: number; // e.g. 45.2
  lotSize: number; // e.g. 1.00
  tradeRun: string; // e.g. "+2R"
  note: string; // explanation
  tradeRank: "A+" | "A" | "A-";
  mediaUrl?: string; // image / video data URL or URL
  mediaType?: "image" | "video";
  videoDurationSeconds?: number;
  learning: string; // update / learning text
  customProperties: CustomProperty[];
  createdAt: string;
  updatedAt?: string;
}

export interface JournalStats {
  startingBalance: number;
  currentBalance: number;
  totalPnl: number;
  growthPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // percentage (0-100)
  totalProfit: number;
  totalLoss: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  ruleComplianceRate: number; // percentage (0-100)
}

export interface GrowthDataPoint {
  tradeNumber: number;
  date: string;
  balance: number;
  equityGrowth: number;
  pnl: number;
  pair: string;
}

export interface PeriodPnl {
  period: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
}
