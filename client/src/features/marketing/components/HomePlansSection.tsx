import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Clock, Crown, LockKeyhole, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ClaimFreePlanModal } from "@/components/subscription/ClaimFreePlanModal";

export type HomePlanModalType = "free" | "pro" | "premium" | null;

export interface SubscriptionPricingSummary {
  freeTrial?: { priceBdt?: string; priceUsd?: string };
  pro?: { priceBdt?: string; priceUsd?: string };
  premium?: { priceBdt?: string; priceUsd?: string };
}

export interface HomePlansSectionProps {
  isBn: boolean;
  selectedPlanModal: HomePlanModalType;
  setSelectedPlanModal: React.Dispatch<React.SetStateAction<HomePlanModalType>>;
  pricing?: {
    subscriptions?: SubscriptionPricingSummary;
  };
}

export function HomePlansSection({
  isBn: _isBnProp,
  selectedPlanModal,
  setSelectedPlanModal,
  pricing,
}: HomePlansSectionProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { language, selectText } = useLanguage();
  const { formatPrice, currency } = useUserPreferences();
  const isBn = language === "bn";

  const { data: subUsage } = trpc.subscription.getMyUsage.useQuery(undefined, {
    enabled: !!user,
  });
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // If user returned from login/signup after clicking "Claim Free Plan" on Store, open the claim confirmation modal without auto-claiming on login alone
  useEffect(() => {
    if (!user || !subUsage) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const hasQueryFlag = params.get("claimFreePlan") === "1";
      const hasSessionFlag = sessionStorage.getItem("cycle_pending_claim_free_plan") === "1";
      if (hasQueryFlag || hasSessionFlag) {
        sessionStorage.removeItem("cycle_pending_claim_free_plan");
        if (hasQueryFlag) {
          params.delete("claimFreePlan");
          const qs = params.toString();
          const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
          window.history.replaceState(null, "", nextUrl);
        }
        if (subUsage.plan === "unclaimed" || (subUsage as any).trialStatus === "unclaimed") {
          setIsClaimModalOpen(true);
        }
      }
    } catch {}
  }, [user, subUsage]);

  const handleClaimFreePlanClick = () => {
    if (!user) {
      try {
        sessionStorage.setItem("cycle_pending_claim_free_plan", "1");
        sessionStorage.setItem("cycle_auth_redirect", "/?claimFreePlan=1#plans");
      } catch {}
      setLocation("/login?redirect=" + encodeURIComponent("/?claimFreePlan=1#plans"));
      return;
    }
    setIsClaimModalOpen(true);
  };

  const formatBdt = (val: string | number | undefined, bn: boolean, fallback: string) => {
    const raw = val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : fallback;
    const num = parseInt(raw.replace(/\D/g, "") || "0", 10);
    if (num === 0) return bn ? "০" : "0";
    const formatted = num.toLocaleString("en-US");
    return bn ? formatted.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : formatted;
  };

  const formatUsd = (val: string | number | undefined, bn: boolean, fallback: string) => {
    const raw = val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : fallback;
    const num = parseFloat(raw);
    if (isNaN(num) || num === 0) return bn ? "০" : "0";
    const formatted = num % 1 === 0 ? num.toString() : num.toFixed(2);
    return bn ? formatted.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : formatted;
  };

  const freeTrialBdt = pricing?.subscriptions?.freeTrial?.priceBdt ?? "0";
  const freeTrialUsd = pricing?.subscriptions?.freeTrial?.priceUsd ?? "0";
  const proBdt = pricing?.subscriptions?.pro?.priceBdt ?? "599";
  const proUsd = pricing?.subscriptions?.pro?.priceUsd ?? "4.99";
  const premiumBdt = pricing?.subscriptions?.premium?.priceBdt ?? "1199";
  const premiumUsd = pricing?.subscriptions?.premium?.priceUsd ?? "9.99";

  const isTrialUnclaimed = !user || !subUsage || subUsage.plan === "unclaimed" || (subUsage as any).trialStatus === "unclaimed";
  const isTrialActive = Boolean(user && subUsage && subUsage.plan === "free_trial");
  const isTrialExpired = Boolean(user && subUsage && subUsage.plan === "free_after_trial");
  const isPaidActive = Boolean(user && subUsage && (subUsage.plan === "pro" || subUsage.plan === "premium"));

  return (
    <>
      {/* ========================================================================= */}
      {/* PLANS FOR EVERY TRADER */}
      {/* ========================================================================= */}
      <section id="plans" className="content-auto bg-[#f8fafc] dark:bg-[#070e1b] py-10 sm:py-24 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#0284c7]/10 text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-400 border border-sky-500/30">
              <Sparkles size={13} className="sm:size-3.5" />
              <span className="uppercase tracking-widest">
                {selectText({ en: "Plans For Every Trader", bn: "ট্রেডার অ্যাক্সেস প্ল্যান", ur: "ہر ٹریڈر کے لیے منصوبے" })}
              </span>
            </div>
            <h2 className="mt-2.5 sm:mt-4 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {selectText({
                en: "Transparent Trader Access. No Hidden Deductions.",
                bn: "স্বচ্ছ মাসিক অ্যাক্সেস। কোনো লুকানো চার্জ নেই।",
                ur: "شفاف ماہانہ رسائی۔ کوئی پوشیدہ کٹوتی نہیں۔",
              })}
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectText({
                en: "Claim your 20-day Free Trial whenever you are ready, or upgrade to Pro or Premium for unlimited trade logging, dedicated journal books, video uploads, daily workout routines, and direct institutional mentorship.",
                bn: "আপনার সুবিধামতো ২০ দিনের ফ্রি ট্রায়াল ক্লেইম করে শুরু করুন অথবা সম্পূর্ণ আনলিমিটেড ট্রেড, একাধিক জার্নাল বুক, ভিডিও সেভিং এবং ১-অন-১ প্রাতিষ্ঠানিক মেন্টরশিপের জন্য প্রো বা প্রিমিয়ামে আপগ্রেড করুন।",
                ur: "جب چاہیں اپنا 20 دن کا مفت ٹرائل کلیم کریں یا لامحدود ٹریڈز، متعدد جرنلز، ویڈیو اپ لوڈز، روزانہ ورزش کے معمولات اور 1-آن-1 رہنمائی کے لیے پرو یا پریمیم میں اپ گریڈ کریں۔",
              })}
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="mt-6 sm:mt-12 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 items-stretch max-w-7xl mx-auto">
            {/* CARD 1: FREE TRIAL */}
            <div className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-7 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-[#0b162a]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {selectText({ en: "Free Plan", bn: "ফ্রি প্ল্যান", ur: "مفت پلان" })}
                  </span>
                  <span className="rounded-full bg-cyan-500/15 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                    {selectText({ en: "20-DAY FREE TRIAL", bn: "২০ দিনের ফ্রি ট্রায়াল", ur: "20 دن کا مفت ٹرائل" })}
                  </span>
                </div>
                <div className="mt-3 sm:mt-4 flex items-baseline flex-wrap gap-1 sm:gap-1.5">
                  <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    {formatPrice({ bdt: freeTrialBdt, usd: freeTrialUsd, fallback: "0" })}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                    {selectText({ en: "/ 20 days", bn: "/ ২০ দিন", ur: "/ 20 دن" })}
                  </span>
                </div>
                <p className="mt-1.5 sm:mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectText({
                    en: "Starts only when you click Claim Free Plan. Your 20-day countdown begins at the exact moment of confirmation.",
                    bn: "শুধুমাত্র ‘Claim Free Plan’-এ ক্লিক করে নিশ্চিত করলেই আপনার ২০ দিনের ট্রায়াল শুরু হবে।",
                    ur: "صرف اس وقت شروع ہوتا ہے جب آپ Claim Free Plan پر کلک کرتے ہیں۔ 20 دن کا کاؤنٹ ڈاؤن تصدیق کے وقت سے شروع ہوتا ہے۔",
                  })}
                </p>

                <div className="mt-4 sm:mt-6 border-t border-slate-200/80 pt-3.5 sm:pt-5 dark:border-slate-800/80">
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 sm:mb-3">
                    {selectText({ en: "Included Features", bn: "সুবিধাসমূহ", ur: "شامل خصوصیات" })}
                  </div>
                  <ul className="space-y-2 sm:space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0 sm:size-4" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">
                          {selectText({ en: "1 Journal Book", bn: "১টি জার্নাল বুক", ur: "1 جرنل بک" })}
                        </strong>{" "}
                        {selectText({ en: "max", bn: "সর্বোচ্চ", ur: "تک" })}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0 sm:size-4" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">
                          {selectText({ en: "Unlimited Trades", bn: "আনলিমিটেড ট্রেড", ur: "لامحدود ٹریڈز" })}
                        </strong>{" "}
                        {selectText({ en: "during 20 days", bn: "২০ দিনের মধ্যে", ur: "20 دنوں میں" })}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0 sm:size-4" />
                      <span>
                        {selectText({ en: "Private Trader Notebook & Journal Analytics", bn: "প্রাইভেট নোটবুক ও জার্নাল অ্যানালিটিক্স", ur: "پرائیویٹ نوٹ بک اور جرنل اینالیٹکس" })}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5 text-slate-400 dark:text-slate-500">
                      <LockKeyhole size={14} className="shrink-0 sm:size-[15px]" />
                      <span>
                        {selectText({ en: "Video saving locked", bn: "ভিডিও সেভিং লকড", ur: "ویڈیو محفوظ کرنا مقفل" })}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5 text-slate-400 dark:text-slate-500">
                      <LockKeyhole size={14} className="shrink-0 sm:size-[15px]" />
                      <span>
                        {selectText({ en: "Workout Routine & Community locked", bn: "ওয়ার্কআউট রুটিন ও কমিউনিটি লকড", ur: "ورزش معمول اور کمیونٹی مقفل" })}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-5 sm:mt-8 space-y-2 sm:space-y-2.5">
                {isTrialUnclaimed && (
                  <Button
                    type="button"
                    onClick={handleClaimFreePlanClick}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs h-9 sm:h-10 shadow-lg shadow-cyan-500/25"
                  >
                    <Sparkles size={14} className="mr-1.5" />
                    Claim Free Plan
                  </Button>
                )}
                {isTrialActive && (
                  <Link href="/dashboard" className="block w-full">
                    <Button
                      type="button"
                      className="w-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-black text-xs h-9 sm:h-10"
                    >
                      <Clock size={14} className="mr-1.5" />
                      {selectText({
                        en: `Free Trial Active · ${subUsage?.daysLeft ?? 20} Days Left`,
                        bn: `ফ্রি ট্রায়াল সক্রিয় · ${subUsage?.daysLeft ?? 20} দিন বাকি`,
                        ur: `مفت ٹرائل فعال · ${subUsage?.daysLeft ?? 20} دن باقی`,
                      })}
                    </Button>
                  </Link>
                )}
                {isTrialExpired && (
                  <div className="space-y-2">
                    <div className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-center text-[11px] font-bold text-rose-300">
                      {selectText({
                        en: "20-Day Free Trial Expired · Upgrade to Unlock Full Access",
                        bn: "২০ দিনের ফ্রি ট্রায়াল শেষ · পূর্ণ অ্যাক্সেসের জন্য আপগ্রেড করুন",
                        ur: "20 دن کا مفت ٹرائل ختم ہو گیا · مکمل رسائی کے لیے اپ گریڈ کریں",
                      })}
                    </div>
                    <Link href="/checkout?plan=pro" className="block w-full">
                      <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs h-9 sm:h-10">
                        {selectText({ en: "Upgrade to Pro", bn: "প্রো-তে আপগ্রেড করুন", ur: "پرو میں اپ گریڈ کریں" })}
                      </Button>
                    </Link>
                  </div>
                )}
                {isPaidActive && (
                  <Link href="/dashboard" className="block w-full">
                    <Button
                      type="button"
                      className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-black text-xs h-9 sm:h-10"
                    >
                      <CheckCircle2 size={14} className="mr-1.5" />
                      {selectText({
                        en: `${subUsage?.plan?.toUpperCase()} Plan Active`,
                        bn: `${subUsage?.plan?.toUpperCase()} প্ল্যান সক্রিয়`,
                        ur: `${subUsage?.plan?.toUpperCase()} پلان فعال ہے`,
                      })}
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 h-9 sm:h-10"
                  onClick={() => setSelectedPlanModal("free")}
                >
                  {selectText({ en: "View Details", bn: "বিস্তারিত দেখুন", ur: "تفصیلات دیکھیں" })}
                </Button>
              </div>
            </div>

            {/* CARD 2: PRO PLAN (MOST POPULAR) */}
            <div className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border-2 border-sky-500 bg-white p-4 sm:p-6 lg:p-7 shadow-xl shadow-sky-500/10 dark:border-sky-500 dark:bg-[#0c182e] ring-2 ring-sky-500/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                {selectText({ en: "★ MOST POPULAR ★", bn: "★ সবচেয়ে জনপ্রিয় ★", ur: "★ سب سے مقبول ★" })}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {selectText({ en: "Pro Plan", bn: "প্রো প্ল্যান", ur: "پرو پلان" })}
                  </span>
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 border border-sky-500/25 dark:border-sky-500/20">
                    {selectText({ en: "+5 BONUS DAYS IN TRIAL", bn: "+৫ বোনাস দিন ট্রায়ালে", ur: "آزمائش میں +5 اضافی دن" })}
                  </span>
                </div>
                <div className="mt-3 sm:mt-4 flex flex-col gap-0.5" dir="ltr">
                  <div className="flex items-baseline flex-wrap gap-1 sm:gap-1.5">
                    <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      ৳{formatBdt(proBdt, false, "599")} BDT
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / month
                    </span>
                  </div>
                  <div className="flex items-baseline flex-wrap gap-1 sm:gap-1.5">
                    <span className="text-lg sm:text-2xl font-bold text-sky-600 dark:text-sky-400">
                      ${formatUsd(proUsd, false, "4.99")} USD
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / month
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 sm:mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectText({
                    en: "Manual monthly renewal. Upgrading during trial adds +5 Bonus Days (35 days total first period).",
                    bn: "ম্যানুয়াল মাসিক নবায়ন। ট্রায়াল চলাকালে নিলে পাবেন অতিরিক্ত ৫ বোনাস দিন (মোট ৩৫ দিন)।",
                    ur: "دستی ماہانہ تجدید۔ آزمائش کے دوران اپ گریڈ کرنے پر 5 اضافی دن (پہلے مہینے میں کل 35 دن)۔",
                  })}
                </p>

                <div className="mt-4 sm:mt-6 border-t border-slate-200/80 pt-3.5 sm:pt-5 dark:border-slate-800/80">
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-500 mb-2 sm:mb-3">
                    {selectText({ en: "Pro Features", bn: "প্রো সুবিধাসমূহ", ur: "پرو خصوصیات" })}
                  </div>
                  <ul className="space-y-2 sm:space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2 sm:gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={15} className="text-sky-500 shrink-0 sm:size-4" />
                      <span><strong>{selectText({ en: "Up to 5 Dedicated Journal Books", bn: "সর্বোচ্চ ৫টি ডেডিকেটেড জার্নাল বুক", ur: "5 تک مخصوص جرনল بکس" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={15} className="text-sky-500 shrink-0 sm:size-4" />
                      <span><strong>{selectText({ en: "Unlimited Trade Entries", bn: "আনলিমিটেড ট্রেড এন্ট্রি", ur: "لامحدود ٹریড اندراجات" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-sky-500 shrink-0 sm:size-4" />
                      <span><strong className="text-slate-900 dark:text-white">{selectText({ en: "30 Trade Videos / mo", bn: "প্রতি মাসে ৩০টি ট্রেড ভিডিও", ur: "ماہانہ 30 ٹریড ویڈیوز" })}</strong> {selectText({ en: "(restored on delete)", bn: "(ডিলিট করলে রিস্টোর হয়)", ur: "(ڈیلیٹ پر کوٹہ بحال)" })}</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-sky-500 shrink-0 sm:size-4" />
                      <span><strong className="text-slate-900 dark:text-white">{selectText({ en: "10 Notebook Pages & 5 Videos / mo", bn: "১০টি নোটবুক পেজ এবং ৫টি ভিডিও / মাস", ur: "10 نوٹ بک صفحات اور 5 ویڈیوز / ماہ" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-sky-500 shrink-0 sm:size-4" />
                      <span><strong className="text-slate-900 dark:text-white">{selectText({ en: "Full Workout Routine Access", bn: "সম্পূর্ণ ওয়ার্কআউট রুটিন এক্সেস", ur: "ورزش کے معمولات تک رسائی" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-sky-500 shrink-0 sm:size-4" />
                      <span><strong className="text-slate-900 dark:text-white">{selectText({ en: "Full Community Chat Access", bn: "সম্পূর্ণ কমিউনিটি চ্যাট এক্সেস", ur: "کمیونٹی چیٹ تک رسائی" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-sky-500 shrink-0 sm:size-4" />
                      <span><strong className="text-slate-900 dark:text-white">{selectText({ en: "Global Leaderboard Eligible", bn: "গ্লোবাল লিডারবোর্ডের জন্য যোগ্য", ur: "عالمی لیڈر بورڈ کے اہل" })}</strong> ({selectText({ en: "verified", bn: "ভেরিফায়েড", ur: "تصدیق شدہ" })})</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-5 sm:mt-8 space-y-2 sm:space-y-2.5">
                <Link href="/checkout?plan=pro" className="block w-full">
                  <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs h-9 sm:h-10 shadow-lg shadow-sky-500/25">
                    {selectText({
                      en: `Get Pro — ৳${formatBdt(proBdt, false, "599")} BDT / $${formatUsd(proUsd, false, "4.99")} USD / mo`,
                      bn: `প্রো কিনুন — ৳${formatBdt(proBdt, true, "599")} BDT / $${formatUsd(proUsd, true, "4.99")} USD / মাস`,
                      ur: `پرو حاصل کریں — ৳${formatBdt(proBdt, false, "599")} BDT / $${formatUsd(proUsd, false, "4.99")} USD / ماہ`,
                    })}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold border-sky-500/40 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 hover:text-sky-800 dark:hover:text-sky-200 h-9 sm:h-10"
                  onClick={() => setSelectedPlanModal("pro")}
                >
                  {selectText({ en: "View Details", bn: "বিস্তারিত দেখুন", ur: "تفصیلات دیکھیں" })}
                </Button>
              </div>
            </div>

            {/* CARD 3: PREMIUM PLAN */}
            <div className="relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-amber-500/50 bg-white bg-gradient-to-b from-amber-500/[0.06] via-amber-500/[0.02] to-transparent p-4 sm:p-6 lg:p-7 shadow-sm transition hover:shadow-lg dark:border-amber-500/40 dark:bg-[#0c1524] dark:from-amber-500/[0.04] dark:via-transparent dark:to-transparent">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                    <Crown size={14} className="sm:size-[15px]" />
                    {selectText({ en: "Premium Plan", bn: "প্রিমিয়াম প্ল্যান", ur: "پریمیم پلان" })}
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/40 dark:border-amber-500/30">
                    {selectText({ en: "INSTITUTIONAL", bn: "ইন্সটিটিউশনাল", ur: "ادارہ جاتی" })}
                  </span>
                </div>
                <div className="mt-3 sm:mt-4 flex flex-col gap-0.5" dir="ltr">
                  <div className="flex items-baseline flex-wrap gap-1 sm:gap-1.5">
                    <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      ৳{formatBdt(premiumBdt, false, "1199")} BDT
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / month
                    </span>
                  </div>
                  <div className="flex items-baseline flex-wrap gap-1 sm:gap-1.5">
                    <span className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                      ${formatUsd(premiumUsd, false, "9.99")} USD
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / month
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 sm:mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectText({
                    en: "The ultimate institutional trader suite with 1-on-1 mentorship and direct private chat with the founder.",
                    bn: "সর্বোচ্চ প্রাতিষ্ঠানিক সুযোগ-সুবিধা। মেন্টরদের সরাসরি গাইডেন্স ও ফাউন্ডারের সাথে ওয়ান-টু-ওয়ান চ্যাট।",
                    ur: "ادارہ جاتی سطح کا مکمل پیکیج بشمول 1-آن-1 رہنمائی اور بانی کے ساتھ براہ راست ذاتی چیٹ۔",
                  })}
                </p>

                <div className="mt-4 sm:mt-6 border-t border-slate-200/80 pt-3.5 sm:pt-5 dark:border-slate-800/80">
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-2 sm:mb-3">
                    {selectText({ en: "Premium Exclusive", bn: "প্রিমিয়াম সুবিধাসমূহ", ur: "خصوصی پریمیم سہولیات" })}
                  </div>
                  <ul className="space-y-2 sm:space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2 sm:gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-500 shrink-0 sm:size-4" />
                      <span><strong>{selectText({ en: "Unlimited Journal Books", bn: "আনলিমিটেড জার্নাল বুক", ur: "لامحدود جرنل بکس" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-500 shrink-0 sm:size-4" />
                      <span><strong>{selectText({ en: "Unlimited Log New Trade entries", bn: "আনলিমিটেড ট্রেড লগ করার সুবিধা", ur: "لامحدود نئی ٹریডز درج کرنے کی سہولت" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-500 shrink-0 sm:size-4" />
                      <span><strong>{selectText({ en: "Unlimited Video Saving & Notebook Pages", bn: "আনলিমিটেড ভিডিও সেভিং ও নোটবুক পেজ", ur: "لامحدود ویڈیوز اور نوٹ بک صفحات" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-500 shrink-0 sm:size-4" />
                      <span>{selectText({ en: "Workout Routine & Community Chat", bn: "ওয়ার্কআউট রুটিন ও কমিউনিটি চ্যাট", ur: "ورزش معمول اور کمیونٹی چیٹ" })}</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5">
                      <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-500 shrink-0 sm:size-4" />
                      <span><strong className="text-slate-900 dark:text-white">{selectText({ en: "Global Leaderboard Eligible", bn: "গ্লোবাল লিডারবোর্ডের জন্য যোগ্য", ur: "عالمی لیڈر بورڈ کے اہل" })}</strong> ({selectText({ en: "verified", bn: "ভেরিফায়েড", ur: "تصدیق شدہ" })})</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5 font-bold text-amber-600 dark:text-amber-500">
                      <Crown size={14} className="shrink-0 sm:size-[15px]" />
                      <span><strong>{selectText({ en: "Direct 1-on-1 Mentor Support", bn: "সরাসরি ১-অন-১ মেন্টর সাপোর্ট", ur: "براہ راست 1-آن-1 رہنمائی" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-2.5 font-bold text-amber-600 dark:text-amber-500">
                      <Crown size={14} className="shrink-0 sm:size-[15px]" />
                      <span><strong>{selectText({ en: "Direct Owner Personal Chat Access", bn: "ফাউন্ডারের সাথে সরাসরি পার্সোনাল চ্যাট এক্সেস", ur: "بانی کے ساتھ براہ راست ذاتی چیٹ" })}</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={15} className="text-amber-600 dark:text-amber-500 shrink-0 sm:size-4" />
                      <span>{selectText({ en: "Pro Remaining Days Paused & Preserved", bn: "প্রো-র অবশিষ্ট দিনগুলো সুরক্ষিত ও পজ থাকবে", ur: "پرو کے باقی ماندہ دن محفوظ اور روک دیے جائیں گے" })}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-5 sm:mt-8 space-y-2 sm:space-y-2.5">
                <Link href="/checkout?plan=premium" className="block w-full">
                  <Button className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold text-xs h-9 sm:h-10 shadow-lg shadow-amber-500/25">
                    {selectText({
                      en: `Get Premium — ৳${formatBdt(premiumBdt, false, "1199")} BDT / $${formatUsd(premiumUsd, false, "9.99")} USD / mo`,
                      bn: `প্রিমিয়াম কিনুন — ৳${formatBdt(premiumBdt, true, "1199")} BDT / $${formatUsd(premiumUsd, true, "9.99")} USD / মাস`,
                      ur: `پریمیم حاصل کریں — ৳${formatBdt(premiumBdt, false, "1199")} BDT / $${formatUsd(premiumUsd, false, "9.99")} USD / ماہ`,
                    })}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold border-amber-500/40 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 hover:text-amber-800 dark:hover:text-amber-200 h-9 sm:h-10"
                  onClick={() => setSelectedPlanModal("premium")}
                >
                  {selectText({ en: "View Details", bn: "বিস্তারিত দেখুন", ur: "تفصیلات دیکھیں" })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLAN DETAILS MODAL */}
      {selectedPlanModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 transition-all duration-300 animate-in fade-in"
          onClick={() => setSelectedPlanModal(null)}
        >
          <div
            className={`relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 scale-100 animate-in zoom-in-95 ${
              language === "bn" ? "font-bangla" : language === "ur" ? "font-urdu" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Plan Badge & Close Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-xl bg-sky-500/20 font-mono text-xs font-bold text-sky-500">
                  <Sparkles size={14} />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {selectedPlanModal === "free"
                    ? selectText({ en: "Free Trial & Free-After-Trial System", bn: "ফ্রি ট্রায়াল ও ট্রায়াল-পরবর্তী সিস্টেম", ur: "مفت آزمائش اور بعد از آزمائش کا نظام" })
                    : selectedPlanModal === "pro"
                    ? selectText({ en: "Pro Plan Breakdown", bn: "প্রো প্ল্যান বিস্তারিত বিবরণ", ur: "پرو پلان کی مکمل تفصیلات" })
                    : selectText({ en: "Premium Plan Breakdown", bn: "প্রিমিয়াম প্ল্যান বিস্তারিত বিবরণ", ur: "پریمیم پلان کی مکمل تفصیلات" })}
                </span>
              </div>

              <button
                onClick={() => setSelectedPlanModal(null)}
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedPlanModal === "free" &&
                    selectText({ en: "20-Day Claimed Free Trial & Permanent Free Tier", bn: "২০ দিনের ক্লেইমকৃত ফ্রি ট্রায়াল ও পার্মানেন্ট ফ্রি টিয়ার", ur: "20 دن کی کلیم کردہ مفت آزمائش اور مستقل مفت درجہ" })}
                  {selectedPlanModal === "pro" &&
                    selectText({
                      en: `Pro Trader Plan — ৳${formatBdt(proBdt, false, "599")} BDT / $${formatUsd(proUsd, false, "4.99")} USD per month`,
                      bn: `প্রো ট্রেডার প্ল্যান — ৳${formatBdt(proBdt, true, "599")} BDT / $${formatUsd(proUsd, true, "4.99")} USD প্রতি মাস`,
                      ur: `پرو ٹریڈر پلان — ৳${formatBdt(proBdt, false, "599")} BDT / $${formatUsd(proUsd, false, "4.99")} USD فی مہینہ`,
                    })}
                  {selectedPlanModal === "premium" &&
                    selectText({
                      en: `Premium Institutional Plan — ৳${formatBdt(premiumBdt, false, "1199")} BDT / $${formatUsd(premiumUsd, false, "9.99")} USD per month`,
                      bn: `প্রিমিয়াম ইন্সটিটিউশনাল প্ল্যান — ৳${formatBdt(premiumBdt, true, "1199")} BDT / $${formatUsd(premiumUsd, true, "9.99")} USD প্রতি মাস`,
                      ur: `پریمیم ادارہ جاتی پلان — ৳${formatBdt(premiumBdt, false, "1199")} BDT / $${formatUsd(premiumUsd, false, "9.99")} USD فی مہینہ`,
                    })}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPlanModal === "free" &&
                    selectText({
                      en: "Your 20-day Free Trial starts only when you explicitly click “Claim Free Plan.” During this 20-day period, you have 1 Journal Book with unlimited trade entries and full Private Trader Notebook access. After 20 days expire, your account enters Free-After-Trial mode (max 5 trade entries and 5 discipline days per rolling 30-day cycle).",
                      bn: "আপনার ২০ দিনের ফ্রি ট্রায়াল শুধুমাত্র তখনই শুরু হয় যখন আপনি “Claim Free Plan”-এ ক্লিক করেন। এই ২০ দিনে ১টি জার্নাল বুকে আনলিমিটেড ট্রেড এন্ট্রি ও প্রাইভেট ট্রেডার নোটবুক অ্যাক্সেস পাবেন। ২০ দিন পর অ্যাকাউন্টটি ফ্রি-আফটার-ট্রায়াল মোডে চলে যায় (প্রতি ৩০ দিনে সর্বোচ্চ ৫টি ট্রেড ও ৫টি ডিসিপ্লিন দিন)।",
                      ur: "آپ کی 20 دن کی مفت آزمائش صرف اس وقت شروع ہوتی ہے جب آپ “Claim Free Plan” پر کلک کرتے ہیں۔ اس دوران 1 جرنل بک میں لامحدود ٹریڈز اور نوٹ بک رسائی ملتی ہے۔ 20 دن بعد اکاؤنٹ فری موڈ میں چلا جاتا ہے (ماہانہ زیادہ سے زیادہ 5 ٹریڈز اور 5 ڈسپلن دن)۔",
                    })}
                  {selectedPlanModal === "pro" &&
                    selectText({
                      en: "The Pro Plan is crafted for active disciplined traders needing separate books, video storage, structured fitness routines, and community collaboration. Renew manually every month with zero automatic debits. If upgraded during your Free Trial, you receive 5 BONUS DAYS (35 days total).",
                      bn: "প্রো প্ল্যানটি সুশৃঙ্খল ট্রেডারদের জন্য ডিজাইন করা হয়েছে যাদের একাধিক জার্নাল বুক, video স্টোরেজ, ফিটনেস রুটিন এবং কমিউনিটি সুবিধা প্রয়োজন। কোনো অটো-ডেবিট ছাড়া প্রতি মাসে ম্যানুয়ালি নবায়নযোগ্য। ফ্রি ট্রায়াল চলাকালে আপগ্রেড করলে পাবেন অতিরিক্ত ৫ বোনাস দিন (মোট ৩৫ দিন)।",
                      ur: "پرو پلان فعال اور منظم ٹریڈرز کے لیے بنایا گیا ہے جنہیں علیحدہ جرنل بکس، ویڈیو اسٹوریج، فٹنس معمولات اور کمیونٹی سپورٹ درکار ہو۔ کوئی خودکار کٹوتی نہیں، ہر ماہ دستی تجدید۔ آزمائش کے دوران اپ گریڈ پر 5 بونس دن (کل 35 دن)۔",
                    })}
                  {selectedPlanModal === "premium" &&
                    selectText({
                      en: "The Premium Plan unlocks unlimited institutional scale: unlimited journal books, unlimited trade entries, unlimited video uploads, full access to daily workout routine and community chat, verified Global Leaderboard eligibility, plus direct 1-on-1 private Mentor Support and direct Owner Personal Chat access with the founder.",
                      bn: "প্রিমিয়াম প্ল্যান সম্পূর্ণ প্রাতিষ্ঠানিক সুবিধা উন্মুক্ত করে: আনলিমিটেড জার্নাল বুক, আনলিমিটেড ট্রেড এন্ট্রি, আনলিমিটেড ভিডিও আপলোড, ওয়ার্কআউট রুটিন ও কমিউনিটি চ্যাট, ভেরিফায়েড গ্লোবাল লিডারবোর্ড অ্যাক্সেস, এবং সরাসরি ১-অন-১ মেন্টর সাপোর্ট ও ফাউন্ডারের সাথে পার্সোনাল চ্যাট।",
                      ur: "پریمیم پلان مکمل ادارہ جاتی پیمانہ کھولتا ہے: لامحدود جرنل بکس، لامحدود ٹریڈ اندراجات، لامحدود ویڈیو اپ لوڈز، ورزش اور کمیونٹی چیٹ تک مکمل رسائی، تصدیق شدہ عالمی لیڈر بورڈ، اور بانی کے ساتھ براہ راست 1-آن-1 رہنمائی اور ذاتی چیٹ۔",
                    })}
                </p>
              </div>

              {/* Detailed Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 -mx-1 sm:mx-0">
                <table className="min-w-[500px] w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="p-3">{selectText({ en: "Feature", bn: "সুবিধা", ur: "خصوصیت" })}</th>
                      <th className="p-3 text-center">{selectText({ en: `Free Trial (${formatPrice({ bdt: 0, usd: 0 })})`, bn: `ফ্রি ট্রায়াল (${formatPrice({ bdt: 0, usd: 0 })})`, ur: `مفت آزمائش (${formatPrice({ bdt: 0, usd: 0 })})` })}</th>
                      <th className="p-3 text-center">{selectText({ en: `Pro (৳${formatBdt(proBdt, false, "599")} / $${formatUsd(proUsd, false, "4.99")})`, bn: `প্রো (৳${formatBdt(proBdt, true, "599")} / $${formatUsd(proUsd, true, "4.99")})`, ur: `پرو (৳${formatBdt(proBdt, false, "599")} / $${formatUsd(proUsd, false, "4.99")})` })}</th>
                      <th className="p-3 text-center">{selectText({ en: `Premium (৳${formatBdt(premiumBdt, false, "1199")} / $${formatUsd(premiumUsd, false, "9.99")})`, bn: `প্রিমিয়াম (৳${formatBdt(premiumBdt, true, "1199")} / $${formatUsd(premiumUsd, true, "9.99")})`, ur: `پریمیم (৳${formatBdt(premiumBdt, false, "1199")} / $${formatUsd(premiumUsd, false, "9.99")})` })}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "Journal Books", bn: "জার্নাল বুক", ur: "جرنل بکس" })}</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400">{selectText({ en: "1 Book", bn: "১টি বুক", ur: "1 بک" })}</td>
                      <td className="p-3 text-center font-bold text-sky-600 dark:text-sky-400">{selectText({ en: "5 Books", bn: "৫টি বুক", ur: "5 بکس" })}</td>
                      <td className="p-3 text-center font-bold text-amber-500">{selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لامحدود" })}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "Log New Trade", bn: "ট্রেড লগ এন্ট্রি", ur: "ٹریڈ لاگ اندراج" })}</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400">{selectText({ en: "Unlimited (20d Trial) / 5 (Post)", bn: "আনলিমিটেড (২০ দিন ট্রায়াল) / ৫ (পরে)", ur: "لامحدود (20 دن آزمائش) / 5 (بعد میں)" })}</td>
                      <td className="p-3 text-center font-bold text-sky-600 dark:text-sky-400">{selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لامحدود" })}</td>
                      <td className="p-3 text-center font-bold text-amber-500">{selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لامحدود" })}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "Trade Videos", bn: "ট্রেড ভিডিও", ur: "ٹریڈ ویڈیوز" })}</td>
                      <td className="p-3 text-center text-rose-500">{selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })}</td>
                      <td className="p-3 text-center font-bold text-sky-600 dark:text-sky-400">{selectText({ en: "30 / mo (Restored on del)", bn: "৩০টি / মাস (ডিলিটে রিস্টোর)", ur: "30 / ماہ (ڈیلیٹ پر بحال)" })}</td>
                      <td className="p-3 text-center font-bold text-amber-500">{selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لامحدود" })}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "Notebook Pages & Videos", bn: "নোটবুক পেজ ও ভিডিও", ur: "نوٹ بک صفحات اور ویڈیوز" })}</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400">{selectText({ en: "Templates only", bn: "শুধুমাত্র টেমপ্লেট", ur: "صرف ٹیمپلیٹس" })}</td>
                      <td className="p-3 text-center text-slate-700 dark:text-slate-300">{selectText({ en: "10 Pages / 5 Videos", bn: "১০টি পেজ / ৫টি ভিডিও", ur: "10 صفحات / 5 ویڈیوز" })}</td>
                      <td className="p-3 text-center font-bold text-amber-500">{selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لامحدود" })}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "Workout Routine", bn: "ওয়ার্কআউট রুটিন", ur: "ورزش کے معمولات" })}</td>
                      <td className="p-3 text-center text-rose-500">{selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })}</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">{selectText({ en: "Full Access", bn: "সম্পূর্ণ এক্সেস", ur: "مکمل رسائی" })}</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">{selectText({ en: "Full Access", bn: "সম্পূর্ণ এক্সেস", ur: "مکمل رسائی" })}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "Community Chat", bn: "কমিউনিটি চ্যাট", ur: "کمیونٹی چیٹ" })}</td>
                      <td className="p-3 text-center text-rose-500">{selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })}</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">{selectText({ en: "Full Access", bn: "সম্পূর্ণ এক্সেস", ur: "مکمل رسائی" })}</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">{selectText({ en: "Full Access", bn: "সম্পূর্ণ এক্সেস", ur: "مکمل رسائی" })}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "Global Leaderboard", bn: "গ্লোবাল লিডারবোর্ড", ur: "عالمی لیڈر بورڈ" })}</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400">{selectText({ en: "View Only", bn: "শুধুমাত্র দেখা", ur: "صرف دیکھنا" })}</td>
                      <td className="p-3 text-center font-bold text-sky-600 dark:text-sky-400">{selectText({ en: "Eligible (Verified)", bn: "যোগ্য (ভেরিফায়েড)", ur: "اہل (تصدیق شدہ)" })}</td>
                      <td className="p-3 text-center font-bold text-amber-500">{selectText({ en: "Eligible (Verified)", bn: "যোগ্য (ভেরিফায়েড)", ur: "اہل (تصدیق شدہ)" })}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "1-on-1 Mentor Support", bn: "১-অন-১ মেন্টর সাপোর্ট", ur: "1-آن-1 رہنمائی" })}</td>
                      <td className="p-3 text-center text-rose-500">{selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })}</td>
                      <td className="p-3 text-center text-rose-500">{selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })}</td>
                      <td className="p-3 text-center font-bold text-amber-500">{selectText({ en: "Direct 1-on-1", bn: "সরাসরি ১-অন-১", ur: "براہ راست 1-آن-1" })}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{selectText({ en: "Owner Personal Chat", bn: "ফাউন্ডার পার্সোনাল চ্যাট", ur: "بانی کے ساتھ ذاتی چیٹ" })}</td>
                      <td className="p-3 text-center text-rose-500">{selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })}</td>
                      <td className="p-3 text-center text-rose-500">{selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })}</td>
                      <td className="p-3 text-center font-bold text-amber-500">{selectText({ en: "Direct Channel", bn: "সরাসরি চ্যানেল", ur: "براہ راست چینل" })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Important Rules Alert */}
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-900 dark:text-sky-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                  <Sparkles size={14} />
                  <span>{selectText({ en: "Special Bonus & Pausing Rules", bn: "বিশেষ বোনাস ও পজ করার নিয়মাবলী", ur: "خصوصی بونس اور توقف کے اصول" })}</span>
                </div>
                <p className="leading-relaxed">
                  • <strong>{selectText({ en: "Trial Bonus:", bn: "ট্রায়াল বোনাস:", ur: "آزمائشی بونس:" })}</strong> {selectText({
                    en: "Purchasing Pro or Premium during your 20-day Free Trial immediately adds 5 Bonus Days (35 days total for that first month).",
                    bn: "২০ দিনের ফ্রি ট্রায়াল চলাকালে প্রো বা প্রিমিয়াম কিনলে সাথে সাথে ৫টি বোনাস দিন যোগ হবে (প্রথম মাসে মোট ৩৫ দিন)।",
                    ur: "20 دن کی مفت آزمائش کے دوران پرو یا پریمیم خریدنے پر فوری 5 اضافی بونس دن ملیں گے (پہلے مہینے میں کل 35 دن)۔",
                  })}
                </p>
                <p className="leading-relaxed">
                  • <strong>{selectText({ en: "Plan Switching:", bn: "প্ল্যান পরিবর্তন:", ur: "پلان کی تبدیلی:" })}</strong> {selectText({
                    en: "If you are on Pro and upgrade to Premium, your remaining Pro days are paused and preserved in the database. When Premium expires, your remaining Pro days automatically resume.",
                    bn: "আপনি প্রো-তে থাকা অবস্থায় প্রিমিয়ামে আপগ্রেড করলে অবশিষ্ট প্রো দিনগুলো ডাটাবেজে পজ ও সংরক্ষিত থাকবে। প্রিমিয়াম শেষ হলে প্রো দিনগুলো পুনরায় চালু হবে।",
                    ur: "اگر آپ پرو پلان پر ہیں اور پریمیم میں اپ گریڈ کرتے ہیں تو آپ کے باقی ماندہ پرو دن محفوظ رہیں گے۔ پریمیم ختم ہونے پر پرو کے دن دوبارہ شروع ہو جائیں گے۔",
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setSelectedPlanModal(null)}
                className="w-full sm:w-auto text-xs"
              >
                {selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
              </Button>
              {selectedPlanModal === "free" && isTrialUnclaimed && (
                <Button
                  onClick={() => {
                    setSelectedPlanModal(null);
                    handleClaimFreePlanClick();
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold text-xs"
                >
                  {selectText({
                    en: "Claim Free Plan",
                    bn: "ফ্রি প্ল্যান ক্লেইম করুন",
                    ur: "مفت پلان کلیم کریں",
                  })}
                </Button>
              )}
              {selectedPlanModal === "pro" && (
                <Link href="/checkout?plan=pro" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs">
                    {selectText({
                      en: `Proceed to Checkout (৳${formatBdt(proBdt, false, "599")} / $${formatUsd(proUsd, false, "4.99")} / mo)`,
                      bn: `চেকআউটে যান (৳${formatBdt(proBdt, true, "599")} / $${formatUsd(proUsd, true, "4.99")} / মাস)`,
                      ur: `چیک آؤٹ پر جائیں (৳${formatBdt(proBdt, false, "599")} / $${formatUsd(proUsd, false, "4.99")} / ماہ)`,
                    })}
                  </Button>
                </Link>
              )}
              {selectedPlanModal === "premium" && (
                <Link href="/checkout?plan=premium" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs">
                    {selectText({
                      en: `Proceed to Checkout (৳${formatBdt(premiumBdt, false, "1199")} / $${formatUsd(premiumUsd, false, "9.99")} / mo)`,
                      bn: `চেকআউটে যান (৳${formatBdt(premiumBdt, true, "1199")} / $${formatUsd(premiumUsd, true, "9.99")} / মাস)`,
                      ur: `چیک آؤট پر جائیں (৳${formatBdt(premiumBdt, false, "1199")} / $${formatUsd(premiumUsd, false, "9.99")} / ماہ)`,
                    })}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shared Claim Free Plan Modal */}
      <ClaimFreePlanModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        source="store"
      />
    </>
  );
}
