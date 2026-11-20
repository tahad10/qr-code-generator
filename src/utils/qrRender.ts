import QRCodeStyling, { type Options } from 'qr-code-styling'
import type { QrStyleOptions } from '../types/qr'

/** Builds the `qr-code-styling` options from payload and style. */
export function buildQrOptions(
  payload: string,
  style: QrStyleOptions,
  size: number,
  type: 'canvas' | 'svg' = 'svg',
): Options {
  return {
    width: size,
    height: size,
    type,
    data: payload,
    margin: Math.round(size * 0.03),
    qrOptions: { errorCorrectionLevel: style.errorCorrection },
    backgroundOptions: { color: style.background },
    dotsOptions: { color: style.foreground, type: style.dotStyle },
    cornersSquareOptions: { color: style.foreground, type: style.cornerStyle },
    cornersDotOptions: {
      color: style.foreground,
      type: style.cornerStyle === 'extra-rounded' ? 'dot' : style.cornerStyle,
    },
    image: style.logo ?? undefined,
    imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: 0.3, hideBackgroundDots: true },
  }
}

/** Renders the QR code at the requested size/format as a Blob (entirely local). */
export async function renderQrBlob(
  payload: string,
  style: QrStyleOptions,
  size: number,
  format: 'png' | 'svg',
): Promise<Blob> {
  const qr = new QRCodeStyling(buildQrOptions(payload, style, size, format === 'png' ? 'canvas' : 'svg'))
  const raw = await qr.getRawData(format)
  if (!raw) throw new Error('QR code could not be generated.')
  return raw as Blob
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export { QRCodeStyling }
