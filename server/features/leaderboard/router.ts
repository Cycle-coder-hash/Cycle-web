import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getLeaderboardRankings,
  getPublicTraderStats,
  getUserGlobalRank,
} from "./repo";

export const leaderboardRouter = router({
  rankings: publicProcedure
    .input(
      z
        .object({
          timeframe: z.enum(["all", "month", "week"]).default("all"),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const timeframe = input?.timeframe || "all";
      return await getLeaderboardRankings(timeframe);
    }),

  traderProfile: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        timeframe: z.enum(["all", "month", "week"]).default("all"),
      })
    )
    .query(async ({ input }) => {
      const stats = await getPublicTraderStats(input.userId, input.timeframe);
      if (!stats) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Trader profile not found",
        });
      }
      return stats;
    }),

  myRank: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx.user as any)?.id;
    if (!userId) {
      return { rank: null, overallScore: null, isRanked: false };
    }
    return await getUserGlobalRank(userId);
  }),
});
