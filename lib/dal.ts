import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession, refreshSession } from './session'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) {
    redirect('/login')
  }
  // Rotate the session on each authenticated request (best-effort; no-ops in
  // Server Components where cookies cannot be written).
  try {
    await refreshSession()
  } catch {
    // ignore — cookie writes are not always possible (e.g. during SSR)
  }
  return { userId: session.userId as string }
})

export const getSessionOptional = cache(async () => {
  const session = await getSession()
  if (!session?.userId) return null
  return { userId: session.userId as string }
})
