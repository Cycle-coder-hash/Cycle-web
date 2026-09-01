export type AccessEmailEvent = "payment_approved" | "payment_rejected" | "access_granted";

/**
 * Credential-safe notification boundary. Configure an email provider later by
 * supplying SMTP_* secrets; the order workflow remains provider-agnostic.
 */
export async function sendAccessEmail(event: AccessEmailEvent, recipient: string | null | undefined, context: Record<string, unknown>) {
  if (!recipient) return { sent: false, reason: "missing-recipient" as const };
  const configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
  if (!configured) {
    console.info(`[Email] ${event} queued for ${recipient}; SMTP credentials are not configured.`, context);
    return { sent: false, reason: "smtp-not-configured" as const };
  }
  // Provider-specific delivery belongs behind this boundary. No credentials are
  // fabricated here; adding SMTP integration is an explicit deployment step.
  return { sent: false, reason: "provider-adapter-pending" as const };
}
