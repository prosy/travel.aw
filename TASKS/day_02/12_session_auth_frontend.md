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

---

## Coordination with Session A

| Milestone | Session A Status | Session B Can Start |
|-----------|------------------|---------------------|
| M1 | A1-A7 complete | B1-B7 (layout, nav) |
| M2 | A8-A14 complete | B8-B14 (feature pages) |
| M3 | A15-A16 complete | B15 (use types) |

---

## Tasks

### B1. Create Sidebar Component
`apps/web/app/_components/layout/Sidebar.tsx`
- User avatar + name at top
- Nav links: Trips, Points, Friends, Safety, Documents, Settings, Help
- Active state highlighting
- Collapsible on mobile

### B2. Create TopNav Component
`apps/web/app/_components/layout/TopNav.tsx`
- Search input (placeholder for now)
- Notifications bell icon
- User menu dropdown (profile, settings, logout)

### B3. Create MobileNav Component
`apps/web/app/_components/layout/MobileNav.tsx`
- Hamburger menu trigger
- Slide-out drawer with nav links
- Close on link click

### B4. Create Auth Components
```
apps/web/app/_components/auth/
├── LoginButton.tsx    # <a href="/api/auth/login">
├── LogoutButton.tsx   # <a href="/api/auth/logout">
└── UserAvatar.tsx     # Profile picture with fallback initials
```

### B5. Create Authenticated Layout
`apps/web/app/(authenticated)/layout.tsx`
- Server Component that checks session
- Redirects to login if not authenticated
- Renders Sidebar + TopNav + children

### B6. Update Landing Page
`apps/web/app/(public)/page.tsx`
- Hero section with app value prop
- Login/Sign up CTA buttons
- If already authenticated, redirect to /trips

### B7. Move Trips to Route Group
Move existing trips pages into authenticated route group:
```
apps/web/app/(authenticated)/trips/
├── page.tsx           # Modified: add claim orphaned trips UI
├── new/page.tsx       # NEW: create trip form
└── [id]/
    ├── page.tsx       # Modified: add share button
    ├── edit/page.tsx  # NEW: edit trip form
    └── share/page.tsx # NEW: invite collaborators
```

### B8. Create Account Dashboard
`apps/web/app/(authenticated)/account/page.tsx`
- Welcome message with user name
- Quick stats: trips count, points total, friends count
- Recent activity feed
- Links to all sections

### B9. Create Points Pages
```
apps/web/app/(authenticated)/points/
├── page.tsx           # List all points accounts
├── new/page.tsx       # Add new loyalty program
└── [id]/page.tsx      # Account detail + transactions
```

Components needed:
- `_components/points/PointsAccountCard.tsx`
- `_components/points/TransactionList.tsx`
- `_components/points/AddAccountForm.tsx`

### B10. Create Friends Pages
```
apps/web/app/(authenticated)/friends/
├── page.tsx           # Friends list
└── invites/page.tsx   # Pending friend requests
```

Components needed:
- `_components/friends/FriendCard.tsx`
- `_components/friends/InviteForm.tsx`
- `_components/friends/FriendRequestCard.tsx`

### B11. Create Safety Pages
```
apps/web/app/(authenticated)/safety/
├── page.tsx           # Safety dashboard
├── contacts/page.tsx  # Emergency contacts CRUD
└── advisories/page.tsx # Browse travel advisories
```

Components needed:
- `_components/safety/EmergencyContactCard.tsx`
- `_components/safety/AdvisoryBadge.tsx`
- `_components/safety/AlertBanner.tsx`

### B12. Create Documents Pages
```
apps/web/app/(authenticated)/documents/
├── page.tsx           # Documents list
├── new/page.tsx       # Upload new document
└── [id]/page.tsx      # View document (decrypted)
```

Components needed:
- `_components/documents/DocumentCard.tsx`
- `_components/documents/DocumentViewer.tsx`
- `_components/documents/UploadForm.tsx`

### B13. Create Settings Page
`apps/web/app/(authenticated)/settings/page.tsx`
- Notification preferences toggles
- Timezone/date format/currency selects
- Calendar sync section (Google, Apple)
- Connected apps list
- Danger zone: delete account

Components needed:
- `_components/settings/ToggleSwitch.tsx`
- `_components/settings/CalendarConnect.tsx`

### B14. Create Help Center Pages
```
apps/web/app/(authenticated)/help/
├── page.tsx           # Help center home
├── faq/page.tsx       # FAQ articles
└── tickets/
    ├── page.tsx       # My tickets list
    └── [id]/page.tsx  # Ticket detail + messages
```

Components needed:
- `_components/help/FaqAccordion.tsx`
- `_components/help/TicketForm.tsx`
- `_components/help/MessageThread.tsx`

### B15. Wrap Root Layout with UserProvider
`apps/web/app/layout.tsx`
```tsx
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
```

---

## Component Design Guidelines

- Use existing Tailwind patterns from trips pages
- Dark mode support via `dark:` variants
- Mobile-first responsive design
- Server Components by default, `'use client'` only when needed
- Use `@travel/ui` PlaceholderTile for avatars/icons
- Follow existing `formatDate`, `formatPrice` utilities

---

## Verification
```bash
pnpm build                           # No type errors
pnpm dev
# Visit / → see landing page with login button
# Click login → Auth0 flow → redirect to /trips
# Sidebar visible with all nav links
# Visit /points, /friends, /safety, /documents, /settings, /help
# All pages render without errors
# Logout → redirects to landing page
```

---

## Codex Prompt

> You are working in travel.aw on branch feature/auth-frontend.
> Read TASKS/day_02/12_session_auth_frontend.md for full task list.
> SCOPE: Only modify apps/web/app/_components/**, apps/web/app/(authenticated)/**, apps/web/app/(public)/**, apps/web/app/layout.tsx, apps/web/app/globals.css.
> TASK: Create dashboard layout with Sidebar and TopNav. Create all account feature pages (points, friends, safety, documents, settings, help). Move trips into authenticated route group. Update landing page with login CTA. Wrap root layout with Auth0 UserProvider.
> RULE: If you believe a change is needed outside scope (API routes, Prisma, contracts), add a TODO comment and STOP.
