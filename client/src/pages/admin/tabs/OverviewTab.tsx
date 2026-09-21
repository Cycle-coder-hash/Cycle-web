import React from "react";
import {
  DollarSign,
  TrendingUp,
  Clock3,
  Users,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminTab } from "../components/AdminNavTabs";

interface OverviewTabProps {
  stats: any;
  orders: any[];
  students: any[];
  tickets: any[];
  refetchAll: () => void;
  setActiveTab: (tab: AdminTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  orders,
  students,
  tickets,
  refetchAll,
  setActiveTab,
}) => {
  const pendingOrdersList = (orders || []).filter((o: any) => o.orderStatus === "pending");

  return (
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
            onClick={refetchAll}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("orders")}
              className="text-xs font-bold text-[#0284c7] dark:text-sky-400"
            >
              View All →
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {(orders || []).slice(0, 4).map((o: any) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
              >
                <div>
                  <div className="font-extrabold text-sm">
                    Order #{o.id} · <span className="uppercase text-[#0284c7] dark:text-sky-400">{o.paymentMethod}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">Trx: {o.transactionId}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm">৳{o.amount}</div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase mt-1 ${
                      o.orderStatus === "approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : o.orderStatus === "rejected"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    }`}
                  >
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("students")}
              className="text-xs font-bold text-[#0284c7] dark:text-sky-400"
            >
              View All →
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {(students || []).slice(0, 4).map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
              >
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
  );
};
