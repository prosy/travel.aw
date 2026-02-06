# travel.aw — 3rd-Party Integrations & Outstanding Stubs

> Generated from full codebase audit. Last updated after Day-2 merge.

---

## 3rd-Party APIs & Integrations

### Working

| Integration | Service | Files | Env Vars | Notes |
|---|---|---|---|---|
| **Wikipedia REST API** | Destination hero images | `_lib/wikipedia-image.ts` | None | Fetches page summary + thumbnail. 24h ISR cache. |
| **OpenStreetMap Tiles** | Map tile layer | `packages/ui/src/MapPreview.tsx`, `map/page.tsx` | `NEXT_PUBLIC_MAP_TILE_URL` (optional) | Default OSM tiles. Swap for Mapbox/Stadia via env. |
| **SendGrid Inbound Parse** | Email webhook receiver | `api/email/inbound/route.ts` | None (webhook) | Accepts multipart/form-data or JSON. Stores raw + creates TripItem. |
| **Google/Reddit/Wikipedia/Expedia Search** | URL builder (client-side) | `packages/adapters/src/searchLinks.ts` | None | No API calls — generates search URLs opened in new tabs. |

### Needs Setup (Turso — in progress)

| Integration | Service | Files | Env Vars | Notes |
|---|---|---|---|---|
| **Turso (libSQL)** | Production database | `_lib/prisma.ts`, `prisma/schema.prisma` | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Adapter installed (`@prisma/adapter-libsql`, `@libsql/client`). Falls back to SQLite if env vars not set. |

### Not Yet Integrated (needed for full product)

| Integration | Purpose | Where it's needed | Priority |
|---|---|---|---|
| **Flight search API** (Amadeus, Duffel, or similar) | Real flight search results | `search/flights/page.tsx` (TODO on line 20) | High |
| **Hotel search API** (Booking.com, Expedia, or similar) | Real hotel search results | `search/hotels/page.tsx` (TODO on line 12) | High |
| **Auth provider** (NextAuth, Clerk, etc.) | User authentication | All API routes are currently public | High |
| **Email forwarding service** | Route emails to SendGrid webhook | `api/email/inbound/route.ts` | Medium |
| **Image CDN / caching layer** | Cache Wikimedia images, serve thumbnails | `CachedMedia` table exists but no cache job | Medium |
| **AI extraction** (Claude API, etc.) | Parse emails into structured trip data | `InboundEmail.extractionStatus` field exists | Medium |

---

## Outstanding Stubs & TODOs

### TODOs in Source Code

| File | Line | TODO |
|---|---|---|
| `apps/web/app/search/flights/page.tsx` | 20 | `TODO: Add search form once search API exists` |
| `apps/web/app/search/hotels/page.tsx` | 12 | `TODO: Add search form once search API exists` |

### Stub Implementations

| File | What | Status |
|---|---|---|
| `_lib/mock-data.ts` → `fetchHotelOffers()` | Extracts hotel offers from existing TripItems instead of real search | Temporary — works with seed data, needs real search API |
| `_lib/mock-data.ts` → `fetchFlightOffers()` | Extracts flight offers from existing TripItems instead of real search | Temporary — works with seed data, needs real search API |
| `packages/ui/src/PlaceholderTile.tsx` | Deterministic monogram + color hash | Permanent placeholder — swap for real destination photos when media pipeline exists |
| `prisma/seed.mjs` | 2 sample trips, 10 items, 2 media, 1 email | Dev/demo data — fine for now |

### Empty/Unused Infrastructure

| Table/Feature | Schema Ready | Code Using It | What's Missing |
|---|---|---|---|
| `OfferCache` | Yes (Prisma model) | No consumers | Needs search API integration to populate/query |
| `CachedMedia` | Yes (Prisma model) | Seeded only | Needs automated fetch + cache job from Wikimedia/Unsplash |
| `InboundEmail.extractedData` | Yes (JSON field) | Stores basic metadata | Needs AI extraction pipeline to parse emails into offers/items |
| `ContextBundle` type | Yes (contracts) | No consumers | Needs agent/AI integration for conversational search |

---

## Environment Variables

| Variable | Required | Default | Used In |
|---|---|---|---|
| `DATABASE_URL` | Yes | `file:./dev.db` | `prisma/schema.prisma` |
| `TURSO_DATABASE_URL` | Prod only | — | `_lib/prisma.ts` |
| `TURSO_AUTH_TOKEN` | Prod only | — | `_lib/prisma.ts` |
| `NEXT_PUBLIC_MAP_TILE_URL` | No | OSM tiles | `map/page.tsx` |
| `NODE_ENV` | Auto | `development` | `_lib/prisma.ts` |

---

## NPM Packages (External Service SDKs)

| Package | Version | Purpose |
|---|---|---|
| `@prisma/client` | 5.22.0 | ORM / database access |
| `@prisma/adapter-libsql` | ^7.3.0 | Prisma ↔ Turso bridge |
| `@libsql/client` | ^0.17.0 | Turso (libSQL) driver |
| `leaflet` | ^1.9.4 | Interactive maps |
| `react-leaflet` | ^5.0.0 | React bindings for Leaflet |
| `next` | 16.1.6 | Web framework |

---

## Summary: What Needs Work

1. **Search APIs** — Flight + hotel search are stubbed. Need to pick providers and integrate.
2. **Authentication** — No auth layer. All endpoints are public.
3. **Turso** — Adapter installed, migration in progress with the other session.
4. **Email pipeline** — Webhook works but no AI extraction to turn emails into structured trip data.
5. **Media caching** — Table exists, Wikipedia fetch works, but no background job to populate/refresh cache.
6. **OfferCache** — Schema ready but no code reads/writes it yet.
