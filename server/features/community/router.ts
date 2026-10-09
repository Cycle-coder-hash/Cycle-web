import { z } from "zod";
import { protectedProcedure, adminProcedure } from "../../_core/trpc";
import {
  getCourseTelegramPopupConfig,
  setCourseTelegramPopupConfig,
  getPendingCourseTelegramPopupForUser,
  recordCourseTelegramAction,
} from "./repo";

export const communityCustomerProcedures = {
  courseTelegramPopup: protectedProcedure.query(async ({ ctx }) => {
    return await getPendingCourseTelegramPopupForUser({
      id: ctx.user.id,
      openId: ctx.user.openId,
      email: ctx.user.email || undefined,
    });
  }),
  recordCourseTelegramAction: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        action: z.enum(["joined", "dismissed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await recordCourseTelegramAction(
        {
          id: ctx.user.id,
          openId: ctx.user.openId,
          email: ctx.user.email || undefined,
        },
        input.eventId,
        input.action
      );
    }),
};

export const communityAdminProcedures = {
  courseTelegramConfig: adminProcedure.query(async () => {
    return await getCourseTelegramPopupConfig();
  }),

  updateCourseTelegramConfig: adminProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        telegramUrl: z.string().optional(),
        titleEn: z.string().optional(),
        titleBn: z.string().optional(),
        messageEn: z.string().optional(),
        messageBn: z.string().optional(),
        joinButtonTextEn: z.string().optional(),
        joinButtonTextBn: z.string().optional(),
        dismissButtonTextEn: z.string().optional(),
        dismissButtonTextBn: z.string().optional(),
        displayMode: z.enum(["once", "until_joined"]).optional(),
        popupDelay: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await setCourseTelegramPopupConfig(input);
    }),
};
