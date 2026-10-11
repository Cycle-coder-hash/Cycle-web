import type { OwnerFormData } from "../tabs/OwnerProfileTab";
import { type PaymentSettingsFormState, DEFAULT_PRICING_FORM } from "../tabs/SettingsTab";
import type { EbookFormData } from "../modals/EbookModal";

export function createInitialPaymentSettingsForm(): PaymentSettingsFormState {
  return {
    bkash: {
      number: "01961079326",
      accountType: "Personal",
      isEnabled: true,
      instructions:
        "Send Money using bKash App or *247#, then copy and enter the Transaction ID (TrxID) below.",
    },
    nagad: {
      number: "01961079326",
      accountType: "Personal",
      isEnabled: true,
      instructions:
        "Send Money using Nagad App or *167#, then copy and enter the Transaction ID (TrxID) below.",
    },
    rocket: {
      number: "01961079326",
      accountType: "Personal",
      isEnabled: true,
      instructions:
        "Send Money using Rocket App or *322#, then copy and enter the Transaction ID (TrxID) below.",
    },
    announcement: "Special Eid & Student Discount Active on All Institutional Packages!",
    isAnnouncementEnabled: false,
    studentTelegramUrl: "https://t.me/cycleofchart",
    studentTelegramDescription: "Official Cycle of Chart VIP Student Telegram Community",
    pricing: DEFAULT_PRICING_FORM,
  };
}

export function mapPaymentSettingsToForm(paymentSettingsData: any): PaymentSettingsFormState {
  const p = paymentSettingsData?.pricing || paymentSettingsData?.gateways?.pricing;
  return {
    bkash: {
      number:
        typeof paymentSettingsData?.bkash === "string"
          ? paymentSettingsData.bkash
          : paymentSettingsData?.bkash?.number || "01961079326",
      accountType: (paymentSettingsData?.bkash?.accountType as any) || "Personal",
      isEnabled: paymentSettingsData?.bkash?.isEnabled !== false,
      instructions: paymentSettingsData?.bkash?.instructions || "",
    },
    nagad: {
      number:
        typeof paymentSettingsData?.nagad === "string"
          ? paymentSettingsData.nagad
          : paymentSettingsData?.nagad?.number || "01961079326",
      accountType: (paymentSettingsData?.nagad?.accountType as any) || "Personal",
      isEnabled: paymentSettingsData?.nagad?.isEnabled !== false,
      instructions: paymentSettingsData?.nagad?.instructions || "",
    },
    rocket: {
      number:
        typeof paymentSettingsData?.rocket === "string"
          ? paymentSettingsData.rocket
          : paymentSettingsData?.rocket?.number || "01961079326",
      accountType: (paymentSettingsData?.rocket?.accountType as any) || "Personal",
      isEnabled: paymentSettingsData?.rocket?.isEnabled !== false,
      instructions: paymentSettingsData?.rocket?.instructions || "",
    },
    announcement: paymentSettingsData?.announcement || "",
    isAnnouncementEnabled: !!paymentSettingsData?.isAnnouncementEnabled,
    studentTelegramUrl:
      (paymentSettingsData as any)?.studentTelegramUrl || "https://t.me/cycleofchart",
    studentTelegramDescription:
      (paymentSettingsData as any)?.studentTelegramDescription ||
      "Official Cycle of Chart VIP Student Telegram Community",
    pricing: {
      courses: {
        freeEbook: {
          priceBdt: p?.courses?.freeEbook?.priceBdt ?? "0",
          priceUsd: p?.courses?.freeEbook?.priceUsd ?? "0",
        },
        basicToAdvance: {
          priceBdt: p?.courses?.basicToAdvance?.priceBdt ?? "2499",
          priceUsd: p?.courses?.basicToAdvance?.priceUsd ?? "20",
        },
        proBlueprint: {
          priceBdt: p?.courses?.proBlueprint?.priceBdt ?? "4999",
          priceUsd: p?.courses?.proBlueprint?.priceUsd ?? "40",
          originalPriceBdt: p?.courses?.proBlueprint?.originalPriceBdt ?? "5550",
        },
      },
      subscriptions: {
        freeTrial: {
          priceBdt: p?.subscriptions?.freeTrial?.priceBdt ?? "0",
          priceUsd: p?.subscriptions?.freeTrial?.priceUsd ?? "0",
          billingPeriod: p?.subscriptions?.freeTrial?.billingPeriod ?? "30 days",
        },
        pro: {
          priceBdt: p?.subscriptions?.pro?.priceBdt ?? "599",
          priceUsd: p?.subscriptions?.pro?.priceUsd ?? "5",
          billingPeriod: p?.subscriptions?.pro?.billingPeriod ?? "month",
        },
        premium: {
          priceBdt: p?.subscriptions?.premium?.priceBdt ?? "999",
          priceUsd: p?.subscriptions?.premium?.priceUsd ?? "10",
          billingPeriod: p?.subscriptions?.premium?.billingPeriod ?? "month",
        },
      },
    },
  };
}

export function createInitialEbookForm(): EbookFormData {
  return {
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
  };
}

export function mapEbookItemToForm(item: any): EbookFormData {
  return {
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
  };
}

export function mapEbookFormToPayload(ebookForm: EbookFormData) {
  const keyConcepts = ebookForm.keyConceptsText
    .split("\n")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
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
}

export function createInitialOwnerForm(): OwnerFormData {
  return {
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
    tiktok: "https://tiktok.com/@cycleofchart",
    youtube: "https://youtube.com/@cycleofchart",
    instagram: "https://instagram.com/cycleofchart",
    facebook: "https://facebook.com/cycleofchart",
    twitter: "https://x.com/cycleofchart",
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
    profile2Name: "Cycle of Chart",
    profile2Role: "Institutional Trading Mentor",
    profile2RoleBn: "ইন্সটিটিউশনাল ট্রেডিং মেন্টর",
    profile2PhotoUrl: "/logo.jpg",
    profile2BioEn: "",
    profile2BioBn: "",
    profile2TradingStyle: "",
    profile2Telegram: "",
    profile2Youtube: "",
    profile2Facebook: "",
    profile2Twitter: "",
    profile2Email: "",
  };
}

export function mapOwnerProfileToForm(ownerProfileData: any): OwnerFormData {
  return {
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
    tradingStyle:
      ownerProfileData.tradingStyle || "Institutional Order Flow, Liquidity & (SMC)",
    signatureQuoteEn: ownerProfileData.signatureQuoteEn || "",
    signatureQuoteBn: ownerProfileData.signatureQuoteBn || "",
    telegram: ownerProfileData.telegram || "",
    tiktok: (ownerProfileData as any)?.tiktok ?? "",
    youtube: ownerProfileData.youtube || "",
    instagram: (ownerProfileData as any)?.instagram ?? "",
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
    profile2Name: (ownerProfileData as any)?.profile2Name ?? "Cycle of Chart",
    profile2Role:
      (ownerProfileData as any)?.profile2Role ?? "Institutional Trading Mentor",
    profile2RoleBn:
      (ownerProfileData as any)?.profile2RoleBn ?? "ইন্সটিটিউশনাল ট্রেডিং মেন্টর",
    profile2PhotoUrl: (ownerProfileData as any)?.profile2PhotoUrl ?? "/logo.jpg",
    profile2BioEn: (ownerProfileData as any)?.profile2BioEn ?? "",
    profile2BioBn: (ownerProfileData as any)?.profile2BioBn ?? "",
    profile2TradingStyle: (ownerProfileData as any)?.profile2TradingStyle ?? "",
    profile2Telegram: (ownerProfileData as any)?.profile2Telegram ?? "",
    profile2Youtube: (ownerProfileData as any)?.profile2Youtube ?? "",
    profile2Facebook: (ownerProfileData as any)?.profile2Facebook ?? "",
    profile2Twitter: (ownerProfileData as any)?.profile2Twitter ?? "",
    profile2Email: (ownerProfileData as any)?.profile2Email ?? "",
  };
}

export function mapOwnerFormToMutationPayload(
  ownerForm: OwnerFormData,
  finalPhotoUrl: string,
  finalProfile2PhotoUrl: string | undefined
) {
  return {
    isVisible: ownerForm.isVisible,
    name: ownerForm.name.trim(),
    role: ownerForm.role.trim(),
    roleBn: ownerForm.roleBn !== undefined ? ownerForm.roleBn.trim() : "",
    bioEn: ownerForm.bioEn.trim(),
    bioBn: ownerForm.bioBn !== undefined ? ownerForm.bioBn.trim() : "",
    detailsEn: ownerForm.detailsEn !== undefined ? ownerForm.detailsEn.trim() : "",
    detailsBn: ownerForm.detailsBn !== undefined ? ownerForm.detailsBn.trim() : "",
    photoUrl: finalPhotoUrl,
    experienceYears:
      ownerForm.experienceYears !== undefined ? ownerForm.experienceYears.trim() : "6+ Years",
    studentsCount:
      ownerForm.studentsCount !== undefined ? ownerForm.studentsCount.trim() : "1,500+",
    tradingStyle:
      ownerForm.tradingStyle !== undefined
        ? ownerForm.tradingStyle.trim()
        : "Institutional Order Flow, Liquidity & (SMC)",
    signatureQuoteEn:
      ownerForm.signatureQuoteEn !== undefined ? ownerForm.signatureQuoteEn.trim() : "",
    signatureQuoteBn:
      ownerForm.signatureQuoteBn !== undefined ? ownerForm.signatureQuoteBn.trim() : "",
    telegram: ownerForm.telegram !== undefined ? ownerForm.telegram.trim() : "",
    tiktok: ownerForm.tiktok !== undefined ? ownerForm.tiktok.trim() : "",
    youtube: ownerForm.youtube !== undefined ? ownerForm.youtube.trim() : "",
    instagram: ownerForm.instagram !== undefined ? ownerForm.instagram.trim() : "",
    facebook: ownerForm.facebook !== undefined ? ownerForm.facebook.trim() : "",
    twitter: ownerForm.twitter !== undefined ? ownerForm.twitter.trim() : "",
    email: ownerForm.email !== undefined ? ownerForm.email.trim() : "",
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
    profile2Name:
      ownerForm.profile2Name !== undefined ? ownerForm.profile2Name.trim() : "Cycle of Chart",
    profile2Role:
      ownerForm.profile2Role !== undefined
        ? ownerForm.profile2Role.trim()
        : "Institutional Trading Mentor",
    profile2RoleBn:
      ownerForm.profile2RoleBn !== undefined ? ownerForm.profile2RoleBn.trim() : "",
    profile2PhotoUrl: finalProfile2PhotoUrl || "/logo.jpg",
    profile2BioEn: ownerForm.profile2BioEn !== undefined ? ownerForm.profile2BioEn.trim() : "",
    profile2BioBn: ownerForm.profile2BioBn !== undefined ? ownerForm.profile2BioBn.trim() : "",
    profile2TradingStyle:
      ownerForm.profile2TradingStyle !== undefined ? ownerForm.profile2TradingStyle.trim() : "",
    profile2Telegram:
      ownerForm.profile2Telegram !== undefined ? ownerForm.profile2Telegram.trim() : "",
    profile2Youtube:
      ownerForm.profile2Youtube !== undefined ? ownerForm.profile2Youtube.trim() : "",
    profile2Facebook:
      ownerForm.profile2Facebook !== undefined ? ownerForm.profile2Facebook.trim() : "",
    profile2Twitter:
      ownerForm.profile2Twitter !== undefined ? ownerForm.profile2Twitter.trim() : "",
    profile2Email:
      ownerForm.profile2Email !== undefined ? ownerForm.profile2Email.trim() : "",
  };
}
