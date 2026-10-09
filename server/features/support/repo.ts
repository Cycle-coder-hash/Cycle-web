import { and, eq, isNull, ne } from "drizzle-orm";
import {
  supportConversations,
  supportMessages,
} from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { getSetting, setSetting } from "../../infra/db/settings";
import { supabaseServer } from "../../infra/db/supabase";
import { sendEmail } from "../../infra/email";
import {
  getUserById,
  getUserByOpenId,
  getUserByEmail,
  createUserNotification,
  inMemoryUsers,
} from "../../db";
import { listEntitlements, listOrdersForUser } from "../commerce";

export interface SupportConversationRecord {
  id: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

export interface SupportMessageRecord {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: "customer" | "admin";
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface AdminSupportConversationSummary {
  id: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  customer: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    createdAt: string | null;
  };
  lastMessage: SupportMessageRecord | null;
  unreadCount: number;
  totalMessages: number;
}

export interface CustomerSupportContext {
  customer: {
    id: number;
    openId?: string;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    createdAt: string | null;
  };
  entitlements: Array<{
    id: number;
    orderId?: number;
    productId?: number;
    bundleId?: number;
    scope: string;
    productTitle?: string;
    grantedAt: string;
  }>;
  orders: Array<{
    id: number;
    amount: string;
    currency: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    bundleId?: number | null;
    productId?: number | null;
    selectedPdfIds?: number[];
    createdAt: string;
  }>;
  stats: {
    totalSpend: number;
    totalOrders: number;
    activeEntitlementsCount: number;
  };
}

export const inMemoryConversations: any[] = [];
export const inMemoryMessages: any[] = [];
let conversationAutoId = 1001;
let messageAutoId = 1;

/**
 * Loads all support conversations from persistent settings and memory.
 */
async function loadSupportConversationsRegistry(): Promise<SupportConversationRecord[]> {
  try {
    const raw = await getSetting("support_conversations_registry");
    if (raw) {
      const list = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(list)) {
        const normalized: SupportConversationRecord[] = list.map((item: any) => ({
          id: Number(item.id),
          customerId: Number(item.customerId),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          lastMessageAt: item.lastMessageAt || null,
        }));
        for (const item of normalized) {
          if (!inMemoryConversations.some((c) => Number(c.id) === Number(item.id))) {
            inMemoryConversations.push(item);
          }
        }
        return normalized;
      }
    }
  } catch (err) {
    console.warn("[loadSupportConversationsRegistry error]:", err);
  }
  return inMemoryConversations;
}

/**
 * Persists support conversations registry to memory and settings.
 */
async function saveSupportConversationsRegistry(conversations: SupportConversationRecord[]): Promise<void> {
  try {
    await setSetting("support_conversations_registry", JSON.stringify(conversations));
  } catch (err) {
    console.warn("[saveSupportConversationsRegistry error]:", err);
  }
}

/**
 * Gets or creates the SINGLE permanent support conversation for a customer.
 * Lifetime guarantee: One customer = One permanent conversation.
 */
export async function getOrCreateSupportConversation(
  customerId: number,
  userContext?: { id?: number; openId?: string | null; email?: string | null }
): Promise<SupportConversationRecord> {
  let canonicalCustomerId = Number(customerId);
  const allConversations = await loadSupportConversationsRegistry();

  // Try to resolve user details to guarantee canonical ID binding
  let matchedUser: any = null;
  try {
    matchedUser = await getUserById(canonicalCustomerId);
    if (!matchedUser && userContext?.openId) {
      matchedUser = await getUserByOpenId(userContext.openId);
    }
    if (!matchedUser && userContext?.email) {
      matchedUser = await getUserByEmail(userContext.email);
    }
    if (!matchedUser) {
      for (const u of Array.from(inMemoryUsers.values())) {
        if (
          Number(u.id) === canonicalCustomerId ||
          (userContext?.openId && u.openId === userContext.openId) ||
          (userContext?.email && u.email?.toLowerCase() === userContext.email.toLowerCase())
        ) {
          matchedUser = u;
          break;
        }
      }
    }
    if (matchedUser?.id) {
      canonicalCustomerId = Number(matchedUser.id);
    }
  } catch {}

  // 1. Check existing in registry
  let existing = allConversations.find((c) => Number(c.customerId) === canonicalCustomerId);
  if (existing) {
    return existing;
  }

  // Also check if any existing conversation matches user's other potential ID
  if (matchedUser) {
    existing = allConversations.find((c) => Number(c.customerId) === Number(matchedUser.id));
    if (existing) {
      return existing;
    }
  }

  // 2. Check Postgres DB if active
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(supportConversations)
        .where(eq(supportConversations.customerId, canonicalCustomerId))
        .limit(1);
      if (rows && rows[0]) {
        const conv: SupportConversationRecord = {
          id: Number(rows[0].id),
          customerId: Number(rows[0].customerId),
          createdAt: rows[0].createdAt ? new Date(rows[0].createdAt).toISOString() : new Date().toISOString(),
          updatedAt: rows[0].updatedAt ? new Date(rows[0].updatedAt).toISOString() : new Date().toISOString(),
          lastMessageAt: rows[0].lastMessageAt ? new Date(rows[0].lastMessageAt).toISOString() : null,
        };
        allConversations.push(conv);
        await saveSupportConversationsRegistry(allConversations);
        return conv;
      }
    } catch (err) {
      console.warn("[getOrCreateSupportConversation db select fallback]:", err);
    }
  }

  // 3. Create new single permanent conversation record
  const now = new Date().toISOString();
  let maxId = 0;
  for (const c of allConversations) {
    if (Number(c.id) > maxId) maxId = Number(c.id);
  }
  const newId = Math.max(maxId + 1, conversationAutoId++);

  const newConv: SupportConversationRecord = {
    id: newId,
    customerId: canonicalCustomerId,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: null,
  };

  allConversations.push(newConv);
  if (!inMemoryConversations.some((c) => Number(c.id) === newConv.id)) {
    inMemoryConversations.push(newConv);
  }
  await saveSupportConversationsRegistry(allConversations);

  // Try DB insert if available
  if (db) {
    try {
      await db.insert(supportConversations).values({
        id: newId,
        customerId: canonicalCustomerId,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        lastMessageAt: null,
      });
    } catch (err) {
      console.warn("[getOrCreateSupportConversation db insert notice]:", err);
    }
  }

  // Try Supabase table insert
  try {
    await supabaseServer.from("supportConversations").insert({
      id: newId,
      customerId: canonicalCustomerId,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: null,
    });
  } catch {}

  return newConv;
}

/**
 * Gets a support conversation by customerId (or null if not created).
 */
export async function getSupportConversation(
  customerId: number,
  userContext?: { id?: number; openId?: string | null; email?: string | null }
): Promise<SupportConversationRecord | null> {
  let canonicalCustomerId = Number(customerId);
  try {
    const userObj = await getUserById(canonicalCustomerId);
    if (userObj?.id) canonicalCustomerId = Number(userObj.id);
  } catch {}
  const allConversations = await loadSupportConversationsRegistry();
  const found = allConversations.find((c) => Number(c.customerId) === canonicalCustomerId);
  return found || null;
}

/**
 * Gets a support conversation by its conversationId.
 */
export async function getSupportConversationById(conversationId: number): Promise<SupportConversationRecord | null> {
  const numId = Number(conversationId);
  const allConversations = await loadSupportConversationsRegistry();
  const found = allConversations.find((c) => Number(c.id) === numId);
  return found || null;
}

/**
 * Fetches all messages for a conversation in chronological order (createdAt ASC).
 */
export async function getSupportMessages(conversationId: number): Promise<SupportMessageRecord[]> {
  const numId = Number(conversationId);
  const key = `support_messages_${numId}`;
  let messages: SupportMessageRecord[] = [];

  try {
    const raw = await getSetting(key);
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        messages = parsed.map((m: any) => ({
          id: Number(m.id),
          conversationId: Number(m.conversationId),
          senderId: Number(m.senderId),
          senderRole: m.senderRole,
          message: m.message,
          readAt: m.readAt || null,
          createdAt: m.createdAt,
        }));
      }
    }
  } catch (err) {
    console.warn(`[getSupportMessages getSetting error for ${key}]:`, err);
  }

  // If empty, try Supabase table or Drizzle
  if (messages.length === 0) {
    try {
      const { data, error } = await supabaseServer
        .from("supportMessages")
        .select("*")
        .eq("conversationId", numId)
        .order("createdAt", { ascending: true });
      if (!error && data && data.length > 0) {
        messages = data.map((m: any) => ({
          id: Number(m.id),
          conversationId: Number(m.conversationId),
          senderId: Number(m.senderId),
          senderRole: m.senderRole,
          message: m.message,
          readAt: m.readAt || null,
          createdAt: m.createdAt,
        }));
        await setSetting(key, JSON.stringify(messages));
      }
    } catch {}
  }

  // Merge any in-memory messages for this conversation
  const memMsgs = inMemoryMessages.filter((m) => Number(m.conversationId) === numId);
  for (const m of memMsgs) {
    if (!messages.some((existing) => Number(existing.id) === Number(m.id))) {
      messages.push(m);
    }
  }

  // Enforce chronological sorting
  messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return messages;
}

/**
 * Sends a new support message (either customer to admin or admin to customer).
 * Real-time broadcast + persistence + notification + email dispatch.
 */
export async function sendSupportMessage(input: {
  conversationId?: number;
  customerId?: number;
  senderId: number;
  senderRole: "customer" | "admin";
  message: string;
}): Promise<SupportMessageRecord> {
  const trimmed = input.message.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty");
  }

  let conversation: SupportConversationRecord | null = null;
  if (input.conversationId) {
    conversation = await getSupportConversationById(Number(input.conversationId));
  }
  if (!conversation && input.customerId) {
    conversation = await getSupportConversation(Number(input.customerId));
  }
  if (!conversation && input.customerId) {
    conversation = await getOrCreateSupportConversation(Number(input.customerId));
  }
  if (!conversation) {
    throw new Error(`Conversation #${input.conversationId || input.customerId} not found`);
  }

  const numConvId = Number(conversation.id);

  const now = new Date().toISOString();
  const existingMessages = await getSupportMessages(numConvId);

  let maxId = 0;
  for (const m of existingMessages) {
    if (Number(m.id) > maxId) maxId = Number(m.id);
  }
  for (const m of inMemoryMessages) {
    if (Number(m.id) > maxId) maxId = Number(m.id);
  }
  const newMsgId = Math.max(maxId + 1, messageAutoId++);

  const messageRecord: SupportMessageRecord = {
    id: newMsgId,
    conversationId: numConvId,
    senderId: Number(input.senderId),
    senderRole: input.senderRole,
    message: trimmed,
    readAt: null,
    createdAt: now,
  };

  // 1. Save message to settings array
  existingMessages.push(messageRecord);
  inMemoryMessages.push(messageRecord);
  await setSetting(`support_messages_${numConvId}`, JSON.stringify(existingMessages));

  // 2. Update conversation timestamps
  conversation.lastMessageAt = now;
  conversation.updatedAt = now;
  const allConversations = await loadSupportConversationsRegistry();
  const idx = allConversations.findIndex((c) => Number(c.id) === numConvId);
  if (idx !== -1) {
    allConversations[idx] = conversation;
  } else {
    allConversations.push(conversation);
  }
  await saveSupportConversationsRegistry(allConversations);

  // 3. Persist to DB / Supabase table if available
  const db = await getDb();
  if (db) {
    try {
      await db.insert(supportMessages).values({
        id: newMsgId,
        conversationId: numConvId,
        senderId: Number(input.senderId),
        senderRole: input.senderRole,
        message: trimmed,
        readAt: null,
        createdAt: new Date(now),
      });
      await db
        .update(supportConversations)
        .set({ lastMessageAt: new Date(now), updatedAt: new Date(now) })
        .where(eq(supportConversations.id, numConvId));
    } catch (err) {
      console.warn("[sendSupportMessage db insert notice]:", err);
    }
  }

  try {
    await supabaseServer.from("supportMessages").insert({
      id: newMsgId,
      conversationId: numConvId,
      senderId: Number(input.senderId),
      senderRole: input.senderRole,
      message: trimmed,
      readAt: null,
      createdAt: now,
    });
    await supabaseServer
      .from("supportConversations")
      .update({ lastMessageAt: now, updatedAt: now })
      .eq("id", numConvId);
  } catch {}

  // 4. Real-time Broadcast via Supabase channels (properly awaited)
  try {
    // Broadcast to customer chat channel
    const chatChannel = supabaseServer.channel(`support_chat_${numConvId}`);
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 600);
      chatChannel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await chatChannel.send({
              type: "broadcast",
              event: "new_message",
              payload: messageRecord,
            });
          } catch {}
          clearTimeout(timer);
          resolve();
        }
      });
    });

    // Broadcast to global admin inbox
    const adminInboxChannel = supabaseServer.channel("admin_support_inbox");
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 600);
      adminInboxChannel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await adminInboxChannel.send({
              type: "broadcast",
              event: "conversation_updated",
              payload: {
                conversationId: numConvId,
                lastMessage: messageRecord,
              },
            });
          } catch {}
          clearTimeout(timer);
          resolve();
        }
      });
    });
  } catch (broadcastErr) {
    console.warn("[sendSupportMessage broadcast notice]:", broadcastErr);
  }

  // 5. Notifications & Email Boundary
  if (input.senderRole === "admin") {
    // Admin replied -> Notify customer
    try {
      const customer = await getUserById(Number(conversation.customerId));
      if (customer) {
        await createUserNotification(
          customer.id,
          "New Message from Support",
          trimmed.length > 80 ? trimmed.slice(0, 77) + "..." : trimmed
        );
        if (customer.email) {
          await sendEmail({
            to: customer.email,
            event: "support_reply",
            templateData: {
              customerName: customer.name || "Trader",
              replyMessage: trimmed,
              supportUrl: `${process.env.APP_URL || ""}/support`,
            },
          });
        }
      }
    } catch (notifErr) {
      console.warn("[sendSupportMessage admin reply notification notice]:", notifErr);
    }
  } else {
    // Customer sent message -> Notify Admin
    try {
      const customer = await getUserById(Number(conversation.customerId));
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          event: "customer_message",
          templateData: {
            customerName: customer?.name || `Customer #${conversation.customerId}`,
            customerEmail: customer?.email || "Unknown",
            message: trimmed,
          },
        });
      }
    } catch (notifErr) {
      console.warn("[sendSupportMessage customer notification notice]:", notifErr);
    }
  }

  return messageRecord;
}

/**
 * Marks unread messages in a conversation as read by the specified role.
 */
export async function markSupportConversationRead(
  conversationId: number,
  readerRole: "customer" | "admin"
): Promise<{ success: boolean; count: number }> {
  const numId = Number(conversationId);
  const key = `support_messages_${numId}`;
  const messages = await getSupportMessages(numId);
  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const m of messages) {
    // Mark messages sent by the opposite party that are unread
    if (m.senderRole !== readerRole && !m.readAt) {
      m.readAt = now;
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    await setSetting(key, JSON.stringify(messages));

    // Update in-memory messages
    for (const m of inMemoryMessages) {
      if (Number(m.conversationId) === numId && m.senderRole !== readerRole && !m.readAt) {
        m.readAt = now;
      }
    }

    // Update DB
    const db = await getDb();
    if (db) {
      try {
        await db
          .update(supportMessages)
          .set({ readAt: new Date(now) })
          .where(
            and(
              eq(supportMessages.conversationId, numId),
              ne(supportMessages.senderRole, readerRole),
              isNull(supportMessages.readAt)
            )
          );
      } catch {}
    }

    try {
      await supabaseServer
        .from("supportMessages")
        .update({ readAt: now })
        .eq("conversationId", numId)
        .neq("senderRole", readerRole)
        .is("readAt", null);

      const channel = supabaseServer.channel(`support_chat_${numId}`);
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => resolve(), 600);
        channel.subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            try {
              await channel.send({
                type: "broadcast",
                event: "messages_read",
                payload: { conversationId: numId, readerRole, readAt: now },
              });
            } catch {}
            clearTimeout(timer);
            resolve();
          }
        });
      });
    } catch {}
  }

  return { success: true, count: updatedCount };
}

/**
 * Lists all customer conversations for the Admin Support Workspace.
 * Sorted by latest message / update on top.
 */
export async function listAdminSupportConversations(): Promise<AdminSupportConversationSummary[]> {
  const allConversations = await loadSupportConversationsRegistry();

  const summaries: AdminSupportConversationSummary[] = await Promise.all(
    allConversations.map(async (conv) => {
      const numConvId = Number(conv.id);
      const numCustomerId = Number(conv.customerId);
      const [customer, messages] = await Promise.all([
        getUserById(numCustomerId),
        getSupportMessages(numConvId),
      ]);

      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      const unreadCount = messages.filter(
        (m) => (m.senderRole === "customer" || (m as any).senderRole === "user") && !m.readAt
      ).length;

      return {
        id: numConvId,
        customerId: numCustomerId,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessageAt: conv.lastMessageAt || (lastMsg ? lastMsg.createdAt : conv.createdAt),
        customer: {
          id: numCustomerId,
          name: customer?.name || `Customer #${numCustomerId}`,
          email: customer?.email || null,
          phone: customer?.phone || null,
          avatar: (customer as any)?.avatar || null,
          createdAt: customer?.createdAt ? new Date(customer.createdAt).toISOString() : null,
        },
        lastMessage: lastMsg,
        unreadCount,
        totalMessages: messages.length,
      };
    })
  );

  // Sort: Unread messages or newest activity first
  summaries.sort((a, b) => {
    const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  return summaries;
}

/**
 * Retrieves the comprehensive customer context panel for the Admin Workspace:
 * - Customer Profile (Name, Email, Phone, Joined date)
 * - Purchased Products / Entitlements (Scope, dates)
 * - Order History (Order ID, Amount, Payment status, date)
 * - Summary stats (Total spend, total orders, active products)
 */
export async function getCustomerSupportContext(customerId: number): Promise<CustomerSupportContext> {
  const customer = await getUserById(customerId);
  const entitlementsList = await listEntitlements(customerId);
  const ordersList = await listOrdersForUser(customerId);

  const approvedOrders = ordersList.filter(
    (o: any) => o.orderStatus === "approved" || o.paymentStatus === "approved"
  );

  const totalSpend = approvedOrders.reduce((sum: number, o: any) => {
    return sum + (parseFloat(o.amount) || 0);
  }, 0);

  return {
    customer: {
      id: customerId,
      openId: customer?.openId,
      name: customer?.name || `Customer #${customerId}`,
      email: customer?.email || null,
      phone: customer?.phone || null,
      avatar: (customer as any)?.avatar || null,
      role: customer?.role || "user",
      createdAt: customer?.createdAt ? new Date(customer.createdAt).toISOString() : null,
    },
    entitlements: entitlementsList.map((e: any) => ({
      id: e.id,
      orderId: e.orderId,
      productId: e.productId,
      bundleId: e.bundleId,
      scope: e.scope || "",
      productTitle: e.scope?.replace("bundle:", "Bundle #")?.replace("product:", "Product #") || "Access Pass",
      grantedAt: e.grantedAt ? new Date(e.grantedAt).toISOString() : new Date().toISOString(),
    })),
    orders: ordersList.map((o: any) => ({
      id: o.id,
      amount: String(o.amount || "0"),
      currency: o.currency || "BDT",
      paymentMethod: o.paymentMethod || "manual",
      paymentStatus: o.paymentStatus || "pending",
      orderStatus: o.orderStatus || "pending",
      bundleId: o.bundleId || null,
      productId: o.productId || null,
      selectedPdfIds: o.selectedPdfIds || [],
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    })),
    stats: {
      totalSpend,
      totalOrders: ordersList.length,
      activeEntitlementsCount: entitlementsList.length,
    },
  };
}
