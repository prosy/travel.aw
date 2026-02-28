# TRAVEL.aw — Authority Pack v0.3
**Status:** SSOT Candidate  
**Date:** 2026-02-26 (America/Los_Angeles)  
**Supersedes:** v0.2 (2026-02-22)  
**Design Pattern:** D-RAG governance (SSOT authorities + deterministic validation + bounded execution + audit trails)

---

## 0. Read Order & Precedence (Non-Negotiable)

Every session (human or agent) MUST read in this order:

1. `AUTH/TRAVEL_AUTHORITIES_INDEX.md` (this file's index, §2)
2. `docs/ecosystem/ECOSYSTEM_SPEC_v*.md` (current version)
3. Registries under `packages/contracts/registries/`
4. Schemas under `packages/contracts/schemas/`
5. Latest validation report (if exists)
6. `PROJECT_MANIFEST.md` (repo map + session routing)

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

### Phase 1 — Bootstrap (WP-0) ✅ COMPLETE

| # | Path | Owns | Status |
|---|------|------|--------|
| A1 | `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md` | Product scope, user journey, MVP, non-goals | ✅ |
| A2 | `docs/ecosystem/DECISIONS.md` | Design decisions (DD-01…) with rationale | ✅ |
| A3 | `docs/ecosystem/GLOSSARY.md` | Canonical term definitions | ✅ |
| A4 | `packages/contracts/registries/journey_stages.json` | J0–J8 labels + descriptions | ✅ Locked |
| A5 | `packages/contracts/registries/capabilities_registry.json` | C-codes (sole source) | ✅ Locked |
| A6 | `packages/contracts/registries/provider_types.json` | ProviderType enum | ✅ Locked |
| A7 | `packages/contracts/registries/relationship_types.json` | Edge types + constraints | ✅ Locked |
| A8 | `AUTH/TRAVEL_AUTHORITIES_INDEX.md` | Master index | ✅ |

### Phase 2 — Schemas & Validation (WP-1) ✅ COMPLETE

| # | Path | Owns | Status |
|---|------|------|--------|
| A9 | `packages/contracts/schemas/ecosystem_node.schema.json` | Node object contract | ✅ |
| A10 | `packages/contracts/schemas/ecosystem_edge.schema.json` | Edge object contract | ✅ |
| A11 | `packages/contracts/CONTRACT_VERSIONING.md` | Semver rules, compat policy | ✅ |
| A12 | `tools/validate_ecosystem/VALIDATION_CONTRACT.md` | What is validated, error classes | ✅ |
| A13 | `data/ecosystem/ID_POLICY.md` | ID format, immutability rules | ✅ |

### Phase 3 — Data & Queries (WP-2+) ✅ COMPLETE

| # | Path | Owns | Status |
|---|------|------|--------|
| A14 | `data/ecosystem/nodes.jsonl` | Canonical node dataset (59 nodes, append-only) | ✅ |
| A15 | `data/ecosystem/edges.jsonl` | Canonical edge dataset (118 edges, append-only) | ✅ |
| A16 | `docs/ecosystem/QUERY_COOKBOOK.md` | MVP queries + deterministic answers | ✅ |
| A17 | `AUTH/CHANGELOG.md` | Authority/contract change log | ✅ |

### Phase 4 — Skills Pipeline (M0 + M1) ✅ COMPLETE

| # | Path (Skills repo) | Owns | Status |
|---|---|---|---|
| A18 | `docs/SKILL_MANIFEST_SPEC.md` | skill.yaml schema | ✅ |
| A19 | `docs/SECURITY_POLICY.md` | CI gates + travel rules | ✅ |
| A20 | `.github/workflows/stopcrabs-gate.yml` | CI pipeline definition | ✅ |
| A21 | `scripts/travel-rules-check.py` | TRAVEL-001/002/003 | ✅ |

### Phase 5 — Runtime (M1, App repo)

| # | Path (App repo) | Owns | Status |
|---|---|---|---|
| A22 | `packages/skill-runner/` | SkillRunner module (83 tests) | ✅ |
| A23 | `PROJECT_MANIFEST.md` | Repo map + session routing | ✅ |

### Deferred (create when needed)

| Path | Trigger |
|------|---------|
| `AUTH/AGENT_OPERATING_RULES.md` | M2 agent loop scoping |
| `AUTH/SESSION_TEMPLATE.md` | Formalized if needed |

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
  └─► SKILL_MANIFEST_SPEC (A18) ──► SECURITY_POLICY (A19)
        └─► CI PIPELINE (A20) + TRAVEL RULES (A21)
  └─► SKILL_RUNNER (A22)
  └─► PROJECT_MANIFEST (A23)
```

**Rule:** A file may only reference authorities at its level or above.

---

## 4. Guardrail Rules

*Unchanged from v0.2 — §4.1–4.5 all still apply.*

### 4.1 Scope Guardrails
- No new journey stages without: DD entry + registry update + version bump.
- No new C-codes except in `capabilities_registry.json` first.
- No term redefinitions outside `GLOSSARY.md`.

### 4.2 Contract Guardrails
- Schemas and registries are SSOT. All data and code MUST conform.
- Validation MUST fail loudly on: unknown enums, missing required fields, invalid IDs, orphan edges.

### 4.3 Data Guardrails
- Node/edge `id` is **immutable** once merged.
- Datasets are **append-only** by default.

### 4.4 Determinism Guardrails
- Validation is deterministic: stable ordering, stable report format, no network calls.

### 4.5 Agent Execution Guardrails
- Agents edit ONLY files in the session allowlist.
- No silent fallbacks — if something is missing, STOP and report.
- Always cite file paths for every edit.
- Always run validation before reporting "done."

---

## 5. Repo Structure

See `PROJECT_MANIFEST.md` (A23) for canonical repo map, session routing, and validation script.

**Key rule:** `prosy/travel.aw` (governance repo) is **read-only archive**. All active development in `prosy/travel-app` (app) or `prosy/travel-aw-skills` (skills).

---

## 6. Open Decisions

| ID | Decision | Status |
|----|----------|--------|
| DD-07 | SUPER_APP providerType | Open |
| DD-18 | Shared vs per-skill Docker image | Open |
| DD-19 | Agent marketplace architecture | Open (M2+) |
| DD-20 | On-device model integration | Open (watching) |

---

## 7. Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-22 | v0.1 | Initial draft (ChatGPT) | Human |
| 2026-02-22 | v0.2 | Rewrite: phased bootstrap, dependency graph, open decisions | Human + Claude |
| 2026-02-26 | v0.3 | Updated all phases to reflect completion status. Added Phase 4 (skills pipeline) and Phase 5 (runtime). Added PROJECT_MANIFEST as authority. Removed stale deferred files. Updated repo structure note. | Human + Claude |
