import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  BookMarked,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  Edit2,
  ExternalLink,
  FileCheck2,
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
  Receipt,
  RotateCcw,
  Search,
  Share2,
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
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TraderJournal } from "@/components/journal/TraderJournal";
import { TraderNotebook } from "@/components/notebook/TraderNotebook";
import { getStoredTrades } from "@/lib/traderJournalStorage";
import { getDashboardRoadmapStages, DashboardRoadmapStage } from "@/data/roadmapStages";
import { DailyDisciplineMaster } from "@/components/discipline/DailyDisciplineMaster";
import { PositionSizeCalculator } from "@/components/calculator/PositionSizeCalculator";
import { uploadImage } from "@/lib/mediaUpload";
import { CourseTelegramModal } from "@/components/CourseTelegramModal";
import { NewUserOnboardingModal } from "@/components/NewUserOnboardingModal";
import { DashboardOverviewTab } from "./dashboard/DashboardOverviewTab";
import { DashboardRoadmapTab } from "./dashboard/DashboardRoadmapTab";
import { DashboardLibraryTab } from "./dashboard/DashboardLibraryTab";
import { DashboardOrdersTab } from "./dashboard/DashboardOrdersTab";
import { DashboardSupportTab } from "./dashboard/DashboardSupportTab";
import { DashboardMobileNav } from "./dashboard/DashboardMobileNav";
import { DashboardRoadmapStageModal } from "./dashboard/DashboardRoadmapStageModal";
import { DashboardReceiptModal, type DashboardInvoiceOrder } from "./dashboard/DashboardReceiptModal";
import { ClaimFreePlanModal } from "@/features/subscription";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Active Tab
  const [tab, setTab] = useState<
    "overview" | "roadmap" | "library" | "journal" | "notebook" | "discipline" | "calculator" | "orders" | "support"
  >(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/notebook") return "notebook";
      if (window.location.pathname === "/discipline") return "discipline";
      if (window.location.pathname === "/calculator") return "calculator";
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === "notebook" ||
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
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const { t, language, isBn, isUr, isRTL, selectText } = useLanguage();
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
    if (typeof window === "undefined") return;
    const syncTabFromLocation = () => {
      if (window.location.pathname === "/notebook") {
        setTab("notebook");
        return;
      }
      if (window.location.pathname === "/discipline") {
        setTab("discipline");
        return;
      }
      if (window.location.pathname === "/calculator") {
        setTab("calculator");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === "notebook" ||
        tabParam === "discipline" ||
        tabParam === "calculator" ||
        tabParam === "roadmap" ||
        tabParam === "library" ||
        tabParam === "journal" ||
        tabParam === "orders" ||
        tabParam === "support" ||
        tabParam === "overview"
      ) {
        setTab(tabParam as any);
      }
    };
    syncTabFromLocation();
    window.addEventListener("popstate", syncTabFromLocation);
    return () => window.removeEventListener("popstate", syncTabFromLocation);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    // Preserve dedicated subroute URLs so they are not overwritten to /dashboard
    if (path === "/notebook" || path === "/discipline" || path === "/calculator") {
      return;
    }
    const url = new URL(window.location.href);
    if (tab === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentUrl !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [tab]);

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
  const [isQuickJournalClaimModalOpen, setIsQuickJournalClaimModalOpen] = useState(false);
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
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<DashboardInvoiceOrder | null>(null);

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

  const { data: subUsage } = trpc.subscription.getMyUsage.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
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
  // Directly respects server-side calculated course access (manual grants, orders, lifetime, admin overrides)
  const hasApprovedPurchase = useMemo(() => {
    if (subUsage && typeof (subUsage as any).hasCourseAccess === "boolean") {
      return (subUsage as any).hasCourseAccess;
    }
    const hasApprovedPaidOrder = (orders || []).some((o: any) => {
      const isApproved = o.paymentStatus === "approved" || o.orderStatus === "approved";
      const isPaid = Number(o.amount || 0) > 0 || (o.bundleId != null && Number(o.bundleId) > 0);
      return isApproved && isPaid;
    });
    const hasPaidEntitlement = (entitlements || []).some((e: any) => {
      const isPaidScope = e.scope && !e.scope.includes("free") && (e.scope.startsWith("bundle:") || e.scope.startsWith("product:") || e.scope === "course");
      const hasValidOrder = (e.orderId && Number(e.orderId) > 0) || (e as any).isVirtualManual;
      return isPaidScope && hasValidOrder;
    });
    return hasApprovedPaidOrder || hasPaidEntitlement;
  }, [subUsage, orders, entitlements]);

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
      setNameError(
        selectText({
          en: "Name cannot be empty",
          bn: "নাম খালি রাখা যাবে না",
          ur: "نام خالی نہیں ہو سکتا",
        })
      );
      return;
    }
    if (trimmed.length < 2) {
      setNameError(
        selectText({
          en: "Name must be at least 2 characters",
          bn: "কমপক্ষে ২ অক্ষরের নাম লিখুন",
          ur: "نام کم از کم ۲ حروف پر مشتمل ہونا چاہیے",
        })
      );
      return;
    }
    if (trimmed.length > 50) {
      setNameError(
        selectText({
          en: "Name cannot exceed 50 characters",
          bn: "নাম সর্বোচ্চ ৫০ অক্ষরের হতে হবে",
          ur: "نام ۵۰ حروف سے زیادہ نہیں ہو سکتا",
        })
      );
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
        selectText({
          en: "Display name updated successfully!",
          bn: "নাম সফলভাবে সেভ করা হয়েছে!",
          ur: "ڈسپلے کا نام کامیابی سے محفوظ ہو گیا!",
        })
      );

      setIsEditingName(false);
    } catch (err: any) {
      console.error("[Failed to update name]:", err);
      const failMsg = selectText({
        en: "Failed to save name",
        bn: "নাম সেভ করতে সমস্যা হয়েছে",
        ur: "نام محفوظ کرنے میں ناکامی",
      });
      setNameError(err.message || failMsg);
      toast.error(err.message || failMsg);
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
      alert(
        selectText({
          en: "Please select a valid image file (JPG, PNG, WEBP).",
          bn: "অনুগ্রহ করে JPG, PNG অথবা WEBP ফরম্যাটের ছবি নির্বাচন করুন।",
          ur: "براہ کرم درست تصویر منتخب کریں (JPG, PNG, WEBP)۔",
        })
      );
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
        const toastId = toast.loading(
          selectText({
            en: "Uploading photo to cloud...",
            bn: "ক্লাউডে ছবি আপলোড হচ্ছে...",
            ur: "کلاؤڈ پر تصویر اپ لوڈ ہو رہی ہے...",
          })
        );

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
            toast.success(
              selectText({
                en: "Profile photo updated successfully!",
                bn: "প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!",
                ur: "پروفائل تصویر کامیابی سے اپ ڈیٹ ہو گئی!",
              }),
              { id: toastId }
            );
          })
          .catch((err) => {
            console.error("[Avatar cloud upload failed]:", err);
            toast.error(
              selectText({
                en: "Failed to upload photo to cloud.",
                bn: "ক্লাউডে ছবি আপলোড ব্যর্থ হয়েছে।",
                ur: "کلاؤڈ پر تصویر اپ لوڈ کرنے میں ناکامی۔",
              }),
              { id: toastId }
            );
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
      toast.success(
        selectText({
          en: "PDF downloaded successfully",
          bn: "PDF সফলভাবে ডাউনলোড হয়েছে",
          ur: "PDF کامیابی سے ڈاؤن لوڈ ہو گئی",
        })
      );
    } catch (err) {
      console.error("[handleDownloadResource error]:", err);
      toast.error(
        selectText({
          en: "Failed to download PDF",
          bn: "PDF ডাউনলোড ব্যর্থ হয়েছে",
          ur: "PDF ڈاؤن لوڈ کرنے میں ناکامی",
        })
      );
    }
  };

  const completedStagesCount = useMemo(() => {
    if (!progress) return 0;
    return progress.filter((p: any) => p.completed).length;
  }, [progress]);

  const progressPercent = Math.min(100, Math.round((completedStagesCount / 12) * 100));

  const dashboardStages = useMemo(() => getDashboardRoadmapStages(language), [language]);

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
    id: "overview" | "roadmap" | "library" | "journal" | "notebook" | "backtest" | "discipline" | "calculator" | "orders" | "support";
    labelEn: string;
    labelBn: string;
    labelUr: string;
    icon: any;
    badge?: string;
    externalHref?: string;
  };

  const navItems: NavItem[] = [
    { id: "overview", labelEn: t("dashboard.tabOverview"), labelBn: "ওভারভিউ", labelUr: "اوور ویو", icon: LayoutDashboard },
    { id: "roadmap", labelEn: t("dashboard.tabRoadmap"), labelBn: "১২-স্টেজ রোডম্যাপ", labelUr: "۱۲-مرحلہ روڈ میپ", icon: Layers, badge: `${completedStagesCount}/12` },
    { id: "library", labelEn: t("dashboard.tabLibrary"), labelBn: "আমার লাইব্রেরি", labelUr: "میری لائبریری", icon: BookOpen, badge: entitlements?.length ? `${entitlements.length}` : undefined },
    { id: "journal", labelEn: t("dashboard.tabJournal"), labelBn: "ট্রেডিং জার্নাল", labelUr: "ٹریڈنگ جرنل", icon: NotebookPen, badge: (localTrades?.length || journal?.length) ? `${localTrades?.length || journal?.length}` : undefined },
    { id: "notebook", labelEn: "Private Trader Notebook", labelBn: "প্রাইভেট ট্রেডার নোটবুক", labelUr: "پرائیویٹ ٹریڈر نوٹ بک", icon: BookMarked },
    { id: "backtest", labelEn: "Free Backtest", labelBn: "ফ্রি ব্যাকটেস্ট", labelUr: "فری بیک ٹیسٹ", icon: RotateCcw, externalHref: "https://fxreplay.com/" },
    { id: "discipline", labelEn: t("dashboard.tabDiscipline"), labelBn: "ডেইলি রুটিন", labelUr: "روزانہ کا معمول", icon: ClipboardCheck },
    { id: "calculator", labelEn: "Position Size Calculator", labelBn: "পজিশন সাইজ ক্যালকুলেটর", labelUr: "پوزیشن سائز کیلکولیٹر", icon: Calculator },
    {
      id: "orders",
      labelEn: t("dashboard.tabOrders"),
      labelBn: "পেমেন্ট হিস্ট্রি",
      labelUr: "ادائیگی کی تاریخ",
      icon: Receipt,
      badge: orders?.some((o: any) => o.orderStatus === "pending")
        ? selectText({ en: "Pending", bn: "পেন্ডিং", ur: "زیر التواء" })
        : orders?.length
        ? `${orders.length}`
        : undefined,
    },
    {
      id: "support",
      labelEn: t("dashboard.tabSupport"),
      labelBn: "সাপোর্ট চ্যাট",
      labelUr: "سپورٹ چیٹ",
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
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#070e1b] dark:text-slate-100 transition-colors duration-300 selection:bg-[#38bdf8] selection:text-slate-950 overflow-x-hidden ${
        isBn ? "font-bangla" : isUr ? "font-urdu" : ""
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
                <HeaderBrandWordmark className="text-xs" />
                <div className="text-[10px] font-bold text-[#0284c7] dark:text-sky-400">TRADING REALITY PORTAL</div>
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title={
                isSidebarOpen
                  ? selectText({ en: "Close Sidebar", bn: "সাইডবার বন্ধ করুন", ur: "سائیڈ بار بند کریں" })
                  : selectText({ en: "Open Sidebar", bn: "সাইডবার খুলুন", ur: "سائیڈ بار کھولیں" })
              }
              aria-label={
                isSidebarOpen
                  ? selectText({ en: "Close Sidebar", bn: "সাইডবার বন্ধ করুন", ur: "سائیڈ بار بند کریں" })
                  : selectText({ en: "Open Sidebar", bn: "সাইডবার খুলুন", ur: "سائیڈ بار کھولیں" })
              }
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
                  aria-label={selectText({ en: "Change profile photo", bn: "প্রোফাইল ছবি পরিবর্তন করুন", ur: "پروفائل تصویر تبدیل کریں" })}
                  className="relative flex size-10 items-center justify-center rounded-full overflow-hidden border border-slate-200/80 bg-[#081833] font-mono text-sm font-bold text-white shadow-md transition-transform active:scale-95 cursor-pointer dark:border-slate-700/80 dark:bg-sky-500 dark:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  title={selectText({ en: "Click to set or change profile photo", bn: "প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন", ur: "پروفائل تصویر سیٹ یا تبدیل کرنے کے لیے کلک کریں" })}
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
                      title={selectText({ en: "Click to edit your display name", bn: "কাস্টম নাম এডিট করতে ক্লিক করুন", ur: "ڈسپلے نام ایڈٹ کرنے کے لیے کلک کریں" })}
                      onClick={handleStartEditName}
                    >
                      {displayName}
                    </span>
                    <button
                      type="button"
                      onClick={handleStartEditName}
                      className="opacity-60 hover:opacity-100 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-all p-0.5 rounded shrink-0 cursor-pointer"
                      title={selectText({ en: "Edit display name", bn: "নাম পরিবর্তন করুন", ur: "نام تبدیل کریں" })}
                      aria-label={selectText({ en: "Edit display name", bn: "নাম পরিবর্তন করুন", ur: "نام تبدیل کریں" })}
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
                        placeholder={selectText({ en: "Your name", bn: "আপনার নাম", ur: "آپ کا نام" })}
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
                        title={selectText({ en: "Save name", bn: "সেভ করুন", ur: "محفوظ کریں" })}
                        aria-label={selectText({ en: "Save name", bn: "সেভ করুন", ur: "محفوظ کریں" })}
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
                        title={selectText({ en: "Cancel", bn: "বাতিল করুন", ur: "منسوخ کریں" })}
                        aria-label={selectText({ en: "Cancel", bn: "বাতিল করুন", ur: "منسوخ کریں" })}
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
                {selectText({ en: "Active Member", bn: "সক্রিয় সদস্য", ur: "فعال رکن" })}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              const itemClasses = `flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#081833] text-white shadow-md dark:bg-sky-500 dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
              }`;

              if (item.externalHref) {
                return (
                  <a
                    key={item.id}
                    href={item.externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={itemClasses}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className="text-slate-400" />
                      <span>{selectText({ en: item.labelEn, bn: item.labelBn, ur: item.labelUr })}</span>
                    </div>
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id as any);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={itemClasses}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? "text-[#38bdf8] dark:text-slate-950" : "text-slate-400"} />
                    <span>{selectText({ en: item.labelEn, bn: item.labelBn, ur: item.labelUr })}</span>
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
                <span>{selectText({ en: "Leaderboard", bn: "ট্রেডার লিডারবোর্ড", ur: "ٹریڈر لیڈر بورڈ" })}</span>
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
                <span>{selectText({ en: "Account Settings", bn: "অ্যাকাউন্ট সেটিংস", ur: "اکاؤنٹ کی ترتیبات" })}</span>
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
                  ? selectText({ en: "Close Sidebar", bn: "সাইডবার বন্ধ করুন", ur: "سائیڈ بار بند کریں" })
                  : selectText({ en: "Open Sidebar", bn: "সাইডবার খুলুন", ur: "سائیڈ بار کھولیں" })
              }
              aria-label={
                isSidebarOpen
                  ? selectText({ en: "Close Sidebar", bn: "সাইডবার বন্ধ করুন", ur: "سائیড بار بند کریں" })
                  : selectText({ en: "Open Sidebar", bn: "সাইডবার খুলুন", ur: "سائیڈ بار کھولیں" })
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
                {selectText({
                  en: "Institutional Trader Portal",
                  bn: "ট্রেডিং রিয়েলিটি স্টুডেন্ট পোর্টাল",
                  ur: "ادارہ جاتی ٹریڈر پورٹل",
                })}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {selectText({
                  en: "Process over emotion · Institutional Trader Portal",
                  bn: "আপনার স্টাডি লাইব্রেরি, জার্নাল ও ডিসিপ্লিন ট্র্যাকার",
                  ur: "جذبات پر طریقہ کار · ادارہ جاتی ٹریڈر پورٹل",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {hasApprovedPurchase && (
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent("open-telegram-modal"))}
                size="sm"
                className="gap-1.5 text-xs font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 px-2 sm:px-3 h-8 sm:h-9"
                title={selectText({ en: "VIP Telegram Community", bn: "ভিআইপি টেলিগ্রাম গ্রুপ", ur: "وی آئی پی ٹیلیگرام کمیونٹی" })}
              >
                <Send size={13} className="translate-x-0.5 -translate-y-0.5" />
                <span className="hidden sm:inline">{selectText({ en: "VIP Telegram", bn: "ভিআইপি টেলিগ্রাম", ur: "وی آئی پی ٹیلیگرام" })}</span>
              </Button>
            )}

            <Link href="/leaderboard" className="hidden sm:inline-flex">
              <Button size="sm" className="gap-1.5 text-xs font-extrabold bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 border border-amber-500/30 h-8 sm:h-9">
                <Trophy size={13} className="text-amber-500 shrink-0" />
                <span>{selectText({ en: "Leaderboard", bn: "লিডারবোর্ড", ur: "لیڈر بورڈ" })}</span>
              </Button>
            </Link>

            <Link href="/" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700 h-8 sm:h-9">
                <ArrowLeft size={13} />
                <span>{selectText({ en: "Main Website", bn: "মূল ওয়েবসাইট", ur: "مرکزی ویب سائٹ" })}</span>
              </Button>
            </Link>

            <Link href="/checkout">
              <Button size="sm" className="gap-1 text-xs font-extrabold bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 px-2.5 sm:px-3 h-8 sm:h-9">
                <Sparkles size={13} />
                <span className="hidden sm:inline">{selectText({ en: "Browse Store", bn: "স্টোর ব্রাউজ", ur: "اسٹور براؤز کریں" })}</span>
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-2.5 sm:px-3 h-8 sm:h-9" title={selectText({ en: "Account Settings", bn: "অ্যাকাউন্ট সেটিংস", ur: "اکاؤنٹ کی ترتیبات" })}>
                <SettingsIcon size={13} className="text-sky-500" />
                <span className="hidden sm:inline">{selectText({ en: "Settings", bn: "সেটিংস", ur: "ترتیبات" })}</span>
              </Button>
            </Link>

            <LanguageSelector variant="compact" />
          </div>
        </header>

        {/* Body Content */}
        <main className="flex-1 p-3.5 sm:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 pb-24 lg:pb-8">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {tab === "overview" && (
            <DashboardOverviewTab
              isBn={isBn}
              today={today}
              subUsage={subUsage}
              hasApprovedPurchase={hasApprovedPurchase}
              telegramUrl={telegramUrl}
              currentTimezone={currentTimezone}
              liveMarketTime={liveMarketTime}
              journalStats={journalStats}
              entitlements={entitlements}
              discipline={discipline}
              myRankData={myRankData}
              orders={orders}
              localTrades={localTrades}
              journal={journal}
              onSelectTab={(nextTab) => setTab(nextTab)}
              onToggleDisciplineRule={(payload) => toggleDisciplineMutation.mutate(payload)}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 12-STAGE ROADMAP TRACKER */}
          {/* ========================================================================= */}
          {tab === "roadmap" && (
            <DashboardRoadmapTab
              isBn={isBn}
              roadmapFilter={roadmapFilter}
              onSetRoadmapFilter={(filter) => setRoadmapFilter(filter)}
              dashboardStages={dashboardStages}
              progress={progress}
              onSelectRoadmapStage={(stage) => setSelectedRoadmapStage(stage)}
              onToggleStageProgress={(payload) => toggleProgressMutation.mutate(payload)}
            />
          )}

          {/* TAB 3: MY LIBRARY & RESOURCES */}
          {/* ========================================================================= */}
          {tab === "library" && (
            <DashboardLibraryTab
              isBn={isBn}
              isLoadingLibrary={isLoadingLibrary}
              libraryPdfs={libraryPdfs}
              onPreviewPdf={(pdf) => setPreviewPdfModal(pdf)}
              onDownloadResource={(pdf) => handleDownloadResource(pdf)}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 4: TRADING JOURNAL */}
          {/* ========================================================================= */}
          {tab === "journal" && (
            <TraderJournal isBn={isBn} user={user} />
          )}

          {/* ========================================================================= */}
          {/* TAB: PRIVATE TRADER NOTEBOOK */}
          {/* ========================================================================= */}
          {tab === "notebook" && (
            <TraderNotebook user={user} isBn={isBn} subUsage={subUsage} />
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
            <DashboardOrdersTab
              isBn={isBn}
              orders={orders}
              onSelectInvoiceOrder={(order) => setSelectedInvoiceOrder(order)}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 7: DIRECT SUPPORT CHAT */}
          {/* ========================================================================= */}
          {tab === "support" && (
            <DashboardSupportTab />
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE FIXED BOTTOM NAVIGATION BAR & DRAWER */}
      {/* ========================================================================= */}
      <DashboardMobileNav
        tab={tab}
        onSelectTab={(nextTab) => setTab(nextTab)}
        isBn={isBn}
        isMobileMoreOpen={isMobileMoreOpen}
        onToggleDrawer={() => setIsMobileMoreOpen((prev) => !prev)}
        onCloseDrawer={() => setIsMobileMoreOpen(false)}
        hasJournalActivity={Boolean(localTrades?.length || journal?.length)}
        completedStagesCount={completedStagesCount}
        entitlementsCount={entitlements?.length || 0}
        ordersCount={orders?.length || 0}
        unreadSupportCount={unreadSupportCount}
        hasApprovedPurchase={hasApprovedPurchase}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        onOpenTelegramModal={() => window.dispatchEvent(new CustomEvent("open-telegram-modal"))}
      />

      {/* ========================================================================= */}
      {/* 12-STAGE ROADMAP DEEP DIVE MODAL */}
      {/* ========================================================================= */}
      <DashboardRoadmapStageModal
        stage={selectedRoadmapStage}
        isBn={isBn}
        stageNote={selectedRoadmapStage ? stageNotes[selectedRoadmapStage.stageNumber] || "" : ""}
        isCompleted={Boolean(
          selectedRoadmapStage &&
            progress?.some(
              (p: { lessonId?: number | null; completed?: boolean | null }) =>
                p.lessonId === selectedRoadmapStage.stageNumber && Boolean(p.completed)
            )
        )}
        onClose={() => setSelectedRoadmapStage(null)}
        onSaveStageNote={handleSaveStageNote}
        onToggleProgress={(stageNumber, completed) => {
          toggleProgressMutation.mutate({
            lessonId: stageNumber,
            completed,
          });
        }}
      />

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
                  {selectText({
                    en: previewPdfModal.titleEn || previewPdfModal.title || "",
                    bn: previewPdfModal.titleBn || previewPdfModal.title || "",
                    ur: previewPdfModal.titleUr || previewPdfModal.titleEn || previewPdfModal.title || "",
                  })}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPdfModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
                title={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
                aria-label={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs leading-relaxed">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-3">
                <div className="font-extrabold text-slate-800 dark:text-slate-200">
                  {selectText({
                    en: previewPdfModal.subtitleEn || previewPdfModal.subtitle || "",
                    bn: previewPdfModal.subtitleBn || previewPdfModal.subtitle || "",
                    ur: previewPdfModal.subtitleUr || previewPdfModal.subtitleEn || previewPdfModal.subtitle || "",
                  })}
                </div>
                {previewPdfModal.keyConcepts && Array.isArray(previewPdfModal.keyConcepts) && previewPdfModal.keyConcepts.length > 0 && (
                  <div className="space-y-2">
                    {previewPdfModal.keyConcepts.map((c: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <span dir="ltr" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-100 font-mono text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-400">
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
                  <span>{selectText({ en: "Download Full PDF Guide", bn: "সম্পূর্ণ PDF গাইড ডাউনলোড করুন", ur: "مکمل PDF گائیڈ ڈاؤن لوڈ کریں" })}</span>
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
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className={`relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${
              isUr ? "font-urdu" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-extrabold">{selectText({ en: "Log Trade Setup", bn: "নতুন ট্রেড জার্নাল এন্ট্রি", ur: "نیا ٹریڈ لاগ درج کریں" })}</h3>
              <button
                onClick={() => setShowNewJournalModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
                aria-label={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!journalTitle.trim() || !journalContent.trim()) return;
                if (subUsage?.plan === "unclaimed") {
                  setIsQuickJournalClaimModalOpen(true);
                  return;
                }
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {selectText({ en: "Trading Pair", bn: "ট্রেডিং পেয়ার", ur: "ٹریڈنگ پیئر" })}
                  </label>
                  <select
                    value={journalPair}
                    onChange={(e) => setJournalPair(e.target.value)}
                    dir="ltr"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {selectText({ en: "Direction & Setup", bn: "ডিরেকশন ও সেটআপ", ur: "سمت اور سیٹ اپ" })}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={selectText({ en: "e.g. Long 1:3.5 RR", bn: "যেমন: Long 1:3.5 RR", ur: "مثلاً: Long 1:3.5 RR" })}
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {selectText({ en: "Strategy Model", bn: "স্ট্র্যাটেজি মডেল", ur: "اسٹریٹجی ماڈل" })}
                  </label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {selectText({ en: "Outcome", bn: "ফলাফল", ur: "نتیجہ" })}
                  </label>
                  <select
                    value={journalResult}
                    onChange={(e) => setJournalResult(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Win">{selectText({ en: "Win 🏆", bn: "Win (লাভ 🏆)", ur: "Win (جیت 🏆)" })}</option>
                    <option value="Loss">{selectText({ en: "Loss 🛑", bn: "Loss (লস 🛑)", ur: "Loss (نقصان 🛑)" })}</option>
                    <option value="Breakeven">{selectText({ en: "Breakeven ⚪", bn: "Breakeven (সমান ⚪)", ur: "Breakeven (برابر ⚪)" })}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {selectText({ en: "Trade Logic, Discipline & Reflection", bn: "ট্রেড লজিক, ডিসিপ্লিন ও প্রতিফলন", ur: "ٹریڈ لاجک، نظم و ضبط اور مشاہدہ" })}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={selectText({
                    en: "Why did you take this trade? Did you stick to your 1% risk rule? Any emotional hesitation?",
                    bn: "ট্রেডটি কেন নিয়েছিলেন? ১% রিস্ক রুল মেনেছেন তো? কোনো মানসিক দ্বিধা কাজ করেছে কি না লিখুন...",
                    ur: "آپ نے یہ ٹریڈ کیوں لی؟ کیا آپ نے ۱٪ رسک کے اصول کی پیروی کی؟ کوئی جذباتی ہچکچاہٹ تھی؟",
                  })}
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <Button type="submit" disabled={createJournalMutation.isPending} className="w-full bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                {createJournalMutation.isPending
                  ? selectText({ en: "Saving...", bn: "সংরক্ষণ করা হচ্ছে...", ur: "محفوظ ہو رہا ہے..." })
                  : selectText({ en: "Save to Journal", bn: "জার্নালে সংরক্ষণ করুন", ur: "جرنل میں محفوظ کریں" })}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE INVOICE / RECEIPT MODAL */}
      {/* ========================================================================= */}
      <DashboardReceiptModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* ========================================================================= */}
      {/* OPEN SUPPORT TICKET MODAL */}
      {/* ========================================================================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowNewTicketModal(false)}>
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className={`relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${
              isUr ? "font-urdu" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-extrabold">{selectText({ en: "Open Support Ticket", bn: "নতুন সাপোর্ট টিকিট", ur: "نیا سپورٹ ٹکٹ کھولیں" })}</h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
                aria-label={selectText({ en: "Close", bn: "বন্ধ করুন", ur: "بند کریں" })}
              >
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {selectText({ en: "Category", bn: "ক্যাটাগরি", ur: "زمرہ" })}
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="Payment Verification">{selectText({ en: "Payment Verification", bn: "পেমেন্ট ভেরিফিকেশন", ur: "ادائیگی کی تصدیق" })}</option>
                  <option value="Resource / eBook Access">{selectText({ en: "Resource / eBook Access", bn: "রিসোর্স / ইবুক অ্যাক্সেস", ur: "وسائل / ای بک تک رسائی" })}</option>
                  <option value="Roadmap Clarification">{selectText({ en: "Roadmap Clarification", bn: "রোডম্যাপ সম্পর্কিত প্রশ্ন", ur: "روڈ میپ کی وضاحت" })}</option>
                  <option value="Technical Issue">{selectText({ en: "Technical Issue", bn: "কারিগরি সমস্যা", ur: "تکنیکی مسئلہ" })}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {selectText({ en: "Subject", bn: "বিষয়", ur: "موضوع" })}
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectText({ en: "e.g. Need assistance with eBook download", bn: "যেমন: পেমেন্ট ভেরিফিকেশন সহায়তা", ur: "مثلاً: ای بک ڈاؤن لوڈ میں مدد درکار ہے" })}
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {selectText({ en: "Message", bn: "বিস্তারিত বিবরণ", ur: "پیغام" })}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={selectText({ en: "Describe your inquiry or issue in detail...", bn: "আপনার সমস্যার বিস্তারিত লিখুন...", ur: "اپنے مسئلے کی تفصیل درج کریں..." })}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <Button type="submit" disabled={createTicketMutation.isPending} className="w-full bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                {createTicketMutation.isPending
                  ? selectText({ en: "Submitting...", bn: "জমা হচ্ছে...", ur: "جمع ہو رہا ہے..." })
                  : selectText({ en: "Submit Ticket", bn: "টিকিট জমা দিন", ur: "ٹکٹ جمع کروائیں" })}
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
          lang={language}
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

      {/* Shared Claim Free Plan Modal for Quick Journal Entry */}
      <ClaimFreePlanModal
        isOpen={isQuickJournalClaimModalOpen}
        onClose={() => setIsQuickJournalClaimModalOpen(false)}
        source="journal"
        onClaimSuccess={() => {
          if (journalTitle.trim() && journalContent.trim()) {
            createJournalMutation.mutate({
              title: `${journalPair} ${journalTitle.trim()}`,
              content: journalContent.trim(),
              setup: `${journalSetup} (${journalSession}) · RR: ${journalRR}`,
              result: journalResult,
            });
          }
        }}
      />
    </div>
  );
}
