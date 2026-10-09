/**
 * Institutional Position Size & Risk Calculation Engine
 * Designed for Cycle of Chart Trader Dashboard
 */

export interface InstrumentSpec {
  symbol: string;
  name: string;
  category: "forex" | "metals" | "indices" | "crypto" | "commodities";
  pipSize: number; // The price increment for 1 pip / 1 point
  pipMultiplier: number; // e.g. 10000 for standard forex, 100 for JPY, 10 for Gold
  pipValuePerStandardLot: number; // In USD per 1 standard lot
  contractSize: number; // Units in 1 standard lot (e.g. 100,000 for Forex, 100 for Gold)
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
    pipSize: 0.1,
    pipMultiplier: 10,
    pipValuePerStandardLot: 10.0,
    contractSize: 100,
    unitName: "Troy Oz",
    description: "Gold (100 oz per lot). 1 pip = $0.10 price move ($10/pip per lot).",
    pipDefinition: "1 pip = $0.10 price change (10 pips = $1.00 move = $100/lot)",
  },
  {
    symbol: "XAG/USD",
    name: "Silver / US Dollar",
    category: "metals",
    pipSize: 0.01,
    pipMultiplier: 100,
    pipValuePerStandardLot: 50.0,
    contractSize: 5000,
    unitName: "Troy Oz",
    description: "Silver (5,000 oz per lot). 1 pip = $0.01 price move ($50/pip per lot).",
    pipDefinition: "1 pip = $0.01 price change ($50/lot)",
  },
  {
    symbol: "USOIL",
    name: "WTI Crude Oil",
    category: "commodities",
    pipSize: 0.01,
    pipMultiplier: 100,
    pipValuePerStandardLot: 10.0,
    contractSize: 1000,
    unitName: "Barrels",
    description: "US Crude Oil (1,000 barrels per lot). 1 pip = $0.01 price move.",
    pipDefinition: "1 pip = $0.01 price change ($10/lot)",
  },

  // Forex Majors
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    pipValuePerStandardLot: 10.0,
    contractSize: 100000,
    unitName: "Units",
    description: "Standard Forex (100,000 EUR per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change ($10/lot)",
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    pipValuePerStandardLot: 10.0,
    contractSize: 100000,
    unitName: "Units",
    description: "Standard Forex (100,000 GBP per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change ($10/lot)",
  },
  {
    symbol: "AUD/USD",
    name: "Australian Dollar / US Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    pipValuePerStandardLot: 10.0,
    contractSize: 100000,
    unitName: "Units",
    description: "Standard Forex (100,000 AUD per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change ($10/lot)",
  },
  {
    symbol: "NZD/USD",
    name: "New Zealand Dollar / US Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    pipValuePerStandardLot: 10.0,
    contractSize: 100000,
    unitName: "Units",
    description: "Standard Forex (100,000 NZD per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change ($10/lot)",
  },

  // Forex Crosses & JPY
  {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    category: "forex",
    pipSize: 0.01,
    pipMultiplier: 100,
    pipValuePerStandardLot: 6.67, // ~$1,000 / 150 JPY rate
    contractSize: 100000,
    unitName: "Units",
    description: "JPY Pair (100,000 USD per lot). 1 pip = 0.01 (~$6.67/lot).",
    pipDefinition: "1 pip = 0.01 price change (~$6.67/lot at ~150 JPY rate)",
  },
  {
    symbol: "EUR/JPY",
    name: "Euro / Japanese Yen",
    category: "forex",
    pipSize: 0.01,
    pipMultiplier: 100,
    pipValuePerStandardLot: 6.67,
    contractSize: 100000,
    unitName: "Units",
    description: "JPY Cross (100,000 EUR per lot). 1 pip = 0.01.",
    pipDefinition: "1 pip = 0.01 price change (~$6.67/lot)",
  },
  {
    symbol: "GBP/JPY",
    name: "British Pound / Japanese Yen",
    category: "forex",
    pipSize: 0.01,
    pipMultiplier: 100,
    pipValuePerStandardLot: 6.67,
    contractSize: 100000,
    unitName: "Units",
    description: "JPY Cross (100,000 GBP per lot). 1 pip = 0.01.",
    pipDefinition: "1 pip = 0.01 price change (~$6.67/lot)",
  },
  {
    symbol: "USD/CAD",
    name: "US Dollar / Canadian Dollar",
    category: "forex",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    pipValuePerStandardLot: 7.35, // ~$10 CAD / 1.36
    contractSize: 100000,
    unitName: "Units",
    description: "CAD Pair (100,000 USD per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change (~$7.35/lot at 1.36 CAD)",
  },
  {
    symbol: "USD/CHF",
    name: "US Dollar / Swiss Franc",
    category: "forex",
    pipSize: 0.0001,
    pipMultiplier: 10000,
    pipValuePerStandardLot: 11.36, // ~$10 CHF / 0.88
    contractSize: 100000,
    unitName: "Units",
    description: "CHF Pair (100,000 USD per lot). 1 pip = 0.0001.",
    pipDefinition: "1 pip = 0.0001 price change (~$11.36/lot at 0.88 CHF)",
  },

  // Major Indices
  {
    symbol: "US30",
    name: "Dow Jones Industrial Average (DJ30)",
    category: "indices",
    pipSize: 1.0,
    pipMultiplier: 1,
    pipValuePerStandardLot: 1.0, // 1 point = $1 per 1 standard contract
    contractSize: 1,
    unitName: "Contracts",
    description: "Wall Street 30 Index. 1 point index move = $1.00 per contract.",
    pipDefinition: "1 point = 1.0 index point move ($1.00/contract)",
  },
  {
    symbol: "NAS100",
    name: "Nasdaq 100 (US Tech 100)",
    category: "indices",
    pipSize: 1.0,
    pipMultiplier: 1,
    pipValuePerStandardLot: 1.0,
    contractSize: 1,
    unitName: "Contracts",
    description: "US Tech 100 Index. 1 point index move = $1.00 per contract.",
    pipDefinition: "1 point = 1.0 index point move ($1.00/contract)",
  },
  {
    symbol: "SPX500",
    name: "S&P 500 (US 500)",
    category: "indices",
    pipSize: 1.0,
    pipMultiplier: 1,
    pipValuePerStandardLot: 1.0,
    contractSize: 1,
    unitName: "Contracts",
    description: "US 500 Index. 1 point index move = $1.00 per contract.",
    pipDefinition: "1 point = 1.0 index point move ($1.00/contract)",
  },
  {
    symbol: "GER40",
    name: "DAX 40 (Germany 40)",
    category: "indices",
    pipSize: 1.0,
    pipMultiplier: 1,
    pipValuePerStandardLot: 1.08, // €1.00 per point ~ $1.08
    contractSize: 1,
    unitName: "Contracts",
    description: "German DAX 40. 1 point move = €1.00 (~$1.08 per contract).",
    pipDefinition: "1 point = 1.0 index point move (~$1.08/contract)",
  },

  // Crypto
  {
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    category: "crypto",
    pipSize: 1.0,
    pipMultiplier: 1,
    pipValuePerStandardLot: 1.0,
    contractSize: 1,
    unitName: "BTC Coins",
    description: "Bitcoin contract (1 BTC per 1 lot). 1 point ($1 move) = $1.00.",
    pipDefinition: "1 point = $1.00 price move ($1.00/BTC)",
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    category: "crypto",
    pipSize: 1.0,
    pipMultiplier: 1,
    pipValuePerStandardLot: 1.0,
    contractSize: 1,
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
}

export interface PositionCalculatorResult {
  isValid: boolean;
  errorMessage?: string;
  standardLots: number;
  miniLots: number;
  microLots: number;
  contractUnits: number;
  unitName: string;
  riskAmount: number;
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
 * Validate calculator input fields
 */
export function validateCalculatorInput(input: Partial<PositionCalculatorInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (input.accountBalance === undefined || input.accountBalance === null || isNaN(input.accountBalance)) {
    errors.accountBalance = "Please enter your account balance.";
  } else if (input.accountBalance <= 0) {
    errors.accountBalance = "Account balance must be greater than zero.";
  }

  if (input.riskPercent === undefined || input.riskPercent === null || isNaN(input.riskPercent)) {
    errors.riskPercent = "Please enter a risk percentage.";
  } else if (input.riskPercent <= 0) {
    errors.riskPercent = "Risk percentage must be greater than 0%.";
  } else if (input.riskPercent > 100) {
    errors.riskPercent = "Risk percentage cannot exceed 100%.";
  }

  if (input.stopLossPips === undefined || input.stopLossPips === null || isNaN(input.stopLossPips)) {
    errors.stopLossPips = "Please enter your stop-loss distance in pips or points.";
  } else if (input.stopLossPips <= 0) {
    errors.stopLossPips = "Stop loss must be greater than zero.";
  }

  if (!input.symbol) {
    errors.symbol = "Please select a trading instrument.";
  } else {
    const inst = SUPPORTED_INSTRUMENTS.find((i) => i.symbol === input.symbol);
    if (!inst) {
      errors.symbol = "The selected trading instrument is not currently supported.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculate exact position size and risk metrics
 */
export function calculatePositionSize(input: PositionCalculatorInput): PositionCalculatorResult {
  const validation = validateCalculatorInput(input);
  const instrument =
    SUPPORTED_INSTRUMENTS.find((i) => i.symbol === input.symbol) || SUPPORTED_INSTRUMENTS[0];

  if (!validation.isValid) {
    const firstErr = Object.values(validation.errors)[0] || "Invalid calculation parameters.";
    return {
      isValid: false,
      errorMessage: firstErr,
      standardLots: 0,
      miniLots: 0,
      microLots: 0,
      contractUnits: 0,
      unitName: instrument.unitName,
      riskAmount: 0,
      balanceAfterLoss: input.accountBalance || 0,
      pipValuePerLot: instrument.pipValuePerStandardLot,
      instrument,
      riskRewardTargets: [],
    };
  }

  const { accountBalance, riskPercent, stopLossPips } = input;

  // 1. Exact Cash at Risk
  const riskAmount = Math.round(accountBalance * (riskPercent / 100) * 100) / 100;

  // 2. Risk per 1 Standard Lot = stopLossPips * pipValuePerStandardLot
  const riskPerLot = stopLossPips * instrument.pipValuePerStandardLot;

  // 3. Raw Lots
  const rawLots = riskPerLot > 0 ? riskAmount / riskPerLot : 0;

  // Format to standard 2-decimal broker precision (min lot typically 0.01)
  const standardLots = Math.max(0.01, Math.round(rawLots * 100) / 100);
  const miniLots = Math.round(standardLots * 10 * 100) / 100;
  const microLots = Math.round(standardLots * 100 * 100) / 100;
  const contractUnits = Math.round(standardLots * instrument.contractSize * 100) / 100;

  // 4. Balance After Loss
  const balanceAfterLoss = Math.max(0, Math.round((accountBalance - riskAmount) * 100) / 100);

  // 5. Projected Risk-to-Reward targets (1:1, 1:2, 1:3, 1:5 CRT Expansion)
  const rrMultipliers = [
    { ratio: "1:1", mult: 1 },
    { ratio: "1:2", mult: 2 },
    { ratio: "1:3", mult: 3 },
    { ratio: "1:5", mult: 5 },
  ];

  const riskRewardTargets = rrMultipliers.map(({ ratio, mult }) => {
    const profitAmount = Math.round(riskAmount * mult * 100) / 100;
    const targetPips = Math.round(stopLossPips * mult * 10) / 10;
    const projectedBalance = Math.round((accountBalance + profitAmount) * 100) / 100;
    return {
      ratio,
      targetPips,
      profitAmount,
      projectedBalance,
    };
  });

  return {
    isValid: true,
    standardLots,
    miniLots,
    microLots,
    contractUnits,
    unitName: instrument.unitName,
    riskAmount,
    balanceAfterLoss,
    pipValuePerLot: instrument.pipValuePerStandardLot,
    instrument,
    riskRewardTargets,
  };
}
