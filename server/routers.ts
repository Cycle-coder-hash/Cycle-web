/**
 * server/routers.ts — Application Router Composition
 *
 * All procedure implementations have been partitioned into Feature Routers:
 *   - server/features/auth/router.ts
 *   - server/features/commerce/router.ts
 *   - server/features/community/router.ts
 *   - server/features/discipline/router.ts
 *   - server/features/journal/router.ts
 *   - server/features/leaderboard/router.ts
 *   - server/features/library/router.ts
 *   - server/features/owner-profile/router.ts
 *   - server/features/subscription/router.ts
 *   - server/features/support/router.ts
 *   - server/features/system/router.ts
 */

import { systemRouter } from "./_core/systemRouter";
import { router, supportProcedure } from "./_core/trpc";
import { authRouter, authCustomerProcedures, authAdminProcedures, listAllUsers } from "./features/auth";
import {
  commercePublicProcedures,
  commerceCustomerProcedures,
  commerceAdminProcedures,
  listAllOrders,
} from "./features/commerce";
import { communityCustomerProcedures, communityAdminProcedures } from "./features/community";
import { disciplineCustomerProcedures } from "./features/discipline";
import { journalCustomerProcedures } from "./features/journal";
import { leaderboardRouter } from "./features/leaderboard";
import { libraryCustomerProcedures, libraryAdminProcedures } from "./features/library";
import { ownerProfilePublicProcedures, ownerProfileAdminProcedures } from "./features/owner-profile";
import {
  supportRouter,
  supportCustomerProcedures,
  supportAdminProcedures,
  listAdminSupportConversations,
} from "./features/support";
import { subscriptionRouter, subscriptionAdminProcedures } from "./features/subscription";
import { systemCustomerProcedures, systemAdminProcedures } from "./features/system";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  public: router({
    ...commercePublicProcedures,
    ...ownerProfilePublicProcedures,
  }),
  customer: router({
    ...libraryCustomerProcedures,
    ...commerceCustomerProcedures,
    ...systemCustomerProcedures,
    ...communityCustomerProcedures,
    ...authCustomerProcedures,
    ...journalCustomerProcedures,
    ...disciplineCustomerProcedures,
    ...supportCustomerProcedures,
  }),
  support: supportRouter,
  admin: router({
    stats: supportProcedure.query(async () => {
      const allOrders = await listAllOrders();
      const allUsers = await listAllUsers();
      const allConversations = await listAdminSupportConversations();

      const approvedOrders = allOrders.filter((o: any) => o.orderStatus === "approved");
      const pendingOrders = allOrders.filter((o: any) => o.orderStatus === "pending");
      const rejectedOrders = allOrders.filter((o: any) => o.orderStatus === "rejected");

      const totalRevenue = approvedOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0);
      const pendingRevenue = pendingOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0);

      const unreadConversationsCount = allConversations.filter((c: any) => c.unreadCount > 0).length;

      return {
        totalRevenue,
        pendingRevenue,
        totalOrders: allOrders.length,
        approvedOrdersCount: approvedOrders.length,
        pendingOrdersCount: pendingOrders.length,
        rejectedOrdersCount: rejectedOrders.length,
        totalStudents: allUsers.length,
        totalConversationsCount: allConversations.length,
        unreadConversationsCount,
        // Compatibility fallbacks
        totalTicketsCount: allConversations.length,
        openTicketsCount: unreadConversationsCount,
        inProgressTicketsCount: 0,
        waitingUserTicketsCount: 0,
        resolvedTicketsCount: 0,
        closedTicketsCount: 0,
      };
    }),
    ...commerceAdminProcedures,
    ...supportAdminProcedures,
    ...authAdminProcedures,
    ...systemAdminProcedures,
    ...subscriptionAdminProcedures,
    ...communityAdminProcedures,
    ...libraryAdminProcedures,
    ...ownerProfileAdminProcedures,
  }),
  leaderboard: leaderboardRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
