import { Router } from "express";
import {
  getDb,
  listAllOrders,
  approveOrder,
  rejectOrder,
  deleteOrder,
  listAllUsers,
  getOrCreateSupportConversation,
  getSupportConversation,
  getSupportConversationById,
  getSupportMessages,
  sendSupportMessage,
  markSupportConversationRead,
  listAdminSupportConversations,
  getCustomerSupportContext,
  listAuditLogs,
  updateUserRole,
  grantManualEntitlement,
  revokeEntitlement,
  orders,
  users,
  entitlements,
  auditEvents,
  notifications,
  settings,
  listFreeEbooks,
  createFreeEbook,
  updateFreeEbook,
  deleteFreeEbook,
  getOwnerProfile,
  updateOwnerProfile,
  getPaymentGateways,
  updatePaymentGateways,
  getCourseTelegramPopupConfig,
  setCourseTelegramPopupConfig,
} from "./db";
import { eq } from "drizzle-orm";
import { sendAccessEmail } from "./email";

export const adminRouter = Router();

// Middleware for Admin Key verification
adminRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// GET /api/admin/stats
adminRouter.get("/stats", async (req, res) => {
  try {
    const allOrders = await listAllOrders();
    const allUsers = await listAllUsers();
    const allConversations = await listAdminSupportConversations();
    const unreadConversations = allConversations.filter((c: any) => c.unreadCount > 0);

    const approvedOrders = allOrders.filter((o: any) => o.orderStatus === "approved");
    const pendingOrders = allOrders.filter((o: any) => o.orderStatus === "pending");
    const rejectedOrders = allOrders.filter((o: any) => o.orderStatus === "rejected");

    const totalRevenue = approvedOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0);
    const pendingRevenue = pendingOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0);

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        pendingRevenue,
        totalOrders: allOrders.length,
        approvedOrdersCount: approvedOrders.length,
        pendingOrdersCount: pendingOrders.length,
        rejectedOrdersCount: rejectedOrders.length,
        totalStudents: allUsers.length,
        totalConversationsCount: allConversations.length,
        unreadConversationsCount: unreadConversations.length,
        openTicketsCount: unreadConversations.length,
        resolvedTicketsCount: allConversations.length - unreadConversations.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/orders
adminRouter.get("/orders", async (req, res) => {
  try {
    const allOrders = await listAllOrders();
    const allUsers = await listAllUsers();
    const usersMap = new Map(allUsers.map((u: any) => [u.id, u]));

    const enrichedOrders = allOrders.map((o: any) => {
      const user = usersMap.get(o.customerId);
      return {
        ...o,
        customerName: user?.name || o.customerName || undefined,
        customerEmail: user?.email || o.customerEmail || undefined,
        customerPhone: user?.phone || o.customerPhone || undefined,
      };
    });

    return res.json({ success: true, orders: enrichedOrders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/users
adminRouter.get("/users", async (req, res) => {
  try {
    const allUsers = await listAllUsers();
    const allOrders = await listAllOrders();

    const usersWithStats = allUsers.map((u: any) => {
      const userOrders = allOrders.filter((o: any) => o.customerId === u.id);
      return {
        ...u,
        ordersCount: userOrders.length,
        totalSpent: userOrders
          .filter((o: any) => o.orderStatus === "approved")
          .reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0),
      };
    });

    return res.json({ success: true, users: usersWithStats });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});



// GET /api/admin/audit-logs
adminRouter.get("/audit-logs", async (req, res) => {
  try {
    const allLogs = await listAuditLogs();
    return res.json({ success: true, logs: allLogs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/approve-order
adminRouter.post("/approve-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, error: "orderId is required" });

    await approveOrder(Number(orderId), 1);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/reject-order
adminRouter.post("/reject-order", async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId) return res.status(400).json({ success: false, error: "orderId is required" });

    await rejectOrder(Number(orderId), reason || "Payment verification failed", 1);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/delete-order
adminRouter.post("/delete-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, error: "orderId is required" });

    await deleteOrder(Number(orderId), 1);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/grant-access
adminRouter.post("/grant-access", async (req, res) => {
  try {
    const { userId, bundleId, productId, scope } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: "userId is required" });

    const calculatedScope = scope || (bundleId ? `bundle:${bundleId}` : `product:${productId || 1}`);
    await grantManualEntitlement(userId, calculatedScope, bundleId, productId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/update-role
adminRouter.post("/update-role", async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ success: false, error: "userId and role are required" });

    await updateUserRole(userId, role);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------------------------------------------------------
// SUPPORT MESSAGING ROUTES
// --------------------------------------------------------------------------

// GET /api/admin/support/conversations
adminRouter.get("/support/conversations", async (req, res) => {
  try {
    const conversations = await listAdminSupportConversations();
    return res.json({ success: true, conversations });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Legacy fallback: GET /api/admin/tickets
adminRouter.get("/tickets", async (req, res) => {
  try {
    const conversations = await listAdminSupportConversations();
    return res.json({ success: true, tickets: conversations });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/support/conversations/:id/messages
adminRouter.get("/support/conversations/:id/messages", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    if (isNaN(conversationId)) return res.status(400).json({ success: false, error: "Invalid conversationId" });

    const messages = await getSupportMessages(conversationId);
    return res.json({ success: true, messages });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/support/reply
adminRouter.post("/support/reply", async (req, res) => {
  try {
    const { conversationId, customerId, message, senderId } = req.body;
    if (!conversationId && !customerId) {
      return res.status(400).json({ success: false, error: "conversationId or customerId is required" });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: "message is required" });
    }

    const reply = await sendSupportMessage({
      conversationId: conversationId ? Number(conversationId) : undefined,
      customerId: customerId ? Number(customerId) : undefined,
      senderId: senderId ? Number(senderId) : 1,
      senderRole: "admin",
      message: String(message).trim(),
    });

    return res.json({ success: true, reply });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/support/mark-read
adminRouter.post("/support/mark-read", async (req, res) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ success: false, error: "conversationId is required" });

    const result = await markSupportConversationRead(Number(conversationId), "admin");
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/support/customer-context/:customerId
adminRouter.get("/support/customer-context/:customerId", async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    if (isNaN(customerId)) return res.status(400).json({ success: false, error: "Invalid customerId" });

    const context = await getCustomerSupportContext(customerId);
    return res.json({ success: true, context });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/support-metrics
adminRouter.get("/support-metrics", async (req, res) => {
  try {
    const conversations = await listAdminSupportConversations();
    const unread = conversations.filter((c: any) => c.unreadCount > 0);
    return res.json({
      success: true,
      metrics: {
        total: conversations.length,
        open: unread.length,
        unread: unread.length,
        solved: conversations.length - unread.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/ebooks
adminRouter.get("/ebooks", async (req, res) => {
  try {
    const ebooks = await listFreeEbooks(true);
    return res.json({ success: true, ebooks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/ebooks
adminRouter.post("/ebooks", async (req, res) => {
  try {
    const created = await createFreeEbook(req.body);
    return res.json({ success: true, ebook: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/ebooks/:id
adminRouter.put("/ebooks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateFreeEbook(id, req.body);
    return res.json({ success: true, ebook: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/ebooks/:id
adminRouter.delete("/ebooks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteFreeEbook(id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/owner-profile
adminRouter.get("/owner-profile", async (_req, res) => {
  try {
    const profile = await getOwnerProfile();
    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/owner-profile
adminRouter.post("/owner-profile", async (req, res) => {
  try {
    const profile = await updateOwnerProfile(req.body);
    return res.json({ success: true, profile });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/payment-settings
adminRouter.get("/payment-settings", async (_req, res) => {
  try {
    const gateways = await getPaymentGateways();
    return res.json({
      success: true,
      gateways: {
        bkash: {
          enabled: gateways.bkash.isEnabled,
          number: gateways.bkash.number,
          type: gateways.bkash.accountType.toLowerCase(),
          instructions: gateways.bkash.instructions,
        },
        nagad: {
          enabled: gateways.nagad.isEnabled,
          number: gateways.nagad.number,
          type: gateways.nagad.accountType.toLowerCase(),
          instructions: gateways.nagad.instructions,
        },
        rocket: {
          enabled: gateways.rocket.isEnabled,
          number: gateways.rocket.number,
          type: gateways.rocket.accountType.toLowerCase(),
          instructions: gateways.rocket.instructions,
        },
      },
      announcement: gateways.announcement,
      announcementActive: gateways.isAnnouncementEnabled,
      studentTelegramUrl: gateways.studentTelegramUrl || "https://t.me/cycleofchart",
      studentTelegramDescription: gateways.studentTelegramDescription || "Official Cycle of Chart VIP Student Telegram Community",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/payment-settings
adminRouter.post("/payment-settings", async (req, res) => {
  try {
    const b = req.body || {};
    const formatAccountType = (t?: string): "Personal" | "Merchant" | "Agent" => {
      if (!t) return "Personal";
      const lower = t.toLowerCase();
      if (lower === "merchant") return "Merchant";
      if (lower === "agent") return "Agent";
      return "Personal";
    };

    const updated = await updatePaymentGateways({
      bkash: b.bkash ? {
        number: b.bkash.number || "",
        isEnabled: b.bkash.enabled ?? b.bkash.isEnabled ?? true,
        accountType: formatAccountType(b.bkash.type || b.bkash.accountType),
        instructions: b.bkash.instructions || "",
      } : undefined,
      nagad: b.nagad ? {
        number: b.nagad.number || "",
        isEnabled: b.nagad.enabled ?? b.nagad.isEnabled ?? true,
        accountType: formatAccountType(b.nagad.type || b.nagad.accountType),
        instructions: b.nagad.instructions || "",
      } : undefined,
      rocket: b.rocket ? {
        number: b.rocket.number || "",
        isEnabled: b.rocket.enabled ?? b.rocket.isEnabled ?? true,
        accountType: formatAccountType(b.rocket.type || b.rocket.accountType),
        instructions: b.rocket.instructions || "",
      } : undefined,
      announcement: b.announcement,
      isAnnouncementEnabled: b.announcementActive ?? b.isAnnouncementEnabled,
      studentTelegramUrl: b.studentTelegramUrl,
      studentTelegramDescription: b.studentTelegramDescription,
    });

    return res.json({ success: true, gateways: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/course-telegram-settings
adminRouter.get("/course-telegram-settings", async (_req, res) => {
  try {
    const config = await getCourseTelegramPopupConfig();
    return res.json({ success: true, config });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/course-telegram-settings
adminRouter.post("/course-telegram-settings", async (req, res) => {
  try {
    const updated = await setCourseTelegramPopupConfig(req.body);
    return res.json({ success: true, config: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
