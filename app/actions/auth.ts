'use server'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { createSession, deleteSession } from '@/lib/session'

export type AuthState = {
  error?: string
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
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

  await createSession(user.id)
  redirect('/')
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
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
