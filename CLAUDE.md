# Claude Code Instructions - travel.aw

## Project Overview
Travel planning and loyalty program management app built with Next.js 16.

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: Prisma + SQLite (dev), Turso (prod)
- **Styling**: Tailwind CSS
- **Monorepo**: pnpm workspaces
- **AI**: Anthropic Claude API for vision/parsing

## Packages
- `apps/web` - Next.js app
- `packages/contracts` - Shared TypeScript types
- `packages/ui` - Shared UI components
- `packages/adapters` - External service adapters

## Common Commands
```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm db:push      # Apply Prisma schema changes
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
```

## Key Files
- `apps/web/app/_lib/prisma.ts` - Database client
- `apps/web/app/_lib/auth.ts` - Auth utilities (getCurrentUser)
- `apps/web/app/_lib/anthropic.ts` - Claude API client
- `packages/contracts/src/types/` - Shared type definitions

## Conventions
- API routes return data at root level (not wrapped in `{ data: ... }`)
- Use `getCurrentUser()` for auth in API routes
- Client components require `'use client'` directive
- Next.js 16: `params` is a Promise in route handlers

## User Preferences
- No emojis in code or responses unless requested
- Commit frequently with descriptive messages
- Push to GitHub after completing features
- Update CHANGELOG.md with notable changes
- Session docs go in `TASKS/` folder

## Git
- Repository: github.com/prosy/travel.aw
- Branch: master
- Co-author commits with: `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`
