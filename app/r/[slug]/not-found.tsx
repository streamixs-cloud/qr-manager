import Link from 'next/link'

export default function NotFound() {
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
          <div className="rounded-lg border border-green-olive bg-cream p-8 text-center">
            <p className="text-5xl font-bold text-green-forest/20 font-serif mb-4">404</p>
            <h2 className="text-xl font-semibold text-green-forest mb-2">Link not found</h2>
            <p className="text-sm text-text/60 mb-6">
              This link has expired, been deleted, or never existed.
            </p>
            <Link
              href="/"
              className="inline-block rounded-md bg-green-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-green-olive transition-colors"
            >
              Create your own QR code
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
