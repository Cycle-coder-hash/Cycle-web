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
    <div className="space-y-6">
      {/* Profile Photo Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera size={18} className="text-sky-500" />
              <span>
                {selectText({
                  en: "Profile Photo / Avatar",
                  bn: "প্রোফাইল ছবি / অবতার",
                  ur: "پروفائل تصویر / اوتار",
                })}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectText({
                en: "Your photo syncs across your Dashboard, Journal, and Global Leaderboard.",
                bn: "আপনার ছবি ড্যাশবোর্ড ও গ্লোবাল লিডারবোর্ডে প্রদর্শিত হবে।",
                ur: "آپ کی تصویر ڈیش بورڈ، جرنل اور گلوبل لیڈر بورڈ پر ظاہر ہوگی۔",
              })}
            </p>
          </div>
          {avatar && (
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
              {selectText({
                en: "Active Photo",
                bn: "ছবি সক্রিয়",
                ur: "فعال تصویر",
              })}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Big Avatar Circle */}
          <div className="relative group shrink-0">
            <div className="relative size-24 sm:size-28 rounded-full overflow-hidden border-2 border-sky-500/50 bg-[#081833] dark:bg-slate-800 flex items-center justify-center text-2xl font-bold font-mono text-white shadow-lg">
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-sky-500" />
            <span>
              {selectText({
                en: "Display Name & Username",
                bn: "নাম ও ট্রেডার ইউজারনেম",
                ur: "ڈسپلے کا نام اور ٹریڈر صارف نام",
              })}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
          <div className="flex gap-2.5">
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
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 gap-1.5"
            >
              {isSavingName ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>{selectText({ en: "Save Name", bn: "সেভ করুন", ur: "نام محفوظ کریں" })}</span>
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">
            {selectText({
              en: "Between 2 and 50 characters. Syncs instantly across the platform.",
              bn: "সর্বনিম্ন ২ এবং সর্বোচ্চ ৫০ অক্ষর। ড্যাশবোর্ড ও লিডারবোর্ডে প্রদর্শিত হবে।",
              ur: "2 سے 50 حروف کے درمیان۔ پلیٹ فارم پر فوری ہم آہنگ ہوتا ہے۔",
            })}
          </p>
        </form>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
          {/* Form 2: Username */}
          <form onSubmit={handleSaveUsername} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {selectText({ en: "Unique Username / Handle", bn: "ইউনিক ইউজারনেম", ur: "منفرد صارف نام / ہینڈل" })}
              </label>
              {usernameAvailability.checking && (
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" />
                  {selectText({ en: "Checking availability...", bn: "যাচাই হচ্ছে...", ur: "دستیابی کی جانچ ہو رہی ہے..." })}
                </span>
              )}
              {!usernameAvailability.checking && usernameAvailability.available === true && (
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {selectText({ en: "Available", bn: "ইউজারনেম খালি আছে", ur: "دستیاب ہے" })}
                </span>
              )}
              {!usernameAvailability.checking && usernameAvailability.available === false && (
                <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {usernameAvailability.reason}
                </span>
              )}
            </div>

            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                  @
                </span>
                <Input
                  dir="ltr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="username"
                  maxLength={20}
                  className="pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm font-bold"
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
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 gap-1.5"
              >
                {isSavingUsername ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>{selectText({ en: "Claim Username", bn: "ইউজারনেম সেভ", ur: "صارف نام محفوظ کریں" })}</span>
              </Button>
            </div>
            <p className="text-[11px] text-slate-400">
              {selectText({
                en: "3 to 20 characters. Lowercase letters, numbers, and underscores only. Guaranteed unique.",
                bn: "৩-২০ অক্ষরের অনন্য পরিচয়। শুধুমাত্র ইংরেজি ছোট অক্ষর, সংখ্যা এবং আন্ডারস্কোর (_)।",
                ur: "3 سے 20 حروف۔ صرف انگریزی کے چھوٹے حروف، اعداد اور انڈر اسکور (_)।",
              })}
            </p>
          </form>
        </div>
      </div>

      {/* Account Email Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span>
                {selectText({ en: "Account Email Address", bn: "অ্যাকাউন্ট ইমেইল", ur: "اکاؤنٹ کا ای میل ایڈریس" })}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectText({
                en: "Primary sign-in and purchase entitlement credentials.",
                bn: "আপনার বর্তমান লগইন এবং ক্রয়কৃত পণ্যের লাইসেন্স ইমেইল।",
                ur: "بنیادی سائن ان اور خریدی گئی مصنوعات کا لائسنس ای میل۔",
              })}
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle size={11} />
            {selectText({ en: "Verified Account", bn: "যাচাইকৃত অ্যাকাউন্ট", ur: "تصدیق شدہ اکاؤنٹ" })}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {selectText({ en: "Current Account Email:", bn: "লগইন ইমেইল:", ur: "موجودہ اکاؤنٹ ای میل:" })}
            </div>
            <div dir="ltr" className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {userEmailFallback || settingsEmail || "No email linked"}
            </div>
          </div>

          <Link href="/support">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 gap-1.5"
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

        <p className="text-[11px] text-slate-400 leading-relaxed">
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
