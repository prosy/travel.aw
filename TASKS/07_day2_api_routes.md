# Day-2 Worker A — API Routes + Prisma Mapping Layer

## Branch
`day2/api-routes`

## Scope lock
Only create/modify:
- `apps/web/app/_lib/prisma.ts` (NEW)
- `apps/web/app/_lib/mappers.ts` (NEW)
- `apps/web/app/api/trips/route.ts` (NEW)
- `apps/web/app/api/trips/[id]/route.ts` (NEW)
- `apps/web/app/api/trips/[id]/items/route.ts` (NEW)
- `apps/web/app/api/media/route.ts` (NEW)
- `apps/web/app/api/email/inbound/route.ts` (MODIFY — 2-line import change only)

Do NOT modify any `.tsx` page components, `_lib/mock-data.ts`, or `_lib/types.ts`.

## Objective

1. **`_lib/prisma.ts`** — Standard Next.js PrismaClient singleton (global cache to avoid multiple instances on hot reload).

2. **`_lib/mappers.ts`** — Pure mapping functions that convert Prisma model outputs to `@travel/contracts` types:
   - `mapTrip(prismaTripWithItems) → Trip` — maps `createdAt`/`updatedAt` DateTime→ISO string, optionally maps nested `items` array
   - `mapTripItem(prismaTripItem) → TripItem` — maps flat `locationName/Address/Lat/Lng` → nested `Location`, flat `priceAmount/priceCurrency` → nested `Price`, parses `offerData` JSON string → `offer` object, parses `citationsData` JSON string → `citations` array, maps `startDateTime`/`endDateTime` DateTime→ISO string
   - `mapMedia(prismaCachedMedia) → Media` — parses `attribution` JSON string, builds `dimensions` from `width`/`height`

3. **`GET /api/trips`** — Returns `Trip[]` ordered by `startDate` asc. Does NOT include items (list view). Uses `prisma.trip.findMany()` + `mapTrip()`.

4. **`GET /api/trips/[id]`** — Returns single `Trip` with nested `items: TripItem[]` ordered by `startDateTime` asc. Returns 404 JSON if not found. Uses `prisma.trip.findUnique({ include: { items: true } })` + `mapTrip()`.

5. **`GET /api/trips/[id]/items`** — Returns `TripItem[]` for a given trip. Convenience endpoint for map/pins use case.

6. **`GET /api/media`** — Returns `Media[]` ordered by `cachedAt` desc.

7. **Refactor email inbound route** — Replace inline `new PrismaClient()` with import from shared `_lib/prisma.ts`. No logic changes.

## Verification
```bash
pnpm db:push && pnpm db:seed
pnpm dev
curl http://localhost:3000/api/trips | jq          # 2 trips, no items field
curl http://localhost:3000/api/trips/<id> | jq     # trip + items with nested objects
curl http://localhost:3000/api/trips/bad-id        # 404
curl http://localhost:3000/api/media | jq          # 2 media objects
pnpm build                                         # clean compile
```

Verify: `price` is `{amount, currency}` (not flat), `location` is nested object, `offer` is parsed (not JSON string), `createdAt` is ISO string.

## Codex prompt
> You are working in ../documents/travel.aw on branch day2/api-routes.
> Read TASKS/07_day2_api_routes.md and implement it exactly.
> SCOPE: Only create/modify apps/web/app/_lib/prisma.ts, apps/web/app/_lib/mappers.ts, apps/web/app/api/trips/**, apps/web/app/api/media/route.ts, and apps/web/app/api/email/inbound/route.ts (2-line import refactor only).
> TASK: Create PrismaClient singleton. Create Prisma→contracts mapper functions (mapTrip, mapTripItem, mapMedia) handling flat→nested, JSON parse, DateTime→ISO transforms. Create GET /api/trips, GET /api/trips/[id], GET /api/trips/[id]/items, GET /api/media endpoints. Refactor email inbound route to use shared prisma singleton. All API responses must match @travel/contracts types exactly.
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.
