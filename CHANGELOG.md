# Changelog

All notable changes to this project are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

#### Trips Page Enhancements (Session 7)
- Renamed "My Trips" to "Trips and Events"
- Added "Past Trips and Events" section with collapsible UI
- Seed data: Zootown Festival 2026, NYC New Year's (past event)
- Context labels on search chips ("Search {destination}")
- Removed Expedia chip to prevent wrapping

#### AI-Powered Loyalty Program Import (Session 8)
- `POST /api/points/parse` — Claude Vision endpoint for parsing screenshots/text
- `ImportModal` — Upload image or paste text of loyalty programs
- `ImportReviewTable` — Editable table for reviewing extracted programs
- Bulk save support in `POST /api/points`
- Added `car_rental` program type
- Big spinning loader during AI processing
- Success screen with checkmark after import

#### Points Detail Page (Session 8)
- Edit Balance button with inline form
- Delete Program with confirmation dialog
- Add Transaction form (type, amount, description)
- Transaction history display

## [0.1.0] - 2026-02-06

### Added

#### Infrastructure (Session 0)
- pnpm monorepo with workspace packages
- Next.js 16 with App Router, TypeScript, Tailwind
- Prisma + SQLite for local development
- Workspace packages: `@travel/contracts`, `@travel/ui`, `@travel/adapters`

#### Contracts & Database (Session 1)
- JSON Schemas: trip, trip-item, offer, media, context-bundle, citation
- TypeScript types exported from `@travel/contracts`
- Prisma models: Trip, TripItem, CachedMedia, InboundEmail, OfferCache
- Seed data: 2 trips (Tokyo, Italy), 10 items, 2 media entries

#### UI Components & Screens (Session 2)
- `PlaceholderTile` component with deterministic monogram + color hash
- `/trips` — Trip list page
- `/trips/[id]` — Trip detail with timeline
- `/search/hotels` — Hotel search results
- `/search/flights` — Flight search results
- Date/price formatters with UTC timezone handling

#### Maps (Session 3)
- `MapPreview` component with Leaflet + OpenStreetMap
- `/map` — Full-screen interactive map
- SSR-safe dynamic imports for Leaflet
- Pins from real trip item locations

#### Search Links (Session 4)
- `QuickSearchChips` component on trip detail
- One-click searches: Google, Reddit, Wikipedia, Expedia
- URL-safe query encoding

#### Email Ingest (Session 5)
- `POST /api/email/inbound` — SendGrid-style webhook
- Stores raw payload in `InboundEmail` table
- Creates `TripItem` (type=note) with `evidence.kind=email`
- Duplicate detection via `messageId` (returns 409)

#### API Routes (Day-2 Worker A)
- `GET /api/trips` — List all trips
- `GET /api/trips/[id]` — Single trip with items
- `GET /api/trips/[id]/items` — Trip items only
- `GET /api/media` — All cached media
- Prisma → Contracts mapping layer (`mappers.ts`)
- Shared Prisma singleton (`prisma.ts`)

#### Real Data Integration (Day-2 Worker B)
- Replaced mock data with Prisma queries
- Re-exported types from `@travel/contracts`
- Map pins from real trip item locations
- Function signatures preserved (zero page changes)

#### Production Deployment Support
- Turso adapter for serverless SQLite
- Auto-detection: Turso in production, SQLite locally
- `DEPLOY.md` deployment guide

### Fixed

- Phantom MapPreview export causing build failure (Session 2)
- `fetchTrip()` mutation bug with shallow copy
- `formatDate()`/`formatDateTime()` timezone bug (added `timeZone: 'UTC'`)
- JSON Schema required arrays aligned with TypeScript types
- Seed data: Hotel de Russie missing pricing in offerData
- `offer.schema.json` missing top-level `oneOf`
- React peer dependency range (`^18 || ^19`)

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 0.1.0 | 2026-02-06 | Initial release — trips, search, maps, email ingest, Turso |
