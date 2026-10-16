import {
  Activity,
  Award,
  Calendar,
  Clock,
  Facebook,
  GraduationCap,
  Instagram,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Youtube,
  Zap,
} from "lucide-react";
import { AnimatedRgbBorder } from "@/components/AnimatedRgbBorder";

export interface HomeOwnerProfileData {
  isVisible?: boolean;
  name: string;
  role: string;
  roleBn?: string;
  bioEn: string;
  bioBn?: string;
  photoUrl: string;
  detailsEn?: string;
  detailsBn?: string;
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
  showExperienceCard?: boolean;
  experienceLabel?: string;
  experienceIcon?: string;
  showMentoredCard?: boolean;
  mentoredLabel?: string;
  mentoredIcon?: string;
  showMethodologyCard?: boolean;
  methodologyLabel?: string;
  methodologyIcon?: string;
  showDetailsParagraph?: boolean;
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

export interface HomeOwnerProfileCopy {
  ownerEyebrow: string;
  ownerTitle: string;
  ownerDesc: string;
  ownerExpLabel: string;
  ownerStudentsLabel: string;
  ownerStyleLabel: string;
}

export interface HomeOwnerProfileSectionProps {
  isBn: boolean;
  ownerProfile?: HomeOwnerProfileData | null;
  copy: HomeOwnerProfileCopy;
}

const TikTokIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.27 6.27 0 0 0 1.93-4.52V8.69a8.18 8.18 0 0 0 4.79 1.54V6.78a4.85 4.85 0 0 1-.99-.09Z" />
  </svg>
);

const XTwitterIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function renderOwnerStatIcon(iconName?: string, className: string = "size-5") {
  switch (iconName) {
    case "clock":
      return <Clock className={className} />;
    case "calendar":
      return <Calendar className={className} />;
    case "trending":
    case "trending-up":
      return <TrendingUp className={className} />;
    case "shield":
      return <Shield className={className} />;
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
}

export function HomeOwnerProfileSection({
  isBn,
  ownerProfile,
  copy,
}: HomeOwnerProfileSectionProps) {
  if (ownerProfile?.isVisible === false) {
    return null;
  }

  return (
    <section
      id="owner-profile"
      className="relative py-10 sm:py-24 text-slate-900 dark:text-white bg-slate-50/50 dark:bg-[#070e1b] overflow-hidden"
    >
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none dark:hidden" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none dark:hidden" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-5 lg:px-8 z-10">
        {/* Section Header */}
        <div className="mb-6 sm:mb-12 text-center max-w-3xl mx-auto">
          <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[.2em] text-[#0284c7] dark:text-[#38bdf8]">
            {copy.ownerEyebrow}
          </p>
          <h2 className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {copy.ownerTitle}
          </h2>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-400">
            {copy.ownerDesc}
          </p>
        </div>

        {/* Profile Card */}
        {ownerProfile && (
          <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/85 p-4 sm:p-10 lg:p-12 backdrop-blur-md shadow-xl dark:border-slate-800/90 dark:bg-[#0b162a]/80 dark:shadow-2xl dark:shadow-sky-950/30 transition-all">
            <AnimatedRgbBorder />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-8 xl:gap-10 items-center relative z-10">
              {/* Left Column: Profile 1 */}
              <div className="lg:col-span-3 flex flex-col items-center text-center">
                <div className="relative group">
                  {/* Ambient Glow */}
                  <div className="absolute -inset-1 rounded-[22px] sm:rounded-[28px] bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 opacity-60 blur-md group-hover:opacity-85 transition duration-500" />

                  {/* Photo Container */}
                  <div className="relative w-32 h-32 sm:w-52 sm:h-52 lg:w-40 lg:h-40 xl:w-48 xl:h-48 rounded-[20px] sm:rounded-[24px] overflow-hidden p-1 bg-gradient-to-tr from-sky-500 via-cyan-400 to-blue-600 shadow-xl shadow-sky-500/20">
                    <img
                      src={ownerProfile.photoUrl}
                      alt={ownerProfile.name}
                      className="w-full h-full object-cover object-top rounded-[16px] sm:rounded-[20px] transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>

                <h3 className="mt-3.5 sm:mt-5 text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {ownerProfile.name}
                </h3>

                <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300 border border-sky-500/20">
                  <ShieldCheck size={13} className="text-sky-500 shrink-0 sm:size-3.5" />
                  <span>{isBn && ownerProfile.roleBn ? ownerProfile.roleBn : ownerProfile.role}</span>
                </div>
              </div>

              {/* Center Column: Description / Content & Credentials */}
              <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center">
                {/* Bio Text */}
                <div className="space-y-2.5 sm:space-y-4 text-xs sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                  <p className="font-medium whitespace-pre-line">
                    {isBn && ownerProfile.bioBn
                      ? ownerProfile.bioBn
                      : ownerProfile.bioEn ||
                        "Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution."}
                  </p>
                  {(() => {
                    const p2Bio =
                      isBn && ownerProfile.profile2BioBn
                        ? ownerProfile.profile2BioBn
                        : ownerProfile.profile2BioEn;
                    if (!p2Bio) return null;
                    return (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        {p2Bio}
                      </p>
                    );
                  })()}
                  {ownerProfile.showDetailsParagraph && (ownerProfile.detailsBn || ownerProfile.detailsEn) && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed pt-1">
                      {isBn && ownerProfile.detailsBn ? ownerProfile.detailsBn : ownerProfile.detailsEn}
                    </p>
                  )}
                </div>

                {/* Centralized Social Media Links Row */}
                {(() => {
                  const socials = [
                    {
                      key: "tiktok",
                      label: "TikTok",
                      url: ownerProfile.tiktok,
                      icon: TikTokIcon,
                      hoverColor:
                        "hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30",
                    },
                    {
                      key: "youtube",
                      label: "YouTube",
                      url: ownerProfile.youtube,
                      icon: Youtube,
                      hoverColor:
                        "hover:bg-rose-500/15 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 hover:border-rose-500/30",
                    },
                    {
                      key: "instagram",
                      label: "Instagram",
                      url: ownerProfile.instagram,
                      icon: Instagram,
                      hoverColor:
                        "hover:bg-pink-500/15 hover:text-pink-600 dark:hover:bg-pink-500/20 dark:hover:text-pink-400 hover:border-pink-500/30",
                    },
                    {
                      key: "twitter",
                      label: "X / Twitter",
                      url: ownerProfile.twitter,
                      icon: XTwitterIcon,
                      hoverColor:
                        "hover:bg-sky-500/15 hover:text-sky-600 dark:hover:bg-sky-500/20 dark:hover:text-sky-400 hover:border-sky-500/30",
                    },
                    {
                      key: "facebook",
                      label: "Facebook",
                      url: ownerProfile.facebook,
                      icon: Facebook,
                      hoverColor:
                        "hover:bg-blue-500/15 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 hover:border-blue-500/30",
                    },
                  ].filter((item) => item.url && item.url.trim() !== "");

                  if (socials.length === 0) return null;

                  return (
                    <div className="flex items-center justify-center gap-2 sm:gap-3 py-0.5 sm:py-1">
                      {socials.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.key}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex h-9 w-9 min-h-[36px] min-w-[36px] sm:h-11 sm:w-11 sm:min-h-[44px] sm:min-w-[44px] items-center justify-center rounded-xl sm:rounded-2xl bg-slate-100/90 text-slate-600 dark:bg-slate-800/90 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 shadow-sm transition-all hover:scale-105 active:scale-95 ${item.hoverColor}`}
                            title={item.label}
                            aria-label={item.label}
                          >
                            <Icon className="size-4 sm:size-5 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Dynamic Credentials & Statistic Cards */}
                {(() => {
                  const activeCards = [];
                  if (ownerProfile.showExperienceCard) {
                    activeCards.push({
                      key: "exp",
                      label: ownerProfile.experienceLabel || copy.ownerExpLabel,
                      value: ownerProfile.experienceYears || "6+ Years",
                      icon: ownerProfile.experienceIcon || "clock",
                      iconBg: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
                    });
                  }
                  if (ownerProfile.showMentoredCard) {
                    activeCards.push({
                      key: "mentored",
                      label: ownerProfile.mentoredLabel || copy.ownerStudentsLabel,
                      value: ownerProfile.studentsCount || "1,500+",
                      icon: ownerProfile.mentoredIcon || "users",
                      iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
                    });
                  }
                  if (ownerProfile.showMethodologyCard !== false) {
                    activeCards.push({
                      key: "methodology",
                      label: ownerProfile.methodologyLabel || copy.ownerStyleLabel,
                      value: ownerProfile.tradingStyle || "Institutional Order Flow, Liquidity & (SMC)",
                      icon: ownerProfile.methodologyIcon || "award",
                      iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
                    });
                  }

                  if (activeCards.length === 0) return null;

                  if (activeCards.length === 1) {
                    const card = activeCards[0];
                    return (
                      <div className="flex justify-center pt-1.5 sm:pt-2">
                        <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2.5 sm:p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
                          <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${card.iconBg}`}>
                            {renderOwnerStatIcon(card.icon, "size-4 sm:size-5")}
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {card.label}
                            </div>
                            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                              {card.value}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      className={`grid grid-cols-2 ${
                        activeCards.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                      } gap-2 sm:gap-3 pt-1.5 sm:pt-2`}
                    >
                      {activeCards.map((card, idx) => (
                        <div
                          key={card.key}
                          className={`flex items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2 sm:p-3 dark:border-slate-800 dark:bg-slate-900/70 text-left ${
                            idx === 2 && activeCards.length === 3 ? "col-span-2 sm:col-span-1" : ""
                          }`}
                        >
                          <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${card.iconBg}`}>
                            {renderOwnerStatIcon(card.icon, "size-3.5 sm:size-5")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                              {card.label}
                            </div>
                            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                              {card.value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Profile 2 */}
              {(() => {
                const p2Name = ownerProfile.profile2Name || "Cycle of Chart";
                const p2Role =
                  isBn && ownerProfile.profile2RoleBn
                    ? ownerProfile.profile2RoleBn
                    : ownerProfile.profile2Role ||
                      (isBn ? "ইন্সটিটিউশনাল ট্রেডিং মেন্টর" : "Institutional Trading Mentor");
                const p2Photo = ownerProfile.profile2PhotoUrl || "/logo.jpg";

                return (
                  <div className="lg:col-span-3 flex flex-col items-center text-center">
                    <div className="relative group">
                      {/* Ambient Glow */}
                      <div className="absolute -inset-1 rounded-[22px] sm:rounded-[28px] bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 opacity-60 blur-md group-hover:opacity-85 transition duration-500" />

                      {/* Photo Container */}
                      <div className="relative w-32 h-32 sm:w-52 sm:h-52 lg:w-40 lg:h-40 xl:w-48 xl:h-48 rounded-[20px] sm:rounded-[24px] overflow-hidden p-1 bg-gradient-to-tr from-sky-500 via-cyan-400 to-blue-600 shadow-xl shadow-sky-500/20">
                        <img
                          src={p2Photo}
                          alt={p2Name}
                          className="w-full h-full object-cover object-top rounded-[16px] sm:rounded-[20px] transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <h3 className="mt-3.5 sm:mt-5 text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                      {p2Name}
                    </h3>

                    <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300 border border-sky-500/20">
                      <ShieldCheck size={13} className="text-sky-500 shrink-0 sm:size-3.5" />
                      <span>{p2Role}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
