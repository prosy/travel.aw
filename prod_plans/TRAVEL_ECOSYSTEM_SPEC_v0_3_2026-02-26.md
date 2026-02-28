# TRAVEL.aw — Ecosystem Spec v0.3
**Status:** Authoritative (Authority A1)  
**Date:** 2026-02-26 (America/Los_Angeles)  
**Supersedes:** v0.2 (2026-02-22)  
**Authority Pack:** v0.3  
**Path:** `docs/ecosystem/ECOSYSTEM_SPEC_v0_2.md` (file name unchanged; version in header)

---

## Rules (apply to all sections)

- Registries are **authoritative** (SSOT). This spec describes intent; registries define truth.
- Seeds are **append-only** (IDs immutable).
- Breaking changes require a version bump per `CONTRACT_VERSIONING.md`.
- Conflict resolution: **Schema + Registries > Spec > Validator > Session prompt > Everything else.**

---

## 1. Product Vision & Problem Statement

*Unchanged from v0.2. See v0.2 §1 for full text.*

TRAVEL.aw is a structured knowledge graph of the travel ecosystem — mapping services, platforms, content sources, and integrations across the entire traveler journey. It provides a curated, validated, deterministic graph that answers ecosystem questions programmatically.

---

## 2. User Journey Model (J0–J8)

*Unchanged from v0.2. Registries locked in `journey_stages.json` (A4).*

| Code | Label | Description |
|------|-------|-------------|
| J0 | Inspiration | Passive discovery — social media, content, word-of-mouth, ads |
| J1 | Research | Active information gathering — reviews, comparisons, budgeting |
| J2 | Planning | Structuring the trip — itineraries, dates, coordination |
| J3 | Booking | Committing and transacting — reservations, payments |
| J4 | Pre-Trip | Between booking and departure — docs, packing, confirmations |
| J5 | Transit | Getting there — airports, flights, ground transport, borders |
| J6 | In-Destination | On the ground — local discovery, navigation, dining, events |
| J7 | Post-Trip | After return — reviews, expenses, photos, loyalty |
| J8 | Reflection & Re-Inspiration | Longer-term — sharing, memories, planning next trip → J0 |

---

## 3. Node Model

*Unchanged from v0.2. Schema locked in `ecosystem_node.schema.json` (A9).*

See v0.2 §3 for full field definitions and examples.

---

## 4. Edge Model

*Unchanged from v0.2. Schema locked in `ecosystem_edge.schema.json` (A10).*

See v0.2 §4 for full field definitions, relationship types, and examples.

---

## 5. Capability Taxonomy (C-Codes)

*Unchanged from v0.2. Registry locked in `capabilities_registry.json` (A5).*

22 seed C-codes across 6 functional domains. See v0.2 §5 for full listing.

---

## 6. MVP Definition — ✅ COMPLETE

### 6.1 Dataset Delivered

- **59 nodes** spanning all journey stages J0–J8 (target was 30–60)
- **118 edges** capturing key ecosystem flows (target was 100–200)
- **4 registries** locked and validated
- **2 schemas** enforced
- **0 validation errors**

### 6.2 MVP Queries — ✅ All Answerable

1. ✅ "Which nodes influence J0 inspiration but monetize in J3 booking?"
2. ✅ "Common paths from social inspiration → booking (multi-step)?"
3. ✅ "Which services provide local event discovery in-trip?"
4. ✅ "Where do itinerary managers integrate?"
5. ✅ "For a given city, nearby now vs upcoming?"

---

## 7. Acceptance Criteria — ✅ MET

### 7.1 Contract & Validation ✅

- [x] Node schema validates all 59 nodes (0 errors)
- [x] Edge schema validates all 118 edges (0 errors)
- [x] Referential integrity: every edge resolves
- [x] Enum integrity: all values exist in registries
- [x] Deterministic build: identical outputs across runs

### 7.2 Seed Coverage ✅

- [x] ≥1 node in every journey stage J0–J8
- [x] Encyclopedia knowledge node
- [x] ≥1 forum/community node
- [x] ≥1 DMO / tourism bureau node
- [x] ≥1 metasearch + ≥1 OTA + ≥1 direct supplier node
- [x] ≥1 itinerary manager node
- [x] ≥1 mapping/local discovery node
- [x] Events represented as first-class nodes

---

## 8. Non-Goals

*Unchanged from v0.2.*

---

## 9. Provider Types

*Unchanged from v0.2. Registry locked in `provider_types.json` (A6).*

16 provider types. See v0.2 §9 for full listing.

---

## 10. Implementation Plan — Status Update

| WP | Description | Status |
|----|-------------|--------|
| WP-0 | Bootstrap (Authority Pack) | ✅ Complete |
| WP-1 | Registries (SSOT) | ✅ Locked |
| WP-2 | Schemas & Validation | ✅ Complete |
| WP-3 | Seed Dataset | ✅ 59 nodes, 118 edges |
| WP-4 | Query Cookbook | ✅ 5 MVP queries |
| WP-5 | Graph Export (Optional) | 🔲 Post-MVP |

---

## 11. Design Principles

*Unchanged from v0.2.*

1. User-journey first
2. Capability-based classification
3. Events are first-class
4. Deterministic + versioned
5. Representative, not exhaustive
6. Append-only data, immutable IDs

---

## 12. Open Decisions

| ID | Decision | Status | Notes |
|----|----------|--------|-------|
| DD-04 | Journey stage labels | **Resolved** | Locked in registry |
| DD-05 | Starter C-codes | **Resolved** | 22 codes locked in registry |
| DD-06 | REPLACES/MIGRATES_TO edge types | **Deferred** | Post-MVP |
| DD-07 | SUPER_APP providerType | **Open** | Revisit if junk drawer |

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-02-21 | v0.1 | Initial draft (ChatGPT) — §6–10 only |
| 2026-02-22 | v0.2 | Complete rewrite: §1–5 added, §6–10 cleaned, aligned with Authority Pack v0.2 |
| 2026-02-26 | v0.3 | Status update: all WPs marked complete, acceptance criteria checked off, DD-04/DD-05 resolved, promoted to Authoritative. Content unchanged — registries/schemas are SSOT. |
