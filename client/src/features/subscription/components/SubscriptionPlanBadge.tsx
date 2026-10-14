import React from "react";
import {
  getSubscriptionPlanBadgeLabel,
  type SubscriptionPlanBadgeLabel,
} from "../../../../../shared/subscriptionPlanBadge";

export interface SubscriptionPlanBadgeProps {
  plan?: string | null;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Dynamic Subscription Plan Badge for Dashboard Profile Card & account representations.
 * Renders exactly one of: FREE, PRO, PREMIUM based on authoritative subscription state.
 */
export function SubscriptionPlanBadge({
  plan,
  className = "",
  size = "sm",
}: SubscriptionPlanBadgeProps) {
  const label: SubscriptionPlanBadgeLabel = getSubscriptionPlanBadgeLabel(plan);

  let variantStyles = "";
  if (label === "PREMIUM") {
    variantStyles =
      "bg-amber-500/10 text-amber-700 border-amber-300/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/35 shadow-2xs dark:shadow-[0_0_10px_rgba(245,158,11,0.18)]";
  } else if (label === "PRO") {
    variantStyles =
      "bg-cyan-500/10 text-cyan-700 border-cyan-300/80 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30 shadow-2xs dark:shadow-[0_0_10px_rgba(6,182,212,0.18)]";
  } else {
    // FREE - Neutral / subtle blue badge
    variantStyles =
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-sky-500/10 dark:text-sky-400/90 dark:border-sky-500/20";
  }

  const sizeStyles =
    size === "md"
      ? "text-[10px] px-2.5 py-0.5 tracking-wider"
      : "text-[9px] px-2 py-0.5 tracking-wider";

  return (
    <span
      data-testid="subscription-plan-badge"
      data-plan={label}
      title={`Subscription Plan: ${label}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-black uppercase border leading-tight select-none transition-colors duration-150 ${sizeStyles} ${variantStyles} ${className}`}
    >
      {label}
    </span>
  );
}

export { getSubscriptionPlanBadgeLabel };
