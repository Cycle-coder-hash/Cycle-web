import React, { useEffect, useRef } from "react";

interface HeroHexagonBackgroundProps {
  className?: string;
}

interface GlowCell {
  cx: number;
  cy: number;
  fall: number;
  life: number;
  age: number;
  isCyan: boolean;
}

interface StarMark {
  x: number;
  y: number;
  arm: number;
  speed: number;
  phase: number;
}

const HEX_R = 32;
const HEX_W = Math.sqrt(3) * HEX_R;
const ROW_STEP = 1.5 * HEX_R;

function tracePointyHexSubpath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  const halfW = (Math.sqrt(3) * r) / 2;
  const halfR = r / 2;
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + halfW, cy - halfR);
  ctx.lineTo(cx + halfW, cy + halfR);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - halfW, cy + halfR);
  ctx.lineTo(cx - halfW, cy - halfR);
  ctx.closePath();
}

export function HeroHexagonBackground({ className = "" }: HeroHexagonBackgroundProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiCanvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bgEl = bgRef.current;
    const baseCanvas = baseCanvasRef.current;
    const hiCanvas = hiCanvasRef.current;
    const fxCanvas = fxCanvasRef.current;
    if (!bgEl || !baseCanvas || !hiCanvas || !fxCanvas) return;

    const heroEl = bgEl.parentElement || bgEl;

    let rafId = 0;
    let running = false;
    let isOffscreen = false;
    let isTabHidden = document.hidden;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = reducedMotionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cells: GlowCell[] = [];
    let stars: StarMark[] = [];

    const isTouchOrNarrow = () =>
      window.innerWidth < 700 ||
      window.matchMedia("(hover: none), (pointer: coarse)").matches;

    const spawnCell = (randomInitialAge: boolean): GlowCell => {
      const cols = Math.max(1, Math.ceil(width / HEX_W) + 1);
      const topRows = Math.max(1, Math.min(10, Math.ceil(height / ROW_STEP) + 1));

      const r = Math.floor(Math.random() * topRows);
      const c = Math.floor(Math.random() * cols);
      const cx = c * HEX_W + (r & 1 ? HEX_W * 0.5 : 0);
      const cy = r * ROW_STEP;
      const dx = (cx - width * 0.5) / (width * 0.5 || 1);
      const dy = (cy - height * 0.38) / (height * 0.5 || 1);
      const fall = Math.max(0, 1 - Math.hypot(dx, dy));

      const life = 3.2 + Math.random() * 2.8; // 3.2–6.0s
      const age = randomInitialAge ? Math.random() * life : 0;
      const isCyan = Math.random() < 0.7; // 70% cyan, 30% blue

      return { cx, cy, fall, life, age, isCyan };
    };

    const drawStaticGrid = (
      canvas: HTMLCanvasElement,
      strokeStyle: string
    ) => {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1;

      const cols = Math.ceil(width / HEX_W) + 2;
      const rows = Math.ceil(height / ROW_STEP) + 2;

      ctx.beginPath();
      for (let r = -1; r < rows; r++) {
        const ox = r & 1 ? HEX_W * 0.5 : 0;
        const cy = r * ROW_STEP;
        for (let c = -1; c < cols; c++) {
          const cx = c * HEX_W + ox;
          tracePointyHexSubpath(ctx, cx, cy, HEX_R);
        }
      }
      ctx.stroke();
    };

    const readThemeTokens = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const cs = getComputedStyle(document.documentElement);
      const hexBase =
        cs.getPropertyValue("--hex-base").trim() ||
        (isDark ? "rgba(120,170,255,0.10)" : "rgba(37,99,235,0.15)");
      const hexHi =
        cs.getPropertyValue("--hex-hi").trim() ||
        (isDark ? "rgba(34,211,238,0.55)" : "rgba(2,132,199,0.60)");
      const cellCyan =
        cs.getPropertyValue("--hex-cell-cyan").trim() ||
        (isDark ? "34, 211, 238" : "14, 165, 233");
      const cellBlue =
        cs.getPropertyValue("--hex-cell-blue").trim() ||
        (isDark ? "59, 130, 246" : "37, 99, 235");
      const alphaMultStr = cs.getPropertyValue("--hex-cell-alpha-mult").trim();
      const alphaMult = alphaMultStr
        ? parseFloat(alphaMultStr)
        : isDark
        ? 1.6
        : 1.15;
      const starRgb =
        cs.getPropertyValue("--hex-star").trim() ||
        (isDark ? "165, 243, 252" : "37, 99, 235");

      return { hexBase, hexHi, cellCyan, cellBlue, alphaMult, starRgb };
    };

    let themeTokens = readThemeTokens();

    const drawFxFrame = (nowMs: number, dtSec: number) => {
      const ctx = fxCanvas.getContext("2d");
      if (!ctx || width === 0 || height === 0) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1) GLOW CELLS
      for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        cell.age += dtSec;
        if (cell.age >= cell.life) {
          cells[i] = spawnCell(false);
          cell = cells[i];
        }
        const k = Math.min(1, Math.max(0, cell.age / cell.life));
        const s = Math.sin(k * Math.PI);
        const alpha = s * s * 0.22 * cell.fall * themeTokens.alphaMult;
        if (alpha > 0.002) {
          ctx.beginPath();
          tracePointyHexSubpath(ctx, cell.cx, cell.cy, HEX_R - 1);
          ctx.fillStyle = cell.isCyan
            ? `rgba(${themeTokens.cellCyan},${alpha})`
            : `rgba(${themeTokens.cellBlue},${alpha})`;
          ctx.fill();
        }
      }

      // 2) STARS ("+" marks)
      const t = nowMs * 0.001;
      ctx.lineWidth = 1;
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const a = 0.15 + 0.55 * (0.5 + 0.5 * Math.sin(t * st.speed + st.phase));
        ctx.strokeStyle = `rgba(${themeTokens.starRgb},${a})`;
        ctx.beginPath();
        ctx.moveTo(st.x - st.arm, st.y);
        ctx.lineTo(st.x + st.arm, st.y);
        ctx.moveTo(st.x, st.y - st.arm);
        ctx.lineTo(st.x, st.y + st.arm);
        ctx.stroke();
      }
    };

    const setupScene = () => {
      const rect = bgEl.getBoundingClientRect();
      width = Math.max(1, Math.ceil(rect.width));
      height = Math.max(1, Math.ceil(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Re-read tokens in case theme changed
      themeTokens = readThemeTokens();

      // c) HONEYCOMB LINES (static canvas)
      drawStaticGrid(baseCanvas, themeTokens.hexBase);

      // d) HONEYCOMB HIGHLIGHT (desktop only)
      if (!isTouchOrNarrow()) {
        drawStaticGrid(hiCanvas, themeTokens.hexHi);
      } else {
        hiCanvas.width = 1;
        hiCanvas.height = 1;
        heroEl.classList.remove("is-hovering");
      }

      // e) FX CANVAS dimensions & pools
      fxCanvas.width = Math.round(width * dpr);
      fxCanvas.height = Math.round(height * dpr);
      fxCanvas.style.width = `${width}px`;
      fxCanvas.style.height = `${height}px`;

      const isMobile = width <= 640;
      const cellCount = isMobile ? 6 : 14;
      const starCount = isMobile ? 14 : 34;

      cells = [];
      for (let i = 0; i < cellCount; i++) {
        cells.push(spawnCell(true));
      }

      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          arm: 2 + Math.random() * 2, // 2–4px
          speed: 0.6 + Math.random() * 1.4, // 0.6–2.0
          phase: Math.random() * Math.PI * 2,
        });
      }

      if (prefersReducedMotion) {
        drawFxFrame(1500, 0);
      }
    };

    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!running) return;
      const dtSec = Math.min(0.1, Math.max(0, (now - lastTime) * 0.001));
      lastTime = now;
      drawFxFrame(now, dtSec);
      rafId = requestAnimationFrame(loop);
    };

    const updateLoopState = () => {
      const shouldRun = !prefersReducedMotion && !isOffscreen && !isTabHidden;
      if (shouldRun && !running) {
        running = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };

    setupScene();
    updateLoopState();

    // Resize handling
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupScene();
        updateLoopState();
      }, 80);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Mouse spotlight tracking on parent .hero (desktop only, >=700px and non-touch)
    const onMouseEnter = (e: MouseEvent) => {
      if (isTouchOrNarrow()) return;
      const rect = heroEl.getBoundingClientRect();
      heroEl.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      heroEl.style.setProperty("--my", `${e.clientY - rect.top}px`);
      heroEl.classList.add("is-hovering");
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isTouchOrNarrow()) return;
      const rect = heroEl.getBoundingClientRect();
      heroEl.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      heroEl.style.setProperty("--my", `${e.clientY - rect.top}px`);
      if (!heroEl.classList.contains("is-hovering")) {
        heroEl.classList.add("is-hovering");
      }
    };

    const onMouseLeave = () => {
      heroEl.classList.remove("is-hovering");
    };

    heroEl.addEventListener("mouseenter", onMouseEnter, { passive: true });
    heroEl.addEventListener("mousemove", onMouseMove, { passive: true });
    heroEl.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // Pause when hero is off-screen
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isOffscreen = !entry.isIntersecting;
          updateLoopState();
        },
        { threshold: 0.01 }
      );
      io.observe(heroEl);
    }

    // Pause when tab is hidden
    const onVisibilityChange = () => {
      isTabHidden = document.hidden;
      updateLoopState();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Reduced motion listener
    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        updateLoopState();
        drawFxFrame(1500, 0);
      } else {
        updateLoopState();
      }
    };
    reducedMotionQuery.addEventListener?.("change", onReducedMotionChange);

    // Watch for theme changes (html.dark toggle) and redraw immediately without page reload
    let themeObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined") {
      themeObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.attributeName === "class") {
            themeTokens = readThemeTokens();
            drawStaticGrid(baseCanvas, themeTokens.hexBase);
            if (!isTouchOrNarrow()) {
              drawStaticGrid(hiCanvas, themeTokens.hexHi);
            }
            if (prefersReducedMotion) {
              drawFxFrame(1500, 0);
            }
            break;
          }
        }
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      heroEl.removeEventListener("mouseenter", onMouseEnter);
      heroEl.removeEventListener("mousemove", onMouseMove);
      heroEl.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotionQuery.removeEventListener?.("change", onReducedMotionChange);
      io?.disconnect();
      themeObserver?.disconnect();
    };
  }, []);

  return (
    <div
      ref={bgRef}
      aria-hidden="true"
      className={`hero-bg ${className}`.trim()}
    >
      {/* a) Light beams (.beam.b1 and .beam.b2) */}
      <div className="beam b1" />
      <div className="beam b2" />

      {/* b) Breathing glow (.glow) */}
      <div className="glow" />

      {/* c) HONEYCOMB LINES (static canvas, redraw only on resize) */}
      <canvas ref={baseCanvasRef} className="hex-base-canvas" />

      {/* d) HONEYCOMB HIGHLIGHT (desktop only, masked by 220px circle at --mx --my) */}
      <canvas ref={hiCanvasRef} className="hex-hi-canvas" />

      {/* e) FX CANVAS (subtle center-falloff glow cells + twinkling "+" stars) */}
      <canvas ref={fxCanvasRef} className="hex-fx-canvas" />

      {/* f) Vignette & bottom fade (.vignette) */}
      <div className="vignette" />
    </div>
  );
}
