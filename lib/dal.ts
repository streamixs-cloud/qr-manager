import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from './session'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) {
    redirect('/login')
  }
  return { userId: session.userId as string }
})

export const getSessionOptional = cache(async () => {
  const session = await getSession()
  if (!session?.userId) return null
  return { userId: session.userId as string }
})
