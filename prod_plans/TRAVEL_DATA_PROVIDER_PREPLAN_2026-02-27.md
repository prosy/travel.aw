# TRAVEL.aw — Travel Data Provider Pre-Plan
## Comprehensive Requirements Framework for Provider Selection

**Date:** 2026-02-27  
**Status:** Pre-Planning (requirements definition — no provider selection yet)  
**Trigger:** Amadeus Self-Service portal decommissioning July 17, 2026  
**Decision IDs affected:** DD-14 (flight API), DD-15 (hotel API) — both reopened  
**Authority:** This document feeds into DECISIONS.md once provider research completes

---

## 0. Situational Context

### What happened
Amadeus confirmed shutdown of its Self-Service developer portal. New registrations paused March 2026. Full decommission July 17, 2026 — API keys disabled. Enterprise portal unaffected but requires NDA, implementation fees, monthly minimums, and is not accessible to startups or independent developers.

### Industry signal
The timing — right as AI agents reshape travel booking — is widely interpreted as protectionism. Sabre is actively adding agentic AI features to its developer portal. The industry consensus: airline content distribution is fragmenting away from GDS monopoly control, and NDC (New Distribution Capability) is accelerating direct airline-to-platform connectivity.

### Impact on Travel.aw
- Existing `flight-search` and `hotel-search` skills target `api.amadeus.com` — **must be replaced**
- SkillRunner, `skill.yaml` manifests, egress enforcement, CI gates — **all provider-agnostic, no rework**
- This is a **strategic architecture decision** because provider choice affects data schemas, multi-provider normalization, legal obligations, cost model, and agent marketplace viability

### What this document is NOT
- Not selecting providers (that's the research phase, next)
- Not comparing pricing (need research data first)
- Not writing code or skills (premature until providers selected)
- **This IS** the exhaustive checklist of everything we need to evaluate

---

## 1. Functional Requirements by Travel Domain

### 1.1 Flights

| Requirement | MVP | Scale | Rationale |
|---|---|---|---|
| One-way search (origin/dest/date/pax/cabin) | ✅ | ✅ | Core — proves pipeline works |
| Round-trip search | ✅ | ✅ | Most common use case |
| Multi-city / open-jaw | ❌ | ✅ | Complex itinerary support |
| Flexible dates (± days, calendar view) | ❌ | ✅ | Price-sensitive travelers, J1 research |
| "Everywhere" / inspiration search | ❌ | ✅ | J0 → J1 bridge — "where can I go for $X?" |
| Price calendar / 30-day grid | ❌ | ✅ | Visual planning tool |
| Fare rules & restrictions | ❌ | ✅ | Cancellation/change fees, baggage policy |
| Ancillaries (seats, bags, meals) | ❌ | ✅ | Post-search upsell, agent-friendly |
| Full-service carrier coverage | ✅ | ✅ | Major airlines (UA, DL, AA, BA, LH, etc.) |
| LCC/budget carrier coverage | ✅ | ✅ | Ryanair, Spirit, EasyJet — often missing from GDS |
| NDC content (direct airline fares) | ❌ | ✅ | Bypasses GDS markup, future of distribution |
| Virtual interlining | ❌ | ✅ | Combining non-partner carriers — unique value |
| Price tracking / alerts | ❌ | ✅ | J1 → J3 journey continuity |
| Booking (actual ticketing) | ❌ | ✅ | Requires IATA/ARC or intermediary (see §6) |
| Post-booking management | ❌ | ✅ | Changes, cancellations, rebooking |
| Airport autocomplete / lookup | ✅ | ✅ | UX requirement for search forms |

### 1.2 Hotels / Accommodation

| Requirement | MVP | Scale | Rationale |
|---|---|---|---|
| Search by city/location/dates | ✅ | ✅ | Core search |
| Search by coordinates + radius | ❌ | ✅ | "Nearby now" for J6 in-destination |
| Filter: price, stars, amenities | ✅ | ✅ | Basic refinement |
| Room types and availability | ✅ | ✅ | Decision-critical |
| Photos and descriptions | ❌ | ✅ | Content richness for trust |
| Guest reviews / ratings | ❌ | ✅ | Social proof |
| Alternative stays (vacation rentals) | ❌ | ✅ | Airbnb-like inventory |
| Loyalty program / member rates | ❌ | ✅ | ComBot value proposition |
| Booking | ❌ | ✅ | Lower barrier than flights (no IATA needed) |
| Cancellation policies | ❌ | ✅ | Pre-booking transparency |
| Post-booking management | ❌ | ✅ | Modifications, cancellations |

### 1.3 Activities / Experiences

| Requirement | MVP | Scale | Rationale |
|---|---|---|---|
| Search by destination + date | ❌ | ✅ | Tours, attractions, excursions |
| Category filtering | ❌ | ✅ | Food tours, museums, outdoor, etc. |
| Real-time availability + booking | ❌ | ✅ | J6 in-destination spontaneous booking |
| Reviews / ratings | ❌ | ✅ | Social proof |
| Location-based discovery | ❌ | ✅ | "Nearby now" C-LOCAL-DISCOVERY |

### 1.4 Ground Transport

| Requirement | MVP | Scale | Rationale |
|---|---|---|---|
| Car rental search | ❌ | ✅ | Pick-up/drop-off, dates, vehicle class |
| Airport transfers | ❌ | ✅ | J5 transit — airport ↔ hotel |
| Public transit info | ❌ | ✅ | J5/J6 in-destination navigation |
| Rideshare integration | ❌ | ✅ | Uber/Lyft/Grab API availability |

### 1.5 Travel Insurance

| Requirement | MVP | Scale | Rationale |
|---|---|---|---|
| Quote by trip details | ❌ | ✅ | J3/J4 pre-trip |
| Coverage comparison | ❌ | ✅ | Agent-friendly comparison |
| Purchase integration | ❌ | ✅ | C-INSURANCE capability |

### 1.6 Content & Reference Data

| Requirement | MVP | Scale | Rationale |
|---|---|---|---|
| Destination descriptions | ❌ | ✅ | J0/J1 inspiration |
| Safety advisories | ❌ | ✅ | Already in Track B |
| Visa requirements by nationality | ❌ | ✅ | J4 pre-trip |
| Currency / exchange rates | ❌ | ✅ | J4/J6 financial context |
| Weather data by destination | ❌ | ✅ | J1/J2 planning |
| Points of interest (POI) | ❌ | ✅ | J6 in-destination |

---

## 2. Technical & Integration Requirements

### Missing: multi-provider orchestration, data normalization, and the LLM integration layer.

### 2.1 API Quality

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **Architecture style** | REST/JSON? SOAP/XML? GraphQL? | Our SkillRunner speaks HTTP/JSON. SOAP adds complexity. |
| **Authentication** | OAuth2? API key? Per-request token? | Affects skill.yaml `env_vars` design |
| **Rate limits** | Requests/second? Daily caps? Burst vs sustained? | Determines concurrent user capacity |
| **Latency** | Average response time? P99? Regional variation? | Search UX — users expect < 3 seconds |
| **Uptime SLA** | Guaranteed? What happens when it's down? | Production reliability |
| **Sandbox/test environment** | Free? Rate-limited? Realistic data? | Development and CI testing |
| **SDK availability** | Python? Node.js/TypeScript? Quality of SDKs? | Skills can be any language |
| **Documentation quality** | Complete? Up to date? Code examples? | Development velocity |
| **Changelog / deprecation policy** | How much notice before breaking changes? | Maintenance burden |
| **Webhook / push support** | Can provider push updates (price changes, cancellations)? | Enables real-time features |
| **Pagination** | Cursor-based? Offset? Max results per page? | Affects result completeness |
| **Error handling** | Structured error codes? Retry guidance? | SkillRunner needs to map errors safely |

### 2.2 Data Normalization

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **Response schema** | Consistent structure? Well-documented? | Mapping to our `@travel/contracts` types |
| **Multi-provider normalization** | If using >1 provider for flights, can we deduplicate? | Avoid showing same flight twice at different prices |
| **Currency handling** | Single currency or multi? Conversion responsibility? | Display and comparison logic |
| **Timezone handling** | UTC? Local? Explicit offset? | Critical for flight times, hotel check-in |
| **Image URLs** | Stable? CDN-backed? Resolution options? | Hotel/activity display quality |
| **Identifier stability** | Do offer/flight IDs persist long enough to book? | Session continuity: search → select → book |

### 2.3 SkillRunner Integration

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **Egress domain(s)** | How many distinct domains does the API use? | `skill.yaml` egress allowlist — fewer is better |
| **Authentication flow** | Can auth token be obtained inside skill, or pre-injected? | Affects env_var vs runtime auth design |
| **Payload size** | Typical response size for a search? | SkillRunner stdout buffer limits |
| **Stateful sessions** | Does the API require session IDs across calls? | Skills are stateless — sessions must be managed externally |
| **Binary dependencies** | Does the SDK require compiled native modules? | Container image size and build complexity |

---

## 3. Business & Commercial Requirements

### 3.1 Access & Onboarding

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **Self-service signup** | Can we get API keys without a sales call? | MVP velocity |
| **Approval process** | Application review? How long? | Time to first working skill |
| **Free tier / sandbox** | What's included free? Duration? Limitations? | Development and testing cost |
| **Enterprise upgrade path** | What triggers paid tier? Pricing model? | Scale planning |
| **Registration paused?** | Is the provider accepting new developers NOW? | Amadeus lesson — verify before depending |

### 3.2 Pricing Model

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **Pricing structure** | Per-search? Per-booking? Monthly minimum? Tiered? | Cost model for MVP vs 1K/10K/100K users |
| **Look-to-book ratio penalties** | Charged for high search-to-booking ratios? | Travel search is naturally high-ratio |
| **Markup permitted?** | Can we add margin to displayed prices? | Revenue model |
| **Commission model** | Do we earn commission on bookings? | Revenue for booking-enabled providers |
| **Hidden costs** | Implementation fees? NDA requirement? Monthly minimums? | True cost comparison |
| **Payment processing** | Who handles payment? PCI compliance burden? | Critical architecture decision |

### 3.3 Contract & Terms

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **Terms of Service — agent use** | Explicitly allows AI agent / bot access? Or prohibits? | **Critical.** Many ToS prohibit automated access. |
| **Terms of Service — display requirements** | Must show provider branding? Attribution? | UI design constraints |
| **Terms of Service — price parity** | Required to show exact prices? No modification? | Affects business model |
| **Data redistribution** | Can we cache/store results? For how long? | Performance and cost optimization |
| **Exclusivity clauses** | Prohibited from using competing providers? | Multi-provider strategy viability |
| **Termination terms** | How much notice? Data portability on exit? | Vendor lock-in risk |
| **API stability guarantee** | Contractual commitment to backward compatibility? | Another Amadeus-style shutdown risk |

---

## 4. Legal & Compliance Requirements

### 4.1 Regulatory

| Requirement | Details | Phase |
|---|---|---|
| **IATA / ARC accreditation** | Required for direct flight ticketing in US. Options: get own accreditation, use intermediary (Duffel, consolidator), or search-only (no booking). | Scale |
| **Seller of Travel registration** | Required in CA, FL, HI, IA, WA (US). Required in most EU countries. | Scale |
| **PCI DSS compliance** | Required if we handle credit card data for bookings. Intermediaries like Duffel handle this for us. | Scale |
| **EU Package Travel Directive** | If we combine flight + hotel as a "package," we become the liable organizer with consumer protection obligations. | Scale — **⚠️ major implication** |
| **Consumer protection / refund liability** | Who is liable when things go wrong? Us? The provider? The airline? | Scale |

### 4.2 Data Privacy (Per-Jurisdiction)

| Requirement | Details | Phase |
|---|---|---|
| **GDPR (EU)** | Consent, purpose limitation, data minimization, retention limits, DSAR handling, DPA with providers, right to erasure. Travel PII includes passport numbers, itineraries, payment data. | MVP (if serving EU users) |
| **CCPA/CPRA (California)** | Opt-out of sale, right to delete, data inventory. WA state has its own law too. | MVP (we're in WA) |
| **India DPDP Act** | Consent manager registration, granular consent, 72-hour breach notification. Phase 2 starts Nov 2026. | Scale |
| **Cross-border data transfers** | EU adequacy requirements, data localization rules. Airlines operate across 160+ countries with different laws. | Scale |
| **AI-specific obligations** | EU AI Act (Aug 2, 2026 deadline). LLM processing of personal travel data requires DPIA. | Scale |
| **Data retention policy** | How long do we keep search history? Booking records? PII? Must be justified per-purpose. | MVP |

### 4.3 Provider-Side Privacy

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **What PII does the provider require?** | Some booking APIs need full passenger details pre-purchase | Minimization principle |
| **Does the provider log/retain our users' searches?** | Provider may build profiles of our users | Privacy-preserving architecture goal |
| **Data Processing Agreement** | Can we get a GDPR-compliant DPA from the provider? | Legal requirement as data controller |
| **Sub-processor disclosure** | Who does the provider share data with? | GDPR requires this chain to be documented |

---

## 5. Agent, Bot & Skill Architecture Requirements

### 5.1 Agent-Friendliness

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **Structured response format** | Machine-parseable JSON? Or HTML requiring extraction? | Agent skills need clean structured data |
| **Semantic richness** | Does response include enough context for LLM to reason about results? | Agent can explain "why this flight" |
| **Session / state management** | Does search → select → book require maintaining state? | Agents need stateless or externally-managed sessions |
| **Confirmation flow** | Can booking be split into "hold" + "confirm"? | TRAVEL-003 compliance — human-in-the-loop before payment |
| **Idempotency** | Are booking requests idempotent? | Agent retry safety |
| **Partial results** | Can agent get results incrementally (streaming)? | UX during long searches |

### 5.2 Multi-Provider Aggregation (Scale Architecture)

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **Can we query multiple providers in parallel?** | Different providers for flights vs hotels vs activities | Breadth of coverage |
| **Deduplication strategy** | Same flight from different providers at different prices | Quality of results |
| **Normalization layer** | Unified response format across providers | Clean agent interface |
| **Provider-selection intelligence** | Can the agent choose which provider to query based on route/destination? | Optimization and cost control |
| **Graceful degradation** | If one provider is down, do others still work? | Reliability |

### 5.3 Skill Design Implications

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **One skill per provider, or one skill per domain?** | `flight-search-duffel` vs `flight-search` that dispatches | Skill registry organization |
| **Provider abstraction layer** | Should `packages/adapters/` normalize across providers? | Code reuse, testing, swappability |
| **Egress complexity** | Multiple domains per provider = more complex `skill.yaml` | Security surface area |
| **Secret management** | Multiple API keys for multiple providers | Env var proliferation |
| **Testing strategy** | Mock vs sandbox per provider | CI reliability |

### 5.4 Agent Marketplace / TravelAgents Vision

| Criterion | Question to Answer | Why It Matters |
|---|---|---|
| **ComBot viability** | Can hotels/airlines/DMOs become "ComBots" via these APIs? | Commercial agent marketplace |
| **Inventory depth** | Does the provider expose enough detail for agents to pitch intelligently? | Agent-to-agent commerce quality |
| **Dynamic pricing access** | Can agents detect deals, price drops, limited offers? | NormieBot value proposition |
| **White-label / co-branding** | Can ComBots brand the booking experience? | Commercial differentiation |

---

## 6. Accreditation & Ticketing Path Analysis

This is a **strategic fork** that shapes everything downstream.

### Option A: Search-Only (No Booking)
- **What:** Display search results, deep-link to provider for booking
- **Pros:** No IATA/ARC needed. No PCI compliance. No refund liability. Fastest to MVP.
- **Cons:** No booking revenue. Breaks the agent promise ("I'll handle it for you"). Users leave our platform to complete transaction.
- **Revenue model:** Affiliate commissions on click-throughs, or none (pure utility)

### Option B: Intermediary-Mediated Booking (Duffel-like)
- **What:** Use a provider that handles accreditation, ticketing, and payment
- **Pros:** No own IATA/ARC needed. Provider handles PCI, ticketing authority, airline relationships. Start selling from day 1.
- **Cons:** Per-booking fees. Less control. Provider is single point of failure. May limit airline content.
- **Revenue model:** Markup on fares + commission sharing

### Option C: Own Accreditation
- **What:** Obtain IATA/ARC accreditation, build direct airline relationships
- **Pros:** Maximum control, best economics at scale, direct NDC access
- **Cons:** 6-12 month application process. $20K+ bond. PCI compliance. Regulatory burden. Refund liability.
- **Revenue model:** Full margin control, commissions, ancillary revenue

### Option D: Hybrid (Recommended Evaluation Priority)
- **What:** Search-only for MVP → intermediary for initial booking → own accreditation at scale
- **Pros:** Fast start, incremental commitment, learn before investing
- **Cons:** Multiple integrations over time. Schema churn risk.

**⚠️ FUTURE WORK:** Research phase must price out each option with concrete provider quotes.

---

## 7. Competitive & Strategic Requirements

### 7.1 Competitive Positioning

| Question | Why It Matters |
|---|---|
| Which providers do Google Flights, Kayak, Skyscanner use? | Competitive parity baseline |
| Which providers are optimized for AI agent consumption? | Alignment with our agent-first architecture |
| Which providers are adding MCP/A2A support? | Future protocol compatibility |
| Who else is building agent-to-agent travel marketplaces? | Competitive intelligence |
| What does Sabre's "agentic AI" developer portal offer? | Potential Amadeus replacement with agent features |

### 7.2 Vendor Risk

| Question | Why It Matters |
|---|---|
| Could this provider also shut down self-service access? | Amadeus precedent |
| What is the provider's funding/financial health? | Startup risk vs established player |
| Is the provider's business model aligned or competitive with ours? | Conflict of interest check |
| Does the provider have a track record of stable APIs? | Maintenance burden prediction |
| How many breaking changes in the last 12 months? | API stability signal |

### 7.3 Open vs Closed Ecosystem

| Question | Why It Matters |
|---|---|
| Is the provider building their own consumer-facing AI agent? | They may restrict API access to protect their own product (the Amadeus pattern) |
| Does the provider's ToS explicitly allow or prohibit agent/bot access? | Legal risk for our core use case |
| Is the provider contributing to open standards (NDC, IATA, A2A)? | Long-term ecosystem alignment |
| Can we contribute back to the provider (bug reports, SDK improvements)? | Community health signal |

---

## 8. Operational Requirements

### 8.1 Reliability & Support

| Criterion | Question to Answer |
|---|---|
| **Uptime history** | Documented? Status page? Historical incidents? |
| **Support channels** | Email only? Dedicated account manager? Developer Slack/Discord? |
| **Response time SLA** | For production issues — hours? Days? |
| **Incident communication** | How are outages communicated? Proactive or reactive? |

### 8.2 Monitoring & Observability

| Criterion | Question to Answer |
|---|---|
| **Usage dashboard** | Can we monitor our API usage in real-time? |
| **Billing visibility** | Real-time cost tracking? Alerts before overage? |
| **Error rate monitoring** | Provider-side error tracking? Or must we build our own? |
| **Rate limit visibility** | Can we see how close we are to limits? |

### 8.3 Data Freshness & Quality

| Criterion | Question to Answer |
|---|---|
| **Price accuracy** | How fresh are displayed prices? Guaranteed bookable? |
| **Availability accuracy** | Does "available" in search mean actually bookable? |
| **Content update frequency** | Hotel descriptions, photos — how often refreshed? |
| **Coverage gaps** | Known regions/carriers/hotel chains NOT covered? |

---

## 9. Cost Modeling Framework

### 9.1 Cost Categories to Model

| Category | Variables |
|---|---|
| **Development cost** | Integration time per provider, SDK quality, documentation quality |
| **Per-search cost** | API call pricing × searches per user × users |
| **Per-booking cost** | Transaction fees, commission splits |
| **Infrastructure cost** | Caching strategy reduces API calls; what's the optimal cache TTL? |
| **Maintenance cost** | API version updates, breaking change handling, SDK upgrades |
| **Legal/compliance cost** | Accreditation fees, PCI audit, seller-of-travel registration |

### 9.2 Scenarios to Model

| Scenario | Users | Searches/day | Bookings/month |
|---|---|---|---|
| **MVP** | 10-50 | 50-200 | 0 (search-only) |
| **Early traction** | 500-2K | 2K-10K | 10-50 |
| **Growth** | 10K-50K | 50K-200K | 500-2K |
| **Scale** | 100K+ | 1M+ | 10K+ |

### 9.3 Agent-Specific Cost Considerations

| Factor | Question |
|---|---|
| **Agent search patterns** | Agents may search more broadly than humans (multiple dates, destinations). API cost multiplier? |
| **ComBot query volume** | Commercial agents querying on behalf of hotels/airlines — who pays? |
| **Caching viability** | Can we cache flight prices? For how long before stale? Provider ToS on caching? |
| **On-device model cost offset** | If 3B models handle 90% of routine tasks locally, what's the API cost for the remaining 10%? |

---

## 10. Evaluation Criteria Weights

When we move to research phase, score each provider against these weighted categories:

| Category | Weight | Rationale |
|---|---|---|
| **Functional coverage** | 20% | Does it cover what we need? |
| **API quality & DX** | 20% | REST/JSON, good docs, SDKs, sandbox — dev velocity |
| **Agent-compatibility** | 15% | Structured responses, session mgmt, ToS allows bots |
| **Pricing & economics** | 15% | Total cost at each scenario scale |
| **Legal & compliance** | 10% | Privacy, accreditation path, consumer protection |
| **Vendor risk** | 10% | Financial health, API stability, shutdown risk |
| **Coverage breadth** | 5% | Airlines, LCCs, hotels, global reach |
| **Strategic alignment** | 5% | Open ecosystem, NDC support, MCP/A2A future |

---

## 11. Provider Categories to Research

Based on all the above, the research phase needs to evaluate providers in these buckets:

### Tier 1 — Primary Flight Search (evaluate first)
- **Duffel** — Modern REST, handles accreditation, per-booking pricing, 300+ airlines
- **Kiwi.com / Tequila API** — Virtual interlining, broad LCC coverage, 750+ carriers
- **Skyscanner Partners API** — Metasearch, affiliate model, 1200+ sources
- **Sabre Dev Studio** — GDS, adding agentic AI features, strong North America
- **Travelport** — GDS, Galileo+Worldspan content, most cost-effective GDS

### Tier 2 — Primary Hotel Search
- **Duffel Stays** — New product, flights + hotels from one provider
- **Hotelbeds** — B2B, 180K+ properties
- **Expedia Rapid API** — OTA-level, packages
- **Booking.com Demand API** — Largest hotel inventory, requires partnership
- **RateHawk** — B2B hotel distribution

### Tier 3 — Activities & Experiences
- **Viator** — TripAdvisor-owned, largest tour marketplace
- **GetYourGuide** — European strength, quality curation
- **Musement** — TUI-owned

### Tier 4 — Ground Transport
- **Cartrawler** — Car rental aggregation
- **Rome2Rio** — Multi-modal transport routing
- **Google Maps Platform** — Directions, transit, POI

### Tier 5 — Aggregation / Multi-Domain
- **Amadeus Enterprise** — Full catalog if economics work
- **Travelpayouts** — Affiliate aggregation across flights, hotels, activities
- **FlightAPI.io** — Lightweight aggregation

---

## 12. Decision Framework

### Phase 1: Requirements Definition (TODAY) ✅
Define all requirements, criteria, and questions. → This document.

### Phase 2: Provider Research (NEXT — use Deep Research)
For each Tier 1/2 provider: answer every question in §1-9.
**Deliverable:** Provider comparison matrix with scores.

### Phase 3: Provider Selection
Apply weights from §10, resolve DD-14/DD-15.
**Deliverable:** Updated DECISIONS.md with rationale.

### Phase 4: Skill Rewrite
Update `flight-search` and `hotel-search` skills for new provider(s).
Update `skill.yaml` egress declarations.
**Deliverable:** PR to travel-aw-skills repo.

### Phase 5: Normalization Layer (if multi-provider)
Build `packages/adapters/` abstraction if using >1 provider.
**Deliverable:** Adapter module in travel-app repo.

---

## 13. Open Questions Requiring Human Decision

These cannot be answered by research alone — they're strategic choices:

| # | Question | Options | Implications |
|---|---|---|---|
| 1 | **Do we want to enable booking, or search-only?** | Search-only / intermediary booking / own accreditation | Entire legal, regulatory, and commercial model |
| 2 | **Single provider or multi-provider?** | One-stop-shop / best-of-breed per domain | Complexity vs coverage tradeoff |
| 3 | **Agent ToS risk tolerance?** | Only explicit agent permission / gray area OK for MVP | Legal exposure level |
| 4 | **Geographic priority?** | US-first / Global from day 1 | Affects provider selection (some are regional) |
| 5 | **Revenue model priority?** | Affiliate / markup / commission / subscription / free utility | Shapes which provider economics work |
| 6 | **Build for ComBots now or later?** | Provider APIs must support commercial agent access / post-MVP | Architecture investment level |
| 7 | **Washington State Seller of Travel?** | Register now / defer until booking-enabled | We're WA-based — required for selling travel |

---

## 14. Immediate Next Actions

1. **Aug answers strategic questions in §13** — shapes which provider categories matter for MVP
2. **Deep Research session** — evaluate Tier 1 + Tier 2 providers against §1-9 criteria
3. **Update DD-14, DD-15** — with new provider selections and rationale
4. **Update PROJECT_MANIFEST.md** — remove Amadeus env vars, add new provider env vars
5. **Rewrite skills** — new provider, new egress declarations, re-pass CI gates

---

## Appendix A: Amadeus Self-Service API Catalog (What We're Replacing)

For reference — the breadth we had from one provider and now need to match:

- **Flights:** Search, Offers Price, Create Orders, Seatmap, Airport Nearest, Airport Autocomplete
- **Hotels:** Search, Offers, Booking, Ratings, Sentiment
- **Destination Experiences:** Tours & Activities (powered by Viator/Tiqets), Points of Interest, Safety
- **Cars & Transfers:** Transfer Search, Booking, Management
- **Market Insights:** Most Booked Destinations, Busiest Travel Periods, Location Score
- **Itinerary Management:** Trip Parser (NLP extraction from booking confirmations)

**Key insight:** No single alternative provider currently matches this breadth. Multi-provider strategy is likely required at scale.

---

## Appendix B: Regulatory Quick Reference

| Jurisdiction | Key Requirements | Trigger |
|---|---|---|
| **Washington State** | Seller of Travel registration required | Selling travel to WA residents |
| **California** | Seller of Travel registration + CCPA/CPRA | Selling travel to CA residents |
| **Florida, Hawaii, Iowa** | Seller of Travel registration | Selling travel to state residents |
| **EU** | GDPR + Package Travel Directive + EU AI Act (Aug 2, 2026) | Serving EU users or processing EU data |
| **UK** | UK GDPR + Package Travel Regulations | Serving UK users |
| **India** | DPDP Act (phased: Nov 2026 - May 2027) | Serving Indian users |
| **Australia** | Privacy Act amendments (Dec 2026) | Serving Australian users |

---

## Appendix C: Acronym Reference

| Acronym | Meaning |
|---|---|
| ARC | Airlines Reporting Corporation (US ticketing authority) |
| BSP | Billing and Settlement Plan (IATA payment system) |
| CPA | Cost Per Acquisition (affiliate model) |
| DPA | Data Processing Agreement (GDPR requirement) |
| DPIA | Data Protection Impact Assessment |
| DSAR | Data Subject Access Request |
| GDS | Global Distribution System (Amadeus, Sabre, Travelport) |
| IATA | International Air Transport Association |
| IATAN | International Airlines Travel Agent Network (US IATA equivalent) |
| LCC | Low-Cost Carrier |
| NDC | New Distribution Capability (IATA direct airline distribution standard) |
| OTA | Online Travel Agency |
| PCI DSS | Payment Card Industry Data Security Standard |
| PNR | Passenger Name Record |
| ToS | Terms of Service |
