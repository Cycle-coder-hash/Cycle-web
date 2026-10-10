import React from "react";
import {
  UserCheck,
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
  RefreshCw,
  CheckCircle2,
  Youtube,
  Instagram,
  Facebook,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const TikTokIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.27 6.27 0 0 0 1.93-4.52V8.69a8.18 8.18 0 0 0 4.79 1.54V6.78a4.85 4.85 0 0 1-.99-.09Z" />
  </svg>
);

export const XTwitterIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
  tiktok?: string;
  youtube?: string;
  instagram?: string;
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

export type OwnerProfileSectionFilter = "all" | "profile1" | "profile2" | "socials" | "center";

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

export interface OwnerCenterAndSocialsSectionProps {
  activeSection: OwnerProfileSectionFilter;
  ownerForm: OwnerFormData;
  setOwnerForm: React.Dispatch<React.SetStateAction<OwnerFormData>>;
  isSaving?: boolean;
}

export const OwnerCenterAndSocialsSection: React.FC<OwnerCenterAndSocialsSectionProps> = ({
  activeSection,
  ownerForm,
  setOwnerForm,
  isSaving,
}) => {
  return (
    <>
      {/* ========================================================================= */}
      {/* CENTRAL SOCIAL MEDIA LINKS SECTION */}
      {/* ========================================================================= */}
      {(activeSection === "all" || activeSection === "socials") && (
        <div className="rounded-3xl border border-violet-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-violet-950/60 dark:bg-slate-900/90 space-y-6">
          {/* Social Media Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-violet-100 dark:border-violet-950/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400 shadow-sm">
                <Share2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    SOCIAL MEDIA LINKS
                  </h3>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                    Centralized Middle Row
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Controls the 5 centralized social media links shown in the middle area between the Founder and Brand profiles.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 rounded-xl self-start sm:self-center border border-violet-200/60 dark:border-violet-900/40">
              5 Central Channels
            </span>
          </div>

          {/* 5 Social Media Inputs */}
          <div className="space-y-4">
            {/* 1. TikTok */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <TikTokIcon className="size-3.5" />
                </div>
                <span>TikTok URL</span>
              </label>
              <input
                type="url"
                placeholder="https://tiktok.com/@cycleofchart"
                value={ownerForm.tiktok || ""}
                onChange={(e) => setOwnerForm((prev) => ({ ...prev, tiktok: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* 2. YouTube */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <Youtube size={15} />
                </div>
                <span>YouTube URL</span>
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@cycleofchart"
                value={ownerForm.youtube || ""}
                onChange={(e) => setOwnerForm((prev) => ({ ...prev, youtube: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* 3. Instagram */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-500/15 text-pink-600 dark:text-pink-400">
                  <Instagram size={15} />
                </div>
                <span>Instagram URL</span>
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/cycleofchart"
                value={ownerForm.instagram || ""}
                onChange={(e) => setOwnerForm((prev) => ({ ...prev, instagram: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* 4. X / Twitter */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
                  <XTwitterIcon className="size-3.5" />
                </div>
                <span>X / Twitter URL</span>
              </label>
              <input
                type="url"
                placeholder="https://x.com/cycleofchart"
                value={ownerForm.twitter || ""}
                onChange={(e) => setOwnerForm((prev) => ({ ...prev, twitter: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* 5. Facebook */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <Facebook size={15} />
                </div>
                <span>Facebook URL</span>
              </label>
              <input
                type="url"
                placeholder="https://facebook.com/cycleofchart"
                value={ownerForm.facebook || ""}
                onChange={(e) => setOwnerForm((prev) => ({ ...prev, facebook: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Save Social Media Links Button */}
          <div className="pt-4 border-t border-violet-100 dark:border-violet-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Saves all 5 centralized social media links. Leave empty to hide any icon.
            </div>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md gap-2"
            >
              {isSaving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span>Save Social Media Links</span>
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
    </>
  );
};
