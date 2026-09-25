import { eq, and, desc } from "drizzle-orm";
import {
  users,
  userManualAccess,
  userAccessAuditLogs,
  entitlements,
  subscriptions,
  User,
  UserManualAccess,
  UserAccessAuditLog,
} from "../drizzle/schema";
import { getDb, getSetting, setSetting, getUserById, listAllUsers, listEntitlements, listAllOrders } from "./db";
import { getUserSubscription, getRawUserSubscription, SubscriptionPlan } from "./subscription";

export type AccessType = "course" | "pro" | "premium";

export interface UserAccessState {
  status: "on" | "off";
  accessType: "automatic" | "manual"; // Strictly for Admin visibility
  startDate: string | null;
  expiryDate: string | null;
  isLifetime: boolean;
  isOverrideBlocked: boolean; // true if Admin explicitly disabled/blocked
  automaticActive: boolean;
  automaticExpiry: string | null;
  manualActive: boolean;
  effectiveActive: boolean;
}

export interface UserManagementSummary {
  id: number;
  displayId: string; // e.g. "USER-0001"
  openId: string;
  name: string;
  email: string | null;
  isGoogleAuth: boolean;
  username: string | null;
  avatar: string | null;
  accountStatus: "active" | "suspended" | "banned";
  role: "user" | "admin" | "support";
  createdAt: string;
  lastSignedIn: string;
  courseAccess: UserAccessState;
  proAccess: UserAccessState;
  premiumAccess: UserAccessState;
  isCourseOn: boolean;
  isProOn: boolean;
  isPremiumOn: boolean;
  effectivePlan: SubscriptionPlan;
}

export function formatDisplayUserId(numericId: number): string {
  if (!numericId || numericId <= 0) return "USER-0001";
  return `USER-${String(numericId).padStart(4, "0")}`;
}

// In-memory fallbacks for test isolation and offline resilience
const inMemoryManualAccess = new Map<string, any>();
const inMemoryAuditLogs: any[] = [];
let autoAuditLogId = 1;
let autoManualAccessId = 1;

function getStoreKey(userId: number, accessType: AccessType): string {
  return `${userId}:${accessType}`;
}

/**
 * Retrieve manual access record for a specific user and access type.
 */
export async function getManualAccessRecord(userId: number, accessType: AccessType): Promise<any | null> {
  const key = getStoreKey(userId, accessType);
  const db = await getDb();

  if (db) {
    try {
      const rows = await db
        .select()
        .from(userManualAccess)
        .where(and(eq(userManualAccess.userId, userId), eq(userManualAccess.accessType, accessType)))
        .limit(1);
      if (rows.length > 0) {
        inMemoryManualAccess.set(key, rows[0]);
        return rows[0];
      }
    } catch (err) {
      // Fallback to in-memory
    }
  }

  // Try in-memory
  const mem = inMemoryManualAccess.get(key);
  if (mem) return mem;

  // Try persistent settings
  try {
    const raw = await getSetting(`manual_access_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      inMemoryManualAccess.set(key, parsed);
      return parsed;
    }
  } catch (err) {}

  return null;
}

/**
 * Check if a manual grant is currently active based on dates and lifetime flag.
 */
export function isManualRecordActive(record: any, now: Date = new Date()): boolean {
  if (!record) return false;
  if (record.status !== "on") return false;
  if (record.isOverrideBlocked) return false;
  if (record.startDate) {
    const start = new Date(record.startDate);
    if (start.getTime() > now.getTime()) return false;
  }
  if (record.isLifetime) return true;

  if (record.expiryDate) {
    const exp = new Date(record.expiryDate);
    return exp.getTime() > now.getTime();
  }

  // If no expiry date and status is on, treat as active
  return true;
}

/**
 * Canonical check for whether a user has active Course access.
 * Considers automatic entitlements, manual grants, start/expiry dates, lifetime, and admin override blocks.
 */
export async function hasUserCourseAccess(userId: number, now: Date = new Date()): Promise<boolean> {
  const manualCourse = await getManualAccessRecord(userId, "course");
  const courseOverrideBlocked = manualCourse?.isOverrideBlocked === true;
  if (courseOverrideBlocked) return false;

  const manualCourseActive = isManualRecordActive(manualCourse, now);
  if (manualCourseActive) return true;

  // Check automatic course entitlement from approved orders / entitlements
  try {
    const userEntitlements = await listEntitlements(userId);
    const autoCourseActive = (userEntitlements || []).some((e: any) => {
      if (e.isVirtualManual) return false;
      return (
        e.scope === "course" ||
        e.scope === "bundle:2" ||
        e.scope === "bundle:3" ||
        e.scope === "bundle:4" ||
        e.bundleId === 2 ||
        e.bundleId === 3 ||
        e.bundleId === 4
      );
    });
    if (autoCourseActive) return true;
  } catch (err) {}

  return false;
}

/**
 * Calculate the complete access states (Course, Pro, Premium) for a user,
 * combining Automatic Entitlements, Manual Grants, and Admin Overrides.
 */
export async function getUserAccessStates(userId: number): Promise<{
  course: UserAccessState;
  pro: UserAccessState;
  premium: UserAccessState;
  effectivePlan: SubscriptionPlan;
}> {
  const now = new Date();
  const rawSub = await getRawUserSubscription(userId);
  const sub = await getUserSubscription(userId);

  // 1. Fetch manual records
  const [manualCourse, manualPro, manualPremium] = await Promise.all([
    getManualAccessRecord(userId, "course"),
    getManualAccessRecord(userId, "pro"),
    getManualAccessRecord(userId, "premium"),
  ]);

  // 2. Determine automatic states
  // Automatic Pro:
  const autoProActive = rawSub.isPaidActive && rawSub.plan === "pro";
  const autoProExpiry = autoProActive && rawSub.subscriptionEndsAt ? new Date(rawSub.subscriptionEndsAt).toISOString() : null;

  // Automatic Premium:
  const autoPremiumActive = rawSub.isPaidActive && rawSub.plan === "premium";
  const autoPremiumExpiry = autoPremiumActive && rawSub.subscriptionEndsAt ? new Date(rawSub.subscriptionEndsAt).toISOString() : null;

  // Automatic Course: Check entitlements and approved orders
  let autoCourseActive = false;
  try {
    const userEntitlements = await listEntitlements(userId);
    autoCourseActive = (userEntitlements || []).some((e: any) => {
      if (e.isVirtualManual) return false; // don't count virtual manual
      return (
        e.scope === "course" ||
        e.scope === "bundle:2" ||
        e.scope === "bundle:3" ||
        e.scope === "bundle:4" ||
        e.bundleId === 2 ||
        e.bundleId === 3 ||
        e.bundleId === 4
      );
    });
  } catch (err) {}

  // 3. Evaluate Course Access
  const manualCourseActive = isManualRecordActive(manualCourse, now);
  const courseOverrideBlocked = manualCourse?.isOverrideBlocked === true;
  const effectiveCourseActive = !courseOverrideBlocked && (manualCourseActive || autoCourseActive);

  const courseState: UserAccessState = {
    status: effectiveCourseActive ? "on" : "off",
    accessType: manualCourseActive ? "manual" : "automatic",
    startDate: manualCourse?.startDate ? new Date(manualCourse.startDate).toISOString() : null,
    expiryDate: manualCourse?.isLifetime
      ? "LIFETIME"
      : manualCourse?.expiryDate
      ? new Date(manualCourse.expiryDate).toISOString()
      : null,
    isLifetime: !!manualCourse?.isLifetime,
    isOverrideBlocked: courseOverrideBlocked,
    automaticActive: autoCourseActive,
    automaticExpiry: null,
    manualActive: manualCourseActive,
    effectiveActive: effectiveCourseActive,
  };

  // 4. Evaluate Pro Access
  const manualProActive = isManualRecordActive(manualPro, now);
  const proOverrideBlocked = manualPro?.isOverrideBlocked === true;
  const effectiveProActive = !proOverrideBlocked && (manualProActive || autoProActive);

  const proState: UserAccessState = {
    status: effectiveProActive ? "on" : "off",
    accessType: manualProActive ? "manual" : "automatic",
    startDate: manualPro?.startDate ? new Date(manualPro.startDate).toISOString() : null,
    expiryDate: manualPro?.isLifetime
      ? "LIFETIME"
      : manualPro?.expiryDate
      ? new Date(manualPro.expiryDate).toISOString()
      : null,
    isLifetime: !!manualPro?.isLifetime,
    isOverrideBlocked: proOverrideBlocked,
    automaticActive: autoProActive,
    automaticExpiry: autoProExpiry,
    manualActive: manualProActive,
    effectiveActive: effectiveProActive,
  };

  // 5. Evaluate Premium Access
  const manualPremiumActive = isManualRecordActive(manualPremium, now);
  const premiumOverrideBlocked = manualPremium?.isOverrideBlocked === true;
  const effectivePremiumActive = !premiumOverrideBlocked && (manualPremiumActive || autoPremiumActive);

  const premiumState: UserAccessState = {
    status: effectivePremiumActive ? "on" : "off",
    accessType: manualPremiumActive ? "manual" : "automatic",
    startDate: manualPremium?.startDate ? new Date(manualPremium.startDate).toISOString() : null,
    expiryDate: manualPremium?.isLifetime
      ? "LIFETIME"
      : manualPremium?.expiryDate
      ? new Date(manualPremium.expiryDate).toISOString()
      : null,
    isLifetime: !!manualPremium?.isLifetime,
    isOverrideBlocked: premiumOverrideBlocked,
    automaticActive: autoPremiumActive,
    automaticExpiry: autoPremiumExpiry,
    manualActive: manualPremiumActive,
    effectiveActive: effectivePremiumActive,
  };

  // 6. Effective Plan resolution
  // If both Pro and Premium are ON, Premium features take precedence for overlaps
  let effectivePlan: SubscriptionPlan = "free_after_trial";
  if (effectivePremiumActive) {
    effectivePlan = "premium";
  } else if (effectiveProActive) {
    effectivePlan = "pro";
  } else if (sub.isTrialActive) {
    effectivePlan = "free_trial";
  } else {
    effectivePlan = "free_after_trial";
  }

  return {
    course: courseState,
    pro: proState,
    premium: premiumState,
    effectivePlan,
  };
}

/**
 * Set manual access or override for a user with audit logging.
 */
export async function setUserAccess(
  adminId: number,
  adminName: string,
  params: {
    userId: number;
    accessType: AccessType;
    status: "on" | "off";
    startDate?: Date | string | null;
    expiryDate?: Date | string | null;
    isLifetime?: boolean;
    isOverrideBlocked?: boolean;
    notes?: string;
  }
): Promise<{ success: boolean; state: UserAccessState }> {
  const { userId, accessType, status, isLifetime, notes } = params;
  const now = new Date();
  const key = getStoreKey(userId, accessType);

  const existingRecord = await getManualAccessRecord(userId, accessType);
  const prevEffectiveState = existingRecord?.status === "on" ? "ON" : existingRecord?.isOverrideBlocked ? "BLOCKED" : "OFF";

  let start: Date | null = params.startDate ? new Date(params.startDate) : now;
  let exp: Date | null = isLifetime ? null : params.expiryDate ? new Date(params.expiryDate) : null;

  // Default duration for ON if not lifetime and no expiry specified: 30 days
  if (status === "on" && !isLifetime && !exp) {
    exp = new Date(start.getTime() + 30 * 86400000);
  }

  // If status is OFF, determine if it is an explicit override block
  const isOverrideBlocked = params.isOverrideBlocked !== undefined ? params.isOverrideBlocked : status === "off";

  const newRecord: any = {
    id: existingRecord?.id || autoManualAccessId++,
    userId,
    accessType,
    status,
    isOverrideBlocked,
    startDate: start,
    expiryDate: exp,
    isLifetime: !!isLifetime,
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now,
  };

  inMemoryManualAccess.set(key, newRecord);

  // Persist to database
  const db = await getDb();
  if (db) {
    try {
      if (existingRecord?.id) {
        await db
          .update(userManualAccess)
          .set({
            status,
            isOverrideBlocked,
            startDate: start,
            expiryDate: exp,
            isLifetime: !!isLifetime,
            updatedAt: now,
          })
          .where(eq(userManualAccess.id, existingRecord.id));
      } else {
        await db.insert(userManualAccess).values({
          userId,
          accessType,
          status,
          isOverrideBlocked,
          startDate: start,
          expiryDate: exp,
          isLifetime: !!isLifetime,
        });
      }
    } catch (err) {
      console.warn("[setUserAccess DB warning]:", err);
    }
  }

  // Persist to settings fallback
  try {
    await setSetting(`manual_access_${key}`, JSON.stringify(newRecord));
  } catch (err) {}

  // Record Audit Log
  const newEffectiveState = status === "on" ? (isLifetime ? "ON (Lifetime)" : `ON (until ${exp?.toISOString().split("T")[0]})`) : (isOverrideBlocked ? "BLOCKED (Admin Override)" : "OFF");

  const auditEntry: any = {
    id: autoAuditLogId++,
    userId,
    accessType,
    previousState: prevEffectiveState,
    newState: newEffectiveState,
    startDate: start,
    expiryDate: exp,
    isLifetime: !!isLifetime,
    adminId,
    adminName: adminName || "Admin",
    notes: notes || null,
    createdAt: now,
  };

  inMemoryAuditLogs.unshift(auditEntry);

  if (db) {
    try {
      await db.insert(userAccessAuditLogs).values({
        userId,
        accessType,
        previousState: prevEffectiveState,
        newState: newEffectiveState,
        startDate: start,
        expiryDate: exp,
        isLifetime: !!isLifetime,
        adminId,
        adminName: adminName || "Admin",
        notes: notes || null,
      });
    } catch (err) {
      console.warn("[setUserAccess audit DB warning]:", err);
    }
  }

  try {
    const rawLogs = await getSetting(`audit_logs_${userId}`);
    const logsArr = rawLogs ? JSON.parse(rawLogs) : [];
    logsArr.unshift(auditEntry);
    await setSetting(`audit_logs_${userId}`, JSON.stringify(logsArr.slice(0, 100)));
  } catch (err) {}

  const fullStates = await getUserAccessStates(userId);
  return { success: true, state: fullStates[accessType] };
}

/**
 * Clear Admin Override / Restore automatic access.
 */
export async function clearUserAccessOverride(
  adminId: number,
  adminName: string,
  userId: number,
  accessType: AccessType
): Promise<{ success: boolean; state: UserAccessState }> {
  const existingRecord = await getManualAccessRecord(userId, accessType);
  const prevEffectiveState = existingRecord?.isOverrideBlocked ? "BLOCKED (Admin Override)" : "OFF";

  const key = getStoreKey(userId, accessType);
  const now = new Date();

  const updatedRecord = {
    id: existingRecord?.id || autoManualAccessId++,
    userId,
    accessType,
    status: "off" as const,
    isOverrideBlocked: false,
    startDate: null,
    expiryDate: null,
    isLifetime: false,
    updatedAt: now,
  };

  inMemoryManualAccess.set(key, updatedRecord);

  const db = await getDb();
  if (db && existingRecord?.id) {
    try {
      await db
        .update(userManualAccess)
        .set({
          status: "off",
          isOverrideBlocked: false,
          startDate: null,
          expiryDate: null,
          isLifetime: false,
          updatedAt: now,
        })
        .where(eq(userManualAccess.id, existingRecord.id));
    } catch (err) {}
  }

  try {
    await setSetting(`manual_access_${key}`, JSON.stringify(updatedRecord));
  } catch (err) {}

  // Audit entry for clearing restriction
  const auditEntry: any = {
    id: autoAuditLogId++,
    userId,
    accessType,
    previousState: prevEffectiveState,
    newState: "OVERRIDE CLEARED (Automatic Restored)",
    startDate: null,
    expiryDate: null,
    isLifetime: false,
    adminId,
    adminName: adminName || "Admin",
    notes: "Admin removed manual restriction. Automatic entitlement restored.",
    createdAt: now,
  };
  inMemoryAuditLogs.unshift(auditEntry);

  if (db) {
    try {
      await db.insert(userAccessAuditLogs).values({
        userId,
        accessType,
        previousState: prevEffectiveState,
        newState: "OVERRIDE CLEARED (Automatic Restored)",
        startDate: null,
        expiryDate: null,
        isLifetime: false,
        adminId,
        adminName: adminName || "Admin",
        notes: "Admin removed manual restriction. Automatic entitlement restored.",
      });
    } catch (err) {}
  }

  const fullStates = await getUserAccessStates(userId);
  return { success: true, state: fullStates[accessType] };
}

/**
 * Get audit logs for a user or all users.
 */
export async function getUserAuditLogs(userId?: number): Promise<UserAccessAuditLog[]> {
  const db = await getDb();
  if (db) {
    try {
      const query = db.select().from(userAccessAuditLogs).orderBy(desc(userAccessAuditLogs.createdAt));
      if (userId) {
        const rows = await query.where(eq(userAccessAuditLogs.userId, userId));
        return rows as any;
      }
      const rows = await query.limit(100);
      return rows as any;
    } catch (err) {}
  }

  if (userId) {
    try {
      const raw = await getSetting(`audit_logs_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch (err) {}
    return inMemoryAuditLogs.filter((l) => l.userId === userId);
  }

  return inMemoryAuditLogs;
}

/**
 * List all users for the Admin User Management table with real-time profile sync,
 * stable display ID (USER-0001), account status, and 3 access flags.
 */
export async function listUsersForManagement(filters?: {
  search?: string;
  accountStatus?: string;
  courseAccess?: string;
  proAccess?: string;
  premiumAccess?: string;
}): Promise<UserManagementSummary[]> {
  const usersList = await listAllUsers();

  const results: UserManagementSummary[] = await Promise.all(
    usersList.map(async (u: any) => {
      const numericId = Number(u.id);
      const displayId = formatDisplayUserId(numericId);
      const accessStates = await getUserAccessStates(numericId);

      const email = u.email || null;
      const isGoogleAuth =
        (u.loginMethod && u.loginMethod.toLowerCase().includes("google")) ||
        (email && email.toLowerCase().endsWith("@gmail.com"));

      const createdAtStr = u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString();
      const lastSignedInStr = u.lastSignedIn ? new Date(u.lastSignedIn).toISOString() : createdAtStr;

      return {
        id: numericId,
        displayId,
        openId: u.openId || `usr_${numericId}`,
        name: u.name || "Trader",
        email,
        isGoogleAuth: !!isGoogleAuth,
        username: u.username || null,
        avatar: u.avatar || null,
        accountStatus: (u.accountStatus || "active") as any,
        role: (u.role || "user") as any,
        createdAt: createdAtStr,
        lastSignedIn: lastSignedInStr,
        courseAccess: accessStates.course,
        proAccess: accessStates.pro,
        premiumAccess: accessStates.premium,
        isCourseOn: accessStates.course.status === "on",
        isProOn: accessStates.pro.status === "on",
        isPremiumOn: accessStates.premium.status === "on",
        effectivePlan: accessStates.effectivePlan,
      };
    })
  );

  // Apply filters
  let filtered = results;

  if (filters?.search && filters.search.trim().length > 0) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter((u) => {
      const matchDisplayId = u.displayId.toLowerCase().includes(q);
      const matchNumericId = String(u.id) === q;
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email ? u.email.toLowerCase().includes(q) : false;
      const matchUsername = u.username ? u.username.toLowerCase().includes(q) : false;
      return matchDisplayId || matchNumericId || matchName || matchEmail || matchUsername;
    });
  }

  if (filters?.accountStatus && filters.accountStatus !== "all") {
    filtered = filtered.filter((u) => u.accountStatus === filters.accountStatus);
  }

  if (filters?.courseAccess && filters.courseAccess !== "all") {
    const shouldBeOn = filters.courseAccess === "on";
    filtered = filtered.filter((u) => u.isCourseOn === shouldBeOn);
  }

  if (filters?.proAccess && filters.proAccess !== "all") {
    const shouldBeOn = filters.proAccess === "on";
    filtered = filtered.filter((u) => u.isProOn === shouldBeOn);
  }

  if (filters?.premiumAccess && filters.premiumAccess !== "all") {
    const shouldBeOn = filters.premiumAccess === "on";
    filtered = filtered.filter((u) => u.isPremiumOn === shouldBeOn);
  }

  // Sort: primary by ID ascending
  filtered.sort((a, b) => a.id - b.id);

  return filtered;
}

/**
 * Get detailed information for a single user for the User Management detail modal.
 */
export async function getUserDetailsForManagement(userId: number): Promise<{
  user: UserManagementSummary;
  auditLogs: UserAccessAuditLog[];
}> {
  const usersList = await listUsersForManagement();
  let user = usersList.find((u) => u.id === userId);

  if (!user) {
    // If not found in list, build directly
    const u = await getUserById(userId);
    if (!u) throw new Error(`User with ID ${userId} not found.`);

    const displayId = formatDisplayUserId(userId);
    const accessStates = await getUserAccessStates(userId);
    const email = u.email || null;
    const isGoogleAuth =
      (u.loginMethod && u.loginMethod.toLowerCase().includes("google")) ||
      (email && email.toLowerCase().endsWith("@gmail.com"));

    user = {
      id: userId,
      displayId,
      openId: u.openId || `usr_${userId}`,
      name: u.name || "Trader",
      email,
      isGoogleAuth: !!isGoogleAuth,
      username: (u as any).username || null,
      avatar: u.avatar || null,
      accountStatus: (u.accountStatus || "active") as any,
      role: (u.role || "user") as any,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      lastSignedIn: u.lastSignedIn ? new Date(u.lastSignedIn).toISOString() : new Date().toISOString(),
      courseAccess: accessStates.course,
      proAccess: accessStates.pro,
      premiumAccess: accessStates.premium,
      isCourseOn: accessStates.course.status === "on",
      isProOn: accessStates.pro.status === "on",
      isPremiumOn: accessStates.premium.status === "on",
      effectivePlan: accessStates.effectivePlan,
    };
  }

  const logs = await getUserAuditLogs(userId);

  return {
    user,
    auditLogs: logs,
  };
}
