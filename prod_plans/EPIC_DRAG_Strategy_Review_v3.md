# EPIC-D-RAG-STRAT-01 — Strategy Review, Course Correction, MVP Alignment

**Owner/Agent:** Claude Code  
**Priority:** P0 (blocks efficient MVP execution)  
**Anchor:** "D‑RAG: Deterministic, auditable retrieval for safety‑critical domains."  
**Outcome:** A strategy-aligned, MVP-tight execution plan with explicit deviations, scope creep, gaps, and corrective recommendations — governed by the 3 real authorities.

---

## 0) Mandatory Bootstrap

### 0.1 Authorities (consult before any proposal that affects pipeline)

1. `pipeline_manifest.yaml` **v3.7.0** — canonical paths, artifact ownership, version tracking  
2. `Data_Contract_Deterministic_RAG_v2.md` — validation rules & thresholds (coverage ≥95%, deterministic IDs, schema rules)  
3. `notebooks_functions_inputs_outputs_v4.md` — notebook/script I/O contracts + dependency order  

**Authority path verification (MANDATORY before proceeding):**
- For each authority file, confirm it exists at the stated path.
- If multiple copies exist (Google Drive vs repo vs local), select the **authoritative** copy and record:
  - Chosen path
  - sha256 hash
  - Manifest version + `last_updated`
- If an authority file is not found at the expected path, **halt and report** — do not substitute.

**AC-0.1:** Final deliverable must include an "Authority Check" section with exact paths, hashes, and version for all three authorities.

### 0.2 Non‑Negotiable Working Rules

- **Read-first rule:** Read every strategy doc and source file in full before synthesizing. No premature conclusions.
- **No pipeline code changes.** Strategy + planning + governance only. Creating Markdown deliverables and creating the output directory (`authoritative/docs/strategy_review/`) if missing is allowed.
- **No path invention.** Manifest-declared canonical paths only. No directory scanning.
- **Bounded search only.** All file reads must be from the exact folders listed in Section 1. No broad repo-wide grep for strategy docs. If a relevant file is found outside these folders, note it as a governance issue.
- **Codex context files** (`authoritative/codex_context/`) are read-only.
- **Proposals as Markdown** with clear pros/cons where decisions are recommended.
- Mark anything **abbreviated** or **future work** explicitly.

### 0.3 Conflict Tie-Break Hierarchy

When strategy documents conflict, resolve using this deterministic hierarchy:

1. A doc that **explicitly defines MVP** (PRD with "MVP" section, formal roadmap) wins over informal docs
2. Between docs of the **same type**, the more recent one wins
3. If still conflicting after steps 1–2: flag as **🔴 Decision Required** — do not guess, do not default

---

## 1) Inputs — What to Read

### 1.1 Strategy/Planning Docs (Google Drive)

**Primary folder:**
```
~/Library/CloudStorage/GoogleDrive-gprosl@gmail.com/My Drive/Strategy/
```

**Also read (STALE — flagged for update as part of this review):**
```
~/Library/CloudStorage/GoogleDrive-gprosl@gmail.com/My Drive/Strategy UVP Convergence/
```

**Task:** Enumerate ALL files in both folders (and subfolders). Read every file completely before producing any analysis.

**AC-1.1:** Produce `STRATEGY_DOC_INDEX.md`:
- Filename and path
- Doc type (PRD / memo / roadmap / notes / etc.)
- Modified date
- 3–5 bullets: what this doc asserts (per-doc capture, no cross-doc synthesis yet)
- **Staleness flag**: mark any doc >90 days old as `⚠️ STALE — review needed`
- **Conflict flag**: if a doc contradicts another, flag both and apply tie-break hierarchy (Section 0.3)

### 1.2 Development Progress (Done/Doing/Planned)

**Sources — read ALL of these (bounded to these exact locations only):**

| Source | Location | What it tells you |
|--------|----------|-------------------|
| GitHub TASKS file | repo root or `.claude/` | Current task backlog |
| GitHub CHANGELOG | repo root | What shipped and when |
| Claude Code memory files | `.claude/` or `CLAUDE.md` | Agent context, conventions |
| Daily tracker | `/Projects/daily_tracker/` (all files) | Day-by-day work log |
| Git log (30 days) | `git log --oneline -50` | Actual commits |
| Recent EPICs | `authoritative/docs/` | Planned/active work packages |

**AC-1.2:** Produce `DEV_PROGRESS_INDEX.md`:
- Work items grouped by status: **Done** / **In Progress** / **Planned** / **Blocked**
- One-line intent per item
- Source file where each item was found
- Date of last activity

### 1.3 MVP Scope Definition

**Sources:**
- Strategy docs from 1.1 (extract MVP definitions — quote exact language)
- Daily tracker entries referencing MVP
- Any `MVP_*.md` or `*_mvp_*` files in the project

**AC-1.3:** Produce `MVP_SCOPE.md` containing:

**MVP Goals (3–7):**
- Extracted from strategy docs, normalized into goal statements
- Each goal tagged with source doc

**MVP Must-Haves (features required to launch):**
- Feature name
- Current status (Done / Partial / Not Started)
- Which pipeline stage delivers it
- Blocking dependencies

**Explicit Non-Goals / Defer List:**
- Features mentioned in strategy but explicitly NOT MVP
- Features currently in development that should be deferred (preliminary — refined in Section 3)

**Conflict resolution:** Apply tie-break hierarchy from Section 0.3. If MVP definition remains ambiguous after hierarchy, flag as **🔴 Decision Required**.

---

## 2) Strategic Alignment Check (Strategy ↔ Development)

### 2.1 Method

After reading ALL strategy docs and ALL development sources:
- Map each Done/Doing work item to:
  - **(A) Aligned** — directly supports an explicit strategy pillar/goal
  - **(B) Supporting** — enables an aligned item but isn't itself a strategy goal
  - **(C) Deviation** — contradicts strategy or pulls in a different direction
  - **(D) Ambiguous** — needs a decision

### 2.2 Output: `ALIGNMENT_MATRIX.md`

**Aligned work** table (work item → strategy pillar it supports)

**Deviations** table — for each deviation:
- Strategy statement (cite doc filename + quote)
- Conflicting work item (cite source)
- Why it's a deviation
- Impact: MVP risk / timeline / determinism / governance
- **Recommended action**: Keep / Modify / Defer / Stop
- Pros/Cons of recommendation

**Ambiguous items** — for each, propose options with pros/cons.

**Summary metrics:**
- % of last-30-day effort that is MVP-aligned
- % that is Phase 2+ (premature)
- % that is governance/infrastructure (supporting)

**AC-2.1:** Every deviation must cite specific doc + specific work item. No vague claims.

---

## 3) MVP Scope Creep Review (MVP ↔ Development)

### 3.1 Method

Compare all Done/Doing items against `MVP_SCOPE.md`:
- **In scope** — directly delivers an MVP Must-Have
- **Out of scope (scope creep)** — not in MVP Must-Haves
- **Unclear** — requires decision

### 3.2 Output: `SCOPE_CREEP_REPORT.md`

For each out-of-scope item:
- What it is and current status
- Which strategy phase it actually belongs to (Phase 1 / 2 / 3)
- Recommended disposition: **Cut / Defer / Reframe into MVP**
- Pros/Cons

**Watch for these scope creep patterns specifically:**
- Multimodal features before text retrieval is queryable by end users
- Experimental rerankers or ML before Stage-2 stabilization gates pass
- Governance/tooling sprawl not tied to MVP launch success
- Pipeline sophistication (pixel bbox conversion, visual overlays) before a user interface exists

**AC-3.1:** Every scope creep item has a recommended disposition with rationale.

---

## 4) Gap Analysis (Strategy Needs ↔ Not Yet Built)

### 4.1 Method

From strategy docs, extract every capability required for MVP success (explicit or implied). Check:
- Not in development at all
- Not included in MVP scope
- Partially built but incomplete

**Critical additional source:**
```
/Projects/daily_tracker/
```
Read all files in this folder. Cross-reference daily tracker entries against strategy requirements to identify work that was discussed/planned but never started.

### 4.2 Output: `GAP_ANALYSIS.md`

**Critical gaps** (block MVP launch or degrade safety/determinism):
- Gap description
- Why it's critical
- Proposed Epic/Story title
- High-level acceptance criteria
- Which authority it touches
- Effort estimate: S (1–2 days) / M (3–5 days) / L (1–2 weeks) / XL (2+ weeks)
- Risk if not done

**Important gaps** (material quality risk but not launch-blocking)

**Nice-to-haves** (future work — add to Defer list)

**AC-4.1:** Identify at least 3 critical gaps if they exist. If none, explicitly state "none found" with justification.

---

## 5) What Is the Next Closest Work to MVP?

This is the most important section. Answer directly.

### 5.1 Method

Given:
- What's already built (from Section 1.2)
- What MVP requires (from Section 1.3)
- What gaps remain (from Section 4)

Determine the **shortest path from current state to a working MVP** that a Mazda owner can actually use.

### 5.2 Output: `NEXT_CLOSEST_TO_MVP.md`

**Current state summary** (2–3 sentences): What works today and what doesn't.

**The critical path** — ordered list of work items that, if completed in sequence, produce a launchable MVP:

| Priority | Work Item | Depends On | Effort | Delivers |
|----------|-----------|------------|--------|----------|
| 1 | ... | ... | S/M/L | ... |
| 2 | ... | 1 | S/M/L | ... |
| ... | ... | ... | ... | ... |

**What to stop doing** — work currently active that should be paused to free capacity for the critical path.

**What to keep doing** — work currently active that IS on the critical path.

**2-week sprint plan:**
- Week 1 goals + acceptance criteria
- Week 2 goals + acceptance criteria
- What "done" looks like at the end of 2 weeks

**AC-5.1:** The critical path must end with "a non-developer Mazda owner can submit a query and receive a cited answer." If current work doesn't reach that endpoint, say so and identify what's missing.

---

## 6) Recommendations (3–5 Prioritized Actions)

### Output: `RECOMMENDATIONS.md`

Each recommendation:

```
### Rec N: [Title]

**Action:** Specific, not vague
**Owner:** GP / Claude Code / Snappy / External
**1–2 week next step:** Concrete deliverable
**Success metric / gate:** How you know it's done
**Pros:** Why do this
**Cons:** What you give up
**If deferred, what breaks:** Consequence of inaction
**Resolves:** [Section 2 deviation X / Section 3 creep item Y / Section 4 gap Z]
```

**Ordering heuristic:** Impact on time-to-MVP-launch (highest impact first).

**AC-6.1:** Every recommendation must resolve at least one finding from Sections 2, 3, or 4.

---

## 7) Consolidated Final Deliverable

Create: `EPIC_D_RAG_STRATEGY_COURSE_CORRECTION.md`

This is the **single hand-off document** Greg can share with advisors or co-founders. Structure:

1. Authority Check (versions + hashes + paths)
2. Strategy Summary (synthesized only after all docs fully read)
3. Strategic Alignment: Deviations (from Section 2)
4. MVP Scope Creep (from Section 3)
5. Gap Analysis (from Section 4)
6. **Next Closest Work to MVP** (from Section 5) ← most important section
7. Recommendations (from Section 6)
8. Proposed 2-Week Sprint Plan
9. Defer List (everything explicitly parked)
10. Decision Log (any stop/defer with crisp rationale; any 🔴 Decision Required items)
11. Abbreviations / Future Work (explicitly marked)

**AC-7.1:** Readable as a standalone artifact. No assumptions about reader context.

---

## 8) Parking Lot 🅿️

Items identified but explicitly deferred from this EPIC:

| Item | Why Deferred | When to Revisit |
|------|-------------|-----------------|
| Strategy UVP Convergence doc rewrite | Flagged as stale; needs GP input on updated positioning | Post-MVP sprint |
| I/O contract doc update to v5 | Governance overhead; current v4.2 sufficient for MVP | Post-MVP hardening sprint |
| Golden registry expansion beyond 4 docs | Useful but not MVP-blocking | Post-MVP |

---

## 9) Definition of Done

- [ ] Authority path verification complete (path + hash for all 3 authorities)
- [ ] All source files read (Sections 1.1–1.3 + development sources)
- [ ] Read-first rule honored (no synthesis until all docs read)
- [ ] `STRATEGY_DOC_INDEX.md` produced
- [ ] `DEV_PROGRESS_INDEX.md` produced
- [ ] `MVP_SCOPE.md` produced
- [ ] `ALIGNMENT_MATRIX.md` produced
- [ ] `SCOPE_CREEP_REPORT.md` produced
- [ ] `GAP_ANALYSIS.md` produced
- [ ] `NEXT_CLOSEST_TO_MVP.md` produced
- [ ] `RECOMMENDATIONS.md` produced
- [ ] `EPIC_D_RAG_STRATEGY_COURSE_CORRECTION.md` produced (consolidated)
- [ ] Every deviation, scope creep item, and gap explicitly enumerated
- [ ] All 🔴 Decision Required items collected in Decision Log
- [ ] Recommendations are actionable, prioritized, and tied to findings
- [ ] No pipeline code changes made
- [ ] Appendix lists every file reviewed with path and date
