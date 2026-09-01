-- ==============================================================================
-- CYCLE OF CHART - SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATION
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Go to the "SQL Editor" in the left navigation menu.
-- 3. Click "New Query", paste this entire script, and click "RUN".
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "openId" VARCHAR(64) UNIQUE NOT NULL,
    name TEXT,
    email VARCHAR(320) UNIQUE,
    "passwordHash" VARCHAR(255),
    phone VARCHAR(64),
    "emailVerified" BOOLEAN DEFAULT FALSE NOT NULL,
    "loginMethod" VARCHAR(64) DEFAULT 'password',
    role VARCHAR(32) DEFAULT 'user' NOT NULL, -- 'user', 'admin', 'support'
    language VARCHAR(8) DEFAULT 'en' NOT NULL, -- 'en', 'bn'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "lastSignedIn" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_openId ON users("openId");

-- 1.1 VERIFICATION TOKENS / OTP CODES (EMAIL & FORGOT PASSWORD)
CREATE TABLE IF NOT EXISTS "verificationTokens" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    otp VARCHAR(16) NOT NULL,
    type VARCHAR(32) NOT NULL, -- 'email_verify', 'password_reset'
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "isUsed" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_email ON "verificationTokens"(email);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    kind VARCHAR(32) NOT NULL, -- 'pdf', 'course', 'ebook', 'tool', 'tracker'
    "titleEn" VARCHAR(255) NOT NULL,
    "titleBn" VARCHAR(255) NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionBn" TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'BDT' NOT NULL,
    "fileKey" VARCHAR(500),
    "isPublished" BOOLEAN DEFAULT TRUE NOT NULL,
    "isFree" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. BUNDLES TABLE
CREATE TABLE IF NOT EXISTS bundles (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    "titleEn" VARCHAR(255) NOT NULL,
    "titleBn" VARCHAR(255) NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionBn" TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'BDT' NOT NULL,
    "includesEbook" BOOLEAN DEFAULT FALSE NOT NULL,
    "includesPdfPackage" BOOLEAN DEFAULT FALSE NOT NULL,
    "includesCourse" BOOLEAN DEFAULT FALSE NOT NULL,
    "includesTrackers" BOOLEAN DEFAULT FALSE NOT NULL,
    "isPublished" BOOLEAN DEFAULT TRUE NOT NULL
);

-- 4. ORDERS TABLE (BKASH / NAGAD / ROCKET MANUAL PAYMENT)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    "customerId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    "bundleId" INT REFERENCES bundles(id) ON DELETE SET NULL,
    "productId" INT REFERENCES products(id) ON DELETE SET NULL,
    "selectedPdfIds" JSONB DEFAULT '[]'::jsonb NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'BDT' NOT NULL,
    "paymentMethod" VARCHAR(32) NOT NULL, -- 'bkash', 'nagad', 'rocket'
    "transactionId" VARCHAR(120) NOT NULL,
    "screenshotKey" VARCHAR(500),
    "paymentStatus" VARCHAR(32) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
    "orderStatus" VARCHAR(32) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected', 'cancelled'
    "noRefundAcknowledged" BOOLEAN DEFAULT TRUE NOT NULL,
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP WITH TIME ZONE,
    "approvedBy" INT REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders("customerId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders("orderStatus");

-- 5. ENTITLEMENTS (UNLOCKED PERMISSIONS)
CREATE TABLE IF NOT EXISTS entitlements (
    id SERIAL PRIMARY KEY,
    "userId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    "orderId" INT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    "productId" INT REFERENCES products(id) ON DELETE SET NULL,
    "bundleId" INT REFERENCES bundles(id) ON DELETE SET NULL,
    scope VARCHAR(120) NOT NULL,
    "grantedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements("userId");

-- 6. ROADMAP & LESSON PROGRESS
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    "userId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    "lessonId" INT NOT NULL, -- 1 to 12 stage number
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_lesson UNIQUE ("userId", "lessonId")
);

-- 7. TRADING JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS "journalEntries" (
    id SERIAL PRIMARY KEY,
    "userId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    setup VARCHAR(120),
    result VARCHAR(120), -- 'Win', 'Loss', 'Breakeven'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_user ON "journalEntries"("userId");

-- 8. DAILY HABITS & DISCIPLINE
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    "userId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    label VARCHAR(255) NOT NULL,
    date VARCHAR(10) NOT NULL, -- 'YYYY-MM-DD'
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT unique_user_habit_date UNIQUE ("userId", label, date)
);

CREATE TABLE IF NOT EXISTS "disciplineEntries" (
    id SERIAL PRIMARY KEY,
    "userId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    label VARCHAR(255) NOT NULL,
    date VARCHAR(10) NOT NULL, -- 'YYYY-MM-DD'
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT unique_user_discipline_date UNIQUE ("userId", label, date)
);

-- 9. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS "supportTickets" (
    id SERIAL PRIMARY KEY,
    "userId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'open' NOT NULL, -- 'open', 'in_progress', 'resolved'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    "userId" INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(120) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. AUDIT EVENTS
CREATE TABLE IF NOT EXISTS "auditEvents" (
    id SERIAL PRIMARY KEY,
    "actorId" INT NOT NULL,
    action VARCHAR(120) NOT NULL,
    entity VARCHAR(120) NOT NULL,
    "entityId" INT,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- SEED INITIAL BUNDLES & PAYMENT NUMBERS
-- ==============================================================================

-- Seed 3 Bundles with exact pricing (৳199, ৳399, ৳799)
INSERT INTO bundles (id, slug, "titleEn", "titleBn", "descriptionEn", "descriptionBn", price, currency, "includesEbook", "includesPdfPackage", "includesCourse", "isPublished")
VALUES 
(1, 'pdf-package', 'PDF Package', 'PDF প্রফেশনাল প্যাকেজ', 'Select from 15 structured learning PDFs with complete chart breakdowns.', '১৫টি স্ট্রাকচার্ড চার্ট ব্রেকডাউন ও প্রাইস অ্যাকশন PDF থেকে সিলেক্ট করুন।', 199.00, 'BDT', FALSE, TRUE, FALSE, TRUE),
(2, 'course-ebook', 'Course + Free eBook', 'ফুল কোর্স + এক্সক্লুসিভ eBook', 'A complete structured learning path with an included comprehensive eBook.', 'একটি সম্পূর্ণ ভিডিও কোর্স সাথে সম্পূর্ণ ফ্রি প্রফেশনাল গাইড eBook।', 399.00, 'BDT', TRUE, FALSE, TRUE, TRUE),
(3, 'master-bundle', 'Master Full Bundle', 'অল-ইন-ওয়ান মাস্টার বাণ্ডেল', 'All 15 PDFs, full video course, and complete institutional eBook in one path.', '১৫টি PDF, সম্পূর্ণ ভিডিও কোর্স এবং এক্সক্লুসিভ eBook এক সাথে পান।', 799.00, 'BDT', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    "titleEn" = EXCLUDED."titleEn",
    "titleBn" = EXCLUDED."titleBn";

-- Seed Default Payment Phone Numbers (Bkash, Nagad, Rocket)
INSERT INTO settings (key, value)
VALUES 
('bkash', '01961079326'),
('nagad', '01961079326'),
('rocket', '01961079326')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- SUCCESS MESSAGE
-- ==============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Cycle of Chart database schema initialized successfully!';
END $$;
