import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  User,
  ShieldCheck,
  Camera,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Loader2,
  Check,
  CheckCircle,
  FileText,
} from "lucide-react";
import type { SettingsTab } from "./SettingsPreferencesAndSecurityPanels";

export interface SettingsAccountProfilePanelProps {
  activeTab: SettingsTab;
  isBn?: boolean;
  avatar: string | null;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  userNameFallback?: string | null;
  userEmailFallback?: string | null;
  settingsName?: string | null;
  settingsUsername?: string | null;
  settingsEmail?: string | null;
  settingsBio?: string | null;
  bio: string;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  bioWordCount: number;
  isSavingBio: boolean;
  handleSaveBio: (e?: React.FormEvent) => void;
  handleRemoveBio: () => void;
  isUploadingAvatar: boolean;
  isRemovingAvatar: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAvatar: () => void;
  handleSaveName: (e: React.FormEvent) => void;
  isSavingName: boolean;
  handleSaveUsername: (e: React.FormEvent) => void;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  isSavingUsername: boolean;
  usernameAvailability: {
    checking: boolean;
    available?: boolean;
    reason?: string;
  };
}

export function SettingsAccountProfilePanel({
  activeTab,
  isBn,
  avatar,
  name,
  setName,
  userNameFallback,
  userEmailFallback,
  settingsName,
  settingsUsername,
  settingsEmail,
  settingsBio,
  bio,
  setBio,
  bioWordCount,
  isSavingBio,
  handleSaveBio,
  handleRemoveBio,
  isUploadingAvatar,
  isRemovingAvatar,
  fileInputRef,
  handleAvatarUpload,
  handleRemoveAvatar,
  handleSaveName,
  isSavingName,
  handleSaveUsername,
  username,
  setUsername,
  isSavingUsername,
  usernameAvailability,
}: SettingsAccountProfilePanelProps) {
  const { selectText } = useLanguage();

  if (activeTab !== "account") {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Photo Card */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera size={18} className="text-sky-500" />
              <span>
                {selectText({
                  en: "Profile Photo / Avatar",
                  bn: "প্রোফাইল ছবি / অবতার",
                  ur: "پروفائل تصویر / اوتار",
                })}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectText({
                en: "Your photo syncs across your Dashboard, Journal, and Global Leaderboard.",
                bn: "আপনার ছবি ড্যাশবোর্ড ও গ্লোবাল লিডারবোর্ডে প্রদর্শিত হবে।",
                ur: "آپ کی تصویر ڈیش بورڈ، جرنل اور گلوبل لیڈر بورڈ پر ظاہر ہوگی۔",
              })}
            </p>
          </div>
          {avatar && (
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 sm:px-2.5 py-0.5 text-[10px] font-bold">
              {selectText({
                en: "Active Photo",
                bn: "ছবি সক্রিয়",
                ur: "فعال تصویر",
              })}
            </span>
          )}
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Big Avatar Circle */}
          <div className="relative group shrink-0">
            <div className="relative size-20 sm:size-28 rounded-full overflow-hidden border-2 border-sky-500/50 bg-[#081833] dark:bg-slate-800 flex items-center justify-center text-xl sm:text-2xl font-bold font-mono text-white shadow-lg">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || userNameFallback || "User Avatar"}
                  className="size-full object-cover rounded-full"
                />
              ) : (
                <span>{(name || userNameFallback || "U")[0]?.toUpperCase() || "U"}</span>
              )}
              {(isUploadingAvatar || isRemovingAvatar) && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar || isRemovingAvatar}
              className="absolute bottom-0 right-0 size-8 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shadow-md hover:bg-sky-400 transition-transform active:scale-95 disabled:opacity-50"
              title={selectText({ en: "Upload Photo", bn: "ছবি আপলোড করুন", ur: "تصویر اپ لوڈ کریں" })}
              aria-label={selectText({ en: "Upload Photo", bn: "ছবি আপলোড করুন", ur: "تصویر اپ لوڈ کریں" })}
            >
              <Camera size={14} className="stroke-[2.5]" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
          />

          {/* Actions and Guidelines */}
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar || isRemovingAvatar}
                size="sm"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs gap-1.5"
              >
                <Camera size={14} />
                <span>
                  {avatar
                    ? selectText({ en: "Change Photo", bn: "ছবি পরিবর্তন করুন", ur: "تصویر تبدیل کریں" })
                    : selectText({ en: "Upload Photo", bn: "নতুন ছবি আপলোড", ur: "تصویر اپ لوڈ کریں" })}
                </span>
              </Button>

              {avatar && (
                <Button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingAvatar || isRemovingAvatar}
                  variant="outline"
                  size="sm"
                  className="border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>{selectText({ en: "Remove Photo", bn: "ছবি মুছে ফেলুন", ur: "تصویر ہٹائیں" })}</span>
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-900/40 p-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {selectText({ en: "Avatar Guidelines:", bn: "ছবি সংক্রান্ত গাইডলাইন:", ur: "تصویر کی ہدایات:" })}
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>
                  {selectText({
                    en: "JPG, PNG, or WebP format (max 8MB)",
                    bn: "JPG, PNG বা WebP ফরম্যাট (সর্বোচ্চ ৮ মেগাবাইট)",
                    ur: "JPG, PNG یا WebP فارمیٹ (زیادہ سے زیادہ 8MB)",
                  })}
                </li>
                <li>
                  {selectText({
                    en: "Auto-cropped to a crisp 400x400 square for fast cloud loading",
                    bn: "স্বয়ংক্রিয়ভাবে ৪০০x৪০০ স্কয়ার ক্রপ ও অপটিমাইজ করা হয়",
                    ur: "تیز کلاؤڈ لوڈنگ کے لیے خودکار طور پر 400x400 مربع سائز میں تیار کی جاتی ہے",
                  })}
                </li>
                <li>
                  {selectText({
                    en: "Strictly isolated per account and never shared with other traders",
                    bn: "প্রতিটি ইউজারের ছবি সম্পূর্ণ আলাদা ও সুরক্ষিত",
                    ur: "ہر اکاؤنٹ کے لیے مکمل طور پر محفوظ اور الگ",
                  })}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Display Name & Username Card */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-sky-500" />
            <span>
              {selectText({
                en: "Display Name & Username",
                bn: "নাম ও ট্রেডার ইউজারনেম",
                ur: "ڈسپلے کا نام اور ٹریڈر صارف نام",
              })}
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {selectText({
              en: "Configure your public display name and unique trader identifier.",
              bn: "আপনার ট্রেডার প্রোফাইলের নাম ও ইউনিক হ্যান্ডেল নিয়ন্ত্রণ করুন।",
              ur: "اپنا عوامی ڈسپلے نام اور منفرد ٹریڈر ہینڈل ترتیب دیں۔",
            })}
          </p>
        </div>

        {/* Form 1: Display Name */}
        <form onSubmit={handleSaveName} className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {selectText({ en: "Profile / Display Name", bn: "প্রোফাইল নাম", ur: "پروفائل / ڈسپلے کا نام" })}
          </label>
          <div className="flex gap-2 sm:gap-2.5">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectText({ en: "Your full name or trading alias", bn: "আপনার পুরো নাম", ur: "آپ کا پورا نام یا تجارتی عرف" })}
              maxLength={50}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold"
            />
            <Button
              type="submit"
              disabled={isSavingName || name.trim() === (settingsName || userNameFallback || "")}
              size="sm"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 gap-1.5 h-9 sm:h-9"
            >
              {isSavingName ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>{selectText({ en: "Save", bn: "সেভ", ur: "محفوظ" })}</span>
            </Button>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400">
            {selectText({
              en: "Between 2 and 50 characters. Syncs instantly across the platform.",
              bn: "সর্বনিম্ন ২ এবং সর্বোচ্চ ৫০ অক্ষর। ড্যাশবোর্ড ও লিডারবোর্ডে প্রদর্শিত হবে।",
              ur: "2 سے 50 حروف کے درمیان۔ پلیٹ فارم پر فوری ہم آہنگ ہوتا ہے۔",
            })}
          </p>
        </form>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 sm:pt-6">
          {/* Form 2: Username */}
          <form onSubmit={handleSaveUsername} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {selectText({ en: "Unique Username / Handle", bn: "ইউনিক ইউজারনেম", ur: "منفرد صارف نام / ہینڈل" })}
              </label>
              {usernameAvailability.checking && (
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" />
                  {selectText({ en: "Checking availability...", bn: "যাচাই হচ্ছে...", ur: "دستیابی کی جانچ ہو رہی ہے..." })}
                </span>
              )}
              {!usernameAvailability.checking && usernameAvailability.available === true && (
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {selectText({ en: "Available", bn: "ইউজারনেম খালি আছে", ur: "دستیاب ہے" })}
                </span>
              )}
              {!usernameAvailability.checking && usernameAvailability.available === false && (
                <span className="text-[10px] sm:text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {usernameAvailability.reason}
                </span>
              )}
            </div>

            <div className="flex gap-2 sm:gap-2.5">
              <div className="relative flex-1">
                <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                  @
                </span>
                <Input
                  dir="ltr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="username"
                  maxLength={20}
                  className="pl-7 sm:pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm font-bold"
                />
              </div>
              <Button
                type="submit"
                disabled={
                  isSavingUsername ||
                  usernameAvailability.checking ||
                  usernameAvailability.available === false ||
                  username.trim().toLowerCase() === (settingsUsername || "").toLowerCase()
                }
                size="sm"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 gap-1.5 h-9 sm:h-9"
              >
                {isSavingUsername ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>{selectText({ en: "Claim", bn: "সেভ", ur: "محفوظ" })}</span>
              </Button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              {selectText({
                en: "3 to 20 characters. Lowercase letters, numbers, and underscores only. Guaranteed unique.",
                bn: "৩-২০ অক্ষরের অনন্য পরিচয়। শুধুমাত্র ইংরেজি ছোট অক্ষর, সংখ্যা এবং আন্ডারস্কোর (_)।",
                ur: "3 سے 20 حروف۔ صرف انگریزی کے چھوٹے حروف، اعداد اور انڈر اسکور (_)।",
              })}
            </p>
          </form>
        </div>
      </div>

      {/* User Bio Card */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-sky-500" />
              <span>{selectText({ en: "Bio", bn: "বায়ো", ur: "بائیو" })}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectText({
                en: "Write a short personal trading bio (maximum 20 words). Appears on your profile and the Global Leaderboard.",
                bn: "সংক্ষিপ্ত ট্রেডিং বায়ো লিখুন (সর্বোচ্চ ২০ শব্দ)। আপনার প্রোফাইল ও গ্লোবাল লিডারবোর্ডে প্রদর্শিত হবে।",
                ur: "مختصر ذاتی ٹریڈنگ بائیو لکھیں (زیادہ سے زیادہ 20 الفاظ)۔ آپ کے پروفائل اور عالمی لیڈر بورڈ پر ظاہر ہوگا۔",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold border transition-colors ${
                bioWordCount > 20
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-500"
                  : bioWordCount === 20
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {bioWordCount}/20 {selectText({ en: "words", bn: "শব্দ", ur: "الفاظ" })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveBio} className="space-y-3">
          <div className="space-y-1.5">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder={selectText({
                en: "e.g. ICT price action scalper. Risk 1% per trade. Disciplined and focused on high-probability setups.",
                bn: "যেমন: আইসিটি প্রাইস অ্যাকশন স্ক্যালপার। প্রতি ট্রেডে ১% রিস্ক। সুশৃঙ্খল ও ধারাবাহিক।",
                ur: "مثال: آئی سی ٹی پرائس ایکشن اسکیلپر۔ فی ٹریڈ 1 فیصد رسک۔ پرعزم اور مستقل مزاج۔",
              })}
              className={`w-full rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-900 border transition-all resize-none focus:outline-none focus:ring-2 ${
                bioWordCount > 20
                  ? "border-rose-500 focus:ring-rose-500/30 text-rose-600 dark:text-rose-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-sky-500/20"
              }`}
            />

            {bioWordCount > 20 && (
              <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <AlertTriangle size={12} className="shrink-0" />
                <span>
                  {selectText({
                    en: `Bio exceeds the 20-word limit (${bioWordCount}/20 words). Please reduce ${bioWordCount - 20} word${bioWordCount - 20 > 1 ? "s" : ""} to save.`,
                    bn: `বায়ো সর্বোচ্চ সীমা ২০ শব্দ অতিক্রম করেছে (${bioWordCount}/২০ শব্দ)। সেভ করতে ${bioWordCount - 20}টি শব্দ কমান।`,
                    ur: `بائیو 20 الفاظ کی حد سے بڑھ گیا ہے (${bioWordCount}/20 الفاظ)۔ محفوظ کرنے کے لیے ${bioWordCount - 20} الفاظ کم کریں۔`,
                  })}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              {selectText({
                en: "Optional. Leave blank to hide your bio across all public views.",
                bn: "ঐচ্ছিক। খালি রাখলে কোথাও বায়ো প্রদর্শিত হবে না।",
                ur: "اختیاری۔ خالی چھوڑنے پر عوامی مناظر میں بائیو پوشیدہ رہے گا۔",
              })}
            </p>

            <div className="flex items-center gap-2">
              {(Boolean(settingsBio) || bio.trim().length > 0) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSavingBio || (!settingsBio && bio.trim().length === 0)}
                  onClick={handleRemoveBio}
                  className="text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 gap-1.5 h-8 sm:h-9"
                >
                  <Trash2 size={13} />
                  <span>{selectText({ en: "Remove", bn: "মুছুন", ur: "ہٹائیں" })}</span>
                </Button>
              )}

              <Button
                type="submit"
                disabled={
                  isSavingBio ||
                  bioWordCount > 20 ||
                  bio.trim() === (settingsBio || "").trim()
                }
                size="sm"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 gap-1.5 h-8 sm:h-9"
              >
                {isSavingBio ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>{selectText({ en: "Save Bio", bn: "বায়ো সেভ করুন", ur: "بائیو محفوظ کریں" })}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Account Email Card */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span>
                {selectText({ en: "Account Email Address", bn: "অ্যাকাউন্ট ইমেইল", ur: "اکاؤنٹ کا ای میل ایڈریس" })}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectText({
                en: "Primary sign-in and purchase entitlement credentials.",
                bn: "আপনার বর্তমান লগইন এবং ক্রয়কৃত পণ্যের লাইসেন্স ইমেইল।",
                ur: "بنیادی سائن ان اور خریدی گئی مصنوعات کا لائسنس ای میل۔",
              })}
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle size={11} />
            {selectText({ en: "Verified", bn: "যাচাইকৃত", ur: "تصدیق شدہ" })}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {selectText({ en: "Current Account Email:", bn: "লগইন ইমেইল:", ur: "موجودہ اکاؤنٹ ای میل:" })}
            </div>
            <div dir="ltr" className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {userEmailFallback || settingsEmail || "No email linked"}
            </div>
          </div>

          <Link href="/support">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 gap-1.5 h-8 sm:h-9 self-start sm:self-auto"
            >
              <MessageSquare size={13} />
              <span>
                {selectText({
                  en: "Request Email Transfer",
                  bn: "ইমেইল পরিবর্তনের অনুরোধ",
                  ur: "ای میل منتقلی کی درخواست",
                })}
              </span>
            </Button>
          </Link>
        </div>

        <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">
          {selectText({
            en: "For security and ownership protection of your purchased course packages and eBook licenses, account email changes require manual administrative verification. Contact support if you need to transfer your email.",
            bn: "নিরাপত্তাজনিত কারণে এবং কেনাকাটার অ্যাক্সেস সুরক্ষিত রাখতে ইমেইল সরাসরি পরিবর্তন বন্ধ রাখা হয়েছে। ইমেইল ট্রান্সফার করতে চাইলে সাপোর্ট ডেস্কে যোগাযোগ করুন।",
            ur: "سیکیورٹی اور خریدے گئے کورسز اور ای بک لائسنسز کے تحفظ کے لیے، اکاؤنٹ ای میل تبدیل کرنے کے لیے دستی انتظامی تصدیق درکار ہے۔ سپورٹ سے رابطہ کریں۔",
          })}
        </p>
      </div>
    </div>
  );
}
