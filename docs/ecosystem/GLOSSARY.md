# Glossary

**Authority:** A3
**Path:** `docs/ecosystem/GLOSSARY.md`

Canonical term definitions for the TRAVEL.aw project. If a term is defined here, this definition takes precedence over any other usage.

---

| Term | Definition |
|------|------------|
| **Node** | A distinct service, platform, content source, or functional entity in the travel ecosystem. Represented as a record in `nodes.jsonl`. |
| **Edge** | A directional relationship between two nodes. Represented as a record in `edges.jsonl`. |
| **Journey Stage** | One of nine sequential phases (J0-J8) modeling a traveler's experience from inspiration through reflection. Defined in `journey_stages.json`. |
| **Capability (C-code)** | A functional ability a node provides (e.g., C-HOTEL-SEARCH). Defined only in `capabilities_registry.json`. |
| **Provider Type** | A classification of what kind of entity a node is (e.g., OTA, METASEARCH). Defined in `provider_types.json`. |
| **Relationship Type** | A classification of how two nodes relate (e.g., INTEGRATES_WITH, AGGREGATES). Defined in `relationship_types.json`. |
| **Registry** | A JSON file that is the sole source of truth for an enum or code set. Registries are SSOT — they override spec descriptions. |
| **Schema** | A JSON Schema file defining the structural contract for nodes or edges. |
| **Authority** | A file that defines contractual truth, is versioned, and is the sole allowed source for its category of truth. Listed in `AUTH/TRAVEL_AUTHORITIES_INDEX.md`. |
| **SSOT** | Single Source of Truth. The one canonical location for a piece of information. |
| **Seed Dataset** | The initial curated set of nodes and edges meeting MVP coverage targets. Append-only with immutable IDs. |
| **DD (Design Decision)** | A recorded decision with ID, options considered, resolution, and rationale. Tracked in `DECISIONS.md`. |
| **WP (Work Package)** | A phased unit of work in the implementation plan (WP-0 through WP-5). |
| **Deterministic** | Same inputs + same code + same rules = identical outputs. No randomness, no network calls in validation. |
| **Track A** | Ecosystem Graph — the SSOT knowledge graph of the travel ecosystem. |
| **Track B** | V1 Web App — the Next.js traveler product with LLM-assisted features. |
