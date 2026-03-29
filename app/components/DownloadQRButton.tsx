'use client'

type Props = {
  dataUrl: string
  slug: string
}

export function DownloadQRButton({ dataUrl, slug }: Props) {
  function handleDownload() {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-${slug}.png`
    a.click()
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
    >
      Download
    </button>
  )
}
