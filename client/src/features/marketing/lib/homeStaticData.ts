import React from "react";

export interface StoreBundleStaticItem {
  id: number;
  slug: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  originalPrice?: string;
  price: string;
  priceUsd?: string;
  badgeEn: string;
  badgeBn: string;
  topRibbonEn?: string;
  topRibbonBn?: string;
  featuresEn: string[];
  featuresBn: string[];
  highlight: boolean;
}

export interface TradingPlatformStaticItem {
  id: string;
  name: string;
  descEn: string;
  descBn: string;
  devices: string;
  url: string;
  icon: React.ReactNode;
}

export const ROADMAP_CARD_FLOAT_DELAYS = [
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

export const HYPE_ITEMS_EN = [
  "Social media luxury lifestyle show-off",
  "Influencer get-rich-quick promises",
  "Paid VIP / signal Telegram groups",
  "High leverage gambling & revenge trading",
  "Blind deposits without understanding",
  "Account blowouts & psychological breakdown",
];

export const HYPE_ITEMS_BN = [
  "সোশ্যাল মিডিয়া বিলাসবহুল জীবনযাত্রার শো-অফ",
  "রাতারাতি কোটিপতি হওয়ার অবাস্তব প্রলোভন",
  "পেইড ভিআইপি ও সিগন্যাল টেলিগ্রাম গ্রুপ",
  "অতিরিক্ত লেভারেজ নিয়ে জুয়া খেলার মতো ট্রেড",
  "মার্কেট না বুঝে অন্ধের মতো বড় ডিপোজিট",
  "সম্পূর্ণ একাউন্ট জিরো এবং মানসিক হতাশা",
];

export const REALITY_ITEMS_EN = [
  "Solid foundation & financial literacy",
  "Structured step-by-step institutional learning",
  "Market structure, liquidity & smart money logic",
  "Strict 1% risk per trade & capital protection",
  "Emotional mastery, patience & discipline",
  "Consistent journaling & continuous process review",
];

export const REALITY_ITEMS_BN = [
  "সঠিক ট্রেডিং ফাউন্ডেশন ও মার্কেট লিটারেসি",
  "স্টেপ-বাই-স্টেপ স্ট্রাকচার্ড প্রফেশনাল লার্নিং",
  "মার্কেট স্ট্রাকচার, লিকুইডিটি ও স্মার্ট মানি লজিক",
  "কঠোর রিস্ক ম্যানেজমেন্ট ও মূলধন সুরক্ষা (১% রুল)",
  "ইমোশন কন্ট্রোল, ধৈর্য এবং দীর্ঘমেয়াদী ডিসিপ্লিন",
  "নিয়মিত ট্রেড জার্নালিং ও পারফরম্যান্স রিভিউ",
];

export const STORE_BUNDLES_STATIC: StoreBundleStaticItem[] = [
  {
    id: 1,
    slug: "pdf-package",
    titleEn: "Free eBook Package",
    titleBn: "Free eBook Package",
    descriptionEn: "Select from 15 structured learning PDFs with complete chart breakdowns.",
    descriptionBn: "১৫টি স্ট্রাকচার্ড চার্ট ব্রেকডাউন ও প্রাইস অ্যাকশন PDF থেকে সিলেক্ট করুন।",
    price: "0",
    priceUsd: "0",
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
    slug: "course-ebook",
    titleEn: "CYCLE OF CHART BASIC TO ADVANCE COURSE",
    titleBn: "CYCLE OF CHART BASIC TO ADVANCE COURSE",
    descriptionEn: "A complete structured learning path with an included comprehensive eBook.",
    descriptionBn: "একটি সম্পূর্ণ ভিডিও কোর্স সাথে সম্পূর্ণ ফ্রি প্রফেশনাল গাইড eBook।",
    price: "2499",
    priceUsd: "20",
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
    id: 4,
    slug: "pro-blueprint",
    titleEn: "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT",
    titleBn: "CYCLE OF CHART — PROFESSIONAL TRADING BLUEPRINT",
    descriptionEn: "",
    descriptionBn: "",
    originalPrice: "5550",
    price: "4999",
    priceUsd: "40",
    badgeEn: "PROFESSIONAL",
    badgeBn: "প্রফেশনাল",
    featuresEn: [
      "Complete A–Z Trading Blueprint",
      "To take this course, you need to have a basic understanding of the market.",
      "Lifetime Access + Future Update",
    ],
    featuresBn: [
      "Complete A–Z Trading Blueprint",
      "To take this course, you need to have a basic understanding of the market.",
      "Lifetime Access + Future Update",
    ],
    highlight: false,
  },
];

export const TRADING_PLATFORMS: TradingPlatformStaticItem[] = [
  {
    id: "tradingview",
    name: "TradingView",
    descEn: "Advanced charting, market analysis & indicators",
    descBn: "অ্যাডভান্সড চার্ট, টেকনিক্যাল অ্যানালাইসিস ও ইন্ডিকেটরস",
    devices: "Windows · macOS · iOS · Android",
    url: "https://www.tradingview.com/desktop/",
    icon: React.createElement(
      "svg",
      { className: "h-10 w-10", viewBox: "0 0 40 40", fill: "none" },
      React.createElement("rect", { width: "40", height: "40", rx: "10", fill: "#131722" }),
      React.createElement(
        "g",
        { transform: "translate(8, 8)" },
        React.createElement("path", {
          d: "M15.8654 8.2789c0 1.3541-1.0978 2.4519-2.452 2.4519-1.354 0-2.4519-1.0978-2.4519-2.452 0-1.354 1.0978-2.4518 2.452-2.4518 1.3541 0 2.4519 1.0977 2.4519 2.4519zM9.75 6H0v4.9038h4.8462v7.2692H9.75Zm8.5962 0H24l-5.1058 12.173h-5.6538z",
          fill: "#ffffff",
        })
      )
    ),
  },
  {
    id: "forexfactory",
    name: "Forex Factory",
    descEn: "Economic calendar, market news & sentiment analysis",
    descBn: "ইকোনমিক ক্যালেন্ডার, মার্কেট নিউজ ও সেন্টিনেন্ট অ্যানালাইসিস",
    devices: "Web · Mobile · Market Intel",
    url: "https://www.forexfactory.com/",
    icon: React.createElement(
      "svg",
      { className: "h-10 w-10", viewBox: "0 0 40 40", fill: "none" },
      React.createElement("rect", {
        width: "40",
        height: "40",
        rx: "10",
        fill: "#142030",
        stroke: "#f59e0b",
        strokeWidth: "1",
        strokeOpacity: "0.4",
      }),
      React.createElement(
        "text",
        {
          x: "20",
          y: "25",
          textAnchor: "middle",
          fill: "#f59e0b",
          fontSize: "16",
          fontWeight: "900",
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.5px",
        },
        "FF"
      ),
      React.createElement("rect", {
        x: "11",
        y: "28",
        width: "18",
        height: "2.5",
        rx: "1",
        fill: "#f59e0b",
        fillOpacity: "0.85",
      })
    ),
  },
  {
    id: "tradinghours",
    name: "Forex Trading Hours",
    descEn: "Live 24h market session clock & liquidity overlaps",
    descBn: "লাইভ ২৪ঘণ্টা মার্কেট সেশন ক্লক ও লিকুইডিটি ওভারল্যাপ",
    devices: "Web · Live Clock · All Sessions",
    url: "https://www.babypips.com/tools/forex-market-hours",
    icon: React.createElement(
      "svg",
      { className: "h-10 w-10", viewBox: "0 0 40 40", fill: "none" },
      React.createElement("rect", {
        width: "40",
        height: "40",
        rx: "10",
        fill: "#0b172a",
        stroke: "#06b6d4",
        strokeWidth: "1",
        strokeOpacity: "0.4",
      }),
      React.createElement("circle", {
        cx: "20",
        cy: "20",
        r: "12",
        stroke: "#334155",
        strokeWidth: "2",
        strokeDasharray: "2 3",
      }),
      React.createElement("path", {
        d: "M 20 8 A 12 12 0 0 1 32 20",
        stroke: "#06b6d4",
        strokeWidth: "2.5",
        strokeLinecap: "round",
      }),
      React.createElement("path", {
        d: "M 32 20 A 12 12 0 0 1 20 32",
        stroke: "#10b981",
        strokeWidth: "2.5",
        strokeLinecap: "round",
      }),
      React.createElement("circle", { cx: "20", cy: "20", r: "2.5", fill: "#38bdf8" }),
      React.createElement("line", {
        x1: "20",
        y1: "20",
        x2: "20",
        y2: "13",
        stroke: "#ffffff",
        strokeWidth: "2",
        strokeLinecap: "round",
      }),
      React.createElement("line", {
        x1: "20",
        y1: "20",
        x2: "26",
        y2: "20",
        stroke: "#38bdf8",
        strokeWidth: "1.8",
        strokeLinecap: "round",
      })
    ),
  },
];
