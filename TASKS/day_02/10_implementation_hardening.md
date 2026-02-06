# travel.aw — Day-2.5: Hardening & Bug Fixes

> **Prerequisite:** Day-2 workers A + B merged. All API routes, mappers, and frontend wiring operational.
> **Goal:** Address every critical/high issue found during code review before adding new features.

---

## Summary of Findings

Full codebase review completed. Architecture is solid (8/10). Main gaps: error handling (5/10), testing (0/10), security (4/10). This plan fixes the critical and high-priority items in priority order, scoped into discrete workers that can run in parallel where possible.

---

## Worker A — Safe JSON Parsing + Error Handling

### Branch
`day2.5/safe-json-parsing`

### Scope lock
Only modify:
- `apps/web/app/_lib/mappers.ts`
- `apps/web/app/_lib/mock-data.ts`
- `apps/web/app/_lib/format.ts`

### Tasks

1. **Wrap all `JSON.parse()` calls in try-catch** (`mappers.ts` lines ~52-53, ~76)
   - `mapTripItem()`: wrap `JSON.parse(item.offerData)` — return `null` on failure, `console.error` with item ID
   - `mapTripItem()`: wrap `JSON.parse(item.citationsData)` — return `undefined` on failure
   - `mapMedia()`: wrap `JSON.parse(m.attribution)` — return `null` on failure
   - Do NOT change function signatures or return types

2. **Add silent logging to `mock-data.ts`** (`fetchHotelOffers`, `fetchFlightOffers`)
   - These already have try-catch — add `console.error` inside the catch block instead of silent swallow

3. **Guard `formatDate()` and `formatDateTime()`** (`format.ts`)
   - Add `isNaN(new Date(iso).getTime())` check, return `'—'` for invalid dates

### Verification
```bash
pnpm build    # no type errors
pnpm dev      # all pages still render with seed data
# Manually corrupt an offerData value in dev.db → page should render without crashing
```

---

## Worker B — Email Ingest Hardening

### Branch
`day2.5/email-hardening`

### Scope lock
Only modify:
- `apps/web/app/api/email/inbound/route.ts`

### Tasks

1. **Replace `Date.now()` fallback with `crypto.randomUUID()`** (line ~81)
   ```ts
   const messageId = extractMessageId(rawHeaders)
     || `<${crypto.randomUUID()}@travel.aw>`;
   ```

2. **Use Prisma error codes instead of string matching** (line ~155)
   ```ts
   import { Prisma } from '@prisma/client';
   // In catch block:
   if (
     err instanceof Prisma.PrismaClientKnownRequestError
     && err.code === 'P2002'
   ) {
     return NextResponse.json(
       { error: 'Duplicate email (messageId already exists)' },
       { status: 409 }
     );
   }
   ```

3. **Add truncation marker** (line ~123)
   ```ts
   description: textBody
     ? textBody.length > 500
       ? textBody.slice(0, 497) + '...'
       : textBody
     : null,
   ```

4. **Wrap entire handler in try-catch** — return `500` with generic error message on unexpected failures (no stack traces leaked)

### Verification
```bash
pnpm build
# POST duplicate email → 409
# POST email without Message-ID header → creates with UUID-based ID
# POST email with body > 500 chars → description ends with "..."
```

---

## Worker C — API Route Error Handling + Expired Media Filter

### Branch
`day2.5/api-error-handling`

### Scope lock
Only modify:
- `apps/web/app/api/trips/route.ts`
- `apps/web/app/api/trips/[id]/route.ts`
- `apps/web/app/api/trips/[id]/items/route.ts`
- `apps/web/app/api/media/route.ts`

### Tasks

1. **Add try-catch to all GET handlers** — return `{ error: 'Internal server error' }` with status 500 on DB failures. Log the actual error with `console.error`.

2. **Filter expired media** (`api/media/route.ts`)
   ```ts
   const media = await prisma.cachedMedia.findMany({
     where: {
       OR: [
         { expiresAt: null },
         { expiresAt: { gt: new Date() } },
       ],
     },
     orderBy: { cachedAt: 'desc' },
   });
   ```

3. **Return 404 for missing trip on items endpoint** (`api/trips/[id]/items/route.ts`)
   - Before querying items, verify trip exists with `findUnique`
   - Return `{ error: 'Trip not found' }` with 404 if missing

### Verification
```bash
pnpm build
curl http://localhost:3000/api/trips             # 200
curl http://localhost:3000/api/trips/bad-id       # 404
curl http://localhost:3000/api/trips/bad-id/items # 404 (not empty array)
curl http://localhost:3000/api/media              # only non-expired entries
```

---

## Worker D — Seed Data Fixes

### Branch
`day2.5/seed-fixes`

### Scope lock
Only modify:
- `prisma/seed.mjs`

### Tasks

1. **Fix return flight timing** (line ~106)
   - `endDateTime` should be later than `startDateTime` in absolute UTC
   - Current: start=`2026-04-17T17:00:00+09:00` (08:00 UTC), end=`2026-04-17T11:30:00Z`
   - Fix: `endDateTime: new Date('2026-04-17T20:30:00Z')` (arrival in US after crossing date line)

2. **Fix duplicate confirmation number**
   - Tokyo outbound flight: keep `UA8834521`
   - Tokyo return flight (line ~108): change to `UA8834522`

3. **Add missing confirmation for Rome→Florence train** (line ~219)
   - Add `confirmationNumber: 'TI7723901'`

### Verification
```bash
pnpm db:push && pnpm db:seed
# Query: SELECT startDateTime, endDateTime FROM TripItem WHERE title LIKE '%Return%'
# Verify endDateTime > startDateTime in UTC
```

---

## Worker E — Frontend Polish

### Branch
`day2.5/frontend-polish`

### Scope lock
Only modify:
- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/trips/[id]/page.tsx`

### Tasks

1. **Update metadata** (`layout.tsx`)
   ```ts
   export const metadata: Metadata = {
     title: 'travel.aw',
     description: 'Plan and track your trips',
   };
   ```

2. **Redirect home page to /trips** (`page.tsx`)
   ```ts
   import { redirect } from 'next/navigation';
   export default function Home() {
     redirect('/trips');
   }
   ```

3. **Fix `toLocaleDateString` misuse** (`trips/[id]/page.tsx` `itemSubtitle()`)
   - Replace `.toLocaleDateString(...)` that passes `hour`/`minute` options with `.toLocaleString(...)`

### Verification
```bash
pnpm build
# Visit / → redirects to /trips
# Check browser tab title → "travel.aw"
# Check hotel check-in/check-out display on trip detail
```

---

## Worker F — Error Boundaries

### Branch
`day2.5/error-boundaries`

### Scope lock
Only create:
- `apps/web/app/error.tsx`
- `apps/web/app/trips/error.tsx`
- `apps/web/app/map/error.tsx`

### Tasks

1. **Create root error boundary** (`app/error.tsx`)
   - `'use client'` component
   - Display: "Something went wrong" + retry button
   - Log error to console

2. **Create trip-specific error boundary** (`trips/error.tsx`)
   - Same pattern, message: "Could not load trips"

3. **Create map error boundary** (`map/error.tsx`)
   - Same pattern, message: "Could not load map"

### Verification
```bash
pnpm build
# Temporarily break DB connection → pages show error boundary, not crash
```

---

## Post-Workers: Integration Testing (no branch — runs on main after merges)

### Priority: After all workers merge

1. **Add test script to root `package.json`**
   ```json
   "test": "pnpm --filter web test"
   ```

2. **Create minimal test setup** in `apps/web/`
   - Install vitest: `pnpm --filter web add -D vitest`
   - Add `vitest.config.ts`

3. **Write tests:**
   - `__tests__/mappers.test.ts` — mapTrip, mapTripItem, mapMedia with valid + malformed JSON
   - `__tests__/format.test.ts` — formatDate, formatDateTime, formatPrice with edge cases
   - `__tests__/api/trips.test.ts` — GET /api/trips returns array, GET /api/trips/bad-id returns 404

4. **Add CI script suggestion** for future pipeline:
   ```bash
   pnpm install --frozen-lockfile
   pnpm db:push
   pnpm db:seed
   pnpm build
   pnpm test
   ```

---

## Merge Order

```
1. Worker A (safe-json-parsing)     — no dependencies
2. Worker B (email-hardening)       — no dependencies
3. Worker C (api-error-handling)    — no dependencies
4. Worker D (seed-fixes)            — no dependencies
5. Worker E (frontend-polish)       — no dependencies
6. Worker F (error-boundaries)      — no dependencies
   ↓
   All merge to main
   ↓
7. Integration tests (on main)
```

Workers A–F are fully independent (no overlapping scope). Can run all 6 in parallel.

---

## Issue Tracker

| # | Severity | Issue | Worker | File(s) |
|---|----------|-------|--------|---------|
| 1 | Critical | Unsafe `JSON.parse()` in mappers — crashes endpoints | A | `mappers.ts` |
| 2 | Critical | Non-unique `Date.now()` message ID fallback | B | `email/inbound/route.ts` |
| 3 | Critical | String-based unique constraint detection | B | `email/inbound/route.ts` |
| 4 | High | No error handling in API routes | C | `api/trips/**`, `api/media` |
| 5 | High | Expired media served without filtering | C | `api/media/route.ts` |
| 6 | High | Missing 404 on items endpoint for bad tripId | C | `api/trips/[id]/items` |
| 7 | Medium | Seed: return flight endDateTime < startDateTime | D | `seed.mjs` |
| 8 | Medium | Seed: duplicate confirmation number | D | `seed.mjs` |
| 9 | Medium | Placeholder metadata in layout | E | `layout.tsx` |
| 10 | Medium | Home page still scaffold template | E | `page.tsx` |
| 11 | Medium | `toLocaleDateString()` with time options | E | `trips/[id]/page.tsx` |
| 12 | Medium | No error boundaries on any page | F | new `error.tsx` files |
| 13 | Low | No automated tests | Post | new test files |
| 14 | Low | Silent JSON parse failures in mock-data | A | `mock-data.ts` |
| 15 | Low | No pagination on list endpoints | Deferred | — |
| 16 | Low | No authentication | Deferred | — |

Items 15–16 are deferred to Day-3 (require architectural decisions).

---

## Codex Prompts

### Worker A
> You are working in travel.aw on branch day2.5/safe-json-parsing.
> Read TASKS/day_02/10_implementation_hardening.md, section "Worker A".
> SCOPE: Only modify `apps/web/app/_lib/mappers.ts`, `apps/web/app/_lib/mock-data.ts`, `apps/web/app/_lib/format.ts`.
> TASK: Wrap all JSON.parse() calls in mappers.ts with try-catch (return null/undefined on failure, console.error with item ID). Add console.error to silent catch blocks in mock-data.ts. Add invalid-date guard to formatDate/formatDateTime in format.ts.
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.

### Worker B
> You are working in travel.aw on branch day2.5/email-hardening.
> Read TASKS/day_02/10_implementation_hardening.md, section "Worker B".
> SCOPE: Only modify `apps/web/app/api/email/inbound/route.ts`.
> TASK: Replace Date.now() fallback with crypto.randomUUID(). Use PrismaClientKnownRequestError code P2002 instead of string matching. Add truncation marker for long descriptions. Wrap handler in top-level try-catch returning 500.
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.

### Worker C
> You are working in travel.aw on branch day2.5/api-error-handling.
> Read TASKS/day_02/10_implementation_hardening.md, section "Worker C".
> SCOPE: Only modify files under `apps/web/app/api/`.
> TASK: Add try-catch to all GET handlers returning 500 on failure. Filter expired media in GET /api/media. Add 404 response for missing trip in GET /api/trips/[id]/items.
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.

### Worker D
> You are working in travel.aw on branch day2.5/seed-fixes.
> Read TASKS/day_02/10_implementation_hardening.md, section "Worker D".
> SCOPE: Only modify `prisma/seed.mjs`.
> TASK: Fix return flight endDateTime to be after startDateTime in UTC. Change duplicate confirmation number UA8834521 on return flight to UA8834522. Add confirmation number TI7723901 to Rome-Florence train.
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.

### Worker E
> You are working in travel.aw on branch day2.5/frontend-polish.
> Read TASKS/day_02/10_implementation_hardening.md, section "Worker E".
> SCOPE: Only modify `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/trips/[id]/page.tsx`.
> TASK: Update metadata to travel.aw branding. Replace home page with redirect to /trips. Fix toLocaleDateString misuse in itemSubtitle() — change to toLocaleString().
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.

### Worker F
> You are working in travel.aw on branch day2.5/error-boundaries.
> Read TASKS/day_02/10_implementation_hardening.md, section "Worker F".
> SCOPE: Only create `apps/web/app/error.tsx`, `apps/web/app/trips/error.tsx`, `apps/web/app/map/error.tsx`.
> TASK: Create 'use client' error boundary components. Root: "Something went wrong" + retry. Trips: "Could not load trips" + retry. Map: "Could not load map" + retry. Log error to console in all.
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.
