# TRAVEL.aw

> **Claude Code reads this file automatically at session start.**
> Last updated: 2026-02-26 (Repo consolidation — governance + app merged)

---

## Project Overview

**What:** Travel ecosystem platform — deterministic, authority-driven travel planning
**Stack:** Next.js 16 (App Router), TypeScript, Prisma + SQLite (dev) / Turso (prod), Tailwind CSS, Auth0, Anthropic Claude API
**Design Pattern:** D-RAG governance (SSOT authorities + deterministic validation + bounded execution + audit trails)
**Monorepo:** pnpm workspaces

---

## Packages

| Package | Path | Purpose |
|---------|------|---------|
| `apps/web` | `apps/web/` | Next.js 16 web app (Auth0, Prisma, Leaflet) |
| `@travel/contracts` | `packages/contracts/` | Shared TypeScript types + ecosystem registries/schemas |
| `@travel/ui` | `packages/ui/` | Shared UI components |
| `@travel/adapters` | `packages/adapters/` | External service adapters |
| `@travel/skill-runner` | `packages/skill-runner/` | Docker-based skill execution (M1-A1) |

---

## Common Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm db:push      # Apply Prisma schema changes
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
```

---

## Key Files

- `apps/web/app/_lib/prisma.ts` — Database client
- `apps/web/app/_lib/auth.ts` — Auth utilities (getCurrentUser)
- `apps/web/app/_lib/anthropic.ts` — Claude API client
- `packages/contracts/src/types/` — Shared type definitions
- `packages/skill-runner/src/index.ts` — SkillRunner public API

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

---

## Conventions

- API routes return data at root level (not wrapped in `{ data: ... }`)
- Use `getCurrentUser()` for auth in API routes
- Client components require `'use client'` directive
- Next.js 16: `params` is a Promise in route handlers
- No emojis in code or responses unless requested
- Authority pack is law — consult `AUTH/TRAVEL_AUTHORITIES_INDEX.md` before changing contracts
- Registries are SSOT — no new enums without registry update + DD entry
- Schemas > Spec > Everything else — conflict resolution precedence

---

## Current State (2026-02-26)

**Phase:** Track A MVP done, M0 done, Track B done, M1 in progress
**Status:** WP-0/1/2/3 complete. M0 B1-B4 done. Track B B1-B6 done. M1-A1 (SkillRunner), M1-A2 (egress enforcement), M1-A3 (integration tests), M1-B (first skills) all done — 83 tests passing. **M1-C (web app integration) is next.**

**Repo consolidation:** On 2026-02-26, governance content (AUTH/, docs/ecosystem/, data/ecosystem/, tools/, prod_plans/, registries) was absorbed from the governance-only clone into this app repo. This is now the single canonical repo.

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

**Full protocol:** `AUTH/SESSION_CLOSE_PROTOCOL.md`

Before ending any session, running `/compact`, or switching branches, you MUST:
1. Update `.agent_state.md` — what was completed, commit SHAs, next actions, blockers
2. Add to `## Known Gotchas` in `CLAUDE.md` if you hit a non-obvious problem
3. Update `CLAUDE.md` durable state if status/authorities/decisions changed
4. Execute the full Session Close Protocol. **No session ends without it.**

---

## Directory Structure

```
travel.aw/
├── AUTH/                                   <- authority pack (governance)
│   ├── TRAVEL_AUTHORITIES_INDEX.md
│   ├── SESSION_CLOSE_PROTOCOL.md
│   └── CHANGELOG.md
├── apps/web/                              <- Next.js 16 app (Auth0, Prisma)
├── packages/
│   ├── contracts/                         <- shared types + ecosystem registries/schemas
│   │   ├── registries/                    <- JSON enums (journey stages, capabilities, etc.)
│   │   └── src/schemas/                   <- JSON Schemas (app + ecosystem)
│   ├── skill-runner/                      <- Docker-based skill execution (M1)
│   ├── adapters/                          <- external service adapters
│   └── ui/                                <- shared UI components
├── docs/ecosystem/                        <- specs, decisions, glossary
├── data/ecosystem/                        <- canonical node/edge datasets
├── tools/                                 <- validators, query tools, Seattle wiki RAG
├── prod_plans/                            <- non-authoritative planning docs
├── prisma/                                <- database schema
├── .claude/rules/                         <- symlinks to authority files
└── CLAUDE.md                              <- this file
```

---

## Known Gotchas

- ajv@8 default only supports draft-07 — using `$schema: "https://json-schema.org/draft/2020-12/schema"` causes "no schema with key or ref" error. Use `"http://json-schema.org/draft-07/schema#"` or import `Ajv2020`.
- CC agent prompts from ChatGPT/claude.ai frequently have wrong file paths — always cross-check against Authority Index (A8) before executing.
- Research CSV has commas inside quoted fields — `cut -d','` will silently mangle columns. Use python3 `csv.reader` for parsing.
- Research CSV has 4 provider types (AI_AGENT, API_PLATFORM, AGENT_RUNTIME, SECURITY_TOOL) not in the original locked registry — need DD entry + version bump before creating nodes with those types.
- `pnpm validate -- --fixtures` passes `--` as a literal argv element — filter it out when parsing args.
- Agent prompts reference capability codes that don't exist in locked A5 registry (e.g., C-PAYMENT, C-FLIGHT-BOOKING) — always cross-check against `packages/contracts/registries/capabilities_registry.json` before using any C-code.
- StopCrabs `-c` config flag is a **global** option (before subcommand): `stopcrabs -c config.yaml scan ...` not `stopcrabs scan ... -c config.yaml`.
- StopCrabs config file is `stopcrabs.yaml` (no dot prefix, `.yaml` not `.yml`). No `.stopcrabs` dotfile convention.
- StopCrabs has no `--rules-dir` flag — rules are baked into the package. Custom rules require a separate validation step.
- StopCrabs `none_of` rules flag absence of safety patterns in any Python file — template skills must include `ALLOWED_PATHS`, `ALLOWED_DOMAINS`, `validate_checksum()` to pass clean.
- StopCrabs is NOT on public PyPI and has a wheel packaging bug (`data/` not included). CI must use `git clone + pip install -e` (editable install).
- Next.js 16 app routes expose `searchParams` as async in server components — access without awaiting causes runtime warning/errors.
- Next.js only auto-invokes middleware from a file named `middleware.ts` (or `.js`) at the app root — any other name (e.g., `proxy.ts`) is silently ignored.
- Prisma `migrate dev` can fail with `P3006` on legacy SQLite DBs without migration history — baseline migrations first, or use `migrate diff`/`db execute` only for local verification.
- SkillRunner `validateEnvVars` checks key *presence* in the envVars map, not actual values — skills that handle missing credentials internally (mock fallback) still need placeholder empty strings passed.
- Docker network cleanup tests are flaky when run in parallel — use before/after snapshot pattern instead of absolute counts.
- Next.js 16: `params` is a Promise in route handlers — must await before accessing properties.
- Repo was consolidated on 2026-02-26 from two diverged clones (governance at ~/Documents/GitHub/travel.aw, app at ~/Projects/augmented-worlds/travel) into this single repo. Archived clone at ~/Documents/GitHub/_archived_travel-aw-governance.

---

## Git

- Repository: github.com/prosy/travel.aw
- Branch: main
- Co-author commits with: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

---

## Related Repos

| Repo | Role |
|------|------|
| `prosy/travel-aw-skills` | Skills registry (flight-search, hotel-search), CI gates |
| `prosy/nanoclaw` | Reference only (not a runtime dep) |
| `prosy/StopCrabs` | Security scanner |
