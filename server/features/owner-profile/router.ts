import { z } from "zod";
import { publicProcedure, supportProcedure } from "../../_core/trpc";
import { getOwnerProfile, updateOwnerProfile } from "./repo";

export const ownerProfilePublicProcedures = {
  ownerProfile: publicProcedure.query(async () => {
    return await getOwnerProfile();
  }),
};

export const ownerProfileAdminProcedures = {
  ownerProfile: supportProcedure.query(async () => {
    return await getOwnerProfile();
  }),

  updateOwnerProfile: supportProcedure
    .input(
      z.object({
        isVisible: z.boolean().optional(),
        name: z.string().optional(),
        role: z.string().optional(),
        roleBn: z.string().optional(),
        bioEn: z.string().optional(),
        bioBn: z.string().optional(),
        photoUrl: z.string().optional(),
        detailsEn: z.string().optional(),
        detailsBn: z.string().optional(),
        experienceYears: z.string().optional(),
        studentsCount: z.string().optional(),
        tradingStyle: z.string().optional(),
        signatureQuoteEn: z.string().optional(),
        signatureQuoteBn: z.string().optional(),
        telegram: z.string().optional(),
        tiktok: z.string().optional(),
        youtube: z.string().optional(),
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        twitter: z.string().optional(),
        email: z.string().optional(),
        showExperienceCard: z.boolean().optional(),
        experienceLabel: z.string().optional(),
        experienceIcon: z.string().optional(),
        showMentoredCard: z.boolean().optional(),
        mentoredLabel: z.string().optional(),
        mentoredIcon: z.string().optional(),
        showMethodologyCard: z.boolean().optional(),
        methodologyLabel: z.string().optional(),
        methodologyIcon: z.string().optional(),
        showDetailsParagraph: z.boolean().optional(),
        profile2Name: z.string().optional(),
        profile2Role: z.string().optional(),
        profile2RoleBn: z.string().optional(),
        profile2PhotoUrl: z.string().optional(),
        profile2BioEn: z.string().optional(),
        profile2BioBn: z.string().optional(),
        profile2TradingStyle: z.string().optional(),
        profile2Telegram: z.string().optional(),
        profile2Youtube: z.string().optional(),
        profile2Facebook: z.string().optional(),
        profile2Twitter: z.string().optional(),
        profile2Email: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateOwnerProfile(input);
    }),
};
