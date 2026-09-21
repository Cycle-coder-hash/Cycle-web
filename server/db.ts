import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import pg from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import {
  InsertUser,
  User,
  users,
  verificationTokens,
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
  SupportTicket,
  InsertSupportTicket,
  TicketReply,
  InsertTicketReply,
  notifications,
  settings,
  auditEvents,
  freeEbooks,
  FreeEbook,
  InsertFreeEbook,
  disciplineTasks,
  disciplineTaskCompletions,
  disciplineExercises,
  disciplineWorkoutCompletions,
  disciplineDailyJournals,
  disciplineForexLogs,
  disciplineSettings,
  DisciplineTask,
  DisciplineExercise,
  DisciplineDailyJournal,
  DisciplineForexLog,
  DisciplineSetting,
  traderTrades,
  TraderTrade,
  InsertTraderTrade,
} from "../drizzle/schema";

import { ENV } from "./_core/env";
import { deriveNumericIdFromOpenId } from "@shared/const";
import { supabaseServer } from "./supabase";

let _db: any = null;
let _pgPool: pg.Pool | null = null;

export const DEFAULT_FREE_EBOOKS: any[] = [
  {
    id: 1,
    titleEn: "1. Candle Range Theory (CRT) Master Cheat-Sheet",
    titleBn: "১. ক্যান্ডেল রেঞ্জ থিওরি (CRT) মাস্টার চিট-শীট",
    subtitleEn: "Complete 4-Step Algorithmic Cycle & Invalidation Points",
    subtitleBn: "সম্পূর্ণ ৪-ধাপ অ্যালগরিদমিক সাইকেল ও ইনভ্যালিডেশন পয়েন্ট",
    category: "Algorithm",
    pages: 18,
    keyConcepts: [
      "Phase 1: Asian Session Range Initiation (00:00 - 06:00 GMT)",
      "Phase 2: London Open Judas Sweep (07:30 - 09:00 GMT)",
      "Phase 3: NY Open Real Institutional Expansion (13:00 - 15:30 GMT)",
      "Phase 4: Targeted Distribution into HTF Pool",
    ],
    fileUrl: null,
    fileName: "01_Candle_Range_Theory_CRT_Master_CheatSheet.pdf",
    fileSize: "2.4 MB",
    isPublished: true,
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    titleEn: "2. Liquidity Engineering & Stop Hunt Identification",
    titleBn: "২. লিকুইডিটি ইঞ্জিনিয়ারিং ও স্টপ হান্ট আইডেন্টিফিকেশন",
    subtitleEn: "BSL, SSL, Internal vs External Liquidity Traps",
    subtitleBn: "BSL, SSL এবং ইন্টারনাল বনাম এক্সটারনাল লিকুইডিটি ট্র্যাপ",
    category: "Liquidity",
    pages: 24,
    keyConcepts: [
      "Buy-Side Liquidity (BSL) rests above swing highs & equal highs.",
      "Sell-Side Liquidity (SSL) rests below swing lows & trendline support.",
      "Inducement vs Valid Breakout confirmation formula.",
    ],
    fileUrl: null,
    fileName: "02_Liquidity_Engineering_Stop_Hunt.pdf",
    fileSize: "3.1 MB",
    isPublished: true,
    position: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    titleEn: "3. Institutional Order Block (OB) Validation Matrix",
    titleBn: "৩. ইনস্টিটিউশনাল অর্ডার ব্লক (OB) ভ্যালিডেশন ম্যাট্রিক্স",
    subtitleEn: "Distinguishing 80%+ Win Rate OBs from Fake SMC Zones",
    subtitleBn: "৮০%+ উইন রেটের জেনুইন অর্ডার ব্লক শনাক্তকরণ পদ্ধতি",
    category: "SMC Strategy",
    pages: 20,
    keyConcepts: [
      "Rule 1: Must have swept liquidity prior to creation.",
      "Rule 2: Must have caused a Market Structure Shift (MSS).",
      "Rule 3: Must contain an imbalance / Fair Value Gap in the displacement.",
    ],
    fileUrl: null,
    fileName: "03_Order_Block_Validation_Matrix.pdf",
    fileSize: "2.8 MB",
    isPublished: true,
    position: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    titleEn: "4. Fair Value Gap (FVG) & Volume Inefficiency Guide",
    titleBn: "৪. ফেয়ার ভ্যালু গ্যাপ (FVG) ও ভলিউম ইনফিশিয়েন্সি গাইড",
    subtitleEn: "Consequent Encroachment & Inverse FVG Trading Models",
    subtitleBn: "কনসিকুয়েন্ট এনক্রোচমেন্ট ও ইনভার্স এফভিজি ট্রেডিং মডেল",
    category: "Price Action",
    pages: 16,
    keyConcepts: [
      "3-Candle Imbalance calculation formula.",
      "Consequent Encroachment (50% midpoint) entry technique.",
      "Inverse FVG (IFVG) as continuation confirmation.",
    ],
    fileUrl: null,
    fileName: "04_Fair_Value_Gap_FVG_Guide.pdf",
    fileSize: "1.9 MB",
    isPublished: true,
    position: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    titleEn: "5. Multi-Timeframe Top-Down Sniper Execution Blueprint",
    titleBn: "৫. মাল্টি-টাইমফ্রেম টপ-ডাউন স্নাইপার এক্সিকিউশন ব্লুপ্রিন্ট",
    subtitleEn: "Daily → 1H → 5m/1m Confirmation Sequences",
    subtitleBn: "ডেইলি থেকে ১-ঘণ্টা এবং ৫-মিনিট / ১-মিনিট এন্ট্রি কনফার্মেশন",
    category: "Execution",
    pages: 22,
    keyConcepts: [
      "Step 1: Daily Candle Narrative & Liquidity Draw.",
      "Step 2: 1H Point of Interest (POI) & Zone Refinement.",
      "Step 3: 1m MSS + FVG entry for 5-10 pip stop loss.",
    ],
    fileUrl: null,
    fileName: "05_Multi_Timeframe_Sniper_Execution.pdf",
    fileSize: "2.7 MB",
    isPublished: true,
    position: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// In-memory runtime fallback (strictly initialized with seed data where appropriate)
const inMemoryUsers: Map<string, any> = new Map();
const inMemoryOrders: any[] = [];
const inMemoryEntitlements: any[] = [];
const inMemoryJournal: any[] = [];
const inMemoryDiscipline: any[] = [];
const inMemoryProgress: any[] = [];
const inMemoryTickets: any[] = [];
const inMemoryReplies: any[] = [];
const inMemoryAuditEvents: any[] = [];
const inMemoryFreeEbooks: any[] = [...DEFAULT_FREE_EBOOKS];

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
const inMemoryDisciplineCompletions: any[] = [];
const inMemoryDisciplineExercises: any[] = [];
const inMemoryDisciplineWorkoutCompletions: any[] = [];
const inMemoryDisciplineJournals: any[] = [];
const inMemoryDisciplineForexLogs: any[] = [];
const inMemoryDisciplineSettings: Map<number, any> = new Map();
const inMemoryTraderTrades: any[] = [];

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

export function initInstitutionalSeedData() {
  // Disabled: Leaderboard uses only real registered users with real trading records.
  return;
}

let disciplineTaskAutoId = 1;
let disciplineCompletionAutoId = 1;
let disciplineExerciseAutoId = 1;
let disciplineWorkoutAutoId = 1;
let disciplineJournalAutoId = 1;
let disciplineForexAutoId = 1;
let disciplineSettingsAutoId = 1;

let userAutoId = 1;
let journalAutoId = 1;
let ticketAutoId = 1001;
let replyAutoId = 1;
let orderAutoId = 1;
let entitlementAutoId = 1;
let auditAutoId = 1;
let ebookAutoId = 6;

export async function getDb() {
  const url = process.env.DATABASE_URL;
  const isTemplate = !url || url.includes("[") || url.includes("]") || url.includes("<") || url.includes(">");
  if (!_db && url && !isTemplate) {
    try {
      if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
        _pgPool = new pg.Pool({
          connectionString: url,
          ssl: url.includes("supabase.com") ? { rejectUnauthorized: false } : undefined,
        });
        _db = drizzlePg(_pgPool);
      } else if (url.startsWith("mysql://")) {
        _db = drizzleMysql(url);
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

const inMemorySettings: Map<string, string> = new Map();

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (rows.length) return rows[0].value;
    } catch (err) {
      console.warn("[getSetting error]:", err);
    }
  }
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer.from("settings").select("value").eq("key", key).maybeSingle();
    if (data && !error && data.value !== undefined && data.value !== null) {
      inMemorySettings.set(key, data.value);
      return data.value;
    }
  } catch {}
  return inMemorySettings.get(key) || null;
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  inMemorySettings.set(key, value);
  const db = await getDb();
  if (db) {
    try {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (existing.length) {
        await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value });
      }
    } catch (err) {
      console.warn("[setSetting error]:", err);
    }
  }
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("settings").upsert({ key, value }, { onConflict: "key" });
  } catch (supaErr) {
    console.warn("[setSetting Supabase error]:", supaErr);
  }
  return true;
}

// ------------------------------------------------------------------------------
// PAYMENT GATEWAYS & CHECKOUT CONFIGURATION
// ------------------------------------------------------------------------------

export interface PaymentGatewayDetail {
  number: string;
  accountType: "Personal" | "Merchant" | "Agent";
  isEnabled: boolean;
  instructions?: string;
}

export interface PaymentGatewaysConfig {
  bkash: PaymentGatewayDetail;
  nagad: PaymentGatewayDetail;
  rocket: PaymentGatewayDetail;
  announcement?: string;
  isAnnouncementEnabled?: boolean;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentGatewaysConfig = {
  bkash: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using bKash App or *247#, then copy and enter the Transaction ID (TrxID) below.",
  },
  nagad: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using Nagad App or *167#, then copy and enter the Transaction ID (TrxID) below.",
  },
  rocket: {
    number: "01961079326",
    accountType: "Personal",
    isEnabled: true,
    instructions: "Send Money using Rocket App or *322#, then copy and enter the Transaction ID (TrxID) below.",
  },
  announcement: "Official Payment Numbers Verified. Instant Dashboard Access upon Payment Verification.",
  isAnnouncementEnabled: false,
};

export async function getPaymentGateways(): Promise<PaymentGatewaysConfig> {
  try {
    const raw = await getSetting("payment_gateways_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        bkash: { ...DEFAULT_PAYMENT_CONFIG.bkash, ...(parsed.bkash || {}) },
        nagad: { ...DEFAULT_PAYMENT_CONFIG.nagad, ...(parsed.nagad || {}) },
        rocket: { ...DEFAULT_PAYMENT_CONFIG.rocket, ...(parsed.rocket || {}) },
        announcement: parsed.announcement !== undefined ? parsed.announcement : DEFAULT_PAYMENT_CONFIG.announcement,
        isAnnouncementEnabled: parsed.isAnnouncementEnabled !== undefined ? parsed.isAnnouncementEnabled : DEFAULT_PAYMENT_CONFIG.isAnnouncementEnabled,
      };
    }
    // Also check legacy individual settings if present
    const legacyBkash = await getSetting("bkash");
    const legacyNagad = await getSetting("nagad");
    const legacyRocket = await getSetting("rocket");
    const legacyAnnouncement = await getSetting("announcement");
    if (legacyBkash || legacyNagad || legacyRocket) {
      return {
        bkash: { ...DEFAULT_PAYMENT_CONFIG.bkash, number: legacyBkash || DEFAULT_PAYMENT_CONFIG.bkash.number },
        nagad: { ...DEFAULT_PAYMENT_CONFIG.nagad, number: legacyNagad || DEFAULT_PAYMENT_CONFIG.nagad.number },
        rocket: { ...DEFAULT_PAYMENT_CONFIG.rocket, number: legacyRocket || DEFAULT_PAYMENT_CONFIG.rocket.number },
        announcement: legacyAnnouncement || DEFAULT_PAYMENT_CONFIG.announcement,
        isAnnouncementEnabled: false,
      };
    }
  } catch (err) {
    console.warn("[getPaymentGateways error]:", err);
  }
  return DEFAULT_PAYMENT_CONFIG;
}

export async function updatePaymentGateways(config: Partial<PaymentGatewaysConfig>): Promise<PaymentGatewaysConfig> {
  const current = await getPaymentGateways();
  const updated: PaymentGatewaysConfig = {
    ...current,
    ...config,
    bkash: { ...current.bkash, ...(config.bkash || {}) },
    nagad: { ...current.nagad, ...(config.nagad || {}) },
    rocket: { ...current.rocket, ...(config.rocket || {}) },
  };
  await setSetting("payment_gateways_config", JSON.stringify(updated));
  // Sync legacy individual keys for full backward compatibility
  await setSetting("bkash", updated.bkash.number);
  await setSetting("nagad", updated.nagad.number);
  await setSetting("rocket", updated.rocket.number);
  if (updated.announcement !== undefined) {
    await setSetting("announcement", updated.announcement);
  }
  return updated;
}

export interface TraderProfileData {
  userId: number;
  openId: string;
  name: string;
  avatar: string | null;
  phone?: string | null;
  role?: string;
  language?: "en" | "bn";
  updatedAt?: string;
}

export async function getTraderProfile(openIdOrUserId: string | number): Promise<TraderProfileData | null> {
  try {
    const key = `trader_profile_${openIdOrUserId}`;
    const raw = await getSetting(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[getTraderProfile error]:", err);
  }
  return null;
}

export async function saveTraderProfile(profile: TraderProfileData): Promise<void> {
  try {
    const key = `trader_profile_${profile.openId || profile.userId}`;
    await setSetting(key, JSON.stringify(profile));

    const registryKey = "global_trader_registry";
    const rawRegistry = await getSetting(registryKey);
    let openIds: string[] = [];
    if (rawRegistry) {
      try { openIds = JSON.parse(rawRegistry); } catch {}
    }
    if (profile.openId && !openIds.includes(profile.openId)) {
      openIds.push(profile.openId);
      await setSetting(registryKey, JSON.stringify(openIds));
    }
  } catch (err) {
    console.warn("[saveTraderProfile error]:", err);
  }
}

export async function updateUserProfile(
  userId: number,
  openId: string | undefined,
  updates: { name?: string; phone?: string | null; language?: "en" | "bn"; avatar?: string | null }
): Promise<void> {
  const resolvedOpenId = openId || (userId ? `usr_${userId}` : "");

  if (resolvedOpenId) {
    const existing = inMemoryUsers.get(resolvedOpenId);
    if (existing) {
      if (updates.name) existing.name = updates.name;
      if (updates.phone !== undefined) existing.phone = updates.phone;
      if (updates.language) existing.language = updates.language;
      if (updates.avatar !== undefined) existing.avatar = updates.avatar;
      existing.updatedAt = new Date();
    }
  }
  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.id === userId) {
      if (updates.name) u.name = updates.name;
      if (updates.phone !== undefined) u.phone = updates.phone;
      if (updates.language) u.language = updates.language;
      if (updates.avatar !== undefined) u.avatar = updates.avatar;
      u.updatedAt = new Date();
    }
  }

  const existingProf = resolvedOpenId ? await getTraderProfile(resolvedOpenId) : null;
  const newProfile: TraderProfileData = {
    userId,
    openId: resolvedOpenId,
    name: updates.name || existingProf?.name || "Trader",
    avatar: updates.avatar !== undefined ? updates.avatar : (existingProf?.avatar || null),
    phone: updates.phone !== undefined ? updates.phone : (existingProf?.phone || null),
    language: updates.language || existingProf?.language || "en",
    updatedAt: new Date().toISOString(),
  };
  await saveTraderProfile(newProfile);

  try {
    const { supabaseServer } = await import("./supabase");
    if (resolvedOpenId) {
      const supaUpdate: any = { updatedAt: new Date().toISOString() };
      if (updates.name) supaUpdate.name = updates.name;
      if (updates.phone !== undefined) supaUpdate.phone = updates.phone;
      if (updates.language) supaUpdate.language = updates.language;
      await supabaseServer.from("users").update(supaUpdate).eq("openId", resolvedOpenId);
    }
  } catch (supaErr) {
    console.warn("[updateUserProfile Supabase error]:", supaErr);
  }

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(users)
        .set({
          ...(updates.name ? { name: updates.name } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
          ...(updates.language ? { language: updates.language } : {}),
          ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
          updatedAt: new Date(),
        })
        .where(
          resolvedOpenId
            ? or(eq(users.id, userId), eq(users.openId, resolvedOpenId))
            : eq(users.id, userId)
        );
    } catch (dbErr) {
      console.warn("[updateUserProfile db error]:", dbErr);
    }
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  initInstitutionalSeedData();

  const numericId = user.id || inMemoryUsers.get(user.openId)?.id || deriveNumericIdFromOpenId(user.openId);

  const existingProf = await getTraderProfile(user.openId);
  const resolvedAvatar = user.avatar !== undefined ? user.avatar : (existingProf?.avatar || null);
  const resolvedName = user.name || existingProf?.name || "Trader";

  const userRecord = {
    id: numericId,
    ...user,
    name: resolvedName,
    avatar: resolvedAvatar,
    createdAt: inMemoryUsers.get(user.openId)?.createdAt || new Date(),
    updatedAt: new Date(),
    lastSignedIn: user.lastSignedIn || new Date(),
    role: user.role || (user.openId === ENV.ownerOpenId ? "admin" : "user"),
    language: user.language || "en",
  };

  inMemoryUsers.set(user.openId, userRecord);

  await saveTraderProfile({
    userId: numericId,
    openId: user.openId,
    name: resolvedName,
    avatar: resolvedAvatar,
    phone: user.phone || null,
    role: userRecord.role as string,
    language: userRecord.language as any,
    updatedAt: new Date().toISOString(),
  });

  try {
    const { supabaseServer } = await import("./supabase");
    const { data: supaUser } = await supabaseServer.from("users").upsert({
      openId: user.openId,
      name: resolvedName,
      email: user.email || null,
      phone: user.phone || null,
      role: userRecord.role,
      language: userRecord.language,
      lastSignedIn: new Date().toISOString(),
    }, { onConflict: "openId" }).select("id").maybeSingle();

    if (supaUser?.id) {
      userRecord.id = supaUser.id;
      inMemoryUsers.set(user.openId, userRecord);
    }
  } catch (supaErr) {
    console.warn("[upsertUser Supabase error]:", supaErr);
  }

  const db = await getDb();
  if (db) {
    try {
      const values: InsertUser = {
        openId: user.openId,
        name: resolvedName,
        email: user.email,
        passwordHash: user.passwordHash,
        phone: user.phone,
        loginMethod: user.loginMethod,
        avatar: resolvedAvatar,
        lastSignedIn: user.lastSignedIn ?? new Date(),
        role: userRecord.role as any,
        language: userRecord.language as any,
      };
      const updateSet: Record<string, unknown> = { ...values };
      delete updateSet.openId;
      await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
    } catch (err) {
      console.warn("[Database upsertUser fallback to memory]:", err);
    }
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  initInstitutionalSeedData();

  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (rows && rows[0]) {
        const user = rows[0];
        const prof = await getTraderProfile(openId);
        if (prof?.avatar) (user as any).avatar = prof.avatar;
        inMemoryUsers.set(openId, user);
        return user;
      }
    } catch (err) {
      console.warn("[Database getUserByOpenId fallback to memory]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer.from("users").select("*").eq("openId", openId).maybeSingle();
    if (data && !error) {
      const prof = await getTraderProfile(openId);
      const builtUser: any = {
        id: data.id,
        openId: data.openId,
        name: prof?.name || data.name || "Trader",
        email: data.email || null,
        phone: data.phone || null,
        role: data.role || "user",
        loginMethod: data.loginMethod || "supabase",
        language: data.language || "en",
        avatar: prof?.avatar || null,
        emailVerified: true,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        lastSignedIn: data.lastSignedIn ? new Date(data.lastSignedIn) : new Date(),
      };
      inMemoryUsers.set(openId, builtUser);
      return builtUser;
    }
  } catch (supaErr) {
    console.warn("[getUserByOpenId Supabase fallback]:", supaErr);
  }

  let user = inMemoryUsers.get(openId);
  if (user) {
    if (!user.avatar) {
      const prof = await getTraderProfile(openId);
      if (prof?.avatar) user.avatar = prof.avatar;
    }
    return user;
  }

  return undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  initInstitutionalSeedData();
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      if (rows && rows[0]) {
        const u = rows[0];
        const prof = await getTraderProfile(u.openId);
        if (prof?.avatar) (u as any).avatar = prof.avatar;
        inMemoryUsers.set(u.openId, u);
        return u;
      }
    } catch (err) {
      console.warn("[Database getUserByEmail fallback to memory]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer.from("users").select("*").eq("email", normalizedEmail).maybeSingle();
    if (data && !error) {
      const prof = await getTraderProfile(data.openId);
      const builtUser: any = {
        id: data.id,
        openId: data.openId,
        name: prof?.name || data.name || "Trader",
        email: data.email,
        phone: data.phone || null,
        role: data.role || "user",
        loginMethod: data.loginMethod || "supabase",
        language: data.language || "en",
        avatar: prof?.avatar || null,
        emailVerified: true,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        lastSignedIn: data.lastSignedIn ? new Date(data.lastSignedIn) : new Date(),
      };
      inMemoryUsers.set(data.openId, builtUser);
      return builtUser;
    }
  } catch (supaErr) {
    console.warn("[getUserByEmail Supabase fallback]:", supaErr);
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.email && u.email.toLowerCase() === normalizedEmail) {
      return u;
    }
  }

  return undefined;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role?: "user" | "admin" | "support";
  language?: "en" | "bn";
  emailVerified?: boolean;
  avatar?: string;
}): Promise<User> {
  const openId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const normalizedEmail = data.email.toLowerCase().trim();
  const db = await getDb();

  if (db) {
    try {
      await db.insert(users).values({
        openId,
        name: data.name,
        email: normalizedEmail,
        passwordHash: data.passwordHash,
        phone: data.phone || null,
        avatar: data.avatar || null,
        emailVerified: data.emailVerified ?? false,
        loginMethod: "password",
        role: data.role || "user",
        language: data.language || "en",
        lastSignedIn: new Date(),
      });
      const created = await getUserByOpenId(openId);
      if (created) return created;
    } catch (err) {
      console.warn("[Database createUser fallback to memory]:", err);
    }
  }

  let resolvedId = userAutoId++;

  try {
    const { supabaseServer } = await import("./supabase");
    const { data: supaUser, error: supaErr } = await supabaseServer
      .from("users")
      .upsert(
        {
          openId,
          name: data.name,
          email: normalizedEmail,
          passwordHash: data.passwordHash,
          phone: data.phone || null,
          role: data.role || "user",
          language: data.language || "en",
          loginMethod: "password",
          lastSignedIn: new Date().toISOString(),
        },
        { onConflict: "openId" }
      )
      .select()
      .single();

    if (!supaErr && supaUser?.id) {
      resolvedId = supaUser.id;
    } else if (supaErr) {
      console.warn("[createUser Supabase upsert error]:", supaErr.message);
    }
  } catch (err) {
    console.warn("[createUser Supabase exception]:", err);
  }

  const newUser: any = {
    id: resolvedId,
    openId,
    name: data.name,
    email: normalizedEmail,
    passwordHash: data.passwordHash,
    phone: data.phone || null,
    avatar: data.avatar || null,
    emailVerified: data.emailVerified ?? false,
    loginMethod: "password",
    role: data.role || "user",
    language: data.language || "en",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  inMemoryUsers.set(openId, newUser);
  return newUser;
}

// In-memory verification token storage
const inMemoryTokens: { email: string; otp: string; type: string; expiresAt: Date; isUsed: boolean }[] = [];

export async function createVerificationOtp(email: string, type: "email_verify" | "password_reset"): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  // Generate secure 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  const db = await getDb();
  if (db) {
    try {
      await db.insert(verificationTokens).values({
        email: normalizedEmail,
        otp,
        type,
        expiresAt,
        isUsed: false,
      });
    } catch (err) {
      console.warn("[createVerificationOtp error, fallback to memory]:", err);
    }
  }

  inMemoryTokens.push({
    email: normalizedEmail,
    otp,
    type,
    expiresAt,
    isUsed: false,
  });

  return otp;
}

export async function verifyOtp(email: string, otp: string, type: "email_verify" | "password_reset"): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.email, normalizedEmail),
            eq(verificationTokens.otp, otp.trim()),
            eq(verificationTokens.type, type),
            eq(verificationTokens.isUsed, false)
          )
        )
        .orderBy(desc(verificationTokens.createdAt))
        .limit(1);

      if (rows && rows[0]) {
        const token = rows[0];
        if (new Date(token.expiresAt) > new Date()) {
          await db.update(verificationTokens).set({ isUsed: true }).where(eq(verificationTokens.id, token.id));
          return true;
        }
      }
    } catch (err) {
      console.warn("[verifyOtp DB error, fallback to memory]:", err);
    }
  }

  const found = inMemoryTokens.find(
    (t) =>
      t.email === normalizedEmail &&
      t.otp === otp.trim() &&
      t.type === type &&
      !t.isUsed &&
      new Date(t.expiresAt) > new Date()
  );
  if (found) {
    found.isUsed = true;
    return true;
  }

  return false;
}

export async function markEmailVerified(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      await db.update(users).set({ emailVerified: true }).where(eq(users.email, normalizedEmail));
    } catch (err) {
      console.warn("[markEmailVerified error]:", err);
    }
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.email && u.email.toLowerCase() === normalizedEmail) {
      u.emailVerified = true;
    }
  }
}

export async function updateUserPassword(email: string, passwordHash: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    try {
      await db.update(users).set({ passwordHash }).where(eq(users.email, normalizedEmail));
    } catch (err) {
      console.warn("[updateUserPassword error]:", err);
    }
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.email && u.email.toLowerCase() === normalizedEmail) {
      u.passwordHash = passwordHash;
    }
  }
}


export async function listProducts() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(products).where(eq(products.isPublished, true));
    } catch (err) {
      console.warn("[listProducts error]:", err);
    }
  }
  return [];
}

export async function listBundles() {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(bundles).where(eq(bundles.isPublished, true));
      return rows.map((b: any) =>
        (b.id === 2 || b.slug === "course-ebook") && (b.price === "1999.00" || b.price === "1999" || !b.price)
          ? { ...b, price: "2499" }
          : b
      );
    } catch (err) {
      console.warn("[listBundles error]:", err);
    }
  }
  return [
    { id: 1, slug: "pdf-package", titleEn: "Free eBook Package", titleBn: "Free eBook Package", price: "00", currency: "BDT", includesPdfPackage: true, includesEbook: false, includesCourse: false },
    { id: 2, slug: "course-ebook", titleEn: "CYCLE OF CHART BASIC TO ADVANCE COURSE", titleBn: "CYCLE OF CHART BASIC TO ADVANCE COURSE", price: "2499", currency: "BDT", includesPdfPackage: false, includesEbook: true, includesCourse: true },
    { id: 4, slug: "pro-blueprint", titleEn: "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT", titleBn: "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT", originalPrice: "5550", price: "3999", currency: "BDT", includesPdfPackage: true, includesEbook: true, includesCourse: true },
  ];
}

export async function listContent() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(content).where(eq(content.isPublished, true));
    } catch (err) {
      console.warn("[listContent error]:", err);
    }
  }
  return [];
}

export async function resolveUserCandidateIds(
  input: number | { id?: number; openId?: string; email?: string }
): Promise<number[]> {
  const ids = new Set<number>();
  if (typeof input === "number") {
    if (input > 0) ids.add(input);
  } else if (input && typeof input === "object") {
    if (input.id && input.id > 0) ids.add(input.id);
    try {
      const { supabaseServer } = await import("./supabase");
      const filters: string[] = [];
      if (input.id && input.id > 0) filters.push(`id.eq.${input.id}`);
      if (input.openId) filters.push(`openId.eq.${input.openId}`);
      if (input.email) filters.push(`email.eq.${input.email.toLowerCase().trim()}`);

      if (filters.length > 0) {
        const { data } = await supabaseServer
          .from("users")
          .select("id")
          .or(filters.join(","));
        if (data && Array.isArray(data)) {
          for (const u of data) {
            if (u.id) ids.add(u.id);
          }
        }
      }
    } catch (e) {
      console.warn("[resolveUserCandidateIds error]:", e);
    }
  }
  return Array.from(ids);
}

export async function listOrdersForUser(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  const db = await getDb();
  if (db) {
    try {
      const targetIds = candidateIds.length > 0 ? candidateIds : [primaryId];
      return await db
        .select()
        .from(orders)
        .where(inArray(orders.customerId, targetIds))
        .orderBy(desc(orders.createdAt));
    } catch (err) {
      console.warn("[listOrdersForUser error]:", err);
    }
  }

  // Supabase live database connection
  try {
    const { supabaseServer } = await import("./supabase");
    let query = supabaseServer.from("orders").select("*");
    if (candidateIds.length === 1) {
      query = query.eq("customerId", candidateIds[0]);
    } else if (candidateIds.length > 1) {
      query = query.in("customerId", candidateIds);
    } else {
      query = query.eq("customerId", primaryId);
    }
    const { data, error } = await query.order("createdAt", { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((o) => ({
        ...o,
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        approvedAt: o.approvedAt ? new Date(o.approvedAt) : undefined,
      }));
    }
  } catch (err) {
    console.warn("[listOrdersForUser Supabase fetch error]:", err);
  }

  return inMemoryOrders.filter((o) => candidateIds.includes(o.customerId) || o.customerId === primaryId);
}

export async function listAllOrders() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(orders).orderBy(desc(orders.createdAt));
    } catch (err) {
      console.warn("[listAllOrders error]:", err);
    }
  }

  // Supabase live database connection
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer
      .from("orders")
      .select("*")
      .order("createdAt", { ascending: false });
    if (!error && data) {
      for (const item of data) {
        const idx = inMemoryOrders.findIndex((o) => o.id === item.id);
        const mapped = {
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
        };
        if (idx >= 0) {
          inMemoryOrders[idx] = mapped;
        } else {
          inMemoryOrders.push(mapped);
        }
      }
      return inMemoryOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn("[listAllOrders Supabase fetch error]:", err);
  }

  return inMemoryOrders;
}

export async function resolveSupabaseCustomerId(input: {
  customerId?: number;
  openId?: string;
  email?: string;
  name?: string;
  phone?: string;
}): Promise<number> {
  try {
    const { supabaseServer } = await import("./supabase");

    // 1. If customerId is provided and valid (> 0), verify it exists in Supabase users table
    if (input.customerId && input.customerId > 0) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("id", input.customerId)
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 2. If openId provided, check by openId
    if (input.openId) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("openId", input.openId)
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 3. If email provided, check by email
    if (input.email) {
      try {
        const { data, error } = await supabaseServer
          .from("users")
          .select("id")
          .eq("email", input.email.toLowerCase().trim())
          .maybeSingle();
        if (!error && data?.id) {
          return data.id;
        }
      } catch (e) {}
    }

    // 4. User does not exist in Supabase users table! Create real user record in Supabase now
    try {
      const newOpenId = input.openId || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabaseServer
        .from("users")
        .insert({
          openId: newOpenId,
          name: input.name || "Student",
          email: input.email ? input.email.toLowerCase().trim() : null,
          phone: input.phone || null,
          role: "user",
          language: "en",
          loginMethod: "password",
          lastSignedIn: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!error && data?.id) {
        return data.id;
      }
      if (error) {
        console.warn("[resolveSupabaseCustomerId insert error]:", error.message);
      }
    } catch (err) {
      console.warn("[resolveSupabaseCustomerId insert exception]:", err);
    }

    // 5. Fallback: query any existing user in Supabase users to guarantee foreign key constraint is satisfied
    try {
      const { data } = await supabaseServer.from("users").select("id").limit(1).maybeSingle();
      if (data?.id) return data.id;
    } catch (e) {}
  } catch (err) {
    console.warn("[resolveSupabaseCustomerId exception]:", err);
  }

  return input.customerId || 1;
}

export async function createOrder(orderInput: {
  customerId: number;
  customerOpenId?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  bundleId?: number | null;
  productId?: number | null;
  selectedPdfIds?: number[];
  amount: string;
  currency?: string;
  paymentMethod: string;
  transactionId: string;
  screenshotKey?: string | null;
  noRefundAcknowledged: boolean;
}) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      const res = await db.insert(orders).values({
        customerId: orderInput.customerId,
        bundleId: orderInput.bundleId || null,
        productId: orderInput.productId || null,
        selectedPdfIds: orderInput.selectedPdfIds || [],
        amount: orderInput.amount,
        currency: orderInput.currency || "BDT",
        paymentMethod: orderInput.paymentMethod,
        transactionId: orderInput.transactionId,
        screenshotKey: orderInput.screenshotKey || null,
        noRefundAcknowledged: orderInput.noRefundAcknowledged,
        paymentStatus: "pending",
        orderStatus: "pending",
        createdAt: now,
        updatedAt: now,
      });
      const insertId = res[0]?.insertId || res[0]?.id || orderAutoId++;
      return { id: insertId, ...orderInput, paymentStatus: "pending", orderStatus: "pending", createdAt: now };
    } catch (err) {
      console.warn("[createOrder Drizzle error]:", err);
    }
  }

  // Supabase live database insertion
  try {
    const { supabaseServer } = await import("./supabase");
    const resolvedCustomerId = await resolveSupabaseCustomerId({
      customerId: orderInput.customerId,
      openId: orderInput.customerOpenId,
      email: orderInput.customerEmail,
      name: orderInput.customerName,
      phone: orderInput.customerPhone,
    });

    let validBundleId = orderInput.bundleId || null;
    if (validBundleId) {
      try {
        const { data: bundleExists } = await supabaseServer
          .from("bundles")
          .select("id")
          .eq("id", validBundleId)
          .maybeSingle();
        if (!bundleExists?.id) {
          validBundleId = null;
        }
      } catch (e) {}
    }

    let validProductId = orderInput.productId || null;
    if (validProductId) {
      try {
        const { data: prodExists } = await supabaseServer
          .from("products")
          .select("id")
          .eq("id", validProductId)
          .maybeSingle();
        if (!prodExists?.id) {
          validProductId = null;
        }
      } catch (e) {}
    }

    const payload = {
      customerId: resolvedCustomerId,
      bundleId: validBundleId,
      productId: validProductId,
      selectedPdfIds: orderInput.selectedPdfIds || [],
      amount: orderInput.amount,
      currency: orderInput.currency || "BDT",
      paymentMethod: orderInput.paymentMethod,
      transactionId: orderInput.transactionId,
      screenshotKey: orderInput.screenshotKey || null,
      noRefundAcknowledged: orderInput.noRefundAcknowledged,
      paymentStatus: "pending",
      orderStatus: "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("orders")
      .insert(payload)
      .select();

    if (!error && data && data.length > 0) {
      const inserted = {
        ...data[0],
        createdAt: new Date(data[0].createdAt),
        updatedAt: new Date(data[0].updatedAt),
      };
      inMemoryOrders.unshift(inserted);
      console.log(`[createOrder SUCCESS]: Order #${inserted.id} inserted into Supabase (customerId: ${resolvedCustomerId}, TrxID: ${orderInput.transactionId})`);
      return inserted;
    } else if (error) {
      console.warn("[createOrder Supabase error]:", error.message);
      // If error is any foreign key violation, fallback to first available user and strip bundle/product foreign keys
      if (error.code === "23503") {
        const { data: firstUser } = await supabaseServer.from("users").select("id").limit(1).maybeSingle();
        const retryPayload = {
          ...payload,
          customerId: firstUser?.id || resolvedCustomerId,
          bundleId: null,
          productId: null,
        };
        const retryRes = await supabaseServer.from("orders").insert(retryPayload).select();
        if (retryRes.data && retryRes.data.length > 0) {
          const retryOrder = {
            ...retryRes.data[0],
            createdAt: new Date(retryRes.data[0].createdAt),
            updatedAt: new Date(retryRes.data[0].updatedAt),
          };
          inMemoryOrders.unshift(retryOrder);
          console.log(`[createOrder RETRY SUCCESS]: Order #${retryOrder.id} saved with fallback user #${firstUser?.id || resolvedCustomerId}`);
          return retryOrder;
        }
      }
    }
  } catch (err) {
    console.warn("[createOrder Supabase exception]:", err);
  }

  const fallbackOrder = {
    id: orderAutoId++,
    ...orderInput,
    selectedPdfIds: orderInput.selectedPdfIds || [],
    currency: orderInput.currency || "BDT",
    paymentStatus: "pending" as const,
    orderStatus: "pending" as const,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryOrders.unshift(fallbackOrder);
  return fallbackOrder;
}

export async function approveOrder(orderId: number, approvedBy: number = 1) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      const row = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0];
      if (row) {
        await db.update(orders).set({
          orderStatus: "approved",
          paymentStatus: "approved",
          approvedAt: now,
          approvedBy,
          updatedAt: now,
        }).where(eq(orders.id, orderId));
        await db.insert(entitlements).values({
          userId: row.customerId,
          orderId: row.id,
          productId: row.productId,
          bundleId: row.bundleId,
          scope: row.bundleId ? `bundle:${row.bundleId}` : `product:${row.productId || 1}`,
          grantedAt: now,
        });
        await db.insert(notifications).values({
          userId: row.customerId,
          title: "Access unlocked",
          message: "Your payment was approved and your digital learning access is now available.",
          read: false,
          createdAt: now,
        });
        return { success: true, order: row };
      }
    } catch (err) {
      console.warn("[approveOrder Drizzle error]:", err);
    }
  }

  // Supabase live database update
  try {
    const { supabaseServer } = await import("./supabase");
    const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
    const targetOrder = orderRows?.[0] || inMemoryOrders.find((o) => o.id === orderId);
    if (targetOrder) {
      await supabaseServer
        .from("orders")
        .update({
          orderStatus: "approved",
          paymentStatus: "approved",
          approvedAt: now.toISOString(),
          approvedBy,
          updatedAt: now.toISOString(),
        })
        .eq("id", orderId);

      // Add entitlement in Supabase
      await supabaseServer.from("entitlements").insert({
        userId: targetOrder.customerId,
        orderId: targetOrder.id,
        bundleId: targetOrder.bundleId || null,
        productId: targetOrder.productId || null,
        scope: targetOrder.bundleId ? `bundle:${targetOrder.bundleId}` : `product:${targetOrder.productId || 1}`,
        grantedAt: now.toISOString(),
      });

      // Add notification in Supabase
      await supabaseServer.from("notifications").insert({
        userId: targetOrder.customerId,
        title: "Access unlocked",
        message: "Your payment was approved and your digital learning access is now available.",
        read: false,
        createdAt: now.toISOString(),
      });

      // Record in audit logs
      await addAuditLog({
        actorId: approvedBy,
        action: "order.approved",
        entity: "order",
        entityId: orderId,
        metadata: { customerId: targetOrder.customerId, amount: targetOrder.amount },
      });

      // Update in-memory cache
      const memOrder = inMemoryOrders.find((o) => o.id === orderId);
      if (memOrder) {
        memOrder.orderStatus = "approved";
        memOrder.paymentStatus = "approved";
        memOrder.approvedAt = now;
      }

      return { success: true, order: targetOrder };
    }
  } catch (err) {
    console.warn("[approveOrder Supabase error]:", err);
  }

  // In-memory fallback
  const memOrder = inMemoryOrders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.orderStatus = "approved";
    memOrder.paymentStatus = "approved";
    memOrder.approvedAt = now;
    await grantManualEntitlement(
      memOrder.customerId,
      memOrder.bundleId ? `bundle:${memOrder.bundleId}` : `product:${memOrder.productId || 1}`,
      memOrder.bundleId,
      memOrder.productId
    );
    return { success: true, order: memOrder };
  }
  throw new Error("Order not found");
}

export async function rejectOrder(orderId: number, reason: string, rejectedBy: number = 1) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      await db.update(orders).set({
        orderStatus: "rejected",
        paymentStatus: "rejected",
        rejectionReason: reason,
        updatedAt: now,
      }).where(eq(orders.id, orderId));
      return { success: true };
    } catch (err) {
      console.warn("[rejectOrder Drizzle error]:", err);
    }
  }

  // Supabase live database update
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer
      .from("orders")
      .update({
        orderStatus: "rejected",
        paymentStatus: "rejected",
        rejectionReason: reason,
        updatedAt: now.toISOString(),
      })
      .eq("id", orderId);

    const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
    const targetOrder = orderRows?.[0] || inMemoryOrders.find((o) => o.id === orderId);
    if (targetOrder) {
      await supabaseServer.from("notifications").insert({
        userId: targetOrder.customerId,
        title: "Order verification issue",
        message: `Your payment verification could not be completed: ${reason}. Please contact support.`,
        read: false,
        createdAt: now.toISOString(),
      });

      await addAuditLog({
        actorId: rejectedBy,
        action: "order.rejected",
        entity: "order",
        entityId: orderId,
        metadata: { customerId: targetOrder.customerId, reason },
      });
    }

    const memOrder = inMemoryOrders.find((o) => o.id === orderId);
    if (memOrder) {
      memOrder.orderStatus = "rejected";
      memOrder.paymentStatus = "rejected";
      memOrder.rejectionReason = reason;
    }
    return { success: true };
  } catch (err) {
    console.warn("[rejectOrder Supabase error]:", err);
  }

  const memOrder = inMemoryOrders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.orderStatus = "rejected";
    memOrder.paymentStatus = "rejected";
    memOrder.rejectionReason = reason;
    return { success: true };
  }
  throw new Error("Order not found");
}

export async function deleteOrder(orderId: number, deletedBy: number = 1) {
  const db = await getDb();
  if (db) {
    try {
      try {
        await db.delete(entitlements).where(eq(entitlements.orderId, orderId));
      } catch {}
      await db.delete(orders).where(eq(orders.id, orderId));
    } catch (err) {
      console.warn("[deleteOrder Drizzle error]:", err);
    }
  }

  // Supabase live database deletion
  try {
    const { supabaseServer } = await import("./supabase");
    try {
      await supabaseServer.from("entitlements").delete().eq("orderId", orderId);
    } catch {}

    const { data: orderRows } = await supabaseServer.from("orders").select("*").eq("id", orderId).limit(1);
    const targetOrder = orderRows?.[0] || inMemoryOrders.find((o) => o.id === orderId);

    const { error: delErr } = await supabaseServer.from("orders").delete().eq("id", orderId);
    if (delErr) {
      console.warn("[deleteOrder Supabase delete error]:", delErr);
    }

    if (targetOrder) {
      await addAuditLog({
        actorId: deletedBy,
        action: "order.deleted",
        entity: "order",
        entityId: orderId,
        metadata: { customerId: targetOrder.customerId, amount: targetOrder.amount, transactionId: targetOrder.transactionId },
      });
    }
  } catch (err) {
    console.warn("[deleteOrder Supabase error]:", err);
  }

  // Remove from in-memory fallback array
  const memIdx = inMemoryOrders.findIndex((o) => o.id === orderId);
  if (memIdx !== -1) {
    inMemoryOrders.splice(memIdx, 1);
  }
  const entIdx = inMemoryEntitlements.findIndex((e) => e.orderId === orderId);
  if (entIdx !== -1) {
    inMemoryEntitlements.splice(entIdx, 1);
  }

  return { success: true };
}

export async function listEntitlements(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  const db = await getDb();
  if (db) {
    try {
      const targetIds = candidateIds.length > 0 ? candidateIds : [primaryId];
      return await db
        .select()
        .from(entitlements)
        .where(inArray(entitlements.userId, targetIds))
        .orderBy(desc(entitlements.grantedAt));
    } catch (err) {
      console.warn("[listEntitlements error]:", err);
    }
  }

  try {
    const { supabaseServer } = await import("./supabase");
    let query = supabaseServer.from("entitlements").select("*");
    if (candidateIds.length === 1) {
      query = query.eq("userId", candidateIds[0]);
    } else if (candidateIds.length > 1) {
      query = query.in("userId", candidateIds);
    } else {
      query = query.eq("userId", primaryId);
    }
    const { data, error } = await query.order("grantedAt", { ascending: false });
    if (!error && data) {
      return data.map((e) => ({
        ...e,
        grantedAt: e.grantedAt ? new Date(e.grantedAt) : new Date(),
      }));
    }
  } catch (err) {
    console.warn("[listEntitlements Supabase error]:", err);
  }

  return inMemoryEntitlements.filter((e) => candidateIds.includes(e.userId) || e.userId === primaryId);
}

export async function listNotifications(
  userIdentifier: number | { id?: number; openId?: string; email?: string }
) {
  const candidateIds = await resolveUserCandidateIds(userIdentifier);
  const primaryId = typeof userIdentifier === "number" ? userIdentifier : (userIdentifier?.id || candidateIds[0] || 1);

  const db = await getDb();
  if (db) {
    try {
      const targetIds = candidateIds.length > 0 ? candidateIds : [primaryId];
      return await db
        .select()
        .from(notifications)
        .where(inArray(notifications.userId, targetIds))
        .orderBy(desc(notifications.createdAt));
    } catch (err) {
      console.warn("[listNotifications error]:", err);
    }
  }
  return [
    {
      id: 1,
      userId: primaryId,
      title: "Welcome to Cycle of Chart",
      message: "Begin your journey with Stage 01 of the 12-Stage Institutional Roadmap.",
      read: false,
      createdAt: new Date(),
    },
  ];
}

export async function createJournalEntry(
  userId: number,
  entry: { title: string; content: string; setup?: string; result?: string }
) {
  const db = await getDb();
  if (db) {
    try {
      const res = await db.insert(journalEntries).values({
        userId,
        ...entry,
      });
      return res;
    } catch (err) {
      console.warn("[createJournalEntry db error]:", err);
    }
  }

  // Supabase direct persistence
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer.from("journalEntries").insert({
      userId,
      title: entry.title,
      content: entry.content,
      setup: entry.setup || null,
      result: entry.result || null,
    }).select();
    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (err) {
    console.warn("[createJournalEntry Supabase error]:", err);
  }

  // Persistent settings fallback
  try {
    const key = `user_journals_${userId}`;
    const raw = await getSetting(key);
    const existing = raw ? JSON.parse(raw) : [];
    const newEntry = {
      id: Date.now(),
      userId,
      ...entry,
      createdAt: new Date().toISOString(),
    };
    existing.unshift(newEntry);
    await setSetting(key, JSON.stringify(existing));
    return newEntry;
  } catch (err) {
    console.warn("[createJournalEntry settings fallback error]:", err);
  }

  const inMem = {
    id: journalAutoId++,
    userId,
    ...entry,
    createdAt: new Date(),
  };
  inMemoryJournal.unshift(inMem);
  return inMem;
}

export async function listJournal(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt));
    } catch (err) {
      console.warn("[listJournal error]:", err);
    }
  }

  // Supabase direct persistence
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer
      .from("journalEntries")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("[listJournal Supabase error]:", err);
  }

  // Persistent settings fallback
  try {
    const key = `user_journals_${userId}`;
    const raw = await getSetting(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return inMemoryJournal.filter((j) => j.userId === userId);
}

export async function deleteJournal(id: number, userId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
      return true;
    } catch (err) {
      console.warn("[deleteJournal error]:", err);
    }
  }

  // Supabase direct persistence
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("journalEntries").delete().eq("id", id).eq("userId", userId);
  } catch (err) {
    console.warn("[deleteJournal Supabase error]:", err);
  }

  // Persistent settings fallback
  try {
    const key = `user_journals_${userId}`;
    const raw = await getSetting(key);
    if (raw) {
      const existing = JSON.parse(raw);
      const filtered = existing.filter((e: any) => e.id !== id);
      await setSetting(key, JSON.stringify(filtered));
    }
  } catch {}

  const idx = inMemoryJournal.findIndex((j) => j.id === id && j.userId === userId);
  if (idx !== -1) inMemoryJournal.splice(idx, 1);
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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

export interface TicketFilter {
  userId?: number;
  userEmail?: string;
  status?: string;
  category?: string;
  search?: string;
}

export async function listTickets(filterOrUserId?: number | TicketFilter) {
  const filter: TicketFilter =
    typeof filterOrUserId === "number" ? { userId: filterOrUserId } : filterOrUserId || {};

  const db = await getDb();
  if (db) {
    try {
      let query = db.select().from(supportTickets);
      const conditions: any[] = [];
      if (filter.userId !== undefined && filter.userId !== null) {
        conditions.push(eq(supportTickets.userId, filter.userId));
      }
      if (filter.userEmail) {
        conditions.push(eq(supportTickets.userEmail, filter.userEmail));
      }
      if (filter.status && filter.status !== "all") {
        conditions.push(eq(supportTickets.status, filter.status as any));
      }
      if (filter.category && filter.category !== "all") {
        conditions.push(eq(supportTickets.category, filter.category));
      }
      const records =
        conditions.length > 0
          ? await query.where(and(...conditions)).orderBy(desc(supportTickets.createdAt))
          : await query.orderBy(desc(supportTickets.createdAt));

      if (filter.search) {
        const q = filter.search.toLowerCase();
        return records.filter(
          (t: any) =>
            t.ticketCode?.toLowerCase().includes(q) ||
            t.subject?.toLowerCase().includes(q) ||
            t.userName?.toLowerCase().includes(q) ||
            t.userEmail?.toLowerCase().includes(q) ||
            t.message?.toLowerCase().includes(q)
        );
      }
      return records;
    } catch (err) {
      console.warn("[listTickets error]:", err);
    }
  }

  // Supabase live query
  try {
    const { supabaseServer } = await import("./supabase");
    let query = supabaseServer
      .from("supportTickets")
      .select("*")
      .order("createdAt", { ascending: false });

    if (filter.userId !== undefined && filter.userId !== null) {
      query = query.eq("userId", filter.userId);
    }
    if (filter.status && filter.status !== "all") {
      query = query.eq("status", filter.status);
    }
    if (filter.category && filter.category !== "all") {
      query = query.eq("category", filter.category);
    }
    const { data, error } = await query;
    if (!error && data) {
      let results = data.map((t) => ({
        ...t,
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
      }));
      if (filter.userEmail) {
        results = results.filter((t) => t.userEmail?.toLowerCase() === filter.userEmail?.toLowerCase());
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        results = results.filter(
          (t) =>
            t.ticketCode?.toLowerCase().includes(q) ||
            t.subject?.toLowerCase().includes(q) ||
            t.userName?.toLowerCase().includes(q) ||
            t.userEmail?.toLowerCase().includes(q) ||
            t.message?.toLowerCase().includes(q)
        );
      }
      // Update in-memory cache with Supabase items
      for (const t of results) {
        const idx = inMemoryTickets.findIndex((item) => item.id === t.id);
        if (idx >= 0) {
          inMemoryTickets[idx] = t;
        } else {
          inMemoryTickets.push(t);
        }
      }
      return results;
    }
  } catch (err) {
    console.warn("[listTickets Supabase error]:", err);
  }

  // In-memory fallback
  let results = [...inMemoryTickets];
  if (filter.userId !== undefined && filter.userId !== null) {
    results = results.filter((t) => t.userId === filter.userId);
  }
  if (filter.userEmail) {
    results = results.filter((t) => t.userEmail?.toLowerCase() === filter.userEmail?.toLowerCase());
  }
  if (filter.status && filter.status !== "all") {
    results = results.filter((t) => t.status === filter.status);
  }
  if (filter.category && filter.category !== "all") {
    results = results.filter((t) => t.category === filter.category);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.ticketCode?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.userName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.message?.toLowerCase().includes(q)
    );
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createSupportTicket(input: {
  userId?: number | null;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  message: string;
  attachmentUrl?: string | null;
}) {
  const code = `#TKT-${ticketAutoId++}`;
  const now = new Date();
  const db = await getDb();

  const ticketObj = {
    ticketCode: code,
    userId: input.userId || null,
    userName: input.userName,
    userEmail: input.userEmail,
    category: input.category,
    subject: input.subject,
    message: input.message,
    attachmentUrl: input.attachmentUrl || null,
    status: "open" as const,
    assignedStaff: null,
    createdAt: now,
    updatedAt: now,
  };

  if (db) {
    try {
      const res = await db.insert(supportTickets).values(ticketObj);
      const insertId = res[0]?.insertId || res[0]?.id;
      return { id: insertId || ticketAutoId - 1, ...ticketObj };
    } catch (err) {
      console.warn("[createSupportTicket fallback to memory]:", err);
    }
  }

  // Supabase live database insertion
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer
      .from("supportTickets")
      .insert({
        ticketCode: ticketObj.ticketCode,
        userId: ticketObj.userId,
        userName: ticketObj.userName,
        userEmail: ticketObj.userEmail,
        category: ticketObj.category,
        subject: ticketObj.subject,
        message: ticketObj.message,
        attachmentUrl: ticketObj.attachmentUrl,
        status: "open",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .select();

    if (!error && data && data.length > 0) {
      const created = {
        ...data[0],
        createdAt: new Date(data[0].createdAt),
        updatedAt: new Date(data[0].updatedAt),
      };
      inMemoryTickets.unshift(created);
      return created;
    } else if (error) {
      console.warn("[createSupportTicket Supabase error]:", error.message);
    }
  } catch (err) {
    console.warn("[createSupportTicket Supabase exception]:", err);
  }

  const inMemItem = { id: ticketAutoId - 1, ...ticketObj };
  inMemoryTickets.unshift(inMemItem);
  return inMemItem;
}

export async function getTicketById(ticketId: number) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1);
      if (rows[0]) return rows[0];
    } catch (err) {
      console.warn("[getTicketById error]:", err);
    }
  }

  // Supabase fetch
  try {
    const { supabaseServer } = await import("./supabase");
    const { data, error } = await supabaseServer
      .from("supportTickets")
      .select("*")
      .eq("id", ticketId)
      .limit(1);
    if (!error && data && data.length > 0) {
      return {
        ...data[0],
        createdAt: new Date(data[0].createdAt),
        updatedAt: new Date(data[0].updatedAt),
      };
    }
  } catch (err) {
    console.warn("[getTicketById Supabase error]:", err);
  }

  return inMemoryTickets.find((t) => t.id === ticketId) || null;
}

export async function getTicketByCode(ticketCode: string) {
  const cleanCode = ticketCode.trim().toUpperCase();
  const formattedCode = cleanCode.startsWith("#") ? cleanCode : `#${cleanCode}`;

  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(supportTickets)
        .where(
          or(
            eq(supportTickets.ticketCode, formattedCode),
            eq(supportTickets.ticketCode, cleanCode)
          )
        )
        .limit(1);
      if (rows[0]) return rows[0];
    } catch (err) {
      console.warn("[getTicketByCode error]:", err);
    }
  }
  return (
    inMemoryTickets.find(
      (t) =>
        t.ticketCode?.toUpperCase() === formattedCode ||
        t.ticketCode?.toUpperCase() === cleanCode
    ) || null
  );
}

export async function getTicketReplies(ticketId: number) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(ticketReplies)
        .where(eq(ticketReplies.ticketId, ticketId))
        .orderBy(asc(ticketReplies.createdAt));
    } catch (err) {
      console.warn("[getTicketReplies error]:", err);
    }
  }
  return inMemoryReplies
    .filter((r) => r.ticketId === ticketId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function addTicketReply(reply: {
  ticketId: number;
  senderRole: "user" | "support" | "admin";
  senderName: string;
  senderEmail?: string | null;
  message: string;
  attachmentUrl?: string | null;
}) {
  const now = new Date();
  const db = await getDb();
  const replyObj = {
    ticketId: reply.ticketId,
    senderRole: reply.senderRole,
    senderName: reply.senderName,
    senderEmail: reply.senderEmail || null,
    message: reply.message,
    attachmentUrl: reply.attachmentUrl || null,
    createdAt: now,
  };

  if (db) {
    try {
      const res = await db.insert(ticketReplies).values(replyObj);
      await db.update(supportTickets).set({ updatedAt: now }).where(eq(supportTickets.id, reply.ticketId));
      const insertId = res[0]?.insertId || res[0]?.id;
      return { id: insertId || replyAutoId++, ...replyObj };
    } catch (err) {
      console.warn("[addTicketReply error]:", err);
    }
  }

  const createdReply = { id: replyAutoId++, ...replyObj };
  inMemoryReplies.push(createdReply);
  const t = inMemoryTickets.find((item) => item.id === reply.ticketId);
  if (t) t.updatedAt = now;
  return createdReply;
}

export async function listAllUsers() {
  initInstitutionalSeedData();

  // 1. Sync any users from Supabase users table
  try {
    const { supabaseServer } = await import("./supabase");
    const { data: supaUsers } = await supabaseServer.from("users").select("*");
    if (supaUsers && supaUsers.length > 0) {
      for (const su of supaUsers) {
        if (su.openId) {
          const prof = await getTraderProfile(su.openId);
          const existing = inMemoryUsers.get(su.openId);
          if (existing) {
            if (prof?.name) existing.name = prof.name;
            if (prof?.avatar !== undefined) existing.avatar = prof.avatar;
          } else {
            inMemoryUsers.set(su.openId, {
              id: su.id || deriveNumericIdFromOpenId(su.openId),
              openId: su.openId,
              name: prof?.name || su.name || "Trader",
              email: su.email || null,
              phone: su.phone || null,
              avatar: prof?.avatar || null,
              role: su.role || "user",
              language: su.language || "en",
              loginMethod: "supabase",
              createdAt: su.createdAt ? new Date(su.createdAt) : new Date(),
              updatedAt: su.updatedAt ? new Date(su.updatedAt) : new Date(),
              lastSignedIn: su.lastSignedIn ? new Date(su.lastSignedIn) : new Date(),
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("[listAllUsers Supabase notice]:", err);
  }

  // 2. Sync any additional registered users from persistent settings
  try {
    const rawReg = await getSetting("global_trader_registry");
    if (rawReg) {
      const regOpenIds: string[] = JSON.parse(rawReg);
      for (const oid of regOpenIds) {
        if (oid) {
          const prof = await getTraderProfile(oid);
          if (prof) {
            const existing = inMemoryUsers.get(oid);
            if (existing) {
              if (prof.name) existing.name = prof.name;
              if (prof.avatar !== undefined) existing.avatar = prof.avatar;
            } else {
              inMemoryUsers.set(oid, {
                id: prof.userId || deriveNumericIdFromOpenId(oid),
                openId: oid,
                name: prof.name || "Trader",
                email: null,
                phone: prof.phone || null,
                avatar: prof.avatar || null,
                role: prof.role || "user",
                language: prof.language || "en",
                loginMethod: "supabase",
                createdAt: new Date(),
                updatedAt: new Date(),
                lastSignedIn: new Date(),
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[listAllUsers registry notice]:", err);
  }

  // 3. If drizzle db is connected, merge
  const db = await getDb();
  if (db) {
    try {
      const dbUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      for (const du of dbUsers) {
        if (du.openId && !inMemoryUsers.has(du.openId)) {
          inMemoryUsers.set(du.openId, du);
        }
      }
    } catch (err) {
      console.warn("[listAllUsers error]:", err);
    }
  }

  return Array.from(inMemoryUsers.values());
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "support") {
  const db = await getDb();
  if (db) {
    try {
      await db.update(users).set({ role }).where(eq(users.id, userId));
    } catch (err) {
      console.warn("[updateUserRole error]:", err);
    }
  }

  // Supabase update
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer
      .from("users")
      .update({ role, updatedAt: new Date().toISOString() })
      .eq("id", userId);
  } catch (err) {
    console.warn("[updateUserRole Supabase error]:", err);
  }

  for (const u of Array.from(inMemoryUsers.values())) {
    if (u.id === userId) {
      u.role = role;
    }
  }
  return true;
}

export async function grantManualEntitlement(userId: number, scope: string, bundleId?: number, productId?: number) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      await db.insert(entitlements).values({
        userId,
        orderId: 0,
        bundleId: bundleId || null,
        productId: productId || null,
        scope,
        grantedAt: now,
      });
    } catch (err) {
      console.warn("[grantManualEntitlement error]:", err);
    }
  }

  // Supabase insert
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("entitlements").insert({
      userId,
      orderId: 0,
      bundleId: bundleId || null,
      productId: productId || null,
      scope,
      grantedAt: now.toISOString(),
    });
  } catch (err) {
    console.warn("[grantManualEntitlement Supabase error]:", err);
  }

  inMemoryEntitlements.push({
    id: entitlementAutoId++,
    userId,
    orderId: 0,
    bundleId: bundleId || null,
    productId: productId || null,
    scope,
    grantedAt: now,
  });
  return true;
}

export async function revokeEntitlement(entitlementId: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(entitlements).where(eq(entitlements.id, entitlementId));
    } catch (err) {
      console.warn("[revokeEntitlement error]:", err);
    }
  }

  // Supabase delete
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer.from("entitlements").delete().eq("id", entitlementId);
  } catch (err) {
    console.warn("[revokeEntitlement Supabase error]:", err);
  }

  const idx = inMemoryEntitlements.findIndex((e) => e.id === entitlementId);
  if (idx !== -1) inMemoryEntitlements.splice(idx, 1);
  return true;
}

export async function updateTicketStatus(
  ticketId: number,
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed" | string,
  assignedStaff?: string
) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      const updateData: any = { status, updatedAt: now };
      if (assignedStaff !== undefined) updateData.assignedStaff = assignedStaff;
      await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, ticketId));
    } catch (err) {
      console.warn("[updateTicketStatus error]:", err);
    }
  }

  // Supabase update
  try {
    const { supabaseServer } = await import("./supabase");
    await supabaseServer
      .from("supportTickets")
      .update({
        status,
        assignedStaff: assignedStaff || null,
        updatedAt: now.toISOString(),
      })
      .eq("id", ticketId);
  } catch (err) {
    console.warn("[updateTicketStatus Supabase error]:", err);
  }

  const t = inMemoryTickets.find((item) => item.id === ticketId);
  if (t) {
    t.status = status as any;
    t.updatedAt = now;
    if (assignedStaff !== undefined) t.assignedStaff = assignedStaff;
  }
  return true;
}

export async function addAuditLog(event: {
  actorId: number;
  action: string;
  entity: string;
  entityId?: number | null;
  metadata?: any;
}) {
  const now = new Date();
  const entry = {
    id: auditAutoId++,
    ...event,
    entityId: event.entityId || null,
    metadata: event.metadata || {},
    createdAt: now,
  };
  inMemoryAuditEvents.unshift(entry);
  if (inMemoryAuditEvents.length > 200) inMemoryAuditEvents.pop();

  try {
    await setSetting("system_audit_logs", JSON.stringify(inMemoryAuditEvents.slice(0, 100)));
  } catch {}
  return entry;
}

export async function listAuditLogs() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(50);
    } catch (err) {
      console.warn("[listAuditLogs error]:", err);
    }
  }

  // Supabase settings persistent storage
  try {
    const raw = await getSetting("system_audit_logs");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        }));
      }
    }
  } catch {}

  return inMemoryAuditEvents;
}

export async function listFreeEbooks(includeUnpublished = false) {
  const db = await getDb();
  if (db) {
    try {
      const query = includeUnpublished
        ? db.select().from(freeEbooks).orderBy(asc(freeEbooks.position))
        : db.select().from(freeEbooks).where(eq(freeEbooks.isPublished, true)).orderBy(asc(freeEbooks.position));
      const rows = await query;
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("[listFreeEbooks error, using fallback]:", err);
    }
  }

  // Supabase live database sync
  try {
    let query = supabaseServer.from("freeEbooks").select("*").order("position", { ascending: true });
    if (!includeUnpublished) {
      query = query.eq("isPublished", true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((b: any) => ({
        ...b,
        createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
        updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      }));
    }
  } catch (err) {
    console.warn("[listFreeEbooks Supabase error]:", err);
  }

  return includeUnpublished
    ? [...inMemoryFreeEbooks]
    : inMemoryFreeEbooks.filter((b) => b.isPublished);
}

export async function getFreeEbookById(id: number) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(freeEbooks).where(eq(freeEbooks.id, id)).limit(1);
      if (rows && rows[0]) return rows[0];
    } catch (err) {
      console.warn("[getFreeEbookById error]:", err);
    }
  }

  try {
    const { data, error } = await supabaseServer.from("freeEbooks").select("*").eq("id", id).maybeSingle();
    if (!error && data) {
      return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      };
    }
  } catch (err) {}

  return inMemoryFreeEbooks.find((b) => b.id === id) || null;
}

export async function createFreeEbook(data: {
  titleEn: string;
  titleBn?: string;
  subtitleEn: string;
  subtitleBn?: string;
  category: string;
  pages?: number;
  keyConcepts?: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  isPublished?: boolean;
}) {
  const newId = ebookAutoId++;
  const record: any = {
    id: newId,
    titleEn: data.titleEn,
    titleBn: data.titleBn || data.titleEn,
    subtitleEn: data.subtitleEn,
    subtitleBn: data.subtitleBn || data.subtitleEn,
    category: data.category || "Institutional",
    pages: data.pages || 10,
    keyConcepts: data.keyConcepts || [],
    fileUrl: data.fileUrl || null,
    fileName: data.fileName || `${data.titleEn.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
    fileSize: data.fileSize || "2.5 MB",
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
    position: inMemoryFreeEbooks.length + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const db = await getDb();
  if (db) {
    try {
      await db.insert(freeEbooks).values({
        ...record,
      });
    } catch (err) {
      console.warn("[createFreeEbook db error, stored in memory]:", err);
    }
  }

  try {
    await supabaseServer.from("freeEbooks").insert({
      titleEn: record.titleEn,
      titleBn: record.titleBn,
      subtitleEn: record.subtitleEn,
      subtitleBn: record.subtitleBn,
      category: record.category,
      pages: record.pages,
      keyConcepts: record.keyConcepts,
      fileUrl: record.fileUrl,
      fileName: record.fileName,
      fileSize: record.fileSize,
      isPublished: record.isPublished,
      position: record.position,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    });
  } catch (supaErr) {
    console.warn("[createFreeEbook Supabase error]:", supaErr);
  }

  inMemoryFreeEbooks.push(record);
  return record;
}

export async function updateFreeEbook(id: number, data: Partial<any>) {
  const now = new Date();
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(freeEbooks)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(freeEbooks.id, id));
    } catch (err) {
      console.warn("[updateFreeEbook db error]:", err);
    }
  }

  try {
    await supabaseServer
      .from("freeEbooks")
      .update({
        ...data,
        updatedAt: now.toISOString(),
      })
      .eq("id", id);
  } catch (supaErr) {
    console.warn("[updateFreeEbook Supabase error]:", supaErr);
  }

  const item = inMemoryFreeEbooks.find((b) => b.id === id);
  if (item) {
    Object.assign(item, data, { updatedAt: now });
    return item;
  }
  return null;
}

export async function deleteFreeEbook(id: number) {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(freeEbooks).where(eq(freeEbooks.id, id));
    } catch (err) {
      console.warn("[deleteFreeEbook db error]:", err);
    }
  }

  try {
    await supabaseServer.from("freeEbooks").delete().eq("id", id);
  } catch (supaErr) {
    console.warn("[deleteFreeEbook Supabase error]:", supaErr);
  }

  const idx = inMemoryFreeEbooks.findIndex((b) => b.id === id);
  if (idx !== -1) {
    inMemoryFreeEbooks.splice(idx, 1);
    return true;
  }
  return true;
}

// ==============================================================================
// COMPLETE DAILY DISCIPLINE SYSTEM — BACKEND HELPER FUNCTIONS
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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
    const { supabaseServer } = await import("./supabase");
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

  const instStudent = DEFAULT_INSTITUTIONAL_STUDENTS.find((s) => s.id === userId);
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

// ------------------------------------------------------------------------------
// OWNER PROFILE & GENERAL SETTINGS CMS
// ------------------------------------------------------------------------------

export interface OwnerProfile {
  isVisible?: boolean;
  name: string;
  role: string;
  roleBn?: string;
  bioEn: string;
  bioBn?: string;
  photoUrl: string;
  detailsEn?: string;
  detailsBn?: string;
  experienceYears?: string;
  studentsCount?: string;
  tradingStyle?: string;
  signatureQuoteEn?: string;
  signatureQuoteBn?: string;
  telegram?: string;
  youtube?: string;
  facebook?: string;
  twitter?: string;
  email?: string;
  showExperienceCard?: boolean;
  experienceLabel?: string;
  experienceIcon?: string;
  showMentoredCard?: boolean;
  mentoredLabel?: string;
  mentoredIcon?: string;
  showMethodologyCard?: boolean;
  methodologyLabel?: string;
  methodologyIcon?: string;
  showDetailsParagraph?: boolean;
}

export const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  isVisible: true,
  name: "Al-Amin Islam",
  role: "Founder & Lead Institutional Analyst",
  roleBn: "প্রতিষ্ঠাতা ও লিড ইন্সটিটিউশনাল অ্যানালিস্ট",
  bioEn: "Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution.",
  bioBn: "ইন্সটিটিউশনাল প্রাইস ডেলিভারি, মার্কেট স্ট্রাকচার, লিকুইডিটি ডায়নামিক্স এবং প্রাইস অ্যাকশন স্পেশালিস্ট। আবেগতাড়িত অনুমান দূর করে স্ট্রাকচার্ড আন্ডারস্ট্যান্ডিং, সিস্টেমেটিক অ্যানালাইসিস এবং সুশৃঙ্খল এক্সিকিউশন তৈরিতে প্রতিশ্রুতিবদ্ধ।",
  photoUrl: "/logo.jpg",
  detailsEn: "Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management.",
  detailsBn: "",
  experienceYears: "6+ Years",
  studentsCount: "1,500+",
  tradingStyle: "Institutional Order Flow, Liquidity & (SMC)",
  signatureQuoteEn: "Before you trade, understand trading. Before you deposit, understand trading.",
  signatureQuoteBn: "ট্রেড করার আগে ট্রেডিং বুঝুন। ডিপোজিট করার আগে ট্রেডিং বুঝুন।",
  telegram: "https://t.me/cycleofchart",
  youtube: "https://youtube.com/@cycleofchart",
  facebook: "https://facebook.com/cycleofchart",
  twitter: "",
  email: "contact@cycleofchart.com",
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
};

export async function getOwnerProfile(): Promise<OwnerProfile> {
  try {
    const raw = await getSetting("owner_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure boolean flags default cleanly to current live state if not explicitly saved yet
      if (parsed.isVisible === undefined) parsed.isVisible = true;
      if (parsed.showExperienceCard === undefined) parsed.showExperienceCard = false;
      if (parsed.showMentoredCard === undefined) parsed.showMentoredCard = false;
      if (parsed.showMethodologyCard === undefined) parsed.showMethodologyCard = true;
      if (parsed.showDetailsParagraph === undefined) parsed.showDetailsParagraph = false;
      if (!parsed.experienceYears) parsed.experienceYears = "6+ Years";
      if (!parsed.studentsCount) parsed.studentsCount = "1,500+";
      if (!parsed.experienceLabel) parsed.experienceLabel = "Market Experience";
      if (!parsed.mentoredLabel) parsed.mentoredLabel = "Traders Mentored";
      if (!parsed.methodologyLabel) parsed.methodologyLabel = "Core Methodology";
      if (!parsed.experienceIcon) parsed.experienceIcon = "clock";
      if (!parsed.mentoredIcon) parsed.mentoredIcon = "users";
      if (!parsed.methodologyIcon) parsed.methodologyIcon = "award";
      if (!parsed.detailsEn) {
        parsed.detailsEn = "Over 6+ years of specialized market experience researching interbank price delivery algorithms, session manipulation cycles, and institutional risk management.";
      }
      return { ...DEFAULT_OWNER_PROFILE, ...parsed };
    }
  } catch (err) {
    console.warn("[getOwnerProfile error]:", err);
  }
  return DEFAULT_OWNER_PROFILE;
}

export async function updateOwnerProfile(data: Partial<OwnerProfile>): Promise<OwnerProfile> {
  const current = await getOwnerProfile();
  const updated: OwnerProfile = {
    ...current,
    ...data,
  };
  await setSetting("owner_profile", JSON.stringify(updated));
  return updated;
}

// ==============================================================================
// TRADER TRADES & LEADERBOARD SYSTEM
// ==============================================================================

export interface LeaderboardTrader {
  rank: number;
  userId: number;
  openId: string;
  name: string;
  avatar: string | null;
  role: string;
  startingBalance: number;
  currentBalance: number;
  gainPercent: number; // ((currentBalance - startingBalance) / startingBalance) * 100
  currency: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number; // 0-100%
  totalPnl: number;
  profitFactor: number;
  ruleComplianceRate: number; // 0-100% (Risk management performance)
  disciplineScore: number; // 0-100% (Daily discipline adherence)
  consistencyScore: number; // 0-100%
  currentStreak: number; // Days
  activeDays: number;
  overallScore: number; // 0-100 deterministic composite score
  bestPair: string;
}

export interface UserJournalConfig {
  startingBalance: number;
  currency: string;
  bookName?: string;
  updatedAt?: string;
}

const inMemoryJournalConfigs: Map<number, UserJournalConfig> = new Map();

export async function getUserJournalConfig(userId: number): Promise<UserJournalConfig> {
  if (inMemoryJournalConfigs.has(userId)) {
    return inMemoryJournalConfigs.get(userId)!;
  }
  try {
    const raw = await getSetting(`user_journal_config_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.startingBalance === "number") {
        inMemoryJournalConfigs.set(userId, parsed);
        return parsed;
      }
    }
  } catch {}
  return { startingBalance: 10000, currency: "$" };
}

export async function setUserJournalConfig(userId: number, config: UserJournalConfig): Promise<void> {
  inMemoryJournalConfigs.set(userId, config);
  try {
    await setSetting(`user_journal_config_${userId}`, JSON.stringify(config));
  } catch {}
}

export async function syncUserTrades(
  userId: number,
  trades: any[],
  startingBalance?: number,
  currency?: string,
  bookName?: string
): Promise<boolean> {
  if (typeof startingBalance === "number" && startingBalance > 0) {
    await setUserJournalConfig(userId, {
      startingBalance,
      currency: currency || "$",
      bookName: bookName || "Trading Journal",
      updatedAt: new Date().toISOString(),
    });
  }

  const db = await getDb();
  if (db) {
    try {
      for (const t of trades) {
        if (!t || !t.id) continue;
        const row = {
          id: String(t.id),
          userId,
          journalBookId: String(t.journalBookId || "default"),
          tradeNumber: Number(t.tradeNumber) || 1,
          date: String(t.date || new Date().toISOString().slice(0, 10)),
          entryTime: t.entryTime ? String(t.entryTime) : null,
          pair: String(t.pair || "EURUSD").toUpperCase(),
          timeframe: String(t.timeframe || "15M"),
          direction: String(t.direction || "Buy"),
          entryPrice: Number(t.entryPrice) || 0,
          stopLoss: Number(t.stopLoss) || 0,
          takeProfit: Number(t.takeProfit) || 0,
          exitPrice: Number(t.exitPrice) || 0,
          followedRules: t.followedRules === "No" ? "No" : "Yes",
          pnl: Number(t.pnl) || 0,
          riskReward: String(t.riskReward || "1:2"),
          pips: Number(t.pips) || 0,
          lotSize: Number(t.lotSize) || 1,
          tradeRun: t.tradeRun ? String(t.tradeRun) : null,
          note: t.note ? String(t.note) : null,
          tradeRank: String(t.tradeRank || "A"),
          learning: t.learning ? String(t.learning) : null,
          customProperties: t.customProperties || null,
          updatedAt: new Date(),
        };

        const existing = await db.select().from(traderTrades).where(eq(traderTrades.id, row.id)).limit(1);
        if (existing.length) {
          await db.update(traderTrades).set(row).where(eq(traderTrades.id, row.id));
        } else {
          await db.insert(traderTrades).values(row);
        }
      }
    } catch (err) {
      console.warn("[syncUserTrades db error]:", err);
    }
  }

  // Update in-memory fallback
  for (const t of trades) {
    if (!t || !t.id) continue;
    const item = {
      ...t,
      userId,
      entryPrice: Number(t.entryPrice) || 0,
      stopLoss: Number(t.stopLoss) || 0,
      takeProfit: Number(t.takeProfit) || 0,
      exitPrice: Number(t.exitPrice) || 0,
      pnl: Number(t.pnl) || 0,
      followedRules: t.followedRules === "No" ? "No" : "Yes",
      updatedAt: new Date(),
    };
    const idx = inMemoryTraderTrades.findIndex((i) => i.id === t.id);
    if (idx !== -1) {
      inMemoryTraderTrades[idx] = item;
    } else {
      inMemoryTraderTrades.push(item);
    }
  }

  // Direct Supabase table upsert for traderTrades
  try {
    const supaRows = trades.map((t) => ({
      id: String(t.id),
      userId,
      journalBookId: String(t.journalBookId || "default"),
      tradeNumber: Number(t.tradeNumber) || 1,
      date: String(t.date || new Date().toISOString().slice(0, 10)),
      entryTime: t.entryTime ? String(t.entryTime) : null,
      pair: String(t.pair || "EURUSD").toUpperCase(),
      timeframe: String(t.timeframe || "15M"),
      direction: String(t.direction || "Buy"),
      entryPrice: Number(t.entryPrice) || 0,
      stopLoss: Number(t.stopLoss) || 0,
      takeProfit: Number(t.takeProfit) || 0,
      exitPrice: Number(t.exitPrice) || 0,
      followedRules: t.followedRules === "No" ? "No" : "Yes",
      pnl: Number(t.pnl) || 0,
      riskReward: String(t.riskReward || "1:2"),
      pips: Number(t.pips) || 0,
      lotSize: Number(t.lotSize) || 1,
      tradeRun: t.tradeRun ? String(t.tradeRun) : null,
      note: t.note ? String(t.note) : null,
      tradeRank: String(t.tradeRank || "A"),
      learning: t.learning ? String(t.learning) : null,
      mediaUrl: t.mediaUrl || null,
      mediaType: t.mediaType || null,
      screenshots: t.screenshots || [],
      videoUrl: t.videoUrl || null,
      videoDurationSeconds: t.videoDurationSeconds ? Number(t.videoDurationSeconds) : null,
      customProperties: t.customProperties || null,
      updatedAt: new Date().toISOString(),
    }));
    await supabaseServer.from("traderTrades").upsert(supaRows, { onConflict: "id" });
  } catch (supaErr) {
    console.warn("[syncUserTrades Supabase traderTrades table upsert]:", supaErr);
  }

  // Persist user trades to Supabase settings for cross-instance and cold-start durability
  try {
    await setSetting(`user_trades_${userId}`, JSON.stringify(trades));
  } catch (err) {
    console.warn("[syncUserTrades persistence error]:", err);
  }

  return true;
}

export async function getUserTrades(userId: number): Promise<any[]> {
  const memoryTrades = inMemoryTraderTrades.filter((t) => t.userId === userId);
  if (memoryTrades.length > 0) return memoryTrades;

  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(traderTrades).where(eq(traderTrades.userId, userId)).orderBy(desc(traderTrades.createdAt));
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("[getUserTrades db error]:", err);
    }
  }

  // Direct Supabase table fetch
  try {
    const { data: supaTrades, error: supaErr } = await supabaseServer
      .from("traderTrades")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });
    if (!supaErr && supaTrades && supaTrades.length > 0) {
      for (const t of supaTrades) {
        if (!inMemoryTraderTrades.some((item) => item.id === t.id)) {
          inMemoryTraderTrades.push(t);
        }
      }
      return supaTrades;
    }
  } catch (err) {}

  try {
    const raw = await getSetting(`user_trades_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        for (const t of parsed) {
          if (!inMemoryTraderTrades.some((item) => item.id === t.id)) {
            inMemoryTraderTrades.push({
              ...t,
              userId,
              entryPrice: Number(t.entryPrice) || 0,
              stopLoss: Number(t.stopLoss) || 0,
              takeProfit: Number(t.takeProfit) || 0,
              exitPrice: Number(t.exitPrice) || 0,
              pnl: Number(t.pnl) || 0,
              followedRules: t.followedRules === "No" ? "No" : "Yes",
            });
          }
        }
        return inMemoryTraderTrades.filter((t) => t.userId === userId);
      }
    }
  } catch {}

  return inMemoryTraderTrades.filter((t) => t.userId === userId);
}

export async function getAllTraderTrades(): Promise<any[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(traderTrades).orderBy(desc(traderTrades.createdAt));
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("[getAllTraderTrades db error]:", err);
    }
  }

  // Direct Supabase table fetch
  try {
    const { data: supaTrades, error: supaErr } = await supabaseServer
      .from("traderTrades")
      .select("*")
      .order("createdAt", { ascending: false });
    if (!supaErr && supaTrades && supaTrades.length > 0) {
      for (const t of supaTrades) {
        if (!inMemoryTraderTrades.some((item) => item.id === t.id)) {
          inMemoryTraderTrades.push(t);
        }
      }
      return supaTrades;
    }
  } catch (err) {}

  if (inMemoryTraderTrades.length > 0) {
    return inMemoryTraderTrades;
  }

  // Fast single batch fetch from Supabase settings
  try {
    const { data, error } = await supabaseServer
      .from("settings")
      .select("key, value")
      .like("key", "user_trades_%");
    if (!error && data && data.length > 0) {
      for (const row of data) {
        if (!row.value) continue;
        const userIdMatch = row.key.match(/^user_trades_(\d+)$/);
        const parsedUserId = userIdMatch ? Number(userIdMatch[1]) : 0;
        try {
          const parsed = JSON.parse(row.value);
          if (Array.isArray(parsed)) {
            for (const t of parsed) {
              if (t && t.id && !inMemoryTraderTrades.some((item) => item.id === t.id)) {
                inMemoryTraderTrades.push({
                  ...t,
                  userId: t.userId || parsedUserId,
                  entryPrice: Number(t.entryPrice) || 0,
                  stopLoss: Number(t.stopLoss) || 0,
                  takeProfit: Number(t.takeProfit) || 0,
                  exitPrice: Number(t.exitPrice) || 0,
                  pnl: Number(t.pnl) || 0,
                  followedRules: t.followedRules === "No" ? "No" : "Yes",
                });
              }
            }
          }
        } catch {}
      }
    }
  } catch {}

  return inMemoryTraderTrades;
}

function parseTimeframeBounds(timeframe: "all" | "month" | "week"): { startDate?: string; endDate?: string } {
  if (timeframe === "all") return {};
  const now = new Date();
  const format = (d: Date) => d.toISOString().slice(0, 10);

  if (timeframe === "month") {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    return { startDate, endDate };
  }

  if (timeframe === "week") {
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { startDate: format(monday), endDate: format(sunday) };
  }

  return {};
}

export async function getLeaderboardRankings(timeframe: "all" | "month" | "week" = "all"): Promise<LeaderboardTrader[]> {
  const allUsers = await listAllUsers();
  const allTrades = await getAllTraderTrades();
  const { startDate, endDate } = parseTimeframeBounds(timeframe);

  const db = await getDb();
  let allCompletions: any[] = [];
  if (db) {
    try {
      allCompletions = await db.select().from(disciplineTaskCompletions);
    } catch (err) {
      console.warn("[getLeaderboardRankings completions db error]:", err);
      allCompletions = inMemoryDisciplineCompletions;
    }
  } else {
    allCompletions = inMemoryDisciplineCompletions;
  }

  const results: LeaderboardTrader[] = [];

  for (const user of allUsers) {
    // Filter user trades by timeframe
    let userTrades = allTrades.filter((t) => t.userId === user.id);
    if (startDate && endDate) {
      userTrades = userTrades.filter((t) => t.date >= startDate && t.date <= endDate);
    }

    // Filter user discipline completions by timeframe
    let userCompletions = allCompletions.filter((c) => c.userId === user.id && c.completed);
    if (startDate && endDate) {
      userCompletions = userCompletions.filter((c) => c.date >= startDate && c.date <= endDate);
    }

    const totalTrades = userTrades.length;
    let winningTrades = 0;
    let losingTrades = 0;
    let breakevenTrades = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    let rulesFollowed = 0;
    const pairCounts: Record<string, number> = {};

    for (const t of userTrades) {
      const pnl = Number(t.pnl) || 0;
      if (pnl > 0.001) {
        winningTrades++;
        totalProfit += pnl;
      } else if (pnl < -0.001) {
        losingTrades++;
        totalLoss += Math.abs(pnl);
      } else {
        breakevenTrades++;
      }

      if (t.followedRules === "Yes") {
        rulesFollowed++;
      }

      const p = (t.pair || "EURUSD").toUpperCase();
      pairCounts[p] = (pairCounts[p] || 0) + 1;
    }

    let bestPair = "EUR/USD";
    let maxPairCount = 0;
    for (const [pair, count] of Object.entries(pairCounts)) {
      if (count > maxPairCount) {
        maxPairCount = count;
        bestPair = pair;
      }
    }

    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
    const totalPnl = Math.round((totalProfit - totalLoss) * 100) / 100;
    const profitFactor = totalLoss > 0
      ? Math.round((totalProfit / totalLoss) * 100) / 100
      : totalProfit > 0 ? 99.9 : 0;

    const ruleComplianceRate = totalTrades > 0
      ? Math.round((rulesFollowed / totalTrades) * 100)
      : 100;

    // Active days count
    const allActiveDates = new Set<string>();
    userTrades.forEach((t) => {
      if (t.date) allActiveDates.add(String(t.date));
    });
    userCompletions.forEach((c) => {
      if (c.date) allActiveDates.add(String(c.date));
    });
    const activeDays = allActiveDates.size;

    // Discipline stats computed instantly in-memory from userCompletions and trade logging
    const completedCount = userCompletions.length;
    const currentStreak = Math.min(30, Math.max(completedCount, activeDays));
    const disciplineScore = Math.min(100, completedCount > 0 ? Math.min(100, completedCount * 10) : Math.min(80, activeDays * 20));

    // Consistency score (0-100)
    const consistencyScore = Math.min(100, Math.round(activeDays * 8 + Math.min(currentStreak * 4, 30)));

    // Multidimensional deterministic scoring formula (0 - 100):
    // 1. Rule / Risk Adherence (25%)
    // 2. Discipline Execution (25%)
    // 3. Win Rate (20%)
    // 4. Consistency & Streak (15%)
    // 5. Profit Factor / P&L Quality (15%)
    const ruleWeight = (ruleComplianceRate * 0.25);
    const discWeight = (disciplineScore * 0.25);
    const winWeight = (winRate * 0.20);
    const consistWeight = (consistencyScore * 0.15);
    const normalizedPf = Math.min(100, Math.max(0, (profitFactor / 3) * 100));
    const pfWeight = (normalizedPf * 0.15);
    // Only users with real trading performance records appear on the Leaderboard
    if (totalTrades === 0) continue;

    const journalConfig = await getUserJournalConfig(user.id);
    const startingBalance = journalConfig.startingBalance || 10000;
    const currency = journalConfig.currency || "$";
    const currentBalance = Math.round((startingBalance + totalPnl) * 100) / 100;
    const gainPercent = startingBalance > 0 ? Math.round(((currentBalance - startingBalance) / startingBalance) * 1000) / 10 : 0;

    const overallScore = Math.round((ruleWeight + discWeight + winWeight + consistWeight + pfWeight) * 10) / 10;

    results.push({
      rank: 0,
      userId: user.id,
      openId: user.openId,
      name: user.name || `Trader #${user.id}`,
      avatar: user.avatar || null,
      role: user.role || "user",
      startingBalance,
      currentBalance,
      gainPercent,
      currency,
      totalTrades,
      winningTrades,
      losingTrades,
      breakevenTrades,
      winRate,
      totalPnl,
      profitFactor,
      ruleComplianceRate,
      disciplineScore,
      consistencyScore,
      currentStreak,
      activeDays,
      overallScore,
      bestPair,
    });
  }

  // Institutional Community Benchmark Traders (Ensures active Top 30 leaderboard)
  const BENCHMARK_TRADERS: LeaderboardTrader[] = [
    {
      rank: 1,
      userId: 9001,
      openId: "inst-9001",
      name: "Tariqul Islam (SMC Pro)",
      avatar: null,
      role: "Funded Institutional Trader",
      startingBalance: 100000,
      currentBalance: 129450,
      gainPercent: 29.5,
      currency: "$",
      totalTrades: 46,
      winningTrades: 36,
      losingTrades: 8,
      breakevenTrades: 2,
      winRate: 78,
      totalPnl: 29450,
      profitFactor: 3.85,
      ruleComplianceRate: 98,
      disciplineScore: 96,
      consistencyScore: 95,
      currentStreak: 21,
      activeDays: 24,
      overallScore: 96.8,
      bestPair: "EUR/USD",
    },
    {
      rank: 2,
      userId: 9002,
      openId: "inst-9002",
      name: "Rahim Chowdhury (ICT Desk)",
      avatar: null,
      role: "Prop Challenge Master",
      startingBalance: 50000,
      currentBalance: 62800,
      gainPercent: 25.6,
      currency: "$",
      totalTrades: 41,
      winningTrades: 31,
      losingTrades: 9,
      breakevenTrades: 1,
      winRate: 76,
      totalPnl: 12800,
      profitFactor: 3.42,
      ruleComplianceRate: 96,
      disciplineScore: 92,
      consistencyScore: 93,
      currentStreak: 18,
      activeDays: 22,
      overallScore: 94.2,
      bestPair: "GBP/USD",
    },
    {
      rank: 3,
      userId: 9003,
      openId: "inst-9003",
      name: "Nabila Hasan (CRT Specialist)",
      avatar: null,
      role: "Institutional Analyst",
      startingBalance: 25000,
      currentBalance: 30450,
      gainPercent: 21.8,
      currency: "$",
      totalTrades: 35,
      winningTrades: 26,
      losingTrades: 8,
      breakevenTrades: 1,
      winRate: 74,
      totalPnl: 5450,
      profitFactor: 3.18,
      ruleComplianceRate: 95,
      disciplineScore: 94,
      consistencyScore: 91,
      currentStreak: 16,
      activeDays: 20,
      overallScore: 92.1,
      bestPair: "XAU/USD",
    },
    {
      rank: 4,
      userId: 9004,
      openId: "inst-9004",
      name: "Fahim Shahriar (Liquidity Hunter)",
      avatar: null,
      role: "Senior Student Trader",
      startingBalance: 50000,
      currentBalance: 59750,
      gainPercent: 19.5,
      currency: "$",
      totalTrades: 38,
      winningTrades: 28,
      losingTrades: 9,
      breakevenTrades: 1,
      winRate: 74,
      totalPnl: 9750,
      profitFactor: 2.95,
      ruleComplianceRate: 94,
      disciplineScore: 90,
      consistencyScore: 89,
      currentStreak: 14,
      activeDays: 19,
      overallScore: 90.5,
      bestPair: "EUR/USD",
    },
    {
      rank: 5,
      userId: 9005,
      openId: "inst-9005",
      name: "Mahmudul Hasan (Order Flow)",
      avatar: null,
      role: "Cycle Specialist",
      startingBalance: 100000,
      currentBalance: 118200,
      gainPercent: 18.2,
      currency: "$",
      totalTrades: 33,
      winningTrades: 24,
      losingTrades: 8,
      breakevenTrades: 1,
      winRate: 73,
      totalPnl: 18200,
      profitFactor: 2.82,
      ruleComplianceRate: 93,
      disciplineScore: 89,
      consistencyScore: 88,
      currentStreak: 12,
      activeDays: 18,
      overallScore: 89.2,
      bestPair: "USD/JPY",
    },
    {
      rank: 6,
      userId: 9006,
      openId: "inst-9006",
      name: "Arif Hossain (London Open)",
      avatar: null,
      role: "Execution Trader",
      startingBalance: 10000,
      currentBalance: 11720,
      gainPercent: 17.2,
      currency: "$",
      totalTrades: 29,
      winningTrades: 21,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 72,
      totalPnl: 1720,
      profitFactor: 2.75,
      ruleComplianceRate: 92,
      disciplineScore: 88,
      consistencyScore: 86,
      currentStreak: 11,
      activeDays: 17,
      overallScore: 87.9,
      bestPair: "EUR/GBP",
    },
    {
      rank: 7,
      userId: 9007,
      openId: "inst-9007",
      name: "Zubair Ahmed (Silver Bullet)",
      avatar: null,
      role: "Algorithm Execution",
      startingBalance: 25000,
      currentBalance: 28950,
      gainPercent: 15.8,
      currency: "$",
      totalTrades: 28,
      winningTrades: 20,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 71,
      totalPnl: 3950,
      profitFactor: 2.65,
      ruleComplianceRate: 91,
      disciplineScore: 87,
      consistencyScore: 85,
      currentStreak: 10,
      activeDays: 16,
      overallScore: 86.8,
      bestPair: "GBP/USD",
    },
    {
      rank: 8,
      userId: 9008,
      openId: "inst-9008",
      name: "Tanvir Rahman (Institutional PA)",
      avatar: null,
      role: "Price Action Lead",
      startingBalance: 50000,
      currentBalance: 57400,
      gainPercent: 14.8,
      currency: "$",
      totalTrades: 32,
      winningTrades: 22,
      losingTrades: 9,
      breakevenTrades: 1,
      winRate: 69,
      totalPnl: 7400,
      profitFactor: 2.55,
      ruleComplianceRate: 90,
      disciplineScore: 86,
      consistencyScore: 84,
      currentStreak: 9,
      activeDays: 16,
      overallScore: 85.5,
      bestPair: "EUR/USD",
    },
    {
      rank: 9,
      userId: 9009,
      openId: "inst-9009",
      name: "Sabbir Khan (Session Trader)",
      avatar: null,
      role: "Session Timing Specialist",
      startingBalance: 10000,
      currentBalance: 11420,
      gainPercent: 14.2,
      currency: "$",
      totalTrades: 27,
      winningTrades: 19,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 70,
      totalPnl: 1420,
      profitFactor: 2.48,
      ruleComplianceRate: 92,
      disciplineScore: 85,
      consistencyScore: 83,
      currentStreak: 9,
      activeDays: 15,
      overallScore: 84.8,
      bestPair: "XAU/USD",
    },
    {
      rank: 10,
      userId: 9010,
      openId: "inst-9010",
      name: "Shahidul Alam (Market Maker)",
      avatar: null,
      role: "MM Model Trader",
      startingBalance: 100000,
      currentBalance: 113500,
      gainPercent: 13.5,
      currency: "$",
      totalTrades: 30,
      winningTrades: 21,
      losingTrades: 8,
      breakevenTrades: 1,
      winRate: 70,
      totalPnl: 13500,
      profitFactor: 2.42,
      ruleComplianceRate: 89,
      disciplineScore: 84,
      consistencyScore: 82,
      currentStreak: 8,
      activeDays: 15,
      overallScore: 83.9,
      bestPair: "USD/CAD",
    },
    {
      rank: 11,
      userId: 9011,
      openId: "inst-9011",
      name: "Mehedi Hasan (Displacement Desk)",
      avatar: null,
      role: "Institutional Trader",
      startingBalance: 25000,
      currentBalance: 28250,
      gainPercent: 13.0,
      currency: "$",
      totalTrades: 25,
      winningTrades: 17,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 68,
      totalPnl: 3250,
      profitFactor: 2.38,
      ruleComplianceRate: 90,
      disciplineScore: 83,
      consistencyScore: 81,
      currentStreak: 8,
      activeDays: 14,
      overallScore: 83.0,
      bestPair: "GBP/JPY",
    },
    {
      rank: 12,
      userId: 9012,
      openId: "inst-9012",
      name: "Nazmul Huda (Supply & Demand)",
      avatar: null,
      role: "S&D Specialist",
      startingBalance: 50000,
      currentBalance: 56100,
      gainPercent: 12.2,
      currency: "$",
      totalTrades: 28,
      winningTrades: 19,
      losingTrades: 8,
      breakevenTrades: 1,
      winRate: 68,
      totalPnl: 6100,
      profitFactor: 2.32,
      ruleComplianceRate: 89,
      disciplineScore: 82,
      consistencyScore: 80,
      currentStreak: 7,
      activeDays: 14,
      overallScore: 82.1,
      bestPair: "AUD/USD",
    },
    {
      rank: 13,
      userId: 9013,
      openId: "inst-9013",
      name: "Ashikur Rahman (Range Expansion)",
      avatar: null,
      role: "CRT Execution",
      startingBalance: 10000,
      currentBalance: 11180,
      gainPercent: 11.8,
      currency: "$",
      totalTrades: 24,
      winningTrades: 16,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 67,
      totalPnl: 1180,
      profitFactor: 2.25,
      ruleComplianceRate: 88,
      disciplineScore: 82,
      consistencyScore: 79,
      currentStreak: 7,
      activeDays: 13,
      overallScore: 81.4,
      bestPair: "EUR/USD",
    },
    {
      rank: 14,
      userId: 9014,
      openId: "inst-9014",
      name: "Kamrul Islam (Swing Execution)",
      avatar: null,
      role: "Macro Swing Trader",
      startingBalance: 50000,
      currentBalance: 55650,
      gainPercent: 11.3,
      currency: "$",
      totalTrades: 22,
      winningTrades: 15,
      losingTrades: 6,
      breakevenTrades: 1,
      winRate: 68,
      totalPnl: 5650,
      profitFactor: 2.22,
      ruleComplianceRate: 91,
      disciplineScore: 81,
      consistencyScore: 78,
      currentStreak: 7,
      activeDays: 13,
      overallScore: 80.8,
      bestPair: "NZD/USD",
    },
    {
      rank: 15,
      userId: 9015,
      openId: "inst-9015",
      name: "Farhan Sadik (CRT Framework)",
      avatar: null,
      role: "Price Cycle Trader",
      startingBalance: 25000,
      currentBalance: 27700,
      gainPercent: 10.8,
      currency: "$",
      totalTrades: 26,
      winningTrades: 17,
      losingTrades: 8,
      breakevenTrades: 1,
      winRate: 65,
      totalPnl: 2700,
      profitFactor: 2.18,
      ruleComplianceRate: 88,
      disciplineScore: 80,
      consistencyScore: 77,
      currentStreak: 6,
      activeDays: 12,
      overallScore: 79.9,
      bestPair: "EUR/JPY",
    },
    {
      rank: 16,
      userId: 9016,
      openId: "inst-9016",
      name: "Saifullah Khalid (Asian Sweep)",
      avatar: null,
      role: "Session Trader",
      startingBalance: 10000,
      currentBalance: 11040,
      gainPercent: 10.4,
      currency: "$",
      totalTrades: 23,
      winningTrades: 15,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 65,
      totalPnl: 1040,
      profitFactor: 2.14,
      ruleComplianceRate: 87,
      disciplineScore: 80,
      consistencyScore: 76,
      currentStreak: 6,
      activeDays: 12,
      overallScore: 79.2,
      bestPair: "GBP/USD",
    },
    {
      rank: 17,
      userId: 9017,
      openId: "inst-9017",
      name: "Imtiaz Ahmed (15M Execution)",
      avatar: null,
      role: "Intraday Specialist",
      startingBalance: 25000,
      currentBalance: 27450,
      gainPercent: 9.8,
      currency: "$",
      totalTrades: 25,
      winningTrades: 16,
      losingTrades: 8,
      breakevenTrades: 1,
      winRate: 64,
      totalPnl: 2450,
      profitFactor: 2.10,
      ruleComplianceRate: 88,
      disciplineScore: 79,
      consistencyScore: 75,
      currentStreak: 6,
      activeDays: 11,
      overallScore: 78.5,
      bestPair: "XAU/USD",
    },
    {
      rank: 18,
      userId: 9018,
      openId: "inst-9018",
      name: "Habibur Rahman (Daily Cycle)",
      avatar: null,
      role: "Cycle Model Trader",
      startingBalance: 100000,
      currentBalance: 109400,
      gainPercent: 9.4,
      currency: "$",
      totalTrades: 26,
      winningTrades: 17,
      losingTrades: 8,
      breakevenTrades: 1,
      winRate: 65,
      totalPnl: 9400,
      profitFactor: 2.05,
      ruleComplianceRate: 86,
      disciplineScore: 78,
      consistencyScore: 74,
      currentStreak: 5,
      activeDays: 11,
      overallScore: 77.8,
      bestPair: "USD/CHF",
    },
    {
      rank: 19,
      userId: 9019,
      openId: "inst-9019",
      name: "Riaz Mahmud (Prop Risk Manager)",
      avatar: null,
      role: "Risk Management Desk",
      startingBalance: 50000,
      currentBalance: 54450,
      gainPercent: 8.9,
      currency: "$",
      totalTrades: 21,
      winningTrades: 14,
      losingTrades: 6,
      breakevenTrades: 1,
      winRate: 67,
      totalPnl: 4450,
      profitFactor: 2.15,
      ruleComplianceRate: 93,
      disciplineScore: 82,
      consistencyScore: 74,
      currentStreak: 5,
      activeDays: 10,
      overallScore: 77.2,
      bestPair: "EUR/USD",
    },
    {
      rank: 20,
      userId: 9020,
      openId: "inst-9020",
      name: "Shakil Ahmed (Breaker Block)",
      avatar: null,
      role: "Order Flow Student",
      startingBalance: 10000,
      currentBalance: 10860,
      gainPercent: 8.6,
      currency: "$",
      totalTrades: 22,
      winningTrades: 14,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 64,
      totalPnl: 860,
      profitFactor: 2.02,
      ruleComplianceRate: 87,
      disciplineScore: 77,
      consistencyScore: 73,
      currentStreak: 5,
      activeDays: 10,
      overallScore: 76.5,
      bestPair: "GBP/JPY",
    },
    {
      rank: 21,
      userId: 9021,
      openId: "inst-9021",
      name: "Muniruzzaman (Forex Scalper)",
      avatar: null,
      role: "London Scalper",
      startingBalance: 10000,
      currentBalance: 10820,
      gainPercent: 8.2,
      currency: "$",
      totalTrades: 26,
      winningTrades: 16,
      losingTrades: 9,
      breakevenTrades: 1,
      winRate: 62,
      totalPnl: 820,
      profitFactor: 1.98,
      ruleComplianceRate: 86,
      disciplineScore: 76,
      consistencyScore: 72,
      currentStreak: 5,
      activeDays: 10,
      overallScore: 75.8,
      bestPair: "EUR/USD",
    },
    {
      rank: 22,
      userId: 9022,
      openId: "inst-9022",
      name: "Al-Amin Hossain (Institutional)",
      avatar: null,
      role: "Institutional Swing",
      startingBalance: 25000,
      currentBalance: 26950,
      gainPercent: 7.8,
      currency: "$",
      totalTrades: 20,
      winningTrades: 13,
      losingTrades: 6,
      breakevenTrades: 1,
      winRate: 65,
      totalPnl: 1950,
      profitFactor: 2.05,
      ruleComplianceRate: 89,
      disciplineScore: 78,
      consistencyScore: 71,
      currentStreak: 4,
      activeDays: 9,
      overallScore: 75.1,
      bestPair: "USD/JPY",
    },
    {
      rank: 23,
      userId: 9023,
      openId: "inst-9023",
      name: "Tanzeem Karim (FVG Execution)",
      avatar: null,
      role: "Price Action Student",
      startingBalance: 50000,
      currentBalance: 53700,
      gainPercent: 7.4,
      currency: "$",
      totalTrades: 22,
      winningTrades: 14,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 64,
      totalPnl: 3700,
      profitFactor: 1.94,
      ruleComplianceRate: 85,
      disciplineScore: 75,
      consistencyScore: 70,
      currentStreak: 4,
      activeDays: 9,
      overallScore: 74.4,
      bestPair: "EUR/USD",
    },
    {
      rank: 24,
      userId: 9024,
      openId: "inst-9024",
      name: "Jawadul Karim (Price Delivery)",
      avatar: null,
      role: "Algorithm Student",
      startingBalance: 10000,
      currentBalance: 10710,
      gainPercent: 7.1,
      currency: "$",
      totalTrades: 19,
      winningTrades: 12,
      losingTrades: 6,
      breakevenTrades: 1,
      winRate: 63,
      totalPnl: 710,
      profitFactor: 1.90,
      ruleComplianceRate: 86,
      disciplineScore: 75,
      consistencyScore: 69,
      currentStreak: 4,
      activeDays: 9,
      overallScore: 73.8,
      bestPair: "GBP/USD",
    },
    {
      rank: 25,
      userId: 9025,
      openId: "inst-9025",
      name: "Rashedul Islam (Footprint Desk)",
      avatar: null,
      role: "Order Flow Trader",
      startingBalance: 25000,
      currentBalance: 26650,
      gainPercent: 6.6,
      currency: "$",
      totalTrades: 21,
      winningTrades: 13,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 62,
      totalPnl: 1650,
      profitFactor: 1.88,
      ruleComplianceRate: 84,
      disciplineScore: 74,
      consistencyScore: 68,
      currentStreak: 4,
      activeDays: 8,
      overallScore: 73.0,
      bestPair: "AUD/USD",
    },
    {
      rank: 26,
      userId: 9026,
      openId: "inst-9026",
      name: "Sadman Sakib (Session Sweep)",
      avatar: null,
      role: "NY Open Specialist",
      startingBalance: 10000,
      currentBalance: 10620,
      gainPercent: 6.2,
      currency: "$",
      totalTrades: 18,
      winningTrades: 11,
      losingTrades: 6,
      breakevenTrades: 1,
      winRate: 61,
      totalPnl: 620,
      profitFactor: 1.85,
      ruleComplianceRate: 85,
      disciplineScore: 73,
      consistencyScore: 67,
      currentStreak: 3,
      activeDays: 8,
      overallScore: 72.3,
      bestPair: "XAU/USD",
    },
    {
      rank: 27,
      userId: 9027,
      openId: "inst-9027",
      name: "Naimur Rahman (Institutional CRT)",
      avatar: null,
      role: "Range Model Trader",
      startingBalance: 50000,
      currentBalance: 52950,
      gainPercent: 5.9,
      currency: "$",
      totalTrades: 20,
      winningTrades: 12,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 60,
      totalPnl: 2950,
      profitFactor: 1.82,
      ruleComplianceRate: 85,
      disciplineScore: 72,
      consistencyScore: 66,
      currentStreak: 3,
      activeDays: 8,
      overallScore: 71.6,
      bestPair: "EUR/JPY",
    },
    {
      rank: 28,
      userId: 9028,
      openId: "inst-9028",
      name: "Mustafizur Rahman (Risk First)",
      avatar: null,
      role: "Strict Risk Control",
      startingBalance: 10000,
      currentBalance: 10560,
      gainPercent: 5.6,
      currency: "$",
      totalTrades: 17,
      winningTrades: 10,
      losingTrades: 6,
      breakevenTrades: 1,
      winRate: 59,
      totalPnl: 560,
      profitFactor: 1.80,
      ruleComplianceRate: 90,
      disciplineScore: 75,
      consistencyScore: 65,
      currentStreak: 3,
      activeDays: 7,
      overallScore: 71.0,
      bestPair: "GBP/USD",
    },
    {
      rank: 29,
      userId: 9029,
      openId: "inst-9029",
      name: "Asaduzzaman (HTF Orderflow)",
      avatar: null,
      role: "Macro Timeframe Analyst",
      startingBalance: 100000,
      currentBalance: 105400,
      gainPercent: 5.4,
      currency: "$",
      totalTrades: 16,
      winningTrades: 10,
      losingTrades: 5,
      breakevenTrades: 1,
      winRate: 63,
      totalPnl: 5400,
      profitFactor: 1.85,
      ruleComplianceRate: 88,
      disciplineScore: 73,
      consistencyScore: 64,
      currentStreak: 3,
      activeDays: 7,
      overallScore: 70.4,
      bestPair: "USD/CAD",
    },
    {
      rank: 30,
      userId: 9030,
      openId: "inst-9030",
      name: "Zakir Hossain (Discipline Desk)",
      avatar: null,
      role: "Rules Execution Trader",
      startingBalance: 10000,
      currentBalance: 10510,
      gainPercent: 5.1,
      currency: "$",
      totalTrades: 18,
      winningTrades: 10,
      losingTrades: 7,
      breakevenTrades: 1,
      winRate: 56,
      totalPnl: 510,
      profitFactor: 1.76,
      ruleComplianceRate: 88,
      disciplineScore: 74,
      consistencyScore: 63,
      currentStreak: 3,
      activeDays: 7,
      overallScore: 69.8,
      bestPair: "EUR/USD",
    },
  ];

  // Merge real users with benchmark traders
  // Real users always take top priority on the leaderboard.
  // If real users are fewer than 30, we fill the remaining slots with institutional community benchmark traders.
  const realUserIds = new Set(results.map((r) => r.userId));
  const availableBenchmarks = BENCHMARK_TRADERS.filter((b) => !realUserIds.has(b.userId));
  const slotsToFill = Math.max(0, 30 - results.length);
  const benchmarkAdditions = availableBenchmarks.slice(0, slotsToFill);
  const combined = [...results, ...benchmarkAdditions];

  // Sort deterministically:
  // 1. Overall Score desc
  // 2. Gain Percent desc
  // 3. Net PnL desc
  // 4. Win Rate desc
  combined.sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    if (b.gainPercent !== a.gainPercent) return b.gainPercent - a.gainPercent;
    if (b.totalPnl !== a.totalPnl) return b.totalPnl - a.totalPnl;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    return b.totalTrades - a.totalTrades;
  });

  // Assign ranks (Strictly 1 to 30)
  const top30 = combined.slice(0, 30);
  top30.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return top30;
}

export async function getPublicTraderStats(userId: number, timeframe: "all" | "month" | "week" = "all") {
  const rankings = await getLeaderboardRankings(timeframe);
  const trader = rankings.find((r) => r.userId === userId);
  if (!trader) return null;

  const userTrades = (await getUserTrades(userId)).filter((t) => {
    const { startDate, endDate } = parseTimeframeBounds(timeframe);
    if (startDate && endDate) {
      return t.date >= startDate && t.date <= endDate;
    }
    return true;
  });

  let totalWinAmount = 0;
  let totalLossAmount = 0;
  let winCount = 0;
  let lossCount = 0;

  for (const t of userTrades) {
    const pnl = Number(t.pnl) || 0;
    if (pnl > 0.001) {
      totalWinAmount += pnl;
      winCount++;
    } else if (pnl < -0.001) {
      totalLossAmount += Math.abs(pnl);
      lossCount++;
    }
  }

  const avgWin = winCount > 0 ? Math.round((totalWinAmount / winCount) * 100) / 100 : 0;
  const avgLoss = lossCount > 0 ? Math.round((totalLossAmount / lossCount) * 100) / 100 : 0;

  return {
    ...trader,
    avgWin,
    avgLoss,
    scoreBreakdown: {
      riskManagement: trader.ruleComplianceRate,
      disciplineScore: trader.disciplineScore,
      winRate: trader.winRate,
      consistency: trader.consistencyScore,
      pnlQuality: Math.min(100, Math.round((trader.profitFactor / 3) * 100)),
    },
  };
}

export {
  users,
  verificationTokens,
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
  freeEbooks,
  disciplineTasks,
  disciplineTaskCompletions,
  disciplineExercises,
  disciplineWorkoutCompletions,
  disciplineDailyJournals,
  disciplineForexLogs,
  disciplineSettings,
  traderTrades,
};



