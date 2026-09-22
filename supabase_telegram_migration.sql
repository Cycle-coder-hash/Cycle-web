-- ==============================================================================
-- MIGRATION: Course Access Telegram Popup Table & Indexes
-- Date: 2026-09-21
-- Description: Tracks student-specific Telegram popup events and interactions
--              upon approved payment for courses or bundles containing courses.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS "course_telegram_popup_events" (
    id SERIAL PRIMARY KEY,
    "userId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    "orderId" INT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    "entitlementId" INT REFERENCES entitlements(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'pending' NOT NULL, -- 'pending', 'dismissed', 'joined'
    "firstShownAt" TIMESTAMP WITH TIME ZONE,
    "dismissedAt" TIMESTAMP WITH TIME ZONE,
    "joinedClickedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Optimization indexes for rapid lookups during user dashboard loads
CREATE INDEX IF NOT EXISTS idx_ctp_user ON "course_telegram_popup_events"("userId");
CREATE INDEX IF NOT EXISTS idx_ctp_order ON "course_telegram_popup_events"("orderId");
CREATE INDEX IF NOT EXISTS idx_ctp_status ON "course_telegram_popup_events"(status);

-- Ensure idempotent event per user and order
CREATE UNIQUE INDEX IF NOT EXISTS idx_ctp_user_order ON "course_telegram_popup_events"("userId", "orderId");
