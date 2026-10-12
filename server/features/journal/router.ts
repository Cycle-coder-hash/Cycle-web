import { z } from "zod";
import { protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  listJournal,
  createJournalEntry,
  deleteJournal,
  getUserJournalBooks,
  saveUserJournalBooks,
  deleteUserJournalBook,
  syncUserTrades,
  deleteUserTrade,
  getUserTrades,
  getUserNotebook,
  saveUserNotebook,
} from "./repo";
import {
  canCreateTradeEntry,
  canCreateJournalBook,
  canSaveNotebookContent,
  getUserSubscription,
  UNCLAIMED_TRIAL_REASON,
} from "../subscription";

export const journalCustomerProcedures = {
  journal: protectedProcedure.query(({ ctx }) => listJournal(ctx.user.id)),
  getJournalBooks: protectedProcedure.query(async ({ ctx }) => {
    return await getUserJournalBooks(ctx.user.id, ctx.user.openId);
  }),
  saveJournalBooks: protectedProcedure
    .input(
      z.object({
        books: z.array(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (sub.plan === "unclaimed") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: UNCLAIMED_TRIAL_REASON,
        });
      }
      const existingBooks = await getUserJournalBooks(ctx.user.id, ctx.user.openId);
      if (input.books.length > existingBooks.length && input.books.length > 1) {
        const check = await canCreateJournalBook(ctx.user.id, existingBooks.length || 1);
        if (!check.allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: check.reason || "Journal book limit reached.",
          });
        }
      }
      return await saveUserJournalBooks(ctx.user.id, input.books, ctx.user.openId);
    }),
  deleteJournalBook: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await deleteUserJournalBook(ctx.user.id, input.bookId, ctx.user.openId);
    }),
  syncTrades: protectedProcedure
    .input(
      z.object({
        trades: z.array(z.any()),
        startingBalance: z.number().optional(),
        currency: z.string().optional(),
        bookName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sub = await getUserSubscription(ctx.user.id);
      if (sub.plan === "unclaimed") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: UNCLAIMED_TRIAL_REASON,
        });
      }
      const existingTrades = await getUserTrades(ctx.user.id, ctx.user.openId);
      if (input.trades.length > existingTrades.length) {
        const check = await canCreateTradeEntry(ctx.user.id);
        if (!check.allowed) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: check.reason || "Trade limit reached.",
          });
        }
      }
      return await syncUserTrades(
        ctx.user.id,
        input.trades,
        input.startingBalance,
        input.currency,
        input.bookName,
        ctx.user.openId
      );
    }),
  deleteTrade: protectedProcedure
    .input(
      z.object({
        tradeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await deleteUserTrade(ctx.user.id, input.tradeId, ctx.user.openId);
    }),
  userTrades: protectedProcedure.query(async ({ ctx }) => {
    return await getUserTrades(ctx.user.id, ctx.user.openId);
  }),
  getNotebookData: protectedProcedure.query(async ({ ctx }) => {
    return await getUserNotebook(ctx.user.id, ctx.user.openId);
  }),
  saveNotebookData: protectedProcedure
    .input(
      z.object({
        data: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const check = await canSaveNotebookContent(ctx.user.id);
      if (!check.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: check.reason || "Notebook access requires an active Free Trial or paid plan.",
        });
      }
      return await saveUserNotebook(ctx.user.id, input.data, ctx.user.openId);
    }),
  createJournal: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        setup: z.string().optional(),
        result: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const check = await canCreateTradeEntry(ctx.user.id);
      if (!check.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: check.reason || "Journal limit reached.",
        });
      }
      const res = await createJournalEntry(ctx.user.id, input);
      return { success: true, entry: res };
    }),
  deleteJournal: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteJournal(input.id, ctx.user.id);
      return { success: true };
    }),
};
