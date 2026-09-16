import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  X,
  BookOpen,
  ArrowDown,
  Layers,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { jsPDF } from "jspdf";

interface FreeEbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBn?: boolean;
}

export function FreeEbookModal({ isOpen, onClose, isBn = false }: FreeEbookModalProps) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Fetch admin-managed Free eBooks via protected customer procedure
  const { data: ebooks, isLoading, error } = trpc.customer.freeEbooks.useQuery(undefined, {
    enabled: isOpen,
    staleTime: 1000 * 30, // 30s cache
  });

  const recordDownloadMutation = trpc.customer.downloadEbook.useMutation();

  if (!isOpen) return null;

  // Individual PDF generation and download handler
  const handleDownloadIndividualPdf = async (ebook: any) => {
    setDownloadingId(ebook.id);
    setDownloadSuccessMsg(null);

    try {
      // 1. Log download action to backend
      try {
        await recordDownloadMutation.mutateAsync({ id: ebook.id });
      } catch (err) {
        console.warn("[Download record warning]:", err);
      }

      // 2. If uploaded file exists, download it
      if (ebook.fileUrl) {
        const link = document.createElement("a");
        link.href = ebook.fileUrl;
        link.download = ebook.fileName || `${ebook.titleEn.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // 3. Generate high-resolution Institutional PDF using jsPDF
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;

        // Header Background
        doc.setFillColor(8, 24, 51); // #081833 deep navy
        doc.rect(0, 0, pageWidth, 90, "F");

        // Top Brand Title
        doc.setTextColor(56, 189, 248); // sky-400
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("CYCLE OF CHART — INSTITUTIONAL PLAYBOOK", margin, 38);

        // Subtitle & Category
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`CATEGORY: ${ebook.category.toUpperCase()} | VERIFIED REFERENCE MATERIAL`, margin, 58);
        doc.text(`PAGES: ${ebook.pages} Pages | Authorized Student Access`, margin, 74);

        // Document Title
        let y = 130;
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        const titleLines = doc.splitTextToSize(ebook.titleEn, contentWidth);
        doc.text(titleLines, margin, y);
        y += titleLines.length * 20 + 8;

        // Document Subtitle
        doc.setTextColor(71, 85, 105); // slate-600
        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        const subtitleLines = doc.splitTextToSize(ebook.subtitleEn, contentWidth);
        doc.text(subtitleLines, margin, y);
        y += subtitleLines.length * 16 + 20;

        // Divider Line
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 25;

        // Section: Key Algorithmic Concepts
        doc.setTextColor(2, 132, 199); // sky-600
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("CORE INSTITUTIONAL CONCEPTS & RULES", margin, y);
        y += 20;

        const concepts = Array.isArray(ebook.keyConcepts) ? ebook.keyConcepts : [];
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);

        concepts.forEach((concept: string, idx: number) => {
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "bold");
          doc.text(`[Rule ${idx + 1}]`, margin, y);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          const conceptLines = doc.splitTextToSize(concept, contentWidth - 60);
          doc.text(conceptLines, margin + 55, y);
          y += conceptLines.length * 15 + 12;
        });

        y += 15;
        // Risk Guard Callout Box
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(56, 189, 248);
        doc.roundedRect(margin, y, contentWidth, 75, 6, 6, "FD");

        doc.setTextColor(2, 132, 199);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text("NON-NEGOTIABLE RISK GOVERNANCE", margin + 14, y + 20);

        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text("1. Strictly risk maximum 1% of account equity per execution.", margin + 14, y + 36);
        doc.text("2. Maintain minimum 1:3 Risk-to-Reward on every entry setup.", margin + 14, y + 50);
        doc.text("3. Never execute outside dedicated algorithmic Killzones (London/NY).", margin + 14, y + 64);

        // Footer
        doc.setFontSize(8.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `(C) 2026 Cycle of Chart. All rights reserved. Downloaded by authorized student.`,
          margin,
          pageHeight - 25
        );

        // Download File
        const cleanName = ebook.fileName || `${ebook.titleEn.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        doc.save(cleanName);
      }

      setDownloadSuccessMsg(
        isBn
          ? `"${ebook.titleBn || ebook.titleEn}" সফলভাবে ডাউনলোড হয়েছে!`
          : `Downloaded "${ebook.titleEn}" successfully!`
      );
    } catch (err: any) {
      console.error("PDF download error:", err);
      alert(isBn ? "PDF ডাউনলোড ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" : "Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#08111f] dark:shadow-black overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {isBn ? "ফ্রি ই-বুক ও চিট-শীট লাইব্রেরি" : "Free eBook & Cheatsheet Library"}
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  {isBn ? "আনলকড" : "UNLOCKED"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? "প্রতিটি প্রাতিষ্ঠানিক পিডিএফ আলাদা আলাদাভাবে আপনার ডিভাইসে ডাউনলোড করুন।"
                  : "Download each institutional PDF individually to your device."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Download Success Notice */}
        {downloadSuccessMsg && (
          <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-500/10 px-6 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}

        {/* Modal Body: Available Individual PDFs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 animate-spin text-cyan-500" />
              <span className="text-xs font-bold text-slate-400">
                {isBn ? "পিডিএফ রিসোর্স লোড হচ্ছে..." : "Loading institutional PDF resources..."}
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-red-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-sm font-bold">
                {isBn ? "রিসোর্স লোড করা সম্ভব হয়নি।" : "Could not load PDF library."}
              </p>
              <p className="text-xs text-slate-400 mt-1">{error.message}</p>
            </div>
          ) : !ebooks || ebooks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {isBn ? "কোনো ফ্রি ই-বুক বর্তমানে উপলব্ধ নেই।" : "No free eBooks currently available."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {ebooks.map((ebook: any) => {
                const isDownloading = downloadingId === ebook.id;
                return (
                  <div
                    key={ebook.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:border-cyan-500/60 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-cyan-500/50"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">
                          {ebook.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                          <FileText className="h-3.5 w-3.5 text-cyan-500" />
                          <span>{ebook.pages} Pages</span>
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <h4 className="mt-3 text-sm font-black tracking-tight text-slate-900 dark:text-white">
                        {isBn ? ebook.titleBn || ebook.titleEn : ebook.titleEn}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {isBn ? ebook.subtitleBn || ebook.subtitleEn : ebook.subtitleEn}
                      </p>

                      {/* Key Concepts Preview */}
                      {ebook.keyConcepts && ebook.keyConcepts.length > 0 && (
                        <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {isBn ? "প্রধান বিষয়সমূহ:" : "Key Principles:"}
                          </span>
                          <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                            {ebook.keyConcepts.slice(0, 2).map((c: string, idx: number) => (
                              <li key={idx} className="truncate">
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Actions: Individual Download & Preview */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(ebook)}
                        className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{isBn ? "প্রিভিউ" : "Preview"}</span>
                      </button>

                      {/* Individual Download Button */}
                      <button
                        type="button"
                        disabled={isDownloading}
                        onClick={() => handleDownloadIndividualPdf(ebook)}
                        className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>
                          {isDownloading
                            ? isBn
                              ? "ডাউনলোড হচ্ছে..."
                              : "Downloading..."
                            : isBn
                            ? "ডাউনলোড"
                            : "Download"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (No bulk download per user requirement) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/80 bg-slate-50/60 px-6 py-3.5 dark:border-slate-800/80 dark:bg-slate-950/40 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>
              {isBn
                ? "সকল পিডিএফ স্টুডেন্ট অ্যাকাউন্টের সাথে সম্পূর্ণ বিনামূল্যে অ্যাক্সেসযোগ্য।"
                : "Individual PDF downloads are completely free for all authenticated accounts."}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
          >
            {isBn ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>

      {/* Concept Detail Preview Sub-Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">
                  {previewItem.category} • {previewItem.pages} Pages
                </span>
                <h3 className="mt-2 text-base font-black text-slate-900 dark:text-white">
                  {isBn ? previewItem.titleBn || previewItem.titleEn : previewItem.titleEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBn ? previewItem.subtitleBn || previewItem.subtitleEn : previewItem.subtitleEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isBn ? "বিস্তারিত বিষয় ও অ্যালগরিদমিক রুলস:" : "Core Concepts & Rules Included:"}
              </span>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {previewItem.keyConcepts?.map((c: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-500 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
              >
                {isBn ? "বন্ধ করুন" : "Close"}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadIndividualPdf(previewItem);
                  setPreviewItem(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-1.5 text-xs font-black text-slate-950 hover:bg-cyan-400"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isBn ? "পিডিএফ ডাউনলোড" : "Download PDF"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
