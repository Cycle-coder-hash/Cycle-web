import { Link } from "wouter";
import { Download, Eye, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardLibraryPdfItem {
  id: number | string;
  title?: string | null;
  titleEn?: string | null;
  titleBn?: string | null;
  subtitle?: string | null;
  subtitleEn?: string | null;
  subtitleBn?: string | null;
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
  isBn: boolean;
  isLoadingLibrary: boolean;
  libraryPdfs: ReadonlyArray<DashboardLibraryPdfItem> | null | undefined;
  onPreviewPdf: (pdf: DashboardLibraryPdfItem) => void;
  onDownloadResource: (pdf: DashboardLibraryPdfItem) => void;
}

export function DashboardLibraryTab({
  isBn,
  isLoadingLibrary,
  libraryPdfs,
  onPreviewPdf,
  onDownloadResource,
}: DashboardLibraryTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isBn ? "আমার লাইব্রেরি ও প্রাতিষ্ঠানিক রিসোর্স" : "Institutional PDF Library & Course"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? "অনলাইনে প্রিভিউ দেখুন অথবা সম্পূর্ণ চিট-শীট ফাইলটি সরাসরি ডাউনলোড করুন।"
              : "Preview interactive cheat-sheets in browser or download printable study files."}
          </p>
        </div>

        <Link href="/checkout">
          <Button
            size="sm"
            className="gap-1.5 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold"
          >
            <Plus size={15} /> {isBn ? "নতুন রিসোর্স আনলক করুন" : "Browse Store Bundles"}
          </Button>
        </Link>
      </div>

      {/* Loading Skeletons */}
      {isLoadingLibrary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 animate-pulse dark:border-slate-800 dark:bg-slate-900/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
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
        <div className="rounded-3xl border border-slate-200 bg-white p-10 sm:p-14 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center">
          <div className="size-16 rounded-2xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-[#0284c7] dark:text-sky-400 mb-4 border border-sky-100 dark:border-sky-900/50">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {isBn ? "আপনার লাইব্রেরিতে কোনো PDF নেই" : "No PDFs in your library yet."}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {isBn
              ? "আমাদের প্রাতিষ্ঠানিক স্ট্র্যাটেজি গাইড, চিট-শীট ও সম্পূর্ণ ট্রেডিং কোর্স আনলক করতে স্টোর বান্ডেলগুলো দেখুন।"
              : "Explore our institutional blueprints, high-resolution cheat-sheets, and comprehensive trading courses to unlock them here."}
          </p>
          <Link href="/checkout">
            <Button className="mt-6 gap-2 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold px-6 py-2.5 rounded-2xl shadow-md">
              <Plus size={16} /> {isBn ? "স্টোর বান্ডেল দেখুন" : "Browse Store Bundles"}
            </Button>
          </Link>
        </div>
      )}

      {/* Resource Cards Grid */}
      {!isLoadingLibrary && libraryPdfs && libraryPdfs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libraryPdfs.map((pdf) => {
            const title = isBn && pdf.titleBn ? pdf.titleBn : (pdf.titleEn || pdf.title);
            const subtitle = isBn && pdf.subtitleBn ? pdf.subtitleBn : (pdf.subtitleEn || pdf.subtitle || "");
            const isFree = pdf.isFree === true || Number(pdf.price) === 0 || !pdf.price;

            return (
              <div
                key={pdf.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      {pdf.category || (isFree ? "FREE PDF" : "INSTITUTIONAL PDF")}
                    </span>
                    <FileText size={18} className="text-[#0284c7] dark:text-sky-400" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold">{title}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{subtitle}</p>
                  <div className="mt-3 text-[11px] font-mono text-slate-400">
                    {pdf.pages || 15} Pages · {pdf.fileSize || "High Resolution Reference"}
                  </div>
                </div>

                <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Button
                    size="sm"
                    onClick={() => onPreviewPdf(pdf)}
                    variant="outline"
                    className="w-1/2 text-xs font-bold border-slate-300 dark:border-slate-700"
                  >
                    <Eye size={13} className="mr-1" />
                    <span>{isBn ? "প্রিভিউ" : "Preview"}</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onDownloadResource(pdf)}
                    className="w-1/2 gap-1 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                  >
                    <Download size={13} />
                    <span>{isBn ? "ডাউনলোড" : "Download"}</span>
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
