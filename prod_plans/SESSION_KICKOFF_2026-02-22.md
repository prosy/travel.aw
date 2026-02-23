# Travel.aw — Session Kickoff Prompt

**Previous Session:** 2026-02-22  
**Governance:** `TRAVEL_AUTHORITY_PACK_v0_2.md` (SSOT Candidate) — defines read order §0, authority index §2, guardrails §4, folder skeleton §8, open decisions §9.

---

## Context: What Was Established (Prior Sessions)

- **Authority Pack v0.2** governs all work: 17 authority files (A1–A17) across 3 phases (WP-0 bootstrap, WP-1 schemas, WP-2+ data).
- **Ecosystem Spec v0.2** (A1) defines product scope, user journey stages (J0–J8), capability model, and MVP.
- **Conflict precedence:** Schema + Registries > Spec > Validator > Session prompt > Everything else.
- **Directory skeleton** defined in Authority Pack §8 (WP-0 → WP-1 → WP-2 phased).

---

## What We Learned (2026-02-22 Session)

### Ecosystem Research
- Ranked top 3–5 apps/companies across **26 capability domains** using **70+ authoritative 2025–2026 sources**.
- Google appears #1 or #2 in 8 domains. Expedia Group and Booking Holdings each own 4–5 competing brands (users often compare same inventory).
- Two gaps identified and filled: **C-API-PLATFORM** (GDS: Amadeus 32%, Sabre 30%, Travelport 22%) and **C-AI-AGENT** (Google AI Mode, Expedia Romie, Booking.com AI, TripGenie, Navan, Mindtrip, OpenClaw, Layla, GuideGeek).

### OpenClaw / NanoClaw / StopCrabs
- **OpenClaw** (195K GitHub stars): Open-source AI agent. Massive adoption, catastrophic security — 135K exposed instances, Cisco found data exfiltration in unvetted skills, prompt injection vulnerabilities. Skill ecosystem (ClawHub, Moltdirectory, 500+ skills) has **no travel category** and **no automated security vetting**. Creator joined OpenAI Feb 14 2026; project moving to foundation.
- **NanoClaw** (qwibitai/nanoclaw, 7.2K stars, MIT): Lightweight secure alternative. Container-isolated (Apple Container/Docker), Claude Agent SDK, skills-as-code-transforms (auditable git diffs not runtime plugins), per-group sandboxed CLAUDE.md. "Understand in 8 minutes" codebase.
- **StopCrabs** (prosy/StopCrabs, Apache 2.0, ours): Purpose-built OpenClaw security scanner. 21 OC vulnerability classifications, 37 DSAL detection rules, 4 backends (regex, AST/semgrep, config posture, IOC). CI-friendly SARIF output. Public repo, needs Supabase reattached.

### Three-Layer Architecture Established
```
Layer 1: travel.aw           → Web front-door (visual UI, trust surface, transition to agents)
Layer 2: travel-aw/skills    → Private travel skills registry, StopCrabs-vetted, approval-required
Layer 3: NanoClaw fork       → Container-isolated agent runtime, Claude Agent SDK only
```
Three security gates (vs OpenClaw's zero): StopCrabs CI scan → human code review of Claude Code diff → container sandbox execution. Key insight: most users need to SEE things before trusting agents with travel bookings. travel.aw is the visual transition interface.

---

## Files Generated (2026-02-22)

| File | Description |
|------|-------------|
| `TRAVEL_ECOSYSTEM_NODES_RESEARCH_v0_1.csv` | 95 ranked nodes across 26 C-codes. Columns: capability_code, capability_label, default_stages, rank, node_name, provider_type, description, ranking_rationale, key_sources. Seeds A14 `nodes.jsonl` at WP-2. |
| `PRD_TravelAW_Secure_Agent_Architecture_v0_1.md` | Draft PRD for three-layer architecture. Covers: security flow, skill roadmap (P0–P3 mapped to C-codes), user experience progression (web-first → hybrid → agent-first), NanoClaw fork spec, competitive positioning, 6 milestones (M0–M5). |
| `TRAVEL_AUTHORITY_PACK_v0_2.md` | Carried forward. A8 master index. |
| `TRAVEL_ECOSYSTEM_SPEC_v0_2.md` | Carried forward. A1 product scope. |

---

## Open Decisions (Current State)

| ID | Decision | Status |
|----|----------|--------|
| DD-01 | Toolchain: TS vs Python vs hybrid | Open |
| DD-03 | Spec completion order (§1–5 before registries) | Open |
| DD-04 | Journey stage labels (confirm J0–J8) | Open |
| DD-05 | Starter C-codes for MVP | Partially answered: 26 C-codes from research. Need to select ~15–20 for seed. |
| DD-06 | Agent architecture (NEW) | Proposed in PRD v0.1: NanoClaw + StopCrabs + private skills. Needs formal DD entry. |

---

## Next Steps

### M0 — Foundation
- [ ] Reattach Supabase to StopCrabs repo
- [ ] Fork NanoClaw → `travel-aw/nanoclaw`
- [ ] Create private `travel-aw/skills` repo with StopCrabs CI workflow (`stopcrabs-gate.yml`)
- [ ] Add travel-specific custom rules (TRAVEL-001 PII in payload, TRAVEL-002 unbounded egress, TRAVEL-003 booking without confirmation)
- [ ] Resolve DD-06: formally accept or revise the three-layer architecture

### M1 — First Skills
- [ ] Build `/add-flight-search` skill (Skyscanner/Google Flights — read-only, lowest risk)
- [ ] Build `/add-hotel-search` skill (Booking.com/Expedia Rapid — read-only)
- [ ] Run full StopCrabs → review → container test cycle end-to-end

### WP-0 Bootstrap (Authority Pack §8)
- [ ] Resolve DD-04 (J0–J8 stage labels) and DD-05 (seed C-codes from the 26 researched)
- [ ] Create A2 `DECISIONS.md`, A3 `GLOSSARY.md`, A4–A7 registries
- [ ] These can run in parallel with M0/M1 agent work

### Open Questions
1. What was StopCrabs Supabase dependency for? (scan storage? rule management?)
2. Should vetted skills be cryptographically signed for provenance verification?
3. How does NanoClaw agent surface visual content on travel.aw web UI? (IPC via filesystem or API?)
4. Multi-user model: web UI is shared, agent instances per-user?
5. Should TRAVEL-001/002/003 rules be upstreamed to StopCrabs or kept in travel-aw/skills?
