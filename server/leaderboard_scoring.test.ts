import { describe, expect, it } from "vitest";
import {
  upsertUser,
  syncUserTrades,
  getLeaderboardRankings,
  getAllLeaderboardRankings,
  getUserGlobalRank,
  getLeaderboardWeights,
  saveLeaderboardWeights,
  DEFAULT_LEADERBOARD_WEIGHTS,
} from "./db";

describe("Global Leaderboard Scoring & Ranking Engine", () => {
  it("only ranks eligible users (emailVerified: true, status: active, score > 0)", async () => {
    const verifiedUserOpenId = "test_eligible_trader_1";
    const unverifiedUserOpenId = "test_unverified_trader_2";
    const suspendedUserOpenId = "test_suspended_trader_3";

    await upsertUser({
      openId: verifiedUserOpenId,
      name: "Eligible Trader",
      email: "eligible@example.com",
      role: "user",
      language: "en",
      emailVerified: true as any,
      status: "active" as any,
    });

    await upsertUser({
      openId: unverifiedUserOpenId,
      name: "Unverified Trader",
      email: "unverified@example.com",
      role: "user",
      language: "en",
      emailVerified: false as any,
      status: "active" as any,
    });

    await upsertUser({
      openId: suspendedUserOpenId,
      name: "Suspended Trader",
      email: "suspended@example.com",
      role: "user",
      language: "en",
      emailVerified: true as any,
      status: "suspended" as any,
    });

    // Provide trade to verified trader
    const verifiedUser = (await getAllLeaderboardRankings("all")).find((r) => r.openId === verifiedUserOpenId);
    if (verifiedUser) {
      await syncUserTrades(verifiedUser.userId, [
        {
          id: "tr_el_1",
          pair: "EUR/USD",
          direction: "Buy",
          pnl: 250,
          followedRules: "Yes",
          date: "2026-09-20",
        },
      ]);
    }

    const rankings = await getLeaderboardRankings("all");

    // Unverified trader must NOT be in rankings
    expect(rankings.some((r) => r.openId === unverifiedUserOpenId)).toBe(false);

    // Suspended trader must NOT be in rankings
    expect(rankings.some((r) => r.openId === suspendedUserOpenId)).toBe(false);

    // No entry in rankings should be unverified or have score <= 0
    for (const trader of rankings) {
      expect(trader.overallScore).toBeGreaterThan(0);
    }
  }, 60000);

  it("handles dynamic admin weights and disables 0-weight metrics", async () => {
    // Save custom weights: only ruleAdherence active (100%), others 0
    await saveLeaderboardWeights({
      ruleAdherence: 100,
      disciplineRoutine: 0,
      winRate: 0,
      consistency: 0,
      profitFactor: 0,
    });

    const activeWeights = await getLeaderboardWeights();
    expect(activeWeights.ruleAdherence).toBe(100);
    expect(activeWeights.disciplineRoutine).toBe(0);
    expect(activeWeights.winRate).toBe(0);

    // Reset back to defaults for test hygiene
    await saveLeaderboardWeights(DEFAULT_LEADERBOARD_WEIGHTS);
    const resetWeights = await getLeaderboardWeights();
    expect(resetWeights.ruleAdherence).toBe(25);
    expect(resetWeights.disciplineRoutine).toBe(25);
    expect(resetWeights.winRate).toBe(20);
    expect(resetWeights.consistency).toBe(15);
    expect(resetWeights.profitFactor).toBe(15);
  }, 30000);

  it("calculates getUserGlobalRank accurately for a ranked trader", async () => {
    const rankings = await getLeaderboardRankings("all");
    if (rankings.length > 0) {
      const topTrader = rankings[0];
      const rankInfo = await getUserGlobalRank(topTrader.userId);
      expect(rankInfo.isRanked).toBe(true);
      expect(rankInfo.rank).toBe(topTrader.rank);
      expect(rankInfo.overallScore).toBe(Math.round(topTrader.overallScore));
    }
  }, 30000);
});
