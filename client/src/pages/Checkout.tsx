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
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { toast } from "sonner";
import { BkashLogo, NagadLogo, RocketLogo } from "@/components/payment/PaymentIcons";

export default function Checkout() {
  const { user } = useAuth();
  const { language, selectText, isRTL } = useLanguage();
  const { formatPrice, currency } = useUserPreferences();
  const isBn = language === "bn";
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
    { id: 101, titleEn: "CYCLE OF CHART — PRO PLAN (MONTHLY)", descriptionEn: "Unlimited trades · 5 books · 30 videos · Workout · Community", price: settings?.pricing?.subscriptions?.pro?.priceBdt || "599", priceUsd: settings?.pricing?.subscriptions?.pro?.priceUsd || "4.99" },
    { id: 102, titleEn: "CYCLE OF CHART — PREMIUM PLAN (MONTHLY)", descriptionEn: "Unlimited institutional access · Mentor support · Owner chat · Leaderboard", price: settings?.pricing?.subscriptions?.premium?.priceBdt || "1199", priceUsd: settings?.pricing?.subscriptions?.premium?.priceUsd || "9.99" },
    { id: 1, titleEn: "Free eBook Package", descriptionEn: "15 PDFs · fixed package price", price: "00", priceUsd: "0" },
    { id: 2, titleEn: "CYCLE OF CHART BASIC TO ADVANCE COURSE", descriptionEn: "Structured course · eBook included", price: settings?.pricing?.courses?.basicToAdvance?.priceBdt || "2499", priceUsd: settings?.pricing?.courses?.basicToAdvance?.priceUsd || "19.99" },
    { id: 4, titleEn: "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT", descriptionEn: "Complete A–Z Trading Blueprint", originalPrice: settings?.pricing?.courses?.proBlueprint?.originalPriceBdt || "5550", price: settings?.pricing?.courses?.proBlueprint?.priceBdt || "4999", priceUsd: settings?.pricing?.courses?.proBlueprint?.priceUsd || "39.99" },
  ];
  const bundlesList = baseBundles.map((b) => {
    const match = bundles?.find((apiB: any) => apiB.id === b.id);
    const resolvedPrice = match?.price && match.price !== "1999.00" && match.price !== "1999" && match.price !== "3999" ? match.price : b.price;
    const resolvedPriceUsd = match?.priceUsd || b.priceUsd;
    return match ? { ...b, ...match, price: resolvedPrice, priceUsd: resolvedPriceUsd } : b;
  });

  const chosen = bundlesList.find((b: any) => b.id === selected);
  const price = chosen?.price || (selected === 1 ? "00" : selected === 101 ? (settings?.pricing?.subscriptions?.pro?.priceBdt || "599") : selected === 102 ? (settings?.pricing?.subscriptions?.premium?.priceBdt || "1199") : selected === 2 ? (settings?.pricing?.courses?.basicToAdvance?.priceBdt || "2499") : (settings?.pricing?.courses?.proBlueprint?.priceBdt || "4999"));
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
    toast.success(
      selectText({
        en: "Payment number copied to clipboard!",
        bn: "পেমেন্ট নম্বর ক্লিপবোর্ডে কপি করা হয়েছে!",
        ur: "ادائیگی کا نمبر کلپ بورڈ پر کاپی ہو گیا!",
      })
    );
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08111f] p-6 text-center text-white">
        <div className="max-w-md w-full">
          <div className="flex justify-center">
            <BrandLogo size={90} />
          </div>
          <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight">
            {selectText({
              en: "Sign in to continue",
              bn: "চালিয়ে যেতে সাইন ইন করুন",
              ur: "جاری رکھنے کے لیے سائن ان کریں",
            })}
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            {isFree
              ? selectText({
                  en: "Sign in or create your student account to claim and save your Free eBook Package.",
                  bn: "আপনার ফ্রি ই-বুক প্যাকেজটি সংগ্রহ ও সংরক্ষণ করতে সাইন ইন করুন বা নতুন অ্যাকাউন্ট তৈরি করুন।",
                  ur: "اپنا مفت ای بک پیکیج حاصل کرنے اور محفوظ کرنے کے لیے سائن ان کریں یا اسٹوڈنٹ اکاؤنٹ بنائیں۔",
                })
              : selectText({
                  en: "Orders and payment submissions are tied to your secure customer account.",
                  bn: "অর্ডার এবং পেমেন্ট সাবমিশন আপনার নিরাপদ স্টুডেন্ট অ্যাকাউন্টের সাথে যুক্ত থাকে।",
                  ur: "آرڈرز اور ادائیگی آپ کے محفوظ کسٹمر اکاؤنٹ سے منسلک ہوتے ہیں۔",
                })}
          </p>
          <Button onClick={() => startLogin()} className="mt-6 w-full h-11 bg-sky-500 text-slate-950 font-extrabold hover:bg-sky-400 shadow-lg shadow-sky-500/20">
            {selectText({
              en: "Sign In / Register",
              bn: "সাইন ইন / রেজিস্ট্রেশন",
              ur: "سائن ان / رجسٹریشن",
            })}
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
            {alreadyHadAccess
              ? selectText({
                  en: "Access Already Active!",
                  bn: "অ্যাক্সেস ইতিমধ্যে সক্রিয়!",
                  ur: "رسائی پہلے ہی فعال ہے!",
                })
              : selectText({
                  en: "Free Package Unlocked!",
                  bn: "ফ্রি প্যাকেজ আনলক হয়েছে!",
                  ur: "مفت پیکیج انلاک ہو گیا!",
                })}
          </h1>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {alreadyHadAccess
              ? selectText({
                  en: "You already have active access to the Free eBook Package. You can access all your materials anytime in your dashboard library.",
                  bn: "আপনার ইতিমধ্যে ফ্রি ই-বুক প্যাকেজে সক্রিয় অ্যাক্সেস রয়েছে। আপনি আপনার ড্যাশবোর্ড লাইব্রেরিতে যেকোনো সময় সমস্ত মেটেরিয়াল অ্যাক্সেস করতে পারেন।",
                  ur: "آپ کے پاس پہلے ہی مفت ای بک پیکیج کی فعال رسائی ہے۔ آپ اپنے ڈیش بورڈ لائبریری میں کسی بھی وقت تمام مواد تک رسائی حاصل کر سکتے ہیں۔",
                })
              : selectText({
                  en: "Your Free eBook Package has been activated and added to your student account. You can now access all institutional materials in your dashboard library.",
                  bn: "আপনার ফ্রি ই-বুক প্যাকেজ সক্রিয় করা হয়েছে এবং আপনার স্টুডেন্ট অ্যাকাউন্টে যোগ করা হয়েছে। এখন আপনি ড্যাশবোর্ড লাইব্রেরিতে সমস্ত প্রাতিষ্ঠানিক মেটেরিয়াল অ্যাক্সেস করতে পারবেন।",
                  ur: "آپ کا مفت ای بک پیکیج فعال ہو گیا ہے اور آپ کے اکاؤنٹ میں شامل کر دیا گیا ہے۔ اب آپ ڈیش بورڈ لائبریری میں تمام ادارہ جاتی مواد تک رسائی حاصل کر سکتے ہیں۔",
                })}
          </p>
          <div className="mt-6 space-y-2.5">
            <Link href="/dashboard">
              <Button className="w-full h-12 bg-[#081833] text-white font-bold hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                {selectText({
                  en: "Go to Dashboard & Library →",
                  bn: "ড্যাশবোর্ড ও লাইব্রেরিতে যান →",
                  ur: "ڈیش بورڈ اور لائبریری پر جائیں ←",
                })}
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
          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {selectText({
              en: "Payment Submitted",
              bn: "পেমেন্ট সাবমিট হয়েছে",
              ur: "ادائیگی جمع کرا دی گئی",
            })}
          </h1>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock size={13} />
            <span>
              {selectText({
                en: "Review in Progress (15–30 mins)",
                bn: "ভেরিফিকেশন চলছে (১৫–৩০ মিনিট)",
                ur: "جائزہ جاری ہے (15-30 منٹ)",
              })}
            </span>
          </div>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {selectText({
              en: `Your payment for ${chosen?.titleEn} with Transaction ID ${tx.trim().toUpperCase()} has been received. Your access will be automatically unlocked as soon as our verification team approves the transaction.`,
              bn: `ট্রানজ্যাকশন আইডি ${tx.trim().toUpperCase()} সহ ${chosen?.titleEn}-এর জন্য আপনার পেমেন্ট গৃহীত হয়েছে। ভেরিফিকেশন টিম অনুমোদন করলেই স্বয়ংক্রিয়ভাবে অ্যাক্সেস আনলক হবে।`,
              ur: `ٹرانزیکشن ID ${tx.trim().toUpperCase()} کے ساتھ ${chosen?.titleEn} کی ادائیگی موصول ہو گئی ہے۔ تصدیقی ٹیم کی منظوری کے بعد آپ کی رسائی خودکار طور پر بحال ہو جائے گی۔`,
            })}
          </p>
          <Link href="/dashboard">
            <Button className="mt-6 w-full h-12 bg-[#081833] text-white font-bold hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
              {selectText({
                en: "Go to Dashboard",
                bn: "ড্যাশবোর্ডে যান",
                ur: "ڈیش بورڈ پر جائیں",
              })}
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
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size={36} />
            <HeaderBrandWordmark className="hidden sm:inline-block text-xs sm:text-sm" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="compact" />
            <Link href="/dashboard" className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              {selectText({
                en: "Dashboard →",
                bn: "ড্যাশবোর্ড →",
                ur: "ڈیش بورڈ ←",
              })}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          <ArrowLeft size={14} />
          {selectText({
            en: "Back to site",
            bn: "সাইটে ফিরে যান",
            ur: "سائٹ پر واپس",
          })}
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
              {isFree
                ? selectText({
                    en: "FREE ACCESS ENROLLMENT",
                    bn: "ফ্রি অ্যাক্সেস এনরোলমেন্ট",
                    ur: "مفت رسائی داخلہ",
                  })
                : selectText({
                    en: "CHECKOUT / MANUAL VERIFICATION",
                    bn: "চেকআউট / ম্যানুয়াল ভেরিফিকেশন",
                    ur: "چیک آؤٹ / دستی تصدیق",
                  })}
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {selectText({
                en: "Choose your learning path",
                bn: "আপনার লার্নিং পাথ বেছে নিন",
                ur: "اپنا تعلیمی راستہ منتخب کریں",
              })}
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {isFree
                ? selectText({
                    en: "Claim instant free access to this package. No payment or transaction verification required.",
                    bn: "এই প্যাকেজে তাত্ক্ষণিক ফ্রি অ্যাক্সেস নিন। কোনো পেমেন্ট বা ট্রানজ্যাকশন ভেরিফিকেশনের প্রয়োজন নেই।",
                    ur: "اس پیکیج تک فوری مفت رسائی حاصل کریں۔ کسی ادائیگی یا تصدیق کی ضرورت نہیں۔",
                  })
                : selectText({
                    en: "Select an official payment gateway, send the exact package tuition, and enter your Transaction ID for verification.",
                    bn: "অফিসিয়াল পেমেন্ট গেটওয়ে বেছে নিন, নির্ধারিত ফি পাঠান এবং ভেরিফিকেশনের জন্য ট্রানজ্যাকশন আইডি প্রদান করুন।",
                    ur: "سرکاری ادائیگی کا گیٹ وے منتخب کریں، مقررہ فیس بھیجیں اور تصدیق کے لیے ٹرانزیکشن ID درج کریں۔",
                  })}
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
                    <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {isBn ? b.titleBn || b.titleEn : b.titleEn}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {isBn ? b.descriptionBn || b.descriptionEn : b.descriptionEn}
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#0284c7] dark:text-[#38bdf8] shrink-0 text-right" dir="ltr">
                    {b.id === 1 ? (
                      <span>৳0 / $0</span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span>৳{b.price} BDT</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          ${b.priceUsd} USD
                        </span>
                      </div>
                    )}
                  </div>
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
                      {selectText({
                        en: "Payment Gateway",
                        bn: "পেমেন্ট গেটওয়ে",
                        ur: "ادائیگی کا گیٹ وے",
                      })}
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {selectText({
                        en: "Select your preferred wallet",
                        bn: "আপনার পছন্দের ওয়ালেট বেছে নিন",
                        ur: "اپنا پسندیدہ والٹ منتخب کریں",
                      })}
                    </span>
                  </div>

                  {availableGateways.length === 0 ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 text-center">
                      {selectText({
                        en: "Payment gateways are temporarily offline for scheduled system maintenance. Please contact our support team to complete your enrollment manually.",
                        bn: "সিস্টেম রক্ষণাবেক্ষণের জন্য পেমেন্ট গেটওয়ে সাময়িকভাবে বন্ধ আছে। ম্যানুয়ালি এনরোল করতে সাপোর্ট টিমের সাথে যোগাযোগ করুন।",
                        ur: "طے شدہ دیکھ بھال کی وجہ سے ادائیگی کے گیٹ ویز عارضی طور پر آف لائن ہیں۔ براہ کرم سپورٹ ٹیم سے رابطہ کریں۔",
                      })}
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
                              <span>
                                {selectText({
                                  en: "Other Payment",
                                  bn: "অন্যান্য পেমেন্ট",
                                  ur: "دیگر طریقہ ادائیگی",
                                })}
                              </span>
                            </div>
                            <span className="mt-0.5 inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25">
                              {selectText({
                                en: "Manual Contact",
                                bn: "ম্যানুয়াল যোগাযোগ",
                                ur: "دستی رابطہ",
                              })}
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
                          {selectText({
                            en: "Alternative Payment Method",
                            bn: "বিকল্প পেমেন্ট মাধ্যম",
                            ur: "متبادل طریقہ ادائیگی",
                          })}
                        </span>
                      </div>

                      {/* Required Message */}
                      <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                        {selectText({
                          en: "If you do not use bKash, Nagad, or Rocket, please contact us for an alternative payment method.",
                          bn: "আপনি যদি বিকাশ, নগদ বা রকেট ব্যবহার না করেন, তবে বিকল্প পেমেন্ট পদ্ধতির জন্য আমাদের সাথে যোগাযোগ করুন।",
                          ur: "اگر آپ bKash، Nagad، یا Rocket استعمال نہیں کرتے ہیں، تو متبادل ادائیگی کے لیے ہم سے رابطہ کریں۔",
                        })}
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
                          <span>
                            {selectText({
                              en: "Contact on Telegram",
                              bn: "টেলিগ্রামে যোগাযোগ করুন",
                              ur: "ٹیلیگرام پر رابطہ کریں",
                            })}
                          </span>
                        </a>
                      </div>

                      {/* Helpful reassurance info */}
                      <div className="flex items-start gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                        <Info size={14} className="text-sky-500 shrink-0 mt-0.5" />
                        <span>
                          {selectText({
                            en: "We support international payment cards, bank wire transfers, crypto (USDT), or other custom arrangements. Direct message us on Telegram for immediate setup.",
                            bn: "আমরা আন্তর্জাতিক পেমেন্ট কার্ড, ব্যাংক ওয়্যার ট্রান্সফার, ক্রিপ্টো (USDT) বা অন্যান্য বিশেষ ব্যবস্থা সাপোর্ট করি। বিস্তারিত জানতে টেলিগ্রামে মেসেজ করুন।",
                            ur: "ہم بین الاقوامی پیمنٹ کارڈز، بینک ٹرانسفر، کرپٹو (USDT) یا دیگر کسٹم انتظامات کو سپورٹ کرتے ہیں۔ فوری سیٹ اپ کے لیے ٹیلیگرام پر رابطہ کریں۔",
                          })}
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
                              {selectText({
                                en: `Official ${activeGatewayMeta.name} Payment Details`,
                                bn: `অফিসিয়াল ${activeGatewayMeta.name} পেমেন্ট বিবরণ`,
                                ur: `آفیشل ${activeGatewayMeta.name} ادائیگی کی تفصیلات`,
                              })}
                            </span>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${activeGatewayMeta.badgeBg}`}>
                            {currentAccountType === "Personal"
                              ? selectText({ en: "Personal (Send Money)", bn: "ব্যক্তিগত (Send Money)", ur: "ذاتی (Send Money)" })
                              : selectText({ en: "Merchant (Payment)", bn: "মার্চেন্ট (Payment)", ur: "مرچنٹ (Payment)" })}
                          </span>
                        </div>

                        {/* Prominent Wallet Number with 1-Click Copy */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#070e1b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {currentAccountType === "Personal"
                                ? selectText({
                                    en: "Send Money to this Official Number:",
                                    bn: "এই অফিসিয়াল নম্বরে Send Money করুন:",
                                    ur: "اس آفیشل نمبر پر Send Money بھیجیں:",
                                  })
                                : selectText({
                                    en: "Make Payment to this Official Number:",
                                    bn: "এই অফিসিয়াল নম্বরে Payment করুন:",
                                    ur: "اس آفیشل نمبر پر Payment کریں:",
                                  })}
                            </div>
                            <div dir="ltr" className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white mt-0.5 select-all">
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
                                <span>{selectText({ en: "Copied!", bn: "কপি হয়েছে!", ur: "کاپی ہو گیا!" })}</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>{selectText({ en: "Copy Number", bn: "নম্বর কপি করুন", ur: "نمبر کاپی کریں" })}</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Step-by-Step Payment Instructions */}
                        <div className="space-y-2 pt-1 text-xs">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {selectText({ en: "Quick Payment Steps:", bn: "পেমেন্টের সহজ ধাপসমূহ:", ur: "فوری ادائیگی کے مراحل:" })}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                                <span className="flex size-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black">1</span>
                                <span>{selectText({ en: "Open App", bn: "অ্যাপ খুলুন", ur: "ایپ کھولیں" })}</span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                {selectText({
                                  en: `Open your ${activeGatewayMeta.name} app.`,
                                  bn: `আপনার ${activeGatewayMeta.name} অ্যাপটি ওপেন করুন।`,
                                  ur: `اپنی ${activeGatewayMeta.name} ایپ کھولیں۔`,
                                })}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                                <span className="flex size-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black">2</span>
                                <span>
                                  {selectText({
                                    en: `Send ৳${price} BDT`,
                                    bn: `৳${price} BDT পাঠান`,
                                    ur: `৳${price} BDT بھیجیں`,
                                  })}
                                  {chosen?.priceUsd && (
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-1">
                                      (${chosen.priceUsd} USD)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                {selectText({
                                  en: `${currentAccountType === "Personal" ? "Send Money" : "Payment"} of ৳${price} to ${currentWalletNumber}.`,
                                  bn: `${currentWalletNumber} নম্বরে ৳${price} ${currentAccountType === "Personal" ? "Send Money" : "Payment"} করুন।`,
                                  ur: `${currentWalletNumber} پر ৳${price} کی ${currentAccountType === "Personal" ? "Send Money" : "Payment"} کریں۔`,
                                })}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px]">
                                <span className="flex size-4 items-center justify-center rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black">3</span>
                                <span>{selectText({ en: "Paste TrxID", bn: "TrxID পেস্ট করুন", ur: "TrxID درج کریں" })}</span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                {selectText({
                                  en: "Copy Transaction ID from SMS/receipt & submit below.",
                                  bn: "SMS বা রসিদ থেকে Transaction ID কপি করে নিচে সাবমিট করুন।",
                                  ur: "SMS یا رسید سے Transaction ID کاپی کر کے نیچے جمع کرائیں۔",
                                })}
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
                          {selectText({
                            en: "Transaction ID (TrxID) *",
                            bn: "ট্রানজ্যাকশন আইডি (TrxID) *",
                            ur: "ٹرانزیکشن آئی ڈی (TrxID) *",
                          })}
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {selectText({
                            en: "Found on your payment confirmation SMS",
                            bn: "পেমেন্ট নিশ্চিতকরণ SMS-এ পাওয়া যাবে",
                            ur: "ادائیگی کی تصدیقی SMS میں موجود ہے",
                          })}
                        </span>
                      </div>
                      <input
                        dir="ltr"
                        value={tx}
                        onChange={(e) => setTx(e.target.value.toUpperCase())}
                        placeholder="e.g. 8A1B2C3D9E"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-bold font-mono tracking-wider outline-none focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white uppercase"
                      />
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        {selectText({
                          en: `Make sure to enter the exact Transaction ID provided by ${activeGatewayMeta.name}.`,
                          bn: `${activeGatewayMeta.name} থেকে পাওয়া সঠিক Transaction ID নিশ্চিত হয়ে প্রবেশ করান।`,
                          ur: `${activeGatewayMeta.name} سے موصول ہونے والی درست Transaction ID درج کریں۔`,
                        })}
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
                        {selectText({
                          en: "I understand that this is a digital institutional education product and access is permanently granted to my account upon verification.",
                          bn: "আমি বুঝতে পারছি যে এটি একটি ডিজিটাল প্রাতিষ্ঠানিক শিক্ষা প্রোগ্রাম এবং যাচাইকরণের পর আমার অ্যাকাউন্টে স্থায়ী অ্যাক্সেস দেওয়া হবে।",
                          ur: "میں سمجھتا/سمجھتی ہوں کہ یہ ایک ڈیجیٹل ادارہ جاتی تعلیمی پروگرام ہے اور تصدیق کے بعد میرے اکاؤنٹ کو مستقل رسائی دی جائے گی۔",
                        })}
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
                      {submit.isPending
                        ? selectText({
                            en: "Submitting for Verification...",
                            bn: "যাচাইয়ের জন্য পাঠানো হচ্ছে...",
                            ur: "تصدیق کے لیے بھیجا جا رہا ہے...",
                          })
                        : selectText({
                            en: "Submit Order for Verification →",
                            bn: "যাচাইকরণের জন্য অর্ডার জমা দিন →",
                            ur: "تصدیق کے لیے آرڈر جمع کرائیں ←",
                          })}
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
                    <span>
                      {selectText({
                        en: "Free Package · No Payment Required",
                        bn: "ফ্রি প্যাকেজ · কোনো পেমেন্টের প্রয়োজন নেই",
                        ur: "مفت پیکج · کسی ادائیگی کی ضرورت نہیں",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-800/80 dark:text-emerald-400/80">
                    {selectText({
                      en: "Instant access will be activated directly to your student account and library with no payment or manual verification required.",
                      bn: "কোনো পেমেন্ট বা ম্যানুয়াল যাচাইকরণ ছাড়াই তাত্ক্ষণিকভাবে আপনার স্টুডেন্ট অ্যাকাউন্ট এবং লাইব্রেরিতে অ্যাক্সেস সক্রিয় হয়ে যাবে।",
                      ur: "بغیر کسی ادائیگی یا دستی تصدیق کے فوری طور پر آپ کے اسٹوڈنٹ اکاؤنٹ اور لائبریری میں رسائی چالو ہو جائے گی۔",
                    })}
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
                    ? selectText({
                        en: "Activating Access...",
                        bn: "অ্যাক্সেস সক্রিয় করা হচ্ছে...",
                        ur: "رسائی چالو کی جا رہی ہے...",
                      })
                    : isAlreadyClaimed
                    ? selectText({
                        en: "Already Claimed — Re-sync Access",
                        bn: "ইতিমধ্যে নেওয়া হয়েছে — পুনরায় সিঙ্ক করুন",
                        ur: "پہلے سے حاصل شدہ — دوبارہ رسائی ہم آہنگ کریں",
                      })
                    : selectText({
                        en: "Claim Free Package",
                        bn: "ফ্রি প্যাকেজ সংগ্রহ করুন",
                        ur: "مفت پیکج حاصل کریں",
                      })}
                </Button>
              </>
            )}
          </section>

          {/* Sidebar Order Summary */}
          <aside className="h-fit rounded-3xl bg-[#081833] p-6 sm:p-7 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-widest text-[#38bdf8]">
                {selectText({
                  en: "ORDER SUMMARY",
                  bn: "অর্ডার সারাংশ",
                  ur: "آرڈر کا خلاصہ",
                })}
              </div>
              <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-300 border border-sky-500/30">
                {selectText({
                  en: "Encrypted Checkout",
                  bn: "এনক্রিপ্ট করা চেকআউট",
                  ur: "محفوظ چیک آؤٹ",
                })}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 pt-1">
              <div>
                <div className="text-lg sm:text-xl font-black">
                  {chosen?.titleEn || (selected === 1 ? selectText({ en: "Free eBook Package", bn: "ফ্রি ইবুক প্যাকেজ", ur: "مفت ای بک پیکج" }) : selected === 2 ? "CYCLE OF CHART BASIC TO ADVANCE COURSE" : "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT")}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {isFree
                    ? selectText({
                        en: "100% Free · Instant Activation",
                        bn: "১০০% ফ্রি · তাৎক্ষণিক অ্যাক্টিভেশন",
                        ur: "100% مفت · فوری ایکٹیویشن",
                      })
                    : selectText({
                        en: "BDT · Manual Verification",
                        bn: "BDT · ম্যানুয়াল যাচাইকরণ",
                        ur: "BDT · دستی تصدیق",
                      })}
                </div>
              </div>
              <div dir="ltr" className="text-2xl sm:text-3xl font-black text-[#38bdf8] shrink-0 text-right">
                {isFree ? (
                  selectText({ en: "FREE", bn: "ফ্রি", ur: "مفت" })
                ) : (
                  <div className="flex flex-col items-end">
                    <span>৳{price} BDT</span>
                    {chosen?.priceUsd && (
                      <span className="text-sm sm:text-base font-bold text-slate-300">
                        ${chosen.priceUsd} USD
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Inclusions Breakdown */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Award size={13} className="text-sky-400" />
                  <span>
                    {selectText({
                      en: "Lifetime Learning Access",
                      bn: "লাইফটাইম শেখার অ্যাক্সেস",
                      ur: "تاحیات سیکھنے کی رسائی",
                    })}
                  </span>
                </span>
                <span className="font-bold text-emerald-400">
                  {selectText({ en: "Lifetime", bn: "লাইফটাইম", ur: "تاحیات" })}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Lock size={13} className="text-sky-400" />
                  <span>
                    {selectText({
                      en: "Trader Dashboard & Habit Tracker",
                      bn: "Trader Dashboard এবং হ্যাবিট ট্র্যাকার",
                      ur: "Trader Dashboard اور عادت ٹریکر",
                    })}
                  </span>
                </span>
                <span className="font-bold text-emerald-400">
                  {selectText({ en: "Included", bn: "যুক্ত রয়েছে", ur: "شامل ہے" })}
                </span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">
                {selectText({ en: "Total Payable", bn: "মোট প্রদেয়", ur: "کل واجب الادا" })}
              </span>
              <div dir="ltr" className="text-right">
                {isFree ? (
                  <span className="text-2xl font-black text-white">
                    ৳0 / $0
                  </span>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-white">৳{price} BDT</span>
                    {chosen?.priceUsd && (
                      <span className="text-xs text-slate-300 font-bold">
                        ${chosen.priceUsd} USD
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status & Assurance */}
            <div className="space-y-3 border-t border-white/10 pt-4 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span>{selectText({ en: "Verification SLA", bn: "যাচাইকরণের সময়", ur: "تصدیق کا وقت" })}</span>
                <span dir="ltr" className="inline-flex items-center gap-1 font-bold text-amber-300">
                  <Clock size={12} />
                  <span>15–30 mins</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>{selectText({ en: "Access Delivery", bn: "অ্যাক্সেস সরবরাহ", ur: "رسائی کی فراہمی" })}</span>
                <span className="font-semibold text-white">
                  {selectText({ en: "Instant upon approval", bn: "অনুমোদনের সাথে সাথে", ur: "منظوری پر فوری" })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>{selectText({ en: "Security Assurance", bn: "নিরাপত্তা নিশ্চয়তা", ur: "سیکیورٹی کا یقین" })}</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>256-Bit SSL Encrypted</span>
                </span>
              </div>
            </div>

            {/* Quick Contact Help */}
            <div className="border-t border-white/10 pt-4 text-xs">
              <div className="text-[11px] font-bold text-slate-400 mb-2">
                {selectText({
                  en: "Need assistance with your payment?",
                  bn: "আপনার পেমেন্ট নিয়ে কোনো সাহায্যের প্রয়োজন?",
                  ur: "کیا آپ کو اپنی ادائیگی میں مدد چاہیے؟",
                })}
              </div>
              <a
                href="https://t.me/cycleofchart"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
              >
                <Send size={12} />
                <span>
                  {selectText({
                    en: "Contact Telegram Official Support",
                    bn: "Telegram অফিসিয়াল সাপোর্টে যোগাযোগ করুন",
                    ur: "Telegram آفیشل سپورٹ سے رابطہ کریں",
                  })}
                </span>
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
