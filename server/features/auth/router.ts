import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { publicProcedure, protectedProcedure, adminProcedure, supportProcedure, router } from "../../_core/trpc";
import { getSessionCookieOptions } from "../../_core/cookies";
import { hashPassword, verifyPassword } from "../../_core/password";
import { sdk } from "../../_core/sdk";
import { users } from "../../../drizzle/schema";
import { getDb } from "../../infra/db/client";
import { setSetting } from "../../infra/db/settings";
import { supabaseServer } from "../../infra/db/supabase";
import {
  getUserByEmail,
  createUser,
  updateUserPassword,
  createVerificationOtp,
  verifyOtp,
  markEmailVerified,
  getUserById,
  getTraderProfile,
  updateUserProfile,
  getUserByOpenId,
  getUserOnboardingStatus,
  saveUserOnboarding,
  listAllUsers,
  updateUserRole,
} from "./repo";
import {
  getUserPreferences,
  saveUserPreferences,
  isUsernameAvailable,
  claimUsername,
} from "../account";
import {
  listAllOrders,
  grantManualEntitlement,
  revokeEntitlement,
} from "../commerce";
import { getUserSubscription } from "../subscription";

const language = z.enum(["en", "bn", "ur"]);

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().optional(),
        language: language.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await getUserByEmail(input.email);
      if (existing && existing.emailVerified) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      const passwordHash = hashPassword(input.password);
      if (!existing) {
        await createUser({
          name: input.name,
          email: input.email,
          passwordHash,
          phone: input.phone,
          language: input.language || "en",
          role: "user",
          emailVerified: false,
        });
      } else {
        // update existing unverified user
        await updateUserPassword(input.email, passwordHash);
      }

      // Generate 6-digit OTP code for email verification
      const otp = await createVerificationOtp(input.email, "email_verify");
      console.log(`\n========================================`);
      console.log(`[EMAIL VERIFICATION OTP for ${input.email}]: ${otp}`);
      console.log(`========================================\n`);

      return {
        success: true,
        requiresOtp: true,
        email: input.email,
        otpPreview: otp,
        message: "Verification code sent to your email",
      };
    }),

  verifyEmailOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().min(4, "Enter valid verification code"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isValid = await verifyOtp(input.email, input.otp, "email_verify");
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification code",
        });
      }

      await markEmailVerified(input.email);
      const user = await getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User account not found",
        });
      }

      // Mint session token and set secure cookie
      const token = await sdk.createSessionToken({
        openId: user.openId,
        appId: "cycle-of-chart",
        name: user.name || "Trader",
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

      return { success: true, user, token };
    }),

  resendOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        type: z.enum(["email_verify", "password_reset"]),
      })
    )
    .mutation(async ({ input }) => {
      const otp = await createVerificationOtp(input.email, input.type);
      console.log(`\n========================================`);
      console.log(`[RESENT OTP (${input.type}) for ${input.email}]: ${otp}`);
      console.log(`========================================\n`);
      return { success: true, otpPreview: otp };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const isValid = verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Check if email is verified
      if (user.emailVerified === false) {
        const otp = await createVerificationOtp(input.email, "email_verify");
        console.log(`\n========================================`);
        console.log(`[LOGIN UNVERIFIED - OTP for ${input.email}]: ${otp}`);
        console.log(`========================================\n`);
        return {
          success: false,
          requiresVerification: true,
          email: user.email,
          otpPreview: otp,
          user: null,
          token: null,
          message: "Please verify your email before accessing dashboard",
        };
      }

      // Mint session token and set secure cookie
      const token = await sdk.createSessionToken({
        openId: user.openId,
        appId: "cycle-of-chart",
        name: user.name || "Trader",
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

      return { success: true, user, token, requiresVerification: false };
    }),

  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUserByEmail(input.email);
      if (!user) {
        // Return generic message for privacy
        return {
          success: true,
          email: input.email,
          message: "If an account exists with this email, a reset code was sent.",
        };
      }

      const otp = await createVerificationOtp(input.email, "password_reset");
      console.log(`\n========================================`);
      console.log(`[PASSWORD RESET OTP for ${input.email}]: ${otp}`);
      console.log(`========================================\n`);

      return {
        success: true,
        email: input.email,
        otpPreview: otp,
        message: "Password reset code sent to your email",
      };
    }),

  resetPasswordWithOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().min(4, "Enter valid verification code"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const isValid = await verifyOtp(input.email, input.otp, "password_reset");
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset code",
        });
      }

      const newHash = hashPassword(input.newPassword);
      await updateUserPassword(input.email, newHash);

      return {
        success: true,
        message: "Password has been reset successfully. You can now login.",
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = (await getUserById(ctx.user.id)) || ctx.user;
    const traderProf = await getTraderProfile(ctx.user.openId || ctx.user.id);
    const prefs = await getUserPreferences(ctx.user.openId || ctx.user.id);

    return {
      id: ctx.user.id,
      openId: ctx.user.openId,
      name: traderProf?.name || user.name || "Trader",
      username: traderProf?.username || (user as any).username || null,
      email: user.email || ctx.user.email || "",
      avatar: traderProf?.avatar !== undefined ? traderProf.avatar : ((user as any).avatar || null),
      phone: user.phone || traderProf?.phone || null,
      role: ctx.user.role,
      emailVerified: (user as any).emailVerified ?? true,
      createdAt: user.createdAt,
      preferences: prefs,
    };
  }),

  checkUsername: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      return await isUsernameAvailable(input.username, ctx.user.id);
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").optional(),
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters").optional(),
        phone: z.string().optional().nullable(),
        language: language.optional(),
        avatar: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.username) {
        const cleanUser = input.username.trim().toLowerCase();
        const check = await isUsernameAvailable(cleanUser, ctx.user.id);
        if (!check.available) {
          throw new TRPCError({
            code: "CONFLICT",
            message: check.reason || "Username is already taken",
          });
        }
        await claimUsername(cleanUser, ctx.user.id, ctx.user.openId);
      }

      await updateUserProfile(ctx.user.id, ctx.user.openId, {
        name: input.name,
        phone: input.phone,
        language: input.language,
        avatar: input.avatar,
        username: input.username ? input.username.trim().toLowerCase() : undefined,
      });

      return { success: true };
    }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        theme: z.enum(["dark", "light"]).optional(),
        language: language.optional(),
        timezone: z.string().optional(),
        currency: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userKey = ctx.user.openId || ctx.user.id;
      const updated = await saveUserPreferences(userKey, input);
      return { success: true, preferences: updated };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let user = await getUserById(ctx.user.id);
      if (!user || !user.passwordHash) {
        if (ctx.user.openId) user = await getUserByOpenId(ctx.user.openId);
      }
      if (!user || !user.passwordHash) {
        if (ctx.user.email) user = await getUserByEmail(ctx.user.email);
      }
      if (!user) {
        user = ctx.user as any;
      }
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User account not found" });
      }
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This account does not have a local password set (e.g. social login). Please contact support to set up credentials.",
        });
      }
      const isValid = verifyPassword(input.currentPassword, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect. Please verify and try again.",
        });
      }
      const newHash = hashPassword(input.newPassword);
      await updateUserPassword(user.email || ctx.user.email || "", newHash);

      try {
        if (user.openId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.openId)) {
          await supabaseServer.auth.admin.updateUserById(user.openId, {
            password: input.newPassword,
          });
        }
      } catch (supaErr) {
        console.warn("[changePassword Supabase admin note]:", supaErr);
      }

      return { success: true, message: "Password updated successfully" };
    }),

  logoutAllDevices: protectedProcedure.mutation(async ({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

    try {
      await setSetting(`user_session_revocation_${ctx.user.id}`, new Date().toISOString());
    } catch (err) {
      console.warn("[logoutAllDevices timestamp note]:", err);
    }

    try {
      if (ctx.user.openId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ctx.user.openId)) {
        await supabaseServer.auth.admin.signOut(ctx.user.openId, "global");
      }
    } catch (supaErr) {
      console.warn("[logoutAllDevices Supabase admin note]:", supaErr);
    }

    return { success: true, message: "Successfully signed out from all active devices." };
  }),

  setLanguage: protectedProcedure
    .input(z.object({ language }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db
        .update(users)
        .set({ language: input.language })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});

export const authCustomerProcedures = {
  onboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    return await getUserOnboardingStatus({
      id: ctx.user.id,
      openId: ctx.user.openId,
      email: ctx.user.email || undefined,
    });
  }),
  submitOnboarding: protectedProcedure
    .input(
      z.object({
        discoverySource: z.string().trim().min(1, "Please enter where you first discovered trading"),
        tradingExperience: z.enum(["Complete Beginner", "6 Month+ Experience", "1 Year+ Experience"]),
        keepsJournal: z.enum(["Yes", "No"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await saveUserOnboarding(
        {
          id: ctx.user.id,
          openId: ctx.user.openId,
          email: ctx.user.email || undefined,
        },
        input
      );
    }),
};

export const authAdminProcedures = {
  users: supportProcedure.query(async () => {
    const usersList = await listAllUsers();
    const ordersList = await listAllOrders();
    return await Promise.all(
      usersList.map(async (u: any) => {
        const userOrders = ordersList.filter((o: any) => o.customerId === u.id);
        const sub = await getUserSubscription(u.id);
        return {
          ...u,
          accountStatus: u.accountStatus || sub.accountStatus || "active",
          subscription: sub,
          ordersCount: userOrders.length,
          totalSpent: userOrders
            .filter((o: any) => o.orderStatus === "approved")
            .reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0),
        };
      })
    );
  }),

  updateRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin", "support"]) }))
    .mutation(async ({ input }) => {
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),

  grantAccess: adminProcedure
    .input(z.object({ userId: z.number(), scope: z.string().min(1), bundleId: z.number().optional(), productId: z.number().optional() }))
    .mutation(async ({ input }) => {
      await grantManualEntitlement(input.userId, input.scope, input.bundleId, input.productId);
      return { success: true };
    }),

  revokeAccess: adminProcedure
    .input(z.object({ entitlementId: z.number() }))
    .mutation(async ({ input }) => {
      await revokeEntitlement(input.entitlementId);
      return { success: true };
    }),
};
