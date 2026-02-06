# Session 0 — Bootstrap (travel.aw)

**Goal:** Initialize a pnpm monorepo with **Next.js (App Router)**, workspace packages (**contracts/ui/adapters**), and **Prisma + SQLite** so Sessions 1–5 can run in parallel with minimal merge conflicts.

## How to use with Codex
Open Codex in `../documents/travel.aw` and prompt:

> Read `TASKS/00_session0_bootstrap.md` and implement it exactly.  
> Keep changes minimal and deterministic.  
> If the repo is already partially bootstrapped, reconcile to this target structure without creating duplicate folders.

## Target repo structure
```
travel.aw/
  apps/
    web/
  packages/
    contracts/
    ui/
    adapters/
  prisma/
    schema.prisma
    seed.mjs
  pnpm-workspace.yaml
  package.json
  tsconfig.base.json
  .prettierrc
  .gitignore
  README.md
  .env.example
```

## Non-negotiables
1) pnpm workspaces
2) Next.js with TypeScript + Tailwind + ESLint (App Router)
3) Prisma + SQLite for Day-1
4) Imports: `@travel/contracts`, `@travel/ui`, `@travel/adapters`
5) Avoid creating both `apps/web/app` and `apps/web/src/app`; keep the scaffold’s choice.

## Step 1 — Root workspace files
Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Create root `package.json`:
```json
{
  "name": "travel-aw",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "format": "prettier -w .",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "devDependencies": {
    "prettier": "^3.3.3"
  }
}
```

Create `.prettierrc`:
```json
{ "singleQuote": true, "semi": true, "printWidth": 100 }
```

Create `.gitignore`:
```
node_modules
.next
dist
.env
.env.local
.DS_Store
prisma/dev.db
```

Create `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "declaration": true,
    "emitDeclarationOnly": false,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Step 2 — Scaffold Next.js app under `apps/web`
Use `create-next-app@latest` with:
- TypeScript
- Tailwind
- ESLint
- App Router
- import alias `@/*`

Keep the scaffold’s folder structure (often `apps/web/src/app`).

## Step 3 — Workspace packages
Create:
- `packages/contracts/src`
- `packages/ui/src`
- `packages/adapters/src`

Create `packages/contracts/package.json`:
```json
{
  "name": "@travel/contracts",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": { "build": "tsc -p tsconfig.json" }
}
```

Create `packages/ui/package.json`:
```json
{
  "name": "@travel/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "peerDependencies": { "react": "^18", "react-dom": "^18" }
}
```

Create `packages/adapters/package.json`:
```json
{
  "name": "@travel/adapters",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": { "build": "tsc -p tsconfig.json" }
}
```

Create `packages/*/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*"]
}
```

Create `packages/*/src/index.ts`:
```ts
export {};
```

## Step 4 — Wire packages into web
In `apps/web/package.json` add deps:
```json
"dependencies": {
  "@travel/contracts": "workspace:*",
  "@travel/ui": "workspace:*",
  "@travel/adapters": "workspace:*"
}
```

In `apps/web/tsconfig.json` add:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@travel/contracts": ["../../packages/contracts/src"],
      "@travel/ui": ["../../packages/ui/src"],
      "@travel/adapters": ["../../packages/adapters/src"]
    }
  }
}
```

## Step 5 — Prisma + SQLite
Install prisma + client, init sqlite provider, and create `.env.example`:
```
DATABASE_URL="file:./prisma/dev.db"
```

Add Prisma seed hook in root `package.json`:
```json
"prisma": { "seed": "node prisma/seed.mjs" }
```

Create `prisma/seed.mjs` placeholder (Session 1 replaces it).

## Step 6 — Sanity checks
- `pnpm install`
- `pnpm db:generate`
- `pnpm dev`
- `pnpm build`

Codex should report final tree + commands + whether web router path is `src/app` or `app`.
