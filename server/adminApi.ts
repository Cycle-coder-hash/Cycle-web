import { Router } from "express";
import {
  getDb,
  listAllOrders,
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
    return res.json({ success: true, orders: allOrders });
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

    const db = await getDb();
    if (db) {
      const row = (
        await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
      )[0];
      if (!row) return res.status(404).json({ success: false, error: "Order not found" });

      await db
        .update(orders)
        .set({
          orderStatus: "approved",
          paymentStatus: "approved",
          approvedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      await db.insert(entitlements).values({
        userId: row.customerId,
        orderId: row.id,
        productId: row.productId,
        bundleId: row.bundleId,
        scope: row.bundleId ? `bundle:${row.bundleId}` : `product:${row.productId}`,
      });

      await db.insert(auditEvents).values({
        actorId: 1,
        action: "order.approved",
        entity: "order",
        entityId: row.id,
        metadata: { customerId: row.customerId, amount: row.amount },
      });

      await db.insert(notifications).values({
        userId: row.customerId,
        title: "Access unlocked",
        message: "Your payment was approved and your digital learning access is now available.",
      });

      const customer = (
        await db.select().from(users).where(eq(users.id, row.customerId)).limit(1)
      )[0];
      try {
        await sendAccessEmail("payment_approved", customer?.email, { orderId: row.id });
        await sendAccessEmail("access_granted", customer?.email, { orderId: row.id });
      } catch {}
    } else {
      const allOrders = await listAllOrders();
      const ord = allOrders.find((o: any) => o.id === orderId);
      if (ord) {
        ord.orderStatus = "approved";
        ord.paymentStatus = "approved";
        ord.approvedAt = new Date();
        await grantManualEntitlement(
          ord.customerId,
          ord.bundleId ? `bundle:${ord.bundleId}` : `product:${ord.productId || 1}`,
          ord.bundleId,
          ord.productId
        );
      }
    }

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

    const db = await getDb();
    if (db) {
      const row = (
        await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
      )[0];
      if (!row) return res.status(404).json({ success: false, error: "Order not found" });

      await db
        .update(orders)
        .set({
          orderStatus: "rejected",
          paymentStatus: "rejected",
          rejectionReason: reason || "Payment proof could not be verified.",
        })
        .where(eq(orders.id, orderId));

      await db.insert(auditEvents).values({
        actorId: 1,
        action: "order.rejected",
        entity: "order",
        entityId: row.id,
        metadata: { reason },
      });

      await db.insert(notifications).values({
        userId: row.customerId,
        title: "Payment needs attention",
        message: reason || "Payment proof unverified",
      });

      const customer = (
        await db.select().from(users).where(eq(users.id, row.customerId)).limit(1)
      )[0];
      try {
        await sendAccessEmail("payment_rejected", customer?.email, { orderId: row.id, reason });
      } catch {}
    } else {
      const allOrders = await listAllOrders();
      const ord = allOrders.find((o: any) => o.id === orderId);
      if (ord) {
        ord.orderStatus = "rejected";
        ord.paymentStatus = "rejected";
        ord.rejectionReason = reason;
      }
    }

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
