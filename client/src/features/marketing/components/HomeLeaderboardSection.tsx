import React from "react";
import { Link } from "wouter";
import {
  Trophy,
  ShieldCheck,
  BarChart3,
  Flame,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import type { LeaderboardTrader } from "@shared/types/leaderboard";

interface HomeLeaderboardSectionProps {
  isBn?: boolean;
}

export function HomeLeaderboardSection({ isBn: _isBnProp }: HomeLeaderboardSectionProps) {
  const { selectText, isUr, isRTL } = useLanguage();

  // Fetch real public rankings from the server
  const { data: rankings, isLoading } = trpc.leaderboard.rankings.useQuery(
    { timeframe: "all" },
    { refetchOnWindowFocus: false, staleTime: 30000 }
  );

  const topTraders: LeaderboardTrader[] = (rankings || []).slice(0, 4);
  const hasRealTraders = topTraders.length > 0;

  return (
    <section
      id="leaderboard-showcase"
      className="content-auto relative overflow-hidden py-12 sm:py-20 lg:py-28 bg-slate-50/50 dark:bg-[#070e1b] text-slate-900 dark:text-white transition-colors"
    >
      {/* Subtle atmospheric ambient glows matching Cycle of Chart styling */}
      <div
        className="pointer-events-none absolute top-1/4 -left-20 size-80 sm:size-96 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/[0.05]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 -right-20 size-80 sm:size-96 rounded-full bg-blue-600/10 blur-3xl dark:bg-sky-500/[0.04]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-5 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* ================================================================= */}
          {/* LEFT COLUMN: Visual Preview of the actual Global Leaderboard      */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 w-full order-2 lg:order-1">
            <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-6 lg:p-7 shadow-2xl backdrop-blur-xl dark:border-slate-800/90 dark:bg-[#081326]/95 dark:shadow-[0_20px_50px_-15px_rgba(2,132,199,0.2)]">
              {/* Preview Window Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">
                        {selectText({
                          en: "Global Leaderboard",
                          bn: "গ্লোবাল লিডারবোর্ড",
                          ur: "عالمی لیڈر بورڈ",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                        <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        {selectText({
                          en: "All-Time",
                          bn: "সর্বকালের",
                          ur: "ہمہ وقتی",
                        })}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                      {selectText({
                        en: "Real Trader Performance System",
                        bn: "রিয়েল ট্রেডার পারফরম্যান্স সিস্টেম",
                        ur: "حقیقی ٹریڈر کارکردگی کا نظام",
                      })}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>
                    {selectText({
                      en: "Live Engine",
                      bn: "লাইভ ইঞ্জিন",
                      ur: "لائیو انجن",
                    })}
                  </span>
                </div>
              </div>

              {/* 5-Pillar Scoring Weight Formula Ticker (Matches actual Leaderboard weights) */}
              <div className="my-4 py-2.5 px-3 rounded-xl bg-slate-100/70 dark:bg-[#0c182c]/80 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" />
                    {selectText({
                      en: "Score Formula Weights",
                      bn: "স্কোর ফর্মুলা ওয়েটস",
                      ur: "اسکور فارمولا اوزان",
                    })}
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-mono">100% Deterministic</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center text-[10px]">
                  <div className="rounded-lg bg-white dark:bg-slate-900/90 p-1.5 border border-slate-200/70 dark:border-slate-800/80">
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      {selectText({ en: "Rule Adherence", bn: "রিস্ক রুল", ur: "قواعد" })}
                    </div>
                    <div className="font-extrabold text-sky-600 dark:text-sky-400">25%</div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-900/90 p-1.5 border border-slate-200/70 dark:border-slate-800/80">
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      {selectText({ en: "Discipline", bn: "ডিসিপ্লিন", ur: "ڈسپلن" })}
                    </div>
                    <div className="font-extrabold text-emerald-600 dark:text-emerald-400">25%</div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-900/90 p-1.5 border border-slate-200/70 dark:border-slate-800/80">
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      {selectText({ en: "Win Rate", bn: "উইন রেট", ur: "ون ریٹ" })}
                    </div>
                    <div className="font-extrabold text-cyan-600 dark:text-cyan-400">20%</div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-900/90 p-1.5 border border-slate-200/70 dark:border-slate-800/80">
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      {selectText({ en: "Consistency", bn: "ধারাবাহিকতা", ur: "تسلسل" })}
                    </div>
                    <div className="font-extrabold text-purple-600 dark:text-purple-400">15%</div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-900/90 p-1.5 border border-slate-200/70 dark:border-slate-800/80 col-span-3 sm:col-span-1">
                    <div className="text-slate-500 dark:text-slate-400 truncate">
                      {selectText({ en: "Profit Factor", bn: "প্রফিট ফ্যাক্টর", ur: "پرافٹ فیکٹر" })}
                    </div>
                    <div className="font-extrabold text-amber-600 dark:text-amber-400">15%</div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table / Standings Preview */}
              <div className="space-y-2 mt-2">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="size-7 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">
                      {selectText({
                        en: "Loading real leaderboard rankings...",
                        bn: "রিয়েল লিডারবোর্ড লোড হচ্ছে...",
                        ur: "حقیقی لیڈر بورڈ لوڈ ہو رہا ہے...",
                      })}
                    </span>
                  </div>
                ) : hasRealTraders ? (
                  /* Render Real Ranked Traders from the Database */
                  topTraders.map((trader) => {
                    const isFirst = trader.rank === 1;
                    const isSecond = trader.rank === 2;
                    const isThird = trader.rank === 3;

                    const rankBadge = isFirst
                      ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                      : isSecond
                      ? "bg-slate-300/20 text-slate-700 dark:text-slate-300 border border-slate-300/40"
                      : isThird
                      ? "bg-amber-700/15 text-amber-600 dark:text-amber-500 border border-amber-700/30"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

                    return (
                      <div
                        key={trader.userId}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-200/70 bg-white dark:border-slate-800/70 dark:bg-[#0b162a] hover:border-sky-500/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`inline-flex size-6 sm:size-7 items-center justify-center rounded-lg font-mono text-[11px] font-black shrink-0 ${rankBadge}`}
                          >
                            #{trader.rank}
                          </span>
                          <div className="size-7 sm:size-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {trader.avatar ? (
                              <img src={trader.avatar} alt={trader.name} className="size-full object-cover" />
                            ) : (
                              <span>{(trader.name || "T")[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {trader.name}
                              </span>
                              <CheckCircle2 size={12} className="text-sky-400 shrink-0" />
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {trader.bestPair || "EUR/USD"} • {trader.winRate}% WR
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <div className="hidden sm:block">
                            <div className="text-[9px] uppercase tracking-wider text-slate-400">
                              {selectText({ en: "Rule Adherence", bn: "রুল রেট", ur: "قواعد" })}
                            </div>
                            <div className="text-xs font-bold text-sky-500">
                              {trader.ruleComplianceRate}%
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-400">
                              {selectText({ en: "Score", bn: "স্কোর", ur: "اسکور" })}
                            </div>
                            <span className="inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-black text-cyan-600 dark:text-cyan-400">
                              {Math.round(trader.overallScore)} / 100
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* Authentic Live Qualification State (When no traders have qualified yet or in clean environment) */
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 sm:p-5 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 mx-auto">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {selectText({
                          en: "Process-Driven Qualification In Progress",
                          bn: "প্রসেস-ভিত্তিক যোগ্যতা যাচাই সক্রিয়",
                          ur: "طریقہ کار پر مبنی درجہ بندی جاری ہے",
                        })}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {selectText({
                          en: "Rankings are strictly computed from verified trader logs, daily discipline habits, and risk adherence. Log your trades in the Journal to claim your rank.",
                          bn: "র‍্যাঙ্কিং সম্পূর্ণ ট্রেডারদের ভেরিফাইড জার্নাল, দৈনিক ডিসিপ্লিন রুটিন ও রিস্ক মেনে চলার ওপর ভিত্তি করে তৈরি হয়। অংশ নিতে জার্নালে ট্রেড এন্ট্রি করুন।",
                          ur: "درجہ بندی کی بنیاد تصدیق شدہ جرنل، روزمرہ کے معمولات اور رسک مینجمنٹ پر رکھی گئی ہے۔ اپنا رینک حاصل کرنے کے لیے جرنل میں ٹریڈز درج کریں۔",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-sky-500" />
                  <span>
                    {selectText({
                      en: "Strictly verified execution",
                      bn: "যাচাইকৃত সুশৃঙ্খল এক্সিকিউশন",
                      ur: "سختی سے تصدیق شدہ عمل درآمد",
                    })}
                  </span>
                </span>
                <Link
                  href="/leaderboard"
                  className="font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>
                    {selectText({
                      en: "Full Table",
                      bn: "পূর্ণাঙ্গ তালিকা",
                      ur: "مکمل فہرست",
                    })}
                  </span>
                  <ArrowRight size={12} className={isRTL ? "rotate-180" : ""} />
                </Link>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: Promotional Details, Features & CTA Button          */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 order-1 lg:order-2">
            {/* Section Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3.5 py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-[.2em] text-[#0284c7] dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-[#38bdf8]">
              <Trophy size={13} className="text-amber-500 shrink-0" />
              <span>
                {selectText({
                  en: "COMMUNITY BENCHMARK & DISCIPLINE",
                  bn: "কমিউনিটি বেঞ্চমার্ক ও ডিসিপ্লিন",
                  ur: "کمیونٹی بینچ مارک اور ڈسپلن",
                })}
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {selectText({
                en: "Global Leaderboard & Trader Progress",
                bn: "গ্লোবাল লিডারবোর্ড ও ট্রেডার অগ্রগতি",
                ur: "گلوبل لیڈر بورڈ اور ٹریڈر کی پیش رفت",
              })}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectText({
                en: "Track your trading discipline, explore your ranking, and measure your progress through the existing Cycle of Chart Global Leaderboard.",
                bn: "আপনার ট্রেডিং ডিসিপ্লিন ট্র্যাক করুন, আপনার অবস্থান জানুন এবং সাইকেল অব চার্ট গ্লোবাল লিডারবোর্ডের মাধ্যমে অগ্রগতি পরিমাপ করুন।",
                ur: "اپنے ٹریڈنگ ڈسپلن کو ٹریک کریں، اپنی درجہ بندی تلاش کریں، اور موجودہ Cycle of Chart گلوبل لیڈر بورڈ کے ذریعے اپنی پیش رفت کی پیمائش کریں۔",
              })}
            </p>

            {/* Feature Points */}
            <div className="space-y-3.5 pt-1">
              {/* Feature 1: Global trader rankings */}
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 mt-0.5">
                  <Trophy size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {selectText({
                      en: "Global trader rankings",
                      bn: "গ্লোবাল ট্রেডার র‍্যাঙ্কিং",
                      ur: "عالمی ٹریڈر درجہ بندی",
                    })}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                    {selectText({
                      en: "Deterministic rankings computed from authentic trade executions and verified habit adherence rather than gambling.",
                      bn: "অন্ধ জুয়া নয়, সুশৃঙ্খল এক্সিকিউশন ও অভ্যাস মেনে চলার তথ্যের ওপর ভিত্তি করে নির্ভরযোগ্য র‍্যাঙ্কিং।",
                      ur: "اندھا دھند جوئے کے بجائے تصدیق شدہ ٹریڈز اور مستقل مزاجی کی بنیاد پر درجہ بندی۔",
                    })}
                  </p>
                </div>
              </div>

              {/* Feature 2: Overall Score and supported discipline metrics */}
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 border border-sky-500/20 mt-0.5">
                  <BarChart3 size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {selectText({
                      en: "Overall Score and supported discipline metrics",
                      bn: "ওভারঅল স্কোর ও ডিসিপ্লিন মেট্রিক্স",
                      ur: "مجموعی اسکور اور ڈسپلن میٹرکس",
                    })}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                    {selectText({
                      en: "A transparent 0–100 composite score balancing daily discipline routines, win rate, and profit factor.",
                      bn: "স্বচ্ছ ০–১০০ কম্পোজিট স্কোর যা দৈনিক ডিসিপ্লিন রুটিন, উইন রেট এবং প্রফিট ফ্যাক্টরের ভারসাম্য প্রকাশ করে।",
                      ur: "ایک شفاف 0–100 اسکور جو روزمرہ کے معمولات، ون ریٹ اور پرافٹ فیکٹر کے توازن کو جانچتا ہے۔",
                    })}
                  </p>
                </div>
              </div>

              {/* Feature 3: Rule Adherence and Consistency */}
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {selectText({
                      en: "Rule Adherence and Consistency",
                      bn: "রিস্ক মেনে চলা ও ধারাবাহিকতা",
                      ur: "قواعد کی پابندی اور تسلسل",
                    })}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                    {selectText({
                      en: "Track strict risk compliance percentages and daily consecutive active streaks to maintain trading longevity.",
                      bn: "রিস্ক প্ল্যান মেনে চলার হার এবং প্রতিদিনের অ্যাক্টিভ স্ট্রিক মনিটর করে অ্যাকাউন্ট সুরক্ষিত রাখুন।",
                      ur: "اکاؤنٹ کی حفاظت اور کامیابی کے لیے رسک مینجمنٹ اور روزانہ کے تسلسل کی کڑی نگرانی کریں۔",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Prominent CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/leaderboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-11 sm:h-12 rounded-xl px-6 sm:px-8 text-xs sm:text-sm font-bold bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20 dark:bg-[#38bdf8] dark:text-[#08111f] dark:hover:bg-[#7dd3fc] transition-all cursor-pointer"
                >
                  <span>
                    {selectText({
                      en: "Explore Leaderboard",
                      bn: "লিডারবোর্ড দেখুন",
                      ur: "لیڈر بورڈ دیکھیں",
                    })}
                  </span>
                  <ArrowRight size={16} className={`ml-2 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                </Button>
              </Link>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                {selectText({
                  en: "Free to inspect • Real authenticated data",
                  bn: "সবার জন্য উন্মুক্ত • রিয়েল ডেটা",
                  ur: "مفت ملاحظہ • حقیقی تصدیق شدہ ڈیٹا",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
