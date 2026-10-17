import React, { useState, useEffect } from "react";
import {
  Layers,
  X,
  Save,
  Tag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseAlbumMeta, CourseId } from "@shared/types/library";

interface CourseAlbumMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: CourseId;
  meta: CourseAlbumMeta | null;
  onSave: (courseId: CourseId, updated: Partial<CourseAlbumMeta>) => Promise<void>;
  isSaving?: boolean;
}

export const CourseAlbumMetaModal: React.FC<CourseAlbumMetaModalProps> = ({
  isOpen,
  onClose,
  courseId,
  meta,
  onSave,
  isSaving = false,
}) => {
  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [subtitleBn, setSubtitleBn] = useState("");
  const [description, setDescription] = useState("");
  const [priceBdt, setPriceBdt] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (meta) {
      setTitle(meta.title || "");
      setTitleBn(meta.titleBn || "");
      setSubtitle(meta.subtitle || "");
      setSubtitleBn(meta.subtitleBn || "");
      setDescription(meta.description || "");
      setPriceBdt(meta.priceBdt || (courseId === "basic-to-advance" ? "2499" : "4999"));
      setPriceUsd(meta.priceUsd || (courseId === "basic-to-advance" ? "19.99" : "39.99"));
      setThumbnailUrl(meta.thumbnailUrl || "");
      setBadgeText(meta.badgeText || "");
      setIsPublished(meta.isPublished !== false);
    }
    setError(null);
  }, [meta, isOpen, courseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Album title is required.");
      return;
    }

    if (!priceBdt.trim()) {
      setError("Price in BDT is required.");
      return;
    }

    try {
      await onSave(courseId, {
        title: title.trim(),
        titleBn: titleBn.trim() || undefined,
        subtitle: subtitle.trim(),
        subtitleBn: subtitleBn.trim() || undefined,
        description: description.trim(),
        priceBdt: priceBdt.trim(),
        priceUsd: priceUsd.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        badgeText: badgeText.trim() || undefined,
        isPublished,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update album details");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Edit Course Album Settings
              </h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-bold">
                {courseId === "basic-to-advance"
                  ? "Basic to Advance (Album A)"
                  : "Cycle Blueprint (Album B)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-bold text-rose-700 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs sm:text-sm">
          {/* Titles */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Album Title (English) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Album Title (Bengali - Optional)
              </label>
              <input
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="বাংলা শিরোনাম"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Subtitles */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subtitle (English)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subtitle (Bengali - Optional)
              </label>
              <input
                type="text"
                value={subtitleBn}
                onChange={(e) => setSubtitleBn(e.target.value)}
                placeholder="বাংলা সাবটাইটেল"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Course Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500"
            />
          </div>

          {/* Pricing Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Price (BDT) *
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">৳</span>
                <input
                  type="text"
                  required
                  value={priceBdt}
                  onChange={(e) => setPriceBdt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Price (USD)
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">$</span>
                <input
                  type="text"
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Badge Tag
              </label>
              <div className="relative mt-1.5">
                <Tag size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Most Popular"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Thumbnail Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Album Thumbnail / Cover Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://.../cover.jpg or leave blank for default"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Publication Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/50 p-3">
            <input
              type="checkbox"
              id="albumPublishToggleMain"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label
              htmlFor="albumPublishToggleMain"
              className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none"
            >
              Publish Album in Student Library
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="border-slate-300 dark:border-slate-700 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2 bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md"
            >
              <Save size={14} />
              <span>{isSaving ? "Saving..." : "Save Album Details"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
