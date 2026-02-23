# TRAVEL.aw — Comprehensive PRD (Combined: Ecosystem Graph SSOT + V1 Web App w/ LLM)
**Version:** 0.1 (draft)  
**Date:** 2026-02-23  
**Source inputs:**  
- Ecosystem spec review based on `Downloads/TRAVEL_ECOSYSTEM_SPEC_v0_2.md`  
- V1 website/LLM review based on `~/Projects/travel` (Next.js 16 + Auth0 + Prisma + Anthropic)

---

## 1) Product overview

### 1.1 What we’re building
**TRAVEL.aw** is a travel platform with two coupled but separable tracks:

- **Track A — Ecosystem Graph (SSOT knowledge graph):** a curated, validated, deterministic graph modeling the travel ecosystem (services, providers, capabilities, relationships) organized around a traveler journey model (J0–J8). It is queryable and governed by registries/schemas/validation.
- **Track B — V1 Web App (traveler product):** a Next.js app for trips, documents, points/loyalty, safety, friends, support; includes **LLM-assisted parsing** (currently loyalty program extraction via Anthropic Claude). Track B must be secure and privacy-preserving because it handles PII.

### 1.2 Why two tracks
- Track A provides **structured domain truth** and deterministic analysis of the ecosystem (useful for product strategy, agent grounding, capability mapping).
- Track B provides **end-user workflows** and data capture; it can later be augmented by Track A (e.g., smarter trip planning, integration recommendations), but **Track B must be hardened now** to be safe to run.

---

## 2) Goals and non-goals

### 2.1 Goals (Track A — Ecosystem Graph)
- Produce an **authoritative, queryable, deterministic** ecosystem graph with SSOT governance:
  - Registries (journey stages, provider types, relationship types, capability C-codes)
  - Schemas (node/edge)
  - Validator enforcing: schema validity, enum integrity, referential integrity, determinism
- Seed a representative dataset meeting MVP targets:
  - 30–60 nodes across J0–J8
  - 100–200 edges capturing core flows
- Support deterministic answers for the MVP query set defined in the spec, with **explicit semantics**.

### 2.2 Goals (Track B — V1 Web App + LLM)
- Ensure **no unauthorized access** to user trip data and related resources.
- Secure inbound email ingestion (webhook) to prevent abuse and cross-user corruption.
- Ensure PII marked “Encrypted” is **actually encrypted at rest** (not just comments).
- Harden LLM endpoints to reduce cost/DoS risk and avoid leaking sensitive content.
- Reduce repo drift (middleware/authz config inconsistencies; CI tool mismatch).

### 2.3 Non-goals (this PRD)
- Full UI redesign beyond what’s required to support secure flows.
- Real-time feeds or automated scraping for the ecosystem graph.
- Building a browsing UI for the ecosystem graph (post-MVP).
- Enterprise RBAC/tenant management (beyond current Auth0 user model) unless required by security.

---

## 3) Users and use cases

### 3.1 Personas
- **Traveler (end user):** creates trips, stores travel docs, tracks loyalty accounts, manages safety contacts.
- **Product/strategy researcher:** queries Track A graph to understand ecosystem flows and capability gaps.
- **AI agent / internal tooling:** consumes Track A graph and/or Track B user data (with strict permissions) for assistance.

### 3.2 Core use cases
- Track A:
  - “Which nodes influence J0 inspiration but monetize in J3 booking?”
  - “Common paths social inspiration → booking”
  - “Local event discovery in-trip”
  - “Itinerary manager integration points”
  - “Nearby now vs upcoming by city” (requires explicit place semantics)
- Track B:
  - Create/manage trips and items
  - Parse loyalty program info from image/text
  - Store travel documents securely
  - Manage emergency contacts
  - View safety advisories and alerts
  - Friends/collaboration and support tickets

---

## 4) Functional requirements

## 4A) Track A — Ecosystem Graph (SSOT)

### A1. Registries are SSOT
**Requirement:** All enums and codes must be defined only in registries, not ad hoc in seeds.  
**Acceptance criteria:**
- Validator fails on unknown `journeyStages`, `providerType`, `capabilities`, `relationship type`.
- Seed dataset contains only registry-defined values.

### A2. Deterministic IDs and directionality
**Requirement:** Node IDs and edge IDs must be unambiguous and machine-checkable.  
**Acceptance criteria:**
- Node `id` format is validated against a single documented rule.
- Edge `id` format is validated against a single documented rule that is delimiter-safe (no ambiguity due to underscores in IDs).
- Bidirectional relationships have a single canonical storage rule (no “sometimes double edge, sometimes single edge”).

### A3. Referential and uniqueness integrity
**Requirement:** No orphan edges, no ambiguous duplicates.  
**Acceptance criteria:**
- Every `edge.fromId` and `edge.toId` resolves to an existing node.
- No self-edges unless explicitly permitted (default: forbidden).
- Duplicate definition is explicit (e.g., uniqueness on `(fromId,toId,type)`).

### A4. Query determinism contract
**Requirement:** MVP queries must be answerable with deterministic semantics defined in the cookbook/validator outputs.  
**Acceptance criteria:**
- Each MVP query has:
  - start/end node predicates (capability/stage-based)
  - allowed edge types for traversal
  - max depth / path uniqueness rules
  - deterministic sort order for results
- Two runs produce byte-identical outputs for the same dataset.

### A5. Place/city modeling for “given city” query
**Requirement:** If the city query remains in MVP, the data model must represent city scope.  
**Acceptance criteria (choose one approach and lock it):**
- Either: explicit “Place” node type + relationships (e.g., `LOCATED_IN`, `SERVES_PLACE`), OR
- City query deferred post-MVP and removed from MVP acceptance list, OR
- City scope represented as a required structured field on certain nodes (less preferred due to drift risk).

---

## 4B) Track B — V1 Web App + LLM

### B1. Authentication & authorization consistency
**Requirement:** All user-specific data routes must require auth and enforce ownership/membership.  
**Acceptance criteria:**
- Unauthenticated requests to user-specific endpoints return `401`.
- Authenticated non-owner/non-member requests return `403`.
- No endpoint leaks trip items or PII based solely on knowing an ID.

### B2. Trips with `userId=null` are not public
**Requirement:** Legacy/orphan trips must not be readable publicly by default.  
**Acceptance criteria:**
- Remove any “public read if `userId` is null” exceptions.
- Access to trips and items requires ownership or accepted membership (or a separate, explicit claim flow).

### B3. Inbound email ingestion must be protected by a shared secret
**Requirement:** `/api/email/inbound` must reject unauthenticated requests and must not attach to arbitrary trips.  
**Acceptance criteria:**
- Requests without valid `SENDGRID_SECRET` (or equivalent) return `401` and do not write to DB.
- Endpoint stores inbound payload safely, without auto-linking to “latest trip.”
- Payload limits are enforced (prevent abuse and runaway DB growth).

### B4. PII encryption must match schema intent
**Requirement:** Fields annotated “Encrypted” are encrypted at rest with IV management.  
**Acceptance criteria:**
- Emergency contact phone/email: encrypted at rest; decrypted only for the owning user.
- Loyalty account numbers: encrypted at rest; not leaked in list responses.
- If `ENCRYPTION_KEY` is missing/invalid: fail closed (`503`) for routes that need encryption.

### B5. LLM parsing endpoint hardening
**Requirement:** LLM calls must be bounded, safe in failure, and validated.  
**Acceptance criteria:**
- Enforce max request sizes for images/text.
- Remove returning raw model output on parse errors (no sensitive echo).
- Validate model output with a strict schema before returning.
- Model name configurable via environment variable.

### B6. Repo drift and ops correctness
**Requirement:** Security posture and docs/CI reflect reality.  
**Acceptance criteria:**
- Middleware/authz enforcement is either implemented or claims removed.
- CI uses pnpm version compatible with repo (`packageManager` field).
- Deploy docs do not instruct unauthenticated verification of endpoints that require auth behavior.

---

## 5) Data and system design constraints

### Track A constraints
- No network calls in validation.
- Deterministic output ordering and formatting.
- Append-only seeds; immutable IDs.

### Track B constraints
- Multi-tenant safety: all reads/writes scoped to current user (or membership).
- No “best effort” parsing of untrusted webhooks/LLM responses—fail safely.
- Avoid storing sensitive raw content unnecessarily; minimize raw echo in responses/logging.

---

## 6) Milestones (requirements-level; not a project schedule)

### Milestone A (Track A MVP readiness)
- Registries + schemas drafted and locked
- Validator exists and enforces integrity/determinism
- Seed dataset meets coverage targets
- Query cookbook returns deterministic answers for MVP queries

### Milestone B (Track B security baseline)
- All user-specific endpoints gated and ownership enforced
- Inbound email webhook authenticated + safe storage behavior
- PII encryption implemented for contacts + account numbers
- LLM parse endpoint bounded + validated
- CI/deploy documentation aligned with actual auth behavior

---

## 7) Risks and mitigations

### R1: “Deterministic queries” become subjective (Track A)
- Mitigation: lock explicit query semantics (predicates, traversal rules, sorting).

### R2: Webhook abuse and cross-user corruption (Track B)
- Mitigation: shared secret auth + remove “link to latest trip” behavior + payload limits.

### R3: False sense of encryption (Track B)
- Mitigation: implement IV storage + encrypt/decrypt paths + fail closed when key missing.

### R4: LLM leakage/cost blowups (Track B)
- Mitigation: size limits, safe errors (no raw model text), schema validation, configurable model, rate limiting (later).

---

## 8) Open decisions to record (single decision log)
- Track A:
  - Edge ID delimiter rule and bidirectional storage rule
  - Place/city modeling approach (or deferral)
  - Toolchain choices for validator/query execution
- Track B:
  - Exact webhook auth mechanism (header/query param naming, rotation strategy)
  - Whether to introduce centralized authz enforcement (middleware/policy-as-code) vs per-route only

---

## 9) Appendices (source touchpoints)
- Ecosystem spec source: `Downloads/TRAVEL_ECOSYSTEM_SPEC_v0_2.md`
- V1 app repo: `Projects/travel`
  - LLM route: `Projects/travel/apps/web/app/api/points/parse/route.ts`
  - Email webhook: `Projects/travel/apps/web/app/api/email/inbound/route.ts`
  - Trips: `Projects/travel/apps/web/app/api/trips/**`
  - Encryption utilities: `Projects/travel/apps/web/app/_lib/encryption.ts`
  - Prisma schema: `Projects/travel/prisma/schema.prisma`
