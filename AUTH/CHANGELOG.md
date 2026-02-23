# Authority Changelog

**Authority:** A17
**Path:** `AUTH/CHANGELOG.md`

All changes to authority files (A1-A20), registries, and schemas are logged here.

---

## 2026-02-23 — WP-1: Schemas, validator, policies

- **A9** `packages/contracts/schemas/ecosystem_node.schema.json` — Created. Node schema with enums from locked registries (A4-A6).
- **A10** `packages/contracts/schemas/ecosystem_edge.schema.json` — Created. Edge schema with `__` delimiter (DD-09), enums from A4, A7.
- **A11** `packages/contracts/CONTRACT_VERSIONING.md` — Created. Semver rules for registries and schemas.
- **A12** `tools/validate_ecosystem/VALIDATION_CONTRACT.md` — Created. Documents 10 validation checks, determinism contract, output format.
- **A13** `data/ecosystem/ID_POLICY.md` — Created. Node/edge ID formats, immutability rules, `__` delimiter rationale.
- **A2** `docs/ecosystem/DECISIONS.md` — Added DD-09 (edge ID delimiter → double underscore).
- **A17** `AUTH/CHANGELOG.md` — Created with backfill.
- Validator `tools/validate_ecosystem/validate_ecosystem.ts` — Created. 10 checks, all fixture tests pass, deterministic output.
- Infrastructure: `package.json`, `tsconfig.json` — Created. ajv, ajv-formats, tsx, typescript installed.

## 2026-02-23 — DD resolutions: lock registries, resolve DD-01/04/05/07/08

- **A2** `docs/ecosystem/DECISIONS.md` — DD-01, DD-04, DD-05, DD-07, DD-08 status → Resolved.
- **A4** `packages/contracts/registries/journey_stages.json` — All 9 entries: candidate → locked. Version 0.2.0 → 1.0.0.
- **A5** `packages/contracts/registries/capabilities_registry.json` — All 24 entries: candidate → locked. Version 0.2.0 → 1.0.0.
- **A6** `packages/contracts/registries/provider_types.json` — All 16 entries: candidate → locked. Version 0.2.0 → 1.0.0. Added SUPER_APP guardrail field.
- **A7** `packages/contracts/registries/relationship_types.json` — All 6 entries: candidate → locked. Version 0.2.0 → 1.0.0.
- **A1** `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md` — Updated §8 open decisions table (all 5 DDs → Resolved).
- **A8** `AUTH/TRAVEL_AUTHORITIES_INDEX.md` — Updated §9 design decisions table.
- Commit: `99a5a7a`

## 2026-02-23 — Housekeeping: fix drift, add DD-08, reconcile C-codes, index prod_plans/

- **A8** `AUTH/TRAVEL_AUTHORITIES_INDEX.md` — Fixed A1 path (v0_1 → v0_2). Added A18-A20 (prod_plans/). Added DD-08 to §9. Added changelog entry v0.2.1.
- **A2** `docs/ecosystem/DECISIONS.md` — Added DD-08 (agent architecture, Open).
- **A5** `packages/contracts/registries/capabilities_registry.json` — Added C-AI-AGENT, C-API-PLATFORM (22 → 24 entries).
- **A1** `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md` — Added DD-08 to §8 open decisions table.
- Commit: `8407c5d`

## 2026-02-22 — WP-0 bootstrap: authority files, registries, spec, glossary, decisions

- **A1** `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md` — Created. Product scope, user journey (J0-J8), node/edge models, capability taxonomy, MVP definition, provider types.
- **A2** `docs/ecosystem/DECISIONS.md` — Created. DD-01 through DD-06.
- **A3** `docs/ecosystem/GLOSSARY.md` — Created. Canonical term definitions.
- **A4** `packages/contracts/registries/journey_stages.json` — Created. 9 stages (J0-J8), status candidate.
- **A5** `packages/contracts/registries/capabilities_registry.json` — Created. 22 C-codes, status candidate.
- **A6** `packages/contracts/registries/provider_types.json` — Created. 16 types, status candidate.
- **A7** `packages/contracts/registries/relationship_types.json` — Created. 6 types, status candidate.
- **A8** `AUTH/TRAVEL_AUTHORITIES_INDEX.md` — Created. Master authority index v0.2.
- Commit: `c6591d0`

## 2026-02-22 — Initial commit

- Project structure created. Authority pack + governance framework established.
- Commit: `a561065`
