---
title: "Session B — Auth0 Frontend + UI Components"
date: 2026-02-06
branch: "feature/auth-frontend"
owner: "unassigned"
scope:
  - "apps/web/app/_components/**"
  - "apps/web/app/(authenticated)/**"
estimate: "2-4 days"
---

````markdown
# Session B — Auth0 Frontend + UI Components

> **Prerequisite:** Session A tasks A1-A7 complete (auth foundation ready).
> **Goal:** Implement dashboard layout, all account pages, and UI components.

---

## Branch
`feature/auth-frontend`

## Scope lock
Only modify:
- `apps/web/app/_components/**` (new)
- `apps/web/app/(authenticated)/**` (new route group)
- `apps/web/app/(public)/**` (new route group)
- `apps/web/app/layout.tsx` (wrap with UserProvider)
- `apps/web/app/globals.css` (add component styles if needed)

Do NOT modify:
- `prisma/**` (Session A)
- `apps/web/app/api/**` (Session A)
- `apps/web/app/_lib/auth.ts` (Session A)
- `packages/contracts/**` (Session A)

... (rest omitted for brevity)

````
