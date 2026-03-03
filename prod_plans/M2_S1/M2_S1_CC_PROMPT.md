# M2-S1: Provider Integration + Deploy

**Paste this entire block into Claude Code as your prompt.**

**Gate:** Do NOT run `pnpm build` (or any production build) until the user explicitly acknowledges.

---

## Mission

Two epics in one session. Epic 1: Build the provider adapter layer (Duffel live, Kiwi stub) with normalized offer types. Epic 2: Deploy web app to Vercel and skills service to Railway.

## Pre-Flight

Before writing any code:

1. Read `CLAUDE.md` and `.agent_state.md` in App repo for current state and gotchas
1b. Note: A Seattle feature module was recently added (`app/_lib/seattle/`, `app/api/seattle/`, `app/(authenticated)/seattle/`). This is NOT in your write scope. Do not modify these files.
1c. Note: DD-13 (NanoClaw) was reopened — NanoClaw is now an active repo for M2-C+ agent runtime, not abandoned. DD-27 opened for agent messaging transport. This does NOT affect M2-S1 scope. Do not touch NanoClaw-related files.
2. Read `packages/skill-runner/src/types.ts` — understand current SkillInput/SkillOutput contract
3. Read `packages/contracts/src/index.ts` — understand current type exports
4. Read `apps/web/app/api/skills/invoke/route.ts` — understand current invoke flow
5. Read `skills/flight-search/src/main.ts` and `skills/flight-search/skill.yaml` in Skills repo
6. Read `skills/hotel-search/src/main.ts` and `skills/hotel-search/skill.yaml` in Skills repo
7. Check `data/seattle/` and any existing test fixture patterns in the repo — adapter test fixtures (`packages/adapters/__tests__/fixtures/`) should follow the same conventions (JSONL vs JSON, directory structure, naming). If a convention exists, adopt it. If not, document the one you establish.
8. Run `pnpm test` in App repo — confirm 83 SkillRunner tests pass as baseline
9. Confirm `DUFFEL_API_TOKEN` is set in environment

## Authorities

- **SPEC:** `M2_S1_SPEC.md` — interfaces, file plan, invariants, acceptance criteria
- **CONTRACT:** `M2_S1_WORK_CONTRACT.json` — write scope, gates, failure policy
- **Precedence:** Schema + Registries > Spec > Validator > Session prompt > Everything else

## Write Scope

**WRITE-ONLY-HERE.** Only touch files listed in WORK_CONTRACT.json. If you need to edit a file not on the list, STOP and report `BLOCKED: file not in write scope`.

### NO-WRITE (enforced)
- `AUTH/*`
- `data/ecosystem/*`
- `packages/skill-runner/*`
- `packages/contracts/registries/*`
- `apps/web/app/(authenticated)/search/*`

## Epic 1: Provider Adapter Layer

### Step 1 — Normalized Types (packages/contracts/src/offers.ts)

Create `NormalizedFlightOffer`, `NormalizedSegment`, `NormalizedHotelOffer` exactly as defined in SPEC §1.1. Key invariants:
- `raw?: never` on all offer types (prevents provider data leaking downstream)
- All prices as `{ amount: string; currency: string }` (no floats)
- All timestamps ISO 8601 UTC strings
- Re-export from `packages/contracts/src/index.ts`

### Step 2 — Adapter Interfaces (packages/adapters/)

Create the `packages/adapters/` package:
- `src/types.ts` — `FlightSearchAdapter`, `HotelSearchAdapter`, `AdapterResult<T>`, search param types per SPEC §1.2
- `src/registry.ts` — `ProviderConfig` type + `createFlightSearchAdapters()` factory
- `src/index.ts` — public exports
- `package.json` with `@travel/adapters` name, dependency on `@travel/contracts`
- `tsconfig.json` extending root config

### Step 3 — Duffel Adapters

Install Duffel SDK: `pnpm add @duffel/api` in `packages/adapters/`

Create:
- `src/duffel/normalize.ts` — mapper functions: `normalizeDuffelFlight(duffelOffer) → NormalizedFlightOffer` and `normalizeDuffelHotel(duffelOffer) → NormalizedHotelOffer`
- `src/duffel/flight-adapter.ts` — implements `FlightSearchAdapter`. Creates Duffel client, calls offer request, normalizes results. 10s timeout. Catches all errors into `AdapterResult.error`.
- `src/duffel/hotel-adapter.ts` — same pattern for hotels.

**Error handling:** Never throw. Always return `AdapterResult` with `error` field. Map Duffel error codes to: `PROVIDER_ERROR` (4xx), `PROVIDER_UNAVAILABLE` (5xx), `PROVIDER_TIMEOUT` (timeout).

### Step 4 — Kiwi Stub

Create `src/kiwi/flight-adapter-stub.ts`:
```typescript
export class KiwiFlightSearchAdapter implements FlightSearchAdapter {
  readonly provider = 'kiwi';
  async search(_params: FlightSearchParams): Promise<AdapterResult<NormalizedFlightOffer>> {
    return {
      provider: 'kiwi',
      available: false,
      offers: [],
      error: { code: 'PROVIDER_UNAVAILABLE', message: 'Kiwi requires 50K MAU. Stub adapter — no network calls made.' },
      meta: { resultCount: 0, latencyMs: 0 }
    };
  }
}
```
This makes ZERO network calls. It compiles. It satisfies the interface. That's it.

### Step 5 — Tests

Create fixture files in `__tests__/fixtures/`:
- `duffel-flight-response.json` — real Duffel API response shape (from their docs)
- `duffel-flight-multi-segment.json` — connection flight
- `duffel-flight-error.json` — error response

Create `__tests__/duffel-normalize.test.ts`:
- Single segment normalization
- Multi-segment normalization
- Missing optional fields (no aircraft, no booking URL)
- Error response mapping
- Verify `raw` field is never present (invariant)
- Verify prices are strings (invariant)
- Verify timestamps are ISO 8601 (invariant)

Create `__tests__/kiwi-stub.test.ts`:
- Returns `available: false`
- Returns zero offers
- Returns error with PROVIDER_UNAVAILABLE code
- Makes no network calls (mock fetch, verify not called)

Create one integration test in `__tests__/duffel-integration.test.ts`:
- Wrapped in `describe.skip` by default
- Enabled with `DUFFEL_LIVE=true` env var
- Searches SEA → NRT on a date 30 days from now
- Verifies results are `NormalizedFlightOffer[]`
- This is the "it actually works" proof

Run: `pnpm test` — all new tests + all 83 existing tests must pass.

### Step 6 — Skill Rewrite

In Skills repo, update both skills:

**flight-search/src/main.ts:**
- Import `DuffelFlightSearchAdapter` from `@travel/adapters`
- Replace Amadeus API calls with adapter
- Return `NormalizedFlightOffer[]` in SkillOutput

**flight-search/skill.yaml:**
- Update egress: remove Amadeus domains, add `api.duffel.com`
- Keep capabilities and journey stages unchanged

**hotel-search/src/main.ts and skill.yaml:**
- Same pattern as flight-search

Run Skills repo CI locally: StopCrabs + travel-rules + manifest validation.

## Epic 2: Deploy Infrastructure

### Step 7 — Health Check

Create `apps/web/app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### Step 8 — Vercel Config

Create `apps/web/vercel.json` with appropriate config for Next.js 16 monorepo. The web app is in `apps/web/`. Set build command, output directory, and framework preset.

### Step 9 — Railway Dockerfile

Create `Dockerfile.skills` at repo root:
- Node 20 base
- Install pnpm
- Copy `packages/` and `skills/` (from skills repo checkout via `SKILLS_DIR`)
- Expose port from `PORT` env var
- Health check endpoint
- Start skills service

**NOTE:** The exact architecture of "skills service on Railway" depends on how SkillRunner exposes an HTTP interface. Check `packages/skill-runner/src/index.ts` during pre-flight. If SkillRunner is library-only (no HTTP server), you'll need a thin Express/Fastify wrapper. Document the approach in DEPLOY.md.

### Step 10 — Invoke Route Update

Modify `apps/web/app/api/skills/invoke/route.ts`:
- If `SKILLS_SERVICE_URL` is set: proxy the request to Railway
- If not set: fall back to local SkillRunner (existing behavior)
- This is the bridge between Vercel (web) and Railway (skills)

### Step 11 — Deploy Docs + Smoke Test

Create `docs/DEPLOY.md`:
- Vercel setup steps
- Railway setup steps
- Required env vars (table with var, purpose, required/optional)
- How to run smoke test
- Expected cold start latency
- Rollback procedure

Create `scripts/smoke-test.sh`:
```bash
#!/bin/bash
set -euo pipefail
WEB_URL="${1:?Usage: ./scripts/smoke-test.sh <web-url> [skills-url]}"
SKILLS_URL="${2:-}"

echo "=== Smoke Test ==="
# Health check
curl -sf "$WEB_URL/api/health" | jq .
# Flight search
curl -sf -X POST "$WEB_URL/api/skills/invoke" \
  -H "Content-Type: application/json" \
  -d '{"skill":"flight-search","input":{"origin":"SEA","destination":"NRT","departureDate":"2026-04-01","passengers":1,"cabinClass":"economy"}}' \
  | jq '.offers | length'
echo "=== Done ==="
```

Update `.env.example` with all new vars.

### Step 12 — Deploy

1. `npx vercel --prod` from `apps/web/`
2. `railway up` from App repo root (using Dockerfile.skills)
3. Set env vars in both platforms
4. Run `./scripts/smoke-test.sh <vercel-url> <railway-url>`

## Session Gates (run before reporting done)

```bash
# Gate 1: Write scope compliance
git diff --stat  # Must show ONLY files from write scope

# Gate 2: Build
pnpm build

# Gate 3: Tests (App repo)
pnpm test
# Verify: 83+ tests pass (83 existing + new adapter tests)

# Gate 4: Skills repo CI
cd ~/Documents/GitHub/travel-aw-skills
# Run local CI equivalent

# Gate 5: No 'any' types in adapters
grep -r ': any' packages/adapters/src/ && echo "FAIL: any types found" || echo "PASS: no any types"

# Gate 6: Deploy health (if deployed)
curl -sf <VERCEL_URL>/api/health
curl -sf <RAILWAY_URL>/health
```

## Stop Conditions

- If `DUFFEL_API_TOKEN` is not available: complete Epic 1 with fixtures only, skip integration test, document blocker
- If Railway CLI is not installed or auth fails: complete Dockerfile + docs, skip actual deploy, document blocker
- If Vercel CLI is not installed or auth fails: same approach
- If SkillRunner has no HTTP interface: document the gap, create the thin wrapper spec, but do NOT build the wrapper without confirming approach
- If any file outside write scope needs modification: STOP and report `BLOCKED: file not in write scope — [filepath] — [reason]`

## Acceptance Criteria

### Epic 1
- [ ] `packages/contracts/src/offers.ts` exports normalized types with `raw?: never`
- [ ] `packages/adapters/` package exists with types, registry, Duffel adapters, Kiwi stub
- [ ] Duffel normalization tests pass (single segment, multi-segment, missing fields, errors)
- [ ] Kiwi stub test passes (available=false, zero network calls)
- [ ] Integration test exists (skipped by default, runnable with DUFFEL_LIVE=true)
- [ ] Skills updated to use adapter layer
- [ ] Skills repo CI passes
- [ ] All 83 existing SkillRunner tests pass
- [ ] No `any` types in adapter code

### Epic 2
- [ ] Vercel config created
- [ ] Railway Dockerfile created
- [ ] Health check endpoint works
- [ ] Invoke route supports SKILLS_SERVICE_URL proxy
- [ ] DEPLOY.md documents full setup
- [ ] smoke-test.sh works against deployed URLs
- [ ] .env.example updated

## Session Close Protocol

1. Run all gates (§ Session Gates)
2. Produce `CLOSEOUT.md` with:
   - Pass/fail per acceptance criterion
   - `git diff --stat` output
   - Test count summary
   - Deploy URLs (or BLOCKED reasons)
   - Any issues encountered + resolutions
   - Any files that need attention in next session
3. Commit closeout to `prod_plans/session_records/M2_S1_CLOSEOUT.md`
