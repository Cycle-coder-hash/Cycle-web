import React from "react";
import { X, Printer, Download, CheckCircle2, AlertCircle, ShieldCheck, ArrowUpRight, ArrowDownRight, Calendar, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeEntry, JournalBook } from "@/types/journal";
import { BrandLogo } from "@/components/BrandLogo";

interface TradePrintModalProps {
  trade: TradeEntry | null;
  book?: JournalBook | null;
  onClose: () => void;
  isBn?: boolean;
}

export function TradePrintModal({ trade, book, onClose, isBn = false }: TradePrintModalProps) {
  if (!trade) return null;

  const handlePrint = () => {
    window.print();
  };

  const isWin = trade.pnl > 0.001;
  const isLoss = trade.pnl < -0.001;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-auto text-slate-900 dark:text-white print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Action Header - hidden in print */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-600 dark:text-sky-400">
              TRADE AUDIT REPORT
            </span>
            <span className="text-xs font-bold text-slate-500">
              {book ? book.name : "Journal Entry"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold"
            >
              <Printer size={15} /> {isBn ? "প্রিন্ট / PDF সংরক্ষণ" : "Print / Save PDF"}
            </Button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="mt-6 space-y-6 print:mt-0" id="printable-trade-report">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 print:border-slate-300">
            <div className="flex items-center gap-3">
              <BrandLogo size={42} />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <span>Trade #{trade.tradeNumber}</span>
                  <span
                    className={`text-sm px-2.5 py-0.5 rounded-full font-black uppercase ${
                      trade.direction === "Buy"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {trade.direction}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
                    Rank {trade.tradeRank}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Instrument: <strong className="text-slate-800 dark:text-slate-200">{trade.pair}</strong> • Timeframe: <strong className="text-slate-800 dark:text-slate-200">{trade.timeframe}</strong> • {trade.date} {trade.entryTime}
                </p>
              </div>
            </div>

            {/* P&L Badge */}
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Final Result
              </span>
              <div
                className={`text-2xl sm:text-3xl font-black ${
                  isWin
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isLoss
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {trade.pnl > 0 ? `+$${trade.pnl.toFixed(2)}` : trade.pnl < 0 ? `-$${Math.abs(trade.pnl).toFixed(2)}` : "$0.00"}
              </div>
              <span className="text-xs font-bold text-slate-500">
                {trade.pips >= 0 ? `+${trade.pips} pips` : `${trade.pips} pips`} • RR {trade.riskReward}
              </span>
            </div>
          </div>

          {/* Key Trade Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 print:bg-slate-100 print:border-slate-300">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Entry Price</span>
              <p className="font-mono text-sm font-bold mt-0.5">{trade.entryPrice}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Stop Loss</span>
              <p className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">{trade.stopLoss}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Take Profit</span>
              <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{trade.takeProfit}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Exit Price</span>
              <p className="font-mono text-sm font-bold mt-0.5">{trade.exitPrice}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Lot Size</span>
              <p className="font-mono text-sm font-bold mt-0.5">{trade.lotSize}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Trade Run (Max)</span>
              <p className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">{trade.tradeRun || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Risk : Reward</span>
              <p className="font-mono text-sm font-bold mt-0.5">{trade.riskReward || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Followed All Rules?</span>
              <p className="flex items-center gap-1 text-sm font-bold mt-0.5">
                {trade.followedRules === "Yes" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Yes (Disciplined)
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle size={13} /> No (Rule Violation)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Trade Setup Notes */}
          {trade.note && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Setup Context & Thesis
              </h3>
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {trade.note}
              </div>
            </div>
          )}

          {/* Update / Learnings */}
          {trade.learning && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Post-Trade Review & Lessons Learned
              </h3>
              <div className="p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-amber-100">
                {trade.learning}
              </div>
            </div>
          )}

          {/* Custom Properties */}
          {trade.customProperties && trade.customProperties.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Custom Trade Properties
              </h3>
              <div className="flex flex-wrap gap-2">
                {trade.customProperties.map((cp) => (
                  <div
                    key={cp.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                  >
                    <span className="font-bold text-slate-500 dark:text-slate-400">{cp.name}:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{cp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Media */}
          {trade.mediaUrl && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Execution Evidence / Chart Snapshot
              </h3>
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950">
                {trade.mediaType === "video" ? (
                  <video
                    src={trade.mediaUrl}
                    controls
                    className="max-h-80 w-full object-contain"
                  />
                ) : (
                  <img
                    src={trade.mediaUrl}
                    alt="Trade Chart Snapshot"
                    className="max-h-80 w-full object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {/* Institutional Stamp & Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-[10px] text-slate-400 dark:border-slate-800">
            <span>Cycle of Chart • Institutional Trader Journal</span>
            <span>Recorded: {new Date(trade.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
