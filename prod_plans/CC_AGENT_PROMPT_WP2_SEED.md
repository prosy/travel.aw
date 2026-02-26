# TRAVEL.aw — Claude Code Agent Instructions: WP-2 Seed Dataset
**Paste into Claude Code CLI**

---

```
Execute WP-2: Create the seed dataset for the ecosystem graph. Read the following BEFORE starting:
1. Ecosystem Spec v0.2 (A1) — §6 (MVP definition), §7 (acceptance criteria)
2. Node schema (A9) and edge schema (A10)
3. ID_POLICY.md (A13) for naming rules
4. The research CSV at prod_plans/TRAVEL_ECOSYSTEM_NODES_RESEARCH_v0_1.csv

## Overview

Transform the research CSV (92 rows, 74 unique node names, 24 C-codes) into validated nodes.jsonl (A14) and edges.jsonl (A15). Then run validate_ecosystem to confirm 0 errors.

MVP targets from Spec §6.1: 30–60 nodes, 100–200 edges, all J0–J8 covered.

## Step 1: Create nodes.jsonl (A14)

Location: data/ecosystem/nodes.jsonl (per Authority Index)

### Selection strategy
Take the top 2–3 ranked nodes from each of the 24 C-codes. Deduplicate — many nodes appear in multiple C-codes (15 nodes appear 2-3 times). When a node appears under multiple C-codes, merge into ONE node entry with all its capabilities combined.

Target: ~40–50 unique nodes after dedup.

### Multi-capability merges (known from research)
These nodes MUST have multiple capabilities — do not split them:
- Google Maps: C-MAPPING-NAV, C-LOCAL-DISCOVERY, C-REVIEW-RATINGS, C-TRANSIT-INFO
- TripIt: C-ITINERARY-MGMT, C-EMAIL-PARSING, C-CALENDAR-SYNC
- Wanderlog: C-ITINERARY-MGMT, C-EMAIL-PARSING, C-CALENDAR-SYNC
- Flighty: C-CALENDAR-SYNC, C-EMAIL-PARSING, C-LOYALTY-MGMT
- Google Flights: C-FLIGHT-SEARCH, C-METASEARCH, C-PRICE-COMPARE
- Booking.com: C-HOTEL-SEARCH, C-BOOKING-TXN
- Expedia: C-HOTEL-SEARCH, C-BOOKING-TXN
- TripAdvisor: C-REVIEW-RATINGS, C-ACTIVITY-SEARCH (or FORUM if applicable)
- Yelp: C-REVIEW-RATINGS, C-LOCAL-DISCOVERY
- Eventbrite: C-EVENT-DISCOVERY, C-TICKETING
- Skyscanner: C-FLIGHT-SEARCH, C-METASEARCH
- KAYAK: C-METASEARCH, C-PRICE-COMPARE
- Trivago: C-METASEARCH, C-PRICE-COMPARE
- Airbnb: C-HOTEL-SEARCH, C-BOOKING-TXN, C-ACTIVITY-SEARCH
- Time Out: C-CONTENT-PUBLISHING, C-EVENT-DISCOVERY

### Node ID format (per ID_POLICY.md A13)
{PROVIDER_TYPE}_{SNAKE_CASE_NAME}
Examples: OTA_BOOKING_COM, MAPPING_SERVICE_GOOGLE_MAPS, METASEARCH_GOOGLE_FLIGHTS

Use the provider_type from the research CSV. For multi-capability nodes, use their PRIMARY provider type (the one that best describes what they are — e.g., Google Maps is MAPPING_SERVICE even though it does reviews).

### Journey stages
Derive from the capabilities' defaultJourneyStages in the registry (A5), plus any additional stages that are obvious from the node's description. For example, Google Maps operates at J1, J2, J5, J6 even though C-MAPPING-NAV defaults to J5, J6.

### Required fields per A9 schema
- id, name, providerType, description, journeyStages, capabilities, addedVersion ("0.2.0" for all seed nodes)

Use descriptions from the research CSV's description column. Clean up if needed but preserve the essence.

### Coverage check (Spec §7.2)
After creating nodes, verify ALL of these are met:
- ≥1 node in every journey stage J0–J8
- ≥1 encyclopedia node (Wikipedia/Wikivoyage)
- ≥1 forum/community node (Reddit, FlyerTalk)
- ≥1 DMO / tourism bureau node — NOTE: the research CSV may not have one. If missing, add a representative DMO node manually (e.g., Visit California, Tourism Australia, or a generic "National Tourism Boards" node)
- ≥1 metasearch + ≥1 OTA + ≥1 direct supplier
- ≥1 itinerary manager
- ≥1 mapping/local discovery
- ≥1 event platform (first-class, not a tag on another node)

If any gap exists, add the minimum nodes needed to fill it.

## Step 2: Create edges.jsonl (A15)

Location: data/ecosystem/edges.jsonl (per Authority Index)

Target: 100–200 edges.

### Edge types (from relationship_types.json A7)
- INTEGRATES_WITH (bidirectional)
- FEEDS_INTO (directed)
- COMPETES_WITH (bidirectional)
- SUPPLEMENTS (directed)
- AGGREGATES (directed)
- OWNED_BY (directed)

### Edge ID format (per ID_POLICY.md — DD-09)
E__{fromId}__{toId}__{type}
Example: E__METASEARCH_GOOGLE_FLIGHTS__OTA_BOOKING_COM__AGGREGATES

### Edge generation strategy

Build edges in this order:

1. AGGREGATES — metasearch nodes aggregate OTA/direct supplier inventory:
   - Google Flights → each OTA and relevant direct suppliers
   - Skyscanner → each OTA
   - KAYAK → each OTA
   - Trivago → hotel OTAs (Booking.com, Expedia, Hotels.com)

2. COMPETES_WITH — nodes with overlapping capabilities in the same stages:
   - OTA vs OTA (Booking.com ↔ Expedia ↔ Airbnb for hotels)
   - Metasearch vs metasearch (Google Flights ↔ Skyscanner ↔ KAYAK)
   - Itinerary managers (TripIt ↔ Wanderlog)
   - Review platforms (TripAdvisor ↔ Yelp ↔ Google Maps reviews)
   - AI agents (Google AI Mode ↔ Expedia Romie ↔ Booking.com AI)

3. FEEDS_INTO — output of A is input to B:
   - Social platforms → OTAs/metasearch (inspiration drives search)
   - Review platforms → booking decisions (TripAdvisor → Booking.com)
   - Content platforms → planning tools (Lonely Planet → itinerary managers)
   - Email parsing → itinerary (airline confirmation → TripIt)

4. INTEGRATES_WITH — technical integrations:
   - GDS platforms ↔ OTAs (Amadeus ↔ Booking.com, Sabre ↔ Expedia)
   - Calendar sync tools ↔ calendar services
   - Mapping services ↔ rideshare (Google Maps ↔ Uber)

5. SUPPLEMENTS — A enhances B without replacing:
   - Insurance → booking (World Nomads supplements Booking.com)
   - Expense tools → post-trip (Splitwise supplements itinerary managers)
   - Loyalty platforms → booking (AwardWallet supplements airline/hotel bookings)

6. OWNED_BY — corporate ownership:
   - Expedia Group: Expedia, Hotels.com, VRBO, Trivago (if present)
   - Booking Holdings: Booking.com, KAYAK, Agoda (if present)
   - Google/Alphabet: Google Flights, Google Maps, Google Travel

### Bidirectional edge rule
For INTEGRATES_WITH and COMPETES_WITH (bidirectional types): store ONE canonical edge. Choose canonical direction alphabetically by fromId. Do NOT create two edges for the same bidirectional relationship.

### journeyContext on edges
Set journeyContext to the journey stages where the relationship is most relevant. For AGGREGATES between metasearch and OTA, that's ["J1", "J3"]. For FEEDS_INTO from social to booking, that's ["J0", "J1"].

## Step 3: Validate

Run validate_ecosystem against the new dataset:
- pnpm validate (or however the script is configured)
- Must produce 0 errors
- If errors, fix and re-run until clean

Check determinism: run twice, confirm identical output (except timestamp).

## Step 4: Coverage verification

After validation passes, manually verify against Spec §7.2:
- Count total nodes (must be 30–60)
- Count total edges (must be 100–200)
- List journey stage coverage (every J0–J8 must have ≥1 node)
- List provider type coverage
- Confirm all §7.2 checklist items met

## Step 5: Commit

Commit message: "feat(wp-2): seed dataset — {N} nodes, {M} edges across J0-J8, validator passes"

Do NOT push yet.

## Verification report

Report:
1. Total unique nodes created
2. Total edges created
3. Node count by provider type
4. Journey stage coverage (count per stage)
5. C-code coverage (how many of the 24 have ≥1 node)
6. Edge count by type
7. Validator result (0 errors confirmed)
8. Determinism confirmed (yes/no)
9. Spec §7.2 checklist — each item with pass/fail
10. Any nodes added manually (not from research CSV) to fill gaps
```
