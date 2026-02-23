# TRAVEL.aw — Ecosystem Spec v0.2
**Status:** SSOT Candidate (Authority A1)  
**Date:** 2026-02-22 (America/Los_Angeles)  
**Supersedes:** v0.1 (incomplete ChatGPT draft, §1–5 missing)  
**Authority Pack:** v0.2  
**Path:** `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md`

---

## Rules (apply to all sections)

- Registries are **authoritative** (SSOT). This spec describes intent; registries define truth.
- Seeds are **append-only** (IDs immutable).
- Breaking changes require a version bump per `CONTRACT_VERSIONING.md`.
- Conflict resolution: **Schema + Registries > Spec > Validator > Session prompt > Everything else.**

---

## 1. Product Vision & Problem Statement

### 1.1 What is TRAVEL.aw?

TRAVEL.aw (augmented worlds) is a **structured knowledge graph of the travel ecosystem** — mapping the services, platforms, content sources, and integrations a traveler encounters across their entire journey, from inspiration through post-trip reflection.

### 1.2 Problem

The travel ecosystem is fragmented across hundreds of services that overlap, compete, integrate, and hand off users in ways that are poorly documented and difficult to reason about. There is no canonical, queryable model of:

- Which services operate at which journey stages
- How data and users flow between services
- Where capability gaps exist
- How events, local discovery, and real-time context fit into the journey

### 1.3 What This Solves

TRAVEL.aw provides a **curated, validated, deterministic graph** that answers ecosystem questions programmatically. It is not a product database or market analysis — it is a structural model of how the travel ecosystem works from the traveler's perspective.

### 1.4 Target Users (of the graph itself)

- Product teams designing travel experiences
- Researchers analyzing ecosystem structure
- Strategists identifying integration opportunities or competitive gaps
- AI agents needing structured travel-domain context

---

## 2. User Journey Model (J0–J8)

The journey model is the primary organizational spine. Every node declares which stages it participates in. Stages are sequential but services often span multiple stages.

| Code | Label | Description |
|------|-------|-------------|
| J0 | Inspiration | Passive discovery — social media, content, word-of-mouth, ads. The traveler doesn't have a specific trip in mind yet. |
| J1 | Research | Active information gathering — reading reviews, comparing destinations, checking conditions, budgeting. |
| J2 | Planning | Structuring the trip — building itineraries, selecting dates, coordinating with travel companions. |
| J3 | Booking | Committing and transacting — reserving flights, hotels, activities, car rentals. |
| J4 | Pre-Trip | Between booking and departure — document prep, packing, last-mile logistics, confirmation management. |
| J5 | Transit | Getting there and between — airport, flight, ground transport, transfers, border crossings. |
| J6 | In-Destination | On the ground — local discovery, navigation, dining, activities, events, "nearby now." |
| J7 | Post-Trip | After return — reviews, expense reconciliation, photo organization, loyalty management. |
| J8 | Reflection & Re-Inspiration | Longer-term — sharing stories, revisiting memories, planning the next trip. The loop back to J0. |

> **Registry lock:** These labels and descriptions become authoritative once written to `journey_stages.json` (A4). Changes require DD entry + version bump.

### 2.1 Stage Properties

- Stages are **not mutually exclusive** — a node (e.g., Google Maps) can operate at J1, J2, J5, and J6.
- Stages are **sequentially ordered** but the real journey has loops (J8 → J0, J6 → J3 for spontaneous bookings).
- The model captures **where a service provides value**, not where a user is forced to go.

---

## 3. Node Model

A **node** represents a distinct service, platform, content source, or functional entity in the travel ecosystem.

### 3.1 Node Identity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Format: `{PROVIDER_TYPE}_{SNAKE_CASE_NAME}`. Immutable once merged. See `ID_POLICY.md`. |
| `name` | string | ✅ | Human-readable display name. |
| `providerType` | enum | ✅ | From `provider_types.json` (A6). |
| `description` | string | ✅ | 1–3 sentence summary of what this node does in the ecosystem. |

### 3.2 Classification Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `journeyStages` | string[] | ✅ | From `journey_stages.json` (A4). At least one required. |
| `capabilities` | string[] | ✅ | C-codes from `capabilities_registry.json` (A5). At least one required. |

### 3.3 Metadata Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `url` | string | ❌ | Primary URL if applicable. |
| `tags` | string[] | ❌ | Free-form tags for discovery (not authoritative — use capabilities for classification). |
| `notes` | string | ❌ | Editorial notes. Not a substitute for missing structure. |
| `addedVersion` | string | ✅ | Spec version when node was added (e.g., "0.2.0"). |

> **Schema authority:** The formal contract lives in `ecosystem_node.schema.json` (A9). This section describes intent; the schema defines enforcement.

### 3.4 Node Examples (Illustrative)

```jsonc
{
  "id": "OTA_BOOKING_COM",
  "name": "Booking.com",
  "providerType": "OTA",
  "description": "Full-service OTA for hotels, flights, car rentals, and activities. Strong in European inventory.",
  "journeyStages": ["J1", "J3"],
  "capabilities": ["C-HOTEL-SEARCH", "C-PRICE-COMPARE", "C-BOOKING-TXN"],
  "url": "https://booking.com",
  "addedVersion": "0.2.0"
}

{
  "id": "EVENT_PLATFORM_EVENTBRITE",
  "name": "Eventbrite",
  "providerType": "EVENT_PLATFORM",
  "description": "Event discovery and ticketing platform. First-class source for local/upcoming events in-destination.",
  "journeyStages": ["J2", "J6"],
  "capabilities": ["C-EVENT-DISCOVERY", "C-TICKETING"],
  "url": "https://eventbrite.com",
  "addedVersion": "0.2.0"
}
```

---

## 4. Edge Model

An **edge** represents a directional relationship between two nodes.

### 4.1 Edge Identity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | Format: `E_{FROM}_{TO}_{TYPE}`. Immutable once merged. |
| `fromId` | string | ✅ | Must reference an existing node `id`. |
| `toId` | string | ✅ | Must reference an existing node `id`. |
| `type` | enum | ✅ | From `relationship_types.json` (A7). |

### 4.2 Edge Metadata

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `description` | string | ❌ | Human-readable explanation of this specific relationship. |
| `journeyContext` | string[] | ❌ | Journey stages where this relationship is most relevant. |
| `notes` | string | ❌ | Editorial notes. |
| `addedVersion` | string | ✅ | Spec version when edge was added. |

### 4.3 Relationship Types (Starter Set)

These become authoritative once written to `relationship_types.json` (A7). Descriptions here are intent; the registry is SSOT.

| Type | Directionality | Description |
|------|---------------|-------------|
| `INTEGRATES_WITH` | Bidirectional | Technical integration (API, data feed, import/export). |
| `FEEDS_INTO` | Directed | Output of A is input to B (e.g., review site → booking decision). |
| `COMPETES_WITH` | Bidirectional | Overlapping capability in the same stage(s). |
| `SUPPLEMENTS` | Directed | A enhances B's value without replacing it. |
| `AGGREGATES` | Directed | A collects/displays inventory or content from B. |
| `OWNED_BY` | Directed | Corporate ownership (A is parent of B). |

> **⚠️ DD-06 (Open):** Do we need `REPLACES` or `MIGRATES_TO` for modeling service evolution? Deferred to post-MVP.

### 4.4 Edge Example (Illustrative)

```jsonc
{
  "id": "E_METASEARCH_GOOGLE_FLIGHTS__OTA_BOOKING_COM__AGGREGATES",
  "fromId": "METASEARCH_GOOGLE_FLIGHTS",
  "toId": "OTA_BOOKING_COM",
  "type": "AGGREGATES",
  "description": "Google Flights displays Booking.com pricing and redirects to their booking flow.",
  "journeyContext": ["J1", "J3"],
  "addedVersion": "0.2.0"
}
```

### 4.5 Referential Integrity Rules

- Every `fromId` and `toId` MUST resolve to an existing node `id`.
- No self-referencing edges (`fromId` ≠ `toId`).
- Duplicate edges (same from/to/type triple) are prohibited.
- Orphan edges cause hard validation failure.

---

## 5. Capability Taxonomy (C-Codes)

Capabilities describe **what a node does** independent of its provider type or journey stage. A node can have multiple capabilities. Capabilities are the primary query axis for ecosystem analysis.

### 5.1 C-Code Format

```jsonc
{
  "code": "C-HOTEL-SEARCH",
  "label": "Hotel Search",
  "description": "Ability to search, filter, and compare hotel/accommodation inventory.",
  "defaultJourneyStages": ["J1", "J3"]
}
```

- `code`: Unique identifier. Format: `C-{DOMAIN}-{FUNCTION}`. Defined ONLY in `capabilities_registry.json` (A5).
- `label`: Human-readable short name.
- `description`: What this capability means in the ecosystem.
- `defaultJourneyStages`: Typical stages where this capability is exercised. Nodes may override.

### 5.2 Starter C-Codes (Seed Set, ~20)

Organized by functional domain. These become authoritative once written to the registry.

**Discovery & Inspiration**
| Code | Label | Default Stages |
|------|-------|----------------|
| C-SOCIAL-INSPIRATION | Social Inspiration | J0, J8 |
| C-CONTENT-PUBLISHING | Content Publishing | J0, J1 |
| C-ENCYCLOPEDIA-KNOWLEDGE | Encyclopedia Knowledge | J1 |
| C-REVIEW-RATINGS | Review & Ratings | J1, J7 |
| C-FORUM-COMMUNITY | Forum / Community Q&A | J0, J1, J7 |

**Search & Compare**
| Code | Label | Default Stages |
|------|-------|----------------|
| C-FLIGHT-SEARCH | Flight Search | J1, J3 |
| C-HOTEL-SEARCH | Hotel Search | J1, J3 |
| C-ACTIVITY-SEARCH | Activity Search | J1, J2, J6 |
| C-PRICE-COMPARE | Price Comparison | J1, J3 |
| C-METASEARCH | Metasearch Aggregation | J1, J3 |

**Booking & Transactions**
| Code | Label | Default Stages |
|------|-------|----------------|
| C-BOOKING-TXN | Booking Transaction | J3 |
| C-TICKETING | Ticketing | J3, J6 |
| C-INSURANCE | Travel Insurance | J3, J4 |

**Planning & Organization**
| Code | Label | Default Stages |
|------|-------|----------------|
| C-ITINERARY-MGMT | Itinerary Management | J2, J4, J5, J6 |
| C-EMAIL-PARSING | Email / Confirmation Parsing | J4 |
| C-CALENDAR-SYNC | Calendar Sync | J2, J4 |

**In-Destination & Real-Time**
| Code | Label | Default Stages |
|------|-------|----------------|
| C-MAPPING-NAV | Mapping & Navigation | J5, J6 |
| C-LOCAL-DISCOVERY | Local Discovery ("nearby now") | J6 |
| C-EVENT-DISCOVERY | Event Discovery ("upcoming") | J2, J6 |
| C-TRANSIT-INFO | Transit / Transport Info | J5, J6 |

**Post-Trip**
| Code | Label | Default Stages |
|------|-------|----------------|
| C-EXPENSE-MGMT | Expense Management | J7 |
| C-LOYALTY-MGMT | Loyalty Program Management | J3, J7 |

> **⚠️ DD-05 status:** This is the proposed seed set (~22 codes). Review and lock before writing to registry.

---

## 6. MVP Definition (v0.2)

MVP proves the framework works and is queryable.

### 6.1 MVP Dataset Targets

- **30–60 nodes** spanning all journey stages J0–J8
- **100–200 edges** capturing key ecosystem flows
- **4 registries** locked and validated (journey stages, capabilities, provider types, relationship types)
- **2 schemas** enforced (node, edge)

### 6.2 MVP Query Capabilities (Acceptance)

We MUST answer these via deterministic graph queries:

1. "Which nodes influence **J0 inspiration** but monetize in **J3 booking**?"
2. "What are common paths from **social inspiration → booking** (multi-step)?"
3. "Which services provide **local event discovery** in-trip?"
4. "Where do itinerary managers integrate (email parsing, OTA, airline, calendar)?"
5. "For a given city, what nodes provide **nearby now** (maps/local search) vs **upcoming** (events calendar)?"

---

## 7. Acceptance Criteria (Contract + Data)

### 7.1 Contract & Validation

- [ ] Node schema validates all nodes (0 errors)
- [ ] Edge schema validates all edges (0 errors)
- [ ] Referential integrity: every edge `fromId` and `toId` resolves
- [ ] Enum integrity: all journeyStage / capability / providerType / edgeType values exist in registries
- [ ] Deterministic build: validation outputs are identical across runs (stable sort, stable format)

### 7.2 Seed Coverage

- [ ] ≥1 node in every journey stage J0–J8
- [ ] Encyclopedia knowledge node (Wikipedia-like)
- [ ] ≥1 forum/community node
- [ ] ≥1 DMO / tourism bureau node
- [ ] ≥1 metasearch + ≥1 OTA + ≥1 direct supplier node
- [ ] ≥1 itinerary manager node
- [ ] ≥1 mapping/local discovery node
- [ ] Events represented as first-class nodes (including recurring example)

---

## 8. Non-Goals (v0.2)

- No claim of internet completeness (representative coverage is sufficient)
- No vendor market share analysis
- No scraping/crawling automation (manual curation acceptable)
- No paid data sources required
- No real-time data feeds (static graph, updated by human curation)
- No UI beyond query cookbook (WP-4 is optional/post-MVP)

---

## 9. Provider Types (Starter Set)

These become authoritative once written to `provider_types.json` (A6).

| Code | Label | Description |
|------|-------|-------------|
| OTA | Online Travel Agency | Books across multiple suppliers (e.g., Booking.com, Expedia) |
| METASEARCH | Metasearch Engine | Aggregates prices from OTAs and direct suppliers (e.g., Google Flights, Kayak) |
| DIRECT_SUPPLIER | Direct Supplier | Airlines, hotel chains, car rental cos selling direct |
| CONTENT_PLATFORM | Content Platform | Travel content, blogs, guides (e.g., Lonely Planet, Nomadic Matt) |
| SOCIAL_PLATFORM | Social Platform | User-generated inspiration and sharing (e.g., Instagram, TikTok, Reddit) |
| REVIEW_PLATFORM | Review Platform | Traveler reviews and ratings (e.g., TripAdvisor, Yelp) |
| ITINERARY_MANAGER | Itinerary Manager | Trip organization tools (e.g., TripIt, Wanderlog) |
| MAPPING_SERVICE | Mapping Service | Maps, navigation, local search (e.g., Google Maps, Apple Maps) |
| EVENT_PLATFORM | Event Platform | Event discovery and ticketing (e.g., Eventbrite, Dice) |
| DMO | Destination Marketing Org | Tourism bureaus, CVBs, national tourism boards |
| ENCYCLOPEDIA | Encyclopedia | General knowledge reference (e.g., Wikipedia, Wikivoyage) |
| FORUM | Forum / Community | Q&A and discussion (e.g., Reddit travel subs, Flyertalk) |
| FINTECH | Travel Fintech | Expense, currency, payment, insurance (e.g., Revolut, Wise) |
| TRANSIT_SERVICE | Transit Service | Ground transport, rideshare, public transit info |
| LOYALTY_PLATFORM | Loyalty Platform | Points, miles, status tracking (e.g., AwardWallet) |
| SUPER_APP | Super App | Multi-function platform spanning many stages (e.g., Google, Grab) |

> **⚠️ DD-07 (Open):** Should `SUPER_APP` exist or should multi-stage platforms use multiple providerType values? Current decision: single providerType per node; SUPER_APP captures the "does everything" pattern. Revisit if it becomes a junk drawer.

---

## 10. Implementation Plan (Aligned with Authority Pack v0.2)

### WP-0 — Bootstrap (Authority Pack)
- [x] Authority Pack v0.2
- [x] Ecosystem Spec v0.2 (this file)
- [ ] `DECISIONS.md` (record DD-01 through DD-07)
- [ ] `GLOSSARY.md` (canonical terms from §1–5)

### WP-1 — Registries (SSOT)
- [ ] `journey_stages.json` — lock J0–J8 from §2
- [ ] `capabilities_registry.json` — lock seed C-codes from §5.2
- [ ] `provider_types.json` — lock from §9
- [ ] `relationship_types.json` — lock from §4.3

### WP-2 — Schemas & Validation
- [ ] `ecosystem_node.schema.json` — from §3
- [ ] `ecosystem_edge.schema.json` — from §4
- [ ] `CONTRACT_VERSIONING.md` + `ID_POLICY.md`
- [ ] `VALIDATION_CONTRACT.md`
- [ ] Validator script (toolchain per DD-01)

### WP-3 — Seed Dataset
- [ ] 30–60 nodes across J0–J8 (coverage per §7.2)
- [ ] 100–200 edges (referential integrity enforced)
- [ ] Validation passes with 0 errors

### WP-4 — Query Cookbook
- [ ] `QUERY_COOKBOOK.md` with 5 MVP queries (§6.2)
- [ ] Deterministic answers against seed dataset

### WP-5 — Graph Export (Optional, post-MVP)
- [ ] Neo4j/CSV export
- [ ] Simple browse UI

---

## 11. Design Principles

1. **User-journey first.** Categories model what travelers do, not org charts or vendor taxonomies.
2. **Capability-based classification.** Nodes span multiple stages and capabilities. No single-axis pigeonholing.
3. **Events are first-class.** "Nearby now" and "upcoming" are core capabilities, not bolted-on features.
4. **Deterministic + versioned.** Registries and schemas are SSOT. Data validates cleanly or fails loudly.
5. **Representative, not exhaustive.** The graph models ecosystem structure, not a complete vendor directory.
6. **Append-only data, immutable IDs.** Enables stable references and auditable history.

---

## 12. Open Decisions

| ID | Decision | Status | Notes |
|----|----------|--------|-------|
| DD-01 | Toolchain (TS validation + Python queries vs. monolang) | **Open** | |
| DD-02 | Bootstrap scope | **Resolved** | Phased per Authority Pack v0.2 |
| DD-03 | Spec completion order | **Resolved** | §1–5 written in this version |
| DD-04 | Journey stage labels | **Open** | §2 is proposed; lock when registry written |
| DD-05 | Starter C-codes | **Open** | §5.2 is proposed (~22); review before registry |
| DD-06 | REPLACES/MIGRATES_TO edge types | **Deferred** | Post-MVP |
| DD-07 | SUPER_APP providerType | **Open** | See §9 note |

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-02-21 | v0.1 | Initial draft (ChatGPT) — §6–10 only, §1–5 missing |
| 2026-02-22 | v0.2 | Complete rewrite: added §1–5 (vision, journey model, node/edge models, capability taxonomy, provider types). Cleaned §6–10. Aligned WPs with Authority Pack v0.2. Removed stray code artifacts. Added open decisions table. |
