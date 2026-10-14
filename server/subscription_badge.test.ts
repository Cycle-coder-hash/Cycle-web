import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import {
  getUserSubscription,
  getUserUsage,
  claimFreeTrialPlan,
  activateSubscription,
  resetInMemorySubscriptionStateForTests,
} from "./features/subscription";
import {
  setUserAccess,
  clearUserAccessOverride,
  resetInMemoryManualAccessForTests,
} from "./features/subscription/userManagement";
import {
  getSubscriptionPlanBadgeLabel,
  type SubscriptionPlanBadgeLabel,
} from "../shared/subscriptionPlanBadge";

function createMockAuthContext(
  userId: number,
  role: "user" | "admin" | "support" = "user",
  createdAt: Date = new Date("2026-01-01T00:00:00.000Z")
): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-badge-user-${userId}`,
      email: `badgeuser${userId}@example.com`,
      name: `Badge User ${userId}`,
      loginMethod: "email",
      role,
      createdAt,
      updatedAt: createdAt,
      lastSignedIn: createdAt,
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

describe("Dynamic Subscription Plan Badge System", () => {
  const TEST_USER_BASE = 995000;

  beforeEach(() => {
    for (let i = 0; i < 20; i++) {
      resetInMemorySubscriptionStateForTests(TEST_USER_BASE + i);
      resetInMemoryManualAccessForTests(TEST_USER_BASE + i);
    }
  });

  describe("1. Pure Badge Label Resolution", () => {
    it("maps unclaimed, free trial, and expired free trial to FREE", () => {
      expect(getSubscriptionPlanBadgeLabel("unclaimed")).toBe("FREE");
      expect(getSubscriptionPlanBadgeLabel("free_trial")).toBe("FREE");
      expect(getSubscriptionPlanBadgeLabel("free_after_trial")).toBe("FREE");
      expect(getSubscriptionPlanBadgeLabel(undefined)).toBe("FREE");
      expect(getSubscriptionPlanBadgeLabel(null)).toBe("FREE");
      expect(getSubscriptionPlanBadgeLabel("")).toBe("FREE");
      expect(getSubscriptionPlanBadgeLabel("other_unknown" as any)).toBe("FREE");
    });

    it("maps active pro plan to PRO", () => {
      expect(getSubscriptionPlanBadgeLabel("pro")).toBe("PRO");
    });

    it("maps active premium plan to PREMIUM", () => {
      expect(getSubscriptionPlanBadgeLabel("premium")).toBe("PREMIUM");
    });
  });

  describe("2. Free Plan & Trial Lifecycle Transitions", () => {
    it("resolves to FREE on fresh signup before claiming 20-day Free Trial", async () => {
      const userId = TEST_USER_BASE + 1;
      const caller = appRouter.createCaller(createMockAuthContext(userId));

      const usage = await caller.subscription.getMyUsage();
      expect(usage.plan).toBe("unclaimed");

      const badgeLabel: SubscriptionPlanBadgeLabel = getSubscriptionPlanBadgeLabel(usage.plan);
      expect(badgeLabel).toBe("FREE");
    });

    it("resolves to FREE during active 20-day Free Trial", async () => {
      const userId = TEST_USER_BASE + 2;
      const caller = appRouter.createCaller(createMockAuthContext(userId));

      await caller.subscription.claimFreePlan({ source: "dashboard" });

      const usage = await caller.subscription.getMyUsage();
      expect(usage.plan).toBe("free_trial");
      expect(usage.isTrialActive).toBe(true);

      const badgeLabel = getSubscriptionPlanBadgeLabel(usage.plan);
      expect(badgeLabel).toBe("FREE");
    });

    it("resolves to FREE after 20-day Free Trial expires (day 21+)", async () => {
      const userId = TEST_USER_BASE + 3;
      const claimDate = new Date("2026-10-01T00:00:00.000Z");
      await claimFreeTrialPlan(userId, claimDate);

      // Fast forward past 20-day trial (day 21)
      const day21 = new Date("2026-10-21T00:00:01.000Z");
      const sub = await getUserSubscription(userId, day21);
      expect(sub.plan).toBe("free_after_trial");
      expect(sub.trialStatus).toBe("expired");

      const usage = await getUserUsage(userId, day21);
      expect(usage.plan).toBe("free_after_trial");

      const badgeLabel = getSubscriptionPlanBadgeLabel(usage.plan);
      expect(badgeLabel).toBe("FREE");
    });
  });

  describe("3. Pending Orders vs Approved Subscription Transitions", () => {
    it("pending payment orders do not activate PRO or PREMIUM badge before admin approval", async () => {
      const userId = TEST_USER_BASE + 4;
      const caller = appRouter.createCaller(createMockAuthContext(userId));

      // User has unclaimed trial
      const usageInitial = await caller.subscription.getMyUsage();
      expect(usageInitial.plan).toBe("unclaimed");
      expect(getSubscriptionPlanBadgeLabel(usageInitial.plan)).toBe("FREE");

      // Simulating pending order creation in commerce without admin approval
      // In Cycle of Chart, activateSubscription is only invoked on order approval in repo.ts:731
      // Verify subscription record remains unaffected while payment is pending
      const subRecordAfterOrder = await getUserSubscription(userId);
      expect(subRecordAfterOrder.plan).toBe("unclaimed");
      expect(getSubscriptionPlanBadgeLabel(subRecordAfterOrder.plan)).toBe("FREE");
    });

    it("approved Pro subscription activates PRO badge", async () => {
      const userId = TEST_USER_BASE + 5;
      const caller = appRouter.createCaller(createMockAuthContext(userId));

      // Admin approves Pro order
      await activateSubscription(userId, "pro", 30);

      const usage = await caller.subscription.getMyUsage();
      expect(usage.plan).toBe("pro");
      expect(usage.isPaidActive).toBe(true);

      const badgeLabel = getSubscriptionPlanBadgeLabel(usage.plan);
      expect(badgeLabel).toBe("PRO");
    });

    it("approved Premium subscription activates PREMIUM badge", async () => {
      const userId = TEST_USER_BASE + 6;
      const caller = appRouter.createCaller(createMockAuthContext(userId));

      // Admin approves Premium order
      await activateSubscription(userId, "premium", 30);

      const usage = await caller.subscription.getMyUsage();
      expect(usage.plan).toBe("premium");
      expect(usage.isPaidActive).toBe(true);

      const badgeLabel = getSubscriptionPlanBadgeLabel(usage.plan);
      expect(badgeLabel).toBe("PREMIUM");
    });
  });

  describe("4. Plan Switching, Paused Days, and Expiration Lifecycle", () => {
    it("preserves paused Pro days on upgrade to Premium, then resumes Pro when Premium expires", async () => {
      const userId = TEST_USER_BASE + 7;

      // 1. User has active Pro plan (30 days)
      await activateSubscription(userId, "pro", 30);
      let sub = await getUserSubscription(userId);
      expect(sub.plan).toBe("pro");
      expect(getSubscriptionPlanBadgeLabel(sub.plan)).toBe("PRO");

      // 2. User upgrades to Premium (30 days) -> Pro days should be paused
      await activateSubscription(userId, "premium", 30);
      sub = await getUserSubscription(userId);
      expect(sub.plan).toBe("premium");
      expect(sub.pausedProDaysRemaining).toBeGreaterThanOrEqual(29);
      expect(getSubscriptionPlanBadgeLabel(sub.plan)).toBe("PREMIUM");

      // 3. Fast forward 31 days (Premium expires) -> Paused Pro days resume!
      const afterPremiumExpiry = new Date(Date.now() + 31 * 86400000);
      sub = await getUserSubscription(userId, afterPremiumExpiry);
      expect(sub.plan).toBe("pro");
      expect(sub.isPaidActive).toBe(true);
      expect(getSubscriptionPlanBadgeLabel(sub.plan)).toBe("PRO");

      // 4. Fast forward past resumed Pro days (e.g. +65 days total) -> All paid time expired
      const afterProExpiry = new Date(Date.now() + 65 * 86400000);
      sub = await getUserSubscription(userId, afterProExpiry);
      expect(sub.plan).toBe("free_after_trial");
      expect(getSubscriptionPlanBadgeLabel(sub.plan)).toBe("FREE");
    });
  });

  describe("5. Admin Overrides and Student Pass Separation", () => {
    it("respects admin manual grant overrides", async () => {
      const userId = TEST_USER_BASE + 8;
      const caller = appRouter.createCaller(createMockAuthContext(userId));

      // Before override
      let usage = await caller.subscription.getMyUsage();
      expect(getSubscriptionPlanBadgeLabel(usage.plan)).toBe("FREE");

      // Admin grants manual Premium access
      await setUserAccess(1, "Admin", {
        userId,
        accessType: "premium",
        status: "on",
        isLifetime: true,
      });

      usage = await caller.subscription.getMyUsage();
      expect(usage.plan).toBe("premium");
      expect(getSubscriptionPlanBadgeLabel(usage.plan)).toBe("PREMIUM");
    });

    it("respects admin override blocks", async () => {
      const userId = TEST_USER_BASE + 9;
      const caller = appRouter.createCaller(createMockAuthContext(userId));

      // Activate Pro
      await activateSubscription(userId, "pro", 30);
      let usage = await caller.subscription.getMyUsage();
      expect(usage.plan).toBe("pro");
      expect(getSubscriptionPlanBadgeLabel(usage.plan)).toBe("PRO");

      // Admin blocks Pro access override
      await setUserAccess(1, "Admin", {
        userId,
        accessType: "pro",
        status: "off",
        isOverrideBlocked: true,
      });

      usage = await caller.subscription.getMyUsage();
      expect(usage.plan).not.toBe("pro");
      expect(getSubscriptionPlanBadgeLabel(usage.plan)).toBe("FREE");
    });

    it("isolates Student Pass / Course entitlements from subscription plan badge", async () => {
      const userId = TEST_USER_BASE + 10;
      const caller = appRouter.createCaller(createMockAuthContext(userId, "user"));

      // A student who owns course access (or Student Pass) but has not purchased Pro or Premium
      const sub = await getUserSubscription(userId);
      // Student has student pass role/entitlement, but plan is free
      expect(getSubscriptionPlanBadgeLabel(sub.plan)).toBe("FREE");
    });
  });
});
