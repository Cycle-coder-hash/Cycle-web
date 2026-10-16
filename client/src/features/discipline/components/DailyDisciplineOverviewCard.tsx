import React from "react";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Target,
  Dumbbell,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

interface DailyDisciplineOverviewCardProps {
  isBn: boolean;
  onExplore: () => void;
}

export function DailyDisciplineOverviewCard({
  isBn,
  onExplore,
}: DailyDisciplineOverviewCardProps) {
  const { selectText, isRTL } = useLanguage();
  const { data: stats, isLoading } = trpc.customer.disciplineStats.useQuery(undefined, {
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const todayPercent = stats?.todayPercent ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const weeklyPercent = stats?.weeklyPercent ?? 0;
  const monthlyPercent = stats?.monthlyPercent ?? 0;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-[#081833] via-[#091b3a] to-[#071328] p-4 sm:p-8 text-white shadow-2xl shadow-cyan-950/20 backdrop-blur-xl group transition-all duration-300 hover:border-cyan-500/40">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Left Column: Badge, Title & Description */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-cyan-400 shadow-xs mb-2.5 sm:mb-3.5">
            <Sparkles className="size-3 sm:size-3.5 text-cyan-400" />
            <span className="tracking-wider uppercase">
              {selectText({
                en: "DAILY DISCIPLINE & ROUTINE AUDIT",
                bn: "ডেইলি ডিসিপ্লিন ও রুটিন অডিট",
                ur: "روزانہ ڈسپلن اور معمول کا آڈট",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 shrink-0">
              <Target className="size-4 sm:size-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                {selectText({
                  en: "Daily Discipline Analytics",
                  bn: "ডেইলি ডিসিপ্লিন অ্যানালিটিক্স",
                  ur: "روزانہ ڈسپلن تجزیات",
                })}
              </h3>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectText({
                  en: "Track, audit, and systematically improve your daily trading routines, consistency streaks, workout progress, and forex analysis habits.",
                  bn: "আপনার প্রতিদিনের ট্রেডিং রুটিন, স্ট্রিক্স, ওয়ার্কআউট এবং ফরেক্স মার্কেট অ্যানালিসিস অভ্যাস লাইভ ট্র্যাক ও অডিট করুন।",
                  ur: "اپنے روزانہ کے ٹریڈنگ معمولات، مستقل مزاجی کی اسٹریکس، ورزش کی پیش رفت، اور فاریکس تجزیہ کی عادات کو ٹریک کریں۔",
                })}
              </p>
            </div>
          </div>

          {/* Quick Real-Time Metrics Strip */}
          <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-xl sm:rounded-2xl border border-slate-700/60 bg-slate-900/60 p-2 sm:p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{selectText({ en: "Today", bn: "আজকের স্কোর", ur: "آج" })}</span>
                <CheckCircle2 className="size-3 sm:size-3.5 text-cyan-400" />
              </div>
              <div className="mt-1 text-base sm:text-xl font-black font-mono text-cyan-400">
                {isLoading ? "..." : `${todayPercent}%`}
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-slate-700/60 bg-slate-900/60 p-2 sm:p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{selectText({ en: "Streak", bn: "স্ট্রিক", ur: "اسٹریک" })}</span>
                <Flame className="size-3 sm:size-3.5 text-amber-400" />
              </div>
              <div className="mt-1 text-base sm:text-xl font-black font-mono text-amber-400">
                {isLoading ? "..." : `${currentStreak}d`}
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-slate-700/60 bg-slate-900/60 p-2 sm:p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{selectText({ en: "7D Avg", bn: "৭ দিনের গড়", ur: "7 دن اوسط" })}</span>
                <TrendingUp className="size-3 sm:size-3.5 text-emerald-400" />
              </div>
              <div className="mt-1 text-base sm:text-xl font-black font-mono text-emerald-400">
                {isLoading ? "..." : `${weeklyPercent}%`}
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-slate-700/60 bg-slate-900/60 p-2 sm:p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{selectText({ en: "30D Rate", bn: "৩০ দিনের হার", ur: "30 دن کی شرح" })}</span>
                <LineChart className="size-3 sm:size-3.5 text-sky-400" />
              </div>
              <div className="mt-1 text-base sm:text-xl font-black font-mono text-sky-400">
                {isLoading ? "..." : `${monthlyPercent}%`}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CTA Button */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-2.5 sm:gap-3 shrink-0 pt-1 sm:pt-2 lg:pt-0">
          <Button
            onClick={onExplore}
            size="lg"
            className="group/cta h-10 sm:h-12 px-4 sm:px-6 gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-slate-950 text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>
              {selectText({
                en: "Explore Discipline Analytics →",
                bn: "ডিসিপ্লিন অ্যানালিটিক্স দেখুন →",
                ur: "ڈسپلن تجزیات دیکھیں ←",
              })}
            </span>
            <ArrowRight className={`size-3.5 sm:size-4 transition-transform group-hover/cta:translate-x-1 ${isRTL ? "rotate-180" : ""}`} />
          </Button>

          <span className="text-center sm:text-right text-[10px] sm:text-[11px] font-medium text-slate-400">
            {selectText({
              en: "Real-time habit metrics & historical trends",
              bn: "লাইভ হ্যাবিট মেট্রিক্স ও ঐতিহাসিক ট্রেন্ড",
              ur: "حقیقی وقت کے اعداد و شمار اور رجحانات",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
