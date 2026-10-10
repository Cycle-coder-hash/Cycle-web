import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Trophy,
  AlertCircle,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { TopNavLinks } from "@/components/TopNavLinks";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { trpc } from "@/lib/trpc";
import type { LeaderboardTrader } from "@shared/types/leaderboard";
import {
  LeaderboardRankingsSection,
  TraderPerformanceModal,
} from "@/features/leaderboard/components/LeaderboardRankingsSection";

/* ========================================================================= */
/* TASK 1(a): PERSISTENT TWINKLING AMBIENT STARFIELD (~30-35 STARS, 1-3PX)   */
/* ========================================================================= */
const AMBIENT_STARFIELD = [
  { top: "8%", left: "11%", size: 2, dur: "2.4s", delay: "0.2s" },
  { top: "14%", left: "26%", size: 1.5, dur: "3.1s", delay: "1.1s" },
  { top: "21%", left: "43%", size: 2.5, dur: "2.8s", delay: "0.5s" },
  { top: "11%", left: "61%", size: 1, dur: "2.2s", delay: "1.8s" },
  { top: "17%", left: "77%", size: 2, dur: "3.4s", delay: "0.9s" },
  { top: "24%", left: "91%", size: 3, dur: "2.6s", delay: "0.3s" },
  { top: "33%", left: "7%", size: 1.5, dur: "3.0s", delay: "1.4s" },
  { top: "41%", left: "21%", size: 2, dur: "2.5s", delay: "0.7s" },
  { top: "37%", left: "36%", size: 1, dur: "3.3s", delay: "2.0s" },
  { top: "47%", left: "53%", size: 2.5, dur: "2.9s", delay: "1.2s" },
  { top: "39%", left: "68%", size: 1.5, dur: "2.3s", delay: "0.4s" },
  { top: "31%", left: "83%", size: 2, dur: "3.2s", delay: "1.6s" },
  { top: "51%", left: "95%", size: 1, dur: "2.7s", delay: "0.8s" },
  { top: "59%", left: "4%", size: 2, dur: "3.5s", delay: "2.2s" },
  { top: "67%", left: "17%", size: 2.5, dur: "2.4s", delay: "0.6s" },
  { top: "57%", left: "31%", size: 1, dur: "3.0s", delay: "1.9s" },
  { top: "64%", left: "47%", size: 1.5, dur: "2.8s", delay: "1.0s" },
  { top: "71%", left: "63%", size: 2, dur: "2.5s", delay: "0.1s" },
  { top: "61%", left: "78%", size: 3, dur: "3.3s", delay: "1.5s" },
  { top: "69%", left: "87%", size: 1.5, dur: "2.6s", delay: "2.4s" },
  { top: "79%", left: "13%", size: 1, dur: "3.1s", delay: "0.9s" },
  { top: "85%", left: "28%", size: 2, dur: "2.7s", delay: "1.7s" },
  { top: "77%", left: "42%", size: 2.5, dur: "3.4s", delay: "0.3s" },
  { top: "83%", left: "58%", size: 1.5, dur: "2.2s", delay: "1.3s" },
  { top: "89%", left: "72%", size: 2, dur: "2.9s", delay: "2.1s" },
  { top: "81%", left: "85%", size: 1, dur: "3.0s", delay: "0.5s" },
  { top: "91%", left: "94%", size: 2, dur: "2.4s", delay: "1.0s" },
  { top: "9%", left: "39%", size: 1.5, dur: "3.2s", delay: "1.2s" },
  { top: "27%", left: "15%", size: 2, dur: "2.6s", delay: "2.0s" },
  { top: "49%", left: "81%", size: 1, dur: "3.5s", delay: "0.8s" },
  { top: "74%", left: "24%", size: 2, dur: "2.3s", delay: "1.4s" },
  { top: "87%", left: "49%", size: 1.5, dur: "2.8s", delay: "0.2s" },
  { top: "54%", left: "10%", size: 2, dur: "3.1s", delay: "0.4s" },
  { top: "19%", left: "51%", size: 1.5, dur: "2.5s", delay: "1.6s" },
];

function TwinklingStarfield() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {AMBIENT_STARFIELD.map((star, idx) => (
        <span
          key={idx}
          className="hero-twinkling-star absolute rounded-full bg-white dark:bg-white shadow-[0_0_4px_rgba(255,255,255,0.85)]"
          style={
            {
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              "--twinkle-dur": star.dur,
              "--twinkle-delay": star.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ========================================================================= */
/* TASK 1(b): HERO SECTION STARRY / SPARKLE CURSOR-TRAIL EFFECT (2-6PX)       */
/* ========================================================================= */
interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
  color: string;
  shape: "star" | "diamond";
}

const SPARKLE_COLORS = [
  "#ffffff", // pure white
  "#f0f9ff", // luminous ice white
  "#38bdf8", // bright sky blue
  "#22d3ee", // cyan
  "#67e8f9", // glowing cyan
  "#a5f3fc", // radiant cyan
  "#34d399", // emerald shimmer
];

function HeroSparkleCanvas({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SparkParticle[]>([]);
  const isRunningRef = useRef(false);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let rafId: number | null = null;
    let lastTime = performance.now();

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
    };

    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(container);

    const spawnSpark = (x: number, y: number) => {
      if (particlesRef.current.length > 45) return;
      const maxLife = 700 + Math.random() * 300; // 700-1000ms life
      const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
      const shape = Math.random() > 0.35 ? "star" : "diamond";
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.6) * 0.7, // Slight upward drift
        size: shape === "star" ? 3 + Math.random() * 3 : 2 + Math.random() * 3, // 2-6px sparks
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        life: maxLife,
        maxLife,
        color,
        shape,
      });

      if (!isRunningRef.current) {
        isRunningRef.current = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(render);
      }
    };

    const render = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        const progress = p.life / p.maxLife; // 1 -> 0
        const lifePassed = 1 - progress; // 0 -> 1

        let alpha = 1;
        let scale = 1;
        if (lifePassed < 0.15) {
          const t = lifePassed / 0.15;
          alpha = t;
          scale = 0.5 + t * 0.5;
        } else {
          const t = (lifePassed - 0.15) / 0.85;
          alpha = 1 - t;
          scale = 1 - t * 0.45;
        }

        const size = p.size * scale;
        if (size <= 0.2) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        // Outer neon glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = size * 2.2;
        ctx.fillStyle = p.color;

        if (p.shape === "star") {
          const spikes = 4;
          const outer = size;
          const inner = size * 0.22;
          ctx.beginPath();
          for (let s = 0; s < spikes * 2; s++) {
            const radius = s % 2 === 0 ? outer : inner;
            const angle = (s * Math.PI) / spikes;
            const sx = Math.cos(angle) * radius;
            const sy = Math.sin(angle) * radius;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();

          // Intense core dot
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Diamond spark
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.45, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size * 0.45, 0);
          ctx.closePath();
          ctx.fill();

          // Intense core
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();

      if (particles.length > 0) {
        rafId = requestAnimationFrame(render);
      } else {
        isRunningRef.current = false;
        rafId = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      // Throttle spawn rate (~one spark per 25-30ms of movement)
      if (now - lastSpawnRef.current < 28) return;
      lastSpawnRef.current = now;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      spawnSpark(x, y);
      if (Math.random() > 0.65) {
        spawnSpark(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10);
      }
    };

    container.addEventListener("pointermove", handlePointerMove);

    return () => {
      ro.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  );
}

/* ========================================================================= */
/* TASK 5: 5-PILLAR SCORE FORMULA DATA CONFIGURATION                         */
/* ========================================================================= */
interface StatPillar {
  id: string;
  titleEn: string;
  titleBn: string;
  weight: string;
  subEn: string;
  subBn: string;
  baseColor: string;
  hoverClasses: string;
}

const STAT_PILLARS: StatPillar[] = [
  {
    id: "rule-adherence",
    titleEn: "Rule Adherence",
    titleBn: "রিস্ক মেনে চলা",
    weight: "25%",
    subEn: "Base Weight",
    subBn: "বেস ওয়েট",
    baseColor: "border-sky-500/20 bg-sky-500/5 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400",
    hoverClasses: "hover:border-sky-400/80 hover:bg-sky-500/15 hover:shadow-[0_0_24px_rgba(14,165,233,0.38)]",
  },
  {
    id: "discipline-routine",
    titleEn: "Discipline Routine",
    titleBn: "ডেইলি ডিসিপ্লিন",
    weight: "25%",
    subEn: "Execution Habit",
    subBn: "এক্সিকিউশন হ্যাবিট",
    baseColor: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    hoverClasses: "hover:border-emerald-400/80 hover:bg-emerald-500/15 hover:shadow-[0_0_24px_rgba(16,185,129,0.38)]",
  },
  {
    id: "win-rate",
    titleEn: "Win Rate",
    titleBn: "উইন রেট",
    weight: "20%",
    subEn: "Trade Quality",
    subBn: "ট্রেড কোয়ালিটি",
    baseColor: "border-cyan-500/20 bg-cyan-500/5 text-cyan-600 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-400",
    hoverClasses: "hover:border-cyan-400/80 hover:bg-cyan-500/15 hover:shadow-[0_0_24px_rgba(6,182,212,0.38)]",
  },
  {
    id: "consistency",
    titleEn: "Consistency",
    titleBn: "ধারাবাহিকতা",
    weight: "15%",
    subEn: "Streaks & Days",
    subBn: "স্ট্রিক্স ও দিন",
    baseColor: "border-purple-500/20 bg-purple-500/5 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400",
    hoverClasses: "hover:border-purple-400/80 hover:bg-purple-500/15 hover:shadow-[0_0_24px_rgba(168,85,247,0.38)]",
  },
  {
    id: "profit-factor",
    titleEn: "Profit Factor",
    titleBn: "প্রফিট ফ্যাক্টর",
    weight: "15%",
    subEn: "Risk : Reward",
    subBn: "রিস্ক : রিওয়ার্ড",
    baseColor: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    hoverClasses: "hover:border-amber-400/80 hover:bg-amber-500/15 hover:shadow-[0_0_24px_rgba(245,158,11,0.38)]",
  },
];

export default function Leaderboard() {
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const { user, loading: isAuthLoading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });

  // Language state (synced with LanguageContext)
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Auth gate fallback
  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/login");
    }
  }, [user, isAuthLoading, setLocation]);

  // ---------------------------------------------------------------------------
  // TASK 1: Ref for hero section cursor sparkles
  // ---------------------------------------------------------------------------
  const heroSectionRef = useRef<HTMLElement>(null);

  // ---------------------------------------------------------------------------
  // TASK 5: Stat boxes moving row & reduced-motion preference
  // ---------------------------------------------------------------------------
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Selected trader for performance breakdown modal
  const [selectedTrader, setSelectedTrader] = useState<LeaderboardTrader | null>(null);

  // Fetch real all-time rankings from server
  const { data: rankings, isLoading, isError, refetch } = trpc.leaderboard.rankings.useQuery(
    { timeframe: "all" },
    { enabled: !!user, refetchOnWindowFocus: false, staleTime: 10000 }
  );

  // Strictly restrict to the Global Top 30 ranked real traders
  const top30Global = useMemo(() => {
    if (!rankings) return [];
    return rankings.slice(0, 30);
  }, [rankings]);

  // Filtered rankings based on search input (strictly within Top 30)
  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return top30Global;
    const q = searchQuery.toLowerCase();
    return top30Global.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.role?.toLowerCase().includes(q) ||
        r.bestPair?.toLowerCase().includes(q)
    );
  }, [top30Global, searchQuery]);

  // Podium Traders (#1, #2, #3)
  const topThree = useMemo(() => {
    if (!filteredRankings.length) return [];
    return filteredRankings.slice(0, 3);
  }, [filteredRankings]);

  // Ranks #4 through #30 (strictly the remaining users below podium up to 30)
  const restRankings = useMemo(() => {
    if (filteredRankings.length <= 3) return [];
    return filteredRankings.slice(3, 30);
  }, [filteredRankings]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070e1b] flex items-center justify-center">
        <div className="size-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] text-[#09111f] dark:bg-[#070e1b] dark:text-slate-100 transition-colors duration-300 ${
        isBn ? "font-bangla" : ""
      }`}
    >
      {/* ========================================================================= */}
      {/* HEADER / NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 text-slate-900 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-[#070e1b]/85 dark:text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size={40} className="shrink-0" />
            <div className="flex flex-col">
              <HeaderBrandWordmark className="text-xs sm:text-sm" />
              <span className="text-[10px] font-bold text-[#0284c7] dark:text-sky-400">
                {isBn ? "গ্লোবাল লিডারবোর্ড" : "GLOBAL LEADERBOARD"}
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <TopNavLinks isBn={isBn} />

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Mode"
              className="flex size-9 items-center justify-center rounded-full border border-slate-300/80 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language Switcher */}
            <LanguageSelector />

            {/* User portal CTA */}
            <Link href="/dashboard">
              <Button size="sm" className="hidden sm:inline-flex bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl">
                {isBn ? "আমার ড্যাশবোর্ড" : "My Dashboard"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* ======================================================================= */}
        {/* HERO SECTION & SCORING PHILOSOPHY */}
        {/* ======================================================================= */}
        <section
          ref={heroSectionRef}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/90 to-slate-50/90 p-6 sm:p-10 dark:border-slate-800/80 dark:from-[#081326]/90 dark:to-[#050b17]/95 backdrop-blur-md shadow-xl"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          {/* TASK 1(a): Persistent twinkling ambient starfield (always running) */}
          <TwinklingStarfield />

          {/* TASK 1(b): Interactive cursor-follow spark trail canvas (on hover/mouse-move) */}
          <HeroSparkleCanvas containerRef={heroSectionRef} />

          <div className="relative z-10 space-y-5">
            <div className="max-w-3xl space-y-4">
              {/* TASK 2: BADGE WITH LOOPING LIGHT-SWEEP AND SOFT PULSING GLOW RING */}
              <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 leaderboard-badge-glow overflow-hidden select-none">
                <div
                  className="pointer-events-none absolute -inset-y-2 -left-2 w-1/2 bg-gradient-to-r from-transparent via-amber-200/40 dark:via-amber-100/40 to-transparent leaderboard-badge-shine"
                  aria-hidden="true"
                />
                <Trophy size={14} className="text-amber-500 shrink-0 relative z-10" />
                <span className="relative z-10">{isBn ? "রিয়েল ট্রেডার পারফরম্যান্স সিস্টেম" : "REAL TRADER PERFORMANCE SYSTEM"}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {isBn ? (
                  <>
                    সুশৃঙ্খল নিয়ম ও রিয়েল এক্সিকিউশন। <br />
                    <span className="heading-gradient-shimmer">
                      আন্দাজে জুয়া নয়, প্রসেস-ভিত্তিক লিডারবোর্ড।
                    </span>
                  </>
                ) : (
                  <>
                    Rule Compliance & Authentic Execution. <br />
                    <span className="heading-gradient-shimmer">
                      Ranked by Process, Not Blind Gambling.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isBn
                  ? "সাইকেল অব চার্ট লিডারবোর্ড শুধুমাত্র লাভের অঙ্কে নির্ধারণ করা হয় না। ট্রেডিং রুলস অনুসরণ, দৈনিক ডিসিপ্লিন রুটিন, ধারাবাহিক জার্নালিং এবং সুশৃঙ্খল রিস্ক ম্যানেজমেন্টের ওপর ভিত্তি করে অল-টাইম স্কোর নির্ণয় করা হয়।"
                  : "The Cycle of Chart Global Leaderboard is not dictated by raw profit alone. Real rankings are computed from verified trader adherence, daily discipline habits, consistency streaks, and risk management quality."}
              </p>
            </div>

            {/* TASK 5: CONTINUOUS SCROLLING STAT BOXES TICKER (EDUCATE.IO STYLE) */}
            {isReducedMotion ? (
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center max-w-3xl">
                {STAT_PILLARS.map((pillar, idx) => (
                  <div
                    key={pillar.id}
                    className={`rounded-xl border p-2.5 transition-colors ${pillar.baseColor} ${pillar.hoverClasses} ${
                      idx === 4 ? "col-span-2 sm:col-span-1" : ""
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      {isBn ? pillar.titleBn : pillar.titleEn}
                    </div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {pillar.weight}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isBn ? pillar.subBn : pillar.subEn}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative pt-1 w-full max-w-4xl overflow-hidden stat-ticker-mask">
                <div className="stat-ticker-track py-3">
                  {/* Set 1 (5 cards) */}
                  <div className="flex shrink-0 items-center gap-3 pr-3">
                    {STAT_PILLARS.map((pillar) => (
                      <div
                        key={`set1-${pillar.id}`}
                        className={`w-[170px] sm:w-[195px] shrink-0 text-center rounded-xl border p-2.5 transition-all duration-300 ease-out cursor-default hover:-translate-y-1 ${pillar.baseColor} ${pillar.hoverClasses}`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider">
                          {isBn ? pillar.titleBn : pillar.titleEn}
                        </div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white">
                          {pillar.weight}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isBn ? pillar.subBn : pillar.subEn}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Set 2 (Identical duplicate of 5 cards for seamless 10-card 50% loop) */}
                  <div aria-hidden="true" className="flex shrink-0 items-center gap-3 pr-3">
                    {STAT_PILLARS.map((pillar) => (
                      <div
                        key={`set2-${pillar.id}`}
                        className={`w-[170px] sm:w-[195px] shrink-0 text-center rounded-xl border p-2.5 transition-all duration-300 ease-out cursor-default hover:-translate-y-1 ${pillar.baseColor} ${pillar.hoverClasses}`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider">
                          {isBn ? pillar.titleBn : pillar.titleEn}
                        </div>
                        <div className="text-base font-extrabold text-slate-900 dark:text-white">
                          {pillar.weight}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isBn ? pillar.subBn : pillar.subEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================================= */}
        {/* ALL-TIME BADGE & SEARCH BAR */}
        {/* ======================================================================= */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 dark:border-slate-800 dark:bg-[#070e1b] dark:text-slate-300 shadow-sm">
            <Trophy size={14} className="text-amber-500" />
            <span>{isBn ? "সর্বকালের র‍্যাঙ্কিং (All-Time Leaderboard)" : "All-Time Global Rankings"}</span>
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isBn ? "ট্রেডার খুঁজুন..." : "Search trader name or pair..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 dark:border-slate-800 dark:bg-[#070e1b] dark:text-white dark:focus:border-sky-500"
            />
          </div>
        </section>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="size-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {isBn ? "রিয়েল ট্রেডার ডেটা লোড হচ্ছে..." : "Loading real trader rankings..."}
            </p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-rose-500" />
            <p className="text-sm font-bold text-rose-400">
              {isBn ? "লিডারবোর্ড ডেটা লোড করা যায়নি।" : "Failed to load leaderboard data."}
            </p>
            <Button size="sm" onClick={() => refetch()} variant="outline">
              {isBn ? "পুনরায় চেষ্টা করুন" : "Retry"}
            </Button>
          </div>
        )}

        {/* Clean Empty state */}
        {!isLoading && !isError && filteredRankings.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#070e1b]/80 space-y-4 shadow-sm">
            <Trophy size={48} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? "এখনো কোনো লিডারবোর্ড তথ্য উপলব্ধ নেই।" : "No leaderboard data available yet."}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {isBn
                ? "ভেরিফায়েড ট্রেডার পারফরম্যান্স রেকর্ড হওয়ার সাথে সাথেই এখানে শীর্ষ ট্রেডারদের তালিকা প্রদর্শিত হবে। আপনার জার্নালে ট্রেড এন্ট্রি করুন এবং লিডারবোর্ডে যুক্ত হন।"
                : "Eligible registered traders with verified performance will appear here. Log trades in your Trading Journal and maintain daily routines to qualify."}
            </p>
            <Link href="/dashboard">
              <Button size="sm" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl mt-2">
                {isBn ? "ট্রেডিং জার্নালে যান" : "Go to Trading Journal"}
              </Button>
            </Link>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TOP 3 PODIUM & RANKED LIST (RANKS #4–#30) */}
        {/* ======================================================================= */}
        {!isLoading && !isError && (
          <LeaderboardRankingsSection
            topThree={topThree}
            restRankings={restRankings}
            isBn={isBn}
            onSelectTrader={setSelectedTrader}
          />
        )}
      </main>

      {/* ========================================================================= */}
      {/* INTERACTIVE TRADER PERFORMANCE MODAL */}
      {/* ========================================================================= */}
      <TraderPerformanceModal
        selectedTrader={selectedTrader}
        onClose={() => setSelectedTrader(null)}
        isBn={isBn}
      />
    </div>
  );
}
