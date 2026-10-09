import { desc, inArray } from "drizzle-orm";
import { notifications, auditEvents } from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { getSetting, setSetting } from "../../infra/db/settings";
import { supabaseServer } from "../../infra/db/supabase";
import { resolveUserCandidateIds } from "../commerce";

export const inMemoryAuditEvents: any[] = [];
export let auditAutoId = 1;

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
    await supabaseServer.from("notifications").insert({
      userId,
      title,
      message,
      read: false,
      createdAt: now.toISOString(),
    });
  } catch {}
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
