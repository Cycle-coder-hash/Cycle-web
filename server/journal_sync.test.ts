import "dotenv/config";
process.env.TEST_LIVE_DB = "true";
import { describe, it, expect } from "vitest";
import {
  getUserTrades,
  getUserJournalBooks,
  saveUserJournalBooks,
  syncUserTrades,
  resolveUserCanonicalAndDerived,
  getUserNotebook,
  saveUserNotebook,
} from "./db";

describe("Cross-Device Journal & Identity Synchronization", () => {
  it("resolves canonical and derived IDs consistently for a user", async () => {
    // User 72 (gonpc2645@gmail.com, derived ID 4143662)
    const res72 = await resolveUserCanonicalAndDerived(72);
    expect(res72.canonicalId).toBe(72);
    expect(res72.derivedId).toBe(4143662);

    // If derived ID is passed, it correctly maps to canonical ID 72
    const resDerived = await resolveUserCanonicalAndDerived(4143662);
    expect(resDerived.canonicalId).toBe(72);
    expect(resDerived.derivedId).toBe(4143662);
  });

  it("rescues and unifies trades across canonical and derived IDs", async () => {
    // User 72's trades were previously saved under derived ID 4143662
    const trades = await getUserTrades(72);
    expect(trades.length).toBeGreaterThanOrEqual(3);

    const trade = trades.find((t) => t.id === "trade_1789661658013_jgz7o");
    expect(trade).toBeDefined();
    expect(trade.pair).toBe("XAUUSD");
    expect(trade.journalBookId).toBe("book_1789659387211_okoar");
  });

  it("auto-heals and reconstructs JournalBooks for existing trades", async () => {
    const books = await getUserJournalBooks(72);
    expect(books.length).toBeGreaterThanOrEqual(1);

    const book = books.find((b) => b.id === "book_1789659387211_okoar");
    expect(book).toBeDefined();
    expect(book?.name).toBe("Gggg"); // Rescued from user_journal_config_72
    expect(book?.startingBalance).toBe(10000);
  });

  it("protects existing server trades from being wiped by an empty client sync", async () => {
    const beforeTrades = await getUserTrades(72);
    expect(beforeTrades.length).toBeGreaterThanOrEqual(3);

    // Simulate a fresh mobile device login sending trades: [] on initial mount
    const syncRes = await syncUserTrades(72, []);
    expect(syncRes).toBe(true);

    const afterTrades = await getUserTrades(72);
    // Trades must NOT have been wiped to 0
    expect(afterTrades.length).toBe(beforeTrades.length);
  });

  it("supports creating and syncing JournalBooks across devices", async () => {
    const testBook = {
      id: "book_test_sync_123",
      name: "Scalping Playbook",
      strategy: "London Breakout",
      startingBalance: 25000,
      currency: "$",
      rules: [{ id: "r1", text: "Risk max 0.5% per trade." }],
      createdAt: new Date().toISOString(),
      description: "Test book for cross-device synchronization",
    };

    const currentBooks = await getUserJournalBooks(72);
    await saveUserJournalBooks(72, [...currentBooks, testBook]);

    const refreshedBooks = await getUserJournalBooks(72);
    const found = refreshedBooks.find((b) => b.id === "book_test_sync_123");
    expect(found).toBeDefined();
    expect(found?.name).toBe("Scalping Playbook");
    expect(found?.startingBalance).toBe(25000);

    // Clean up test book
    await saveUserJournalBooks(72, currentBooks);
  });

  it("persists and synchronizes Trader Notebook data across devices", async () => {
    const testNotebook = {
      templates: [
        {
          id: "tmpl_test_sync",
          userId: "72",
          name: "Test Sync Template",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pages: [
        {
          id: "page_test_sync",
          notebookId: "tmpl_test_sync",
          parentPageId: null,
          title: "Cross Device Test Page",
          blocks: [
            {
              id: "b_1",
              type: "text",
              content: "Synced block across devices",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      activeTemplateId: "tmpl_test_sync",
      activePageId: "page_test_sync",
    };

    await saveUserNotebook(72, testNotebook);
    const retrieved = await getUserNotebook(72);
    expect(retrieved).toBeDefined();
    expect(retrieved.templates[0].id).toBe("tmpl_test_sync");
    expect(retrieved.pages[0].title).toBe("Cross Device Test Page");
  });
});
