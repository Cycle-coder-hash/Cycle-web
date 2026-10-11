import { Check, ChevronRight } from "lucide-react";
import type { DashboardRoadmapStage } from "@/data/roadmapStages";

export type DashboardRoadmapFilter = "all" | "completed" | "todo";

export interface DashboardRoadmapProgressItem {
  lessonId?: number | null;
  completed?: boolean | null;
}

export interface DashboardRoadmapTabProps {
  isBn: boolean;
  roadmapFilter: DashboardRoadmapFilter;
  onSetRoadmapFilter: (filter: DashboardRoadmapFilter) => void;
  dashboardStages: ReadonlyArray<DashboardRoadmapStage>;
  progress: ReadonlyArray<DashboardRoadmapProgressItem> | null | undefined;
  onSelectRoadmapStage: (stage: DashboardRoadmapStage) => void;
  onToggleStageProgress: (payload: { lessonId: number; completed: boolean }) => void;
}

export function DashboardRoadmapTab({
  isBn,
  roadmapFilter,
  onSetRoadmapFilter,
  dashboardStages,
  progress,
  onSelectRoadmapStage,
  onToggleStageProgress,
}: DashboardRoadmapTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isBn ? "১২-স্টেজ ট্রেডিং রিয়েলিটি রোডম্যাপ" : "12-Stage Institutional Roadmap"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? "প্রতিটি স্টেজ ওপেন করে প্রাতিষ্ঠানিক রুলস পড়ুন এবং সম্পন্ন করার পর টিক দিন।"
              : "Master institutional concepts step-by-step. Click any stage to study rules & log notes."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "completed", "todo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onSetRoadmapFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                roadmapFilter === f
                  ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {isBn
                ? f === "all"
                  ? "সবগুলো"
                  : f === "completed"
                  ? "সম্পন্ন"
                  : "বাকি আছে"
                : f}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Stages Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardStages
          .filter((stg) => {
            const isDone = Boolean(progress?.some((p) => p.lessonId === stg.stageNumber && p.completed));
            if (roadmapFilter === "completed") return isDone;
            if (roadmapFilter === "todo") return !isDone;
            return true;
          })
          .map((stg) => {
            const isDone = Boolean(progress?.some((p) => p.lessonId === stg.stageNumber && p.completed));
            return (
              <div
                key={stg.stageNumber}
                onClick={() => onSelectRoadmapStage(stg)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-3xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  isDone
                    ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-white hover:border-[#0284c7]/50 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isDone
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {isBn
                        ? `স্টেজ ${String(stg.stageNumber).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}`
                        : `Stage ${String(stg.stageNumber).padStart(2, "0")}`}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] dark:text-sky-400">
                      {stg.category}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-extrabold group-hover:text-[#0284c7] dark:group-hover:text-sky-400 transition-colors">
                    {stg.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {stg.summary}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-xs font-bold text-[#0284c7] dark:text-sky-400 flex items-center gap-1">
                    <span>{isBn ? "বিস্তারিত দেখুন" : "View Rules & Notes"}</span>
                    <ChevronRight size={13} />
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStageProgress({ lessonId: stg.stageNumber, completed: !isDone });
                    }}
                    className={`rounded-full p-1.5 transition ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800"
                    }`}
                    title={isDone ? "Mark as uncompleted" : "Mark as completed"}
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
