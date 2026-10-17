import { useState } from "react";
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
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserPreferences, type TimezoneOption } from "@/contexts/UserPreferencesContext";
import type { TradeEntry } from "@/types/journal";
import { useLanguage } from "@/contexts/LanguageContext";
import { ClaimFreePlanModal } from "@/features/subscription";
import { DailyDisciplineOverviewCard } from "@/features/discipline";

// Daily Discipline Rules
const DAILY_DISCIPLINE_RULES = [
  {
    id: "news_check",
    textEn: "Checked high-impact news calendar (Forex Factory) before session open",
    textBn: "সেশন শুরুর আগে হাই-ইমপ্যাক্ট নিউজ ক্যালেন্ডার (Forex Factory) চেক করেছি",
    textUr: "سیشن شروع ہونے سے پہلے ہائی امپیکٹ نیوز کیلنڈر (Forex Factory) چیک کیا",
  },
  {
    id: "bias_marked",
    textEn: "Identified Daily Bias & mapped key Liquidity pools (BSL/SSL) on HTF",
    textBn: "হায়ার টাইমফ্রেমে ডেইলি বায়াস ও মূল লিকুইডিটি পুল (BSL/SSL) মার্ক করেছি",
    textUr: "HTF پر ڈیلی بائیس شناخت کی اور اہم Liquidity پولز (BSL/SSL) مارک کیے",
  },
  {
    id: "risk_limit",
    textEn: "Strictly limited risk to 1% max per trade — no revenge or overleveraging",
    textBn: "প্রতি ট্রেডে সর্বোচ্চ ১% রিস্ক রুলস মেনে চলেছি — কোনো অতিরিক্ত লট নেই",
    textUr: "فی ٹریڈ زیادہ سے زیادہ 1% رسک پر سختی سے عمل کیا — کوئی انتقامی یا اوور لیوریجنگ نہیں",
  },
  {
    id: "killzone_only",
    textEn: "Only executed setups during active Killzones (London 08:00-10:00 / NY 13:00-15:00)",
    textBn: "শুধুমাত্র অ্যালগরিদমিক কিলজোনের ভেতরেই ট্রেড এক্সিকিউট করেছি",
    textUr: "صرف فعال Killzones (London 08:00-10:00 / NY 13:00-15:00) کے دوران سیٹ اپس پر عمل کیا",
  },
  {
    id: "rr_validation",
    textEn: "Validated minimum 1:3 Risk-to-Reward ratio before placing order",
    textBn: "অর্ডার বসানোর আগে ন্যূনতম ১:৩ রিস্ক-টু-রিওয়ার্ড নিশ্চিত করেছি",
    textUr: "آرڈر لگانے سے پہلے کم از کم 1:3 Risk-to-Reward کے تناسب کی تصدیق کی",
  },
  {
    id: "journal_logged",
    textEn: "Documented trade setup, emotional state & lesson in trading journal",
    textBn: "ট্রেড নেওয়ার পর মানসিক অবস্থা ও লজিক বিস্তারিত জার্নালে লিখেছি",
    textUr: "ٹریڈنگ جرنل میں ٹریڈ سیٹ اپ، جذباتی کیفیت اور سبق کو درج کیا",
  },
];

export interface DashboardOverviewSubUsage {
  plan: string;
  trialStatus?: string | null;
  trialDurationDays?: number | null;
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
  telegramUrl?: string;
  currentTimezone: TimezoneOption;
  liveMarketTime: { time: string; date: string };
  journalStats: { total: number; wins: number; losses: number; winRate: number; bestSetup: string };
  entitlements: ReadonlyArray<unknown> | null | undefined;
  discipline: ReadonlyArray<DashboardOverviewDisciplineItem> | null | undefined;
  myRankData: DashboardOverviewRankData | null | undefined;
  orders: ReadonlyArray<DashboardOverviewOrderItem> | null | undefined;
  localTrades: ReadonlyArray<TradeEntry> | null | undefined;
  journal: ReadonlyArray<DashboardOverviewJournalItem> | null | undefined;
  onSelectTab: (nextTab: "discipline" | "orders" | "library" | "journal" | "discipline-analytics") => void;
  onToggleDisciplineRule: (payload: { label: string; date: string; completed: boolean }) => void;
}

export function DashboardOverviewTab({
  isBn: _isBn,
  today,
  subUsage,
  hasApprovedPurchase,
  telegramUrl: _telegramUrl,
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
  const { language, isRTL, selectText } = useLanguage();
  const { formatPrice } = useUserPreferences();
  const isBn = language === "bn";
  const isUr = language === "ur";
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  return (
    <div
      className={`space-y-8 animate-in fade-in duration-300 ${
        isBn ? "font-bangla" : isUr ? "font-urdu" : ""
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Subscription Status & Usage Widget */}
      {subUsage && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b162a]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-5 pb-3.5 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div
                className={`size-10 sm:size-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  subUsage.plan === "premium"
                    ? "bg-gradient-to-tr from-amber-400 to-yellow-500 text-black shadow-amber-500/20"
                    : subUsage.plan === "pro"
                    ? "bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sky-500/20"
                    : subUsage.plan === "free_trial"
                    ? "bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-cyan-500/20"
                    : subUsage.plan === "unclaimed"
                    ? "bg-gradient-to-tr from-cyan-500/80 to-sky-600/80 text-white shadow-cyan-500/20"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {subUsage.plan === "premium" ? (
                  <Crown size={20} className="sm:size-6" />
                ) : subUsage.plan === "pro" ? (
                  <Sparkles size={18} className="sm:size-[22px]" />
                ) : subUsage.plan === "free_trial" || subUsage.plan === "unclaimed" ? (
                  <Clock size={18} className="sm:size-[22px]" />
                ) : (
                  <ShieldCheck size={18} className="sm:size-[22px]" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Plan Badge */}
                  <span
                    className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase border ${
                      subUsage.plan === "unclaimed"
                        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                        : subUsage.plan === "free_trial"
                        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                        : subUsage.plan === "free_after_trial"
                        ? "bg-slate-500/15 text-slate-400 border-slate-500/30"
                        : subUsage.plan === "pro"
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/20"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/25"
                    }`}
                  >
                    <span className="size-1.5 sm:size-2 rounded-full bg-current animate-pulse" />
                    {subUsage.plan === "unclaimed" &&
                      selectText({
                        en: "FREE TRIAL UNCLAIMED · 20 DAYS AVAILABLE",
                        bn: "ফ্রি ট্রায়াল আনক্লেইমড · ২০ দিন উপলব্ধ",
                        ur: "مفت ٹرائل ان کلیمڈ · 20 دن دستیاب",
                      })}
                    {subUsage.plan === "free_trial" &&
                      selectText({
                        en: `FREE TRIAL · ${subUsage.daysLeft} DAYS LEFT`,
                        bn: `ফ্রি ট্রায়াল · ${subUsage.daysLeft} দিন বাকি`,
                        ur: `مفت ٹرائل · ${subUsage.daysLeft} دن باقی`,
                      })}
                    {subUsage.plan === "free_after_trial" &&
                      selectText({
                        en: "FREE PLAN · 5 JOURNAL / 30 DAYS",
                        bn: "ফ্রি প্ল্যান · ৫ জার্নাল / ৩০ দিন",
                        ur: "مفت پلان · 5 جرنل / 30 دن",
                      })}
                    {subUsage.plan === "pro" &&
                      selectText({
                        en: `PRO · ${subUsage.daysLeft} DAYS LEFT`,
                        bn: `প্রো · ${subUsage.daysLeft} দিন বাকি`,
                        ur: `پرو · ${subUsage.daysLeft} دن باقی`,
                      })}
                    {subUsage.plan === "premium" &&
                      selectText({
                        en: `PREMIUM · ${subUsage.daysLeft} DAYS LEFT`,
                        bn: `প্রিমিয়াম · ${subUsage.daysLeft} দিন বাকি`,
                        ur: `پریمیم · ${subUsage.daysLeft} دن باقی`,
                      })}
                  </span>

                  {subUsage.isLeaderboardEligible && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ✓ {selectText({ en: "LEADERBOARD ACTIVE", bn: "লিডারবোর্ড সক্রিয়", ur: "لیڈر بورڈ فعال" })}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  {subUsage.plan === "unclaimed" &&
                    selectText({
                      en: "Your Free Plan trial has not started yet. Claim your Free Plan to activate 20 days of Journal and Private Trader Notebook access.",
                      bn: "আপনার ফ্রি প্ল্যান ট্রায়াল এখনও শুরু হয়নি। ২০ দিনের জার্নাল এবং প্রাইভেট ট্রেডার নোটবুক অ্যাক্সেস সক্রিয় করতে ফ্রি প্ল্যান ক্লেইম করুন।",
                      ur: "آپ کا مفت پلان ٹرائل ابھی شروع نہیں ہوا۔ 20 دن کے جرنل اور پرائیویٹ ٹریڈر نوٹ بک رسائی کو فعال کرنے کے لیے مفت پلان کلیم کریں۔",
                    })}
                  {subUsage.plan === "free_trial" &&
                    selectText({
                      en: "20-day Free Trial active from your claim date. Upgrading to Pro or Premium adds +5 Bonus Days!",
                      bn: "আপনার ক্লেইম করার তারিখ থেকে ২০ দিনের ফ্রি ট্রায়াল সক্রিয়। আপগ্রেড করলে +৫ বোনাস দিন যোগ হবে!",
                      ur: "آپ کی کلیم تاریخ سے 20 دن کا مفت ٹرائل فعال ہے۔ اپ گریڈ کرنے پر +5 بونس دن شامل ہوتے ہیں!",
                    })}
                  {subUsage.plan === "free_after_trial" &&
                    selectText({
                      en: "20-day Free Trial expired. Permanent Free tier: 5 trades and 5 discipline days per rolling 30-day cycle.",
                      bn: "২০ দিনের ফ্রি ট্রায়াল শেষ হয়েছে। স্থায়ী ফ্রি টিয়ার: প্রতি ৩০ দিনে ৫টি ট্রেড ও ৫টি ডিসিপ্লিন দিন।",
                      ur: "20 دن کا مفت ٹرائل ختم ہو گیا۔ مستقل مفت درجہ: ہر 30 دن کے چکر میں 5 ٹریডز اور 5 ڈسپلن دن۔",
                    })}
                  {subUsage.plan === "pro" &&
                    selectText({
                      en: "Pro Plan Active. Dedicated 5 books, 30 videos/mo, workout routine & community chat enabled.",
                      bn: "প্রো প্ল্যান সক্রিয়। ৫টি বই, ৩০টি ভিডিও/মাস, ওয়ার্কআউট রুটিন ও কমিউনিটি চ্যাট সক্রিয়।",
                      ur: "پرو پلان فعال ہے۔ 5 کتابیں، 30 ویڈیوز/ماہ، ورزش کا معمول اور کمیونٹی چیٹ شامل ہیں۔",
                    })}
                  {subUsage.plan === "premium" &&
                    selectText({
                      en: "Premium Institutional Plan Active. Unlimited scale, 1-on-1 mentor support & direct owner chat enabled.",
                      bn: "প্রিমিয়াম ইন্সটিটিউশনাল প্ল্যান সক্রিয়। আনলিমিটেড ব্যবহার, ১-অন-১ মেন্টর সাপোর্ট ও ডিরেক্ট ওনার চ্যাট সক্রিয়।",
                      ur: "پریمیم ادارہ جاتی پلان فعال ہے۔ لا محدود رسائی، 1-on-1 مینٹور سپورٹ اور اونر چیٹ فعال ہے۔",
                    })}
                </p>
              </div>
            </div>

            {/* Upgrade / Claim CTAs */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
              {subUsage.plan === "unclaimed" && (
                <Button
                  size="sm"
                  onClick={() => setIsClaimModalOpen(true)}
                  className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-black text-xs h-8 sm:h-9 shadow-md shadow-cyan-500/20 gap-1.5"
                >
                  <Sparkles size={13} className="sm:size-3.5" />
                  {selectText({
                    en: "Claim Free Plan",
                    bn: "ফ্রি প্ল্যান ক্লেইম করুন",
                    ur: "مفت پلان کلیم کریں",
                  })}
                </Button>
              )}
              {subUsage.plan !== "premium" && (
                <Link href="/checkout?plan=premium">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs h-8 sm:h-9 shadow-md shadow-amber-500/20 gap-1.5"
                  >
                    <Crown size={13} className="sm:size-3.5" />
                    {subUsage.plan === "pro"
                      ? selectText({
                          en: `Upgrade to Premium (${formatPrice({ bdt: 1199, usd: 9.99 })})`,
                          bn: `প্রিমিয়ামে আপগ্রেড করুন (${formatPrice({ bdt: 1199, usd: 9.99 })})`,
                          ur: `پریمیم پر اپ گریڈ کریں (${formatPrice({ bdt: 1199, usd: 9.99 })})`,
                        })
                      : selectText({
                          en: `Get Premium (${formatPrice({ bdt: 1199, usd: 9.99 })})`,
                          bn: `প্রিমিয়াম নিন (${formatPrice({ bdt: 1199, usd: 9.99 })})`,
                          ur: `پریمیم حاصل کریں (${formatPrice({ bdt: 1199, usd: 9.99 })})`,
                        })}
                  </Button>
                </Link>
              )}
              {(subUsage.plan === "unclaimed" || subUsage.plan === "free_trial" || subUsage.plan === "free_after_trial") && (
                <Link href="/checkout?plan=pro">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs h-8 sm:h-9 shadow-md shadow-sky-500/20"
                  >
                    {selectText({
                      en: `Get Pro (${formatPrice({ bdt: 599, usd: 5 })})`,
                      bn: `প্রো নিন (${formatPrice({ bdt: 599, usd: 5 })})`,
                      ur: `پرو حاصل کریں (${formatPrice({ bdt: 599, usd: 5 })})`,
                    })}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Quota Counters Grid */}
          <div className="mt-3.5 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {/* Journal Entries */}
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Journal Trades", bn: "জার্নাল ট্রেড", ur: "جرنل ٹریڈز" })}
              </div>
              <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white" dir="ltr">
                {subUsage.journalEntriesLimit === "unlimited"
                  ? selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لا محدود" })
                  : `${subUsage.journalEntriesCount} / ${subUsage.journalEntriesLimit}`}
              </div>
            </div>

            {/* Journal Books */}
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Journal Books", bn: "জার্নাল বুকস", ur: "جرنل کتب" })}
              </div>
              <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white" dir="ltr">
                {subUsage.journalBooksLimit === "unlimited"
                  ? selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لا محدود" })
                  : `${subUsage.journalBooksCount} / ${subUsage.journalBooksLimit}`}
              </div>
            </div>

            {/* Saved Videos */}
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Saved Videos", bn: "সংরক্ষিত ভিডিও", ur: "محفوظ ویڈیوز" })}
              </div>
              <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white" dir="ltr">
                {subUsage.journalVideosLimit === "unlimited"
                  ? selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لا محدود" })
                  : subUsage.journalVideosLimit === 0
                  ? selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })
                  : `${subUsage.journalVideosCount} / ${subUsage.journalVideosLimit}`}
              </div>
            </div>

            {/* Notebook Pages */}
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Notebook Pages", bn: "নোটবুক পেজ", ur: "نوٹ بک صفحات" })}
              </div>
              <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white" dir="ltr">
                {subUsage.notebookPagesLimit === "unlimited"
                  ? selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لا محدود" })
                  : subUsage.notebookPagesLimit === 0
                  ? selectText({ en: "Templates", bn: "টেমপ্লেট", ur: "ٹیمپلیٹس" })
                  : `${subUsage.notebookPagesCount} / ${subUsage.notebookPagesLimit}`}
              </div>
            </div>

            {/* Discipline Days */}
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Discipline Days", bn: "ডিসিপ্লিন দিন", ur: "ڈسپلن کے دن" })}
              </div>
              <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white" dir="ltr">
                {subUsage.disciplineDaysLimit === "unlimited"
                  ? selectText({ en: "Unlimited", bn: "আনলিমিটেড", ur: "لا محدود" })
                  : `${subUsage.disciplineDaysCount} / ${subUsage.disciplineDaysLimit}`}
              </div>
            </div>

            {/* Workout Routine */}
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Workout Routine", bn: "ওয়ার্কআউট রুটিন", ur: "ورزش کی روٹین" })}
              </div>
              <div
                className={`mt-0.5 sm:mt-1 text-xs sm:text-sm font-extrabold ${
                  subUsage.isWorkoutLocked ? "text-slate-400 dark:text-slate-500" : "text-emerald-500"
                }`}
              >
                {subUsage.isWorkoutLocked
                  ? selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })
                  : selectText({ en: "Active", bn: "সক্রিয়", ur: "فعال" })}
              </div>
            </div>

            {/* Community Chat */}
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Community Chat", bn: "কমিউনিটি চ্যাট", ur: "کمیونٹی چیٹ" })}
              </div>
              <div
                className={`mt-0.5 sm:mt-1 text-xs sm:text-sm font-extrabold ${
                  subUsage.isCommunityLocked ? "text-slate-400 dark:text-slate-500" : "text-emerald-500"
                }`}
              >
                {subUsage.isCommunityLocked
                  ? selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })
                  : selectText({ en: "Active", bn: "সক্রিয়", ur: "فعال" })}
              </div>
            </div>

            {/* Mentor Support */}
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Mentor Support", bn: "মেন্টর সাপোর্ট", ur: "مینٹور سپورٹ" })}
              </div>
              <div
                className={`mt-0.5 sm:mt-1 text-xs sm:text-sm font-extrabold ${
                  subUsage.isMentorSupportLocked ? "text-slate-400 dark:text-slate-500" : "text-amber-500 font-black"
                }`}
              >
                {subUsage.isMentorSupportLocked
                  ? selectText({ en: "Locked", bn: "লকড", ur: "مقفل" })
                  : selectText({ en: "Active", bn: "সক্রিয়", ur: "فعাল" })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Market Time Zone Information Widget */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-6 shadow-sm dark:border-slate-800/90 dark:bg-gradient-to-r dark:from-[#0a1628] dark:via-[#091424] dark:to-[#07101e] backdrop-blur-sm transition-all">
        {/* Background decorative glow */}
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-5">
          {/* Left: Timezone details */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex size-10 sm:size-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/15 border border-sky-500/20 shadow-xs">
              <Clock size={20} className="sm:size-6 text-sky-500" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5 sm:mb-1">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  {selectText({ en: "Financial Market Time Zone", bn: "ফিনান্সিয়াল মার্কেট টাইমজোন", ur: "مالیاتی مارکیٹ ٹائم زون" })}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-500/20">
                  <Globe size={9} className="sm:size-2.5" />
                  <span>{currentTimezone.market}</span>
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800/80 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" dir="ltr">
                  UTC {currentTimezone.offset}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentTimezone.city}
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  · {currentTimezone.label}
                </span>
              </div>

              <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {selectText({
                  en: "Active reference timezone for trade journaling, market session timing, and daily resets.",
                  bn: "ট্রেড লগিং, মার্কেট সেশন এবং দৈনিক ডিসিপ্লিন রিসেটের সক্রিয় রেফারেন্স টাইমজোন।",
                  ur: "ٹریڈ جرنلنگ، مارکیٹ سیشن اور روزانہ ری سیٹ کے لیے فعال حوالہ ٹائم زون۔",
                })}
              </p>
            </div>
          </div>

          {/* Right: Live Digital Clock & Settings Link */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between sm:justify-start lg:justify-center gap-2.5 sm:gap-3 shrink-0 pt-2 lg:pt-0 border-t border-slate-100 dark:border-slate-800/70 lg:border-t-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-xl sm:rounded-2xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-500/10 px-3 py-1.5 sm:px-4 sm:py-2 text-left sm:text-right" dir="ltr">
                <div className="flex items-center gap-1.5 sm:gap-2 justify-start sm:justify-end">
                  <span className="relative flex size-1.5 sm:size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 sm:size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {liveMarketTime.date || "..."}
                  </span>
                </div>
                <div className="text-lg sm:text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-sky-400 mt-0.5">
                  {liveMarketTime.time || "--:--:-- --"}
                </div>
              </div>
            </div>

            <Link
              href="/settings?tab=region"
              className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:underline transition-colors cursor-pointer"
              title={selectText({
                en: "Change time zone in Settings → Language & Region",
                bn: "টাইমজোন পরিবর্তন করতে সেটিংস → ভাষা ও অঞ্চলে যান",
                ur: "ٹائم زون تبدیل کرنے کے لیے ترتیبات → زبان اور علاقہ پر جائیں",
              })}
            >
              <SettingsIcon size={12} className="text-sky-500" />
              <span>{selectText({ en: "Manage in Settings", bn: "সেটিংস থেকে পরিবর্তন করুন", ur: "ترتیبات میں تبدیل کریں" })}</span>
              <ChevronRight size={12} className={isRTL ? "rotate-180" : ""} />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-4">
        {/* 1. Total Documented Trades */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              {selectText({ en: "Journal Entries", bn: "মোট ট্রেড জার্নাল", ur: "جرنل اندراجات" })}
            </span>
            <NotebookPen size={16} className="text-[#0284c7] dark:text-sky-400 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black font-mono" dir="ltr">{journalStats.total}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">
              {selectText({ en: "Trades", bn: "টি ট্রেড", ur: "ٹریڈز" })}
            </span>
          </div>
          <div className="mt-2 sm:mt-3 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
            {selectText({
              en: `${journalStats.wins} Wins · ${journalStats.losses} Losses`,
              bn: `${journalStats.wins} উইন · ${journalStats.losses} লস`,
              ur: `${journalStats.wins} جیت · ${journalStats.losses} نقصان`,
            })}
          </div>
        </div>

        {/* 2. Win Rate */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              {selectText({ en: "Trade Win Rate", bn: "ট্রেড উইনরেট", ur: "ٹریڈ ون ریٹ" })}
            </span>
            <Flame size={16} className="text-amber-500 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black font-mono" dir="ltr">{journalStats.winRate}%</span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400" dir="ltr">
              ({journalStats.wins}W / {journalStats.losses}L)
            </span>
          </div>
          <div className="mt-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {selectText({
              en: `${journalStats.total} documented logs`,
              bn: `${journalStats.total}টি ট্রেড`,
              ur: `${journalStats.total} درج شدہ لاگز`,
            })}
          </div>
        </div>

        {/* 3. Journal Logs */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              {selectText({ en: "My Resources", bn: "আনলকড রিসোর্স", ur: "میرے وسائل" })}
            </span>
            <BookOpen size={16} className="text-purple-500 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="mt-2.5 sm:mt-4 text-xl sm:text-3xl font-black font-mono" dir="ltr">
            {entitlements?.length || 0}
          </div>
          <div className="mt-2 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {selectText({ en: "Active entitlements", bn: "সক্রিয় PDF ও কোর্স", ur: "فعال پی ڈی ایف اور کورسز" })}
          </div>
        </div>

        {/* 4. Today's Discipline */}
        <button
          onClick={() => onSelectTab("discipline")}
          className="rounded-2xl sm:rounded-3xl bg-[#081833] p-3.5 sm:p-6 text-white shadow-xl shadow-[#081833]/15 dark:bg-slate-800 text-left transition-all hover:ring-2 hover:ring-[#38bdf8]/50 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#38bdf8]">
              {selectText({ en: "Today's Discipline", bn: "আজকের রুটিন", ur: "آج کا ڈسپلن" })}
            </span>
            <ClipboardCheck size={16} className="text-[#38bdf8] sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black font-mono" dir="ltr">
              {discipline?.filter((d) => d.completed).length || 0}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">
              / 6 {selectText({ en: "Rules", bn: "রুলস", ur: "قواعد" })}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-300">
            <span className="truncate">
              {selectText({ en: "Process over emotion", bn: "ডিসিপ্লিনই শক্তি", ur: "جذبات پر طریقہ کار کو ترجیح" })}
            </span>
            <ChevronRight size={14} className={`text-[#38bdf8] shrink-0 ${isRTL ? "rotate-180" : ""}`} />
          </div>
        </button>

        {/* 5. Your Global Rank */}
        <Link href="/leaderboard" className="col-span-2 sm:col-span-1">
          <div className="rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-slate-50 p-3.5 sm:p-6 shadow-xs dark:border-amber-500/30 dark:from-[#141d2e] dark:via-[#0c1527] dark:to-[#070e1b] transition-all hover:ring-2 hover:ring-amber-500/50 cursor-pointer h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {selectText({ en: "YOUR GLOBAL RANK", bn: "আপনার গ্লোবাল র‍্যাঙ্ক", ur: "آپ کا عالمی رینک" })}
                </span>
                <Trophy size={16} className="text-amber-500 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="mt-2.5 sm:mt-4 flex items-baseline gap-2">
                <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono" dir="ltr">
                  {myRankData?.isRanked && myRankData.rank ? `#${myRankData.rank}` : "Unranked"}
                </span>
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-center justify-between text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="truncate">
                {myRankData?.isRanked && myRankData.overallScore !== null
                  ? selectText({
                      en: `Overall Score: ${myRankData.overallScore} / 100`,
                      bn: `স্কোর: ${myRankData.overallScore} / ১০০`,
                      ur: `مجموعی اسکور: ${myRankData.overallScore} / 100`,
                    })
                  : selectText({
                      en: "Log trades to qualify",
                      bn: "র‌্যাঙ্ক পেতে ট্রেড লগ করুন",
                      ur: "اہلیت کے لیے ٹریڈز درج کریں",
                    })}
              </span>
              <ChevronRight size={14} className={`text-amber-500 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
            </div>
          </div>
        </Link>
      </div>

      {/* Daily Discipline Analytics Feature Showcase Card */}
      <DailyDisciplineOverviewCard
        isBn={isBn}
        onExplore={() => onSelectTab("discipline-analytics")}
      />

      {/* Recent Order Status Alert Banner */}
      {orders && orders.length > 0 && (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5">
              <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 ${
                orders[0].orderStatus === "approved"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : orders[0].orderStatus === "rejected"
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}>
                <Receipt size={18} className="sm:size-[22px]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {selectText({ en: "Latest Order", bn: "সর্বশেষ অর্ডার", ur: "تازہ ترین آرڈر" })} #{orders[0].id}
                  </span>
                  <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-sky-700 dark:text-sky-300">
                    {orders[0].bundleId === 4 ? "Bundle 4 · Trading Blueprint" : orders[0].bundleId === 2 ? "Bundle 2 · Course + eBook" : orders[0].bundleId === 1 ? "Free eBook Package" : `Bundle #${orders[0].bundleId}`}
                  </span>
                  <span
                    className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase ${
                      orders[0].orderStatus === "approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : orders[0].orderStatus === "rejected"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 animate-pulse"
                    }`}
                  >
                    {orders[0].orderStatus === "approved"
                      ? selectText({ en: "Approved", bn: "অনুমোদিত", ur: "منظور شدہ" })
                      : orders[0].orderStatus === "rejected"
                      ? selectText({ en: "Rejected", bn: "বাতিল", ur: "مسترد شدہ" })
                      : selectText({
                          en: "Pending Review (15–30 mins)",
                          bn: "যাচাই প্রক্রিয়াধীন (১৫-৩০ মিনিট)",
                          ur: "زیر جائزہ (15–30 منٹ)",
                        })}
                  </span>
                </div>
                <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400" dir="ltr">
                  {orders[0].paymentMethod?.toUpperCase()} · TrxID: <code className="font-mono font-bold text-slate-700 dark:text-slate-200">{orders[0].transactionId}</code> · ৳{orders[0].amount} BDT
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectTab("orders")}
              className="text-xs font-extrabold text-sky-600 hover:text-sky-500 dark:text-sky-400 shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>{selectText({ en: "View All Orders", bn: "সব অর্ডার দেখুন", ur: "تمام آرڈرز دیکھیں" })}</span>
              <ChevronRight size={13} className={`sm:size-3.5 ${isRTL ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Learning Resource Banner CTA */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#081833] via-[#0f2c59] to-[#0a1e3d] p-4 sm:p-9 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#38bdf8]">
              <Sparkles size={12} className="sm:size-[13px]" /> {selectText({ en: "INSTITUTIONAL EDGE", bn: "প্রাতিষ্ঠানিক রিসোর্স", ur: "ادارہ جاتی برتری" })}
            </span>
            <h2 className="mt-2 sm:mt-4 text-lg sm:text-3xl font-extrabold tracking-tight">
              {selectText({
                en: "Institutional Cheat-Sheets & High-RR Models",
                bn: "প্রাতিষ্ঠানিক চিট-শীট ও হাই-RR ট্রেডিং মডেল",
                ur: "ادارہ جاتی چیٹ شیٹس اور ہائی RR ماডلز",
              })}
            </h2>
            <p className="mt-1.5 sm:mt-2 max-w-xl text-[11px] sm:text-sm text-slate-300 leading-relaxed">
              {selectText({
                en: "Master candle range theory (CRT), liquidity sweeps, and strict risk management through curated institutional guides.",
                bn: "ক্যান্ডেল রেঞ্জ থিওরি (CRT), লিকুইডিটি সুইপ এবং প্রাতিষ্ঠানিক রিস্ক ম্যানেজমেন্ট গাইড অনুশীলন করে আপনার এজ তৈরি করুন।",
                ur: "کینڈل رینج تھیوری (CRT)، Liquidity sweeps، اور سخت رسک مینجمنٹ کو منتخب ادارہ جاتی گائیڈز کے ذریعے سیکھیں۔",
              })}
            </p>
          </div>

          <Button
            onClick={() => onSelectTab("library")}
            size="lg"
            className="shrink-0 h-10 sm:h-12 gap-2 rounded-xl sm:rounded-2xl bg-[#38bdf8] font-black text-xs sm:text-sm text-slate-950 hover:bg-[#7dd3fc] shadow-lg shadow-sky-500/20"
          >
            <span>{selectText({ en: "Open Study Library", bn: "লাইব্রেরি ওপেন করুন", ur: "اسٹڈی لائبریری کھولیں" })}</span>
            <ArrowRight size={15} className={`sm:size-4 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Two Column Section: Quick Recent Journal & Discipline */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Journal Entries */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold">
              {selectText({ en: "Recent Trade Logs", bn: "সাম্প্রতিক ট্রেড জার্নাল", ur: "حالیہ ٹریڈ لاگز" })}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onSelectTab("journal")} className="text-xs font-bold text-[#0284c7] dark:text-sky-400">
              {selectText({ en: "View all", bn: "সব দেখুন", ur: "سب دیکھیں" })} {isRTL ? "←" : "→"}
            </Button>
          </div>

          <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
            {localTrades?.length ? (
              localTrades.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">{item.pair} ({item.direction})</span>
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-500">#{item.tradeNumber}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase font-mono ${
                        item.pnl > 0.001
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : item.pnl < -0.001
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                      dir="ltr"
                    >
                      {item.pnl > 0.001 ? `+$${item.pnl.toFixed(2)}` : item.pnl < -0.001 ? `-$${Math.abs(item.pnl).toFixed(2)}` : "BE $0"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.note || item.learning || "Trade recorded in Institutional Journal"}</p>
                  <div className="mt-1.5 sm:mt-2 flex items-center gap-2 text-[9px] sm:text-[10px] font-mono text-slate-400" dir="ltr">
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
                <div key={item.id} className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm">{item.title}</span>
                    <span
                      className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase ${
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
                  <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-mono text-slate-400" dir="ltr">{item.setup || "General Setup"} • {new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            ) : (
              <div className="rounded-xl sm:rounded-2xl border border-dashed border-slate-200 p-6 sm:p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                {selectText({
                  en: "No trade logs recorded yet. Build the habit of journaling every setup.",
                  bn: "এখনো কোনো ট্রেড জার্নাল এন্ট্রি যোগ করা হয়নি।",
                  ur: "ابھی تک کوئی ٹریڈ لاگ درج نہیں ہوئی۔ ہر سیٹ اپ کو جرنل کرنے کی عادت بنائیں۔",
                })}
              </div>
            )}
          </div>
        </div>

        {/* Daily Discipline Checklist */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold">
                {selectText({ en: "Daily Discipline Checklist", bn: "ডেইলি ট্রেডার চেকলিস্ট", ur: "روزانہ ٹریڈر چیک لسٹ" })}
              </h3>
              <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400" dir="ltr">{today}</span>
            </div>
            <button
              onClick={() => onSelectTab("discipline")}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
            >
              <span>{selectText({ en: "Full System", bn: "সম্পূর্ণ সিস্টেম", ur: "مکمل سسٹم" })}</span>
              <ChevronRight size={13} className={`sm:size-3.5 ${isRTL ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
            {DAILY_DISCIPLINE_RULES.slice(0, 4).map((rule) => {
              const isChecked = Boolean(discipline?.some((d) => d.label === rule.id && d.completed));
              return (
                <button
                  key={rule.id}
                  onClick={() => onToggleDisciplineRule({ label: rule.id, date: today, completed: !isChecked })}
                  className={`flex w-full items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border p-2.5 sm:p-3.5 text-left transition-all cursor-pointer ${
                    isChecked
                      ? "border-emerald-200 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
                      : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/40"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? <CheckCircle2 size={15} className="text-emerald-500 sm:size-4" /> : <Circle size={15} className="text-slate-300 dark:text-slate-600 sm:size-4" />}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-medium leading-relaxed ${isChecked ? "line-through opacity-80" : ""}`}>
                    {selectText({ en: rule.textEn, bn: rule.textBn, ur: rule.textUr })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ClaimFreePlanModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        source="dashboard"
      />
    </div>
  );
}
