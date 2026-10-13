import { and, asc, desc, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
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
import { deriveNumericIdFromOpenId } from "@shared/const";
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
// SCHEDULE & TASKS PERSISTENCE HELPERS
// ------------------------------------------------------------------------------

const userDisciplineTasksCache = new Map<number, any[]>();
const userDisciplineExercisesCache = new Map<number, any[]>();

/**
 * Resolves user canonical numeric ID (users.id) and derived openId hash ID.
 */
async function resolveDisciplineUserId(
  userId: number,
  openId?: string
): Promise<{ canonicalId: number; derivedId: number }> {
  let canonicalId = userId;
  let resolvedOpenId = openId || "";

  if (!resolvedOpenId && userId > 0) {
    try {
      const { getUserById, inMemoryUsers } = await import("../auth/repo");
      const user = await getUserById(userId);
      if (user?.openId) {
        resolvedOpenId = user.openId;
        canonicalId = user.id;
      } else {
        for (const u of Array.from(inMemoryUsers.values())) {
          if (u.openId && deriveNumericIdFromOpenId(u.openId) === userId) {
            resolvedOpenId = u.openId;
            canonicalId = u.id || canonicalId;
            break;
          }
        }
      }
    } catch {}

    if (!resolvedOpenId) {
      try {
        const { data } = await supabaseServer.from("users").select("id, openId");
        if (data && data.length) {
          for (const row of data) {
            if (row.openId && deriveNumericIdFromOpenId(row.openId) === userId) {
              resolvedOpenId = row.openId;
              canonicalId = row.id;
              break;
            }
          }
        }
      } catch {}
    }
  } else if (resolvedOpenId) {
    try {
      const { getUserByOpenId } = await import("../auth/repo");
      const user = await getUserByOpenId(resolvedOpenId);
      if (user?.id) {
        canonicalId = user.id;
      }
    } catch {}
  }

  const derivedId = resolvedOpenId ? deriveNumericIdFromOpenId(resolvedOpenId) : (userId > 9999 ? userId : 0);
  return { canonicalId, derivedId };
}

/**
 * Loads all tasks for a user from persistent storage (settings table in Supabase) or DB.
 */
export async function loadUserDisciplineTasks(userId: number, openId?: string): Promise<any[]> {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId, openId);

  // 1. Try Drizzle PostgreSQL if available
  const db = await getDb();
  if (db) {
    try {
      const dbTasks = await db
        .select()
        .from(disciplineTasks)
        .where(
          and(
            or(eq(disciplineTasks.userId, canonicalId), eq(disciplineTasks.userId, derivedId)),
            eq(disciplineTasks.isActive, true)
          )
        )
        .orderBy(asc(disciplineTasks.orderIndex), asc(disciplineTasks.id));
      if (dbTasks && dbTasks.length > 0) {
        userDisciplineTasksCache.set(canonicalId, dbTasks);
        if (derivedId) userDisciplineTasksCache.set(derivedId, dbTasks);
        return dbTasks;
      }
    } catch (err) {}
  }

  // 2. Check in-memory cache
  if (userDisciplineTasksCache.has(canonicalId)) {
    return userDisciplineTasksCache.get(canonicalId)!;
  }
  if (derivedId && userDisciplineTasksCache.has(derivedId)) {
    return userDisciplineTasksCache.get(derivedId)!;
  }

  // 3. Load from persistent settings table in Supabase
  let tasks: any[] = [];
  try {
    const rawCanonical = await getSetting(`discipline_tasks_${canonicalId}`);
    if (rawCanonical) {
      const parsed = JSON.parse(rawCanonical);
      if (Array.isArray(parsed) && parsed.length > 0) {
        tasks = parsed;
      }
    }
  } catch {}

  if (tasks.length === 0 && derivedId && derivedId !== canonicalId) {
    try {
      const rawDerived = await getSetting(`discipline_tasks_${derivedId}`);
      if (rawDerived) {
        const parsed = JSON.parse(rawDerived);
        if (Array.isArray(parsed) && parsed.length > 0) {
          tasks = parsed;
        }
      }
    } catch {}
  }

  const normalizedTasks = tasks.map((t, idx) => ({
    id: Number(t.id) || idx + 1,
    userId: canonicalId,
    title: String(t.title || "").trim(),
    startTime: t.startTime !== undefined && t.startTime !== null ? String(t.startTime).trim() : null,
    endTime: t.endTime !== undefined && t.endTime !== null ? String(t.endTime).trim() : null,
    time: t.startTime !== undefined && t.startTime !== null ? String(t.startTime).trim() : (t.time ? String(t.time).trim() : null),
    isMandatory: t.isMandatory !== false,
    isTrackable: t.isTrackable !== false,
    orderIndex: Number(t.orderIndex) || idx + 1,
    isActive: t.isActive !== false,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
  }));

  userDisciplineTasksCache.set(canonicalId, normalizedTasks);
  if (derivedId) userDisciplineTasksCache.set(derivedId, normalizedTasks);

  for (let i = inMemoryDisciplineTasks.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineTasks[i].userId === canonicalId || inMemoryDisciplineTasks[i].userId === derivedId) {
      inMemoryDisciplineTasks.splice(i, 1);
    }
  }
  inMemoryDisciplineTasks.push(...normalizedTasks);

  return normalizedTasks;
}

/**
 * Persists all tasks for a user to persistent storage (settings table in Supabase) and cache.
 */
export async function saveUserDisciplineTasks(userId: number, tasks: any[], openId?: string): Promise<void> {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId, openId);

  userDisciplineTasksCache.set(canonicalId, tasks);
  if (derivedId) userDisciplineTasksCache.set(derivedId, tasks);

  for (let i = inMemoryDisciplineTasks.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineTasks[i].userId === canonicalId || inMemoryDisciplineTasks[i].userId === derivedId) {
      inMemoryDisciplineTasks.splice(i, 1);
    }
  }
  inMemoryDisciplineTasks.push(...tasks);

  const payload = JSON.stringify(tasks);
  try {
    await setSetting(`discipline_tasks_${canonicalId}`, payload);
  } catch (err) {
    console.warn(`[saveUserDisciplineTasks setSetting error for ${canonicalId}]:`, err);
  }

  if (derivedId && derivedId !== canonicalId) {
    try {
      await setSetting(`discipline_tasks_${derivedId}`, payload);
    } catch {}
  }
}

// ------------------------------------------------------------------------------
// SCHEDULE & TASKS
// ------------------------------------------------------------------------------

export async function getDisciplineSchedule(userId: number, date: string) {
  await ensureDisciplineDefaults(userId);
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);

  // Load all tasks for user and filter for active
  const allTasks = await loadUserDisciplineTasks(canonicalId);
  const activeTasks = allTasks
    .filter((t) => t.isActive !== false)
    .sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));

  let completions: any[] = [];
  const db = await getDb();
  if (db) {
    try {
      completions = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(
          and(
            or(eq(disciplineTaskCompletions.userId, canonicalId), eq(disciplineTaskCompletions.userId, derivedId)),
            eq(disciplineTaskCompletions.date, date)
          )
        );
    } catch (err) {
      console.warn("[getDisciplineSchedule completions db error]:", err);
    }
  }

  if (completions.length === 0) {
    completions = inMemoryDisciplineCompletions.filter(
      (c) => (c.userId === canonicalId || (derivedId && c.userId === derivedId)) && c.date === date
    );
  }

  if (completions.length === 0) {
    try {
      let raw = await getSetting(`discipline_task_comp_${canonicalId}_${date}`);
      if (!raw && derivedId && derivedId !== canonicalId) {
        raw = await getSetting(`discipline_task_comp_${derivedId}_${date}`);
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          completions = parsed;
          for (const item of completions) {
            if (!inMemoryDisciplineCompletions.some((c) => c.userId === canonicalId && c.taskId === item.taskId && c.date === date)) {
              inMemoryDisciplineCompletions.push({ ...item, userId: canonicalId });
            }
          }
        }
      }
    } catch {}
  }

  const mergedTasks = activeTasks.map((t: any) => {
    const startTime = t.startTime !== undefined && t.startTime !== null ? t.startTime : (t.time ? t.time : null);
    const endTime = t.endTime !== undefined && t.endTime !== null ? t.endTime : null;
    return {
      ...t,
      startTime,
      endTime,
      completed: completions.some((c: any) => Number(c.taskId) === Number(t.id) && c.completed),
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
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
  const startTime = task.startTime?.trim() || null;
  const endTime = task.endTime?.trim() || null;
  const legacyTime = startTime || task.time?.trim() || null;

  // Load existing tasks to ensure we append without overwriting
  const allUserTasks = await loadUserDisciplineTasks(canonicalId);

  // Compute strictly unique monotonic next ID
  const maxId = allUserTasks.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
  const nextId = maxId > 0 ? maxId + 1 : 1;

  // Compute next orderIndex
  const activeTasks = allUserTasks.filter((t) => t.isActive !== false);
  const maxOrder = activeTasks.reduce((max, t) => Math.max(max, Number(t.orderIndex) || 0), 0);
  const nextOrder = maxOrder + 1;

  let dbInsertId: number | null = null;
  const db = await getDb();
  if (db) {
    try {
      const res = await db.insert(disciplineTasks).values({
        userId: canonicalId,
        title: task.title.trim(),
        startTime,
        endTime,
        time: legacyTime,
        isMandatory: task.isMandatory ?? true,
        isTrackable: task.isTrackable ?? true,
        orderIndex: nextOrder,
        isActive: true,
      });
      dbInsertId = res[0]?.insertId || res[0]?.id || null;
    } catch (err) {
      console.warn("[addDisciplineTask db error]:", err);
    }
  }

  const finalId = dbInsertId || nextId;

  const createdTask = {
    id: finalId,
    userId: canonicalId,
    title: task.title.trim(),
    startTime,
    endTime,
    time: legacyTime,
    isMandatory: task.isMandatory ?? true,
    isTrackable: task.isTrackable ?? true,
    orderIndex: nextOrder,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Append new task to existing list (preserves all existing tasks)
  const updatedAllTasks = [...allUserTasks, createdTask];
  await saveUserDisciplineTasks(canonicalId, updatedAllTasks, derivedId ? String(derivedId) : undefined);

  return createdTask;
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
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
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
        .where(
          and(
            eq(disciplineTasks.id, taskId),
            or(eq(disciplineTasks.userId, canonicalId), eq(disciplineTasks.userId, derivedId))
          )
        );
    } catch (err) {
      console.warn("[updateDisciplineTask db error]:", err);
    }
  }

  const allUserTasks = await loadUserDisciplineTasks(canonicalId);
  const targetIdx = allUserTasks.findIndex((t) => Number(t.id) === Number(taskId));

  if (targetIdx !== -1) {
    allUserTasks[targetIdx] = {
      ...allUserTasks[targetIdx],
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    };
    await saveUserDisciplineTasks(canonicalId, allUserTasks, derivedId ? String(derivedId) : undefined);
    return true;
  }

  return false;
}

export async function deleteDisciplineTask(userId: number, taskId: number) {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineTasks)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(disciplineTasks.id, taskId),
            or(eq(disciplineTasks.userId, canonicalId), eq(disciplineTasks.userId, derivedId))
          )
        );
      await db
        .delete(disciplineTaskCompletions)
        .where(
          and(
            eq(disciplineTaskCompletions.taskId, taskId),
            or(eq(disciplineTaskCompletions.userId, canonicalId), eq(disciplineTaskCompletions.userId, derivedId))
          )
        );
    } catch (err) {
      console.warn("[deleteDisciplineTask db error]:", err);
    }
  }

  const allUserTasks = await loadUserDisciplineTasks(canonicalId);
  const targetIdx = allUserTasks.findIndex((t) => Number(t.id) === Number(taskId));

  if (targetIdx !== -1) {
    allUserTasks[targetIdx] = {
      ...allUserTasks[targetIdx],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    await saveUserDisciplineTasks(canonicalId, allUserTasks, derivedId ? String(derivedId) : undefined);
  }

  for (let i = inMemoryDisciplineCompletions.length - 1; i >= 0; i--) {
    if (
      inMemoryDisciplineCompletions[i].taskId === taskId &&
      (inMemoryDisciplineCompletions[i].userId === canonicalId || inMemoryDisciplineCompletions[i].userId === derivedId)
    ) {
      inMemoryDisciplineCompletions.splice(i, 1);
    }
  }

  return true;
}

export async function toggleDisciplineTaskCompletion(
  userId: number,
  taskId: number,
  date: string,
  completed: boolean
) {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(
          and(
            or(eq(disciplineTaskCompletions.userId, canonicalId), eq(disciplineTaskCompletions.userId, derivedId)),
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
          userId: canonicalId,
          taskId,
          date,
          completed,
          completedAt: completed ? new Date() : null,
        });
      }
    } catch (err) {
      console.warn("[toggleDisciplineTaskCompletion db error]:", err);
    }
  }

  const existing = inMemoryDisciplineCompletions.find(
    (c) => (c.userId === canonicalId || (derivedId && c.userId === derivedId)) && c.taskId === taskId && c.date === date
  );
  if (existing) {
    existing.completed = completed;
    existing.completedAt = completed ? new Date() : null;
  } else {
    inMemoryDisciplineCompletions.push({
      id: disciplineCompletionAutoId++,
      userId: canonicalId,
      taskId,
      date,
      completed,
      completedAt: completed ? new Date() : null,
    });
  }

  try {
    const currentCompletions = inMemoryDisciplineCompletions.filter(
      (c) => (c.userId === canonicalId || (derivedId && c.userId === derivedId)) && c.date === date
    );
    await setSetting(`discipline_task_comp_${canonicalId}_${date}`, JSON.stringify(currentCompletions));
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`discipline_task_comp_${derivedId}_${date}`, JSON.stringify(currentCompletions));
    }

    // Maintain unique completed dates record
    const hasAnyCompleted = currentCompletions.some((c) => c.completed);
    let datesList: string[] = [];
    try {
      const rawDates = await getSetting(`discipline_completed_dates_${canonicalId}`);
      if (rawDates) datesList = JSON.parse(rawDates) || [];
    } catch {}
    const datesSet = new Set(datesList);
    if (hasAnyCompleted) {
      datesSet.add(date);
    } else {
      datesSet.delete(date);
    }
    const updatedDates = Array.from(datesSet);
    await setSetting(`discipline_completed_dates_${canonicalId}`, JSON.stringify(updatedDates));
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`discipline_completed_dates_${derivedId}`, JSON.stringify(updatedDates));
    }
  } catch {}

  return true;
}

/**
 * Returns all unique dates where user has completed at least one discipline task in the period.
 */
export async function getUserCompletedDisciplineDates(userId: number, minDateStr?: string): Promise<string[]> {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
  const db = await getDb();
  const completedDates = new Set<string>();

  if (db) {
    try {
      const rows = await db
        .select({ date: disciplineTaskCompletions.date })
        .from(disciplineTaskCompletions)
        .where(
          and(
            or(eq(disciplineTaskCompletions.userId, canonicalId), eq(disciplineTaskCompletions.userId, derivedId)),
            eq(disciplineTaskCompletions.completed, true),
            minDateStr ? sql`${disciplineTaskCompletions.date} >= ${minDateStr}` : sql`1=1`
          )
        );
      for (const r of rows) {
        if (r.date) completedDates.add(r.date);
      }
    } catch (err) {}
  }

  for (const c of inMemoryDisciplineCompletions) {
    if ((c.userId === canonicalId || (derivedId && c.userId === derivedId)) && c.completed) {
      if (!minDateStr || c.date >= minDateStr) {
        completedDates.add(c.date);
      }
    }
  }

  try {
    let rawDates = await getSetting(`discipline_completed_dates_${canonicalId}`);
    if (!rawDates && derivedId && derivedId !== canonicalId) {
      rawDates = await getSetting(`discipline_completed_dates_${derivedId}`);
    }
    if (rawDates) {
      const parsed = JSON.parse(rawDates);
      if (Array.isArray(parsed)) {
        for (const d of parsed) {
          if (typeof d === "string" && (!minDateStr || d >= minDateStr)) {
            completedDates.add(d);
          }
        }
      }
    }
  } catch {}

  return Array.from(completedDates);
}

/**
 * Checks whether user has already completed any discipline tasks on the specified date.
 */
export async function isDisciplineDateAlreadyLogged(userId: number, date: string): Promise<boolean> {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
  const db = await getDb();

  if (db) {
    try {
      const rows = await db
        .select({ id: disciplineTaskCompletions.id })
        .from(disciplineTaskCompletions)
        .where(
          and(
            or(eq(disciplineTaskCompletions.userId, canonicalId), eq(disciplineTaskCompletions.userId, derivedId)),
            eq(disciplineTaskCompletions.date, date),
            eq(disciplineTaskCompletions.completed, true)
          )
        )
        .limit(1);
      if (rows.length > 0) return true;
    } catch (err) {}
  }

  const inMem = inMemoryDisciplineCompletions.some(
    (c) => (c.userId === canonicalId || (derivedId && c.userId === derivedId)) && c.date === date && c.completed
  );
  if (inMem) return true;

  try {
    let raw = await getSetting(`discipline_task_comp_${canonicalId}_${date}`);
    if (!raw && derivedId && derivedId !== canonicalId) {
      raw = await getSetting(`discipline_task_comp_${derivedId}_${date}`);
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.some((c: any) => c.completed)) {
        return true;
      }
    }
  } catch {}

  try {
    let rawDates = await getSetting(`discipline_completed_dates_${canonicalId}`);
    if (!rawDates && derivedId && derivedId !== canonicalId) {
      rawDates = await getSetting(`discipline_completed_dates_${derivedId}`);
    }
    if (rawDates) {
      const parsed = JSON.parse(rawDates);
      if (Array.isArray(parsed) && parsed.includes(date)) {
        return true;
      }
    }
  } catch {}

  return false;
}

// ------------------------------------------------------------------------------
// WORKOUT
// ------------------------------------------------------------------------------

/**
 * Loads all exercises for a user from persistent storage (settings table in Supabase) or DB.
 */
export async function loadUserDisciplineExercises(userId: number, openId?: string): Promise<any[]> {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId, openId);

  const db = await getDb();
  if (db) {
    try {
      const dbExercises = await db
        .select()
        .from(disciplineExercises)
        .where(
          and(
            or(eq(disciplineExercises.userId, canonicalId), eq(disciplineExercises.userId, derivedId)),
            eq(disciplineExercises.isActive, true)
          )
        )
        .orderBy(asc(disciplineExercises.orderIndex), asc(disciplineExercises.id));
      if (dbExercises && dbExercises.length > 0) {
        userDisciplineExercisesCache.set(canonicalId, dbExercises);
        if (derivedId) userDisciplineExercisesCache.set(derivedId, dbExercises);
        return dbExercises;
      }
    } catch (err) {}
  }

  if (userDisciplineExercisesCache.has(canonicalId)) {
    return userDisciplineExercisesCache.get(canonicalId)!;
  }
  if (derivedId && userDisciplineExercisesCache.has(derivedId)) {
    return userDisciplineExercisesCache.get(derivedId)!;
  }

  let exercises: any[] = [];
  try {
    const rawCanonical = await getSetting(`discipline_exercises_${canonicalId}`);
    if (rawCanonical) {
      const parsed = JSON.parse(rawCanonical);
      if (Array.isArray(parsed) && parsed.length > 0) {
        exercises = parsed;
      }
    }
  } catch {}

  if (exercises.length === 0 && derivedId && derivedId !== canonicalId) {
    try {
      const rawDerived = await getSetting(`discipline_exercises_${derivedId}`);
      if (rawDerived) {
        const parsed = JSON.parse(rawDerived);
        if (Array.isArray(parsed) && parsed.length > 0) {
          exercises = parsed;
        }
      }
    } catch {}
  }

  const normalized = exercises.map((e, idx) => ({
    id: Number(e.id) || idx + 1,
    userId: canonicalId,
    name: String(e.name || "").trim(),
    difficulty: e.difficulty || "Intermediate",
    orderIndex: Number(e.orderIndex) || idx + 1,
    isActive: e.isActive !== false,
    createdAt: e.createdAt || new Date().toISOString(),
  }));

  userDisciplineExercisesCache.set(canonicalId, normalized);
  if (derivedId) userDisciplineExercisesCache.set(derivedId, normalized);

  for (let i = inMemoryDisciplineExercises.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineExercises[i].userId === canonicalId || inMemoryDisciplineExercises[i].userId === derivedId) {
      inMemoryDisciplineExercises.splice(i, 1);
    }
  }
  inMemoryDisciplineExercises.push(...normalized);

  return normalized;
}

/**
 * Persists all exercises for a user to persistent storage (settings table in Supabase) and cache.
 */
export async function saveUserDisciplineExercises(userId: number, exercises: any[], openId?: string): Promise<void> {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId, openId);

  userDisciplineExercisesCache.set(canonicalId, exercises);
  if (derivedId) userDisciplineExercisesCache.set(derivedId, exercises);

  for (let i = inMemoryDisciplineExercises.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineExercises[i].userId === canonicalId || inMemoryDisciplineExercises[i].userId === derivedId) {
      inMemoryDisciplineExercises.splice(i, 1);
    }
  }
  inMemoryDisciplineExercises.push(...exercises);

  const payload = JSON.stringify(exercises);
  try {
    await setSetting(`discipline_exercises_${canonicalId}`, payload);
  } catch (err) {}

  if (derivedId && derivedId !== canonicalId) {
    try {
      await setSetting(`discipline_exercises_${derivedId}`, payload);
    } catch {}
  }
}

// ------------------------------------------------------------------------------
// WORKOUT
// ------------------------------------------------------------------------------

export async function getDisciplineWorkouts(userId: number, date: string) {
  await ensureDisciplineDefaults(userId);
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);

  const allExercises = await loadUserDisciplineExercises(canonicalId);
  const activeExercises = allExercises
    .filter((e) => e.isActive !== false)
    .sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));

  let completions: any[] = [];
  const db = await getDb();
  if (db) {
    try {
      completions = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(
          and(
            or(eq(disciplineWorkoutCompletions.userId, canonicalId), eq(disciplineWorkoutCompletions.userId, derivedId)),
            eq(disciplineWorkoutCompletions.date, date)
          )
        );
    } catch (err) {
      console.warn("[getDisciplineWorkouts db error]:", err);
    }
  }

  if (completions.length === 0) {
    completions = inMemoryDisciplineWorkoutCompletions.filter(
      (c) => (c.userId === canonicalId || (derivedId && c.userId === derivedId)) && c.date === date
    );
  }

  if (completions.length === 0) {
    try {
      let raw = await getSetting(`discipline_workout_comp_${canonicalId}_${date}`);
      if (!raw && derivedId && derivedId !== canonicalId) {
        raw = await getSetting(`discipline_workout_comp_${derivedId}_${date}`);
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          completions = parsed;
          for (const item of completions) {
            if (!inMemoryDisciplineWorkoutCompletions.some((c) => c.userId === canonicalId && c.exerciseId === item.exerciseId && c.date === date)) {
              inMemoryDisciplineWorkoutCompletions.push({ ...item, userId: canonicalId });
            }
          }
        }
      }
    } catch {}
  }

  const merged = activeExercises.map((e: any) => ({
    ...e,
    completed: completions.some((c: any) => Number(c.exerciseId) === Number(e.id) && c.completed),
  }));

  const completedCount = merged.filter((e: any) => e.completed).length;
  const progressPercent = merged.length ? Math.round((completedCount / merged.length) * 100) : 0;

  return { exercises: merged, progressPercent, date };
}

export async function addDisciplineExercise(
  userId: number,
  exercise: { name: string; difficulty: string }
) {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
  const allExercises = await loadUserDisciplineExercises(canonicalId);

  const maxId = allExercises.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0);
  const nextId = maxId > 0 ? maxId + 1 : 1;

  const activeExercises = allExercises.filter((e) => e.isActive !== false);
  const maxOrder = activeExercises.reduce((max, e) => Math.max(max, Number(e.orderIndex) || 0), 0);
  const nextOrder = maxOrder + 1;

  let dbInsertId: number | null = null;
  const db = await getDb();
  if (db) {
    try {
      const res = await db.insert(disciplineExercises).values({
        userId: canonicalId,
        name: exercise.name.trim(),
        difficulty: exercise.difficulty || "Intermediate",
        orderIndex: nextOrder,
        isActive: true,
      });
      dbInsertId = res[0]?.insertId || res[0]?.id || null;
    } catch (err) {
      console.warn("[addDisciplineExercise db error]:", err);
    }
  }

  const finalId = dbInsertId || nextId;

  const created = {
    id: finalId,
    userId: canonicalId,
    name: exercise.name.trim(),
    difficulty: exercise.difficulty || "Intermediate",
    orderIndex: nextOrder,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const updatedAll = [...allExercises, created];
  await saveUserDisciplineExercises(canonicalId, updatedAll, derivedId ? String(derivedId) : undefined);

  return created;
}

export async function updateDisciplineExercise(
  userId: number,
  exerciseId: number,
  updates: Partial<{ name: string; difficulty: string }>
) {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineExercises)
        .set(updates)
        .where(
          and(
            eq(disciplineExercises.id, exerciseId),
            or(eq(disciplineExercises.userId, canonicalId), eq(disciplineExercises.userId, derivedId))
          )
        );
    } catch (err) {
      console.warn("[updateDisciplineExercise db error]:", err);
    }
  }

  const allExercises = await loadUserDisciplineExercises(canonicalId);
  const targetIdx = allExercises.findIndex((e) => Number(e.id) === Number(exerciseId));

  if (targetIdx !== -1) {
    allExercises[targetIdx] = {
      ...allExercises[targetIdx],
      ...updates,
    };
    await saveUserDisciplineExercises(canonicalId, allExercises, derivedId ? String(derivedId) : undefined);
    return true;
  }

  return false;
}

export async function deleteDisciplineExercise(userId: number, exerciseId: number) {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(disciplineExercises)
        .set({ isActive: false })
        .where(
          and(
            eq(disciplineExercises.id, exerciseId),
            or(eq(disciplineExercises.userId, canonicalId), eq(disciplineExercises.userId, derivedId))
          )
        );
      await db
        .delete(disciplineWorkoutCompletions)
        .where(
          and(
            eq(disciplineWorkoutCompletions.exerciseId, exerciseId),
            or(eq(disciplineWorkoutCompletions.userId, canonicalId), eq(disciplineWorkoutCompletions.userId, derivedId))
          )
        );
    } catch (err) {
      console.warn("[deleteDisciplineExercise db error]:", err);
    }
  }

  const allExercises = await loadUserDisciplineExercises(canonicalId);
  const targetIdx = allExercises.findIndex((e) => Number(e.id) === Number(exerciseId));

  if (targetIdx !== -1) {
    allExercises[targetIdx] = {
      ...allExercises[targetIdx],
      isActive: false,
    };
    await saveUserDisciplineExercises(canonicalId, allExercises, derivedId ? String(derivedId) : undefined);
  }

  for (let i = inMemoryDisciplineWorkoutCompletions.length - 1; i >= 0; i--) {
    if (
      inMemoryDisciplineWorkoutCompletions[i].exerciseId === exerciseId &&
      (inMemoryDisciplineWorkoutCompletions[i].userId === canonicalId || inMemoryDisciplineWorkoutCompletions[i].userId === derivedId)
    ) {
      inMemoryDisciplineWorkoutCompletions.splice(i, 1);
    }
  }

  return true;
}

export async function toggleDisciplineWorkoutCompletion(
  userId: number,
  exerciseId: number,
  date: string,
  completed: boolean
) {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);

  const db = await getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(
          and(
            or(eq(disciplineWorkoutCompletions.userId, canonicalId), eq(disciplineWorkoutCompletions.userId, derivedId)),
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
          userId: canonicalId,
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
    (c) => (c.userId === canonicalId || (derivedId && c.userId === derivedId)) && c.exerciseId === exerciseId && c.date === date
  );
  if (existing) {
    existing.completed = completed;
  } else {
    inMemoryDisciplineWorkoutCompletions.push({
      id: disciplineWorkoutAutoId++,
      userId: canonicalId,
      exerciseId,
      date,
      completed,
    });
  }

  try {
    const currentCompletions = inMemoryDisciplineWorkoutCompletions.filter(
      (c) => (c.userId === canonicalId || (derivedId && c.userId === derivedId)) && c.date === date
    );
    await setSetting(`discipline_workout_comp_${canonicalId}_${date}`, JSON.stringify(currentCompletions));
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`discipline_workout_comp_${derivedId}_${date}`, JSON.stringify(currentCompletions));
    }
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
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
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
        .where(
          and(
            or(eq(disciplineTasks.userId, canonicalId), eq(disciplineTasks.userId, derivedId)),
            eq(disciplineTasks.isActive, true)
          )
        );

      completions = await db
        .select()
        .from(disciplineTaskCompletions)
        .where(or(eq(disciplineTaskCompletions.userId, canonicalId), eq(disciplineTaskCompletions.userId, derivedId)));

      workoutCompletions = await db
        .select()
        .from(disciplineWorkoutCompletions)
        .where(or(eq(disciplineWorkoutCompletions.userId, canonicalId), eq(disciplineWorkoutCompletions.userId, derivedId)));

      forexLogs = await db
        .select()
        .from(disciplineForexLogs)
        .where(or(eq(disciplineForexLogs.userId, canonicalId), eq(disciplineForexLogs.userId, derivedId)));

      const s = await db
        .select()
        .from(disciplineSettings)
        .where(or(eq(disciplineSettings.userId, canonicalId), eq(disciplineSettings.userId, derivedId)))
        .limit(1);
      userSettings = s[0];
    } catch (err) {
      console.warn("[getDisciplineStats db error]:", err);
    }
  }

  if (tasks.length === 0) {
    tasks = await loadUserDisciplineTasks(canonicalId);
  }
  if (completions.length === 0) {
    completions = inMemoryDisciplineCompletions.filter(
      (c) => c.userId === canonicalId || (derivedId && c.userId === derivedId)
    );
  }
  if (workoutCompletions.length === 0) {
    workoutCompletions = inMemoryDisciplineWorkoutCompletions.filter(
      (w) => w.userId === canonicalId || (derivedId && w.userId === derivedId)
    );
  }
  if (forexLogs.length === 0) {
    forexLogs = await getDisciplineForexLogs(canonicalId);
  }
  if (!userSettings) {
    userSettings = inMemoryDisciplineSettings.get(canonicalId) || (derivedId ? inMemoryDisciplineSettings.get(derivedId) : null);
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
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
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
      tasks = await db.select().from(disciplineTasks).where(or(eq(disciplineTasks.userId, canonicalId), eq(disciplineTasks.userId, derivedId)));
      completions = await db.select().from(disciplineTaskCompletions).where(or(eq(disciplineTaskCompletions.userId, canonicalId), eq(disciplineTaskCompletions.userId, derivedId)));
      exercises = await db.select().from(disciplineExercises).where(or(eq(disciplineExercises.userId, canonicalId), eq(disciplineExercises.userId, derivedId)));
      workoutCompletions = await db.select().from(disciplineWorkoutCompletions).where(or(eq(disciplineWorkoutCompletions.userId, canonicalId), eq(disciplineWorkoutCompletions.userId, derivedId)));
      journals = await db.select().from(disciplineDailyJournals).where(or(eq(disciplineDailyJournals.userId, canonicalId), eq(disciplineDailyJournals.userId, derivedId)));
      forexLogs = await db.select().from(disciplineForexLogs).where(or(eq(disciplineForexLogs.userId, canonicalId), eq(disciplineForexLogs.userId, derivedId)));
      const s = await db.select().from(disciplineSettings).where(or(eq(disciplineSettings.userId, canonicalId), eq(disciplineSettings.userId, derivedId))).limit(1);
      userSettings = s[0] || null;
    } catch (err) {
      console.warn("[exportDisciplineData db error]:", err);
    }
  }

  if (tasks.length === 0) {
    tasks = await loadUserDisciplineTasks(canonicalId);
  }
  if (exercises.length === 0) {
    exercises = await loadUserDisciplineExercises(canonicalId);
  }
  if (journals.length === 0) {
    journals = await getDisciplineJournals(canonicalId);
  }
  if (forexLogs.length === 0) {
    forexLogs = await getDisciplineForexLogs(canonicalId);
  }
  if (!userSettings) {
    userSettings = inMemoryDisciplineSettings.get(canonicalId) || null;
  }

  return {
    version: "1.0",
    appName: "Cycle of Chart — Daily Discipline",
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

  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
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
            userId: canonicalId,
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
            userId: canonicalId,
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
            userId: canonicalId,
            date: String(j.date),
            content: String(j.content),
          });
        }
      }

      // 4. Forex Logs
      for (const f of forexLogsToImport) {
        if (f.date) {
          await db.insert(disciplineForexLogs).values({
            userId: canonicalId,
            date: String(f.date),
            minutes: Number(f.minutes) || 0,
            pairs: f.pairs ? String(f.pairs) : "",
            notes: f.notes ? String(f.notes) : "",
          });
        }
      }

      // 5. Settings
      if (backup.settings) {
        await updateDisciplineSettings(canonicalId, backup.settings);
      }
    } catch (err) {
      console.warn("[importDisciplineData db error]:", err);
    }
  }

  // Persistent settings fallback & cache synchronization
  if (tasksToImport.length > 0) {
    const existing = await loadUserDisciplineTasks(canonicalId);
    let maxId = existing.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
    const newTasks = tasksToImport.map((t: any, idx: number) => ({
      id: Number(t.id) || ++maxId,
      userId: canonicalId,
      title: String(t.title).trim(),
      startTime: t.startTime?.trim() || null,
      endTime: t.endTime?.trim() || null,
      time: t.startTime?.trim() || t.time?.trim() || "08:00 AM",
      isMandatory: t.isMandatory !== false,
      isTrackable: t.isTrackable !== false,
      orderIndex: Number(t.orderIndex) || idx + 1,
      isActive: t.isActive !== false,
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: t.updatedAt || new Date().toISOString(),
    }));
    await saveUserDisciplineTasks(canonicalId, [...existing, ...newTasks], derivedId ? String(derivedId) : undefined);
  }

  if (exercisesToImport.length > 0) {
    const existingEx = await loadUserDisciplineExercises(canonicalId);
    let maxExId = existingEx.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0);
    const newEx = exercisesToImport.map((e: any, idx: number) => ({
      id: Number(e.id) || ++maxExId,
      userId: canonicalId,
      name: String(e.name).trim(),
      difficulty: e.difficulty || "Intermediate",
      orderIndex: Number(e.orderIndex) || idx + 1,
      isActive: e.isActive !== false,
      createdAt: e.createdAt || new Date().toISOString(),
    }));
    await saveUserDisciplineExercises(canonicalId, [...existingEx, ...newEx], derivedId ? String(derivedId) : undefined);
  }

  for (const j of journalsToImport) {
    if (j.date && j.content) {
      await saveDisciplineJournal(canonicalId, String(j.date), String(j.content));
    }
  }

  for (const f of forexLogsToImport) {
    if (f.date) {
      await saveDisciplineForexLog(canonicalId, String(f.date), Number(f.minutes) || 0, f.pairs ? String(f.pairs) : "", f.notes ? String(f.notes) : "");
    }
  }

  if (backup.settings) {
    await updateDisciplineSettings(canonicalId, backup.settings);
  }

  return { success: true, count: tasksToImport.length + exercisesToImport.length + journalsToImport.length };
}

export async function resetDisciplineData(userId: number) {
  const { canonicalId, derivedId } = await resolveDisciplineUserId(userId);
  const db = await getDb();
  if (db) {
    try {
      await db.delete(disciplineTaskCompletions).where(or(eq(disciplineTaskCompletions.userId, canonicalId), eq(disciplineTaskCompletions.userId, derivedId)));
      await db.delete(disciplineTasks).where(or(eq(disciplineTasks.userId, canonicalId), eq(disciplineTasks.userId, derivedId)));
      await db.delete(disciplineWorkoutCompletions).where(or(eq(disciplineWorkoutCompletions.userId, canonicalId), eq(disciplineWorkoutCompletions.userId, derivedId)));
      await db.delete(disciplineExercises).where(or(eq(disciplineExercises.userId, canonicalId), eq(disciplineExercises.userId, derivedId)));
      await db.delete(disciplineDailyJournals).where(or(eq(disciplineDailyJournals.userId, canonicalId), eq(disciplineDailyJournals.userId, derivedId)));
      await db.delete(disciplineForexLogs).where(or(eq(disciplineForexLogs.userId, canonicalId), eq(disciplineForexLogs.userId, derivedId)));
      await db.delete(disciplineSettings).where(or(eq(disciplineSettings.userId, canonicalId), eq(disciplineSettings.userId, derivedId)));
    } catch (err) {
      console.warn("[resetDisciplineData db error]:", err);
    }
  }

  // Clear persistent tasks and exercises in settings
  await saveUserDisciplineTasks(canonicalId, [], derivedId ? String(derivedId) : undefined);
  await saveUserDisciplineExercises(canonicalId, [], derivedId ? String(derivedId) : undefined);

  try {
    await setSetting(`discipline_journals_${canonicalId}`, "[]");
    await setSetting(`discipline_forex_${canonicalId}`, "[]");
    if (derivedId && derivedId !== canonicalId) {
      await setSetting(`discipline_journals_${derivedId}`, "[]");
      await setSetting(`discipline_forex_${derivedId}`, "[]");
    }
  } catch {}

  // In-memory cleanup
  for (let i = inMemoryDisciplineTasks.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineTasks[i].userId === canonicalId || inMemoryDisciplineTasks[i].userId === derivedId) inMemoryDisciplineTasks.splice(i, 1);
  }
  for (let i = inMemoryDisciplineCompletions.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineCompletions[i].userId === canonicalId || inMemoryDisciplineCompletions[i].userId === derivedId) inMemoryDisciplineCompletions.splice(i, 1);
  }
  for (let i = inMemoryDisciplineExercises.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineExercises[i].userId === canonicalId || inMemoryDisciplineExercises[i].userId === derivedId) inMemoryDisciplineExercises.splice(i, 1);
  }
  for (let i = inMemoryDisciplineWorkoutCompletions.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineWorkoutCompletions[i].userId === canonicalId || inMemoryDisciplineWorkoutCompletions[i].userId === derivedId) inMemoryDisciplineWorkoutCompletions.splice(i, 1);
  }
  for (let i = inMemoryDisciplineJournals.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineJournals[i].userId === canonicalId || inMemoryDisciplineJournals[i].userId === derivedId) inMemoryDisciplineJournals.splice(i, 1);
  }
  for (let i = inMemoryDisciplineForexLogs.length - 1; i >= 0; i--) {
    if (inMemoryDisciplineForexLogs[i].userId === canonicalId || inMemoryDisciplineForexLogs[i].userId === derivedId) inMemoryDisciplineForexLogs.splice(i, 1);
  }
  inMemoryDisciplineSettings.delete(canonicalId);
  if (derivedId) inMemoryDisciplineSettings.delete(derivedId);

  await ensureDisciplineDefaults(canonicalId);
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


