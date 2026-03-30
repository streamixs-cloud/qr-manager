'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { EditLinkForm } from './EditLinkForm'
import { DownloadQRButton } from './DownloadQRButton'
import { deleteLink } from '../actions'

type LinkWithQR = {
  id: string
  slug: string
  label: string | null
  destination: string
  scan_count: number
  created_at: string
  qrDataUrl: string
}

type SortOption = 'recent' | 'most_scanned'

export function LinksList({ links }: { links: LinkWithQR[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('recent')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = q
      ? links.filter(
          (link) =>
            link.slug.toLowerCase().includes(q) ||
            (link.label ?? '').toLowerCase().includes(q) ||
            link.destination.toLowerCase().includes(q)
        )
      : links

    if (sort === 'most_scanned') {
      result = [...result].sort((a, b) => b.scan_count - a.scan_count)
    }

    return result
  }, [links, search, sort])

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="shrink-0 text-lg font-semibold text-green-forest font-serif">
          {links.length === 0 ? 'No links yet' : `Links (${links.length})`}
        </h2>

        {links.length > 0 && (
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by slug, label or URL…"
              className="flex-1 rounded-lg border border-green-olive bg-white px-3 py-1.5 text-sm text-text placeholder:text-text/40 focus:border-green-forest focus:outline-none"
            />
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setSort('recent')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  sort === 'recent'
                    ? 'bg-green-forest text-white'
                    : 'border border-green-olive text-green-forest hover:bg-green-olive/10'
                }`}
              >
                Recent
              </button>
              <button
                type="button"
                onClick={() => setSort('most_scanned')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  sort === 'most_scanned'
                    ? 'bg-green-forest text-white'
                    : 'border border-green-olive text-green-forest hover:bg-green-olive/10'
                }`}
              >
                Most scanned
              </button>
            </div>
          </div>
        )}
      </div>

      {links.length === 0 ? (
        <p className="text-sm text-text/60">Create your first link above to get started.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text/60">No links match your search.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((link) => {
            const deleteLinkById = deleteLink.bind(null, link.id)
            return (
              <li
                key={link.id}
                className="flex items-start gap-4 rounded-lg border border-green-olive bg-cream p-4 hover:border-green-forest transition-colors"
              >
                <div className="shrink-0">
                  <div className="rounded border border-green-olive bg-white p-1">
                    <img
                      src={link.qrDataUrl}
                      alt={`QR code for /${link.slug}`}
                      width={80}
                      height={80}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-green-forest text-sm">/{link.slug}</span>
                    {link.label && (
                      <span className="rounded-full bg-green-olive/15 px-2 py-0.5 text-xs text-green-forest">
                        {link.label}
                      </span>
                    )}
                  </div>
                  <a
                    href={link.destination}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm text-text/60 hover:text-green-forest transition-colors"
                  >
                    {link.destination}
                  </a>
                  <p className="text-xs text-text/50">
                    {link.scan_count} scan{link.scan_count !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <EditLinkForm
                      linkId={link.id}
                      currentDestination={link.destination}
                      currentLabel={link.label}
                    />
                    <Link
                      href={`/links/${link.id}/stats`}
                      className="inline-flex items-center gap-1.5 rounded-md [border-width:1.5px] border-green-forest bg-green-forest px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <rect x="0" y="6" width="3" height="6" rx="0.5" fill="currentColor" />
                        <rect x="4.5" y="3" width="3" height="9" rx="0.5" fill="currentColor" />
                        <rect x="9" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
                      </svg>
                      Stats
                    </Link>
                    <DownloadQRButton dataUrl={link.qrDataUrl} slug={link.slug} />
                    <form action={deleteLinkById}>
                      <button
                        type="submit"
                        className="rounded-md [border-width:1.5px] border-orange-soft bg-transparent px-4 py-1.5 text-xs font-medium text-orange-soft hover:bg-orange-soft hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
