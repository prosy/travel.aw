# TRAVEL.aw — Claude Code Agent Instructions: WP-1 Schemas & Validation
**Paste into Claude Code CLI**

---

```
Execute WP-1 Stories A2–A6. This is the schemas, validation, and policy layer. Read the Ecosystem Spec v0.2 (A1) sections §3 and §4 BEFORE writing any schemas. Read all registries BEFORE writing enum validations. All work is TypeScript per DD-01.

## Context
- WP-0 complete, all DDs resolved, all registries locked (commits 8407c5d, 99a5a7a)
- Toolchain: Full TypeScript, use ajv for JSON Schema validation
- Registries: 9 journey stages (A4), 24 capabilities (A5), 16 provider types (A6), 6 relationship types (A7)

## Story A2: Node Schema (ecosystem_node.schema.json — A9)

Read Spec §3 (Node Model) first.

Create JSON Schema (draft-07 or 2020-12) at the path specified in Authority Index for A9.

Required fields:
- id (string, pattern: must match format {PROVIDER_TYPE}_{SNAKE_CASE_NAME} — derive valid PROVIDER_TYPE values from provider_types.json A6)
- name (string, minLength 1)
- providerType (string, enum from provider_types.json A6 — extract all code values)
- description (string, minLength 1)
- journeyStages (array of strings, minItems 1, each item enum from journey_stages.json A4 — extract all code values)
- capabilities (array of strings, minItems 1, each item enum from capabilities_registry.json A5 — extract all code values)
- addedVersion (string, pattern for semver-like: e.g. "0.2.0")

Optional fields:
- url (string, format uri)
- tags (array of strings)
- notes (string)

Test: create 2 valid and 2 invalid node fixtures inline and verify the schema catches errors.

## Story A3: Edge Schema (ecosystem_edge.schema.json — A10)

Read Spec §4 (Edge Model) first.

IMPORTANT — Edge ID delimiter decision: The spec uses single underscore E_{FROM}_{TO}_{TYPE} but node IDs contain underscores, making this ambiguous. Use DOUBLE UNDERSCORE __ as the delimiter instead.

Format: E__{fromId}__{toId}__{type}
Example: E__OTA_BOOKING_COM__METASEARCH_GOOGLE_FLIGHTS__AGGREGATES

Record this decision: add a note to ID_POLICY.md (created in Story A4) explaining the double-underscore delimiter rationale.

Create JSON Schema at the path specified in Authority Index for A10.

Required fields:
- id (string, pattern: E__[valid chars]__[valid chars]__[valid chars])
- fromId (string, minLength 1)
- toId (string, minLength 1)
- type (string, enum from relationship_types.json A7 — extract all type values)
- addedVersion (string)

Optional fields:
- description (string)
- journeyContext (array of strings, each item enum from journey_stages.json A4)
- notes (string)

Constraint: fromId !== toId (no self-edges). This may need to be enforced in the validator rather than the schema.

Test: create 2 valid and 2 invalid edge fixtures inline.

## Story A4: Contract & ID Policies

Create two policy documents:

### CONTRACT_VERSIONING.md
Location: docs/ecosystem/ (or wherever policy docs live in the repo)
Content:
- Semver rules: MAJOR = breaking (field removed, enum removed, ID format change), MINOR = additive (new field, new enum value, new registry entry), PATCH = fix (description typo, notes)
- Registry lock means: removing or renaming a locked entry requires MAJOR bump
- Schema changes: adding optional field = MINOR, adding required field = MAJOR, removing field = MAJOR

### ID_POLICY.md
Location: same as above
Content:
- Node ID format: {PROVIDER_TYPE}_{SNAKE_CASE_NAME} — examples with each provider type
- Edge ID format: E__{fromId}__{toId}__{type} — double underscore delimiter, with rationale (node IDs contain underscores)
- IDs are immutable once merged
- No reuse of deleted IDs
- Case: UPPER_SNAKE_CASE for both node and edge IDs

Add DD entry for the edge delimiter decision (DD-09 or next available) in DECISIONS.md — status: Resolved, resolution: "Double underscore __ delimiter for edge IDs to avoid ambiguity with underscores in node IDs."

## Story A5: Build Validator (validate_ecosystem.ts)

This is the core deliverable. Install ajv as a dev dependency (pnpm add -D ajv ajv-formats).

Create validate_ecosystem.ts at the stubbed location in the repo.

The validator must:
1. Load all registries (A4–A7) and both schemas (A9, A10)
2. Load node dataset (initially empty or test fixtures) and edge dataset
3. Schema validation: validate every node against A9, every edge against A10 using ajv
4. Referential integrity: every edge fromId and toId must resolve to an existing node id
5. No self-edges: fromId !== toId on every edge
6. No duplicate edges: unique constraint on (fromId, toId, type) triple
7. Enum integrity: (this is also handled by schema validation but double-check) all journeyStages, capabilities, providerType, edge type values exist in registries
8. Edge ID consistency: edge.id must equal E__{edge.fromId}__{edge.toId}__{edge.type}
9. SUPER_APP guardrail: any node with providerType "SUPER_APP" must have ≥4 journeyStages and ≥3 capabilities
10. Deterministic output: sort all results by id, use stable JSON formatting, output must be byte-identical across runs
11. No network calls anywhere
12. Exit code 0 on pass (0 errors), exit code 1 on fail
13. Output format: structured JSON with summary + individual errors. Include error count, pass/fail, and list of violations with type/id/message.

Add a package.json script: "validate": "tsx validate_ecosystem.ts" (or ts-node, or whatever the repo uses for TS execution).

Test the validator:
- Run against empty datasets → should pass (0 nodes, 0 edges = valid)
- Create a test fixture with 3 valid nodes + 2 valid edges → should pass
- Create fixtures that violate each rule (bad enum, orphan edge, self-edge, duplicate edge, bad ID format, SUPER_APP with only 2 stages) → each should produce a specific error

## Story A6: AUTH/CHANGELOG.md

Create AUTH/CHANGELOG.md (A17) with format:
```
## [date] — [change type]
- Authority: [A-number]
- Change: [description]
- Commit: [hash]
```

Backfill entries:
- WP-0 bootstrap (A1–A8 created)
- Housekeeping 8407c5d (A5 +2 C-codes, A18–A20 indexed, DD-08 added)
- DD resolutions 99a5a7a (DD-01/04/05/07/08 resolved, registries locked)
- This commit (schemas, validator, policies)

Add A17 to Authority Index if not already present.

## Commit

Stage all new and changed files. Commit message:
"feat(wp-1): schemas, validator, ID/versioning policies, changelog — WP-1 complete"

Do NOT push yet. Run the validator once more after committing to confirm it still passes.

## Final Verification

Report:
1. Schema files created (A9, A10) with paths
2. Policy files created (CONTRACT_VERSIONING.md, ID_POLICY.md)
3. Validator created and all test cases pass
4. Validator output is deterministic (run twice, diff output)
5. AUTH/CHANGELOG.md exists with backfilled entries
6. Any new DD entries added (DD-09 edge delimiter)
7. Authority Index updated if needed
8. Total file count of new/changed files
```
