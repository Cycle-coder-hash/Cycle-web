import { useState } from "react";
import {
  Calendar as CalendarIcon,
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisciplineStatsTabProps {
  stats: any;
  isLoading: boolean;
  isBn: boolean;
  onSelectDate?: (d: string) => void;
}

export function DisciplineStatsTab({
  stats,
  isLoading,
  isBn,
  onSelectDate,
}: DisciplineStatsTabProps) {
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  if (isLoading) {
    return (
      <div className="py-20 text-center animate-pulse">
        <div className="mx-auto size-12 rounded-full bg-slate-200 dark:bg-slate-800 mb-3" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {isBn ? "পরিসংখ্যান লোড হচ্ছে..." : "Loading Performance Analytics..."}
        </p>
      </div>
    );
  }

  const hasData = stats?.hasData ?? false;
  const todayPercent = stats?.todayPercent ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const bestStreak = stats?.bestStreak ?? 0;
  const totalCompleted = stats?.totalCompletedTasksAllTime ?? 0;
  const weeklyPercent = stats?.weeklyPercent ?? 0;
  const monthlyPercent = stats?.monthlyPercent ?? 0;

  const workoutRate = stats?.workoutConsistency?.consistencyPercent ?? 0;
  const totalWorkouts = stats?.workoutConsistency?.totalCompleted ?? 0;

  const forexMinutesToday = stats?.forexConsistency?.minutesToday ?? 0;
  const forexMinutesWeek = stats?.forexConsistency?.minutesThisWeek ?? 0;
  const forexAvg = stats?.forexConsistency?.averageMinutesPerDay ?? 0;

  // Calendar month generator
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...

  const prevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const monthName = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Map 30-day stats into quick lookup for calendar
  const datePercentMap: Record<string, number> = {};
  (stats?.last30Days || []).forEach((d: any) => {
    datePercentMap[d.date] = d.percent;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* TOP SUMMARY STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isBn ? "বর্তমান স্ট্রিক" : "Current Streak"}</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-500">{currentStreak} <span className="text-xs text-slate-400 font-semibold">{isBn ? "দিন" : "Days"}</span></div>
          <div className="mt-1 text-[11px] font-bold text-slate-400">{isBn ? `রেকর্ড: ${bestStreak} দিন` : `Best: ${bestStreak} Days`}</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isBn ? "সর্বমোট টাস্ক সম্পন্ন" : "Total Completed"}</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{totalCompleted}</div>
          <div className="mt-1 text-[11px] font-bold text-slate-400">{isBn ? "সর্বকালীন টাস্ক" : "All-time Tasks"}</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isBn ? "ওয়ার্কআউট ধারাবাহিকতা" : "Workout Rate"}</span>
            <Dumbbell size={16} className="text-orange-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-orange-500">{workoutRate}%</div>
          <div className="mt-1 text-[11px] font-bold text-slate-400">{totalWorkouts} {isBn ? "সেশন সম্পন্ন" : "Sessions"}</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>{isBn ? "ফরেক্স গড়/দিন" : "Forex Avg / Day"}</span>
            <LineChart size={16} className="text-sky-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-sky-600 dark:text-sky-400">{forexAvg} <span className="text-xs text-slate-400 font-semibold">{isBn ? "মিনিট" : "Mins"}</span></div>
          <div className="mt-1 text-[11px] font-bold text-slate-400">{forexMinutesWeek}m {isBn ? "এই সপ্তাহে" : "This Week"}</div>
        </div>
      </div>

      {/* LAST 7 & 30 DAYS PERFORMANCE BARS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Last 7 Days Detailed */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn ? "গত ৭ দিনের পারফরম্যান্স" : "Last 7 Days Performance"}
              </h3>
              <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                {weeklyPercent}% {isBn ? "গড়" : "Average"}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2 items-end min-h-[140px]">
              {(stats?.last7Days || []).map((day: any) => (
                <div key={day.date} className="flex flex-col items-center gap-2">
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {day.percent}%
                  </div>
                  <div className="w-full max-w-[32px] bg-slate-100 dark:bg-slate-800 rounded-xl h-24 flex items-end p-1">
                    <div
                      className={`w-full rounded-lg transition-all duration-300 ${
                        day.percent >= 80 ? "bg-emerald-500" : day.percent >= 50 ? "bg-sky-500" : "bg-amber-500"
                      }`}
                      style={{ height: `${Math.max(8, day.percent)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{day.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            {isBn ? "৮০% এর বেশি স্কোর বজায় রাখলে গ্রিন জোন অ্যাক্টিভ থাকে।" : "Maintaining >= 80% daily completion keeps your routine in the green institutional zone."}
          </p>
        </div>

        {/* 30-Day Trend Heatmap Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn ? "গত ৩০ দিনের ট্র্যাকিং ট্রেন্ড" : "Last 30 Days Trend"}
              </h3>
              <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400">
                {monthlyPercent}% {isBn ? "গড়" : "Average"}
              </span>
            </div>

            <div className="mt-6 flex items-end gap-1 overflow-x-auto pb-2 h-28">
              {(stats?.last30Days || []).map((day: any) => (
                <div
                  key={day.date}
                  className="flex-1 min-w-[6px] h-full flex items-end group relative"
                  title={`${day.date}: ${day.percent}%`}
                >
                  <div
                    className={`w-full rounded-sm transition-all duration-200 ${
                      day.percent >= 80
                        ? "bg-emerald-500"
                        : day.percent >= 50
                        ? "bg-sky-500"
                        : day.percent > 0
                        ? "bg-amber-500"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                    style={{ height: `${Math.max(6, day.percent)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>30 Days Ago</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> ≥80%</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-sky-500" /> 50-79%</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> &lt;50%</span>
            </div>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE MONTHLY CALENDAR VIEW */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "ক্যালেন্ডার-ভিত্তিক ডিসিপ্লিন ভিউ" : "Calendar Completion Matrix"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn ? "প্রতিদিনের ডিসিপ্লিন স্ট্যাটাস ক্যালেন্ডার গ্রিডে পর্যালোচনা করুন।" : "Review historical day-by-day habit completion."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="size-8 rounded-xl border-slate-200 dark:border-slate-800"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="font-mono text-xs font-extrabold px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
              {monthName}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="size-8 rounded-xl border-slate-200 dark:border-slate-800"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-400 pb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty offset days */}
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[64px] rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 opacity-20" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const pct = datePercentMap[dateStr];
            const isToday = dateStr === new Date().toISOString().split("T")[0];

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate?.(dateStr)}
                className={`min-h-[68px] rounded-2xl border p-2 flex flex-col justify-between transition cursor-pointer ${
                  isToday
                    ? "border-[#0284c7] bg-sky-50/40 dark:border-sky-500/60 dark:bg-sky-950/30"
                    : "border-slate-100 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-extrabold ${isToday ? "text-[#0284c7] dark:text-sky-400" : "text-slate-600 dark:text-slate-400"}`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="size-1.5 rounded-full bg-[#0284c7] dark:bg-sky-400" />
                  )}
                </div>

                {pct !== undefined && pct > 0 ? (
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                        pct >= 80
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : pct >= 50
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-300 dark:text-slate-700 font-mono">-</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
