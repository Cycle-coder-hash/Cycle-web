import { Printer, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { selectText, isUr, isRTL } = useLanguage();

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${
          isUr ? "font-urdu" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className="text-xs font-black tracking-widest uppercase">
              {selectText({
                en: "OFFICIAL RECEIPT",
                bn: "অফিসিয়াল রসিদ",
                ur: "سرکاری رسید",
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
            aria-label={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">
                {selectText({ en: "Invoice Number", bn: "ইনভয়েস নম্বর", ur: "انوائس نمبر" })}
              </div>
              <div dir="ltr" className="font-mono font-bold text-sm">#INV-COC-{order.id}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">
                {selectText({ en: "Date", bn: "তারিখ", ur: "تاریخ" })}
              </div>
              <div dir="ltr" className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">
                {selectText({ en: "Customer ID:", bn: "কাস্টমার আইডি:", ur: "کسٹمر آئی ڈی:" })}
              </span>
              <span dir="ltr" className="font-bold">Student #{order.customerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {selectText({ en: "Payment Gateway:", bn: "পেমেন্ট গেটওয়ে:", ur: "ادائیگی کا گیٹ وے:" })}
              </span>
              <span className="font-bold uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {selectText({ en: "Transaction ID:", bn: "ট্রানজ্যাকশন আইডি:", ur: "ٹرانزیکشن آئی ڈی:" })}
              </span>
              <span dir="ltr" className="font-mono font-bold">{order.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {selectText({ en: "Verification Status:", bn: "ভেরিফিকেশন স্ট্যাটাস:", ur: "تصدیقی اسٹیٹس:" })}
              </span>
              <span className="font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                {order.orderStatus === "approved"
                  ? selectText({ en: "Approved", bn: "অনুমোদিত", ur: "منظور شدہ" })
                  : order.orderStatus === "rejected"
                  ? selectText({ en: "Rejected", bn: "বাতিল", ur: "مسترد" })
                  : selectText({ en: "Pending Review", bn: "যাচাই প্রক্রিয়াধীন", ur: "زیر التواء جائزہ" })}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 flex justify-between items-center border border-slate-100 dark:border-slate-800">
            <span className="font-bold">
              {selectText({ en: "Total Paid:", bn: "মোট পরিশোধ:", ur: "کل ادا شدہ:" })}
            </span>
            <span dir="ltr" className="text-xl font-black text-[#081833] dark:text-white font-mono">
              ৳{order.amount} BDT
            </span>
          </div>

          <Button
            type="button"
            onClick={() => window.print()}
            className="w-full gap-2 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 cursor-pointer"
          >
            <Printer size={14} />
            <span>
              {selectText({
                en: "Print Official Invoice",
                bn: "অফিসিয়াল ইনভয়েস প্রিন্ট করুন",
                ur: "سرکاری انوائس پرنٹ کریں",
              })}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
