'use server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { createSession, deleteSession } from '@/lib/session'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

export type AuthState = {
  error?: string
}

async function getClientKey(prefix: string, email: string): Promise<string> {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'
  return `${prefix}:${ip}:${email}`
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const rateLimitKey = await getClientKey('login', email)
  const { limited, retryAfterSeconds } = checkRateLimit(rateLimitKey)
  if (limited) {
    const minutes = Math.ceil(retryAfterSeconds / 60)
    return { error: `Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` }
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, password_hash')
    .eq('email', email)
    .single()

  if (!user) {
    return { error: 'Invalid email or password' }
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return { error: 'Invalid email or password' }
  }

  resetRateLimit(rateLimitKey)
  await createSession(user.id)
  redirect('/')
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const inviteCode = (formData.get('invite_code') as string)?.trim()

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const rateLimitKey = await getClientKey('register', email)
  const { limited, retryAfterSeconds } = checkRateLimit(rateLimitKey)
  if (limited) {
    const minutes = Math.ceil(retryAfterSeconds / 60)
    return { error: `Too many registration attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` }
  }
  const requiredCode = process.env.REGISTRATION_INVITE_CODE
  if (requiredCode) {
    if (!inviteCode || inviteCode !== requiredCode) {
      return { error: 'Invalid or missing invite code' }
    }
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return { error: 'An account with this email already exists' }
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data: user, error } = await supabase
    .from('users')
    .insert({ email, password_hash })
    .select('id')
    .single()

  if (error || !user) {
    return { error: 'Failed to create account. Please try again.' }
  }

  await createSession(user.id)
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
