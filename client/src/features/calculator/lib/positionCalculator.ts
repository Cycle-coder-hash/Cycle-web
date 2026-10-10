/**
 * Institutional Position Size & Risk Calculation Engine
 * Designed for Cycle of Chart Trader Dashboard
 */

export interface InstrumentSpec {
  symbol: string;
  name: string;
  category: "forex" | "metals" | "indices" | "crypto" | "commodities";
  baseCurrency: string;
  quoteCurrency: string;
  pipSize: number; // The price increment for 1 pip / 1 point
  pipMultiplier: number; // e.g. 10000 for standard forex, 100 for JPY, 10 for Gold
  tickSize: number; // Minimum price increment (tick)
  tickValue: number; // Value of 1 tick per 1 standard lot in quote currency (contractSize * tickSize)
  quoteToUsdRate: number; // Conversion multiplier from quoteCurrency to USD (1.0 when quoteCurrency === "USD")
  pipValuePerStandardLot: number; // In USD per 1 standard lot
  contractSize: number; // Units in 1 standard lot (e.g. 100,000 for Forex, 100 for Gold)
  minLot: number; // Broker minimum tradable lot size
  maxLot: number; // Broker maximum tradable lot size
  lotStep: number; // Broker lot step increment
  unitName: string; // e.g. "Units", "Troy Oz", "Contracts", "Coins", "Barrels"
  description: string;
  pipDefinition: string; // Helpful explanation, e.g. "1 pip = $0.10 price move"
}

export const SUPPORTED_INSTRUMENTS: InstrumentSpec[] = [
  // CRT Core & Metals
  {
    symbol: "XAU/USD",
    name: "Gold / US Dollar",
    category: "metals",
    baseCurrency: "XAU",
    quoteCurrency: "USD",
    pipSize: 0.1,
    pipMultiplier: 10,
    tickSize: 0.01,
    tickValue: 1.0,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 10.0,
    contractSize: 100,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Troy Oz",
    description: "Gold (100 oz per lot). 1 pip = $0.10 price move ($10/pip per lot).",
    pipDefinition: "1 pip = $0.10 price change (10 pips = $1.00 move = $100/lot)",
  },
  {
    symbol: "XAG/USD",
    name: "Silver / US Dollar",
    category: "metals",
    baseCurrency: "XAG",
    quoteCurrency: "USD",
    pipSize: 0.01,
    pipMultiplier: 100,
    tickSize: 0.001,
    tickValue: 5.0,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 50.0,
    contractSize: 5000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Troy Oz",
    description: "Silver (5,000 oz per lot). 1 pip = $0.01 price move ($50/pip per lot).",
    pipDefinition: "1 pip = $0.01 price change ($50/lot)",
  },
  {
    symbol: "USOIL",
    name: "WTI Crude Oil",
    category: "commodities",
    baseCurrency: "WTI",
    quoteCurrency: "USD",
    pipSize: 0.01,
    pipMultiplier: 100,
    tickSize: 0.01,
    tickValue: 10.0,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 10.0,
    contractSize: 1000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Barrels",
    description: "US Crude Oil (1,000 barrels per lot). 1 pip = $0.01 price move.",
    pipDefinition: "1 pip = $0.01 price change ($10/lot)",
  },

  // Forex Majors
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "forex",
    baseCurrency: "EUR",
    quoteCurrency: "USD",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    tickSize: 0.00001,
    tickValue: 1.0,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 10.0,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "Standard Forex (100,000 EUR per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change ($10/lot)",
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    category: "forex",
    baseCurrency: "GBP",
    quoteCurrency: "USD",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    tickSize: 0.00001,
    tickValue: 1.0,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 10.0,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "Standard Forex (100,000 GBP per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change ($10/lot)",
  },
  {
    symbol: "AUD/USD",
    name: "Australian Dollar / US Dollar",
    category: "forex",
    baseCurrency: "AUD",
    quoteCurrency: "USD",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    tickSize: 0.00001,
    tickValue: 1.0,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 10.0,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "Standard Forex (100,000 AUD per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change ($10/lot)",
  },
  {
    symbol: "NZD/USD",
    name: "New Zealand Dollar / US Dollar",
    category: "forex",
    baseCurrency: "NZD",
    quoteCurrency: "USD",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    tickSize: 0.00001,
    tickValue: 1.0,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 10.0,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "Standard Forex (100,000 NZD per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change ($10/lot)",
  },

  // Forex Crosses & JPY
  {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    category: "forex",
    baseCurrency: "USD",
    quoteCurrency: "JPY",
    pipSize: 0.01,
    pipMultiplier: 100,
    tickSize: 0.001,
    tickValue: 100.0, // 100,000 * 0.001 = 100 JPY per tick
    quoteToUsdRate: 0.00667, // ~1 / 150 JPY per USD
    pipValuePerStandardLot: 6.67, // 1,000 JPY * 0.00667 = $6.67
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "JPY Pair (100,000 USD per lot). 1 pip = 0.01 (~$6.67/lot).",
    pipDefinition: "1 pip = 0.01 price change (~$6.67/lot at ~150 JPY rate)",
  },
  {
    symbol: "EUR/JPY",
    name: "Euro / Japanese Yen",
    category: "forex",
    baseCurrency: "EUR",
    quoteCurrency: "JPY",
    pipSize: 0.01,
    pipMultiplier: 100,
    tickSize: 0.001,
    tickValue: 100.0,
    quoteToUsdRate: 0.00667,
    pipValuePerStandardLot: 6.67,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "JPY Cross (100,000 EUR per lot). 1 pip = 0.01.",
    pipDefinition: "1 pip = 0.01 price change (~$6.67/lot)",
  },
  {
    symbol: "GBP/JPY",
    name: "British Pound / Japanese Yen",
    category: "forex",
    baseCurrency: "GBP",
    quoteCurrency: "JPY",
    pipSize: 0.01,
    pipMultiplier: 100,
    tickSize: 0.001,
    tickValue: 100.0,
    quoteToUsdRate: 0.00667,
    pipValuePerStandardLot: 6.67,
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "JPY Cross (100,000 GBP per lot). 1 pip = 0.01.",
    pipDefinition: "1 pip = 0.01 price change (~$6.67/lot)",
  },
  {
    symbol: "USD/CAD",
    name: "US Dollar / Canadian Dollar",
    category: "forex",
    baseCurrency: "USD",
    quoteCurrency: "CAD",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    tickSize: 0.00001,
    tickValue: 1.0, // 100,000 * 0.00001 = 1 CAD per tick
    quoteToUsdRate: 0.735, // ~1 / 1.36 CAD per USD
    pipValuePerStandardLot: 7.35, // 10 CAD * 0.735 = $7.35
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "CAD Pair (100,000 USD per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change (~$7.35/lot at 1.36 CAD)",
  },
  {
    symbol: "USD/CHF",
    name: "US Dollar / Swiss Franc",
    category: "forex",
    baseCurrency: "USD",
    quoteCurrency: "CHF",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    tickSize: 0.00001,
    tickValue: 1.0, // 100,000 * 0.00001 = 1 CHF per tick
    quoteToUsdRate: 1.136, // ~1 / 0.88 CHF per USD
    pipValuePerStandardLot: 11.36, // 10 CHF * 1.136 = $11.36
    contractSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Units",
    description: "CHF Pair (100,000 USD per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change (~$11.36/lot at 0.88 CHF)",
  },

  // Major Indices
  {
    symbol: "US30",
    name: "Dow Jones Industrial Average (DJ30)",
    category: "indices",
    baseCurrency: "US30",
    quoteCurrency: "USD",
    pipSize: 1.0,
    pipMultiplier: 1,
    tickSize: 0.1,
    tickValue: 0.1,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 1.0, // 1 point = $1 per 1 standard contract
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Contracts",
    description: "Wall Street 30 Index. 1 point index move = $1.00 per contract.",
    pipDefinition: "1 point = 1.0 index point move ($1.00/contract)",
  },
  {
    symbol: "NAS100",
    name: "Nasdaq 100 (US Tech 100)",
    category: "indices",
    baseCurrency: "NAS100",
    quoteCurrency: "USD",
    pipSize: 1.0,
    pipMultiplier: 1,
    tickSize: 0.1,
    tickValue: 0.1,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 1.0,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Contracts",
    description: "US Tech 100 Index. 1 point index move = $1.00 per contract.",
    pipDefinition: "1 point = 1.0 index point move ($1.00/contract)",
  },
  {
    symbol: "SPX500",
    name: "S&P 500 (US 500)",
    category: "indices",
    baseCurrency: "SPX500",
    quoteCurrency: "USD",
    pipSize: 1.0,
    pipMultiplier: 1,
    tickSize: 0.1,
    tickValue: 0.1,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 1.0,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Contracts",
    description: "US 500 Index. 1 point index move = $1.00 per contract.",
    pipDefinition: "1 point = 1.0 index point move ($1.00/contract)",
  },
  {
    symbol: "GER40",
    name: "DAX 40 (Germany 40)",
    category: "indices",
    baseCurrency: "GER40",
    quoteCurrency: "EUR",
    pipSize: 1.0,
    pipMultiplier: 1,
    tickSize: 0.1,
    tickValue: 0.1, // 0.1 EUR per 0.1 tick -> 1.0 EUR per point
    quoteToUsdRate: 1.08, // €1.00 = $1.08 USD
    pipValuePerStandardLot: 1.08,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "Contracts",
    description: "German DAX 40. 1 point move = €1.00 (~$1.08 per contract).",
    pipDefinition: "1 point = 1.0 index point move (~$1.08/contract)",
  },

  // Crypto
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    category: "crypto",
    baseCurrency: "BTC",
    quoteCurrency: "USD",
    pipSize: 1.0,
    pipMultiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 1.0,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "BTC Coins",
    description: "Bitcoin contract (1 BTC per 1 lot). 1 point ($1 move) = $1.00.",
    pipDefinition: "1 point = $1.00 price move ($1.00/BTC)",
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    category: "crypto",
    baseCurrency: "ETH",
    quoteCurrency: "USD",
    pipSize: 1.0,
    pipMultiplier: 1,
    tickSize: 0.01,
    tickValue: 0.01,
    quoteToUsdRate: 1.0,
    pipValuePerStandardLot: 1.0,
    contractSize: 1,
    minLot: 0.01,
    maxLot: 100,
    lotStep: 0.01,
    unitName: "ETH Coins",
    description: "Ethereum contract (1 ETH per 1 lot). 1 point ($1 move) = $1.00.",
    pipDefinition: "1 point = $1.00 price move ($1.00/ETH)",
  },
];

export interface PositionCalculatorInput {
  accountBalance: number;
  riskPercent: number;
  stopLossPips: number;
  symbol: string;
  accountCurrency?: string;
  quoteToAccountRate?: number;
  instrumentSpec?: InstrumentSpec;
}

export interface PositionCalculatorResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
  isBelowMinLot?: boolean;
  isAboveMaxLot?: boolean;
  rawLots: number;
  standardLots: number;
  miniLots: number;
  microLots: number;
  contractUnits: number;
  unitName: string;
  riskAmount: number;
  actualRiskAmount: number;
  monetaryLossPerLot: number;
  balanceAfterLoss: number;
  pipValuePerLot: number;
  instrument: InstrumentSpec;
  riskRewardTargets: {
    ratio: string;
    targetPips: number;
    profitAmount: number;
    projectedBalance: number;
  }[];
}

export const DEFAULT_CALCULATOR_INPUT: PositionCalculatorInput = {
  accountBalance: 10000,
  riskPercent: 1.0,
  stopLossPips: 20,
  symbol: "XAU/USD",
};

export const QUICK_RISK_PRESETS = [0.5, 1, 2, 3, 5] as const;

/**
 * Determine the number of decimal places for a given lot step (e.g. 0.01 -> 2)
 */
export function getLotStepDecimals(lotStep: number): number {
  if (!Number.isFinite(lotStep) || lotStep <= 0) return 2;
  const str = lotStep.toString();
  if (str.includes("e-")) {
    return parseInt(str.split("e-")[1], 10) || 2;
  }
  const parts = str.split(".");
  return parts.length > 1 ? parts[1].length : 0;
}

/**
 * Round a raw lot size DOWN to the nearest valid broker lot step
 * so that the resulting position never exceeds the intended risk amount.
 */
export function roundDownToLotStep(rawLots: number, lotStep: number): number {
  if (!Number.isFinite(rawLots) || rawLots <= 0 || !Number.isFinite(lotStep) || lotStep <= 0) {
    return 0;
  }
  const decimals = getLotStepDecimals(lotStep);
  // Add tiny epsilon (1e-9) to guard against IEEE 754 representation like 0.07 / 0.01 = 6.999999999999999
  const steps = Math.floor((rawLots + 1e-9) / lotStep);
  return Number((steps * lotStep).toFixed(decimals));
}

/**
 * Validate instrument contract specifications and currency conversion data
 */
export function validateInstrumentSpec(
  instrument: InstrumentSpec | undefined,
  accountCurrency: string = "USD",
  quoteToAccountRate?: number
): {
  isValid: boolean;
  error?: string;
  pipValuePerLot: number;
} {
  if (!instrument) {
    return {
      isValid: false,
      error: "The selected trading instrument is not currently supported.",
      pipValuePerLot: 0,
    };
  }

  if (
    !Number.isFinite(instrument.contractSize) ||
    instrument.contractSize <= 0 ||
    !Number.isFinite(instrument.pipSize) ||
    instrument.pipSize <= 0 ||
    !Number.isFinite(instrument.tickSize) ||
    instrument.tickSize <= 0 ||
    !Number.isFinite(instrument.tickValue) ||
    instrument.tickValue <= 0
  ) {
    return {
      isValid: false,
      error: `Accurate calculation is not possible for ${instrument.symbol || "this instrument"}: missing or invalid contract specifications.`,
      pipValuePerLot: 0,
    };
  }

  if (
    !Number.isFinite(instrument.lotStep) ||
    instrument.lotStep <= 0 ||
    !Number.isFinite(instrument.minLot) ||
    instrument.minLot <= 0 ||
    !Number.isFinite(instrument.maxLot) ||
    instrument.maxLot < instrument.minLot
  ) {
    return {
      isValid: false,
      error: `Accurate calculation is not possible for ${instrument.symbol}: invalid broker lot step or lot size limits.`,
      pipValuePerLot: 0,
    };
  }

  if (!instrument.quoteCurrency || typeof instrument.quoteCurrency !== "string") {
    return {
      isValid: false,
      error: `Accurate calculation is not possible for ${instrument.symbol}: quote currency is not specified.`,
      pipValuePerLot: 0,
    };
  }

  // Determine conversion rate from instrument quoteCurrency to accountCurrency
  let conversionRate: number | undefined = quoteToAccountRate;
  if (conversionRate === undefined) {
    if (instrument.quoteCurrency === accountCurrency) {
      conversionRate = 1.0;
    } else if (accountCurrency === "USD") {
      conversionRate = instrument.quoteToUsdRate;
    }
  }

  if (conversionRate === undefined || !Number.isFinite(conversionRate) || conversionRate <= 0) {
    return {
      isValid: false,
      error: `Accurate calculation is not possible for ${instrument.symbol}: currency conversion rate from ${instrument.quoteCurrency} to ${accountCurrency} is unavailable.`,
      pipValuePerLot: 0,
    };
  }

  // Calculate pip value in quote currency from contract specifications:
  // ticksPerPip = pipSize / tickSize
  // expectedTickValueInQuote = contractSize * tickSize
  const ticksPerPip = instrument.pipSize / instrument.tickSize;
  const expectedTickValueInQuote = instrument.contractSize * instrument.tickSize;
  const tickValueInQuote =
    Math.abs(instrument.tickValue - expectedTickValueInQuote) > 1e-9 && instrument.contractSize === 1
      ? instrument.tickValue
      : expectedTickValueInQuote;

  const pipValueInQuote = ticksPerPip * tickValueInQuote;
  const pipValuePerLot = Number((pipValueInQuote * conversionRate).toFixed(6));

  if (!Number.isFinite(pipValuePerLot) || pipValuePerLot <= 0) {
    return {
      isValid: false,
      error: `Accurate calculation is not possible for ${instrument.symbol}: computed pip value is invalid.`,
      pipValuePerLot: 0,
    };
  }

  return {
    isValid: true,
    pipValuePerLot,
  };
}

/**
 * Validate calculator input fields
 */
export function validateCalculatorInput(input: Partial<PositionCalculatorInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (
    input.accountBalance === undefined ||
    input.accountBalance === null ||
    !Number.isFinite(input.accountBalance)
  ) {
    errors.accountBalance = "Please enter your account balance.";
  } else if (input.accountBalance <= 0) {
    errors.accountBalance = "Account balance must be greater than zero.";
  }

  if (
    input.riskPercent === undefined ||
    input.riskPercent === null ||
    !Number.isFinite(input.riskPercent)
  ) {
    errors.riskPercent = "Please enter a risk percentage.";
  } else if (input.riskPercent <= 0) {
    errors.riskPercent = "Risk percentage must be greater than 0%.";
  } else if (input.riskPercent > 100) {
    errors.riskPercent = "Risk percentage cannot exceed 100%.";
  }

  if (
    input.stopLossPips === undefined ||
    input.stopLossPips === null ||
    !Number.isFinite(input.stopLossPips)
  ) {
    errors.stopLossPips = "Please enter your stop-loss distance in pips or points.";
  } else if (input.stopLossPips <= 0) {
    errors.stopLossPips = "Stop loss must be greater than zero.";
  }

  const inst =
    input.instrumentSpec ??
    (input.symbol ? SUPPORTED_INSTRUMENTS.find((i) => i.symbol === input.symbol) : undefined);

  if (!input.symbol && !input.instrumentSpec) {
    errors.symbol = "Please select a trading instrument.";
  } else if (!inst) {
    errors.symbol = "The selected trading instrument is not currently supported.";
  } else {
    const specCheck = validateInstrumentSpec(
      inst,
      input.accountCurrency || "USD",
      input.quoteToAccountRate
    );
    if (!specCheck.isValid && specCheck.error) {
      errors.symbol = specCheck.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculate exact position size and risk metrics from instrument contract specifications
 *
 * Core Formula:
 *   Risk Amount = Account Balance * Risk Percentage / 100
 *   Monetary Loss at Stop Loss for 1 Standard Lot = Stop Loss Pips * Pip Value per Standard Lot
 *   Position Size (Lots) = Risk Amount / Monetary Loss at Stop Loss for 1 Standard Lot
 *   Final Position Size = Rounded down to nearest valid lotStep
 */
export function calculatePositionSize(input: PositionCalculatorInput): PositionCalculatorResult {
  const validation = validateCalculatorInput(input);
  const instrument =
    input.instrumentSpec ??
    SUPPORTED_INSTRUMENTS.find((i) => i.symbol === input.symbol) ??
    SUPPORTED_INSTRUMENTS[0];

  const specValidation = validateInstrumentSpec(
    input.instrumentSpec ?? SUPPORTED_INSTRUMENTS.find((i) => i.symbol === input.symbol),
    input.accountCurrency || "USD",
    input.quoteToAccountRate
  );

  const safeBalance =
    Number.isFinite(input.accountBalance) && input.accountBalance > 0 ? input.accountBalance : 0;

  if (!validation.isValid || !specValidation.isValid) {
    const firstErr =
      Object.values(validation.errors)[0] ||
      specValidation.error ||
      "Invalid calculation parameters.";
    return {
      isValid: false,
      errorMessage: firstErr,
      rawLots: 0,
      standardLots: 0,
      miniLots: 0,
      microLots: 0,
      contractUnits: 0,
      unitName: instrument.unitName,
      riskAmount: 0,
      actualRiskAmount: 0,
      monetaryLossPerLot: 0,
      balanceAfterLoss: safeBalance,
      pipValuePerLot: specValidation.isValid ? specValidation.pipValuePerLot : 0,
      instrument,
      riskRewardTargets: [],
    };
  }

  const { accountBalance, riskPercent, stopLossPips } = input;
  const pipValuePerLot = specValidation.pipValuePerLot;

  // 1. Exact Risk Amount = Account Balance * Risk Percentage / 100
  const exactRiskAmount = (accountBalance * riskPercent) / 100;
  const riskAmount = Number(exactRiskAmount.toFixed(2));

  // 2. Monetary Loss at Stop Loss for 1 Standard Lot
  const monetaryLossPerLot = stopLossPips * pipValuePerLot;

  // 3. Raw Position Size (Lots) = Risk Amount / Monetary Loss at Stop Loss for 1 Standard Lot
  const rawLots = monetaryLossPerLot > 0 ? exactRiskAmount / monetaryLossPerLot : 0;

  // 4. Check if calculated position size is below the minimum tradable lot size
  if (rawLots + 1e-9 < instrument.minLot) {
    const belowMinWarning =
      "Calculated position size is below the minimum lot size. Reduce risk or adjust the stop-loss distance.";
    return {
      isValid: false,
      isBelowMinLot: true,
      errorMessage: belowMinWarning,
      warningMessage: belowMinWarning,
      rawLots: Number(rawLots.toFixed(6)),
      standardLots: 0,
      miniLots: 0,
      microLots: 0,
      contractUnits: 0,
      unitName: instrument.unitName,
      riskAmount,
      actualRiskAmount: 0,
      monetaryLossPerLot: Number(monetaryLossPerLot.toFixed(4)),
      balanceAfterLoss: Number(accountBalance.toFixed(2)),
      pipValuePerLot,
      instrument,
      riskRewardTargets: [],
    };
  }

  // 5. Round DOWN to nearest valid broker lot step so risk is never exceeded due to rounding
  let standardLots = roundDownToLotStep(rawLots, instrument.lotStep);
  let isAboveMaxLot = false;
  let warningMessage: string | undefined;

  // 6. Respect maximum broker lot limit
  if (standardLots > instrument.maxLot) {
    standardLots = roundDownToLotStep(instrument.maxLot, instrument.lotStep);
    isAboveMaxLot = true;
    warningMessage = `Calculated position size (${rawLots.toFixed(2)} lots) exceeds the maximum lot size (${instrument.maxLot} lots) and has been capped at ${standardLots.toFixed(getLotStepDecimals(instrument.lotStep))} lots.`;
  }

  const miniLots = Number((standardLots * 10).toFixed(2));
  const microLots = Number((standardLots * 100).toFixed(2));
  const contractUnits = Number((standardLots * instrument.contractSize).toFixed(4));

  // 7. Actual monetary loss at stop loss for the rounded lot size (never exceeds intended risk)
  const actualRiskAmount = Number((standardLots * monetaryLossPerLot).toFixed(2));

  // 8. Balance After Stop Loss (mathematically consistent with the calculated position size)
  const balanceAfterLoss = Math.max(0, Number((accountBalance - actualRiskAmount).toFixed(2)));

  // 9. Projected Risk-to-Reward targets (1:1, 1:2, 1:3, 1:5 CRT Expansion)
  const rrMultipliers = [
    { ratio: "1:1", mult: 1 },
    { ratio: "1:2", mult: 2 },
    { ratio: "1:3", mult: 3 },
    { ratio: "1:5", mult: 5 },
  ];

  const riskRewardTargets = rrMultipliers.map(({ ratio, mult }) => {
    const profitAmount = Number((actualRiskAmount * mult).toFixed(2));
    const targetPips = Number((stopLossPips * mult).toFixed(1));
    const projectedBalance = Number((accountBalance + profitAmount).toFixed(2));
    return {
      ratio,
      targetPips,
      profitAmount,
      projectedBalance,
    };
  });

  return {
    isValid: true,
    warningMessage,
    isBelowMinLot: false,
    isAboveMaxLot,
    rawLots: Number(rawLots.toFixed(6)),
    standardLots,
    miniLots,
    microLots,
    contractUnits,
    unitName: instrument.unitName,
    riskAmount,
    actualRiskAmount,
    monetaryLossPerLot: Number(monetaryLossPerLot.toFixed(4)),
    balanceAfterLoss,
    pipValuePerLot,
    instrument,
    riskRewardTargets,
  };
}
