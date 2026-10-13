import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface DisciplineChartsSectionProps {
  stats: any;
  isBn: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function DisciplineChartsSection({
  stats,
  isBn,
  selectedDate,
  onSelectDate,
}: DisciplineChartsSectionProps) {
  const { selectText } = useLanguage();
  const [chartMode, setChartMode] = useState<"7day" | "30day" | "calendar">("7day");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Safe data extraction
  const last7Days = (stats?.last7Days || []).map((d: any) => ({
    name: d.dayName,
    date: d.date,
    percent: d.percent ?? 0,
    completedCount: d.completedCount ?? 0,
    totalCount: d.totalCount ?? 0,
  }));

  const last30Days = (stats?.last30Days || []).map((d: any) => ({
    date: d.date,
    day: d.date ? d.date.slice(5) : "",
    percent: d.percent ?? 0,
  }));

  const bestDay = stats?.bestDay || { date: "-", percent: 0 };
  const worstDay = stats?.worstDay || { date: "-", percent: 0 };
  const weeklyPercent = stats?.weeklyPercent ?? 0;
  const monthlyPercent = stats?.monthlyPercent ?? 0;

  // Calendar matrix generator
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = firstDayOfMonth.getDay(); // 0 = Sun
  const monthName = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));

  // Date percent mapping for calendar
  const datePercentMap: Record<string, number> = {};
  (stats?.last30Days || []).forEach((d: any) => {
    datePercentMap[d.date] = d.percent;
  });

  return (
    <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#0a1529]/95 via-[#070e1e]/95 to-[#040814]/95 p-5 sm:p-6 lg:p-7 shadow-[0_12px_40px_-15px_rgba(2,6,23,0.85),0_0_25px_-5px_rgba(6,182,212,0.1)] relative overflow-hidden backdrop-blur-xl group/analytics-card transition-all duration-300 hover:border-cyan-500/35">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Header & Segmented Controller */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-500/35 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] shrink-0">
            <BarChart3 className="size-5 text-cyan-400" />
            <span className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-sm -z-10" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base sm:text-lg font-black tracking-tight text-white">
                {selectText({
                  en: "Historical Discipline Analytics & Trends",
                  bn: "ঐতিহাসিক ডিসিপ্লিন ট্রেন্ড ও অ্যানালিটিক্স",
                  ur: "تاریخی ڈسپلن تجزیات اور رجحانات",
                })}
              </h4>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {chartMode === "7day" ? "7-Day Velocity" : chartMode === "30day" ? "30-Day Curve" : "Monthly Matrix"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {selectText({
                en: "Continuous routine adherence tracking, completion consistency, and milestone records",
                bn: "ধারাবাহিক রুটিন ট্র্যাকিং, কমপ্লিশন ধারাবাহিকতা এবং রেকর্ড পারফরম্যান্স",
                ur: "مسلسل معمول کی ٹریکنگ، تکمیل کی مستقل مزاجی، اور سنگ میل کے ریکارڈ",
              })}
            </p>
          </div>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-[#030712]/90 border border-slate-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md self-start lg:self-center">
          {[
            { id: "7day", label: selectText({ en: "7-Day Trend", bn: "৭ দিনের ট্রেন্ড", ur: "7 دن کا رجحان" }) },
            { id: "30day", label: selectText({ en: "30-Day Trend", bn: "৩০ দিনের কার্ভ", ur: "30 دن کا کرو" }) },
            { id: "calendar", label: selectText({ en: "Calendar Matrix", bn: "ক্যালেন্ডার গ্রিড", ur: "کیلنڈر گرڈ" }) },
          ].map((tab) => {
            const isActive = chartMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChartMode(tab.id as any)}
                className={`relative rounded-xl px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all duration-200 select-none ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_16px_rgba(6,182,212,0.4)] scale-[1.02]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="size-2 rounded-full bg-cyan-400" />
            <span>7D Avg: <strong className="font-mono text-cyan-400 font-black">{weeklyPercent}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="size-2 rounded-full bg-blue-500" />
            <span>30D Avg: <strong className="font-mono text-blue-400 font-black">{monthlyPercent}%</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
            <Trophy className="size-3" />
            {selectText({ en: `Best Day: ${bestDay.percent}% (${bestDay.date})`, bn: `সেরা দিন: ${bestDay.percent}%`, ur: `بہترین دن: ${bestDay.percent}%` })}
          </span>
          {worstDay.date !== bestDay.date && worstDay.percent > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <AlertCircle className="size-3" />
              {selectText({ en: `Min: ${worstDay.percent}%`, bn: `সর্বনিম্ন: ${worstDay.percent}%`, ur: `کم از کم: ${worstDay.percent}%` })}
            </span>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="mt-5">
        {/* 1. 7-DAY TREND (COMBINED AREA + BAR) */}
        {chartMode === "7day" && (
          <div className="space-y-4">
            <div className="h-64 sm:h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="discipline7Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#081325",
                      borderColor: "rgba(6, 182, 212, 0.4)",
                      borderRadius: "16px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.7)",
                      color: "#fff",
                      fontSize: "12px",
                      padding: "10px 14px",
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% (${item.payload.completedCount}/${item.payload.totalCount} tasks)`,
                      "Completion",
                    ]}
                    labelFormatter={(label, items) => {
                      const itm = items?.[0]?.payload;
                      return itm?.date ? `${label} · ${itm.date}` : label;
                    }}
                  />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ value: "Target (80%)", fill: "#10b981", fontSize: 10, position: "insideTopRight" }} />
                  <Area
                    type="monotone"
                    dataKey="percent"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#discipline7Grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Day Bar Indicators */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
              {last7Days.map((d: any) => {
                const isSelected = selectedDate === d.date;
                return (
                  <button
                    key={d.date}
                    onClick={() => onSelectDate(d.date)}
                    className={`flex flex-col items-center p-2 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/15 text-white shadow-md shadow-cyan-500/20"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400">{d.name}</span>
                    <span className="font-mono text-xs sm:text-sm font-black text-white mt-0.5">{d.percent}%</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono">{d.completedCount}/{d.totalCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. 30-DAY TREND (FULL TRAJECTORY) */}
        {chartMode === "30day" && (
          <div className="space-y-4">
            <div className="h-64 sm:h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="discipline30Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    interval={4}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#081325",
                      borderColor: "rgba(56, 189, 248, 0.4)",
                      borderRadius: "16px",
                      color: "#fff",
                      fontSize: "12px",
                      padding: "10px 14px",
                    }}
                    formatter={(val: any) => [`${val}%`, "Daily Completion"]}
                    labelFormatter={(label, items) => {
                      const itm = items?.[0]?.payload;
                      return itm?.date || label;
                    }}
                  />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="percent"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#discipline30Grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
              <span>30 Days Ago</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> ≥80% Target</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-500" /> 50–79%</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> &lt;50%</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        )}

        {/* 3. CALENDAR COMPLETION MATRIX */}
        {chartMode === "calendar" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-sm font-extrabold text-cyan-400">
                {monthName}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevMonth}
                  className="size-8 rounded-xl border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="size-8 rounded-xl border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-extrabold uppercase text-slate-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty leading padding */}
              {Array.from({ length: startDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-slate-900/20" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const pct = datePercentMap[dateKey] ?? 0;
                const isSelected = selectedDate === dateKey;
                const isToday = new Date().toISOString().split("T")[0] === dateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => onSelectDate(dateKey)}
                    className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center border transition-all text-center relative ${
                      isSelected
                        ? "border-cyan-400 ring-2 ring-cyan-400/40 bg-cyan-500/20 text-white"
                        : pct >= 80
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500"
                        : pct >= 50
                        ? "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:border-sky-500"
                        : pct > 0
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-500"
                        : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-[11px] font-bold font-mono">{dayNum}</span>
                    {pct > 0 ? (
                      <span className="text-[9px] font-mono font-black">{pct}%</span>
                    ) : (
                      <span className="text-[9px] text-slate-600">-</span>
                    )}
                    {isToday && (
                      <span className="absolute top-1 right-1 size-1.5 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
