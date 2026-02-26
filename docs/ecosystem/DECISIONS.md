# Design Decisions Registry

**Authority:** A2
**Path:** `docs/ecosystem/DECISIONS.md`

---

| ID | Decision | Options Considered | Resolution | Date | Author |
|----|----------|--------------------|------------|------|--------|
| DD-01 | Toolchain | TS validation + Python queries / All-TS / All-Python | **Resolved:** Full TypeScript monolang for all phases. Validator uses ajv. Graph queries at WP-3+ use TS-native approaches (graphology or custom traversal). No Python in monorepo. StopCrabs remains separate Python repo. | 2026-02-23 | Aug |
| DD-02 | Bootstrap scope | Big-bang / Phased | **Resolved: Phased** per Authority Pack v0.2 | 2026-02-22 | Greg + Claude |
| DD-03 | Spec completion order | Registries first / Spec first | **Resolved:** Spec sections 1-5 written in v0.2 | 2026-02-22 | Greg + Claude |
| DD-04 | Journey stage labels | Confirm J0-J8 before locking registry | **Resolved:** Lock J0–J8 as defined in Ecosystem Spec v0.2 §2. No changes. | 2026-02-23 | Aug |
| DD-05 | Starter C-codes | Agree ~20 seed capabilities | **Resolved:** Lock all 24 C-codes (22 original + C-AI-AGENT + C-API-PLATFORM added in housekeeping 8407c5d). | 2026-02-23 | Aug |
| DD-06 | REPLACES/MIGRATES_TO edge types | Add now / Defer | **Deferred** to post-MVP | 2026-02-22 | |
| DD-07 | SUPER_APP providerType | Keep / Remove / Multi-type nodes | **Resolved:** Keep SUPER_APP provider type. Add guardrail: SUPER_APP nodes must declare ≥4 journey stages and ≥3 capabilities. If fewer, use a more specific provider type. | 2026-02-23 | Aug |
| DD-08 | Agent architecture: accept three-layer model (travel.aw web front-door + private StopCrabs-vetted skills registry + NanoClaw container-isolated runtime)? | Three-layer / Monolith / Defer | **Resolved:** Accept three-layer model. Start M0 foundation in parallel with WP-1. Three security gates: StopCrabs CI scan → human code review → container sandbox. | 2026-02-23 | Aug |
| DD-09 | Edge ID delimiter: single underscore vs double underscore | Single `_` (spec §4 original) / Double `__` | **Resolved:** Double underscore `__` delimiter for edge IDs. Format: `E__{fromId}__{toId}__{type}`. Rationale: node IDs contain single underscores (e.g., `OTA_BOOKING_COM`), making single-underscore delimiters ambiguous and unparseable. Double underscore never appears in node IDs or relationship types. | 2026-02-23 | Aug |
| DD-10 | Add AI_AGENT and API_PLATFORM provider types to A6 | Add both / Add one / Skip | **Resolved:** Add both. Corresponding C-codes (C-AI-AGENT, C-API-PLATFORM) already locked in A5 — provider types needed for nodes to validate. MINOR version bump (additive). Skip AGENT_RUNTIME and SECURITY_TOOL — internal infrastructure, not ecosystem nodes. | 2026-02-23 | Aug |
| DD-11 | Graph library for WP-3 queries | graphology / Custom adjacency maps | **Resolved:** Custom adjacency maps. 59 nodes / 118 edges doesn't justify a library. BFS for Q2 is trivial. Custom code guarantees deterministic iteration via explicit sorting. Revisit if nodes exceed 500. | 2026-02-24 | Aug |
