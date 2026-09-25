import { eq, and, desc, sql } from "drizzle-orm";
import {
  users,
  subscriptions,
  savedVideos,
  notebookPages,
  traderTrades,
  disciplineTaskCompletions,
  Subscription,
  User,
} from "../drizzle/schema";
import { getDb, getSetting, setSetting, getUserById } from "./db";

export type SubscriptionPlan = "free_trial" | "free_after_trial" | "pro" | "premium";
export type SubscriptionStatus = "active" | "expired" | "suspended";
export type AccountStatus = "active" | "suspended" | "banned";

export interface UserSubscription {
  userId: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  accountStatus: AccountStatus;
  trialStartsAt: Date;
  trialEndsAt: Date;
  daysLeftInTrial: number;
  isTrialActive: boolean;
  subscriptionStartsAt?: Date | null;
  subscriptionEndsAt?: Date | null;
  daysLeftInSubscription: number;
  isPaidActive: boolean;
  freeCycleStartsAt?: Date | null;
  freeCycleEndsAt?: Date | null;
  daysLeftInFreeCycle: number;
  pausedProDaysRemaining: number;
  pausedPremiumDaysRemaining: number;
  hasCourseAccess: boolean;
}

export interface UserUsage {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  accountStatus: AccountStatus;
  daysLeft: number;
  hasCourseAccess: boolean;
  // Journal
  journalEntriesCount: number;
  journalEntriesLimit: number | "unlimited";
  journalBooksCount: number;
  journalBooksLimit: number | "unlimited";
  // Videos
  journalVideosCount: number;
  journalVideosLimit: number | "unlimited";
  notebookVideosCount: number;
  notebookVideosLimit: number | "unlimited";
  // Notebook Pages
  notebookPagesCount: number;
  notebookPagesLimit: number | "unlimited";
  // Discipline
  disciplineDaysCount: number;
  disciplineDaysLimit: number | "unlimited";
  // Feature Locks
  isWorkoutLocked: boolean;
  isCommunityLocked: boolean;
  isMentorSupportLocked: boolean;
  isOwnerChatLocked: boolean;
  isLeaderboardEligible: boolean;
}

// In-memory fallback stores for local development / test isolation
const inMemorySubscriptions: Map<number, any> = new Map();
const inMemoryAccountStatuses: Map<number, AccountStatus> = new Map();
const inMemorySavedVideos: Array<{ id: number; userId: number; videoUrl: string; source: "journal" | "notebook"; createdAt: Date }> = [];
const inMemoryNotebookPages: Array<{ id: number; userId: number; pageId: string; createdAt: Date }> = [];
let autoVideoId = 1;
let autoPageId = 1;

/**
 * Retrieve the raw database-backed subscription record for a user,
 * without applying manual admin grants or admin override blocks.
 * Used to preserve and inspect authentic automatic subscriptions.
 */
export async function getRawUserSubscription(userId: number): Promise<{
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isPaidActive: boolean;
  subscriptionStartsAt: Date | null;
  subscriptionEndsAt: Date | null;
}> {
  let subRecord: any = null;
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
      if (rows.length > 0) {
        subRecord = rows[0];
      }
    } catch {}
  }
  if (!subRecord) {
    subRecord = inMemorySubscriptions.get(userId);
  }
  const now = new Date();
  const subEndsAt = subRecord?.subscriptionEndsAt ? new Date(subRecord.subscriptionEndsAt) : null;
  const isPaidActive =
    (subRecord?.plan === "pro" || subRecord?.plan === "premium") &&
    subEndsAt != null &&
    subEndsAt.getTime() > now.getTime();

  return {
    plan: (subRecord?.plan as SubscriptionPlan) || "free_trial",
    status: (subRecord?.status as SubscriptionStatus) || "active",
    isPaidActive,
    subscriptionStartsAt: subRecord?.subscriptionStartsAt ? new Date(subRecord.subscriptionStartsAt) : null,
    subscriptionEndsAt: subEndsAt,
  };
}

/**
 * Get or initialize a user's subscription record.
 * The 30-day Free Trial is strictly anchored to the user's account creation date (createdAt in DB).
 */
export async function getUserSubscription(userId: number): Promise<UserSubscription> {
  const user = await getUserById(userId);
  const now = new Date();
  const userCreatedAt = user?.createdAt ? new Date(user.createdAt) : now;

  // Account creation timestamp strictly anchors the 30-day trial
  const trialStartsAt = new Date(userCreatedAt.getTime());
  const trialEndsAt = new Date(trialStartsAt.getTime() + 30 * 86400000);

  // Account status (Active by default)
  const userAccountStatus: AccountStatus =
    (user as any)?.accountStatus || inMemoryAccountStatuses.get(userId) || "active";

  let subRecord: any = null;
  const db = await getDb();

  if (db) {
    try {
      const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
      if (rows.length > 0) {
        subRecord = rows[0];
        inMemorySubscriptions.set(userId, subRecord);
      }
    } catch (err) {
      console.warn("[getUserSubscription db query warning]:", err);
    }
  }

  if (!subRecord) {
    subRecord = inMemorySubscriptions.get(userId);
  }

  // If no record exists yet, initialize based on user's account creation timestamp
  if (!subRecord) {
    const isStillTrial = now.getTime() < trialEndsAt.getTime();
    subRecord = {
      userId,
      plan: isStillTrial ? "free_trial" : "free_after_trial",
      status: "active",
      trialStartsAt,
      trialEndsAt,
      subscriptionStartsAt: null,
      subscriptionEndsAt: null,
      pausedProDaysRemaining: 0,
      pausedPremiumDaysRemaining: 0,
      freeCycleStartsAt: isStillTrial ? null : trialEndsAt,
      freeCycleEndsAt: isStillTrial ? null : new Date(trialEndsAt.getTime() + 30 * 86400000),
      createdAt: now,
      updatedAt: now,
    };
    inMemorySubscriptions.set(userId, subRecord);

    if (db) {
      try {
        await db.insert(subscriptions).values({
          userId,
          plan: subRecord.plan,
          status: subRecord.status,
          trialStartsAt: subRecord.trialStartsAt,
          trialEndsAt: subRecord.trialEndsAt,
          subscriptionStartsAt: subRecord.subscriptionStartsAt,
          subscriptionEndsAt: subRecord.subscriptionEndsAt,
          pausedProDaysRemaining: subRecord.pausedProDaysRemaining,
          pausedPremiumDaysRemaining: subRecord.pausedPremiumDaysRemaining,
          freeCycleStartsAt: subRecord.freeCycleStartsAt,
          freeCycleEndsAt: subRecord.freeCycleEndsAt,
        });
      } catch (err) {
        // Table might not exist yet or conflict; memory fallback handles it
      }
    }
  }

  // Evaluate active plan status & transitions dynamically
  let effectivePlan: SubscriptionPlan = subRecord.plan;
  let effectiveStatus: SubscriptionStatus = subRecord.status;
  let subStartsAt: Date | null = subRecord.subscriptionStartsAt ? new Date(subRecord.subscriptionStartsAt) : null;
  let subEndsAt: Date | null = subRecord.subscriptionEndsAt ? new Date(subRecord.subscriptionEndsAt) : null;
  let pausedProDays = Number(subRecord.pausedProDaysRemaining) || 0;
  let pausedPremiumDays = Number(subRecord.pausedPremiumDaysRemaining) || 0;

  // 1. Check if paid subscription is expired
  if (subEndsAt && subEndsAt.getTime() <= now.getTime()) {
    // If user was on Premium and had paused Pro days preserved, seamlessly resume Pro!
    if (effectivePlan === "premium" && pausedProDays > 0) {
      effectivePlan = "pro";
      effectiveStatus = "active";
      subStartsAt = now;
      subEndsAt = new Date(now.getTime() + pausedProDays * 86400000);
      pausedProDays = 0;
      await updateSubscriptionRecord(userId, {
        plan: "pro",
        status: "active",
        subscriptionStartsAt: subStartsAt,
        subscriptionEndsAt: subEndsAt,
        pausedProDaysRemaining: 0,
      });
    } else if (effectivePlan === "pro" && pausedPremiumDays > 0) {
      effectivePlan = "premium";
      effectiveStatus = "active";
      subStartsAt = now;
      subEndsAt = new Date(now.getTime() + pausedPremiumDays * 86400000);
      pausedPremiumDays = 0;
      await updateSubscriptionRecord(userId, {
        plan: "premium",
        status: "active",
        subscriptionStartsAt: subStartsAt,
        subscriptionEndsAt: subEndsAt,
        pausedPremiumDaysRemaining: 0,
      });
    } else {
      // Paid plan has expired without preserved days -> Moves permanently to free-after-trial
      effectivePlan = "free_after_trial";
      effectiveStatus = "active"; // Free-after-trial state is active
      await updateSubscriptionRecord(userId, {
        plan: "free_after_trial",
        status: "active",
      });
    }
  }

  // 2. Check if Free Trial is expired and no paid plan active
  if (effectivePlan === "free_trial" && now.getTime() >= trialEndsAt.getTime()) {
    effectivePlan = "free_after_trial";
    effectiveStatus = "active";
    await updateSubscriptionRecord(userId, {
      plan: "free_after_trial",
      status: "active",
    });
  }

  const isTrialActive = effectivePlan === "free_trial" && now.getTime() < trialEndsAt.getTime();
  const isPaidActive = (effectivePlan === "pro" || effectivePlan === "premium") && subEndsAt != null && subEndsAt.getTime() > now.getTime();

  const daysLeftInTrial = isTrialActive
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000))
    : 0;

  const daysLeftInSubscription = isPaidActive && subEndsAt
    ? Math.max(0, Math.ceil((subEndsAt.getTime() - now.getTime()) / 86400000))
    : 0;

  // Calculate rolling 30-day personal cycle for Free-After-Trial users
  let freeCycleStartsAt: Date | null = null;
  let freeCycleEndsAt: Date | null = null;
  let daysLeftInFreeCycle = 0;

  if (effectivePlan === "free_after_trial") {
    const msSinceTrialEnd = Math.max(0, now.getTime() - trialEndsAt.getTime());
    const cycleDurationMs = 30 * 86400000;
    const cycleIndex = Math.floor(msSinceTrialEnd / cycleDurationMs);
    freeCycleStartsAt = new Date(trialEndsAt.getTime() + cycleIndex * cycleDurationMs);
    freeCycleEndsAt = new Date(freeCycleStartsAt.getTime() + cycleDurationMs);
    daysLeftInFreeCycle = Math.max(0, Math.ceil((freeCycleEndsAt.getTime() - now.getTime()) / 86400000));
  }

  // 3. Apply Manual Grants & Admin Override Restrictions
  let finalPaidActive = isPaidActive;
  let finalSubEndsAt = subEndsAt;

  try {
    const { getManualAccessRecord, isManualRecordActive } = await import("./userManagement");
    const [manualPro, manualPremium] = await Promise.all([
      getManualAccessRecord(userId, "pro"),
      getManualAccessRecord(userId, "premium"),
    ]);

    const proBlocked = manualPro?.isOverrideBlocked === true;
    const premiumBlocked = manualPremium?.isOverrideBlocked === true;
    const manualProActive = isManualRecordActive(manualPro, now);
    const manualPremiumActive = isManualRecordActive(manualPremium, now);

    const autoProActive = isPaidActive && effectivePlan === "pro";
    const autoPremiumActive = isPaidActive && effectivePlan === "premium";

    const effectiveProActive = !proBlocked && (manualProActive || autoProActive);
    const effectivePremiumActive = !premiumBlocked && (manualPremiumActive || autoPremiumActive);

    if (effectivePremiumActive) {
      effectivePlan = "premium";
      effectiveStatus = "active";
      finalPaidActive = true;
      if (manualPremiumActive) {
        if (manualPremium.isLifetime) {
          finalSubEndsAt = new Date(now.getTime() + 3650 * 86400000);
        } else if (manualPremium.expiryDate) {
          finalSubEndsAt = new Date(manualPremium.expiryDate);
        }
      }
    } else if (effectiveProActive) {
      effectivePlan = "pro";
      effectiveStatus = "active";
      finalPaidActive = true;
      if (manualProActive) {
        if (manualPro.isLifetime) {
          finalSubEndsAt = new Date(now.getTime() + 3650 * 86400000);
        } else if (manualPro.expiryDate) {
          finalSubEndsAt = new Date(manualPro.expiryDate);
        }
      }
    } else if (proBlocked || premiumBlocked || manualPro || manualPremium) {
      if (effectivePlan === "pro" || effectivePlan === "premium") {
        effectivePlan = isTrialActive ? "free_trial" : "free_after_trial";
        effectiveStatus = "active";
        finalPaidActive = false;
      }
    }
  } catch (err) {}

  let hasCourseAccess = false;
  try {
    const { hasUserCourseAccess } = await import("./userManagement");
    hasCourseAccess = await hasUserCourseAccess(userId, now);
  } catch (err) {}

  const finalDaysLeftInSubscription = finalPaidActive && finalSubEndsAt
    ? Math.max(0, Math.ceil((finalSubEndsAt.getTime() - now.getTime()) / 86400000))
    : 0;

  return {
    userId,
    plan: effectivePlan,
    status: effectiveStatus,
    accountStatus: userAccountStatus,
    trialStartsAt,
    trialEndsAt,
    daysLeftInTrial,
    isTrialActive,
    subscriptionStartsAt: subStartsAt,
    subscriptionEndsAt: finalSubEndsAt,
    daysLeftInSubscription: finalDaysLeftInSubscription,
    isPaidActive: finalPaidActive,
    freeCycleStartsAt,
    freeCycleEndsAt,
    daysLeftInFreeCycle,
    pausedProDaysRemaining: pausedProDays,
    pausedPremiumDaysRemaining: pausedPremiumDays,
    hasCourseAccess,
  };
}

async function updateSubscriptionRecord(userId: number, updates: Partial<Subscription>): Promise<void> {
  const existing = inMemorySubscriptions.get(userId) || {};
  const merged = { ...existing, ...updates, updatedAt: new Date() };
  inMemorySubscriptions.set(userId, merged);

  const db = await getDb();
  if (db) {
    try {
      await db.update(subscriptions).set(updates).where(eq(subscriptions.userId, userId));
    } catch (err) {}
  }
}

/**
 * Set user account status (active, suspended, banned)
 */
export async function setAccountStatus(userId: number, status: AccountStatus): Promise<void> {
  inMemoryAccountStatuses.set(userId, status);
  const db = await getDb();
  if (db) {
    try {
      await db.update(users).set({ accountStatus: status } as any).where(eq(users.id, userId));
    } catch (err) {}
  }
}

/**
 * Activate Pro or Premium plan for a user.
 * Handles:
 * - 5 BONUS DAYS if purchased during Free Trial (30 + 5 = 35 days)
 * - Pro -> Premium switching (pauses and preserves remaining Pro days)
 * - Premium -> Pro switching (handles remaining Premium value/time)
 */
export async function activateSubscription(
  userId: number,
  plan: "pro" | "premium",
  customDurationDays?: number
): Promise<UserSubscription> {
  const currentSub = await getUserSubscription(userId);
  const now = new Date();

  // If user purchases during Free Trial, free trial ends immediately and user receives 5 BONUS DAYS!
  const isPurchasedDuringTrial = currentSub.isTrialActive;
  const bonusDays = isPurchasedDuringTrial ? 5 : 0;
  const durationDays = (customDurationDays !== undefined ? customDurationDays : 30) + bonusDays;

  let newStartsAt = now;
  let newEndsAt = new Date(now.getTime() + durationDays * 86400000);
  let pausedProDays = currentSub.pausedProDaysRemaining;
  let pausedPremiumDays = currentSub.pausedPremiumDaysRemaining;

  // Switching Logic: Pro -> Premium
  if (plan === "premium" && currentSub.plan === "pro" && currentSub.isPaidActive && currentSub.subscriptionEndsAt) {
    const remainingMs = currentSub.subscriptionEndsAt.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / 86400000));
    pausedProDays += remainingDays;
  }

  // Switching Logic: Premium -> Pro
  if (plan === "pro" && currentSub.plan === "premium" && currentSub.isPaidActive && currentSub.subscriptionEndsAt) {
    const remainingMs = currentSub.subscriptionEndsAt.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / 86400000));
    // Preserve remaining Premium time
    pausedPremiumDays += remainingDays;
  }

  // Same plan renewal
  if (plan === currentSub.plan && currentSub.isPaidActive && currentSub.subscriptionEndsAt) {
    newStartsAt = currentSub.subscriptionStartsAt || now;
    newEndsAt = new Date(currentSub.subscriptionEndsAt.getTime() + durationDays * 86400000);
  }

  await updateSubscriptionRecord(userId, {
    plan,
    status: "active",
    trialEndsAt: now, // Free trial ends immediately upon paid plan activation
    subscriptionStartsAt: newStartsAt,
    subscriptionEndsAt: newEndsAt,
    pausedProDaysRemaining: pausedProDays,
    pausedPremiumDaysRemaining: pausedPremiumDays,
  });

  return await getUserSubscription(userId);
}

/**
 * Record a saved video (Journal or Notebook).
 */
export async function recordSavedVideo(userId: number, videoUrl: string, source: "journal" | "notebook"): Promise<boolean> {
  const now = new Date();
  inMemorySavedVideos.push({
    id: autoVideoId++,
    userId,
    videoUrl,
    source,
    createdAt: now,
  });

  const db = await getDb();
  if (db) {
    try {
      await db.insert(savedVideos).values({
        userId,
        videoUrl,
        source,
        createdAt: now,
      });
    } catch {}
  }
  return true;
}

/**
 * Delete a saved video -> Restores video quota immediately!
 */
export async function removeSavedVideo(userId: number, videoUrl: string): Promise<boolean> {
  const idx = inMemorySavedVideos.findIndex((v) => v.userId === userId && v.videoUrl === videoUrl);
  if (idx !== -1) inMemorySavedVideos.splice(idx, 1);

  const db = await getDb();
  if (db) {
    try {
      await db.delete(savedVideos).where(and(eq(savedVideos.userId, userId), eq(savedVideos.videoUrl, videoUrl)));
    } catch {}
  }
  return true;
}

/**
 * Record a created notebook page
 */
export async function recordNotebookPage(userId: number, pageId: string): Promise<boolean> {
  const now = new Date();
  if (!inMemoryNotebookPages.some((p) => p.userId === userId && p.pageId === pageId)) {
    inMemoryNotebookPages.push({
      id: autoPageId++,
      userId,
      pageId,
      createdAt: now,
    });
  }

  const db = await getDb();
  if (db) {
    try {
      await db.insert(notebookPages).values({ userId, pageId, createdAt: now });
    } catch {}
  }
  return true;
}

/**
 * Remove a notebook page
 */
export async function removeNotebookPage(userId: number, pageId: string): Promise<boolean> {
  const idx = inMemoryNotebookPages.findIndex((p) => p.userId === userId && p.pageId === pageId);
  if (idx !== -1) inMemoryNotebookPages.splice(idx, 1);

  const db = await getDb();
  if (db) {
    try {
      await db.delete(notebookPages).where(and(eq(notebookPages.userId, userId), eq(notebookPages.pageId, pageId)));
    } catch {}
  }
  return true;
}

/**
 * Get current active saved videos count for user in current period
 */
export async function getActiveSavedVideosCount(userId: number, source: "journal" | "notebook"): Promise<number> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(savedVideos)
        .where(and(eq(savedVideos.userId, userId), eq(savedVideos.source, source)));
      return rows.length;
    } catch {}
  }
  return inMemorySavedVideos.filter((v) => v.userId === userId && v.source === source).length;
}

/**
 * Get notebook pages created in current billing period
 */
export async function getActiveNotebookPagesCount(userId: number, periodStart?: Date | null): Promise<number> {
  const db = await getDb();
  if (db && periodStart) {
    try {
      const rows = await db
        .select()
        .from(notebookPages)
        .where(and(eq(notebookPages.userId, userId), sql`${notebookPages.createdAt} >= ${periodStart}`));
      return rows.length;
    } catch {}
  }
  const minTime = periodStart ? periodStart.getTime() : 0;
  return inMemoryNotebookPages.filter((p) => p.userId === userId && p.createdAt.getTime() >= minTime).length;
}

/**
 * Get trades created in current cycle (for free-after-trial 5-trade limit)
 */
export async function getTradesCountInCycle(userId: number, cycleStart?: Date | null): Promise<number> {
  const db = await getDb();
  if (db && cycleStart) {
    try {
      const rows = await db
        .select()
        .from(traderTrades)
        .where(and(eq(traderTrades.userId, userId), sql`${traderTrades.createdAt} >= ${cycleStart}`));
      return rows.length;
    } catch {}
  }
  const { getUserTrades } = await import("./db");
  const trades = await getUserTrades(userId);
  if (!cycleStart) return trades.length;
  const cycleStartStr = cycleStart.toISOString().slice(0, 10);
  return trades.filter((t) => (t.date && t.date >= cycleStartStr) || (t.createdAt && new Date(t.createdAt) >= cycleStart)).length;
}

/**
 * Get unique discipline days logged in current cycle (for free-after-trial 5-day limit)
 */
export async function getDisciplineDaysInCycle(userId: number, cycleStart?: Date | null): Promise<number> {
  const db = await getDb();
  const cycleStartStr = cycleStart ? cycleStart.toISOString().slice(0, 10) : "";

  if (db && cycleStart) {
    try {
      const rows = await db
        .select({ date: disciplineTaskCompletions.date })
        .from(disciplineTaskCompletions)
        .where(
          and(
            eq(disciplineTaskCompletions.userId, userId),
            eq(disciplineTaskCompletions.completed, true),
            sql`${disciplineTaskCompletions.date} >= ${cycleStartStr}`
          )
        );
      const unique = new Set(rows.map((r: any) => r.date));
      return unique.size;
    } catch {}
  }

  // In-memory completions lookup fallback
  const { getAllTraderTrades } = await import("./db");
  const inMemorySettingKey = `discipline_completions_${userId}`;
  const raw = await getSetting(inMemorySettingKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = cycleStartStr ? parsed.filter((c: any) => c.date >= cycleStartStr && c.completed) : parsed;
        const unique = new Set(filtered.map((c: any) => c.date));
        return unique.size;
      }
    } catch {}
  }
  return 0;
}

/**
 * Get comprehensive usage details and limits for the user
 */
export async function getUserUsage(userId: number): Promise<UserUsage> {
  const sub = await getUserSubscription(userId);

  // Journal Books
  const { getUserJournalConfig } = await import("./db");
  const journalConfig = await getUserJournalConfig(userId);
  const journalBooksCount = (journalConfig as any).books ? (journalConfig as any).books.length : 1;

  // Determine current active period for quota counts
  const currentPeriodStart = sub.isPaidActive
    ? sub.subscriptionStartsAt
    : sub.freeCycleStartsAt;

  const journalVideosCount = await getActiveSavedVideosCount(userId, "journal");
  const notebookVideosCount = await getActiveSavedVideosCount(userId, "notebook");
  const notebookPagesCount = await getActiveNotebookPagesCount(userId, currentPeriodStart);

  let journalEntriesCount = 0;
  let disciplineDaysCount = 0;

  if (sub.plan === "free_after_trial") {
    journalEntriesCount = await getTradesCountInCycle(userId, sub.freeCycleStartsAt);
    disciplineDaysCount = await getDisciplineDaysInCycle(userId, sub.freeCycleStartsAt);
  }

  const daysLeft = sub.isTrialActive
    ? sub.daysLeftInTrial
    : sub.isPaidActive
    ? sub.daysLeftInSubscription
    : sub.daysLeftInFreeCycle;

  // Limits based on plan
  let journalEntriesLimit: number | "unlimited" = "unlimited";
  let journalBooksLimit: number | "unlimited" = 1;
  let journalVideosLimit: number | "unlimited" = 0;
  let notebookPagesLimit: number | "unlimited" = 0;
  let notebookVideosLimit: number | "unlimited" = 0;
  let disciplineDaysLimit: number | "unlimited" = "unlimited";

  let isWorkoutLocked = true;
  let isCommunityLocked = true;
  let isMentorSupportLocked = true;
  let isOwnerChatLocked = true;

  if (sub.plan === "free_trial") {
    journalEntriesLimit = "unlimited";
    journalBooksLimit = 1;
    journalVideosLimit = 0;
    notebookPagesLimit = 0;
    notebookVideosLimit = 0;
    disciplineDaysLimit = "unlimited";
    isWorkoutLocked = true;
    isCommunityLocked = true;
    isMentorSupportLocked = true;
    isOwnerChatLocked = true;
  } else if (sub.plan === "free_after_trial") {
    journalEntriesLimit = 5;
    journalBooksLimit = 1;
    journalVideosLimit = 0;
    notebookPagesLimit = 0;
    notebookVideosLimit = 0;
    disciplineDaysLimit = 5;
    isWorkoutLocked = true;
    isCommunityLocked = true;
    isMentorSupportLocked = true;
    isOwnerChatLocked = true;
  } else if (sub.plan === "pro") {
    journalEntriesLimit = "unlimited";
    journalBooksLimit = 5;
    journalVideosLimit = 30;
    notebookPagesLimit = 10;
    notebookVideosLimit = 5;
    disciplineDaysLimit = "unlimited";
    isWorkoutLocked = false;
    isCommunityLocked = false;
    isMentorSupportLocked = true;
    isOwnerChatLocked = true;
  } else if (sub.plan === "premium") {
    journalEntriesLimit = "unlimited";
    journalBooksLimit = "unlimited";
    journalVideosLimit = "unlimited";
    notebookPagesLimit = "unlimited";
    notebookVideosLimit = "unlimited";
    disciplineDaysLimit = "unlimited";
    isWorkoutLocked = false;
    isCommunityLocked = false;
    isMentorSupportLocked = false;
    isOwnerChatLocked = false;
  }

  const user = await getUserById(userId);
  const isLeaderboardEligible =
    (sub.plan === "pro" || sub.plan === "premium") &&
    sub.status === "active" &&
    sub.accountStatus === "active" &&
    Boolean(user?.emailVerified);

  return {
    plan: sub.plan,
    status: sub.status,
    accountStatus: sub.accountStatus,
    daysLeft,
    hasCourseAccess: sub.hasCourseAccess,
    journalEntriesCount,
    journalEntriesLimit,
    journalBooksCount,
    journalBooksLimit,
    journalVideosCount,
    journalVideosLimit,
    notebookPagesCount,
    notebookPagesLimit,
    notebookVideosCount,
    notebookVideosLimit,
    disciplineDaysCount,
    disciplineDaysLimit,
    isWorkoutLocked,
    isCommunityLocked,
    isMentorSupportLocked,
    isOwnerChatLocked,
    isLeaderboardEligible,
  };
}

// ------------------------------------------------------------------------------
// SERVER-SIDE ACCESS CONTROL ENFORCEMENT HOOKS
// ------------------------------------------------------------------------------

export async function canCreateJournalBook(userId: number, currentBookCount: number): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "free_trial" || sub.plan === "free_after_trial") {
    if (currentBookCount >= 1) {
      return {
        allowed: false,
        reason: "Additional Journal Books require Pro or Premium. Upgrade to create more books.",
      };
    }
  }
  if (sub.plan === "pro") {
    if (currentBookCount >= 5) {
      return {
        allowed: false,
        reason: "You have reached the Pro Journal Book limit (5/5). Upgrade to Premium for unlimited Journal Books.",
      };
    }
  }
  return { allowed: true };
}

export async function canCreateTradeEntry(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "free_after_trial") {
    const currentTradesInCycle = await getTradesCountInCycle(userId, sub.freeCycleStartsAt);
    if (currentTradesInCycle >= 5) {
      return {
        allowed: false,
        reason: "You have reached your free monthly Journal limit (5/5). Upgrade to Pro or Premium for more access.",
      };
    }
  }
  return { allowed: true };
}

export async function canSaveVideo(userId: number, source: "journal" | "notebook"): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "free_trial" || sub.plan === "free_after_trial") {
    return {
      allowed: false,
      reason: "Video saving is available with Pro and Premium. Upgrade to unlock video uploads.",
    };
  }
  if (sub.plan === "pro") {
    if (source === "journal") {
      const activeVideos = await getActiveSavedVideosCount(userId, "journal");
      if (activeVideos >= 30) {
        return {
          allowed: false,
          reason: "You have reached the monthly Pro Journal video limit (30/30). Upgrade to Premium for unlimited video saving.",
        };
      }
    } else {
      const activeVideos = await getActiveSavedVideosCount(userId, "notebook");
      if (activeVideos >= 5) {
        return {
          allowed: false,
          reason: "You have reached the monthly Pro Notebook video limit (5/5). Upgrade to Premium for unlimited notebook videos.",
        };
      }
    }
  }
  return { allowed: true };
}

export async function canCreateNotebookPage(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "free_trial" || sub.plan === "free_after_trial") {
    return {
      allowed: false,
      reason: "Trader Notebook pages are available on Pro (10 pages/month) and Premium (Unlimited) plans.",
    };
  }
  if (sub.plan === "pro") {
    const activePages = await getActiveNotebookPagesCount(userId, sub.subscriptionStartsAt);
    if (activePages >= 10) {
      return {
        allowed: false,
        reason: "You have reached the monthly Pro Notebook page limit (10/10). Upgrade to Premium for unlimited pages.",
      };
    }
  }
  return { allowed: true };
}

export async function canAccessWorkout(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "free_trial" || sub.plan === "free_after_trial") {
    return {
      allowed: false,
      reason: "Workout Routine & Completion is available with Pro and Premium. Upgrade to unlock structured workout checklists and tracking.",
    };
  }
  return { allowed: true };
}

export async function canLogDiscipline(userId: number, date: string): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "free_after_trial") {
    const uniqueDays = await getDisciplineDaysInCycle(userId, sub.freeCycleStartsAt);
    // If user already logged on this specific date in current cycle, they can toggle tasks on that day
    // But if trying to start a 6th unique day, block it!
    const { getSetting } = await import("./db");
    const raw = await getSetting(`discipline_completions_${userId}`);
    let alreadyHasDate = false;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) alreadyHasDate = parsed.some((c: any) => c.date === date);
      } catch {}
    }
    if (!alreadyHasDate && uniqueDays >= 5) {
      return {
        allowed: false,
        reason: "You have reached your free monthly Daily Discipline limit (5/5 days). Upgrade to Pro or Premium for more access.",
      };
    }
  }
  return { allowed: true };
}

export async function canAccessCommunity(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "free_trial" || sub.plan === "free_after_trial") {
    return {
      allowed: false,
      reason: "Community Chat access is available with Pro and Premium. Upgrade to join the community.",
    };
  }
  return { allowed: true };
}

export async function canAccessMentorSupport(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan !== "premium") {
    return {
      allowed: false,
      reason: "Mentor Support is available exclusively with Premium. Upgrade to Premium for 1-on-1 institutional guidance.",
    };
  }
  return { allowed: true };
}

export async function canAccessOwnerChat(userId: number): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan !== "premium") {
    return {
      allowed: false,
      reason: "Owner Personal Chat is available exclusively with Premium. Upgrade to Premium for direct 1-on-1 access to the founder.",
    };
  }
  return { allowed: true };
}

export async function isEligibleForLeaderboard(userIdOrUser: number | any, userObj?: any): Promise<boolean> {
  const user = typeof userIdOrUser === "object" ? userIdOrUser : (userObj || (await getUserById(userIdOrUser)));
  const userId = typeof userIdOrUser === "object" ? userIdOrUser.id : userIdOrUser;
  if (!user) return false;
  const isEmailVerified =
    user.emailVerified === true ||
    (user as any).emailVerified === 1 ||
    Boolean((user as any).emailVerified);
  if (!isEmailVerified) return false;

  const sub = await getUserSubscription(userId);
  if (sub.accountStatus !== "active") return false;
  if (sub.plan !== "pro" && sub.plan !== "premium") return false;
  if (sub.status !== "active") return false;
  if (!sub.isPaidActive) return false;

  return true;
}
