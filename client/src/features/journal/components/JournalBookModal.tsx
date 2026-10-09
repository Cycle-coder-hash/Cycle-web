import React, { useState, useEffect } from "react";
import { X, BookOpen, Plus, Trash2, ShieldCheck, Sparkles, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalBook, JournalRule } from "@/types/journal";

interface JournalBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookData: Omit<JournalBook, "id" | "createdAt">) => void;
  onUpdate?: (book: JournalBook) => void;
  initialBook?: JournalBook | null;
  isBn?: boolean;
}

const RULE_SUGGESTIONS = [
  "Maximum risk per trade is strictly 1% of account balance.",
  "Always wait for 4H/1H Market Structure Shift (MSS) before entry.",
  "Minimum Risk:Reward ratio must be at least 1:2.5.",
  "Never trade 15 minutes before or after high-impact red news.",
  "Move Stop Loss to Break-Even only after 1R target is reached.",
  "No more than 2 trades per session. Stop immediately if 2 losses occur.",
];

export function JournalBookModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialBook,
  isBn = false,
}: JournalBookModalProps) {
  if (!isOpen) return null;

  const isEditing = !!initialBook;

  const [name, setName] = useState(initialBook?.name || "");
  const [strategy, setStrategy] = useState(initialBook?.strategy || "");
  const [startingBalance, setStartingBalance] = useState<number>(
    initialBook?.startingBalance ?? 10000
  );
  const [currency, setCurrency] = useState(initialBook?.currency || "$");
  const [description, setDescription] = useState(initialBook?.description || "");
  const [rules, setRules] = useState<JournalRule[]>(
    initialBook?.rules || [
      { id: "r1", text: "Maximum risk per trade is strictly 1% of account balance." },
      { id: "r2", text: "Always wait for market structure confirmation before entry." },
    ]
  );
  const [newRuleText, setNewRuleText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBook) {
      setName(initialBook.name);
      setStrategy(initialBook.strategy || "");
      setStartingBalance(initialBook.startingBalance);
      setCurrency(initialBook.currency || "$");
      setDescription(initialBook.description || "");
      setRules(initialBook.rules || []);
    } else {
      setName("");
      setStrategy("");
      setStartingBalance(10000);
      setCurrency("$");
      setDescription("");
      setRules([
        { id: "r1", text: "Maximum risk per trade is strictly 1% of account balance." },
        { id: "r2", text: "Always wait for market structure confirmation before entry." },
      ]);
    }
    setError(null);
  }, [initialBook, isOpen]);

  const handleAddRule = (textToAdd?: string) => {
    const text = (textToAdd || newRuleText).trim();
    if (!text) return;
    if (rules.some((r) => r.text.toLowerCase() === text.toLowerCase())) {
      return;
    }
    const newRule: JournalRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text,
    };
    setRules([...rules, newRule]);
    if (!textToAdd) setNewRuleText("");
  };

  const handleRemoveRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isBn ? "অনুগ্রহ করে একটি জার্নাল নাম দিন।" : "Please enter a Journal Book name.");
      return;
    }
    if (startingBalance < 0 || isNaN(startingBalance)) {
      setError(isBn ? "সঠিক প্রারম্ভিক ব্যালেন্স দিন।" : "Please provide a valid starting balance.");
      return;
    }

    if (isEditing && initialBook && onUpdate) {
      onUpdate({
        ...initialBook,
        name: name.trim(),
        strategy: strategy.trim(),
        startingBalance,
        currency,
        description: description.trim(),
        rules,
      });
    } else {
      onSave({
        name: name.trim(),
        strategy: strategy.trim(),
        startingBalance,
        currency,
        description: description.trim(),
        rules,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-auto text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {isEditing
                  ? (isBn ? "জার্নাল বুক সম্পাদনা করুন" : "Edit Journal Book")
                  : (isBn ? "নতুন জার্নাল বুক তৈরি করুন" : "Create New Journal Book")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? "আলাদা স্ট্র্যাটেজি ও ক্যাপিটাল ট্র্যাক করার জন্য স্বাধীন জার্নাল সেটআপ করুন"
                  : "Organize separate strategies, independent initial capitals, and custom trading rules"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-semibold text-rose-500">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {isBn ? "জার্নাল বুকের নাম *" : "Journal Book Name *"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBn ? "যেমন: SMC Strategy Journal" : "e.g., SMC Strategy Journal"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Strategy */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {isBn ? "ট্রেডিং স্ট্র্যাটেজি / মডেল" : "Strategy / Model Name"}
              </label>
              <input
                type="text"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder={isBn ? "যেমন: Smart Money Concepts / FVG" : "e.g., ICT Silver Bullet / SMC"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Starting Balance */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {isBn ? "প্রারম্ভিক ব্যালেন্স (Starting Balance) *" : "Starting Balance *"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
                  placeholder="10000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {isBn ? "এই জার্নালের সমস্ত P&L এবং Growth % এই ক্যাপিটাল থেকে হিসেব হবে।" : "Current balance, Net P&L, and Growth % are strictly calculated from this capital."}
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {isBn ? "মুদ্রা প্রতীক" : "Currency"}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="৳">BDT (৳)</option>
                <option value="₹">INR (₹)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {isBn ? "বিবরণ / জার্নাল নোট" : "Strategy Description & Objective"}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isBn ? "এই জার্নাল বইয়ের মূল নিয়ম বা লক্ষ্য সংক্ষেপে লিখুন..." : "Key session focus, pairs traded, edge description..."}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-normal text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Rules Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isBn ? "ট্রেডিং ডিসিপ্লিন ও স্ট্র্যাটেজি রুলস" : "Strategy Rules & Discipline Checklist"}
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {rules.length} {isBn ? "টি রুল" : "rules active"}
              </span>
            </div>

            {/* Quick Suggestions */}
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                {isBn ? "কুইক রুল টেমপ্লেট:" : "Quick Rule Templates:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {RULE_SUGGESTIONS.slice(0, 3).map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddRule(sug)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-cyan-500 hover:text-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-300 transition-colors"
                  >
                    + {sug.length > 35 ? sug.slice(0, 35) + "..." : sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Rule Input */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                placeholder={isBn ? "নতুন রুল লিখুন এবং যোগ করুন..." : "Type custom rule and press Enter..."}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <Button
                type="button"
                onClick={() => handleAddRule()}
                variant="outline"
                className="rounded-xl border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 text-xs font-bold gap-1 py-2 h-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                {isBn ? "যোগ করুন" : "Add Rule"}
              </Button>
            </div>

            {/* Rules List */}
            {rules.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">
                {isBn ? "এখনো কোনো রুল যোগ করা হয়নি।" : "No strategy rules added yet. Add rules above to track discipline."}
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {rules.map((rule, idx) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 text-[10px] font-black text-cyan-500">
                        {idx + 1}
                      </span>
                      <span className="font-medium leading-relaxed">{rule.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-bold text-slate-600 dark:text-slate-300"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 font-black text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              {isEditing
                ? (isBn ? "পরিবর্তন সংরক্ষণ করুন" : "Save Changes")
                : (isBn ? "জার্নাল বুক তৈরি করুন" : "Create Journal Book")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
