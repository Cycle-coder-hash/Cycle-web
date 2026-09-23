import { describe, it, expect } from "vitest";
import {
  calculatePositionSize,
  validateCalculatorInput,
  SUPPORTED_INSTRUMENTS,
  DEFAULT_CALCULATOR_INPUT,
} from "../client/src/lib/positionCalculator";

describe("Position Size Calculator Engine", () => {
  it("calculates exact lot size for EUR/USD (Forex $10/pip)", () => {
    // 10,000 balance, 1% risk = $100.
    // 20 pips SL. 1 pip per lot = $10.
    // Risk per lot = 20 * 10 = $200.
    // Standard lots = 100 / 200 = 0.50 lots.
    const result = calculatePositionSize({
      accountBalance: 10000,
      riskPercent: 1.0,
      stopLossPips: 20,
      symbol: "EUR/USD",
    });

    expect(result.isValid).toBe(true);
    expect(result.riskAmount).toBe(100);
    expect(result.standardLots).toBe(0.5);
    expect(result.miniLots).toBe(5);
    expect(result.microLots).toBe(50);
    expect(result.contractUnits).toBe(50000); // 0.5 * 100,000 EUR
    expect(result.balanceAfterLoss).toBe(9900);
  });

  it("calculates exact lot size for Gold (XAU/USD, 100 oz)", () => {
    // 10,000 balance, 2% risk = $200.
    // 30 pips ($3.00 move) SL. Pip value = $10 per pip per lot.
    // Risk per lot = 30 * $10 = $300.
    // Standard lots = 200 / 300 = 0.67 lots.
    const result = calculatePositionSize({
      accountBalance: 10000,
      riskPercent: 2.0,
      stopLossPips: 30,
      symbol: "XAU/USD",
    });

    expect(result.isValid).toBe(true);
    expect(result.riskAmount).toBe(200);
    expect(result.standardLots).toBe(0.67);
    expect(result.contractUnits).toBe(67); // 67 oz
    expect(result.balanceAfterLoss).toBe(9800);

    // Test R:R projections
    expect(result.riskRewardTargets).toHaveLength(4);
    expect(result.riskRewardTargets[0].ratio).toBe("1:1");
    expect(result.riskRewardTargets[0].profitAmount).toBe(200);
    expect(result.riskRewardTargets[1].ratio).toBe("1:2");
    expect(result.riskRewardTargets[1].profitAmount).toBe(400);
    expect(result.riskRewardTargets[2].ratio).toBe("1:3");
    expect(result.riskRewardTargets[2].profitAmount).toBe(600);
  });

  it("calculates index contracts for US30 (1 point = $1)", () => {
    // 25,000 balance, 1% risk = $250.
    // 50 points SL.
    // Risk per lot = 50 * $1 = $50.
    // Standard contracts/lots = 250 / 50 = 5 contracts.
    const result = calculatePositionSize({
      accountBalance: 25000,
      riskPercent: 1.0,
      stopLossPips: 50,
      symbol: "US30",
    });

    expect(result.isValid).toBe(true);
    expect(result.riskAmount).toBe(250);
    expect(result.standardLots).toBe(5);
    expect(result.contractUnits).toBe(5);
  });

  it("calculates JPY cross pairs correctly", () => {
    // 10,000 balance, 1% risk = $100.
    // 25 pips SL on USD/JPY. Pip value ~ $6.67.
    // Risk per lot = 25 * 6.67 = $166.75.
    // Standard lots = 100 / 166.75 ~ 0.60 lots.
    const result = calculatePositionSize({
      accountBalance: 10000,
      riskPercent: 1.0,
      stopLossPips: 25,
      symbol: "USD/JPY",
    });

    expect(result.isValid).toBe(true);
    expect(result.riskAmount).toBe(100);
    expect(result.standardLots).toBe(0.6);
  });

  it("rejects invalid inputs cleanly with validation messages", () => {
    // 1. Zero balance
    const val1 = validateCalculatorInput({
      accountBalance: 0,
      riskPercent: 1,
      stopLossPips: 20,
      symbol: "EUR/USD",
    });
    expect(val1.isValid).toBe(false);
    expect(val1.errors.accountBalance).toBeDefined();

    // 2. Negative risk
    const val2 = validateCalculatorInput({
      accountBalance: 10000,
      riskPercent: -2,
      stopLossPips: 20,
      symbol: "EUR/USD",
    });
    expect(val2.isValid).toBe(false);
    expect(val2.errors.riskPercent).toBeDefined();

    // 3. Excess risk (> 100%)
    const val3 = validateCalculatorInput({
      accountBalance: 10000,
      riskPercent: 120,
      stopLossPips: 20,
      symbol: "EUR/USD",
    });
    expect(val3.isValid).toBe(false);
    expect(val3.errors.riskPercent).toBeDefined();

    // 4. Zero stop loss
    const val4 = validateCalculatorInput({
      accountBalance: 10000,
      riskPercent: 1,
      stopLossPips: 0,
      symbol: "EUR/USD",
    });
    expect(val4.isValid).toBe(false);
    expect(val4.errors.stopLossPips).toBeDefined();

    // 5. Unsupported symbol
    const val5 = validateCalculatorInput({
      accountBalance: 10000,
      riskPercent: 1,
      stopLossPips: 20,
      symbol: "XYZ/INVALID",
    });
    expect(val5.isValid).toBe(false);
    expect(val5.errors.symbol).toBeDefined();
  });
});
