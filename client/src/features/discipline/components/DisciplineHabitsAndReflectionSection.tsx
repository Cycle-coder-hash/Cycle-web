import React from "react";
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  AlertCircle,
  Dumbbell,
  Timer,
  LineChart,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Info,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DisciplineHabitsAndReflectionSectionProps {
  stats: any;
  scheduleData: any;
  workoutData: any;
  forexLogs: any[];
  journals: any[];
  settings: any;
  selectedDate: string;
  isBn: boolean;
  onSelectDate: (d: string) => void;
  onOpenScheduleTab?: () => void;
  onOpenWorkoutTab?: () => void;
  onOpenForexTab?: () => void;
  onOpenJournalTab?: () => void;
}

export function DisciplineHabitsAndReflectionSection({
  stats,
  scheduleData,
  workoutData,
  forexLogs = [],
  journals = [],
  settings,
  selectedDate,
  isBn,
  onSelectDate,
  onOpenScheduleTab,
  onOpenWorkoutTab,
  onOpenForexTab,
  onOpenJournalTab,
}: DisciplineHabitsAndReflectionSectionProps) {
  const { selectText, isRTL } = useLanguage();

  // Schedule task breakdown for selected date
  const tasks = scheduleData?.tasks || [];
  const completedTasks = tasks.filter((t: any) => t.completed);
  const incompleteTasks = tasks.filter((t: any) => !t.completed);
  const totalTasks = tasks.length;
  const progressPercent = scheduleData?.progressPercent ?? (totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0);

  // Workout metrics
  const workoutsWeek = stats?.workoutConsistency?.workoutsThisWeek ?? 0;
  const workoutsMonth = stats?.workoutConsistency?.workoutsThisMonth ?? 0;
  const totalWorkouts = stats?.workoutConsistency?.totalCompleted ?? 0;
  const workoutRate = stats?.workoutConsistency?.consistencyPercent ?? 0;
  const workoutTargetDays = 5; // standard 5 days/wk institutional target

  // Rest timer setting
  const restTimerSeconds = settings?.restTimerDefaultSeconds ?? 60;
  const restTimerSound = settings?.restTimerSound ?? true;

  // Forex metrics
  const forexMinutesToday = stats?.forexConsistency?.minutesToday ?? 0;
  const forexMinutesWeek = stats?.forexConsistency?.minutesThisWeek ?? 0;
  const forexTargetMinutes = stats?.forexConsistency?.targetMinutes ?? (settings?.dailyForexMinutesTarget || 60);
  const forexTargetPercent = Math.min(100, Math.round((forexMinutesToday / (forexTargetMinutes || 1)) * 100));
  const forexAvg = stats?.forexConsistency?.averageMinutesPerDay ?? 0;

  // Journals
  const selectedJournal = journals.find((j: any) => j.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* 2-COLUMN SECTION: B. DAILY ROUTINE ANALYTICS & C. WORKOUT CONSISTENCY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* ========================================================================= */}
        {/* SECTION B: DAILY ROUTINE ANALYTICS */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                  <ClipboardList className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {selectText({
                      en: "Daily Routine Adherence & Tasks",
                      bn: "দৈনিক রুটিন ও টাস্ক পারফরম্যান্স",
                      ur: "روزانہ معمولات اور ٹاسک کی کارکردگی",
                    })}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400 font-bold" dir="ltr">
                    {selectedDate}
                  </span>
                </div>
              </div>

              {onOpenScheduleTab && (
                <button
                  onClick={onOpenScheduleTab}
                  className="text-xs font-bold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{selectText({ en: "View Schedule", bn: "শিডিউল দেখুন", ur: "شیڈول دیکھیں" })}</span>
                  <ChevronRight className={`size-3.5 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {/* Task Completion KPI Progress Bar */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {selectText({
                    en: `${completedTasks.length} of ${totalTasks} Tasks Completed`,
                    bn: `${totalTasks}-এর মধ্যে ${completedTasks.length}টি সম্পন্ন`,
                    ur: `${totalTasks} میں سے ${completedTasks.length} مکمل`,
                  })}
                </span>
                <span className="font-mono font-black text-sm text-cyan-500">{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Incomplete / Missed Tasks Inspector */}
            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>{selectText({ en: "Tasks Status for Selected Date", bn: "নির্বাচিত দিনের টাস্ক তালিকা", ur: "منتخب دن کے ٹاسکس" })}</span>
                <span className="font-mono text-slate-400">{incompleteTasks.length} {selectText({ en: "Pending", bn: "বাকি", ur: "باقی" })}</span>
              </div>

              {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-400">
                  {selectText({
                    en: "No tasks configured for this date yet.",
                    bn: "এই তারিখের জন্য কোনো টাস্ক যোগ করা হয়নি।",
                    ur: "اس تاریخ کے لیے کوئی ٹاسک ترتیب نہیں دیا گیا۔",
                  })}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                        task.completed
                          ? "border-emerald-500/20 bg-emerald-500/5 text-slate-300"
                          : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {task.completed ? (
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="size-4 text-slate-400 shrink-0" />
                        )}
                        <span className={`truncate font-medium ${task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                          {task.title}
                        </span>
                        {task.isMandatory && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                            Required
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0 ml-2" dir="ltr">
                        {task.time || "Anytime"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>{selectText({ en: "Daily Goal: ≥ 80% adherence", bn: "দৈনিক লক্ষ্য: ≥ ৮০% সম্পাদন", ur: "روزانہ کا ہدف: ≥ 80%" })}</span>
            <span className="font-mono">{completedTasks.length}/{totalTasks} ({progressPercent}%)</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION C: WORKOUT CONSISTENCY */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Dumbbell className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {selectText({
                      en: "Workout Habit Consistency",
                      bn: "ওয়ার্কআউট অভ্যাস ও ধারাবাহিকতা",
                      ur: "ورزش کی عادت اور تسلسل",
                    })}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {selectText({
                      en: "Physical discipline reinforces trading focus",
                      bn: "শারীরিক ফিটনেস ট্রেডিং ফোকাস বৃদ্ধি করে",
                      ur: "جسمانی فٹنس ٹریڈنگ فوکس کو مضبوط کرتی ہے",
                    })}
                  </p>
                </div>
              </div>

              {onOpenWorkoutTab && (
                <button
                  onClick={onOpenWorkoutTab}
                  className="text-xs font-bold text-orange-600 hover:text-orange-500 dark:text-orange-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{selectText({ en: "Workout Routine", bn: "ওয়ার্কআউট দেখুন", ur: "ورزش دیکھیں" })}</span>
                  <ChevronRight className={`size-3.5 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {/* Workout KPIs */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">This Week</span>
                <span className="text-xl font-black font-mono text-orange-500 mt-1 block">
                  {workoutsWeek} <span className="text-xs font-medium text-slate-400">/ {workoutTargetDays}d</span>
                </span>
                <span className="text-[10px] text-slate-400">Target Progress</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">This Month</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
                  {workoutsMonth}
                </span>
                <span className="text-[10px] text-slate-400">Total Sessions</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Consistency</span>
                <span className="text-xl font-black font-mono text-emerald-500 mt-1 block">
                  {workoutRate}%
                </span>
                <span className="text-[10px] text-slate-400">{totalWorkouts} Total Days</span>
              </div>
            </div>

            {/* Rest Timer Settings & Telemetry Note */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Timer className="size-4 text-orange-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectText({ en: "Rest Timer Configuration", bn: "রেস্ট টাইমার কনফিগারেশন", ur: "آرام کا ٹائمر کنفیگریشن" })}
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-orange-500">{restTimerSeconds}s</span>
              </div>
              <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-400 leading-relaxed">
                <Info className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {selectText({
                    en: `Default timer set to ${restTimerSeconds}s with ${restTimerSound ? "sound enabled" : "sound muted"}. Note: Per-session timer stop-watch telemetry is not logged in database schema.`,
                    bn: `ডিফল্ট টাইমার ${restTimerSeconds} সেকেন্ডে সেট করা আছে। ডেটাবেজ স্কিমা অনুযায়ী প্রতি সেটের ব্যক্তিগত স্টপওয়াচ টেলিমেট্রি রেকর্ড করা হয় না।`,
                    ur: `طے شدہ ٹائمر ${restTimerSeconds} سیکنڈ پر ترتیب دیا گیا ہے۔ فی سیٹ اسٹاپ واچ ٹیلی میٹری ڈیٹا بیس میں محفوظ نہیں کی جاتی۔`,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>{selectText({ en: "Weekly Target: 5 sessions", bn: "সাপ্তাহিক লক্ষ্য: ৫টি সেশন", ur: "ہفتہ وار ہدف: 5 سیشن" })}</span>
            <span className="font-mono text-orange-400 font-bold">{workoutsWeek}/5 ({workoutRate}%)</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: D. FOREX ANALYSIS HABITS & E. DISCIPLINE JOURNAL & REFLECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* ========================================================================= */}
        {/* SECTION D: FOREX ANALYSIS HABITS */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <LineChart className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {selectText({
                      en: "Forex Market Analysis Habits",
                      bn: "ফরেক্স মার্কেট অ্যানালিসিস অভ্যাস",
                      ur: "فاریکس مارکیٹ تجزیہ کی عادات",
                    })}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {selectText({
                      en: "Time spent backtesting, marking charts, and auditing",
                      bn: "চার্ট পর্যবেক্ষণ ও ব্যাকটেস্টিং সময় পর্যবেক্ষণ",
                      ur: "چارٹ اور تجزیہ پر صرف کیا گیا وقت",
                    })}
                  </p>
                </div>
              </div>

              {onOpenForexTab && (
                <button
                  onClick={onOpenForexTab}
                  className="text-xs font-bold text-sky-600 hover:text-sky-500 dark:text-sky-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{selectText({ en: "Forex Tracker", bn: "ফরেক্স ট্র্যাকার", ur: "فاریکس ٹریکر" })}</span>
                  <ChevronRight className={`size-3.5 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {/* Forex KPI Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Today's Time</span>
                <span className="text-xl font-black font-mono text-sky-500 mt-1 block">
                  {forexMinutesToday}m
                </span>
                <span className="text-[10px] text-slate-400">Goal: {forexTargetMinutes}m</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">7D Total</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
                  {forexMinutesWeek}m
                </span>
                <span className="text-[10px] text-slate-400">Avg {forexAvg}m/day</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Daily Target</span>
                <span className="text-xl font-black font-mono text-emerald-500 mt-1 block">
                  {forexTargetPercent}%
                </span>
                <span className="text-[10px] text-slate-400">{forexLogs.length} Total Logs</span>
              </div>
            </div>

            {/* Recent Analysis Sessions */}
            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Recent Analysis Sessions", bn: "সাম্প্রতিক অ্যানালিসিস লগ", ur: "حالیہ سیشنز" })}
              </div>

              {forexLogs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-400">
                  {selectText({
                    en: "No forex analysis logs documented yet.",
                    bn: "এখনো কোনো অ্যানালিসিস লগ রেকর্ড করা হয়নি।",
                    ur: "ابھی تک کوئی تجزیہ لاگ درج نہیں ہوا۔",
                  })}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {forexLogs.slice(0, 4).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {log.pairs || "Forex Pairs"}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">· {log.date}</span>
                        </div>
                        {log.notes && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{log.notes}</p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-sky-500 shrink-0">
                        {log.minutes} mins
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>{selectText({ en: "Target: 60 mins daily screen study", bn: "লক্ষ্য: প্রতিদিন ৬০ মিনিট চার্ট পর্যবেক্ষণ", ur: "ہدف: روزانہ 60 منٹ مطالعہ" })}</span>
            <span className="font-mono text-sky-400 font-bold">{forexMinutesToday}/{forexTargetMinutes}m</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION E: DISCIPLINE JOURNAL & REFLECTION */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    {selectText({
                      en: "Daily Discipline Reflections",
                      bn: "প্রতিদিনের ডিসিপ্লিন রিফ্লেকশন",
                      ur: "روزانہ ڈسپلن کا عکاس جائزہ",
                    })}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {selectText({
                      en: "Qualitative self-reflection & mental state tracking",
                      bn: "মানসিক অবস্থা ও ট্রেডিং অনুভূতির পর্যবেক্ষণ",
                      ur: "ذہنی حالت اور احساسات کا تجزیہ",
                    })}
                  </p>
                </div>
              </div>

              {onOpenJournalTab && (
                <button
                  onClick={onOpenJournalTab}
                  className="text-xs font-bold text-purple-600 hover:text-purple-500 dark:text-purple-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{selectText({ en: "Reflections Tab", bn: "রিফ্লেকশন ট্যাব", ur: "عکاس جائزہ ٹیب" })}</span>
                  <ChevronRight className={`size-3.5 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {/* Reflection on Selected Date */}
            <div className="mt-4 p-4 rounded-2xl bg-purple-500/[0.04] border border-purple-500/20">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold text-purple-400 flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  <span>{selectText({ en: "Reflection for", bn: "রিফ্লেকশন তারিখ:", ur: "عکاس جائزہ:" })} {selectedDate}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400 font-bold">
                  {selectedJournal ? "Logged ✓" : "Not Logged"}
                </span>
              </div>

              {selectedJournal ? (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic bg-white/40 dark:bg-slate-900/40 p-3 rounded-xl border border-purple-500/15">
                  "{selectedJournal.content}"
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  {selectText({
                    en: "No reflection recorded for this specific date. Documenting daily self-reflections helps build emotional detachment.",
                    bn: "এই তারিখের জন্য কোনো রিফ্লেকশন লেখা হয়নি। প্রতিদিনের মানসিক অবস্থা লিখে রাখলে ইমোশনাল কন্ট্রোল বাড়ে।",
                    ur: "اس تاریخ کے لیے کوئی عکاس جائزہ درج نہیں کیا گیا۔",
                  })}
                </p>
              )}
            </div>

            {/* Historical Reflections List */}
            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {selectText({ en: "Recent Saved Reflections", bn: "সাম্প্রতিক রিফ্লেকশন এন্ট্রি", ur: "حالیہ عکاس جائزے" })}
              </div>

              {journals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-400">
                  {selectText({
                    en: "No discipline journals saved yet.",
                    bn: "এখনো কোনো রিফ্লেকশন সেভ করা হয়নি।",
                    ur: "ابھی تک کوئی ڈسپلن جرنل محفوظ نہیں ہوا۔",
                  })}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {journals.slice(0, 4).map((j: any) => (
                    <button
                      key={j.id}
                      onClick={() => onSelectDate(j.date)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-colors ${
                        selectedDate === j.date
                          ? "border-purple-500/40 bg-purple-500/10 text-slate-200"
                          : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-purple-400">{j.date}</span>
                        <span className="text-[10px] text-slate-500">View Date →</span>
                      </div>
                      <p className="text-[11px] text-slate-300 dark:text-slate-300 line-clamp-1 mt-1">
                        {j.content}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>{selectText({ en: "Mental State Audit", bn: "মানসিক প্রস্তুতি অডিট", ur: "ذہنی حالت کا آڈٹ" })}</span>
            <span className="font-mono text-purple-400 font-bold">{journals.length} {selectText({ en: "Entries Saved", bn: "টি রেকর্ড", ur: "ریکارڈز" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
