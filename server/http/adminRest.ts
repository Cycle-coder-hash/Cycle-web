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
  getLeaderboardWeights,
  saveLeaderboardWeights,
  getLeaderboardRankings,
} from "../db";
import { eq } from "drizzle-orm";
import { sendAccessEmail } from "../email";
import {
  listUsersForManagement,
  getUserDetailsForManagement,
  setUserAccess,
  clearUserAccessOverride,
  getUserAuditLogs,
} from "../features/subscription/userManagement";
import { setAccountStatus } from "../features/subscription/subscription";
import {
  reorderFreeEbooks,
  getAlbumMetadata,
  updateAlbumMetadata,
  listCourseClasses,
  createCourseClass,
  updateCourseClass,
  deleteCourseClass,
  reorderCourseClasses,
} from "../features/library";
import type { CourseId } from "../../shared/types/library";

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

// POST /api/admin/support/delete-message
adminRouter.post("/support/delete-message", async (req, res) => {
  try {
    const { conversationId, messageId } = req.body;
    if (!conversationId || !messageId) {
      return res.status(400).json({ success: false, error: "conversationId and messageId are required" });
    }
    const { getSetting, setSetting } = await import("../db");
    const key = `support_messages_${Number(conversationId)}`;
    const raw = await getSetting(key);
    const msgs = raw ? JSON.parse(raw) : [];
    const filtered = Array.isArray(msgs) ? msgs.filter((m: any) => Number(m.id) !== Number(messageId)) : [];
    await setSetting(key, JSON.stringify(filtered));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/support/delete-conversation
adminRouter.post("/support/delete-conversation", async (req, res) => {
  try {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ success: false, error: "conversationId is required" });
    }
    const { getSetting, setSetting } = await import("../db");
    const numId = Number(conversationId);
    await setSetting(`support_messages_${numId}`, JSON.stringify([]));
    const regRaw = await getSetting("support_conversations_registry");
    const list = regRaw ? JSON.parse(regRaw) : [];
    const filtered = Array.isArray(list) ? list.filter((c: any) => Number(c.id) !== numId) : [];
    await setSetting("support_conversations_registry", JSON.stringify(filtered));
    return res.json({ success: true });
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

// POST /api/admin/ebooks/reorder
adminRouter.post("/ebooks/reorder", async (req, res) => {
  try {
    const orderedIds = (req.body?.orderedIds || []).map((id: any) => Number(id));
    const reordered = await reorderFreeEbooks(orderedIds);
    return res.json({ success: true, ebooks: reordered });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// COURSE ALBUMS & CLASSES MANAGEMENT ENDPOINTS
// ============================================================================

// GET /api/admin/courses/:courseId/meta
adminRouter.get("/courses/:courseId/meta", async (req, res) => {
  try {
    const courseId = req.params.courseId as CourseId;
    const meta = await getAlbumMetadata(courseId);
    return res.json({ success: true, meta });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/courses/:courseId/meta
adminRouter.put("/courses/:courseId/meta", async (req, res) => {
  try {
    const courseId = req.params.courseId as CourseId;
    const updated = await updateAlbumMetadata(courseId, req.body || {});
    return res.json({ success: true, meta: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/courses/:courseId/classes
adminRouter.get("/courses/:courseId/classes", async (req, res) => {
  try {
    const courseId = req.params.courseId as CourseId;
    const classes = await listCourseClasses(courseId, true);
    return res.json({ success: true, classes });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/courses/:courseId/classes
adminRouter.post("/courses/:courseId/classes", async (req, res) => {
  try {
    const courseId = req.params.courseId as CourseId;
    const { title, description, videoUrl, duration, order, isPublished, resourceLink } = req.body || {};
    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, error: "Title and Video URL are required" });
    }
    const created = await createCourseClass(courseId, {
      title,
      description,
      videoUrl,
      duration,
      order: order ? Number(order) : undefined,
      isPublished,
      resourceLink,
    });
    return res.json({ success: true, class: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/courses/:courseId/classes/:classId
adminRouter.put("/courses/:courseId/classes/:classId", async (req, res) => {
  try {
    const courseId = req.params.courseId as CourseId;
    const classId = req.params.classId;
    const updated = await updateCourseClass(courseId, classId, req.body || {});
    return res.json({ success: true, class: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/courses/:courseId/classes/:classId
adminRouter.delete("/courses/:courseId/classes/:classId", async (req, res) => {
  try {
    const courseId = req.params.courseId as CourseId;
    const classId = req.params.classId;
    await deleteCourseClass(courseId, classId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/courses/:courseId/reorder
adminRouter.post("/courses/:courseId/reorder", async (req, res) => {
  try {
    const courseId = req.params.courseId as CourseId;
    const orderedClassIds = (req.body?.orderedClassIds || []).map((id: any) => String(id));
    const reordered = await reorderCourseClasses(courseId, orderedClassIds);
    return res.json({ success: true, classes: reordered });
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

// GET /api/admin/leaderboard-settings
adminRouter.get("/leaderboard-settings", async (_req, res) => {
  try {
    const weights = await getLeaderboardWeights();
    return res.json({ success: true, weights });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/leaderboard-settings
adminRouter.post("/leaderboard-settings", async (req, res) => {
  try {
    const updated = await saveLeaderboardWeights(req.body);
    return res.json({ success: true, weights: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/admin/leaderboard/recalculate
adminRouter.post("/leaderboard/recalculate", async (_req, res) => {
  try {
    const rankings = await getLeaderboardRankings("all");
    return res.json({ success: true, count: rankings.length, recalculatedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================================

// GET /api/admin/user-management/list
adminRouter.get("/user-management/list", async (req, res) => {
  try {
    const users = await listUsersForManagement(req.query as any);
    return res.json({ success: true, users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/user-management/details/:userId
adminRouter.get("/user-management/details/:userId", async (req, res) => {
  try {
    const details = await getUserDetailsForManagement(Number(req.params.userId));
    return res.json({ success: true, ...details });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/user-management/update-access
adminRouter.post("/user-management/update-access", async (req, res) => {
  try {
    const { userId, accessType, status, startDate, expiryDate, isLifetime, isOverrideBlocked, notes } = req.body;
    const result = await setUserAccess(1, "Admin", {
      userId: Number(userId),
      accessType,
      status,
      startDate: startDate || null,
      expiryDate: expiryDate || null,
      isLifetime: !!isLifetime,
      isOverrideBlocked: isOverrideBlocked !== undefined ? isOverrideBlocked : status === "off",
      notes,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/user-management/clear-override
adminRouter.post("/user-management/clear-override", async (req, res) => {
  try {
    const { userId, accessType } = req.body;
    const result = await clearUserAccessOverride(1, "Admin", Number(userId), accessType);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/user-management/account-status
adminRouter.post("/user-management/account-status", async (req, res) => {
  try {
    const { userId, status } = req.body;
    await setAccountStatus(Number(userId), status);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/user-management/audit-logs
adminRouter.get("/user-management/audit-logs", async (req, res) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const logs = await getUserAuditLogs(userId);
    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

