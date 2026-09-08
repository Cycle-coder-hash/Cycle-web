import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getDb,
  listProducts,
  listBundles,
  listContent,
  listOrdersForUser,
  listAllOrders,
  listEntitlements,
  listNotifications,
  listJournal,
  deleteJournal,
  listHabits,
  listTickets,
  createSupportTicket,
  getTicketById,
  getTicketByCode,
  getTicketReplies,
  addTicketReply,
  listAllUsers,
  updateUserRole,
  grantManualEntitlement,
  revokeEntitlement,
  updateTicketStatus,
  listAuditLogs,
  getUserByEmail,
  getUserByOpenId,
  createUser,
  createVerificationOtp,
  verifyOtp,
  markEmailVerified,
  updateUserPassword,
  products,
  bundles,
  content,
  orders,
  entitlements,
  progress,
  habits,
  disciplineEntries,
  journalEntries,
  supportTickets,
  ticketReplies,
  notifications,
  settings,
  auditEvents,
  users,
} from "./db";

import { and, eq } from "drizzle-orm";
import { assertCheckoutAcknowledgement } from "@shared/commerce";
import { sendAccessEmail } from "./email";
import { hashPassword, verifyPassword } from "./_core/password";
import { sdk } from "./_core/sdk";

const paymentMethod = z.enum(["bkash", "nagad", "rocket"]);
const language = z.enum(["en", "bn"]);
const supportProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "support") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
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
      .mutation(async ({ ctx, input }) => {
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

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).optional(),
          phone: z.string().optional(),
          language: language.optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          // in memory update
          const u = await getUserByOpenId(ctx.user.openId);
          if (u) {
            if (input.name) u.name = input.name;
            if (input.phone) u.phone = input.phone;
            if (input.language) u.language = input.language;
          }
          return { success: true };
        }
        await db
          .update(users)
          .set({
            ...(input.name ? { name: input.name } : {}),
            ...(input.phone ? { phone: input.phone } : {}),
            ...(input.language ? { language: input.language } : {}),
          })
          .where(eq(users.id, ctx.user.id));
        return { success: true };
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
  }),

  public: router({
    content: publicProcedure.query(() => listContent()),
    products: publicProcedure.query(() => listProducts()),
    bundles: publicProcedure.query(() => listBundles()),
    paymentSettings: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        return {
          bkash: "01961079326",
          nagad: "01961079326",
          rocket: "01961079326",
        };
      }
      const rows = await db.select().from(settings);
      return Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
    }),

  }),

  customer: router({
    orders: protectedProcedure.query(({ ctx }) => listOrdersForUser(ctx.user.id)),
    entitlements: protectedProcedure.query(({ ctx }) => listEntitlements(ctx.user.id)),
    notifications: protectedProcedure.query(({ ctx }) => listNotifications(ctx.user.id)),
    journal: protectedProcedure.query(({ ctx }) => listJournal(ctx.user.id)),
    habits: protectedProcedure
      .input(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
      .query(({ ctx, input }) => listHabits(ctx.user.id, input.date)),
    tickets: protectedProcedure.query(({ ctx }) => listTickets(ctx.user.id)),
    progress: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      return db
        ? db.select().from(progress).where(eq(progress.userId, ctx.user.id))
        : [];
    }),
    discipline: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        return db
          ? db
              .select()
              .from(disciplineEntries)
              .where(
                and(
                  eq(disciplineEntries.userId, ctx.user.id),
                  eq(disciplineEntries.date, input.date)
                )
              )
          : [];
      }),
    toggleProgress: protectedProcedure
      .input(z.object({ lessonId: z.number(), completed: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: true };
        const existing = await db
          .select()
          .from(progress)
          .where(
            and(
              eq(progress.userId, ctx.user.id),
              eq(progress.lessonId, input.lessonId)
            )
          )
          .limit(1);
        if (existing[0]) {
          await db
            .update(progress)
            .set({ completed: input.completed })
            .where(eq(progress.id, existing[0].id));
        } else {
          await db
            .insert(progress)
            .values({
              userId: ctx.user.id,
              lessonId: input.lessonId,
              completed: input.completed,
            });
        }
        return { success: true };
      }),
    toggleDiscipline: protectedProcedure
      .input(
        z.object({
          label: z.string().min(1),
          date: z.string(),
          completed: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: true };
        const existing = await db
          .select()
          .from(disciplineEntries)
          .where(
            and(
              eq(disciplineEntries.userId, ctx.user.id),
              eq(disciplineEntries.date, input.date),
              eq(disciplineEntries.label, input.label)
            )
          )
          .limit(1);
        if (existing[0]) {
          await db
            .update(disciplineEntries)
            .set({ completed: input.completed })
            .where(eq(disciplineEntries.id, existing[0].id));
        } else {
          await db.insert(disciplineEntries).values({
            userId: ctx.user.id,
            ...input,
          });
        }
        return { success: true };
      }),
    createJournal: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          content: z.string().min(1),
          setup: z.string().optional(),
          result: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: true };
        await db.insert(journalEntries).values({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    deleteJournal: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteJournal(input.id, ctx.user.id);
        return { success: true };
      }),
    toggleHabit: protectedProcedure
      .input(
        z.object({
          label: z.string().min(1),
          date: z.string(),
          completed: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: true };
        const existing = await db
          .select()
          .from(habits)
          .where(
            and(
              eq(habits.userId, ctx.user.id),
              eq(habits.date, input.date),
              eq(habits.label, input.label)
            )
          )
          .limit(1);
        if (existing[0]) {
          await db
            .update(habits)
            .set({ completed: input.completed })
            .where(eq(habits.id, existing[0].id));
        } else {
          await db.insert(habits).values({
            userId: ctx.user.id,
            ...input,
          });
        }
        return { success: true };
      }),
    createTicket: protectedProcedure
      .input(
        z.object({
          category: z.string().optional(),
          subject: z.string().min(1),
          message: z.string().min(1),
          attachmentUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ticket = await createSupportTicket({
          userId: ctx.user.id,
          userName: ctx.user.name || "Student",
          userEmail: ctx.user.email || "student@cycleofchart.com",
          category: input.category || "General",
          subject: input.subject,
          message: input.message,
          attachmentUrl: input.attachmentUrl,
        });
        return { success: true, ticket };
      }),
    submitOrder: protectedProcedure
      .input(
        z.object({
          bundleId: z.number().optional(),
          productId: z.number().optional(),
          selectedPdfIds: z.array(z.number()).max(15),
          amount: z.number().positive(),
          paymentMethod,
          transactionId: z.string().min(3),
          screenshotKey: z.string().optional(),
          noRefundAcknowledged: z.literal(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!input.bundleId && !input.productId) {
          throw new Error("Select a product or bundle");
        }
        assertCheckoutAcknowledgement(input.noRefundAcknowledged);

        if (db) {
          if (input.productId) {
            const selectedProduct = (
              await db
                .select()
                .from(products)
                .where(eq(products.id, input.productId))
                .limit(1)
            )[0];
            if (selectedProduct?.kind === "ebook") {
              throw new Error("Digital eBook is available only inside a bundle");
            }
          }
          await db.insert(orders).values({
            customerId: ctx.user.id,
            ...input,
            amount: input.amount.toFixed(2),
            currency: "BDT",
            paymentStatus: "pending",
            orderStatus: "pending",
          });
        } else {
          const allO = await listAllOrders();
          allO.unshift({
            id: allO.length + 100,
            customerId: ctx.user.id,
            ...input,
            amount: input.amount.toFixed(2),
            currency: "BDT",
            paymentStatus: "pending",
            orderStatus: "pending",
            createdAt: new Date(),
          });
        }
        return { success: true, status: "pending" as const };
      }),
  }),

  support: router({
    createTicket: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.string().email("Valid email is required"),
          category: z.string().min(1, "Please select a category"),
          subject: z.string().min(3, "Subject must be at least 3 characters"),
          message: z.string().min(10, "Message must be at least 10 characters"),
          attachmentUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ticket = await createSupportTicket({
          userId: ctx.user ? ctx.user.id : null,
          userName: input.name.trim(),
          userEmail: input.email.trim().toLowerCase(),
          category: input.category,
          subject: input.subject.trim(),
          message: input.message.trim(),
          attachmentUrl: input.attachmentUrl,
        });

        return { success: true, ticket };
      }),

    myTickets: protectedProcedure.query(async ({ ctx }) => {
      return await listTickets({ userId: ctx.user.id });
    }),

    trackTicket: publicProcedure
      .input(
        z.object({
          ticketCode: z.string().min(1, "Ticket ID is required"),
          email: z.string().email("Valid email is required"),
        })
      )
      .query(async ({ input }) => {
        const ticket = await getTicketByCode(input.ticketCode);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No support ticket found with this Ticket ID.",
          });
        }
        if (ticket.userEmail?.toLowerCase() !== input.email.trim().toLowerCase()) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "The email address provided does not match this ticket record.",
          });
        }
        const replies = await getTicketReplies(ticket.id);
        return { ticket, replies };
      }),

    getTicket: publicProcedure
      .input(
        z.object({
          ticketId: z.number(),
          email: z.string().email().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
          });
        }

        const isStaff = ctx.user?.role === "admin" || ctx.user?.role === "support";
        const isOwner =
          (ctx.user && (ticket.userId === ctx.user.id || ticket.userEmail.toLowerCase() === ctx.user.email?.toLowerCase())) ||
          (input.email && ticket.userEmail.toLowerCase() === input.email.trim().toLowerCase());

        if (!isStaff && !isOwner) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to view this ticket.",
          });
        }

        const replies = await getTicketReplies(ticket.id);
        return { ticket, replies };
      }),

    reply: publicProcedure
      .input(
        z.object({
          ticketId: z.number(),
          message: z.string().min(1, "Reply message cannot be empty"),
          senderName: z.string().optional(),
          senderEmail: z.string().email().optional(),
          attachmentUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
          });
        }

        const isStaff = ctx.user?.role === "admin" || ctx.user?.role === "support";
        const isOwner =
          (ctx.user && (ticket.userId === ctx.user.id || ticket.userEmail.toLowerCase() === ctx.user.email?.toLowerCase())) ||
          (input.senderEmail && ticket.userEmail.toLowerCase() === input.senderEmail.trim().toLowerCase());

        if (!isStaff && !isOwner) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not authorized to reply to this ticket.",
          });
        }

        const senderRole = isStaff ? ("support" as const) : ("user" as const);
        const senderName = isStaff
          ? ctx.user?.name || "Support Specialist"
          : input.senderName || ctx.user?.name || ticket.userName;
        const senderEmail = isStaff
          ? ctx.user?.email || "support@cycleofchart.com"
          : input.senderEmail || ctx.user?.email || ticket.userEmail;

        const reply = await addTicketReply({
          ticketId: input.ticketId,
          senderRole,
          senderName,
          senderEmail,
          message: input.message.trim(),
          attachmentUrl: input.attachmentUrl,
        });

        // Automatic status transition if user replies to waiting ticket
        if (!isStaff) {
          if (ticket.status === "waiting_user" || ticket.status === "closed" || ticket.status === "resolved") {
            await updateTicketStatus(input.ticketId, "in_progress");
          }
        }

        return { success: true, reply };
      }),
  }),

  admin: router({
    stats: supportProcedure.query(async () => {
      const allOrders = await listAllOrders();
      const allUsers = await listAllUsers();
      const allTickets = await listTickets();

      const approvedOrders = allOrders.filter((o: any) => o.orderStatus === "approved");
      const pendingOrders = allOrders.filter((o: any) => o.orderStatus === "pending");
      const rejectedOrders = allOrders.filter((o: any) => o.orderStatus === "rejected");

      const totalRevenue = approvedOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0);
      const pendingRevenue = pendingOrders.reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0);

      const openTicketsCount = allTickets.filter((t: any) => t.status === "open").length;
      const inProgressTicketsCount = allTickets.filter((t: any) => t.status === "in_progress").length;
      const waitingUserTicketsCount = allTickets.filter((t: any) => t.status === "waiting_user").length;
      const resolvedTicketsCount = allTickets.filter((t: any) => t.status === "resolved").length;
      const closedTicketsCount = allTickets.filter((t: any) => t.status === "closed").length;

      return {
        totalRevenue,
        pendingRevenue,
        totalOrders: allOrders.length,
        approvedOrdersCount: approvedOrders.length,
        pendingOrdersCount: pendingOrders.length,
        rejectedOrdersCount: rejectedOrders.length,
        totalStudents: allUsers.length,
        totalTicketsCount: allTickets.length,
        openTicketsCount,
        inProgressTicketsCount,
        waitingUserTicketsCount,
        resolvedTicketsCount,
        closedTicketsCount,
      };
    }),

    orders: supportProcedure.query(() => listAllOrders()),
    tickets: supportProcedure
      .input(
        z
          .object({
            status: z.string().optional(),
            category: z.string().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await listTickets(input || {});
      }),
    ticketDetails: supportProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
        const replies = await getTicketReplies(input.ticketId);
        return { ticket, replies };
      }),
    replyTicket: supportProcedure
      .input(
        z.object({
          ticketId: z.number(),
          message: z.string().min(1),
          status: z.enum(["open", "in_progress", "waiting_user", "resolved", "closed"]).optional(),
          attachmentUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const reply = await addTicketReply({
          ticketId: input.ticketId,
          senderRole: "support",
          senderName: ctx.user.name || "Support Specialist",
          senderEmail: ctx.user.email,
          message: input.message.trim(),
          attachmentUrl: input.attachmentUrl,
        });
        const targetStatus = input.status || "waiting_user";
        await updateTicketStatus(input.ticketId, targetStatus, ctx.user.name || "Staff");
        return { success: true, reply };
      }),
    users: supportProcedure.query(async () => {
      const usersList = await listAllUsers();
      const ordersList = await listAllOrders();
      return usersList.map((u: any) => {
        const userOrders = ordersList.filter((o: any) => o.customerId === u.id);
        return {
          ...u,
          ordersCount: userOrders.length,
          totalSpent: userOrders
            .filter((o: any) => o.orderStatus === "approved")
            .reduce((sum: number, o: any) => sum + parseFloat(o.amount || "0"), 0),
        };
      });
    }),

    auditLogs: supportProcedure.query(() => listAuditLogs()),

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

    updateTicket: supportProcedure
      .input(
        z.object({
          ticketId: z.number(),
          status: z.enum(["open", "in_progress", "waiting_user", "resolved", "closed"]),
          assignedStaff: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateTicketStatus(input.ticketId, input.status, input.assignedStaff || ctx.user.name || "Staff");
        return { success: true };
      }),

    approveOrder: adminProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (db) {
          const row = (
            await db
              .select()
              .from(orders)
              .where(eq(orders.id, input.orderId))
              .limit(1)
          )[0];
          if (!row) throw new Error("Order not found");
          if (row.orderStatus !== "pending") {
            throw new Error("Only pending orders can be approved");
          }
          await db
            .update(orders)
            .set({
              orderStatus: "approved",
              paymentStatus: "approved",
              approvedAt: new Date(),
              approvedBy: ctx.user.id,
            })
            .where(eq(orders.id, input.orderId));
          await db.insert(entitlements).values({
            userId: row.customerId,
            orderId: row.id,
            productId: row.productId,
            bundleId: row.bundleId,
            scope: row.bundleId ? `bundle:${row.bundleId}` : `product:${row.productId}`,
          });
          await db.insert(auditEvents).values({
            actorId: ctx.user.id,
            action: "order.approved",
            entity: "order",
            entityId: row.id,
            metadata: { customerId: row.customerId },
          });
          await db.insert(notifications).values({
            userId: row.customerId,
            title: "Access unlocked",
            message: "Your payment was approved and your digital learning access is now available.",
          });
          const customer = (
            await db
              .select()
              .from(users)
              .where(eq(users.id, row.customerId))
              .limit(1)
          )[0];
          try {
            await sendAccessEmail("payment_approved", customer?.email, { orderId: row.id });
            await sendAccessEmail("access_granted", customer?.email, { orderId: row.id });
          } catch {}
        } else {
          // In-memory fallback
          const allO = await listAllOrders();
          const ord = allO.find((o: any) => o.id === input.orderId);
          if (ord) {
            ord.orderStatus = "approved";
            ord.paymentStatus = "approved";
            ord.approvedAt = new Date();
            await grantManualEntitlement(
              ord.customerId,
              ord.bundleId ? `bundle:${ord.bundleId}` : `product:${ord.productId || 1}`,
              ord.bundleId,
              ord.productId
            );
          }
        }
        return { success: true };
      }),

    rejectOrder: adminProcedure
      .input(z.object({ orderId: z.number(), reason: z.string().min(3) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (db) {
          const row = (
            await db
              .select()
              .from(orders)
              .where(eq(orders.id, input.orderId))
              .limit(1)
          )[0];
          if (!row) throw new Error("Order not found");
          if (row.orderStatus !== "pending") {
            throw new Error("Only pending orders can be rejected");
          }
          await db
            .update(orders)
            .set({
              orderStatus: "rejected",
              paymentStatus: "rejected",
              rejectionReason: input.reason,
            })
            .where(eq(orders.id, input.orderId));
          await db.insert(auditEvents).values({
            actorId: ctx.user.id,
            action: "order.rejected",
            entity: "order",
            entityId: row.id,
            metadata: { reason: input.reason },
          });
          await db.insert(notifications).values({
            userId: row.customerId,
            title: "Payment needs attention",
            message: input.reason,
          });
          const customer = (
            await db
              .select()
              .from(users)
              .where(eq(users.id, row.customerId))
              .limit(1)
          )[0];
          try {
            await sendAccessEmail("payment_rejected", customer?.email, { orderId: row.id, reason: input.reason });
          } catch {}
        } else {
          const allO = await listAllOrders();
          const ord = allO.find((o: any) => o.id === input.orderId);
          if (ord) {
            ord.orderStatus = "rejected";
            ord.paymentStatus = "rejected";
            ord.rejectionReason = input.reason;
          }
        }
        return { success: true };
      }),

    setSetting: adminProcedure
      .input(z.object({ key: z.string().min(1), value: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (db) {
          await db
            .insert(settings)
            .values(input)
            .onDuplicateKeyUpdate({ set: { value: input.value } });
        }
        return { success: true };
      }),
  }),
});


export type AppRouter = typeof appRouter;
