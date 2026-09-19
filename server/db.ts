import { and, asc, desc, eq, or } from "drizzle-orm";
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
  ticketReplies,
  SupportTicket,
  InsertSupportTicket,
  TicketReply,
  InsertTicketReply,
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
} from "../drizzle/schema";

import { ENV } from "./_core/env";

let _db: any = null;
let _pgPool: pg.Pool | null = null;

export const DEFAULT_FREE_EBOOKS: any[] = [
  {
    id: 1,
    titleEn: "1. Candle Range Theory (CRT) Master Cheat-Sheet",
    titleBn: "১. ক্যান্ডেল রেঞ্জ থিওরি (CRT) মাস্টার চিট-শীট",
    subtitleEn: "Complete 4-Step Algorithmic Cycle & Invalidation Points",
    subtitleBn: "সম্পূর্ণ ৪-ধাপ অ্যালগরিদমিক সাইকেল ও ইনভ্যালিডেশন পয়েন্ট",
    category: "Algorithm",
    pages: 18,
    keyConcepts: [
      "Phase 1: Asian Session Range Initiation (00:00 - 06:00 GMT)",
      "Phase 2: London Open Judas Sweep (07:30 - 09:00 GMT)",
      "Phase 3: NY Open Real Institutional Expansion (13:00 - 15:30 GMT)",
      "Phase 4: Targeted Distribution into HTF Pool",
    ],
    fileUrl: null,
    fileName: "01_Candle_Range_Theory_CRT_Master_CheatSheet.pdf",
    fileSize: "2.4 MB",
    isPublished: true,
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    titleEn: "2. Liquidity Engineering & Stop Hunt Identification",
    titleBn: "২. লিকুইডিটি ইঞ্জিনিয়ারিং ও স্টপ হান্ট আইডেন্টিফিকেশন",
    subtitleEn: "BSL, SSL, Internal vs External Liquidity Traps",
    subtitleBn: "BSL, SSL এবং ইন্টারনাল বনাম এক্সটারনাল লিকুইডিটি ট্র্যাপ",
    category: "Liquidity",
    pages: 24,
    keyConcepts: [
      "Buy-Side Liquidity (BSL) rests above swing highs & equal highs.",
      "Sell-Side Liquidity (SSL) rests below swing lows & trendline support.",
      "Inducement vs Valid Breakout confirmation formula.",
    ],
    fileUrl: null,
    fileName: "02_Liquidity_Engineering_Stop_Hunt.pdf",
    fileSize: "3.1 MB",
    isPublished: true,
    position: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    titleEn: "3. Institutional Order Block (OB) Validation Matrix",
    titleBn: "৩. ইনস্টিটিউশনাল অর্ডার ব্লক (OB) ভ্যালিডেশন ম্যাট্রিক্স",
    subtitleEn: "Distinguishing 80%+ Win Rate OBs from Fake SMC Zones",
    subtitleBn: "৮০%+ উইন রেটের জেনুইন অর্ডার ব্লক শনাক্তকরণ পদ্ধতি",
    category: "SMC Strategy",
    pages: 20,
    keyConcepts: [
      "Rule 1: Must have swept liquidity prior to creation.",
      "Rule 2: Must have caused a Market Structure Shift (MSS).",
      "Rule 3: Must contain an imbalance / Fair Value Gap in the displacement.",
    ],
    fileUrl: null,
    fileName: "03_Order_Block_Validation_Matrix.pdf",
    fileSize: "2.8 MB",
    isPublished: true,
    position: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    titleEn: "4. Fair Value Gap (FVG) & Volume Inefficiency Guide",
    titleBn: "৪. ফেয়ার ভ্যালু গ্যাপ (FVG) ও ভলিউম ইনফিশিয়েন্সি গাইড",
    subtitleEn: "Consequent Encroachment & Inverse FVG Trading Models",
    subtitleBn: "কনসিকুয়েন্ট এনক্রোচমেন্ট ও ইনভার্স এফভিজি ট্রেডিং মডেল",
    category: "Price Action",
    pages: 16,
    keyConcepts: [
      "3-Candle Imbalance calculation formula.",
      "Consequent Encroachment (50% midpoint) entry technique.",
      "Inverse FVG (IFVG) as continuation confirmation.",
    ],
    fileUrl: null,
    fileName: "04_Fair_Value_Gap_FVG_Guide.pdf",
    fileSize: "1.9 MB",
    isPublished: true,
    position: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    titleEn: "5. Multi-Timeframe Top-Down Sniper Execution Blueprint",
    titleBn: "৫. মাল্টি-টাইমফ্রেম টপ-ডাউন স্নাইপার এক্সিকিউশন ব্লুপ্রিন্ট",
    subtitleEn: "Daily → 1H → 5m/1m Confirmation Sequences",
    subtitleBn: "ডেইলি থেকে ১-ঘণ্টা এবং ৫-মিনিট / ১-মিনিট এন্ট্রি কনফার্মেশন",
    category: "Execution",
    pages: 22,
    keyConcepts: [
      "Step 1: Daily Candle Narrative & Liquidity Draw.",
      "Step 2: 1H Point of Interest (POI) & Zone Refinement.",
      "Step 3: 1m MSS + FVG entry for 5-10 pip stop loss.",
    ],
    fileUrl: null,
    fileName: "05_Multi_Timeframe_Sniper_Execution.pdf",
    fileSize: "2.7 MB",
    isPublished: true,
    position: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// In-memory runtime fallback (strictly initialized with seed data where appropriate)
const inMemoryUsers: Map<string, any> = new Map();
const inMemoryOrders: any[] = [];
const inMemoryEntitlements: any[] = [];
const inMemoryJournal: any[] = [];
const inMemoryDiscipline: any[] = [];
const inMemoryProgress: any[] = [];
const inMemoryTickets: any[] = [];
const inMemoryReplies: any[] = [];
const inMemoryAuditEvents: any[] = [];
const inMemoryFreeEbooks: any[] = [...DEFAULT_FREE_EBOOKS];

export const DEFAULT_DISCIPLINE_TASKS = [
  { title: "Wake up at 6:00 AM & Hydrate", time: "06:00 AM", isMandatory: true, isTrackable: true, orderIndex: 1 },
  { title: "Morning Routine & Mindset Preparation", time: "06:30 AM", isMandatory: true, isTrackable: true, orderIndex: 2 },
  { title: "Physical Workout & Movement Routine", time: "07:30 AM", isMandatory: true, isTrackable: true, orderIndex: 3 },
  { title: "Check Forex Factory & High-Impact News Calendar", time: "08:30 AM", isMandatory: true, isTrackable: true, orderIndex: 4 },
  { title: "HTF Directional Bias & Liquidity Pool Markup", time: "09:00 AM", isMandatory: true, isTrackable: true, orderIndex: 5 },
  { title: "Execute Session Rules (CRT / SMC / Invalidation)", time: "01:00 PM", isMandatory: true, isTrackable: true, orderIndex: 6 },
  { title: "Log All Trades in Trade Journal", time: "05:00 PM", isMandatory: true, isTrackable: true, orderIndex: 7 },
  { title: "Evening Chart Review & Forex Analysis", time: "08:00 PM", isMandatory: false, isTrackable: true, orderIndex: 8 },
  { title: "Study Course Lessons & Playbook Notes", time: "09:30 PM", isMandatory: false, isTrackable: true, orderIndex: 9 },
  { title: "Night Reflection & Tomorrow Execution Plan", time: "10:30 PM", isMandatory: true, isTrackable: true, orderIndex: 10 },
];

export const DEFAULT_DISCIPLINE_EXERCISES = [
  { name: "Push-ups (3 Sets to Failure)", difficulty: "Intermediate", orderIndex: 1 },
  { name: "Bodyweight Squats (4 Sets x 20 Reps)", difficulty: "Beginner", orderIndex: 2 },
  { name: "Pull-ups / Inverted Rows (3 Sets)", difficulty: "Advanced", orderIndex: 3 },
  { name: "Core Plank Hold (3 x 60 Seconds)", difficulty: "Intermediate", orderIndex: 4 },
  { name: "Dumbbell Shoulder Press / Pike Push-ups", difficulty: "Intermediate", orderIndex: 5 },
  { name: "Cardio & Stretching Routine (15 Mins)", difficulty: "Beginner", orderIndex: 6 },
];

const inMemoryDisciplineTasks: any[] = [];
const inMemoryDisciplineCompletions: any[] = [];
const inMemoryDisciplineExercises: any[] = [];
const inMemoryDisciplineWorkoutCompletions: any[] = [];
const inMemoryDisciplineJournals: any[] = [];
const inMemoryDisciplineForexLogs: any[] = [];
const inMemoryDisciplineSettings: Map<number, any> = new Map();
const inMemoryTraderTrades: any[] = [];

let disciplineTaskAutoId = 1;
let disciplineCompletionAutoId = 1;
let disciplineExerciseAutoId = 1;
let disciplineWorkoutAutoId = 1;
let disciplineJournalAutoId = 1;
let disciplineForexAutoId = 1;
let disciplineSettingsAutoId = 1;

let userAutoId = 1;
let journalAutoId = 1;
let ticketAutoId = 1001;
let replyAutoId = 1;
let orderAutoId = 1;
let entitlementAutoId = 1;
let auditAutoId = 1;
let ebookAutoId = 6;



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
        avatar: user.avatar,
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
    avatar: data.avatar || null,
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
    { id: 4, slug: "pro-blueprint", titleEn: "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT", titleBn: "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT", originalPrice: "5550", price: "3999", currency: "BDT", includesPdfPackage: true, includesEbook: true, includesCourse: true },
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

export interface TicketFilter {
  userId?: number;
  userEmail?: string;
  status?: string;
  category?: string;
  search?: string;
}

export async function listTickets(filterOrUserId?: number | TicketFilter) {
  const filter: TicketFilter =
    typeof filterOrUserId === "number" ? { userId: filterOrUserId } : filterOrUserId || {};

  const db = await getDb();
  if (db) {
    try {
      let query = db.select().from(supportTickets);
      const conditions: any[] = [];
      if (filter.userId !== undefined && filter.userId !== null) {
        conditions.push(eq(supportTickets.userId, filter.userId));
      }
      if (filter.userEmail) {
        conditions.push(eq(supportTickets.userEmail, filter.userEmail));
      }
      if (filter.status && filter.status !== "all") {
        conditions.push(eq(supportTickets.status, filter.status as any));
      }
      if (filter.category && filter.category !== "all") {
        conditions.push(eq(supportTickets.category, filter.category));
      }
      const records =
        conditions.length > 0
          ? await query.where(and(...conditions)).orderBy(desc(supportTickets.createdAt))
          : await query.orderBy(desc(supportTickets.createdAt));

      if (filter.search) {
        const q = filter.search.toLowerCase();
        return records.filter(
          (t: any) =>
            t.ticketCode?.toLowerCase().includes(q) ||
            t.subject?.toLowerCase().includes(q) ||
            t.userName?.toLowerCase().includes(q) ||
            t.userEmail?.toLowerCase().includes(q) ||
            t.message?.toLowerCase().includes(q)
        );
      }
      return records;
    } catch (err) {
      console.warn("[listTickets error]:", err);
    }
  }

  // In-memory fallback
  let results = [...inMemoryTickets];
  if (filter.userId !== undefined && filter.userId !== null) {
    results = results.filter((t) => t.userId === filter.userId);
  }
  if (filter.userEmail) {
    results = results.filter((t) => t.userEmail?.toLowerCase() === filter.userEmail?.toLowerCase());
  }
  if (filter.status && filter.status !== "all") {
    results = results.filter((t) => t.status === filter.status);
  }
  if (filter.category && filter.category !== "all") {
    results = results.filter((t) => t.category === filter.category);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.ticketCode?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q)
    );
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createSupportTicket(input: {
  userId?: number | null;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  message: string;
  attachmentUrl?: string | null;
}) {
  const code = `#TKT-${ticketAutoId++}`;
  const now = new Date();
  const db = await getDb();

  const ticketObj = {
    ticketCode: code,
    userId: input.userId || null,
    userName: input.userName,
    userEmail: input.userEmail,
    category: input.category,
    subject: input.subject,
    message: input.message,
    attachmentUrl: input.attachmentUrl || null,
    status: "open" as const,
    assignedStaff: null,
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    try {
      const res = await db.insert(supportTickets).values(ticketObj);
      const insertId = res[0]?.insertId || res[0]?.id;
      return { id: insertId || ticketAutoId - 1, ...ticketObj };
    } catch (err) {
      console.warn("[createSupportTicket fallback to memory]:", err);
    }
  }

  const inMemItem = { id: ticketAutoId - 1, ...ticketObj };
  inMemoryTickets.unshift(inMemItem);
  return inMemItem;
}

export async function getTicketById(ticketId: number) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
      if (rows[0]) return rows[0];
    } catch (err) {
      console.warn("[getTicketById error]:", err);
    }
  }
  return inMemoryTickets.find((t) => t.id === ticketId) || null;
}

export async function getTicketByCode(ticketCode: string) {
  const cleanCode = ticketCode.trim().toUpperCase();
  const formattedCode = cleanCode.startsWith("#") ? cleanCode : `#${cleanCode}`;

  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(supportTickets)
        .where(
          or(
            eq(supportTickets.ticketCode, formattedCode),
            eq(supportTickets.ticketCode, cleanCode)
          )
        )
        .limit(1);
      if (rows[0]) return rows[0];
    } catch (err) {
      console.warn("[getTicketByCode error]:", err);
    }
  }
  return (
    inMemoryTickets.find(
      (t) =>
        t.ticketCode?.toUpperCase() === formattedCode ||
        t.ticketCode?.toUpperCase() === cleanCode
    ) || null
  );
}

export async function getTicketReplies(ticketId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(ticketReplies)
        .where(eq(ticketReplies.ticketId, ticketId))
        .orderBy(asc(ticketReplies.createdAt));
    } catch (err) {
      console.warn("[getTicketReplies error]:", err);
    }
  }
  return inMemoryReplies
    .filter((r) => r.ticketId === ticketId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function addTicketReply(reply: {
  ticketId: number;
  senderRole: "user" | "support" | "admin";
  senderName: string;
  senderEmail?: string | null;
  message: string;
  attachmentUrl?: string | null;
}) {
  const now = new Date();
  const db = await getDb();
  const replyObj = {
    ticketId: reply.ticketId,
    senderRole: reply.senderRole,
    senderName: reply.senderName,
    senderEmail: reply.senderEmail || null,
    message: reply.message,
    attachmentUrl: reply.attachmentUrl || null,
    createdAt: now,
  };

  if (db) {
    try {
      const res = await db.insert(ticketReplies).values(replyObj);
      await db.update(supportTickets).set({ updatedAt: now }).where(eq(supportTickets.id, reply.ticketId));
      const insertId = res[0]?.insertId || res[0]?.id;
      return { id: insertId || replyAutoId++, ...replyObj };
    } catch (err) {
      console.warn("[addTicketReply error]:", err);
    }
  }

  const createdReply = { id: replyAutoId++, ...replyObj };
  inMemoryReplies.push(createdReply);
  const t = inMemoryTickets.find((item) => item.id === reply.ticketId);
  if (t) t.updatedAt = now;
  return createdReply;
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

export async function updateTicketStatus(
  ticketId: number,
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed" | string,
  assignedStaff?: string
) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      const updateData: any = { status, updatedAt: now };
      if (assignedStaff !== undefined) updateData.assignedStaff = assignedStaff;
      await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, ticketId));
    } catch (err) {
      console.warn("[updateTicketStatus error]:", err);
    }
  }
  const t = inMemoryTickets.find((item) => item.id === ticketId);
  if (t) {
    t.status = status;
    t.updatedAt = now;
    if (assignedStaff !== undefined) t.assignedStaff = assignedStaff;
  }
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

export async function listFreeEbooks(includeUnpublished = false) {
  const db = await getDb();
  if (db) {
    try {
      const query = includeUnpublished
        ? db.select().from(freeEbooks).orderBy(asc(freeEbooks.position))
        : db.select().from(freeEbooks).where(eq(freeEbooks.isPublished, true)).orderBy(asc(freeEbooks.position));
      const rows = await query;
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("[listFreeEbooks error, using fallback]:", err);
    }
  }
  return includeUnpublished
    ? [...inMemoryFreeEbooks]
    : inMemoryFreeEbooks.filter((b) => b.isPublished);
}

export async function getFreeEbookById(id: number) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(freeEbooks).where(eq(freeEbooks.id, id)).limit(1);
      if (rows && rows[0]) return rows[0];
    } catch (err) {
      console.warn("[getFreeEbookById error]:", err);
    }
  }
  return inMemoryFreeEbooks.find((b) => b.id === id) || null;
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
}) {
  const newId = ebookAutoId++;
  const record: any = {
    id: newId,
    titleEn: data.titleEn,
    titleBn: data.titleBn || data.titleEn,
    subtitleEn: data.subtitleEn,
    subtitleBn: data.subtitleBn || data.subtitleEn,
    category: data.category || "Institutional",
    pages: data.pages || 10,
    keyConcepts: data.keyConcepts || [],
    fileUrl: data.fileUrl || null,
    fileName: data.fileName || `${data.titleEn.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    fileSize: data.fileSize || "2.5 MB",
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
    position: inMemoryFreeEbooks.length + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = await getDb();
  if (db) {
    try {
      await db.insert(freeEbooks).values({
        ...record,
      });
      return record;
    } catch (err) {
      console.warn("[createFreeEbook db error, stored in memory]:", err);
    }
  }

  inMemoryFreeEbooks.push(record);
  return record;
}

export async function updateFreeEbook(id: number, data: Partial<any>) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(freeEbooks)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(freeEbooks.id, id));
    } catch (err) {
      console.warn("[updateFreeEbook db error]:", err);
    }
  }

  const item = inMemoryFreeEbooks.find((b) => b.id === id);
  if (item) {
    Object.assign(item, data, { updatedAt: new Date() });
    return item;
  }
  return null;
}

export async function deleteFreeEbook(id: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(freeEbooks).where(eq(freeEbooks.id, id));
    } catch (err) {
      console.warn("[deleteFreeEbook db error]:", err);
    }
  }

  const idx = inMemoryFreeEbooks.findIndex((b) => b.id === id);
  if (idx !== -1) {
    inMemoryFreeEbooks.splice(idx, 1);
    return true;
  }
  return true;
}

// ==============================================================================
// COMPLETE DAILY DISCIPLINE SYSTEM — BACKEND HELPER FUNCTIONS
// ==============================================================================

export async function ensureDisciplineDefaults(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      // Ensure default system settings configuration if missing
      const existingSettings = await db.select().from(disciplineSettings).where(eq(disciplineSettings.userId, userId));
      if (existingSettings.length === 0) {
        await db.insert(disciplineSettings).values({
          userId,
          dailyTargetPercent: 80,
          dailyForexMinutesTarget: 60,
          restTimerDefaultSeconds: 60,
          restTimerSound: true,
        });
      }
      return;
    } catch (err) {
      console.warn("[ensureDisciplineDefaults db error]:", err);
    }
  }

  // In-memory fallback: only ensure settings
  if (!inMemoryDisciplineSettings.has(userId)) {
    inMemoryDisciplineSettings.set(userId, {
      id: disciplineSettingsAutoId++,
      userId,
      dailyTargetPercent: 80,
      dailyForexMinutesTarget: 60,
      restTimerDefaultSeconds: 60,
      restTimerSound: true,
      updatedAt: new Date(),
    });
  }
}

// ------------------------------------------------------------------------------
// SCHEDULE & TASKS
// ------------------------------------------------------------------------------

export async function getDisciplineSchedule(userId: number, date: string) {
  await ensureDisciplineDefaults(userId);
  const db = await getDb();

  if (db) {
    try {
      const tasks = await db
        .select()
        .from(disciplineTasks)
        .where(and(eq(disciplineTasks.userId, userId), eq(disciplineTasks.isActive, true)))
        .orderBy(asc(disciplineTasks.orderIndex), asc(disciplineTasks.id));

      const completions = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(and(eq(disciplineTaskCompletions.userId, userId), eq(disciplineTaskCompletions.date, date)));

      const mergedTasks = tasks.map((t: any) => {
        const startTime = t.startTime !== undefined && t.startTime !== null ? t.startTime : (t.time ? t.time : null);
        const endTime = t.endTime !== undefined && t.endTime !== null ? t.endTime : null;
        return {
          ...t,
          startTime,
          endTime,
          completed: completions.some((c: any) => c.taskId === t.id && c.completed),
        };
      });

      return { tasks: mergedTasks, date };
    } catch (err) {
      console.warn("[getDisciplineSchedule db error]:", err);
    }
  }

  // In-memory fallback
  const tasks = inMemoryDisciplineTasks
    .filter((t) => t.userId === userId && t.isActive !== false)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const completions = inMemoryDisciplineCompletions.filter(
    (c) => c.userId === userId && c.date === date
  );

  const mergedTasks = tasks.map((t) => {
    const startTime = t.startTime !== undefined && t.startTime !== null ? t.startTime : (t.time ? t.time : null);
    const endTime = t.endTime !== undefined && t.endTime !== null ? t.endTime : null;
    return {
      ...t,
      startTime,
      endTime,
      completed: completions.some((c) => c.taskId === t.id && c.completed),
    };
  });

  return { tasks: mergedTasks, date };
}

export async function addDisciplineTask(
  userId: number,
  task: {
    title: string;
    startTime?: string | null;
    endTime?: string | null;
    time?: string | null;
    isMandatory: boolean;
    isTrackable: boolean;
  }
) {
  const startTime = task.startTime?.trim() || null;
  const endTime = task.endTime?.trim() || null;
  const legacyTime = startTime || task.time?.trim() || null;

  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineTasks)
        .where(and(eq(disciplineTasks.userId, userId), eq(disciplineTasks.isActive, true)));
      const nextOrder = existing.length + 1;

      const res = await db.insert(disciplineTasks).values({
        userId,
        title: task.title.trim(),
        startTime,
        endTime,
        time: legacyTime,
        isMandatory: task.isMandatory ?? true,
        isTrackable: task.isTrackable ?? true,
        orderIndex: nextOrder,
        isActive: true,
      });
      const insertId = res[0]?.insertId || res[0]?.id;
      return {
        id: insertId || disciplineTaskAutoId++,
        userId,
        title: task.title.trim(),
        startTime,
        endTime,
        time: legacyTime,
        isMandatory: task.isMandatory ?? true,
        isTrackable: task.isTrackable ?? true,
        orderIndex: nextOrder,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (err) {
      console.warn("[addDisciplineTask db error]:", err);
    }
  }

  const existing = inMemoryDisciplineTasks.filter((t) => t.userId === userId && t.isActive !== false);
  const nextOrder = existing.length + 1;
  const created = {
    id: disciplineTaskAutoId++,
    userId,
    title: task.title.trim(),
    startTime,
    endTime,
    time: legacyTime,
    isMandatory: task.isMandatory ?? true,
    isTrackable: task.isTrackable ?? true,
    orderIndex: nextOrder,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryDisciplineTasks.push(created);
  return created;
}

export async function updateDisciplineTask(
  userId: number,
  taskId: number,
  updates: Partial<{
    title: string;
    startTime: string | null;
    endTime: string | null;
    time: string | null;
    isMandatory: boolean;
    isTrackable: boolean;
    orderIndex: number;
  }>
) {
  const cleanUpdates: any = { ...updates };
  if (cleanUpdates.startTime !== undefined) {
    cleanUpdates.startTime = cleanUpdates.startTime?.trim() || null;
    cleanUpdates.time = cleanUpdates.startTime;
  }
  if (cleanUpdates.endTime !== undefined) {
    cleanUpdates.endTime = cleanUpdates.endTime?.trim() || null;
  }

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineTasks)
        .set({
          ...cleanUpdates,
          updatedAt: new Date(),
        })
        .where(and(eq(disciplineTasks.id, taskId), eq(disciplineTasks.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[updateDisciplineTask db error]:", err);
    }
  }

  const task = inMemoryDisciplineTasks.find((t) => t.id === taskId && t.userId === userId);
  if (task) {
    Object.assign(task, cleanUpdates, { updatedAt: new Date() });
    return true;
  }
  return false;
}

export async function deleteDisciplineTask(userId: number, taskId: number) {
  const db = await getDb();
  if (db) {
    try {
      // Soft-delete task and delete completions
      await db
        .update(disciplineTasks)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(disciplineTasks.id, taskId), eq(disciplineTasks.userId, userId)));
      await db
        .delete(disciplineTaskCompletions)
        .where(and(eq(disciplineTaskCompletions.taskId, taskId), eq(disciplineTaskCompletions.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[deleteDisciplineTask db error]:", err);
    }
  }

  const task = inMemoryDisciplineTasks.find((t) => t.id === taskId && t.userId === userId);
  if (task) {
    task.isActive = false;
  }
  return true;
}

export async function toggleDisciplineTaskCompletion(
  userId: number,
  taskId: number,
  date: string,
  completed: boolean
) {
  const db = await getDb();
  if (db) {
    try {
      // Verify task belongs to user
      const task = await db
        .select()
        .from(disciplineTasks)
        .where(and(eq(disciplineTasks.id, taskId), eq(disciplineTasks.userId, userId)))
        .limit(1);

      if (!task.length) throw new Error("Task not found or unauthorized");

      const existing = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(
          and(
            eq(disciplineTaskCompletions.userId, userId),
            eq(disciplineTaskCompletions.taskId, taskId),
            eq(disciplineTaskCompletions.date, date)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(disciplineTaskCompletions)
          .set({
            completed,
            completedAt: completed ? new Date() : null,
          })
          .where(eq(disciplineTaskCompletions.id, existing[0].id));
      } else {
        await db.insert(disciplineTaskCompletions).values({
          userId,
          taskId,
          date,
          completed,
          completedAt: completed ? new Date() : null,
        });
      }
      return true;
    } catch (err) {
      console.warn("[toggleDisciplineTaskCompletion db error]:", err);
    }
  }

  const existing = inMemoryDisciplineCompletions.find(
    (c) => c.userId === userId && c.taskId === taskId && c.date === date
  );
  if (existing) {
    existing.completed = completed;
    existing.completedAt = completed ? new Date() : null;
  } else {
    inMemoryDisciplineCompletions.push({
      id: disciplineCompletionAutoId++,
      userId,
      taskId,
      date,
      completed,
      completedAt: completed ? new Date() : null,
    });
  }
  return true;
}

// ------------------------------------------------------------------------------
// WORKOUT
// ------------------------------------------------------------------------------

export async function getDisciplineWorkouts(userId: number, date: string) {
  await ensureDisciplineDefaults(userId);
  const db = await getDb();

  if (db) {
    try {
      const exercises = await db
        .select()
        .from(disciplineExercises)
        .where(and(eq(disciplineExercises.userId, userId), eq(disciplineExercises.isActive, true)))
        .orderBy(asc(disciplineExercises.orderIndex), asc(disciplineExercises.id));

      const completions = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(and(eq(disciplineWorkoutCompletions.userId, userId), eq(disciplineWorkoutCompletions.date, date)));

      const merged = exercises.map((e: any) => ({
        ...e,
        completed: completions.some((c: any) => c.exerciseId === e.id && c.completed),
      }));

      const completedCount = merged.filter((e: any) => e.completed).length;
      const progressPercent = merged.length ? Math.round((completedCount / merged.length) * 100) : 0;

      return { exercises: merged, progressPercent, date };
    } catch (err) {
      console.warn("[getDisciplineWorkouts db error]:", err);
    }
  }

  const exercises = inMemoryDisciplineExercises
    .filter((e) => e.userId === userId && e.isActive !== false)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const completions = inMemoryDisciplineWorkoutCompletions.filter(
    (c) => c.userId === userId && c.date === date
  );

  const merged = exercises.map((e) => ({
    ...e,
    completed: completions.some((c) => c.exerciseId === e.id && c.completed),
  }));

  const completedCount = merged.filter((e) => e.completed).length;
  const progressPercent = merged.length ? Math.round((completedCount / merged.length) * 100) : 0;

  return { exercises: merged, progressPercent, date };
}

export async function addDisciplineExercise(
  userId: number,
  exercise: { name: string; difficulty: string }
) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineExercises)
        .where(and(eq(disciplineExercises.userId, userId), eq(disciplineExercises.isActive, true)));
      const nextOrder = existing.length + 1;

      const res = await db.insert(disciplineExercises).values({
        userId,
        name: exercise.name.trim(),
        difficulty: exercise.difficulty || "Intermediate",
        orderIndex: nextOrder,
        isActive: true,
      });
      const insertId = res[0]?.insertId || res[0]?.id;
      return {
        id: insertId || disciplineExerciseAutoId++,
        userId,
        ...exercise,
        orderIndex: nextOrder,
        isActive: true,
        createdAt: new Date(),
      };
    } catch (err) {
      console.warn("[addDisciplineExercise db error]:", err);
    }
  }

  const existing = inMemoryDisciplineExercises.filter((e) => e.userId === userId && e.isActive !== false);
  const nextOrder = existing.length + 1;
  const created = {
    id: disciplineExerciseAutoId++,
    userId,
    name: exercise.name.trim(),
    difficulty: exercise.difficulty || "Intermediate",
    orderIndex: nextOrder,
    isActive: true,
    createdAt: new Date(),
  };
  inMemoryDisciplineExercises.push(created);
  return created;
}

export async function updateDisciplineExercise(
  userId: number,
  exerciseId: number,
  updates: Partial<{ name: string; difficulty: string }>
) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineExercises)
        .set(updates)
        .where(and(eq(disciplineExercises.id, exerciseId), eq(disciplineExercises.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[updateDisciplineExercise db error]:", err);
    }
  }

  const ex = inMemoryDisciplineExercises.find((e) => e.id === exerciseId && e.userId === userId);
  if (ex) {
    Object.assign(ex, updates);
    return true;
  }
  return false;
}

export async function deleteDisciplineExercise(userId: number, exerciseId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineExercises)
        .set({ isActive: false })
        .where(and(eq(disciplineExercises.id, exerciseId), eq(disciplineExercises.userId, userId)));
      await db
        .delete(disciplineWorkoutCompletions)
        .where(and(eq(disciplineWorkoutCompletions.exerciseId, exerciseId), eq(disciplineWorkoutCompletions.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[deleteDisciplineExercise db error]:", err);
    }
  }

  const ex = inMemoryDisciplineExercises.find((e) => e.id === exerciseId && e.userId === userId);
  if (ex) {
    ex.isActive = false;
  }
  return true;
}

export async function toggleDisciplineWorkoutCompletion(
  userId: number,
  exerciseId: number,
  date: string,
  completed: boolean
) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(
          and(
            eq(disciplineWorkoutCompletions.userId, userId),
            eq(disciplineWorkoutCompletions.exerciseId, exerciseId),
            eq(disciplineWorkoutCompletions.date, date)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(disciplineWorkoutCompletions)
          .set({ completed })
          .where(eq(disciplineWorkoutCompletions.id, existing[0].id));
      } else {
        await db.insert(disciplineWorkoutCompletions).values({
          userId,
          exerciseId,
          date,
          completed,
        });
      }
      return true;
    } catch (err) {
      console.warn("[toggleDisciplineWorkoutCompletion db error]:", err);
    }
  }

  const existing = inMemoryDisciplineWorkoutCompletions.find(
    (c) => c.userId === userId && c.exerciseId === exerciseId && c.date === date
  );
  if (existing) {
    existing.completed = completed;
  } else {
    inMemoryDisciplineWorkoutCompletions.push({
      id: disciplineWorkoutAutoId++,
      userId,
      exerciseId,
      date,
      completed,
    });
  }
  return true;
}

// ------------------------------------------------------------------------------
// DISCIPLINE JOURNAL
// ------------------------------------------------------------------------------

export async function getDisciplineJournals(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(disciplineDailyJournals)
        .where(eq(disciplineDailyJournals.userId, userId))
        .orderBy(desc(disciplineDailyJournals.date));
    } catch (err) {
      console.warn("[getDisciplineJournals db error]:", err);
    }
  }

  return inMemoryDisciplineJournals
    .filter((j) => j.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getDisciplineJournalByDate(userId: number, date: string) {
  const db = await getDb();
  if (db) {
    try {
      const res = await db
        .select()
        .from(disciplineDailyJournals)
        .where(and(eq(disciplineDailyJournals.userId, userId), eq(disciplineDailyJournals.date, date)))
        .limit(1);
      return res[0] || null;
    } catch (err) {
      console.warn("[getDisciplineJournalByDate db error]:", err);
    }
  }

  const j = inMemoryDisciplineJournals.find((item) => item.userId === userId && item.date === date);
  return j || null;
}

export async function saveDisciplineJournal(userId: number, date: string, content: string) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineDailyJournals)
        .where(and(eq(disciplineDailyJournals.userId, userId), eq(disciplineDailyJournals.date, date)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(disciplineDailyJournals)
          .set({ content, updatedAt: new Date() })
          .where(eq(disciplineDailyJournals.id, existing[0].id));
        return { ...existing[0], content, updatedAt: new Date() };
      } else {
        const res = await db.insert(disciplineDailyJournals).values({
          userId,
          date,
          content,
        });
        const insertId = res[0]?.insertId || res[0]?.id;
        return {
          id: insertId || disciplineJournalAutoId++,
          userId,
          date,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (err) {
      console.warn("[saveDisciplineJournal db error]:", err);
    }
  }

  const existing = inMemoryDisciplineJournals.find((j) => j.userId === userId && j.date === date);
  if (existing) {
    existing.content = content;
    existing.updatedAt = new Date();
    return existing;
  }
  const created = {
    id: disciplineJournalAutoId++,
    userId,
    date,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryDisciplineJournals.push(created);
  return created;
}

export async function deleteDisciplineJournal(userId: number, id: number) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .delete(disciplineDailyJournals)
        .where(and(eq(disciplineDailyJournals.id, id), eq(disciplineDailyJournals.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[deleteDisciplineJournal db error]:", err);
    }
  }

  const idx = inMemoryDisciplineJournals.findIndex((j) => j.id === id && j.userId === userId);
  if (idx !== -1) {
    inMemoryDisciplineJournals.splice(idx, 1);
  }
  return true;
}

// ------------------------------------------------------------------------------
// FOREX ANALYSIS TRACKER
// ------------------------------------------------------------------------------

export async function getDisciplineForexLogs(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(disciplineForexLogs)
        .where(eq(disciplineForexLogs.userId, userId))
        .orderBy(desc(disciplineForexLogs.date));
    } catch (err) {
      console.warn("[getDisciplineForexLogs db error]:", err);
    }
  }

  return inMemoryDisciplineForexLogs
    .filter((f) => f.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveDisciplineForexLog(
  userId: number,
  date: string,
  minutes: number,
  pairs?: string,
  notes?: string
) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineForexLogs)
        .where(and(eq(disciplineForexLogs.userId, userId), eq(disciplineForexLogs.date, date)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(disciplineForexLogs)
          .set({
            minutes: Number(minutes) || 0,
            pairs: pairs || "",
            notes: notes || "",
            updatedAt: new Date(),
          })
          .where(eq(disciplineForexLogs.id, existing[0].id));
        return {
          ...existing[0],
          minutes: Number(minutes) || 0,
          pairs: pairs || "",
          notes: notes || "",
          updatedAt: new Date(),
        };
      } else {
        const res = await db.insert(disciplineForexLogs).values({
          userId,
          date,
          minutes: Number(minutes) || 0,
          pairs: pairs || "",
          notes: notes || "",
        });
        const insertId = res[0]?.insertId || res[0]?.id;
        return {
          id: insertId || disciplineForexAutoId++,
          userId,
          date,
          minutes: Number(minutes) || 0,
          pairs: pairs || "",
          notes: notes || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (err) {
      console.warn("[saveDisciplineForexLog db error]:", err);
    }
  }

  const existing = inMemoryDisciplineForexLogs.find((f) => f.userId === userId && f.date === date);
  if (existing) {
    existing.minutes = Number(minutes) || 0;
    existing.pairs = pairs || "";
    existing.notes = notes || "";
    existing.updatedAt = new Date();
    return existing;
  }

  const created = {
    id: disciplineForexAutoId++,
    userId,
    date,
    minutes: Number(minutes) || 0,
    pairs: pairs || "",
    notes: notes || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryDisciplineForexLogs.push(created);
  return created;
}

export async function deleteDisciplineForexLog(userId: number, id: number) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .delete(disciplineForexLogs)
        .where(and(eq(disciplineForexLogs.id, id), eq(disciplineForexLogs.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[deleteDisciplineForexLog db error]:", err);
    }
  }

  const idx = inMemoryDisciplineForexLogs.findIndex((f) => f.id === id && f.userId === userId);
  if (idx !== -1) {
    inMemoryDisciplineForexLogs.splice(idx, 1);
  }
  return true;
}

// ------------------------------------------------------------------------------
// SETTINGS
// ------------------------------------------------------------------------------

export async function getDisciplineSettings(userId: number) {
  await ensureDisciplineDefaults(userId);
  const db = await getDb();
  if (db) {
    try {
      const res = await db
        .select()
        .from(disciplineSettings)
        .where(eq(disciplineSettings.userId, userId))
        .limit(1);
      if (res.length) return res[0];
    } catch (err) {
      console.warn("[getDisciplineSettings db error]:", err);
    }
  }

  return (
    inMemoryDisciplineSettings.get(userId) || {
      userId,
      dailyTargetPercent: 80,
      dailyForexMinutesTarget: 60,
      restTimerDefaultSeconds: 60,
      restTimerSound: true,
    }
  );
}

export async function updateDisciplineSettings(
  userId: number,
  updates: Partial<{
    dailyTargetPercent: number;
    dailyForexMinutesTarget: number;
    restTimerDefaultSeconds: number;
    restTimerSound: boolean;
  }>
) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineSettings)
        .where(eq(disciplineSettings.userId, userId))
        .limit(1);

      if (existing.length) {
        await db
          .update(disciplineSettings)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(disciplineSettings.id, existing[0].id));
      } else {
        await db.insert(disciplineSettings).values({
          userId,
          dailyTargetPercent: updates.dailyTargetPercent ?? 80,
          dailyForexMinutesTarget: updates.dailyForexMinutesTarget ?? 60,
          restTimerDefaultSeconds: updates.restTimerDefaultSeconds ?? 60,
          restTimerSound: updates.restTimerSound ?? true,
        });
      }
      return true;
    } catch (err) {
      console.warn("[updateDisciplineSettings db error]:", err);
    }
  }

  const existing = inMemoryDisciplineSettings.get(userId) || { userId };
  inMemoryDisciplineSettings.set(userId, {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  });
  return true;
}

// ------------------------------------------------------------------------------
// STATS & AGGREGATE METRICS
// ------------------------------------------------------------------------------

export async function getDisciplineStats(userId: number) {
  await ensureDisciplineDefaults(userId);
  const db = await getDb();

  let tasks: any[] = [];
  let completions: any[] = [];
  let workoutCompletions: any[] = [];
  let forexLogs: any[] = [];
  let userSettings: any = null;

  if (db) {
    try {
      tasks = await db
        .select()
        .from(disciplineTasks)
        .where(and(eq(disciplineTasks.userId, userId), eq(disciplineTasks.isActive, true)));

      completions = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(eq(disciplineTaskCompletions.userId, userId));

      workoutCompletions = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(eq(disciplineWorkoutCompletions.userId, userId));

      forexLogs = await db
        .select()
        .from(disciplineForexLogs)
        .where(eq(disciplineForexLogs.userId, userId));

      const s = await db
        .select()
        .from(disciplineSettings)
        .where(eq(disciplineSettings.userId, userId))
        .limit(1);
      userSettings = s[0];
    } catch (err) {
      console.warn("[getDisciplineStats db error]:", err);
    }
  } else {
    tasks = inMemoryDisciplineTasks.filter((t) => t.userId === userId && t.isActive !== false);
    completions = inMemoryDisciplineCompletions.filter((c) => c.userId === userId);
    workoutCompletions = inMemoryDisciplineWorkoutCompletions.filter((w) => w.userId === userId);
    forexLogs = inMemoryDisciplineForexLogs.filter((f) => f.userId === userId);
    userSettings = inMemoryDisciplineSettings.get(userId);
  }

  const trackableTasks = tasks.filter((t) => t.isTrackable !== false);
  const trackableTaskCount = trackableTasks.length || 1;
  const trackableTaskIds = new Set(trackableTasks.map((t) => t.id));

  // Date helper
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const now = new Date();
  const todayStr = formatDate(now);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayDate);

  // Group completions by date
  const completionsByDate: Record<string, number> = {};
  completions.forEach((c) => {
    if (c.completed && trackableTaskIds.has(c.taskId)) {
      completionsByDate[c.date] = (completionsByDate[c.date] || 0) + 1;
    }
  });

  const getDayPercent = (dateStr: string) => {
    const done = completionsByDate[dateStr] || 0;
    return Math.min(100, Math.round((done / trackableTaskCount) * 100));
  };

  const todayPercent = getDayPercent(todayStr);
  const yesterdayPercent = getDayPercent(yesterdayStr);

  const completedTasksToday = completionsByDate[todayStr] || 0;
  const remainingTasksToday = Math.max(0, trackableTasks.length - completedTasksToday);

  // Last 7 Days
  const last7Days: any[] = [];
  let sum7 = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const percent = getDayPercent(dateStr);
    sum7 += percent;
    last7Days.push({
      date: dateStr,
      dayName,
      percent,
      completedCount: completionsByDate[dateStr] || 0,
      totalCount: trackableTasks.length,
    });
  }
  const weeklyPercent = Math.round(sum7 / 7);

  // Last 30 Days
  const last30Days: any[] = [];
  let sum30 = 0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const percent = getDayPercent(dateStr);
    sum30 += percent;
    last30Days.push({
      date: dateStr,
      percent,
    });
  }
  const monthlyPercent = Math.round(sum30 / 30);

  // Best & Worst Days from recorded history
  const activeDates = Object.keys(completionsByDate);
  let bestDay = { date: todayStr, percent: todayPercent };
  let worstDay = { date: todayStr, percent: todayPercent };

  if (activeDates.length > 0) {
    let maxPct = -1;
    let minPct = 101;
    activeDates.forEach((d) => {
      const p = getDayPercent(d);
      if (p > maxPct) {
        maxPct = p;
        bestDay = { date: d, percent: p };
      }
      if (p < minPct) {
        minPct = p;
        worstDay = { date: d, percent: p };
      }
    });
  }

  // Streaks calculation (days with >= 50% task completion)
  let currentStreak = 0;
  let checkDate = new Date(now);

  // If today hasn't hit threshold yet, check if yesterday had streak
  if (getDayPercent(todayStr) < 50) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const ds = formatDate(checkDate);
    if (getDayPercent(ds) >= 50) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Best streak calculation across all time
  let bestStreak = currentStreak;
  const sortedDates = Object.keys(completionsByDate).sort();
  let tempStreak = 0;
  let prevTimestamp = 0;

  sortedDates.forEach((dStr) => {
    if (getDayPercent(dStr) >= 50) {
      const tVal = new Date(dStr).getTime();
      if (prevTimestamp === 0 || tVal - prevTimestamp === 86400000) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      prevTimestamp = tVal;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }
  });

  // Workout consistency
  const workoutDates = new Set(workoutCompletions.filter((w) => w.completed).map((w) => w.date));
  let workoutsThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (workoutDates.has(formatDate(d))) workoutsThisWeek++;
  }

  let workoutsThisMonth = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (workoutDates.has(formatDate(d))) workoutsThisMonth++;
  }

  // Forex consistency
  const forexMinutesToday = forexLogs.find((f) => f.date === todayStr)?.minutes || 0;
  let forexMinutesThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const found = forexLogs.find((f) => f.date === formatDate(d));
    if (found) forexMinutesThisWeek += found.minutes || 0;
  }
  const avgForexPerDay = Math.round(forexMinutesThisWeek / 7);

  const totalCompletedTasksAllTime = completions.filter((c) => c.completed).length;

  return {
    todayPercent,
    yesterdayPercent,
    weeklyPercent,
    monthlyPercent,
    currentStreak,
    bestStreak,
    completedTasksToday,
    remainingTasksToday,
    totalCompletedTasksAllTime,
    bestDay,
    worstDay,
    last7Days,
    last30Days,
    workoutConsistency: {
      workoutsThisWeek,
      workoutsThisMonth,
      totalCompleted: workoutDates.size,
      consistencyPercent: Math.min(100, Math.round((workoutsThisWeek / 5) * 100)), // based on 5 days/wk target
    },
    forexConsistency: {
      minutesToday: forexMinutesToday,
      minutesThisWeek: forexMinutesThisWeek,
      averageMinutesPerDay: avgForexPerDay,
      targetMinutes: userSettings?.dailyForexMinutesTarget || 60,
      totalSessions: forexLogs.length,
    },
    hasData: activeDates.length > 0 || workoutDates.size > 0 || forexLogs.length > 0,
  };
}

// ------------------------------------------------------------------------------
// DATA MANAGEMENT: EXPORT, IMPORT, RESET
// ------------------------------------------------------------------------------

export async function exportDisciplineData(userId: number) {
  const db = await getDb();
  let tasks: any[] = [];
  let completions: any[] = [];
  let exercises: any[] = [];
  let workoutCompletions: any[] = [];
  let journals: any[] = [];
  let forexLogs: any[] = [];
  let userSettings: any = null;

  if (db) {
    try {
      tasks = await db.select().from(disciplineTasks).where(eq(disciplineTasks.userId, userId));
      completions = await db.select().from(disciplineTaskCompletions).where(eq(disciplineTaskCompletions.userId, userId));
      exercises = await db.select().from(disciplineExercises).where(eq(disciplineExercises.userId, userId));
      workoutCompletions = await db.select().from(disciplineWorkoutCompletions).where(eq(disciplineWorkoutCompletions.userId, userId));
      journals = await db.select().from(disciplineDailyJournals).where(eq(disciplineDailyJournals.userId, userId));
      forexLogs = await db.select().from(disciplineForexLogs).where(eq(disciplineForexLogs.userId, userId));
      const s = await db.select().from(disciplineSettings).where(eq(disciplineSettings.userId, userId)).limit(1);
      userSettings = s[0] || null;
    } catch (err) {
      console.warn("[exportDisciplineData db error]:", err);
    }
  } else {
    tasks = inMemoryDisciplineTasks.filter((t) => t.userId === userId);
    completions = inMemoryDisciplineCompletions.filter((c) => c.userId === userId);
    exercises = inMemoryDisciplineExercises.filter((e) => e.userId === userId);
    workoutCompletions = inMemoryDisciplineWorkoutCompletions.filter((w) => w.userId === userId);
    journals = inMemoryDisciplineJournals.filter((j) => j.userId === userId);
    forexLogs = inMemoryDisciplineForexLogs.filter((f) => f.userId === userId);
    userSettings = inMemoryDisciplineSettings.get(userId) || null;
  }

  return {
    version: "1.0",
    appName: "Cycle of Chart — Daily Discipline",
    exportedAt: new Date().toISOString(),
    tasks,
    completions,
    exercises,
    workoutCompletions,
    journals,
    forexLogs,
    settings: userSettings,
  };
}

export async function importDisciplineData(userId: number, backup: any) {
  if (!backup || typeof backup !== "object") {
    throw new Error("Invalid backup file: Not a valid JSON object");
  }

  const db = await getDb();

  // Validate tasks array
  const tasksToImport = Array.isArray(backup.tasks) ? backup.tasks : [];
  const completionsToImport = Array.isArray(backup.completions) ? backup.completions : [];
  const exercisesToImport = Array.isArray(backup.exercises) ? backup.exercises : [];
  const workoutsToImport = Array.isArray(backup.workoutCompletions) ? backup.workoutCompletions : [];
  const journalsToImport = Array.isArray(backup.journals) ? backup.journals : [];
  const forexLogsToImport = Array.isArray(backup.forexLogs) ? backup.forexLogs : [];

  if (db) {
    try {
      // 1. Tasks
      for (const t of tasksToImport) {
        if (t.title) {
          await db.insert(disciplineTasks).values({
            userId,
            title: String(t.title).trim(),
            time: t.time || "08:00 AM",
            isMandatory: t.isMandatory !== false,
            isTrackable: t.isTrackable !== false,
            orderIndex: Number(t.orderIndex) || 0,
            isActive: t.isActive !== false,
          });
        }
      }

      // 2. Exercises
      for (const e of exercisesToImport) {
        if (e.name) {
          await db.insert(disciplineExercises).values({
            userId,
            name: String(e.name).trim(),
            difficulty: e.difficulty || "Intermediate",
            orderIndex: Number(e.orderIndex) || 0,
            isActive: e.isActive !== false,
          });
        }
      }

      // 3. Journals
      for (const j of journalsToImport) {
        if (j.date && j.content) {
          await db.insert(disciplineDailyJournals).values({
            userId,
            date: String(j.date),
            content: String(j.content),
          });
        }
      }

      // 4. Forex Logs
      for (const f of forexLogsToImport) {
        if (f.date) {
          await db.insert(disciplineForexLogs).values({
            userId,
            date: String(f.date),
            minutes: Number(f.minutes) || 0,
            pairs: f.pairs ? String(f.pairs) : "",
            notes: f.notes ? String(f.notes) : "",
          });
        }
      }

      // 5. Settings
      if (backup.settings) {
        await updateDisciplineSettings(userId, backup.settings);
      }
      return { success: true, count: tasksToImport.length + exercisesToImport.length + journalsToImport.length };
    } catch (err) {
      console.warn("[importDisciplineData db error]:", err);
    }
  }

  // In-memory fallback
  tasksToImport.forEach((t: any) => {
    if (t.title) {
      inMemoryDisciplineTasks.push({
        id: disciplineTaskAutoId++,
        userId,
        title: String(t.title).trim(),
        time: t.time || "08:00 AM",
        isMandatory: t.isMandatory !== false,
        isTrackable: t.isTrackable !== false,
        orderIndex: Number(t.orderIndex) || 0,
        isActive: t.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  exercisesToImport.forEach((e: any) => {
    if (e.name) {
      inMemoryDisciplineExercises.push({
        id: disciplineExerciseAutoId++,
        userId,
        name: String(e.name).trim(),
        difficulty: e.difficulty || "Intermediate",
        orderIndex: Number(e.orderIndex) || 0,
        isActive: e.isActive !== false,
        createdAt: new Date(),
      });
    }
  });

  journalsToImport.forEach((j: any) => {
    if (j.date && j.content) {
      inMemoryDisciplineJournals.push({
        id: disciplineJournalAutoId++,
        userId,
        date: String(j.date),
        content: String(j.content),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  forexLogsToImport.forEach((f: any) => {
    if (f.date) {
      inMemoryDisciplineForexLogs.push({
        id: disciplineForexAutoId++,
        userId,
        date: String(f.date),
        minutes: Number(f.minutes) || 0,
        pairs: f.pairs ? String(f.pairs) : "",
        notes: f.notes ? String(f.notes) : "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  if (backup.settings) {
    inMemoryDisciplineSettings.set(userId, {
      userId,
      ...backup.settings,
      updatedAt: new Date(),
    });
  }

  return { success: true, count: tasksToImport.length + exercisesToImport.length + journalsToImport.length };
}

export async function resetDisciplineData(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(disciplineTaskCompletions).where(eq(disciplineTaskCompletions.userId, userId));
      await db.delete(disciplineTasks).where(eq(disciplineTasks.userId, userId));
      await db.delete(disciplineWorkoutCompletions).where(eq(disciplineWorkoutCompletions.userId, userId));
      await db.delete(disciplineExercises).where(eq(disciplineExercises.userId, userId));
      await db.delete(disciplineDailyJournals).where(eq(disciplineDailyJournals.userId, userId));
      await db.delete(disciplineForexLogs).where(eq(disciplineForexLogs.userId, userId));
      await db.delete(disciplineSettings).where(eq(disciplineSettings.userId, userId));

      // Re-seed clean defaults for user
      await ensureDisciplineDefaults(userId);
      return true;
    } catch (err) {
      console.warn("[resetDisciplineData db error]:", err);
    }
  }

  // In-memory cleanup
  for (let i = inMemoryDisciplineTasks.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineTasks[i].userId === userId) inMemoryDisciplineTasks.splice(i, 1);
  }
  for (let i = inMemoryDisciplineCompletions.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineCompletions[i].userId === userId) inMemoryDisciplineCompletions.splice(i, 1);
  }
  for (let i = inMemoryDisciplineExercises.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineExercises[i].userId === userId) inMemoryDisciplineExercises.splice(i, 1);
  }
  for (let i = inMemoryDisciplineWorkoutCompletions.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineWorkoutCompletions[i].userId === userId) inMemoryDisciplineWorkoutCompletions.splice(i, 1);
  }
  for (let i = inMemoryDisciplineJournals.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineJournals[i].userId === userId) inMemoryDisciplineJournals.splice(i, 1);
  }
  for (let i = inMemoryDisciplineForexLogs.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineForexLogs[i].userId === userId) inMemoryDisciplineForexLogs.splice(i, 1);
  }
  inMemoryDisciplineSettings.delete(userId);

  await ensureDisciplineDefaults(userId);
  return true;
}

// ------------------------------------------------------------------------------
// OWNER PROFILE & GENERAL SETTINGS CMS
// ------------------------------------------------------------------------------

export interface OwnerProfile {
  name: string;
  role: string;
  roleBn?: string;
  bioEn: string;
  bioBn?: string;
  photoUrl: string;
  detailsEn?: string;
  detailsBn?: string;
  experienceYears?: string;
  studentsCount?: string;
  tradingStyle?: string;
  signatureQuoteEn?: string;
  signatureQuoteBn?: string;
  telegram?: string;
  youtube?: string;
  facebook?: string;
  twitter?: string;
  email?: string;
  showExperienceCard?: boolean;
  experienceLabel?: string;
  experienceIcon?: string;
  showMentoredCard?: boolean;
  mentoredLabel?: string;
  mentoredIcon?: string;
  showMethodologyCard?: boolean;
  methodologyLabel?: string;
  methodologyIcon?: string;
  showDetailsParagraph?: boolean;
}

export const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  name: "MD NIJAM UDDIN",
  role: "Founder & Lead Institutional Trader",
  roleBn: "প্রতিষ্ঠাতা ও লিড ইন্সটিটিউশনাল ট্রেডার",
  bioEn: "Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution.",
  bioBn: "ইন্সটিটিউশনাল প্রাইস ডেলিভারি, মার্কেট স্ট্রাকচার, লিকুইডিটি ডায়নামিক্স এবং প্রাইস অ্যাকশন স্পেশালিস্ট। আবেগতাড়িত অনুমান দূর করে স্ট্রাকচার্ড আন্ডারস্ট্যান্ডিং, সিস্টেমেটিক অ্যানালাইসিস এবং সুশৃঙ্খল এক্সিকিউশন তৈরিতে প্রতিশ্রুতিবদ্ধ।",
  photoUrl: "/logo.jpg",
  detailsEn: "Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management.",
  detailsBn: "",
  experienceYears: "6+ Years",
  studentsCount: "1,500+",
  tradingStyle: "Institutional Order Flow, Liquidity & (SMC)",
  signatureQuoteEn: "Before you trade, understand trading. Before you deposit, understand trading.",
  signatureQuoteBn: "ট্রেড করার আগে ট্রেডিং বুঝুন। ডিপোজিট করার আগে ট্রেডিং বুঝুন।",
  telegram: "https://t.me/cycleofchart",
  youtube: "https://youtube.com/@cycleofchart",
  facebook: "https://facebook.com/cycleofchart",
  twitter: "",
  email: "contact@cycleofchart.com",
  showExperienceCard: false,
  experienceLabel: "Market Experience",
  experienceIcon: "clock",
  showMentoredCard: false,
  mentoredLabel: "Traders Mentored",
  mentoredIcon: "users",
  showMethodologyCard: true,
  methodologyLabel: "Core Methodology",
  methodologyIcon: "award",
  showDetailsParagraph: false,
};

const inMemorySettings: Map<string, string> = new Map();

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (rows.length) return rows[0].value;
    } catch (err) {
      console.warn("[getSetting error]:", err);
    }
  }
  return inMemorySettings.get(key) || null;
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (existing.length) {
        await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value });
      }
      inMemorySettings.set(key, value);
      return true;
    } catch (err) {
      console.warn("[setSetting error]:", err);
    }
  }
  inMemorySettings.set(key, value);
  return true;
}

export async function getOwnerProfile(): Promise<OwnerProfile> {
  try {
    const raw = await getSetting("owner_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.bioEn && parsed.bioEn.includes("Candle Range Theory (CRT)")) {
        parsed.bioEn = "Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution.";
      }
      if (parsed.bioBn && parsed.bioBn.includes("ক্যান্ডেল রেঞ্জ থিওরি (CRT)")) {
        parsed.bioBn = "ইন্সটিটিউশনাল প্রাইস ডেলিভারি, মার্কেট স্ট্রাকচার, লিকুইডিটি ডায়নামিক্স এবং প্রাইস অ্যাকশন স্পেশালিস্ট। আবেগতাড়িত অনুমান দূর করে স্ট্রাকচার্ড আন্ডারস্ট্যান্ডিং, সিস্টেমেটিক অ্যানালাইসিস এবং সুশৃঙ্খল এক্সিকিউশন তৈরিতে প্রতিশ্রুতিবদ্ধ।";
      }
      if (!parsed.tradingStyle || parsed.tradingStyle === "Institutional Order Flow & CRT") {
        parsed.tradingStyle = "Institutional Order Flow, Liquidity & (SMC)";
      }
      // Ensure boolean flags default cleanly to current live state if not explicitly saved yet
      if (parsed.showExperienceCard === undefined) parsed.showExperienceCard = false;
      if (parsed.showMentoredCard === undefined) parsed.showMentoredCard = false;
      if (parsed.showMethodologyCard === undefined) parsed.showMethodologyCard = true;
      if (parsed.showDetailsParagraph === undefined) parsed.showDetailsParagraph = false;
      if (!parsed.experienceYears) parsed.experienceYears = "6+ Years";
      if (!parsed.studentsCount) parsed.studentsCount = "1,500+";
      if (!parsed.experienceLabel) parsed.experienceLabel = "Market Experience";
      if (!parsed.mentoredLabel) parsed.mentoredLabel = "Traders Mentored";
      if (!parsed.methodologyLabel) parsed.methodologyLabel = "Core Methodology";
      if (!parsed.experienceIcon) parsed.experienceIcon = "clock";
      if (!parsed.mentoredIcon) parsed.mentoredIcon = "users";
      if (!parsed.methodologyIcon) parsed.methodologyIcon = "award";
      if (!parsed.detailsEn) {
        parsed.detailsEn = "Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management.";
      }
      return { ...DEFAULT_OWNER_PROFILE, ...parsed };
    }
  } catch (err) {
    console.warn("[getOwnerProfile error]:", err);
  }
  return DEFAULT_OWNER_PROFILE;
}

export async function updateOwnerProfile(data: Partial<OwnerProfile>): Promise<OwnerProfile> {
  const current = await getOwnerProfile();
  const updated: OwnerProfile = {
    ...current,
    ...data,
  };
  await setSetting("owner_profile", JSON.stringify(updated));
  return updated;
}

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
}

export async function syncUserTrades(userId: number, trades: any[]): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      for (const t of trades) {
        if (!t || !t.id) continue;
        const row = {
          id: String(t.id),
          userId,
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
          customProperties: t.customProperties || null,
          updatedAt: new Date(),
        };

        const existing = await db.select().from(traderTrades).where(eq(traderTrades.id, row.id)).limit(1);
        if (existing.length) {
          await db.update(traderTrades).set(row).where(eq(traderTrades.id, row.id));
        } else {
          await db.insert(traderTrades).values(row);
        }
      }
    } catch (err) {
      console.warn("[syncUserTrades db error]:", err);
    }
  }

  // Update in-memory fallback
  for (const t of trades) {
    if (!t || !t.id) continue;
    const item = {
      ...t,
      userId,
      entryPrice: Number(t.entryPrice) || 0,
      stopLoss: Number(t.stopLoss) || 0,
      takeProfit: Number(t.takeProfit) || 0,
      exitPrice: Number(t.exitPrice) || 0,
      pnl: Number(t.pnl) || 0,
      followedRules: t.followedRules === "No" ? "No" : "Yes",
      updatedAt: new Date(),
    };
    const idx = inMemoryTraderTrades.findIndex((i) => i.id === t.id);
    if (idx !== -1) {
      inMemoryTraderTrades[idx] = item;
    } else {
      inMemoryTraderTrades.push(item);
    }
  }
  return true;
}

export async function getUserTrades(userId: number): Promise<any[]> {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(traderTrades).where(eq(traderTrades.userId, userId)).orderBy(desc(traderTrades.createdAt));
    } catch (err) {
      console.warn("[getUserTrades db error]:", err);
    }
  }
  return inMemoryTraderTrades.filter((t) => t.userId === userId);
}

export async function getAllTraderTrades(): Promise<any[]> {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(traderTrades).orderBy(desc(traderTrades.createdAt));
    } catch (err) {
      console.warn("[getAllTraderTrades db error]:", err);
    }
  }
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

export async function getLeaderboardRankings(timeframe: "all" | "month" | "week" = "all"): Promise<LeaderboardTrader[]> {
  const allUsers = await listAllUsers();
  const allTrades = await getAllTraderTrades();
  const { startDate, endDate } = parseTimeframeBounds(timeframe);

  const db = await getDb();
  let allCompletions: any[] = [];
  if (db) {
    try {
      allCompletions = await db.select().from(disciplineTaskCompletions);
    } catch (err) {
      console.warn("[getLeaderboardRankings completions db error]:", err);
      allCompletions = inMemoryDisciplineCompletions;
    }
  } else {
    allCompletions = inMemoryDisciplineCompletions;
  }

  const results: LeaderboardTrader[] = [];

  for (const user of allUsers) {
    // Filter user trades by timeframe
    let userTrades = allTrades.filter((t) => t.userId === user.id);
    if (startDate && endDate) {
      userTrades = userTrades.filter((t) => t.date >= startDate && t.date <= endDate);
    }

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
    const profitFactor = totalLoss > 0
      ? Math.round((totalProfit / totalLoss) * 100) / 100
      : totalProfit > 0 ? 99.9 : 0;

    const ruleComplianceRate = totalTrades > 0
      ? Math.round((rulesFollowed / totalTrades) * 100)
      : 100;

    // Discipline stats
    let disciplineScore = 0;
    let currentStreak = 0;
    try {
      const stats = await getDisciplineStats(user.id);
      currentStreak = stats.currentStreak || 0;
      if (timeframe === "week") {
        disciplineScore = stats.weeklyPercent || 0;
      } else if (timeframe === "month") {
        disciplineScore = stats.monthlyPercent || 0;
      } else {
        disciplineScore = Math.round(((stats.weeklyPercent || 0) + (stats.monthlyPercent || 0)) / 2) || (stats.todayPercent || 0);
      }
    } catch {
      disciplineScore = 0;
      currentStreak = 0;
    }

    // Active days count
    const allActiveDates = new Set<string>();
    userTrades.forEach((t) => {
      if (t.date) allActiveDates.add(String(t.date));
    });
    userCompletions.forEach((c) => {
      if (c.date) allActiveDates.add(String(c.date));
    });
    const activeDays = allActiveDates.size;

    // Consistency score (0-100)
    const consistencyScore = Math.min(100, Math.round(activeDays * 8 + Math.min(currentStreak * 4, 30)));

    // Multidimensional deterministic scoring formula (0 - 100):
    // 1. Rule / Risk Adherence (25%)
    // 2. Discipline Execution (25%)
    // 3. Win Rate (20%)
    // 4. Consistency & Streak (15%)
    // 5. Profit Factor / P&L Quality (15%)
    const ruleWeight = (ruleComplianceRate * 0.25);
    const discWeight = (disciplineScore * 0.25);
    const winWeight = (winRate * 0.20);
    const consistWeight = (consistencyScore * 0.15);
    const normalizedPf = Math.min(100, Math.max(0, (profitFactor / 3) * 100));
    const pfWeight = (normalizedPf * 0.15);

    const hasActivity = totalTrades > 0 || userCompletions.length > 0 || disciplineScore > 0;
    const overallScore = hasActivity
      ? Math.round((ruleWeight + discWeight + winWeight + consistWeight + pfWeight) * 10) / 10
      : 0;

    results.push({
      rank: 0,
      userId: user.id,
      openId: user.openId,
      name: user.name || `Trader #${user.id}`,
      avatar: user.avatar || null,
      role: user.role || "user",
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
      bestPair,
    });
  }

  // Sort deterministically:
  // 1. Overall Score desc
  // 2. Rule Compliance desc
  // 3. Discipline Score desc
  // 4. Win Rate desc
  // 5. Total Trades desc
  // 6. Net PnL desc
  results.sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    if (b.ruleComplianceRate !== a.ruleComplianceRate) return b.ruleComplianceRate - a.ruleComplianceRate;
    if (b.disciplineScore !== a.disciplineScore) return b.disciplineScore - a.disciplineScore;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.totalTrades !== a.totalTrades) return b.totalTrades - a.totalTrades;
    return b.totalPnl - a.totalPnl;
  });

  // Assign ranks
  results.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return results;
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
  ticketReplies,
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



