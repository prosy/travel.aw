# Direct Airline-to-Platform Connectivity: The GDS Bypass Accelerating in 2026
**One-Pager — Travel.aw Strategic Context**  
**Date:** 2026-02-27

---

## What's Happening

Airlines are rapidly shifting from distributing fares through centralized GDS intermediaries (Amadeus, Sabre, Travelport) to connecting directly with booking platforms via modern APIs. The mechanism is IATA's **NDC (New Distribution Capability)** standard — an XML/API-based protocol that lets airlines control their own offer creation, pricing, and merchandising across any sales channel.

This isn't theoretical anymore. NDC bookings in the US grew from 7.1% of ARC ticket volume in 2022 to 12.5% in 2023 to 18.2% in early 2024. IATA projects 65% of indirect bookings will be NDC-powered by 2026. American Airlines now routes roughly 80% of bookings through NDC or direct channels. United reports 66% direct, 10% NDC, with NDC growth coming from aggregators — not GDS NDC channels. Finnair sells about 70% of tickets through modern retailing channels and plans to discontinue EDIFACT entirely.

## Why Airlines Are Doing This

Three forces are converging. First, **cost**: GDS booking fees run $4-12 per segment, and airlines like Lufthansa pioneered surcharges on GDS bookings starting in 2015, with Air France-KLM and American Airlines following. Direct/NDC distribution eliminates or reduces these fees. Second, **control**: the legacy EDIFACT standard (dating to the 1980s) is text-only and can't support rich media, dynamic pricing, bundled ancillaries, or personalized offers. Airlines want to sell like retailers — and NDC lets them display their full product portfolio including exclusive fare classes, seat selection, baggage bundles, and lounge access that GDS channels simply can't render. Third, **data**: direct connections give airlines customer behavior data that GDS intermediaries historically kept for themselves.

## The New Aggregator Layer

A new class of startup has emerged to make direct airline connectivity accessible without enterprise GDS contracts. These **NDC aggregators** — Duffel, AirGateway, TPConnects, Verteil, Travelfusion, and roughly 50 others — maintain direct API connections with 30-50+ airlines each and offer unified REST/JSON APIs that any platform can integrate. They handle accreditation (IATA/ARC), ticketing authority, and payment processing on behalf of their customers.

This is the layer that matters most for Travel.aw. These aggregators offer exactly what the Amadeus Self-Service portal provided — developer-friendly APIs, free sandboxes, transparent pricing, no enterprise sales process — but connected to the airline's own inventory rather than a GDS intermediary. Duffel, for example, maintains direct NDC connections with ~30 airlines and routes 300+ carriers through Travelport GDS as fallback, all via a single REST API. Pricing is transparent: $3 + 1% per booking, free searches up to a 1500:1 look-to-book ratio.

## What It Means for Travel.aw

**The opportunity:** The shift from GDS monopoly to open direct connectivity aligns perfectly with our agent-first architecture. NDC aggregator APIs are structured, machine-parseable JSON — ideal for agent skills. They support the "hold + confirm" booking pattern our TRAVEL-003 rule requires. And they don't require IATA accreditation — the aggregator handles that.

**The risk we're avoiding:** Amadeus shutting its self-service portal is a symptom, not an anomaly. GDS players see their middleman position eroding and are retreating to enterprise-only contracts. Building on any single GDS is building on shrinking ground. The aggregator layer — multiple companies competing to provide the best developer experience — is where distribution is heading.

**The strategic alignment:** Our TravelAgents marketplace vision (ComBots + NormieBots) needs providers that expose rich, structured inventory data so agents can reason about and pitch offers intelligently. NDC content — with its bundled fares, ancillary details, dynamic pricing, and rich media — provides exactly this. Legacy GDS EDIFACT content does not.

**Key caveat:** NDC is not yet universal. EDIFACT still handles roughly 88% of indirect sales globally, and full Offer & Order adoption across the industry isn't expected before 2030. Functional gaps remain (complex rebooking, disruption handling, waitlisting). A practical strategy needs NDC for primary content with GDS fallback for coverage — which is exactly what aggregators like Duffel already provide.

---

*Sources: IATA NDC program, ARC booking data, Accelya NDC volume reports, AltexSoft NDC aggregator research, Business Travel News NDC analysis, Tragento NDC trends analysis, airline distribution statements from United Airlines, American Airlines, Finnair, and Lufthansa Group.*
