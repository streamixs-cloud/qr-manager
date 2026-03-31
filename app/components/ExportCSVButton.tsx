'use client'

import type { DayCount, StatsSummary } from '@/lib/stats'

function buildCSV(data: DayCount[], summary: StatsSummary): string {
  const lines: string[] = [
    'date,scans',
    ...data.map((d) => `${d.date},${d.count}`),
    '',
    'summary,value',
    `total,${summary.total}`,
    `avg_per_day,${summary.avgPerDay}`,
    `peak_day,${summary.maxPerDay}`,
  ]
  return lines.join('\n')
}

export function ExportCSVButton({
  data,
  summary,
  slug,
}: {
  data: DayCount[]
  summary: StatsSummary
  slug: string
}) {
  function handleExport() {
    const csv = buildCSV(data, summary)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stats-${slug}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-md px-3 py-1.5 text-sm font-medium border border-green-olive/40 bg-beige text-green-forest hover:bg-green-olive/10 transition-colors"
    >
      Export CSV
    </button>
  )
}
