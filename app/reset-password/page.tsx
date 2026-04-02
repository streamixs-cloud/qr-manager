'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setPending(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json() as { message?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (!token) {
    return <p className="text-sm text-orange-soft">Invalid reset link. Please request a new one.</p>
  }

  if (success) {
    return <p className="text-sm text-green-forest">Password updated! Redirecting to sign in…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-md border border-green-olive bg-white px-3 py-2 text-sm text-text placeholder-text/40 focus:border-green-forest focus:outline-none focus:ring-1 focus:ring-green-forest"
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-text mb-1">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-md border border-green-olive bg-white px-3 py-2 text-sm text-text placeholder-text/40 focus:border-green-forest focus:outline-none focus:ring-1 focus:ring-green-forest"
          placeholder="Repeat password"
        />
      </div>
      {error && <p className="text-sm text-orange-soft">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-green-forest px-4 py-2 text-sm font-medium text-white hover:bg-green-olive transition-colors disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-beige flex flex-col">
      <header className="bg-green-forest px-4 py-5">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-white font-serif">QR Manager</h1>
          <p className="mt-1 text-sm text-white/70">Create short links and get instant QR codes</p>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-green-olive bg-cream p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Set a new password</h2>
            <Suspense fallback={<p className="text-sm text-text/60">Loading…</p>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
