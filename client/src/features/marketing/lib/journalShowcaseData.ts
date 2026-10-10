export type PreviewBookId = "ragf" | "qpc" | "all";
export type ShowcaseChartMode = "balance" | "growth" | "period";

export interface JournalBookTrajectoryPoint {
  date: string;
  balance: number;
  pnl: number;
  growth: number;
}

export interface JournalBookData {
  id: string;
  name: string;
  strategy: string;
  description: string;
  startingBalance: number;
  currentBalance: number;
  totalPnl: number;
  totalProfit: number;
  totalLoss: number;
  avgWin: number;
  avgLoss: number;
  netGrowth: number;
  winRate: number;
  profitFactor: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  totalTrades: number;
  ruleComplianceRate: number;
  compliantTrades: number;
  rules: string[];
  trajectory: JournalBookTrajectoryPoint[];
}

export const PREVIEW_BOOKS: Record<string, JournalBookData> = {
  ragf: {
    id: "ragf",
    name: "TREND FLOW",
    strategy: "TREND FLOW • Order Flow",
    description: "Strict execution checklist. Before clicking execute, ensure all rules align.",
    startingBalance: 10000,
    currentBalance: 13420,
    totalPnl: 3420,
    totalProfit: 4820,
    totalLoss: 1400,
    avgWin: 438.18,
    avgLoss: 175.0,
    netGrowth: 34.2,
    winRate: 68.8,
    profitFactor: 3.44,
    winningTrades: 11,
    losingTrades: 4,
    breakevenTrades: 1,
    totalTrades: 16,
    ruleComplianceRate: 93.8,
    compliantTrades: 15,
    rules: [
      "Maximum risk per trade is strictly 1% of account balance.",
      "Always wait for market structure confirmation before entry.",
      "Target next high-timeframe liquidity pool; no early emotional closes.",
    ],
    trajectory: [
      { date: "Day 1", balance: 10000, pnl: 0, growth: 0 },
      { date: "Day 4", balance: 10440, pnl: 440, growth: 4.4 },
      { date: "Day 7", balance: 10270, pnl: -170, growth: 2.7 },
      { date: "Day 10", balance: 10760, pnl: 490, growth: 7.6 },
      { date: "Day 13", balance: 11240, pnl: 480, growth: 12.4 },
      { date: "Day 16", balance: 11090, pnl: -150, growth: 10.9 },
      { date: "Day 19", balance: 11680, pnl: 590, growth: 16.8 },
      { date: "Day 22", balance: 12210, pnl: 530, growth: 22.1 },
      { date: "Day 25", balance: 12040, pnl: -170, growth: 20.4 },
      { date: "Day 28", balance: 12580, pnl: 540, growth: 25.8 },
      { date: "Day 31", balance: 13000, pnl: 420, growth: 30.0 },
      { date: "Day 34", balance: 13420, pnl: 420, growth: 34.2 },
    ],
  },
  qpc: {
    id: "qpc",
    name: "CRT",
    strategy: "CRT • Session Cycle",
    description: "London manipulation sweep into New York session trend continuation.",
    startingBalance: 5000,
    currentBalance: 6890,
    totalPnl: 1890,
    totalProfit: 2420,
    totalLoss: 530,
    avgWin: 345.71,
    avgLoss: 176.67,
    netGrowth: 37.8,
    winRate: 70.0,
    profitFactor: 4.56,
    winningTrades: 7,
    losingTrades: 3,
    breakevenTrades: 0,
    totalTrades: 10,
    ruleComplianceRate: 90.0,
    compliantTrades: 9,
    rules: [
      "Only execute during London/New York session overlap window.",
      "Confirm clean liquidity grab prior to entering expansion.",
    ],
    trajectory: [
      { date: "Day 1", balance: 5000, pnl: 0, growth: 0 },
      { date: "Day 4", balance: 5350, pnl: 350, growth: 7.0 },
      { date: "Day 8", balance: 5720, pnl: 370, growth: 14.4 },
      { date: "Day 12", balance: 5540, pnl: -180, growth: 10.8 },
      { date: "Day 17", balance: 5980, pnl: 440, growth: 19.6 },
      { date: "Day 21", balance: 6360, pnl: 380, growth: 27.2 },
      { date: "Day 25", balance: 6190, pnl: -170, growth: 23.8 },
      { date: "Day 29", balance: 6570, pnl: 380, growth: 31.4 },
      { date: "Day 33", balance: 6890, pnl: 320, growth: 37.8 },
    ],
  },
  all: {
    id: "all",
    name: "Combined Portfolio",
    strategy: "All Strategy Books",
    description: "Consolidated multi-book equity growth and discipline verification.",
    startingBalance: 15000,
    currentBalance: 20310,
    totalPnl: 5310,
    totalProfit: 7240,
    totalLoss: 1930,
    avgWin: 402.22,
    avgLoss: 175.45,
    netGrowth: 35.4,
    winRate: 69.2,
    profitFactor: 3.75,
    winningTrades: 18,
    losingTrades: 7,
    breakevenTrades: 1,
    totalTrades: 26,
    ruleComplianceRate: 92.3,
    compliantTrades: 24,
    rules: [
      "Maximum daily portfolio risk across all books strictly capped at 2%.",
      "No correlated positions allowed simultaneously across different books.",
    ],
    trajectory: [
      { date: "Day 1", balance: 15000, pnl: 0, growth: 0 },
      { date: "Day 5", balance: 15790, pnl: 790, growth: 5.3 },
      { date: "Day 10", balance: 16480, pnl: 690, growth: 9.9 },
      { date: "Day 15", balance: 17220, pnl: 740, growth: 14.8 },
      { date: "Day 20", balance: 18190, pnl: 970, growth: 21.3 },
      { date: "Day 25", balance: 18780, pnl: 590, growth: 25.2 },
      { date: "Day 30", balance: 19570, pnl: 790, growth: 30.5 },
      { date: "Day 35", balance: 20310, pnl: 740, growth: 35.4 },
    ],
  },
};

export const SHOWCASE_STRATEGY_BOOK_TABS: ReadonlyArray<{
  id: PreviewBookId;
  title: string;
  startLabel: string;
  tradesCount: number;
}> = [
  { id: "qpc", title: "CRT", startLabel: "$5,000 start", tradesCount: 10 },
  { id: "ragf", title: "TREND FLOW", startLabel: "$10,000 start", tradesCount: 16 },
];

export const SHOWCASE_CHART_TABS: ReadonlyArray<{ id: ShowcaseChartMode; label: string }> = [
  { id: "balance", label: "Balance Curve" },
  { id: "growth", label: "Growth %" },
  { id: "period", label: "Period P&L" },
];

export const SHOWCASE_TILT_LIMITS = {
  MAX_TILT_X: 3.5,
  MAX_TILT_Y: 4.0,
  MAX_TRANS_X: 6.0,
  MAX_TRANS_Y: 5.0,
} as const;

export const SHOWCASE_CHART_MARGIN = {
  top: 12,
  right: 12,
  left: -10,
  bottom: 4,
} as const;

export const SHOWCASE_CHART_TOOLTIP_STYLE = {
  backgroundColor: "#070e1e",
  borderColor: "rgba(6,182,212,0.3)",
  borderRadius: "16px",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.6), 0 0 20px rgba(6,182,212,0.15)",
  color: "#fff",
  fontSize: "12px",
  padding: "12px",
} as const;

export function createInitialParallaxState() {
  return {
    rotX: 0,
    rotY: 0,
    transX: 0,
    transY: 0,
    sheenX: 50,
    sheenY: 50,
  };
}
