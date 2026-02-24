# TRAVEL.aw — Epic/Story Breakdown: WP-1 + M0 Parallel
**Session:** 2026-02-23  
**Prerequisites:** Housekeeping (8407c5d) ✅, DD resolutions (DD-01/04/05/07/08) ✅

---

## Parallel Execution Model

```
          ┌──────────────────────┐     ┌──────────────────────┐
          │  Stream A: WP-1      │     │  Stream B: M0        │
          │  Schemas/Validation  │     │  Agent Foundation     │
          │  (monorepo)          │     │  (new repos)          │
          └──────┬───────────────┘     └──────┬───────────────┘
                 │                             │
                 ▼                             ▼
          WP-2: Seed Dataset            M1: First Skills
          WP-3: Query Cookbook           Track B: Security
```

No cross-dependencies between Stream A and Stream B until WP-2/M1.

---

## EPIC A: WP-1 — Schemas, Validation & Registry Lock (Stream A)

**Goal:** Enforceable contracts for the ecosystem graph. Validator runs, registries locked, schemas enforce all rules from Spec v0.2 §3–4.

### Story A1: Lock All Registries
**As a** governance system  
**I need** all 4 registries promoted from candidate to locked  
**So that** schemas and validators can reference stable enums  

**Tasks:**
- Update `journey_stages.json` (A4): all entries status → `"locked"`
- Update `capabilities_registry.json` (A5): all 24 entries status → `"locked"`
- Update `provider_types.json` (A6): all entries status → `"locked"`, add SUPER_APP guardrail note (≥4 stages, ≥3 capabilities)
- Update `relationship_types.json` (A7): all entries status → `"locked"`
- Update DECISIONS.md: DD-04, DD-05, DD-07 status → Resolved with date and rationale

**AC:** All registries have status `"locked"`. No `"candidate"` entries remain. DECISIONS.md reflects resolutions.

---

### Story A2: Create Node Schema
**As a** validator  
**I need** `ecosystem_node.schema.json` (A9)  
**So that** node data is machine-checkable  

**Tasks:**
- Create JSON Schema draft-07 (or 2020-12) for node objects per Spec §3
- Required fields: `id`, `name`, `providerType`, `description`, `journeyStages`, `capabilities`, `addedVersion`
- Enum validation: `providerType` values from A6, `journeyStages` values from A4, `capabilities` values from A5
- ID format validation: regex for `{PROVIDER_TYPE}_{SNAKE_CASE_NAME}`
- Optional fields: `url`, `tags`, `notes`

**AC:** Schema file exists. Manual test with 2 valid + 2 invalid node objects passes/fails correctly.

---

### Story A3: Create Edge Schema
**As a** validator  
**I need** `ecosystem_edge.schema.json` (A10)  
**So that** edge data is machine-checkable  

**Tasks:**
- Create JSON Schema for edge objects per Spec §4
- Required fields: `id`, `fromId`, `toId`, `type`, `addedVersion`
- Enum validation: `type` values from A7, `journeyContext` values from A4
- ID format validation: regex for `E_{FROM}__{TO}__{TYPE}` (double-underscore delimiter — avoids ambiguity with underscores in node IDs)
- Optional fields: `description`, `journeyContext`, `notes`

**AC:** Schema file exists. Manual test with valid + invalid edges passes/fails correctly.

**⚠️ Open sub-decision:** Edge ID delimiter. Spec §4 uses single underscore `E_{FROM}_{TO}_{TYPE}` but node IDs contain underscores (e.g., `OTA_BOOKING_COM`), making parsing ambiguous. **Recommend double-underscore `__` as delimiter.** Example: `E__OTA_BOOKING_COM__METASEARCH_GOOGLE_FLIGHTS__AGGREGATES`. Record in DECISIONS.md if changed.

---

### Story A4: Create Contract & ID Policies
**As a** contributor  
**I need** `CONTRACT_VERSIONING.md` and `ID_POLICY.md`  
**So that** I know the rules for changes and naming  

**Tasks:**
- `CONTRACT_VERSIONING.md`: semver rules for registries/schemas, what constitutes breaking vs additive
- `ID_POLICY.md`: node ID format, edge ID format (with delimiter decision), immutability rules, examples

**AC:** Both docs exist and are referenced from Authority Index (A8). Edge ID format is unambiguous.

---

### Story A5: Build Validator (validate_ecosystem)
**As a** CI pipeline  
**I need** `validate_ecosystem.ts` that enforces all integrity rules  
**So that** invalid data never merges  

**Tasks:**
- Implement in TypeScript (DD-01 resolved)
- Schema validation using `ajv` (nodes against A9, edges against A10)
- Referential integrity: every edge `fromId`/`toId` resolves to existing node
- No self-edges
- No duplicate edges (same fromId + toId + type)
- Enum integrity: all values exist in registries
- Deterministic output: stable sort, stable formatting, byte-identical across runs
- Exit code 0 on pass, non-zero on fail
- SARIF or structured JSON output (compatible with future CI integration)
- No network calls

**AC:** Validator runs against empty dataset (0 errors). Validator catches each violation type with a targeted test fixture. Output is deterministic (run twice, diff is empty).

---

### Story A6: Set Up AUTH/CHANGELOG.md
**As a** governance system  
**I need** `AUTH/CHANGELOG.md` (A17)  
**So that** authority changes are tracked  

**Tasks:**
- Create changelog file
- Backfill: WP-0 bootstrap, housekeeping (8407c5d), DD resolutions
- Define entry format (date, authority affected, change type, commit ref)

**AC:** File exists with backfilled entries. Referenced in A8.

---

### WP-1 Definition of Done
- [ ] All 4 registries locked (no candidate entries)
- [ ] Node schema (A9) + edge schema (A10) created and tested
- [ ] CONTRACT_VERSIONING.md + ID_POLICY.md exist
- [ ] Validator passes on empty dataset, catches all violation types
- [ ] Validator output is deterministic
- [ ] AUTH/CHANGELOG.md exists with backfill
- [ ] All new files indexed in Authority Index (A8)

---

## EPIC B: M0 — Agent Foundation (Stream B)

**Goal:** Infrastructure for the three-layer agent architecture. Repos created, CI pipeline established, security gates operational. No skills built yet (that's M1).

### Story B1: Investigate StopCrabs Supabase Dependency
**As a** developer  
**I need** to understand what Supabase was used for in StopCrabs  
**So that** I can reattach it or replace it  

**Tasks:**
- Read StopCrabs repo (`prosy/StopCrabs`) — find all Supabase references
- Determine: scan result storage? rule management? user auth? dashboard?
- Document findings
- Decide: reattach original Supabase project, create new one, or replace with simpler storage

**AC:** Written assessment of Supabase role. Decision on reattach vs replace.

**⚠️ This is discovery — timebox to 2 hours. Blocks B3 (CI workflow) if StopCrabs can't run without Supabase.**

---

### Story B2: Fork NanoClaw
**As a** platform team  
**I need** `travel-aw/nanoclaw` fork  
**So that** we have a controlled agent runtime  

**Tasks:**
- Fork `qwibitai/nanoclaw` → `travel-aw/nanoclaw`
- Verify it builds and runs locally (Apple Container or Docker)
- Document any modifications needed for travel.aw integration
- Do NOT modify yet — this is a clean fork

**AC:** Fork exists at `travel-aw/nanoclaw`. Builds locally. README updated with travel.aw context.

---

### Story B3: Create Skills Repo with StopCrabs CI Gate
**As a** security system  
**I need** `travel-aw/skills` repo with automated security scanning  
**So that** no unvetted skill code enters the registry  

**Tasks:**
- Create private repo `travel-aw/skills`
- Set up repo structure (skill template, README, CONTRIBUTING.md)
- Create `stopcrabs-gate.yml` GitHub Actions workflow:
  - On PR: run StopCrabs scan against changed skill files
  - Fail PR if any HIGH/CRITICAL findings
  - Output SARIF results as PR comment
- Require: StopCrabs CI pass + 1 human approval for merge

**AC:** Empty repo exists. PR with a deliberately vulnerable test skill is blocked by CI. PR with a clean test skill passes CI.

**Depends on:** B1 (need to know if StopCrabs needs Supabase to run in CI)

---

### Story B4: Add Travel-Specific Security Rules
**As a** security scanner  
**I need** travel-domain detection rules  
**So that** travel-specific vulnerabilities are caught  

**Tasks:**
- TRAVEL-001: PII in payload — detect skills that pass passenger names, passport numbers, or payment info in plaintext API calls
- TRAVEL-002: Unbounded egress — detect skills that make outbound HTTP calls without domain allowlisting
- TRAVEL-003: Booking without confirmation — detect skills that execute booking/payment transactions without an explicit user confirmation step
- Implement as StopCrabs DSAL rules (extends existing 37 rules)
- Add test fixtures for each rule (positive + negative cases)

**AC:** Three new rules exist. Each has ≥1 true-positive and ≥1 true-negative test case. Rules run in StopCrabs CI pipeline.

**Decision needed (from kickoff OQ-5):** Upstream these to `prosy/StopCrabs` or keep in `travel-aw/skills`?  
**Recommendation:** Keep in `travel-aw/skills` for now (travel-specific, not general-purpose). Upstream later if other domains want them.

**Depends on:** B1 (StopCrabs operational), B3 (skills repo exists)

---

### M0 Definition of Done
- [ ] StopCrabs Supabase situation resolved (reattached or replaced)
- [ ] NanoClaw forked and builds locally
- [ ] `travel-aw/skills` repo exists with StopCrabs CI gate
- [ ] TRAVEL-001/002/003 rules implemented and tested
- [ ] End-to-end: submit test skill PR → StopCrabs scans → CI pass/fail → human review gate works

---

## Dependency Graph

```
Stream A (WP-1)                    Stream B (M0)
─────────────                      ─────────────
A1 Lock Registries ──┐             B1 StopCrabs Supabase ──┐
                     │                                      │
A2 Node Schema ──────┤             B2 Fork NanoClaw         │
                     │                                      │
A3 Edge Schema ──────┤             B3 Skills Repo + CI ─────┤
                     │                                      │
A4 Contract/ID Docs  │             B4 Travel Rules ─────────┘
                     │
A5 Validator ────────┘
                     
A6 Changelog

          ↓ Both complete ↓

     WP-2: Seed Dataset (30-60 nodes)
     M1: First Skills (flight-search, hotel-search)
     Track B: Security Hardening (B1-B6 from Combined PRD)
```

---

## Open Questions Resolved by These Epics

| OQ (from kickoff) | Resolution |
|----|-----------|
| OQ-1: StopCrabs Supabase? | Story B1 — investigate and decide |
| OQ-2: Cryptographic signing? | Deferred to post-M0. Not needed for private repo with CI + human review |
| OQ-3: NanoClaw → travel.aw visual content? | Deferred to M1. Need skills running first |
| OQ-4: Multi-user model? | Deferred to Track B. Web UI auth exists (Auth0) |
| OQ-5: Upstream TRAVEL rules? | Keep in travel-aw/skills for now (Story B4) |
