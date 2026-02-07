# Contributing to travel.aw

Please follow these guidelines to keep contributions consistent and reviewable.

1. Branches and sessions
   - Use one branch per session, named with the session slug (e.g. `day2/api-routes`).
   - Create session task files from `TASKS/SESSION_TEMPLATE.md` via `scripts/new-session.sh`.

2. Pull Requests
   - Open a PR for each session branch.
   - Assign reviewers listed in `CODEOWNERS`.
   - Include the session filename in PR title (e.g. "day2: API routes — TASKS/2026-02-06-day2-api-routes.md").

3. Scope Lock
   - Respect the `scope` section in the session file. If a change is required outside scope, add a `TODO` comment to the code and note it in the session file.

4. Tests & CI
   - New code must include tests where applicable. CI runs build + seed + tests before merge.

5. Secrets
   - Do not commit secrets. Add them to your secrets manager (GitHub Actions Secrets, Vault) and document variable names in `.env.example`.

6. Security
   - Report security issues per `SECURITY.md`.

7. Code style
   - Run `pnpm format` and `pnpm lint` before opening a PR.
