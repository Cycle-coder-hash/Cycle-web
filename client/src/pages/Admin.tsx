import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Copy,
  DollarSign,
  Download,
  FileCheck2,
  FileText,
  Filter,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  MessageSquare,
  Paperclip,
  Send,
  Ticket,
  Users,
  X,
  XCircle,
  Upload,
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  Award,
  Globe,
  Camera,
  Clock,
  Calendar,
  GraduationCap,
  Target,
  Zap,
  Activity,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BrandLogo } from "@/components/BrandLogo";
import { AnimatedRgbBorder } from "@/components/AnimatedRgbBorder";

type AdminTab = "overview" | "orders" | "students" | "ebooks" | "support" | "owner" | "settings" | "audit";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Filter & Search states
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [orderMethodFilter, setOrderMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "in_progress" | "waiting_user" | "resolved" | "closed">("all");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>("all");
  const [ticketSearch, setTicketSearch] = useState<string>("");
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<any | null>(null);
  const [staffReplyText, setStaffReplyText] = useState("");
  const [staffReplyStatus, setStaffReplyStatus] = useState<"open" | "in_progress" | "waiting_user" | "resolved" | "closed">("waiting_user");
  const [staffReplyAttachment, setStaffReplyAttachment] = useState<string | null>(null);
  const [staffReplyAttachmentName, setStaffReplyAttachmentName] = useState<string | null>(null);

  // Modals & form state
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [grantAccessModalUser, setGrantAccessModalUser] = useState<any | null>(null);
  const [grantScope, setGrantScope] = useState("bundle:3 (Master Full Bundle)");
  const [selectedBundleId, setSelectedBundleId] = useState<number>(3);
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Settings form state
  const [bkashNumber, setBkashNumber] = useState("01961079326");
  const [nagadNumber, setNagadNumber] = useState("01961079326");
  const [rocketNumber, setRocketNumber] = useState("01961079326");
  const [announcement, setAnnouncement] = useState("Special Eid Discount 50% Active on All Institutional Packages!");

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const { data: orders, refetch: refetchOrders } = trpc.admin.orders.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const { data: students, refetch: refetchStudents } = trpc.admin.users.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const { data: tickets, refetch: refetchTickets } = trpc.admin.tickets.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const { data: auditLogs, refetch: refetchAudit } = trpc.admin.auditLogs.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });
  const {
    data: ticketModalData,
    refetch: refetchTicketModalData,
    isLoading: isLoadingTicketModalData,
  } = trpc.admin.ticketDetails.useQuery(
    { ticketId: (selectedTicketForModal?.id as number) || 0 },
    { enabled: !!selectedTicketForModal?.id }
  );

  // Mutations
  const approveMutation = trpc.admin.approveOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      refetchAudit();
      setActionSuccess("Order approved successfully! Entitlement granted & notification sent.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const rejectMutation = trpc.admin.rejectOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      refetchAudit();
      setRejectModalOrder(null);
      setRejectReason("");
      setActionSuccess("Order rejected & customer notified.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const updateRoleMutation = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      refetchStudents();
      setActionSuccess("User role updated successfully.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const grantAccessMutation = trpc.admin.grantAccess.useMutation({
    onSuccess: () => {
      refetchStudents();
      refetchOrders();
      setGrantAccessModalUser(null);
      setActionSuccess("Access entitlement granted to student!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const updateTicketMutation = trpc.admin.updateTicket.useMutation({
    onSuccess: () => {
      refetchTickets();
      refetchStats();
      if (selectedTicketForModal) refetchTicketModalData();
      setActionSuccess("Ticket status updated.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const staffReplyMutation = trpc.admin.replyTicket.useMutation({
    onSuccess: () => {
      refetchTickets();
      refetchStats();
      refetchTicketModalData();
      setStaffReplyText("");
      setStaffReplyAttachment(null);
      setStaffReplyAttachmentName(null);
      setActionSuccess("Staff reply sent and ticket status updated!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrxId(text);
    setTimeout(() => setCopiedTrxId(null), 2500);
  };

  // eBook queries and mutations
  const { data: ebooks, refetch: refetchEbooks, isLoading: isLoadingEbooks } = trpc.admin.freeEbooks.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });

  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<any | null>(null);
  const [deleteConfirmEbookId, setDeleteConfirmEbookId] = useState<number | null>(null);
  const [ebookSearch, setEbookSearch] = useState("");
  const [ebookCategoryFilter, setEbookCategoryFilter] = useState("all");

  const [ebookForm, setEbookForm] = useState({
    titleEn: "",
    titleBn: "",
    subtitleEn: "",
    subtitleBn: "",
    category: "CHART ANALYSIS",
    pages: 15,
    keyConceptsText: "",
    fileUrl: null as string | null,
    fileName: null as string | null,
    fileSize: null as string | null,
    isPublished: true,
  });

  const resetEbookForm = () => {
    setEditingEbook(null);
    setEbookForm({
      titleEn: "",
      titleBn: "",
      subtitleEn: "",
      subtitleBn: "",
      category: "CHART ANALYSIS",
      pages: 15,
      keyConceptsText: "",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      isPublished: true,
    });
  };

  const openAddEbookModal = () => {
    resetEbookForm();
    setIsEbookModalOpen(true);
  };

  const openEditEbookModal = (item: any) => {
    setEditingEbook(item);
    setEbookForm({
      titleEn: item.titleEn || "",
      titleBn: item.titleBn || "",
      subtitleEn: item.subtitleEn || "",
      subtitleBn: item.subtitleBn || "",
      category: item.category || "CHART ANALYSIS",
      pages: item.pages || 15,
      keyConceptsText: Array.isArray(item.keyConcepts) ? item.keyConcepts.join("\n") : "",
      fileUrl: item.fileUrl || null,
      fileName: item.fileName || null,
      fileSize: item.fileSize || null,
      isPublished: item.isPublished !== false,
    });
    setIsEbookModalOpen(true);
  };

  const createEbookMutation = trpc.admin.createFreeEbook.useMutation({
    onSuccess: () => {
      refetchEbooks();
      setIsEbookModalOpen(false);
      resetEbookForm();
      setActionSuccess("Free eBook PDF added successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to create eBook");
    },
  });

  const updateEbookMutation = trpc.admin.updateFreeEbook.useMutation({
    onSuccess: () => {
      refetchEbooks();
      setIsEbookModalOpen(false);
      resetEbookForm();
      setActionSuccess("Free eBook PDF updated successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update eBook");
    },
  });

  const deleteEbookMutation = trpc.admin.deleteFreeEbook.useMutation({
    onSuccess: () => {
      refetchEbooks();
      setDeleteConfirmEbookId(null);
      setActionSuccess("Free eBook PDF deleted successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to delete eBook");
    },
  });

  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please upload a valid PDF file (.pdf)");
      return;
    }
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const reader = new FileReader();
    reader.onload = () => {
      setEbookForm((prev) => ({
        ...prev,
        fileUrl: reader.result as string,
        fileName: file.name,
        fileSize: sizeInMb,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEbook = (e: React.FormEvent) => {
    e.preventDefault();
    const keyConcepts = ebookForm.keyConceptsText
      .split("\n")
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      titleEn: ebookForm.titleEn.trim(),
      titleBn: ebookForm.titleBn.trim() || undefined,
      subtitleEn: ebookForm.subtitleEn.trim(),
      subtitleBn: ebookForm.subtitleBn.trim() || undefined,
      category: ebookForm.category.trim(),
      pages: Number(ebookForm.pages) || 15,
      keyConcepts: keyConcepts.length ? keyConcepts : undefined,
      fileUrl: ebookForm.fileUrl,
      fileName: ebookForm.fileName,
      fileSize: ebookForm.fileSize,
      isPublished: ebookForm.isPublished,
    };

    if (editingEbook) {
      updateEbookMutation.mutate({
        id: editingEbook.id,
        ...payload,
      });
    } else {
      createEbookMutation.mutate(payload);
    }
  };

  // Owner Profile query, mutation & form state
  const {
    data: ownerProfileData,
    refetch: refetchOwnerProfile,
    isLoading: isLoadingOwnerProfile,
  } = trpc.admin.ownerProfile.useQuery(undefined, {
    enabled: user?.role === "admin" || user?.role === "support",
  });

  const [ownerForm, setOwnerForm] = useState({
    name: "",
    role: "",
    roleBn: "",
    bioEn: "",
    bioBn: "",
    detailsEn: "",
    detailsBn: "",
    photoUrl: "",
    experienceYears: "6+ Years",
    studentsCount: "1,500+",
    tradingStyle: "Institutional Order Flow, Liquidity & (SMC)",
    signatureQuoteEn: "",
    signatureQuoteBn: "",
    telegram: "",
    youtube: "",
    facebook: "",
    twitter: "",
    email: "",
    showExperienceCard: false,
    experienceLabel: "Market Experience",
    experienceIcon: "clock",
    showMentoredCard: false,
    mentoredLabel: "Traders Mentored",
    mentoredIcon: "users",
    showMethodologyCard: true,
    methodologyLabel: "Core Methodology",
    methodologyIcon: "award",
    showDetailsParagraph: false,
  });
  const [ownerFormInitialized, setOwnerFormInitialized] = useState(false);
  const [ownerPreviewLang, setOwnerPreviewLang] = useState<"en" | "bn">("en");

  useEffect(() => {
    if (ownerProfileData && !ownerFormInitialized) {
      setOwnerForm({
        name: ownerProfileData.name || "",
        role: ownerProfileData.role || "",
        roleBn: ownerProfileData.roleBn || "",
        bioEn: ownerProfileData.bioEn || "",
        bioBn: ownerProfileData.bioBn || "",
        detailsEn: ownerProfileData.detailsEn || "",
        detailsBn: ownerProfileData.detailsBn || "",
        photoUrl: ownerProfileData.photoUrl || "",
        experienceYears: ownerProfileData.experienceYears || "6+ Years",
        studentsCount: ownerProfileData.studentsCount || "1,500+",
        tradingStyle: ownerProfileData.tradingStyle || "Institutional Order Flow, Liquidity & (SMC)",
        signatureQuoteEn: ownerProfileData.signatureQuoteEn || "",
        signatureQuoteBn: ownerProfileData.signatureQuoteBn || "",
        telegram: ownerProfileData.telegram || "",
        youtube: ownerProfileData.youtube || "",
        facebook: ownerProfileData.facebook || "",
        twitter: ownerProfileData.twitter || "",
        email: ownerProfileData.email || "",
        showExperienceCard: !!ownerProfileData.showExperienceCard,
        experienceLabel: ownerProfileData.experienceLabel || "Market Experience",
        experienceIcon: ownerProfileData.experienceIcon || "clock",
        showMentoredCard: !!ownerProfileData.showMentoredCard,
        mentoredLabel: ownerProfileData.mentoredLabel || "Traders Mentored",
        mentoredIcon: ownerProfileData.mentoredIcon || "users",
        showMethodologyCard: ownerProfileData.showMethodologyCard !== false,
        methodologyLabel: ownerProfileData.methodologyLabel || "Core Methodology",
        methodologyIcon: ownerProfileData.methodologyIcon || "award",
        showDetailsParagraph: !!ownerProfileData.showDetailsParagraph,
      });
      setOwnerFormInitialized(true);
    }
  }, [ownerProfileData, ownerFormInitialized]);

  const updateOwnerMutation = trpc.admin.updateOwnerProfile.useMutation({
    onSuccess: () => {
      refetchOwnerProfile();
      setActionSuccess("Owner Profile updated successfully! Changes are live on the Home page.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update Owner Profile");
    },
  });

  const renderOwnerStatIcon = (iconName?: string, className: string = "size-4") => {
    switch (iconName) {
      case "clock":
        return <Clock className={className} />;
      case "calendar":
        return <Calendar className={className} />;
      case "trending":
      case "trending-up":
        return <TrendingUp className={className} />;
      case "shield":
        return <ShieldCheck className={className} />;
      case "users":
        return <Users className={className} />;
      case "userCheck":
      case "user-check":
        return <UserCheck className={className} />;
      case "graduation":
      case "graduation-cap":
        return <GraduationCap className={className} />;
      case "sparkles":
        return <Sparkles className={className} />;
      case "target":
        return <Target className={className} />;
      case "zap":
        return <Zap className={className} />;
      case "activity":
        return <Activity className={className} />;
      case "award":
      default:
        return <Award className={className} />;
    }
  };

  const handleOwnerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setOwnerForm((prev) => ({
        ...prev,
        photoUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOwnerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerForm.name.trim()) {
      alert("Please enter the owner's full name.");
      return;
    }
    if (!ownerForm.role.trim()) {
      alert("Please enter the owner's role / title.");
      return;
    }
    if (!ownerForm.bioEn.trim()) {
      alert("Please enter the owner's biography in English.");
      return;
    }
    if (!ownerForm.photoUrl.trim()) {
      alert("Please upload or provide an owner profile photo.");
      return;
    }

    updateOwnerMutation.mutate({
      name: ownerForm.name.trim(),
      role: ownerForm.role.trim(),
      roleBn: ownerForm.roleBn?.trim() || undefined,
      bioEn: ownerForm.bioEn.trim(),
      bioBn: ownerForm.bioBn?.trim() || undefined,
      detailsEn: ownerForm.detailsEn?.trim() || undefined,
      detailsBn: ownerForm.detailsBn?.trim() || undefined,
      photoUrl: ownerForm.photoUrl.trim(),
      experienceYears: ownerForm.experienceYears?.trim() || undefined,
      studentsCount: ownerForm.studentsCount?.trim() || undefined,
      tradingStyle: ownerForm.tradingStyle?.trim() || undefined,
      signatureQuoteEn: ownerForm.signatureQuoteEn?.trim() || undefined,
      signatureQuoteBn: ownerForm.signatureQuoteBn?.trim() || undefined,
      telegram: ownerForm.telegram?.trim() || undefined,
      youtube: ownerForm.youtube?.trim() || undefined,
      facebook: ownerForm.facebook?.trim() || undefined,
      twitter: ownerForm.twitter?.trim() || undefined,
      email: ownerForm.email?.trim() || undefined,
      showExperienceCard: ownerForm.showExperienceCard,
      experienceLabel: ownerForm.experienceLabel?.trim() || "Market Experience",
      experienceIcon: ownerForm.experienceIcon || "clock",
      showMentoredCard: ownerForm.showMentoredCard,
      mentoredLabel: ownerForm.mentoredLabel?.trim() || "Traders Mentored",
      mentoredIcon: ownerForm.mentoredIcon || "users",
      showMethodologyCard: ownerForm.showMethodologyCard,
      methodologyLabel: ownerForm.methodologyLabel?.trim() || "Core Methodology",
      methodologyIcon: ownerForm.methodologyIcon || "award",
      showDetailsParagraph: ownerForm.showDetailsParagraph,
    });
  };

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070e1b] text-white">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo size={64} className="animate-pulse" />
          <div className="text-xs font-extrabold uppercase tracking-widest text-sky-400">Loading Operations Workspace...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070e1b] p-6 text-white">
        <div className="max-w-md text-center">
          <BrandLogo size={96} className="mx-auto" />
          <Lock className="mx-auto mt-6 text-sky-400" size={36} />
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">Admin & Support Access Required</h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Please sign in with your administrative or support account to access payment verification, student records, and system operations.
          </p>
          <Button onClick={() => startLogin()} className="mt-6 w-full bg-sky-500 font-extrabold text-slate-950 hover:bg-sky-400">
            Sign In with Admin Account
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "support") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] p-6 text-center dark:bg-[#070e1b]">
        <div className="max-w-md">
          <ShieldAlert className="mx-auto text-rose-500" size={48} />
          <h1 className="mt-4 text-2xl font-black">Restricted Operations Area</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Your current account (<b>{user.email}</b>) has role <b>'{user.role}'</b>. Only staff members with <b>'admin'</b> or <b>'support'</b> privileges can access this panel.
          </p>
          <Link href="/dashboard">
            <Button className="mt-6 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950">
              Return to Student Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filtered Orders
  const filteredOrders = (orders || []).filter((o: any) => {
    if (orderFilter !== "all" && o.orderStatus !== orderFilter) return false;
    if (orderMethodFilter !== "all" && o.paymentMethod !== orderMethodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTrx = o.transactionId?.toLowerCase().includes(q);
      const matchId = String(o.id).includes(q);
      const matchAmount = String(o.amount).includes(q);
      return matchTrx || matchId || matchAmount;
    }
    return true;
  });

  // Filtered Students
  const filteredStudents = (students || []).filter((s: any) => {
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.includes(q);
    }
    return true;
  });

  // Filtered Tickets
  const filteredTickets = (tickets || []).filter((t: any) => {
    if (ticketFilter !== "all" && t.status !== ticketFilter) return false;
    if (ticketCategoryFilter !== "all" && t.category !== ticketCategoryFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      return (
        t.ticketCode?.toLowerCase().includes(q) ||
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered eBooks
  const filteredEbooks = (ebooks || []).filter((eb: any) => {
    if (ebookCategoryFilter !== "all" && eb.category !== ebookCategoryFilter) return false;
    if (ebookSearch.trim()) {
      const q = ebookSearch.toLowerCase();
      return (
        eb.titleEn?.toLowerCase().includes(q) ||
        eb.titleBn?.toLowerCase().includes(q) ||
        eb.subtitleEn?.toLowerCase().includes(q) ||
        eb.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingOrdersList = (orders || []).filter((o: any) => o.orderStatus === "pending");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#070e1b] dark:text-slate-100 transition-colors duration-300">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#070e1b]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0">
              <BrandLogo size={40} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-[#0a192f] dark:text-white uppercase">
                  Cycle of Chart
                </span>
                <span className="rounded-full bg-[#0284c7]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-400">
                  {user.role.toUpperCase()} CONSOLE
                </span>
              </div>
              <div className="text-[10px] font-bold text-slate-400">Trading Reality Operations & Access Control</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700">
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">Student Dashboard</span>
                <span className="sm:hidden">Portal</span>
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" variant="ghost" className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400">
                Public Site →
              </Button>
            </Link>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-5 lg:px-8">
          <div className="flex gap-1 border-b-2 border-transparent pb-0">
            {[
              { id: "overview", label: "Executive KPI", icon: LayoutDashboard, badge: undefined },
              { id: "orders", label: "Payment Verification", icon: FileCheck2, badge: pendingOrdersList.length ? `${pendingOrdersList.length}` : undefined },
              { id: "students", label: "Students & Access", icon: Users, badge: students?.length ? `${students.length}` : undefined },
              { id: "ebooks", label: "Free eBooks & PDFs", icon: BookOpen, badge: ebooks?.length ? `${ebooks.length}` : undefined },
              { id: "support", label: "Support Tickets", icon: ShieldCheck, badge: tickets?.filter((t: any) => t.status === "open").length ? `${tickets.filter((t: any) => t.status === "open").length}` : undefined },
              { id: "owner", label: "Owner Profile", icon: UserCheck, badge: undefined },
              { id: "settings", label: "Gateways & Notice", icon: KeyRound, badge: undefined },
              { id: "audit", label: "Audit Trail", icon: Shield, badge: undefined },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-extrabold transition-all ${
                    isActive
                      ? "border-[#0284c7] text-[#0284c7] dark:border-sky-400 dark:text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-black text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Success Toast Banner */}
        {actionSuccess && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
              <X size={15} />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE KPI & ANALYTICS OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header Quote / Status */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Executive Performance Overview</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Real-time revenue metrics, pending payment verification volume, and student engagement statistics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    refetchStats();
                    refetchOrders();
                    refetchStudents();
                    refetchTickets();
                  }}
                  variant="outline"
                  className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
                >
                  <RefreshCw size={13} />
                  <span>Refresh Real-Time Data</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-gradient-to-br from-[#081833] to-[#0f2c59] p-6 text-white shadow-xl shadow-[#081833]/15">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#38bdf8]">Verified Revenue</span>
                  <DollarSign size={20} className="text-[#38bdf8]" />
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-black">
                  ৳{stats?.totalRevenue?.toLocaleString() || "0"}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-300 flex items-center gap-1">
                  <TrendingUp size={13} className="text-emerald-400" />
                  <span>{stats?.approvedOrdersCount || 0} approved orders</span>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Pending Volume</span>
                  <Clock3 size={20} className="text-amber-500" />
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-black text-amber-900 dark:text-amber-200">
                  ৳{stats?.pendingRevenue?.toLocaleString() || "0"}
                </div>
                <div className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {stats?.pendingOrdersCount || 0} manual orders awaiting review
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Total Students</span>
                  <Users size={20} className="text-[#0284c7] dark:text-sky-400" />
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-black">
                  {stats?.totalStudents || 0}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Registered trading accounts
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Support Desk</span>
                  <ShieldCheck size={20} className="text-purple-500" />
                </div>
                <div className="mt-4 text-3xl sm:text-4xl font-black">
                  {stats?.openTicketsCount || 0}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Open student tickets ({stats?.resolvedTicketsCount || 0} resolved)
                </div>
              </div>
            </div>

            {/* Quick Pending Review Banner */}
            {pendingOrdersList.length > 0 && (
              <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 shadow-md dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h3 className="font-extrabold text-base text-amber-950 dark:text-amber-100">
                        {pendingOrdersList.length} Orders Awaiting Verification
                      </h3>
                      <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                        Immediate manual review unlocks student learning access instantly.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("orders")}
                    size="sm"
                    className="shrink-0 bg-[#081833] font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                  >
                    Open Payment Queue →
                  </Button>
                </div>
              </div>
            )}

            {/* Two Column Section: Recent Orders & Recent Student Signups */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h3 className="font-extrabold text-base">Recent Order Submissions</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")} className="text-xs font-bold text-[#0284c7] dark:text-sky-400">
                    View All →
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {(orders || []).slice(0, 4).map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
                      <div>
                        <div className="font-extrabold text-sm">Order #{o.id} · <span className="uppercase text-[#0284c7] dark:text-sky-400">{o.paymentMethod}</span></div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">Trx: {o.transactionId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm">৳{o.amount}</div>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase mt-1 ${
                          o.orderStatus === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : o.orderStatus === "rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        }`}>
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <h3 className="font-extrabold text-base">Registered Students</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("students")} className="text-xs font-bold text-[#0284c7] dark:text-sky-400">
                    View All →
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {(students || []).slice(0, 4).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                          {s.name ? s.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-extrabold">{s.name || "Trader"}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase dark:bg-slate-700">
                        {s.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MANUAL PAYMENT VERIFICATION QUEUE */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Manual Payment Verification Queue</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Verify bKash, Nagad, and Rocket Transaction IDs before unlocking digital course materials.
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Transaction ID, Order #, or Amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                      orderFilter === st
                        ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Gateway Filter */}
              <select
                value={orderMethodFilter}
                onChange={(e) => setOrderMethodFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">All Gateways</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="free">Free Access</option>
              </select>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-3.5">
              {filteredOrders.length ? (
                filteredOrders.map((o: any) => {
                  const isPending = o.orderStatus === "pending";
                  const isApproved = o.orderStatus === "approved";
                  const isRejected = o.orderStatus === "rejected";

                  return (
                    <div
                      key={o.id}
                      className={`rounded-3xl border p-5 sm:p-6 transition-all ${
                        isPending
                          ? "border-amber-300 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20 shadow-sm"
                          : isApproved
                          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                          : "border-rose-200 bg-rose-50/20 dark:border-rose-900/30 dark:bg-slate-900 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-base font-extrabold">Order #{o.id}</span>
                            <span
                              className={`rounded-full px-3 py-0.5 text-[11px] font-black uppercase ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                  : isRejected
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
                              }`}
                            >
                              {o.orderStatus}
                            </span>
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {o.paymentMethod}
                            </span>
                          </div>

                          {/* TrxID with 1-Click Copy */}
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Transaction ID:</span>
                            <code className="rounded-lg bg-slate-200/80 px-2.5 py-1 font-mono text-xs font-black text-slate-900 dark:bg-slate-800 dark:text-sky-400">
                              {o.transactionId}
                            </code>
                            <button
                              onClick={() => copyToClipboard(o.transactionId)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
                              title="Copy TrxID"
                            >
                              {copiedTrxId === o.transactionId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>

                          <div className="mt-2 text-xs text-slate-500">
                            Submitted on: {new Date(o.createdAt).toLocaleString()} · Student #{o.customerId}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 dark:border-slate-800">
                          <div className="text-left md:text-right">
                            <div className="text-2xl font-black">৳{o.amount}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">BDT Total</div>
                          </div>

                          {isPending && (user.role === "admin" || user.role === "support") && (
                            <div className="flex items-center gap-2">
                              <Button
                                disabled={approveMutation.isPending}
                                onClick={() => approveMutation.mutate({ orderId: o.id })}
                                size="sm"
                                className="bg-emerald-600 font-bold text-white hover:bg-emerald-700 shadow-md"
                              >
                                <Check size={15} className="mr-1" />
                                <span>Approve & Unlock</span>
                              </Button>

                              <Button
                                disabled={rejectMutation.isPending}
                                onClick={() => setRejectModalOrder(o)}
                                size="sm"
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                              >
                                <X size={15} className="mr-1" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          )}

                          {isApproved && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={16} />
                              <span>Verified & Unlocked</span>
                            </div>
                          )}

                          {isRejected && (
                            <div className="text-xs text-rose-600 dark:text-rose-400">
                              <span className="font-bold">Reason:</span> {o.rejectionReason || "Proof unverified"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <FileCheck2 size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
                  <h3 className="text-base font-bold">No orders found</h3>
                  <p className="mt-1 text-xs text-slate-400">Adjust your search or filter settings to view more transactions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STUDENTS & MANUAL ACCESS CONTROL */}
        {/* ========================================================================= */}
        {activeTab === "students" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Students & Access Entitlements</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  View student profiles, assign administrative roles, and manually grant or revoke digital packages.
                </p>
              </div>
            </div>

            {/* Student Search */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="relative">
                <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or phone..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Students Table / Grid */}
            <div className="space-y-3">
              {filteredStudents.length ? (
                filteredStudents.map((s: any) => (
                  <div key={s.id} className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
                    <div className="flex items-start gap-3.5">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950 shrink-0">
                        {s.name ? s.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm">{s.name || "Student"}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                            s.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" : s.role === "support" ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {s.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {s.email} {s.phone ? `· ${s.phone}` : ""}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          Joined: {new Date(s.createdAt).toLocaleDateString()} · Orders: {s.ordersCount || 0}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 dark:border-slate-800">
                      <Button
                        size="sm"
                        onClick={() => setGrantAccessModalUser(s)}
                        className="bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                      >
                        <UserPlus size={13} className="mr-1.5" />
                        <span>Grant Access</span>
                      </Button>

                      {user.role === "admin" && (
                        <select
                          value={s.role}
                          onChange={(e) => updateRoleMutation.mutate({ userId: s.id, role: e.target.value as any })}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="user">Role: User</option>
                          <option value="support">Role: Support</option>
                          <option value="admin">Role: Admin</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <Users size={36} className="mx-auto text-slate-400 mb-2" />
                  <div className="font-bold">No students found</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: FREE EBOOKS & INSTITUTIONAL PDFS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "ebooks" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Add Button */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Free eBooks & PDFs Management</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Manage the institutional guides and PDFs in the Free eBook Package. Upload custom PDF files, edit content, and toggle publishing.
                </p>
              </div>
              <Button
                onClick={openAddEbookModal}
                className="gap-2 bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Add New eBook / PDF</span>
              </Button>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total eBooks</div>
                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {ebooks?.length || 0}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Published (Live)</div>
                <div className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-300">
                  {(ebooks || []).filter((e: any) => e.isPublished).length}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Drafts (Hidden)</div>
                <div className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-300">
                  {(ebooks || []).filter((e: any) => !e.isPublished).length}
                </div>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Custom PDF Uploads</div>
                <div className="mt-1 text-2xl font-black text-sky-800 dark:text-sky-300">
                  {(ebooks || []).filter((e: any) => !!e.fileUrl).length}
                </div>
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="relative flex-1">
                <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search eBooks by title, category, or concepts..."
                  value={ebookSearch}
                  onChange={(e) => setEbookSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400 shrink-0" />
                <select
                  value={ebookCategoryFilter}
                  onChange={(e) => setEbookCategoryFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="CHART ANALYSIS">CHART ANALYSIS</option>
                  <option value="LIQUIDITY & SMC">LIQUIDITY & SMC</option>
                  <option value="ORDER FLOW">ORDER FLOW</option>
                  <option value="ADVANCED PRICE ACTION">ADVANCED PRICE ACTION</option>
                  <option value="RISK MANAGEMENT">RISK MANAGEMENT</option>
                  <option value="MARKET PSYCHOLOGY">MARKET PSYCHOLOGY</option>
                </select>
              </div>
            </div>

            {/* eBooks Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoadingEbooks ? (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                  <span className="text-xs font-bold">Loading eBook library...</span>
                </div>
              ) : filteredEbooks.length ? (
                filteredEbooks.map((eb: any) => (
                  <div
                    key={eb.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          {eb.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400">
                            {eb.pages || 15} Pages
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              eb.isPublished
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {eb.isPublished ? "Live" : "Draft"}
                          </span>
                        </div>
                      </div>

                      {/* Titles */}
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {eb.titleEn}
                      </h3>
                      {eb.titleBn && (
                        <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 font-bangla">
                          {eb.titleBn}
                        </p>
                      )}

                      {/* Subtitle */}
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {eb.subtitleEn}
                      </p>

                      {/* Key Concepts Chips */}
                      {Array.isArray(eb.keyConcepts) && eb.keyConcepts.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {eb.keyConcepts.slice(0, 3).map((concept: string, cIdx: number) => (
                            <span
                              key={cIdx}
                              className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            >
                              • {concept}
                            </span>
                          ))}
                          {eb.keyConcepts.length > 3 && (
                            <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-slate-800">
                              +{eb.keyConcepts.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Attachment Status */}
                      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                        {eb.fileUrl ? (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                              <Paperclip size={13} className="text-sky-500 shrink-0" />
                              <span className="font-bold truncate">{eb.fileName || "Uploaded PDF"}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">({eb.fileSize || "Custom"})</span>
                            </div>
                            <a
                              href={eb.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:text-sky-700 dark:text-sky-400 ml-2 shrink-0"
                              title="Preview PDF"
                            >
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <Sparkles size={13} className="text-amber-500 shrink-0" />
                            <span>Institutional PDF Generator (Active)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateEbookMutation.mutate({
                            id: eb.id,
                            isPublished: !eb.isPublished,
                          })
                        }
                        className="gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700"
                      >
                        {eb.isPublished ? (
                          <>
                            <EyeOff size={13} className="text-amber-500" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye size={13} className="text-emerald-500" />
                            <span>Publish</span>
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditEbookModal(eb)}
                          className="gap-1 text-xs font-bold border-slate-200 dark:border-slate-700"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirmEbookId(eb.id)}
                          className="gap-1 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <BookOpen size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
                  <h3 className="text-base font-bold">No eBooks found</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Try adjusting your search or add a new institutional PDF resource.
                  </p>
                  <Button
                    onClick={openAddEbookModal}
                    size="sm"
                    className="mt-4 bg-[#0284c7] font-bold text-white hover:bg-sky-600"
                  >
                    <Plus size={14} className="mr-1" />
                    <span>Add First eBook</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SUPPORT TICKET DESK */}
        {/* ========================================================================= */}
        {activeTab === "support" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Student Support Desk</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Review, assign, and resolve student inquiries regarding courses, payments, eBooks, and access.
                </p>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total Tickets", val: (tickets || []).length, color: "text-slate-900 dark:text-white" },
                { label: "Open", val: (tickets || []).filter((t: any) => t.status === "open").length, color: "text-sky-600 dark:text-sky-400" },
                { label: "In Progress", val: (tickets || []).filter((t: any) => t.status === "in_progress").length, color: "text-amber-600 dark:text-amber-400" },
                { label: "Waiting for User", val: (tickets || []).filter((t: any) => t.status === "waiting_user").length, color: "text-purple-600 dark:text-purple-400" },
                { label: "Resolved", val: (tickets || []).filter((t: any) => t.status === "resolved").length, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Closed", val: (tickets || []).filter((t: any) => t.status === "closed").length, color: "text-slate-500" },
              ].map((m, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{m.label}</div>
                  <div className={`mt-1 text-xl font-black ${m.color}`}>{m.val}</div>
                </div>
              ))}
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "open", label: "Open" },
                  { id: "in_progress", label: "In Progress" },
                  { id: "waiting_user", label: "Waiting for User" },
                  { id: "resolved", label: "Resolved" },
                  { id: "closed", label: "Closed" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setTicketFilter(st.id as any)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                      ticketFilter === st.id
                        ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950 shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Category & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <select
                  value={ticketCategoryFilter}
                  onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="all">All Categories</option>
                  <option value="Course Problem">Course Problem</option>
                  <option value="Payment Problem">Payment Problem</option>
                  <option value="Account Problem">Account Problem</option>
                  <option value="Technical Problem">Technical Problem</option>
                  <option value="eBook Problem">eBook Problem</option>
                  <option value="Other">Other</option>
                </select>

                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search #TKT, name, email..."
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Tickets Grid / List */}
            <div className="space-y-3">
              {filteredTickets.length ? (
                filteredTickets.map((t: any) => (
                  <div
                    key={t.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition hover:border-sky-300 dark:hover:border-sky-800"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                            {t.ticketCode || `#TKT-${t.id}`}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {t.category || "General"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              t.status === "resolved"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : t.status === "in_progress"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                : t.status === "waiting_user"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
                                : t.status === "closed"
                                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                : "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400"
                            }`}
                          >
                            {t.status.replace("_", " ")}
                          </span>
                        </div>

                        <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                          {t.subject}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{t.userName}</span>
                          <span>•</span>
                          <span>{t.userEmail}</span>
                          <span>•</span>
                          <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                          {t.assignedStaff && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-sky-600 dark:text-sky-400">Assigned: {t.assignedStaff}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedTicketForModal(t)}
                          className="bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                        >
                          <MessageSquare size={13} className="mr-1.5" />
                          <span>View & Reply</span>
                        </Button>

                        <select
                          value={t.status}
                          onChange={(e) =>
                            updateTicketMutation.mutate({
                              ticketId: t.id,
                              status: e.target.value as any,
                              assignedStaff: user.name || "Staff",
                            })
                          }
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="open">Status: Open</option>
                          <option value="in_progress">Status: In Progress</option>
                          <option value="waiting_user">Status: Waiting for User</option>
                          <option value="resolved">Status: Resolved</option>
                          <option value="closed">Status: Closed</option>
                        </select>
                      </div>
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl line-clamp-2">
                      {t.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  <ShieldCheck size={36} className="mx-auto text-slate-400 mb-2" />
                  <div className="font-bold">No tickets found</div>
                  <div className="text-xs text-slate-400 mt-1">Try adjusting the status or category filter.</div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* STAFF CONVERSATION THREAD MODAL */}
            {/* ========================================================================= */}
            {selectedTicketForModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
                onClick={() => setSelectedTicketForModal(null)}
              >
                <div
                  className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                          {selectedTicketForModal.ticketCode || `#TKT-${selectedTicketForModal.id}`}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {selectedTicketForModal.category || "General"}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                        {selectedTicketForModal.subject}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Student: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTicketForModal.userName}</span> ({selectedTicketForModal.userEmail})
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTicketForModal(null)}
                      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Scrollable Conversation Stream */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Original Student Issue */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedTicketForModal.userName} (Original Inquiry)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(selectedTicketForModal.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {selectedTicketForModal.message}
                      </p>
                      {selectedTicketForModal.attachmentUrl && (
                        <div className="mt-2.5">
                          <a
                            href={selectedTicketForModal.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:underline dark:text-sky-400"
                          >
                            <Paperclip size={13} /> View Attached Screenshot / File
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Replies Stream */}
                    {isLoadingTicketModalData ? (
                      <div className="flex items-center justify-center p-8 text-slate-400">
                        <RefreshCw size={20} className="animate-spin mr-2" />
                        <span>Loading conversation...</span>
                      </div>
                    ) : (ticketModalData?.replies || []).map((r: any) => {
                      const isStaff = r.senderRole === "support" || r.senderRole === "admin";
                      return (
                        <div
                          key={r.id}
                          className={`rounded-2xl border p-4 ${
                            isStaff
                              ? "border-sky-300 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/25"
                              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{r.senderName}</span>
                              {isStaff && (
                                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                  Support Team
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(r.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {r.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Staff Reply Box */}
                  <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!staffReplyText.trim()) return;
                        staffReplyMutation.mutate({
                          ticketId: selectedTicketForModal.id,
                          message: staffReplyText.trim(),
                          status: staffReplyStatus,
                        });
                      }}
                      className="space-y-3"
                    >
                      <textarea
                        rows={3}
                        required
                        placeholder="Write support response to student..."
                        value={staffReplyText}
                        onChange={(e) => setStaffReplyText(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <label className="text-xs font-bold text-slate-500 shrink-0">Status after reply:</label>
                          <select
                            value={staffReplyStatus}
                            onChange={(e) => setStaffReplyStatus(e.target.value as any)}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-900"
                          >
                            <option value="waiting_user">Waiting for User</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Mark Resolved</option>
                            <option value="closed">Close Ticket</option>
                            <option value="open">Keep Open</option>
                          </select>
                        </div>

                        <Button
                          type="submit"
                          disabled={staffReplyMutation.isPending || !staffReplyText.trim()}
                          className="w-full sm:w-auto bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold text-xs"
                        >
                          {staffReplyMutation.isPending ? (
                            <RefreshCw size={13} className="animate-spin mr-1.5" />
                          ) : (
                            <Send size={13} className="mr-1.5" />
                          )}
                          <span>Send Reply</span>
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: OWNER PROFILE CMS */}
        {/* ========================================================================= */}
        {activeTab === "owner" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header & Controls */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight">Owner Profile & Founder CMS</h2>
                  <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Live on Home Page
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Manage the founder's biography, credentials, photo, and institutional trading profile displayed on the public website.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    refetchOwnerProfile();
                    if (ownerProfileData) {
                      setOwnerForm({
                        name: ownerProfileData.name || "",
                        role: ownerProfileData.role || "",
                        roleBn: ownerProfileData.roleBn || "",
                        bioEn: ownerProfileData.bioEn || "",
                        bioBn: ownerProfileData.bioBn || "",
                        detailsEn: ownerProfileData.detailsEn || "",
                        detailsBn: ownerProfileData.detailsBn || "",
                        photoUrl: ownerProfileData.photoUrl || "",
                        experienceYears: ownerProfileData.experienceYears || "6+ Years",
                        studentsCount: ownerProfileData.studentsCount || "1,500+",
                        tradingStyle: ownerProfileData.tradingStyle || "Institutional Order Flow, Liquidity & (SMC)",
                        signatureQuoteEn: ownerProfileData.signatureQuoteEn || "",
                        signatureQuoteBn: ownerProfileData.signatureQuoteBn || "",
                        telegram: ownerProfileData.telegram || "",
                        youtube: ownerProfileData.youtube || "",
                        facebook: ownerProfileData.facebook || "",
                        twitter: ownerProfileData.twitter || "",
                        email: ownerProfileData.email || "",
                        showExperienceCard: !!ownerProfileData.showExperienceCard,
                        experienceLabel: ownerProfileData.experienceLabel || "Market Experience",
                        experienceIcon: ownerProfileData.experienceIcon || "clock",
                        showMentoredCard: !!ownerProfileData.showMentoredCard,
                        mentoredLabel: ownerProfileData.mentoredLabel || "Traders Mentored",
                        mentoredIcon: ownerProfileData.mentoredIcon || "users",
                        showMethodologyCard: ownerProfileData.showMethodologyCard !== false,
                        methodologyLabel: ownerProfileData.methodologyLabel || "Core Methodology",
                        methodologyIcon: ownerProfileData.methodologyIcon || "award",
                        showDetailsParagraph: !!ownerProfileData.showDetailsParagraph,
                      });
                    }
                  }}
                  className="gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-700"
                >
                  <RefreshCw size={13} className={isLoadingOwnerProfile ? "animate-spin" : ""} />
                  <span>Reload Saved</span>
                </Button>

                <a href="/#owner-profile" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    className="gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400"
                  >
                    <span>View on Website</span>
                    <ExternalLink size={13} />
                  </Button>
                </a>
              </div>
            </div>

            {/* Editor & Preview Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Form Area */}
              <div className="xl:col-span-7 space-y-6">
                <form onSubmit={handleSaveOwnerProfile} className="space-y-6">
                  {/* Photo Management Card */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <Camera size={18} className="text-sky-500" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Profile Photo Management
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                      {/* Photo Thumbnail */}
                      <div className="relative shrink-0">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-sky-500/50 bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-center">
                          {ownerForm.photoUrl ? (
                            <img
                              src={ownerForm.photoUrl}
                              alt="Owner"
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <UserCheck size={36} className="text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Photo Actions */}
                      <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-[#0284c7] px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-600 transition-colors">
                            <Upload size={14} />
                            <span>Upload New Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleOwnerPhotoUpload}
                              className="hidden"
                            />
                          </label>

                          {ownerForm.photoUrl && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setOwnerForm({ ...ownerForm, photoUrl: "" })}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                            >
                              <Trash2 size={13} className="mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            Or paste direct image URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={ownerForm.photoUrl}
                            onChange={(e) => setOwnerForm({ ...ownerForm, photoUrl: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>

                        <p className="text-[11px] text-slate-400">
                          Recommended: High quality square or portrait photo (PNG, JPG, or WebP). Minimum 400×400px.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal & Title Card */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <UserCheck size={18} className="text-sky-500" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Name & Institutional Title
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Owner Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MD Nijam Uddin"
                        value={ownerForm.name}
                        onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Title / Role (English) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Founder & Lead Institutional Trader"
                          value={ownerForm.role}
                          onChange={(e) => setOwnerForm({ ...ownerForm, role: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Title / Role (Bengali)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. প্রতিষ্ঠাতা ও লিড ইনস্টিটিউশনাল ট্রেডার"
                          value={ownerForm.roleBn}
                          onChange={(e) => setOwnerForm({ ...ownerForm, roleBn: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Founder Description Card */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <FileText size={18} className="text-sky-500" />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Founder & Lead Mentor Description
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Primary biography text shown in the Founder section on the Home page.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Primary Description (English) *
                        </label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution."
                          value={ownerForm.bioEn}
                          onChange={(e) => setOwnerForm({ ...ownerForm, bioEn: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Primary Description (Bengali)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="ইন্সটিটিউশনাল প্রাইস ডেলিভারি, মার্কেট স্ট্রাকচার, লিকুইডিটি ডায়নামিক্স এবং প্রাইস অ্যাকশন স্পেশালিস্ট..."
                          value={ownerForm.bioBn}
                          onChange={(e) => setOwnerForm({ ...ownerForm, bioBn: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience Narrative Paragraph Card */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-sky-500" />
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                            Experience Narrative Paragraph
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Optional extended narrative paragraph displayed beneath the primary description.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ownerForm.showDetailsParagraph ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                          {ownerForm.showDetailsParagraph ? "Shown on Home" : "Hidden (Disabled)"}
                        </span>
                        <Switch
                          checked={ownerForm.showDetailsParagraph}
                          onCheckedChange={(checked) => setOwnerForm({ ...ownerForm, showDetailsParagraph: checked })}
                          aria-label="Toggle Experience Narrative Paragraph"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Experience Narrative (English)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management."
                          value={ownerForm.detailsEn}
                          onChange={(e) => setOwnerForm({ ...ownerForm, detailsEn: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Experience Narrative (Bengali)
                        </label>
                        <textarea
                          rows={3}
                          placeholder="৬+ বছরের বিশেষায়িত প্রাতিষ্ঠানিক মার্কেট অভিজ্ঞতা..."
                          value={ownerForm.detailsBn}
                          onChange={(e) => setOwnerForm({ ...ownerForm, detailsBn: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Statistic & Credential Cards Management */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <Award size={18} className="text-sky-500" />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Statistic & Credential Cards
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Configure visibility, labels, values, and icons. Active cards reflow seamlessly on the website.
                        </p>
                      </div>
                    </div>

                    {/* Card 1: Market Experience */}
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
                            {renderOwnerStatIcon(ownerForm.experienceIcon || "clock", "size-4")}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Market Experience Card</span>
                            <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${ownerForm.showExperienceCard ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                              {ownerForm.showExperienceCard ? "Active" : "Disabled (Hidden)"}
                            </span>
                          </div>
                        </div>
                        <Switch
                          checked={ownerForm.showExperienceCard}
                          onCheckedChange={(checked) => setOwnerForm({ ...ownerForm, showExperienceCard: checked })}
                          aria-label="Toggle Market Experience Card"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Label
                          </label>
                          <input
                            type="text"
                            placeholder="Market Experience"
                            value={ownerForm.experienceLabel}
                            onChange={(e) => setOwnerForm({ ...ownerForm, experienceLabel: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Value
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 6+ Years"
                            value={ownerForm.experienceYears}
                            onChange={(e) => setOwnerForm({ ...ownerForm, experienceYears: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Icon
                          </label>
                          <select
                            value={ownerForm.experienceIcon || "clock"}
                            onChange={(e) => setOwnerForm({ ...ownerForm, experienceIcon: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="clock">Clock (Default)</option>
                            <option value="calendar">Calendar</option>
                            <option value="award">Award</option>
                            <option value="trending">Trending Up</option>
                            <option value="shield">Shield</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Traders Mentored */}
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
                            {renderOwnerStatIcon(ownerForm.mentoredIcon || "users", "size-4")}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Traders Mentored Card</span>
                            <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${ownerForm.showMentoredCard ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                              {ownerForm.showMentoredCard ? "Active" : "Disabled (Hidden)"}
                            </span>
                          </div>
                        </div>
                        <Switch
                          checked={ownerForm.showMentoredCard}
                          onCheckedChange={(checked) => setOwnerForm({ ...ownerForm, showMentoredCard: checked })}
                          aria-label="Toggle Traders Mentored Card"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Label
                          </label>
                          <input
                            type="text"
                            placeholder="Traders Mentored"
                            value={ownerForm.mentoredLabel}
                            onChange={(e) => setOwnerForm({ ...ownerForm, mentoredLabel: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Value
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1,500+"
                            value={ownerForm.studentsCount}
                            onChange={(e) => setOwnerForm({ ...ownerForm, studentsCount: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Icon
                          </label>
                          <select
                            value={ownerForm.mentoredIcon || "users"}
                            onChange={(e) => setOwnerForm({ ...ownerForm, mentoredIcon: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="users">Users (Default)</option>
                            <option value="userCheck">User Check</option>
                            <option value="graduation">Graduation Cap</option>
                            <option value="award">Award</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Core Methodology */}
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400">
                            {renderOwnerStatIcon(ownerForm.methodologyIcon || "award", "size-4")}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Core Methodology Card</span>
                            <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${ownerForm.showMethodologyCard ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                              {ownerForm.showMethodologyCard ? "Active" : "Disabled (Hidden)"}
                            </span>
                          </div>
                        </div>
                        <Switch
                          checked={ownerForm.showMethodologyCard}
                          onCheckedChange={(checked) => setOwnerForm({ ...ownerForm, showMethodologyCard: checked })}
                          aria-label="Toggle Core Methodology Card"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Label
                          </label>
                          <input
                            type="text"
                            placeholder="Core Methodology"
                            value={ownerForm.methodologyLabel}
                            onChange={(e) => setOwnerForm({ ...ownerForm, methodologyLabel: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Value
                          </label>
                          <input
                            type="text"
                            placeholder="Institutional Order Flow, Liquidity & (SMC)"
                            value={ownerForm.tradingStyle}
                            onChange={(e) => setOwnerForm({ ...ownerForm, tradingStyle: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Card Icon
                          </label>
                          <select
                            value={ownerForm.methodologyIcon || "award"}
                            onChange={(e) => setOwnerForm({ ...ownerForm, methodologyIcon: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                          >
                            <option value="award">Award (Default)</option>
                            <option value="sparkles">Sparkles</option>
                            <option value="target">Target</option>
                            <option value="zap">Zap</option>
                            <option value="activity">Activity</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social & Contact Card */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <Globe size={18} className="text-sky-500" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Official Channels & Contact (Optional)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Telegram Username / Link
                        </label>
                        <input
                          type="text"
                          placeholder="https://t.me/cycleofchart"
                          value={ownerForm.telegram}
                          onChange={(e) => setOwnerForm({ ...ownerForm, telegram: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          YouTube Channel Link
                        </label>
                        <input
                          type="url"
                          placeholder="https://youtube.com/@cycleofchart"
                          value={ownerForm.youtube}
                          onChange={(e) => setOwnerForm({ ...ownerForm, youtube: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Facebook Profile / Page Link
                        </label>
                        <input
                          type="url"
                          placeholder="https://facebook.com/cycleofchart"
                          value={ownerForm.facebook}
                          onChange={(e) => setOwnerForm({ ...ownerForm, facebook: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Twitter / X Profile Link
                        </label>
                        <input
                          type="url"
                          placeholder="https://twitter.com/cycleofchart"
                          value={ownerForm.twitter}
                          onChange={(e) => setOwnerForm({ ...ownerForm, twitter: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Direct Contact Email
                        </label>
                        <input
                          type="email"
                          placeholder="founder@cycleofchart.com"
                          value={ownerForm.email}
                          onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={updateOwnerMutation.isPending}
                      className="w-full sm:w-auto min-w-[200px] bg-[#0284c7] hover:bg-sky-600 font-extrabold text-white text-sm shadow-md py-3"
                    >
                      {updateOwnerMutation.isPending && (
                        <RefreshCw size={14} className="animate-spin mr-2" />
                      )}
                      <span>Save Profile Changes</span>
                    </Button>
                  </div>
                </form>
              </div>

              {/* Live Preview Area */}
              <div className="xl:col-span-5 xl:sticky xl:top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Live Home Page Preview
                    </span>
                  </div>

                  {/* Language Toggle */}
                  <div className="flex items-center rounded-xl bg-slate-200/80 p-1 text-xs dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setOwnerPreviewLang("en")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        ownerPreviewLang === "en"
                          ? "bg-white shadow text-sky-600 dark:bg-slate-900 dark:text-sky-400"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setOwnerPreviewLang("bn")}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        ownerPreviewLang === "bn"
                          ? "bg-white shadow text-sky-600 dark:bg-slate-900 dark:text-sky-400"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                      }`}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>

                {/* Preview Box Styled Exactly Like Public Home Section */}
                <div className="rounded-3xl border border-slate-200/90 bg-[#070e1b] p-6 text-white shadow-2xl overflow-hidden relative">
                  <AnimatedRgbBorder />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="text-center sm:text-left space-y-4 relative z-10">
                    {/* Header */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#38bdf8]">
                        {ownerPreviewLang === "bn" ? "ফাউন্ডার পরিচিতি" : "FOUNDER & LEAD MENTOR"}
                      </span>
                      <h4 className="text-lg font-black text-white mt-1">
                        {ownerPreviewLang === "bn" ? "সাইকেল অব চার্ট-এর রূপকার" : "The Mind Behind Cycle of Chart"}
                      </h4>
                    </div>

                    {/* Photo + Identity */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-2">
                      <div className="relative shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-sky-500 via-cyan-400 to-blue-600 shadow-lg shadow-sky-500/20">
                          {ownerForm.photoUrl ? (
                            <img
                              src={ownerForm.photoUrl}
                              alt={ownerForm.name || "Owner"}
                              className="w-full h-full object-cover object-top rounded-[14px]"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                              <UserCheck size={28} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-center sm:text-left">
                        <div className="text-base font-black text-white">
                          {ownerForm.name || "Owner Name"}
                        </div>
                        <div className="inline-flex items-center gap-1 mt-1 rounded-full bg-sky-400/15 px-2.5 py-0.5 text-[11px] font-bold text-sky-300 border border-sky-500/20">
                          <ShieldCheck size={12} className="text-sky-400 shrink-0" />
                          <span>
                            {ownerPreviewLang === "bn" && ownerForm.roleBn
                              ? ownerForm.roleBn
                              : ownerForm.role || "Lead Trader"}
                          </span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-slate-400">
                          {ownerForm.telegram && (
                            <span className="p-1.5 rounded-lg bg-slate-800/80 text-sky-400 hover:text-white" title="Telegram">
                              <Send size={12} />
                            </span>
                          )}
                          {ownerForm.youtube && (
                            <span className="p-1.5 rounded-lg bg-slate-800/80 text-rose-400 hover:text-white" title="YouTube">
                              <ExternalLink size={12} />
                            </span>
                          )}
                          {ownerForm.email && (
                            <span className="p-1.5 rounded-lg bg-slate-800/80 text-emerald-400 hover:text-white" title="Email">
                              <Mail size={12} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-300 leading-relaxed pt-2">
                      {ownerPreviewLang === "bn" && ownerForm.bioBn
                        ? ownerForm.bioBn
                        : ownerForm.bioEn || "Biography text goes here..."}
                    </p>

                    {/* Optional Experience Narrative Paragraph */}
                    {ownerForm.showDetailsParagraph && (ownerForm.detailsEn || ownerForm.detailsBn) && (
                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1.5 border-t border-slate-800/80">
                        {ownerPreviewLang === "bn" && ownerForm.detailsBn
                          ? ownerForm.detailsBn
                          : ownerForm.detailsEn}
                      </p>
                    )}

                    {/* Dynamic Credentials & Statistic Cards */}
                    {(() => {
                      const activeCards = [];
                      if (ownerForm.showExperienceCard) {
                        activeCards.push({
                          key: "exp",
                          label: ownerForm.experienceLabel || "Market Experience",
                          value: ownerForm.experienceYears || "6+ Years",
                          icon: ownerForm.experienceIcon || "clock",
                          colorClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                        });
                      }
                      if (ownerForm.showMentoredCard) {
                        activeCards.push({
                          key: "mentored",
                          label: ownerForm.mentoredLabel || "Traders Mentored",
                          value: ownerForm.studentsCount || "1,500+",
                          icon: ownerForm.mentoredIcon || "users",
                          colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        });
                      }
                      if (ownerForm.showMethodologyCard) {
                        activeCards.push({
                          key: "methodology",
                          label: ownerForm.methodologyLabel || "Core Methodology",
                          value: ownerForm.tradingStyle || "Institutional Order Flow, Liquidity & (SMC)",
                          icon: ownerForm.methodologyIcon || "award",
                          colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                        });
                      }

                      if (activeCards.length === 0) return null;

                      if (activeCards.length === 1) {
                        const card = activeCards[0];
                        return (
                          <div className="flex justify-center pt-2 text-[11px]">
                            <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 max-w-sm w-full">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${card.colorClass}`}>
                                {renderOwnerStatIcon(card.icon, "size-4")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] text-slate-400 truncate">{card.label}</div>
                                <div className="font-extrabold text-white truncate text-xs">{card.value}</div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className={`grid grid-cols-1 ${activeCards.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-2 pt-2 text-[11px]`}>
                          {activeCards.map((card) => (
                            <div key={card.key} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-2 min-w-0">
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${card.colorClass}`}>
                                {renderOwnerStatIcon(card.icon, "size-3.5")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[9px] text-slate-400 truncate">{card.label}</div>
                                <div className="font-extrabold text-white truncate text-[11px]">{card.value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: GATEWAYS & GENERAL SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Payment Gateways & System Settings</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Update merchant and personal payment numbers displayed across the checkout page.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  bKash Personal / Send Money Number
                </label>
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nagad Personal / Send Money Number
                </label>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Rocket Number
                </label>
                <input
                  type="text"
                  value={rocketNumber}
                  onChange={(e) => setRocketNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Platform Announcement Notice
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <Button
                onClick={() => {
                  setActionSuccess("Payment numbers & platform settings updated!");
                  setTimeout(() => setActionSuccess(null), 3000);
                }}
                className="w-full bg-[#081833] font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
              >
                Save Settings
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AUDIT TRAIL */}
        {/* ========================================================================= */}
        {activeTab === "audit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Security & Audit Event Log</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Immutable event stream recording all administrative actions, approval events, and manual overrides.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-3 font-mono text-xs">
                {(auditLogs || []).map((ev: any) => (
                  <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800 gap-1">
                    <div>
                      <span className="font-extrabold text-[#0284c7] dark:text-sky-400">{ev.action}</span> · Entity #{ev.entityId} (Actor #{ev.actorId})
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* REJECT ORDER MODAL */}
      {/* ========================================================================= */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setRejectModalOrder(null)}>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold">Reject Order #{rejectModalOrder.id}</h3>
              <button onClick={() => setRejectModalOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Choose a reason to explain to the customer why their payment could not be verified:
              </p>

              <select
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">-- Choose Reason Template --</option>
                <option value="Transaction ID was not found in our merchant statement.">Transaction ID not found</option>
                <option value="Sent amount did not match the package price.">Sent amount mismatch</option>
                <option value="Duplicate transaction ID already used.">Duplicate Transaction ID</option>
                <option value="Payment proof screenshot is unreadable.">Screenshot unreadable</option>
              </select>

              <textarea
                rows={3}
                placeholder="Or write custom reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-rose-500 dark:border-slate-800 dark:bg-slate-950"
              />

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setRejectModalOrder(null)}
                  variant="outline"
                  className="w-1/2 border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  disabled={rejectMutation.isPending}
                  onClick={() => {
                    const why = rejectReason || "Payment proof could not be verified.";
                    rejectMutation.mutate({ orderId: rejectModalOrder.id, reason: why });
                  }}
                  className="w-1/2 bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Confirm Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL GRANT ACCESS MODAL */}
      {/* ========================================================================= */}
      {grantAccessModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setGrantAccessModalUser(null)}>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold">Grant Access to {grantAccessModalUser.name || grantAccessModalUser.email}</h3>
              <button onClick={() => setGrantAccessModalUser(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Select the package or digital product to unlock for this student:
              </p>

              <select
                value={selectedBundleId}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  setSelectedBundleId(id);
                  setGrantScope(id === 3 ? "bundle:3 (Master Full Bundle)" : id === 2 ? "bundle:2 (Course + eBook)" : "bundle:1 (15-PDF Package)");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                <option value={3}>Master Full Bundle (All 15 PDFs + Course + eBook)</option>
                <option value={2}>Course + Free Institutional eBook</option>
                <option value={1}>15-PDF Institutional Library Package</option>
              </select>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setGrantAccessModalUser(null)}
                  variant="outline"
                  className="w-1/2 border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  disabled={grantAccessMutation.isPending}
                  onClick={() => {
                    grantAccessMutation.mutate({
                      userId: grantAccessModalUser.id,
                      scope: grantScope,
                      bundleId: selectedBundleId,
                    });
                  }}
                  className="w-1/2 bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Grant Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT FREE EBOOK MODAL */}
      {/* ========================================================================= */}
      {isEbookModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsEbookModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="text-sky-500" size={20} />
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {editingEbook ? "Edit Free eBook / PDF" : "Add New Free eBook / PDF"}
                </h3>
              </div>
              <button
                onClick={() => setIsEbookModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEbook} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CRT Master Cheat-Sheet"
                    value={ebookForm.titleEn}
                    onChange={(e) => setEbookForm({ ...ebookForm, titleEn: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Title (Bengali - Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. সিআরটি মাস্টার চিট-শীট"
                    value={ebookForm.titleBn}
                    onChange={(e) => setEbookForm({ ...ebookForm, titleBn: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Subtitle / Summary (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Candle Range Theory, liquidity sweeps, and expansion models"
                    value={ebookForm.subtitleEn}
                    onChange={(e) => setEbookForm({ ...ebookForm, subtitleEn: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Subtitle / Summary (Bengali - Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="বাংলা সারসংক্ষেপ বা বর্ণনা"
                    value={ebookForm.subtitleBn}
                    onChange={(e) => setEbookForm({ ...ebookForm, subtitleBn: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CHART ANALYSIS or LIQUIDITY & SMC"
                    value={ebookForm.category}
                    onChange={(e) => setEbookForm({ ...ebookForm, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pages Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={ebookForm.pages}
                    onChange={(e) => setEbookForm({ ...ebookForm, pages: parseInt(e.target.value) || 1 })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Key Concepts / Learning Modules (One per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Candle Range Theory Anatomy&#10;Internal vs External Liquidity Sweeps&#10;Order Flow Directional Confirmation"
                  value={ebookForm.keyConceptsText}
                  onChange={(e) => setEbookForm({ ...ebookForm, keyConceptsText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Upload PDF File or Custom URL */}
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/40">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  <Upload size={15} className="text-sky-500" />
                  <span>Custom PDF File Attachment (Optional)</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Upload your own PDF file for students to download. If left empty, the institutional PDF generator will automatically format and generate a clean PDF on-the-fly.
                </p>

                {ebookForm.fileUrl ? (
                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip size={16} className="text-emerald-500 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {ebookForm.fileName || "Uploaded PDF Document"}
                        </div>
                        <div className="text-[10px] text-slate-400">{ebookForm.fileSize || "PDF Attached"}</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEbookForm({ ...ebookForm, fileUrl: null, fileName: null, fileSize: null })
                      }
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold"
                    >
                      <Trash2 size={13} className="mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-5 cursor-pointer hover:border-sky-500 hover:bg-sky-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-400">
                      <Upload size={22} className="text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Click to select PDF from your device
                      </span>
                      <span className="text-[11px] text-slate-400">Accepts .pdf files</span>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handlePdfFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ebookPublishToggle"
                  checked={ebookForm.isPublished}
                  onChange={(e) => setEbookForm({ ...ebookForm, isPublished: e.target.checked })}
                  className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label
                  htmlFor="ebookPublishToggle"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Publish immediately (Visible in student Free eBook Library)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEbookModalOpen(false)}
                  className="border-slate-300 dark:border-slate-700 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createEbookMutation.isPending || updateEbookMutation.isPending}
                  className="bg-[#0284c7] font-bold text-white hover:bg-sky-600 shadow-md"
                >
                  {(createEbookMutation.isPending || updateEbookMutation.isPending) && (
                    <RefreshCw size={13} className="animate-spin mr-1.5" />
                  )}
                  <span>{editingEbook ? "Save Changes" : "Create eBook"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmEbookId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeleteConfirmEbookId(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Free eBook?</h3>
              <button
                onClick={() => setDeleteConfirmEbookId(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete this eBook from the library? Students will no longer be able to download it.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmEbookId(null)}
                className="w-1/2 border-slate-300 dark:border-slate-700 font-bold"
              >
                Cancel
              </Button>
              <Button
                disabled={deleteEbookMutation.isPending}
                onClick={() => deleteEbookMutation.mutate({ id: deleteConfirmEbookId })}
                className="w-1/2 bg-rose-600 text-white font-bold hover:bg-rose-700"
              >
                {deleteEbookMutation.isPending && (
                  <RefreshCw size={13} className="animate-spin mr-1.5" />
                )}
                <span>Confirm Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
