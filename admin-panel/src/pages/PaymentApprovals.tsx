import React, { useState } from "react";
import { Check, X, Search, Copy, CheckCircle2, FileCheck2 } from "lucide-react";
import { Order } from "../lib/types";

interface PaymentApprovalsProps {
  orders: Order[];
  onApprove: (orderId: number) => void;
  onReject: (orderId: number, reason: string) => void;
}

export const PaymentApprovals: React.FC<PaymentApprovalsProps> = ({
  orders,
  onApprove,
  onReject,
}) => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrx(text);
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.orderStatus !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.transactionId.toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        String(o.amount).includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">Manual Payment Verification Queue</h2>
        <p className="mt-1 text-xs text-slate-400">
          Verify merchant transaction statements before provisioning digital access to students.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Transaction ID or Order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pr-4 pl-9 text-xs font-medium text-white outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "pending", "approved", "rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                filter === st
                  ? "bg-sky-500 text-slate-950 font-black"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length ? (
          filtered.map((o) => {
            const isPending = o.orderStatus === "pending";
            const isApproved = o.orderStatus === "approved";
            const isRejected = o.orderStatus === "rejected";

            return (
              <div
                key={o.id}
                className={`rounded-3xl border p-5 sm:p-6 transition-all ${
                  isPending
                    ? "border-amber-500/40 bg-amber-950/15"
                    : isApproved
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-rose-900/40 bg-rose-950/10 opacity-75"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-white">Order #{o.id}</span>
                      <span
                        className={`rounded-full px-3 py-0.5 text-[11px] font-black uppercase ${
                          isApproved
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                            : isRejected
                            ? "bg-rose-950 text-rose-400 border border-rose-800/50"
                            : "bg-amber-950 text-amber-400 border border-amber-800/50 animate-pulse"
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                      <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[11px] font-extrabold uppercase text-slate-300">
                        {o.paymentMethod}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-xs text-slate-400">Transaction ID:</span>
                      <code className="rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs font-black text-sky-400">
                        {o.transactionId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(o.transactionId)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="Copy TrxID"
                      >
                        {copiedTrx === o.transactionId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Date: {new Date(o.createdAt).toLocaleString()} · Customer #{o.customerId}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t border-slate-800 pt-3 md:border-t-0 md:pt-0">
                    <div className="text-left md:text-right">
                      <div className="text-2xl font-black text-white">৳{o.amount}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">BDT Total</div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onApprove(o.id)}
                          className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                        >
                          <Check size={14} />
                          <span>Approve & Unlock</span>
                        </button>
                        <button
                          onClick={() => setRejectModalOrder(o)}
                          className="flex items-center gap-1 rounded-xl border border-rose-800/80 bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {isApproved && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 size={16} />
                        <span>Verified & Granted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
            <FileCheck2 size={36} className="mx-auto text-slate-600 mb-2" />
            <div className="font-bold text-sm">No orders matching your criteria</div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setRejectModalOrder(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-white">Reject Order #{rejectModalOrder.id}</h3>
            <p className="mt-2 text-xs text-slate-400">
              Select or specify a reason why the transaction could not be verified:
            </p>

            <select
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white outline-none"
            >
              <option value="">-- Predefined Templates --</option>
              <option value="Transaction ID was not found in merchant records.">Transaction ID not found</option>
              <option value="Sent amount did not match the package price.">Amount mismatch</option>
              <option value="Duplicate transaction ID already used.">Duplicate TrxID</option>
            </select>

            <textarea
              rows={3}
              placeholder="Or write custom reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white outline-none"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="w-1/2 rounded-xl border border-slate-800 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(rejectModalOrder.id, rejectReason || "Payment could not be verified.");
                  setRejectModalOrder(null);
                  setRejectReason("");
                }}
                className="w-1/2 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-500"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
