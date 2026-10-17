import { desc, eq, inArray } from "drizzle-orm";
import {
  products,
  bundles,
  content,
  orders,
  entitlements,
  notifications,
} from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { getSetting, setSetting } from "../../infra/db/settings";
import { supabaseServer } from "../../infra/db/supabase";
import {
  orderGrantsCourseAccess,
  getCourseTelegramPopupConfig,
  createCourseTelegramPopupEvent,
} from "../community";
import { sendAccessEmail } from "../../infra/email";
import { getUserById, addAuditLog } from "../../db";

export interface PaymentGatewayDetail {
  number: string;
  accountType: "Personal" | "Merchant" | "Agent";
  isEnabled: boolean;
  instructions?: string;
}

export interface CoursePricingItem {
  priceBdt: string;
  priceUsd: string;
  originalPriceBdt?: string;
}

export interface SubscriptionPricingItem {
  priceBdt: string;
  priceUsd: string;
  billingPeriod?: string;
}

export interface PricingConfig {
  courses: {
    freeEbook: CoursePricingItem;
    basicToAdvance: CoursePricingItem;
    proBlueprint: CoursePricingItem;
  };
  subscriptions: {
    freeTrial: SubscriptionPricingItem;
    pro: SubscriptionPricingItem;
    premium: SubscriptionPricingItem;
  };
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  courses: {
    freeEbook: { priceBdt: "0", priceUsd: "0" },
    basicToAdvance: { priceBdt: "2499", priceUsd: "19.99" },
    proBlueprint: { priceBdt: "4999", priceUsd: "39.99", originalPriceBdt: "5550" },
  },
  subscriptions: {
    freeTrial: { priceBdt: "0", priceUsd: "0", billingPeriod: "30 days" },
    pro: { priceBdt: "599", priceUsd: "4.99", billingPeriod: "month" },
    premium: { priceBdt: "1199", priceUsd: "9.99", billingPeriod: "month" },
  },
};

export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const raw = await getSetting("pricing_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.subscriptions?.premium?.priceBdt === "999") {
        parsed.subscriptions.premium.priceBdt = "1199";
      }
      return {
        courses: {
          freeEbook: { ...DEFAULT_PRICING_CONFIG.courses.freeEbook, ...(parsed?.courses?.freeEbook || {}) },
          basicToAdvance: { ...DEFAULT_PRICING_CONFIG.courses.basicToAdvance, ...(parsed?.courses?.basicToAdvance || {}) },
          proBlueprint: { ...DEFAULT_PRICING_CONFIG.courses.proBlueprint, ...(parsed?.courses?.proBlueprint || {}) },
        },
        subscriptions: {
          freeTrial: { ...DEFAULT_PRICING_CONFIG.subscriptions.freeTrial, ...(parsed?.subscriptions?.freeTrial || {}) },
          pro: { ...DEFAULT_PRICING_CONFIG.subscriptions.pro, ...(parsed?.subscriptions?.pro || {}) },
          premium: { ...DEFAULT_PRICING_CONFIG.subscriptions.premium, ...(parsed?.subscriptions?.premium || {}) },
        },
      };
    }
  } catch (err) {
    console.warn("[getPricingConfig error]:", err);
  }
  return DEFAULT_PRICING_CONFIG;
}

export async function updatePricingConfig(config: Partial<PricingConfig>): Promise<PricingConfig> {
  const current = await getPricingConfig();
  const updated: PricingConfig = {
    courses: {
      freeEbook: { ...current.courses.freeEbook, ...(config.courses?.freeEbook || {}) },
      basicToAdvance: { ...current.courses.basicToAdvance, ...(config.courses?.basicToAdvance || {}) },
      proBlueprint: { ...current.courses.proBlueprint, ...(config.courses?.proBlueprint || {}) },
    },
    subscriptions: {
      freeTrial: { ...current.subscriptions.freeTrial, ...(config.subscriptions?.freeTrial || {}) },
      pro: { ...current.subscriptions.pro, ...(config.subscriptions?.pro || {}) },
      premium: { ...current.subscriptions.premium, ...(config.subscriptions?.premium || {}) },
    },
  };
  await setSetting("pricing_config", JSON.stringify(updated));
  return updated;
}

export interface PaymentGatewaysConfig {
  bkash: PaymentGatewayDetail;
  nagad: PaymentGatewayDetail;
  rocket: PaymentGatewayDetail;
  announcement?: string;
  isAnnouncementEnabled?: boolean;
  studentTelegramUrl?: string;
  studentTelegramDescription?: string;
  pricing?: PricingConfig;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentGatewaysConfig = {
  bkash: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using bKash App or *247#, then copy and enter the Transaction ID (TrxID) below.",
  },
  nagad: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using Nagad App or *167#, then copy and enter the Transaction ID (TrxID) below.",
  },
  rocket: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using Rocket App or *322#, then copy and enter the Transaction ID (TrxID) below.",
  },
  announcement: "Official Payment Numbers Verified. Instant Dashboard Access upon Payment Verification.",
  isAnnouncementEnabled: false,
  studentTelegramUrl: "https://t.me/cycleofchart",
  studentTelegramDescription: "Official Cycle of Chart VIP Student Telegram Community",
  pricing: DEFAULT_PRICING_CONFIG,
};

export const inMemoryOrders: any[] = [];
export const inMemoryEntitlements: any[] = [];
let orderAutoId = 1;
let entitlementAutoId = 1;

export async function getPaymentGateways(): Promise<PaymentGatewaysConfig> {
  const pricing = await getPricingConfig();
  try {
    const raw = await getSetting("payment_gateways_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        bkash: { ...DEFAULT_PAYMENT_CONFIG.bkash, ...(parsed.bkash || {}) },
        nagad: { ...DEFAULT_PAYMENT_CONFIG.nagad, ...(parsed.nagad || {}) },
        rocket: { ...DEFAULT_PAYMENT_CONFIG.rocket, ...(parsed.rocket || {}) },
        announcement: parsed.announcement !== undefined ? parsed.announcement : DEFAULT_PAYMENT_CONFIG.announcement,
        isAnnouncementEnabled: parsed.isAnnouncementEnabled !== undefined ? parsed.isAnnouncementEnabled : DEFAULT_PAYMENT_CONFIG.isAnnouncementEnabled,
        studentTelegramUrl: parsed.studentTelegramUrl || (await getSetting("student_telegram_url")) || DEFAULT_PAYMENT_CONFIG.studentTelegramUrl,
        studentTelegramDescription: parsed.studentTelegramDescription || DEFAULT_PAYMENT_CONFIG.studentTelegramDescription,
        pricing,
      };
    }
    // Also check legacy individual settings if present
    const legacyBkash = await getSetting("bkash");
    const legacyNagad = await getSetting("nagad");
    const legacyRocket = await getSetting("rocket");
    const legacyAnnouncement = await getSetting("announcement");
    const legacyTelegram = await getSetting("student_telegram_url");
    if (legacyBkash || legacyNagad || legacyRocket || legacyTelegram) {
      return {
        bkash: { ...DEFAULT_PAYMENT_CONFIG.bkash, number: legacyBkash || DEFAULT_PAYMENT_CONFIG.bkash.number },
        nagad: { ...DEFAULT_PAYMENT_CONFIG.nagad, number: legacyNagad || DEFAULT_PAYMENT_CONFIG.nagad.number },
        rocket: { ...DEFAULT_PAYMENT_CONFIG.rocket, number: legacyRocket || DEFAULT_PAYMENT_CONFIG.rocket.number },
        announcement: legacyAnnouncement || DEFAULT_PAYMENT_CONFIG.announcement,
        isAnnouncementEnabled: false,
        studentTelegramUrl: legacyTelegram || DEFAULT_PAYMENT_CONFIG.studentTelegramUrl,
        studentTelegramDescription: DEFAULT_PAYMENT_CONFIG.studentTelegramDescription,
        pricing,
      };
    }
  } catch (err) {
    console.warn("[getPaymentGateways error]:", err);
  }
  return { ...DEFAULT_PAYMENT_CONFIG, pricing };
}

export async function updatePaymentGateways(config: Partial<PaymentGatewaysConfig>): Promise<PaymentGatewaysConfig> {
  if (config.pricing) {
    await updatePricingConfig(config.pricing);
  }
  const current = await getPaymentGateways();
  const updated: PaymentGatewaysConfig = {
    ...current,
    ...config,
    bkash: { ...current.bkash, ...(config.bkash || {}) },
    nagad: { ...current.nagad, ...(config.nagad || {}) },
    rocket: { ...current.rocket, ...(config.rocket || {}) },
    studentTelegramUrl: config.studentTelegramUrl !== undefined ? config.studentTelegramUrl : current.studentTelegramUrl,
    studentTelegramDescription: config.studentTelegramDescription !== undefined ? config.studentTelegramDescription : current.studentTelegramDescription,
    pricing: await getPricingConfig(),
  };
  await setSetting("payment_gateways_config", JSON.stringify(updated));
  // Sync legacy individual keys for full backward compatibility
  await setSetting("bkash", updated.bkash.number);
  await setSetting("nagad", updated.nagad.number);
  await setSetting("rocket", updated.rocket.number);
  if (updated.announcement !== undefined) {
    await setSetting("announcement", updated.announcement);
  }
  if (updated.studentTelegramUrl !== undefined) {
    await setSetting("student_telegram_url", updated.studentTelegramUrl);
  }
  return updated;
}

export async function listProducts() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(products).where(eq(products.isPublished, true));
    } catch (err) {
      console.warn("[listProducts error]:", err);
    }
  }
  return [];
}

export async function listBundles() {
  const pricing = await getPricingConfig();
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(bundles).where(eq(bundles.isPublished, true));
      if (rows && rows.length > 0) {
        return rows.map((b: any) => {
          if (b.id === 1 || b.slug === "pdf-package") {
            return {
              ...b,
              price: pricing.courses.freeEbook.priceBdt,
              priceUsd: pricing.courses.freeEbook.priceUsd,
            };
          }
          if (b.id === 2 || b.slug === "course-ebook") {
            return {
              ...b,
              price: pricing.courses.basicToAdvance.priceBdt,
              priceUsd: pricing.courses.basicToAdvance.priceUsd,
            };
          }
          if (b.id === 4 || b.slug === "pro-blueprint") {
            return {
              ...b,
              price: pricing.courses.proBlueprint.priceBdt,
              priceUsd: pricing.courses.proBlueprint.priceUsd,
              originalPrice: pricing.courses.proBlueprint.originalPriceBdt || "5550",
            };
          }
          if (b.id === 101 || b.slug === "pro-plan") {
            return {
              ...b,
              price: pricing.subscriptions.pro.priceBdt,
              priceUsd: pricing.subscriptions.pro.priceUsd,
            };
          }
          if (b.id === 102 || b.slug === "premium-plan") {
            return {
              ...b,
              price: pricing.subscriptions.premium.priceBdt,
              priceUsd: pricing.subscriptions.premium.priceUsd,
            };
          }
          return b;
        });
      }
    } catch (err) {
      console.warn("[listBundles error]:", err);
    }
  }
  return [
    {
      id: 1,
      slug: "pdf-package",
      titleEn: "Free eBook Package",
      titleBn: "Free eBook Package",
      price: pricing.courses.freeEbook.priceBdt,
      priceUsd: pricing.courses.freeEbook.priceUsd,
      currency: "BDT",
      includesPdfPackage: true,
      includesEbook: false,
      includesCourse: false,
    },
    {
      id: 2,
      slug: "course-ebook",
      titleEn: "CYCLE OF CHART BASIC TO ADVANCE COURSE",
      titleBn: "CYCLE OF CHART BASIC TO ADVANCE COURSE",
      price: pricing.courses.basicToAdvance.priceBdt,
      priceUsd: pricing.courses.basicToAdvance.priceUsd,
      currency: "BDT",
      includesPdfPackage: false,
      includesEbook: true,
      includesCourse: true,
    },
    {
      id: 4,
      slug: "pro-blueprint",
      titleEn: "CYCLE OF CHART \u2014 PROFESSIONAL TRADING BLUEPRINT",
      titleBn: "CYCLE OF CHART \u2014 PROFESSIONAL TRADING BLUEPRINT",
      originalPrice: pricing.courses.proBlueprint.originalPriceBdt || "5550",
      price: pricing.courses.proBlueprint.priceBdt,
      priceUsd: pricing.courses.proBlueprint.priceUsd,
      currency: "BDT",
      includesPdfPackage: true,
      includesEbook: true,
      includesCourse: true,
    },
    {
      id: 101,
      slug: "pro-plan",
      titleEn: "CYCLE OF CHART \u2014 PRO PLAN (MONTHLY)",
      titleBn: "CYCLE OF CHART \u2014 PRO PLAN (MONTHLY)",
      price: pricing.subscriptions.pro.priceBdt,
      priceUsd: pricing.subscriptions.pro.priceUsd,
      currency: "BDT",
      includesPdfPackage: false,
      includesEbook: false,
      includesCourse: false,
    },
    {
      id: 102,
      slug: "premium-plan",
      titleEn: "CYCLE OF CHART \u2014 PREMIUM PLAN (MONTHLY)",
      titleBn: "CYCLE OF CHART \u2014 PREMIUM PLAN (MONTHLY)",
      price: pricing.subscriptions.premium.priceBdt,
      priceUsd: pricing.subscriptions.premium.priceUsd,
      currency: "BDT",
      includesPdfPackage: false,
      includesEbook: false,
      includesCourse: false,
    },
  ];
}

export async function listContent() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(content).where(eq(content.isPublished, true));
    } catch (err) {
      console.warn("[listContent error]:", err);
    }
  }
  return [];
}

export async function resolveUserCandidateIds(
  input: number | { id?: number; openId?: string; email?: string }
): Promise<number[]> {
  const ids = new Set<number>();
  if (typeof input === "number") {
    if (input > 0) ids.add(input);
  } else if (input && typeof input === "object") {
    if (input.id && input.id > 0) ids.add(input.id);
    try {
      const filters: string[] = [];
      if (input.id && input.id > 0) filters.push(`id.eq.${input.id}`);
      if (input.openId) filters.push(`openId.eq.${input.openId}`);
      if (input.email) filters.push(`email.eq.${input.email.toLowerCase().trim()}`);

      if (filters.length > 0) {
        const { data } = await supabaseServer
          .from("users")
          .select("id")
          .or(filters.join(","));
        if (data && Array.isArray(data)) {
          for (const u of data) {
            if (u.id) ids.add(u.id);
          }
        }
      }
    } catch (e) {
      console.warn("[resolveUserCandidateIds error]:", e);
    }
  }
  return Array.from(ids);
}

export async function listOrdersForUser(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  const db = await getDb();
  if (db) {
    try {
      const targetIds = candidateIds.length > 0 ? candidateIds : [primaryId];
      return await db
        .select()
        .from(orders)
        .where(inArray(orders.customerId, targetIds))
        .orderBy(desc(orders.createdAt));
    } catch (err) {
      console.warn("[listOrdersForUser error]:", err);
    }
  }

  // Supabase live database connection
  try {
    let query = supabaseServer.from("orders").select("*");
    if (candidateIds.length === 1) {
      query = query.eq("customerId", candidateIds[0]);
    } else if (candidateIds.length > 1) {
      query = query.in("customerId", candidateIds);
    } else {
      query = query.eq("customerId", primaryId);
    }
    const { data, error } = await query.order("createdAt", { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((o) => ({
        ...o,
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        approvedAt: o.approvedAt ? new Date(o.approvedAt) : undefined,
      }));
    }
  } catch (err) {
    console.warn("[listOrdersForUser Supabase fetch error]:", err);
  }

  return inMemoryOrders.filter((o) => candidateIds.includes(o.customerId) || o.customerId === primaryId);
}

export async function listAllOrders() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (err) {
      console.warn("[listAllOrders error]:", err);
    }
  }

  // Supabase live database connection
  try {
    const { data, error } = await supabaseServer
      .from("orders")
      .select("*")
      .order("createdAt", { ascending: false });
    if (!error && data) {
      for (const item of data) {
        const idx = inMemoryOrders.findIndex((o) => o.id === item.id);
        const mapped = {
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
        };
        if (idx >= 0) {
          inMemoryOrders[idx] = mapped;
        } else {
          inMemoryOrders.push(mapped);
        }
      }
      return inMemoryOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn("[listAllOrders Supabase fetch error]:", err);
  }

  return inMemoryOrders;
}

export async function resolveSupabaseCustomerId(input: {
  customerId?: number;
  openId?: string;
  email?: string;
  name?: string;
  phone?: string;
}): Promise<number> {
  try {
    // 1. If customerId is provided and valid (> 0), verify it exists in Supabase users table
    if (input.customerId && input.customerId > 0) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("id", input.customerId)
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 2. If openId provided, check by openId
    if (input.openId) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("openId", input.openId)
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 3. If email provided, check by email
    if (input.email) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("email", input.email.toLowerCase().trim())
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 4. User does not exist in Supabase users table! Create real user record in Supabase now
    try {
      const newOpenId = input.openId || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabaseServer
        .from("users")
        .insert({
          openId: newOpenId,
          name: input.name || "Student",
          email: input.email ? input.email.toLowerCase().trim() : null,
          phone: input.phone || null,
          role: "user",
          language: "en",
          loginMethod: "password",
          lastSignedIn: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!error && data?.id) {
        return data.id;
      }
      if (error) {
        console.warn("[resolveSupabaseCustomerId insert error]:", error.message);
      }
    } catch (err) {
      console.warn("[resolveSupabaseCustomerId insert exception]:", err);
    }

    // 5. Fallback: query any existing user in Supabase users to guarantee foreign key constraint is satisfied
    try {
      const { data } = await supabaseServer.from("users").select("id").limit(1).maybeSingle();
      if (data?.id) return data.id;
    } catch (e) {}
  } catch (err) {
    console.warn("[resolveSupabaseCustomerId exception]:", err);
  }

  return input.customerId || 1;
}

export async function createOrder(orderInput: {
  customerId: number;
  customerOpenId?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  bundleId?: number | null;
  productId?: number | null;
  selectedPdfIds?: number[];
  amount: string;
  currency?: string;
  paymentMethod: string;
  transactionId: string;
  screenshotKey?: string | null;
  noRefundAcknowledged: boolean;
}) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      const res = await db.insert(orders).values({
        customerId: orderInput.customerId,
        bundleId: orderInput.bundleId || null,
        productId: orderInput.productId || null,
        selectedPdfIds: orderInput.selectedPdfIds || [],
        amount: orderInput.amount,
        currency: orderInput.currency || "BDT",
        paymentMethod: orderInput.paymentMethod,
        transactionId: orderInput.transactionId,
        screenshotKey: orderInput.screenshotKey || null,
        noRefundAcknowledged: orderInput.noRefundAcknowledged,
        paymentStatus: "pending",
        orderStatus: "pending",
        createdAt: now,
        updatedAt: now,
      });
      const insertId = res[0]?.insertId || res[0]?.id || orderAutoId++;
      return { id: insertId, ...orderInput, paymentStatus: "pending", orderStatus: "pending", createdAt: now };
    } catch (err) {
      console.warn("[createOrder Drizzle error]:", err);
    }
  }

  // Supabase live database insertion
  try {
    const resolvedCustomerId = await resolveSupabaseCustomerId({
      customerId: orderInput.customerId,
      openId: orderInput.customerOpenId,
      email: orderInput.customerEmail,
      name: orderInput.customerName,
      phone: orderInput.customerPhone,
    });

    let validBundleId = orderInput.bundleId || null;
    if (validBundleId) {
      try {
        const { data: bundleExists } = await supabaseServer
          .from("bundles")
          .select("id")
          .eq("id", validBundleId)
          .maybeSingle();
        if (!bundleExists?.id) {
          validBundleId = null;
        }
      } catch (e) {}
    }

    let validProductId = orderInput.productId || null;
    if (validProductId) {
      try {
        const { data: prodExists } = await supabaseServer
          .from("products")
          .select("id")
          .eq("id", validProductId)
          .maybeSingle();
        if (!prodExists?.id) {
          validProductId = null;
        }
      } catch (e) {}
    }

    const payload = {
      customerId: resolvedCustomerId,
      bundleId: validBundleId,
      productId: validProductId,
      selectedPdfIds: orderInput.selectedPdfIds || [],
      amount: orderInput.amount,
      currency: orderInput.currency || "BDT",
      paymentMethod: orderInput.paymentMethod,
      transactionId: orderInput.transactionId,
      screenshotKey: orderInput.screenshotKey || null,
      noRefundAcknowledged: orderInput.noRefundAcknowledged,
      paymentStatus: "pending",
      orderStatus: "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("orders")
      .insert(payload)
      .select();

    if (!error && data && data.length > 0) {
      const inserted = {
        ...data[0],
        createdAt: new Date(data[0].createdAt),
        updatedAt: new Date(data[0].updatedAt),
      };
      inMemoryOrders.unshift(inserted);
      console.log(`[createOrder SUCCESS]: Order #${inserted.id} inserted into Supabase (customerId: ${resolvedCustomerId}, TrxID: ${orderInput.transactionId})`);
      return inserted;
    } else if (error) {
      console.warn("[createOrder Supabase error]:", error.message);
      // If error is any foreign key violation, fallback to first available user and strip bundle/product foreign keys
      if (error.code === "23503") {
        const { data: firstUser } = await supabaseServer.from("users").select("id").limit(1).maybeSingle();
        const retryPayload = {
          ...payload,
          customerId: firstUser?.id || resolvedCustomerId,
          bundleId: null,
          productId: null,
        };
        const retryRes = await supabaseServer.from("orders").insert(retryPayload).select();
        if (retryRes.data && retryRes.data.length > 0) {
          const retryOrder = {
            ...retryRes.data[0],
            createdAt: new Date(retryRes.data[0].createdAt),
            updatedAt: new Date(retryRes.data[0].updatedAt),
          };
          inMemoryOrders.unshift(retryOrder);
          console.log(`[createOrder RETRY SUCCESS]: Order #${retryOrder.id} saved with fallback user #${firstUser?.id || resolvedCustomerId}`);
          return retryOrder;
        }
      }
    }
  } catch (err) {
    console.warn("[createOrder Supabase exception]:", err);
  }

  const fallbackOrder = {
    id: orderAutoId++,
    ...orderInput,
    selectedPdfIds: orderInput.selectedPdfIds || [],
    currency: orderInput.currency || "BDT",
    paymentStatus: "pending" as const,
    orderStatus: "pending" as const,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryOrders.unshift(fallbackOrder);
  return fallbackOrder;
}

export async function approveOrder(orderId: number, approvedBy: number = 1) {
  const now = new Date();

  // Find target order first to check IDEMPOTENCY and determine course access
  let targetOrder: any = null;
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (rows.length > 0) targetOrder = rows[0];
    } catch (err) {}
  }

  if (!targetOrder) {
    try {
      const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
      if (orderRows?.[0]) targetOrder = orderRows[0];
    } catch (err) {}
  }

  if (!targetOrder) {
    targetOrder = inMemoryOrders.find((o) => o.id === orderId);
  }

  if (!targetOrder) {
    throw new Error("Order not found");
  }

  // IDEMPOTENCY CHECK: If already approved, avoid duplicate entitlements & events
  if (targetOrder.orderStatus === "approved" && targetOrder.paymentStatus === "approved") {
    console.info(`[approveOrder IDEMPOTENT]: Order #${orderId} is already approved. Returning without duplicate processing.`);
    return { success: true, order: targetOrder, alreadyApproved: true };
  }

  // Check if this order grants course access
  const isCourse = await orderGrantsCourseAccess(targetOrder);
  const telegramConfig = await getCourseTelegramPopupConfig();

  // Check if this order is for a subscription plan
  const isProPlan = targetOrder.bundleId === 101 || targetOrder.productId === 101 || targetOrder.scope?.includes("plan:pro") || (targetOrder as any).plan === "pro";
  const isPremiumPlan = targetOrder.bundleId === 102 || targetOrder.productId === 102 || targetOrder.scope?.includes("plan:premium") || (targetOrder as any).plan === "premium";

  if (isProPlan || isPremiumPlan) {
    try {
      const planToActivate = isPremiumPlan ? "premium" : "pro";
      const { activateSubscription } = await import("../../subscription");
      await activateSubscription(targetOrder.customerId, planToActivate);
    } catch (subErr) {
      console.warn("[approveOrder activateSubscription error]:", subErr);
    }
  }

  // 1. Update Drizzle database if active
  if (db) {
    try {
      await db.update(orders).set({
        orderStatus: "approved",
        paymentStatus: "approved",
        approvedAt: now,
        approvedBy,
        updatedAt: now,
      }).where(eq(orders.id, orderId));

      await db.insert(entitlements).values({
        userId: targetOrder.customerId,
        orderId: targetOrder.id,
        productId: targetOrder.productId,
        bundleId: targetOrder.bundleId,
        scope: targetOrder.bundleId ? `bundle:${targetOrder.bundleId}` : `product:${targetOrder.productId || 1}`,
        grantedAt: now,
      });

      await db.insert(notifications).values({
        userId: targetOrder.customerId,
        title: isCourse ? "Course Access Unlocked" : "Access unlocked",
        message: isCourse && telegramConfig.telegramUrl
          ? "Your course access has been approved! Join our official Telegram community for real-time course updates, institutional study materials, and student support."
          : "Your payment was approved and your digital learning access is now available.",
        read: false,
        createdAt: now,
      });
    } catch (err) {
      console.warn("[approveOrder Drizzle error]:", err);
    }
  }

  // 2. Supabase live database update
  try {
    await supabaseServer
      .from("orders")
      .update({
        orderStatus: "approved",
        paymentStatus: "approved",
        approvedAt: now.toISOString(),
        approvedBy,
        updatedAt: now.toISOString(),
      })
      .eq("id", orderId);

    // Add entitlement in Supabase
    await supabaseServer.from("entitlements").insert({
      userId: targetOrder.customerId,
      orderId: targetOrder.id,
      bundleId: targetOrder.bundleId || null,
      productId: targetOrder.productId || null,
      scope: targetOrder.bundleId ? `bundle:${targetOrder.bundleId}` : `product:${targetOrder.productId || 1}`,
      grantedAt: now.toISOString(),
    });

    // Add notification in Supabase
    await supabaseServer.from("notifications").insert({
      userId: targetOrder.customerId,
      title: isCourse ? "Course Access Unlocked" : "Access unlocked",
      message: isCourse && telegramConfig.telegramUrl
        ? "Your course access has been approved! Join our official Telegram community for real-time course updates, institutional study materials, and student support."
        : "Your payment was approved and your digital learning access is now available.",
      read: false,
      createdAt: now.toISOString(),
    });

    // Record in audit logs
    await addAuditLog({
      actorId: approvedBy,
      action: "order.approved",
      entity: "order",
      entityId: orderId,
      metadata: { customerId: targetOrder.customerId, amount: targetOrder.amount, isCourse },
    });
  } catch (err) {
    console.warn("[approveOrder Supabase error]:", err);
  }

  // 3. If Course access granted, create Telegram Popup Event
  if (isCourse) {
    try {
      await createCourseTelegramPopupEvent({
        userId: targetOrder.customerId,
        orderId: targetOrder.id,
      });
      console.log(`[approveOrder]: Course Telegram Popup event created for user ${targetOrder.customerId} on Order #${targetOrder.id}`);
    } catch (evErr) {
      console.warn("[createCourseTelegramPopupEvent notice]:", evErr);
    }
  }

  // 4. Update in-memory cache
  targetOrder.orderStatus = "approved";
  targetOrder.paymentStatus = "approved";
  targetOrder.approvedAt = now;

  const memOrder = inMemoryOrders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.orderStatus = "approved";
    memOrder.paymentStatus = "approved";
    memOrder.approvedAt = now;
  }

  // 5. Send access email via credential-safe email boundary
  try {
    const customer = await getUserById(targetOrder.customerId);
    const recipientEmail = customer?.email || targetOrder.customerEmail;
    if (recipientEmail) {
      await sendAccessEmail("payment_approved", recipientEmail, {
        orderId: targetOrder.id,
        customerName: customer?.name || targetOrder.customerName || "Trader",
        bundleId: targetOrder.bundleId,
        productId: targetOrder.productId,
        amount: targetOrder.amount,
        isCourse,
        telegramUrl: isCourse && telegramConfig.enabled ? telegramConfig.telegramUrl : undefined,
      });
    }
  } catch (emailErr) {
    console.warn("[approveOrder email boundary notice]:", emailErr);
  }

  return { success: true, order: targetOrder };
}

export async function rejectOrder(orderId: number, reason: string, rejectedBy: number = 1) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      await db.update(orders).set({
        orderStatus: "rejected",
        paymentStatus: "rejected",
        rejectionReason: reason,
        updatedAt: now,
      }).where(eq(orders.id, orderId));
      return { success: true };
    } catch (err) {
      console.warn("[rejectOrder Drizzle error]:", err);
    }
  }

  // Supabase live database update
  try {
    await supabaseServer
      .from("orders")
      .update({
        orderStatus: "rejected",
        paymentStatus: "rejected",
        rejectionReason: reason,
        updatedAt: now.toISOString(),
      })
      .eq("id", orderId);

    const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
    const targetOrder = orderRows?.[0] || inMemoryOrders.find((o) => o.id === orderId);
    if (targetOrder) {
      await supabaseServer.from("notifications").insert({
        userId: targetOrder.customerId,
        title: "Order verification issue",
        message: `Your payment verification could not be completed: ${reason}. Please contact support.`,
        read: false,
        createdAt: now.toISOString(),
      });

      await addAuditLog({
        actorId: rejectedBy,
        action: "order.rejected",
        entity: "order",
        entityId: orderId,
        metadata: { customerId: targetOrder.customerId, reason },
      });
    }

    const memOrder = inMemoryOrders.find((o) => o.id === orderId);
    if (memOrder) {
      memOrder.orderStatus = "rejected";
      memOrder.paymentStatus = "rejected";
      memOrder.rejectionReason = reason;
    }
    return { success: true };
  } catch (err) {
    console.warn("[rejectOrder Supabase error]:", err);
  }

  const memOrder = inMemoryOrders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.orderStatus = "rejected";
    memOrder.paymentStatus = "rejected";
    memOrder.rejectionReason = reason;
    return { success: true };
  }
  throw new Error("Order not found");
}

export async function deleteOrder(orderId: number, deletedBy: number = 1) {
  const db = await getDb();
  if (db) {
    try {
      try {
        await db.delete(entitlements).where(eq(entitlements.orderId, orderId));
      } catch {}
      await db.delete(orders).where(eq(orders.id, orderId));
    } catch (err) {
      console.warn("[deleteOrder Drizzle error]:", err);
    }
  }

  // Supabase live database deletion
  try {
    try {
      await supabaseServer.from("entitlements").delete().eq("orderId", orderId);
    } catch {}

    const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
    const targetOrder = orderRows?.[0] || inMemoryOrders.find((o) => o.id === orderId);

    const { error: delErr } = await supabaseServer.from("orders").delete().eq("id", orderId);
    if (delErr) {
      console.warn("[deleteOrder Supabase delete error]:", delErr);
    }

    if (targetOrder) {
      await addAuditLog({
        actorId: deletedBy,
        action: "order.deleted",
        entity: "order",
        entityId: orderId,
        metadata: { customerId: targetOrder.customerId, amount: targetOrder.amount, transactionId: targetOrder.transactionId },
      });
    }
  } catch (err) {
    console.warn("[deleteOrder Supabase error]:", err);
  }

  // Remove from in-memory fallback array
  const memIdx = inMemoryOrders.findIndex((o) => o.id === orderId);
  if (memIdx !== -1) {
    inMemoryOrders.splice(memIdx, 1);
  }
  const entIdx = inMemoryEntitlements.findIndex((e) => e.orderId === orderId);
  if (entIdx !== -1) {
    inMemoryEntitlements.splice(entIdx, 1);
  }

  return { success: true };
}

export async function listEntitlements(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  const db = await getDb();
  if (db) {
    try {
      const targetIds = candidateIds.length > 0 ? candidateIds : [primaryId];
      return await db
        .select()
        .from(entitlements)
        .where(inArray(entitlements.userId, targetIds))
        .orderBy(desc(entitlements.grantedAt));
    } catch (err) {
      console.warn("[listEntitlements error]:", err);
    }
  }

  let rawList: any[] = [];
  if (process.env.NODE_ENV !== "test") {
    try {
      let query = supabaseServer.from("entitlements").select("*");
      if (candidateIds.length === 1) {
        query = query.eq("userId", candidateIds[0]);
      } else if (candidateIds.length > 1) {
        query = query.in("userId", candidateIds);
      } else {
        query = query.eq("userId", primaryId);
      }
      const { data, error } = await query.order("grantedAt", { ascending: false });
      if (!error && data) {
        rawList = data.map((e) => ({
          ...e,
          grantedAt: e.grantedAt ? new Date(e.grantedAt) : new Date(),
        }));
      }
    } catch (err) {
      console.warn("[listEntitlements Supabase error]:", err);
    }
  }

  if (rawList.length === 0) {
    rawList = inMemoryEntitlements.filter((e) => candidateIds.includes(e.userId) || e.userId === primaryId);
  }

  try {
    const { getManualAccessRecord, isManualRecordActive } = await import("../../userManagement");
    const manualCourse = await getManualAccessRecord(primaryId, "course");
    if (manualCourse?.isOverrideBlocked) {
      rawList = rawList.filter((e: any) =>
        e.scope !== "course" && e.scope !== "bundle:2" && e.bundleId !== 2
      );
    } else if (isManualRecordActive(manualCourse)) {
      const hasCourse = rawList.some((e: any) =>
        e.scope === "course" || e.scope === "bundle:2" || e.bundleId === 2
      );
      if (!hasCourse) {
        rawList = [
          {
            id: 999000 + primaryId,
            userId: primaryId,
            orderId: 99999,
            bundleId: 2,
            bundleSlug: "course-ebook",
            scope: "course",
            grantedAt: manualCourse.startDate ? new Date(manualCourse.startDate) : new Date(),
            isVirtualManual: true,
          },
          ...rawList,
        ];
      }
    }
  } catch (err) {}

  return rawList;
}

export async function grantManualEntitlement(userId: number, scope: string, bundleId?: number, productId?: number) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      await db.insert(entitlements).values({
        userId,
        orderId: 0,
        bundleId: bundleId || null,
        productId: productId || null,
        scope,
        grantedAt: now,
      });
    } catch (err) {
      console.warn("[grantManualEntitlement error]:", err);
    }
  }

  // Supabase insert
  try {
    await supabaseServer.from("entitlements").insert({
      userId,
      orderId: 0,
      bundleId: bundleId || null,
      productId: productId || null,
      scope,
      grantedAt: now.toISOString(),
    });
  } catch (err) {
    console.warn("[grantManualEntitlement Supabase error]:", err);
  }

  inMemoryEntitlements.push({
    id: entitlementAutoId++,
    userId,
    orderId: 0,
    bundleId: bundleId || null,
    productId: productId || null,
    scope,
    grantedAt: now,
  });
  return true;
}

export async function revokeEntitlement(entitlementId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(entitlements).where(eq(entitlements.id, entitlementId));
    } catch (err) {
      console.warn("[revokeEntitlement error]:", err);
    }
  }

  // Supabase delete
  try {
    await supabaseServer.from("entitlements").delete().eq("id", entitlementId);
  } catch (err) {
    console.warn("[revokeEntitlement Supabase error]:", err);
  }

  const idx = inMemoryEntitlements.findIndex((e) => e.id === entitlementId);
  if (idx !== -1) inMemoryEntitlements.splice(idx, 1);
  return true;
}
