export default function Loading() {
  return (
    <div className="min-h-screen bg-beige">
      <header className="bg-green-forest px-4 py-5">
        <div className="mx-auto max-w-3xl">
          <div className="h-4 w-12 rounded bg-white/20" />
          <div className="mt-2 h-7 w-48 rounded bg-white/20" />
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-lg border border-green-olive bg-cream p-6 text-center">
            <div className="mx-auto h-4 w-24 rounded bg-green-forest/10" />
            <div className="mx-auto mt-2 h-12 w-20 rounded bg-green-forest/10" />
          </section>

          <section className="rounded-lg border border-green-olive bg-cream p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-6 w-40 rounded bg-green-forest/10" />
              <div className="flex gap-2">
                <div className="h-8 w-16 rounded bg-green-forest/10" />
                <div className="h-8 w-20 rounded bg-green-forest/10" />
                <div className="h-8 w-20 rounded bg-green-forest/10" />
                <div className="h-8 w-24 rounded bg-green-forest/10" />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto h-3 w-20 rounded bg-green-forest/10" />
                  <div className="mx-auto mt-2 h-8 w-12 rounded bg-green-forest/10" />
                </div>
              ))}
            </div>
            <div className="h-56 rounded-md bg-beige animate-pulse" />
          </section>
        </div>
      </main>
    </div>
  )
}
