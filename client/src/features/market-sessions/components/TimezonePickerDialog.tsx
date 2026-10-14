import React, { useState, useMemo } from "react";
import { Search, X, Globe, Check, Sparkles, Laptop } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface TimezonePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TimezonePickerDialog({ isOpen, onClose }: TimezonePickerDialogProps) {
  const { selectText } = useLanguage();
  const { timezone, setTimezone, isAutoTimezone, deviceTimezone, allTimezones } = useUserPreferences();
  const [search, setSearch] = useState("");

  // Get full list of canonical IANA time zones
  const allIanaZones = useMemo(() => {
    try {
      if (typeof Intl !== "undefined" && typeof (Intl as any).supportedValuesOf === "function") {
        return (Intl as any).supportedValuesOf("timeZone") as string[];
      }
    } catch {}
    return allTimezones.map((t) => t.value);
  }, [allTimezones]);

  const filteredZones = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      // If no query, return empty so we show popular timezones
      return [];
    }
    return allIanaZones
      .filter((tz) => {
        const lower = tz.toLowerCase();
        return lower.includes(q) || lower.replace(/_/g, " ").includes(q);
      })
      .slice(0, 50); // limit to top 50 for performance
  }, [search, allIanaZones]);

  if (!isOpen) return null;

  const handleSelectAuto = async () => {
    await setTimezone(null);
    onClose();
  };

  const handleSelectZone = async (tz: string) => {
    await setTimezone(tz);
    onClose();
  };

  const formatOffset = (tz: string) => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(new Date());
      const longTz = parts.find((p) => p.type === "timeZoneName")?.value || "";
      return longTz.replace("GMT", "UTC");
    } catch {
      return "UTC";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b172a] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/15">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectText({ en: "Change Time Zone", bn: "টাইমজোন পরিবর্তন করুন", ur: "ٹائم زون تبدیل کریں" })}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectText({
                  en: "Search any world city or use automatic device time",
                  bn: "যেকোনো শহরের নাম খুঁজুন বা অটো ডিভাইস টাইম সিলেক্ট করুন",
                  ur: "کسی بھی شہر کا نام تلاش کریں یا خودکار ڈیوائس کا وقت منتخب کریں",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={selectText({
                en: "Search city, region, or zone (e.g. London, Chicago, Dhaka)...",
                bn: "শহর বা অঞ্চল খুঁজুন (যেমন লন্ডন, শিকাগো, ঢাকা)...",
                ur: "شہر یا خطہ تلاش کریں (جیسے لندن، شکاگو، ڈھاکہ)...",
              })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070e1b] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* 1. Auto (Device) Option */}
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2">
              {selectText({ en: "Automatic Mode", bn: "স্বয়ংক্রিয় মোড", ur: "خودکار موڈ" })}
            </div>
            <button
              type="button"
              onClick={handleSelectAuto}
              className={`flex w-full items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                isAutoTimezone
                  ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isAutoTimezone
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <Laptop size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectText({ en: "Auto (device)", bn: "অটো (ডিভাইস)", ur: "خودکار (ڈیوائس)" })}
                    </span>
                    {isAutoTimezone && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {deviceTimezone} · {formatOffset(deviceTimezone)}
                  </div>
                </div>
              </div>
              {isAutoTimezone && <Check size={18} className="text-sky-500" />}
            </button>
          </div>

          {/* 2. Search Results OR Popular Financial Centers */}
          {search.trim() ? (
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2">
                {selectText({
                  en: `Search Results (${filteredZones.length})`,
                  bn: `অনুসন্ধানের ফলাফল (${filteredZones.length})`,
                  ur: `تلاش کے نتائج (${filteredZones.length})`,
                })}
              </div>
              {filteredZones.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  {selectText({
                    en: "No matching time zone found.",
                    bn: "কোনো মেলানো টাইমজোন পাওয়া যায়নি।",
                    ur: "کوئی مماثل ٹائم زون نہیں ملا۔",
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredZones.map((tz) => {
                    const isSelected = !isAutoTimezone && timezone === tz;
                    const cleanCity = tz.split("/").pop()?.replace(/_/g, " ") || tz;
                    const offset = formatOffset(tz);
                    return (
                      <button
                        key={tz}
                        type="button"
                        onClick={() => handleSelectZone(tz)}
                        className={`flex w-full items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                          isSelected
                            ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300"
                            : "border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {cleanCity}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {tz}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            dir="ltr"
                            className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                          >
                            {offset}
                          </span>
                          {isSelected && <Check size={16} className="text-sky-500 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-500" />
                <span>
                  {selectText({
                    en: "Major Financial Centers",
                    bn: "প্রধান আর্থিক কেন্দ্রসমূহ",
                    ur: "اہم مالیاتی مراکز",
                  })}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allTimezones.map((tz) => {
                  const isSelected = !isAutoTimezone && timezone === tz.value;
                  return (
                    <button
                      key={tz.value}
                      type="button"
                      onClick={() => handleSelectZone(tz.value)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {tz.city}
                        </span>
                        <span
                          dir="ltr"
                          className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                        >
                          {tz.offset}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-sky-600 dark:text-sky-400 mt-1 truncate">
                        {tz.market}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
