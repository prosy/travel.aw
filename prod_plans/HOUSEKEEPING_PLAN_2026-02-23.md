# TRAVEL.aw — Housekeeping Plan
**Session:** 2026-02-23  
**Purpose:** Fix drift, reconcile data, align authority system before new work  
**Prerequisite for:** DD resolutions, WP-1 schemas, Track B/C implementation

---

## HK-1: Fix Spec Path Drift in Authority Index

**Problem:** Authority Index (A8) references `ECOSYSTEM_SPEC_v0_1.md` but the actual file is `v0_2.md`.  
**Fix:** Update A8 path to `ECOSYSTEM_SPEC_v0_2.md`.  
**Risk if skipped:** Any automated tooling reading A8 will fail to find the spec.

---

## HK-2: Rename DD-06 Collision

**Problem:** DD-06 means two different things:
- **DECISIONS.md (A2):** "REPLACES/MIGRATES_TO edge types" — status: Deferred
- **Session Kickoff:** "Agent architecture (NanoClaw + StopCrabs + private skills)" — status: Open

**Fix:**
1. Keep DD-06 in DECISIONS.md as-is (deferred edge types)
2. Add **DD-08** for agent architecture:

```markdown
| DD-08 | Agent architecture: accept three-layer model (travel.aw web + private skills registry + NanoClaw fork)? | Open | Proposed in PRD v0.1. Three security gates vs OpenClaw's zero. See SESSION_KICKOFF_2026-02-22.md §Three-Layer Architecture. |
```

**Note:** DD-07 (SUPER_APP provider type) already exists — DD-08 is next available.

---

## HK-3: Reconcile C-Codes (22 registry → 23 research)

**Problem:** Research CSV contains 23 unique C-codes; registry (A5) has 22. The session kickoff incorrectly claimed "26 capability domains."

### Gap Analysis

| Status | Code | Action |
|--------|------|--------|
| **In CSV, not in registry** | `C-AI-AGENT` (AI Travel Agent) | **Add to registry** — validated by research, maps to emerging category |
| **In CSV, not in registry** | `C-API-PLATFORM` (API / GDS Platform) | **Add to registry** — validated by research, fills infrastructure gap (Amadeus, Sabre, Travelport) |
| **In registry, not in CSV** | `C-ACTIVITY-SEARCH` (Activity Search) | **Keep in registry** — valid capability (GetYourGuide, Viator, Airbnb Experiences exist), just wasn't separately researched |

### Proposed Additions

```jsonc
// C-AI-AGENT
{
  "code": "C-AI-AGENT",
  "label": "AI Travel Agent",
  "description": "Autonomous or semi-autonomous AI agent that plans, books, or manages travel on behalf of the user.",
  "defaultJourneyStages": ["J1", "J2", "J3", "J6"],
  "status": "candidate"
}

// C-API-PLATFORM
{
  "code": "C-API-PLATFORM",
  "label": "API / GDS Platform",
  "description": "Backend infrastructure platform providing programmatic access to travel inventory (flights, hotels, cars) via API or GDS protocols.",
  "defaultJourneyStages": ["J3"],
  "status": "candidate"
}
```

**Post-fix registry total:** 24 C-codes (22 existing + 2 new). C-ACTIVITY-SEARCH stays.

### Correct the "26" Claim

Update session notes / kickoff to reflect **23 C-codes in research, 24 in registry** (not 26). The overcount likely came from counting capability_label variations or including sub-categories informally.

---

## HK-4: Index prod_plans/ in Authority System

**Problem:** Four planning documents exist in `prod_plans/` but have no authority status. The governance system doesn't know they exist.

### Proposed Authority Assignments

| File | Proposed Authority | Phase | Rationale |
|------|-------------------|-------|-----------|
| `TRAVEL_ECOSYSTEM_NODES_RESEARCH_v0_1.csv` | **A14** (already planned — seeds `nodes.jsonl` at WP-2) | WP-2 | Research data, feeds seed dataset |
| `PRD_TravelAW_Secure_Agent_Architecture_v0_1.md` | **A15** — Agent Architecture PRD | WP-0 (reference) | Defines Track C scope, M0–M5 milestones |
| `TRAVEL_aw_COMBINED_PRD_2026-02-23.md` | **A16** — Combined PRD (Track A + B) | WP-0 (reference) | Defines Track B scope (B1–B6 security requirements) |
| `SESSION_KICKOFF_2026-02-22.md` | **Not indexed** — session artifact only | N/A | Ephemeral; content absorbed into A15/A16/decisions |

**Fix:** Add A14, A15, A16 entries to Authority Index (A8) with paths and precedence notes. Session kickoffs remain unindexed working documents.

### Precedence Note

Per existing rules: `Schema + Registries > Spec > Validator > Session prompt > Everything else`

PRDs (A15, A16) sit at **Spec-level** precedence — they describe intent but registries/schemas override if conflict arises. Add this to A8.

---

## HK-5: Update Ecosystem Spec v0.2 Open Decisions Table

**Problem:** Spec §12 shows DD-03 as "Resolved" but doesn't reflect DD-08 (new). Table is stale.

**Fix:** Update §12 to match current DECISIONS.md state:

| ID | Status | Change |
|----|--------|--------|
| DD-03 | Resolved | Already correct |
| DD-06 | Deferred | Already correct — this is edge types, NOT agent arch |
| DD-08 | Open (NEW) | Agent architecture — add row |

---

## Execution Order

```
HK-1  Fix spec path in A8              (1 line change, no dependencies)
HK-2  Add DD-08 to DECISIONS.md        (no dependencies)
HK-3  Add 2 C-codes to registry A5     (depends on: nothing — additive)
HK-4  Add A14–A16 to Authority Index   (depends on: HK-2 for DD-08 reference)
HK-5  Update spec §12 DD table         (depends on: HK-2)
```

All five are safe to run in a single commit. No schema changes, no code, no breaking changes.

---

## Validation Checklist (Post-Housekeeping)

- [ ] A8 Authority Index references correct spec path (v0_2 not v0_1)
- [ ] DECISIONS.md has DD-08 entry for agent architecture
- [ ] DD-06 in DECISIONS.md still says "edge types" (unchanged)
- [ ] capabilities_registry.json has 24 entries (22 + C-AI-AGENT + C-API-PLATFORM)
- [ ] A8 lists A14, A15, A16 with paths and precedence
- [ ] Spec §12 includes DD-08
- [ ] No "26 C-codes" claim remains in any governed document (correct to 23 research / 24 registry)

---

## What This Unblocks

| Next Step | Unblocked By |
|-----------|-------------|
| DD-01 (toolchain) resolution | HK complete — clean decision baseline |
| DD-04 (lock J0–J8) | HK-3 — registry is reconciled |
| DD-05 (lock C-codes) | HK-3 — registry has correct 24 codes |
| WP-1 schemas | DD-01 + DD-04 + DD-05 |
| Track B Epic/Stories | HK-4 — A16 is indexed, scope is governed |
| Track C Epic/Stories | HK-2 + HK-4 — DD-08 exists, A15 is indexed |
