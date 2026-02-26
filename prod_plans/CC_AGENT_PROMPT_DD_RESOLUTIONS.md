# TRAVEL.aw — Claude Code Agent Instructions: DD Resolutions
**Paste into Claude Code CLI**

---

```
Execute DD resolutions. All decisions resolved by product owner. Read each authority file BEFORE editing.

## 1. Update DECISIONS.md (A2) — Resolve DD-01, DD-04, DD-05, DD-07

For each, update status to "Resolved" and add resolution notes:

DD-01 (Toolchain):
- Status: Resolved
- Resolution: "Full TypeScript monolang for all phases. Validator uses ajv. Graph queries at WP-3+ use TS-native approaches (graphology or custom traversal). No Python in monorepo. StopCrabs remains separate Python repo."
- Date: 2026-02-23

DD-04 (Journey stages):
- Status: Resolved
- Resolution: "Lock J0–J8 as defined in Ecosystem Spec v0.2 §2. No changes."
- Date: 2026-02-23

DD-05 (C-codes):
- Status: Resolved
- Resolution: "Lock all 24 C-codes (22 original + C-AI-AGENT + C-API-PLATFORM added in housekeeping 8407c5d)."
- Date: 2026-02-23

DD-07 (SUPER_APP):
- Status: Resolved
- Resolution: "Keep SUPER_APP provider type. Add guardrail: SUPER_APP nodes must declare ≥4 journey stages and ≥3 capabilities. If fewer, use a more specific provider type."
- Date: 2026-02-23

## 2. Update DD-08 in DECISIONS.md

DD-08 (Agent architecture):
- Status: Resolved
- Resolution: "Accept three-layer model (travel.aw web + private skills registry + NanoClaw fork). Start M0 foundation in parallel with WP-1. Three security gates: StopCrabs CI scan → human code review → container sandbox."
- Date: 2026-02-23

## 3. Lock All Registries

Update each registry file — change every entry's status from "candidate" to "locked":

- journey_stages.json (A4): all 9 entries → "locked"
- capabilities_registry.json (A5): all 24 entries → "locked"
- provider_types.json (A6): all entries → "locked". Also add to the SUPER_APP entry a "guardrail" field: "Nodes using SUPER_APP must declare ≥4 journeyStages and ≥3 capabilities"
- relationship_types.json (A7): all entries → "locked"

Verify counts after: 9 stages, 24 capabilities, 16 provider types (confirm), 6 relationship types.

## 4. Update Ecosystem Spec §12

In the Ecosystem Spec v0.2 (A1), update the Open Decisions table:
- DD-01: Status → Resolved
- DD-04: Status → Resolved  
- DD-05: Status → Resolved
- DD-07: Status → Resolved
- DD-08: should already be Open from housekeeping — update to Resolved

## 5. Commit

Stage all changed files. Commit message:
"chore: resolve DD-01/04/05/07/08 — lock registries, full TS toolchain, accept agent architecture"

Do NOT push yet.

## 6. Verification

After committing, confirm:
1. DECISIONS.md shows DD-01, DD-04, DD-05, DD-07, DD-08 all as Resolved
2. All registry files have zero "candidate" entries
3. journey_stages.json has 9 entries
4. capabilities_registry.json has 24 entries  
5. provider_types.json — count entries and confirm SUPER_APP guardrail present
6. relationship_types.json has 6 entries
7. Ecosystem Spec §12 shows all 5 DDs as Resolved
Report counts and any discrepancies.
```
