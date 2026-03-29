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

## Roadmap

See open tickets for Frontend and Backend work items.
