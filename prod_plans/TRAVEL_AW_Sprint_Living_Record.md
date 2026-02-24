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

## 2) Current diagnosis (end of 2026-02-23 session)
- **Track A is 1 WP from MVP complete.** WP-0/1/2 done. WP-3 (query cookbook) is the only remaining deliverable.
- **Track C has not started.** M0 stories (B1–B4) are defined but unexecuted. No cross-dependency with WP-3.
- **Track B is scoped but deferred.** Combined PRD (A20) defines B1–B6 security requirements. Independent of Track A/C.

Sprint levers:
1. WP-3 query cookbook → completes Track A MVP
2. M0 agent foundation → parallel, unblocks M1 first skills
3. Track B security → independent, highest shipped-value potential

---

## 3) Work Package status (update this first)

### Track A — Ecosystem Graph (SSOT)
| WP | Description | Status | Commit(s) | Notes |
|---:|---|---|---|---|
| WP-0 | Bootstrap (A1–A8) | ✅ Complete | pre-existing | 8 authority files |
| WP-1 | Schemas & Validation (A9–A13, A17) | ✅ Complete | `9bc880d` | 10 integrity checks, ajv, deterministic |
| WP-2 | Seed Dataset (A14–A15) | ✅ Complete | `1b64020`, `7a494c0` | 59 nodes, 118 edges, 24/24 C-codes |
| WP-3 | Query Cookbook | ⏳ Next | — | 5 MVP queries from Spec §6.2 |
| WP-4 | Graph Export (optional) | ⏳ Post-MVP | — | Neo4j/CSV export, browse UI |

### Track C — Agent Foundation (M0)
| Story | Description | Status | Commit(s) | Notes |
|---:|---|---|---|---|
| B1 | StopCrabs Supabase investigation | ⏳ Next | — | Discovery; timebox 2hr |
| B2 | Fork NanoClaw → travel-aw/nanoclaw | ⏳ Pending | — | Clean fork, verify builds |
| B3 | Skills repo + StopCrabs CI gate | ⏳ Pending | — | Depends on B1 |
| B4 | Travel-specific rules (TRAVEL-001/002/003) | ⏳ Pending | — | Depends on B1, B3 |

### Track B — V1 Web App Security
| Req | Description | Status | Notes |
|---:|---|---|---|
| B1 | Auth & authz consistency | ⏳ Not started | All user routes gated |
| B2 | Trips with userId=null | ⏳ Not started | No public read default |
| B3 | Inbound email webhook auth | ⏳ Not started | Shared secret + payload limits |
| B4 | PII encryption at rest | ⏳ Not started | IV management, fail closed |
| B5 | LLM endpoint hardening | ⏳ Not started | Size limits, schema validation |
| B6 | Repo drift / CI alignment | ⏳ Not started | Middleware + pnpm version |

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

**No open decisions remain.** New decisions should be filed as DD-11+.

---

## 7) Risks & watch-outs (living)

- **RISK-1:** CC prompt path errors — claude.ai authored prompts with wrong file paths (spec paths vs Authority Index paths). **Mitigation:** always instruct CC to read A8 first; CC catches and corrects.
- **RISK-2:** Registry independence — adding to one registry (capabilities) doesn't update the other (provider types). **Mitigation:** when filing a DD to add to any registry, explicitly check if sibling registries need updating.
- **RISK-3:** CSV version drift — uploaded copies may differ from repo copies. **Mitigation:** always use repo copy as authoritative; verify counts before processing.
- **RISK-4:** Validator draft compatibility — ajv@8 doesn't natively support JSON Schema 2020-12. **Mitigation:** use draft-07 for all schemas. Documented in known gotchas.
- **RISK-5:** WP-3 query determinism — MVP queries must be byte-identical across runs. `graphology` or custom traversal must use stable sort at every step. **Mitigation:** determinism test (run twice, diff) is mandatory acceptance criterion.

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
- WP-3 query cookbook (Track A MVP completion)
- M0 agent foundation (Track C — NanoClaw fork, skills repo, StopCrabs CI, travel rules)
- Track B security hardening (B1–B6 from Combined PRD A20)
- Formalize dual-agent workflow as a repeatable process doc
- Add pre-commit guardrail preventing direct edits to locked registries without DD entry
- Investigate graphology vs custom TS traversal for WP-3 (lightweight spike)
- WP-4 graph export (post-MVP optional — Neo4j/CSV, browse UI)

---
End.
