import { getUserTrades, getUserJournalBooks } from "../server/db.ts";

async function test() {
  console.log("Testing User 72 (gonpc2645@gmail.com)...");
  const trades72 = await getUserTrades(72);
  console.log("User 72 trades count:", trades72.length);
  trades72.forEach(t => console.log("  Trade:", t.id, t.pair, t.pnl, t.date, "bookId:", t.journalBookId));

  const books72 = await getUserJournalBooks(72);
  console.log("User 72 books count:", books72.length);
  books72.forEach(b => console.log("  Book:", b.id, b.name, b.startingBalance, b.currency));

  console.log("\nTesting User 15 (vprop5136@gmail.com)...");
  const trades15 = await getUserTrades(15);
  console.log("User 15 trades count:", trades15.length);
  trades15.forEach(t => console.log("  Trade:", t.id, t.pair, t.pnl, t.date, "bookId:", t.journalBookId));

  const books15 = await getUserJournalBooks(15);
  console.log("User 15 books count:", books15.length);
  books15.forEach(b => console.log("  Book:", b.id, b.name, b.startingBalance, b.currency));
}

test();
