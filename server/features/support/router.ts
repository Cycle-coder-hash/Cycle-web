import { z } from "zod";
import { protectedProcedure, supportProcedure, router } from "../../_core/trpc";
import {
  getOrCreateSupportConversation,
  getSupportMessages,
  sendSupportMessage,
  markSupportConversationRead,
  listAdminSupportConversations,
  getCustomerSupportContext,
} from "./repo";

export const supportRouter = router({
  getConversation: protectedProcedure.query(async ({ ctx }) => {
    const conversation = await getOrCreateSupportConversation(ctx.user.id, ctx.user);
    const messages = await getSupportMessages(conversation.id);
    return { conversation, messages };
  }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, "Message cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await getOrCreateSupportConversation(ctx.user.id, ctx.user);
      const msg = await sendSupportMessage({
        conversationId: conversation.id,
        senderId: ctx.user.id,
        senderRole: "customer",
        message: input.message,
      });
      return { success: true, message: msg };
    }),

  markRead: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await markSupportConversationRead(input.conversationId, "customer");
    }),
});

export const supportCustomerProcedures = {
  tickets: protectedProcedure.query(async ({ ctx }) => {
    const conv = await getOrCreateSupportConversation(ctx.user.id, ctx.user);
    return [conv];
  }),
  supportConversation: protectedProcedure.query(async ({ ctx }) => {
    return await getOrCreateSupportConversation(ctx.user.id, ctx.user);
  }),
  sendSupportMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await getOrCreateSupportConversation(ctx.user.id);
      const msg = await sendSupportMessage({
        conversationId: conversation.id,
        senderId: ctx.user.id,
        senderRole: "customer",
        message: input.message,
      });
      return { success: true, message: msg };
    }),
  createTicket: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        subject: z.string().optional(),
        message: z.string().min(1),
        attachmentUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await getOrCreateSupportConversation(ctx.user.id);
      const msg = await sendSupportMessage({
        conversationId: conversation.id,
        senderId: ctx.user.id,
        senderRole: "customer",
        message: input.message,
      });
      return { success: true, ticket: { id: conversation.id, message: msg.message } };
    }),
};

export const supportAdminProcedures = {
  tickets: supportProcedure.query(async () => {
    return await listAdminSupportConversations();
  }),
  supportConversations: supportProcedure.query(async () => {
    return await listAdminSupportConversations();
  }),

  conversationMessages: supportProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return await getSupportMessages(input.conversationId);
    }),

  replyMessage: supportProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string().min(1, "Message cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reply = await sendSupportMessage({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        senderRole: "admin",
        message: input.message,
      });
      return { success: true, reply };
    }),

  markConversationRead: supportProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input }) => {
      return await markSupportConversationRead(input.conversationId, "admin");
    }),

  customerContext: supportProcedure
    .input(z.object({ customerId: z.number() }))
    .query(async ({ input }) => {
      return await getCustomerSupportContext(input.customerId);
    }),
};
