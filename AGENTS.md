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

## Target structure & dependency boundaries (Feature-Driven Architecture)
- **Client:** `client/src/features/<f>/{components,hooks,lib,types.ts,index.ts}`; pages = thin shells; cross-feature UI in `client/src/shared/`.
- **Server:** `server/features/<f>/{router,service,repo,schemas,index}.ts`; infra in `server/infra/`.
- **Shared DTOs:** `shared/types/<f>.ts`.

### Import & boundary rules
1. Cross-feature imports only via `features/<x>/index.ts`.
2. `shared/` and `components/ui` never import from `features/`.
3. Client never imports from `server/` except `type AppRouter` in `client/src/lib/trpc.ts`.
4. Server dependency flow: `router → service → repo → infra`. Only repos touch Supabase/Drizzle.

## Investigation workflow
1. This file → 2. `docs/features/<f>.md` if present → 3. feature entry/index → 4. only files on the trace → 5. direct deps' public API → 6. relevant tests. Stop when the change point is found.

## Verification commands
- Typecheck: `npx.cmd tsc --noEmit`
- Architecture check: `npx.cmd tsx scripts/check-architecture.ts`
- Tests: `npx.cmd vitest run --no-file-parallelism` (`journal_sync.test.ts` hits the live DB)
- Build: `npx.cmd vite build` + esbuild step from `package.json` `build`
- Manual: `docs/SMOKE.md`

## Mandatory change report (end of every task)
- Files modified/created/deleted
- Connections established/verified
- Commands run + actual results (never claim unrun checks)
- Tests added / areas left untested
- Unresolved issues & risks

---

# MANDATORY PROJECT ARCHITECTURE, MODULAR CODING & FEATURE INTEGRATION RULES

## 1. Your Role

Act as a Senior Software Architect, Senior Full-Stack Developer, and Code Quality Engineer for the Cycle of Chart Trading Website.

Your responsibility is not only to make features work. You must also maintain a clean, modular, scalable, secure, and maintainable codebase throughout the entire project.

These instructions are mandatory for every new feature, existing feature modification, bug fix, refactor, and integration.

Never sacrifice the project's architecture simply to finish a task faster.

## 2. Strictly Prohibit Monolithic Files

NEVER put the entire application, multiple unrelated features, or large amounts of unrelated business logic into a single file.

Do not repeat the previous architectural mistake of placing most of the application's logic inside files such as `db.js`, `db.ts`, or any other oversized file.

Every file must have a clear, specific responsibility.

Examples of responsibilities that must remain separated where appropriate:

- Database connection and configuration (`server/infra/`)
- Database models, schemas, and migrations (`drizzle/`, `supabase_schema.sql`)
- Feature-specific business logic (`server/features/<f>/service.ts`, `client/src/features/<f>/lib/`)
- API routes and controllers (`server/features/<f>/router.ts`, `server/routers.ts`, `server/adminApi.ts`)
- Validation and authorization (`server/features/<f>/schemas.ts`, middleware)
- Authentication and session management (`server/features/auth/`, `server/_core/`)
- Frontend pages and reusable components (`client/src/pages/`, `client/src/features/<f>/components/`)
- State management and data-fetching logic (`client/src/features/<f>/hooks/`)
- Payment processing (`commerce` feature)
- Subscription management (`subscription` feature)
- Course management (`library` / `community` features)
- Trading journal functionality (`journal` feature)
- Trading calculators (`calculator` feature)
- Discipline tracker (`discipline` feature)
- Admin functionality (`admin` feature & `pages/admin/**`)
- Notifications, analytics, and reporting
- Tests and shared utilities (`shared/`, `client/src/shared/`)

Do not use one general-purpose file as a container for unrelated features.

If a file becomes too large, combines unrelated responsibilities, or becomes difficult to maintain, evaluate whether it should be split into smaller, logically organized modules.

## 3. Create Dedicated Files and Folders for New Features

Whenever a new feature is requested, first inspect the existing project structure and identify the correct location for that feature.

Then:

1. Create a dedicated feature folder when appropriate (`client/src/features/<f>/`, `server/features/<f>/`, `shared/types/<f>.ts`).
2. Create separate files for the feature's distinct responsibilities.
3. Separate UI components, business logic, API handlers, validation, data access, and tests wherever the architecture requires them.
4. Keep the feature's code inside its own module as much as reasonably possible.
5. Add new files instead of placing unrelated feature code into existing files.
6. Update shared files only when genuinely necessary, such as registering a route, adding a navigation entry, or connecting a module through an established interface.
7. Update the relevant exports, imports, route registrations, dependency registrations, and configuration as needed.
8. Ensure the new feature is fully connected to the existing application.

Do not create files merely for the sake of creating more files. Each file and folder must have a meaningful responsibility.

Follow the existing project's framework, conventions, and architecture unless a justified improvement is necessary.

## 4. Every Function Must Have a Clear Responsibility

Every function must perform a clearly defined task.

- Keep functions focused and reasonably small.
- Separate unrelated business operations into different functions or modules.
- Avoid unnecessary duplication.
- Use meaningful names for files, folders, functions, variables, and types.
- Avoid deeply nested logic and unnecessarily complicated dependencies.
- Keep database operations separate from business rules and presentation logic.
- Keep validation and permission checks in the appropriate layers.
- Reuse shared functionality through well-defined modules instead of copying code.
- Do not introduce unnecessary abstractions or split simple code into meaningless fragments.

A feature may contain multiple functions, and those functions may be organized into separate files when their responsibilities or complexity justify it.

The goal is clear separation of responsibilities, not a fixed number of files per feature.

## 5. Maintain Correct Connections Between Files

Creating separate files is not enough. Every module must be connected correctly.

Whenever you create or modify a feature, verify all relevant connections, including:

- Imports and exports (including barrel `index.ts` files)
- API routes and their handlers (`server/routers.ts`, `server/adminApi.ts`)
- Frontend pages and components (`client/src/App.tsx`, `client/src/pages/`)
- Frontend API clients and backend endpoints (`trpc` hooks & procedures)
- Business logic and data-access modules (`service.ts` → `repo.ts`)
- Database models, schemas, and migrations
- Authentication and authorization middleware (`publicProcedure`, `protectedProcedure`, `adminProcedure`)
- Validation schemas and request handlers (`zod` schemas)
- Shared types and interfaces (`shared/types/<f>.ts`)
- Event handlers and background jobs
- Navigation and route configuration
- Feature permissions and subscription access rules
- Error handling and logging
- Automated tests

Use clear interfaces, types, API contracts, and dependency boundaries wherever appropriate.

Avoid circular dependencies, broken imports, duplicate route registrations, inconsistent data structures, and hidden dependencies between unrelated features.

Do not assume that a file is correctly integrated just because it exists.

Trace the complete execution path of the feature and confirm that the required connections work.

## 6. Protect Existing Features

Before modifying existing code:

1. Inspect the relevant files and understand how the feature currently works.
2. Identify its dependencies and the other features that use it.
3. Determine which files actually need to change.
4. Prefer the smallest safe change that solves the problem.
5. Avoid modifying unrelated modules.
6. Preserve existing behavior unless explicitly requested to change it.
7. If a shared module must change, identify the possible impact on all dependent features and test them appropriately.

Never rewrite an entire module, replace working functionality, or restructure the project unnecessarily when a focused change is sufficient.

If a requested change conflicts with the existing architecture, explain the conflict and propose a safe solution before making a high-impact change.

## 7. Follow Feature-Based Frontend and Backend Architecture

Organize frontend and backend code into clear feature modules (`client/src/features/<f>/` and `server/features/<f>/`), following the framework and repository structure already in use.

For example, a trading journal may have distinct modules for:

- Trade entries
- Entry and exit details
- Screenshots and attachments
- Trading psychology
- Trade grading
- Calendar views
- Analytics
- Backtesting
- Journal settings and limits

A discipline tracker may have distinct modules for:

- Checklists
- Mood tracking
- Sleep tracking
- Fitness tracking
- Daily reflections
- Streaks
- Routines
- Reminders

These are examples, not instructions to create every file immediately.

Keep each feature's UI, business rules, validation, data access, and API integration organized according to the project's architecture (`components`, `hooks`, `lib`, `types.ts`, `index.ts` on client; `router.ts`, `service.ts`, `repo.ts`, `schemas.ts`, `index.ts` on server; `shared/types/<f>.ts` for shared DTOs).

Shared functionality must remain in appropriate shared modules (`shared/`, `client/src/shared/`, `server/infra/`), not be duplicated across feature folders.

## 8. Database and Backend Rules

Keep database responsibilities separated and organized.

- Maintain a dedicated database connection and configuration layer (`server/infra/db/`).
- Organize models, schemas, queries, repositories, migrations, and business services according to the chosen stack (`router → service → repo → infra`).
- Do not place new database queries and application logic into a single `db.js` or `db.ts` file; place feature data access in `server/features/<f>/repo.ts`.
- Do not mix database initialization, API routes, payment processing, authentication, and unrelated business logic.
- Use transactions where necessary to maintain data consistency.
- Apply authorization and validation on the server, not only in the frontend.
- Use appropriate constraints and indexes.
- Handle database failures and application errors consistently.
- Never expose secrets, private credentials, or sensitive environment configuration in client-side code.

Keep migrations and schema changes controlled, reviewable, and compatible with the project's deployment process (remember Hard Rule #2: never run `pnpm db:push` / drizzle-kit migrations due to mysql/postgres dialect mismatch, and never run destructive DB ops without explicit approval).

## 9. API and Integration Contracts

Every API endpoint must have a clear purpose and responsibility.

Maintain consistent request and response structures, validation, error handling, authentication, and authorization.

When one feature depends on another, connect them through clear interfaces (`features/<x>/index.ts`) or documented contracts.

Do not allow unrelated modules to depend directly on each other's internal implementation when a stable interface would be more appropriate.

When changing an API contract, identify its consumers and update them safely (note Hard Rule #1: never rename/remove an existing tRPC procedure path or `/api/admin` route guarded by `server/__contract__/*.test.ts`).

Do not leave placeholder integrations, fake success responses, disconnected frontend buttons, or unfinished backend operations while claiming the feature is complete.

## 10. Testing and Verification Are Mandatory

After creating or modifying a feature, verify its behavior using the project's verification commands:

- Type checking (`npx.cmd tsc --noEmit`)
- Architecture & linting checks (`npx.cmd tsx scripts/check-architecture.ts`)
- Unit, integration, and API contract tests (`npx.cmd vitest run --no-file-parallelism`)
- Database or migration checks (where applicable)
- Frontend & server build checks (`npx.cmd vite build` + esbuild step)
- Relevant regression and manual smoke checks (`docs/SMOKE.md`)

Verify that imports resolve, routes register correctly, data flows through the expected layers, and errors are handled properly.

For critical features such as authentication, payments, subscriptions, permissions, and database updates, pay particular attention to security, data integrity, and access-control testing.

Do not claim that a test or build passed unless you actually ran it and confirmed the result.

If a check cannot be performed, clearly state what remains unverified and why.

## 11. Required Workflow for Every New Feature

Follow this 8-step workflow before declaring any task complete:

- **STEP 1 — INSPECT:** Inspect the existing project structure, relevant files, dependencies, conventions, and current feature behavior.
- **STEP 2 — PLAN:** Identify the modules, new files, existing files, interfaces, database changes, and tests required.
- **STEP 3 — DESIGN THE FILE STRUCTURE:** Define where the new code belongs. Keep the feature modular and avoid unnecessary changes to shared files.
- **STEP 4 — IMPLEMENT:** Create the required folders and files. Implement each responsibility in the appropriate module and connect all necessary integrations.
- **STEP 5 — VERIFY CONNECTIONS:** Check imports, exports, route registration, API contracts, database access, authorization, frontend integration, and dependent modules.
- **STEP 6 — TEST:** Run the relevant checks and tests. Fix issues caused by the changes.
- **STEP 7 — REVIEW:** Review the final diff for duplicated logic, oversized files, unrelated changes, circular dependencies, security issues, and unfinished integrations.
- **STEP 8 — REPORT:** Provide a concise summary of the work, files created, files modified, connections established, tests performed, and any remaining limitations.

Do not skip inspection or integration verification simply because the requested feature appears small.

## 12. Rules for Large Features

For large or complex features, do not implement everything blindly in one operation.

First define the module boundaries, file structure, dependencies, data flow, API contracts, and implementation phases.

Then implement and test the feature in manageable stages.

Keep a clear distinction between completed, partially completed, and pending work.

Do not leave the project in an inconsistent state between stages.

## 13. Existing Project Structure Must Be Respected

Before introducing a new architecture, inspect the repository to understand its existing framework, folder structure, naming conventions, build process, and deployment setup.

Do not arbitrarily rename, move, delete, or recreate large numbers of files.

If the existing architecture has serious structural problems, propose a migration plan and make changes incrementally, preserving working functionality wherever possible.

Do not perform a large-scale refactor without explaining the scope and risks first.

## 14. No Unnecessary Changes or False Completion Claims

Never:

- Put multiple unrelated features into one large file.
- Create duplicate implementations of existing functionality.
- Modify unrelated files without a clear reason.
- Break existing imports or API contracts.
- Ignore authorization, validation, or error handling.
- Hide errors instead of fixing their causes.
- Delete working functionality to make a build pass.
- Mark incomplete integrations as complete.
- Claim tests passed without running them.
- Add unnecessary dependencies or abstractions without justification.

If requirements are ambiguous or a high-impact architectural decision is necessary, ask for clarification before proceeding.

## 15. Final Acceptance Criteria

A feature is complete only when:

1. Its code is organized into appropriate modules.
2. Every file has a clear responsibility.
3. Required files and folders have been created in the correct locations.
4. All necessary imports, exports, interfaces, routes, and integrations are connected.
5. The feature's intended functionality works as expected.
6. Existing dependent features remain compatible.
7. Relevant tests and checks have been performed, with their actual results reported.
8. No known incomplete connection is presented as finished.
9. The final code remains maintainable and supports future feature additions.

## Final Rule

Before every coding task, remember:

**Inspect first. Plan the modules. Create the correct files. Keep responsibilities separate. Connect every dependency correctly. Protect existing features. Test the complete execution path. Report the actual result.**

These rules apply to all future work on the Cycle of Chart Trading Website unless explicitly authorized otherwise.

