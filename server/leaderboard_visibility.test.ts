import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import {
  inMemoryUsers,
  saveTraderProfile,
} from "./features/auth";
import {
  inMemoryTraderTrades,
  inMemoryJournalConfigs,
} from "./features/journal";
import { inMemoryDisciplineCompletions } from "./features/discipline";
import { setSetting } from "./infra/db/settings";
import {
  activateSubscription,
  claimFreeTrialPlan,
  setAccountStatus,
  resetInMemorySubscriptionStateForTests,
} from "./features/subscription";
import {
  getUserGlobalRank,
  getLeaderboardRankings,
  getAllLeaderboardRankings,
  getAllGlobalScoredRankings,
  saveLeaderboardWeights,
  DEFAULT_LEADERBOARD_WEIGHTS,
} from "./features/leaderboard";

function createTestContext(user: {
  id: number;
  openId: string;
  email: string;
  name: string;
  role?: "user" | "admin";
}): TrpcContext {
  const now = new Date("2026-06-01T12:00:00.000Z");
  return {
    user: {
      id: user.id,
      openId: user.openId,
      email: user.email,
      name: user.name,
      loginMethod: "email",
      role: user.role || "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Leaderboard Visibility & Personal Global Rank Separation", () => {
  let savedUsers: Map<string, any>;
  let savedTrades: any[];
  let savedCompletions: any[];
  let savedConfigs: Map<number, any>;

  const TEST_USER_IDS = Array.from({ length: 25 }, (_, i) => 880001 + i);

  beforeEach(async () => {
    // Snapshot and isolate in-memory collections so tests run against controlled registered-user data
    savedUsers = new Map(inMemoryUsers);
    savedTrades = [...inMemoryTraderTrades];
    savedCompletions = [...inMemoryDisciplineCompletions];
    savedConfigs = new Map(inMemoryJournalConfigs);

    inMemoryUsers.clear();
    inMemoryTraderTrades.length = 0;
    inMemoryDisciplineCompletions.length = 0;
    inMemoryJournalConfigs.clear();
    await setSetting("global_trader_registry", JSON.stringify([]));

    for (const id of TEST_USER_IDS) {
      resetInMemorySubscriptionStateForTests(id);
      await setSetting(`trader_profile_lb-test-user-${id}`, "");
    }
    await saveLeaderboardWeights(DEFAULT_LEADERBOARD_WEIGHTS);
  });

  afterEach(async () => {
    inMemoryUsers.clear();
    for (const [k, v] of savedUsers.entries()) inMemoryUsers.set(k, v);

    inMemoryTraderTrades.length = 0;
    inMemoryTraderTrades.push(...savedTrades);

    inMemoryDisciplineCompletions.length = 0;
    inMemoryDisciplineCompletions.push(...savedCompletions);

    inMemoryJournalConfigs.clear();
    for (const [k, v] of savedConfigs.entries()) inMemoryJournalConfigs.set(k, v);

    await setSetting("global_trader_registry", JSON.stringify([]));
    for (const id of TEST_USER_IDS) {
      resetInMemorySubscriptionStateForTests(id);
      await setSetting(`trader_profile_lb-test-user-${id}`, "");
    }
    await saveLeaderboardWeights(DEFAULT_LEADERBOARD_WEIGHTS);
  });

  function seedRegisteredUser(opts: {
    id: number;
    name: string;
    emailVerified?: boolean;
    status?: string;
    avatar?: string | null;
  }) {
    const openId = `lb-test-user-${opts.id}`;
    const record = {
      id: opts.id,
      openId,
      name: opts.name,
      email: `user${opts.id}@example.com`,
      emailVerified: opts.emailVerified ?? true,
      status: opts.status ?? "active",
      accountStatus: opts.status ?? "active",
      avatar: opts.avatar ?? null,
      role: "user",
      language: "en",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      lastSignedIn: new Date("2026-01-01T00:00:00.000Z"),
    };
    inMemoryUsers.set(openId, record);
    return record;
  }

  function seedWinningTrades(
    userId: number,
    count: number,
    opts?: {
      pnlPerTrade?: number;
      followedRules?: "Yes" | "No";
      createdAt?: string;
      baseDate?: string;
    }
  ) {
    const pnl = opts?.pnlPerTrade ?? 250;
    const followedRules = opts?.followedRules ?? "Yes";
    const createdAt = opts?.createdAt ?? "2026-05-10T10:00:00.000Z";
    for (let i = 0; i < count; i++) {
      const day = String((i % 28) + 1).padStart(2, "0");
      const dateStr = opts?.baseDate ?? `2026-05-${day}`;
      inMemoryTraderTrades.push({
        id: `trade_${userId}_${i}`,
        userId,
        date: dateStr,
        pair: "XAUUSD",
        direction: "Long",
        entryPrice: 2300,
        stopLoss: 2290,
        takeProfit: 2330,
        exitPrice: pnl >= 0 ? 2325 : 2290,
        riskReward: 2.5,
        pnl,
        followedRules,
        notes: "Test trade",
        createdAt,
      });
    }
  }

  it("1-3 & 12. Eligible Free (unclaimed, active trial, expired trial), Pro, and Premium users all see their personal Global Rank and Overall Score in Dashboard Overview", async () => {
    const freeUnclaimed = seedRegisteredUser({ id: 880001, name: "Free Unclaimed Trader" });
    const freeActiveTrial = seedRegisteredUser({ id: 880002, name: "Free Trial Trader" });
    const freeExpiredTrial = seedRegisteredUser({ id: 880003, name: "Free Expired Trial Trader" });
    const proUser = seedRegisteredUser({ id: 880004, name: "Pro Subscriber" });
    const premiumUser = seedRegisteredUser({ id: 880005, name: "Premium Subscriber" });

    // Configure subscription states:
    // 1. freeUnclaimed remains unclaimed
    // 2. freeActiveTrial claims 20-day trial now
    await claimFreeTrialPlan(freeActiveTrial.id, new Date());
    // 3. freeExpiredTrial claimed 35 days ago -> expired trial (free_after_trial)
    const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
    await claimFreeTrialPlan(freeExpiredTrial.id, thirtyFiveDaysAgo);
    // 4. proUser has active Pro subscription
    await activateSubscription(proUser.id, "pro", 30);
    // 5. premiumUser has active Premium subscription
    await activateSubscription(premiumUser.id, "premium", 365);

    // Seed distinct trade counts (1..9 active days) so each user gets a distinct positive Overall Score:
    seedWinningTrades(freeUnclaimed.id, 9);    // Highest score (#1)
    seedWinningTrades(proUser.id, 7);           // Second highest (#2)
    seedWinningTrades(freeActiveTrial.id, 5);   // Third (#3)
    seedWinningTrades(premiumUser.id, 3);       // Fourth (#4)
    seedWinningTrades(freeExpiredTrial.id, 1);  // Fifth (#5)

    // Verify via tRPC `leaderboard.myRank` (used by Dashboard Overview `YOUR GLOBAL RANK` card)
    const freeUnclaimedRank = await appRouter
      .createCaller(createTestContext(freeUnclaimed))
      .leaderboard.myRank();
    expect(freeUnclaimedRank.isRanked).toBe(true);
    expect(freeUnclaimedRank.rank).toBe(1);
    expect(freeUnclaimedRank.overallScore).toBeGreaterThan(0);

    const proRank = await appRouter
      .createCaller(createTestContext(proUser))
      .leaderboard.myRank();
    expect(proRank.isRanked).toBe(true);
    expect(proRank.rank).toBe(2);
    expect(proRank.overallScore).toBeGreaterThan(0);

    const freeTrialRank = await appRouter
      .createCaller(createTestContext(freeActiveTrial))
      .leaderboard.myRank();
    expect(freeTrialRank.isRanked).toBe(true);
    expect(freeTrialRank.rank).toBe(3);
    expect(freeTrialRank.overallScore).toBeGreaterThan(0);

    const premiumRank = await appRouter
      .createCaller(createTestContext(premiumUser))
      .leaderboard.myRank();
    expect(premiumRank.isRanked).toBe(true);
    expect(premiumRank.rank).toBe(4);
    expect(premiumRank.overallScore).toBeGreaterThan(0);

    const freeExpiredRank = await appRouter
      .createCaller(createTestContext(freeExpiredTrial))
      .leaderboard.myRank();
    expect(freeExpiredRank.isRanked).toBe(true);
    expect(freeExpiredRank.rank).toBe(5);
    expect(freeExpiredRank.overallScore).toBeGreaterThan(0);
  });

  it("4-6 & 8 & 11. Free users never appear in public Leaderboard or public traderProfile even when in overall Top 10, while personal Global Rank and public Leaderboard position differ as expected", async () => {
    const topFreeUser = seedRegisteredUser({ id: 880001, name: "Top Free Trader" });
    const secondFreeUser = seedRegisteredUser({ id: 880002, name: "Second Free Trial Trader" });
    const proTrader = seedRegisteredUser({ id: 880003, name: "Paid Pro Trader" });
    const premiumTrader = seedRegisteredUser({ id: 880004, name: "Paid Premium Trader" });
    const expiredProTrader = seedRegisteredUser({ id: 880005, name: "Expired Pro Trader" });

    // Free trial active for secondFreeUser
    await claimFreeTrialPlan(secondFreeUser.id, new Date());
    // Active paid subscriptions for proTrader and premiumTrader
    await activateSubscription(proTrader.id, "pro", 30);
    await activateSubscription(premiumTrader.id, "premium", 365);
    // Expired paid subscription for expiredProTrader (duration -5 days)
    await activateSubscription(expiredProTrader.id, "pro", -5);

    // Give topFreeUser and secondFreeUser the highest performance scores overall
    seedWinningTrades(topFreeUser.id, 9);      // Personal Global Rank #1
    seedWinningTrades(secondFreeUser.id, 7);   // Personal Global Rank #2
    seedWinningTrades(expiredProTrader.id, 5); // Personal Global Rank #3
    seedWinningTrades(proTrader.id, 3);        // Personal Global Rank #4, Public Leaderboard #1
    seedWinningTrades(premiumTrader.id, 1);    // Personal Global Rank #5, Public Leaderboard #2

    // Check personal Global Ranks in Dashboard Overview
    const topFreeMyRank = await getUserGlobalRank(topFreeUser.id);
    const secondFreeMyRank = await getUserGlobalRank(secondFreeUser.id);
    const expiredProMyRank = await getUserGlobalRank(expiredProTrader.id);
    const proMyRank = await getUserGlobalRank(proTrader.id);
    const premiumMyRank = await getUserGlobalRank(premiumTrader.id);

    expect(topFreeMyRank.rank).toBe(1);
    expect(secondFreeMyRank.rank).toBe(2);
    expect(expiredProMyRank.rank).toBe(3);
    expect(proMyRank.rank).toBe(4);
    expect(premiumMyRank.rank).toBe(5);

    // Check Public Global Leaderboard via tRPC `leaderboard.rankings`
    const publicCaller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });
    const publicRankings = await publicCaller.leaderboard.rankings({ timeframe: "all" });

    // Public leaderboard must ONLY contain active Pro and Premium subscribers
    expect(publicRankings.map((r) => r.userId)).toEqual([proTrader.id, premiumTrader.id]);
    expect(publicRankings.some((r) => r.userId === topFreeUser.id)).toBe(false);
    expect(publicRankings.some((r) => r.userId === secondFreeUser.id)).toBe(false);
    expect(publicRankings.some((r) => r.userId === expiredProTrader.id)).toBe(false);

    // On the public paid-only Leaderboard, proTrader is #1 and premiumTrader is #2,
    // while their personal Global Ranks remain #4 and #5 with the exact same Overall Score!
    expect(publicRankings[0].userId).toBe(proTrader.id);
    expect(publicRankings[0].rank).toBe(1);
    expect(publicRankings[0].overallScore).toBe(proMyRank.overallScore);

    expect(publicRankings[1].userId).toBe(premiumTrader.id);
    expect(publicRankings[1].rank).toBe(2);
    expect(publicRankings[1].overallScore).toBe(premiumMyRank.overallScore);

    // Security check (Requirement 11): Public `leaderboard.traderProfile` must reject Free/expired users with NOT_FOUND
    await expect(
      publicCaller.leaderboard.traderProfile({ userId: topFreeUser.id, timeframe: "all" })
    ).rejects.toThrow(/Trader profile not found/);
    await expect(
      publicCaller.leaderboard.traderProfile({ userId: secondFreeUser.id, timeframe: "all" })
    ).rejects.toThrow(/Trader profile not found/);
    await expect(
      publicCaller.leaderboard.traderProfile({ userId: expiredProTrader.id, timeframe: "all" })
    ).rejects.toThrow(/Trader profile not found/);

    // Paid eligible user profile works on public leaderboard
    const proPublicProfile = await publicCaller.leaderboard.traderProfile({
      userId: proTrader.id,
      timeframe: "all",
    });
    expect(proPublicProfile.userId).toBe(proTrader.id);
    expect(proPublicProfile.rank).toBe(1);
  });

  it("7. Preserves existing public Leaderboard Top 10 selection behavior for paid subscribers while computing personal Global Rank across all eligible users", async () => {
    // Create 3 high-scoring Free users and 12 active paid (Pro/Premium) users with strictly ordered timestamps
    for (let i = 0; i < 3; i++) {
      const uid = 880001 + i;
      seedRegisteredUser({ id: uid, name: `Free Elite ${i + 1}` });
      seedWinningTrades(uid, 9, {
        createdAt: new Date(Date.UTC(2026, 4, 1, 0, i, 0)).toISOString(),
      });
    }

    for (let i = 0; i < 12; i++) {
      const uid = 880004 + i;
      seedRegisteredUser({ id: uid, name: `Paid Trader ${i + 1}` });
      await activateSubscription(uid, i % 2 === 0 ? "pro" : "premium", 30);
      seedWinningTrades(uid, 5, {
        createdAt: new Date(Date.UTC(2026, 4, 2, 0, i, 0)).toISOString(),
      });
    }

    const publicTop10 = await getLeaderboardRankings("all");
    expect(publicTop10).toHaveLength(10);
    // All 10 on public leaderboard are paid users (IDs 880004..880013)
    expect(publicTop10.map((t) => t.userId)).toEqual(
      Array.from({ length: 10 }, (_, i) => 880004 + i)
    );
    expect(publicTop10[0].rank).toBe(1);
    expect(publicTop10[9].rank).toBe(10);

    // Meanwhile, personal Global Rank includes all 15 eligible users
    const allGlobal = await getAllGlobalScoredRankings("all");
    expect(allGlobal).toHaveLength(15);

    // The 12th paid user (880015) has personal Global Rank #15
    const twelfthPaidPersonalRank = await getUserGlobalRank(880015);
    expect(twelfthPaidPersonalRank.isRanked).toBe(true);
    expect(twelfthPaidPersonalRank.rank).toBe(15);
  });

  it("9. Excludes email-unverified, inactive/suspended/banned, and zero-score users from both personal Global Rank and public Leaderboard", async () => {
    const unverifiedPaid = seedRegisteredUser({
      id: 880001,
      name: "Unverified Pro",
      emailVerified: false,
    });
    const suspendedFree = seedRegisteredUser({
      id: 880002,
      name: "Suspended Free",
      status: "suspended",
    });
    const adminSuspendedPro = seedRegisteredUser({
      id: 880003,
      name: "Admin Suspended Pro",
    });
    const zeroScorePro = seedRegisteredUser({
      id: 880004,
      name: "Zero Score Pro",
    });
    const noTradesFree = seedRegisteredUser({
      id: 880005,
      name: "No Trades Free",
    });
    const validFree = seedRegisteredUser({
      id: 880006,
      name: "Valid Free",
    });

    await activateSubscription(unverifiedPaid.id, "pro", 30);
    await activateSubscription(adminSuspendedPro.id, "pro", 30);
    await setAccountStatus(adminSuspendedPro.id, "suspended");
    await activateSubscription(zeroScorePro.id, "pro", 30);

    seedWinningTrades(unverifiedPaid.id, 5);
    seedWinningTrades(suspendedFree.id, 5);
    seedWinningTrades(adminSuspendedPro.id, 5);
    // zeroScorePro has 1 losing trade where rules were NOT followed, and weights set only to winRate/profitFactor/ruleAdherence -> score 0
    await saveLeaderboardWeights({
      ruleAdherence: 50,
      disciplineRoutine: 0,
      winRate: 25,
      consistency: 0,
      profitFactor: 25,
    });
    seedWinningTrades(zeroScorePro.id, 1, { pnlPerTrade: -100, followedRules: "No" });
    seedWinningTrades(validFree.id, 3, { pnlPerTrade: 200, followedRules: "Yes" });

    expect(await getUserGlobalRank(unverifiedPaid.id)).toEqual({
      rank: null,
      overallScore: null,
      isRanked: false,
    });
    expect(await getUserGlobalRank(suspendedFree.id)).toEqual({
      rank: null,
      overallScore: null,
      isRanked: false,
    });
    expect(await getUserGlobalRank(adminSuspendedPro.id)).toEqual({
      rank: null,
      overallScore: null,
      isRanked: false,
    });
    expect(await getUserGlobalRank(zeroScorePro.id)).toEqual({
      rank: null,
      overallScore: null,
      isRanked: false,
    });
    expect(await getUserGlobalRank(noTradesFree.id)).toEqual({
      rank: null,
      overallScore: null,
      isRanked: false,
    });

    const validFreeRank = await getUserGlobalRank(validFree.id);
    expect(validFreeRank.isRanked).toBe(true);
    expect(validFreeRank.rank).toBe(1);
    expect(validFreeRank.overallScore).toBeGreaterThan(0);

    const publicBoard = await getLeaderboardRankings("all");
    expect(publicBoard).toHaveLength(0);
  });

  it("10. Preserves tie-ranking, scoring weights, profile name/photo synchronization, and recalculation behavior", async () => {
    const freeTieA = seedRegisteredUser({ id: 880001, name: "Initial Free A" });
    const proTieB = seedRegisteredUser({ id: 880002, name: "Initial Pro B" });
    const proLower = seedRegisteredUser({ id: 880003, name: "Pro Lower" });

    await activateSubscription(proTieB.id, "pro", 30);
    await activateSubscription(proLower.id, "pro", 30);

    // Identical trades & identical timestamps across 4 active days for freeTieA and proTieB -> tied #1 personal Global Rank
    // proLower has 2 active days -> lower score -> competition rank #3
    const fixedTime = "2026-05-15T12:00:00.000Z";
    seedWinningTrades(freeTieA.id, 4, { createdAt: fixedTime });
    seedWinningTrades(proTieB.id, 4, { createdAt: fixedTime });
    seedWinningTrades(proLower.id, 2, { createdAt: fixedTime });

    const rankA = await getUserGlobalRank(freeTieA.id);
    const rankB = await getUserGlobalRank(proTieB.id);
    const rankLower = await getUserGlobalRank(proLower.id);

    // Competition tie-ranking: both tied users get #1, and the next user gets #3
    expect(rankA.rank).toBe(1);
    expect(rankB.rank).toBe(1);
    expect(rankA.overallScore).toBe(rankB.overallScore);
    expect(rankLower.rank).toBe(3);

    // Update trader profile name & avatar and verify synchronization
    await saveTraderProfile({
      userId: proTieB.id,
      openId: proTieB.openId,
      name: "Updated Pro B Name",
      avatar: "https://example.com/avatar-b.png",
      phone: null,
      role: "user",
      language: "en",
      updatedAt: new Date().toISOString(),
    });

    const publicRankings = await getAllLeaderboardRankings("all");
    expect(publicRankings).toHaveLength(2);
    expect(publicRankings[0].userId).toBe(proTieB.id);
    expect(publicRankings[0].name).toBe("Updated Pro B Name");
    expect(publicRankings[0].avatar).toBe("https://example.com/avatar-b.png");
  });
});
