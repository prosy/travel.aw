# TRAVEL.aw — M1 PRD: Skills Pipeline Integration
**Version:** 0.1 (draft)  
**Date:** 2026-02-24  
**Status:** Draft — requires NanoClaw recon before finalizing  
**Predecessor:** TRAVEL_aw_COMBINED_PRD_2026-02-23.md (Track A ✅, Track B ✅, M0 ✅)

---

## 1) Product Overview

### 1.1 What M1 Builds

M1 wires the three-layer architecture end-to-end: a vetted skill flows from the registry, through security gates, into a sandboxed container, executes against a real API, and returns structured results to the traveler.

```
travel.aw (web app)  ←→  travel-aw-skills (registry)  ←→  nanoclaw (container runtime)
     │                          │                              │
  User request            CI gates (3)                   Sandboxed execution
  Result display       StopCrabs + Travel Rules          Declared egress only
                       + Manifest Validation              Resource limits
```

### 1.2 What Exists (M0 Deliverables)

| Component | Repo | State | Gap to M1 |
|---|---|---|---|
| Web app | augmented-worlds/travel.aw | Track B hardened, Auth0, Prisma | No skill invocation path |
| Skills registry | prosy/travel-aw-skills | CI pipeline proven (PR #1) | No real skills, only test fixtures |
| Container runtime | prosy/nanoclaw | Fork builds, 375/378 tests pass | Never executed a travel skill |
| StopCrabs | prosy/StopCrabs | 37 rules, editable install workaround | Working — no M1 changes needed |

### 1.3 What M1 Does NOT Build
- Agent-to-agent orchestration (multi-skill chains)
- Skill marketplace or discovery UI
- User-facing skill configuration/preferences
- Real-time streaming results
- Payment/billing for API usage

---

## 2) Goals and Non-Goals

### 2.1 Goals
- **G1:** Execute a skill inside NanoClaw with declared egress, resource limits, and timeout enforcement.
- **G2:** Deliver two production-quality read-only skills (flight search, hotel search) through the full pipeline: PR → CI gates → human review → container execution → structured results.
- **G3:** Define the skill ↔ web app communication contract (how the app invokes a skill, how results come back).
- **G4:** Validate that the security model works end-to-end: a skill with undeclared egress or PII leakage is blocked by CI before it ever reaches NanoClaw.

### 2.2 Non-Goals
- Write/mutation skills (bookings, payments) — read-only only in M1.
- Multi-skill orchestration or chaining.
- LLM-powered skill logic (skills are deterministic API wrappers in M1).
- Public skill submission by third parties.
- Production deployment of NanoClaw (local execution is sufficient for M1).

---

## 3) Users and Use Cases

### 3.1 Personas
- **Traveler:** searches flights or hotels from within the web app, gets structured results.
- **Skill author (internal):** writes a skill, submits PR, iterates against CI gates, gets it merged.
- **Security reviewer:** reviews skill PR after CI passes, verifies egress declarations match source code.

### 3.2 Core Use Cases
1. "Search flights from SEA to NRT on March 15" → web app invokes flight-search skill → NanoClaw executes → results displayed.
2. "Find hotels in Tokyo for March 15-20" → web app invokes hotel-search skill → NanoClaw executes → results displayed.
3. Skill author submits PR with undeclared egress → CI blocks before human review.
4. Skill author submits PR with hardcoded PII → CI blocks with TRAVEL-001 finding.

---

## 4) Architecture

### 4.1 Three-Layer Security Model

```
Layer 1: CI Gates (pre-merge)
  ├── StopCrabs scan (37 DSAL rules, medium+ blocks)
  ├── Travel rules (TRAVEL-001 PII, TRAVEL-002 egress, TRAVEL-003 booking confirmation)
  └── Manifest validation (skill.yaml completeness, no wildcard egress)

Layer 2: Human Review (pre-merge)
  └── Security reviewer verifies egress, capabilities, risk level

Layer 3: Container Sandbox (runtime)
  └── NanoClaw: declared egress only, resource limits, timeout, no host access
```

### 4.2 Skill Execution Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Web App     │────►│  Skill Invoker   │────►│  NanoClaw   │
│  (Next.js)   │     │  (API route)     │     │  Container  │
│              │◄────│                  │◄────│             │
│  Display     │     │  Result Parser   │     │  Skill Code │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                    reads skill.yaml
                    for egress/timeout config
```

### 4.3 Communication Contract

**⚠️ DD-12 (Open):** How does the web app invoke a skill and receive results? Options:

| Option | Mechanism | Pros | Cons |
|---|---|---|---|
| A | Direct: web app spawns NanoClaw process | Simple, no infra | Tight coupling, blocking |
| B | Queue: web app enqueues job, NanoClaw polls | Async, scalable | Needs queue infra (overkill for M1) |
| C | HTTP: NanoClaw exposes local API, web app calls it | Clean interface, testable | Requires NanoClaw HTTP wrapper |
| D | CLI: web app shells out to NanoClaw CLI with skill path + input JSON | Simplest, no new code | Subprocess management, stdout parsing |

**Recommendation:** Option D for M1 (simplest path to prove the pipeline). Upgrade to C for M2.

**⚠️ DD-13 (Open):** What is NanoClaw's actual execution model? This requires a recon task (see §8).

### 4.4 Skill Input/Output Schema

**Input (from web app to skill):**
```jsonc
{
  "action": "search_flights",
  "params": {
    "origin": "SEA",
    "destination": "NRT",
    "date": "2026-03-15",
    "passengers": 1,
    "cabin": "economy"
  },
  "config": {
    "timeout_ms": 15000,
    "max_results": 20
  }
}
```

**Output (from skill to web app):**
```jsonc
{
  "status": "success",
  "skill": "flight-search",
  "version": "0.1.0",
  "results": [
    {
      "provider": "Skyscanner",
      "airline": "ANA",
      "price": { "amount": 847.00, "currency": "USD" },
      "departure": "2026-03-15T11:30:00-08:00",
      "arrival": "2026-03-16T16:45:00+09:00",
      "stops": 0,
      "duration_minutes": 615,
      "booking_url": "https://www.skyscanner.com/..."
    }
  ],
  "metadata": {
    "query_time_ms": 2340,
    "source_api": "partners.api.skyscanner.net",
    "cached": false
  }
}
```

**Error output:**
```jsonc
{
  "status": "error",
  "skill": "flight-search",
  "version": "0.1.0",
  "error": {
    "code": "API_TIMEOUT",
    "message": "Skyscanner API did not respond within 15000ms"
  }
}
```

---

## 5) Functional Requirements

### M1-1: NanoClaw Skill Execution

**Requirement:** A skill from travel-aw-skills can be loaded and executed inside a NanoClaw container with enforced constraints.

**Acceptance criteria:**
- NanoClaw reads `skill.yaml` and enforces declared egress (blocks undeclared domains).
- NanoClaw enforces resource limits (memory, CPU time, timeout).
- Skill receives input as JSON (stdin or file), writes output as JSON (stdout or file).
- Skill exit code 0 = success, non-zero = error.
- Container has no access to host filesystem, network (beyond declared egress), or other containers.

### M1-2: Flight Search Skill

**Requirement:** A read-only skill that searches flights via a public API and returns structured results.

**Acceptance criteria:**
- Skill passes all 3 CI gates (StopCrabs, travel rules, manifest validation).
- `skill.yaml` declares: `C-FLIGHT-SEARCH`, `J1`/`J3`, single egress domain, `risk_level: low`.
- Skill accepts origin/destination/date, returns structured flight results matching output schema.
- No PII in source code. No hardcoded API keys (uses env var).
- Executes successfully inside NanoClaw container.

**⚠️ DD-14 (Open):** Which flight search API? Options: Skyscanner Partners API (free tier, requires approval), Amadeus Self-Service (free sandbox, 500 calls/month), Google Flights (no public API — would need SerpAPI wrapper). **Recommend: Amadeus sandbox** (free, immediate access, well-documented).

### M1-3: Hotel Search Skill

**Requirement:** A read-only skill that searches hotels via a public API and returns structured results.

**Acceptance criteria:**
- Same CI/manifest/security criteria as M1-2.
- `skill.yaml` declares: `C-HOTEL-SEARCH`, `J1`/`J3`, single egress domain, `risk_level: low`.
- Skill accepts destination/dates/guests, returns structured hotel results.
- Executes successfully inside NanoClaw container.

**⚠️ DD-15 (Open):** Which hotel search API? Options: Amadeus Hotel Search (same sandbox), Booking.com Demand API (requires partnership), RapidAPI aggregators. **Recommend: Amadeus** (same provider as flights, single API key).

### M1-4: Web App Skill Invocation

**Requirement:** The web app can invoke a skill and display results to the authenticated user.

**Acceptance criteria:**
- New API route: `POST /api/skills/invoke` — accepts skill name + input params, returns skill output.
- Route requires authentication (`getCurrentUser`).
- Route validates input against skill's expected params before invocation.
- Route enforces timeout (kills NanoClaw process if skill hangs).
- Route does NOT return raw skill output on error — safe error response only (same pattern as B5 LLM hardening).
- Results displayed in existing search UI (`/search/flights`, `/search/hotels`).

### M1-5: End-to-End Security Validation

**Requirement:** Prove the security model works by attempting to bypass it.

**Acceptance criteria:**
- Submit a skill PR with undeclared egress → CI blocks with TRAVEL-002.
- Submit a skill PR with hardcoded PII → CI blocks with TRAVEL-001.
- Submit a skill PR with booking capability + no confirmation → CI blocks with TRAVEL-003.
- Attempt to execute a skill that calls an undeclared domain → NanoClaw blocks the network call.
- All four scenarios documented with CI/runtime evidence.

---

## 6) Data and System Design Constraints

- Skills are stateless — no DB access, no persistent storage between invocations.
- Skills communicate only via declared egress domains.
- Skill API keys are injected as environment variables by NanoClaw, never hardcoded.
- Skill output is validated by the web app before display (defense in depth).
- NanoClaw execution is local-only in M1 (no cloud deployment).

---

## 7) Milestones

### M1-A: NanoClaw Recon & Integration (prerequisite for all else)
- [ ] NanoClaw recon complete (execution model, skill loading, egress enforcement understood)
- [ ] One test skill executes inside NanoClaw with declared egress
- [ ] Communication contract decided (DD-12)

### M1-B: First Skills
- [ ] Flight search skill passes CI and executes in NanoClaw
- [ ] Hotel search skill passes CI and executes in NanoClaw
- [ ] API providers selected (DD-14, DD-15)

### M1-C: Web App Integration
- [ ] `/api/skills/invoke` route implemented with auth + timeout + safe errors
- [ ] Flight search results displayed in `/search/flights`
- [ ] Hotel search results displayed in `/search/hotels`

### M1-D: Security Proof
- [ ] Four bypass scenarios documented with evidence

---

## 8) Pre-Work: NanoClaw Recon Task

**Before any M1 implementation, we need a recon task (same pattern as Track B recon).**

This must answer:

1. **Execution model:** How does NanoClaw run a skill? Docker container? Subprocess? WASM?
2. **Skill loading:** How does NanoClaw find and load a skill? Directory path? Package registry? Git reference?
3. **Input/output:** How does the skill receive input and return output? Stdin/stdout? Files? HTTP?
4. **Egress enforcement:** Does NanoClaw enforce declared egress domains? How? Iptables? DNS filtering? Proxy?
5. **Resource limits:** What limits does NanoClaw enforce? Memory, CPU, timeout, disk?
6. **Env var injection:** How are API keys passed to the skill? Environment variables? Secrets file?
7. **Configuration:** What config does NanoClaw need? Where does `skill.yaml` fit?
8. **CLI interface:** What is the `nanoclaw` CLI syntax for running a skill?

**Repo to investigate:** `prosy/nanoclaw` (forked from `qwibitai/nanoclaw`)

---

## 9) Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| R1: NanoClaw may not enforce egress at container level | Skills could call undeclared domains | Recon task (§8) determines this. If no enforcement, add network policy layer or proxy. |
| R2: No free flight/hotel API with sufficient rate limits | Can't demo real search | Amadeus sandbox gives 500 calls/month free. Sufficient for M1. Fall back to mock API. |
| R3: NanoClaw execution model may not match our skill.yaml schema | Manifest fields may be irrelevant to runtime | Recon first. Adapt skill.yaml if needed (MINOR version bump). |
| R4: Subprocess invocation from Next.js may be fragile | Timeouts, zombie processes | Wrap in promise with AbortController + cleanup. Kill process group on timeout. |
| R5: API keys as env vars may leak in logs or error messages | Key exposure | Same pattern as Track B: safe error responses, no raw output to client. |

---

## 10) Open Decisions

| ID | Decision | Options | Status | Blocking |
|---|---|---|---|---|
| DD-12 | Skill invocation mechanism | CLI subprocess / HTTP wrapper / Queue | Open | M1-A |
| DD-13 | NanoClaw execution model | Determined by recon | Open | M1-A |
| DD-14 | Flight search API provider | Amadeus / Skyscanner / SerpAPI | Open | M1-B |
| DD-15 | Hotel search API provider | Amadeus / Booking.com / RapidAPI | Open | M1-B |

---

## 11) Implementation Plan

### Phase 1: Recon (blocks everything)
```
1. NanoClaw recon task (§8) → completion report
2. Resolve DD-12 (invocation) and DD-13 (execution model)
3. Resolve DD-14/DD-15 (API providers) — can parallel with recon
```

### Phase 2: First Skill (proves the pipeline)
```
4. Build flight-search skill in travel-aw-skills
5. Submit PR → verify all 3 CI gates pass
6. Execute in NanoClaw locally → verify egress enforcement
7. Iterate until clean end-to-end
```

### Phase 3: Web App Integration
```
8. Build /api/skills/invoke route (auth + timeout + safe errors)
9. Wire /search/flights page to invoke route
10. Build hotel-search skill (same pattern as flight)
11. Wire /search/hotels page
```

### Phase 4: Security Proof
```
12. Four bypass scenarios with documented evidence
13. Update SECURITY_POLICY.md with runtime enforcement docs
```

---

## 12) Appendices

### Source repos
- Web app: `augmented-worlds/travel.aw` (branch: `master` + Track B merged)
- Skills registry: `prosy/travel-aw-skills` (PR #1 merged, CI pipeline proven)
- Container runtime: `prosy/nanoclaw` (fork, build verified)
- Security scanner: `prosy/StopCrabs` (37 rules, editable install)

### Capability codes (from locked A5 registry)
- `C-FLIGHT-SEARCH` — Flight Search (J1, J3)
- `C-HOTEL-SEARCH` — Hotel Search (J1, J3)
- `C-BOOKING-TXN` — Booking Transaction (J3) — NOT in M1 scope

### Predecessor PRD requirements (all complete)
- Track A: A1–A5 ✅
- Track B: B1–B6 ✅
- M0: B1–B4 ✅
