import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { supabase } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/mailer'

const TOKEN_EXPIRY_HOURS = 1

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email } = body as { email?: string }
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .single()

  // Always return 200 to avoid leaking whether the email is registered.
  if (!user) {
    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  }

  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('password_resets')
    .insert({ user_id: user.id, token, expires_at: expiresAt })

  if (error) {
    return NextResponse.json({ error: 'Failed to create reset token. Please try again.' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const resetUrl = `${siteUrl}/reset-password?token=${token}`
  await sendPasswordResetEmail(normalizedEmail, resetUrl)

  return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' })
}
