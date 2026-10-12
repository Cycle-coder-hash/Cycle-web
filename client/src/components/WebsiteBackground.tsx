import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * WebsiteBackground
 * Renders the site-wide futuristic dark background:
 * - Truly stationary relative to the browser viewport while foreground content scrolls
 * - Very dark navy/black base foundation (#020813 / #020a14)
 * - Fine, evenly spaced 48px technical orthogonal grid with thin, low-contrast 1px lines
 * - Subtle deep-blue/teal atmospheric radial gradients & glows
 * - Soft cyan/teal ambient glow in the background behind core hero / showcase content
 * - Understated ambient depth and gentle tinted grid cell accents
 * - Fixed & stable behind all website content across all pages and sections without scroll seams
 * - High-contrast preservation ensuring all text, buttons, and UI cards remain clearly readable
 */
export function WebsiteBackground() {
  const { theme } = useTheme();

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden ${
        theme === "dark" ? "block" : "hidden"
      }`}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <style>{`
        @keyframes bg-glow-breathe {
          0% {
            transform: translate3d(0px, 0px, 0) scale(1);
            opacity: 0.94;
          }
          33% {
            transform: translate3d(12px, -8px, 0) scale(1.02);
            opacity: 1.02;
          }
          66% {
            transform: translate3d(-10px, 6px, 0) scale(0.985);
            opacity: 0.95;
          }
          100% {
            transform: translate3d(0px, 0px, 0) scale(1);
            opacity: 0.94;
          }
        }

        @keyframes bg-grid-drift {
          0% {
            transform: translate3d(0px, 0px, 0);
          }
          50% {
            transform: translate3d(8px, -6px, 0);
          }
          100% {
            transform: translate3d(0px, 0px, 0);
          }
        }

        @keyframes bg-highlights-pulse {
          0% {
            transform: translate3d(0px, 0px, 0);
            opacity: 0.75;
          }
          50% {
            transform: translate3d(-6px, 5px, 0);
            opacity: 1.0;
          }
          100% {
            transform: translate3d(0px, 0px, 0);
            opacity: 0.75;
          }
        }

        .animate-bg-glow {
          animation: bg-glow-breathe 28s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .animate-bg-grid {
          animation: bg-grid-drift 36s ease-in-out infinite;
          will-change: transform;
        }

        .animate-bg-highlights {
          animation: bg-highlights-pulse 22s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @media (max-width: 1024px), (pointer: coarse), (prefers-reduced-motion: reduce) {
          .animate-bg-glow,
          .animate-bg-grid,
          .animate-bg-highlights {
            animation: none !important;
            transform: none !important;
            will-change: auto !important;
          }
        }
      `}</style>

      {/* 1. Deep navy-black base foundation (--bg-base: #0D1118) */}
      <div className="absolute inset-0 bg-[var(--bg-base)]" />

      {/* 2. Large Soft Radial Gradient from Top/Left (--bg-glow -> --bg-navy-mid -> --bg-base) */}
      <div
        className="absolute animate-bg-glow"
        style={{
          top: "-40px",
          left: "-40px",
          right: "-40px",
          bottom: "-40px",
          background: `
            /* Primary large soft radial glow from top-left (--bg-glow -> --bg-navy-mid -> --bg-base) */
            radial-gradient(ellipse 1150px 820px at 18% 12%, color-mix(in srgb, var(--bg-glow) 34%, transparent) 0%, color-mix(in srgb, var(--bg-navy-mid) 52%, transparent) 46%, transparent 82%),
            /* Secondary upper-left & top horizon soft sky-blue bloom (--glow-soft) */
            radial-gradient(circle 520px at 12% 8%, color-mix(in srgb, var(--glow-soft) 20%, transparent) 0%, color-mix(in srgb, var(--bg-glow) 10%, transparent) 48%, transparent 78%),
            /* Upper-right counterbalance behind hero candle/showcase */
            radial-gradient(ellipse 760px 580px at 76% 26%, color-mix(in srgb, var(--glow-soft) 16%, transparent) 0%, color-mix(in srgb, var(--bg-navy-mid) 28%, transparent) 48%, transparent 78%),
            /* Lower-center navy depth for seamless full-page scroll continuity */
            radial-gradient(ellipse 1100px 680px at 42% 76%, color-mix(in srgb, var(--bg-navy-mid) 36%, transparent) 0%, color-mix(in srgb, var(--bg-glow) 10%, transparent) 52%, transparent 84%)
          `,
        }}
      />

      {/* 3. Hexagon / Honeycomb + Fine Technical Grid Pattern in New Blue Palette (--glow-soft / --bg-glow) */}
      <div
        className="absolute animate-bg-grid"
        style={{
          top: "-48px",
          left: "-48px",
          right: "-48px",
          bottom: "-48px",
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cg fill='none' stroke='%235C9CEB' stroke-opacity='0.075' stroke-width='1'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34'/%3E%3C/g%3E%3C/svg%3E"),
            linear-gradient(to right, rgba(92, 156, 235, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(92, 156, 235, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: "56px 98px, 48px 48px, 48px 48px",
          backgroundPosition: "center center",
        }}
      />

      {/* 4. Subtle Ambient Highlight Accents (softly tinted blue cells with slow gentle pulse) */}
      <div
        className="absolute animate-bg-highlights"
        style={{
          top: "-30px",
          left: "-30px",
          right: "-30px",
          bottom: "-30px",
          backgroundImage: `
            radial-gradient(circle 110px at 14% 26%, rgba(92, 156, 235, 0.06) 0%, transparent 70%),
            radial-gradient(circle 120px at 84% 52%, rgba(63, 111, 209, 0.055) 0%, transparent 70%),
            radial-gradient(circle 95px at 10% 58%, rgba(27, 47, 94, 0.08) 0%, transparent 70%)
          `,
        }}
      />

      {/* 5. Edge Vignette & Contrast Guard (smooth edge darkening toward --bg-base) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 108% 94% at 46% 44%, transparent 54%, rgba(13, 17, 24, 0.42) 82%, rgba(13, 17, 24, 0.78) 100%)",
        }}
      />
    </div>
  );
}

export default WebsiteBackground;



