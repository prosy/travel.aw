# TRAVEL.aw — Project Manifest
**Last verified:** 2026-02-28
**Status:** Canonical (update this file when repos, paths, or packages change)

---

## 1. Repos

| Name | Remote | Local Path | Owns |
|------|--------|------------|------|
| **App** | `prosy/travel-app` | `~/Projects/augmented-worlds/travel/` | Web app, SkillRunner, Track B security, search UI, copied governance content |
| **Governance** | `prosy/travel.aw` | `~/Documents/GitHub/_archived_travel-aw-governance/` | Original ecosystem graph authoring, planning docs (READ-ONLY ARCHIVE — content copied to App repo) |
| **Skills** | `prosy/travel-aw-skills` | `~/Documents/GitHub/travel-aw-skills/` | Skill source code, skill.yaml manifests, StopCrabs + travel rules CI gates |
| **NanoClaw** | `prosy/nanoclaw` | `~/Documents/GitHub/nanoclaw/` | Agent runtime fork — container isolation, multi-messenger I/O, swarms, scheduling. Active (DD-13 reopened). |

> **Governance repo is read-only.** All active development happens in App or Skills. Governance content (authorities, ecosystem data, registries) has been copied into the App repo. Do not commit new work to `prosy/travel.aw`.

---

## 2. App Repo Structure (`prosy/travel-app`)

```
~/Projects/augmented-worlds/travel/
├── apps/web/                          # Next.js 16 web app
│   ├── app/
│   │   ├── api/skills/invoke/         # Skill invocation endpoint (M1-C)
│   │   ├── api/points/parse/          # LLM loyalty parsing (Track B)
│   │   ├── api/email/inbound/         # Webhook ingestion (Track B)
│   │   ├── api/trips/                 # Trip CRUD
│   │   ├── (authenticated)/search/    # Flight + hotel search pages (M1-C)
│   │   └── _lib/encryption.ts         # PII encryption utilities (Track B)
│   └── prisma/schema.prisma
├── packages/
│   ├── skill-runner/                  # SkillRunner module (M1-A, 83 tests)
│   │   └── src/
│   │       ├── index.ts               # createSkillRunner(), execute()
│   │       ├── types.ts               # SkillInput, SkillOutput, errors
│   │       └── network.ts             # Egress enforcement (dead DNS + add-host)
│   ├── contracts/                     # TypeScript types + ecosystem registries
│   │   ├── src/                       # App-level types (trip, user, offer, citation)
│   │   ├── registries/                # Ecosystem SSOT (journey_stages, capabilities, provider_types, relationship_types)
│   │   └── CONTRACT_VERSIONING.md
│   ├── ui/                            # Shared UI components
│   └── adapters/                      # External service adapters
├── AUTH/                              # Authority pack (copied from governance)
│   ├── TRAVEL_AUTHORITIES_INDEX.md
│   ├── CHANGELOG.md
│   └── SESSION_CLOSE_PROTOCOL.md
├── docs/ecosystem/                    # Ecosystem spec + supporting docs
│   ├── ECOSYSTEM_SPEC_v0_2.md
│   ├── DECISIONS.md
│   ├── GLOSSARY.md
│   └── QUERY_COOKBOOK.md
├── data/ecosystem/                    # Ecosystem graph data (59 nodes, 118 edges)
│   ├── nodes.jsonl
│   ├── edges.jsonl
│   └── ID_POLICY.md
├── prod_plans/                        # Planning docs, PRDs, session records
├── tools/                             # Validator, query tools
├── CLAUDE.md                          # Agent behavior, gotchas, conventions
└── PROJECT_MANIFEST.md                # THIS FILE
```

---

## 3. Skills Repo Structure (`prosy/travel-aw-skills`)

```
~/Documents/GitHub/travel-aw-skills/
├── .github/workflows/stopcrabs-gate.yml   # CI: StopCrabs + travel rules + manifest validation
├── skills/
│   ├── _template/                         # Reference skill structure
│   ├── flight-search/                     # Amadeus flight search (M1-B)
│   └── hotel-search/                      # Amadeus hotel search (M1-B)
├── scripts/
│   ├── travel-rules-check.py              # TRAVEL-001/002/003 scanner
│   └── run-stopcrabs.sh                   # Local scan mirror
├── docs/
│   ├── SKILL_MANIFEST_SPEC.md             # skill.yaml schema
│   ├── SECURITY_POLICY.md                 # Security gates documentation
│   └── SUBMISSION_GUIDE.md
└── .stopcrabs.yml                         # StopCrabs config
```

---

## 4. Package Map

| Package | Location (App repo) | Importable As |
|---------|-------------------|---------------|
| SkillRunner | `packages/skill-runner/` | `@travel/skill-runner` |
| Contracts (TS types) | `packages/contracts/src/` | `@travel/contracts` |
| Ecosystem registries | `packages/contracts/registries/` | JSON files, not TS imports |
| UI components | `packages/ui/` | `@travel/ui` |
| Adapters | `packages/adapters/` | `@travel/adapters` |

---

## 5. Session Routing

| Working on... | Use this repo | Local path |
|---------------|--------------|------------|
| API routes, UI, SkillRunner, auth, encryption | **App** | `~/Projects/augmented-worlds/travel/` |
| Ecosystem graph, registries, authorities, validator | **App** (governance content lives here now) | `~/Projects/augmented-worlds/travel/` |
| Skill source code, skill.yaml manifests, CI gates | **Skills** | `~/Documents/GitHub/travel-aw-skills/` |
| Planning docs, PRDs, session records | **App** | `~/Projects/augmented-worlds/travel/prod_plans/` |

> **Do NOT commit to `prosy/travel.aw` (governance repo).** It is archived for reference.

---

## 6. Environment Variables (App Repo)

| Var | Purpose | Required |
|-----|---------|----------|
| `SKILLS_DIR` | Path to `travel-aw-skills/skills/` checkout | Yes (for skill execution) |
| `AMADEUS_API_KEY` | Amadeus flight/hotel API | No (mock fallback) |
| `AMADEUS_API_SECRET` | Amadeus flight/hotel API | No (mock fallback) |
| `WEBHOOK_EMAIL_SECRET` | Inbound email webhook auth | Yes (production) |
| `ENCRYPTION_KEY` | PII encryption at rest | Yes (production) |
| `AUTH0_*` | Auth0 configuration | Yes |

---

## 7. Key Decisions Affecting Structure

| Decision | Resolution | Impact |
|----------|-----------|--------|
| DD-12: SkillRunner location | App repo (`packages/skill-runner/`) | Runtime dep of web app |
| DD-13: NanoClaw role | **Reopened** — full agent runtime (container isolation, multi-messenger I/O, swarms, scheduling). Fork active at `prosy/nanoclaw`. Reassess at M2-C. |
| Repo split (2026-02-26) | App → `prosy/travel-app`, Gov → `prosy/travel.aw` | Two remotes, diverged histories, no force merge |
| Governance content | Copied into App repo | Gov repo is now read-only archive |

---

## 8. Validation

Run this to verify manifest accuracy:

```bash
# Check all critical paths exist
echo "=== Manifest Validation ==="
for path in \
  ~/Projects/augmented-worlds/travel/packages/skill-runner/src/index.ts \
  ~/Projects/augmented-worlds/travel/packages/contracts/registries/journey_stages.json \
  ~/Projects/augmented-worlds/travel/AUTH/TRAVEL_AUTHORITIES_INDEX.md \
  ~/Projects/augmented-worlds/travel/data/ecosystem/nodes.jsonl \
  ~/Documents/GitHub/travel-aw-skills/skills/flight-search/skill.yaml \
  ~/Documents/GitHub/travel-aw-skills/scripts/travel-rules-check.py
do
  if [ -e "$path" ]; then
    echo "✅ $path"
  else
    echo "❌ MISSING: $path"
  fi
done
```

If any path fails: **STOP. Update this manifest before proceeding.**
