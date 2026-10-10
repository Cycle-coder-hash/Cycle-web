import React, { useState } from "react";
import {
  Camera,
  Upload,
  Trash2,
  UserCheck,
  FileText,
  Award,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Building2,
  Layers,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  TikTokIcon,
  XTwitterIcon,
  renderOwnerStatIcon,
  OwnerCenterAndSocialsSection,
  type OwnerFormData,
  type OwnerProfileSectionFilter,
} from "../components/OwnerCenterAndSocialsSection";
import { OwnerLivePreviewPanel } from "../components/OwnerLivePreviewPanel";

export { TikTokIcon, XTwitterIcon, renderOwnerStatIcon };
export type { OwnerFormData };

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
  const [activeSection, setActiveSection] = useState<OwnerProfileSectionFilter>("all");

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
            Independently manage both visible profiles and the centralized social media links displayed in the dual-profile section.
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
                onClick={() => setActiveSection("socials")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeSection === "socials"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Share2 size={14} className="text-violet-500" />
                <span>Social Media Links (Center)</span>
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
                        Public founder identity, image, designation, bio narrative, and execution methodology.
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

                {/* 6. [Save] */}
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
                        Brand identity, logo/image, institutional role, and narrative statement.
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

                {/* 6. [Save] */}
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

            <OwnerCenterAndSocialsSection
              activeSection={activeSection}
              ownerForm={ownerForm}
              setOwnerForm={setOwnerForm}
              isSaving={isSaving}
            />

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
        <OwnerLivePreviewPanel
          ownerForm={ownerForm}
          ownerPreviewLang={ownerPreviewLang}
          setOwnerPreviewLang={setOwnerPreviewLang}
        />
      </div>
    </div>
  );
};
