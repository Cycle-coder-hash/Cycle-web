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

        @media (prefers-reduced-motion: reduce) {
          .animate-bg-glow,
          .animate-bg-grid,
          .animate-bg-highlights {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* 1. Very dark navy/black base foundation (stationary) */}
      <div className="absolute inset-0 bg-[#020813]" />

      {/* 2. Atmospheric Radial Gradients & Glows (matching reference screenshot glow positions) */}
      <div
        className="absolute animate-bg-glow"
        style={{
          top: "-40px",
          left: "-40px",
          right: "-40px",
          bottom: "-40px",
          background: `
            /* Soft cyan/teal focal highlight at upper right (matching candle light ambience) */
            radial-gradient(circle 380px at 76% 22%, rgba(56, 189, 248, 0.14) 0%, rgba(6, 182, 212, 0.08) 45%, transparent 75%),
            /* Center-right & upper hero: Deep-blue/teal atmospheric bloom */
            radial-gradient(ellipse 980px 700px at 64% 28%, rgba(14, 116, 144, 0.22) 0%, rgba(15, 65, 130, 0.15) 34%, rgba(8, 35, 75, 0.07) 64%, transparent 82%),
            /* Center-right focal glow behind candlestick/dashboard */
            radial-gradient(ellipse 650px 550px at 74% 34%, rgba(6, 182, 212, 0.15) 0%, rgba(13, 148, 136, 0.09) 42%, transparent 75%),
            /* Center-left soft deep-blue atmospheric depth */
            radial-gradient(ellipse 800px 550px at 22% 34%, rgba(15, 48, 100, 0.16) 0%, rgba(10, 28, 65, 0.08) 46%, transparent 75%),
            /* Center-lower atmospheric spread (ensures seamless continuity down the full page) */
            radial-gradient(ellipse 1100px 650px at 50% 75%, rgba(14, 116, 144, 0.09) 0%, rgba(15, 48, 100, 0.05) 50%, transparent 80%),
            /* Top horizon ambient spread */
            radial-gradient(ellipse 1200px 380px at 50% 0%, rgba(14, 116, 144, 0.11) 0%, transparent 70%)
          `,
        }}
      />

      {/* 3. Subtle Futuristic Technical Grid (48px x 48px fine orthogonal lines matching reference) */}
      <div
        className="absolute animate-bg-grid"
        style={{
          top: "-48px",
          left: "-48px",
          right: "-48px",
          bottom: "-48px",
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.065) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.065) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          backgroundPosition: "center center",
        }}
      />

      {/* 4. Subtle Ambient Highlight Accents (softly tinted grid cells with slow gentle pulse) */}
      <div
        className="absolute animate-bg-highlights"
        style={{
          top: "-30px",
          left: "-30px",
          right: "-30px",
          bottom: "-30px",
          backgroundImage: `
            radial-gradient(circle 90px at 8% 46%, rgba(14, 165, 233, 0.045) 0%, transparent 70%),
            radial-gradient(circle 100px at 88% 54%, rgba(13, 148, 136, 0.045) 0%, transparent 70%),
            radial-gradient(circle 80px at 15% 24%, rgba(56, 189, 248, 0.035) 0%, transparent 70%)
          `,
        }}
      />

      {/* 5. Subtle Vignette & Contrast Guard (smooth edge depth without hard cutoffs) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 95% at 50% 48%, transparent 58%, rgba(2, 8, 19, 0.35) 85%, rgba(2, 8, 19, 0.70) 100%)",
        }}
      />
    </div>
  );
}

export default WebsiteBackground;



