import React from "react";
import {
  Search,
  Check,
  Copy,
  CheckCircle2,
  X,
  FileCheck2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersTabProps {
  orders: any[];
  orderFilter: "all" | "pending" | "approved" | "rejected";
  setOrderFilter: (filter: "all" | "pending" | "approved" | "rejected") => void;
  orderMethodFilter: string;
  setOrderMethodFilter: (method: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onApproveOrder: (orderId: number) => void;
  onOpenRejectModal: (order: any) => void;
  onDeleteOrder?: (orderId: number) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  copiedTrxId: string | null;
  copyToClipboard: (text: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  orderFilter,
  setOrderFilter,
  orderMethodFilter,
  setOrderMethodFilter,
  searchQuery,
  setSearchQuery,
  onApproveOrder,
  onOpenRejectModal,
  onDeleteOrder,
  isApproving,
  copiedTrxId,
  copyToClipboard,
}) => {
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

  return (
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
          <option value="free">Free Access</option>
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
                        {copiedTrxId === o.transactionId ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
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

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <Button
                          disabled={isApproving}
                          onClick={() => onApproveOrder(o.id)}
                          size="sm"
                          className="bg-emerald-600 font-bold text-white hover:bg-emerald-700 shadow-md"
                        >
                          <Check size={15} className="mr-1" />
                          <span>Approve & Unlock</span>
                        </Button>

                        <Button
                          onClick={() => onOpenRejectModal(o)}
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

                    {onDeleteOrder && (
                      <Button
                        onClick={() => onDeleteOrder(o.id)}
                        size="sm"
                        variant="outline"
                        className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                        title="Delete order permanently from database"
                      >
                        <Trash2 size={15} className="mr-1" />
                        <span>Delete</span>
                      </Button>
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
  );
};
