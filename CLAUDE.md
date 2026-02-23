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

## Current State (2026-02-23)

**Phase:** WP-0 Bootstrap
**Status:** WP-0 COMPLETE — all 8 authority files created (A1-A8)

### WP-0 Deliverables

- [x] A1: `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md`
- [x] A2: `docs/ecosystem/DECISIONS.md`
- [x] A3: `docs/ecosystem/GLOSSARY.md`
- [x] A4: `packages/contracts/registries/journey_stages.json` (9 stages, candidate)
- [x] A5: `packages/contracts/registries/capabilities_registry.json` (22 C-codes, candidate)
- [x] A6: `packages/contracts/registries/provider_types.json` (16 types, candidate)
- [x] A7: `packages/contracts/registries/relationship_types.json` (6 types, candidate)
- [x] A8: `AUTH/TRAVEL_AUTHORITIES_INDEX.md`

### Open Decisions

| ID | Decision | Status |
|----|----------|--------|
| DD-01 | Toolchain (TS vs Python vs hybrid) | Open |
| DD-04 | Journey stage labels (J0-J8) | Open — review registries before locking |
| DD-05 | Starter C-codes (~22 seed capabilities) | Open — review registries before locking |
| DD-07 | SUPER_APP providerType | Open |

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
├── Product Planning/                   <- non-authoritative planning docs
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

(none yet)
