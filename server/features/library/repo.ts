import { asc, eq } from "drizzle-orm";
import { freeEbooks } from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { getSetting, setSetting } from "../../infra/db/settings";
import { supabaseServer } from "../../infra/db/supabase";
import {
  listOrdersForUser,
  listEntitlements,
  resolveUserCandidateIds,
} from "../commerce";

export const DEFAULT_FREE_EBOOKS: any[] = [];
export const inMemoryFreeEbooks: any[] = [];
let ebookAutoId = 6;

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
    const { hasUserCourseAccess } = await import("../../userManagement");
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

export async function reorderFreeEbooks(orderedIds: number[]): Promise<any[]> {
  const existing = await listFreeEbooks(true);
  const map = new Map<number, any>(existing.map((b: any) => [Number(b.id), b]));
  const reordered: any[] = [];

  for (let i = 0; i < orderedIds.length; i++) {
    const id = Number(orderedIds[i]);
    const item = map.get(id);
    if (item) {
      reordered.push({ ...(item as any), position: i + 1, updatedAt: new Date().toISOString() });
      map.delete(id);
    }
  }

  let nextPos = reordered.length + 1;
  Array.from(map.values()).forEach((remaining: any) => {
    reordered.push({ ...remaining, position: nextPos++, updatedAt: new Date().toISOString() });
  });

  try {
    await setSetting("free_ebooks", JSON.stringify(reordered));
  } catch (err) {
    console.warn("[reorderFreeEbooks setSetting error]:", err);
  }

  return reordered;
}
