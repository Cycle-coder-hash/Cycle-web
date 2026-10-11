import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeEntry, CustomProperty } from "@/types/journal";
import { calculatePips, calculateEstimatedPnl, calculateRiskReward } from "@/lib/journalCalculations";
import { deleteSavedVideo } from "@/lib/mediaUpload";
import { TradeMediaAndPropertiesSection } from "./TradeMediaAndPropertiesSection";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<TradeEntry, "id" | "tradeNumber" | "createdAt">) => void;
  onUpdate?: (trade: TradeEntry) => void;
  initialTrade?: TradeEntry | null;
  nextTradeNumber: number;
  journalBookId: string;
  isBn?: boolean;
  defaultDate?: string;
  canUploadVideo?: boolean;
  onRequestUpgrade?: (feature: "journal_videos" | "notebook_videos") => void;
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
  defaultDate,
  canUploadVideo = true,
  onRequestUpgrade,
}: TradeModalProps) {
  if (!isOpen) return null;

  const isEditing = !!initialTrade;

  // 1. Trade Number (auto)
  const tradeNumber = isEditing ? initialTrade.tradeNumber : nextTradeNumber;

  // 2. Date
  const [date, setDate] = useState(
    initialTrade?.date || defaultDate || new Date().toISOString().slice(0, 10)
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
    initialTrade && initialTrade.entryPrice != null ? String(initialTrade.entryPrice) : ""
  );

  // 8. Stop Loss
  const [stopLoss, setStopLoss] = useState<string>(
    initialTrade && initialTrade.stopLoss != null ? String(initialTrade.stopLoss) : ""
  );

  // 9. Take Profit
  const [takeProfit, setTakeProfit] = useState<string>(
    initialTrade && initialTrade.takeProfit != null ? String(initialTrade.takeProfit) : ""
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

  // 19. Screenshots (Multiple) & Video
  const [screenshots, setScreenshots] = useState<string[]>(() => {
    if (initialTrade?.screenshots && initialTrade.screenshots.length > 0) {
      return initialTrade.screenshots;
    }
    if (initialTrade?.mediaUrl && initialTrade?.mediaType !== "video") {
      return [initialTrade.mediaUrl];
    }
    return [];
  });

  const [videoUrl, setVideoUrl] = useState<string | undefined>(() => {
    if (initialTrade?.videoUrl) return initialTrade.videoUrl;
    if (initialTrade?.mediaType === "video") return initialTrade.mediaUrl;
    return undefined;
  });
  const [videoDurationSeconds, setVideoDurationSeconds] = useState<number | undefined>(
    initialTrade?.videoDurationSeconds
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

  // Sync state when initialTrade or isOpen changes
  useEffect(() => {
    if (initialTrade) {
      setDate(initialTrade.date || new Date().toISOString().slice(0, 10));
      setEntryTime(initialTrade.entryTime || "09:30");
      setPair(COMMON_PAIRS.includes(initialTrade.pair) ? initialTrade.pair : "Custom");
      setIsCustomPair(!COMMON_PAIRS.includes(initialTrade.pair));
      setCustomPairText(!COMMON_PAIRS.includes(initialTrade.pair) ? initialTrade.pair : "");
      setTimeframe(initialTrade.timeframe || "15M");
      setIsCustomTimeframe(!["1M", "5M", "15M", "30M", "1H", "4H", "1D", "1W"].includes(initialTrade.timeframe));
      setCustomTimeframeText(!["1M", "5M", "15M", "30M", "1H", "4H", "1D", "1W"].includes(initialTrade.timeframe) ? initialTrade.timeframe : "");
      setDirection(initialTrade.direction || "Buy");
      setEntryPrice(initialTrade.entryPrice != null ? String(initialTrade.entryPrice) : "");
      setStopLoss(initialTrade.stopLoss != null ? String(initialTrade.stopLoss) : "");
      setTakeProfit(initialTrade.takeProfit != null ? String(initialTrade.takeProfit) : "");
      setExitPrice(String(initialTrade.exitPrice ?? ""));
      setFollowedRules(initialTrade.followedRules || "Yes");
      setPnl(String(initialTrade.pnl ?? ""));
      setPnlManuallyEdited(true);
      setRiskReward(initialTrade.riskReward || "1:2.0");
      setPips(String(initialTrade.pips ?? ""));
      setLotSize(String(initialTrade.lotSize ?? "1.00"));
      setTradeRun(initialTrade.tradeRun || "+2R");
      setNote(initialTrade.note || "");
      setTradeRank(initialTrade.tradeRank || "A");
      setLearning(initialTrade.learning || "");
      setCustomProperties(initialTrade.customProperties || []);

      const loadedScreenshots = initialTrade.screenshots && initialTrade.screenshots.length > 0
        ? initialTrade.screenshots
        : (initialTrade.mediaUrl && initialTrade.mediaType !== "video" ? [initialTrade.mediaUrl] : []);
      setScreenshots(loadedScreenshots);

      const loadedVideo = initialTrade.videoUrl || (initialTrade.mediaType === "video" ? initialTrade.mediaUrl : undefined);
      setVideoUrl(loadedVideo);
      setVideoDurationSeconds(initialTrade.videoDurationSeconds);
    } else {
      setDate(defaultDate || new Date().toISOString().slice(0, 10));
      setEntryTime("09:30");
      setPair("EURUSD");
      setIsCustomPair(false);
      setCustomPairText("");
      setTimeframe("15M");
      setIsCustomTimeframe(false);
      setCustomTimeframeText("");
      setDirection("Buy");
      setEntryPrice("");
      setStopLoss("");
      setTakeProfit("");
      setExitPrice("");
      setFollowedRules("Yes");
      setPnl("");
      setPnlManuallyEdited(false);
      setRiskReward("1:2.0");
      setPips("");
      setLotSize("1.00");
      setTradeRun("+2R");
      setNote("");
      setTradeRank("A");
      setLearning("");
      setCustomProperties([]);
      setScreenshots([]);
      setVideoUrl(undefined);
      setVideoDurationSeconds(undefined);
    }
    setVideoError(null);
  }, [initialTrade, isOpen, defaultDate]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedEntry = entryPrice.trim() !== "" && !isNaN(parseFloat(entryPrice)) ? parseFloat(entryPrice) : null;
    const parsedExit = exitPrice.trim() !== "" && !isNaN(parseFloat(exitPrice)) ? parseFloat(exitPrice) : (initialTrade?.exitPrice ?? null);
    const parsedSl = stopLoss.trim() !== "" && !isNaN(parseFloat(stopLoss)) ? parseFloat(stopLoss) : null;
    const parsedTp = takeProfit.trim() !== "" && !isNaN(parseFloat(takeProfit)) ? parseFloat(takeProfit) : null;
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
      screenshots,
      videoUrl,
      videoDurationSeconds,
      mediaUrl: screenshots[0] || videoUrl || undefined,
      mediaType: (videoUrl ? "video" : (screenshots.length > 0 ? "image" : undefined)) as "image" | "video" | undefined,
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

  const handleCloseOrCancel = () => {
    // If user uploaded a new video during this session but cancels/closes without saving,
    // clean up the orphaned uploaded video record so it doesn't consume quota.
    const initialVideo = initialTrade?.videoUrl || (initialTrade?.mediaType === "video" ? initialTrade.mediaUrl : undefined);
    if (videoUrl && videoUrl !== initialVideo && videoUrl.startsWith("http")) {
      deleteSavedVideo(videoUrl);
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
            onClick={handleCloseOrCancel}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Entry Price (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 1.0850"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 8: Stop Loss */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Stop Loss (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 1.0820"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-rose-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Field 9: Take Profit */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Take Profit (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 1.0920"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="mt-1 w-full font-mono rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
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

          <TradeMediaAndPropertiesSection
            screenshots={screenshots}
            setScreenshots={setScreenshots}
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
            videoDurationSeconds={videoDurationSeconds}
            setVideoDurationSeconds={setVideoDurationSeconds}
            videoError={videoError}
            setVideoError={setVideoError}
            customProperties={customProperties}
            setCustomProperties={setCustomProperties}
            isBn={isBn}
            canUploadVideo={canUploadVideo}
            onRequestUpgrade={onRequestUpgrade}
          />

          {/* Footer Save Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseOrCancel}
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
