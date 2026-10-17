/**
 * server/db.ts — Database Facade (Thin Barrel File)
 *
 * NOTE: Individual feature database access has been migrated into Feature Repositories:
 *   - server/features/auth/repo.ts
 *   - server/features/account/repo.ts
 *   - server/features/commerce/repo.ts
 *   - server/features/community/repo.ts
 *   - server/features/discipline/repo.ts
 *   - server/features/journal/repo.ts
 *   - server/features/leaderboard/repo.ts
 *   - server/features/library/repo.ts
 *   - server/features/owner-profile/repo.ts
 *   - server/features/support/repo.ts
 *   - server/features/system/repo.ts
 *
 * Infra clients:
 *   - server/infra/db/client.ts
 *   - server/infra/db/settings.ts
 */

// Infrastructure & Core Database
export { getDb } from "./infra/db/client";
export { getSetting, setSetting, primeUserSettingsCache } from "./infra/db/settings";

// Feature Repositories
export * from "./features/auth";
export * from "./features/account";
export * from "./features/commerce";
export * from "./features/community";
export * from "./features/discipline";
export * from "./features/journal";
export * from "./features/leaderboard";
export * from "./features/library";
export * from "./features/owner-profile";
export * from "./features/support";
export * from "./features/system";

// Re-export Drizzle schema tables and types for backwards compatibility
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
  supportConversations,
  supportMessages,
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
  courseTelegramPopupEvents,
} from "../drizzle/schema";

export type {
  User,
  InsertUser,
  SupportConversation,
  InsertSupportConversation,
  SupportMessage,
  InsertSupportMessage,
  FreeEbook,
  InsertFreeEbook,
  DisciplineTask,
  DisciplineExercise,
  DisciplineDailyJournal,
  DisciplineForexLog,
  DisciplineSetting,
  TraderTrade,
  InsertTraderTrade,
  CourseTelegramPopupEvent,
  InsertCourseTelegramPopupEvent,
} from "../drizzle/schema";
