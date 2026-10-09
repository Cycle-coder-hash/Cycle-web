import { z } from "zod";
import { protectedProcedure, adminProcedure, supportProcedure } from "../../_core/trpc";
import { settings } from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { setSetting } from "../../infra/db/settings";
import { listNotifications, listAuditLogs } from "./repo";

export const systemCustomerProcedures = {
  notifications: protectedProcedure.query(({ ctx }) =>
    listNotifications({
      id: ctx.user.id,
      openId: ctx.user.openId,
      email: ctx.user.email || undefined,
    })
  ),
};

export const systemAdminProcedures = {
  auditLogs: supportProcedure.query(() => listAuditLogs()),

  setSetting: adminProcedure
    .input(z.object({ key: z.string().min(1), value: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db
          .insert(settings)
          .values({ key: input.key, value: input.value, updatedAt: new Date() })
          .onDuplicateKeyUpdate({ set: { value: input.value, updatedAt: new Date() } });
      }
      await setSetting(input.key, input.value);
      return { success: true };
    }),
};
