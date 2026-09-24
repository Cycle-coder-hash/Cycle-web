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
  ExternalLink,
  KeyRound,
  RefreshCw,
  Send,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { trpc } from "@/lib/trpc";

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

type AuthMode = "login" | "register" | "forgot_password" | "reset_password" | "verify_otp";

export default function Auth() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mode
  const [mode, setMode] = useState<AuthMode>(() =>
    location === "/register" ? "register" : "login"
  );
  const { t, language, isRTL } = useLanguage();
  const isBn = language === "bn";

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // tRPC Mutations for native auth fallback
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const verifyOtpMutation = trpc.auth.verifyEmailOtp.useMutation();
  const resendOtpMutation = trpc.auth.resendOtp.useMutation();

  // Helper to determine return redirect destination after authentication
  const getRedirectUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || sessionStorage.getItem("cycle_auth_redirect");
      if (redirect && (redirect.startsWith("/") || redirect.startsWith("#"))) {
        sessionStorage.removeItem("cycle_auth_redirect");
        return redirect;
      }
    } catch {}
    return "/dashboard";
  };

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Sync mode if URL route path changes
  useEffect(() => {
    if (location === "/register" && mode === "login") {
      setMode("register");
    } else if (location === "/login" && mode === "register") {
      setMode("login");
    }
  }, [location]);

  // Check URL parameters for OAuth callbacks, hash tokens, redirect, or errors
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;

    const searchParams = new URLSearchParams(search);
    const redirectParam = searchParams.get("redirect");
    if (redirectParam) {
      sessionStorage.setItem("cycle_auth_redirect", redirectParam);
    }

    // 1. Check for error in hash or query (e.g. expired confirmation link or OAuth error)
    if (hash.includes("error=") || search.includes("error=")) {
      const params = new URLSearchParams(hash ? hash.replace(/^#/, "") : search.replace(/^\?/, ""));
      const desc = params.get("error_description") || params.get("error");
      setErrorMsg(
        isBn
          ? `ভেরিফিকেশন বা সাইন-ইন লিঙ্কে সমস্যা হয়েছে (${desc || "Error"}). অনুগ্রহ করে আবার চেষ্টা করুন।`
          : `Verification or authentication error (${desc || "Error"}). Please try again.`
      );
      setShowResend(true);
      try {
        window.history.replaceState(null, "", window.location.pathname);
      } catch {}
      return;
    }

    // 2. Check for password recovery link
    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      setMode("reset_password");
      setSuccessMsg(
        isBn
          ? "ভেরিফিকেশন লিঙ্ক নিশ্চিত হয়েছে। অনুগ্রহ করে আপনার নতুন পাসওয়ার্ড দিন।"
          : "Recovery link confirmed. Please enter your new password."
      );
      return;
    }

    // 3. Check for OAuth code exchange (?code=...)
    const code = searchParams.get("code");
    if (code) {
      setLoading(true);
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }
          if (data?.session) {
            localStorage.setItem("cycle_session_token", data.session.access_token);
            setSuccessMsg(
              isBn
                ? "গুগল দিয়ে সফলভাবে লগইন হয়েছে! প্রবেশ করানো হচ্ছে..."
                : "Signed in with Google successfully! Entering portal..."
            );
            try {
              window.history.replaceState(null, "", window.location.pathname);
            } catch {}
            setTimeout(() => {
              window.location.href = getRedirectUrl();
            }, 500);
          }
        })
        .catch((err: any) => {
          console.error("[OAuth code exchange error]:", err);
          setErrorMsg(
            err.message ||
              (isBn
                ? "গুগল সাইন ইন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
                : "Failed to complete Google sign-in. Please try again.")
          );
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // 4. Check for email verification / confirmation / OAuth access_token
    if (hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const token = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (token) {
        try {
          localStorage.setItem("cycle_session_token", token);
          if (refreshToken) {
            supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
          }
        } catch {}
        setSuccessMsg(
          isBn
            ? "সফলভাবে প্রবেশ সম্পন্ন হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে..."
            : "Signed in successfully! Entering portal..."
        );
        try {
          window.history.replaceState(null, "", window.location.pathname);
        } catch {}
        setTimeout(() => {
          window.location.href = getRedirectUrl();
        }, 500);
      }
    }
  }, [isBn]);

  // If already logged in and not resetting password, redirect to target or dashboard
  if (user && mode !== "reset_password") {
    const target = getRedirectUrl();
    window.location.href = target;
    return null;
  }

  // 0. Handle Google OAuth Sign In / Sign Up
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setGoogleLoading(true);
    try {
      const target = getRedirectUrl();
      if (target) {
        sessionStorage.setItem("cycle_auth_redirect", target);
      }

      const redirectTo = `${window.location.origin}/login`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("[Google Auth Error]:", err);
      setErrorMsg(
        err.message ||
          (isBn
            ? "গুগল দিয়ে সাইন ইন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "Failed to sign in with Google. Please try again.")
      );
      setGoogleLoading(false);
    }
  };

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
      // 1. Try Supabase signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setMode("verify_otp");
          setErrorMsg(
            isBn
              ? "আপনার ইমেইল এখনও নিশ্চিত করা হয়নি। আপনার ইনবক্স অথবা Spam ফোল্ডার থেকে 'Confirm email address' লিঙ্কে ক্লিক করুন।"
              : "Email not confirmed yet. Please open your Inbox or Spam folder and click the 'Confirm email address' link."
          );
          setShowResend(true);
          try {
            await supabase.auth.resend({
              type: "signup",
              email: email.trim(),
              options: { emailRedirectTo: `${window.location.origin}/dashboard` },
            });
            await resendOtpMutation.mutateAsync({ email: email.trim(), type: "email_verify" });
          } catch {}
          return;
        }

        // Try local server database authentication fallback
        try {
          const serverRes = await loginMutation.mutateAsync({
            email: email.trim(),
            password,
          });

          if (serverRes?.requiresVerification) {
            setMode("verify_otp");
            setErrorMsg(
              isBn
                ? "আপনার অ্যাকাউন্ট অ্যাক্টিভ করতে ইমেইলে পাঠানো ৬-সংখ্যার কোডটি নিচে দিন।"
                : "Please enter the 6-digit code sent to your email to activate your account."
            );
            setShowResend(true);
            return;
          }

          if (serverRes?.token) {
            localStorage.setItem("cycle_session_token", serverRes.token);
            window.location.href = getRedirectUrl();
            return;
          }
        } catch (serverErr: any) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            setErrorMsg(isBn ? "ইমেইল বা পাসওয়ার্ড সঠিক নয়।" : "Invalid email or password.");
          } else {
            setErrorMsg(error.message || serverErr.message);
          }
          return;
        }
        return;
      }

      if (data.session) {
        localStorage.setItem("cycle_session_token", data.session.access_token);
        try {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        } catch {}
        if (data.user) {
          const uInfo = {
            id: 1,
            openId: data.user.id,
            name:
              data.user.user_metadata?.name ||
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "Trader",
            email: data.user.email,
            passwordHash: null,
            phone: data.user.user_metadata?.phone || null,
            role: "user",
            loginMethod: "supabase",
            avatar:
              data.user.user_metadata?.avatar_url ||
              data.user.user_metadata?.avatar ||
              data.user.user_metadata?.picture ||
              null,
            language: (data.user.user_metadata?.language === "bn" || data.user.user_metadata?.language === "ur" || data.user.user_metadata?.language === "en")
              ? data.user.user_metadata.language
              : (language === "bn" ? "bn" : language === "ur" ? "ur" : "en"),
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          };
          localStorage.setItem("manus-runtime-user-info", JSON.stringify(uInfo));
        }
        window.location.href = getRedirectUrl();
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
      // 1. Register with Supabase
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              name: name.trim(),
              phone: phone.trim() || null,
              language: language === "bn" ? "bn" : language === "ur" ? "ur" : "en",
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          const errLower = error.message.toLowerCase();
          if (
            errLower.includes("already registered") ||
            errLower.includes("already exists") ||
            errLower.includes("user already registered")
          ) {
            setMode("login");
            setErrorMsg(
              isBn
                ? "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে আপনার পাসওয়ার্ড দিয়ে সাইন ইন করুন।"
                : "An account with this email already exists. Please sign in with your password."
            );
            return;
          }
          throw error;
        }

        // Supabase returns an empty identities array if user already exists
        if (data?.user?.identities && data.user.identities.length === 0) {
          setMode("login");
          setErrorMsg(
            isBn
              ? "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে আপনার পাসওয়ার্ড দিয়ে সাইন ইন করুন বা পাসওয়ার্ড রিসেট করুন।"
              : "This email is already registered. Please sign in with your password or reset your password."
          );
          return;
        }

        if (data?.session) {
          localStorage.setItem("cycle_session_token", data.session.access_token);
          try {
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
          } catch {}
          if (data.user) {
            const uInfo = {
              id: 1,
              openId: data.user.id,
              name:
                data.user.user_metadata?.name ||
                data.user.user_metadata?.full_name ||
                data.user.email?.split("@")[0] ||
                "Trader",
              email: data.user.email,
              passwordHash: null,
              phone: data.user.user_metadata?.phone || null,
              role: "user",
              loginMethod: "supabase",
              avatar:
                data.user.user_metadata?.avatar_url ||
                data.user.user_metadata?.avatar ||
                data.user.user_metadata?.picture ||
                null,
              language: (data.user.user_metadata?.language === "bn" || data.user.user_metadata?.language === "ur" || data.user.user_metadata?.language === "en")
                ? data.user.user_metadata.language
                : (language === "bn" ? "bn" : language === "ur" ? "ur" : "en"),
              emailVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastSignedIn: new Date(),
            };
            localStorage.setItem("manus-runtime-user-info", JSON.stringify(uInfo));
          }
          window.location.href = getRedirectUrl();
          return;
        }
      } catch (supaErr: any) {
        console.warn("[Supabase registration notice]:", supaErr);
        if (supaErr?.message && !supaErr.message.toLowerCase().includes("failed to fetch")) {
          setErrorMsg(supaErr.message);
          return;
        }
      }

      // 2. Sync / Register with native server
      try {
        await registerMutation.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          language: language === "bn" ? "bn" : language === "ur" ? "ur" : "en",
        });
      } catch (serverErr) {
        console.warn("[Server registration notice]:", serverErr);
      }

      // If no immediate session, user must verify email / OTP
      setMode("verify_otp");
      setSuccessMsg(
        isBn
          ? `রেজিস্ট্রেশন সফল হয়েছে! আমরা ${email} ঠিকানায় কনফার্মেশন লিঙ্ক পাঠিয়েছি। অনুগ্রহ করে আপনার ইনবক্স অথবা Spam ফোল্ডার থেকে 'Confirm email address' লিঙ্কে ক্লিক করুন।`
          : `Registration successful! We have sent a confirmation link to ${email}. Please check your Inbox or Spam folder and click 'Confirm email address'.`
      );
      setShowResend(true);
      setCooldown(60);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Resend Verification Email & OTP
  const handleResendVerification = async () => {
    if (!email.trim() || cooldown > 0) return;
    setLoading(true);
    setErrorMsg("");
    try {
      try {
        await supabase.auth.resend({
          type: "signup",
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
      } catch {}

      try {
        await resendOtpMutation.mutateAsync({
          email: email.trim(),
          type: "email_verify",
        });
      } catch {}

      setCooldown(60);
      setSuccessMsg(
        isBn
          ? `কনফার্মেশন লিঙ্ক ও কোড পুনরায় পাঠানো হয়েছে (${email})। ইনবক্সে না পেলে Spam ফোল্ডার দেখুন।`
          : `Confirmation link and code resent to ${email}. If not in inbox, please check your Spam folder.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle "I Confirmed Link / Check Confirmation Status"
  const handleCheckEmailConfirmed = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Check if Supabase session is already established
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        localStorage.setItem("cycle_session_token", sessionData.session.access_token);
        setSuccessMsg(isBn ? "ইমেইল ভেরিফাই হয়েছে! ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে..." : "Email verified! Entering dashboard...");
        window.location.href = getRedirectUrl();
        return;
      }

      // 2. If password is known in state, try signing in to test if email is now confirmed
      if (password) {
        const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signData?.session) {
          localStorage.setItem("cycle_session_token", signData.session.access_token);
          setSuccessMsg(isBn ? "ইমেইল ভেরিফাই হয়েছে! ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে..." : "Email verified! Entering dashboard...");
          window.location.href = getRedirectUrl();
          return;
        }

        if (signErr) {
          const msg = signErr.message.toLowerCase();
          if (msg.includes("not confirmed") || msg.includes("email_not_confirmed")) {
            setErrorMsg(
              isBn
                ? "আপনার ইমেইলটি এখনও কনফার্ম করা হয়নি। অনুগ্রহ করে জিমেইল (Inbox অথবা Spam ফোল্ডার) থেকে 'Confirm email address' লিঙ্কে ক্লিক করুন।"
                : "Your email has not been confirmed yet. Please check your Gmail (Inbox or Spam folder) and click the 'Confirm email address' link."
            );
            return;
          }
          throw signErr;
        }
      } else {
        // Switch to login with instruction
        setMode("login");
        setSuccessMsg(
          isBn
            ? "ইমেইল কনফার্ম করা হয়ে থাকলে আপনার পাসওয়ার্ড দিয়ে সাইন ইন করুন।"
            : "If you clicked the email confirmation link, please sign in with your password."
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? "কনফার্মেশন পাওয়া যায়নি।" : "Confirmation not detected yet."));
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle OTP Code Verification
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMsg(isBn ? "সঠিক ভেরিফিকেশন কোড লিখুন" : "Please enter a valid verification code");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const code = otpCode.trim();

    try {
      // 1. Try Supabase verifyOtp first
      try {
        const { data: supaData, error: supaErr } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code,
          type: "signup",
        });

        if (supaData?.session) {
          localStorage.setItem("cycle_session_token", supaData.session.access_token);
          setSuccessMsg(isBn ? "ভেরিফিকেশন সফল হয়েছে!" : "Verification successful!");
          window.location.href = getRedirectUrl();
          return;
        }

        if (supaErr) {
          const retryRes = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: code,
            type: "email",
          });
          if (retryRes.data?.session) {
            localStorage.setItem("cycle_session_token", retryRes.data.session.access_token);
            setSuccessMsg(isBn ? "ভেরিফিকেশন সফল হয়েছে!" : "Verification successful!");
            window.location.href = getRedirectUrl();
            return;
          }
        }
      } catch (e) {
        console.warn("[Supabase verifyOtp fallback]:", e);
      }

      // 2. Try native server verifyEmailOtp
      const serverRes = await verifyOtpMutation.mutateAsync({
        email: email.trim(),
        otp: code,
      });

      if (serverRes?.token) {
        localStorage.setItem("cycle_session_token", serverRes.token);
        setSuccessMsg(isBn ? "ভেরিফিকেশন সফল হয়েছে!" : "Verification successful!");
        window.location.href = getRedirectUrl();
        return;
      }

      throw new Error(isBn ? "ভেরিফিকেশন কোডটি সঠিক নয় বা মেয়াদ শেষ হয়েছে" : "Invalid or expired verification code");
    } catch (err: any) {
      setErrorMsg(err.message || (isBn ? "ভেরিফিকেশন কোডটি সঠিক নয়" : "Invalid verification code"));
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
      className={`min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-[#38bdf8] selection:text-slate-950 dark:bg-[#070e1b] dark:text-slate-100 transition-colors duration-300 ${
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
          <LanguageSelector />

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
                {mode === "verify_otp" && (isBn ? "ইমেইল ভেরিফিকেশন" : "Verify Your Email")}
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {mode === "login" && (isBn ? "আপনার ড্যাশবোর্ড, লাইব্রেরি ও জার্নাল অ্যাক্সেস করুন" : "Access your institutional library, discipline and trading journal")}
                {mode === "register" && (isBn ? "সঠিক মার্কেট স্ট্রাকচার শিখতে আজই যোগ দিন" : "Join thousands mastering real market structure without hype")}
                {mode === "forgot_password" && (isBn ? "আপনার ইমেইল দিলে আমরা পাসওয়ার্ড রিসেট লিঙ্ক পাঠাব" : "Enter your email to receive a password reset link")}
                {mode === "reset_password" && (isBn ? "আপনার পছন্দের শক্তিশালী নতুন পাসওয়ার্ড দিন" : "Enter your new password below")}
                {mode === "verify_otp" && (isBn ? "আপনার অ্যাকাউন্টে প্রবেশ করতে ইমেইলে পাঠানো কোডটি দিন" : "Enter the confirmation code sent to your email to activate your account")}
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
              <div>
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

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/95 px-3 font-bold tracking-wider text-slate-400 dark:bg-slate-900/95">
                      {isBn ? "অথবা" : "Or continue with"}
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
                    {isBn ? "গুগল দিয়ে প্রবেশ করুন (Google)" : "Continue with Google"}
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
                      {isBn ? "ফোন নম্বর (ঐচ্ছিক)" : "Phone Number (Optional)"}
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

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/95 px-3 font-bold tracking-wider text-slate-400 dark:bg-slate-900/95">
                      {isBn ? "অথবা" : "Or continue with"}
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
                    {isBn ? "গুগল দিয়ে রেজিস্টার করুন (Google)" : "Sign up with Google"}
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
                    {isBn ? "ইমেইল চেক ও কনফার্ম করুন" : "Check & Confirm Your Email"}
                  </h3>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-sky-700 shadow-sm dark:bg-slate-900 dark:text-sky-300">
                    <span>{email}</span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {isBn
                      ? "আপনার ইমেইলে (ইনবক্স অথবা Spam ফোল্ডারে) পাঠানো 'Confirm email address' লিঙ্কে ক্লিক করুন অথবা নিচের বক্সে ৬-সংখ্যার কোডটি দিন।"
                      : "Click the 'Confirm email address' link sent to your email (Inbox or Spam folder), or enter the 6-digit verification code below."}
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
                  <span>{isBn ? "জিমেইল ওপেন করুন (Open Gmail)" : "Open Gmail"}</span>
                  <ExternalLink size={14} className="opacity-70" />
                </a>

                {/* Direct 6-Digit Code Form */}
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {isBn ? "৬-সংখ্যার কোড দিন (যদি থাকে)" : "Enter 6-Digit Code (if provided)"}
                    </label>
                    <div className="relative mt-1">
                      <KeyRound size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
                      <input
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
                    {isBn ? "কোড দিয়ে প্রবেশ করুন" : "Verify Code & Enter"}
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
                        {isBn ? "চেক করা হচ্ছে..." : "Checking..."}
                      </span>
                    ) : (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>
                          {isBn
                            ? "আমি লিঙ্কে ক্লিক করেছি → ড্যাশবোর্ডে যান"
                            : "I Clicked Email Link → Enter Dashboard"}
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
                    ← {isBn ? "লগইনে ফিরে যান" : "Back to Sign In"}
                  </button>

                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={handleResendVerification}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 underline disabled:opacity-50"
                  >
                    {cooldown > 0
                      ? `${isBn ? "পুনরায় পাঠান" : "Resend"} (${cooldown}s)`
                      : isBn
                        ? "ইমেইল পাননি? আবার পাঠান"
                        : "Resend Email"}
                  </button>
                </div>
              </div>
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
