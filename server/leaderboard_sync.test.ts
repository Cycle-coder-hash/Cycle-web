import { describe, expect, it } from "vitest";
import { deriveNumericIdFromOpenId } from "../shared/const";
import {
  upsertUser,
  getUserByOpenId,
  updateUserProfile,
  syncUserTrades,
  getLeaderboardRankings,
} from "./db";

describe("Global Leaderboard & Profile Sync Integrity", () => {
  it("deriveNumericIdFromOpenId produces stable, unique, non-colliding IDs", () => {
    const idA = deriveNumericIdFromOpenId("usr_supabase_user_alpha_111");
    const idB = deriveNumericIdFromOpenId("usr_supabase_user_beta_222");
    const idC = deriveNumericIdFromOpenId("usr_supabase_user_gamma_333");

    // Must be positive integers >= 1000
    expect(idA).toBeGreaterThanOrEqual(1000);
    expect(idB).toBeGreaterThanOrEqual(1000);
    expect(idC).toBeGreaterThanOrEqual(1000);

    // Must NOT be the hardcoded 1
    expect(idA).not.toBe(1);
    expect(idB).not.toBe(1);
    expect(idC).not.toBe(1);

    // Must be unique per user
    expect(idA).not.toBe(idB);
    expect(idB).not.toBe(idC);
    expect(idA).not.toBe(idC);

    // Must be completely deterministic across multiple calls
    expect(deriveNumericIdFromOpenId("usr_supabase_user_alpha_111")).toBe(idA);
    expect(deriveNumericIdFromOpenId("usr_supabase_user_beta_222")).toBe(idB);
  });

  it("registers distinct users with independent profiles and avatars", async () => {
    const userAOpenId = "test_user_alpha_open_id";
    const userBOpenId = "test_user_beta_open_id";
    const userCOpenId = "test_user_gamma_open_id";

    const avatarA = "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAkA4JaQAA3AA/vuUAAA=";
    const avatarB = "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAAAwAQCdASoBAAEAAkA4JaQAA3AA/vuUAAA=";

    // 1. Register User A with Avatar A
    await upsertUser({
      openId: userAOpenId,
      name: "Alpha Trader",
      email: "alpha@test.com",
      avatar: avatarA,
      role: "user",
      language: "en",
    });

    // 2. Register User B with Avatar B
    await upsertUser({
      openId: userBOpenId,
      name: "Beta Scalper",
      email: "beta@test.com",
      avatar: avatarB,
      role: "user",
      language: "en",
    });

    // 3. Register User C with no avatar
    await upsertUser({
      openId: userCOpenId,
      name: "Gamma Swing",
      email: "gamma@test.com",
      avatar: null,
      role: "user",
      language: "en",
    });

    // Fetch users
    const fetchedA = await getUserByOpenId(userAOpenId);
    const fetchedB = await getUserByOpenId(userBOpenId);
    const fetchedC = await getUserByOpenId(userCOpenId);

    expect(fetchedA).toBeDefined();
    expect(fetchedB).toBeDefined();
    expect(fetchedC).toBeDefined();

    // Verify User A has Avatar A, User B has Avatar B, User C has null
    expect(fetchedA?.avatar).toBe(avatarA);
    expect(fetchedB?.avatar).toBe(avatarB);
    expect(fetchedC?.avatar).toBeNull();

    // Verify IDs are completely distinct
    expect(fetchedA?.id).not.toBe(fetchedB?.id);
    expect(fetchedB?.id).not.toBe(fetchedC?.id);
    expect(fetchedA?.id).not.toBe(1);
    expect(fetchedB?.id).not.toBe(1);

    // 4. Update User A's avatar only
    const avatarA2 = "data:image/webp;base64,UPDATED_AVATAR_A2";
    await updateUserProfile(fetchedA!.id, userAOpenId, {
      name: "Alpha Master Trader",
      avatar: avatarA2,
    });

    // Verify User A has updated avatar and name
    const updatedA = await getUserByOpenId(userAOpenId);
    expect(updatedA?.name).toBe("Alpha Master Trader");
    expect(updatedA?.avatar).toBe(avatarA2);

    // Verify User B and User C are completely untouched and independent
    const recheckB = await getUserByOpenId(userBOpenId);
    const recheckC = await getUserByOpenId(userCOpenId);
    expect(recheckB?.name).toBe("Beta Scalper");
    expect(recheckB?.avatar).toBe(avatarB);
    expect(recheckC?.name).toBe("Gamma Swing");
    expect(recheckC?.avatar).toBeNull();
  }, 30000);

  it("only displays real users with real trades and ranks them by performance", async () => {
    const userAOpenId = "test_user_alpha_open_id";
    const fetchedA = await getUserByOpenId(userAOpenId);
    expect(fetchedA).toBeDefined();

    // Sync high performance trades for User A
    await syncUserTrades(fetchedA!.id, [
      {
        id: "tr_a_1",
        pair: "EUR/USD",
        direction: "Buy",
        pnl: 550,
        followedRules: "Yes",
        date: "2026-09-18",
        timeframe: "15M",
        entryPrice: 1.0820,
        exitPrice: 1.0875,
        stopLoss: 1.0805,
        takeProfit: 1.0875,
      },
      {
        id: "tr_a_2",
        pair: "EUR/USD",
        direction: "Sell",
        pnl: 420,
        followedRules: "Yes",
        date: "2026-09-17",
        timeframe: "15M",
        entryPrice: 1.0910,
        exitPrice: 1.0868,
        stopLoss: 1.0925,
        takeProfit: 1.0865,
      },
      {
        id: "tr_a_3",
        pair: "EUR/USD",
        direction: "Buy",
        pnl: 480,
        followedRules: "Yes",
        date: "2026-09-16",
        timeframe: "15M",
        entryPrice: 1.0830,
        exitPrice: 1.0878,
        stopLoss: 1.0815,
        takeProfit: 1.0880,
      },
    ]);

    const rankings = await getLeaderboardRankings("all");

    // All entries must have real trades
    for (const trader of rankings) {
      expect(trader.totalTrades).toBeGreaterThan(0);
    }

    // Ranks must be sequential 1, 2, 3...
    for (let i = 0; i < rankings.length; i++) {
      expect(rankings[i]?.rank).toBe(i + 1);
    }

    // Scores must be descending
    for (let i = 0; i < rankings.length - 1; i++) {
      expect(rankings[i]!.overallScore).toBeGreaterThanOrEqual(rankings[i + 1]!.overallScore);
    }

    // Find User A in rankings
    const traderAEntry = rankings.find((r) => r.userId === fetchedA!.id);
    expect(traderAEntry).toBeDefined();
    if (traderAEntry) {
      expect(traderAEntry.name).toBe("Alpha Master Trader");
      expect(traderAEntry.winRate).toBe(100);
      expect(traderAEntry.ruleComplianceRate).toBe(100);
      expect(traderAEntry.totalTrades).toBe(3);
    }
  }, 30000);

  it("tracks custom journal starting balance, updates live equity and gain percentage", async () => {
    const userAOpenId = "test_user_alpha_open_id";
    const fetchedA = await getUserByOpenId(userAOpenId);
    expect(fetchedA).toBeDefined();

    // User A sets a $5,000 starting balance in their journal with trades
    await syncUserTrades(
      fetchedA!.id,
      [
        {
          id: "tr_a_bal_1",
          pair: "EUR/USD",
          direction: "Buy",
          pnl: 1000,
          followedRules: "Yes",
          date: "2026-09-18",
        },
      ],
      5000,
      "$",
      "Pro SMC Book"
    );

    const rankings = await getLeaderboardRankings("all");
    const traderA = rankings.find((r) => r.userId === fetchedA!.id);
    expect(traderA).toBeDefined();
    if (traderA) {
      expect(traderA.startingBalance).toBe(5000);
      expect(traderA.currentBalance).toBeGreaterThan(5000);
      expect(traderA.gainPercent).toBeGreaterThan(0);
    }
  }, 30000);
});
