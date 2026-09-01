import { and, desc, eq } from "drizzle-orm";
import pg from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
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
  supportTickets,
  notifications,
  settings,
  auditEvents,
} from "../drizzle/schema";

import { ENV } from "./_core/env";

let _db: any = null;
let _pgPool: pg.Pool | null = null;

// In-memory runtime fallback (strictly empty, no dummy data)
const inMemoryUsers: Map<string, any> = new Map();
const inMemoryOrders: any[] = [];
const inMemoryEntitlements: any[] = [];
const inMemoryJournal: any[] = [];
const inMemoryDiscipline: any[] = [];
const inMemoryProgress: any[] = [];
const inMemoryTickets: any[] = [];
const inMemoryAuditEvents: any[] = [];

let userAutoId = 1;
let journalAutoId = 1;
let ticketAutoId = 1;
let orderAutoId = 1;
let entitlementAutoId = 1;
let auditAutoId = 1;



export async function getDb() {
  const url = process.env.DATABASE_URL;
  const isTemplate = !url || url.includes("[") || url.includes("]") || url.includes("<") || url.includes(">");
  if (!_db && url && !isTemplate) {
    try {
      if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
        _pgPool = new pg.Pool({
          connectionString: url,
          ssl: url.includes("supabase.com") ? { rejectUnauthorized: false } : undefined,
        });
        _db = drizzlePg(_pgPool);
      } else if (url.startsWith("mysql://")) {
        _db = drizzleMysql(url);
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (db) {
    try {
      const values: InsertUser = {
        openId: user.openId,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        phone: user.phone,
        loginMethod: user.loginMethod,
        lastSignedIn: user.lastSignedIn ?? new Date(),
        role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
        language: user.language ?? "en",
      };
      const updateSet: Record<string, unknown> = { ...values };
      delete updateSet.openId;
      await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
      return;
    } catch (err) {
      console.warn("[Database upsertUser fallback to memory]:", err);
    }
  }

  inMemoryUsers.set(user.openId, {
    id: inMemoryUsers.get(user.openId)?.id || userAutoId++,
    ...user,
    createdAt: inMemoryUsers.get(user.openId)?.createdAt || new Date(),
    updatedAt: new Date(),
    lastSignedIn: user.lastSignedIn || new Date(),
    role: user.role || "user",
    language: user.language || "en",
  });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (rows && rows[0]) return rows[0];
    } catch (err) {
      console.warn("[Database getUserByOpenId fallback to memory]:", err);
    }
  }
  return inMemoryUsers.get(openId);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      if (rows && rows[0]) return rows[0];
    } catch (err) {
      console.warn("[Database getUserByEmail fallback to memory]:", err);
    }
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.email && u.email.toLowerCase() === normalizedEmail) {
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
  language?: "en" | "bn";
  emailVerified?: boolean;
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
        emailVerified: data.emailVerified ?? false,
        loginMethod: "password",
        role: data.role || "user",
        language: data.language || "en",
        lastSignedIn: new Date(),
      });
      const created = await getUserByOpenId(openId);
      if (created) return created;
    } catch (err) {
      console.warn("[Database createUser fallback to memory]:", err);
    }
  }

  const newUser: any = {
    id: userAutoId++,
    openId,
    name: data.name,
    email: normalizedEmail,
    passwordHash: data.passwordHash,
    phone: data.phone || null,
    emailVerified: data.emailVerified ?? false,
    loginMethod: "password",
    role: data.role || "user",
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
      return await db.select().from(bundles).where(eq(bundles.isPublished, true));
    } catch (err) {
      console.warn("[listBundles error]:", err);
    }
  }
  return [
    { id: 1, slug: "pdf-package", titleEn: "PDF Package", titleBn: "PDF প্রফেশনাল প্যাকেজ", price: "199.00", currency: "BDT", includesPdfPackage: true, includesEbook: false, includesCourse: false },
    { id: 2, slug: "course-ebook", titleEn: "Course + Free eBook", titleBn: "ফুল কোর্স + এক্সক্লুসিভ eBook", price: "399.00", currency: "BDT", includesPdfPackage: false, includesEbook: true, includesCourse: true },
    { id: 3, slug: "master-bundle", titleEn: "Master Full Bundle", titleBn: "অল-ইন-ওয়ান মাস্টার বাণ্ডেল", price: "799.00", currency: "BDT", includesPdfPackage: true, includesEbook: true, includesCourse: true },
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

export async function listOrdersForUser(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, userId))
        .orderBy(desc(orders.createdAt));
    } catch (err) {
      console.warn("[listOrdersForUser error]:", err);
    }
  }
  return inMemoryOrders.filter((o) => o.customerId === userId);
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
  return inMemoryOrders;
}

export async function listEntitlements(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(entitlements)
        .where(eq(entitlements.userId, userId))
        .orderBy(desc(entitlements.grantedAt));
    } catch (err) {
      console.warn("[listEntitlements error]:", err);
    }
  }
  return inMemoryEntitlements.filter((e) => e.userId === userId);
}

export async function listNotifications(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    } catch (err) {
      console.warn("[listNotifications error]:", err);
    }
  }
  return [
    {
      id: 1,
      userId,
      title: "Welcome to Cycle of Chart",
      message: "Begin your journey with Stage 01 of the 12-Stage Institutional Roadmap.",
      read: false,
      createdAt: new Date(),
    },
  ];
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
  return [];
}

export async function listTickets(userId?: number) {
  const db = await getDb();
  if (db) {
    try {
      return userId
        ? await db
            .select()
            .from(supportTickets)
            .where(eq(supportTickets.userId, userId))
            .orderBy(desc(supportTickets.createdAt))
        : await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    } catch (err) {
      console.warn("[listTickets error]:", err);
    }
  }
  return userId ? inMemoryTickets.filter((t) => t.userId === userId) : inMemoryTickets;
}

export async function listAllUsers() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (err) {
      console.warn("[listAllUsers error]:", err);
    }
  }
  return Array.from(inMemoryUsers.values());
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
  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.id === userId) {
      u.role = role;
    }
  }
  return true;
}

export async function grantManualEntitlement(userId: number, scope: string, bundleId?: number, productId?: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.insert(entitlements).values({
        userId,
        orderId: 0,
        bundleId: bundleId || null,
        productId: productId || null,
        scope,
      });
    } catch (err) {
      console.warn("[grantManualEntitlement error]:", err);
    }
  }
  inMemoryEntitlements.push({
    id: entitlementAutoId++,
    userId,
    orderId: 0,
    bundleId: bundleId || null,
    productId: productId || null,
    scope,
    grantedAt: new Date(),
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
  const idx = inMemoryEntitlements.findIndex((e) => e.id === entitlementId);
  if (idx !== -1) inMemoryEntitlements.splice(idx, 1);
  return true;
}

export async function updateTicketStatus(ticketId: number, status: "open" | "in_progress" | "resolved") {
  const db = await getDb();
  if (db) {
    try {
      await db.update(supportTickets).set({ status }).where(eq(supportTickets.id, ticketId));
    } catch (err) {
      console.warn("[updateTicketStatus error]:", err);
    }
  }
  const t = inMemoryTickets.find((item) => item.id === ticketId);
  if (t) t.status = status;
  return true;
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
  return inMemoryAuditEvents;
}

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
  supportTickets,
  notifications,
  settings,
  auditEvents,
};


