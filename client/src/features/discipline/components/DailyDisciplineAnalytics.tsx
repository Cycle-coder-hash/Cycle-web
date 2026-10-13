import React, { useState } from "react";
import {
  Flame,
  CheckCircle2,
  Trophy,
  TrendingUp,
  Percent,
  Calendar,
  Sparkles,
  ShieldCheck,
  Target,
  ArrowLeft,
  Plus,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { DisciplineChartsSection } from "./DisciplineChartsSection";
import { DisciplineHabitsAndReflectionSection } from "./DisciplineHabitsAndReflectionSection";

interface DailyDisciplineAnalyticsProps {
  user?: any;
  isBn?: boolean;
  onBackToOverview?: () => void;
  onGoToDiscipline?: (subTab?: string) => void;
}

export function DailyDisciplineAnalytics({
  user,
  isBn: isBnProp,
  onBackToOverview,
  onGoToDiscipline,
}: DailyDisciplineAnalyticsProps) {
  const { selectText, isBn: isBnContext, isRTL } = useLanguage();
  const isBn = isBnProp ?? isBnContext;

  // Selected date for deep inspection across schedule, workouts, and journals
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  // TRPC Queries for actual user data
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
    isRefetching,
  } = trpc.customer.disciplineStats.useQuery(undefined, {
    staleTime: 1000 * 20,
    refetchOnWindowFocus: true,
  });

  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    refetch: refetchSchedule,
  } = trpc.customer.disciplineSchedule.useQuery(
    { date: selectedDate },
    { staleTime: 1000 * 20 }
  );

  const {
    data: workoutData,
    isLoading: isWorkoutLoading,
  } = trpc.customer.disciplineWorkouts.useQuery(
    { date: selectedDate },
    { staleTime: 1000 * 20 }
  );

  const {
    data: journalsData,
    isLoading: isJournalsLoading,
  } = trpc.customer.disciplineJournals.useQuery(undefined, {
    staleTime: 1000 * 30,
  });

  const {
    data: forexLogsData,
    isLoading: isForexLoading,
  } = trpc.customer.disciplineForexLogs.useQuery(undefined, {
    staleTime: 1000 * 30,
  });

  const {
    data: settingsData,
    isLoading: isSettingsLoading,
  } = trpc.customer.disciplineSettings.useQuery(undefined, {
    staleTime: 1000 * 60,
  });

  // KPI calculations
  const todayPercent = stats?.todayPercent ?? 0;
  const yesterdayPercent = stats?.yesterdayPercent ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const bestStreak = stats?.bestStreak ?? 0;
  const weeklyPercent = stats?.weeklyPercent ?? 0;
  const monthlyPercent = stats?.monthlyPercent ?? 0;
  const totalCompletedAllTime = stats?.totalCompletedTasksAllTime ?? 0;

  const handleRefreshAll = () => {
    refetchStats();
    refetchSchedule();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* DASHBOARD FRAME & AMBIENT CONTAINER */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-[#071120]/90 dark:shadow-sky-950/30 transition-all duration-300">
        {/* Specular Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-40 z-0"
          style={{
            background: "radial-gradient(750px circle at 50% 0%, rgba(56, 189, 248, 0.08), transparent 70%)",
          }}
        />

        {/* Top Window Chrome / Terminal Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80 mb-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-[11px] font-mono text-slate-400 hidden sm:inline" dir="ltr">
              portal.cycleofchart.com/discipline/analytics
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500 dark:text-cyan-400">
              <ShieldCheck className="h-3 w-3" />
              {selectText({
                en: "Discipline Audit Grade",
                bn: "ডিসিপ্লিন অডিট গ্রেড",
                ur: "ڈسپلن آڈٹ گریڈ",
              })}
            </span>
          </div>
        </div>

        {/* Header & Quick Action Row */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            {onBackToOverview && (
              <Button
                variant="outline"
                size="icon"
                onClick={onBackToOverview}
                className="size-10 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0"
                title={selectText({ en: "Back to Dashboard", bn: "ড্যাশবোর্ডে ফিরে যান", ur: "ڈیش بورڈ پر واپس جائیں" })}
              >
                <ArrowLeft className={`size-4 ${isRTL ? "rotate-180" : ""}`} />
              </Button>
            )}

            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 shrink-0">
              <Target className="size-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectText({
                    en: "Daily Discipline Analytics",
                    bn: "ডেইলি ডিসিপ্লিন অ্যানালিটিক্স",
                    ur: "روزانہ ڈسپلن کے تجزیات",
                  })}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-extrabold text-cyan-400 uppercase">
                  <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectText({
                  en: "Comprehensive routine tracking, execution consistency, workout habits & mental reflection",
                  bn: "সম্পূর্ণ রুটিন ট্র্যাকিং, এক্সিকিউশন ধারাবাহিকতা, ওয়ার্কআউট অভ্যাস ও আত্ম-পর্যালোচনা",
                  ur: "جامع معمول کی ٹریکنگ، عملدرآمد کی مستقل مزاجی، ورزش کی عادات اور ذہنی عکاسی",
                })}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation CTAs */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isRefetching}
              className="h-8 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold gap-1.5 text-slate-700 dark:text-slate-300"
            >
              <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{selectText({ en: "Refresh", bn: "রিফ্রেশ", ur: "تازہ کاری" })}</span>
            </Button>

            {onGoToDiscipline && (
              <Button
                size="sm"
                onClick={() => onGoToDiscipline("schedule")}
                className="h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black gap-1.5 shadow-md shadow-cyan-500/20 px-3"
              >
                <Plus className="size-3.5" />
                <span>{selectText({ en: "+ Log Routine", bn: "+ রুটিন লগ", ur: "+ معمول لاگ" })}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Date Selector Filter Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <Calendar className="size-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {selectText({ en: "Target Inspection Date", bn: "পর্যালোচনার তারিখ", ur: "ہدف کے معائنے کی تاریخ" })}:
              </span>
              <span className="font-mono text-xs font-black text-cyan-500 ml-1.5" dir="ltr">
                {selectedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {selectedDate !== new Date().toISOString().split("T")[0] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="h-7 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-lg px-2"
              >
                {selectText({ en: "Today", bn: "আজ", ur: "آج" })}
              </Button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION A: DISCIPLINE OVERVIEW (5 KEY METRIC KPI CARDS) */}
        {/* ========================================================================= */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 mb-8">
          {/* Card 1: Today's Completion */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {selectText({ en: "Today's Adherence", bn: "আজকের সম্পন্ন", ur: "آج کی تکمیل" })}
              </span>
              <CheckCircle2 className="size-3.5 sm:size-4 text-cyan-500" />
            </div>
            <div className="mt-2 sm:mt-2.5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-cyan-500 font-mono" dir="ltr">
                {isStatsLoading ? "..." : `${todayPercent}%`}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>{selectText({ en: "Yesterday:", bn: "গতকাল:", ur: "گزشتہ کل:" })}</span>
                <span className="font-mono">{yesterdayPercent}%</span>
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-500">
              <TrendingUp className="size-3" />
              <span>{todayPercent >= 80 ? "Institutional Tier" : todayPercent >= 50 ? "Solid Consistency" : "Focus Needed"}</span>
            </div>
          </div>

          {/* Card 2: Current Streak */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {selectText({ en: "Current Streak", bn: "বর্তমান স্ট্রিক", ur: "موجودہ اسٹریک" })}
              </span>
              <Flame className="size-3.5 sm:size-4 text-amber-500" />
            </div>
            <div className="mt-2 sm:mt-2.5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-amber-500 font-mono" dir="ltr">
                {isStatsLoading ? "..." : `${currentStreak}d`}
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>{selectText({ en: "Unbroken days", bn: "ধারাবাহিক দিন", ur: "مسلسل دن" })}</span>
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-medium text-slate-400">
              ≥50% daily minimum
            </div>
          </div>

          {/* Card 3: Best Streak */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {selectText({ en: "Best Streak", bn: "সর্বকালের রেকর্ড", ur: "بہترین اسٹریک" })}
              </span>
              <Trophy className="size-3.5 sm:size-4 text-amber-400" />
            </div>
            <div className="mt-2 sm:mt-2.5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono" dir="ltr">
                {isStatsLoading ? "..." : `${bestStreak}d`}
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>{selectText({ en: "All-time personal best", bn: "সর্বকালের সর্বোচ্চ", ur: "تمام ریکارڈز سے آگے" })}</span>
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="size-3" />
              <span>Record Milestone</span>
            </div>
          </div>

          {/* Card 4: Weekly Average */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {selectText({ en: "Weekly Average", bn: "সাপ্তাহিক গড়", ur: "ہفتہ وار اوسط" })}
              </span>
              <Percent className="size-3.5 sm:size-4 text-emerald-500" />
            </div>
            <div className="mt-2 sm:mt-2.5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-emerald-500 font-mono" dir="ltr">
                {isStatsLoading ? "..." : `${weeklyPercent}%`}
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>{selectText({ en: "Last 7 days velocity", bn: "গত ৭ দিনের গড়", ur: "گزشتہ 7 دن" })}</span>
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-medium text-slate-400">
              {weeklyPercent >= 80 ? "✓ Met Weekly Target" : "Under Target (80%)"}
            </div>
          </div>

          {/* Card 5: Monthly Rate */}
          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {selectText({ en: "Monthly Rate", bn: "মাসিক ধারাবাহিকতা", ur: "ماہانہ شرح" })}
              </span>
              <Layers className="size-3.5 sm:size-4 text-sky-500" />
            </div>
            <div className="mt-2 sm:mt-2.5">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-sky-500 font-mono" dir="ltr">
                {isStatsLoading ? "..." : `${monthlyPercent}%`}
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>{totalCompletedAllTime} {selectText({ en: "Total Tasks Logged", bn: "টি টাস্ক সম্পন্ন", ur: "ٹاسکس مکمل" })}</span>
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-medium text-slate-400">
              30-day consistency
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION F: HISTORICAL ANALYTICS & INTERACTIVE CHARTS */}
        {/* ========================================================================= */}
        <div className="relative z-10 mb-8">
          <DisciplineChartsSection
            stats={stats}
            isBn={isBn}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* ========================================================================= */}
        {/* SECTIONS B, C, D, E: ROUTINE, WORKOUT, FOREX & JOURNAL REFLECTIONS */}
        {/* ========================================================================= */}
        <div className="relative z-10">
          <DisciplineHabitsAndReflectionSection
            stats={stats}
            scheduleData={scheduleData}
            workoutData={workoutData}
            forexLogs={forexLogsData || []}
            journals={journalsData || []}
            settings={settingsData}
            selectedDate={selectedDate}
            isBn={isBn}
            onSelectDate={setSelectedDate}
            onOpenScheduleTab={onGoToDiscipline ? () => onGoToDiscipline("schedule") : undefined}
            onOpenWorkoutTab={onGoToDiscipline ? () => onGoToDiscipline("workout") : undefined}
            onOpenForexTab={onGoToDiscipline ? () => onGoToDiscipline("forex") : undefined}
            onOpenJournalTab={onGoToDiscipline ? () => onGoToDiscipline("journal") : undefined}
          />
        </div>
      </div>
    </div>
  );
}
