EPIC-D-RAG 5-Day Sprint Master Plan (v1)

Purpose: Rescope into a 5-day, tightly-orchestrated sprint with strict check-in/out gates to prevent over-engineering, rerank treadmill, and parallel-work drift.

0) Non-Negotiables
Authorities (must consult before coding)

pipeline_manifest.yaml (v3.7.0) — canonical paths, artifact ownership, versioning

Data_Contract_Deterministic_RAG_v2.md — schema + QA thresholds (coverage ≥95%, deterministic IDs, provenance)

notebooks_functions_inputs_outputs_v4.md — stage IO contracts + dependency order

Hard rules

No directory scanning. Only manifest-declared paths/artifacts.

No silent fallbacks. Missing canonical artifacts = fail-fast.

“No LLM in extraction pipeline” remains in force.

Neural models allowed only for retrieval/reranking if pinned (weights+tokenizer+runtime) and auditable.

Every session must: Check-out → bounded work → Check-in (see §2).

1) Sprint Goal, Metrics, and Scope
Goal (5 days)

Ship an MVP-ready retrieval stack that produces high-quality answers for friends/family/coworkers/peers with:

Right answers (primary)

Natural-language wrapper (secondary)

WARNING/CAUTION images + ICD images

Citation link always (bundle or direct)

Baseline (current)

GT-in-top-20 (BM25 recall): 83.8% (31/37)

SectionMatch@1 (post heuristic rerank): 59.5% (22/37)

Failure buckets: 9 SCORE-POLICY, 6 RETRIEVAL-GAP (2 excluded)

5-Day Targets (realistic)

SectionMatch@1 ≥ 70% on evaluable set (37)

GT-in-top-20 ≥ 90% on evaluable set (37)

Evidence UX: ICD + WARNING/CAUTION images render reliably for applicable answers

Anything beyond these targets is “bonus,” not required.

In / Out (explicit)

IN (this sprint)

Cross-encoder section reranker to convert SCORE-POLICY failures

Hybrid BM25+dense (candidate recall) to reduce RETRIEVAL-GAP failures

Minimal multimedia enrichment required for ICD + WARNING/CAUTION evidence bundles, including deterministic attachment + renderability

OUT (this sprint)

GraphRAG as primary retrieval (Phase 2)

Structured/API-first as primary solution (Phase 2, driven by real query distribution)

Any new governance “systems” not required by this sprint’s gates

2) Orchestration: Human-in-the-Loop Check-in/Out (Mandatory)
Roles

Human Orchestrator (you): owns master plan, approves check-out/check-in, merges decisions

Agent Leads: CC1 (Reranker), CC2 (Hybrid), CC3 (Evidence UX)

Sub-agents: tightly-scoped WPs under each lead (no free-roaming work)

Master Sprint Folder (SSOT for this sprint)

Create a bounded sprint folder (manifest-bounded; no guessing). Example:

authoritative/docs/sprints/YYYYMMDD_epic_d_rag_5day/

MASTER_PLAN.md

RUN_LEDGER.md (every run logged)

DECISION_LOG.md (policy + scope decisions)

CHECKPOINTS/ (daily check-in bundles)

Check-out protocol (start of every session)

Session cannot start until the human provides:

WP ID (e.g., WP-A2)

Allowed file boundaries (paths)

Expected deliverables (filenames)

Acceptance criteria checklist

Stop rule / timebox

Agent must reply: “✅ Checked out WP-__” and restate boundaries.

Check-in protocol (end of every session)

Agent must deliver one check-in bundle:

What changed (diffstat summary)

Commands/runs executed + output paths

Metrics before/after (only relevant ones)

Acceptance criteria PASS/FAIL + evidence

Blocks + next handoff

Human accepts only by writing: “✅ Checked in WP-__” (or rejects with reasons).
Stop rule: if AC not met by timebox → stop and check in partial results + diagnosis.

3) Workstreams and Work Packages (Agent / Sub-agent / Multi-agent)
Workstream A — Cross-Encoder Section Reranker (Primary ROI)

Owner: CC1 (Lead)
Objective: Convert 9 SCORE-POLICY queries (GT in top-20 but wrong rank-1).

WP-A0 (Multi-agent, 30–60 min): Policy + pinning agreement

Choose reranker model family + pinning requirements

Define reproducibility expectations (rank stability > exact score equality)

AC: Decision recorded in DECISION_LOG.md with model+version+pinning strategy.

WP-A1 (CC1): Deterministic section_text representation

Define deterministic section_text used for reranking:

Option: concat top-N chunk texts per section (N fixed), or deterministic section digest (non-LLM)

Ensure provenance fields remain intact (section_number, chunk_ids, page_idxs)

AC: Spec + sample output for 3 sections.

WP-A2 (CC1 Sub-agent A2a): Offline rerank harness

Take existing top-20 candidates; compute cross-encoder scores for (query, section_text)

Output reranked list per query (no pipeline integration yet)

AC: Runs on SCORE-POLICY cohort (9 QIDs) and produces rerank_results.jsonl.

WP-A3 (CC1 + CC2, Multi-agent): Integrate behind a flag + gate

Integrate reranker behind a flag (OFF by default unless enabled explicitly)

Deterministic logging + provenance preserved

AC: End-to-end eval run shows SectionMatch@1 delta; determinism/provenance gates pass.

Workstream B — Hybrid Candidate Recall (Secondary ROI, needed for 6 RETRIEVAL-GAP)

Owner: CC2 (Lead)
Objective: Reduce 6 RETRIEVAL-GAP queries where GT is absent from BM25 top-20.

WP-B0 (CC2): Hybrid design decision (minimal viable)

Pick dense model (e.g., BGE-M3 class) + index approach

Prefer simplest deterministic build feasible in 5 days (pin model + index recipe)

AC: 1-page design note + artifact list (and manifest update plan if needed).

WP-B1 (CC2 Sub-agent B1a): Dense index build (bounded)

Build embeddings for corpus text (including multimedia-enriched text when available)

Produce deterministic index artifact with hashes logged

AC: Index build completes; rerunnable with identical inputs; artifacts recorded.

WP-B2 (CC2): Fusion (RRF) + candidate union

BM25 top-K ∪ dense top-K → fused top-20

Feed fused top-20 into Workstream A reranker (if enabled)

AC: RETRIEVAL-GAP cohort shows improved GT-in-top-20.

Workstream C — Evidence Bundle UX Readiness (ICD + WARNING/CAUTION)

Owner: CC3 (Lead)
Objective: ICD + WARNING/CAUTION images are deterministically attached and renderable in MVP UX.

WP-C0 (CC3): Minimal evidence bundle contract for MVP UX

Define minimum fields UI needs:

citations, page refs, image pointers (ICD + warning/caution), fallbacks
No schema churn unless justified.

AC: Minimal schema doc + mapping to existing artifacts.

WP-C1 (CC3 Sub-agent C1a): Deterministic attachment rules + QA

Ensure extracted media links to section_number/chunk_id/page_idx deterministically

QA report: attachment coverage %, top orphan pages, sample render list

AC: QA report PASS with explicit thresholds; orphan list produced.

WP-C2 (CC3 + CC1, Multi-agent): “Bundle present or citation link” rule

If applicable: bundle includes ICD/warning images

Else: citation link always present

No broken references

AC: 10-query smoke checklist PASS (≥3 safety queries included).

4) 5-Day Schedule (Incremental Endpoints)
Day 1 — Lock decisions + offline rerank proof

WP-A0, WP-A1, WP-A2
Endpoint: Offline rerank converts ≥3/9 SCORE-POLICY queries.

Day 2 — Integrate reranker behind a flag + regression gates

WP-A3
Endpoint: Full eval ON/OFF shows lift; determinism/provenance gates pass.

Day 3 — Hybrid for RETRIEVAL-GAP cohort

WP-B0, WP-B1 (or partial), WP-B2
Endpoint: ≥3/6 RETRIEVAL-GAP now have GT in fused top-20.

Day 4 — Evidence bundle UX readiness

WP-C0, WP-C1, WP-C2
Endpoint: UI renders ICD + warning/caution images where applicable; citations never break.

Day 5 — Consolidation + “done” demo pack

Final run: hybrid+rerank (as approved) + evidence bundles

Final report + next sprint backlog
Endpoint: Targets met, or shortfall explained with measured next plan + stop rules.

5) Tight Controls (to prevent last week’s waste)
Experiment stop rules

Every experiment must pre-register: hypothesis, cohort QIDs, expected lift, timebox

Two consecutive “0 net lift” runs in the same class → stop and pivot.

Scope controls

No new governance docs unless required by a gate

No rerank variants once cross-encoder baseline is established (avoid infinite tweaking)

Integration controls

Enabling work is “Done” only when it:

moves the measured metric for its cohort, or

is renderable in the MVP UX

6) Daily Standup Template (Human)

Yesterday: WPs checked in

Today: WPs checked out + owners

Gates: metrics that must move today

Risks/blocks: one-liners

Decisions needed: yes/no only

7) Definition of Done (Sprint)

SectionMatch@1 ≥ 70% (22/37 → ≥ 26/37) OR justified shortfall with measured next step plan

GT-in-top-20 ≥ 90% (31/37 → ≥ 34/37)

Evidence bundles: ICD + WARNING/CAUTION images render where applicable; citations always work

Run ledger + decision log complete; no uncontrolled drift

Next: how to run this starting today (suggested check-outs)

Check-out WP-A0 (multi-agent) — lock cross-encoder policy + pinning rules

Check-out WP-A1 + WP-A2 to CC1 — get offline rerank proof on the 9 QIDs

In parallel, Check-out WP-B0 to CC2 — hybrid design note constrained to RETRIEVAL-GAP cohort

In parallel, Check-out WP-C0 to CC3 — minimal evidence bundle contract for ICD + WARNING/CAUTION

If you want, paste your preferred sprint folder path (Drive/repo), and I’ll tailor the folder conventions + exact filenames to match your existing authority layout.