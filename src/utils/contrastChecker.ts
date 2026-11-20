export type ContrastLevel = 'ok' | 'low' | 'inverted' | 'invalid'

export interface ContrastResult {
  ratio: number
  level: ContrastLevel
  message: string | null
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/** Normalizes #abc / abc / #aabbcc to "#aabbcc"; null if invalid. */
export function normalizeHex(input: string): string | null {
  const m = HEX.exec(input.trim())
  if (!m) return null
  let h = m[1].toLowerCase()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return `#${h}`
}

/** Relative luminance according to WCAG 2.x. */
export function relativeLuminance(hex: string): number {
  const n = normalizeHex(hex)
  if (!n) return 0
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio (1 … 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Minimum contrast at which QR codes usually scan reliably. */
export const MIN_SCAN_CONTRAST = 3

export function checkContrast(foreground: string, background: string): ContrastResult {
  if (!normalizeHex(foreground) || !normalizeHex(background)) {
    return { ratio: 0, level: 'invalid', message: 'Invalid hex color value.' }
  }
  const ratio = contrastRatio(foreground, background)
  if (ratio < MIN_SCAN_CONTRAST) {
    return {
      ratio,
      level: 'low',
      message: `Contrast too low (${ratio.toFixed(1)}:1). The code may not be scannable – at least ${MIN_SCAN_CONTRAST}:1 is recommended.`,
    }
  }
  if (relativeLuminance(foreground) > relativeLuminance(background)) {
    return {
      ratio,
      level: 'inverted',
      message: 'Light code on a dark background (inverted): some scanner apps cannot read it.',
    }
  }
  return { ratio, level: 'ok', message: null }
}
