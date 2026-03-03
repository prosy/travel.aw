# SPEC: M2-S1 — Provider Integration + Deploy
**Version:** 1.0  
**Date:** 2026-02-27  
**PRD:** M2_S1_PRD.md  
**Status:** SDD-Validated — implements PRD §2-§5

---

## 1. Interfaces

### 1.1 Normalized Offer Types

```typescript
// packages/contracts/src/offers.ts

interface NormalizedFlightOffer {
  id: string;                          // Internal offer ID (UUID)
  provider: 'duffel' | 'kiwi';
  providerOfferId: string;             // Provider's native offer ID
  expiresAt: string;                   // ISO 8601 UTC
  totalPrice: { amount: string; currency: string };  // String to avoid float math
  segments: NormalizedSegment[];
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  bookingUrl?: string;                 // Deep link if available
  raw?: never;                         // INVARIANT: no raw provider data leaks downstream
}

interface NormalizedSegment {
  origin: string;                      // IATA code
  destination: string;                 // IATA code
  departureAt: string;                 // ISO 8601 UTC
  arrivalAt: string;                   // ISO 8601 UTC
  duration: number;                    // Minutes
  carrier: { code: string; name: string };
  flightNumber: string;
  aircraft?: string;
}

interface NormalizedHotelOffer {
  id: string;
  provider: 'duffel';                  // Only Duffel for hotels at launch
  providerOfferId: string;
  name: string;
  address: string;
  rating?: number;                     // 1-5 stars
  pricePerNight: { amount: string; currency: string };
  totalPrice: { amount: string; currency: string };
  checkIn: string;                     // ISO 8601 date
  checkOut: string;                    // ISO 8601 date
  roomType?: string;
  bookingUrl?: string;
  raw?: never;
}
```

### 1.2 Adapter Interfaces

```typescript
// packages/adapters/src/types.ts

interface FlightSearchParams {
  origin: string;          // IATA
  destination: string;     // IATA
  departureDate: string;   // YYYY-MM-DD
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  returnDate?: string;     // YYYY-MM-DD, omit for one-way
}

interface HotelSearchParams {
  destination: string;     // City code or name
  checkIn: string;         // YYYY-MM-DD
  checkOut: string;        // YYYY-MM-DD
  guests: number;
  rooms: number;
}

interface AdapterResult<T> {
  provider: string;
  available: boolean;
  offers: T[];
  error?: { code: string; message: string };
  meta?: { searchId?: string; resultCount: number; latencyMs: number };
}

interface FlightSearchAdapter {
  readonly provider: string;
  search(params: FlightSearchParams): Promise<AdapterResult<NormalizedFlightOffer>>;
}

interface HotelSearchAdapter {
  readonly provider: string;
  search(params: HotelSearchParams): Promise<AdapterResult<NormalizedHotelOffer>>;
}
```

### 1.3 Provider Registry

```typescript
// packages/adapters/src/registry.ts

interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  capabilities: ('flight-search' | 'hotel-search' | 'booking')[];
  requiresApiKey: boolean;
  envVars: string[];       // e.g., ['DUFFEL_API_TOKEN']
}

// Instantiation: createFlightSearchAdapters(config) → FlightSearchAdapter[]
// Only enabled adapters with valid env vars are returned.
// Kiwi: enabled=false until MAU threshold met.
```

## 2. File Plan (Write Scope)

### Epic 1 — Provider Adapter Layer

**New files (App repo):**
```
packages/contracts/src/offers.ts                    # NormalizedFlightOffer, NormalizedHotelOffer
packages/adapters/src/types.ts                      # Adapter interfaces, AdapterResult
packages/adapters/src/registry.ts                   # Provider config + factory
packages/adapters/src/duffel/flight-adapter.ts      # Duffel flight search
packages/adapters/src/duffel/hotel-adapter.ts       # Duffel hotel search
packages/adapters/src/duffel/normalize.ts           # Duffel → Normalized mappers
packages/adapters/src/kiwi/flight-adapter-stub.ts   # Kiwi stub
packages/adapters/src/index.ts                      # Public exports
packages/adapters/package.json                      # Package config
packages/adapters/tsconfig.json                     # TS config
packages/adapters/__tests__/duffel-normalize.test.ts  # Normalization unit tests
packages/adapters/__tests__/kiwi-stub.test.ts       # Stub behavior tests
packages/adapters/__tests__/fixtures/               # Duffel API response fixtures
```

**Modified files (App repo):**
```
packages/contracts/src/index.ts                     # Re-export offer types
```

**Modified files (Skills repo):**
```
skills/flight-search/src/main.ts                    # Use adapter instead of direct Amadeus
skills/flight-search/skill.yaml                     # Update egress domains
skills/hotel-search/src/main.ts                     # Use adapter instead of direct Amadeus
skills/hotel-search/skill.yaml                      # Update egress domains
```

### Epic 2 — Deploy Infrastructure

**New files (App repo):**
```
apps/web/vercel.json                                # Vercel project config
Dockerfile.skills                                   # Railway skills service
apps/web/app/api/health/route.ts                    # Health check endpoint
scripts/smoke-test.sh                               # Post-deploy smoke test
docs/DEPLOY.md                                      # Deploy runbook
.env.example                                        # Updated env var reference
```

**Modified files (App repo):**
```
apps/web/app/api/skills/invoke/route.ts             # Add SKILLS_SERVICE_URL fallback
```

### Exclusion list (NO-WRITE)
Everything not listed above. Specifically:
- `AUTH/*` — no authority changes
- `data/ecosystem/*` — no graph changes
- `packages/skill-runner/*` — no SkillRunner changes (it works)
- `apps/web/app/(authenticated)/search/*` — no UI changes
- `packages/contracts/registries/*` — no registry changes

## 3. Invariants

1. **Normalization firewall:** No code outside `packages/adapters/src/duffel/` and `packages/adapters/src/kiwi/` ever sees a provider-specific type. `raw?: never` enforces this at the type level.
2. **Price as string:** All monetary values are strings to prevent floating-point arithmetic. Conversion to display format happens in UI only.
3. **ISO 8601 UTC everywhere:** All timestamps normalized to UTC ISO 8601. No Unix timestamps leak through.
4. **Adapter failure isolation:** If Duffel returns an error, the adapter returns `AdapterResult` with `available: true, offers: [], error: { ... }`. It never throws unstructured exceptions.
5. **Kiwi stub contract:** `KiwiFlightSearchAdapter.search()` always returns `{ provider: 'kiwi', available: false, offers: [], error: { code: 'PROVIDER_UNAVAILABLE', message: 'MAU threshold not met' } }`. It makes zero network calls.
6. **SkillRunner tests stay green:** All 83 existing tests pass after changes. No regressions.
7. **TRAVEL-003 still enforced:** Skills repo CI passes. No booking without confirmation.
8. **Deploy health checks:** `GET /api/health` returns `200 { status: 'ok' }` on both Vercel and Railway.
9. **Fixture convention alignment:** Test fixtures in `packages/adapters/__tests__/fixtures/` must follow the same file format and naming conventions as existing data files (e.g., `data/seattle/`). If no prior convention exists, establish one and document in a `fixtures/README.md`.

## 4. Failure Modes

| Condition | Behavior | Error Shape |
|-----------|----------|-------------|
| `DUFFEL_API_TOKEN` not set | Adapter factory skips Duffel | `503 { error: 'NO_PROVIDERS_CONFIGURED' }` |
| Duffel API returns 4xx | Adapter catches, returns structured error | `AdapterResult.error = { code: 'PROVIDER_ERROR', message: '...' }` |
| Duffel API returns 5xx | Same as 4xx | Same shape, `code: 'PROVIDER_UNAVAILABLE'` |
| Duffel API timeout (>10s) | Adapter aborts with timeout | `code: 'PROVIDER_TIMEOUT'` |
| Kiwi adapter called | Returns stub response | `{ available: false, ... }` |
| `SKILLS_SERVICE_URL` not set | Invoke route falls back to local SkillRunner | Existing behavior preserved |
| Railway deploy fails | No remote skills | Local fallback; document in DEPLOY.md |
| Vercel build fails | No web app deploy | Fix and redeploy; Railway independent |

## 5. Acceptance Criteria

### Epic 1 — Provider Adapter Layer

- [ ] `packages/contracts/src/offers.ts` exports `NormalizedFlightOffer` and `NormalizedHotelOffer`
- [ ] `packages/adapters/src/types.ts` exports `FlightSearchAdapter`, `HotelSearchAdapter`, `AdapterResult`
- [ ] `packages/adapters/src/duffel/flight-adapter.ts` implements `FlightSearchAdapter` and returns `NormalizedFlightOffer[]`
- [ ] `packages/adapters/src/duffel/normalize.ts` maps Duffel response → normalized types (tested with fixtures)
- [ ] `packages/adapters/src/kiwi/flight-adapter-stub.ts` implements `FlightSearchAdapter`, returns `available: false`, makes zero network calls
- [ ] `pnpm test` in `packages/adapters/` passes — normalization tests + stub tests
- [ ] Fixture-based tests cover: single segment, multi-segment, missing optional fields, error responses
- [ ] One integration test (marked `describe.skip` by default, runnable with `DUFFEL_LIVE=true`) hits Duffel sandbox
- [ ] `skills/flight-search/` updated to use Duffel adapter, `skill.yaml` egress updated
- [ ] `skills/hotel-search/` updated to use Duffel adapter, `skill.yaml` egress updated
- [ ] Skills repo CI passes (StopCrabs + travel-rules + manifest validation)
- [ ] All 83 existing SkillRunner tests pass
- [ ] No `any` types in adapter code (strict TypeScript)
- [ ] `raw?: never` on all normalized types

### Epic 2 — Deploy Infrastructure

- [ ] `vercel.json` configures `apps/web/` as root
- [ ] `Dockerfile.skills` builds and runs skills service
- [ ] `GET /api/health` returns `200` on Vercel
- [ ] Skills service health endpoint returns `200` on Railway
- [ ] `apps/web/app/api/skills/invoke/route.ts` routes to `SKILLS_SERVICE_URL` when set, local fallback when not
- [ ] `docs/DEPLOY.md` documents: Vercel setup, Railway setup, env vars, smoke test
- [ ] `.env.example` updated with all new env vars
- [ ] `scripts/smoke-test.sh` runs against deployed URLs, verifies search returns results
- [ ] No secrets in committed files

### Session-Level Gates

- [ ] `git diff --stat` shows only files listed in §2 File Plan
- [ ] `pnpm build` succeeds across all packages
- [ ] `pnpm test` succeeds across all packages (existing + new)
- [ ] Skills repo CI green

## 6. Preconditions

- App repo on `main`, clean git state
- Skills repo on `main`, clean git state
- `DUFFEL_API_TOKEN` available (Duffel test environment)
- Node.js 20+, pnpm installed
- Vercel CLI installed (`npx vercel`)
- Railway CLI installed (`railway`)

## 7. Test Strategy

| Layer | What | How | Fixture vs Live |
|-------|------|-----|----------------|
| Normalization | Duffel response → NormalizedFlightOffer | Unit test with JSON fixtures | Fixture |
| Normalization | Edge cases (missing fields, multi-segment) | Unit test with crafted fixtures | Fixture |
| Stub | Kiwi returns unavailable | Unit test | N/A (no API) |
| Adapter | Duffel search returns results | Integration test (`describe.skip`) | Live (Duffel sandbox) |
| Skill | flight-search returns normalized offers | SkillRunner test | Fixture (mocked adapter) |
| Deploy | Health check responds | smoke-test.sh | Live |
| Deploy | Search returns results | smoke-test.sh | Live |
| Regression | Existing 83 SkillRunner tests | `pnpm test` | Existing fixtures |
