/**
 * Purge scan_events older than SCAN_EVENTS_RETENTION_MONTHS (default: 12).
 *
 * Run manually:   npx tsx scripts/purge-scan-events.ts
 * Schedule via cron, Vercel Cron Jobs, or a pg_cron entry.
 *
 * Required env vars (same as the app):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   (or a service-role key for admin scripts)
 *
 * Optional:
 *   SCAN_EVENTS_RETENTION_MONTHS   number of months to retain (default: 12)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const retentionMonths = Number(process.env.SCAN_EVENTS_RETENTION_MONTHS ?? 12)

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key env var')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log(`Purging scan_events older than ${retentionMonths} month(s)…`)

  const { data, error } = await supabase.rpc('purge_old_scan_events', {
    retention_months: retentionMonths,
  })

  if (error) {
    console.error('Purge failed:', error.message)
    process.exit(1)
  }

  console.log(`Done. Deleted ${data} row(s).`)
}

main()
