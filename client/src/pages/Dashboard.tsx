import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock,
  Globe,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Moon,
  MessageSquare,
  Headphones,
  NotebookPen,
  Play,
  PlayCircle,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Trophy,
  Send,
  Settings as SettingsIcon,
  Calculator,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TraderJournal } from "@/components/journal/TraderJournal";
import { getStoredTrades } from "@/lib/traderJournalStorage";
import { getDashboardRoadmapStages, DashboardRoadmapStage } from "@/data/roadmapStages";
import { DailyDisciplineMaster } from "@/components/discipline/DailyDisciplineMaster";
import { PositionSizeCalculator } from "@/components/calculator/PositionSizeCalculator";
import { uploadImage } from "@/lib/mediaUpload";
import { CourseTelegramModal } from "@/components/CourseTelegramModal";
import { NewUserOnboardingModal } from "@/components/NewUserOnboardingModal";
import { SupportChat } from "@/components/SupportChat";

// Daily Discipline Rules
const DAILY_DISCIPLINE_RULES = [
  {
    id: "news_check",
    textEn: "Checked high-impact news calendar (Forex Factory) before session open",
    textBn: "সেশন শুরুর আগে হাই-ইমপ্যাক্ট নিউজ ক্যালেন্ডার (Forex Factory) চেক করেছি",
  },
  {
    id: "bias_marked",
    textEn: "Identified Daily Bias & mapped key Liquidity pools (BSL/SSL) on HTF",
    textBn: "হায়ার টাইমফ্রেমে ডেইলি বায়াস ও মূল লিকুইডিটি পুল (BSL/SSL) মার্ক করেছি",
  },
  {
    id: "risk_limit",
    textEn: "Strictly limited risk to 1% max per trade — no revenge or overleveraging",
    textBn: "প্রতি ট্রেডে সর্বোচ্চ ১% রিস্ক রুলস মেনে চলেছি — কোনো অতিরিক্ত লট নেই",
  },
  {
    id: "killzone_only",
    textEn: "Only executed setups during active Killzones (London 08:00-10:00 / NY 13:00-15:00)",
    textBn: "শুধুমাত্র অ্যালগরিদমিক কিলজোনের ভেতরেই ট্রেড এক্সিকিউট করেছি",
  },
  {
    id: "rr_validation",
    textEn: "Validated minimum 1:3 Risk-to-Reward ratio before placing order",
    textBn: "অর্ডার বসানোর আগে ন্যূনতম ১:৩ রিস্ক-টু-রিওয়ার্ড নিশ্চিত করেছি",
  },
  {
    id: "journal_logged",
    textEn: "Documented trade setup, emotional state & lesson in trading journal",
    textBn: "ট্রেড নেওয়ার পর মানসিক অবস্থা ও লজিক বিস্তারিত জার্নালে লিখেছি",
  },
];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Active Tab
  const [tab, setTab] = useState<
    "overview" | "roadmap" | "library" | "journal" | "discipline" | "calculator" | "orders" | "support"
  >(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/discipline") return "discipline";
      if (window.location.pathname === "/calculator") return "calculator";
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === "discipline" ||
        tabParam === "calculator" ||
        tabParam === "roadmap" ||
        tabParam === "library" ||
        tabParam === "journal" ||
        tabParam === "orders" ||
        tabParam === "support"
      ) {
        return tabParam as any;
      }
    }
    return "overview";
  });
  const { t, language, isRTL } = useLanguage();
  const isBn = language === "bn";
  const { timezone, currentTimezone } = useUserPreferences();
  const [liveMarketTime, setLiveMarketTime] = useState<{ time: string; date: string }>({
    time: "",
    date: "",
  });

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat(undefined, {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(now);

        const dateStr = new Intl.DateTimeFormat(undefined, {
          timeZone: timezone,
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(now);

        setLiveMarketTime({ time: timeStr, date: dateStr });
      } catch (err) {
        setLiveMarketTime({
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
        });
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/discipline") {
        setTab("discipline");
      } else if (window.location.pathname === "/calculator") {
        setTab("calculator");
      }
    }
  }, []);

  // Sidebar open/collapse state (remembers preference, opens on desktop by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cycle_dashboard_sidebar_open");
      if (saved !== null) {
        return saved === "true";
      }
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cycle_dashboard_sidebar_open", String(next));
      } catch {}
      return next;
    });
  };

  // Close sidebar on Escape key if open on smaller screens
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  // User identifier key for strict personal isolation
  const userKey = useMemo(() => {
    if (!user) return "";
    return user.openId || user.email || (user.id ? String(user.id) : "");
  }, [user]);

  // Date for discipline
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // 12-Stage Roadmap State & Notes (strictly isolated per user)
  const [roadmapFilter, setRoadmapFilter] = useState<"all" | "completed" | "todo">("all");
  const [selectedRoadmapStage, setSelectedRoadmapStage] = useState<DashboardRoadmapStage | null>(null);
  const [stageNotes, setStageNotes] = useState<Record<number, string>>(() => {
    if (typeof window === "undefined" || !userKey) return {};
    try {
      const saved = localStorage.getItem(`cycle_stage_notes_${userKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Re-sync stage notes when user changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userKey) {
      setStageNotes({});
      return;
    }
    try {
      const saved = localStorage.getItem(`cycle_stage_notes_${userKey}`);
      setStageNotes(saved ? JSON.parse(saved) : {});
    } catch {
      setStageNotes({});
    }
  }, [userKey]);

  const handleSaveStageNote = (stageNum: number, note: string) => {
    setStageNotes((prev) => {
      const updated = { ...prev, [stageNum]: note };
      if (typeof window !== "undefined" && userKey) {
        try {
          localStorage.setItem(`cycle_stage_notes_${userKey}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  // Modals & States
  // Library Modals
  const [previewPdfModal, setPreviewPdfModal] = useState<any | null>(null);
  const [previewVideoModal, setPreviewVideoModal] = useState<any | null>(null);

  // Journal form state
  const [showNewJournalModal, setShowNewJournalModal] = useState(false);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalSetup, setJournalSetup] = useState("CRT Range Model");
  const [journalResult, setJournalResult] = useState("Win");
  const [journalPair, setJournalPair] = useState("EUR/USD");
  const [journalSession, setJournalSession] = useState("London Open (08:00 GMT)");
  const [journalRR, setJournalRR] = useState("1:3.5");
  const [journalFilter, setJournalFilter] = useState<"all" | "Win" | "Loss" | "Breakeven">("all");
  const [journalSearch, setJournalSearch] = useState("");

  // Support Ticket Form
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Payment Verification");
  const [ticketMessage, setTicketMessage] = useState("");

  // Invoice Modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  // Queries
  const { data: progress, refetch: refetchProgress } = trpc.customer.progress.useQuery(undefined, { enabled: !!user });
  const { data: orders, refetch: refetchOrders } = trpc.customer.orders.useQuery(undefined, { enabled: !!user });
  const { data: entitlements, refetch: refetchEntitlements } = trpc.customer.entitlements.useQuery(undefined, { enabled: !!user });
  const { data: journal, refetch: refetchJournal } = trpc.customer.journal.useQuery(undefined, { enabled: !!user });
  const { data: tickets, refetch: refetchTickets } = trpc.customer.tickets.useQuery(undefined, { enabled: !!user });
  const { data: supportData, refetch: refetchSupport } = trpc.support.getConversation.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 3000,
  });

  const unreadSupportCount = useMemo(() => {
    if (!supportData?.messages) return 0;
    return supportData.messages.filter(
      (m: any) => (m.senderRole === "admin" || m.senderRole === "support") && !m.readAt
    ).length;
  }, [supportData?.messages]);
  const { data: notifications } = trpc.customer.notifications.useQuery(undefined, { enabled: !!user });
  const { data: discipline, refetch: refetchDiscipline } = trpc.customer.discipline.useQuery({ date: today }, { enabled: !!user });
  const { data: ownerProfile } = trpc.public.ownerProfile.useQuery(undefined, { staleTime: 1000 * 60 * 5 });
  const { data: libraryPdfs, isLoading: isLoadingLibrary } = trpc.customer.myLibrary.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 30,
  });
  const downloadMutation = trpc.customer.downloadEbook.useMutation();
  const { data: onboardingData, isLoading: isLoadingOnboarding } = trpc.customer.onboardingStatus.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
  const { data: myRankData } = trpc.leaderboard.myRank.useQuery(undefined, {
    enabled: !!user,
    staleTime: 10000,
  });

  const isOnboardingCompleted = useMemo(() => {
    if (!user) return true;
    if (typeof window !== "undefined" && userKey) {
      const localCompleted = localStorage.getItem(`cycle_onboarding_completed_${userKey}`);
      if (localCompleted === "true") return true;
    }
    if (onboardingData?.completed) return true;
    return false;
  }, [user, userKey, onboardingData]);

  const showOnboardingModal = Boolean(user && !isLoadingOnboarding && !isOnboardingCompleted);

  const telegramUrl = useMemo(() => {
    const raw = ownerProfile?.telegram?.trim();
    if (raw && (raw.startsWith("http://") || raw.startsWith("https://"))) {
      return raw;
    }
    return "https://t.me/cycleofchart";
  }, [ownerProfile]);

  // Strictly check that student has an actual paid & approved course purchase.
  // Free claims or pending/unapproved orders NEVER qualify.
  const hasApprovedPurchase = useMemo(() => {
    const hasApprovedPaidOrder = (orders || []).some((o: any) => {
      const isApproved = o.paymentStatus === "approved" || o.orderStatus === "approved";
      const isPaid = Number(o.amount || 0) > 0 || (o.bundleId != null && Number(o.bundleId) > 0);
      return isApproved && isPaid;
    });
    const hasPaidEntitlement = (entitlements || []).some((e: any) => {
      const isPaidScope = e.scope && !e.scope.includes("free") && (e.scope.startsWith("bundle:") || e.scope.startsWith("product:"));
      const hasValidOrder = e.orderId && Number(e.orderId) > 0;
      return isPaidScope && hasValidOrder;
    });
    return hasApprovedPaidOrder || hasPaidEntitlement;
  }, [orders, entitlements]);

  // Course Access Telegram Community Popup Query & State
  const { data: telegramPopupData, refetch: refetchTelegramPopup } = trpc.customer.courseTelegramPopup.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 20000, // Lightweight 20s sync so online students receive the popup upon admin approval
  });
  const [isTelegramModalDismissedLocally, setIsTelegramModalDismissedLocally] = useState(false);

  const recordTelegramActionMutation = trpc.customer.recordCourseTelegramAction.useMutation({
    onSuccess: () => {
      refetchTelegramPopup();
    },
  });

  // Mutations
  const toggleProgressMutation = trpc.customer.toggleProgress.useMutation({
    onSuccess: () => refetchProgress(),
  });

  const toggleDisciplineMutation = trpc.customer.toggleDiscipline.useMutation({
    onSuccess: () => refetchDiscipline(),
  });

  const createJournalMutation = trpc.customer.createJournal.useMutation({
    onSuccess: () => {
      refetchJournal();
      setShowNewJournalModal(false);
      setJournalTitle("");
      setJournalContent("");
    },
  });

  const deleteJournalMutation = trpc.customer.deleteJournal.useMutation({
    onSuccess: () => refetchJournal(),
  });

  const createTicketMutation = trpc.customer.createTicket.useMutation({
    onSuccess: () => {
      refetchTickets();
      setShowNewTicketModal(false);
      setTicketSubject("");
      setTicketMessage("");
    },
  });

  // Stored trades from Trader Journal (strictly isolated per user)
  const [localTrades, setLocalTrades] = useState(() => getStoredTrades(userKey));

  // User profile photo state (strictly isolated per user)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    if (!user) return null;
    const userKey = user.openId || user.email || String(user.id);
    return (user as any)?.avatar || (typeof window !== "undefined" ? localStorage.getItem(`cycle_user_avatar_${userKey}`) : null) || null;
  });

  // Keep profile photo in sync if user changes or session refreshes
  useEffect(() => {
    if (user) {
      const userKey = user.openId || user.email || String(user.id);
      const stored = (user as any)?.avatar || localStorage.getItem(`cycle_user_avatar_${userKey}`);
      setProfilePhoto(stored || null);
    } else {
      setProfilePhoto(null);
    }
  }, [user]);

  // tRPC utils to invalidate session caches
  const trpcUtils = trpc.useUtils();

  // Student Custom Display Name State
  const [displayName, setDisplayName] = useState<string>(() => {
    if (!user) return "Trader";
    const userKey = user.openId || user.email || String(user.id);
    const stored = typeof window !== "undefined" ? localStorage.getItem(`cycle_user_custom_name_${userKey}`) : null;
    return stored || user.name || "Trader";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  // Keep display name in sync if user changes or session refreshes
  useEffect(() => {
    if (user) {
      const userKey = user.openId || user.email || String(user.id);
      const stored = localStorage.getItem(`cycle_user_custom_name_${userKey}`);
      setDisplayName(stored || user.name || "Trader");
    }
  }, [user?.name, user?.email, user?.openId, user?.id]);

  // Synchronize when profile is updated from Settings or other views in real-time
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;
      const currentKey = user?.openId || user?.email || String(user?.id);
      if (detail.userId && detail.userId !== currentKey) return;
      if (detail.name !== undefined) setDisplayName(detail.name);
      if (detail.avatar !== undefined) setProfilePhoto(detail.avatar);
    };
    window.addEventListener("cycle_user_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("cycle_user_profile_updated", handleProfileUpdate);
  }, [user]);

  const handleStartEditName = () => {
    setNameInput(displayName);
    setNameError("");
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setNameInput("");
    setNameError("");
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError(isBn ? "নাম খালি রাখা যাবে না" : "Name cannot be empty");
      return;
    }
    if (trimmed.length < 2) {
      setNameError(isBn ? "কমপক্ষে ২ অক্ষরের নাম লিখুন" : "Name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 50) {
      setNameError(isBn ? "নাম সর্বোচ্চ ৫০ অক্ষরের হতে হবে" : "Name cannot exceed 50 characters");
      return;
    }

    setIsSavingName(true);
    setNameError("");

    try {
      const userKey = user?.openId || user?.email || String(user?.id);

      // 1. Update local state immediately for instant feedback
      setDisplayName(trimmed);

      // 2. Persist to local storage for current user
      try {
        localStorage.setItem(`cycle_user_custom_name_${userKey}`, trimmed);
        const cached = localStorage.getItem("manus-runtime-user-info");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed) {
            parsed.name = trimmed;
            localStorage.setItem("manus-runtime-user-info", JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.warn("Local storage update warning:", err);
      }

      // 3. Persist to backend database via existing tRPC updateProfile mutation
      await updateProfileMutation.mutateAsync({ name: trimmed });

      // 4. Update Supabase user metadata if authenticated via Supabase
      try {
        await supabase.auth.updateUser({
          data: { name: trimmed, full_name: trimmed },
        });
      } catch (supaErr) {
        console.warn("[Supabase user name update notice]:", supaErr);
      }

      // 5. Invalidate tRPC meQuery and leaderboard rankings to sync session data
      await trpcUtils.auth.me.invalidate();
      await trpcUtils.leaderboard.rankings.invalidate();

      // 6. Broadcast event for other components/listeners
      window.dispatchEvent(
        new CustomEvent("cycle_user_profile_updated", {
          detail: { userId: userKey, name: trimmed },
        })
      );

      toast.success(
        isBn ? "নাম সফলভাবে সেভ করা হয়েছে!" : "Display name updated successfully!"
      );

      setIsEditingName(false);
    } catch (err: any) {
      console.error("[Failed to update name]:", err);
      setNameError(err.message || (isBn ? "নাম সেভ করতে সমস্যা হয়েছে" : "Failed to save name"));
      toast.error(err.message || (isBn ? "নাম সেভ করতে সমস্যা হয়েছে" : "Failed to save name"));
    } finally {
      setIsSavingName(false);
    }
  };

  // trpc profile mutation to persist on backend
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onError: (err) => {
      console.warn("[Profile update warning]:", err.message);
    },
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate image format
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert(isBn ? "অনুগ্রহ করে JPG, PNG অথবা WEBP ফরম্যাটের ছবি নির্বাচন করুন।" : "Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Center-crop to a square and resize to crisp 400x400
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

        // Show instant preview while uploading to cloud
        setProfilePhoto(dataUrl);
        const toastId = toast.loading(isBn ? "ক্লাউডে ছবি আপলোড হচ্ছে..." : "Uploading photo to cloud...");

        // Upload to ImgBB (with Free CDN fallback)
        uploadImage(dataUrl, `avatar_${userKey}.webp`)
          .then((cloudUrl) => {
            setProfilePhoto(cloudUrl);

            // Persist clean URL locally per current user
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
            } catch (err) {
              console.warn("Local storage write failed", err);
            }

            // Persist clean URL to backend database via trpc and invalidate queries
            updateProfileMutation.mutate(
              { avatar: cloudUrl },
              {
                onSuccess: async () => {
                  await trpcUtils.auth.me.invalidate();
                  await trpcUtils.leaderboard.rankings.invalidate();
                },
              }
            );

            // Update Supabase auth user metadata with direct cloud URL (no base64)
            try {
              supabase.auth.updateUser({
                data: { avatar: cloudUrl, avatar_url: cloudUrl },
              }).catch((err) => console.warn("[Supabase avatar update notice]:", err));
            } catch {}

            // Dispatch window event for other listeners
            window.dispatchEvent(new CustomEvent("cycle_user_profile_updated", { detail: { userId: userKey, avatar: cloudUrl } }));
            toast.success(isBn ? "প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!" : "Profile photo updated successfully!", { id: toastId });
          })
          .catch((err) => {
            console.error("[Avatar cloud upload failed]:", err);
            toast.error(isBn ? "ক্লাউডে ছবি আপলোড ব্যর্থ হয়েছে।" : "Failed to upload photo to cloud.", { id: toastId });
          });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so re-selecting same file triggers change
    e.target.value = "";
  };

  useEffect(() => {
    setLocalTrades(getStoredTrades(userKey));
  }, [userKey]);

  useEffect(() => {
    const handleJournalUpdate = (e: any) => {
      if (e?.detail?.userId && userKey && e.detail.userId !== userKey) return;
      setLocalTrades(getStoredTrades(userKey));
    };
    window.addEventListener("cycle_journal_updated", handleJournalUpdate);
    window.addEventListener("storage", handleJournalUpdate);
    return () => {
      window.removeEventListener("cycle_journal_updated", handleJournalUpdate);
      window.removeEventListener("storage", handleJournalUpdate);
    };
  }, [userKey]);
  // Calculate journal analytics
  const journalStats = useMemo(() => {
    if (localTrades && localTrades.length) {
      const wins = localTrades.filter((t) => t.pnl > 0.001).length;
      const losses = localTrades.filter((t) => t.pnl < -0.001).length;
      const winRate = Math.round((wins / localTrades.length) * 100);
      return {
        total: localTrades.length,
        wins,
        losses,
        winRate,
        bestSetup: localTrades[0]?.pair || "CRT Model",
      };
    }
    if (!journal || !journal.length) {
      return { total: 0, wins: 0, losses: 0, winRate: 0, bestSetup: "CRT Model" };
    }
    const wins = journal.filter((j: any) => j.result?.toLowerCase() === "win").length;
    const losses = journal.filter((j: any) => j.result?.toLowerCase() === "loss").length;
    const winRate = Math.round((wins / journal.length) * 100);
    return {
      total: journal.length,
      wins,
      losses,
      winRate,
      bestSetup: "CRT Range Model",
    };
  }, [journal, localTrades]);

  // Download institutional guide
  const handleDownloadResource = async (pdfItem: any) => {
    try {
      if (pdfItem.id) {
        try {
          await downloadMutation.mutateAsync({ id: Number(pdfItem.id) });
        } catch {}
      }

      const itemTitle = pdfItem.titleEn || pdfItem.title || "Institutional Trading Guide";
      const itemSubtitle = pdfItem.subtitleEn || pdfItem.subtitle || "";
      const itemCategory = pdfItem.category || "Institutional";
      const itemPages = pdfItem.pages || 15;
      const itemConcepts = Array.isArray(pdfItem.keyConcepts) ? pdfItem.keyConcepts : [];

      if (pdfItem.fileUrl) {
        const link = document.createElement("a");
        link.href = pdfItem.fileUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = pdfItem.fileName || `${itemTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Generate institutional PDF using jsPDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // Header Banner
      doc.setFillColor(8, 24, 51);
      doc.rect(0, 0, pageWidth, 90, "F");

      doc.setTextColor(56, 189, 248);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("CYCLE OF CHART — INSTITUTIONAL PLAYBOOK", margin, 38);

      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`CATEGORY: ${itemCategory.toUpperCase()} | VERIFIED REFERENCE MATERIAL`, margin, 58);
      doc.text(`PAGES: ${itemPages} Pages | Authorized Student Access`, margin, 74);

      let y = 130;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      const titleLines = doc.splitTextToSize(itemTitle, contentWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 20 + 8;

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      const subtitleLines = doc.splitTextToSize(itemSubtitle, contentWidth);
      doc.text(subtitleLines, margin, y);
      y += subtitleLines.length * 16 + 20;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 25;

      doc.setTextColor(2, 132, 199);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("CORE INSTITUTIONAL CONCEPTS & RULES", margin, y);
      y += 20;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);

      itemConcepts.forEach((concept: string, idx: number) => {
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text(`[Rule ${idx + 1}]`, margin, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        const conceptLines = doc.splitTextToSize(concept, contentWidth - 60);
        doc.text(conceptLines, margin + 55, y);
        y += conceptLines.length * 15 + 12;
      });

      y += 15;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(56, 189, 248);
      doc.roundedRect(margin, y, contentWidth, 75, 6, 6, "FD");

      doc.setTextColor(2, 132, 199);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("NON-NEGOTIABLE RISK GOVERNANCE", margin + 14, y + 20);

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text("1. Strictly risk maximum 1% of account equity per execution.", margin + 14, y + 36);
      doc.text("2. Maintain minimum 1:3 Risk-to-Reward on every entry setup.", margin + 14, y + 50);
      doc.text("3. Never execute outside dedicated algorithmic Killzones (London/NY).", margin + 14, y + 64);

      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "(C) 2026 Cycle of Chart. All rights reserved. Downloaded by authorized student.",
        margin,
        doc.internal.pageSize.getHeight() - 25
      );

      const filename = `${itemTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      doc.save(filename);
      toast.success(isBn ? "PDF সফলভাবে ডাউনলোড হয়েছে" : "PDF downloaded successfully");
    } catch (err) {
      console.error("[handleDownloadResource error]:", err);
      toast.error(isBn ? "PDF ডাউনলোড ব্যর্থ হয়েছে" : "Failed to download PDF");
    }
  };

  const completedStagesCount = useMemo(() => {
    if (!progress) return 0;
    return progress.filter((p: any) => p.completed).length;
  }, [progress]);

  const progressPercent = Math.min(100, Math.round((completedStagesCount / 12) * 100));

  const dashboardStages = useMemo(() => getDashboardRoadmapStages(isBn), [isBn]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("cycle_session_token");
      localStorage.removeItem("manus-runtime-user-info");
      sessionStorage.removeItem("manus-cookie");
      await logout();
    } catch {}
    window.location.href = "/login";
  };

  const isHashAuthenticating = typeof window !== "undefined" && window.location.hash.includes("access_token=");

  if (loading || (isHashAuthenticating && !user)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070e1b] text-slate-300 dark:bg-[#070e1b] dark:text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo size={64} className="animate-pulse" />
          <div className="text-sm font-bold tracking-widest uppercase text-slate-400">
            {isHashAuthenticating ? "Verifying Session Access..." : "Loading Student Portal..."}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070e1b] p-6 text-white">
        <div className="max-w-md text-center">
          <BrandLogo size={96} className="mx-auto" />
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Student Dashboard Access</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Sign in to access your study library, trading journal, daily discipline routine, and unlocked bundles.
          </p>
          <Link href="/login">
            <Button size="lg" className="mt-7 w-full bg-[#38bdf8] font-bold text-slate-950 hover:bg-[#7dd3fc]">
              Sign In to Your Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  type NavItem = {
    id: "overview" | "roadmap" | "library" | "journal" | "discipline" | "calculator" | "orders" | "support";
    labelEn: string;
    labelBn: string;
    icon: any;
    badge?: string;
  };

  const navItems: NavItem[] = [
    { id: "overview", labelEn: t("dashboard.tabOverview"), labelBn: "ওভারভিউ", icon: LayoutDashboard },
    { id: "roadmap", labelEn: t("dashboard.tabRoadmap"), labelBn: "১২-স্টেজ রোডম্যাপ", icon: Layers, badge: `${completedStagesCount}/12` },
    { id: "library", labelEn: t("dashboard.tabLibrary"), labelBn: "আমার লাইব্রেরি", icon: BookOpen, badge: entitlements?.length ? `${entitlements.length}` : undefined },
    { id: "journal", labelEn: t("dashboard.tabJournal"), labelBn: "ট্রেডিং জার্নাল", icon: NotebookPen, badge: (localTrades?.length || journal?.length) ? `${localTrades?.length || journal?.length}` : undefined },
    { id: "discipline", labelEn: t("dashboard.tabDiscipline"), labelBn: "ডেইলি রুটিন", icon: ClipboardCheck },
    { id: "calculator", labelEn: "Position Size Calculator", labelBn: "পজিশন সাইজ ক্যালকুলেটর", icon: Calculator },
    {
      id: "orders",
      labelEn: t("dashboard.tabOrders"),
      labelBn: "পেমেন্ট হিস্ট্রি",
      icon: Receipt,
      badge: orders?.some((o: any) => o.orderStatus === "pending")
        ? (isBn ? "পেন্ডিং" : "Pending")
        : orders?.length
        ? `${orders.length}`
        : undefined,
    },
    {
      id: "support",
      labelEn: t("dashboard.tabSupport"),
      labelBn: "সাপোর্ট চ্যাট",
      icon: MessageSquare,
      badge: unreadSupportCount > 0 ? `${unreadSupportCount}` : undefined,
    },
  ];

  // Filtered Journals
  const filteredJournals = (journal || []).filter((j: any) => {
    if (journalFilter !== "all" && j.result !== journalFilter) return false;
    if (journalSearch.trim()) {
      const q = journalSearch.toLowerCase();
      return (
        j.title?.toLowerCase().includes(q) ||
        j.content?.toLowerCase().includes(q) ||
        j.setup?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#070e1b] dark:text-slate-100 transition-colors duration-300 selection:bg-[#38bdf8] selection:text-slate-950 overflow-x-hidden ${
        isBn ? "font-bangla" : ""
      }`}
    >
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ========================================================================= */}
      {/* DASHBOARD SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#070e1b] transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo size={42} className="shrink-0" />
              <div>
                <span className="text-xs font-extrabold tracking-[0.2em] text-[#0a192f] dark:text-white">
                  CYCLE OF CHART
                </span>
                <div className="text-[10px] font-bold text-[#0284c7] dark:text-sky-400">TRADING REALITY PORTAL</div>
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title={isBn ? "সাইডবার বন্ধ করুন" : "Close Sidebar"}
              aria-label={isBn ? "সাইডবার বন্ধ করুন" : "Close Sidebar"}
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* User Profile Snippet */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              {/* Circular Avatar / Profile Photo Area */}
              <div className="relative shrink-0 group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={isBn ? "প্রোফাইল ছবি পরিবর্তন করুন" : "Change profile photo"}
                  className="relative flex size-10 items-center justify-center rounded-full overflow-hidden border border-slate-200/80 bg-[#081833] font-mono text-sm font-bold text-white shadow-md transition-transform active:scale-95 cursor-pointer dark:border-slate-700/80 dark:bg-sky-500 dark:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  title={isBn ? "প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন" : "Click to set or change profile photo"}
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={displayName || user.name || "User Profile"}
                      className="size-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{(displayName || user?.name || "U")[0]?.toUpperCase() || "U"}</span>
                  )}

                  {/* Subtle hover edit/camera indicator */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera size={14} className="text-white drop-shadow-sm" />
                  </div>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                {!isEditingName ? (
                  <div className="flex items-center gap-1.5 group/name">
                    <span
                      className="truncate text-sm font-extrabold text-slate-900 dark:text-white hover:text-sky-500 dark:hover:text-sky-400 cursor-pointer transition-colors"
                      title={isBn ? "কাস্টম নাম এডিট করতে ক্লিক করুন" : "Click to edit your display name"}
                      onClick={handleStartEditName}
                    >
                      {displayName}
                    </span>
                    <button
                      type="button"
                      onClick={handleStartEditName}
                      className="opacity-60 hover:opacity-100 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-all p-0.5 rounded shrink-0 cursor-pointer"
                      title={isBn ? "নাম পরিবর্তন করুন" : "Edit display name"}
                      aria-label={isBn ? "নাম পরিবর্তন করুন" : "Edit display name"}
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveName();
                    }}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (nameError) setNameError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") handleCancelEditName();
                        }}
                        disabled={isSavingName}
                        placeholder={isBn ? "আপনার নাম" : "Your name"}
                        maxLength={50}
                        autoFocus
                        className={`w-full rounded-md border px-2 py-0.5 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 ${
                          nameError
                            ? "border-rose-500 focus:ring-rose-500"
                            : "border-sky-400 focus:ring-sky-500"
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={isSavingName}
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                        title={isBn ? "সেভ করুন" : "Save name"}
                        aria-label={isBn ? "সেভ করুন" : "Save name"}
                      >
                        {isSavingName ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} className="stroke-[3]" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingName}
                        onClick={handleCancelEditName}
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title={isBn ? "বাতিল করুন" : "Cancel"}
                        aria-label={isBn ? "বাতিল করুন" : "Cancel"}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    {nameError && (
                      <p className="text-[10px] text-rose-500 font-medium truncate">{nameError}</p>
                    )}
                  </form>
                )}
                <div className="truncate text-[11px] text-slate-400">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 dark:border-slate-800">
              <span className="rounded-full bg-[#0284c7]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-400">
                {user.role === "admin" ? "ADMIN ACCESS" : user.role === "support" ? "SUPPORT ACCESS" : "STUDENT PASS"}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {isBn ? "সক্রিয় সদস্য" : "Active Member"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id as any);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#081833] text-white shadow-md dark:bg-sky-500 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? "text-[#38bdf8] dark:text-slate-950" : "text-slate-400"} />
                    <span>{isBn ? item.labelBn : item.labelEn}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <Link
              href="/leaderboard"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
              }}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/20 shadow-xs mt-3"
            >
              <div className="flex items-center gap-3">
                <Trophy size={17} className="text-amber-500 shrink-0" />
                <span>{isBn ? "ট্রেডার লিডারবোর্ড" : "Leaderboard"}</span>
              </div>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">
                Rankings
              </span>
            </Link>

            <Link
              href="/settings"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
              }}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-slate-700 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800 shadow-xs mt-2"
            >
              <div className="flex items-center gap-3">
                <SettingsIcon size={17} className="text-sky-500 shrink-0" />
                <span>{isBn ? "অ্যাকাউন্ট সেটিংস" : "Account Settings"}</span>
              </div>
              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-extrabold text-sky-500 dark:text-sky-400 uppercase tracking-wider">
                Manage
              </span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800 space-y-3">

          <div className="flex items-center justify-between">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-yellow-400 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language Switcher */}
            <LanguageSelector />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex size-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out ${
          isSidebarOpen ? "lg:pl-72" : "lg:pl-0"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#070e1b]/90">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Sidebar Toggle Button (Open / Close) */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title={
                isSidebarOpen
                  ? isBn
                    ? "সাইডবার বন্ধ করুন"
                    : "Close Sidebar"
                  : isBn
                    ? "সাইডবার খুলুন"
                    : "Open Sidebar"
              }
              aria-label={
                isSidebarOpen
                  ? isBn
                    ? "সাইডবার বন্ধ করুন"
                    : "Close Sidebar"
                  : isBn
                    ? "সাইডবার খুলুন"
                    : "Open Sidebar"
              }
            >
              {isSidebarOpen ? (
                <PanelLeftClose size={18} className="text-sky-500" />
              ) : (
                <PanelLeftOpen size={18} className="text-slate-600 dark:text-slate-300" />
              )}
            </button>

            <Link href="/" className="lg:hidden shrink-0">
              <BrandLogo size={32} />
            </Link>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isBn ? "ট্রেডিং রিয়েলিটি স্টুডেন্ট পোর্টাল" : "Institutional Trader Portal"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {isBn ? "আপনার স্টাডি লাইব্রেরি, জার্নাল ও ডিসিপ্লিন ট্র্যাকার" : "Process over emotion · Institutional Trader Portal"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {hasApprovedPurchase && (
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent("open-telegram-modal"))}
                size="sm"
                className="gap-1.5 text-xs font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20"
                title={isBn ? "ভিআইপি টেলিগ্রাম গ্রুপ" : "VIP Telegram Community"}
              >
                <Send size={13} className="translate-x-0.5 -translate-y-0.5" />
                <span className="hidden sm:inline">{isBn ? "ভিআইপি টেলিগ্রাম" : "VIP Telegram"}</span>
              </Button>
            )}

            <Link href="/leaderboard">
              <Button size="sm" className="gap-1.5 text-xs font-extrabold bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 border border-amber-500/30">
                <Trophy size={13} className="text-amber-500 shrink-0" />
                <span>{isBn ? "লিডারবোর্ড" : "Leaderboard"}</span>
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700">
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">{isBn ? "মূল ওয়েবসাইট" : "Main Website"}</span>
              </Button>
            </Link>

            <Link href="/checkout">
              <Button size="sm" className="gap-1 text-xs font-extrabold bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                <Sparkles size={13} />
                <span>{isBn ? "স্টোর ব্রাউজ" : "Browse Store"}</span>
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50" title={isBn ? "অ্যাকাউন্ট সেটিংস" : "Account Settings"}>
                <SettingsIcon size={13} className="text-sky-500" />
                <span className="hidden sm:inline">{isBn ? "সেটিংস" : "Settings"}</span>
              </Button>
            </Link>

            <LanguageSelector variant="compact" />
          </div>
        </header>

        {/* Mobile Horizontal Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden overflow-x-auto touch-pan-x overscroll-contain dark:border-slate-800 dark:bg-[#070e1b]">
          <div className="flex gap-2 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
                  tab === item.id
                    ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {isBn ? item.labelBn : item.labelEn}
              </button>
            ))}
            {hasApprovedPurchase && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-telegram-modal"))}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-extrabold text-sky-600 dark:text-sky-400"
              >
                <Send size={13} className="text-sky-500" />
                <span>{isBn ? "টেলিগ্রাম" : "Telegram"}</span>
              </button>
            )}
            <Link
              href="/leaderboard"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400"
            >
              <Trophy size={13} className="text-amber-500" />
              <span>{isBn ? "লিডারবোর্ড" : "Leaderboard"}</span>
            </Link>
            <Link
              href="/settings"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 px-3 py-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-300"
            >
              <SettingsIcon size={13} className="text-sky-500" />
              <span>{isBn ? "সেটিংস" : "Settings"}</span>
            </Link>
          </div>
        </div>

        {/* Body Content */}
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {tab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Verified Student VIP Telegram Banner */}
              {hasApprovedPurchase && (
                <div className="relative overflow-hidden rounded-3xl border border-sky-500/40 bg-gradient-to-r from-[#081f3d] via-[#09172c] to-[#071324] p-5 sm:p-7 shadow-xl shadow-sky-950/40 backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-80 h-40 bg-sky-500/10 blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30">
                        <Send size={24} className="translate-x-0.5 -translate-y-0.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                            ✓ {isBn ? "এনরোলমেন্ট অ্যাপ্রুভড" : "Enrollment Approved"}
                          </span>
                          <span className="text-[11px] font-bold text-sky-400">
                            {isBn ? "প্রাতিষ্ঠানিক ভিআইপি এক্সেস" : "VIP Student Community"}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                          {isBn
                            ? "লাইভ ক্লাস লিংক ও রেকর্ডেড ড্রাইভের জন্য অফিশিয়াল টেলিগ্রাম গ্রুপে যুক্ত থাকুন"
                            : "Access Live Classes, Video Lectures & Daily Trade Breakdown on Telegram"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
                          {isBn
                            ? "আপনার পেমেন্ট ভেরিফাই হয়েছে। সমস্ত লাইভ জুম সেশনের লিংক, শিডিউল ও প্রাইভেট সাপোর্ট টেলিগ্রাম চ্যানেলে প্রদান করা হয়।"
                            : "Your payment verification has been cleared. All live class streaming links, PDF updates, and private mentor Q&A take place inside our official Telegram room."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                      <Button
                        onClick={() => window.open(telegramUrl, "_blank")}
                        className="flex-1 sm:flex-none h-11 px-5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 gap-1.5"
                      >
                        <Send size={15} />
                        <span>{isBn ? "টেলিগ্রামে প্রবেশ করুন" : "Open VIP Telegram"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-telegram-modal"))}
                        className="h-11 px-4 rounded-xl border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                      >
                        <span>{isBn ? "নির্দেশিকা" : "Instructions"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Market Time Zone Information Widget (Read-Only Source of Truth) */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-sm dark:border-slate-800/90 dark:bg-gradient-to-r dark:from-[#0a1628] dark:via-[#091424] dark:to-[#07101e] backdrop-blur-sm transition-all">
                {/* Background decorative glow */}
                <div className="absolute -top-12 -right-12 size-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Timezone details */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/15 border border-sky-500/20 shadow-xs">
                      <Clock size={24} className="text-sky-500" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          {isBn ? "ফিনান্সিয়াল মার্কেট টাইমজোন" : "Financial Market Time Zone"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-500/20">
                          <Globe size={10} />
                          <span>{currentTimezone.market}</span>
                        </span>
                        <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          UTC {currentTimezone.offset}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {currentTimezone.city}
                        </h2>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          · {currentTimezone.label}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {isBn
                          ? "ট্রেড লগিং, মার্কেট সেশন এবং দৈনিক ডিসিপ্লিন রিসেটের সক্রিয় রেফারেন্স টাইমজোন।"
                          : "Active reference timezone for trade journaling, market session timing, and daily resets."}
                      </p>
                    </div>
                  </div>

                  {/* Right: Live Digital Clock & Settings Link */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between sm:justify-start lg:justify-center gap-3 shrink-0 pt-2 lg:pt-0 border-t border-slate-100 dark:border-slate-800/70 lg:border-t-0">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-500/10 px-4 py-2 text-left sm:text-right">
                        <div className="flex items-center gap-2 justify-start sm:justify-end">
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {liveMarketTime.date || "..."}
                          </span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-sky-400 mt-0.5">
                          {liveMarketTime.time || "--:--:-- --"}
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/settings?tab=region"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:underline transition-colors cursor-pointer"
                      title={isBn ? "টাইমজোন পরিবর্তন করতে সেটিংস → ভাষা ও অঞ্চলে যান" : "Change time zone in Settings → Language & Region"}
                    >
                      <SettingsIcon size={12} className="text-sky-500" />
                      <span>{isBn ? "সেটিংস থেকে পরিবর্তন করুন" : "Manage in Settings"}</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Top Banner KPI Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {/* 1. Total Documented Trades */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-extrabold uppercase tracking-wider">{isBn ? "মোট ট্রেড জার্নাল" : "Journal Entries"}</span>
                    <NotebookPen size={18} className="text-[#0284c7] dark:text-sky-400" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black">{journalStats.total}</span>
                    <span className="text-sm font-bold text-slate-400">{isBn ? "টি ট্রেড" : "Trades"}</span>
                  </div>
                  <div className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {journalStats.wins} {isBn ? "উইন" : "Wins"} · {journalStats.losses} {isBn ? "লস" : "Losses"}
                  </div>
                </div>

                {/* 2. Win Rate */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-extrabold uppercase tracking-wider">{isBn ? "ট্রেড উইনরেট" : "Trade Win Rate"}</span>
                    <Flame size={18} className="text-amber-500" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black">{journalStats.winRate}%</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">({journalStats.wins}W / {journalStats.losses}L)</span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {journalStats.total} {isBn ? "টি ট্রেড জার্নালে লিপিবদ্ধ" : "documented trade logs"}
                  </div>
                </div>

                {/* 3. Journal Logs */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-extrabold uppercase tracking-wider">{isBn ? "আনলকড রিসোর্স" : "My Resources"}</span>
                    <BookOpen size={18} className="text-purple-500" />
                  </div>
                  <div className="mt-4 text-3xl font-black">{entitlements?.length || 0}</div>
                  <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isBn ? "সক্রিয় PDF ও কোর্স অ্যাক্সেস" : "Active package entitlements"}
                  </div>
                </div>

                {/* 4. Today's Discipline */}
                <button
                  onClick={() => setTab("discipline")}
                  className="rounded-3xl bg-[#081833] p-6 text-white shadow-xl shadow-[#081833]/15 dark:bg-slate-800 text-left transition-all hover:ring-2 hover:ring-[#38bdf8]/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#38bdf8]">{isBn ? "আজকের রুটিন" : "Today's Discipline"}</span>
                    <ClipboardCheck size={18} className="text-[#38bdf8]" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black">{discipline?.filter((d: any) => d.completed).length || 0}</span>
                    <span className="text-sm font-bold text-slate-400">/ 6 {isBn ? "রুলস" : "Rules"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-300">
                    <span>{isBn ? "ডিসিপ্লিনই ট্রেডারের মূল শক্তি" : "Process over emotion"}</span>
                    <ChevronRight size={14} className="text-[#38bdf8]" />
                  </div>
                </button>

                {/* 5. Your Global Rank */}
                <Link href="/leaderboard">
                  <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-white to-slate-50 p-6 shadow-sm dark:border-amber-500/30 dark:from-[#141d2e] dark:via-[#0c1527] dark:to-[#070e1b] transition-all hover:ring-2 hover:ring-amber-500/50 cursor-pointer h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {isBn ? "আপনার গ্লোবাল র‍্যাঙ্ক" : "YOUR GLOBAL RANK"}
                        </span>
                        <Trophy size={18} className="text-amber-500" />
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                          {myRankData?.isRanked && myRankData.rank ? `#${myRankData.rank}` : "Unranked"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>
                        {myRankData?.isRanked && myRankData.overallScore !== null
                          ? `${isBn ? "স্কোর" : "Overall Score"}: ${myRankData.overallScore} / 100`
                          : (isBn ? "র‌্যাঙ্ক পেতে ট্রেড লগ করুন" : "Log trades to qualify")}
                      </span>
                      <ChevronRight size={14} className="text-amber-500" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Recent Order Status Alert Banner */}
              {orders && orders.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className={`p-3 rounded-2xl shrink-0 ${
                        orders[0].orderStatus === "approved"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : orders[0].orderStatus === "rejected"
                          ? "bg-rose-500/10 text-rose-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        <Receipt size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                            {isBn ? "সর্বশেষ অর্ডার" : "Latest Order"} #{orders[0].id}
                          </span>
                          <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 text-[11px] font-extrabold text-sky-700 dark:text-sky-300">
                            {orders[0].bundleId === 4 ? "Bundle 4 · Trading Blueprint" : orders[0].bundleId === 2 ? "Bundle 2 · Course + eBook" : orders[0].bundleId === 1 ? "Free eBook Package" : `Bundle #${orders[0].bundleId}`}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              orders[0].orderStatus === "approved"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : orders[0].orderStatus === "rejected"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 animate-pulse"
                            }`}
                          >
                            {orders[0].orderStatus === "approved" ? (isBn ? "অনুমোদিত" : "Approved") : orders[0].orderStatus === "rejected" ? (isBn ? "বাতিল" : "Rejected") : (isBn ? "যাচাই প্রক্রিয়াধীন (১৫-৩০ মিনিট)" : "Pending Review (15–30 mins)")}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {orders[0].paymentMethod?.toUpperCase()} · TrxID: <code className="font-mono font-bold text-slate-700 dark:text-slate-200">{orders[0].transactionId}</code> · ৳{orders[0].amount} BDT
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setTab("orders")}
                      className="text-xs font-extrabold text-sky-600 hover:text-sky-500 dark:text-sky-400 shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isBn ? "সব অর্ডার দেখুন" : "View All Orders"}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Learning Resource Banner CTA */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#081833] via-[#0f2c59] to-[#0a1e3d] p-7 sm:p-9 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#38bdf8]">
                      <Sparkles size={13} /> {isBn ? "প্রাতিষ্ঠানিক রিসোর্স" : "INSTITUTIONAL EDGE"}
                    </span>
                    <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {isBn ? "প্রাতিষ্ঠানিক চিট-শীট ও হাই-RR ট্রেডিং মডেল" : "Institutional Cheat-Sheets & High-RR Models"}
                    </h2>
                    <p className="mt-2 max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {isBn
                        ? "ক্যান্ডেল রেঞ্জ থিওরি (CRT), লিকুইডিটি সুইপ এবং প্রাতিষ্ঠানিক রিস্ক ম্যানেজমেন্ট গাইড অনুশীলন করে আপনার এজ তৈরি করুন।"
                        : "Master candle range theory (CRT), liquidity sweeps, and strict risk management through curated institutional guides."}
                    </p>
                  </div>

                  <Button
                    onClick={() => setTab("library")}
                    size="lg"
                    className="shrink-0 gap-2 rounded-2xl bg-[#38bdf8] font-black text-slate-950 hover:bg-[#7dd3fc] shadow-lg shadow-sky-500/20"
                  >
                    <span>{isBn ? "লাইব্রেরি ওপেন করুন" : "Open Study Library"}</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>

              {/* Two Column Section: Quick Recent Journal & Discipline */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Journal Entries */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold">{isBn ? "সাম্প্রতিক ট্রেড জার্নাল" : "Recent Trade Logs"}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setTab("journal")} className="text-xs font-bold text-[#0284c7] dark:text-sky-400">
                      {isBn ? "সব দেখুন" : "View all"} →
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {localTrades?.length ? (
                      localTrades.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900 dark:text-white">{item.pair} ({item.direction})</span>
                              <span className="text-[10px] font-mono font-bold text-cyan-500">#{item.tradeNumber}</span>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                item.pnl > 0.001
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : item.pnl < -0.001
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {item.pnl > 0.001 ? `+$${item.pnl.toFixed(2)}` : item.pnl < -0.001 ? `-$${Math.abs(item.pnl).toFixed(2)}` : "BE $0"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.note || item.learning || "Trade recorded in Institutional Journal"}</p>
                          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                            <span>{item.timeframe}</span>
                            <span>•</span>
                            <span>RR {item.riskReward}</span>
                            <span>•</span>
                            <span>Rank {item.tradeRank}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      ))
                    ) : journal?.length ? (
                      journal.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm">{item.title}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                item.result?.toLowerCase() === "win"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : item.result?.toLowerCase() === "loss"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {item.result || "Logged"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.content}</p>
                          <div className="mt-2 text-[10px] font-mono text-slate-400">{item.setup || "General Setup"} • {new Date(item.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                        {isBn ? "এখনো কোনো ট্রেড জার্নাল এন্ট্রি যোগ করা হয়নি।" : "No trade logs recorded yet. Build the habit of journaling every setup."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Daily Discipline Checklist */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold">{isBn ? "ডেইলি ট্রেডার চেকলিস্ট" : "Daily Discipline Checklist"}</h3>
                      <span className="text-xs font-mono font-bold text-slate-400">{today}</span>
                    </div>
                    <button
                      onClick={() => setTab("discipline")}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-500 hover:text-sky-600 transition-colors"
                    >
                      <span>{isBn ? "সম্পূর্ণ সিস্টেম" : "Full System"}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {DAILY_DISCIPLINE_RULES.slice(0, 4).map((rule) => {
                      const isChecked = discipline?.some((d: any) => d.label === rule.id && d.completed);
                      return (
                        <button
                          key={rule.id}
                          onClick={() => toggleDisciplineMutation.mutate({ label: rule.id, date: today, completed: !isChecked })}
                          className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                            isChecked
                              ? "border-emerald-200 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
                              : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/40"
                          }`}
                        >
                          <div className="mt-0.5">
                            {isChecked ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-300 dark:text-slate-600" />}
                          </div>
                          <span className={`text-xs font-medium leading-relaxed ${isChecked ? "line-through opacity-80" : ""}`}>
                            {isBn ? rule.textBn : rule.textEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 12-STAGE ROADMAP TRACKER */}
          {/* ========================================================================= */}
          {tab === "roadmap" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {isBn ? "১২-স্টেজ ট্রেডিং রিয়েলিটি রোডম্যাপ" : "12-Stage Institutional Roadmap"}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isBn
                      ? "প্রতিটি স্টেজ ওপেন করে প্রাতিষ্ঠানিক রুলস পড়ুন এবং সম্পন্ন করার পর টিক দিন।"
                      : "Master institutional concepts step-by-step. Click any stage to study rules & log notes."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["all", "completed", "todo"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setRoadmapFilter(f)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                        roadmapFilter === f
                          ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {isBn
                        ? f === "all"
                          ? "সবগুলো"
                          : f === "completed"
                          ? "সম্পন্ন"
                          : "বাকি আছে"
                        : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* 12 Stages Cards Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dashboardStages
                  .filter((stg) => {
                    const isDone = progress?.some((p: any) => p.lessonId === stg.stageNumber && p.completed);
                    if (roadmapFilter === "completed") return isDone;
                    if (roadmapFilter === "todo") return !isDone;
                    return true;
                  })
                  .map((stg) => {
                    const isDone = progress?.some((p: any) => p.lessonId === stg.stageNumber && p.completed);
                    return (
                      <div
                        key={stg.stageNumber}
                        onClick={() => setSelectedRoadmapStage(stg)}
                        className={`group relative flex cursor-pointer flex-col justify-between rounded-3xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                          isDone
                            ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                            : "border-slate-200 bg-white hover:border-[#0284c7]/50 dark:border-slate-800 dark:bg-slate-900"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {isBn
                                ? `স্টেজ ${String(stg.stageNumber).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}`
                                : `Stage ${String(stg.stageNumber).padStart(2, "0")}`}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] dark:text-sky-400">
                              {stg.category}
                            </span>
                          </div>

                          <h3 className="mt-4 text-base font-extrabold group-hover:text-[#0284c7] dark:group-hover:text-sky-400 transition-colors">
                            {stg.title}
                          </h3>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {stg.summary}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                          <span className="text-xs font-bold text-[#0284c7] dark:text-sky-400 flex items-center gap-1">
                            <span>{isBn ? "বিস্তারিত দেখুন" : "View Rules & Notes"}</span>
                            <ChevronRight size={13} />
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProgressMutation.mutate({ lessonId: stg.stageNumber, completed: !isDone });
                            }}
                            className={`rounded-full p-1.5 transition ${
                              isDone
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800"
                            }`}
                            title={isDone ? "Mark as uncompleted" : "Mark as completed"}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: MY LIBRARY & RESOURCES */}
          {/* ========================================================================= */}
          {tab === "library" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "আমার লাইব্রেরি ও প্রাতিষ্ঠানিক রিসোর্স" : "Institutional PDF Library & Course"}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isBn ? "অনলাইনে প্রিভিউ দেখুন অথবা সম্পূর্ণ চিট-শীট ফাইলটি সরাসরি ডাউনলোড করুন।" : "Preview interactive cheat-sheets in browser or download printable study files."}
                  </p>
                </div>

                <Link href="/checkout">
                  <Button size="sm" className="gap-1.5 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold">
                    <Plus size={15} /> {isBn ? "নতুন রিসোর্স আনলক করুন" : "Browse Store Bundles"}
                  </Button>
                </Link>
              </div>

              {/* Loading Skeletons */}
              {isLoadingLibrary && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-56 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 animate-pulse dark:border-slate-800 dark:bg-slate-900/50 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      </div>
                      <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoadingLibrary && (!libraryPdfs || libraryPdfs.length === 0) && (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 sm:p-14 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center">
                  <div className="size-16 rounded-2xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-[#0284c7] dark:text-sky-400 mb-4 border border-sky-100 dark:border-sky-900/50">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {isBn ? "আপনার লাইব্রেরিতে কোনো PDF নেই" : "No PDFs in your library yet."}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                    {isBn
                      ? "আমাদের প্রাতিষ্ঠানিক স্ট্র্যাটেজি গাইড, চিট-শীট ও সম্পূর্ণ ট্রেডিং কোর্স আনলক করতে স্টোর বান্ডেলগুলো দেখুন।"
                      : "Explore our institutional blueprints, high-resolution cheat-sheets, and comprehensive trading courses to unlock them here."}
                  </p>
                  <Link href="/checkout">
                    <Button className="mt-6 gap-2 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold px-6 py-2.5 rounded-2xl shadow-md">
                      <Plus size={16} /> {isBn ? "স্টোর বান্ডেল দেখুন" : "Browse Store Bundles"}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Resource Cards Grid */}
              {!isLoadingLibrary && libraryPdfs && libraryPdfs.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {libraryPdfs.map((pdf: any) => {
                    const title = isBn && pdf.titleBn ? pdf.titleBn : (pdf.titleEn || pdf.title);
                    const subtitle = isBn && pdf.subtitleBn ? pdf.subtitleBn : (pdf.subtitleEn || pdf.subtitle || "");
                    const isFree = pdf.isFree === true || Number(pdf.price) === 0 || !pdf.price;

                    return (
                      <div key={pdf.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                              {pdf.category || (isFree ? "FREE PDF" : "INSTITUTIONAL PDF")}
                            </span>
                            <FileText size={18} className="text-[#0284c7] dark:text-sky-400" />
                          </div>
                          <h3 className="mt-4 text-base font-extrabold">{title}</h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{subtitle}</p>
                          <div className="mt-3 text-[11px] font-mono text-slate-400">
                            {pdf.pages || 15} Pages · {pdf.fileSize || "High Resolution Reference"}
                          </div>
                        </div>

                        <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                          <Button
                            size="sm"
                            onClick={() => setPreviewPdfModal(pdf)}
                            variant="outline"
                            className="w-1/2 text-xs font-bold border-slate-300 dark:border-slate-700"
                          >
                            <Eye size={13} className="mr-1" />
                            <span>{isBn ? "প্রিভিউ" : "Preview"}</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleDownloadResource(pdf)}
                            className="w-1/2 gap-1 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                          >
                            <Download size={13} />
                            <span>{isBn ? "ডাউনলোড" : "Download"}</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: TRADING JOURNAL */}
          {/* ========================================================================= */}
          {tab === "journal" && (
            <TraderJournal isBn={isBn} user={user} />
          )}

          {/* ========================================================================= */}
          {/* TAB 5: DAILY DISCIPLINE */}
          {/* ========================================================================= */}
          {tab === "discipline" && (
            <DailyDisciplineMaster user={user} isBn={isBn} />
          )}

          {/* ========================================================================= */}
          {/* TAB: POSITION SIZE CALCULATOR */}
          {/* ========================================================================= */}
          {tab === "calculator" && (
            <PositionSizeCalculator />
          )}

          {/* ========================================================================= */}
          {/* TAB 6: ORDERS & PAYMENT HISTORY */}
          {/* ========================================================================= */}
          {tab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "পেমেন্ট ও অর্ডার হিস্ট্রি" : "Orders & Manual Verification History"}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isBn ? "আপনার বিকাশ, নগদ ও রকেট অর্ডারের ভেরিফিকেশন স্ট্যাটাস ও ইনভয়েস।" : "Track your manual payment verification statuses and generate official receipts."}
                  </p>
                </div>

                <Link href="/checkout">
                  <Button size="sm" className="bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold">
                    <Plus size={15} className="mr-1" /> {isBn ? "নতুন অর্ডার করুন" : "New Order"}
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {orders?.length ? (
                  orders.map((o: any) => (
                    <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-extrabold text-base">Order #{o.id}</span>
                          <span className="rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 text-[11px] font-extrabold text-sky-700 dark:text-sky-300">
                            {o.bundleId === 4 ? "Bundle 4 · Trading Blueprint" : o.bundleId === 2 ? "Bundle 2 · Course + eBook" : o.bundleId === 1 ? "Free eBook Package" : `Bundle #${o.bundleId}`}
                          </span>
                          <span className="font-mono text-xs text-slate-400">TxID: {o.transactionId}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                          <span>{isBn ? "পদ্ধতি:" : "Method:"} <b className="uppercase text-slate-700 dark:text-slate-300">{o.paymentMethod}</b></span>
                          <span>•</span>
                          <span>{isBn ? "তারিখ:" : "Date:"} {new Date(o.createdAt).toLocaleDateString()}</span>
                          {o.orderStatus === "pending" && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {isBn ? "১৫-৩০ মিনিটের মধ্যে অ্যাপ্রুভ হবে" : "Approval usually within 15–30 mins"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <div className="text-lg font-black">৳{o.amount}</div>
                          <div className="text-[10px] text-slate-400">BDT</div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                            o.orderStatus === "approved"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : o.orderStatus === "rejected"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          }`}
                        >
                          {o.orderStatus === "approved" ? (isBn ? "অনুমোদিত" : "Approved") : o.orderStatus === "rejected" ? (isBn ? "বাতিল" : "Rejected") : (isBn ? "যাচাই প্রক্রিয়াধীন" : "Pending Review")}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoiceOrder(o)}
                          className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
                        >
                          <Printer size={13} />
                          <span>Receipt</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-slate-800">
                    <Receipt size={36} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="font-bold text-base">{isBn ? "এখনো কোনো অর্ডার নেই" : "No orders found"}</h3>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: DIRECT SUPPORT CHAT */}
          {/* ========================================================================= */}
          {tab === "support" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SupportChat inline />
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 12-STAGE ROADMAP DEEP DIVE MODAL */}
      {/* ========================================================================= */}
      {selectedRoadmapStage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedRoadmapStage(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-sky-500/10 dark:text-sky-400">
                    {isBn
                      ? `স্টেজ ${String(selectedRoadmapStage.stageNumber).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}`
                      : `STAGE ${String(selectedRoadmapStage.stageNumber).padStart(2, "0")}`}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {selectedRoadmapStage.category}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedRoadmapStage.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoadmapStage(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="mt-6 space-y-5 text-sm">
              {/* Summary / Overview */}
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0284c7] dark:text-sky-400 mb-2">
                  {isBn ? "ওভারভিউ ও মূল লক্ষ্য" : "Stage Overview & Objective"}
                </h4>
                <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedRoadmapStage.summary}
                </p>
              </div>

              {/* Core Topics & Rules */}
              {selectedRoadmapStage.keyPoints && selectedRoadmapStage.keyPoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#0284c7] dark:text-sky-400" />
                    <span>{isBn ? "মূল বিষয়সমূহ ও প্রাতিষ্ঠানিক রুলস" : "Core Topics & Institutional Rules"}</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedRoadmapStage.keyPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs sm:text-sm text-slate-700 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-300"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-100 font-mono text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-400 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Exercise (if present) */}
              {selectedRoadmapStage.exercise && (
                <div className="rounded-2xl border border-sky-200/60 bg-sky-50/50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>{isBn ? "প্র্যাকটিক্যাল এক্সারসাইজ / অ্যাসাইনমেন্ট" : "Practical Exercise & Chart Task"}</span>
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedRoadmapStage.exercise}
                  </p>
                </div>
              )}

              {/* Institutional Edge (if present) */}
              {selectedRoadmapStage.edge && (
                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                    {isBn ? "প্রাতিষ্ঠানিক ট্রেডারদের দৃষ্টিভঙ্গি (Edge)" : "Institutional Edge"}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedRoadmapStage.edge}
                  </p>
                </div>
              )}

              {/* Personal Study Notes */}
              <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {isBn ? "আপনার স্টাডি নোট ও ব্যক্তিগত রিমাইন্ডার" : "Your Personal Study Notes"}
                </label>
                <textarea
                  rows={3}
                  value={stageNotes[selectedRoadmapStage.stageNumber] || ""}
                  onChange={(e) => handleSaveStageNote(selectedRoadmapStage.stageNumber, e.target.value)}
                  placeholder={
                    isBn
                      ? "এই স্টেজ থেকে আপনার ব্যক্তিগত পর্যবেক্ষণ ও গুরুত্বপূর্ণ রুলস লিখে রাখুন..."
                      : "Jot down your key takeaways, chart observations, or rules for this stage..."
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm outline-none focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Bottom Actions: Progress Completion Toggle */}
              {(() => {
                const isCompleted = progress?.some(
                  (p: any) => p.lessonId === selectedRoadmapStage.stageNumber && p.completed
                );
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <Button
                      onClick={() => {
                        toggleProgressMutation.mutate({
                          lessonId: selectedRoadmapStage.stageNumber,
                          completed: !isCompleted,
                        });
                      }}
                      className={`w-full sm:w-auto gap-2 font-bold ${
                        isCompleted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-[#081833] hover:bg-[#0c244b] text-white dark:bg-sky-500 dark:text-slate-950"
                      }`}
                    >
                      <Check size={16} />
                      <span>
                        {isCompleted
                          ? isBn
                            ? "সম্পন্ন হয়েছে (আনচেক করতে ক্লিক করুন)"
                            : "Completed (Click to uncheck)"
                          : isBn
                          ? "স্টেজ সম্পন্ন হিসেবে মার্ক করুন"
                          : "Mark Stage as Completed"}
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedRoadmapStage(null)}
                      className="w-full sm:w-auto font-bold"
                    >
                      {isBn ? "বন্ধ করুন" : "Close"}
                    </Button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={() => setPreviewPdfModal(null)}>
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0284c7] dark:text-sky-400">
                  {previewPdfModal.category ? `${previewPdfModal.category.toUpperCase()} RESOURCE` : "INSTITUTIONAL PDF GUIDE"}
                </span>
                <h3 className="text-base font-extrabold mt-0.5">
                  {isBn && previewPdfModal.titleBn ? previewPdfModal.titleBn : (previewPdfModal.titleEn || previewPdfModal.title)}
                </h3>
              </div>
              <button onClick={() => setPreviewPdfModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs leading-relaxed">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-3">
                <div className="font-extrabold text-slate-800 dark:text-slate-200">
                  {isBn && previewPdfModal.subtitleBn ? previewPdfModal.subtitleBn : (previewPdfModal.subtitleEn || previewPdfModal.subtitle)}
                </div>
                {previewPdfModal.keyConcepts && Array.isArray(previewPdfModal.keyConcepts) && previewPdfModal.keyConcepts.length > 0 && (
                  <div className="space-y-2">
                    {previewPdfModal.keyConcepts.map((c: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-100 font-mono text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-400">
                          {idx + 1}
                        </span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleDownloadResource(previewPdfModal)}
                  className="w-full gap-1.5 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                >
                  <Download size={14} />
                  <span>{isBn ? "সম্পূর্ণ PDF গাইড ডাউনলোড করুন" : "Download Full PDF Guide"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LOG TRADE MODAL */}
      {/* ========================================================================= */}
      {showNewJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowNewJournalModal(false)}>
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-extrabold">{isBn ? "নতুন ট্রেড জার্নাল এন্ট্রি" : "Log Trade Setup"}</h3>
              <button onClick={() => setShowNewJournalModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!journalTitle.trim() || !journalContent.trim()) return;
                createJournalMutation.mutate({
                  title: `${journalPair} ${journalTitle.trim()}`,
                  content: journalContent.trim(),
                  setup: `${journalSetup} (${journalSession}) · RR: ${journalRR}`,
                  result: journalResult,
                });
              }}
              className="mt-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Trading Pair</label>
                  <select
                    value={journalPair}
                    onChange={(e) => setJournalPair(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option>EUR/USD</option>
                    <option>GBP/USD</option>
                    <option>USD/JPY</option>
                    <option>XAU/USD (Gold)</option>
                    <option>BTC/USD</option>
                    <option>ETH/USD</option>
                    <option>NAS100</option>
                    <option>US30</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Direction & Setup</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Long 1:3.5 RR"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Strategy Model</label>
                  <select
                    value={journalSetup}
                    onChange={(e) => setJournalSetup(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option>CRT Range Model</option>
                    <option>SMC Order Block (OB)</option>
                    <option>Liquidity Sweep (BSL/SSL)</option>
                    <option>CHoCH Trend Reversal</option>
                    <option>Break & Retest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Outcome</label>
                  <select
                    value={journalResult}
                    onChange={(e) => setJournalResult(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Win">Win (লাভ 🏆)</option>
                    <option value="Loss">Loss (লস 🛑)</option>
                    <option value="Breakeven">Breakeven (সমান ⚪)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Trade Logic, Discipline & Reflection</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Why did you take this trade? Did you stick to your 1% risk rule? Any emotional hesitation?"
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <Button type="submit" disabled={createJournalMutation.isPending} className="w-full bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                {createJournalMutation.isPending ? "Saving..." : isBn ? "জার্নালে সংরক্ষণ করুন" : "Save to Journal"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE INVOICE / RECEIPT MODAL */}
      {/* ========================================================================= */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BrandLogo size={28} />
                <span className="text-xs font-black tracking-widest uppercase">OFFICIAL RECEIPT</span>
              </div>
              <button onClick={() => setSelectedInvoiceOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Invoice Number</div>
                  <div className="font-mono font-bold text-sm">#INV-COC-{selectedInvoiceOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Date</div>
                  <div className="font-bold">{new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer ID:</span>
                  <span className="font-bold">Student #{selectedInvoiceOrder.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Gateway:</span>
                  <span className="font-bold uppercase">{selectedInvoiceOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold">{selectedInvoiceOrder.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                    {selectedInvoiceOrder.orderStatus}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                <span className="font-bold">Total Paid:</span>
                <span className="text-xl font-black text-[#081833] dark:text-white">৳{selectedInvoiceOrder.amount} BDT</span>
              </div>

              <Button onClick={() => window.print()} className="w-full gap-2 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950">
                <Printer size={14} />
                <span>Print Official Invoice</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPEN SUPPORT TICKET MODAL */}
      {/* ========================================================================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowNewTicketModal(false)}>
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-extrabold">{isBn ? "নতুন সাপোর্ট টিকিট" : "Open Support Ticket"}</h3>
              <button onClick={() => setShowNewTicketModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!ticketSubject.trim() || !ticketMessage.trim()) return;
                createTicketMutation.mutate({ subject: `[${ticketCategory}] ${ticketSubject.trim()}`, message: ticketMessage.trim() });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  <option>Payment Verification</option>
                  <option>Resource / eBook Access</option>
                  <option>Roadmap Clarification</option>
                  <option>Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{isBn ? "বিষয়" : "Subject"}</label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? "যেমন: পেমেন্ট ভেরিফিকেশন সহায়তা" : "e.g. Need assistance with eBook download"}
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{isBn ? "বিস্তারিত বিবরণ" : "Message"}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={isBn ? "আপনার সমস্যার বিস্তারিত লিখুন..." : "Describe your inquiry or issue in detail..."}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <Button type="submit" disabled={createTicketMutation.isPending} className="w-full bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                {createTicketMutation.isPending ? "Submitting..." : isBn ? "টিকিট জমা দিন" : "Submit Ticket"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Course Access Telegram Community Popup Modal */}
      {telegramPopupData && !isTelegramModalDismissedLocally && (
        <CourseTelegramModal
          isOpen={true}
          config={telegramPopupData.config}
          lang={isBn ? "bn" : "en"}
          onClose={() => setIsTelegramModalDismissedLocally(true)}
          onJoin={async () => {
            try {
              await recordTelegramActionMutation.mutateAsync({
                eventId: telegramPopupData.event.id,
                action: "joined",
              });
            } catch (e) {
              console.warn("[Telegram action record notice]:", e);
            }
            setIsTelegramModalDismissedLocally(true);
          }}
          onDismiss={async () => {
            try {
              await recordTelegramActionMutation.mutateAsync({
                eventId: telegramPopupData.event.id,
                action: "dismissed",
              });
            } catch (e) {
              console.warn("[Telegram action dismiss notice]:", e);
            }
            setIsTelegramModalDismissedLocally(true);
          }}
        />
      )}

      {/* New User One-Time Onboarding Modal */}
      {showOnboardingModal && (
        <NewUserOnboardingModal
          isOpen={true}
          userKey={userKey}
        />
      )}
    </div>
  );
}
