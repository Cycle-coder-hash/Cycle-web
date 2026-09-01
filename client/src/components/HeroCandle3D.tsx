import React, { useState, useEffect, useRef, useCallback } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, MousePointerClick } from "lucide-react";

export type CandleTheme = {
  id: string;
  name: string;
  nameBn: string;
  badge: string;
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  glow: string;
  ambientBg: string;
  bodyGradient: string;
  rearPrimary?: string;
  rearSecondary?: string;
  rearLight?: string;
  rearDark?: string;
  rearBodyGradient?: string;
};

export const CANDLE_THEMES: CandleTheme[] = [
  {
    id: "sapphire",
    name: "Sapphire Ice Blue",
    nameBn: "স্যাফায়ার ব্লু",
    badge: "ORIGINAL",
    primary: "#0284c7",
    secondary: "#38bdf8",
    light: "#bae6fd",
    dark: "#0369a1",
    glow: "rgba(56, 189, 248, 0.55)",
    ambientBg: "radial-gradient(circle at 65% 50%, rgba(56, 189, 248, 0.38) 0%, rgba(2, 132, 199, 0.14) 45%, transparent 70%)",
    bodyGradient: "linear-gradient(135deg, rgba(186, 230, 253, 0.88) 0%, rgba(56, 189, 248, 0.75) 35%, rgba(2, 132, 199, 0.82) 70%, rgba(3, 105, 161, 0.95) 100%)",
  },
  {
    id: "emerald",
    name: "Emerald Bull Green",
    nameBn: "এমারেল্ড বুল গ্রিন",
    badge: "BULLISH",
    primary: "#059669",
    secondary: "#34d399",
    light: "#a7f3d0",
    dark: "#047857",
    glow: "rgba(52, 211, 153, 0.55)",
    ambientBg: "radial-gradient(circle at 65% 50%, rgba(52, 211, 153, 0.38) 0%, rgba(5, 150, 105, 0.14) 45%, transparent 70%)",
    bodyGradient: "linear-gradient(135deg, rgba(167, 243, 208, 0.88) 0%, rgba(52, 211, 153, 0.75) 35%, rgba(5, 150, 105, 0.82) 70%, rgba(4, 120, 87, 0.95) 100%)",
  },
  {
    id: "ruby",
    name: "Ruby Bear Crimson",
    nameBn: "রুবি বেয়ার রেড",
    badge: "BEARISH",
    primary: "#dc2626",
    secondary: "#f87171",
    light: "#fecaca",
    dark: "#b91c1c",
    glow: "rgba(248, 113, 113, 0.55)",
    ambientBg: "radial-gradient(circle at 65% 50%, rgba(248, 113, 113, 0.38) 0%, rgba(220, 38, 38, 0.14) 45%, transparent 70%)",
    bodyGradient: "linear-gradient(135deg, rgba(254, 202, 202, 0.88) 0%, rgba(248, 113, 113, 0.75) 35%, rgba(220, 38, 38, 0.82) 70%, rgba(185, 28, 28, 0.95) 100%)",
  },
  {
    id: "lime",
    name: "Cycle Neon Lime",
    nameBn: "সাইকেল নিয়ন লাইম",
    badge: "SIGNATURE",
    primary: "#65a30d",
    secondary: "#c7f35b",
    light: "#ecfccb",
    dark: "#4d7c0f",
    glow: "rgba(199, 243, 91, 0.6)",
    ambientBg: "radial-gradient(circle at 65% 50%, rgba(199, 243, 91, 0.38) 0%, rgba(101, 163, 13, 0.16) 45%, transparent 70%)",
    bodyGradient: "linear-gradient(135deg, rgba(236, 252, 203, 0.88) 0%, rgba(199, 243, 91, 0.78) 35%, rgba(101, 163, 13, 0.82) 70%, rgba(77, 124, 15, 0.95) 100%)",
  },
  {
    id: "amethyst",
    name: "Amethyst Royal Purple",
    nameBn: "রয়েল অ্যামেথিস্ট",
    badge: "CRYPTO",
    primary: "#7c3aed",
    secondary: "#c084fc",
    light: "#f3e8ff",
    dark: "#6d28d9",
    glow: "rgba(192, 132, 252, 0.55)",
    ambientBg: "radial-gradient(circle at 65% 50%, rgba(192, 132, 252, 0.38) 0%, rgba(124, 58, 237, 0.14) 45%, transparent 70%)",
    bodyGradient: "linear-gradient(135deg, rgba(243, 232, 255, 0.88) 0%, rgba(192, 132, 252, 0.75) 35%, rgba(124, 58, 237, 0.82) 70%, rgba(109, 40, 217, 0.95) 100%)",
  },
  {
    id: "dual",
    name: "Bull & Bear Dual",
    nameBn: "বুল ও বেয়ার ডুয়াল",
    badge: "DUAL MODE",
    primary: "#059669",
    secondary: "#34d399",
    light: "#a7f3d0",
    dark: "#047857",
    glow: "rgba(52, 211, 153, 0.5)",
    ambientBg: "radial-gradient(circle at 65% 50%, rgba(56, 189, 248, 0.28) 0%, rgba(248, 113, 113, 0.18) 50%, transparent 75%)",
    bodyGradient: "linear-gradient(135deg, rgba(167, 243, 208, 0.88) 0%, rgba(52, 211, 153, 0.78) 35%, rgba(5, 150, 105, 0.82) 70%, rgba(4, 120, 87, 0.95) 100%)",
    rearPrimary: "#dc2626",
    rearSecondary: "#f87171",
    rearLight: "#fecaca",
    rearDark: "#b91c1c",
    rearBodyGradient: "linear-gradient(135deg, rgba(254, 202, 202, 0.88) 0%, rgba(248, 113, 113, 0.75) 35%, rgba(220, 38, 38, 0.82) 70%, rgba(185, 28, 28, 0.95) 100%)",
  },
];

interface HeroCandle3DProps {
  lang?: "en" | "bn";
  className?: string;
}

export function HeroCandle3D({ lang = "en", className = "" }: HeroCandle3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [themeIndex, setThemeIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Motion physics state
  const targetRotation = useRef({ x: -3, y: 10 });
  const currentRotation = useRef({ x: -3, y: 10 });
  const targetLight = useRef({ x: 45, y: 35 });
  const currentLight = useRef({ x: 45, y: 35 });
  const idleTime = useRef(0);
  const animFrameId = useRef<number | null>(null);

  const isInteractive = isHovered || isTouchActive;
  const activeTheme = CANDLE_THEMES[themeIndex];

  // Pause offscreen calculations to keep low-end mobile phones lag-free
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ALWAYS Auto Color Change Mode: Smoothly transitions every 4 seconds (only when in viewport)
  useEffect(() => {
    if (!isInViewport) return;
    const interval = setInterval(() => {
      setThemeIndex((prev) => (prev + 1) % CANDLE_THEMES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isInViewport]);

  // Smooth animation loop (only executes when visible in viewport)
  useEffect(() => {
    if (!isInViewport) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      return;
    }

    const updateMotion = () => {
      idleTime.current += 0.02;

      let targetX = targetRotation.current.x;
      let targetY = targetRotation.current.y;
      if (!isInteractive) {
        targetX = -3 + Math.sin(idleTime.current * 0.75) * 3.5;
        targetY = 10 + Math.cos(idleTime.current * 0.6) * 6;
      }

      const factor = isInteractive ? 0.09 : 0.05;
      currentRotation.current.x += (targetX - currentRotation.current.x) * factor;
      currentRotation.current.y += (targetY - currentRotation.current.y) * factor;
      currentLight.current.x += (targetLight.current.x - currentLight.current.x) * factor;
      currentLight.current.y += (targetLight.current.y - currentLight.current.y) * factor;

      if (containerRef.current) {
        containerRef.current.style.setProperty("--rot-x", `${currentRotation.current.x.toFixed(2)}deg`);
        containerRef.current.style.setProperty("--rot-y", `${currentRotation.current.y.toFixed(2)}deg`);
        containerRef.current.style.setProperty("--light-x", `${currentLight.current.x.toFixed(1)}%`);
        containerRef.current.style.setProperty("--light-y", `${currentLight.current.y.toFixed(1)}%`);
      }

      animFrameId.current = requestAnimationFrame(updateMotion);
    };

    animFrameId.current = requestAnimationFrame(updateMotion);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isInteractive, isInViewport]);

  // Pointer interactions
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    targetRotation.current = {
      x: (0.5 - y) * 26,
      y: (x - 0.5) * 30,
    };

    targetLight.current = {
      x: Math.max(10, Math.min(90, x * 100)),
      y: Math.max(10, Math.min(90, y * 100)),
    };
  }, []);

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    targetRotation.current = { x: -3, y: 10 };
    targetLight.current = { x: 45, y: 35 };
  };

  // Mobile touch handler (Tap to show/hide insights)
  const handleTouchToggle = () => {
    setIsTouchActive((prev) => !prev);
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setIsTouchActive(false);
    }, 8000);
  };

  const rearSecondary = activeTheme.rearSecondary || activeTheme.secondary;
  const rearLight = activeTheme.rearLight || activeTheme.light;
  const rearBodyGradient = activeTheme.rearBodyGradient || activeTheme.bodyGradient;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleTouchToggle}
      className={`group relative flex w-full flex-col items-center justify-center select-none cursor-pointer gpu-layer touch-pan-y ${className}`}
      style={
        {
          "--rot-x": "-3deg",
          "--rot-y": "10deg",
          "--light-x": "45%",
          "--light-y": "35%",
        } as React.CSSProperties
      }
    >
      {/* Dynamic Ambient Glow with smooth transition */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full transition-all duration-1000 blur-xl sm:blur-[70px] ambient-blur-blob"
        style={{
          background: activeTheme.ambientBg,
          transform: isInteractive ? "scale(1.28)" : "scale(1.15)",
        }}
      />

      {/* 3D Scene Viewport */}
      <div className="perspective-1200 relative flex h-[380px] w-full max-w-[520px] items-center justify-center sm:h-[460px] lg:h-[500px]">
        {/* Master 3D Spatial Anchor */}
        <div
          className="preserve-3d relative flex h-full w-full items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: "rotateX(var(--rot-x)) rotateY(var(--rot-y))",
          }}
        >
          {/* ========================================================================= */}
          {/* LEFT FLOATING MESSAGE CARD: TRADING REALITY (ONLY ON HOVER/TOUCH) */}
          {/* ========================================================================= */}
          <div
            className={`preserve-3d absolute -left-1 sm:-left-6 top-6 sm:top-10 z-30 w-[170px] sm:w-[215px] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
              isInteractive
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto blur-none"
                : "opacity-0 scale-75 -translate-x-6 translate-y-4 pointer-events-none blur-sm"
            }`}
            style={{
              transform: isInteractive
                ? "translate3d(-10px, 0px, 110px) rotateY(-8deg)"
                : "translate3d(-30px, 20px, 20px) rotateY(-18deg)",
            }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-emerald-400/50 bg-white/95 p-3 sm:p-3.5 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl dark:border-emerald-500/40 dark:bg-slate-900/95 dark:shadow-emerald-950/60">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex size-5 sm:size-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400">
                    <ShieldCheck size={13} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400">
                    {lang === "bn" ? "ট্রেডিং রিয়েলিটি" : "TRADING REALITY"}
                  </span>
                </div>
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="mt-2 space-y-1.5 text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="font-bold leading-tight text-emerald-900 dark:text-emerald-300">
                    {lang === "bn" ? "প্রসেস > প্রেডিকশন" : "Process > Prediction"}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="leading-tight text-slate-600 dark:text-slate-400">
                    {lang === "bn" ? "১% ক্যাপিটাল প্রটেকশন" : "1% Capital Protection"}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="leading-tight text-slate-600 dark:text-slate-400">
                    {lang === "bn" ? "মার্কেট স্ট্রাকচার & এজ" : "Structure & Edge"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT FLOATING MESSAGE CARD: TRADING HYPE (ONLY ON HOVER/TOUCH) */}
          {/* ========================================================================= */}
          <div
            className={`preserve-3d absolute -right-1 sm:-right-6 bottom-4 sm:bottom-8 z-30 w-[170px] sm:w-[215px] transition-all duration-500 delay-75 cubic-bezier(0.34, 1.56, 0.64, 1) ${
              isInteractive
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto blur-none"
                : "opacity-0 scale-75 translate-x-6 -translate-y-4 pointer-events-none blur-sm"
            }`}
            style={{
              transform: isInteractive
                ? "translate3d(10px, 0px, 100px) rotateY(8deg)"
                : "translate3d(30px, -20px, 20px) rotateY(18deg)",
            }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-rose-400/50 bg-white/95 p-3 sm:p-3.5 shadow-2xl shadow-rose-500/20 backdrop-blur-xl dark:border-rose-500/40 dark:bg-slate-900/95 dark:shadow-rose-950/60">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex size-5 sm:size-6 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400">
                    <AlertTriangle size={13} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-rose-700 dark:text-rose-400">
                    {lang === "bn" ? "ট্রেডিং হাইপ" : "TRADING HYPE"}
                  </span>
                </div>
                <span className="size-2 rounded-full bg-rose-500" />
              </div>

              <div className="mt-2 space-y-1.5 text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-1.5">
                  <XCircle size={12} className="mt-0.5 shrink-0 text-rose-500" />
                  <span className="font-bold leading-tight text-rose-800 dark:text-rose-300">
                    {lang === "bn" ? "১০০% উইন-রেট ট্র্যাপ" : "100% Win-Rate Trap"}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <XCircle size={12} className="mt-0.5 shrink-0 text-rose-500" />
                  <span className="leading-tight text-slate-600 dark:text-slate-400">
                    {lang === "bn" ? "রাতারাতি কোটিপতি স্বপ্ন" : "Overnight Rich Illusion"}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <XCircle size={12} className="mt-0.5 shrink-0 text-rose-500" />
                  <span className="leading-tight text-slate-600 dark:text-slate-400">
                    {lang === "bn" ? "হাই লেভারেজ গ্যাম্বলিং" : "High Leverage Gambling"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* REAR CANDLESTICK (Secondary Depth Layer) */}
          {/* ========================================================================= */}
          <div
            className="preserve-3d absolute transition-all duration-700"
            style={{
              transform: "translate3d(82px, 18px, -110px) rotateY(-8deg) scale(0.88)",
              filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.25))",
            }}
          >
            {/* Top Wick */}
            <div className="preserve-3d absolute -top-[75px] left-1/2 -translate-x-1/2">
              <div
                className="relative h-[85px] w-[18px] rounded-md border border-white/60 shadow-lg backdrop-blur-md dark:border-white/30"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.95) 0%, ${rearLight} 40%, ${rearSecondary} 100%)`,
                  boxShadow: `0 0 16px ${rearSecondary}, inset 0 0 6px rgba(255,255,255,0.8)`,
                }}
              >
                <div className="absolute inset-y-1 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-white/90 shadow-[0_0_8px_white]" />
              </div>
            </div>

            {/* Glass Body */}
            <div
              className="preserve-3d relative h-[175px] w-[105px] sm:h-[180px] sm:w-[110px] rounded-2xl border-2 border-white/70 shadow-2xl backdrop-blur-xl transition-all duration-700 dark:border-white/40"
              style={{
                background: rearBodyGradient,
                boxShadow: `0 20px 45px rgba(0,0,0,0.3), 0 0 35px ${rearSecondary}55, inset 0 0 25px rgba(255,255,255,0.7), inset 0 2px 10px rgba(255,255,255,0.9)`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-80 transition-opacity duration-200"
                style={{
                  background:
                    "radial-gradient(circle at var(--light-x) var(--light-y), rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 30%, transparent 60%)",
                }}
              />
              <div className="absolute inset-y-2 left-2 w-[5px] rounded-full bg-white/75 blur-[0.5px]" />
              <div className="absolute inset-y-2 right-2 w-[4px] rounded-full bg-white/40 blur-[0.5px]" />
              <div className="preserve-3d absolute inset-x-0 top-1/2 h-[75%] -translate-y-1/2 px-4">
                <div
                  className="mx-auto h-full w-[8px] rounded-full border border-white/80 bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                  style={{
                    background: `linear-gradient(180deg, white 0%, ${rearLight} 50%, white 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Bottom Wick */}
            <div className="preserve-3d absolute -bottom-[75px] left-1/2 -translate-x-1/2">
              <div
                className="relative h-[85px] w-[18px] rounded-md border border-white/60 shadow-lg backdrop-blur-md dark:border-white/30"
                style={{
                  background: `linear-gradient(0deg, rgba(255,255,255,0.95) 0%, ${rearLight} 40%, ${rearSecondary} 100%)`,
                  boxShadow: `0 0 16px ${rearSecondary}, inset 0 0 6px rgba(255,255,255,0.8)`,
                }}
              >
                <div className="absolute inset-y-1 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-white/90 shadow-[0_0_8px_white]" />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FRONT CANDLESTICK (Primary Focus / Ultra Crystal Glass) */}
          {/* ========================================================================= */}
          <div
            className="preserve-3d absolute transition-all duration-700"
            style={{
              transform: "translate3d(-18px, -10px, 45px) rotateY(4deg) scale(1.05)",
              filter: `drop-shadow(0 30px 45px rgba(0,0,0,0.28)) drop-shadow(0 0 35px ${activeTheme.glow})`,
            }}
          >
            {/* Top Wick */}
            <div className="preserve-3d absolute -top-[90px] left-1/2 -translate-x-1/2">
              <div
                className="relative h-[100px] w-[20px] sm:h-[105px] sm:w-[22px] rounded-lg border-2 border-white/80 shadow-xl backdrop-blur-lg dark:border-white/40"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.98) 0%, ${activeTheme.light} 30%, ${activeTheme.secondary} 75%, ${activeTheme.dark} 100%)`,
                  boxShadow: `0 0 24px ${activeTheme.secondary}, inset 0 0 8px rgba(255,255,255,0.9)`,
                }}
              >
                <div className="absolute inset-y-1 left-1/2 w-[4px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_white]" />
                <div className="absolute -top-1 inset-x-0 h-2 rounded-t-lg bg-white/90 shadow-[0_0_8px_white]" />
              </div>
            </div>

            {/* Main Crystal Glass Body */}
            <div
              className="preserve-3d relative h-[210px] w-[128px] sm:h-[220px] sm:w-[135px] rounded-3xl border-2 border-white/90 shadow-2xl backdrop-blur-2xl transition-all duration-700 dark:border-white/40"
              style={{
                background: activeTheme.bodyGradient,
                boxShadow: `
                  0 25px 50px -10px rgba(0, 0, 0, 0.32),
                  0 0 45px ${activeTheme.glow},
                  inset 0 0 32px rgba(255, 255, 255, 0.8),
                  inset 0 2px 14px rgba(255, 255, 255, 0.95),
                  inset 0 -2px 14px rgba(0, 0, 0, 0.25)
                `,
              }}
            >
              {/* Dynamic Specular Shine */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-90 transition-all duration-150"
                style={{
                  background:
                    "radial-gradient(circle at var(--light-x) var(--light-y), rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.45) 28%, transparent 65%)",
                }}
              />

              {/* Edge Highlights */}
              <div className="absolute inset-y-3 left-2.5 w-[6px] rounded-full bg-white/85 shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
              <div className="absolute inset-y-3 right-2.5 w-[5px] rounded-full bg-white/45 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
              <div className="absolute top-2 inset-x-4 h-[3px] rounded-full bg-white/80" />
              <div className="absolute bottom-2 inset-x-4 h-[2px] rounded-full bg-black/20" />

              {/* Inner Refraction Core */}
              <div className="preserve-3d absolute inset-x-0 top-1/2 h-[70%] -translate-y-1/2 px-5">
                <div
                  className="mx-auto h-full w-[10px] rounded-full border border-white/90 shadow-[0_0_16px_rgba(255,255,255,0.95)]"
                  style={{
                    background: `linear-gradient(180deg, #ffffff 0%, ${activeTheme.light} 40%, ${activeTheme.secondary} 80%, #ffffff 100%)`,
                  }}
                />
              </div>

              {/* Holographic Grid */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

              {/* Glass Diagonal Glare */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div
                  className="absolute -inset-[100%] opacity-35"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.8) 48%, rgba(255,255,255,0.9) 50%, transparent 56%)",
                    transform: "translate3d(calc(var(--light-x) * 0.5 - 25%), calc(var(--light-y) * 0.5 - 25%), 0)",
                  }}
                />
              </div>
            </div>

            {/* Bottom Wick */}
            <div className="preserve-3d absolute -bottom-[90px] left-1/2 -translate-x-1/2">
              <div
                className="relative h-[100px] w-[20px] sm:h-[105px] sm:w-[22px] rounded-lg border-2 border-white/80 shadow-xl backdrop-blur-lg dark:border-white/40"
                style={{
                  background: `linear-gradient(0deg, rgba(255,255,255,0.98) 0%, ${activeTheme.light} 30%, ${activeTheme.secondary} 75%, ${activeTheme.dark} 100%)`,
                  boxShadow: `0 0 24px ${activeTheme.secondary}, inset 0 0 8px rgba(255,255,255,0.9)`,
                }}
              >
                <div className="absolute inset-y-1 left-1/2 w-[4px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_white]" />
                <div className="absolute -bottom-1 inset-x-0 h-2 rounded-b-lg bg-white/90 shadow-[0_0_8px_white]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE PROMPT HINT (FOR MOBILE & DESKTOP) */}
      {/* ========================================================================= */}
      <div className="mt-2 flex items-center justify-center">
        <button
          type="button"
          onClick={handleTouchToggle}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
            isInteractive
              ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          <MousePointerClick size={13} className={isInteractive ? "text-emerald-500" : "text-slate-400"} />
          <span>
            {isInteractive
              ? (lang === "bn" ? "✨ রিয়ালিটি ও হাইপ প্রদর্শিত হচ্ছে" : "✨ Showing Reality vs Hype")
              : (lang === "bn" ? "💡 ক্যান্ডেল স্পর্শ/হোভার করুন ট্রুথ দেখতে" : "💡 Hover or tap candle for Reality vs Hype")}
          </span>
        </button>
      </div>
    </div>
  );
}

export default HeroCandle3D;
