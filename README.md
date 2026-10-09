# Cycle of Chart / Trading Reality

Production platform for institutional chart breakdown, trade journaling, execution analytics, and structured curriculum.

---

## Architectural Rule: Cross-Device Data Persistence & Single Source of Truth

> ### ⚠️ STANDING RULE FOR ALL CURRENT AND FUTURE FEATURES
> **Any data that a logged-in user creates, updates, or customizes MUST be saved to the database through an authenticated server API, tied to that user's canonical User ID (`users.id`).**
> 
> 1. **Database as Single Source of Truth:**
>    - All user-owned data (Trade Journal Books, Trade Entries, Notebooks, Daily Discipline, Settings, Roadmap Progress, Support Messages, Onboarding) must be stored in PostgreSQL / Supabase.
>    - `localStorage`, `sessionStorage`, `IndexedDB`, and client React state may ONLY be used as **non-authoritative, optimistic caches or temporary offline storage** — NEVER as the sole copy of user data.
>
> 2. **Canonical Identity Resolution:**
>    - Always use `resolveUserCanonicalAndDerived(userId, openId)` in `server/db.ts` to ensure consistency between the database autoincrement ID (`users.id`) and OAuth hash identifiers (`openId`).
>
> 3. **Non-Destructive Synchronization & Data Rescue:**
>    - When a fresh device or cleared browser connects for the first time, its empty local cache (`[]`) must **NEVER** overwrite existing server records.
>    - Client loads must perform non-destructive merges, pulling the latest state from the database while rescuing any un-synced local data to the server.
>
> 4. **Dual Persistence Layer:**
>    - User data is persisted both to dedicated relational tables (e.g., `traderTrades`, `journalBooks`, `userNotebooks`) and structured JSON fallbacks in `settings` (`user_trades_${canonicalId}`, `user_books_${canonicalId}`) to guarantee zero data loss.

---

## Master Implementation & Verification Rule

> ### 🛡️ MANDATORY PROCESS FOR ALL FUTURE WORK IN THIS REPOSITORY
>
> Do **NOT** consider any task complete merely because files were edited or code was generated.
>
> ### Before making changes:
> 1. **Analyze existing project structure**: Review repository layout, routing, schema, and current behavior.
> 2. **Locate exact touchpoints**: Identify exact pages, components, hooks, APIs, database logic, auth/permissions, and state management.
> 3. **Search for conflicts/duplicates**: Audit codebase for legacy, deprecated, or duplicate implementations of the requested feature.
> 4. **Understand existing workflow**: Trace current code pathways and state transitions prior to editing.
> 5. **Identify dependencies & side-effects**: Anticipate impacts on dependent features, caching layers, and shared tables.
>
> ### During implementation:
> 6. **In-place architectural integration**: Integrate strictly into existing architecture; avoid parallel or duplicate subsystems.
> 7. **Reuse existing assets**: Maximize reuse of existing UI components, design tokens, hooks, API routers, and database helpers.
> 8. **Resolve conflicts in-place**: If an existing implementation conflicts with requested behavior, refactor the existing code rather than creating competing logic.
> 9. **Preserve unrelated features**: Do not alter unrelated features, pages, or styling tokens.
> 10. **Zero regression**: Preserve all existing functionality not explicitly requested to change.
>
> ### After implementation — Complete Verification Pass:
> 11. **Requirement-by-requirement verification**: Cross-check every user requirement item by item.
> 12. **End-to-End Trace**: Verify the complete loop:
>     `UI → component/state → API/server logic → database → response/state update → UI`.
> 13. **Runtime validation**: Confirm actual running application behavior matches the requested behavior.
> 14. **Conflict re-scan**: Ensure no legacy or duplicate code overrides or bypasses the new implementation.
> 15. **Auth & Permissions**: Verify authentication, role checks, and ownership constraints where applicable.
> 16. **Responsive testing**: Verify responsive layout on mobile, tablet, and desktop form factors.
> 17. **Error checks**: Verify zero runtime errors, console exceptions, or unhandled promise rejections.
> 18. **Build & Type Check**: Run `npm run check` (`tsc --noEmit`) and `npm run build` cleanly.
> 19. **Defect remediation**: If any error, conflict, or incomplete behavior is found, fix it before declaring completion.
> 20. **Re-verification**: Re-test all affected flows after fixes are applied.
>
> ### Final Standardized Report:
> Every delivery must provide:
> 1. **What was changed.**
> 2. **Which files/systems were affected.**
> 3. **What was verified.**
> 4. **Any remaining issue that could not be verified or fixed (with clear identification of blockers).**

