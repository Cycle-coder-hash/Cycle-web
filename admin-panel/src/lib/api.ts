import { Order, Student, SupportTicket, AuditEvent } from "./types";

const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const API_BASE = rawApiUrl.endsWith("/api/admin") 
  ? rawApiUrl 
  : `${rawApiUrl.replace(/\/+$/, "")}/api/admin`;


export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/stats`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch stats");
  return data.stats;
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch orders");
  return data.orders || [];
}

export async function fetchAdminUsers(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/users`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch users");
  return data.users || [];
}

export async function fetchAdminTickets(): Promise<SupportTicket[]> {
  const res = await fetch(`${API_BASE}/tickets`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch tickets");
  return data.tickets || [];
}

export async function fetchAdminAuditLogs(): Promise<AuditEvent[]> {
  const res = await fetch(`${API_BASE}/audit-logs`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch audit logs");
  return data.logs || [];
}

export async function approveOrderApi(orderId: number) {
  const res = await fetch(`${API_BASE}/approve-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to approve order");
  return data;
}

export async function rejectOrderApi(orderId: number, reason: string) {
  const res = await fetch(`${API_BASE}/reject-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, reason }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to reject order");
  return data;
}

export async function grantAccessApi(userId: number, bundleId?: number, productId?: number) {
  const res = await fetch(`${API_BASE}/grant-access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, bundleId, productId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to grant access");
  return data;
}

export async function updateRoleApi(userId: number, role: "user" | "support" | "admin") {
  const res = await fetch(`${API_BASE}/update-role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to update role");
  return data;
}

export async function updateTicketStatusApi(ticketId: number, status: "open" | "in_progress" | "resolved") {
  const res = await fetch(`${API_BASE}/update-ticket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketId, status }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to update ticket");
  return data;
}
