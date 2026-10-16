import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Menu,
  Sparkles,
  X,
  Sun,
  Moon,
  Compass,
  ShoppingBag,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { HeaderBrandWordmark } from "@/components/HeaderBrandWordmark";
import { TopNavLinks } from "@/components/TopNavLinks";
import { JournalAnalyticsShowcase } from "@/components/JournalAnalyticsShowcase";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
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
  HeroHexagonBackground,
  TraderBrainEvolutionSection,
  HomeLeaderboardSection,
  HomeFaqSection,
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
  const { formatPrice, currency } = useUserPreferences();
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
    const num = parseFloat(raw);
    if (isNaN(num) || num === 0) return bn ? "০" : "0";
    const formatted = num % 1 === 0 ? num.toString() : num.toFixed(2);
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

  const heroHeadlineLines = useMemo(() => {
    const subtitleParts = (copy.heroSubtitle || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const line2 = subtitleParts[0] || "BEFORE YOU DEPOSIT,";
    const line3 = subtitleParts[1] || "UNDERSTAND TRADING.";

    return { line2, line3 };
  }, [copy.heroSubtitle]);

  return (
    <div
      className={`min-h-screen bg-[var(--bg)] text-[var(--fg)] selection:bg-[#38bdf8] selection:text-[#09111f] dark:bg-transparent dark:text-slate-100 transition-colors duration-300 ${
        language === "bn" ? "font-bangla" : language === "ur" ? "font-urdu" : ""
      }`}
    >
      {/* ========================================================================= */}
      {/* HEADER / NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(37,99,235,0.12)] bg-white/80 text-slate-900 shadow-[var(--card-sh)] backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-[#070e1b]/85 dark:text-white dark:shadow-none">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 sm:px-5 py-2.5 sm:py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
            <BrandLogo size={36} className="shrink-0 sm:size-[42px]" />
            <HeaderBrandWordmark className="text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm font-extrabold shrink-0" />
          </Link>

          {/* Balanced navigation container: centered cleanly between logo and controls without floating too far into the void */}
          <div className="hidden md:flex flex-1 items-center justify-center px-2 lg:px-6">
            <TopNavLinks isBn={isBn} copy={copy} />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Dark / Light Theme Toggle (Visible on md+ screens; also available in mobile dropdown) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Mode"
              className="hidden md:flex size-9 items-center justify-center rounded-full border border-[rgba(37,99,235,0.25)] bg-white/80 text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
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
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-md shadow-blue-500/20 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9"
                >
                  {copy.dashboard}
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="shrink-0">
                <Button
                  size="sm"
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-md shadow-blue-500/20 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 font-bold text-xs sm:text-sm px-3 sm:px-3.5 h-8 sm:h-9"
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[rgba(37,99,235,0.25)] bg-white/80 text-xs font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
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
        <section className="cycle-hero hero play">
          <HeroHexagonBackground />

          <div className="content">
            <div className="badge">
              <i aria-hidden="true" />
              <span>{copy.heroEyebrow}</span>
            </div>

            <h1>
              <span className="ln l2">
                <span className="grad" data-text={heroHeadlineLines.line2}>
                  {heroHeadlineLines.line2}
                </span>
              </span>
              <span className="ln l3">
                <span className="grad" data-text={heroHeadlineLines.line3}>
                  {heroHeadlineLines.line3}
                </span>
              </span>
            </h1>

            <p className="copy">{copy.heroBnSub}</p>

            <div className="cta">
              <a href="#roadmap" className="hero-btn-pop-1">
                <Button
                  size="lg"
                  className="hero-btn hero-btn-primary group relative h-11 sm:h-12 rounded-xl px-6 sm:px-8 text-sm sm:text-base font-bold shadow-md"
                >
                  <Compass size={17} className="mr-2 text-current" />
                  <span>{copy.primaryCta}</span>
                  <ArrowRight
                    size={16}
                    className="hero-btn-arrow ml-2 text-current"
                  />
                </Button>
              </a>

              <a href="#store" className="hero-btn-pop-2">
                <Button
                  size="lg"
                  variant="outline"
                  className="hero-btn hero-btn-ghost h-11 sm:h-12 rounded-xl px-6 sm:px-8 text-sm sm:text-base font-bold shadow-xs"
                >
                  <ShoppingBag size={17} className="mr-2 text-[var(--cyan)]" />
                  <span>{copy.secondaryCta}</span>
                </Button>
              </a>
            </div>

            {/* Trust chips below buttons */}
            <div className="hero-trust-chips mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
              <span className="hero-trust-chip">
                <i aria-hidden="true" />
                <span>{copy.trust1}</span>
              </span>
              <span className="hero-trust-chip">
                <i aria-hidden="true" />
                <span>{copy.trust2}</span>
              </span>
              <span className="hero-trust-chip">
                <i aria-hidden="true" />
                <span>{copy.trust3}</span>
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BEGINNER BRAIN -> PROFESSIONAL TRADER BRAIN EVOLUTION SECTION */}
        {/* ========================================================================= */}
        <TraderBrainEvolutionSection />

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
        {/* GLOBAL LEADERBOARD & TRADER PROGRESS SHOWCASE */}
        {/* ========================================================================= */}
        <HomeLeaderboardSection isBn={isBn} />

        {/* ========================================================================= */}
        {/* STORE & PRODUCTS SECTION */}
        {/* ========================================================================= */}
        <section id="store" className="content-auto bg-[#f8fafc] py-10 sm:py-16 lg:py-24 dark:bg-[#070e1b] transition-colors">

          <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-3 sm:gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">{copy.storeEyebrow}</p>
                <h2 className="mt-2 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-.03em] text-slate-900 dark:text-white whitespace-pre-line leading-tight">
                  {copy.storeTitle}
                </h2>
              </div>
            </div>

            {/* PRICING & PAYMENT INFORMATION NOTICE */}
            <div className="mt-5 sm:mt-8 rounded-xl sm:rounded-2xl border border-sky-500/30 bg-sky-500/[0.04] p-3.5 sm:p-5 lg:p-6 dark:border-sky-500/20 dark:bg-[#0c182c]/80 shadow-xs">
              <div className="flex items-center gap-2 sm:gap-2.5 pb-2 sm:pb-2.5 border-b border-sky-500/15">
                <div className="flex h-6 sm:h-7 px-1.5 sm:px-2 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500 border border-sky-500/25 shrink-0">
                  <Sparkles size={13} className="sm:size-3.5" />
                </div>
                <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  PRICING &amp; PAYMENT INFORMATION
                </h3>
              </div>

              <div className="mt-2.5 sm:mt-3 space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white font-extrabold">Bangladesh:</strong> BDT prices apply when paying in Bangladeshi Taka (৳).
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white font-extrabold">International:</strong> USD prices apply when paying in US Dollars ($).
                </p>
              </div>

              <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                Please select the appropriate currency and payment method at checkout.
              </p>
            </div>

            <div ref={pricingRef} className="mt-6 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 items-stretch max-w-7xl mx-auto">
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
                      className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-3 hover:scale-[1.03] active:scale-[0.99] h-full ${
                        isPopular
                          ? "bg-white text-slate-900 border-2 border-[#2563eb] shadow-2xl shadow-blue-500/15 dark:bg-slate-800 dark:text-white dark:border-sky-400 dark:shadow-sky-950/60 lg:-translate-y-2 hover:border-[#1d4ed8] dark:hover:border-sky-300"
                          : "border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-200/50 hover:border-sky-400/80 hover:shadow-2xl hover:shadow-sky-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:shadow-none dark:hover:border-sky-500/50"
                      }`}
                    >
                    {/* Top Popular Glow Ribbon */}
                    {isPopular && (
                      <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-3 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                        {topRibbonText}
                      </div>
                    )}

                    <div>
                      {/* Card Header Badge & Icon */}
                      <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                        {item.badgeEn ? (
                          <span
                            className={`rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[.14em] sm:tracking-[.16em] ${
                              isPopular
                                ? "bg-blue-500/10 text-[#2563eb] dark:bg-white/15 dark:text-[#38bdf8]"
                                : "bg-[#eef3f6] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {selectText({ en: item.badgeEn || "PACKAGE", bn: item.badgeBn || "প্যাকেজ", ur: item.badgeUr || "پیکج" })}
                          </span>
                        ) : (
                          <span />
                        )}
                        <Sparkles
                          size={16}
                          className={`transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125 sm:size-[18px] ${
                            isPopular ? "text-[#2563eb] dark:text-[#38bdf8]" : "text-slate-400 group-hover:text-sky-500"
                          }`}
                        />
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 sm:mt-6 text-lg sm:text-2xl font-extrabold tracking-tight">
                        {selectText({ en: item.titleEn, bn: item.titleBn, ur: item.titleUr || item.titleEn })}
                      </h3>

                      {/* Description */}
                      {Boolean(selectText({ en: item.descriptionEn, bn: item.descriptionBn, ur: item.descriptionUr })) && (
                        <p
                          className={`mt-1.5 sm:mt-2.5 text-xs sm:text-sm leading-relaxed ${
                            isPopular ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {selectText({ en: item.descriptionEn, bn: item.descriptionBn, ur: item.descriptionUr })}
                        </p>
                      )}

                      {/* Included Features Checklist */}
                      <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2.5 border-t border-dashed border-slate-200/60 pt-3.5 sm:pt-5 dark:border-slate-700/60">
                        {features.map((feat: string, fIdx: number) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                            <CheckCircle2
                              size={14}
                              className={`mt-0.5 shrink-0 sm:size-[15px] ${
                                isPopular ? "text-[#2563eb] dark:text-[#38bdf8]" : "text-emerald-500 dark:text-emerald-400"
                              }`}
                            />
                            <span
                              className={`leading-tight font-medium ${
                                isPopular ? "text-slate-800 dark:text-slate-200" : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {feat}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & CTA Button */}
                    <div className="mt-5 sm:mt-8 border-t border-slate-100 pt-3.5 sm:pt-5 dark:border-slate-800">
                      <div className="mb-3 sm:mb-4">
                        {isFreePackage ? (
                          <div className="flex flex-col gap-0.5" dir="ltr">
                            <span className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                              ৳0 BDT
                            </span>
                            <span className="text-lg sm:text-2xl font-bold text-slate-500 dark:text-slate-400">
                              $0 USD
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5" dir="ltr">
                            {item.originalPrice && (
                              <span className="text-xs sm:text-base font-bold line-through text-slate-400 dark:text-slate-500">
                                ৳{formatBdt(item.originalPrice, false, "5550")} BDT
                              </span>
                            )}
                            <span className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                              ৳{formatBdt(item.price, false, item.id === 2 ? "2499" : "4999")} BDT
                            </span>
                            <span
                              className={`text-lg sm:text-2xl font-bold ${
                                isPopular
                                  ? "text-[#2563eb] dark:text-[#38bdf8]"
                                  : "text-sky-600 dark:text-sky-400"
                              }`}
                            >
                              ${formatUsd(item.priceUsd, false, item.id === 2 ? "19.99" : "39.99")} USD
                            </span>
                          </div>
                        )}
                      </div>

                      <Link href={`/checkout?bundle=${item.id}`} className="block w-full">
                        <Button
                          size="lg"
                          className={`group/btn w-full h-10 sm:h-12 gap-2 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition-all duration-200 active:scale-[0.98] ${
                            isPopular
                              ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-500/25 dark:bg-[#38bdf8] dark:text-slate-950 dark:hover:bg-[#7dd3fc]"
                              : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                          }`}
                        >
                          <span>{copy.viewBundle}</span>
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-200 group-hover/btn:translate-x-1 sm:size-4"
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
        <section className="bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#0284c7] py-12 sm:py-20 text-white dark:bg-[#070e1b] dark:from-[#070e1b] dark:via-[#070e1b] dark:to-[#070e1b]">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:gap-8 px-4 sm:px-5 sm:flex-row sm:items-center lg:px-8">
            <div>
              <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[.2em] text-sky-200 dark:text-[#38bdf8]">
                {copy.ctaEyebrow}
              </p>
              <h2 className="mt-2 sm:mt-4 max-w-2xl text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-[-.03em] whitespace-pre-line">
                {copy.ctaTitle}
              </h2>
            </div>
            <a href="#roadmap">
              <Button size="lg" className="w-fit h-10 sm:h-12 rounded-xl bg-white font-bold text-xs sm:text-sm text-[#1d4ed8] hover:bg-slate-100 shadow-lg dark:bg-[#38bdf8] dark:text-[#08111f] dark:hover:bg-[#7dd3fc]">
                {copy.ctaButton} <ArrowRight size={15} className="ml-1 sm:size-[17px]" />
              </Button>
            </a>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TRADING APPS / PLATFORMS */}
        {/* ========================================================================= */}
        <section
          id="trading-platforms"
          className="relative py-10 sm:py-16 text-slate-900 dark:text-white bg-slate-100/50 dark:bg-[#070e1b]"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
            <div className="mb-5 sm:mb-8">
              <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[.2em] text-[#0284c7] dark:text-[#38bdf8]">
                {copy.platformsEyebrow}
              </p>
              <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {copy.platformsTitle}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                {copy.platformsDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {TRADING_PLATFORMS.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white/85 p-3.5 sm:p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-sky-400/50 dark:hover:bg-slate-900/90"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105">
                        {platform.icon}
                      </div>
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-sky-500/10 group-hover:text-sky-600 dark:bg-slate-800/80 dark:text-slate-500 dark:group-hover:text-sky-400">
                        <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                    </div>

                    <h3 className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg font-bold text-slate-900 transition-colors group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                      {platform.name}
                    </h3>
                    <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {selectText({ en: platform.descEn, bn: platform.descBn, ur: platform.descUr })}
                    </p>
                  </div>

                  <div className="mt-3.5 sm:mt-5 flex items-center justify-between border-t border-slate-100 pt-2.5 sm:pt-4 text-[11px] sm:text-xs dark:border-slate-800/80">
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

        <HomeFaqSection />
      </main>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#08111f] py-10 text-white dark:bg-[#070e1b]">
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
