export const dynamic = 'force-dynamic'

import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import { CreateLinkForm } from './components/CreateLinkForm'
import { EditLinkForm } from './components/EditLinkForm'
import { DownloadQRButton } from './components/DownloadQRButton'
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
    <div className="min-h-screen bg-beige">
      {/* Header */}
      <header className="bg-green-forest px-4 py-5">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-white font-serif">QR Manager</h1>
          <p className="mt-1 text-sm text-white/70">
            Create short links and get instant QR codes
          </p>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Create link */}
          <section className="rounded-lg border border-green-olive bg-cream p-6">
            <h2 className="mb-4 text-lg font-semibold text-green-forest font-serif">New link</h2>
            <CreateLinkForm />
          </section>

          {/* Links list */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-green-forest font-serif">
              {linksWithQR.length === 0
                ? 'No links yet'
                : `Links (${linksWithQR.length})`}
            </h2>

            {linksWithQR.length === 0 ? (
              <p className="text-sm text-text/60">
                Create your first link above to get started.
              </p>
            ) : (
              <ul className="space-y-3">
                {linksWithQR.map((link) => {
                  const deleteLinkById = deleteLink.bind(null, link.id)
                  return (
                    <li
                      key={link.id}
                      className="flex items-start gap-4 rounded-lg border border-green-olive bg-cream p-4 hover:border-green-forest transition-colors"
                    >
                      {/* QR code */}
                      <div className="shrink-0 flex flex-col items-center gap-1.5">
                        <div className="rounded border border-green-olive bg-white p-1">
                          <img
                            src={link.qrDataUrl}
                            alt={`QR code for /${link.slug}`}
                            width={80}
                            height={80}
                          />
                        </div>
                        <DownloadQRButton dataUrl={link.qrDataUrl} slug={link.slug} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-green-forest text-sm">
                            /{link.slug}
                          </span>
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
                          className="rounded-lg border border-orange-soft px-3 py-1.5 text-xs font-medium text-orange-soft hover:bg-orange-soft hover:text-white transition-colors"
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
    </div>
  )
}
