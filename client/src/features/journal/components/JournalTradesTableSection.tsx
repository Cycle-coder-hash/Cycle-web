import React from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Edit,
  Eye,
  Image as ImageIcon,
  Plus,
  Printer,
  Search,
  Trash2,
  Video as VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeEntry } from "@/types/journal";

export interface JournalTradesTableSectionProps {
  isBn: boolean;
  filteredTrades: TradeEntry[];
  searchTerm: string;
  resultFilter: "all" | "win" | "loss" | "be";
  rankFilter: "all" | "A+" | "A" | "A-";
  ruleFilter: "all" | "followed" | "broken";
  onSearchTermChange: (value: string) => void;
  onResultFilterChange: (value: "all" | "win" | "loss" | "be") => void;
  onRankFilterChange: (value: "all" | "A+" | "A" | "A-") => void;
  onRuleFilterChange: (value: "all" | "followed" | "broken") => void;
  onOpenNewTrade: () => void;
  onViewTrade: (trade: TradeEntry) => void;
  onPrintTrade: (trade: TradeEntry) => void;
  onEditTrade: (trade: TradeEntry) => void;
  onRequestDeleteTrade: (tradeId: string) => void;
}

export function JournalTradesTableSection({
  isBn,
  filteredTrades,
  searchTerm,
  resultFilter,
  rankFilter,
  ruleFilter,
  onSearchTermChange,
  onResultFilterChange,
  onRankFilterChange,
  onRuleFilterChange,
  onOpenNewTrade,
  onViewTrade,
  onPrintTrade,
  onEditTrade,
  onRequestDeleteTrade,
}: JournalTradesTableSectionProps) {
  return (
    /* TRADE HISTORY AUDIT TABLE & FILTERS */
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:gap-4 border-b border-slate-100 pb-3.5 sm:pb-5 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {isBn ? "ট্রেড হিস্ট্রি ও বিশদ অডিট টেবিল" : "Trade Execution History & Audit Log"}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {isBn
                ? `মোট ${filteredTrades.length} টি ট্রেড পাওয়া গেছে (সম্পূর্ণ ২১টি ফিল্ড সংরক্ষিত)`
                : `Showing ${filteredTrades.length} verified trade records with full 21-point parameter tracking`}
            </p>
          </div>

          <Button
            onClick={onOpenNewTrade}
            size="sm"
            className="rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white text-xs gap-1.5 self-start sm:self-center h-8 sm:h-9 px-3 sm:px-4"
          >
            <Plus className="h-3.5 w-3.5" />
            {isBn ? "ট্রেড লগ করুন" : "Log Trade"}
          </Button>
        </div>

        {/* Search and Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5 pt-1 sm:pt-2">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={isBn ? "পেয়ার, নোট বা লার্নিং লিখে সার্চ করুন..." : "Search pair, notes, tags, direction..."}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50/80 pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs font-medium outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={resultFilter}
              onChange={(e) => onResultFilterChange(e.target.value as "all" | "win" | "loss" | "be")}
              className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">All Outcomes</option>
              <option value="win">Wins Only (লাভ)</option>
              <option value="loss">Losses Only (লস)</option>
              <option value="be">Breakeven Only</option>
            </select>
          </div>

          {/* Rank Filter */}
          <div>
            <select
              value={rankFilter}
              onChange={(e) => onRankFilterChange(e.target.value as "all" | "A+" | "A" | "A-")}
              className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">All Ranks (A+, A, A-)</option>
              <option value="A+">A+ Setups Only</option>
              <option value="A">A Setups Only</option>
              <option value="A-">A- Setups Only</option>
            </select>
          </div>

          {/* Rule Filter */}
          <div>
            <select
              value={ruleFilter}
              onChange={(e) => onRuleFilterChange(e.target.value as "all" | "followed" | "broken")}
              className="w-full rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">All Discipline States</option>
              <option value="followed">Rules Followed (100%)</option>
              <option value="broken">Rules Broken (Discipline Leak)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        {filteredTrades.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <BookOpen className="mx-auto h-10 w-10 opacity-30 mb-2" />
            <p className="text-sm font-bold text-slate-500">
              {isBn ? "কোনো ট্রেড পাওয়া যায়নি।" : "No trades found matching active filters."}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isBn ? "ফিল্টার পরিবর্তন করুন অথবা একটি নতুন ট্রেড লগ করুন।" : "Adjust your search parameters or log a new trade above."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800 font-bold uppercase tracking-wider">
                <th className="pb-3 pr-2">#</th>
                <th className="pb-3 px-2">Date & Time</th>
                <th className="pb-3 px-2">Pair / TF</th>
                <th className="pb-3 px-2">Direction</th>
                <th className="pb-3 px-2">Entry → Exit</th>
                <th className="pb-3 px-2">Lots</th>
                <th className="pb-3 px-2">Pips</th>
                <th className="pb-3 px-2">R:R / Run</th>
                <th className="pb-3 px-2">Rules?</th>
                <th className="pb-3 px-2">Rank</th>
                <th className="pb-3 px-2">Media</th>
                <th className="pb-3 px-2 text-right">P&L ($)</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredTrades.map((t) => {
                const isWin = t.pnl > 0.001;
                const isLoss = t.pnl < -0.001;
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => onViewTrade(t)}
                  >
                    {/* 1. Trade # */}
                    <td className="py-3.5 pr-2 font-mono font-black text-cyan-500">
                      #{t.tradeNumber}
                    </td>

                    {/* 2 & 4. Date & Time */}
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-900 dark:text-white">{t.date}</div>
                      <div className="text-[10px] font-mono text-slate-400">{t.entryTime}</div>
                    </td>

                    {/* 3 & 5. Pair & Timeframe */}
                    <td className="py-3.5 px-2">
                      <div className="font-extrabold text-slate-900 dark:text-white">{t.pair}</div>
                      <div className="inline-block rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {t.timeframe}
                      </div>
                    </td>

                    {/* 6. Buy / Sell */}
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                          t.direction === "Buy"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {t.direction === "Buy" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {t.direction}
                      </span>
                    </td>

                    {/* 7 & 10. Entry & Exit */}
                    <td className="py-3.5 px-2 font-mono text-[11px]">
                      <div>{t.entryPrice != null ? t.entryPrice : "—"}</div>
                      <div className="text-slate-400">→ {t.exitPrice != null ? t.exitPrice : "—"}</div>
                    </td>

                    {/* 15. Lot Size */}
                    <td className="py-3.5 px-2 font-mono">{t.lotSize}</td>

                    {/* 14. Pips */}
                    <td className="py-3.5 px-2 font-mono font-bold">
                      <span className={t.pips >= 0 ? "text-emerald-500" : "text-rose-500"}>
                        {t.pips >= 0 ? `+${t.pips}` : t.pips}
                      </span>
                    </td>

                    {/* 13 & 16. R:R & Run */}
                    <td className="py-3.5 px-2">
                      <div className="font-mono font-bold">{t.riskReward || "1:2"}</div>
                      {t.tradeRun && (
                        <div className="text-[10px] text-slate-400">{t.tradeRun}</div>
                      )}
                    </td>

                    {/* 11. Followed Rules */}
                    <td className="py-3.5 px-2">
                      {t.followedRules === "Yes" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                          <CheckCircle2 className="h-3 w-3" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                          <AlertCircle className="h-3 w-3" /> No
                        </span>
                      )}
                    </td>

                    {/* 18. Rank */}
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black ${
                          t.tradeRank === "A+"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : t.tradeRank === "A"
                            ? "bg-cyan-500/10 text-cyan-500"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {t.tradeRank}
                      </span>
                    </td>

                    {/* 19. Media indicator */}
                    <td className="py-3.5 px-2">
                      {(() => {
                        const tScreenshots = t.screenshots && t.screenshots.length > 0
                          ? t.screenshots
                          : (t.mediaUrl && t.mediaType !== "video" ? [t.mediaUrl] : []);
                        const tVideo = t.videoUrl || (t.mediaType === "video" ? t.mediaUrl : undefined);

                        if (tScreenshots.length === 0 && !tVideo) {
                          return <span className="text-slate-300 dark:text-slate-700">—</span>;
                        }

                        return (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {tScreenshots.length > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-black text-cyan-500 border border-cyan-500/20">
                                <ImageIcon className="h-3 w-3" />
                                {tScreenshots.length} {tScreenshots.length === 1 ? "Image" : "Images"}
                              </span>
                            )}
                            {tVideo && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-black text-purple-400 border border-purple-500/20">
                                <VideoIcon className="h-3 w-3" />
                                {t.videoDurationSeconds ? `${t.videoDurationSeconds}s` : "Video"}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* 12. P&L ($) */}
                    <td className="py-3.5 px-2 text-right font-mono font-black text-sm">
                      <span
                        className={
                          isWin
                            ? "text-emerald-500"
                            : isLoss
                            ? "text-rose-500"
                            : "text-slate-400"
                        }
                      >
                        {isWin ? `+$${t.pnl.toFixed(2)}` : isLoss ? `-$${Math.abs(t.pnl).toFixed(2)}` : `$0.00`}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 pl-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* View details */}
                        <button
                          onClick={() => onViewTrade(t)}
                          title="View trade audit"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Print / PDF */}
                        <button
                          onClick={() => onPrintTrade(t)}
                          title="Print / Save PDF"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onEditTrade(t)}
                          title="Edit trade"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-500 dark:hover:bg-slate-800 dark:hover:text-cyan-400 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onRequestDeleteTrade(t.id)}
                          title="Delete trade"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
