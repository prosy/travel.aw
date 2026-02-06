# Session 13: Feature Sub-Components

**Owner:** Claude 3 (other guy)
**Branch:** `feature/subcomponents`
**Depends on:** Session 11 merged (Auth backend), Session 12 in progress (page scaffolds)
**Status:** Ready to start

---

## Scope Lock

**IN SCOPE:**
- 17 sub-components across 6 feature directories
- All files are NEW (no edits to existing files)
- Pure presentational UI components
- TypeScript + Tailwind CSS styling

**OUT OF SCOPE:**
- Page files (Session 12 owns those)
- API routes (Session 11 complete)
- Layout components (Session 12 owns Sidebar, TopNav, MobileNav)
- Auth components (Session 12 owns LoginButton, LogoutButton, UserAvatar)
- Any file not explicitly listed below

---

## File Manifest

### Points (`apps/web/app/_components/points/`)

| File | Purpose |
|------|---------|
| `PointsAccountCard.tsx` | Card displaying program name, tier, balance, pending/expiring points |
| `TransactionList.tsx` | Table/list of transactions with type badges, amounts, dates |
| `AddAccountForm.tsx` | Form: program type select, program name, tier, initial balance, notes |

### Friends (`apps/web/app/_components/friends/`)

| File | Purpose |
|------|---------|
| `FriendCard.tsx` | Avatar, name, email, status badge, action buttons (remove, block) |
| `InviteForm.tsx` | Email input + send invite button |
| `FriendRequestCard.tsx` | Incoming request: avatar, name, accept/decline buttons |

### Safety (`apps/web/app/_components/safety/`)

| File | Purpose |
|------|---------|
| `EmergencyContactCard.tsx` | Name, relationship, phone, email, primary badge, notify toggles |
| `AdvisoryBadge.tsx` | Color-coded badge (1-4 level) with country name |
| `AlertBanner.tsx` | Dismissible banner with severity color, title, message, action link |

### Documents (`apps/web/app/_components/documents/`)

| File | Purpose |
|------|---------|
| `DocumentCard.tsx` | Type icon, title, country flag, expiration with warning if near |
| `DocumentViewer.tsx` | Modal/panel showing decrypted document details |
| `UploadForm.tsx` | Form: type select, title, expiration date, file upload, country |

### Settings (`apps/web/app/_components/settings/`)

| File | Purpose |
|------|---------|
| `ToggleSwitch.tsx` | Reusable toggle with label and description |
| `CalendarConnect.tsx` | Connect/disconnect buttons for Google Calendar, Apple Calendar |

### Help (`apps/web/app/_components/help/`)

| File | Purpose |
|------|---------|
| `FaqAccordion.tsx` | Expandable Q&A sections grouped by category |
| `TicketForm.tsx` | Form: subject, category select, priority, message textarea |
| `MessageThread.tsx` | Chat-style thread with user/support message bubbles, timestamps |

---

## Type Imports

Use types from `@travel/contracts`:

```typescript
// Points
import type { PointsAccount, PointsTransaction, PointsProgramType, PointsTransactionType } from '@travel/contracts';

// Safety
import type { EmergencyContact, TravelAdvisory, UserAlert, AlertSeverity } from '@travel/contracts';

// Documents
import type { TravelDoc, TravelDocType } from '@travel/contracts';

// Support
import type { SupportTicket, SupportMessage, TicketCategory, TicketPriority, FaqArticle } from '@travel/contracts';

// Friends (use User type)
import type { User } from '@travel/contracts';
```

---

## Component Patterns

### Props Interface Convention
```typescript
interface PointsAccountCardProps {
  account: PointsAccount;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PointsAccountCard({ account, onEdit, onDelete }: PointsAccountCardProps) {
  // ...
}
```

### Styling
- Use Tailwind CSS classes
- Follow existing component patterns in `apps/web/app/_components/`
- Responsive: mobile-first approach
- Dark mode: use `dark:` variants if existing components use them

### Form Components
- Use `useState` for form state
- Props: `onSubmit: (data: T) => void`, `isLoading?: boolean`
- Show loading state on submit button
- Basic client-side validation

### Card Components
- Consistent padding: `p-4` or `p-6`
- Border radius: `rounded-lg`
- Shadow: `shadow-sm` or `shadow`
- Hover states where appropriate

---

## Verification

After completing all components:

```bash
cd apps/web
pnpm build
```

Components should compile without errors. They won't be rendered yet (pages import them later), but TypeScript should pass.

---

## Codex Prompt

```
You are implementing 17 sub-components for a travel app's account features.

RULES:
1. Only create files listed in the File Manifest above
2. Do NOT modify any existing files
3. Do NOT create page files or layout files
4. Use types from @travel/contracts (already defined)
5. Use Tailwind CSS for styling
6. Export components as named exports
7. Include TypeScript props interfaces

START with the Points components, then Friends, Safety, Documents, Settings, Help.

Create each component file with:
- Props interface
- Functional component
- Tailwind styling
- Basic interactivity (onClick handlers wired to props)

Do NOT add API calls - pages will handle data fetching and pass data as props.
```

---

## Coordination

- **No merge conflicts**: All files are new, in directories Session 12 won't touch
- **Integration**: Session 12 page scaffolds will import these components later (separate PR or follow-up)
- **Branch strategy**: Create `feature/subcomponents`, merge to main after Session 12 merges

---

## Commit Message Template

```
Add feature sub-components for account UI

Components added:
- Points: PointsAccountCard, TransactionList, AddAccountForm
- Friends: FriendCard, InviteForm, FriendRequestCard
- Safety: EmergencyContactCard, AdvisoryBadge, AlertBanner
- Documents: DocumentCard, DocumentViewer, UploadForm
- Settings: ToggleSwitch, CalendarConnect
- Help: FaqAccordion, TicketForm, MessageThread

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
