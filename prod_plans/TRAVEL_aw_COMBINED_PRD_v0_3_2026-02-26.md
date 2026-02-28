# TRAVEL.aw — Comprehensive PRD v0.3
**Version:** 0.3  
**Date:** 2026-02-26  
**Supersedes:** v0.1 (2026-02-23)  
**Status:** SSOT Candidate

---

## 1) Product Overview

### 1.1 What We're Building

**TRAVEL.aw** is a travel platform with two coupled but separable tracks, plus a skills execution pipeline:

- **Track A — Ecosystem Graph (SSOT knowledge graph):** A curated, validated, deterministic graph modeling the travel ecosystem (services, providers, capabilities, relationships) organized around a traveler journey model (J0–J8). Queryable and governed by registries/schemas/validation. **Status: Complete.** 59 nodes, 118 edges, 5 deterministic queries, full validation.

- **Track B — V1 Web App (traveler product):** A Next.js 16 app for trips, documents, points/loyalty, safety, friends, support; includes LLM-assisted parsing (loyalty program extraction via Anthropic Claude). Privacy-preserving with PII encryption. **Status: Security hardened.** All 6 requirements (B1–B6) implemented and merged.

- **Skills Pipeline — Sandboxed skill execution:** A three-layer security architecture: vetted skills registry (CI gates) → SkillRunner (Docker sandbox with egress enforcement) → web app integration. **Status: Complete through M1.** 83 tests passing, 2 skills (flight-search, hotel-search), 4 security bypass scenarios documented.

### 1.2 Three-Layer Security Architecture

```
prosy/travel-app (web app)  ←→  prosy/travel-aw-skills (registry)  ←→  SkillRunner (container runtime)
     │                                  │                                    │
  User request                    CI gates (3)                         Docker container
  Auth + validation          StopCrabs + Travel Rules              Declared egress only
  Result display             + Manifest Validation                 Resource limits + timeout
```

### 1.3 Strategic Direction

The longer-term vision encompasses a domain-specific agent marketplace ("TravelAgents") where traveler agents interact with commercial agents (hotels, DMOs, airlines, influencers). Commercial "ComBots" subsidize regular "NormieBots" through privacy-preserving advertising where agents pitch to other agents, keeping travelers anonymous until they choose to book. This is M2+ scope.

---

## 2) Goals and Non-Goals

### 2.1 Goals (Track A — Ecosystem Graph) ✅ COMPLETE

- ✅ Authoritative, queryable, deterministic ecosystem graph with SSOT governance
- ✅ Registries, schemas, validator enforcing integrity and determinism
- ✅ 59 nodes across J0–J8, 118 edges capturing core flows
- ✅ 5 MVP queries answerable with deterministic semantics

### 2.2 Goals (Track B — V1 Web App + LLM) ✅ COMPLETE

- ✅ All user-specific data routes require auth and enforce ownership
- ✅ Inbound email webhook authenticated with shared secret
- ✅ PII encrypted at rest with IV management
- ✅ LLM endpoints bounded, safe in failure, validated
- ✅ Repo drift resolved (middleware naming, CI alignment)

### 2.3 Goals (Skills Pipeline — M0 + M1) ✅ COMPLETE

- ✅ Skills registry with 3 CI gates (StopCrabs, travel rules, manifest validation)
- ✅ SkillRunner module: Docker spawn, stdin/stdout I/O, timeout, typed errors
- ✅ Egress enforcement via dead DNS + `--add-host` pre-resolution + `--cap-drop=ALL`
- ✅ Two skills: flight-search and hotel-search (Amadeus Self-Service, mock fallback)
- ✅ Web app integration: `/api/skills/invoke`, `/search/flights`, `/search/hotels`
- ✅ Security proof: 4 bypass scenarios documented with evidence

### 2.4 Goals (M2 — Agent Loop) 🔲 NEXT

- Agent orchestration: skill chaining (search → compare → book)
- Visual review surface for user approval before transactions
- Agent autonomy model (how much independence, how often check back)
- Foundation for agent marketplace architecture

### 2.5 Non-Goals (This PRD)

- Full UI redesign beyond what's required to support secure flows
- Real-time feeds or automated scraping for the ecosystem graph
- Enterprise RBAC/tenant management beyond current Auth0 model
- NanoClaw integration (DD-13: irrelevant — WhatsApp daemon, not a skill runtime)
- Payment/billing for API usage (M5)

---

## 3) Users and Use Cases

### 3.1 Personas

- **Traveler (end user):** Creates trips, stores travel docs, tracks loyalty accounts, manages safety contacts, searches flights/hotels.
- **Product/strategy researcher:** Queries Track A graph to understand ecosystem flows and capability gaps.
- **AI agent / internal tooling:** Consumes Track A graph and/or Track B user data (with strict permissions) for assistance. Future: autonomous agent operating on behalf of traveler.

### 3.2 Core Use Cases

- Track A: Ecosystem queries (inspiration→booking paths, capability gaps, integration points)
- Track B: Trip management, document storage, loyalty parsing, safety contacts
- Skills Pipeline: Flight search, hotel search, future skill types
- M2+: Agent-planned trips, multi-skill chains, commercial agent interactions

---

## 4) Functional Requirements

### 4A) Track A — Ecosystem Graph ✅ COMPLETE

All requirements (A1–A5) implemented and validated. 59 nodes, 118 edges, 0 validation errors.

### 4B) Track B — V1 Web App + LLM ✅ COMPLETE

All requirements (B1–B6) implemented and merged to main.

### 4C) Skills Pipeline ✅ COMPLETE (M0 + M1)

| Req | Description | Status |
|-----|-------------|--------|
| C1 | Skills registry with CI gates | ✅ 3 gates operational |
| C2 | SkillRunner module (Docker sandbox) | ✅ 83 tests passing |
| C3 | Egress enforcement | ✅ Dead DNS + add-host + cap-drop |
| C4 | First skills (flight + hotel) | ✅ Amadeus + mock fallback |
| C5 | Web app integration | ✅ API route + search pages |
| C6 | Security proof | ✅ 4 bypass scenarios documented |

### 4D) M2 — Agent Loop 🔲 PENDING SCOPING

Requirements to be defined in M2 scoping session.

---

## 5) Repo Map

| Repo | Remote | Local Path | Role |
|------|--------|------------|------|
| **App** | `prosy/travel-app` | `~/Projects/augmented-worlds/travel/` | Web app, SkillRunner, Track B, search UI, governance content |
| **Skills** | `prosy/travel-aw-skills` | `~/Documents/GitHub/travel-aw-skills/` | Skill source, manifests, CI gates |
| **Governance** | `prosy/travel.aw` | `~/Documents/GitHub/travel.aw/` | **Read-only archive.** Content copied to App repo. |

---

## 6) Resolved Decisions

| ID | Decision | Resolution |
|----|----------|------------|
| DD-01 | Toolchain | TypeScript validation (in App repo) |
| DD-02 | Bootstrap scope | Phased per Authority Pack v0.2 |
| DD-12 | Skill invocation | SkillRunner module (direct Docker spawn) |
| DD-13 | NanoClaw | Irrelevant — WhatsApp daemon, not skill runtime |
| DD-14 | Flight search API | Amadeus Self-Service sandbox |
| DD-15 | Hotel search API | Amadeus Self-Service sandbox |
| DD-16 | SmolVM | Deferred to M2+; watching for maturity |
| DD-17 | Egress enforcement | Dead DNS + `--add-host` + `--cap-drop=ALL` |

## 7) Open Decisions

| ID | Decision | Status | Blocking |
|----|----------|--------|----------|
| DD-07 | SUPER_APP providerType | Open | Nothing (revisit if junk drawer) |
| DD-18 | Shared vs per-skill Docker image | Open | Revisit at skill count > 2 |
| DD-19 | Agent marketplace architecture | Open | M2+ scoping |
| DD-20 | On-device model integration | Open | Watching 3B ecosystem |

---

## 8) Milestones

| Milestone | Description | Status |
|-----------|-------------|--------|
| Track A | Ecosystem Graph MVP | ✅ Complete |
| Track B | V1 Web App Security | ✅ Complete |
| M0 | Skills Registry + CI Gates | ✅ Complete |
| M1 | Skills Pipeline Integration | ✅ Complete |
| **M2** | **Agent Loop** | 🔲 Scoping |
| M3 | WhatsApp/Messaging Live | 🔲 Future |
| M4 | Monitoring Skills | 🔲 Future |
| M5 | Scale & Polish | 🔲 Future |

---

## 9) Pre-M2 Checklist (Human Gates)

- [ ] Amadeus live test (real API credentials)
- [ ] Auth0 e2e browser test
- [ ] Production env vars: `WEBHOOK_EMAIL_SECRET`, `ENCRYPTION_KEY`, `SKILLS_DIR`, Amadeus keys
- [ ] PII encryption migration script

---

## 10) Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| R1: Agent loop complexity (M2) | Define clear autonomy boundaries before building |
| R2: Amadeus sandbox rate limits (500/mo) | Mock fallback for dev; caching layer if needed |
| R3: SmolVM immaturity | SkillRunner abstraction enables future runtime swap |
| R4: Cost barriers for agent platforms | On-device 3B models collapse costs (watching ecosystem) |

---

## 11) Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-02-23 | v0.1 | Initial combined PRD (Track A + Track B) |
| 2026-02-26 | v0.3 | Major update: M0/M1 complete, NanoClaw→SkillRunner pivot, repo rename to prosy/travel-app, added skills pipeline section, M2 roadmap, resolved/open decisions updated |
