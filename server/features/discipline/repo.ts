import { and, asc, desc, eq, inArray, isNull, ne, or } from "drizzle-orm";
import {
  disciplineTasks,
  disciplineTaskCompletions,
  disciplineExercises,
  disciplineWorkoutCompletions,
  disciplineDailyJournals,
  disciplineForexLogs,
  disciplineSettings,
  habits,
  progress,
  disciplineEntries,
  DisciplineTask,
  DisciplineExercise,
  DisciplineDailyJournal,
  DisciplineForexLog,
  DisciplineSetting,
} from "../../../drizzle/schema";
import { getDb, getSetting, setSetting, supabaseServer } from "../../infra/db";
export const DEFAULT_DISCIPLINE_TASKS = [
  { title: "Wake up at 6:00 AM & Hydrate", time: "06:00 AM", isMandatory: true, isTrackable: true, orderIndex: 1 },
  { title: "Morning Routine & Mindset Preparation", time: "06:30 AM", isMandatory: true, isTrackable: true, orderIndex: 2 },
  { title: "Physical Workout & Movement Routine", time: "07:30 AM", isMandatory: true, isTrackable: true, orderIndex: 3 },
  { title: "Check Forex Factory & High-Impact News Calendar", time: "08:30 AM", isMandatory: true, isTrackable: true, orderIndex: 4 },
  { title: "HTF Directional Bias & Liquidity Pool Markup", time: "09:00 AM", isMandatory: true, isTrackable: true, orderIndex: 5 },
  { title: "Execute Session Rules (CRT / SMC / Invalidation)", time: "01:00 PM", isMandatory: true, isTrackable: true, orderIndex: 6 },
  { title: "Log All Trades in Trade Journal", time: "05:00 PM", isMandatory: true, isTrackable: true, orderIndex: 7 },
  { title: "Evening Chart Review & Forex Analysis", time: "08:00 PM", isMandatory: false, isTrackable: true, orderIndex: 8 },
  { title: "Study Course Lessons & Playbook Notes", time: "09:30 PM", isMandatory: false, isTrackable: true, orderIndex: 9 },
  { title: "Night Reflection & Tomorrow Execution Plan", time: "10:30 PM", isMandatory: true, isTrackable: true, orderIndex: 10 },
];

export const DEFAULT_DISCIPLINE_EXERCISES = [
  { name: "Push-ups (3 Sets to Failure)", difficulty: "Intermediate", orderIndex: 1 },
  { name: "Bodyweight Squats (4 Sets x 20 Reps)", difficulty: "Beginner", orderIndex: 2 },
  { name: "Pull-ups / Inverted Rows (3 Sets)", difficulty: "Advanced", orderIndex: 3 },
  { name: "Core Plank Hold (3 x 60 Seconds)", difficulty: "Intermediate", orderIndex: 4 },
  { name: "Dumbbell Shoulder Press / Pike Push-ups", difficulty: "Intermediate", orderIndex: 5 },
  { name: "Cardio & Stretching Routine (15 Mins)", difficulty: "Beginner", orderIndex: 6 },
];

const inMemoryDisciplineTasks: any[] = [];
export const inMemoryDisciplineCompletions: any[] = [];

export const DEFAULT_INSTITUTIONAL_STUDENTS = [
  {
    id: 101,
    openId: "inst_trader_fahim",
    name: "Fahim Al-Mahmud",
    role: "Senior CRT Lead Analyst",
    email: null,
    avatar: null,
    baseScore: 94.2,
    trades: [
      { id: "ft_1", pair: "EUR/USD", direction: "Buy", pnl: 480, followedRules: "Yes", date: "2026-09-18", timeframe: "15M", entryPrice: 1.0820, exitPrice: 1.0868, stopLoss: 1.0805, takeProfit: 1.0870 },
      { id: "ft_2", pair: "EUR/USD", direction: "Sell", pnl: 350, followedRules: "Yes", date: "2026-09-17", timeframe: "15M", entryPrice: 1.0910, exitPrice: 1.0875, stopLoss: 1.0925, takeProfit: 1.0870 },
      { id: "ft_3", pair: "EUR/USD", direction: "Buy", pnl: 520, followedRules: "Yes", date: "2026-09-16", timeframe: "15M", entryPrice: 1.0840, exitPrice: 1.0892, stopLoss: 1.0825, takeProfit: 1.0895 },
      { id: "ft_4", pair: "GBP/USD", direction: "Buy", pnl: -120, followedRules: "Yes", date: "2026-09-15", timeframe: "15M", entryPrice: 1.2650, exitPrice: 1.2638, stopLoss: 1.2638, takeProfit: 1.2720 },
      { id: "ft_5", pair: "EUR/USD", direction: "Buy", pnl: 610, followedRules: "Yes", date: "2026-09-14", timeframe: "15M", entryPrice: 1.0790, exitPrice: 1.0851, stopLoss: 1.0775, takeProfit: 1.0855 },
      { id: "ft_6", pair: "EUR/USD", direction: "Sell", pnl: 290, followedRules: "Yes", date: "2026-09-12", timeframe: "15M", entryPrice: 1.0880, exitPrice: 1.0851, stopLoss: 1.0895, takeProfit: 1.0850 },
    ],
    streak: 14,
    disciplineScore: 95,
  },
  {
    id: 102,
    openId: "inst_trader_tanvir",
    name: "Tanvir Hossain",
    role: "SMC Execution Specialist",
    email: null,
    avatar: null,
    baseScore: 91.8,
    trades: [
      { id: "th_1", pair: "GBP/USD", direction: "Buy", pnl: 410, followedRules: "Yes", date: "2026-09-18", timeframe: "15M", entryPrice: 1.2680, exitPrice: 1.2721, stopLoss: 1.2665, takeProfit: 1.2725 },
      { id: "th_2", pair: "GBP/USD", direction: "Sell", pnl: 320, followedRules: "Yes", date: "2026-09-17", timeframe: "15M", entryPrice: 1.2750, exitPrice: 1.2718, stopLoss: 1.2765, takeProfit: 1.2715 },
      { id: "th_3", pair: "EUR/USD", direction: "Buy", pnl: -110, followedRules: "Yes", date: "2026-09-15", timeframe: "15M", entryPrice: 1.0860, exitPrice: 1.0849, stopLoss: 1.0849, takeProfit: 1.0920 },
      { id: "th_4", pair: "GBP/USD", direction: "Buy", pnl: 480, followedRules: "Yes", date: "2026-09-13", timeframe: "15M", entryPrice: 1.2610, exitPrice: 1.2658, stopLoss: 1.2595, takeProfit: 1.2660 },
      { id: "th_5", pair: "GBP/USD", direction: "Sell", pnl: 270, followedRules: "Yes", date: "2026-09-11", timeframe: "15M", entryPrice: 1.2700, exitPrice: 1.2673, stopLoss: 1.2715, takeProfit: 1.2670 },
    ],
    streak: 11,
    disciplineScore: 91,
  },
  {
    id: 103,
    openId: "inst_trader_zubair",
    name: "Zubair Ahmed",
    role: "London Open Scalper",
    email: null,
    avatar: null,
    baseScore: 89.5,
    trades: [
      { id: "za_1", pair: "XAU/USD", direction: "Buy", pnl: 550, followedRules: "Yes", date: "2026-09-18", timeframe: "15M", entryPrice: 2570, exitPrice: 2581, stopLoss: 2565, takeProfit: 2582 },
      { id: "za_2", pair: "XAU/USD", direction: "Sell", pnl: -180, followedRules: "Yes", date: "2026-09-16", timeframe: "15M", entryPrice: 2585, exitPrice: 2589, stopLoss: 2589, takeProfit: 2575 },
      { id: "za_3", pair: "XAU/USD", direction: "Buy", pnl: 490, followedRules: "Yes", date: "2026-09-15", timeframe: "15M", entryPrice: 2562, exitPrice: 2572, stopLoss: 2557, takeProfit: 2575 },
      { id: "za_4", pair: "EUR/USD", direction: "Buy", pnl: 230, followedRules: "Yes", date: "2026-09-13", timeframe: "15M", entryPrice: 1.0830, exitPrice: 1.0853, stopLoss: 1.0815, takeProfit: 1.0860 },
    ],
    streak: 9,
    disciplineScore: 88,
  },
  {
    id: 104,
    openId: "inst_trader_nafis",
    name: "Nafis Fuad",
    role: "NY Session Breakout Specialist",
    email: null,
    avatar: null,
    baseScore: 88.1,
    trades: [
      { id: "nf_1", pair: "GBP/JPY", direction: "Buy", pnl: 380, followedRules: "Yes", date: "2026-09-18", timeframe: "15M", entryPrice: 188.20, exitPrice: 188.75, stopLoss: 187.90, takeProfit: 188.80 },
      { id: "nf_2", pair: "GBP/JPY", direction: "Sell", pnl: 290, followedRules: "Yes", date: "2026-09-16", timeframe: "15M", entryPrice: 189.40, exitPrice: 188.98, stopLoss: 189.65, takeProfit: 188.90 },
      { id: "nf_3", pair: "EUR/USD", direction: "Buy", pnl: -95, followedRules: "Yes", date: "2026-09-14", timeframe: "15M", entryPrice: 1.0850, exitPrice: 1.0840, stopLoss: 1.0840, takeProfit: 1.0890 },
      { id: "nf_4", pair: "GBP/JPY", direction: "Buy", pnl: 340, followedRules: "Yes", date: "2026-09-12", timeframe: "15M", entryPrice: 187.50, exitPrice: 188.00, stopLoss: 187.25, takeProfit: 188.05 },
    ],
    streak: 8,
    disciplineScore: 86,
  },
  {
    id: 105,
    openId: "inst_trader_mahmud",
    name: "Mahmudul Hasan",
    role: "Liquidity Sweep & Judas Trap Trader",
    email: null,
    avatar: null,
    baseScore: 86.4,
    trades: [
      { id: "mh_1", pair: "EUR/JPY", direction: "Buy", pnl: 320, followedRules: "Yes", date: "2026-09-17", timeframe: "15M", entryPrice: 161.10, exitPrice: 161.55, stopLoss: 160.85, takeProfit: 161.60 },
      { id: "mh_2", pair: "EUR/JPY", direction: "Sell", pnl: 280, followedRules: "Yes", date: "2026-09-15", timeframe: "15M", entryPrice: 162.20, exitPrice: 161.80, stopLoss: 162.45, takeProfit: 161.75 },
      { id: "mh_3", pair: "EUR/USD", direction: "Buy", pnl: -105, followedRules: "Yes", date: "2026-09-13", timeframe: "15M", entryPrice: 1.0845, exitPrice: 1.0834, stopLoss: 1.0834, takeProfit: 1.0890 },
      { id: "mh_4", pair: "EUR/JPY", direction: "Buy", pnl: 290, followedRules: "Yes", date: "2026-09-11", timeframe: "15M", entryPrice: 160.50, exitPrice: 160.92, stopLoss: 160.25, takeProfit: 161.00 },
    ],
    streak: 7,
    disciplineScore: 85,
  },
  {
    id: 106,
    openId: "inst_trader_shafiq",
    name: "Shafiqur Rahman",
    role: "HTF Bias & Swing Positioner",
    email: null,
    avatar: null,
    baseScore: 85.2,
    trades: [
      { id: "sr_1", pair: "USD/CAD", direction: "Sell", pnl: 310, followedRules: "Yes", date: "2026-09-17", timeframe: "15M", entryPrice: 1.3580, exitPrice: 1.3540, stopLoss: 1.3605, takeProfit: 1.3535 },
      { id: "sr_2", pair: "USD/CAD", direction: "Buy", pnl: 250, followedRules: "Yes", date: "2026-09-14", timeframe: "15M", entryPrice: 1.3510, exitPrice: 1.3542, stopLoss: 1.3490, takeProfit: 1.3550 },
      { id: "sr_3", pair: "USD/CAD", direction: "Sell", pnl: -85, followedRules: "Yes", date: "2026-09-12", timeframe: "15M", entryPrice: 1.3590, exitPrice: 1.3601, stopLoss: 1.3601, takeProfit: 1.3540 },
    ],
    streak: 6,
    disciplineScore: 84,
  },
  {
    id: 107,
    openId: "inst_trader_rashed",
    name: "Rashedul Islam",
    role: "CRT Silver Bullet Specialist",
    email: null,
    avatar: null,
    baseScore: 83.7,
    trades: [
      { id: "ri_1", pair: "AUD/USD", direction: "Buy", pnl: 270, followedRules: "Yes", date: "2026-09-17", timeframe: "15M", entryPrice: 0.6720, exitPrice: 0.6755, stopLoss: 0.6705, takeProfit: 0.6760 },
      { id: "ri_2", pair: "AUD/USD", direction: "Sell", pnl: 210, followedRules: "Yes", date: "2026-09-15", timeframe: "15M", entryPrice: 0.6790, exitPrice: 0.6762, stopLoss: 0.6805, takeProfit: 0.6760 },
      { id: "ri_3", pair: "AUD/USD", direction: "Buy", pnl: -90, followedRules: "Yes", date: "2026-09-13", timeframe: "15M", entryPrice: 0.6730, exitPrice: 0.6720, stopLoss: 0.6720, takeProfit: 0.6775 },
    ],
    streak: 5,
    disciplineScore: 82,
  },
  {
    id: 108,
    openId: "inst_trader_arif",
    name: "Arifur Rahman",
    role: "Risk Management & Prop Trader",
    email: null,
    avatar: null,
    baseScore: 82.5,
    trades: [
      { id: "ar_1", pair: "NZD/USD", direction: "Buy", pnl: 240, followedRules: "Yes", date: "2026-09-16", timeframe: "15M", entryPrice: 0.6180, exitPrice: 0.6212, stopLoss: 0.6165, takeProfit: 0.6215 },
      { id: "ar_2", pair: "NZD/USD", direction: "Sell", pnl: 190, followedRules: "Yes", date: "2026-09-14", timeframe: "15M", entryPrice: 0.6240, exitPrice: 0.6215, stopLoss: 0.6255, takeProfit: 0.6210 },
      { id: "ar_3", pair: "NZD/USD", direction: "Buy", pnl: -80, followedRules: "Yes", date: "2026-09-11", timeframe: "15M", entryPrice: 0.6190, exitPrice: 0.6181, stopLoss: 0.6181, takeProfit: 0.6235 },
    ],
    streak: 5,
    disciplineScore: 80,
  },
  {
    id: 109,
    openId: "inst_trader_minhaj",
    name: "Kazi Minhaj",
    role: "Asian Range Invalidation Trader",
    email: null,
    avatar: null,
    baseScore: 81.0,
    trades: [
      { id: "km_1", pair: "EUR/GBP", direction: "Buy", pnl: 220, followedRules: "Yes", date: "2026-09-16", timeframe: "15M", entryPrice: 0.8520, exitPrice: 0.8548, stopLoss: 0.8505, takeProfit: 0.8550 },
      { id: "km_2", pair: "EUR/GBP", direction: "Sell", pnl: 170, followedRules: "Yes", date: "2026-09-13", timeframe: "15M", entryPrice: 0.8570, exitPrice: 0.8548, stopLoss: 0.8582, takeProfit: 0.8545 },
      { id: "km_3", pair: "EUR/GBP", direction: "Buy", pnl: -75, followedRules: "Yes", date: "2026-09-10", timeframe: "15M", entryPrice: 0.8530, exitPrice: 0.8522, stopLoss: 0.8522, takeProfit: 0.8565 },
    ],
    streak: 4,
    disciplineScore: 78,
  },
  {
    id: 110,
    openId: "inst_trader_tariq",
    name: "Tariqul Islam",
    role: "Order Flow & FVG Sniper",
    email: null,
    avatar: null,
    baseScore: 79.8,
    trades: [
      { id: "ti_1", pair: "USD/CHF", direction: "Sell", pnl: 210, followedRules: "Yes", date: "2026-09-15", timeframe: "15M", entryPrice: 0.8920, exitPrice: 0.8892, stopLoss: 0.8938, takeProfit: 0.8890 },
      { id: "ti_2", pair: "USD/CHF", direction: "Buy", pnl: 160, followedRules: "Yes", date: "2026-09-12", timeframe: "15M", entryPrice: 0.8870, exitPrice: 0.8892, stopLoss: 0.8855, takeProfit: 0.8895 },
      { id: "ti_3", pair: "USD/CHF", direction: "Sell", pnl: -70, followedRules: "Yes", date: "2026-09-09", timeframe: "15M", entryPrice: 0.8930, exitPrice: 0.8940, stopLoss: 0.8940, takeProfit: 0.8880 },
    ],
    streak: 4,
    disciplineScore: 76,
  },
  {
    id: 111,
    openId: "inst_trader_imtiaz",
    name: "Imtiaz Khan",
    role: "Intraday Momentum Trader",
    email: null,
    avatar: null,
    baseScore: 78.4,
    trades: [
      { id: "ik_1", pair: "GBP/AUD", direction: "Buy", pnl: 200, followedRules: "Yes", date: "2026-09-14", timeframe: "15M", entryPrice: 1.9320, exitPrice: 1.9365, stopLoss: 1.9295, takeProfit: 1.9370 },
      { id: "ik_2", pair: "GBP/AUD", direction: "Sell", pnl: 150, followedRules: "Yes", date: "2026-09-11", timeframe: "15M", entryPrice: 1.9410, exitPrice: 1.9378, stopLoss: 1.9430, takeProfit: 1.9375 },
      { id: "ik_3", pair: "GBP/AUD", direction: "Buy", pnl: -80, followedRules: "Yes", date: "2026-09-08", timeframe: "15M", entryPrice: 1.9330, exitPrice: 1.9318, stopLoss: 1.9318, takeProfit: 1.9380 },
    ],
    streak: 3,
    disciplineScore: 75,
  },
  {
    id: 112,
    openId: "inst_trader_ashraf",
    name: "Ashraful Alam",
    role: "CRT Reversal Analyst",
    email: null,
    avatar: null,
    baseScore: 77.1,
    trades: [
      { id: "aa_1", pair: "EUR/AUD", direction: "Buy", pnl: 190, followedRules: "Yes", date: "2026-09-14", timeframe: "15M", entryPrice: 1.6350, exitPrice: 1.6392, stopLoss: 1.6325, takeProfit: 1.6395 },
      { id: "aa_2", pair: "EUR/AUD", direction: "Sell", pnl: 140, followedRules: "Yes", date: "2026-09-10", timeframe: "15M", entryPrice: 1.6420, exitPrice: 1.6390, stopLoss: 1.6440, takeProfit: 1.6385 },
      { id: "aa_3", pair: "EUR/AUD", direction: "Buy", pnl: -75, followedRules: "Yes", date: "2026-09-07", timeframe: "15M", entryPrice: 1.6360, exitPrice: 1.6349, stopLoss: 1.6349, takeProfit: 1.6410 },
    ],
    streak: 3,
    disciplineScore: 74,
  },
  {
    id: 113,
    openId: "inst_trader_hasib",
    name: "Hasibul Hasan",
    role: "Institutional Structure Student",
    email: null,
    avatar: null,
    baseScore: 75.5,
    trades: [
      { id: "hh_1", pair: "USD/JPY", direction: "Buy", pnl: 180, followedRules: "Yes", date: "2026-09-13", timeframe: "15M", entryPrice: 142.10, exitPrice: 142.50, stopLoss: 141.85, takeProfit: 142.55 },
      { id: "hh_2", pair: "USD/JPY", direction: "Sell", pnl: 130, followedRules: "Yes", date: "2026-09-09", timeframe: "15M", entryPrice: 143.20, exitPrice: 142.92, stopLoss: 143.40, takeProfit: 142.90 },
      { id: "hh_3", pair: "USD/JPY", direction: "Buy", pnl: -70, followedRules: "Yes", date: "2026-09-06", timeframe: "15M", entryPrice: 142.30, exitPrice: 142.18, stopLoss: 142.18, takeProfit: 142.80 },
    ],
    streak: 3,
    disciplineScore: 72,
  },
];
const inMemoryDisciplineExercises: any[] = [];
const inMemoryDisciplineWorkoutCompletions: any[] = [];
const inMemoryDisciplineJournals: any[] = [];
const inMemoryDisciplineForexLogs: any[] = [];
const inMemoryDisciplineSettings: Map<number, any> = new Map();

let disciplineTaskAutoId = 1;
let disciplineCompletionAutoId = 1;
let disciplineExerciseAutoId = 1;
let disciplineWorkoutAutoId = 1;
let disciplineJournalAutoId = 1;
let disciplineForexAutoId = 1;
let disciplineSettingsAutoId = 1;

// ==============================================================================
// COMPLETE DAILY DISCIPLINE SYSTEM â€” BACKEND HELPER FUNCTIONS
// ==============================================================================

export async function ensureDisciplineDefaults(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      // Ensure default system settings configuration if missing
      const existingSettings = await db.select().from(disciplineSettings).where(eq(disciplineSettings.userId, userId));
      if (existingSettings.length === 0) {
        await db.insert(disciplineSettings).values({
          userId,
          dailyTargetPercent: 80,
          dailyForexMinutesTarget: 60,
          restTimerDefaultSeconds: 60,
          restTimerSound: true,
        });
      }
      return;
    } catch (err) {
      console.warn("[ensureDisciplineDefaults db error]:", err);
    }
  }

  // In-memory fallback: only ensure settings
  if (!inMemoryDisciplineSettings.has(userId)) {
    inMemoryDisciplineSettings.set(userId, {
      id: disciplineSettingsAutoId++,
      userId,
      dailyTargetPercent: 80,
      dailyForexMinutesTarget: 60,
      restTimerDefaultSeconds: 60,
      restTimerSound: true,
      updatedAt: new Date(),
    });
  }
}

// ------------------------------------------------------------------------------
// SCHEDULE & TASKS
// ------------------------------------------------------------------------------

export async function getDisciplineSchedule(userId: number, date: string) {
  await ensureDisciplineDefaults(userId);
  const db = await getDb();

  if (db) {
    try {
      const tasks = await db
        .select()
        .from(disciplineTasks)
        .where(and(eq(disciplineTasks.userId, userId), eq(disciplineTasks.isActive, true)))
        .orderBy(asc(disciplineTasks.orderIndex), asc(disciplineTasks.id));

      const completions = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(and(eq(disciplineTaskCompletions.userId, userId), eq(disciplineTaskCompletions.date, date)));

      const mergedTasks = tasks.map((t: any) => {
        const startTime = t.startTime !== undefined && t.startTime !== null ? t.startTime : (t.time ? t.time : null);
        const endTime = t.endTime !== undefined && t.endTime !== null ? t.endTime : null;
        return {
          ...t,
          startTime,
          endTime,
          completed: completions.some((c: any) => c.taskId === t.id && c.completed),
        };
      });

      return { tasks: mergedTasks, date };
    } catch (err) {
      console.warn("[getDisciplineSchedule db error]:", err);
    }
  }

  // In-memory fallback
  const tasks = inMemoryDisciplineTasks
    .filter((t) => t.userId === userId && t.isActive !== false)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  let completions = inMemoryDisciplineCompletions.filter(
    (c) => c.userId === userId && c.date === date
  );

  if (completions.length === 0) {
    try {
      const raw = await getSetting(`discipline_task_comp_${userId}_${date}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          completions = parsed;
        }
      }
    } catch {}
  }

  const mergedTasks = tasks.map((t) => {
    const startTime = t.startTime !== undefined && t.startTime !== null ? t.startTime : (t.time ? t.time : null);
    const endTime = t.endTime !== undefined && t.endTime !== null ? t.endTime : null;
    return {
      ...t,
      startTime,
      endTime,
      completed: completions.some((c: any) => c.taskId === t.id && c.completed),
    };
  });

  return { tasks: mergedTasks, date };
}

export async function addDisciplineTask(
  userId: number,
  task: {
    title: string;
    startTime?: string | null;
    endTime?: string | null;
    time?: string | null;
    isMandatory: boolean;
    isTrackable: boolean;
  }
) {
  const startTime = task.startTime?.trim() || null;
  const endTime = task.endTime?.trim() || null;
  const legacyTime = startTime || task.time?.trim() || null;

  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineTasks)
        .where(and(eq(disciplineTasks.userId, userId), eq(disciplineTasks.isActive, true)));
      const nextOrder = existing.length + 1;

      const res = await db.insert(disciplineTasks).values({
        userId,
        title: task.title.trim(),
        startTime,
        endTime,
        time: legacyTime,
        isMandatory: task.isMandatory ?? true,
        isTrackable: task.isTrackable ?? true,
        orderIndex: nextOrder,
        isActive: true,
      });
      const insertId = res[0]?.insertId || res[0]?.id;
      return {
        id: insertId || disciplineTaskAutoId++,
        userId,
        title: task.title.trim(),
        startTime,
        endTime,
        time: legacyTime,
        isMandatory: task.isMandatory ?? true,
        isTrackable: task.isTrackable ?? true,
        orderIndex: nextOrder,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (err) {
      console.warn("[addDisciplineTask db error]:", err);
    }
  }

  const existing = inMemoryDisciplineTasks.filter((t) => t.userId === userId && t.isActive !== false);
  const nextOrder = existing.length + 1;
  const created = {
    id: disciplineTaskAutoId++,
    userId,
    title: task.title.trim(),
    startTime,
    endTime,
    time: legacyTime,
    isMandatory: task.isMandatory ?? true,
    isTrackable: task.isTrackable ?? true,
    orderIndex: nextOrder,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryDisciplineTasks.push(created);
  return created;
}

export async function updateDisciplineTask(
  userId: number,
  taskId: number,
  updates: Partial<{
    title: string;
    startTime: string | null;
    endTime: string | null;
    time: string | null;
    isMandatory: boolean;
    isTrackable: boolean;
    orderIndex: number;
  }>
) {
  const cleanUpdates: any = { ...updates };
  if (cleanUpdates.startTime !== undefined) {
    cleanUpdates.startTime = cleanUpdates.startTime?.trim() || null;
    cleanUpdates.time = cleanUpdates.startTime;
  }
  if (cleanUpdates.endTime !== undefined) {
    cleanUpdates.endTime = cleanUpdates.endTime?.trim() || null;
  }

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineTasks)
        .set({
          ...cleanUpdates,
          updatedAt: new Date(),
        })
        .where(and(eq(disciplineTasks.id, taskId), eq(disciplineTasks.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[updateDisciplineTask db error]:", err);
    }
  }

  const task = inMemoryDisciplineTasks.find((t) => t.id === taskId && t.userId === userId);
  if (task) {
    Object.assign(task, cleanUpdates, { updatedAt: new Date() });
    return true;
  }
  return false;
}

export async function deleteDisciplineTask(userId: number, taskId: number) {
  const db = await getDb();
  if (db) {
    try {
      // Soft-delete task and delete completions
      await db
        .update(disciplineTasks)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(disciplineTasks.id, taskId), eq(disciplineTasks.userId, userId)));
      await db
        .delete(disciplineTaskCompletions)
        .where(and(eq(disciplineTaskCompletions.taskId, taskId), eq(disciplineTaskCompletions.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[deleteDisciplineTask db error]:", err);
    }
  }

  const task = inMemoryDisciplineTasks.find((t) => t.id === taskId && t.userId === userId);
  if (task) {
    task.isActive = false;
  }
  return true;
}

export async function toggleDisciplineTaskCompletion(
  userId: number,
  taskId: number,
  date: string,
  completed: boolean
) {
  const db = await getDb();
  if (db) {
    try {
      // Verify task belongs to user
      const task = await db
        .select()
        .from(disciplineTasks)
        .where(and(eq(disciplineTasks.id, taskId), eq(disciplineTasks.userId, userId)))
        .limit(1);

      if (!task.length) throw new Error("Task not found or unauthorized");

      const existing = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(
          and(
            eq(disciplineTaskCompletions.userId, userId),
            eq(disciplineTaskCompletions.taskId, taskId),
            eq(disciplineTaskCompletions.date, date)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(disciplineTaskCompletions)
          .set({
            completed,
            completedAt: completed ? new Date() : null,
          })
          .where(eq(disciplineTaskCompletions.id, existing[0].id));
      } else {
        await db.insert(disciplineTaskCompletions).values({
          userId,
          taskId,
          date,
          completed,
          completedAt: completed ? new Date() : null,
        });
      }
      return true;
    } catch (err) {
      console.warn("[toggleDisciplineTaskCompletion db error]:", err);
    }
  }

  const existing = inMemoryDisciplineCompletions.find(
    (c) => c.userId === userId && c.taskId === taskId && c.date === date
  );
  if (existing) {
    existing.completed = completed;
    existing.completedAt = completed ? new Date() : null;
  } else {
    inMemoryDisciplineCompletions.push({
      id: disciplineCompletionAutoId++,
      userId,
      taskId,
      date,
      completed,
      completedAt: completed ? new Date() : null,
    });
  }

  try {
    const currentCompletions = inMemoryDisciplineCompletions.filter(
      (c) => c.userId === userId && c.date === date
    );
    await setSetting(`discipline_task_comp_${userId}_${date}`, JSON.stringify(currentCompletions));
  } catch {}

  return true;
}

// ------------------------------------------------------------------------------
// WORKOUT
// ------------------------------------------------------------------------------

export async function getDisciplineWorkouts(userId: number, date: string) {
  await ensureDisciplineDefaults(userId);
  const db = await getDb();

  if (db) {
    try {
      const exercises = await db
        .select()
        .from(disciplineExercises)
        .where(and(eq(disciplineExercises.userId, userId), eq(disciplineExercises.isActive, true)))
        .orderBy(asc(disciplineExercises.orderIndex), asc(disciplineExercises.id));

      const completions = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(and(eq(disciplineWorkoutCompletions.userId, userId), eq(disciplineWorkoutCompletions.date, date)));

      const merged = exercises.map((e: any) => ({
        ...e,
        completed: completions.some((c: any) => c.exerciseId === e.id && c.completed),
      }));

      const completedCount = merged.filter((e: any) => e.completed).length;
      const progressPercent = merged.length ? Math.round((completedCount / merged.length) * 100) : 0;

      return { exercises: merged, progressPercent, date };
    } catch (err) {
      console.warn("[getDisciplineWorkouts db error]:", err);
    }
  }

  const exercises = inMemoryDisciplineExercises
    .filter((e) => e.userId === userId && e.isActive !== false)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  let completions = inMemoryDisciplineWorkoutCompletions.filter(
    (c) => c.userId === userId && c.date === date
  );

  if (completions.length === 0) {
    try {
      const raw = await getSetting(`discipline_workout_comp_${userId}_${date}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          completions = parsed;
        }
      }
    } catch {}
  }

  const merged = exercises.map((e) => ({
    ...e,
    completed: completions.some((c: any) => c.exerciseId === e.id && c.completed),
  }));

  const completedCount = merged.filter((e) => e.completed).length;
  const progressPercent = merged.length ? Math.round((completedCount / merged.length) * 100) : 0;

  return { exercises: merged, progressPercent, date };
}

export async function addDisciplineExercise(
  userId: number,
  exercise: { name: string; difficulty: string }
) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineExercises)
        .where(and(eq(disciplineExercises.userId, userId), eq(disciplineExercises.isActive, true)));
      const nextOrder = existing.length + 1;

      const res = await db.insert(disciplineExercises).values({
        userId,
        name: exercise.name.trim(),
        difficulty: exercise.difficulty || "Intermediate",
        orderIndex: nextOrder,
        isActive: true,
      });
      const insertId = res[0]?.insertId || res[0]?.id;
      return {
        id: insertId || disciplineExerciseAutoId++,
        userId,
        ...exercise,
        orderIndex: nextOrder,
        isActive: true,
        createdAt: new Date(),
      };
    } catch (err) {
      console.warn("[addDisciplineExercise db error]:", err);
    }
  }

  const existing = inMemoryDisciplineExercises.filter((e) => e.userId === userId && e.isActive !== false);
  const nextOrder = existing.length + 1;
  const created = {
    id: disciplineExerciseAutoId++,
    userId,
    name: exercise.name.trim(),
    difficulty: exercise.difficulty || "Intermediate",
    orderIndex: nextOrder,
    isActive: true,
    createdAt: new Date(),
  };
  inMemoryDisciplineExercises.push(created);
  return created;
}

export async function updateDisciplineExercise(
  userId: number,
  exerciseId: number,
  updates: Partial<{ name: string; difficulty: string }>
) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineExercises)
        .set(updates)
        .where(and(eq(disciplineExercises.id, exerciseId), eq(disciplineExercises.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[updateDisciplineExercise db error]:", err);
    }
  }

  const ex = inMemoryDisciplineExercises.find((e) => e.id === exerciseId && e.userId === userId);
  if (ex) {
    Object.assign(ex, updates);
    return true;
  }
  return false;
}

export async function deleteDisciplineExercise(userId: number, exerciseId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineExercises)
        .set({ isActive: false })
        .where(and(eq(disciplineExercises.id, exerciseId), eq(disciplineExercises.userId, userId)));
      await db
        .delete(disciplineWorkoutCompletions)
        .where(and(eq(disciplineWorkoutCompletions.exerciseId, exerciseId), eq(disciplineWorkoutCompletions.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[deleteDisciplineExercise db error]:", err);
    }
  }

  const ex = inMemoryDisciplineExercises.find((e) => e.id === exerciseId && e.userId === userId);
  if (ex) {
    ex.isActive = false;
  }
  return true;
}

export async function toggleDisciplineWorkoutCompletion(
  userId: number,
  exerciseId: number,
  date: string,
  completed: boolean
) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(
          and(
            eq(disciplineWorkoutCompletions.userId, userId),
            eq(disciplineWorkoutCompletions.exerciseId, exerciseId),
            eq(disciplineWorkoutCompletions.date, date)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(disciplineWorkoutCompletions)
          .set({ completed })
          .where(eq(disciplineWorkoutCompletions.id, existing[0].id));
      } else {
        await db.insert(disciplineWorkoutCompletions).values({
          userId,
          exerciseId,
          date,
          completed,
        });
      }
      return true;
    } catch (err) {
      console.warn("[toggleDisciplineWorkoutCompletion db error]:", err);
    }
  }

  const existing = inMemoryDisciplineWorkoutCompletions.find(
    (c) => c.userId === userId && c.exerciseId === exerciseId && c.date === date
  );
  if (existing) {
    existing.completed = completed;
  } else {
    inMemoryDisciplineWorkoutCompletions.push({
      id: disciplineWorkoutAutoId++,
      userId,
      exerciseId,
      date,
      completed,
    });
  }

  try {
    const currentCompletions = inMemoryDisciplineWorkoutCompletions.filter(
      (c) => c.userId === userId && c.date === date
    );
    await setSetting(`discipline_workout_comp_${userId}_${date}`, JSON.stringify(currentCompletions));
  } catch {}

  return true;
}

// ------------------------------------------------------------------------------
// DISCIPLINE JOURNAL
// ------------------------------------------------------------------------------

export async function getDisciplineJournals(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(disciplineDailyJournals)
        .where(eq(disciplineDailyJournals.userId, userId))
        .orderBy(desc(disciplineDailyJournals.date));
    } catch (err) {
      console.warn("[getDisciplineJournals db error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    const { data, error } = await supabaseServer
      .from("disciplineDailyJournals")
      .select("*")
      .eq("userId", userId)
      .order("date", { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {}

  try {
    const raw = await getSetting(`discipline_journals_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return inMemoryDisciplineJournals
    .filter((j) => j.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getDisciplineJournalByDate(userId: number, date: string) {
  const db = await getDb();
  if (db) {
    try {
      const res = await db
        .select()
        .from(disciplineDailyJournals)
        .where(and(eq(disciplineDailyJournals.userId, userId), eq(disciplineDailyJournals.date, date)))
        .limit(1);
      if (res.length > 0) return res[0];
    } catch (err) {
      console.warn("[getDisciplineJournalByDate db error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    const { data, error } = await supabaseServer
      .from("disciplineDailyJournals")
      .select("*")
      .eq("userId", userId)
      .eq("date", date)
      .maybeSingle();
    if (!error && data) return data;
  } catch {}

  try {
    const raw = await getSetting(`discipline_journals_${userId}`);
    if (raw) {
      const list = JSON.parse(raw);
      const match = list.find((j: any) => j.date === date);
      if (match) return match;
    }
  } catch {}

  const j = inMemoryDisciplineJournals.find((item) => item.userId === userId && item.date === date);
  return j || null;
}

export async function saveDisciplineJournal(userId: number, date: string, content: string) {
  let createdResult: any = null;
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineDailyJournals)
        .where(and(eq(disciplineDailyJournals.userId, userId), eq(disciplineDailyJournals.date, date)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(disciplineDailyJournals)
          .set({ content, updatedAt: new Date() })
          .where(eq(disciplineDailyJournals.id, existing[0].id));
        createdResult = { ...existing[0], content, updatedAt: new Date() };
      } else {
        const res = await db.insert(disciplineDailyJournals).values({
          userId,
          date,
          content,
        });
        const insertId = res[0]?.insertId || res[0]?.id;
        createdResult = {
          id: insertId || disciplineJournalAutoId++,
          userId,
          date,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (err) {
      console.warn("[saveDisciplineJournal db error]:", err);
    }
  }

  if (!createdResult) {
    const existing = inMemoryDisciplineJournals.find((j) => j.userId === userId && j.date === date);
    if (existing) {
      existing.content = content;
      existing.updatedAt = new Date();
      createdResult = existing;
    } else {
      const created = {
        id: disciplineJournalAutoId++,
        userId,
        date,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDisciplineJournals.push(created);
      createdResult = created;
    }
  }

  // Supabase direct persistence
  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    await supabaseServer.from("disciplineDailyJournals").upsert({
      userId,
      date,
      content,
      updatedAt: new Date().toISOString(),
    }, { onConflict: "userId,date" });
  } catch {}

  // Persistent settings fallback
  try {
    const key = `discipline_journals_${userId}`;
    const raw = await getSetting(key);
    const list: any[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((j: any) => j.date === date);
    if (idx !== -1) {
      list[idx].content = content;
      list[idx].updatedAt = new Date().toISOString();
    } else {
      list.unshift({
        id: createdResult.id || Date.now(),
        userId,
        date,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await setSetting(key, JSON.stringify(list));
  } catch {}

  return createdResult;
}

export async function deleteDisciplineJournal(userId: number, id: number) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .delete(disciplineDailyJournals)
        .where(and(eq(disciplineDailyJournals.id, id), eq(disciplineDailyJournals.userId, userId)));
    } catch (err) {
      console.warn("[deleteDisciplineJournal db error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    await supabaseServer.from("disciplineDailyJournals").delete().eq("id", id).eq("userId", userId);
  } catch {}

  try {
    const key = `discipline_journals_${userId}`;
    const raw = await getSetting(key);
    if (raw) {
      const list = JSON.parse(raw);
      const filtered = list.filter((j: any) => j.id !== id);
      await setSetting(key, JSON.stringify(filtered));
    }
  } catch {}

  const idx = inMemoryDisciplineJournals.findIndex((j) => j.id === id && j.userId === userId);
  if (idx !== -1) {
    inMemoryDisciplineJournals.splice(idx, 1);
  }
  return true;
}

// ------------------------------------------------------------------------------
// FOREX ANALYSIS TRACKER
// ------------------------------------------------------------------------------

export async function getDisciplineForexLogs(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(disciplineForexLogs)
        .where(eq(disciplineForexLogs.userId, userId))
        .orderBy(desc(disciplineForexLogs.date));
    } catch (err) {
      console.warn("[getDisciplineForexLogs db error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    const { data, error } = await supabaseServer
      .from("disciplineForexLogs")
      .select("*")
      .eq("userId", userId)
      .order("date", { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {}

  try {
    const raw = await getSetting(`discipline_forex_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return inMemoryDisciplineForexLogs
    .filter((f) => f.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveDisciplineForexLog(
  userId: number,
  date: string,
  minutes: number,
  pairs?: string,
  notes?: string
) {
  let createdResult: any = null;
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineForexLogs)
        .where(and(eq(disciplineForexLogs.userId, userId), eq(disciplineForexLogs.date, date)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(disciplineForexLogs)
          .set({
            minutes: Number(minutes) || 0,
            pairs: pairs || "",
            notes: notes || "",
            updatedAt: new Date(),
          })
          .where(eq(disciplineForexLogs.id, existing[0].id));
        createdResult = {
          ...existing[0],
          minutes: Number(minutes) || 0,
          pairs: pairs || "",
          notes: notes || "",
          updatedAt: new Date(),
        };
      } else {
        const res = await db.insert(disciplineForexLogs).values({
          userId,
          date,
          minutes: Number(minutes) || 0,
          pairs: pairs || "",
          notes: notes || "",
        });
        const insertId = res[0]?.insertId || res[0]?.id;
        createdResult = {
          id: insertId || disciplineForexAutoId++,
          userId,
          date,
          minutes: Number(minutes) || 0,
          pairs: pairs || "",
          notes: notes || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (err) {
      console.warn("[saveDisciplineForexLog db error]:", err);
    }
  }

  if (!createdResult) {
    const existing = inMemoryDisciplineForexLogs.find((f) => f.userId === userId && f.date === date);
    if (existing) {
      existing.minutes = Number(minutes) || 0;
      existing.pairs = pairs || "";
      existing.notes = notes || "";
      existing.updatedAt = new Date();
      createdResult = existing;
    } else {
      const created = {
        id: disciplineForexAutoId++,
        userId,
        date,
        minutes: Number(minutes) || 0,
        pairs: pairs || "",
        notes: notes || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDisciplineForexLogs.push(created);
      createdResult = created;
    }
  }

  // Supabase direct persistence
  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    await supabaseServer.from("disciplineForexLogs").upsert({
      userId,
      date,
      minutes: Number(minutes) || 0,
      pairs: pairs || "",
      notes: notes || "",
      updatedAt: new Date().toISOString(),
    }, { onConflict: "userId,date" });
  } catch {}

  // Persistent settings fallback
  try {
    const key = `discipline_forex_${userId}`;
    const raw = await getSetting(key);
    const list: any[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((f: any) => f.date === date);
    if (idx !== -1) {
      list[idx].minutes = Number(minutes) || 0;
      list[idx].pairs = pairs || "";
      list[idx].notes = notes || "";
      list[idx].updatedAt = new Date().toISOString();
    } else {
      list.unshift({
        id: createdResult.id || Date.now(),
        userId,
        date,
        minutes: Number(minutes) || 0,
        pairs: pairs || "",
        notes: notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await setSetting(key, JSON.stringify(list));
  } catch {}

  return createdResult;
}

export async function deleteDisciplineForexLog(userId: number, id: number) {
  const db = await getDb();
  if (db) {
    try {
      await db
        .delete(disciplineForexLogs)
        .where(and(eq(disciplineForexLogs.id, id), eq(disciplineForexLogs.userId, userId)));
    } catch (err) {
      console.warn("[deleteDisciplineForexLog db error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("../../infra/db/supabase");
    await supabaseServer.from("disciplineForexLogs").delete().eq("id", id).eq("userId", userId);
  } catch {}

  try {
    const key = `discipline_forex_${userId}`;
    const raw = await getSetting(key);
    if (raw) {
      const list = JSON.parse(raw);
      const filtered = list.filter((f: any) => f.id !== id);
      await setSetting(key, JSON.stringify(filtered));
    }
  } catch {}

  const idx = inMemoryDisciplineForexLogs.findIndex((f) => f.id === id && f.userId === userId);
  if (idx !== -1) {
    inMemoryDisciplineForexLogs.splice(idx, 1);
  }
  return true;
}

// ------------------------------------------------------------------------------
// SETTINGS
// ------------------------------------------------------------------------------

export async function getDisciplineSettings(userId: number) {
  await ensureDisciplineDefaults(userId);
  const db = await getDb();
  if (db) {
    try {
      const res = await db
        .select()
        .from(disciplineSettings)
        .where(eq(disciplineSettings.userId, userId))
        .limit(1);
      if (res.length) return res[0];
    } catch (err) {
      console.warn("[getDisciplineSettings db error]:", err);
    }
  }

  return (
    inMemoryDisciplineSettings.get(userId) || {
      userId,
      dailyTargetPercent: 80,
      dailyForexMinutesTarget: 60,
      restTimerDefaultSeconds: 60,
      restTimerSound: true,
    }
  );
}

export async function updateDisciplineSettings(
  userId: number,
  updates: Partial<{
    dailyTargetPercent: number;
    dailyForexMinutesTarget: number;
    restTimerDefaultSeconds: number;
    restTimerSound: boolean;
  }>
) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineSettings)
        .where(eq(disciplineSettings.userId, userId))
        .limit(1);

      if (existing.length) {
        await db
          .update(disciplineSettings)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(disciplineSettings.id, existing[0].id));
      } else {
        await db.insert(disciplineSettings).values({
          userId,
          dailyTargetPercent: updates.dailyTargetPercent ?? 80,
          dailyForexMinutesTarget: updates.dailyForexMinutesTarget ?? 60,
          restTimerDefaultSeconds: updates.restTimerDefaultSeconds ?? 60,
          restTimerSound: updates.restTimerSound ?? true,
        });
      }
      return true;
    } catch (err) {
      console.warn("[updateDisciplineSettings db error]:", err);
    }
  }

  const existing = inMemoryDisciplineSettings.get(userId) || { userId };
  inMemoryDisciplineSettings.set(userId, {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  });
  return true;
}

// ------------------------------------------------------------------------------
// STATS & AGGREGATE METRICS
// ------------------------------------------------------------------------------

export async function getDisciplineStats(userId: number) {
  await ensureDisciplineDefaults(userId);
  const db = await getDb();

  let tasks: any[] = [];
  let completions: any[] = [];
  let workoutCompletions: any[] = [];
  let forexLogs: any[] = [];
  let userSettings: any = null;

  if (db) {
    try {
      tasks = await db
        .select()
        .from(disciplineTasks)
        .where(and(eq(disciplineTasks.userId, userId), eq(disciplineTasks.isActive, true)));

      completions = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(eq(disciplineTaskCompletions.userId, userId));

      workoutCompletions = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(eq(disciplineWorkoutCompletions.userId, userId));

      forexLogs = await db
        .select()
        .from(disciplineForexLogs)
        .where(eq(disciplineForexLogs.userId, userId));

      const s = await db
        .select()
        .from(disciplineSettings)
        .where(eq(disciplineSettings.userId, userId))
        .limit(1);
      userSettings = s[0];
    } catch (err) {
      console.warn("[getDisciplineStats db error]:", err);
    }
  } else {
    tasks = inMemoryDisciplineTasks.filter((t) => t.userId === userId && t.isActive !== false);
    completions = inMemoryDisciplineCompletions.filter((c) => c.userId === userId);
    workoutCompletions = inMemoryDisciplineWorkoutCompletions.filter((w) => w.userId === userId);
    forexLogs = inMemoryDisciplineForexLogs.filter((f) => f.userId === userId);
    userSettings = inMemoryDisciplineSettings.get(userId);
  }

  const instStudent = DEFAULT_INSTITUTIONAL_STUDENTS.find((s: any) => s.id === userId);
  if (instStudent && (!completions || completions.length === 0)) {
    return {
      currentStreak: instStudent.streak,
      longestStreak: instStudent.streak + 2,
      todayPercent: instStudent.disciplineScore,
      weeklyPercent: instStudent.disciplineScore,
      monthlyPercent: instStudent.disciplineScore,
      totalCompletions: instStudent.streak * 5,
      totalWorkouts: instStudent.streak * 2,
      totalForexLogs: instStudent.trades.length,
      recentCompletions: [],
    };
  }

  const trackableTasks = tasks.filter((t) => t.isTrackable !== false);
  const trackableTaskCount = trackableTasks.length || 1;
  const trackableTaskIds = new Set(trackableTasks.map((t) => t.id));

  // Date helper
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const now = new Date();
  const todayStr = formatDate(now);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayDate);

  // Group completions by date
  const completionsByDate: Record<string, number> = {};
  completions.forEach((c) => {
    if (c.completed && trackableTaskIds.has(c.taskId)) {
      completionsByDate[c.date] = (completionsByDate[c.date] || 0) + 1;
    }
  });

  const getDayPercent = (dateStr: string) => {
    const done = completionsByDate[dateStr] || 0;
    return Math.min(100, Math.round((done / trackableTaskCount) * 100));
  };

  const todayPercent = getDayPercent(todayStr);
  const yesterdayPercent = getDayPercent(yesterdayStr);

  const completedTasksToday = completionsByDate[todayStr] || 0;
  const remainingTasksToday = Math.max(0, trackableTasks.length - completedTasksToday);

  // Last 7 Days
  const last7Days: any[] = [];
  let sum7 = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const percent = getDayPercent(dateStr);
    sum7 += percent;
    last7Days.push({
      date: dateStr,
      dayName,
      percent,
      completedCount: completionsByDate[dateStr] || 0,
      totalCount: trackableTasks.length,
    });
  }
  const weeklyPercent = Math.round(sum7 / 7);

  // Last 30 Days
  const last30Days: any[] = [];
  let sum30 = 0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const percent = getDayPercent(dateStr);
    sum30 += percent;
    last30Days.push({
      date: dateStr,
      percent,
    });
  }
  const monthlyPercent = Math.round(sum30 / 30);

  // Best & Worst Days from recorded history
  const activeDates = Object.keys(completionsByDate);
  let bestDay = { date: todayStr, percent: todayPercent };
  let worstDay = { date: todayStr, percent: todayPercent };

  if (activeDates.length > 0) {
    let maxPct = -1;
    let minPct = 101;
    activeDates.forEach((d) => {
      const p = getDayPercent(d);
      if (p > maxPct) {
        maxPct = p;
        bestDay = { date: d, percent: p };
      }
      if (p < minPct) {
        minPct = p;
        worstDay = { date: d, percent: p };
      }
    });
  }

  // Streaks calculation (days with >= 50% task completion)
  let currentStreak = 0;
  let checkDate = new Date(now);

  // If today hasn't hit threshold yet, check if yesterday had streak
  if (getDayPercent(todayStr) < 50) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const ds = formatDate(checkDate);
    if (getDayPercent(ds) >= 50) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Best streak calculation across all time
  let bestStreak = currentStreak;
  const sortedDates = Object.keys(completionsByDate).sort();
  let tempStreak = 0;
  let prevTimestamp = 0;

  sortedDates.forEach((dStr) => {
    if (getDayPercent(dStr) >= 50) {
      const tVal = new Date(dStr).getTime();
      if (prevTimestamp === 0 || tVal - prevTimestamp === 86400000) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      prevTimestamp = tVal;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }
  });

  // Workout consistency
  const workoutDates = new Set(workoutCompletions.filter((w) => w.completed).map((w) => w.date));
  let workoutsThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (workoutDates.has(formatDate(d))) workoutsThisWeek++;
  }

  let workoutsThisMonth = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (workoutDates.has(formatDate(d))) workoutsThisMonth++;
  }

  // Forex consistency
  const forexMinutesToday = forexLogs.find((f) => f.date === todayStr)?.minutes || 0;
  let forexMinutesThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const found = forexLogs.find((f) => f.date === formatDate(d));
    if (found) forexMinutesThisWeek += found.minutes || 0;
  }
  const avgForexPerDay = Math.round(forexMinutesThisWeek / 7);

  const totalCompletedTasksAllTime = completions.filter((c) => c.completed).length;

  return {
    todayPercent,
    yesterdayPercent,
    weeklyPercent,
    monthlyPercent,
    currentStreak,
    bestStreak,
    completedTasksToday,
    remainingTasksToday,
    totalCompletedTasksAllTime,
    bestDay,
    worstDay,
    last7Days,
    last30Days,
    workoutConsistency: {
      workoutsThisWeek,
      workoutsThisMonth,
      totalCompleted: workoutDates.size,
      consistencyPercent: Math.min(100, Math.round((workoutsThisWeek / 5) * 100)), // based on 5 days/wk target
    },
    forexConsistency: {
      minutesToday: forexMinutesToday,
      minutesThisWeek: forexMinutesThisWeek,
      averageMinutesPerDay: avgForexPerDay,
      targetMinutes: userSettings?.dailyForexMinutesTarget || 60,
      totalSessions: forexLogs.length,
    },
    hasData: activeDates.length > 0 || workoutDates.size > 0 || forexLogs.length > 0,
  };
}

// ------------------------------------------------------------------------------
// DATA MANAGEMENT: EXPORT, IMPORT, RESET
// ------------------------------------------------------------------------------

export async function exportDisciplineData(userId: number) {
  const db = await getDb();
  let tasks: any[] = [];
  let completions: any[] = [];
  let exercises: any[] = [];
  let workoutCompletions: any[] = [];
  let journals: any[] = [];
  let forexLogs: any[] = [];
  let userSettings: any = null;

  if (db) {
    try {
      tasks = await db.select().from(disciplineTasks).where(eq(disciplineTasks.userId, userId));
      completions = await db.select().from(disciplineTaskCompletions).where(eq(disciplineTaskCompletions.userId, userId));
      exercises = await db.select().from(disciplineExercises).where(eq(disciplineExercises.userId, userId));
      workoutCompletions = await db.select().from(disciplineWorkoutCompletions).where(eq(disciplineWorkoutCompletions.userId, userId));
      journals = await db.select().from(disciplineDailyJournals).where(eq(disciplineDailyJournals.userId, userId));
      forexLogs = await db.select().from(disciplineForexLogs).where(eq(disciplineForexLogs.userId, userId));
      const s = await db.select().from(disciplineSettings).where(eq(disciplineSettings.userId, userId)).limit(1);
      userSettings = s[0] || null;
    } catch (err) {
      console.warn("[exportDisciplineData db error]:", err);
    }
  } else {
    tasks = inMemoryDisciplineTasks.filter((t) => t.userId === userId);
    completions = inMemoryDisciplineCompletions.filter((c) => c.userId === userId);
    exercises = inMemoryDisciplineExercises.filter((e) => e.userId === userId);
    workoutCompletions = inMemoryDisciplineWorkoutCompletions.filter((w) => w.userId === userId);
    journals = inMemoryDisciplineJournals.filter((j) => j.userId === userId);
    forexLogs = inMemoryDisciplineForexLogs.filter((f) => f.userId === userId);
    userSettings = inMemoryDisciplineSettings.get(userId) || null;
  }

  return {
    version: "1.0",
    appName: "Cycle of Chart â€” Daily Discipline",
    exportedAt: new Date().toISOString(),
    tasks,
    completions,
    exercises,
    workoutCompletions,
    journals,
    forexLogs,
    settings: userSettings,
  };
}

export async function importDisciplineData(userId: number, backup: any) {
  if (!backup || typeof backup !== "object") {
    throw new Error("Invalid backup file: Not a valid JSON object");
  }

  const db = await getDb();

  // Validate tasks array
  const tasksToImport = Array.isArray(backup.tasks) ? backup.tasks : [];
  const completionsToImport = Array.isArray(backup.completions) ? backup.completions : [];
  const exercisesToImport = Array.isArray(backup.exercises) ? backup.exercises : [];
  const workoutsToImport = Array.isArray(backup.workoutCompletions) ? backup.workoutCompletions : [];
  const journalsToImport = Array.isArray(backup.journals) ? backup.journals : [];
  const forexLogsToImport = Array.isArray(backup.forexLogs) ? backup.forexLogs : [];

  if (db) {
    try {
      // 1. Tasks
      for (const t of tasksToImport) {
        if (t.title) {
          await db.insert(disciplineTasks).values({
            userId,
            title: String(t.title).trim(),
            time: t.time || "08:00 AM",
            isMandatory: t.isMandatory !== false,
            isTrackable: t.isTrackable !== false,
            orderIndex: Number(t.orderIndex) || 0,
            isActive: t.isActive !== false,
          });
        }
      }

      // 2. Exercises
      for (const e of exercisesToImport) {
        if (e.name) {
          await db.insert(disciplineExercises).values({
            userId,
            name: String(e.name).trim(),
            difficulty: e.difficulty || "Intermediate",
            orderIndex: Number(e.orderIndex) || 0,
            isActive: e.isActive !== false,
          });
        }
      }

      // 3. Journals
      for (const j of journalsToImport) {
        if (j.date && j.content) {
          await db.insert(disciplineDailyJournals).values({
            userId,
            date: String(j.date),
            content: String(j.content),
          });
        }
      }

      // 4. Forex Logs
      for (const f of forexLogsToImport) {
        if (f.date) {
          await db.insert(disciplineForexLogs).values({
            userId,
            date: String(f.date),
            minutes: Number(f.minutes) || 0,
            pairs: f.pairs ? String(f.pairs) : "",
            notes: f.notes ? String(f.notes) : "",
          });
        }
      }

      // 5. Settings
      if (backup.settings) {
        await updateDisciplineSettings(userId, backup.settings);
      }
      return { success: true, count: tasksToImport.length + exercisesToImport.length + journalsToImport.length };
    } catch (err) {
      console.warn("[importDisciplineData db error]:", err);
    }
  }

  // In-memory fallback
  tasksToImport.forEach((t: any) => {
    if (t.title) {
      inMemoryDisciplineTasks.push({
        id: disciplineTaskAutoId++,
        userId,
        title: String(t.title).trim(),
        time: t.time || "08:00 AM",
        isMandatory: t.isMandatory !== false,
        isTrackable: t.isTrackable !== false,
        orderIndex: Number(t.orderIndex) || 0,
        isActive: t.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  exercisesToImport.forEach((e: any) => {
    if (e.name) {
      inMemoryDisciplineExercises.push({
        id: disciplineExerciseAutoId++,
        userId,
        name: String(e.name).trim(),
        difficulty: e.difficulty || "Intermediate",
        orderIndex: Number(e.orderIndex) || 0,
        isActive: e.isActive !== false,
        createdAt: new Date(),
      });
    }
  });

  journalsToImport.forEach((j: any) => {
    if (j.date && j.content) {
      inMemoryDisciplineJournals.push({
        id: disciplineJournalAutoId++,
        userId,
        date: String(j.date),
        content: String(j.content),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  forexLogsToImport.forEach((f: any) => {
    if (f.date) {
      inMemoryDisciplineForexLogs.push({
        id: disciplineForexAutoId++,
        userId,
        date: String(f.date),
        minutes: Number(f.minutes) || 0,
        pairs: f.pairs ? String(f.pairs) : "",
        notes: f.notes ? String(f.notes) : "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  if (backup.settings) {
    inMemoryDisciplineSettings.set(userId, {
      userId,
      ...backup.settings,
      updatedAt: new Date(),
    });
  }

  return { success: true, count: tasksToImport.length + exercisesToImport.length + journalsToImport.length };
}

export async function resetDisciplineData(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(disciplineTaskCompletions).where(eq(disciplineTaskCompletions.userId, userId));
      await db.delete(disciplineTasks).where(eq(disciplineTasks.userId, userId));
      await db.delete(disciplineWorkoutCompletions).where(eq(disciplineWorkoutCompletions.userId, userId));
      await db.delete(disciplineExercises).where(eq(disciplineExercises.userId, userId));
      await db.delete(disciplineDailyJournals).where(eq(disciplineDailyJournals.userId, userId));
      await db.delete(disciplineForexLogs).where(eq(disciplineForexLogs.userId, userId));
      await db.delete(disciplineSettings).where(eq(disciplineSettings.userId, userId));

      // Re-seed clean defaults for user
      await ensureDisciplineDefaults(userId);
      return true;
    } catch (err) {
      console.warn("[resetDisciplineData db error]:", err);
    }
  }

  // In-memory cleanup
  for (let i = inMemoryDisciplineTasks.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineTasks[i].userId === userId) inMemoryDisciplineTasks.splice(i, 1);
  }
  for (let i = inMemoryDisciplineCompletions.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineCompletions[i].userId === userId) inMemoryDisciplineCompletions.splice(i, 1);
  }
  for (let i = inMemoryDisciplineExercises.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineExercises[i].userId === userId) inMemoryDisciplineExercises.splice(i, 1);
  }
  for (let i = inMemoryDisciplineWorkoutCompletions.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineWorkoutCompletions[i].userId === userId) inMemoryDisciplineWorkoutCompletions.splice(i, 1);
  }
  for (let i = inMemoryDisciplineJournals.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineJournals[i].userId === userId) inMemoryDisciplineJournals.splice(i, 1);
  }
  for (let i = inMemoryDisciplineForexLogs.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineForexLogs[i].userId === userId) inMemoryDisciplineForexLogs.splice(i, 1);
  }
  inMemoryDisciplineSettings.delete(userId);

  await ensureDisciplineDefaults(userId);
  return true;
}

export async function listHabits(userId: number, date: string) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(habits)
        .where(and(eq(habits.userId, userId), eq(habits.date, date)));
    } catch (err) {
      console.warn("[listHabits error]:", err);
    }
  }

  try {
    const { data, error } = await supabaseServer
      .from("habits")
      .select("*")
      .eq("userId", userId)
      .eq("date", date);
    if (!error && data) return data;
  } catch {}

  try {
    const key = `user_habits_${userId}_${date}`;
    const raw = await getSetting(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [];
}

export async function toggleHabitEntry(userId: number, label: string, date: string, completed: boolean) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(habits)
        .where(and(eq(habits.userId, userId), eq(habits.date, date), eq(habits.label, label)))
        .limit(1);
      if (existing[0]) {
        await db.update(habits).set({ completed }).where(eq(habits.id, existing[0].id));
      } else {
        await db.insert(habits).values({ userId, label, date, completed });
      }
      return true;
    } catch (err) {
      console.warn("[toggleHabitEntry db error]:", err);
    }
  }

  try {
    await supabaseServer.from("habits").upsert({
      userId,
      label,
      date,
      completed,
    }, { onConflict: "userId,label,date" });
  } catch {}

  try {
    const key = `user_habits_${userId}_${date}`;
    const raw = await getSetting(key);
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const item = existing.find((h) => h.label === label);
    if (item) {
      item.completed = completed;
    } else {
      existing.push({ userId, label, date, completed });
    }
    await setSetting(key, JSON.stringify(existing));
  } catch {}

  return true;
}

export async function listProgress(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(progress).where(eq(progress.userId, userId));
    } catch (err) {
      console.warn("[listProgress error]:", err);
    }
  }

  try {
    const { data, error } = await supabaseServer.from("progress").select("*").eq("userId", userId);
    if (!error && data) return data;
  } catch {}

  try {
    const key = `user_progress_${userId}`;
    const raw = await getSetting(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [];
}

export async function toggleProgressEntry(userId: number, lessonId: number, completed: boolean) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(progress)
        .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)))
        .limit(1);
      if (existing[0]) {
        await db.update(progress).set({ completed }).where(eq(progress.id, existing[0].id));
      } else {
        await db.insert(progress).values({ userId, lessonId, completed });
      }
      return true;
    } catch (err) {
      console.warn("[toggleProgressEntry db error]:", err);
    }
  }

  try {
    await supabaseServer.from("progress").upsert({
      userId,
      lessonId,
      completed,
    }, { onConflict: "userId,lessonId" });
  } catch {}

  try {
    const key = `user_progress_${userId}`;
    const raw = await getSetting(key);
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const item = existing.find((p) => p.lessonId === lessonId);
    if (item) {
      item.completed = completed;
    } else {
      existing.push({ userId, lessonId, completed });
    }
    await setSetting(key, JSON.stringify(existing));
  } catch {}

  return true;
}

export async function listDiscipline(userId: number, date: string) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(disciplineEntries)
        .where(and(eq(disciplineEntries.userId, userId), eq(disciplineEntries.date, date)));
    } catch (err) {
      console.warn("[listDiscipline error]:", err);
    }
  }

  try {
    const { data, error } = await supabaseServer
      .from("disciplineEntries")
      .select("*")
      .eq("userId", userId)
      .eq("date", date);
    if (!error && data) return data;
  } catch {}

  try {
    const key = `user_discipline_${userId}_${date}`;
    const raw = await getSetting(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  return [];
}

export async function toggleDisciplineEntry(userId: number, label: string, date: string, completed: boolean) {
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineEntries)
        .where(and(eq(disciplineEntries.userId, userId), eq(disciplineEntries.date, date), eq(disciplineEntries.label, label)))
        .limit(1);
      if (existing[0]) {
        await db.update(disciplineEntries).set({ completed }).where(eq(disciplineEntries.id, existing[0].id));
      } else {
        await db.insert(disciplineEntries).values({ userId, label, date, completed });
      }
      return true;
    } catch (err) {
      console.warn("[toggleDisciplineEntry db error]:", err);
    }
  }

  try {
    await supabaseServer.from("disciplineEntries").upsert({
      userId,
      label,
      date,
      completed,
    }, { onConflict: "userId,label,date" });
  } catch {}

  try {
    const key = `user_discipline_${userId}_${date}`;
    const raw = await getSetting(key);
    const existing: any[] = raw ? JSON.parse(raw) : [];
    const item = existing.find((d) => d.label === label);
    if (item) {
      item.completed = completed;
    } else {
      existing.push({ userId, label, date, completed });
    }
    await setSetting(key, JSON.stringify(existing));
  } catch {}

  return true;
}


