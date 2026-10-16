import React, { useState, useEffect } from "react";
import { Video, X, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from "@shared/mediaLinks";
import type { CourseClass, CourseId } from "@shared/types/library";


interface CourseClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: CourseId;
  courseTitle: string;
  editingClass: CourseClass | null;
  onSave: (data: {
    courseId: CourseId;
    id?: string;
    title: string;
    description?: string;
    videoUrl: string;
    duration?: string;
    order?: number;
    isPublished?: boolean;
    resourceLink?: string;
  }) => Promise<void> | void;
  isSaving?: boolean;
}

export const CourseClassModal: React.FC<CourseClassModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  editingClass,
  onSave,
  isSaving,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("45 min");
  const [order, setOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState(true);
  const [resourceLink, setResourceLink] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingClass) {
      setTitle(editingClass.title || "");
      setDescription(editingClass.description || "");
      setVideoUrl(editingClass.videoUrl || "");
      setDuration(editingClass.duration || "45 min");
      setOrder(editingClass.order || 1);
      setIsPublished(editingClass.isPublished !== false);
      setResourceLink(editingClass.resourceLink || "");
    } else {
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setDuration("45 min");
      setOrder(1);
      setIsPublished(true);
      setResourceLink("");
    }
    setErrorMsg(null);
  }, [editingClass, isOpen]);

  if (!isOpen) return null;

  const detectedVideoId = extractYouTubeVideoId(videoUrl);
  const embedUrl = detectedVideoId ? getYouTubeEmbedUrl(detectedVideoId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a class title");
      return;
    }
    if (!videoUrl.trim() || !detectedVideoId) {
      setErrorMsg("Please provide a valid YouTube video URL (Unlisted or standard YouTube link)");
      return;
    }

    try {
      setErrorMsg(null);
      await onSave({
        courseId,
        id: editingClass?.id,
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        duration: duration.trim() || "45 min",
        order: Number(order) || 1,
        isPublished,
        resourceLink: resourceLink.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save class");
    }
  };

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
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-sky-500/10 p-2 text-sky-500 dark:bg-sky-500/20">
              <Video size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {editingClass ? "Edit Video Class" : "Add New Video Class"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {courseTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs sm:text-sm">
          {/* Class Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Class Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Class 04: Candle Range Theory Anatomy & Liquidity Sweeps"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Sequence & Duration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Sequence / Class Number
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <span className="mt-0.5 text-[10px] text-slate-400">Determines lesson playback order</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Class Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 48 min or 1 hr 12 min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* YouTube Video URL */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                YouTube Unlisted Video URL *
              </label>
              {detectedVideoId ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>Valid YouTube Link (ID: {detectedVideoId})</span>
                </span>
              ) : videoUrl.trim() ? (
                <span className="text-[11px] font-medium text-amber-500">
                  Enter valid YouTube link (e.g. youtu.be/... or watch?v=...)
                </span>
              ) : null}
            </div>

            <input
              type="url"
              required
              placeholder="https://youtu.be/xxx or https://www.youtube.com/watch?v=xxx"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Only students with verified purchase for this course will be able to play this video. Non-buyers will see the lesson as locked.
            </p>

            {/* Live Video Preview Preview */}
            {embedUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-black aspect-video max-h-48">
                <iframe
                  src={embedUrl}
                  title="YouTube Preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Class Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Class Description & Key Learning Points (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Detailed explanation of what is covered in this class, concepts to focus on, and homework assignments..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Resource / Drive Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Lesson Study Material / Drive Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/... or study notes link"
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <span className="mt-0.5 text-[10px] text-slate-400">Attached directly to this lesson for enrolled students to download</span>
          </div>

          {/* Publish Immediately Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="courseClassPublishToggle"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label
              htmlFor="courseClassPublishToggle"
              className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Publish immediately (Enrolled students can watch right away)
            </label>
          </div>

          {/* Actions */}
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
              className="bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md gap-1.5"
            >
              {isSaving && <RefreshCw size={13} className="animate-spin" />}
              <span>{editingClass ? "Save Changes" : "Add Class"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
