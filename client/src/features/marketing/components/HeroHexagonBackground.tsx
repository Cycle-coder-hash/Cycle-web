import React, { useEffect, useRef, useState } from "react";

interface HeroHexagonBackgroundProps {
  className?: string;
}

interface GlowingCell {
  col: number;
  row: number;
  cx: number;
  cy: number;
  baseRadius: number;
  duration: number; // in ms
  elapsed: number;
  delay: number;
  colorType: "cyan" | "blue" | "highlight";
  maxAlpha: number;
}

interface StarMark {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  speed: number;
  phase: number;
}

// Pointy-top regular hexagon drawer
function tracePointyHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  const w = Math.sqrt(3) * r;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + w / 2, cy - r / 2);
  ctx.lineTo(cx + w / 2, cy + r / 2);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - w / 2, cy + r / 2);
  ctx.lineTo(cx - w / 2, cy - r / 2);
  ctx.closePath();
}

export function HeroHexagonBackground({ className = "" }: HeroHexagonBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const animCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    // Check if desktop & pointer fine
    const checkDesktop = () => {
      const isFine = window.matchMedia("(pointer: fine)").matches;
      const isWide = window.innerWidth >= 700;
      setIsDesktop(isFine && isWide);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const staticCanvas = staticCanvasRef.current;
    const animCanvas = animCanvasRef.current;
    if (!container || !staticCanvas || !animCanvas) return;

    let animFrameId: number;
    let isIntersecting = true;
    let isDocumentVisible = !document.hidden;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const HEX_RADIUS = 32;
    const HEX_W = Math.sqrt(3) * HEX_RADIUS;
    const HEX_DY = 1.5 * HEX_RADIUS;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Grid tracking
    let gridCells: { col: number; row: number; cx: number; cy: number; maskFactor: number }[] = [];
    let glowingCells: GlowingCell[] = [];
    let stars: StarMark[] = [];

    // Radial mask factor calculation (ellipse centered at 50% X, 38% Y)
    const getMaskFactor = (x: number, y: number, w: number, h: number) => {
      const centerX = w * 0.5;
      const centerY = h * 0.38;
      const rx = w * 0.62;
      const ry = h * 0.58;
      const dx = (x - centerX) / (rx || 1);
      const dy = (y - centerY) / (ry || 1);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 0.28) return 1;
      if (dist >= 1.0) return 0;
      const t = (dist - 0.28) / (1.0 - 0.28);
      return Math.max(0, 1 - (t * t * (3 - 2 * t)));
    };

    // Initialize or resize static and animated canvases
    const handleResize = () => {
      if (!container || !staticCanvas || !animCanvas) return;
      const rect = container.getBoundingClientRect();
      width = Math.ceil(rect.width);
      height = Math.ceil(rect.height);
      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      staticCanvas.width = width * dpr;
      staticCanvas.height = height * dpr;
      staticCanvas.style.width = `${width}px`;
      staticCanvas.style.height = `${height}px`;

      animCanvas.width = width * dpr;
      animCanvas.height = height * dpr;
      animCanvas.style.width = `${width}px`;
      animCanvas.style.height = `${height}px`;

      // 1. Calculate Grid
      gridCells = [];
      const cols = Math.ceil(width / HEX_W) + 2;
      const rows = Math.ceil(height / HEX_DY) + 2;

      for (let r = -1; r <= rows; r++) {
        const xOffset = r % 2 === 0 ? 0 : HEX_W / 2;
        for (let c = -1; c <= cols; c++) {
          const cx = c * HEX_W + xOffset;
          const cy = r * HEX_DY;
          const mask = getMaskFactor(cx, cy, width, height);
          if (mask > 0.05) {
            gridCells.push({ col: c, row: r, cx, cy, maskFactor: mask });
          }
        }
      }

      // 2. Draw Static Honeycomb Lines
      const sCtx = staticCanvas.getContext("2d");
      if (sCtx) {
        sCtx.save();
        sCtx.scale(dpr, dpr);
        sCtx.clearRect(0, 0, width, height);

        // Draw honeycomb lines
        sCtx.lineWidth = 1;
        sCtx.strokeStyle = "rgba(224, 242, 254, 0.09)"; // ~10% opacity blue-white

        for (let r = -1; r <= rows; r++) {
          const xOffset = r % 2 === 0 ? 0 : HEX_W / 2;
          for (let c = -1; c <= cols; c++) {
            const cx = c * HEX_W + xOffset;
            const cy = r * HEX_DY;
            tracePointyHex(sCtx, cx, cy, HEX_RADIUS);
            sCtx.stroke();
          }
        }

        // Apply radial mask to dissolve toward edges and bottom
        sCtx.globalCompositeOperation = "destination-in";
        const centerX = width * 0.5;
        const centerY = height * 0.38;
        const maxRadius = Math.max(width, height) * 0.68;
        const radialMask = sCtx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          maxRadius
        );
        radialMask.addColorStop(0, "rgba(0, 0, 0, 1)");
        radialMask.addColorStop(0.35, "rgba(0, 0, 0, 0.95)");
        radialMask.addColorStop(0.7, "rgba(0, 0, 0, 0.25)");
        radialMask.addColorStop(1, "rgba(0, 0, 0, 0)");

        sCtx.fillStyle = radialMask;
        sCtx.fillRect(0, 0, width, height);
        sCtx.restore();
      }

      // 3. Setup Glowing Cells Pool
      const isMobileScreen = width < 700;
      const targetCellCount = isMobileScreen ? 6 : 14;
      glowingCells = [];

      const createCell = (initialDelay = 0): GlowingCell | null => {
        if (!gridCells.length) return null;
        // Bias cell selection towards cells with higher maskFactor (nearer center)
        const samplePool = gridCells.filter((c) => c.maskFactor > 0.2);
        if (!samplePool.length) return null;
        const chosen = samplePool[Math.floor(Math.random() * samplePool.length)];

        const colors: ("cyan" | "blue" | "highlight")[] = ["cyan", "cyan", "blue", "highlight"];
        const colorType = colors[Math.floor(Math.random() * colors.length)];
        const duration = 3200 + Math.random() * 2800; // 3.2s – 6s

        return {
          col: chosen.col,
          row: chosen.row,
          cx: chosen.cx,
          cy: chosen.cy,
          baseRadius: HEX_RADIUS,
          duration,
          elapsed: 0,
          delay: initialDelay,
          colorType,
          maxAlpha: 0.16 + chosen.maskFactor * 0.18,
        };
      };

      for (let i = 0; i < targetCellCount; i++) {
        const cell = createCell(Math.random() * 3000);
        if (cell) glowingCells.push(cell);
      }

      // 4. Setup Twinkling Stars Pool (~34 desktop, ~14 mobile)
      const targetStarCount = isMobileScreen ? 14 : 34;
      stars = [];
      for (let i = 0; i < targetStarCount; i++) {
        stars.push({
          x: width * 0.1 + Math.random() * (width * 0.8),
          y: height * 0.08 + Math.random() * (height * 0.72),
          size: 3 + Math.random() * 3,
          baseOpacity: 0.2 + Math.random() * 0.55,
          speed: 1.2 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    handleResize();

    let resizeTimer: any;
    const onWindowResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };
    window.addEventListener("resize", onWindowResize);

    // Mouse Spotlight Tracking (Desktop only)
    const onMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 700) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePosRef.current = { x, y, active: true };
    };

    const onMouseLeave = () => {
      mousePosRef.current.active = false;
    };

    container.addEventListener("mousemove", onMouseMove, { passive: true });
    container.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // IntersectionObserver to pause loop when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = entry?.isIntersecting ?? true;
        if (isIntersecting && isDocumentVisible && !prefersReducedMotion) {
          lastTime = performance.now();
          animFrameId = requestAnimationFrame(renderLoop);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Page Visibility change
    const onVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible && isIntersecting && !prefersReducedMotion) {
        lastTime = performance.now();
        animFrameId = requestAnimationFrame(renderLoop);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Animated Loop
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      if (!isIntersecting || !isDocumentVisible) return;
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;

      const aCtx = animCanvas.getContext("2d");
      if (aCtx && width > 0 && height > 0) {
        aCtx.save();
        aCtx.scale(dpr, dpr);
        aCtx.clearRect(0, 0, width, height);

        // 1. Draw Desktop Mouse Spotlight Hexagons
        const mouse = mousePosRef.current;
        if (mouse.active && window.innerWidth >= 700 && !prefersReducedMotion) {
          const SPOTLIGHT_RADIUS = 220;
          const mx = mouse.x;
          const my = mouse.y;

          aCtx.save();
          aCtx.beginPath();
          aCtx.arc(mx, my, SPOTLIGHT_RADIUS, 0, Math.PI * 2);
          aCtx.clip();

          // Stroke hexagons inside spotlight with brighter cyan glow
          aCtx.lineWidth = 1.25;
          aCtx.strokeStyle = "rgba(34, 211, 238, 0.38)";

          const minC = Math.floor((mx - SPOTLIGHT_RADIUS) / HEX_W) - 1;
          const maxC = Math.ceil((mx + SPOTLIGHT_RADIUS) / HEX_W) + 1;
          const minR = Math.floor((my - SPOTLIGHT_RADIUS) / HEX_DY) - 1;
          const maxR = Math.ceil((my + SPOTLIGHT_RADIUS) / HEX_DY) + 1;

          for (let r = minR; r <= maxR; r++) {
            const xOffset = r % 2 === 0 ? 0 : HEX_W / 2;
            for (let c = minC; c <= maxC; c++) {
              const cx = c * HEX_W + xOffset;
              const cy = r * HEX_DY;
              tracePointyHex(aCtx, cx, cy, HEX_RADIUS);
              aCtx.stroke();
            }
          }

          // Soft spotlight glow radial tint
          const spotGrad = aCtx.createRadialGradient(mx, my, 0, mx, my, SPOTLIGHT_RADIUS);
          spotGrad.addColorStop(0, "rgba(34, 211, 238, 0.08)");
          spotGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.03)");
          spotGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
          aCtx.fillStyle = spotGrad;
          aCtx.fillRect(mx - SPOTLIGHT_RADIUS, my - SPOTLIGHT_RADIUS, SPOTLIGHT_RADIUS * 2, SPOTLIGHT_RADIUS * 2);

          aCtx.restore();
        }

        // 2. Draw Glowing Cells (Smooth Sine Fade in/out)
        for (let i = 0; i < glowingCells.length; i++) {
          const cell = glowingCells[i];

          if (cell.delay > 0) {
            cell.delay -= delta;
            continue;
          }

          cell.elapsed += delta;
          const progress = Math.min(1, cell.elapsed / cell.duration);

          // Sine curve for smooth fade in and fade out
          const alphaFactor = Math.sin(progress * Math.PI);
          const currentAlpha = alphaFactor * cell.maxAlpha;

          if (currentAlpha > 0.005) {
            let fillColor = "rgba(34, 211, 238, "; // cyan
            let strokeColor = "rgba(103, 232, 249, ";
            if (cell.colorType === "blue") {
              fillColor = "rgba(59, 130, 246, ";
              strokeColor = "rgba(147, 197, 253, ";
            } else if (cell.colorType === "highlight") {
              fillColor = "rgba(56, 189, 248, ";
              strokeColor = "rgba(224, 242, 254, ";
            }

            tracePointyHex(aCtx, cell.cx, cell.cy, cell.baseRadius - 0.5);
            aCtx.fillStyle = `${fillColor}${currentAlpha})`;
            aCtx.fill();

            aCtx.lineWidth = 1;
            aCtx.strokeStyle = `${strokeColor}${currentAlpha * 1.5})`;
            aCtx.stroke();
          }

          // When cell animation completes, re-seed with a new cell
          if (progress >= 1) {
            if (gridCells.length) {
              const samplePool = gridCells.filter((c) => c.maskFactor > 0.2);
              const chosen = samplePool[Math.floor(Math.random() * samplePool.length)] || gridCells[0];
              const colors: ("cyan" | "blue" | "highlight")[] = ["cyan", "cyan", "blue", "highlight"];
              cell.col = chosen.col;
              cell.row = chosen.row;
              cell.cx = chosen.cx;
              cell.cy = chosen.cy;
              cell.elapsed = 0;
              cell.delay = 400 + Math.random() * 2000;
              cell.duration = 3200 + Math.random() * 2800;
              cell.colorType = colors[Math.floor(Math.random() * colors.length)];
              cell.maxAlpha = 0.16 + chosen.maskFactor * 0.18;
            }
          }
        }

        // 3. Draw Twinkling Plus / Star Marks
        const timeSec = now / 1000;
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          const pulse = (Math.sin(timeSec * star.speed + star.phase) + 1) / 2; // 0 to 1
          const opacity = star.baseOpacity * (0.3 + 0.7 * pulse);

          if (opacity > 0.05) {
            aCtx.strokeStyle = `rgba(186, 230, 253, ${opacity})`;
            aCtx.lineWidth = 1;

            const half = star.size / 2;
            aCtx.beginPath();
            // Horizontal bar
            aCtx.moveTo(star.x - half, star.y);
            aCtx.lineTo(star.x + half, star.y);
            // Vertical bar
            aCtx.moveTo(star.x, star.y - half);
            aCtx.lineTo(star.x, star.y + half);
            aCtx.stroke();

            // Center glow pixel
            if (pulse > 0.6) {
              aCtx.fillStyle = `rgba(224, 242, 254, ${opacity * 1.2})`;
              aCtx.fillRect(star.x - 0.75, star.y - 0.75, 1.5, 1.5);
            }
          }
        }

        aCtx.restore();
      }

      if (!prefersReducedMotion) {
        animFrameId = requestAnimationFrame(renderLoop);
      }
    };

    if (!prefersReducedMotion) {
      animFrameId = requestAnimationFrame(renderLoop);
    } else {
      // For reduced motion, render a single resting static frame with a couple subtle cells
      renderLoop(performance.now());
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      if (container) {
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      style={{
        background: "radial-gradient(circle at 50% 38%, #06122a 0%, #030a17 55%, #02060f 100%)",
      }}
    >
      {/* Static Honeycomb Line Grid Canvas */}
      <canvas
        ref={staticCanvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full opacity-90"
      />

      {/* Animated Glowing Cells & Twinkling Stars Canvas */}
      <canvas
        ref={animCanvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />

      {/* Soft Radial Breathing Blue/Cyan Glow behind Headline */}
      <div
        className="pointer-events-none absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] max-w-[90vw] h-[440px] rounded-full blur-[110px] hero-glow-breathe opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(34, 211, 238, 0.16) 0%, rgba(37, 99, 235, 0.11) 45%, transparent 75%)",
        }}
      />

      {/* Two low-opacity blurred diagonal light beams (desktop only) */}
      <div
        className="pointer-events-none absolute -top-40 left-[-10%] w-[580px] h-[900px] rounded-full blur-[90px] hero-beam-left opacity-30 hidden md:block"
        style={{
          background:
            "linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(6, 182, 212, 0.03) 50%, transparent 80%)",
          transform: "rotate(-25deg)",
        }}
      />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] w-[580px] h-[900px] rounded-full blur-[90px] hero-beam-right opacity-30 hidden md:block"
        style={{
          background:
            "linear-gradient(225deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 80%)",
          transform: "rotate(25deg)",
        }}
      />

      {/* Outer Vignette (dark edges) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 40%, transparent 45%, rgba(2, 6, 15, 0.65) 80%, #02060f 100%)",
        }}
      />

      {/* Bottom seamless fade into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(2, 6, 15, 0.75) 50%, #02060f 100%)",
        }}
      />
    </div>
  );
}
