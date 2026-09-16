import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  LineChart,
  Plus,
  Save,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisciplineForexTrackerTabProps {
  selectedDate: string;
  onChangeDate: (d: string) => void;
  forexLogs: any[];
  settings: any;
  isLoading: boolean;
  isBn: boolean;
  onSaveLog: (date: string, minutes: number, pairs?: string, notes?: string) => void;
  onDeleteLog: (id: number) => void;
}

export function DisciplineForexTrackerTab({
  selectedDate,
  onChangeDate,
  forexLogs,
  settings,
  isLoading,
  isBn,
  onSaveLog,
  onDeleteLog,
}: DisciplineForexTrackerTabProps) {
  const [minutes, setMinutes] = useState(60);
  const [pairs, setPairs] = useState("EUR/USD, XAU/USD");
  const [notes, setNotes] = useState("");
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);

  const dailyTarget = settings?.dailyForexMinutesTarget || 60;

  // Sync with current date record if exists
  useEffect(() => {
    const currentLog = forexLogs.find((f: any) => f.date === selectedDate);
    if (currentLog) {
      setMinutes(currentLog.minutes || 0);
      setPairs(currentLog.pairs || "");
      setNotes(currentLog.notes || "");
    } else {
      setMinutes(0);
      setPairs("EUR/USD, XAU/USD");
      setNotes("");
    }
    setIsSavedRecently(false);
  }, [selectedDate, forexLogs]);

  // Calculate stats
  const totalMinutesAllTime = forexLogs.reduce((acc, f: any) => acc + (f.minutes || 0), 0);

  // Weekly minutes
  const now = new Date();
  const getFormatDate = (d: Date) => d.toISOString().split("T")[0];
  let weeklyMinutes = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const log = forexLogs.find((f: any) => f.date === getFormatDate(d));
    if (log) weeklyMinutes += log.minutes || 0;
  }
  const weeklyTarget = dailyTarget * 5; // 5 trading days
  const weeklyProgress = Math.min(100, Math.round((weeklyMinutes / (weeklyTarget || 1)) * 100));

  const handleQuickAddMinutes = (added: number) => {
    setMinutes((prev) => Math.max(0, prev + added));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLog(selectedDate, Number(minutes) || 0, pairs.trim(), notes.trim());
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER WITH STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Today's Analysis */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? "আজকের অ্যানালাইসিস" : "Today's Study Time"}
            </span>
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {minutes} <span className="text-sm font-bold text-slate-400">{isBn ? "মিনিট" : "Mins"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>{isBn ? "দৈনিক লক্ষ্য:" : "Daily Target:"} {dailyTarget}m</span>
              <span className="font-bold text-[#0284c7] dark:text-sky-400">
                {Math.min(100, Math.round((minutes / dailyTarget) * 100))}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((minutes / dailyTarget) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Weekly Total */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? "সাপ্তাহিক মোট অ্যানালাইসিস" : "Weekly Analysis Total"}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {weeklyMinutes} <span className="text-sm font-bold text-slate-400">{isBn ? "মিনিট" : "Mins"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>{isBn ? "টার্গেট:" : "Target:"} {weeklyTarget}m</span>
              <span className="font-bold text-emerald-600">{weeklyProgress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: All-Time Study Hours */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? "মোট চার্ট স্টাডি" : "All-Time Study"}
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <LineChart size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
              {(totalMinutesAllTime / 60).toFixed(1)}{" "}
              <span className="text-sm font-bold text-slate-400">{isBn ? "ঘণ্টা" : "Hours"}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              {isBn ? `মোট সেশন রেকর্ড: ${forexLogs.length}` : `Total sessions logged: ${forexLogs.length}`}
            </p>
          </div>
        </div>
      </div>

      {/* INPUT & LOGGING FORM */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "ফরেক্স মার্কেট অ্যানালাইসিস লগ" : "Log Forex Analysis Session"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn
                ? "প্রতিদিনের মার্কেট চার্ট রিডিং, লিকুইডিটি চিহ্নিতকরণ এবং সেশন পর্যবেক্ষণের সময় রেকর্ড করুন।"
                : "Record time spent marking up HTF bias, CRT models, and live market structure."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">{isBn ? "তারিখ:" : "Date:"}</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onChangeDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isBn ? "অ্যানালাইসিস সময় (মিনিট)" : "Analysis Duration (Minutes)"}
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="1440"
                  required
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value) || 0)}
                  className="w-32 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-mono font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />

                <div className="flex gap-1.5 flex-wrap">
                  {[15, 30, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleQuickAddMinutes(m)}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      +{m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {isBn ? "ফরেক্স পেয়ার / অ্যাসেট" : "Forex Pairs & Assets Analyzed"}
              </label>
              <input
                type="text"
                placeholder="e.g. EUR/USD, GBP/USD, XAU/USD"
                value={pairs}
                onChange={(e) => setPairs(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {isBn ? "টেকনিক্যাল পর্যবেক্ষণ ও গুরুত্বপূর্ণ লেভেল" : "Key Chart Observations & Context"}
            </label>
            <textarea
              rows={3}
              placeholder={
                isBn
                  ? "যেমন: Asian Range High সুইপ হয়েছে, London Open-এ MSS দেখা গেছে, HTF 4H FVG ট্যাপ করেছে..."
                  : "e.g. Asian high swept before London open, 15m MSS confirmed with clean FVG delivery..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSavedRecently ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 size={15} />
                <span>{isBn ? "সফলভাবে সংরক্ষিত হয়েছে!" : "Saved Successfully!"}</span>
              </span>
            ) : (
              <span />
            )}

            <Button
              type="submit"
              className="gap-2 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold px-6 rounded-xl"
            >
              <Save size={15} />
              <span>{isBn ? "লগ সংরক্ষণ করুন" : "Save Analysis Record"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* HISTORICAL RECORDS LIST */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {isBn ? "অ্যানালাইসিস ইতিহাস" : "Forex Analysis History"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn ? "পূর্ববর্তী দিনের চার্ট স্টাডি রেকর্ডস।" : "Previous daily chart analysis logs."}
          </p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center animate-pulse">
            <p className="text-xs text-slate-400">{isBn ? "ইতিহাস লোড হচ্ছে..." : "Loading Analysis Logs..."}</p>
          </div>
        ) : forexLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <AlertCircle size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-bold">{isBn ? "এখনো কোনো অ্যানালাইসিস লগ নেই" : "No Forex Analysis Sessions Logged Yet"}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {forexLogs.map((log: any) => {
              const isCurrent = log.date === selectedDate;
              return (
                <div
                  key={log.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition ${
                    isCurrent
                      ? "border-sky-300 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/20"
                      : "border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/30"
                  }`}
                >
                  <div
                    onClick={() => onChangeDate(log.date)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {log.date}
                      </span>
                      <span className="rounded-md bg-sky-100 px-2 py-0.5 font-mono text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-400">
                        {log.minutes} Mins
                      </span>
                      {log.pairs && (
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          · {log.pairs}
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {log.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onChangeDate(log.date)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Log"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => setDeletingLogId(log.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      {deletingLogId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeletingLogId(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isBn ? "লগ ডিলিট করতে চান?" : "Delete Analysis Log?"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn
                ? "এই অ্যানালাইসিস সেশন রেকর্ডটি মুছে ফেলা হবে। আপনি কি নিশ্চিত?"
                : "This analysis record will be removed from your history."}
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingLogId(null)}
                className="font-bold text-xs"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (deletingLogId) onDeleteLog(deletingLogId);
                  setDeletingLogId(null);
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
