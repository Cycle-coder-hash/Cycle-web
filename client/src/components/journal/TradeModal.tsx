import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, AlertCircle, CheckCircle2, Image, Video, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeEntry, CustomProperty } from "@/types/journal";
import { calculatePips, calculateEstimatedPnl, calculateRiskReward } from "@/lib/journalCalculations";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<TradeEntry, "id" | "tradeNumber" | "createdAt">) => void;
  onUpdate?: (trade: TradeEntry) => void;
  initialTrade?: TradeEntry | null;
  nextTradeNumber: number;
  journalBookId: string;
  isBn?: boolean;
}

const COMMON_PAIRS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "USDCAD",
  "USDCHF",
  "NZDUSD",
  "EURJPY",
  "GBPJPY",
  "XAUUSD",
  "BTCUSD",
  "ETHUSD",
  "US30",
  "NAS100",
  "SPX500",
];

const PREDEFINED_TIMEFRAMES = ["1M", "5M", "15M", "30M", "1H", "4H", "1D", "1W", "Custom"];

export function TradeModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialTrade,
  nextTradeNumber,
  journalBookId,
  isBn = false,
}: TradeModalProps) {
  if (!isOpen) return null;

  const isEditing = !!initialTrade;

  // 1. Trade Number (auto)
  const tradeNumber = isEditing ? initialTrade.tradeNumber : nextTradeNumber;

  // 2. Date
  const [date, setDate] = useState(
    initialTrade?.date || new Date().toISOString().slice(0, 10)
  );

  // 3. Pair
  const [pair, setPair] = useState(initialTrade?.pair || "EURUSD");
  const [isCustomPair, setIsCustomPair] = useState(
    initialTrade ? !COMMON_PAIRS.includes(initialTrade.pair) : false
  );
  const [customPairText, setCustomPairText] = useState(
    initialTrade && !COMMON_PAIRS.includes(initialTrade.pair) ? initialTrade.pair : ""
  );

  // 4. Entry Time
  const [entryTime, setEntryTime] = useState(
    initialTrade?.entryTime || "09:30"
  );

  // 5. Timeframe
  const [timeframe, setTimeframe] = useState(
    initialTrade?.timeframe || "15M"
  );
  const [isCustomTimeframe, setIsCustomTimeframe] = useState(
    initialTrade ? !["1M", "5M", "15M", "30M", "1H", "4H", "1D", "1W"].includes(initialTrade.timeframe) : false
  );
  const [customTimeframeText, setCustomTimeframeText] = useState(
    initialTrade && !["1M", "5M", "15M", "30M", "1H", "4H", "1D", "1W"].includes(initialTrade.timeframe)
      ? initialTrade.timeframe
      : ""
  );

  // 6. Buy / Sell
  const [direction, setDirection] = useState<"Buy" | "Sell">(
    initialTrade?.direction || "Buy"
  );

  // 7. Entry Price
  const [entryPrice, setEntryPrice] = useState<string>(
    initialTrade ? String(initialTrade.entryPrice) : ""
  );

  // 8. Stop Loss
  const [stopLoss, setStopLoss] = useState<string>(
    initialTrade ? String(initialTrade.stopLoss) : ""
  );

  // 9. Take Profit
  const [takeProfit, setTakeProfit] = useState<string>(
    initialTrade ? String(initialTrade.takeProfit) : ""
  );

  // 10. Exit Price
  const [exitPrice, setExitPrice] = useState<string>(
    initialTrade ? String(initialTrade.exitPrice) : ""
  );

  // 11. Did I Follow All Rules?
  const [followedRules, setFollowedRules] = useState<"Yes" | "No">(
    initialTrade?.followedRules || "Yes"
  );

  // 12. P&L ($)
  const [pnl, setPnl] = useState<string>(
    initialTrade ? String(initialTrade.pnl) : ""
  );
  const [pnlManuallyEdited, setPnlManuallyEdited] = useState(!!initialTrade);

  // 13. Risk : Reward
  const [riskReward, setRiskReward] = useState<string>(
    initialTrade?.riskReward || "1:2.0"
  );

  // 14. Pips
  const [pips, setPips] = useState<string>(
    initialTrade ? String(initialTrade.pips) : ""
  );

  // 15. Lot Size
  const [lotSize, setLotSize] = useState<string>(
    initialTrade ? String(initialTrade.lotSize) : "1.00"
  );

  // 16. Trade Run
  const [tradeRun, setTradeRun] = useState<string>(
    initialTrade?.tradeRun || "+2R"
  );

  // 17. Note
  const [note, setNote] = useState<string>(
    initialTrade?.note || ""
  );

  // 18. Trade Rank
  const [tradeRank, setTradeRank] = useState<"A+" | "A" | "A-">(
    initialTrade?.tradeRank || "A"
  );

  // 19. Screenshot / Video
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(
    initialTrade?.mediaUrl
  );
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>(
    initialTrade?.mediaType
  );
  const [videoError, setVideoError] = useState<string | null>(null);

  // 20. Update / Learning
  const [learning, setLearning] = useState<string>(
    initialTrade?.learning || ""
  );

  // 21. Custom Properties
  const [customProperties, setCustomProperties] = useState<CustomProperty[]>(
    initialTrade?.customProperties || []
  );

  // Active pair calculation
  const activePair = isCustomPair ? customPairText.trim().toUpperCase() : pair;
  const activeTimeframe = isCustomTimeframe ? customTimeframeText.trim() : timeframe;

  // Auto-calculate Pips, P&L, RR when prices change
  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    const lots = parseFloat(lotSize) || 1;

    if (!isNaN(entry) && !isNaN(exit)) {
      const calculatedPips = calculatePips(activePair, direction, entry, exit);
      setPips(String(calculatedPips));

      if (!pnlManuallyEdited) {
        const estimatedPnl = calculateEstimatedPnl(activePair, direction, entry, exit, lots);
        setPnl(String(estimatedPnl));
      }
    }

    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp)) {
      const calculatedRR = calculateRiskReward(direction, entry, sl, tp);
      setRiskReward(calculatedRR);
    }
  }, [entryPrice, exitPrice, stopLoss, takeProfit, lotSize, direction, activePair, pnlManuallyEdited]);

  // Video duration validation handler (MAX 1 MINUTE STRICTLY ENFORCED)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 60) {
          setVideoError(
            `Video rejected: Duration is ${Math.round(duration)} seconds. Maximum allowed video length is 1 minute (60 seconds).`
          );
          setMediaUrl(undefined);
          setMediaType(undefined);
          return;
        }

        // Accept video
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaUrl(reader.result as string);
          setMediaType("video");
        };
        reader.readAsDataURL(file);
      };
      video.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
        setMediaType("image");
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image or video file.");
    }
  };

  const handleAddProperty = () => {
    setCustomProperties((prev) => [
      ...prev,
      { id: `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: "", value: "" },
    ]);
  };

  const handleUpdateProperty = (id: string, field: "name" | "value", val: string) => {
    setCustomProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleRemoveProperty = (id: string) => {
    setCustomProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedEntry = parseFloat(entryPrice) || 0;
    const parsedExit = parseFloat(exitPrice) || 0;
    const parsedSl = parseFloat(stopLoss) || 0;
    const parsedTp = parseFloat(takeProfit) || 0;
    const parsedLots = parseFloat(lotSize) || 0.1;
    const parsedPnl = parseFloat(pnl) || 0;
    const parsedPips = parseFloat(pips) || 0;

    const payload = {
      journalBookId,
      date: date || new Date().toISOString().slice(0, 10),
      entryTime: entryTime || "09:00",
      pair: activePair || "EURUSD",
      timeframe: activeTimeframe || "15M",
      direction,
      entryPrice: parsedEntry,
      stopLoss: parsedSl,
      takeProfit: parsedTp,
      exitPrice: parsedExit,
      followedRules,
      pnl: parsedPnl,
      riskReward: riskReward || "1:2.0",
      pips: parsedPips,
      lotSize: parsedLots,
      tradeRun: tradeRun.trim() || "0R",
      note: note.trim(),
      tradeRank,
      mediaUrl,
      mediaType,
      learning: learning.trim(),
      customProperties: customProperties.filter((p) => p.name.trim() !== ""),
    };

    if (isEditing && onUpdate && initialTrade) {
      onUpdate({
        ...initialTrade,
        ...payload,
      });
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-auto text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-sky-500/10 px-3 py-1 font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                Trade #{tradeNumber}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {isEditing ? (isBn ? "ট্রেড সম্পাদনা" : "Edit Trade Record") : (isBn ? "নতুন ট্রেড এন্ট্রি" : "New Trade Journal Entry")}
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight mt-1">
              {isEditing ? (isBn ? `ট্রেড #${tradeNumber} আপডেট করুন` : `Update Trade #${tradeNumber}`) : (isBn ? `ট্রেড #${tradeNumber} যুক্ত করুন` : `Log Trade #${tradeNumber}`)}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* SECTION 1: EXECUTION BASICS */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <span>01.</span> {isBn ? "ট্রেডের প্রাথমিক তথ্য" : "Trade Execution Fundamentals"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Field 2: Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 4: Entry Time */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Entry Time *</label>
                <input
                  type="time"
                  required
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 3: Pair */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Pair / Instrument *</label>
                <div className="mt-1 space-y-1.5">
                  <select
                    value={isCustomPair ? "CUSTOM" : pair}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setIsCustomPair(true);
                      } else {
                        setIsCustomPair(false);
                        setPair(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {COMMON_PAIRS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="CUSTOM">+ Custom Instrument...</option>
                  </select>
                  {isCustomPair && (
                    <input
                      type="text"
                      placeholder="e.g. SOLUSD or GER40"
                      value={customPairText}
                      onChange={(e) => setCustomPairText(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-sky-400 bg-white px-3 py-1.5 text-xs font-bold outline-none dark:bg-slate-950 dark:text-white"
                    />
                  )}
                </div>
              </div>

              {/* Field 5: Timeframe */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Timeframe *</label>
                <div className="mt-1 space-y-1.5">
                  <select
                    value={isCustomTimeframe ? "Custom" : timeframe}
                    onChange={(e) => {
                      if (e.target.value === "Custom") {
                        setIsCustomTimeframe(true);
                      } else {
                        setIsCustomTimeframe(false);
                        setTimeframe(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {PREDEFINED_TIMEFRAMES.map((tf) => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                  {isCustomTimeframe && (
                    <input
                      type="text"
                      placeholder="e.g. 2M or 3D"
                      value={customTimeframeText}
                      onChange={(e) => setCustomTimeframeText(e.target.value)}
                      className="w-full rounded-xl border border-sky-400 bg-white px-3 py-1.5 text-xs font-bold outline-none dark:bg-slate-950 dark:text-white"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DIRECTION & PRICING */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <span>02.</span> {isBn ? "ডিরেকশন ও প্রাইস লেভেল" : "Direction & Price Levels"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Field 6: Buy / Sell (Select Only) */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Direction *</label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as "Buy" | "Sell")}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs font-black uppercase outline-none ${
                    direction === "Buy"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  }`}
                >
                  <option value="Buy">Buy (Long)</option>
                  <option value="Sell">Sell (Short)</option>
                </select>
              </div>

              {/* Field 7: Entry Price */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Entry Price *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 1.0850"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 8: Stop Loss */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Stop Loss *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 1.0820"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-rose-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 9: Take Profit */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Take Profit *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 1.0920"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 10: Exit Price */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Exit Price *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 1.0910"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: METRICS & OUTCOMES */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <span>03.</span> {isBn ? "ফলাফল ও পারফরম্যান্স মেট্রিক্স" : "Trade Metrics & Outcomes"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Field 15: Lot Size */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Lot Size *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1.00"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 12: P&L ($) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">P&L ($) *</label>
                  <span className="text-[10px] text-sky-500 font-semibold">Auto-calculated</span>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 250.00"
                  value={pnl}
                  onChange={(e) => {
                    setPnl(e.target.value);
                    setPnlManuallyEdited(true);
                  }}
                  className={`mt-1 w-full font-mono rounded-xl border px-3 py-2 text-xs font-black outline-none ${
                    parseFloat(pnl) > 0
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : parseFloat(pnl) < 0
                      ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  }`}
                />
              </div>

              {/* Field 13: Risk : Reward */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Risk : Reward</label>
                <input
                  type="text"
                  placeholder="e.g. 1:3.0"
                  value={riskReward}
                  onChange={(e) => setRiskReward(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 14: Pips */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Pips</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 45.0"
                  value={pips}
                  onChange={(e) => setPips(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 16: Trade Run (Max R or Pips reached) */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Trade Run (Max Favored)</label>
                <input
                  type="text"
                  placeholder="e.g. +2.5R"
                  value={tradeRun}
                  onChange={(e) => setTradeRun(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DISCIPLINE & RANK */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <span>04.</span> {isBn ? "ডিসিপ্লিন ও কোয়ালিটি রেটিং" : "Discipline & Trade Rank"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Field 11: Did I Follow All Rules? (Select Only) */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Did I Follow All Rules? *</label>
                <select
                  value={followedRules}
                  onChange={(e) => setFollowedRules(e.target.value as "Yes" | "No")}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs font-black outline-none ${
                    followedRules === "Yes"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  }`}
                >
                  <option value="Yes">Yes — 100% Rules Followed</option>
                  <option value="No">No — Rule Violation Occurred</option>
                </select>
              </div>

              {/* Field 18: Trade Rank (Select Only: A+, A, A-) */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Trade Rank *</label>
                <select
                  value={tradeRank}
                  onChange={(e) => setTradeRank(e.target.value as "A+" | "A" | "A-")}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="A+">A+ (Pristine execution, high conviction setup)</option>
                  <option value="A">A (Solid setup with standard criteria met)</option>
                  <option value="A-">A- (Sub-optimal entry or minor execution blemish)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 5: NOTES & LEARNING */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 17: Note (Free Text) */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Setup Context & Trade Notes (Free Text)
              </label>
              <textarea
                rows={3}
                placeholder="Explain the technical setup, market structure, liquidity raid, session context, and thesis..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Field 20: Update / Learning (Free Text) */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Update / Lessons Learned (What to repeat or avoid next time?)
              </label>
              <textarea
                rows={3}
                placeholder="Write your emotional reflection, mistakes to eliminate, or positive habits to repeat..."
                value={learning}
                onChange={(e) => setLearning(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* SECTION 6: SCREENSHOT / VIDEO (MAX 1 MINUTE STRICT VALIDATION) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Image size={14} className="text-sky-500" />
                <span>Field 19: Screenshot or Video Upload</span>
              </label>
              <span className="text-[10px] font-bold text-rose-500">
                * Strict Video Limit: Max 1 Minute (60s)
              </span>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50">
              {videoError && (
                <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{videoError}</span>
                </div>
              )}

              {mediaUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
                  {mediaType === "video" ? (
                    <video src={mediaUrl} controls className="max-h-60 w-full object-contain" />
                  ) : (
                    <img src={mediaUrl} alt="Trade Preview" className="max-h-60 w-full object-contain" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl(undefined);
                      setMediaType(undefined);
                    }}
                    className="absolute top-2 right-2 rounded-full bg-rose-600 p-1.5 text-white hover:bg-rose-700 shadow-md"
                    title="Remove media"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                  <Upload size={24} className="text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Click to attach trade screenshot or video clip
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Supports PNG, JPG, WEBP or MP4 (Max video length: 60 seconds)
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* SECTION 7: CUSTOM PROPERTIES (Field 21: Add Property) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Field 21: Custom Properties
                </label>
                <p className="text-[10px] text-slate-400">
                  Add flexible custom fields (e.g. Session: London, Model: CRT Range, News: Clean)
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProperty}
                className="text-xs font-bold gap-1 rounded-xl h-8"
              >
                <Plus size={14} /> Add Property
              </Button>
            </div>

            {customProperties.length > 0 ? (
              <div className="space-y-2">
                {customProperties.map((prop) => (
                  <div key={prop.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Property Name (e.g. Session)"
                      value={prop.name}
                      onChange={(e) => handleUpdateProperty(prop.id, "name", e.target.value)}
                      className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. London Open)"
                      value={prop.value}
                      onChange={(e) => handleUpdateProperty(prop.id, "value", e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(prop.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                No custom properties added. Click "+ Add Property" to create flexible custom fields.
              </div>
            )}
          </div>

          {/* Footer Save Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-extrabold text-xs px-6"
            >
              {isEditing ? (isBn ? "ট্রেড আপডেট করুন" : "Save Changes") : (isBn ? "ট্রেড রেকর্ড করুন" : "Log Trade Record")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
