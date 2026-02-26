# EPIC-D-RAG 5-Day Sprint (v1.1) — Living Record + Master Plan Addendum
Date created: 2026-02-23 (America/Los_Angeles)  
Status: **Active — update in place**  
Owner: Human orchestrator (you)  
Purpose: **Human-readable, auditable running record** of sprint work, decisions, risks, and next steps.  
Rule: **Append-only mindset** (edit for clarity, but preserve history via dated notes).

---

## 0) Authorities (Read-order, non-negotiable)
1. **pipeline_manifest.yaml (v3.7.0)** — canonical paths, artifact ownership, versioning  
2. **Data_Contract_Deterministic_RAG_v2.md** — schema + determinism + QA gates (coverage ≥95%)  
3. **notebooks_functions_inputs_outputs_v4.md** — notebook I/O contracts + stage-to-stage flow  

**Operating constraints**
- No directory scanning. No silent fallbacks. Missing canonical artifact ⇒ **fail-fast**.
- Any neural component is allowed **only if pinned + auditable** (model + tokenizer + runtime + commands).
- `authoritative/codex_context/` is **read-only** during working sessions.
- Proposals and fixes as **Markdown first**; code only after approach alignment.

---

## 1) Sprint goals (v1.1)
- **SectionMatch@1 ≥ 70%** (≥ 26/37)
- **GT-in-top-20 ≥ 90%** (≥ 34/37)
- Evidence UX readiness:
  - ICD + WARNING/CAUTION images render
  - citations never break

---

## 2) Current diagnosis (from 2026-02-22 wrap-up)
- Ranking is the bottleneck more than recall (**GT-in-top-20 materially higher than SectionMatch@1**).
- Failure buckets:
  - **SCORE-POLICY** (ranking failures with GT already in candidate set)
  - **RETRIEVAL-GAP** (GT absent from top-20)

Sprint levers:
1) Cross-encoder reranking → fix SCORE-POLICY  
2) Hybrid recall → fix RETRIEVAL-GAP  
3) Evidence UX hardening → prevent demo/runtime breaks  

---

## 3) Work Package status (update this first)
| WP | Stream | Status | Primary artifact(s) | Notes |
|---:|---|---|---|---|
| A0 | Cross-encoder | ✅ Complete | `PINNING_RECORDS/WP-A0_PINNING_RECORD.md` | Model pinned; determinism smoke test logged |
| A1 | Cross-encoder | 🧪 **Spec PROPOSED** | `WP-A1_section_text_spec.md` | Deterministic `section_text` spec written; pending alignment |
| A2 | Cross-encoder | ⏳ Pending | `rerank_results.jsonl` | Offline rerank SCORE-POLICY cohort (depends on D2 → D3) |
| B0 | Hybrid recall | 🧪 **Spec PROPOSED** | `WP-B0_hybrid_design_note.md` | Hybrid recall design note written; pending alignment |
| C0 | Evidence UX | 🧪 **Spec PROPOSED** | `WP-C0_evidence_bundle_contract.md` | Evidence bundle contract written; pending alignment |

**Legend:** ✅ complete · ⏳ next/pending · 🧪 in progress · 🛑 blocked

---

## 3.1) Alignment agenda (today)
- **Approve / adjust D2** (section_text spec) → unblocks **D3 / WP-A2**.
- **Approve / adjust D4** (hybrid recall spec) → unblocks **WP-B1**.
- **Approve / adjust D5** (evidence bundle v1.3 contract) → unblocks **WP-C1**.
- Confirm any missing sub-decisions to pin (RRF params, tokenizer truncation rule, citation minimum fields).

## 4) Sprint folder SSOT + provenance pointers
Sprint folder (repo):  
`authoritative/docs/sprints/20260223_epic_d_rag_5day/`

**Files present (as of commit `abfa4b1`)**
- `MASTER_PLAN.md`
- `RUN_LEDGER.md` (includes R001 smoke test)
- `DECISION_LOG.md` (D-CE-01 ACCEPTED; D1 locked; D2–D5 pending)
- `POLICY_BRIDGE_NOTE.md`
- `PINNING_RECORDS/WP-A0_PINNING_RECORD.md`
- `CHECKPOINTS/.gitkeep`

---

## 5) Running log (append dated entries)
> Copy/paste agent check-ins here. Keep raw check-in text, then add a short “Orchestrator notes” section.

### 2026-02-23 — Step 1–2 complete; commit + push
**What happened**
- Sprint folder scaffold created under authoritative docs sprint path (SSOT).
- WP-A0 completed: cross-encoder selection + pinning record created.
- Commit: `abfa4b1` pushed to `origin/main`.

**WP-A0 selection (as reported in session check-in)**
- Selected: `cross-encoder/ms-marco-MiniLM-L-6-v2` @ revision `c5ee24c`
- Determinism gate: **PASS**, SHA256 stable across 2 runs (`6a2c50e3e37cb839`)
- Libraries: `torch==2.10.0`, `transformers==5.2.0`, `sentence-transformers==5.2.3`
- Upgrade path if needed: BGE reranker variant (to be pinned if invoked)

**Orchestrator notes (add/adjust)**
- ✅ Good: model pinned + determinism validated early.
- ⚠️ Watch-out: ensure pinning record also captures **where weights came from** (HF snapshot / commit), plus CPU/OS/runtime details to explain any drift.
- 📌 Next: proceed with **WP-A1** (section_text spec) and parallel **WP-B0 / WP-C0** (design notes only).


### 2026-02-23 — Day 1 WP specs written (PROPOSED; pending approach alignment)
**What happened**
- CC delivered **three WP specs**: **WP-A1**, **WP-B0**, **WP-C0** (all **PROPOSED**, awaiting alignment).
- Decision log updated: **D1 LOCKED**; **D2/D4/D5 PROPOSED**; **D3 PENDING** (depends on D2 approval → WP-A2).

#### WP-A1 — Deterministic `section_text` spec (PROPOSED)
**Spec**
- Build `section_text` by concatenating chunks sorted by **(page_idx, order_in_section, chunk_id)** with `\n` separator.
- `max_chars = 1500`; truncate at word boundary; **min fragment 50 chars**.
- **Pure function** (reads existing chunks; no upstream mutation).
- 3 sample sections included: **cruise control**, **door locks**, **engine oil**.

**Orchestrator notes (pros/cons + watch-outs)**
- ✅ Strong: ordering keys are deterministic and stable under the contract.
- ⚠️ Watch-out: `max_chars` ≠ `max_tokens`. Char-count truncation can still overflow a 512-token window depending on text mix.
  - **Mitigation (recommended):** keep `max_chars` as the *spec surface* for now, but add an *implementation note* that final truncation may be token-aware using the **pinned tokenizer** (still deterministic under WP-A0 pinning discipline).
- ⚠️ Confirm `order_in_section` is present everywhere (or define a fallback ordering explicitly). If absent, document deterministic fallback.

#### WP-B0 — Hybrid recall design note (PROPOSED)
**Spec**
- Target RETRIEVAL-GAP QIDs: **Q80, Q90, Q99, Q100, Q103, Q110**.
- Candidate generation: **BM25 top-50** + **BGE-M3 dense top-50** → **RRF fusion** → **top-20**.
- Dense index: **FAISS IndexFlatIP** (exact search; no approximation) for determinism.
- Uses the **same corpus as BM25** (no new data); same pinning discipline as WP-A0.
- Targets: **≥3/6 conversions**, **GT-in-top-20 ≥ 90%**.

**Orchestrator notes (pros/cons + watch-outs)**
- ✅ Strong: exact FAISS avoids ANN nondeterminism and makes regressions interpretable.
- ⚠️ Watch-out: “deterministic” embeddings still require strict pinning **and** runtime controls (threads, BLAS, CPU kernels).
  - **Mitigation:** document env constraints (single-thread, fixed seeds where applicable, pinned FAISS build).
- ⚠️ RRF needs pinned parameters (e.g., `k`) and deterministic tie-breakers. Ensure the spec states them (or mark as D4 sub-decision).

#### WP-C0 — Evidence bundle contract (PROPOSED)
**Spec**
- Bundle **v1.3** adds: **citation (mandatory)**, `safety_attachments` (DD-13), `media_attachments` with `render_ref`.
- Fallback hierarchy: **full evidence > safety+citation > citation-only > NEVER empty**.
- Page normalization: **0-based `page_idx` everywhere**, validated at build time.
- Backward compatible: **new fields only**, no removals; no upstream schema changes required.

**Orchestrator notes (pros/cons + watch-outs)**
- ✅ Strong: explicit fallback hierarchy prevents “blank bundle” failures during demo/UX.
- ⚠️ Watch-out: “mandatory citation” must be defined precisely (what constitutes a citation when evidence is missing?).
  - **Mitigation:** require at least `doc_id`, `section_number`, `page_idx` (and optionally `chunk_id`) in the citation record.
- ⚠️ Backward compatibility depends on downstream readers ignoring unknown fields. Confirm web/Streamlit layer behavior.

---

## 6) Decisions (pros/cons + current lock state)
> Add new decisions here; keep them terse. Link to `DECISION_LOG.md` in sprint folder when possible.

### D-CE-01 — Neural layer allowed if pinned + auditable (LOCKED)
**Decision**
- Allow cross-encoder + hybrid (dense) layers **only** if fully pinned and auditable; baseline preserved.

**Pros**
- Enables fast lift on ranking failures without rewriting parsing.
- Keeps determinism governance intact (pinning record discipline).

**Cons**
- Adds operational surface area (model+runtime variance).
- Risk of “rerank treadmill” without stop rules.

**Future work**
- Promote this policy bridge into a formal Architecture Decision post-sprint.

---

### D1 — Cross-encoder model/runtime (LOCKED)
**Decision**
- Model selected + pinned in WP-A0.

**Pros**
- Small model: fast iteration; good for SCORE-POLICY lift experiments.
- Determinism smoke test already performed.

**Cons**
- MS MARCO bias risk: may prefer generic procedural passages over safety nuance.
- May plateau; upgrade path must preserve pinning rigor.

**Future work**
- Only evaluate a second model if WP-A2 fails to convert (per sprint rules).

---

### D2 — Deterministic `section_text` (PROPOSED)
**Decision**
- Represent candidate sections for reranking as a deterministic concatenation of chunk texts.

**Proposed spec (from WP-A1)**
- Sort chunks by **(page_idx, order_in_section, chunk_id)**.
- Concatenate with `
`.
- Truncate to `max_chars=1500`, word-boundary truncation, **min fragment 50 chars**.
- Pure function (no upstream mutation); includes 3 sample sections.

**Pros**
- Stable input construction enables consistent rerank scoring + ON/OFF evaluation.
- Minimal integration risk (read-only over existing chunked corpus).

**Cons / watch-outs**
- Char-based truncation may not map cleanly to model token windows; risk of overflow.
- Requires a deterministic definition for `order_in_section` (and fallback if missing).

**Mitigation**
- Allow token-aware final truncation using the **pinned tokenizer** (still deterministic under WP-A0 pinning discipline).
- Specify tie-break + fallback ordering explicitly if `order_in_section` missing in any corpus slice.

**Owner / next**
- Accept/reject this spec today; if accepted, unblock **D3 → WP-A2**.


### D3 — Offline rerank harness scope (PENDING; depends on D2 approval)
**Decision needed**
- Rerank only existing top-20 candidate lists for SCORE-POLICY cohort (no plumbing).

**Pros**
- Fast proof of lift; minimal integration risk.

**Cons**
- Won’t fix RETRIEVAL-GAP.

**Stop rule**
- 2 consecutive 0-lift runs in same class ⇒ stop + propose pivot.

---

### D4 — Hybrid recall constraints (PROPOSED)
**Decision**
- Add a bounded dense-recall channel to convert RETRIEVAL-GAP queries, fused deterministically with BM25.

**Proposed spec (from WP-B0)**
- RETRIEVAL-GAP cohort: **Q80, Q90, Q99, Q100, Q103, Q110**.
- Generate candidates: **BM25 top-50** + **BGE-M3 dense top-50**.
- Fuse with **RRF** → take **top-20**.
- Dense index: **FAISS IndexFlatIP** (exact) for determinism.
- Same corpus as BM25; no new data. Same pinning discipline as WP-A0.

**Pros**
- Directly targets “GT absent from top-20” failures without touching parsing.
- Exact search keeps evaluation interpretable and reduces stochastic regressions.

**Cons / watch-outs**
- Determinism requires more than “exact FAISS”: thread scheduling / BLAS / CPU kernels can drift.
- RRF parameters (`k`, tie-breakers) must be pinned to avoid silent behavior changes.

**Mitigation**
- Extend pinning record to include: FAISS build, embedding model revision, thread env settings, fusion params.
- Define deterministic tie-breakers for fused scores.

**Owner / next**
- Align on model + fusion params today; if accepted, proceed to **WP-B1** implementation (behind a flag).


### D5 — Evidence bundle minimum viable contract (PROPOSED)
**Decision**
- Define a backward-compatible bundle schema extension that guarantees renderability and never returns an empty bundle.

**Proposed spec (from WP-C0)**
- Bundle **v1.3** adds:
  - `citation` (**mandatory**)
  - `safety_attachments` (DD-13)
  - `media_attachments` containing `render_ref`
- Fallback hierarchy: **full evidence > safety+citation > citation-only > NEVER empty**
- Normalize to **0-based `page_idx` everywhere**, validate at build time.
- Backward compatible: **additive only**; no upstream schema changes required.

**Pros**
- Prevents demo/UX failures where bundles render blank.
- Keeps schema evolution low-risk (additive).

**Cons / watch-outs**
- “Mandatory citation” must be formally defined (minimum fields and validity rules).
- Backward compatibility depends on all consumers ignoring unknown fields.

**Mitigation**
- Minimum citation fields: `{doc_id, section_number, page_idx}` (+ optional `chunk_id`).
- Add a lightweight consumer-compat check (post-sprint if needed).

**Owner / next**
- Align today; if accepted, proceed to WP-C1 build + render smoke tests.


## 7) Risks & watch-outs (living)
> Keep this short; add only high-signal items.

- **RISK-1:** “Stabilization baseline” vs “neural allowed” confusion → mitigated by `POLICY_BRIDGE_NOTE.md`.
- **RISK-2:** Cross-encoder drift (runtime/kernel variance) → mitigated by explicit pinning + repeatable smoke tests logged in RUN_LEDGER.
- **RISK-3:** Evidence UX breaks due to page indexing mismatches → mitigated by canonical `page_idx` normalization rule in WP-C0.
- **RISK-4:** Codex context drift → enforce read-only rule; consider adding a guardrail (pre-commit) after sprint.

(Abbrev) Add more only when observed in failures.

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
### WP-__ (e.g., WP-A1) — Check-in
- **Check-out scope:**
- **Changes made:**
- **Runs executed:**
- **Artifacts produced:**
- **Acceptance criteria results:**
- **Stop/pivot rationale (if any):**
- **Recommendation (next step):**

---

## 10) Abbreviations / future work (explicit list)
- Formalize Policy Bridge into an Architecture Decision post-sprint.
- Add a “treadmill prevention” rubric (max rerank attempts, required delta thresholds).
- Add guardrail preventing edits under `authoritative/codex_context/` (post-sprint).
- Expand Evidence UX beyond “renderable” into UI polish and multi-asset layouts (post-sprint).

---
End.
