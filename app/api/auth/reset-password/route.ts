import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { token, password } = body as { token?: string; password?: string }

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }
  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'password is required' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const { data: reset } = await supabase
    .from('password_resets')
    .select('id, user_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!reset) {
    return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
  }

  if (reset.used_at) {
    return NextResponse.json({ error: 'This reset link has already been used' }, { status: 400 })
  }

  if (new Date(reset.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('id', reset.user_id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 })
  }

  await supabase
    .from('password_resets')
    .update({ used_at: new Date().toISOString() })
    .eq('id', reset.id)

  return NextResponse.json({ message: 'Password updated successfully.' })
}
