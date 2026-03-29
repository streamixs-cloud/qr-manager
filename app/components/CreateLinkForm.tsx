'use client'

import { useActionState } from 'react'
import { createLink, type ActionState } from '../actions'

const initialState: ActionState = {}

export function CreateLinkForm() {
  const [state, formAction, pending] = useActionState(createLink, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="destination" className="text-sm font-medium text-zinc-700">
          Destination URL <span className="text-red-500">*</span>
        </label>
        <input
          id="destination"
          name="destination"
          type="url"
          required
          placeholder="https://example.com/very-long-url"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="label" className="text-sm font-medium text-zinc-700">
            Label
          </label>
          <input
            id="label"
            name="label"
            type="text"
            placeholder="My link"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="slug" className="text-sm font-medium text-zinc-700">
            Slug <span className="text-zinc-400 font-normal">(auto if empty)</span>
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="my-link"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-600 focus:outline-none"
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-600">
          Link created!
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Creating…' : 'Create link'}
      </button>
    </form>
  )
}
