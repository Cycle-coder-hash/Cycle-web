import { useState, useEffect, useRef } from "react";
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
  ShieldCheck,
  ArrowLeft,
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
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export type TicketCategory =
  | "Course Problem"
  | "Payment Problem"
  | "Account Problem"
  | "Technical Problem"
  | "eBook Problem"
  | "Other";

const CATEGORIES: { value: TicketCategory; labelEn: string; labelBn: string }[] = [
  { value: "Course Problem", labelEn: "Course Problem", labelBn: "কোর্স সংক্রান্ত সমস্যা" },
  { value: "Payment Problem", labelEn: "Payment Problem", labelBn: "পেমেন্ট সংক্রান্ত সমস্যা" },
  { value: "Account Problem", labelEn: "Account Problem", labelBn: "অ্যাকাউন্ট সমস্যা" },
  { value: "Technical Problem", labelEn: "Technical Problem", labelBn: "টেকনিক্যাল সমস্যা" },
  { value: "eBook Problem", labelEn: "eBook Problem", labelBn: "ই-বুক সংক্রান্ত সমস্যা" },
  { value: "Other", labelEn: "Other", labelBn: "অন্যান্য" },
];

export default function Support() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  // Language state
  const [lang, setLang] = useState<"en" | "bn">("bn");
  const isBn = lang === "bn";

  // Active Tab: "create" | "my_tickets" | "track"
  const [activeTab, setActiveTab] = useState<"create" | "my_tickets" | "track">("create");

  // Create Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCategory, setFormCategory] = useState<TicketCategory>("Course Problem");
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
  const [trackedData, setTrackedData] = useState<{ ticket: any; replies: any[] } | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Active Conversation modal/view for "My Tickets"
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  // Reply Form State
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<string | null>(null);
  const [replyAttachmentName, setReplyAttachmentName] = useState<string | null>(null);

  // Status Filter for My Tickets
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replyFileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Autofill user info if logged in
  useEffect(() => {
    if (user) {
      if (!formName && user.name) setFormName(user.name);
      if (!formEmail && user.email) setFormEmail(user.email);
      if (!trackEmail && user.email) setTrackEmail(user.email);
    }
  }, [user]);

  // Queries
  const {
    data: myTicketsList,
    refetch: refetchMyTickets,
    isLoading: isLoadingMyTickets,
  } = trpc.support.myTickets.useQuery(undefined, {
    enabled: !!user,
  });

  const {
    data: activeTicketData,
    refetch: refetchActiveTicket,
    isLoading: isLoadingActiveTicket,
  } = trpc.support.getTicket.useQuery(
    { ticketId: selectedTicketId as number, email: user?.email || undefined },
    {
      enabled: !!selectedTicketId,
    }
  );

  // Mutations
  const createMutation = trpc.support.createTicket.useMutation({
    onSuccess: (data) => {
      setSubmittedTicket(data.ticket);
      setFormSubject("");
      setFormMessage("");
      setAttachmentBase64(null);
      setAttachmentName(null);
      setAttachmentSize(null);
      if (user) refetchMyTickets();
      toast.success(
        isBn
          ? `টিকেট সফলভাবে তৈরি হয়েছে! আপনার টিকেট আইডি: ${data.ticket.ticketCode}`
          : `Ticket created successfully! Your Ticket ID: ${data.ticket.ticketCode}`
      );
    },
    onError: (err) => {
      toast.error(err.message || (isBn ? "টিকেট তৈরিতে সমস্যা হয়েছে" : "Failed to create ticket"));
    },
  });

  const replyMutation = trpc.support.reply.useMutation({
    onSuccess: (res) => {
      setReplyMessage("");
      setReplyAttachment(null);
      setReplyAttachmentName(null);
      toast.success(isBn ? "উত্তর পাঠানো হয়েছে" : "Reply sent successfully");

      // Refetch active ticket data or tracked data
      if (selectedTicketId) {
        refetchActiveTicket();
        refetchMyTickets();
      }
      if (trackedData) {
        setTrackedData((prev) =>
          prev ? { ...prev, replies: [...prev.replies, res.reply] } : null
        );
      }
    },
    onError: (err) => {
      toast.error(err.message || (isBn ? "উত্তর পাঠাতে সমস্যা হয়েছে" : "Failed to send reply"));
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
      // Direct call using fetch through TRPC query endpoint or client helper
      const cleanCode = trackCode.trim();
      const res = await fetch(
        `/api/trpc/support.trackTicket?input=${encodeURIComponent(
          JSON.stringify({ ticketCode: cleanCode, email: trackEmail.trim() })
        )}`
      );
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(
          json.error?.message ||
            (isBn
              ? "কোনো টিকেট পাওয়া যায়নি অথবা ইমেইল মিলছে না।"
              : "No ticket found with this Ticket ID and Email address.")
        );
      }
      setTrackedData(json.result.data);
    } catch (err: any) {
      setTrackError(err.message || "Failed to find ticket");
    } finally {
      setIsTracking(false);
    }
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isReply = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBn ? "ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে" : "File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const sizeStr = (file.size / 1024).toFixed(1) + " KB";
      if (isReply) {
        setReplyAttachment(base64);
        setReplyAttachmentName(file.name);
      } else {
        setAttachmentBase64(base64);
        setAttachmentName(file.name);
        setAttachmentSize(sizeStr);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy Ticket ID
  const copyTicketId = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(isBn ? "টিকেট আইডি কপি করা হয়েছে!" : "Ticket ID copied!");
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <span className="size-1.5 rounded-full bg-sky-500 animate-pulse" />
            {isBn ? "খোলা (Open)" : "Open"}
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock size={12} className="text-amber-600 dark:text-amber-400" />
            {isBn ? "চলমান (In Progress)" : "In Progress"}
          </span>
        );
      case "waiting_user":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <span className="size-1.5 rounded-full bg-purple-500" />
            {isBn ? "উত্তরের অপেক্ষায় (Waiting)" : "Waiting for You"}
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
            {isBn ? "সমাধান হয়েছে (Resolved)" : "Resolved"}
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <X size={12} />
            {isBn ? "বন্ধ (Closed)" : "Closed"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  // Filtered tickets
  const filteredMyTickets = (myTicketsList || []).filter((t: any) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        t.ticketCode?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors duration-300 dark:bg-[#070e1b] dark:text-slate-100">
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
              <span className="text-xs sm:text-sm font-black tracking-[0.18em] text-[#0a192f] dark:text-white">
                CYCLE OF CHART
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
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
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-sky-50/40 to-slate-50 pt-10 pb-8 sm:pt-14 sm:pb-12 dark:border-slate-800/80 dark:from-[#081326] dark:via-[#09152b] dark:to-[#070e1b]">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/80 bg-sky-100/70 px-3.5 py-1 text-xs font-extrabold text-[#0369a1] dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 mb-4">
            <LifeBuoy size={14} className="animate-spin-slow" />
            <span>{isBn ? "সার্বক্ষণিক সহায়তা কেন্দ্র" : "24/7 Official Support Helpdesk"}</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl text-slate-900 dark:text-white">
            {isBn ? "সাপোর্ট সেন্টার" : "Support Center"}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {isBn
              ? "কোর্স, পেমেন্ট ভেরিফিকেশন, ই-বুক বা অ্যাকাউন্ট সংক্রান্ত যেকোনো সমস্যায় আমাদের ডেডিকেটেড সাপোর্ট টিম আপনাকে দ্রুত সহায়তা করতে প্রস্তুত।"
              : "Need assistance with your courses, payments, eBooks, or student account? Our dedicated support team is ready to resolve your inquiry promptly."}
          </p>

          {/* Quick Metrics / Guarantees */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles size={14} className="text-sky-500" />
              <span>{isBn ? "গড় সমাধান: < ২ ঘণ্টা" : "Avg. Response: < 2 hrs"}</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>{isBn ? "ইউনিক #TKT আইডি ট্র্যাকিং" : "Unique #TKT ID Tracking"}</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 size={14} className="text-sky-500" />
              <span>{isBn ? "সরাসরি অভিজ্ঞ মেন্টর সহায়তা" : "Direct Expert Resolution"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MAIN SUPPORT HUB: TABS */}
      {/* ========================================================================= */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-xl mx-auto mb-8">
          <button
            onClick={() => {
              setActiveTab("create");
              setSelectedTicketId(null);
              setTrackedData(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              activeTab === "create"
                ? "bg-[#081833] text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Plus size={16} />
            <span>{isBn ? "নতুন টিকেট তৈরি করুন" : "Create New Ticket"}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("my_tickets");
              setSelectedTicketId(null);
              setTrackedData(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all duration-200 relative ${
              activeTab === "my_tickets"
                ? "bg-[#081833] text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Ticket size={16} />
            <span>{isBn ? "আমার টিকেটসমূহ" : "My Tickets"}</span>
            {user && (myTicketsList?.length || 0) > 0 && (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-black text-white dark:bg-[#081833]">
                {myTicketsList?.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("track");
              setSelectedTicketId(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              activeTab === "track"
                ? "bg-[#081833] text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Search size={16} />
            <span>{isBn ? "টিকেট ট্র্যাক করুন" : "Track Ticket"}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CREATE TICKET FORM */}
        {/* ========================================================================= */}
        {activeTab === "create" && (
          <div className="mx-auto max-w-2xl animate-in fade-in duration-300">
            {submittedTicket ? (
              /* Celebration / Ticket Created Card */
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 text-center shadow-lg dark:border-emerald-900/50 dark:bg-slate-900">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isBn ? "টিকেট সফলভাবে জমা হয়েছে!" : "Ticket Successfully Submitted!"}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {isBn
                    ? "আমাদের সাপোর্ট টিম আপনার টিকেট পর্যালোচনা করছে। নিচে আপনার ইউনিক টিকেট আইডি দেওয়া হলো:"
                    : "Our support specialist is reviewing your inquiry. Please save your unique Ticket ID below:"}
                </p>

                {/* Ticket ID Box */}
                <div className="mx-auto mt-5 flex max-w-sm items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      {isBn ? "টিকেট রেফারেন্স কোড" : "Ticket Reference ID"}
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
                    ? `ইমেইল নোটিফিকেশন পাঠানো হবে: ${submittedTicket.userEmail}`
                    : `Updates will be sent to: ${submittedTicket.userEmail}`}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => {
                      setTrackCode(submittedTicket.ticketCode);
                      setTrackEmail(submittedTicket.userEmail);
                      setActiveTab("track");
                      setTrackedData({ ticket: submittedTicket, replies: [] });
                      setSubmittedTicket(null);
                    }}
                    className="w-full sm:w-auto bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold text-xs"
                  >
                    <MessageSquare size={14} className="mr-1.5" />
                    <span>{isBn ? "টিকেট কথোপকথন দেখুন" : "View Ticket Thread"}</span>
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
              /* Create Ticket Form */
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
                      subject: formSubject,
                      message: formMessage,
                      attachmentUrl: attachmentBase64 || undefined,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
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
                        placeholder={isBn ? "উদা: name@example.com" : "e.g. name@example.com"}
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "সমস্যার ক্যাটাগরি" : "Problem Category"} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {isBn ? c.labelBn : c.labelEn}
                        </option>
                      ))}
                    </select>
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

                  {/* Optional File Attachment */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "সংযুক্তি / স্ক্রিনশট (ঐচ্ছিক)" : "Attachment / Screenshot (Optional)"}
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileChange(e, false)}
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
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {attachmentSize}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentBase64(null);
                            setAttachmentName(null);
                            setAttachmentSize(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
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
        {/* TAB 2: MY TICKETS LIST */}
        {/* ========================================================================= */}
        {activeTab === "my_tickets" && (
          <div className="animate-in fade-in duration-300">
            {selectedTicketId ? (
              /* Selected Ticket Conversation Thread */
              <div className="mx-auto max-w-3xl">
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft size={16} />
                  <span>{isBn ? "আমার টিকেট তালিকায় ফিরে যান" : "Back to All Tickets"}</span>
                </button>

                {isLoadingActiveTicket ? (
                  <div className="flex items-center justify-center p-12 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mr-2" />
                    <span>{isBn ? "টিকেট লোড হচ্ছে..." : "Loading ticket conversation..."}</span>
                  </div>
                ) : activeTicketData?.ticket ? (
                  <TicketConversationThread
                    ticket={activeTicketData.ticket}
                    replies={activeTicketData.replies}
                    isBn={isBn}
                    onReply={(msg, att) => {
                      replyMutation.mutate({
                        ticketId: activeTicketData.ticket.id,
                        message: msg,
                        attachmentUrl: att,
                      });
                    }}
                    isReplying={replyMutation.isPending}
                  />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                    {isBn ? "টিকেট লোড করা যায়নি।" : "Could not load ticket details."}
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
                  {isBn ? "লগইন প্রয়োজন" : "Sign In to View Your Tickets"}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isBn
                    ? "আপনার পূর্বে জমা দেওয়া সমস্ত টিকেট এবং উত্তর দেখতে আপনার অ্যাকাউন্টে লগইন করুন। অথবা 'টিকেট ট্র্যাক করুন' ট্যাবে আপনার টিকেট আইডি দিয়ে সার্চ করতে পারেন।"
                    : "Sign in to your student account to review all previously submitted tickets and live staff responses. Or use the Track Ticket tab with your Ticket ID."}
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
              /* Signed-in User Ticket Dashboard */
              <div className="space-y-4">
                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    {[
                      { key: "all", labelEn: "All", labelBn: "সব" },
                      { key: "open", labelEn: "Open", labelBn: "খোলা" },
                      { key: "in_progress", labelEn: "In Progress", labelBn: "চলমান" },
                      { key: "waiting_user", labelEn: "Waiting", labelBn: "অপেক্ষমান" },
                      { key: "resolved", labelEn: "Resolved", labelBn: "সমাধান" },
                      { key: "closed", labelEn: "Closed", labelBn: "বন্ধ" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setStatusFilter(f.key)}
                        className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                          statusFilter === f.key
                            ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isBn ? f.labelBn : f.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Search Box */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={isBn ? "আইডি বা বিষয়ে খুঁজুন..." : "Search by ID or topic..."}
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                {/* Ticket Cards */}
                {isLoadingMyTickets ? (
                  <div className="flex items-center justify-center p-12 text-slate-400">
                    <RefreshCw size={24} className="animate-spin mr-2" />
                    <span>{isBn ? "টিকেট লোড হচ্ছে..." : "Loading tickets..."}</span>
                  </div>
                ) : filteredMyTickets.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    <Ticket size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      {isBn ? "কোনো টিকেট পাওয়া যায়নি" : "No Support Tickets Found"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isBn
                        ? "আপনার কোনো প্রশ্ন বা সমস্যা থাকলে নতুন টিকেট ওপেন করুন।"
                        : "You don't have any tickets under this filter. Create one to get help!"}
                    </p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="mt-4 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold text-xs"
                    >
                      <Plus size={14} className="mr-1.5" />
                      <span>{isBn ? "নতুন টিকেট খুলুন" : "Create New Ticket"}</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredMyTickets.map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                              {t.ticketCode}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {t.category}
                            </span>
                            {renderStatusBadge(t.status)}
                          </div>

                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                            {t.subject}
                          </h4>

                          <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                            {t.message}
                          </p>

                          <div className="text-[11px] text-slate-400 pt-1">
                            {isBn ? "তৈরি করা হয়েছে: " : "Created: "}
                            {new Date(t.createdAt).toLocaleDateString()}{" "}
                            {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs font-bold border-slate-200 group-hover:border-sky-500 dark:border-slate-700"
                          >
                            <span>{isBn ? "কথোপকথন দেখুন" : "View Thread"}</span>
                            <ChevronRight size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SEARCH / TRACK TICKET */}
        {/* ========================================================================= */}
        {activeTab === "track" && (
          <div className="animate-in fade-in duration-300">
            {trackedData ? (
              /* Tracked Ticket Thread View */
              <div className="mx-auto max-w-3xl">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setTrackedData(null)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    <span>{isBn ? "অন্য টিকেট খুঁজুন" : "Search Another Ticket"}</span>
                  </button>

                  <div className="text-xs text-slate-400">
                    {isBn ? "ট্র্যাকিং আইডি: " : "Tracking ID: "}
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                      {trackedData.ticket.ticketCode}
                    </span>
                  </div>
                </div>

                <TicketConversationThread
                  ticket={trackedData.ticket}
                  replies={trackedData.replies}
                  isBn={isBn}
                  onReply={(msg, att) => {
                    replyMutation.mutate({
                      ticketId: trackedData.ticket.id,
                      message: msg,
                      senderName: trackedData.ticket.userName,
                      senderEmail: trackedData.ticket.userEmail,
                      attachmentUrl: att,
                    });
                  }}
                  isReplying={replyMutation.isPending}
                />
              </div>
            ) : (
              /* Search / Track Input Form */
              <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-center mb-6">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 mb-3">
                    <Search size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {isBn ? "টিকেট স্ট্যাটাস ট্র্যাক করুন" : "Track Ticket Status"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {isBn
                      ? "আপনার টিকেট আইডি ও যোগাযোগের ইমেইল লিখে তাৎক্ষণিকভাবে স্ট্যাটাস ও উত্তর চেক করুন।"
                      : "Enter your Ticket ID and submission email to track real-time resolution and replies."}
                  </p>
                </div>

                {trackError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{trackError}</span>
                  </div>
                )}

                <form onSubmit={handleTrackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "টিকেট আইডি" : "Ticket ID"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. #TKT-1001 or TKT-1001"
                      value={trackCode}
                      onChange={(e) => setTrackCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? "সাবমিট করা ইমেইল" : "Associated Email Address"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={trackEmail}
                      onChange={(e) => setTrackEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isTracking}
                    className="w-full bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-extrabold text-xs sm:text-sm py-2.5 rounded-xl transition shadow-md"
                  >
                    {isTracking ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={16} className="animate-spin" />
                        <span>{isBn ? "অনুসন্ধান করা হচ্ছে..." : "Searching Ticket..."}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search size={16} />
                        <span>{isBn ? "টিকেট অনুসন্ধান করুন" : "Find & Track Ticket"}</span>
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// =============================================================================
// TICKET CONVERSATION THREAD COMPONENT
// =============================================================================

interface TicketConversationProps {
  ticket: any;
  replies: any[];
  isBn: boolean;
  onReply: (message: string, attachmentUrl?: string) => void;
  isReplying: boolean;
}

function TicketConversationThread({
  ticket,
  replies,
  isBn,
  onReply,
  isReplying,
}: TicketConversationProps) {
  const [replyText, setReplyText] = useState("");
  const [replyFileBase64, setReplyFileBase64] = useState<string | null>(null);
  const [replyFileName, setReplyFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(replyText.trim(), replyFileBase64 || undefined);
    setReplyText("");
    setReplyFileBase64(null);
    setReplyFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBn ? "ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে" : "File size must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReplyFileBase64(reader.result as string);
      setReplyFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const renderBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">Open</span>;
      case "in_progress":
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">In Progress</span>;
      case "waiting_user":
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Waiting for You</span>;
      case "resolved":
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Resolved</span>;
      case "closed":
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Closed</span>;
      default:
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Ticket Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                {ticket.ticketCode}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {ticket.category}
              </span>
              {renderBadge(ticket.status)}
            </div>
            <h2 className="mt-1.5 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {ticket.subject}
            </h2>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
            <div className="text-[11px]">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>

        {/* User Info Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            {isBn ? "আবেদনকারী: " : "Submitted by: "}
            <span className="font-bold text-slate-700 dark:text-slate-300">{ticket.userName}</span> ({ticket.userEmail})
          </div>
          {ticket.assignedStaff && (
            <div className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
              <ShieldCheck size={14} />
              <span>{ticket.assignedStaff}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Stream */}
      <div className="space-y-3.5">
        {/* Initial User Message (Message #1) */}
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#081833] text-white font-bold text-xs shrink-0 dark:bg-sky-500 dark:text-slate-950">
            {ticket.userName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {ticket.userName} <span className="font-normal text-slate-400">({isBn ? "আপনি" : "You"})</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {ticket.message}
            </p>

            {ticket.attachmentUrl && (
              <div className="mt-3">
                <a
                  href={ticket.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-sky-600 hover:underline dark:border-slate-800 dark:bg-slate-950 dark:text-sky-400"
                >
                  <Paperclip size={13} />
                  <span>{isBn ? "সংযুক্ত ফাইল দেখুন" : "View Attached File"}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Replies List */}
        {replies.map((r: any) => {
          const isStaff = r.senderRole === "support" || r.senderRole === "admin";
          return (
            <div
              key={r.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 sm:p-5 transition-all ${
                isStaff
                  ? "border-sky-300 bg-gradient-to-r from-sky-50/70 to-white dark:border-sky-800 dark:from-sky-950/30 dark:to-slate-900 shadow-sm"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div
                className={`flex size-9 items-center justify-center rounded-full font-bold text-xs shrink-0 ${
                  isStaff
                    ? "bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950 ring-2 ring-sky-300 dark:ring-sky-700"
                    : "bg-[#081833] text-white dark:bg-slate-700"
                }`}
              >
                {isStaff ? <ShieldCheck size={18} /> : r.senderName?.[0]?.toUpperCase() || "U"}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {r.senderName}
                    </span>
                    {isStaff && (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        {isBn ? "সাপোর্ট টিম" : "Support Team"}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {r.message}
                </p>

                {r.attachmentUrl && (
                  <div className="mt-3">
                    <a
                      href={r.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-sky-600 hover:underline dark:border-slate-800 dark:bg-slate-950 dark:text-sky-400"
                    >
                      <Paperclip size={13} />
                      <span>{isBn ? "সংযুক্ত ফাইল দেখুন" : "View Attached File"}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Input Box */}
      {ticket.status === "closed" ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {isBn
            ? "এই টিকেটটি বন্ধ করা হয়েছে। নিচে মেসেজ লিখলে টিকেটটি পুনরায় সক্রিয় (Reopened) হবে।"
            : "This ticket is closed. Submitting a new message below will automatically reopen it."}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleReplySubmit} className="space-y-3">
          <textarea
            rows={3}
            placeholder={
              isBn
                ? "আপনার উত্তর বা অতিরিক্ত তথ্য এখানে লিখুন..."
                : "Type your reply or additional information here..."
            }
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {replyFileName ? (
                <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  <ImageIcon size={14} />
                  <span className="truncate max-w-[150px]">{replyFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyFileBase64(null);
                      setReplyFileName(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                >
                  <Paperclip size={13} />
                  <span>{isBn ? "ফাইল সংযুক্ত করুন" : "Attach File"}</span>
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={isReplying || !replyText.trim()}
              className="bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold text-xs"
            >
              {isReplying ? (
                <RefreshCw size={14} className="animate-spin mr-1.5" />
              ) : (
                <Send size={14} className="mr-1.5" />
              )}
              <span>{isBn ? "উত্তর পাঠান" : "Send Reply"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
