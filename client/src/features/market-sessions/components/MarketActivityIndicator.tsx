import React from "react";
import { MarketActivityLevel } from "../lib/sessionLogic";
import { useLanguage } from "@/contexts/LanguageContext";
import { Activity } from "lucide-react";

interface MarketActivityIndicatorProps {
  level: MarketActivityLevel;
  activeCount: number;
}

export function MarketActivityIndicator({ level, activeCount }: MarketActivityIndicatorProps) {
  const { selectText } = useLanguage();

  // Lit bars count: Quiet 0, Low 2, Medium 4, High 7
  const litCountMap: Record<MarketActivityLevel, number> = {
    quiet: 0,
    low: 2,
    medium: 4,
    high: 7,
  };

  const litCount = litCountMap[level];
  const isHigh = level === "high";

  const levelLabel =
    level === "high"
      ? selectText({ en: "High Liquidity", bn: "উচ্চ তারল্য", ur: "زیادہ لیکویڈیٹی" })
      : level === "medium"
      ? selectText({ en: "Medium Liquidity", bn: "মাঝারি তারল্য", ur: "درمیانی لیکویڈیٹی" })
      : level === "low"
      ? selectText({ en: "Low Liquidity", bn: "স্বল্প তারল্য", ur: "کم لیکویڈیٹی" })
      : selectText({ en: "Quiet Market", bn: "শান্ত বাজার", ur: "پرسکون مارکیٹ" });

  const levelDescription =
    level === "high"
      ? selectText({
          en: "London & New York Overlap active · Peak market volume",
          bn: "লন্ডন ও নিউ ইয়র্ক ওভারল্যাপ সক্রিয় · সর্বোচ্চ ট্রেডিং ভলিউম",
          ur: "لندن اور نیویارک اوورلیپ فعال ہے · زیادہ سے زیادہ ٹریڈنگ والیوم",
        })
      : level === "medium"
      ? selectText({
          en: "Two trading sessions open simultaneously",
          bn: "একযোগে দুটি ট্রেডিং সেশন সক্রিয়",
          ur: "ایک ساتھ دو تجارتی سیشن فعال ہیں",
        })
      : level === "low"
      ? selectText({
          en: "Single trading session active",
          bn: "একটি ট্রেডিং সেশন সক্রিয়",
          ur: "صرف ایک تجارتی سیشن فعال ہے",
        })
      : selectText({
          en: "No major session open or market closed",
          bn: "কোনো প্রধান সেশন সক্রিয় নেই অথবা বাজার বন্ধ",
          ur: "کوئی بڑا سیشن فعال نہیں یا مارکیٹ بند ہے",
        });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0b172a]/90 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
            isHigh
              ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
              : level === "medium"
              ? "bg-sky-500/15 border-sky-500/30 text-sky-500"
              : level === "low"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
          }`}
        >
          <Activity size={20} className={isHigh ? "animate-pulse" : ""} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {selectText({ en: "Market Activity", bn: "মার্কেট অ্যাক্টিভিটি", ur: "مارکیٹ کی سرگرمی" })}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                isHigh
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : level === "medium"
                  ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
                  : level === "low"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              {levelLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {levelDescription}
          </p>
        </div>
      </div>

      {/* 7-Bar Equalizer Meter */}
      <div className="flex items-end gap-1.5 h-8 px-3 py-1 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shrink-0 self-start sm:self-auto">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const isLit = i < litCount;
          return (
            <div
              key={i}
              className={`w-2 rounded-t-sm transition-all duration-300 ${
                isLit
                  ? isHigh
                    ? "bg-amber-400 eq-bar-bounce-fast shadow-[0_0_6px_#fbbf24]"
                    : "bg-cyan-400 eq-bar-bounce shadow-[0_0_6px_#22d3ee]"
                  : "bg-slate-200 dark:bg-slate-800 h-2 opacity-50"
              }`}
              style={{
                height: isLit ? `${20 + (i % 3) * 5}px` : "6px",
                animationDelay: isLit ? `${i * 110}ms` : "0ms",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
