import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { trpc } from "@/lib/trpc";
import { AuthModeForms, type AuthMode } from "./auth/AuthModeForms";

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
          <HeaderBrandWordmark className="text-xs sm:text-sm" />
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
          <AuthModeForms
            mode={mode} setMode={setMode} isBn={isBn}
            name={name} setName={setName} email={email} setEmail={setEmail}
            password={password} setPassword={setPassword} newPassword={newPassword} setNewPassword={setNewPassword}
            phone={phone} setPhone={setPhone} showPassword={showPassword} setShowPassword={setShowPassword}
            otpCode={otpCode} setOtpCode={setOtpCode} loading={loading} googleLoading={googleLoading}
            errorMsg={errorMsg} setErrorMsg={setErrorMsg} successMsg={successMsg} setSuccessMsg={setSuccessMsg}
            showResend={showResend} setShowResend={setShowResend} cooldown={cooldown}
            handleGoogleSignIn={handleGoogleSignIn} handleLoginSubmit={handleLoginSubmit}
            handleRegisterSubmit={handleRegisterSubmit} handleResendVerification={handleResendVerification}
            handleCheckEmailConfirmed={handleCheckEmailConfirmed} handleVerifyOtpSubmit={handleVerifyOtpSubmit}
            handleForgotPasswordSubmit={handleForgotPasswordSubmit} handleResetPasswordSubmit={handleResetPasswordSubmit}
          />
        </div>
      </main>
    </div>
  );
}
