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

const ROADMAP_CARD_FLOAT_DELAYS = [
  "0s",
  "0.4s",
  "0.8s",
  "1.2s",
  "1.6s",
  "2.0s",
  "2.4s",
  "2.8s",
  "3.2s",
  "3.6s",
  "4.0s",
  "4.4s",
];

const STAGES_DETAILS_EN: StageDetail[] = [
  {
    num: "01",
    title: "BASIC TRADING UNDERSTANDING",
    category: "MARKET ESSENTIALS",
    summary:
      "Trading কী? কোথা থেকে এসেছে? এবং একজন Beginner-এর কোথা থেকে শুরু করা উচিত?\n\n“আগে MARKET থেকে শেখো, তারপর MARKET থেকে আয় করো।”\n\nTrading-এর শুরু কোথা থেকে?\nTrading-এর Market কত প্রকার?\nTrading শুরু করার আগে কী কী জানতে হয় বা শিখতে হয়?",
    keyPoints: [],
    exercise: "",
    edge: "",
  },
  {
    num: "02",
    title: "CANDLESTICKS",
    category: "CHART ANATOMY",
    summary:
      "Market-এর price movement বুঝতে Candlestick হলো অন্যতম গুরুত্বপূর্ণ foundation। একটি candle কীভাবে তৈরি হয়, তার bullish ও bearish behaviour কীভাবে বুঝতে হয় এবং বিভিন্ন candlestick pattern কীভাবে market-এর সম্ভাব্য movement সম্পর্কে ধারণা দেয়—এসব এখান থেকেই শেখা হবে।",
    keyPoints: [
      "Candlestick কীভাবে তৈরি হয়?",
      "BULLISH VS BEARISH",
      "Candlestick Pattern-এর ধরন",
      "01 — SINGLE CANDLE",
      "02 — TWO-CANDLE",
      "03 — MULTI-CANDLE",
      "REVERSAL-TYPE",
    ],
    exercise: "",
    edge: "",
  },
  {
    num: "03",
    title: "BASIC MARKET STRUCTURE",
    category: "STRUCTURE CONTEXT",
    summary:
      "Market কীভাবে move করে এবং price movement-এর মধ্যে থাকা basic structure কীভাবে বুঝতে হয়—এই section-এ সেটাই শেখা হবে। Market-এর direction, swing এবং price-এর গুরুত্বপূর্ণ movement বুঝে chart পড়ার foundation তৈরি করা হবে।",
    keyPoints: [],
    exercise: "",
    edge: "",
  },
  {
    num: "04",
    title: "SUPPORT & RESISTANCE",
    category: "KEY REACTION ZONES",
    summary:
      "চার্টজুড়ে এলোমেলো লাইন টানা বন্ধ করে ইন্সটিটিউশনাল স্ট্রাকচার-ভিত্তিক রিয়েল সাপোর্ট ও রেজিস্ট্যান্স লেভেল চিহ্নিত করুন।",
    keyPoints: [
      "মেজর সুইং লেভেলস বনাম মাইনর ইন্ট্রাডে নয়েজ লেভেল",
      "পোলারিটি ফ্লিপ জোন (পূর্ববর্তী রেজিস্ট্যান্স সাপোর্টে রূপান্তর)",
      "ব্রেক অ্যান্ড রিটেস্টের সুনির্দিষ্ট কনফার্মেশন রুলস",
      "সাইকোলজিক্যাল হোল নাম্বার ও ইন্সটিটিউশনাল রিঅ্যাকশন জোন",
    ],
    exercise: "উইকলি চার্টে ৩টি মেজর লেভেল চিহ্নিত করে প্রাইস সেখানে পৌঁছালে কেমন আচরণ করে তা দেখুন।",
    edge: "সাপোর্ট ও রেজিস্ট্যান্স কোনো একক লাইন নয়; এটি হলো সাপ্লাই ও ডিমান্ডের ইন্সটিটিউশনাল জোন।",
  },
  {
    num: "05",
    title: "SMART MONEY CONCEPT (SMC) — A TO Z",
    category: "INSTITUTIONAL FOOTPRINT",
    summary:
      "Market-এর Smart Money Concepts একদম basic থেকে advanced level পর্যন্ত A to Z শেখানো হবে, যাতে একজন trader chart-এর structure, liquidity এবং price movement আরও ভালোভাবে বুঝতে পারে।",
    keyPoints: ["A TO Z SMC"],
    exercise: "",
    edge: "",
  },
  {
    num: "06",
    title: "আইসিটি (ICT) মডেলস",
    category: "TIME & PRICE THEORY",
    summary:
      "ইনার সার্কেল ট্রেডার (ICT) টাইম ও প্রাইস থিওরি, লন্ডন ও নিউইয়র্ক সেশন টাইমিং এবং অ্যালগরিদমিক কিলজোন মাস্টার করুন।",
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
    num: "07",
    title: "সিআরটি (CRT) মডেল",
    category: "CYCLE SIGNATURE",
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
    num: "08",
    title: "TIME, SESSION & NEWS",
    category: "TIME & SESSION",
    summary:
      "Trading-এ শুধু price action বুঝলেই হবে না—কখন market active থাকে, কোন session-এ কোন ধরনের movement তৈরি হয় এবং গুরুত্বপূর্ণ news কীভাবে market-এর volatility ও price movement-কে প্রভাবিত করে সেটাও জানা জরুরি। সঠিক timing ও market context বুঝে better trading decisions নেওয়ার foundation তৈরি করুন।",
    keyPoints: [
      "TRADING TIME — Market কখন open, active ও slow থাকে এবং timing কেন গুরুত্বপূর্ণ",
      "MARKET SESSIONS — Asian, London ও New York Session কী এবং প্রতিটি session-এর characteristics",
      "SESSION OVERLAP — London–New York overlap কেন গুরুত্বপূর্ণ এবং liquidity কীভাবে বাড়ে",
      "SESSION HIGH & LOW — Previous session-এর High/Low কীভাবে identify ও monitor করতে হয়",
      "ECONOMIC NEWS — High-impact ও low-impact news কী এবং news-এর গুরুত্ব কীভাবে বুঝতে হয়",
      "NEWS & VOLATILITY — News release-এর আগে ও পরে market volatility কীভাবে পরিবর্তিত হতে পারে",
      "TRADING AROUND NEWS — গুরুত্বপূর্ণ news-এর সময় কখন trade avoid বা সতর্কভাবে manage করতে হয়",
    ],
    exercise: "টানা ৫ দিন Asian, London ও New York Session-এর High/Low mark করুন এবং session change ও গুরুত্বপূর্ণ news release-এর সময় price movement কীভাবে পরিবর্তিত হয় তা chart-এ track করুন।",
    edge: "Price কোথায় যাচ্ছে তার পাশাপাশি কখন move করছে সেটাও গুরুত্বপূর্ণ। Session timing, liquidity এবং high-impact news-এর context বুঝতে পারলে market-এর সম্ভাব্য volatility ও movement সম্পর্কে আরও structured ধারণা পাওয়া যায়।",
  },
  {
    num: "09",
    title: "LOT & LEVERAGE",
    category: "POSITION SIZING",
    summary:
      "Trading-এ কতটুকু position নেওয়া উচিত, Lot কীভাবে কাজ করে এবং Leverage কীভাবে profit ও loss—দুটোকেই প্রভাবিত করে তা বুঝুন। সঠিক position sizing, margin এবং leverage ব্যবহার করে unnecessary risk কমিয়ে controlled trading-এর foundation তৈরি করুন।",
    keyPoints: [
      "LOT কী এবং Lot Size কীভাবে কাজ করে",
      "Leverage কী এবং কেন ব্যবহার করা হয়",
      "Margin, Position Size ও Account Balance-এর সম্পর্ক",
      "Risk অনুযায়ী সঠিক Lot Size নির্বাচন",
    ],
    exercise: "একই setup-এ বিভিন্ন Lot Size ও Leverage ব্যবহার করে সম্ভাব্য Profit, Loss এবং Margin Requirement হিসাব করুন।",
    edge: "ভালো setup থাকলেই যথেষ্ট নয়—সঠিক position size ও controlled leverage-ই একজন trader-এর capital দীর্ঘসময় ধরে টিকিয়ে রাখতে সাহায্য করে।",
  },
  {
    num: "10",
    title: "RISK & MONEY MANAGEMENT",
    category: "SURVIVAL MATHEMATICS",
    summary:
      "একজন trader-এর সবচেয়ে গুরুত্বপূর্ণ skill হলো নিজের capital protect করা। Risk কীভাবে calculate করতে হয়, প্রতি trade-এ কতটুকু risk নেওয়া উচিত এবং account-এর capital কীভাবে দীর্ঘমেয়াদে manage করতে হয়—এসবের মাধ্যমে disciplined money management system তৈরি করুন।",
    keyPoints: [
      "Risk Per Trade ও Risk-to-Reward Ratio",
      "Stop Loss ও Position Size-এর সঠিক ব্যবহার",
      "Drawdown ও Capital Protection",
      "Consistent Risk Management Rules তৈরি",
    ],
    exercise: "একটি নির্দিষ্ট account balance ধরে বিভিন্ন setup-এর জন্য Risk %, Stop Loss এবং Position Size calculate করে একটি consistent risk plan তৈরি করুন।",
    edge: "Profit করা trader হওয়ার চেয়েও গুরুত্বপূর্ণ হলো capital ধরে রাখা। Proper risk management একটি losing streak-এর মধ্যেও account-কে survive করার সুযোগ দেয় এবং long-term consistency তৈরি করে।",
  },
  {
    num: "11",
    title: "BUILD YOUR OWN EDGE, SYSTEM & STRATEGY",
    category: "SYSTEM & STRATEGY",
    summary:
      "অন্যের strategy কপি না করে নিজের knowledge, market understanding এবং trading experience-এর ওপর ভিত্তি করে একটি unique trading edge তৈরি করুন। Market selection থেকে শুরু করে setup, entry, confirmation, stop loss, take profit, risk management, backtesting এবং execution—সবকিছু মিলিয়ে কীভাবে একটি complete, rule-based এবং repeatable trading system তৈরি করতে হয় তা A to Z শেখানো হবে।",
    keyPoints: [
      "FIND YOUR EDGE — কোন Market, Timeframe ও Setup-এ আপনার advantage তৈরি হচ্ছে তা identify করা",
      "BUILD YOUR SYSTEM — Market condition, setup, confirmation ও execution-এর clear rules তৈরি করা",
      "CREATE YOUR STRATEGY — Entry, Stop Loss, Take Profit ও Risk Management-এর complete framework তৈরি করা",
      "BACKTEST & OPTIMIZE — Historical chart-এ strategy test করে Win Rate, R:R, Drawdown ও Expectancy analyse করা",
      "TRADING PLAYBOOK — সব rules এক জায়গায় লিখে একটি repeatable trading plan তৈরি করা",
      "FORWARD TESTING — Live market-এ controlled risk নিয়ে system-এর real performance যাচাই করা",
      "REFINE & EXECUTE — Data ও performance অনুযায়ী system improve করে consistent execution তৈরি করা",
    ],
    exercise: "নিজের পছন্দের একটি market ও setup নির্বাচন করে complete trading strategy তৈরি করুন। কমপক্ষে 50–100টি historical setup backtest করে Entry, Stop Loss, Take Profit, Win Rate, Risk-to-Reward এবং Drawdown record করুন।",
    edge: "একজন trader-এর আসল advantage কোনো single indicator বা secret setup নয়। নিজের data, rules এবং repeatable process থেকে তৈরি করা measurable edge-ই long-term trading system-এর foundation।",
  },
  {
    num: "12",
    title: "FROM BEGINNER TO PROFESSIONAL TRADER",
    category: "COMPLETE ROADMAP",
    summary:
      "একজন Beginner কীভাবে সঠিকভাবে Market শিখবে, নিজের learning process তৈরি করবে, Trading Journal-এর মাধ্যমে নিজের performance analyse করবে এবং ধাপে ধাপে একজন disciplined, professional ও profitable trader হয়ে উঠবে—এই section-এ সেই complete journey দেখানো হবে। শুধু strategy শেখা নয়, knowledge, practice, execution, review এবং mindset—সবকিছুকে একসাথে নিয়ে একজন complete trader তৈরি করার framework।",
    keyPoints: [
      "MARKET OF LEARNING — Market থেকে কীভাবে শেখা যায়, কী শিখতে হবে এবং কোন knowledge আগে ও কোনটা পরে শেখা উচিত",
      "LEARNING PROCESS — Beginner থেকে advanced level পর্যন্ত structuredভাবে শেখার সঠিক process তৈরি করা",
      "TRADING JOURNAL — প্রতিটি trade কীভাবে journal করতে হয় এবং Entry, Exit, Setup, Risk, Emotion ও Result কীভাবে record করতে হয়",
      "JOURNAL ANALYSIS — নিজের winning ও losing trades review করে ভুল, weakness এবং improvement area identify করা",
      "BUILD TRADING DISCIPLINE — Rules follow করা, patience রাখা এবং emotion-এর পরিবর্তে process অনুযায়ী decision নেওয়া",
      "PROFITABLE TRADER MINDSET — একজন profitable trader-এর thinking, patience, consistency, discipline এবং risk-focused mindset কেমন হওয়া উচিত",
      "FROM BEGINNER TO PROFESSIONAL — Knowledge → Practice → Backtesting → Execution → Journaling → Review → Improvement—এই complete cycle-এর মাধ্যমে professional trading skill তৈরি করা",
      "BECOME CONSISTENT — Profit-এর পেছনে না ছুটে একটি repeatable process ও long-term consistency তৈরি করা",
    ],
    exercise: "একটি complete Trading Journal তৈরি করুন এবং নিয়মিত নিজের trades record করুন। প্রতি সপ্তাহে Journal review করে ভুল, ভালো execution, emotional decisions, risk management এবং overall performance analyse করে পরবর্তী সপ্তাহের জন্য improvement plan তৈরি করুন।",
    edge: "Profitable trader হওয়া মানে শুধু বেশি trade জেতা নয়। একজন professional trader নিজের process, risk, emotion এবং performance নিয়ন্ত্রণ করতে পারে। শেখা → প্রয়োগ → journal → review → improvement—এই continuous cycle-ই একজন Beginner-কে ধীরে ধীরে consistent ও professional trader-এ পরিণত করে।",
  },
];

const STAGES_DETAILS_BN: StageDetail[] = [
  {
    num: "০১",
    title: "BASIC TRADING UNDERSTANDING",
    category: "মার্কেট বেসিকস",
    summary:
      "Trading কী? কোথা থেকে এসেছে? এবং একজন Beginner-এর কোথা থেকে শুরু করা উচিত?\n\n“আগে MARKET থেকে শেখো, তারপর MARKET থেকে আয় করো।”\n\nTrading-এর শুরু কোথা থেকে?\nTrading-এর Market কত প্রকার?\nTrading শুরু করার আগে কী কী জানতে হয় বা শিখতে হয়?",
    keyPoints: [],
    exercise: "",
    edge: "",
  },
  {
    num: "০২",
    title: "CANDLESTICKS",
    category: "চার্ট অ্যানাটমি",
    summary:
      "Market-এর price movement বুঝতে Candlestick হলো অন্যতম গুরুত্বপূর্ণ foundation। একটি candle কীভাবে তৈরি হয়, তার bullish ও bearish behaviour কীভাবে বুঝতে হয় এবং বিভিন্ন candlestick pattern কীভাবে market-এর সম্ভাব্য movement সম্পর্কে ধারণা দেয়—এসব এখান থেকেই শেখা হবে।",
    keyPoints: [
      "Candlestick কীভাবে তৈরি হয়?",
      "BULLISH VS BEARISH",
      "Candlestick Pattern-এর ধরন",
      "01 — SINGLE CANDLE",
      "02 — TWO-CANDLE",
      "03 — MULTI-CANDLE",
      "REVERSAL-TYPE",
    ],
    exercise: "",
    edge: "",
  },
  {
    num: "০৩",
    title: "BASIC MARKET STRUCTURE",
    category: "স্ট্রাকচার কনটেক্সট",
    summary:
      "Market কীভাবে move করে এবং price movement-এর মধ্যে থাকা basic structure কীভাবে বুঝতে হয়—এই section-এ সেটাই শেখা হবে। Market-এর direction, swing এবং price-এর গুরুত্বপূর্ণ movement বুঝে chart পড়ার foundation তৈরি করা হবে।",
    keyPoints: [],
    exercise: "",
    edge: "",
  },
  {
    num: "০৪",
    title: "SUPPORT & RESISTANCE",
    category: "KEY REACTION ZONES",
    summary:
      "চার্টজুড়ে এলোমেলো লাইন টানা বন্ধ করে ইন্সটিটিউশনাল স্ট্রাকচার-ভিত্তিক রিয়েল সাপোর্ট ও রেজিস্ট্যান্স লেভেল চিহ্নিত করুন।",
    keyPoints: [
      "মেজর সুইং লেভেলস বনাম মাইনর ইন্ট্রাডে নয়েজ লেভেল",
      "পোলারিটি ফ্লিপ জোন (পূর্ববর্তী রেজিস্ট্যান্স সাপোর্টে রূপান্তর)",
      "ব্রেক অ্যান্ড রিটেস্টের সুনির্দিষ্ট কনফার্মেশন রুলস",
      "সাইকোলজিক্যাল হোল নাম্বার ও ইন্সটিটিউশনাল রিঅ্যাকশন জোন",
    ],
    exercise: "উইকলি চার্টে ৩টি মেজর লেভেল চিহ্নিত করে প্রাইস সেখানে পৌঁছালে কেমন আচরণ করে তা দেখুন।",
    edge: "সাপোর্ট ও রেজিস্ট্যান্স কোনো একক লাইন নয়; এটি হলো সাপ্লাই ও ডিমান্ডের ইন্সটিটিউশনাল জোন।",
  },
  {
    num: "০৫",
    title: "SMART MONEY CONCEPT (SMC) — A TO Z",
    category: "INSTITUTIONAL FOOTPRINT",
    summary:
      "Market-এর Smart Money Concepts একদম basic থেকে advanced level পর্যন্ত A to Z শেখানো হবে, যাতে একজন trader chart-এর structure, liquidity এবং price movement আরও ভালোভাবে বুঝতে পারে।",
    keyPoints: ["A TO Z SMC"],
    exercise: "",
    edge: "",
  },
  {
    num: "০৬",
    title: "আইসিটি (ICT) মডেলস",
    category: "টাইম ও প্রাইস থিওরি",
    summary:
      "ইনার সার্কেল ট্রেডার (ICT) টাইম ও প্রাইস থিওরি, লন্ডন ও নিউইয়র্ক সেশন টাইমিং এবং অ্যালগরিদমিক কিলজোন মাস্টার করুন।",
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
    num: "০৭",
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
    num: "০৮",
    title: "TIME, SESSION & NEWS",
    category: "টাইম ও সেশন",
    summary:
      "Trading-এ শুধু price action বুঝলেই হবে না—কখন market active থাকে, কোন session-এ কোন ধরনের movement তৈরি হয় এবং গুরুত্বপূর্ণ news কীভাবে market-এর volatility ও price movement-কে প্রভাবিত করে সেটাও জানা জরুরি। সঠিক timing ও market context বুঝে better trading decisions নেওয়ার foundation তৈরি করুন।",
    keyPoints: [
      "TRADING TIME — Market কখন open, active ও slow থাকে এবং timing কেন গুরুত্বপূর্ণ",
      "MARKET SESSIONS — Asian, London ও New York Session কী এবং প্রতিটি session-এর characteristics",
      "SESSION OVERLAP — London–New York overlap কেন গুরুত্বপূর্ণ এবং liquidity কীভাবে বাড়ে",
      "SESSION HIGH & LOW — Previous session-এর High/Low কীভাবে identify ও monitor করতে হয়",
      "ECONOMIC NEWS — High-impact ও low-impact news কী এবং news-এর গুরুত্ব কীভাবে বুঝতে হয়",
      "NEWS & VOLATILITY — News release-এর আগে ও পরে market volatility কীভাবে পরিবর্তিত হতে পারে",
      "TRADING AROUND NEWS — গুরুত্বপূর্ণ news-এর সময় কখন trade avoid বা সতর্কভাবে manage করতে হয়",
    ],
    exercise: "টানা ৫ দিন Asian, London ও New York Session-এর High/Low mark করুন এবং session change ও গুরুত্বপূর্ণ news release-এর সময় price movement কীভাবে পরিবর্তিত হয় তা chart-এ track করুন।",
    edge: "Price কোথায় যাচ্ছে তার পাশাপাশি কখন move করছে সেটাও গুরুত্বপূর্ণ। Session timing, liquidity এবং high-impact news-এর context বুঝতে পারলে market-এর সম্ভাব্য volatility ও movement সম্পর্কে আরও structured ধারণা পাওয়া যায়।",
  },
  {
    num: "০৯",
    title: "LOT & LEVERAGE",
    category: "পজিশন সাইজিং",
    summary:
      "Trading-এ কতটুকু position নেওয়া উচিত, Lot কীভাবে কাজ করে এবং Leverage কীভাবে profit ও loss—দুটোকেই প্রভাবিত করে তা বুঝুন। সঠিক position sizing, margin এবং leverage ব্যবহার করে unnecessary risk কমিয়ে controlled trading-এর foundation তৈরি করুন।",
    keyPoints: [
      "LOT কী এবং Lot Size কীভাবে কাজ করে",
      "Leverage কী এবং কেন ব্যবহার করা হয়",
      "Margin, Position Size ও Account Balance-এর সম্পর্ক",
      "Risk অনুযায়ী সঠিক Lot Size নির্বাচন",
    ],
    exercise: "একই setup-এ বিভিন্ন Lot Size ও Leverage ব্যবহার করে সম্ভাব্য Profit, Loss এবং Margin Requirement হিসাব করুন।",
    edge: "ভালো setup থাকলেই যথেষ্ট নয়—সঠিক position size ও controlled leverage-ই একজন trader-এর capital দীর্ঘসময় ধরে টিকিয়ে রাখতে সাহায্য করে।",
  },
  {
    num: "১০",
    title: "RISK & MONEY MANAGEMENT",
    category: "টিকে থাকার গণিত",
    summary:
      "একজন trader-এর সবচেয়ে গুরুত্বপূর্ণ skill হলো নিজের capital protect করা। Risk কীভাবে calculate করতে হয়, প্রতি trade-এ কতটুকু risk নেওয়া উচিত এবং account-এর capital কীভাবে দীর্ঘমেয়াদে manage করতে হয়—এসবের মাধ্যমে disciplined money management system তৈরি করুন।",
    keyPoints: [
      "Risk Per Trade ও Risk-to-Reward Ratio",
      "Stop Loss ও Position Size-এর সঠিক ব্যবহার",
      "Drawdown ও Capital Protection",
      "Consistent Risk Management Rules তৈরি",
    ],
    exercise: "একটি নির্দিষ্ট account balance ধরে বিভিন্ন setup-এর জন্য Risk %, Stop Loss এবং Position Size calculate করে একটি consistent risk plan তৈরি করুন।",
    edge: "Profit করা trader হওয়ার চেয়েও গুরুত্বপূর্ণ হলো capital ধরে রাখা। Proper risk management একটি losing streak-এর মধ্যেও account-কে survive করার সুযোগ দেয় এবং long-term consistency তৈরি করে।",
  },
  {
    num: "১১",
    title: "BUILD YOUR OWN EDGE, SYSTEM & STRATEGY",
    category: "সিস্টেম ও স্ট্র্যাটেজি",
    summary:
      "অন্যের strategy কপি না করে নিজের knowledge, market understanding এবং trading experience-এর ওপর ভিত্তি করে একটি unique trading edge তৈরি করুন। Market selection থেকে শুরু করে setup, entry, confirmation, stop loss, take profit, risk management, backtesting এবং execution—সবকিছু মিলিয়ে কীভাবে একটি complete, rule-based এবং repeatable trading system তৈরি করতে হয় তা A to Z শেখানো হবে।",
    keyPoints: [
      "FIND YOUR EDGE — কোন Market, Timeframe ও Setup-এ আপনার advantage তৈরি হচ্ছে তা identify করা",
      "BUILD YOUR SYSTEM — Market condition, setup, confirmation ও execution-এর clear rules তৈরি করা",
      "CREATE YOUR STRATEGY — Entry, Stop Loss, Take Profit ও Risk Management-এর complete framework তৈরি করা",
      "BACKTEST & OPTIMIZE — Historical chart-এ strategy test করে Win Rate, R:R, Drawdown ও Expectancy analyse করা",
      "TRADING PLAYBOOK — সব rules এক জায়গায় লিখে একটি repeatable trading plan তৈরি করা",
      "FORWARD TESTING — Live market-এ controlled risk নিয়ে system-এর real performance যাচাই করা",
      "REFINE & EXECUTE — Data ও performance অনুযায়ী system improve করে consistent execution তৈরি করা",
    ],
    exercise: "নিজের পছন্দের একটি market ও setup নির্বাচন করে complete trading strategy তৈরি করুন। কমপক্ষে 50–100টি historical setup backtest করে Entry, Stop Loss, Take Profit, Win Rate, Risk-to-Reward এবং Drawdown record করুন।",
    edge: "একজন trader-এর আসল advantage কোনো single indicator বা secret setup নয়। নিজের data, rules এবং repeatable process থেকে তৈরি করা measurable edge-ই long-term trading system-এর foundation।",
  },
  {
    num: "১২",
    title: "FROM BEGINNER TO PROFESSIONAL TRADER",
    category: "কমপ্লিট রোডম্যাপ",
    summary:
      "একজন Beginner কীভাবে সঠিকভাবে Market শিখবে, নিজের learning process তৈরি করবে, Trading Journal-এর মাধ্যমে নিজের performance analyse করবে এবং ধাপে ধাপে একজন disciplined, professional ও profitable trader হয়ে উঠবে—এই section-এ সেই complete journey দেখানো হবে। শুধু strategy শেখা নয়, knowledge, practice, execution, review এবং mindset—সবকিছুকে একসাথে নিয়ে একজন complete trader তৈরি করার framework।",
    keyPoints: [
      "MARKET OF LEARNING — Market থেকে কীভাবে শেখা যায়, কী শিখতে হবে এবং কোন knowledge আগে ও কোনটা পরে শেখা উচিত",
      "LEARNING PROCESS — Beginner থেকে advanced level পর্যন্ত structuredভাবে শেখার সঠিক process তৈরি করা",
      "TRADING JOURNAL — প্রতিটি trade কীভাবে journal করতে হয় এবং Entry, Exit, Setup, Risk, Emotion ও Result কীভাবে record করতে হয়",
      "JOURNAL ANALYSIS — নিজের winning ও losing trades review করে ভুল, weakness এবং improvement area identify করা",
      "BUILD TRADING DISCIPLINE — Rules follow করা, patience রাখা এবং emotion-এর পরিবর্তে process অনুযায়ী decision নেওয়া",
      "PROFITABLE TRADER MINDSET — একজন profitable trader-এর thinking, patience, consistency, discipline এবং risk-focused mindset কেমন হওয়া উচিত",
      "FROM BEGINNER TO PROFESSIONAL — Knowledge → Practice → Backtesting → Execution → Journaling → Review → Improvement—এই complete cycle-এর মাধ্যমে professional trading skill তৈরি করা",
      "BECOME CONSISTENT — Profit-এর পেছনে না ছুটে একটি repeatable process ও long-term consistency তৈরি করা",
    ],
    exercise: "একটি complete Trading Journal তৈরি করুন এবং নিয়মিত নিজের trades record করুন। প্রতি সপ্তাহে Journal review করে ভুল, ভালো execution, emotional decisions, risk management এবং overall performance analyse করে পরবর্তী সপ্তাহের জন্য improvement plan তৈরি করুন।",
    edge: "Profitable trader হওয়া মানে শুধু বেশি trade জেতা নয়। একজন professional trader নিজের process, risk, emotion এবং performance নিয়ন্ত্রণ করতে পারে। শেখা → প্রয়োগ → journal → review → improvement—এই continuous cycle-ই একজন Beginner-কে ধীরে ধীরে consistent ও professional trader-এ পরিণত করে।",
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
            navSupport: "সাপোর্ট",
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
            ctaTitle: "আপনার অতিরিক্ত VIP Group বা Signal-এর প্রয়োজন নেই।\nআপনার প্রয়োজন সঠিকভাবে Market বোঝার ক্ষমতা।",
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
            navSupport: "Support",
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

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
            <a href="#roadmap" className="transition hover:text-[#0284c7] dark:hover:text-sky-400">
              {copy.navRoadmap}
            </a>
            <a href="#store" className="transition hover:text-[#0284c7] dark:hover:text-sky-400">
              {copy.navStore}
            </a>
            <Link
              href="/support"
              className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 text-xs font-bold"
            >
              <span>🎫</span>
              <span>{copy.navSupport}</span>
            </Link>
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
              <Link href="/support" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <span>🎫</span>
                <span>{copy.navSupport}</span>
              </Link>
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
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2">
              <Stat value={isBn ? "১২" : "12"} label={isBn ? "লার্নিং স্টেজ" : "Learning Stages"} />
              <Stat value="A–Z" label={isBn ? "স্ট্রাকচার্ড রোডম্যাপ" : "Structured Roadmap"} />
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
                  <div
                    key={stage.num}
                    className="roadmap-card-float flex flex-col h-full"
                    style={{
                      animationDelay: ROADMAP_CARD_FLOAT_DELAYS[i] || `${(i * 0.4).toFixed(1)}s`,
                    }}
                  >
                    <button
                      onClick={() => {
                        setActiveStage(i);
                        setSelectedStageModal(i);
                      }}
                      className={`group relative h-full w-full rounded-2xl border p-6 text-left transition-all duration-200 hover:-translate-y-1 ${
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
                  </div>
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
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                    {activeModalData.summary}
                  </p>
                </div>

                {/* Key Takeaways / What You Will Master */}
                {activeModalData.keyPoints.length > 0 && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      <Target size={15} className="text-[#0284c7] dark:text-sky-400" />
                      <span>{activeModalData.category === "GATE — COURSES" ? "GATE — COURSES" : copy.modalKeyTakeaways}</span>
                    </div>

                    <div className="mt-3.5 space-y-2.5">
                      {activeModalData.keyPoints.map((point, idx) => {
                        const [heading, ...descParts] = point.split("\n");
                        const desc = descParts.join("\n");
                        return (
                          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                            <div className="leading-snug">
                              {desc ? (
                                <>
                                  <div className="font-bold text-slate-900 dark:text-white">{heading}</div>
                                  <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</div>
                                </>
                              ) : (
                                <span>{point}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Practical Exercise Box */}
                {Boolean(activeModalData.exercise) && (
                  <div className="rounded-2xl border border-sky-200/80 bg-sky-50/60 p-4 sm:p-5 dark:border-sky-900/50 dark:bg-sky-950/20">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0369a1] dark:text-sky-400">
                      <Lightbulb size={15} />
                      <span>{copy.modalExercise}</span>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                      {activeModalData.exercise}
                    </p>
                  </div>
                )}

                {/* Institutional Edge Note */}
                {Boolean(activeModalData.edge) && (
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
                )}
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
                      titleEn: "Free eBook Package",
                      titleBn: "Free eBook Package",
                      descriptionEn: "Select from 15 structured learning PDFs with complete chart breakdowns.",
                      descriptionBn: "১৫টি স্ট্রাকচার্ড চার্ট ব্রেকডাউন ও প্রাইস অ্যাকশন PDF থেকে সিলেক্ট করুন।",
                      price: "00",
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
                      titleEn: "CYCLE OF CHART BASIC TO ADVANCE COURSE",
                      titleBn: "CYCLE OF CHART BASIC TO ADVANCE COURSE",
                      descriptionEn: "A complete structured learning path with an included comprehensive eBook.",
                      descriptionBn: "একটি সম্পূর্ণ ভিডিও কোর্স সাথে সম্পূর্ণ ফ্রি প্রফেশনাল গাইড eBook।",
                      price: "1999.00",
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
                      titleEn: "CANDLE KING A TO Z FULL COURSE",
                      titleBn: "CANDLE KING A TO Z FULL COURSE",
                      descriptionEn: "All 15 PDFs, full video course, and complete institutional eBook in one path.",
                      descriptionBn: "১৫টি PDF, সম্পূর্ণ ভিডিও কোর্স এবং এক্সক্লুসিভ eBook এক সাথে পান।",
                      price: "2499.00",
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
                    className="bundle-card-focus-zoom flex flex-col h-full"
                  >
                    <div
                      className={`group relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-3 hover:scale-[1.03] active:scale-[0.99] h-full ${
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
                </div>
              );
              })}
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
