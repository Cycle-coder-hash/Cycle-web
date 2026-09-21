import { useEffect, useState } from "react";

interface AnimatedRgbBorderProps {
  duration?: number;
  className?: string;
  glow?: boolean;
}

/**
 * AnimatedRgbBorder
 * 
 * Renders a continuously moving RGB gradient light effect that travels around
 * the perimeter of a rounded container. Uses high-performance CSS masking
 * and a GPU-accelerated rotating conic gradient with zero layout shifts.
 */
export function AnimatedRgbBorder({
  duration = 9,
  className = "",
  glow = true,
}: AnimatedRgbBorderProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reducedMotion) return null;

  // Ultra-smooth RGB conic spectrum with seamless 360-degree loop (0deg and 360deg are transparent)
  const rgbConicGradient = `conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 205deg,
    rgba(6, 182, 212, 0.08) 220deg,
    rgba(6, 182, 212, 0.5) 238deg,
    #06b6d4 255deg,
    #38bdf8 270deg,
    #3b82f6 288deg,
    #6366f1 304deg,
    #8b5cf6 318deg,
    #d946ef 332deg,
    #ec4899 346deg,
    #f43f5e 354deg,
    rgba(244, 63, 94, 0.15) 358deg,
    transparent 360deg
  )`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-px rounded-[inherit] overflow-hidden select-none ${className}`}
      style={{
        zIndex: 5,
      }}
    >
      {/* Subtle Atmospheric RGB Glow Layer */}
      {glow && (
        <div
          className="rgb-border-mask-glow"
          style={{
            filter: "blur(7px)",
          }}
        >
          <div
            className="rgb-border-disc"
            style={{
              background: rgbConicGradient,
              animationDuration: `${duration}s`,
            }}
          />
        </div>
      )}

      {/* Crisp Core RGB Border Light Beam */}
      <div
        className="rgb-border-mask-core"
        style={{
          filter: "drop-shadow(0 0 4px rgba(6, 182, 212, 0.6)) drop-shadow(0 0 8px rgba(168, 85, 247, 0.45))",
        }}
      >
        <div
          className="rgb-border-disc"
          style={{
            background: rgbConicGradient,
            animationDuration: `${duration}s`,
          }}
        />
      </div>
    </div>
  );
}

export default AnimatedRgbBorder;
