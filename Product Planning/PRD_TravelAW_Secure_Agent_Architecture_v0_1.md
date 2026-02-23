# PRD: Travel.aw Secure Agent Architecture

**Version:** 0.1 DRAFT  
**Date:** 2026-02-22  
**Status:** Discovery  

---

## 1. Problem Statement

The agentic AI travel space is exploding — Google, Expedia (Romie), Booking.com, Trip.com (TripGenie), and Navan are all shipping AI travel agents. Meanwhile, the open-source OpenClaw framework (195K GitHub stars) has demonstrated massive consumer appetite for personal AI agents, but with catastrophic security: 135K+ exposed instances, data exfiltration in unvetted skills, and prompt injection vulnerabilities across the board.

The OpenClaw skill ecosystem (ClawHub, Moltdirectory, VoltAgent) has 500+ skills across 287+ AI/LLM, 212+ DevOps, and 132+ communication categories — but **zero travel-specific skills** and **no security vetting process**. Skills are "just Markdown files with instructions" that agents execute blindly.

Travel is a uniquely high-risk domain for unvetted agents: credit card data, passport numbers, real-time location, and personal itineraries flow through every transaction. The industry needs a secure, curated agent layer — not an open bazaar.

## 2. Product Vision

A three-layer product that meets users where they are today (web UI) while building toward where they're going (agent-first):

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1: travel.aw                                 │
│  Web front-door — visual UI for discovery,          │
│  search, booking, itinerary management              │
│  (People need to SEE things. Transition interface.) │
├─────────────────────────────────────────────────────┤
│  LAYER 2: Travel Skills Registry (Private)          │
│  Curated, StopCrabs-vetted travel skills only       │
│  Approval gate: scan → review → sign → publish      │
├─────────────────────────────────────────────────────┤
│  LAYER 3: NanoClaw Runtime (Secure Container)       │
│  Container-isolated agent execution                 │
│  Per-trip sandboxed context + memory                │
│  Claude Agent SDK (single model, auditable)         │
└─────────────────────────────────────────────────────┘
```

**The key insight:** Most users aren't ready for agents-only interfaces. Travel.aw is the front door they can see and trust. Behind it, the agent layer handles the hard parts (price monitoring, rebooking, disruption management). Over time, the balance shifts from "user drives via UI" to "agent drives, user approves."

## 3. Architecture

### 3.1 Component Stack

| Component | Repo | Role | Status |
|-----------|------|------|--------|
| **travel.aw** | travel-aw/web | Web UI — discovery, search, booking, itinerary | Built |
| **StopCrabs** | prosy/StopCrabs | Security scanner — 21 OC vuln classes, 37 rules, 4 backends | Built (needs Supabase reattach) |
| **NanoClaw** | qwibitai/nanoclaw (fork) | Container-isolated agent runtime, WhatsApp I/O, Claude Agent SDK | Fork + customize |
| **Travel Skills** | travel-aw/skills (new, private) | Curated registry of vetted travel-specific agent skills | New |

### 3.2 Security Flow

```
Skill author submits PR to travel-aw/skills
        │
        ▼
┌───────────────────────────────────────────┐
│  GATE 1: StopCrabs CI Scan               │
│  stopcrabs scan skills/add-X/ \           │
│    --severity medium --format sarif       │
│                                           │
│  Checks against OC taxonomy:             │
│  • OC-001 Malicious skill payload        │
│  • OC-003 Prompt injection vectors       │
│  • OC-005 Confused deputy patterns       │
│  • OC-008 Hardcoded secrets              │
│  • OC-011 Data exfiltration paths        │
│  • OC-014 Execution boundary escapes     │
│  • OC-018 Missing egress controls        │
│                                           │
│  Exit 0 required to proceed              │
└───────────────┬───────────────────────────┘
                │ pass
                ▼
┌───────────────────────────────────────────┐
│  GATE 2: Human Code Review               │
│  Claude Code generates the skill          │
│  transform → produces auditable git diff  │
│  Reviewer checks actual code changes      │
│  (Not runtime behavior — static diff)     │
└───────────────┬───────────────────────────┘
                │ approved + merged
                ▼
┌───────────────────────────────────────────┐
│  GATE 3: NanoClaw Container Sandbox       │
│  Skill runs in isolated Linux container   │
│  • Only mounted dirs visible              │
│  • Per-trip CLAUDE.md context             │
│  • No host filesystem access              │
│  • Egress limited to declared APIs        │
└───────────────────────────────────────────┘
```

**Three gates, not zero.** OpenClaw has no gates. ClawHub has aspirational "verification" with no automated scanning. This is the only stack that combines automated vulnerability scanning (StopCrabs) + human review (Claude Code diffs) + runtime isolation (NanoClaw containers).

### 3.3 Contrast with OpenClaw Ecosystem

| | OpenClaw + ClawHub | Travel.aw Stack |
|---|---|---|
| **Skill install** | Download SKILL.md, drop in directory | PR → StopCrabs scan → human review → merge |
| **Runtime isolation** | Single Node process, shared memory | Linux container per group, filesystem isolation |
| **Skill vetting** | None (Cisco found exfil in 3rd-party skill) | 21 OC vuln classes, 37 detection rules, 4 backends |
| **LLM binding** | Any (Claude, DeepSeek, GPT) — attacker can swap | Claude Agent SDK only — single auditable model |
| **Skill scope** | 500+ general-purpose, no travel category | Travel-specific only, curated for domain |
| **Secret handling** | Hardcoded in configs, documented as known risk | StopCrabs OC-008 blocks plaintext secrets in CI |
| **Egress control** | None — skill can POST anywhere | Container + declared API allowlist |

## 4. Travel Skills Registry

### 4.1 Registry Design

Private GitHub repo: `travel-aw/skills`

```
travel-aw/skills/
├── .github/
│   └── workflows/
│       └── stopcrabs-gate.yml        # CI: scan on every PR
├── registry.yaml                      # Manifest of approved skills
├── skills/
│   ├── flight-search/
│   │   └── SKILL.md                   # Claude Code transform
│   ├── hotel-booking/
│   │   └── SKILL.md
│   ├── amadeus-gds/
│   │   └── SKILL.md
│   ├── itinerary-sync/
│   │   └── SKILL.md
│   ├── expense-split/
│   │   └── SKILL.md
│   ├── price-monitor/
│   │   └── SKILL.md
│   ├── disruption-rebook/
│   │   └── SKILL.md
│   └── loyalty-track/
│       └── SKILL.md
└── stopcrabs.yaml                     # Scanner config for travel context
```

### 4.2 Skill Roadmap (Priority Order)

Skills map to capability codes from the ecosystem research CSV:

| Priority | Skill | Capability Code | API Integration | Risk Profile |
|----------|-------|-----------------|-----------------|--------------|
| P0 | `/add-flight-search` | C-FLIGHT-SEARCH | Google Flights, Skyscanner | Low (read-only) |
| P0 | `/add-hotel-search` | C-HOTEL-SEARCH | Booking.com, Expedia Rapid | Low (read-only) |
| P0 | `/add-itinerary-sync` | C-ITIN-MGMT | TripIt email parsing | Medium (email access) |
| P1 | `/add-price-monitor` | C-PRICE-COMPARE | KAYAK, Google Travel | Low (read-only + scheduled) |
| P1 | `/add-expense-split` | C-EXPENSE-MGMT | Splitwise API | Medium (financial data) |
| P1 | `/add-amadeus-gds` | C-API-PLATFORM | Amadeus REST API | High (booking transactions) |
| P2 | `/add-disruption-rebook` | C-AI-AGENT | Airline NDC APIs | High (autonomous rebooking) |
| P2 | `/add-loyalty-track` | C-LOYALTY-MGMT | AwardWallet API | Medium (account credentials) |
| P3 | `/add-local-discovery` | C-LOCAL-DISCOVERY | Google Maps, Yelp | Low (read-only) |
| P3 | `/add-transit-plan` | C-TRANSIT-INFO | Google Maps Transit, Rome2Rio | Low (read-only) |

### 4.3 StopCrabs CI Configuration

```yaml
# stopcrabs.yaml — travel skills context
severity_threshold: medium
fail_on_blocking: true

# Travel-specific rule additions
custom_rules:
  - id: TRAVEL-001
    name: "PII in skill payload"
    description: "Skill references passport, SSN, credit card patterns"
    severity: critical
    backend: regex

  - id: TRAVEL-002
    name: "Unbounded API egress"
    description: "Skill makes HTTP requests to undeclared endpoints"
    severity: high
    backend: config

  - id: TRAVEL-003
    name: "Booking without confirmation"
    description: "Skill executes financial transactions without human-in-loop"
    severity: high
    backend: ast
```

## 5. User Experience Progression

### 5.1 Phase 1 — Web-First (Now)

```
User → travel.aw web UI → searches, compares, books visually
                         → agent handles background tasks:
                            • price monitoring
                            • itinerary sync from email
                            • expense categorization
```

The web UI is the trust surface. Users see results, make choices, confirm actions. Agent works behind the scenes on low-risk, high-tedium tasks.

### 5.2 Phase 2 — Hybrid (3-6 months)

```
User → travel.aw web UI  ←→  WhatsApp agent (NanoClaw)
       (visual decisions)      (conversational commands)

"@TravelAW monitor flights LAX→NRT for under $800"
"@TravelAW what's my itinerary for next week?"
"@TravelAW split the Airbnb cost with Sarah and Mike"
```

WhatsApp channel via NanoClaw becomes the conversational companion. Web UI remains for visual tasks (comparing hotel photos, reviewing maps, browsing itineraries).

### 5.3 Phase 3 — Agent-First (6-12 months)

```
User → WhatsApp: "Plan a week in Japan, mid-April, ~$3K budget"
       Agent → searches flights (vetted skill)
             → searches hotels (vetted skill)
             → builds itinerary (vetted skill)
             → presents options on travel.aw for visual review
             → books on approval
             → monitors for disruptions
             → auto-rebooks if policy allows
```

Agent drives the workflow. Web UI becomes the approval/review surface. Human-in-loop for financial transactions (TRAVEL-003 rule enforces this).

## 6. NanoClaw Fork Specification

### 6.1 Fork Customizations

Base: `qwibitai/nanoclaw` → Fork: `travel-aw/nanoclaw`

| Customization | Details |
|---------------|---------|
| **Trigger word** | `@TravelAW` (via Claude Code: "Change trigger word to @TravelAW") |
| **Group structure** | Pre-configured groups: `trip-planning`, `expense-tracking`, `booking-mgmt` |
| **Skills source** | Private `travel-aw/skills` repo only — no ClawHub, no Moltdirectory |
| **Container egress** | Allowlist: Amadeus, Skyscanner, Booking.com, Google APIs, Splitwise, TripIt |
| **Memory model** | Per-trip CLAUDE.md with itinerary context, preferences, budget |
| **Scheduled tasks** | Price monitoring (daily), itinerary sync (on email receipt), expense summary (weekly) |

### 6.2 Architecture (Forked)

```
WhatsApp (baileys) ──→ SQLite ──→ Polling loop ──→ Container (Claude Agent SDK)
                                                          │
                                                   ┌──────┴──────┐
                                                   │ CLAUDE.md   │
                                                   │ (per-trip   │
                                                   │  context)   │
                                                   ├─────────────┤
                                                   │ Vetted      │
                                                   │ Skills Only │
                                                   │ (from       │
                                                   │  travel-aw/ │
                                                   │  skills)    │
                                                   ├─────────────┤
                                                   │ API         │
                                                   │ Allowlist   │
                                                   │ (egress     │
                                                   │  control)   │
                                                   └─────────────┘
                                                          │
                                                          ▼
                                                   travel.aw web UI
                                                   (visual review surface)
```

## 7. Competitive Position

### 7.1 vs. Major Players

| | Google AI Mode | Expedia Romie | Booking.com AI | **Travel.aw** |
|---|---|---|---|---|
| **Open source** | No | No | No | **Yes (NanoClaw fork + StopCrabs)** |
| **Runs locally** | No (cloud) | No (cloud) | No (cloud) | **Yes (user's hardware)** |
| **Multi-supplier** | Google inventory only | Expedia inventory only | Booking inventory only | **Any API via vetted skills** |
| **Security model** | Proprietary black box | Proprietary black box | Proprietary black box | **Auditable: StopCrabs + container + code review** |
| **Data ownership** | Google has your data | Expedia has your data | Booking has your data | **Local SQLite, user owns everything** |
| **Customizable** | No | No | No | **Fork and modify** |

### 7.2 vs. OpenClaw Raw

| | OpenClaw | **Travel.aw Agent** |
|---|---|---|
| **Skill vetting** | None | StopCrabs 21-class taxonomy |
| **Domain focus** | General-purpose | Travel-specific curated skills |
| **Runtime** | Single process, shared memory | Container isolation per trip |
| **Web UI** | None | travel.aw visual front-door |
| **Booking safety** | Agent books autonomously | Human-in-loop for transactions |

## 8. Open Questions

1. **StopCrabs Supabase**: What was the Supabase dependency for? Scan result storage? Rule management? Need to understand before reattaching vs. replacing.
2. **NanoClaw licensing**: MIT — clean for forking. Need to confirm Apple Container availability on target deployment platforms (Linux/Docker fallback is supported).
3. **Skill signing**: Should vetted skills be cryptographically signed so the NanoClaw runtime can verify provenance? (Prevents skill tampering post-approval.)
4. **travel.aw ↔ NanoClaw bridge**: How does the WhatsApp agent surface visual content on the web UI? IPC via filesystem (NanoClaw pattern) or API?
5. **Multi-user**: NanoClaw is "built for one user." Travel.aw web UI is multi-user. Need to reconcile — likely: web UI is shared, agent instances are per-user.
6. **StopCrabs custom rules**: Should TRAVEL-001/002/003 be contributed upstream to StopCrabs or maintained in the travel-aw/skills repo?

## 9. Milestones

| Phase | Milestone | Deliverables |
|-------|-----------|-------------|
| **M0** | Foundation | Reattach StopCrabs Supabase; fork NanoClaw; create private travel-aw/skills repo |
| **M1** | First Skills | `/add-flight-search` + `/add-hotel-search` — StopCrabs scanned, human reviewed, container tested |
| **M2** | Agent Loop | NanoClaw fork running with travel.aw web UI as visual review surface |
| **M3** | WhatsApp Live | End-to-end: WhatsApp → NanoClaw → vetted skill → travel.aw display → user approval |
| **M4** | Monitoring Skills | `/add-price-monitor` + `/add-itinerary-sync` — scheduled background tasks |
| **M5** | Transaction Skills | `/add-amadeus-gds` + `/add-disruption-rebook` — high-risk skills with human-in-loop |

---

*This PRD describes a secure, open-source alternative to the proprietary AI travel agents being built by Google, Expedia, and Booking.com — one where the user owns their data, the code is auditable, and every skill passes through three security gates before it can touch a passport number or credit card.*
