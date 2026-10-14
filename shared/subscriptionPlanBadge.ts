export type SubscriptionPlanBadgeLabel = "FREE" | "PRO" | "PREMIUM";

/**
 * Resolves the authoritative subscription badge label from the effective subscription plan.
 *
 * Requirements:
 * - "premium" -> "PREMIUM"
 * - "pro" -> "PRO"
 * - "free_trial", "free_after_trial", "unclaimed", undefined, null -> "FREE"
 */
export function getSubscriptionPlanBadgeLabel(plan?: string | null): SubscriptionPlanBadgeLabel {
  if (plan === "premium") return "PREMIUM";
  if (plan === "pro") return "PRO";
  return "FREE";
}
