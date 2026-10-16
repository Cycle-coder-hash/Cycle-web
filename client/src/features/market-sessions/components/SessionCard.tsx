import React, { useRef, useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { SessionCalculatedState } from "../lib/sessionLogic";
import { useLanguage } from "@/contexts/LanguageContext";

interface SessionCardProps {
  session: SessionCalculatedState;
  index: number;
  isWeekendClosed: boolean;
}

export function SessionCard({ session, index, isWeekendClosed }: SessionCardProps) {
  const { selectText } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  const [tiltStyle, setTiltStyle] = useState<{
    transform: string;
    glareBg: string;
    transition: string;
  }>({
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg)",
    glareBg: "none",
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  });

  const [isRolling, setIsRolling] = useState(false);
  const prevCountdownRef = useRef(session.countdownFormatted);

  useEffect(() => {
    if (prevCountdownRef.current !== session.countdownFormatted) {
      prevCountdownRef.current = session.countdownFormatted;
      setIsRolling(true);
      const t = setTimeout(() => setIsRolling(false), 300);
      return () => clearTimeout(t);
    }
  }, [session.countdownFormatted]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Check if device supports hover and pointer fine
    if (typeof window === "undefined" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    // Calculate rotation: max +/- 9.5deg
    const xPct = x / width;
    const yPct = y / height;
    const rotateY = (xPct - 0.5) * 19;
    const rotateX = (0.5 - yPct) * 19;

    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      glareBg: `radial-gradient(circle 220px at ${x}px ${y}px, rgba(255, 255, 255, 0.16) 0%, transparent 70%)`,
      transition: "transform 0.08s linear",
    });
  };

  const handlePointerLeave = () => {
    setTiltStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      glareBg: "none",
      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    });
  };

  const isOpen = session.isOpen && !isWeekendClosed;
  const isOpeningSoon = session.isOpeningSoon && !isWeekendClosed;

  const cityColor = session.config.color;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--city-accent": cityColor,
          animationDelay: `${index * 110}ms`,
          transform: tiltStyle.transform,
          transition: tiltStyle.transition,
        } as React.CSSProperties
      }
      className={`session-card-animate relative rounded-xl sm:rounded-2xl p-3.5 sm:p-6 transition-all duration-300 border ${
        isOpen
          ? "session-card-open-border shadow-xl border-transparent bg-white/95 dark:bg-[#0b172a]/95 text-slate-900 dark:text-white"
          : isWeekendClosed || session.status === "closed"
          ? "border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-[#070e1b]/60 opacity-80 desaturate-30 text-slate-600 dark:text-slate-400"
          : "border-amber-500/30 bg-amber-500/5 dark:bg-[#0b172a]/90 text-slate-800 dark:text-slate-200"
      }`}
    >
      {/* Glare overlay for 3D tilt */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl opacity-60 mix-blend-overlay transition-opacity"
        style={{ background: tiltStyle.glareBg }}
      />

      {/* Header: City & Status Badge */}
      <div className="flex items-start justify-between gap-1.5 sm:gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className="size-2 sm:size-2.5 rounded-full shrink-0 relative"
              style={{ backgroundColor: cityColor }}
            >
              {isOpen && (
                <span
                  className="open-dot-ring absolute -inset-1 rounded-full opacity-75"
                  style={{ backgroundColor: cityColor }}
                />
              )}
            </span>
            <h3 className="text-sm sm:text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
              {session.config.city}
            </h3>
          </div>
          <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            {session.zoneLabel}
          </p>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {isOpen ? (
            <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shadow-xs">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{selectText({ en: "Open", bn: "খোলা", ur: "کھلا ہے" })}</span>
            </span>
          ) : isOpeningSoon ? (
            <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-extrabold text-amber-600 dark:text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>{selectText({ en: "Soon", bn: "শীঘ্রই", ur: "جلد" })}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{selectText({ en: "Closed", bn: "বন্ধ", ur: "بند" })}</span>
            </span>
          )}
        </div>
      </div>

      {/* Countdown Area */}
      <div className="my-2.5 sm:my-5 relative z-10">
        <div className="text-[9px] sm:text-[11px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-400">
          {isOpen
            ? selectText({ en: "closes in", bn: "বন্ধ হতে বাকি", ur: "بند ہونے میں باقی" })
            : selectText({ en: "opens in", bn: "খুলতে বাকি", ur: "کھلنے میں باقی" })}
        </div>
        <div className="overflow-hidden h-7 sm:h-10 mt-0.5 flex items-baseline gap-2">
          <div
            className={`text-lg sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white ${
              isRolling ? "countdown-rolling" : ""
            }`}
          >
            {session.countdownFormatted}
          </div>
        </div>

        {/* Progress Bar (Visible for Open Sessions) */}
        <div className="mt-1.5 sm:mt-2 h-1 sm:h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${isOpen ? session.progressPercent : 0}%`,
              backgroundColor: cityColor,
              boxShadow: isOpen ? `0 0 8px ${cityColor}` : "none",
            }}
          />
        </div>
      </div>

      {/* Session Hours Breakdown */}
      <div className="space-y-1 sm:space-y-2 border-t border-slate-100 dark:border-slate-800/70 pt-2.5 sm:pt-3.5 text-[10px] sm:text-xs relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 dark:text-slate-400 gap-0.5 sm:gap-0">
          <span className="font-medium flex items-center gap-1">
            <Clock size={11} className="text-slate-400 sm:size-3" />
            <span>{selectText({ en: "You:", bn: "আপনার:", ur: "آپ کا:" })}</span>
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-200" dir="ltr">
            {session.userHoursFormatted}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 dark:text-slate-400 gap-0.5 sm:gap-0">
          <span className="font-medium">
            {selectText({ en: "City:", bn: "শহর:", ur: "شہر:" })}
          </span>
          <span className="font-mono text-slate-600 dark:text-slate-400" dir="ltr">
            {session.localHoursFormatted}
          </span>
        </div>
      </div>

      {/* Upcoming Clock Change Notice (Within next 7 days) */}
      {session.upcomingClockChange && (
        <div className="mt-2.5 sm:mt-3.5 flex items-start gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20 p-2 sm:p-2.5 text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 relative z-10">
          <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-500 sm:size-3.5" />
          <span>
            {selectText({
              en: `Clocks change on ${session.upcomingClockChange.dateStr}. Session time shifts by ${session.upcomingClockChange.hoursShift} hour.`,
              bn: `${session.upcomingClockChange.dateStr}-এ ঘড়ির সময় পরিবর্তন হবে। সেশনের সময় ${session.upcomingClockChange.hoursShift} ঘণ্টা পরিবর্তন হবে।`,
              ur: `${session.upcomingClockChange.dateStr} کو گھڑی کا وقت تبدیل ہوگا۔ سیشن ${session.upcomingClockChange.hoursShift} گھنٹے تبدیل ہوگا۔`,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
