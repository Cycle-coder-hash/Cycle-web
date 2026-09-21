import React from "react";
import { BookOpen, X, Upload, Paperclip, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EbookFormData {
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  category: string;
  pages: number;
  keyConceptsText: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: string | null;
  isPublished: boolean;
}

interface EbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEbook: any | null;
  ebookForm: EbookFormData;
  setEbookForm: React.Dispatch<React.SetStateAction<EbookFormData>>;
  onSave: (e: React.FormEvent) => void;
  onPdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving?: boolean;
}

export const EbookModal: React.FC<EbookModalProps> = ({
  isOpen,
  onClose,
  editingEbook,
  ebookForm,
  setEbookForm,
  onSave,
  onPdfUpload,
  isSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="text-sky-500" size={20} />
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {editingEbook ? "Edit Free eBook / PDF" : "Add New Free eBook / PDF"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} className="mt-5 space-y-4 text-xs sm:text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Title (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CRT Master Cheat-Sheet"
                value={ebookForm.titleEn}
                onChange={(e) => setEbookForm((prev) => ({ ...prev, titleEn: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Title (Bengali - Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. সিআরটি মাস্টার চিট-শীট"
                value={ebookForm.titleBn}
                onChange={(e) => setEbookForm((prev) => ({ ...prev, titleBn: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subtitle / Summary (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Candle Range Theory, liquidity sweeps, and expansion models"
                value={ebookForm.subtitleEn}
                onChange={(e) => setEbookForm((prev) => ({ ...prev, subtitleEn: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subtitle / Summary (Bengali - Optional)
              </label>
              <input
                type="text"
                placeholder="বাংলা সারসংক্ষেপ বা বর্ণনা"
                value={ebookForm.subtitleBn}
                onChange={(e) => setEbookForm((prev) => ({ ...prev, subtitleBn: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CHART ANALYSIS or LIQUIDITY & SMC"
                value={ebookForm.category}
                onChange={(e) => setEbookForm((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pages Count
              </label>
              <input
                type="number"
                min={1}
                value={ebookForm.pages}
                onChange={(e) =>
                  setEbookForm((prev) => ({ ...prev, pages: parseInt(e.target.value) || 1 }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Key Concepts / Learning Modules (One per line)
            </label>
            <textarea
              rows={4}
              placeholder="Candle Range Theory Anatomy&#10;Internal vs External Liquidity Sweeps&#10;Order Flow Directional Confirmation"
              value={ebookForm.keyConceptsText}
              onChange={(e) => setEbookForm((prev) => ({ ...prev, keyConceptsText: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Upload PDF File or Custom URL */}
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              <Upload size={15} className="text-sky-500" />
              <span>Custom PDF File Attachment (Optional)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Upload your own PDF file for students to download. If left empty, the institutional PDF generator will automatically format and generate a clean PDF on-the-fly.
            </p>

            {ebookForm.fileUrl ? (
              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip size={16} className="text-emerald-500 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {ebookForm.fileName || "Uploaded PDF Document"}
                    </div>
                    <div className="text-[10px] text-slate-400">{ebookForm.fileSize || "PDF Attached"}</div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEbookForm((prev) => ({
                      ...prev,
                      fileUrl: null,
                      fileName: null,
                      fileSize: null,
                    }))
                  }
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold"
                >
                  <Trash2 size={13} className="mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-5 cursor-pointer hover:border-sky-500 hover:bg-sky-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-400">
                  <Upload size={22} className="text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Click to select PDF from your device
                  </span>
                  <span className="text-[11px] text-slate-400">Accepts .pdf files</span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={onPdfUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="ebookPublishToggle"
              checked={ebookForm.isPublished}
              onChange={(e) => setEbookForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
              className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label
              htmlFor="ebookPublishToggle"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Publish immediately (Visible in student Free eBook Library)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 dark:border-slate-700 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md"
            >
              {isSaving && <RefreshCw size={13} className="animate-spin mr-1.5" />}
              <span>{editingEbook ? "Save Changes" : "Create eBook"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
