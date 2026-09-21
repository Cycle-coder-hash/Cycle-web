import React from "react";
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Paperclip,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EbooksTabProps {
  ebooks: any[];
  isLoadingEbooks?: boolean;
  ebookSearch: string;
  setEbookSearch: (query: string) => void;
  ebookCategoryFilter: string;
  setEbookCategoryFilter: (category: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (ebook: any) => void;
  onTogglePublish: (id: number, currentPublished: boolean) => void;
  onDeleteEbook: (id: number) => void;
}

export const EbooksTab: React.FC<EbooksTabProps> = ({
  ebooks,
  isLoadingEbooks,
  ebookSearch,
  setEbookSearch,
  ebookCategoryFilter,
  setEbookCategoryFilter,
  onOpenAddModal,
  onOpenEditModal,
  onTogglePublish,
  onDeleteEbook,
}) => {
  const filteredEbooks = (ebooks || []).filter((eb: any) => {
    if (ebookCategoryFilter !== "all" && eb.category !== ebookCategoryFilter) return false;
    if (ebookSearch.trim()) {
      const q = ebookSearch.toLowerCase();
      return (
        eb.titleEn?.toLowerCase().includes(q) ||
        eb.titleBn?.toLowerCase().includes(q) ||
        eb.subtitleEn?.toLowerCase().includes(q) ||
        eb.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Add Button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Free eBooks & PDFs Management</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage the institutional guides and PDFs in the Free eBook Package. Upload custom PDF files, edit content, and toggle publishing.
          </p>
        </div>
        <Button
          onClick={onOpenAddModal}
          className="gap-2 bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New eBook / PDF</span>
        </Button>
      </div>

      {/* Metrics Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total eBooks</div>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {ebooks?.length || 0}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Published (Live)</div>
          <div className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-300">
            {(ebooks || []).filter((e: any) => e.isPublished).length}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Drafts (Hidden)</div>
          <div className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-300">
            {(ebooks || []).filter((e: any) => !e.isPublished).length}
          </div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Custom PDF Uploads</div>
          <div className="mt-1 text-2xl font-black text-sky-800 dark:text-sky-300">
            {(ebooks || []).filter((e: any) => !!e.fileUrl).length}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search eBooks by title, category, or concepts..."
            value={ebookSearch}
            onChange={(e) => setEbookSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={ebookCategoryFilter}
            onChange={(e) => setEbookCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="CHART ANALYSIS">CHART ANALYSIS</option>
            <option value="LIQUIDITY & SMC">LIQUIDITY & SMC</option>
            <option value="ORDER FLOW">ORDER FLOW</option>
            <option value="ADVANCED PRICE ACTION">ADVANCED PRICE ACTION</option>
            <option value="RISK MANAGEMENT">RISK MANAGEMENT</option>
            <option value="MARKET PSYCHOLOGY">MARKET PSYCHOLOGY</option>
          </select>
        </div>
      </div>

      {/* eBooks Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingEbooks ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
            <span className="text-xs font-bold">Loading eBook library...</span>
          </div>
        ) : filteredEbooks.length ? (
          filteredEbooks.map((eb: any) => (
            <div
              key={eb.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md"
            >
              <div>
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    {eb.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      {eb.pages || 15} Pages
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        eb.isPublished
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {eb.isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Titles */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {eb.titleEn}
                </h3>
                {eb.titleBn && (
                  <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 font-bangla">
                    {eb.titleBn}
                  </p>
                )}

                {/* Subtitle */}
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {eb.subtitleEn}
                </p>

                {/* Key Concepts Chips */}
                {Array.isArray(eb.keyConcepts) && eb.keyConcepts.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {eb.keyConcepts.slice(0, 3).map((concept: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        • {concept}
                      </span>
                    ))}
                    {eb.keyConcepts.length > 3 && (
                      <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-slate-800">
                        +{eb.keyConcepts.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Attachment Status */}
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                  {eb.fileUrl ? (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                        <Paperclip size={13} className="text-sky-500 shrink-0" />
                        <span className="font-bold truncate">{eb.fileName || "Uploaded PDF"}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">({eb.fileSize || "Custom"})</span>
                      </div>
                      <a
                        href={eb.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-700 dark:text-sky-400 ml-2 shrink-0"
                        title="Preview PDF"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <Sparkles size={13} className="text-amber-500 shrink-0" />
                      <span>Institutional PDF Generator (Active)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTogglePublish(eb.id, eb.isPublished)}
                  className="gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700"
                >
                  {eb.isPublished ? (
                    <>
                      <EyeOff size={13} className="text-amber-500" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye size={13} className="text-emerald-500" />
                      <span>Publish</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenEditModal(eb)}
                    className="gap-1 text-xs font-bold border-slate-200 dark:border-slate-700"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteEbook(eb.id)}
                    className="gap-1 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <BookOpen size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
            <h3 className="text-base font-bold">No eBooks found</h3>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search or add a new institutional PDF resource.
            </p>
            <Button
              onClick={onOpenAddModal}
              size="sm"
              className="mt-4 bg-[#0284c7] font-bold text-white hover:bg-sky-600"
            >
              <Plus size={14} className="mr-1" />
              <span>Add First eBook</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
