# TRAVEL.aw

> **Claude Code reads this file automatically at session start.**
> Last updated: 2026-03-02

> Canonical project manifest is `PROJECT_MANIFEST.md` in this repo root. Read it before any session work.

---

## 1. Project Identity

- **What:** Travel ecosystem platform — deterministic, authority-driven travel planning
- **Design Pattern:** D-RAG governance (SSOT authorities + deterministic validation + bounded execution + audit trails)

| Repo | Remote | Local Path | Role |
|------|--------|------------|------|
| **App** (this repo) | `prosy/travel-app` | `~/Documents/GitHub/travel/travel_web/` | Web app, SkillRunner, Track B security, search UI, governance content |
| **Governance** | `prosy/travel.aw` | `~/Documents/GitHub/travel/_archived_travel-aw-governance/` | **READ-ONLY ARCHIVE** — do not commit here |
| **Skills** | `prosy/travel-aw-skills` | `~/Documents/GitHub/travel/travel-aw-skills/` | Skill source code, skill.yaml manifests, CI gates |

---

## 2. Working Directory

- **ALWAYS** start sessions in: `~/Documents/GitHub/travel/travel_web/`
- If your shell resets to a different directory, `cd` back before any git operations
- **NEVER** commit to `~/Documents/GitHub/travel/_archived_travel-aw-governance/` — that is the archived governance repo

---

## 3. Repo Structure

```
~/Documents/GitHub/travel/travel_web/
├── apps/web/                          # Next.js 16 web app (Auth0, Prisma, Leaflet)
│   ├── app/
│   │   ├── api/skills/invoke/         # Skill invocation endpoint (M1-C)
│   │   ├── api/points/parse/          # LLM loyalty parsing (Track B)
│   │   ├── api/email/inbound/         # Webhook ingestion (Track B)
│   │   ├── api/trips/                 # Trip CRUD
│   │   ├── (authenticated)/search/    # Flight + hotel search pages (M1-C)
│   │   └── _lib/
│   │       ├── prisma.ts              # Database client
│   │       ├── auth.ts                # Auth utilities (getCurrentUser)
│   │       ├── anthropic.ts           # Claude API client
│   │       └── encryption.ts          # PII encryption utilities (Track B)
│   └── prisma/schema.prisma
├── packages/
│   ├── skill-runner/                  # SkillRunner module (M1-A, 83 tests)
│   │   └── src/
│   │       ├── index.ts               # createSkillRunner(), execute()
│   │       ├── types.ts               # SkillInput, SkillOutput, errors
│   │       └── network.ts             # Egress enforcement (dead DNS + add-host)
│   ├── contracts/                     # TypeScript types + ecosystem registries
│   │   ├── src/                       # App-level types (trip, user, offer, citation)
│   │   ├── registries/                # Ecosystem SSOT (journey_stages, capabilities, provider_types, relationship_types)
│   │   └── CONTRACT_VERSIONING.md
│   ├── ui/                            # Shared UI components
│   └── adapters/                      # External service adapters
├── AUTH/                              # Authority pack (copied from governance)
│   ├── TRAVEL_AUTHORITIES_INDEX.md
│   ├── CHANGELOG.md
│   └── SESSION_CLOSE_PROTOCOL.md
├── docs/ecosystem/                    # Ecosystem spec + supporting docs
│   ├── ECOSYSTEM_SPEC_v0_2.md
│   ├── DECISIONS.md
│   ├── GLOSSARY.md
│   └── QUERY_COOKBOOK.md
├── data/ecosystem/                    # Ecosystem graph data (59 nodes, 118 edges)
│   ├── nodes.jsonl
│   ├── edges.jsonl
│   └── ID_POLICY.md
├── prod_plans/                        # Planning docs, PRDs, session records
├── tools/                             # Validator, query tools
├── prisma/                            # Database schema
├── .claude/rules/                     # Symlinks to authority files
├── CLAUDE.md                          # THIS FILE
└── PROJECT_MANIFEST.md                # Canonical repo map
```

---

## 4. Current State

| Track | Status | Details |
|-------|--------|---------|
| Track A (Ecosystem Graph) | **COMPLETE** | 59 nodes, 118 edges, 5 queries, 0 validation errors |
| Track B (Security Hardening) | **COMPLETE** | B1-B6 all merged (Auth, PII encryption, webhook auth, LLM hardening, middleware fix) |
| M0 (Skills Registry) | **COMPLETE** | StopCrabs CI + 3 travel security gates proven |
| M1 (Skills Pipeline) | **COMPLETE** | SkillRunner, egress enforcement, 2 skills, web UI, security proof (83 tests) |
| M2 (Agent Loop) | **NOT STARTED** | Scoping phase — NanoClaw fork + agent reasoning loop |

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
| DD-12 | SkillRunner location | **Resolved** — App repo (`packages/skill-runner/`) |
| DD-13 | NanoClaw role | **Reopened** — full agent runtime (container isolation, multi-messenger I/O, swarms, scheduling), not just a messaging daemon. Fork at `prosy/nanoclaw` active. Reassess at M2-C. |
| DD-27 | Agent messaging transport | **Open** — NanoClaw fork vs custom build vs SDK-direct. Needed for agent-to-agent and agent-to-human communication (M2+, marketplace). |

---

## 5. Tech Stack

- **Next.js 16** (NOT 14 or 15 — naming conventions differ). App Router.
- **TypeScript** — monolang across all packages
- **Auth0** for authentication
- **Prisma ORM** — SQLite (dev) / Turso (prod)
- **pnpm 10.28.2** — must match `packageManager` field in `package.json`
- **Docker** for skill container execution
- **Python 3.12** for skills
- **Tailwind CSS** for styling
- **Anthropic Claude API** for LLM features

---

## 6. Key Patterns

- **Auth:** All user-specific routes require Auth0 session + ownership check. Use `getCurrentUser()`.
- **PII:** Emergency contacts and loyalty numbers encrypted at rest (`ENCRYPTION_KEY` env var).
- **Skills:** Executed via SkillRunner in Docker containers with egress enforcement.
- **Ecosystem data:** JSONL format, append-only, immutable IDs.
- **Governance:** D-RAG pattern — Schema+Registries > Spec > Validator > Session prompt.
- **API routes:** Return data at root level (not wrapped in `{ data: ... }`).
- **Client components:** Require `'use client'` directive.
- **Authority precedence:** Schemas > Spec > Everything else. Consult `AUTH/TRAVEL_AUTHORITIES_INDEX.md` before changing contracts.
- **Registries are SSOT:** No new enums without registry update + DD entry.

---

## 7. Environment Variables

| Var | Purpose | Required |
|-----|---------|----------|
| `AUTH0_SECRET` | Auth0 session encryption | Yes |
| `AUTH0_BASE_URL` | Auth0 callback URL | Yes |
| `AUTH0_ISSUER_BASE_URL` | Auth0 tenant URL | Yes |
| `AUTH0_CLIENT_ID` | Auth0 app ID | Yes |
| `AUTH0_CLIENT_SECRET` | Auth0 app secret | Yes |
| `ENCRYPTION_KEY` | PII encryption at rest | Yes (production) |
| `WEBHOOK_EMAIL_SECRET` | Inbound email webhook auth | Yes (production) |
| `SKILLS_DIR` | Path to `travel/travel-aw-skills/skills/` checkout (e.g. `~/Documents/GitHub/travel/travel-aw-skills/skills`) | Yes (for skill execution) |
| `AMADEUS_API_KEY` | Amadeus flight/hotel API | No (mock fallback) |
| `AMADEUS_API_SECRET` | Amadeus flight/hotel API | No (mock fallback) |
| `DATABASE_URL` | Database connection string | Yes (production, Turso) |

---

## 8. Known Gotchas

- **RISK-10:** Next.js 16 renamed `proxy.ts` to `middleware.ts`. The framework only auto-invokes middleware from a file named `middleware.ts` at the app root. `proxy.ts` is silently ignored. This was fixed in Track B (B6) but any new middleware must use the correct filename.
- SkillRunner needs Docker running. If Docker is not available, skill invocation returns 503.
- The governance repo (`prosy/travel.aw`) has diverged history from this repo. Do NOT attempt to merge or pull from it.
- pnpm version must match `packageManager` field in `package.json`.
- Ecosystem registries are in `packages/contracts/registries/` — these are SSOT. Never define enums elsewhere.
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
- Next.js 16: `params` is a Promise in route handlers — must await before accessing properties.
- Prisma `migrate dev` can fail with `P3006` on legacy SQLite DBs without migration history — baseline migrations first, or use `migrate diff`/`db execute` only for local verification.
- SkillRunner `validateEnvVars` checks key *presence* in the envVars map, not actual values — skills that handle missing credentials internally (mock fallback) still need placeholder empty strings passed.
- Docker network cleanup tests are flaky when run in parallel — use before/after snapshot pattern instead of absolute counts.
- Repo was consolidated on 2026-02-26 from two diverged clones. Further consolidation 2026-03-02: all travel projects now under ~/Documents/GitHub/travel/. App at travel_web/, Skills at travel-aw-skills/, Governance archive at _archived_travel-aw-governance/. ~/Projects/augmented-worlds/travel/ no longer exists.
- Turbopack (Next.js bundler) cannot resolve `.js` extension imports in workspace package source files — use extension-less imports (`./module` not `./module.js`) when `moduleResolution: "Bundler"` is set in tsconfig. Fixed in skill-runner `src/index.ts` and all internal modules.
- Two-repo problem: `prosy/travel.aw` (governance history) and `prosy/travel-app` (app history) have completely unrelated git histories — cannot rebase/merge. Created `prosy/travel-app` as separate remote for the app. Local `origin` remote still points to `prosy/travel.aw`; use `app` remote for pushes.

---

## 9. Commit Conventions

- `feat(scope): description` — new features
- `fix(scope): description` — bug fixes
- `docs: description` — documentation only
- `chore: description` — maintenance, session close
- **Scopes:** `track-a`, `track-b`, `m0`, `m1`, `m2`, `skill-runner`, `ecosystem`
- **Co-author:** `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

---

## 10. Session Protocol

1. Read this file FIRST every session
2. Read `PROJECT_MANIFEST.md` for repo map and session routing
3. Run validation before reporting "done" on any ecosystem changes
4. Run `pnpm build` before reporting "done" on any code changes
5. Always cite file paths for every edit
6. No emojis in code or responses unless requested

### Session Close (MANDATORY)

**Full protocol:** `AUTH/SESSION_CLOSE_PROTOCOL.md`

Before ending any session, running `/compact`, or switching branches, you MUST:
1. Update `.agent_state.md` — what was completed, commit SHAs, next actions, blockers
2. Add to **Known Gotchas** (section 8) if you hit a non-obvious problem
3. Update durable state in this file if status/authorities/decisions changed
4. Execute the full Session Close Protocol. **No session ends without it.**

---

## Common Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build (all packages)
pnpm lint         # Lint all packages
pnpm db:push      # Apply Prisma schema changes
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
pnpm db:generate  # Regenerate Prisma client
pnpm db:migrate   # Run Prisma migrations
```

---

## Authoritative Files (Always Consult First)

| File | Location | Purpose |
|------|----------|---------|
| `TRAVEL_AUTHORITIES_INDEX.md` | `AUTH/` | Master authority index + precedence rules |
| `SESSION_CLOSE_PROTOCOL.md` | `AUTH/` | Mandatory session close checklist |
| `ECOSYSTEM_SPEC_v0_2.md` | `docs/ecosystem/` | Product scope, user journey, MVP (WP-0) |
| `DECISIONS.md` | `docs/ecosystem/` | Design decisions registry (WP-0) |
| `GLOSSARY.md` | `docs/ecosystem/` | Canonical term definitions (WP-0) |

### Registries (SSOT)

| File | Location | Owns |
|------|----------|------|
| `journey_stages.json` | `packages/contracts/registries/` | J0-J8 labels |
| `capabilities_registry.json` | `packages/contracts/registries/` | C-codes |
| `provider_types.json` | `packages/contracts/registries/` | ProviderType enum |
| `relationship_types.json` | `packages/contracts/registries/` | Edge types + constraints |

---

## Git

- **App remote:** `app` → `github.com/prosy/travel-app` (push here)
- **Governance remote:** `origin` → `github.com/prosy/travel.aw` (READ-ONLY)
- **Branch:** main

---

## Related Repos

| Repo | Role |
|------|------|
| `prosy/travel-aw-skills` | Skills registry (flight-search, hotel-search), CI gates |
| `prosy/nanoclaw` | Agent runtime fork — container isolation, multi-messenger I/O, swarms, scheduling. Local: `~/Documents/GitHub/nanoclaw/`. Reassess role at M2-C (DD-13 reopened). |
| `prosy/StopCrabs` | Security scanner |
