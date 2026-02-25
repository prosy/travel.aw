# TRAVEL.aw Sprint — Living Record
Date created: 2026-02-23 (America/Los_Angeles)  
Status: **Active — update in place**  
Owner: Human orchestrator (Aug)  
Purpose: **Human-readable, auditable running record** of sprint work, decisions, risks, and next steps.  
Rule: **Append-only mindset** (edit for clarity, but preserve history via dated notes). One canonical file; git history is the comparison mechanism.

---

## 0) Authorities (Read-order, non-negotiable)
1. **AUTH/TRAVEL_AUTHORITIES_INDEX.md (A8)** — master index, precedence rules, guardrails
2. **ECOSYSTEM_SPEC_v0_2.md (A1)** — product scope, journey model, MVP definition
3. **Registries (A4–A7)** — SSOT enums: journey stages, capabilities, provider types, relationship types
4. **Schemas (A9–A10)** — node + edge JSON Schemas
5. **VALIDATION_CONTRACT.md (A12)** — validator checks, determinism contract, output format

**Operating constraints**
- Conflict precedence: **Schema + Registries > Spec > Validator > Session prompt > Everything else.**
- Seeds are **append-only** (IDs immutable).
- Breaking changes require a version bump per `CONTRACT_VERSIONING.md` (A11).
- Proposals and fixes as **Markdown first**; code only after approach alignment.

---

## 1) Sprint goals
- **Track A MVP:** Deterministic, validated ecosystem graph with queryable cookbook
  - 30–60 nodes ✅ (59 achieved)
  - 100–200 edges ✅ (118 achieved)
  - 5 MVP queries answerable deterministically (WP-3)
- **Track C M0:** Agent foundation infrastructure (NanoClaw fork, skills repo, StopCrabs CI)
- **Track B (stretch):** V1 web app security hardening (B1–B6 from Combined PRD)

---

## 2) Current diagnosis (end of 2026-02-24 session 6)
- **Track A is MVP complete.** WP-0/1/2/3 done (59 nodes, 118 edges, 5 deterministic queries).
- **Track C (M0) is fully closed.** B1–B4 done. DoD proven via PR #1 (3 CI gates discriminating). PR #1 merged.
- **Track B is complete.** All 6 security hardening requirements (B1–B6) implemented and merged via PR #4. Post-merge fix applied (B6 proxy.ts revert, `e21692c`).
- **Three human gates remain:** Auth0 e2e browser test, production env vars, encryption migration.
- **Session 5 Seattle scaffold** exists in `apps/web/src/` (prosy/travel.aw) — intentional Codex test, outside PRD scope. Not tracked as sprint work.

Sprint levers (remaining):
1. Human gates: Auth0 e2e test → set production env vars → run encryption migration
2. M1: First travel skills (flight-search, hotel-search) — unblocked by M0
3. WP-4 graph export — optional post-MVP

---

## 3) Work Package status (update this first)

### Track A — Ecosystem Graph (SSOT)
| WP | Description | Status | Commit(s) | Notes |
|---:|---|---|---|---|
| WP-0 | Bootstrap (A1–A8) | ✅ Complete | pre-existing | 8 authority files |
| WP-1 | Schemas & Validation (A9–A13, A17) | ✅ Complete | `9bc880d` | 10 integrity checks, ajv, deterministic |
| WP-2 | Seed Dataset (A14–A15) | ✅ Complete | `1b64020`, `7a494c0` | 59 nodes, 118 edges, 24/24 C-codes |
| WP-3 | Query Cookbook (A16) | ✅ Complete | (pending) | 5 deterministic queries, DD-11 |
| WP-4 | Graph Export (optional) | ⏳ Post-MVP | — | Neo4j/CSV export, browse UI |

### Track C — Agent Foundation (M0)
| Story | Description | Status | Commit(s) | Notes |
|---:|---|---|---|---|
| B1 | StopCrabs Supabase investigation | ✅ Complete | — | No Supabase dep; paused project is for web app |
| B2 | Fork NanoClaw → prosy/nanoclaw | ✅ Complete | `593344d` | Fork live, build passes, 375/378 tests pass (3 pre-existing upstream failures) |
| B3 | Skills repo + StopCrabs CI gate | ✅ Complete | `b738498` | prosy/travel-aw-skills, 37 DSAL rules |
| B4 | Travel-specific rules (TRAVEL-001/002/003) | ✅ Complete | `c86e17f` | 3 rules, 4 fixtures, CI job added |

### Track B — V1 Web App Security
| Req | Description | Status | Commit(s) | Notes |
|---:|---|---|---|---|
| B1+B2 | Auth & authz + null userId trips | ✅ Complete | `bdb1d4b` | 3 gaps fixed, media marked intentionally public |
| B3 | Inbound email webhook auth | ✅ Complete | `086bd12` | Shared secret, auto-link removed, 10MB limit |
| B4 | PII encryption at rest | ✅ Complete | `30ad68f` | Contacts + points encrypted, migration script created |
| B5 | LLM endpoint hardening | ✅ Complete | `f587cab` | Configurable model, size limits, safe errors, schema validation |
| B6 | Repo drift / CI alignment | ✅ Complete | `568648e`, `e21692c` | Matcher config fixed, DEPLOY.md fixed, proxy.ts reverted (Next.js 16 convention) |

**Legend:** ✅ complete · ⏳ next/pending · 🧪 in progress · 🛑 blocked

---

## 4) Sprint folder SSOT + provenance pointers

**Repo:** `prosy/travel.aw` (origin/main)

**Authority files (governed):**

| ID | Path | Description |
|----|------|-------------|
| A1 | docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md | Product scope, journey model, MVP |
| A2 | docs/ecosystem/DECISIONS.md | DD-01 through DD-10 |
| A3 | docs/ecosystem/GLOSSARY.md | Canonical terms |
| A4–A7 | packages/contracts/*.json | Locked registries (9+24+18+6) |
| A8 | AUTH/TRAVEL_AUTHORITIES_INDEX.md | Master index |
| A9–A10 | packages/contracts/schemas/*.schema.json | Node + edge schemas |
| A11 | packages/contracts/CONTRACT_VERSIONING.md | Semver rules |
| A12 | tools/validate_ecosystem/VALIDATION_CONTRACT.md | Validator contract |
| A13 | data/ecosystem/ID_POLICY.md | ID format rules |
| A14–A15 | data/ecosystem/nodes.jsonl, edges.jsonl | Seed dataset |
| A16 | docs/ecosystem/QUERY_COOKBOOK.md | Query definitions + expected results |
| A17 | AUTH/CHANGELOG.md | Authority change log |
| A18–A20 | prod_plans/*.md, *.csv | Research data + PRDs (reference) |

**Session artifacts (not governed):**
- `prod_plans/SESSION_KICKOFF_2026-02-22.md` — ephemeral
- `prod_plans/SESSION_SUMMARY_2026-02-23.md` — ephemeral

---

## 5) Running log (append dated entries)

### 2026-02-23 — Session 1: Planning + WP-0/1/2 execution
**What happened**
- Housekeeping pass: fixed spec path drift, DD-06 collision, C-code reconciliation (22→24), indexed prod_plans/ as A18–A20.
- Resolved all open DDs: DD-01 (full TS), DD-04 (lock J0–J8), DD-05 (lock 24 C-codes), DD-07 (keep SUPER_APP), DD-08 (accept agent architecture, M0 parallel), DD-09 (edge ID `__` delimiter), DD-10 (AI_AGENT + API_PLATFORM provider types).
- WP-1 complete: schemas (A9/A10), validator (10 checks, deterministic), policies (A11/A12/A13), changelog (A17).
- WP-2 complete: 59 nodes, 118 edges, 24/24 C-codes, all J0–J8 covered, validator 0 errors.

**Commits (7 total, pushed to origin/main)**

| SHA | Description |
|-----|-------------|
| `8407c5d` | Housekeeping — fix drift, DD-08, C-codes, A18–A20 |
| `99a5a7a` | DD resolutions — lock registries, full TS, accept agent arch |
| `9bc880d` | WP-1 — schemas, validator, policies, changelog |
| `889e2d7` | Sprint living record (session close Day 1 WP specs) |
| `1b64020` | DD-10 — AI_AGENT + API_PLATFORM provider types |
| `7a494c0` | WP-2 — 59 nodes, 118 edges, validator passes |
| `6ac08c8` | Session close — agent state + CLAUDE.md updated |

**Issues caught during execution (by CC)**
- A14–A17 number collision: prod_plans/ docs renumbered to A18–A20
- Spec §12 vs §8: section reference was wrong in prompts (§8 is correct)
- Provider type gap: C-AI-AGENT and C-API-PLATFORM had capability codes but no matching provider types → DD-10
- ajv draft mismatch: schemas switched from 2020-12 to draft-07
- CSV row count discrepancy: uploaded copy (92 rows) vs repo copy (95 rows) — repo is authoritative
- Missing TS scaffolding: no package.json/tsconfig existed; CC created during WP-1

**Orchestrator notes**
- ✅ Dual-agent workflow (claude.ai planning + CC executing) is effective. Handoff via markdown prompts with fenced code blocks works reliably.
- ✅ "Housekeeping before building" pattern prevented cascading errors in WP-1/WP-2.
- ⚠️ Watch-out: prompts from claude.ai used spec paths instead of Authority Index paths. CC caught and corrected. **Always instruct CC to read A8 before executing.**
- ⚠️ Watch-out: adding a C-code doesn't auto-create the matching provider type. Registries are independent. Check both when adding to either.
- 📌 Next: WP-3 (query cookbook) to complete Track A MVP. M0 (agent foundation) can run in parallel.

### 2026-02-24 — Session 2: WP-3 Query Cookbook
**What happened**
- WP-3 complete: 5 deterministic queries (Q1–Q5) implemented as TS functions.
- DD-11 resolved: custom adjacency maps over graphology (59 nodes too small for library).
- A16 (QUERY_COOKBOOK.md) created with verified expected results from actual query runs.
- All acceptance criteria met: `--all` JSON output, `--fixtures` determinism, validator still passes.

**Query results summary:**
- Q1: 1 node (SUPER_APP_GOOGLE spans J0→J3)
- Q2: 12 paths (4 social sources → 3 OTAs, depth 1-2)
- Q3: 6 nodes (event discovery in-trip)
- Q4: 3 itinerary managers with integration categories
- Q5: 7 nearbyNow + 6 upcoming, 0 overlap

**Track A MVP is complete.** WP-0/1/2/3 all done.

### 2026-02-24 — Session 2 (cont): M0-B1 + M0-B3
**What happened**
- B1 resolved: StopCrabs has zero Supabase dependency. Paused Supabase project (festoiadrbantlykemmd) is for travel.aw web app (Auth + Storage), not StopCrabs.
- B3 complete: `prosy/travel-aw-skills` repo created with StopCrabs CI gate.
- Analyzed agent prompt (M0_B2_SKILLS_REPO_AGENT_INSTRUCTIONS.md), caught 9 errors: wrong story number, wrong config filename, wrong config schema, wrong CLI flag positions, wrong --output flag, no --rules-dir support, naive wildcard grep, SARIF overwrite bug, wrong GitHub org.
- All corrected before implementing. StopCrabs v0.2.0 CLI verified hands-on.
- Template skill passes clean (exit 0). Bad test skill blocked (exit 1, 13 findings).
- B2 (NanoClaw fork) deferred — mechanical, non-blocking.
- B4 decision: travel-specific rules will be separate `travel-rules-check.py` step, not StopCrabs plugin (no --rules-dir support).

**Issues caught during execution (by CC)**
- StopCrabs `-c` config flag is global (before subcommand), not a scan option — all examples in agent prompt were wrong
- StopCrabs writes `scan_report.sarif` to output dir (not custom filenames) — CI workflow needed separate output dirs per skill
- StopCrabs `none_of` rules flag absence of safety patterns — template skills must include `ALLOWED_PATHS`, `ALLOWED_DOMAINS`, `validate_checksum()`, `REQUIRES_USER_CONFIRMATION`
- Config file is `stopcrabs.yaml` (no dot prefix, `.yaml` not `.yml`)
- Manifest wildcard check used naive `grep '*'` which matches any asterisk — replaced with YAML parser targeting egress section only

### 2026-02-24 — Session 2 (cont): M0-B4 Travel Rules
**What happened**
- B4 complete: 3 travel-specific rules (TRAVEL-001/002/003) implemented as `scripts/travel-rules-check.py` in prosy/travel-aw-skills.
- Analyzed agent prompt (M0_B4_TRAVEL_RULES_AGENT_INSTRUCTIONS.md), caught 6 errors: non-existent capability codes (C-PAYMENT etc → only C-BOOKING-TXN in locked A5), missing bad-pii fixture, nonexistent pre-flight files, CHANGED_SKILLS inconsistency, "book" keyword false positives, missing fetch-depth.
- All 4 test fixtures pass: good-skill (exit 0), bad-pii/bad-egress/bad-booking (exit 1 with correct violations).
- CI workflow updated: `travel-rules` job runs parallel with `security-scan` and `manifest-validation`.
- SECURITY_POLICY.md and README.md updated with full rule documentation.

**Commits (prosy/travel-aw-skills repo)**

| SHA | Description |
|-----|-------------|
| `c86e17f` | feat: add travel-specific security rules TRAVEL-001/002/003 (M0-B4) |

**Issues caught during execution (by CC)**
- Agent prompt referenced C-PAYMENT, C-FLIGHT-BOOKING, C-HOTEL-BOOKING, C-CAR-RENTAL-BOOKING — none exist in locked A5 registry. Only C-BOOKING-TXN is valid.
- Agent prompt omitted skill.yaml fixture for bad-pii test case — created manually
- Python regex `(?i)` embedded mid-pattern causes DeprecationWarning — moved to `re.IGNORECASE` flag parameter
- Agent prompt's "pre-flight" file references (SUBMISSION_GUIDE.md, SKILL_MANIFEST_SPEC.md) were already created in B3
- "book" as standalone TRAVEL-003 keyword would false-positive on comments like "booking" — used word boundary regex

### 2026-02-24 — Session 3: M0 DoD End-to-End CI Test
**What happened**
- Created PR #1 on prosy/travel-aw-skills with 2 test skills for e2e CI gate validation.
- `test-echo` (clean skill): passes all gates locally and in CI.
- `test-echo-bad` (deliberately bad): triggers TRAVEL-001 (hardcoded email) + TRAVEL-003 (booking capability + low risk).
- CI results: manifest validation PASS, travel-rules FAIL (expected — per-skill output confirms test-echo clean, test-echo-bad blocked). StopCrabs FAIL (infrastructure — package not on public PyPI).
- M0 DoD partially met: 2 of 3 gates proven in CI. StopCrabs gate logic verified locally but CI install fails.

**CI run:** https://github.com/prosy/travel-aw-skills/actions/runs/22334992847

**Commits (prosy/travel-aw-skills repo)**

| SHA | Description |
|-----|-------------|
| `05a114d` | feat(m0-dod): e2e test skills — test-echo (pass) + test-echo-bad (fail) |

**Issues caught during execution (by CC)**
- StopCrabs is not on public PyPI — `pip install stopcrabs>=0.2.0` fails in CI with "No matching distribution found". Works locally (installed from private source). Needs either PyPI publish, private index config, or vendoring.

### 2026-02-24 — Session 3 (cont): Fix StopCrabs CI Install
**What happened**
- First fix (`pip install git+...`) installed successfully but crashed at runtime: `FileNotFoundError: Data directory not found`.
- Root cause: StopCrabs `pyproject.toml` wheel target only packages `src/stopcrabs/`, not `data/`. Code resolves data dir via `Path(__file__).parent.parent.parent.parent / "data"` — only works from repo checkout.
- Fixed with `git clone --depth 1` + `pip install -e` (editable install preserves repo structure).
- **All 3 CI gates now work:** StopCrabs PASS, manifest validation PASS, travel-rules FAIL (expected).
- **M0 DoD fully met.**

**CI run:** https://github.com/prosy/travel-aw-skills/actions/runs/22335665571

**Commits (prosy/travel-aw-skills repo, m0-dod-e2e-test branch)**

| SHA | Description |
|-----|-------------|
| `33c1480` | fix(ci): install StopCrabs from GitHub repo (editable install) |

**Issues caught during execution (by CC)**
- StopCrabs has a packaging bug: `data/` directory is in sdist include but not in wheel targets. `Path(__file__)`-based resolution only works with editable installs or running from repo checkout. Should be fixed upstream.

### 2026-02-24 — Session 4: M0-B2 Fork NanoClaw
**What happened**
- Forked `qwibitai/nanoclaw` (MIT, 13.4K stars) → `prosy/nanoclaw`.
- Added fork notice to README.md, upstream remote auto-configured by `gh repo clone`.
- Build verification: `tsc` compiles clean, 375/378 vitest tests pass. 3 failures in `fetch-upstream.test.ts` are pre-existing (test assumes `origin` points to `qwibitai/nanoclaw`, but on a fork it points to `prosy/nanoclaw`).
- **M0-B2 complete. All 4 M0 stories now done (B1–B4).**

**Commits (prosy/nanoclaw repo)**

| SHA | Description |
|-----|-------------|
| `593344d` | feat(m0-b2): fork NanoClaw to prosy/nanoclaw |

### Session 3+4 combined summary (this conversation)
**Completed work:**
- Fixed StopCrabs CI install — editable install from GitHub clone (pip install from git crashes due to missing `data/` in wheel)
- M0 DoD fully proven: all 3 CI gates (StopCrabs, manifest validation, travel-rules) work on PR #1
- M0-B2: forked qwibitai/nanoclaw → prosy/nanoclaw, build + 375/378 tests pass
- **M0 Agent Foundation is fully complete** — B1 ✅ B2 ✅ B3 ✅ B4 ✅

**Decisions:** None new (no DD-12 needed)

**Blockers:** None — M0 complete. Next work is Track B (web app security) or M1 (first travel skills).

### 2026-02-24 — Session 5: Seattle deterministic MVP scaffold
**What happened**
- Added Seattle deterministic data/query scaffold: `data/seattle/*` catalogs + triggers and `tools/seattle_categories/*` query layer.
- Bootstrapped `apps/web` as runnable Next.js app and added Seattle routes + APIs for planning/while-in-city/sports.
- Implemented stored-query sports flow: page-open trigger on `/seattle/while-in-seattle/sports` calling `/api/seattle/sports`.
- Updated UI to align with current app patterns: active top nav, tabbed intents, card layout, sticky query-state side panel.
- Reduced sports render to concise summary + selected table content instead of full raw section blob.
- Fixed Next.js 16 runtime issue on Seattle pages by resolving async `searchParams` before property reads.

**Decisions made or deferred**
- Made: deterministic non-vector retrieval remains primary mode (catalog filters + stored query trigger execution).
- Deferred: full integration into broader travel.aw IA/auth flow pending next planning pass.

**Blockers encountered**
- Local runtime requires two services running together (`Seattle_wikidata` + `apps/web`) and using port `3010` when `3000` is occupied.
- Sandbox-restricted runs can fail on `tsx` IPC; local smoke tests require unsandboxed terminal execution.

### 2026-02-24 — Session 6: Track B Security Hardening (all stories)
**What happened**
- Executed all 5 Track B stories (B6 → B1B2 → B3 → B5 → B4) via CC on `track-b-security` branch.
- Codex recon task ran first (good output — line numbers, explicit missing-file calls). Second Codex run (B4/B6) correctly gated on repo path mismatch (prosy/travel.aw vs augmented-worlds/travel.aw). Redirected to correct repo.
- CC completed all stories. Build passed at every checkpoint. Zero files outside file plans.
- PR #4 submitted: https://github.com/prosy/travel.aw/pull/4

**Commits (augmented-worlds/travel.aw repo, track-b-security branch)**

| SHA | Description |
|-----|-------------|
| `568648e` | fix(track-b): B6 — rename proxy.ts to middleware.ts, align packageManager |
| `bdb1d4b` | fix(track-b): B1B2 — auth consistency + null userId trips |
| `086bd12` | fix(track-b): B3 — webhook auth + safe storage + payload limits |
| `f587cab` | fix(track-b): B5 — LLM endpoint hardening |
| `30ad68f` | fix(track-b): B4 — PII encryption at rest for contacts + points |

**Deviations from instructions**
- B3: `.env.example` was gitignored — `git add -f` used (template values, not secrets)
- B4: `prisma db push` instead of `prisma migrate dev` (SQLite dev DB — production needs real migration)
- B4: Stray branch created during prisma op — resolved via fast-forward merge

**Issues caught during execution**
- Codex correctly stopped when file paths didn't match repo (prosy/travel.aw has Seattle scaffold, not V1 app). Redirected to augmented-worlds/travel.aw.
- `proxy.ts` was never being invoked by Next.js — middleware was effectively disabled since initial commit. Now active.

**Post-merge actions required**
1. Set `WEBHOOK_EMAIL_SECRET` in production/staging
2. Run encryption migration: `npx tsx scripts/migrate-encrypt-existing.ts --execute`
3. Verify Auth0 login → callback → session → protected route flow (middleware now active)
4. Monitor for 503s on contacts/points routes if `ENCRYPTION_KEY` not set

**Orchestrator notes**
- ✅ Codex recon-then-execute pattern works well. Recon report with line numbers prevented the M0-era "phantom file" errors entirely.
- ✅ Codex gating on path mismatch is correct behavior — proves the "STOP and report" instruction works.
- ⚠️ Two-repo problem: V1 app lives in augmented-worlds/travel.aw, ecosystem/governance in prosy/travel.aw. Agent prompts must specify full paths.
- 📌 Next: merge PR #1 (M0 DoD) + PR #4 (Track B). Then M1 first skills or WP-4.

### 2026-02-24 — Session 6: Track B Security Hardening (all stories)
**What happened**
- Executed all 5 Track B stories (B6 → B1B2 → B3 → B5 → B4) via CC on `track-b-security` branch.
- Codex recon task ran first (good output — line numbers, explicit missing-file calls). Codex B4/B6 correctly gated on repo path mismatch, redirected to correct repo.
- CC completed all stories. Build passed at every checkpoint. Zero files outside file plans.
- PR #4 merged. PR #1 (M0 DoD, travel-aw-skills) also merged.
- Post-merge fix: B6 proxy.ts revert (`e21692c`). Next.js 16 uses `proxy.ts` not `middleware.ts` — CC had renamed it based on old convention. Codex B6 report caught the deprecation warning. Confirmed and reverted.

**Commits (augmented-worlds/travel.aw repo)**

| SHA | Description |
|-----|-------------|
| `568648e` | fix(track-b): B6 — matcher config, DEPLOY.md fixes |
| `bdb1d4b` | fix(track-b): B1B2 — auth consistency + null userId trips |
| `086bd12` | fix(track-b): B3 — webhook auth + safe storage + payload limits |
| `f587cab` | fix(track-b): B5 — LLM endpoint hardening |
| `30ad68f` | fix(track-b): B4 — PII encryption at rest for contacts + points |
| `e21692c` | fix(track-b): B6 revert — use proxy.ts per Next.js 16 convention |

**Codex parallel results**

| Branch | Codex Finding | Value Added |
|--------|--------------|-------------|
| `track-b-b6-repo-drift` | `packageManager` field missing; Next.js 16 deprecation warning on `middleware.ts` | Caught the proxy.ts revert need |
| `track-b-b4-encryption` | Route encryption already done by CC; migration SQL needed manual scoping (P3006 shadow DB failure) | Migration SQL cleanup, script dry-run validation (37 accounts found) |

**Deviations from instructions**
- B3: `.env.example` was gitignored — `git add -f` used (template values, not secrets)
- B4: `prisma db push` used instead of `prisma migrate dev` (SQLite dev DB)
- B6: proxy.ts renamed to middleware.ts then reverted — Next.js 16 uses proxy.ts

**Post-merge human gates (not yet completed)**
1. Auth0 e2e browser test (pnpm dev → login → protected route → public route)
2. Set production env vars: `WEBHOOK_EMAIL_SECRET`, `ENCRYPTION_KEY`, `LLM_MODEL` (optional)
3. Run encryption migration: `npx tsx scripts/migrate-encrypt-existing.ts --execute`

**Orchestrator notes**
- ✅ Codex recon-then-execute pattern works. Recon report with line numbers prevented M0-era "phantom file" errors.
- ✅ Codex gating on path mismatch is correct behavior — proves "STOP and report" instruction works.
- ✅ Codex parallel execution surfaced the Next.js 16 convention issue that CC missed. Dual-agent cross-checking has value.
- ⚠️ Two-repo problem: V1 app in augmented-worlds/travel.aw, ecosystem/governance in prosy/travel.aw. All agent prompts must specify full absolute repo path.
- ⚠️ Next.js 16 convention change: `proxy.ts` replaces `middleware.ts`. All future references must use `proxy.ts`.
- 📌 Next: complete human gates, then M1 first skills or WP-4.

---

## 6) Decisions (all resolved)

| ID | Decision | Resolution | Date | Notes |
|----|----------|-----------|------|-------|
| DD-01 | Toolchain | Full TypeScript monolang | 2026-02-23 | StopCrabs stays separate Python repo |
| DD-02 | Bootstrap scope | Phased per Authority Pack v0.2 | pre-sprint | — |
| DD-03 | Spec completion order | §1–5 written in v0.2 | pre-sprint | — |
| DD-04 | Journey stage labels | Lock J0–J8 as-is | 2026-02-23 | 9 stages |
| DD-05 | Starter C-codes | Lock all 24 | 2026-02-23 | 22 original + 2 from research |
| DD-06 | REPLACES/MIGRATES_TO edges | Deferred post-MVP | pre-sprint | — |
| DD-07 | SUPER_APP provider type | Keep with guardrail (≥4 stages, ≥3 caps) | 2026-02-23 | — |
| DD-08 | Agent architecture | Accept three-layer, M0 parallel | 2026-02-23 | travel.aw + skills + NanoClaw |
| DD-09 | Edge ID delimiter | Double underscore `__` | 2026-02-23 | Avoids ambiguity with node ID underscores |
| DD-10 | AI_AGENT + API_PLATFORM types | Added to A6 + A9 | 2026-02-23 | MINOR version bump |
| DD-11 | Graph library for WP-3 | Custom adjacency maps, no graphology | 2026-02-24 | 59 nodes too small for library |

**No open decisions remain.** New decisions should be filed as DD-12+.

---

## 7) Risks & watch-outs (living)

- **RISK-1:** CC prompt path errors — claude.ai authored prompts with wrong file paths (spec paths vs Authority Index paths). **Mitigation:** always instruct CC to read A8 first; CC catches and corrects.
- **RISK-2:** Registry independence — adding to one registry (capabilities) doesn't update the other (provider types). **Mitigation:** when filing a DD to add to any registry, explicitly check if sibling registries need updating.
- **RISK-3:** CSV version drift — uploaded copies may differ from repo copies. **Mitigation:** always use repo copy as authoritative; verify counts before processing.
- **RISK-4:** Validator draft compatibility — ajv@8 doesn't natively support JSON Schema 2020-12. **Mitigation:** use draft-07 for all schemas. Documented in known gotchas.
- **RISK-5:** WP-3 query determinism — MVP queries must be byte-identical across runs. `graphology` or custom traversal must use stable sort at every step. **Mitigation:** determinism test (run twice, diff) is mandatory acceptance criterion.
- **RISK-6:** Agent prompt accuracy — B4 agent prompt referenced 4 non-existent capability codes (C-PAYMENT, C-FLIGHT-BOOKING, C-HOTEL-BOOKING, C-CAR-RENTAL-BOOKING). Only C-BOOKING-TXN exists in locked A5. **Mitigation:** always cross-check agent prompt references against locked registries before implementing.
- **RISK-7:** Middleware was never running before B6. Enabling it may surface auth issues in routes that were previously "accidentally public." **Mitigation:** Auth0 e2e verification before merging PR #4 to main.
- **RISK-8:** `prisma db push` used for dev — production migration needs `prisma migrate dev`. **Mitigation:** tracked in post-merge actions. Migration script has dry-run mode.
- **RISK-9:** Two-repo split (prosy/travel.aw for governance, augmented-worlds/travel.aw for V1 app) causes agent path confusion. **Mitigation:** all agent prompts must specify full absolute repo path. Codex gating proves this works.
- **RISK-10:** Next.js 16 uses `proxy.ts` convention, not `middleware.ts`. Our agent instructions assumed the old convention. CC renamed incorrectly, Codex caught the deprecation warning, CC reverted. **Mitigation:** all future middleware/proxy references must use `proxy.ts`. Add to CLAUDE.md known gotchas.

---

## 8) Daily checkpoint template (copy/paste)
### Day N checkpoint — YYYY-MM-DD
- **What we attempted (1–3 bullets):**
- **What changed (files / commits):**
- **What ran (commands / environments):**
- **Outputs (artifacts + hashes):**
- **Metrics (before/after):**
- **Gates (pass/fail + why):**
- **Decisions made / pending:**
- **Risks / watch-outs:**
- **Next 24h plan:**

---

## 9) Work Package check-in template (copy/paste under the WP)
### WP-__ — Check-in
- **Check-out scope:**
- **Changes made:**
- **Runs executed:**
- **Artifacts produced:**
- **Acceptance criteria results:**
- **Stop/pivot rationale (if any):**
- **Recommendation (next step):**

---

## 10) Abbreviations / future work (explicit list)
- ~~WP-3 query cookbook~~ ✅ Complete
- ~~M0 agent foundation~~ ✅ Complete (B1–B4, DoD PR #1 merged)
- ~~Track B security hardening~~ ✅ Complete (B1–B6, PR #4 merged + revert)
- Human gates: Auth0 e2e test → production env vars → encryption migration
- M1: First travel skills (flight-search, hotel-search)
- WP-4 graph export (post-MVP optional)
- Formalize dual-agent workflow as a repeatable process doc
- Add pre-commit guardrail preventing direct edits to locked registries without DD entry
- Consolidate two-repo split or document the boundary formally
- Add RISK-10 (Next.js 16 proxy.ts convention) to CLAUDE.md known gotchas

---
End.
