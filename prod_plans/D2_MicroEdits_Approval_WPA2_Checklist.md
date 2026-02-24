# D2 Micro-Edits + Approval to Commit + WP-A2 Checklist (copy/paste)

## 1) Micro-edits to add to D2 (LOCKED) entry
Add the following two lines (or equivalent) to remove the last ambiguities and make D2 maximally testable.

### Micro-edit A — Deterministic “top-supporting chunk” selection
**Top-supporting chunk selection:** Determine support score per chunk (per WP-A2 method). Select the **highest** support score; tie-break deterministically by **(page_idx ASC, chunk_id ASC)**.

> If the support method is not yet implemented, set a temporary deterministic proxy (e.g., lexical overlap score), but keep the same tie-break rule.

### Micro-edit B — Token budget / truncation strategy is fixed
**Token budget rule:** `max_tokens=490` applies to the **section_text portion** in a fixed (query, section_text) pair, with truncation strategy **truncate section_text only** (query preserved). Remaining tokens are reserved for query + special tokens.

---

## 2) Approval to commit (ready to proceed)
✅ **Approved to commit** D2 with the above micro-edits.  
After commit + push, proceed to **D3 / WP-A2** (offline rerank harness).

Suggested commit message:
- `docs(sprint): tighten D2 lock — deterministic supporting-chunk tie-break + fixed token budget rule`

---

## 3) WP-A2 Offline Checklist (short, testable)
Use this checklist as the WP-A2 acceptance/exit criteria.

### Inputs (bounded)
- [ ] Use existing candidate sets for SCORE-POLICY cohort (no new recall plumbing).
- [ ] Use pinned cross-encoder per WP-A0 and the D2 `section_text` definition (v1.1+ micro-edits).

### Determinism & auditability
- [ ] `ranking_context` emitted for **every** reranked candidate:
  - [ ] `section_text_sha256`
  - [ ] `policy` enum (`full_section`)
  - [ ] truncation params (`max_chars=1500`, `max_tokens=490`)
  - [ ] `tokenizer_ref`
- [ ] Repeat-run determinism smoke: rerank output hash stable across 2 runs (same environment/pins).

### Token safety (hard gate)
- [ ] **Zero** over-512 token pair events (query+section_text) after token hard gate.
- [ ] Fail-fast behavior verified if tokenizer unavailable (expected error path).

### Evidence-alignment gate behavior
- [ ] Gate check implemented and logged:
  - [ ] Winner bundle includes **≥1** top-supporting chunk (or its page).
  - [ ] If missing, bounded expansion triggers deterministically (max +2 pages) and resolves.
- [ ] Report gate activation rate (how often expansion was needed) + a few examples.

### Effectiveness (SCORE-POLICY conversions)
- [ ] Run on the 9 SCORE-POLICY QIDs (or current defined set).
- [ ] Report before/after:
  - [ ] SectionMatch@1 conversions attributable to rerank
  - [ ] Any regressions (should be 0 for the cohort scope)
- [ ] Target: ≥3/9 conversions offline (or whatever the sprint doc specifies).

### Outputs (artifacts)
- [ ] `rerank_results.jsonl` (or defined artifact name) produced with provenance header.
- [ ] Short summary note: conversions, any edge cases, gate activation, determinism hashes.

---
End.
