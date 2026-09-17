import { JournalBook, TradeEntry, JournalRule } from "@/types/journal";

const BOOKS_STORAGE_KEY = "cycle_trader_journal_books_v3";
const TRADES_STORAGE_KEY = "cycle_trader_journal_trades_v3";

export const DEFAULT_JOURNAL_BOOKS: JournalBook[] = [
  {
    id: "book_smc_default",
    name: "SMC Strategy Journal",
    strategy: "Smart Money Concepts",
    startingBalance: 10000,
    currency: "$",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    description: "Institutional Order Flow, Liquidity Sweeps, and FVG mitigation setups.",
    rules: [
      { id: "rule_1", text: "Always confirm 4H / 1H Market Structure Shift (MSS) before entry." },
      { id: "rule_2", text: "Maximum risk per trade is strictly 1% ($100 on $10k account)." },
      { id: "rule_3", text: "Minimum Risk to Reward target must be at least 1:2.5." },
      { id: "rule_4", text: "Never trade within 15 minutes before or after high-impact red-folder news." },
      { id: "rule_5", text: "Move Stop Loss to Break-Even only after 1R target is secured." },
    ],
  },
  {
    id: "book_ict_default",
    name: "ICT Silver Bullet Journal",
    strategy: "ICT Silver Bullet & CRT",
    startingBalance: 5000,
    currency: "$",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    description: "London & New York session algorithmic time-and-price Silver Bullet executions.",
    rules: [
      { id: "rule_ict_1", text: "Only execute during confirmed Silver Bullet windows (10:00 - 11:00 AM NY)." },
      { id: "rule_ict_2", text: "Must take liquidity from prior session high/low prior to entry." },
      { id: "rule_ict_3", text: "Fixed 1% risk per setup. No revenge trading if stopped out." },
    ],
  },
];

export const DEFAULT_TRADES: TradeEntry[] = [
  {
    id: "trade_smc_1",
    journalBookId: "book_smc_default",
    tradeNumber: 1,
    date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
    entryTime: "08:15",
    pair: "EURUSD",
    timeframe: "15M",
    direction: "Buy",
    entryPrice: 1.0825,
    stopLoss: 1.0805,
    takeProfit: 1.0885,
    exitPrice: 1.0885,
    followedRules: "Yes",
    pnl: 300,
    riskReward: "1:3.0",
    pips: 60,
    lotSize: 0.5,
    tradeRun: "+3R",
    note: "Clean London open liquidity sweep below Asian low, followed by strong displacement and 15M FVG entry.",
    tradeRank: "A+",
    learning: "Patience paid off. Waiting for candle body close ensured zero false breakout trap.",
    customProperties: [
      { id: "cp_1", name: "Session", value: "London Open" },
      { id: "cp_2", name: "Setup Type", value: "Asian Low Sweep + FVG" },
    ],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "trade_smc_2",
    journalBookId: "book_smc_default",
    tradeNumber: 2,
    date: new Date(Date.now() - 11 * 86400000).toISOString().slice(0, 10),
    entryTime: "13:45",
    pair: "GBPUSD",
    timeframe: "5M",
    direction: "Sell",
    entryPrice: 1.2940,
    stopLoss: 1.2965,
    takeProfit: 1.2865,
    exitPrice: 1.2890,
    followedRules: "Yes",
    pnl: 200,
    riskReward: "1:3.0",
    pips: 50,
    lotSize: 0.4,
    tradeRun: "+2.5R",
    note: "NY morning session rejection at premium 1H order block. Partial profit taken at 1:2.",
    tradeRank: "A",
    learning: "Taking partials before major psychological 1.2900 handle protected gains when retracement occurred.",
    customProperties: [
      { id: "cp_3", name: "Session", value: "New York Open" },
    ],
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: "trade_smc_3",
    journalBookId: "book_smc_default",
    tradeNumber: 3,
    date: new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
    entryTime: "09:30",
    pair: "XAUUSD",
    timeframe: "5M",
    direction: "Buy",
    entryPrice: 2420.0,
    stopLoss: 2415.0,
    takeProfit: 2435.0,
    exitPrice: 2415.0,
    followedRules: "No",
    pnl: -100,
    riskReward: "1:3.0",
    pips: -50,
    lotSize: 0.2,
    tradeRun: "+0.8R",
    note: "Rushed entry without waiting for 5M candle closure after high-impact CPI news release.",
    tradeRank: "A-",
    learning: "Broke Rule #4 (news volatility). In the future, wait at least 15 minutes post-CPI before taking any execution.",
    customProperties: [
      { id: "cp_4", name: "Mistake", value: "News Chasing / FOMO" },
    ],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "trade_smc_4",
    journalBookId: "book_smc_default",
    tradeNumber: 4,
    date: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
    entryTime: "14:10",
    pair: "XAUUSD",
    timeframe: "15M",
    direction: "Buy",
    entryPrice: 2430.0,
    stopLoss: 2424.0,
    takeProfit: 2450.0,
    exitPrice: 2448.0,
    followedRules: "Yes",
    pnl: 360,
    riskReward: "1:3.3",
    pips: 180,
    lotSize: 0.2,
    tradeRun: "+3.2R",
    note: "Textbook MSS + rejection block retest after London session low raid. Target reached cleanly.",
    tradeRank: "A+",
    learning: "Flawless rule compliance. Stayed patient through 40 minutes of consolidation before expansion.",
    customProperties: [
      { id: "cp_5", name: "Session", value: "New York Session" },
      { id: "cp_6", name: "Discipline", value: "100% Rules Followed" },
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "trade_ict_1",
    journalBookId: "book_ict_default",
    tradeNumber: 1,
    date: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10),
    entryTime: "10:15",
    pair: "US30",
    timeframe: "1M",
    direction: "Buy",
    entryPrice: 40100,
    stopLoss: 40040,
    takeProfit: 40250,
    exitPrice: 40220,
    followedRules: "Yes",
    pnl: 120,
    riskReward: "1:2.5",
    pips: 120,
    lotSize: 1.0,
    tradeRun: "+2.2R",
    note: "10:00 AM NY Silver Bullet setup. Swept sell-side liquidity at market open and expanded through buy-side.",
    tradeRank: "A+",
    learning: "Index algorithms respect NY 10 AM macro time windows with precision.",
    customProperties: [
      { id: "cp_7", name: "Model", value: "Silver Bullet 10AM" },
    ],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

function getBooksKey(userId?: string): string {
  const safe = userId?.trim();
  return safe ? `cycle_trader_journal_books_v3_${safe}` : BOOKS_STORAGE_KEY;
}

function getTradesKey(userId?: string): string {
  const safe = userId?.trim();
  return safe ? `cycle_trader_journal_trades_v3_${safe}` : TRADES_STORAGE_KEY;
}

export function getStoredJournalBooks(userId?: string): JournalBook[] {
  if (typeof window === "undefined") return [];
  const safe = userId?.trim();
  if (!safe) return [];
  try {
    const key = getBooksKey(safe);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // For existing users with custom books created prior to user-scoping:
      const legacyRaw = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacyParsed = JSON.parse(legacyRaw);
          if (Array.isArray(legacyParsed)) {
            const personalBooks = legacyParsed.filter(
              (b: any) => b.id !== "book_smc_default" && b.id !== "book_ict_default"
            );
            if (personalBooks.length > 0) {
              localStorage.setItem(key, JSON.stringify(personalBooks));
              return personalBooks;
            }
          }
        } catch {}
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sanitize any lingering demo books from older sessions
    return parsed.filter(
      (b: any) => b.id !== "book_smc_default" && b.id !== "book_ict_default"
    );
  } catch (err) {
    console.error("Failed to load journal books from localStorage", err);
    return [];
  }
}

export function saveJournalBooks(books: JournalBook[], userId?: string): void {
  if (typeof window === "undefined") return;
  const safe = userId?.trim();
  if (!safe) return;
  try {
    const key = getBooksKey(safe);
    localStorage.setItem(key, JSON.stringify(books));
    window.dispatchEvent(new CustomEvent("cycle_journal_updated", { detail: { userId: safe } }));
  } catch (err) {
    console.error("Failed to save journal books", err);
  }
}

export function getStoredTrades(userId?: string): TradeEntry[] {
  if (typeof window === "undefined") return [];
  const safe = userId?.trim();
  if (!safe) return [];
  try {
    const key = getTradesKey(safe);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // For existing users with custom trades created prior to user-scoping:
      const legacyRaw = localStorage.getItem(TRADES_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacyParsed = JSON.parse(legacyRaw);
          if (Array.isArray(legacyParsed)) {
            const personalTrades = legacyParsed.filter(
              (t: any) => !t.id?.startsWith("trade_smc_") && !t.id?.startsWith("trade_ict_")
            );
            if (personalTrades.length > 0) {
              localStorage.setItem(key, JSON.stringify(personalTrades));
              return personalTrades;
            }
          }
        } catch {}
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sanitize any lingering demo trades from older sessions
    return parsed.filter(
      (t: any) => !t.id?.startsWith("trade_smc_") && !t.id?.startsWith("trade_ict_")
    );
  } catch (err) {
    console.error("Failed to load trades from localStorage", err);
    return [];
  }
}

export function saveTrades(trades: TradeEntry[], userId?: string): void {
  if (typeof window === "undefined") return;
  const safe = userId?.trim();
  if (!safe) return;
  try {
    const key = getTradesKey(safe);
    localStorage.setItem(key, JSON.stringify(trades));
    window.dispatchEvent(new CustomEvent("cycle_journal_updated", { detail: { userId: safe } }));
  } catch (err) {
    console.error("Failed to save trades", err);
  }
}

/**
 * Get the next sequential trade number for a specific journal book
 */
export function getNextTradeNumber(journalBookId: string, userId?: string): number {
  const trades = getStoredTrades(userId).filter((t) => t.journalBookId === journalBookId);
  if (!trades.length) return 1;
  const maxNum = Math.max(...trades.map((t) => t.tradeNumber || 0));
  return maxNum + 1;
}

/**
 * Add a new trade entry
 */
export function addTrade(
  trade: Omit<TradeEntry, "id" | "tradeNumber" | "createdAt">,
  userId?: string
): TradeEntry {
  const trades = getStoredTrades(userId);
  const nextNum = getNextTradeNumber(trade.journalBookId, userId);
  const newTrade: TradeEntry = {
    ...trade,
    id: `trade_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    tradeNumber: nextNum,
    createdAt: new Date().toISOString(),
  };

  const updated = [newTrade, ...trades];
  saveTrades(updated, userId);
  return newTrade;
}

/**
 * Update an existing trade entry
 */
export function updateTrade(trade: TradeEntry, userId?: string): void {
  const trades = getStoredTrades(userId);
  const updated = trades.map((t) => (t.id === trade.id ? { ...trade, updatedAt: new Date().toISOString() } : t));
  saveTrades(updated, userId);
}

/**
 * Delete a trade entry
 */
export function deleteTrade(tradeId: string, userId?: string): void {
  const trades = getStoredTrades(userId);
  const updated = trades.filter((t) => t.id !== tradeId);
  saveTrades(updated, userId);
}

/**
 * Create a new Journal Book
 */
export function createJournalBook(
  data: Omit<JournalBook, "id" | "createdAt">,
  userId?: string
): JournalBook {
  const books = getStoredJournalBooks(userId);
  const newBook: JournalBook = {
    ...data,
    id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [...books, newBook];
  saveJournalBooks(updated, userId);
  return newBook;
}

/**
 * Update a Journal Book
 */
export function updateJournalBook(book: JournalBook, userId?: string): void {
  const books = getStoredJournalBooks(userId);
  const updated = books.map((b) => (b.id === book.id ? book : b));
  saveJournalBooks(updated, userId);
}

/**
 * Delete a Journal Book and its associated trades
 */
export function deleteJournalBook(bookId: string, userId?: string): void {
  const books = getStoredJournalBooks(userId).filter((b) => b.id !== bookId);
  const trades = getStoredTrades(userId).filter((t) => t.journalBookId !== bookId);
  saveJournalBooks(books, userId);
  saveTrades(trades, userId);
}
