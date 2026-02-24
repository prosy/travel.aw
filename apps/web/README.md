# travel.aw web app

## Run

1. Install dependencies:
   - `pnpm --dir apps/web install`
2. Start development server:
   - `pnpm --dir apps/web dev`
   - If port 3000 is busy: `pnpm --dir apps/web dev -- -p 3010`

## Seattle routes

- `/seattle`
- `/seattle/planning`
- `/seattle/while-in-seattle`
- `/seattle/while-in-seattle/sports`

## Sports stored-query dependency

The sports page loads `/api/seattle/sports`, which calls the Seattle wiki service.

Default service base:

- `http://127.0.0.1:8787`

Override with:

- `SEATTLE_WIKI_API_BASE=http://<host>:<port>`

