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

### A3. Run Migration
```bash
pnpm db:push --force-reset
pnpm db:seed
```

### A4. Create Auth0 Route Handler
`apps/web/app/api/auth/[auth0]/route.ts`
- Export `handleAuth()` for login, logout, callback, profile
- Configure returnTo URLs

### A5. Create Middleware
`apps/web/middleware.ts`
- Protect: `/trips/*`, `/account/*`, `/points/*`, `/friends/*`, `/safety/*`, `/documents/*`, `/settings/*`, `/help/*`
- Allow public: `/`, `/api/auth/*`, `/api/email/inbound`, `/api/media`
- Protect API routes: `/api/trips/*`, `/api/user/*`, `/api/points/*`, etc.

### A6. Create Auth Helper
`apps/web/app/_lib/auth.ts`
```ts
getCurrentUser(): Promise<AuthUser | null>  // Upserts user from Auth0 session
requireAuth(): Promise<AuthUser>            // Throws if not authenticated
```

### A7. Create Encryption Utils
`apps/web/app/_lib/encryption.ts`
- AES-256-GCM encryption/decryption
- For travel documents, emergency contacts

### A8. Modify Trips API for User Scope
`apps/web/app/api/trips/route.ts`
- GET: Filter by `userId` or trip membership
- POST: Create trip with `userId`, auto-create owner TripMember

`apps/web/app/api/trips/[id]/route.ts`
- Add ownership check
- Add PATCH, DELETE handlers

### A9. Create User API Routes
```
apps/web/app/api/user/
├── route.ts              # GET current user profile
└── settings/route.ts     # GET/PATCH user settings
```

### A10. Create Points API Routes
```
apps/web/app/api/points/
├── route.ts              # GET/POST accounts
└── [id]/
    ├── route.ts          # GET/PATCH/DELETE account
    └── transactions/route.ts  # GET/POST transactions
```

### A11. Create Friends API Routes
```
apps/web/app/api/friends/
├── route.ts              # GET/POST friendships
├── [id]/route.ts         # PATCH/DELETE friendship
└── search/route.ts       # Search users by email
```

### A12. Create Documents API Routes
```
apps/web/app/api/documents/
├── route.ts              # GET/POST documents (encrypted)
└── [id]/route.ts         # GET/PATCH/DELETE document
```

### A13. Create Safety API Routes
```
apps/web/app/api/safety/
├── contacts/route.ts     # GET/POST emergency contacts
├── contacts/[id]/route.ts # PATCH/DELETE contact
├── advisories/route.ts   # GET travel advisories
└── alerts/route.ts       # GET/POST user alerts
```

### A14. Create Support API Routes
```
apps/web/app/api/support/
├── tickets/route.ts      # GET/POST tickets
├── tickets/[id]/route.ts # GET/PATCH ticket
├── tickets/[id]/messages/route.ts  # GET/POST messages
└── faq/route.ts          # GET FAQ (public)
```

### A15. Add Types to @travel/contracts
```
packages/contracts/src/types/
├── user.ts      # User, UserSettings
├── points.ts    # PointsAccount, PointsTransaction
├── safety.ts    # EmergencyContact, TravelAdvisory, UserAlert
├── documents.ts # TravelDoc, TravelDocDecrypted
└── support.ts   # SupportTicket, SupportMessage, FaqArticle
```
Update `index.ts` to export all.

### A16. Add Mappers for New Models
`apps/web/app/_lib/mappers.ts`
- `mapUser()`, `mapUserSettings()`
- `mapPointsAccount()`, `mapPointsTransaction()`
- `mapEmergencyContact()`, `mapUserAlert()`
- `mapTravelDoc()`, `mapSupportTicket()`

---

## Environment Variables
Add to `.env.example`:
```bash
# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR_TENANT.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Encryption (32 bytes hex)
ENCRYPTION_KEY=
```

---

## Verification
```bash
pnpm build                              # No type errors
pnpm dev
curl http://localhost:3000/api/trips    # 401 Unauthorized
# Login via Auth0 → cookie set
curl http://localhost:3000/api/trips    # Returns user's trips
curl http://localhost:3000/api/user     # Returns current user
```

---

## Codex Prompt

> You are working in travel.aw on branch feature/auth-backend.
> Read TASKS/day_02/11_session_auth_backend.md for full task list.
> SCOPE: Only modify prisma/**, apps/web/app/api/**, apps/web/app/_lib/auth.ts, apps/web/app/_lib/encryption.ts, apps/web/app/_lib/mappers.ts, apps/web/middleware.ts, packages/contracts/src/types/**, apps/web/package.json, .env.example.
> TASK: Implement Auth0 authentication with @auth0/nextjs-auth0. Add all user/account Prisma models. Create middleware for route protection. Create all API routes for user, points, friends, documents, safety, support. Add encryption utils for sensitive data. Add types to @travel/contracts.
> RULE: If you believe a change is needed outside scope (UI components, pages), add a TODO comment and STOP.
