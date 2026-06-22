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

Default admin credentials (from `.env`):

- Email: `zafaroful98@gmail.com`
- Password: `Zarul@Iwan1998`
- Portfolio slug: `admin`

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

### Vercel (app)

1. Connect the GitHub repo to Vercel.
2. Set environment variables from `.env.example`.
3. Build command: `npm run build` (runs `prisma generate` via `postinstall`).
4. Run `npm run db:deploy` against production DB before first deploy (or use Railway migration step).

### Supabase (database)

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Project Settings → Database → Connect**, copy:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL` (add `?pgbouncer=true`)
   - **Session pooler** or **Direct connection** (port `5432`) → `DIRECT_URL`
3. Add both variables to Vercel (or your host) alongside the other env vars from `.env.example`.
4. Before the first deploy, run migrations against Supabase:

```bash
npm run db:deploy
npm run db:seed
```

Supabase includes automated daily backups on paid plans; free tier projects can use manual backups via the dashboard or `pg_dump`.

### Railway (PostgreSQL, alternative)

1. Create a PostgreSQL service on Railway.
2. Copy `DATABASE_URL` and set as `DIRECT_URL` as well (or use pooled URL + direct URL per Prisma docs).
3. Add variables to Vercel.

### Cloudflare R2 (files)

1. Create an R2 bucket.
2. Create API token with read/write access.
3. Set `R2_*` env vars in Vercel.
4. Optionally set `R2_PUBLIC_URL` for public asset URLs.

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
