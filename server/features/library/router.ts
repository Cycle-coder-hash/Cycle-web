import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure, supportProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  listFreeEbooks,
  getFreeEbookById,
  createFreeEbook,
  updateFreeEbook,
  deleteFreeEbook,
  getCustomerLibraryPdfs,
} from "./repo";
import {
  getCourseAlbumData,
  listCourseClasses,
  createCourseClass,
  updateCourseClass,
  deleteCourseClass,
  reorderCourseClasses,
} from "./courseRepo";
import type { CourseId } from "../../../shared/types/library";

export const libraryCustomerProcedures = {
  // Existing procedures preserved with exact signatures
  freeEbooks: protectedProcedure.query(async () => {
    return await listFreeEbooks();
  }),

  publicFreeEbooks: publicProcedure.query(async () => {
    return await listFreeEbooks(false);
  }),

  myLibrary: protectedProcedure.query(async ({ ctx }) => {
    return await getCustomerLibraryPdfs({
      id: ctx.user.id,
      openId: ctx.user.openId,
      email: ctx.user.email || undefined,
    });
  }),

  downloadEbook: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const ebook = await getFreeEbookById(input.id);
      if (!ebook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Resource not found" });
      }
      const isFree = ebook.isFree === true || Number(ebook.price) === 0 || !ebook.price || ebook.price === "0";
      if (!isFree) {
        const unlockedPdfs = await getCustomerLibraryPdfs({
          id: ctx.user.id,
          openId: ctx.user.openId,
          email: ctx.user.email || undefined,
        });
        const hasAccess = unlockedPdfs.some((p: any) => p.id === ebook.id);
        if (!hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have access to this resource or access has been restricted.",
          });
        }
      }
      return {
        success: true,
        ebook,
        downloadUrl: ebook.fileUrl,
        fileName: ebook.fileName || `${ebook.titleEn.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      };
    }),

  courseAlbum: publicProcedure
    .input(
      z.object({
        courseId: z.enum(["basic-to-advance", "cycle-blueprint"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.user?.role === "admin";
      return await getCourseAlbumData(ctx.user, input.courseId as CourseId, isAdmin);
    }),
};

export const libraryAdminProcedures = {
  // Existing procedures preserved with exact signatures
  freeEbooks: supportProcedure.query(async () => {
    return await listFreeEbooks(true);
  }),

  createFreeEbook: adminProcedure
    .input(
      z.object({
        titleEn: z.string().min(1),
        titleBn: z.string().optional(),
        subtitleEn: z.string().min(1),
        subtitleBn: z.string().optional(),
        category: z.string().min(1),
        pages: z.number().optional(),
        keyConcepts: z.array(z.string()).optional(),
        fileUrl: z.string().nullable().optional(),
        fileName: z.string().nullable().optional(),
        fileSize: z.string().nullable().optional(),
        isPublished: z.boolean().optional(),
        isFree: z.boolean().optional(),
        price: z.string().optional(),
        coverImageUrl: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createFreeEbook(input);
    }),

  updateFreeEbook: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titleEn: z.string().optional(),
        titleBn: z.string().optional(),
        subtitleEn: z.string().optional(),
        subtitleBn: z.string().optional(),
        category: z.string().optional(),
        pages: z.number().optional(),
        keyConcepts: z.array(z.string()).optional(),
        fileUrl: z.string().nullable().optional(),
        fileName: z.string().nullable().optional(),
        fileSize: z.string().nullable().optional(),
        isPublished: z.boolean().optional(),
        isFree: z.boolean().optional(),
        price: z.string().optional(),
        coverImageUrl: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateFreeEbook(id, data);
    }),

  deleteFreeEbook: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteFreeEbook(input.id);
      return { success: true };
    }),

  // Course classes admin procedures
  courseClasses: supportProcedure
    .input(
      z.object({
        courseId: z.enum(["basic-to-advance", "cycle-blueprint"]),
      })
    )
    .query(async ({ input }) => {
      return await listCourseClasses(input.courseId as CourseId, true);
    }),

  createCourseClass: adminProcedure
    .input(
      z.object({
        courseId: z.enum(["basic-to-advance", "cycle-blueprint"]),
        title: z.string().min(1),
        description: z.string().optional(),
        videoUrl: z.string().min(1),
        duration: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
        resourceLink: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createCourseClass(input.courseId as CourseId, input);
    }),

  updateCourseClass: adminProcedure
    .input(
      z.object({
        courseId: z.enum(["basic-to-advance", "cycle-blueprint"]),
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        duration: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
        resourceLink: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { courseId, id, ...data } = input;
      return await updateCourseClass(courseId as CourseId, id, data);
    }),

  deleteCourseClass: adminProcedure
    .input(
      z.object({
        courseId: z.enum(["basic-to-advance", "cycle-blueprint"]),
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await deleteCourseClass(input.courseId as CourseId, input.id);
      return { success: true };
    }),

  reorderCourseClasses: adminProcedure
    .input(
      z.object({
        courseId: z.enum(["basic-to-advance", "cycle-blueprint"]),
        classIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return await reorderCourseClasses(input.courseId as CourseId, input.classIds);
    }),
};
