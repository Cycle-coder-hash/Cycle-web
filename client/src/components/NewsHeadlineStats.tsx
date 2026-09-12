import { useState, useEffect } from "react";

type Phase = "enter" | "active" | "exit" | "empty";
type LabelPhase = "hidden" | "entering" | "visible" | "exiting";

interface NewsHeadlineStatsProps {
  isBn?: boolean;
}

export function NewsHeadlineStats({ isBn = false }: NewsHeadlineStatsProps) {
  const [phase, setPhase] = useState<Phase>("enter");
  const [labelPhase, setLabelPhase] = useState<LabelPhase>("hidden");

  // Main headline animation cycle: 1.2s enter -> 12s visible -> 1.0s exit -> 3s empty
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === "enter") {
      timer = setTimeout(() => {
        setPhase("active");
      }, 1200);
    } else if (phase === "active") {
      // Exactly 12 seconds visible and stable
      timer = setTimeout(() => {
        setPhase("exit");
      }, 12000);
    } else if (phase === "exit") {
      timer = setTimeout(() => {
        setPhase("empty");
      }, 1000);
    } else if (phase === "empty") {
      // Exactly 3 seconds completely hidden
      timer = setTimeout(() => {
        setPhase("enter");
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  // Independent "YOUR POINT" label cycle: 5s hidden -> entrance -> 10s visible -> exit -> repeat
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (labelPhase === "hidden") {
      timer = setTimeout(() => {
        setLabelPhase("entering");
      }, 5000);
    } else if (labelPhase === "entering") {
      timer = setTimeout(() => {
        setLabelPhase("visible");
      }, 500);
    } else if (labelPhase === "visible") {
      timer = setTimeout(() => {
        setLabelPhase("exiting");
      }, 10000);
    } else if (labelPhase === "exiting") {
      timer = setTimeout(() => {
        setLabelPhase("hidden");
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [labelPhase]);

  const panelClass =
    phase === "enter"
      ? "news-panel-enter"
      : phase === "active"
      ? "news-panel-active"
      : phase === "exit"
      ? "news-panel-exit"
      : "news-panel-empty";

  const labelClass =
    labelPhase === "entering"
      ? "label-phase-entering"
      : labelPhase === "visible"
      ? "label-phase-visible"
      : labelPhase === "exiting"
      ? "label-phase-exiting"
      : "label-phase-hidden";

  return (
    // Outer container reserves height to prevent any layout shift during empty phase
    <div className="relative w-full min-h-[96px] sm:min-h-[82px] lg:min-h-[74px] flex items-center overflow-hidden">
      <div
        className={`w-full relative overflow-hidden rounded-2xl border border-sky-400/30 bg-gradient-to-r from-slate-100/90 via-white/95 to-sky-50/90 px-4 py-3.5 sm:px-6 sm:py-4 backdrop-blur-xl shadow-[0_4px_24px_rgba(14,165,233,0.1)] transition-colors dark:border-cyan-400/25 dark:bg-gradient-to-r dark:from-[#06152b]/95 dark:via-[#091f3d]/90 dark:to-[#06152b]/95 dark:shadow-[0_0_35px_rgba(56,189,248,0.12)] ${panelClass}`}
      >
        {/* Subtle corner HUD accents */}
        <span className="pointer-events-none absolute left-1.5 top-1.5 h-1.5 w-1.5 border-l border-t border-cyan-500/50 dark:border-cyan-400/60" />
        <span className="pointer-events-none absolute right-1.5 top-1.5 h-1.5 w-1.5 border-r border-t border-cyan-500/50 dark:border-cyan-400/60" />
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-1.5 w-1.5 border-b border-l border-cyan-500/50 dark:border-cyan-400/60" />
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-1.5 w-1.5 border-b border-r border-cyan-500/50 dark:border-cyan-400/60" />

        {/* Diagonal scanning light sheen during entrance */}
        {phase === "enter" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent skew-x-[-20deg] news-scan-sheen"
          />
        )}

        {/* Bottom neon accent laser line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
        />

        {/* Content composition */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {/* Left: YOUR POINT badge with independent 5s hidden / 10s visible cycle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className={`inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 ${labelClass}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-400 dark:to-violet-400">
                YOUR POINT
              </span>
            </div>
          </div>

          {/* Center / Right: The Two Headlines */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
            {/* Headline 1: 12+ LEARNING STAGES */}
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 dark:text-[#00ff88] drop-shadow-[0_0_16px_rgba(0,255,136,0.55)]">
                {isBn ? "১২+" : "12+"}
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.35)]">
                {isBn ? "লার্নিং স্টেজ" : "LEARNING STAGES"}
              </span>
            </div>

            {/* Subtle divider */}
            <div className="hidden sm:block h-5 w-px bg-emerald-500/30 dark:bg-emerald-400/40" />

            {/* Headline 2: A–Z STRUCTURED ROADMAP (with A–Z visually prominent) */}
            <div className="flex items-baseline gap-2.5">
              <span className="font-black text-3xl sm:text-4xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 dark:from-[#00ff88] dark:via-emerald-300 dark:to-teal-300 drop-shadow-[0_0_22px_rgba(0,255,136,0.65)]">
                A–Z
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.35)]">
                {isBn ? "স্ট্রাকচার্ড রোডম্যাপ" : "STRUCTURED ROADMAP"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
