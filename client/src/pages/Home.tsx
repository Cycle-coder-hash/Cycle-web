import { useMemo, useState, useEffect, useRef } from "react";
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
  Award,
  Clock3,
  Clock,
  Calendar,
  GraduationCap,
  TrendingUp,
  Shield,
  Activity,
  Users,
  Send,
  Mail,
  Globe,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { HeroCandle3D } from "@/components/HeroCandle3D";
import { AnimatedCardBorder } from "@/components/AnimatedCardBorder";
import { AnimatedRgbBorder } from "@/components/AnimatedRgbBorder";
import { TopNavLinks } from "@/components/TopNavLinks";
import { NewsHeadlineStats } from "@/components/NewsHeadlineStats";
import { JournalAnalyticsShowcase } from "@/components/JournalAnalyticsShowcase";
import { useTheme } from "@/contexts/ThemeContext";
import { FreeEbookModal } from "@/components/ebook/FreeEbookModal";

import {
  type StageDetail,
  STAGES_DETAILS_EN,
  STAGES_DETAILS_BN,
} from "@/data/roadmapStages";

export {
  type StageDetail,
  STAGES_DETAILS_EN,
  STAGES_DETAILS_BN,
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


const STORE_BUNDLES_STATIC = [
  {
    id: 1,
    slug: "pdf-package",
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
    slug: "course-ebook",
    titleEn: "CYCLE OF CHART BASIC TO ADVANCE COURSE",
    titleBn: "CYCLE OF CHART BASIC TO ADVANCE COURSE",
    descriptionEn: "A complete structured learning path with an included comprehensive eBook.",
    descriptionBn: "একটি সম্পূর্ণ ভিডিও কোর্স সাথে সম্পূর্ণ ফ্রি প্রফেশনাল গাইড eBook।",
    price: "2499",
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
    price: "3999",
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

const TRADING_PLATFORMS = [
  {
    id: "tradingview",
    name: "TradingView",
    descEn: "Advanced charting, market analysis & indicators",
    descBn: "অ্যাডভান্সড চার্ট, টেকনিক্যাল অ্যানালাইসিস ও ইন্ডিকেটরস",
    devices: "Windows · macOS · iOS · Android",
    url: "https://www.tradingview.com/desktop/",
    icon: (
      <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#131722" />
        <g transform="translate(8, 8)">
          <path
            d="M15.8654 8.2789c0 1.3541-1.0978 2.4519-2.452 2.4519-1.354 0-2.4519-1.0978-2.4519-2.452 0-1.354 1.0978-2.4518 2.452-2.4518 1.3541 0 2.4519 1.0977 2.4519 2.4519zM9.75 6H0v4.9038h4.8462v7.2692H9.75Zm8.5962 0H24l-5.1058 12.173h-5.6538z"
            fill="#ffffff"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "forexfactory",
    name: "Forex Factory",
    descEn: "Economic calendar, market news & sentiment analysis",
    descBn: "ইকোনমিক ক্যালেন্ডার, মার্কেট নিউজ ও সেন্টিনেন্ট অ্যানালাইসিস",
    devices: "Web · Mobile · Market Intel",
    url: "https://www.forexfactory.com/",
    icon: (
      <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#142030" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        <text
          x="20"
          y="25"
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="16"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5px"
        >
          FF
        </text>
        <rect x="11" y="28" width="18" height="2.5" rx="1" fill="#f59e0b" fillOpacity="0.85" />
      </svg>
    ),
  },
  {
    id: "tradinghours",
    name: "Forex Trading Hours",
    descEn: "Live 24h market session clock & liquidity overlaps",
    descBn: "লাইভ ২৪ঘণ্টা মার্কেট সেশন ক্লক ও লিকুইডিটি ওভারল্যাপ",
    devices: "Web · Live Clock · All Sessions",
    url: "https://www.babypips.com/tools/forex-market-hours",
    icon: (
      <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#0b172a" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="20" cy="20" r="12" stroke="#334155" strokeWidth="2" strokeDasharray="2 3" />
        <path d="M 20 8 A 12 12 0 0 1 32 20" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 32 20 A 12 12 0 0 1 20 32" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="2.5" fill="#38bdf8" />
        <line x1="20" y1="20" x2="20" y2="13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="20" x2="26" y2="20" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

function renderOwnerStatIcon(iconName?: string, className: string = "size-5") {
  switch (iconName) {
    case "clock":
      return <Clock className={className} />;
    case "calendar":
      return <Calendar className={className} />;
    case "trending":
    case "trending-up":
      return <TrendingUp className={className} />;
    case "shield":
      return <Shield className={className} />;
    case "users":
      return <Users className={className} />;
    case "userCheck":
    case "user-check":
      return <UserCheck className={className} />;
    case "graduation":
    case "graduation-cap":
      return <GraduationCap className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "target":
      return <Target className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "activity":
      return <Activity className={className} />;
    case "award":
    default:
      return <Award className={className} />;
  }
}

export default function Home() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<"en" | "bn">(() => (localStorage.getItem("cycle-language") as "en" | "bn") || "en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [selectedStageModal, setSelectedStageModal] = useState<number | null>(null);
  const [isFreeEbookModalOpen, setIsFreeEbookModalOpen] = useState(false);
  const { data: bundles } = trpc.public.bundles.useQuery();
  const { data: products } = trpc.public.products.useQuery();
  const { data: ownerProfile } = trpc.public.ownerProfile.useQuery(undefined, {
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const storeBundles = useMemo(() => {
    return STORE_BUNDLES_STATIC.map((base) => {
      const apiItem = (bundles || []).find((b: any) => b.id === base.id || b.slug === base.slug);
      return apiItem
        ? {
            ...base,
            price:
              apiItem.price && apiItem.price !== "1999.00" && apiItem.price !== "1999"
                ? apiItem.price
                : base.price,
            titleEn: apiItem.titleEn || base.titleEn,
            titleBn: apiItem.titleBn || base.titleBn,
          }
        : base;
    });
  }, [bundles]);

  // Auto-open Free eBook Library modal when returning from login/registration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "open_free_ebooks" || window.location.hash === "#free-ebooks") {
      if (user) {
        setIsFreeEbookModalOpen(true);
      }
      const storeEl = document.getElementById("store");
      if (storeEl) {
        setTimeout(() => {
          storeEl.scrollIntoView({ behavior: "smooth" });
        }, 200);
      }
    }
  }, [user]);

  const pricingRef = useRef<HTMLDivElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    if (!pricingRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setCardsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setCardsVisible(true);
        } else {
          setCardsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(pricingRef.current);

    const replayStoreAnimation = () => {
      setCardsVisible(false);
      setTimeout(() => {
        setCardsVisible(true);
      }, 50);
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href="#store"]');
      if (anchor) {
        replayStoreAnimation();
      }
    };

    const handleHashChange = () => {
      if (window.location.hash === "#store") {
        replayStoreAnimation();
      }
    };

    document.addEventListener("click", handleAnchorClick, { passive: true });
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

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
            navLeaderboard: "লিডারবোর্ড",
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
            platformsEyebrow: "ট্রেডিং অ্যাপস ও প্ল্যাটফর্ম",
            platformsTitle: "টেকনিক্যাল অ্যানালাইসিস ও ফান্ডামেন্টাল অ্যানালাইসিস টুলস",
            platformsDesc: "চার্ট অ্যানালাইসিস এবং লাইভ মার্কেট এক্সিকিউশনের জন্য অফিসিয়াল প্ল্যাটফর্মগুলো ডাউনলোড করুন।",
            platformsDownload: "ডাউনলোড পেজ",
            ownerEyebrow: "ফাউন্ডার পরিচিতি",
            ownerTitle: "সাইকেল অব চার্ট-এর রূপকার",
            ownerDesc: "প্রতিষ্ঠানিক ট্রেডিং অভিজ্ঞতা ও গভীর মার্কেট রিয়ালিটি নিয়ে তৈরি বিশ্বস্ত এডুকেশনাল প্ল্যাটফর্ম।",
            ownerExpLabel: "ট্রেডিং অভিজ্ঞতা",
            ownerStudentsLabel: "প্রশিক্ষণপ্রাপ্ত শিক্ষার্থী",
            ownerStyleLabel: "কোর মেথডোলজি",
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
            navLeaderboard: "Leaderboard",
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
            platformsEyebrow: "TRADING APPS & PLATFORMS",
            platformsTitle: "Technical Analysis & Fundamental Analysis Tools",
            platformsDesc: "Download official desktop and mobile applications for institutional chart analysis and market execution.",
            platformsDownload: "Download options",
            ownerEyebrow: "FOUNDER & LEAD MENTOR",
            ownerTitle: "The Mind Behind Cycle of Chart",
            ownerDesc: "Dedicated to transforming retail traders through systematic Candle Range Theory, strict risk architecture, and authentic market reality.",
            ownerExpLabel: "Market Experience",
            ownerStudentsLabel: "Traders Mentored",
            ownerStyleLabel: "Core Methodology",
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
      className={`min-h-screen bg-[#f8fafc] text-[#09111f] selection:bg-[#38bdf8] selection:text-[#09111f] dark:bg-transparent dark:text-slate-100 transition-colors duration-300 ${
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

          <TopNavLinks isBn={isBn} copy={copy} />

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
          <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg dark:border-slate-800 dark:bg-[#070e1b] md:hidden">
            <TopNavLinks
              isBn={isBn}
              copy={copy}
              mobile
              onItemClick={() => setMenuOpen(false)}
            />
          </div>
        )}
      </header>

      <main>
        {/* ========================================================================= */}
        {/* HERO PANEL */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#ffffff] via-[#f0f7ff] to-[#e6f2fe] pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-24 dark:from-transparent dark:via-transparent dark:to-transparent transition-colors duration-300">
          <div className="pointer-events-none absolute top-12 -left-20 size-[500px] rounded-full bg-sky-200/40 blur-[120px] dark:hidden ambient-blur-blob hidden sm:block" />
          <div className="pointer-events-none absolute top-20 right-0 size-[600px] rounded-full bg-sky-300/45 blur-[140px] dark:hidden ambient-blur-blob hidden sm:block" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 size-[400px] rounded-full bg-blue-200/30 blur-[100px] dark:hidden ambient-blur-blob hidden sm:block" />


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
            <NewsHeadlineStats isBn={isBn} />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* POWERFUL JOURNAL ANALYTICS SHOWCASE */}
        {/* ========================================================================= */}
        <JournalAnalyticsShowcase isBn={isBn} />

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
              <div className="relative rounded-3xl border border-rose-200 bg-white p-7 shadow-sm dark:border-rose-900/40 dark:bg-slate-900/90">
                <AnimatedCardBorder color="red" />
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

              <div className="relative rounded-3xl bg-[#0d1a2d] p-7 text-white shadow-xl shadow-[#0d1a2d]/25 dark:bg-slate-800 dark:shadow-slate-950/50 border border-slate-700/50">
                <AnimatedCardBorder color="green" />
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
        <section id="roadmap" className="content-auto bg-white py-16 sm:py-24 dark:bg-[#070e1b] lg:py-32 transition-colors">

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
        <section id="store" className="content-auto bg-[#f8fafc] py-16 sm:py-24 dark:bg-[#070e1b] transition-colors">

          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">{copy.storeEyebrow}</p>
                <h2 className="mt-4 text-4xl font-extrabold tracking-[-.03em] text-slate-900 dark:text-white whitespace-pre-line leading-tight">
                  {copy.storeTitle}
                </h2>
              </div>
            </div>

            <div ref={pricingRef} className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 items-stretch max-w-7xl mx-auto">
              {storeBundles.map((item: any, i: number) => {
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

                const isFreePackage = item.id === 1 || item.slug === "pdf-package" || item.titleEn?.toLowerCase().includes("free ebook");

                const handleCardClick = () => {
                  if (isFreePackage) {
                    if (!user) {
                      sessionStorage.setItem("cycle_auth_redirect", "/?action=open_free_ebooks#store");
                      window.location.href = `/login?redirect=${encodeURIComponent("/?action=open_free_ebooks#store")}`;
                    } else {
                      setIsFreeEbookModalOpen(true);
                    }
                  }
                };

                return (
                  <div
                    key={item.id}
                    className={`${cardsVisible ? "bundle-card-enter" : "bundle-card-initial"} flex flex-col h-full`}
                  >
                    <div
                      onClick={handleCardClick}
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
                        {item.badgeEn ? (
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.16em] ${
                              isPopular
                                ? "bg-white/15 text-[#38bdf8]"
                                : "bg-[#eef3f6] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {isBn ? item.badgeBn || "প্যাকেজ" : item.badgeEn || "PACKAGE"}
                          </span>
                        ) : (
                          <span />
                        )}
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
                      {Boolean(isBn ? item.descriptionBn : item.descriptionEn) && (
                        <p
                          className={`mt-2.5 text-xs sm:text-sm leading-relaxed ${
                            isPopular ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {isBn ? item.descriptionBn : item.descriptionEn}
                        </p>
                      )}

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
                          <div className="flex items-baseline flex-wrap gap-2.5">
                            {item.originalPrice && (
                              <span className="text-base sm:text-lg font-bold line-through text-slate-400 dark:text-slate-500">
                                ৳{isBn ? String(item.originalPrice).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : item.originalPrice}
                              </span>
                            )}
                            <span className="text-3xl sm:text-4xl font-black tracking-tight">
                              ৳{isBn ? String(item.price).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : item.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isFreePackage ? (
                        <Button
                          type="button"
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick();
                          }}
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
                      ) : (
                        <Link href={`/checkout?bundle=${item.id}`} className="block w-full">
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
                      )}
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
        <section className="bg-gradient-to-r from-[#071a36] via-[#0d2a52] to-[#0a1e3d] py-20 text-white dark:bg-[#070e1b] dark:from-[#070e1b] dark:via-[#070e1b] dark:to-[#070e1b]">
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

        {/* ========================================================================= */}
        {/* TRADING APPS / PLATFORMS */}
        {/* ========================================================================= */}
        <section
          id="trading-platforms"
          className="relative py-14 sm:py-16 text-slate-900 dark:text-white border-t border-slate-200/70 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#070e1b]"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-8">
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#0284c7] dark:text-[#38bdf8]">
                {copy.platformsEyebrow}
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {copy.platformsTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                {copy.platformsDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {TRADING_PLATFORMS.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/85 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-sky-400/50 dark:hover:bg-slate-900/90"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105">
                        {platform.icon}
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-sky-500/10 group-hover:text-sky-600 dark:bg-slate-800/80 dark:text-slate-500 dark:group-hover:text-sky-400">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                    </div>

                    <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 transition-colors group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                      {platform.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {isBn ? platform.descBn : platform.descEn}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800/80">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {platform.devices}
                    </span>
                    <span className="inline-flex items-center font-semibold text-sky-600 transition-transform group-hover:translate-x-0.5 dark:text-sky-400">
                      {copy.platformsDownload}
                      <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* OWNER PROFILE */}
        {/* ========================================================================= */}
        {ownerProfile?.isVisible !== false && (
          <section
            id="owner-profile"
            className="relative py-16 sm:py-24 text-slate-900 dark:text-white border-t border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070e1b] overflow-hidden"
          >
          {/* Subtle atmospheric ambient glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none dark:hidden" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none dark:hidden" />

          <div className="relative mx-auto max-w-7xl px-5 lg:px-8 z-10">
            {/* Section Header */}
            <div className="mb-10 sm:mb-12 text-center max-w-3xl mx-auto">
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#0284c7] dark:text-[#38bdf8]">
                {copy.ownerEyebrow}
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {copy.ownerTitle}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {copy.ownerDesc}
              </p>
            </div>

            {/* Profile Card */}
            {ownerProfile && (
              <div className="relative rounded-3xl border border-slate-200/90 bg-white/85 p-6 sm:p-10 lg:p-12 backdrop-blur-md shadow-xl dark:border-slate-800/90 dark:bg-[#0b162a]/80 dark:shadow-2xl dark:shadow-sky-950/30 transition-all">
                <AnimatedRgbBorder />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                  {/* Left Column: Photo & Name & Role & Socials */}
                  <div className="lg:col-span-4 flex flex-col items-center text-center">
                    <div className="relative group">
                      {/* Ambient Glow */}
                      <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 opacity-60 blur-md group-hover:opacity-85 transition duration-500" />

                      {/* Photo Container */}
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-[24px] overflow-hidden p-1 bg-gradient-to-tr from-sky-500 via-cyan-400 to-blue-600 shadow-xl shadow-sky-500/20">
                        <img
                          src={ownerProfile.photoUrl}
                          alt={ownerProfile.name}
                          className="w-full h-full object-cover object-top rounded-[20px] transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <h3 className="mt-5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                      {ownerProfile.name}
                    </h3>

                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300 border border-sky-500/20">
                      <ShieldCheck size={14} className="text-sky-500 shrink-0" />
                      <span>{isBn && ownerProfile.roleBn ? ownerProfile.roleBn : ownerProfile.role}</span>
                    </div>

                    {/* Social Media & Contact Links */}
                    {(ownerProfile.telegram ||
                      ownerProfile.youtube ||
                      ownerProfile.facebook ||
                      ownerProfile.twitter ||
                      ownerProfile.email) && (
                      <div className="mt-5 flex items-center justify-center gap-2.5">
                        {ownerProfile.telegram && (
                          <a
                            href={ownerProfile.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-sky-500/15 hover:text-sky-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-sky-500/20 dark:hover:text-sky-400 transition-all shadow-sm"
                            title="Telegram"
                          >
                            <Send size={15} />
                          </a>
                        )}
                        {ownerProfile.youtube && (
                          <a
                            href={ownerProfile.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-500/15 hover:text-rose-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-all shadow-sm"
                            title="YouTube"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        {ownerProfile.facebook && (
                          <a
                            href={ownerProfile.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-500/15 hover:text-blue-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 transition-all shadow-sm"
                            title="Facebook"
                          >
                            <Globe size={15} />
                          </a>
                        )}
                        {ownerProfile.twitter && (
                          <a
                            href={ownerProfile.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-sky-500/15 hover:text-sky-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-sky-500/20 dark:hover:text-sky-400 transition-all shadow-sm"
                            title="Twitter / X"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        {ownerProfile.email && (
                          <a
                            href={`mailto:${ownerProfile.email}`}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-500/15 hover:text-emerald-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400 transition-all shadow-sm"
                            title="Email"
                          >
                            <Mail size={15} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Bio, Methodology & Metrics */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Bio Text */}
                    <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                      <p className="font-medium whitespace-pre-line">
                        {isBn && ownerProfile.bioBn
                          ? ownerProfile.bioBn
                          : ownerProfile.bioEn ||
                            "Specializing in institutional price delivery, market structure, liquidity dynamics, and price action. Dedicated to replacing emotional speculation with structured understanding, systematic analysis, and disciplined execution."}
                      </p>
                      {ownerProfile.showDetailsParagraph && (ownerProfile.detailsBn || ownerProfile.detailsEn) && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed pt-1">
                          {isBn && ownerProfile.detailsBn ? ownerProfile.detailsBn : ownerProfile.detailsEn}
                        </p>
                      )}
                    </div>

                    {/* Dynamic Credentials & Statistic Cards */}
                    {(() => {
                      const activeCards = [];
                      if (ownerProfile.showExperienceCard) {
                        activeCards.push({
                          key: "exp",
                          label: ownerProfile.experienceLabel || copy.ownerExpLabel,
                          value: ownerProfile.experienceYears || "6+ Years",
                          icon: ownerProfile.experienceIcon || "clock",
                          iconBg: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-400",
                        });
                      }
                      if (ownerProfile.showMentoredCard) {
                        activeCards.push({
                          key: "mentored",
                          label: ownerProfile.mentoredLabel || copy.ownerStudentsLabel,
                          value: ownerProfile.studentsCount || "1,500+",
                          icon: ownerProfile.mentoredIcon || "users",
                          iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
                        });
                      }
                      if (ownerProfile.showMethodologyCard !== false) {
                        activeCards.push({
                          key: "methodology",
                          label: ownerProfile.methodologyLabel || copy.ownerStyleLabel,
                          value: ownerProfile.tradingStyle || "Institutional Order Flow, Liquidity & (SMC)",
                          icon: ownerProfile.methodologyIcon || "award",
                          iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
                        });
                      }

                      if (activeCards.length === 0) return null;

                      if (activeCards.length === 1) {
                        const card = activeCards[0];
                        return (
                          <div className="flex justify-center pt-2">
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                                {renderOwnerStatIcon(card.icon, "size-5")}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                  {card.label}
                                </div>
                                <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                                  {card.value}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className={`grid grid-cols-1 ${activeCards.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3 pt-2`}>
                          {activeCards.map((card) => (
                            <div key={card.key} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                                {renderOwnerStatIcon(card.icon, "size-5")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                                  {card.label}
                                </div>
                                <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                                  {card.value}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#08111f] py-10 text-white dark:bg-[#070e1b] border-t border-slate-800/60">
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

      {/* Free eBook Library Modal (Auth-Gated) */}
      <FreeEbookModal
        isOpen={isFreeEbookModalOpen}
        onClose={() => setIsFreeEbookModalOpen(false)}
        isBn={isBn}
      />
    </div>
  );
}
