import { eq } from "drizzle-orm";
import { settings } from "../../../drizzle/schema";
import { getDb } from "./client";
import { supabaseServer } from "./supabase";

const inMemorySettings: Map<string, string> = new Map();

export async function getSetting(key: string): Promise<string | null> {
  if (inMemorySettings.has(key)) {
    return inMemorySettings.get(key) || null;
  }
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (rows.length) {
        inMemorySettings.set(key, rows[0].value);
        return rows[0].value;
      }
    } catch (err) {
      console.warn("[getSetting error]:", err);
    }
  }
  try {
    const { data, error } = await supabaseServer.from("settings").select("value").eq("key", key).maybeSingle();
    if (data && !error && data.value !== undefined && data.value !== null) {
      inMemorySettings.set(key, data.value);
      return data.value;
    }
  } catch {}
  return inMemorySettings.get(key) || null;
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  inMemorySettings.set(key, value);
  const db = await getDb();
  if (db) {
    try {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (existing.length) {
        await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value });
      }
    } catch (err) {
      console.warn("[setSetting error]:", err);
    }
  }
  try {
    await supabaseServer.from("settings").upsert({ key, value }, { onConflict: "key" });
  } catch (supaErr) {
    console.warn("[setSetting Supabase error]:", supaErr);
  }
  return true;
}

export async function primeUserSettingsCache(userIds: number[]): Promise<void> {
  if (process.env.NODE_ENV === "test" || userIds.length === 0) return;
  try {
    const { data } = await supabaseServer
      .from("settings")
      .select("key,value")
      .or("key.like.manual_access_%,key.like.user_subscription_%,key.like.user_account_status_%");
    if (Array.isArray(data)) {
      for (const row of data) {
        if (row?.key && row?.value !== undefined && row?.value !== null) {
          inMemorySettings.set(row.key, row.value);
        }
      }
    }
    for (const uid of userIds) {
      const candidateKeys = [
        `manual_access_${uid}:course`,
        `manual_access_${uid}:pro`,
        `manual_access_${uid}:premium`,
        `user_subscription_${uid}`,
        `user_account_status_${uid}`,
      ];
      for (const k of candidateKeys) {
        if (!inMemorySettings.has(k)) {
          inMemorySettings.set(k, "");
        }
      }
    }
  } catch {}
}
