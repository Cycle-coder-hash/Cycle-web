import { Link } from "wouter";
import { Plus, Printer, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
  isBn?: boolean;
  orders: DashboardOrderItem[] | undefined;
  onSelectInvoiceOrder: (order: DashboardOrderItem) => void;
}

export function DashboardOrdersTab({
  orders,
  onSelectInvoiceOrder,
}: DashboardOrdersTabProps) {
  const { selectText, isUr, isRTL } = useLanguage();

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`space-y-4 sm:space-y-6 animate-in fade-in duration-300 ${isUr ? "font-urdu" : ""}`}
    >
      <div className="flex flex-col justify-between gap-3 sm:gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {selectText({
              en: "Orders & Manual Verification History",
              bn: "পেমেন্ট ও অর্ডার হিস্ট্রি",
              ur: "ادائیگی اور آرڈرز کی تصدیقی ہسٹری",
            })}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {selectText({
              en: "Track your manual payment verification statuses and generate official receipts.",
              bn: "আপনার বিকাশ, নগদ ও রকেট অর্ডারের ভেরিফিকেশন স্ট্যাটাস ও ইনভয়েস।",
              ur: "اپنی ادائیگی کی تصدیق کا اسٹیٹس چیک کریں اور رسید حاصل کریں۔",
            })}
          </p>
        </div>

        <Link href="/checkout">
          <Button size="sm" className="bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold h-8 sm:h-9 text-xs">
            <Plus size={14} className="sm:size-[15px] mr-1" />{" "}
            {selectText({
              en: "New Order",
              bn: "নতুন অর্ডার করুন",
              ur: "نیا آرڈر کریں",
            })}
          </Button>
        </Link>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {orders?.length ? (
          orders.map((o) => (
            <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span dir="ltr" className="font-extrabold text-sm sm:text-base font-mono">Order #{o.id}</span>
                  <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-sky-700 dark:text-sky-300">
                    {o.bundleId === 4
                      ? selectText({ en: "Bundle 4 · Trading Blueprint", bn: "বান্ডেল ৪ · ট্রেডিং ব্লুপ্রিন্ট", ur: "بنڈل ۴ · ٹریڈنگ بلیو پرنٹ" })
                      : o.bundleId === 2
                      ? selectText({ en: "Bundle 2 · Course + eBook", bn: "বান্ডেল ২ · কোর্স + ইবুক", ur: "بنڈل ۲ · کورس + ای بک" })
                      : o.bundleId === 1
                      ? selectText({ en: "Free eBook Package", bn: "ফ্রি ইবুক প্যাকেজ", ur: "مفت ای بک پیکیج" })
                      : selectText({ en: `Bundle #${o.bundleId}`, bn: `বান্ডেল #${o.bundleId}`, ur: `بنڈل #${o.bundleId}` })}
                  </span>
                  <span dir="ltr" className="font-mono text-[11px] sm:text-xs text-slate-400">TxID: {o.transactionId}</span>
                </div>
                <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span>
                    {selectText({ en: "Method:", bn: "পদ্ধতি:", ur: "طریقہ:" })}{" "}
                    <b className="uppercase text-slate-700 dark:text-slate-300">{o.paymentMethod}</b>
                  </span>
                  <span>•</span>
                  <span>
                    {selectText({ en: "Date:", bn: "তারিখ:", ur: "تاریخ:" })}{" "}
                    <span dir="ltr">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </span>
                  {o.orderStatus === "pending" && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {selectText({
                          en: "Approval usually within 15–30 mins",
                          bn: "১৫-৩০ মিনিটের মধ্যে অ্যাপ্রুভ হবে",
                          ur: "عام طور پر ۱۵ سے ۳۰ منٹ میں تصدیق ہو جاتی ہے",
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                <div className="text-left sm:text-right">
                  <div dir="ltr" className="text-base sm:text-lg font-black font-mono">৳{o.amount}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400">BDT</div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase ${
                      o.orderStatus === "approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : o.orderStatus === "rejected"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    }`}
                  >
                    {o.orderStatus === "approved"
                      ? selectText({ en: "Approved", bn: "অনুমোদিত", ur: "منظور شدہ" })
                      : o.orderStatus === "rejected"
                      ? selectText({ en: "Rejected", bn: "বাতিল", ur: "مسترد" })
                      : selectText({ en: "Pending Review", bn: "যাচাই প্রক্রিয়াধীন", ur: "زیر التواء جائزہ" })}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectInvoiceOrder(o)}
                    className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700 h-8 sm:h-9 px-2.5 sm:px-3"
                  >
                    <Printer size={13} />
                    <span>{selectText({ en: "Receipt", bn: "রসিদ", ur: "رسید" })}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center text-slate-500 dark:border-slate-800">
            <Receipt size={32} className="sm:size-9 mx-auto text-slate-400 mb-2.5 sm:mb-3" />
            <h3 className="font-bold text-sm sm:text-base">
              {selectText({
                en: "No orders found",
                bn: "এখনো কোনো অর্ডার নেই",
                ur: "ابھی تک کوئی آرڈر نہیں ملا",
              })}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
