export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ScanChart } from '@/app/components/ScanChart'

type DayCount = { date: string; count: number }

export default async function StatsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .single()

  if (!link) notFound()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: events } = await supabase
    .from('scan_events')
    .select('scanned_at')
    .eq('link_id', id)
    .gte('scanned_at', thirtyDaysAgo.toISOString())

  const counts: Record<string, number> = {}
  for (const event of events ?? []) {
    const date = (event.scanned_at as string).slice(0, 10)
    counts[date] = (counts[date] ?? 0) + 1
  }

  const chartData: DayCount[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    chartData.push({ date: dateStr, count: counts[dateStr] ?? 0 })
  }

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
              Scans — last 30 days
            </h2>
            <ScanChart data={chartData} />
          </section>
        </div>
      </main>
    </div>
  )
}
