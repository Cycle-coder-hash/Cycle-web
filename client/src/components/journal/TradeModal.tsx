import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, AlertCircle, CheckCircle2, Image, Video, Sparkles, FileText, Eye, Film, Maximize2 } from "lucide-react";
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
  defaultDate?: string;
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      setEntryPrice(String(initialTrade.entryPrice ?? ""));
      setStopLoss(String(initialTrade.stopLoss ?? ""));
      setTakeProfit(String(initialTrade.takeProfit ?? ""));
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

  // Multiple screenshot images upload handler (No arbitrary limit)
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validImageFiles = fileList.filter((f) => f.type.startsWith("image/"));

    if (validImageFiles.length === 0) {
      alert("Please select valid image files (PNG, JPG, WEBP, etc.).");
      return;
    }

    const readers = validImageFiles.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((newImages) => {
      setScreenshots((prev) => [...prev, ...newImages]);
    });

    // Reset input value so same files can be re-selected if desired
    e.target.value = "";
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  // Video duration validation handler (MAX 1 MINUTE STRICTLY ENFORCED)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file (MP4, WEBM, MOV).");
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      if (duration > 60) {
        setVideoError(
          `Video rejected: Duration is ${Math.round(duration)} seconds. Maximum allowed video length is 1 minute (60 seconds).`
        );
        setVideoUrl(undefined);
        setVideoDurationSeconds(undefined);
        return;
      }

      // Accept video under 60 seconds
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUrl(reader.result as string);
        setVideoDurationSeconds(Math.round(duration));
      };
      reader.readAsDataURL(file);
    };
    video.src = URL.createObjectURL(file);
    e.target.value = "";
  };

  const handleRemoveVideo = () => {
    setVideoUrl(undefined);
    setVideoDurationSeconds(undefined);
    setVideoError(null);
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
    const parsedExit = parseFloat(exitPrice) || (initialTrade?.exitPrice ?? 0);
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

          {/* SECTION 6: MULTIPLE SCREENSHOTS & VIDEO (STRICT MAX 1 MINUTE VIDEO VALIDATION) */}
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Image size={15} className="text-cyan-500" />
                  <span>Field 19: Trade Screenshots & Media</span>
                  <span className="ml-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-black text-cyan-500">
                    {screenshots.length} {screenshots.length === 1 ? "Screenshot" : "Screenshots"}
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Attach multiple chart screenshots (HTF narrative, 1H POI, 5m/1m entry, runner, exit). No screenshot limit.
                </p>
              </div>

              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 self-start sm:self-center">
                * Video Limit: Max 1 Minute (60s)
              </span>
            </div>

            {videoError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={16} />
                <span>{videoError}</span>
              </div>
            )}

            {/* SCREENSHOTS GALLERY */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Attached Screenshots</span>
                  <span className="text-[10px] text-slate-400">({screenshots.length} saved with this trade)</span>
                </span>

                <label className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-cyan-500/50 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 cursor-pointer transition-all shadow-xs">
                  <Plus size={13} />
                  <span>{screenshots.length > 0 ? "Add More Screenshots" : "Upload Screenshots"}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {screenshots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {screenshots.map((src, index) => (
                    <div
                      key={index}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm"
                    >
                      <img
                        src={src}
                        alt={`Screenshot ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      {/* Screenshot Number Tag */}
                      <div className="absolute top-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-black text-cyan-400 backdrop-blur-xs border border-white/10">
                        #{index + 1}
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(src)}
                          className="rounded-lg bg-white/20 p-1.5 text-white hover:bg-white/30 backdrop-blur-xs transition"
                          title="View Full Resolution"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(index)}
                          className="rounded-lg bg-rose-600 p-1.5 text-white hover:bg-rose-700 transition shadow-md"
                          title="Delete this screenshot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add more tile */}
                  <label className="flex flex-col items-center justify-center aspect-video rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 hover:border-cyan-500 hover:bg-cyan-500/5 cursor-pointer transition text-center p-2">
                    <Plus size={18} className="text-cyan-500 mb-1" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Add Image</span>
                    <span className="text-[9px] text-slate-400">Multiple allowed</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 hover:border-cyan-500 hover:bg-cyan-500/5 transition">
                  <Upload size={24} className="text-cyan-500 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Click to select multiple screenshots (or drag & drop files)
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Supports PNG, JPG, WEBP • Select multiple images at once • Add as many as needed
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* VIDEO ATTACHMENT SECTION (MAX 60 SECONDS) */}
            <div className="border-t border-slate-200/60 pt-3 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Video size={13} className="text-purple-400" />
                  <span>Execution Video Clip (Optional • Strictly ≤ 60 seconds)</span>
                </span>
                {videoDurationSeconds && (
                  <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                    {videoDurationSeconds}s verified
                  </span>
                )}
              </div>

              {videoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
                  <video src={videoUrl} controls className="max-h-60 w-full object-contain" />
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="absolute top-2 right-2 rounded-full bg-rose-600 p-1.5 text-white hover:bg-rose-700 shadow-md transition"
                    title="Remove video clip"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 hover:border-purple-400 cursor-pointer transition">
                  <div className="flex items-center gap-2.5">
                    <Video size={16} className="text-purple-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Attach Execution Video Clip (MP4, WEBM)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Strict maximum duration: 1 minute (60 seconds)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-lg">
                    Browse Video
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
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

      {/* Lightbox Modal for Previewing Screenshot */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Close Preview"
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Screenshot Preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
