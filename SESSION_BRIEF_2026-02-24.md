# Session Brief — Seattle Deterministic MVP
Date: 2026-02-24  
Repo: `travel.aw`

## What we completed
- Built a Seattle deterministic (non-vector) RAG scaffold in-repo:
  - `data/seattle/` catalogs + trigger mapping
  - `tools/seattle_categories/` deterministic query tooling
- Added a local web MVP in `apps/web`:
  - Seattle routes: `/seattle`, `/seattle/planning`, `/seattle/while-in-seattle`, `/seattle/while-in-seattle/sports`
  - APIs: `/api/seattle/query`, `/api/seattle/sports`
- Implemented stored-query behavior for Sports page:
  - Page-open fires a stored query and renders concise output (summary + selected table), not full raw section HTML.
- Matched UI direction to app style baseline:
  - top navigation active state
  - intent tabs/cards
  - sticky query-state side panel
- Fixed runtime issue on Next.js 16 pages by resolving async `searchParams` before property access.

## What we learned
- The local app path in this environment is effectively:
  - `/Users/blackcat/Documents/travel.aw` -> symlink to `/Users/blackcat/Documents/GitHub/travel.aw`
- Seattle flow requires two running services:
  - `Seattle_wikidata` API (`127.0.0.1:8787`)
  - `apps/web` Next.js app (tested on `3010` because `3000` may be occupied)
- On Next.js 16 server routes/pages, `searchParams` can be async; direct sync property access triggers runtime errors/warnings.

## Current local run commands
Terminal 1:
```bash
cd /Users/blackcat/Documents/Seattle_wikidata
pnpm serve
```

Terminal 2:
```bash
cd /Users/blackcat/Documents/GitHub/travel.aw
SEATTLE_WIKI_API_BASE=http://127.0.0.1:8787 pnpm --dir apps/web exec next dev -p 3010
```

Open:
- `http://127.0.0.1:3010/seattle`
- `http://127.0.0.1:3010/seattle/planning`
- `http://127.0.0.1:3010/seattle/while-in-seattle`
- `http://127.0.0.1:3010/seattle/while-in-seattle/sports`

## Next session kickoff (recommended order)
1. Final browser QA pass on Seattle flows (filters, triggers, API payload shape).
2. Decide integration depth:
   - keep Seattle module isolated first, or
   - wire into broader travel.aw IA/navigation/auth structure.
3. Add small production hardening pass:
   - explicit error UI for unavailable wiki service
   - request timeout/retry policy for sports trigger call
   - Next config cleanup for Turbopack root warning.
4. Commit/PR hygiene:
   - split optional cleanup from feature changes only if desired by reviewer.
