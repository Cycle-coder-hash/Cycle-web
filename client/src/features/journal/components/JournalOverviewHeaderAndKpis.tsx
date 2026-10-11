import React from "react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  DollarSign,
  Edit,
  Flame,
  Layers,
  Percent,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalBook, JournalStats } from "@/types/journal";

export interface BookComparisonItem {
  book: JournalBook;
  tradesCount: number;
  stats: JournalStats;
}

export interface JournalOverviewHeaderAndKpisProps {
  isBn: boolean;
  totalTradesCount: number;
  books: JournalBook[];
  bookComparisonItems: BookComparisonItem[];
  selectedBookId: string;
  currentBook: JournalBook | null;
  currencySymbol: string;
  stats: JournalStats;
  journalViewMode: "table" | "calendar";
  onSelectBook: (bookId: string) => void;
  onOpenNewBook: () => void;
  onOpenNewTrade: () => void;
  onToggleViewMode: () => void;
  onEditBook: (book: JournalBook) => void;
  onRequestDeleteBook: (bookId: string) => void;
}

export function JournalOverviewHeaderAndKpis({
  isBn,
  totalTradesCount,
  books,
  bookComparisonItems,
  selectedBookId,
  currentBook,
  currencySymbol,
  stats,
  journalViewMode,
  onSelectBook,
  onOpenNewBook,
  onOpenNewTrade,
  onToggleViewMode,
  onEditBook,
  onRequestDeleteBook,
}: JournalOverviewHeaderAndKpisProps) {
  return (
    <>
      {/* Top Section Badge: Trade Journal & Performance */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 w-fit">
        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white">
          <BarChart3 className="h-4 w-4 text-cyan-500" />
          <span>{isBn ? "ট্রেড জার্নাল ও পারফরম্যান্স" : "Trade Journal & Performance"}</span>
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400">
            {totalTradesCount}
          </span>
        </div>
      </div>

      {/* Top Header & Strategy Book Switcher */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {isBn ? "প্রো ট্রেডার পারফরম্যান্স জার্নাল" : "Institutional Trader Journal & Performance"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? "মাল্টি-স্ট্র্যাটেজি বুক, স্বয়ংক্রিয় ক্যাপিটাল গ্রোথ ট্র্যাকিং এবং ২১-পয়েন্ট ট্রেড অডিট"
                  : "Multi-book strategy logs, automated equity curves, and complete 21-point execution audit"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={onOpenNewBook}
            variant="outline"
            className="rounded-2xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 text-xs font-bold gap-1.5 shadow-xs hover:border-cyan-500 hover:text-cyan-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {isBn ? "নতুন জার্নাল বুক" : "New Journal Book"}
          </Button>

          {books.length > 0 && (
            <Button
              onClick={onOpenNewTrade}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 text-xs font-black gap-2 shadow-lg shadow-cyan-500/25 px-4 py-2"
            >
              <Plus className="h-4 w-4" />
              {isBn ? "+ নতুন ট্রেড এন্ট্রি (২১ ফিল্ড)" : "+ Log New Trade"}
            </Button>
          )}
        </div>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200/80 bg-white/40 p-12 text-center dark:border-slate-800/80 dark:bg-slate-900/30 min-h-[460px] shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-500 mb-4 shadow-lg shadow-cyan-500/10">
            <BookOpen className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {isBn ? "এখনো কোনো জার্নাল বুক নেই" : "No Journal Books Yet"}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-6 leading-relaxed">
            {isBn
              ? "আপনার ট্রেড ট্র্যাক ও পারফরম্যান্স বিশ্লেষণ করতে প্রথম জার্নাল বুক তৈরি করুন।"
              : "Create your first journal book to start tracking your trades."}
          </p>
          <Button
            onClick={onOpenNewBook}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 text-xs font-black gap-2 shadow-lg shadow-cyan-500/25 px-6 py-3"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? "+ প্রথম জার্নাল বুক তৈরি করুন" : "+ Create First Journal Book"}</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Journal Books Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {/* All / Combined Option */}
            <button
              onClick={() => onSelectBook("all")}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                selectedBookId === "all"
                  ? "border-cyan-500/50 bg-[#081833] text-white shadow-md shadow-cyan-500/10 dark:bg-cyan-500 dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>{isBn ? "সম্মিলিত পোর্টফোলিও (সকল বুক)" : "Combined Portfolio (All Books)"}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">
                {totalTradesCount}
              </span>
            </button>

            {/* Individual Books */}
            {bookComparisonItems.map(({ book, tradesCount }) => {
              const isSelected = selectedBookId === book.id;
              return (
                <div key={book.id} className="relative flex shrink-0 items-center">
                  <button
                    onClick={() => onSelectBook(book.id)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                      isSelected
                        ? "border-cyan-500/50 bg-[#081833] text-white shadow-md shadow-cyan-500/10 dark:bg-cyan-500 dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    }`}
                  >
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                    <div className="text-left">
                      <div className="font-extrabold">{book.name}</div>
                      <div className="text-[10px] opacity-75 font-mono">
                        {book.currency || "$"}{book.startingBalance.toLocaleString()} Start
                      </div>
                    </div>
                    <span className="ml-1 rounded-full bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-black">
                      {tradesCount}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Book Details / Controls (if specific book selected) */}
          {currentBook && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {currentBook.name}
                    </span>
                    {currentBook.strategy && (
                      <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500">
                        {currentBook.strategy}
                      </span>
                    )}
                  </div>
                  {currentBook.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {currentBook.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onToggleViewMode}
                  className={`h-8 rounded-xl text-xs font-bold gap-1.5 transition-all ${
                    journalViewMode === "calendar"
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"
                      : "border-slate-300 dark:border-slate-700 hover:border-cyan-500 hover:text-cyan-500"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                  {journalViewMode === "calendar"
                    ? (isBn ? "ট্রেড টেবিল দেখুন" : "View Table")
                    : (isBn ? "ক্যালেন্ডার ভিউ" : "Calendar View")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditBook(currentBook)}
                  className="h-8 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  {isBn ? "বুক সম্পাদনা" : "Edit Book"}
                </Button>
                {books.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRequestDeleteBook(currentBook.id)}
                    className="h-8 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-bold gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isBn ? "মুছে ফেলুন" : "Delete Book"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* TOP KPI CARDS GRID */}
          <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Starting & Current Balance */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                  {isBn ? "ব্যালেন্স প্রবৃদ্ধি" : "Account Capital"}
                </span>
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-500" />
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {currencySymbol}{stats.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>{isBn ? "প্রারম্ভিক:" : "Initial:"}</span>
                  <span className="font-mono">{currencySymbol}{stats.startingBalance.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-xs font-bold">
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] sm:text-[11px] font-black ${
                    stats.growthPercent >= 0
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {stats.growthPercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stats.growthPercent >= 0 ? `+${stats.growthPercent}%` : `${stats.growthPercent}%`}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400">Net Growth</span>
              </div>
            </div>

            {/* Card 2: Total P&L */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                  {isBn ? "মোট নিট লাভ / ক্ষতি" : "Total Net P&L"}
                </span>
                <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
              </div>
              <div className="mt-2 sm:mt-3">
                <div
                  className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${
                    stats.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {stats.totalPnl >= 0 ? `+${currencySymbol}${stats.totalPnl.toFixed(2)}` : `-${currencySymbol}${Math.abs(stats.totalPnl).toFixed(2)}`}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs font-bold">
                  <span className="text-emerald-500">+{currencySymbol}{stats.totalProfit.toFixed(2)}</span>
                  <span className="text-rose-500">-{currencySymbol}{stats.totalLoss.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 text-[10px] sm:text-[11px] font-medium text-slate-400">
                <span>Avg Win: {currencySymbol}{stats.averageWin.toFixed(1)}</span>
                <span>Avg Loss: {currencySymbol}{stats.averageLoss.toFixed(1)}</span>
              </div>
            </div>

            {/* Card 3: Win Rate & Profit Factor */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                  {isBn ? "উইনরেট ও ফ্যাক্টর" : "Win Rate & Factor"}
                </span>
                <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {stats.winRate}%
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                  PF: {stats.profitFactor}
                </span>
              </div>
              <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] font-bold">
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-emerald-500 font-mono">
                  {stats.winningTrades}W
                </span>
                <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-rose-500 font-mono">
                  {stats.losingTrades}L
                </span>
                {stats.breakevenTrades > 0 && (
                  <span className="rounded-md bg-slate-500/10 px-1.5 py-0.5 text-slate-400 font-mono">
                    {stats.breakevenTrades}BE
                  </span>
                )}
                <span className="text-slate-400 ml-auto hidden sm:inline">{stats.totalTrades} Trades</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${stats.winRate}%` }}
                />
              </div>
            </div>

            {/* Card 4: Strategy Discipline Adherence */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                  {isBn ? "রুলস ডিসিপ্লিন" : "Rule Discipline"}
                </span>
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {stats.ruleComplianceRate}%
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400">
                  {isBn ? "অনুমোদন" : "Adherence"}
                </span>
              </div>
              <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {stats.totalTrades > 0
                  ? `${Math.round((stats.ruleComplianceRate / 100) * stats.totalTrades)} of ${stats.totalTrades} obeyed rules`
                  : "Log trades with verification"}
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${stats.ruleComplianceRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* STRATEGY RULES OR STRATEGY BREAKDOWN */}
          {currentBook ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-cyan-500" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isBn ? `"${currentBook.name}" এর ট্রেডিং রুলস` : `Strategy Rules & Discipline — ${currentBook.name}`}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isBn
                        ? "ট্রেড নেওয়ার পূর্বে এই শর্তগুলো পূরণ হয়েছে কি না তা কঠোরভাবে যাচাই করুন।"
                        : "Strict execution checklist. Before clicking execute, ensure all rules align."}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditBook(currentBook)}
                  className="h-8 rounded-xl border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 text-xs font-bold gap-1 self-start sm:self-center"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {isBn ? "রুলস পরিবর্তন করুন" : "Manage Rules"}
                </Button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {currentBook.rules?.length ? (
                  currentBook.rules.map((rule, idx) => (
                    <div
                      key={rule.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-black text-cyan-500">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {rule.text}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-4 text-center text-xs text-slate-400">
                    {isBn ? "এই বুকে এখনো কোনো রুল সেট করা হয়নি।" : "No strategy rules configured for this journal book yet."}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* All Books Comparison View */
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Layers className="h-5 w-5 text-cyan-500" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isBn ? "স্ট্র্যাটেজি-ভিত্তিক পারফরম্যান্স তুলনা" : "Strategy Comparison Matrix"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isBn ? "প্রতিটি স্বাধীন জার্নাল বুকের তুলনামূলক ফলাফল" : "Cross-journal analysis to identify your highest-edge model"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800 font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4">Strategy Journal</th>
                      <th className="pb-3 px-3">Start Capital</th>
                      <th className="pb-3 px-3">Current Capital</th>
                      <th className="pb-3 px-3">Net P&L</th>
                      <th className="pb-3 px-3">Growth %</th>
                      <th className="pb-3 px-3">Trades</th>
                      <th className="pb-3 px-3">Win Rate</th>
                      <th className="pb-3 px-3">Profit Factor</th>
                      <th className="pb-3 pl-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    {bookComparisonItems.map(({ book: b, stats: bStats }) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{b.name}</div>
                          <div className="text-[11px] text-slate-400">{b.strategy || "Custom Model"}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono">{b.currency || "$"}{b.startingBalance.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {b.currency || "$"}{bStats.currentBalance.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold">
                          <span className={bStats.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {bStats.totalPnl >= 0 ? `+${b.currency || "$"}${bStats.totalPnl.toFixed(2)}` : `-${b.currency || "$"}${Math.abs(bStats.totalPnl).toFixed(2)}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                            bStats.growthPercent >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          }`}>
                            {bStats.growthPercent >= 0 ? `+${bStats.growthPercent}%` : `${bStats.growthPercent}%`}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono">{bStats.totalTrades}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{bStats.winRate}%</td>
                        <td className="py-3.5 px-3 font-mono">{bStats.profitFactor}</td>
                        <td className="py-3.5 pl-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onSelectBook(b.id)}
                            className="h-7 px-2.5 text-xs font-bold text-cyan-500 hover:bg-cyan-500/10 rounded-lg"
                          >
                            View Book →
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
