import { z } from "zod";
import { protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  listHabits,
  toggleHabitEntry,
  listProgress,
  toggleProgressEntry,
  listDiscipline,
  toggleDisciplineEntry,
  getDisciplineSchedule,
  addDisciplineTask,
  updateDisciplineTask,
  deleteDisciplineTask,
  toggleDisciplineTaskCompletion,
  getDisciplineWorkouts,
  addDisciplineExercise,
  updateDisciplineExercise,
  deleteDisciplineExercise,
  toggleDisciplineWorkoutCompletion,
  getDisciplineJournals,
  getDisciplineJournalByDate,
  saveDisciplineJournal,
  deleteDisciplineJournal,
  getDisciplineForexLogs,
  saveDisciplineForexLog,
  deleteDisciplineForexLog,
  getDisciplineSettings,
  updateDisciplineSettings,
  getDisciplineStats,
  exportDisciplineData,
  importDisciplineData,
  resetDisciplineData,
} from "./repo";
import { canAccessWorkout, canLogDiscipline } from "../subscription";

export const disciplineCustomerProcedures = {
  habits: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return await listHabits(ctx.user.id, input.date);
    }),
  progress: protectedProcedure.query(async ({ ctx }) => {
    return await listProgress(ctx.user.id);
  }),
  discipline: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return await listDiscipline(ctx.user.id, input.date);
    }),
  toggleProgress: protectedProcedure
    .input(z.object({ lessonId: z.number(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await toggleProgressEntry(ctx.user.id, input.lessonId, input.completed);
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
      await toggleDisciplineEntry(ctx.user.id, input.label, input.date, input.completed);
      return { success: true };
    }),
  disciplineSchedule: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return await getDisciplineSchedule(ctx.user.id, input.date);
    }),
  addDisciplineTask: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        startTime: z.string().nullable().optional(),
        endTime: z.string().nullable().optional(),
        time: z.string().nullable().optional(),
        isMandatory: z.boolean().default(true),
        isTrackable: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await addDisciplineTask(ctx.user.id, input);
    }),
  updateDisciplineTask: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        updates: z.object({
          title: z.string().optional(),
          startTime: z.string().nullable().optional(),
          endTime: z.string().nullable().optional(),
          time: z.string().nullable().optional(),
          isMandatory: z.boolean().optional(),
          isTrackable: z.boolean().optional(),
          orderIndex: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateDisciplineTask(ctx.user.id, input.id, input.updates);
    }),
  deleteDisciplineTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await deleteDisciplineTask(ctx.user.id, input.id);
    }),
  toggleDisciplineTask: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        date: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const check = await canLogDiscipline(ctx.user.id, input.date);
      if (!check.allowed && input.completed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: check.reason || "Daily discipline limit reached.",
        });
      }
      return await toggleDisciplineTaskCompletion(ctx.user.id, input.taskId, input.date, input.completed);
    }),
  disciplineWorkouts: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return await getDisciplineWorkouts(ctx.user.id, input.date);
    }),
  addDisciplineExercise: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        difficulty: z.string().default("Intermediate"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const check = await canAccessWorkout(ctx.user.id);
      if (!check.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: check.reason || "Workout Routine is available with Pro and Premium.",
        });
      }
      return await addDisciplineExercise(ctx.user.id, input);
    }),
  updateDisciplineExercise: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        updates: z.object({
          name: z.string().optional(),
          difficulty: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const check = await canAccessWorkout(ctx.user.id);
      if (!check.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: check.reason || "Workout Routine is available with Pro and Premium.",
        });
      }
      return await updateDisciplineExercise(ctx.user.id, input.id, input.updates);
    }),
  deleteDisciplineExercise: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await deleteDisciplineExercise(ctx.user.id, input.id);
    }),
  toggleDisciplineWorkout: protectedProcedure
    .input(
      z.object({
        exerciseId: z.number(),
        date: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const check = await canAccessWorkout(ctx.user.id);
      if (!check.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: check.reason || "Workout Routine is available with Pro and Premium.",
        });
      }
      return await toggleDisciplineWorkoutCompletion(ctx.user.id, input.exerciseId, input.date, input.completed);
    }),
  disciplineJournals: protectedProcedure.query(async ({ ctx }) => {
    return await getDisciplineJournals(ctx.user.id);
  }),
  disciplineJournalByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return await getDisciplineJournalByDate(ctx.user.id, input.date);
    }),
  saveDisciplineJournal: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await saveDisciplineJournal(ctx.user.id, input.date, input.content);
    }),
  deleteDisciplineJournal: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await deleteDisciplineJournal(ctx.user.id, input.id);
    }),
  disciplineForexLogs: protectedProcedure.query(async ({ ctx }) => {
    return await getDisciplineForexLogs(ctx.user.id);
  }),
  saveDisciplineForexLog: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        minutes: z.number(),
        pairs: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await saveDisciplineForexLog(ctx.user.id, input.date, input.minutes, input.pairs, input.notes);
    }),
  deleteDisciplineForexLog: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await deleteDisciplineForexLog(ctx.user.id, input.id);
    }),
  disciplineSettings: protectedProcedure.query(async ({ ctx }) => {
    return await getDisciplineSettings(ctx.user.id);
  }),
  updateDisciplineSettings: protectedProcedure
    .input(
      z.object({
        dailyTargetPercent: z.number().optional(),
        dailyForexMinutesTarget: z.number().optional(),
        restTimerDefaultSeconds: z.number().optional(),
        restTimerSound: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateDisciplineSettings(ctx.user.id, input);
    }),
  disciplineStats: protectedProcedure.query(async ({ ctx }) => {
    return await getDisciplineStats(ctx.user.id);
  }),
  exportDisciplineData: protectedProcedure.mutation(async ({ ctx }) => {
    return await exportDisciplineData(ctx.user.id);
  }),
  importDisciplineData: protectedProcedure
    .input(z.object({ data: z.any() }))
    .mutation(async ({ ctx, input }) => {
      return await importDisciplineData(ctx.user.id, input.data);
    }),
  resetDisciplineData: protectedProcedure.mutation(async ({ ctx }) => {
    return await resetDisciplineData(ctx.user.id);
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
      await toggleHabitEntry(ctx.user.id, input.label, input.date, input.completed);
      return { success: true };
    }),
};
