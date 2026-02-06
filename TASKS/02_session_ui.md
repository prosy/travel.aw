# Session 2 — UI Components + Screens

## Branch
`codex-ui`

## Scope lock
Only modify:
- `packages/ui/**`
- `apps/web/**/app/**` (screens/components)
Do NOT modify:
- `apps/web/**/app/api/**`
- `apps/web/**/app/layout.tsx`

## Objective
Build four key screens matching the information hierarchy.

Screens:
- `/trips`
- `/trips/[id]`
- `/search/hotels`
- `/search/flights`

Required:
- `PlaceholderTile` deterministic monogram + stable color hash

## Codex prompt
> You are working in ../documents/travel.aw on branch codex-ui.  
> SCOPE: Only modify packages/ui/** and apps/web/**/app/** excluding apps/web/**/app/api/** and apps/web/**/app/layout.tsx.  
> TASK: Implement PlaceholderTile (deterministic monogram + stable color). Build screens: /trips, /trips/[id] timeline, /search/hotels, /search/flights matching the information hierarchy in the screenshots. Use contracts types. Fetch from existing API endpoints if present; otherwise use temporary mock fetch helpers with TODO markers (do not create APIs).  
> RULE: If you think a change is needed outside scope, add a TODO comment and STOP.
