# TRAVEL.aw — M1 PRD (Revised): Skills Pipeline Integration
**Version:** 0.2  
**Date:** 2026-02-25  
**Status:** Ready for implementation  
**Supersedes:** TRAVEL_AW_M1_PRD_2026-02-24.md (v0.1 draft)  
**Predecessor:** TRAVEL_aw_COMBINED_PRD_2026-02-23.md (Track A ✅, Track B ✅, M0 ✅)

---

## Change Summary from v0.1

| Area | v0.1 Assumption | v0.2 Reality (post-recon) | Impact |
|---|---|---|---|
| NanoClaw role | Callable skill sandbox | WhatsApp/messaging Claude agent daemon | **Path B: extract Docker spawn, build SkillRunner** |
| CLI invocation | `nanoclaw run skill-name` | No CLI exists | DD-12 resolved: direct function call |
| Egress enforcement | Assumed container-level filtering | No enforcement at all | Must add Docker network policies |
| Skill format | `skill.yaml` consumed by runtime | NanoClaw uses `SKILL.md` frontmatter | Bridge at build time; `skill.yaml` remains CI SSOT |
| Secret injection | Assumed configurable | Hardcoded 2-key allowlist | Solved by SkillRunner owning env injection |
| Resource limits | Assumed configurable | No memory/CPU limits | Add Docker `--memory`/`--cpus` flags |
| SmolVM | Not considered | Evaluated — right architecture, wrong maturity (v0.0.3) | Future M2+ candidate; SkillRunner abstraction enables swap |

---

## 1) Product Overview

### 1.1 What M1 Builds

M1 wires the three-layer architecture end-to-end: a vetted skill flows from the registry, through security gates, into a sandboxed Docker container, executes against a real API, and returns structured results to the traveler.

```
travel.aw (web app)  ←→  travel-aw-skills (registry)  ←→  SkillRunner (container runtime)
     │                          │                              │
  User request            CI gates (3)                   Docker container
  Result display       StopCrabs + Travel Rules          Declared egress only
                       + Manifest Validation              Resource limits + timeout
```

### 1.2 What Exists (M0 Deliverables)

| Component | Repo | State |
|---|---|---|
| Web app | augmented-worlds/travel.aw | Track B hardened, Auth0, Prisma, all 6 e2e tests pass |
| Skills registry | prosy/travel-aw-skills | CI pipeline proven (PR #1 merged), 3 gates operational |
| NanoClaw fork | prosy/nanoclaw | Builds, 375/378 tests pass — **reference only for M1** |
| StopCrabs | prosy/StopCrabs | 37 rules, editable install — no M1 changes needed |

### 1.3 What M1 Does NOT Build
- Agent-to-agent orchestration (multi-skill chains)
- Skill marketplace or discovery UI
- User-facing skill configuration/preferences
- Real-time streaming results
- Payment/billing for API usage
- NanoClaw integration (daemon architecture is wrong fit; Docker extraction instead)

---

## 2) Architecture Decisions (Resolved)

### DD-12: Skill Invocation Mechanism → **RESOLVED: SkillRunner module**

NanoClaw has no CLI and is a messaging daemon. Option D (CLI subprocess) from v0.1 is invalid.

**Decision:** Build a `SkillRunner` TypeScript module that:
- Extracts Docker container-spawn logic (inspired by NanoClaw's `container-runner.ts`)
- Reads `skill.yaml` for egress, timeout, resource config
- Spawns Docker container with enforced constraints
- Feeds input JSON via stdin, reads output JSON via stdout markers
- Returns typed `SkillResult` to the web app

**Location:** New package in `travel.aw` monorepo or standalone `prosy/skill-runner`.

**Key design principle:** `SkillRunner` is an abstraction layer. The interface is:
```
SkillRunner.execute(skillName, inputJSON, config) → Promise<SkillOutput>
```
The implementation is Docker today. SmolVM (Firecracker microVMs) tomorrow. The web app never knows.

### DD-13: Execution Model → **RESOLVED: Docker container with enforced constraints**

Not NanoClaw's model. We spawn ephemeral Docker containers directly:
- `--rm` (ephemeral, destroyed after execution)
- `--network` with custom bridge + iptables egress allowlist
- `--memory` and `--cpus` resource limits
- Stdin JSON input, stdout JSON output with delimiters
- Timeout via `AbortController` + container kill

### DD-14: Flight Search API → **RESOLVED: Amadeus Self-Service**

Free sandbox, 500 calls/month, immediate access, well-documented. Covers both flights and hotels.

### DD-15: Hotel Search API → **RESOLVED: Amadeus Self-Service**

Same provider as flights. Single API key, single egress domain (`api.amadeus.com`).

### DD-16 (New): SmolVM Evaluation → **DEFERRED to M2+**

SmolVM (CelestoAI) is a Firecracker-based microVM runtime purpose-built for AI agent code execution. Hardware-level isolation, Python SDK, built-in env vars and resource limits. Tagged `openclaw`.

**Why not M1:** v0.0.3, 19 stars, 26 commits. Pre-alpha maturity. Breaking changes likely. The SkillRunner abstraction enables a contained swap when SmolVM matures.

**Revisit criteria:** SmolVM reaches v0.1.0+, documents egress filtering, demonstrates stable API.

---

## 3) Functional Requirements

### M1-1: SkillRunner Module

**Requirement:** A TypeScript module that executes skills inside Docker containers with enforced security constraints.

**Acceptance criteria:**
- [ ] Reads `skill.yaml` manifest for egress domains, timeout, resource limits
- [ ] Spawns Docker container with `--rm`, `--network`, `--memory`, `--cpus`
- [ ] Enforces egress allowlist: only declared domains reachable from container
- [ ] Injects API keys as environment variables (configurable allowlist, not hardcoded)
- [ ] Feeds input as JSON via stdin, reads output via stdout delimiters
- [ ] Enforces timeout: kills container if skill exceeds declared timeout
- [ ] Returns typed `SkillOutput` (success with results, or error with safe message)
- [ ] No raw container output leaked to caller on error
- [ ] Abstraction interface: `SkillRunner.execute(skillName, input, config) → Promise<SkillOutput>`

### M1-2: Docker Egress Enforcement

**Requirement:** Containers can only reach domains declared in `skill.yaml` egress list.

**Acceptance criteria:**
- [ ] Each skill execution creates a temporary Docker network with restricted egress
- [ ] Only domains listed in `skill.yaml` `permissions.network.egress` are resolvable/reachable
- [ ] Undeclared domain calls fail (connection refused or DNS failure)
- [ ] Localhost/host network access blocked from container
- [ ] Egress enforcement verified by test: skill calling undeclared domain → blocked

**Implementation approach (choose one, document in DD):**

| Option | Mechanism | Pros | Cons |
|---|---|---|---|
| A | Docker network + iptables rules per-container | Proven, granular | Requires root, iptables management |
| B | HTTP/SOCKS proxy with allowlist | Language-agnostic, auditable | Skill must use proxy, adds latency |
| C | DNS-based: custom DNS server resolving only allowed domains | Clean, no proxy config needed | Requires DNS server component |

**⚠️ DD-17 (Open):** Egress enforcement mechanism. Recommend Option A for M1 (most direct). Revisit for SmolVM migration.

### M1-3: Flight Search Skill

**Requirement:** A read-only skill that searches flights via Amadeus API and returns structured results.

**Acceptance criteria:**
- [ ] Passes all 3 CI gates (StopCrabs, travel rules, manifest validation)
- [ ] `skill.yaml` declares: `C-FLIGHT-SEARCH`, `J1`/`J3`, egress `api.amadeus.com`, `risk_level: low`
- [ ] Accepts origin/destination/date, returns structured flight results per output schema
- [ ] No PII in source code. API key via env var `AMADEUS_API_KEY`/`AMADEUS_API_SECRET`
- [ ] Executes successfully inside SkillRunner Docker container
- [ ] Handles API errors gracefully (timeout, rate limit, invalid params)

### M1-4: Hotel Search Skill

**Requirement:** A read-only skill that searches hotels via Amadeus API and returns structured results.

**Acceptance criteria:**
- [ ] Same CI/manifest/security criteria as M1-3
- [ ] `skill.yaml` declares: `C-HOTEL-SEARCH`, `J1`/`J3`, egress `api.amadeus.com`, `risk_level: low`
- [ ] Accepts destination/dates/guests, returns structured hotel results
- [ ] Executes successfully inside SkillRunner Docker container

### M1-5: Web App Skill Invocation

**Requirement:** The web app can invoke a skill via SkillRunner and display results.

**Acceptance criteria:**
- [ ] New API route: `POST /api/skills/invoke` — accepts skill name + input params
- [ ] Route requires authentication (`getCurrentUser`)
- [ ] Route validates input against skill's expected params before invocation
- [ ] Route calls `SkillRunner.execute()` with timeout enforcement
- [ ] Safe error response only — no raw container output to client (mirrors B5 LLM hardening)
- [ ] Results displayed in search UI (`/search/flights`, `/search/hotels`)

### M1-6: End-to-End Security Validation

**Requirement:** Prove the security model works by attempting to bypass it.

**Acceptance criteria:**
- [ ] Scenario 1: Skill PR with undeclared egress → CI blocks with TRAVEL-002
- [ ] Scenario 2: Skill PR with hardcoded PII → CI blocks with TRAVEL-001
- [ ] Scenario 3: Skill PR with booking capability + no confirmation → CI blocks with TRAVEL-003
- [ ] Scenario 4: Skill calls undeclared domain at runtime → SkillRunner/Docker blocks the call
- [ ] All four scenarios documented with CI/runtime evidence in SECURITY_POLICY.md

---

## 4) Skill I/O Contract

### Input (web app → SkillRunner → skill)

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

### Output (skill → SkillRunner → web app)

```jsonc
{
  "status": "success",
  "skill": "flight-search",
  "version": "0.1.0",
  "results": [
    {
      "provider": "Amadeus",
      "airline": "ANA",
      "price": { "amount": 847.00, "currency": "USD" },
      "departure": "2026-03-15T11:30:00-08:00",
      "arrival": "2026-03-16T16:45:00+09:00",
      "stops": 0,
      "duration_minutes": 615,
      "booking_url": "https://www.ana.co.jp/..."
    }
  ],
  "metadata": {
    "query_time_ms": 2340,
    "source_api": "api.amadeus.com",
    "cached": false
  }
}
```

### Error Output

```jsonc
{
  "status": "error",
  "skill": "flight-search",
  "version": "0.1.0",
  "error": {
    "code": "API_TIMEOUT",
    "message": "Amadeus API did not respond within 15000ms"
  }
}
```

### Stdout Delimiters

Adopted from NanoClaw's proven pattern:
```
---SKILL_OUTPUT_START---
{json}
---SKILL_OUTPUT_END---
```

SkillRunner parses between delimiters. Anything outside delimiters is logged but never returned to the web app.

---

## 5) SkillRunner Architecture

### Module Structure

```
packages/skill-runner/
├── src/
│   ├── index.ts              # Public API: SkillRunner.execute()
│   ├── types.ts              # SkillInput, SkillOutput, SkillManifest types
│   ├── manifest.ts           # skill.yaml parser + validator
│   ├── docker.ts             # Docker container spawn + lifecycle
│   ├── network.ts            # Egress enforcement (Docker network + iptables)
│   ├── output-parser.ts      # Stdout delimiter parsing
│   └── errors.ts             # Typed error hierarchy
├── tests/
│   ├── docker.test.ts
│   ├── network.test.ts
│   └── integration.test.ts
├── package.json
└── tsconfig.json
```

### Interface

```typescript
interface SkillRunner {
  execute(
    skillName: string,
    input: SkillInput,
    config?: ExecutionConfig
  ): Promise<SkillOutput>;
}

interface ExecutionConfig {
  timeout_ms?: number;        // Override skill.yaml default
  env_vars?: Record<string, string>;  // API keys injected at runtime
  resource_limits?: {
    memory_mb?: number;       // Docker --memory
    cpus?: number;            // Docker --cpus
  };
}
```

### Execution Sequence

```
1. Load skill.yaml manifest → validate
2. Create temporary Docker network with egress allowlist
3. Build docker run command:
   --rm --network={temp} --memory={limit} --cpus={limit}
   --env AMADEUS_API_KEY=... (from config.env_vars)
   skill-image:{version}
4. Write input JSON to container stdin
5. Read stdout, parse between delimiters
6. On timeout: kill container, return error
7. Cleanup: remove temporary network
8. Return typed SkillOutput
```

---

## 6) Skill Format Bridge

### Problem
- CI gates read `skill.yaml` (SSOT for permissions, capabilities, egress)
- NanoClaw expected `SKILL.md` frontmatter (irrelevant now — we own SkillRunner)
- SkillRunner reads `skill.yaml` directly

### Resolution
`skill.yaml` is the single manifest format. No SKILL.md frontmatter needed for SkillRunner. The existing `SKILL.md` in each skill directory remains a human-readable description (per M0-B2 template) but is not consumed by the runtime.

```
skills/flight-search/
├── skill.yaml          # Machine-readable manifest (CI + SkillRunner)
├── SKILL.md            # Human-readable description (reviewers)
├── Dockerfile          # Container build instructions (NEW for M1)
└── src/
    └── main.py         # Skill source code
```

### New: Dockerfile per Skill

Each skill needs a Dockerfile to build its container image. Minimal base:

```dockerfile
FROM python:3.12-slim
WORKDIR /skill
COPY src/ ./src/
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "src/main.py"]
```

**⚠️ DD-18 (Open):** Should skills share a base image (faster builds, smaller delta) or be fully self-contained? Recommend shared base for M1, revisit if skill language diversity increases.

---

## 7) Milestones

### M1-A: SkillRunner Foundation (blocks everything)

| Task | Deliverable | Est. |
|---|---|---|
| A1 | SkillRunner module: manifest parser, Docker spawn, stdout parser | 2-3 sessions |
| A2 | Egress enforcement: Docker network + allowlist (DD-17) | 1-2 sessions |
| A3 | Integration test: test skill → Docker → egress blocked/allowed | 1 session |

### M1-B: First Skills (proves the pipeline)

| Task | Deliverable | Est. |
|---|---|---|
| B1 | Amadeus API sandbox account + API keys | 30 min |
| B2 | Flight search skill: source + skill.yaml + Dockerfile + tests | 1-2 sessions |
| B3 | Hotel search skill: same pattern | 1 session |
| B4 | Submit both as PRs → verify 3 CI gates pass | 1 session |
| B5 | Execute both in SkillRunner locally → verify egress enforcement | 1 session |

### M1-C: Web App Integration

| Task | Deliverable | Est. |
|---|---|---|
| C1 | `POST /api/skills/invoke` route (auth + timeout + safe errors) | 1-2 sessions |
| C2 | `/search/flights` page wired to invoke route | 1 session |
| C3 | `/search/hotels` page wired to invoke route | 1 session |

### M1-D: Security Proof

| Task | Deliverable | Est. |
|---|---|---|
| D1 | Four bypass scenarios with documented evidence | 1 session |
| D2 | Update SECURITY_POLICY.md with runtime enforcement docs | 1 session |

---

## 8) Open Decisions

| ID | Decision | Options | Status | Blocking |
|---|---|---|---|---|
| DD-17 | Egress enforcement mechanism | iptables / proxy / DNS | **Open** | M1-A2 |
| DD-18 | Shared vs self-contained skill base image | Shared base / per-skill | **Open** | M1-B2 |

### Resolved in This Version

| ID | Decision | Resolution |
|---|---|---|
| DD-12 | Skill invocation mechanism | SkillRunner module (direct Docker spawn) |
| DD-13 | NanoClaw execution model | Irrelevant — building our own SkillRunner |
| DD-14 | Flight search API | Amadeus Self-Service sandbox |
| DD-15 | Hotel search API | Amadeus Self-Service sandbox |
| DD-16 | SmolVM evaluation | Deferred to M2+; SkillRunner abstraction enables future swap |

---

## 9) Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| R1: Docker egress enforcement complexity | iptables management, cleanup on crash | Wrap in try/finally, use Docker network lifecycle hooks |
| R2: Amadeus sandbox rate limits (500/mo) | Can't demo at scale | Sufficient for M1 dev/test. Add caching layer if needed. Mock API as fallback. |
| R3: SkillRunner scope creep | Builds toward a full container orchestrator | Hard constraint: stdin/stdout JSON, ephemeral containers, no state. |
| R4: Subprocess management from Next.js | Zombie processes, blocking event loop | Worker thread or separate process. AbortController + SIGKILL on timeout. |
| R5: SmolVM matures faster than expected | Pressure to switch mid-M1 | SkillRunner interface is the firewall. Swap runtime without changing API. |
| R6: Skill Dockerfile maintenance burden | N Dockerfiles for N skills | Shared base image (DD-18). Build step in CI. |

---

## 10) Implementation Sequence

```
Phase 1: SkillRunner Foundation
  1. Create packages/skill-runner/ in travel.aw monorepo
  2. Implement manifest parser (skill.yaml → typed config)
  3. Implement Docker container spawn with resource limits
  4. Implement stdout delimiter parser
  5. Implement egress enforcement (DD-17)
  6. Integration test with a minimal test skill

Phase 2: First Skills
  7. Create Amadeus sandbox account, get API keys
  8. Build flight-search skill (Python, skill.yaml, Dockerfile)
  9. Build hotel-search skill (same pattern)
 10. Submit as PRs to travel-aw-skills → verify CI gates
 11. Execute in SkillRunner locally → verify egress + results

Phase 3: Web App Integration
 12. Build POST /api/skills/invoke route (auth, timeout, safe errors)
 13. Wire /search/flights to invoke route
 14. Wire /search/hotels to invoke route
 15. End-to-end test: user search → skill execution → results displayed

Phase 4: Security Proof
 16. Four bypass scenarios documented with evidence
 17. SECURITY_POLICY.md updated with runtime enforcement
```

---

## 11) Future: SmolVM Migration Path (M2+)

When SmolVM matures, the migration is contained:

1. Implement `SmolVMRunner` class conforming to `SkillRunner` interface
2. Replace Docker spawn logic with `SmolVM().start()` + `vm.run()` + `vm.set_env_vars()`
3. SmolVM's Firecracker isolation replaces Docker network policies
4. SmolVM's built-in resource limits replace Docker `--memory`/`--cpus`
5. No changes to web app, skills, CI gates, or I/O contract

**Trigger:** SmolVM v0.1.0+, documented egress filtering, stable Python SDK.

---

## 12) Appendices

### Source Repos
- Web app: `augmented-worlds/travel.aw`
- Skills registry: `prosy/travel-aw-skills` (PR #1 merged, CI proven)
- Container runtime reference: `prosy/nanoclaw` (reference only — not a runtime dependency)
- Security scanner: `prosy/StopCrabs` (37 rules, no M1 changes)
- Future runtime candidate: `CelestoAI/SmolVM` (watch list)

### Capability Codes (from locked A5 registry)
- `C-FLIGHT-SEARCH` — Flight Search (J1, J3)
- `C-HOTEL-SEARCH` — Hotel Search (J1, J3)
- `C-BOOKING-TXN` — Booking Transaction (J3) — NOT in M1 scope

### Deploy Checklist (from M0, still pending)
- [ ] Set `WEBHOOK_EMAIL_SECRET` env var in production
- [ ] Set `ENCRYPTION_KEY` env var in production
- [ ] Run encryption migration: `npx tsx scripts/migrate-encrypt-existing.ts --execute`
- [ ] Add RISK-10 to CLAUDE.md known gotchas
