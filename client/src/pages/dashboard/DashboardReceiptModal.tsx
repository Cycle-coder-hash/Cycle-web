import { Printer, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";

export interface DashboardInvoiceOrder {
  id: number | string;
  customerId?: number | string;
  bundleId?: number | null;
  productId?: number | null;
  amount: string | number;
  currency?: string;
  paymentMethod: string;
  transactionId: string;
  orderStatus: string;
  createdAt: Date | string;
}

export interface DashboardReceiptModalProps {
  order: DashboardInvoiceOrder | null;
  onClose: () => void;
}

export function DashboardReceiptModal({
  order,
  onClose,
}: DashboardReceiptModalProps) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className="text-xs font-black tracking-widest uppercase">OFFICIAL RECEIPT</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Invoice Number</div>
              <div className="font-mono font-bold text-sm">#INV-COC-{order.id}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Date</div>
              <div className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer ID:</span>
              <span className="font-bold">Student #{order.customerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Gateway:</span>
              <span className="font-bold uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono font-bold">{order.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Verification Status:</span>
              <span className="font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 flex justify-between items-center border border-slate-100 dark:border-slate-800">
            <span className="font-bold">Total Paid:</span>
            <span className="text-xl font-black text-[#081833] dark:text-white">৳{order.amount} BDT</span>
          </div>

          <Button
            type="button"
            onClick={() => window.print()}
            className="w-full gap-2 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Official Invoice</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
