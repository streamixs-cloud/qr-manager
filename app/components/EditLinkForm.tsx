'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  linkId: string
  currentDestination: string
  currentLabel: string | null
}

export function EditLinkForm({ linkId, currentDestination, currentLabel }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [destination, setDestination] = useState(currentDestination)
  const [label, setLabel] = useState(currentLabel ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function handleCancel() {
    setDestination(currentDestination)
    setLabel(currentLabel ?? '')
    setError(null)
    setIsEditing(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedDestination = destination.trim()
    try {
      new URL(trimmedDestination)
    } catch {
      setError('Please enter a valid URL including https://')
      return
    }

    setPending(true)
    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trimmedDestination,
          label: label.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? `Error ${res.status}`)
        return
      }

      setIsEditing(false)
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setPending(false)
    }
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded-lg border border-green-olive px-3 py-1.5 text-xs font-medium text-green-forest hover:bg-green-forest hover:text-white transition-colors"
      >
        Edit
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-2 border-t border-green-olive/30 pt-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-green-forest font-serif">
          Destination URL <span className="text-orange-soft">*</span>
        </label>
        <input
          type="url"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
          className="rounded-lg border border-green-olive bg-white px-3 py-1.5 text-sm text-text focus:border-green-forest focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-green-forest font-serif">Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Optional label"
          className="rounded-lg border border-green-olive bg-white px-3 py-1.5 text-sm text-text placeholder:text-text/40 focus:border-green-forest focus:outline-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-orange-soft">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-green-forest px-3 py-1.5 text-xs font-medium text-white hover:bg-green-olive disabled:opacity-50 transition-colors"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={pending}
          className="rounded-lg border border-green-olive px-3 py-1.5 text-xs font-medium text-green-forest hover:bg-green-forest hover:text-white disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
