import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TraderBrainCanvas } from './TraderBrainCanvas';

interface CardDef {
  id: number;
  badge: string;
  key: 'card1' | 'card2' | 'card3' | 'card4' | 'card5' | 'card6' | 'card7';
  defaultTitle: string;
  isClimax?: boolean;
}

const CARDS: CardDef[] = [
  { id: 1, badge: '01', key: 'card1', defaultTitle: 'Learn Fast' },
  { id: 2, badge: '02', key: 'card2', defaultTitle: 'Discipline' },
  { id: 3, badge: '03', key: 'card3', defaultTitle: 'Consistent Work' },
  { id: 4, badge: '04', key: 'card4', defaultTitle: 'Process' },
  { id: 5, badge: '05', key: 'card5', defaultTitle: 'Journal' },
  { id: 6, badge: '06', key: 'card6', defaultTitle: 'Build Edge' },
  { id: 7, badge: '07', key: 'card7', defaultTitle: 'Professional Trader', isClimax: true },
];

// Desktop wave positions: normalized percentage [x, y] where x is along the center track, y is vertical offset
const DESKTOP_POSITIONS: [number, number][] = [
  [0.07, 0.46], // Card 1: entry
  [0.21, 0.22], // Card 2: upper crest
  [0.36, 0.70], // Card 3: lower trough
  [0.51, 0.22], // Card 4: upper crest
  [0.66, 0.70], // Card 5: lower trough
  [0.80, 0.22], // Card 6: upper crest
  [0.93, 0.46], // Card 7: climax (aligned with entry & pro brain)
];

/**
 * Hexagon-inspired Card Component with sequential edge-by-edge laser lighting
 */
interface HexagonCardProps {
  badge: string;
  title: string;
  isActive: boolean;
  isCurrent: boolean;
  isClimax?: boolean;
  isRTL?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  compact?: boolean;
}

const HexagonCard: React.FC<HexagonCardProps> = ({
  badge,
  title,
  isActive,
  isCurrent,
  isClimax = false,
  isRTL = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 140, h: 72 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dimensions;
  const cut = Math.min(14, Math.round(w * 0.1));
  const hexPath = `M ${cut} 0 L ${w - cut} 0 L ${w} ${h / 2} L ${w - cut} ${h} L ${cut} ${h} L 0 ${h / 2} Z`;

  // Perimeter length calculation
  const diag = Math.sqrt(cut * cut + (h / 2) * (h / 2));
  const perimeter = 2 * (w - 2 * cut) + 4 * diag;

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      className={`group relative cursor-pointer select-none transition-transform duration-300 ${
        isCurrent ? 'scale-[1.04]' : isActive ? 'scale-[1.01]' : 'hover:scale-[1.02]'
      } ${className}`}
      style={{
        clipPath: `polygon(${cut}px 0, calc(100% - ${cut}px) 0, 100% 50%, calc(100% - ${cut}px) 100%, ${cut}px 100%, 0 50%)`,
      }}
    >
      {/* Semi-transparent dark glass backdrop */}
      <div
        className={`absolute inset-0 transition-colors duration-500 backdrop-blur-md ${
          isClimax && isActive
            ? 'bg-[#030e1e]/90 shadow-[inset_0_0_24px_rgba(0,240,255,0.2)]'
            : isActive
            ? 'bg-[#040f1f]/85 shadow-[inset_0_0_18px_rgba(0,240,255,0.12)]'
            : 'bg-[#030712]/80 hover:bg-[#071326]/80'
        }`}
      />

      {/* Internal radial energy bloom when active */}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: isClimax
              ? 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.22) 0%, transparent 75%)'
              : 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.14) 0%, transparent 70%)',
          }}
        />
      )}

      {/* SVG Sequential Edge-Lighting Border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        width={w}
        height={h}
      >
        <defs>
          <linearGradient
            id={`hexStroke-${badge}-${isClimax ? 'cli' : 'std'}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor={isClimax ? '#ffffff' : '#0284c7'} />
          </linearGradient>
        </defs>

        {/* 1. Base dormant border line */}
        <path
          d={hexPath}
          fill="none"
          stroke={isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.12)'}
          strokeWidth="1.2"
        />

        {/* 2. Sequential edge-by-edge animated laser stroke */}
        <path
          d={hexPath}
          fill="none"
          stroke={`url(#hexStroke-${badge}-${isClimax ? 'cli' : 'std'})`}
          strokeWidth={isClimax ? '2.4' : '1.8'}
          strokeDasharray={perimeter}
          strokeDashoffset={isActive ? 0 : perimeter}
          style={{
            transition: 'stroke-dashoffset 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: isActive
              ? isClimax
                ? 'drop-shadow(0 0 8px #00f0ff)'
                : 'drop-shadow(0 0 5px #00f0ff)'
              : 'none',
          }}
        />
      </svg>

      {/* Card Content (Title ONLY + Number Badge) */}
      <div
        className={`relative z-10 flex items-center justify-between gap-2.5 px-4 py-2.5 h-full ${
          isRTL ? 'flex-row-reverse text-right' : 'text-left'
        }`}
      >
        {/* Title */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold tracking-tight leading-tight transition-colors duration-300 truncate ${
              compact ? 'text-xs' : 'text-xs sm:text-[13px] xl:text-sm'
            } ${
              isClimax && isActive
                ? 'text-white font-black drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]'
                : isActive
                ? 'text-white font-bold drop-shadow-[0_0_6px_rgba(0,240,255,0.45)]'
                : 'text-slate-400 font-medium group-hover:text-slate-200'
            }`}
          >
            {title}
          </p>
        </div>

        {/* Number Badge */}
        <div
          className={`shrink-0 flex items-center justify-center font-mono font-bold transition-all duration-300 rounded ${
            compact ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'
          } ${
            isClimax && isActive
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.8)] border border-white'
              : isActive
              ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(0,240,255,0.35)]'
              : 'bg-slate-900/80 text-slate-500 border border-slate-800'
          }`}
        >
          {badge}
        </div>
      </div>
    </div>
  );
};

/**
 * Traveling Light Stream / Fiber-Optic Conduit Canvas (Desktop Wave & Connecting Line)
 */
interface DesktopConduitProps {
  activeStage: number; // 0 to 7
  width: number;
  height: number;
  isRTL: boolean;
}

const DesktopConduit: React.FC<DesktopConduitProps> = ({
  activeStage,
  width,
  height,
  isRTL,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStageRef = useRef(activeStage);
  activeStageRef.current = activeStage;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = false;
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Construct wave points: 0 = Beginner Brain output, 1..7 = Cards 1..7 centers, 8 = Pro Brain input
    const rawPoints: [number, number][] = [
      [0, height * 0.5], // entry from left brain
      ...DESKTOP_POSITIONS.map(
        ([x, y]) => [x * width, y * height] as [number, number]
      ),
      [width, height * 0.5], // exit into right brain
    ];

    const points = isRTL
      ? rawPoints.map(([x, y]) => [width - x, y] as [number, number])
      : rawPoints;

    // Build segments for fast lookup & photon animation
    const segments: { p1: [number, number]; p2: [number, number]; length: number }[] = [];
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      segments.push({ p1, p2, length: len });
      totalLength += len;
    }

    // Photons traveling along active line
    const photons = Array.from({ length: 8 }, (_, idx) => ({
      progress: (idx / 8) * totalLength,
      speed: 1.2 + Math.random() * 0.8,
    }));

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 3);
      lastTime = time;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const stage = activeStageRef.current;

      // 1. Draw dormant conduit path (subtle dark cyan)
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        // Smooth bezier curve through points
        const xc = (points[i - 1][0] + points[i][0]) / 2;
        const yc = (points[i - 1][1] + points[i][1]) / 2;
        ctx.quadraticCurveTo(points[i - 1][0], points[i - 1][1], xc, yc);
      }
      ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
      ctx.stroke();
      ctx.restore();

      // 2. Draw active illuminated laser stream up to activeStage
      if (stage > 0) {
        const activeSegmentsCount = Math.min(stage + 1, segments.length);
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i <= activeSegmentsCount; i++) {
          const xc = (points[i - 1][0] + points[i][0]) / 2;
          const yc = (points[i - 1][1] + points[i][1]) / 2;
          ctx.quadraticCurveTo(points[i - 1][0], points[i - 1][1], xc, yc);
        }
        ctx.stroke();
        ctx.restore();

        // 3. Animated Photons along active segment
        if (!reducedMotion) {
          // Calculate active length
          let activeLen = 0;
          for (let i = 0; i < activeSegmentsCount; i++) {
            activeLen += segments[i].length;
          }

          ctx.save();
          photons.forEach((photon) => {
            photon.progress = (photon.progress + photon.speed * dt * 2) % activeLen;

            // Find position along segments
            let remaining = photon.progress;
            let targetPoint: [number, number] = points[0];

            for (let i = 0; i < activeSegmentsCount; i++) {
              const seg = segments[i];
              if (remaining <= seg.length) {
                const ratio = remaining / seg.length;
                targetPoint = [
                  seg.p1[0] + (seg.p2[0] - seg.p1[0]) * ratio,
                  seg.p1[1] + (seg.p2[1] - seg.p1[1]) * ratio,
                ];
                break;
              }
              remaining -= seg.length;
            }

            // Draw photon head + cyan aura
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 9;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(targetPoint[0], targetPoint[1], 2.8, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }
      }

      ctx.restore();

      if (isVisible && !reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now();
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);
    render(performance.now());

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [width, height, isRTL]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none select-none"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};

/**
 * MAIN COMPONENT: TraderBrainEvolutionSection
 * Placed immediately BELOW "THE SHIFT" and ABOVE "ROADMAP"
 */
export const TraderBrainEvolutionSection: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const centerTrackRef = useRef<HTMLDivElement>(null);

  const [trackSize, setTrackSize] = useState({ width: 800, height: 320 });
  const [scrollStage, setScrollStage] = useState(0);
  const [hoverStage, setHoverStage] = useState<number | null>(null);

  // Check reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // Update track dimensions
  useEffect(() => {
    const el = centerTrackRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTrackSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll listener to calculate dynamic evolution stage
  useEffect(() => {
    if (reducedMotion) {
      setScrollStage(7);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Outside viewport bounds check
        if (rect.bottom < 0 || rect.top > windowHeight) {
          return;
        }

        // Calculate progress: starts as section top enters viewport, reaches 1 when centered
        const enterThreshold = windowHeight * 0.85;
        const leaveThreshold = windowHeight * 0.15;
        const totalTravel = enterThreshold - leaveThreshold + rect.height * 0.4;
        const progress = Math.max(0, Math.min(1, (enterThreshold - rect.top) / totalTravel));

        // Progressive mapping across 7 cards
        let current = 0;
        if (progress > 0.88) current = 7;
        else if (progress > 0.74) current = 6;
        else if (progress > 0.60) current = 5;
        else if (progress > 0.46) current = 4;
        else if (progress > 0.32) current = 3;
        else if (progress > 0.18) current = 2;
        else if (progress > 0.05) current = 1;

        setScrollStage(current);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  const activeStage = reducedMotion
    ? 7
    : hoverStage !== null
    ? hoverStage
    : scrollStage;

  // Translated brain labels
  const beginnerLabel = t('brainEvolution.beginner', 'BEGINNER');
  const proLabel = t('brainEvolution.professional', 'PROFESSIONAL');

  // Helper to get card title
  const getCardTitle = useCallback(
    (card: CardDef) => {
      return t(`brainEvolution.${card.key}`, card.defaultTitle);
    },
    [t]
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#030712] dark:bg-[#030712] py-14 sm:py-20 lg:py-24 border-t border-b border-slate-800/80 transition-colors"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Subtle background ambient cyber illumination */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(14, 165, 233, 0.08) 0%, rgba(3, 7, 18, 0) 70%)',
        }}
      />

      <div className="relative mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* DESKTOP LAYOUT (>= 1024px): Horizontal Flow [Beginner Brain] -> [7 Cards] -> [Pro Brain] */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex items-center justify-between gap-4 xl:gap-8">
          {/* 1. Left: Beginner Brain */}
          <div className="shrink-0 flex flex-col items-center justify-center w-[220px] xl:w-[260px]">
            <TraderBrainCanvas
              type="beginner"
              activeStage={0}
              width={260}
              height={250}
              flipX={isRTL}
            />
            {/* Subtle Label Under Brain: "BEGINNER" */}
            <div className="mt-2">
              <span className="inline-block text-[11px] font-mono font-semibold tracking-[0.25em] text-slate-400 uppercase px-3 py-1 rounded-full border border-slate-800/80 bg-slate-900/60">
                {beginnerLabel}
              </span>
            </div>
          </div>

          {/* 2. Middle: Wave of 7 Cards with Fiber-Optic Conduit */}
          <div
            ref={centerTrackRef}
            className="relative flex-1 h-[320px] xl:h-[340px]"
          >
            {/* Background Canvas: Conduit Stream & Traveling Light Photons */}
            {trackSize.width > 0 && (
              <DesktopConduit
                activeStage={activeStage}
                width={trackSize.width}
                height={trackSize.height}
                isRTL={isRTL}
              />
            )}

            {/* The 7 Cards positioned along the wave */}
            {CARDS.map((card, idx) => {
              const [normX, normY] = DESKTOP_POSITIONS[idx];
              const posX = isRTL ? 1 - normX : normX;
              const isCardActive = activeStage >= card.id;
              const isCurrent = activeStage === card.id;

              return (
                <div
                  key={card.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${posX * 100}%`,
                    top: `${normY * 100}%`,
                    width: card.isClimax ? '154px' : '138px',
                    height: card.isClimax ? '76px' : '68px',
                  }}
                >
                  <HexagonCard
                    badge={card.badge}
                    title={getCardTitle(card)}
                    isActive={isCardActive}
                    isCurrent={isCurrent}
                    isClimax={card.isClimax}
                    isRTL={isRTL}
                    onMouseEnter={() => setHoverStage(card.id)}
                    onMouseLeave={() => setHoverStage(null)}
                    onClick={() => setHoverStage(activeStage === card.id ? null : card.id)}
                  />
                </div>
              );
            })}
          </div>

          {/* 3. Right: Professional Trader Brain */}
          <div className="shrink-0 flex flex-col items-center justify-center w-[220px] xl:w-[260px]">
            <TraderBrainCanvas
              type="professional"
              activeStage={activeStage}
              width={260}
              height={250}
              flipX={isRTL}
            />
            {/* Subtle Label Under Brain: "PROFESSIONAL" */}
            <div className="mt-2">
              <span
                className={`inline-block text-[11px] font-mono font-semibold tracking-[0.25em] uppercase px-3 py-1 rounded-full transition-all duration-500 ${
                  activeStage >= 7
                    ? 'text-cyan-300 font-bold border border-cyan-500/60 bg-cyan-950/70 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : activeStage > 0
                    ? 'text-cyan-400/80 border border-cyan-800/50 bg-slate-900/60'
                    : 'text-slate-500 border border-slate-800/80 bg-slate-900/60'
                }`}
              >
                {proLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE & TABLET LAYOUT (< 1024px): Vertical Flow [Beginner] -> [7 Cards] -> [Pro] */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center lg:hidden">
          {/* Top: Beginner Brain */}
          <div className="flex flex-col items-center">
            <TraderBrainCanvas
              type="beginner"
              activeStage={0}
              width={220}
              height={200}
            />
            <div className="mt-2 mb-6">
              <span className="inline-block text-[10px] font-mono font-semibold tracking-[0.25em] text-slate-400 uppercase px-3 py-1 rounded-full border border-slate-800/80 bg-slate-900/60">
                {beginnerLabel}
              </span>
            </div>
          </div>

          {/* Middle: Vertical Conduit Line with 7 Cards */}
          <div className="relative w-full max-w-[340px] py-4">
            {/* Central Vertical Energy Stream */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-slate-800/60 pointer-events-none" />
            <div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] bg-cyan-400 transition-all duration-500 shadow-[0_0_8px_#00f0ff] pointer-events-none"
              style={{
                height: `${Math.min(100, (activeStage / 7) * 100)}%`,
              }}
            />

            {/* Vertical Stack of Cards */}
            <div className="space-y-4 relative z-10">
              {CARDS.map((card) => {
                const isCardActive = activeStage >= card.id;
                const isCurrent = activeStage === card.id;

                return (
                  <div key={card.id} className="w-full">
                    <HexagonCard
                      badge={card.badge}
                      title={getCardTitle(card)}
                      isActive={isCardActive}
                      isCurrent={isCurrent}
                      isClimax={card.isClimax}
                      isRTL={isRTL}
                      compact
                      className="w-full h-[62px]"
                      onClick={() =>
                        setHoverStage(activeStage === card.id ? null : card.id)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: Professional Trader Brain */}
          <div className="flex flex-col items-center mt-6">
            <TraderBrainCanvas
              type="professional"
              activeStage={activeStage}
              width={220}
              height={200}
            />
            <div className="mt-2">
              <span
                className={`inline-block text-[10px] font-mono font-semibold tracking-[0.25em] uppercase px-3 py-1 rounded-full transition-all duration-500 ${
                  activeStage >= 7
                    ? 'text-cyan-300 font-bold border border-cyan-500/60 bg-cyan-950/70 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : activeStage > 0
                    ? 'text-cyan-400/80 border border-cyan-800/50 bg-slate-900/60'
                    : 'text-slate-500 border border-slate-800/80 bg-slate-900/60'
                }`}
              >
                {proLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
