# Day-2 Worker B — Frontend: Replace Mocks + Contracts Types

## Branch
`day2/frontend-real-data`

## Scope lock
Only modify:
- `apps/web/app/_lib/types.ts`
- `apps/web/app/_lib/mock-data.ts`
- `apps/web/app/map/page.tsx`
- `apps/web/app/map/MapClient.tsx`

Do NOT modify anything under `apps/web/app/api/`.
May import from `_lib/prisma.ts` and `_lib/mappers.ts` (created by Worker A) but must NOT modify them.

## Prerequisites
Worker A's branch (`day2/api-routes`) must be merged first. It provides:
- `apps/web/app/_lib/prisma.ts` — PrismaClient singleton
- `apps/web/app/_lib/mappers.ts` — `mapTrip()`, `mapTripItem()` mapping functions

## Objective

1. **Replace `_lib/types.ts`** — Delete all 89 lines of local type stubs. Replace with re-exports from `@travel/contracts`:
   ```ts
   export type {
     Trip, TripStatus, TripItem, TripItemType, TripItemStatus,
     Location, Price, FlightLocation, FlightClass,
     OfferHotel, OfferFlight, Offer,
     Media, MediaType, MediaSource, MediaAttribution,
     Citation, CitationType,
   } from '@travel/contracts';
   ```
   All existing imports from `'@/app/_lib/types'` throughout the app continue to work unchanged.

2. **Replace `_lib/mock-data.ts`** — Delete all hardcoded arrays (~290 lines). Rewrite the four exported functions using **direct prisma + mapper imports** (NOT self-fetch to own API):
   ```ts
   import { prisma } from '@/app/_lib/prisma';
   import { mapTrip, mapTripItem } from '@/app/_lib/mappers';
   ```
   - `fetchTrips()` → `prisma.trip.findMany()` + `mapTrip()`
   - `fetchTrip(id)` → `prisma.trip.findUnique({ include: { items } })` + `mapTrip()`
   - `fetchHotelOffers()` → query all TripItems with non-null `offerData`, filter where parsed `offer.type === 'hotel'`, return `OfferHotel[]`
   - `fetchFlightOffers()` → same pattern, filter `offer.type === 'flight'`, return `OfferFlight[]`

   **Critical:** Function signatures must remain identical so the 4 page components need zero changes.

3. **Wire `map/page.tsx`** — Import prisma + mappers directly. Fetch all trips with items, extract items that have `location.lat` and `location.lng`, build `pins` array, pass as prop to `MapClient`.

4. **Clean up `map/MapClient.tsx`** — Remove the hardcoded `SAMPLE_PINS` array. Accept `pins` purely via props from the server component.

## Pages that need NO changes
These pages import `fetchTrips`/`fetchTrip`/`fetchHotelOffers`/`fetchFlightOffers` from `mock-data.ts`. Since function signatures are preserved, they work without modification:
- `apps/web/app/trips/page.tsx`
- `apps/web/app/trips/[id]/page.tsx`
- `apps/web/app/search/hotels/page.tsx`
- `apps/web/app/search/flights/page.tsx`

## Verification
```bash
pnpm dev
```
- `/trips` → shows 2 DB trips (Tokyo Adventure + Italian Summer), NOT 3 old mocks
- `/trips/<id>` → shows real items from seed data (4 items for Tokyo, 6 for Italy)
- `/search/hotels` → shows hotel offers extracted from trip items (Park Hyatt Tokyo, Hotel de Russie)
- `/search/flights` → shows flight offers from trip items (UA837, UA838, AZ611)
- `/map` → shows pins at real locations (Tokyo sites + Rome + Florence), NOT hardcoded sample pins
- `pnpm build` → passes with no type errors

## Codex prompt
> You are working in ../documents/travel.aw on branch day2/frontend-real-data.
> Read TASKS/08_day2_frontend_real_data.md and implement it exactly.
> SCOPE: Only modify apps/web/app/_lib/types.ts, apps/web/app/_lib/mock-data.ts, apps/web/app/map/page.tsx, and apps/web/app/map/MapClient.tsx. You may import from _lib/prisma.ts and _lib/mappers.ts but do NOT modify them.
> TASK: Replace local type stubs with re-exports from @travel/contracts. Replace all mock data arrays with real Prisma queries using the shared prisma singleton and mapper functions. Wire the map page to fetch real trip item locations. Remove hardcoded map pins. Keep all fetch function signatures identical so page components need zero changes.
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.
