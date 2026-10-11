import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KeyRound,
  RefreshCw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export type AuthMode = "login" | "register" | "forgot_password" | "reset_password" | "verify_otp";

export interface AuthModeFormsProps {
  mode: AuthMode;
  setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
  isBn?: boolean;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  otpCode: string;
  setOtpCode: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  googleLoading: boolean;
  errorMsg: string;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  successMsg: string;
  setSuccessMsg: React.Dispatch<React.SetStateAction<string>>;
  showResend: boolean;
  setShowResend: React.Dispatch<React.SetStateAction<boolean>>;
  cooldown: number;
  handleGoogleSignIn: () => void;
  handleLoginSubmit: (e: React.FormEvent) => void;
  handleRegisterSubmit: (e: React.FormEvent) => void;
  handleResendVerification: () => void;
  handleCheckEmailConfirmed: () => void;
  handleVerifyOtpSubmit: (e: React.FormEvent) => void;
  handleForgotPasswordSubmit: (e: React.FormEvent) => void;
  handleResetPasswordSubmit: (e: React.FormEvent) => void;
}

export function AuthModeForms({
  mode,
  setMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  newPassword,
  setNewPassword,
  phone,
  setPhone,
  showPassword,
  setShowPassword,
  otpCode,
  setOtpCode,
  loading,
  googleLoading,
  errorMsg,
  setErrorMsg,
  successMsg,
  setSuccessMsg,
  showResend,
  setShowResend,
  cooldown,
  handleGoogleSignIn,
  handleLoginSubmit,
  handleRegisterSubmit,
  handleResendVerification,
  handleCheckEmailConfirmed,
  handleVerifyOtpSubmit,
  handleForgotPasswordSubmit,
  handleResetPasswordSubmit,
}: AuthModeFormsProps) {
  const { selectText } = useLanguage();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      {/* Top Brand Pill */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#0284c7] dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-400">
          <Sparkles size={13} />
          <span>STUDENT REALITY PORTAL</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {mode === "login" &&
            selectText({
              en: "Welcome back, Trader",
              bn: "আপনার অ্যাকাউন্টে লগইন করুন",
              ur: "خوش آمدید، ٹریڈر",
            })}
          {mode === "register" &&
            selectText({
              en: "Create your student account",
              bn: "নতুন অ্যাকাউন্ট তৈরি করুন",
              ur: "اپنا اسٹوڈنٹ اکاؤنٹ بنائیں",
            })}
          {mode === "forgot_password" &&
            selectText({
              en: "Forgot Password",
              bn: "পাসওয়ার্ড ভুলে গেছেন?",
              ur: "پاس ورڈ بھول گئے؟",
            })}
          {mode === "reset_password" &&
            selectText({
              en: "Set New Password",
              bn: "নতুন পাসওয়ার্ড সেট করুন",
              ur: "نیا پاس ورڈ سیٹ کریں",
            })}
          {mode === "verify_otp" &&
            selectText({
              en: "Verify Your Email",
              bn: "ইমেইল ভেরিফিকেশন",
              ur: "اپنا ای میل تصدیق کریں",
            })}
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {mode === "login" &&
            selectText({
              en: "Access your institutional library, discipline and trading journal",
              bn: "আপনার ড্যাশবোর্ড, লাইব্রেরি ও জার্নাল অ্যাক্সেস করুন",
              ur: "اپنی ادارہ جاتی لائبریری، نظم و ضبط اور ٹریڈنگ جرنل تک رسائی حاصل کریں",
            })}
          {mode === "register" &&
            selectText({
              en: "Join thousands mastering real market structure without hype",
              bn: "সঠিক মার্কেট স্ট্রাকচার শিখতে আজই যোগ দিন",
              ur: "مارکیٹ اسٹرکچر میں مہارت حاصل کرنے والے ہزاروں طلباء میں شامل ہوں",
            })}
          {mode === "forgot_password" &&
            selectText({
              en: "Enter your email to receive a password reset link",
              bn: "আপনার ইমেইল দিলে আমরা পাসওয়ার্ড রিসেট লিঙ্ক পাঠাব",
              ur: "پاس ورڈ دوبارہ ترتیب دینے کا لنک حاصل کرنے کے لیے اپنا ای میل درج کریں",
            })}
          {mode === "reset_password" &&
            selectText({
              en: "Enter your new password below",
              bn: "আপনার পছন্দের শক্তিশালী নতুন পাসওয়ার্ড দিন",
              ur: "نیچے اپنا نیا پاس ورڈ درج کریں",
            })}
          {mode === "verify_otp" &&
            selectText({
              en: "Enter the confirmation code sent to your email to activate your account",
              bn: "আপনার অ্যাকাউন্টে প্রবেশ করতে ইমেইলে পাঠানো কোডটি দিন",
              ur: "اپنا اکاؤنٹ فعال کرنے کے لیے ای میل پر بھیجا گیا تصدیقی کوڈ درج کریں",
            })}
        </p>
      </div>

      {/* Mode Switcher Tabs (Only on Login & Register) */}
      {(mode === "login" || mode === "register") && (
        <div className="mt-6 flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
              setSuccessMsg("");
              setShowResend(false);
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-md dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {selectText({ en: "Sign In", bn: "লগইন (Sign In)", ur: "سائن ان (Sign In)" })}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
              setSuccessMsg("");
              setShowResend(false);
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-md dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {selectText({ en: "Sign Up", bn: "রেজিস্টার (Sign Up)", ur: "سائن اپ (Sign Up)" })}
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 animate-in fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1 leading-snug">
            {errorMsg}
            {showResend && (
              <div className="mt-2">
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={handleResendVerification}
                  className="inline-flex items-center gap-1.5 font-bold text-[#0284c7] underline hover:text-sky-700 dark:text-sky-400"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  <span>
                    {cooldown > 0
                      ? `${selectText({ en: "Resend link", bn: "পুনরায় লিঙ্ক পাঠান", ur: "دوبارہ لنک بھیجیں" })} (${cooldown}s)`
                      : selectText({
                          en: "Resend Verification Link",
                          bn: "ভেরিফিকেশন লিঙ্ক আবার পাঠান",
                          ur: "تصدیقی لنک دوبارہ بھیجیں",
                        })}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
          <div className="flex-1 leading-snug">
            {successMsg}
            {showResend && (
              <div className="mt-2.5">
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={handleResendVerification}
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 underline"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  <span>
                    {cooldown > 0
                      ? `${selectText({ en: "Resend available in", bn: "আবার পাঠাতে অপেক্ষা করুন", ur: "دوبارہ بھیجنے کا وقت" })} (${cooldown}s)`
                      : selectText({
                          en: "Didn't receive email? Resend",
                          bn: "ইমেইল পাননি? পুনরায় পাঠান",
                          ur: "ای میل نہیں ملا؟ دوبارہ بھیجیں",
                        })}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spam Folder Note Callout */}
      {(showResend || (successMsg && (mode === "register" || mode === "forgot_password")) || (errorMsg && errorMsg.toLowerCase().includes("spam"))) && (
        <div className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 text-xs dark:border-amber-500/30 dark:bg-amber-950/40 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Mail className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1 text-amber-950 dark:text-amber-200 leading-relaxed">
              <div className="font-extrabold flex items-center gap-1.5">
                <span>
                  {selectText({
                    en: "📌 Important Note (Check Spam Folder):",
                    bn: "📌 গুরুত্বপূর্ণ নোট (Spam ফোল্ডার চেক করুন):",
                    ur: "📌 اہم نوٹ (Spam فولڈر چیک کریں):",
                  })}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300">
                {selectText({
                  en: "Verification emails may occasionally be filtered into your 'Spam' or 'Junk' folder. If you don't see it in your inbox, please check your Spam folder and click the link to activate.",
                  bn: "ভেরিফিকেশন ইমেইলটি অনেক সময় ইনবক্সে না গিয়ে 'Spam' (স্প্যাম) বা 'Junk' ফোল্ডারে জমা হতে পারে। ইনবক্সে ইমেইল না পেলে অনুগ্রহ করে আপনার Spam ফোল্ডার চেক করুন এবং 'Report not spam' বা লিঙ্কটিতে ক্লিক করুন।",
                  ur: "تصدیقی ای میل بعض اوقات 'Spam' یا 'Junk' فولڈر میں جا سکتی ہے۔ اگر آپ کو ان باکس میں نہیں ملتی ہے تو براہ کرم اسپام فولڈر چیک کریں اور ایکٹیویٹ کریں۔",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 1: SIGN IN */}
      {/* =================================================================== */}
      {mode === "login" && (
        <div>
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {selectText({ en: "Email Address", bn: "ইমেইল অ্যাড্রেস", ur: "ای میل ایڈریس" })}
              </label>
              <div className="relative mt-1.5">
                <Mail size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  dir="ltr"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {selectText({ en: "Password", bn: "পাসওয়ার্ড", ur: "پاس ورڈ" })}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot_password");
                    setErrorMsg("");
                    setSuccessMsg("");
                    setShowResend(false);
                  }}
                  className="text-xs font-bold text-[#0284c7] hover:underline dark:text-sky-400"
                >
                  {selectText({ en: "Forgot password?", bn: "পাসওয়ার্ড ভুলে গেছেন?", ur: "پاس ورڈ بھول گئے؟" })}
                </button>
              </div>
              <div className="relative mt-1.5">
                <Lock size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  dir="ltr"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-10 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-6 h-12 w-full gap-2 rounded-2xl bg-[#081833] text-sm font-extrabold text-white shadow-xl shadow-[#081833]/20 transition hover:bg-[#0c244b] active:scale-[0.99] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 dark:shadow-sky-500/20"
            >
              {loading ? (
                <span>
                  {selectText({
                    en: "Signing in...",
                    bn: "যাচাই হচ্ছে...",
                    ur: "سائن ان ہو رہا ہے...",
                  })}
                </span>
              ) : (
                <>
                  <span>
                    {selectText({
                      en: "Sign In to Dashboard",
                      bn: "ড্যাশবোর্ডে প্রবেশ করুন",
                      ur: "ڈیش بورڈ میں سائن ان کریں",
                    })}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/95 px-3 font-bold tracking-wider text-slate-400 dark:bg-slate-900/95">
                {selectText({ en: "Or continue with", bn: "অথবা", ur: "یا جاری رکھیں" })}
              </span>
            </div>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            disabled={loading || googleLoading}
            onClick={handleGoogleSignIn}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-60 dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-750 dark:hover:border-slate-600"
          >
            {googleLoading ? (
              <RefreshCw size={18} className="animate-spin text-slate-500 dark:text-slate-400" />
            ) : (
              <GoogleIcon className="size-5 shrink-0" />
            )}
            <span className="text-sm font-bold">
              {selectText({
                en: "Continue with Google",
                bn: "গুগল দিয়ে প্রবেশ করুন (Google)",
                ur: "گوگل کے ساتھ جاری رکھیں (Google)",
              })}
            </span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: SIGN UP / REGISTER */}
      {/* =================================================================== */}
      {mode === "register" && (
        <div>
          <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {selectText({ en: "Full Name", bn: "আপনার পুরো নাম", ur: "پورا نام" })}
              </label>
              <div className="relative mt-1.5">
                <UserIcon size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={selectText({ en: "e.g. Alex Morgan", bn: "যেমন: তানভীর হাসান", ur: "مثلاً: علی احمد" })}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {selectText({ en: "Email Address", bn: "ইমেইল অ্যাড্রেস", ur: "ای میل ایڈریس" })}
              </label>
              <div className="relative mt-1.5">
                <Mail size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  dir="ltr"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {selectText({ en: "Password", bn: "পাসওয়ার্ড", ur: "پاس ورڈ" })}
              </label>
              <div className="relative mt-1.5">
                <Lock size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  dir="ltr"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={selectText({ en: "At least 6 characters", bn: "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড", ur: "کم از کم 6 حروف" })}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-10 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {selectText({ en: "Phone Number (Optional)", bn: "ফোন নম্বর (ঐচ্ছিক)", ur: "فون نمبر (اختیاری)" })}
              </label>
              <div className="relative mt-1.5">
                <Phone size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  dir="ltr"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-6 h-12 w-full gap-2 rounded-2xl bg-[#081833] text-sm font-extrabold text-white shadow-xl shadow-[#081833]/20 transition hover:bg-[#0c244b] active:scale-[0.99] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 dark:shadow-sky-500/20"
            >
              {loading ? (
                <span>
                  {selectText({
                    en: "Creating Account...",
                    bn: "অ্যাকাউন্ট তৈরি হচ্ছে...",
                    ur: "اکاؤنٹ بن رہا ہے...",
                  })}
                </span>
              ) : (
                <>
                  <span>
                    {selectText({
                      en: "Create Account",
                      bn: "অ্যাকাউন্ট তৈরি করুন",
                      ur: "اکاؤنٹ بنائیں",
                    })}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/95 px-3 font-bold tracking-wider text-slate-400 dark:bg-slate-900/95">
                {selectText({ en: "Or continue with", bn: "অথবা", ur: "یا جاری رکھیں" })}
              </span>
            </div>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            disabled={loading || googleLoading}
            onClick={handleGoogleSignIn}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-60 dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-750 dark:hover:border-slate-600"
          >
            {googleLoading ? (
              <RefreshCw size={18} className="animate-spin text-slate-500 dark:text-slate-400" />
            ) : (
              <GoogleIcon className="size-5 shrink-0" />
            )}
            <span className="text-sm font-bold">
              {selectText({
                en: "Sign up with Google",
                bn: "গুগল দিয়ে রেজিস্টার করুন (Google)",
                ur: "گوگل سے رجسٹر کریں (Google)",
              })}
            </span>
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 3: FORGOT PASSWORD */}
      {/* =================================================================== */}
      {mode === "forgot_password" && (
        <form onSubmit={handleForgotPasswordSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {selectText({ en: "Your Registered Email", bn: "আপনার রেজিস্টার্ড ইমেইল", ur: "آپ کا رجسٹرڈ ای میل" })}
            </label>
            <div className="relative mt-1.5">
              <Mail size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
              <input
                dir="ltr"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full gap-2 rounded-2xl bg-[#081833] text-sm font-extrabold text-white shadow-xl hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            {loading ? (
              <span>{selectText({ en: "Sending...", bn: "পাঠানো হচ্ছে...", ur: "بھیجا جا رہا ہے..." })}</span>
            ) : (
              <>
                <span>
                  {selectText({
                    en: "Send Reset Link",
                    bn: "পাসওয়ার্ড রিসেট লিঙ্ক পাঠান",
                    ur: "ری سیٹ لنک بھیجیں",
                  })}
                </span>
                <Send size={16} />
              </>
            )}
          </Button>

          <div className="text-center pt-3">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setSuccessMsg("");
                setShowResend(false);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              ← {selectText({ en: "Back to Sign In", bn: "লগইন পেজে ফিরে যান", ur: "سائن ان پر واپس جائیں" })}
            </button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* VIEW 4: RESET PASSWORD (CONFIRMATION) */}
      {/* =================================================================== */}
      {mode === "reset_password" && (
        <form onSubmit={handleResetPasswordSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {selectText({ en: "New Password", bn: "নতুন পাসওয়ার্ড", ur: "نیا پاس ورڈ" })}
            </label>
            <div className="relative mt-1.5">
              <Lock size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
              <input
                dir="ltr"
                type={showPassword ? "text" : "password"}
                required
                placeholder={selectText({ en: "At least 6 characters", bn: "কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড", ur: "کم از کم 6 حروف" })}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-10 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full gap-2 rounded-2xl bg-[#081833] text-sm font-extrabold text-white shadow-xl hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            {loading ? (
              <span>{selectText({ en: "Updating...", bn: "আপডেট হচ্ছে...", ur: "اپ ڈیٹ ہو رہا ہے..." })}</span>
            ) : (
              <>
                <span>
                  {selectText({
                    en: "Update Password & Login",
                    bn: "পাসওয়ার্ড আপডেট করুন",
                    ur: "پاس ورڈ اپ ڈیٹ کریں اور لاگ ان ہوں",
                  })}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>

          <div className="text-center pt-3">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              ← {selectText({ en: "Back to Sign In", bn: "লগইন পেজে ফিরে যান", ur: "سائن ان پر واپس جائیں" })}
            </button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* VIEW 5: EMAIL CONFIRMATION & VERIFY OTP */}
      {/* =================================================================== */}
      {mode === "verify_otp" && (
        <div className="mt-6 space-y-4">
          {/* Header Card */}
          <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4 text-center dark:border-sky-800/40 dark:bg-sky-950/30">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400">
              <Mail size={24} />
            </div>
            <h3 className="mt-2.5 text-base font-extrabold text-slate-900 dark:text-white">
              {selectText({
                en: "Check & Confirm Your Email",
                bn: "ইমেইল চেক ও কনফার্ম করুন",
                ur: "اپنا ای میل چیک اور تصدیق کریں",
              })}
            </h3>
            <div dir="ltr" className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-sky-700 shadow-sm dark:bg-slate-900 dark:text-sky-300">
              <span>{email}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {selectText({
                en: "Click the 'Confirm email address' link sent to your email (Inbox or Spam folder), or enter the 6-digit verification code below.",
                bn: "আপনার ইমেইলে (ইনবক্স অথবা Spam ফোল্ডারে) পাঠানো 'Confirm email address' লিঙ্কে ক্লিক করুন অথবা নিচের বক্সে ৬-সংখ্যার কোডটি দিন।",
                ur: "آپ کے ای میل پر بھیجے گئے 'Confirm email address' لنک پر کلک کریں یا نیچے 6 ہندسوں کا کوڈ درج کریں۔",
              })}
            </p>
          </div>

          {/* Quick Action: Open Gmail */}
          <a
            href="https://mail.google.com/mail/u/0/#search/from%3Aofficialnijam819%40gmail.com+OR+in%3Aspam"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-sky-300 bg-white text-xs sm:text-sm font-extrabold text-sky-700 shadow-sm transition hover:bg-sky-50 active:scale-[0.99] dark:border-sky-700/60 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
          >
            <Mail size={16} className="text-red-500" />
            <span>
              {selectText({
                en: "Open Gmail",
                bn: "জিমেইল ওপেন করুন (Open Gmail)",
                ur: "جی میل کھولیں (Open Gmail)",
              })}
            </span>
            <ExternalLink size={14} className="opacity-70" />
          </a>

          {/* Direct 6-Digit Code Form */}
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {selectText({
                  en: "Enter 6-Digit Code (if provided)",
                  bn: "৬-সংখ্যার কোড দিন (যদি থাকে)",
                  ur: "6 ہندسوں کا کوڈ درج کریں (اگر موصول ہوا ہو)",
                })}
              </label>
              <div className="relative mt-1">
                <KeyRound size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  dir="ltr"
                  type="text"
                  maxLength={8}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
                  className="w-full tracking-[0.3em] font-mono text-center rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-base font-black text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !otpCode.trim()}
              className="h-11 w-full rounded-xl bg-slate-900 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
              {selectText({
                en: "Verify Code & Enter",
                bn: "কোড দিয়ে প্রবেশ করুন",
                ur: "کوڈ کی تصدیق کریں اور داخل ہوں",
              })}
            </Button>
          </form>

          {/* Direct Link Confirmation Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <Button
              type="button"
              onClick={handleCheckEmailConfirmed}
              disabled={loading}
              variant="outline"
              className="h-11 w-full gap-2 rounded-xl border-emerald-500/40 bg-emerald-50/50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  {selectText({
                    en: "Checking...",
                    bn: "চেক করা হচ্ছে...",
                    ur: "جانچ کی جا رہی ہے...",
                  })}
                </span>
              ) : (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>
                    {selectText({
                      en: "I Clicked Email Link → Enter Dashboard",
                      bn: "আমি লিঙ্কে ক্লিক করেছি → ড্যাশবোর্ডে যান",
                      ur: "میں نے ای میل لنک پر کلک کیا ہے ← ڈیش بورڈ کھولیں",
                    })}
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setSuccessMsg("");
                setShowResend(false);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              ← {selectText({ en: "Back to Sign In", bn: "লগইনে ফিরে যান", ur: "سائن ان پر واپس جائیں" })}
            </button>

            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={handleResendVerification}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 underline disabled:opacity-50"
            >
              {cooldown > 0
                ? `${selectText({ en: "Resend", bn: "পুনরায় পাঠান", ur: "دوبارہ بھیجیں" })} (${cooldown}s)`
                : selectText({
                    en: "Resend Email",
                    bn: "ইমেইল পাননি? আবার পাঠান",
                    ur: "ای میل نہیں ملا؟ دوبارہ بھیجیں",
                  })}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Security Note */}
      <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-center text-[11px] font-semibold text-slate-400 dark:border-slate-800">
        <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
        <span>
          {selectText({
            en: "Secured & encrypted with Supabase Auth",
            bn: "Supabase Auth দ্বারা সুরক্ষিত ও এনক্রিপ্টেড",
            ur: "Supabase Auth کے ساتھ محفوظ اور خفیہ کردہ",
          })}
        </span>
      </div>
    </div>
  );
}
