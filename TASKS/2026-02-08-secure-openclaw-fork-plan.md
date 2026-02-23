# Plan: Secure OpenClaw Fork for travel.aw

## Context

We completed a security audit of OpenClaw (24 findings: 6 Critical, 12 High, 5 Medium, 1 Low). 
OpenClaw's default configuration is critically deficient — no auth, no input sanitization, no skill isolation, no egress control. 
The Moltbook incident (1.5M API keys exposed, prompt injection at broadcast scale) confirmed these aren't theoretical risks.

Rather than disclosing to upstream (findings already known per Oracle report, prompt injection listed as "out of scope" by maintainer), we're forking OpenClaw to build a hardened, travel-domain agent for the travel.aw project.

## Architecture Decisions

- **Domain:** Travel (travel.aw — trips, points, documents, safety)
- **Users:** Closed registry + invite/referral (web-of-trust model)
- **Channels:** Mobile app only at launch; iMessage + Google Messages/RCS added in a later phase once security foundations are proven
- **Deployment:** Hybrid — mobile app holds private data, cloud runs agents/services
- **Agents:** White-labeled, scoped to travel tasks only
- **Security:** Every audit finding addressed through architecture or code fixes

## Phased Rollout

### Phase 0: Fork Setup and Channel Strip (2-3 days)

Create fork from OpenClaw commit `e02d144a` into new private repo (e.g., `prosy/travel-agent`).

**Strip:**
- All 15+ channel extensions (Telegram, Discord, Slack, WhatsApp, Signal, iMessage, etc.)
- Plugin auto-enable system (`src/config/plugin-auto-enable.ts`)
- Webhook hooks (`src/gateway/hooks.ts`)
- `/bash` command (`src/acp/commands.ts:37`)
- `sms.send`, `canvas.eval`, `system.run` from command policy (`src/gateway/node-command-policy.ts`)

**Replace with:**
- Single mobile app API surface (message, session, confirm, history endpoints)
- Travel-domain config replacing general OpenClaw config
- Renamed project references

**Eliminates 7 findings:** F-2026-004, F-2026-006, F-2026-007, F-2026-008, F-2026-021, F-2026-022, F-2026-023

### Phase 1: Authentication + Security Controls (3-4 days)

**Fixes:** F-2026-011 (CVSS 9.8), F-2026-012 (CVSS 8.6), F-2026-013 (CVSS 8.1)

**Files:** `src/gateway/auth.ts`, `src/gateway/node-command-policy.ts`, new `src/security/controls.ts`

- Remove Tailscale silent auth bypass entirely
- Integrate Auth0 JWT validation (mirror travel.aw's existing auth at `apps/web/app/_lib/auth.ts`)
- Gateway refuses to start without explicit auth config
- Implement four missing security controls:
  - `AUTH_ENABLED` (mandatory, default true)
  - `ALLOWED_ORIGINS` (mobile app + travel.aw backend only)
  - `TOOL_ALLOWLIST` (travel-domain tools only; read tools free, write tools require confirmation)
  - `EGRESS_ALLOWLIST` (travel APIs, Anthropic API, Auth0 — nothing else)
- Lock command policy to read-only tools by default; "unknown" platform gets zero capabilities

### Phase 2: Skill System Hardening (5-7 days)

**Fixes:** F-2026-001 (CVSS 9.1), F-2026-003 (CVSS 9.1), F-2026-017 (CVSS 9.1), F-2026-002 (7.5), F-2026-005 (7.2)

**Files:** `src/agents/skills/workspace.ts`, `src/agents/sandbox/docker.ts`

- Create `skills.lock` manifest with SHA-256 hashes; verify at load time
- Single bundled skill directory only — remove workspace override, `extraDirs`, plugin dirs
- Sanitize skill content before system prompt injection; add security boundary delimiters
- Docker sandbox mandatory (not optional) for all skill execution
- Skill capability declarations: each skill declares network, filesystem, env var, and tool needs
- Block direct `process.env` access; inject only declared env vars as parameters
- Create 5 bundled travel skills: booking-search, points-tracker, itinerary-manager, document-assistant, safety-advisor

### Phase 3: Credential Hardening (2-3 days)

**Fixes:** F-2026-015 (CVSS 8.1), F-2026-016 (CVSS 7.5)

**Files:** `src/infra/dotenv.ts`

- Replace plaintext `.env` loading with OS keychain (macOS Keychain via `keytar`) for local dev
- Cloud deployment uses platform secrets manager (Vercel env vars / AWS Secrets Manager)
- Create `CredentialBroker` — scoped access, never exposes full credential set, logs every access
- Triage and remove 63 plaintext secret matches from forked codebase
- Add `gitleaks` pre-commit hook

### Phase 4: Memory Provenance + Logging (3-4 days)

**Fixes:** F-2026-009 (CVSS 7.5), F-2026-010 (CVSS 5.3)

**Files:** `src/agents/tools/memory-tool.ts`

- Add provenance metadata to every memory entry: source, trustLevel, createdBy, sessionId, timestamp, HMAC signature
- Trust tiers: high (user-stated), medium (agent from confirmed actions), low (agent inferred), quarantined (external — requires user approval)
- Memory recall includes trust labels in agent context
- Replace all 30 empty catch blocks with structured error logging
- Create audit log for security events (auth, tool invocations, memory writes, skill loads, egress attempts)
- Tamper-evident log with hash chaining

### Phase 5: Sandbox + Proxy Hardening (2-3 days)

**Fixes:** F-2026-014 (CVSS 5.9), F-2026-018 (CVSS 5.5), F-2026-019 (CVSS 7.2)

**Files:** `src/agents/sandbox/docker.ts`, `src/gateway/auth.ts`

- Workspace mount read-only by default
- Validate `setupCommand` source (only from verified skill manifests)
- Network namespace restrictions on sandbox containers (egress allowlist enforced)
- Remove all 16 docker.sock references from docs/tests
- Default to rejecting proxy headers unless `trustedProxies` explicitly configured

### Phase 6: travel.aw Integration + User Registry (5-7 days)

**Files:** travel.aw Prisma schema, `apps/web/app/api/`, new `packages/agent-client`

- Create `@travel/agent-client` package in travel.aw monorepo
- Service-to-service auth between agent backend and travel.aw API
- Agent skills connect to existing travel.aw API routes (trips, points, documents, safety)
- New `Invitation` Prisma model: invite codes with expiry, voucher tracking, limited per-user allocation
- Auth0 signup gated by valid invite code
- Input sanitization layer: message length caps, rate limiting, regex pre-filter, optional guardrail LLM slot
- User messages wrapped in explicit trust boundaries in agent prompt

### Phase 7 (Future): Native Messaging Channels

Once Phases 0-6 are proven secure:
- Re-introduce iMessage (iOS) and Google Messages/RCS (Android) as controlled channels
- These are lower risk than Telegram/Discord — tied to verified identities (Apple ID, phone number)
- All messages go through the same sanitization pipeline from Phase 6
- Confirmation gates required for all side-effect actions via messaging
- Per-channel rate limits
- Potential fine-tuned guardrail LLM (user has experience with Thinking Machines Lab Tinkerer for fine-tuning)

## Findings Disposition Summary

| Disposition | Count | Findings |
|-------------|-------|----------|
| Eliminated by architecture | 7 | F-004, F-006, F-007, F-008, F-021, F-022, F-023 |
| Fixed in Phase 1 | 3 | F-011, F-012, F-013 |
| Fixed in Phase 2 | 5 | F-001, F-002, F-003, F-005, F-017 |
| Fixed in Phase 3 | 2 | F-015, F-016 |
| Fixed in Phase 4 | 2 | F-009, F-010 |
| Fixed in Phase 5 | 3 | F-014, F-018, F-019 |
| Informational (no action) | 1 | F-020 |
| **Total** | **23 + 1 info** | **All 24 addressed** |

## Attack Chain Verification

After all phases, verify the three audit attack chains are broken:

1. **Channel injection -> credential theft:** BLOCKED — no external channels; mobile app sanitized; `/bash` stripped; credentials not in `.env`
2. **Malicious skill -> full compromise:** BLOCKED — no user-writable skill dirs; integrity verification; sandbox isolation; no `process.env` access
3. **Memory poisoning -> persistent backdoor:** MITIGATED — provenance labels; quarantine for external content; HMAC signatures; user approval required

## Critical Files Reference

- `docs/audit/FINAL_REPORT.md` — Master reference for all findings
- `docs/audit/findings_catalog.md` — Per-finding code locations and CWE/CVSS details
- `travel.aw/apps/web/app/_lib/auth.ts` — Auth0 pattern to mirror
- `travel.aw/prisma/schema.prisma` — Data model (User, Trip, PointsAccount, Friendship) + where Invitation model goes
- `travel.aw/apps/web/app/_lib/encryption.ts` — AES-256-GCM reference for credential encryption and memory signing

## Estimated Timeline

| Phase | Duration | Can Parallelize With |
|-------|----------|---------------------|
| Phase 0: Fork + Strip | 2-3 days | — |
| Phase 1: Auth + Controls | 3-4 days | — |
| Phase 2: Skills | 5-7 days | Phase 3 |
| Phase 3: Credentials | 2-3 days | Phase 2 |
| Phase 4: Memory + Logging | 3-4 days | Phase 5 |
| Phase 5: Sandbox + Proxy | 2-3 days | Phase 4 |
| Phase 6: Integration | 5-7 days | After Phase 1 |
| **Total (with parallelization)** | **~4-5 weeks** | |
