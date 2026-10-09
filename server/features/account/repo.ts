import { getSetting, setSetting } from "../../infra/db";

export function normalizeUserLanguage(lang?: string | null): "en" | "bn" | "ur" {
  if (lang === "bn" || lang === "ur" || lang === "en") return lang;
  return "en";
}

export interface UserPreferences {
  theme: "dark" | "light";
  language: "en" | "bn" | "ur";
  timezone: string;
  currency: string;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "dark",
  language: "en",
  timezone: "Asia/Dhaka",
  currency: "BDT",
};

export async function getUserPreferences(userKey: string | number): Promise<UserPreferences> {
  try {
    const raw = await getSetting(`user_preferences_${userKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme === "light" ? "light" : "dark",
        language: normalizeUserLanguage(parsed.language),
        timezone: parsed.timezone || "Asia/Dhaka",
        currency: parsed.currency || "BDT",
      };
    }
  } catch (err) {
    console.warn("[getUserPreferences error]:", err);
  }
  return { ...DEFAULT_USER_PREFERENCES };
}

export async function saveUserPreferences(userKey: string | number, prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  const current = await getUserPreferences(userKey);
  const updated: UserPreferences = {
    ...current,
    ...prefs,
    language: prefs.language ? normalizeUserLanguage(prefs.language) : current.language,
    theme: prefs.theme ? (prefs.theme === "light" ? "light" : "dark") : current.theme,
  };
  await setSetting(`user_preferences_${userKey}`, JSON.stringify(updated));
  return updated;
}

export async function isUsernameAvailable(username: string, currentUserId: number): Promise<{ available: boolean; reason?: string }> {
  const clean = username.trim().toLowerCase();
  if (clean.length < 3) {
    return { available: false, reason: "Username must be at least 3 characters" };
  }
  if (clean.length > 20) {
    return { available: false, reason: "Username cannot exceed 20 characters" };
  }
  if (!/^[a-z0-9_]+$/.test(clean)) {
    return { available: false, reason: "Username can only contain letters, numbers, and underscores" };
  }

  try {
    const raw = await getSetting("global_usernames_registry");
    if (raw) {
      const registry: Record<string, number> = JSON.parse(raw);
      if (registry[clean] && Number(registry[clean]) !== Number(currentUserId)) {
        return { available: false, reason: "Username is already taken" };
      }
    }
  } catch (err) {
    console.warn("[isUsernameAvailable error]:", err);
  }

  const { getUserById } = await import("../../db");
  const user = await getUserById(currentUserId);
  if (user && (user as any).username && (user as any).username.toLowerCase() === clean) {
    return { available: true };
  }

  return { available: true };
}

export async function claimUsername(username: string, userId: number, openId?: string): Promise<boolean> {
  const clean = username.trim().toLowerCase();
  const check = await isUsernameAvailable(clean, userId);
  if (!check.available) return false;

  try {
    const raw = await getSetting("global_usernames_registry");
    const registry: Record<string, number> = raw ? JSON.parse(raw) : {};

    for (const [key, uid] of Object.entries(registry)) {
      if (Number(uid) === Number(userId)) {
        delete registry[key];
      }
    }
    registry[clean] = userId;
    await setSetting("global_usernames_registry", JSON.stringify(registry));

    const userKey = openId || (userId ? `usr_${userId}` : "");
    if (userKey) {
      const { getTraderProfile, saveTraderProfile } = await import("../../db");
      const prof = await getTraderProfile(userKey);
      if (prof) {
        prof.username = clean;
        await saveTraderProfile(prof);
      }
    }
    return true;
  } catch (err) {
    console.warn("[claimUsername error]:", err);
    return false;
  }
}
