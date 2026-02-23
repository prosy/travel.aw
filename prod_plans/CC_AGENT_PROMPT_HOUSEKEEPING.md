# TRAVEL.aw — Claude Code Agent Instructions: Housekeeping
**Paste into Claude Code CLI**

---

```
Execute the TRAVEL.aw housekeeping plan. All 5 tasks in a single commit. Read each authority file BEFORE editing it.

## HK-1: Fix spec path drift
- In the Authority Index (A8), find the A1 entry referencing ECOSYSTEM_SPEC_v0_1.md
- Update the path to ECOSYSTEM_SPEC_v0_2.md
- Verify the file actually exists at the corrected path

## HK-2: Add DD-08 to DECISIONS.md
- Open DECISIONS.md (A2)
- Confirm DD-06 still says "REPLACES/MIGRATES_TO edge types" with status Deferred — do NOT change it
- Add DD-08 as a new entry:
  - ID: DD-08
  - Decision: "Agent architecture: accept three-layer model (travel.aw web front-door + private StopCrabs-vetted skills registry + NanoClaw container-isolated runtime)?"
  - Status: Open
  - Notes: "Proposed in PRD v0.1 (prod_plans/). Three security gates. See SESSION_KICKOFF_2026-02-22.md."

## HK-3: Add 2 C-codes to capabilities registry
- Open capabilities_registry.json (A5)
- Add these two entries maintaining existing format and alphabetical/grouped ordering:
  1. C-AI-AGENT: label "AI Travel Agent", description "Autonomous or semi-autonomous AI agent that plans, books, or manages travel on behalf of the user.", defaultJourneyStages ["J1","J2","J3","J6"], status "candidate"
  2. C-API-PLATFORM: label "API / GDS Platform", description "Backend infrastructure platform providing programmatic access to travel inventory (flights, hotels, cars) via API or GDS protocols.", defaultJourneyStages ["J3"], status "candidate"
- Verify final count is 24 entries
- Do NOT remove C-ACTIVITY-SEARCH — it stays

## HK-4: Index prod_plans/ documents in Authority Index
- Open Authority Index (A8)
- Add three new authority entries:
  - A14: path to TRAVEL_ECOSYSTEM_NODES_RESEARCH_v0_1.csv in prod_plans/, description "Ecosystem research data (95 ranked nodes, 23 C-codes, 70+ sources). Seeds WP-2 nodes.jsonl.", phase WP-2
  - A15: path to PRD_TravelAW_Secure_Agent_Architecture_v0_1.md in prod_plans/, description "Agent architecture PRD — three-layer model, M0-M5 milestones, Track C scope.", phase WP-0 reference
  - A16: path to TRAVEL_aw_COMBINED_PRD_2026-02-23.md in prod_plans/, description "Combined PRD — Track A (ecosystem graph) + Track B (V1 web app security). B1-B6 requirements.", phase WP-0 reference
- Add precedence note: "A15 and A16 (PRDs) sit at Spec-level precedence — registries and schemas override on conflict."
- Do NOT index SESSION_KICKOFF files — they are ephemeral session artifacts

## HK-5: Update Ecosystem Spec open decisions table
- Open the Ecosystem Spec v0.2 (A1), section 12 (Open Decisions)
- Add DD-08 row: ID DD-08, Decision "Agent architecture: three-layer model", Status "Open", Notes "See A15"
- Verify DD-06 row still says "REPLACES/MIGRATES_TO edge types" with status Deferred

## Commit
- Stage all changed files
- Commit message: "chore: housekeeping — fix spec path drift, add DD-08, reconcile C-codes (24), index prod_plans/ as A14-A16"
- Do NOT push — just commit locally

## Validation
After committing, verify:
1. Authority Index A1 path matches actual spec filename
2. DECISIONS.md has DD-06 (edge types, deferred) AND DD-08 (agent arch, open)
3. capabilities_registry.json has exactly 24 entries including C-AI-AGENT and C-API-PLATFORM
4. Authority Index has A14, A15, A16 entries
5. Spec §12 has DD-08 row
Report the verification results.
```
