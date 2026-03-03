# PRD: M2-S1 — Provider Integration + Deploy
**Version:** 1.0  
**Date:** 2026-02-27  
**Status:** SDD-Validated  
**Authority chain:** Integration PRD v0.5 → Data Architecture Deep Dive → This document  
**Precedence:** Schema + Registries > Spec > Validator > Session prompt > Everything else

---

## 1. Problem Statement

Travel.aw has a working SkillRunner (83 tests), two skills (flight-search, hotel-search), and a web UI — all targeting Amadeus APIs that will be decommissioned July 2026. The system runs only locally. To become a usable product:

1. Skills must talk to a real provider (Duffel) through a normalized adapter layer
2. The web app must be deployed (Vercel) with skills accessible remotely (Railway)
3. The architecture must accommodate future providers (Kiwi stubbed, gated on 50K MAU)

This is one Claude Code session with two epics.

## 2. Scope

### In Scope

**Epic 1 — Provider Adapter Layer**
- `NormalizedFlightOffer` and `NormalizedHotelOffer` TypeScript types
- `FlightSearchAdapter` and `HotelSearchAdapter` interfaces
- Duffel adapter implementations (flight + hotel)
- Kiwi stub adapter (compiles, returns `{ available: false }`)
- Provider registry type + config
- Rewrite `flight-search` and `hotel-search` skills to use adapter layer
- Unit tests for normalization logic
- One integration test (clearly marked, uses Duffel sandbox)

**Epic 2 — Deploy Infrastructure**
- Vercel project config for `apps/web/`
- Railway Dockerfile for skills service
- `/api/skills/invoke` route updated for Railway backend (when `SKILLS_SERVICE_URL` set)
- Health check endpoints
- Environment variable documentation
- Smoke test: deployed search returns results

### Out of Scope
- Conversation UI (M2-E)
- Memory / embeddings (M2-F)
- Cache layer (M2-G)
- Booking flow (M2-D)
- Ecosystem graph changes
- Authority document rewrites
- Any UI beyond existing search pages

## 3. Provider Strategy

| Provider | Role | M2-S1 Status | Unlock Condition |
|----------|------|-------------|------------------|
| **Duffel** | Search + book + manage. 300 airlines, $3/booking | **Active** — account established | None (ready) |
| **Kiwi** | Search breadth, 750 airlines, virtual interlining | **Stub** — interface only | 50K MAU |

### What the stub means
- `KiwiFightSearchAdapter` implements `FlightSearchAdapter`
- `search()` returns `{ provider: 'kiwi', available: false, reason: 'MAU_THRESHOLD_NOT_MET' }`
- All types compile. No runtime Kiwi calls. No Kiwi API key needed.
- When Kiwi access is granted: replace stub body, add API key to env, done.

## 4. Decisions Resolved This Session

| ID | Decision | Resolution |
|----|----------|-----------|
| DD-29 | Kiwi access level | Deferred to post-launch. Stub adapter now. |
| DD-32 | Offer dedup | Deferred. Single provider = no dedup needed. |
| DD-28 | Cache | Deferred to M2-G. Not needed for single-provider. |

## 5. Success Criteria

See SPEC.md §5 for enumerated acceptance criteria with file paths.

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Duffel sandbox rate limits | Slows integration testing | Use fixtures for unit tests; one live integration test |
| Railway cold starts | Slow first skill invocation | Health check endpoint; document expected latency |
| Duffel API shape changes | Adapter breaks | Pin Duffel SDK version; adapter isolates blast radius |
| Single provider at launch | Limited airline coverage | Kiwi stub ready for activation; document gap |
