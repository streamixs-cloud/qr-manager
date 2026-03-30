'use client'
import { useActionState } from 'react'
import { login, register } from '@/app/actions/auth'
import { useState } from 'react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginState, loginAction, loginPending] = useActionState(login, {})
  const [registerState, registerAction, registerPending] = useActionState(register, {})

  const state = mode === 'login' ? loginState : registerState
  const action = mode === 'login' ? loginAction : registerAction
  const pending = mode === 'login' ? loginPending : registerPending

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
            {/* Tabs */}
            <div className="flex gap-1 mb-6 rounded-md bg-beige p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === 'login'
                    ? 'bg-green-forest text-white'
                    : 'text-text/60 hover:text-green-forest'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === 'register'
                    ? 'bg-green-forest text-white'
                    : 'text-text/60 hover:text-green-forest'
                }`}
              >
                Create account
              </button>
            </div>

            <form action={action} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-green-olive bg-white px-3 py-2 text-sm text-text placeholder-text/40 focus:border-green-forest focus:outline-none focus:ring-1 focus:ring-green-forest"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-md border border-green-olive bg-white px-3 py-2 text-sm text-text placeholder-text/40 focus:border-green-forest focus:outline-none focus:ring-1 focus:ring-green-forest"
                  placeholder={mode === 'login' ? '••••••••' : 'At least 8 characters'}
                />
              </div>

              {state?.error && (
                <p className="text-sm text-orange-soft">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md bg-green-forest px-4 py-2 text-sm font-medium text-white hover:bg-green-olive transition-colors disabled:opacity-50"
              >
                {pending
                  ? mode === 'login' ? 'Signing in…' : 'Creating account…'
                  : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
