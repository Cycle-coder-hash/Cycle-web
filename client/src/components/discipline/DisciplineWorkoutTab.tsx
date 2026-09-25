import { useState, useEffect, useRef } from "react";
import {
  Check,
  Dumbbell,
  Edit2,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
  Volume2,
  VolumeX,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisciplineWorkoutTabProps {
  selectedDate: string;
  workoutData: any;
  isLoading: boolean;
  isBn: boolean;
  onToggleExercise: (exerciseId: number, completed: boolean) => void;
  onAddExercise: (ex: { name: string; difficulty: string }) => void;
  onUpdateExercise: (id: number, updates: any) => void;
  onDeleteExercise: (id: number) => void;
  isLocked?: boolean;
  onUpgradeClick?: () => void;
}

export function DisciplineWorkoutTab({
  selectedDate,
  workoutData,
  isLoading,
  isBn,
  onToggleExercise,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  isLocked = false,
  onUpgradeClick,
}: DisciplineWorkoutTabProps) {
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-in fade-in duration-300">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/10">
          <Dumbbell className="size-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
          <Sparkles className="size-3.5" />
          <span>PRO & PREMIUM FEATURE</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {isBn ? "ওয়ার্কআউট রুটিন ও অডিও টাইমার লকড" : "Trader Workout Protocol Locked"}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          {isBn
            ? "শারীরিক সুস্থতা ট্রেডারের মানসিক শৃঙ্খলার ভিত্তি। প্রো অথবা প্রিমিয়াম প্ল্যানে আপগ্রেড করে কাস্টম এক্সারসাইজ ও ডুয়াল-টোন অডিও টাইমার আনলক করুন।"
            : "Physical fitness drives peak cognitive focus in trading. Upgrade to Pro or Premium to unlock structured daily exercises, customizable routines, and institutional dual-tone audio rest timers."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onUpgradeClick}
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs px-6 py-2.5 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 gap-2 cursor-pointer"
          >
            <Sparkles className="size-4" />
            <span>{isBn ? "প্রো বা প্রিমিয়ামে আপগ্রেড করুন" : "Upgrade to Pro / Premium"}</span>
          </Button>
        </div>
      </div>
    );
  }
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any | null>(null);
  const [deletingExerciseId, setDeletingExerciseId] = useState<number | null>(null);

  // Form states
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseDifficulty, setExerciseDifficulty] = useState("Intermediate");

  // Functional Rest Timer state
  const [timerDuration, setTimerDuration] = useState(60); // seconds
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize Web Audio chime
  const playTimerChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Dual tone institutional chime
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(784, now); // G5
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(523.25, now); // C5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.9);
      osc2.stop(now + 0.9);
    } catch (err) {
      console.warn("Audio alert failed", err);
    }
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            playTimerChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, soundEnabled]);

  const handleStartTimer = () => {
    if (timeLeft === 0) setTimeLeft(timerDuration);
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerDuration);
  };

  const handleSelectPreset = (seconds: number) => {
    setIsTimerRunning(false);
    setTimerDuration(seconds);
    setTimeLeft(seconds);
  };

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const exercises = workoutData?.exercises || [];
  const completedCount = exercises.filter((e: any) => e.completed).length;
  const progressPercent = workoutData?.progressPercent ?? (exercises.length ? Math.round((completedCount / exercises.length) * 100) : 0);

  const handleOpenAdd = () => {
    setExerciseName("");
    setExerciseDifficulty("Intermediate");
    setShowAddModal(true);
  };

  const handleOpenEdit = (ex: any) => {
    setEditingExercise(ex);
    setExerciseName(ex.name);
    setExerciseDifficulty(ex.difficulty || "Intermediate");
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    onAddExercise({
      name: exerciseName.trim(),
      difficulty: exerciseDifficulty,
    });
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise || !exerciseName.trim()) return;
    onUpdateExercise(editingExercise.id, {
      name: exerciseName.trim(),
      difficulty: exerciseDifficulty,
    });
    setEditingExercise(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* REST TIMER & QUICK STATS BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Functional Rest Timer Card */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-[#0284c7] dark:text-sky-400" />
              <span className="font-extrabold text-sm">
                {isBn ? "রেস্ট টাইমার" : "Functional Rest Timer"}
              </span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title={soundEnabled ? "Sound Enabled" : "Sound Muted"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {/* Timer Display */}
          <div className="my-5 text-center">
            <div className="font-mono text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {formatTimerDigits(timeLeft)}
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isTimerRunning
                ? isBn
                  ? "কাউন্টডাউন চলছে..."
                  : "REST IN PROGRESS..."
                : timeLeft === 0
                ? isBn
                  ? "রেস্ট সম্পন্ন! পরের সেটে যান"
                  : "TIME'S UP! NEXT SET"
                : isBn
                ? "বিরাম টাইমার রেডি"
                : "READY"}
            </div>
          </div>

          {/* Timer Presets */}
          <div className="flex justify-center gap-1.5 mb-4">
            {[30, 45, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => handleSelectPreset(sec)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold transition ${
                  timerDuration === sec
                    ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {isTimerRunning ? (
              <Button
                onClick={handlePauseTimer}
                className="w-full gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                <Pause size={15} />
                <span>{isBn ? "পজ করুন" : "Pause"}</span>
              </Button>
            ) : (
              <Button
                onClick={handleStartTimer}
                className="w-full gap-1.5 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold"
              >
                <Play size={15} />
                <span>{isBn ? "শুরু করুন" : "Start Rest"}</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleResetTimer}
              className="px-3 border-slate-200 dark:border-slate-800"
              title="Reset Timer"
            >
              <RotateCcw size={15} />
            </Button>
          </div>
        </div>

        {/* Workout Progress & Highlights Card */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  {isBn ? "দৈনিক ফিটনেস রুটিন" : "PHYSICAL DISCIPLINE"}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                  {isBn ? "আজকের ওয়ার্কআউট চেকলিস্ট" : "Workout Routine & Completion"}
                </h3>
              </div>

              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="gap-1.5 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold rounded-xl"
              >
                <Plus size={15} />
                <span>{isBn ? "ব্যায়াম যোগ করুন" : "Add Exercise"}</span>
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {completedCount} / {exercises.length}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? "ব্যায়াম সম্পন্ন হয়েছে" : "Exercises Completed"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-orange-500">
                  {progressPercent}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? "আজকের সম্পন্ন হার" : "Routine Completion"}
                </div>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span>
              {isBn
                ? "শারীরিক ফিটনেস ট্রেডারের মানসিক স্থিতি ও ডিসিপ্লিন নিশ্চিত করে। প্রতিটি সেট শেষে রেস্ট টাইমার ব্যবহার করুন।"
                : "Physical stamina sharpens your chart focus and prevents impulsive tilt. Use the rest timer between sets."}
            </span>
          </div>
        </div>
      </div>

      {/* EXERCISE LIST */}
      {isLoading ? (
        <div className="py-16 text-center animate-pulse">
          <div className="mx-auto size-10 rounded-full bg-slate-200 dark:bg-slate-800 mb-2" />
          <p className="text-xs text-slate-400 font-bold">{isBn ? "ব্যায়াম লোড হচ্ছে..." : "Loading Exercises..."}</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-slate-800">
          <AlertCircle size={36} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {isBn ? "কোনো ব্যায়ামের তালিকা নেই" : "No Exercises Found"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {isBn ? "আপনার ব্যক্তিগত ব্যায়ামের রুটিন তৈরি করতে 'ব্যায়াম যোগ করুন' বাটনে ক্লিক করুন।" : "Click 'Add Exercise' to build your personal workout routine."}
          </p>
          <Button onClick={handleOpenAdd} size="sm" className="mt-4 gap-1.5 font-bold">
            <Plus size={15} /> {isBn ? "ব্যায়াম যোগ করুন" : "Add Your First Exercise"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exercises.map((ex: any) => {
            const isChecked = ex.completed;
            return (
              <div
                key={ex.id}
                className={`group flex items-center justify-between rounded-2xl border p-4 transition-all duration-150 ${
                  isChecked
                    ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                {/* Left: Checkbox + Name + Difficulty */}
                <div
                  onClick={() => onToggleExercise(ex.id, !isChecked)}
                  className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExercise(ex.id, !isChecked);
                    }}
                    className={`size-6 shrink-0 rounded-lg flex items-center justify-center border transition ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-orange-500"
                    }`}
                  >
                    {isChecked && <Check size={14} className="stroke-[3]" />}
                  </button>

                  <div>
                    <div
                      className={`text-sm font-extrabold transition ${
                        isChecked ? "line-through opacity-70 text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {ex.name}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          ex.difficulty === "Advanced"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                            : ex.difficulty === "Intermediate"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}
                      >
                        {ex.difficulty || "Intermediate"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleOpenEdit(ex)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Exercise"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => setDeletingExerciseId(ex.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Exercise"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================= */}
      {/* ADD EXERCISE MODAL */}
      {/* ======================================================================= */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn ? "নতুন ব্যায়াম যোগ করুন" : "Add New Exercise"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {isBn ? "ব্যায়ামের নাম" : "Exercise Name & Sets/Reps"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? "যেমন: পুশ-আপ (৩ সেট ফেইলিউর)" : "e.g. Incline Dumbbell Press (4 x 10)"}
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  {isBn ? "কঠিনতার স্তর" : "Difficulty Level"}
                </label>
                <select
                  value={exerciseDifficulty}
                  onChange={(e) => setExerciseDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Beginner">{isBn ? "সহজ (Beginner)" : "Beginner"}</option>
                  <option value="Intermediate">{isBn ? "মাঝারি (Intermediate)" : "Intermediate"}</option>
                  <option value="Advanced">{isBn ? "কঠিন (Advanced)" : "Advanced"}</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold"
                >
                  {isBn ? "ব্যায়াম সংরক্ষণ করুন" : "Save Exercise"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* EDIT EXERCISE MODAL */}
      {/* ======================================================================= */}
      {editingExercise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setEditingExercise(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isBn ? "ব্যায়াম এডিট করুন" : "Edit Exercise"}
              </h3>
              <button
                onClick={() => setEditingExercise(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {isBn ? "ব্যায়ামের নাম" : "Exercise Name"}
                </label>
                <input
                  type="text"
                  required
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  {isBn ? "কঠিনতার স্তর" : "Difficulty Level"}
                </label>
                <select
                  value={exerciseDifficulty}
                  onChange={(e) => setExerciseDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Beginner">{isBn ? "সহজ (Beginner)" : "Beginner"}</option>
                  <option value="Intermediate">{isBn ? "মাঝারি (Intermediate)" : "Intermediate"}</option>
                  <option value="Advanced">{isBn ? "কঠিন (Advanced)" : "Advanced"}</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold"
                >
                  {isBn ? "আপডেট সংরক্ষণ করুন" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DELETE EXERCISE DIALOG */}
      {/* ======================================================================= */}
      {deletingExerciseId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeletingExerciseId(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isBn ? "ব্যায়াম ডিলিট করতে চান?" : "Delete this Exercise?"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn
                ? "এই ব্যায়ামটি আপনার তালিকা থেকে মুছে ফেলা হবে। আপনি কি নিশ্চিত?"
                : "This exercise will be removed from your workout routine list. Are you sure?"}
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingExerciseId(null)}
                className="font-bold text-xs"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (deletingExerciseId) onDeleteExercise(deletingExerciseId);
                  setDeletingExerciseId(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {isBn ? "ডিলিট করুন" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
