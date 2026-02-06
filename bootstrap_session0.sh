#!/usr/bin/env bash
set -euo pipefail

# Session 0 Bootstrap helper (optional)
# Run from repo root: ../documents/travel.aw
# NOTE: This script assumes pnpm is installed.

# Root files
cat > pnpm-workspace.yaml <<'YAML'
packages:
  - "apps/*"
  - "packages/*"
YAML

cat > package.json <<'JSON'
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
JSON

cat > .prettierrc <<'JSON'
{ "singleQuote": true, "semi": true, "printWidth": 100 }
JSON

cat > .gitignore <<'TXT'
node_modules
.next
dist
.env
.env.local
.DS_Store
prisma/dev.db
TXT

cat > tsconfig.base.json <<'JSON'
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
JSON

mkdir -p apps packages/contracts/src packages/ui/src packages/adapters/src

# Workspace package.json files
cat > packages/contracts/package.json <<'JSON'
{
  "name": "@travel/contracts",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": { "build": "tsc -p tsconfig.json" }
}
JSON

cat > packages/ui/package.json <<'JSON'
{
  "name": "@travel/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": { "build": "tsc -p tsconfig.json" },
  "peerDependencies": { "react": "^18", "react-dom": "^18" }
}
JSON

cat > packages/adapters/package.json <<'JSON'
{
  "name": "@travel/adapters",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": { "build": "tsc -p tsconfig.json" }
}
JSON

# Package tsconfigs
for p in contracts ui adapters; do
  cat > "packages/${p}/tsconfig.json" <<'JSON'
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*"]
}
JSON
done

# Barrel exports
echo 'export {};' > packages/contracts/src/index.ts
echo 'export {};' > packages/ui/src/index.ts
echo 'export {};' > packages/adapters/src/index.ts

# Prisma
pnpm add -D prisma
pnpm add @prisma/client
pnpm dlx prisma init --datasource-provider sqlite

cat > .env.example <<'ENV'
DATABASE_URL="file:./prisma/dev.db"
ENV

mkdir -p prisma
cat > prisma/seed.mjs <<'JS'
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log("Seed placeholder — Session 1 replaces this.");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
JS

echo "Bootstrap files created."
echo "Next: scaffold Next.js app under apps/web using create-next-app."
