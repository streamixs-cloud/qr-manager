# QR Manager

A QR code link manager built with Next.js 15, Tailwind CSS, and Supabase.

## Features

- Create short links with custom slugs
- Generate QR codes for any link
- Track scan counts via redirect endpoint
- Dashboard to manage all links

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **QR Generation**: `qrcode`
- **Slug IDs**: `nanoid`

## Project Structure

```
app/
  layout.tsx          # Root layout
  page.tsx            # Home / link dashboard
  r/[slug]/route.ts   # Redirect handler (GET /r/:slug)
lib/
  supabase.ts         # Supabase client + Link type
supabase/
  migrations/
    001_create_links.sql  # Database schema
```

## Database Schema

```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  destination TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  scan_count INTEGER DEFAULT 0
);
```

Run this migration in your Supabase project SQL editor.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the env example and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

3. Run the migration SQL in your Supabase project.

4. Start the dev server:

```bash
npm run dev
```

5. Test the redirect by inserting a row manually in Supabase:

```sql
INSERT INTO links (slug, destination, label)
VALUES ('test', 'https://example.com', 'Test link');
```

Then visit `http://localhost:3000/r/test` — you should be redirected to `https://example.com`.

## Redirect Route

`GET /r/[slug]`

- Looks up the slug in Supabase
- Increments `scan_count`
- Returns `302` redirect to `destination`
- Returns `404` JSON if slug not found

## Deployment

The app is deployed on **Vercel** with two environments backed by separate Supabase projects.

### Environments

| Environment | Branch    | Trigger                      | URL                                  |
|-------------|-----------|------------------------------|--------------------------------------|
| Production  | `main`    | Push to `main`               | `https://your-domain.com`            |
| Staging     | `staging` | Push to `staging` or any PR  | `https://your-app-git-staging.vercel.app` |

### CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main`/`staging` and on all PRs:

1. **Lint** — `npm run lint`
2. **Build** — `npm run build` (with `.next/cache` preserved between runs)

Vercel handles the actual deployment automatically via its GitHub integration:
- Merging to `main` triggers a **production** deployment.
- Pushing to `staging` or opening a PR triggers a **preview** deployment.

### Environment Variables

Each Vercel environment has its own set of variables. Set them in **Vercel → Project → Settings → Environment Variables**:

| Variable                    | Required | Description                              |
|-----------------------------|----------|------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`  | Yes      | Supabase project URL                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes  | Supabase anonymous API key               |
| `SESSION_SECRET`            | Yes      | JWT signing secret (min 32 chars) — generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL`      | Yes      | Canonical site URL for this environment  |

For local development, copy `.env.local.example` to `.env.local` and fill in your dev Supabase project credentials.

Also add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SESSION_SECRET`, and `NEXT_PUBLIC_SITE_URL` as **GitHub Actions secrets** (repository Settings → Secrets and variables → Actions) so the CI build step can complete successfully.

### Setup Steps

1. Import the repo into Vercel and connect the GitHub integration.
2. Create two Supabase projects: one for staging, one for production.
3. Run all migrations in `supabase/migrations/` against each Supabase project.
4. Set environment variables for each Vercel environment (Production / Preview).
5. Add the same variables as GitHub Actions secrets for CI builds.
6. Push to `staging` to validate the staging environment, then merge to `main` for production.

## scan_events Retention Policy

Detailed scan events are retained for **12 months** by default. Events older than the retention window are deleted by a purge script.

### How it works

- Migration `005_scan_events_retention.sql` creates a `purge_old_scan_events(retention_months integer)` SQL function.
- `scripts/purge-scan-events.ts` calls that function and can be executed on a schedule.

### Running the purge manually

```bash
npx tsx scripts/purge-scan-events.ts
```

Requires the same Supabase env vars as the app. For production, prefer a service-role key:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SCAN_EVENTS_RETENTION_MONTHS=12   # optional, defaults to 12
```

### Scheduling

- **Vercel Cron Jobs**: add a cron route that calls the Supabase RPC directly.
- **GitHub Actions**: add a scheduled workflow that runs the script.
- **pg_cron** (Supabase extension): `SELECT cron.schedule('purge-scans', '0 3 * * *', $$SELECT purge_old_scan_events(12)$$);`

## Roadmap

See open tickets for Frontend and Backend work items.
