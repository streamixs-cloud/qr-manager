'use client'

import QRCode from 'qrcode'
import { useRef, useEffect, useState, useCallback } from 'react'

type Props = {
  url: string
  slug: string
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  if (!rgb1 || !rgb2) return null
  const l1 = relativeLuminance(...rgb1)
  const l2 = relativeLuminance(...rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const SIZE_OPTIONS = [
  { label: 'Small (200 px)', value: 200 },
  { label: 'Medium (400 px)', value: 400 },
  { label: 'Large (600 px)', value: 600 },
]

export function QRCustomizerModal({ url, slug }: Props) {
  const [open, setOpen] = useState(false)
  const [darkColor, setDarkColor] = useState('#000000')
  const [lightColor, setLightColor] = useState('#ffffff')
  const [size, setSize] = useState(400)
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const contrast = contrastRatio(darkColor, lightColor)
  const contrastOk = contrast !== null && contrast >= 4.5

  const renderQR = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    await QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 1,
      errorCorrectionLevel: logoDataUrl ? 'H' : 'M',
      color: { dark: darkColor, light: lightColor },
    })

    if (logoDataUrl) {
      await new Promise<void>((resolve) => {
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(); return }
        const img = new Image()
        img.onload = () => {
          const logoSize = Math.round(size * 0.2)
          const x = Math.round((size - logoSize) / 2)
          const y = Math.round((size - logoSize) / 2)
          ctx.fillStyle = lightColor
          ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8)
          ctx.drawImage(img, x, y, logoSize, logoSize)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = logoDataUrl
      })
    }
  }, [url, size, darkColor, lightColor, logoDataUrl])

  useEffect(() => {
    if (open) renderQR()
  }, [open, renderQR])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) { setLogoDataUrl(null); return }
    const reader = new FileReader()
    reader.onload = (ev) => setLogoDataUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleDownload() {
    await renderQR()
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qr-${slug}.png`
    a.click()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md [border-width:1.5px] border-green-forest bg-transparent px-4 py-1.5 text-xs font-medium text-green-forest hover:bg-green-forest hover:text-white transition-colors"
      >
        Customize &amp; Download
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-cream rounded-lg border border-green-olive w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-forest font-serif">
                Customize QR Code
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-text/50 hover:text-text transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-5">
              <div className="rounded border border-green-olive p-2 bg-white inline-block">
                <canvas
                  ref={canvasRef}
                  style={{ display: 'block', width: 200, height: 200 }}
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Colours */}
              <div className="flex gap-4">
                <label className="flex-1">
                  <span className="block text-xs font-medium text-text mb-1">Dark colour</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-green-olive"
                    />
                    <span className="font-mono text-xs text-text/60">{darkColor}</span>
                  </div>
                </label>
                <label className="flex-1">
                  <span className="block text-xs font-medium text-text mb-1">Background colour</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-green-olive"
                    />
                    <span className="font-mono text-xs text-text/60">{lightColor}</span>
                  </div>
                </label>
              </div>

              {/* Contrast indicator */}
              <p className={`text-xs ${contrastOk ? 'text-green-forest' : 'text-orange-soft'}`}>
                {contrastOk ? '✓' : '⚠'} Contrast{' '}
                {contrast !== null ? contrast.toFixed(1) : '–'}:1
                {!contrastOk && ' — below 4.5:1 minimum, QR may be unreadable'}
              </p>

              {/* Size */}
              <label>
                <span className="block text-xs font-medium text-text mb-1">Size</span>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full rounded-lg border border-green-olive bg-white px-3 py-1.5 text-sm text-text focus:border-green-forest focus:outline-none"
                >
                  {SIZE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>

              {/* Logo */}
              <div>
                <span className="block text-xs font-medium text-text mb-1">Logo (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="text-xs text-text/60 file:mr-2 file:rounded-md file:border file:border-green-olive file:bg-transparent file:px-3 file:py-1 file:text-xs file:font-medium file:text-green-forest file:transition-colors hover:file:bg-green-forest hover:file:text-white"
                />
                {logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoDataUrl(null)}
                    className="mt-1 block text-xs text-orange-soft hover:underline"
                  >
                    Remove logo
                  </button>
                )}
                <p className="mt-1 text-xs text-text/50">
                  Logo is centred on the QR code. High error correction is applied automatically.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-2 text-sm text-text/60 hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!contrastOk}
                className="rounded-md bg-green-forest px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
