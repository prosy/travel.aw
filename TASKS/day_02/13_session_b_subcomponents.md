# Session B2 — Reusable Sub-Components for Feature Pages

> **Prerequisite:** Session B scaffolds complete (pages exist with placeholder content).
> **Goal:** Build all reusable sub-components that the feature pages will import.

---

## Branch
`feature/auth-frontend` (same branch as Session B — no file overlap)

## Scope lock
Only create files under:
- `apps/web/app/_components/points/`
- `apps/web/app/_components/friends/`
- `apps/web/app/_components/safety/`
- `apps/web/app/_components/documents/`
- `apps/web/app/_components/settings/`
- `apps/web/app/_components/help/`

Do NOT modify:
- Any page files under `(authenticated)/`
- Any layout or auth components
- Any files under `apps/web/app/api/`
- `prisma/**` or `packages/**`

---

## Design Guidelines

- All components are `'use client'` unless purely presentational
- Use existing Tailwind patterns: zinc palette, rounded-lg, border-zinc-200 dark:border-zinc-800
- Dark mode via `dark:` variants
- Cards: `rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4`
- Buttons: `rounded-md bg-zinc-900 text-white px-4 py-2 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300`
- Use `formatDate`, `formatPrice` from `@/app/_lib/format` where applicable
- Use `PlaceholderTile` from `@travel/ui` for avatars where appropriate
- Types are in `@travel/contracts` — import from there

---

## Tasks

### C1. Points Components (3 files)

**`_components/points/PointsAccountCard.tsx`**
- Props: `account: PointsAccount` (from `@travel/contracts`)
- Display: program name, account number (masked), current balance, tier status
- Link to `/points/{id}` for detail view
- Card style with colored accent based on program name

**`_components/points/TransactionList.tsx`**
- Props: `transactions: PointsTransaction[]`
- Table/list of transactions: date, description, amount (+/-), running balance
- Empty state: "No transactions yet"
- Use `formatDate` for dates

**`_components/points/AddAccountForm.tsx`** (`'use client'`)
- Form with fields: Program Name (text), Account Number (text), Current Balance (number)
- Submit handler: POST to `/api/points` via fetch
- Loading state on submit, error display, redirect on success
- Use `useRouter` from `next/navigation` for redirect

### C2. Friends Components (3 files)

**`_components/friends/FriendCard.tsx`**
- Props: `friend: { id, name, email, picture, status }`
- Display: avatar (use UserAvatar pattern or PlaceholderTile), name, email
- Status badge: accepted (green), pending (amber)
- Action button: "Remove" for accepted friends

**`_components/friends/InviteForm.tsx`** (`'use client'`)
- Email input + "Send Invite" button
- POST to `/api/friends` on submit
- Success/error feedback inline

**`_components/friends/FriendRequestCard.tsx`**
- Props: `request: { id, name, email, picture }`
- Display: avatar, name, email
- Two buttons: "Accept" (POST /api/friends/{id} PATCH status=accepted) and "Decline" (DELETE)

### C3. Safety Components (3 files)

**`_components/safety/EmergencyContactCard.tsx`**
- Props: `contact: EmergencyContact` (from `@travel/contracts`)
- Display: name, relationship, phone, email
- Edit/Delete action buttons
- Phone number displayed but partially masked (show last 4 digits)

**`_components/safety/AdvisoryBadge.tsx`**
- Props: `level: 'low' | 'medium' | 'high' | 'critical'`, `country: string`
- Color-coded badge: low=green, medium=amber, high=orange, critical=red
- Display: country name + level text

**`_components/safety/AlertBanner.tsx`**
- Props: `alert: UserAlert` (from `@travel/contracts`)
- Dismissible banner with alert message
- Color based on severity
- Close button (calls onDismiss callback prop)

### C4. Documents Components (3 files)

**`_components/documents/DocumentCard.tsx`**
- Props: `doc: TravelDoc` (from `@travel/contracts`)
- Display: document type icon, name, expiry date
- Expiry warning: red text if expired, amber if expiring within 30 days
- Link to `/documents/{id}`

**`_components/documents/DocumentViewer.tsx`**
- Props: `doc: TravelDoc`
- Display: all document fields in a readable layout
- Download/print action buttons (non-functional placeholders)

**`_components/documents/UploadForm.tsx`** (`'use client'`)
- Form: document type select, name input, expiry date input, file drop zone
- File drop zone: dashed border area with "Drop file here or click to browse"
- POST to `/api/documents` on submit
- Loading state, error handling

### C5. Settings Components (2 files)

**`_components/settings/ToggleSwitch.tsx`** (`'use client'`)
- Props: `label: string`, `checked: boolean`, `onChange: (checked: boolean) => void`
- Styled toggle switch (not a raw checkbox)
- Accessible: uses button role with aria-checked

**`_components/settings/CalendarConnect.tsx`**
- Props: `provider: 'google' | 'apple'`, `connected: boolean`
- Display: provider icon/name, connection status
- Connect/Disconnect button (non-functional placeholder)

### C6. Help Components (3 files)

**`_components/help/FaqAccordion.tsx`** (`'use client'`)
- Props: `items: { question: string; answer: string }[]`
- Expandable accordion: click question to reveal answer
- Only one item open at a time
- Smooth expand/collapse with CSS transition

**`_components/help/TicketForm.tsx`** (`'use client'`)
- Form: subject input, category select (general/billing/technical/feature), message textarea
- POST to `/api/support/tickets` on submit
- Loading/success/error states

**`_components/help/MessageThread.tsx`**
- Props: `messages: { id, content, sender, createdAt }[]`
- Chat-style message display
- User messages right-aligned, support messages left-aligned
- Timestamps formatted with `formatDateTime`

---

## Verification
```bash
pnpm build    # No type errors — components are not yet imported by pages
```

All components should compile independently. Page integration (importing these into the scaffold pages) will happen in a follow-up task.

---

## Codex Prompt

> You are working in travel.aw on branch feature/auth-frontend.
> Read TASKS/day_02/13_session_b_subcomponents.md for full task list.
> SCOPE: Only create files under apps/web/app/_components/points/, friends/, safety/, documents/, settings/, help/.
> TASK: Build 17 reusable React components for the feature pages. Use Tailwind CSS, zinc palette, dark mode support. Import types from @travel/contracts. Use 'use client' for interactive components. Follow existing project patterns (formatDate, PlaceholderTile, etc).
> RULE: Do NOT modify any existing files. Only create new component files. If you need a change outside scope, add a TODO comment and STOP.
