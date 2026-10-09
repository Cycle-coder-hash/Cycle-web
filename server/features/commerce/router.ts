import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, adminProcedure, supportProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { assertCheckoutAcknowledgement } from "@shared/commerce";
import {
  products,
  orders,
  entitlements,
  auditEvents,
  notifications,
} from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import {
  listProducts,
  listBundles,
  listContent,
  listOrdersForUser,
  listAllOrders,
  createOrder,
  approveOrder,
  rejectOrder,
  deleteOrder,
  listEntitlements,
  grantManualEntitlement,
  getPaymentGateways,
  updatePaymentGateways,
} from "./repo";

const paymentMethod = z.enum(["bkash", "nagad", "rocket"]);

export const commercePublicProcedures = {
  content: publicProcedure.query(() => listContent()),
  products: publicProcedure.query(() => listProducts()),
  bundles: publicProcedure.query(() => listBundles()),
  paymentSettings: publicProcedure.query(async () => {
    const gateways = await getPaymentGateways();
    return {
      bkash: gateways.bkash.number,
      nagad: gateways.nagad.number,
      rocket: gateways.rocket.number,
      announcement: gateways.announcement,
      isAnnouncementEnabled: gateways.isAnnouncementEnabled,
      studentTelegramUrl: gateways.studentTelegramUrl || "https://t.me/cycleofchart",
      studentTelegramDescription: gateways.studentTelegramDescription || "Official Cycle of Chart VIP Student Telegram Community",
      gateways,
    };
  }),
};

export const commerceCustomerProcedures = {
  orders: protectedProcedure.query(({ ctx }) =>
    listOrdersForUser({
      id: ctx.user.id,
      openId: ctx.user.openId,
      email: ctx.user.email || undefined,
    })
  ),
  entitlements: protectedProcedure.query(({ ctx }) =>
    listEntitlements({
      id: ctx.user.id,
      openId: ctx.user.openId,
      email: ctx.user.email || undefined,
    })
  ),
  submitOrder: protectedProcedure
    .input(
      z.object({
        bundleId: z.number().optional(),
        productId: z.number().optional(),
        selectedPdfIds: z.array(z.number()).max(15),
        amount: z.number().positive(),
        paymentMethod,
        transactionId: z.string().min(3),
        screenshotKey: z.string().optional(),
        noRefundAcknowledged: z.literal(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.bundleId && !input.productId) {
        throw new Error("Select a product or bundle");
      }
      assertCheckoutAcknowledgement(input.noRefundAcknowledged);

      const newOrder = await createOrder({
        customerId: ctx.user.id,
        customerOpenId: ctx.user.openId,
        customerEmail: ctx.user.email || undefined,
        customerName: ctx.user.name || undefined,
        customerPhone: ctx.user.phone || undefined,
        bundleId: input.bundleId,
        productId: input.productId,
        selectedPdfIds: input.selectedPdfIds,
        amount: input.amount.toFixed(2),
        currency: "BDT",
        paymentMethod: input.paymentMethod,
        transactionId: input.transactionId,
        screenshotKey: input.screenshotKey,
        noRefundAcknowledged: input.noRefundAcknowledged,
      });

      return { success: true, status: "pending" as const, order: newOrder };
    }),

  claimFreeProduct: protectedProcedure
    .input(
      z.object({
        bundleId: z.number().optional(),
        productId: z.number().optional(),
        selectedPdfIds: z.array(z.number()).max(15).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.bundleId && !input.productId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select a product or bundle to claim",
        });
      }

      // Server-Side Price Validation: Validate that this bundle or product is genuinely FREE (price = 0)
      let isGenuinelyFree = false;
      let bundleTitle = "Free eBook Package";

      if (input.bundleId) {
        const allBundles = await listBundles();
        const targetBundle = allBundles.find((b: any) => b.id === input.bundleId);
        if (!targetBundle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Bundle not found" });
        }
        const priceNum = Number(targetBundle.price);
        if (priceNum === 0 || targetBundle.price === "00" || targetBundle.price === "0") {
          isGenuinelyFree = true;
          bundleTitle = targetBundle.titleEn || targetBundle.titleBn || "Free eBook Package";
        }
      } else if (input.productId) {
        const db = await getDb();
        if (db) {
          const prod = (
            await db
              .select()
              .from(products)
              .where(eq(products.id, input.productId))
              .limit(1)
          )[0];
          if (prod && (Number(prod.price) === 0 || prod.price === "0" || prod.price === "00")) {
            isGenuinelyFree = true;
          }
        }
      }

      if (!isGenuinelyFree) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This product is not free. Please complete regular checkout with payment.",
        });
      }

      const selectedPdfIds =
        input.selectedPdfIds && input.selectedPdfIds.length > 0
          ? input.selectedPdfIds
          : Array.from({ length: 15 }, (_, i) => i + 1);

      const db = await getDb();
      const scope = input.bundleId ? `bundle:${input.bundleId}` : `product:${input.productId}`;
      let orderId = 0;

      if (db) {
        // Check if user already claimed this entitlement
        const existingEntitlement = (
          await db
            .select()
            .from(entitlements)
            .where(
              and(
                eq(entitlements.userId, ctx.user.id),
                input.bundleId
                  ? eq(entitlements.bundleId, input.bundleId)
                  : eq(entitlements.productId, input.productId!)
              )
            )
            .limit(1)
        )[0];

        if (existingEntitlement) {
          return { success: true, alreadyClaimed: true, orderId: existingEntitlement.orderId };
        }

        // Insert order record with approved/free status
        const insertedOrder = await db.insert(orders).values({
          customerId: ctx.user.id,
          bundleId: input.bundleId || null,
          productId: input.productId || null,
          selectedPdfIds,
          amount: "0.00",
          currency: "BDT",
          paymentMethod: "free" as any,
          transactionId: "FREE_ACCESS",
          paymentStatus: "approved",
          orderStatus: "approved",
          noRefundAcknowledged: true,
          approvedAt: new Date(),
        });

        orderId = (insertedOrder[0] as any)?.insertId || (insertedOrder[0] as any)?.id || 0;

        // Grant entitlement immediately
        await db.insert(entitlements).values({
          userId: ctx.user.id,
          orderId: orderId || 0,
          productId: input.productId || null,
          bundleId: input.bundleId || null,
          scope,
          grantedAt: new Date(),
        });

        // Audit log & notification
        try {
          await db.insert(auditEvents).values({
            actorId: ctx.user.id,
            action: "order.free_claimed",
            entity: "order",
            entityId: orderId,
            metadata: { customerId: ctx.user.id, bundleId: input.bundleId },
          });
          await db.insert(notifications).values({
            userId: ctx.user.id,
            title: "Free Package Access Unlocked",
            message: `Your access to "${bundleTitle}" is active. Visit your library to view and download all PDFs.`,
          });
        } catch (e) {
          console.warn("[claimFreeProduct audit/notification error]:", e);
        }
      } else {
        // In-memory fallback
        const allEntitlements = await listEntitlements(ctx.user.id);
        const existingEntitlement = allEntitlements.find(
          (e: any) =>
            (input.bundleId && e.bundleId === input.bundleId) ||
            (input.productId && e.productId === input.productId)
        );
        if (existingEntitlement) {
          return { success: true, alreadyClaimed: true, orderId: existingEntitlement.orderId };
        }

        const allOrders = await listAllOrders();
        orderId = allOrders.length + 100;
        allOrders.unshift({
          id: orderId,
          customerId: ctx.user.id,
          bundleId: input.bundleId || null,
          productId: input.productId || null,
          selectedPdfIds,
          amount: "0.00",
          currency: "BDT",
          paymentMethod: "free",
          transactionId: "FREE_ACCESS",
          paymentStatus: "approved",
          orderStatus: "approved",
          noRefundAcknowledged: true,
          approvedAt: new Date(),
          createdAt: new Date(),
        });

        await grantManualEntitlement(ctx.user.id, scope, input.bundleId, input.productId);
      }

      return { success: true, alreadyClaimed: false, orderId };
    }),
};

export const commerceAdminProcedures = {
  orders: supportProcedure.query(() => listAllOrders()),

  approveOrder: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await approveOrder(input.orderId, ctx.user.id);
      return { success: true };
    }),

  rejectOrder: adminProcedure
    .input(z.object({ orderId: z.number(), reason: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      await rejectOrder(input.orderId, input.reason, ctx.user.id);
      return { success: true };
    }),

  deleteOrder: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteOrder(input.orderId, ctx.user.id);
      return { success: true };
    }),

  paymentSettings: supportProcedure.query(async () => {
    return await getPaymentGateways();
  }),

  updatePaymentSettings: supportProcedure
    .input(
      z.object({
        bkash: z
          .object({
            number: z.string(),
            accountType: z.enum(["Personal", "Merchant", "Agent"]),
            isEnabled: z.boolean(),
            instructions: z.string().optional(),
          })
          .optional(),
        nagad: z
          .object({
            number: z.string(),
            accountType: z.enum(["Personal", "Merchant", "Agent"]),
            isEnabled: z.boolean(),
            instructions: z.string().optional(),
          })
          .optional(),
        rocket: z
          .object({
            number: z.string(),
            accountType: z.enum(["Personal", "Merchant", "Agent"]),
            isEnabled: z.boolean(),
            instructions: z.string().optional(),
          })
          .optional(),
        announcement: z.string().optional(),
        isAnnouncementEnabled: z.boolean().optional(),
        studentTelegramUrl: z.string().optional(),
        studentTelegramDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await updatePaymentGateways(input as any);
    }),
};
