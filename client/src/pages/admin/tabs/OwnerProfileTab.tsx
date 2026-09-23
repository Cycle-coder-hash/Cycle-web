import React from "react";
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
}

interface OwnerProfileTabProps {
  ownerForm: OwnerFormData;
  setOwnerForm: React.Dispatch<React.SetStateAction<OwnerFormData>>;
  ownerPreviewLang: "en" | "bn";
  setOwnerPreviewLang: (lang: "en" | "bn") => void;
  onSave: (e: React.FormEvent) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onReload,
  isLoading,
  isSaving,
}) => {
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
            Manage the founder's biography, credentials, photo, and institutional trading profile displayed on the public website.
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
            <div className={`rounded-3xl border transition-all p-5 sm:p-6 shadow-sm ${
              ownerForm.isVisible
                ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                : "border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                    ownerForm.isVisible
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-rose-500 text-white shadow-rose-500/20"
                  }`}>
                    {ownerForm.isVisible ? <Eye size={22} /> : <EyeOff size={22} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Website Section Visibility
                      </h3>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ownerForm.isVisible
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                      }`}>
                        {ownerForm.isVisible ? "Visible / Active" : "Hidden / Inactive"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {ownerForm.isVisible
                        ? "The Founder & Owner Profile section (#owner-profile) is currently visible to all visitors on the Home page."
                        : "The Founder & Owner Profile section is completely HIDDEN from the Home page. Visitors will not see it."}
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
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Or paste direct image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={ownerForm.photoUrl}
                      onChange={(e) => setOwnerForm((prev) => ({ ...prev, photoUrl: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    {ownerForm.photoUrl?.startsWith("data:image/") && (
                      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Sparkles size={13} className="shrink-0 text-amber-500" />
                        <span>Raw Base64 image detected. Will auto-upload to ImgBB CDN upon saving.</span>
                      </div>
                    )}
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
                  onChange={(e) => setOwnerForm((prev) => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, role: e.target.value }))}
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
                    value={ownerForm.roleBn || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, roleBn: e.target.value }))}
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
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, bioEn: e.target.value }))}
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
                    value={ownerForm.bioBn || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, bioBn: e.target.value }))}
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
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      ownerForm.showDetailsParagraph
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
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

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Experience Narrative (English)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management."
                    value={ownerForm.detailsEn || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, detailsEn: e.target.value }))}
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
                    value={ownerForm.detailsBn || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, detailsBn: e.target.value }))}
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
                    value={ownerForm.telegram || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, telegram: e.target.value }))}
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
                    value={ownerForm.youtube || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, youtube: e.target.value }))}
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
                    value={ownerForm.facebook || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, facebook: e.target.value }))}
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
                    value={ownerForm.twitter || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, twitter: e.target.value }))}
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
                    value={ownerForm.email || ""}
                    onChange={(e) => setOwnerForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto min-w-[200px] bg-[#0284c7] hover:bg-sky-600 font-extrabold text-white text-sm shadow-md py-3"
              >
                {isSaving && <RefreshCw size={14} className="animate-spin mr-2" />}
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

          {/* Visibility Status Indicator */}
          {ownerForm.isVisible ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Eye size={16} className="shrink-0 text-emerald-500" />
              <span>Visible on Live Website: This section is active at <code className="rounded bg-emerald-500/20 px-1 py-0.5 font-mono text-[11px]">/#owner-profile</code></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <EyeOff size={16} className="shrink-0 text-rose-500" />
              <span>Hidden from Website: This section is currently invisible to visitors on the live home page.</span>
            </div>
          )}

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
                  <div
                    className={`grid grid-cols-1 ${
                      activeCards.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                    } gap-2 pt-2 text-[11px]`}
                  >
                    {activeCards.map((card) => (
                      <div
                        key={card.key}
                        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-2 min-w-0"
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${card.colorClass}`}
                        >
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
  );
};
