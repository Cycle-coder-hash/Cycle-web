import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { inMemoryUsers, saveTraderProfile } from "./features/auth";
import { activateSubscription, resetInMemorySubscriptionStateForTests } from "./features/subscription";
import { inMemoryTraderTrades, inMemoryJournalConfigs } from "./features/journal";
import { inMemoryDisciplineCompletions } from "./features/discipline";

function createMockAuthContext(user: {
  id: number;
  openId: string;
  email: string;
  name: string;
  role?: "user" | "admin";
}): TrpcContext {
  const createdAt = new Date("2026-06-01T12:00:00.000Z");
  return {
    user: {
      id: user.id,
      openId: user.openId,
      email: user.email,
      name: user.name,
      loginMethod: "email",
      role: user.role || "user",
      accountStatus: "active",
      language: "en",
      emailVerified: true,
      createdAt,
      updatedAt: createdAt,
      lastSignedIn: createdAt,
    } as any,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("20-Word User Bio Feature & Regression Suite", () => {
  const USER_A_ID = 881001;
  const USER_B_ID = 881002;
  const USER_A_OPENID = "usr_881001_bio";
  const USER_B_OPENID = "usr_881002_bio";

  beforeEach(() => {
    resetInMemorySubscriptionStateForTests(USER_A_ID);
    resetInMemorySubscriptionStateForTests(USER_B_ID);

    inMemoryUsers.set(USER_A_OPENID, {
      id: USER_A_ID,
      openId: USER_A_OPENID,
      name: "Alpha Trader",
      email: "alpha@example.com",
      role: "user",
      accountStatus: "active",
      language: "en",
      emailVerified: true,
      loginMethod: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any);

    inMemoryUsers.set(USER_B_OPENID, {
      id: USER_B_ID,
      openId: USER_B_OPENID,
      name: "Beta Trader",
      email: "beta@example.com",
      role: "user",
      accountStatus: "active",
      language: "en",
      emailVerified: true,
      loginMethod: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any);
  });

  it("1. Allows a user to save a Bio containing fewer than 20 words", async () => {
    const caller = appRouter.createCaller(
      createMockAuthContext({
        id: USER_A_ID,
        openId: USER_A_OPENID,
        email: "alpha@example.com",
        name: "Alpha Trader",
      })
    );

    const bioInput = "Disciplined ICT price action scalper. Risking 1% per trade.";
    const result = await caller.auth.updateProfile({ bio: bioInput });
    expect(result.success).toBe(true);

    const settings = await caller.auth.getSettings();
    expect(settings.bio).toBe(bioInput);
  });

  it("2. Allows saving a Bio containing exactly 20 words", async () => {
    const caller = appRouter.createCaller(
      createMockAuthContext({
        id: USER_A_ID,
        openId: USER_A_OPENID,
        email: "alpha@example.com",
        name: "Alpha Trader",
      })
    );

    const exact20Words = "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty.";
    const wordCount = exact20Words.trim().split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBe(20);

    const result = await caller.auth.updateProfile({ bio: exact20Words });
    expect(result.success).toBe(true);

    const settings = await caller.auth.getSettings();
    expect(settings.bio).toBe(exact20Words);
  });

  it("3. Rejects a Bio containing more than 20 words with a clear validation error", async () => {
    const caller = appRouter.createCaller(
      createMockAuthContext({
        id: USER_A_ID,
        openId: USER_A_OPENID,
        email: "alpha@example.com",
        name: "Alpha Trader",
      })
    );

    const over20Words = "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone.";
    const wordCount = over20Words.trim().split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBe(21);

    await expect(caller.auth.updateProfile({ bio: over20Words })).rejects.toThrow("Bio cannot exceed 20 words");
  });

  it("4. Allows editing or removing a Bio at any time", async () => {
    const caller = appRouter.createCaller(
      createMockAuthContext({
        id: USER_A_ID,
        openId: USER_A_OPENID,
        email: "alpha@example.com",
        name: "Alpha Trader",
      })
    );

    // Initial save
    await caller.auth.updateProfile({ bio: "Initial short bio." });
    let settings = await caller.auth.getSettings();
    expect(settings.bio).toBe("Initial short bio.");

    // Edit bio
    await caller.auth.updateProfile({ bio: "Updated trading style: London session only." });
    settings = await caller.auth.getSettings();
    expect(settings.bio).toBe("Updated trading style: London session only.");

    // Remove bio (null or empty string)
    await caller.auth.updateProfile({ bio: null });
    settings = await caller.auth.getSettings();
    expect(settings.bio).toBeNull();
  });

  it("5. Persists the saved Bio across refresh and new login sessions without overwriting unrelated fields", async () => {
    const caller1 = appRouter.createCaller(
      createMockAuthContext({
        id: USER_A_ID,
        openId: USER_A_OPENID,
        email: "alpha@example.com",
        name: "Alpha Trader",
      })
    );

    await caller1.auth.updateProfile({
      name: "Alpha Master",
      bio: "Mastering swing trading psychology.",
    });

    // Simulate new session
    const caller2 = appRouter.createCaller(
      createMockAuthContext({
        id: USER_A_ID,
        openId: USER_A_OPENID,
        email: "alpha@example.com",
        name: "Alpha Master",
      })
    );

    const settingsAfterNewSession = await caller2.auth.getSettings();
    expect(settingsAfterNewSession.name).toBe("Alpha Master");
    expect(settingsAfterNewSession.bio).toBe("Mastering swing trading psychology.");

    // Updating only the name must preserve the bio
    await caller2.auth.updateProfile({ name: "Alpha Grandmaster" });
    const settingsAfterNameUpdate = await caller2.auth.getSettings();
    expect(settingsAfterNameUpdate.name).toBe("Alpha Grandmaster");
    expect(settingsAfterNameUpdate.bio).toBe("Mastering swing trading psychology.");
  });

  it("6. Strictly isolates Bio per user (User A's bio never leaks to User B)", async () => {
    const callerA = appRouter.createCaller(
      createMockAuthContext({
        id: USER_A_ID,
        openId: USER_A_OPENID,
        email: "alpha@example.com",
        name: "Alpha Trader",
      })
    );

    const callerB = appRouter.createCaller(
      createMockAuthContext({
        id: USER_B_ID,
        openId: USER_B_OPENID,
        email: "beta@example.com",
        name: "Beta Trader",
      })
    );

    await callerA.auth.updateProfile({ bio: "Alpha's private trade philosophy." });
    await callerB.auth.updateProfile({ bio: "Beta's systematic momentum playbook." });

    const settingsA = await callerA.auth.getSettings();
    const settingsB = await callerB.auth.getSettings();

    expect(settingsA.bio).toBe("Alpha's private trade philosophy.");
    expect(settingsB.bio).toBe("Beta's systematic momentum playbook.");

    // User A clears bio, User B remains intact
    await callerA.auth.updateProfile({ bio: null });
    expect((await callerA.auth.getSettings()).bio).toBeNull();
    expect((await callerB.auth.getSettings()).bio).toBe("Beta's systematic momentum playbook.");
  });

  it("7. Displays Bio on the Global Leaderboard without affecting rankings or eligibility", async () => {
    // Grant Pro subscriptions to qualify for public leaderboard
    activateSubscription(USER_A_ID, "pro", 30, true);
    activateSubscription(USER_B_ID, "pro", 30, true);

    inMemoryJournalConfigs.set(USER_A_ID, { userId: USER_A_ID, startingBalance: 10000, currency: "$" });
    inMemoryJournalConfigs.set(USER_B_ID, { userId: USER_B_ID, startingBalance: 10000, currency: "$" });

    // Seed trades
    inMemoryTraderTrades.push(
      {
        id: "trade_a_1",
        userId: USER_A_ID,
        pair: "EURUSD",
        direction: "BUY",
        date: "2026-06-01",
        pnl: 500,
        followedRules: "Yes",
      } as any,
      {
        id: "trade_b_1",
        userId: USER_B_ID,
        pair: "GBPUSD",
        direction: "BUY",
        date: "2026-06-01",
        pnl: 300,
        followedRules: "Yes",
      } as any
    );

    inMemoryDisciplineCompletions.push(
      { userId: USER_A_ID, date: "2026-06-01", completed: true } as any,
      { userId: USER_B_ID, date: "2026-06-01", completed: true } as any
    );

    // User A has bio, User B has none
    const callerA = appRouter.createCaller(
      createMockAuthContext({
        id: USER_A_ID,
        openId: USER_A_OPENID,
        email: "alpha@example.com",
        name: "Alpha Trader",
      })
    );
    await callerA.auth.updateProfile({ bio: "Disciplined trend follower aiming for consistency." });

    const callerB = appRouter.createCaller(
      createMockAuthContext({
        id: USER_B_ID,
        openId: USER_B_OPENID,
        email: "beta@example.com",
        name: "Beta Trader",
      })
    );
    await callerB.auth.updateProfile({ bio: null });

    const rankings = await callerA.leaderboard.rankings({ timeframe: "all" });
    const rankedA = rankings.find((r) => r.userId === USER_A_ID);
    const rankedB = rankings.find((r) => r.userId === USER_B_ID);

    expect(rankedA).toBeDefined();
    expect(rankedB).toBeDefined();

    // Bio matches user data
    expect(rankedA?.bio).toBe("Disciplined trend follower aiming for consistency.");
    expect(rankedB?.bio).toBeNull();

    // Trader profile query also includes bio
    const statsA = await callerA.leaderboard.traderProfile({ userId: USER_A_ID, timeframe: "all" });
    expect(statsA.bio).toBe("Disciplined trend follower aiming for consistency.");

    const statsB = await callerA.leaderboard.traderProfile({ userId: USER_B_ID, timeframe: "all" });
    expect(statsB.bio).toBeNull();
  });
});
