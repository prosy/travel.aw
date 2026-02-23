# TRAVEL.aw — Authority Pack v0.2
**Status:** SSOT Candidate  
**Date:** 2026-02-22 (America/Los_Angeles)  
**Supersedes:** v0.1 (ChatGPT draft)  
**Design Pattern:** D-RAG governance (SSOT authorities + deterministic validation + bounded execution + audit trails)

---

## 0. Read Order & Precedence (Non-Negotiable)

Every session (human or agent) MUST read in this order:

1. `AUTH/TRAVEL_AUTHORITIES_INDEX.md` (this file's index, §2)
2. `docs/ecosystem/ECOSYSTEM_SPEC_v*.md` (current version)
3. Registries under `packages/contracts/registries/`
4. Schemas under `packages/contracts/schemas/`
5. Latest validation report (if exists)

**Conflict resolution precedence:**

```
Schema + Registries (SSOT)  >  Spec  >  Validator outputs  >  Session prompt  >  Everything else
```

---

## 1. What Is an Authority

An authority is a file that:

- Defines **contractual truth** (schema, registry enums, validation rules)
- Is versioned with a header
- Is the **sole allowed source** for its category of truth
- Is referenced by path in this index

Everything else (notes, drafts, reports, session logs) is **non-authoritative** and MUST NOT override authorities.

---

## 2. Authority Index (SSOT Table)

### Phase 1 — Bootstrap (WP-0, 8 files)

These are required before any data or code work begins.

| # | Path | Owns | Phase |
|---|------|------|-------|
| A1 | `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md` | Product scope, user journey, MVP, non-goals | WP-0 |
| A2 | `docs/ecosystem/DECISIONS.md` | Design decisions (DD-01…) with rationale | WP-0 |
| A3 | `docs/ecosystem/GLOSSARY.md` | Canonical term definitions | WP-0 |
| A4 | `packages/contracts/registries/journey_stages.json` | J0–J8 labels + descriptions | WP-0 |
| A5 | `packages/contracts/registries/capabilities_registry.json` | C-codes (sole source) | WP-0 |
| A6 | `packages/contracts/registries/provider_types.json` | ProviderType enum | WP-0 |
| A7 | `packages/contracts/registries/relationship_types.json` | Edge types + constraints | WP-0 |
| A8 | `AUTH/TRAVEL_AUTHORITIES_INDEX.md` | This file — master index | WP-0 |

### Phase 2 — Schemas & Validation (WP-1, 5 files)

| # | Path | Owns | Phase |
|---|------|------|-------|
| A9 | `packages/contracts/schemas/ecosystem_node.schema.json` | Node object contract | WP-1 |
| A10 | `packages/contracts/schemas/ecosystem_edge.schema.json` | Edge object contract | WP-1 |
| A11 | `packages/contracts/CONTRACT_VERSIONING.md` | Semver rules, compat policy | WP-1 |
| A12 | `tools/validate_ecosystem/VALIDATION_CONTRACT.md` | What is validated, error classes | WP-1 |
| A13 | `data/ecosystem/ID_POLICY.md` | ID format, immutability rules | WP-1 |

### Phase 3 — Data & Queries (WP-2+, 4 files)

| # | Path | Owns | Phase |
|---|------|------|-------|
| A14 | `data/ecosystem/nodes.jsonl` | Canonical node dataset (append-only) | WP-2 |
| A15 | `data/ecosystem/edges.jsonl` | Canonical edge dataset (append-only) | WP-2 |
| A16 | `docs/ecosystem/QUERY_COOKBOOK.md` | MVP queries + deterministic answers | WP-3 |
| A17 | `AUTH/CHANGELOG.md` | Authority/contract change log | WP-2 |

### Reference — Planning Documents (WP-0)

PRDs sit at **Spec-level precedence** — they describe intent but registries and schemas override on conflict.

| # | Path | Owns | Phase |
|---|------|------|-------|
| A18 | `prod_plans/TRAVEL_ECOSYSTEM_NODES_RESEARCH_v0_1.csv` | Ecosystem research data (92 ranked nodes, 24 C-codes, 70+ sources). Seeds WP-2 nodes.jsonl. | WP-2 |
| A19 | `prod_plans/PRD_TravelAW_Secure_Agent_Architecture_v0_1.md` | Agent architecture PRD — three-layer model, M0–M5 milestones, Track C scope. | WP-0 ref |
| A20 | `prod_plans/TRAVEL_aw_COMBINED_PRD_2026-02-23.md` | Combined PRD — Track A (ecosystem graph) + Track B (V1 web app security). B1–B6 requirements. | WP-0 ref |

### Deferred (create when needed)

| Path | Trigger |
|------|---------|
| `AUTH/AGENT_OPERATING_RULES.md` | First agent coding session |
| `AUTH/SESSION_TEMPLATE.md` | First agent coding session |
| `AUTH/SYNC_STATUS.md` | Multi-location sync begins |
| `reports/validation/latest/VALIDATION_REPORT.md` | First validator run |

---

## 3. Authority Dependency Graph

```
AUTHORITIES_INDEX (A8)
  └─► ECOSYSTEM_SPEC (A1) ──► GLOSSARY (A3)
  └─► DECISIONS (A2)
  └─► REGISTRIES (A4–A7)
        └─► SCHEMAS (A9–A10) ──► CONTRACT_VERSIONING (A11)
              └─► VALIDATION_CONTRACT (A12)
              └─► ID_POLICY (A13)
                    └─► DATA (A14–A15)
                          └─► QUERY_COOKBOOK (A16)
```

**Rule:** A file may only reference authorities at its level or above. Data (A14–A15) conforms to schemas (A9–A10) which conform to registries (A4–A7). Never the reverse.

---

## 4. Guardrail Rules

### 4.1 Scope Guardrails
- No new journey stages without: DD entry + registry update + version bump.
- No new C-codes except in `capabilities_registry.json` first.
- No term redefinitions outside `GLOSSARY.md`.

### 4.2 Contract Guardrails
- Schemas and registries are SSOT. All data and code MUST conform.
- Validation MUST fail loudly on: unknown enums, missing required fields, invalid IDs, orphan edges.
- No silent field defaulting (except where explicitly documented in schema `default`).

### 4.3 Data Guardrails
- Node/edge `id` is **immutable** once merged.
- Datasets are **append-only** by default. Edits require: reason + changelog entry + passing validation.
- No orphan edges (referential integrity enforced).

### 4.4 Determinism Guardrails
- Validation is deterministic: stable ordering, stable report format, no network calls.
- Timestamps in UTC. Reports written to `latest/` + dated `runs/` folder.

### 4.5 Agent Execution Guardrails
- Agents edit ONLY files in the session allowlist.
- No directory creation without explicit request.
- No silent fallbacks — if something is missing, STOP and report.
- No broad rewrites — only requested deltas; preserve structure and intent.
- Always cite file paths for every edit.
- Always run validation before reporting "done."
- Always log authority/contract changes in `AUTH/CHANGELOG.md`.

---

## 5. Authority Promotion Pipeline

### 5.1 States

| State | Meaning | Who can edit |
|-------|---------|-------------|
| **Draft** | Ideas, scratch, PRDs | Anyone |
| **Candidate** | Stable enough to validate, referenced by tasks | Owner + reviewer |
| **Authoritative** | SSOT; versioned; changes require policy compliance | Owner + DD entry + changelog |

### 5.2 Promotion Checklist

To promote to **Authoritative**:

- [ ] Stored at correct authority path (per §2 index)
- [ ] Has version header
- [ ] Has clear ownership category
- [ ] Has acceptance criteria
- [ ] Passes validator (or explicit "N/A" note)
- [ ] Changelog entry describes the delta

### 5.3 Demotion

If an authority is wrong or drifting:
1. Mark `**DEPRECATED**` in header
2. Replace with corrected file
3. Update `CONTRACT_VERSIONING.md` + `CHANGELOG.md`

---

## 6. Drift Classification & Controls

### 6.1 Drift Classes

| Code | Type | Example |
|------|------|---------|
| D1 | Scope drift | New stages added informally |
| D2 | Contract drift | Data violates registry/schema |
| D3 | Semantic drift | Same term, different meaning across files |
| D4 | Process drift | Agent edits beyond allowlist, unlogged changes |

### 6.2 Automated Checks (CI or local)

- Schema validation for nodes + edges
- Enum validation (stages, capabilities, providerTypes, edgeTypes)
- Referential integrity (edges → existing nodes)
- ID policy validation
- Stable sort + report diff test

### 6.3 Human Checks (PR checklist)

- Does this change require a DD entry?
- Does it modify a registry enum?
- Does it introduce a new capability?
- Does it change meaning (not just formatting)?
- Is the changelog updated?

---

## 7. Session Kickoff Template (Minimum Viable)

Every agent session prompt MUST include:

```
1. AUTHORITIES: [list paths + read order]
2. ALLOWLIST: [files permitted for editing]
3. TASKS: [numbered, with acceptance criteria]
4. STOP CONDITIONS: [what ends the session]
5. VALIDATION: [must run validator and include report excerpt]
```

---

## 8. Directory Skeleton (Phased)

### WP-0 (Bootstrap)
```
AUTH/
  TRAVEL_AUTHORITIES_INDEX.md       ← this file

docs/ecosystem/
  ECOSYSTEM_SPEC_v0_2.md
  DECISIONS.md
  GLOSSARY.md

packages/contracts/
  registries/
    journey_stages.json
    capabilities_registry.json
    provider_types.json
    relationship_types.json
```

### WP-1 (Schemas + Validation)
```
packages/contracts/
  CONTRACT_VERSIONING.md
  schemas/
    ecosystem_node.schema.json
    ecosystem_edge.schema.json

data/ecosystem/
  ID_POLICY.md

tools/validate_ecosystem/
  VALIDATION_CONTRACT.md
  validate_ecosystem.ts              ← DD-01 pending: TS vs Python
```

### WP-2+ (Data + Governance)
```
data/ecosystem/
  nodes.jsonl
  edges.jsonl

docs/ecosystem/
  QUERY_COOKBOOK.md

AUTH/
  CHANGELOG.md
  AGENT_OPERATING_RULES.md           ← created at first agent session
  SESSION_TEMPLATE.md                ← created at first agent session

reports/validation/
  latest/
    VALIDATION_REPORT.md
  runs/
    {ISO-timestamp}/
      VALIDATION_REPORT.md
```

---

## 9. Design Decisions

| ID | Decision | Resolution | Status |
|----|----------|-----------|--------|
| DD-01 | Toolchain | Full TypeScript monolang | **Resolved** (2026-02-23) |
| DD-02 | Bootstrap scope | Phased | **Resolved** (2026-02-22) |
| DD-03 | Spec completion order | Spec §1–5 first | **Resolved** (2026-02-22) |
| DD-04 | Journey stage labels | Lock J0–J8 as-is | **Resolved** (2026-02-23) |
| DD-05 | Starter C-codes | Lock 24 codes | **Resolved** (2026-02-23) |
| DD-06 | REPLACES/MIGRATES_TO edge types | Defer | **Deferred** (post-MVP) |
| DD-07 | SUPER_APP providerType | Keep, add guardrail | **Resolved** (2026-02-23) |
| DD-08 | Agent architecture | Accept three-layer, start M0 parallel | **Resolved** (2026-02-23) |

---

## 10. Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-22 | v0.1 | Initial draft (ChatGPT) | Human |
| 2026-02-22 | v0.2 | Rewrite: phased bootstrap, dependency graph, trimmed deferred files, added open decisions table | Human + Claude |
| 2026-02-23 | v0.2.1 | Housekeeping: fix A1 path (v0_1→v0_2), add A18–A20 (prod_plans/), add DD-08, reconcile C-codes (24) | Human + Claude |

---

## Appendix: Delta from v0.1

| Change | Rationale |
|--------|-----------|
| Reduced bootstrap from 20 files to 8 | Avoid empty stubs; build what we need when we need it |
| Added dependency graph (§3) | Prevents circular authority refs |
| Phased directory skeleton (§8) | Matches work package sequence |
| Added open decisions table (§9) | Track DD-01→05 explicitly |
| Deferred SYNC_STATUS, AGENT_RULES, SESSION_TEMPLATE | Not needed until agent coding sessions begin |
| Removed stray code artifacts | Clean doc |
| Added changelog (§10) | Practice what we preach |
