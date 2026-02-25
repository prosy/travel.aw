# Deploy travel.aw to Vercel + Turso

## Prerequisites
- [Homebrew](https://brew.sh) installed
- [Vercel account](https://vercel.com/signup)
- Git repo pushed to GitHub/GitLab

---

## 1. Install Turso CLI

```bash
brew install tursodatabase/tap/turso
```

## 2. Create Turso Account & Database

```bash
# Login (opens browser)
turso auth login

# Create database
turso db create travel-aw

# Verify
turso db list
```

## 3. Get Connection Credentials

```bash
# Get URL (save this)
turso db show travel-aw --url
# Output: libsql://travel-aw-YOUR_ORG.turso.io

# Create auth token (save this)
turso db tokens create travel-aw
# Output: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

## 4. Push Schema to Turso

```bash
# From project root
DATABASE_URL="libsql://travel-aw-YOUR_ORG.turso.io?authToken=YOUR_TOKEN" pnpm prisma db push
```

## 5. Seed Turso Database

```bash
TURSO_DATABASE_URL="libsql://travel-aw-YOUR_ORG.turso.io" \
TURSO_AUTH_TOKEN="YOUR_TOKEN" \
node prisma/seed.mjs
```

## 6. Test Locally Against Turso (Optional)

```bash
# Add to .env.local
TURSO_DATABASE_URL="libsql://travel-aw-YOUR_ORG.turso.io"
TURSO_AUTH_TOKEN="YOUR_TOKEN"

# Run dev server
pnpm dev

# Verify data loads from Turso (public endpoint, no auth required)
curl http://localhost:3000/api/support/faq
```

## 7. Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure:
   - **Root Directory:** `apps/web`
   - **Framework:** Next.js (auto-detected)
4. Add Environment Variables:
   | Name | Value |
   |------|-------|
   | `TURSO_DATABASE_URL` | `libsql://travel-aw-YOUR_ORG.turso.io` |
   | `TURSO_AUTH_TOKEN` | `eyJ...` |
5. Click **Deploy**

### Option B: Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Deploy (will prompt for env vars)
cd apps/web
vercel

# Set env vars
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN

# Redeploy with env vars
vercel --prod
```

---

## Verify Deployment

```bash
# Replace with your Vercel URL (public endpoint, no auth required)
curl https://your-app.vercel.app/api/support/faq
```

Should return JSON with FAQ articles. Auth-protected endpoints (e.g., `/api/trips`) require a valid session — test those via the browser after logging in.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database not found" | Check TURSO_DATABASE_URL spelling |
| Empty data | Run seed script against Turso |
| Build fails | Ensure `apps/web` is set as root directory |
| 500 errors | Check Vercel logs, verify env vars are set |

---

## Local Development

Local dev uses SQLite automatically (no Turso needed):

```bash
pnpm db:push    # Create local DB
pnpm db:seed    # Seed local DB
pnpm dev        # Run dev server
```

Turso only activates when `TURSO_DATABASE_URL` is set.
