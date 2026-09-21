import React from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RejectOrderModalProps {
  order: any | null;
  onClose: () => void;
  onConfirmReject: (orderId: number, reason: string) => void;
  isPending?: boolean;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
}

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  order,
  onClose,
  onConfirmReject,
  isPending,
  rejectReason,
  setRejectReason,
}) => {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-base font-extrabold">Reject Order #{order.id}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
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
              onClick={onClose}
              variant="outline"
              className="w-1/2 border-slate-300 dark:border-slate-700 font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={() => {
                const why = rejectReason || "Payment proof could not be verified.";
                onConfirmReject(order.id, why);
              }}
              className="w-1/2 bg-rose-600 text-white font-bold hover:bg-rose-700"
            >
              {isPending && <RefreshCw size={13} className="animate-spin mr-1.5" />}
              <span>Confirm Reject</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
