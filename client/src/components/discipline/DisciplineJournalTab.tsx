import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Lock,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisciplineJournalTabProps {
  selectedDate: string;
  onChangeDate: (d: string) => void;
  journals: any[];
  isLoading: boolean;
  isBn: boolean;
  onSaveJournal: (date: string, content: string) => void;
  onDeleteJournal: (id: number) => void;
}

export function DisciplineJournalTab({
  selectedDate,
  onChangeDate,
  journals,
  isLoading,
  isBn,
  onSaveJournal,
  onDeleteJournal,
}: DisciplineJournalTabProps) {
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingJournalId, setDeletingJournalId] = useState<number | null>(null);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync content with current selected date journal entry
  useEffect(() => {
    const currentEntry = journals.find((j: any) => j.date === selectedDate);
    setContent(currentEntry ? currentEntry.content : "");
    setIsSavedRecently(false);
  }, [selectedDate, journals]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSaveJournal(selectedDate, content.trim());
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const filteredJournals = journals.filter((j: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return j.date.includes(q) || j.content.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER & DATE PICKER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#0284c7] dark:bg-sky-950/50 dark:text-sky-400 flex items-center gap-1">
              <Lock size={11} />
              <span>{isBn ? "ব্যক্তিগত ও সুরক্ষিত" : "100% Private & Scoped"}</span>
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-bold text-slate-500">{journals.length} {isBn ? "টি এন্ট্রি সংরক্ষিত" : "Entries Total"}</span>
          </div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
            {isBn ? "দৈনিক ডিসিপ্লিন ও সাইকোলজি জার্নাল" : "Daily Trader Discipline Journal"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">{isBn ? "তারিখ:" : "Date:"}</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* EDITOR CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <BookOpen size={15} className="text-[#0284c7] dark:text-sky-400" />
              <span>{isBn ? `তারিখের জার্নাল এন্ট্রি (${selectedDate})` : `Reflection for ${selectedDate}`}</span>
            </label>

            {isSavedRecently && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 size={14} />
                <span>{isBn ? "সংরক্ষিত হয়েছে!" : "Saved Successfully!"}</span>
              </span>
            )}
          </div>

          <textarea
            rows={7}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isBn
                ? "আজকের দিনটি আপনার ডিসিপ্লিন অনুযায়ী কেমন কাটল? কোনো ফোমো (FOMO), ওভারট্রেডিং বা রুলস ব্রেকিং হয়েছে কি? আগামীকালের জন্য কী কী সতর্কতা নেবেন..."
                : "How was your discipline execution today? Did you face any emotional hesitation, FOMO, or revenge urge? What is your adjustment for tomorrow?"
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm leading-relaxed outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              {content.length} {isBn ? "অক্ষর" : "characters"}
            </span>

            <Button
              type="submit"
              className="gap-2 bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950 font-bold px-6 rounded-xl"
            >
              <Save size={15} />
              <span>{isBn ? "জার্নাল সংরক্ষণ করুন" : "Save Journal Entry"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* PREVIOUS ENTRIES BROWSER */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {isBn ? "পূর্ববর্তী জার্নাল ইতিহাস" : "Journal History & Archives"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn ? "যে কোনো তারিখের এন্ট্রি দেখতে ক্লিক করুন।" : "Click any previous entry to review or update."}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isBn ? "জার্নালে খুঁজুন..." : "Search past reflections..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center animate-pulse">
            <p className="text-xs text-slate-400">{isBn ? "জার্নাল লোড হচ্ছে..." : "Loading Archives..."}</p>
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <AlertCircle size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-bold">{isBn ? "কোনো জার্নাল রেকর্ড পাওয়া যায়নি" : "No Journal Entries Recorded Yet"}</p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredJournals.map((j: any) => {
              const isCurrent = j.date === selectedDate;
              return (
                <div
                  key={j.id}
                  className={`py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition rounded-2xl p-3 ${
                    isCurrent ? "bg-sky-50/50 dark:bg-sky-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div
                    onClick={() => onChangeDate(j.date)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#0284c7] dark:text-sky-400">
                        {j.date}
                      </span>
                      {isCurrent && (
                        <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[9px] font-extrabold uppercase text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          {isBn ? "বর্তমান তারিখ" : "Active"}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {j.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => onChangeDate(j.date)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Load this Entry"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => setDeletingJournalId(j.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Entry"
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

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingJournalId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeletingJournalId(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isBn ? "জার্নাল ডিলিট করতে চান?" : "Delete this Journal Entry?"}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn
                ? "এই এন্ট্রিটি স্থায়ীভাবে মুছে ফেলা হবে। আপনি কি নিশ্চিত?"
                : "This reflection will be permanently deleted from your private journal history."}
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingJournalId(null)}
                className="font-bold text-xs"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (deletingJournalId) onDeleteJournal(deletingJournalId);
                  setDeletingJournalId(null);
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
