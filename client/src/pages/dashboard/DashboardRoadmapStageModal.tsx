import { Check, CheckCircle2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardRoadmapStage } from "@/data/roadmapStages";
import { useLanguage } from "@/contexts/LanguageContext";

export interface DashboardRoadmapStageModalProps {
  stage: DashboardRoadmapStage | null;
  isBn?: boolean;
  stageNote: string;
  isCompleted: boolean;
  onClose: () => void;
  onSaveStageNote: (stageNumber: number, note: string) => void;
  onToggleProgress: (stageNumber: number, completed: boolean) => void;
}

export function DashboardRoadmapStageModal({
  stage,
  stageNote,
  isCompleted,
  onClose,
  onSaveStageNote,
  onToggleProgress,
}: DashboardRoadmapStageModalProps) {
  const { selectText, isUr, isRTL } = useLanguage();

  if (!stage) return null;

  const stageBadgeText = selectText({
    en: `STAGE ${String(stage.stageNumber).padStart(2, "0")}`,
    bn: `স্টেজ ${String(stage.stageNumber).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}`,
    ur: `مرحلہ ${String(stage.stageNumber).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}`,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${
          isUr ? "font-urdu" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-sky-500/10 dark:text-sky-400">
                {stageBadgeText}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stage.category}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
              {stage.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
            aria-label={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-5 text-sm">
          {/* Summary / Overview */}
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0284c7] dark:text-sky-400 mb-2">
              {selectText({
                en: "Stage Overview & Objective",
                bn: "ওভারভিউ ও মূল লক্ষ্য",
                ur: "مرحلہ کا جائزہ اور بنیادی مقصد",
              })}
            </h4>
            <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {stage.summary}
            </p>
          </div>

          {/* Core Topics & Rules */}
          {stage.keyPoints && stage.keyPoints.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0284c7] dark:text-sky-400 shrink-0" />
                <span>
                  {selectText({
                    en: "Core Topics & Institutional Rules",
                    bn: "মূল বিষয়সমূহ ও প্রাতিষ্ঠানিক রুলস",
                    ur: "اہم موضوعات اور ادارہ جاتی اصول",
                  })}
                </span>
              </h4>
              <div className="space-y-2.5">
                {stage.keyPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs sm:text-sm text-slate-700 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-300"
                  >
                    <span
                      dir="ltr"
                      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-100 font-mono text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-400 mt-0.5"
                    >
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Exercise (if present) */}
          {stage.exercise && (
            <div className="rounded-2xl border border-sky-200/60 bg-sky-50/50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles size={14} className="shrink-0" />
                <span>
                  {selectText({
                    en: "Practical Exercise & Chart Task",
                    bn: "প্র্যাকটিক্যাল এক্সারসাইজ / অ্যাসাইনমেন্ট",
                    ur: "عملی مشق اور چارٹ ٹاسک",
                  })}
                </span>
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {stage.exercise}
              </p>
            </div>
          )}

          {/* Institutional Edge (if present) */}
          {stage.edge && (
            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                {selectText({
                  en: "Institutional Edge",
                  bn: "প্রাতিষ্ঠানিক ট্রেডারদের দৃষ্টিভঙ্গি (Edge)",
                  ur: "ادارہ جاتی برتری (Institutional Edge)",
                })}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {stage.edge}
              </p>
            </div>
          )}

          {/* Personal Study Notes */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {selectText({
                en: "Your Personal Study Notes",
                bn: "আপনার স্টাডি নোট ও ব্যক্তিগত রিমাইন্ডার",
                ur: "آپ کے ذاتی اسٹڈی نوٹس اور یاد دہانیاں",
              })}
            </label>
            <textarea
              rows={3}
              value={stageNote}
              onChange={(e) => onSaveStageNote(stage.stageNumber, e.target.value)}
              placeholder={selectText({
                en: "Jot down your key takeaways, chart observations, or rules for this stage...",
                bn: "এই স্টেজ থেকে আপনার ব্যক্তিগত পর্যবেক্ষণ ও গুরুত্বপূর্ণ রুলস লিখে রাখুন...",
                ur: "اس مرحلے سے اپنے اہم مشاہدات اور بنیادی اصول درج کریں...",
              })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm outline-none focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Bottom Actions: Progress Completion Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              onClick={() => onToggleProgress(stage.stageNumber, !isCompleted)}
              className={`w-full sm:w-auto gap-2 font-bold ${
                isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950"
              }`}
            >
              <Check size={16} />
              <span>
                {isCompleted
                  ? selectText({
                      en: "Completed (Click to uncheck)",
                      bn: "সম্পন্ন হয়েছে (আনচেক করতে ক্লিক করুন)",
                      ur: "مکمل ہو گیا (ان چیک کرنے کے لیے کلک کریں)",
                    })
                  : selectText({
                      en: "Mark Stage as Completed",
                      bn: "স্টেজ সম্পন্ন হিসেবে মার্ক করুন",
                      ur: "مرحلے کو مکمل کے طور پر نشان زد کریں",
                    })}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto font-bold"
            >
              {selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
