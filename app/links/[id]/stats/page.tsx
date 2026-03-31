export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ScanChart } from '@/app/components/ScanChart'
import { resolveDateRange, buildDayChartData, computeSummary } from '@/lib/stats'

export default async function StatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}) {
  const { id } = await params
  const { period, from, to } = await searchParams

  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .single()

  if (!link) notFound()

  const { fromDate, days } = resolveDateRange({ period, from, to })

  const { data: events } = await supabase
    .from('scan_events')
    .select('scanned_at')
    .eq('link_id', id)
    .gte('scanned_at', fromDate.toISOString())

  const chartData = buildDayChartData(events ?? [], fromDate, days)
  const summary = computeSummary(chartData)

  return (
    <div className="min-h-screen bg-beige">
      <header className="bg-green-forest px-4 py-5">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-white font-serif">
            {link.label || `/${link.slug}`}
          </h1>
          {link.label && (
            <p className="mt-0.5 text-sm text-white/70">/{link.slug}</p>
          )}
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-lg border border-green-olive bg-cream p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif">
              Total scans
            </p>
            <p className="mt-1 text-5xl font-bold text-green-forest font-serif">
              {link.scan_count}
            </p>
          </section>

          <section className="rounded-lg border border-green-olive bg-cream p-6">
            <h2 className="mb-4 text-lg font-semibold text-green-forest font-serif">
              Scans — last {days} days
            </h2>
            <div className="mb-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif">Period total</p>
                <p className="mt-1 text-2xl font-bold text-green-forest font-serif">{summary.total}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif">Avg / day</p>
                <p className="mt-1 text-2xl font-bold text-green-forest font-serif">{summary.avgPerDay}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif">Peak day</p>
                <p className="mt-1 text-2xl font-bold text-green-forest font-serif">{summary.maxPerDay}</p>
              </div>
            </div>
            <ScanChart data={chartData} />
          </section>
        </div>
      </main>
    </div>
  )
}
