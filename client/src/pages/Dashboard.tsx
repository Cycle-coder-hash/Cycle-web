import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Moon,
  NotebookPen,
  Play,
  PlayCircle,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

// 12 Institutional Stages Details
const ROADMAP_STAGES_FULL = [
  {
    num: 1,
    catEn: "FOUNDATION",
    catBn: "ভিত্তি",
    titleEn: "Market Structure & Swing Mechanics",
    titleBn: "মার্কেট স্ট্রাকচার ও সুইং মেকানিক্স",
    descEn: "Identify true Higher Highs, Higher Lows, and Market Structure Shifts (MSS) across multiple timeframes without false breakout traps.",
    descBn: "মাল্টি-টাইমফ্রেমে ফেক ব্রেকআউট ফাঁদ এড়িয়ে সঠিক হায়ার হাই, হায়ার লো ও মার্কেট স্ট্রাকচার শিফট (MSS) চিহ্নিত করার নিয়ম।",
    rules: [
      "Always mark Swing Highs & Lows on 4H/Daily chart first.",
      "A true break requires candle BODY closure, not just wicks.",
      "Internal structure must align with HTF trend direction.",
    ],
  },
  {
    num: 2,
    catEn: "INSTITUTIONAL FLOW",
    catBn: "প্রাতিষ্ঠানিক প্রবাহ",
    titleEn: "Institutional Order Flow & Footprint",
    titleBn: "প্রাতিষ্ঠানিক অর্ডার ফ্লো ও ফুটপ্রিন্ট",
    descEn: "Understand how institutional algorithms accumulate and distribute large volume orders before significant expansion moves.",
    descBn: "বড় ব্যাংক ও অ্যালগরিদম কীভাবে মার্কেট মুভের আগে ভলিউম অ্যাকুমুলেট এবং ডিস্ট্রিবিউট করে তা চার্টে শনাক্ত করুন।",
    rules: [
      "Track where aggressive displacement candles originate.",
      "Institutional orders leave footprints in high-volume inefficiencies.",
      "Never trade against the primary 4H institutional order flow.",
    ],
  },
  {
    num: 3,
    catEn: "LIQUIDITY",
    catBn: "লিকুইডিটি পুল",
    titleEn: "Liquidity Pools & Stop Hunt Sweeps",
    titleBn: "লিকুইডিটি পুল ও স্টপ হান্ট সুইপ",
    descEn: "Locate Buy-Side Liquidity (BSL) and Sell-Side Liquidity (SSL) resting above equal highs and below equal lows where retail stops are harvested.",
    descBn: "রিটেল ট্রেডারদের স্টপ লস যেখানে জমা থাকে (BSL ও SSL) তা চিহ্নিত করে সুইপের পর রিভার্সাল ধরার নিয়ম।",
    rules: [
      "Equal Highs (EQH) = High-probability Buy-Side Liquidity pool.",
      "Equal Lows (EQL) = High-probability Sell-Side Liquidity pool.",
      "Wait for liquidity raid + displacement before executing.",
    ],
  },
  {
    num: 4,
    catEn: "CORE ALGO",
    catBn: "কোর অ্যালগরিদম",
    titleEn: "Candle Range Theory (CRT) Models",
    titleBn: "ক্যান্ডেল রেঞ্জ থিওরি (CRT) মডেল",
    descEn: "Master the 4-step algorithm lifecycle: Range Initiation, Manipulation/Sweep, Expansion, and Targeted Distribution.",
    descBn: "ক্যান্ডেলের ৪টি অ্যালগরিদমিক পর্যায়: রেঞ্জ গঠন, ম্যানিপুলেশন/সুইপ, এক্সপ্যানশন এবং টার্গেট ডিস্ট্রিবিউশন।",
    rules: [
      "Range high and low define the battleground.",
      "Look for fakeouts that raid one side before expanding to the other.",
      "Target the opposing range boundary for 1:3+ minimum RR.",
    ],
  },
  {
    num: 5,
    catEn: "IMBALANCE",
    catBn: "ইমব্যালেন্স",
    titleEn: "Fair Value Gaps (FVG) & Volume Inefficiency",
    titleBn: "ফেয়ার ভ্যালু গ্যাপ (FVG) ও ভলিউম ইমব্যালেন্স",
    descEn: "Differentiate between high-probability institutional FVGs, Inverse FVGs, and Balanced Price Ranges (BPR) that act as market magnets.",
    descBn: "মার্কেটের হাই-প্রোবাবিলিটি ফেয়ার ভ্যালু গ্যাপ ও ব্যালেন্সড প্রাইস রেঞ্জ চিহ্নিত করে নিখুঁত এন্ট্রি পয়েন্ট বের করা।",
    rules: [
      "FVG formed with displacement has 80%+ retest fill probability.",
      "Inverse FVG (IFVG) flipped from support to resistance signals continuation.",
      "Consequent Encroachment (50% midpoint) is the optimal entry level.",
    ],
  },
  {
    num: 6,
    catEn: "SMC PATTERNS",
    catBn: "এসএমসি প্যাটার্ন",
    titleEn: "Order Blocks & Breaker Block Dynamics",
    titleBn: "অর্ডার ব্লক ও ব্রেকার ব্লক ডায়নামিক্স",
    descEn: "Select only high-probability Order Blocks that swept liquidity and created structural displacement, filtering out 90% of weak retail blocks.",
    descBn: "লিকুইডিটি সুইপ করা ভ্যালিড অর্ডার ব্লক ও ফেইল্ড ওবি (ব্রেকার ব্লক) দিয়ে হাই-উইনরেট এন্ট্রি নেওয়ার নিয়ম।",
    rules: [
      "An Order Block without liquidity sweep is INVALID.",
      "A failed Order Block transforms into a powerful Breaker Block.",
      "Refine 4H/1H blocks into 15m/5m refined zones for tight stops.",
    ],
  },
  {
    num: 7,
    catEn: "TIMING",
    catBn: "টাইমিং ও সেশন",
    titleEn: "Time & Price: London & New York Killzones",
    titleBn: "টাইম অ্যান্ড প্রাইস: লন্ডন ও নিউইয়র্ক কিলজোন",
    descEn: "Institutional setups trigger only during algorithmic timing windows. Learn the London Open (08:00-10:00 GMT) and NY Open (13:00-15:00 GMT) routines.",
    descBn: "নির্দিষ্ট অ্যালগরিদমিক কিলজোনে মার্কেট চালিত হয়। লন্ডন ওপেন ও নিউইয়র্ক ওপেন টাইমিং ফিল্টার ব্যবহার করে ট্রেড নেওয়া।",
    rules: [
      "Never trade during low-volume Asian lunch lull (except for range marking).",
      "Judas Swing occurs frequently during the first 45 minutes of London open.",
      "High-impact news (CPI, NFP, FOMC) acts as the catalyst for macro expansion.",
    ],
  },
  {
    num: 8,
    catEn: "BIAS",
    catBn: "ডেইলি বায়াস",
    titleEn: "Daily Bias & AMD Accumulation Matrix",
    titleBn: "ডেইলি বায়াস ও AMD অ্যাকুমুলেশন ম্যাট্রিক্স",
    descEn: "Determine whether the upcoming daily candle will expand Bullish or Bearish before the market opens using Previous Day High/Low sweeps.",
    descBn: "পূর্ববর্তী দিনের হাই/লো এবং এএমডি ফ্রেমওয়ার্ক দিয়ে মার্কেট ওপেন হওয়ার আগেই দৈনিক ডিরেকশন নির্ভুলভাবে প্রেডিক্ট করা।",
    rules: [
      "Previous Day High (PDH) and Low (PDL) are primary liquidity draws.",
      "Accumulation in Asia → Manipulation in London → Distribution in New York.",
      "Trade with the Daily Bias for smooth runners and zero anxiety.",
    ],
  },
  {
    num: 9,
    catEn: "PRECISION",
    catBn: "প্রিসিশন",
    titleEn: "Inducement vs True Break of Structure",
    titleBn: "ইনডিউসমেন্ট বনাম ট্রু ব্রেক অব স্ট্রাকচার",
    descEn: "Avoid the #1 trap that bankrupts SMC traders: distinguishing between internal inducement traps and genuine institutional trend continuation.",
    descBn: "রিটেল এসএমসি ট্রেডারদের মূল ফাঁদ (ইনডিউসমেন্ট) থেকে বাঁচতে ট্রু ব্রেক অব স্ট্রাকচার সঠিকভাবে যাচাই করার ফর্মুলা।",
    rules: [
      "Inducement is the first internal pullback after a high/low is formed.",
      "Do NOT enter on inducement — wait for price to take it out.",
      "Entry occurs AFTER inducement is swept into a HTF point of interest.",
    ],
  },
  {
    num: 10,
    catEn: "MULTI-TIMEFRAME",
    catBn: "টপ-ডাউন অ্যানালাইসিস",
    titleEn: "Top-Down Multi-Timeframe Alignment",
    titleBn: "টপ-ডাউন মাল্টি-টাইমফ্রেম অ্যালাইনমেন্ট",
    descEn: "Execute the seamless 3-timeframe sequence: Daily (Directional Bias) → 1-Hour (Setup & POI) → 5m/1m (Sniper Confirmation & Execution).",
    descBn: "ডেইলি চার্ট দিয়ে দিক নির্ধারণ → ১-ঘণ্টা চার্টে লেভেল মার্কিং → ১/৫ মিনিট চার্টে স্নাইপার কনফার্মেশন ও এন্ট্রি।",
    rules: [
      "Daily frame provides the narrative and draw on liquidity.",
      "1-Hour frame provides the institutional point of interest.",
      "1-Minute frame provides the tight 5-10 pip stop loss entry confirmation.",
    ],
  },
  {
    num: 11,
    catEn: "EXECUTION",
    catBn: "এক্সিকিউশন",
    titleEn: "High-RR Sniper Entry Models & Execution",
    titleBn: "হাই-RR স্নাইপার এন্ট্রি মডেল ও এক্সিকিউশন",
    descEn: "Learn the 3 proprietary entry triggers: The CRT Sweep Model, The Liquidity Void Fill Model, and The Order Flow Continuation Entry.",
    descBn: "১:৪ থেকে ১:১০ রিস্ক-টু-রিওয়ার্ড নিশ্চিত করতে ৩টি নির্দিষ্ট এন্ট্রি ট্রিগার ও পজিশন সাইজিং রুলস।",
    rules: [
      "Minimum 1:3 Risk-to-Reward on every single setup.",
      "Place Stop Loss strictly beyond the invalidation swing wick.",
      "Scale out 50% at TP1, move SL to breakeven, and let the runner hit final liquidity.",
    ],
  },
  {
    num: 12,
    catEn: "MASTERY",
    catBn: "মাস্টারি ও সাইকোলজি",
    titleEn: "Institutional Risk Matrix & Mindset Mastery",
    titleBn: "প্রাতিষ্ঠানিক রিস্ক ম্যানেজমেন্ট ও সাইকোলজি",
    descEn: "The mindset shift from gambler to institutional risk manager. Capital preservation, drawdown protocols, and eliminating revenge trading forever.",
    descBn: "জুয়াড়ি মানসিকতা দূর করে একজন প্রাতিষ্ঠানিক রিস্ক ম্যানেজারের মতো সাইকোলজি ও ক্যাপিটাল প্রোটেকশন রুলস বাস্তবায়ন করা।",
    rules: [
      "Maximum 1% risk per trade. Never violate this rule under any emotion.",
      "Max 2 consecutive losses in a day = shut down terminal until next session.",
      "Focus on flawless execution of the process; profits are a mathematical byproduct.",
    ],
  },
];

// Daily Discipline Rules
const DAILY_DISCIPLINE_RULES = [
  {
    id: "news_check",
    textEn: "Checked high-impact news calendar (Forex Factory) before session open",
    textBn: "সেশন শুরুর আগে হাই-ইমপ্যাক্ট নিউজ ক্যালেন্ডার (Forex Factory) চেক করেছি",
  },
  {
    id: "bias_marked",
    textEn: "Identified Daily Bias & mapped key Liquidity pools (BSL/SSL) on HTF",
    textBn: "হায়ার টাইমফ্রেমে ডেইলি বায়াস ও মূল লিকুইডিটি পুল (BSL/SSL) মার্ক করেছি",
  },
  {
    id: "risk_limit",
    textEn: "Strictly limited risk to 1% max per trade — no revenge or overleveraging",
    textBn: "প্রতি ট্রেডে সর্বোচ্চ ১% রিস্ক রুলস মেনে চলেছি — কোনো অতিরিক্ত লট নেই",
  },
  {
    id: "killzone_only",
    textEn: "Only executed setups during active Killzones (London 08:00-10:00 / NY 13:00-15:00)",
    textBn: "শুধুমাত্র অ্যালগরিদমিক কিলজোনের ভেতরেই ট্রেড এক্সিকিউট করেছি",
  },
  {
    id: "rr_validation",
    textEn: "Validated minimum 1:3 Risk-to-Reward ratio before placing order",
    textBn: "অর্ডার বসানোর আগে ন্যূনতম ১:৩ রিস্ক-টু-রিওয়ার্ড নিশ্চিত করেছি",
  },
  {
    id: "journal_logged",
    textEn: "Documented trade setup, emotional state & lesson in trading journal",
    textBn: "ট্রেড নেওয়ার পর মানসিক অবস্থা ও লজিক বিস্তারিত জার্নালে লিখেছি",
  },
];

// Institutional PDF Cheatsheet Previews
const PDF_CHEATSHEETS_DATA = [
  {
    id: 1,
    title: "1. Candle Range Theory (CRT) Master Cheat-Sheet",
    subtitle: "Complete 4-Step Algorithmic Cycle & Invalidation Points",
    pages: 18,
    category: "Algorithm",
    keyConcepts: [
      "Phase 1: Asian Session Range Initiation (00:00 - 06:00 GMT)",
      "Phase 2: London Open Judas Sweep (07:30 - 09:00 GMT)",
      "Phase 3: NY Open Real Institutional Expansion (13:00 - 15:30 GMT)",
      "Phase 4: Targeted Distribution into HTF Pool",
    ],
  },
  {
    id: 2,
    title: "2. Liquidity Engineering & Stop Hunt Identification",
    subtitle: "BSL, SSL, Internal vs External Liquidity Traps",
    pages: 24,
    category: "Liquidity",
    keyConcepts: [
      "Buy-Side Liquidity (BSL) rests above swing highs & equal highs.",
      "Sell-Side Liquidity (SSL) rests below swing lows & trendline support.",
      "Inducement vs Valid Breakout confirmation formula.",
    ],
  },
  {
    id: 3,
    title: "3. Institutional Order Block (OB) Validation Matrix",
    subtitle: "Distinguishing 80%+ Win Rate OBs from Fake SMC Zones",
    pages: 20,
    category: "SMC Strategy",
    keyConcepts: [
      "Rule 1: Must have swept liquidity prior to creation.",
      "Rule 2: Must have caused a Market Structure Shift (MSS).",
      "Rule 3: Must contain an imbalance / Fair Value Gap in the displacement.",
    ],
  },
  {
    id: 4,
    title: "4. Fair Value Gap (FVG) & Volume Inefficiency Guide",
    subtitle: "Consequent Encroachment & Inverse FVG Trading Models",
    pages: 16,
    category: "Price Action",
    keyConcepts: [
      "3-Candle Imbalance calculation formula.",
      "Consequent Encroachment (50% midpoint) entry technique.",
      "Inverse FVG (IFVG) as continuation confirmation.",
    ],
  },
  {
    id: 5,
    title: "5. Multi-Timeframe Top-Down Sniper Execution Blueprint",
    subtitle: "Daily → 1H → 5m/1m Confirmation Sequences",
    pages: 22,
    category: "Execution",
    keyConcepts: [
      "Step 1: Daily Candle Narrative & Liquidity Draw.",
      "Step 2: 1H Point of Interest (POI) & Zone Refinement.",
      "Step 3: 1m MSS + FVG entry for 5-10 pip stop loss.",
    ],
  },
];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Active Tab
  const [tab, setTab] = useState<
    "overview" | "roadmap" | "library" | "journal" | "discipline" | "orders" | "support"
  >("overview");
  const [lang, setLang] = useState<"en" | "bn">(() => (localStorage.getItem("cycle-language") as "en" | "bn") || "en");

  // Date for discipline
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Modals & States
  const [selectedRoadmapStage, setSelectedRoadmapStage] = useState<any | null>(null);
  const [roadmapFilter, setRoadmapFilter] = useState<"all" | "completed" | "todo">("all");
  const [stageNotes, setStageNotes] = useState<Record<number, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("cycle_stage_notes") || "{}");
    } catch {
      return {};
    }
  });

  // Library Modals
  const [previewPdfModal, setPreviewPdfModal] = useState<any | null>(null);
  const [previewVideoModal, setPreviewVideoModal] = useState<any | null>(null);

  // Journal form state
  const [showNewJournalModal, setShowNewJournalModal] = useState(false);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalSetup, setJournalSetup] = useState("CRT Range Model");
  const [journalResult, setJournalResult] = useState("Win");
  const [journalPair, setJournalPair] = useState("EUR/USD");
  const [journalSession, setJournalSession] = useState("London Open (08:00 GMT)");
  const [journalRR, setJournalRR] = useState("1:3.5");
  const [journalFilter, setJournalFilter] = useState<"all" | "Win" | "Loss" | "Breakeven">("all");
  const [journalSearch, setJournalSearch] = useState("");

  // Support Ticket Form
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Payment Verification");
  const [ticketMessage, setTicketMessage] = useState("");

  // Invoice Modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  const isBn = lang === "bn";

  const setLanguage = (next: "en" | "bn") => {
    setLang(next);
    localStorage.setItem("cycle-language", next);
  };

  // Queries
  const { data: orders, refetch: refetchOrders } = trpc.customer.orders.useQuery(undefined, { enabled: !!user });
  const { data: entitlements, refetch: refetchEntitlements } = trpc.customer.entitlements.useQuery(undefined, { enabled: !!user });
  const { data: journal, refetch: refetchJournal } = trpc.customer.journal.useQuery(undefined, { enabled: !!user });
  const { data: tickets, refetch: refetchTickets } = trpc.customer.tickets.useQuery(undefined, { enabled: !!user });
  const { data: notifications } = trpc.customer.notifications.useQuery(undefined, { enabled: !!user });
  const { data: progress, refetch: refetchProgress } = trpc.customer.progress.useQuery(undefined, { enabled: !!user });
  const { data: discipline, refetch: refetchDiscipline } = trpc.customer.discipline.useQuery({ date: today }, { enabled: !!user });

  // Mutations
  const toggleProgressMutation = trpc.customer.toggleProgress.useMutation({
    onSuccess: () => refetchProgress(),
  });

  const toggleDisciplineMutation = trpc.customer.toggleDiscipline.useMutation({
    onSuccess: () => refetchDiscipline(),
  });

  const createJournalMutation = trpc.customer.createJournal.useMutation({
    onSuccess: () => {
      refetchJournal();
      setShowNewJournalModal(false);
      setJournalTitle("");
      setJournalContent("");
    },
  });

  const deleteJournalMutation = trpc.customer.deleteJournal.useMutation({
    onSuccess: () => refetchJournal(),
  });

  const createTicketMutation = trpc.customer.createTicket.useMutation({
    onSuccess: () => {
      refetchTickets();
      setShowNewTicketModal(false);
      setTicketSubject("");
      setTicketMessage("");
    },
  });

  // Calculate completed stages count
  const completedStagesCount = useMemo(() => {
    if (!progress) return 0;
    return progress.filter((p: any) => p.completed).length;
  }, [progress]);

  const progressPercent = Math.min(100, Math.round((completedStagesCount / 12) * 100));

  // Calculate journal analytics
  const journalStats = useMemo(() => {
    if (!journal || !journal.length) {
      return { total: 0, wins: 0, losses: 0, winRate: 0, bestSetup: "CRT Model" };
    }
    const wins = journal.filter((j: any) => j.result?.toLowerCase() === "win").length;
    const losses = journal.filter((j: any) => j.result?.toLowerCase() === "loss").length;
    const winRate = Math.round((wins / journal.length) * 100);
    return {
      total: journal.length,
      wins,
      losses,
      winRate,
      bestSetup: "CRT Range Model",
    };
  }, [journal]);

  // Save personal stage note
  const handleSaveStageNote = (stageNum: number, note: string) => {
    const updated = { ...stageNotes, [stageNum]: note };
    setStageNotes(updated);
    localStorage.setItem("cycle_stage_notes", JSON.stringify(updated));
  };

  // Download institutional guide
  const handleDownloadResource = (pdfItem: any) => {
    const content = `=====================================================
CYCLE OF CHART — INSTITUTIONAL TRADING REALITY GUIDE
Title: ${pdfItem.title}
Subtitle: ${pdfItem.subtitle}
=====================================================

KEY INSTITUTIONAL CONCEPTS & RULES:
${pdfItem.keyConcepts.map((c: string, idx: number) => `[0${idx + 1}] ${c}`).join("\n\n")}

CRITICAL RISK MANAGEMENT PROTOCOL:
- Never risk more than 1% of equity on any individual trade.
- Always wait for candle closure on the confirmation timeframe.
- Scale out at Target 1 and trail your stop loss to Breakeven.

(C) 2026 Cycle of Chart. All rights reserved. For authorized student use only.
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pdfItem.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] text-slate-600 dark:bg-[#060d19] dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo size={64} className="animate-pulse" />
          <div className="text-sm font-bold tracking-widest uppercase">Loading Student Portal...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070f1e] p-6 text-white">
        <div className="max-w-md text-center">
          <BrandLogo size={96} className="mx-auto" />
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Student Dashboard Access</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Sign in to access your 12-Stage roadmap, trading journal, daily discipline routine, and unlocked bundles.
          </p>
          <Link href="/login">
            <Button size="lg" className="mt-7 w-full bg-[#38bdf8] font-bold text-slate-950 hover:bg-[#7dd3fc]">
              Sign In to Your Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem("cycle_session_token");
      sessionStorage.removeItem("manus-cookie");
      await logout();
    } catch {}
    window.location.href = "/login";
  };

  type NavItem = {
    id: "overview" | "roadmap" | "library" | "journal" | "discipline" | "orders" | "support";
    labelEn: string;
    labelBn: string;
    icon: any;
    badge?: string;
  };

  const navItems: NavItem[] = [
    { id: "overview", labelEn: "Overview", labelBn: "ওভারভিউ", icon: LayoutDashboard },
    { id: "roadmap", labelEn: "12-Stage Roadmap", labelBn: "১২-স্টেজ রোডম্যাপ", icon: Layers, badge: `${completedStagesCount}/12` },
    { id: "library", labelEn: "My Library & Resources", labelBn: "আমার লাইব্রেরি", icon: BookOpen, badge: entitlements?.length ? `${entitlements.length}` : undefined },
    { id: "journal", labelEn: "Trading Journal", labelBn: "ট্রেডিং জার্নাল", icon: NotebookPen, badge: journal?.length ? `${journal.length}` : undefined },
    { id: "discipline", labelEn: "Daily Discipline", labelBn: "ডেইলি রুটিন", icon: ClipboardCheck },
    { id: "orders", labelEn: "Orders & Billing", labelBn: "পেমেন্ট হিস্ট্রি", icon: Receipt },
    { id: "support", labelEn: "Support Desk", labelBn: "সাপোর্ট ডেস্ক", icon: ShieldCheck },
  ];

  // Filtered Journals
  const filteredJournals = (journal || []).filter((j: any) => {
    if (journalFilter !== "all" && j.result !== journalFilter) return false;
    if (journalSearch.trim()) {
      const q = journalSearch.toLowerCase();
      return (
        j.title?.toLowerCase().includes(q) ||
        j.content?.toLowerCase().includes(q) ||
        j.setup?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#060d19] dark:text-slate-100 transition-colors duration-300 selection:bg-[#38bdf8] selection:text-slate-950 ${
        isBn ? "font-bangla" : ""
      }`}
    >
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col justify-between border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#070e1b] lg:flex z-30">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size={42} className="shrink-0" />
            <div>
              <span className="text-xs font-extrabold tracking-[0.2em] text-[#0a192f] dark:text-white">
                CYCLE OF CHART
              </span>
              <div className="text-[10px] font-bold text-[#0284c7] dark:text-sky-400">TRADING REALITY PORTAL</div>
            </div>
          </Link>

          {/* User Profile Snippet */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#081833] font-mono text-sm font-bold text-white dark:bg-sky-500 dark:text-slate-950 shadow-md">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden">
                <div className="truncate text-sm font-extrabold">{user.name || "Trader"}</div>
                <div className="truncate text-[11px] text-slate-400">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 dark:border-slate-800">
              <span className="rounded-full bg-[#0284c7]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-400">
                {user.role === "admin" ? "ADMIN ACCESS" : user.role === "support" ? "SUPPORT ACCESS" : "STUDENT PASS"}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {isBn ? "সক্রিয় সদস্য" : "Active Member"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-[#081833] text-white shadow-md dark:bg-sky-500 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? "text-[#38bdf8] dark:text-slate-950" : "text-slate-400"} />
                    <span>{isBn ? item.labelBn : item.labelEn}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800 space-y-3">

          <div className="flex items-center justify-between">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-yellow-400 dark:hover:bg-slate-800"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language Switcher */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                  lang === "en" ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white" : "text-slate-500"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("bn")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                  lang === "bn" ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white" : "text-slate-500"
                }`}
              >
                বাং
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex size-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="lg:pl-72 flex min-h-screen flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#070e1b]/90">
          <div className="flex items-center gap-3">
            <Link href="/" className="lg:hidden">
              <BrandLogo size={32} />
            </Link>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isBn ? "ট্রেডিং রিয়েলিটি স্টুডেন্ট পোর্টাল" : "Institutional Trader Portal"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {isBn ? "আপনার রোডম্যাপ, জার্নাল ও ডিসিপ্লিন ট্র্যাকার" : "Process over emotion · 12-Stage Mastery"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700">
                <ArrowLeft size={13} />
                <span>{isBn ? "মূল ওয়েবসাইট" : "Main Website"}</span>
              </Button>
            </Link>

            <Link href="/checkout">
              <Button size="sm" className="gap-1 text-xs font-extrabold bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                <Sparkles size={13} />
                <span>{isBn ? "স্টোর ব্রাউজ" : "Browse Store"}</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Mobile Horizontal Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden overflow-x-auto touch-pan-x overscroll-contain dark:border-slate-800 dark:bg-[#070e1b]">
          <div className="flex gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  tab === item.id
                    ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {isBn ? item.labelBn : item.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {tab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Top Banner KPI Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Roadmap Progress */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-extrabold uppercase tracking-wider">{isBn ? "রোডম্যাপ অগ্রগতি" : "Roadmap Progress"}</span>
                    <Layers size={18} className="text-[#0284c7] dark:text-sky-400" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black">{completedStagesCount}</span>
                    <span className="text-sm font-bold text-slate-400">/ 12 {isBn ? "স্টেজ" : "Stages"}</span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-[#0284c7] transition-all duration-500 dark:bg-sky-400" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {/* 2. Win Rate */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-extrabold uppercase tracking-wider">{isBn ? "ট্রেড উইনরেট" : "Trade Win Rate"}</span>
                    <Flame size={18} className="text-amber-500" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black">{journalStats.winRate}%</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">({journalStats.wins}W / {journalStats.losses}L)</span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {journalStats.total} {isBn ? "টি ট্রেড জার্নালে লিপিবদ্ধ" : "documented trade logs"}
                  </div>
                </div>

                {/* 3. Journal Logs */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-extrabold uppercase tracking-wider">{isBn ? "আনলকড রিসোর্স" : "My Resources"}</span>
                    <BookOpen size={18} className="text-purple-500" />
                  </div>
                  <div className="mt-4 text-3xl font-black">{entitlements?.length || 0}</div>
                  <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isBn ? "সক্রিয় PDF ও কোর্স অ্যাক্সেস" : "Active package entitlements"}
                  </div>
                </div>

                {/* 4. Today's Discipline */}
                <div className="rounded-3xl bg-[#081833] p-6 text-white shadow-xl shadow-[#081833]/15 dark:bg-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#38bdf8]">{isBn ? "আজকের রুটিন" : "Today's Discipline"}</span>
                    <ClipboardCheck size={18} className="text-[#38bdf8]" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black">{discipline?.filter((d: any) => d.completed).length || 0}</span>
                    <span className="text-sm font-bold text-slate-400">/ 6 {isBn ? "রুলস" : "Rules"}</span>
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-300">
                    {isBn ? "ডিসিপ্লিনই ট্রেডারের মূল শক্তি" : "Process over emotion"}
                  </div>
                </div>
              </div>

              {/* Learning Roadmap Banner CTA */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#081833] via-[#0f2c59] to-[#0a1e3d] p-7 sm:p-9 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#38bdf8]">
                      <Sparkles size={13} /> {isBn ? "পরবর্তী ধাপ" : "NEXT STEP"}
                    </span>
                    <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {isBn
                        ? `স্টেজ ০${Math.min(12, completedStagesCount + 1)}: ${ROADMAP_STAGES_FULL[Math.min(11, completedStagesCount)].titleBn}`
                        : `Stage 0${Math.min(12, completedStagesCount + 1)}: ${ROADMAP_STAGES_FULL[Math.min(11, completedStagesCount)].titleEn}`}
                    </h2>
                    <p className="mt-2 max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {isBn
                        ? ROADMAP_STAGES_FULL[Math.min(11, completedStagesCount)].descBn
                        : ROADMAP_STAGES_FULL[Math.min(11, completedStagesCount)].descEn}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedRoadmapStage(ROADMAP_STAGES_FULL[Math.min(11, completedStagesCount)]);
                      setTab("roadmap");
                    }}
                    size="lg"
                    className="shrink-0 gap-2 rounded-2xl bg-[#38bdf8] font-black text-slate-950 hover:bg-[#7dd3fc] shadow-lg shadow-sky-500/20"
                  >
                    <span>{isBn ? "স্টেজ স্টাডি শুরু করুন" : "Study Next Stage"}</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>

              {/* Two Column Section: Quick Recent Journal & Discipline */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Journal Entries */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold">{isBn ? "সাম্প্রতিক ট্রেড জার্নাল" : "Recent Trade Logs"}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setTab("journal")} className="text-xs font-bold text-[#0284c7] dark:text-sky-400">
                      {isBn ? "সব দেখুন" : "View all"} →
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {journal?.length ? (
                      journal.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm">{item.title}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                item.result?.toLowerCase() === "win"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : item.result?.toLowerCase() === "loss"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {item.result || "Logged"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.content}</p>
                          <div className="mt-2 text-[10px] font-mono text-slate-400">{item.setup || "General Setup"} • {new Date(item.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                        {isBn ? "এখনো কোনো ট্রেড জার্নাল এন্ট্রি যোগ করা হয়নি।" : "No trade logs recorded yet. Build the habit of journaling every setup."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Daily Discipline Checklist */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold">{isBn ? "ডেইলি ট্রেডার চেকলিস্ট" : "Daily Discipline Checklist"}</h3>
                    <span className="text-xs font-mono font-bold text-slate-400">{today}</span>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {DAILY_DISCIPLINE_RULES.slice(0, 4).map((rule) => {
                      const isChecked = discipline?.some((d: any) => d.label === rule.id && d.completed);
                      return (
                        <button
                          key={rule.id}
                          onClick={() => toggleDisciplineMutation.mutate({ label: rule.id, date: today, completed: !isChecked })}
                          className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                            isChecked
                              ? "border-emerald-200 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
                              : "border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/40"
                          }`}
                        >
                          <div className="mt-0.5">
                            {isChecked ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-300 dark:text-slate-600" />}
                          </div>
                          <span className={`text-xs font-medium leading-relaxed ${isChecked ? "line-through opacity-80" : ""}`}>
                            {isBn ? rule.textBn : rule.textEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 12-STAGE ROADMAP TRACKER */}
          {/* ========================================================================= */}
          {tab === "roadmap" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "১২-স্টেজ ট্রেডিং রিয়েলিটি রোডম্যাপ" : "12-Stage Institutional Roadmap"}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isBn ? "প্রতিটি স্টেজ ওপেন করে প্রাতিষ্ঠানিক রুলস পড়ুন এবং সম্পন্ন করার পর টিক দিন।" : "Master institutional concept step-by-step. Click any stage to study rules & log notes."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(["all", "completed", "todo"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setRoadmapFilter(f)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                        roadmapFilter === f
                          ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {f === "all" ? (isBn ? "সকল স্টেজ" : "All Stages") : f === "completed" ? (isBn ? "সম্পন্ন" : "Completed") : (isBn ? "বাকি আছে" : "To-Do")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ROADMAP_STAGES_FULL.filter((stg) => {
                  const isDone = progress?.some((p: any) => p.lessonId === stg.num && p.completed);
                  if (roadmapFilter === "completed") return isDone;
                  if (roadmapFilter === "todo") return !isDone;
                  return true;
                }).map((stg) => {
                  const isDone = progress?.some((p: any) => p.lessonId === stg.num && p.completed);
                  return (
                    <div
                      key={stg.num}
                      onClick={() => setSelectedRoadmapStage(stg)}
                      className={`group relative flex cursor-pointer flex-col justify-between rounded-3xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                        isDone
                          ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                          : "border-slate-200 bg-white hover:border-[#0284c7]/50 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${isDone ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                            {isBn ? `স্টেজ ${String(stg.num).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}` : `Stage ${String(stg.num).padStart(2, "0")}`}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7] dark:text-sky-400">{isBn ? stg.catBn : stg.catEn}</span>
                        </div>

                        <h3 className="mt-4 text-base font-extrabold group-hover:text-[#0284c7] dark:group-hover:text-sky-400 transition-colors">{isBn ? stg.titleBn : stg.titleEn}</h3>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {isBn ? stg.descBn : stg.descEn}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                        <span className="text-xs font-bold text-[#0284c7] dark:text-sky-400 flex items-center gap-1">
                          <span>{isBn ? "বিস্তারিত দেখুন" : "View Rules & Notes"}</span>
                          <ChevronRight size={13} />
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProgressMutation.mutate({ lessonId: stg.num, completed: !isDone });
                          }}
                          className={`rounded-full p-1.5 transition ${isDone ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800"}`}
                          title={isDone ? "Mark as uncompleted" : "Mark as completed"}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MY LIBRARY & RESOURCES */}
          {/* ========================================================================= */}
          {tab === "library" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "আমার লাইব্রেরি ও প্রাতিষ্ঠানিক রিসোর্স" : "Institutional PDF Library & Course"}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isBn ? "অনলাইনে প্রিভিউ দেখুন অথবা সম্পূর্ণ চিট-শীট ফাইলটি সরাসরি ডাউনলোড করুন।" : "Preview interactive cheat-sheets in browser or download printable study files."}
                  </p>
                </div>

                <Link href="/checkout">
                  <Button size="sm" className="gap-1.5 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold">
                    <Plus size={15} /> {isBn ? "নতুন রিসোর্স আনলক করুন" : "Browse Store Bundles"}
                  </Button>
                </Link>
              </div>

              {/* Resource Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PDF_CHEATSHEETS_DATA.map((pdf) => (
                  <div key={pdf.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          INSTITUTIONAL PDF
                        </span>
                        <FileText size={18} className="text-[#0284c7] dark:text-sky-400" />
                      </div>
                      <h3 className="mt-4 text-base font-extrabold">{pdf.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pdf.subtitle}</p>
                      <div className="mt-3 text-[11px] font-mono text-slate-400">{pdf.pages} Pages · High Resolution Reference</div>
                    </div>

                    <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Button
                        size="sm"
                        onClick={() => setPreviewPdfModal(pdf)}
                        variant="outline"
                        className="w-1/2 text-xs font-bold border-slate-300 dark:border-slate-700"
                      >
                        <Eye size={13} className="mr-1" />
                        <span>Preview</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleDownloadResource(pdf)}
                        className="w-1/2 gap-1 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: TRADING JOURNAL */}
          {/* ========================================================================= */}
          {tab === "journal" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "ট্রেডিং জার্নাল ও সিদ্ধান্ত ট্র্যাকার" : "Institutional Trading Journal"}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isBn ? "প্রতিটি ট্রেডের পেছনের লজিক, রিস্ক এবং মানসিক অবস্থা রেকর্ড করে ভুল শুধরে নিন।" : "Record your setups, risk parameters, and emotions to build a repeatable trading edge."}
                  </p>
                </div>

                <Button onClick={() => setShowNewJournalModal(true)} size="sm" className="gap-1.5 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold">
                  <Plus size={16} /> {isBn ? "নতুন ট্রেড এন্ট্রি" : "Log New Trade"}
                </Button>
              </div>

              {/* Journal Filter & Search Bar */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search journal entries by pair, strategy setup, or notes..."
                    value={journalSearch}
                    onChange={(e) => setJournalSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {(["all", "Win", "Loss", "Breakeven"] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setJournalFilter(res)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        journalFilter === res
                          ? "bg-[#081833] text-white dark:bg-sky-500 dark:text-slate-950"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {res === "all" ? "All Logs" : res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Entries Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {filteredJournals.length ? (
                  filteredJournals.map((j: any) => (
                    <div key={j.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-base">{j.title}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-0.5 text-xs font-black uppercase ${
                                j.result?.toLowerCase() === "win"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                  : j.result?.toLowerCase() === "loss"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                  : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {j.result || "Logged"}
                            </span>
                            <button
                              onClick={() => deleteJournalMutation.mutate({ id: j.id })}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="Delete log"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <span>{j.setup || "Setup"}</span>
                        </div>
                        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{j.content}</p>
                      </div>

                      <div className="mt-6 border-t border-slate-100 pt-3 text-[11px] font-mono text-slate-400 dark:border-slate-800">
                        {new Date(j.createdAt).toLocaleDateString()} • Log #{j.id}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-slate-800">
                    <NotebookPen size={36} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="font-bold text-base">{isBn ? "কোনো জার্নাল এন্ট্রি পাওয়া যায়নি" : "No trade logs found"}</h3>
                    <p className="mt-1 text-xs text-slate-400">{isBn ? "উপরে থাকা 'নতুন ট্রেড এন্ট্রি' বাটনে ক্লিক করে প্রথম ট্রেড রেকর্ড করুন।" : "Click 'Log New Trade' above to record your setup analysis."}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: DAILY DISCIPLINE */}
          {/* ========================================================================= */}
          {tab === "discipline" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "ডেইলি ডিসিপ্লিন ও রুটিন চেকলিস্ট" : "Daily Trader Discipline & Routine"}</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {isBn ? "একজন প্রফেশনাল ট্রেডার প্রতিদিন মার্কেট ওপেন হওয়ার আগে এই রুলসগুলো মেনে চলে।" : "Execute the disciplined trading habit loop daily: Analyze → Filter Risk → Execute Rules → Journal."}
                </p>
              </div>

              <div className="grid gap-3 max-w-2xl">
                {DAILY_DISCIPLINE_RULES.map((rule) => {
                  const isChecked = discipline?.some((d: any) => d.label === rule.id && d.completed);
                  return (
                    <button
                      key={rule.id}
                      onClick={() => toggleDisciplineMutation.mutate({ label: rule.id, date: today, completed: !isChecked })}
                      className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                        isChecked
                          ? "border-emerald-300 bg-emerald-50/50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-300 dark:text-slate-600" />}
                      </div>
                      <div>
                        <div className={`text-sm font-extrabold ${isChecked ? "line-through opacity-80" : ""}`}>{isBn ? rule.textBn : rule.textEn}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{isBn ? "দৈনিক অভ্যাস" : "Daily Habit"}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: ORDERS & PAYMENT HISTORY */}
          {/* ========================================================================= */}
          {tab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "পেমেন্ট ও অর্ডার হিস্ট্রি" : "Orders & Manual Verification History"}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isBn ? "আপনার বিকাশ, নগদ ও রকেট অর্ডারের ভেরিফিকেশন স্ট্যাটাস ও ইনভয়েস।" : "Track your manual payment verification statuses and generate official receipts."}
                  </p>
                </div>

                <Link href="/checkout">
                  <Button size="sm" className="bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold">
                    <Plus size={15} className="mr-1" /> {isBn ? "নতুন অর্ডার করুন" : "New Order"}
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {orders?.length ? (
                  orders.map((o: any) => (
                    <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-base">Order #{o.id}</span>
                          <span className="font-mono text-xs text-slate-400">TxID: {o.transactionId}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 flex items-center gap-3">
                          <span>{isBn ? "পদ্ধতি:" : "Method:"} <b className="uppercase text-slate-700 dark:text-slate-300">{o.paymentMethod}</b></span>
                          <span>•</span>
                          <span>{isBn ? "তারিখ:" : "Date:"} {new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <div className="text-lg font-black">৳{o.amount}</div>
                          <div className="text-[10px] text-slate-400">BDT</div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                            o.orderStatus === "approved"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : o.orderStatus === "rejected"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          }`}
                        >
                          {o.orderStatus === "approved" ? (isBn ? "অনুমোদিত" : "Approved") : o.orderStatus === "rejected" ? (isBn ? "বাতিল" : "Rejected") : (isBn ? "যাচাই প্রক্রিয়াধীন" : "Pending Review")}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedInvoiceOrder(o)}
                          className="gap-1 text-xs font-bold border-slate-300 dark:border-slate-700"
                        >
                          <Printer size={13} />
                          <span>Receipt</span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-slate-800">
                    <Receipt size={36} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="font-bold text-base">{isBn ? "এখনো কোনো অর্ডার নেই" : "No orders found"}</h3>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: SUPPORT DESK */}
          {/* ========================================================================= */}
          {tab === "support" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{isBn ? "সাপোর্ট ও সহায়তা ডেস্ক" : "Student Support & Inquiries"}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isBn ? "পেমেন্ট বা রিসোর্স অ্যাক্সেসে কোনো সমস্যা হলে টিকিট ওপেন করুন।" : "Need help with orders, course materials, or payments? Open a direct inquiry ticket."}
                  </p>
                </div>

                <Button onClick={() => setShowNewTicketModal(true)} size="sm" className="gap-1.5 bg-[#081833] text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 font-bold">
                  <Plus size={16} /> {isBn ? "নতুন টিকিট তৈরি করুন" : "Open Ticket"}
                </Button>
              </div>

              <div className="space-y-3">
                {tickets?.length ? (
                  tickets.map((t: any) => (
                    <div key={t.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-base">{t.subject}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase">{t.status}</span>
                      </div>
                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.message}</p>
                      <div className="mt-4 text-[10px] font-mono text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-slate-800">
                    <ShieldCheck size={36} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="font-bold text-base">{isBn ? "কোনো ওপেন টিকিট নেই" : "No support tickets found"}</h3>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 12-STAGE ROADMAP DEEP DIVE MODAL */}
      {/* ========================================================================= */}
      {selectedRoadmapStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedRoadmapStage(null)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-sky-100 px-2.5 py-0.5 text-xs font-black text-sky-800 dark:bg-sky-950 dark:text-sky-400">
                  STAGE {String(selectedRoadmapStage.num).padStart(2, "0")}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {selectedRoadmapStage.catEn}
                </span>
              </div>
              <button onClick={() => setSelectedRoadmapStage(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <h3 className="text-xl font-black">{isBn ? selectedRoadmapStage.titleBn : selectedRoadmapStage.titleEn}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {isBn ? selectedRoadmapStage.descBn : selectedRoadmapStage.descEn}
                </p>
              </div>

              {/* Core Execution Rules */}
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 space-y-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-[#0284c7] dark:text-sky-400">
                  {isBn ? "কোর এক্সিকিউশন রুলস:" : "Core Institutional Rules:"}
                </div>
                {selectedRoadmapStage.rules.map((r: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* Personal Notes Box */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {isBn ? "এই স্টেজে আপনার ব্যক্তিগত স্টাডি নোট:" : "Personal Study Notes for this Stage:"}
                </label>
                <textarea
                  rows={3}
                  placeholder={isBn ? "চার্ট ব্যাকটেস্টিং বা ব্যক্তিগত পর্যবেক্ষণ এখানে লিখে রাখুন..." : "Type your chart backtest observations and insights here..."}
                  value={stageNotes[selectedRoadmapStage.num] || ""}
                  onChange={(e) => handleSaveStageNote(selectedRoadmapStage.num, e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => {
                    const isDone = progress?.some((p: any) => p.lessonId === selectedRoadmapStage.num && p.completed);
                    toggleProgressMutation.mutate({ lessonId: selectedRoadmapStage.num, completed: !isDone });
                  }}
                  className="w-full bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950"
                >
                  {progress?.some((p: any) => p.lessonId === selectedRoadmapStage.num && p.completed)
                    ? (isBn ? "সম্পন্ন টিক তুলে নিন" : "Mark as Uncompleted")
                    : (isBn ? "এই স্টেজ সম্পন্ন হয়েছে ✓" : "Mark Stage as Completed ✓")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PDF PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={() => setPreviewPdfModal(null)}>
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0284c7] dark:text-sky-400">INSTITUTIONAL CHEAT-SHEET</span>
                <h3 className="text-base font-extrabold mt-0.5">{previewPdfModal.title}</h3>
              </div>
              <button onClick={() => setPreviewPdfModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs leading-relaxed">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-3">
                <div className="font-extrabold text-slate-800 dark:text-slate-200">
                  {previewPdfModal.subtitle}
                </div>
                <div className="space-y-2">
                  {previewPdfModal.keyConcepts.map((c: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-100 font-mono text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-400">
                        {idx + 1}
                      </span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleDownloadResource(previewPdfModal)}
                  className="w-full gap-1.5 bg-[#081833] text-xs font-bold text-white dark:bg-sky-500 dark:text-slate-950"
                >
                  <Download size={14} />
                  <span>Download Full Guide (.txt)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LOG TRADE MODAL */}
      {/* ========================================================================= */}
      {showNewJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowNewJournalModal(false)}>
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-extrabold">{isBn ? "নতুন ট্রেড জার্নাল এন্ট্রি" : "Log Trade Setup"}</h3>
              <button onClick={() => setShowNewJournalModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!journalTitle.trim() || !journalContent.trim()) return;
                createJournalMutation.mutate({
                  title: `${journalPair} ${journalTitle.trim()}`,
                  content: journalContent.trim(),
                  setup: `${journalSetup} (${journalSession}) · RR: ${journalRR}`,
                  result: journalResult,
                });
              }}
              className="mt-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Trading Pair</label>
                  <select
                    value={journalPair}
                    onChange={(e) => setJournalPair(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option>EUR/USD</option>
                    <option>GBP/USD</option>
                    <option>USD/JPY</option>
                    <option>XAU/USD (Gold)</option>
                    <option>BTC/USD</option>
                    <option>ETH/USD</option>
                    <option>NAS100</option>
                    <option>US30</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Direction & Setup</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Long 1:3.5 RR"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Strategy Model</label>
                  <select
                    value={journalSetup}
                    onChange={(e) => setJournalSetup(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option>CRT Range Model</option>
                    <option>SMC Order Block (OB)</option>
                    <option>Liquidity Sweep (BSL/SSL)</option>
                    <option>CHoCH Trend Reversal</option>
                    <option>Break & Retest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Outcome</label>
                  <select
                    value={journalResult}
                    onChange={(e) => setJournalResult(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Win">Win (লাভ 🏆)</option>
                    <option value="Loss">Loss (লস 🛑)</option>
                    <option value="Breakeven">Breakeven (সমান ⚪)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Trade Logic, Discipline & Reflection</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Why did you take this trade? Did you stick to your 1% risk rule? Any emotional hesitation?"
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <Button type="submit" disabled={createJournalMutation.isPending} className="w-full bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                {createJournalMutation.isPending ? "Saving..." : isBn ? "জার্নালে সংরক্ষণ করুন" : "Save to Journal"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE INVOICE / RECEIPT MODAL */}
      {/* ========================================================================= */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BrandLogo size={28} />
                <span className="text-xs font-black tracking-widest uppercase">OFFICIAL RECEIPT</span>
              </div>
              <button onClick={() => setSelectedInvoiceOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Invoice Number</div>
                  <div className="font-mono font-bold text-sm">#INV-COC-{selectedInvoiceOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Date</div>
                  <div className="font-bold">{new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer ID:</span>
                  <span className="font-bold">Student #{selectedInvoiceOrder.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Gateway:</span>
                  <span className="font-bold uppercase">{selectedInvoiceOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold">{selectedInvoiceOrder.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                    {selectedInvoiceOrder.orderStatus}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                <span className="font-bold">Total Paid:</span>
                <span className="text-xl font-black text-[#081833] dark:text-white">৳{selectedInvoiceOrder.amount} BDT</span>
              </div>

              <Button onClick={() => window.print()} className="w-full gap-2 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950">
                <Printer size={14} />
                <span>Print Official Invoice</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPEN SUPPORT TICKET MODAL */}
      {/* ========================================================================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowNewTicketModal(false)}>
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-extrabold">{isBn ? "নতুন সাপোর্ট টিকিট" : "Open Support Ticket"}</h3>
              <button onClick={() => setShowNewTicketModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!ticketSubject.trim() || !ticketMessage.trim()) return;
                createTicketMutation.mutate({ subject: `[${ticketCategory}] ${ticketSubject.trim()}`, message: ticketMessage.trim() });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  <option>Payment Verification</option>
                  <option>Resource / eBook Access</option>
                  <option>Roadmap Clarification</option>
                  <option>Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{isBn ? "বিষয়" : "Subject"}</label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? "যেমন: পেমেন্ট ভেরিফিকেশন সহায়তা" : "e.g. Need assistance with eBook download"}
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{isBn ? "বিস্তারিত বিবরণ" : "Message"}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={isBn ? "আপনার সমস্যার বিস্তারিত লিখুন..." : "Describe your inquiry or issue in detail..."}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#0284c7] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <Button type="submit" disabled={createTicketMutation.isPending} className="w-full bg-[#081833] font-bold text-white dark:bg-sky-500 dark:text-slate-950">
                {createTicketMutation.isPending ? "Submitting..." : isBn ? "টিকিট জমা দিন" : "Submit Ticket"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
