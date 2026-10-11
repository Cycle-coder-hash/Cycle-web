import React from "react";
import { Link } from "wouter";
import { CheckCircle2, Crown, LockKeyhole, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  isBn,
  selectedPlanModal,
  setSelectedPlanModal,
  pricing,
}: HomePlansSectionProps) {
  const formatBdt = (val: string | number | undefined, bn: boolean, fallback: string) => {
    const raw = val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : fallback;
    const num = parseInt(raw.replace(/\D/g, "") || "0", 10);
    if (num === 0) return bn ? "০" : "0";
    const formatted = num.toLocaleString("en-US");
    return bn ? formatted.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : formatted;
  };

  const formatUsd = (val: string | number | undefined, bn: boolean, fallback: string) => {
    const raw = val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : fallback;
    const num = parseInt(raw.replace(/\D/g, "") || "0", 10);
    const formatted = num === 0 ? "0" : num.toLocaleString("en-US");
    return bn ? formatted.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : formatted;
  };

  const freeTrialBdt = pricing?.subscriptions?.freeTrial?.priceBdt ?? "0";
  const freeTrialUsd = pricing?.subscriptions?.freeTrial?.priceUsd ?? "0";
  const proBdt = pricing?.subscriptions?.pro?.priceBdt ?? "599";
  const proUsd = pricing?.subscriptions?.pro?.priceUsd ?? "5";
  const premiumBdt = pricing?.subscriptions?.premium?.priceBdt ?? "999";
  const premiumUsd = pricing?.subscriptions?.premium?.priceUsd ?? "10";

  return (
    <>
      {/* ========================================================================= */}
      {/* PLANS FOR EVERY TRADER */}
      {/* ========================================================================= */}
      <section id="plans" className="content-auto bg-[#f8fafc] dark:bg-slate-900/40 py-16 sm:py-24 border-t border-slate-200/60 dark:border-slate-800/80 transition-colors">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0284c7]/10 text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-400 border border-sky-500/30">
              <Sparkles size={14} />
              <span className="uppercase tracking-widest">{isBn ? "ট্রেডার অ্যাক্সেস প্ল্যান" : "Plans For Every Trader"}</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {isBn ? "স্বচ্ছ মাসিক অ্যাক্সেস। কোনো লুকানো চার্জ নেই।" : "Transparent Trader Access. No Hidden Deductions."}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {isBn
                ? "বিনামূল্যে ৩০ দিনের ট্রায়াল দিয়ে শুরু করুন অথবা সম্পূর্ণ আনলিমিটেড ট্রেড, একাধিক জার্নাল বুক, ভিডিও সেভিং এবং ১-অন-১ প্রাতিষ্ঠানিক মেন্টরশিপের জন্য প্রো বা প্রিমিয়ামে আপগ্রেড করুন।"
                : "Start with an anchored 30-day Free Trial or upgrade to Pro or Premium for unlimited trade logging, dedicated journal books, video uploads, daily workout routines, and direct institutional mentorship."}
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 items-stretch max-w-7xl mx-auto">
            {/* CARD 1: FREE TRIAL */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-[#0b162a]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "ফ্রি ট্রায়াল" : "Free Trial"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    30 DAYS FULL TRIAL
                  </span>
                </div>
                <div className="mt-4 flex items-baseline flex-wrap gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    ৳{formatBdt(freeTrialBdt, isBn, "0")}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400">
                    / ${formatUsd(freeTrialUsd, isBn, "0")}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                    {isBn ? "/ ৩০ দিন" : "/ 30 days"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isBn
                    ? "অ্যাকাউন্ট তৈরির সাথে সাথে স্বয়ংক্রিয়ভাবে সক্রিয় হয়। ৩০ দিন পর প্রতি মাসে ৫টি ট্রেড ও ৫টি ডিসিপ্লিন দিনে সীমাবদ্ধ থাকবে।"
                    : "Strictly anchored to your account creation date. After 30 days, converts to Free 5 trades & 5 discipline days per month."}
                </p>

                <div className="mt-6 border-t border-slate-200/80 pt-5 dark:border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    {isBn ? "সুবিধাসমূহ" : "Included Features"}
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">1 Journal Book</strong> max</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">Unlimited Trades</strong> during 30 days</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>Standard Journal Analytics</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                      <LockKeyhole size={15} className="shrink-0" />
                      <span>Video saving locked</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                      <LockKeyhole size={15} className="shrink-0" />
                      <span>Workout Routine & Community locked</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-y-2.5">
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => setSelectedPlanModal("free")}
                >
                  {isBn ? "বিস্তারিত দেখুন" : "View Details"}
                </Button>
                <Link href="/dashboard" className="block w-full">
                  <Button
                    variant="ghost"
                    className="w-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  >
                    {isBn ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* CARD 2: PRO PLAN (MOST POPULAR) */}
            <div className="relative flex flex-col justify-between rounded-3xl border-2 border-sky-500 bg-white p-7 shadow-xl shadow-sky-500/10 dark:border-sky-500 dark:bg-[#0c182e] ring-2 ring-sky-500/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                ★ MOST POPULAR ★
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {isBn ? "প্রো প্ল্যান" : "Pro Plan"}
                  </span>
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 border border-sky-500/25 dark:border-sky-500/20">
                    +5 BONUS DAYS IN TRIAL
                  </span>
                </div>
                <div className="mt-4 flex items-baseline flex-wrap gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    ৳{formatBdt(proBdt, isBn, "599")}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400">
                    / ${formatUsd(proUsd, isBn, "5")}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                    {isBn ? "প্রতি মাস" : "per month"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isBn
                    ? "ম্যানুয়াল মাসিক নবায়ন। ট্রায়াল চলাকালে নিলে পাবেন অতিরিক্ত ৫ বোনাস দিন (মোট ৩৫ দিন)।"
                    : "Manual monthly renewal. Upgrading during trial adds +5 Bonus Days (35 days total first period)."}
                </p>

                <div className="mt-6 border-t border-slate-200/80 pt-5 dark:border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-500 mb-3">
                    {isBn ? "প্রো সুবিধাসমূহ" : "Pro Features"}
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
                      <span><strong>Up to 5 Dedicated Journal Books</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
                      <span><strong>Unlimited Trade Entries</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">30 Trade Videos / mo</strong> (restored on delete)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">10 Notebook Pages & 5 Videos / mo</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">Full Workout Routine Access</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">Full Community Chat Access</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-sky-500 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">Global Leaderboard Eligible</strong> (verified)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-y-2.5">
                <Link href="/checkout?plan=pro" className="block w-full">
                  <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs h-10 shadow-lg shadow-sky-500/25">
                    {isBn
                      ? `প্রো কিনুন — ৳${formatBdt(proBdt, true, "599")} / $${formatUsd(proUsd, true, "5")} প্রতি মাস`
                      : `Get Pro — ৳${formatBdt(proBdt, false, "599")} / $${formatUsd(proUsd, false, "5")} per month`}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold border-sky-500/40 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 hover:text-sky-800 dark:hover:text-sky-200"
                  onClick={() => setSelectedPlanModal("pro")}
                >
                  {isBn ? "বিস্তারিত দেখুন" : "View Details"}
                </Button>
              </div>
            </div>

            {/* CARD 3: PREMIUM PLAN */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-amber-500/50 bg-white bg-gradient-to-b from-amber-500/[0.06] via-amber-500/[0.02] to-transparent p-7 shadow-sm transition hover:shadow-lg dark:border-amber-500/40 dark:bg-[#0c1524] dark:from-amber-500/[0.04] dark:via-transparent dark:to-transparent">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                    <Crown size={15} />
                    {isBn ? "প্রিমিয়াম প্ল্যান" : "Premium Plan"}
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/40 dark:border-amber-500/30">
                    INSTITUTIONAL
                  </span>
                </div>
                <div className="mt-4 flex items-baseline flex-wrap gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    ৳{formatBdt(premiumBdt, isBn, "999")}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                    / ${formatUsd(premiumUsd, isBn, "10")}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                    {isBn ? "প্রতি মাস" : "per month"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isBn
                    ? "সর্বোচ্চ প্রাতিষ্ঠানিক সুযোগ-সুবিধা। মেন্টরদের সরাসরি গাইডেন্স ও ফাউন্ডারের সাথে ওয়ান-টু-ওয়ান চ্যাট।"
                    : "The ultimate institutional trader suite with 1-on-1 mentorship and direct private chat with the founder."}
                </p>

                <div className="mt-6 border-t border-slate-200/80 pt-5 dark:border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-3">
                    {isBn ? "প্রিমিয়াম সুবিধাসমূহ" : "Premium Exclusive"}
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={16} className="text-amber-600 dark:text-amber-500 shrink-0" />
                      <span><strong>Unlimited Journal Books</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={16} className="text-amber-600 dark:text-amber-500 shrink-0" />
                      <span><strong>Unlimited Log New Trade entries</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white">
                      <CheckCircle2 size={16} className="text-amber-600 dark:text-amber-500 shrink-0" />
                      <span><strong>Unlimited Video Saving & Notebook Pages</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-amber-600 dark:text-amber-500 shrink-0" />
                      <span>Workout Routine & Community Chat</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-amber-600 dark:text-amber-500 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">Global Leaderboard Eligible</strong> (verified)</span>
                    </li>
                    <li className="flex items-center gap-2.5 font-bold text-amber-600 dark:text-amber-500">
                      <Crown size={15} className="shrink-0" />
                      <span><strong>Direct 1-on-1 Mentor Support</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5 font-bold text-amber-600 dark:text-amber-500">
                      <Crown size={15} className="shrink-0" />
                      <span><strong>Direct Owner Personal Chat Access</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-amber-600 dark:text-amber-500 shrink-0" />
                      <span>Pro Remaining Days Paused & Preserved</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-y-2.5">
                <Link href="/checkout?plan=premium" className="block w-full">
                  <Button className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold text-xs h-10 shadow-lg shadow-amber-500/25">
                    {isBn
                      ? `প্রিমিয়াম কিনুন — ৳${formatBdt(premiumBdt, true, "999")} / $${formatUsd(premiumUsd, true, "10")} প্রতি মাস`
                      : `Get Premium — ৳${formatBdt(premiumBdt, false, "999")} / $${formatUsd(premiumUsd, false, "10")} per month`}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold border-amber-500/40 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 hover:text-amber-800 dark:hover:text-amber-200"
                  onClick={() => setSelectedPlanModal("premium")}
                >
                  {isBn ? "বিস্তারিত দেখুন" : "View Details"}
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
            className={`relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 scale-100 animate-in zoom-in-95 ${
              isBn ? "font-bangla" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Plan Badge & Close Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-xl bg-sky-500/20 font-mono text-xs font-bold text-sky-500">
                  <Sparkles size={14} />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {selectedPlanModal === "free"
                    ? "Free Trial & Free-After-Trial System"
                    : selectedPlanModal === "pro"
                    ? "Pro Plan Breakdown"
                    : "Premium Plan Breakdown"}
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
                  {selectedPlanModal === "free" && "30-Day Free Trial & Permanent Free Tier"}
                  {selectedPlanModal === "pro" && `Pro Trader Plan — ৳${formatBdt(proBdt, false, "599")} / $${formatUsd(proUsd, false, "5")} per month`}
                  {selectedPlanModal === "premium" && `Premium Institutional Plan — ৳${formatBdt(premiumBdt, false, "999")} / $${formatUsd(premiumUsd, false, "10")} per month`}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPlanModal === "free" &&
                    "Every new account automatically receives a 30-day Free Trial anchored to the exact moment of registration. During this period, you have 1 Journal Book with unlimited trade entries. After 30 days expire, your account permanently enters Free-After-Trial mode (max 5 trade entries and 5 discipline days per rolling 30-day cycle)."}
                  {selectedPlanModal === "pro" &&
                    "The Pro Plan is crafted for active disciplined traders needing separate books, video storage, structured fitness routines, and community collaboration. Renew manually every month with zero automatic debits. If upgraded during your Free Trial, you receive 5 BONUS DAYS (35 days total)."}
                  {selectedPlanModal === "premium" &&
                    "The Premium Plan unlocks unlimited institutional scale: unlimited journal books, unlimited trade entries, unlimited video uploads, full access to daily workout routine and community chat, verified Global Leaderboard eligibility, plus direct 1-on-1 private Mentor Support and direct Owner Personal Chat access with the founder."}
                </p>
              </div>

              {/* Detailed Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 -mx-1 sm:mx-0">
                <table className="min-w-[500px] w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    <tr>
                      <th className="p-3">Feature</th>
                      <th className="p-3 text-center">Free Trial (৳0 / $0)</th>
                      <th className="p-3 text-center">Pro (৳{formatBdt(proBdt, false, "599")} / ${formatUsd(proUsd, false, "5")})</th>
                      <th className="p-3 text-center">Premium (৳{formatBdt(premiumBdt, false, "999")} / ${formatUsd(premiumUsd, false, "10")})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Journal Books</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400">1 Book</td>
                      <td className="p-3 text-center font-bold text-sky-600 dark:text-sky-400">5 Books</td>
                      <td className="p-3 text-center font-bold text-amber-500">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Log New Trade</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400">Unlimited (Trial) / 5 (Post)</td>
                      <td className="p-3 text-center font-bold text-sky-600 dark:text-sky-400">Unlimited</td>
                      <td className="p-3 text-center font-bold text-amber-500">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Trade Videos</td>
                      <td className="p-3 text-center text-rose-500">Locked</td>
                      <td className="p-3 text-center font-bold text-sky-600 dark:text-sky-400">30 / mo (Restored on del)</td>
                      <td className="p-3 text-center font-bold text-amber-500">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Notebook Pages & Videos</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400">Templates only</td>
                      <td className="p-3 text-center text-slate-700 dark:text-slate-300">10 Pages / 5 Videos</td>
                      <td className="p-3 text-center font-bold text-amber-500">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Workout Routine</td>
                      <td className="p-3 text-center text-rose-500">Locked</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">Full Access</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">Full Access</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Community Chat</td>
                      <td className="p-3 text-center text-rose-500">Locked</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">Full Access</td>
                      <td className="p-3 text-center text-emerald-500 font-bold">Full Access</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Global Leaderboard</td>
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400">View Only</td>
                      <td className="p-3 text-center font-bold text-sky-600 dark:text-sky-400">Eligible (Verified)</td>
                      <td className="p-3 text-center font-bold text-amber-500">Eligible (Verified)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">1-on-1 Mentor Support</td>
                      <td className="p-3 text-center text-rose-500">Locked</td>
                      <td className="p-3 text-center text-rose-500">Locked</td>
                      <td className="p-3 text-center font-bold text-amber-500">Direct 1-on-1</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">Owner Personal Chat</td>
                      <td className="p-3 text-center text-rose-500">Locked</td>
                      <td className="p-3 text-center text-rose-500">Locked</td>
                      <td className="p-3 text-center font-bold text-amber-500">Direct Founder Channel</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Important Rules Alert */}
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-900 dark:text-sky-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                  <Sparkles size={14} />
                  <span>Special Bonus & Pausing Rules</span>
                </div>
                <p className="leading-relaxed">
                  • <strong>Trial Bonus:</strong> Purchasing Pro or Premium during your 30-day Free Trial immediately adds <strong>5 Bonus Days</strong> (35 days total for that first month).
                </p>
                <p className="leading-relaxed">
                  • <strong>Plan Switching:</strong> If you are on Pro and upgrade to Premium, your remaining Pro days are paused and preserved in the database. When Premium expires, your remaining Pro days automatically resume.
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
                Close
              </Button>
              {selectedPlanModal === "pro" && (
                <Link href="/checkout?plan=pro" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs">
                    Proceed to Checkout (৳{formatBdt(proBdt, false, "599")} / ${formatUsd(proUsd, false, "5")} / mo)
                  </Button>
                </Link>
              )}
              {selectedPlanModal === "premium" && (
                <Link href="/checkout?plan=premium" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs">
                    Proceed to Checkout (৳{formatBdt(premiumBdt, false, "999")} / ${formatUsd(premiumUsd, false, "10")} / mo)
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
