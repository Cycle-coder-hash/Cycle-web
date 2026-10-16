import React, { useState, useEffect } from "react";
import { Clock, Globe, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { calculateAllSessions } from "../lib/sessionLogic";
import { SessionCard } from "./SessionCard";
import { MarketSessionsTimeline } from "./MarketSessionsTimeline";
import { MarketActivityIndicator } from "./MarketActivityIndicator";
import { TimezonePickerDialog } from "./TimezonePickerDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import "./MarketSessions.css";

export function MarketSessionsPage() {
  const { selectText, language } = useLanguage();
  const { timezone, isAutoTimezone } = useUserPreferences();

  const [now, setNow] = useState(() => new Date());
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);

  // Single shared 1-second timer for the entire page, paused when tab is hidden
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const tick = () => {
      setNow(new Date());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tick();
        if (!timer) {
          timer = setInterval(tick, 1000);
        }
      } else {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
    };

    if (document.visibilityState === "visible") {
      timer = setInterval(tick, 1000);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const { sessions, weekendState, activityLevel, activeSessionsCount } = calculateAllSessions(
    now,
    timezone,
    language === "bn" ? "bn-BD" : language === "ur" ? "ur-PK" : "en-US"
  );

  // Live formatted clock in user's time zone
  const liveClockTime = new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : language === "ur" ? "ur-PK" : "en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  const liveClockDate = new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : language === "ur" ? "ur-PK" : "en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  const cleanZoneName = timezone.split("/").pop()?.replace(/_/g, " ") || timezone;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/15 border border-cyan-500/20">
              <Clock size={18} />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              {selectText({
                en: "Global Forex Clock & Liquidity Windows",
                bn: "গ্লোবাল ফরেক্স ঘড়ি ও তারল্য সময়সূচি",
                ur: "عالمی فاریکس کلاک اور لیکویڈیٹی کے اوقات",
              })}
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {selectText({
              en: "Forex market sessions",
              bn: "ফরেক্স মার্কেট সেশন",
              ur: "فاریکس مارکیٹ سیشنز",
            })}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {selectText({
              en: "Live institutional trading sessions, liquidity overlaps and dynamic time conversion.",
              bn: "লাইভ প্রাতিষ্ঠানিক ট্রেডিং সেশন, লিকুইডিটি ওভারল্যাপ এবং গতিশীল সময় রূপান্তর।",
              ur: "براہ راست ادارہ جاتی تجارتی سیشنز، لیکویڈیٹی اوورلیپ اور متحرک وقت کی تبدیلی۔",
            })}
          </p>
        </div>

        {/* Live Clock & Time Zone Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {/* User Live Clock Badge */}
          <div
            className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-500/10 px-3 py-1.5 sm:px-4 sm:py-2"
            dir="ltr"
          >
            <div className="flex size-2 relative">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400">
                {liveClockDate} · {cleanZoneName}
              </div>
              <div className="text-base sm:text-xl font-black font-mono tracking-wider text-slate-900 dark:text-cyan-400">
                {liveClockTime}
              </div>
            </div>
          </div>

          {/* Change Time Zone Button */}
          <button
            type="button"
            onClick={() => setIsTimezoneModalOpen(true)}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 sm:px-4 sm:py-3 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs cursor-pointer"
            title={selectText({ en: "Change reference time zone", bn: "টাইমজোন পরিবর্তন করুন", ur: "ٹائم زون تبدیل کریں" })}
          >
            <Globe size={15} className="text-sky-500 sm:size-4" />
            <span>
              {selectText({
                en: isAutoTimezone ? "Auto (device)" : cleanZoneName,
                bn: isAutoTimezone ? "অটো (ডিভাইস)" : cleanZoneName,
                ur: isAutoTimezone ? "خودکار (ڈیوائس)" : cleanZoneName,
              })}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Weekend Closed Banner (DST-Aware Friday 17:00 NY to Sunday 17:00 NY) */}
      {weekendState.isClosed && (
        <div className="flex items-center gap-3 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-4 text-amber-800 dark:text-amber-300 shadow-xs">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 sm:size-5" />
          <div className="text-xs sm:text-sm font-bold">
            {selectText({
              en: `Market closed for the weekend. Reopens in ${weekendState.reopenCountdownFormatted}`,
              bn: `সাপ্তাহিক ছুটির জন্য মার্কেট বন্ধ। পুনরায় খুলবে ${weekendState.reopenCountdownFormatted}-এ`,
              ur: `ہفتہ وار چھٹی کی وجہ سے مارکیٹ بند ہے۔ دوبارہ کھلے گی ${weekendState.reopenCountdownFormatted} میں`,
            })}
          </div>
        </div>
      )}

      {/* 3. Market Activity Equalizer */}
      <MarketActivityIndicator level={activityLevel} activeCount={activeSessionsCount} />

      {/* 4. Four Session Cards (Sydney, Tokyo, London, New York) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {sessions.map((session, index) => (
          <SessionCard
            key={session.config.id}
            session={session}
            index={index}
            isWeekendClosed={weekendState.isClosed}
          />
        ))}
      </div>

      {/* 5. 24-Hour Timeline */}
      <MarketSessionsTimeline
        sessions={sessions}
        now={now}
        userTimeZone={timezone}
        isWeekendClosed={weekendState.isClosed}
      />

      {/* 6. Disclaimer Note (Bottom of page, below timeline legend) */}
      <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-3 sm:p-4 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
        <Info size={15} className="text-slate-400 shrink-0 mt-0.5 sm:size-4" />
        <p className="leading-relaxed">
          {selectText({
            en: "Session hours shown are typical market conventions in each city's local time. Actual liquidity and broker hours may vary. This is educational information only, not trading advice.",
            bn: "এখানে দেখানো সেশনের সময়গুলো প্রতিটি শহরের স্থানীয় সময় অনুযায়ী প্রচলিত বাজারের নিয়ম। ব্রোকার ও বাজারের তারল্য অনুযায়ী প্রকৃত সময় ভিন্ন হতে পারে। এটি শুধুমাত্র শিক্ষামূলক তথ্য, ট্রেডিং পরামর্শ নয়।",
            ur: "یہاں دکھائے گئے سیشن کے اوقات ہر شہر کے مقامی وقت کے مطابق عام مارکیٹ روایات ہیں۔ بروکر اور مارکیٹ کی لیکویڈیٹی کے مطابق اصل اوقات مختلف ہو سکتے ہیں۔ یہ صرف تعلیمی معلومات ہے، ٹریڈنگ مشورہ نہیں۔",
          })}
        </p>
      </div>

      {/* Timezone Selection Modal */}
      <TimezonePickerDialog
        isOpen={isTimezoneModalOpen}
        onClose={() => setIsTimezoneModalOpen(false)}
      />
    </div>
  );
}
export default MarketSessionsPage;
