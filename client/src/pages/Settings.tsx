import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences, SUPPORTED_TIMEZONES, SUPPORTED_CURRENCIES } from "@/contexts/UserPreferencesContext";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadImage } from "@/lib/mediaUpload";
import { supabase } from "@/lib/supabase";
import {
  User,
  ShieldCheck,
  Palette,
  Globe,
  HelpCircle,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  Sparkles,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Layers,
  ChevronRight,
  Loader2,
  Check,
  Sun,
  Moon,
  Laptop,
  CheckCircle,
} from "lucide-react";

type SettingsTab = "account" | "appearance" | "region" | "security" | "support";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, language, currentOption, setCountryLanguage, allOptions, isRTL } = useLanguage();
  const isBn = language === "bn";

  const {
    timezone,
    setTimezone,
    currency,
    setCurrency,
    currentCurrency,
    currentTimezone,
    allTimezones,
    allCurrencies,
  } = useUserPreferences();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const utils = trpc.useUtils();

  // Queries
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = trpc.auth.getSettings.useQuery(
    undefined,
    {
      enabled: !!user,
      staleTime: 1000 * 30,
    }
  );

  // Mutations
  const updateProfileMutation = trpc.auth.updateProfile.useMutation();
  const changePasswordMutation = trpc.auth.changePassword.useMutation();
  const logoutAllDevicesMutation = trpc.auth.logoutAllDevices.useMutation();
  const updatePreferencesMutation = trpc.auth.updatePreferences.useMutation();

  // User Profile Form States
  const [name, setName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [username, setUsername] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  // Avatar State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Logout All Confirmation Modal State
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Live Timezone Clock
  const [liveClock, setLiveClock] = useState("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const formatted = new Intl.DateTimeFormat(undefined, {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date());
        setLiveClock(formatted);
      } catch {
        setLiveClock(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  // Sync loaded data into form fields
  useEffect(() => {
    if (settingsData) {
      setName(settingsData.name || "");
      setUsername(settingsData.username || "");
      setAvatar(settingsData.avatar || null);
    } else if (user) {
      const userKey = user.openId || user.email || String(user.id);
      const storedName = typeof window !== "undefined" ? localStorage.getItem(`cycle_user_custom_name_${userKey}`) : null;
      const storedAvatar = typeof window !== "undefined" ? localStorage.getItem(`cycle_user_avatar_${userKey}`) : null;
      setName(storedName || user.name || "");
      setAvatar(storedAvatar || (user as any).avatar || null);
    }
  }, [settingsData, user]);

  // Live username availability check debounce
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean === (settingsData?.username || "").toLowerCase()) {
      setUsernameAvailability({ checking: false });
      return;
    }

    if (clean.length < 3) {
      setUsernameAvailability({
        checking: false,
        available: false,
        reason: isBn ? "ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে" : "Must be at least 3 characters",
      });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameAvailability({
        checking: false,
        available: false,
        reason: isBn ? "শুধুমাত্র ইংরেজি অক্ষর, সংখ্যা এবং _ ব্যবহারযোগ্য" : "Letters, numbers, and _ only",
      });
      return;
    }

    setUsernameAvailability({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await utils.auth.checkUsername.fetch({ username: clean });
        setUsernameAvailability({
          checking: false,
          available: res.available,
          reason: res.reason,
        });
      } catch {
        setUsernameAvailability({ checking: false, available: true });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [username, settingsData?.username, utils, isBn]);

  // Save Display Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error(isBn ? "নাম কমপক্ষে ২ অক্ষরের হতে হবে" : "Name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 50) {
      toast.error(isBn ? "নাম সর্বোচ্চ ৫০ অক্ষরের হতে হবে" : "Name cannot exceed 50 characters");
      return;
    }

    setIsSavingName(true);
    try {
      const userKey = user?.openId || user?.email || String(user?.id);
      if (userKey) {
        localStorage.setItem(`cycle_user_custom_name_${userKey}`, trimmed);
        const cached = localStorage.getItem("manus-runtime-user-info");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.name = trimmed;
            localStorage.setItem("manus-runtime-user-info", JSON.stringify(parsed));
          } catch {}
        }
      }

      await updateProfileMutation.mutateAsync({ name: trimmed });
      try {
        await supabase.auth.updateUser({ data: { name: trimmed, full_name: trimmed } });
      } catch {}

      await utils.auth.me.invalidate();
      await utils.auth.getSettings.invalidate();
      await utils.leaderboard.rankings.invalidate();

      window.dispatchEvent(
        new CustomEvent("cycle_user_profile_updated", {
          detail: { userId: userKey, name: trimmed },
        })
      );

      toast.success(isBn ? "প্রোফাইল নাম সফলভাবে সেভ হয়েছে!" : "Display name updated successfully!");
    } catch (err: any) {
      toast.error(err.message || (isBn ? "নাম সেভ করা যায়নি" : "Failed to update display name"));
    } finally {
      setIsSavingName(false);
    }
  };

  // Save Username
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().toLowerCase();
    if (!clean) return;

    if (usernameAvailability.available === false) {
      toast.error(usernameAvailability.reason || (isBn ? "ইউজারনেম ব্যবহার করা যাবে না" : "Username unavailable"));
      return;
    }

    setIsSavingUsername(true);
    try {
      await updateProfileMutation.mutateAsync({ username: clean });
      await utils.auth.me.invalidate();
      await utils.auth.getSettings.invalidate();

      toast.success(isBn ? `@${clean} ইউজারনেম সফলভাবে সেভ হয়েছে!` : `Username claimed: @${clean}`);
    } catch (err: any) {
      toast.error(err.message || (isBn ? "ইউজারনেম সেভ করা যায়নি" : "Failed to save username"));
    } finally {
      setIsSavingUsername(false);
    }
  };

  // Avatar Upload with Square Crop to 400x400 WebP
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      toast.error(isBn ? "JPG, PNG অথবা WEBP ফরম্যাটের ছবি দিন" : "Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error(isBn ? "ছবির সাইজ ৮ মেগাবাইটের কম হতে হবে" : "Image file size must be under 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

        const dataUrl = canvas.toDataURL("image/webp", 0.9);
        const userKey = user.openId || user.email || String(user.id);

        setAvatar(dataUrl);
        setIsUploadingAvatar(true);
        const toastId = toast.loading(isBn ? "ক্লাউডে ছবি আপলোড হচ্ছে..." : "Uploading photo to cloud...");

        uploadImage(dataUrl, `avatar_${userKey}.webp`)
          .then(async (cloudUrl) => {
            setAvatar(cloudUrl);

            try {
              localStorage.setItem(`cycle_user_avatar_${userKey}`, cloudUrl);
              const cached = localStorage.getItem("manus-runtime-user-info");
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed) {
                  parsed.avatar = cloudUrl;
                  localStorage.setItem("manus-runtime-user-info", JSON.stringify(parsed));
                }
              }
            } catch {}

            await updateProfileMutation.mutateAsync({ avatar: cloudUrl });

            try {
              await supabase.auth.updateUser({
                data: { avatar: cloudUrl, avatar_url: cloudUrl },
              });
            } catch {}

            await utils.auth.me.invalidate();
            await utils.auth.getSettings.invalidate();
            await utils.leaderboard.rankings.invalidate();

            window.dispatchEvent(
              new CustomEvent("cycle_user_profile_updated", {
                detail: { userId: userKey, avatar: cloudUrl },
              })
            );

            toast.success(isBn ? "প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!" : "Profile photo updated successfully!", {
              id: toastId,
            });
          })
          .catch((err) => {
            console.error("[Avatar upload failed]:", err);
            toast.error(isBn ? "ক্লাউডে ছবি আপলোড ব্যর্থ হয়েছে" : "Failed to upload photo to cloud", { id: toastId });
          })
          .finally(() => {
            setIsUploadingAvatar(false);
          });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    if (!avatar) return;
    setIsRemovingAvatar(true);
    const toastId = toast.loading(isBn ? "ছবি সরানো হচ্ছে..." : "Removing avatar...");
    try {
      const userKey = user?.openId || user?.email || String(user?.id);
      if (userKey) {
        try {
          localStorage.removeItem(`cycle_user_avatar_${userKey}`);
          const cached = localStorage.getItem("manus-runtime-user-info");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed) {
              parsed.avatar = null;
              localStorage.setItem("manus-runtime-user-info", JSON.stringify(parsed));
            }
          }
        } catch {}
      }

      await updateProfileMutation.mutateAsync({ avatar: null });

      try {
        await supabase.auth.updateUser({
          data: { avatar: null, avatar_url: null },
        });
      } catch {}

      setAvatar(null);
      await utils.auth.me.invalidate();
      await utils.auth.getSettings.invalidate();
      await utils.leaderboard.rankings.invalidate();

      window.dispatchEvent(
        new CustomEvent("cycle_user_profile_updated", {
          detail: { userId: userKey, avatar: null },
        })
      );

      toast.success(isBn ? "প্রোফাইল ছবি সরানো হয়েছে" : "Profile photo removed", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || (isBn ? "ছবি সরাতে সমস্যা হয়েছে" : "Failed to remove avatar"), { id: toastId });
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(isBn ? "বর্তমান পাসওয়ার্ড প্রদান করুন" : "Enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error(isBn ? "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(isBn ? "নতুন পাসওয়ার্ড দুটি মিলছে না" : "New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success(res.message || (isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!" : "Password updated successfully!"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || (isBn ? "পাসওয়ার্ড পরিবর্তন করা যায়নি" : "Failed to change password"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Logout from All Devices
  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true);
    try {
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch {}

      await logoutAllDevicesMutation.mutateAsync();

      try {
        localStorage.removeItem("cycle_session_token");
        sessionStorage.removeItem("manus-cookie");
        localStorage.removeItem("manus-runtime-user-info");
      } catch {}

      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();

      toast.success(isBn ? "সকল ডিভাইস থেকে লগআউট সফল হয়েছে" : "Logged out from all devices");
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err.message || (isBn ? "লগআউট ব্যর্থ হয়েছে" : "Failed to logout from all devices"));
    } finally {
      setIsLoggingOutAll(false);
      setShowLogoutAllModal(false);
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070e1b] flex flex-col items-center justify-center gap-4 text-slate-300">
        <BrandLogo size={56} className="animate-pulse" />
        <p className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
          {isBn ? "সেটিংস লোড হচ্ছে..." : "Loading Settings..."}
        </p>
      </div>
    );
  }

  // Not signed in redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070e1b] flex flex-col items-center justify-center p-6 text-center text-slate-200">
        <BrandLogo size={56} className="mb-4" />
        <h2 className="text-xl font-extrabold text-white mb-2">
          {isBn ? "লগইন করা আবশ্যক" : "Sign In Required"}
        </h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          {isBn
            ? "আপনার অ্যাকাউন্ট সেটিংস পরিচালনা করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।"
            : "Please sign in to your trader account to manage your profile and preferences."}
        </p>
        <Link href="/login">
          <Button className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6">
            {isBn ? "সাইন ইন করুন" : "Sign In to Account"}
          </Button>
        </Link>
      </div>
    );
  }

  const tabs: { id: SettingsTab; labelEn: string; labelBn: string; icon: any; descEn: string; descBn: string }[] = [
    {
      id: "account",
      labelEn: "Profile Account",
      labelBn: "প্রোফাইল অ্যাকাউন্ট",
      icon: User,
      descEn: "Name, photo, username, verified email",
      descBn: "নাম, ছবি, ইউজারনেম, ইমেইল",
    },
    {
      id: "appearance",
      labelEn: "Appearance",
      labelBn: "থিম ও ডিসপ্লে",
      icon: Palette,
      descEn: "Dark mode, institutional contrast",
      descBn: "ডার্ক মোড ও ভিজ্যুয়াল স্টাইল",
    },
    {
      id: "region",
      labelEn: "Language & Region",
      labelBn: "ভাষা ও অঞ্চল",
      icon: Globe,
      descEn: "18 regions, live timezone clock, currency",
      descBn: "১৮টি অঞ্চল, টাইমজোন ও কারেন্সি",
    },
    {
      id: "security",
      labelEn: "Security & Access",
      labelBn: "সিকিউরিটি ও সেশন",
      icon: ShieldCheck,
      descEn: "Password update, global session signout",
      descBn: "পাসওয়ার্ড ও অল-ডিভাইস লগআউট",
    },
    {
      id: "support",
      labelEn: "Support & Help",
      labelBn: "সহায়তা ও গাইড",
      icon: HelpCircle,
      descEn: "1-on-1 mentor desk, curriculum docs",
      descBn: "১-অন-১ মেন্টর ও কারিকুলাম গাইড",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#070e1b] dark:text-slate-100 transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-[#070e1b]/95">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">{isBn ? "ড্যাশবোর্ডে ফিরুন" : "Dashboard"}</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size={32} />
            <div>
              <span className="text-xs font-black tracking-widest text-slate-900 dark:text-white uppercase">
                Cycle of Chart
              </span>
              <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                {isBn ? "অ্যাকাউন্ট সেটিংস" : "INSTITUTIONAL SETTINGS"}
              </p>
            </div>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* User Badge */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 px-3 py-1">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold font-mono text-slate-700 dark:text-slate-300">
              {username ? `@${username}` : (name || user.name || "Student")}
            </span>
          </div>

          {/* Theme Quick Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-yellow-400 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>{isBn ? "ট্রেডার অ্যাকাউন্ট সেটিংস" : "Trader Account Settings"}</span>
            <span className="rounded-full bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider">
              {user.role === "admin" ? "Admin" : "Verified Student"}
            </span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? "আপনার প্রোফাইল, সিকিউরিটি, ভাষা, টাইমজোন ও ডিসপ্লে প্রেফারেন্স নিয়ন্ত্রণ করুন।"
              : "Manage your personal profile, security credentials, appearance, and regional trading environment."}
          </p>
        </div>

        {/* Mobile Horizontal Tabs */}
        <div className="lg:hidden mb-6 flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 touch-pan-x">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                  isActive
                    ? "bg-[#081833] text-white shadow-md dark:bg-sky-500 dark:text-slate-950"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-850"
                }`}
              >
                <Icon size={14} />
                <span>{isBn ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Layout Grid: Desktop Sidebar Navigation + Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0a192f]/70 p-3 shadow-xs">
            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
              {isBn ? "সেটিংস ক্যাটাগরি" : "Settings Menu"}
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all duration-200 ${
                    isActive
                      ? "bg-[#081833] text-white shadow-md dark:bg-sky-500 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-lg p-1.5 ${
                        isActive
                          ? "bg-white/10 dark:bg-slate-900/20 text-white dark:text-slate-950"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{isBn ? tab.labelBn : tab.labelEn}</div>
                      <div
                        className={`text-[10px] line-clamp-1 ${
                          isActive ? "text-slate-300 dark:text-slate-800" : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {isBn ? tab.descBn : tab.descEn}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} className={isActive ? "opacity-100" : "opacity-30"} />
                </button>
              );
            })}
          </aside>

          {/* Right Main Settings Content Panels */}
          <div className="lg:col-span-8 space-y-8">
            {/* ========================================================================= */}
            {/* 1. PROFILE ACCOUNT SECTION */}
            {/* ========================================================================= */}
            {activeTab === "account" && (
              <div className="space-y-6">
                {/* Profile Photo Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Camera size={18} className="text-sky-500" />
                        <span>{isBn ? "প্রোফাইল ছবি / অবতার" : "Profile Photo / Avatar"}</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBn
                          ? "আপনার ছবি ড্যাশবোর্ড ও গ্লোবাল লিডারবোর্ডে প্রদর্শিত হবে।"
                          : "Your photo syncs across your Dashboard, Journal, and Global Leaderboard."}
                      </p>
                    </div>
                    {avatar && (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
                        {isBn ? "ছবি সক্রিয়" : "Active Photo"}
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
                            alt={name || user.name || "User Avatar"}
                            className="size-full object-cover rounded-full"
                          />
                        ) : (
                          <span>{(name || user.name || "U")[0]?.toUpperCase() || "U"}</span>
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
                        title={isBn ? "ছবি আপলোড করুন" : "Upload Photo"}
                        aria-label={isBn ? "ছবি আপলোড করুন" : "Upload Photo"}
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
                          <span>{avatar ? (isBn ? "ছবি পরিবর্তন করুন" : "Change Photo") : (isBn ? "নতুন ছবি আপলোড" : "Upload Photo")}</span>
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
                            <span>{isBn ? "ছবি মুছে ফেলুন" : "Remove Photo"}</span>
                          </Button>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-900/40 p-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {isBn ? "ছবি সংক্রান্ত গাইডলাইন:" : "Avatar Guidelines:"}
                        </p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>{isBn ? "JPG, PNG বা WebP ফরম্যাট (সর্বোচ্চ ৮ মেগাবাইট)" : "JPG, PNG, or WebP format (max 8MB)"}</li>
                          <li>{isBn ? "স্বয়ংক্রিয়ভাবে ৪০০x৪০০ স্কয়ার ক্রপ ও অপটিমাইজ করা হয়" : "Auto-cropped to a crisp 400x400 square for fast cloud loading"}</li>
                          <li>{isBn ? "প্রতিটি ইউজারের ছবি সম্পূর্ণ আলাদা ও সুরক্ষিত" : "Strictly isolated per account and never shared with other traders"}</li>
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
                      <span>{isBn ? "নাম ও ট্রেডার ইউজারনেম" : "Display Name & Username"}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn
                        ? "আপনার ট্রেডার প্রোফাইলের নাম ও ইউনিক হ্যান্ডেল নিয়ন্ত্রণ করুন।"
                        : "Configure your public display name and unique trader identifier."}
                    </p>
                  </div>

                  {/* Form 1: Display Name */}
                  <form onSubmit={handleSaveName} className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {isBn ? "প্রোফাইল নাম" : "Profile / Display Name"}
                    </label>
                    <div className="flex gap-2.5">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isBn ? "আপনার পুরো নাম" : "Your full name or trading alias"}
                        maxLength={50}
                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold"
                      />
                      <Button
                        type="submit"
                        disabled={isSavingName || name.trim() === (settingsData?.name || user.name || "")}
                        size="sm"
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 gap-1.5"
                      >
                        {isSavingName ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        <span>{isBn ? "সেভ করুন" : "Save Name"}</span>
                      </Button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isBn
                        ? "সর্বনিম্ন ২ এবং সর্বোচ্চ ৫০ অক্ষর। ড্যাশবোর্ড ও লিডারবোর্ডে প্রদর্শিত হবে।"
                        : "Between 2 and 50 characters. Syncs instantly across the platform."}
                    </p>
                  </form>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
                    {/* Form 2: Username */}
                    <form onSubmit={handleSaveUsername} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {isBn ? "ইউনিক ইউজারনেম" : "Unique Username / Handle"}
                        </label>
                        {usernameAvailability.checking && (
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Loader2 size={11} className="animate-spin" />
                            {isBn ? "যাচাই হচ্ছে..." : "Checking availability..."}
                          </span>
                        )}
                        {!usernameAvailability.checking && usernameAvailability.available === true && (
                          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            {isBn ? "ইউজারনেম খালি আছে" : "Available"}
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
                            username.trim().toLowerCase() === (settingsData?.username || "").toLowerCase()
                          }
                          size="sm"
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 gap-1.5"
                        >
                          {isSavingUsername ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                          <span>{isBn ? "ইউজারনেম সেভ" : "Claim Username"}</span>
                        </Button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isBn
                          ? "৩-২০ অক্ষরের অনন্য পরিচয়। শুধুমাত্র ইংরেজি ছোট অক্ষর, সংখ্যা এবং আন্ডারস্কোর (_)।"
                          : "3 to 20 characters. Lowercase letters, numbers, and underscores only. Guaranteed unique."}
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
                        <span>{isBn ? "অ্যাকাউন্ট ইমেইল" : "Account Email Address"}</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBn ? "আপনার বর্তমান লগইন এবং ক্রয়কৃত পণ্যের লাইসেন্স ইমেইল।" : "Primary sign-in and purchase entitlement credentials."}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle size={11} />
                      {isBn ? "যাচাইকৃত অ্যাকাউন্ট" : "Verified Account"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">{isBn ? "লগইন ইমেইল:" : "Current Account Email:"}</div>
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        {user.email || settingsData?.email || "No email linked"}
                      </div>
                    </div>

                    <Link href="/support">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 gap-1.5"
                      >
                        <MessageSquare size={13} />
                        <span>{isBn ? "ইমেইল পরিবর্তনের অনুরোধ" : "Request Email Transfer"}</span>
                      </Button>
                    </Link>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isBn
                      ? "নিরাপত্তাজনিত কারণে এবং কেনাকাটার অ্যাক্সেস সুরক্ষিত রাখতে ইমেইল সরাসরি পরিবর্তন বন্ধ রাখা হয়েছে। ইমেইল ট্রান্সফার করতে চাইলে সাপোর্ট ডেস্কে যোগাযোগ করুন।"
                      : "For security and ownership protection of your purchased course packages and eBook licenses, account email changes require manual administrative verification. Contact support if you need to transfer your email."}
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. APPEARANCE SECTION */}
            {/* ========================================================================= */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Palette size={18} className="text-sky-500" />
                      <span>{isBn ? "থিম ও ডিসপ্লে মোড" : "Theme & Visual Appearance"}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn
                        ? "আপনার পছন্দ অনুযায়ী ডার্ক মোড বা লাইট মোড নির্বাচন করুন। ডার্ক মোড স্ট্যান্ডার্ড রাখা হয়েছে।"
                        : "Select your preferred visual theme. Dark mode is the recommended institutional standard."}
                    </p>
                  </div>

                  {/* Theme Selection Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Dark Mode Card */}
                    <div
                      onClick={() => {
                        setTheme("dark");
                        updatePreferencesMutation.mutate({ theme: "dark" });
                        toast.success(isBn ? "ডার্ক মোড সক্রিয় করা হয়েছে" : "Dark theme enabled");
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
                        {isBn ? "ডার্ক মোড (ডিফল্ট)" : "Dark Navy Theme (Default)"}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {isBn
                          ? "দীর্ঘ সময় চার্ট অ্যানালাইসিস ও পড়াশোনায় চোখের ক্লান্তি দূর করতে ডিপ ব্লু-ব্ল্যাক নান্দনিক ইন্টারফেস।"
                          : "Institutional deep blue-black interface built for low glare during night sessions and CRT markups."}
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
                        updatePreferencesMutation.mutate({ theme: "light" });
                        toast.success(isBn ? "লাইট মোড সক্রিয় করা হয়েছে" : "Light theme enabled");
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
                        {isBn ? "লাইট মোড" : "Light Clean Theme"}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {isBn
                          ? "উজ্জ্বল আলোর পরিবেশে হাই কন্ট্রাস্ট পঠন ও নোট লেখার জন্য উপযুক্ত।"
                          : "High-contrast daylight theme for reading trading notes and curriculum articles."}
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
                      <span>{isBn ? "ওয়েবসাইট ভাষা ও দেশ নির্বাচন" : "Language & Country Selection"}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn
                        ? "সম্পূর্ণ কার্যকরী মাল্টি-ল্যাঙ্গুয়েজ সিস্টেম (বাংলা, English, اردو)। যেকোনো ভাষা নির্বাচন করলেই পুরো ওয়েবসাইট সেই ভাষায় পরিবর্তিত হবে।"
                        : "Active multi-language system supporting Bangla, English, and Urdu with immediate site-wide translation."}
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
                            updatePreferencesMutation.mutate({ language: opt.langCode });
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
                                {opt.countryName}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {opt.nativeName} ({opt.langName})
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
                        <span>{isBn ? "ট্রেডিং টাইমজোন ও লাইভ ঘড়ি" : "Financial Market Time Zone"}</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBn
                          ? "আপনার সুবিধাজনক মার্কেট সেশন অনুযায়ী টাইমজোন নির্ধারণ করুন।"
                          : "Set your reference timezone for trade logging, session times, and daily discipline resets."}
                      </p>
                    </div>

                    {/* Live Digital Clock Badge */}
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                      <div className="text-xs font-mono font-extrabold text-sky-600 dark:text-sky-400 tracking-wider">
                        {liveClock || "Calculating..."}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allTimezones.map((tz) => {
                      const isSelected = timezone === tz.value;
                      return (
                        <div
                          key={tz.value}
                          onClick={() => {
                            setTimezone(tz.value);
                            toast.success(isBn ? `টাইমজোন আপডেট হয়েছে: ${tz.city}` : `Timezone set to ${tz.city}`);
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
                            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
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
                      <span>{isBn ? "ডিসপ্লে কারেন্সি নির্বাচন" : "Display Currency"}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn
                        ? "স্টোর ও সাধারণ মূল্যের জন্য আপনার পছন্দের মুদ্রা প্রতীক বেছে নিন।"
                        : "Select your preferred currency symbol for store packages and account figures."}
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
                            toast.success(isBn ? `মুদ্রা পরিবর্তিত হয়েছে: ${c.code}` : `Currency changed to ${c.code}`);
                          }}
                          className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                          }`}
                        >
                          <span className="text-2xl">{c.flag}</span>
                          <div className="text-base font-black font-mono mt-1 text-slate-900 dark:text-white">
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
                      <span>{isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn
                        ? "আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নিয়মিত পাসওয়ার্ড আপডেট করুন।"
                        : "Ensure your account is protected with a strong, distinct password."}
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
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
                        {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          className="pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
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
                        {isBn ? "কমপক্ষে ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।" : "Minimum 6 characters."}
                      </p>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {isBn ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPw ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          className="pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
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
                      <span>{isBn ? "পাসওয়ার্ড আপডেট করুন" : "Update Password"}</span>
                    </Button>
                  </form>
                </div>

                {/* Logout From All Devices Card */}
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/30">
                    <div>
                      <h2 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <LogOut size={18} />
                        <span>{isBn ? "সকল ডিভাইস থেকে লগআউট" : "Logout From All Devices"}</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isBn
                          ? "আপনার অ্যাকাউন্ট অন্য কোনো ব্রাউজার বা ডিভাইসে খোলা থাকলে সব সেশন তাৎক্ষণিক বাতিল হবে।"
                          : "Terminate and invalidate all active sessions across any phones, tablets, or other browsers."}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isBn
                      ? "আপনি যদি অন্য কোনো পাবলিক কম্পিউটার বা ডিভাইসে লগইন করে ভুলে গিয়ে থাকেন, এই বোতামে ক্লিক করলে সমস্ত সক্রিয় অথেনটিকেশন টোকেন ইনভ্যালিড হয়ে যাবে এবং নতুন করে পাসওয়ার্ড দিয়ে প্রবেশ করতে হবে।"
                      : "If you logged in from a shared computer or suspect unauthorized session access, clicking below instantly revokes all authentication tokens and forces a clean sign-in."}
                  </p>

                  <div>
                    <Button
                      type="button"
                      onClick={() => setShowLogoutAllModal(true)}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-2"
                    >
                      <LogOut size={14} />
                      <span>{isBn ? "সকল ডিভাইস থেকে সাইন আউট" : "Sign Out From All Devices"}</span>
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
                      {isBn ? "১-অন-১ অফিসিয়াল সাপোর্ট" : "Direct Admin Desk"}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      {isBn ? "লাইভ সাপোর্ট সক্রিয়" : "Desk Active 24/7"}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-white">
                      {isBn ? "অ্যাডমিন ও মেন্টরের সাথে সরাসরি চ্যাট" : "Contact Official Mentor Support"}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {isBn
                        ? "কোর্স এনরোলমেন্ট, পেমেন্ট ভেরিফিকেশন, কিংবা চার্ট সম্পর্কিত যেকোনো সমস্যায় সরাসরি অ্যাডমিনের সাথে ১-অন-১ মেসেজিং সিস্টেমে যোগাযোগ করুন।"
                        : "Connect directly with platform administrators and institutional mentors for payment approvals, curriculum queries, and technical assistance."}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link href="/support">
                      <Button className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs gap-2 shadow-lg shadow-sky-500/20">
                        <MessageSquare size={15} />
                        <span>{isBn ? "সাপোর্ট সেন্টারে প্রবেশ করুন" : "Open 1-on-1 Support Desk"}</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Help Resources Grid */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle size={18} className="text-sky-500" />
                      <span>{isBn ? "স্টাডি রিসোর্স ও কারিকুলাম গাইড" : "Curriculum & Help Center"}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn
                        ? "ক্যান্ডেল রেঞ্জ থিওরি (CRT) ও প্রাতিষ্ঠানিক রোডম্যাপ বিষয়ক প্রয়োজনীয় লিঙ্কসমূহ।"
                        : "Quick access to verified study materials, roadmap stages, and official documentation."}
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
                              {isBn ? "১২-স্টেজ প্রাতিষ্ঠানিক রোডম্যাপ" : "12-Stage Institutional Roadmap"}
                            </span>
                          </div>
                          <ExternalLink size={14} className="text-slate-400 group-hover:text-sky-400" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                          {isBn ? "ফাউন্ডেশন থেকে অ্যাডভান্সড CRT মাস্টারি পর্যন্ত ধাপে ধাপে গাইড।" : "Step-by-step framework from foundation to algorithmic execution."}
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
                              {isBn ? "স্টাডি লাইব্রেরি ও চিটশিট" : "Institutional PDF Library"}
                            </span>
                          </div>
                          <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                          {isBn ? "প্রিন্টযোগ্য রেফারেন্স পিডিএফ ও ডাউনলোড গাইড।" : "Downloadable cheat sheets, risk management templates, and CRT rules."}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal: Logout From All Devices */}
      {showLogoutAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a192f] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="rounded-full bg-rose-500/15 p-2.5">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isBn ? "আপনি কি নিশ্চিত?" : "Confirm Global Sign-out?"}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isBn
                ? "এটি আপনার সমস্ত সক্রিয় মোবাইল ফোন, ল্যাপটপ এবং ব্রাউজারের সেশন স্থায়ীভাবে বন্ধ করে দেবে। আপনাকে আবার লগইন পেজে নিয়ে যাওয়া হবে।"
                : "This action will terminate all active login sessions on all devices and browsers immediately. You will be redirected to the login page."}
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
                {isBn ? "বাতিল করুন" : "Cancel"}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isLoggingOutAll}
                onClick={handleLogoutAllDevices}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1.5"
              >
                {isLoggingOutAll ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                <span>{isBn ? "হ্যাঁ, লগআউট করুন" : "Yes, Sign Out All"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
