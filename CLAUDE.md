# TRAVEL.aw

> **Claude Code reads this file automatically at session start.**
> Last updated: 2026-02-23 (WP-0 bootstrap: authorities, registries, spec, glossary, decisions)

---

## Project Overview

**What:** Travel ecosystem platform — deterministic, authority-driven travel planning
**Stack:** Next.js 16, TypeScript, Prisma, pnpm monorepo
**Design Pattern:** D-RAG governance (SSOT authorities + deterministic validation + bounded execution + audit trails)

---

## Authoritative Files (Always Consult First)

| File | Location | Purpose |
|------|----------|---------|
| `TRAVEL_AUTHORITIES_INDEX.md` | `AUTH/` | Master authority index + precedence rules |
| `SESSION_CLOSE_PROTOCOL.md` | `AUTH/` | Mandatory session close checklist |
| `ECOSYSTEM_SPEC_v0_2.md` | `docs/ecosystem/` | Product scope, user journey, MVP (WP-0) |
| `DECISIONS.md` | `docs/ecosystem/` | Design decisions registry (WP-0) |
| `GLOSSARY.md` | `docs/ecosystem/` | Canonical term definitions (WP-0) |

### Registries (WP-0)

| File | Location | Owns |
|------|----------|------|
| `journey_stages.json` | `packages/contracts/registries/` | J0-J8 labels |
| `capabilities_registry.json` | `packages/contracts/registries/` | C-codes |
| `provider_types.json` | `packages/contracts/registries/` | ProviderType enum |
| `relationship_types.json` | `packages/contracts/registries/` | Edge types + constraints |

### Auto-loaded via `.claude/rules/` symlinks

| Symlink | Target |
|---------|--------|
| `TRAVEL_AUTHORITIES_INDEX.md` | `AUTH/TRAVEL_AUTHORITIES_INDEX.md` |
| `SESSION_CLOSE_PROTOCOL.md` | `AUTH/SESSION_CLOSE_PROTOCOL.md` |

---

## Current State (2026-02-24)

**Phase:** WP-3 Complete (Track A MVP done)
**Status:** WP-0 bootstrap, WP-1 schemas/validation, WP-2 seed dataset, WP-3 query cookbook all complete. 59 nodes, 118 edges, 5 deterministic queries, validator passes.

### Authorities Created

| # | Path | Status |
|---|------|--------|
| A1 | `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md` | Created |
| A2 | `docs/ecosystem/DECISIONS.md` | Created (DD-01 through DD-10) |
| A3 | `docs/ecosystem/GLOSSARY.md` | Created |
| A4 | `packages/contracts/registries/journey_stages.json` | 9 stages, **locked** |
| A5 | `packages/contracts/registries/capabilities_registry.json` | 24 C-codes, **locked** |
| A6 | `packages/contracts/registries/provider_types.json` | 18 types, **locked** (v1.1.0) |
| A7 | `packages/contracts/registries/relationship_types.json` | 6 types, **locked** |
| A8 | `AUTH/TRAVEL_AUTHORITIES_INDEX.md` | Created |
| A9 | `packages/contracts/schemas/ecosystem_node.schema.json` | Created (WP-1) |
| A10 | `packages/contracts/schemas/ecosystem_edge.schema.json` | Created (WP-1) |
| A11 | `packages/contracts/CONTRACT_VERSIONING.md` | Created (WP-1) |
| A12 | `tools/validate_ecosystem/VALIDATION_CONTRACT.md` | Created (WP-1) |
| A13 | `data/ecosystem/ID_POLICY.md` | Created (WP-1) |
| A14 | `data/ecosystem/nodes.jsonl` | 59 nodes (WP-2) |
| A15 | `data/ecosystem/edges.jsonl` | 118 edges (WP-2) |
| A16 | `docs/ecosystem/QUERY_COOKBOOK.md` | 5 queries (WP-3) |
| A17 | `AUTH/CHANGELOG.md` | Created (WP-1) |
| A18-A20 | `prod_plans/` planning docs | Indexed |

### Design Decisions

| ID | Decision | Status |
|----|----------|--------|
| DD-01 | Toolchain | **Resolved** — full TypeScript monolang |
| DD-02 | Bootstrap scope | **Resolved** — phased |
| DD-03 | Spec completion order | **Resolved** — v0.2 |
| DD-04 | Journey stage labels (J0-J8) | **Resolved** — locked as-is |
| DD-05 | Starter C-codes (24) | **Resolved** — locked all 24 |
| DD-06 | REPLACES/MIGRATES_TO edge types | **Deferred** — post-MVP |
| DD-07 | SUPER_APP providerType | **Resolved** — keep, add guardrail |
| DD-08 | Agent architecture | **Resolved** — accept three-layer, start M0 parallel |
| DD-09 | Edge ID delimiter | **Resolved** — double underscore `__` |
| DD-10 | AI_AGENT + API_PLATFORM provider types | **Resolved** — added to A6 (v1.1.0) |
| DD-11 | Graph library for WP-3 | **Resolved** — custom adjacency maps, no graphology |

---

## Session Close Protocol (MANDATORY)

**Full protocol:** `AUTH/SESSION_CLOSE_PROTOCOL.md` (also auto-loaded via `.claude/rules/`).

Before ending any session, running `/compact`, or switching branches, you MUST:
1. Update `.agent_state.md` — what was completed, commit SHAs, next actions, blockers
2. Add to `## Known Gotchas` in `CLAUDE.md` if you hit a non-obvious problem
3. Update `CLAUDE.md` durable state if status/authorities/decisions changed
4. Execute the full Session Close Protocol. **No session ends without it.**

After completing all protocol steps, print this closing receipt to screen:

```
--- SESSION CLOSE RECEIPT ---
agent_state.md: UPDATED | NO CHANGES
known_gotchas:  ADDED "<one-line>" | NONE
CLAUDE.md:      UPDATED "<what changed>" | NO CHANGES
Tier 2 files:   UPDATED "<which>" | N/A
Commit:         <sha> | NO COMMIT
---
```

**If this receipt is not printed, the session close is incomplete.**

---

## Directory Structure

```
travel.aw/
├── AUTH/
│   ├── TRAVEL_AUTHORITIES_INDEX.md    <- master index (A8)
│   └── SESSION_CLOSE_PROTOCOL.md
├── docs/ecosystem/                     <- specs, decisions, glossary
├── packages/contracts/
│   ├── registries/                     <- JSON enums (journey stages, capabilities, etc.)
│   └── schemas/                        <- JSON Schema contracts (WP-1)
├── apps/web/                           <- Next.js app
├── .claude/rules/                      <- symlinks to authority files
├── prod_plans/                         <- non-authoritative planning docs (A18-A20 indexed)
└── CLAUDE.md                           <- this file
```

---

## Working Agreements

1. **Authority pack is law** — consult `AUTH/TRAVEL_AUTHORITIES_INDEX.md` before changing contracts
2. **Registries are SSOT** — no new enums without registry update + DD entry
3. **Deterministic validation** — no network calls, stable ordering, reproducible
4. **One change -> one validation** — never batch changes
5. **Schemas > Spec > Everything else** — conflict resolution precedence

---

## Known Gotchas

- ajv@8 default only supports draft-07 — using `$schema: "https://json-schema.org/draft/2020-12/schema"` causes "no schema with key or ref" error. Use `"http://json-schema.org/draft-07/schema#"` or import `Ajv2020`.
- CC agent prompts from ChatGPT/claude.ai frequently have wrong file paths — always cross-check against Authority Index (A8) before executing. Paths for A11 and A13 were wrong in the WP-1 prompt.
- Research CSV has commas inside quoted fields — `cut -d','` will silently mangle columns. Use python3 `csv.reader` for parsing.
- Research CSV has 4 provider types (AI_AGENT, API_PLATFORM, AGENT_RUNTIME, SECURITY_TOOL) not in the original locked registry — need DD entry + version bump before creating nodes with those types.
- `pnpm validate -- --fixtures` passes `--` as a literal argv element — filter it out when parsing args.
- Agent prompts reference capability codes that don't exist in locked A5 registry (e.g., C-PAYMENT, C-FLIGHT-BOOKING) — always cross-check against `packages/contracts/registries/capabilities_registry.json` before using any C-code in implementation.
- StopCrabs `-c` config flag is a **global** option (before subcommand): `stopcrabs -c config.yaml scan ...` not `stopcrabs scan ... -c config.yaml`.
- StopCrabs config file is `stopcrabs.yaml` (no dot prefix, `.yaml` not `.yml`). No `.stopcrabs` dotfile convention.
- StopCrabs has no `--rules-dir` flag — rules are baked into the package. Custom rules require a separate validation step.
- StopCrabs `none_of` rules flag absence of safety patterns in any Python file — template skills must include `ALLOWED_PATHS`, `ALLOWED_DOMAINS`, `validate_checksum()` to pass clean.
- StopCrabs is NOT on public PyPI — `pip install stopcrabs>=0.2.0` fails in GitHub Actions CI. Works locally (installed from private source). CI needs private index URL, vendoring, or package publish.
