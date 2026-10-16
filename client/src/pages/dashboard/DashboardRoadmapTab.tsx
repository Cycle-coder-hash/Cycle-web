import { Check, ChevronRight } from "lucide-react";
import type { DashboardRoadmapStage } from "@/data/roadmapStages";
import { useLanguage } from "@/contexts/LanguageContext";

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
  isBn: _isBn,
  roadmapFilter,
  onSetRoadmapFilter,
  dashboardStages,
  progress,
  onSelectRoadmapStage,
  onToggleStageProgress,
}: DashboardRoadmapTabProps) {
  const { language, isRTL, selectText } = useLanguage();
  const isBn = language === "bn";
  const isUr = language === "ur";

  return (
    <div
      className={`space-y-4 sm:space-y-6 animate-in fade-in duration-300 ${
        isBn ? "font-bangla" : isUr ? "font-urdu" : ""
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex flex-col justify-between gap-3 sm:gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {selectText({
              en: "12-Stage Institutional Roadmap",
              bn: "১২-স্টেজ ট্রেডিং রিয়েলিটি রোডম্যাপ",
              ur: "12-مرحلہ ادارہ جاتی روڈ میپ",
            })}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {selectText({
              en: "Master institutional concepts step-by-step. Click any stage to study rules & log notes.",
              bn: "প্রতিটি স্টেজ ওপেন করে প্রাতিষ্ঠানিক রুলস পড়ুন এবং সম্পন্ন করার পর টিক দিন।",
              ur: "ادارہ جاتی تصورات پر مرحلہ وار عبور حاصل کریں۔ قواعد کا مطالعہ کرنے اور نوٹس درج کرنے کے لیے کسی بھی مرحلے پر کلک کریں۔",
            })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {(["all", "completed", "todo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onSetRoadmapFilter(f)}
              className={`rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold capitalize transition cursor-pointer ${
                roadmapFilter === f
                  ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {f === "all"
                ? selectText({ en: "All", bn: "সবগুলো", ur: "تمام" })
                : f === "completed"
                ? selectText({ en: "Completed", bn: "সম্পন্ন", ur: "مکمل" })
                : selectText({ en: "To-Do", bn: "বাকি আছে", ur: "باقی" })}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Stages Cards Grid */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  isDone
                    ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-white hover:border-[#0284c7]/50 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-lg ${
                        isDone
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {isBn
                        ? `স্টেজ ${String(stg.stageNumber).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}`
                        : isUr
                        ? `مرحلہ ${String(stg.stageNumber).padStart(2, "0")}`
                        : `Stage ${String(stg.stageNumber).padStart(2, "0")}`}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#0284c7] dark:text-sky-400">
                      {stg.category}
                    </span>
                  </div>

                  <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-extrabold group-hover:text-[#0284c7] dark:group-hover:text-sky-400 transition-colors">
                    {stg.title}
                  </h3>
                  <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {stg.summary}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 flex items-center justify-between border-t border-slate-100 pt-3 sm:pt-4 dark:border-slate-800">
                  <span className="text-[11px] sm:text-xs font-bold text-[#0284c7] dark:text-sky-400 flex items-center gap-1">
                    <span>{selectText({ en: "View Rules & Notes", bn: "বিস্তারিত দেখুন", ur: "قواعد و نوٹس دیکھیں" })}</span>
                    <ChevronRight size={13} className={isRTL ? "rotate-180" : ""} />
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStageProgress({ lessonId: stg.stageNumber, completed: !isDone });
                    }}
                    className={`rounded-full p-1.5 transition cursor-pointer ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800"
                    }`}
                    title={
                      isDone
                        ? selectText({ en: "Mark as uncompleted", bn: "অসম্পন্ন হিসেবে চিহ্নিত করুন", ur: "نامکمل کے طور پر نشان زد کریں" })
                        : selectText({ en: "Mark as completed", bn: "সম্পন্ন হিসেবে চিহ্নিত করুন", ur: "مکمل کے طور پر نشان زد کریں" })
                    }
                  >
                    <Check size={13} className="sm:size-[14px]" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
