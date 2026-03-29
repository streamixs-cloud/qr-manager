'use client'

import { useActionState } from 'react'
import { createLink, type ActionState } from '../actions'

const initialState: ActionState = {}

export function CreateLinkForm() {
  const [state, formAction, pending] = useActionState(createLink, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="destination" className="text-sm font-medium text-green-forest font-serif">
          Destination URL <span className="text-orange-soft">*</span>
        </label>
        <input
          id="destination"
          name="destination"
          type="url"
          required
          placeholder="https://example.com/very-long-url"
          className="rounded-lg border border-green-olive bg-white px-3 py-2 text-sm text-text placeholder:text-text/40 focus:border-green-forest focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="label" className="text-sm font-medium text-green-forest font-serif">
            Label
          </label>
          <input
            id="label"
            name="label"
            type="text"
            placeholder="My link"
            className="rounded-lg border border-green-olive bg-white px-3 py-2 text-sm text-text placeholder:text-text/40 focus:border-green-forest focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="slug" className="text-sm font-medium text-green-forest font-serif">
            Slug <span className="text-text/50 font-normal">(auto if empty)</span>
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="my-link"
            className="rounded-lg border border-green-olive bg-white px-3 py-2 text-sm text-text placeholder:text-text/40 focus:border-green-forest focus:outline-none"
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-orange-soft">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-olive">
          Link created!
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-green-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-green-olive disabled:opacity-50 transition-colors"
      >
        {pending ? 'Creating…' : 'Create link'}
      </button>
    </form>
  )
}
