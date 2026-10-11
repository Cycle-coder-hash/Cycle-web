import React from "react";

interface HeaderBrandWordmarkProps {
  className?: string;
}

export function HeaderBrandWordmark({ className = "" }: HeaderBrandWordmarkProps) {
  return (
    <span
      className={`header-brand-wordmark relative inline-block select-none font-extrabold tracking-[0.12em] sm:tracking-[0.2em] leading-tight ${className}`}
    >
      {/* Base State: Outline-only text with transparent fill */}
      <span className="header-brand-base">CYCLE OF CHART</span>

      {/* Fill Sweep: Overlay copy in cyan (#22d3ee) with soft glow, revealed from left to right */}
      <span className="header-brand-fill" aria-hidden="true">
        CYCLE OF CHART
      </span>
    </span>
  );
}

export default HeaderBrandWordmark;
