import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Phase = "enter" | "active" | "exit" | "empty";
type LabelPhase = "hidden" | "entering" | "visible" | "exiting";

interface NewsHeadlineStatsProps {
  isBn?: boolean;
}

export function NewsHeadlineStats({ isBn: _isBnProp }: NewsHeadlineStatsProps) {
  const { language, selectText } = useLanguage();
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
        className={`w-full relative overflow-hidden rounded-2xl border border-sky-400/30 bg-gradient-to-r from-slate-100/90 via-white/95 to-sky-50/90 px-4 py-3.5 sm:px-6 sm:py-4 backdrop-blur-xl shadow-[0_4px_24px_rgba(14,165,233,0.1)] transition-colors dark:border-[var(--border-subtle)] dark:bg-none dark:bg-[var(--surface)] dark:shadow-[0_0_35px_rgba(92,156,235,0.12)] ${panelClass}`}
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
              className={`inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-cyan-700 dark:border-[var(--border-subtle)] dark:bg-[var(--surface)] dark:text-[var(--glow-soft)] ${labelClass}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-highlight)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-highlight)]" />
              </span>
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-[var(--glow-soft)] dark:via-white dark:to-[var(--glow-soft)]">
                {selectText({ en: "YOUR POINT", bn: "আপনার পয়েন্ট", ur: "اہم نکتہ" })}
              </span>
            </div>
          </div>

          {/* Center / Right: The Two Headlines */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
            {/* Headline 1: 12+ LEARNING STAGES */}
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 dark:text-[var(--accent-highlight)] drop-shadow-[0_0_16px_rgba(0,255,161,0.5)]">
                {language === "bn" ? "১২+" : "12+"}
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-white/90">
                {selectText({ en: "LEARNING STAGES", bn: "লার্নিং স্টেজ", ur: "تعلیمی مراحل" })}
              </span>
            </div>

            {/* Subtle divider */}
            <div className="hidden sm:block h-5 w-px bg-emerald-500/30 dark:bg-[var(--border-subtle)]" />

            {/* Headline 2: A–Z STRUCTURED ROADMAP (with A–Z visually prominent) */}
            <div className="flex items-baseline gap-2.5">
              <span className="font-black text-3xl sm:text-4xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 dark:from-[var(--accent-highlight)] dark:via-emerald-300 dark:to-[var(--glow-soft)] drop-shadow-[0_0_22px_rgba(0,255,161,0.55)]">
                A–Z
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-white/90">
                {selectText({ en: "STRUCTURED ROADMAP", bn: "স্ট্রাকচার্ড রোডম্যাপ", ur: "منظم روڈ میپ" })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
