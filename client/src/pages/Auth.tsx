import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Send,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

type AuthMode = "login" | "register" | "forgot_password" | "reset_password";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mode
  const [mode, setMode] = useState<AuthMode>("login");
  const [lang, setLang] = useState<"en" | "bn">(() => (localStorage.getItem("cycle-language") as "en" | "bn") || "en");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const isBn = lang === "bn";

  const setLanguage = (next: "en" | "bn") => {
    setLang(next);
    localStorage.setItem("cycle-language", next);
  };

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Check URL parameters for password recovery link (#access_token=...&type=recovery)
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      setMode("reset_password");
      setSuccessMsg(
        isBn
          ? "ভেরিফিকেশন লিঙ্ক নিশ্চিত হয়েছে। অনুগ্রহ করে আপনার নতুন পাসওয়ার্ড দিন।"
          : "Recovery link confirmed. Please enter your new password."
      );
    }
  }, [isBn]);

  // If already logged in and not resetting password, redirect to dashboard
  if (user && mode !== "reset_password") {
    setLocation("/dashboard");
    return null;
  }

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setShowResend(false);

    if (!email.trim() || !password) {
      setErrorMsg(isBn ? "ইমেইল এবং পাসওয়ার্ড পূরণ করুন" : "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMsg(
            isBn
              ? "আপনার ইমেইল ভেরিফাই করা হয়নি। আপনার ইনবক্স অথবা Spam / Junk ফোল্ডার চেক করে ভেরিফিকেশন লিঙ্কটিতে ক্লিক করুন।"
              : "Email not confirmed. Please check your Inbox or Spam/Junk folder and click the verification link."
          );
          setShowResend(true);
        } else if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMsg(isBn ? "ইমেইল বা পাসওয়ার্ড সঠিক নয়।" : "Invalid email or password.");
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data.session) {
        localStorage.setItem("cycle_session_token", data.session.access_token);
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setShowResend(false);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg(isBn ? "সকল প্রয়োজনীয় তথ্য পূরণ করুন" : "Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isBn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            name: name.trim(),
            phone: phone.trim() || null,
            language: lang,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Check if user was already confirmed or needs email confirmation
      if (data.user && !data.session) {
        setSuccessMsg(
          isBn
            ? `রেজিস্ট্রেশন সফল হয়েছে! আমরা ${email} ঠিকানায় একটি ভেরিফিকেশন ইমেইল পাঠিয়েছি। অনুগ্রহ করে আপনার ইনবক্স অথবা Spam ফোল্ডার চেক করে লিঙ্কটিতে ক্লিক করুন।`
            : `Registration successful! We have sent a confirmation link to ${email}. Please check your Inbox or Spam folder to activate your account.`
        );
        setShowResend(true);
        setCooldown(60);
      } else if (data.session) {
        localStorage.setItem("cycle_session_token", data.session.access_token);
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Resend Verification Email
  const handleResendVerification = async () => {
    if (!email.trim() || cooldown > 0) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setCooldown(60);
        setSuccessMsg(
          isBn
            ? `ভেরিফিকেশন ইমেইল পুনরায় পাঠানো হয়েছে (${email})। ইনবক্সে না পেলে Spam ফোল্ডার দেখুন।`
            : `Verification email resent to ${email}. If not in inbox, please check your Spam folder.`
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg(isBn ? "আপনার ইমেইল অ্যাড্রেস দিন" : "Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login?type=recovery`,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          isBn
            ? `পাসওয়ার্ড রিসেট করার লিঙ্ক ${email} ঠিকানায় পাঠানো হয়েছে। অনুগ্রহ করে আপনার ইনবক্স অথবা Spam ফোল্ডার চেক করুন।`
            : `Password reset link sent to ${email}. Please check your Inbox or Spam folder.`
        );
        setCooldown(60);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset link");

    } finally {
      setLoading(false);
    }
  };

  // 5. Handle Reset Password (Update password)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword) {
      setErrorMsg(isBn ? "নতুন পাসওয়ার্ড দিন" : "Please enter your new password");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg(isBn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          isBn
            ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! এখন লগইন করুন।"
            : "Password updated successfully! You can now sign in."
        );
        setMode("login");
        setPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-[#38bdf8] selection:text-slate-950 dark:bg-[#060d19] dark:text-slate-100 transition-colors duration-300 ${
        isBn ? "font-bangla" : ""
      }`}
    >
      {/* Background ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden ambient-blur-blob hidden sm:block">
        <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-sky-200/40 blur-[140px] dark:bg-sky-500/10" />
        <div className="absolute top-1/3 -right-40 size-[600px] rounded-full bg-blue-200/40 blur-[150px] dark:bg-blue-600/10" />
      </div>


      {/* Top Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo size={42} className="shrink-0" />
          <span className="text-sm font-extrabold tracking-[0.2em] text-[#0a192f] dark:text-white">
            CYCLE OF CHART
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-full border border-slate-300/80 bg-white/80 text-slate-700 backdrop-blur-md transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Language Switcher */}
          <div className="flex rounded-full border border-slate-300 bg-white/80 p-0.5 backdrop-blur-md dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setLanguage("en")}
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                lang === "en"
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("bn")}
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                lang === "bn"
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
              }`}
            >
              বাং
            </button>
          </div>

          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
            >
              <ArrowLeft size={14} />
              <span>{isBn ? "হোমপেজ" : "Home"}</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
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
                {mode === "login" && (isBn ? "আপনার অ্যাকাউন্টে লগইন করুন" : "Welcome back, Trader")}
                {mode === "register" && (isBn ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create your student account")}
                {mode === "forgot_password" && (isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot Password")}
                {mode === "reset_password" && (isBn ? "নতুন পাসওয়ার্ড সেট করুন" : "Set New Password")}
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {mode === "login" && (isBn ? "আপনার ড্যাশবোর্ড, রোডম্যাপ ও জার্নাল অ্যাক্সেস করুন" : "Access your 12-stage roadmap, library, and trading journal")}
                {mode === "register" && (isBn ? "সঠিক মার্কেট স্ট্রাকচার শিখতে আজই যোগ দিন" : "Join thousands mastering real market structure without hype")}
                {mode === "forgot_password" && (isBn ? "আপনার ইমেইল দিলে আমরা পাসওয়ার্ড রিসেট লিঙ্ক পাঠাব" : "Enter your email to receive a password reset link")}
                {mode === "reset_password" && (isBn ? "আপনার পছন্দের শক্তিশালী নতুন পাসওয়ার্ড দিন" : "Enter your new password below")}
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
                  {isBn ? "লগইন (Sign In)" : "Sign In"}
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
                  {isBn ? "রেজিস্টার (Sign Up)" : "Sign Up"}
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
                            ? isBn
                              ? `পুনরায় লিঙ্ক পাঠান (${cooldown}s)`
                              : `Resend link (${cooldown}s)`
                            : isBn
                              ? "ভেরিফিকেশন লিঙ্ক আবার পাঠান"
                              : "Resend Verification Link"}
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
                            ? isBn
                              ? `আবার পাঠাতে অপেক্ষা করুন (${cooldown}s)`
                              : `Resend available in ${cooldown}s`
                            : isBn
                              ? "ইমেইল পাননি? পুনরায় পাঠান"
                              : "Didn't receive email? Resend"}
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
                      <span>{isBn ? "📌 গুরুত্বপূর্ণ নোট (Spam ফোল্ডার চেক করুন):" : "📌 Important Note (Check Spam Folder):"}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300">
                      {isBn
                        ? "ভেরিফিকেশন ইমেইলটি অনেক সময় ইনবক্সে না গিয়ে 'Spam' (স্প্যাম) বা 'Junk' ফোল্ডারে জমা হতে পারে। ইনবক্সে ইমেইল না পেলে অনুগ্রহ করে আপনার Spam ফোল্ডার চেক করুন এবং 'Report not spam' বা লিঙ্কটিতে ক্লিক করুন।"
                        : "Verification emails may occasionally be filtered into your 'Spam' or 'Junk' folder. If you don't see it in your inbox, please check your Spam folder and click the link to activate."}
                    </p>
                  </div>
                </div>
              </div>
            )}


            {/* =================================================================== */}
            {/* VIEW 1: SIGN IN */}
            {/* =================================================================== */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"}
                  </label>
                  <div className="relative mt-1.5">
                    <Mail size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                    <input
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
                      {isBn ? "পাসওয়ার্ড" : "Password"}
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
                      {isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                    <input
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
                    <span>{isBn ? "যাচাই হচ্ছে..." : "Signing in..."}</span>
                  ) : (
                    <>
                      <span>{isBn ? "ড্যাশবোর্ডে প্রবেশ করুন" : "Sign In to Dashboard"}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* =================================================================== */}
            {/* VIEW 2: SIGN UP / REGISTER */}
            {/* =================================================================== */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "আপনার পুরো নাম" : "Full Name"}
                  </label>
                  <div className="relative mt-1.5">
                    <UserIcon size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder={isBn ? "যেমন: তানভীর হাসান" : "e.g. Alex Morgan"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-10 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#0284c7]/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"}
                  </label>
                  <div className="relative mt-1.5">
                    <Mail size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                    <input
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
                    {isBn ? "পাসওয়ার্ড" : "Password"}
                  </label>
                  <div className="relative mt-1.5">
                    <Lock size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={isBn ? "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড" : "At least 6 characters"}
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
                    {isBn ? "ফোন / হোয়াটসঅ্যাপ (ঐচ্ছিক)" : "Phone / WhatsApp (Optional)"}
                  </label>
                  <div className="relative mt-1.5">
                    <Phone size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                    <input
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
                    <span>{isBn ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "Creating Account..."}</span>
                  ) : (
                    <>
                      <span>{isBn ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account"}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* =================================================================== */}
            {/* VIEW 3: FORGOT PASSWORD */}
            {/* =================================================================== */}
            {mode === "forgot_password" && (
              <form onSubmit={handleForgotPasswordSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isBn ? "আপনার রেজিস্টার্ড ইমেইল" : "Your Registered Email"}
                  </label>
                  <div className="relative mt-1.5">
                    <Mail size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                    <input
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
                    <span>{isBn ? "পাঠানো হচ্ছে..." : "Sending..."}</span>
                  ) : (
                    <>
                      <span>{isBn ? "পাসওয়ার্ড রিসেট লিঙ্ক পাঠান" : "Send Reset Link"}</span>
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
                    ← {isBn ? "লগইন পেজে ফিরে যান" : "Back to Sign In"}
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
                    {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
                  </label>
                  <div className="relative mt-1.5">
                    <Lock size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={isBn ? "কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড" : "At least 6 characters"}
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
                    <span>{isBn ? "আপডেট হচ্ছে..." : "Updating..."}</span>
                  ) : (
                    <>
                      <span>{isBn ? "পাসওয়ার্ড আপডেট করুন" : "Update Password & Login"}</span>
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
                    ← {isBn ? "লগইন পেজে ফিরে যান" : "Back to Sign In"}
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Security Note */}
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-center text-[11px] font-semibold text-slate-400 dark:border-slate-800">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              <span>
                {isBn
                  ? "Supabase Auth দ্বারা সুরক্ষিত ও এনক্রিপ্টেড"
                  : "Secured & encrypted with Supabase Auth"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
