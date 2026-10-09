import { useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  LineChart,
  Sparkles,
  Trophy,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisciplineDashboardTabProps {
  stats: any;
  isLoading: boolean;
  isBn: boolean;
  onNavigateTab: (tab: string) => void;
}

export function DisciplineDashboardTab({
  stats,
  isLoading,
  isBn,
  onNavigateTab,
}: DisciplineDashboardTabProps) {
  if (isLoading) {
    return (
      <div className="py-20 text-center animate-pulse">
        <div className="mx-auto size-12 rounded-full bg-slate-200 dark:bg-slate-800 mb-3" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {isBn ? "পরিসংখ্যান লোড হচ্ছে..." : "Loading Discipline Metrics..."}
        </p>
      </div>
    );
  }

  const hasData = stats?.hasData ?? false;
  const todayPercent = stats?.todayPercent ?? 0;
  const yesterdayPercent = stats?.yesterdayPercent ?? 0;
  const weeklyPercent = stats?.weeklyPercent ?? 0;
  const monthlyPercent = stats?.monthlyPercent ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const bestStreak = stats?.bestStreak ?? 0;
  const completedToday = stats?.completedTasksToday ?? 0;
  const remainingToday = stats?.remainingTasksToday ?? 0;
  const totalCompleted = stats?.totalCompletedTasksAllTime ?? 0;

  const workoutThisWeek = stats?.workoutConsistency?.workoutsThisWeek ?? 0;
  const workoutRate = stats?.workoutConsistency?.consistencyPercent ?? 0;

  const forexToday = stats?.forexConsistency?.minutesToday ?? 0;
  const forexThisWeek = stats?.forexConsistency?.minutesThisWeek ?? 0;
  const forexAvg = stats?.forexConsistency?.averageMinutesPerDay ?? 0;
  const forexTarget = stats?.forexConsistency?.targetMinutes ?? 60;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* TOP HERO METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today's Discipline */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? "আজকের ডিসিপ্লিন" : "Today's Discipline"}
            </span>
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {todayPercent}%
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{completedToday} {isBn ? "সম্পন্ন" : "Done"}</span>
              <span>{remainingToday} {isBn ? "বাকি" : "Remaining"}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${todayPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Current & Best Streak */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? "ডিসিপ্লিন স্ট্রিক" : "Discipline Streak"}
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Flame size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-500">
                {currentStreak}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {isBn ? "দিন চালু" : "Days Active"}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <Trophy size={13} className="text-amber-500" />
              <span>{isBn ? `সর্বোচ্চ রেকর্ড: ${bestStreak} দিন` : `Best Streak: ${bestStreak} Days`}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Weekly Average */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? "সাপ্তাহিক গড় (৭ দিন)" : "Weekly Avg (7 Days)"}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
              {weeklyPercent}%
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {isBn
                ? `গতকালের স্কোর ছিল: ${yesterdayPercent}%`
                : `Yesterday's completion: ${yesterdayPercent}%`}
            </p>
          </div>
        </div>

        {/* Card 4: Monthly Average */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? "মাসিক কনসিস্টেন্সি (৩০ দিন)" : "Monthly Rate (30 Days)"}
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">
              {monthlyPercent}%
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {isBn
                ? `সর্বমোট টাস্ক সম্পন্ন: ${totalCompleted}`
                : `Total tasks completed: ${totalCompleted}`}
            </p>
          </div>
        </div>
      </div>

      {/* QUICK STATUS & CONSISTENCY OVERVIEWS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workout Consistency Summary */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-orange-50 p-2 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                <Dumbbell size={18} />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isBn ? "ওয়ার্কআউট ও শারীরিক রুটিন" : "Workout Consistency"}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab("workout")}
              className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] dark:text-sky-400"
            >
              {isBn ? "ওয়ার্কআউট দেখুন" : "Open Workout"} <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? "এই সপ্তাহে সেশন" : "Sessions This Week"}
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {workoutThisWeek} <span className="text-xs font-semibold text-slate-400">{isBn ? "দিন" : "Days"}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? "সাপ্তাহিক টার্গেট রেট" : "Weekly Target Rate"}
              </div>
              <div className="mt-1 text-2xl font-black text-orange-500">
                {workoutRate}%
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{isBn ? "সাপ্তাহিক রুটিন আনুগত্য" : "Weekly Routine Adherence"}</span>
              <span className="font-bold">{workoutThisWeek} / 5 {isBn ? "দিন" : "Days"}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (workoutThisWeek / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Forex Analysis Consistency Summary */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                <LineChart size={18} />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isBn ? "ফরেক্স মার্কেট অ্যানালাইসিস" : "Forex Analysis Tracker"}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab("forex")}
              className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] dark:text-sky-400"
            >
              {isBn ? "লগ দেখুন" : "Open Tracker"} <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? "আজকের অ্যানালাইসিস" : "Analysis Today"}
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {forexToday} <span className="text-xs font-semibold text-slate-400">{isBn ? "মিনিট" : "Mins"}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? "সাপ্তাহিক মোট সময়" : "Total This Week"}
              </div>
              <div className="mt-1 text-2xl font-black text-sky-600 dark:text-sky-400">
                {forexThisWeek} <span className="text-xs font-semibold text-slate-400">{isBn ? "মিনিট" : "Mins"}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{isBn ? "আজকের টার্গেট প্রগ্রেস" : "Daily Target Progress"}</span>
              <span className="font-bold">{forexToday} / {forexTarget} {isBn ? "মিনিট" : "Mins"}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((forexToday / forexTarget) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* LAST 7 DAYS TREND & PERFORMANCE HIGHLIGHTS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base">
              {isBn ? "গত ৭ দিনের ডিসিপ্লিন পারফরম্যান্স" : "Last 7 Days Discipline Trend"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? "প্রতিদিনের টাস্ক সম্পন্নের হার এবং ধারাবাহিকতা পর্যালোচনা করুন।"
                : "Review your daily completion percentage and streak continuity."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("stats")}
            className="text-xs font-bold"
          >
            {isBn ? "সম্পূর্ণ পরিসংখ্যান" : "View Full Stats"}
          </Button>
        </div>

        {/* 7-Day Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 pb-2 items-end min-h-[160px]">
          {(stats?.last7Days || []).map((day: any, idx: number) => {
            const isToday = idx === 6;
            return (
              <div key={day.date} className="flex flex-col items-center gap-2 group">
                <div className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                  {day.percent}%
                </div>
                <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-xl h-24 flex items-end p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      day.percent >= 80
                        ? "bg-emerald-500"
                        : day.percent >= 50
                        ? "bg-sky-500"
                        : day.percent > 0
                        ? "bg-amber-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    style={{ height: `${Math.max(8, day.percent)}%` }}
                  />
                </div>
                <div className="text-center">
                  <div className={`text-[11px] font-extrabold ${isToday ? "text-[#0284c7] dark:text-sky-400" : "text-slate-500"}`}>
                    {day.dayName}
                  </div>
                  <div className="text-[9px] text-slate-400 hidden sm:block">
                    {day.completedCount}/{day.totalCount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Best & Worst Days Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-2xl">
            <Trophy size={16} className="shrink-0" />
            <div>
              <span className="font-bold">{isBn ? "সেরা পারফরম্যান্স দিন:" : "Best Performance Day:"}</span>{" "}
              <span className="font-mono font-extrabold">{stats?.bestDay?.date || "N/A"} ({stats?.bestDay?.percent || 0}%)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
            <Clock size={16} className="shrink-0" />
            <div>
              <span className="font-bold">{isBn ? "সর্বনিম্ন সম্পন্ন দিন:" : "Lowest Completion Day:"}</span>{" "}
              <span className="font-mono font-extrabold">{stats?.worstDay?.date || "N/A"} ({stats?.worstDay?.percent || 0}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={() => onNavigateTab("schedule")}
          className="w-full gap-2 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold py-5 rounded-2xl"
        >
          <CheckCircle2 size={16} />
          <span>{isBn ? "আজকের শিডিউল দেখুন" : "View Today's Schedule"}</span>
        </Button>

        <Button
          onClick={() => onNavigateTab("workout")}
          variant="outline"
          className="w-full gap-2 font-bold py-5 rounded-2xl border-slate-200 dark:border-slate-800"
        >
          <Dumbbell size={16} className="text-orange-500" />
          <span>{isBn ? "ওয়ার্কআউট ও টাইমার" : "Workout & Rest Timer"}</span>
        </Button>

        <Button
          onClick={() => onNavigateTab("forex")}
          variant="outline"
          className="w-full gap-2 font-bold py-5 rounded-2xl border-slate-200 dark:border-slate-800"
        >
          <LineChart size={16} className="text-sky-500" />
          <span>{isBn ? "ফরেক্স অ্যানালাইসিস লগ" : "Log Forex Analysis"}</span>
        </Button>
      </div>
    </div>
  );
}
