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
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Clock3,
  Send,
  Mail,
  Globe,
  Crown,
  Video,
  Dumbbell,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { HeroCandle3D } from "@/components/HeroCandle3D";
import { TopNavLinks } from "@/components/TopNavLinks";
import { NewsHeadlineStats } from "@/components/NewsHeadlineStats";
import { JournalAnalyticsShowcase } from "@/components/JournalAnalyticsShowcase";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { FreeEbookModal } from "@/components/ebook/FreeEbookModal";

import {
  type StageDetail,
  STAGES_DETAILS_EN,
  STAGES_DETAILS_BN,
  STAGES_DETAILS_UR,
  getDashboardRoadmapStages,
} from "@/data/roadmapStages";
import {
  STORE_BUNDLES_STATIC,
  TRADING_PLATFORMS,
  HomePlansSection,
  HomeOwnerProfileSection,
  HomeRoadmapAndShiftSection,
} from "@/features/marketing";

export {
  type StageDetail,
  STAGES_DETAILS_EN,
  STAGES_DETAILS_BN,
  STAGES_DETAILS_UR,
};

export default function Home() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, isRTL, selectText } = useLanguage();
  const isBn = language === "bn";
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [selectedStageModal, setSelectedStageModal] = useState<number | null>(null);
  const [selectedPlanModal, setSelectedPlanModal] = useState<"free" | "pro" | "premium" | null>(null);
  const [isFreeEbookModalOpen, setIsFreeEbookModalOpen] = useState(false);
  const { data: bundles } = trpc.public.bundles.useQuery();
  const { data: products } = trpc.public.products.useQuery();
  const { data: paymentSettings } = trpc.public.paymentSettings.useQuery();
  const { data: ownerProfile } = trpc.public.ownerProfile.useQuery(undefined, {
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const formatBdt = (val: string | number | undefined, bn: boolean, fallback = "0") => {
    const raw = val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : fallback;
    const num = parseInt(raw.replace(/\D/g, "") || "0", 10);
    if (num === 0) return bn ? "০" : "0";
    const formatted = num.toLocaleString("en-US");
    return bn ? formatted.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : formatted;
  };

  const formatUsd = (val: string | number | undefined, bn: boolean, fallback = "0") => {
    const raw = val !== undefined && val !== null && String(val).trim() !== "" ? String(val) : fallback;
    const num = parseInt(raw.replace(/\D/g, "") || "0", 10);
    const formatted = num === 0 ? "0" : num.toLocaleString("en-US");
    return bn ? formatted.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]) : formatted;
  };

  const storeBundles = useMemo(() => {
    return STORE_BUNDLES_STATIC.map((base) => {
      const apiItem = (bundles || []).find((b: any) => b.id === base.id || b.slug === base.slug);
      return apiItem
        ? {
            ...base,
            price:
              apiItem.price && apiItem.price !== "1999.00" && apiItem.price !== "1999" && apiItem.price !== "3999"
                ? apiItem.price
                : base.price,
            priceUsd: apiItem.priceUsd || base.priceUsd,
            originalPrice: apiItem.originalPrice || base.originalPrice,
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
    } else if (window.location.hash === "#store") {
      const storeEl = document.getElementById("store");
      if (storeEl) {
        setTimeout(() => {
          storeEl.scrollIntoView({ behavior: "smooth" });
        }, 150);
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
    document.documentElement.lang = language;
  }, [language]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedStageModal(null);
        setSelectedPlanModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const stagesData = useMemo(() => getDashboardRoadmapStages(language), [language]);
  const activeModalData = selectedStageModal !== null ? stagesData[selectedStageModal] : null;

  const copy = useMemo(
    () => ({
      navRoadmap: t("nav.roadmap"),
      navStore: t("nav.store"),
      navFree: t("nav.freeBasics"),
      navLeaderboard: t("nav.leaderboard"),
      navSupport: t("nav.support"),
      signIn: t("nav.signIn"),
      dashboard: t("nav.dashboard"),
      heroEyebrow: t("hero.eyebrow"),
      heroTitle: t("hero.title"),
      heroSubtitle: t("hero.subtitle"),
      heroBnSub: t("hero.subtext"),
      primaryCta: t("hero.startRoadmap"),
      secondaryCta: t("hero.exploreStore"),
      trust1: t("hero.trust1"),
      trust2: t("hero.trust2"),
      trust3: t("hero.trust3"),
      shiftEyebrow: t("shift.eyebrow"),
      shiftTitle1: t("shift.title1"),
      shiftTitle2: t("shift.title2"),
      shiftDesc: t("shift.desc"),
      hypeHeader: t("shift.hypeHeader"),
      realityHeader: t("shift.realityHeader"),
      roadmapEyebrow: t("roadmap.eyebrow"),
      roadmapTitle1: t("roadmap.title1"),
      roadmapTitle2: t("roadmap.title2"),
      roadmapDesc: t("roadmap.desc"),
      freeEyebrow: t("freeBasics.eyebrow"),
      freeTitle: t("freeBasics.title"),
      freeDesc: t("freeBasics.desc"),
      freeCta: t("freeBasics.cta"),
      freeCard1Title: t("freeBasics.card1Title"),
      freeCard1Desc: t("freeBasics.card1Desc"),
      freeCard2Title: t("freeBasics.card2Title"),
      freeCard2Desc: t("freeBasics.card2Desc"),
      storeEyebrow: t("store.eyebrow"),
      storeTitle: t("store.title"),
      viewBundle: t("store.viewBundle"),
      ebookNotice: t("store.includedNotice"),
      productsReady: t("store.productsReady"),
      ctaEyebrow: selectText({
        en: "YOUR CAPITAL, YOUR DECISION",
        bn: "আপনার মূলধন, আপনার সিদ্ধান্ত",
        ur: "آپ کا سرمایہ، آپ کا فیصلہ",
      }),
      ctaTitle: selectText({
        en: "You do not need more signals.\nYou need more understanding.",
        bn: "আপনার অতিরিক্ত VIP Group বা Signal-এর প্রয়োজন নেই।\nআপনার প্রয়োজন সঠিকভাবে Market বোঝার ক্ষমতা।",
        ur: "آپ کو مزید سگنلز کی ضرورت نہیں۔\nآپ کو مارکیٹ کو سمجھنے کی ضرورت ہے۔",
      }),
      ctaButton: selectText({
        en: "Build your process",
        bn: "আপনার প্রসেস তৈরি করুন",
        ur: "اپنا منظم نظام بنائیں",
      }),
      platformsEyebrow: t("platforms.eyebrow"),
      platformsTitle: t("platforms.title"),
      platformsDesc: t("platforms.desc"),
      platformsDownload: t("platforms.downloadBtn"),
      ownerEyebrow: t("founder.eyebrow"),
      ownerTitle: t("founder.title"),
      ownerDesc: t("founder.desc"),
      ownerExpLabel: t("founder.experience"),
      ownerStudentsLabel: t("founder.students"),
      ownerStyleLabel: t("founder.methodology"),
      footerDesc: t("footer.tagline"),
      footerLegal: t("footer.disclaimer"),
      modalStageOf: t("roadmap.stageOf"),
      modalOutOf: t("roadmap.outOf"),
      modalKeyTakeaways: t("roadmap.whatYouLearn"),
      modalExercise: t("roadmap.exercise"),
      modalEdge: t("roadmap.edge"),
      modalPrev: t("roadmap.prevStage"),
      modalNext: t("roadmap.nextStage"),
      modalClose: t("roadmap.close"),
      clickPrompt: t("roadmap.clickPrompt"),
    }),
    [t, selectText]
  );

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] text-[#09111f] selection:bg-[#38bdf8] selection:text-[#09111f] dark:bg-transparent dark:text-slate-100 transition-colors duration-300 ${
        language === "bn" ? "font-bangla" : language === "ur" ? "font-urdu" : ""
      }`}
    >
      {/* ========================================================================= */}
      {/* HEADER / NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 text-slate-900 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-[#070e1b]/85 dark:text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
            <BrandLogo size={36} className="shrink-0 sm:size-[42px]" />
            <HeaderBrandWordmark className="text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm font-extrabold shrink-0" />
          </Link>

          <TopNavLinks isBn={isBn} copy={copy} />

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Dark / Light Theme Toggle (Visible on md+ screens; also available in mobile dropdown) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Mode"
              className="hidden md:flex size-9 items-center justify-center rounded-full border border-slate-300/80 bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Language Switcher - compact variant on mobile screens, default on desktop */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            <div className="sm:hidden">
              <LanguageSelector variant="compact" />
            </div>

            {/* Login / Dashboard Auth CTA - Always fully visible, never clipped */}
            {user ? (
              <Link href="/dashboard" className="shrink-0">
                <Button
                  size="sm"
                  className="bg-[#091e3a] text-white hover:bg-[#0c284e] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9"
                >
                  {copy.dashboard}
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9"
                >
                  {copy.signIn}
                </Button>
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              className="flex size-8 sm:size-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white/95 px-4 sm:px-5 py-4 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-[#070e1b]/95 md:hidden animate-in fade-in duration-150">
            <TopNavLinks
              isBn={isBn}
              copy={copy}
              mobile
              onItemClick={() => setMenuOpen(false)}
            />

            {/* Mobile Secondary Controls Bar */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {theme === "dark" ? "Dark Theme" : "Light Theme"}
              </span>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle Dark/Light Mode"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300/80 bg-slate-100 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={15} />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={15} />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
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

              <h1 className="max-w-xl whitespace-pre-line text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] text-[#071a36] dark:text-white sm:text-5xl lg:text-[4.2rem]">
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

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:mt-10 w-full sm:w-auto">
                <a href="#roadmap" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 rounded-xl bg-[#081833] px-7 text-base font-bold text-white shadow-lg shadow-[#081833]/25 transition hover:bg-[#0c244b] hover:shadow-xl active:scale-[0.98] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 dark:shadow-sky-500/20"
                  >
                    <Compass size={18} className="mr-2" />
                    {copy.primaryCta}
                  </Button>
                </a>

                <a href="#store" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 rounded-xl border border-slate-300 bg-white/80 px-7 text-base font-bold text-slate-800 shadow-sm backdrop-blur-md transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700 active:scale-[0.98]"
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
              <HeroCandle3D lang={language} />
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

        <HomeRoadmapAndShiftSection
          isBn={isBn}
          copy={copy}
          stagesData={stagesData}
          activeStage={activeStage}
          setActiveStage={setActiveStage}
          selectedStageModal={selectedStageModal}
          setSelectedStageModal={setSelectedStageModal}
          activeModalData={activeModalData}
        />

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
                const topRibbonText = selectText({
                  en: item.topRibbonEn || "★ MOST POPULAR",
                  bn: item.topRibbonBn || "★ সবচেয়ে জনপ্রিয় চয়েস",
                  ur: item.topRibbonUr || "★ سب سے مقبول انتخاب",
                });
                const features = selectText({
                  en: item.featuresEn || [
                    "Structured Chart Guides",
                    "Lifetime Access",
                    "Mobile & Desktop Readable",
                  ],
                  bn: item.featuresBn || [
                    "১৫টি স্ট্রাকচার্ড চার্ট গাইড",
                    "লাইফটাইম এক্সেস",
                    "মোবাইল ও পিসিতে পড়ার সুবিধা",
                  ],
                  ur: item.featuresUr || [
                    "15 منظم چارٹ گائیڈز",
                    "لائف ٹائم ڈاؤن لوڈ رسائی",
                    "موبائل اور ڈیسک ٹاپ پر پڑھنے کی سہولت",
                  ],
                });

                const isFreePackage = item.id === 1 || item.slug === "pdf-package" || item.titleEn?.toLowerCase().includes("free ebook");

                const handleCardClick = () => {
                  window.location.href = `/checkout?bundle=${item.id}`;
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
                            {selectText({ en: item.badgeEn || "PACKAGE", bn: item.badgeBn || "প্যাকেজ", ur: item.badgeUr || "پیکج" })}
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
                        {selectText({ en: item.titleEn, bn: item.titleBn, ur: item.titleUr || item.titleEn })}
                      </h3>

                      {/* Description */}
                      {Boolean(selectText({ en: item.descriptionEn, bn: item.descriptionBn, ur: item.descriptionUr })) && (
                        <p
                          className={`mt-2.5 text-xs sm:text-sm leading-relaxed ${
                            isPopular ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {selectText({ en: item.descriptionEn, bn: item.descriptionBn, ur: item.descriptionUr })}
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
                          <div className="flex items-baseline flex-wrap gap-2 sm:gap-2.5">
                            {item.originalPrice && (
                              <span className="text-base sm:text-lg font-bold line-through text-slate-400 dark:text-slate-500">
                                ৳{formatBdt(item.originalPrice, isBn, "5550")}
                              </span>
                            )}
                            <span className="text-3xl sm:text-4xl font-black tracking-tight">
                              ৳{formatBdt(item.price, isBn, item.id === 1 ? "0" : item.id === 2 ? "2499" : "4999")}
                            </span>
                            <span className="text-xl sm:text-2xl font-bold text-slate-500 dark:text-slate-400">
                              / ${formatUsd(item.priceUsd, isBn, item.id === 1 ? "0" : item.id === 2 ? "20" : "40")}
                            </span>
                          </div>
                        </div>
                      </div>

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
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </section>

        <HomePlansSection
          isBn={isBn}
          selectedPlanModal={selectedPlanModal}
          setSelectedPlanModal={setSelectedPlanModal}
          pricing={paymentSettings?.pricing}
        />

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
                      {selectText({ en: platform.descEn, bn: platform.descBn, ur: platform.descUr })}
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

        <HomeOwnerProfileSection
          isBn={isBn}
          ownerProfile={ownerProfile}
          copy={copy}
        />
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
