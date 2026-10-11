import React from "react";
import {
  Download,
  Edit,
  Eye,
  Image as ImageIcon,
  Printer,
  Trash2,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalBook, TradeEntry } from "@/types/journal";
import { parseVideoUrl } from "@/lib/mediaUpload";

export interface JournalTradeDetailsAndConfirmModalsProps {
  isBn: boolean;
  viewingTrade: TradeEntry | null;
  currentBook: JournalBook | null;
  deleteTradeConfirmId: string | null;
  deleteBookConfirmId: string | null;
  lightboxImage: string | null;
  onCloseViewingTrade: () => void;
  onPrintViewingTrade: (trade: TradeEntry, book: JournalBook | null) => void;
  onExportViewingTradePdf: (trade: TradeEntry, book: JournalBook | null) => void;
  onEditViewingTrade: (trade: TradeEntry) => void;
  onRequestDeleteTrade: (tradeId: string) => void;
  onCancelDeleteTrade: () => void;
  onConfirmDeleteTrade: (tradeId: string) => void;
  onCancelDeleteBook: () => void;
  onConfirmDeleteBook: (bookId: string) => void;
  onOpenLightboxImage: (src: string) => void;
  onCloseLightboxImage: () => void;
}

export function JournalTradeDetailsAndConfirmModals({
  isBn,
  viewingTrade,
  currentBook,
  deleteTradeConfirmId,
  deleteBookConfirmId,
  lightboxImage,
  onCloseViewingTrade,
  onPrintViewingTrade,
  onExportViewingTradePdf,
  onEditViewingTrade,
  onRequestDeleteTrade,
  onCancelDeleteTrade,
  onConfirmDeleteTrade,
  onCancelDeleteBook,
  onConfirmDeleteBook,
  onOpenLightboxImage,
  onCloseLightboxImage,
}: JournalTradeDetailsAndConfirmModalsProps) {
  return (
    <>
      {/* DETAILED TRADE AUDIT VIEW MODAL (ALL 21 FIELDS) */}
      {viewingTrade && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={onCloseViewingTrade}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-auto text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 font-mono text-base font-black text-cyan-500">
                  #{viewingTrade.tradeNumber}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight">
                      {viewingTrade.pair} • {viewingTrade.direction}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-black uppercase ${
                        viewingTrade.pnl > 0.001
                          ? "bg-emerald-500/10 text-emerald-500"
                          : viewingTrade.pnl < -0.001
                          ? "bg-rose-500/10 text-rose-500"
                          : "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {viewingTrade.pnl > 0.001
                        ? `+$${viewingTrade.pnl.toFixed(2)}`
                        : viewingTrade.pnl < -0.001
                        ? `-$${Math.abs(viewingTrade.pnl).toFixed(2)}`
                        : "$0.00"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {viewingTrade.date} at {viewingTrade.entryTime} • Timeframe: {viewingTrade.timeframe}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* 1. Dedicated Print Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPrintViewingTrade(viewingTrade, currentBook)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
                  title={isBn ? "ট্রেড অডিট প্রিন্ট করুন" : "Print trade audit report"}
                >
                  <Printer className="h-3.5 w-3.5 text-cyan-500" />
                  Print
                </Button>

                {/* 2. Dedicated PDF Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExportViewingTradePdf(viewingTrade, currentBook)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
                  title={isBn ? "পিডিএফ ডাউনলোড করুন" : "Download trade audit PDF"}
                >
                  <Download className="h-3.5 w-3.5 text-cyan-500" />
                  PDF
                </Button>

                <button
                  onClick={onCloseViewingTrade}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 21 Fields Structured View */}
            <div className="mt-6 space-y-5 text-xs">
              {/* Numeric Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entry Price</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.entryPrice != null ? viewingTrade.entryPrice : "—"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stop Loss</div>
                  <div className="mt-1 font-mono text-sm font-black text-rose-500">{viewingTrade.stopLoss != null ? viewingTrade.stopLoss : "—"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Take Profit</div>
                  <div className="mt-1 font-mono text-sm font-black text-emerald-500">{viewingTrade.takeProfit != null ? viewingTrade.takeProfit : "—"}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exit Price</div>
                  <div className="mt-1 font-mono text-sm font-black text-cyan-500">{viewingTrade.exitPrice != null ? viewingTrade.exitPrice : "—"}</div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pips</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.pips} pips</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk : Reward</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.riskReward}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lot Size</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.lotSize}</div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trade Run</div>
                  <div className="mt-1 font-mono text-sm font-black">{viewingTrade.tradeRun || "—"}</div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 dark:border-slate-800">
                  <span className="text-slate-400 font-bold">Followed All Rules:</span>
                  <span
                    className={`font-black ${
                      viewingTrade.followedRules === "Yes" ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {viewingTrade.followedRules}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 dark:border-slate-800">
                  <span className="text-slate-400 font-bold">Trade Rank:</span>
                  <span className="font-black text-amber-400">{viewingTrade.tradeRank}</span>
                </div>
              </div>

              {/* Note */}
              {viewingTrade.note && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Trade Setup Note & Context
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                    {viewingTrade.note}
                  </p>
                </div>
              )}

              {/* Learning / Reflection */}
              {viewingTrade.learning && (
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 mb-1.5">
                    Update / Key Learning & Psychology
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                    {viewingTrade.learning}
                  </p>
                </div>
              )}

              {/* Custom Properties */}
              {viewingTrade.customProperties?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Custom Properties & Attributes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {viewingTrade.customProperties.map((cp) => (
                      <div
                        key={cp.id}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-900"
                      >
                        <span className="font-bold text-slate-400">{cp.name}:</span>
                        <span className="font-black text-slate-800 dark:text-slate-200">{cp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Screenshots & Video Previews */}
              {(() => {
                const viewScreenshots = viewingTrade.screenshots && viewingTrade.screenshots.length > 0
                  ? viewingTrade.screenshots
                  : (viewingTrade.mediaUrl && viewingTrade.mediaType !== "video" ? [viewingTrade.mediaUrl] : []);
                const viewVideo = viewingTrade.videoUrl || (viewingTrade.mediaType === "video" ? viewingTrade.mediaUrl : undefined);

                if (viewScreenshots.length === 0 && !viewVideo) return null;

                return (
                  <div className="space-y-4">
                    {/* Attached Screenshots Gallery */}
                    {viewScreenshots.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ImageIcon size={15} className="text-cyan-500" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                              Attached Screenshots ({viewScreenshots.length})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Click any image to enlarge</span>
                        </div>

                        <div className={`grid gap-3 ${
                          viewScreenshots.length === 1
                            ? "grid-cols-1"
                            : viewScreenshots.length === 2
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-2 sm:grid-cols-3"
                        }`}>
                          {viewScreenshots.map((src, idx) => (
                            <div
                              key={idx}
                              onClick={() => onOpenLightboxImage(src)}
                              className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm cursor-pointer hover:border-cyan-500 transition-colors"
                            >
                              <img
                                src={src}
                                alt={`Trade Screenshot ${idx + 1}`}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              <div className="absolute top-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-black text-cyan-400 backdrop-blur-xs border border-white/10">
                                #{idx + 1}
                              </div>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs border border-white/20">
                                  <Eye size={13} /> View Full
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Execution Video Player */}
                    {viewVideo && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <VideoIcon size={14} className="text-purple-400" />
                            <span>Execution Video Clip</span>
                          </span>
                          {viewingTrade.videoDurationSeconds && (
                            <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                              Duration: {viewingTrade.videoDurationSeconds}s (Max 60s limit verified)
                            </span>
                          )}
                        </div>
                        {(() => {
                          const parsed = parseVideoUrl(viewVideo);
                          if (parsed.isIframe && parsed.embedUrl) {
                            return (
                              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md">
                                <iframe
                                  src={parsed.embedUrl}
                                  title="Execution Video Clip"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  className="w-full h-full border-0"
                                />
                              </div>
                            );
                          }
                          return (
                            <video
                              src={viewVideo}
                              controls
                              className="w-full max-h-80 rounded-xl bg-black shadow-md object-contain"
                            />
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => onRequestDeleteTrade(viewingTrade.id)}
                className="rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-bold gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Trade
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => onEditViewingTrade(viewingTrade)}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Trade
                </Button>
                <Button
                  onClick={onCloseViewingTrade}
                  className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE TRADE CONFIRMATION MODAL */}
      {deleteTradeConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white">
            <h3 className="font-black text-base">
              {isBn ? "ট্রেড এন্ট্রি মুছে ফেলতে চান?" : "Delete Trade Entry?"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn
                ? "এই ট্রেড মুছে ফেললে বর্তমান ব্যালেন্স, উইনরেট এবং পারফরম্যান্স গ্রাফ পুনরায় হিসেব হবে।"
                : "Deleting this trade entry will permanently remove it and automatically recalculate current balance, win rate, and equity curves."}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelDeleteTrade}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onConfirmDeleteTrade(deleteTradeConfirmId)}
                className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-bold"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE BOOK CONFIRMATION MODAL */}
      {deleteBookConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white">
            <h3 className="font-black text-base">
              {isBn ? "জার্নাল বুক মুছে ফেলতে চান?" : "Delete Journal Book?"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn
                ? "এই জার্নাল বুকের সমস্ত ট্রেড হিস্ট্রি এবং রুলস স্থায়ীভাবে মুছে ফেলা হবে।"
                : "This will permanently delete this strategy book and all associated trade logs. This action cannot be undone."}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelDeleteBook}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onConfirmDeleteBook(deleteBookConfirmId)}
                className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-bold"
              >
                Delete Book
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Resolution Screenshot */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={onCloseLightboxImage}
        >
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onCloseLightboxImage}
              className="absolute -top-11 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Close Preview"
            >
              <X size={22} />
            </button>
            <img
              src={lightboxImage}
              alt="Screenshot High Resolution"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  );
}
