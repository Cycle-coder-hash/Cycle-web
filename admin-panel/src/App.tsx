import React, { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { DashboardOverview } from "./pages/DashboardOverview";
import { PaymentApprovals } from "./pages/PaymentApprovals";
import { StudentManagement } from "./pages/StudentManagement";
import { SupportTickets } from "./pages/SupportTickets";
import { PlatformSettings } from "./pages/PlatformSettings";
import { AuditLogs } from "./pages/AuditLogs";
import { Order, Student, SupportTicket, AuditEvent } from "./lib/types";
import {
  fetchAdminStats,
  fetchAdminOrders,
  fetchAdminUsers,
  fetchAdminTickets,
  fetchAdminAuditLogs,
  approveOrderApi,
  rejectOrderApi,
  grantAccessApi,
  updateRoleApi,
  updateTicketStatusApi,
} from "./lib/api";
import { RefreshCw, CheckCircle2, X } from "lucide-react";

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("cycle_admin_authenticated") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadLiveData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, usersData, ticketsData, logsData] = await Promise.all([
        fetchAdminOrders(),
        fetchAdminUsers(),
        fetchAdminTickets(),
        fetchAdminAuditLogs(),
      ]);
      setOrders(ordersData);
      setStudents(usersData);
      setTickets(ticketsData);
      setLogs(logsData);
    } catch (err: any) {
      console.warn("[Admin API load error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadLiveData();
    }
  }, [isAuthenticated, loadLiveData]);

  const handleMasterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "admin2026" || passcode.trim() === "cycleadmin" || passcode.trim() === "01961079326") {
      setIsAuthenticated(true);
      localStorage.setItem("cycle_admin_authenticated", "true");
      setAuthError("");
    } else {
      setAuthError("Invalid Master Security Key. Access denied.");
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("cycle_admin_authenticated");
  };

  // Live Database Mutations
  const handleApproveOrder = async (orderId: number) => {
    try {
      await approveOrderApi(orderId);
      setActionSuccess(`Order #${orderId} approved and entitlement granted in DB.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to approve order: " + err.message);
    }
  };

  const handleRejectOrder = async (orderId: number, reason: string) => {
    try {
      await rejectOrderApi(orderId, reason);
      setActionSuccess(`Order #${orderId} rejected.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to reject order: " + err.message);
    }
  };

  const handleGrantAccess = async (studentId: number, bundleId: number) => {
    try {
      await grantAccessApi(studentId, bundleId);
      setActionSuccess("Access granted to student in DB.");
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to grant access: " + err.message);
    }
  };

  const handleUpdateRole = async (studentId: number, role: "user" | "support" | "admin") => {
    try {
      await updateRoleApi(studentId, role);
      setActionSuccess("User role updated in DB.");
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: number, status: "open" | "in_progress" | "resolved") => {
    try {
      await updateTicketStatusApi(ticketId, status);
      setActionSuccess("Support ticket status updated in DB.");
      setTimeout(() => setActionSuccess(null), 4000);
      loadLiveData();
    } catch (err: any) {
      alert("Failed to update ticket: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050b14] p-6 text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#070e1b] p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-500 font-black text-slate-950 text-xl shadow-lg shadow-sky-500/20">
              C
            </div>
            <h1 className="mt-5 text-xl font-black text-white uppercase tracking-wider">
              Cycle of Chart Operations
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Enter the Superadmin Master Key to access live database payment approvals, student records, and system settings.
            </p>
          </div>

          <form onSubmit={handleMasterLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Master Security Key / Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin passcode (e.g. admin2026)"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setAuthError("");
                }}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-sm font-bold text-white outline-none focus:border-sky-500"
              />
              {authError && <div className="mt-2 text-xs font-bold text-rose-400">{authError}</div>}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-sky-500 py-3 text-xs font-black text-slate-950 hover:bg-sky-400 transition shadow-lg shadow-sky-500/20"
            >
              Unlock Operations Console →
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-[10px] text-slate-400">
            Dedicated Administrative Portal · Port 3001 · Live DB Connected
          </div>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "pending").length;
  const openTicketsCount = tickets.filter((t) => t.status === "open").length;

  const tabTitles: Record<string, string> = {
    overview: "Executive Performance Overview",
    orders: "Payment Verification Queue",
    students: "Student & Access Management",
    support: "Student Support Desk",
    settings: "Gateway & Platform Settings",
    audit: "Security & Audit Event Trail",
  };

  return (
    <div className="min-h-screen bg-[#060d19] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        openTicketsCount={openTicketsCount}
      />

      <div className="lg:pl-64 flex min-h-screen flex-col">
        <AdminHeader
          currentTabTitle={tabTitles[activeTab] || "Operations Console"}
          pendingCount={pendingOrdersCount}
        />

        {/* Global Live Refresh & Notification Bar */}
        <div className="mx-auto flex max-w-7xl w-full items-center justify-between px-6 pt-4 pb-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex size-2 rounded-full bg-emerald-500"></span>
            <span>Connected to Live DB</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadLiveData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <RefreshCw size={12} className={loading ? "animate-spin text-sky-400" : ""} />
              <span>{loading ? "Refreshing..." : "Refresh DB"}</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="rounded-xl border border-rose-900/60 bg-rose-950/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition"
            >
              Lock Console
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-emerald-800 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400">
              <X size={15} />
            </button>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <DashboardOverview orders={orders} students={students} onNavigateTab={setActiveTab} />
          )}
          {activeTab === "orders" && (
            <PaymentApprovals orders={orders} onApprove={handleApproveOrder} onReject={handleRejectOrder} />
          )}
          {activeTab === "students" && (
            <StudentManagement
              students={students}
              onGrantAccess={handleGrantAccess}
              onUpdateRole={handleUpdateRole}
            />
          )}
          {activeTab === "support" && (
            <SupportTickets tickets={tickets} onUpdateStatus={handleUpdateTicketStatus} />
          )}
          {activeTab === "settings" && <PlatformSettings />}
          {activeTab === "audit" && <AuditLogs logs={logs} />}
        </main>
      </div>
    </div>
  );
};
export default App;
