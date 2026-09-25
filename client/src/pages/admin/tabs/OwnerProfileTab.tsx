import React, { useState } from "react";
import {
  Camera,
  Upload,
  Trash2,
  UserCheck,
  FileText,
  Clock,
  Calendar,
  Award,
  TrendingUp,
  ShieldCheck,
  Users,
  GraduationCap,
  Sparkles,
  Target,
  Zap,
  Activity,
  Globe,
  RefreshCw,
  ExternalLink,
  Send,
  Mail,
  Eye,
  EyeOff,
  Building2,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AnimatedRgbBorder } from "@/components/AnimatedRgbBorder";

export interface OwnerFormData {
  isVisible: boolean;
  name: string;
  role: string;
  roleBn?: string;
  bioEn: string;
  bioBn?: string;
  detailsEn?: string;
  detailsBn?: string;
  photoUrl: string;
  experienceYears?: string;
  studentsCount?: string;
  tradingStyle?: string;
  signatureQuoteEn?: string;
  signatureQuoteBn?: string;
  telegram?: string;
  youtube?: string;
  facebook?: string;
  twitter?: string;
  email?: string;
  showExperienceCard: boolean;
  experienceLabel?: string;
  experienceIcon?: string;
  showMentoredCard: boolean;
  mentoredLabel?: string;
  mentoredIcon?: string;
  showMethodologyCard: boolean;
  methodologyLabel?: string;
  methodologyIcon?: string;
  showDetailsParagraph: boolean;

  // Profile 2 (Cycle of Chart / Brand Profile)
  profile2Name?: string;
  profile2Role?: string;
  profile2RoleBn?: string;
  profile2PhotoUrl?: string;
  profile2BioEn?: string;
  profile2BioBn?: string;
  profile2TradingStyle?: string;
  profile2Telegram?: string;
  profile2Youtube?: string;
  profile2Facebook?: string;
  profile2Twitter?: string;
  profile2Email?: string;
}

interface OwnerProfileTabProps {
  ownerForm: OwnerFormData;
  setOwnerForm: React.Dispatch<React.SetStateAction<OwnerFormData>>;
  ownerPreviewLang: "en" | "bn";
  setOwnerPreviewLang: (lang: "en" | "bn") => void;
  onSave: (e: React.FormEvent) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfile2PhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReload: () => void;
  isLoading?: boolean;
  isSaving?: boolean;
}

export const renderOwnerStatIcon = (iconName?: string, className: string = "size-4") => {
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

export const OwnerProfileTab: React.FC<OwnerProfileTabProps> = ({
  ownerForm,
  setOwnerForm,
  ownerPreviewLang,
  setOwnerPreviewLang,
  onSave,
  onPhotoUpload,
  onProfile2PhotoUpload,
  onReload,
  isLoading,
  isSaving,
}) => {
  const [activeSection, setActiveSection] = useState<"all" | "profile1" | "profile2" | "center">("all");

  const p2Name = ownerForm.profile2Name || "Cycle of Chart";
  const p2Role =
    ownerPreviewLang === "bn" && ownerForm.profile2RoleBn
      ? ownerForm.profile2RoleBn
      : ownerForm.profile2Role || (ownerPreviewLang === "bn" ? "ইন্সটিটিউশনাল ট্রেডিং মেন্টর" : "Institutional Trading Mentor");
  const p2Photo = ownerForm.profile2PhotoUrl || "/logo.jpg";
  const p2Bio =
    ownerPreviewLang === "bn" && ownerForm.profile2BioBn
      ? ownerForm.profile2BioBn
      : ownerForm.profile2BioEn || "";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight">Owner Profile & Founder CMS</h2>
            {ownerForm.isVisible ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Live on Home Page
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <span className="size-2 rounded-full bg-rose-500" />
                Hidden from Website
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Independently manage both visible profiles displayed in the public dual-profile section: Founder / Owner (Left) and Cycle of Chart Brand (Right).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={onReload}
            className="gap-1.5 text-xs font-bold border-slate-300 dark:border-slate-700"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
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
          <form onSubmit={onSave} className="space-y-6">
            {/* Website Visibility Card */}
            <div
              className={`rounded-3xl border transition-all p-5 sm:p-6 shadow-sm ${
                ownerForm.isVisible
                  ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                  : "border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                      ownerForm.isVisible
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-rose-500 text-white shadow-rose-500/20"
                    }`}
                  >
                    {ownerForm.isVisible ? <Eye size={22} /> : <EyeOff size={22} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Website Section Visibility
                      </h3>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ownerForm.isVisible
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {ownerForm.isVisible ? "Visible / Active" : "Hidden / Inactive"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {ownerForm.isVisible
                        ? "The dual-profile section (#owner-profile) is currently visible to all visitors on the Home page."
                        : "The dual-profile section is completely HIDDEN from the Home page. Visitors will not see it."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {ownerForm.isVisible ? "Visible" : "Hidden"}
                  </span>
                  <Switch
                    checked={ownerForm.isVisible}
                    onCheckedChange={(checked) =>
                      setOwnerForm((prev) => ({ ...prev, isVisible: checked }))
                    }
                    className="data-[state=checked]:bg-emerald-500"
                    aria-label="Toggle Founder Profile Visibility"
                  />
                </div>
              </div>
            </div>

            {/* Profile Section Navigation Pill Switcher */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setActiveSection("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === "all"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Layers size={14} className="text-sky-500" />
                <span>All Sections</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("profile1")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === "profile1"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <UserCheck size={14} className="text-sky-500" />
                <span>Profile 1: Founder (Left)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("profile2")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === "profile2"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Building2 size={14} className="text-cyan-500" />
                <span>Profile 2: Brand (Right)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("center")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === "center"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Award size={14} className="text-amber-500" />
                <span>Center Cards & Credentials</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* PROFILE 1: FOUNDER / OWNER PROFILE (LEFT) */}
            {/* ========================================================================= */}
            {(activeSection === "all" || activeSection === "profile1") && (
              <div className="rounded-3xl border border-sky-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-sky-950/60 dark:bg-slate-900/90 space-y-6">
                {/* Profile 1 Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100 dark:border-sky-950/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400 shadow-sm">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          FOUNDER / OWNER PROFILE
                        </h3>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                          Left Column
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Public founder identity, image, designation, bio narrative, and direct social links.
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-xl self-start sm:self-center border border-sky-200/60 dark:border-sky-900/40">
                    Profile 1 Controls
                  </span>
                </div>

                {/* 1. [Image] */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-sky-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      [Image] Founder Profile Photo
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-sky-500/50 bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-center">
                        {ownerForm.photoUrl ? (
                          <img
                            src={ownerForm.photoUrl}
                            alt="Founder"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <UserCheck size={32} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-sky-700 transition-colors">
                          <Upload size={14} />
                          <span>Upload Founder Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onPhotoUpload}
                            className="hidden"
                          />
                        </label>

                        {ownerForm.photoUrl && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setOwnerForm((prev) => ({ ...prev, photoUrl: "" }))}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                          >
                            <Trash2 size={13} className="mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Direct Image URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={ownerForm.photoUrl}
                          onChange={(e) => setOwnerForm((prev) => ({ ...prev, photoUrl: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                        {ownerForm.photoUrl?.startsWith("data:image/") && (
                          <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles size={13} className="shrink-0 text-amber-500" />
                            <span>Raw Base64 image detected. Will auto-upload to ImgBB CDN upon saving.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. [Name] */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    [Name] Founder / Owner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Amin Islam"
                    value={ownerForm.name}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Changing this name updates only the Founder profile on the left column.
                  </p>
                </div>

                {/* 3. [Role] */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    [Role] Founder Designation & Title *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Role / Title (English) *
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Founder & Lead Institutional Analyst"
                        value={ownerForm.role}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, role: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Role / Title (Bengali)
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. প্রতিষ্ঠাতা ও লিড ইন্সটিটিউশনাল অ্যানালিস্ট"
                        value={ownerForm.roleBn || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, roleBn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. [Description] */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-sky-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      [Description] Founder Biography / Bio *
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Founder Description (English) *
                      </span>
                      <textarea
                        rows={3}
                        required
                        placeholder="Specializing in institutional price delivery, market structure, liquidity dynamics, and price action..."
                        value={ownerForm.bioEn}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, bioEn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Founder Description (Bengali)
                      </span>
                      <textarea
                        rows={3}
                        placeholder="ইন্সটিটিউশনাল প্রাইস ডেলিভারি, মার্কেট স্ট্রাকচার, লিকুইডিটি ডায়নামিক্স এবং প্রাইস অ্যাকশন স্পেশালিস্ট..."
                        value={ownerForm.bioBn || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, bioBn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. [Methodology] */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-sky-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      [Methodology] Founder Core Methodology / Trading Style
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Institutional Order Flow, Liquidity & (SMC)"
                    value={ownerForm.tradingStyle || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, tradingStyle: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Institutional trading methodology and execution focus attributed to the founder.
                  </p>
                </div>

                {/* 6. [Social Links] */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-sky-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      [Social Links] Founder Channels & Direct Contact Links
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Telegram Channel / Username
                      </span>
                      <input
                        type="text"
                        placeholder="https://t.me/cycleofchart"
                        value={ownerForm.telegram || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, telegram: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        YouTube Channel URL
                      </span>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@cycleofchart"
                        value={ownerForm.youtube || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, youtube: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Facebook Profile URL
                      </span>
                      <input
                        type="url"
                        placeholder="https://facebook.com/cycleofchart"
                        value={ownerForm.facebook || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, facebook: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Twitter / X Profile URL
                      </span>
                      <input
                        type="url"
                        placeholder="https://twitter.com/cycleofchart"
                        value={ownerForm.twitter || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, twitter: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Founder Direct Email Address
                      </span>
                      <input
                        type="email"
                        placeholder="contact@cycleofchart.com"
                        value={ownerForm.email || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. [Save] */}
                <div className="pt-4 border-t border-sky-100 dark:border-sky-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saves all changes made to the Founder / Owner Profile immediately.
                  </div>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    <span>Save Founder Profile</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PROFILE 2: CYCLE OF CHART / BRAND PROFILE (RIGHT) */}
            {/* ========================================================================= */}
            {(activeSection === "all" || activeSection === "profile2") && (
              <div className="rounded-3xl border border-cyan-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-cyan-950/60 dark:bg-slate-900/90 space-y-6">
                {/* Profile 2 Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-100 dark:border-cyan-950/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-400 shadow-sm">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          CYCLE OF CHART PROFILE
                        </h3>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
                          Right Column
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Brand identity, logo/image, institutional role, narrative statement, and official channels.
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-1 rounded-xl self-start sm:self-center border border-cyan-200/60 dark:border-cyan-900/40">
                    Profile 2 Controls
                  </span>
                </div>

                {/* 1. [Logo/Image] */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-cyan-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      [Logo/Image] Brand / Profile 2 Image & Logo
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-center">
                        {ownerForm.profile2PhotoUrl ? (
                          <img
                            src={ownerForm.profile2PhotoUrl}
                            alt="Brand"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <Building2 size={32} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-cyan-700 transition-colors">
                          <Upload size={14} />
                          <span>Upload Brand Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onProfile2PhotoUpload || onPhotoUpload}
                            className="hidden"
                          />
                        </label>

                        {ownerForm.profile2PhotoUrl && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setOwnerForm((prev) => ({ ...prev, profile2PhotoUrl: "" }))}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/40"
                          >
                            <Trash2 size={13} className="mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Direct Logo / Image URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={ownerForm.profile2PhotoUrl || ""}
                          onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2PhotoUrl: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                        {ownerForm.profile2PhotoUrl?.startsWith("data:image/") && (
                          <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles size={13} className="shrink-0 text-amber-500" />
                            <span>Raw Base64 image detected. Will auto-upload to ImgBB CDN upon saving.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. [Name] */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    [Name] Brand Profile Name (e.g. Cycle of Chart) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cycle of Chart"
                    value={ownerForm.profile2Name || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2Name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Changing this name updates only the Brand profile on the right column. It will never overwrite the Founder name.
                  </p>
                </div>

                {/* 3. [Role] */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    [Role] Brand Designation & Title
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Title / Role (English)
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Institutional Trading Mentor"
                        value={ownerForm.profile2Role || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2Role: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Title / Role (Bengali)
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. ইন্সটিটিউশনাল ট্রেডিং মেন্টর"
                        value={ownerForm.profile2RoleBn || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2RoleBn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. [Description] */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-cyan-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      [Description] Brand Narrative / Mission Statement
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Brand Description (English)
                      </span>
                      <textarea
                        rows={3}
                        placeholder="Cycle of Chart is an institutional trading education and market research initiative committed to mentoring traders in SMC, liquidity engineering, and rule-based execution."
                        value={ownerForm.profile2BioEn || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2BioEn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Brand Description (Bengali)
                      </span>
                      <textarea
                        rows={3}
                        placeholder="সাইকেল অব চার্ট একটি প্রাতিষ্ঠানিক ট্রেডিং শিক্ষা ও মার্কেট রিসার্চ প্ল্যাটফর্ম যা এসএমসি, লিকুইডিটি ইঞ্জিনিয়ারিং এবং নিয়মতান্ত্রিক এক্সিকিউশনে ট্রেডারদের প্রশিক্ষণ দেয়।"
                        value={ownerForm.profile2BioBn || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2BioBn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. [Methodology] */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-cyan-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      [Methodology] Brand Core Methodology / Trading Style
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. SMC, Liquidity & Order Flow Delivery"
                    value={ownerForm.profile2TradingStyle || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2TradingStyle: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Institutional focus and trading methodology for the Cycle of Chart brand profile.
                  </p>
                </div>

                {/* 6. [Social Links] */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-cyan-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      [Social Links] Brand Official Channels & Contact Links
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Official Telegram Channel
                      </span>
                      <input
                        type="text"
                        placeholder="https://t.me/cycleofchart"
                        value={ownerForm.profile2Telegram || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2Telegram: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Official YouTube Channel URL
                      </span>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@cycleofchart"
                        value={ownerForm.profile2Youtube || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2Youtube: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Official Facebook Page URL
                      </span>
                      <input
                        type="url"
                        placeholder="https://facebook.com/cycleofchart"
                        value={ownerForm.profile2Facebook || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2Facebook: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Official Twitter / X URL
                      </span>
                      <input
                        type="url"
                        placeholder="https://twitter.com/cycleofchart"
                        value={ownerForm.profile2Twitter || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2Twitter: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Official Contact Email
                      </span>
                      <input
                        type="email"
                        placeholder="contact@cycleofchart.com"
                        value={ownerForm.profile2Email || ""}
                        onChange={(e) => setOwnerForm((prev) => ({ ...prev, profile2Email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. [Save] */}
                <div className="pt-4 border-t border-cyan-100 dark:border-cyan-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saves all changes made to the Cycle of Chart / Brand Profile immediately.
                  </div>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    <span>Save Cycle of Chart Profile</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CENTER SECTION: CREDENTIALS & STATS */}
            {/* ========================================================================= */}
            {(activeSection === "all" || activeSection === "center") && (
              <div className="rounded-3xl border border-amber-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-amber-950/60 dark:bg-slate-900/90 space-y-6">
                {/* Center Section Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100 dark:border-amber-950/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400 shadow-sm">
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          CENTER SECTION — NARRATIVE & CREDENTIAL CARDS
                        </h3>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                          Center Content
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Extended experience narrative paragraph and the 3 dynamic statistic credential cards.
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl self-start sm:self-center border border-amber-200/60 dark:border-amber-900/40">
                    Center Section
                  </span>
                </div>

                {/* Experience Narrative Paragraph Card */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-500" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Experience Narrative Paragraph
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Optional extended narrative paragraph displayed beneath the primary descriptions.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          ownerForm.showDetailsParagraph
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {ownerForm.showDetailsParagraph ? "Shown on Home" : "Hidden (Disabled)"}
                      </span>
                      <Switch
                        checked={ownerForm.showDetailsParagraph}
                        onCheckedChange={(checked) =>
                          setOwnerForm((prev) => ({ ...prev, showDetailsParagraph: checked }))
                        }
                        aria-label="Toggle Experience Narrative Paragraph"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Experience Narrative (English)
                      </span>
                      <textarea
                        rows={3}
                        placeholder="Over 6+ years of specialized market experience researching interbank price delivery algorithms..."
                        value={ownerForm.detailsEn || ""}
                        onChange={(e) =>
                          setOwnerForm((prev) => ({ ...prev, detailsEn: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium leading-relaxed outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Experience Narrative (Bengali)
                      </span>
                      <textarea
                        rows={3}
                        placeholder="মার্কেট এক্সপেরিয়েন্স বিস্তারিত বাংলায়..."
                        value={ownerForm.detailsBn || ""}
                        onChange={(e) =>
                          setOwnerForm((prev) => ({ ...prev, detailsBn: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium leading-relaxed outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Credential Stat Cards Controls */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Dynamic Credential & Statistic Cards
                    </h4>
                  </div>

                  {/* Card 1: Experience Card */}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400">
                          {renderOwnerStatIcon(ownerForm.experienceIcon || "clock", "size-4")}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Market Experience Card</span>
                          <span
                            className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ownerForm.showExperienceCard
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {ownerForm.showExperienceCard ? "Active" : "Disabled (Hidden)"}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={ownerForm.showExperienceCard}
                        onCheckedChange={(checked) =>
                          setOwnerForm((prev) => ({ ...prev, showExperienceCard: checked }))
                        }
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
                          value={ownerForm.experienceLabel || ""}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, experienceLabel: e.target.value }))
                          }
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
                          value={ownerForm.experienceYears || ""}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, experienceYears: e.target.value }))
                          }
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Card Icon
                        </label>
                        <select
                          value={ownerForm.experienceIcon || "clock"}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, experienceIcon: e.target.value }))
                          }
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="clock">Clock (Default)</option>
                          <option value="calendar">Calendar</option>
                          <option value="trending">Trending Up</option>
                          <option value="shield">Shield</option>
                          <option value="award">Award</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Students Mentored */}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
                          {renderOwnerStatIcon(ownerForm.mentoredIcon || "users", "size-4")}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Traders Mentored Card</span>
                          <span
                            className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ownerForm.showMentoredCard
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {ownerForm.showMentoredCard ? "Active" : "Disabled (Hidden)"}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={ownerForm.showMentoredCard}
                        onCheckedChange={(checked) =>
                          setOwnerForm((prev) => ({ ...prev, showMentoredCard: checked }))
                        }
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
                          value={ownerForm.mentoredLabel || ""}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, mentoredLabel: e.target.value }))
                          }
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
                          value={ownerForm.studentsCount || ""}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, studentsCount: e.target.value }))
                          }
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Card Icon
                        </label>
                        <select
                          value={ownerForm.mentoredIcon || "users"}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, mentoredIcon: e.target.value }))
                          }
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
                          <span
                            className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ownerForm.showMethodologyCard
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {ownerForm.showMethodologyCard ? "Active" : "Disabled (Hidden)"}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={ownerForm.showMethodologyCard}
                        onCheckedChange={(checked) =>
                          setOwnerForm((prev) => ({ ...prev, showMethodologyCard: checked }))
                        }
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
                          value={ownerForm.methodologyLabel || ""}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, methodologyLabel: e.target.value }))
                          }
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
                          value={ownerForm.tradingStyle || ""}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, tradingStyle: e.target.value }))
                          }
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Card Icon
                        </label>
                        <select
                          value={ownerForm.methodologyIcon || "award"}
                          onChange={(e) =>
                            setOwnerForm((prev) => ({ ...prev, methodologyIcon: e.target.value }))
                          }
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

                {/* Center Section Save */}
                <div className="pt-4 border-t border-amber-100 dark:border-amber-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saves narrative paragraph and credential stat card settings.
                  </div>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    <span>Save Section Settings & Credentials</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Bottom Unified Master Action Bar */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
              <div className="hidden sm:block">
                <div className="text-xs font-extrabold">Dual-Profile CMS Ready</div>
                <div className="text-[11px] text-slate-400">Changes save directly to PostgreSQL settings and sync immediately.</div>
              </div>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto min-w-[220px] bg-[#0284c7] hover:bg-sky-600 font-extrabold text-white text-sm shadow-md py-3 px-6 rounded-2xl gap-2"
              >
                {isSaving ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                <span>Save All Profile Changes</span>
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
                Live Dual-Profile Home Preview
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

          {/* Visibility Status Indicator */}
          {ownerForm.isVisible ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Eye size={16} className="shrink-0 text-emerald-500" />
              <span>
                Visible on Live Website: Active at{" "}
                <code className="rounded bg-emerald-500/20 px-1 py-0.5 font-mono text-[11px]">
                  /#owner-profile
                </code>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <EyeOff size={16} className="shrink-0 text-rose-500" />
              <span>Hidden from Website: Section is currently invisible to visitors on the live home page.</span>
            </div>
          )}

          {/* Preview Box Styled Exactly Like Public Home Section */}
          <div className="rounded-3xl border border-slate-200/90 bg-[#070e1b] p-5 sm:p-6 text-white shadow-2xl overflow-hidden relative">
            <AnimatedRgbBorder />
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              {/* Header */}
              <div className="text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#38bdf8]">
                  {ownerPreviewLang === "bn" ? "ফাউন্ডার ও মেন্টর পরিচিতি" : "FOUNDER & LEAD MENTORS"}
                </span>
                <h4 className="text-base sm:text-lg font-black text-white mt-1">
                  {ownerPreviewLang === "bn" ? "সাইকেল অব চার্ট-এর রূপকার" : "The Mind Behind Cycle of Chart"}
                </h4>
              </div>

              {/* Dual Profile Side-by-Side Cards (Matching Home.tsx) */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                {/* Profile 1 (Left): Founder */}
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Founder
                  </span>

                  <div className="relative mt-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-sky-500 to-blue-600 shadow-md">
                      {ownerForm.photoUrl ? (
                        <img
                          src={ownerForm.photoUrl}
                          alt={ownerForm.name || "Founder"}
                          className="w-full h-full object-cover object-top rounded-[10px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <UserCheck size={22} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-xs sm:text-sm font-black text-white line-clamp-1">
                    {ownerForm.name || "Founder Name"}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-sky-400 line-clamp-1">
                    {ownerPreviewLang === "bn" && ownerForm.roleBn
                      ? ownerForm.roleBn
                      : ownerForm.role || "Lead Trader"}
                  </div>

                  {/* Profile 1 Socials */}
                  <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                    {ownerForm.telegram && (
                      <span className="p-1 rounded bg-slate-800 text-sky-400" title="Telegram">
                        <Send size={10} />
                      </span>
                    )}
                    {ownerForm.youtube && (
                      <span className="p-1 rounded bg-slate-800 text-rose-400" title="YouTube">
                        <ExternalLink size={10} />
                      </span>
                    )}
                    {ownerForm.facebook && (
                      <span className="p-1 rounded bg-slate-800 text-blue-400" title="Facebook">
                        <Globe size={10} />
                      </span>
                    )}
                    {ownerForm.email && (
                      <span className="p-1 rounded bg-slate-800 text-emerald-400" title="Email">
                        <Mail size={10} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile 2 (Right): Brand / Institutional */}
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Brand
                  </span>

                  <div className="relative mt-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-cyan-500 to-sky-600 shadow-md">
                      {p2Photo ? (
                        <img
                          src={p2Photo}
                          alt={p2Name}
                          className="w-full h-full object-cover object-top rounded-[10px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <Building2 size={22} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-xs sm:text-sm font-black text-white line-clamp-1">
                    {p2Name}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-cyan-400 line-clamp-1">
                    {p2Role}
                  </div>

                  {/* Profile 2 Socials */}
                  <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                    {ownerForm.profile2Telegram && (
                      <span className="p-1 rounded bg-slate-800 text-sky-400" title="Telegram">
                        <Send size={10} />
                      </span>
                    )}
                    {ownerForm.profile2Youtube && (
                      <span className="p-1 rounded bg-slate-800 text-rose-400" title="YouTube">
                        <ExternalLink size={10} />
                      </span>
                    )}
                    {ownerForm.profile2Facebook && (
                      <span className="p-1 rounded bg-slate-800 text-blue-400" title="Facebook">
                        <Globe size={10} />
                      </span>
                    )}
                    {ownerForm.profile2Email && (
                      <span className="p-1 rounded bg-slate-800 text-emerald-400" title="Email">
                        <Mail size={10} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio & Content (Positioned between/below both profiles) */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <p className="text-xs text-slate-300 leading-relaxed text-center sm:text-left">
                  {ownerPreviewLang === "bn" && ownerForm.bioBn
                    ? ownerForm.bioBn
                    : ownerForm.bioEn || "Biography text goes here..."}
                </p>

                {p2Bio && (
                  <p className="text-[11px] text-cyan-200/80 leading-relaxed pt-1 border-t border-slate-800/50 text-center sm:text-left">
                    {p2Bio}
                  </p>
                )}

                {/* Optional Narrative Paragraph */}
                {ownerForm.showDetailsParagraph && (ownerForm.detailsEn || ownerForm.detailsBn) && (
                  <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/50 text-center sm:text-left">
                    {ownerPreviewLang === "bn" && ownerForm.detailsBn
                      ? ownerForm.detailsBn
                      : ownerForm.detailsEn}
                  </p>
                )}
              </div>

              {/* Dynamic Credentials & Statistic Cards */}
              {(() => {
                const activeCards = [];
                if (ownerForm.showExperienceCard) {
                  activeCards.push({
                    key: "exp",
                    label: ownerForm.experienceLabel || (ownerPreviewLang === "bn" ? "মার্কেট অভিজ্ঞতা" : "Market Experience"),
                    value: ownerForm.experienceYears || "6+ Years",
                    icon: ownerForm.experienceIcon || "clock",
                    colorClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                  });
                }
                if (ownerForm.showMentoredCard) {
                  activeCards.push({
                    key: "mentored",
                    label: ownerForm.mentoredLabel || (ownerPreviewLang === "bn" ? "মেন্টর্ড ট্রেডার্স" : "Traders Mentored"),
                    value: ownerForm.studentsCount || "1,500+",
                    icon: ownerForm.mentoredIcon || "users",
                    colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  });
                }
                if (ownerForm.showMethodologyCard) {
                  activeCards.push({
                    key: "methodology",
                    label: ownerForm.methodologyLabel || (ownerPreviewLang === "bn" ? "কোর মেথোডলজি" : "Core Methodology"),
                    value: ownerForm.tradingStyle || (ownerPreviewLang === "bn" ? "ইনস্টিটিউশনাল অর্ডার ফ্লো, লিকুইডিটি ও (SMC)" : "Institutional Order Flow, Liquidity & (SMC)"),
                    icon: ownerForm.methodologyIcon || "award",
                    colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  });
                }

                if (activeCards.length === 0) return null;

                if (activeCards.length === 1) {
                  const card = activeCards[0];
                  return (
                    <div className="flex justify-center pt-1 text-[11px]">
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2 max-w-sm w-full">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${card.colorClass}`}>
                          {renderOwnerStatIcon(card.icon, "size-3.5")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] text-slate-400 truncate">{card.label}</div>
                          <div className="font-extrabold text-white truncate text-xs">{card.value}</div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className={`grid grid-cols-1 ${
                      activeCards.length === 2 ? "grid-cols-2" : "grid-cols-3"
                    } gap-2 pt-1 text-[11px]`}
                  >
                    {activeCards.map((card) => (
                      <div
                        key={card.key}
                        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-2 min-w-0"
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${card.colorClass}`}
                        >
                          {renderOwnerStatIcon(card.icon, "size-3")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[8px] text-slate-400 truncate">{card.label}</div>
                          <div className="font-extrabold text-white truncate text-[10px]">{card.value}</div>
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
  );
};
