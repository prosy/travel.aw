# TRAVEL.aw — Integration Planning PRD v0.4
**Status:** SSOT Candidate  
**Date:** 2026-02-27  
**Supersedes:** PRD v0.3 (2026-02-26)  
**Authority Pack:** v0.3  
**Governance:** D-RAG + SDD (Spec-Driven Development)

---

## 0. Purpose

This PRD defines the complete integration plan for the next execution phase of Travel.aw. It resolves open decisions (DD-22, DD-23, DD-24), specifies the Amadeus→Duffel provider migration, locks the deployment architecture, and scopes M2 (conversation agent). All work items follow SDD discipline: specs before code, strict write scopes, deterministic validation.

---

## 1. Current State (Verified 2026-02-27)

| Area | Status | Evidence |
|------|--------|----------|
| Track A — Ecosystem graph | ✅ Complete | 59 nodes, 118 edges, all registries locked |
| Track B — Security (B1-B6) | ✅ Complete | Auth, webhooks, PII encryption, LLM hardening |
| M0 — Skills repo + CI | ✅ Complete | StopCrabs + TRAVEL-001/002/003 gates |
| M1 — SkillRunner + skills + web UI | ✅ Complete | 83 tests, flight-search + hotel-search skills |
| DD-21 — Orchestration model | ✅ Resolved | SkillRunner-first, A2A-ready |
| Vercel account | ✅ Established | Human gate cleared |
| Duffel account | ✅ Established | Replaces Amadeus (decommissioned July 2026) |

**Open decisions this PRD resolves:**

| ID | Decision | Resolution |
|----|----------|------------|
| DD-22 | Production runtime for SkillRunner | Split deploy: Vercel (web) + Railway (skills service) |
| DD-23 | Travel data provider | Duffel (flights + stays). Provider-agnostic adapter layer. |
| DD-24 | SDD governance adoption | Adopted. Spec → Contract → Code → Audit for all M2+ work. |

---

## 2. Architecture Decisions

### 2.1 Deployment Topology (DD-22 Resolution)

**Problem:** Vercel serverless cannot run Docker containers. SkillRunner requires container isolation for skill execution.

**Decision:** Split deployment with internal API boundary.

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  VERCEL (Web + API)         │     │  RAILWAY (Skills Service)    │
│                             │     │                              │
│  Next.js 16 app             │────▶│  Express/Fastify API         │
│  • Auth (Auth0)             │ TLS │  • SkillRunner.execute()     │
│  • Trip CRUD                │     │  • Docker container runtime  │
│  • LLM orchestration (M2)  │◀────│  • Egress enforcement        │
│  • Conversation UI (M2)    │     │  • Duffel API calls          │
│  • PII encryption           │     │                              │
│  Supabase ←→ Prisma         │     │  Env: DUFFEL_ACCESS_TOKEN    │
└─────────────────────────────┘     └──────────────────────────────┘
```

**Rationale:**

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Vercel only | Simplest deploy, zero infra | No Docker, no skill execution | ❌ Core feature missing |
| Railway only | Full Docker, single deploy | Lose Vercel Next.js optimizations, CDN | ❌ Worse DX + perf |
| Vercel + Railway | Best of both, clean separation | Two deploys, internal API auth needed | ✅ **Selected** |
| Vercel + Fly.io | Similar to Railway, global edge | More complex networking | ❌ Overkill for MVP |
| Self-hosted (Coolify/VPS) | Full control, lowest cost at scale | Ops burden, no auto-scaling | ❌ Premature |

**Internal API contract (Vercel → Railway):**
- Endpoint: `POST {SKILLS_SERVICE_URL}/invoke`
- Auth: Shared secret (`SKILLS_SERVICE_SECRET`) in `Authorization` header
- Payload: Same `SkillInput` schema from `@travel/skill-runner`
- Response: Same `SkillOutput` schema
- Timeout: 30s (flight search can be slow)
- **FUTURE:** When skill count exceeds ~5, evaluate WebSocket for streaming results

### 2.2 Provider Migration: Amadeus → Duffel (DD-23 Resolution)

**Problem:** Amadeus Self-Service portal decommissions July 17, 2026. Existing flight-search and hotel-search skills target Amadeus APIs.

**Decision:** Migrate to Duffel. Introduce provider adapter layer.

**Why Duffel:**

| Criterion | Duffel | Amadeus Self-Service | Notes |
|-----------|--------|---------------------|-------|
| API style | REST/JSON, modern | REST but legacy patterns | Duffel is developer-first |
| Flights | 300+ airlines, NDC+GDS+LCC | Broad but sunsetting self-service | Duffel includes NDC direct |
| Stays | 1M+ properties, commission model | Separate hotel API | Single integration |
| JS SDK | `@duffel/api` v4.21, TypeScript | `amadeus` npm, less maintained | Duffel SDK is actively maintained |
| Pricing | Pay-per-booking, free search* | Per-transaction | *1500:1 search-to-book ratio free |
| Booking capability | Full: search → book → manage | Full but sunsetting | Future-proof |
| Sandbox | Duffel Airways test airline | Airline sandboxes (unreliable) | Better test experience |
| Accreditation | Managed by Duffel (IATA) | Self-managed | Lower barrier |
| Loyalty | Supported (flights + stays) | Supported | Parity |
| Components | `@duffel/components` (seat maps, ancillaries) | None | Bonus UI components |

**Migration scope:**

| Skill | Current Provider | New Provider | Changes |
|-------|-----------------|-------------|---------|
| `flight-search` | Amadeus | Duffel Flights API | Rewrite `src/main.ts`, update `skill.yaml` egress |
| `hotel-search` | Amadeus | Duffel Stays API | Rewrite `src/main.ts`, update `skill.yaml` egress |

**Provider adapter pattern (in App repo):**

```typescript
// packages/adapters/src/flights.ts
interface FlightSearchAdapter {
  search(params: FlightSearchParams): Promise<FlightOffer[]>;
}

// packages/adapters/src/duffel/flights.ts
class DuffelFlightAdapter implements FlightSearchAdapter { ... }
```

**Rationale for adapter layer:** Even though we're committing to Duffel now, the adapter interface protects against future provider changes and enables multi-provider strategies (e.g., Duffel for flights, separate provider for activities at M3+).

**Duffel API flow (flights):**

```
1. Create OfferRequest (origin, dest, dates, passengers)
   → Returns offer_request_id + list of Offers
2. Get Offer details (prices, conditions, ancillaries)
3. Create Order (selected offer + passenger details + payment)
   → Returns booking_reference
```

**Duffel API flow (stays):**

```
1. Search accommodation (location, dates, guests)
   → Returns properties with rooms + rates
2. Get Quote (selected rate)
   → Returns confirmed price + cancellation policy
3. Create Booking (quote + guest details + payment)
   → Returns booking confirmation
```

**Environment variables (new):**

| Var | Purpose | Where |
|-----|---------|-------|
| `DUFFEL_ACCESS_TOKEN` | Duffel API auth | Railway (skills service) |
| `DUFFEL_WEBHOOK_SECRET` | Order change notifications | Railway (future) |
| `SKILLS_SERVICE_URL` | Railway service URL | Vercel |
| `SKILLS_SERVICE_SECRET` | Internal API auth | Both |

### 2.3 SDD Governance Adoption (DD-24)

**Problem:** Agent sessions drift when specs are implicit. CC context loss is systemic (documented in session 02-26).

**Decision:** Adopt Spec-Driven Development for all M2+ work.

**SDD additions to Authority Pack:**

| # | Path | Owns | Phase |
|---|------|------|-------|
| A24 | `authoritative/templates/SPEC_TEMPLATE.md` | Spec format for all deliverables | M2 |
| A25 | `authoritative/templates/WORK_CONTRACT.md` | CC task block format with write scope | M2 |
| A26 | `authoritative/schemas/work_contract.schema.json` | Machine-validatable work contract | M2 |

**SDD workflow per deliverable:**

```
1. SPEC.md — Human + Claude define behavior, interfaces, invariants
2. WORK_CONTRACT.json — Strict write scope, acceptance criteria, stop conditions
3. CC executes — Only permitted file edits, cites paths, runs validation
4. AUDIT — Deterministic hash check, git clean proof, test results
```

**This is not new process — it's formalizing what already works.** The M0-B2/B4 agent instructions were proto-SDD (pre-flight, allowlist, acceptance criteria). SDD makes it repeatable.

---

## 3. M2 Scope: Conversation Agent

### 3.1 What M2 Delivers

A traveler can chat with an AI agent that searches flights and hotels, presents results, and (with explicit approval) books travel. The agent uses SkillRunner skills as tools.

### 3.2 M2 Epics

| Epic | Description | Priority |
|------|-------------|----------|
| **M2-A** | Skills service deploy (Railway) | P0 — unblocks everything |
| **M2-B** | Duffel migration (flight-search + hotel-search) | P0 — provider replacement |
| **M2-C** | Conversation loop (LLM + tools) | P0 — core agent behavior |
| **M2-D** | Approval checkpoints (human-in-the-loop) | P0 — safety for bookings |
| **M2-E** | Conversation UI | P1 — chat surface |
| **M2-F** | Session persistence | P1 — conversations survive reload |

### 3.3 Epic Details

#### M2-A: Skills Service Deploy

**Goal:** SkillRunner accessible via authenticated HTTP API on Railway.

**Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| A1 | Create skills-service Express app | `POST /invoke` accepts SkillInput, returns SkillOutput |
| A2 | Add shared-secret auth middleware | Rejects requests without valid `SKILLS_SERVICE_SECRET` |
| A3 | Dockerize skills-service | `docker build` + `docker run` works locally |
| A4 | Deploy to Railway | Accessible via HTTPS, env vars configured |
| A5 | Wire Vercel → Railway | `/api/skills/invoke` proxies to Railway, passes user context |

**Interfaces:**

```typescript
// POST {SKILLS_SERVICE_URL}/invoke
// Headers: Authorization: Bearer {SKILLS_SERVICE_SECRET}
interface InvokeRequest {
  skillName: string;        // e.g., "flight-search"
  input: Record<string, unknown>;
  userId: string;           // For audit trail, NOT passed to skill
}

interface InvokeResponse {
  success: boolean;
  output?: SkillOutput;
  error?: { code: string; message: string };
}
```

**Invariants:**
- Skills service never receives PII (no passport numbers, no credit cards)
- Skills service has no database access
- All network egress from skills is enforced by SkillRunner
- Timeout: 30s max per invocation

---

#### M2-B: Duffel Migration

**Goal:** Replace Amadeus API calls with Duffel in both skills. Maintain same SkillInput/SkillOutput interfaces.

**Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| B1 | Install `@duffel/api` in skills repo | Package available, types imported |
| B2 | Rewrite flight-search skill for Duffel | Same input schema (origin, dest, dates, passengers), returns normalized offers |
| B3 | Rewrite hotel-search skill for Duffel | Same input schema (location, dates, guests), returns normalized properties |
| B4 | Update skill.yaml manifests | Egress: `api.duffel.com`, env: `DUFFEL_ACCESS_TOKEN` |
| B5 | Sandbox testing | Search SEA→NRT flights, search London hotels, verify response schemas |
| B6 | CI gates pass | StopCrabs + TRAVEL rules green on both skills |

**Output normalization (flight-search):**

```typescript
// Normalized from Duffel Offer → SkillOutput
interface FlightOffer {
  id: string;               // Duffel offer ID (needed for booking)
  airline: string;           // Operating carrier
  departure: string;         // ISO datetime
  arrival: string;           // ISO datetime
  duration: string;          // ISO 8601 duration
  stops: number;
  price: { amount: string; currency: string };
  cabinClass: string;
  co2Estimate?: number;      // kg, Duffel provides this
  expiresAt: string;         // Offer expiry — critical for booking flow
  segments: FlightSegment[]; // Individual flights
}
```

**Output normalization (hotel-search):**

```typescript
interface HotelResult {
  id: string;                // Duffel accommodation ID
  name: string;
  description: string;
  location: { lat: number; lng: number };
  rating: number;            // 1-10 scale (Duffel consolidated)
  rooms: HotelRoom[];
  photos: string[];          // URLs
  amenities: string[];
}

interface HotelRoom {
  id: string;
  name: string;
  rate: { amount: string; currency: string };
  cancellationPolicy: string;
  boardType: string;         // room_only, breakfast, etc.
  loyaltyEligible: boolean;
}
```

---

#### M2-C: Conversation Loop

**Goal:** LLM receives user message, decides which skills to call, presents results, iterates.

**Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| C1 | Create conversation API route | `POST /api/chat` accepts message + conversationId, returns assistant response |
| C2 | LLM tool definitions | Claude sees flight-search and hotel-search as callable tools |
| C3 | Tool execution loop | LLM can call skill → get result → decide next action → call another skill |
| C4 | Streaming response | Assistant response streams to client via SSE |
| C5 | Error handling | Skill failures surface as natural language ("I couldn't find flights, try different dates") |

**Architecture:**

```typescript
// apps/web/app/api/chat/route.ts
// Uses Anthropic Messages API with tool_use

const tools = [
  {
    name: "search_flights",
    description: "Search for flights between airports on specific dates",
    input_schema: { /* FlightSearchParams JSON Schema */ }
  },
  {
    name: "search_hotels", 
    description: "Search for hotel accommodation in a location",
    input_schema: { /* HotelSearchParams JSON Schema */ }
  }
];

// Loop: send message → if tool_use, execute via skills service → continue
```

**LLM configuration:**
- Model: `claude-sonnet-4-20250514` (configurable via `LLM_MODEL` env var)
- System prompt: Traveler assistant persona, uses ecosystem graph knowledge
- Max tool calls per turn: 3 (prevent runaway)
- Max conversation turns: 50

**NOT in M2-C scope:**
- Booking tools (M2-D adds approval gates first)
- Memory across sessions (M2-F)
- Multi-agent routing

---

#### M2-D: Approval Checkpoints

**Goal:** Before any booking/payment action, pause for explicit human confirmation.

**Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| D1 | Define approval-required tool list | `book_flight`, `book_hotel` flagged as requiring approval |
| D2 | Approval pause mechanism | When LLM requests booking tool, return approval prompt instead of executing |
| D3 | Approval UI component | User sees booking details + Confirm/Cancel buttons |
| D4 | Approved execution | On confirm, execute booking skill with original parameters |
| D5 | Audit trail | All approvals/rejections logged with timestamp and parameters |

**Flow:**

```
User: "Book the Delta flight for $342"
LLM: [tool_use: book_flight {offer_id: "off_xxx", ...}]
System: [PAUSE — approval required]
UI: "Ready to book Delta DL1234 SEA→NRT for $342.00. Confirm?"
User: [clicks Confirm]
System: [execute book_flight via skills service]
LLM: "Your flight is booked! Confirmation: DL-ABC123"
```

**This enforces TRAVEL-003 at runtime**, complementing CI enforcement.

---

#### M2-E: Conversation UI

**Goal:** Chat interface where traveler interacts with the agent.

**Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| E1 | Chat page route | `/chat` — authenticated, responsive |
| E2 | Message input + display | Text input, message bubbles, streaming response display |
| E3 | Skill results display | Flight/hotel results rendered as cards, not raw JSON |
| E4 | Approval prompts inline | Booking confirmations appear as interactive cards in chat |
| E5 | Loading states | Skeleton loaders during skill execution (can take 5-15s) |

**Tech:**
- React Server Components for page shell
- Client components for chat interaction
- SSE for streaming LLM responses
- Tailwind for styling (existing in project)

---

#### M2-F: Session Persistence

**Goal:** Conversations persist across page reloads and browser sessions.

**Stories:**

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| F1 | Conversation model in Prisma | `Conversation` + `Message` tables, linked to user |
| F2 | Save messages on send/receive | Each message persisted with role, content, toolCalls |
| F3 | Load conversation on page load | Previous messages restored from DB |
| F4 | Conversation list | User can see and resume past conversations |

**Schema addition:**

```prisma
model Conversation {
  id        String    @id @default(cuid())
  userId    String
  title     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
  user      User      @relation(fields: [userId], references: [id])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           String       // user | assistant | tool
  content        String       @db.Text
  toolCalls      Json?        // Tool use blocks if role=assistant
  toolResults    Json?        // Tool results if role=tool
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])
}
```

---

## 4. Implementation Sequence

### Phase 1: Infrastructure (M2-A + M2-B) — ~3 sessions

```
Session 1: M2-A (skills service)
  SPEC: Skills service API contract, auth, Docker
  CC: Create Express app, Dockerfile, deploy to Railway
  GATE: POST /invoke returns mock result from Railway URL

Session 2: M2-B (Duffel migration)  
  SPEC: Duffel API integration, output normalization schemas
  CC: Rewrite flight-search + hotel-search, update manifests
  GATE: Sandbox search works end-to-end (Vercel → Railway → Duffel)

Session 3: Integration test
  CC: Wire Vercel proxy → Railway, test with Duffel sandbox
  GATE: /api/skills/invoke on Vercel returns Duffel search results
```

### Phase 2: Agent Core (M2-C + M2-D) — ~3 sessions

```
Session 4: M2-C (conversation loop)
  SPEC: Chat API, tool definitions, execution loop
  CC: Build /api/chat route with Anthropic tool_use
  GATE: Chat returns flight results via tool execution

Session 5: M2-D (approval checkpoints)
  SPEC: Approval protocol, audit trail schema
  CC: Add approval pause + confirm flow
  GATE: Booking tool triggers approval, confirm executes

Session 6: M2-C + M2-D integration
  CC: End-to-end: search → select → approve → book (sandbox)
  GATE: Full booking flow works in Duffel test mode
```

### Phase 3: UX (M2-E + M2-F) — ~2 sessions

```
Session 7: M2-E (conversation UI)
  SPEC: Chat page wireframe, component hierarchy
  CC: Build /chat page with streaming + result cards
  GATE: User can search flights via chat interface

Session 8: M2-F (persistence) + polish
  CC: Prisma migration, save/load messages, conversation list
  GATE: Conversations survive page reload
```

**Total: ~8 CC sessions for complete M2.**

---

## 5. Environment & Config Summary

### Vercel (Web App)

| Var | Purpose |
|-----|---------|
| `AUTH0_*` | Authentication (existing) |
| `DATABASE_URL` | Supabase Postgres (existing) |
| `ENCRYPTION_KEY` | PII encryption (existing) |
| `WEBHOOK_EMAIL_SECRET` | Inbound email auth (existing) |
| `SKILLS_SERVICE_URL` | Railway skills service URL (new) |
| `SKILLS_SERVICE_SECRET` | Internal API auth (new) |
| `ANTHROPIC_API_KEY` | LLM orchestration (new for M2-C) |
| `LLM_MODEL` | Model selection, default `claude-sonnet-4-20250514` (new) |

### Railway (Skills Service)

| Var | Purpose |
|-----|---------|
| `SKILLS_SERVICE_SECRET` | Validates incoming requests |
| `DUFFEL_ACCESS_TOKEN` | Duffel API authentication |
| `SKILLS_DIR` | Path to skills directory (baked into Docker image) |

---

## 6. Risks & Mitigations

| ID | Risk | Impact | Mitigation |
|----|------|--------|-----------|
| R1 | Duffel Stays API access may require approval | Blocks hotel-search | Apply during account setup. Flight-search works immediately. |
| R2 | Railway cold starts add latency | Slow first skill call | Keep service awake with health check cron. Scale to zero disabled. |
| R3 | Duffel offer expiry (30min) | Stale prices at booking time | Re-fetch offer before booking confirmation. Show expiry in UI. |
| R4 | Internal API (Vercel→Railway) auth compromise | Unauthorized skill execution | Rotate `SKILLS_SERVICE_SECRET` quarterly. Rate limit on Railway. |
| R5 | LLM cost for conversation agent | Unexpected API bills | Sonnet (not Opus) by default. Max 3 tool calls/turn. Usage monitoring. |
| R6 | Duffel sandbox behavior differs from production | Integration bugs in prod | Test with Duffel Airways (dedicated sandbox airline). |

---

## 7. SDD Compliance Checklist

Every M2 CC session must include:

```
1. SPEC.md — What are we building? Inputs, outputs, invariants.
2. WRITE SCOPE — Which files can CC edit? (explicit allowlist)
3. ACCEPTANCE CRITERIA — How do we know it's done? (testable)
4. STOP CONDITIONS — When does CC halt and report?
5. VALIDATION — What tests/checks run before "done"?
6. EVIDENCE — Commit hash, test output, no-write-proof for excluded files.
```

---

## 8. Open Decisions (Remaining)

| ID | Decision | Status | Notes |
|----|----------|--------|-------|
| DD-07 | SUPER_APP providerType | Open | Revisit if junk drawer |
| DD-18 | Shared vs per-skill Docker image | Open | Revisit at skill count > 5 |
| DD-19 | Agent marketplace architecture | Open | ComBots/NormieBots — M3+ |
| DD-20 | On-device model integration | Open | Watching 3B ecosystem |
| DD-25 | Booking skills scope | **NEW — Open** | M2-D defines approval flow. Actual flight-book + hotel-book skills are M2 stretch or M3. |
| DD-26 | Duffel payment method | **NEW — Open** | Duffel Balance vs card tokenization. Affects booking skill implementation. |

---

## 9. Success Criteria (M2 Complete)

- [ ] Skills service running on Railway, accessible from Vercel
- [ ] Flight search returns Duffel results via conversation
- [ ] Hotel search returns Duffel results via conversation
- [ ] Booking attempt triggers approval checkpoint
- [ ] Approved booking executes in Duffel sandbox
- [ ] Conversations persist across page reloads
- [ ] All CI gates green (StopCrabs + TRAVEL rules)
- [ ] No PII transmitted to skills service
- [ ] LLM model configurable via env var

---

## 10. Appendix: Duffel API Reference (Quick)

### Authentication
```bash
curl -H "Authorization: Bearer duffel_test_xxx" https://api.duffel.com/air/offer_requests
```

### Flight Search (OfferRequest)
```json
POST /air/offer_requests
{
  "data": {
    "slices": [
      { "origin": "SEA", "destination": "NRT", "departure_date": "2026-06-15" }
    ],
    "passengers": [{ "type": "adult" }],
    "cabin_class": "economy"
  }
}
```

### Stays Search
```json
POST /stays/search
{
  "data": {
    "check_in_date": "2026-06-15",
    "check_out_date": "2026-06-20",
    "rooms": 1,
    "guests": [{ "type": "adult" }],
    "location": { "radius": 5, "geographic_coordinates": { "latitude": 51.5, "longitude": -0.1 } }
  }
}
```

### JS SDK
```typescript
import { Duffel } from '@duffel/api';
const duffel = new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN });

// Flight search
const offerRequest = await duffel.offerRequests.create({
  slices: [{ origin: "SEA", destination: "NRT", departure_date: "2026-06-15" }],
  passengers: [{ type: "adult" }],
  cabin_class: "economy",
  return_offers: true
});

// Stays search  
const results = await duffel.stays.search({
  check_in_date: "2026-06-15",
  check_out_date: "2026-06-20",
  rooms: 1,
  guests: [{ type: "adult" }],
  location: { radius: 5, geographic_coordinates: { latitude: 51.5, longitude: -0.1 } }
});
```

### Pricing Model
- **Flights:** Per-booking fee (search is free up to 1500:1 ratio)
- **Stays:** Commission profit-share on completed bookings
- **No upfront costs.** Pay-as-you-go.
- **Managed accreditation:** Duffel holds IATA authority, no need for own license

---

## 11. Appendix: File Swap Checklist (Project Files)

Complete these swaps in Claude Project settings:

| Action | File |
|--------|------|
| **Replace** | `TRAVEL_aw_COMBINED_PRD_2026-02-23.md` → this file |
| **Replace** | `TRAVEL_AUTHORITY_PACK_v0_2.md` → v0.3 |
| **Replace** | `TRAVEL_ECOSYSTEM_SPEC_v0_2.md` → v0.3 |
| **Remove** | `M0_B2_SKILLS_REPO_AGENT_INSTRUCTIONS.md` (executed) |
| **Remove** | `M0_B4_TRAVEL_RULES_AGENT_INSTRUCTIONS.md` (executed) |
| **Keep** | `TRAVEL_PROJECT_MANIFEST.md` (update Railway info after M2-A) |

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-02-23 | v0.1 | Initial combined PRD (Track A + Track B) |
| 2026-02-26 | v0.3 | M0/M1 marked complete, SkillRunner pivot |
| 2026-02-27 | v0.4 | Integration PRD: DD-22/23/24 resolved, Duffel migration, M2 scope, SDD adoption |
