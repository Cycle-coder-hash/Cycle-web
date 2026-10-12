import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCardBorder } from "@/components/AnimatedCardBorder";
import type { StageDetail } from "@/data/roadmapStages";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  HYPE_ITEMS_BN,
  HYPE_ITEMS_EN,
  HYPE_ITEMS_UR,
  REALITY_ITEMS_BN,
  REALITY_ITEMS_EN,
  REALITY_ITEMS_UR,
  ROADMAP_CARD_FLOAT_DELAYS,
} from "../lib/homeStaticData";

export interface HomeRoadmapAndShiftCopy {
  shiftEyebrow: string;
  shiftTitle1: string;
  shiftTitle2: string;
  shiftDesc: string;
  hypeHeader: string;
  realityHeader: string;
  roadmapEyebrow: string;
  roadmapTitle1: string;
  roadmapTitle2: string;
  roadmapDesc: string;
  clickPrompt: string;
  modalStageOf: string;
  modalOutOf: string;
  modalKeyTakeaways: string;
  modalExercise: string;
  modalEdge: string;
  modalPrev: string;
  modalNext: string;
  modalClose: string;
}

export interface HomeRoadmapAndShiftSectionProps {
  isBn: boolean;
  copy: HomeRoadmapAndShiftCopy;
  stagesData: StageDetail[];
  activeStage: number;
  setActiveStage: (stageIndex: number) => void;
  selectedStageModal: number | null;
  setSelectedStageModal: (stageIndex: number | null) => void;
  activeModalData: StageDetail | null;
}

export function HomeRoadmapAndShiftSection({
  isBn,
  copy,
  stagesData,
  activeStage,
  setActiveStage,
  selectedStageModal,
  setSelectedStageModal,
  activeModalData,
}: HomeRoadmapAndShiftSectionProps) {
  const { language, selectText } = useLanguage();

  return (
    <>
      {/* ========================================================================= */}
      {/* THE SHIFT SECTION */}
      {/* ========================================================================= */}
      <section className="content-auto bg-[#f1f5f9] py-16 sm:py-20 dark:bg-[#070e1b] lg:py-28 transition-colors">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="eyebrow">{copy.shiftEyebrow}</p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-[-.03em] text-slate-900 dark:text-white sm:text-5xl">
              {copy.shiftTitle1}
              <br />
              <span className="text-[#51708f] dark:text-sky-400">{copy.shiftTitle2}</span>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-slate-600 dark:text-slate-300 text-base">
              {copy.shiftDesc}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative rounded-3xl border border-rose-200 bg-white p-7 shadow-sm dark:border-rose-900/40 dark:bg-slate-900/90">
              <AnimatedCardBorder color="red" />
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold uppercase tracking-[.18em] text-rose-600 dark:text-rose-400">
                  {copy.hypeHeader}
                </div>
                <AlertOctagon size={16} className="text-rose-500" />
              </div>
              <div className="mt-7 space-y-4 text-sm text-slate-600 dark:text-slate-400">
                {HYPE_ITEMS_EN.map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-full bg-rose-50 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                      {language === "bn"
                        ? String(i + 1).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])
                        : String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-tight">
                      {selectText({ en: HYPE_ITEMS_EN[i], bn: HYPE_ITEMS_BN[i], ur: HYPE_ITEMS_UR[i] })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl bg-[#0d1a2d] p-7 text-white shadow-xl shadow-[#0d1a2d]/25 dark:bg-slate-800 dark:shadow-slate-950/50 border border-slate-700/50">
              <AnimatedCardBorder color="green" />
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold uppercase tracking-[.18em] text-[#38bdf8]">
                  {copy.realityHeader}
                </div>
                <ShieldCheck size={16} className="text-[#38bdf8]" />
              </div>
              <div className="mt-7 space-y-4 text-sm text-slate-300">
                {REALITY_ITEMS_EN.map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-[#38bdf8]">
                      {language === "bn"
                        ? String(i + 1).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])
                        : String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-tight">
                      {selectText({ en: REALITY_ITEMS_EN[i], bn: REALITY_ITEMS_BN[i], ur: REALITY_ITEMS_UR[i] })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ROADMAP SECTION (12 INTERACTIVE STAGES) */}
      {/* ========================================================================= */}
      <section
        id="roadmap"
        className="content-auto bg-white py-16 sm:py-24 dark:bg-[#070e1b] lg:py-32 transition-colors"
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">{copy.roadmapEyebrow}</p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-.03em] text-slate-900 dark:text-white sm:text-5xl">
                {copy.roadmapTitle1}
                <br />
                <span className="text-[#51708f] dark:text-sky-400">{copy.roadmapTitle2}</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {copy.roadmapDesc}
            </p>
          </div>

          {/* 12 Stages Interactive Grid */}
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stagesData.map((stage, i) => {
              const isActive = activeStage === i || selectedStageModal === i;
              return (
                <div
                  key={stage.num}
                  className="roadmap-card-float flex flex-col h-full"
                  style={{
                    animationDelay:
                      ROADMAP_CARD_FLOAT_DELAYS[i] || `${(i * 0.4).toFixed(1)}s`,
                  }}
                >
                  <button
                    onClick={() => {
                      setActiveStage(i);
                      setSelectedStageModal(i);
                    }}
                    className={`group relative h-full w-full rounded-2xl border p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
                      isActive
                        ? "border-[#0d1a2d] bg-[#0d1a2d] text-white shadow-xl shadow-[#0d1a2d]/25 dark:border-sky-400 dark:bg-slate-800"
                        : "border-slate-200 bg-white hover:border-[#0284c7]/50 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-sky-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                            isActive
                              ? "bg-white/10 text-[#38bdf8]"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {stage.num}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? "text-slate-300" : "text-[#0284c7] dark:text-sky-400"
                          }`}
                        >
                          {stage.category}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all group-hover:translate-x-0.5 ${
                          isActive
                            ? "bg-[#38bdf8] text-slate-950"
                            : "bg-slate-100 text-slate-500 group-hover:bg-[#0284c7] group-hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-sky-500 dark:group-hover:text-slate-950"
                        }`}
                      >
                        <ArrowRight size={11} />
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-extrabold leading-snug dark:text-white">
                      {stage.title}
                    </h3>

                    <p
                      className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                        isActive ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {stage.summary}
                    </p>

                    <div className="mt-5 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold dark:border-slate-800">
                      <span
                        className={
                          isActive ? "text-[#38bdf8]" : "text-[#0284c7] dark:text-sky-400"
                        }
                      >
                        {copy.clickPrompt}
                      </span>
                      <ChevronRight
                        size={13}
                        className={
                          isActive ? "text-[#38bdf8]" : "text-[#0284c7] dark:text-sky-400"
                        }
                      />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE STAGE BREAKDOWN MODAL DIALOG */}
      {/* ========================================================================= */}
      {selectedStageModal !== null && activeModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 transition-all duration-300 animate-in fade-in"
          onClick={() => setSelectedStageModal(null)}
        >
          <div
            className={`relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 scale-100 animate-in zoom-in-95 ${
              language === "bn" ? "font-bangla" : language === "ur" ? "font-urdu" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Stage Badge & Close Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-xl bg-[#0284c7]/15 font-mono text-xs font-bold text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-400">
                  {activeModalData.num}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {copy.modalStageOf} {activeModalData.num} {copy.modalOutOf} •{" "}
                  {activeModalData.category}
                </span>
              </div>

              <button
                onClick={() => setSelectedStageModal(null)}
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                title={copy.modalClose}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-6">
              {/* Title & Core Overview */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {activeModalData.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                  {activeModalData.summary}
                </p>
              </div>

              {/* Key Takeaways / What You Will Master */}
              {activeModalData.keyPoints.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    <Target size={15} className="text-[#0284c7] dark:text-sky-400" />
                    <span>
                      {activeModalData.category === "GATE — COURSES"
                        ? "GATE — COURSES"
                        : copy.modalKeyTakeaways}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2.5">
                    {activeModalData.keyPoints.map((point, idx) => {
                      const [heading, ...descParts] = point.split("\n");
                      const desc = descParts.join("\n");
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2
                            size={15}
                            className="mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400"
                          />
                          <div className="leading-snug">
                            {desc ? (
                              <>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {heading}
                                </div>
                                <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                  {desc}
                                </div>
                              </>
                            ) : (
                              <span>{point}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Practical Exercise Box */}
              {Boolean(activeModalData.exercise) && (
                <div className="rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4 sm:p-5 dark:border-sky-900/50 dark:bg-sky-950/20">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0369a1] dark:text-sky-400">
                    <Lightbulb size={15} />
                    <span>{copy.modalExercise}</span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                    {activeModalData.exercise}
                  </p>
                </div>
              )}

              {/* Institutional Edge Note */}
              {Boolean(activeModalData.edge) && (
                <div className="flex items-start gap-3 rounded-2xl bg-[#0d1a2d] p-4 text-white dark:bg-slate-800">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#38bdf8]" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#38bdf8]">
                      {copy.modalEdge}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-300">
                      {activeModalData.edge}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Navigation Footer */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedStageModal === 0}
                onClick={() => {
                  const prev = Math.max(0, (selectedStageModal || 0) - 1);
                  setSelectedStageModal(prev);
                  setActiveStage(prev);
                }}
                className="gap-1 text-xs font-bold border-slate-200 dark:border-slate-700"
              >
                <ChevronLeft size={15} />
                <span>{copy.modalPrev}</span>
              </Button>

              <div className="text-xs font-mono font-bold text-slate-400">
                {selectedStageModal + 1} / 12
              </div>

              <Button
                size="sm"
                disabled={selectedStageModal === 11}
                onClick={() => {
                  const next = Math.min(11, (selectedStageModal || 0) + 1);
                  setSelectedStageModal(next);
                  setActiveStage(next);
                }}
                className="gap-1 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
              >
                <span>{copy.modalNext}</span>
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
