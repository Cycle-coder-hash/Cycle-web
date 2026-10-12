import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { JournalOverviewHeaderAndKpis, BookComparisonItem } from "./JournalOverviewHeaderAndKpis";
import { JournalAnalyticsChartSection } from "./JournalAnalyticsChartSection";
import { JournalTradesTableSection } from "./JournalTradesTableSection";
import { JournalTradeDetailsAndConfirmModals } from "./JournalTradeDetailsAndConfirmModals";
import { printTrade, exportTradePdf } from "@/lib/tradePdfExport";
import { UpgradeModal, UpgradeFeatureType } from "@/components/subscription/UpgradeModal";
import { ClaimFreePlanModal } from "@/components/subscription/ClaimFreePlanModal";

interface TraderJournalProps {
  isBn?: boolean;
  user?: any;
}

export function TraderJournal({ isBn = false, user }: TraderJournalProps) {
  const { selectText, isUr, isRTL } = useLanguage();
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

  // Subscription Usage, Claim Modal & Upgrade Modal
  const { data: subUsage } = trpc.subscription.getMyUsage.useQuery(undefined, { enabled: !!user });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<UpgradeFeatureType>("generic");
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [pendingActionAfterClaim, setPendingActionAfterClaim] = useState<
    | { type: "open_new_trade"; datePrefill?: string }
    | { type: "save_trade"; tradeData: Omit<TradeEntry, "id" | "tradeNumber" | "createdAt"> }
    | { type: "open_new_book" }
    | { type: "create_book"; bookData: Omit<JournalBook, "id" | "createdAt"> }
    | null
  >(null);

  const isUnclaimed = Boolean(
    user && subUsage && (subUsage.plan === "unclaimed" || (subUsage as any).trialStatus === "unclaimed") && !(subUsage as any).isPaidActive
  );

  const handleOpenNewBook = () => {
    if (isUnclaimed) {
      setPendingActionAfterClaim({ type: "open_new_book" });
      setIsClaimModalOpen(true);
      return;
    }
    if (subUsage && subUsage.journalBooksLimit !== "unlimited") {
      if (books.length >= subUsage.journalBooksLimit) {
        setUpgradeFeature("journal_books");
        setIsUpgradeModalOpen(true);
        return;
      }
    }
    setEditingBook(null);
    setIsBookModalOpen(true);
  };

  const handleOpenNewTrade = (datePrefill?: string) => {
    if (isUnclaimed) {
      setCalendarPrefillDate(datePrefill);
      setPendingActionAfterClaim({ type: "open_new_trade", datePrefill });
      setIsClaimModalOpen(true);
      return;
    }
    if (subUsage && subUsage.journalEntriesLimit !== "unlimited") {
      if (subUsage.journalEntriesCount >= subUsage.journalEntriesLimit) {
        setUpgradeFeature("trade_limit");
        setIsUpgradeModalOpen(true);
        return;
      }
    }
    setCalendarPrefillDate(datePrefill);
    setEditingTrade(null);
    setIsTradeModalOpen(true);
  };

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

  // Remote queries for persistent Journal Books & Trades from server database
  const utils = trpc.useUtils();

  const remoteBooksQuery = trpc.customer.getJournalBooks.useQuery(undefined, {
    enabled: !!user,
  });

  const remoteTradesQuery = trpc.customer.userTrades.useQuery(undefined, {
    enabled: !!user,
  });

  const saveBooksMutation = trpc.customer.saveJournalBooks.useMutation();
  const deleteJournalBookMutation = trpc.customer.deleteJournalBook.useMutation();

  const syncTradesMutation = trpc.customer.syncTrades.useMutation({
    onSuccess: () => {
      utils.leaderboard.rankings.invalidate();
      utils.leaderboard.myRank.invalidate();
    },
  });

  const deleteTradeMutation = trpc.customer.deleteTrade.useMutation({
    onSuccess: () => {
      utils.customer.userTrades.invalidate();
      utils.leaderboard.rankings.invalidate();
      utils.leaderboard.myRank.invalidate();
    },
  });

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

  // Synchronize remote Journal Books from database (never auto-write when unclaimed)
  useEffect(() => {
    if (!user || !subUsage || isUnclaimed) return;
    if (remoteBooksQuery.data && Array.isArray(remoteBooksQuery.data)) {
      setBooks((prevLocal) => {
        const local = prevLocal || [];
        const remote = remoteBooksQuery.data || [];
        if (remote.length > 0) {
          const remoteIds = new Set(remote.map((b: any) => String(b.id)));
          const unsyncedLocal = local.filter((b: any) => !remoteIds.has(String(b.id)));
          const merged = [...remote, ...unsyncedLocal];
          saveJournalBooks(merged, userId);
          if (unsyncedLocal.length > 0) {
            saveBooksMutation.mutate({ books: merged });
          }
          return merged;
        } else if (local.length > 0) {
          saveBooksMutation.mutate({ books: local });
          return local;
        }
        return local;
      });
    }
  }, [remoteBooksQuery.data, user, userId, subUsage, isUnclaimed]);

  // Synchronize remote Trade Entries from database (never auto-write when unclaimed)
  useEffect(() => {
    if (!user || !subUsage || isUnclaimed) return;
    if (remoteTradesQuery.data && Array.isArray(remoteTradesQuery.data)) {
      setTrades((prevLocal) => {
        const local = prevLocal || [];
        const remote = remoteTradesQuery.data || [];
        if (remote.length > 0) {
          const remoteIds = new Set(remote.map((t: any) => String(t.id)));
          const unsyncedLocal = local.filter((t: any) => !remoteIds.has(String(t.id)));
          const merged = [...remote, ...unsyncedLocal];
          saveTrades(merged, userId);
          if (unsyncedLocal.length > 0) {
            syncTradesMutation.mutate({
              trades: merged,
              startingBalance: effectiveStartingBalance,
              currency: currencySymbol,
              bookName: currentBook?.name || "Main Journal",
            });
          }
          return merged;
        } else if (local.length > 0) {
          syncTradesMutation.mutate({
            trades: local,
            startingBalance: effectiveStartingBalance,
            currency: currencySymbol,
            bookName: currentBook?.name || "Main Journal",
          });
          return local;
        }
        return local;
      });
    }
  }, [remoteTradesQuery.data, user, userId, effectiveStartingBalance, currencySymbol, currentBook?.name, subUsage, isUnclaimed]);

  // Overall or Book Statistics
  const stats: JournalStats = useMemo(() => {
    return computeJournalStats(effectiveStartingBalance, bookTrades);
  }, [effectiveStartingBalance, bookTrades]);

  // Per-book statistics and trade counts for selector bar and strategy comparison matrix
  const bookComparisonItems: BookComparisonItem[] = useMemo(() => {
    return books.map((b) => {
      const bTrades = trades.filter((t) => t.journalBookId === b.id);
      const bStats = computeJournalStats(b.startingBalance, bTrades);
      return { book: b, tradesCount: bTrades.length, stats: bStats };
    });
  }, [books, trades]);

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
  const executeCreateBook = (bookData: Omit<JournalBook, "id" | "createdAt">) => {
    const created = createJournalBook(bookData, userId);
    const updated = getStoredJournalBooks(userId);
    setBooks(updated);
    setSelectedBookId(created.id);
    saveBooksMutation.mutate({ books: updated });
  };

  const handleCreateBook = (bookData: Omit<JournalBook, "id" | "createdAt">) => {
    if (isUnclaimed) {
      setPendingActionAfterClaim({ type: "create_book", bookData });
      setIsClaimModalOpen(true);
      return;
    }
    executeCreateBook(bookData);
  };

  const handleUpdateBook = (book: JournalBook) => {
    if (isUnclaimed) {
      setIsClaimModalOpen(true);
      return;
    }
    updateJournalBook(book, userId);
    const updated = getStoredJournalBooks(userId);
    setBooks(updated);
    saveBooksMutation.mutate({ books: updated });
  };

  const handleDeleteBook = (bookId: string) => {
    deleteJournalBook(bookId, userId);
    const remaining = getStoredJournalBooks(userId);
    setBooks(remaining);
    setTrades(getStoredTrades(userId));
    setSelectedBookId(remaining[0]?.id || "all");
    setDeleteBookConfirmId(null);
    deleteJournalBookMutation.mutate({ bookId });
  };

  // Handlers for Trades
  const executeSaveTrade = (tradeData: Omit<TradeEntry, "id" | "tradeNumber" | "createdAt">) => {
    addTrade(tradeData, userId);
    const updated = getStoredTrades(userId);
    setTrades(updated);
    setIsTradeModalOpen(false);
    setCalendarPrefillDate(undefined);
    syncTradesMutation.mutate({
      trades: updated,
      startingBalance: effectiveStartingBalance,
      currency: currencySymbol,
      bookName: currentBook?.name || "Main Journal",
    });
  };

  const handleSaveTrade = (tradeData: Omit<TradeEntry, "id" | "tradeNumber" | "createdAt">) => {
    if (isUnclaimed) {
      setPendingActionAfterClaim({ type: "save_trade", tradeData });
      setIsClaimModalOpen(true);
      return;
    }
    executeSaveTrade(tradeData);
  };

  const handleUpdateTrade = (trade: TradeEntry) => {
    if (isUnclaimed) {
      setIsClaimModalOpen(true);
      return;
    }
    updateTrade(trade, userId);
    const updated = getStoredTrades(userId);
    setTrades(updated);
    setIsTradeModalOpen(false);
    setEditingTrade(null);
    syncTradesMutation.mutate({
      trades: updated,
      startingBalance: effectiveStartingBalance,
      currency: currencySymbol,
      bookName: currentBook?.name || "Main Journal",
    });
  };

  const handleDeleteTrade = (tradeId: string) => {
    deleteTrade(tradeId, userId);
    const updated = getStoredTrades(userId);
    setTrades(updated);
    setDeleteTradeConfirmId(null);
    if (viewingTrade?.id === tradeId) setViewingTrade(null);
    deleteTradeMutation.mutate({ tradeId });
  };

  const handleClaimSuccess = () => {
    const action = pendingActionAfterClaim;
    setPendingActionAfterClaim(null);
    if (!action) return;
    if (action.type === "open_new_trade") {
      setCalendarPrefillDate(action.datePrefill);
      setEditingTrade(null);
      setIsTradeModalOpen(true);
    } else if (action.type === "save_trade") {
      executeSaveTrade(action.tradeData);
    } else if (action.type === "open_new_book") {
      if (books.length >= 1) {
        setUpgradeFeature("journal_books");
        setIsUpgradeModalOpen(true);
      } else {
        setEditingBook(null);
        setIsBookModalOpen(true);
      }
    } else if (action.type === "create_book") {
      if (books.length >= 1) {
        setUpgradeFeature("journal_books");
        setIsUpgradeModalOpen(true);
      } else {
        executeCreateBook(action.bookData);
      }
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`space-y-6 animate-in fade-in duration-300 ${isUr ? "font-urdu" : ""}`}>
      <JournalOverviewHeaderAndKpis
        isBn={isBn}
        totalTradesCount={trades.length}
        books={books}
        bookComparisonItems={bookComparisonItems}
        selectedBookId={selectedBookId}
        currentBook={currentBook}
        currencySymbol={currencySymbol}
        stats={stats}
        journalViewMode={journalViewMode}
        onSelectBook={setSelectedBookId}
        onOpenNewBook={handleOpenNewBook}
        onOpenNewTrade={() => handleOpenNewTrade()}
        onToggleViewMode={() => setJournalViewMode(journalViewMode === "calendar" ? "table" : "calendar")}
        onEditBook={(book) => {
          setEditingBook(book);
          setIsBookModalOpen(true);
        }}
        onRequestDeleteBook={(bookId) => setDeleteBookConfirmId(bookId)}
      />

      {books.length > 0 && (
        <>
          <JournalAnalyticsChartSection
            isBn={isBn}
            chartMode={chartMode}
            periodType={periodType}
            growthPoints={growthPoints}
            periodPnlList={periodPnlList}
            currencySymbol={currencySymbol}
            effectiveStartingBalance={effectiveStartingBalance}
            onChangeChartMode={setChartMode}
            onChangePeriodType={setPeriodType}
          />

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
                  <span>{selectText({ bn: "ট্রেড টেবিল (২১ ফিল্ড)", en: "Audit Table (21 Fields)", ur: "آڈٹ ٹیبل (21 فیلڈز)" })}</span>
                  <span dir="ltr" className="rounded-full bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 text-[10px] font-mono">
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
                  <span>{selectText({ bn: "বুক ক্যালেন্ডার ভিউ", en: "Journal Calendar", ur: "جرنل کیلنڈر ویو" })}</span>
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
                onClick={() => handleOpenNewTrade()}
                size="sm"
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 text-xs font-black gap-1.5 shadow-md shadow-cyan-500/20 px-4 py-2"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{selectText({ bn: "+ নতুন ট্রেড এন্ট্রি", en: "+ Log Trade", ur: "+ نیا ٹریڈ درج کریں" })}</span>
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
              onLogTradeForDate={(d) => handleOpenNewTrade(d)}
            />
          ) : (
            <JournalTradesTableSection
              isBn={isBn}
              filteredTrades={filteredTrades}
              searchTerm={searchTerm}
              resultFilter={resultFilter}
              rankFilter={rankFilter}
              ruleFilter={ruleFilter}
              onSearchTermChange={setSearchTerm}
              onResultFilterChange={setResultFilter}
              onRankFilterChange={setRankFilter}
              onRuleFilterChange={setRuleFilter}
              onOpenNewTrade={() => handleOpenNewTrade()}
              onViewTrade={(t) => setViewingTrade(t)}
              onPrintTrade={(t) => setPrintingTrade(t)}
              onEditTrade={(t) => {
                setEditingTrade(t);
                setIsTradeModalOpen(true);
              }}
              onRequestDeleteTrade={(id) => setDeleteTradeConfirmId(id)}
            />
          )}

          <JournalTradeDetailsAndConfirmModals
            isBn={isBn}
            viewingTrade={viewingTrade}
            currentBook={currentBook}
            deleteTradeConfirmId={deleteTradeConfirmId}
            deleteBookConfirmId={deleteBookConfirmId}
            lightboxImage={lightboxImage}
            onCloseViewingTrade={() => setViewingTrade(null)}
            onPrintViewingTrade={(trade, book) => printTrade(trade, book)}
            onExportViewingTradePdf={(trade, book) => exportTradePdf(trade, book)}
            onEditViewingTrade={(trade) => {
              setViewingTrade(null);
              setEditingTrade(trade);
              setIsTradeModalOpen(true);
            }}
            onRequestDeleteTrade={(id) => setDeleteTradeConfirmId(id)}
            onCancelDeleteTrade={() => setDeleteTradeConfirmId(null)}
            onConfirmDeleteTrade={(id) => handleDeleteTrade(id)}
            onCancelDeleteBook={() => setDeleteBookConfirmId(null)}
            onConfirmDeleteBook={(id) => handleDeleteBook(id)}
            onOpenLightboxImage={(src) => setLightboxImage(src)}
            onCloseLightboxImage={() => setLightboxImage(null)}
          />
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
        canUploadVideo={
          !subUsage ||
          subUsage.journalVideosLimit === "unlimited" ||
          (typeof subUsage.journalVideosLimit === "number" &&
            subUsage.journalVideosLimit > 0 &&
            subUsage.journalVideosCount < subUsage.journalVideosLimit)
        }
        onRequestUpgrade={(feature) => {
          setUpgradeFeature(feature);
          setIsUpgradeModalOpen(true);
        }}
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

      {/* Subscription Access / Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        feature={upgradeFeature}
        currentPlan={subUsage?.plan}
      />

      {/* Explicit 20-Day Free Trial Claim Modal */}
      <ClaimFreePlanModal
        isOpen={isClaimModalOpen}
        onClose={() => {
          setIsClaimModalOpen(false);
          setPendingActionAfterClaim(null);
        }}
        onClaimSuccess={handleClaimSuccess}
        source="journal"
      />
    </div>
  );
}
