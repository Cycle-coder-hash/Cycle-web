export interface LeaderboardTrader {
  rank: number;
  userId: number;
  openId: string;
  name: string;
  avatar: string | null;
  role: string;
  startingBalance: number;
  currentBalance: number;
  gainPercent: number; // ((currentBalance - startingBalance) / startingBalance) * 100
  currency: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // 0-100%
  totalPnl: number;
  profitFactor: number;
  ruleComplianceRate: number; // 0-100% (Risk management performance)
  disciplineScore: number; // 0-100% (Daily discipline adherence)
  consistencyScore: number; // 0-100%
  currentStreak: number; // Days
  activeDays: number;
  overallScore: number; // 0-100 deterministic composite score
  bestPair: string;
  overallScoreUnrounded?: number;
  scoreUpdatedAtTime?: number;
}
