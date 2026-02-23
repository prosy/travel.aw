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
