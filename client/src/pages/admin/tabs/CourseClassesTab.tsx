import React, { useState } from "react";
import {
  Video,
  Plus,
  Play,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@shared/mediaLinks";
import type { CourseClass, CourseId } from "@shared/types/library";


interface CourseClassesTabProps {
  courseId: CourseId;
  albumTitle: string;
  bundleId: number;
  bundlePrice: string;
  classes: CourseClass[];
  isLoading?: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (cls: CourseClass) => void;
  onTogglePublish: (cls: CourseClass) => void;
  onDeleteClass: (cls: CourseClass) => void;
  onMoveOrder: (classId: string, direction: "up" | "down") => void;
}

export const CourseClassesTab: React.FC<CourseClassesTabProps> = ({
  courseId,
  albumTitle,
  bundleId,
  bundlePrice,
  classes,
  isLoading,
  onOpenAddModal,
  onOpenEditModal,
  onTogglePublish,
  onDeleteClass,
  onMoveOrder,
}) => {
  const [previewingVideoClass, setPreviewingVideoClass] = useState<CourseClass | null>(null);

  const publishedCount = classes.filter((c) => c.isPublished !== false).length;
  const draftCount = classes.length - publishedCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Album Header & CTA */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
              Bundle ID {bundleId}
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              BDT ৳{bundlePrice}
            </span>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              YouTube Unlisted Gated
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {albumTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Manage unlimited classes for this paid album. Add YouTube unlisted video lessons, set playback order, publish/hide classes, and attach study materials.
          </p>
        </div>

        <Button
          onClick={onOpenAddModal}
          className="gap-2 bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          <span>Add New Class</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Classes</div>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {classes.length}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Published (Enrolled View)</div>
          <div className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-300">
            {publishedCount}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Hidden / Drafts</div>
          <div className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-300">
            {draftCount}
          </div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Target Album</div>
          <div className="mt-1 text-sm font-black text-sky-800 dark:text-sky-300 truncate">
            {courseId === "basic-to-advance" ? "Basic to Advance" : "Cycle Blueprint"}
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-sky-500" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Curriculum & Lesson Sequence ({classes.length} Classes)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Use arrows to reorder classes
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800 text-slate-400 mb-3">
              <Video size={28} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No classes in this album yet</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Click &quot;Add New Class&quot; above to add YouTube unlisted video lessons for your enrolled students.
            </p>
            <Button
              onClick={onOpenAddModal}
              className="mt-4 gap-2 bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md text-xs"
            >
              <Plus size={14} />
              <span>Add First Class</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls, idx) => {
              const videoId = extractYouTubeVideoId(cls.videoUrl || "");
              const thumbUrl = videoId ? getYouTubeThumbnailUrl(videoId) : null;

              return (
                <div
                  key={cls.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-sky-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-sky-800"
                >
                  {/* Left: Reorder arrows + Video thumb & details */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* Move Up / Down Buttons */}
                    <div className="flex flex-col gap-1 shrink-0 pt-1 sm:pt-0">
                      <button
                        onClick={() => onMoveOrder(cls.id, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-25 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => onMoveOrder(cls.id, "down")}
                        disabled={idx === classes.length - 1}
                        title="Move Down"
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-25 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Class Order Badge */}
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 font-black text-xs dark:bg-sky-500/20 dark:text-sky-400">
                      #{cls.order || idx + 1}
                    </div>

                    {/* Thumbnail preview */}
                    {thumbUrl ? (
                      <div
                        onClick={() => setPreviewingVideoClass(cls)}
                        className="relative size-16 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer group"
                      >
                        <img
                          src={thumbUrl}
                          alt={cls.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20">
                          <Play size={14} className="text-white fill-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400">
                        <Video size={20} />
                      </div>
                    )}

                    {/* Title & Description */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {cls.title}
                        </h4>
                        {cls.duration && (
                          <span className="flex items-center gap-1 rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <Clock size={10} />
                            {cls.duration}
                          </span>
                        )}
                        {cls.isPublished === false && (
                          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                            Draft (Hidden)
                          </span>
                        )}
                      </div>

                      {cls.description && (
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {cls.description}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                        {cls.videoUrl && (
                          <a
                            href={cls.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-sky-500"
                          >
                            <ExternalLink size={10} />
                            <span className="truncate max-w-[200px]">{cls.videoUrl}</span>
                          </a>
                        )}
                        {cls.resourceLink && (
                          <a
                            href={cls.resourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            <Link2 size={10} />
                            <span>Study Material / Drive</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTogglePublish(cls)}
                      className={`h-8 gap-1.5 text-xs font-bold ${
                        cls.isPublished !== false
                          ? "text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
                          : "text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/30"
                      }`}
                    >
                      {cls.isPublished !== false ? (
                        <>
                          <Eye size={12} />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          <span>Hidden</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenEditModal(cls)}
                      className="h-8 gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-300 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteClass(cls)}
                      className="h-8 p-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                      title="Delete Class"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Video Preview Modal */}
      {previewingVideoClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewingVideoClass(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-extrabold text-sm text-white truncate">
                {previewingVideoClass.title}
              </h4>
              <button
                onClick={() => setPreviewingVideoClass(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 aspect-video w-full rounded-2xl overflow-hidden bg-black">
              {extractYouTubeVideoId(previewingVideoClass.videoUrl || "") ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${extractYouTubeVideoId(previewingVideoClass.videoUrl || "")}?rel=0&autoplay=1`}
                  title={previewingVideoClass.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                  Invalid YouTube link
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
