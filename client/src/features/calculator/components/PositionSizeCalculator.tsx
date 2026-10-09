import React, { useState, useMemo } from "react";
import {
  Calculator,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  DollarSign,
  Layers,
  ArrowRight,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedRgbBorder } from "@/components/AnimatedRgbBorder";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  SUPPORTED_INSTRUMENTS,
  InstrumentSpec,
  PositionCalculatorInput,
  PositionCalculatorResult,
  DEFAULT_CALCULATOR_INPUT,
  QUICK_RISK_PRESETS,
  calculatePositionSize,
  validateCalculatorInput,
} from "@/lib/positionCalculator";

interface PositionSizeCalculatorProps {
  initialBalance?: number;
}

export const PositionSizeCalculator: React.FC<PositionSizeCalculatorProps> = ({
  initialBalance,
}) => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { formatCurrency, currency } = useUserPreferences();

  // Form State
  const [balance, setBalance] = useState<string>(
    initialBalance && initialBalance > 0 ? String(initialBalance) : String(DEFAULT_CALCULATOR_INPUT.accountBalance)
  );
  const [riskPercent, setRiskPercent] = useState<string>(String(DEFAULT_CALCULATOR_INPUT.riskPercent));
  const [stopLossPips, setStopLossPips] = useState<string>(String(DEFAULT_CALCULATOR_INPUT.stopLossPips));
  const [symbol, setSymbol] = useState<string>(DEFAULT_CALCULATOR_INPUT.symbol);

  // Active Calculation Result State
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Active selected instrument specification
  const activeInstrument = useMemo<InstrumentSpec>(() => {
    return (
      SUPPORTED_INSTRUMENTS.find((i) => i.symbol === symbol) ||
      SUPPORTED_INSTRUMENTS[0]
    );
  }, [symbol]);

  // Current calculation input object
  const currentInput = useMemo<PositionCalculatorInput>(() => {
    return {
      accountBalance: parseFloat(balance) || 0,
      riskPercent: parseFloat(riskPercent) || 0,
      stopLossPips: parseFloat(stopLossPips) || 0,
      symbol,
    };
  }, [balance, riskPercent, stopLossPips, symbol]);

  // Live calculation results
  const calculationResult = useMemo<PositionCalculatorResult>(() => {
    return calculatePositionSize(currentInput);
  }, [currentInput]);

  // Handle calculation action
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validation = validateCalculatorInput(currentInput);
    setValidationErrors(validation.errors);
    setHasCalculated(true);
  };

  // Handle reset to default parameters
  const handleReset = () => {
    setBalance(
      initialBalance && initialBalance > 0 ? String(initialBalance) : String(DEFAULT_CALCULATOR_INPUT.accountBalance)
    );
    setRiskPercent(String(DEFAULT_CALCULATOR_INPUT.riskPercent));
    setStopLossPips(String(DEFAULT_CALCULATOR_INPUT.stopLossPips));
    setSymbol(DEFAULT_CALCULATOR_INPUT.symbol);
    setValidationErrors({});
    setHasCalculated(true);
  };

  // Quick preset click
  const handlePresetRisk = (preset: number) => {
    setRiskPercent(String(preset));
    if (validationErrors.riskPercent) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next.riskPercent;
        return next;
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {isBn ? "পজিশন সাইজ ও রিস্ক ক্যালকুলেটর" : "Position Size & Risk Calculator"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? "ক্যান্ডেল রেঞ্জ থিওরি (CRT) নীতি অনুযায়ী সঠিক লট সাইজ ও ক্যাপিটাল রিস্ক নির্ধারণ করুন।"
                  : "Calculate precise lot sizing, cash at risk, and contract units to protect your trading capital."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50"
          >
            <RotateCcw size={13} />
            <span>{isBn ? "রিসেট করুন" : "Reset Default"}</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleCalculate}
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-[#070e1b] space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers size={14} className="text-sky-500" />
                {isBn ? "প্যারামিটার ইনপুট" : "Trade Parameters"}
              </span>
              <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-500 dark:text-sky-400">
                Institutional CRT
              </span>
            </div>

            {/* Validation Error Banner */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-400 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle size={15} />
                  <span>{isBn ? "ইনপুট সংশোধন করুন" : "Please check your inputs:"}</span>
                </div>
                <ul className="list-disc pl-6 space-y-0.5 text-[11px]">
                  {Object.values(validationErrors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 1. Trading Instrument Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? "ট্রেডিং ইনস্ট্রুমেন্ট / পেয়ার" : "Trading Instrument"}
              </label>
              <select
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  if (validationErrors.symbol) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.symbol;
                      return next;
                    });
                  }
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <optgroup label="👑 CRT Core & Commodities">
                  <option value="XAU/USD">XAU/USD — Gold Spot (100 oz)</option>
                  <option value="XAG/USD">XAG/USD — Silver Spot (5,000 oz)</option>
                  <option value="USOIL">USOIL — WTI Crude Oil (1,000 bbl)</option>
                </optgroup>
                <optgroup label="💱 Forex Majors">
                  <option value="EUR/USD">EUR/USD — Euro / US Dollar</option>
                  <option value="GBP/USD">GBP/USD — British Pound / US Dollar</option>
                  <option value="AUD/USD">AUD/USD — Australian Dollar / US Dollar</option>
                  <option value="NZD/USD">NZD/USD — New Zealand Dollar / US Dollar</option>
                </optgroup>
                <optgroup label="💴 JPY Pairs & Crosses">
                  <option value="USD/JPY">USD/JPY — US Dollar / Japanese Yen</option>
                  <option value="EUR/JPY">EUR/JPY — Euro / Japanese Yen</option>
                  <option value="GBP/JPY">GBP/JPY — British Pound / Japanese Yen</option>
                  <option value="USD/CAD">USD/CAD — US Dollar / Canadian Dollar</option>
                  <option value="USD/CHF">USD/CHF — US Dollar / Swiss Franc</option>
                </optgroup>
                <optgroup label="📈 Equity Indices">
                  <option value="US30">US30 — Dow Jones Industrial Average</option>
                  <option value="NAS100">NAS100 — Nasdaq 100 Tech Index</option>
                  <option value="SPX500">SPX500 — S&P 500 Large Cap</option>
                  <option value="GER40">GER40 — German DAX 40</option>
                </optgroup>
                <optgroup label="⚡ Crypto Assets">
                  <option value="BTC/USD">BTC/USD — Bitcoin / US Dollar</option>
                  <option value="ETH/USD">ETH/USD — Ethereum / US Dollar</option>
                </optgroup>
              </select>

              {/* Pip Definition Context Card */}
              <div className="mt-2 flex items-start gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 dark:bg-slate-900/60 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80">
                <Info size={14} className="text-sky-500 shrink-0 mt-0.5" />
                <span>{activeInstrument.pipDefinition}</span>
              </div>
            </div>

            {/* 2. Account Balance */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? "অ্যাকাউন্ট ব্যালেন্স ($)" : "Account Balance ($ USD)"}
                </label>
                {initialBalance && initialBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setBalance(String(initialBalance))}
                    className="text-[11px] font-bold text-sky-500 hover:underline"
                  >
                    {isBn ? `জার্নাল ব্যালেন্স ব্যবহার করুন ($${initialBalance})` : `Use Journal Balance ($${initialBalance.toLocaleString()})`}
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="10000"
                  value={balance}
                  onChange={(e) => {
                    setBalance(e.target.value);
                    if (validationErrors.accountBalance) {
                      setValidationErrors((prev) => {
                        const next = { ...prev };
                        delete next.accountBalance;
                        return next;
                      });
                    }
                  }}
                  className={`w-full rounded-2xl border bg-slate-50 py-3 pl-8 pr-4 text-sm font-extrabold text-slate-900 outline-none transition dark:bg-slate-900 dark:text-white ${
                    validationErrors.accountBalance
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 focus:border-sky-500 dark:border-slate-800"
                  }`}
                />
              </div>
              {validationErrors.accountBalance && (
                <p className="mt-1 text-[11px] font-bold text-rose-500">{validationErrors.accountBalance}</p>
              )}
            </div>

            {/* 3. Risk Percentage with Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? "রিস্ক শতাংশ (% Risk)" : "Risk Percentage (%)"}
                </label>
                <span className="text-[11px] font-extrabold text-sky-500 dark:text-sky-400">
                  ${((parseFloat(balance) || 0) * ((parseFloat(riskPercent) || 0) / 100)).toFixed(2)} USD at risk
                </span>
              </div>

              {/* Quick Select Pill Buttons */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                {QUICK_RISK_PRESETS.map((preset) => {
                  const isActive = parseFloat(riskPercent) === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetRisk(preset)}
                      className={`py-2 rounded-xl text-xs font-extrabold transition-all border ${
                        isActive
                          ? "bg-sky-500 text-slate-950 border-sky-400 shadow-sm shadow-sky-500/30"
                          : "bg-slate-100/80 text-slate-600 border-slate-200/80 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800"
                      }`}
                    >
                      {preset}%
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  max="100"
                  required
                  placeholder="1.0"
                  value={riskPercent}
                  onChange={(e) => {
                    setRiskPercent(e.target.value);
                    if (validationErrors.riskPercent) {
                      setValidationErrors((prev) => {
                        const next = { ...prev };
                        delete next.riskPercent;
                        return next;
                      });
                    }
                  }}
                  className={`w-full rounded-2xl border bg-slate-50 py-3 pl-4 pr-9 text-sm font-extrabold text-slate-900 outline-none transition dark:bg-slate-900 dark:text-white ${
                    validationErrors.riskPercent
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 focus:border-sky-500 dark:border-slate-800"
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                  %
                </span>
              </div>
              {validationErrors.riskPercent && (
                <p className="mt-1 text-[11px] font-bold text-rose-500">{validationErrors.riskPercent}</p>
              )}
            </div>

            {/* 4. Stop Loss Distance in Pips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? "স্টপ লস দূরত্ব (Pips / Points)" : "Stop Loss Distance (Pips / Points)"}
                </label>
                <span className="text-[11px] text-slate-400">
                  {activeInstrument.category === "indices" || activeInstrument.category === "crypto"
                    ? "Points"
                    : "Pips"}
                </span>
              </div>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                placeholder="20"
                value={stopLossPips}
                onChange={(e) => {
                  setStopLossPips(e.target.value);
                  if (validationErrors.stopLossPips) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.stopLossPips;
                      return next;
                    });
                  }
                }}
                className={`w-full rounded-2xl border bg-slate-50 p-3 text-sm font-extrabold text-slate-900 outline-none transition dark:bg-slate-900 dark:text-white ${
                  validationErrors.stopLossPips
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-200 focus:border-sky-500 dark:border-slate-800"
                }`}
              />
              {validationErrors.stopLossPips && (
                <p className="mt-1 text-[11px] font-bold text-rose-500">{validationErrors.stopLossPips}</p>
              )}
            </div>

            {/* Primary Action Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 font-black text-sm shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 transition-all gap-2"
            >
              <Calculator size={18} />
              <span>{isBn ? "পজিশন সাইজ হিসাব করুন" : "Calculate Position Size"}</span>
            </Button>
          </form>
        </div>

        {/* Right Column: Calculation Results Display */}
        <div className="lg:col-span-6 space-y-6">
          {/* Hero Lot Size Card with Animated RGB Glow */}
          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl dark:border-slate-800 dark:bg-[#070e1b] overflow-hidden">
            <AnimatedRgbBorder />
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#38bdf8] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#38bdf8]" />
                  {isBn ? "হিসাবকৃত সঠিক পজিশন সাইজ" : "Recommended Lot Sizing"}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-400 border border-emerald-500/30">
                  {activeInstrument.symbol}
                </span>
              </div>

              {/* Main Prominent Lot Display */}
              <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-[#091830] to-[#061122] p-6 text-center space-y-1 shadow-inner">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {isBn ? "স্ট্যান্ডার্ড লট সাইজ" : "Standard Lot Size"}
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight text-glow-cyan">
                  {calculationResult.isValid ? calculationResult.standardLots.toFixed(2) : "0.00"}{" "}
                  <span className="text-base sm:text-lg font-bold text-sky-400">Lots</span>
                </div>
                <div className="text-xs font-semibold text-slate-300 pt-1">
                  {isBn
                    ? `সর্বোচ্চ ক্যাপিটাল ঝুঁকি: $${calculationResult.riskAmount.toFixed(2)} USD`
                    : `Max Capital At Risk: $${calculationResult.riskAmount.toFixed(2)} USD`}
                  {currency !== "USD" && (
                    <span className="text-slate-400 ml-1.5">
                      ({formatCurrency(calculationResult.riskAmount * (currency === "BDT" ? 120 : 1))})
                    </span>
                  )}
                </div>
              </div>

              {/* Secondary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {/* Mini Lots */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {isBn ? "মিনি লটস" : "Mini Lots"}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {calculationResult.isValid ? calculationResult.miniLots.toFixed(2) : "0.00"}
                  </div>
                  <div className="text-[10px] text-slate-400">0.1x Lot</div>
                </div>

                {/* Micro Lots */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {isBn ? "মাইক্রো লটস" : "Micro Lots"}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {calculationResult.isValid ? calculationResult.microLots.toFixed(2) : "0.00"}
                  </div>
                  <div className="text-[10px] text-slate-400">0.01x Lot</div>
                </div>

                {/* Total Units / Contract Quantity */}
                <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {isBn ? "মোট ভলিউম / ইউনিট" : "Total Volume"}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                    {calculationResult.isValid
                      ? `${calculationResult.contractUnits.toLocaleString()} ${calculationResult.unitName}`
                      : `0 ${calculationResult.unitName}`}
                  </div>
                  <div className="text-[10px] text-slate-400">{activeInstrument.unitName}</div>
                </div>

                {/* Pip Value */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {isBn ? "পিপ ভ্যালু / লট" : "Pip Value / Lot"}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    ${activeInstrument.pipValuePerStandardLot.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">USD per Pip</div>
                </div>

                {/* Balance After Loss */}
                <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {isBn ? "এসএল হিট হলে অবশিষ্ট ব্যালেন্স" : "Balance After Stop Loss"}
                  </div>
                  <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ${calculationResult.isValid ? calculationResult.balanceAfterLoss.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"} USD
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isBn ? "নিরাপদ অ্যাকাউন্ট টিকে থাকা নিশ্চিত" : "Account remains protected"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk-to-Reward Scenario Targets */}
          {calculationResult.isValid && calculationResult.riskRewardTargets.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#070e1b] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Target size={15} className="text-amber-500" />
                  {isBn ? "প্রত্যাশিত রিটার্ন ম্যাট্রিক্স (R:R Targets)" : "Risk-to-Reward Projections"}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  SL: {calculationResult.instrument.symbol}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {calculationResult.riskRewardTargets.map((target) => (
                  <div
                    key={target.ratio}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 text-center space-y-1"
                  >
                    <div className="text-[10px] font-black uppercase text-sky-500 dark:text-sky-400">
                      {target.ratio} R:R
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      +${target.profitAmount.toFixed(0)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {target.targetPips} {activeInstrument.category === "indices" ? "pts" : "pips"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Institutional CRT Risk Management Card */}
          <div className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-5 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-black text-sky-600 dark:text-sky-400 text-xs uppercase tracking-wider">
              <ShieldCheck size={16} />
              <span>{isBn ? "ক্যান্ডেল রেঞ্জ থিওরি (CRT) রিস্ক আর্কিটেকচার" : "Institutional Risk Architecture"}</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              {isBn
                ? "একজন প্রাতিষ্ঠানিক ট্রেডারের প্রথম লক্ষ্য লাভ নয়, মূলধন রক্ষা করা। কোনো একক সেটআপে কখনোই ১% থেকে ২% এর বেশি রিস্ক নেওয়া উচিত নয়।"
                : "Professional institutional traders prioritize capital preservation over speculative returns. Never allocate more than 1%–2% of total equity to any single execution."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
