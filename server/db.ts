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
export * from "./features/commerce";
import { listEntitlements, resolveUserCandidateIds, listOrdersForUser } from "./features/commerce";
export * from "./features/support";
export * from "./features/journal";
export * from "./features/leaderboard";

export const DEFAULT_FREE_EBOOKS: any[] = [];

// In-memory runtime fallback (strictly initialized with seed data where appropriate)
export const inMemoryUsers: Map<string, any> = new Map();
const inMemoryDiscipline: any[] = [];
const inMemoryProgress: any[] = [];
const inMemoryAuditEvents: any[] = [];
const inMemoryFreeEbooks: any[] = [];

export function initInstitutionalSeedData() {
  // Disabled: Leaderboard uses only real registered users with real trading records.
  return;
}

let userAutoId = 1;
let auditAutoId = 1;
let ebookAutoId = 6;

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



