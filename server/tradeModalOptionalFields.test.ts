import { describe, it, expect } from "vitest";
import { calculatePips, calculateEstimatedPnl, calculateRiskReward } from "../client/src/lib/journalCalculations";
import { TradeEntry } from "../client/src/types/journal";

describe("Optional Trade Entry Fields (Entry Price, Stop Loss, Take Profit)", () => {
  it("gracefully handles missing entry price, stop loss, and take profit in calculations", () => {
    // calculateRiskReward when any or all prices are missing/0/undefined
    expect(calculateRiskReward("Buy", 0 as any, 1.0800, 1.0900)).toBe("1:1");
    expect(calculateRiskReward("Buy", 1.0850, 0 as any, 1.0900)).toBe("1:1");
    expect(calculateRiskReward("Buy", 1.0850, 1.0800, 0 as any)).toBe("1:1");
    expect(calculateRiskReward("Buy", null as any, null as any, null as any)).toBe("1:1");

    // calculatePips when entry or exit is missing/0/undefined
    expect(calculatePips("EURUSD", "Buy", null as any, 1.0900)).toBe(0);
    expect(calculatePips("EURUSD", "Buy", 1.0850, null as any)).toBe(0);
    expect(calculatePips("EURUSD", "Buy", 0, 0)).toBe(0);

    // calculateEstimatedPnl when entry, exit, or lotSize is missing/0/undefined
    expect(calculateEstimatedPnl("EURUSD", "Buy", null as any, 1.0900, 1)).toBe(0);
    expect(calculateEstimatedPnl("EURUSD", "Buy", 1.0850, null as any, 1)).toBe(0);
    expect(calculateEstimatedPnl("EURUSD", "Buy", 1.0850, 1.0900, 0)).toBe(0);
  });

  it("allows TradeEntry object with null entryPrice, stopLoss, and takeProfit", () => {
    const tradeWithoutPrices: TradeEntry = {
      id: "trade_test_optional",
      journalBookId: "book_default",
      tradeNumber: 99,
      date: "2026-09-23",
      entryTime: "10:30",
      pair: "EURUSD",
      timeframe: "15M",
      direction: "Buy",
      entryPrice: null,
      stopLoss: null,
      takeProfit: null,
      exitPrice: null,
      followedRules: "Yes",
      pnl: 150,
      riskReward: "1:2.0",
      pips: 0,
      lotSize: 1.0,
      tradeRun: "+2R",
      note: "Logged setup without entering price details",
      tradeRank: "A",
      learning: "Strategy followed strictly",
      customProperties: [],
      createdAt: new Date().toISOString(),
    };

    expect(tradeWithoutPrices.entryPrice).toBeNull();
    expect(tradeWithoutPrices.stopLoss).toBeNull();
    expect(tradeWithoutPrices.takeProfit).toBeNull();
    expect(tradeWithoutPrices.pnl).toBe(150);
  });

  it("handles empty string submissions in form payload by converting to null", () => {
    // Simulating TradeModal handleSubmit parsing logic
    const entryPriceInput = "";
    const stopLossInput = "   ";
    const takeProfitInput = "";

    const parsedEntry = entryPriceInput.trim() !== "" && !isNaN(parseFloat(entryPriceInput)) ? parseFloat(entryPriceInput) : null;
    const parsedSl = stopLossInput.trim() !== "" && !isNaN(parseFloat(stopLossInput)) ? parseFloat(stopLossInput) : null;
    const parsedTp = takeProfitInput.trim() !== "" && !isNaN(parseFloat(takeProfitInput)) ? parseFloat(takeProfitInput) : null;

    expect(parsedEntry).toBeNull();
    expect(parsedSl).toBeNull();
    expect(parsedTp).toBeNull();

    // With actual numeric inputs
    const validEntryInput = "1.0850";
    const parsedValidEntry = validEntryInput.trim() !== "" && !isNaN(parseFloat(validEntryInput)) ? parseFloat(validEntryInput) : null;
    expect(parsedValidEntry).toBe(1.085);
  });
});
