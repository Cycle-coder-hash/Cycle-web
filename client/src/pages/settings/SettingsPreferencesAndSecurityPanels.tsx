import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CountryLanguageOption, SupportedLanguage } from "@/i18n/types";
import type { CurrencyConfig, TimezoneOption } from "@/contexts/UserPreferencesContext";
import {
  Palette,
  Globe,
  HelpCircle,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  Clock,
  Coins,
  Sparkles,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Layers,
  Loader2,
  Check,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";

export type SettingsTab = "account" | "appearance" | "region" | "security" | "support";

export interface SettingsPreferencesAndSecurityPanelsProps {
  activeTab: SettingsTab;
  isBn: boolean;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  onUpdatePreferences: (prefs: { theme?: "dark" | "light"; language?: SupportedLanguage }) => void;
  allOptions: CountryLanguageOption[];
  currentOption: CountryLanguageOption;
  setCountryLanguage: (optionId: string) => void;
  liveClock: string;
  allTimezones: TimezoneOption[];
  timezone: string;
  setTimezone: (tz: string | null) => Promise<void> | void;
  isAutoTimezone?: boolean;
  deviceTimezone?: string;
  allCurrencies: CurrencyConfig[];
  currency: string;
  setCurrency: (cur: string) => Promise<void> | void;
  handleChangePassword: (e: React.FormEvent) => void;
  currentPassword: string;
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  showCurrentPw: boolean;
  setShowCurrentPw: React.Dispatch<React.SetStateAction<boolean>>;
  showNewPw: boolean;
  setShowNewPw: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPw: boolean;
  setShowConfirmPw: React.Dispatch<React.SetStateAction<boolean>>;
  isChangingPassword: boolean;
  showLogoutAllModal: boolean;
  setShowLogoutAllModal: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggingOutAll: boolean;
  handleLogoutAllDevices: () => void;
}

export function SettingsPreferencesAndSecurityPanels({
  activeTab,
  isBn,
  theme,
  setTheme,
  onUpdatePreferences,
  allOptions,
  currentOption,
  setCountryLanguage,
  liveClock,
  allTimezones,
  timezone,
  setTimezone,
  isAutoTimezone,
  deviceTimezone,
  allCurrencies,
  currency,
  setCurrency,
  handleChangePassword,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showCurrentPw,
  setShowCurrentPw,
  showNewPw,
  setShowNewPw,
  showConfirmPw,
  setShowConfirmPw,
  isChangingPassword,
  showLogoutAllModal,
  setShowLogoutAllModal,
  isLoggingOutAll,
  handleLogoutAllDevices,
}: SettingsPreferencesAndSecurityPanelsProps) {
  const { selectText } = useLanguage();

  if (activeTab === "account" && !showLogoutAllModal) {
    return null;
  }

  return (
    <div>
      {/* ========================================================================= */}
      {/* 2. APPEARANCE SECTION */}
      {/* ========================================================================= */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette size={18} className="text-sky-500" />
                <span>
                  {selectText({
                    en: "Theme & Visual Appearance",
                    bn: "থিম ও ডিসপ্লে মোড",
                    ur: "تھیم اور ظاہری شکل",
                  })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectText({
                  en: "Select your preferred visual theme. Dark mode is the recommended institutional standard.",
                  bn: "আপনার পছন্দ অনুযায়ী ডার্ক মোড বা লাইট মোড নির্বাচন করুন। ডার্ক মোড স্ট্যান্ডার্ড রাখা হয়েছে।",
                  ur: "اپنی پسندیدہ بصری تھیم منتخب کریں۔ ڈارک موڈ ادارہ جاتی معیار ہے۔",
                })}
              </p>
            </div>

            {/* Theme Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Mode Card */}
              <div
                onClick={() => {
                  setTheme("dark");
                  onUpdatePreferences({ theme: "dark" });
                  toast.success(
                    selectText({
                      en: "Dark theme enabled",
                      bn: "ডার্ক মোড সক্রিয় করা হয়েছে",
                      ur: "ڈارک تھیم فعال ہو گئی",
                    })
                  );
                }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 relative ${
                  theme === "dark"
                    ? "border-sky-500 bg-sky-500/10 shadow-md ring-2 ring-sky-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40"
                }`}
              >
                {theme === "dark" && (
                  <div className="absolute top-4 right-4 rounded-full bg-sky-500 p-1 text-slate-950">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                )}
                <div className="size-10 rounded-xl bg-slate-950 border border-slate-800 text-yellow-400 flex items-center justify-center mb-4">
                  <Moon size={20} />
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectText({
                    en: "Dark Navy Theme (Default)",
                    bn: "ডার্ক মোড (ডিফল্ট)",
                    ur: "ڈارک نیوی تھیم (طے شدہ)",
                  })}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectText({
                    en: "Institutional deep blue-black interface built for low glare during night sessions and CRT markups.",
                    bn: "দীর্ঘ সময় চার্ট অ্যানালাইসিস ও পড়াশোনায় চোখের ক্লান্তি দূর করতে ডিপ ব্লু-ব্ল্যাক নান্দনিক ইন্টারফেস।",
                    ur: "رات کے سیشنز اور مارک اپس کے دوران آنکھوں کی حفاظت کے لیے گہرا نیلا انٹرفیس۔",
                  })}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
                  <Sparkles size={11} />
                  <span>Institutional Standard</span>
                </div>
              </div>

              {/* Light Mode Card */}
              <div
                onClick={() => {
                  setTheme("light");
                  onUpdatePreferences({ theme: "light" });
                  toast.success(
                    selectText({
                      en: "Light theme enabled",
                      bn: "লাইট মোড সক্রিয় করা হয়েছে",
                      ur: "لائٹ تھیم فعال ہو گئی",
                    })
                  );
                }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 relative ${
                  theme === "light"
                    ? "border-sky-500 bg-sky-500/10 shadow-md ring-2 ring-sky-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40"
                }`}
              >
                {theme === "light" && (
                  <div className="absolute top-4 right-4 rounded-full bg-sky-500 p-1 text-white">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                )}
                <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Sun size={20} />
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectText({
                    en: "Light Clean Theme",
                    bn: "লাইট মোড",
                    ur: "لائٹ کلین تھیم",
                  })}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectText({
                    en: "High-contrast daylight theme for reading trading notes and curriculum articles.",
                    bn: "উজ্জ্বল আলোর পরিবেশে হাই কন্ট্রাস্ট পঠন ও নোট লেখার জন্য উপযুক্ত।",
                    ur: "دن کی روشنی میں پڑھنے اور نوٹس لکھنے کے لیے ہائی کنٹراسٹ تھیم۔",
                  })}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500">
                  <Laptop size={11} />
                  <span>High Ambient Light</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LANGUAGE & REGION SECTION */}
      {/* ========================================================================= */}
      {activeTab === "region" && (
        <div className="space-y-6">
          {/* Multi-Language Selector Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe size={18} className="text-sky-500" />
                <span>
                  {selectText({
                    en: "Language & Country Selection",
                    bn: "ওয়েবসাইট ভাষা ও দেশ নির্বাচন",
                    ur: "زبان اور ملک کا انتخاب",
                  })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectText({
                  en: "Active multi-language system supporting Bangla, English, and Urdu with immediate site-wide translation.",
                  bn: "সম্পূর্ণ কার্যকরী মাল্টি-ল্যাঙ্গুয়েজ সিস্টেম (বাংলা, English, اردو)। যেকোনো ভাষা নির্বাচন করলেই পুরো ওয়েবসাইট সেই ভাষায় পরিবর্তিত হবে।",
                  ur: "فعال کثیر لسانی نظام جو اردو، انگریزی اور بنگلہ کی فوری ترجمانی کرتا ہے۔",
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {allOptions.map((opt) => {
                const isSelected = currentOption.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setCountryLanguage(opt.id);
                      onUpdatePreferences({ language: opt.langCode });
                      toast.success(`${opt.countryName}: ${opt.nativeName || opt.langName}`);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-500/10 font-bold dark:bg-sky-500/15"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-lg shrink-0">{opt.flag}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {opt.nativeName}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {opt.langName} · {opt.countryName}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-sky-500 shrink-0 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Zone Card with Live Clock */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-sky-500" />
                  <span>
                    {selectText({
                      en: "Financial Market Time Zone",
                      bn: "ট্রেডিং টাইমজোন ও লাইভ ঘড়ি",
                      ur: "تجارتی مارکیٹ ٹائم زون",
                    })}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectText({
                    en: "Set your reference timezone for trade logging, session times, and daily discipline resets.",
                    bn: "আপনার সুবিধাজনক মার্কেট সেশন অনুযায়ী টাইমজোন নির্ধারণ করুন।",
                    ur: "ٹریڈ لاگنگ اور سیشن کے اوقات کے لیے اپنا مرجع ٹائم زون سیٹ کریں۔",
                  })}
                </p>
              </div>

              {/* Live Digital Clock Badge */}
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <div dir="ltr" className="text-xs font-mono font-extrabold text-sky-600 dark:text-sky-400 tracking-wider">
                  {liveClock || "Calculating..."}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Auto (Device) Option */}
              <div
                onClick={() => {
                  setTimezone(null);
                  toast.success(
                    selectText({
                      en: `Timezone set to Auto (Device: ${deviceTimezone || "System"})`,
                      bn: `টাইমজোন অটো ডিভাইসে সেট হয়েছে (${deviceTimezone || ""})`,
                      ur: `ٹائم زون خودکار ڈیوائস پر سیٹ ہو گیا (${deviceTimezone || ""})`,
                    })
                  );
                }}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isAutoTimezone
                    ? "border-sky-500 bg-sky-500/10 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{selectText({ en: "Auto (device)", bn: "অটো (ডিভাইস)", ur: "خودکار (ڈیوائس)" })}</span>
                    {isAutoTimezone && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                        {selectText({ en: "ACTIVE", bn: "সক্রিয়", ur: "فعال" })}
                      </span>
                    )}
                  </span>
                  <span dir="ltr" className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-500/20 px-1.5 py-0.5 rounded">
                    AUTO
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {deviceTimezone || "Detected Device Zone"}
                </div>
                <div className="text-[10px] font-mono text-sky-600 dark:text-sky-400 mt-1.5 font-semibold">
                  {selectText({ en: "Re-reads on every page load", bn: "প্রতি পেজ লোডে অটো রি-রিড", ur: "ہر صفحہ لوڈ پر خودکار اپ ڈیٹ" })}
                </div>
              </div>

              {allTimezones.map((tz) => {
                const isSelected = !isAutoTimezone && timezone === tz.value;
                return (
                  <div
                    key={tz.value}
                    onClick={() => {
                      setTimezone(tz.value);
                      toast.success(
                        selectText({
                          en: `Timezone set to ${tz.city}`,
                          bn: `টাইমজোন আপডেট হয়েছে: ${tz.city}`,
                          ur: `ٹائم زون سیٹ ہو گیا: ${tz.city}`,
                        })
                      );
                    }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-500/10 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {tz.city}
                      </span>
                      <span dir="ltr" className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {tz.offset}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {tz.label}
                    </div>
                    <div className="text-[10px] font-mono text-sky-600 dark:text-sky-400 mt-1.5 font-semibold">
                      {tz.market}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Display Currency Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins size={18} className="text-amber-500" />
                <span>
                  {selectText({
                    en: "Display Currency",
                    bn: "ডিসপ্লে কারেন্সি নির্বাচন",
                    ur: "ڈسپلے کرنسی",
                  })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectText({
                  en: "Select your preferred currency symbol for store packages and account figures.",
                  bn: "স্টোর ও সাধারণ মূল্যের জন্য আপনার পছন্দের মুদ্রা প্রতীক বেছে নিন।",
                  ur: "اسٹور پیکجز اور اعداد و شمار کے لیے اپنی ترجیحی کرنسی منتخب کریں۔",
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allCurrencies.map((c) => {
                const isSelected = currency === c.code;
                return (
                  <div
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      toast.success(
                        selectText({
                          en: `Currency changed to ${c.code}`,
                          bn: `মুদ্রা পরিবর্তিত হয়েছে: ${c.code}`,
                          ur: `کرنسی تبدیل ہو گئی: ${c.code}`,
                        })
                      );
                    }}
                    className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <div dir="ltr" className="text-base font-black font-mono mt-1 text-slate-900 dark:text-white">
                      {c.symbol}
                    </div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                      {c.code}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-1">
                      {c.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECURITY & SESSIONS SECTION */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock size={18} className="text-sky-500" />
                <span>
                  {selectText({
                    en: "Change Password",
                    bn: "পাসওয়ার্ড পরিবর্তন করুন",
                    ur: "پاس ورڈ تبدیل کریں",
                  })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectText({
                  en: "Ensure your account is protected with a strong, distinct password.",
                  bn: "আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নিয়মিত পাসওয়ার্ড আপডেট করুন।",
                  ur: "اپنے اکاؤنٹ کے تحفظ کے لیے ایک مضبوط اور محفوظ پاس ورڈ استعمال کریں۔",
                })}
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {selectText({
                    en: "Current Password",
                    bn: "বর্তমান পাসওয়ার্ড",
                    ur: "موجودہ پاس ورڈ",
                  })}
                </label>
                <div className="relative">
                  <Input
                    dir="ltr"
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle Current Password Visibility"
                  >
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {selectText({
                    en: "New Password",
                    bn: "নতুন পাসওয়ার্ড",
                    ur: "نیا پاس ورڈ",
                  })}
                </label>
                <div className="relative">
                  <Input
                    dir="ltr"
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle New Password Visibility"
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectText({
                    en: "Minimum 6 characters.",
                    bn: "কমপক্ষে ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।",
                    ur: "کم از کم 6 حروف۔",
                  })}
                </p>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {selectText({
                    en: "Confirm New Password",
                    bn: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
                    ur: "نئے پاس ورڈ کی تصدیق کریں",
                  })}
                </label>
                <div className="relative">
                  <Input
                    dir="ltr"
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle Confirm Password Visibility"
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs gap-1.5 mt-2"
              >
                {isChangingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                <span>
                  {selectText({
                    en: "Update Password",
                    bn: "পাসওয়ার্ড আপডেট করুন",
                    ur: "پاس ورڈ اپ ڈیٹ کریں",
                  })}
                </span>
              </Button>
            </form>
          </div>

          {/* Logout From All Devices Card */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/30">
              <div>
                <h2 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <LogOut size={18} />
                  <span>
                    {selectText({
                      en: "Logout From All Devices",
                      bn: "সকল ডিভাইস থেকে লগআউট",
                      ur: "تمام ڈیوائسز سے لاگ آؤٹ",
                    })}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectText({
                    en: "Terminate and invalidate all active sessions across any phones, tablets, or other browsers.",
                    bn: "আপনার অ্যাকাউন্ট অন্য কোনো ব্রাউজার বা ডিভাইসে খোলা থাকলে সব সেশন তাৎক্ষণিক বাতিল হবে।",
                    ur: "تمام فونز، ٹیبلٹس یا دیگر براؤزرز پر تمام فعال سیشنز فوری طور پر ختم کریں۔",
                  })}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectText({
                en: "If you logged in from a shared computer or suspect unauthorized session access, clicking below instantly revokes all authentication tokens and forces a clean sign-in.",
                bn: "আপনি যদি অন্য কোনো পাবলিক কম্পিউটার বা ডিভাইসে লগইন করে ভুলে গিয়ে থাকেন, এই বোতামে ক্লিক করলে সমস্ত সক্রিয় অথেনটিকেশন টোকেন ইনভ্যালিড হয়ে যাবে এবং নতুন করে পাসওয়ার্ড দিয়ে প্রবেশ করতে হবে।",
                ur: "اگر آپ نے کسی مشترکہ کمپیوٹر سے لاگ ان کیا تھا، تو نیچے کلک کرنے سے تمام ٹوکنز منسوخ ہو جائیں گے اور دوبارہ لاگ ان درکار ہوگا۔",
              })}
            </p>

            <div>
              <Button
                type="button"
                onClick={() => setShowLogoutAllModal(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-2"
              >
                <LogOut size={14} />
                <span>
                  {selectText({
                    en: "Sign Out From All Devices",
                    bn: "সকল ডিভাইস থেকে সাইন আউট",
                    ur: "تمام ڈیوائسز سے سائن آؤٹ کریں",
                  })}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUPPORT & HELP CENTER SECTION */}
      {/* ========================================================================= */}
      {activeTab === "support" && (
        <div className="space-y-6">
          {/* Contact Support Card */}
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-[#0a192f] to-[#070e1b] p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                {selectText({
                  en: "Direct Admin Desk",
                  bn: "১-অন-১ অফিসিয়াল সাপোর্ট",
                  ur: "براہ راست ایڈمن ڈیسک",
                })}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                {selectText({
                  en: "Desk Active 24/7",
                  bn: "লাইভ সাপোর্ট সক্রিয়",
                  ur: "ڈیسک 24/7 فعال ہے",
                })}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-white">
                {selectText({
                  en: "Contact Official Mentor Support",
                  bn: "অ্যাডমিন ও মেন্টরের সাথে সরাসরি চ্যাট",
                  ur: "آفیشل مینٹور سپورٹ سے رابطہ",
                })}
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectText({
                  en: "Connect directly with platform administrators and institutional mentors for payment approvals, curriculum queries, and technical assistance.",
                  bn: "কোর্স এনরোলমেন্ট, পেমেন্ট ভেরিফিকেশন, কিংবা চার্ট সম্পর্কিত যেকোনো সমস্যায় সরাসরি অ্যাডমিনের সাথে ১-অন-১ মেসেজিং সিস্টেমে যোগাযোগ করুন।",
                  ur: "ادائیگی کی توثیق، نصابی سوالات اور تکنیکی مدد کے لیے پلیٹ فارم ایڈمنسٹریٹرز اور مینٹورز سے براہ راست رابطہ کریں۔",
                })}
              </p>
            </div>

            <div className="pt-2">
              <Link href="/support">
                <Button className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs gap-2 shadow-lg shadow-sky-500/20">
                  <MessageSquare size={15} />
                  <span>
                    {selectText({
                      en: "Support Desk",
                      bn: "সাপোর্ট ডেস্ক",
                      ur: "سپورٹ ڈیسک",
                    })}
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Help Resources Grid */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-sky-500" />
                <span>
                  {selectText({
                    en: "Curriculum & Help Center",
                    bn: "স্টাডি রিসোর্স ও কারিকুলাম গাইড",
                    ur: "نصاب اور ہیلپ سنٹر",
                  })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectText({
                  en: "Quick access to verified study materials, roadmap stages, and official documentation.",
                  bn: "ক্যান্ডেল রেঞ্জ থিওরি (CRT) ও প্রাতিষ্ঠানিক রোডম্যাপ বিষয়ক প্রয়োজনীয় লিঙ্কসমূহ।",
                  ur: "تصدیق شدہ مطالعاتی مواد اور روڈ میپ کے مراحل تک فوری رسائی۔",
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Roadmap Link */}
              <Link href="/dashboard?tab=roadmap">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 bg-slate-50/50 dark:bg-slate-900/40 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Layers size={18} className="text-sky-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectText({
                          en: "12-Stage Institutional Roadmap",
                          bn: "১২-স্টেজ প্রাতিষ্ঠানিক রোডম্যাপ",
                          ur: "12-اسٹیج ادارہ جاتی روڈ میپ",
                        })}
                      </span>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-sky-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    {selectText({
                      en: "Step-by-step framework from foundation to algorithmic execution.",
                      bn: "ফাউন্ডেশন থেকে অ্যাডভান্সড CRT মাস্টারি পর্যন্ত ধাপে ধাপে গাইড।",
                      ur: "بنیاد سے الگورتھمک نفاذ تک مرحلہ وار فریم ورک۔",
                    })}
                  </p>
                </div>
              </Link>

              {/* PDF Library Link */}
              <Link href="/dashboard?tab=library">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 bg-slate-50/50 dark:bg-slate-900/40 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BookOpen size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectText({
                          en: "Institutional PDF Library",
                          bn: "স্টাডি লাইব্রেরি ও চিটশিট",
                          ur: "ادارہ جاتی PDF لائبریری",
                        })}
                      </span>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    {selectText({
                      en: "Downloadable cheat sheets, risk management templates, and CRT rules.",
                      bn: "প্রিন্টযোগ্য রেফারেন্স পিডিএফ ও ডাউনলোড গাইড।",
                      ur: "ڈاؤن لوڈ کے قابل چیٹ شیٹس، رسک مینجمنٹ ٹیمپلیٹس اور CRT قواعد۔",
                    })}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Logout From All Devices */}
      {showLogoutAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="rounded-full bg-rose-500/15 p-2.5">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectText({
                  en: "Confirm Global Sign-out?",
                  bn: "আপনি কি নিশ্চিত?",
                  ur: "کیا آپ تمام ڈیوائسز سے لاگ آؤٹ کی تصدیق کرتے ہیں؟",
                })}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectText({
                en: "This action will terminate all active login sessions on all devices and browsers immediately. You will be redirected to the login page.",
                bn: "এটি আপনার সমস্ত সক্রিয় মোবাইল ফোন, ল্যাপটপ এবং ব্রাউজারের সেশন স্থায়ীভাবে বন্ধ করে দেবে। আপনাকে আবার লগইন পেজে নিয়ে যাওয়া হবে।",
                ur: "یہ عمل تمام ڈیوائسز اور براؤزرز پر آپ کے تمام فعال لاگ ان سیشنز کو فوری طور پر ختم کر دے گا۔",
              })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoggingOutAll}
                onClick={() => setShowLogoutAllModal(false)}
                className="text-xs font-bold border-slate-300 dark:border-slate-700"
              >
                {selectText({ en: "Cancel", bn: "বাতিল করুন", ur: "منسوخ کریں" })}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isLoggingOutAll}
                onClick={handleLogoutAllDevices}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1.5"
              >
                {isLoggingOutAll ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                <span>
                  {selectText({ en: "Yes, Sign Out All", bn: "হ্যাঁ, লগআউট করুন", ur: "ہاں، سب سے لاگ آؤٹ کریں" })}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
