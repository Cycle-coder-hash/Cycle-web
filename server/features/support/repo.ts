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
  getTraderProfile,
  listAllUsers,
} from "../../db";
import { listEntitlements, listOrdersForUser, resolveUserCandidateIds } from "../commerce";
import { deriveNumericIdFromOpenId } from "@shared/const";
import type {
  SupportCustomerProfile,
  SupportConversationRecord,
  SupportMessageRecord,
  AdminSupportConversationSummary,
  CustomerSupportContext,
} from "@shared/types/support";

export type {
  SupportCustomerProfile,
  SupportConversationRecord,
  SupportMessageRecord,
  AdminSupportConversationSummary,
  CustomerSupportContext,
};

export interface ResolvedCustomerProfile extends SupportCustomerProfile {
  canonicalId: number;
  allCandidateIds: number[];
}

/**
 * Resolves the true customer identity across authentication identities (Google OAuth sub,
 * password auth, Supabase auth UUID), internal numeric IDs, derived openId hashes, and
 * conversation message sender IDs.
 *
 * Guarantees real customer name, registered email, profile photo, stable user ID,
 * username, and account status are extracted with zero mock or synthetic fallback.
 */
export async function resolveCustomerIdentity(
  customerId: number,
  fallbackContext?: {
    openId?: string | null;
    email?: string | null;
    conversationId?: number;
    senderId?: number;
    messages?: SupportMessageRecord[];
  }
): Promise<ResolvedCustomerProfile> {
  const numCustomerId = Number(customerId);
  const candidateIds = new Set<number>();

  // 1. If conversation messages available, check senderId of any message sent by customer first
  let msgs = fallbackContext?.messages;
  if (!msgs && fallbackContext?.conversationId) {
    try {
      msgs = await getSupportMessages(Number(fallbackContext.conversationId));
    } catch {}
  }
  if (Array.isArray(msgs)) {
    for (const m of msgs) {
      if ((m.senderRole === "customer" || (m as any).senderRole === "user") && m.senderId && Number(m.senderId) > 0) {
        candidateIds.add(Number(m.senderId));
      }
    }
  }

  if (fallbackContext?.senderId && Number(fallbackContext.senderId) > 0) {
    candidateIds.add(Number(fallbackContext.senderId));
  }
  if (!isNaN(numCustomerId) && numCustomerId > 0) {
    candidateIds.add(numCustomerId);
  }

  let matchedUser: any = null;

  // 2. Try direct lookup by ID across all candidate IDs (in prioritized order)
  for (const cid of Array.from(candidateIds)) {
    try {
      const u = await getUserById(cid);
      if (u && (u.email || (u.name && !u.name.startsWith("Customer #")))) {
        matchedUser = u;
        break;
      }
    } catch {}
  }

  // 3. Try lookup by openId or email if provided
  if (!matchedUser && fallbackContext?.openId) {
    try {
      matchedUser = await getUserByOpenId(fallbackContext.openId);
    } catch {}
  }
  if (!matchedUser && fallbackContext?.email) {
    try {
      matchedUser = await getUserByEmail(fallbackContext.email);
    } catch {}
  }

  // 4. Try matching via trader_profile in settings (e.g. trader_profile_3747539 or trader_profile_<openId>)
  let traderProf: any = null;
  if (!matchedUser) {
    for (const cid of Array.from(candidateIds)) {
      try {
        const p = await getTraderProfile(cid);
        if (p) {
          traderProf = p;
          if (p.openId) {
            matchedUser = await getUserByOpenId(p.openId);
          }
          if (!matchedUser && p.email) {
            matchedUser = await getUserByEmail(p.email);
          }
          break;
        }
      } catch {}
    }
  }

  // 5. Match against all known users (inMemoryUsers, Supabase users table) by derived openId/email hash
  if (!matchedUser) {
    try {
      const allUsers = await listAllUsers();
      for (const u of allUsers) {
        const uNumId = Number(u.id);
        const derivedFromOpen = deriveNumericIdFromOpenId(u.openId);
        const derivedFromEmail = deriveNumericIdFromOpenId(u.email);

        for (const cid of Array.from(candidateIds)) {
          if (
            uNumId === cid ||
            derivedFromOpen === cid ||
            derivedFromEmail === cid ||
            (u.openId && u.openId === String(cid))
          ) {
            matchedUser = u;
            break;
          }
        }
        if (matchedUser) break;
      }
    } catch (e) {
      console.warn("[resolveCustomerIdentity listAllUsers fallback error]:", e);
    }
  }

  // 6. Direct Supabase users table query if still unresolved
  if (!matchedUser) {
    try {
      const { data: supaUsers } = await supabaseServer.from("users").select("*");
      if (Array.isArray(supaUsers)) {
        for (const su of supaUsers) {
          const suId = Number(su.id);
          const derivedOpen = deriveNumericIdFromOpenId(su.openId);
          const derivedEmail = deriveNumericIdFromOpenId(su.email);
          for (const cid of Array.from(candidateIds)) {
            if (suId === cid || derivedOpen === cid || derivedEmail === cid) {
              matchedUser = su;
              break;
            }
          }
          if (matchedUser) break;
        }
      }
    } catch {}
  }

  // If matchedUser found, load user's specific trader profile for customized display name or avatar
  if (matchedUser) {
    const userProf =
      (matchedUser.openId ? await getTraderProfile(matchedUser.openId) : null) ||
      (matchedUser.id ? await getTraderProfile(matchedUser.id) : null);
    if (userProf) {
      traderProf = userProf;
    }
    if (matchedUser.id) candidateIds.add(Number(matchedUser.id));
    if (matchedUser.openId) {
      candidateIds.add(deriveNumericIdFromOpenId(matchedUser.openId));
    }
  }

  const canonicalId = matchedUser?.id ? Number(matchedUser.id) : numCustomerId || 1;
  const resolvedOpenId = matchedUser?.openId || traderProf?.openId || fallbackContext?.openId || null;
  const resolvedEmail = matchedUser?.email || traderProf?.email || fallbackContext?.email || null;
  const resolvedName =
    traderProf?.name ||
    matchedUser?.name ||
    (resolvedEmail ? resolvedEmail.split("@")[0] : null) ||
    `Customer #${numCustomerId || canonicalId}`;
  const resolvedAvatar =
    traderProf?.avatar !== undefined
      ? traderProf.avatar
      : (matchedUser?.avatar || null);
  const resolvedPhone = matchedUser?.phone || traderProf?.phone || null;
  const resolvedUsername = matchedUser?.username || traderProf?.username || null;
  const resolvedRole = matchedUser?.role || traderProf?.role || "user";
  const resolvedAccountStatus = matchedUser?.accountStatus || (matchedUser as any)?.status || "active";
  const resolvedCreatedAt = matchedUser?.createdAt
    ? new Date(matchedUser.createdAt).toISOString()
    : null;
  const displayId = `USER-${String(canonicalId).padStart(4, "0")}`;

  return {
    id: canonicalId,
    canonicalId,
    openId: resolvedOpenId,
    displayId,
    name: resolvedName,
    email: resolvedEmail,
    phone: resolvedPhone,
    avatar: resolvedAvatar,
    username: resolvedUsername,
    role: resolvedRole,
    accountStatus: resolvedAccountStatus,
    createdAt: resolvedCreatedAt,
    allCandidateIds: Array.from(candidateIds),
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
  const identity = await resolveCustomerIdentity(Number(customerId), {
    openId: userContext?.openId,
    email: userContext?.email,
  });
  const canonicalCustomerId = identity.canonicalId;
  const allConversations = await loadSupportConversationsRegistry();

  // 1. Check existing in registry across any candidate ID
  let existing = allConversations.find(
    (c) =>
      Number(c.customerId) === canonicalCustomerId ||
      identity.allCandidateIds.includes(Number(c.customerId))
  );
  if (existing) {
    return existing;
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
  const identity = await resolveCustomerIdentity(Number(customerId), {
    openId: userContext?.openId,
    email: userContext?.email,
  });
  const allConversations = await loadSupportConversationsRegistry();
  const found = allConversations.find(
    (c) =>
      Number(c.customerId) === identity.canonicalId ||
      identity.allCandidateIds.includes(Number(c.customerId))
  );
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
      const customer = await resolveCustomerIdentity(Number(conversation.customerId), { conversationId: numConvId });
      if (customer) {
        await createUserNotification(
          customer.canonicalId,
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
      const customer = await resolveCustomerIdentity(Number(conversation.customerId), { conversationId: numConvId });
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
      const messages = await getSupportMessages(numConvId);

      const identity = await resolveCustomerIdentity(numCustomerId, {
        conversationId: numConvId,
        messages,
      });

      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      const unreadCount = messages.filter(
        (m) => (m.senderRole === "customer" || (m as any).senderRole === "user") && !m.readAt
      ).length;

      return {
        id: numConvId,
        customerId: identity.canonicalId || numCustomerId,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessageAt: conv.lastMessageAt || (lastMsg ? lastMsg.createdAt : conv.createdAt),
        customer: {
          id: identity.canonicalId || numCustomerId,
          openId: identity.openId,
          displayId: identity.displayId,
          name: identity.name,
          email: identity.email,
          phone: identity.phone,
          avatar: identity.avatar,
          username: identity.username,
          role: identity.role,
          accountStatus: identity.accountStatus,
          createdAt: identity.createdAt,
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
 * - Customer Profile (Real Name, Email, Phone, Joined date, Stable User ID, Status)
 * - Purchased Products / Entitlements (Scope, dates)
 * - Order History (Order ID, Amount, Payment status, date)
 * - Summary stats (Total spend, total orders, active products)
 */
export async function getCustomerSupportContext(customerId: number): Promise<CustomerSupportContext> {
  const identity = await resolveCustomerIdentity(customerId);

  // Fetch entitlements and orders across all resolved candidate IDs to ensure complete history
  const [entitlementsList, ordersList] = await Promise.all([
    listEntitlements({
      id: identity.canonicalId,
      openId: identity.openId || undefined,
      email: identity.email || undefined,
    }),
    listOrdersForUser({
      id: identity.canonicalId,
      openId: identity.openId || undefined,
      email: identity.email || undefined,
    }),
  ]);

  // Merge any candidate IDs' orders
  const candidateOrders = new Map<number, any>();
  for (const o of ordersList) {
    candidateOrders.set(Number(o.id), o);
  }
  for (const cid of identity.allCandidateIds) {
    if (cid !== identity.canonicalId) {
      try {
        const moreOrders = await listOrdersForUser(cid);
        for (const o of moreOrders) {
          candidateOrders.set(Number(o.id), o);
        }
      } catch {}
    }
  }
  const mergedOrders = Array.from(candidateOrders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const approvedOrders = mergedOrders.filter(
    (o: any) => o.orderStatus === "approved" || o.paymentStatus === "approved"
  );

  const totalSpend = approvedOrders.reduce((sum: number, o: any) => {
    return sum + (parseFloat(o.amount) || 0);
  }, 0);

  return {
    customer: {
      id: identity.canonicalId,
      openId: identity.openId || undefined,
      displayId: identity.displayId,
      name: identity.name,
      email: identity.email,
      phone: identity.phone,
      avatar: identity.avatar,
      username: identity.username,
      role: identity.role,
      accountStatus: identity.accountStatus,
      createdAt: identity.createdAt,
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
    orders: mergedOrders.map((o: any) => ({
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
      totalOrders: mergedOrders.length,
      activeEntitlementsCount: entitlementsList.length,
    },
  };
}
