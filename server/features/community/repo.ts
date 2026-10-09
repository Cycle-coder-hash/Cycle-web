import { getSetting, setSetting, supabaseServer } from "../../infra/db";
import { listBundles, listProducts, resolveUserCandidateIds, listOrdersForUser } from "../../db";
export interface CourseTelegramPopupConfig {
  enabled: boolean;
  telegramUrl: string;
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  joinButtonTextEn: string;
  joinButtonTextBn: string;
  dismissButtonTextEn: string;
  dismissButtonTextBn: string;
  displayMode: "once" | "until_joined";
  popupDelay?: number;
}

export const defaultCourseTelegramPopupConfig: CourseTelegramPopupConfig = {
  enabled: true,
  telegramUrl: "",
  titleEn: "COURSE ACCESS IS READY",
  titleBn: "Ã Â¦â€¢Ã Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Â¸ Ã Â¦â€¦Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦â€¢Ã Â§ÂÃ Â¦Â¸Ã Â§â€¡Ã Â¦Â¸ Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¸Ã Â§ÂÃ Â¦Â¤Ã Â§ÂÃ Â¦Â¤",
  messageEn: "Before you begin your course journey, join our official Telegram community for real-time course updates, institutional study materials, session announcements, and dedicated student support.",
  messageBn: "Ã Â¦â€¢Ã Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Â¸ Ã Â¦Â¶Ã Â§ÂÃ Â¦Â°Ã Â§Â Ã Â¦â€¢Ã Â¦Â°Ã Â¦Â¾Ã Â¦Â° Ã Â¦â€ Ã Â¦â€”Ã Â§â€¡ Ã Â¦â€ Ã Â¦Â®Ã Â¦Â¾Ã Â¦Â¦Ã Â§â€¡Ã Â¦Â° Ã Â¦â€¦Ã Â¦Â«Ã Â¦Â¿Ã Â¦Â¶Ã Â¦Â¿Ã Â¦Â¯Ã Â¦Â¼Ã Â¦Â¾Ã Â¦Â² Telegram Ã Â¦â€¢Ã Â¦Â®Ã Â¦Â¿Ã Â¦â€°Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Å¸Ã Â¦Â¿Ã Â¦Â¤Ã Â§â€¡ Ã Â¦Â¯Ã Â§ÂÃ Â¦â€¢Ã Â§ÂÃ Â¦Â¤ Ã Â¦Â¹Ã Â§â€¹Ã Â¦Â¨Ã Â¥Â¤ Ã Â¦ÂÃ Â¦â€“Ã Â¦Â¾Ã Â¦Â¨Ã Â§â€¡ Ã Â¦â€¢Ã Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Â¸ Ã Â¦Â¸Ã Â¦â€šÃ Â¦â€¢Ã Â§ÂÃ Â¦Â°Ã Â¦Â¾Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¤ Ã Â¦â€ Ã Â¦ÂªÃ Â¦Â¡Ã Â§â€¡Ã Â¦Å¸, Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¾Ã Â¦Â¤Ã Â¦Â¿Ã Â¦Â·Ã Â§ÂÃ Â¦Â Ã Â¦Â¾Ã Â¦Â¨Ã Â¦Â¿Ã Â¦â€¢ Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸Ã Â¦Â¾Ã Â¦Â¡Ã Â¦Â¿ Ã Â¦Â®Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦Å¸Ã Â§â€¡Ã Â¦Â°Ã Â¦Â¿Ã Â§Å¸Ã Â¦Â¾Ã Â¦Â², Ã Â¦Â¸Ã Â§â€¡Ã Â¦Â¶Ã Â¦Â¨ Ã Â¦â€¦Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦Â¨Ã Â¦Â¾Ã Â¦â€°Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¸Ã Â¦Â®Ã Â§â€¡Ã Â¦Â¨Ã Â§ÂÃ Â¦Å¸ Ã Â¦ÂÃ Â¦Â¬Ã Â¦â€š Ã Â¦Â¡Ã Â§â€¡Ã Â¦Â¡Ã Â¦Â¿Ã Â¦â€¢Ã Â§â€¡Ã Â¦Å¸Ã Â§â€¡Ã Â¦Â¡ Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸Ã Â§ÂÃ Â¦Â¡Ã Â§â€¡Ã Â¦Â¨Ã Â§ÂÃ Â¦Å¸ Ã Â¦Â¸Ã Â¦Â¾Ã Â¦ÂªÃ Â§â€¹Ã Â¦Â°Ã Â§ÂÃ Â¦Å¸ Ã Â¦ÂªÃ Â¦Â¾Ã Â¦Â¬Ã Â§â€¡Ã Â¦Â¨Ã Â¥Â¤",
  joinButtonTextEn: "JOIN TELEGRAM",
  joinButtonTextBn: "TELEGRAM Ã Â¦Â Ã Â¦Â¯Ã Â§ÂÃ Â¦â€¢Ã Â§ÂÃ Â¦Â¤ Ã Â¦Â¹Ã Â§â€¹Ã Â¦Â¨",
  dismissButtonTextEn: "MAYBE LATER",
  dismissButtonTextBn: "Ã Â¦ÂªÃ Â¦Â°Ã Â§â€¡ Ã Â¦Â¯Ã Â§ÂÃ Â¦â€¢Ã Â§ÂÃ Â¦Â¤ Ã Â¦Â¹Ã Â¦Â¬",
  displayMode: "once",
  popupDelay: 0,
};

export async function getCourseTelegramPopupConfig(): Promise<CourseTelegramPopupConfig> {
  const raw = await getSetting("course_telegram_popup_config");
  if (raw) {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return {
        enabled: parsed.enabled !== false,
        telegramUrl: parsed.telegramUrl || "",
        titleEn: parsed.titleEn || defaultCourseTelegramPopupConfig.titleEn,
        titleBn: parsed.titleBn || defaultCourseTelegramPopupConfig.titleBn,
        messageEn: parsed.messageEn || defaultCourseTelegramPopupConfig.messageEn,
        messageBn: parsed.messageBn || defaultCourseTelegramPopupConfig.messageBn,
        joinButtonTextEn: parsed.joinButtonTextEn || defaultCourseTelegramPopupConfig.joinButtonTextEn,
        joinButtonTextBn: parsed.joinButtonTextBn || defaultCourseTelegramPopupConfig.joinButtonTextBn,
        dismissButtonTextEn: parsed.dismissButtonTextEn || defaultCourseTelegramPopupConfig.dismissButtonTextEn,
        dismissButtonTextBn: parsed.dismissButtonTextBn || defaultCourseTelegramPopupConfig.dismissButtonTextBn,
        displayMode: parsed.displayMode === "until_joined" ? "until_joined" : "once",
        popupDelay: Number(parsed.popupDelay) || 0,
      };
    } catch (e) {
      console.warn("[getCourseTelegramPopupConfig parse error]:", e);
    }
  }
  return defaultCourseTelegramPopupConfig;
}

export async function setCourseTelegramPopupConfig(
  config: Partial<CourseTelegramPopupConfig>
): Promise<CourseTelegramPopupConfig> {
  const current = await getCourseTelegramPopupConfig();
  const merged: CourseTelegramPopupConfig = {
    ...current,
    ...config,
    enabled: config.enabled !== undefined ? Boolean(config.enabled) : current.enabled,
    telegramUrl: (config.telegramUrl ?? current.telegramUrl).trim(),
    displayMode: config.displayMode === "until_joined" ? "until_joined" : "once",
    popupDelay: Number(config.popupDelay) || 0,
  };
  await setSetting("course_telegram_popup_config", JSON.stringify(merged));
  return merged;
}

export async function orderGrantsCourseAccess(order: {
  bundleId?: number | null;
  productId?: number | null;
}): Promise<boolean> {
  if (!order) return false;
  if (order.bundleId) {
    const allBundles = await listBundles();
    const targetBundle = allBundles.find((b: any) => b.id === order.bundleId);
    if (targetBundle) {
      return Boolean(targetBundle.includesCourse);
    }
    if (order.bundleId === 2 || order.bundleId === 3 || order.bundleId === 4) return true;
    if (order.bundleId === 1) return false;
  }
  if (order.productId) {
    const allProducts = await listProducts();
    const targetProduct = allProducts.find((p: any) => p.id === order.productId);
    if (targetProduct) {
      return targetProduct.kind === "course";
    }
  }
  return false;
}

export interface CourseTelegramEventRecord {
  id: number;
  userId: number;
  orderId: number;
  entitlementId?: number | null;
  status: "pending" | "dismissed" | "joined";
  firstShownAt?: string | null;
  dismissedAt?: string | null;
  joinedClickedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const inMemoryTelegramEvents: Map<string, CourseTelegramEventRecord> = new Map();

export async function getCourseTelegramEventsForUser(userIds: number[]): Promise<CourseTelegramEventRecord[]> {
  const events: CourseTelegramEventRecord[] = [];
  const seenKeys = new Set<string>();

  // 1. Try Supabase table if available
  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    const { data, error } = await supabaseServer
      .from("course_telegram_popup_events")
      .select("*")
      .in("userId", userIds);
    if (!error && Array.isArray(data)) {
      for (const row of data) {
        const key = `${row.userId}_${row.orderId}`;
        seenKeys.add(key);
        events.push(row);
        inMemoryTelegramEvents.set(key, row);
      }
    }
  } catch (err) {}

  // 2. Persistent fallback via settings table
  for (const uid of userIds) {
    try {
      const raw = await getSetting(`course_telegram_events_user_${uid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const key = `${item.userId}_${item.orderId}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              events.push(item);
              inMemoryTelegramEvents.set(key, item);
            }
          }
        }
      }
    } catch {}
  }

  // 3. In-memory check
  for (const [, ev] of Array.from(inMemoryTelegramEvents.entries())) {
    if (userIds.includes(ev.userId)) {
      const key = `${ev.userId}_${ev.orderId}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        events.push(ev);
      }
    }
  }

  return events;
}

export async function createCourseTelegramPopupEvent(input: {
  userId: number;
  orderId: number;
  entitlementId?: number | null;
}): Promise<CourseTelegramEventRecord> {
  const now = new Date().toISOString();
  const eventKey = `${input.userId}_${input.orderId}`;

  // Check if already exists (idempotency)
  const existingList = await getCourseTelegramEventsForUser([input.userId]);
  const existing = existingList.find((e) => e.orderId === input.orderId);
  if (existing) {
    return existing;
  }

  const newRecord: CourseTelegramEventRecord = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    userId: input.userId,
    orderId: input.orderId,
    entitlementId: input.entitlementId || null,
    status: "pending",
    firstShownAt: null,
    dismissedAt: null,
    joinedClickedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryTelegramEvents.set(eventKey, newRecord);

  // 1. Try Supabase table insert
  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    const { data, error } = await supabaseServer
      .from("course_telegram_popup_events")
      .insert({
        userId: newRecord.userId,
        orderId: newRecord.orderId,
        entitlementId: newRecord.entitlementId,
        status: newRecord.status,
        createdAt: newRecord.createdAt,
        updatedAt: newRecord.updatedAt,
      })
      .select("*")
      .single();
    if (!error && data) {
      newRecord.id = data.id;
      inMemoryTelegramEvents.set(eventKey, newRecord);
    }
  } catch (err) {}

  // 2. Persist in settings table for guaranteed backup resilience
  try {
    const currentList = await getCourseTelegramEventsForUser([input.userId]);
    const updated = [...currentList.filter((e) => e.orderId !== input.orderId), newRecord];
    await setSetting(`course_telegram_events_user_${input.userId}`, JSON.stringify(updated));
  } catch (err) {}

  return newRecord;
}

export async function getPendingCourseTelegramPopupForUser(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
): Promise<{ event: CourseTelegramEventRecord; config: CourseTelegramPopupConfig } | null> {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  if (candidateIds.length === 0) return null;

  const config = await getCourseTelegramPopupConfig();
  if (!config.enabled || !config.telegramUrl) {
    return null;
  }

  // Canonical course access check (honors manual grants, dates, lifetime, and admin override blocks)
  const { hasUserCourseAccess } = await import("../../userManagement");
  const canAccessCourse = await hasUserCourseAccess(candidateIds[0]);
  if (!canAccessCourse) {
    return null;
  }

  // Get user's orders
  const orders = await listOrdersForUser(userIdentifier);
  // Find approved course orders
  const approvedCourseOrders: any[] = [];
  for (const o of orders) {
    if (o.orderStatus === "approved" || o.paymentStatus === "approved") {
      const grantsCourse = await orderGrantsCourseAccess(o);
      if (grantsCourse) {
        approvedCourseOrders.push(o);
      }
    }
  }

  // Fetch all recorded events for user
  const events = await getCourseTelegramEventsForUser(candidateIds);

  // If no order but user has manual Course access, allow popup via virtual order 0
  if (approvedCourseOrders.length === 0) {
    let ev = events.find((e) => candidateIds.includes(e.userId));
    if (!ev) {
      ev = await createCourseTelegramPopupEvent({
        userId: candidateIds[0],
        orderId: 0,
      });
    }

    if (config.displayMode === "once") {
      if (ev.status === "pending") {
        return { event: ev, config };
      }
    } else if (config.displayMode === "until_joined") {
      if (ev.status !== "joined") {
        return { event: ev, config };
      }
    }
    return null;
  }

  for (const order of approvedCourseOrders) {
    let ev = events.find((e) => e.orderId === order.id);
    if (!ev) {
      // Auto-create event for approved course purchase if not exists
      ev = await createCourseTelegramPopupEvent({
        userId: order.customerId || candidateIds[0],
        orderId: order.id,
      });
    }

    if (config.displayMode === "once") {
      if (ev.status === "pending") {
        return { event: ev, config };
      }
    } else if (config.displayMode === "until_joined") {
      if (ev.status !== "joined") {
        return { event: ev, config };
      }
    }
  }

  return null;
}

export async function recordCourseTelegramAction(
  userIdentifier: number | { id?: number; openId?: string; email?: string },
  eventId: number,
  action: "joined" | "dismissed"
): Promise<{ success: boolean }> {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  if (candidateIds.length === 0) throw new Error("Unauthorized");

  const events = await getCourseTelegramEventsForUser(candidateIds);
  const targetEvent = events.find((e) => e.id === eventId || e.orderId === eventId);
  if (!targetEvent) {
    throw new Error("Event not found or access denied");
  }

  // Security check: must belong to candidateIds
  if (!candidateIds.includes(targetEvent.userId)) {
    throw new Error("Unauthorized to modify this event");
  }

  const now = new Date().toISOString();
  targetEvent.status = action;
  targetEvent.updatedAt = now;
  if (action === "joined") {
    targetEvent.joinedClickedAt = now;
  } else if (action === "dismissed") {
    targetEvent.dismissedAt = now;
  }

  const eventKey = `${targetEvent.userId}_${targetEvent.orderId}`;
  inMemoryTelegramEvents.set(eventKey, targetEvent);

  // Update in Supabase
  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    await supabaseServer
      .from("course_telegram_popup_events")
      .update({
        status: targetEvent.status,
        dismissedAt: targetEvent.dismissedAt || null,
        joinedClickedAt: targetEvent.joinedClickedAt || null,
        updatedAt: now,
      })
      .eq("id", targetEvent.id);
  } catch (err) {}

  // Update in settings table
  try {
    const allUserEvents = await getCourseTelegramEventsForUser([targetEvent.userId]);
    const updatedList = allUserEvents.map((e) => (e.id === targetEvent.id ? targetEvent : e));
    await setSetting(`course_telegram_events_user_${targetEvent.userId}`, JSON.stringify(updatedList));
  } catch (err) {}

  return { success: true };
}

