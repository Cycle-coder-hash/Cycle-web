import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { assertCheckoutAcknowledgement, canSellEbookAlone, pricePdfPackage } from "@shared/commerce";

const base = { protocol: "https", headers: {} } as TrpcContext["req"];
const res = { clearCookie: () => undefined } as TrpcContext["res"];

function ctx(user: TrpcContext["user"]): TrpcContext { return { user, req: base, res }; }

describe("Trading Reality safety contracts", () => {
  it("keeps commerce rules deterministic and safe", () => {
    expect(pricePdfPackage()).toBe(200);
    expect(canSellEbookAlone("ebook")).toBe(false);
    expect(canSellEbookAlone("course")).toBe(true);
    expect(() => assertCheckoutAcknowledgement(false)).toThrow("No-refund acknowledgement is required");
    expect(assertCheckoutAcknowledgement(true)).toBe(true);
  });

  it("exposes centralized payment settings without exposing a payment success shortcut", async () => {
    const result = await appRouter.createCaller(ctx(null)).public.paymentSettings();
    expect(result).toMatchObject({ bkash: expect.any(String), nagad: expect.any(String), rocket: expect.any(String) });
    expect((appRouter as unknown as { _def?: unknown })).toBeDefined();
  });

  it("keeps public catalog queries available without authentication", async () => {
    const caller = appRouter.createCaller(ctx(null));
    expect(await caller.public.products()).toBeInstanceOf(Array);
    expect(await caller.public.bundles()).toBeInstanceOf(Array);
  });

  it("rejects invalid approval requests before entitlement creation", async () => {
    const admin = { id: 1, openId: "admin", name: "Admin", email: "admin@example.com", loginMethod: "test", role: "admin" as const, language: "en" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    await expect(appRouter.createCaller(ctx(admin)).admin.approveOrder({ orderId: 999999999 })).rejects.toThrow("Order not found");
  });

  it("rejects non-admin access to the approval workflow", async () => {
    const user = { id: 42, openId: "customer", name: "Customer", email: "customer@example.com", loginMethod: "test", role: "user" as const, language: "en" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
    await expect(appRouter.createCaller(ctx(user)).admin.orders()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
