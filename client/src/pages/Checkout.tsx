import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, Info, UploadCloud, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

export default function Checkout() {
  const { user } = useAuth();
  const { data: bundles } = trpc.public.bundles.useQuery();
  const { data: settings } = trpc.public.paymentSettings.useQuery();

  const [selected, setSelected] = useState(1);
  const [error, setError] = useState("");
  const [selectedPdfIds, setSelectedPdfIds] = useState<number[]>(Array.from({ length: 15 }, (_, i) => i + 1));
  const [method, setMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [tx, setTx] = useState("");
  const [ack, setAck] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.customer.submitOrder.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message),
  });

  const chosen = bundles?.find((b: any) => b.id === selected);
  const price = chosen?.price || (selected === 1 ? "199" : selected === 2 ? "399" : "799");

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08111f] p-6 text-center text-white">
        <div className="max-w-md w-full">
          <div className="flex justify-center">
            <BrandLogo size={90} />
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight">Sign in to continue</h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Orders and payment submissions are tied to your secure customer account.
          </p>
          <Button onClick={() => startLogin()} className="mt-6 w-full h-11 bg-sky-500 text-slate-950 font-extrabold hover:bg-sky-400">
            Sign In / Register
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] p-5">
        <div className="max-w-md w-full rounded-3xl bg-white p-7 sm:p-10 text-center shadow-xl border border-slate-200">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Check size={28} />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900">Payment Submitted</h1>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500">
            Your order is pending review. Digital access will be unlocked as soon as an admin verifies your transaction ID.
          </p>
          <Link href="/dashboard">
            <Button className="mt-6 w-full h-11 bg-[#081833] text-white font-bold hover:bg-[#0c244b]">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const bundlesList = bundles?.length
    ? bundles
    : [
        { id: 1, titleEn: "PDF Package", descriptionEn: "15 PDFs · fixed package price", price: "199" },
        { id: 2, titleEn: "Course + eBook", descriptionEn: "Structured course · eBook included", price: "399" },
        { id: 3, titleEn: "Full Bundle", descriptionEn: "15 PDFs · course · eBook", price: "799" },
      ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold tracking-[.18em]">
            <BrandLogo size={36} />
            <span className="hidden sm:inline">CYCLE OF CHART</span>
          </Link>
          <Link href="/dashboard" className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900">
            Dashboard →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800">
          <ArrowLeft size={14} /> Back to site
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form Card */}
          <section className="rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-slate-200/80">
            {error && (
              <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#0284c7]">
              CHECKOUT / MANUAL VERIFICATION
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">Choose your learning path</h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
              Submit your payment transaction ID. Access will be granted after manual verification.
            </p>

            {/* Bundle Selection */}
            <div className="mt-6 space-y-3">
              {bundlesList.map((b: any) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelected(b.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    selected === b.id
                      ? "border-[#0284c7] bg-sky-50/60 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-sm sm:text-base text-slate-900">{b.titleEn}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{b.descriptionEn}</div>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#0284c7]">৳{b.price}</div>
                </button>
              ))}
            </div>

            {/* Selected PDFs Filter (When PDF package chosen) */}
            {selected === 1 && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">Select Included PDFs</div>
                    <div className="text-[11px] text-slate-500">15-PDF complete library · Fixed ৳199</div>
                  </div>
                  <span className="text-xs font-extrabold text-[#0284c7]">
                    {selectedPdfIds.length} / 15
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Array.from({ length: 15 }, (_, i) => i + 1).map((id) => {
                    const isChecked = selectedPdfIds.includes(id);
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() =>
                          setSelectedPdfIds((ids) =>
                            ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
                          )
                        }
                        className={`rounded-xl border py-2 text-xs font-bold transition ${
                          isChecked
                            ? "border-[#081833] bg-[#081833] text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        PDF {id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="mt-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Payment Method
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["bkash", "nagad", "rocket"] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`rounded-xl border py-2.5 text-xs sm:text-sm font-extrabold capitalize transition ${
                      method === m
                        ? "border-[#081833] bg-[#081833] text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-2xl bg-sky-50/80 border border-sky-200/60 p-3.5 text-xs text-slate-800">
                <div className="flex items-center gap-2 font-extrabold text-[#0369a1]">
                  <Info size={15} className="shrink-0" />
                  <span>Send ৳{price} to {settings?.[method] || "01961079326"}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-600">
                  Send Money using {method.toUpperCase()}, then paste your Transaction ID below.
                </div>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="mt-5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Transaction ID (TrxID)
              </label>
              <input
                value={tx}
                onChange={(e) => setTx(e.target.value)}
                placeholder="e.g. 8A1B2C3D"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-sky-500/20 uppercase"
              />
            </div>

            {/* No Refund Ack */}
            <label className="mt-5 flex items-start gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="mt-0.5 size-4 accent-[#081833] rounded"
              />
              <span>I understand that this is a digital product and no refund is provided after access is granted.</span>
            </label>

            {/* Submit Button */}
            <Button
              disabled={!tx || !ack || submit.isPending}
              onClick={() =>
                submit.mutate({
                  bundleId: selected,
                  selectedPdfIds,
                  amount: Number(price),
                  paymentMethod: method,
                  transactionId: tx.trim(),
                  noRefundAcknowledged: true,
                })
              }
              className="mt-6 w-full h-12 bg-[#081833] text-white font-extrabold text-sm hover:bg-[#0c244b] active:scale-[0.99] disabled:opacity-50"
            >
              {submit.isPending ? "Submitting..." : "Submit Order for Review"}
            </Button>
          </section>

          {/* Sidebar Order Summary */}
          <aside className="h-fit rounded-3xl bg-[#081833] p-6 sm:p-7 text-white shadow-xl">
            <div className="text-xs font-black uppercase tracking-widest text-[#38bdf8]">
              ORDER SUMMARY
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <div className="text-lg sm:text-xl font-bold">
                  {chosen?.titleEn || (selected === 1 ? "PDF Package" : selected === 2 ? "Course + eBook" : "Full Bundle")}
                </div>
                <div className="mt-1 text-xs text-slate-400">BDT · Manual Verification</div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#38bdf8]">৳{price}</div>
            </div>

            <div className="mt-8 space-y-3 border-t border-white/10 pt-6 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-bold text-amber-300">Pending Review</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-medium text-white">Instant Dashboard Access upon Approval</span>
              </div>
              <div className="flex justify-between">
                <span>Security</span>
                <span className="font-medium text-emerald-400">Verified & Encrypted</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
