import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Edit,
  Printer,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalBook, TradeEntry } from "@/types/journal";

interface JournalCalendarProps {
  book: JournalBook | null;
  trades: TradeEntry[]; // Scoped strictly to current journal book
  currencySymbol?: string;
  isBn?: boolean;
  onViewTrade: (trade: TradeEntry) => void;
  onEditTrade: (trade: TradeEntry) => void;
  onDeleteTrade: (tradeId: string) => void;
  onPrintTrade?: (trade: TradeEntry) => void;
  onLogTradeForDate?: (dateStr: string) => void;
}

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const WEEKDAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_NAMES_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

export function JournalCalendar({
  book,
  trades,
  currencySymbol = "$",
  isBn = false,
  onViewTrade,
  onEditTrade,
  onDeleteTrade,
  onPrintTrade,
  onLogTradeForDate,
}: JournalCalendarProps) {
  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Selected date state (defaults to today in YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  // Group trades strictly by date (YYYY-MM-DD) for this book
  const tradesByDate = useMemo(() => {
    const map = new Map<string, TradeEntry[]>();
    trades.forEach((trade) => {
      if (!trade.date) return;
      const d = trade.date.trim().slice(0, 10);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(trade);
    });
    return map;
  }, [trades]);

  // Current month prefix for querying
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  // Monthly stats calculations for the selected month in this book
  const monthStats = useMemo(() => {
    const monthTrades = trades.filter((t) => t.date && t.date.startsWith(monthPrefix));
    const totalPnl = monthTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);

    // Group by unique days with trades in this month
    const daysMap = new Map<string, number>();
    monthTrades.forEach((t) => {
      const d = t.date.slice(0, 10);
      daysMap.set(d, (daysMap.get(d) || 0) + (Number(t.pnl) || 0));
    });

    let greenDays = 0;
    let redDays = 0;
    let beDays = 0;

    daysMap.forEach((dayPnl) => {
      if (dayPnl > 0.001) greenDays++;
      else if (dayPnl < -0.001) redDays++;
      else beDays++;
    });

    const activeTradingDays = daysMap.size;
    const dayWinRate =
      activeTradingDays > 0 ? Math.round((greenDays / activeTradingDays) * 100) : 0;

    return {
      totalPnl,
      tradesCount: monthTrades.length,
      activeTradingDays,
      greenDays,
      redDays,
      beDays,
      dayWinRate,
    };
  }, [trades, monthPrefix]);

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      trades: TradeEntry[];
      netPnl: number;
      hasTrades: boolean;
      status: "profit" | "loss" | "breakeven" | "empty";
    }> = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth();
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayTrades = tradesByDate.get(dateStr) || [];
      const netPnl = dayTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);
      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        trades: dayTrades,
        netPnl,
        hasTrades: dayTrades.length > 0,
        status:
          dayTrades.length === 0
            ? "empty"
            : netPnl > 0.001
            ? "profit"
            : netPnl < -0.001
            ? "loss"
            : "breakeven",
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayTrades = tradesByDate.get(dateStr) || [];
      const netPnl = dayTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);
      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: true,
        trades: dayTrades,
        netPnl,
        hasTrades: dayTrades.length > 0,
        status:
          dayTrades.length === 0
            ? "empty"
            : netPnl > 0.001
            ? "profit"
            : netPnl < -0.001
            ? "loss"
            : "breakeven",
      });
    }

    // Next month padding to fill grid (35 or 42 cells)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const nextDate = new Date(year, month + 1, dayNum);
      const nextYear = nextDate.getFullYear();
      const nextMonth = nextDate.getMonth();
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayTrades = tradesByDate.get(dateStr) || [];
      const netPnl = dayTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);
      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        trades: dayTrades,
        netPnl,
        hasTrades: dayTrades.length > 0,
        status:
          dayTrades.length === 0
            ? "empty"
            : netPnl > 0.001
            ? "profit"
            : netPnl < -0.001
            ? "loss"
            : "breakeven",
      });
    }

    return days;
  }, [year, month, tradesByDate]);

  // Trades for the currently selected date
  const selectedDateTrades = useMemo(() => {
    return tradesByDate.get(selectedDate) || [];
  }, [tradesByDate, selectedDate]);

  const selectedDatePnl = useMemo(() => {
    return selectedDateTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);
  }, [selectedDateTrades]);

  // Formatted date string for the selected day
  const formattedSelectedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString(isBn ? "bn-BD" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate, isBn]);

  const monthLabel = isBn
    ? `${MONTH_NAMES_BN[month]} ${year}`
    : `${MONTH_NAMES_EN[month]} ${year}`;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CALENDAR CONTAINER CARD */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        {/* Header & Month Navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 shadow-xs">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isBn ? "পারফরম্যান্স ও ট্রেড ক্যালেন্ডার" : "Trading Journal Calendar"}
                </h3>
                {book ? (
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500">
                    {book.name}
                  </span>
                ) : (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {isBn ? "সকল বুক সম্মিলিত" : "All Journal Books"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? "প্রতিদিনের নিট P&L ট্র্যাকিং, লাভ-ক্ষতি ক্যালেন্ডার ও দৈনিক ট্রেড বিবরণী"
                  : "Daily net P&L aggregation, win/loss day status, and date-based journal audits"}
              </p>
            </div>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0 rounded-xl border-slate-200 dark:border-slate-700 hover:text-cyan-500"
              title={isBn ? "পূর্ববর্তী মাস" : "Previous Month"}
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="min-w-[130px] text-center font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
              {monthLabel}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 rounded-xl border-slate-200 dark:border-slate-700 hover:text-cyan-500"
              title={isBn ? "পরবর্তী মাস" : "Next Month"}
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleToday}
              className="h-8 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold px-2.5 hover:border-cyan-500 hover:text-cyan-500"
            >
              {isBn ? "আজ" : "Today"}
            </Button>
          </div>
        </div>

        {/* Month Summary Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Month Net PnL */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <div className="text-[11px] font-bold text-slate-400">
              {isBn ? "মাসিক নিট P&L" : "Monthly Net P&L"}
            </div>
            <div
              className={`mt-1 text-lg sm:text-xl font-black font-mono ${
                monthStats.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {monthStats.totalPnl >= 0
                ? `+${currencySymbol}${monthStats.totalPnl.toFixed(2)}`
                : `-${currencySymbol}${Math.abs(monthStats.totalPnl).toFixed(2)}`}
            </div>
          </div>

          {/* Green vs Red Days */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <div className="text-[11px] font-bold text-slate-400">
              {isBn ? "গ্রিন বনাম রেড দিন" : "Green vs Red Days"}
            </div>
            <div className="mt-1 flex items-center gap-2 font-mono text-sm sm:text-base font-black">
              <span className="text-emerald-500">{monthStats.greenDays}W</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-rose-500">{monthStats.redDays}L</span>
              {monthStats.beDays > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span className="text-slate-400">{monthStats.beDays}BE</span>
                </>
              )}
            </div>
          </div>

          {/* Day Win Rate */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <div className="text-[11px] font-bold text-slate-400">
              {isBn ? "দৈনিক উইন রেট" : "Daily Win Rate"}
            </div>
            <div className="mt-1 text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white">
              {monthStats.dayWinRate}%
            </div>
          </div>

          {/* Total Trades in Month */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <div className="text-[11px] font-bold text-slate-400">
              {isBn ? "মোট ট্রেড এন্ট্রি" : "Trades This Month"}
            </div>
            <div className="mt-1 text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white">
              {monthStats.tradesCount}{" "}
              <span className="text-xs font-semibold text-slate-400">
                ({monthStats.activeTradingDays} {isBn ? "দিন" : "days"})
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Day-of-Week Headers */}
        <div className="mt-6 grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-400">
          {(isBn ? WEEKDAY_NAMES_BN : WEEKDAY_NAMES_EN).map((dayName, idx) => (
            <div
              key={idx}
              className={`py-2 ${
                idx === 0 || idx === 6
                  ? "text-slate-400/70"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* 7-Column Calendar Days Grid */}
        <div className="mt-1 grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((day) => {
            const isSelected = selectedDate === day.dateStr;
            const isToday = todayStr === day.dateStr;

            // Compute background and border styles
            let statusClasses =
              "border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/40 hover:border-cyan-400/60";

            if (day.status === "profit") {
              statusClasses =
                "border-emerald-500/30 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300 hover:border-emerald-500";
            } else if (day.status === "loss") {
              statusClasses =
                "border-rose-500/30 bg-rose-50/50 text-rose-950 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300 hover:border-rose-500";
            } else if (day.status === "breakeven") {
              statusClasses =
                "border-amber-500/30 bg-amber-50/50 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 hover:border-amber-500";
            }

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDate(day.dateStr)}
                className={`relative flex min-h-[70px] sm:min-h-[88px] flex-col justify-between rounded-2xl border p-2 text-left transition-all duration-150 cursor-pointer ${statusClasses} ${
                  !day.isCurrentMonth ? "opacity-35" : "opacity-100"
                } ${
                  isSelected
                    ? "ring-2 ring-cyan-500 shadow-md shadow-cyan-500/15 !border-cyan-500"
                    : ""
                }`}
              >
                {/* Day Number and Today Indicator */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-cyan-500 text-white font-black"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {day.hasTrades && (
                    <span className="rounded-md bg-slate-200/60 dark:bg-slate-800/80 px-1 py-0.5 text-[9px] font-black font-mono text-slate-600 dark:text-slate-400">
                      {day.trades.length}
                    </span>
                  )}
                </div>

                {/* Day Result: Aggregated P&L */}
                {day.hasTrades ? (
                  <div className="mt-1.5">
                    <div
                      className={`text-[11px] sm:text-xs font-black font-mono truncate ${
                        day.netPnl >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {day.netPnl >= 0
                        ? `+${currencySymbol}${day.netPnl.toFixed(0)}`
                        : `-${currencySymbol}${Math.abs(day.netPnl).toFixed(0)}`}
                    </div>
                    <div className="hidden sm:block text-[9px] font-semibold text-slate-400 dark:text-slate-500 truncate">
                      {day.trades.length === 1
                        ? isBn ? "১টি ট্রেড" : "1 trade"
                        : isBn ? `${day.trades.length}টি ট্রেড` : `${day.trades.length} trades`}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-300 dark:text-slate-700 select-none">
                    —
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SELECTED DATE DAY-JOURNAL VIEW PANEL */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors animate-in fade-in duration-200">
        {/* Panel Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {formattedSelectedDate}
              </h4>
              {selectedDate === todayStr && (
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black text-cyan-500">
                  {isBn ? "আজ" : "Today"}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>
                {isBn ? "জার্নাল বুক:" : "Book:"}{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {book ? book.name : isBn ? "সকল বুক" : "All Books"}
                </span>
              </span>
              <span>·</span>
              <span>
                {isBn ? "মোট ট্রেড:" : "Trades:"}{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedDateTrades.length}
                </span>
              </span>
              <span>·</span>
              <span>
                {isBn ? "নিট ফলাফল:" : "Net P&L:"}{" "}
                <span
                  className={`font-mono font-bold ${
                    selectedDatePnl >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {selectedDatePnl >= 0
                    ? `+${currencySymbol}${selectedDatePnl.toFixed(2)}`
                    : `-${currencySymbol}${Math.abs(selectedDatePnl).toFixed(2)}`}
                </span>
              </span>
            </div>
          </div>

          {/* Quick Action Button to Log Trade for this Date */}
          <Button
            size="sm"
            onClick={() => onLogTradeForDate?.(selectedDate)}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs gap-1.5 self-start sm:self-center shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isBn ? "এই তারিখে ট্রেড লগ করুন" : "Log Trade on this Date"}</span>
          </Button>
        </div>

        {/* Panel Content: Trade Cards or Empty State */}
        <div className="mt-5">
          {selectedDateTrades.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center dark:border-slate-800">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800/60">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-extrabold text-slate-700 dark:text-slate-300">
                {isBn
                  ? `${formattedSelectedDate} তারিখে কোনো ট্রেড লগ করা হয়নি।`
                  : `No trade records logged on ${formattedSelectedDate}.`}
              </p>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                {isBn
                  ? `আপনি চাইলে উপরে "+ এই তারিখে ট্রেড লগ করুন" বাটনে ক্লিক করে "${book ? book.name : 'জার্নাল'}"-এ এই দিনের জন্য এন্ট্রি যোগ করতে পারেন।`
                  : `You can click "+ Log Trade on this Date" to record historical or today's execution details for this journal book.`}
              </p>
            </div>
          ) : (
            /* Trade Cards List */
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedDateTrades.map((trade) => {
                const isProfit = trade.pnl > 0.001;
                const isLoss = trade.pnl < -0.001;
                const hasMedia = trade.screenshots?.length || trade.mediaUrl;

                return (
                  <div
                    key={trade.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 hover:border-cyan-500/50 transition-all shadow-2xs"
                  >
                    <div>
                      {/* Top Row: Trade Number, Pair, Direction, PnL */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/10 text-xs font-black text-cyan-500 font-mono">
                            #{trade.tradeNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-sm text-slate-900 dark:text-white">
                                {trade.pair}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase ${
                                  trade.direction === "Buy"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-rose-500/10 text-rose-500"
                                }`}
                              >
                                {trade.direction}
                              </span>
                              <span className="rounded-md bg-slate-200/50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {trade.timeframe}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {trade.entryTime || "Time not specified"}
                            </div>
                          </div>
                        </div>

                        {/* PnL and R-multiple */}
                        <div className="text-right font-mono">
                          <div
                            className={`text-base font-black ${
                              isProfit
                                ? "text-emerald-500"
                                : isLoss
                                ? "text-rose-500"
                                : "text-slate-400"
                            }`}
                          >
                            {isProfit
                              ? `+${currencySymbol}${trade.pnl.toFixed(2)}`
                              : isLoss
                              ? `-${currencySymbol}${Math.abs(trade.pnl).toFixed(2)}`
                              : `${currencySymbol}0.00`}
                          </div>
                          {trade.tradeRun && (
                            <div className="text-[10px] font-bold text-slate-400">
                              {trade.tradeRun}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Execution Details Grid */}
                      <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-xl border border-slate-200/70 bg-white p-2 text-center text-[10px] font-mono dark:border-slate-800 dark:bg-slate-900/60">
                        <div>
                          <div className="text-slate-400 text-[9px] uppercase">Entry</div>
                          <div className="font-bold text-slate-700 dark:text-slate-300 truncate">
                            {trade.entryPrice != null ? trade.entryPrice : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[9px] uppercase">Exit</div>
                          <div className="font-bold text-slate-700 dark:text-slate-300 truncate">
                            {trade.exitPrice != null ? trade.exitPrice : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[9px] uppercase">Stop Loss</div>
                          <div className="font-bold text-rose-500 truncate">
                            {trade.stopLoss != null ? trade.stopLoss : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[9px] uppercase">Target</div>
                          <div className="font-bold text-emerald-500 truncate">
                            {trade.takeProfit != null ? trade.takeProfit : "—"}
                          </div>
                        </div>
                      </div>

                      {/* Discipline and Rank Badges */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            trade.followedRules === "Yes"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {trade.followedRules === "Yes"
                            ? isBn ? "নিয়ম মানা হয়েছে" : "Followed Rules"
                            : isBn ? "নিয়ম ভাঙা হয়েছে" : "Rules Broken"}
                        </span>

                        <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-black text-cyan-500 font-mono">
                          Rank: {trade.tradeRank}
                        </span>

                        {trade.riskReward && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            R:R {trade.riskReward}
                          </span>
                        )}

                        {hasMedia && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                            <ImageIcon className="h-3 w-3" />
                            {trade.screenshots?.length
                              ? `${trade.screenshots.length} Screens`
                              : "Media"}
                          </span>
                        )}
                      </div>

                      {/* Trade Notes / Thesis */}
                      {trade.note && (
                        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {trade.note}
                        </p>
                      )}

                      {/* Lessons / Learning */}
                      {trade.learning && (
                        <div className="mt-2 rounded-lg bg-cyan-500/5 border border-cyan-500/15 p-2 text-[11px] text-cyan-600 dark:text-cyan-400">
                          <span className="font-bold">Key Takeaway: </span>
                          <span>{trade.learning}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewTrade(trade)}
                        className="h-7 text-xs font-bold gap-1 text-cyan-500 hover:bg-cyan-500/10 px-2.5 rounded-lg"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isBn ? "বিস্তারিত দেখুন" : "View Audit"}</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {onPrintTrade && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPrintTrade(trade)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
                            title={isBn ? "প্রিন্ট বা PDF" : "Print or PDF"}
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditTrade(trade)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-cyan-500 rounded-lg"
                          title={isBn ? "সম্পাদনা করুন" : "Edit Trade"}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteTrade(trade.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500 rounded-lg"
                          title={isBn ? "মুছে ফেলুন" : "Delete Trade"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
