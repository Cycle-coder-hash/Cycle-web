import { and, desc, eq } from "drizzle-orm";
import {
  journalEntries,
  traderTrades,
} from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { getSetting, setSetting } from "../../infra/db/settings";
import { supabaseServer } from "../../infra/db/supabase";
import { deriveNumericIdFromOpenId } from "@shared/const";
import { getUserById, getUserByOpenId, inMemoryUsers } from "../auth/repo";

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

export const inMemoryJournal: any[] = [];
let journalAutoId = 1;
export const inMemoryJournalConfigs: Map<number, UserJournalConfig> = new Map();
export const inMemoryTraderTrades: any[] = [];

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
