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
              {mode === 'register' && (
                <div>
                  <label htmlFor="invite_code" className="block text-sm font-medium text-text mb-1">
                    Invite code
                  </label>
                  <input
                    id="invite_code"
                    name="invite_code"
                    type="text"
                    autoComplete="off"
                    className="w-full rounded-md border border-green-olive bg-white px-3 py-2 text-sm text-text placeholder-text/40 focus:border-green-forest focus:outline-none focus:ring-1 focus:ring-green-forest"
                    placeholder="Enter your invite code"
                  />
                </div>
              )}

              {state?.error && (
                <div role="alert" className="flex items-start gap-2 rounded-md border border-orange-soft/30 bg-orange-soft/10 px-3 py-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-soft" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-orange-soft">{state.error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-green-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-olive disabled:opacity-50"
              >
                {pending && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
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
