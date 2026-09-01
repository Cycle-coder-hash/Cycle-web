import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
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
  paymentMethod: mysqlEnum("paymentMethod", ["bkash", "nagad", "rocket"]).notNull(),
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
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open").notNull(),
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Bundle = typeof bundles.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type DisciplineEntry = typeof disciplineEntries.$inferSelect;
