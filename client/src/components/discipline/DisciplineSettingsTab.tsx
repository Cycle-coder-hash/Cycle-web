import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Dumbbell,
  ListTodo,
  Plus,
  Save,
  Sliders,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisciplineSettingsTabProps {
  settings: any;
  tasks: any[];
  exercises: any[];
  isLoading: boolean;
  isBn: boolean;
  onUpdateSettings: (updates: any) => void;
  onAddTask: (t: any) => void;
  onDeleteTask: (id: number) => void;
  onAddExercise: (e: any) => void;
  onDeleteExercise: (id: number) => void;
}

export function DisciplineSettingsTab({
  settings,
  tasks,
  exercises,
  isLoading,
  isBn,
  onUpdateSettings,
  onAddTask,
  onDeleteTask,
  onAddExercise,
  onDeleteExercise,
}: DisciplineSettingsTabProps) {
  const [dailyTarget, setDailyTarget] = useState(80);
  const [forexTarget, setForexTarget] = useState(60);
  const [restTimerSec, setRestTimerSec] = useState(60);
  const [soundAlert, setSoundAlert] = useState(true);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Quick Add Task Form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("08:00 AM");
  const [newTaskMandatory, setNewTaskMandatory] = useState(true);

  // Quick Add Exercise Form
  const [newExName, setNewExName] = useState("");
  const [newExDiff, setNewExDiff] = useState("Intermediate");

  useEffect(() => {
    if (settings) {
      setDailyTarget(settings.dailyTargetPercent ?? 80);
      setForexTarget(settings.dailyForexMinutesTarget ?? 60);
      setRestTimerSec(settings.restTimerDefaultSeconds ?? 60);
      setSoundAlert(settings.restTimerSound !== false);
    }
  }, [settings]);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      dailyTargetPercent: Number(dailyTarget),
      dailyForexMinutesTarget: Number(forexTarget),
      restTimerDefaultSeconds: Number(restTimerSec),
      restTimerSound: soundAlert,
    });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle.trim(),
      time: newTaskTime.trim() || "08:00 AM",
      isMandatory: newTaskMandatory,
      isTrackable: true,
    });
    setNewTaskTitle("");
  };

  const handleQuickAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    onAddExercise({
      name: newExName.trim(),
      difficulty: newExDiff,
    });
    setNewExName("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* PREFERENCES CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#0284c7] dark:text-sky-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "ব্যক্তিগত ডিসিপ্লিন ট্র্যাকিং পছন্দসমূহ" : "Daily Tracking Preferences & Targets"}
            </h3>
          </div>

          {isSavedRecently && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} />
              <span>{isBn ? "সংরক্ষিত হয়েছে!" : "Saved!"}</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSavePreferences} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isBn ? "দৈনিক ডিসিপ্লিন টার্গেট (%)" : "Daily Completion Target (%)"}
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <span className="font-mono font-bold text-sm w-12 text-right">{dailyTarget}%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isBn ? "দৈনিক ফরেক্স অ্যানালাইসিস লক্ষ্য (মিনিট)" : "Daily Forex Study Target (Minutes)"}
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="range"
                  min="15"
                  max="240"
                  step="15"
                  value={forexTarget}
                  onChange={(e) => setForexTarget(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <span className="font-mono font-bold text-sm w-12 text-right">{forexTarget}m</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isBn ? "ডিফল্ট রেস্ট টাইমার (সেকেন্ড)" : "Default Rest Timer Duration"}
              </label>
              <select
                value={restTimerSec}
                onChange={(e) => setRestTimerSec(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value={30}>30 Seconds</option>
                <option value={45}>45 Seconds</option>
                <option value={60}>60 Seconds (1 Min)</option>
                <option value={90}>90 Seconds (1.5 Mins)</option>
                <option value={120}>120 Seconds (2 Mins)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isBn ? "টাইমার সাউন্ড অ্যালার্ট" : "Timer Audio Alert"}
              </label>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundAlert}
                    onChange={(e) => setSoundAlert(e.target.checked)}
                    className="size-4 rounded accent-sky-500"
                  />
                  <span>{isBn ? "সময় শেষ হলে অডিও চিম বাজান" : "Play sound chime on 00:00"}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              className="bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold px-6 rounded-xl"
            >
              <Save size={15} className="mr-1.5" />
              <span>{isBn ? "পছন্দসমূহ সংরক্ষণ করুন" : "Save Preferences"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* TASK MANAGEMENT SETTINGS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ListTodo size={18} className="text-[#0284c7] dark:text-sky-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "রুটিন টাস্ক কনফিগারেশন" : "Daily Task Routine Configuration"}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? "আপনার ব্যক্তিগত শিডিউলের ডিফল্ট টাস্কসমূহ যোগ বা মুছে ফেলুন।" : "Manage the default routine tasks assigned to your schedule."}
          </p>
        </div>

        {/* Quick Add Task Form */}
        <form onSubmit={handleQuickAddTask} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder={isBn ? "নতুন টাস্কের নাম..." : "New task title..."}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />

          <input
            type="text"
            placeholder="08:00 AM"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />

          <Button
            type="submit"
            size="sm"
            className="gap-1.5 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold rounded-xl whitespace-nowrap"
          >
            <Plus size={15} />
            <span>{isBn ? "টাস্ক যোগ" : "Add Task"}</span>
          </Button>
        </form>

        {/* Current Tasks List */}
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="font-mono font-bold text-slate-400">{task.time}</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{task.title}</span>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition ml-2 shrink-0"
                title="Delete Task"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* WORKOUT MANAGEMENT SETTINGS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-orange-500" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "ওয়ার্কআউট ব্যায়াম কনফিগারেশন" : "Workout Exercises Configuration"}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? "আপনার ব্যক্তিগত ওয়ার্কআউট সেশনে অন্তর্ভুক্ত ব্যায়ামের তালিকা।" : "Manage exercises tracked in your physical routine."}
          </p>
        </div>

        {/* Quick Add Exercise Form */}
        <form onSubmit={handleQuickAddExercise} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder={isBn ? "ব্যায়ামের নাম (যেমন: পুশ-আপ)..." : "Exercise name..."}
            value={newExName}
            onChange={(e) => setNewExName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />

          <select
            value={newExDiff}
            onChange={(e) => setNewExDiff(e.target.value)}
            className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <Button
            type="submit"
            size="sm"
            className="gap-1.5 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold rounded-xl whitespace-nowrap"
          >
            <Plus size={15} />
            <span>{isBn ? "ব্যায়াম যোগ" : "Add Exercise"}</span>
          </Button>
        </form>

        {/* Current Exercises List */}
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
          {exercises.map((ex: any) => (
            <div
              key={ex.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{ex.name}</span>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {ex.difficulty}
                </span>
              </div>

              <button
                onClick={() => onDeleteExercise(ex.id)}
                className="p-1 text-slate-400 hover:text-rose-600 transition ml-2 shrink-0"
                title="Delete Exercise"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
