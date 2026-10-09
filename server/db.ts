import { and, asc, desc, eq, inArray, isNull, ne, or } from "drizzle-orm";
import {
  InsertUser,
  User,
  users,
  verificationTokens,
  products,
  bundles,
  content,
  orders,
  entitlements,
  progress,
  habits,
  disciplineEntries,
  journalEntries,
  supportConversations,
  supportMessages,
  SupportConversation,
  InsertSupportConversation,
  SupportMessage,
  InsertSupportMessage,
  notifications,
  settings,
  auditEvents,
  freeEbooks,
  FreeEbook,
  InsertFreeEbook,
  disciplineTasks,
  disciplineTaskCompletions,
  disciplineExercises,
  disciplineWorkoutCompletions,
  disciplineDailyJournals,
  disciplineForexLogs,
  disciplineSettings,
  DisciplineTask,
  DisciplineExercise,
  DisciplineDailyJournal,
  DisciplineForexLog,
  DisciplineSetting,
  traderTrades,
  TraderTrade,
  InsertTraderTrade,
  courseTelegramPopupEvents,
  CourseTelegramPopupEvent,
  InsertCourseTelegramPopupEvent,
} from "../drizzle/schema";

import { ENV } from "./_core/env";
import { deriveNumericIdFromOpenId } from "@shared/const";
import { supabaseServer } from "./supabase";
import { sendAccessEmail } from "./email";
import { getDb } from "./infra/db/client";
import { getSetting, setSetting } from "./infra/db/settings";
export { getDb, getSetting, setSetting };

export * from "./features/discipline";
import { inMemoryDisciplineCompletions } from "./features/discipline";
export * from "./features/owner-profile";
export * from "./features/account";
export * from "./features/community";
import { orderGrantsCourseAccess, getCourseTelegramPopupConfig, createCourseTelegramPopupEvent } from "./features/community";

export const DEFAULT_FREE_EBOOKS: any[] = [];

// In-memory runtime fallback (strictly initialized with seed data where appropriate)
const inMemoryUsers: Map<string, any> = new Map();
const inMemoryOrders: any[] = [];
const inMemoryEntitlements: any[] = [];
const inMemoryJournal: any[] = [];
const inMemoryDiscipline: any[] = [];
const inMemoryProgress: any[] = [];
const inMemoryConversations: any[] = [];
const inMemoryMessages: any[] = [];
const inMemoryAuditEvents: any[] = [];
const inMemoryFreeEbooks: any[] = [];
const inMemoryTraderTrades: any[] = [];

export function initInstitutionalSeedData() {
  // Disabled: Leaderboard uses only real registered users with real trading records.
  return;
}

let userAutoId = 1;
let journalAutoId = 1;
let conversationAutoId = 1001;
let messageAutoId = 1;
let orderAutoId = 1;
let entitlementAutoId = 1;
let auditAutoId = 1;
let ebookAutoId = 6;



// ------------------------------------------------------------------------------
// PAYMENT GATEWAYS & CHECKOUT CONFIGURATION
// ------------------------------------------------------------------------------

export interface PaymentGatewayDetail {
  number: string;
  accountType: "Personal" | "Merchant" | "Agent";
  isEnabled: boolean;
  instructions?: string;
}

export interface PaymentGatewaysConfig {
  bkash: PaymentGatewayDetail;
  nagad: PaymentGatewayDetail;
  rocket: PaymentGatewayDetail;
  announcement?: string;
  isAnnouncementEnabled?: boolean;
  studentTelegramUrl?: string;
  studentTelegramDescription?: string;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentGatewaysConfig = {
  bkash: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using bKash App or *247#, then copy and enter the Transaction ID (TrxID) below.",
  },
  nagad: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using Nagad App or *167#, then copy and enter the Transaction ID (TrxID) below.",
  },
  rocket: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using Rocket App or *322#, then copy and enter the Transaction ID (TrxID) below.",
  },
  announcement: "Official Payment Numbers Verified. Instant Dashboard Access upon Payment Verification.",
  isAnnouncementEnabled: false,
  studentTelegramUrl: "https://t.me/cycleofchart",
  studentTelegramDescription: "Official Cycle of Chart VIP Student Telegram Community",
};

export async function getPaymentGateways(): Promise<PaymentGatewaysConfig> {
  try {
    const raw = await getSetting("payment_gateways_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        bkash: { ...DEFAULT_PAYMENT_CONFIG.bkash, ...(parsed.bkash || {}) },
        nagad: { ...DEFAULT_PAYMENT_CONFIG.nagad, ...(parsed.nagad || {}) },
        rocket: { ...DEFAULT_PAYMENT_CONFIG.rocket, ...(parsed.rocket || {}) },
        announcement: parsed.announcement !== undefined ? parsed.announcement : DEFAULT_PAYMENT_CONFIG.announcement,
        isAnnouncementEnabled: parsed.isAnnouncementEnabled !== undefined ? parsed.isAnnouncementEnabled : DEFAULT_PAYMENT_CONFIG.isAnnouncementEnabled,
        studentTelegramUrl: parsed.studentTelegramUrl || (await getSetting("student_telegram_url")) || DEFAULT_PAYMENT_CONFIG.studentTelegramUrl,
        studentTelegramDescription: parsed.studentTelegramDescription || DEFAULT_PAYMENT_CONFIG.studentTelegramDescription,
      };
    }
    // Also check legacy individual settings if present
    const legacyBkash = await getSetting("bkash");
    const legacyNagad = await getSetting("nagad");
    const legacyRocket = await getSetting("rocket");
    const legacyAnnouncement = await getSetting("announcement");
    const legacyTelegram = await getSetting("student_telegram_url");
    if (legacyBkash || legacyNagad || legacyRocket || legacyTelegram) {
      return {
        bkash: { ...DEFAULT_PAYMENT_CONFIG.bkash, number: legacyBkash || DEFAULT_PAYMENT_CONFIG.bkash.number },
        nagad: { ...DEFAULT_PAYMENT_CONFIG.nagad, number: legacyNagad || DEFAULT_PAYMENT_CONFIG.nagad.number },
        rocket: { ...DEFAULT_PAYMENT_CONFIG.rocket, number: legacyRocket || DEFAULT_PAYMENT_CONFIG.rocket.number },
        announcement: legacyAnnouncement || DEFAULT_PAYMENT_CONFIG.announcement,
        isAnnouncementEnabled: false,
        studentTelegramUrl: legacyTelegram || DEFAULT_PAYMENT_CONFIG.studentTelegramUrl,
        studentTelegramDescription: DEFAULT_PAYMENT_CONFIG.studentTelegramDescription,
      };
    }
  } catch (err) {
    console.warn("[getPaymentGateways error]:", err);
  }
  return DEFAULT_PAYMENT_CONFIG;
}

export async function updatePaymentGateways(config: Partial<PaymentGatewaysConfig>): Promise<PaymentGatewaysConfig> {
  const current = await getPaymentGateways();
  const updated: PaymentGatewaysConfig = {
    ...current,
    ...config,
    bkash: { ...current.bkash, ...(config.bkash || {}) },
    nagad: { ...current.nagad, ...(config.nagad || {}) },
    rocket: { ...current.rocket, ...(config.rocket || {}) },
    studentTelegramUrl: config.studentTelegramUrl !== undefined ? config.studentTelegramUrl : current.studentTelegramUrl,
    studentTelegramDescription: config.studentTelegramDescription !== undefined ? config.studentTelegramDescription : current.studentTelegramDescription,
  };
  await setSetting("payment_gateways_config", JSON.stringify(updated));
  // Sync legacy individual keys for full backward compatibility
  await setSetting("bkash", updated.bkash.number);
  await setSetting("nagad", updated.nagad.number);
  await setSetting("rocket", updated.rocket.number);
  if (updated.announcement !== undefined) {
    await setSetting("announcement", updated.announcement);
  }
  if (updated.studentTelegramUrl !== undefined) {
    await setSetting("student_telegram_url", updated.studentTelegramUrl);
  }
  return updated;
}

export interface TraderProfileData {
  userId: number;
  openId: string;
  name: string;
  avatar: string | null;
  username?: string | null;
  phone?: string | null;
  role?: string;
  language?: "en" | "bn" | "ur";
  updatedAt?: string;
}

export async function getTraderProfile(openIdOrUserId: string | number): Promise<TraderProfileData | null> {
  try {
    const key = `trader_profile_${openIdOrUserId}`;
    const raw = await getSetting(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[getTraderProfile error]:", err);
  }
  return null;
}

export async function saveTraderProfile(profile: TraderProfileData): Promise<void> {
  try {
    const key = `trader_profile_${profile.openId || profile.userId}`;
    await setSetting(key, JSON.stringify(profile));

    const registryKey = "global_trader_registry";
    const rawRegistry = await getSetting(registryKey);
    let openIds: string[] = [];
    if (rawRegistry) {
      try { openIds = JSON.parse(rawRegistry); } catch {}
    }
    if (profile.openId && !openIds.includes(profile.openId)) {
      openIds.push(profile.openId);
      await setSetting(registryKey, JSON.stringify(openIds));
    }
  } catch (err) {
    console.warn("[saveTraderProfile error]:", err);
  }
}

export async function updateUserProfile(
  userId: number,
  openId: string | undefined,
  updates: { name?: string; phone?: string | null; language?: "en" | "bn" | "ur"; avatar?: string | null; username?: string | null }
): Promise<void> {
  const resolvedOpenId = openId || (userId ? `usr_${userId}` : "");

  if (resolvedOpenId) {
    const existing = inMemoryUsers.get(resolvedOpenId);
    if (existing) {
      if (updates.name) existing.name = updates.name;
      if (updates.phone !== undefined) existing.phone = updates.phone;
      if (updates.language) existing.language = updates.language;
      if (updates.avatar !== undefined) existing.avatar = updates.avatar;
      if (updates.username !== undefined) existing.username = updates.username;
      existing.updatedAt = new Date();
    }
  }
  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.id === userId) {
      if (updates.name) u.name = updates.name;
      if (updates.phone !== undefined) u.phone = updates.phone;
      if (updates.language) u.language = updates.language;
      if (updates.avatar !== undefined) u.avatar = updates.avatar;
      if (updates.username !== undefined) u.username = updates.username;
      u.updatedAt = new Date();
    }
  }

  const existingProf = resolvedOpenId ? await getTraderProfile(resolvedOpenId) : null;
  const newProfile: TraderProfileData = {
    userId,
    openId: resolvedOpenId,
    name: updates.name || existingProf?.name || "Trader",
    avatar: updates.avatar !== undefined ? updates.avatar : (existingProf?.avatar || null),
    phone: updates.phone !== undefined ? updates.phone : (existingProf?.phone || null),
    language: updates.language || existingProf?.language || "en",
    username: updates.username !== undefined ? updates.username : (existingProf?.username || null),
    updatedAt: new Date().toISOString(),
  };
  await saveTraderProfile(newProfile);

  try {
    const { supabaseServer } = await import("./supabase");
    if (resolvedOpenId) {
      const supaUpdate: any = { updatedAt: new Date().toISOString() };
      if (updates.name) supaUpdate.name = updates.name;
      if (updates.phone !== undefined) supaUpdate.phone = updates.phone;
      if (updates.language) supaUpdate.language = updates.language;
      if (updates.avatar !== undefined) supaUpdate.avatar = updates.avatar;
      await supabaseServer.from("users").update(supaUpdate).eq("openId", resolvedOpenId);
    }
  } catch (supaErr) {
    console.warn("[updateUserProfile Supabase error]:", supaErr);
  }

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(users)
        .set({
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
          ...(updates.language ? { language: updates.language } : {}),
          ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
          updatedAt: new Date(),
        })
        .where(
          resolvedOpenId
            ? or(eq(users.id, userId), eq(users.openId, resolvedOpenId))
            : eq(users.id, userId)
        );
    } catch (dbErr) {
      console.warn("[updateUserProfile db error]:", dbErr);
    }
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  initInstitutionalSeedData();

  const numericId = user.id || inMemoryUsers.get(user.openId)?.id || deriveNumericIdFromOpenId(user.openId);

  const existingProf = await getTraderProfile(user.openId);
  const resolvedAvatar = user.avatar !== undefined ? user.avatar : (existingProf?.avatar || null);
  const resolvedName = user.name || existingProf?.name || "Trader";

  const userRecord = {
    id: numericId,
    ...user,
    name: resolvedName,
    avatar: resolvedAvatar,
    createdAt: inMemoryUsers.get(user.openId)?.createdAt || new Date(),
    updatedAt: new Date(),
    lastSignedIn: user.lastSignedIn || new Date(),
    role: user.role || (user.openId === ENV.ownerOpenId ? "admin" : "user"),
    language: user.language || "en",
  };

  inMemoryUsers.set(user.openId, userRecord);

  await saveTraderProfile({
    userId: numericId,
    openId: user.openId,
    name: resolvedName,
    avatar: resolvedAvatar,
    phone: user.phone || null,
    role: userRecord.role as string,
    language: userRecord.language as any,
    updatedAt: new Date().toISOString(),
  });

  try {
    const { supabaseServer } = await import("./supabase");
    const { data: supaUser } = await supabaseServer.from("users").upsert({
      openId: user.openId,
      name: resolvedName,
      email: user.email || null,
      phone: user.phone || null,
      passwordHash: user.passwordHash || null,
      role: userRecord.role,
      language: userRecord.language,
      lastSignedIn: new Date().toISOString(),
    }, { onConflict: "openId" }).select("id").maybeSingle();

    if (supaUser?.id) {
      userRecord.id = supaUser.id;
      inMemoryUsers.set(user.openId, userRecord);
    }
  } catch (supaErr) {
    console.warn("[upsertUser Supabase error]:", supaErr);
  }

  const db = await getDb();
  if (db) {
    try {
      const values: InsertUser = {
        openId: user.openId,
        name: resolvedName,
        email: user.email,
        passwordHash: user.passwordHash,
        phone: user.phone,
        loginMethod: user.loginMethod,
        avatar: resolvedAvatar,
        lastSignedIn: user.lastSignedIn ?? new Date(),
        role: userRecord.role as any,
        language: userRecord.language as any,
      };
      const updateSet: Record<string, unknown> = { ...values };
      delete updateSet.openId;
      await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
    } catch (err) {
      console.warn("[Database upsertUser fallback to memory]:", err);
    }
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  initInstitutionalSeedData();

  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (rows && rows[0]) {
        const user = rows[0];
        const prof = await getTraderProfile(openId);
        if (prof?.avatar !== undefined) (user as any).avatar = prof.avatar;
        if (prof?.username) (user as any).username = prof.username;
        inMemoryUsers.set(openId, user);
        return user;
      }
    } catch (err) {
      console.warn("[Database getUserByOpenId fallback to memory]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer.from("users").select("*").eq("openId", openId).maybeSingle();
    if (data && !error) {
      const prof = await getTraderProfile(openId);
      const builtUser: any = {
        id: data.id,
        openId: data.openId,
        name: prof?.name || data.name || "Trader",
        email: data.email || null,
        phone: data.phone || null,
        passwordHash: data.passwordHash || inMemoryUsers.get(openId)?.passwordHash || null,
        role: data.role || "user",
        loginMethod: data.loginMethod || "supabase",
        language: data.language || "en",
        avatar: prof?.avatar !== undefined ? prof.avatar : (data.avatar || null),
        username: prof?.username || null,
        emailVerified: true,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        lastSignedIn: data.lastSignedIn ? new Date(data.lastSignedIn) : new Date(),
      };
      inMemoryUsers.set(openId, builtUser);
      return builtUser;
    }
  } catch (supaErr) {
    console.warn("[getUserByOpenId Supabase fallback]:", supaErr);
  }

  let user = inMemoryUsers.get(openId);
  if (user) {
    const prof = await getTraderProfile(openId);
    if (prof?.avatar !== undefined) user.avatar = prof.avatar;
    if (prof?.username) user.username = prof.username;
    return user;
  }

  return undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  initInstitutionalSeedData();
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      if (rows && rows[0]) {
        const u = rows[0];
        const prof = await getTraderProfile(u.openId);
        if (prof?.avatar !== undefined) (u as any).avatar = prof.avatar;
        if (prof?.username) (u as any).username = prof.username;
        inMemoryUsers.set(u.openId, u);
        return u;
      }
    } catch (err) {
      console.warn("[Database getUserByEmail fallback to memory]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
    if (data && !error) {
      const prof = await getTraderProfile(data.openId);
      const builtUser: any = {
        id: data.id,
        openId: data.openId,
        name: prof?.name || data.name || "Trader",
        email: data.email,
        phone: data.phone || null,
        passwordHash: data.passwordHash || inMemoryUsers.get(data.openId)?.passwordHash || null,
        role: data.role || "user",
        loginMethod: data.loginMethod || "supabase",
        language: data.language || "en",
        avatar: prof?.avatar !== undefined ? prof.avatar : (data.avatar || null),
        username: prof?.username || null,
        emailVerified: true,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        lastSignedIn: data.lastSignedIn ? new Date(data.lastSignedIn) : new Date(),
      };
      inMemoryUsers.set(data.openId, builtUser);
      return builtUser;
    }
  } catch (supaErr) {
    console.warn("[getUserByEmail Supabase fallback]:", supaErr);
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.email && u.email.toLowerCase() === normalizedEmail) {
      const prof = await getTraderProfile(u.openId);
      if (prof?.avatar !== undefined) u.avatar = prof.avatar;
      if (prof?.username) u.username = prof.username;
      return u;
    }
  }

  return undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (rows.length) {
        const u = rows[0];
        const prof = await getTraderProfile(u.openId || u.id);
        if (prof?.avatar !== undefined) (u as any).avatar = prof.avatar;
        if (prof?.username) (u as any).username = prof.username;
        return u;
      }
    } catch {}
  }
  try {
    const { supabaseServer } = await import("./supabase");
    const { data } = await supabaseServer.from("users").select("*").eq("id", id).maybeSingle();
    if (data) {
      const prof = await getTraderProfile(data.openId || data.id);
      if (prof?.avatar !== undefined) (data as any).avatar = prof.avatar;
      if (prof?.username) (data as any).username = prof.username;
      return data;
    }
  } catch {}
  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.id === id) {
      const prof = await getTraderProfile(u.openId || u.id);
      if (prof?.avatar !== undefined) (u as any).avatar = prof.avatar;
      if (prof?.username) (u as any).username = prof.username;
      return u;
    }
  }
  return undefined;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role?: "user" | "admin" | "support";
  language?: "en" | "bn" | "ur";
  emailVerified?: boolean;
  avatar?: string;
}): Promise<User> {
  const openId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const normalizedEmail = data.email.toLowerCase().trim();
  const db = await getDb();

  if (db) {
    try {
      await db.insert(users).values({
        openId,
        name: data.name,
        email: normalizedEmail,
        passwordHash: data.passwordHash,
        phone: data.phone || null,
        avatar: data.avatar || null,
        emailVerified: data.emailVerified ?? false,
        loginMethod: "password",
        role: data.role || "user",
        accountStatus: (data as any).accountStatus || "active",
        language: data.language || "en",
        lastSignedIn: new Date(),
      });
      const created = await getUserByOpenId(openId);
      if (created) return created;
    } catch (err) {
      console.warn("[Database createUser fallback to memory]:", err);
    }
  }

  let resolvedId = userAutoId++;

  if (process.env.NODE_ENV !== "test") {
    try {
      const { supabaseServer } = await import("./supabase");
      const { data: supaUser, error: supaErr } = await supabaseServer
        .from("users")
        .upsert(
          {
            openId,
            name: data.name,
            email: normalizedEmail,
            passwordHash: data.passwordHash,
            phone: data.phone || null,
            role: data.role || "user",
            language: data.language || "en",
            loginMethod: "password",
            lastSignedIn: new Date().toISOString(),
          },
          { onConflict: "openId" }
        )
        .select()
        .single();

      if (!supaErr && supaUser?.id) {
        resolvedId = supaUser.id;
      } else if (supaErr) {
        console.warn("[createUser Supabase upsert error]:", supaErr.message);
      }
    } catch (err) {
      console.warn("[createUser Supabase exception]:", err);
    }
  }

  const newUser: any = {
    id: resolvedId,
    openId,
    name: data.name,
    email: normalizedEmail,
    passwordHash: data.passwordHash,
    phone: data.phone || null,
    avatar: data.avatar || null,
    emailVerified: data.emailVerified ?? false,
    loginMethod: "password",
    role: data.role || "user",
    accountStatus: (data as any).accountStatus || "active",
    language: data.language || "en",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  inMemoryUsers.set(openId, newUser);
  return newUser;
}

// In-memory verification token storage
const inMemoryTokens: { email: string; otp: string; type: string; expiresAt: Date; isUsed: boolean }[] = [];

export async function createVerificationOtp(email: string, type: "email_verify" | "password_reset"): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  // Generate secure 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  const db = await getDb();
  if (db) {
    try {
      await db.insert(verificationTokens).values({
        email: normalizedEmail,
        otp,
        type,
        expiresAt,
        isUsed: false,
      });
    } catch (err) {
      console.warn("[createVerificationOtp error, fallback to memory]:", err);
    }
  }

  inMemoryTokens.push({
    email: normalizedEmail,
    otp,
    type,
    expiresAt,
    isUsed: false,
  });

  return otp;
}

export async function verifyOtp(email: string, otp: string, type: "email_verify" | "password_reset"): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.email, normalizedEmail),
            eq(verificationTokens.otp, otp.trim()),
            eq(verificationTokens.type, type),
            eq(verificationTokens.isUsed, false)
          )
        )
        .orderBy(desc(verificationTokens.createdAt))
        .limit(1);

      if (rows && rows[0]) {
        const token = rows[0];
        if (new Date(token.expiresAt) > new Date()) {
          await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.id, token.id));
          return true;
        }
      }
    } catch (err) {
      console.warn("[verifyOtp DB error, fallback to memory]:", err);
    }
  }

  const found = inMemoryTokens.find(
    (t) =>
      t.email === normalizedEmail &&
      t.otp === otp.trim() &&
      t.type === type &&
      !t.isUsed &&
      new Date(t.expiresAt) > new Date()
  );
  if (found) {
    found.isUsed = true;
    return true;
  }

  return false;
}

export async function markEmailVerified(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      await db.update(users).set({ emailVerified: true }).where(eq(users.email, normalizedEmail));
    } catch (err) {
      console.warn("[markEmailVerified error]:", err);
    }
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.email && u.email.toLowerCase() === normalizedEmail) {
      u.emailVerified = true;
    }
  }
}

export async function updateUserPassword(email: string, passwordHash: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      await db.update(users).set({ passwordHash }).where(eq(users.email, normalizedEmail));
    } catch (err) {
      console.warn("[updateUserPassword error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("users").update({ passwordHash }).eq("email", normalizedEmail);
  } catch (supaErr) {
    console.warn("[updateUserPassword Supabase error]:", supaErr);
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.email && u.email.toLowerCase() === normalizedEmail) {
      u.passwordHash = passwordHash;
    }
  }
}


export async function listProducts() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(products).where(eq(products.isPublished, true));
    } catch (err) {
      console.warn("[listProducts error]:", err);
    }
  }
  return [];
}

export async function listBundles() {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(bundles).where(eq(bundles.isPublished, true));
      return rows.map((b: any) =>
        (b.id === 2 || b.slug === "course-ebook") && (b.price === "1999.00" || b.price === "1999" || !b.price)
          ? { ...b, price: "2499" }
          : b
      );
    } catch (err) {
      console.warn("[listBundles error]:", err);
    }
  }
  return [
    { id: 1, slug: "pdf-package", titleEn: "Free eBook Package", titleBn: "Free eBook Package", price: "00", currency: "BDT", includesPdfPackage: true, includesEbook: false, includesCourse: false },
    { id: 2, slug: "course-ebook", titleEn: "CYCLE OF CHART BASIC TO ADVANCE COURSE", titleBn: "CYCLE OF CHART BASIC TO ADVANCE COURSE", price: "2499", currency: "BDT", includesPdfPackage: false, includesEbook: true, includesCourse: true },
    { id: 4, slug: "pro-blueprint", titleEn: "CYCLE OF CHART Ã¢â‚¬â€ PROFESSIONAL TRADING BLUEPRINT", titleBn: "CYCLE OF CHART Ã¢â‚¬â€ PROFESSIONAL TRADING BLUEPRINT", originalPrice: "5550", price: "3999", currency: "BDT", includesPdfPackage: true, includesEbook: true, includesCourse: true },
  ];
}

export async function listContent() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(content).where(eq(content.isPublished, true));
    } catch (err) {
      console.warn("[listContent error]:", err);
    }
  }
  return [];
}

export async function resolveUserCandidateIds(
  input: number | { id?: number; openId?: string; email?: string }
): Promise<number[]> {
  const ids = new Set<number>();
  if (typeof input === "number") {
    if (input > 0) ids.add(input);
  } else if (input && typeof input === "object") {
    if (input.id && input.id > 0) ids.add(input.id);
    try {
      const { supabaseServer } = await import("./supabase");
      const filters: string[] = [];
      if (input.id && input.id > 0) filters.push(`id.eq.${input.id}`);
      if (input.openId) filters.push(`openId.eq.${input.openId}`);
      if (input.email) filters.push(`email.eq.${input.email.toLowerCase().trim()}`);

      if (filters.length > 0) {
        const { data } = await supabaseServer
          .from("users")
          .select("id")
          .or(filters.join(","));
        if (data && Array.isArray(data)) {
          for (const u of data) {
            if (u.id) ids.add(u.id);
          }
        }
      }
    } catch (e) {
      console.warn("[resolveUserCandidateIds error]:", e);
    }
  }
  return Array.from(ids);
}

export async function listOrdersForUser(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  const db = await getDb();
  if (db) {
    try {
      const targetIds = candidateIds.length > 0 ? candidateIds : [primaryId];
      return await db
        .select()
        .from(orders)
        .where(inArray(orders.customerId, targetIds))
        .orderBy(desc(orders.createdAt));
    } catch (err) {
      console.warn("[listOrdersForUser error]:", err);
    }
  }

  // Supabase live database connection
  try {
    const { supabaseServer } = await import("./supabase");
    let query = supabaseServer.from("orders").select("*");
    if (candidateIds.length === 1) {
      query = query.eq("customerId", candidateIds[0]);
    } else if (candidateIds.length > 1) {
      query = query.in("customerId", candidateIds);
    } else {
      query = query.eq("customerId", primaryId);
    }
    const { data, error } = await query.order("createdAt", { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((o) => ({
        ...o,
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        approvedAt: o.approvedAt ? new Date(o.approvedAt) : undefined,
      }));
    }
  } catch (err) {
    console.warn("[listOrdersForUser Supabase fetch error]:", err);
  }

  return inMemoryOrders.filter((o) => candidateIds.includes(o.customerId) || o.customerId === primaryId);
}

export async function listAllOrders() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (err) {
      console.warn("[listAllOrders error]:", err);
    }
  }

  // Supabase live database connection
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer
      .from("orders")
      .select("*")
      .order("createdAt", { ascending: false });
    if (!error && data) {
      for (const item of data) {
        const idx = inMemoryOrders.findIndex((o) => o.id === item.id);
        const mapped = {
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
        };
        if (idx >= 0) {
          inMemoryOrders[idx] = mapped;
        } else {
          inMemoryOrders.push(mapped);
        }
      }
      return inMemoryOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn("[listAllOrders Supabase fetch error]:", err);
  }

  return inMemoryOrders;
}

export async function resolveSupabaseCustomerId(input: {
  customerId?: number;
  openId?: string;
  email?: string;
  name?: string;
  phone?: string;
}): Promise<number> {
  try {
    const { supabaseServer } = await import("./supabase");

    // 1. If customerId is provided and valid (> 0), verify it exists in Supabase users table
    if (input.customerId && input.customerId > 0) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("id", input.customerId)
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 2. If openId provided, check by openId
    if (input.openId) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("openId", input.openId)
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 3. If email provided, check by email
    if (input.email) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("email", input.email.toLowerCase().trim())
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 4. User does not exist in Supabase users table! Create real user record in Supabase now
    try {
      const newOpenId = input.openId || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabaseServer
        .from("users")
        .insert({
          openId: newOpenId,
          name: input.name || "Student",
          email: input.email ? input.email.toLowerCase().trim() : null,
          phone: input.phone || null,
          role: "user",
          language: "en",
          loginMethod: "password",
          lastSignedIn: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!error && data?.id) {
        return data.id;
      }
      if (error) {
        console.warn("[resolveSupabaseCustomerId insert error]:", error.message);
      }
    } catch (err) {
      console.warn("[resolveSupabaseCustomerId insert exception]:", err);
    }

    // 5. Fallback: query any existing user in Supabase users to guarantee foreign key constraint is satisfied
    try {
      const { data } = await supabaseServer.from("users").select("id").limit(1).maybeSingle();
      if (data?.id) return data.id;
    } catch (e) {}
  } catch (err) {
    console.warn("[resolveSupabaseCustomerId exception]:", err);
  }

  return input.customerId || 1;
}

export async function createOrder(orderInput: {
  customerId: number;
  customerOpenId?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  bundleId?: number | null;
  productId?: number | null;
  selectedPdfIds?: number[];
  amount: string;
  currency?: string;
  paymentMethod: string;
  transactionId: string;
  screenshotKey?: string | null;
  noRefundAcknowledged: boolean;
}) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      const res = await db.insert(orders).values({
        customerId: orderInput.customerId,
        bundleId: orderInput.bundleId || null,
        productId: orderInput.productId || null,
        selectedPdfIds: orderInput.selectedPdfIds || [],
        amount: orderInput.amount,
        currency: orderInput.currency || "BDT",
        paymentMethod: orderInput.paymentMethod,
        transactionId: orderInput.transactionId,
        screenshotKey: orderInput.screenshotKey || null,
        noRefundAcknowledged: orderInput.noRefundAcknowledged,
        paymentStatus: "pending",
        orderStatus: "pending",
        createdAt: now,
        updatedAt: now,
      });
      const insertId = res[0]?.insertId || res[0]?.id || orderAutoId++;
      return { id: insertId, ...orderInput, paymentStatus: "pending", orderStatus: "pending", createdAt: now };
    } catch (err) {
      console.warn("[createOrder Drizzle error]:", err);
    }
  }

  // Supabase live database insertion
  try {
    const { supabaseServer } = await import("./supabase");
    const resolvedCustomerId = await resolveSupabaseCustomerId({
      customerId: orderInput.customerId,
      openId: orderInput.customerOpenId,
      email: orderInput.customerEmail,
      name: orderInput.customerName,
      phone: orderInput.customerPhone,
    });

    let validBundleId = orderInput.bundleId || null;
    if (validBundleId) {
      try {
        const { data: bundleExists } = await supabaseServer
          .from("bundles")
          .select("id")
          .eq("id", validBundleId)
          .maybeSingle();
        if (!bundleExists?.id) {
          validBundleId = null;
        }
      } catch (e) {}
    }

    let validProductId = orderInput.productId || null;
    if (validProductId) {
      try {
        const { data: prodExists } = await supabaseServer
          .from("products")
          .select("id")
          .eq("id", validProductId)
          .maybeSingle();
        if (!prodExists?.id) {
          validProductId = null;
        }
      } catch (e) {}
    }

    const payload = {
      customerId: resolvedCustomerId,
      bundleId: validBundleId,
      productId: validProductId,
      selectedPdfIds: orderInput.selectedPdfIds || [],
      amount: orderInput.amount,
      currency: orderInput.currency || "BDT",
      paymentMethod: orderInput.paymentMethod,
      transactionId: orderInput.transactionId,
      screenshotKey: orderInput.screenshotKey || null,
      noRefundAcknowledged: orderInput.noRefundAcknowledged,
      paymentStatus: "pending",
      orderStatus: "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("orders")
      .insert(payload)
      .select();

    if (!error && data && data.length > 0) {
      const inserted = {
        ...data[0],
        createdAt: new Date(data[0].createdAt),
        updatedAt: new Date(data[0].updatedAt),
      };
      inMemoryOrders.unshift(inserted);
      console.log(`[createOrder SUCCESS]: Order #${inserted.id} inserted into Supabase (customerId: ${resolvedCustomerId}, TrxID: ${orderInput.transactionId})`);
      return inserted;
    } else if (error) {
      console.warn("[createOrder Supabase error]:", error.message);
      // If error is any foreign key violation, fallback to first available user and strip bundle/product foreign keys
      if (error.code === "23503") {
        const { data: firstUser } = await supabaseServer.from("users").select("id").limit(1).maybeSingle();
        const retryPayload = {
          ...payload,
          customerId: firstUser?.id || resolvedCustomerId,
          bundleId: null,
          productId: null,
        };
        const retryRes = await supabaseServer.from("orders").insert(retryPayload).select();
        if (retryRes.data && retryRes.data.length > 0) {
          const retryOrder = {
            ...retryRes.data[0],
            createdAt: new Date(retryRes.data[0].createdAt),
            updatedAt: new Date(retryRes.data[0].updatedAt),
          };
          inMemoryOrders.unshift(retryOrder);
          console.log(`[createOrder RETRY SUCCESS]: Order #${retryOrder.id} saved with fallback user #${firstUser?.id || resolvedCustomerId}`);
          return retryOrder;
        }
      }
    }
  } catch (err) {
    console.warn("[createOrder Supabase exception]:", err);
  }

  const fallbackOrder = {
    id: orderAutoId++,
    ...orderInput,
    selectedPdfIds: orderInput.selectedPdfIds || [],
    currency: orderInput.currency || "BDT",
    paymentStatus: "pending" as const,
    orderStatus: "pending" as const,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryOrders.unshift(fallbackOrder);
  return fallbackOrder;
}

// Course telegram community functions are now in ./features/community

export async function approveOrder(orderId: number, approvedBy: number = 1) {
  const now = new Date();

  // Find target order first to check IDEMPOTENCY and determine course access
  let targetOrder: any = null;
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (rows.length > 0) targetOrder = rows[0];
    } catch (err) {}
  }

  if (!targetOrder) {
    try {
      const { supabaseServer } = await import("./supabase");
      const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
      if (orderRows?.[0]) targetOrder = orderRows[0];
    } catch (err) {}
  }

  if (!targetOrder) {
    targetOrder = inMemoryOrders.find((o) => o.id === orderId);
  }

  if (!targetOrder) {
    throw new Error("Order not found");
  }

  // IDEMPOTENCY CHECK: If already approved, avoid duplicate entitlements & events
  if (targetOrder.orderStatus === "approved" && targetOrder.paymentStatus === "approved") {
    console.info(`[approveOrder IDEMPOTENT]: Order #${orderId} is already approved. Returning without duplicate processing.`);
    return { success: true, order: targetOrder, alreadyApproved: true };
  }

  // Check if this order grants course access
  const isCourse = await orderGrantsCourseAccess(targetOrder);
  const telegramConfig = await getCourseTelegramPopupConfig();

  // Check if this order is for a subscription plan
  const isProPlan = targetOrder.bundleId === 101 || targetOrder.productId === 101 || targetOrder.scope?.includes("plan:pro") || (targetOrder as any).plan === "pro";
  const isPremiumPlan = targetOrder.bundleId === 102 || targetOrder.productId === 102 || targetOrder.scope?.includes("plan:premium") || (targetOrder as any).plan === "premium";

  if (isProPlan || isPremiumPlan) {
    try {
      const planToActivate = isPremiumPlan ? "premium" : "pro";
      const { activateSubscription } = await import("./subscription");
      await activateSubscription(targetOrder.customerId, planToActivate);
    } catch (subErr) {
      console.warn("[approveOrder activateSubscription error]:", subErr);
    }
  }

  // 1. Update Drizzle database if active
  if (db) {
    try {
      await db.update(orders).set({
        orderStatus: "approved",
        paymentStatus: "approved",
        approvedAt: now,
        approvedBy,
        updatedAt: now,
      }).where(eq(orders.id, orderId));

      await db.insert(entitlements).values({
        userId: targetOrder.customerId,
        orderId: targetOrder.id,
        productId: targetOrder.productId,
        bundleId: targetOrder.bundleId,
        scope: targetOrder.bundleId ? `bundle:${targetOrder.bundleId}` : `product:${targetOrder.productId || 1}`,
        grantedAt: now,
      });

      await db.insert(notifications).values({
        userId: targetOrder.customerId,
        title: isCourse ? "Course Access Unlocked Ã°Å¸Å½â€œ" : "Access unlocked",
        message: isCourse && telegramConfig.telegramUrl
          ? "Your course access has been approved! Join our official Telegram community for real-time course updates, institutional study materials, and student support."
          : "Your payment was approved and your digital learning access is now available.",
        read: false,
        createdAt: now,
      });
    } catch (err) {
      console.warn("[approveOrder Drizzle error]:", err);
    }
  }

  // 2. Supabase live database update
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer
      .from("orders")
      .update({
        orderStatus: "approved",
        paymentStatus: "approved",
        approvedAt: now.toISOString(),
        approvedBy,
        updatedAt: now.toISOString(),
      })
      .eq("id", orderId);

    // Add entitlement in Supabase
    await supabaseServer.from("entitlements").insert({
      userId: targetOrder.customerId,
      orderId: targetOrder.id,
      bundleId: targetOrder.bundleId || null,
      productId: targetOrder.productId || null,
      scope: targetOrder.bundleId ? `bundle:${targetOrder.bundleId}` : `product:${targetOrder.productId || 1}`,
      grantedAt: now.toISOString(),
    });

    // Add notification in Supabase
    await supabaseServer.from("notifications").insert({
      userId: targetOrder.customerId,
      title: isCourse ? "Course Access Unlocked Ã°Å¸Å½â€œ" : "Access unlocked",
      message: isCourse && telegramConfig.telegramUrl
        ? "Your course access has been approved! Join our official Telegram community for real-time course updates, institutional study materials, and student support."
        : "Your payment was approved and your digital learning access is now available.",
      read: false,
      createdAt: now.toISOString(),
    });

    // Record in audit logs
    await addAuditLog({
      actorId: approvedBy,
      action: "order.approved",
      entity: "order",
      entityId: orderId,
      metadata: { customerId: targetOrder.customerId, amount: targetOrder.amount, isCourse },
    });
  } catch (err) {
    console.warn("[approveOrder Supabase error]:", err);
  }

  // 3. If Course access granted, create Telegram Popup Event
  if (isCourse) {
    try {
      await createCourseTelegramPopupEvent({
        userId: targetOrder.customerId,
        orderId: targetOrder.id,
      });
      console.log(`[approveOrder]: Course Telegram Popup event created for user ${targetOrder.customerId} on Order #${targetOrder.id}`);
    } catch (evErr) {
      console.warn("[createCourseTelegramPopupEvent notice]:", evErr);
    }
  }

  // 4. Update in-memory cache
  targetOrder.orderStatus = "approved";
  targetOrder.paymentStatus = "approved";
  targetOrder.approvedAt = now;

  const memOrder = inMemoryOrders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.orderStatus = "approved";
    memOrder.paymentStatus = "approved";
    memOrder.approvedAt = now;
  }

  // 5. Send access email via credential-safe email boundary
  try {
    const customer = await getUserById(targetOrder.customerId);
    const recipientEmail = customer?.email || targetOrder.customerEmail;
    if (recipientEmail) {
      await sendAccessEmail("payment_approved", recipientEmail, {
        orderId: targetOrder.id,
        customerName: customer?.name || targetOrder.customerName || "Trader",
        bundleId: targetOrder.bundleId,
        productId: targetOrder.productId,
        amount: targetOrder.amount,
        isCourse,
        telegramUrl: isCourse && telegramConfig.enabled ? telegramConfig.telegramUrl : undefined,
      });
    }
  } catch (emailErr) {
    console.warn("[approveOrder email boundary notice]:", emailErr);
  }

  return { success: true, order: targetOrder };
}

export async function rejectOrder(orderId: number, reason: string, rejectedBy: number = 1) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      await db.update(orders).set({
        orderStatus: "rejected",
        paymentStatus: "rejected",
        rejectionReason: reason,
        updatedAt: now,
      }).where(eq(orders.id, orderId));
      return { success: true };
    } catch (err) {
      console.warn("[rejectOrder Drizzle error]:", err);
    }
  }

  // Supabase live database update
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer
      .from("orders")
      .update({
        orderStatus: "rejected",
        paymentStatus: "rejected",
        rejectionReason: reason,
        updatedAt: now.toISOString(),
      })
      .eq("id", orderId);

    const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
    const targetOrder = orderRows?.[0] || inMemoryOrders.find((o) => o.id === orderId);
    if (targetOrder) {
      await supabaseServer.from("notifications").insert({
        userId: targetOrder.customerId,
        title: "Order verification issue",
        message: `Your payment verification could not be completed: ${reason}. Please contact support.`,
        read: false,
        createdAt: now.toISOString(),
      });

      await addAuditLog({
        actorId: rejectedBy,
        action: "order.rejected",
        entity: "order",
        entityId: orderId,
        metadata: { customerId: targetOrder.customerId, reason },
      });
    }

    const memOrder = inMemoryOrders.find((o) => o.id === orderId);
    if (memOrder) {
      memOrder.orderStatus = "rejected";
      memOrder.paymentStatus = "rejected";
      memOrder.rejectionReason = reason;
    }
    return { success: true };
  } catch (err) {
    console.warn("[rejectOrder Supabase error]:", err);
  }

  const memOrder = inMemoryOrders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.orderStatus = "rejected";
    memOrder.paymentStatus = "rejected";
    memOrder.rejectionReason = reason;
    return { success: true };
  }
  throw new Error("Order not found");
}

export async function deleteOrder(orderId: number, deletedBy: number = 1) {
  const db = await getDb();
  if (db) {
    try {
      try {
        await db.delete(entitlements).where(eq(entitlements.orderId, orderId));
      } catch {}
      await db.delete(orders).where(eq(orders.id, orderId));
    } catch (err) {
      console.warn("[deleteOrder Drizzle error]:", err);
    }
  }

  // Supabase live database deletion
  try {
    const { supabaseServer } = await import("./supabase");
    try {
      await supabaseServer.from("entitlements").delete().eq("orderId", orderId);
    } catch {}

    const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
    const targetOrder = orderRows?.[0] || inMemoryOrders.find((o) => o.id === orderId);

    const { error: delErr } = await supabaseServer.from("orders").delete().eq("id", orderId);
    if (delErr) {
      console.warn("[deleteOrder Supabase delete error]:", delErr);
    }

    if (targetOrder) {
      await addAuditLog({
        actorId: deletedBy,
        action: "order.deleted",
        entity: "order",
        entityId: orderId,
        metadata: { customerId: targetOrder.customerId, amount: targetOrder.amount, transactionId: targetOrder.transactionId },
      });
    }
  } catch (err) {
    console.warn("[deleteOrder Supabase error]:", err);
  }

  // Remove from in-memory fallback array
  const memIdx = inMemoryOrders.findIndex((o) => o.id === orderId);
  if (memIdx !== -1) {
    inMemoryOrders.splice(memIdx, 1);
  }
  const entIdx = inMemoryEntitlements.findIndex((e) => e.orderId === orderId);
  if (entIdx !== -1) {
    inMemoryEntitlements.splice(entIdx, 1);
  }

  return { success: true };
}

export async function listEntitlements(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  const db = await getDb();
  if (db) {
    try {
      const targetIds = candidateIds.length > 0 ? candidateIds : [primaryId];
      return await db
        .select()
        .from(entitlements)
        .where(inArray(entitlements.userId, targetIds))
        .orderBy(desc(entitlements.grantedAt));
    } catch (err) {
      console.warn("[listEntitlements error]:", err);
    }
  }

  let rawList: any[] = [];
  if (process.env.NODE_ENV !== "test") {
    try {
      const { supabaseServer } = await import("./supabase");
      let query = supabaseServer.from("entitlements").select("*");
      if (candidateIds.length === 1) {
        query = query.eq("userId", candidateIds[0]);
      } else if (candidateIds.length > 1) {
        query = query.in("userId", candidateIds);
      } else {
        query = query.eq("userId", primaryId);
      }
      const { data, error } = await query.order("grantedAt", { ascending: false });
      if (!error && data) {
        rawList = data.map((e) => ({
          ...e,
          grantedAt: e.grantedAt ? new Date(e.grantedAt) : new Date(),
        }));
      }
    } catch (err) {
      console.warn("[listEntitlements Supabase error]:", err);
    }
  }

  if (rawList.length === 0) {
    rawList = inMemoryEntitlements.filter((e) => candidateIds.includes(e.userId) || e.userId === primaryId);
  }

    try {
      const { getManualAccessRecord, isManualRecordActive } = await import("./userManagement");
      const manualCourse = await getManualAccessRecord(primaryId, "course");
      if (manualCourse?.isOverrideBlocked) {
        rawList = rawList.filter((e: any) =>
          e.scope !== "course" && e.scope !== "bundle:2" && e.bundleId !== 2
        );
      } else if (isManualRecordActive(manualCourse)) {
        const hasCourse = rawList.some((e: any) =>
          e.scope === "course" || e.scope === "bundle:2" || e.bundleId === 2
        );
        if (!hasCourse) {
          rawList = [
            {
              id: 999000 + primaryId,
              userId: primaryId,
              orderId: 99999,
              bundleId: 2,
              bundleSlug: "course-ebook",
              scope: "course",
              grantedAt: manualCourse.startDate ? new Date(manualCourse.startDate) : new Date(),
              isVirtualManual: true,
            },
            ...rawList,
          ];
        }
      }
    } catch (err) {}

    return rawList;
}

export async function listNotifications(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  const db = await getDb();
  if (db) {
    try {
      const targetIds = candidateIds.length > 0 ? candidateIds : [primaryId];
      return await db
        .select()
        .from(notifications)
        .where(inArray(notifications.userId, targetIds))
        .orderBy(desc(notifications.createdAt));
    } catch (err) {
      console.warn("[listNotifications error]:", err);
    }
  }
  return [
    {
      id: 1,
      userId: primaryId,
      title: "Welcome to Cycle of Chart",
      message: "Begin your journey with Stage 01 of the 12-Stage Institutional Roadmap.",
      read: false,
      createdAt: new Date(),
    },
  ];
}

export async function createJournalEntry(
  userId: number,
  entry: { title: string; content: string; setup?: string; result?: string }
) {
  const db = await getDb();
  if (db) {
    try {
      const res = await db.insert(journalEntries).values({
        userId,
        ...entry,
      });
      return res;
    } catch (err) {
      console.warn("[createJournalEntry db error]:", err);
    }
  }

  // Supabase direct persistence
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer.from("journalEntries").insert({
      userId,
      title: entry.title,
      content: entry.content,
      setup: entry.setup || null,
      result: entry.result || null,
    }).select();
    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (err) {
    console.warn("[createJournalEntry Supabase error]:", err);
  }

  // Persistent settings fallback
  try {
    const key = `user_journals_${userId}`;
    const raw = await getSetting(key);
    const existing = raw ? JSON.parse(raw) : [];
    const newEntry = {
      id: Date.now(),
      userId,
      ...entry,
      createdAt: new Date().toISOString(),
    };
    existing.unshift(newEntry);
    await setSetting(key, JSON.stringify(existing));
    return newEntry;
  } catch (err) {
    console.warn("[createJournalEntry settings fallback error]:", err);
  }

  const inMem = {
    id: journalAutoId++,
    userId,
    ...entry,
    createdAt: new Date(),
  };
  inMemoryJournal.unshift(inMem);
  return inMem;
}

export async function listJournal(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt));
    } catch (err) {
      console.warn("[listJournal error]:", err);
    }
  }

  // Supabase direct persistence
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer
      .from("journalEntries")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("[listJournal Supabase error]:", err);
  }

  // Persistent settings fallback
  try {
    const key = `user_journals_${userId}`;
    const raw = await getSetting(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return inMemoryJournal.filter((j) => j.userId === userId);
}

export async function deleteJournal(id: number, userId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[deleteJournal error]:", err);
    }
  }

  // Supabase direct persistence
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("journalEntries").delete().eq("id", id).eq("userId", userId);
  } catch (err) {
    console.warn("[deleteJournal Supabase error]:", err);
  }

  // Persistent settings fallback
  try {
    const key = `user_journals_${userId}`;
    const raw = await getSetting(key);
    if (raw) {
      const existing = JSON.parse(raw);
      const filtered = existing.filter((e: any) => e.id !== id);
      await setSetting(key, JSON.stringify(filtered));
    }
  } catch {}

  const idx = inMemoryJournal.findIndex((j) => j.id === id && j.userId === userId);
  if (idx !== -1) inMemoryJournal.splice(idx, 1);
  return true;
}

export async function listHabits(userId: number, date: string) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(habits)
        .where(and(eq(habits.userId, userId), eq(habits.date, date)));
    } catch (err) {
      console.warn("[listHabits error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer
      .from("habits")
      .select("*")
      .eq("userId", userId)
      .eq("date", date);
    if (!error && data) return data;
  } catch {}

  try {
    const key = `user_habits_${userId}_${date}`;
    const raw = await getSetting(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [];
}

export async function toggleHabitEntry(userId: number, label: string, date: string, completed: boolean) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(habits)
        .where(and(eq(habits.userId, userId), eq(habits.date, date), eq(habits.label, label)))
        .limit(1);
      if (existing[0]) {
        await db.update(habits).set({ completed }).where(eq(habits.id, existing[0].id));
      } else {
        await db.insert(habits).values({ userId, label, date, completed });
      }
      return true;
    } catch (err) {
      console.warn("[toggleHabitEntry db error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("habits").upsert({
      userId,
      label,
      date,
      completed,
    }, { onConflict: "userId,label,date" });
  } catch {}

  try {
    const key = `user_habits_${userId}_${date}`;
    const raw = await getSetting(key);
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const item = existing.find((h) => h.label === label);
    if (item) {
      item.completed = completed;
    } else {
      existing.push({ userId, label, date, completed });
    }
    await setSetting(key, JSON.stringify(existing));
  } catch {}

  return true;
}

export async function listProgress(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(progress).where(eq(progress.userId, userId));
    } catch (err) {
      console.warn("[listProgress error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer.from("progress").select("*").eq("userId", userId);
    if (!error && data) return data;
  } catch {}

  try {
    const key = `user_progress_${userId}`;
    const raw = await getSetting(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [];
}

export async function toggleProgressEntry(userId: number, lessonId: number, completed: boolean) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)))
        .limit(1);
      if (existing[0]) {
        await db.update(progress).set({ completed }).where(eq(progress.id, existing[0].id));
      } else {
        await db.insert(progress).values({ userId, lessonId, completed });
      }
      return true;
    } catch (err) {
      console.warn("[toggleProgressEntry db error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("progress").upsert({
      userId,
      lessonId,
      completed,
    }, { onConflict: "userId,lessonId" });
  } catch {}

  try {
    const key = `user_progress_${userId}`;
    const raw = await getSetting(key);
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const item = existing.find((p) => p.lessonId === lessonId);
    if (item) {
      item.completed = completed;
    } else {
      existing.push({ userId, lessonId, completed });
    }
    await setSetting(key, JSON.stringify(existing));
  } catch {}

  return true;
}

export async function listDiscipline(userId: number, date: string) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(disciplineEntries)
        .where(and(eq(disciplineEntries.userId, userId), eq(disciplineEntries.date, date)));
    } catch (err) {
      console.warn("[listDiscipline error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer
      .from("disciplineEntries")
      .select("*")
      .eq("userId", userId)
      .eq("date", date);
    if (!error && data) return data;
  } catch {}

  try {
    const key = `user_discipline_${userId}_${date}`;
    const raw = await getSetting(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [];
}

export async function toggleDisciplineEntry(userId: number, label: string, date: string, completed: boolean) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineEntries)
        .where(and(eq(disciplineEntries.userId, userId), eq(disciplineEntries.date, date), eq(disciplineEntries.label, label)))
        .limit(1);
      if (existing[0]) {
        await db.update(disciplineEntries).set({ completed }).where(eq(disciplineEntries.id, existing[0].id));
      } else {
        await db.insert(disciplineEntries).values({ userId, label, date, completed });
      }
      return true;
    } catch (err) {
      console.warn("[toggleDisciplineEntry db error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("disciplineEntries").upsert({
      userId,
      label,
      date,
      completed,
    }, { onConflict: "userId,label,date" });
  } catch {}

  try {
    const key = `user_discipline_${userId}_${date}`;
    const raw = await getSetting(key);
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const item = existing.find((d) => d.label === label);
    if (item) {
      item.completed = completed;
    } else {
      existing.push({ userId, label, date, completed });
    }
    await setSetting(key, JSON.stringify(existing));
  } catch {}

  return true;
}

// ------------------------------------------------------------------------------
// REAL-TIME DIRECT CUSTOMER-TO-ADMIN MESSAGING SYSTEM
// Single permanent conversation per customer lifetime
// ------------------------------------------------------------------------------

export interface SupportConversationRecord {
  id: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

export interface SupportMessageRecord {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: "customer" | "admin";
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface AdminSupportConversationSummary {
  id: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  customer: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    createdAt: string | null;
  };
  lastMessage: SupportMessageRecord | null;
  unreadCount: number;
  totalMessages: number;
}

export interface CustomerSupportContext {
  customer: {
    id: number;
    openId?: string;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    createdAt: string | null;
  };
  entitlements: Array<{
    id: number;
    orderId?: number;
    productId?: number;
    bundleId?: number;
    scope: string;
    productTitle?: string;
    grantedAt: string;
  }>;
  orders: Array<{
    id: number;
    amount: string;
    currency: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    bundleId?: number | null;
    productId?: number | null;
    selectedPdfIds?: number[];
    createdAt: string;
  }>;
  stats: {
    totalSpend: number;
    totalOrders: number;
    activeEntitlementsCount: number;
  };
}

/**
 * Loads all support conversations from persistent settings and memory.
 */
async function loadSupportConversationsRegistry(): Promise<SupportConversationRecord[]> {
  try {
    const raw = await getSetting("support_conversations_registry");
    if (raw) {
      const list = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(list)) {
        const normalized: SupportConversationRecord[] = list.map((item: any) => ({
          id: Number(item.id),
          customerId: Number(item.customerId),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          lastMessageAt: item.lastMessageAt || null,
        }));
        for (const item of normalized) {
          if (!inMemoryConversations.some((c) => Number(c.id) === Number(item.id))) {
            inMemoryConversations.push(item);
          }
        }
        return normalized;
      }
    }
  } catch (err) {
    console.warn("[loadSupportConversationsRegistry error]:", err);
  }
  return inMemoryConversations;
}

/**
 * Persists support conversations registry to memory and settings.
 */
async function saveSupportConversationsRegistry(conversations: SupportConversationRecord[]): Promise<void> {
  try {
    await setSetting("support_conversations_registry", JSON.stringify(conversations));
  } catch (err) {
    console.warn("[saveSupportConversationsRegistry error]:", err);
  }
}

/**
 * Gets or creates the SINGLE permanent support conversation for a customer.
 * Lifetime guarantee: One customer = One permanent conversation.
 */
export async function getOrCreateSupportConversation(
  customerId: number,
  userContext?: { id?: number; openId?: string | null; email?: string | null }
): Promise<SupportConversationRecord> {
  let canonicalCustomerId = Number(customerId);
  const allConversations = await loadSupportConversationsRegistry();

  // Try to resolve user details to guarantee canonical ID binding
  let matchedUser: any = null;
  try {
    matchedUser = await getUserById(canonicalCustomerId);
    if (!matchedUser && userContext?.openId) {
      matchedUser = await getUserByOpenId(userContext.openId);
    }
    if (!matchedUser && userContext?.email) {
      matchedUser = await getUserByEmail(userContext.email);
    }
    if (!matchedUser) {
      for (const u of Array.from(inMemoryUsers.values())) {
        if (
          Number(u.id) === canonicalCustomerId ||
          (userContext?.openId && u.openId === userContext.openId) ||
          (userContext?.email && u.email?.toLowerCase() === userContext.email.toLowerCase())
        ) {
          matchedUser = u;
          break;
        }
      }
    }
    if (matchedUser?.id) {
      canonicalCustomerId = Number(matchedUser.id);
    }
  } catch {}

  // 1. Check existing in registry
  let existing = allConversations.find((c) => Number(c.customerId) === canonicalCustomerId);
  if (existing) {
    return existing;
  }

  // Also check if any existing conversation matches user's other potential ID
  if (matchedUser) {
    existing = allConversations.find((c) => Number(c.customerId) === Number(matchedUser.id));
    if (existing) {
      return existing;
    }
  }

  // 2. Check Postgres DB if active
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(supportConversations)
        .where(eq(supportConversations.customerId, canonicalCustomerId))
        .limit(1);
      if (rows && rows[0]) {
        const conv: SupportConversationRecord = {
          id: Number(rows[0].id),
          customerId: Number(rows[0].customerId),
          createdAt: rows[0].createdAt ? new Date(rows[0].createdAt).toISOString() : new Date().toISOString(),
          updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : new Date().toISOString(),
          lastMessageAt: rows[0].lastMessageAt ? new Date(rows[0].lastMessageAt).toISOString() : null,
        };
        allConversations.push(conv);
        await saveSupportConversationsRegistry(allConversations);
        return conv;
      }
    } catch (err) {
      console.warn("[getOrCreateSupportConversation db select fallback]:", err);
    }
  }

  // 3. Create new single permanent conversation record
  const now = new Date().toISOString();
  let maxId = 0;
  for (const c of allConversations) {
    if (Number(c.id) > maxId) maxId = Number(c.id);
  }
  const newId = Math.max(maxId + 1, conversationAutoId++);

  const newConv: SupportConversationRecord = {
    id: newId,
    customerId: canonicalCustomerId,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: null,
  };

  allConversations.push(newConv);
  if (!inMemoryConversations.some((c) => Number(c.id) === newConv.id)) {
    inMemoryConversations.push(newConv);
  }
  await saveSupportConversationsRegistry(allConversations);

  // Try DB insert if available
  if (db) {
    try {
      await db.insert(supportConversations).values({
        id: newId,
        customerId: canonicalCustomerId,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        lastMessageAt: null,
      });
    } catch (err) {
      console.warn("[getOrCreateSupportConversation db insert notice]:", err);
    }
  }

  // Try Supabase table insert
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("supportConversations").insert({
      id: newId,
      customerId: canonicalCustomerId,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: null,
    });
  } catch {}

  return newConv;
}

/**
 * Gets a support conversation by customerId (or null if not created).
 */
export async function getSupportConversation(
  customerId: number,
  userContext?: { id?: number; openId?: string | null; email?: string | null }
): Promise<SupportConversationRecord | null> {
  let canonicalCustomerId = Number(customerId);
  try {
    const userObj = await getUserById(canonicalCustomerId);
    if (userObj?.id) canonicalCustomerId = Number(userObj.id);
  } catch {}
  const allConversations = await loadSupportConversationsRegistry();
  const found = allConversations.find((c) => Number(c.customerId) === canonicalCustomerId);
  return found || null;
}

/**
 * Gets a support conversation by its conversationId.
 */
export async function getSupportConversationById(conversationId: number): Promise<SupportConversationRecord | null> {
  const numId = Number(conversationId);
  const allConversations = await loadSupportConversationsRegistry();
  const found = allConversations.find((c) => Number(c.id) === numId);
  return found || null;
}

/**
 * Fetches all messages for a conversation in chronological order (createdAt ASC).
 */
export async function getSupportMessages(conversationId: number): Promise<SupportMessageRecord[]> {
  const numId = Number(conversationId);
  const key = `support_messages_${numId}`;
  let messages: SupportMessageRecord[] = [];

  try {
    const raw = await getSetting(key);
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        messages = parsed.map((m: any) => ({
          id: Number(m.id),
          conversationId: Number(m.conversationId),
          senderId: Number(m.senderId),
          senderRole: m.senderRole,
          message: m.message,
          readAt: m.readAt || null,
          createdAt: m.createdAt,
        }));
      }
    }
  } catch (err) {
    console.warn(`[getSupportMessages getSetting error for ${key}]:`, err);
  }

  // If empty, try Supabase table or Drizzle
  if (messages.length === 0) {
    try {
      const { supabaseServer } = await import("./supabase");
      const { data, error } = await supabaseServer
        .from("supportMessages")
        .select("*")
        .eq("conversationId", numId)
        .order("createdAt", { ascending: true });
      if (!error && data && data.length > 0) {
        messages = data.map((m: any) => ({
          id: Number(m.id),
          conversationId: Number(m.conversationId),
          senderId: Number(m.senderId),
          senderRole: m.senderRole,
          message: m.message,
          readAt: m.readAt || null,
          createdAt: m.createdAt,
        }));
        await setSetting(key, JSON.stringify(messages));
      }
    } catch {}
  }

  // Merge any in-memory messages for this conversation
  const memMsgs = inMemoryMessages.filter((m) => Number(m.conversationId) === numId);
  for (const m of memMsgs) {
    if (!messages.some((existing) => Number(existing.id) === Number(m.id))) {
      messages.push(m);
    }
  }

  // Enforce chronological sorting
  messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return messages;
}

/**
 * Sends a new support message (either customer to admin or admin to customer).
 * Real-time broadcast + persistence + notification + email dispatch.
 */
export async function sendSupportMessage(input: {
  conversationId?: number;
  customerId?: number;
  senderId: number;
  senderRole: "customer" | "admin";
  message: string;
}): Promise<SupportMessageRecord> {
  const trimmed = input.message.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty");
  }

  let conversation: SupportConversationRecord | null = null;
  if (input.conversationId) {
    conversation = await getSupportConversationById(Number(input.conversationId));
  }
  if (!conversation && input.customerId) {
    conversation = await getSupportConversation(Number(input.customerId));
  }
  if (!conversation && input.customerId) {
    conversation = await getOrCreateSupportConversation(Number(input.customerId));
  }
  if (!conversation) {
    throw new Error(`Conversation #${input.conversationId || input.customerId} not found`);
  }

  const numConvId = Number(conversation.id);

  const now = new Date().toISOString();
  const existingMessages = await getSupportMessages(numConvId);

  let maxId = 0;
  for (const m of existingMessages) {
    if (Number(m.id) > maxId) maxId = Number(m.id);
  }
  for (const m of inMemoryMessages) {
    if (Number(m.id) > maxId) maxId = Number(m.id);
  }
  const newMsgId = Math.max(maxId + 1, messageAutoId++);

  const messageRecord: SupportMessageRecord = {
    id: newMsgId,
    conversationId: numConvId,
    senderId: Number(input.senderId),
    senderRole: input.senderRole,
    message: trimmed,
    readAt: null,
    createdAt: now,
  };

  // 1. Save message to settings array
  existingMessages.push(messageRecord);
  inMemoryMessages.push(messageRecord);
  await setSetting(`support_messages_${numConvId}`, JSON.stringify(existingMessages));

  // 2. Update conversation timestamps
  conversation.lastMessageAt = now;
  conversation.updatedAt = now;
  const allConversations = await loadSupportConversationsRegistry();
  const idx = allConversations.findIndex((c) => Number(c.id) === numConvId);
  if (idx !== -1) {
    allConversations[idx] = conversation;
  } else {
    allConversations.push(conversation);
  }
  await saveSupportConversationsRegistry(allConversations);

  // 3. Persist to DB / Supabase table if available
  const db = await getDb();
  if (db) {
    try {
      await db.insert(supportMessages).values({
        id: newMsgId,
        conversationId: numConvId,
        senderId: Number(input.senderId),
        senderRole: input.senderRole,
        message: trimmed,
        readAt: null,
        createdAt: new Date(now),
      });
      await db
        .update(supportConversations)
        .set({ lastMessageAt: new Date(now), updatedAt: new Date(now) })
        .where(eq(supportConversations.id, numConvId));
    } catch (err) {
      console.warn("[sendSupportMessage db insert notice]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("supportMessages").insert({
      id: newMsgId,
      conversationId: numConvId,
      senderId: Number(input.senderId),
      senderRole: input.senderRole,
      message: trimmed,
      readAt: null,
      createdAt: now,
    });
    await supabaseServer
      .from("supportConversations")
      .update({ lastMessageAt: now, updatedAt: now })
      .eq("id", numConvId);
  } catch {}

  // 4. Real-time Broadcast via Supabase channels (properly awaited)
  try {
    const { supabaseServer } = await import("./supabase");
    
    // Broadcast to customer chat channel
    const chatChannel = supabaseServer.channel(`support_chat_${numConvId}`);
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 600);
      chatChannel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await chatChannel.send({
              type: "broadcast",
              event: "new_message",
              payload: messageRecord,
            });
          } catch {}
          clearTimeout(timer);
          resolve();
        }
      });
    });

    // Broadcast to global admin inbox
    const adminInboxChannel = supabaseServer.channel("admin_support_inbox");
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 600);
      adminInboxChannel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await adminInboxChannel.send({
              type: "broadcast",
              event: "conversation_updated",
              payload: {
                conversationId: numConvId,
                lastMessage: messageRecord,
              },
            });
          } catch {}
          clearTimeout(timer);
          resolve();
        }
      });
    });
  } catch (broadcastErr) {
    console.warn("[sendSupportMessage broadcast notice]:", broadcastErr);
  }

  // 5. Notifications & Email Boundary
  if (input.senderRole === "admin") {
    // Admin replied -> Notify customer
    try {
      const customer = await getUserById(Number(conversation.customerId));
      if (customer) {
        await createUserNotification(
          customer.id,
          "New Message from Support",
          trimmed.length > 80 ? trimmed.slice(0, 77) + "..." : trimmed
        );
        if (customer.email) {
          const { sendEmail } = await import("./email");
          await sendEmail({
            to: customer.email,
            event: "support_reply",
            templateData: {
              customerName: customer.name || "Trader",
              replyMessage: trimmed,
              supportUrl: `${process.env.APP_URL || ""}/support`,
            },
          });
        }
      }
    } catch (notifErr) {
      console.warn("[sendSupportMessage admin reply notification notice]:", notifErr);
    }
  } else {
    // Customer sent message -> Notify Admin
    try {
      const customer = await getUserById(Number(conversation.customerId));
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        const { sendEmail } = await import("./email");
        await sendEmail({
          to: adminEmail,
          event: "customer_message",
          templateData: {
            customerName: customer?.name || `Customer #${conversation.customerId}`,
            customerEmail: customer?.email || "Unknown",
            message: trimmed,
          },
        });
      }
    } catch (notifErr) {
      console.warn("[sendSupportMessage customer notification notice]:", notifErr);
    }
  }

  return messageRecord;
}

/**
 * Marks unread messages in a conversation as read by the specified role.
 */
export async function markSupportConversationRead(
  conversationId: number,
  readerRole: "customer" | "admin"
): Promise<{ success: boolean; count: number }> {
  const numId = Number(conversationId);
  const key = `support_messages_${numId}`;
  const messages = await getSupportMessages(numId);
  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const m of messages) {
    // Mark messages sent by the opposite party that are unread
    if (m.senderRole !== readerRole && !m.readAt) {
      m.readAt = now;
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    await setSetting(key, JSON.stringify(messages));

    // Update in-memory messages
    for (const m of inMemoryMessages) {
      if (Number(m.conversationId) === numId && m.senderRole !== readerRole && !m.readAt) {
        m.readAt = now;
      }
    }

    // Update DB
    const db = await getDb();
    if (db) {
      try {
        await db
          .update(supportMessages)
          .set({ readAt: new Date(now) })
          .where(
            and(
              eq(supportMessages.conversationId, numId),
              ne(supportMessages.senderRole, readerRole),
              isNull(supportMessages.readAt)
            )
          );
      } catch {}
    }

    try {
      const { supabaseServer } = await import("./supabase");
      await supabaseServer
        .from("supportMessages")
        .update({ readAt: now })
        .eq("conversationId", numId)
        .neq("senderRole", readerRole)
        .is("readAt", null);

      const channel = supabaseServer.channel(`support_chat_${numId}`);
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => resolve(), 600);
        channel.subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            try {
              await channel.send({
                type: "broadcast",
                event: "messages_read",
                payload: { conversationId: numId, readerRole, readAt: now },
              });
            } catch {}
            clearTimeout(timer);
            resolve();
          }
        });
      });
    } catch {}
  }

  return { success: true, count: updatedCount };
}

/**
 * Lists all customer conversations for the Admin Support Workspace.
 * Sorted by latest message / update on top.
 */
export async function listAdminSupportConversations(): Promise<AdminSupportConversationSummary[]> {
  const allConversations = await loadSupportConversationsRegistry();

  const summaries: AdminSupportConversationSummary[] = await Promise.all(
    allConversations.map(async (conv) => {
      const numConvId = Number(conv.id);
      const numCustomerId = Number(conv.customerId);
      const [customer, messages] = await Promise.all([
        getUserById(numCustomerId),
        getSupportMessages(numConvId),
      ]);

      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      const unreadCount = messages.filter(
        (m) => (m.senderRole === "customer" || (m as any).senderRole === "user") && !m.readAt
      ).length;

      return {
        id: numConvId,
        customerId: numCustomerId,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessageAt: conv.lastMessageAt || (lastMsg ? lastMsg.createdAt : conv.createdAt),
        customer: {
          id: numCustomerId,
          name: customer?.name || `Customer #${numCustomerId}`,
          email: customer?.email || null,
          phone: customer?.phone || null,
          avatar: (customer as any)?.avatar || null,
          createdAt: customer?.createdAt ? new Date(customer.createdAt).toISOString() : null,
        },
        lastMessage: lastMsg,
        unreadCount,
        totalMessages: messages.length,
      };
    })
  );

  // Sort: Unread messages or newest activity first
  summaries.sort((a, b) => {
    const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  return summaries;
}

/**
 * Retrieves the comprehensive customer context panel for the Admin Workspace:
 * - Customer Profile (Name, Email, Phone, Joined date)
 * - Purchased Products / Entitlements (Scope, dates)
 * - Order History (Order ID, Amount, Payment status, date)
 * - Summary stats (Total spend, total orders, active products)
 */
export async function getCustomerSupportContext(customerId: number): Promise<CustomerSupportContext> {
  const customer = await getUserById(customerId);
  const entitlementsList = await listEntitlements(customerId);
  const ordersList = await listOrdersForUser(customerId);

  const approvedOrders = ordersList.filter(
    (o: any) => o.orderStatus === "approved" || o.paymentStatus === "approved"
  );

  const totalSpend = approvedOrders.reduce((sum: number, o: any) => {
    return sum + (parseFloat(o.amount) || 0);
  }, 0);

  return {
    customer: {
      id: customerId,
      openId: customer?.openId,
      name: customer?.name || `Customer #${customerId}`,
      email: customer?.email || null,
      phone: customer?.phone || null,
      avatar: (customer as any)?.avatar || null,
      role: customer?.role || "user",
      createdAt: customer?.createdAt ? new Date(customer.createdAt).toISOString() : null,
    },
    entitlements: entitlementsList.map((e: any) => ({
      id: e.id,
      orderId: e.orderId,
      productId: e.productId,
      bundleId: e.bundleId,
      scope: e.scope || "",
      productTitle: e.scope?.replace("bundle:", "Bundle #")?.replace("product:", "Product #") || "Access Pass",
      grantedAt: e.grantedAt ? new Date(e.grantedAt).toISOString() : new Date().toISOString(),
    })),
    orders: ordersList.map((o: any) => ({
      id: o.id,
      amount: String(o.amount || "0"),
      currency: o.currency || "BDT",
      paymentMethod: o.paymentMethod || "manual",
      paymentStatus: o.paymentStatus || "pending",
      orderStatus: o.orderStatus || "pending",
      bundleId: o.bundleId || null,
      productId: o.productId || null,
      selectedPdfIds: o.selectedPdfIds || [],
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    })),
    stats: {
      totalSpend,
      totalOrders: ordersList.length,
      activeEntitlementsCount: entitlementsList.length,
    },
  };
}

/**
 * Creates an in-app user notification.
 */
export async function createUserNotification(userId: number, title: string, message: string) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      await db.insert(notifications).values({
        userId,
        title,
        message,
        read: false,
        createdAt: now,
      });
    } catch {}
  }
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("notifications").insert({
      userId,
      title,
      message,
      read: false,
      createdAt: now.toISOString(),
    });
  } catch {}
}

export async function listAllUsers() {
  initInstitutionalSeedData();

  // 1. Sync any users from Supabase users table (bypassed in test environment for instant execution)
  if (process.env.NODE_ENV !== "test") {
    try {
      const { supabaseServer } = await import("./supabase");
      const { data: supaUsers } = await supabaseServer.from("users").select("*");
      if (supaUsers && supaUsers.length > 0) {
        for (const su of supaUsers) {
          if (su.openId) {
            const prof = await getTraderProfile(su.openId);
            const existing = inMemoryUsers.get(su.openId);
            if (existing) {
              if (prof?.name) existing.name = prof.name;
              if (prof?.avatar !== undefined) existing.avatar = prof.avatar;
            } else {
              inMemoryUsers.set(su.openId, {
                id: su.id || deriveNumericIdFromOpenId(su.openId),
                openId: su.openId,
                name: prof?.name || su.name || "Trader",
                email: su.email || null,
                phone: su.phone || null,
                avatar: prof?.avatar || null,
                role: su.role || "user",
                language: su.language || "en",
                loginMethod: "supabase",
                createdAt: su.createdAt ? new Date(su.createdAt) : new Date(),
                updatedAt: su.updatedAt ? new Date(su.updatedAt) : new Date(),
                lastSignedIn: su.lastSignedIn ? new Date(su.lastSignedIn) : new Date(),
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("[listAllUsers Supabase notice]:", err);
    }
  }

  // 2. Sync any additional registered users from persistent settings
  try {
    const rawReg = await getSetting("global_trader_registry");
    if (rawReg) {
      const regOpenIds: string[] = JSON.parse(rawReg);
      for (const oid of regOpenIds) {
        if (oid) {
          const prof = await getTraderProfile(oid);
          if (prof) {
            const existing = inMemoryUsers.get(oid);
            if (existing) {
              if (prof.name) existing.name = prof.name;
              if (prof.avatar !== undefined) existing.avatar = prof.avatar;
            } else {
              inMemoryUsers.set(oid, {
                id: prof.userId || deriveNumericIdFromOpenId(oid),
                openId: oid,
                name: prof.name || "Trader",
                email: null,
                phone: prof.phone || null,
                avatar: prof.avatar || null,
                role: prof.role || "user",
                language: prof.language || "en",
                loginMethod: "supabase",
                createdAt: new Date(),
                updatedAt: new Date(),
                lastSignedIn: new Date(),
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[listAllUsers registry notice]:", err);
  }

  // 3. If drizzle db is connected, merge
  const db = await getDb();
  if (db) {
    try {
      const dbUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      for (const du of dbUsers) {
        if (du.openId && !inMemoryUsers.has(du.openId)) {
          inMemoryUsers.set(du.openId, du);
        }
      }
    } catch (err) {
      console.warn("[listAllUsers error]:", err);
    }
  }

  const allUsersList = Array.from(inMemoryUsers.values());
  for (const u of allUsersList) {
    if (u.openId) {
      try {
        const prof = await getTraderProfile(u.openId);
        if (prof?.name && (!u.name || u.name === "Trader")) u.name = prof.name;
        if (prof?.avatar !== undefined && prof?.avatar !== null) u.avatar = prof.avatar;
        if (prof?.username) (u as any).username = prof.username;
      } catch {}
    }
  }

  return allUsersList;
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "support") {
  const db = await getDb();
  if (db) {
    try {
      await db.update(users).set({ role }).where(eq(users.id, userId));
    } catch (err) {
      console.warn("[updateUserRole error]:", err);
    }
  }

  // Supabase update
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer
      .from("users")
      .update({ role, updatedAt: new Date().toISOString() })
      .eq("id", userId);
  } catch (err) {
    console.warn("[updateUserRole Supabase error]:", err);
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.id === userId) {
      u.role = role;
    }
  }
  return true;
}

export async function grantManualEntitlement(userId: number, scope: string, bundleId?: number, productId?: number) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      await db.insert(entitlements).values({
        userId,
        orderId: 0,
        bundleId: bundleId || null,
        productId: productId || null,
        scope,
        grantedAt: now,
      });
    } catch (err) {
      console.warn("[grantManualEntitlement error]:", err);
    }
  }

  // Supabase insert
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("entitlements").insert({
      userId,
      orderId: 0,
      bundleId: bundleId || null,
      productId: productId || null,
      scope,
      grantedAt: now.toISOString(),
    });
  } catch (err) {
    console.warn("[grantManualEntitlement Supabase error]:", err);
  }

  inMemoryEntitlements.push({
    id: entitlementAutoId++,
    userId,
    orderId: 0,
    bundleId: bundleId || null,
    productId: productId || null,
    scope,
    grantedAt: now,
  });
  return true;
}

export async function revokeEntitlement(entitlementId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(entitlements).where(eq(entitlements.id, entitlementId));
    } catch (err) {
      console.warn("[revokeEntitlement error]:", err);
    }
  }

  // Supabase delete
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("entitlements").delete().eq("id", entitlementId);
  } catch (err) {
    console.warn("[revokeEntitlement Supabase error]:", err);
  }

  const idx = inMemoryEntitlements.findIndex((e) => e.id === entitlementId);
  if (idx !== -1) inMemoryEntitlements.splice(idx, 1);
  return true;
}



export async function addAuditLog(event: {
  actorId: number;
  action: string;
  entity: string;
  entityId?: number | null;
  metadata?: any;
}) {
  const now = new Date();
  const entry = {
    id: auditAutoId++,
    ...event,
    entityId: event.entityId || null,
    metadata: event.metadata || {},
    createdAt: now,
  };
  inMemoryAuditEvents.unshift(entry);
  if (inMemoryAuditEvents.length > 200) inMemoryAuditEvents.pop();

  try {
    await setSetting("system_audit_logs", JSON.stringify(inMemoryAuditEvents.slice(0, 100)));
  } catch {}
  return entry;
}

export async function listAuditLogs() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(50);
    } catch (err) {
      console.warn("[listAuditLogs error]:", err);
    }
  }

  // Supabase settings persistent storage
  try {
    const raw = await getSetting("system_audit_logs");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        }));
      }
    }
  } catch {}

  return inMemoryAuditEvents;
}

export async function listFreeEbooks(includeUnpublished = false) {
  // 1. Primary source: Supabase settings key 'free_ebooks', which is the persistent store used by Admin Panel
  try {
    const rawSetting = await getSetting("free_ebooks");
    if (rawSetting) {
      const parsed = JSON.parse(rawSetting);
      if (Array.isArray(parsed)) {
        const sorted = [...parsed].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        return includeUnpublished
          ? sorted
          : sorted.filter((b: any) => b.isPublished !== false);
      }
    }
  } catch (err) {
    console.warn("[listFreeEbooks getSetting error]:", err);
  }

  // 2. Postgres table if configured
  const db = await getDb();
  if (db) {
    try {
      const query = includeUnpublished
        ? db.select().from(freeEbooks).orderBy(asc(freeEbooks.position))
        : db.select().from(freeEbooks).where(eq(freeEbooks.isPublished, true)).orderBy(asc(freeEbooks.position));
      const rows = await query;
      if (rows && rows.length > 0) return rows;
    } catch (err) {}
  }

  // 3. Supabase direct table query
  try {
    let query = supabaseServer.from("freeEbooks").select("*").order("position", { ascending: true });
    if (!includeUnpublished) {
      query = query.eq("isPublished", true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((b: any) => ({
        ...b,
        createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
        updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      }));
    }
  } catch (err) {}

  // 4. In-memory runtime fallback
  return includeUnpublished
    ? [...inMemoryFreeEbooks]
    : inMemoryFreeEbooks.filter((b) => b.isPublished !== false);
}

export async function getFreeEbookById(id: number) {
  const all = await listFreeEbooks(true);
  const found = all.find((b: any) => Number(b.id) === Number(id));
  if (found) return found;

  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(freeEbooks).where(eq(freeEbooks.id, id)).limit(1);
      if (rows && rows[0]) return rows[0];
    } catch (err) {}
  }

  try {
    const { data, error } = await supabaseServer.from("freeEbooks").select("*").eq("id", id).maybeSingle();
    if (!error && data) return data;
  } catch (err) {}

  return inMemoryFreeEbooks.find((b) => Number(b.id) === Number(id)) || null;
}

export async function createFreeEbook(data: {
  titleEn: string;
  titleBn?: string;
  subtitleEn: string;
  subtitleBn?: string;
  category: string;
  pages?: number;
  keyConcepts?: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  isPublished?: boolean;
  isFree?: boolean;
  price?: string;
  coverImageUrl?: string | null;
}) {
  const newId = Date.now();
  const record: any = {
    id: newId,
    titleEn: data.titleEn,
    titleBn: data.titleBn || data.titleEn,
    subtitleEn: data.subtitleEn,
    subtitleBn: data.subtitleBn || data.subtitleEn,
    category: data.category || "Institutional",
    pages: data.pages || 15,
    keyConcepts: data.keyConcepts || [],
    fileUrl: data.fileUrl || null,
    fileName: data.fileName || `${data.titleEn.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    fileSize: data.fileSize || "2.5 MB",
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
    isFree: data.isFree !== undefined ? data.isFree : (Number(data.price) === 0 || !data.price),
    price: data.price ? String(data.price) : "0",
    coverImageUrl: data.coverImageUrl || null,
    position: inMemoryFreeEbooks.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Persist to Supabase settings key: "free_ebooks"
  try {
    let existing: any[] = [];
    const rawSetting = await getSetting("free_ebooks");
    if (rawSetting) {
      const parsed = JSON.parse(rawSetting);
      if (Array.isArray(parsed)) existing = parsed;
    }
    existing.unshift(record);
    await setSetting("free_ebooks", JSON.stringify(existing));
  } catch (err) {
    console.warn("[createFreeEbook settings error]:", err);
  }

  // 2. Drizzle DB insert
  const db = await getDb();
  if (db) {
    try {
      await db.insert(freeEbooks).values({
        id: record.id,
        titleEn: record.titleEn,
        titleBn: record.titleBn,
        subtitleEn: record.subtitleEn,
        subtitleBn: record.subtitleBn,
        category: record.category,
        pages: record.pages,
        keyConcepts: record.keyConcepts,
        fileUrl: record.fileUrl,
        fileName: record.fileName,
        fileSize: record.fileSize,
        isPublished: record.isPublished,
        position: record.position,
      });
    } catch (err) {}
  }

  // 3. Supabase table insert
  try {
    await supabaseServer.from("freeEbooks").insert({
      id: record.id,
      titleEn: record.titleEn,
      titleBn: record.titleBn,
      subtitleEn: record.subtitleEn,
      subtitleBn: record.subtitleBn,
      category: record.category,
      pages: record.pages,
      keyConcepts: record.keyConcepts,
      fileUrl: record.fileUrl,
      fileName: record.fileName,
      fileSize: record.fileSize,
      isPublished: record.isPublished,
      position: record.position,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  } catch (supaErr) {}

  inMemoryFreeEbooks.unshift(record);
  return record;
}

export async function updateFreeEbook(id: number, data: Partial<any>) {
  const now = new Date();

  // 1. Update in Supabase settings
  try {
    const rawSetting = await getSetting("free_ebooks");
    if (rawSetting) {
      const parsed = JSON.parse(rawSetting);
      if (Array.isArray(parsed)) {
        const idx = parsed.findIndex((b: any) => Number(b.id) === Number(id));
        if (idx !== -1) {
          parsed[idx] = {
            ...parsed[idx],
            ...data,
            updatedAt: now.toISOString(),
          };
          await setSetting("free_ebooks", JSON.stringify(parsed));
        }
      }
    }
  } catch (err) {
    console.warn("[updateFreeEbook settings error]:", err);
  }

  // 2. Drizzle update
  const db = await getDb();
  if (db) {
    try {
      await db.update(freeEbooks).set({ ...data, updatedAt: now }).where(eq(freeEbooks.id, id));
    } catch (err) {}
  }

  // 3. Supabase direct table update
  try {
    await supabaseServer.from("freeEbooks").update({ ...data, updatedAt: now.toISOString() }).eq("id", id);
  } catch (supaErr) {}

  const item = inMemoryFreeEbooks.find((b) => Number(b.id) === Number(id));
  if (item) {
    Object.assign(item, data, { updatedAt: now });
    return item;
  }
  return { id, ...data };
}

export async function deleteFreeEbook(id: number) {
  // 1. Delete from Supabase settings
  try {
    const rawSetting = await getSetting("free_ebooks");
    if (rawSetting) {
      const parsed = JSON.parse(rawSetting);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((b: any) => Number(b.id) !== Number(id));
        await setSetting("free_ebooks", JSON.stringify(filtered));
      }
    }
  } catch (err) {
    console.warn("[deleteFreeEbook settings error]:", err);
  }

  // 2. Drizzle delete
  const db = await getDb();
  if (db) {
    try {
      await db.delete(freeEbooks).where(eq(freeEbooks.id, id));
    } catch (err) {}
  }

  // 3. Supabase direct table delete
  try {
    await supabaseServer.from("freeEbooks").delete().eq("id", id);
  } catch (supaErr) {}

  const idx = inMemoryFreeEbooks.findIndex((b) => Number(b.id) === Number(id));
  if (idx !== -1) {
    inMemoryFreeEbooks.splice(idx, 1);
  }
  return true;
}

export async function getCustomerLibraryPdfs(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const allPdfs = await listFreeEbooks(false);
  if (!allPdfs || allPdfs.length === 0) return [];

  const [ordersList, entitlementsList] = await Promise.all([
    listOrdersForUser(userIdentifier),
    listEntitlements(userIdentifier),
  ]);

  const approvedOrders = (ordersList || []).filter(
    (o: any) =>
      o.paymentStatus === "approved" ||
      o.orderStatus === "approved" ||
      o.paymentMethod === "free"
  );

  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  // Canonical course access check (honors manual grants, dates, lifetime, and admin override blocks)
  let hasCourseBundle = false;
  try {
    const { hasUserCourseAccess } = await import("./userManagement");
    hasCourseBundle = await hasUserCourseAccess(primaryId);
  } catch {
    hasCourseBundle =
      approvedOrders.some(
        (o: any) =>
          o.bundleId === 2 ||
          o.bundleSlug === "course-ebook" ||
          o.bundle?.slug === "course-ebook" ||
          o.bundle?.includesEbook === true
      ) ||
      (entitlementsList || []).some(
        (e: any) => e.bundleId === 2 || e.scope === "bundle:2" || e.scope === "course"
      );
  }

  // If user has NO approved orders, NO entitlements, and NO active course bundle, they own 0 PDFs
  if (approvedOrders.length === 0 && (!entitlementsList || entitlementsList.length === 0) && !hasCourseBundle) {
    return [];
  }

  // 1. Check Master Bundle / Professional Blueprint Bundle (Bundle 4 or Bundle 3)
  const hasMasterBundle =
    approvedOrders.some(
      (o: any) =>
        o.bundleId === 4 ||
        o.bundleId === 3 ||
        o.bundleSlug === "pro-blueprint" ||
        o.bundle?.slug === "pro-blueprint" ||
        (o.bundle?.includesPdfPackage && !o.bundle?.isFree && Number(o.amount) > 1000)
    ) ||
    (entitlementsList || []).some(
      (e: any) =>
        e.bundleId === 4 ||
        e.bundleId === 3 ||
        e.scope === "bundle:4" ||
        e.scope === "bundle:3" ||
        e.scope === "all_pdfs"
    );

  if (hasMasterBundle) {
    // Master bundle includes ALL published PDFs (paid and free)
    return allPdfs;
  }

  // 2. Check Course + eBook Bundle (Bundle 2) evaluated above with canonical hasUserCourseAccess

  // 3. Check Free eBook Package (Bundle 1)
  const hasFreePackage =
    approvedOrders.some(
      (o: any) =>
        o.bundleId === 1 ||
        o.paymentMethod === "free" ||
        o.bundleSlug === "pdf-package" ||
        o.bundle?.slug === "pdf-package" ||
        o.bundle?.isFree === true ||
        o.amount === "0" ||
        o.amount === "0.00" ||
        o.amount === "00"
    ) ||
    (entitlementsList || []).some(
      (e: any) => e.bundleId === 1 || e.scope === "bundle:1"
    );

  // 4. Collect specific explicitly unlocked PDF IDs
  const unlockedPdfIds = new Set<number>();
  for (const order of approvedOrders) {
    if (Array.isArray(order.selectedPdfIds)) {
      for (const pid of order.selectedPdfIds) {
        unlockedPdfIds.add(Number(pid));
      }
    }
    if (order.productId) {
      unlockedPdfIds.add(Number(order.productId));
    }
  }

  for (const ent of (entitlementsList || [])) {
    if (ent.productId) {
      unlockedPdfIds.add(Number(ent.productId));
    }
    if (ent.scope && ent.scope.startsWith("product:")) {
      const pid = parseInt(ent.scope.replace("product:", ""), 10);
      if (!isNaN(pid)) unlockedPdfIds.add(pid);
    }
    if (ent.scope && ent.scope.startsWith("pdf:")) {
      const pid = parseInt(ent.scope.replace("pdf:", ""), 10);
      if (!isNaN(pid)) unlockedPdfIds.add(pid);
    }
  }

  return allPdfs.filter((pdf: any) => {
    const isPdfFree = pdf.isFree === true || Number(pdf.price) === 0 || !pdf.price || pdf.price === "0";

    // Explicit purchase / selected PDF ID
    if (unlockedPdfIds.has(Number(pdf.id))) return true;

    // Course bundle unlocks free PDFs and Course-tagged / SMC strategy PDFs
    if (hasCourseBundle) {
      if (isPdfFree) return true;
      const cat = (pdf.category || "").toLowerCase();
      if (cat.includes("course") || cat.includes("ebook") || cat.includes("playbook") || cat.includes("smc")) {
        return true;
      }
    }

    // Free package unlocks Free PDFs only
    if (hasFreePackage && isPdfFree) {
      return true;
    }

    return false;
  });
}

// Discipline system functions are now in ./features/discipline

// Owner profile functions are now in ./features/owner-profile

// ==============================================================================
// TRADER TRADES & LEADERBOARD SYSTEM
// ==============================================================================

export interface LeaderboardTrader {
  rank: number;
  userId: number;
  openId: string;
  name: string;
  avatar: string | null;
  role: string;
  startingBalance: number;
  currentBalance: number;
  gainPercent: number; // ((currentBalance - startingBalance) / startingBalance) * 100
  currency: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // 0-100%
  totalPnl: number;
  profitFactor: number;
  ruleComplianceRate: number; // 0-100% (Risk management performance)
  disciplineScore: number; // 0-100% (Daily discipline adherence)
  consistencyScore: number; // 0-100%
  currentStreak: number; // Days
  activeDays: number;
  overallScore: number; // 0-100 deterministic composite score
  bestPair: string;
  overallScoreUnrounded?: number;
  scoreUpdatedAtTime?: number;
}

export interface LeaderboardWeights {
  ruleAdherence: number;
  disciplineRoutine: number;
  winRate: number;
  consistency: number;
  profitFactor: number;
}

export const DEFAULT_LEADERBOARD_WEIGHTS: LeaderboardWeights = {
  ruleAdherence: 25,
  disciplineRoutine: 25,
  winRate: 20,
  consistency: 15,
  profitFactor: 15,
};

export async function getLeaderboardWeights(): Promise<LeaderboardWeights> {
  try {
    const raw = await getSetting("leaderboard_settings");
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed === "object") {
        const ra = Number(parsed.ruleAdherence);
        const dr = Number(parsed.disciplineRoutine);
        const wr = Number(parsed.winRate);
        const cs = Number(parsed.consistency);
        const pf = Number(parsed.profitFactor);
        if (
          !isNaN(ra) && ra >= 0 &&
          !isNaN(dr) && dr >= 0 &&
          !isNaN(wr) && wr >= 0 &&
          !isNaN(cs) && cs >= 0 &&
          !isNaN(pf) && pf >= 0 &&
          (ra + dr + wr + cs + pf) > 0
        ) {
          return {
            ruleAdherence: Math.round(ra),
            disciplineRoutine: Math.round(dr),
            winRate: Math.round(wr),
            consistency: Math.round(cs),
            profitFactor: Math.round(pf),
          };
        }
      }
    }
  } catch (err) {
    console.warn("[getLeaderboardWeights error]:", err);
  }
  return { ...DEFAULT_LEADERBOARD_WEIGHTS };
}

export async function saveLeaderboardWeights(weights: Partial<LeaderboardWeights>): Promise<LeaderboardWeights> {
  const current = await getLeaderboardWeights();
  const ra = weights.ruleAdherence !== undefined ? Number(weights.ruleAdherence) : current.ruleAdherence;
  const dr = weights.disciplineRoutine !== undefined ? Number(weights.disciplineRoutine) : current.disciplineRoutine;
  const wr = weights.winRate !== undefined ? Number(weights.winRate) : current.winRate;
  const cs = weights.consistency !== undefined ? Number(weights.consistency) : current.consistency;
  const pf = weights.profitFactor !== undefined ? Number(weights.profitFactor) : current.profitFactor;

  if (
    isNaN(ra) || ra < 0 ||
    isNaN(dr) || dr < 0 ||
    isNaN(wr) || wr < 0 ||
    isNaN(cs) || cs < 0 ||
    isNaN(pf) || pf < 0
  ) {
    throw new Error("Leaderboard weights must be non-negative numbers");
  }

  const sum = ra + dr + wr + cs + pf;
  if (sum === 0) {
    throw new Error("At least one leaderboard weight must be greater than zero");
  }

  const validWeights: LeaderboardWeights = {
    ruleAdherence: Math.round(ra),
    disciplineRoutine: Math.round(dr),
    winRate: Math.round(wr),
    consistency: Math.round(cs),
    profitFactor: Math.round(pf),
  };

  await setSetting("leaderboard_settings", JSON.stringify({
    ...validWeights,
    updatedAt: new Date().toISOString(),
  }));

  return validWeights;
}

export interface UserJournalConfig {
  startingBalance: number;
  currency: string;
  bookName?: string;
  updatedAt?: string;
}

export interface JournalRule {
  id: string;
  text: string;
}

export interface JournalBook {
  id: string;
  name: string;
  strategy?: string;
  startingBalance: number;
  currency?: string;
  rules: JournalRule[];
  createdAt: string;
  description?: string;
}

const inMemoryJournalConfigs: Map<number, UserJournalConfig> = new Map();

/**
 * Robustly resolves user canonical numeric ID (users.id) and derived hash ID (deriveNumericIdFromOpenId).
 * Ensures cross-device requests querying either ID map to the same persistent data.
 */
export async function resolveUserCanonicalAndDerived(
  userId: number,
  openId?: string
): Promise<{ canonicalId: number; derivedId: number; openId: string }> {
  let resolvedOpenId = openId || "";
  let canonicalId = userId;

  if (!resolvedOpenId && userId > 0) {
    const user = await getUserById(userId);
    if (user?.openId) {
      resolvedOpenId = user.openId;
      canonicalId = user.id;
    } else {
      // Check if userId is actually a derived numeric ID
      for (const u of Array.from(inMemoryUsers.values())) {
        if (u.openId && deriveNumericIdFromOpenId(u.openId) === userId) {
          resolvedOpenId = u.openId;
          canonicalId = u.id || canonicalId;
          break;
        }
      }
      if (!resolvedOpenId) {
        try {
          const { supabaseServer } = await import("./supabase");
          const { data } = await supabaseServer.from("users").select("id, openId");
          if (data && data.length) {
            for (const row of data) {
              if (row.openId && deriveNumericIdFromOpenId(row.openId) === userId) {
                resolvedOpenId = row.openId;
                canonicalId = row.id;
                break;
              }
            }
          }
        } catch {}
      }
    }
  } else if (resolvedOpenId) {
    const user = await getUserByOpenId(resolvedOpenId);
    if (user?.id) {
      canonicalId = user.id;
    }
  }

  const derivedId = resolvedOpenId ? deriveNumericIdFromOpenId(resolvedOpenId) : (userId > 9999 ? userId : 0);
  return { canonicalId, derivedId, openId: resolvedOpenId };
}

export async function getUserJournalConfig(userId: number, openId?: string): Promise<UserJournalConfig> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);

  if (inMemoryJournalConfigs.has(canonicalId)) {
    return inMemoryJournalConfigs.get(canonicalId)!;
  }
  if (derivedId && inMemoryJournalConfigs.has(derivedId)) {
    return inMemoryJournalConfigs.get(derivedId)!;
  }

  try {
    const raw = await getSetting(`user_journal_config_${canonicalId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.startingBalance === "number") {
        inMemoryJournalConfigs.set(canonicalId, parsed);
        return parsed;
      }
    }
  } catch {}

  if (derivedId && derivedId !== canonicalId) {
    try {
      const rawDerived = await getSetting(`user_journal_config_${derivedId}`);
      if (rawDerived) {
        const parsed = JSON.parse(rawDerived);
        if (parsed && typeof parsed.startingBalance === "number") {
          inMemoryJournalConfigs.set(canonicalId, parsed);
          return parsed;
        }
      }
    } catch {}
  }

  return { startingBalance: 10000, currency: "$" };
}

export async function setUserJournalConfig(userId: number, config: UserJournalConfig, openId?: string): Promise<void> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);
  inMemoryJournalConfigs.set(canonicalId, config);
  if (derivedId && derivedId !== canonicalId) {
    inMemoryJournalConfigs.set(derivedId, config);
  }
  try {
    await setSetting(`user_journal_config_${canonicalId}`, JSON.stringify(config));
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`user_journal_config_${derivedId}`, JSON.stringify(config));
    }
  } catch {}
}

export async function getUserJournalBooks(userId: number, openId?: string): Promise<JournalBook[]> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);
  let books: JournalBook[] = [];

  // 1. Try settings user_books_${canonicalId}
  try {
    const raw = await getSetting(`user_books_${canonicalId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        books = parsed;
      }
    }
  } catch {}

  // 2. Try settings user_books_${derivedId}
  if (!books.length && derivedId && derivedId !== canonicalId) {
    try {
      const rawDerived = await getSetting(`user_books_${derivedId}`);
      if (rawDerived) {
        const parsed = JSON.parse(rawDerived);
        if (Array.isArray(parsed) && parsed.length > 0) {
          books = parsed;
        }
      }
    } catch {}
  }

  // 3. Direct Supabase table fetch if journalBooks table exists
  if (!books.length) {
    try {
      const { data: supaBooks, error } = await supabaseServer
        .from("journalBooks")
        .select("*")
        .in("userId", derivedId ? [canonicalId, derivedId] : [canonicalId])
        .order("createdAt", { ascending: true });
      if (!error && supaBooks && supaBooks.length > 0) {
        books = supaBooks.map((b: any) => ({
          id: b.id,
          name: b.name,
          strategy: b.strategy || undefined,
          startingBalance: Number(b.startingBalance) || 10000,
          currency: b.currency || "$",
          rules: Array.isArray(b.rules) ? b.rules : [],
          createdAt: b.createdAt || new Date().toISOString(),
          description: b.description || undefined,
        }));
      }
    } catch {}
  }

  // 4. AUTO-HEALING & DATA RESCUE:
  // If the user has trades in the database but 0 books were saved in server settings/table:
  // Inspect user's trades to extract journalBookIds and reconstruct the books!
  const userTrades = await getUserTrades(canonicalId, openId);
  const tradeBookIds = Array.from(new Set(userTrades.map((t) => t.journalBookId).filter(Boolean)));

  if (tradeBookIds.length > 0) {
    const existingBookIds = new Set(books.map((b) => b.id));
    const missingBookIds = tradeBookIds.filter((bId) => !existingBookIds.has(bId));

    if (missingBookIds.length > 0) {
      const config = await getUserJournalConfig(canonicalId, openId);
      for (const bId of missingBookIds) {
        const bookName =
          missingBookIds.length === 1 && config.bookName
            ? config.bookName
            : bId.includes("smc")
            ? "SMC Strategy Journal"
            : bId.includes("ict")
            ? "ICT Silver Bullet Journal"
            : "Trading Journal";

        books.push({
          id: bId,
          name: bookName,
          strategy: "Smart Money Concepts & Price Action",
          startingBalance: config.startingBalance || 10000,
          currency: config.currency || "$",
          rules: [
            { id: `rule_${bId}_1`, text: "Maximum risk per trade is strictly 1% of capital." },
            { id: `rule_${bId}_2`, text: "Always confirm market structure shift before entry." },
          ],
          createdAt: new Date().toISOString(),
          description: "Persistent journal book synchronized across devices.",
        });
      }
      await saveUserJournalBooks(canonicalId, books, openId);
    }
  }

  return books;
}

export async function saveUserJournalBooks(
  userId: number,
  books: JournalBook[],
  openId?: string
): Promise<boolean> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);

  // Safety guard against empty overwrite
  if (!Array.isArray(books) || books.length === 0) {
    const existing = await getUserJournalBooks(canonicalId, openId);
    if (existing.length > 0) {
      console.log(`[saveUserJournalBooks] Safe guard: Preserving ${existing.length} existing server books`);
      return true;
    }
  }

  if (books.length > 0) {
    const firstBook = books[0];
    await setUserJournalConfig(canonicalId, {
      startingBalance: firstBook.startingBalance || 10000,
      currency: firstBook.currency || "$",
      bookName: firstBook.name || "Trading Journal",
      updatedAt: new Date().toISOString(),
    }, openId);
  }

  try {
    await setSetting(`user_books_${canonicalId}`, JSON.stringify(books));
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`user_books_${derivedId}`, JSON.stringify(books));
    }
  } catch (err) {
    console.warn("[saveUserJournalBooks error]:", err);
  }

  try {
    const supaRows = books.map((b) => ({
      id: b.id,
      userId: canonicalId,
      name: b.name,
      strategy: b.strategy || null,
      startingBalance: b.startingBalance || 10000,
      currency: b.currency || "$",
      rules: b.rules || [],
      description: b.description || null,
      createdAt: b.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    await supabaseServer.from("journalBooks").upsert(supaRows, { onConflict: "id" });
  } catch {}

  return true;
}

export async function deleteUserJournalBook(
  userId: number,
  bookId: string,
  openId?: string
): Promise<boolean> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);
  const currentBooks = await getUserJournalBooks(canonicalId, openId);
  const updatedBooks = currentBooks.filter((b) => b.id !== bookId);

  const currentTrades = await getUserTrades(canonicalId, openId);
  const updatedTrades = currentTrades.filter((t) => t.journalBookId !== bookId);

  await saveUserJournalBooks(canonicalId, updatedBooks, openId);
  await syncUserTrades(canonicalId, updatedTrades, undefined, undefined, undefined, openId);

  try {
    await supabaseServer.from("journalBooks").delete().eq("id", bookId);
  } catch {}

  return true;
}

export async function getUserTrades(userId: number, openId?: string): Promise<any[]> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);
  const tradesMap = new Map<string, any>();

  // 1. In-memory check
  for (const t of inMemoryTraderTrades) {
    if (t.userId === canonicalId || (derivedId && t.userId === derivedId)) {
      if (t.id) tradesMap.set(String(t.id), t);
    }
  }

  // 2. Direct Supabase table fetch if table exists
  try {
    const idsToQuery = derivedId && derivedId !== canonicalId ? [canonicalId, derivedId] : [canonicalId];
    const { data: supaTrades, error: supaErr } = await supabaseServer
      .from("traderTrades")
      .select("*")
      .in("userId", idsToQuery)
      .order("createdAt", { ascending: false });
    if (!supaErr && supaTrades && supaTrades.length > 0) {
      for (const t of supaTrades) {
        if (t.id) tradesMap.set(String(t.id), t);
      }
    }
  } catch (err) {}

  // 3. Check settings user_trades_${canonicalId}
  try {
    const raw = await getSetting(`user_trades_${canonicalId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const t of parsed) {
          if (t && t.id) tradesMap.set(String(t.id), t);
        }
      }
    }
  } catch {}

  // 4. Check settings user_trades_${derivedId}
  if (derivedId && derivedId !== canonicalId) {
    try {
      const rawDerived = await getSetting(`user_trades_${derivedId}`);
      if (rawDerived) {
        const parsed = JSON.parse(rawDerived);
        if (Array.isArray(parsed)) {
          for (const t of parsed) {
            if (t && t.id && !tradesMap.has(String(t.id))) {
              tradesMap.set(String(t.id), t);
            }
          }
        }
      }
    } catch {}
  }

  const result = Array.from(tradesMap.values());
  const formatted = result.map((t) => ({
    ...t,
    userId: canonicalId,
    entryPrice: Number(t.entryPrice) || 0,
    stopLoss: Number(t.stopLoss) || 0,
    takeProfit: Number(t.takeProfit) || 0,
    exitPrice: Number(t.exitPrice) || 0,
    pnl: Number(t.pnl) || 0,
    followedRules: t.followedRules === "No" ? "No" : "Yes",
    screenshots: Array.isArray(t.screenshots) ? t.screenshots : (t.mediaUrl && t.mediaType === "image" ? [t.mediaUrl] : []),
  }));

  for (const t of formatted) {
    const idx = inMemoryTraderTrades.findIndex((item) => item.id === t.id);
    if (idx !== -1) {
      inMemoryTraderTrades[idx] = t;
    } else {
      inMemoryTraderTrades.push(t);
    }
  }

  // Ensure rescued / unified trades are saved back to both canonical and derived settings
  if (formatted.length > 0) {
    try {
      await setSetting(`user_trades_${canonicalId}`, JSON.stringify(formatted));
      if (derivedId && derivedId !== canonicalId) {
        await setSetting(`user_trades_${derivedId}`, JSON.stringify(formatted));
      }
    } catch {}
  }

  return formatted;
}

export async function syncUserTrades(
  userId: number,
  trades: any[],
  startingBalance?: number,
  currency?: string,
  bookName?: string,
  openId?: string
): Promise<boolean> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);

  if (typeof startingBalance === "number" && startingBalance > 0) {
    await setUserJournalConfig(canonicalId, {
      startingBalance,
      currency: currency || "$",
      bookName: bookName || "Trading Journal",
      updatedAt: new Date().toISOString(),
    }, openId);
  }

  // CRITICAL SAFETY GUARD:
  // If trades is empty, check if the user already has trades in the database.
  // DO NOT overwrite existing server trades with an empty array from a fresh device!
  if (!Array.isArray(trades) || trades.length === 0) {
    const existing = await getUserTrades(canonicalId, openId);
    if (existing.length > 0) {
      console.log(`[syncUserTrades] Safe guard: Preserving ${existing.length} existing server trades against empty client array`);
      return true;
    }
  }

  // Merge incoming trades with existing server trades idempotently
  const existingTrades = await getUserTrades(canonicalId, openId);
  const tradeMap = new Map<string, any>();
  for (const t of existingTrades) {
    if (t.id) tradeMap.set(String(t.id), t);
  }
  for (const t of trades) {
    if (t && t.id) {
      const existing = tradeMap.get(String(t.id)) || {};
      tradeMap.set(String(t.id), {
        ...existing,
        ...t,
        userId: canonicalId,
        entryPrice: Number(t.entryPrice) || 0,
        stopLoss: Number(t.stopLoss) || 0,
        takeProfit: Number(t.takeProfit) || 0,
        exitPrice: Number(t.exitPrice) || 0,
        pnl: Number(t.pnl) || 0,
        followedRules: t.followedRules === "No" ? "No" : "Yes",
        screenshots: Array.isArray(t.screenshots)
          ? t.screenshots
          : t.mediaUrl && t.mediaType === "image"
          ? [t.mediaUrl]
          : existing.screenshots || [],
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const mergedTrades = Array.from(tradeMap.values());

  try {
    await setSetting(`user_trades_${canonicalId}`, JSON.stringify(mergedTrades));
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`user_trades_${derivedId}`, JSON.stringify(mergedTrades));
    }
  } catch (err) {
    console.warn("[syncUserTrades persistence error]:", err);
  }

  for (const t of mergedTrades) {
    const idx = inMemoryTraderTrades.findIndex((i) => i.id === t.id);
    if (idx !== -1) {
      inMemoryTraderTrades[idx] = t;
    } else {
      inMemoryTraderTrades.push(t);
    }
  }

  try {
    const supaRows = mergedTrades.map((t) => ({
      id: String(t.id),
      userId: canonicalId,
      journalBookId: String(t.journalBookId || "default"),
      tradeNumber: Number(t.tradeNumber) || 1,
      date: String(t.date || new Date().toISOString().slice(0, 10)),
      entryTime: t.entryTime ? String(t.entryTime) : null,
      pair: String(t.pair || "EURUSD").toUpperCase(),
      timeframe: String(t.timeframe || "15M"),
      direction: String(t.direction || "Buy"),
      entryPrice: Number(t.entryPrice) || 0,
      stopLoss: Number(t.stopLoss) || 0,
      takeProfit: Number(t.takeProfit) || 0,
      exitPrice: Number(t.exitPrice) || 0,
      followedRules: t.followedRules === "No" ? "No" : "Yes",
      pnl: Number(t.pnl) || 0,
      riskReward: String(t.riskReward || "1:2"),
      pips: Number(t.pips) || 0,
      lotSize: Number(t.lotSize) || 1,
      tradeRun: t.tradeRun ? String(t.tradeRun) : null,
      note: t.note ? String(t.note) : null,
      tradeRank: String(t.tradeRank || "A"),
      learning: t.learning ? String(t.learning) : null,
      mediaUrl: t.mediaUrl || null,
      mediaType: t.mediaType || null,
      screenshots: t.screenshots || [],
      videoUrl: t.videoUrl || null,
      videoDurationSeconds: t.videoDurationSeconds ? Number(t.videoDurationSeconds) : null,
      customProperties: t.customProperties || null,
      updatedAt: new Date().toISOString(),
    }));
    await supabaseServer.from("traderTrades").upsert(supaRows, { onConflict: "id" });
  } catch {}

  return true;
}

export async function deleteUserTrade(
  userId: number,
  tradeId: string,
  openId?: string
): Promise<boolean> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);
  const currentTrades = await getUserTrades(canonicalId, openId);
  const updated = currentTrades.filter((t) => String(t.id) !== String(tradeId));

  try {
    await setSetting(`user_trades_${canonicalId}`, JSON.stringify(updated));
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`user_trades_${derivedId}`, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("[deleteUserTrade error]:", err);
  }

  const idx = inMemoryTraderTrades.findIndex((t) => String(t.id) === String(tradeId));
  if (idx !== -1) {
    inMemoryTraderTrades.splice(idx, 1);
  }

  try {
    await supabaseServer.from("traderTrades").delete().eq("id", tradeId);
  } catch {}

  return true;
}

export async function getUserNotebook(userId: number, openId?: string): Promise<any | null> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);

  try {
    const raw = await getSetting(`user_notebook_${canonicalId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.templates)) {
        return parsed;
      }
    }
  } catch {}

  if (derivedId && derivedId !== canonicalId) {
    try {
      const rawDerived = await getSetting(`user_notebook_${derivedId}`);
      if (rawDerived) {
        const parsed = JSON.parse(rawDerived);
        if (parsed && Array.isArray(parsed.templates)) {
          return parsed;
        }
      }
    } catch {}
  }

  try {
    const { data, error } = await supabaseServer
      .from("userNotebooks")
      .select("data")
      .in("userId", derivedId ? [canonicalId, derivedId] : [canonicalId])
      .maybeSingle();
    if (!error && data?.data) {
      return data.data;
    }
  } catch {}

  return null;
}

export async function saveUserNotebook(
  userId: number,
  notebookData: any,
  openId?: string
): Promise<boolean> {
  const { canonicalId, derivedId } = await resolveUserCanonicalAndDerived(userId, openId);

  if (!notebookData || typeof notebookData !== "object") return false;

  try {
    const payload = JSON.stringify(notebookData);
    await setSetting(`user_notebook_${canonicalId}`, payload);
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`user_notebook_${derivedId}`, payload);
    }
  } catch (err) {
    console.warn("[saveUserNotebook error]:", err);
  }

  try {
    await supabaseServer.from("userNotebooks").upsert(
      { userId: canonicalId, data: notebookData, updatedAt: new Date().toISOString() },
      { onConflict: "userId" }
    );
  } catch {}

  return true;
}

export async function getAllTraderTrades(): Promise<any[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(traderTrades).orderBy(desc(traderTrades.createdAt));
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("[getAllTraderTrades db error]:", err);
    }
  }

  // Direct Supabase table fetch
  try {
    const { data: supaTrades, error: supaErr } = await supabaseServer
      .from("traderTrades")
      .select("*")
      .order("createdAt", { ascending: false });
    if (!supaErr && supaTrades && supaTrades.length > 0) {
      for (const t of supaTrades) {
        if (!inMemoryTraderTrades.some((item) => item.id === t.id)) {
          inMemoryTraderTrades.push(t);
        }
      }
      return supaTrades;
    }
  } catch (err) {}

  if (inMemoryTraderTrades.length > 0) {
    return inMemoryTraderTrades;
  }

  // Fast single batch fetch from Supabase settings
  try {
    const { data, error } = await supabaseServer
      .from("settings")
      .select("key, value")
      .like("key", "user_trades_%");
    if (!error && data && data.length > 0) {
      for (const row of data) {
        if (!row.value) continue;
        const userIdMatch = row.key.match(/^user_trades_(\d+)$/);
        const parsedUserId = userIdMatch ? Number(userIdMatch[1]) : 0;
        try {
          const parsed = JSON.parse(row.value);
          if (Array.isArray(parsed)) {
            for (const t of parsed) {
              if (t && t.id && !inMemoryTraderTrades.some((item) => item.id === t.id)) {
                inMemoryTraderTrades.push({
                  ...t,
                  userId: t.userId || parsedUserId,
                  entryPrice: Number(t.entryPrice) || 0,
                  stopLoss: Number(t.stopLoss) || 0,
                  takeProfit: Number(t.takeProfit) || 0,
                  exitPrice: Number(t.exitPrice) || 0,
                  pnl: Number(t.pnl) || 0,
                  followedRules: t.followedRules === "No" ? "No" : "Yes",
                });
              }
            }
          }
        } catch {}
      }
    }
  } catch {}

  return inMemoryTraderTrades;
}

function parseTimeframeBounds(timeframe: "all" | "month" | "week"): { startDate?: string; endDate?: string } {
  if (timeframe === "all") return {};
  const now = new Date();
  const format = (d: Date) => d.toISOString().slice(0, 10);

  if (timeframe === "month") {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    return { startDate, endDate };
  }

  if (timeframe === "week") {
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { startDate: format(monday), endDate: format(sunday) };
  }

  return {};
}

export async function getAllLeaderboardRankings(timeframe: "all" | "month" | "week" = "all"): Promise<LeaderboardTrader[]> {
  const allUsers = await listAllUsers();
  const allTrades = await getAllTraderTrades();
  const { startDate, endDate } = parseTimeframeBounds(timeframe);

  const db = await getDb();
  let allCompletions: any[] = [];
  if (db) {
    try {
      allCompletions = await db.select().from(disciplineTaskCompletions);
    } catch (err) {
      console.warn("[getAllLeaderboardRankings completions db error]:", err);
      allCompletions = inMemoryDisciplineCompletions;
    }
  } else {
    allCompletions = inMemoryDisciplineCompletions;
  }

  const weights = await getLeaderboardWeights();
  const totalWeight =
    weights.ruleAdherence +
    weights.disciplineRoutine +
    weights.winRate +
    weights.consistency +
    weights.profitFactor;
  const activeTotalWeight = totalWeight > 0 ? totalWeight : 100;

  const results: LeaderboardTrader[] = [];

  for (const user of allUsers) {
    // Eligibility Rule 1: Email must be verified
    const isEmailVerified = user.emailVerified === true || (user as any).emailVerified === 1 || Boolean((user as any).emailVerified);
    if (!isEmailVerified) continue;

    // Eligibility Rule 2: Active account (not suspended / banned)
    const isSuspended = (user as any).status === "suspended" || (user as any).status === "banned" || (user as any).accountStatus === "suspended" || (user as any).accountStatus === "banned";
    if (isSuspended) continue;

    // Filter user trades by timeframe (all-time default)
    let userTrades = allTrades.filter((t) => t.userId === user.id);
    if (startDate && endDate) {
      userTrades = userTrades.filter((t) => t.date >= startDate && t.date <= endDate);
    }
    if (userTrades.length === 0) continue;

    // Eligibility Rule 3: Must have an ACTIVE PRO or ACTIVE PREMIUM subscription
    const { isEligibleForLeaderboard } = await import("./subscription");
    const hasPaidPlan = await isEligibleForLeaderboard(user.id, user);
    if (!hasPaidPlan) continue;

    // Filter user discipline completions by timeframe
    let userCompletions = allCompletions.filter((c) => c.userId === user.id && c.completed);
    if (startDate && endDate) {
      userCompletions = userCompletions.filter((c) => c.date >= startDate && c.date <= endDate);
    }

    const totalTrades = userTrades.length;
    let winningTrades = 0;
    let losingTrades = 0;
    let breakevenTrades = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let rulesFollowed = 0;
    const pairCounts: Record<string, number> = {};

    for (const t of userTrades) {
      const pnl = Number(t.pnl) || 0;
      if (pnl > 0.001) {
        winningTrades++;
        totalProfit += pnl;
      } else if (pnl < -0.001) {
        losingTrades++;
        totalLoss += Math.abs(pnl);
      } else {
        breakevenTrades++;
      }

      if (t.followedRules === "Yes") {
        rulesFollowed++;
      }

      const p = (t.pair || "EURUSD").toUpperCase();
      pairCounts[p] = (pairCounts[p] || 0) + 1;
    }

    let bestPair = "EUR/USD";
    let maxPairCount = 0;
    for (const [pair, count] of Object.entries(pairCounts)) {
      if (count > maxPairCount) {
        maxPairCount = count;
        bestPair = pair;
      }
    }

    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
    const totalPnl = Math.round((totalProfit - totalLoss) * 100) / 100;
    const profitFactor = totalTrades > 0 && totalLoss > 0
      ? Math.round((totalProfit / totalLoss) * 100) / 100
      : (totalTrades > 0 && totalProfit > 0 ? 99.9 : 0);

    const ruleComplianceRate = totalTrades > 0
      ? Math.round((rulesFollowed / totalTrades) * 100)
      : 0;

    // Active days count
    const allActiveDates = new Set<string>();
    userTrades.forEach((t) => {
      if (t.date) allActiveDates.add(String(t.date));
    });
    userCompletions.forEach((c) => {
      if (c.date) allActiveDates.add(String(c.date));
    });
    const activeDays = allActiveDates.size;

    // Discipline stats computed in-memory
    const completedCount = userCompletions.length;
    const currentStreak = Math.min(30, Math.max(completedCount, activeDays));
    const disciplineScore = Math.min(100, completedCount > 0 ? Math.min(100, completedCount * 10) : Math.min(80, activeDays * 20));

    // Consistency score (0-100)
    const consistencyScore = Math.min(100, Math.round(activeDays * 8 + Math.min(currentStreak * 4, 30)));

    // Multidimensional deterministic scoring formula with dynamic weights:
    // Profit factor normalized to 0-100 bounded scale
    const normalizedPf = totalTrades > 0 ? Math.min(100, Math.max(0, (profitFactor / 3) * 100)) : 0;

    const ruleContribution = (weights.ruleAdherence * ruleComplianceRate) / activeTotalWeight;
    const discContribution = (weights.disciplineRoutine * disciplineScore) / activeTotalWeight;
    const winContribution = (weights.winRate * winRate) / activeTotalWeight;
    const consistContribution = (weights.consistency * consistencyScore) / activeTotalWeight;
    const pfContribution = (weights.profitFactor * normalizedPf) / activeTotalWeight;

    const overallScoreUnrounded = ruleContribution + discContribution + winContribution + consistContribution + pfContribution;
    const overallScore = Math.round(overallScoreUnrounded);

    // Eligibility Rule 3: Must have valid performance data and Overall Score > 0
    if (overallScore <= 0 || overallScoreUnrounded <= 0) continue;

    // Latest activity timestamp for tie-breaking (earlier score achievement ranks higher)
    const activityDates: number[] = [];
    userTrades.forEach((t) => {
      if (t.createdAt) activityDates.push(new Date(t.createdAt).getTime());
      else if (t.date) activityDates.push(new Date(t.date).getTime());
    });
    userCompletions.forEach((c) => {
      if (c.createdAt) activityDates.push(new Date(c.createdAt).getTime());
      else if (c.date) activityDates.push(new Date(c.date).getTime());
    });
    const scoreUpdatedAtTime = activityDates.length > 0
      ? Math.max(...activityDates)
      : (user.createdAt ? new Date(user.createdAt).getTime() : 0);

    const journalConfig = await getUserJournalConfig(user.id);
    const startingBalance = journalConfig.startingBalance || 10000;
    const currency = journalConfig.currency || "$";
    const currentBalance = Math.round((startingBalance + totalPnl) * 100) / 100;
    const gainPercent = startingBalance > 0 ? Math.round(((currentBalance - startingBalance) / startingBalance) * 1000) / 10 : 0;

    // Synchronize latest custom profile name & avatar independently
    const prof = await getTraderProfile(user.openId);
    const resolvedName = prof?.name || user.name || `Trader #${user.id}`;
    const resolvedAvatar = prof?.avatar !== undefined ? prof.avatar : (user.avatar || null);

    results.push({
      rank: 0,
      userId: user.id,
      openId: user.openId,
      name: resolvedName,
      avatar: resolvedAvatar,
      role: user.role || "user",
      startingBalance,
      currentBalance,
      gainPercent,
      currency,
      totalTrades,
      winningTrades,
      losingTrades,
      breakevenTrades,
      winRate,
      totalPnl,
      profitFactor,
      ruleComplianceRate,
      disciplineScore,
      consistencyScore,
      currentStreak,
      activeDays,
      overallScore,
      overallScoreUnrounded,
      scoreUpdatedAtTime,
      bestPair,
    });
  }

  // Strictly deterministic sorting:
  // 1. Primary: exact unrounded composite score descending
  // 2. Secondary: earlier score achievement timestamp ranks higher (ascending timestamp)
  // 3. Fallback: userId ascending
  results.sort((a, b) => {
    const scoreDiff = (b.overallScoreUnrounded ?? b.overallScore) - (a.overallScoreUnrounded ?? a.overallScore);
    if (Math.abs(scoreDiff) > 0.0001) {
      return scoreDiff;
    }
    const timeA = a.scoreUpdatedAtTime || 0;
    const timeB = b.scoreUpdatedAtTime || 0;
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return a.userId - b.userId;
  });

  // Assign competition ranking:
  // Same score + same timestamp = shared rank; subsequent rank skips accordingly (e.g. 1, 2, 2, 4)
  for (let i = 0; i < results.length; i++) {
    if (i > 0) {
      const prev = results[i - 1];
      const curr = results[i];
      const scorePrev = prev.overallScoreUnrounded ?? prev.overallScore;
      const scoreCurr = curr.overallScoreUnrounded ?? curr.overallScore;
      const isSameScore = Math.abs(scorePrev - scoreCurr) < 0.0001;
      const isSameTime = (curr.scoreUpdatedAtTime || 0) === (prev.scoreUpdatedAtTime || 0);

      if (isSameScore && isSameTime) {
        curr.rank = prev.rank;
      } else {
        curr.rank = i + 1;
      }
    } else {
      results[0].rank = 1;
    }
  }

  return results;
}

export async function getLeaderboardRankings(timeframe: "all" | "month" | "week" = "all"): Promise<LeaderboardTrader[]> {
  const allRanked = await getAllLeaderboardRankings(timeframe);
  // Strictly Top 30 only, without padding any fake/mock traders
  return allRanked.slice(0, 30);
}

export async function getUserGlobalRank(userId: number): Promise<{
  rank: number | null;
  overallScore: number | null;
  isRanked: boolean;
}> {
  const allRanked = await getAllLeaderboardRankings("all");
  const entry = allRanked.find((r) => r.userId === userId);
  if (!entry) {
    return { rank: null, overallScore: null, isRanked: false };
  }
  return {
    rank: entry.rank,
    overallScore: Math.round(entry.overallScore),
    isRanked: true,
  };
}

export async function getPublicTraderStats(userId: number, timeframe: "all" | "month" | "week" = "all") {
  const rankings = await getLeaderboardRankings(timeframe);
  const trader = rankings.find((r) => r.userId === userId);
  if (!trader) return null;

  const userTrades = (await getUserTrades(userId)).filter((t) => {
    const { startDate, endDate } = parseTimeframeBounds(timeframe);
    if (startDate && endDate) {
      return t.date >= startDate && t.date <= endDate;
    }
    return true;
  });

  let totalWinAmount = 0;
  let totalLossAmount = 0;
  let winCount = 0;
  let lossCount = 0;

  for (const t of userTrades) {
    const pnl = Number(t.pnl) || 0;
    if (pnl > 0.001) {
      totalWinAmount += pnl;
      winCount++;
    } else if (pnl < -0.001) {
      totalLossAmount += Math.abs(pnl);
      lossCount++;
    }
  }

  const avgWin = winCount > 0 ? Math.round((totalWinAmount / winCount) * 100) / 100 : 0;
  const avgLoss = lossCount > 0 ? Math.round((totalLossAmount / lossCount) * 100) / 100 : 0;

  return {
    ...trader,
    avgWin,
    avgLoss,
    scoreBreakdown: {
      riskManagement: trader.ruleComplianceRate,
      disciplineScore: trader.disciplineScore,
      winRate: trader.winRate,
      consistency: trader.consistencyScore,
      pnlQuality: Math.min(100, Math.round((trader.profitFactor / 3) * 100)),
    },
  };
}

export interface UserOnboardingAnswers {
  discoverySource: string;
  tradingExperience: "Complete Beginner" | "6 Month+ Experience" | "1 Year+ Experience" | string;
  keepsJournal: "Yes" | "No" | string;
}

export interface UserOnboardingRecord {
  userId: number;
  completed: boolean;
  completedAt: string;
  answers: UserOnboardingAnswers;
}

export async function getUserOnboardingStatus(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
): Promise<{ completed: boolean; answers?: UserOnboardingAnswers; completedAt?: string }> {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  if (candidateIds.length === 0) {
    if (typeof userIdentifier === "object" && userIdentifier?.id && userIdentifier.id > 0) {
      candidateIds.push(userIdentifier.id);
    }
  }

  for (const id of candidateIds) {
    const raw = await getSetting(`user_onboarding_${id}`);
    if (raw) {
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (parsed && parsed.completed) {
          return {
            completed: true,
            answers: parsed.answers,
            completedAt: parsed.completedAt,
          };
        }
      } catch (err) {
        console.warn(`[getUserOnboardingStatus parse error for user ${id}]:`, err);
      }
    }
  }

  return { completed: false };
}

export async function saveUserOnboarding(
  userIdentifier: number | { id?: number; openId?: string; email?: string },
  answers: UserOnboardingAnswers
): Promise<{ success: boolean; record: UserOnboardingRecord }> {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  let primaryId = candidateIds[0];
  if (!primaryId && typeof userIdentifier === "object" && userIdentifier?.id && userIdentifier.id > 0) {
    primaryId = userIdentifier.id;
  }
  if (!primaryId && typeof userIdentifier === "number" && userIdentifier > 0) {
    primaryId = userIdentifier;
  }

  if (!primaryId) {
    throw new Error("Unable to identify user account to save onboarding answers.");
  }

  const now = new Date().toISOString();
  const record: UserOnboardingRecord = {
    userId: primaryId,
    completed: true,
    completedAt: now,
    answers: {
      discoverySource: (answers.discoverySource || "").trim(),
      tradingExperience: (answers.tradingExperience || "").trim(),
      keepsJournal: (answers.keepsJournal || "").trim(),
    },
  };

  // 1. Save to user-specific settings key
  await setSetting(`user_onboarding_${primaryId}`, JSON.stringify(record));

  // Also if candidateIds has other linked IDs, ensure consistency
  for (let i = 1; i < candidateIds.length; i++) {
    await setSetting(`user_onboarding_${candidateIds[i]}`, JSON.stringify(record));
  }

  // 2. Append or update in user_onboarding_registry for admin/analytics
  try {
    const rawRegistry = await getSetting("user_onboarding_registry");
    let registry: any[] = [];
    if (rawRegistry) {
      const parsed = typeof rawRegistry === "string" ? JSON.parse(rawRegistry) : rawRegistry;
      if (Array.isArray(parsed)) registry = parsed;
    }

    const existingIdx = registry.findIndex((item) => Number(item.userId) === Number(primaryId));
    if (existingIdx >= 0) {
      registry[existingIdx] = record;
    } else {
      registry.push(record);
    }
    await setSetting("user_onboarding_registry", JSON.stringify(registry));
  } catch (err) {
    console.warn("[saveUserOnboarding registry error]:", err);
  }

  return { success: true, record };
}

// User preferences functions are now in ./features/account

export {
  users,
  verificationTokens,
  products,
  bundles,
  content,
  orders,
  entitlements,
  progress,
  habits,
  disciplineEntries,
  journalEntries,
  supportConversations,
  supportMessages,
  notifications,
  settings,
  auditEvents,
  freeEbooks,
  disciplineTasks,
  disciplineTaskCompletions,
  disciplineExercises,
  disciplineWorkoutCompletions,
  disciplineDailyJournals,
  disciplineForexLogs,
  disciplineSettings,
  traderTrades,
};



