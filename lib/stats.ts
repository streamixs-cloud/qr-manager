export type DayCount = { date: string; count: number }

export type StatsSummary = {
  total: number
  avgPerDay: number
  maxPerDay: number
}

export type StatsResult = {
  data: DayCount[]
  summary: StatsSummary
}

export type DeviceBreakdown = {
  mobile: number
  desktop: number
}

export type ReferrerCount = {
  referrer: string
  count: number
}

export type DateRange = {
  fromDate: Date
  days: number
}

const VALID_PERIODS = [7, 30, 90] as const

// All date boundaries and chart labels use the Paris timezone.
const APP_TZ = 'Europe/Paris'

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Returns 'YYYY-MM-DD' for the given instant in the app timezone. */
function toAppDate(date: Date): string {
  return dateFmt.format(date)
}

/**
 * Returns the UTC Date representing midnight (start of day) in the app
 * timezone for the given 'YYYY-MM-DD' date string.
 * Paris is UTC+1 (CET) or UTC+2 (CEST), so midnight falls between
 * 21:00–23:00 UTC the previous calendar day. We scan that window.
 */
function appDateToUTCStart(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  for (let h = 21; h <= 24; h++) {
    const candidate = new Date(Date.UTC(y, m - 1, d - 1, h, 0, 0))
    if (toAppDate(candidate) === dateStr) return candidate
  }
  // Fallback (should never be reached for Europe/Paris)
  return new Date(Date.UTC(y, m - 1, d))
}

/**
 * Resolves a date range from query parameters.
 * Priority: `from`/`to` > `period` > default (30 days).
 */
export function resolveDateRange(params: {
  period?: string
  from?: string
  to?: string
}): DateRange {
  const { period, from, to } = params

  if (from) {
    const fromDate = new Date(from)
    const toDate = to ? new Date(to) : new Date()
    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      const msPerDay = 1000 * 60 * 60 * 24
      const days = Math.max(
        1,
        Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay) + 1
      )
      return { fromDate, days }
    }
  }

  const days =
    period && VALID_PERIODS.includes(Number(period) as (typeof VALID_PERIODS)[number])
      ? Number(period)
      : 30

  // Compute today's date string in the app timezone, then find its UTC start.
  const todayStr = toAppDate(new Date())
  const [y, m, d] = todayStr.split('-').map(Number)
  const fromDateStr = new Date(Date.UTC(y, m - 1, d - (days - 1))).toISOString().slice(0, 10)
  const fromDate = appDateToUTCStart(fromDateStr)
  return { fromDate, days }
}

/**
 * Builds a full time-series array (one entry per day) from raw scan events.
 * Events are bucketed by their date in the app timezone.
 */
export function buildDayChartData(
  events: { scanned_at: string }[],
  fromDate: Date,
  days: number
): DayCount[] {
  const counts: Record<string, number> = {}
  for (const event of events) {
    const date = toAppDate(new Date(event.scanned_at))
    counts[date] = (counts[date] ?? 0) + 1
  }

  // Generate the axis labels as consecutive app-timezone dates starting from fromDate.
  const fromDateStr = toAppDate(fromDate)
  const [y, m, d] = fromDateStr.split('-').map(Number)
  const result: DayCount[] = []
  for (let i = 0; i < days; i++) {
    const dateStr = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10)
    result.push({ date: dateStr, count: counts[dateStr] ?? 0 })
  }
  return result
}

/**
 * Classifies a user-agent string as mobile or desktop.
 */
function isMobile(userAgent: string | null): boolean {
  if (!userAgent) return false
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

/**
 * Returns mobile vs desktop scan counts for a set of events.
 */
export function buildDeviceBreakdown(
  events: { user_agent: string | null }[]
): DeviceBreakdown {
  let mobile = 0
  let desktop = 0
  for (const event of events) {
    if (isMobile(event.user_agent)) {
      mobile++
    } else {
      desktop++
    }
  }
  return { mobile, desktop }
}

/**
 * Extracts the hostname from a referrer URL, or returns "direct" for empty values.
 */
function normalizeReferrer(referer: string | null): string {
  if (!referer) return 'direct'
  try {
    return new URL(referer).hostname
  } catch {
    return referer
  }
}

/**
 * Returns the top N referrers (by scan count) for a set of events.
 */
export function buildTopReferrers(
  events: { referer: string | null }[],
  limit = 5
): ReferrerCount[] {
  const counts: Record<string, number> = {}
  for (const event of events) {
    const key = normalizeReferrer(event.referer)
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Computes summary metrics from a daily time-series.
 */
export function computeSummary(data: DayCount[]): StatsSummary {
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const avgPerDay = data.length > 0 ? Math.round((total / data.length) * 10) / 10 : 0
  const maxPerDay = data.reduce((max, d) => Math.max(max, d.count), 0)
  return { total, avgPerDay, maxPerDay }
}
