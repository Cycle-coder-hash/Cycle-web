# Manual Smoke Checklist

Run after every migration phase (`npx.cmd tsx watch server/_core/index.ts` or `pnpm dev`). Desktop + mobile width, light + dark.

| # | Flow | Expected |
|---|---|---|
| 1 | `/register` new account → `/login` | Logged in, redirected to dashboard |
| 2 | `/` Home | Hero, roadmap, store, plans render; language toggle works |
| 3 | `/dashboard` each tab (overview, roadmap, library, journal, discipline, calculator, orders, support) | Renders, no console errors |
| 4 | Journal: create book, log trade, edit, delete | Persists after reload |
| 5 | Discipline: toggle task, workout timer, daily journal save | Persists after reload |
| 6 | Notebook: create page, add block | Persists after reload |
| 7 | Calculator: enter balance/risk/SL | Lot size computed |
| 8 | `/checkout?plan=pro` submit TrxID | Order appears as pending |
| 9 | `/admin` approve that order | User plan becomes Pro |
| 10 | `/leaderboard` | Rankings, ticker, animations render |
| 11 | `/support` send message; admin replies | Both sides see thread |
| 12 | `/settings` change preference | Persists after reload |
| 13 | External admin console (`/api/admin/*`) | Stats, orders, users load |
