import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  CircleHelp,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
  Layers,
  Sun,
  Moon,
  Compass,
  ShoppingBag,
  Target,
  CheckCircle2,
  AlertOctagon,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { HeroCandle3D } from "@/components/HeroCandle3D";
import { useTheme } from "@/contexts/ThemeContext";

export type StageDetail = {
  num: string;
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  exercise: string;
  edge: string;
};

const STAGES_DETAILS_EN: StageDetail[] = [
  {
    num: "01",
    title: "Trading Foundation",
    category: "MARKET ESSENTIALS",
    summary:
      "Before risking a single dollar, master how financial markets operate, the mechanics of Forex and Crypto, and why strict risk-to-reward ratio dictates long-term survival.",
    keyPoints: [
      "Market participants: Central Banks & Institutions vs Retail traders",
      "Pip value, leverage, spread and margin calculations",
      "Risk-to-Reward Ratio (1:2 and 1:3 minimum setup rule)",
      "Drawdown mathematics & true capital preservation principles",
    ],
    exercise: "Open a demo chart and calculate exact 1% account risk sizing across 3 different currency/crypto pairs.",
    edge: "Traders who master foundational risk calculations survive the first 6 months while 90% blow their capital.",
  },
  {
    num: "02",
    title: "Candlesticks & Price Action",
    category: "CHART ANATOMY",
    summary:
      "Read the raw order flow battle between buyers and sellers behind every candle, moving far beyond superficial pattern names to understand real momentum.",
    keyPoints: [
      "Candle anatomy: Open, High, Low, Close and Body-to-Wick ratio dynamics",
      "High momentum institutional bars vs exhaustion rejection wicks",
      "Displacement candles indicating smart money participation",
      "Multi-timeframe story correlation (Monthly down to 5-Minute)",
    ],
    exercise: "Spot 5 high-volume displacement candles on a 1H chart and note where price consolidated next.",
    edge: "Candles don't predict the future; they reveal where institutions entered with high volume.",
  },
  {
    num: "03",
    title: "Chart Patterns & Market Context",
    category: "STRUCTURE CONTEXT",
    summary:
      "Understand chart patterns strictly inside market context. Discover why standard textbook retail patterns fail when institutional liquidity sweeps them.",
    keyPoints: [
      "High-probability Reversal patterns (Quasimodo, Double Top/Bottom sweeps)",
      "Trend Continuation patterns (Bull/Bear flags, ascending compression)",
      "Engineered false breakout traps designed to harvest retail stop losses",
      "Confluence with higher timeframe institutional trend direction",
    ],
    exercise: "Locate 3 failed head & shoulders or trendline breaks and observe where the trapped liquidity went.",
    edge: "Retail traders trade pattern shapes; institutional traders trade the liquidity resting beyond the pattern.",
  },
  {
    num: "04",
    title: "Market Structure",
    category: "THE COMPASS",
    summary:
      "The definitive framework of technical analysis. Map the true trend direction through validated Higher Highs, Lower Lows, Break of Structure (BOS), and Change of Character (CHoCH).",
    keyPoints: [
      "Strict validation rules for genuine swing highs and swing lows",
      "Break of Structure (BOS) indicating genuine trend continuation",
      "Change of Character (CHoCH) as the earliest structural reversal warning",
      "Internal intraday structure vs External higher-timeframe swing structure",
    ],
    exercise: "Map the Daily and 4-Hour market structure on EUR/USD or BTC without any indicator overlays.",
    edge: "When your intraday entries align with higher timeframe structure, trade win-rate and RR skyrocket.",
  },
  {
    num: "05",
    title: "Support & Resistance",
    category: "KEY REACTION ZONES",
    summary:
      "Stop drawing random horizontal lines across your chart. Learn structural support and resistance levels that institutional order flow actually respects.",
    keyPoints: [
      "Major swing highs/lows vs minor intraday noise levels",
      "Polarity flip zones (Previous resistance turning into institutional support)",
      "Clean Break & Retest execution rules with volume confirmation",
      "Psychological whole numbers & institutional reaction zones",
    ],
    exercise: "Mark 3 key weekly support/resistance levels and observe the exact price behavior upon touch.",
    edge: "True support/resistance isn't a single line; it is an institutional pricing zone of supply and demand.",
  },
  {
    num: "06",
    title: "Liquidity Concepts",
    category: "MARKET FUEL",
    summary:
      "Liquidity is the fuel of financial markets. Learn where retail stop-losses sit (Buy-Side & Sell-Side Liquidity) and how smart money engineers liquidity sweeps.",
    keyPoints: [
      "Buy-Side Liquidity (BSL) resting above obvious swing highs and double tops",
      "Sell-Side Liquidity (SSL) resting below obvious swing lows and double bottoms",
      "Engineered Equal Highs (EQH) and Equal Lows (EQL) manipulation",
      "Recognizing a liquidity sweep (stop hunt) vs a genuine market breakout",
    ],
    exercise: "Identify 3 recent 15-minute liquidity sweeps and observe the explosive reversal that followed.",
    edge: "Once you know where retail stop losses rest, you stop becoming the liquidity and start trading with institutions.",
  },
  {
    num: "07",
    title: "Smart Money Concepts (SMC)",
    category: "INSTITUTIONAL FOOTPRINT",
    summary:
      "Decode how bank algorithms accumulate and distribute massive volume using Order Blocks, Imbalances, and Fair Value Gaps (FVG).",
    keyPoints: [
      "High-probability Bullish & Bearish Order Blocks (OB) with displacement",
      "Fair Value Gaps (FVG) and institutional liquidity imbalances",
      "Breaker blocks, Mitigation blocks & dynamic premium/discount pricing",
      "High Risk-to-Reward entry optimization using institutional footprints",
    ],
    exercise: "Find 3 unmitigated Fair Value Gaps on a 1-Hour chart and track price reaction when returning to fill them.",
    edge: "Order blocks represent institutional sponsorship. Entering at mitigated OBs delivers sniper precision.",
  },
  {
    num: "08",
    title: "ICT Algorithmic Models",
    category: "TIME & PRICE THEORY",
    summary:
      "Master Inner Circle Trader (ICT) concepts, London & New York session timings, algorithmic killzones, and high-probability Optimal Trade Entries (OTE).",
    keyPoints: [
      "The Judas Swing: Session opening false manipulations",
      "London Open Killzone & New York Open Killzone timings",
      "Optimal Trade Entry (OTE) utilizing the 62% - 79% Fibonacci retracement",
      "Power of 3 (AMD: Accumulation, Manipulation, Distribution) model",
    ],
    exercise: "Track the London session high/low sweep during the New York Open killzone for 5 consecutive days.",
    edge: "Timing is everything. High-probability setups happen at specific times of the day, not randomly.",
  },
  {
    num: "09",
    title: "CRT Range Model",
    category: "CYCLE SIGNATURE",
    summary:
      "Cycle of Chart's proprietary Candle Range Theory (CRT). Decode how weekly and daily candles open, manipulate, expand, and deliver precision targets.",
    keyPoints: [
      "Candle Open manipulation mechanics (Daily / Weekly opening range)",
      "Expansion phase forecasting and precision target projection",
      "Lower timeframe structural confirmation inside higher timeframe CRT",
      "Fast invalidation rules and objective stop-loss placement",
    ],
    exercise: "Backtest 10 weekly CRT candle expansions and document their target hit rate.",
    edge: "CRT provides a visual blueprint of the next expected candle movement before it unfolds.",
  },
  {
    num: "10",
    title: "Money & Risk Management",
    category: "SURVIVAL MATHEMATICS",
    summary:
      "The only mathematical framework that guarantees long-term survival. Protect your capital with fixed percentage risk models and strict drawdown limits.",
    keyPoints: [
      "The Golden 1% account risk per trade rule (Never deviate)",
      "Dynamic position size calculation based on exact stop-loss distance",
      "Max daily drawdown caps to completely prevent revenge trading",
      "Scaling out partial profits and systematic trailing stop strategies",
    ],
    exercise: "Create a risk calculator spreadsheet customized to your exact account size and stop-loss pips.",
    edge: "With a 1:3 RR model, you only need a 35% win rate to be consistently profitable.",
  },
  {
    num: "11",
    title: "Trading Psychology",
    category: "EMOTIONAL MASTERY",
    summary:
      "Master your mind. Eliminate FOMO, fear of losing, greed, and revenge trading. Build an unshakeable probability-based trading mindset.",
    keyPoints: [
      "Accepting losses as standard, unavoidable operating business costs",
      "Eliminating execution fear, hesitation, and second-guessing",
      "Staying emotionally neutral during winning streaks and losing streaks",
      "Mark Douglas's disciplined trader mindset principles",
    ],
    exercise: "Write down your top 3 emotional trading impulses and establish concrete rules to neutralize them.",
    edge: "Your technical analysis gets you into the trade; your emotional discipline determines your final P&L.",
  },
  {
    num: "12",
    title: "Execution & Routine",
    category: "THE REPEATABLE LOOP",
    summary:
      "Transform your knowledge into an institutional daily routine. Analysis → Setup Selection → Risk Check → Execution → Journaling → Weekly Review.",
    keyPoints: [
      "Pre-market checklist: High-impact economic news filter & macro bias",
      "Strict trade execution rules without emotional overrides",
      "The Trading Journal: Capturing setup screenshots, emotional state & metrics",
      "Weekly performance audits to continuously refine your edge",
    ],
    exercise: "Maintain a comprehensive trading journal for 20 consecutive trades before increasing capital size.",
    edge: "Professional traders do not gamble; they execute a boring, repeatable, highly disciplined business process.",
  },
];

const STAGES_DETAILS_BN: StageDetail[] = [
  {
    num: "০১",
    title: "ট্রেডিং ফাউন্ডেশন",
    category: "মার্কেট বেসিকস",
    summary:
      "বাস্তব মূলধন ঝুঁকিতে ফেলার আগে গ্লোবাল ফিন্যান্সিয়াল মার্কেট কিভাবে কাজ করে, ফরেক্স ও ক্রিপ্টোর মেকানিক্স এবং কেন রিস্ক-টু-রিওয়ার্ড রেশিও দীর্ঘমেয়াদে টিকে থাকার প্রধান চাবিকাঠি তা জানুন।",
    keyPoints: [
      "মার্কেট পার্টিসিপেন্টস: সেন্ট্রাল ব্যাংক ও ইন্সটিটিউশন বনাম রিটেইল ট্রেডার্স",
      "পিপ ভ্যালু, লেভারেজ, স্প্রেড ও মার্জিনের নির্ভুল হিসাব পদ্ধতি",
      "রিস্ক-টু-রিওয়ার্ড রেশিও (১:২ এবং ১:৩ মিনিমাম সেটআপ রুল)",
      "ড্রডাউন ম্যাথমেটিক্স এবং মূলধন বাঁচিয়ে রাখার মূলনীতি",
    ],
    exercise: "একটি ডেমো চার্ট ওপেন করে ৩টি ভিন্ন কারেন্সি পেয়ারে ১% একাউন্ট রিস্ক ও লট সাইজ হিসাব করুন।",
    edge: "ফাউন্ডেশনাল রিস্ক কন্ট্রোল জানা ট্রেডাররা প্রথম ৬ মাসে টিকে থাকে, যেখানে ৯০% মানুষ ভুল রিস্কে একাউন্ট জিরো করে।",
  },
  {
    num: "০২",
    title: "ক্যান্ডেলস্টিক ও প্রাইস অ্যাকশন",
    category: "চার্ট অ্যানাটমি",
    summary:
      "শুধুমাত্র মুখস্থ নাম না শিখে প্রতিটি ক্যান্ডেলের পেছনের বায়ার্স ও সেলার্সের আসল অর্ডার ফ্লো মোমেন্টাম এবং শক্তির লড়াই বুঝতে শিখুন।",
    keyPoints: [
      "ক্যান্ডেল অ্যানাটমি: Open, High, Low, Close এবং বডি বনাম উইক রেশিও",
      "মোমেন্টাম ক্যান্ডেল বনাম রিজেকশন উইকের শক্তি অ্যানালাইসিস",
      "ইন্সটিটিউশনাল ডিসপ্লেসমেন্ট ক্যান্ডেল চেনার কৌশল",
      "হায়ার টাইমফ্রেম থেকে লোয়ার টাইমফ্রেম ক্যান্ডেলস্টিক স্টোরিটেলিং",
    ],
    exercise: "১ ঘণ্টার চার্টে ৫টি স্ট্রং ডিসপ্লেসমেন্ট ক্যান্ডেল শনাক্ত করে প্রাইসের পরবর্তী মুভমেন্ট পর্যবেক্ষণ করুন।",
    edge: "ক্যান্ডেলস্টিক ভবিষ্যৎ বলে না; এটি দেখায় বড় ব্যাংক ও ইন্সটিটিউশন কোন প্রাইসে ভলিউম প্রবেশ করিয়েছে।",
  },
  {
    num: "০৩",
    title: "চার্ট প্যাটার্নস ও মার্কেট কনটেক্সট",
    category: "স্ট্রাকচার কনটেক্সট",
    summary:
      "অন্ধভাবে প্যাটার্ন ট্রেড না করে মার্কেট কনটেক্সটের সাথে প্যাটার্ন বুঝতে শিখুন। কেন বেশিরভাগ রিটেইল চার্ট প্যাটার্ন ফেইল করে তা আবিষ্কার করুন।",
    keyPoints: [
      "হাই-প্রবাবিলিটি রিভার্সাল প্যাটার্নস (কোয়াসিমোডো, ডাবল টপ/বটম সুইপ)",
      "ট্রেন্ড কন্টিনিউয়েশন প্যাটার্নস (বুল/বেয়ার ফ্ল্যাগ, অ্যাসেন্ডিং ট্রায়াঙ্গেল)",
      "ফলস ব্রেকআউট ট্র্যাপ যা রিটেইলদের ফাঁদে ফেলতে তৈরি করা হয়",
      "হায়ার টাইমফ্রেম মূল ট্রেন্ডের সাথে কনফ্লুয়েন্স নেওয়া",
    ],
    exercise: "৩টি ফেইলড চার্ট প্যাটার্ন খুঁজে বের করে দেখুন কীভাবে রিটেইল স্টপলস শিকার করা হয়েছে।",
    edge: "সাধারণ মানুষ শুধু প্যাটার্নের ছবি দেখে ট্রেড করে, আর প্রফেশনালরা দেখে প্যাটার্নের পেছনের লিকুইডিটি কোথায় আছে।",
  },
  {
    num: "০৪",
    title: "মার্কেট স্ট্রাকচার",
    category: "প্রধান কম্পাস",
    summary:
      "টেকনিক্যাল অ্যানালাইসিসের প্রধান ভিত্তি। Higher High, Lower Low, Break of Structure (BOS) এবং Change of Character (CHoCH) দিয়ে মার্কেটের আসল ডিরেকশন ধরুন।",
    keyPoints: [
      "ভ্যালিড সুইং হাই ও সুইং লো যাচাই করার অকাট্য নিয়ম",
      "Break of Structure (BOS) বনাম লিকুইডিটি সুইপের পার্থক্য",
      "Change of Character (CHoCH) রিভার্সাল সিগন্যাল বোঝা",
      "ইন্টারনাল ইন্ট্রাডে স্ট্রাকচার বনাম এক্সটারনাল সুইং স্ট্রাকচার",
    ],
    exercise: "কোনো ইন্ডিকেটর ছাড়া EUR/USD বা ক্রিপ্টো চার্টে Daily ও 4-Hour মার্কেট স্ট্রাকচার ড্র করুন।",
    edge: "যখন আপনার এন্ট্রি হায়ার টাইমফ্রেম স্ট্রাকচারের সাথে মিলে যাবে, আপনার উইন-রেট বহুগুণ বেড়ে যাবে।",
  },
  {
    num: "০৫",
    title: "সাপোর্ট ও রেজিস্ট্যান্স",
    category: "কি রিঅ্যাকশন জোন",
    summary:
      "চার্টজুড়ে এলোমেলো লাইন টানা বন্ধ করে ইন্সটিটিউশনাল স্ট্রাকচার-ভিত্তিক রিয়েল সাপোর্ট ও রেজিস্ট্যান্স লেভেল চিহ্নিত করুন।",
    keyPoints: [
      "মেজর সুইং লেভেলস বনাম মাইনর ইন্ট্রাডে নয়েজ লেভেল",
      "পোলারিটি ফ্লিপ জোন (পূর্ববর্তী রেজিস্ট্যান্স সাপোর্টে রূপান্তর)",
      "ব্রেক অ্যান্ড রিটেস্টের সুনির্দিষ্ট কনফার্মেশন রুলস",
      "সাইকোলজিক্যাল হোল নাম্বার ও ইন্সটিটিউশনাল রিঅ্যাকশন জোন",
    ],
    exercise: "উইকলি চার্টে ৩টি মেজর লেভেল চিহ্নিত করে প্রাইস সেখানে পৌঁছালে কেমন আচরণ করে তা দেখুন।",
    edge: "সাপোর্ট ও রেজিস্ট্যান্স কোনো একক লাইন নয়; এটি হলো সাপ্লাই ও ডিমান্ডের ইন্সটিটিউশনাল জোন।",
  },
  {
    num: "০৬",
    title: "লিকুইডিটি কনসেপ্টস",
    category: "মার্কেট ফুয়েল",
    summary:
      "লিকুইডিটি হলো মার্কেটের আসল জ্বালানি। রিটেইল ট্রেডারদের স্টপলস কোথায় জমা থাকে (BSL ও SSL) এবং স্মার্ট মানি কীভাবে তা সুইপ করে তা বুঝুন।",
    keyPoints: [
      "সুইং হাইয়ের ওপর Buy-Side Liquidity (BSL) পুল বিশ্লেষণ",
      "সুইং লোয়ের নিচে Sell-Side Liquidity (SSL) পুল বিশ্লেষণ",
      "ইকুয়াল হাই (EQH) ও ইকুয়াল লো (EQL) ম্যানিপুলেশন",
      "লিকুইডিটি সুইপ (স্টপ হান্ট) বনাম আসল ব্রেকআউট চেনার উপায়",
    ],
    exercise: "১৫ মিনিটের চার্টে ৩টি সাম্প্রতিক লিকুইডিটি সুইপ আইডেন্টিফাই করে রিভার্সাল মুভ নোট করুন।",
    edge: "স্টপলস কোথায় জমা থাকে তা জানলে আপনি নিজে লিকুইডিটি না হয়ে স্মার্ট মানির সাথে ট্রেড করতে পারবেন।",
  },
  {
    num: "০৭",
    title: "স্মার্ট মানি কনসেপ্ট (SMC)",
    category: "ইন্সটিটিউশনাল ফুটপ্রিন্ট",
    summary:
      "ইন্সটিটিউশনাল অ্যালগরিদম কীভাবে অর্ডার ব্লক ও ফেয়ার ভ্যালু গ্যাপ (FVG) দিয়ে মার্কেট নিয়ন্ত্রণ করে তা ডিকোড করুন।",
    keyPoints: [
      "হাই-প্রবাবিলিটি বুলিশ ও বেয়ারিশ অর্ডার ব্লক (OB) নির্ণয়",
      "ফেয়ার ভ্যালু গ্যাপ (FVG) এবং ইমব্যালেন্স থিওরি",
      "ব্রেকার ব্লক ও প্রিমিয়াম/ডিসকাউন্ট প্রাইসিং মডেল",
      "স্মার্ট মানি ফুটপ্রিন্ট দিয়ে হাই রিস্ক-টু-রিওয়ার্ড সেটআপ গঠন",
    ],
    exercise: "চার্টে ৩টি আনমিটিগেটেড FVG চিহ্নিত করে প্রাইস সেটা ফিল করার পর কেমন আচরণ করে তা ব্যাকটেস্ট করুন।",
    edge: "অর্ডার ব্লক হলো বড় ব্যাংকের এন্ট্রির প্রমাণ। এটি জেনে ট্রেড করলে স্নাইপার এন্ট্রি পাওয়া যায়।",
  },
  {
    num: "০৮",
    title: "আইসিটি (ICT) মডেলস",
    category: "টাইম ও প্রাইস থিওরি",
    summary:
      "ইনার সার্কেল ট্রেডার (ICT) টাইম ও প্রাইস থিওরি, লন্ডন ও নিউইয়র্ক সেশন টাইমিং এবং অ্যালগরিদমিক কিলজোন মাস্টার করুন।",
    keyPoints: [
      "জুডাস সুইং (Judas Swing) ও সেশন ওপেনিং ম্যানিপুলেশন",
      "লন্ডন ওপেন এবং নিউ ইয়র্ক ওপেন কিলজোন টাইমিং",
      "ফিবোনাচ্চি অপটিমাল ট্রেড এন্ট্রি (OTE) মডেল (৬২% - ৭৯%)",
      "পাওয়ার অব ৩ (AMD: Accumulation, Manipulation, Distribution)",
    ],
    exercise: "টানা ৫ দিন নিউ ইয়র্ক সেশনে লন্ডন সেশনের হাই/লো সুইপ কীভাবে রিঅ্যাক্ট করে তা ট্র্যাক করুন।",
    edge: "ট্রেডিংয়ে টাইমিং সবচেয়ে গুরুত্বপূর্ণ। সেরা সেটআপগুলো দিনের নির্দিষ্ট কিলজোনেই তৈরি হয়।",
  },
  {
    num: "০৯",
    title: "সিআরটি (CRT) মডেল",
    category: "সাইকেল সিগনেচার",
    summary:
      "সাইকেল অব চার্টের স্পেশালাইজড ক্যান্ডেল রেঞ্জ থিওরি (CRT)। ডেইলি ও উইকলি ক্যান্ডেলের এক্সপ্যানশন এবং প্রেসিসন এন্ট্রি মেকানিক্স।",
    keyPoints: [
      "ক্যান্ডেল ওপেনিং ম্যানিপুলেশন মেকানিক্স (Daily / Weekly Open)",
      "এক্সপ্যানশন ফেজ ও টার্গেট প্রজেকশন কৌশল",
      "হায়ার টাইমফ্রেম CRT-র ভেতর লোয়ার টাইমফ্রেম কনফার্মেশন",
      "ইনভ্যালিডেশন পয়েন্ট ও দ্রুত রিস্ক এক্সিট প্ল্যান",
    ],
    exercise: "১০টি উইকলি CRT ক্যান্ডেল সেটআপ ব্যাকটেস্ট করে টার্গেট হিট রেট রেকর্ড করুন।",
    edge: "CRT মডেল ক্যান্ডেলটি তৈরি হওয়ার আগেই তার সম্ভাব্য মুভমেন্টের একটি পরিষ্কার রোডম্যাপ দেয়।",
  },
  {
    num: "১০",
    title: "মানি ও রিস্ক ম্যানেজমেন্ট",
    category: "টিকে থাকার গণিত",
    summary:
      "ট্রেডিংয়ে টিকে থাকার একমাত্র ম্যাথমেটিক্যাল অস্ত্র। ফিক্সড পার্সেন্টেজ রিস্ক মডেল দিয়ে মূলধন সুরক্ষিত রাখুন।",
    keyPoints: [
      "প্রতি ট্রেডে সর্বোচ্চ ১% একাউন্ট রিস্কের অপরিবর্তনীয় নিয়ম",
      "স্টপলস দূরত্বের ওপর ভিত্তি করে সঠিক লট সাইজ নির্ধারণ",
      "রিভেঞ্জ ট্রেডিং রুখতে ম্যাক্সিমাম ডেইলি লস লিমিট রুল",
      "স্কেলিং আউট প্রফিট বুকিং ও ট্রেইলিং স্টপলস টেকনিক",
    ],
    exercise: "আপনার একাউন্ট সাইজ অনুযায়ী একটি কাস্টম রিস্ক ক্যালকুলেটর শিট তৈরি করুন।",
    edge: "১:৩ রিস্ক-রিওয়ার্ডে মাত্র ৩৫% উইন-রেট থাকলেও একাউন্ট নিয়মিত গ্রো করে।",
  },
  {
    num: "১১",
    title: "ট্রেডিং সাইকোলজি",
    category: "ইমোশন কন্ট্রোল",
    summary:
      "নিজের মনকে নিয়ন্ত্রণ করুন। ফোমো (FOMO), লস হওয়ার ভয়, রিভেঞ্জ ট্রেডিং দূর করে একজন পেশাদার প্রবাবিলিটি মাইন্ডসেট তৈরি করুন।",
    keyPoints: [
      "লসকে ব্যবসার স্বাভাবিক ইনভেস্টমেন্ট খরচ হিসেবে মেনে নেওয়া",
      "ট্রেড নেওয়ার সময় ভয় ও দ্বিধাদ্বন্দ্ব কাটানোর সুনির্দিষ্ট নিয়ম",
      "টানা লাভ বা লসে অতিরিক্ত আবেগ বর্জন করে নিউট্রাল থাকা",
      "মার্ক ডগলাসের ডিসিপ্লিন্ড ট্রেডার সাইকোলজি প্রিন্সিপালস",
    ],
    exercise: "আপনার ৩টি প্রধান আবেগীয় ভুল ও ফোমোর কারণ লিখে তা ঠেকানোর ৩টি রুল ডায়েরিতে লিখুন।",
    edge: "অ্যানালাইসিস আপনাকে এন্ট্রি এনে দেয়, কিন্তু আপনার ডিসিপ্লিন ঠিক করে আপনি দীর্ঘমেয়াদে লাভবান হবেন কিনা।",
  },
  {
    num: "১২",
    title: "এক্সিকিউশন, জার্নাল ও রুটিন",
    category: "ডেইলি প্রসেস লুপ",
    summary:
      "জ্ঞানকে একটি প্রাতিষ্ঠানিক ডেইলি রুটিনে রূপান্তর করুন। অ্যানালাইসিস → প্ল্যান → এক্সিকিউশন → জার্নালিং → রিভিউ।",
    keyPoints: [
      "প্রি-মার্কেট রুটিন চেকলিস্ট ও হাই-ইমপ্যাক্ট নিউজ ফিল্টারিং",
      "সুনির্দিষ্ট প্ল্যান ছাড়া মার্কেটে কোনো রেন্ডম এন্ট্রি না নেওয়া",
      "ট্রেডিং জার্নাল: চার্টের স্ক্রিনশট, লজিক ও অনুভূতি লিখে রাখা",
      "সাপ্তাহিক পারফরম্যান্স রিভিউ করে নিজের ভুলগুলো শুধরে নেওয়া",
    ],
    exercise: "ক্যাপিটাল বাড়ানোর আগে টানা ২০টি ট্রেডের কমপ্লিট জার্নাল মেইনটেইন করুন।",
    edge: "পেশাদার ট্রেডাররা জুয়া খেলেন না; তারা একটি সুশৃঙ্খল ও ধারাবাহিক ব্যবসায়িক প্রসেস পরিচালনা করেন।",
  },
];

const HYPE_ITEMS_EN = [
  "Social media luxury lifestyle show-off",
  "Influencer get-rich-quick promises",
  "Paid VIP / signal Telegram groups",
  "High leverage gambling & revenge trading",
  "Blind deposits without understanding",
  "Account blowouts & psychological breakdown",
];

const HYPE_ITEMS_BN = [
  "সোশ্যাল মিডিয়া বিলাসবহুল জীবনযাত্রার শো-অফ",
  "রাতারাতি কোটিপতি হওয়ার অবাস্তব প্রলোভন",
  "পেইড ভিআইপি ও সিগন্যাল টেলিগ্রাম গ্রুপ",
  "অতিরিক্ত লেভারেজ নিয়ে জুয়া খেলার মতো ট্রেড",
  "মার্কেট না বুঝে অন্ধের মতো বড় ডিপোজিট",
  "সম্পূর্ণ একাউন্ট জিরো এবং মানসিক হতাশা",
];

const REALITY_ITEMS_EN = [
  "Solid foundation & financial literacy",
  "Structured step-by-step institutional learning",
  "Market structure, liquidity & smart money logic",
  "Strict 1% risk per trade & capital protection",
  "Emotional mastery, patience & discipline",
  "Consistent journaling & continuous process review",
];

const REALITY_ITEMS_BN = [
  "সঠিক ট্রেডিং ফাউন্ডেশন ও মার্কেট লিটারেসি",
  "স্টেপ-বাই-স্টেপ স্ট্রাকচার্ড প্রফেশনাল লার্নিং",
  "মার্কেট স্ট্রাকচার, লিকুইডিটি ও স্মার্ট মানি লজিক",
  "কঠোর রিস্ক ম্যানেজমেন্ট ও মূলধন সুরক্ষা (১% রুল)",
  "ইমোশন কন্ট্রোল, ধৈর্য এবং দীর্ঘমেয়াদী ডিসিপ্লিন",
  "নিয়মিত ট্রেড জার্নালিং ও পারফরম্যান্স রিভিউ",
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 font-semibold">{label}</div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<"en" | "bn">(() => (localStorage.getItem("cycle-language") as "en" | "bn") || "en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [selectedStageModal, setSelectedStageModal] = useState<number | null>(null);
  const { data: bundles } = trpc.public.bundles.useQuery();
  const { data: products } = trpc.public.products.useQuery();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedStageModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const setLanguage = (next: "en" | "bn") => {
    setLang(next);
    localStorage.setItem("cycle-language", next);
  };

  const isBn = lang === "bn";

  const stagesData = isBn ? STAGES_DETAILS_BN : STAGES_DETAILS_EN;
  const activeModalData = selectedStageModal !== null ? stagesData[selectedStageModal] : null;

  const copy = useMemo(
    () =>
      isBn
        ? {
            navRoadmap: "রোডম্যাপ",
            navStore: "স্টোর",
            navFree: "ফ্রি বেসিকস",
            signIn: "সাইন ইন",
            dashboard: "ড্যাশবোর্ড",
            heroEyebrow: "CYCLE OF CHART • TRADING REALITY",
            heroTitle: "Trade করার আগে,\nTrading বুঝুন।",
            heroSubtitle: "ডিপোজিটের আগে মার্কেট স্ট্রাকচার, ক্যান্ডেলস্টিক অ্যানাটমি এবং ডিসিপ্লিন্ড রিস্ক ম্যানেজমেন্ট শিখুন। কোনো সিগন্যাল হাইপ নয়, রিয়েল এডুকেশন।",
            heroBnSub: "আপনার মূলধন সুরক্ষিত রাখুন। পজিশন সাইজের আগে আপনার নলেজ তৈরি হোক।",
            primaryCta: "রোডম্যাপ শুরু করুন",
            secondaryCta: "প্রোডাক্ট দেখুন",
            trust1: "রিস্ক-ফ্রি লার্নিং",
            trust2: "নো সিগন্যাল ট্র্যাপ",
            trust3: "১২টি রিয়েল স্টেজ",
            shiftEyebrow: "দ্য শিফট",
            shiftTitle1: "ট্রেডিং হাইপ",
            shiftTitle2: "বনাম ট্রেডিং রিয়েলিটি।",
            shiftDesc: "মার্কেট তাড়াহুড়ো করাকে পুরস্কৃত করে না। এটি রিওয়ার্ড দেয় সঠিক কনটেক্সট, রিস্ক কন্ট্রোল এবং একটি সুশৃঙ্খল প্রসেসকে।",
            hypeHeader: "ট্রেডিং হাইপ (ফাঁদ)",
            realityHeader: "ট্রেডিং রিয়েলিটি (সত্য)",
            roadmapEyebrow: "দ্য রোডম্যাপ",
            roadmapTitle1: "বিগিনার থেকে",
            roadmapTitle2: "প্রফেশনাল মাইন্ডসেট।",
            roadmapDesc: "শিখুন → প্র্যাকটিস করুন → জার্নাল লিখুন → রিভিউ করুন। আন্দাজে ট্রেড করার অভ্যাস বাদ দিয়ে প্রসেস তৈরি করুন। প্রতিটি কার্ডে ক্লিক করে বিস্তারিত রোডম্যাপ দেখুন।",
            freeEyebrow: "ফ্রি ট্রেডিং বেসিকস",
            freeTitle: "ডিপোজিট দিয়ে নয়,\nশুরু করুন শিক্ষা দিয়ে।",
            freeDesc: "আপনার জন্য একটি স্ট্রাকচার্ড লার্নিং পথ উপযুক্ত কিনা তা সিদ্ধান্ত নেওয়ার আগে সিলেক্টেড ফ্রি লেসনগুলো দেখে নিন।",
            freeCta: "ফ্রি লেসনগুলো দেখুন",
            freeCard1Title: "ক্যান্ডেলস্টিক—নয়েজ ও হাইপ ছাড়া",
            freeCard1Desc: "অ্যানাটমি, মোমেন্টাম, রিজেকশন এবং প্রতিটি ক্যান্ডেলের পেছনের আসল গল্প।",
            freeCard2Title: "প্রাইস কেন রিঅ্যাক্ট করল?",
            freeCard2Desc: "চার্ট রিডিংকে কার্যকর করার সঠিক প্রশ্নগুলো তৈরি করতে শিখুন।",
            storeEyebrow: "দ্য স্টোর",
            storeTitle: "একটি সুশৃঙ্খল ট্রেডিং প্র্যাকটিসের\nজন্য প্রয়োজনীয় রিসোর্স।",
            viewBundle: "বাণ্ডেল দেখুন",
            ebookNotice: "eBook এক্সেস শুধুমাত্র বাণ্ডেলের সাথেই অন্তর্ভুক্ত। আলাদা কোনো eBook বিক্রি হয় না।",
            productsReady: "১৫টি ডিজিটাল লার্নিং রিসোর্স স্টোরের জন্য প্রস্তুত রয়েছে।",
            ctaEyebrow: "আপনার মূলধন, আপনার সিদ্ধান্ত",
            ctaTitle: "আপনার অতিরিক্ত সিগন্যালের প্রয়োজন নেই।\nআপনার প্রয়োজন সঠিক বোঝার ক্ষমতা।",
            ctaButton: "আপনার প্রসেস তৈরি করুন",
            footerDesc: "ট্রেডিং রিয়েলিটি · স্ট্রাকচার্ড ইন্সটিটিউশনাল এডুকেশন",
            footerLegal: "শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে তৈরি। কোনো সিগন্যাল বিক্রি, প্রফিট গ্যারান্টি বা ফিন্যান্সিয়াল অ্যাডভাইস দেওয়া হয় না। ডিপোজিটের আগে ট্রেডিং বুঝুন।",
            modalStageOf: "স্টেজ",
            modalOutOf: "১২টির মধ্যে",
            modalKeyTakeaways: "এই স্টেজে যা যা শিখবেন ও আয়ত্ত করবেন:",
            modalExercise: "প্র্যাকটিক্যাল চার্ট এক্সারসাইজ:",
            modalEdge: "ইন্সটিটিউশনাল এজ:",
            modalPrev: "পূর্ববর্তী স্টেজ",
            modalNext: "পরবর্তী স্টেজ",
            modalClose: "বন্ধ করুন",
            clickPrompt: "বিস্তারিত দেখতে ক্লিক করুন",
          }
        : {
            navRoadmap: "Roadmap",
            navStore: "Store",
            navFree: "Free Basics",
            signIn: "Sign in",
            dashboard: "Dashboard",
            heroEyebrow: "CYCLE OF CHART • TRADING REALITY",
            heroTitle: "BEFORE YOU TRADE,\nUNDERSTAND TRADING.",
            heroSubtitle: "BEFORE YOU DEPOSIT,\nUNDERSTAND TRADING.",
            heroBnSub: "Keep your money with you. Build your knowledge before you build your position. No signals. No VIP pressure. No guaranteed returns.",
            primaryCta: "Start Roadmap",
            secondaryCta: "Explore Store",
            trust1: "100% Practical Learning",
            trust2: "Zero Signal Traps",
            trust3: "12 Practical Stages",
            shiftEyebrow: "THE SHIFT",
            shiftTitle1: "Trading hype",
            shiftTitle2: "vs. trading reality.",
            shiftDesc: "A market does not reward urgency. It rewards context, risk awareness, and a repeatable process.",
            hypeHeader: "TRADING HYPE (TRAP)",
            realityHeader: "TRADING REALITY (TRUTH)",
            roadmapEyebrow: "THE ROADMAP",
            roadmapTitle1: "From beginner",
            roadmapTitle2: "to professional-minded.",
            roadmapDesc: "Learn → Practice → Journal → Review → Repeat. Every stage exists to replace guesswork with a process. Click any stage card for full breakdown.",
            freeEyebrow: "FREE TRADING BASICS",
            freeTitle: "Start with understanding,\nnot a deposit.",
            freeDesc: "Explore selected beginner lessons before you decide whether a structured learning path is right for you.",
            freeCta: "Access free lessons",
            freeCard1Title: "Candlesticks, without the noise",
            freeCard1Desc: "Anatomy, momentum, rejection, and the story behind a candle.",
            freeCard2Title: "Why did price react?",
            freeCard2Desc: "Build the questions that make chart reading useful.",
            storeEyebrow: "THE STORE",
            storeTitle: "Tools for a disciplined\nlearning practice.",
            viewBundle: "View bundle",
            ebookNotice: "eBook access is included with bundles only. No separate eBook purchase.",
            productsReady: "15 digital learning resources are being structured for the store.",
            ctaEyebrow: "YOUR CAPITAL, YOUR DECISION",
            ctaTitle: "You do not need more signals.\nYou need more understanding.",
            ctaButton: "Build your process",
            footerDesc: "Trading Reality · Structured Institutional Education",
            footerLegal: "Educational content only. No signal selling, profit guarantees, or financial advice. Before you deposit, understand trading.",
            modalStageOf: "Stage",
            modalOutOf: "of 12",
            modalKeyTakeaways: "What you will master in this stage:",
            modalExercise: "Practical Chart Exercise:",
            modalEdge: "Institutional Edge:",
            modalPrev: "Previous Stage",
            modalNext: "Next Stage",
            modalClose: "Close",
            clickPrompt: "Click for full breakdown",
          },
    [isBn]
  );

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] text-[#09111f] selection:bg-[#38bdf8] selection:text-[#09111f] dark:bg-[#060d19] dark:text-slate-100 transition-colors duration-300 ${
        isBn ? "font-bangla" : ""
      }`}
    >
      {/* ========================================================================= */}
      {/* HEADER / NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 text-slate-900 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-[#070e1b]/85 dark:text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size={42} className="shrink-0" />
            <span className="text-sm font-extrabold tracking-[0.2em] text-[#0a192f] dark:text-white">
              CYCLE OF CHART
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
            <a href="#roadmap" className="transition hover:text-[#0284c7] dark:hover:text-sky-400">
              {copy.navRoadmap}
            </a>
            <a href="#store" className="transition hover:text-[#0284c7] dark:hover:text-sky-400">
              {copy.navStore}
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Mode"
              className="flex size-9 items-center justify-center rounded-full border border-slate-300/80 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Language Switcher */}
            <div className="flex rounded-full border border-slate-300 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                  lang === "en"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("bn")}
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                  lang === "bn"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                বাং
              </button>
            </div>

            {user ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-[#091e3a] text-white hover:bg-[#0c284e] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold"
                >
                  {copy.dashboard}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 font-semibold"
                >
                  {copy.signIn}
                </Button>
              </Link>
            )}

            <button
              className="ml-1 text-slate-700 dark:text-slate-300 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <a href="#roadmap" onClick={() => setMenuOpen(false)}>
                {copy.navRoadmap}
              </a>
              <a href="#store" onClick={() => setMenuOpen(false)}>
                {copy.navStore}
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ========================================================================= */}
        {/* HERO PANEL */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#ffffff] via-[#f0f7ff] to-[#e6f2fe] pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-24 dark:from-[#060d19] dark:via-[#091527] dark:to-[#07111f] transition-colors duration-300">
          <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(2,132,199,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.08)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-[0.2] dark:[background-image:linear-gradient(rgba(56,189,248,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.12)_1px,transparent_1px)]" />
          <div className="pointer-events-none absolute top-12 -left-20 size-[500px] rounded-full bg-sky-200/40 blur-[120px] dark:bg-sky-500/15 ambient-blur-blob hidden sm:block" />
          <div className="pointer-events-none absolute top-20 right-0 size-[600px] rounded-full bg-sky-300/45 blur-[140px] dark:bg-sky-400/20 ambient-blur-blob hidden sm:block" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 size-[400px] rounded-full bg-blue-200/30 blur-[100px] dark:bg-blue-500/15 ambient-blur-blob hidden sm:block" />


          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:px-8">
            <div className="z-10 flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#0284c7] shadow-sm backdrop-blur-md dark:border-sky-500/30 dark:bg-slate-900/80 dark:text-sky-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0284c7] opacity-75 dark:bg-sky-400" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#0284c7] dark:bg-sky-400" />
                </span>
                {copy.heroEyebrow}
              </div>

              <h1 className="max-w-xl whitespace-pre-line text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] text-[#071a36] dark:text-white sm:text-5xl lg:text-[4.2rem]">
                {copy.heroTitle}
              </h1>

              <p
                className={`mt-6 max-w-lg leading-relaxed whitespace-pre-line ${
                  isBn
                    ? "text-base sm:text-lg text-slate-600 dark:text-slate-300"
                    : "text-xl sm:text-2xl font-bold text-[#0284c7] dark:text-sky-400"
                }`}
              >
                {copy.heroSubtitle}
              </p>

              <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                {copy.heroBnSub}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-10">
                <a href="#roadmap">
                  <Button
                    size="lg"
                    className="h-12 rounded-xl bg-[#081833] px-7 text-base font-bold text-white shadow-lg shadow-[#081833]/25 transition hover:bg-[#0c244b] hover:shadow-xl active:scale-[0.98] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 dark:shadow-sky-500/20"
                  >
                    <Compass size={18} className="mr-2" />
                    {copy.primaryCta}
                  </Button>
                </a>

                <a href="#store">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border border-slate-300 bg-white/80 px-7 text-base font-bold text-slate-800 shadow-sm backdrop-blur-md transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700 active:scale-[0.98]"
                  >
                    <ShoppingBag size={18} className="mr-2 text-[#0284c7] dark:text-sky-400" />
                    {copy.secondaryCta}
                  </Button>
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-200/80 pt-6 text-xs font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#0284c7] dark:text-sky-400" />
                  <span>{copy.trust1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[#0284c7] dark:text-sky-400" />
                  <span>{copy.trust2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-[#0284c7] dark:text-sky-400" />
                  <span>{copy.trust3}</span>
                </div>
              </div>
            </div>

            <div className="z-10 flex w-full items-center justify-center lg:justify-end">
              <HeroCandle3D lang={lang} />
            </div>
          </div>

          <div className="relative mx-auto mt-16 max-w-7xl border-t border-slate-200/80 px-5 pt-8 dark:border-slate-800 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat value={isBn ? "১২" : "12"} label={isBn ? "লার্নিং স্টেজ" : "Learning Stages"} />
              <Stat value="A–Z" label={isBn ? "স্ট্রাকচার্ড রোডম্যাপ" : "Structured Roadmap"} />
              <Stat value="3D" label={isBn ? "ডাইনামিক ক্যান্ডেল" : "Dynamic Candlesticks"} />
              <Stat value={isBn ? "০" : "0"} label={isBn ? "ফলস প্রমিজ" : "False Promises"} />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* THE SHIFT SECTION */}
        {/* ========================================================================= */}
        <section className="content-auto bg-[#f1f5f9] py-16 sm:py-20 dark:bg-[#070e1b] lg:py-28 transition-colors">

          <div className="mx-auto grid max-w-7xl gap-16 px-5 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div>
              <p className="eyebrow">{copy.shiftEyebrow}</p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-[-.03em] text-slate-900 dark:text-white sm:text-5xl">
                {copy.shiftTitle1}
                <br />
                <span className="text-[#51708f] dark:text-sky-400">{copy.shiftTitle2}</span>
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-slate-600 dark:text-slate-300 text-base">
                {copy.shiftDesc}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-rose-200 bg-white p-7 shadow-sm dark:border-rose-900/40 dark:bg-slate-900/90">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-[.18em] text-rose-600 dark:text-rose-400">
                    {copy.hypeHeader}
                  </div>
                  <AlertOctagon size={16} className="text-rose-500" />
                </div>
                <div className="mt-7 space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  {HYPE_ITEMS_EN.map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center rounded-full bg-rose-50 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                        {isBn ? String(i + 1).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-tight">{isBn ? HYPE_ITEMS_BN[i] : HYPE_ITEMS_EN[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[#0d1a2d] p-7 text-white shadow-xl shadow-[#0d1a2d]/25 dark:bg-slate-800 dark:shadow-slate-950/50 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-[.18em] text-[#38bdf8]">
                    {copy.realityHeader}
                  </div>
                  <ShieldCheck size={16} className="text-[#38bdf8]" />
                </div>
                <div className="mt-7 space-y-4 text-sm text-slate-300">
                  {REALITY_ITEMS_EN.map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-[#38bdf8]">
                        {isBn ? String(i + 1).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-tight">{isBn ? REALITY_ITEMS_BN[i] : REALITY_ITEMS_EN[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ROADMAP SECTION (12 INTERACTIVE STAGES) */}
        {/* ========================================================================= */}
        <section id="roadmap" className="content-auto bg-white py-16 sm:py-24 dark:bg-[#060d19] lg:py-32 transition-colors">

          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">{copy.roadmapEyebrow}</p>
                <h2 className="mt-4 text-4xl font-extrabold tracking-[-.03em] text-slate-900 dark:text-white sm:text-5xl">
                  {copy.roadmapTitle1}
                  <br />
                  <span className="text-[#51708f] dark:text-sky-400">{copy.roadmapTitle2}</span>
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {copy.roadmapDesc}
              </p>
            </div>

            {/* 12 Stages Interactive Grid */}
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stagesData.map((stage, i) => {
                const isActive = activeStage === i || selectedStageModal === i;
                return (
                  <button
                    key={stage.num}
                    onClick={() => {
                      setActiveStage(i);
                      setSelectedStageModal(i);
                    }}
                    className={`group relative rounded-2xl border p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
                      isActive
                        ? "border-[#0d1a2d] bg-[#0d1a2d] text-white shadow-xl shadow-[#0d1a2d]/25 dark:border-sky-400 dark:bg-slate-800"
                        : "border-slate-200 bg-white hover:border-[#0284c7]/50 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-sky-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                            isActive
                              ? "bg-white/10 text-[#38bdf8]"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {stage.num}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? "text-slate-300" : "text-[#0284c7] dark:text-sky-400"
                          }`}
                        >
                          {stage.category}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all group-hover:translate-x-0.5 ${
                          isActive
                            ? "bg-[#38bdf8] text-slate-950"
                            : "bg-slate-100 text-slate-500 group-hover:bg-[#0284c7] group-hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-sky-500 dark:group-hover:text-slate-950"
                        }`}
                      >
                        <ArrowRight size={11} />
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-extrabold leading-snug dark:text-white">
                      {stage.title}
                    </h3>

                    <p
                      className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                        isActive ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {stage.summary}
                    </p>

                    <div className="mt-5 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold dark:border-slate-800">
                      <span className={isActive ? "text-[#38bdf8]" : "text-[#0284c7] dark:text-sky-400"}>
                        {copy.clickPrompt}
                      </span>
                      <ChevronRight size={13} className={isActive ? "text-[#38bdf8]" : "text-[#0284c7] dark:text-sky-400"} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE STAGE BREAKDOWN MODAL DIALOG */}
        {/* ========================================================================= */}
        {selectedStageModal !== null && activeModalData && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 transition-all duration-300 animate-in fade-in"
            onClick={() => setSelectedStageModal(null)}
          >
            <div
              className={`relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 scale-100 animate-in zoom-in-95 ${
                isBn ? "font-bangla" : ""
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar with Stage Badge & Close Button */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-xl bg-[#0284c7]/15 font-mono text-xs font-bold text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-400">
                    {activeModalData.num}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {copy.modalStageOf} {activeModalData.num} {copy.modalOutOf} • {activeModalData.category}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedStageModal(null)}
                  className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                  title={copy.modalClose}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-5 space-y-6">
                {/* Title & Core Overview */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {activeModalData.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    {activeModalData.summary}
                  </p>
                </div>

                {/* Key Takeaways / What You Will Master */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    <Target size={15} className="text-[#0284c7] dark:text-sky-400" />
                    <span>{copy.modalKeyTakeaways}</span>
                  </div>

                  <div className="mt-3.5 space-y-2.5">
                    {activeModalData.keyPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                        <span className="leading-snug">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Exercise Box */}
                <div className="rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4 sm:p-5 dark:border-sky-900/50 dark:bg-sky-950/20">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0369a1] dark:text-sky-400">
                    <Lightbulb size={15} />
                    <span>{copy.modalExercise}</span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                    {activeModalData.exercise}
                  </p>
                </div>

                {/* Institutional Edge Note */}
                <div className="flex items-start gap-3 rounded-2xl bg-[#0d1a2d] p-4 text-white dark:bg-slate-800">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#38bdf8]" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[#38bdf8]">
                      {copy.modalEdge}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-300">
                      {activeModalData.edge}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Navigation Footer */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedStageModal === 0}
                  onClick={() => {
                    const prev = Math.max(0, (selectedStageModal || 0) - 1);
                    setSelectedStageModal(prev);
                    setActiveStage(prev);
                  }}
                  className="gap-1 text-xs font-bold border-slate-200 dark:border-slate-700"
                >
                  <ChevronLeft size={15} />
                  <span>{copy.modalPrev}</span>
                </Button>

                <div className="text-xs font-mono font-bold text-slate-400">
                  {selectedStageModal + 1} / 12
                </div>

                <Button
                  size="sm"
                  disabled={selectedStageModal === 11}
                  onClick={() => {
                    const next = Math.min(11, (selectedStageModal || 0) + 1);
                    setSelectedStageModal(next);
                    setActiveStage(next);
                  }}
                  className="gap-1 bg-[#081833] text-xs font-bold text-white hover:bg-[#0c244b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                >
                  <span>{copy.modalNext}</span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          </div>
        )}



        {/* ========================================================================= */}
        {/* STORE & PRODUCTS SECTION */}
        {/* ========================================================================= */}
        <section id="store" className="content-auto bg-[#f8fafc] py-16 sm:py-24 dark:bg-[#060d19] transition-colors">

          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">{copy.storeEyebrow}</p>
                <h2 className="mt-4 text-4xl font-extrabold tracking-[-.03em] text-slate-900 dark:text-white whitespace-pre-line leading-tight">
                  {copy.storeTitle}
                </h2>
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-8 items-stretch">
              {(bundles?.length
                ? bundles
                : [
                    {
                      id: 1,
                      titleEn: "PDF Package",
                      titleBn: "PDF প্রফেশনাল প্যাকেজ",
                      descriptionEn: "Select from 15 structured learning PDFs with complete chart breakdowns.",
                      descriptionBn: "১৫টি স্ট্রাকচার্ড চার্ট ব্রেকডাউন ও প্রাইস অ্যাকশন PDF থেকে সিলেক্ট করুন।",
                      price: "199",
                      badgeEn: "STARTER",
                      badgeBn: "স্টার্টার",
                      featuresEn: [
                        "15 Structured Chart PDF Guides",
                        "Candlestick Anatomy & Patterns",
                        "Lifetime PDF Download Access",
                        "Mobile & Desktop Readable",
                      ],
                      featuresBn: [
                        "১৫টি প্রফেশনাল চার্ট PDF গাইড",
                        "ক্যান্ডেলস্টিক অ্যানাটমি ও চার্ট প্যাটার্নস",
                        "লাইফটাইম ডাউনলোড এক্সেস",
                        "মোবাইল ও পিসিতে পড়ার সুবিধা",
                      ],
                      highlight: false,
                    },
                    {
                      id: 2,
                      titleEn: "Course + Free eBook",
                      titleBn: "ফুল কোর্স + এক্সক্লুসিভ eBook",
                      descriptionEn: "A complete structured learning path with an included comprehensive eBook.",
                      descriptionBn: "একটি সম্পূর্ণ ভিডিও কোর্স সাথে সম্পূর্ণ ফ্রি প্রফেশনাল গাইড eBook।",
                      price: "399",
                      badgeEn: "CORE PATH",
                      badgeBn: "কোর পাথ",
                      topRibbonEn: "★ MOST POPULAR",
                      topRibbonBn: "★ সবচেয়ে জনপ্রিয় চয়েস",
                      featuresEn: [
                        "Complete Video Course Lessons",
                        "Free Institutional Trading eBook",
                        "12-Stage Trading Reality Roadmap",
                        "Direct Support & Guidance",
                      ],
                      featuresBn: [
                        "সম্পূর্ণ ভিডিও কোর্স লেসনস",
                        "সম্পূর্ণ ফ্রি প্রফেশনাল গাইড eBook",
                        "১২-স্টেজ স্ট্রাকচার্ড রোডম্যাপ",
                        "ডিরেক্ট সাপোর্ট ও গাইডেন্স",
                      ],
                      highlight: true,
                    },
                    {
                      id: 3,
                      titleEn: "Master Full Bundle",
                      titleBn: "অল-ইন-ওয়ান মাস্টার বাণ্ডেল",
                      descriptionEn: "All 15 PDFs, full video course, and complete institutional eBook in one path.",
                      descriptionBn: "১৫টি PDF, সম্পূর্ণ ভিডিও কোর্স এবং এক্সক্লুসিভ eBook এক সাথে পান।",
                      price: "799",
                      badgeEn: "COMPLETE PASS",
                      badgeBn: "কমপ্লিট পাস",
                      featuresEn: [
                        "All 15 Complete PDF Guides",
                        "Full Comprehensive Video Course",
                        "Exclusive Institutional eBook",
                        "All-In-One Lifetime Mastery Pass",
                      ],
                      featuresBn: [
                        "১৫টি সম্পূর্ণ PDF গাইড",
                        "ফুল ভিডিও কোর্স টিউটোরিয়াল",
                        "এক্সক্লুসিভ প্রাতিষ্ঠানিক eBook",
                        "অল-ইন-ওয়ান লাইফটাইম মাস্টার পাস",
                      ],
                      highlight: false,
                    },
                  ]
              ).map((item: any, i: number) => {
                const isPopular = item.highlight || i === 1;
                const topRibbonText = isBn
                  ? item.topRibbonBn || "★ সবচেয়ে জনপ্রিয় চয়েস"
                  : item.topRibbonEn || "★ MOST POPULAR";
                const features = isBn
                  ? item.featuresBn || [
                      "১৫টি স্ট্রাকচার্ড চার্ট গাইড",
                      "লাইফটাইম এক্সেস",
                      "মোবাইল ও পিসিতে পড়ার সুবিধা",
                    ]
                  : item.featuresEn || [
                      "Structured Chart Guides",
                      "Lifetime Access",
                      "Mobile & Desktop Readable",
                    ];

                return (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-3 hover:scale-[1.03] active:scale-[0.99] ${
                      isPopular
                        ? "bg-[#0d1a2d] text-white border-2 border-[#38bdf8] shadow-2xl shadow-sky-500/20 dark:bg-slate-800 dark:border-sky-400 dark:shadow-sky-950/60 lg:-translate-y-2 hover:border-sky-300"
                        : "border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-200/50 hover:border-sky-400/80 hover:shadow-2xl hover:shadow-sky-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:shadow-none dark:hover:border-sky-500/50"
                    }`}
                  >
                    {/* Top Popular Glow Ribbon */}
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                        {topRibbonText}
                      </div>
                    )}

                    <div>
                      {/* Card Header Badge & Icon */}
                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.16em] ${
                            isPopular
                              ? "bg-white/15 text-[#38bdf8]"
                              : "bg-[#eef3f6] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {isBn ? item.badgeBn || "প্যাকেজ" : item.badgeEn || "PACKAGE"}
                        </span>
                        <Sparkles
                          size={18}
                          className={`transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125 ${
                            isPopular ? "text-[#38bdf8]" : "text-slate-400 group-hover:text-sky-500"
                          }`}
                        />
                      </div>

                      {/* Title */}
                      <h3 className="mt-6 text-2xl font-extrabold tracking-tight">
                        {isBn ? item.titleBn : item.titleEn}
                      </h3>

                      {/* Description */}
                      <p
                        className={`mt-2.5 text-xs sm:text-sm leading-relaxed ${
                          isPopular ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {isBn ? item.descriptionBn : item.descriptionEn}
                      </p>

                      {/* Included Features Checklist */}
                      <div className="mt-6 space-y-2.5 border-t border-dashed border-slate-200/60 pt-5 dark:border-slate-700/60">
                        {features.map((feat: string, fIdx: number) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                            <CheckCircle2
                              size={15}
                              className={`mt-0.5 shrink-0 ${
                                isPopular ? "text-[#38bdf8]" : "text-emerald-500 dark:text-emerald-400"
                              }`}
                            />
                            <span
                              className={`leading-tight font-medium ${
                                isPopular ? "text-slate-200" : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {feat}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & CTA Button */}
                    <div className="mt-8 border-t border-slate-100 pt-5 dark:border-slate-800">
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <span className="text-3xl sm:text-4xl font-black tracking-tight">
                            ৳{isBn ? String(item.price).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : item.price}
                          </span>
                          <span className={`text-[11px] font-semibold ml-1.5 ${isPopular ? "text-slate-400" : "text-slate-500"}`}>
                            {isBn ? "/ এককালীন" : "/ one-time"}
                          </span>
                        </div>
                      </div>

                      <Link href="/checkout" className="block w-full">
                        <Button
                          size="lg"
                          className={`group/btn w-full gap-2 rounded-2xl font-extrabold text-sm shadow-md transition-all duration-200 active:scale-[0.98] ${
                            isPopular
                              ? "bg-[#38bdf8] text-slate-950 hover:bg-[#7dd3fc] hover:shadow-lg hover:shadow-sky-500/25"
                              : "bg-[#0d1a2d] text-white hover:bg-[#17365b] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                          }`}
                        >
                          <span>{copy.viewBundle}</span>
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-200 group-hover/btn:translate-x-1"
                          />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <LockKeyhole size={14} /> {copy.ebookNotice}
            </p>

            <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Check className="text-[#0284c7] dark:text-sky-400" size={18} />
                <span className="font-bold text-sm dark:text-slate-200">
                  {copy.productsReady}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CALL TO ACTION BOTTOM BANNER */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-[#071a36] via-[#0d2a52] to-[#0a1e3d] py-20 text-white dark:from-[#050b15] dark:via-[#09182d] dark:to-[#071222]">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 sm:flex-row sm:items-center lg:px-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#38bdf8]">
                {copy.ctaEyebrow}
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-[-.03em] sm:text-5xl whitespace-pre-line">
                {copy.ctaTitle}
              </h2>
            </div>
            <a href="#roadmap">
              <Button size="lg" className="w-fit bg-[#38bdf8] font-bold text-[#08111f] hover:bg-[#7dd3fc]">
                {copy.ctaButton} <ArrowRight size={17} className="ml-1" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#08111f] py-10 text-white dark:bg-[#040810] border-t border-slate-800/60">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 text-sm text-slate-400 sm:flex-row lg:px-8">
          <div className="flex items-center gap-4">
            <BrandLogo size={50} />
            <div>
              <div className="font-extrabold tracking-[.2em] text-white">CYCLE OF CHART</div>
              <div className="mt-1 text-xs">{copy.footerDesc}</div>
            </div>
          </div>
          <div className="max-w-md text-left text-xs leading-relaxed text-slate-400 sm:text-right">
            {copy.footerLegal}
          </div>
        </div>
      </footer>
    </div>
  );
}
