---
title: "Session A — Auth0 + Backend Infrastructure"
date: 2026-02-06
branch: "feature/auth-backend"
owner: "unassigned"
scope:
  - "prisma/schema.prisma"
  - "apps/web/app/api/**"
estimate: "2-4 days"
---

````markdown
# Session A — Auth0 + Backend Infrastructure

> **Prerequisite:** Day-2.5 hardening complete.
> **Goal:** Implement Auth0 authentication, user models, all API routes, and encryption utilities.

---

## Branch
`feature/auth-backend`

## Scope lock
Only modify:
- `prisma/schema.prisma`
- `apps/web/app/api/**`
- `apps/web/app/_lib/auth.ts` (new)
- `apps/web/app/_lib/encryption.ts` (new)
- `apps/web/app/_lib/mappers.ts` (add new mappers)
- `apps/web/middleware.ts` (new)
- `packages/contracts/src/types/**`
- `apps/web/package.json` (add @auth0/nextjs-auth0)
- `.env.example`

---

## Tasks

### A1. Install Auth0 SDK
```bash
cd apps/web && pnpm add @auth0/nextjs-auth0
```

### A2. Add Prisma Models
Add to `prisma/schema.prisma`:
- `User` (auth0Id, email, name, picture, relations)
- `UserSettings` (notifications, timezone, currency)
- `PointsAccount` + `PointsTransaction`
- `Friendship` (bidirectional with status)
- `TripMember` (role-based trip access)
- `EmergencyContact` (encrypted phone/email)
- `TravelAdvisory` + `UserAlert`
- `TravelDoc` (encrypted document storage)
- `SupportTicket` + `SupportMessage` + `FaqArticle`
- Modify `Trip` to add nullable `userId` + `members` relation

... (rest omitted for brevity)

````
