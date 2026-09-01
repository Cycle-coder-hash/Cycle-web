import React from "react";
import { DollarSign, Clock3, Users, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { KpiCard } from "../components/KpiCard";
import { Order, Student } from "../lib/types";

interface DashboardOverviewProps {
  orders: Order[];
  students: Student[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  orders,
  students,
  onNavigateTab,
}) => {
  const approvedOrders = orders.filter((o) => o.orderStatus === "approved");
  const pendingOrders = orders.filter((o) => o.orderStatus === "pending");

  const totalRevenue = approvedOrders.reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Executive Performance Overview</h2>
        <p className="mt-1 text-xs text-slate-400">
          Real-time verified sales revenue, manual pending verification volume, and student metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Verified Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          subtitle={`${approvedOrders.length} approved orders`}
          icon={DollarSign}
          variant="sky"
        />
        <KpiCard
          title="Pending Volume"
          value={`৳${pendingRevenue.toLocaleString()}`}
          subtitle={`${pendingOrders.length} orders awaiting review`}
          icon={Clock3}
          variant="amber"
        />
        <KpiCard
          title="Total Students"
          value={students.length}
          subtitle="Registered trader accounts"
          icon={Users}
          variant="default"
        />
        <KpiCard
          title="Conversion Rate"
          value="94.2%"
          subtitle="Successful payment verifications"
          icon={TrendingUp}
          variant="emerald"
        />
      </div>

      {/* Pending Action Banner */}
      {pendingOrders.length > 0 && (
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-amber-500/30 bg-amber-950/20 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-base font-extrabold text-amber-200">
              {pendingOrders.length} Payments Awaiting Manual Verification
            </div>
            <p className="mt-1 text-xs text-amber-300/80">
              Immediate review unlocks student course materials & institutional PDF downloads.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("orders")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition"
          >
            <span>Review Queue</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Recent Orders List */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-base font-extrabold text-white">Recent Transactions</h3>
          <button
            onClick={() => onNavigateTab("orders")}
            className="text-xs font-bold text-sky-400 hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {orders.slice(0, 4).map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 text-xs"
            >
              <div>
                <div className="font-extrabold text-white">
                  Order #{o.id} · <span className="uppercase text-sky-400">{o.paymentMethod}</span>
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-400">TrxID: {o.transactionId}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-sm text-white">৳{o.amount}</div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase mt-1 ${
                    o.orderStatus === "approved"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      : o.orderStatus === "rejected"
                      ? "bg-rose-950 text-rose-400 border border-rose-800/50"
                      : "bg-amber-950 text-amber-400 border border-amber-800/50"
                  }`}
                >
                  {o.orderStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
