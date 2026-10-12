import { disciplineTaskCompletions } from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { getSetting, setSetting } from "../../infra/db/settings";
import { inMemoryDisciplineCompletions } from "../discipline";
import {
  getUserJournalConfig,
  getUserTrades,
  getAllTraderTrades,
} from "../journal";
import { listAllUsers, getTraderProfile } from "../auth";
import { isEligibleForLeaderboard, getUserSubscription } from "../subscription";
import { LeaderboardTrader } from "@shared/types/leaderboard";

export type { LeaderboardTrader };

export interface LeaderboardWeights {
  ruleAdherence: number;
  disciplineRoutine: number;
  winRate: number;
  consistency: number;
  profitFactor: number;
}

export const DEFAULT_LEADERBOARD_WEIGHTS: LeaderboardWeights = {
  ruleAdherence: 25,
  disciplineRoutine: 25,
  winRate: 20,
  consistency: 15,
  profitFactor: 15,
};

export async function getLeaderboardWeights(): Promise<LeaderboardWeights> {
  try {
    const raw = await getSetting("leaderboard_settings");
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed === "object") {
        const ra = Number(parsed.ruleAdherence);
        const dr = Number(parsed.disciplineRoutine);
        const wr = Number(parsed.winRate);
        const cs = Number(parsed.consistency);
        const pf = Number(parsed.profitFactor);
        if (
          !isNaN(ra) && ra >= 0 &&
          !isNaN(dr) && dr >= 0 &&
          !isNaN(wr) && wr >= 0 &&
          !isNaN(cs) && cs >= 0 &&
          !isNaN(pf) && pf >= 0 &&
          (ra + dr + wr + cs + pf) > 0
        ) {
          return {
            ruleAdherence: Math.round(ra),
            disciplineRoutine: Math.round(dr),
            winRate: Math.round(wr),
            consistency: Math.round(cs),
            profitFactor: Math.round(pf),
          };
        }
      }
    }
  } catch (err) {
    console.warn("[getLeaderboardWeights error]:", err);
  }
  return { ...DEFAULT_LEADERBOARD_WEIGHTS };
}

export async function saveLeaderboardWeights(weights: Partial<LeaderboardWeights>): Promise<LeaderboardWeights> {
  const current = await getLeaderboardWeights();
  const ra = weights.ruleAdherence !== undefined ? Number(weights.ruleAdherence) : current.ruleAdherence;
  const dr = weights.disciplineRoutine !== undefined ? Number(weights.disciplineRoutine) : current.disciplineRoutine;
  const wr = weights.winRate !== undefined ? Number(weights.winRate) : current.winRate;
  const cs = weights.consistency !== undefined ? Number(weights.consistency) : current.consistency;
  const pf = weights.profitFactor !== undefined ? Number(weights.profitFactor) : current.profitFactor;

  if (
    isNaN(ra) || ra < 0 ||
    isNaN(dr) || dr < 0 ||
    isNaN(wr) || wr < 0 ||
    isNaN(cs) || cs < 0 ||
    isNaN(pf) || pf < 0
  ) {
    throw new Error("Leaderboard weights must be non-negative numbers");
  }

  const sum = ra + dr + wr + cs + pf;
  if (sum === 0) {
    throw new Error("At least one leaderboard weight must be greater than zero");
  }

  const validWeights: LeaderboardWeights = {
    ruleAdherence: Math.round(ra),
    disciplineRoutine: Math.round(dr),
    winRate: Math.round(wr),
    consistency: Math.round(cs),
    profitFactor: Math.round(pf),
  };

  await setSetting("leaderboard_settings", JSON.stringify({
    ...validWeights,
    updatedAt: new Date().toISOString(),
  }));

  return validWeights;
}

function parseTimeframeBounds(timeframe: "all" | "month" | "week"): { startDate?: string; endDate?: string } {
  if (timeframe === "all") return {};
  const now = new Date();
  const format = (d: Date) => d.toISOString().slice(0, 10);

  if (timeframe === "month") {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    return { startDate, endDate };
  }

  if (timeframe === "week") {
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { startDate: format(monday), endDate: format(sunday) };
  }

  return {};
}

async function computeScoredLeaderboardEntries(
  timeframe: "all" | "month" | "week" = "all",
  options?: { paidOnly?: boolean }
): Promise<LeaderboardTrader[]> {
  const paidOnly = options?.paidOnly ?? true;
  const allUsers = await listAllUsers();
  const allTrades = await getAllTraderTrades();
  const { startDate, endDate } = parseTimeframeBounds(timeframe);

  const db = await getDb();
  let allCompletions: any[] = [];
  if (db) {
    try {
      allCompletions = await db.select().from(disciplineTaskCompletions);
    } catch (err) {
      console.warn("[getAllLeaderboardRankings completions db error]:", err);
      allCompletions = inMemoryDisciplineCompletions;
    }
  } else {
    allCompletions = inMemoryDisciplineCompletions;
  }

  const weights = await getLeaderboardWeights();
  const totalWeight =
    weights.ruleAdherence +
    weights.disciplineRoutine +
    weights.winRate +
    weights.consistency +
    weights.profitFactor;
  const activeTotalWeight = totalWeight > 0 ? totalWeight : 100;

  const results: LeaderboardTrader[] = [];

  for (const user of allUsers) {
    // Eligibility Rule 1: Email must be verified
    const isEmailVerified = user.emailVerified === true || (user as any).emailVerified === 1 || Boolean((user as any).emailVerified);
    if (!isEmailVerified) continue;

    // Eligibility Rule 2: Active account (not suspended / banned)
    const isSuspended =
      (user as any).status === "suspended" ||
      (user as any).status === "banned" ||
      (user as any).accountStatus === "suspended" ||
      (user as any).accountStatus === "banned";
    if (isSuspended) continue;

    const sub = await getUserSubscription(user.id);
    if (sub.accountStatus !== "active") continue;

    // Filter user trades by timeframe (all-time default)
    let userTrades = allTrades.filter((t) => t.userId === user.id);
    if (startDate && endDate) {
      userTrades = userTrades.filter((t) => t.date >= startDate && t.date <= endDate);
    }
    if (userTrades.length === 0) continue;

    // Eligibility Rule 4 (Public Leaderboard only): Must have an ACTIVE PRO or ACTIVE PREMIUM subscription
    if (paidOnly) {
      const hasPaidPlan = await isEligibleForLeaderboard(user.id, user);
      if (!hasPaidPlan) continue;
    }

    // Filter user discipline completions by timeframe
    let userCompletions = allCompletions.filter((c) => c.userId === user.id && c.completed);
    if (startDate && endDate) {
      userCompletions = userCompletions.filter((c) => c.date >= startDate && c.date <= endDate);
    }

    const totalTrades = userTrades.length;
    let winningTrades = 0;
    let losingTrades = 0;
    let breakevenTrades = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let rulesFollowed = 0;
    const pairCounts: Record<string, number> = {};

    for (const t of userTrades) {
      const pnl = Number(t.pnl) || 0;
      if (pnl > 0.001) {
        winningTrades++;
        totalProfit += pnl;
      } else if (pnl < -0.001) {
        losingTrades++;
        totalLoss += Math.abs(pnl);
      } else {
        breakevenTrades++;
      }

      if (t.followedRules === "Yes") {
        rulesFollowed++;
      }

      const p = (t.pair || "EURUSD").toUpperCase();
      pairCounts[p] = (pairCounts[p] || 0) + 1;
    }

    let bestPair = "EUR/USD";
    let maxPairCount = 0;
    for (const [pair, count] of Object.entries(pairCounts)) {
      if (count > maxPairCount) {
        maxPairCount = count;
        bestPair = pair;
      }
    }

    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
    const totalPnl = Math.round((totalProfit - totalLoss) * 100) / 100;
    const profitFactor = totalTrades > 0 && totalLoss > 0
      ? Math.round((totalProfit / totalLoss) * 100) / 100
      : (totalTrades > 0 && totalProfit > 0 ? 99.9 : 0);

    const ruleComplianceRate = totalTrades > 0
      ? Math.round((rulesFollowed / totalTrades) * 100)
      : 0;

    // Active days count
    const allActiveDates = new Set<string>();
    userTrades.forEach((t) => {
      if (t.date) allActiveDates.add(String(t.date));
    });
    userCompletions.forEach((c) => {
      if (c.date) allActiveDates.add(String(c.date));
    });
    const activeDays = allActiveDates.size;

    // Discipline stats computed in-memory
    const completedCount = userCompletions.length;
    const currentStreak = Math.min(30, Math.max(completedCount, activeDays));
    const disciplineScore = Math.min(100, completedCount > 0 ? Math.min(100, completedCount * 10) : Math.min(80, activeDays * 20));

    // Consistency score (0-100)
    const consistencyScore = Math.min(100, Math.round(activeDays * 8 + Math.min(currentStreak * 4, 30)));

    // Multidimensional deterministic scoring formula with dynamic weights:
    const normalizedPf = totalTrades > 0 ? Math.min(100, Math.max(0, (profitFactor / 3) * 100)) : 0;

    const ruleContribution = (weights.ruleAdherence * ruleComplianceRate) / activeTotalWeight;
    const discContribution = (weights.disciplineRoutine * disciplineScore) / activeTotalWeight;
    const winContribution = (weights.winRate * winRate) / activeTotalWeight;
    const consistContribution = (weights.consistency * consistencyScore) / activeTotalWeight;
    const pfContribution = (weights.profitFactor * normalizedPf) / activeTotalWeight;

    const overallScoreUnrounded = ruleContribution + discContribution + winContribution + consistContribution + pfContribution;
    const overallScore = Math.round(overallScoreUnrounded);

    // Eligibility Rule 3: Must have valid performance data and Overall Score > 0
    if (overallScore <= 0 || overallScoreUnrounded <= 0) continue;

    // Latest activity timestamp for tie-breaking
    const activityDates: number[] = [];
    userTrades.forEach((t) => {
      if (t.createdAt) activityDates.push(new Date(t.createdAt).getTime());
      else if (t.date) activityDates.push(new Date(t.date).getTime());
    });
    userCompletions.forEach((c) => {
      if (c.createdAt) activityDates.push(new Date(c.createdAt).getTime());
      else if (c.date) activityDates.push(new Date(c.date).getTime());
    });
    const scoreUpdatedAtTime = activityDates.length > 0
      ? Math.max(...activityDates)
      : (user.createdAt ? new Date(user.createdAt).getTime() : 0);

    const journalConfig = await getUserJournalConfig(user.id);
    const startingBalance = journalConfig.startingBalance || 10000;
    const currency = journalConfig.currency || "$";
    const currentBalance = Math.round((startingBalance + totalPnl) * 100) / 100;
    const gainPercent = startingBalance > 0 ? Math.round(((currentBalance - startingBalance) / startingBalance) * 1000) / 10 : 0;

    // Synchronize latest custom profile name & avatar independently
    const prof = await getTraderProfile(user.openId);
    const resolvedName = prof?.name || user.name || `Trader #${user.id}`;
    const resolvedAvatar = prof?.avatar !== undefined ? prof.avatar : (user.avatar || null);

    results.push({
      rank: 0,
      userId: user.id,
      openId: user.openId,
      name: resolvedName,
      avatar: resolvedAvatar,
      role: user.role || "user",
      startingBalance,
      currentBalance,
      gainPercent,
      currency,
      totalTrades,
      winningTrades,
      losingTrades,
      breakevenTrades,
      winRate,
      totalPnl,
      profitFactor,
      ruleComplianceRate,
      disciplineScore,
      consistencyScore,
      currentStreak,
      activeDays,
      overallScore,
      overallScoreUnrounded,
      scoreUpdatedAtTime,
      bestPair,
    });
  }

  // Deterministic sorting
  results.sort((a, b) => {
    const scoreDiff = (b.overallScoreUnrounded ?? b.overallScore) - (a.overallScoreUnrounded ?? a.overallScore);
    if (Math.abs(scoreDiff) > 0.0001) {
      return scoreDiff;
    }
    const timeA = a.scoreUpdatedAtTime || 0;
    const timeB = b.scoreUpdatedAtTime || 0;
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return a.userId - b.userId;
  });

  // Assign competition ranking
  for (let i = 0; i < results.length; i++) {
    if (i > 0) {
      const prev = results[i - 1];
      const curr = results[i];
      const scorePrev = prev.overallScoreUnrounded ?? prev.overallScore;
      const scoreCurr = curr.overallScoreUnrounded ?? curr.overallScore;
      const isSameScore = Math.abs(scorePrev - scoreCurr) < 0.0001;
      const isSameTime = (curr.scoreUpdatedAtTime || 0) === (prev.scoreUpdatedAtTime || 0);

      if (isSameScore && isSameTime) {
        curr.rank = prev.rank;
      } else {
        curr.rank = i + 1;
      }
    } else {
      results[0].rank = 1;
    }
  }

  return results;
}

/**
 * Returns all eligible scored users (Free, Pro, and Premium) with their global rank.
 * Used to compute personal Global Rank in the Dashboard Overview.
 */
export async function getAllGlobalScoredRankings(timeframe: "all" | "month" | "week" = "all"): Promise<LeaderboardTrader[]> {
  return computeScoredLeaderboardEntries(timeframe, { paidOnly: false });
}

/**
 * Returns all eligible paid (active Pro or Premium) users ranked for the public Leaderboard.
 */
export async function getAllLeaderboardRankings(timeframe: "all" | "month" | "week" = "all"): Promise<LeaderboardTrader[]> {
  return computeScoredLeaderboardEntries(timeframe, { paidOnly: true });
}

export async function getLeaderboardRankings(timeframe: "all" | "month" | "week" = "all"): Promise<LeaderboardTrader[]> {
  const allRanked = await getAllLeaderboardRankings(timeframe);
  return allRanked.slice(0, 10);
}

export async function getUserGlobalRank(userId: number): Promise<{
  rank: number | null;
  overallScore: number | null;
  isRanked: boolean;
}> {
  const allRanked = await getAllGlobalScoredRankings("all");
  const entry = allRanked.find((r) => r.userId === userId);
  if (!entry) {
    return { rank: null, overallScore: null, isRanked: false };
  }
  return {
    rank: entry.rank,
    overallScore: Math.round(entry.overallScore),
    isRanked: true,
  };
}

export async function getPublicTraderStats(userId: number, timeframe: "all" | "month" | "week" = "all") {
  const rankings = await getLeaderboardRankings(timeframe);
  const trader = rankings.find((r) => r.userId === userId);
  if (!trader) return null;

  const userTrades = (await getUserTrades(userId)).filter((t) => {
    const { startDate, endDate } = parseTimeframeBounds(timeframe);
    if (startDate && endDate) {
      return t.date >= startDate && t.date <= endDate;
    }
    return true;
  });

  let totalWinAmount = 0;
  let totalLossAmount = 0;
  let winCount = 0;
  let lossCount = 0;

  for (const t of userTrades) {
    const pnl = Number(t.pnl) || 0;
    if (pnl > 0.001) {
      totalWinAmount += pnl;
      winCount++;
    } else if (pnl < -0.001) {
      totalLossAmount += Math.abs(pnl);
      lossCount++;
    }
  }

  const avgWin = winCount > 0 ? Math.round((totalWinAmount / winCount) * 100) / 100 : 0;
  const avgLoss = lossCount > 0 ? Math.round((totalLossAmount / lossCount) * 100) / 100 : 0;

  return {
    ...trader,
    avgWin,
    avgLoss,
    scoreBreakdown: {
      riskManagement: trader.ruleComplianceRate,
      disciplineScore: trader.disciplineScore,
      winRate: trader.winRate,
      consistency: trader.consistencyScore,
      pnlQuality: Math.min(100, Math.round((trader.profitFactor / 3) * 100)),
    },
  };
}
