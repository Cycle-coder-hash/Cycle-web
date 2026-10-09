# AGENTS.md — Cycle of Chart

Read this first. Then read only the feature you are changing. Do NOT scan the whole repo.

## Stack & entry points
- Client: React 19 + Vite + wouter + tRPC/TanStack Query + Tailwind 4 + shadcn (`client/src/components/ui`).
- Server: Express + tRPC 11. Entry `server/_core/index.ts` (bundled by esbuild to `dist/index.js`; Vercel calls it via `api/index.js`). **Do not move the entry.**
- Router composition: `server/routers.ts` (namespaces: `auth`, `public`, `customer`, `support`, `admin`, `leaderboard`, `subscription`, `system`).
- Admin REST (external admin console): `server/adminApi.ts` mounted at `/api/admin`.
- Data: Supabase/Postgres via `server/db.ts` (+ in-memory fallbacks). Postgres schema reference: `supabase_schema.sql`. `drizzle/schema.ts` uses the **mysql** dialect — see Hard rules.
- Client routes: `client/src/App.tsx`.

## Hard rules
1. Never rename/remove a tRPC procedure path or an `/api/admin` route. Guarded by `server/__contract__/*.test.ts`.
2. Never run `pnpm db:push` / drizzle-kit migrations (dialect mismatch). No destructive DB ops without explicit approval.
3. No new dependencies, no framework/DB changes, no UI redesign during refactors.
4. Preserve behavior; refactors are move/extract only.
5. On Windows PowerShell use `npx.cmd` (pnpm.ps1 is blocked by execution policy).

## Feature map (current locations → migration target `features/<name>`)
| Feature | Client | Server | tRPC ns |
|---|---|---|---|
| auth | `pages/Auth.tsx`, `_core/hooks/useAuth.ts` | `routers.ts` auth, `_core/{oauth,password,sdk}.ts` | auth |
| account | `pages/Settings.tsx`, `contexts/UserPreferencesContext.tsx` | `db.ts` "USER PREFERENCES" section | customer |
| subscription | `components/subscription/` | `subscription.ts`, `userManagement.ts` | subscription, admin |
| commerce | `pages/Checkout.tsx`, `components/payment/` | `db.ts` "PAYMENT GATEWAYS" section, `shared/commerce.ts` | public, customer, admin |
| journal | `components/journal/`, `lib/{traderJournalStorage,journalCalculations,tradePdfExport}.ts` | `db.ts` "TRADER TRADES" section | customer |
| notebook | `components/notebook/`, `lib/notebookStorage.ts` | `db.ts`, `subscription.ts` (quotas) | customer |
| discipline | `components/discipline/`, `lib/disciplineTimeUtils.ts` | `db.ts` "DAILY DISCIPLINE SYSTEM" section | customer |
| calculator | `components/calculator/`, `lib/positionCalculator.ts` | — | — |
| leaderboard | `pages/Leaderboard.tsx` | `db.ts` "LEADERBOARD SYSTEM" section | leaderboard |
| support | `pages/Support.tsx`, `components/{SupportChat,FloatingSupportButton}.tsx` | `db.ts` support section | support, admin |
| community (telegram) | `components/{StudentTelegramAccessModal,CourseTelegramModal}.tsx` | `db.ts` "COURSE TELEGRAM" section | customer, admin |
| library (ebooks) | `components/ebook/`, `pages/admin/tabs/EbooksTab.tsx` | `db.ts` | public, admin |
| owner-profile | `pages/admin/tabs/OwnerProfileTab.tsx` | `db.ts` "OWNER PROFILE" section | public, admin |
| media | `lib/mediaUpload.ts` | `uploadRoute.ts`, `storage.ts`, `_core/storageProxy.ts` | REST |
| marketing | `pages/Home.tsx`, `components/{HeroCandle3D,JournalAnalyticsShowcase,NewsHeadlineStats}.tsx` | — | — |
| admin UI | `pages/admin/**` | `routers.ts` admin, `adminApi.ts` | admin |

Find a section in `server/db.ts` by searching its UPPERCASE header comment instead of reading the file.

## Target structure (migration in progress — see plan)
- Client: `client/src/features/<f>/{components,hooks,lib,types.ts,index.ts}`; pages = thin shells; cross-feature UI in `client/src/shared/`.
- Server: `server/features/<f>/{router,service,repo,schemas,index}.ts`; infra in `server/infra/`.
- Shared DTOs: `shared/types/<f>.ts`.

## Import rules
1. Cross-feature imports only via `features/<x>/index.ts`.
2. `shared/` and `components/ui` never import from `features/`.
3. Client never imports from `server/` except `type AppRouter` in `client/src/lib/trpc.ts`.
4. Server: router → service → repo → infra. Only repos touch Supabase/Drizzle.

## Investigation workflow
1. This file → 2. `docs/features/<f>.md` if present → 3. feature entry/index → 4. only files on the trace → 5. direct deps' public API → 6. relevant tests. Stop when the change point is found.

## Verification commands
- Typecheck: `npx.cmd tsc --noEmit`
- Tests: `npx.cmd vitest run --no-file-parallelism` (`journal_sync.test.ts` hits the live DB)
- Build: `npx.cmd vite build` + esbuild step from `package.json` `build`
- Manual: `docs/SMOKE.md`

## Mandatory change report (end of every task)
- Files modified/created/deleted
- Commands run + actual results (never claim unrun checks)
- Tests added / areas left untested
- Unresolved issues & risks
