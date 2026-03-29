export const dynamic = 'force-dynamic'

import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import { CreateLinkForm } from './components/CreateLinkForm'
import { EditLinkForm } from './components/EditLinkForm'
import { deleteLink } from './actions'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function Home() {
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false })

  const linksWithQR = await Promise.all(
    (links ?? []).map(async (link) => {
      const qrDataUrl = await QRCode.toDataURL(`${SITE_URL}/r/${link.slug}`, {
        width: 120,
        margin: 1,
      })
      return { ...link, qrDataUrl }
    })
  )

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">QR Manager</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Create short links and get instant QR codes
          </p>
        </div>

        {/* Create link */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">New link</h2>
          <CreateLinkForm />
        </section>

        {/* Links list */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            {linksWithQR.length === 0
              ? 'No links yet'
              : `Links (${linksWithQR.length})`}
          </h2>

          {linksWithQR.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Create your first link above to get started.
            </p>
          ) : (
            <ul className="space-y-3">
              {linksWithQR.map((link) => {
                const deleteLinkById = deleteLink.bind(null, link.id)
                return (
                  <li
                    key={link.id}
                    className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    {/* QR code */}
                    <img
                      src={link.qrDataUrl}
                      alt={`QR code for /${link.slug}`}
                      width={80}
                      height={80}
                      className="shrink-0 rounded border border-zinc-100"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-zinc-900 text-sm">
                          /{link.slug}
                        </span>
                        {link.label && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                            {link.label}
                          </span>
                        )}
                      </div>
                      <a
                        href={link.destination}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
                      >
                        {link.destination}
                      </a>
                      <p className="text-xs text-zinc-400">
                        {link.scan_count} scan{link.scan_count !== 1 ? 's' : ''}
                      </p>
                      <EditLinkForm
                        linkId={link.id}
                        currentDestination={link.destination}
                        currentLabel={link.label}
                      />
                    </div>

                    {/* Delete */}
                    <form action={deleteLinkById} className="shrink-0">
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
