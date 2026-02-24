# Query Cookbook

**Authority:** A16
**Path:** `docs/ecosystem/QUERY_COOKBOOK.md`
**Version:** 1.0.0
**Status:** Authoritative
**Phase:** WP-3

Deterministic query definitions for the TRAVEL.aw ecosystem graph (Spec §6.2).
Implementation: `tools/query_ecosystem/query_cookbook.ts`

---

## Usage

```bash
pnpm query -- --query N    # Run single query (1-5)
pnpm query -- --all         # Run all 5 queries (JSON to stdout)
pnpm query -- --fixtures    # Determinism check (run twice, compare)
```

Exit codes: `0` = success, `2` = runtime error.

---

## Q1: Cross-Stage Influence (J0 → J3)

**Question:** Which nodes span from Inspiration (J0) to Booking (J3)?

**Criteria:** `journeyStages` includes BOTH `J0` AND `J3`.

**Determinism:** Filter + sort by ID.

**Expected results (1 node):**

| Node ID | Name | Provider Type |
|---------|------|---------------|
| `SUPER_APP_GOOGLE` | Google (Travel) | SUPER_APP |

**Insight:** Only Google spans the full inspiration-to-booking funnel. This validates the SUPER_APP guardrail — only a platform with 8 journey stages and 10 capabilities achieves this reach.

---

## Q2: Social Inspiration → Booking Paths

**Question:** How does social inspiration flow to booking transactions?

**Criteria:** BFS from nodes with `C-SOCIAL-INSPIRATION` to nodes with `C-BOOKING-TXN`. Directed edges only: `FEEDS_INTO`, `AGGREGATES`, `INTEGRATES_WITH`. Max depth 4, cap 50 paths.

**Determinism:** Start nodes sorted by ID. BFS visits neighbors in edge-ID order. Visited set prevents cycles.

**Expected results (12 paths):**

| # | From | To | Depth | Via |
|---|------|----|-------|-----|
| 1 | `FORUM_REDDIT` | `OTA_BOOKING_COM` | 1 | direct FEEDS_INTO |
| 2 | `FORUM_REDDIT` | `OTA_EXPEDIA` | 2 | → METASEARCH_GOOGLE_FLIGHTS → |
| 3 | `FORUM_REDDIT` | `OTA_TRIP_COM` | 2 | → METASEARCH_GOOGLE_FLIGHTS → |
| 4 | `SOCIAL_PLATFORM_INSTAGRAM` | `OTA_BOOKING_COM` | 1 | direct FEEDS_INTO |
| 5 | `SOCIAL_PLATFORM_INSTAGRAM` | `OTA_EXPEDIA` | 2 | → METASEARCH_GOOGLE_FLIGHTS → |
| 6 | `SOCIAL_PLATFORM_INSTAGRAM` | `OTA_TRIP_COM` | 2 | → METASEARCH_GOOGLE_FLIGHTS → |
| 7 | `SOCIAL_PLATFORM_PINTEREST` | `OTA_BOOKING_COM` | 1 | direct FEEDS_INTO |
| 8 | `SOCIAL_PLATFORM_PINTEREST` | `OTA_EXPEDIA` | 2 | → METASEARCH_GOOGLE_FLIGHTS → |
| 9 | `SOCIAL_PLATFORM_PINTEREST` | `OTA_TRIP_COM` | 2 | → METASEARCH_GOOGLE_FLIGHTS → |
| 10 | `SOCIAL_PLATFORM_TIKTOK` | `OTA_BOOKING_COM` | 1 | direct FEEDS_INTO |
| 11 | `SOCIAL_PLATFORM_TIKTOK` | `OTA_EXPEDIA` | 2 | → METASEARCH_GOOGLE_FLIGHTS → |
| 12 | `SOCIAL_PLATFORM_TIKTOK` | `OTA_TRIP_COM` | 2 | → METASEARCH_GOOGLE_FLIGHTS → |

**Insight:** All social platforms funnel through two patterns: direct FEEDS_INTO to Booking.com, or two-hop via Google Flights metasearch to Expedia/Trip.com. Google Flights is the critical aggregation hub.

---

## Q3: Local Event Discovery In-Trip

**Question:** Which nodes help travelers discover events while in-destination?

**Criteria:** `journeyStages` includes `J6` AND `capabilities` includes `C-EVENT-DISCOVERY`.

**Determinism:** Filter + sort by ID.

**Expected results (6 nodes):**

| Node ID | Name | Provider Type |
|---------|------|---------------|
| `CONTENT_PLATFORM_TIME_OUT` | Time Out | CONTENT_PLATFORM |
| `EVENT_PLATFORM_ALLEVENTS` | AllEvents.in | EVENT_PLATFORM |
| `EVENT_PLATFORM_DICE` | Dice | EVENT_PLATFORM |
| `EVENT_PLATFORM_EVENTBRITE` | Eventbrite | EVENT_PLATFORM |
| `EVENT_PLATFORM_MEETUP` | Meetup | EVENT_PLATFORM |
| `SOCIAL_PLATFORM_FACEBOOK_EVENTS` | Facebook Events | SOCIAL_PLATFORM |

**Insight:** Event discovery in-trip spans three provider types. Time Out (content) and Facebook Events (social) offer discovery but not ticketing. Dice, Eventbrite, and Meetup additionally provide C-TICKETING.

---

## Q4: Itinerary Manager Integrations

**Question:** What does each itinerary manager integrate with, and in what categories?

**Criteria:** Find all `ITINERARY_MANAGER` nodes. For each, collect all connected edges (both directions). Group neighbors by category: emailParsing, ota, airline, calendar, mapping, metasearch.

**Determinism:** Nodes sorted by ID. Edges sorted by edge ID. Categories use stable predicates.

**Expected results (3 managers):**

### ITINERARY_MANAGER_SYGIC — Sygic Travel

- **Neighbors:** 2 (ITINERARY_MANAGER_TRIPIT, ITINERARY_MANAGER_WANDERLOG — both COMPETES_WITH)
- **Categories:** emailParsing (TripIt, Wanderlog), calendar (TripIt, Wanderlog)

### ITINERARY_MANAGER_TRIPIT — TripIt

- **Neighbors:** 8 (Lonely Planet, Flighty ×2, Splitwise, Sygic, Wanderlog, Booking.com, Expedia)
- **Categories:** emailParsing (Flighty, Wanderlog), ota (Booking.com, Expedia), calendar (Flighty, Wanderlog)

### ITINERARY_MANAGER_WANDERLOG — Wanderlog

- **Neighbors:** 6 (Lonely Planet, Wikivoyage, Sygic, TripIt, Booking.com, Expedia)
- **Categories:** emailParsing (TripIt), ota (Booking.com, Expedia), calendar (TripIt)

**Insight:** TripIt has the richest integration surface (8 connections). All three managers receive OTA feeds from Booking.com and Expedia. No managers currently integrate with mapping services or metasearch directly.

---

## Q5: Nearby Now vs Upcoming

**Question:** How do J6 in-destination nodes partition into "nearby now" vs "upcoming events"?

**Criteria:**
- **nearbyNow:** J6 nodes with `C-LOCAL-DISCOVERY` or `C-MAPPING-NAV`
- **upcoming:** J6 nodes with `C-EVENT-DISCOVERY`
- **both:** intersection (a node can appear in both lists)

**Determinism:** All arrays sorted by ID.

**Expected results:**

| Partition | Count | Node IDs |
|-----------|-------|----------|
| nearbyNow | 7 | MAPPING_SERVICE_APPLE_MAPS, MAPPING_SERVICE_GOOGLE_MAPS, MAPPING_SERVICE_MAPS_ME, REVIEW_PLATFORM_TRIPADVISOR, REVIEW_PLATFORM_YELP, SOCIAL_PLATFORM_FOURSQUARE, SUPER_APP_GOOGLE |
| upcoming | 6 | CONTENT_PLATFORM_TIME_OUT, EVENT_PLATFORM_ALLEVENTS, EVENT_PLATFORM_DICE, EVENT_PLATFORM_EVENTBRITE, EVENT_PLATFORM_MEETUP, SOCIAL_PLATFORM_FACEBOOK_EVENTS |
| both | 0 | (none) |

**Insight:** Clean partition — no overlap between nearby-now and upcoming nodes. Nearby-now is dominated by mapping services and review platforms. Upcoming is dominated by event platforms. This suggests an integration opportunity: combining mapping with event discovery.

---

## Design Decision

**DD-11:** Custom adjacency maps, no graphology. 59 nodes / 118 edges doesn't justify a library. BFS for Q2 is trivial. Custom code guarantees deterministic iteration via explicit sorting. Revisit if nodes exceed 500.

---

## Architecture Notes

- **Graph representation:** `Map<string, EcosystemNode>` for node lookup, `Map<string, EcosystemEdge[]>` for outgoing/incoming adjacency. Secondary indexes by capability, stage, and providerType.
- **All arrays pre-sorted** by ID before any iteration.
- **No external dependencies** beyond tsx (already in devDependencies).
- **Follows validator pattern:** JSONL loading, JSON to stdout, exit codes, fixtures mode.
