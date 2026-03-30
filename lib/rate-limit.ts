/**
 * In-memory rate limiter for login attempts.
 *
 * Suitable for single-process / development deployments. For multi-instance
 * production deployments, replace the store with Redis or a Supabase counter.
 */

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MINUTES ?? 15) * 60 * 1000
const MAX_ATTEMPTS = Number(process.env.RATE_LIMIT_MAX_ATTEMPTS ?? 5)

type Entry = { count: number; windowStart: number }

const store = new Map<string, Entry>()

// Periodically purge expired entries to prevent unbounded memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now - entry.windowStart > WINDOW_MS) {
        store.delete(key)
      }
    }
  }, WINDOW_MS)
}

export function checkRateLimit(key: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now })
    return { limited: false, retryAfterSeconds: 0 }
  }

  entry.count += 1

  if (entry.count > MAX_ATTEMPTS) {
    const retryAfterMs = WINDOW_MS - (now - entry.windowStart)
    return { limited: true, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) }
  }

  return { limited: false, retryAfterSeconds: 0 }
}

export function resetRateLimit(key: string): void {
  store.delete(key)
}
