import { and, desc, eq, or } from "drizzle-orm";
import {
  InsertUser,
  User,
  users,
  verificationTokens,
} from "../../../drizzle/schema";
import { ENV } from "../../_core/env";
import { deriveNumericIdFromOpenId } from "@shared/const";
import { getDb } from "../../infra/db/client";
import { getSetting, setSetting } from "../../infra/db/settings";
import { supabaseServer } from "../../infra/db/supabase";
import { resolveUserCandidateIds } from "../commerce";

export const inMemoryUsers: Map<string, any> = new Map();
export let userAutoId = 1;
export const inMemoryTokens: { email: string; otp: string; type: string; expiresAt: Date; isUsed: boolean }[] = [];

export function initInstitutionalSeedData() {
  // Disabled: Leaderboard uses only real registered users with real trading records.
  return;
}

export interface TraderProfileData {
  userId: number;
  openId: string;
  name: string;
  avatar: string | null;
  username?: string | null;
  bio?: string | null;
  phone?: string | null;
  role?: string;
  language?: "en" | "bn" | "ur";
  isCustomName?: boolean;
  isCustomAvatar?: boolean;
  updatedAt?: string;
}

export const inMemoryTraderProfiles: Map<string, TraderProfileData> = new Map();

export function resetInMemoryUsersForTests() {
  inMemoryUsers.clear();
  inMemoryTraderProfiles.clear();
  inMemoryTokens.length = 0;
}

export async function getTraderProfile(openIdOrUserId: string | number): Promise<TraderProfileData | null> {
  if (!openIdOrUserId) return null;
  const key = `trader_profile_${openIdOrUserId}`;
  if (inMemoryTraderProfiles.has(key)) {
    return inMemoryTraderProfiles.get(key)!;
  }
  try {
    const raw = await getSetting(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      inMemoryTraderProfiles.set(key, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn("[getTraderProfile error]:", err);
  }
  return null;
}

export async function saveTraderProfile(profile: TraderProfileData): Promise<void> {
  try {
    if (profile.openId) {
      inMemoryTraderProfiles.set(`trader_profile_${profile.openId}`, profile);
      await setSetting(`trader_profile_${profile.openId}`, JSON.stringify(profile));
    }
    if (profile.userId) {
      inMemoryTraderProfiles.set(`trader_profile_${profile.userId}`, profile);
      await setSetting(`trader_profile_${profile.userId}`, JSON.stringify(profile));
    }

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
  updates: { name?: string; phone?: string | null; language?: "en" | "bn" | "ur"; avatar?: string | null; username?: string | null; bio?: string | null }
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
      if (updates.bio !== undefined) (existing as any).bio = updates.bio;
      existing.updatedAt = new Date();
    }
  }
  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.id === userId || (resolvedOpenId && u.openId === resolvedOpenId)) {
      if (updates.name) u.name = updates.name;
      if (updates.phone !== undefined) u.phone = updates.phone;
      if (updates.language) u.language = updates.language;
      if (updates.avatar !== undefined) u.avatar = updates.avatar;
      if (updates.username !== undefined) u.username = updates.username;
      if (updates.bio !== undefined) (u as any).bio = updates.bio;
      u.updatedAt = new Date();
    }
  }

  const existingProf = (resolvedOpenId ? await getTraderProfile(resolvedOpenId) : null) || (userId ? await getTraderProfile(userId) : null);
  const isCustomName = updates.name !== undefined ? true : (existingProf?.isCustomName ?? false);
  const isCustomAvatar = updates.avatar !== undefined ? true : (existingProf?.isCustomAvatar ?? false);

  const newProfile: TraderProfileData = {
    userId,
    openId: resolvedOpenId,
    name: updates.name || existingProf?.name || "Trader",
    avatar: updates.avatar !== undefined ? updates.avatar : (existingProf?.avatar ?? null),
    phone: updates.phone !== undefined ? updates.phone : (existingProf?.phone || null),
    language: updates.language || existingProf?.language || "en",
    username: updates.username !== undefined ? updates.username : (existingProf?.username || null),
    bio: updates.bio !== undefined ? updates.bio : (existingProf?.bio || null),
    isCustomName,
    isCustomAvatar,
    updatedAt: new Date().toISOString(),
  };
  await saveTraderProfile(newProfile);

  try {
    if (resolvedOpenId) {
      const supaUpdate: any = { updatedAt: new Date().toISOString() };
      if (updates.name) supaUpdate.name = updates.name;
      if (updates.phone !== undefined) supaUpdate.phone = updates.phone;
      if (updates.language) supaUpdate.language = updates.language;
      if (updates.avatar !== undefined) supaUpdate.avatar = updates.avatar;
      if (updates.bio !== undefined) supaUpdate.bio = updates.bio;
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

  const existingProf = (await getTraderProfile(user.openId)) || (numericId ? await getTraderProfile(numericId) : null);
  const existingUser = inMemoryUsers.get(user.openId);

  // If user has customized their name, do not let Google OAuth / external provider overwrite it
  const hasCustomName = existingProf?.isCustomName || (existingProf?.name && existingProf.name !== "Trader" && existingProf.name !== user.name);
  const resolvedName = (hasCustomName ? existingProf?.name : null) || user.name || existingProf?.name || existingUser?.name || "Trader";

  // If user has customized or removed their avatar, do not let Google OAuth / external provider overwrite it
  let resolvedAvatar: string | null = null;
  if (existingProf?.isCustomAvatar) {
    resolvedAvatar = existingProf.avatar !== undefined ? existingProf.avatar : null;
  } else if (existingProf?.avatar !== undefined && existingProf.avatar !== user.avatar) {
    resolvedAvatar = existingProf.avatar;
  } else {
    resolvedAvatar = user.avatar !== undefined ? user.avatar : (existingProf?.avatar || existingUser?.avatar || null);
  }

  const userRecord = {
    id: numericId,
    ...user,
    name: resolvedName,
    avatar: resolvedAvatar,
    username: existingProf?.username || (existingUser as any)?.username || null,
    bio: existingProf?.bio !== undefined ? existingProf.bio : ((existingUser as any)?.bio || null),
    emailVerified: user.emailVerified ?? existingUser?.emailVerified ?? true,
    accountStatus: (user as any).accountStatus || existingUser?.accountStatus || "active",
    status: (user as any).status || existingUser?.status || "active",
    createdAt: existingUser?.createdAt || new Date(),
    updatedAt: new Date(),
    lastSignedIn: user.lastSignedIn || new Date(),
    role: user.role || (user.openId === ENV.ownerOpenId ? "admin" : (existingUser?.role || "user")),
    language: user.language || existingUser?.language || "en",
  };

  inMemoryUsers.set(user.openId, userRecord);

  await saveTraderProfile({
    userId: numericId,
    openId: user.openId,
    name: resolvedName,
    avatar: resolvedAvatar,
    username: userRecord.username,
    bio: userRecord.bio,
    phone: user.phone || null,
    role: userRecord.role as string,
    language: userRecord.language as any,
    isCustomName: existingProf?.isCustomName ?? false,
    isCustomAvatar: existingProf?.isCustomAvatar ?? false,
    updatedAt: new Date().toISOString(),
  });

  try {
    const { data: supaUser } = await supabaseServer.from("users").upsert({
      openId: user.openId,
      name: resolvedName,
      avatar: resolvedAvatar,
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
        const prof = (await getTraderProfile(openId)) || (user.id ? await getTraderProfile(user.id) : null);
        if (prof?.name) (user as any).name = prof.name;
        if (prof?.avatar !== undefined) (user as any).avatar = prof.avatar;
        if (prof?.username) (user as any).username = prof.username;
        if (prof?.bio !== undefined) (user as any).bio = prof.bio;
        inMemoryUsers.set(openId, user);
        return user;
      }
    } catch (err) {
      console.warn("[Database getUserByOpenId fallback to memory]:", err);
    }
  }

  try {
    const { data, error } = await supabaseServer.from("users").select("*").eq("openId", openId).maybeSingle();
    if (data && !error) {
      const prof = (await getTraderProfile(openId)) || (data.id ? await getTraderProfile(data.id) : null);
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
        bio: prof?.bio !== undefined ? prof.bio : ((data as any).bio || null),
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
    const prof = (await getTraderProfile(openId)) || (user.id ? await getTraderProfile(user.id) : null);
    if (prof?.name) user.name = prof.name;
    if (prof?.avatar !== undefined) user.avatar = prof.avatar;
    if (prof?.username) user.username = prof.username;
    if (prof?.bio !== undefined) (user as any).bio = prof.bio;
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
        const prof = (u.openId ? await getTraderProfile(u.openId) : null) || (u.id ? await getTraderProfile(u.id) : null);
        if (prof?.name) (u as any).name = prof.name;
        if (prof?.avatar !== undefined) (u as any).avatar = prof.avatar;
        if (prof?.username) (u as any).username = prof.username;
        if (prof?.bio !== undefined) (u as any).bio = prof.bio;
        inMemoryUsers.set(u.openId, u);
        return u;
      }
    } catch (err) {
      console.warn("[Database getUserByEmail fallback to memory]:", err);
    }
  }

  try {
    const { data, error } = await supabaseServer.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
    if (data && !error) {
      const prof = (data.openId ? await getTraderProfile(data.openId) : null) || (data.id ? await getTraderProfile(data.id) : null);
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
        bio: prof?.bio !== undefined ? prof.bio : ((data as any).bio || null),
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
      const prof = (u.openId ? await getTraderProfile(u.openId) : null) || (u.id ? await getTraderProfile(u.id) : null);
      if (prof?.name) u.name = prof.name;
      if (prof?.avatar !== undefined) u.avatar = prof.avatar;
      if (prof?.username) u.username = prof.username;
      if (prof?.bio !== undefined) (u as any).bio = prof.bio;
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
        const prof = (u.openId ? await getTraderProfile(u.openId) : null) || (u.id ? await getTraderProfile(u.id) : null);
        if (prof?.name) (u as any).name = prof.name;
        if (prof?.avatar !== undefined) (u as any).avatar = prof.avatar;
        if (prof?.username) (u as any).username = prof.username;
        if (prof?.bio !== undefined) (u as any).bio = prof.bio;
        return u;
      }
    } catch {}
  }
  try {
    const { data } = await supabaseServer.from("users").select("*").eq("id", id).maybeSingle();
    if (data) {
      const prof = (data.openId ? await getTraderProfile(data.openId) : null) || (data.id ? await getTraderProfile(data.id) : null);
      if (prof?.name) (data as any).name = prof.name;
      if (prof?.avatar !== undefined) (data as any).avatar = prof.avatar;
      if (prof?.username) (data as any).username = prof.username;
      if (prof?.bio !== undefined) (data as any).bio = prof.bio;
      return data;
    }
  } catch {}
  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.id === id) {
      const prof = (u.openId ? await getTraderProfile(u.openId) : null) || (u.id ? await getTraderProfile(u.id) : null);
      if (prof?.name) (u as any).name = prof.name;
      if (prof?.avatar !== undefined) (u as any).avatar = prof.avatar;
      if (prof?.username) (u as any).username = prof.username;
      if (prof?.bio !== undefined) (u as any).bio = prof.bio;
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

export async function listAllUsers() {
  initInstitutionalSeedData();

  // 1. Sync any users from Supabase users table (bypassed in test environment for instant execution)
  if (process.env.NODE_ENV !== "test") {
    try {
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
    try {
      const prof = (u.openId ? await getTraderProfile(u.openId) : null) || (u.id ? await getTraderProfile(u.id) : null);
      if (prof?.name) u.name = prof.name;
      if (prof?.avatar !== undefined) u.avatar = prof.avatar;
      if (prof?.username) (u as any).username = prof.username;
      if (prof?.bio !== undefined) (u as any).bio = prof.bio;
    } catch {}
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
