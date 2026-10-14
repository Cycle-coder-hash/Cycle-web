import { TRPCError } from "@trpc/server";
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
} from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { getSetting, setSetting } from "../../infra/db/settings";
import { getUserById } from "../auth/repo";

export const FREE_TRIAL_DURATION_DAYS = 20;
export const FREE_TRIAL_DURATION_MS = FREE_TRIAL_DURATION_DAYS * 86400000;

export type SubscriptionPlan = "unclaimed" | "free_trial" | "free_after_trial" | "pro" | "premium";
export type TrialStatus = "unclaimed" | "active" | "expired";
export type SubscriptionStatus = "active" | "expired" | "suspended";
export type AccountStatus = "active" | "suspended" | "banned";

export interface UserSubscription {
  userId: number;
  plan: SubscriptionPlan;
  trialStatus: TrialStatus;
  status: SubscriptionStatus;
  accountStatus: AccountStatus;
  trialClaimedAt: Date | null;
  isTrialClaimed: boolean;
  trialStartsAt: Date | null;
  trialEndsAt: Date | null;
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
  trialStatus: TrialStatus;
  trialDurationDays: number;
  status: SubscriptionStatus;
  accountStatus: AccountStatus;
  daysLeft: number;
  trialClaimedAt: Date | null;
  isTrialClaimed: boolean;
  isTrialActive: boolean;
  isPaidActive: boolean;
  trialStartsAt: Date | null;
  trialEndsAt: Date | null;
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

export interface ClaimFreePlanResult {
  success: boolean;
  alreadyClaimed: boolean;
  subscription: UserSubscription;
  usage: UserUsage;
}

// In-memory fallback stores for local development / test isolation
export const inMemorySubscriptions: Map<number, any> = new Map();
const inMemoryAccountStatuses: Map<number, AccountStatus> = new Map();
const inMemorySavedVideos: Array<{ id: number; userId: number; videoUrl: string; source: "journal" | "notebook"; createdAt: Date }> = [];
const inMemoryNotebookPages: Array<{ id: number; userId: number; pageId: string; createdAt: Date }> = [];
const inFlightClaims: Map<number, Promise<ClaimFreePlanResult>> = new Map();
let autoVideoId = 1;
let autoPageId = 1;

export function resetInMemorySubscriptionStateForTests(userId?: number): void {
  if (typeof userId === "number") {
    inMemorySubscriptions.delete(userId);
    inMemoryAccountStatuses.delete(userId);
    inFlightClaims.delete(userId);
    for (let i = inMemorySavedVideos.length - 1; i >= 0; i--) {
      if (inMemorySavedVideos[i].userId === userId) inMemorySavedVideos.splice(i, 1);
    }
    for (let i = inMemoryNotebookPages.length - 1; i >= 0; i--) {
      if (inMemoryNotebookPages[i].userId === userId) inMemoryNotebookPages.splice(i, 1);
    }
  } else {
    inMemorySubscriptions.clear();
    inMemoryAccountStatuses.clear();
    inFlightClaims.clear();
    inMemorySavedVideos.length = 0;
    inMemoryNotebookPages.length = 0;
  }
}

async function loadSubscriptionRecord(userId: number): Promise<any | null> {
  let subRecord: any = inMemorySubscriptions.get(userId) || null;
  const db = await getDb();

  if (db) {
    try {
      const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
      if (rows.length > 0) {
        const dbRow = rows[0] as any;
        // Preserve in-memory trialClaimedAt if DB column was not yet migrated on remote instance
        if (subRecord?.trialClaimedAt && !dbRow.trialClaimedAt) {
          dbRow.trialClaimedAt = subRecord.trialClaimedAt;
        }
        subRecord = dbRow;
        inMemorySubscriptions.set(userId, subRecord);
      }
    } catch (err) {
      console.warn("[loadSubscriptionRecord db query warning]:", err);
    }
  }

  if (!subRecord && process.env.NODE_ENV !== "test") {
    try {
      const raw = await getSetting(`user_subscription_${userId}`);
      if (raw) {
        subRecord = JSON.parse(raw);
        inMemorySubscriptions.set(userId, subRecord);
      }
    } catch {}
  } else if (subRecord && !subRecord.trialClaimedAt && process.env.NODE_ENV !== "test") {
    try {
      const raw = await getSetting(`user_subscription_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.trialClaimedAt) {
          subRecord = { ...subRecord, ...parsed };
          inMemorySubscriptions.set(userId, subRecord);
        }
      }
    } catch {}
  }

  return subRecord;
}

/**
 * Retrieve the raw database-backed subscription record for a user,
 * without applying manual admin grants or admin override blocks.
 * Used to preserve and inspect authentic automatic subscriptions.
 */
export async function getRawUserSubscription(userId: number, nowOverride?: Date): Promise<{
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isPaidActive: boolean;
  subscriptionStartsAt: Date | null;
  subscriptionEndsAt: Date | null;
}> {
  const subRecord = await loadSubscriptionRecord(userId);
  const now = nowOverride ? new Date(nowOverride.getTime()) : new Date();
  const subEndsAt = subRecord?.subscriptionEndsAt ? new Date(subRecord.subscriptionEndsAt) : null;
  const isPaidActive =
    (subRecord?.plan === "pro" || subRecord?.plan === "premium") &&
    subEndsAt != null &&
    subEndsAt.getTime() > now.getTime();

  const trialClaimedAt = subRecord?.trialClaimedAt ? new Date(subRecord.trialClaimedAt) : null;
  let fallbackPlan: SubscriptionPlan = "unclaimed";
  if (isPaidActive) {
    fallbackPlan = subRecord.plan as SubscriptionPlan;
  } else if (trialClaimedAt) {
    const trialEnds = subRecord?.trialEndsAt
      ? new Date(subRecord.trialEndsAt)
      : new Date(trialClaimedAt.getTime() + FREE_TRIAL_DURATION_MS);
    fallbackPlan = now.getTime() < trialEnds.getTime() ? "free_trial" : "free_after_trial";
  } else if (subEndsAt && subEndsAt.getTime() <= now.getTime()) {
    fallbackPlan = "free_after_trial";
  }

  return {
    plan: fallbackPlan,
    status: (subRecord?.status as SubscriptionStatus) || "active",
    isPaidActive,
    subscriptionStartsAt: subRecord?.subscriptionStartsAt ? new Date(subRecord.subscriptionStartsAt) : null,
    subscriptionEndsAt: subEndsAt,
  };
}

/**
 * Get a user's subscription state without ever auto-starting a trial.
 * The 20-day Free Trial starts ONLY when explicitly claimed via `claimFreeTrialPlan`.
 */
export async function getUserSubscription(userId: number, nowOverride?: Date): Promise<UserSubscription> {
  const user = await getUserById(userId);
  const now = nowOverride ? new Date(nowOverride.getTime()) : new Date();

  // Account status (Active by default)
  const userAccountStatus: AccountStatus =
    inMemoryAccountStatuses.get(userId) || (user as any)?.accountStatus || (user as any)?.status || "active";

  const subRecord = await loadSubscriptionRecord(userId);

  const trialClaimedAt: Date | null = subRecord?.trialClaimedAt ? new Date(subRecord.trialClaimedAt) : null;
  const isTrialClaimed = trialClaimedAt !== null;

  const trialStartsAt: Date | null = isTrialClaimed
    ? new Date(trialClaimedAt!.getTime())
    : null;
  const trialEndsAt: Date | null = isTrialClaimed
    ? subRecord?.trialEndsAt
      ? new Date(subRecord.trialEndsAt)
      : new Date(trialStartsAt!.getTime() + FREE_TRIAL_DURATION_MS)
    : null;

  let effectivePlan: SubscriptionPlan = isTrialClaimed
    ? ((subRecord?.plan as SubscriptionPlan) || "free_trial")
    : (subRecord?.plan === "pro" || subRecord?.plan === "premium")
    ? (subRecord.plan as SubscriptionPlan)
    : "unclaimed";
  let effectiveStatus: SubscriptionStatus = (subRecord?.status as SubscriptionStatus) || "active";
  let subStartsAt: Date | null = subRecord?.subscriptionStartsAt ? new Date(subRecord.subscriptionStartsAt) : null;
  let subEndsAt: Date | null = subRecord?.subscriptionEndsAt ? new Date(subRecord.subscriptionEndsAt) : null;
  let pausedProDays = Number(subRecord?.pausedProDaysRemaining) || 0;
  let pausedPremiumDays = Number(subRecord?.pausedPremiumDaysRemaining) || 0;

  // 1. Check if paid subscription is expired
  if (subEndsAt && subEndsAt.getTime() <= now.getTime()) {
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
      effectivePlan = "free_after_trial";
      effectiveStatus = "active";
      await updateSubscriptionRecord(userId, {
        plan: "free_after_trial",
        status: "active",
      });
    }
  }

  // 2. Evaluate claimed Free Trial status & expiration (20 days from trialClaimedAt)
  if (effectivePlan !== "pro" && effectivePlan !== "premium") {
    if (isTrialClaimed && trialEndsAt) {
      if (now.getTime() >= trialEndsAt.getTime()) {
        if (effectivePlan !== "free_after_trial") {
          effectivePlan = "free_after_trial";
          effectiveStatus = "active";
          await updateSubscriptionRecord(userId, {
            plan: "free_after_trial",
            status: "active",
          });
        }
      } else {
        effectivePlan = "free_trial";
      }
    } else if (subEndsAt && subEndsAt.getTime() <= now.getTime()) {
      effectivePlan = "free_after_trial";
    } else {
      effectivePlan = "unclaimed";
    }
  }

  const isTrialActive =
    isTrialClaimed &&
    effectivePlan === "free_trial" &&
    trialEndsAt !== null &&
    now.getTime() < trialEndsAt.getTime();

  const isPaidActive =
    (effectivePlan === "pro" || effectivePlan === "premium") &&
    subEndsAt != null &&
    subEndsAt.getTime() > now.getTime();

  const daysLeftInTrial =
    isTrialActive && trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000))
      : 0;

  const daysLeftInSubscription =
    isPaidActive && subEndsAt
      ? Math.max(0, Math.ceil((subEndsAt.getTime() - now.getTime()) / 86400000))
      : 0;

  // Calculate rolling 30-day personal cycle for Free-After-Trial users
  let freeCycleStartsAt: Date | null = null;
  let freeCycleEndsAt: Date | null = null;
  let daysLeftInFreeCycle = 0;

  if (effectivePlan === "free_after_trial") {
    const cycleAnchor = trialEndsAt || subEndsAt || now;
    const msSinceAnchor = Math.max(0, now.getTime() - cycleAnchor.getTime());
    const cycleDurationMs = 30 * 86400000;
    const cycleIndex = Math.floor(msSinceAnchor / cycleDurationMs);
    freeCycleStartsAt = new Date(cycleAnchor.getTime() + cycleIndex * cycleDurationMs);
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
        effectivePlan = isTrialActive
          ? "free_trial"
          : isTrialClaimed
          ? "free_after_trial"
          : "unclaimed";
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

  const finalDaysLeftInSubscription =
    finalPaidActive && finalSubEndsAt
      ? Math.max(0, Math.ceil((finalSubEndsAt.getTime() - now.getTime()) / 86400000))
      : 0;

  const trialStatus: TrialStatus = isTrialActive
    ? "active"
    : isTrialClaimed || effectivePlan === "free_after_trial"
    ? "expired"
    : "unclaimed";

  return {
    userId,
    plan: effectivePlan,
    trialStatus,
    status: effectiveStatus,
    accountStatus: userAccountStatus,
    trialClaimedAt,
    isTrialClaimed,
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

/**
 * Explicitly claim the 20-day Free Trial for an authenticated user.
 * Atomic and idempotent per user:
 * - If unclaimed: records `trialClaimedAt = now`, `trialStartsAt = now`, `trialEndsAt = now + 20 days`.
 * - If already active: returns existing active trial state (`alreadyClaimed: true`) without resetting or extending.
 * - If already expired: rejects (`FORBIDDEN`) — users cannot claim a second free trial.
 * - If active paid subscription (`pro` or `premium`): rejects (`BAD_REQUEST`) — never downgrades paid plan.
 */
export async function claimFreeTrialPlan(userId: number, nowOverride?: Date): Promise<ClaimFreePlanResult> {
  const existingLock = inFlightClaims.get(userId);
  if (existingLock) {
    return await existingLock;
  }

  const claimPromise = executeClaimFreeTrialPlan(userId, nowOverride).finally(() => {
    inFlightClaims.delete(userId);
  });
  inFlightClaims.set(userId, claimPromise);
  return await claimPromise;
}

async function executeClaimFreeTrialPlan(userId: number, nowOverride?: Date): Promise<ClaimFreePlanResult> {
  const now = nowOverride ? new Date(nowOverride.getTime()) : new Date();
  const currentSub = await getUserSubscription(userId, now);

  if (currentSub.accountStatus !== "active") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Account is not active.",
    });
  }

  // State 4: Paid Subscription Active — do not overwrite or downgrade
  if (currentSub.isPaidActive || currentSub.plan === "pro" || currentSub.plan === "premium") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You already have an active paid subscription.",
    });
  }

  // State 2: Free Trial Already Active — idempotent success without resetting timestamps
  if (currentSub.isTrialClaimed && currentSub.isTrialActive) {
    const usage = await getUserUsage(userId, now);
    return {
      success: true,
      alreadyClaimed: true,
      subscription: currentSub,
      usage,
    };
  }

  // State 3: Free Trial Expired — cannot claim another trial
  if (currentSub.isTrialClaimed || currentSub.trialStatus === "expired" || currentSub.plan === "free_after_trial") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your 20-day Free Trial has already expired. Upgrade to Pro or Premium to continue.",
    });
  }

  // State 1: Unclaimed -> Activate 20-day Free Trial starting at `now`
  const trialClaimedAt = new Date(now.getTime());
  const trialStartsAt = new Date(trialClaimedAt.getTime());
  const trialEndsAt = new Date(trialStartsAt.getTime() + FREE_TRIAL_DURATION_MS);

  const existingRecord = inMemorySubscriptions.get(userId);
  const newRecord = {
    ...(existingRecord || {}),
    userId,
    plan: "free_trial" as const,
    status: "active" as const,
    trialClaimedAt,
    trialStartsAt,
    trialEndsAt,
    subscriptionStartsAt: existingRecord?.subscriptionStartsAt ?? null,
    subscriptionEndsAt: existingRecord?.subscriptionEndsAt ?? null,
    pausedProDaysRemaining: existingRecord?.pausedProDaysRemaining ?? 0,
    pausedPremiumDaysRemaining: existingRecord?.pausedPremiumDaysRemaining ?? 0,
    freeCycleStartsAt: null,
    freeCycleEndsAt: null,
    createdAt: existingRecord?.createdAt ?? now,
    updatedAt: now,
  };

  inMemorySubscriptions.set(userId, newRecord);

  if (process.env.NODE_ENV !== "test") {
    try {
      await setSetting(`user_subscription_${userId}`, JSON.stringify(newRecord));
    } catch {}
  }

  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
      if (rows.length > 0) {
        await db
          .update(subscriptions)
          .set({
            plan: "free_trial",
            status: "active",
            trialClaimedAt,
            trialStartsAt,
            trialEndsAt,
            freeCycleStartsAt: null,
            freeCycleEndsAt: null,
            updatedAt: now,
          } as any)
          .where(eq(subscriptions.userId, userId));
      } else {
        await db.insert(subscriptions).values({
          userId,
          plan: "free_trial",
          status: "active",
          trialClaimedAt,
          trialStartsAt,
          trialEndsAt,
          subscriptionStartsAt: null,
          subscriptionEndsAt: null,
          pausedProDaysRemaining: 0,
          pausedPremiumDaysRemaining: 0,
          freeCycleStartsAt: null,
          freeCycleEndsAt: null,
        } as any);
      }
    } catch (err) {
      // Fallback if DB column trialClaimedAt is not yet migrated in remote DB
      try {
        const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
        if (rows.length > 0) {
          await db
            .update(subscriptions)
            .set({
              plan: "free_trial",
              status: "active",
              trialStartsAt,
              trialEndsAt,
              freeCycleStartsAt: null,
              freeCycleEndsAt: null,
              updatedAt: now,
            })
            .where(eq(subscriptions.userId, userId));
        } else {
          await db.insert(subscriptions).values({
            userId,
            plan: "free_trial",
            status: "active",
            trialStartsAt,
            trialEndsAt,
            subscriptionStartsAt: null,
            subscriptionEndsAt: null,
            pausedProDaysRemaining: 0,
            pausedPremiumDaysRemaining: 0,
            freeCycleStartsAt: null,
            freeCycleEndsAt: null,
          });
        }
      } catch {}
    }
  }

  const updatedSub = await getUserSubscription(userId, now);
  const updatedUsage = await getUserUsage(userId, now);

  return {
    success: true,
    alreadyClaimed: false,
    subscription: updatedSub,
    usage: updatedUsage,
  };
}

async function updateSubscriptionRecord(userId: number, updates: Partial<Subscription>): Promise<void> {
  const existing = inMemorySubscriptions.get(userId) || {};
  const merged = { ...existing, ...updates, updatedAt: new Date() };
  inMemorySubscriptions.set(userId, merged);

  if (process.env.NODE_ENV !== "test") {
    try {
      await setSetting(`user_subscription_${userId}`, JSON.stringify(merged));
    } catch {}
  }

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

  if (process.env.NODE_ENV !== "test") {
    try {
      const userVids = inMemorySavedVideos.filter((v) => v.userId === userId);
      await setSetting(`saved_videos_${userId}`, JSON.stringify(userVids));
    } catch {}
  }

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

  if (process.env.NODE_ENV !== "test") {
    try {
      const userVids = inMemorySavedVideos.filter((v) => v.userId === userId);
      await setSetting(`saved_videos_${userId}`, JSON.stringify(userVids));
    } catch {}
  }

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
  if (process.env.NODE_ENV !== "test" && !inMemorySavedVideos.some((v) => v.userId === userId)) {
    try {
      const raw = await getSetting(`saved_videos_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (!inMemorySavedVideos.some((v) => v.userId === userId && v.videoUrl === item.videoUrl)) {
              inMemorySavedVideos.push({
                ...item,
                createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
              });
            }
          }
        }
      }
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
  const { getUserTrades } = await import("../../db");
  const trades = await getUserTrades(userId);
  if (!cycleStart) return trades.length;
  const cycleStartStr = cycleStart.toISOString().slice(0, 10);
  return trades.filter((t) => (t.date && t.date >= cycleStartStr) || (t.createdAt && new Date(t.createdAt) >= cycleStart)).length;
}

/**
 * Get unique discipline days logged in current cycle (for free-after-trial 5-day limit)
 */
export async function getDisciplineDaysInCycle(userId: number, cycleStart?: Date | null): Promise<number> {
  const cycleStartStr = cycleStart ? cycleStart.toISOString().slice(0, 10) : "";
  try {
    const { getUserCompletedDisciplineDates } = await import("../discipline/repo");
    const dates = await getUserCompletedDisciplineDates(userId, cycleStartStr);
    return dates.length;
  } catch (err) {
    console.warn("[getDisciplineDaysInCycle error]:", err);
    return 0;
  }
}

/**
 * Get comprehensive usage details and limits for the user
 */
export async function getUserUsage(userId: number, nowOverride?: Date): Promise<UserUsage> {
  const sub = await getUserSubscription(userId, nowOverride);

  // Journal Books
  const { getUserJournalConfig } = await import("../journal");
  const journalConfig = await getUserJournalConfig(userId);
  const journalBooksCount = (journalConfig as any).books ? (journalConfig as any).books.length : 1;

  // Determine current active period for quota counts
  const currentPeriodStart = sub.isPaidActive
    ? sub.subscriptionStartsAt
    : sub.isTrialActive
    ? sub.trialStartsAt
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
    : sub.plan === "free_after_trial"
    ? sub.daysLeftInFreeCycle
    : 0;

  // Limits based on plan
  let journalEntriesLimit: number | "unlimited" = 0;
  let journalBooksLimit: number | "unlimited" = 0;
  let journalVideosLimit: number | "unlimited" = 0;
  let notebookPagesLimit: number | "unlimited" = 0;
  let notebookVideosLimit: number | "unlimited" = 0;
  let disciplineDaysLimit: number | "unlimited" = 0;

  let isWorkoutLocked = true;
  let isCommunityLocked = true;
  let isMentorSupportLocked = true;
  let isOwnerChatLocked = true;

  if (sub.plan === "unclaimed") {
    journalEntriesLimit = 0;
    journalBooksLimit = 0;
    journalVideosLimit = 0;
    notebookPagesLimit = 0;
    notebookVideosLimit = 0;
    disciplineDaysLimit = 0;
    isWorkoutLocked = true;
    isCommunityLocked = true;
    isMentorSupportLocked = true;
    isOwnerChatLocked = true;
  } else if (sub.plan === "free_trial") {
    journalEntriesLimit = "unlimited";
    journalBooksLimit = 1;
    journalVideosLimit = 0;
    notebookPagesLimit = 10;
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
    trialStatus: sub.trialStatus,
    trialDurationDays: FREE_TRIAL_DURATION_DAYS,
    status: sub.status,
    accountStatus: sub.accountStatus,
    daysLeft,
    trialClaimedAt: sub.trialClaimedAt,
    isTrialClaimed: sub.isTrialClaimed,
    isTrialActive: sub.isTrialActive,
    isPaidActive: sub.isPaidActive,
    trialStartsAt: sub.trialStartsAt,
    trialEndsAt: sub.trialEndsAt,
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

export const UNCLAIMED_TRIAL_REASON =
  "Activate your 20-day Free Trial to start using the available Journal and Private Trader Notebook features. Your trial begins only after you confirm your claim.";

export async function canCreateJournalBook(
  userId: number,
  currentBookCount: number,
  nowOverride?: Date
): Promise<{ allowed: boolean; code?: string; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "unclaimed") {
    return {
      allowed: false,
      code: "TRIAL_UNCLAIMED",
      reason: UNCLAIMED_TRIAL_REASON,
    };
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

export async function canCreateTradeEntry(
  userId: number,
  nowOverride?: Date
): Promise<{ allowed: boolean; code?: string; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "unclaimed") {
    return {
      allowed: false,
      code: "TRIAL_UNCLAIMED",
      reason: UNCLAIMED_TRIAL_REASON,
    };
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

export async function canSaveVideo(
  userId: number,
  source: "journal" | "notebook",
  nowOverride?: Date
): Promise<{ allowed: boolean; code?: string; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "unclaimed") {
    return {
      allowed: false,
      code: "TRIAL_UNCLAIMED",
      reason: UNCLAIMED_TRIAL_REASON,
    };
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

export async function canCreateNotebookPage(
  userId: number,
  nowOverride?: Date
): Promise<{ allowed: boolean; code?: string; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "unclaimed") {
    return {
      allowed: false,
      code: "TRIAL_UNCLAIMED",
      reason: UNCLAIMED_TRIAL_REASON,
    };
  }
  if (sub.plan === "free_after_trial") {
    return {
      allowed: false,
      reason: "Your 20-day Free Trial has expired. Upgrade to Pro (10 pages/month) or Premium (Unlimited) to create new notebook pages.",
    };
  }
  if (sub.plan === "free_trial") {
    const activePages = await getActiveNotebookPagesCount(userId, sub.trialStartsAt);
    if (activePages >= 10) {
      return {
        allowed: false,
        reason: "You have reached the Free Trial Notebook page limit (10/10). Upgrade to Pro or Premium for more pages.",
      };
    }
    return { allowed: true };
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

export async function canSaveNotebookContent(
  userId: number,
  nowOverride?: Date
): Promise<{ allowed: boolean; code?: string; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "unclaimed") {
    return {
      allowed: false,
      code: "TRIAL_UNCLAIMED",
      reason: UNCLAIMED_TRIAL_REASON,
    };
  }
  if (sub.plan === "free_after_trial") {
    return {
      allowed: false,
      reason: "Your 20-day Free Trial has expired. Upgrade to Pro or Premium to add or edit notebook content.",
    };
  }
  return { allowed: true };
}

export async function canAccessWorkout(userId: number, nowOverride?: Date): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "unclaimed" || sub.plan === "free_trial" || sub.plan === "free_after_trial") {
    return {
      allowed: false,
      reason: "Workout Routine & Completion is available with Pro and Premium. Upgrade to unlock structured workout checklists and tracking.",
    };
  }
  return { allowed: true };
}

export async function canLogDiscipline(userId: number, date: string, nowOverride?: Date): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "free_after_trial") {
    try {
      const { isDisciplineDateAlreadyLogged, getUserCompletedDisciplineDates } = await import("../discipline/repo");
      const alreadyHasDate = await isDisciplineDateAlreadyLogged(userId, date);
      if (alreadyHasDate) {
        // User already logged on this specific date in current cycle, allow toggling tasks
        return { allowed: true };
      }
      const cycleStartStr = sub.freeCycleStartsAt ? sub.freeCycleStartsAt.toISOString().slice(0, 10) : "";
      const uniqueDates = await getUserCompletedDisciplineDates(userId, cycleStartStr);
      if (uniqueDates.length >= 5) {
        return {
          allowed: false,
          reason: "You have reached your free monthly Daily Discipline limit (5/5 days). Upgrade to Pro or Premium for more access.",
        };
      }
    } catch (err) {
      console.warn("[canLogDiscipline check error]:", err);
    }
  }
  return { allowed: true };
}

export async function canAccessCommunity(userId: number, nowOverride?: Date): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
  if (sub.accountStatus !== "active") {
    return { allowed: false, reason: "Account is not active." };
  }
  if (sub.plan === "unclaimed" || sub.plan === "free_trial" || sub.plan === "free_after_trial") {
    return {
      allowed: false,
      reason: "Community Chat access is available with Pro and Premium. Upgrade to join the community.",
    };
  }
  return { allowed: true };
}

export async function canAccessMentorSupport(userId: number, nowOverride?: Date): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
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

export async function canAccessOwnerChat(userId: number, nowOverride?: Date): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(userId, nowOverride);
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
