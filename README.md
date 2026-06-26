# Portfolio Career

Personal Portfolio & Career Management System — a Next.js full-stack app to manage skills, certifications, achievements, projects, and auto-generated resumes with a public portfolio page.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API routes (`/api/v1/*`)
- **Database:** PostgreSQL + Prisma (local Docker, Supabase, or `prisma dev`)
- **Auth:** Auth.js (NextAuth v5) with credentials + JWT
- **Files:** Cloudflare R2 (S3-compatible) with local `uploads/` fallback
- **PDF:** `@react-pdf/renderer`

## Quick start (local)

### Prerequisites

- Node.js 20+
- **Option A:** Docker Desktop (local PostgreSQL via `docker compose`)
- **Option B:** No Docker — use `npx prisma dev` (built-in local Postgres)
- **Option C:** [Supabase](https://supabase.com) hosted PostgreSQL (recommended for production)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

**Option A — Docker** (if Docker Desktop is working):

```bash
docker compose up -d
```

Use the `DATABASE_URL` from `.env.example` (port `5432`).

**Option B — No Docker** (recommended if Docker gives 500 errors):

```bash
npx prisma dev --detach --name portfolio-career
npx prisma dev ls
```

Copy the **TCP** connection string (e.g. `postgres://postgres:postgres@localhost:51218/template1?sslmode=disable`) into `.env` as `DATABASE_URL`.

To stop later: `npx prisma dev stop portfolio-career`

**Option C — Supabase** (hosted PostgreSQL):

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **Project Settings → Database → Connect**.
3. Copy the **Transaction pooler** URI (port `6543`) into `.env` as `DATABASE_URL`. Append `?pgbouncer=true` if it is not already present.
4. Copy the **Session pooler** URI (port `5432`) or **Direct connection** URI into `.env` as `DIRECT_URL`.
5. Replace `[YOUR-PASSWORD]` with your database password (or create a dedicated `prisma` user in the Supabase SQL editor).

Example `.env` values:

```env
DATABASE_URL="postgresql://postgres.abcdefgh:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcdefgh:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

The app uses `DATABASE_URL` (pooled) at runtime. Prisma CLI commands (`db:migrate`, `db:deploy`, `db:seed`) use `DIRECT_URL` via `prisma.config.ts`.

### 3. Configure environment

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

### 4. Run migrations and seed admin user

```bash
npm run db:deploy
npm run db:seed
```

Default admin credentials (from `.env` / `.env.example`):

- Email: `admin@example.com`
- Password: `changeme123`
- Portfolio slug: `admin`

Change these in `.env` before running `npm run db:seed` if you want different credentials.

### 5. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to dashboard (login required).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Seed admin user |

## Project structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Admin CRUD pages
│   ├── (public)/portfolio/    # Public portfolio
│   └── api/v1/                # REST API
├── components/                # UI components
├── lib/                       # Auth, Prisma, validators, services
├── services/                  # Client API helpers
└── types/
prisma/                        # Schema, migrations, seed
tests/                         # Unit + E2E tests
```

## API overview

All authenticated endpoints require an admin session.

| Resource | Endpoints |
|----------|-----------|
| Skills | `GET/POST /api/v1/skills`, `PATCH/DELETE /api/v1/skills/:id` |
| Certifications | `GET/POST /api/v1/certifications`, `PATCH/DELETE /api/v1/certifications/:id` |
| Achievements | `GET/POST /api/v1/achievements`, `PATCH/DELETE /api/v1/achievements/:id` |
| Projects | `GET/POST /api/v1/projects`, `PATCH/DELETE /api/v1/projects/:id` |
| Resumes | `GET /api/v1/resumes`, `POST /api/v1/resumes/generate` |
| Upload | `POST /api/v1/upload` |
| Public | `GET /api/v1/public/portfolio/:slug` |

## Deployment

Step-by-step guide to deploy on **Vercel** with **Supabase** as the production database.

### Deployment checklist

```
[ ] Supabase project created
[ ] DATABASE_URL + DIRECT_URL copied from Supabase
[ ] npm run db:deploy + db:seed run against production DB
[ ] GitHub repo connected to Vercel
[ ] Environment variables set in Vercel
[ ] Deploy succeeded
[ ] Login works at /login
[ ] Public portfolio loads at /portfolio/[slug]
```

---

### Step 1 — Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard).
2. Click **New project**.
3. Choose a name, database password, and region.
4. Wait until the project finishes provisioning.

---

### Step 2 — Copy database connection strings

1. In Supabase, open **Project Settings → Database → Connect**.
2. Copy two URLs:

| Vercel variable | Supabase connection | Notes |
|-----------------|---------------------|-------|
| `DATABASE_URL` | **Transaction pooler** (port `6543`) | Append `?pgbouncer=true` if not present |
| `DIRECT_URL` | **Session pooler** or **Direct connection** (port `5432`) | Used by Prisma migrations |

Example:

```env
DATABASE_URL="postgresql://postgres.abcdefgh:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.abcdefgh:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

Replace `[YOUR-PASSWORD]` with your database password.

---

### Step 3 — Run migrations on the production database

Before the first deploy, apply the schema and seed the admin user **from your local machine**, pointing at Supabase.

1. Temporarily set production URLs in `.env` (or a separate file you load for this step):

```bash
cd "C:\Personal Projects\portfolio-career"
```

2. Run migrations and seed:

```bash
npm run db:deploy
npm run db:seed
```

This creates all tables and the admin user using `ADMIN_*` values from `.env`. Update those before seeding if you want custom login credentials.

---

### Step 4 — Generate an auth secret

Auth.js requires a random `AUTH_SECRET`.

**macOS / Linux / Git Bash:**

```bash
openssl rand -base64 32
```

**Windows PowerShell:**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Save the output — you will paste it into Vercel in the next step.

---

### Step 5 — Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project**.
3. Import your GitHub repository (`portfolio-career`).
4. Framework should auto-detect as **Next.js**.

Build settings (defaults are fine):

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Install command | `npm install` |
| Output | Next.js default |

Your `vercel.json` already matches these settings.

---

### Step 6 — Add environment variables in Vercel

Before clicking **Deploy**, open **Environment Variables** and add:

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `DATABASE_URL` | Yes | Supabase transaction pooler URL |
| `DIRECT_URL` | Yes | Supabase session/direct URL |
| `AUTH_SECRET` | Yes | Output from Step 4 |
| `AUTH_URL` | Yes | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `AUTH_URL` |
| `ADMIN_EMAIL` | Seed only | Admin login email |
| `ADMIN_PASSWORD` | Seed only | Admin login password |
| `ADMIN_NAME` | Optional | Display name |
| `ADMIN_PORTFOLIO_SLUG` | Optional | Public slug, e.g. `admin` |

Apply to **Production** (and **Preview** if you want preview deploys to work with a DB).

Optional (see sections below):

- `R2_*` — Cloudflare R2 file storage
- `UPSTASH_*` — rate limiting
- `SENTRY_DSN` — error monitoring

---

### Step 7 — Deploy

1. Click **Deploy** in Vercel.
2. Wait for the build to finish (typically 1–3 minutes).
3. Open the deployment URL.

GitHub Actions also runs on every push to `master`:

- **CI** — lint, typecheck, unit tests, E2E
- **Deploy** — validates production build

Check the **Actions** tab on GitHub if a push fails.

---

### Step 8 — Verify the deployment

1. Open `https://your-app.vercel.app/login` and sign in with your admin credentials.
2. Confirm the dashboard loads at `/dashboard`.
3. Visit your public portfolio at `/portfolio/admin` (or your `ADMIN_PORTFOLIO_SLUG`).
4. Check SEO routes: `/robots.txt` and `/sitemap.xml`.

---

### Supabase (database reference)

Supabase includes automated daily backups on paid plans; free tier projects can use manual backups via the dashboard or `pg_dump`.

If you need to re-run migrations after schema changes:

```bash
npm run db:deploy
```

---

### Railway (PostgreSQL, alternative)

1. Create a PostgreSQL service on Railway.
2. Copy `DATABASE_URL` and set as `DIRECT_URL` as well (or use pooled + direct URLs per Prisma docs).
3. Add variables to Vercel and follow Steps 3–8 above.

---

### Cloudflare R2 (files)

1. Create an R2 bucket.
2. Create an API token with read/write access.
3. Set `R2_*` env vars in Vercel.
4. Optionally set `R2_PUBLIC_URL` for public asset URLs.

Without R2, uploads fall back to local storage (not suitable for serverless production — configure R2 for Vercel).

---

### Staging

- Use Vercel preview deployments + a separate Supabase project (or Railway Postgres) for staging.
- Set preview env vars in Vercel for staging DB and R2 bucket.

## Security notes

- Passwords hashed with bcrypt (cost 12).
- JWT sessions via Auth.js (8-hour max age).
- Zod validation on all mutating API routes.
- RBAC: admin-only mutations in v1.
- File uploads: MIME whitelist + 10 MB max.
- Audit logging on CREATE/UPDATE/DELETE.
- Optional Upstash rate limiting on auth (set `UPSTASH_*` vars).
- Optional Sentry: set `SENTRY_DSN` (integrate `@sentry/nextjs` when ready).

## Backups

- **Supabase:** automated backups on Pro plan; export via dashboard or `pg_dump` on free tier.
- Railway: enable automated Postgres backups in the Railway dashboard.
- For VPS/self-hosted: schedule `pg_dump` daily and store off-site.

## Troubleshooting

### `/api/auth/error` — server configuration problem

Auth.js shows this when **`AUTH_SECRET` is missing** on Vercel.

1. Generate a secret (see Step 4 in Deployment).
2. Add `AUTH_SECRET`, `AUTH_URL`, and `NEXT_PUBLIC_APP_URL` in Vercel → **Settings → Environment Variables**.
3. Redeploy (uncheck build cache).

### Deploy build fails: `DATABASE_URL must be set`

The app can build without a database (lazy Prisma init), but you **must** set `DATABASE_URL` and `DIRECT_URL` in Vercel for the app to work at runtime. GitHub Actions deploy workflow includes a Postgres service automatically — Vercel does not.

1. Add `DATABASE_URL` and `DIRECT_URL` in Vercel → **Settings → Environment Variables**.
2. Redeploy.

### Login fails after deploy

1. Confirm you ran `npm run db:seed` against the **production** database (Step 3).
2. Check credentials match the `ADMIN_EMAIL` / `ADMIN_PASSWORD` used during seed.
3. Verify `AUTH_SECRET`, `AUTH_URL`, and `NEXT_PUBLIC_APP_URL` are set and `AUTH_URL` matches your Vercel domain (including `https://`).

### Auth redirect loops

`AUTH_URL` and `NEXT_PUBLIC_APP_URL` must exactly match your live URL, e.g. `https://portfolio-career.vercel.app`.

### Docker: `500 Internal Server Error` on `docker compose up`

Docker Desktop on Windows is not running correctly. Try:

1. Open **Docker Desktop** and wait until it says “Running”.
2. **Restart Docker Desktop** (Settings → Troubleshoot → Restart).
3. Update Docker Desktop to the latest version.

If it still fails, skip Docker and use **Option B** above (`npx prisma dev`).

### `npm run dev` — `Could not read package.json`

Run commands from the project folder, not `C:\Personal Projects`:

```bash
cd "C:\Personal Projects\portfolio-career"
npm run dev
```

## License

Private / personal use.
