import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences, SUPPORTED_TIMEZONES, SUPPORTED_CURRENCIES } from "@/contexts/UserPreferencesContext";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadImage } from "@/lib/mediaUpload";
import { supabase } from "@/lib/supabase";
import {
  User,
  ShieldCheck,
  Palette,
  Globe,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { SettingsAccountProfilePanel } from "./settings/SettingsAccountProfilePanel";
import {
  SettingsPreferencesAndSecurityPanels,
  type SettingsTab,
} from "./settings/SettingsPreferencesAndSecurityPanels";

export default function Settings() {
  const [location, setLocation] = useLocation();
  const { user, loading: authLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, language, currentOption, setCountryLanguage, allOptions, isRTL, selectText } = useLanguage();
  const isBn = language === "bn";

  const {
    timezone,
    setTimezone,
    isAutoTimezone,
    deviceTimezone,
    currency,
    setCurrency,
    currentCurrency,
    currentTimezone,
    allTimezones,
    allCurrencies,
  } = useUserPreferences();

  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "region" || tabParam === "appearance" || tabParam === "security" || tabParam === "support" || tabParam === "account") {
        return tabParam;
      }
    }
    return "account";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "region" || tabParam === "appearance" || tabParam === "security" || tabParam === "support" || tabParam === "account") {
        setActiveTab(tabParam);
      }
    }
  }, [location]);
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

  // Bio State
  const [bio, setBio] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  const countWords = (text: string): number => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };
  const bioWordCount = useMemo(() => countWords(bio), [bio]);

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
      setBio(settingsData.bio || "");
    } else if (user) {
      const userKey = user.openId || user.email || String(user.id);
      const storedName = typeof window !== "undefined" ? localStorage.getItem(`cycle_user_custom_name_${userKey}`) : null;
      const storedAvatar = typeof window !== "undefined" ? localStorage.getItem(`cycle_user_avatar_${userKey}`) : null;
      const storedBio = typeof window !== "undefined" ? localStorage.getItem(`cycle_user_bio_${userKey}`) : null;
      setName(storedName || user.name || "");
      setAvatar(storedAvatar || (user as any).avatar || null);
      setBio(storedBio || (user as any).bio || "");
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
        reason: selectText({
          en: "Must be at least 3 characters",
          bn: "ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে",
          ur: "صارف نام کم از کم 3 حروف کا ہونا چاہیے",
        }),
      });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameAvailability({
        checking: false,
        available: false,
        reason: selectText({
          en: "Letters, numbers, and _ only",
          bn: "শুধুমাত্র ইংরেজি অক্ষর, সংখ্যা এবং _ ব্যবহারযোগ্য",
          ur: "صرف حروف، اعداد اور _ کی اجازت ہے",
        }),
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
  }, [username, settingsData?.username, utils, language]);

  // Save Display Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error(
        selectText({
          en: "Name must be at least 2 characters",
          bn: "নাম কমপক্ষে ২ অক্ষরের হতে হবে",
          ur: "نام کم از کم 2 حروف کا ہونا چاہیے",
        })
      );
      return;
    }
    if (trimmed.length > 50) {
      toast.error(
        selectText({
          en: "Name cannot exceed 50 characters",
          bn: "নাম সর্বোচ্চ ৫০ অক্ষরের হতে হবে",
          ur: "نام 50 حروف سے زیادہ نہیں ہو سکتا",
        })
      );
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

      toast.success(
        selectText({
          en: "Display name updated successfully!",
          bn: "প্রোফাইল নাম সফলভাবে সেভ হয়েছে!",
          ur: "ڈسپلے نام کامیابی سے اپ ڈیٹ ہو گیا!",
        })
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          selectText({
            en: "Failed to update display name",
            bn: "নাম সেভ করা যায়নি",
            ur: "ڈسپلے نام اپ ڈیٹ کرنے میں ناکامی",
          })
      );
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
      toast.error(
        usernameAvailability.reason ||
          selectText({
            en: "Username unavailable",
            bn: "ইউজারনেম ব্যবহার করা যাবে না",
            ur: "صارف نام دستیاب نہیں ہے",
          })
      );
      return;
    }

    setIsSavingUsername(true);
    try {
      await updateProfileMutation.mutateAsync({ username: clean });
      await utils.auth.me.invalidate();
      await utils.auth.getSettings.invalidate();

      toast.success(
        selectText({
          en: `Username claimed: @${clean}`,
          bn: `@${clean} ইউজারনেম সফলভাবে সেভ হয়েছে!`,
          ur: `صارف نام کامیابی سے محفوظ ہو گیا: @${clean}`,
        })
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          selectText({
            en: "Failed to save username",
            bn: "ইউজারনেম সেভ করা যায়নি",
            ur: "صارف نام محفوظ کرنے میں ناکامی",
          })
      );
    } finally {
      setIsSavingUsername(false);
    }
  };

  // Save Bio
  const handleSaveBio = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const count = countWords(bio);
    if (count > 20) {
      toast.error(
        selectText({
          en: "Bio cannot exceed 20 words",
          bn: "বায়ো সর্বোচ্চ ২০ শব্দের হতে হবে",
          ur: "بائیو 20 الفاظ سے زیادہ نہیں ہو سکتا",
        })
      );
      return;
    }

    const cleanBio = bio.trim() || null;
    setIsSavingBio(true);
    try {
      const userKey = user?.openId || user?.email || String(user?.id);
      if (userKey) {
        if (cleanBio) {
          localStorage.setItem(`cycle_user_bio_${userKey}`, cleanBio);
        } else {
          localStorage.removeItem(`cycle_user_bio_${userKey}`);
        }
      }

      await updateProfileMutation.mutateAsync({ bio: cleanBio });

      await utils.auth.me.invalidate();
      await utils.auth.getSettings.invalidate();
      await utils.leaderboard.rankings.invalidate();

      window.dispatchEvent(
        new CustomEvent("cycle_user_profile_updated", {
          detail: { userId: userKey, bio: cleanBio },
        })
      );

      toast.success(
        cleanBio
          ? selectText({
              en: "Bio updated successfully!",
              bn: "বায়ো সফলভাবে সেভ হয়েছে!",
              ur: "بائیو کامیابی سے محفوظ ہو گیا!",
            })
          : selectText({
              en: "Bio removed successfully!",
              bn: "বায়ো সফলভাবে মুছে ফেলা হয়েছে!",
              ur: "بائیو کامیابی سے ہٹا دیا گیا!",
            })
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          selectText({
            en: "Failed to save bio",
            bn: "বায়ো সেভ করা যায়নি",
            ur: "بائیو محفوظ کرنے میں ناکامی",
          })
      );
    } finally {
      setIsSavingBio(false);
    }
  };

  // Remove Bio
  const handleRemoveBio = async () => {
    setBio("");
    setIsSavingBio(true);
    try {
      const userKey = user?.openId || user?.email || String(user?.id);
      if (userKey) {
        localStorage.removeItem(`cycle_user_bio_${userKey}`);
      }

      await updateProfileMutation.mutateAsync({ bio: null });

      await utils.auth.me.invalidate();
      await utils.auth.getSettings.invalidate();
      await utils.leaderboard.rankings.invalidate();

      window.dispatchEvent(
        new CustomEvent("cycle_user_profile_updated", {
          detail: { userId: userKey, bio: null },
        })
      );

      toast.success(
        selectText({
          en: "Bio removed successfully!",
          bn: "বায়ো সফলভাবে মুছে ফেলা হয়েছে!",
          ur: "بائیو کامیابی سے ہٹا دیا گیا!",
        })
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          selectText({
            en: "Failed to remove bio",
            bn: "বায়ো মোছা যায়নি",
            ur: "بائیو ہٹانے میں ناکامی",
          })
      );
    } finally {
      setIsSavingBio(false);
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

        uploadImage(dataUrl, `avatar_${userKey}_${Date.now()}.webp`)
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

      toast.success(
        selectText({
          en: "Logged out from all devices",
          bn: "সকল ডিভাইস থেকে লগআউট সফল হয়েছে",
          ur: "تمام ڈیوائسز سے لاگ آؤٹ کامیاب رہا",
        })
      );
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(
        err.message ||
          selectText({
            en: "Failed to logout from all devices",
            bn: "লগআউট ব্যর্থ হয়েছে",
            ur: "تمام ڈیوائسز سے لاگ آؤٹ کرنے میں ناکامی",
          })
      );
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
          {selectText({
            en: "Loading Settings...",
            bn: "সেটিংস লোড হচ্ছে...",
            ur: "سیٹنگز لوڈ ہو رہی ہیں...",
          })}
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
          {selectText({
            en: "Sign In Required",
            bn: "লগইন করা আবশ্যক",
            ur: "سائن ان درکار ہے",
          })}
        </h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          {selectText({
            en: "Please sign in to your trader account to manage your profile and preferences.",
            bn: "আপনার অ্যাকাউন্ট সেটিংস পরিচালনা করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।",
            ur: "اپنے پروفائل اور ترجیحات کا انتظام کرنے کے لیے براہ کرم اپنے ٹریڈر اکاؤنٹ میں سائن ان کریں۔",
          })}
        </p>
        <Link href="/login">
          <Button className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6">
            {selectText({
              en: "Sign In to Account",
              bn: "সাইন ইন করুন",
              ur: "اکاؤنٹ میں سائن ان کریں",
            })}
          </Button>
        </Link>
      </div>
    );
  }

  const tabs: {
    id: SettingsTab;
    labelEn: string;
    labelBn: string;
    labelUr: string;
    icon: any;
    descEn?: string;
    descBn?: string;
    descUr?: string;
  }[] = [
    {
      id: "account",
      labelEn: "Profile Account",
      labelBn: "প্রোফাইল অ্যাকাউন্ট",
      labelUr: "پروفائل اکاؤنٹ",
      icon: User,
      descEn: "Name, photo, username, verified email",
      descBn: "নাম, ছবি, ইউজারনেম, ইমেইল",
      descUr: "نام، تصویر، صارف نام، تصدیق شدہ ای میل",
    },
    {
      id: "appearance",
      labelEn: "Appearance",
      labelBn: "থিম ও ডিসপ্লে",
      labelUr: "تھیم اور ظاہری شکل",
      icon: Palette,
      descEn: "Dark mode, institutional contrast",
      descBn: "ডার্ক মোড ও ভিজ্যুয়াল স্টাইল",
      descUr: "ڈارک موڈ، ادارہ جاتی کنٹراسٹ",
    },
    {
      id: "region",
      labelEn: "Language & Region",
      labelBn: "ভাষা ও অঞ্চল",
      labelUr: "زبان اور خطہ",
      icon: Globe,
      descEn: "Bangla, English, Urdu, live timezone, currency",
      descBn: "বাংলা, English, اردو, টাইমজোন ও কারেন্সি",
      descUr: "اردو، انگریزی، بنگلہ، لائیو ٹائم زون، کرنسی",
    },
    {
      id: "security",
      labelEn: "Security & Access",
      labelBn: "সিকিউরিটি ও সেশন",
      labelUr: "سیکیورٹی اور رسائی",
      icon: ShieldCheck,
      descEn: "Password update, global session signout",
      descBn: "পাসওয়ার্ড ও অল-ডিভাইস লগআউট",
      descUr: "پاس ورڈ اپ ڈیٹ، تمام سیشنز سے لاگ آؤٹ",
    },
    {
      id: "support",
      labelEn: "Support & Help",
      labelBn: "সহায়তা ও গাইড",
      labelUr: "سپورٹ اور مدد",
      icon: HelpCircle,
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
              <span className="hidden sm:inline">
                {selectText({
                  en: "Dashboard",
                  bn: "ড্যাশবোর্ডে ফিরুন",
                  ur: "ڈیش بورڈ پر واپس جائیں",
                })}
              </span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size={32} />
            <div>
              <HeaderBrandWordmark className="text-xs" />
              <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                {selectText({
                  en: "INSTITUTIONAL SETTINGS",
                  bn: "অ্যাকাউন্ট সেটিংস",
                  ur: "ادارہ جاتی ترتیبات",
                })}
              </p>
            </div>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* User Badge */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 px-3 py-1">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span dir="ltr" className="text-[11px] font-bold font-mono text-slate-700 dark:text-slate-300">
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
            <span>
              {selectText({
                en: "Trader Account Settings",
                bn: "ট্রেডার অ্যাকাউন্ট সেটিংস",
                ur: "ٹریڈر اکاؤنٹ ترتیبات",
              })}
            </span>
            <span className="rounded-full bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider">
              {user.role === "admin" ? "Admin" : "Verified Student"}
            </span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {selectText({
              en: "Manage your personal profile, security credentials, appearance, and regional trading environment.",
              bn: "আপনার প্রোফাইল, সিকিউরিটি, ভাষা, টাইমজোন ও ডিসপ্লে প্রেফারেন্স নিয়ন্ত্রণ করুন।",
              ur: "اپنے ذاتی پروفائل، سیکیورٹی اسناد، ظاہری شکل اور علاقائی تجارتی ماحول کا انتظام کریں۔",
            })}
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
                <span>{selectText({ en: tab.labelEn, bn: tab.labelBn, ur: tab.labelUr })}</span>
              </button>
            );
          })}
        </div>

        {/* Layout Grid: Desktop Sidebar Navigation + Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0a192f]/70 p-3 shadow-xs">
            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
              {selectText({
                en: "Settings Menu",
                bn: "সেটিংস ক্যাটাগরি",
                ur: "ترتیبات مینو",
              })}
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const desc = tab.descEn
                ? selectText({ en: tab.descEn, bn: tab.descBn || tab.descEn, ur: tab.descUr || tab.descEn })
                : "";
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
                  <div className={`flex ${desc ? "items-start" : "items-center"} gap-3`}>
                    <div
                      className={`${desc ? "mt-0.5" : ""} rounded-lg p-1.5 ${
                        isActive
                          ? "bg-white/10 dark:bg-slate-900/20 text-white dark:text-slate-950"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold">
                        {selectText({ en: tab.labelEn, bn: tab.labelBn, ur: tab.labelUr })}
                      </div>
                      {desc && (
                        <div
                          className={`text-[10px] line-clamp-1 ${
                            isActive ? "text-slate-300 dark:text-slate-800" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {desc}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} className={isActive ? "opacity-100" : "opacity-30"} />
                </button>
              );
            })}
          </aside>

          {/* Right Main Settings Content Panels */}
          <div className="lg:col-span-8 space-y-8">
            <SettingsAccountProfilePanel
              activeTab={activeTab}
              isBn={isBn}
              avatar={avatar}
              name={name}
              setName={setName}
              userNameFallback={user.name}
              userEmailFallback={user.email}
              settingsName={settingsData?.name}
              settingsUsername={settingsData?.username}
              settingsEmail={settingsData?.email}
              settingsBio={settingsData?.bio}
              bio={bio}
              setBio={setBio}
              bioWordCount={bioWordCount}
              isSavingBio={isSavingBio}
              handleSaveBio={handleSaveBio}
              handleRemoveBio={handleRemoveBio}
              isUploadingAvatar={isUploadingAvatar}
              isRemovingAvatar={isRemovingAvatar}
              fileInputRef={fileInputRef}
              handleAvatarUpload={handleAvatarUpload}
              handleRemoveAvatar={handleRemoveAvatar}
              handleSaveName={handleSaveName}
              isSavingName={isSavingName}
              handleSaveUsername={handleSaveUsername}
              username={username}
              setUsername={setUsername}
              isSavingUsername={isSavingUsername}
              usernameAvailability={usernameAvailability}
            />

            <SettingsPreferencesAndSecurityPanels
              activeTab={activeTab}
              isBn={isBn}
              theme={theme}
              setTheme={setTheme}
              onUpdatePreferences={(prefs) => updatePreferencesMutation.mutate(prefs)}
              allOptions={allOptions}
              currentOption={currentOption}
              setCountryLanguage={setCountryLanguage}
              liveClock={liveClock}
              allTimezones={allTimezones}
              timezone={timezone}
              setTimezone={setTimezone}
              isAutoTimezone={isAutoTimezone}
              deviceTimezone={deviceTimezone}
              allCurrencies={allCurrencies}
              currency={currency}
              setCurrency={setCurrency}
              handleChangePassword={handleChangePassword}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showCurrentPw={showCurrentPw}
              setShowCurrentPw={setShowCurrentPw}
              showNewPw={showNewPw}
              setShowNewPw={setShowNewPw}
              showConfirmPw={showConfirmPw}
              setShowConfirmPw={setShowConfirmPw}
              isChangingPassword={isChangingPassword}
              showLogoutAllModal={showLogoutAllModal}
              setShowLogoutAllModal={setShowLogoutAllModal}
              isLoggingOutAll={isLoggingOutAll}
              handleLogoutAllDevices={handleLogoutAllDevices}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
