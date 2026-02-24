# Seattle Feature Scaffold (First Pass)

This folder is the initial route/component scaffold for Seattle-specific UX.

## Implemented route groups

- `planning/` for pre-trip planning views
- `while_in_seattle/` for in-city views

## Implemented pages

1. `/seattle`
2. `/seattle/planning`
3. `/seattle/while-in-seattle`
4. `/seattle/while-in-seattle/sports`

## API routes

1. `/api/seattle/query?phase=...&intent=...&near=...&limit=...`
2. `/api/seattle/sports` (fires stored query trigger `seattle_sports`)

## Data and server modules

- Data contracts: `data/seattle/`
- Server catalog loader: `src/features/seattle/server/catalog.ts`
- Deterministic query engine: `src/features/seattle/server/query.ts`

## Runtime notes

- Sports page trigger fires on page open in client via `/api/seattle/sports`.
- `/api/seattle/sports` calls the Seattle wiki service at `SEATTLE_WIKI_API_BASE` or `http://127.0.0.1:8787`.
