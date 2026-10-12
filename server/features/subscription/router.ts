import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getUserSubscription,
  getUserUsage,
  claimFreeTrialPlan,
  activateSubscription,
  setAccountStatus,
  canCreateJournalBook,
  canCreateTradeEntry,
  canSaveVideo,
  canCreateNotebookPage,
  canSaveNotebookContent,
  canAccessWorkout,
  canLogDiscipline,
  canAccessCommunity,
  canAccessMentorSupport,
  canAccessOwnerChat,
  recordNotebookPage,
  removeNotebookPage,
} from "./subscription";
import {
  listUsersForManagement,
  getUserDetailsForManagement,
  setUserAccess,
  clearUserAccessOverride,
  getUserAuditLogs,
} from "./userManagement";

export const subscriptionRouter = router({
  getMySubscription: protectedProcedure.query(async ({ ctx }) => {
    return await getUserSubscription(ctx.user.id);
  }),

  getMyUsage: protectedProcedure.query(async ({ ctx }) => {
    return await getUserUsage(ctx.user.id);
  }),

  claimFreePlan: protectedProcedure.mutation(async ({ ctx }) => {
    return await claimFreeTrialPlan(ctx.user.id);
  }),

  checkAccess: protectedProcedure
    .input(
      z.object({
        feature: z.enum([
          "journal_book",
          "trade_entry",
          "video_journal",
          "video_notebook",
          "notebook_page",
          "notebook_content",
          "workout",
          "discipline",
          "community",
          "mentor_support",
          "owner_chat",
        ]),
        meta: z.any().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      switch (input.feature) {
        case "journal_book": {
          const count = Number(input.meta?.currentBookCount) || 1;
          return await canCreateJournalBook(ctx.user.id, count);
        }
        case "trade_entry":
          return await canCreateTradeEntry(ctx.user.id);
        case "video_journal":
          return await canSaveVideo(ctx.user.id, "journal");
        case "video_notebook":
          return await canSaveVideo(ctx.user.id, "notebook");
        case "notebook_page":
          return await canCreateNotebookPage(ctx.user.id);
        case "notebook_content":
          return await canSaveNotebookContent(ctx.user.id);
        case "workout":
          return await canAccessWorkout(ctx.user.id);
        case "discipline":
          return await canLogDiscipline(ctx.user.id, input.meta?.date || new Date().toISOString().slice(0, 10));
        case "community":
          return await canAccessCommunity(ctx.user.id);
        case "mentor_support":
          return await canAccessMentorSupport(ctx.user.id);
        case "owner_chat":
          return await canAccessOwnerChat(ctx.user.id);
        default:
          return { allowed: true };
      }
    }),

  createNotebookPage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const check = await canCreateNotebookPage(ctx.user.id);
      if (!check.allowed) {
        throw new TRPCError({ code: "FORBIDDEN", message: check.reason });
      }
      await recordNotebookPage(ctx.user.id, input.pageId);
      return { success: true };
    }),

  deleteNotebookPage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await removeNotebookPage(ctx.user.id, input.pageId);
      return { success: true };
    }),
});

export const subscriptionAdminProcedures = {
  activateUserSubscription: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        plan: z.enum(["pro", "premium"]),
        durationDays: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updated = await activateSubscription(input.userId, input.plan, input.durationDays);
      return { success: true, subscription: updated };
    }),

  setUserAccountStatus: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        status: z.enum(["active", "suspended", "banned"]),
      })
    )
    .mutation(async ({ input }) => {
      await setAccountStatus(input.userId, input.status);
      return { success: true };
    }),

  userManagementList: adminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          accountStatus: z.string().optional(),
          courseAccess: z.string().optional(),
          proAccess: z.string().optional(),
          premiumAccess: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await listUsersForManagement(input);
    }),

  userManagementDetails: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await getUserDetailsForManagement(input.userId);
    }),

  userManagementUpdateAccess: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        accessType: z.enum(["course", "pro", "premium"]),
        status: z.enum(["on", "off"]),
        startDate: z.string().nullable().optional(),
        expiryDate: z.string().nullable().optional(),
        isLifetime: z.boolean().optional(),
        isOverrideBlocked: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await setUserAccess(ctx.user.id, ctx.user.name || "Admin", input);
    }),

  userManagementClearOverride: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        accessType: z.enum(["course", "pro", "premium"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await clearUserAccessOverride(
        ctx.user.id,
        ctx.user.name || "Admin",
        input.userId,
        input.accessType
      );
    }),

  userManagementSetAccountStatus: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        status: z.enum(["active", "suspended", "banned"]),
      })
    )
    .mutation(async ({ input }) => {
      await setAccountStatus(input.userId, input.status);
      return { success: true };
    }),

  userManagementAuditLogs: adminProcedure
    .input(z.object({ userId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await getUserAuditLogs(input?.userId);
    }),

  getUserSubscription: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const sub = await getUserSubscription(input.userId);
      const usage = await getUserUsage(input.userId);
      return { subscription: sub, usage };
    }),
};
