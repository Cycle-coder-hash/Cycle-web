import { Router } from "express";
import {
  getDb,
  listAllOrders,
  approveOrder,
  rejectOrder,
  listAllUsers,
  listTickets,
  listAuditLogs,
  updateUserRole,
  grantManualEntitlement,
  revokeEntitlement,
  updateTicketStatus,
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
    const allTickets = await listTickets();

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
        openTicketsCount: allTickets.filter((t: any) => t.status === "open").length,
        resolvedTicketsCount: allTickets.filter((t: any) => t.status === "resolved").length,
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

// GET /api/admin/tickets
adminRouter.get("/tickets", async (req, res) => {
  try {
    const allTickets = await listTickets();
    return res.json({ success: true, tickets: allTickets });
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

// POST /api/admin/update-ticket
adminRouter.post("/update-ticket", async (req, res) => {
  try {
    const { ticketId, status } = req.body;
    if (!ticketId || !status) return res.status(400).json({ success: false, error: "ticketId and status are required" });

    await updateTicketStatus(ticketId, status);
    return res.json({ success: true });
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

