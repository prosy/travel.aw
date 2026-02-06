# travel.aw

A pnpm monorepo with Next.js (App Router), shared workspace packages, and Prisma + SQLite.

## Structure

```
travel.aw/
  apps/
    web/                     # Next.js app (App Router)
  packages/
    contracts/               # TS + JSON Schemas
    ui/                      # shared UI components
    adapters/                # supplier + link adapters
  prisma/
    schema.prisma
    seed.mjs
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run development server
pnpm dev

# Build all packages
pnpm build
```

## Workspace Packages

- `@travel/contracts` - TypeScript contracts and JSON schemas
- `@travel/ui` - Shared React UI components
- `@travel/adapters` - Supplier and link adapters

## App Router Path

The Next.js app uses **`apps/web/app/`** (no `src` directory).
