import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock,
  Crown,
  Flame,
  Globe,
  NotebookPen,
  Receipt,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimezoneOption } from "@/contexts/UserPreferencesContext";
import type { TradeEntry } from "@/types/journal";

// Daily Discipline Rules
const DAILY_DISCIPLINE_RULES = [
  {
    id: "news_check",
    textEn: "Checked high-impact news calendar (Forex Factory) before session open",
    textBn: "সেশন শুরুর আগে হাই-ইমপ্যাক্ট নিউজ ক্যালেন্ডার (Forex Factory) চেক করেছি",
  },
  {
    id: "bias_marked",
    textEn: "Identified Daily Bias & mapped key Liquidity pools (BSL/SSL) on HTF",
    textBn: "হায়ার টাইমফ্রেমে ডেইলি বায়াস ও মূল লিকুইডিটি পুল (BSL/SSL) মার্ক করেছি",
  },
  {
    id: "risk_limit",
    textEn: "Strictly limited risk to 1% max per trade — no revenge or overleveraging",
    textBn: "প্রতি ট্রেডে সর্বোচ্চ ১% রিস্ক রুলস মেনে চলেছি — কোনো অতিরিক্ত লট নেই",
  },
  {
    id: "killzone_only",
    textEn: "Only executed setups during active Killzones (London 08:00-10:00 / NY 13:00-15:00)",
    textBn: "শুধুমাত্র অ্যালগরিদমিক কিলজোনের ভেতরেই ট্রেড এক্সিকিউট করেছি",
  },
  {
    id: "rr_validation",
    textEn: "Validated minimum 1:3 Risk-to-Reward ratio before placing order",
    textBn: "অর্ডার বসানোর আগে ন্যূনতম ১:৩ রিস্ক-টু-রিওয়ার্ড নিশ্চিত করেছি",
  },
  {
    id: "journal_logged",
    textEn: "Documented trade setup, emotional state & lesson in trading journal",
    textBn: "ট্রেড নেওয়ার পর মানসিক অবস্থা ও লজিক বিস্তারিত জার্নালে লিখেছি",
  },
];

export interface DashboardOverviewSubUsage {
  plan: string;
  daysLeft?: number | null;
  isLeaderboardEligible?: boolean;
  journalEntriesLimit: number | "unlimited";
  journalEntriesCount: number;
  journalBooksLimit: number | "unlimited";
  journalBooksCount: number;
  journalVideosLimit: number | "unlimited";
  journalVideosCount: number;
  notebookPagesLimit: number | "unlimited";
  notebookPagesCount: number;
  disciplineDaysLimit: number | "unlimited";
  disciplineDaysCount: number;
  isWorkoutLocked?: boolean;
  isCommunityLocked?: boolean;
  isMentorSupportLocked?: boolean;
}

export interface DashboardOverviewDisciplineItem {
  label?: string | null;
  completed?: boolean | null;
}

export interface DashboardOverviewRankData {
  isRanked?: boolean;
  rank?: number | null;
  overallScore?: number | null;
}

export interface DashboardOverviewOrderItem {
  id: number | string;
  orderStatus?: string | null;
  bundleId?: number | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  amount?: number | string | null;
}

export interface DashboardOverviewJournalItem {
  id: number | string;
  title?: string | null;
  result?: string | null;
  content?: string | null;
  setup?: string | null;
  createdAt: string | Date;
}

export interface DashboardOverviewTabProps {
  isBn: boolean;
  today: string;
  subUsage: DashboardOverviewSubUsage | null | undefined;
  hasApprovedPurchase: boolean;
  telegramUrl: string;
  currentTimezone: TimezoneOption;
  liveMarketTime: { time: string; date: string };
  journalStats: { total: number; wins: number; losses: number; winRate: number; bestSetup: string };
  entitlements: ReadonlyArray<unknown> | null | undefined;
  discipline: ReadonlyArray<DashboardOverviewDisciplineItem> | null | undefined;
  myRankData: DashboardOverviewRankData | null | undefined;
  orders: ReadonlyArray<DashboardOverviewOrderItem> | null | undefined;
  localTrades: ReadonlyArray<TradeEntry> | null | undefined;
  journal: ReadonlyArray<DashboardOverviewJournalItem> | null | undefined;
  onSelectTab: (nextTab: "discipline" | "orders" | "library" | "journal") => void;
  onToggleDisciplineRule: (payload: { label: string; date: string; completed: boolean }) => void;
}

export function DashboardOverviewTab({
  isBn,
  today,
  subUsage,
  hasApprovedPurchase,
  telegramUrl,
  currentTimezone,
  liveMarketTime,
  journalStats,
  entitlements,
  discipline,
  myRankData,
  orders,
  localTrades,
  journal,
  onSelectTab,
  onToggleDisciplineRule,
}: DashboardOverviewTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Subscription Status & Usage Widget */}
      {subUsage && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b162a]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div
                className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  subUsage.plan === "premium"
                    ? "bg-gradient-to-tr from-amber-400 to-yellow-500 text-black shadow-amber-500/20"
                    : subUsage.plan === "pro"
                    ? "bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sky-500/20"
                    : subUsage.plan === "free_trial"
                    ? "bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-cyan-500/20"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {subUsage.plan === "premium" ? (
                  <Crown size={24} />
                ) : subUsage.plan === "pro" ? (
                  <Sparkles size={22} />
                ) : subUsage.plan === "free_trial" ? (
                  <Clock size={22} />
                ) : (
                  <ShieldCheck size={22} />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Plan Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${
                      subUsage.plan === "free_trial"
                        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                        : subUsage.plan === "free_after_trial"
                        ? "bg-slate-500/15 text-slate-400 border-slate-500/30"
                        : subUsage.plan === "pro"
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/20"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/25"
                    }`}
                  >
                    <span className="size-2 rounded-full bg-current animate-pulse" />
                    {subUsage.plan === "free_trial" && `FREE TRIAL · ${subUsage.daysLeft} DAYS LEFT`}
                    {subUsage.plan === "free_after_trial" && "FREE PLAN · 5 JOURNAL / 30 DAYS"}
                    {subUsage.plan === "pro" && `PRO · ${subUsage.daysLeft} DAYS LEFT`}
                    {subUsage.plan === "premium" && `PREMIUM · ${subUsage.daysLeft} DAYS LEFT`}
                  </span>

                  {subUsage.isLeaderboardEligible && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ✓ LEADERBOARD ACTIVE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {subUsage.plan === "free_trial" &&
                    "30-day Free Trial is strictly anchored to your account registration. Upgrading adds +5 Bonus Days!"}
                  {subUsage.plan === "free_after_trial" &&
                    "Permanent Free tier: 5 trades and 5 discipline days per rolling 30-day cycle."}
                  {subUsage.plan === "pro" &&
                    "Pro Plan Active. Dedicated 5 books, 30 videos/mo, workout routine & community chat enabled."}
                  {subUsage.plan === "premium" &&
                    "Premium Institutional Plan Active. Unlimited scale, 1-on-1 mentor support & direct owner chat enabled."}
                </p>
              </div>
            </div>

            {/* Upgrade CTAs */}
            <div className="flex items-center gap-2.5 shrink-0">
              {subUsage.plan !== "premium" && (
                <Link href="/checkout?plan=premium">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs h-9 shadow-md shadow-amber-500/20 gap-1.5"
                  >
                    <Crown size={14} />
                    {subUsage.plan === "pro" ? "Upgrade to Premium (৳999 / $10)" : "Get Premium (৳999 / $10)"}
                  </Button>
                </Link>
              )}
              {(subUsage.plan === "free_trial" || subUsage.plan === "free_after_trial") && (
                <Link href="/checkout?plan=pro">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs h-9 shadow-md shadow-sky-500/20"
                  >
                    Get Pro (৳599 / $5)
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Quota Counters Grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Journal Entries */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Journal Trades</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                {subUsage.journalEntriesLimit === "unlimited"
                  ? "Unlimited"
                  : `${subUsage.journalEntriesCount} / ${subUsage.journalEntriesLimit}`}
              </div>
            </div>

            {/* Journal Books */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Journal Books</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                {subUsage.journalBooksLimit === "unlimited"
                  ? "Unlimited"
                  : `${subUsage.journalBooksCount} / ${subUsage.journalBooksLimit}`}
              </div>
            </div>

            {/* Saved Videos */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saved Videos</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                {subUsage.journalVideosLimit === "unlimited"
                  ? "Unlimited"
                  : subUsage.journalVideosLimit === 0
                  ? "Locked"
                  : `${subUsage.journalVideosCount} / ${subUsage.journalVideosLimit}`}
              </div>
            </div>

            {/* Notebook Pages */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notebook Pages</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                {subUsage.notebookPagesLimit === "unlimited"
                  ? "Unlimited"
                  : subUsage.notebookPagesLimit === 0
                  ? "Templates"
                  : `${subUsage.notebookPagesCount} / ${subUsage.notebookPagesLimit}`}
              </div>
            </div>

            {/* Discipline Days */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Discipline Days</div>
              <div className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                {subUsage.disciplineDaysLimit === "unlimited"
                  ? "Unlimited"
                  : `${subUsage.disciplineDaysCount} / ${subUsage.disciplineDaysLimit}`}
              </div>
            </div>

            {/* Workout Routine */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workout Routine</div>
              <div
                className={`mt-1 text-sm font-extrabold ${
                  subUsage.isWorkoutLocked ? "text-slate-400 dark:text-slate-500" : "text-emerald-500"
                }`}
              >
                {subUsage.isWorkoutLocked ? "Locked" : "Active"}
              </div>
            </div>

            {/* Community Chat */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Community Chat</div>
              <div
                className={`mt-1 text-sm font-extrabold ${
                  subUsage.isCommunityLocked ? "text-slate-400 dark:text-slate-500" : "text-emerald-500"
                }`}
              >
                {subUsage.isCommunityLocked ? "Locked" : "Active"}
              </div>
            </div>

            {/* Mentor Support */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mentor Support</div>
              <div
                className={`mt-1 text-sm font-extrabold ${
                  subUsage.isMentorSupportLocked ? "text-slate-400 dark:text-slate-500" : "text-amber-500 font-black"
                }`}
              >
                {subUsage.isMentorSupportLocked ? "Locked" : "Active"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verified Student VIP Telegram Banner */}
      {hasApprovedPurchase && (
        <div className="relative overflow-hidden rounded-3xl border border-sky-500/40 bg-gradient-to-r from-[#081f3d] via-[#09172c] to-[#071324] p-5 sm:p-7 shadow-xl shadow-sky-950/40 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-80 h-40 bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30">
                <Send size={24} className="translate-x-0.5 -translate-y-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                    ✓ {isBn ? "এনরোলমেন্ট অ্যাপ্রুভড" : "Enrollment Approved"}
                  </span>
                  <span className="text-[11px] font-bold text-sky-400">
                    {isBn ? "প্রাতিষ্ঠানিক ভিআইপি এক্সেস" : "VIP Student Community"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {isBn
                    ? "লাইভ ক্লাস লিংক ও রেকর্ডেড ড্রাইভের জন্য অফিশিয়াল টেলিগ্রাম গ্রুপে যুক্ত থাকুন"
                    : "Access Live Classes, Video Lectures & Daily Trade Breakdown on Telegram"}
                </h3>
                <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {isBn
                    ? "আপনার পেমেন্ট ভেরিফাই হয়েছে। সমস্ত লাইভ জুম সেশনের লিংক, শিডিউল ও প্রাইভেট সাপোর্ট টেলিগ্রাম চ্যানেলে প্রদান করা হয়।"
                    : "Your payment verification has been cleared. All live class streaming links, PDF updates, and private mentor Q&A take place inside our official Telegram room."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Button
                onClick={() => window.open(telegramUrl, "_blank")}
                className="flex-1 sm:flex-none h-11 px-5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 gap-1.5"
              >
                <Send size={15} />
                <span>{isBn ? "টেলিগ্রামে প্রবেশ করুন" : "Open VIP Telegram"}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.dispatchEvent(new CustomEvent("open-telegram-modal"))}
                className="h-11 px-4 rounded-xl border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                <span>{isBn ? "নির্দেশিকা" : "Instructions"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Financial Market Time Zone Information Widget (Read-Only Source of Truth) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-sm dark:border-slate-800/90 dark:bg-gradient-to-r dark:from-[#0a1628] dark:via-[#091424] dark:to-[#07101e] backdrop-blur-sm transition-all">
        {/* Background decorative glow */}
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Timezone details */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/15 border border-sky-500/20 shadow-xs">
              <Clock size={24} className="text-sky-500" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  {isBn ? "ফিনান্সিয়াল মার্কেট টাইমজোন" : "Financial Market Time Zone"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-500/20">
                  <Globe size={10} />
                  <span>{currentTimezone.market}</span>
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  UTC {currentTimezone.offset}
                </span>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentTimezone.city}
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  · {currentTimezone.label}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? "ট্রেড লগিং, মার্কেট সেশন এবং দৈনিক ডিসিপ্লিন রিসেটের সক্রিয় রেফারেন্স টাইমজোন।"
                  : "Active reference timezone for trade journaling, market session timing, and daily resets."}
              </p>
            </div>
          </div>

          {/* Right: Live Digital Clock & Settings Link */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between sm:justify-start lg:justify-center gap-3 shrink-0 pt-2 lg:pt-0 border-t border-slate-100 dark:border-slate-800/70 lg:border-t-0">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-500/10 px-4 py-2 text-left sm:text-right">
                <div className="flex items-center gap-2 justify-start sm:justify-end">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {liveMarketTime.date || "..."}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-sky-400 mt-0.5">
                  {liveMarketTime.time || "--:--:-- --"}
                </div>
              </div>
            </div>

            <Link
              href="/settings?tab=region"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:underline transition-colors cursor-pointer"
              title={isBn ? "টাইমজোন পরিবর্তন করতে সেটিংস → ভাষা ও অঞ্চলে যান" : "Change time zone in Settings → Language & Region"}
            >
              <SettingsIcon size={12} className="text-sky-500" />
              <span>{isBn ? "সেটিংস থেকে পরিবর্তন করুন" : "Manage in Settings"}</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-4">
        {/* 1. Total Documented Trades */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">{isBn ? "মোট ট্রেড জার্নাল" : "Journal Entries"}</span>
            <NotebookPen size={16} className="text-[#0284c7] dark:text-sky-400 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black">{journalStats.total}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">{isBn ? "টি ট্রেড" : "Trades"}</span>
          </div>
          <div className="mt-2 sm:mt-3 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            {journalStats.wins} {isBn ? "উইন" : "Wins"} · {journalStats.losses} {isBn ? "লস" : "Losses"}
          </div>
        </div>

        {/* 2. Win Rate */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">{isBn ? "ট্রেড উইনরেট" : "Trade Win Rate"}</span>
            <Flame size={16} className="text-amber-500 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black">{journalStats.winRate}%</span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">({journalStats.wins}W / {journalStats.losses}L)</span>
          </div>
          <div className="mt-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {journalStats.total} {isBn ? "টি ট্রেড" : "documented logs"}
          </div>
        </div>

        {/* 3. Journal Logs */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">{isBn ? "আনলকড রিসোর্স" : "My Resources"}</span>
            <BookOpen size={16} className="text-purple-500 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="mt-2.5 sm:mt-4 text-xl sm:text-3xl font-black">{entitlements?.length || 0}</div>
          <div className="mt-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {isBn ? "সক্রিয় PDF ও কোর্স" : "Active entitlements"}
          </div>
        </div>

        {/* 4. Today's Discipline */}
        <button
          onClick={() => onSelectTab("discipline")}
          className="rounded-2xl sm:rounded-3xl bg-[#081833] p-3.5 sm:p-6 text-white shadow-xl shadow-[#081833]/15 dark:bg-slate-800 text-left transition-all hover:ring-2 hover:ring-[#38bdf8]/50 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#38bdf8]">{isBn ? "আজকের রুটিন" : "Today's Discipline"}</span>
            <ClipboardCheck size={16} className="text-[#38bdf8] sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black">{discipline?.filter((d) => d.completed).length || 0}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">/ 6 {isBn ? "রুলস" : "Rules"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-300">
            <span className="truncate">{isBn ? "ডিসিপ্লিনই শক্তি" : "Process over emotion"}</span>
            <ChevronRight size={14} className="text-[#38bdf8] shrink-0" />
          </div>
        </button>

        {/* 5. Your Global Rank */}
        <Link href="/leaderboard" className="col-span-2 sm:col-span-1">
          <div className="rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-slate-50 p-3.5 sm:p-6 shadow-xs dark:border-amber-500/30 dark:from-[#141d2e] dark:via-[#0c1527] dark:to-[#070e1b] transition-all hover:ring-2 hover:ring-amber-500/50 cursor-pointer h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {isBn ? "আপনার গ্লোবাল র‍্যাঙ্ক" : "YOUR GLOBAL RANK"}
                </span>
                <Trophy size={16} className="text-amber-500 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="mt-2.5 sm:mt-4 flex items-baseline gap-2">
                <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {myRankData?.isRanked && myRankData.rank ? `#${myRankData.rank}` : "Unranked"}
                </span>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="truncate">
                {myRankData?.isRanked && myRankData.overallScore !== null
                  ? `${isBn ? "স্কোর" : "Overall Score"}: ${myRankData.overallScore} / 100`
                  : (isBn ? "র‌্যাঙ্ক পেতে ট্রেড লগ করুন" : "Log trades to qualify")}
              </span>
              <ChevronRight size={14} className="text-amber-500 shrink-0" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Order Status Alert Banner */}
      {orders && orders.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${
                orders[0].orderStatus === "approved"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : orders[0].orderStatus === "rejected"
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}>
                <Receipt size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {isBn ? "সর্বশেষ অর্ডার" : "Latest Order"} #{orders[0].id}
                  </span>
                  <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 text-[11px] font-extrabold text-sky-700 dark:text-sky-300">
                    {orders[0].bundleId === 4 ? "Bundle 4 · Trading Blueprint" : orders[0].bundleId === 2 ? "Bundle 2 · Course + eBook" : orders[0].bundleId === 1 ? "Free eBook Package" : `Bundle #${orders[0].bundleId}`}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      orders[0].orderStatus === "approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : orders[0].orderStatus === "rejected"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 animate-pulse"
                    }`}
                  >
                    {orders[0].orderStatus === "approved" ? (isBn ? "অনুমোদিত" : "Approved") : orders[0].orderStatus === "rejected" ? (isBn ? "বাতিল" : "Rejected") : (isBn ? "যাচাই প্রক্রিয়াধীন (১৫-৩০ মিনিট)" : "Pending Review (15–30 mins)")}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {orders[0].paymentMethod?.toUpperCase()} · TrxID: <code className="font-mono font-bold text-slate-700 dark:text-slate-200">{orders[0].transactionId}</code> · ৳{orders[0].amount} BDT
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectTab("orders")}
              className="text-xs font-extrabold text-sky-600 hover:text-sky-500 dark:text-sky-400 shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>{isBn ? "সব অর্ডার দেখুন" : "View All Orders"}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Learning Resource Banner CTA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#081833] via-[#0f2c59] to-[#0a1e3d] p-7 sm:p-9 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#38bdf8]">
              <Sparkles size={13} /> {isBn ? "প্রাতিষ্ঠানিক রিসোর্স" : "INSTITUTIONAL EDGE"}
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isBn ? "প্রাতিষ্ঠানিক চিট-শীট ও হাই-RR ট্রেডিং মডেল" : "Institutional Cheat-Sheets & High-RR Models"}
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isBn
                ? "ক্যান্ডেল রেঞ্জ থিওরি (CRT), লিকুইডিটি সুইপ এবং প্রাতিষ্ঠানিক রিস্ক ম্যানেজমেন্ট গাইড অনুশীলন করে আপনার এজ তৈরি করুন।"
                : "Master candle range theory (CRT), liquidity sweeps, and strict risk management through curated institutional guides."}
            </p>
          </div>

          <Button
            onClick={() => onSelectTab("library")}
            size="lg"
            className="shrink-0 gap-2 rounded-2xl bg-[#38bdf8] font-black text-slate-950 hover:bg-[#7dd3fc] shadow-lg shadow-sky-500/20"
          >
            <span>{isBn ? "লাইব্রেরি ওপেন করুন" : "Open Study Library"}</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Two Column Section: Quick Recent Journal & Discipline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Journal Entries */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold">{isBn ? "সাম্প্রতিক ট্রেড জার্নাল" : "Recent Trade Logs"}</h3>
            <Button variant="ghost" size="sm" onClick={() => onSelectTab("journal")} className="text-xs font-bold text-[#0284c7] dark:text-sky-400">
              {isBn ? "সব দেখুন" : "View all"} →
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {localTrades?.length ? (
              localTrades.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{item.pair} ({item.direction})</span>
                      <span className="text-[10px] font-mono font-bold text-cyan-500">#{item.tradeNumber}</span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        item.pnl > 0.001
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : item.pnl < -0.001
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.pnl > 0.001 ? `+$${item.pnl.toFixed(2)}` : item.pnl < -0.001 ? `-$${Math.abs(item.pnl).toFixed(2)}` : "BE $0"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.note || item.learning || "Trade recorded in Institutional Journal"}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>{item.timeframe}</span>
                    <span>•</span>
                    <span>RR {item.riskReward}</span>
                    <span>•</span>
                    <span>Rank {item.tradeRank}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))
            ) : journal?.length ? (
              journal.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">{item.title}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        item.result?.toLowerCase() === "win"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : item.result?.toLowerCase() === "loss"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.result || "Logged"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.content}</p>
                  <div className="mt-2 text-[10px] font-mono text-slate-400">{item.setup || "General Setup"} • {new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                {isBn ? "এখনো কোনো ট্রেড জার্নাল এন্ট্রি যোগ করা হয়নি।" : "No trade logs recorded yet. Build the habit of journaling every setup."}
              </div>
            )}
          </div>
        </div>

        {/* Daily Discipline Checklist */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold">{isBn ? "ডেইলি ট্রেডার চেকলিস্ট" : "Daily Discipline Checklist"}</h3>
              <span className="text-xs font-mono font-bold text-slate-400">{today}</span>
            </div>
            <button
              onClick={() => onSelectTab("discipline")}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-500 hover:text-sky-600 transition-colors"
            >
              <span>{isBn ? "সম্পূর্ণ সিস্টেম" : "Full System"}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {DAILY_DISCIPLINE_RULES.slice(0, 4).map((rule) => {
              const isChecked = Boolean(discipline?.some((d) => d.label === rule.id && d.completed));
              return (
                <button
                  key={rule.id}
                  onClick={() => onToggleDisciplineRule({ label: rule.id, date: today, completed: !isChecked })}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                    isChecked
                      ? "border-emerald-200 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
                      : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/40"
                  }`}
                >
                  <div className="mt-0.5">
                    {isChecked ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-300 dark:text-slate-600" />}
                  </div>
                  <span className={`text-xs font-medium leading-relaxed ${isChecked ? "line-through opacity-80" : ""}`}>
                    {isBn ? rule.textBn : rule.textEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
