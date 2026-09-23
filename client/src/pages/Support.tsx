import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Ticket,
  Search,
  Plus,
  Send,
  Paperclip,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Minus,
  Copy,
  X,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  User as UserIcon,
  HelpCircle,
  LifeBuoy,
  Sparkles,
  Sun,
  Moon,
  ExternalLink,
  Lock,
  Bell,
  RotateCcw,
  CheckCheck,
  Filter,
  ArrowUpDown,
  UserCheck,
  TrendingUp,
  Activity,
  Archive,
  BarChart3,
  Mail,
  Calendar,
  Layers,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { TopNavLinks } from "@/components/TopNavLinks";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { uploadImage } from "@/lib/mediaUpload";

export type TicketCategory =
  | "Course Problem"
  | "Payment Problem"
  | "Account Problem"
  | "Technical Problem"
  | "eBook Problem"
  | "Other";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketStatus =
  | "open"
  | "pending"
  | "in_progress"
  | "waiting_customer"
  | "waiting_user"
  | "solved"
  | "resolved"
  | "closed";

const CATEGORIES: { value: TicketCategory; labelEn: string; labelBn: string }[] = [
  { value: "Course Problem", labelEn: "Course Problem", labelBn: "কোর্স সংক্রান্ত সমস্যা" },
  { value: "Payment Problem", labelEn: "Payment Problem", labelBn: "পেমেন্ট সংক্রান্ত সমস্যা" },
  { value: "Account Problem", labelEn: "Account Problem", labelBn: "অ্যাকাউন্ট সমস্যা" },
  { value: "Technical Problem", labelEn: "Technical Problem", labelBn: "টেকনিক্যাল সমস্যা" },
  { value: "eBook Problem", labelEn: "eBook Problem", labelBn: "ই-বুক সংক্রান্ত সমস্যা" },
  { value: "Other", labelEn: "Other", labelBn: "অন্যান্য" },
];

const PRIORITIES: { value: TicketPriority; labelEn: string; labelBn: string; color: string; bg: string; border: string; desc: string }[] = [
  {
    value: "low",
    labelEn: "Low",
    labelBn: "সাধারণ",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    desc: "General inquiry or non-blocking question",
  },
  {
    value: "medium",
    labelEn: "Medium",
    labelBn: "মাঝারি",
    color: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800",
    desc: "Standard issue requiring timely assistance",
  },
  {
    value: "high",
    labelEn: "High",
    labelBn: "উচ্চ",
    color: "text-amber-800 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    desc: "Critical access or course blockage",
  },
  {
    value: "urgent",
    labelEn: "Urgent",
    labelBn: "জরুরি",
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    desc: "Immediate attention required",
  },
];

// Normalize legacy statuses
function normalizeStatus(st?: string): "open" | "pending" | "in_progress" | "waiting_customer" | "solved" | "closed" {
  if (!st) return "open";
  const s = st.toLowerCase().trim();
  if (s === "waiting_user") return "waiting_customer";
  if (s === "resolved") return "solved";
  if (["open", "pending", "in_progress", "waiting_customer", "solved", "closed"].includes(s)) {
    return s as any;
  }
  return "open";
}

function normalizePriority(p?: string): TicketPriority {
  if (!p) return "medium";
  const s = p.toLowerCase().trim();
  if (["low", "medium", "high", "urgent"].includes(s)) return s as any;
  return "medium";
}

export default function Support() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  // Language state
  const [lang, setLang] = useState<"en" | "bn">("bn");
  const isBn = lang === "bn";

  // Admin / Support Staff check
  const isAdmin = !!(user && (user.role === "admin" || user.role === "support"));

  // Active Tab: "my_tickets" | "create" | "track" | "admin_desk"
  const [activeTab, setActiveTab] = useState<"my_tickets" | "create" | "track" | "admin_desk">(
    isAdmin ? "admin_desk" : "my_tickets"
  );

  // Notification Bell Popover State
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Create Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCategory, setFormCategory] = useState<TicketCategory>("Course Problem");
  const [formPriority, setFormPriority] = useState<TicketPriority>("medium");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [attachmentBase64, setAttachmentBase64] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentSize, setAttachmentSize] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Track Form State
  const [trackCode, setTrackCode] = useState("");
  const [trackEmail, setTrackEmail] = useState("");
  const [trackedData, setTrackedData] = useState<{ ticket: any; replies: any[]; internalNotes?: any[] } | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Active Selected Ticket for Conversation View (Persisted in sessionStorage & URL)
  const [selectedTicketId, setSelectedTicketIdState] = useState<number | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qId = params.get("ticketId");
      if (qId && !isNaN(Number(qId))) return Number(qId);
      const stored = sessionStorage.getItem("active_support_ticket_id");
      if (stored && !isNaN(Number(stored))) return Number(stored);
    } catch {}
    return null;
  });

  const setSelectedTicketId = (id: number | null) => {
    setSelectedTicketIdState(id);
    try {
      const url = new URL(window.location.href);
      if (id !== null) {
        sessionStorage.setItem("active_support_ticket_id", String(id));
        url.searchParams.set("ticketId", String(id));
      } else {
        sessionStorage.removeItem("active_support_ticket_id");
        url.searchParams.delete("ticketId");
      }
      window.history.replaceState({}, "", url.toString());
    } catch {}
  };

  // Close / Reopen Dialog State
  const [statusDialogState, setStatusDialogState] = useState<{
    isOpen: boolean;
    ticketId: number;
    action: "close" | "reopen";
    reason: string;
  } | null>(null);

  // Customer Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"updated" | "newest" | "oldest" | "priority">("updated");

  // Admin Filter & Sort State
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>("all");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>("all");
  const [adminPriorityFilter, setAdminPriorityFilter] = useState<string>("all");
  const [adminSearchFilter, setAdminSearchFilter] = useState<string>("");
  const [adminSortOrder, setAdminSortOrder] = useState<"updated" | "newest" | "oldest" | "priority">("updated");
  const [showAdminMetrics, setShowAdminMetrics] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Autofill user info if logged in
  useEffect(() => {
    if (user) {
      if (!formName && user.name) setFormName(user.name);
      if (!formEmail && user.email) setFormEmail(user.email);
      if (!trackEmail && user.email) setTrackEmail(user.email);
    }
  }, [user]);

  // Click outside to close notification popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trpcUtils = trpc.useUtils();

  // Queries
  const {
    data: myTicketsList,
    refetch: refetchMyTickets,
    isLoading: isLoadingMyTickets,
  } = trpc.support.myTickets.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: selectedTicketId ? 3000 : 10000,
  });

  const {
    data: activeTicketData,
    refetch: refetchActiveTicket,
    isLoading: isLoadingActiveTicket,
  } = trpc.support.getTicket.useQuery(
    { ticketId: selectedTicketId as number, email: user?.email || undefined },
    {
      enabled: !!selectedTicketId,
      refetchInterval: 2500,
    }
  );

  // Admin Tickets Query & Metrics
  const {
    data: adminTicketsList,
    refetch: refetchAdminTickets,
    isLoading: isLoadingAdminTickets,
  } = trpc.admin.tickets.useQuery(
    {
      status: adminStatusFilter !== "all" ? adminStatusFilter : undefined,
      category: adminCategoryFilter !== "all" ? adminCategoryFilter : undefined,
      priority: adminPriorityFilter !== "all" ? adminPriorityFilter : undefined,
      search: adminSearchFilter || undefined,
      sort: adminSortOrder,
    },
    {
      enabled: !!isAdmin,
      refetchInterval: selectedTicketId ? 4000 : 12000,
    }
  );

  const { data: adminMetricsData, refetch: refetchMetrics } = trpc.admin.supportMetrics.useQuery(undefined, {
    enabled: !!isAdmin,
    refetchInterval: 20000,
  });

  const { data: adminUsersList } = trpc.admin.users.useQuery(undefined, {
    enabled: !!isAdmin,
  });

  // Notifications Query
  const { data: notificationsList, refetch: refetchNotifications } = trpc.support.notifications.useQuery(
    undefined,
    {
      refetchInterval: 8000,
    }
  );

  const markNotifReadMutation = trpc.support.markNotificationRead.useMutation({
    onSuccess: () => refetchNotifications(),
  });

  const unreadNotifsCount = (notificationsList || []).filter((n: any) => !n.isRead).length;

  // Mutations
  const createMutation = trpc.support.createTicket.useMutation({
    onSuccess: (data) => {
      setSubmittedTicket(data.ticket);
      setFormSubject("");
      setFormMessage("");
      setAttachmentBase64(null);
      setAttachmentName(null);
      setAttachmentSize(null);
      if (user) {
        refetchMyTickets();
        trpcUtils.support.myTickets.invalidate();
      }
      toast.success(
        isBn
          ? `টিকেট তৈরি হয়েছে! টিকেট আইডি: ${data.ticket.ticketCode}`
          : `Ticket created successfully! Ticket ID: ${data.ticket.ticketCode}`
      );
    },
    onError: (err) => {
      toast.error(err.message || (isBn ? "টিকেট তৈরিতে সমস্যা হয়েছে" : "Failed to create ticket"));
    },
  });

  const replyMutation = trpc.support.reply.useMutation({
    onSuccess: (res) => {
      toast.success(isBn ? "উত্তর সফলভাবে পাঠানো হয়েছে" : "Reply sent successfully");
      if (selectedTicketId) {
        trpcUtils.support.getTicket.setData(
          { ticketId: selectedTicketId, email: user?.email || undefined },
          (prev: any) => {
            if (!prev) return prev;
            const exists = prev.replies?.some((r: any) => r.id === res.reply.id);
            return {
              ...prev,
              ticket: { ...prev.ticket, status: "open", updatedAt: new Date() },
              replies: exists ? prev.replies : [...(prev.replies || []), res.reply],
            };
          }
        );
        refetchActiveTicket();
        refetchMyTickets();
        trpcUtils.support.getTicket.invalidate({ ticketId: selectedTicketId });
        trpcUtils.support.myTickets.invalidate();
      }
      if (trackedData) {
        setTrackedData((prev) => {
          if (!prev) return null;
          const exists = prev.replies?.some((r: any) => r.id === res.reply.id);
          return {
            ...prev,
            ticket: { ...prev.ticket, status: "open", updatedAt: new Date() },
            replies: exists ? prev.replies : [...(prev.replies || []), res.reply],
          };
        });
      }
    },
    onError: (err) => {
      toast.error(err.message || (isBn ? "উত্তর পাঠাতে সমস্যা হয়েছে" : "Failed to send reply"));
    },
  });

  const adminReplyMutation = trpc.admin.replyTicket.useMutation({
    onSuccess: (res: any) => {
      toast.success(isBn ? "অফিসিয়াল উত্তর পাঠানো হয়েছে!" : "Support reply dispatched!");
      if (selectedTicketId) {
        if (res?.reply) {
          trpcUtils.support.getTicket.setData(
            { ticketId: selectedTicketId, email: user?.email || undefined },
            (prev: any) => {
              if (!prev) return prev;
              const exists = prev.replies?.some((r: any) => r.id === res.reply.id);
              return {
                ...prev,
                ticket: { ...prev.ticket, status: "waiting_customer", updatedAt: new Date() },
                replies: exists ? prev.replies : [...(prev.replies || []), res.reply],
              };
            }
          );
        }
        refetchActiveTicket();
        refetchAdminTickets();
        trpcUtils.support.getTicket.invalidate({ ticketId: selectedTicketId });
        trpcUtils.admin.tickets.invalidate();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send reply");
    },
  });

  const adminUpdateStatusMutation = trpc.admin.updateTicketStatus.useMutation({
    onSuccess: () => {
      toast.success(isBn ? "স্ট্যাটাস আপডেট হয়েছে" : "Ticket status updated");
      if (selectedTicketId) {
        refetchActiveTicket();
        refetchAdminTickets();
        trpcUtils.support.getTicket.invalidate({ ticketId: selectedTicketId });
        trpcUtils.admin.tickets.invalidate();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const adminUpdatePriorityMutation = trpc.admin.updatePriority.useMutation({
    onSuccess: () => {
      toast.success(isBn ? "অগ্রাধিকার (Priority) আপডেট হয়েছে" : "Priority updated successfully");
      if (selectedTicketId) {
        refetchActiveTicket();
        refetchAdminTickets();
        trpcUtils.support.getTicket.invalidate({ ticketId: selectedTicketId });
        trpcUtils.admin.tickets.invalidate();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update priority");
    },
  });

  const adminAssignTicketMutation = trpc.admin.assignTicket.useMutation({
    onSuccess: () => {
      toast.success(isBn ? "সাপোর্ট এজেন্ট নিয়োগ দেওয়া হয়েছে" : "Ticket assigned successfully");
      if (selectedTicketId) {
        refetchActiveTicket();
        refetchAdminTickets();
        trpcUtils.support.getTicket.invalidate({ ticketId: selectedTicketId });
        trpcUtils.admin.tickets.invalidate();
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to assign ticket");
    },
  });

  const adminAddInternalNoteMutation = trpc.admin.addInternalNote.useMutation({
    onSuccess: () => {
      toast.success(isBn ? "অভ্যন্তরীণ নোট সংরক্ষিত হয়েছে" : "Private internal note saved");
      if (selectedTicketId) {
        refetchActiveTicket();
        trpcUtils.support.getTicket.invalidate({ ticketId: selectedTicketId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add internal note");
    },
  });

  const closeTicketMutation = trpc.support.closeTicket.useMutation({
    onSuccess: () => {
      toast.success(isBn ? "টিকেট সফলভাবে বন্ধ করা হয়েছে" : "Ticket closed successfully");
      setStatusDialogState(null);
      if (selectedTicketId) {
        refetchActiveTicket();
        refetchMyTickets();
        if (isAdmin) refetchAdminTickets();
        trpcUtils.support.getTicket.invalidate({ ticketId: selectedTicketId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to close ticket");
    },
  });

  const reopenTicketMutation = trpc.support.reopenTicket.useMutation({
    onSuccess: () => {
      toast.success(isBn ? "টিকেট পুনরায় সক্রিয় করা হয়েছে" : "Ticket reopened successfully");
      setStatusDialogState(null);
      if (selectedTicketId) {
        refetchActiveTicket();
        refetchMyTickets();
        if (isAdmin) refetchAdminTickets();
        trpcUtils.support.getTicket.invalidate({ ticketId: selectedTicketId });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to reopen ticket");
    },
  });

  // Track ticket handler
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    if (!trackCode.trim() || !trackEmail.trim()) {
      setTrackError(isBn ? "অনুগ্রহ করে টিকেট আইডি ও ইমেইল পূরণ করুন" : "Please enter Ticket ID and email");
      return;
    }

    setIsTracking(true);
    try {
      const cleanCode = trackCode.trim();
      const cleanEmail = trackEmail.trim();
      const result = await trpcUtils.support.trackTicket.fetch({
        ticketCode: cleanCode,
        email: cleanEmail,
      });

      if (!result || !result.ticket) {
        throw new Error(
          isBn
            ? "কোনো টিকেট পাওয়া যায়নি অথবা ইমেইল মিলছে না।"
            : "No ticket found with this Ticket ID and Email address."
        );
      }
      try {
        sessionStorage.setItem("tracked_ticket_code", cleanCode);
        sessionStorage.setItem("tracked_ticket_email", cleanEmail);
      } catch {}
      setTrackedData(result);
    } catch (err: any) {
      setTrackError(
        err.message ||
          (isBn
            ? "কোনো টিকেট পাওয়া যায়নি অথবা ইমেইল মিলছে না।"
            : "No ticket found with this Ticket ID and Email address.")
      );
    } finally {
      setIsTracking(false);
    }
  };

  // Auto-restore tracked ticket from sessionStorage on mount
  useEffect(() => {
    try {
      const storedCode = sessionStorage.getItem("tracked_ticket_code");
      const storedEmail = sessionStorage.getItem("tracked_ticket_email");
      if (storedCode && storedEmail && !trackedData) {
        setTrackCode(storedCode);
        setTrackEmail(storedEmail);
        trpcUtils.support.trackTicket
          .fetch({ ticketCode: storedCode, email: storedEmail })
          .then((res) => {
            if (res?.ticket) setTrackedData(res);
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  // Poll tracked ticket when track tab has a ticket open
  useEffect(() => {
    if (activeTab !== "track" || !trackedData?.ticket?.ticketCode) return;
    const interval = setInterval(async () => {
      try {
        const code = trackedData.ticket.ticketCode;
        const email = trackEmail || trackedData.ticket.userEmail;
        if (!code || !email) return;
        const res = await trpcUtils.support.trackTicket.fetch({ ticketCode: code, email });
        if (res?.ticket) {
          setTrackedData((prev) => {
            if (!prev) return res;
            if (
              prev.replies?.length !== res.replies?.length ||
              prev.ticket?.status !== res.ticket?.status
            ) {
              return res;
            }
            return prev;
          });
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, trackedData?.ticket?.ticketCode, trackEmail]);

  // Copy Ticket ID
  const copyTicketId = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(isBn ? "টিকেট আইডি কপি করা হয়েছে!" : "Ticket ID copied!");
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Status Badge Helper
  const renderStatusBadge = (rawStatus: string) => {
    const status = normalizeStatus(rawStatus);
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <span className="size-1.5 rounded-full bg-sky-500 animate-pulse" />
            {isBn ? "খোলা (Open)" : "Open"}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock size={12} className="text-amber-600 dark:text-amber-400" />
            {isBn ? "অপেক্ষমান (Pending)" : "Pending"}
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            <Activity size={12} className="text-indigo-600 dark:text-indigo-400" />
            {isBn ? "চলমান (In Progress)" : "In Progress"}
          </span>
        );
      case "waiting_customer":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            <Clock size={12} className="text-orange-600 dark:text-orange-400" />
            {isBn ? "গ্রাহকের উত্তরের অপেক্ষায়" : "Waiting for Customer"}
          </span>
        );
      case "solved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
            {isBn ? "সমাধান হয়েছে (Solved)" : "Solved"}
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <Archive size={12} />
            {isBn ? "বন্ধ (Closed)" : "Closed"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {rawStatus}
          </span>
        );
    }
  };

  // Priority Badge Helper with dedicated Icons
  const renderPriorityBadge = (rawPriority?: string) => {
    const priority = normalizePriority(rawPriority);
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <Flame size={12} className="text-rose-600 dark:text-rose-400 shrink-0" />
            {isBn ? "জরুরি (Urgent)" : "Urgent"}
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <ArrowUp size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
            {isBn ? "উচ্চ (High)" : "High"}
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <Minus size={12} className="text-sky-600 dark:text-sky-400 shrink-0" />
            {isBn ? "মাঝারি (Medium)" : "Medium"}
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <ArrowDown size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            {isBn ? "সাধারণ (Low)" : "Low"}
          </span>
        );
    }
  };

  // Filtered Customer Tickets
  const filteredMyTickets = useMemo(() => {
    let list = [...(myTicketsList || [])];
    if (statusFilter !== "all") {
      list = list.filter((t: any) => normalizeStatus(t.status) === normalizeStatus(statusFilter));
    }
    if (priorityFilter !== "all") {
      list = list.filter((t: any) => normalizePriority(t.priority) === normalizePriority(priorityFilter));
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (t: any) =>
          t.ticketCode?.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.message?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [myTicketsList, statusFilter, priorityFilter, searchFilter]);

  const activeCustomerTicketsCount = (myTicketsList || []).filter(
    (t: any) => normalizeStatus(t.status) !== "closed" && normalizeStatus(t.status) !== "solved"
  ).length;

  const adminOpenCount = (adminTicketsList || []).filter(
    (t: any) => normalizeStatus(t.status) === "open" || normalizeStatus(t.status) === "pending" || normalizeStatus(t.status) === "in_progress"
  ).length;

  // Selected Ticket CRM Details for Admin
  const selectedTicketCustomer = useMemo(() => {
    if (!isAdmin || !selectedTicketId) return null;
    const ticket = activeTicketData?.ticket;
    if (!ticket) return null;
    const foundUser = (adminUsersList || []).find(
      (u: any) => (ticket.userId && u.id === ticket.userId) || (ticket.userEmail && u.email?.toLowerCase() === ticket.userEmail.toLowerCase())
    );
    return foundUser || null;
  }, [isAdmin, selectedTicketId, activeTicketData, adminUsersList]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors duration-300 dark:bg-[#070e1b] dark:text-slate-100 flex flex-col">
      {/* ========================================================================= */}
      {/* HEADER / NAVIGATION */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-[#070e1b]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{isBn ? "হোমে ফিরুন" : "Back to Home"}</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <Link href="/" className="flex items-center gap-2.5">
              <BrandLogo size={36} className="shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-black tracking-[0.18em] text-[#0a192f] dark:text-white">
                  CYCLE OF CHART
                </span>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                  SUPPORT DESK
                </span>
              </div>
            </Link>
          </div>

          <TopNavLinks isBn={isBn} />

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-Time Notification Bell Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex size-8 sm:size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Support Notifications"
              >
                <Bell size={16} />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-pulse">
                    {unreadNotifsCount > 9 ? "9+" : unreadNotifsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Bell size={13} className="text-sky-500" />
                      {isBn ? "সাপোর্ট নোটিফিকেশন" : "Support Notifications"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {unreadNotifsCount} {isBn ? "নতুন" : "unread"}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {(!notificationsList || notificationsList.length === 0) ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        {isBn ? "কোনো নোটিফিকেশন নেই" : "No recent notifications"}
                      </div>
                    ) : (
                      notificationsList.map((notif: any) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.isRead) markNotifReadMutation.mutate({ id: notif.id });
                            if (notif.ticketId) {
                              setSelectedTicketId(notif.ticketId);
                              setActiveTab(isAdmin ? "admin_desk" : "my_tickets");
                              setShowNotifications(false);
                            }
                          }}
                          className={`cursor-pointer rounded-xl p-2.5 text-xs transition border ${
                            notif.isRead
                              ? "border-transparent bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                              : "border-sky-200 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/40 text-slate-900 dark:text-white font-medium"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-sky-600 dark:text-sky-400 truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] line-clamp-2 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-yellow-400 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language Switcher */}
            <div className="flex rounded-full border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <button
                onClick={() => setLang("en")}
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                  lang === "en"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("bn")}
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                  lang === "bn"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                বাং
              </button>
            </div>

            {/* User status */}
            {user ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="h-8 sm:h-9 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold text-xs"
                >
                  {isBn ? "ড্যাশবোর্ড" : "Dashboard"}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 sm:h-9 border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 font-semibold text-xs"
                >
                  {isBn ? "লগইন" : "Sign In"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO / PLATFORM BANNER */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-sky-50/30 to-slate-50 pt-8 pb-6 sm:pt-10 sm:pb-8 dark:border-slate-800/80 dark:from-[#081326] dark:via-[#09152b] dark:to-[#070e1b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/80 bg-sky-100/70 px-3.5 py-1 text-xs font-extrabold text-[#0369a1] dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 mb-3">
            <LifeBuoy size={14} />
            <span>{isBn ? "২৪/৭ অফিশিয়াল সাপোর্ট টিকেট সিস্টেম" : "Official Support Ticket Platform"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {isBn ? "গ্রাহক সেবা ও সহায়তা ডেস্ক" : "Customer Support & Resolution Center"}
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isBn
              ? "কোর্স এক্সেস, পেমেন্ট ভেরিফিকেশন, টেকনিক্যাল সমস্যা বা অ্যাকাউন্টের দ্রুত ও স্থায়ী সমাধানের জন্য সরাসরি সাপোর্ট টিমের সাথে সংযুক্ত হোন।"
              : "Get fast and reliable resolutions from our dedicated team. Track inquiries in real-time, share attachments, and manage support tickets effortlessly."}
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles size={14} className="text-sky-500" />
              <span>{isBn ? "দ্রুত প্রথম উত্তর (< ১৫ মি.)" : "Fast First Reply (< 15 min)"}</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>{isBn ? "অফিসিয়াল টিকেট ট্র্যাকিং" : "Official Ticket Tracking"}</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 size={14} className="text-sky-500" />
              <span>{isBn ? "প্রোঅ্যাকটিভ রেজোলিউশন" : "End-to-End Resolution"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Navigation Tabs */}
        <div
          className={`flex flex-wrap sm:flex-nowrap rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
            isAdmin ? "max-w-3xl" : "max-w-xl"
          } mx-auto mb-6 gap-1.5`}
        >
          <button
            onClick={() => {
              setActiveTab("my_tickets");
              setSelectedTicketId(null);
              setTrackedData(null);
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-extrabold transition-all duration-200 relative ${
              activeTab === "my_tickets"
                ? "bg-[#081833] text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Ticket size={15} />
            <span>{isBn ? "আমার টিকেট" : "My Tickets"}</span>
            {user && (myTicketsList?.length || 0) > 0 && (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-black text-white dark:bg-[#081833]">
                {activeCustomerTicketsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("create");
              setSelectedTicketId(null);
              setTrackedData(null);
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              activeTab === "create"
                ? "bg-[#081833] text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Plus size={15} />
            <span>{isBn ? "নতুন টিকেট" : "New Ticket"}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("track");
              setSelectedTicketId(null);
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              activeTab === "track"
                ? "bg-[#081833] text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Search size={15} />
            <span>{isBn ? "ট্র্যাক করুন" : "Track"}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab("admin_desk");
                setSelectedTicketId(null);
                setTrackedData(null);
              }}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs sm:text-sm font-extrabold transition-all duration-200 relative ${
                activeTab === "admin_desk"
                  ? "bg-sky-500 text-slate-950 shadow-sm font-black ring-2 ring-sky-400/40"
                  : "bg-sky-50 text-sky-800 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/70"
              }`}
            >
              <ShieldCheck size={16} className={activeTab === "admin_desk" ? "text-slate-950" : "text-sky-500"} />
              <span>{isBn ? "স্টাফ ডেস্ক" : "Staff Desk"}</span>
              {adminOpenCount > 0 && (
                <span
                  className={`ml-1 flex size-5 items-center justify-center rounded-full text-[10px] font-black ${
                    activeTab === "admin_desk" ? "bg-slate-950 text-white" : "bg-sky-500 text-white"
                  }`}
                >
                  {adminOpenCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: MY TICKETS (CUSTOMER VIEW) */}
        {/* ========================================================================= */}
        {activeTab === "my_tickets" && (
          <div className="animate-in fade-in duration-200">
            {selectedTicketId ? (
              /* Selected Ticket Full Chat Thread */
              <div className="mx-auto max-w-4xl">
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft size={16} />
                  <span>{isBn ? "সকল টিকেটে ফিরে যান" : "Back to All Tickets"}</span>
                </button>

                {isLoadingActiveTicket ? (
                  <div className="flex items-center justify-center p-16 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mr-2" />
                    <span>{isBn ? "টিকেট লোড হচ্ছে..." : "Loading conversation..."}</span>
                  </div>
                ) : activeTicketData?.ticket ? (
                  <TicketConversationThread
                    ticket={activeTicketData.ticket}
                    replies={activeTicketData.replies}
                    internalNotes={activeTicketData.internalNotes || []}
                    isBn={isBn}
                    isAdmin={false}
                    onReply={(msg, att) => {
                      replyMutation.mutate({
                        ticketId: activeTicketData.ticket.id,
                        message: msg,
                        attachmentUrl: att,
                        senderName: user?.name || activeTicketData.ticket.userName || "Customer",
                        senderEmail: user?.email || activeTicketData.ticket.userEmail || "",
                      });
                    }}
                    isReplying={replyMutation.isPending}
                    onOpenCloseModal={(tId) =>
                      setStatusDialogState({ isOpen: true, ticketId: tId, action: "close", reason: "" })
                    }
                    onOpenReopenModal={(tId) =>
                      setStatusDialogState({ isOpen: true, ticketId: tId, action: "reopen", reason: "" })
                    }
                  />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                    {isBn ? "টিকেট লোড করা যায়নি।" : "Ticket could not be loaded."}
                  </div>
                )}
              </div>
            ) : !user ? (
              /* Not Signed In Card */
              <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 mb-4">
                  <UserIcon size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isBn ? "লগইন প্রয়োজন" : "Sign In Required"}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isBn
                    ? "আপনার পূর্বে জমা দেওয়া সমস্ত টিকেট এবং উত্তর দেখতে অ্যাকাউন্টে লগইন করুন। অথবা 'টিকেট ট্র্যাক করুন' ট্যাবে আপনার টিকেট আইডি দিয়ে সার্চ করুন।"
                    : "Sign in to view all your support tickets, responses, and real-time updates. Alternatively, track an individual ticket using its Ticket ID."}
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <Link href="/login">
                    <Button className="w-full bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold text-xs">
                      {isBn ? "লগইন করুন" : "Sign In Now"}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("track")}
                    className="w-full border-slate-200 text-xs font-bold dark:border-slate-800"
                  >
                    {isBn ? "টিকেট কোড দিয়ে ট্র্যাক করুন" : "Track with Ticket ID"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Customer Tickets Dashboard */
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { key: "all", labelEn: "All", labelBn: "সব" },
                      { key: "open", labelEn: "Open", labelBn: "খোলা" },
                      { key: "pending", labelEn: "Pending", labelBn: "পর্যালোচনা" },
                      { key: "in_progress", labelEn: "In Progress", labelBn: "চলমান" },
                      { key: "waiting_customer", labelEn: "Waiting Reply", labelBn: "উত্তর দিন" },
                      { key: "solved", labelEn: "Solved", labelBn: "সমাধান" },
                      { key: "closed", labelEn: "Closed", labelBn: "বন্ধ" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setStatusFilter(f.key)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          statusFilter === f.key
                            ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950 shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isBn ? f.labelBn : f.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Priority & Search */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="all">{isBn ? "সকল প্রায়োরিটি" : "All Priorities"}</option>
                      <option value="urgent">{isBn ? "জরুরি (Urgent)" : "Urgent"}</option>
                      <option value="high">{isBn ? "উচ্চ (High)" : "High"}</option>
                      <option value="medium">{isBn ? "মাঝারি (Medium)" : "Medium"}</option>
                      <option value="low">{isBn ? "সাধারণ (Low)" : "Low"}</option>
                    </select>

                    <div className="relative w-full sm:w-56">
                      <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder={isBn ? "সার্চ টিকেট আইডি, বিষয়..." : "Search #TKT, subject..."}
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setActiveTab("create")}
                      className="h-8 gap-1 bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold text-xs shrink-0"
                    >
                      <Plus size={14} />
                      <span>{isBn ? "নতুন টিকেট" : "New Ticket"}</span>
                    </Button>
                  </div>
                </div>

                {/* Ticket Cards Grid */}
                {isLoadingMyTickets ? (
                  <div className="flex items-center justify-center p-16 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mr-2" />
                    <span>{isBn ? "টিকেট লোড হচ্ছে..." : "Loading tickets..."}</span>
                  </div>
                ) : filteredMyTickets.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    <Ticket size={42} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      {isBn ? "কোনো টিকেট পাওয়া যায়নি" : "No Tickets Found"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                      {isBn
                        ? "আপনার কোনো সক্রিয় সহায়তা টিকেট নেই। কোনো প্রশ্ন বা সমস্যা থাকলে নতুন টিকেট খুলুন।"
                        : "You have no support tickets matching this filter. Submit a new ticket if you need assistance."}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("create")}
                      className="mt-4 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold text-xs"
                    >
                      <Plus size={14} className="mr-1" />
                      <span>{isBn ? "নতুন টিকেট তৈরি করুন" : "Create New Ticket"}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredMyTickets.map((t: any) => {
                      const isWaitingCustomer = normalizeStatus(t.status) === "waiting_customer";
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicketId(t.id)}
                          className={`group cursor-pointer rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                            isWaitingCustomer
                              ? "border-orange-300 bg-gradient-to-r from-orange-50/50 via-white to-white dark:border-orange-800 dark:from-orange-950/20 dark:to-slate-900"
                              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-600"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                                  {t.ticketCode || `#TKT-${t.id}`}
                                </span>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {t.category}
                                </span>
                                {renderPriorityBadge(t.priority)}
                                {renderStatusBadge(t.status)}
                                {isWaitingCustomer && (
                                  <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-700 dark:bg-orange-950 dark:text-orange-300 animate-pulse">
                                    <Clock size={10} />
                                    {isBn ? "আপনার উত্তর প্রয়োজন" : "Reply Needed"}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition dark:text-white dark:group-hover:text-sky-400">
                                {t.subject}
                              </h4>

                              <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t.message}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                                <span>
                                  {isBn ? "তৈরি: " : "Created: "}
                                  {new Date(t.createdAt).toLocaleDateString()}{" "}
                                  {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <span>•</span>
                                <span>
                                  {isBn ? "সর্বশেষ আপডেট: " : "Updated: "}
                                  {new Date(t.updatedAt || t.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {t.assignedStaff && (
                                  <>
                                    <span>•</span>
                                    <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                                      <ShieldCheck size={12} />
                                      {t.assignedStaff}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-700 group-hover:border-sky-500 group-hover:text-sky-600 transition"
                              >
                                <MessageSquare size={13} />
                                <span>{isBn ? "কথোপকথন দেখুন" : "Open Chat"}</span>
                                <ChevronRight size={13} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CREATE TICKET FORM */}
        {/* ========================================================================= */}
        {activeTab === "create" && (
          <div className="mx-auto max-w-2xl animate-in fade-in duration-200">
            {submittedTicket ? (
              /* Success Confirmation Card */
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 text-center shadow-lg dark:border-emerald-900/50 dark:bg-slate-900">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isBn ? "টিকেট সফলভাবে জমা হয়েছে!" : "Ticket Successfully Submitted!"}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {isBn
                    ? "আমাদের সাপোর্ট টিম আপনার টিকেট পর্যালোচনা করছে। নিচে আপনার ইউনিক টিকেট রেফারেন্স আইডি দেওয়া হলো:"
                    : "Our support specialist is reviewing your inquiry. Please keep your reference Ticket ID safe:"}
                </p>

                {/* Ticket ID Box */}
                <div className="mx-auto mt-5 flex max-w-sm items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      {isBn ? "টিকেট রেফারেন্স আইডি" : "Ticket Reference ID"}
                    </div>
                    <div className="text-lg font-black tracking-wide text-sky-600 dark:text-sky-400">
                      {submittedTicket.ticketCode}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyTicketId(submittedTicket.ticketCode)}
                    className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
                  >
                    {copiedCode === submittedTicket.ticketCode ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span>{isBn ? "কপি হয়েছে" : "Copied"}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>{isBn ? "কপি করুন" : "Copy"}</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? `সকল আপডেট ও নোটিফিকেশন যাবে: ${submittedTicket.userEmail}`
                    : `Status notifications will be emailed to: ${submittedTicket.userEmail}`}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => {
                      setSelectedTicketId(submittedTicket.id);
                      setActiveTab("my_tickets");
                      setSubmittedTicket(null);
                    }}
                    className="w-full sm:w-auto bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold text-xs"
                  >
                    <MessageSquare size={14} className="mr-1.5" />
                    <span>{isBn ? "লাইভ চ্যাটে প্রবেশ করুন" : "Open Live Ticket Chat"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setSubmittedTicket(null)}
                    className="w-full sm:w-auto border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    <Plus size={14} className="mr-1.5" />
                    <span>{isBn ? "আরেকটি টিকেট জমা দিন" : "Submit Another Ticket"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Create Form */
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {isBn ? "নতুন সাপোর্ট টিকেট খুলুন" : "Create New Support Ticket"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {isBn
                      ? "সঠিক তথ্য ও প্রায়োরিটি নির্বাচন করলে দ্রুত সমাধান নিশ্চিত করা যায়।"
                      : "Provide accurate details to ensure our support engineers can resolve your request quickly."}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!formName.trim() || !formEmail.trim() || !formSubject.trim() || !formMessage.trim()) {
                      toast.error(isBn ? "অনুগ্রহ করে সব আবশ্যক তথ্য পূরণ করুন" : "Please fill in all required fields");
                      return;
                    }
                    createMutation.mutate({
                      name: formName,
                      email: formEmail,
                      category: formCategory,
                      priority: formPriority,
                      subject: formSubject,
                      message: formMessage,
                      attachmentUrl: attachmentBase64 || undefined,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        {isBn ? "আপনার পুরো নাম" : "Your Full Name"} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isBn ? "উদা: তানভীর আহমেদ" : "e.g. Tanvir Ahmed"}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        {isBn ? "ইমেইল অ্যাড্রেস" : "Email Address"} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={isBn ? "উদা: student@example.com" : "e.g. student@example.com"}
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        {isBn ? "সমস্যার ক্যাটাগরি" : "Problem Category"} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {isBn ? c.labelBn : c.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        {isBn ? "অগ্রাধিকার (Priority)" : "Priority Level"} <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {PRIORITIES.map((p) => {
                          const isSelected = formPriority === p.value;
                          return (
                            <button
                              type="button"
                              key={p.value}
                              onClick={() => setFormPriority(p.value)}
                              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                                isSelected
                                  ? `${p.bg} ${p.border} ${p.color} ring-2 ring-sky-400 font-black`
                                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 font-semibold"
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                {p.value === "urgent" && <Flame size={12} />}
                                {p.value === "high" && <ArrowUp size={12} />}
                                {p.value === "medium" && <Minus size={12} />}
                                {p.value === "low" && <ArrowDown size={12} />}
                                <span className="text-[11px] capitalize">{isBn ? p.labelBn : p.labelEn}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "বিষয়ের শিরোনাম" : "Subject Summary"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        isBn
                          ? "উদা: বিকাশ ট্রানজ্যাকশন আইডি এখনও অনুমোদিত হয়নি"
                          : "e.g. Bkash transaction #8XK29... not verified yet"
                      }
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "বিস্তারিত বিবরণ" : "Detailed Explanation"} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder={
                        isBn
                          ? "সমস্যাটি বিস্তারিত লিখুন (কোর্সের নাম, ট্রানজ্যাকশন আইডি বা স্ক্রিনশটের বিবরণ দিন)..."
                          : "Describe your issue with context (e.g. order details, package name, error message)..."
                      }
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  {/* File Attachment */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "সংযুক্তি / স্ক্রিনশট (ছবি বা PDF)" : "Attachment / Screenshot (Optional)"}
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error(isBn ? "ফাইলের সাইজ সর্বোচ্চ ৫ MB হতে পারবে" : "File size must be under 5MB");
                          return;
                        }
                        const toastId = toast.loading(isBn ? "ফাইল আপলোড হচ্ছে..." : "Uploading file...");
                        try {
                          const cdnUrl = await uploadImage(file);
                          setAttachmentBase64(cdnUrl);
                          setAttachmentName(file.name);
                          setAttachmentSize(`${(file.size / 1024).toFixed(1)} KB`);
                          toast.success(isBn ? "ফাইল আপলোড সম্পন্ন!" : "File uploaded!", { id: toastId });
                        } catch (err: any) {
                          toast.error(isBn ? "আপলোড ব্যর্থ হয়েছে" : "Failed to upload file", { id: toastId });
                        } finally {
                          e.target.value = "";
                        }
                      }}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />

                    {attachmentBase64 ? (
                      <div className="flex items-center justify-between rounded-xl border border-sky-300 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-950/40">
                        <div className="flex items-center gap-2.5 truncate">
                          <ImageIcon size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                              {attachmentName}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{attachmentSize}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentBase64(null);
                            setAttachmentName(null);
                            setAttachmentSize(null);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-xs font-bold text-slate-600 hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-sky-500 transition"
                      >
                        <Paperclip size={14} />
                        <span>
                          {isBn
                            ? "স্ক্রিনশট বা ফাইল সংযুক্ত করুন (ছবি বা PDF, সর্বোচ্চ ৫ MB)"
                            : "Upload Screenshot or File (Image / PDF, max 5MB)"}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-extrabold text-sm py-3 rounded-xl shadow-md transition"
                  >
                    {createMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={16} className="animate-spin" />
                        <span>{isBn ? "জমা দেওয়া হচ্ছে..." : "Submitting Ticket..."}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Ticket size={16} />
                        <span>{isBn ? "টিকেট জমা দিন" : "Submit Support Ticket"}</span>
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TRACK TICKET */}
        {/* ========================================================================= */}
        {activeTab === "track" && (
          <div className="mx-auto max-w-3xl animate-in fade-in duration-200">
            {trackedData ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setTrackedData(null);
                    try {
                      sessionStorage.removeItem("tracked_ticket_code");
                      sessionStorage.removeItem("tracked_ticket_email");
                    } catch {}
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft size={16} />
                  <span>{isBn ? "অন্য টিকেট ট্র্যাক করুন" : "Track Another Ticket"}</span>
                </button>

                <TicketConversationThread
                  ticket={trackedData.ticket}
                  replies={trackedData.replies}
                  internalNotes={[]}
                  isBn={isBn}
                  isAdmin={false}
                  onReply={(msg, att) => {
                    replyMutation.mutate({
                      ticketId: trackedData.ticket.id,
                      message: msg,
                      attachmentUrl: att,
                      senderName: trackedData.ticket.userName || "Customer",
                      senderEmail: trackEmail || trackedData.ticket.userEmail || "",
                    });
                  }}
                  isReplying={replyMutation.isPending}
                  onOpenCloseModal={(tId) =>
                    setStatusDialogState({ isOpen: true, ticketId: tId, action: "close", reason: "" })
                  }
                  onOpenReopenModal={(tId) =>
                    setStatusDialogState({ isOpen: true, ticketId: tId, action: "reopen", reason: "" })
                  }
                />
              </div>
            ) : (
              <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 mb-4">
                  <Search size={28} />
                </div>

                <h3 className="text-center text-lg font-black text-slate-900 dark:text-white">
                  {isBn ? "টিকেট স্ট্যাটাস ট্র্যাক করুন" : "Track Ticket Status"}
                </h3>
                <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                  {isBn
                    ? "আপনার ইউনিক টিকেট কোড এবং ইমেইল অ্যাড্রেস দিয়ে তাৎক্ষণিক লাইভ চ্যাট দেখুন।"
                    : "Enter your unique Ticket ID (#TKT-xxxx) and email to access live conversation."}
                </p>

                <form onSubmit={handleTrackSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "টিকেট আইডি (#TKT কোড)" : "Ticket ID (#TKT Code)"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="#TKT-1001"
                      value={trackCode}
                      onChange={(e) => setTrackCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "আবেদনের ইমেইল অ্যাড্রেস" : "Associated Email Address"}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={trackEmail}
                      onChange={(e) => setTrackEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  {trackError && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{trackError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isTracking}
                    className="w-full bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-md"
                  >
                    {isTracking ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw size={14} className="animate-spin" />
                        <span>{isBn ? "অনুসন্ধান চলছে..." : "Searching..."}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Search size={14} />
                        <span>{isBn ? "টিকেট খুঁজুন" : "Find Ticket"}</span>
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AGENT / ADMIN WORKSPACE (2-COLUMN PRO SAAS) */}
        {/* ========================================================================= */}
        {activeTab === "admin_desk" && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Metrics Dashboard Bar */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500 text-slate-950 font-black shadow-sm">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{isBn ? "সাপোর্ট অ্যানালিটিক্স ও হেল্পডেস্ক" : "Support Operations & Metrics"}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Live Sync
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn
                        ? "রিয়েল-টাইম কিউ অবস্থা, রেসপন্স টাইম ও টিম পারফরম্যান্স কেপিআই"
                        : "Real-time queue health, SLA response metrics, and ticket resolution statistics."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      refetchAdminTickets();
                      refetchMetrics();
                    }}
                    className="h-8 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700"
                  >
                    <RefreshCw size={12} className={isLoadingAdminTickets ? "animate-spin" : ""} />
                    <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAdminMetrics(!showAdminMetrics)}
                    className="h-8 text-xs font-bold text-slate-600 dark:text-slate-400"
                  >
                    {showAdminMetrics ? (isBn ? "লুকান" : "Collapse") : (isBn ? "দেখুন" : "Expand")}
                  </Button>
                </div>
              </div>

              {showAdminMetrics && (
                <div className="mt-4 space-y-4">
                  {/* 7 KPI Status Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {[
                      {
                        label: isBn ? "মোট টিকেট" : "Total",
                        val: adminMetricsData?.total ?? (adminTicketsList || []).length,
                        color: "text-slate-900 dark:text-white",
                        bg: "bg-slate-50 dark:bg-slate-800/40",
                      },
                      {
                        label: isBn ? "খোলা (Open)" : "Open",
                        val: adminMetricsData?.open ?? (adminTicketsList || []).filter((t: any) => normalizeStatus(t.status) === "open").length,
                        color: "text-sky-600 dark:text-sky-400",
                        bg: "bg-sky-50/70 dark:bg-sky-950/30",
                      },
                      {
                        label: isBn ? "পর্যালোচনা (Pending)" : "Pending",
                        val: adminMetricsData?.pending ?? (adminTicketsList || []).filter((t: any) => normalizeStatus(t.status) === "pending").length,
                        color: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-50/70 dark:bg-amber-950/30",
                      },
                      {
                        label: isBn ? "চলমান (In Progress)" : "In Progress",
                        val: adminMetricsData?.inProgress ?? (adminTicketsList || []).filter((t: any) => normalizeStatus(t.status) === "in_progress").length,
                        color: "text-indigo-600 dark:text-indigo-400",
                        bg: "bg-indigo-50/70 dark:bg-indigo-950/30",
                      },
                      {
                        label: isBn ? "গ্রাহকের অপেক্ষা" : "Waiting",
                        val: adminMetricsData?.waitingCustomer ?? (adminTicketsList || []).filter((t: any) => normalizeStatus(t.status) === "waiting_customer").length,
                        color: "text-orange-600 dark:text-orange-400",
                        bg: "bg-orange-50/70 dark:bg-orange-950/30",
                      },
                      {
                        label: isBn ? "সমাধান (Solved)" : "Solved",
                        val: adminMetricsData?.solved ?? (adminTicketsList || []).filter((t: any) => normalizeStatus(t.status) === "solved").length,
                        color: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-50/70 dark:bg-emerald-950/30",
                      },
                      {
                        label: isBn ? "বন্ধ (Closed)" : "Closed",
                        val: adminMetricsData?.closed ?? (adminTicketsList || []).filter((t: any) => normalizeStatus(t.status) === "closed").length,
                        color: "text-slate-500",
                        bg: "bg-slate-100/70 dark:bg-slate-800/60",
                      },
                    ].map((kpi, idx) => (
                      <div key={idx} className={`rounded-2xl p-3 border border-slate-100 dark:border-slate-800 ${kpi.bg}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                          {kpi.label}
                        </div>
                        <div className={`mt-1 text-xl font-black ${kpi.color}`}>{kpi.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Operational SLAs & Priority Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {/* SLA Response Time */}
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          {isBn ? "গড় প্রথম উত্তর সময়" : "Avg. First Response Time"}
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white">
                          {adminMetricsData?.avgResponseMinutes ?? 14} {isBn ? "মিনিট" : "mins"}
                        </div>
                      </div>
                    </div>

                    {/* SLA Resolution Time */}
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCheck size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          {isBn ? "গড় সমাধান সময়" : "Avg. Resolution Time"}
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white">
                          {adminMetricsData?.avgResolutionHours ?? 2.1} {isBn ? "ঘণ্টা" : "hours"}
                        </div>
                      </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="flex flex-col justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                        <span>{isBn ? "প্রায়োরিটি বিন্যাস" : "Priority Breakdown"}</span>
                        <span className="font-mono text-[10px] text-rose-500 font-bold">
                          {adminMetricsData?.priorities?.urgent || 0} Urgent
                        </span>
                      </div>
                      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          style={{
                            width: `${Math.max(
                              4,
                              ((adminMetricsData?.priorities?.urgent || 0) /
                                Math.max(1, adminMetricsData?.total || 1)) *
                                100
                            )}%`,
                          }}
                          className="bg-rose-500"
                          title="Urgent"
                        />
                        <div
                          style={{
                            width: `${Math.max(
                              4,
                              ((adminMetricsData?.priorities?.high || 0) /
                                Math.max(1, adminMetricsData?.total || 1)) *
                                100
                            )}%`,
                          }}
                          className="bg-amber-500"
                          title="High"
                        />
                        <div
                          style={{
                            width: `${Math.max(
                              4,
                              ((adminMetricsData?.priorities?.medium || 0) /
                                Math.max(1, adminMetricsData?.total || 1)) *
                                100
                            )}%`,
                          }}
                          className="bg-sky-500"
                          title="Medium"
                        />
                        <div
                          style={{
                            width: `${Math.max(
                              4,
                              ((adminMetricsData?.priorities?.low || 0) /
                                Math.max(1, adminMetricsData?.total || 1)) *
                                100
                            )}%`,
                          }}
                          className="bg-emerald-500"
                          title="Low"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-bold">
                        <span className="text-rose-600 dark:text-rose-400">Urgent</span>
                        <span className="text-amber-600 dark:text-amber-400">High</span>
                        <span className="text-sky-600 dark:text-sky-400">Med</span>
                        <span className="text-emerald-600 dark:text-emerald-400">Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Split 2-Column Workspace if Ticket Selected, else Full Ticket Explorer */}
            {selectedTicketId ? (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft size={16} />
                  <span>{isBn ? "টিকেট তালিকায় ফিরে যান" : "Back to Ticket Queue"}</span>
                </button>

                {isLoadingActiveTicket ? (
                  <div className="flex items-center justify-center p-16 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mr-2" />
                    <span>{isBn ? "টিকেট লোড হচ্ছে..." : "Loading ticket workspace..."}</span>
                  </div>
                ) : activeTicketData?.ticket ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN (8 Cols): Chat Stream + Composer + Internal Notes */}
                    <div className="lg:col-span-8 space-y-4">
                      <TicketConversationThread
                        ticket={activeTicketData.ticket}
                        replies={activeTicketData.replies}
                        internalNotes={activeTicketData.internalNotes || []}
                        isBn={isBn}
                        isAdmin={true}
                        onReply={(msg, att, status) => {
                          adminReplyMutation.mutate({
                            ticketId: activeTicketData.ticket.id,
                            message: msg,
                            status: (status as any) || "waiting_customer",
                            attachmentUrl: att,
                          });
                        }}
                        onAddInternalNote={(note) => {
                          adminAddInternalNoteMutation.mutate({
                            ticketId: activeTicketData.ticket.id,
                            note,
                          });
                        }}
                        isReplying={adminReplyMutation.isPending || adminAddInternalNoteMutation.isPending}
                        onUpdateStatus={(st) => {
                          adminUpdateStatusMutation.mutate({
                            ticketId: activeTicketData.ticket.id,
                            status: st as any,
                          });
                        }}
                        isUpdatingStatus={adminUpdateStatusMutation.isPending}
                        onOpenCloseModal={(tId) =>
                          setStatusDialogState({ isOpen: true, ticketId: tId, action: "close", reason: "" })
                        }
                        onOpenReopenModal={(tId) =>
                          setStatusDialogState({ isOpen: true, ticketId: tId, action: "reopen", reason: "" })
                        }
                      />
                    </div>

                    {/* RIGHT COLUMN (4 Cols): Properties Sidebar & Customer CRM */}
                    <div className="lg:col-span-4 space-y-4 sticky top-20">
                      {/* Properties Card */}
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                            <Layers size={14} className="text-sky-500" />
                            {isBn ? "টিকেটের প্রোপার্টিজ" : "Ticket Properties"}
                          </span>
                          <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                            {activeTicketData.ticket.ticketCode}
                          </span>
                        </div>

                        {/* Status Selector */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            {isBn ? "স্ট্যাটাস পরিবর্তন" : "Status"}
                          </label>
                          <select
                            value={normalizeStatus(activeTicketData.ticket.status)}
                            onChange={(e) =>
                              adminUpdateStatusMutation.mutate({
                                ticketId: activeTicketData.ticket.id,
                                status: e.target.value as any,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          >
                            <option value="open">Open (সক্রিয়)</option>
                            <option value="pending">Pending (পর্যালোচনা)</option>
                            <option value="in_progress">In Progress (চলমান)</option>
                            <option value="waiting_customer">Waiting for Customer (গ্রাহকের অপেক্ষা)</option>
                            <option value="solved">Solved (সমাধান সম্পন্ন)</option>
                            <option value="closed">Closed (বন্ধ)</option>
                          </select>
                        </div>

                        {/* Priority Selector */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            {isBn ? "অগ্রাধিকার (Priority)" : "Priority"}
                          </label>
                          <select
                            value={normalizePriority(activeTicketData.ticket.priority)}
                            onChange={(e) =>
                              adminUpdatePriorityMutation.mutate({
                                ticketId: activeTicketData.ticket.id,
                                priority: e.target.value as any,
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          >
                            <option value="urgent">🔥 Urgent (জরুরি)</option>
                            <option value="high">▲ High (উচ্চ)</option>
                            <option value="medium">● Medium (মাঝারি)</option>
                            <option value="low">▼ Low (সাধারণ)</option>
                          </select>
                        </div>

                        {/* Assign Support Agent */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            {isBn ? "নিয়োজিত সাপোর্ট এজেন্ট" : "Assigned Support Agent"}
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder={isBn ? "এজেন্টের নাম লিখুন..." : "Agent name..."}
                              defaultValue={activeTicketData.ticket.assignedStaff || user?.name || "Support Lead"}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val && val !== activeTicketData.ticket.assignedStaff) {
                                  adminAssignTicketMutation.mutate({
                                    ticketId: activeTicketData.ticket.id,
                                    staffName: val,
                                  });
                                }
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                adminAssignTicketMutation.mutate({
                                  ticketId: activeTicketData.ticket.id,
                                  staffName: user?.name || "Support Lead",
                                });
                              }}
                              className="h-8 text-[11px] font-bold border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-400 shrink-0"
                            >
                              {isBn ? "আমি নেব" : "Assign Me"}
                            </Button>
                          </div>
                        </div>

                        {/* Category & Timestamps Info */}
                        <div className="rounded-2xl bg-slate-50 p-3 text-xs dark:bg-slate-950/60 space-y-1.5">
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>{isBn ? "ক্যাটাগরি" : "Category"}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {activeTicketData.ticket.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>{isBn ? "তৈরি" : "Created"}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {new Date(activeTicketData.ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>{isBn ? "সর্বশেষ রেসপন্স" : "Last Reply"}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {new Date(activeTicketData.ticket.updatedAt || activeTicketData.ticket.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="pt-1 flex flex-col gap-2">
                          {normalizeStatus(activeTicketData.ticket.status) !== "solved" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                adminUpdateStatusMutation.mutate({
                                  ticketId: activeTicketData.ticket.id,
                                  status: "solved",
                                })
                              }
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 size={14} />
                              <span>{isBn ? "টিকেট সমাধান মার্ক করুন" : "Mark as Solved"}</span>
                            </Button>
                          )}

                          {normalizeStatus(activeTicketData.ticket.status) !== "closed" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setStatusDialogState({
                                  isOpen: true,
                                  ticketId: activeTicketData.ticket.id,
                                  action: "close",
                                  reason: "",
                                })
                              }
                              className="w-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                            >
                              <Archive size={14} className="mr-1.5" />
                              <span>{isBn ? "টিকেট বন্ধ করুন" : "Close Ticket"}</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setStatusDialogState({
                                  isOpen: true,
                                  ticketId: activeTicketData.ticket.id,
                                  action: "reopen",
                                  reason: "",
                                })
                              }
                              className="w-full border-sky-400 text-sky-600 dark:text-sky-400 text-xs font-bold"
                            >
                              <RotateCcw size={14} className="mr-1.5" />
                              <span>{isBn ? "টিকেট পুনরায় খুলুন" : "Reopen Ticket"}</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Customer CRM Profile Card */}
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                          <UserIcon size={16} className="text-sky-500" />
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            {isBn ? "শিক্ষার্থীর প্রোফাইল (CRM)" : "Customer Profile"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#081833] text-white font-black text-sm dark:bg-sky-500 dark:text-slate-950">
                            {activeTicketData.ticket.userName?.[0]?.toUpperCase() || "C"}
                          </div>
                          <div className="truncate">
                            <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {activeTicketData.ticket.userName}
                            </div>
                            <a
                              href={`mailto:${activeTicketData.ticket.userEmail}`}
                              className="text-[11px] text-sky-600 hover:underline dark:text-sky-400 truncate block"
                            >
                              {activeTicketData.ticket.userEmail}
                            </a>
                          </div>
                        </div>

                        {/* CRM Metrics */}
                        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/60">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              {isBn ? "মোট অর্ডার" : "Orders"}
                            </div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {selectedTicketCustomer?.ordersCount ?? 1}
                            </div>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/60">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              {isBn ? "মোট খরচ (LTV)" : "Total Spent"}
                            </div>
                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              ৳{selectedTicketCustomer?.totalSpent ? Number(selectedTicketCustomer.totalSpent).toLocaleString() : "---"}
                            </div>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                          <div className="flex justify-between">
                            <span>{isBn ? "রোল" : "Role"}:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                              {selectedTicketCustomer?.role || "Student"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{isBn ? "ইউজার আইডি" : "User ID"}:</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">
                              #{activeTicketData.ticket.userId || "guest"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                    {isBn ? "টিকেট লোড করা যায়নি।" : "Ticket could not be loaded."}
                  </div>
                )}
              </div>
            ) : (
              /* Full Ticket Explorer Queue for Staff */
              <div className="space-y-4">
                {/* Advanced Search & Multi-Filter Bar */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {/* Status Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { key: "all", labelEn: "All Tickets", labelBn: "সকল টিকেট" },
                      { key: "open", labelEn: "Open", labelBn: "খোলা" },
                      { key: "pending", labelEn: "Pending", labelBn: "পর্যালোচনা" },
                      { key: "in_progress", labelEn: "In Progress", labelBn: "চলমান" },
                      { key: "waiting_customer", labelEn: "Waiting Customer", labelBn: "গ্রাহকের অপেক্ষা" },
                      { key: "solved", labelEn: "Solved", labelBn: "সমাধান" },
                      { key: "closed", labelEn: "Closed", labelBn: "বন্ধ" },
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => setAdminStatusFilter(st.key)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          adminStatusFilter === st.key
                            ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950 shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isBn ? st.labelBn : st.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Category, Priority & Sort controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={adminPriorityFilter}
                      onChange={(e) => setAdminPriorityFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="all">{isBn ? "সকল প্রায়োরিটি" : "All Priorities"}</option>
                      <option value="urgent">{isBn ? "🔥 Urgent (জরুরি)" : "Urgent"}</option>
                      <option value="high">{isBn ? "▲ High (উচ্চ)" : "High"}</option>
                      <option value="medium">{isBn ? "● Medium (মাঝারি)" : "Medium"}</option>
                      <option value="low">{isBn ? "▼ Low (সাধারণ)" : "Low"}</option>
                    </select>

                    <select
                      value={adminCategoryFilter}
                      onChange={(e) => setAdminCategoryFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="all">{isBn ? "সকল ক্যাটাগরি" : "All Categories"}</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {isBn ? c.labelBn : c.labelEn}
                        </option>
                      ))}
                    </select>

                    <select
                      value={adminSortOrder}
                      onChange={(e) => setAdminSortOrder(e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="updated">{isBn ? "সর্বশেষ আপডেট" : "Last Updated"}</option>
                      <option value="priority">{isBn ? "সর্বোচ্চ অগ্রাধিকার" : "Priority (Urgent First)"}</option>
                      <option value="newest">{isBn ? "নতুন টিকেট আগে" : "Newest First"}</option>
                      <option value="oldest">{isBn ? "পুরাতন টিকেট আগে" : "Oldest First"}</option>
                    </select>

                    <div className="relative w-full sm:w-52">
                      <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder={isBn ? "আইডি, নাম, ইমেইল..." : "Search #TKT, student..."}
                        value={adminSearchFilter}
                        onChange={(e) => setAdminSearchFilter(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Tickets Queue List */}
                {isLoadingAdminTickets ? (
                  <div className="flex items-center justify-center p-16 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mr-2" />
                    <span>{isBn ? "টিকেট লোড হচ্ছে..." : "Loading tickets queue..."}</span>
                  </div>
                ) : (adminTicketsList || []).length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    <Ticket size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      {isBn ? "কোনো টিকেট পাওয়া যায়নি" : "No Tickets in Queue"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isBn ? "এই ফিল্টারে কোনো টিকেট নেই।" : "No tickets match your filter criteria."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {(adminTicketsList || []).map((t: any) => {
                      const isUrgent = normalizePriority(t.priority) === "urgent";
                      return (
                        <div
                          key={t.id}
                          className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md dark:bg-slate-900 ${
                            isUrgent
                              ? "border-rose-300 bg-rose-50/20 dark:border-rose-900/60"
                              : "border-slate-200 dark:border-slate-800 hover:border-sky-400"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                                  {t.ticketCode || `#TKT-${t.id}`}
                                </span>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {t.category}
                                </span>
                                {renderPriorityBadge(t.priority)}
                                {renderStatusBadge(t.status)}
                                {t.assignedStaff ? (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                                    <ShieldCheck size={11} className="text-sky-500" />
                                    {t.assignedStaff}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    Unassigned
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                {t.subject}
                              </h4>

                              <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t.message}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                  <UserIcon size={12} />
                                  {t.userName} ({t.userEmail})
                                </span>
                                <span>•</span>
                                <span>
                                  {new Date(t.createdAt).toLocaleDateString()}{" "}
                                  {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <span>•</span>
                                <span>
                                  Updated:{" "}
                                  {new Date(t.updatedAt || t.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                              {normalizeStatus(t.status) !== "solved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    adminUpdateStatusMutation.mutate({
                                      ticketId: t.id,
                                      status: "solved",
                                    })
                                  }
                                  className="h-8 text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                >
                                  <Check size={13} className="mr-1" />
                                  <span>{isBn ? "সমাধান" : "Solve"}</span>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => setSelectedTicketId(t.id)}
                                className="h-8 gap-1.5 text-xs font-black bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-sm"
                              >
                                <MessageSquare size={13} />
                                <span>{isBn ? "ওয়ার্কস্পেস খুলুন" : "Open Workspace"}</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* REOPEN / CLOSE CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {statusDialogState && statusDialogState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {statusDialogState.action === "close" ? (
                    <>
                      <Archive size={18} className="text-slate-500" />
                      <span>{isBn ? "টিকেট বন্ধ নিশ্চিতকরণ" : "Close Ticket Confirmation"}</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={18} className="text-sky-500" />
                      <span>{isBn ? "টিকেট পুনরায় সক্রিয়করণ" : "Reopen Ticket"}</span>
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setStatusDialogState(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {statusDialogState.action === "close"
                    ? isBn
                      ? "আপনার সমস্যার সমাধান হয়ে থাকলে টিকেটটি বন্ধ করতে পারেন। কোনো কারণ বা মন্তব্য থাকলে নিচে লিখুন:"
                      : "If your inquiry has been resolved satisfactorily, you may close this ticket. Optionally provide closing remarks below:"
                    : isBn
                      ? "টিকেটটি পুনরায় সক্রিয় করার কারণ সংক্ষেপে লিখুন যাতে সাপোর্ট টিম দ্রুত সহায়তা করতে পারে:"
                      : "Please provide a reason for reopening this ticket so our support team can continue helping you:"}
                </p>

                <textarea
                  rows={3}
                  placeholder={
                    statusDialogState.action === "close"
                      ? isBn
                        ? "উদা: সমস্যার সমাধান হয়েছে, ধন্যবাদ!"
                        : "e.g. Issue resolved completely, thank you!"
                      : isBn
                        ? "উদা: পুনরায় সমস্যা দেখা দিয়েছে বা অতিরিক্ত প্রশ্ন আছে..."
                        : "e.g. Still encountering issue or have follow-up question..."
                  }
                  value={statusDialogState.reason}
                  onChange={(e) =>
                    setStatusDialogState({
                      ...statusDialogState,
                      reason: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />

                <div className="mt-4 flex items-center justify-end gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => setStatusDialogState(null)}
                    className="text-xs font-bold border-slate-300 dark:border-slate-700"
                  >
                    {isBn ? "বাতিল" : "Cancel"}
                  </Button>

                  <Button
                    onClick={() => {
                      if (statusDialogState.action === "close") {
                        closeTicketMutation.mutate({
                          ticketId: statusDialogState.ticketId,
                          reason: statusDialogState.reason || undefined,
                          senderEmail: user?.email || undefined,
                        });
                      } else {
                        reopenTicketMutation.mutate({
                          ticketId: statusDialogState.ticketId,
                          reason: statusDialogState.reason || undefined,
                          senderEmail: user?.email || undefined,
                        });
                      }
                    }}
                    disabled={closeTicketMutation.isPending || reopenTicketMutation.isPending}
                    className={`text-xs font-black text-white ${
                      statusDialogState.action === "close"
                        ? "bg-slate-800 hover:bg-slate-700 dark:bg-slate-700"
                        : "bg-sky-600 hover:bg-sky-500"
                    }`}
                  >
                    {statusDialogState.action === "close"
                      ? isBn
                        ? "হ্যাঁ, বন্ধ করুন"
                        : "Confirm Close"
                      : isBn
                        ? "পুনরায় সক্রিয় করুন"
                        : "Confirm Reopen"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// =============================================================================
// MODERN SAAS TICKET CONVERSATION THREAD COMPONENT
// =============================================================================

interface TicketConversationProps {
  ticket: any;
  replies: any[];
  internalNotes?: any[];
  isBn: boolean;
  isAdmin?: boolean;
  onReply: (message: string, attachmentUrl?: string, status?: string) => void;
  onAddInternalNote?: (note: string) => void;
  isReplying: boolean;
  onUpdateStatus?: (status: string) => void;
  isUpdatingStatus?: boolean;
  onOpenCloseModal?: (ticketId: number) => void;
  onOpenReopenModal?: (ticketId: number) => void;
}

function TicketConversationThread({
  ticket,
  replies,
  internalNotes = [],
  isBn,
  isAdmin = false,
  onReply,
  onAddInternalNote,
  isReplying,
  onUpdateStatus,
  isUpdatingStatus = false,
  onOpenCloseModal,
  onOpenReopenModal,
}: TicketConversationProps) {
  // Composer Mode: "reply" vs "internal_note" (Admin only)
  const [composerMode, setComposerMode] = useState<"reply" | "internal_note">("reply");
  const [replyText, setReplyText] = useState("");
  const [internalNoteText, setInternalNoteText] = useState("");
  const [replyStatus, setReplyStatus] = useState<string>("waiting_customer");
  const [replyFileUrl, setReplyFileUrl] = useState<string | null>(null);
  const [replyFileName, setReplyFileName] = useState<string | null>(null);
  const [isUploadingReplyFile, setIsUploadingReplyFile] = useState(false);
  const [activeTabSubView, setActiveTabSubView] = useState<"all" | "chat" | "notes">("all");

  const replyFileInputRef = useRef<HTMLInputElement | null>(null);
  const threadBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when replies change
  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies.length, internalNotes.length]);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (composerMode === "internal_note" && isAdmin) {
      if (!internalNoteText.trim() || !onAddInternalNote) return;
      onAddInternalNote(internalNoteText.trim());
      setInternalNoteText("");
    } else {
      if (!replyText.trim()) return;
      onReply(replyText.trim(), replyFileUrl || undefined, isAdmin ? replyStatus : undefined);
      setReplyText("");
      setReplyFileUrl(null);
      setReplyFileName(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBn ? "ফাইলের সাইজ সর্বোচ্চ ৫ MB হতে পারবে" : "File size must be under 5MB");
      return;
    }
    setIsUploadingReplyFile(true);
    const toastId = toast.loading(isBn ? "ফাইল ক্লাউডে আপলোড হচ্ছে..." : "Uploading file to CDN...");
    try {
      const cdnUrl = await uploadImage(file);
      setReplyFileUrl(cdnUrl);
      setReplyFileName(file.name);
      toast.success(isBn ? "ফাইল আপলোড সম্পন্ন!" : "File uploaded!", { id: toastId });
    } catch (err: any) {
      toast.error(isBn ? "ফাইল আপলোড ব্যর্থ হয়েছে।" : "Failed to upload file.", { id: toastId });
    } finally {
      setIsUploadingReplyFile(false);
      e.target.value = "";
    }
  };

  // Canned quick replies for agents
  const applyCannedReply = (text: string, targetStatus?: string) => {
    setReplyText(text);
    if (targetStatus) setReplyStatus(targetStatus);
  };

  // Combine messages & internal notes into chronological feed
  const feedItems = useMemo(() => {
    type FeedItem =
      | { type: "starter"; data: any; timestamp: number }
      | { type: "reply"; data: any; timestamp: number }
      | { type: "note"; data: any; timestamp: number };

    const items: FeedItem[] = [
      { type: "starter", data: ticket, timestamp: new Date(ticket.createdAt).getTime() },
    ];

    if (activeTabSubView === "all" || activeTabSubView === "chat") {
      for (const r of replies) {
        items.push({ type: "reply", data: r, timestamp: new Date(r.createdAt).getTime() });
      }
    }

    if (isAdmin && (activeTabSubView === "all" || activeTabSubView === "notes")) {
      for (const n of internalNotes) {
        items.push({ type: "note", data: n, timestamp: new Date(n.createdAt).getTime() });
      }
    }

    return items.sort((a, b) => a.timestamp - b.timestamp);
  }, [ticket, replies, internalNotes, isAdmin, activeTabSubView]);

  const normStatus = normalizeStatus(ticket.status);
  const isClosedOrSolved = normStatus === "closed" || normStatus === "solved";

  return (
    <div className="space-y-4">
      {/* Ticket Header & Metadata */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                {ticket.ticketCode || `#TKT-${ticket.id}`}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {ticket.category}
              </span>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-slate-100 dark:bg-slate-800">
                {ticket.priority || "Medium"}
              </span>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {normStatus.replace("_", " ")}
              </span>
            </div>
            <h2 className="mt-1.5 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {ticket.subject}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!isClosedOrSolved && onOpenCloseModal && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenCloseModal(ticket.id)}
                className="h-8 text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                <Archive size={13} className="mr-1.5" />
                <span>{isBn ? "টিকেট বন্ধ করুন" : "Close Ticket"}</span>
              </Button>
            )}

            {isClosedOrSolved && onOpenReopenModal && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenReopenModal(ticket.id)}
                className="h-8 text-xs font-bold border-sky-400 text-sky-600 dark:text-sky-400"
              >
                <RotateCcw size={13} className="mr-1.5" />
                <span>{isBn ? "টিকেট পুনরায় খুলুন" : "Reopen Ticket"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Customer & Staff Info Sub-bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            {isBn ? "গ্রাহক: " : "Customer: "}
            <span className="font-bold text-slate-800 dark:text-slate-200">{ticket.userName}</span> ({ticket.userEmail})
          </div>

          <div className="flex items-center gap-4">
            {ticket.assignedStaff && (
              <div className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
                <ShieldCheck size={14} />
                <span>{ticket.assignedStaff}</span>
              </div>
            )}
            <div>
              {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* Feed Filter for Admin */}
        {isAdmin && internalNotes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">View:</span>
            <button
              onClick={() => setActiveTabSubView("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                activeTabSubView === "all" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              All Activity ({replies.length + internalNotes.length + 1})
            </button>
            <button
              onClick={() => setActiveTabSubView("chat")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                activeTabSubView === "chat" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Public Chat ({replies.length + 1})
            </button>
            <button
              onClick={() => setActiveTabSubView("notes")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${
                activeTabSubView === "notes" ? "bg-amber-500 text-slate-950 font-black" : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              <Lock size={12} />
              Internal Notes ({internalNotes.length})
            </button>
          </div>
        )}
      </div>

      {/* Modern SaaS Chat Stream Container */}
      <div className="space-y-4">
        {feedItems.map((item, index) => {
          // Starter message from user
          if (item.type === "starter") {
            return (
              <div
                key="starter"
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-[#081833] text-white font-bold text-xs shrink-0 dark:bg-sky-500 dark:text-slate-950">
                  {ticket.userName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {ticket.userName}
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 dark:bg-slate-800">
                        {isBn ? "মূল আবেদন" : "Original Inquiry"}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pt-1">
                    {ticket.message}
                  </p>

                  {/* Attachment Preview */}
                  {ticket.attachmentUrl && (
                    <div className="mt-3">
                      {ticket.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                        <a
                          href={ticket.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-xs overflow-hidden rounded-xl border border-slate-200 hover:border-sky-400 dark:border-slate-800 transition"
                        >
                          <img
                            src={ticket.attachmentUrl}
                            alt="Attachment preview"
                            className="max-h-48 w-auto object-cover rounded-xl"
                          />
                        </a>
                      ) : (
                        <a
                          href={ticket.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-sky-600 hover:underline dark:border-slate-800 dark:bg-slate-950 dark:text-sky-400"
                        >
                          <FileText size={16} />
                          <span>{isBn ? "সংযুক্ত ডকুমেন্ট দেখুন" : "View Attached Document"}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Internal Staff Note (Only visible to admin)
          if (item.type === "note") {
            const note = item.data;
            return (
              <div
                key={`note-${note.id}`}
                className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 sm:p-5 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/30"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold text-xs shrink-0">
                  <Lock size={16} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                        {note.authorName}
                      </span>
                      <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 flex items-center gap-1">
                        <Lock size={10} />
                        Private Internal Note
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-700/70 dark:text-amber-400">
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 whitespace-pre-wrap leading-relaxed pt-1">
                    {note.content}
                  </p>
                  <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 pt-1">
                    🔒 Hidden from customer. Only visible to support staff.
                  </div>
                </div>
              </div>
            );
          }

          // Reply Message (User Right, Staff Left)
          const reply = item.data;
          const isStaff = reply.senderRole === "support" || reply.senderRole === "admin";

          // If current viewing is User and sender is User, place on RIGHT
          // If current viewing is Staff and sender is Staff, place on RIGHT
          const isMyMessage = isAdmin ? isStaff : !isStaff;

          return (
            <div
              key={`reply-${reply.id}`}
              className={`flex items-start gap-3 ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`flex size-9 items-center justify-center rounded-full font-bold text-xs shrink-0 shadow-sm ${
                  isStaff
                    ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 ring-2 ring-sky-300 dark:ring-sky-700"
                    : "bg-[#081833] text-white dark:bg-slate-700"
                }`}
              >
                {isStaff ? <ShieldCheck size={18} /> : reply.senderName?.[0]?.toUpperCase() || "U"}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isMyMessage ? "items-end text-right" : "items-start text-left"}`}>
                <div className={`flex items-center gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {reply.senderName}
                  </span>
                  {isStaff && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                      Support Specialist
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                    isMyMessage
                      ? "bg-[#081833] text-white rounded-tr-none dark:bg-sky-600 dark:text-white"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  <p>{reply.message}</p>

                  {/* Attachment in Reply */}
                  {reply.attachmentUrl && (
                    <div className="mt-3">
                      {reply.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                        <a
                          href={reply.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-xs overflow-hidden rounded-xl border border-white/20 hover:opacity-90 transition"
                        >
                          <img
                            src={reply.attachmentUrl}
                            alt="Attachment preview"
                            className="max-h-48 w-auto object-cover rounded-xl"
                          />
                        </a>
                      ) : (
                        <a
                          href={reply.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold underline ${
                            isMyMessage ? "text-sky-200 hover:text-white" : "text-sky-600 hover:text-sky-800"
                          }`}
                        >
                          <FileText size={15} />
                          <span>{isBn ? "সংযুক্ত ফাইল ডাউনলোড করুন" : "Download Attached Document"}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery checkmark */}
                <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMyMessage ? "justify-end" : "justify-start"}`}>
                  <CheckCheck size={12} className="text-sky-500" />
                  <span>Delivered & Synchronized</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator when replying */}
        {isReplying && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
            <span className="flex gap-1 items-center">
              <span className="size-1.5 rounded-full bg-sky-500 animate-bounce" />
              <span className="size-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
              <span className="size-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>{isBn ? "মেসেজ পাঠানো হচ্ছে..." : "Sending message..."}</span>
          </div>
        )}

        <div ref={threadBottomRef} />
      </div>

      {/* Closed Banner notice */}
      {isClosedOrSolved && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Archive size={16} className="text-slate-400 shrink-0" />
            <span>
              {isBn
                ? "এই টিকেটটি বর্তমানে সমাধান/বন্ধ অবস্থায় রয়েছে। অতিরিক্ত সহায়তা প্রয়োজন হলে পুনরায় সক্রিয় করতে পারেন।"
                : "This ticket is solved or closed. You can submit a reply or click 'Reopen Ticket' if you require further assistance."}
            </span>
          </div>
          {onOpenReopenModal && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenReopenModal(ticket.id)}
              className="h-8 text-xs font-bold border-sky-400 text-sky-600 dark:text-sky-400 shrink-0"
            >
              <RotateCcw size={13} className="mr-1.5" />
              <span>{isBn ? "টিকেট পুনরায় খুলুন" : "Reopen Ticket"}</span>
            </Button>
          )}
        </div>
      )}

      {/* Modern Composer (Public Reply / Internal Note) */}
      <div
        className={`rounded-3xl border bg-white p-4 shadow-sm dark:bg-slate-900 transition ${
          composerMode === "internal_note" && isAdmin
            ? "border-amber-300 ring-2 ring-amber-300/40 dark:border-amber-700/60"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {isAdmin && (
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 dark:border-slate-800">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setComposerMode("reply")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                  composerMode === "reply"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <MessageSquare size={13} />
                <span>Public Reply</span>
              </button>
              <button
                type="button"
                onClick={() => setComposerMode("internal_note")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                  composerMode === "internal_note"
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-amber-800 hover:text-amber-950 dark:text-amber-300"
                }`}
              >
                <Lock size={13} />
                <span>Internal Note (Staff Only)</span>
              </button>
            </div>

            {/* Quick Canned Replies for Public Reply */}
            {composerMode === "reply" && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-slate-400">Templates:</span>
                <button
                  type="button"
                  onClick={() =>
                    applyCannedReply(
                      "Hello! Thank you for reaching out. We are currently verifying your payment transaction details and will update you shortly.",
                      "in_progress"
                    )
                  }
                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Payment Check
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyCannedReply(
                      "Your issue has been resolved successfully. Please refresh your dashboard to access your contents. Let us know if you need anything else!",
                      "solved"
                    )
                  }
                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Resolved
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleReplySubmit} className="space-y-3">
          {composerMode === "internal_note" && isAdmin ? (
            <div>
              <div className="mb-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Lock size={12} />
                <span>Add private staff note (Never visible to the student):</span>
              </div>
              <textarea
                rows={3}
                required
                placeholder="Write private notes, escalations, or follow-up instructions for other support agents..."
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                className="w-full rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs sm:text-sm font-medium outline-none focus:border-amber-400 dark:border-amber-800/80 dark:bg-amber-950/20 dark:text-white"
              />
            </div>
          ) : (
            <textarea
              rows={3}
              placeholder={
                isAdmin
                  ? isBn
                    ? "শিক্ষার্থীর জন্য অফিসিয়াল উত্তর লিখুন..."
                    : "Type your official response to this customer..."
                  : isBn
                    ? "আপনার বার্তা বা অতিরিক্ত তথ্য লিখুন..."
                    : "Type your message or additional details here..."
              }
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          )}

          <input
            type="file"
            ref={replyFileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Attachment preview or attach trigger */}
            {composerMode === "reply" && (
              <div>
                {replyFileName ? (
                  <div className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    <ImageIcon size={14} />
                    <span className="truncate max-w-[180px]">{replyFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyFileUrl(null);
                        setReplyFileName(null);
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => replyFileInputRef.current?.click()}
                    disabled={isUploadingReplyFile}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                  >
                    <Paperclip size={14} />
                    <span>{isUploadingReplyFile ? "Uploading..." : isBn ? "ফাইল সংযুক্ত করুন" : "Attach File"}</span>
                  </button>
                )}
              </div>
            )}

            {/* Target Status after reply (Admin only) */}
            {isAdmin && composerMode === "reply" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {isBn ? "উত্তরের পর স্ট্যাটাস:" : "Status after reply:"}
                </span>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="waiting_customer">Waiting for Customer</option>
                  <option value="in_progress">In Progress</option>
                  <option value="solved">Solved (Resolved)</option>
                  <option value="closed">Closed</option>
                  <option value="open">Keep Open</option>
                </select>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="ml-auto">
              {composerMode === "internal_note" && isAdmin ? (
                <Button
                  type="submit"
                  disabled={isReplying || !internalNoteText.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gap-1.5 shadow-sm"
                >
                  <Lock size={14} />
                  <span>Save Internal Note</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isReplying || !replyText.trim()}
                  className="bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold text-xs gap-1.5 shadow-sm"
                >
                  {isReplying ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>{isBn ? "উত্তর পাঠান" : "Send Reply"}</span>
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
