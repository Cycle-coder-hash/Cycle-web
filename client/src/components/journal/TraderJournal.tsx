import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Printer,
  Download,
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
import { trpc } from "@/lib/trpc";
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
import { JournalCalendar } from "./JournalCalendar";
import { printTrade, exportTradePdf } from "@/lib/tradePdfExport";
import { TraderNotebook } from "@/components/notebook/TraderNotebook";
import { parseVideoUrl } from "@/lib/mediaUpload";

interface TraderJournalProps {
  isBn?: boolean;
  user?: any;
}

export function TraderJournal({ isBn = false, user }: TraderJournalProps) {
  // Navigation: Trade Journal vs Private Trader Notebook
  const [activeSection, setActiveSection] = useState<"journal" | "notebook">("journal");

  const userId = useMemo(() => {
    return user?.openId || user?.email || (user?.id ? String(user.id) : "");
  }, [user]);

  // State: Journal Books & Trades (scoped to current student)
  const [books, setBooks] = useState<JournalBook[]>(() => getStoredJournalBooks(userId));
  const [trades, setTrades] = useState<TradeEntry[]>(() => getStoredTrades(userId));

  // Selected Journal Book ID: "all" or specific book ID
  const [selectedBookId, setSelectedBookId] = useState<string>("all");

  // View Mode: Table vs Dedicated Journal Calendar
  const [journalViewMode, setJournalViewMode] = useState<"table" | "calendar">("table");
  const [calendarPrefillDate, setCalendarPrefillDate] = useState<string | undefined>(undefined);

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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Synchronize state when user changes
  useEffect(() => {
    setBooks(getStoredJournalBooks(userId));
    setTrades(getStoredTrades(userId));
  }, [userId]);

  // Synchronize state on custom events
  useEffect(() => {
    const handleStorageUpdate = (e: any) => {
      if (e?.detail?.userId && e.detail.userId !== userId) return;
      setBooks(getStoredJournalBooks(userId));
      setTrades(getStoredTrades(userId));
    };
    window.addEventListener("cycle_journal_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("cycle_journal_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [userId]);

  // Fetch remote trades from database on load/user login
  const remoteTradesQuery = trpc.customer.userTrades.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (remoteTradesQuery.data && Array.isArray(remoteTradesQuery.data) && remoteTradesQuery.data.length > 0) {
      setTrades((prevLocal) => {
        const local = prevLocal || [];
        if (local.length === 0) {
          saveTrades(remoteTradesQuery.data, userId);
          return remoteTradesQuery.data;
        }
        const localIds = new Set(local.map((t: any) => String(t.id)));
        const missingFromLocal = remoteTradesQuery.data.filter((rt: any) => !localIds.has(String(rt.id)));
        if (missingFromLocal.length > 0) {
          const merged = [...local, ...missingFromLocal];
          saveTrades(merged, userId);
          return merged;
        }
        return local;
      });
    }
  }, [remoteTradesQuery.data, userId]);

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
      const sum = books.reduce((acc, b) => acc + (b.startingBalance || 0), 0);
      return sum > 0 ? sum : 10000;
    }
    return currentBook?.startingBalance || 10000;
  }, [books, currentBook, selectedBookId]);

  // Sync trades and starting balance to server database for global leaderboard ranking
  const utils = trpc.useUtils();
  const syncTradesMutation = trpc.customer.syncTrades.useMutation({
    onSuccess: () => {
      utils.leaderboard.rankings.invalidate();
    },
  });

  useEffect(() => {
    if (user && trades) {
      syncTradesMutation.mutate({
        trades,
        startingBalance: effectiveStartingBalance,
        currency: currencySymbol,
        bookName: currentBook?.name || "Main Journal",
      });
    }
  }, [user, trades, effectiveStartingBalance, currencySymbol, currentBook?.name]);

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
    return getNextTradeNumber(targetBookId, userId);
  }, [books, selectedBookId, userId]);

  // Handlers for Books
  const handleCreateBook = (bookData: Omit<JournalBook, "id" | "createdAt">) => {
    const created = createJournalBook(bookData, userId);
    const updated = getStoredJournalBooks(userId);
    setBooks(updated);
    setSelectedBookId(created.id);
  };

  const handleUpdateBook = (book: JournalBook) => {
    updateJournalBook(book, userId);
    setBooks(getStoredJournalBooks(userId));
  };

  const handleDeleteBook = (bookId: string) => {
    deleteJournalBook(bookId, userId);
    const remaining = getStoredJournalBooks(userId);
    setBooks(remaining);
    setTrades(getStoredTrades(userId));
    setSelectedBookId(remaining[0]?.id || "all");
    setDeleteBookConfirmId(null);
  };

  // Handlers for Trades
  const handleSaveTrade = (tradeData: Omit<TradeEntry, "id" | "tradeNumber" | "createdAt">) => {
    addTrade(tradeData, userId);
    setTrades(getStoredTrades(userId));
    setIsTradeModalOpen(false);
  };

  const handleUpdateTrade = (trade: TradeEntry) => {
    updateTrade(trade, userId);
    setTrades(getStoredTrades(userId));
    setIsTradeModalOpen(false);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (tradeId: string) => {
    deleteTrade(tradeId, userId);
    setTrades(getStoredTrades(userId));
    setDeleteTradeConfirmId(null);
    if (viewingTrade?.id === tradeId) setViewingTrade(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Main Navigation Switcher: Trade Journal vs Private Trader Notebook */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveSection("journal")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
            activeSection === "journal"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="h-4 w-4 text-cyan-500" />
          <span>{isBn ? "ট্রেড জার্নাল ও পারফরম্যান্স" : "Trade Journal & Performance"}</span>
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400">
            {trades.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("notebook")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
            activeSection === "notebook"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <BookOpen className="h-4 w-4 text-emerald-500" />
          <span>{isBn ? "প্রাইভেট ট্রেডার নোটবুক" : "Private Trader Notebook"}</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
            {isBn ? "ভল্ট" : "Vault"}
          </span>
        </button>
      </div>

      {activeSection === "notebook" ? (
        <TraderNotebook user={user} isBn={isBn} />
      ) : (
        <>
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

          {books.length > 0 && (
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
            onClick={() => {
              setEditingBook(null);
              setIsBookModalOpen(true);
            }}
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
              onClick={() => setJournalViewMode(journalViewMode === "calendar" ? "table" : "calendar")}
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

      {/* PERFORMANCE ANALYTICS & GROWTH CURVE SECTION */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#0a1529]/95 via-[#070e1e]/95 to-[#040814]/95 p-5 sm:p-6 lg:p-7 shadow-[0_12px_40px_-15px_rgba(2,6,23,0.85),0_0_25px_-5px_rgba(6,182,212,0.1)] relative overflow-hidden backdrop-blur-xl group/analytics-card transition-all duration-300 hover:border-cyan-500/35 hover:shadow-[0_16px_50px_-15px_rgba(2,6,23,0.95),0_0_35px_-5px_rgba(6,182,212,0.18)]">
        {/* Ambient Top Glow Highlights */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            {/* Polished Compact Icon Container with Ambient Cyan Glow */}
            <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-500/35 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] shrink-0">
              <BarChart3 className="size-5 text-cyan-400" />
              <span className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-sm -z-10" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {isBn ? "পারফরম্যান্স ও গ্রোথ কার্ভ" : "Performance Analytics & Growth Curve"}
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
                  <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  {chartMode === "balance"
                    ? (isBn ? "ব্যালেন্স ট্র্যাজেক্টরি" : "Capital Trajectory")
                    : chartMode === "growth"
                    ? (isBn ? "ইকুইটি % রিটার্ন" : "Equity % Return")
                    : (isBn ? "পিরিয়ডিক P&L" : "Periodic P&L")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium tracking-normal">
                {isBn
                  ? "ক্যাপিটাল প্রবৃদ্ধি, ইকুইটি শতকরা রিটার্ন এবং পর্যায়ভিত্তিক P&L"
                  : "Real-time balance trajectory & periodic returns"}
              </p>
            </div>
          </div>

          {/* Top-Right Segmented Filter / View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* Segmented Controller */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-[#030712]/90 border border-slate-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md">
              {[
                { id: "balance", label: isBn ? "ব্যালেন্স কার্ভ" : "Balance Curve" },
                { id: "growth", label: isBn ? "গ্রোথ %" : "Growth %" },
                { id: "period", label: isBn ? "পিরিয়ড P&L" : "Period P&L" },
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

            {/* Period sub-tabs */}
            {chartMode === "period" && (
              <div className="inline-flex items-center p-1 rounded-2xl bg-[#030712]/90 border border-slate-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md animate-in fade-in duration-200">
                {(["daily", "weekly", "monthly"] as const).map((p) => {
                  const isActive = periodType === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriodType(p)}
                      className={`rounded-xl px-2.5 py-1 text-[11px] font-bold capitalize transition-all duration-150 select-none ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative z-10 mt-6 rounded-2xl border border-slate-800/80 bg-[#040814]/85 p-3 sm:p-4 lg:p-5 backdrop-blur-sm overflow-hidden shadow-inner">
          {/* Subtle depth lighting inside the chart area */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan-500/5 via-blue-500/2 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent" />

          <div className="h-64 sm:h-72 lg:h-80 w-full relative z-10">
            {growthPoints.length <= 1 && chartMode !== "period" ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 p-8 space-y-2">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                  <BarChart3 className="size-6 text-cyan-400" />
                </div>
                <p className="text-xs font-bold text-slate-200">
                  {isBn ? "কোনো ট্রেড ডাটা পাওয়া যায়নি" : "No Equity Curve Data Available"}
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  {isBn
                    ? "গ্রোথ কার্ভ দেখার জন্য অন্তত একটি ট্রেড এন্ট্রি যোগ করুন।"
                    : "Log trades above to begin generating your equity progression curve."}
                </p>
              </div>
            ) : chartMode === "balance" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthPoints} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="60%" stopColor="#0284c7" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.45} vertical={false} />
                  <XAxis
                    dataKey="tradeNumber"
                    tickFormatter={(val) => (val === 0 ? "Start" : `#${val}`)}
                    stroke="#475569"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(val) => `${currencySymbol}${Number(val).toLocaleString()}`}
                    stroke="#475569"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                    tick={{ fill: "#64748b" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload as GrowthDataPoint;
                      return (
                        <div className="rounded-2xl border border-cyan-500/30 bg-[#070e1e]/95 p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl text-xs space-y-1.5 min-w-[180px]">
                          <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
                            <span>{data.tradeNumber === 0 ? "Initial Deposit" : `Trade #${data.tradeNumber}`}</span>
                            {data.pair && (
                              <span className="font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-[10px]">
                                {data.pair}
                              </span>
                            )}
                          </div>
                          <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-baseline gap-1">
                            <span className="text-cyan-400">{currencySymbol}</span>
                            {data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {data.tradeNumber > 0 && (
                            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 text-[11px] font-bold">
                              <span className={data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                {data.pnl >= 0 ? `+${currencySymbol}${data.pnl.toLocaleString()}` : `-${currencySymbol}${Math.abs(data.pnl).toLocaleString()}`}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${data.equityGrowth >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                {data.equityGrowth >= 0 ? `+${data.equityGrowth}%` : `${data.equityGrowth}%`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={effectiveStartingBalance} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#balanceGrad)"
                    dot={{ r: 3, fill: "#040814", stroke: "#06b6d4", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : chartMode === "growth" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthPoints} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="60%" stopColor="#059669" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.45} vertical={false} />
                  <XAxis
                    dataKey="tradeNumber"
                    tickFormatter={(val) => (val === 0 ? "Start" : `#${val}`)}
                    stroke="#475569"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis
                    tickFormatter={(val) => `${val}%`}
                    stroke="#475569"
                    fontSize={11}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                    tick={{ fill: "#64748b" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload as GrowthDataPoint;
                      return (
                        <div className="rounded-2xl border border-emerald-500/30 bg-[#070e1e]/95 p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-xl text-xs space-y-1.5 min-w-[180px]">
                          <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
                            <span>{data.tradeNumber === 0 ? "Baseline Initial" : `Trade #${data.tradeNumber}`}</span>
                            {data.pair && (
                              <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                                {data.pair}
                              </span>
                            )}
                          </div>
                          <div className={`text-base sm:text-lg font-black tracking-tight ${data.equityGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {data.equityGrowth >= 0 ? `+${data.equityGrowth}%` : `${data.equityGrowth}%`}
                          </div>
                          <div className="text-[11px] font-mono text-slate-300 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-slate-400">Balance:</span>
                            <span className="text-white font-bold">{currencySymbol}{data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />
                  <Area
                    type="monotone"
                    dataKey="equityGrowth"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#growthGrad)"
                    dot={{ r: 3, fill: "#040814", stroke: "#10b981", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              /* Period PnL Bar Chart */
              periodPnlList.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 p-8 space-y-2">
                  <p className="text-xs font-semibold text-slate-400">No period data recorded yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={periodPnlList} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="posBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.75} />
                      </linearGradient>
                      <linearGradient id="negBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#be123c" stopOpacity={0.75} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.45} vertical={false} />
                    <XAxis
                      dataKey="period"
                      stroke="#475569"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={{ stroke: "#1e293b" }}
                      tick={{ fill: "#64748b" }}
                    />
                    <YAxis
                      tickFormatter={(val) => `${currencySymbol}${Number(val).toLocaleString()}`}
                      stroke="#475569"
                      fontSize={11}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={{ stroke: "#1e293b" }}
                      tick={{ fill: "#64748b" }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload as PeriodPnl;
                        return (
                          <div className="rounded-2xl border border-slate-700 bg-[#070e1e]/95 p-3.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-xl text-xs space-y-1.5 min-w-[170px]">
                            <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{data.period}</div>
                            <div className={`text-base sm:text-lg font-black tracking-tight ${data.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {data.pnl >= 0 ? `+${currencySymbol}${data.pnl.toLocaleString()}` : `-${currencySymbol}${Math.abs(data.pnl).toLocaleString()}`}
                            </div>
                            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                              <span>{data.trades} Trades</span>
                              <span className="font-bold text-slate-300">
                                <span className="text-emerald-400">{data.wins}W</span> / <span className="text-rose-400">{data.losses}L</span>
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" strokeWidth={1} />
                    <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                      {periodPnlList.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.pnl >= 0 ? "url(#posBarGrad)" : "url(#negBarGrad)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </div>
      </div>


      {/* VIEW SWITCHER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setJournalViewMode("table")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                journalViewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{isBn ? "ট্রেড টেবিল (২১ ফিল্ড)" : "Audit Table (21 Fields)"}</span>
              <span className="rounded-full bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 text-[10px] font-mono">
                {bookTrades.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setJournalViewMode("calendar")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                journalViewMode === "calendar"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{isBn ? "বুক ক্যালেন্ডার ভিউ" : "Journal Calendar"}</span>
              {currentBook && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    journalViewMode === "calendar"
                      ? "bg-white/20 text-white"
                      : "bg-cyan-500/10 text-cyan-500"
                  }`}
                >
                  {currentBook.name}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setCalendarPrefillDate(undefined);
              setEditingTrade(null);
              setIsTradeModalOpen(true);
            }}
            size="sm"
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 text-xs font-black gap-1.5 shadow-md shadow-cyan-500/20 px-4 py-2"
          >
            <Plus className="h-3.5 w-3.5" />
            {isBn ? "+ নতুন ট্রেড এন্ট্রি" : "+ Log Trade"}
          </Button>
        </div>
      </div>

      {journalViewMode === "calendar" ? (
        <JournalCalendar
          book={currentBook}
          trades={bookTrades}
          currencySymbol={currencySymbol}
          isBn={isBn}
          onViewTrade={(t) => setViewingTrade(t)}
          onEditTrade={(t) => {
            setEditingTrade(t);
            setIsTradeModalOpen(true);
          }}
          onDeleteTrade={(id) => setDeleteTradeConfirmId(id)}
          onPrintTrade={(t) => setPrintingTrade(t)}
          onLogTradeForDate={(d) => {
            setCalendarPrefillDate(d);
            setEditingTrade(null);
            setIsTradeModalOpen(true);
          }}
        />
      ) : (
        /* TRADE HISTORY AUDIT TABLE & FILTERS */
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
                        {(() => {
                          const tScreenshots = t.screenshots && t.screenshots.length > 0
                            ? t.screenshots
                            : (t.mediaUrl && t.mediaType !== "video" ? [t.mediaUrl] : []);
                          const tVideo = t.videoUrl || (t.mediaType === "video" ? t.mediaUrl : undefined);

                          if (tScreenshots.length === 0 && !tVideo) {
                            return <span className="text-slate-300 dark:text-slate-700">—</span>;
                          }

                          return (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {tScreenshots.length > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-black text-cyan-500 border border-cyan-500/20">
                                  <ImageIcon className="h-3 w-3" />
                                  {tScreenshots.length} {tScreenshots.length === 1 ? "Image" : "Images"}
                                </span>
                              )}
                              {tVideo && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-black text-purple-400 border border-purple-500/20">
                                  <VideoIcon className="h-3 w-3" />
                                  {t.videoDurationSeconds ? `${t.videoDurationSeconds}s` : "Video"}
                                </span>
                              )}
                            </div>
                          );
                        })()}
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
      )}

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
                {/* 1. Dedicated Print Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => printTrade(viewingTrade, currentBook)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
                  title={isBn ? "ট্রেড অডিট প্রিন্ট করুন" : "Print trade audit report"}
                >
                  <Printer className="h-3.5 w-3.5 text-cyan-500" />
                  Print
                </Button>

                {/* 2. Dedicated PDF Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportTradePdf(viewingTrade, currentBook)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
                  title={isBn ? "পিডিএফ ডাউনলোড করুন" : "Download trade audit PDF"}
                >
                  <Download className="h-3.5 w-3.5 text-cyan-500" />
                  PDF
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

              {/* Multiple Screenshots & Video Previews */}
              {(() => {
                const viewScreenshots = viewingTrade.screenshots && viewingTrade.screenshots.length > 0
                  ? viewingTrade.screenshots
                  : (viewingTrade.mediaUrl && viewingTrade.mediaType !== "video" ? [viewingTrade.mediaUrl] : []);
                const viewVideo = viewingTrade.videoUrl || (viewingTrade.mediaType === "video" ? viewingTrade.mediaUrl : undefined);

                if (viewScreenshots.length === 0 && !viewVideo) return null;

                return (
                  <div className="space-y-4">
                    {/* Attached Screenshots Gallery */}
                    {viewScreenshots.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ImageIcon size={15} className="text-cyan-500" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                              Attached Screenshots ({viewScreenshots.length})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Click any image to enlarge</span>
                        </div>

                        <div className={`grid gap-3 ${
                          viewScreenshots.length === 1
                            ? "grid-cols-1"
                            : viewScreenshots.length === 2
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-2 sm:grid-cols-3"
                        }`}>
                          {viewScreenshots.map((src, idx) => (
                            <div
                              key={idx}
                              onClick={() => setLightboxImage(src)}
                              className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm cursor-pointer hover:border-cyan-500 transition-colors"
                            >
                              <img
                                src={src}
                                alt={`Trade Screenshot ${idx + 1}`}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              <div className="absolute top-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-black text-cyan-400 backdrop-blur-xs border border-white/10">
                                #{idx + 1}
                              </div>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs border border-white/20">
                                  <Eye size={13} /> View Full
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Execution Video Player */}
                    {viewVideo && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <VideoIcon size={14} className="text-purple-400" />
                            <span>Execution Video Clip</span>
                          </span>
                          {viewingTrade.videoDurationSeconds && (
                            <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                              Duration: {viewingTrade.videoDurationSeconds}s (Max 60s limit verified)
                            </span>
                          )}
                        </div>
                        {(() => {
                          const parsed = parseVideoUrl(viewVideo);
                          if (parsed.isIframe && parsed.embedUrl) {
                            return (
                              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md">
                                <iframe
                                  src={parsed.embedUrl}
                                  title="Execution Video Clip"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  className="w-full h-full border-0"
                                />
                              </div>
                            );
                          }
                          return (
                            <video
                              src={viewVideo}
                              controls
                              className="w-full max-h-80 rounded-xl bg-black shadow-md object-contain"
                            />
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
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
        </>
      )}
        </>
      )}

      {/* MOUNT MODALS */}
      {/* 1. Trade Modal (Add / Edit) */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setEditingTrade(null);
          setCalendarPrefillDate(undefined);
        }}
        onSave={(newTrade) => {
          handleSaveTrade(newTrade);
          setCalendarPrefillDate(undefined);
        }}
        onUpdate={(updated) => {
          handleUpdateTrade(updated);
          setCalendarPrefillDate(undefined);
        }}
        initialTrade={editingTrade}
        defaultDate={calendarPrefillDate}
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

      {/* 4. Lightbox Modal for Full Resolution Screenshot */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-11 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Close Preview"
            >
              <X size={22} />
            </button>
            <img
              src={lightboxImage}
              alt="Screenshot High Resolution"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
