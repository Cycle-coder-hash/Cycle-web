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
import type { LeaderboardTrader } from "@shared/types/leaderboard";

export interface LeaderboardRankingsSectionProps {
  topThree: LeaderboardTrader[];
  restRankings: LeaderboardTrader[];
  isBn: boolean;
  onSelectTrader: (trader: LeaderboardTrader) => void;
}

export interface TraderPerformanceModalProps {
  selectedTrader: LeaderboardTrader | null;
  onClose: () => void;
  isBn: boolean;
}

export function LeaderboardRankingsSection({
  topThree,
  restRankings,
  isBn,
  onSelectTrader,
}: LeaderboardRankingsSectionProps) {
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
        label: isBn ? "#২ দ্বিতীয় স্থান 🥈" : "#2 SECOND PLACE 🥈",
        orderClass: "order-2 md:order-1",
      },
      {
        trader: first,
        position: 1,
        label: isBn ? "#১ প্রথম স্থান 🥇" : "#1 FIRST PLACE 🥇",
        orderClass: "order-1 md:order-2",
      },
      {
        trader: third,
        position: 3,
        label: isBn ? "#৩ তৃতীয় স্থান 🥉" : "#3 THIRD PLACE 🥉",
        orderClass: "order-3 md:order-3",
      },
    ].filter((item) => item.trader !== null);
  }, [topThree, isBn]);

  return (
    <>
      {/* ======================================================================= */}
      {/* TOP 3 PODIUM */}
      {/* ======================================================================= */}
      {topThree.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200">
              {isBn ? "শীর্ষ ৩ পোডিয়াম (টপ ৩ ট্রেডার)" : "Top 3 Podium (Global Ranks #1–#3)"}
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
                      <span>{label}</span>
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
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {trader.bestPair}
                      </div>
                    </div>

                    {/* Overall Composite Score (Whole Number / 100) */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-800/80 dark:bg-[#071124]/90 shadow-inner">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {isBn ? "সামগ্রিক স্কোর" : "Overall Score"}
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
                        {Math.round(trader.overallScore)} <span className="text-xs font-bold text-slate-400">/ 100</span>
                      </div>
                    </div>

                    {/* Key Performance Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-left pt-1">
                      {/* Rule Adherence */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isBn ? "রিস্ক মেনে চলা" : "Rule Adherence"}
                        </div>
                        <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
                          {trader.ruleComplianceRate}%
                        </div>
                      </div>

                      {/* Discipline Routine */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isBn ? "ডিসিপ্লিন রুটিন" : "Discipline"}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {trader.disciplineScore}%
                        </div>
                      </div>

                      {/* Consistency */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isBn ? "ধারাবাহিকতা" : "Consistency"}
                        </div>
                        <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                          {trader.consistencyScore}%
                        </div>
                        <div className="text-[10px] text-slate-400">{trader.currentStreak}d streak</div>
                      </div>

                      {/* Win Rate */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isBn ? "উইন রেট" : "Win Rate"}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {trader.winRate}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {trader.winningTrades}W / {trader.losingTrades}L
                        </div>
                      </div>

                      {/* Total Trades */}
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isBn ? "মোট ট্রেড" : "Total Trades"}
                        </div>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                          {trader.totalTrades}
                        </div>
                      </div>

                      {/* Profit (Rendered ONLY if positive) */}
                      {hasPositiveProfit ? (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {isBn ? "প্রফিট" : "Profit"}
                          </div>
                          <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
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
                      <span>{isBn ? "পারফরম্যান্স বিশদ" : "View Breakdown"}</span>
                      <ChevronRight size={14} />
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-sky-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-200">
                {isBn ? "র‌্যাঙ্কিং তালিকা (#৪–#৩০)" : "Global Rankings (#4–#30)"}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {restRankings.length} {isBn ? "জন ট্রেডার" : "traders"}
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#070e1b]/90 shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 pl-6 pr-3">Rank</th>
                  <th className="py-3.5 px-3">Trader</th>
                  <th className="py-3.5 px-3 text-center">{isBn ? "স্কোর" : "Overall Score"}</th>
                  <th className="py-3.5 px-3 text-center">{isBn ? "রিস্ক মেনে চলা" : "Rule Adherence"}</th>
                  <th className="py-3.5 px-3 text-center">{isBn ? "ডিসিপ্লিন" : "Discipline Routine"}</th>
                  <th className="py-3.5 px-3 text-center">{isBn ? "ধারাবাহিকতা" : "Consistency"}</th>
                  <th className="py-3.5 px-3 text-center">{isBn ? "মোট ট্রেড" : "Total Trades"}</th>
                  <th className="py-3.5 px-3 text-center">{isBn ? "উইন রেট" : "Win Rate"}</th>
                  <th className="py-3.5 px-3 text-right">{isBn ? "প্রফিট" : "Profit"}</th>
                  <th className="py-3.5 pr-6 pl-3 text-right">{isBn ? "অ্যাকশন" : "Action"}</th>
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
                      <span className="inline-flex size-7 items-center justify-center rounded-lg bg-slate-100 font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
                          <div className="text-[10px] text-slate-400">
                            {t.bestPair}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Overall Composite Score */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-black text-cyan-500">
                        {Math.round(t.overallScore)} / 100
                      </span>
                    </td>

                    {/* Rule Compliance */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-extrabold text-sky-600 dark:text-sky-400">
                        {t.ruleComplianceRate}%
                      </span>
                    </td>

                    {/* Discipline Routine */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        {t.disciplineScore}%
                      </span>
                    </td>

                    {/* Consistency & Streak */}
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-500">
                        <Flame size={12} />
                        <span>{t.currentStreak}d</span>
                      </span>
                    </td>

                    {/* Total Trades */}
                    <td className="py-4 px-3 text-center text-slate-600 dark:text-slate-300">
                      <span className="font-bold">{t.totalTrades}</span>{" "}
                      <span className="text-[10px] text-slate-400">
                        ({t.winningTrades}W / {t.losingTrades}L)
                      </span>
                    </td>

                    {/* Win Rate */}
                    <td className="py-4 px-3 text-center">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {t.winRate}%
                      </span>
                    </td>

                    {/* Profit (ONLY positive displayed) */}
                    <td className="py-4 px-3 text-right">
                      {t.totalPnl > 0 ? (
                        <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
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
                        {isBn ? "দেখুন" : "Details"}
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
                    <span className="inline-flex size-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
                      <div className="text-[10px] text-slate-400">{t.bestPair}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-black text-cyan-500">
                      {Math.round(t.overallScore)} / 100
                    </span>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rule Adherence:</span>
                    <span className="font-bold text-sky-500">{t.ruleComplianceRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Discipline:</span>
                    <span className="font-bold text-emerald-500">{t.disciplineScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="font-bold text-emerald-500">{t.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trades:</span>
                    <span className="font-bold">{t.totalTrades}</span>
                  </div>
                  {t.totalPnl > 0 ? (
                    <div className="col-span-2 flex justify-between font-mono pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-400">Profit:</span>
                      <span className="font-extrabold text-emerald-500">+${t.totalPnl.toFixed(2)}</span>
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
  isBn,
}: TraderPerformanceModalProps) {
  if (!selectedTrader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-[#070e1b] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
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
              <span className="rounded-lg bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-black text-amber-500">
                Rank #{selectedTrader.rank}
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase">
                All-Time
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <span>{selectedTrader.name}</span>
              <CheckCircle2 size={18} className="text-sky-400 shrink-0" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedTrader.bestPair} · Verified Real Trader
            </p>
          </div>
        </div>

        {/* Overall Composite Score Showcase */}
        <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-emerald-500/10 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {isBn ? "সামগ্রিক লিডারবোর্ড স্কোর" : "Composite Leaderboard Score"}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-0.5">
              {Math.round(selectedTrader.overallScore)}{" "}
              <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? "রিস্ক ম্যানেজমেন্ট, উইন রেট ও ডিসিপ্লিনের সমাহারে নির্ধারিত।"
                : "Computed via multi-dimensional adherence matrix."}
            </p>
          </div>

          <div className="size-16 rounded-full border-4 border-cyan-400 flex items-center justify-center font-black text-lg text-cyan-400 shadow-lg shadow-cyan-500/20 shrink-0">
            {Math.round(selectedTrader.overallScore)}
          </div>
        </div>

        {/* Score Pillar Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {isBn ? "স্কোর বিশ্লেষণ কাঠামো" : "Score Pillar Breakdown"}
          </h4>

          <div className="space-y-2.5">
            {/* Rule Adherence */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">
                  {isBn ? "রিস্ক ও ট্রেডিং রুলস মান্যতা" : "Rule & Risk Adherence"}
                </span>
                <span className="text-sky-500 font-extrabold">{selectedTrader.ruleComplianceRate}%</span>
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
                  {isBn ? "দৈনিক ডিসিপ্লিন রুটিন" : "Daily Discipline Routine"}
                </span>
                <span className="text-emerald-500 font-extrabold">{selectedTrader.disciplineScore}%</span>
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
                  {isBn ? "উইন রেট কোয়ালিটি" : "Win Rate Quality"}
                </span>
                <span className="text-cyan-500 font-extrabold">{selectedTrader.winRate}%</span>
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
                  {isBn ? "ধারাবাহিকতা ও স্ট্রিক" : "Habit Consistency & Streaks"}
                </span>
                <span className="text-purple-500 font-extrabold">{selectedTrader.consistencyScore}%</span>
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
            {isBn ? "এক্সিকিউশন ও ট্রেড পরিসংখ্যান" : "Trade Execution Metrics"}
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="text-[10px] font-bold text-slate-400">Total Trades</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedTrader.totalTrades}
              </div>
              <div className="text-[10px] text-slate-400">
                {selectedTrader.winningTrades}W / {selectedTrader.losingTrades}L
              </div>
            </div>

            {selectedTrader.totalPnl > 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Recorded Profit</div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  +${selectedTrader.totalPnl.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Real PnL</div>
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="text-[10px] font-bold text-slate-400">Active Discipline</div>
              <div className="text-base font-extrabold text-amber-500">
                {selectedTrader.currentStreak} Days
              </div>
              <div className="text-[10px] text-slate-400">Current Streak</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="text-[10px] font-bold text-slate-400">Primary Pair</div>
              <div className="text-base font-extrabold text-cyan-400">
                {selectedTrader.bestPair}
              </div>
              <div className="text-[10px] text-slate-400">Most Traded</div>
            </div>
          </div>
        </div>

        {/* Privacy Guarantee Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/50 flex items-start gap-3">
          <Lock size={16} className="text-sky-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-200 font-bold">
              {isBn ? "প্রাইভেসি নিশ্চয়তা:" : "Privacy & Confidentiality Guarantee:"}
            </strong>{" "}
            {isBn
              ? "ট্রেডারের ব্যক্তিগত নোটস, সাইকোলজি জার্নাল এন্ট্রি এবং অ্যাকাউন্ট ক্রেডেনশিয়ালস সম্পূর্ণ গোপন ও সুরক্ষিত থাকে। শুধুমাত্র সংগৃহীত পারফরম্যান্স মেট্রিক্স এখানে প্রদর্শিত হয়।"
              : "Private trade notes, strategy setups, account credentials, and personal journaling entries are strictly confidential and never exposed. Only aggregated performance metrics are computed for the leaderboard."}
          </div>
        </div>

        {/* Modal Close CTA */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl px-5"
          >
            {isBn ? "বন্ধ করুন" : "Close Breakdown"}
          </Button>
        </div>
      </div>
    </div>
  );
}
