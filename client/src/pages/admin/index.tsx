import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { uploadImage, uploadFile } from "@/lib/mediaUpload";

import { AdminHeader } from "./components/AdminHeader";
import { AdminNavTabs, AdminTab } from "./components/AdminNavTabs";

import { OverviewTab } from "./tabs/OverviewTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { StudentsTab } from "./tabs/StudentsTab";
import { EbooksTab } from "./tabs/EbooksTab";
import { SupportTab } from "./tabs/SupportTab";
import { OwnerProfileTab, OwnerFormData } from "./tabs/OwnerProfileTab";
import { SettingsTab, PaymentSettingsFormState } from "./tabs/SettingsTab";
import { AuditTab } from "./tabs/AuditTab";

import { RejectOrderModal } from "./modals/RejectOrderModal";
import { GrantAccessModal } from "./modals/GrantAccessModal";
import { TicketDetailsModal } from "./modals/TicketDetailsModal";
import { EbookModal, EbookFormData } from "./modals/EbookModal";
import { DeleteEbookModal } from "./modals/DeleteEbookModal";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Orders filter & search states
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [orderMethodFilter, setOrderMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);

  // Students filter state
  const [studentSearch, setStudentSearch] = useState("");

  // Ticket filter & modal states
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "pending" | "in_progress" | "waiting_customer" | "waiting_user" | "solved" | "resolved" | "closed" | string>("all");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>("all");
  const [ticketSearch, setTicketSearch] = useState<string>("");
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<any | null>(null);
  const [staffReplyText, setStaffReplyText] = useState("");
  const [staffReplyStatus, setStaffReplyStatus] = useState<"open" | "pending" | "in_progress" | "waiting_customer" | "waiting_user" | "solved" | "resolved" | "closed">("waiting_customer");

  // Modals state
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [grantAccessModalUser, setGrantAccessModalUser] = useState<any | null>(null);
  const [grantScope, setGrantScope] = useState("bundle:3 (Master Full Bundle)");
  const [selectedBundleId, setSelectedBundleId] = useState<number>(3);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Settings form state
  const [paymentConfig, setPaymentConfig] = useState<PaymentSettingsFormState>({
    bkash: {
      number: "01961079326",
      accountType: "Personal",
      isEnabled: true,
      instructions: "Send Money using bKash App or *247#, then copy and enter the Transaction ID (TrxID) below.",
    },
    nagad: {
      number: "01961079326",
      accountType: "Personal",
      isEnabled: true,
      instructions: "Send Money using Nagad App or *167#, then copy and enter the Transaction ID (TrxID) below.",
    },
    rocket: {
      number: "01961079326",
      accountType: "Personal",
      isEnabled: true,
      instructions: "Send Money using Rocket App or *322#, then copy and enter the Transaction ID (TrxID) below.",
    },
    announcement: "Special Eid & Student Discount Active on All Institutional Packages!",
    isAnnouncementEnabled: false,
    studentTelegramUrl: "https://t.me/cycleofchart",
    studentTelegramDescription: "Official Cycle of Chart VIP Student Telegram Community",
  });
  const [paymentConfigInitialized, setPaymentConfigInitialized] = useState(false);

  // Free eBooks state
  const [ebookSearch, setEbookSearch] = useState("");
  const [ebookCategoryFilter, setEbookCategoryFilter] = useState("all");
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<any | null>(null);
  const [deleteConfirmEbookId, setDeleteConfirmEbookId] = useState<number | null>(null);
  const [ebookForm, setEbookForm] = useState<EbookFormData>({
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

  // Owner Profile state
  const [ownerForm, setOwnerForm] = useState<OwnerFormData>({
    isVisible: true,
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

  // Live Queries (Zero auth restriction - Admin panel is open directly)
  const { data: stats, refetch: refetchStats, isFetching: isFetchingStats } = trpc.admin.stats.useQuery();
  const { data: orders, refetch: refetchOrders, isFetching: isFetchingOrders } = trpc.admin.orders.useQuery();
  const { data: students, refetch: refetchStudents, isFetching: isFetchingStudents } = trpc.admin.users.useQuery();
  const { data: tickets, refetch: refetchTickets, isFetching: isFetchingTickets } = trpc.admin.tickets.useQuery();
  const { data: auditLogs, refetch: refetchAudit, isFetching: isFetchingAudit } = trpc.admin.auditLogs.useQuery();
  const { data: ebooks, refetch: refetchEbooks, isLoading: isLoadingEbooks } = trpc.admin.freeEbooks.useQuery();
  const {
    data: ownerProfileData,
    refetch: refetchOwnerProfile,
    isLoading: isLoadingOwnerProfile,
  } = trpc.admin.ownerProfile.useQuery();

  const {
    data: paymentSettingsData,
    refetch: refetchPaymentSettings,
    isLoading: isLoadingPaymentSettings,
  } = trpc.admin.paymentSettings.useQuery();

  const {
    data: ticketModalData,
    refetch: refetchTicketModalData,
    isLoading: isLoadingTicketModalData,
  } = trpc.admin.ticketDetails.useQuery(
    { ticketId: (selectedTicketForModal?.id as number) || 0 },
    { enabled: !!selectedTicketForModal?.id }
  );

  useEffect(() => {
    if (ownerProfileData && !ownerFormInitialized) {
      setOwnerForm({
        isVisible: (ownerProfileData as any)?.isVisible !== false,
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

  useEffect(() => {
    if (paymentSettingsData && !paymentConfigInitialized) {
      setPaymentConfig({
        bkash: {
          number: paymentSettingsData.bkash?.number || "01961079326",
          accountType: (paymentSettingsData.bkash?.accountType as any) || "Personal",
          isEnabled: paymentSettingsData.bkash?.isEnabled !== false,
          instructions: paymentSettingsData.bkash?.instructions || "",
        },
        nagad: {
          number: paymentSettingsData.nagad?.number || "01961079326",
          accountType: (paymentSettingsData.nagad?.accountType as any) || "Personal",
          isEnabled: paymentSettingsData.nagad?.isEnabled !== false,
          instructions: paymentSettingsData.nagad?.instructions || "",
        },
        rocket: {
          number: paymentSettingsData.rocket?.number || "01961079326",
          accountType: (paymentSettingsData.rocket?.accountType as any) || "Personal",
          isEnabled: paymentSettingsData.rocket?.isEnabled !== false,
          instructions: paymentSettingsData.rocket?.instructions || "",
        },
        announcement: paymentSettingsData.announcement || "",
        isAnnouncementEnabled: !!paymentSettingsData.isAnnouncementEnabled,
        studentTelegramUrl: (paymentSettingsData as any)?.studentTelegramUrl || "https://t.me/cycleofchart",
        studentTelegramDescription: (paymentSettingsData as any)?.studentTelegramDescription || "Official Cycle of Chart VIP Student Telegram Community",
      });
      setPaymentConfigInitialized(true);
    }
  }, [paymentSettingsData, paymentConfigInitialized]);

  const refetchAll = () => {
    refetchStats();
    refetchOrders();
    refetchStudents();
    refetchTickets();
    refetchAudit();
    refetchEbooks();
    refetchOwnerProfile();
    refetchPaymentSettings();
  };

  const isRefreshingAny =
    isFetchingStats || isFetchingOrders || isFetchingStudents || isFetchingTickets || isFetchingAudit;

  // Mutations
  const approveMutation = trpc.admin.approveOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      refetchAudit();
      setActionSuccess("Order approved successfully! Entitlement granted & notification sent.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to approve order");
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
    onError: (err: any) => {
      alert(err.message || "Failed to reject order");
    },
  });

  const deleteMutation = trpc.admin.deleteOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      refetchAudit();
      setActionSuccess("Order permanently deleted from database.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to delete order");
    },
  });

  const updateRoleMutation = trpc.admin.updateRole.useMutation({
    onSuccess: () => {
      refetchStudents();
      setActionSuccess("User role updated successfully.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update role");
    },
  });

  const grantAccessMutation = trpc.admin.grantAccess.useMutation({
    onSuccess: () => {
      refetchStudents();
      refetchStats();
      refetchAudit();
      setGrantAccessModalUser(null);
      setActionSuccess("Access entitlement granted successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to grant access");
    },
  });

  const updateTicketStatusMutation = trpc.admin.updateTicket.useMutation({
    onSuccess: () => {
      refetchTickets();
      if (selectedTicketForModal) refetchTicketModalData();
      setActionSuccess("Ticket status updated successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update ticket status");
    },
  });

  const staffReplyMutation = trpc.admin.replyTicket.useMutation({
    onSuccess: () => {
      refetchTickets();
      refetchTicketModalData();
      setStaffReplyText("");
      setActionSuccess("Reply sent to student successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to send reply");
    },
  });

  const createEbookMutation = trpc.admin.createFreeEbook.useMutation({
    onSuccess: () => {
      refetchEbooks();
      setIsEbookModalOpen(false);
      setActionSuccess("New Free eBook created successfully!");
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
      setActionSuccess("Free eBook updated successfully!");
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

  const updatePaymentSettingsMutation = trpc.admin.updatePaymentSettings.useMutation({
    onSuccess: () => {
      refetchPaymentSettings();
      setActionSuccess("Payment gateways & checkout settings saved successfully!");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update payment settings");
    },
  });

  // Helpers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrxId(text);
    setTimeout(() => setCopiedTrxId(null), 2500);
  };

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Please upload a valid PDF file (.pdf)");
      return;
    }
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const toastId = toast.loading("Uploading PDF to free cloud CDN...");
    try {
      const cdnUrl = await uploadFile(file);
      setEbookForm((prev) => ({
        ...prev,
        fileUrl: cdnUrl,
        fileName: file.name,
        fileSize: sizeInMb,
      }));
      toast.success("PDF uploaded to cloud CDN successfully!", { id: toastId });
    } catch (err: any) {
      console.error("[eBook PDF upload error]:", err);
      toast.error("Failed to upload PDF. Please try again.", { id: toastId });
    } finally {
      e.target.value = "";
    }
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

  const openAddEbookModal = () => {
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
      keyConceptsText: (item.keyConcepts || []).join("\n"),
      fileUrl: item.fileUrl || null,
      fileName: item.fileName || null,
      fileSize: item.fileSize || null,
      isPublished: item.isPublished !== false,
    });
    setIsEbookModalOpen(true);
  };

  const handleOwnerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }
    const toastId = toast.loading("Uploading owner photo to cloud CDN...");
    try {
      const cdnUrl = await uploadImage(file);
      setOwnerForm((prev) => ({
        ...prev,
        photoUrl: cdnUrl,
      }));
      toast.success("Owner photo uploaded to cloud CDN!", { id: toastId });
    } catch (err: any) {
      console.error("[Owner photo upload error]:", err);
      toast.error("Failed to upload photo. Please try again.", { id: toastId });
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveOwnerProfile = async (e: React.FormEvent) => {
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

    let finalPhotoUrl = ownerForm.photoUrl.trim();
    if (finalPhotoUrl.startsWith("data:image/")) {
      const uploadToast = toast.loading("Converting & uploading base64 photo to ImgBB CDN...");
      try {
        finalPhotoUrl = await uploadImage(finalPhotoUrl, "owner-founder-photo.png");
        setOwnerForm((prev) => ({ ...prev, photoUrl: finalPhotoUrl }));
        toast.success("Photo uploaded to ImgBB CDN successfully!", { id: uploadToast });
      } catch (err: any) {
        console.error("Base64 photo upload error:", err);
        toast.error("Failed to upload base64 photo to CDN. Saving as-is.", { id: uploadToast });
      }
    }

    updateOwnerMutation.mutate({
      isVisible: ownerForm.isVisible,
      name: ownerForm.name.trim(),
      role: ownerForm.role.trim(),
      roleBn: ownerForm.roleBn?.trim() || undefined,
      bioEn: ownerForm.bioEn.trim(),
      bioBn: ownerForm.bioBn?.trim() || undefined,
      detailsEn: ownerForm.detailsEn?.trim() || undefined,
      detailsBn: ownerForm.detailsBn?.trim() || undefined,
      photoUrl: finalPhotoUrl,
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

  const handleReloadOwner = () => {
    refetchOwnerProfile();
    if (ownerProfileData) {
      setOwnerForm({
        isVisible: (ownerProfileData as any)?.isVisible !== false,
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
  };

  const handleSavePaymentSettings = () => {
    updatePaymentSettingsMutation.mutate(paymentConfig);
  };

  const handleReloadPaymentSettings = () => {
    refetchPaymentSettings();
    if (paymentSettingsData) {
      setPaymentConfig({
        bkash: {
          number: paymentSettingsData.bkash?.number || "01961079326",
          accountType: (paymentSettingsData.bkash?.accountType as any) || "Personal",
          isEnabled: paymentSettingsData.bkash?.isEnabled !== false,
          instructions: paymentSettingsData.bkash?.instructions || "",
        },
        nagad: {
          number: paymentSettingsData.nagad?.number || "01961079326",
          accountType: (paymentSettingsData.nagad?.accountType as any) || "Personal",
          isEnabled: paymentSettingsData.nagad?.isEnabled !== false,
          instructions: paymentSettingsData.nagad?.instructions || "",
        },
        rocket: {
          number: paymentSettingsData.rocket?.number || "01961079326",
          accountType: (paymentSettingsData.rocket?.accountType as any) || "Personal",
          isEnabled: paymentSettingsData.rocket?.isEnabled !== false,
          instructions: paymentSettingsData.rocket?.instructions || "",
        },
        announcement: paymentSettingsData.announcement || "",
        isAnnouncementEnabled: !!paymentSettingsData.isAnnouncementEnabled,
        studentTelegramUrl: (paymentSettingsData as any)?.studentTelegramUrl || "https://t.me/cycleofchart",
        studentTelegramDescription: (paymentSettingsData as any)?.studentTelegramDescription || "Official Cycle of Chart VIP Student Telegram Community",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070e1b] dark:text-slate-100 transition-colors">
      {/* Sticky Top Header */}
      <AdminHeader onRefreshAll={refetchAll} isRefreshing={isRefreshingAny} />

      {/* Floating Action Success Notification */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-white" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Navigation Sub-Header */}
      <AdminNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingOrdersCount={(orders || []).filter((o: any) => o.orderStatus === "pending").length}
        studentsCount={(students || []).length}
        ebooksCount={(ebooks || []).length}
        openTicketsCount={
          (tickets || []).filter((t: any) => t.status === "open" || t.status === "in_progress").length
        }
      />

      {/* Main Tab Content */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            orders={orders || []}
            students={students || []}
            tickets={tickets || []}
            refetchAll={refetchAll}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab
            orders={orders || []}
            orderFilter={orderFilter}
            setOrderFilter={setOrderFilter}
            orderMethodFilter={orderMethodFilter}
            setOrderMethodFilter={setOrderMethodFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onApproveOrder={(orderId) => approveMutation.mutate({ orderId })}
            onOpenRejectModal={(order) => setRejectModalOrder(order)}
            onDeleteOrder={(orderId) => {
              if (window.confirm(`Are you sure you want to permanently delete Order #${orderId} from the database?`)) {
                deleteMutation.mutate({ orderId });
              }
            }}
            isApproving={approveMutation.isPending}
            copiedTrxId={copiedTrxId}
            copyToClipboard={copyToClipboard}
          />
        )}

        {activeTab === "students" && (
          <StudentsTab
            students={students || []}
            studentSearch={studentSearch}
            setStudentSearch={setStudentSearch}
            onUpdateRole={(userId, role) => updateRoleMutation.mutate({ userId, role })}
            onOpenGrantAccess={(student) => setGrantAccessModalUser(student)}
            isUpdatingRole={updateRoleMutation.isPending}
          />
        )}

        {activeTab === "ebooks" && (
          <EbooksTab
            ebooks={ebooks || []}
            isLoadingEbooks={isLoadingEbooks}
            ebookSearch={ebookSearch}
            setEbookSearch={setEbookSearch}
            ebookCategoryFilter={ebookCategoryFilter}
            setEbookCategoryFilter={setEbookCategoryFilter}
            onOpenAddModal={openAddEbookModal}
            onOpenEditModal={openEditEbookModal}
            onTogglePublish={(id, currentPublished) =>
              updateEbookMutation.mutate({ id, isPublished: !currentPublished })
            }
            onDeleteEbook={(id) => setDeleteConfirmEbookId(id)}
          />
        )}

        {activeTab === "support" && (
          <SupportTab
            tickets={tickets || []}
            ticketFilter={ticketFilter}
            setTicketFilter={setTicketFilter}
            ticketCategoryFilter={ticketCategoryFilter}
            setTicketCategoryFilter={setTicketCategoryFilter}
            ticketSearch={ticketSearch}
            setTicketSearch={setTicketSearch}
            onSelectTicketForModal={(ticket) => setSelectedTicketForModal(ticket)}
            onUpdateTicketStatus={(ticketId, status) =>
              updateTicketStatusMutation.mutate({ ticketId, status: status as any })
            }
          />
        )}

        {activeTab === "owner" && (
          <OwnerProfileTab
            ownerForm={ownerForm}
            setOwnerForm={setOwnerForm}
            ownerPreviewLang={ownerPreviewLang}
            setOwnerPreviewLang={setOwnerPreviewLang}
            onSave={handleSaveOwnerProfile}
            onPhotoUpload={handleOwnerPhotoUpload}
            onReload={handleReloadOwner}
            isLoading={isLoadingOwnerProfile}
            isSaving={updateOwnerMutation.isPending}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            paymentConfig={paymentConfig}
            setPaymentConfig={setPaymentConfig}
            onSave={handleSavePaymentSettings}
            onReload={handleReloadPaymentSettings}
            isLoading={isLoadingPaymentSettings}
            isSaving={updatePaymentSettingsMutation.isPending}
          />
        )}

        {activeTab === "audit" && <AuditTab auditLogs={auditLogs || []} />}
      </main>

      {/* Reject Order Modal */}
      <RejectOrderModal
        order={rejectModalOrder}
        onClose={() => setRejectModalOrder(null)}
        onConfirmReject={(orderId, reason) => rejectMutation.mutate({ orderId, reason })}
        isPending={rejectMutation.isPending}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
      />

      {/* Manual Grant Access Modal */}
      <GrantAccessModal
        user={grantAccessModalUser}
        onClose={() => setGrantAccessModalUser(null)}
        onGrantAccess={(userId, scope, bundleId) =>
          grantAccessMutation.mutate({ userId, scope, bundleId })
        }
        isPending={grantAccessMutation.isPending}
        selectedBundleId={selectedBundleId}
        setSelectedBundleId={setSelectedBundleId}
        grantScope={grantScope}
        setGrantScope={setGrantScope}
      />

      {/* Staff Conversation Thread Modal */}
      <TicketDetailsModal
        ticket={selectedTicketForModal}
        ticketModalData={ticketModalData}
        isLoadingTicketModalData={isLoadingTicketModalData}
        onClose={() => setSelectedTicketForModal(null)}
        staffReplyText={staffReplyText}
        setStaffReplyText={setStaffReplyText}
        staffReplyStatus={staffReplyStatus}
        setStaffReplyStatus={setStaffReplyStatus}
        onSendReply={(ticketId, message, status) =>
          staffReplyMutation.mutate({ ticketId, message, status: status as any })
        }
        isReplying={staffReplyMutation.isPending}
      />

      {/* Add / Edit Free eBook Modal */}
      <EbookModal
        isOpen={isEbookModalOpen}
        onClose={() => setIsEbookModalOpen(false)}
        editingEbook={editingEbook}
        ebookForm={ebookForm}
        setEbookForm={setEbookForm}
        onSave={handleSaveEbook}
        onPdfUpload={handlePdfFileUpload}
        isSaving={createEbookMutation.isPending || updateEbookMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEbookModal
        ebookId={deleteConfirmEbookId}
        onClose={() => setDeleteConfirmEbookId(null)}
        onConfirmDelete={(id) => deleteEbookMutation.mutate({ id })}
        isPending={deleteEbookMutation.isPending}
      />
    </div>
  );
}
