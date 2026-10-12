import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import {
  FREE_TRIAL_DURATION_DAYS,
  FREE_TRIAL_DURATION_MS,
  getUserSubscription,
  getUserUsage,
  claimFreeTrialPlan,
  canCreateJournalBook,
  canCreateTradeEntry,
  canCreateNotebookPage,
  canSaveNotebookContent,
  activateSubscription,
  resetInMemorySubscriptionStateForTests,
} from "./features/subscription";

function createMockAuthContext(userId: number, createdAt: Date = new Date("2026-01-01T00:00:00.000Z")): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-claim-user-${userId}`,
      email: `claimuser${userId}@example.com`,
      name: `Claim Tester ${userId}`,
      loginMethod: "email",
      role: "user",
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

describe("20-Day Explicitly Claimed Free Plan Trial System", () => {
  const TEST_USER_BASE = 990000;

  beforeEach(() => {
    for (let i = 0; i < 30; i++) {
      resetInMemorySubscriptionStateForTests(TEST_USER_BASE + i);
    }
  });

  it("1-5. Does NOT start a trial automatically on signup, login, dashboard visit, store visit, or visiting Journal/Notebook", async () => {
    const userId = TEST_USER_BASE + 1;
    const caller = appRouter.createCaller(createMockAuthContext(userId));

    // Simulate multiple read queries across Dashboard, Store, Journal, and Notebook
    const usageOnFirstVisit = await caller.subscription.getMyUsage();
    expect(usageOnFirstVisit.plan).toBe("unclaimed");
    expect(usageOnFirstVisit.trialStatus).toBe("unclaimed");
    expect(usageOnFirstVisit.trialClaimedAt).toBeNull();
    expect(usageOnFirstVisit.trialStartsAt).toBeNull();
    expect(usageOnFirstVisit.trialEndsAt).toBeNull();
    expect(usageOnFirstVisit.trialDurationDays).toBe(20);
    expect(usageOnFirstVisit.daysLeft).toBe(0);

    // Repeatedly reading subscription or checking access must never auto-claim
    const subDirect = await getUserSubscription(userId);
    expect(subDirect.plan).toBe("unclaimed");
    expect(subDirect.trialStatus).toBe("unclaimed");
    expect(subDirect.trialClaimedAt).toBeNull();

    const checkJournal = await caller.subscription.checkAccess({
      feature: "trade_entry",
      currentCount: 0,
    });
    expect(checkJournal.allowed).toBe(false);
    expect((checkJournal as any).code).toBe("TRIAL_UNCLAIMED");

    const checkNotebook = await caller.subscription.checkAccess({
      feature: "notebook_content",
      currentCount: 0,
    });
    expect(checkNotebook.allowed).toBe(false);
    expect((checkNotebook as any).code).toBe("TRIAL_UNCLAIMED");

    // Still unclaimed after all read/check calls
    const usageAfterChecks = await caller.subscription.getMyUsage();
    expect(usageAfterChecks.plan).toBe("unclaimed");
    expect(usageAfterChecks.trialStatus).toBe("unclaimed");
  });

  it("6-8. Blocks Journal content creation before claim, and allows Journal creation after claiming from Journal", async () => {
    const userId = TEST_USER_BASE + 2;
    const caller = appRouter.createCaller(createMockAuthContext(userId));

    // Attempting to create a quick journal entry or sync trades before claiming is rejected by server
    await expect(
      caller.customer.createJournal({
        title: "EUR/USD Long 1:3 RR",
        content: "Took London Open sweep setup",
        setup: "CRT Range Model",
        result: "Win",
      })
    ).rejects.toThrow(/Activate your 20-day Free Trial/i);

    await expect(
      caller.customer.saveJournalBooks({
        books: [{ id: "book-1", name: "Main Book", startingBalance: 10000, rules: [] }],
      })
    ).rejects.toThrow(/Activate your 20-day Free Trial/i);

    await expect(
      caller.customer.syncTrades({
        trades: [
          {
            id: "trade-1",
            pair: "EUR/USD",
            direction: "Long",
            entryDate: "2026-10-12",
            result: "Win",
          },
        ],
      })
    ).rejects.toThrow(/Activate your 20-day Free Trial/i);

    // User explicitly claims Free Plan from Journal modal
    const claimResult = await caller.subscription.claimFreePlan({ source: "journal" });
    expect(claimResult.success).toBe(true);
    expect(claimResult.alreadyClaimed).toBe(false);
    expect(claimResult.subscription.plan).toBe("free_trial");
    expect(claimResult.subscription.trialStatus).toBe("active");
    expect(claimResult.subscription.daysLeftInTrial).toBe(20);
    expect(claimResult.usage.daysLeft).toBe(20);

    // Now Journal creation and trade syncing succeed
    const journalBookGate = await canCreateJournalBook(userId, 0);
    expect(journalBookGate.allowed).toBe(true);

    const tradeGate = await canCreateTradeEntry(userId);
    expect(tradeGate.allowed).toBe(true);

    await caller.customer.saveJournalBooks({
      books: [{ id: "book-1", name: "Main Book", startingBalance: 10000, rules: [] }],
    });
    const booksAfter = await caller.customer.getJournalBooks();
    expect(Array.isArray(booksAfter)).toBe(true);
    expect(booksAfter.length).toBeGreaterThanOrEqual(1);
  });

  it("9-11. Blocks Private Trader Notebook content creation before claim, and allows Notebook creation after claiming from Notebook", async () => {
    const userId = TEST_USER_BASE + 3;
    const caller = appRouter.createCaller(createMockAuthContext(userId));

    // Before claiming, saving notebook pages or templates is rejected on the server
    const pageGateBefore = await canCreateNotebookPage(userId, 0);
    expect(pageGateBefore.allowed).toBe(false);
    expect(pageGateBefore.code).toBe("TRIAL_UNCLAIMED");

    const contentGateBefore = await canSaveNotebookContent(userId);
    expect(contentGateBefore.allowed).toBe(false);
    expect(contentGateBefore.code).toBe("TRIAL_UNCLAIMED");

    await expect(
      caller.customer.saveNotebookData({
        templates: [{ id: "tpl-1", name: "Daily Prep", icon: "📋" }],
        pages: [
          {
            id: "page-1",
            templateId: "tpl-1",
            title: "Monday Prep",
            content: " Watching London Highs",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      })
    ).rejects.toThrow(/Activate your 20-day Free Trial/i);

    // User explicitly claims Free Plan from Notebook modal
    const claimResult = await caller.subscription.claimFreePlan({ source: "notebook" });
    expect(claimResult.success).toBe(true);
    expect(claimResult.subscription.plan).toBe("free_trial");
    expect(claimResult.subscription.trialStatus).toBe("active");

    // Now Notebook page creation and content saving succeed during the 20-day trial
    const pageGateAfter = await canCreateNotebookPage(userId, 0);
    expect(pageGateAfter.allowed).toBe(true);

    const contentGateAfter = await canSaveNotebookContent(userId);
    expect(contentGateAfter.allowed).toBe(true);

    const saveRes = await caller.customer.saveNotebookData({
      templates: [{ id: "tpl-1", name: "Daily Prep", icon: "📋" }],
      pages: [
        {
          id: "page-1",
          templateId: "tpl-1",
          title: "Monday Prep",
          content: "Watching London Highs",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    expect(saveRes).toBeDefined();
  });

  it("12-14. Claims Free Plan from Store or Dashboard and computes exact 20-day trialEndsAt = trialClaimedAt + 20 days", async () => {
    const userId = TEST_USER_BASE + 4;
    const claimMoment = new Date("2026-10-12T12:00:00.000Z");

    const result = await claimFreeTrialPlan(userId, claimMoment);
    expect(result.success).toBe(true);
    expect(result.alreadyClaimed).toBe(false);

    const sub = result.subscription;
    expect(sub.plan).toBe("free_trial");
    expect(sub.trialStatus).toBe("active");
    expect(result.usage.trialDurationDays).toBe(FREE_TRIAL_DURATION_DAYS);
    expect(result.usage.trialDurationDays).toBe(20);
    expect(sub.trialClaimedAt?.toISOString()).toBe("2026-10-12T12:00:00.000Z");
    expect(sub.trialStartsAt?.toISOString()).toBe("2026-10-12T12:00:00.000Z");
    expect(sub.trialEndsAt?.toISOString()).toBe("2026-11-01T12:00:00.000Z");
    expect(sub.trialEndsAt!.getTime() - sub.trialClaimedAt!.getTime()).toBe(FREE_TRIAL_DURATION_MS);
    expect(sub.daysLeftInTrial).toBe(20);
    expect(result.usage.daysLeft).toBe(20);
  });

  it("15-16. Enforces idempotency: clicking Claim Free Plan again or concurrently never resets or extends the 20-day trial", async () => {
    const userId = TEST_USER_BASE + 5;
    const firstClaimMoment = new Date("2026-10-01T10:00:00.000Z");
    const secondAttemptMoment = new Date("2026-10-06T10:00:00.000Z"); // 5 days later

    const first = await claimFreeTrialPlan(userId, firstClaimMoment);
    expect(first.success).toBe(true);
    expect(first.alreadyClaimed).toBe(false);
    expect(first.subscription.trialEndsAt?.toISOString()).toBe("2026-10-21T10:00:00.000Z");

    // Second claim 5 days later must return alreadyClaimed=true and preserve original dates (15 days left)
    const second = await claimFreeTrialPlan(userId, secondAttemptMoment);
    expect(second.success).toBe(true);
    expect(second.alreadyClaimed).toBe(true);
    expect(second.subscription.trialClaimedAt?.toISOString()).toBe("2026-10-01T10:00:00.000Z");
    expect(second.subscription.trialEndsAt?.toISOString()).toBe("2026-10-21T10:00:00.000Z");
    expect(second.subscription.daysLeftInTrial).toBe(15);
    expect(second.usage.daysLeft).toBe(15);

    // Concurrent parallel claims for a fresh user must resolve to the exact same claim timestamp
    const concurrentUserId = TEST_USER_BASE + 6;
    const [c1, c2, c3] = await Promise.all([
      claimFreeTrialPlan(concurrentUserId),
      claimFreeTrialPlan(concurrentUserId),
      claimFreeTrialPlan(concurrentUserId),
    ]);
    expect(c1.subscription.trialClaimedAt?.getTime()).toBe(c2.subscription.trialClaimedAt?.getTime());
    expect(c2.subscription.trialEndsAt?.getTime()).toBe(c3.subscription.trialEndsAt?.getTime());
  });

  it("17-19. Expires trial after 20 days and prevents expired users from claiming another free trial", async () => {
    const userId = TEST_USER_BASE + 7;
    const claimMoment = new Date("2026-10-01T00:00:00.000Z");
    await claimFreeTrialPlan(userId, claimMoment);

    // Day 19: still active with 1 day left
    const day19 = new Date("2026-10-20T12:00:00.000Z");
    const subDay19 = await getUserSubscription(userId, day19);
    expect(subDay19.plan).toBe("free_trial");
    expect(subDay19.trialStatus).toBe("active");
    expect(subDay19.daysLeftInTrial).toBe(1);

    // Day 21 (past 20 days): trial is now expired (`free_after_trial`)
    const day21 = new Date("2026-10-21T00:00:01.000Z");
    const subDay21 = await getUserSubscription(userId, day21);
    expect(subDay21.plan).toBe("free_after_trial");
    expect(subDay21.trialStatus).toBe("expired");
    expect(subDay21.daysLeftInTrial).toBe(0);

    const usageDay21 = await getUserUsage(userId, day21);
    expect(usageDay21.plan).toBe("free_after_trial");
    expect(usageDay21.trialStatus).toBe("expired");
    expect(usageDay21.journalEntriesLimit).toBe(5);
    expect(usageDay21.notebookPagesLimit).toBe(0);

    // Expired user cannot claim another trial
    await expect(claimFreeTrialPlan(userId, day21)).rejects.toThrow(/already expired/i);
  });

  it("20. Paid subscribers retain their paid entitlements and cannot overwrite their paid plan with a free trial", async () => {
    const userId = TEST_USER_BASE + 8;
    await activateSubscription(userId, "premium", 30);

    await expect(claimFreeTrialPlan(userId)).rejects.toThrow(/active paid subscription/i);

    const subAfter = await getUserSubscription(userId);
    expect(subAfter.plan).toBe("premium");
    expect(subAfter.daysLeftInSubscription).toBeGreaterThanOrEqual(29);
  });
});
