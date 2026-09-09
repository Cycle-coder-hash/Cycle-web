import { useEffect, useRef } from "react";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
  color: RGB;
}

// Exact requested RGB sequence: cyan → blue → purple → pink → green → cyan
const RGB_PALETTE: RGB[] = [
  { r: 0, g: 235, b: 255 }, // Cyan
  { r: 45, g: 115, b: 255 }, // Blue
  { r: 168, g: 85, b: 247 }, // Purple
  { r: 244, g: 63, b: 142 }, // Pink
  { r: 16, g: 215, b: 125 }, // Green
  { r: 0, g: 235, b: 255 }, // Back to Cyan
];

function getInterpolatedRgb(progress: number): RGB {
  const norm = ((progress % 1) + 1) % 1;
  const scaled = norm * (RGB_PALETTE.length - 1);
  const index = Math.floor(scaled);
  const fract = scaled - index;
  const c1 = RGB_PALETTE[index];
  const c2 = RGB_PALETTE[Math.min(index + 1, RGB_PALETTE.length - 1)];

  return {
    r: Math.round(c1.r + (c2.r - c1.r) * fract),
    g: Math.round(c1.g + (c2.g - c1.g) * fract),
    b: Math.round(c1.b + (c2.b - c1.b) * fract),
  };
}

export function CursorLightTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Accessibility check: disable if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animFrameId: number | null = null;
    let isRunning = false;

    // Trail buffer
    let points: TrailPoint[] = [];
    const MAX_POINTS = 36;
    const TRAIL_LIFETIME = 460; // ms (within the 300–600ms range)

    // Smooth gradient progression
    let colorProgress = 0;

    // Cursor position and trailing follower with slight delay
    let targetX = -1000;
    let targetY = -1000;
    let followerX = -1000;
    let followerY = -1000;
    let lastRecordedX = -1000;
    let lastRecordedY = -1000;
    let isPointerInside = false;

    // Canvas resize with devicePixelRatio support
    const resizeCanvas = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // Wake up rendering loop on interaction
    const wakeUp = () => {
      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(render);
      }
    };

    // Push new point into trail
    const recordPoint = (x: number, y: number, time: number) => {
      colorProgress = (colorProgress + 0.016) % 1;
      const color = getInterpolatedRgb(colorProgress);
      points.push({ x, y, time, color });
      if (points.length > MAX_POINTS) {
        points.shift();
      }
    };

    // Pointer event handlers
    const onMouseMove = (e: MouseEvent) => {
      isPointerInside = true;
      targetX = e.clientX;
      targetY = e.clientY;

      if (followerX < 0) {
        followerX = targetX;
        followerY = targetY;
        lastRecordedX = targetX;
        lastRecordedY = targetY;
        recordPoint(targetX, targetY, performance.now());
      }
      wakeUp();
    };

    const onMouseEnter = (e: MouseEvent) => {
      isPointerInside = true;
      targetX = e.clientX;
      targetY = e.clientY;
      followerX = targetX;
      followerY = targetY;
      lastRecordedX = targetX;
      lastRecordedY = targetY;
      recordPoint(targetX, targetY, performance.now());
      wakeUp();
    };

    const onMouseLeave = () => {
      isPointerInside = false;
    };

    // Mobile touch handlers
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isPointerInside = true;
        const touch = e.touches[0];
        targetX = touch.clientX;
        targetY = touch.clientY;
        followerX = targetX;
        followerY = targetY;
        lastRecordedX = targetX;
        lastRecordedY = targetY;
        recordPoint(targetX, targetY, performance.now());
        wakeUp();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isPointerInside = true;
        const touch = e.touches[0];
        targetX = touch.clientX;
        targetY = touch.clientY;
        wakeUp();
      }
    };

    const onTouchEnd = () => {
      isPointerInside = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseenter", onMouseEnter, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // Render loop
    const render = (time: number) => {
      if (!ctx || !canvas) return;

      // Completely clear canvas across all physical pixels
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Smooth trailing follower with slight delay (exponential lerp)
      if (targetX >= 0 && targetY >= 0) {
        const dx = targetX - followerX;
        const dy = targetY - followerY;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.6) {
          followerX += dx * 0.38;
          followerY += dy * 0.38;
        } else {
          followerX = targetX;
          followerY = targetY;
        }

        // Add points whenever follower moves noticeably
        const distToLast = Math.hypot(followerX - lastRecordedX, followerY - lastRecordedY);
        if (distToLast >= 3) {
          // Subdivide if follower moved fast to maintain an ultra-smooth ribbon
          const steps = Math.min(Math.floor(distToLast / 5), 4);
          if (steps > 1) {
            for (let s = 1; s <= steps; s++) {
              const t = s / steps;
              const ix = lastRecordedX + (followerX - lastRecordedX) * t;
              const iy = lastRecordedY + (followerY - lastRecordedY) * t;
              recordPoint(ix, iy, time);
            }
          } else {
            recordPoint(followerX, followerY, time);
          }
          lastRecordedX = followerX;
          lastRecordedY = followerY;
        }
      }

      // Purge expired points older than TRAIL_LIFETIME
      points = points.filter((p) => time - p.time < TRAIL_LIFETIME);

      // Render the thin RGB neon light ribbon
      if (points.length >= 2) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // PASS 1: Outer glowing neon aura
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];

          const age = (time - p2.time) / TRAIL_LIFETIME;
          if (age >= 1) continue;

          const life = Math.max(0, 1 - age);
          const trailProgress = i / (points.length - 1); // 0 at tail, 1 near cursor

          // Opacity fades toward tail and with age
          const auraAlpha = life * 0.45 * (0.4 + 0.6 * trailProgress);
          const auraWidth = Math.max(1.2, (0.8 + trailProgress * 2.8) * 1.6);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          ctx.shadowBlur = 9;
          ctx.shadowColor = `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${auraAlpha})`;
          ctx.strokeStyle = `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${auraAlpha})`;
          ctx.lineWidth = auraWidth;
          ctx.stroke();
        }

        // PASS 2: Crisp, vivid neon core streak
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];

          const age = (time - p2.time) / TRAIL_LIFETIME;
          if (age >= 1) continue;

          const life = Math.max(0, 1 - age);
          const trailProgress = i / (points.length - 1);

          // Vivid core alpha (clearly visible on both white and dark backgrounds)
          const coreAlpha = life * 0.95 * (0.5 + 0.5 * trailProgress);
          const coreWidth = Math.max(0.8, 0.8 + trailProgress * 2.2);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          ctx.shadowBlur = 3;
          ctx.shadowColor = `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${coreAlpha})`;
          ctx.strokeStyle = `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${coreAlpha})`;
          ctx.lineWidth = coreWidth;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Check if animation should continue:
      // Keep going if points exist, or if pointer is moving/lagging
      const lag = Math.hypot(targetX - followerX, targetY - followerY);
      const shouldKeepRendering = points.length > 0 || (isPointerInside && lag > 1);

      if (shouldKeepRendering) {
        animFrameId = requestAnimationFrame(render);
      } else {
        // Sleep animation loop to ensure 0% CPU/GPU idle usage
        isRunning = false;
        animFrameId = null;
        if (!isPointerInside) {
          targetX = -1000;
          targetY = -1000;
          followerX = -1000;
          followerY = -1000;
          lastRecordedX = -1000;
          lastRecordedY = -1000;
        }
      }
    };

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[99999] h-full w-full select-none"
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
      }}
    />
  );
}

export default CursorLightTrail;
