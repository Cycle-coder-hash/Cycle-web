import { describe, it, expect } from "vitest";
import {
  SUPPORTED_INSTRUMENTS,
  InstrumentSpec,
  calculatePositionSize,
  validateCalculatorInput,
  validateInstrumentSpec,
  roundDownToLotStep,
} from "./positionCalculator";

describe("Position Size & Risk Calculator Engine", () => {
  describe("1. Core Formula & XAU/USD Verification", () => {
    it("calculates XAU/USD position size from actual contract specifications ($1,000 balance, 1% risk, 20 pips SL)", () => {
      const result = calculatePositionSize({
        accountBalance: 1000,
        riskPercent: 1,
        stopLossPips: 20,
        symbol: "XAU/USD",
      });

      expect(result.isValid).toBe(true);
      expect(result.riskAmount).toBe(10); // $1,000 * 1% = $10
      expect(result.pipValuePerLot).toBe(10); // 100 oz * $0.10 pip = $10/pip/lot
      expect(result.monetaryLossPerLot).toBe(200); // 20 pips * $10/pip = $200/lot
      expect(result.rawLots).toBe(0.05); // $10 / $200 = 0.05 lots
      expect(result.standardLots).toBe(0.05);
      expect(result.miniLots).toBe(0.5);
      expect(result.microLots).toBe(5);
      expect(result.contractUnits).toBe(5); // 0.05 lots * 100 Troy Oz = 5 Troy Oz
      expect(result.actualRiskAmount).toBe(10);
      expect(result.balanceAfterLoss).toBe(990);
    });

    it("calculates 0.01 lots when XAU/USD stop loss is 100 pips on $1,000 balance at 1% risk", () => {
      const result = calculatePositionSize({
        accountBalance: 1000,
        riskPercent: 1,
        stopLossPips: 100,
        symbol: "XAU/USD",
      });

      expect(result.isValid).toBe(true);
      expect(result.riskAmount).toBe(10);
      expect(result.monetaryLossPerLot).toBe(1000);
      expect(result.standardLots).toBe(0.01);
      expect(result.actualRiskAmount).toBe(10);
      expect(result.balanceAfterLoss).toBe(990);
    });

    it("calculates 0.50 lots for default parameters ($10,000 balance, 1% risk, 20 pips SL on XAU/USD)", () => {
      const result = calculatePositionSize({
        accountBalance: 10000,
        riskPercent: 1,
        stopLossPips: 20,
        symbol: "XAU/USD",
      });

      expect(result.isValid).toBe(true);
      expect(result.riskAmount).toBe(100);
      expect(result.standardLots).toBe(0.5);
      expect(result.miniLots).toBe(5);
      expect(result.microLots).toBe(50);
      expect(result.contractUnits).toBe(50); // 50 Troy Oz
      expect(result.actualRiskAmount).toBe(100);
      expect(result.balanceAfterLoss).toBe(9900);
    });
  });

  describe("2. Proportional Scaling Laws", () => {
    it("doubles the position size when account balance is doubled (all else constant)", () => {
      const base = calculatePositionSize({
        accountBalance: 2000,
        riskPercent: 1,
        stopLossPips: 25,
        symbol: "EUR/USD",
      });
      const doubled = calculatePositionSize({
        accountBalance: 4000,
        riskPercent: 1,
        stopLossPips: 25,
        symbol: "EUR/USD",
      });

      expect(base.isValid).toBe(true);
      expect(doubled.isValid).toBe(true);
      expect(base.standardLots).toBe(0.08); // $20 / $250 = 0.08
      expect(doubled.standardLots).toBe(0.16); // $40 / $250 = 0.16
      expect(doubled.standardLots).toBeCloseTo(base.standardLots * 2, 5);
    });

    it("doubles the position size when risk percentage is doubled (all else constant)", () => {
      const base = calculatePositionSize({
        accountBalance: 5000,
        riskPercent: 1,
        stopLossPips: 20,
        symbol: "GBP/USD",
      });
      const doubled = calculatePositionSize({
        accountBalance: 5000,
        riskPercent: 2,
        stopLossPips: 20,
        symbol: "GBP/USD",
      });

      expect(base.standardLots).toBe(0.25); // $50 / $200 = 0.25
      expect(doubled.standardLots).toBe(0.5); // $100 / $200 = 0.50
      expect(doubled.standardLots).toBeCloseTo(base.standardLots * 2, 5);
    });

    it("halves the position size when stop-loss distance is doubled (all else constant)", () => {
      const base = calculatePositionSize({
        accountBalance: 10000,
        riskPercent: 2,
        stopLossPips: 25,
        symbol: "AUD/USD",
      });
      const doubledSl = calculatePositionSize({
        accountBalance: 10000,
        riskPercent: 2,
        stopLossPips: 50,
        symbol: "AUD/USD",
      });

      expect(base.standardLots).toBe(0.8); // $200 / $250 = 0.80
      expect(doubledSl.standardLots).toBe(0.4); // $200 / $500 = 0.40
      expect(doubledSl.standardLots).toBeCloseTo(base.standardLots / 2, 5);
    });
  });

  describe("3. Instrument-Specific Contract Specifications", () => {
    it("computes distinct position sizes across Metals, Commodities, Forex, Indices, and Crypto", () => {
      const commonInput = {
        accountBalance: 10000,
        riskPercent: 1, // $100 risk
        stopLossPips: 20,
      };

      // XAU/USD: 100 oz, $10/pip -> 20 pips = $200/lot -> $100 / $200 = 0.50 lots (50 oz)
      const gold = calculatePositionSize({ ...commonInput, symbol: "XAU/USD" });
      expect(gold.standardLots).toBe(0.5);
      expect(gold.contractUnits).toBe(50);

      // XAG/USD: 5,000 oz, $50/pip -> 20 pips = $1,000/lot -> $100 / $1,000 = 0.10 lots (500 oz)
      const silver = calculatePositionSize({ ...commonInput, symbol: "XAG/USD" });
      expect(silver.standardLots).toBe(0.1);
      expect(silver.contractUnits).toBe(500);

      // USOIL: 1,000 bbl, $10/pip -> 20 pips = $200/lot -> $100 / $200 = 0.50 lots (500 bbl)
      const oil = calculatePositionSize({ ...commonInput, symbol: "USOIL" });
      expect(oil.standardLots).toBe(0.5);
      expect(oil.contractUnits).toBe(500);

      // EUR/USD: 100,000 units, $10/pip -> 20 pips = $200/lot -> $100 / $200 = 0.50 lots (50,000 units)
      const eurusd = calculatePositionSize({ ...commonInput, symbol: "EUR/USD" });
      expect(eurusd.standardLots).toBe(0.5);
      expect(eurusd.contractUnits).toBe(50000);

      // USD/JPY: 100,000 units, $6.67/pip -> 20 pips = $133.40/lot -> $100 / $133.40 = 0.7496 -> floors to 0.74 lots
      const usdjpy = calculatePositionSize({ ...commonInput, symbol: "USD/JPY" });
      expect(usdjpy.pipValuePerLot).toBe(6.67);
      expect(usdjpy.standardLots).toBe(0.74);

      // USD/CAD: $7.35/pip -> 20 pips = $147/lot -> $100 / $147 = 0.68027 -> floors to 0.68 lots
      const usdcad = calculatePositionSize({ ...commonInput, symbol: "USD/CAD" });
      expect(usdcad.pipValuePerLot).toBe(7.35);
      expect(usdcad.standardLots).toBe(0.68);

      // USD/CHF: $11.36/pip -> 20 pips = $227.20/lot -> $100 / $227.20 = 0.44014 -> floors to 0.44 lots
      const usdchf = calculatePositionSize({ ...commonInput, symbol: "USD/CHF" });
      expect(usdchf.pipValuePerLot).toBe(11.36);
      expect(usdchf.standardLots).toBe(0.44);

      // US30: 1 contract, $1/point -> 20 points = $20/lot -> $100 / $20 = 5.00 lots (5 contracts)
      const us30 = calculatePositionSize({ ...commonInput, symbol: "US30" });
      expect(us30.pipValuePerLot).toBe(1);
      expect(us30.standardLots).toBe(5);
      expect(us30.contractUnits).toBe(5);

      // GER40: 1 contract, €1/point = $1.08/point -> 20 points = $21.60/lot -> $100 / $21.60 = 4.6296 -> floors to 4.62 lots
      const ger40 = calculatePositionSize({ ...commonInput, symbol: "GER40" });
      expect(ger40.pipValuePerLot).toBe(1.08);
      expect(ger40.standardLots).toBe(4.62);

      // BTC/USD: 1 coin, $1/point -> 20 points = $20/lot -> $100 / $20 = 5.00 lots (5 BTC)
      const btcusd = calculatePositionSize({ ...commonInput, symbol: "BTC/USD" });
      expect(btcusd.pipValuePerLot).toBe(1);
      expect(btcusd.standardLots).toBe(5);
      expect(btcusd.contractUnits).toBe(5);
    });

    it("validates all 18 supported instruments in SUPPORTED_INSTRUMENTS", () => {
      for (const inst of SUPPORTED_INSTRUMENTS) {
        const specCheck = validateInstrumentSpec(inst);
        expect(specCheck.isValid).toBe(true);
        expect(specCheck.pipValuePerLot).toBeCloseTo(inst.pipValuePerStandardLot, 4);

        const res = calculatePositionSize({
          accountBalance: 25000,
          riskPercent: 1,
          stopLossPips: 25,
          symbol: inst.symbol,
        });
        expect(res.isValid).toBe(true);
        expect(res.standardLots).toBeGreaterThanOrEqual(inst.minLot);
        expect(res.actualRiskAmount).toBeLessThanOrEqual(res.riskAmount + 1e-6);
      }
    });
  });

  describe("4. Broker Lot Restrictions & Lot Step Rounding", () => {
    it("rounds position size DOWN to nearest lot step so risk is never exceeded", () => {
      // $1,000 * 1% = $10 risk. 30 pips on XAU/USD = $300/lot.
      // Raw lots = 10 / 300 = 0.033333... -> must floor to 0.03
      const res1 = calculatePositionSize({
        accountBalance: 1000,
        riskPercent: 1,
        stopLossPips: 30,
        symbol: "XAU/USD",
      });
      expect(res1.rawLots).toBeCloseTo(0.033333, 5);
      expect(res1.standardLots).toBe(0.03);
      expect(res1.actualRiskAmount).toBe(9); // 0.03 * $300 = $9 <= $10

      // $1,000 * 1% = $10 risk. 55 pips on XAU/USD = $550/lot.
      // Raw lots = 10 / 550 = 0.0181818... -> must floor to 0.01 (NOT round up to 0.02!)
      const res2 = calculatePositionSize({
        accountBalance: 1000,
        riskPercent: 1,
        stopLossPips: 55,
        symbol: "XAU/USD",
      });
      expect(res2.rawLots).toBeCloseTo(0.018182, 5);
      expect(res2.standardLots).toBe(0.01);
      expect(res2.actualRiskAmount).toBe(5.5); // 0.01 * $550 = $5.50 <= $10 (0.02 would risk $11 > $10!)
    });

    it("handles IEEE 754 floating-point boundaries accurately (e.g. 0.07 and 0.14 lots)", () => {
      expect(roundDownToLotStep(0.07, 0.01)).toBe(0.07);
      expect(roundDownToLotStep(0.14, 0.01)).toBe(0.14);
      expect(roundDownToLotStep(0.29, 0.01)).toBe(0.29);
      expect(roundDownToLotStep(0.0699, 0.01)).toBe(0.06);
    });

    it("does NOT force 0.01 lots when calculated size is below minimum lot size", () => {
      // $100 balance, 1% risk = $1.00 risk. 20 pips on XAU/USD = $200/lot.
      // Raw lots = $1 / $200 = 0.005 lots < 0.01 minLot.
      const res = calculatePositionSize({
        accountBalance: 100,
        riskPercent: 1,
        stopLossPips: 20,
        symbol: "XAU/USD",
      });

      expect(res.isValid).toBe(false);
      expect(res.isBelowMinLot).toBe(true);
      expect(res.rawLots).toBe(0.005);
      expect(res.standardLots).toBe(0);
      expect(res.riskAmount).toBe(1);
      expect(res.actualRiskAmount).toBe(0);
      expect(res.warningMessage).toContain(
        "Calculated position size is below the minimum lot size"
      );
      expect(res.riskRewardTargets).toEqual([]);
    });

    it("caps position size at instrument maxLot when calculated size exceeds maximum lot limit", () => {
      const res = calculatePositionSize({
        accountBalance: 10_000_000,
        riskPercent: 5, // $500,000 risk
        stopLossPips: 10, // $100/lot on XAU/USD -> 5,000 raw lots > 100 maxLot
        symbol: "XAU/USD",
      });

      expect(res.isValid).toBe(true);
      expect(res.isAboveMaxLot).toBe(true);
      expect(res.standardLots).toBe(100);
      expect(res.warningMessage).toContain("exceeds the maximum lot size");
    });

    it("respects custom lotStep (e.g. 0.05 lot increments)", () => {
      const customSpec: InstrumentSpec = {
        ...SUPPORTED_INSTRUMENTS[0],
        lotStep: 0.05,
        minLot: 0.05,
      };
      // $1,000 balance, 1.4% risk = $14. 20 pips SL = $200/lot. Raw = 0.07 lots -> floors to 0.05
      const res = calculatePositionSize({
        accountBalance: 1000,
        riskPercent: 1.4,
        stopLossPips: 20,
        symbol: "XAU/USD",
        instrumentSpec: customSpec,
      });

      expect(res.isValid).toBe(true);
      expect(res.rawLots).toBe(0.07);
      expect(res.standardLots).toBe(0.05);
    });
  });

  describe("5. Validation & Error Handling", () => {
    it("rejects empty, NaN, zero, or negative inputs safely without NaN or Infinity", () => {
      const invalidCases = [
        { accountBalance: NaN, riskPercent: 1, stopLossPips: 20, symbol: "XAU/USD" },
        { accountBalance: 0, riskPercent: 1, stopLossPips: 20, symbol: "XAU/USD" },
        { accountBalance: -500, riskPercent: 1, stopLossPips: 20, symbol: "XAU/USD" },
        { accountBalance: 1000, riskPercent: 0, stopLossPips: 20, symbol: "XAU/USD" },
        { accountBalance: 1000, riskPercent: -2, stopLossPips: 20, symbol: "XAU/USD" },
        { accountBalance: 1000, riskPercent: 105, stopLossPips: 20, symbol: "XAU/USD" },
        { accountBalance: 1000, riskPercent: 1, stopLossPips: 0, symbol: "XAU/USD" },
        { accountBalance: 1000, riskPercent: 1, stopLossPips: -10, symbol: "XAU/USD" },
        { accountBalance: 1000, riskPercent: 1, stopLossPips: 20, symbol: "" },
        { accountBalance: 1000, riskPercent: 1, stopLossPips: 20, symbol: "INVALID/PAIR" },
      ];

      for (const input of invalidCases) {
        const res = calculatePositionSize(input);
        expect(res.isValid).toBe(false);
        expect(res.errorMessage).toBeTruthy();
        expect(res.standardLots).toBe(0);
        expect(Number.isFinite(res.standardLots)).toBe(true);
        expect(Number.isFinite(res.riskAmount)).toBe(true);
        expect(Number.isFinite(res.balanceAfterLoss)).toBe(true);
        expect(res.riskRewardTargets).toEqual([]);
      }
    });

    it("rejects instruments with missing conversion rate or invalid contract specifications", () => {
      // Non-USD quote currency without conversion rate for non-USD account currency
      const resNoRate = calculatePositionSize({
        accountBalance: 5000,
        riskPercent: 1,
        stopLossPips: 20,
        symbol: "USD/JPY",
        accountCurrency: "GBP", // No GBP conversion rate provided
      });
      expect(resNoRate.isValid).toBe(false);
      expect(resNoRate.errorMessage).toContain("currency conversion rate");
      expect(resNoRate.riskRewardTargets).toEqual([]);

      // Invalid contractSize
      const brokenSpec: InstrumentSpec = {
        ...SUPPORTED_INSTRUMENTS[0],
        contractSize: 0,
      };
      const resBroken = calculatePositionSize({
        accountBalance: 5000,
        riskPercent: 1,
        stopLossPips: 20,
        symbol: "XAU/USD",
        instrumentSpec: brokenSpec,
      });
      expect(resBroken.isValid).toBe(false);
      expect(resBroken.errorMessage).toContain("missing or invalid contract specifications");
    });
  });

  describe("6. Mathematical Consistency of Risk-to-Reward & Balance Projections", () => {
    it("keeps R:R projections and balanceAfterLoss consistent with actual rounded position size", () => {
      const res = calculatePositionSize({
        accountBalance: 1000,
        riskPercent: 1, // $10 max risk
        stopLossPips: 30, // $300/lot -> 0.03 lots -> $9 actual risk
        symbol: "XAU/USD",
      });

      expect(res.standardLots).toBe(0.03);
      expect(res.riskAmount).toBe(10);
      expect(res.actualRiskAmount).toBe(9);
      expect(res.balanceAfterLoss).toBe(991); // 1000 - 9

      expect(res.riskRewardTargets).toEqual([
        { ratio: "1:1", targetPips: 30, profitAmount: 9, projectedBalance: 1009 },
        { ratio: "1:2", targetPips: 60, profitAmount: 18, projectedBalance: 1018 },
        { ratio: "1:3", targetPips: 90, profitAmount: 27, projectedBalance: 1027 },
        { ratio: "1:5", targetPips: 150, profitAmount: 45, projectedBalance: 1045 },
      ]);
    });
  });
});
