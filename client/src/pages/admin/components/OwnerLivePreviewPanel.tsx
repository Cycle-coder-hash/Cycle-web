import React from "react";
import {
  UserCheck,
  Sparkles,
  Eye,
  EyeOff,
  Building2,
  Youtube,
  Instagram,
  Facebook,
} from "lucide-react";
import { AnimatedRgbBorder } from "@/components/AnimatedRgbBorder";
import {
  TikTokIcon,
  XTwitterIcon,
  renderOwnerStatIcon,
  type OwnerFormData,
} from "./OwnerCenterAndSocialsSection";

export interface OwnerLivePreviewPanelProps {
  ownerForm: OwnerFormData;
  ownerPreviewLang: "en" | "bn";
  setOwnerPreviewLang: (lang: "en" | "bn") => void;
}

export const OwnerLivePreviewPanel: React.FC<OwnerLivePreviewPanelProps> = ({
  ownerForm,
  ownerPreviewLang,
  setOwnerPreviewLang,
}) => {
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

          {/* Central Social Media Links in Preview */}
          {(() => {
            const previewSocials = [
              { key: "tiktok", label: "TikTok", url: ownerForm.tiktok, icon: TikTokIcon, color: "text-white bg-slate-800" },
              { key: "youtube", label: "YouTube", url: ownerForm.youtube, icon: Youtube, color: "text-rose-400 bg-slate-800" },
              { key: "instagram", label: "Instagram", url: ownerForm.instagram, icon: Instagram, color: "text-pink-400 bg-slate-800" },
              { key: "twitter", label: "X / Twitter", url: ownerForm.twitter, icon: XTwitterIcon, color: "text-sky-400 bg-slate-800" },
              { key: "facebook", label: "Facebook", url: ownerForm.facebook, icon: Facebook, color: "text-blue-400 bg-slate-800" },
            ].filter((item) => item.url && item.url.trim() !== "");

            if (previewSocials.length === 0) return null;

            return (
              <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-800/60">
                {previewSocials.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.key}
                      className={`p-1.5 rounded-lg border border-slate-700/60 shadow-sm ${item.color}`}
                      title={item.label}
                    >
                      <Icon className="size-3.5" />
                    </span>
                  );
                })}
              </div>
            );
          })()}

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
  );
};
