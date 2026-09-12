import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Printer,
  Eye,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  ShieldCheck,
  Flame,
  BarChart3,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Layers,
  ChevronDown,
  X,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { JournalBook, TradeEntry, JournalStats, GrowthDataPoint, PeriodPnl } from "@/types/journal";
import {
  getStoredJournalBooks,
  getStoredTrades,
  saveJournalBooks,
  saveTrades,
  addTrade,
  updateTrade,
  deleteTrade,
  createJournalBook,
  updateJournalBook,
  deleteJournalBook,
  getNextTradeNumber,
} from "@/lib/traderJournalStorage";
import {
  computeJournalStats,
  generateGrowthProgression,
  aggregatePeriodPnl,
} from "@/lib/journalCalculations";
import { TradeModal } from "./TradeModal";
import { TradePrintModal } from "./TradePrintModal";
import { JournalBookModal } from "./JournalBookModal";

interface TraderJournalProps {
  isBn?: boolean;
  user?: any;
}

export function TraderJournal({ isBn = false, user }: TraderJournalProps) {
  // State: Journal Books & Trades
  const [books, setBooks] = useState<JournalBook[]>(() => getStoredJournalBooks());
  const [trades, setTrades] = useState<TradeEntry[]>(() => getStoredTrades());

  // Selected Journal Book ID: "all" or specific book ID
  const [selectedBookId, setSelectedBookId] = useState<string>("all");

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState<"all" | "win" | "loss" | "be">("all");
  const [rankFilter, setRankFilter] = useState<"all" | "A+" | "A" | "A-">("all");
  const [ruleFilter, setRuleFilter] = useState<"all" | "followed" | "broken">("all");
  const [pairFilter, setPairFilter] = useState<string>("all");

  // Chart Mode
  const [chartMode, setChartMode] = useState<"balance" | "growth" | "period">("balance");
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly">("daily");

  // Modals state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<TradeEntry | null>(null);
  const [viewingTrade, setViewingTrade] = useState<TradeEntry | null>(null);
  const [printingTrade, setPrintingTrade] = useState<TradeEntry | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<JournalBook | null>(null);
  const [deleteBookConfirmId, setDeleteBookConfirmId] = useState<string | null>(null);
  const [deleteTradeConfirmId, setDeleteTradeConfirmId] = useState<string | null>(null);

  // Synchronize state on custom events
  useEffect(() => {
    const handleStorageUpdate = () => {
      setBooks(getStoredJournalBooks());
      setTrades(getStoredTrades());
    };
    window.addEventListener("cycle_journal_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("cycle_journal_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Currently active book
  const currentBook = useMemo(() => {
    if (selectedBookId === "all") return null;
    return books.find((b) => b.id === selectedBookId) || null;
  }, [books, selectedBookId]);

  // Trades belonging to selected book (or all)
  const bookTrades = useMemo(() => {
    if (selectedBookId === "all") return trades;
    return trades.filter((t) => t.journalBookId === selectedBookId);
  }, [trades, selectedBookId]);

  // Currency symbol
  const currencySymbol = currentBook?.currency || "$";

  // Calculate Starting Balance
  const effectiveStartingBalance = useMemo(() => {
    if (selectedBookId === "all") {
      return books.reduce((acc, b) => acc + (b.startingBalance || 0), 0);
    }
    return currentBook?.startingBalance || 10000;
  }, [books, currentBook, selectedBookId]);

  // Overall or Book Statistics
  const stats: JournalStats = useMemo(() => {
    return computeJournalStats(effectiveStartingBalance, bookTrades);
  }, [effectiveStartingBalance, bookTrades]);

  // Growth progression points for charts
  const growthPoints: GrowthDataPoint[] = useMemo(() => {
    return generateGrowthProgression(effectiveStartingBalance, bookTrades);
  }, [effectiveStartingBalance, bookTrades]);

  // Period PnL breakdown
  const periodPnlList: PeriodPnl[] = useMemo(() => {
    return aggregatePeriodPnl(bookTrades, periodType);
  }, [bookTrades, periodType]);

  // Available unique pairs for filter dropdown
  const uniquePairs = useMemo(() => {
    const set = new Set<string>();
    bookTrades.forEach((t) => {
      if (t.pair) set.add(t.pair);
    });
    return Array.from(set).sort();
  }, [bookTrades]);

  // Filtered trade list for table
  const filteredTrades = useMemo(() => {
    return bookTrades.filter((t) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesPair = t.pair.toLowerCase().includes(q);
        const matchesNote = t.note?.toLowerCase().includes(q);
        const matchesLearning = t.learning?.toLowerCase().includes(q);
        const matchesDirection = t.direction.toLowerCase().includes(q);
        const matchesCustom = t.customProperties?.some(
          (cp) => cp.name.toLowerCase().includes(q) || cp.value.toLowerCase().includes(q)
        );
        if (!matchesPair && !matchesNote && !matchesLearning && !matchesDirection && !matchesCustom) {
          return false;
        }
      }

      // Result
      if (resultFilter === "win" && t.pnl <= 0.001) return false;
      if (resultFilter === "loss" && t.pnl >= -0.001) return false;
      if (resultFilter === "be" && (t.pnl > 0.001 || t.pnl < -0.001)) return false;

      // Rank
      if (rankFilter !== "all" && t.tradeRank !== rankFilter) return false;

      // Rule compliance
      if (ruleFilter === "followed" && t.followedRules !== "Yes") return false;
      if (ruleFilter === "broken" && t.followedRules !== "No") return false;

      // Pair
      if (pairFilter !== "all" && t.pair !== pairFilter) return false;

      return true;
    });
  }, [bookTrades, searchTerm, resultFilter, rankFilter, ruleFilter, pairFilter]);

  // Next trade number for modal
  const nextNum = useMemo(() => {
    const targetBookId = selectedBookId === "all" ? (books[0]?.id || "book_default") : selectedBookId;
    return getNextTradeNumber(targetBookId);
  }, [books, selectedBookId]);

  // Handlers for Books
  const handleCreateBook = (bookData: Omit<JournalBook, "id" | "createdAt">) => {
    const created = createJournalBook(bookData);
    setBooks(getStoredJournalBooks());
    setSelectedBookId(created.id);
  };

  const handleUpdateBook = (book: JournalBook) => {
    updateJournalBook(book);
    setBooks(getStoredJournalBooks());
  };

  const handleDeleteBook = (bookId: string) => {
    if (books.length <= 1) {
      alert(isBn ? "অন্তত একটি জার্নাল বুক থাকতে হবে।" : "You must keep at least one Journal Book.");
      return;
    }
    deleteJournalBook(bookId);
    const remaining = getStoredJournalBooks();
    setBooks(remaining);
    setTrades(getStoredTrades());
    setSelectedBookId(remaining[0]?.id || "all");
    setDeleteBookConfirmId(null);
  };

  // Handlers for Trades
  const handleSaveTrade = (tradeData: Omit<TradeEntry, "id" | "tradeNumber" | "createdAt">) => {
    addTrade(tradeData);
    setTrades(getStoredTrades());
    setIsTradeModalOpen(false);
  };

  const handleUpdateTrade = (trade: TradeEntry) => {
    updateTrade(trade);
    setTrades(getStoredTrades());
    setIsTradeModalOpen(false);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (tradeId: string) => {
    deleteTrade(tradeId);
    setTrades(getStoredTrades());
    setDeleteTradeConfirmId(null);
    if (viewingTrade?.id === tradeId) setViewingTrade(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
            onClick={() => {
              setEditingBook(null);
              setIsBookModalOpen(true);
            }}
            variant="outline"
            className="rounded-2xl border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 text-xs font-bold gap-1.5 shadow-xs hover:border-cyan-500 hover:text-cyan-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {isBn ? "নতুন জার্নাল বুক" : "New Journal Book"}
          </Button>

          <Button
            onClick={() => {
              setEditingTrade(null);
              setIsTradeModalOpen(true);
            }}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 text-xs font-black gap-2 shadow-lg shadow-cyan-500/25 px-4 py-2"
          >
            <Plus className="h-4 w-4" />
            {isBn ? "+ নতুন ট্রেড এন্ট্রি (২১ ফিল্ড)" : "+ Log New Trade"}
          </Button>
        </div>
      </div>

      {/* Journal Books Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {/* All / Combined Option */}
        <button
          onClick={() => setSelectedBookId("all")}
          className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            selectedBookId === "all"
              ? "border-cyan-500/50 bg-[#081833] text-white shadow-md shadow-cyan-500/10 dark:bg-cyan-500 dark:text-slate-950"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>{isBn ? "সম্মিলিত পোর্টফোলিও (সকল বুক)" : "Combined Portfolio (All Books)"}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">
            {trades.length}
          </span>
        </button>

        {/* Individual Books */}
        {books.map((book) => {
          const isSelected = selectedBookId === book.id;
          const bookTradesCount = trades.filter((t) => t.journalBookId === book.id).length;
          return (
            <div key={book.id} className="relative flex shrink-0 items-center">
              <button
                onClick={() => setSelectedBookId(book.id)}
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
                  {bookTradesCount}
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
              onClick={() => {
                setEditingBook(currentBook);
                setIsBookModalOpen(true);
              }}
              className="h-8 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1"
            >
              <Edit className="h-3.5 w-3.5" />
              {isBn ? "বুক সম্পাদনা" : "Edit Book"}
            </Button>
            {books.length > 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteBookConfirmId(currentBook.id)}
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
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Starting & Current Balance */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {isBn ? "ব্যালেন্স প্রবৃদ্ধি" : "Account Capital"}
            </span>
            <DollarSign className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {currencySymbol}{stats.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{isBn ? "প্রারম্ভিক:" : "Initial:"}</span>
              <span className="font-mono">{currencySymbol}{stats.startingBalance.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold">
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-black ${
                stats.growthPercent >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {stats.growthPercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {stats.growthPercent >= 0 ? `+${stats.growthPercent}%` : `${stats.growthPercent}%`}
            </span>
            <span className="text-[11px] text-slate-400">Net Growth</span>
          </div>
        </div>

        {/* Card 2: Total P&L */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {isBn ? "মোট নিট লাভ / ক্ষতি" : "Total Net P&L"}
            </span>
            <Percent className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                stats.totalPnl >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {stats.totalPnl >= 0 ? `+${currencySymbol}${stats.totalPnl.toFixed(2)}` : `-${currencySymbol}${Math.abs(stats.totalPnl).toFixed(2)}`}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs font-bold">
              <span className="text-emerald-500">+{currencySymbol}{stats.totalProfit.toFixed(2)}</span>
              <span className="text-rose-500">-{currencySymbol}{stats.totalLoss.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Avg Win: {currencySymbol}{stats.averageWin.toFixed(1)}</span>
            <span>Avg Loss: {currencySymbol}{stats.averageLoss.toFixed(1)}</span>
          </div>
        </div>

        {/* Card 3: Win Rate & Profit Factor */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {isBn ? "উইনরেট ও ফ্যাক্টর" : "Win Rate & Factor"}
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {stats.winRate}%
            </div>
            <span className="text-xs font-bold text-slate-500">
              PF: {stats.profitFactor}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold">
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
            <span className="text-slate-400 ml-auto">{stats.totalTrades} Trades</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${stats.winRate}%` }}
            />
          </div>
        </div>

        {/* Card 4: Strategy Discipline Adherence */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {isBn ? "রুলস ডিসিপ্লিন স্কোর" : "Rule Discipline"}
            </span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {stats.ruleComplianceRate}%
            </div>
            <span className="text-xs font-bold text-slate-400">
              {isBn ? "অনুমোদন" : "Adherence"}
            </span>
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {stats.totalTrades > 0
              ? `${Math.round((stats.ruleComplianceRate / 100) * stats.totalTrades)} of ${stats.totalTrades} setups strictly obeyed strategy rules`
              : "Log trades with discipline verification"}
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
              onClick={() => {
                setEditingBook(currentBook);
                setIsBookModalOpen(true);
              }}
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
                {books.map((b) => {
                  const bTrades = trades.filter((t) => t.journalBookId === b.id);
                  const bStats = computeJournalStats(b.startingBalance, bTrades);
                  return (
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
                          onClick={() => setSelectedBookId(b.id)}
                          className="h-7 px-2.5 text-xs font-bold text-cyan-500 hover:bg-cyan-500/10 rounded-lg"
                        >
                          View Book →
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHARTS SECTION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isBn ? "পারফরম্যান্স ও গ্রোথ কার্ভ" : "Performance Analytics & Growth Curve"}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn ? "ক্যাপিটাল প্রবৃদ্ধি, ইকুইটি শতকরা রিটার্ন এবং পর্যায়ভিত্তিক P&L" : "Real-time balance trajectory & periodic returns"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Mode Tabs */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950">
              <button
                onClick={() => setChartMode("balance")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  chartMode === "balance"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Balance Curve
              </button>
              <button
                onClick={() => setChartMode("growth")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  chartMode === "growth"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Growth %
              </button>
              <button
                onClick={() => setChartMode("period")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  chartMode === "period"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Period P&L
              </button>
            </div>

            {/* Period sub-tabs */}
            {chartMode === "period" && (
              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950">
                {(["daily", "weekly", "monthly"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodType(p)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-colors ${
                      periodType === p
                        ? "bg-cyan-500 text-slate-950 shadow-xs"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart Render Area */}
        <div className="mt-6 h-72 w-full">
          {growthPoints.length <= 1 && chartMode !== "period" ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <BarChart3 className="h-10 w-10 opacity-30 mb-2" />
              <p className="text-xs font-semibold">
                {isBn ? "গ্রোথ কার্ভ দেখার জন্য অন্তত একটি ট্রেড এন্ট্রি যোগ করুন।" : "Log trades above to begin generating your equity progression curve."}
              </p>
            </div>
          ) : chartMode === "balance" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="tradeNumber"
                  tickFormatter={(val) => (val === 0 ? "Start" : `#${val}`)}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as GrowthDataPoint;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 text-xs">
                        <div className="font-bold text-slate-400">
                          {data.tradeNumber === 0 ? "Initial Deposit" : `Trade #${data.tradeNumber} (${data.pair})`}
                        </div>
                        <div className="mt-1 text-base font-black text-cyan-500">
                          {currencySymbol}{data.balance.toLocaleString()}
                        </div>
                        {data.tradeNumber > 0 && (
                          <div className="mt-1 flex items-center gap-2 text-[11px] font-bold">
                            <span className={data.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}>
                              {data.pnl >= 0 ? `+${currencySymbol}${data.pnl}` : `-${currencySymbol}${Math.abs(data.pnl)}`}
                            </span>
                            <span className="text-slate-400">({data.equityGrowth >= 0 ? `+${data.equityGrowth}%` : `${data.equityGrowth}%`})</span>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={effectiveStartingBalance} stroke="#64748b" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : chartMode === "growth" ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis
                  dataKey="tradeNumber"
                  tickFormatter={(val) => (val === 0 ? "Start" : `#${val}`)}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `${val}%`}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as GrowthDataPoint;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 text-xs">
                        <div className="font-bold text-slate-400">
                          {data.tradeNumber === 0 ? "Baseline" : `Trade #${data.tradeNumber}`}
                        </div>
                        <div className="mt-1 text-base font-black text-emerald-400">
                          {data.equityGrowth >= 0 ? `+${data.equityGrowth}%` : `${data.equityGrowth}%`}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Balance: {currencySymbol}{data.balance.toLocaleString()}
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="equityGrowth"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            /* Period PnL Bar Chart */
            periodPnlList.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <p className="text-xs font-semibold">No period data recorded yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodPnlList} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    tickFormatter={(val) => `${currencySymbol}${val}`}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload as PeriodPnl;
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 text-xs">
                          <div className="font-bold text-slate-400 uppercase">{data.period}</div>
                          <div className={`mt-1 text-base font-black ${data.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            {data.pnl >= 0 ? `+${currencySymbol}${data.pnl}` : `-${currencySymbol}${Math.abs(data.pnl)}`}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-slate-400">
                            {data.trades} Trades ({data.wins}W / {data.losses}L)
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {periodPnlList.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          )}
        </div>
      </div>

      {/* TRADE HISTORY AUDIT TABLE & FILTERS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isBn ? "ট্রেড হিস্ট্রি ও বিশদ অডিট টেবিল" : "Trade Execution History & Audit Log"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn
                  ? `মোট ${filteredTrades.length} টি ট্রেড পাওয়া গেছে (সম্পূর্ণ ২১টি ফিল্ড সংরক্ষিত)`
                  : `Showing ${filteredTrades.length} verified trade records with full 21-point parameter tracking`}
              </p>
            </div>

            <Button
              onClick={() => {
                setEditingTrade(null);
                setIsTradeModalOpen(true);
              }}
              size="sm"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-xs gap-1.5 self-start sm:self-center"
            >
              <Plus className="h-3.5 w-3.5" />
              {isBn ? "ট্রেড লগ করুন" : "Log Trade"}
            </Button>
          </div>

          {/* Search and Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={isBn ? "পেয়ার, নোট বা লার্নিং লিখে সার্চ করুন..." : "Search pair, notes, tags, direction..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Outcome Filter */}
            <div>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">All Outcomes</option>
                <option value="win">Wins Only (লাভ)</option>
                <option value="loss">Losses Only (লস)</option>
                <option value="be">Breakeven Only</option>
              </select>
            </div>

            {/* Rank Filter */}
            <div>
              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">All Ranks (A+, A, A-)</option>
                <option value="A+">A+ Setups Only</option>
                <option value="A">A Setups Only</option>
                <option value="A-">A- Setups Only</option>
              </select>
            </div>

            {/* Rule Filter */}
            <div>
              <select
                value={ruleFilter}
                onChange={(e) => setRuleFilter(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">All Discipline States</option>
                <option value="followed">Rules Followed (100%)</option>
                <option value="broken">Rules Broken (Discipline Leak)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          {filteredTrades.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BookOpen className="mx-auto h-10 w-10 opacity-30 mb-2" />
              <p className="text-sm font-bold text-slate-500">
                {isBn ? "কোনো ট্রেড পাওয়া যায়নি।" : "No trades found matching active filters."}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isBn ? "ফিল্টার পরিবর্তন করুন অথবা একটি নতুন ট্রেড লগ করুন।" : "Adjust your search parameters or log a new trade above."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-2">#</th>
                  <th className="pb-3 px-2">Date & Time</th>
                  <th className="pb-3 px-2">Pair / TF</th>
                  <th className="pb-3 px-2">Direction</th>
                  <th className="pb-3 px-2">Entry → Exit</th>
                  <th className="pb-3 px-2">Lots</th>
                  <th className="pb-3 px-2">Pips</th>
                  <th className="pb-3 px-2">R:R / Run</th>
                  <th className="pb-3 px-2">Rules?</th>
                  <th className="pb-3 px-2">Rank</th>
                  <th className="pb-3 px-2">Media</th>
                  <th className="pb-3 px-2 text-right">P&L ($)</th>
                  <th className="pb-3 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredTrades.map((t) => {
                  const isWin = t.pnl > 0.001;
                  const isLoss = t.pnl < -0.001;
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => setViewingTrade(t)}
                    >
                      {/* 1. Trade # */}
                      <td className="py-3.5 pr-2 font-mono font-black text-cyan-500">
                        #{t.tradeNumber}
                      </td>

                      {/* 2 & 4. Date & Time */}
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-900 dark:text-white">{t.date}</div>
                        <div className="text-[10px] font-mono text-slate-400">{t.entryTime}</div>
                      </td>

                      {/* 3 & 5. Pair & Timeframe */}
                      <td className="py-3.5 px-2">
                        <div className="font-extrabold text-slate-900 dark:text-white">{t.pair}</div>
                        <div className="inline-block rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {t.timeframe}
                        </div>
                      </td>

                      {/* 6. Buy / Sell */}
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                            t.direction === "Buy"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-rose-500/10 text-rose-500"
                          }`}
                        >
                          {t.direction === "Buy" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {t.direction}
                        </span>
                      </td>

                      {/* 7 & 10. Entry & Exit */}
                      <td className="py-3.5 px-2 font-mono text-[11px]">
                        <div>{t.entryPrice}</div>
                        <div className="text-slate-400">→ {t.exitPrice}</div>
                      </td>

                      {/* 15. Lot Size */}
                      <td className="py-3.5 px-2 font-mono">{t.lotSize}</td>

                      {/* 14. Pips */}
                      <td className="py-3.5 px-2 font-mono font-bold">
                        <span className={t.pips >= 0 ? "text-emerald-500" : "text-rose-500"}>
                          {t.pips >= 0 ? `+${t.pips}` : t.pips}
                        </span>
                      </td>

                      {/* 13 & 16. R:R & Run */}
                      <td className="py-3.5 px-2">
                        <div className="font-mono font-bold">{t.riskReward || "1:2"}</div>
                        {t.tradeRun && (
                          <div className="text-[10px] text-slate-400">{t.tradeRun}</div>
                        )}
                      </td>

                      {/* 11. Followed Rules */}
                      <td className="py-3.5 px-2">
                        {t.followedRules === "Yes" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                            <AlertCircle className="h-3 w-3" /> No
                          </span>
                        )}
                      </td>

                      {/* 18. Rank */}
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black ${
                            t.tradeRank === "A+"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : t.tradeRank === "A"
                              ? "bg-cyan-500/10 text-cyan-500"
                              : "bg-slate-500/10 text-slate-400"
                          }`}
                        >
                          {t.tradeRank}
                        </span>
                      </td>

                      {/* 19. Media indicator */}
                      <td className="py-3.5 px-2">
                        {t.mediaUrl ? (
                          t.mediaType === "video" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400">
                              <VideoIcon className="h-3.5 w-3.5" />
                              {t.videoDurationSeconds ? `${t.videoDurationSeconds}s` : "Video"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                              <ImageIcon className="h-3.5 w-3.5" /> Image
                            </span>
                          )
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700">—</span>
                        )}
                      </td>

                      {/* 12. P&L ($) */}
                      <td className="py-3.5 px-2 text-right font-mono font-black text-sm">
                        <span
                          className={
                            isWin
                              ? "text-emerald-500"
                              : isLoss
                              ? "text-rose-500"
                              : "text-slate-400"
                          }
                        >
                          {isWin ? `+$${t.pnl.toFixed(2)}` : isLoss ? `-$${Math.abs(t.pnl).toFixed(2)}` : `$0.00`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 pl-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <button
                            onClick={() => setViewingTrade(t)}
                            title="View trade audit"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Print / PDF */}
                          <button
                            onClick={() => setPrintingTrade(t)}
                            title="Print / Save PDF"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingTrade(t);
                              setIsTradeModalOpen(true);
                            }}
                            title="Edit trade"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-500 dark:hover:bg-slate-800 dark:hover:text-cyan-400 transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTradeConfirmId(t.id)}
                            title="Delete trade"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DETAILED TRADE AUDIT VIEW MODAL (ALL 21 FIELDS) */}
      {viewingTrade && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setViewingTrade(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-auto text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 font-mono text-base font-black text-cyan-500">
                  #{viewingTrade.tradeNumber}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight">
                      {viewingTrade.pair} • {viewingTrade.direction}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-black uppercase ${
                        viewingTrade.pnl > 0.001
                          ? "bg-emerald-500/10 text-emerald-500"
                          : viewingTrade.pnl < -0.001
                          ? "bg-rose-500/10 text-rose-500"
                          : "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {viewingTrade.pnl > 0.001
                        ? `+$${viewingTrade.pnl.toFixed(2)}`
                        : viewingTrade.pnl < -0.001
                        ? `-$${Math.abs(viewingTrade.pnl).toFixed(2)}`
                        : "$0.00"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {viewingTrade.date} at {viewingTrade.entryTime} • Timeframe: {viewingTrade.timeframe}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPrintingTrade(viewingTrade);
                  }}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / PDF
                </Button>
                <button
                  onClick={() => setViewingTrade(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 21 Fields Structured View */}
            <div className="mt-6 space-y-5 text-xs">
              {/* Numeric Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entry Price</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.entryPrice}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stop Loss</div>
                  <div className="mt-1 font-mono text-sm font-black text-rose-500">{viewingTrade.stopLoss}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Take Profit</div>
                  <div className="mt-1 font-mono text-sm font-black text-emerald-500">{viewingTrade.takeProfit}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exit Price</div>
                  <div className="mt-1 font-mono text-sm font-black text-cyan-500">{viewingTrade.exitPrice}</div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pips</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.pips} pips</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk : Reward</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.riskReward}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lot Size</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.lotSize}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trade Run</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.tradeRun || "—"}</div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 dark:border-slate-800">
                  <span className="text-slate-400 font-bold">Followed All Rules:</span>
                  <span
                    className={`font-black ${
                      viewingTrade.followedRules === "Yes" ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {viewingTrade.followedRules}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 dark:border-slate-800">
                  <span className="text-slate-400 font-bold">Trade Rank:</span>
                  <span className="font-black text-amber-400">{viewingTrade.tradeRank}</span>
                </div>
              </div>

              {/* Note */}
              {viewingTrade.note && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Trade Setup Note & Context
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                    {viewingTrade.note}
                  </p>
                </div>
              )}

              {/* Learning / Reflection */}
              {viewingTrade.learning && (
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 mb-1.5">
                    Update / Key Learning & Psychology
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                    {viewingTrade.learning}
                  </p>
                </div>
              )}

              {/* Custom Properties */}
              {viewingTrade.customProperties?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Custom Properties & Attributes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {viewingTrade.customProperties.map((cp) => (
                      <div
                        key={cp.id}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-900"
                      >
                        <span className="font-bold text-slate-400">{cp.name}:</span>
                        <span className="font-black text-slate-800 dark:text-slate-200">{cp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Preview (Strictly 1-min validated video or chart image) */}
              {viewingTrade.mediaUrl && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Execution Media ({viewingTrade.mediaType === "video" ? "Video Under 60s" : "Chart Screenshot"})
                    </span>
                    {viewingTrade.videoDurationSeconds && (
                      <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                        Duration: {viewingTrade.videoDurationSeconds}s (Max 60s limit verified)
                      </span>
                    )}
                  </div>
                  {viewingTrade.mediaType === "video" ? (
                    <video
                      src={viewingTrade.mediaUrl}
                      controls
                      className="w-full max-h-80 rounded-xl bg-black shadow-md object-contain"
                    />
                  ) : (
                    <img
                      src={viewingTrade.mediaUrl}
                      alt="Trade Chart Screenshot"
                      className="w-full max-h-80 rounded-xl object-contain bg-slate-900 shadow-md"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteTradeConfirmId(viewingTrade.id);
                }}
                className="rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-bold gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Trade
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const t = viewingTrade;
                    setViewingTrade(null);
                    setEditingTrade(t);
                    setIsTradeModalOpen(true);
                  }}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Trade
                </Button>
                <Button
                  onClick={() => setViewingTrade(null)}
                  className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE TRADE CONFIRMATION MODAL */}
      {deleteTradeConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white">
            <h3 className="font-black text-base">
              {isBn ? "ট্রেড এন্ট্রি মুছে ফেলতে চান?" : "Delete Trade Entry?"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn
                ? "এই ট্রেড মুছে ফেললে বর্তমান ব্যালেন্স, উইনরেট এবং পারফরম্যান্স গ্রাফ পুনরায় হিসেব হবে।"
                : "Deleting this trade entry will permanently remove it and automatically recalculate current balance, win rate, and equity curves."}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTradeConfirmId(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeleteTrade(deleteTradeConfirmId)}
                className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-bold"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE BOOK CONFIRMATION MODAL */}
      {deleteBookConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white">
            <h3 className="font-black text-base">
              {isBn ? "জার্নাল বুক মুছে ফেলতে চান?" : "Delete Journal Book?"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn
                ? "এই জার্নাল বুকের সমস্ত ট্রেড হিস্ট্রি এবং রুলস স্থায়ীভাবে মুছে ফেলা হবে।"
                : "This will permanently delete this strategy book and all associated trade logs. This action cannot be undone."}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteBookConfirmId(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeleteBook(deleteBookConfirmId)}
                className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-bold"
              >
                Delete Book
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MOUNT MODALS */}
      {/* 1. Trade Modal (Add / Edit) */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setEditingTrade(null);
        }}
        onSave={handleSaveTrade}
        onUpdate={handleUpdateTrade}
        initialTrade={editingTrade}
        nextTradeNumber={nextNum}
        journalBookId={selectedBookId === "all" ? (books[0]?.id || "book_default") : selectedBookId}
        isBn={isBn}
      />

      {/* 2. Journal Book Modal (Create / Edit) */}
      <JournalBookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setEditingBook(null);
        }}
        onSave={handleCreateBook}
        onUpdate={handleUpdateBook}
        initialBook={editingBook}
        isBn={isBn}
      />

      {/* 3. Trade Print / PDF Modal */}
      <TradePrintModal
        trade={printingTrade}
        book={books.find((b) => b.id === printingTrade?.journalBookId) || currentBook}
        onClose={() => setPrintingTrade(null)}
        isBn={isBn}
      />
    </div>
  );
}
