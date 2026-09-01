import { useState } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Copy,
  DollarSign,
  Download,
  FileCheck2,
  FileText,
  Filter,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

type AdminTab = "overview" | "orders" | "students" | "support" | "settings" | "audit";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Filter & Search states
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [orderMethodFilter, setOrderMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");

  // Modals & form state
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [grantAccessModalUser, setGrantAccessModalUser] = useState<any | null>(null);
  const [grantScope, setGrantScope] = useState("bundle:3 (Master Full Bundle)");
  const [selectedBundleId, setSelectedBundleId] = useState<number>(3);
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Settings form state
  const [bkashNumber, setBkashNumber] = useState("01961079326");
  const [nagadNumber, setNagadNumber] = useState("01961079326");
  const [rocketNumber, setRocketNumber] = useState("01961079326");
  const [announcement, setAnnouncement] = useState("Special Eid Discount 50% Active on All Institutional Packages!");

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const { data: orders, refetch: refetchOrders } = trpc.admin.orders.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const { data: students, refetch: refetchStudents } = trpc.admin.users.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const { data: tickets, refetch: refetchTickets } = trpc.admin.tickets.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const { data: auditLogs, refetch: refetchAudit } = trpc.admin.auditLogs.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });

  // Mutations
  const approveMutation = trpc.admin.approveOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      refetchAudit();
      setActionSuccess("Order approved successfully! Entitlement granted & notification sent.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const rejectMutation = trpc.admin.rejectOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      refetchAudit();
      setRejectModalOrder(null);
      setRejectReason("");
      setActionSuccess("Order rejected & customer notified.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const updateRoleMutation = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      refetchStudents();
      setActionSuccess("User role updated successfully.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const grantAccessMutation = trpc.admin.grantAccess.useMutation({
    onSuccess: () => {
      refetchStudents();
      refetchOrders();
      setGrantAccessModalUser(null);
      setActionSuccess("Access entitlement granted to student!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const updateTicketMutation = trpc.admin.updateTicket.useMutation({
    onSuccess: () => {
      refetchTickets();
      setActionSuccess("Ticket status updated.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrxId(text);
    setTimeout(() => setCopiedTrxId(null), 2500);
  };

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070e1b] text-white">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo size={64} className="animate-pulse" />
          <div className="text-xs font-extrabold uppercase tracking-widest text-sky-400">Loading Operations Workspace...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070e1b] p-6 text-white">
        <div className="max-w-md text-center">
          <BrandLogo size={96} className="mx-auto" />
          <Lock className="mx-auto mt-6 text-sky-400" size={36} />
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">Admin & Support Access Required</h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Please sign in with your administrative or support account to access payment verification, student records, and system operations.
          </p>
          <Button onClick={() => startLogin()} className="mt-6 w-full bg-sky-500 font-extrabold text-slate-950 hover:bg-sky-400">
            Sign In with Admin Account
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "support") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] p-6 text-center dark:bg-[#070e1b]">
        <div className="max-w-md">
          <ShieldAlert className="mx-auto text-rose-500" size={48} />
          <h1 className="mt-4 text-2xl font-black">Restricted Operations Area</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Your current account (<b>{user.email}</b>) has role <b>'{user.role}'</b>. Only staff members with <b>'admin'</b> or <b>'support'</b> privileges can access this panel.
          </p>
          <Link href="/dashboard">
            <Button className="mt-6 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950">
              Return to Student Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filtered Orders
  const filteredOrders = (orders || []).filter((o: any) => {
    if (orderFilter !== "all" && o.orderStatus !== orderFilter) return false;
    if (orderMethodFilter !== "all" && o.paymentMethod !== orderMethodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTrx = o.transactionId?.toLowerCase().includes(q);
      const matchId = String(o.id).includes(q);
      const matchAmount = String(o.amount).includes(q);
      return matchTrx || matchId || matchAmount;
    }
    return true;
  });

  // Filtered Students
  const filteredStudents = (students || []).filter((s: any) => {
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.includes(q);
    }
    return true;
  });

  // Filtered Tickets
  const filteredTickets = (tickets || []).filter((t: any) => {
    if (ticketFilter !== "all" && t.status !== ticketFilter) return false;
    return true;
  });

  const pendingOrdersList = (orders || []).filter((o: any) => o.orderStatus === "pending");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#060d19] dark:text-slate-100 transition-colors duration-300">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#070e1b]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <BrandLogo size={40} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-[#0a192f] dark:text-white uppercase">
                  Cycle of Chart
                </span>
                <span className="rounded-full bg-[#0284c7]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-400">
                  {user.role.toUpperCase()} CONSOLE
                </span>
              </div>
              <div className="text-[10px] font-bold text-slate-400">Trading Reality Operations & Access Control</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700">
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">Student Dashboard</span>
                <span className="sm:hidden">Portal</span>
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" variant="ghost" className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400">
                Public Site →
              </Button>
            </Link>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-5 lg:px-8">
          <div className="flex gap-1 border-b-2 border-transparent pb-0">
            {[
              { id: "overview", label: "Executive KPI", icon: LayoutDashboard, badge: undefined },
              { id: "orders", label: "Payment Verification", icon: FileCheck2, badge: pendingOrdersList.length ? `${pendingOrdersList.length}` : undefined },
              { id: "students", label: "Students & Access", icon: Users, badge: students?.length ? `${students.length}` : undefined },
              { id: "support", label: "Support Tickets", icon: ShieldCheck, badge: tickets?.filter((t: any) => t.status === "open").length ? `${tickets.filter((t: any) => t.status === "open").length}` : undefined },
              { id: "settings", label: "Gateways & Notice", icon: KeyRound, badge: undefined },
              { id: "audit", label: "Audit Trail", icon: Shield, badge: undefined },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-extrabold transition-all ${
                    isActive
                      ? "border-[#0284c7] text-[#0284c7] dark:border-sky-400 dark:text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-black text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Success Toast Banner */}
        {actionSuccess && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
              <X size={15} />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE KPI & ANALYTICS OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header Quote / Status */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Executive Performance Overview</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Real-time revenue metrics, pending payment verification volume, and student engagement statistics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    refetchStats();
                    refetchOrders();
                    refetchStudents();
                    refetchTickets();
                  }}
                  variant="outline"
                  className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
                >
                  <RefreshCw size={13} />
                  <span>Refresh Real-Time Data</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-gradient-to-br from-[#081833] to-[#0f2c59] p-6 text-white shadow-xl shadow-[#081833]/15">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#38bdf8]">Verified Revenue</span>
                  <DollarSign size={20} className="text-[#38bdf8]" />
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-black">
                  ৳{stats?.totalRevenue?.toLocaleString() || "0"}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-300 flex items-center gap-1">
                  <TrendingUp size={13} className="text-emerald-400" />
                  <span>{stats?.approvedOrdersCount || 0} approved orders</span>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Pending Volume</span>
                  <Clock3 size={20} className="text-amber-500" />
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-black text-amber-900 dark:text-amber-200">
                  ৳{stats?.pendingRevenue?.toLocaleString() || "0"}
                </div>
                <div className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {stats?.pendingOrdersCount || 0} manual orders awaiting review
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Total Students</span>
                  <Users size={20} className="text-[#0284c7] dark:text-sky-400" />
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-black">
                  {stats?.totalStudents || 0}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Registered trading accounts
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Support Desk</span>
                  <ShieldCheck size={20} className="text-purple-500" />
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-black">
                  {stats?.openTicketsCount || 0}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Open student tickets ({stats?.resolvedTicketsCount || 0} resolved)
                </div>
              </div>
            </div>

            {/* Quick Pending Review Banner */}
            {pendingOrdersList.length > 0 && (
              <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 shadow-md dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h3 className="font-extrabold text-base text-amber-950 dark:text-amber-100">
                        {pendingOrdersList.length} Orders Awaiting Verification
                      </h3>
                      <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                        Immediate manual review unlocks student learning access instantly.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("orders")}
                    size="sm"
                    className="shrink-0 bg-[#081833] font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                  >
                    Open Payment Queue →
                  </Button>
                </div>
              </div>
            )}

            {/* Two Column Section: Recent Orders & Recent Student Signups */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h3 className="font-extrabold text-base">Recent Order Submissions</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")} className="text-xs font-bold text-[#0284c7] dark:text-sky-400">
                    View All →
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {(orders || []).slice(0, 4).map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
                      <div>
                        <div className="font-extrabold text-sm">Order #{o.id} · <span className="uppercase text-[#0284c7] dark:text-sky-400">{o.paymentMethod}</span></div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">Trx: {o.transactionId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm">৳{o.amount}</div>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase mt-1 ${
                          o.orderStatus === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : o.orderStatus === "rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        }`}>
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h3 className="font-extrabold text-base">Registered Students</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("students")} className="text-xs font-bold text-[#0284c7] dark:text-sky-400">
                    View All →
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {(students || []).slice(0, 4).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                          {s.name ? s.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-extrabold">{s.name || "Trader"}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase dark:bg-slate-700">
                        {s.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MANUAL PAYMENT VERIFICATION QUEUE */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Manual Payment Verification Queue</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Verify bKash, Nagad, and Rocket Transaction IDs before unlocking digital course materials.
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Transaction ID, Order #, or Amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                      orderFilter === st
                        ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Gateway Filter */}
              <select
                value={orderMethodFilter}
                onChange={(e) => setOrderMethodFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">All Gateways</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
              </select>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-3.5">
              {filteredOrders.length ? (
                filteredOrders.map((o: any) => {
                  const isPending = o.orderStatus === "pending";
                  const isApproved = o.orderStatus === "approved";
                  const isRejected = o.orderStatus === "rejected";

                  return (
                    <div
                      key={o.id}
                      className={`rounded-3xl border p-5 sm:p-6 transition-all ${
                        isPending
                          ? "border-amber-300 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20 shadow-sm"
                          : isApproved
                          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                          : "border-rose-200 bg-rose-50/20 dark:border-rose-900/30 dark:bg-slate-900 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-base font-extrabold">Order #{o.id}</span>
                            <span
                              className={`rounded-full px-3 py-0.5 text-[11px] font-black uppercase ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                  : isRejected
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
                              }`}
                            >
                              {o.orderStatus}
                            </span>
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {o.paymentMethod}
                            </span>
                          </div>

                          {/* TrxID with 1-Click Copy */}
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Transaction ID:</span>
                            <code className="rounded-lg bg-slate-200/80 px-2.5 py-1 font-mono text-xs font-black text-slate-900 dark:bg-slate-800 dark:text-sky-400">
                              {o.transactionId}
                            </code>
                            <button
                              onClick={() => copyToClipboard(o.transactionId)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
                              title="Copy TrxID"
                            >
                              {copiedTrxId === o.transactionId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>

                          <div className="mt-2 text-xs text-slate-500">
                            Submitted on: {new Date(o.createdAt).toLocaleString()} · Student #{o.customerId}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 dark:border-slate-800">
                          <div className="text-left md:text-right">
                            <div className="text-2xl font-black">৳{o.amount}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">BDT Total</div>
                          </div>

                          {isPending && (user.role === "admin" || user.role === "support") && (
                            <div className="flex items-center gap-2">
                              <Button
                                disabled={approveMutation.isPending}
                                onClick={() => approveMutation.mutate({ orderId: o.id })}
                                size="sm"
                                className="bg-emerald-600 font-bold text-white hover:bg-emerald-700 shadow-md"
                              >
                                <Check size={15} className="mr-1" />
                                <span>Approve & Unlock</span>
                              </Button>

                              <Button
                                disabled={rejectMutation.isPending}
                                onClick={() => setRejectModalOrder(o)}
                                size="sm"
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                              >
                                <X size={15} className="mr-1" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          )}

                          {isApproved && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={16} />
                              <span>Verified & Unlocked</span>
                            </div>
                          )}

                          {isRejected && (
                            <div className="text-xs text-rose-600 dark:text-rose-400">
                              <span className="font-bold">Reason:</span> {o.rejectionReason || "Proof unverified"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <FileCheck2 size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
                  <h3 className="text-base font-bold">No orders found</h3>
                  <p className="mt-1 text-xs text-slate-400">Adjust your search or filter settings to view more transactions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STUDENTS & MANUAL ACCESS CONTROL */}
        {/* ========================================================================= */}
        {activeTab === "students" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Students & Access Entitlements</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  View student profiles, assign administrative roles, and manually grant or revoke digital packages.
                </p>
              </div>
            </div>

            {/* Student Search */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="relative">
                <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or phone..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Students Table / Grid */}
            <div className="space-y-3">
              {filteredStudents.length ? (
                filteredStudents.map((s: any) => (
                  <div key={s.id} className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
                    <div className="flex items-start gap-3.5">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950 shrink-0">
                        {s.name ? s.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm">{s.name || "Student"}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                            s.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" : s.role === "support" ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {s.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {s.email} {s.phone ? `· ${s.phone}` : ""}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          Joined: {new Date(s.createdAt).toLocaleDateString()} · Orders: {s.ordersCount || 0}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 dark:border-slate-800">
                      <Button
                        size="sm"
                        onClick={() => setGrantAccessModalUser(s)}
                        className="bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                      >
                        <UserPlus size={13} className="mr-1.5" />
                        <span>Grant Access</span>
                      </Button>

                      {user.role === "admin" && (
                        <select
                          value={s.role}
                          onChange={(e) => updateRoleMutation.mutate({ userId: s.id, role: e.target.value as any })}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="user">Role: User</option>
                          <option value="support">Role: Support</option>
                          <option value="admin">Role: Admin</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <Users size={36} className="mx-auto text-slate-400 mb-2" />
                  <div className="font-bold">No students found</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SUPPORT TICKET DESK */}
        {/* ========================================================================= */}
        {activeTab === "support" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Student Support Desk</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Review and resolve student inquiries regarding payments, access codes, and mentorship.
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(["all", "open", "in_progress", "resolved"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketFilter(st)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                    ticketFilter === st
                      ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredTickets.length ? (
                filteredTickets.map((t: any) => (
                  <div key={t.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base">{t.subject}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            t.status === "resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : t.status === "in_progress" ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          From Student #{t.userId} · Created: {new Date(t.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Status Update Actions */}
                      <div className="flex items-center gap-2">
                        {t.status !== "resolved" && (
                          <Button
                            size="sm"
                            onClick={() => updateTicketMutation.mutate({ ticketId: t.id, status: "resolved" })}
                            className="bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            <Check size={13} className="mr-1" /> Mark Resolved
                          </Button>
                        )}
                        {t.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTicketMutation.mutate({ ticketId: t.id, status: "in_progress" })}
                            className="text-xs font-bold border-slate-300 dark:border-slate-700"
                          >
                            In Progress
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl">
                      {t.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <ShieldCheck size={36} className="mx-auto text-slate-400 mb-2" />
                  <div className="font-bold">No tickets found</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: GATEWAYS & GENERAL SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Payment Gateways & System Settings</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Update merchant and personal payment numbers displayed across the checkout page.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  bKash Personal / Send Money Number
                </label>
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nagad Personal / Send Money Number
                </label>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Rocket Number
                </label>
                <input
                  type="text"
                  value={rocketNumber}
                  onChange={(e) => setRocketNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Platform Announcement Notice
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <Button
                onClick={() => {
                  setActionSuccess("Payment numbers & platform settings updated!");
                  setTimeout(() => setActionSuccess(null), 3000);
                }}
                className="w-full bg-[#081833] font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
              >
                Save Settings
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AUDIT TRAIL */}
        {/* ========================================================================= */}
        {activeTab === "audit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Security & Audit Event Log</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Immutable event stream recording all administrative actions, approval events, and manual overrides.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-3 font-mono text-xs">
                {(auditLogs || []).map((ev: any) => (
                  <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800 gap-1">
                    <div>
                      <span className="font-extrabold text-[#0284c7] dark:text-sky-400">{ev.action}</span> · Entity #{ev.entityId} (Actor #{ev.actorId})
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* REJECT ORDER MODAL */}
      {/* ========================================================================= */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setRejectModalOrder(null)}>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold">Reject Order #{rejectModalOrder.id}</h3>
              <button onClick={() => setRejectModalOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Choose a reason to explain to the customer why their payment could not be verified:
              </p>

              <select
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">-- Choose Reason Template --</option>
                <option value="Transaction ID was not found in our merchant statement.">Transaction ID not found</option>
                <option value="Sent amount did not match the package price.">Sent amount mismatch</option>
                <option value="Duplicate transaction ID already used.">Duplicate Transaction ID</option>
                <option value="Payment proof screenshot is unreadable.">Screenshot unreadable</option>
              </select>

              <textarea
                rows={3}
                placeholder="Or write custom reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-rose-500 dark:border-slate-800 dark:bg-slate-950"
              />

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setRejectModalOrder(null)}
                  variant="outline"
                  className="w-1/2 border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  disabled={rejectMutation.isPending}
                  onClick={() => {
                    const why = rejectReason || "Payment proof could not be verified.";
                    rejectMutation.mutate({ orderId: rejectModalOrder.id, reason: why });
                  }}
                  className="w-1/2 bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Confirm Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL GRANT ACCESS MODAL */}
      {/* ========================================================================= */}
      {grantAccessModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setGrantAccessModalUser(null)}>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold">Grant Access to {grantAccessModalUser.name || grantAccessModalUser.email}</h3>
              <button onClick={() => setGrantAccessModalUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Select the package or digital product to unlock for this student:
              </p>

              <select
                value={selectedBundleId}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  setSelectedBundleId(id);
                  setGrantScope(id === 3 ? "bundle:3 (Master Full Bundle)" : id === 2 ? "bundle:2 (Course + eBook)" : "bundle:1 (15-PDF Package)");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                <option value={3}>Master Full Bundle (All 15 PDFs + Course + eBook)</option>
                <option value={2}>Course + Free Institutional eBook</option>
                <option value={1}>15-PDF Institutional Library Package</option>
              </select>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setGrantAccessModalUser(null)}
                  variant="outline"
                  className="w-1/2 border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  disabled={grantAccessMutation.isPending}
                  onClick={() => {
                    grantAccessMutation.mutate({
                      userId: grantAccessModalUser.id,
                      scope: grantScope,
                      bundleId: selectedBundleId,
                    });
                  }}
                  className="w-1/2 bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Grant Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
