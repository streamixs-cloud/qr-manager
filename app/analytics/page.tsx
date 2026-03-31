export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ScanChart } from '@/app/components/ScanChart'
import { verifySession } from '@/lib/dal'
import { resolveDateRange, buildDayChartData, computeSummary } from '@/lib/stats'
import { logout } from '@/app/actions/auth'

const TOP_N = 5

export default async function AnalyticsPage() {
  const { userId } = await verifySession()

  const { data: links } = await supabase
    .from('links')
    .select('id, slug, label, scan_count')
    .eq('user_id', userId)
    .order('scan_count', { ascending: false })

  const allLinks = links ?? []
  const totalScans = allLinks.reduce((sum, l) => sum + (l.scan_count ?? 0), 0)
  const topLinks = allLinks.slice(0, TOP_N)

  const { fromDate, days } = resolveDateRange({})

  let chartData: { date: string; count: number }[] = []
  if (allLinks.length > 0) {
    const linkIds = allLinks.map((l) => l.id)
    const { data: events } = await supabase
      .from('scan_events')
      .select('scanned_at')
      .in('link_id', linkIds)
      .gte('scanned_at', fromDate.toISOString())
    chartData = buildDayChartData(events ?? [], fromDate, days)
  } else {
    chartData = buildDayChartData([], fromDate, days)
  }

  const summary = computeSummary(chartData)

  return (
    <div className="min-h-screen bg-beige">
      <header className="bg-green-forest px-4 py-5">
        <div className="mx-auto max-w-3xl flex items-start">
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">QR Manager</h1>
            <p className="mt-1 text-sm text-white/70">Analytics overview</p>
          </div>
          <nav className="ml-auto flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Links
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Total scans */}
          <section className="rounded-lg border border-green-olive bg-cream p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif">
              Total scans — all links
            </p>
            <p className="mt-1 text-5xl font-bold text-green-forest font-serif">
              {totalScans}
            </p>
          </section>

          {/* 30-day chart */}
          <section className="rounded-lg border border-green-olive bg-cream p-6">
            <h2 className="mb-4 text-lg font-semibold text-green-forest font-serif">
              Scans — last {days} days (all links)
            </h2>
            <div className="mb-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif">
                  Period total
                </p>
                <p className="mt-1 text-2xl font-bold text-green-forest font-serif">
                  {summary.total}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif">
                  Avg / day
                </p>
                <p className="mt-1 text-2xl font-bold text-green-forest font-serif">
                  {summary.avgPerDay}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif">
                  Peak day
                </p>
                <p className="mt-1 text-2xl font-bold text-green-forest font-serif">
                  {summary.maxPerDay}
                </p>
              </div>
            </div>
            <ScanChart data={chartData} />
          </section>

          {/* Top N links */}
          <section className="rounded-lg border border-green-olive bg-cream p-6">
            <h2 className="mb-4 text-lg font-semibold text-green-forest font-serif">
              Top {TOP_N} links by scans
            </h2>
            {topLinks.length === 0 ? (
              <p className="text-sm text-green-forest/60">No links yet.</p>
            ) : (
              <ol className="space-y-2">
                {topLinks.map((link, i) => (
                  <li
                    key={link.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-5 text-right font-mono text-green-forest/40">
                      {i + 1}.
                    </span>
                    <Link
                      href={`/links/${link.id}/stats`}
                      className="flex-1 truncate text-green-forest hover:underline"
                    >
                      {link.label || `/${link.slug}`}
                    </Link>
                    <span className="font-semibold tabular-nums text-green-forest font-serif">
                      {link.scan_count ?? 0}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
