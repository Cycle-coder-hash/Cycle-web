import React, { useMemo } from "react";
import {
  Medal,
  Crown,
  Flame,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LeaderboardTrader } from "@shared/types/leaderboard";

export interface LeaderboardRankingsSectionProps {
  topThree: LeaderboardTrader[];
  restRankings: LeaderboardTrader[];
  isBn?: boolean;
  onSelectTrader: (trader: LeaderboardTrader) => void;
}

export interface TraderPerformanceModalProps {
  selectedTrader: LeaderboardTrader | null;
  onClose: () => void;
  isBn?: boolean;
}

export function LeaderboardRankingsSection({
  topThree,
  restRankings,
  onSelectTrader,
}: LeaderboardRankingsSectionProps) {
  const { selectText, isUr, isRTL } = useLanguage();

  // Podium arrangement:
  // Desktop: #2 Second Place (left), #1 First Place (center elevated), #3 Third Place (right)
  const podiumTraders = useMemo(() => {
    if (!topThree.length) return [];
    const first = topThree[0] || null;
    const second = topThree[1] || null;
    const third = topThree[2] || null;
    return [
      {
        trader: second,
        position: 2,
        label: selectText({
          en: "#2 SECOND PLACE 🥈",
          bn: "#২ দ্বিতীয় স্থান 🥈",
          ur: "#2 دوسرا مقام 🥈",
        }),
        orderClass: "order-2 md:order-1",
      },
      {
        trader: first,
        position: 1,
        label: selectText({
          en: "#1 FIRST PLACE 🥇",
          bn: "#১ প্রথম স্থান 🥇",
          ur: "#1 پہلا مقام 🥇",
        }),
        orderClass: "order-1 md:order-2",
      },
      {
        trader: third,
        position: 3,
        label: selectText({
          en: "#3 THIRD PLACE 🥉",
          bn: "#৩ তৃতীয় স্থান 🥉",
          ur: "#3 تیسرا مقام 🥉",
        }),
        orderClass: "order-3 md:order-3",
      },
    ].filter((item) => item.trader !== null);
  }, [topThree, selectText]);

  return (
    <>
      {/* ======================================================================= */}
      {/* TOP 3 PODIUM */}
      {/* ======================================================================= */}
      {topThree.length > 0 && (
        <section className={`space-y-4 ${isUr ? "font-urdu" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200">
              {selectText({
                en: "Top 3 Podium (Global Ranks #1–#3)",
                bn: "শীর্ষ ৩ পোডিয়াম (টপ ৩ ট্রেডার)",
                ur: "ٹاپ 3 پوڈیم (عالمی رینک #1–#3)",
              })}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            {podiumTraders.map(({ trader, position, label, orderClass }) => {
              if (!trader) return null;
              const isChampion = position === 1;
              const isSilver = position === 2;

              const borderColor = isChampion
                ? "border-amber-400/60 dark:border-amber-400/80 shadow-amber-500/20"
                : isSilver
                ? "border-slate-300 dark:border-slate-400/60 shadow-slate-500/10"
                : "border-amber-600/40 dark:border-amber-700/60 shadow-amber-900/10";

              const glowBg = isChampion
                ? "bg-gradient-to-b from-amber-500/15 via-slate-50/80 to-white dark:from-amber-500/20 dark:via-[#09152b] dark:to-[#050b17]"
                : isSilver
                ? "bg-gradient-to-b from-slate-300/20 via-slate-50/80 to-white dark:from-slate-400/15 dark:via-[#081326] dark:to-[#050b17]"
                : "bg-gradient-to-b from-amber-700/15 via-slate-50/80 to-white dark:from-amber-800/15 dark:via-[#081326] dark:to-[#050b17]";

              const badgeColor = isChampion
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30"
                : isSilver
                ? "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 shadow-md"
                : "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md";

              const hasPositiveProfit = trader.totalPnl > 0;

              return (
                <div
                  key={trader.userId}
                  onClick={() => onSelectTrader(trader)}
                  className={`relative cursor-pointer rounded-3xl border ${borderColor} ${glowBg} p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${orderClass} ${
                    isChampion ? "md:-translate-y-3 z-20" : "z-10"
                  }`}
                >
                  {/* Rank Badge at top */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className={`flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-black uppercase tracking-wider ${badgeColor}`}>
                      {isChampion ? <Crown size={14} className="fill-slate-950" /> : <Medal size={14} />}
                      <span dir="ltr">{label}</span>
                    </div>
                  </div>

                  <div className="pt-3 text-center space-y-3">
                    {/* Profile Photo */}
                    <div className="relative mx-auto size-20 rounded-full overflow-hidden border-2 border-white/80 dark:border-slate-700 shadow-lg bg-slate-800 flex items-center justify-center text-xl font-black text-white">
                      {trader.avatar ? (
                        <img src={trader.avatar} alt={trader.name} className="size-full object-cover" />
                      ) : (
                        <span>{(trader.name || "T")[0]?.toUpperCase()}</span>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                        <span>{trader.name}</span>
                        <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
                      </h3>
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400" dir="ltr">
                        {trader.bestPair}
                      </div>
                    </div>

                    {/* Overall Composite Score (Whole Number / 100) */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-800/80 dark:bg-[#071124]/90 shadow-inner">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {selectText({
                          en: "Overall Score",
                          bn: "সামগ্রিক স্কোর",
                          ur: "مجموعی اسکور",
                        })}
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400" dir="ltr">
                        {Math.round(trader.overallScore)} <span className="text-xs font-bold text-slate-400">/ 100</span>
                      </div>
                    </div>

                    {/* Key Performance Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-left pt-1">
                      {/* Rule Adherence */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Rule Adherence",
                            bn: "রিস্ক মেনে চলা",
                            ur: "قواعد کی پابندی",
                          })}
                        </div>
                        <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400" dir="ltr">
                          {trader.ruleComplianceRate}%
                        </div>
                      </div>

                      {/* Discipline Routine */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Discipline",
                            bn: "ডিসিপ্লিন রুটিন",
                            ur: "ڈسپلن",
                          })}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400" dir="ltr">
                          {trader.disciplineScore}%
                        </div>
                      </div>

                      {/* Consistency */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Consistency",
                            bn: "ধারাবাহিকতা",
                            ur: "تسلسل",
                          })}
                        </div>
                        <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400" dir="ltr">
                          {trader.consistencyScore}%
                        </div>
                        <div className="text-[10px] text-slate-400" dir="ltr">{trader.currentStreak}d streak</div>
                      </div>

                      {/* Win Rate */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Win Rate",
                            bn: "উইন রেট",
                            ur: "Win Rate",
                          })}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400" dir="ltr">
                          {trader.winRate}%
                        </div>
                        <div className="text-[10px] text-slate-400" dir="ltr">
                          {trader.winningTrades}W / {trader.losingTrades}L
                        </div>
                      </div>

                      {/* Total Trades */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Total Trades",
                            bn: "মোট ট্রেড",
                            ur: "کل ٹریڈز",
                          })}
                        </div>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200" dir="ltr">
                          {trader.totalTrades}
                        </div>
                      </div>

                      {/* Profit (Rendered ONLY if positive) */}
                      {hasPositiveProfit ? (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {selectText({
                              en: "Profit",
                              bn: "প্রফিট",
                              ur: "منافع",
                            })}
                          </div>
                          <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400" dir="ltr">
                            +${trader.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Breakdown Action */}
                    <button
                      type="button"
                      className="w-full mt-2 rounded-xl py-2 text-xs font-extrabold text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 transition flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {selectText({
                          en: "View Breakdown",
                          bn: "পারফরম্যান্স বিশদ",
                          ur: "تفصیلات دیکھیں",
                        })}
                      </span>
                      <ChevronRight size={14} className={isRTL ? "rotate-180" : ""} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================================= */}
      {/* RANKED LIST (RANKS #4–#30) */}
      {/* ======================================================================= */}
      {restRankings.length > 0 && (
        <section className={`space-y-4 ${isUr ? "font-urdu" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-sky-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200">
                {selectText({
                  en: "Global Rankings (#4–#30)",
                  bn: "র‌্যাঙ্কিং তালিকা (#৪–#৩০)",
                  ur: "عالمی درجہ بندی (#4–#30)",
                })}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {restRankings.length}{" "}
              {selectText({
                en: "traders",
                bn: "জন ট্রেডার",
                ur: "ٹریڈرز",
              })}
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#070e1b]/90 shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 pl-6 pr-3">Rank</th>
                  <th className="py-3.5 px-3">Trader</th>
                  <th className="py-3.5 px-3 text-center">
                    {selectText({
                      en: "Overall Score",
                      bn: "স্কোর",
                      ur: "اسکور",
                    })}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {selectText({
                      en: "Rule Adherence",
                      bn: "রিস্ক মেনে চলা",
                      ur: "قواعد کی پابندی",
                    })}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {selectText({
                      en: "Discipline Routine",
                      bn: "ডিসিপ্লিন",
                      ur: "ڈسپلن",
                    })}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {selectText({
                      en: "Consistency",
                      bn: "ধারাবাহিকতা",
                      ur: "تسلسل",
                    })}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {selectText({
                      en: "Total Trades",
                      bn: "মোট ট্রেড",
                      ur: "کل ٹریڈز",
                    })}
                  </th>
                  <th className="py-3.5 px-3 text-center">
                    {selectText({
                      en: "Win Rate",
                      bn: "উইন রেট",
                      ur: "Win Rate",
                    })}
                  </th>
                  <th className="py-3.5 px-3 text-right">
                    {selectText({
                      en: "Profit",
                      bn: "প্রফিট",
                      ur: "منافع",
                    })}
                  </th>
                  <th className="py-3.5 pr-6 pl-3 text-right">
                    {selectText({
                      en: "Action",
                      bn: "অ্যাকশন",
                      ur: "ایکشن",
                    })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {restRankings.map((t) => (
                  <tr
                    key={t.userId}
                    onClick={() => onSelectTrader(t)}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                  >
                    {/* Rank */}
                    <td className="py-4 pl-6 pr-3 font-mono font-bold text-slate-500">
                      <span className="inline-flex size-7 items-center justify-center rounded-lg bg-slate-100 font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300" dir="ltr">
                        #{t.rank}
                      </span>
                    </td>

                    {/* Trader Info */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {t.avatar ? (
                            <img src={t.avatar} alt={t.name} className="size-full object-cover" />
                          ) : (
                            <span>{(t.name || "T")[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <span>{t.name}</span>
                            <CheckCircle2 size={13} className="text-sky-400" />
                          </div>
                          <div className="text-[10px] text-slate-400" dir="ltr">
                            {t.bestPair}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Overall Composite Score */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-black text-cyan-500" dir="ltr">
                        {Math.round(t.overallScore)} / 100
                      </span>
                    </td>

                    {/* Rule Compliance */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-extrabold text-sky-600 dark:text-sky-400" dir="ltr">
                        {t.ruleComplianceRate}%
                      </span>
                    </td>

                    {/* Discipline Routine */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400" dir="ltr">
                        {t.disciplineScore}%
                      </span>
                    </td>

                    {/* Consistency & Streak */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-500" dir="ltr">
                        <Flame size={12} />
                        <span>{t.currentStreak}d</span>
                      </span>
                    </td>

                    {/* Total Trades */}
                    <td className="py-4 px-3 text-center text-slate-600 dark:text-slate-300">
                      <span className="font-bold" dir="ltr">{t.totalTrades}</span>{" "}
                      <span className="text-[10px] text-slate-400" dir="ltr">
                        ({t.winningTrades}W / {t.losingTrades}L)
                      </span>
                    </td>

                    {/* Win Rate */}
                    <td className="py-4 px-3 text-center">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400" dir="ltr">
                        {t.winRate}%
                      </span>
                    </td>

                    {/* Profit (ONLY positive displayed) */}
                    <td className="py-4 px-3 text-right">
                      {t.totalPnl > 0 ? (
                        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono" dir="ltr">
                          +${t.totalPnl.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 pr-6 pl-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-bold text-sky-500 hover:text-sky-400 hover:bg-sky-500/10"
                      >
                        {selectText({
                          en: "Details",
                          bn: "দেখুন",
                          ur: "دیکھیں",
                        })}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List for #4 to #30 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
            {restRankings.map((t) => (
              <div
                key={t.userId}
                onClick={() => onSelectTrader(t)}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#070e1b] space-y-3 cursor-pointer hover:border-sky-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex size-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300" dir="ltr">
                      #{t.rank}
                    </span>
                    <div className="size-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} className="size-full object-cover" />
                      ) : (
                        <span>{(t.name || "T")[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{t.name}</span>
                        <CheckCircle2 size={12} className="text-sky-400" />
                      </div>
                      <div className="text-[10px] text-slate-400" dir="ltr">{t.bestPair}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-black text-cyan-500" dir="ltr">
                      {Math.round(t.overallScore)} / 100
                    </span>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {selectText({
                        en: "Rule Adherence:",
                        bn: "রিস্ক মেনে চলা:",
                        ur: "قواعد کی پابندی:",
                      })}
                    </span>
                    <span className="font-bold text-sky-500" dir="ltr">{t.ruleComplianceRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {selectText({
                        en: "Discipline:",
                        bn: "ডিসিপ্লিন:",
                        ur: "ڈسپلن:",
                      })}
                    </span>
                    <span className="font-bold text-emerald-500" dir="ltr">{t.disciplineScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {selectText({
                        en: "Win Rate:",
                        bn: "উইন রেট:",
                        ur: "Win Rate:",
                      })}
                    </span>
                    <span className="font-bold text-emerald-500" dir="ltr">{t.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {selectText({
                        en: "Trades:",
                        bn: "ট্রেডস:",
                        ur: "ٹریڈز:",
                      })}
                    </span>
                    <span className="font-bold" dir="ltr">{t.totalTrades}</span>
                  </div>
                  {t.totalPnl > 0 ? (
                    <div className="col-span-2 flex justify-between font-mono pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-400">
                        {selectText({
                          en: "Profit:",
                          bn: "প্রফিট:",
                          ur: "منافع:",
                        })}
                      </span>
                      <span className="font-extrabold text-emerald-500" dir="ltr">+${t.totalPnl.toFixed(2)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function TraderPerformanceModal({
  selectedTrader,
  onClose,
}: TraderPerformanceModalProps) {
  const { selectText, isUr, isRTL } = useLanguage();

  if (!selectedTrader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-[#070e1b] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 ${
          isUr ? "font-urdu" : ""
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 ${isRTL ? "left-5" : "right-5"} rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition`}
        >
          <X size={20} />
        </button>

        {/* Trader Header */}
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-xl font-black text-white shrink-0 border-2 border-sky-500/40">
            {selectedTrader.avatar ? (
              <img src={selectedTrader.avatar} alt={selectedTrader.name} className="size-full object-cover" />
            ) : (
              <span>{(selectedTrader.name || "T")[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-black text-amber-500" dir="ltr">
                Rank #{selectedTrader.rank}
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase">
                {selectText({
                  en: "All-Time",
                  bn: "অল-টাইম",
                  ur: "ہمہ وقتی",
                })}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <span>{selectedTrader.name}</span>
              <CheckCircle2 size={18} className="text-sky-400 shrink-0" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span dir="ltr">{selectedTrader.bestPair}</span> ·{" "}
              {selectText({
                en: "Verified Real Trader",
                bn: "ভেরিফায়েড রিয়েল ট্রেডার",
                ur: "تصدیق شدہ حقیقی ٹریڈر",
              })}
            </p>
          </div>
        </div>

        {/* Overall Composite Score Showcase */}
        <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-emerald-500/10 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {selectText({
                en: "Composite Leaderboard Score",
                bn: "সামগ্রিক লিডারবোর্ড স্কোর",
                ur: "مجموعی لیڈر بورڈ اسکور",
              })}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-0.5" dir="ltr">
              {Math.round(selectedTrader.overallScore)}{" "}
              <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {selectText({
                en: "Computed via multi-dimensional adherence matrix.",
                bn: "রিস্ক ম্যানেজমেন্ট, উইন রেট ও ডিসিপ্লিনের সমাহারে নির্ধারিত।",
                ur: "ملٹی ڈائمینشنل اصولوں کے میٹرکس کے تحت حساب کردہ۔",
              })}
            </p>
          </div>

          <div className="size-16 rounded-full border-4 border-cyan-400 flex items-center justify-center font-black text-lg text-cyan-400 shadow-lg shadow-cyan-500/20 shrink-0" dir="ltr">
            {Math.round(selectedTrader.overallScore)}
          </div>
        </div>

        {/* Score Pillar Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {selectText({
              en: "Score Pillar Breakdown",
              bn: "স্কোর বিশ্লেষণ কাঠামো",
              ur: "اسکور کی درجہ بندی کا جائزہ",
            })}
          </h4>

          <div className="space-y-2.5">
            {/* Rule Adherence */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">
                  {selectText({
                    en: "Rule & Risk Adherence",
                    bn: "রিস্ক ও ট্রেডিং রুলস মান্যতা",
                    ur: "قواعد اور رسک کی پابندی",
                  })}
                </span>
                <span className="text-sky-500 font-extrabold" dir="ltr">{selectedTrader.ruleComplianceRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${selectedTrader.ruleComplianceRate}%` }}
                />
              </div>
            </div>

            {/* Daily Discipline */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">
                  {selectText({
                    en: "Daily Discipline Routine",
                    bn: "দৈনিক ডিসিপ্লিন রুটিন",
                    ur: "روزانہ کا ڈسپلن",
                  })}
                </span>
                <span className="text-emerald-500 font-extrabold" dir="ltr">{selectedTrader.disciplineScore}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${selectedTrader.disciplineScore}%` }}
                />
              </div>
            </div>

            {/* Win Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">
                  {selectText({
                    en: "Win Rate Quality",
                    bn: "উইন রেট কোয়ালিটি",
                    ur: "Win Rate کوالٹی",
                  })}
                </span>
                <span className="text-cyan-500 font-extrabold" dir="ltr">{selectedTrader.winRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${selectedTrader.winRate}%` }}
                />
              </div>
            </div>

            {/* Consistency */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">
                  {selectText({
                    en: "Habit Consistency & Streaks",
                    bn: "ধারাবাহিকতা ও স্ট্রিক",
                    ur: "تسلسل اور اسٹریکس",
                  })}
                </span>
                <span className="text-purple-500 font-extrabold" dir="ltr">{selectedTrader.consistencyScore}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${selectedTrader.consistencyScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Statistics Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {selectText({
              en: "Trade Execution Metrics",
              bn: "এক্সিকিউশন ও ট্রেড পরিসংখ্যান",
              ur: "ٹریڈ میٹرکس",
            })}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="text-[10px] font-bold text-slate-400">
                {selectText({
                  en: "Total Trades",
                  bn: "মোট ট্রেড",
                  ur: "کل ٹریڈز",
                })}
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white" dir="ltr">
                {selectedTrader.totalTrades}
              </div>
              <div className="text-[10px] text-slate-400" dir="ltr">
                {selectedTrader.winningTrades}W / {selectedTrader.losingTrades}L
              </div>
            </div>

            {selectedTrader.totalPnl > 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {selectText({
                    en: "Recorded Profit",
                    bn: "রেকর্ডকৃত প্রফিট",
                    ur: "ریکارڈ شدہ منافع",
                  })}
                </div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono" dir="ltr">
                  +${selectedTrader.totalPnl.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Real PnL</div>
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="text-[10px] font-bold text-slate-400">
                {selectText({
                  en: "Active Discipline",
                  bn: "অ্যাক্টিভ ডিসিপ্লিন",
                  ur: "فعال ڈسپلن",
                })}
              </div>
              <div className="text-base font-extrabold text-amber-500" dir="ltr">
                {selectedTrader.currentStreak}{" "}
                {selectText({
                  en: "Days",
                  bn: "দিন",
                  ur: "دن",
                })}
              </div>
              <div className="text-[10px] text-slate-400">
                {selectText({
                  en: "Current Streak",
                  bn: "বর্তমান স্ট্রিক",
                  ur: "موجودہ اسٹریک",
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="text-[10px] font-bold text-slate-400">
                {selectText({
                  en: "Primary Pair",
                  bn: "প্রধান পেয়ার",
                  ur: "بنیادی پیئر",
                })}
              </div>
              <div className="text-base font-extrabold text-cyan-400" dir="ltr">
                {selectedTrader.bestPair}
              </div>
              <div className="text-[10px] text-slate-400">
                {selectText({
                  en: "Most Traded",
                  bn: "সর্বাধিক ট্রেডকৃত",
                  ur: "سب سے زیادہ ٹریڈ شدہ",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Guarantee Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/50 flex items-start gap-3">
          <Lock size={16} className="text-sky-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-200 font-bold">
              {selectText({
                en: "Privacy & Confidentiality Guarantee:",
                bn: "প্রাইভেসি নিশ্চয়তা:",
                ur: "رازداری کی ضمانت:",
              })}
            </strong>{" "}
            {selectText({
              en: "Private trade notes, strategy setups, account credentials, and personal journaling entries are strictly confidential and never exposed. Only aggregated performance metrics are computed for the leaderboard.",
              bn: "ট্রেডারের ব্যক্তিগত নোটস, সাইকোলজি জার্নাল এন্ট্রি এবং অ্যাকাউন্ট ক্রেডেনশিয়ালস সম্পূর্ণ গোপন ও সুরক্ষিত থাকে। শুধুমাত্র সংগৃহীত পারফরম্যান্স মেট্রিক্স এখানে প্রদর্শিত হয়।",
              ur: "نجی ٹریڈ نوٹس، حکمت عملی کے سیٹ اپ، اکاؤنٹ کی تفصیلات، اور ذاتی جرنلنگ مکمل طور پر خفیہ اور محفوظ ہیں۔ لیڈر بورڈ کے لیے صرف مجموعی کارکردگی کا حساب لگایا جاتا ہے۔",
            })}
          </div>
        </div>

        {/* Modal Close CTA */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl px-5"
          >
            {selectText({
              en: "Close Breakdown",
              bn: "বন্ধ করুন",
              ur: "بند کریں",
            })}
          </Button>
        </div>
      </div>
    </div>
  );
}
