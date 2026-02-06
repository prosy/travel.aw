# Session 1 — Contracts + DB (Prisma)

## Branch
`codex-contracts-db`

## Scope lock
Only modify:
- `packages/contracts/**`
- `prisma/**`
- optional `apps/web/**/api/_shared/**`

## Objective
Implement canonical JSON Schemas + TS types and Day-1 SQLite DB model.

## Deliverables
- Schemas: trip, offer, media, context_bundle, citation
- TS exports in `packages/contracts/src/`
- Prisma models: Trip, TripItem, CachedMedia, InboundEmail (+ optional OfferCache)
- Seed data: 2 trips + 6–10 items

## Codex prompt
> You are working in ../documents/travel.aw on branch codex-contracts-db.  
> SCOPE: You may only modify: packages/contracts/**, prisma/**, and if needed apps/web/**/api/_shared/**. Do NOT modify UI screens.  
> TASK: Implement JSON Schemas for Trip/TripItem, OfferHotel/OfferFlight, Media (wikimedia/placeholder), ContextBundle, Citation. Export TypeScript types. Add Prisma schema for Trip, TripItem, CachedMedia, InboundEmail. Provide seed script with 2 sample trips and 6 items. Ensure pnpm workspace builds.  
> RULE: If you believe a change is needed outside scope, add a TODO comment and STOP.
