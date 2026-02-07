# TASKS changelog

All edits to the `TASKS/` directory and related session tooling.

## 2026-02-07 — Standardize TASKS & add scaffolding

- Added `SESSION_TEMPLATE.md` (canonical session template)
- Added `scripts/new-session.sh` (scaffold new session files from template)
- Created dated session files from existing day_01/day_02 content:
  - `2026-02-06-sessions1-5-readme.md`
  - `2026-02-06-session1-contracts-db.md`
  - `2026-02-06-session2-ui.md`
  - `2026-02-06-session3-maps-leaflet-osm.md`
  - `2026-02-06-session5-email-ingest.md`
  - `2026-02-06-day2-readme.md`
  - `2026-02-06-day2-api-routes.md`
  - `2026-02-06-day2-frontend-real-data.md`
  - `2026-02-06-day2.5-implementation-hardening.md`
  - `2026-02-06-session-auth-backend.md`
  - `2026-02-06-session-auth-frontend.md`
  - `2026-02-06-session-subcomponents.md`
- Added `TASKS/README.md` index
- Removed legacy `TASKS/day_01/*` and `TASKS/day_02/*` files (content migrated to dated files)
- Created example session via `scripts/new-session.sh example-session` → `TASKS/2026-02-07-example-session.md`

## Notes

- Use `scripts/new-session.sh <slug>` to create new session files consistently.
- Files use YAML frontmatter: `title`, `date`, `branch`, `scope`, `estimate`.

## 2026-02-07 — TypeScript Fixes & Repository Consolidation

- Fixed TypeScript strict mode errors across 10 page components
- Added explicit type annotations for map/filter callbacks using `(typeof array)[number]` pattern
- Added `leaflet` and `@types/leaflet` dependencies for map functionality
- Regenerated Prisma client to resolve missing type exports
- Consolidated repository from `~/Downloads/travel.aw` to `~/Projects/travel.aw`
- Auth0 authentication fully configured and working

## 2026-02-07 — Governance & AuthZ

- Added `CODEOWNERS`, `CONTRIBUTING.md`, and `SECURITY.md` to formalize repo governance.
- Added `config/authz.yml` mapping Auth0 roles to app scopes and `apps/web/middleware.ts` skeleton that will enforce role-based access at runtime.
- Added policy/README.md to begin policy-as-code work.
- Added `owner: "unassigned"` frontmatter to existing session files so tasks have explicit owners.

