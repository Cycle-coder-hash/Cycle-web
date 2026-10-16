import { Link } from "wouter";
import { Download, Eye, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export interface DashboardLibraryPdfItem {
  id: number | string;
  title?: string | null;
  titleEn?: string | null;
  titleBn?: string | null;
  titleUr?: string | null;
  subtitle?: string | null;
  subtitleEn?: string | null;
  subtitleBn?: string | null;
  subtitleUr?: string | null;
  category?: string | null;
  pages?: number | null;
  fileSize?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  keyConcepts?: ReadonlyArray<string> | null;
  isFree?: boolean | null;
  price?: number | string | null;
}

export interface DashboardLibraryTabProps {
  isBn?: boolean;
  isLoadingLibrary: boolean;
  libraryPdfs: ReadonlyArray<DashboardLibraryPdfItem> | null | undefined;
  onPreviewPdf: (pdf: DashboardLibraryPdfItem) => void;
  onDownloadResource: (pdf: DashboardLibraryPdfItem) => void;
}

export function DashboardLibraryTab({
  isLoadingLibrary,
  libraryPdfs,
  onPreviewPdf,
  onDownloadResource,
}: DashboardLibraryTabProps) {
  const { selectText, isUr, isRTL } = useLanguage();

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`space-y-5 sm:space-y-8 animate-in fade-in duration-300 ${isUr ? "font-urdu" : ""}`}
    >
      <div className="flex flex-col justify-between gap-3 sm:gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {selectText({
              en: "Institutional PDF Library & Course",
              bn: "আমার লাইব্রেরি ও প্রাতিষ্ঠানিক রিসোর্স",
              ur: "ادارہ جاتی PDF لائبریری اور کورس",
            })}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {selectText({
              en: "Preview interactive cheat-sheets in browser or download printable study files.",
              bn: "অনলাইনে প্রিভিউ দেখুন অথবা সম্পূর্ণ চিট-শীট ফাইলটি সরাসরি ডাউনলোড করুন।",
              ur: "براؤزر میں انٹرایکٹو چیٹ شیٹس کا پیش نظارہ دیکھیں یا مکمل اسٹڈی فائلیں ڈاؤن لوڈ کریں۔",
            })}
          </p>
        </div>

        <Link href="/checkout">
          <Button
            size="sm"
            className="gap-1.5 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold h-8 sm:h-9 text-xs"
          >
            <Plus size={14} className="sm:size-[15px]" />{" "}
            {selectText({
              en: "Browse Store Bundles",
              bn: "নতুন রিসোর্স আনলক করুন",
              ur: "اسٹور بنڈلز دیکھیں",
            })}
          </Button>
        </Link>
      </div>

      {/* Loading Skeletons */}
      {isLoadingLibrary && (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 sm:h-56 rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6 animate-pulse dark:border-slate-800 dark:bg-slate-900/50 flex flex-col justify-between"
            >
              <div className="space-y-2.5 sm:space-y-3">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingLibrary && (!libraryPdfs || libraryPdfs.length === 0) && (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 sm:p-14 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center">
          <div className="size-12 sm:size-16 rounded-xl sm:rounded-2xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-[#0284c7] dark:text-sky-400 mb-3 sm:mb-4 border border-sky-100 dark:border-sky-900/50">
            <FileText size={24} className="sm:size-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {selectText({
              en: "No PDFs in your library yet.",
              bn: "আপনার লাইব্রেরিতে কোনো PDF নেই",
              ur: "آپ کی لائبریری میں ابھی کوئی PDF نہیں ہے۔",
            })}
          </h3>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {selectText({
              en: "Explore our institutional blueprints, high-resolution cheat-sheets, and comprehensive trading courses to unlock them here.",
              bn: "আমাদের প্রাতিষ্ঠানিক স্ট্র্যাটেজি গাইড, চিট-শীট ও সম্পূর্ণ ট্রেডিং কোর্স আনলক করতে স্টোর বান্ডেলগুলো দেখুন।",
              ur: "ہمارے ادارہ جاتی بلیو پرنٹس، اعلیٰ کوالٹی چیٹ شیٹس اور مکمل ٹریڈنگ کورسز حاصل کرنے کے لیے اسٹور بنڈلز دیکھیں۔",
            })}
          </p>
          <Link href="/checkout">
            <Button className="mt-4 sm:mt-6 gap-2 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md text-xs sm:text-sm">
              <Plus size={15} className="sm:size-4" />{" "}
              {selectText({
                en: "Browse Store Bundles",
                bn: "স্টোর বান্ডেল দেখুন",
                ur: "اسٹور بنڈلز دیکھیں",
              })}
            </Button>
          </Link>
        </div>
      )}

      {/* Resource Cards Grid */}
      {!isLoadingLibrary && libraryPdfs && libraryPdfs.length > 0 && (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libraryPdfs.map((pdf) => {
            const title = selectText({
              en: pdf.titleEn || pdf.title || "",
              bn: pdf.titleBn || pdf.title || "",
              ur: pdf.titleUr || pdf.titleEn || pdf.title || "",
            });
            const subtitle = selectText({
              en: pdf.subtitleEn || pdf.subtitle || "",
              bn: pdf.subtitleBn || pdf.subtitle || "",
              ur: pdf.subtitleUr || pdf.subtitleEn || pdf.subtitle || "",
            });
            const isFree = pdf.isFree === true || Number(pdf.price) === 0 || !pdf.price;

            const categoryBadge =
              pdf.category ||
              (isFree
                ? selectText({ en: "FREE PDF", bn: "ফ্রি PDF", ur: "مفت PDF" })
                : selectText({ en: "INSTITUTIONAL PDF", bn: "প্রাতিষ্ঠানিক PDF", ur: "ادارہ جاتی PDF" }));

            return (
              <div
                key={pdf.id}
                className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-2.5 sm:px-3 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      {categoryBadge}
                    </span>
                    <FileText size={16} className="sm:size-[18px] text-[#0284c7] dark:text-sky-400" />
                  </div>
                  <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-extrabold">{title}</h3>
                  {subtitle && (
                    <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{subtitle}</p>
                  )}
                  <div dir="ltr" className="mt-2 sm:mt-3 text-[10px] sm:text-[11px] font-mono text-slate-400">
                    {pdf.pages || 15} {selectText({ en: "Pages", bn: "পৃষ্ঠা", ur: "صفحات" })} ·{" "}
                    {pdf.fileSize ||
                      selectText({
                        en: "High Resolution Reference",
                        bn: "হাই রেজোলিউশন রেফারেন্স",
                        ur: "اعلیٰ معیار کا ریفرنس",
                      })}
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex gap-2 border-t border-slate-100 pt-3 sm:pt-4 dark:border-slate-800">
                  <Button
                    size="sm"
                    onClick={() => onPreviewPdf(pdf)}
                    variant="outline"
                    className="w-1/2 text-xs font-bold border-slate-300 dark:border-slate-700 h-8 sm:h-9"
                  >
                    <Eye size={13} className="mr-1" />
                    <span>{selectText({ en: "Preview", bn: "প্রিভিউ", ur: "پیش نظارہ" })}</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onDownloadResource(pdf)}
                    className="w-1/2 gap-1 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 h-8 sm:h-9"
                  >
                    <Download size={13} />
                    <span>{selectText({ en: "Download", bn: "ডাউনলোড", ur: "ڈاؤن لوڈ" })}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
