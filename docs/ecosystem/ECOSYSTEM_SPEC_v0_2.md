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
- Stages are **sequentially ordered** but the real journey has loops (J8 -> J0, J6 -> J3 for spontaneous bookings).
- The model captures **where a service provides value**, not where a user is forced to go.

---

## 3. Node Model

A **node** represents a distinct service, platform, content source, or functional entity in the travel ecosystem.

### 3.1 Node Identity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Format: `{PROVIDER_TYPE}_{SNAKE_CASE_NAME}`. Immutable once merged. See `ID_POLICY.md`. |
| `name` | string | Yes | Human-readable display name. |
| `providerType` | enum | Yes | From `provider_types.json` (A6). |
| `description` | string | Yes | 1-3 sentence summary of what this node does in the ecosystem. |

### 3.2 Classification Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `journeyStages` | string[] | Yes | From `journey_stages.json` (A4). At least one required. |
| `capabilities` | string[] | Yes | C-codes from `capabilities_registry.json` (A5). At least one required. |

### 3.3 Metadata Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `url` | string | No | Primary URL if applicable. |
| `tags` | string[] | No | Free-form tags for discovery (not authoritative — use capabilities for classification). |
| `notes` | string | No | Editorial notes. Not a substitute for missing structure. |
| `addedVersion` | string | Yes | Spec version when node was added (e.g., "0.2.0"). |

> **Schema authority:** The formal contract lives in `ecosystem_node.schema.json` (A9). This section describes intent; the schema defines enforcement.

---

## 4. Edge Model

An **edge** represents a directional relationship between two nodes.

### 4.1 Edge Identity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Format: `E_{FROM}_{TO}_{TYPE}`. Immutable once merged. |
| `fromId` | string | Yes | Must reference an existing node `id`. |
| `toId` | string | Yes | Must reference an existing node `id`. |
| `type` | enum | Yes | From `relationship_types.json` (A7). |

### 4.2 Edge Metadata

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `description` | string | No | Human-readable explanation of this specific relationship. |
| `journeyContext` | string[] | No | Journey stages where this relationship is most relevant. |
| `notes` | string | No | Editorial notes. |
| `addedVersion` | string | Yes | Spec version when edge was added. |

### 4.3 Relationship Types (Starter Set)

| Type | Directionality | Description |
|------|---------------|-------------|
| `INTEGRATES_WITH` | Bidirectional | Technical integration (API, data feed, import/export). |
| `FEEDS_INTO` | Directed | Output of A is input to B (e.g., review site -> booking decision). |
| `COMPETES_WITH` | Bidirectional | Overlapping capability in the same stage(s). |
| `SUPPLEMENTS` | Directed | A enhances B's value without replacing it. |
| `AGGREGATES` | Directed | A collects/displays inventory or content from B. |
| `OWNED_BY` | Directed | Corporate ownership (A is parent of B). |

### 4.4 Referential Integrity Rules

- Every `fromId` and `toId` MUST resolve to an existing node `id`.
- No self-referencing edges (`fromId` != `toId`).
- Duplicate edges (same from/to/type triple) are prohibited.
- Orphan edges cause hard validation failure.

---

## 5. Capability Taxonomy (C-Codes)

Capabilities describe **what a node does** independent of its provider type or journey stage.

### 5.1 C-Code Format

- `code`: Unique identifier. Format: `C-{DOMAIN}-{FUNCTION}`. Defined ONLY in `capabilities_registry.json` (A5).
- `label`: Human-readable short name.
- `description`: What this capability means in the ecosystem.
- `defaultJourneyStages`: Typical stages where this capability is exercised. Nodes may override.

### 5.2 Starter C-Codes (Seed Set, ~22)

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

---

## 6. MVP Definition (v0.2)

### 6.1 MVP Dataset Targets

- **30-60 nodes** spanning all journey stages J0-J8
- **100-200 edges** capturing key ecosystem flows
- **4 registries** locked and validated
- **2 schemas** enforced (node, edge)

### 6.2 MVP Query Capabilities (Acceptance)

1. "Which nodes influence **J0 inspiration** but monetize in **J3 booking**?"
2. "What are common paths from **social inspiration -> booking** (multi-step)?"
3. "Which services provide **local event discovery** in-trip?"
4. "Where do itinerary managers integrate (email parsing, OTA, airline, calendar)?"
5. "For a given city, what nodes provide **nearby now** (maps/local search) vs **upcoming** (events calendar)?"

---

## 7. Provider Types (Starter Set)

| Code | Label | Description |
|------|-------|-------------|
| OTA | Online Travel Agency | Books across multiple suppliers |
| METASEARCH | Metasearch Engine | Aggregates prices from OTAs and direct suppliers |
| DIRECT_SUPPLIER | Direct Supplier | Airlines, hotel chains, car rental cos selling direct |
| CONTENT_PLATFORM | Content Platform | Travel content, blogs, guides |
| SOCIAL_PLATFORM | Social Platform | User-generated inspiration and sharing |
| REVIEW_PLATFORM | Review Platform | Traveler reviews and ratings |
| ITINERARY_MANAGER | Itinerary Manager | Trip organization tools |
| MAPPING_SERVICE | Mapping Service | Maps, navigation, local search |
| EVENT_PLATFORM | Event Platform | Event discovery and ticketing |
| DMO | Destination Marketing Org | Tourism bureaus, CVBs, national tourism boards |
| ENCYCLOPEDIA | Encyclopedia | General knowledge reference |
| FORUM | Forum / Community | Q&A and discussion |
| FINTECH | Travel Fintech | Expense, currency, payment, insurance |
| TRANSIT_SERVICE | Transit Service | Ground transport, rideshare, public transit info |
| LOYALTY_PLATFORM | Loyalty Platform | Points, miles, status tracking |
| SUPER_APP | Super App | Multi-function platform spanning many stages |

---

## 8. Open Decisions

| ID | Decision | Status |
|----|----------|--------|
| DD-01 | Toolchain | Resolved — full TypeScript monolang |
| DD-02 | Bootstrap scope | Resolved (phased) |
| DD-03 | Spec completion order | Resolved (v0.2) |
| DD-04 | Journey stage labels (J0-J8) | Resolved — lock as-is |
| DD-05 | Starter C-codes (24) | Resolved — lock all 24 |
| DD-06 | REPLACES/MIGRATES_TO edge types | Deferred (post-MVP) |
| DD-07 | SUPER_APP providerType | Resolved — keep, add guardrail |
| DD-08 | Agent architecture: three-layer model | Resolved — accept, start M0 parallel. See A19 |

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-02-21 | v0.1 | Initial draft (ChatGPT) |
| 2026-02-22 | v0.2 | Complete rewrite: added vision, journey model, node/edge models, capability taxonomy, provider types |
