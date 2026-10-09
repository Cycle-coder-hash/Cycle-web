import { TradeEntry, JournalStats, GrowthDataPoint, PeriodPnl } from "@/types/journal";

/**
 * Determine pip size based on instrument/pair
 */
export function getPipMultiplier(pair: string): number {
  const p = pair.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // JPY pairs: 0.01 = 1 pip
  if (p.includes("JPY")) {
    return 100;
  }
  // Gold / Metals: $0.10 = 1 pip or 10 pips per dollar
  if (p.includes("XAU") || p.includes("GOLD")) {
    return 10;
  }
  // Silver: $0.01 = 1 pip
  if (p.includes("XAG") || p.includes("SILVER")) {
    return 100;
  }
  // Crypto (BTC, ETH, etc.): 1 point = 1 pip
  if (p.includes("BTC") || p.includes("ETH") || p.includes("SOL") || p.includes("CRYPTO")) {
    return 1;
  }
  // Indices (US30, NAS100, SPX500, GER30, etc.): 1 point = 1 pip
  if (p.includes("US30") || p.includes("NAS") || p.includes("SPX") || p.includes("GER") || p.includes("DOW")) {
    return 1;
  }
  // Default standard Forex pairs (EURUSD, GBPUSD, etc.): 0.0001 = 1 pip
  return 10000;
}

/**
 * Calculate pips based on entry, exit, pair, and direction
 */
export function calculatePips(
  pair: string,
  direction: "Buy" | "Sell",
  entry: number,
  exit: number
): number {
  if (!entry || !exit) return 0;
  const mult = getPipMultiplier(pair);
  const diff = direction === "Buy" ? exit - entry : entry - exit;
  return Math.round(diff * mult * 10) / 10;
}

/**
 * Calculate estimated dollar P&L based on pair, direction, entry, exit, and lot size
 */
export function calculateEstimatedPnl(
  pair: string,
  direction: "Buy" | "Sell",
  entry: number,
  exit: number,
  lotSize: number
): number {
  if (!entry || !exit || !lotSize) return 0;
  const p = pair.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const diff = direction === "Buy" ? exit - entry : entry - exit;

  let contractSize = 100000; // Standard Forex
  if (p.includes("XAU") || p.includes("GOLD")) {
    contractSize = 100; // 100 oz per lot
  } else if (p.includes("XAG") || p.includes("SILVER")) {
    contractSize = 5000; // 5000 oz per lot
  } else if (p.includes("BTC") || p.includes("ETH") || p.includes("CRYPTO")) {
    contractSize = 1;
  } else if (p.includes("US30") || p.includes("NAS") || p.includes("SPX")) {
    contractSize = 1;
  } else if (p.includes("JPY")) {
    // If USDJPY, 1 pip = $10 / USDJPY rate, approximately ~$100,000 / entry
    contractSize = 100000 / (entry || 150);
  }

  const raw = diff * lotSize * contractSize;
  return Math.round(raw * 100) / 100;
}

/**
 * Calculate Risk : Reward ratio from Entry, Stop Loss, and Take Profit
 */
export function calculateRiskReward(
  direction: "Buy" | "Sell",
  entry: number,
  sl: number,
  tp: number
): string {
  if (!entry || !sl || !tp) return "1:1";
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);

  if (risk <= 0) return "1:1";
  const ratio = (reward / risk).toFixed(1);
  return `1:${ratio.endsWith(".0") ? ratio.slice(0, -2) : ratio}`;
}

/**
 * Calculate complete performance statistics for a set of trades given a starting balance
 */
export function computeJournalStats(
  startingBalance: number,
  trades: TradeEntry[]
): JournalStats {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      startingBalance,
      currentBalance: startingBalance,
      totalPnl: 0,
      growthPercent: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      ruleComplianceRate: 0,
    };
  }

  let totalPnl = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakevenTrades = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let rulesFollowedCount = 0;

  for (const t of trades) {
    totalPnl += t.pnl;
    if (t.pnl > 0.001) {
      winningTrades++;
      totalProfit += t.pnl;
    } else if (t.pnl < -0.001) {
      losingTrades++;
      totalLoss += Math.abs(t.pnl);
    } else {
      breakevenTrades++;
    }

    if (t.followedRules === "Yes") {
      rulesFollowedCount++;
    }
  }

  const currentBalance = Math.round((startingBalance + totalPnl) * 100) / 100;
  const growthPercent = startingBalance > 0
    ? Math.round(((currentBalance - startingBalance) / startingBalance) * 10000) / 100
    : 0;

  const winRate = totalTrades > 0
    ? Math.round((winningTrades / totalTrades) * 100)
    : 0;

  const averageWin = winningTrades > 0 ? Math.round((totalProfit / winningTrades) * 100) / 100 : 0;
  const averageLoss = losingTrades > 0 ? Math.round((totalLoss / losingTrades) * 100) / 100 : 0;
  const profitFactor = totalLoss > 0
    ? Math.round((totalProfit / totalLoss) * 100) / 100
    : totalProfit > 0 ? 99.9 : 0;

  const ruleComplianceRate = totalTrades > 0
    ? Math.round((rulesFollowedCount / totalTrades) * 100)
    : 100;

  return {
    startingBalance,
    currentBalance,
    totalPnl: Math.round(totalPnl * 100) / 100,
    growthPercent,
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate,
    totalProfit: Math.round(totalProfit * 100) / 100,
    totalLoss: Math.round(totalLoss * 100) / 100,
    averageWin,
    averageLoss,
    profitFactor,
    ruleComplianceRate,
  };
}

/**
 * Generate sequential balance progression and equity growth curve data points for charts
 */
export function generateGrowthProgression(
  startingBalance: number,
  trades: TradeEntry[]
): GrowthDataPoint[] {
  // Sort trades chronologically by date/time or trade number
  const sorted = [...trades].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.tradeNumber - b.tradeNumber;
  });

  const points: GrowthDataPoint[] = [
    {
      tradeNumber: 0,
      date: "Start",
      balance: startingBalance,
      equityGrowth: 0,
      pnl: 0,
      pair: "Deposit",
    },
  ];

  let currentBal = startingBalance;
  for (const t of sorted) {
    currentBal = Math.round((currentBal + t.pnl) * 100) / 100;
    const growth = startingBalance > 0
      ? Math.round(((currentBal - startingBalance) / startingBalance) * 10000) / 100
      : 0;

    points.push({
      tradeNumber: t.tradeNumber,
      date: t.date,
      balance: currentBal,
      equityGrowth: growth,
      pnl: t.pnl,
      pair: t.pair,
    });
  }

  return points;
}

/**
 * Group trades into Daily, Weekly, and Monthly P&L breakdowns
 */
export function aggregatePeriodPnl(
  trades: TradeEntry[],
  periodType: "daily" | "weekly" | "monthly"
): PeriodPnl[] {
  const groups: Record<string, { pnl: number; trades: number; wins: number; losses: number }> = {};

  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));

  for (const t of sorted) {
    let key = t.date;
    if (periodType === "monthly") {
      key = t.date.slice(0, 7); // YYYY-MM
    } else if (periodType === "weekly") {
      // Approximate ISO week
      const d = new Date(t.date);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d.getTime() - startOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
      key = `${d.getFullYear()}-W${weekNum < 10 ? "0" + weekNum : weekNum}`;
    }

    if (!groups[key]) {
      groups[key] = { pnl: 0, trades: 0, wins: 0, losses: 0 };
    }

    groups[key].pnl += t.pnl;
    groups[key].trades += 1;
    if (t.pnl > 0.001) groups[key].wins += 1;
    else if (t.pnl < -0.001) groups[key].losses += 1;
  }

  return Object.keys(groups).map((key) => ({
    period: key,
    pnl: Math.round(groups[key].pnl * 100) / 100,
    trades: groups[key].trades,
    wins: groups[key].wins,
    losses: groups[key].losses,
  }));
}
