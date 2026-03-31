export const dynamic = 'force-dynamic'

import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { CreateLinkForm } from './components/CreateLinkForm'
import { LinksList } from './components/LinksList'
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
      const shortUrl = `${SITE_URL}/r/${link.slug}`
      const svgString = await QRCode.toString(shortUrl, {
        type: 'svg',
        margin: 1,
      })
      const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`
      return { ...link, qrDataUrl, shortUrl }
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
          <nav className="ml-auto flex items-center gap-4">
            <Link
              href="/analytics"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Analytics
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm text-white/70 hover:text-white transition-colors">
                Sign out
              </button>
            </form>
          </nav>
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
          <LinksList links={linksWithQR} />
        </div>
      </main>
    </div>
  )
}
