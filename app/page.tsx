export const dynamic = 'force-dynamic'

import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import { CreateLinkForm } from './components/CreateLinkForm'
import { EditLinkForm } from './components/EditLinkForm'
import { DownloadQRButton } from './components/DownloadQRButton'
import Link from 'next/link'
import { deleteLink } from './actions'
import { logout } from './actions/auth'
import { verifySession } from '@/lib/dal'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function Home() {
  const { userId } = await verifySession()
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const linksWithQR = await Promise.all(
    (links ?? []).map(async (link) => {
      const svgString = await QRCode.toString(`${SITE_URL}/r/${link.slug}`, {
        type: 'svg',
        margin: 1,
      })
      const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`
      return { ...link, qrDataUrl }
    })
  )

  return (
    <div className="min-h-screen bg-beige">
      {/* Header */}
      <header className="bg-green-forest px-4 py-5">
        <div className="mx-auto max-w-3xl flex items-start">
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">QR Manager</h1>
            <p className="mt-1 text-sm text-white/70">
              Create short links and get instant QR codes
            </p>
          </div>
          <form action={logout} className="ml-auto">
            <button type="submit" className="text-sm text-white/70 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
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
        </div>
      </main>
    </div>
  )
}
