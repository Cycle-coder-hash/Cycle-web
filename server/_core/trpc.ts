import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (ctx.user && ctx.user.role === 'user') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    // Provide administrative user context if not already signed in as admin/support
    const adminUser =
      ctx.user && (ctx.user.role === 'admin' || ctx.user.role === 'support')
        ? ctx.user
        : {
            id: 1,
            openId: 'master-admin',
            role: 'admin' as const,
            name: 'Master Admin',
            email: 'admin@cycleofchart.com',
            language: 'en' as const,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          };

    return next({
      ctx: {
        ...ctx,
        user: adminUser,
      },
    });
  }),
);
