---
title: Trips Page Enhancements
date: 2026-02-07
branch: feature/trips-page-enhancements
scope: apps/web
estimate: 30min
owner: claude
status: complete
---

# Trips Page Enhancements

## Overview

Enhance the trips listing page with renamed title, new event seed data, and separation of past/upcoming items.

## Requirements

### 1. Rename Page Title
- **Current**: "My Trips"
- **New**: "Trips and Events"
- **File**: `apps/web/app/(authenticated)/trips/page.tsx`

### 2. Add Zootown Festival Seed Data
- **Event**: Zootown Festival
- **Artists**: The Lumineers, The Chicks, and more
- **Type**: 2-Day Pass
- **Dates**: June 19-20, 2026
- **Time**: TBA
- **Location**: Missoula County Fairgrounds, Missoula, Montana, USA
- **File**: `prisma/seed.mjs`

### 3. Add "Past Trips and Events" Section
- Split trips into two categories based on `endDate`:
  - **Upcoming**: `endDate >= today`
  - **Past**: `endDate < today`
- Display "Past Trips and Events" section below the main list
- **File**: `apps/web/app/(authenticated)/trips/page.tsx`

## Implementation Path

```
1. Update seed.mjs
   └── Add Zootown Festival trip with 2 activity items (Day 1, Day 2)

2. Update trips/page.tsx
   ├── Change <h1> from "My Trips" to "Trips and Events"
   ├── Add date comparison logic to split trips
   ├── Render upcoming trips first
   └── Render past trips in separate section with <h2>

3. Re-run seed
   └── DATABASE_URL=... pnpm prisma db seed
```

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Database tables | ✅ Ready | Trip, TripItem tables exist |
| Seed infrastructure | ✅ Ready | prisma/seed.mjs configured |
| Auth system | ✅ Ready | Page already auth-protected |

## Authority Compliance

| Authority | Applicable | Compliance |
|-----------|------------|------------|
| CODEOWNERS | ✅ | Changes to apps/web owned by @blackcat |
| SECURITY.md | N/A | No security-sensitive changes |
| authz.yml | N/A | No permission changes required |
| CI/CD | ✅ | Must pass build after changes |

## Files Modified

| File | Change |
|------|--------|
| `prisma/seed.mjs` | Add Zootown Festival event |
| `apps/web/app/(authenticated)/trips/page.tsx` | Rename title, add past/upcoming split |

## Testing

- [ ] Seed runs without error
- [ ] /trips shows "Trips and Events" title
- [ ] Zootown Festival appears in list
- [ ] Past trips appear in separate section (after endDate passes)
- [ ] Build passes (`pnpm build`)

## Rollback

If issues arise:
```bash
git checkout HEAD -- apps/web/app/(authenticated)/trips/page.tsx prisma/seed.mjs
DATABASE_URL=... pnpm prisma db seed
```
