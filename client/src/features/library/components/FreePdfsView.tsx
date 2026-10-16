import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Share2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import {
  extractGoogleDriveFileId,
  getGoogleDrivePreviewUrl,
  getGoogleDriveDownloadUrl,
} from "@shared/mediaLinks";
import type { FreePdfItem } from "@shared/types/library";

export const FreePdfsView: React.FC = () => {
  const { language, selectText, isRTL } = useLanguage();
  const isBn = language === "bn";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewItem, setPreviewItem] = useState<FreePdfItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Queries
  const { data: ebooks = [], isLoading } = trpc.customer.publicFreeEbooks.useQuery(undefined, {
    staleTime: 1000 * 60,
  });

  const downloadMutation = trpc.customer.downloadEbook.useMutation();

  const categories = [
    "all",
    "CHART ANALYSIS",
    "LIQUIDITY & SMC",
    "ORDER FLOW",
    "ADVANCED PRICE ACTION",
    "RISK MANAGEMENT",
  ];

  const filtered = (ebooks as FreePdfItem[]).filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.titleEn?.toLowerCase().includes(q) ||
        item.titleBn?.toLowerCase().includes(q) ||
        item.subtitleEn?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownload = async (item: FreePdfItem) => {
    setDownloadingId(item.id);
    setSuccessToast(null);

    try {
      // Record download on backend
      try {
        await downloadMutation.mutateAsync({ id: item.id });
      } catch {}

      if (item.fileUrl) {
        // If Google Drive link, provide download or direct link
        const driveId = extractGoogleDriveFileId(item.fileUrl);
        const targetUrl = driveId
          ? getGoogleDriveDownloadUrl(driveId) || item.fileUrl
          : item.fileUrl;

        const a = document.createElement("a");
        a.href = targetUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = item.fileName || `${item.titleEn.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Generate on-the-fly PDF using jsPDF
        const doc = new jsPDF();
        doc.setFillColor(8, 17, 31);
        doc.rect(0, 0, 210, 35, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("CYCLE OF CHART - INSTITUTIONAL GUIDE", 20, 22);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.text(item.titleEn, 20, 50);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(item.subtitleEn, 20, 60);

        if (Array.isArray(item.keyConcepts) && item.keyConcepts.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text("Core Concepts & Trading Rules:", 20, 75);
          doc.setFont("helvetica", "normal");
          item.keyConcepts.forEach((concept, i) => {
            doc.text(`- ${concept}`, 25, 85 + i * 8);
          });
        }

        doc.save(item.fileName || `${item.titleEn.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      }

      setSuccessToast(
        selectText({
          en: `"${item.titleEn}" downloaded successfully!`,
          bn: `"${item.titleBn || item.titleEn}" সফলভাবে ডাউনলোড হয়েছে!`,
          ur: `"${item.titleEn}" کامیابی کے ساتھ ڈاؤن لوڈ ہو گیا!`,
        })
      );
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error("[Download error]:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Controls: Search & Category Pills */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={selectText({
              en: "Search PDF guides, SMC models, candle theory...",
              bn: "গাইড, এসএমসি মডেল বা ক্যান্ডেল থিওরি খুঁজুন...",
              ur: "پی ڈی ایف گائیڈز تلاش کریں...",
            })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? "bg-[#0284c7] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {cat === "all" ? selectText({ en: "All Resources", bn: "সব রিসোর্স", ur: "تمام" }) : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Google Drive Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 p-4 text-xs text-sky-800 dark:text-sky-300">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-sky-500/20 p-2 text-sky-600 dark:text-sky-400 shrink-0">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="font-extrabold block">
              {selectText({
                en: "100% Free Institutional PDFs & Cheat-Sheets",
                bn: "সম্পূর্ণ ফ্রি প্রাতিষ্ঠানিক পিডিএফ ও চিট-শীট",
                ur: "100% مفت ادارہ جاتی پی ڈی ایف اور چیٹ شیٹس",
              })}
            </span>
            <span className="text-[11px] opacity-85">
              {selectText({
                en: "Instant in-browser preview & Google Drive downloads. No credit card required.",
                bn: "ইনস্ট্যান্ট প্রিভিউ এবং গুগল ড্রাইভ ডাউনলোড। কোনো পেমেন্টের প্রয়োজন নেই।",
                ur: "فوری پیش نظارہ اور گوگل ڈرائیو ڈاؤن لوڈ۔ کسی کریڈٹ کارڈ کی ضرورت نہیں ہے۔",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* PDF Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300">
            {selectText({
              en: "No PDF guides found matching your search",
              bn: "আপনার অনুসন্ধানের সাথে কোনো গাইড মিলছে না",
              ur: "کوئی پی ڈی ایف گائیڈ نہیں ملی",
            })}
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            {selectText({
              en: "Try clearing filters or search query",
              bn: "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন",
              ur: "فلٹرز تبدیل کر کے دوبارہ کوشش کریں",
            })}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isDrive = item.fileUrl && item.fileUrl.includes("drive.google.com");
            const driveId = isDrive ? extractGoogleDriveFileId(item.fileUrl || "") : null;
            const previewUrl = driveId ? getGoogleDrivePreviewUrl(driveId) : item.fileUrl;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-800"
              >
                <div>
                  {/* Top Badge & Category */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                      {item.category || "INSTITUTIONAL"}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <Sparkles size={10} />
                      <span>FREE</span>
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="mt-3 text-base font-black tracking-tight text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 transition-colors">
                    {isBn && item.titleBn ? item.titleBn : item.titleEn}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {isBn && item.subtitleBn ? item.subtitleBn : item.subtitleEn}
                  </p>

                  {/* Key Concepts Pills */}
                  {Array.isArray(item.keyConcepts) && item.keyConcepts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.keyConcepts.slice(0, 3).map((concept, cIdx) => (
                        <span
                          key={cIdx}
                          className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          • {concept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewItem(item)}
                    className="h-8 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Eye size={13} className="text-sky-500" />
                    <span>{selectText({ en: "Preview", bn: "প্রিভিউ", ur: "پیش نظارہ" })}</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item.id}
                    className="h-8 gap-1.5 bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-xs"
                  >
                    <Download size={13} />
                    <span>
                      {downloadingId === item.id
                        ? selectText({ en: "Downloading...", bn: "ডাউনলোড হচ্ছে...", ur: "ڈاؤن لوڈ ہو رہا ہے..." })
                        : selectText({ en: "Download PDF", bn: "ডাউনলোড", ur: "ڈاؤن لوڈ" })}
                    </span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5 truncate">
                <div className="rounded-xl bg-sky-500/10 p-2 text-sky-500">
                  <FileText size={18} />
                </div>
                <div className="truncate">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {previewItem.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {previewItem.subtitleEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(previewItem)}
                  className="h-8 gap-1.5 bg-[#0284c7] text-white font-bold text-xs"
                >
                  <Download size={13} />
                  <span>Download</span>
                </Button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewItem.fileUrl && extractGoogleDriveFileId(previewItem.fileUrl) ? (
                <div className="aspect-4/3 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                  <iframe
                    src={getGoogleDrivePreviewUrl(extractGoogleDriveFileId(previewItem.fileUrl)!)!}
                    title={previewItem.titleEn}
                    className="w-full h-full"
                    allow="autoplay"
                  />
                </div>
              ) : previewItem.fileUrl ? (
                <div className="aspect-4/3 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                  <iframe
                    src={previewItem.fileUrl}
                    title={previewItem.titleEn}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl bg-slate-50 p-6 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-sky-500">Cycle of Chart Institutional Document</span>
                    <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{previewItem.titleEn}</h2>
                    <p className="text-xs text-slate-500 mt-1">{previewItem.subtitleEn}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                      Core Institutional Syllabus & Rules:
                    </h4>
                    <div className="space-y-2">
                      {Array.isArray(previewItem.keyConcepts) && previewItem.keyConcepts.length > 0 ? (
                        previewItem.keyConcepts.map((concept, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                          >
                            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-black text-sky-600 shrink-0">
                              0{idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {concept}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">Full institutional content is available in the generated PDF download.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
