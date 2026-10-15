import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Layers,
  Calendar,
  Edit,
  DollarSign,
  Percent,
  Flame,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  SlidersHorizontal,
  Sparkles,
  ChevronRight,
  Lock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

import {
  PREVIEW_BOOKS,
  PreviewBookId,
  ShowcaseChartMode,
  SHOWCASE_STRATEGY_BOOK_TABS,
  SHOWCASE_CHART_TABS,
  SHOWCASE_TILT_LIMITS,
  SHOWCASE_CHART_MARGIN,
  SHOWCASE_CHART_TOOLTIP_STYLE,
  createInitialParallaxState,
} from "../lib/journalShowcaseData";

const DESIGN_WIDTH = 1100;
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Props {
  isBn?: boolean;
}

export function JournalAnalyticsShowcase({ isBn: _isBnProp }: Props) {
  const { language, selectText } = useLanguage();
  const [selectedBookId, setSelectedBookId] = useState<PreviewBookId>("ragf");
  const [chartMode, setChartMode] = useState<ShowcaseChartMode>("balance");
  const [isVisible, setIsVisible] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Responsive Scaling Engine (forces exact desktop layout, scaled proportionally below 1100px)
  const scalerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef<number>(0);
  const lastHeightRef = useRef<number>(0);

  const [isScaled, setIsScaled] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1140;
    }
    return false;
  });

  const [scale, setScale] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1140) {
      const approxW = Math.min(window.innerWidth - 32, DESIGN_WIDTH);
      return Math.max(0.1, approxW / DESIGN_WIDTH);
    }
    return 1;
  });

  const [scaledHeight, setScaledHeight] = useState<number | undefined>(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1140) {
      const approxW = Math.min(window.innerWidth - 32, DESIGN_WIDTH);
      const s = Math.max(0.1, approxW / DESIGN_WIDTH);
      return Math.ceil(1100 * s);
    }
    return undefined;
  });

  const updateScaleAndHeight = useCallback(() => {
    if (!scalerRef.current || !contentRef.current) return;
    const containerWidth = scalerRef.current.getBoundingClientRect().width;
    if (!containerWidth) return;

    const innerHeight = contentRef.current.offsetHeight;

    if (containerWidth < DESIGN_WIDTH) {
      const nextScale = containerWidth / DESIGN_WIDTH;
      const nextHeight = Math.ceil(innerHeight * nextScale);

      const widthChanged = Math.abs(containerWidth - lastWidthRef.current) > 0.5;
      const heightChanged = Math.abs(nextHeight - lastHeightRef.current) > 1;

      if (widthChanged || heightChanged) {
        lastWidthRef.current = containerWidth;
        lastHeightRef.current = nextHeight;
        setScale(nextScale);
        setIsScaled(true);
        if (innerHeight > 0) {
          setScaledHeight(nextHeight);
        }
      }
    } else {
      if (lastWidthRef.current !== containerWidth || lastHeightRef.current !== 0) {
        lastWidthRef.current = containerWidth;
        lastHeightRef.current = 0;
        setScale(1);
        setIsScaled(false);
        setScaledHeight(undefined);
      }
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    updateScaleAndHeight();
  }, [updateScaleAndHeight]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    updateScaleAndHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateScaleAndHeight);
      window.addEventListener("orientationchange", updateScaleAndHeight);
      return () => {
        window.removeEventListener("resize", updateScaleAndHeight);
        window.removeEventListener("orientationchange", updateScaleAndHeight);
      };
    }

    let rafId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateScaleAndHeight();
      });
    });

    if (scalerRef.current) observer.observe(scalerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        updateScaleAndHeight();
      });
    }

    window.addEventListener("resize", updateScaleAndHeight);
    window.addEventListener("orientationchange", updateScaleAndHeight);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateScaleAndHeight);
      window.removeEventListener("orientationchange", updateScaleAndHeight);
    };
  }, [updateScaleAndHeight, selectedBookId, chartMode]);

  // 3D Parallax Tilt & Cursor Follower Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  const targetRef = useRef(createInitialParallaxState());
  const currentRef = useRef(createInitialParallaxState());

  const rafIdRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);

  // Check pointer capability and reduced motion preferences
  useEffect(() => {
    if (typeof window === "undefined") return;

    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkEligibility = () => {
      setIsPointerFine(finePointerQuery.matches && !reducedMotionQuery.matches);
    };

    checkEligibility();

    finePointerQuery.addEventListener("change", checkEligibility);
    reducedMotionQuery.addEventListener("change", checkEligibility);

    return () => {
      finePointerQuery.removeEventListener("change", checkEligibility);
      reducedMotionQuery.removeEventListener("change", checkEligibility);
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // RAF motion update loop with lerp damping for smooth inertia
  const updateMotion = () => {
    const target = targetRef.current;
    const current = currentRef.current;
    const lerp = 0.08; // smooth inertia damping

    current.rotX += (target.rotX - current.rotX) * lerp;
    current.rotY += (target.rotY - current.rotY) * lerp;
    current.transX += (target.transX - current.transX) * lerp;
    current.transY += (target.transY - current.transY) * lerp;
    current.sheenX += (target.sheenX - current.sheenX) * lerp;
    current.sheenY += (target.sheenY - current.sheenY) * lerp;

    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1200px) rotateX(${current.rotX.toFixed(3)}deg) rotateY(${current.rotY.toFixed(3)}deg) translate3d(${current.transX.toFixed(2)}px, ${current.transY.toFixed(2)}px, 0px)`;
    }

    if (sheenRef.current) {
      sheenRef.current.style.background = `radial-gradient(750px circle at ${current.sheenX.toFixed(1)}% ${current.sheenY.toFixed(1)}%, rgba(56, 189, 248, 0.12), transparent 65%)`;
    }

    const deltaRot = Math.abs(target.rotX - current.rotX) + Math.abs(target.rotY - current.rotY);
    const deltaTrans = Math.abs(target.transX - current.transX) + Math.abs(target.transY - current.transY);

    if (isHoveringRef.current || deltaRot > 0.005 || deltaTrans > 0.03) {
      rafIdRef.current = requestAnimationFrame(updateMotion);
    } else {
      // Settled at neutral (0, 0)
      current.rotX = 0;
      current.rotY = 0;
      current.transX = 0;
      current.transY = 0;
      current.sheenX = 50;
      current.sheenY = 50;
      if (cardRef.current) {
        cardRef.current.style.transform = "";
      }
      if (sheenRef.current) {
        sheenRef.current.style.opacity = "0";
      }
      rafIdRef.current = null;
    }
  };

  const handlePointerEnter = () => {
    if (!isPointerFine) return;
    isHoveringRef.current = true;
    if (sheenRef.current) {
      sheenRef.current.style.opacity = "1";
    }
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateMotion);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerFine || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Relative coordinates normalized to [-0.5, 0.5]
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;

    const clampedX = Math.max(-0.5, Math.min(0.5, normX));
    const clampedY = Math.max(-0.5, Math.min(0.5, normY));

    // Subtle restrained tilt limits (deg) and translation (px)
    const { MAX_TILT_X, MAX_TILT_Y, MAX_TRANS_X, MAX_TRANS_Y } = SHOWCASE_TILT_LIMITS;

    targetRef.current = {
      rotX: -clampedY * MAX_TILT_X * 2,
      rotY: clampedX * MAX_TILT_Y * 2,
      transX: clampedX * MAX_TRANS_X * 2,
      transY: clampedY * MAX_TRANS_Y * 2,
      sheenX: (clampedX + 0.5) * 100,
      sheenY: (clampedY + 0.5) * 100,
    };

    isHoveringRef.current = true;
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateMotion);
    }
  };

  const handlePointerLeave = () => {
    if (!isPointerFine) return;
    isHoveringRef.current = false;
    targetRef.current = createInitialParallaxState();
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateMotion);
    }
  };

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const book = PREVIEW_BOOKS[selectedBookId];

  return (
    <section
      ref={sectionRef}
      id="journal-analytics"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-28 text-slate-900 dark:text-white border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070e1b] transition-colors"
    >
      {/* Subtle Ambient Glow Behind Showcase */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-cyan-500/10 blur-[150px] dark:hidden ambient-blur-blob" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Section Header */}
        <div
          className={`flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 mb-4 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {selectText({
                en: "BUILT-IN TRADING JOURNAL & PERFORMANCE",
                bn: "বিল্ট-ইন ট্রেডিং জার্নাল ও পারফরম্যান্স অডিট",
                ur: "بلٹ ان ٹریڈنگ جرنل اور کارکردگی کا آڈٹ",
              })}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {selectText({
              en: "Powerful Journal Analytics",
              bn: "শক্তিশালী জার্নাল অ্যানালিটিক্স",
              ur: "طاقتور جرنل کے تجزیات",
            })}
          </h2>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
            {selectText({
              en: "Track, analyze, and systematically improve your trading performance. Built-in multi-book strategy logs, automated equity curves, and strict rule discipline verification.",
              bn: "ট্রেড ট্র্যাক করুন, প্রতিটি ডিসিশন অডিট করুন এবং আপনার স্ট্র্যাটেজি নিখুঁত করুন। মাল্টি-বুক পোর্টফোলিও, রুল ডিসিপ্লিন ভেরিফিকেশন এবং অটোমেটেড গ্রোথ কার্ভ—সব এক প্ল্যাটফর্মে।",
              ur: "ٹریڈز کو ٹریک کریں، ہر فیصلے کا آڈٹ کریں اور اپنی حکمت عملی کو بہتر بنائیں۔ ملٹی بک پورٹ فولیو، رول ڈسپلن کی تصدیق اور خودکار گروتھ کرو — سب ایک پلیٹ فارم پر۔",
            })}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800/80 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {selectText({
                en: "Live Interactive Preview",
                bn: "লাইভ ইন্টারেক্টিভ প্রিভিউ",
                ur: "لائیو انٹرایکٹو پیش نظارہ",
              })}
            </span>
            <span>•</span>
            <span>
              {selectText({
                en: "Click tabs & books to interact",
                bn: "ট্যাব পরিবর্তন করে দেখুন",
                ur: "انٹرایکٹ کرنے کے لیے ٹیبز پر کلک کریں",
              })}
            </span>
          </div>
        </div>

        {/* Dashboard Frame / Preview Container */}
        <div
          className={`relative mx-auto transition-opacity duration-800 ease-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Responsive Scaling Wrapper: enforces exact scaled height below desktop breakpoint */}
          <div
            ref={scalerRef}
            className="relative w-full mx-auto"
            style={{
              height: isScaled && scaledHeight ? `${scaledHeight}px` : undefined,
              overflow: isScaled ? "hidden" : undefined,
            }}
          >
            {/* Desktop Canvas Container: fixed at DESIGN_WIDTH (1100px) and scaled down proportionally on mobile */}
            <div
              ref={contentRef}
              style={{
                width: isScaled ? `${DESIGN_WIDTH}px` : "100%",
                transform: isScaled ? `scale(${scale})` : undefined,
                transformOrigin: "top left",
                position: "relative",
                pointerEvents: "auto",
              }}
            >
              <div
                ref={containerRef}
                onPointerMove={handlePointerMove}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                className="relative [perspective:1200px]"
              >
                <div
                  ref={cardRef}
                  style={{
                    transformStyle: isPointerFine ? "preserve-3d" : "flat",
                  }}
                  className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-[#071120]/90 dark:shadow-sky-950/30 transition-[background-color,border-color] duration-200 will-change-transform"
                >
                  {/* Dynamic Specular / Ambient Sheen tracking mouse position */}
                  {isPointerFine && (
                    <div
                      ref={sheenRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 z-30"
                      style={{
                        background:
                          "radial-gradient(750px circle at 50% 50%, rgba(56, 189, 248, 0.12), transparent 65%)",
                      }}
                    />
                  )}

                  {/* Top Window Chrome / Terminal Bar */}
                  <div
                    style={{ transform: isPointerFine ? "translateZ(8px)" : undefined }}
                    className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80 mb-6"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                      <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="ml-2 text-[11px] font-mono text-slate-400 inline">
                        portal.cycleofchart.com/journal
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500 dark:text-cyan-400">
                        <ShieldCheck className="h-3 w-3" />
                        {selectText({
                          en: "Institutional Audit Grade",
                          bn: "ইন্সটিটিউশনাল অডিট গ্রেড",
                          ur: "ادارہ جاتی آڈٹ گریড",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Header & New Entry CTA Row */}
                  <div
                    style={{ transform: isPointerFine ? "translateZ(10px)" : undefined }}
                    className="flex flex-row items-center justify-between gap-4 mb-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          {selectText({
                            en: "Institutional Trader Journal & Performance",
                            bn: "ইন্সটিটিউশনাল ট্রেডার জার্নাল ও পারফরম্যান্স",
                            ur: "ادارہ جاتی ٹریڈر جرنل اور کارکردگی",
                          })}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Multi-book strategy logs, automated equity curves, and complete 21-point execution audit",
                            bn: "মাল্টি-স্ট্র্যাটেজি বুক, স্বয়ংক্রিয় ইকুইটি কার্ভ এবং ২১-পয়েন্ট এক্সিকিউশন অডিট",
                            ur: "ملٹی بک اسٹریٹیجی لاگز، خودکار ایکویٹی کرو اور مکمل 21 نکاتی عمل درآمد کا آڈٹ",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold gap-1 text-slate-700 dark:text-slate-300 cursor-default"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {selectText({
                          en: "New Journal Book",
                          bn: "নতুন জার্নাল বুক",
                          ur: "نیا جرنل بک",
                        })}
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black gap-1.5 shadow-md shadow-cyan-500/20 px-3 cursor-default"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {selectText({
                          en: "+ Log New Trade",
                          bn: "+ লগ নিউ ট্রেড",
                          ur: "+ نئی ٹریড درج کریں",
                        })}
                      </Button>
                    </div>
                  </div>

                  {/* Interactive Multi-Book Selector Tabs */}
                  <div
                    style={{ transform: isPointerFine ? "translateZ(14px)" : undefined }}
                    className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin"
                  >
                    {/* All / Combined Portfolio */}
                    <button
                      onClick={() => setSelectedBookId("all")}
                      className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                        selectedBookId === "all"
                          ? "border-cyan-500/60 bg-[#081833] text-white shadow-md shadow-cyan-500/10 dark:bg-cyan-500 dark:text-slate-950"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                      <span>
                        {selectText({
                          en: "Combined Portfolio (All Books)",
                          bn: "সম্মিলিত পোর্টফোলিও (সকল বুক)",
                          ur: "مشترکہ پورٹ فولیو (تمام کتابیں)",
                        })}
                      </span>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">26</span>
                    </button>

                    {/* Strategy Model Books */}
                    {SHOWCASE_STRATEGY_BOOK_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedBookId(tab.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                          selectedBookId === tab.id
                            ? "border-cyan-500/60 bg-[#081833] text-white shadow-md shadow-cyan-500/10 dark:bg-cyan-500 dark:text-slate-950"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                        }`}
                      >
                        <BookOpen className="h-4 w-4 text-cyan-400" />
                        <div className="text-left">
                          <div className="font-extrabold">{tab.title}</div>
                          <div className="text-[10px] opacity-75 font-mono">{tab.startLabel}</div>
                        </div>
                        <span className="ml-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-black">
                          {tab.tradesCount}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Active Book Info Bar */}
                  <div
                    style={{ transform: isPointerFine ? "translateZ(8px)" : undefined }}
                    className="flex flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50 mb-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {book.name}
                          </span>
                          <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500 dark:text-cyan-400">
                            {book.strategy}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {book.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                        {selectText({
                          en: "Calendar View",
                          bn: "ক্যালেন্ডার ভিউ",
                          ur: "کیلنڈر ویو",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <Edit className="h-3.5 w-3.5 text-slate-400" />
                        {selectText({
                          en: "Edit Book",
                          bn: "বুক এডিট",
                          ur: "کتاب میں ترمیم کریں",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 4 Key Metric Cards (KPIs) */}
                  <div
                    style={{ transform: isPointerFine ? "translateZ(16px)" : undefined }}
                    className="grid grid-cols-4 gap-4 mb-6"
                  >
                    {/* Card 1: Account Capital */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Account Capital",
                            bn: "ব্যালেন্স প্রবৃদ্ধি",
                            ur: "اکاؤنٹ کا سرمایہ",
                          })}
                        </span>
                        <DollarSign className="h-4 w-4 text-cyan-500" />
                      </div>
                      <div className="mt-2.5">
                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                          ${book.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span>
                            {selectText({
                              en: "Initial:",
                              bn: "প্রারম্ভিক:",
                              ur: "ابتدائی:",
                            })}
                          </span>
                          <span className="font-mono">${book.startingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-bold">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-black text-emerald-500">
                          <TrendingUp className="h-3 w-3" />
                          +{book.netGrowth}%
                        </span>
                        <span className="text-[11px] text-slate-400">Net Growth</span>
                      </div>
                    </div>

                    {/* Card 2: Total Net P&L */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Total Net P&L",
                            bn: "মোট নিট লাভ",
                            ur: "کل نیٹ P&L",
                          })}
                        </span>
                        <Percent className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="mt-2.5">
                        <div className="text-3xl font-black tracking-tight text-emerald-500">
                          +${book.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="mt-1 flex items-center gap-2.5 text-xs font-bold">
                          <span className="text-emerald-500">+${book.totalProfit.toLocaleString()}</span>
                          <span className="text-rose-500">-${book.totalLoss.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-row items-center justify-between text-[11px] font-medium text-slate-400">
                        <span>Avg Win: ${book.avgWin.toFixed(1)}</span>
                        <span>Avg Loss: ${book.avgLoss.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Card 3: Win Rate & Factor */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Win Rate & Factor",
                            bn: "উইনরেট ও ফ্যাক্টর",
                            ur: "جیت کی شرح اور فیکٹر",
                          })}
                        </span>
                        <Flame className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="mt-2.5 flex items-baseline gap-2">
                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                          {book.winRate}%
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          PF: {book.profitFactor}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold">
                        <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-emerald-500 font-mono">
                          {book.winningTrades}W
                        </span>
                        <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-rose-500 font-mono">
                          {book.losingTrades}L
                        </span>
                        {book.breakevenTrades > 0 && (
                          <span className="rounded-md bg-slate-500/10 px-1.5 py-0.5 text-slate-400 font-mono">
                            {book.breakevenTrades}BE
                          </span>
                        )}
                        <span className="text-slate-400 ml-auto inline">{book.totalTrades} Trades</span>
                      </div>
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${book.winRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Card 4: Rule Discipline Adherence */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {selectText({
                            en: "Rule Discipline",
                            bn: "রুলস ডিসিপ্লিন",
                            ur: "اصولوں کا ڈسپلن",
                          })}
                        </span>
                        <ShieldCheck className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="mt-2.5 flex items-baseline gap-2">
                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                          {book.ruleComplianceRate}%
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                          {selectText({
                            en: "Adherence",
                            bn: "অনুমোদন",
                            ur: "پابندی",
                          })}
                        </span>
                      </div>
                      <div className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {selectText({
                          en: `${book.compliantTrades} of ${book.totalTrades} obeyed rules`,
                          bn: `${book.totalTrades}-এর মধ্যে ${book.compliantTrades}টি নিয়ম মেনেছে`,
                          ur: `${book.totalTrades} میں سے ${book.compliantTrades} نے قواعد پر عمل کیا`,
                        })}
                      </div>
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${book.ruleComplianceRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Strategy Rules & Discipline Card */}
                  <div
                    style={{ transform: isPointerFine ? "translateZ(12px)" : undefined }}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70 mb-6"
                  >
                    <div className="flex flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-cyan-500" />
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Strategy Rules & Discipline — {book.name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {book.description}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-xl border border-cyan-500/30 text-cyan-500 bg-cyan-500/5 px-2.5 py-1 text-xs font-bold shrink-0">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        {selectText({
                          en: "Manage Rules",
                          bn: "রুলস ম্যানেজ করুন",
                          ur: "قواعد کا نظم کریں",
                        })}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 grid-cols-3">
                      {book.rules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-xs font-black text-cyan-500 dark:text-cyan-400">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                            {rule}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Analytics & Growth Curve Chart Card */}
                  <div
                    style={{ transform: isPointerFine ? "translateZ(10px)" : undefined }}
                    className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#0a1529]/95 via-[#070e1e]/95 to-[#040814]/95 p-6 shadow-[0_12px_40px_-15px_rgba(2,6,23,0.85),0_0_25px_-5px_rgba(6,182,212,0.1)] relative overflow-hidden backdrop-blur-xl group/analytics-card transition-all duration-300 hover:border-cyan-500/35"
                  >
                    {/* Ambient Highlights */}
                    <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-blue-600/10 blur-3xl" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

                    <div className="relative z-10 flex flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-500/35 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] shrink-0">
                          <BarChart3 className="size-5 text-cyan-400" />
                          <span className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-sm -z-10" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black tracking-tight text-white">
                              {selectText({
                                en: "Performance Analytics & Growth Curve",
                                bn: "পারফরম্যান্স ও গ্রোথ কার্ভ",
                                ur: "کارکردگی اور گروتھ کرو",
                              })}
                            </h4>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
                              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              Live Trajectory
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 font-medium tracking-normal">
                            {selectText({
                              en: "Real-time balance trajectory & periodic returns",
                              bn: "ক্যাপিটাল প্রবৃদ্ধি ও পর্যায়ভিত্তিক P&L",
                              ur: "بیلنس کی سمت اور وقتی P&L",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Chart Mode Interactive Tabs */}
                      <div className="inline-flex items-center p-1 rounded-2xl bg-[#030712]/90 border border-slate-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md shrink-0">
                        {SHOWCASE_CHART_TABS.map((tab) => {
                          const isActive = chartMode === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setChartMode(tab.id)}
                              className={`relative rounded-xl px-3.5 py-1.5 min-h-[38px] text-xs font-bold transition-all duration-200 select-none ${
                                isActive
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_16px_rgba(6,182,212,0.4)] scale-[1.02]"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                              }`}
                            >
                              {tab.id === "balance"
                                ? selectText({ en: "Balance Curve", bn: "ব্যালেন্স কার্ভ", ur: "بیلنس کرو" })
                                : tab.id === "growth"
                                ? selectText({ en: "Growth %", bn: "গ্রোথ %", ur: "গروتھ %" })
                                : selectText({ en: "Period P&L", bn: "পিরিয়ড P&L", ur: "پیریڈ P&L" })}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recharts Area Chart */}
                    <div className="relative z-10 mt-6 rounded-2xl border border-slate-800/80 bg-[#040814]/85 p-4 backdrop-blur-sm overflow-hidden shadow-inner">
                      <div className="h-72 w-full">
                        {chartMode === "period" ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={book.trajectory.slice(1)}
                              margin={SHOWCASE_CHART_MARGIN}
                            >
                              <defs>
                                <linearGradient id="showcaseBarGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.95} />
                                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.75} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.45} vertical={false} />
                              <XAxis
                                dataKey="date"
                                stroke="#475569"
                                fontSize={11}
                                fontWeight={500}
                                tickLine={false}
                                axisLine={{ stroke: "#1e293b" }}
                                tick={{ fill: "#64748b" }}
                              />
                              <YAxis
                                stroke="#475569"
                                fontSize={11}
                                fontWeight={500}
                                tickLine={false}
                                axisLine={{ stroke: "#1e293b" }}
                                tick={{ fill: "#64748b" }}
                                tickFormatter={(v) => `$${v}`}
                              />
                              <Tooltip
                                contentStyle={SHOWCASE_CHART_TOOLTIP_STYLE}
                                formatter={(val: any) => [`$${val}`, "P&L"]}
                              />
                              <Bar
                                dataKey="pnl"
                                fill="url(#showcaseBarGrad)"
                                radius={[6, 6, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={book.trajectory}
                              margin={SHOWCASE_CHART_MARGIN}
                            >
                              <defs>
                                <linearGradient id="showcaseBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                                  <stop offset="60%" stopColor="#0284c7" stopOpacity={0.08} />
                                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.45} vertical={false} />
                              <XAxis
                                dataKey="date"
                                stroke="#475569"
                                fontSize={11}
                                fontWeight={500}
                                tickLine={false}
                                axisLine={{ stroke: "#1e293b" }}
                                tick={{ fill: "#64748b" }}
                              />
                              <YAxis
                                stroke="#475569"
                                fontSize={11}
                                fontWeight={500}
                                tickLine={false}
                                axisLine={{ stroke: "#1e293b" }}
                                tick={{ fill: "#64748b" }}
                                tickFormatter={(v) =>
                                  chartMode === "growth"
                                    ? `+${v}%`
                                    : `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                                }
                                domain={
                                  chartMode === "growth"
                                    ? [0, "dataMax + 5"]
                                    : ["dataMin - 300", "dataMax + 300"]
                                }
                              />
                              <Tooltip
                                contentStyle={SHOWCASE_CHART_TOOLTIP_STYLE}
                                formatter={(val: any) => [
                                  chartMode === "growth" ? `+${val}%` : `$${Number(val).toLocaleString()}`,
                                  chartMode === "growth" ? "Net Growth" : "Account Capital",
                                ]}
                              />
                              <Area
                                type="monotone"
                                dataKey={chartMode === "growth" ? "growth" : "balance"}
                                stroke="#06b6d4"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#showcaseBalanceGrad)"
                                dot={{ r: 3, fill: "#040814", stroke: "#06b6d4", strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 2 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>


                  {/* Footer Bar inside showcase linking to Roadmap / Dashboard */}
                  <div
                    style={{ transform: isPointerFine ? "translateZ(6px)" : undefined }}
                    className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Lock className="h-4 w-4 text-cyan-500" />
                      <span>
                        {selectText({
                          en: "Included with full student pass and institutional portal access.",
                          bn: "সকল রেজিস্টার্ড মেম্বারদের জন্য আনলিমিটেড মাল্টি-বুক জার্নাল অন্তর্ভুক্ত।",
                          ur: "تمام رجسٹرڈ ممبران کے لیے لامحدود ملٹی بک جرنل شامل ہے۔",
                        })}
                      </span>
                    </div>

                    <a
                      href="#roadmap"
                      className="inline-flex items-center font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors gap-1 shrink-0"
                    >
                      <span>
                        {selectText({
                          en: "Explore Journaling in Roadmap",
                          bn: "রোডম্যাপে জার্নালিং স্টেজ দেখুন",
                          ur: "روڈ میپ میں جرنلنگ مرحلہ دیکھیں",
                        })}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
