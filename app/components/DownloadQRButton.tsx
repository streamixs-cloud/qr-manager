'use client'

type Props = {
  dataUrl: string
  slug: string
}

export function DownloadQRButton({ dataUrl, slug }: Props) {
  function handleDownload() {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-${slug}.svg`
    a.click()
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-md [border-width:1.5px] border-green-forest bg-transparent px-4 py-1.5 text-xs font-medium text-green-forest hover:bg-green-forest hover:text-white transition-colors"
    >
      Download
    </button>
  )
}
