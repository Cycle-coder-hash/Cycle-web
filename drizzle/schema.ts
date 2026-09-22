import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, double } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin", "support"]).default("user").notNull(),
  language: mysqlEnum("language", ["en", "bn"]).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const verificationTokens = mysqlTable("verificationTokens", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  otp: varchar("otp", { length: 16 }).notNull(),
  type: mysqlEnum("type", ["email_verify", "password_reset"]).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  isUsed: boolean("isUsed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const content = mysqlTable("content", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  section: varchar("section", { length: 80 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }).notNull(),
  bodyEn: text("bodyEn").notNull(),
  bodyBn: text("bodyBn").notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  kind: mysqlEnum("kind", ["pdf", "course", "template", "tool", "resource", "ebook", "tracker"]).notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  descriptionBn: text("descriptionBn").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("BDT").notNull(),
  fileKey: varchar("fileKey", { length: 500 }),
  isPublished: boolean("isPublished").default(true).notNull(),
  isFree: boolean("isFree").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  stage: int("stage").notNull(),
  position: int("position").notNull(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }).notNull(),
  bodyEn: text("bodyEn").notNull(),
  bodyBn: text("bodyBn").notNull(),
  isFree: boolean("isFree").default(false).notNull(),
});

export const bundles = mysqlTable("bundles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }).notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  descriptionBn: text("descriptionBn").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("BDT").notNull(),
  includesEbook: boolean("includesEbook").default(false).notNull(),
  includesPdfPackage: boolean("includesPdfPackage").default(false).notNull(),
  includesCourse: boolean("includesCourse").default(false).notNull(),
  includesTrackers: boolean("includesTrackers").default(false).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  bundleId: int("bundleId"),
  productId: int("productId"),
  selectedPdfIds: json("selectedPdfIds").$type<number[]>().notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("BDT").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["bkash", "nagad", "rocket", "free"]).notNull(),
  transactionId: varchar("transactionId", { length: 120 }).notNull(),
  screenshotKey: varchar("screenshotKey", { length: 500 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  orderStatus: mysqlEnum("orderStatus", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  noRefundAcknowledged: boolean("noRefundAcknowledged").notNull(),
  rejectionReason: text("rejectionReason"),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const entitlements = mysqlTable("entitlements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  bundleId: int("bundleId"),
  scope: varchar("scope", { length: 120 }).notNull(),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
});

export const progress = mysqlTable("progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  completed: boolean("completed").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
});

export const disciplineEntries = mysqlTable("disciplineEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
});

export const journalEntries = mysqlTable("journalEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  setup: varchar("setup", { length: 120 }),
  result: varchar("result", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketCode: varchar("ticketCode", { length: 32 }).notNull().unique(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }).notNull(),
  userEmail: varchar("userEmail", { length: 320 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  attachmentUrl: text("attachmentUrl"),
  status: mysqlEnum("status", ["open", "in_progress", "waiting_user", "resolved", "closed"]).default("open").notNull(),
  assignedStaff: varchar("assignedStaff", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const ticketReplies = mysqlTable("ticketReplies", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  senderRole: mysqlEnum("senderRole", ["user", "support", "admin"]).notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderEmail: varchar("senderEmail", { length: 320 }),
  message: text("message").notNull(),
  attachmentUrl: text("attachmentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditEvents = mysqlTable("auditEvents", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  entity: varchar("entity", { length: 120 }).notNull(),
  entityId: int("entityId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const courseTelegramPopupEvents = mysqlTable("courseTelegramPopupEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: int("orderId").notNull(),
  entitlementId: int("entitlementId"),
  status: mysqlEnum("status", ["pending", "dismissed", "joined"]).default("pending").notNull(),
  firstShownAt: timestamp("firstShownAt"),
  dismissedAt: timestamp("dismissedAt"),
  joinedClickedAt: timestamp("joinedClickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const freeEbooks = mysqlTable("freeEbooks", {
  id: int("id").autoincrement().primaryKey(),
  titleEn: varchar("titleEn", { length: 255 }).notNull(),
  titleBn: varchar("titleBn", { length: 255 }).notNull(),
  subtitleEn: varchar("subtitleEn", { length: 255 }).notNull(),
  subtitleBn: varchar("subtitleBn", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(),
  pages: int("pages").default(10).notNull(),
  keyConcepts: json("keyConcepts").$type<string[]>().notNull(),
  fileUrl: text("fileUrl"),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: varchar("fileSize", { length: 50 }),
  isPublished: boolean("isPublished").default(true).notNull(),
  position: int("position").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==============================================================================
// COMPLETE DAILY DISCIPLINE SYSTEM SCHEMAS
// ==============================================================================

export const disciplineTasks = mysqlTable("disciplineTasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  time: varchar("time", { length: 32 }),
  startTime: varchar("startTime", { length: 32 }),
  endTime: varchar("endTime", { length: 32 }),
  isMandatory: boolean("isMandatory").default(true).notNull(),
  isTrackable: boolean("isTrackable").default(true).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const disciplineTaskCompletions = mysqlTable("disciplineTaskCompletions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
});

export const disciplineExercises = mysqlTable("disciplineExercises", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  difficulty: varchar("difficulty", { length: 32 }).default("Intermediate").notNull(), // Beginner, Intermediate, Advanced
  orderIndex: int("orderIndex").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const disciplineWorkoutCompletions = mysqlTable("disciplineWorkoutCompletions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  completed: boolean("completed").default(false).notNull(),
});

export const disciplineDailyJournals = mysqlTable("disciplineDailyJournals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const disciplineForexLogs = mysqlTable("disciplineForexLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  minutes: int("minutes").default(0).notNull(),
  pairs: varchar("pairs", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const disciplineSettings = mysqlTable("disciplineSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  dailyTargetPercent: int("dailyTargetPercent").default(80).notNull(),
  dailyForexMinutesTarget: int("dailyForexMinutesTarget").default(60).notNull(),
  restTimerDefaultSeconds: int("restTimerDefaultSeconds").default(60).notNull(),
  restTimerSound: boolean("restTimerSound").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const traderTrades = mysqlTable("traderTrades", {
  id: varchar("id", { length: 120 }).primaryKey(),
  userId: int("userId").notNull(),
  journalBookId: varchar("journalBookId", { length: 120 }).notNull(),
  tradeNumber: int("tradeNumber").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  entryTime: varchar("entryTime", { length: 16 }),
  pair: varchar("pair", { length: 32 }).notNull(),
  timeframe: varchar("timeframe", { length: 16 }).default("15M").notNull(),
  direction: varchar("direction", { length: 8 }).notNull(), // Buy | Sell
  entryPrice: double("entryPrice").notNull(),
  stopLoss: double("stopLoss").notNull(),
  takeProfit: double("takeProfit").notNull(),
  exitPrice: double("exitPrice").notNull(),
  followedRules: varchar("followedRules", { length: 8 }).default("Yes").notNull(), // Yes | No
  pnl: double("pnl").notNull(),
  riskReward: varchar("riskReward", { length: 16 }).default("1:2").notNull(),
  pips: double("pips").default(0).notNull(),
  lotSize: double("lotSize").default(1.0).notNull(),
  tradeRun: varchar("tradeRun", { length: 16 }),
  note: text("note"),
  tradeRank: varchar("tradeRank", { length: 8 }).default("A").notNull(),
  learning: text("learning"),
  customProperties: json("customProperties"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Bundle = typeof bundles.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type DisciplineEntry = typeof disciplineEntries.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
export type TicketReply = typeof ticketReplies.$inferSelect;
export type InsertTicketReply = typeof ticketReplies.$inferInsert;
export type FreeEbook = typeof freeEbooks.$inferSelect;
export type InsertFreeEbook = typeof freeEbooks.$inferInsert;

export type DisciplineTask = typeof disciplineTasks.$inferSelect;
export type InsertDisciplineTask = typeof disciplineTasks.$inferInsert;
export type DisciplineTaskCompletion = typeof disciplineTaskCompletions.$inferSelect;
export type InsertDisciplineTaskCompletion = typeof disciplineTaskCompletions.$inferInsert;
export type DisciplineExercise = typeof disciplineExercises.$inferSelect;
export type InsertDisciplineExercise = typeof disciplineExercises.$inferInsert;
export type DisciplineWorkoutCompletion = typeof disciplineWorkoutCompletions.$inferSelect;
export type InsertDisciplineWorkoutCompletion = typeof disciplineWorkoutCompletions.$inferInsert;
export type DisciplineDailyJournal = typeof disciplineDailyJournals.$inferSelect;
export type InsertDisciplineDailyJournal = typeof disciplineDailyJournals.$inferInsert;
export type DisciplineForexLog = typeof disciplineForexLogs.$inferSelect;
export type InsertDisciplineForexLog = typeof disciplineForexLogs.$inferInsert;
export type DisciplineSetting = typeof disciplineSettings.$inferSelect;
export type InsertDisciplineSetting = typeof disciplineSettings.$inferInsert;
export type TraderTrade = typeof traderTrades.$inferSelect;
export type InsertTraderTrade = typeof traderTrades.$inferInsert;

export type CourseTelegramPopupEvent = typeof courseTelegramPopupEvents.$inferSelect;
export type InsertCourseTelegramPopupEvent = typeof courseTelegramPopupEvents.$inferInsert;
