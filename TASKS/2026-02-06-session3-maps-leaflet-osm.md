---
title: "Session 3 — Maps (Leaflet + OSM tiles)"
date: 2026-02-06
branch: "codex-maps"
owner: "unassigned"
scope:
  - "packages/ui/**MapPreview**"
  - "apps/web/**/app/map/**"
estimate: "half day"
---

```markdown
# Session 3 — Maps (Leaflet + OSM tiles)

## Branch
`codex-maps`

## Scope lock
Only modify:
- `packages/ui/**MapPreview**`
- `apps/web/**/app/map/**`
- `apps/web/**/app/layout.tsx` (Leaflet CSS import only)

## Objective
- Map preview strip with pins (OSM tiles)
- Full-screen `/map`
- SSR-safe via client component / dynamic import

## Env
`MAP_TILE_URL` default `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

## Codex prompt
> You are working in ../documents/travel.aw on branch codex-maps.  
> SCOPE: Only modify packages/ui/MapPreview.tsx, apps/web/**/app/map/**, and apps/web/**/app/layout.tsx (Leaflet CSS import only).  
> TASK: Add Leaflet + react-leaflet map preview strip with OSM tiles and pins. Add /map full-screen page. Ensure SSR-safe (client components / dynamic import). Tile URL via env MAP_TILE_URL with default to OSM.  
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.

```
