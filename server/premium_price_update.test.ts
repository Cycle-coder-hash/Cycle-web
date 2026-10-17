import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getPricingConfig, listBundles, approveOrder } from "./features/commerce/repo";
import { getUserSubscription, resetInMemorySubscriptionStateForTests } from "./features/subscription";

function createMockAuthContext(userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-price-user-${userId}`,
      email: `priceuser${userId}@example.com`,
      name: `Price User ${userId}`,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };
}

describe("Premium Plan Price Update (1199 BDT & 9.99 USD)", () => {
  beforeEach(() => {
    resetInMemorySubscriptionStateForTests();
  });

  it("getPricingConfig returns 1199 BDT and 9.99 USD for Premium plan while keeping Pro at 599 BDT", async () => {
    const config = await getPricingConfig();
    expect(config.subscriptions.premium.priceBdt).toBe("1199");
    expect(config.subscriptions.premium.priceUsd).toBe("9.99");
    expect(config.subscriptions.pro.priceBdt).toBe("599");
    expect(config.subscriptions.pro.priceUsd).toBe("4.99");
    expect(config.subscriptions.freeTrial.priceBdt).toBe("0");
  });

  it("listBundles returns bundle 102 with updated price 1199 and 9.99 USD", async () => {
    const bundles = await listBundles();
    const premiumBundle = bundles.find((b: any) => b.id === 102);
    expect(premiumBundle).toBeDefined();
    expect(premiumBundle?.price).toBe("1199");
    expect(premiumBundle?.priceUsd).toBe("9.99");

    const proBundle = bundles.find((b: any) => b.id === 101);
    expect(proBundle).toBeDefined();
    expect(proBundle?.price).toBe("599");
  });

  it("submitOrder rejects underpayment for Premium Plan (amount < 1199 BDT)", async () => {
    const ctx = createMockAuthContext(9101);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.customer.submitOrder({
        bundleId: 102,
        amount: 999, // old price should be rejected
        paymentMethod: "bkash",
        transactionId: "TRX999OLD",
        selectedPdfIds: [],
        noRefundAcknowledged: true,
      })
    ).rejects.toThrow(/Invalid amount for Premium Plan/i);
  });

  it("submitOrder accepts valid 1199 BDT for Premium Plan and sets up pending order", async () => {
    const ctx = createMockAuthContext(9102);
    const caller = appRouter.createCaller(ctx);

    const res = await caller.customer.submitOrder({
      bundleId: 102,
      amount: 1199,
      paymentMethod: "bkash",
      transactionId: "TRX1199NEW",
      selectedPdfIds: [],
      noRefundAcknowledged: true,
    });

    expect(res.success).toBe(true);
    expect(res.status).toBe("pending");
    expect(res.order.amount).toBe("1199.00");
  });

  it("approving order for bundle 102 activates premium subscription", async () => {
    const ctx = createMockAuthContext(9103);
    const caller = appRouter.createCaller(ctx);

    const res = await caller.customer.submitOrder({
      bundleId: 102,
      amount: 1199,
      paymentMethod: "nagad",
      transactionId: "TRXAPPROVE1199",
      selectedPdfIds: [],
      noRefundAcknowledged: true,
    });

    // Approve order
    const approval = await approveOrder(res.order.id, 1);
    expect(approval.success).toBe(true);

    // Verify user now has premium plan
    const sub = await getUserSubscription(9103);
    expect(sub.plan).toBe("premium");
    expect(sub.isPaidActive).toBe(true);
  });
});
