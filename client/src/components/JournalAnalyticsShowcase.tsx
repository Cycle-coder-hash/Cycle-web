import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Plus,
  Layers,
  Calendar,
  Edit,
  DollarSign,
  Percent,
  Flame,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  SlidersHorizontal,
  Sparkles,
  ChevronRight,
  Lock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";

interface JournalBookData {
  id: string;
  name: string;
  strategy: string;
  description: string;
  startingBalance: number;
  currentBalance: number;
  totalPnl: number;
  totalProfit: number;
  totalLoss: number;
  avgWin: number;
  avgLoss: number;
  netGrowth: number;
  winRate: number;
  profitFactor: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  totalTrades: number;
  ruleComplianceRate: number;
  compliantTrades: number;
  rules: string[];
  trajectory: {
    date: string;
    balance: number;
    pnl: number;
    growth: number;
  }[];
}

const PREVIEW_BOOKS: Record<string, JournalBookData> = {
  ragf: {
    id: "ragf",
    name: "TREND FLOW",
    strategy: "TREND FLOW • Order Flow",
    description: "Strict execution checklist. Before clicking execute, ensure all rules align.",
    startingBalance: 10000,
    currentBalance: 13420,
    totalPnl: 3420,
    totalProfit: 4820,
    totalLoss: 1400,
    avgWin: 438.18,
    avgLoss: 175.0,
    netGrowth: 34.2,
    winRate: 68.8,
    profitFactor: 3.44,
    winningTrades: 11,
    losingTrades: 4,
    breakevenTrades: 1,
    totalTrades: 16,
    ruleComplianceRate: 93.8,
    compliantTrades: 15,
    rules: [
      "Maximum risk per trade is strictly 1% of account balance.",
      "Always wait for market structure confirmation before entry.",
      "Target next high-timeframe liquidity pool; no early emotional closes.",
    ],
    trajectory: [
      { date: "Day 1", balance: 10000, pnl: 0, growth: 0 },
      { date: "Day 4", balance: 10440, pnl: 440, growth: 4.4 },
      { date: "Day 7", balance: 10270, pnl: -170, growth: 2.7 },
      { date: "Day 10", balance: 10760, pnl: 490, growth: 7.6 },
      { date: "Day 13", balance: 11240, pnl: 480, growth: 12.4 },
      { date: "Day 16", balance: 11090, pnl: -150, growth: 10.9 },
      { date: "Day 19", balance: 11680, pnl: 590, growth: 16.8 },
      { date: "Day 22", balance: 12210, pnl: 530, growth: 22.1 },
      { date: "Day 25", balance: 12040, pnl: -170, growth: 20.4 },
      { date: "Day 28", balance: 12580, pnl: 540, growth: 25.8 },
      { date: "Day 31", balance: 13000, pnl: 420, growth: 30.0 },
      { date: "Day 34", balance: 13420, pnl: 420, growth: 34.2 },
    ],
  },
  qpc: {
    id: "qpc",
    name: "CRT",
    strategy: "CRT • Session Cycle",
    description: "London manipulation sweep into New York session trend continuation.",
    startingBalance: 5000,
    currentBalance: 6890,
    totalPnl: 1890,
    totalProfit: 2420,
    totalLoss: 530,
    avgWin: 345.71,
    avgLoss: 176.67,
    netGrowth: 37.8,
    winRate: 70.0,
    profitFactor: 4.56,
    winningTrades: 7,
    losingTrades: 3,
    breakevenTrades: 0,
    totalTrades: 10,
    ruleComplianceRate: 90.0,
    compliantTrades: 9,
    rules: [
      "Only execute during London/New York session overlap window.",
      "Confirm clean liquidity grab prior to entering expansion.",
    ],
    trajectory: [
      { date: "Day 1", balance: 5000, pnl: 0, growth: 0 },
      { date: "Day 4", balance: 5350, pnl: 350, growth: 7.0 },
      { date: "Day 8", balance: 5720, pnl: 370, growth: 14.4 },
      { date: "Day 12", balance: 5540, pnl: -180, growth: 10.8 },
      { date: "Day 17", balance: 5980, pnl: 440, growth: 19.6 },
      { date: "Day 21", balance: 6360, pnl: 380, growth: 27.2 },
      { date: "Day 25", balance: 6190, pnl: -170, growth: 23.8 },
      { date: "Day 29", balance: 6570, pnl: 380, growth: 31.4 },
      { date: "Day 33", balance: 6890, pnl: 320, growth: 37.8 },
    ],
  },
  all: {
    id: "all",
    name: "Combined Portfolio",
    strategy: "All Strategy Books",
    description: "Consolidated multi-book equity growth and discipline verification.",
    startingBalance: 15000,
    currentBalance: 20310,
    totalPnl: 5310,
    totalProfit: 7240,
    totalLoss: 1930,
    avgWin: 402.22,
    avgLoss: 175.45,
    netGrowth: 35.4,
    winRate: 69.2,
    profitFactor: 3.75,
    winningTrades: 18,
    losingTrades: 7,
    breakevenTrades: 1,
    totalTrades: 26,
    ruleComplianceRate: 92.3,
    compliantTrades: 24,
    rules: [
      "Maximum daily portfolio risk across all books strictly capped at 2%.",
      "No correlated positions allowed simultaneously across different books.",
    ],
    trajectory: [
      { date: "Day 1", balance: 15000, pnl: 0, growth: 0 },
      { date: "Day 5", balance: 15790, pnl: 790, growth: 5.3 },
      { date: "Day 10", balance: 16480, pnl: 690, growth: 9.9 },
      { date: "Day 15", balance: 17220, pnl: 740, growth: 14.8 },
      { date: "Day 20", balance: 18190, pnl: 970, growth: 21.3 },
      { date: "Day 25", balance: 18780, pnl: 590, growth: 25.2 },
      { date: "Day 30", balance: 19570, pnl: 790, growth: 30.5 },
      { date: "Day 35", balance: 20310, pnl: 740, growth: 35.4 },
    ],
  },
};

interface Props {
  isBn: boolean;
}

export function JournalAnalyticsShowcase({ isBn }: Props) {
  const [selectedBookId, setSelectedBookId] = useState<"ragf" | "qpc" | "all">("ragf");
  const [chartMode, setChartMode] = useState<"balance" | "growth" | "period">("balance");
  const [isVisible, setIsVisible] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Tilt & Cursor Follower Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  const targetRef = useRef({
    rotX: 0,
    rotY: 0,
    transX: 0,
    transY: 0,
    sheenX: 50,
    sheenY: 50,
  });

  const currentRef = useRef({
    rotX: 0,
    rotY: 0,
    transX: 0,
    transY: 0,
    sheenX: 50,
    sheenY: 50,
  });

  const rafIdRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);

  // Check pointer capability and reduced motion preferences
  useEffect(() => {
    if (typeof window === "undefined") return;

    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkEligibility = () => {
      setIsPointerFine(finePointerQuery.matches && !reducedMotionQuery.matches);
    };

    checkEligibility();

    finePointerQuery.addEventListener("change", checkEligibility);
    reducedMotionQuery.addEventListener("change", checkEligibility);

    return () => {
      finePointerQuery.removeEventListener("change", checkEligibility);
      reducedMotionQuery.removeEventListener("change", checkEligibility);
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // RAF motion update loop with lerp damping for smooth inertia
  const updateMotion = () => {
    const target = targetRef.current;
    const current = currentRef.current;
    const lerp = 0.08; // smooth inertia damping

    current.rotX += (target.rotX - current.rotX) * lerp;
    current.rotY += (target.rotY - current.rotY) * lerp;
    current.transX += (target.transX - current.transX) * lerp;
    current.transY += (target.transY - current.transY) * lerp;
    current.sheenX += (target.sheenX - current.sheenX) * lerp;
    current.sheenY += (target.sheenY - current.sheenY) * lerp;

    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1200px) rotateX(${current.rotX.toFixed(3)}deg) rotateY(${current.rotY.toFixed(3)}deg) translate3d(${current.transX.toFixed(2)}px, ${current.transY.toFixed(2)}px, 0px)`;
    }

    if (sheenRef.current) {
      sheenRef.current.style.background = `radial-gradient(750px circle at ${current.sheenX.toFixed(1)}% ${current.sheenY.toFixed(1)}%, rgba(56, 189, 248, 0.12), transparent 65%)`;
    }

    const deltaRot = Math.abs(target.rotX - current.rotX) + Math.abs(target.rotY - current.rotY);
    const deltaTrans = Math.abs(target.transX - current.transX) + Math.abs(target.transY - current.transY);

    if (isHoveringRef.current || deltaRot > 0.005 || deltaTrans > 0.03) {
      rafIdRef.current = requestAnimationFrame(updateMotion);
    } else {
      // Settled at neutral (0, 0)
      current.rotX = 0;
      current.rotY = 0;
      current.transX = 0;
      current.transY = 0;
      current.sheenX = 50;
      current.sheenY = 50;
      if (cardRef.current) {
        cardRef.current.style.transform = "";
      }
      if (sheenRef.current) {
        sheenRef.current.style.opacity = "0";
      }
      rafIdRef.current = null;
    }
  };

  const handlePointerEnter = () => {
    if (!isPointerFine) return;
    isHoveringRef.current = true;
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "1";
    }
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateMotion);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerFine || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Relative coordinates normalized to [-0.5, 0.5]
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;

    const clampedX = Math.max(-0.5, Math.min(0.5, normX));
    const clampedY = Math.max(-0.5, Math.min(0.5, normY));

    // Subtle restrained tilt limits (deg) and translation (px)
    const MAX_TILT_X = 3.5;
    const MAX_TILT_Y = 4.0;
    const MAX_TRANS_X = 6.0;
    const MAX_TRANS_Y = 5.0;

    targetRef.current = {
      rotX: -clampedY * MAX_TILT_X * 2,
      rotY: clampedX * MAX_TILT_Y * 2,
      transX: clampedX * MAX_TRANS_X * 2,
      transY: clampedY * MAX_TRANS_Y * 2,
      sheenX: (clampedX + 0.5) * 100,
      sheenY: (clampedY + 0.5) * 100,
    };

    isHoveringRef.current = true;
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateMotion);
    }
  };

  const handlePointerLeave = () => {
    if (!isPointerFine) return;
    isHoveringRef.current = false;
    targetRef.current = {
      rotX: 0,
      rotY: 0,
      transX: 0,
      transY: 0,
      sheenX: 50,
      sheenY: 50,
    };
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateMotion);
    }
  };

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const book = PREVIEW_BOOKS[selectedBookId];

  return (
    <section
      ref={sectionRef}
      id="journal-analytics"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-28 text-slate-900 dark:text-white border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070e1b] transition-colors"
    >
      {/* Subtle Ambient Glow Behind Showcase */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-cyan-500/10 blur-[150px] dark:hidden ambient-blur-blob" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Section Header */}
        <div
          className={`flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 mb-4 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isBn
                ? "বিল্ট-ইন ট্রেডিং জার্নাল ও পারফরম্যান্স অডিট"
                : "BUILT-IN TRADING JOURNAL & PERFORMANCE"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {isBn ? "শক্তিশালী জার্নাল অ্যানালিটিক্স" : "Powerful Journal Analytics"}
          </h2>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
            {isBn
              ? "ট্রেড ট্র্যাক করুন, প্রতিটি ডিসিশন অডিট করুন এবং আপনার স্ট্র্যাটেজি নিখুঁত করুন। মাল্টি-বুক পোর্টফোলিও, রুল ডিসিপ্লিন ভেরিফিকেশন এবং অটোমেটেড গ্রোথ কার্ভ—সব এক প্ল্যাটফর্মে।"
              : "Track, analyze, and systematically improve your trading performance. Built-in multi-book strategy logs, automated equity curves, and strict rule discipline verification."}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800/80 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {isBn ? "লাইভ ইন্টারেক্টিভ প্রিভিউ" : "Live Interactive Preview"}
            </span>
            <span>•</span>
            <span>{isBn ? "ট্যাব পরিবর্তন করে দেখুন" : "Click tabs & books to interact"}</span>
          </div>
        </div>

        {/* Dashboard Frame / Preview Container */}
        {/* Dashboard Frame / Preview Container */}
        <div
          className={`relative mx-auto transition-all duration-800 ease-out ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
          }`}
        >
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            className="relative [perspective:1200px]"
          >
            <div
              ref={cardRef}
              style={{
                transformStyle: isPointerFine ? "preserve-3d" : "flat",
              }}
              className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-[#071120]/90 dark:shadow-sky-950/30 transition-[background-color,border-color] duration-200 will-change-transform"
            >
              {/* Dynamic Specular / Ambient Sheen tracking mouse position */}
              {isPointerFine && (
                <div
                  ref={sheenRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 z-30"
                  style={{
                    background:
                      "radial-gradient(750px circle at 50% 50%, rgba(56, 189, 248, 0.12), transparent 65%)",
                  }}
                />
              )}

              {/* Top Window Chrome / Terminal Bar */}
              <div
                style={{ transform: isPointerFine ? "translateZ(8px)" : undefined }}
                className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80 mb-6"
              >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-[11px] font-mono text-slate-400 hidden sm:inline">
                portal.cycleofchart.com/journal
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500 dark:text-cyan-400">
                <ShieldCheck className="h-3 w-3" />
                {isBn ? "ইন্সটিটিউশনাল অডিট গ্রেড" : "Institutional Audit Grade"}
              </span>
            </div>
          </div>

          {/* Header & New Entry CTA Row */}
          <div
            style={{ transform: isPointerFine ? "translateZ(10px)" : undefined }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isBn ? "ইন্সটিটিউশনাল ট্রেডার জার্নাল ও পারফরম্যান্স" : "Institutional Trader Journal & Performance"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? "মাল্টি-স্ট্র্যাটেজি বুক, স্বয়ংক্রিয় ইকুইটি কার্ভ এবং ২১-পয়েন্ট এক্সিকিউশন অডিট"
                    : "Multi-book strategy logs, automated equity curves, and complete 21-point execution audit"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold gap-1 text-slate-700 dark:text-slate-300 cursor-default"
              >
                <Plus className="h-3.5 w-3.5" />
                {isBn ? "নতুন জার্নাল বুক" : "New Journal Book"}
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black gap-1.5 shadow-md shadow-cyan-500/20 px-3 cursor-default"
              >
                <Plus className="h-3.5 w-3.5" />
                {isBn ? "+ লগ নিউ ট্রেড" : "+ Log New Trade"}
              </Button>
            </div>
          </div>

          {/* Interactive Multi-Book Selector Tabs */}
          <div
            style={{ transform: isPointerFine ? "translateZ(14px)" : undefined }}
            className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin"
          >
            {/* All / Combined Portfolio */}
            <button
              onClick={() => setSelectedBookId("all")}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                selectedBookId === "all"
                  ? "border-cyan-500/60 bg-[#081833] text-white shadow-md shadow-cyan-500/10 dark:bg-cyan-500 dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>{isBn ? "সম্মিলিত পোর্টফোলিও (সকল বুক)" : "Combined Portfolio (All Books)"}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">26</span>
            </button>

            {/* QPC Model Book */}
            <button
              onClick={() => setSelectedBookId("qpc")}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                selectedBookId === "qpc"
                  ? "border-cyan-500/60 bg-[#081833] text-white shadow-md shadow-cyan-500/10 dark:bg-cyan-500 dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <div className="text-left">
                <div className="font-extrabold">CRT</div>
                <div className="text-[10px] opacity-75 font-mono">$5,000 start</div>
              </div>
              <span className="ml-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-black">
                10
              </span>
            </button>

            {/* TREND FLOW Book (Default Active in user screenshot) */}
            <button
              onClick={() => setSelectedBookId("ragf")}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                selectedBookId === "ragf"
                  ? "border-cyan-500/60 bg-[#081833] text-white shadow-md shadow-cyan-500/10 dark:bg-cyan-500 dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <div className="text-left">
                <div className="font-extrabold">TREND FLOW</div>
                <div className="text-[10px] opacity-75 font-mono">$10,000 start</div>
              </div>
              <span className="ml-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-black">
                16
              </span>
            </button>
          </div>

          {/* Active Book Info Bar */}
          <div
            style={{ transform: isPointerFine ? "translateZ(8px)" : undefined }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {book.name}
                  </span>
                  <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500 dark:text-cyan-400">
                    {book.strategy}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {book.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                {isBn ? "ক্যালেন্ডার ভিউ" : "Calendar View"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Edit className="h-3.5 w-3.5 text-slate-400" />
                {isBn ? "বুক এডিট" : "Edit Book"}
              </span>
            </div>
          </div>

          {/* 4 Key Metric Cards (KPIs) */}
          <div
            style={{ transform: isPointerFine ? "translateZ(16px)" : undefined }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {/* Card 1: Account Capital */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isBn ? "ব্যালেন্স প্রবৃদ্ধি" : "Account Capital"}
                </span>
                <DollarSign className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  ${book.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>{isBn ? "প্রারম্ভিক:" : "Initial:"}</span>
                  <span className="font-mono">${book.startingBalance.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[11px] font-black text-emerald-500">
                  <TrendingUp className="h-3 w-3" />
                  +{book.netGrowth}%
                </span>
                <span className="text-[11px] text-slate-400">Net Growth</span>
              </div>
            </div>

            {/* Card 2: Total Net P&L */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isBn ? "মোট নিট লাভ" : "Total Net P&L"}
                </span>
                <Percent className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2.5">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-500">
                  +${book.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 flex items-center gap-2.5 text-xs font-bold">
                  <span className="text-emerald-500">+${book.totalProfit.toLocaleString()}</span>
                  <span className="text-rose-500">-${book.totalLoss.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Avg Win: ${book.avgWin.toFixed(1)}</span>
                <span>Avg Loss: ${book.avgLoss.toFixed(1)}</span>
              </div>
            </div>

            {/* Card 3: Win Rate & Factor */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isBn ? "উইনরেট ও ফ্যাক্টর" : "Win Rate & Factor"}
                </span>
                <Flame className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {book.winRate}%
                </div>
                <span className="text-xs font-bold text-slate-500">
                  PF: {book.profitFactor}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold">
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-emerald-500 font-mono">
                  {book.winningTrades}W
                </span>
                <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-rose-500 font-mono">
                  {book.losingTrades}L
                </span>
                {book.breakevenTrades > 0 && (
                  <span className="rounded-md bg-slate-500/10 px-1.5 py-0.5 text-slate-400 font-mono">
                    {book.breakevenTrades}BE
                  </span>
                )}
                <span className="text-slate-400 ml-auto">{book.totalTrades} Trades</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${book.winRate}%` }}
                />
              </div>
            </div>

            {/* Card 4: Rule Discipline Adherence */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isBn ? "রুলস ডিসিপ্লিন স্কোর" : "Rule Discipline"}
                </span>
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {book.ruleComplianceRate}%
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {isBn ? "অনুমোদন" : "Adherence"}
                </span>
              </div>
              <div className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {book.compliantTrades} of {book.totalTrades} setups strictly obeyed rules
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${book.ruleComplianceRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Strategy Rules & Discipline Card */}
          <div
            style={{ transform: isPointerFine ? "translateZ(12px)" : undefined }}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70 mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-cyan-500" />
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Strategy Rules & Discipline — {book.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {book.description}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-xl border border-cyan-500/30 text-cyan-500 bg-cyan-500/5 px-2.5 py-1 text-xs font-bold self-start sm:self-center">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Manage Rules
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {book.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-xs font-black text-cyan-500 dark:text-cyan-400">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {rule}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Analytics & Growth Curve Chart Card */}
          <div
            style={{ transform: isPointerFine ? "translateZ(10px)" : undefined }}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-500" />
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {isBn ? "পারফরম্যান্স ও গ্রোথ কার্ভ" : "Performance Analytics & Growth Curve"}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn
                    ? "ক্যাপিটাল প্রবৃদ্ধি ও পর্যায়ভিত্তিক P&L"
                    : "Real-time balance trajectory & periodic returns"}
                </p>
              </div>

              {/* Chart Mode Interactive Tabs */}
              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950 self-start sm:self-center">
                <button
                  onClick={() => setChartMode("balance")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                    chartMode === "balance"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Balance Curve
                </button>
                <button
                  onClick={() => setChartMode("growth")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                    chartMode === "growth"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Growth %
                </button>
                <button
                  onClick={() => setChartMode("period")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                    chartMode === "period"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Period P&L
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="mt-6 h-64 sm:h-72 w-full">
              {chartMode === "period" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={book.trajectory.slice(1)}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [`$${val}`, "P&L"]}
                    />
                    <Bar
                      dataKey="pnl"
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={book.trajectory}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="showcaseBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        chartMode === "growth"
                          ? `+${v}%`
                          : `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                      }
                      domain={
                        chartMode === "growth"
                          ? [0, "dataMax + 5"]
                          : ["dataMin - 300", "dataMax + 300"]
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [
                        chartMode === "growth" ? `+${val}%` : `$${Number(val).toLocaleString()}`,
                        chartMode === "growth" ? "Net Growth" : "Account Capital",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey={chartMode === "growth" ? "growth" : "balance"}
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#showcaseBalanceGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Footer Bar inside showcase linking to Roadmap / Dashboard */}
          <div
            style={{ transform: isPointerFine ? "translateZ(6px)" : undefined }}
            className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Lock className="h-4 w-4 text-cyan-500" />
              <span>
                {isBn
                  ? "সকল রেজিস্টার্ড মেম্বারদের জন্য আনলিমিটেড মাল্টি-বুক জার্নাল অন্তর্ভুক্ত।"
                  : "Included with full student pass and institutional portal access."}
              </span>
            </div>

            <a
              href="#roadmap"
              className="inline-flex items-center font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors gap-1 self-start sm:self-auto"
            >
              <span>{isBn ? "রোডম্যাপে জার্নালিং স্টেজ দেখুন" : "Explore Journaling in Roadmap"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
