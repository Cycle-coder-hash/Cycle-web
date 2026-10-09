import { getSetting, setSetting } from "../../infra/db";

export interface OwnerProfile {
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

export const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  isVisible: true,
  name: "Al-Amin Islam",
  role: "Founder & Lead Institutional Analyst",
  roleBn: "Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¤Ã Â¦Â¿Ã Â¦Â·Ã Â§ÂÃ Â¦Â Ã Â¦Â¾Ã Â¦Â¤Ã Â¦Â¾ Ã Â¦â€œ Ã Â¦Â²Ã Â¦Â¿Ã Â¦Â¡ Ã Â¦â€¡Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¸Ã Â¦Å¸Ã Â¦Â¿Ã Â¦Å¸Ã Â¦Â¿Ã Â¦â€°Ã Â¦Â¶Ã Â¦Â¨Ã Â¦Â¾Ã Â¦Â² Ã Â¦â€¦Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦Â¨Ã Â¦Â¾Ã Â¦Â²Ã Â¦Â¿Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸",
  bioEn: "Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution.",
  bioBn: "Ã Â¦â€¡Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¸Ã Â¦Å¸Ã Â¦Â¿Ã Â¦Å¸Ã Â¦Â¿Ã Â¦â€°Ã Â¦Â¶Ã Â¦Â¨Ã Â¦Â¾Ã Â¦Â² Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¾Ã Â¦â€¡Ã Â¦Â¸ Ã Â¦Â¡Ã Â§â€¡Ã Â¦Â²Ã Â¦Â¿Ã Â¦Â­Ã Â¦Â¾Ã Â¦Â°Ã Â¦Â¿, Ã Â¦Â®Ã Â¦Â¾Ã Â¦Â°Ã Â§ÂÃ Â¦â€¢Ã Â§â€¡Ã Â¦Å¸ Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸Ã Â§ÂÃ Â¦Â°Ã Â¦Â¾Ã Â¦â€¢Ã Â¦Å¡Ã Â¦Â¾Ã Â¦Â°, Ã Â¦Â²Ã Â¦Â¿Ã Â¦â€¢Ã Â§ÂÃ Â¦â€¡Ã Â¦Â¡Ã Â¦Â¿Ã Â¦Å¸Ã Â¦Â¿ Ã Â¦Â¡Ã Â¦Â¾Ã Â¦Â¯Ã Â¦Â¼Ã Â¦Â¨Ã Â¦Â¾Ã Â¦Â®Ã Â¦Â¿Ã Â¦â€¢Ã Â§ÂÃ Â¦Â¸ Ã Â¦ÂÃ Â¦Â¬Ã Â¦â€š Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¾Ã Â¦â€¡Ã Â¦Â¸ Ã Â¦â€¦Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦â€¢Ã Â¦Â¶Ã Â¦Â¨ Ã Â¦Â¸Ã Â§ÂÃ Â¦ÂªÃ Â§â€¡Ã Â¦Â¶Ã Â¦Â¾Ã Â¦Â²Ã Â¦Â¿Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸Ã Â¥Â¤ Ã Â¦â€ Ã Â¦Â¬Ã Â§â€¡Ã Â¦â€”Ã Â¦Â¤Ã Â¦Â¾Ã Â¦Â¡Ã Â¦Â¼Ã Â¦Â¿Ã Â¦Â¤ Ã Â¦â€¦Ã Â¦Â¨Ã Â§ÂÃ Â¦Â®Ã Â¦Â¾Ã Â¦Â¨ Ã Â¦Â¦Ã Â§â€šÃ Â¦Â° Ã Â¦â€¢Ã Â¦Â°Ã Â§â€¡ Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸Ã Â§ÂÃ Â¦Â°Ã Â¦Â¾Ã Â¦â€¢Ã Â¦Å¡Ã Â¦Â¾Ã Â¦Â°Ã Â§ÂÃ Â¦Â¡ Ã Â¦â€ Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¡Ã Â¦Â¾Ã Â¦Â°Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¡Ã Â¦Â¿Ã Â¦â€š, Ã Â¦Â¸Ã Â¦Â¿Ã Â¦Â¸Ã Â§ÂÃ Â¦Å¸Ã Â§â€¡Ã Â¦Â®Ã Â§â€¡Ã Â¦Å¸Ã Â¦Â¿Ã Â¦â€¢ Ã Â¦â€¦Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦Â¨Ã Â¦Â¾Ã Â¦Â²Ã Â¦Â¾Ã Â¦â€¡Ã Â¦Â¸Ã Â¦Â¿Ã Â¦Â¸ Ã Â¦ÂÃ Â¦Â¬Ã Â¦â€š Ã Â¦Â¸Ã Â§ÂÃ Â¦Â¶Ã Â§Æ’Ã Â¦â„¢Ã Â§ÂÃ Â¦â€“Ã Â¦Â² Ã Â¦ÂÃ Â¦â€¢Ã Â§ÂÃ Â¦Â¸Ã Â¦Â¿Ã Â¦â€¢Ã Â¦Â¿Ã Â¦â€°Ã Â¦Â¶Ã Â¦Â¨ Ã Â¦Â¤Ã Â§Ë†Ã Â¦Â°Ã Â¦Â¿Ã Â¦Â¤Ã Â§â€¡ Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¤Ã Â¦Â¿Ã Â¦Â¶Ã Â§ÂÃ Â¦Â°Ã Â§ÂÃ Â¦Â¤Ã Â¦Â¿Ã Â¦Â¬Ã Â¦Â¦Ã Â§ÂÃ Â¦Â§Ã Â¥Â¤",
  photoUrl: "/logo.jpg",
  detailsEn: "Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management.",
  detailsBn: "",
  experienceYears: "6+ Years",
  studentsCount: "1,500+",
  tradingStyle: "Institutional Order Flow, Liquidity & (SMC)",
  signatureQuoteEn: "Before you trade, understand trading. Before you deposit, understand trading.",
  signatureQuoteBn: "Ã Â¦Å¸Ã Â§ÂÃ Â¦Â°Ã Â§â€¡Ã Â¦Â¡ Ã Â¦â€¢Ã Â¦Â°Ã Â¦Â¾Ã Â¦Â° Ã Â¦â€ Ã Â¦â€”Ã Â§â€¡ Ã Â¦Å¸Ã Â§ÂÃ Â¦Â°Ã Â§â€¡Ã Â¦Â¡Ã Â¦Â¿Ã Â¦â€š Ã Â¦Â¬Ã Â§ÂÃ Â¦ÂÃ Â§ÂÃ Â¦Â¨Ã Â¥Â¤ Ã Â¦Â¡Ã Â¦Â¿Ã Â¦ÂªÃ Â§â€¹Ã Â¦Å“Ã Â¦Â¿Ã Â¦Å¸ Ã Â¦â€¢Ã Â¦Â°Ã Â¦Â¾Ã Â¦Â° Ã Â¦â€ Ã Â¦â€”Ã Â§â€¡ Ã Â¦Å¸Ã Â§ÂÃ Â¦Â°Ã Â§â€¡Ã Â¦Â¡Ã Â¦Â¿Ã Â¦â€š Ã Â¦Â¬Ã Â§ÂÃ Â¦ÂÃ Â§ÂÃ Â¦Â¨Ã Â¥Â¤",
  telegram: "https://t.me/cycleofchart",
  tiktok: "https://tiktok.com/@cycleofchart",
  youtube: "https://youtube.com/@cycleofchart",
  instagram: "https://instagram.com/cycleofchart",
  facebook: "https://facebook.com/cycleofchart",
  twitter: "https://x.com/cycleofchart",
  email: "contact@cycleofchart.com",
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
  profile2Name: "Cycle of Chart",
  profile2Role: "Institutional Trading Mentor",
  profile2RoleBn: "Ã Â¦â€¡Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¸Ã Â¦Å¸Ã Â¦Â¿Ã Â¦Å¸Ã Â¦Â¿Ã Â¦â€°Ã Â¦Â¶Ã Â¦Â¨Ã Â¦Â¾Ã Â¦Â² Ã Â¦Å¸Ã Â§ÂÃ Â¦Â°Ã Â§â€¡Ã Â¦Â¡Ã Â¦Â¿Ã Â¦â€š Ã Â¦Â®Ã Â§â€¡Ã Â¦Â¨Ã Â§ÂÃ Â¦Å¸Ã Â¦Â°",
  profile2PhotoUrl: "/logo.jpg",
  profile2BioEn: "Cycle of Chart is an institutional trading education and market research initiative committed to mentoring traders in SMC, liquidity engineering, and rule-based execution.",
  profile2BioBn: "Ã Â¦Â¸Ã Â¦Â¾Ã Â¦â€¡Ã Â¦â€¢Ã Â§â€¡Ã Â¦Â² Ã Â¦â€¦Ã Â¦Â¬ Ã Â¦Å¡Ã Â¦Â¾Ã Â¦Â°Ã Â§ÂÃ Â¦Å¸ Ã Â¦ÂÃ Â¦â€¢Ã Â¦Å¸Ã Â¦Â¿ Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¾Ã Â¦Â¤Ã Â¦Â¿Ã Â¦Â·Ã Â§ÂÃ Â¦Â Ã Â¦Â¾Ã Â¦Â¨Ã Â¦Â¿Ã Â¦â€¢ Ã Â¦Å¸Ã Â§ÂÃ Â¦Â°Ã Â§â€¡Ã Â¦Â¡Ã Â¦Â¿Ã Â¦â€š Ã Â¦Â¶Ã Â¦Â¿Ã Â¦â€¢Ã Â§ÂÃ Â¦Â·Ã Â¦Â¾ Ã Â¦â€œ Ã Â¦Â®Ã Â¦Â¾Ã Â¦Â°Ã Â§ÂÃ Â¦â€¢Ã Â§â€¡Ã Â¦Å¸ Ã Â¦Â°Ã Â¦Â¿Ã Â¦Â¸Ã Â¦Â¾Ã Â¦Â°Ã Â§ÂÃ Â¦Å¡ Ã Â¦ÂªÃ Â§ÂÃ Â¦Â²Ã Â§ÂÃ Â¦Â¯Ã Â¦Â¾Ã Â¦Å¸Ã Â¦Â«Ã Â¦Â°Ã Â§ÂÃ Â¦Â® Ã Â¦Â¯Ã Â¦Â¾ Ã Â¦ÂÃ Â¦Â¸Ã Â¦ÂÃ Â¦Â®Ã Â¦Â¸Ã Â¦Â¿, Ã Â¦Â²Ã Â¦Â¿Ã Â¦â€¢Ã Â§ÂÃ Â¦â€¡Ã Â¦Â¡Ã Â¦Â¿Ã Â¦Å¸Ã Â¦Â¿ Ã Â¦â€¡Ã Â¦Å¾Ã Â§ÂÃ Â¦Å“Ã Â¦Â¿Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Â¯Ã Â¦Â¼Ã Â¦Â¾Ã Â¦Â°Ã Â¦Â¿Ã Â¦â€š Ã Â¦ÂÃ Â¦Â¬Ã Â¦â€š Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Â¯Ã Â¦Â¼Ã Â¦Â®Ã Â¦Â¤Ã Â¦Â¾Ã Â¦Â¨Ã Â§ÂÃ Â¦Â¤Ã Â§ÂÃ Â¦Â°Ã Â¦Â¿Ã Â¦â€¢ Ã Â¦ÂÃ Â¦â€¢Ã Â§ÂÃ Â¦Â¸Ã Â¦Â¿Ã Â¦â€¢Ã Â¦Â¿Ã Â¦â€°Ã Â¦Â¶Ã Â¦Â¨Ã Â§â€¡ Ã Â¦Å¸Ã Â§ÂÃ Â¦Â°Ã Â§â€¡Ã Â¦Â¡Ã Â¦Â¾Ã Â¦Â°Ã Â¦Â¦Ã Â§â€¡Ã Â¦Â° Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¶Ã Â¦Â¿Ã Â¦â€¢Ã Â§ÂÃ Â¦Â·Ã Â¦Â£ Ã Â¦Â¦Ã Â§â€¡Ã Â¦Â¯Ã Â¦Â¼Ã Â¥Â¤",
  profile2TradingStyle: "SMC, Liquidity & Order Flow Delivery",
  profile2Telegram: "https://t.me/cycleofchart",
  profile2Youtube: "https://youtube.com/@cycleofchart",
  profile2Facebook: "https://facebook.com/cycleofchart",
  profile2Twitter: "",
  profile2Email: "contact@cycleofchart.com",
};

export async function getOwnerProfile(): Promise<OwnerProfile> {
  try {
    const raw = await getSetting("owner_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure boolean flags default cleanly to current live state if not explicitly saved yet
      if (parsed.isVisible === undefined) parsed.isVisible = true;
      if (parsed.showExperienceCard === undefined) parsed.showExperienceCard = false;
      if (parsed.showMentoredCard === undefined) parsed.showMentoredCard = false;
      if (parsed.showMethodologyCard === undefined) parsed.showMethodologyCard = true;
      if (parsed.showDetailsParagraph === undefined) parsed.showDetailsParagraph = false;
      if (!parsed.experienceYears) parsed.experienceYears = "6+ Years";
      if (!parsed.studentsCount) parsed.studentsCount = "1,500+";
      if (!parsed.experienceLabel) parsed.experienceLabel = "Market Experience";
      if (!parsed.mentoredLabel) parsed.mentoredLabel = "Traders Mentored";
      if (!parsed.methodologyLabel) parsed.methodologyLabel = "Core Methodology";
      if (!parsed.experienceIcon) parsed.experienceIcon = "clock";
      if (!parsed.mentoredIcon) parsed.mentoredIcon = "users";
      if (!parsed.methodologyIcon) parsed.methodologyIcon = "award";
      if (!parsed.detailsEn) {
        parsed.detailsEn = "Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management.";
      }
      return { ...DEFAULT_OWNER_PROFILE, ...parsed };
    }
  } catch (err) {
    console.warn("[getOwnerProfile error]:", err);
  }
  return DEFAULT_OWNER_PROFILE;
}

export async function updateOwnerProfile(data: Partial<OwnerProfile>): Promise<OwnerProfile> {
  const current = await getOwnerProfile();
  const updated: OwnerProfile = {
    ...current,
    ...data,
  };
  await setSetting("owner_profile", JSON.stringify(updated));
  return updated;
}

