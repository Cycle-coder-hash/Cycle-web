import { useEffect, useState } from "react";

interface AnimatedCardBorderProps {
  color: "red" | "green";
  duration?: number;
  className?: string;
}

export function AnimatedCardBorder({
  color,
  duration = 7,
  className = "",
}: AnimatedCardBorderProps) {
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

  const isRed = color === "red";
  const glowColor = isRed ? "rgba(239, 68, 68, 0.6)" : "rgba(16, 185, 129, 0.6)";
  const coreColor = isRed ? "#ff3b5c" : "#10b981";
  const dropShadow = isRed
    ? "drop-shadow(0 0 5px rgba(239, 68, 68, 0.85)) drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))"
    : "drop-shadow(0 0 5px rgba(16, 185, 129, 0.85)) drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))";

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] overflow-visible select-none rounded-3xl ${className}`}
      style={{
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {/* Outer Subtle Neon Glow Layer */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="24"
        fill="none"
        stroke={glowColor}
        strokeWidth="4"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="20 80"
        strokeDashoffset="0"
        style={{
          filter: dropShadow,
          animation: `card-border-highlight ${duration}s linear infinite`,
        }}
      />

      {/* Crisp Inner Neon Highlight Line */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx="24"
        fill="none"
        stroke={coreColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="20 80"
        strokeDashoffset="0"
        style={{
          animation: `card-border-highlight ${duration}s linear infinite`,
        }}
      />
    </svg>
  );
}

export default AnimatedCardBorder;
