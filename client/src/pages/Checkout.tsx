import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Check,
  Info,
  ShieldCheck,
  Sparkles,
  Copy,
  Megaphone,
  Clock,
  Send,
  HelpCircle,
  Lock,
  Award,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { BkashLogo, NagadLogo, RocketLogo } from "@/components/payment/PaymentIcons";

export default function Checkout() {
  const { user } = useAuth();
  const { data: bundles } = trpc.public.bundles.useQuery();
  const { data: settings } = trpc.public.paymentSettings.useQuery();
  const { data: entitlements, refetch: refetchEntitlements } = trpc.customer.entitlements.useQuery(undefined, {
    enabled: !!user,
  });

  const [selected, setSelected] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get("plan");
    if (planParam === "pro") return 101;
    if (planParam === "premium") return 102;
    const bundleParam = params.get("bundle");
    if (bundleParam) {
      const parsed = parseInt(bundleParam);
      if (!isNaN(parsed)) return parsed;
    }
    return 2;
  });
  const [error, setError] = useState("");
  const [selectedPdfIds, setSelectedPdfIds] = useState<number[]>(Array.from({ length: 15 }, (_, i) => i + 1));
  const [method, setMethod] = useState<"bkash" | "nagad" | "rocket" | "other">("bkash");
  const [tx, setTx] = useState("");
  const [ack, setAck] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [freeClaimedSuccess, setFreeClaimedSuccess] = useState(false);
  const [alreadyHadAccess, setAlreadyHadAccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const submit = trpc.customer.submitOrder.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message),
  });

  const claimFree = trpc.customer.claimFreeProduct.useMutation({
    onSuccess: (res) => {
      refetchEntitlements();
      setAlreadyHadAccess(Boolean(res?.alreadyClaimed));
      setFreeClaimedSuccess(true);
    },
    onError: (e) => setError(e.message),
  });

  const baseBundles = [
    { id: 101, titleEn: "CYCLE OF CHART — PRO PLAN (MONTHLY)", descriptionEn: "Unlimited trades · 5 books · 30 videos · Workout · Community", price: "599" },
    { id: 102, titleEn: "CYCLE OF CHART — PREMIUM PLAN (MONTHLY)", descriptionEn: "Unlimited institutional access · Mentor support · Owner chat", price: "999" },
    { id: 1, titleEn: "Free eBook Package", descriptionEn: "15 PDFs · fixed package price", price: "00" },
    { id: 2, titleEn: "CYCLE OF CHART BASIC TO ADVANCE COURSE", descriptionEn: "Structured course · eBook included", price: "2499" },
    { id: 4, titleEn: "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT", descriptionEn: "Complete A–Z Trading Blueprint", originalPrice: "5550", price: "3999" },
  ];
  const bundlesList = baseBundles.map((b) => {
    const match = bundles?.find((apiB: any) => apiB.id === b.id);
    const resolvedPrice = match?.price && match.price !== "1999.00" && match.price !== "1999" ? match.price : b.price;
    return match ? { ...b, ...match, price: resolvedPrice } : b;
  });

  const chosen = bundlesList.find((b: any) => b.id === selected);
  const price = chosen?.price || (selected === 1 ? "00" : selected === 101 ? "599" : selected === 102 ? "999" : selected === 2 ? "2499" : "3999");
  const isFree = Number(price) === 0 || price === "00" || price === "0" || selected === 1;
  const isAlreadyClaimed = Boolean(
    isFree && entitlements?.some((e: any) => e.bundleId === selected || e.scope === `bundle:${selected}`)
  );

  // Gateway metadata and dynamic active status
  const gatewaysConfig = settings?.gateways;

  const allGatewaysList = [
    {
      id: "bkash" as const,
      name: "bKash",
      banglaName: "বিকাশ",
      logo: BkashLogo,
      brandColor: "#D12053",
      activeBorder: "border-[#E2136E] dark:border-[#E2136E]",
      activeRing: "ring-[#E2136E]/30",
      badgeBg: "bg-[#E2136E]/10 text-[#E2136E] border-[#E2136E]/25",
    },
    {
      id: "nagad" as const,
      name: "Nagad",
      banglaName: "নগদ",
      logo: NagadLogo,
      brandColor: "#EA580C",
      activeBorder: "border-[#F97316] dark:border-[#F97316]",
      activeRing: "ring-[#F97316]/30",
      badgeBg: "bg-[#F97316]/10 text-[#EA580C] dark:text-[#FB923C] border-[#F97316]/25",
    },
    {
      id: "rocket" as const,
      name: "Rocket",
      banglaName: "রকেট",
      logo: RocketLogo,
      brandColor: "#8C3494",
      activeBorder: "border-[#8C3494] dark:border-[#8C3494]",
      activeRing: "ring-[#8C3494]/30",
      badgeBg: "bg-[#8C3494]/10 text-[#8C3494] dark:text-[#C084FC] border-[#8C3494]/25",
    },
  ];

  // Filter only gateways enabled by admin CMS
  const availableGateways = allGatewaysList.filter((g) => {
    if (!gatewaysConfig) return true;
    return gatewaysConfig[g.id]?.isEnabled !== false;
  });

  // Automatically select first available method if current one gets disabled
  useEffect(() => {
    if (method === "other") return;
    if (availableGateways.length > 0 && !availableGateways.some((g) => g.id === method)) {
      setMethod(availableGateways[0].id);
    }
  }, [gatewaysConfig, method]);

  const activeGatewayMeta = allGatewaysList.find((g) => g.id === method) || allGatewaysList[0];
  const activeGatewayConfig = method !== "other" ? gatewaysConfig?.[method] : undefined;
  const currentWalletNumber = activeGatewayConfig?.number || (method !== "other" ? settings?.[method] : "") || "01961079326";
  const currentAccountType = activeGatewayConfig?.accountType || "Personal";
  const currentInstructions =
    activeGatewayConfig?.instructions ||
    `Send Money using ${activeGatewayMeta.name} App, then copy and paste your Transaction ID (TrxID) below.`;

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    toast.success("Payment number copied to clipboard!");
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08111f] p-6 text-center text-white">
        <div className="max-w-md w-full">
          <div className="flex justify-center">
            <BrandLogo size={90} />
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight">Sign in to continue</h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            {isFree
              ? "Sign in or create your student account to claim and save your Free eBook Package."
              : "Orders and payment submissions are tied to your secure customer account."}
          </p>
          <Button onClick={() => startLogin()} className="mt-6 w-full h-11 bg-sky-500 text-slate-950 font-extrabold hover:bg-sky-400 shadow-lg shadow-sky-500/20">
            Sign In / Register
          </Button>
        </div>
      </div>
    );
  }

  if (freeClaimedSuccess) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] dark:bg-[#070e1b] p-5">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#0b172a] p-7 sm:p-10 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Check size={32} />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {alreadyHadAccess ? "Access Already Active!" : "Free Package Unlocked!"}
          </h1>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {alreadyHadAccess
              ? "You already have active access to the Free eBook Package. You can access all your materials anytime in your dashboard library."
              : "Your Free eBook Package has been activated and added to your student account. You can now access all institutional materials in your dashboard library."}
          </p>
          <div className="mt-6 space-y-2.5">
            <Link href="/dashboard">
              <Button className="w-full h-12 bg-[#081833] text-white font-bold hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                Go to Dashboard & Library →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] dark:bg-[#070e1b] p-5">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#0b172a] p-7 sm:p-10 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Check size={32} />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Payment Submitted</h1>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock size={13} />
            <span>Review in Progress (15–30 mins)</span>
          </div>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Your payment for <strong>{chosen?.titleEn}</strong> with Transaction ID <code className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{tx.trim().toUpperCase()}</code> has been received. Your access will be automatically unlocked as soon as our verification team approves the transaction.
          </p>
          <Link href="/dashboard">
            <Button className="mt-6 w-full h-12 bg-[#081833] text-white font-bold hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#070e1b] dark:text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur-md sticky top-0 z-30 dark:border-slate-800 dark:bg-[#070e1b]/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold tracking-[.18em]">
            <BrandLogo size={36} />
            <span className="hidden sm:inline">CYCLE OF CHART</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="compact" />
            <Link href="/dashboard" className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          <ArrowLeft size={14} /> Back to site
        </Link>

        {/* Optional Announcement Banner from Admin CMS */}
        {settings?.isAnnouncementEnabled && settings?.announcement && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-center gap-3">
            <Megaphone size={18} className="shrink-0 text-amber-500" />
            <span className="font-semibold">{settings.announcement}</span>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form Card */}
          <section className="rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-slate-200/80 dark:bg-[#0b162a] dark:border-slate-800/80">
            {error && (
              <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#0284c7] dark:text-[#38bdf8]">
              {isFree ? "FREE ACCESS ENROLLMENT" : "CHECKOUT / MANUAL VERIFICATION"}
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Choose your learning path
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {isFree
                ? "Claim instant free access to this package. No payment or transaction verification required."
                : "Select an official payment gateway, send the exact package tuition, and enter your Transaction ID for verification."}
            </p>

            {/* Bundle Selection */}
            <div className="mt-6 space-y-3">
              {bundlesList.map((b: any) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelected(b.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                    selected === b.id
                      ? "border-[#0284c7] bg-sky-50/70 shadow-xs dark:bg-sky-950/30 dark:border-sky-500 ring-2 ring-sky-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">{b.titleEn}</div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{b.descriptionEn}</div>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#0284c7] dark:text-[#38bdf8]">৳{b.price}</div>
                </button>
              ))}
            </div>

            {/* Paid vs Free Sections */}
            {!isFree ? (
              <>
                {/* Payment Method Selector */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Payment Gateway
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Select your preferred wallet
                    </span>
                  </div>

                  {availableGateways.length === 0 ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 text-center">
                      Payment gateways are temporarily offline for scheduled system maintenance. Please contact our support team to complete your enrollment manually.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableGateways.map((g) => {
                        const isSelected = method === g.id;
                        const Logo = g.logo;
                        const accountType = gatewaysConfig?.[g.id]?.accountType || "Personal";

                        return (
                          <button
                            type="button"
                            key={g.id}
                            onClick={() => setMethod(g.id)}
                            className={`relative flex items-center sm:flex-col justify-between sm:justify-center p-3.5 sm:p-4 rounded-2xl border text-left sm:text-center transition-all cursor-pointer ${
                              isSelected
                                ? `${g.activeBorder} bg-white dark:bg-[#0c1c38] shadow-md ring-2 ${g.activeRing}`
                                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#070e1b] dark:hover:border-slate-700"
                            }`}
                          >
                            {/* Desktop Checkmark */}
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 hidden sm:flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}

                            <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                              <div className="flex h-11 sm:h-12 w-24 sm:w-28 items-center justify-center rounded-xl bg-white p-1.5 shadow-xs border border-slate-200 shrink-0">
                                <Logo size={24} />
                              </div>
                              <div>
                                <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5 sm:justify-center">
                                  <span>{g.name}</span>
                                  <span className="text-xs font-semibold text-slate-400">({g.banglaName})</span>
                                </div>
                                <span className={`mt-0.5 inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${g.badgeBg}`}>
                                  {accountType}
                                </span>
                              </div>
                            </div>

                            {/* Mobile checkmark indicator */}
                            <div className="sm:hidden">
                              {isSelected ? (
                                <div className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="size-5 rounded-full border border-slate-300 dark:border-slate-700" />
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {/* Other Payment Option */}
                      <button
                        type="button"
                        onClick={() => setMethod("other")}
                        className={`relative flex items-center sm:flex-col justify-between sm:justify-center p-3.5 sm:p-4 rounded-2xl border text-left sm:text-center transition-all cursor-pointer ${
                          method === "other"
                            ? "border-sky-500 dark:border-sky-400 bg-white dark:bg-[#0c1c38] shadow-md ring-2 ring-sky-500/30"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#070e1b] dark:hover:border-slate-700"
                        }`}
                      >
                        {/* Desktop Checkmark */}
                        {method === "other" && (
                          <div className="absolute top-2.5 right-2.5 hidden sm:flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}

                        <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                          <div className="flex h-11 sm:h-12 w-24 sm:w-28 items-center justify-center rounded-xl bg-white p-1.5 shadow-xs border border-slate-200 shrink-0 text-sky-600 dark:text-sky-400">
                            <CreditCard size={24} />
                          </div>
                          <div>
                            <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5 sm:justify-center">
                              <span>Other Payment</span>
                            </div>
                            <span className="mt-0.5 inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25">
                              Manual Contact
                            </span>
                          </div>
                        </div>

                        {/* Mobile checkmark indicator */}
                        <div className="sm:hidden">
                          {method === "other" ? (
                            <div className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="size-5 rounded-full border border-slate-300 dark:border-slate-700" />
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Conditional: Other Payment Info Panel vs Gateway Details & Form */}
                {method === "other" ? (
                    <div className="rounded-3xl border border-sky-500/30 bg-sky-500/5 p-5 sm:p-6 dark:border-sky-500/20 dark:bg-[#0c1c38]/80 shadow-xs space-y-5 animate-in fade-in duration-200">
                      {/* Header */}
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70 dark:border-slate-800">
                        <div className="flex h-8 px-2.5 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                          <Send size={16} />
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Alternative Payment Method
                        </span>
                      </div>

                      {/* Required Message */}
                      <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                        If you do not use bKash, Nagad, or Rocket, please contact us for an alternative payment method.
                      </p>

                      {/* Telegram Contact Card */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-[#070e1b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                            <Send size={20} />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Telegram:
                            </div>
                            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                              @cycleofchart
                            </div>
                          </div>
                        </div>

                        <a
                          href="https://t.me/cycleofchart"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 items-center justify-center gap-2 px-5 rounded-xl font-bold text-xs sm:text-sm bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-all cursor-pointer shrink-0"
                        >
                          <Send size={14} />
                          <span>Contact on Telegram</span>
                        </a>
                      </div>

                      {/* Helpful reassurance info */}
                      <div className="flex items-start gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                        <Info size={14} className="text-sky-500 shrink-0 mt-0.5" />
                        <span>
                          We support international payment cards, bank wire transfers, crypto (USDT), or other custom arrangements. Direct message us on Telegram for immediate setup.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Payment Details Guidance Card */}
                      <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-800/90 dark:bg-[#0c182c]/80 shadow-xs space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 px-2.5 items-center justify-center rounded-lg bg-white shadow-xs border border-slate-200 shrink-0">
                              {React.createElement(activeGatewayMeta.logo, { size: 18 })}
                            </div>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                              Official {activeGatewayMeta.name} Payment Details
                            </span>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${activeGatewayMeta.badgeBg}`}>
                            {currentAccountType === "Personal" ? "Personal (Send Money)" : "Merchant (Payment)"}
                          </span>
                        </div>

                        {/* Prominent Wallet Number with 1-Click Copy */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#070e1b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {currentAccountType === "Personal" ? "Send Money to this Official Number:" : "Make Payment to this Official Number:"}
                            </div>
                            <div className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white mt-0.5">
                              {currentWalletNumber}
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => copyToClipboard(currentWalletNumber)}
                            className={`h-10 px-4 gap-2 font-bold text-xs rounded-xl shadow-xs transition-all ${
                              copiedNumber
                                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                : "bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                            }`}
                          >
                            {copiedNumber ? (
                              <>
                                <Check size={14} />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy Number</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Step-by-Step Payment Instructions */}
                        <div className="space-y-2 pt-1 text-xs">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Quick Payment Steps:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                                <span className="flex size-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black">1</span>
                                <span>Open App</span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                Open your {activeGatewayMeta.name} app.
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                                <span className="flex size-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black">2</span>
                                <span>Send ৳{price}</span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                {currentAccountType === "Personal" ? "Send Money" : "Payment"} of ৳{price} to {currentWalletNumber}.
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                                <span className="flex size-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black">3</span>
                                <span>Paste TrxID</span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                Copy Transaction ID from SMS/receipt & submit below.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Admin Custom Instruction */}
                        {currentInstructions && (
                          <div className="flex items-start gap-2 rounded-xl bg-sky-500/10 p-3 text-xs text-sky-800 dark:text-sky-300 border border-sky-500/20">
                            <Info size={15} className="shrink-0 text-sky-500 mt-0.5" />
                            <span className="text-[11px] leading-relaxed">{currentInstructions}</span>
                          </div>
                        )}
                      </div>

                    {/* Transaction ID */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Transaction ID (TrxID) *
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Found on your payment confirmation SMS
                        </span>
                      </div>
                      <input
                        value={tx}
                        onChange={(e) => setTx(e.target.value.toUpperCase())}
                        placeholder="e.g. 8A1B2C3D9E"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-bold font-mono tracking-wider outline-none focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white uppercase"
                      />
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Make sure to enter the exact Transaction ID provided by {activeGatewayMeta.name}.
                      </p>
                    </div>

                    {/* No Refund Ack */}
                    <label className="mt-6 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={ack}
                        onChange={(e) => setAck(e.target.checked)}
                        className="mt-0.5 size-4 accent-[#081833] dark:accent-sky-500 rounded"
                      />
                      <span>
                        I understand that this is a digital institutional education product and access is permanently granted to my account upon verification.
                      </span>
                    </label>

                    {/* Paid Submit Button */}
                    <Button
                      disabled={!tx.trim() || !ack || submit.isPending}
                      onClick={() =>
                        submit.mutate({
                          bundleId: selected,
                          selectedPdfIds,
                          amount: Number(price),
                          paymentMethod: method as "bkash" | "nagad" | "rocket",
                          transactionId: tx.trim(),
                          noRefundAcknowledged: true,
                        })
                      }
                      className="mt-6 w-full h-12 bg-[#081833] text-white font-extrabold text-sm hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-sky-950/20"
                    >
                      {submit.isPending ? "Submitting for Verification..." : "Submit Order for Verification →"}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Free Package Notice */}
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <div className="flex items-center gap-2 font-extrabold text-emerald-700 dark:text-emerald-400">
                    <Sparkles size={16} className="shrink-0" />
                    <span>Free Package · No Payment Required</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-800/80 dark:text-emerald-400/80">
                    Instant access will be activated directly to your student account and library with no payment or manual verification required.
                  </p>
                </div>

                {/* Free Claim Button */}
                <Button
                  disabled={claimFree.isPending}
                  onClick={() =>
                    claimFree.mutate({
                      bundleId: selected,
                      selectedPdfIds,
                    })
                  }
                  className="mt-6 w-full h-12 bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-emerald-600/20"
                >
                  {claimFree.isPending
                    ? "Activating Access..."
                    : isAlreadyClaimed
                    ? "Already Claimed — Re-sync Access"
                    : "Claim Free Package"}
                </Button>
              </>
            )}
          </section>

          {/* Sidebar Order Summary */}
          <aside className="h-fit rounded-3xl bg-[#081833] p-6 sm:p-7 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-widest text-[#38bdf8]">
                ORDER SUMMARY
              </div>
              <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300 border border-sky-500/30">
                Encrypted Checkout
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 pt-1">
              <div>
                <div className="text-lg sm:text-xl font-black">
                  {chosen?.titleEn || (selected === 1 ? "Free eBook Package" : selected === 2 ? "CYCLE OF CHART BASIC TO ADVANCE COURSE" : "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT")}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {isFree ? "100% Free · Instant Activation" : "BDT · Manual Verification"}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#38bdf8] shrink-0">
                {isFree ? "FREE" : `৳${price}`}
              </div>
            </div>

            {/* Inclusions Breakdown */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Award size={13} className="text-sky-400" />
                  <span>Lifetime Learning Access</span>
                </span>
                <span className="font-bold text-emerald-400">Lifetime</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Lock size={13} className="text-sky-400" />
                  <span>Trader Dashboard & Habit Tracker</span>
                </span>
                <span className="font-bold text-emerald-400">Included</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">Total Payable</span>
              <span className="text-2xl font-black text-white">
                {isFree ? "৳0.00" : `৳${price}`}
              </span>
            </div>

            {/* Status & Assurance */}
            <div className="space-y-3 border-t border-white/10 pt-4 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span>Verification SLA</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                  <Clock size={12} />
                  <span>15–30 mins</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Access Delivery</span>
                <span className="font-semibold text-white">
                  Instant upon approval
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Security Assurance</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>256-Bit SSL Encrypted</span>
                </span>
              </div>
            </div>

            {/* Quick Contact Help */}
            <div className="border-t border-white/10 pt-4 text-xs">
              <div className="text-[11px] font-bold text-slate-400 mb-2">Need assistance with your payment?</div>
              <a
                href="https://t.me/cycleofchart"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
              >
                <Send size={12} />
                <span>Contact Telegram Official Support</span>
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
