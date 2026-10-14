import React from "react";
import {
  FOREX_SESSIONS,
  SessionCalculatedState,
  getTimelineSegmentsForSession,
  getTimelineOverlapSegments,
} from "../lib/sessionLogic";
import { useLanguage } from "@/contexts/LanguageContext";

interface MarketSessionsTimelineProps {
  sessions: SessionCalculatedState[];
  now: Date;
  userTimeZone: string;
  isWeekendClosed: boolean;
}

export function MarketSessionsTimeline({
  sessions,
  now,
  userTimeZone,
  isWeekendClosed,
}: MarketSessionsTimelineProps) {
  const { selectText } = useLanguage();

  // Grid hours: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00, 24:00
  const gridHours = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  // Calculate NOW marker position (0% - 100% of current day in user timezone)
  const userFmtParts = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);

  const partsObj: Record<string, string> = {};
  for (const part of userFmtParts) {
    partsObj[part.type] = part.value;
  }
  const h = parseInt(partsObj.hour === "24" ? "0" : partsObj.hour, 10);
  const m = parseInt(partsObj.minute, 10);
  const s = parseInt(partsObj.second, 10);
  const nowPercent = Math.min(100, Math.max(0, ((h * 3600 + m * 60 + s) / 86400) * 100));

  // Time chip string (e.g. "14:25:08" or "2:25 PM")
  const timeChipStr = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  // Find London, Tokyo, New York sessions for overlap calculation
  const tokyo = sessions.find((s) => s.config.id === "tokyo");
  const london = sessions.find((s) => s.config.id === "london");
  const ny = sessions.find((s) => s.config.id === "newyork");

  const tokyoLondonOverlaps =
    tokyo && london
      ? getTimelineOverlapSegments(tokyo.openUtc, tokyo.closeUtc, london.openUtc, london.closeUtc, userTimeZone, now)
      : [];

  const londonNyOverlaps =
    london && ny
      ? getTimelineOverlapSegments(london.openUtc, london.closeUtc, ny.openUtc, ny.closeUtc, userTimeZone, now)
      : [];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b172a]/95 p-5 sm:p-7 shadow-sm">
      {/* Timeline Header & Overlap Legends */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{selectText({ en: "24-Hour Market Timeline", bn: "২৪-ঘণ্টা মার্কেট টাইমলাইন", ur: "۲۴ گھنٹے کی مارکیٹ ٹائم لائن" })}</span>
            <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              {userTimeZone.split("/").pop()?.replace(/_/g, " ")}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {selectText({
              en: "Trading session progression converted to your local time with high-liquidity overlap zones",
              bn: "আপনার স্থানীয় সময়ে কনভার্ট করা ট্রেডিং সেশন ও হাই-লিকুইডিটি ওভারল্যাপ অঞ্চল",
              ur: "آپ کے مقامی وقت میں تبدیل شدہ تجارتی سیشنز اور اوورلیپ زونز",
            })}
          </p>
        </div>

        {/* Overlap Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-cyan-400 bg-cyan-400/10 px-3 py-1 text-[11px] font-mono font-extrabold text-cyan-600 dark:text-cyan-300">
            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{selectText({ en: "Tokyo × London Overlap", bn: "টোকিও × লন্ডন ওভারল্যাপ", ur: "ٹوکیو × لندن اوورلیپ" })}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-sky-400 bg-sky-400/10 px-3 py-1 text-[11px] font-mono font-extrabold text-sky-600 dark:text-sky-300">
            <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>{selectText({ en: "London × New York Overlap", bn: "লন্ডন × নিউ ইয়র্ক ওভারল্যাপ", ur: "لندن × نیویارک اوورلیپ" })}</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Timeline Canvas Area */}
      <div className="relative mt-8 pt-7 pb-2 overflow-x-auto">
        <div className="min-w-[620px] relative">
          {/* NOW Marker */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none transition-[left] duration-150 ease-linear"
            style={{ left: `${nowPercent}%` }}
          >
            {/* Time Chip */}
            <div className="absolute -top-7 -translate-x-1/2 whitespace-nowrap rounded-md bg-cyan-500 px-2 py-0.5 font-mono text-[10px] font-black tracking-wider text-slate-950 shadow-md shadow-cyan-500/30">
              NOW · {timeChipStr}
            </div>
            {/* Glowing Dot */}
            <div className="absolute -top-1 -translate-x-1/2 size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] ring-2 ring-cyan-400/40" />
            {/* Vertical Line */}
            <div className="w-[2px] h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </div>

          {/* Vertical 3-Hour Grid Lines & Labels */}
          <div className="absolute inset-0 pointer-events-none flex justify-between">
            {gridHours.map((hour) => {
              const leftPct = (hour / 24) * 100;
              const formatted = hour === 24 ? "24:00" : `${hour < 10 ? "0" + hour : hour}:00`;
              return (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 border-l border-slate-200/60 dark:border-slate-800/60"
                  style={{ left: `${leftPct}%` }}
                >
                  <span className="absolute -bottom-6 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-400">
                    {formatted}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 4 Session Rows */}
          <div className="space-y-4 relative z-10 py-1">
            {sessions.map((session, sIdx) => {
              const segments = getTimelineSegmentsForSession(
                session.openUtc,
                session.closeUtc,
                userTimeZone,
                now
              );

              return (
                <div key={session.config.id} className="flex items-center gap-3">
                  {/* City Label */}
                  <div className="w-20 shrink-0 text-right pr-2">
                    <span
                      className="text-xs font-black truncate block"
                      style={{ color: session.config.color }}
                    >
                      {session.config.city}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                      {session.isOpen && !isWeekendClosed ? "ACTIVE" : ""}
                    </span>
                  </div>

                  {/* Track Bar */}
                  <div className="relative flex-1 h-7 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden">
                    {/* Render Session Active Windows */}
                    {segments.map((seg, segIdx) => (
                      <div
                        key={segIdx}
                        className={`timeline-bar-grow absolute top-1 bottom-1 rounded-lg transition-opacity duration-300 ${
                          isWeekendClosed ? "opacity-35 desaturate-50" : "opacity-90"
                        }`}
                        style={{
                          left: `${seg.startPct}%`,
                          width: `${Math.max(1.5, seg.endPct - seg.startPct)}%`,
                          backgroundColor: session.config.color,
                          animationDelay: `${sIdx * 120}ms`,
                          boxShadow: session.isOpen && !isWeekendClosed ? `0 0 12px ${session.config.color}60` : "none",
                        }}
                      />
                    ))}

                    {/* Overlap Highlights on Tokyo Row */}
                    {session.config.id === "tokyo" &&
                      tokyoLondonOverlaps.map((ov, oIdx) => (
                        <div
                          key={`ov-tl-${oIdx}`}
                          className="overlap-shimmer absolute inset-y-0.5 rounded-lg border border-dashed border-cyan-400 pointer-events-none"
                          style={{
                            left: `${ov.startPct}%`,
                            width: `${Math.max(1.5, ov.endPct - ov.startPct)}%`,
                          }}
                        />
                      ))}

                    {/* Overlap Highlights on London & New York Rows */}
                    {(session.config.id === "london" || session.config.id === "newyork") &&
                      londonNyOverlaps.map((ov, oIdx) => (
                        <div
                          key={`ov-lny-${oIdx}`}
                          className="overlap-shimmer absolute inset-y-0.5 rounded-lg border border-dashed border-cyan-400 pointer-events-none"
                          style={{
                            left: `${ov.startPct}%`,
                            width: `${Math.max(1.5, ov.endPct - ov.startPct)}%`,
                          }}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Padding for grid bottom labels */}
        <div className="h-6" />
      </div>
    </div>
  );
}
