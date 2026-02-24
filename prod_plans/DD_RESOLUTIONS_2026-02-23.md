# TRAVEL.aw — Decision Resolutions
**Session:** 2026-02-23  
**Resolved by:** Aug (product owner)  
**Prereq:** Housekeeping complete (commit `8407c5d`)

---

## DD-01: Toolchain → RESOLVED: Full TypeScript

**Decision:** TypeScript monolang for all phases including graph queries at WP-3+.

**Rationale:**
- Repo is already pnpm monorepo with Next.js 16 + TypeScript
- Validator stubbed as `validate_ecosystem.ts`
- Graph queries can use TS-native approaches (custom traversal, or libs like `graphology` — 3.5K stars, TS-first, supports directed multigraphs)
- Zero context-switching cost; single test runner; shared types between validator, web app, and future agent runtime
- Python (networkx/pandas) offers richer graph algorithms but our MVP queries are simple traversals — not PageRank or community detection

**Trade-off accepted:** If WP-3+ queries require advanced graph algorithms not available in TS, we revisit. But the bar is "can't be done in TS" not "easier in Python."

**Implications:**
- WP-1 validator: TypeScript with `ajv` for JSON Schema validation
- WP-3 graph queries: TypeScript (graphology or custom)
- Track B web app: already TS (no change)
- Track C agent runtime: NanoClaw is TS-compatible (Claude Agent SDK)
- StopCrabs: remains Python (it's a separate repo, not in monorepo). No conflict.

---

## DD-04: Journey Stage Labels → RESOLVED: Lock J0–J8 As-Is

**Decision:** Lock the 9 journey stages exactly as defined in Ecosystem Spec v0.2 §2.

| Code | Label |
|------|-------|
| J0 | Inspiration |
| J1 | Research |
| J2 | Planning |
| J3 | Booking |
| J4 | Pre-Trip |
| J5 | Transit |
| J6 | In-Destination |
| J7 | Post-Trip |
| J8 | Reflection & Re-Inspiration |

**Action:** Update `journey_stages.json` (A4) status from `"candidate"` to `"locked"`.

---

## DD-05: Starter C-Codes → RESOLVED: Lock 24 Codes

**Decision:** Lock all 24 capability codes (22 original + C-AI-AGENT + C-API-PLATFORM added in housekeeping).

**Action:** Update `capabilities_registry.json` (A5) — change all entries from `"candidate"` to `"locked"`.

**Note:** C-ACTIVITY-SEARCH stays despite no research CSV data — it's a valid capability with known providers (GetYourGuide, Viator, Airbnb Experiences).

---

## DD-07: SUPER_APP Provider Type → RESOLVED: Keep

**Decision:** Keep `SUPER_APP` as a valid provider type.

**Rationale:**
- Google, Grab, WeChat each genuinely span 5+ journey stages
- Forcing these into a single narrower type (OTA? MAPPING_SERVICE?) misrepresents their ecosystem role
- The "junk drawer" risk is real but manageable: add a guardrail that SUPER_APP nodes must declare ≥4 journey stages and ≥3 capabilities, otherwise use a more specific type

**Action:** Update `provider_types.json` (A6) status from `"candidate"` to `"locked"`. Add SUPER_APP guardrail note to the registry entry or to the validator spec.

---

## DD-08: Agent Architecture → RESOLVED: Accept, Start M0 Parallel

**Decision:** Accept the three-layer architecture. Begin M0 foundation work in parallel with WP-1.

```
Layer 1: travel.aw           → Web front-door (Next.js, existing repo)
Layer 2: travel-aw/skills    → Private skills registry, StopCrabs-vetted
Layer 3: NanoClaw fork        → Container-isolated agent runtime
```

**Parallel execution model:**

| Stream | Work | Dependencies |
|--------|------|-------------|
| WP-1 (schemas/validation) | JSON schemas, validator, registry locking | DD-01 ✅ DD-04 ✅ DD-05 ✅ |
| M0 (agent foundation) | Fork NanoClaw, create skills repo, StopCrabs CI | Independent of WP-1 |

**M0 scope (from kickoff, confirmed):**
- Fork NanoClaw → `travel-aw/nanoclaw`
- Create private `travel-aw/skills` repo
- Add `stopcrabs-gate.yml` CI workflow to skills repo
- Add travel-specific rules: TRAVEL-001 (PII in payload), TRAVEL-002 (unbounded egress), TRAVEL-003 (booking without confirmation)
- Reattach Supabase to StopCrabs (investigate dependency first)

**Deferred to post-M0:** M1 first skills (flight-search, hotel-search), Track B security hardening (B1–B6).

---

## Summary: All Open DDs Resolved

| ID | Decision | Resolution | Status |
|----|----------|-----------|--------|
| DD-01 | Toolchain | Full TypeScript | **Resolved** |
| DD-04 | Journey stages | Lock J0–J8 as-is | **Resolved** |
| DD-05 | C-codes | Lock 24 codes | **Resolved** |
| DD-07 | SUPER_APP | Keep, add guardrail | **Resolved** |
| DD-08 | Agent architecture | Accept three-layer, start M0 parallel | **Resolved** |

**Previously resolved/deferred (no change):**

| ID | Status |
|----|--------|
| DD-02 | Resolved (bootstrap scope) |
| DD-03 | Resolved (spec completion order) |
| DD-06 | Deferred (REPLACES/MIGRATES_TO edge types — post-MVP) |
