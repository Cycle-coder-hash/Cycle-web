import { Link } from "wouter";
import { Plus, Printer, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardOrderItem {
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

export interface DashboardOrdersTabProps {
  isBn: boolean;
  orders: DashboardOrderItem[] | undefined;
  onSelectInvoiceOrder: (order: DashboardOrderItem) => void;
}

export function DashboardOrdersTab({
  isBn,
  orders,
  onSelectInvoiceOrder,
}: DashboardOrdersTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "পেমেন্ট ও অর্ডার হিস্ট্রি" : "Orders & Manual Verification History"}</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn ? "আপনার বিকাশ, নগদ ও রকেট অর্ডারের ভেরিফিকেশন স্ট্যাটাস ও ইনভয়েস।" : "Track your manual payment verification statuses and generate official receipts."}
          </p>
        </div>

        <Link href="/checkout">
          <Button size="sm" className="bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold">
            <Plus size={15} className="mr-1" /> {isBn ? "নতুন অর্ডার করুন" : "New Order"}
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {orders?.length ? (
          orders.map((o) => (
            <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-extrabold text-base">Order #{o.id}</span>
                  <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 text-[11px] font-extrabold text-sky-700 dark:text-sky-300">
                    {o.bundleId === 4 ? "Bundle 4 · Trading Blueprint" : o.bundleId === 2 ? "Bundle 2 · Course + eBook" : o.bundleId === 1 ? "Free eBook Package" : `Bundle #${o.bundleId}`}
                  </span>
                  <span className="font-mono text-xs text-slate-400">TxID: {o.transactionId}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                  <span>{isBn ? "পদ্ধতি:" : "Method:"} <b className="uppercase text-slate-700 dark:text-slate-300">{o.paymentMethod}</b></span>
                  <span>•</span>
                  <span>{isBn ? "তারিখ:" : "Date:"} {new Date(o.createdAt).toLocaleDateString()}</span>
                  {o.orderStatus === "pending" && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {isBn ? "১৫-৩০ মিনিটের মধ্যে অ্যাপ্রুভ হবে" : "Approval usually within 15–30 mins"}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <div className="text-lg font-black">৳{o.amount}</div>
                  <div className="text-[10px] text-slate-400">BDT</div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                    o.orderStatus === "approved"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : o.orderStatus === "rejected"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  {o.orderStatus === "approved" ? (isBn ? "অনুমোদিত" : "Approved") : o.orderStatus === "rejected" ? (isBn ? "বাতিল" : "Rejected") : (isBn ? "যাচাই প্রক্রিয়াধীন" : "Pending Review")}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectInvoiceOrder(o)}
                  className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
                >
                  <Printer size={13} />
                  <span>Receipt</span>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-slate-800">
            <Receipt size={36} className="mx-auto text-slate-400 mb-3" />
            <h3 className="font-bold text-base">{isBn ? "এখনো কোনো অর্ডার নেই" : "No orders found"}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
