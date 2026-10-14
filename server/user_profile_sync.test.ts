import { describe, it, expect, beforeEach } from "vitest";
import {
  upsertUser,
  getUserByOpenId,
  getUserById,
  updateUserProfile,
  getTraderProfile,
  resetInMemoryUsersForTests,
} from "./features/auth/repo";
import { authRouter } from "./features/auth/router";
import { getAllLeaderboardRankings } from "./features/leaderboard/repo";
import { activateSubscription } from "./features/subscription";
import { inMemoryTraderTrades } from "./features/journal";

describe("User Profile Synchronization & OAuth Protection", () => {
  beforeEach(() => {
    resetInMemoryUsersForTests();
  });

  it("preserves custom display name across subsequent Google OAuth logins and token refreshes", async () => {
    const openId = "google_user_001";
    const googleName = "Google Original Name";
    const googlePhoto = "https://lh3.googleusercontent.com/original.jpg";

    // 1. Initial Google signup / login
    await upsertUser({
      openId,
      name: googleName,
      email: "google001@example.com",
      avatar: googlePhoto,
      loginMethod: "supabase",
    });

    const initialUser = await getUserByOpenId(openId);
    expect(initialUser).toBeDefined();
    expect(initialUser?.name).toBe(googleName);
    expect(initialUser?.avatar).toBe(googlePhoto);

    // 2. User customizes display name to "Alpha Trader"
    await updateUserProfile(initialUser!.id, openId, {
      name: "Alpha Trader",
    });

    const updatedUser = await getUserByOpenId(openId);
    expect(updatedUser?.name).toBe("Alpha Trader");

    // 3. Simulating subsequent Google OAuth login / token refresh:
    // Google passes its own name and photo in metadata
    await upsertUser({
      openId,
      name: googleName, // Google still sends original name
      email: "google001@example.com",
      avatar: googlePhoto,
      loginMethod: "supabase",
    });

    // 4. Assert custom name was NOT overwritten
    const preservedUser = await getUserByOpenId(openId);
    expect(preservedUser?.name).toBe("Alpha Trader");

    // Check getTraderProfile
    const prof = await getTraderProfile(openId);
    expect(prof?.name).toBe("Alpha Trader");
    expect(prof?.isCustomName).toBe(true);

    // Check authRouter.me query
    const caller = authRouter.createCaller({
      user: {
        id: initialUser!.id,
        openId,
        name: googleName, // Stale JWT claims Google's name
        email: "google001@example.com",
        role: "user",
      } as any,
      req: {} as any,
      res: {} as any,
    });

    const me = await caller.me();
    expect(me?.name).toBe("Alpha Trader");
  });

  it("preserves custom uploaded avatar across subsequent Google OAuth logins", async () => {
    const openId = "google_user_002";
    const googlePhoto = "https://lh3.googleusercontent.com/google_photo.jpg";
    const customCloudPhoto = "https://i.ibb.co/custom_avatar_999.webp";

    // 1. Initial Google login
    await upsertUser({
      openId,
      name: "Trader Bob",
      email: "bob@example.com",
      avatar: googlePhoto,
      loginMethod: "supabase",
    });

    const user = (await getUserByOpenId(openId))!;

    // 2. Bob uploads a custom profile photo
    await updateUserProfile(user.id, openId, {
      avatar: customCloudPhoto,
    });

    expect((await getUserByOpenId(openId))?.avatar).toBe(customCloudPhoto);

    // 3. Bob logs in again via Google OAuth
    await upsertUser({
      openId,
      name: "Trader Bob",
      email: "bob@example.com",
      avatar: googlePhoto, // Google sends its avatar
      loginMethod: "supabase",
    });

    // 4. Assert custom photo was NOT overwritten by Google photo
    const reloaded = await getUserByOpenId(openId);
    expect(reloaded?.avatar).toBe(customCloudPhoto);

    const prof = await getTraderProfile(openId);
    expect(prof?.avatar).toBe(customCloudPhoto);
    expect(prof?.isCustomAvatar).toBe(true);
  });

  it("preserves removed avatar (fallback initial) across subsequent Google OAuth logins", async () => {
    const openId = "google_user_003";
    const googlePhoto = "https://lh3.googleusercontent.com/avatar_to_remove.jpg";

    // 1. Initial Google login with photo
    await upsertUser({
      openId,
      name: "Trader Charlie",
      email: "charlie@example.com",
      avatar: googlePhoto,
      loginMethod: "supabase",
    });

    const user = (await getUserByOpenId(openId))!;
    expect(user.avatar).toBe(googlePhoto);

    // 2. Charlie removes their profile photo (wants fallback initial)
    await updateUserProfile(user.id, openId, {
      avatar: null,
    });

    const userAfterRemoval = await getUserByOpenId(openId);
    expect(userAfterRemoval?.avatar).toBeNull();

    // 3. Subsequent Google OAuth login sends Google's original photo again
    await upsertUser({
      openId,
      name: "Trader Charlie",
      email: "charlie@example.com",
      avatar: googlePhoto,
      loginMethod: "supabase",
    });

    // 4. Assert avatar stays null (does NOT resurrect Google's photo)
    const userAfterRelogin = await getUserByOpenId(openId);
    expect(userAfterRelogin?.avatar).toBeNull();

    const prof = await getTraderProfile(openId);
    expect(prof?.avatar).toBeNull();
    expect(prof?.isCustomAvatar).toBe(true);

    // Check auth.me procedure
    const caller = authRouter.createCaller({
      user: {
        id: user.id,
        openId,
        name: "Trader Charlie",
        email: "charlie@example.com",
        avatar: googlePhoto, // Stale context has google photo
        role: "user",
      } as any,
      req: {} as any,
      res: {} as any,
    });

    const me = await caller.me();
    expect(me?.avatar).toBeNull();
  });

  it("reflects custom profile name and photo on the Global Leaderboard", async () => {
    const openId = "google_user_004";

    await upsertUser({
      openId,
      name: "Google Name 4",
      email: "user4@example.com",
      avatar: "https://lh3.googleusercontent.com/old.jpg",
      loginMethod: "supabase",
    });

    const user = (await getUserByOpenId(openId))!;

    // Customize name and photo
    await updateUserProfile(user.id, openId, {
      name: "Market Wizard",
      avatar: "https://i.ibb.co/wizard.webp",
      bio: "Master of price action and market structure.",
    });

    // Activate Pro subscription so user is eligible for leaderboard
    await activateSubscription(user.id, "pro", 30);

    // Subsequent Google login happens
    await upsertUser({
      openId,
      name: "Google Name 4",
      email: "user4@example.com",
      avatar: "https://lh3.googleusercontent.com/old.jpg",
      loginMethod: "supabase",
    });

    // Seed a winning trade for user so they meet the minimum trade requirement
    inMemoryTraderTrades.push({
      id: `trade_${user.id}_1`,
      userId: user.id,
      date: "2026-05-15",
      pair: "XAUUSD",
      direction: "Long",
      entryPrice: 2300,
      stopLoss: 2290,
      takeProfit: 2330,
      exitPrice: 2320,
      pnl: 200,
      followedRules: "Yes",
      outcome: "Win",
    });

    // Query leaderboard rankings
    const rankings = await getAllLeaderboardRankings("all");
    const traderEntry = rankings.find((r) => r.openId === openId || r.userId === user.id);

    expect(traderEntry).toBeDefined();
    expect(traderEntry?.name).toBe("Market Wizard");
    expect(traderEntry?.avatar).toBe("https://i.ibb.co/wizard.webp");
    expect(traderEntry?.bio).toBe("Master of price action and market structure.");
  });

  it("maintains strict data isolation between multiple users", async () => {
    const userAOpenId = "user_isolation_A";
    const userBOpenId = "user_isolation_B";

    await upsertUser({
      openId: userAOpenId,
      name: "User A",
      email: "a@example.com",
      loginMethod: "supabase",
    });

    await upsertUser({
      openId: userBOpenId,
      name: "User B",
      email: "b@example.com",
      loginMethod: "supabase",
    });

    const userA = (await getUserByOpenId(userAOpenId))!;
    const userB = (await getUserByOpenId(userBOpenId))!;

    // Modify User A only
    await updateUserProfile(userA.id, userAOpenId, {
      name: "Modified Name A",
      avatar: "https://i.ibb.co/avatarA.webp",
    });

    const updatedA = await getUserByOpenId(userAOpenId);
    const unchangedB = await getUserByOpenId(userBOpenId);

    expect(updatedA?.name).toBe("Modified Name A");
    expect(updatedA?.avatar).toBe("https://i.ibb.co/avatarA.webp");

    expect(unchangedB?.name).toBe("User B");
    expect(unchangedB?.avatar).toBeNull();
  });

  it("validates display name length correctly in updateProfile mutation", async () => {
    const openId = "val_user_001";
    await upsertUser({
      openId,
      name: "Valid User",
      email: "val@example.com",
      loginMethod: "supabase",
    });

    const user = (await getUserByOpenId(openId))!;

    const caller = authRouter.createCaller({
      user: {
        id: user.id,
        openId,
        name: "Valid User",
        email: "val@example.com",
        role: "user",
      } as any,
      req: {} as any,
      res: {} as any,
    });

    // Too short (1 char) should fail validation
    await expect(
      caller.updateProfile({
        name: "X",
      })
    ).rejects.toThrow();

    // Valid name update (2+ chars)
    const result = await caller.updateProfile({
      name: "Valid New Name",
    });

    expect(result.success).toBe(true);
    expect(result.user?.name).toBe("Valid New Name");
  });
});
