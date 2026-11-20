/**
 * Pure functions that build the QR contents (payloads) per category.
 * Each `build*` function validates its input and returns a `BuildResult`
 * (payload is empty while the input is invalid). No DOM or Vue dependencies.
 */
import type {
  BuildResult, EmailData, EventData, FieldErrors, MessageData, QrFormState, QrType,
  SepaData, SocialData, SocialPlatform, TextData, UrlData, VCardData, WifiData,
} from '../types/qr'
import { MAX_TEXT_LENGTH } from '../types/qr'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function result(payload: string, errors: FieldErrors): BuildResult {
  const valid = Object.keys(errors).length === 0
  return { payload: valid ? payload : '', errors, valid }
}

// ---------------------------------------------------------------- Escaping

/** Wi-Fi escaping: `\`, `;`, `,` and `:` are escaped with a backslash. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:])/g, '\\$1')
}

/** vCard/iCalendar text escaping (RFC 2426 / RFC 5545): `\`, `;`, `,` and line breaks. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

// -------------------------------------------------------------------- URL

/** Prepends `https://` if no scheme (`xyz://`) is present. */
export function normalizeUrl(input: string): string {
  const v = input.trim()
  if (!v) return ''
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`
}

function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    return u.hostname === 'localhost' || /^[^.]+\..+/.test(u.hostname)
  } catch {
    return false
  }
}

export function buildUrl(data: UrlData): BuildResult {
  const errors: FieldErrors = {}
  const url = normalizeUrl(data.url)
  if (!url) errors.url = 'Please enter a URL.'
  else if (!isValidHttpUrl(url)) errors.url = 'Invalid URL.'
  return result(url, errors)
}

// ------------------------------------------------------------------- WLAN

export function buildWifi(data: WifiData): BuildResult {
  const errors: FieldErrors = {}
  if (!data.ssid) errors.ssid = 'Network name (SSID) is missing.'
  if (data.encryption !== 'nopass') {
    if (!data.password) errors.password = 'Password is missing.'
    else if (data.encryption === 'WPA' && (data.password.length < 8 || data.password.length > 63)) {
      errors.password = 'WPA password must be 8–63 characters long.'
    }
  }
  let payload = `WIFI:T:${data.encryption};S:${escapeWifi(data.ssid)};`
  if (data.encryption !== 'nopass') payload += `P:${escapeWifi(data.password)};`
  if (data.hidden) payload += 'H:true;'
  payload += ';'
  return result(payload, errors)
}

// ------------------------------------------------------------------ vCard

export function buildVCard(data: VCardData): BuildResult {
  const errors: FieldErrors = {}
  const f = (v: string) => v.trim()
  if (!f(data.firstName) && !f(data.lastName) && !f(data.organization)) {
    errors.lastName = 'Enter a name or organization.'
  }
  if (f(data.email) && !EMAIL_RE.test(f(data.email))) errors.email = 'Invalid email address.'
  const website = f(data.website) ? normalizeUrl(data.website) : ''
  if (website && !isValidHttpUrl(website)) errors.website = 'Invalid URL.'

  const e = (v: string) => escapeIcsText(f(v))
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  lines.push(`N:${e(data.lastName)};${e(data.firstName)};;;`)
  const fn = [f(data.firstName), f(data.lastName)].filter(Boolean).join(' ') || f(data.organization)
  lines.push(`FN:${escapeIcsText(fn)}`)
  if (f(data.organization)) lines.push(`ORG:${e(data.organization)}`)
  if (f(data.title)) lines.push(`TITLE:${e(data.title)}`)
  if (f(data.phoneMobile)) lines.push(`TEL;TYPE=CELL:${e(data.phoneMobile)}`)
  if (f(data.phoneWork)) lines.push(`TEL;TYPE=WORK,VOICE:${e(data.phoneWork)}`)
  if (f(data.email)) lines.push(`EMAIL;TYPE=INTERNET:${e(data.email)}`)
  if (website) lines.push(`URL:${website}`)
  if (f(data.street) || f(data.zip) || f(data.city) || f(data.country)) {
    lines.push(`ADR;TYPE=WORK:;;${e(data.street)};${e(data.city)};;${e(data.zip)};${e(data.country)}`)
  }
  lines.push('END:VCARD')
  return result(lines.join('\r\n'), errors)
}

// ----------------------------------------------------------------- Social

export const SOCIAL_BASE: Record<SocialPlatform, { label: string; prefix: string }> = {
  linkedin: { label: 'LinkedIn', prefix: 'https://www.linkedin.com/in/' },
  github: { label: 'GitHub', prefix: 'https://github.com/' },
  instagram: { label: 'Instagram', prefix: 'https://www.instagram.com/' },
  x: { label: 'X / Twitter', prefix: 'https://x.com/' },
  youtube: { label: 'YouTube', prefix: 'https://www.youtube.com/@' },
  tiktok: { label: 'TikTok', prefix: 'https://www.tiktok.com/@' },
}

/** Turns `@name`, `name` or a profile URL into a profile link. */
export function buildSocialUrl(platform: SocialPlatform, handle: string): string {
  const v = handle.trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  if (v.includes('/')) return normalizeUrl(v)
  const name = v.replace(/^@+/, '')
  return name ? SOCIAL_BASE[platform].prefix + encodeURIComponent(name) : ''
}

export function buildSocial(data: SocialData): BuildResult {
  const errors: FieldErrors = {}
  const url = buildSocialUrl(data.platform, data.handle)
  if (!url) errors.handle = 'Please enter an @username or profile URL.'
  else if (!isValidHttpUrl(url)) errors.handle = 'Invalid username or link.'
  return result(url, errors)
}

// ----------------------------------------------------------------- E-Mail

export function buildEmail(data: EmailData): BuildResult {
  const errors: FieldErrors = {}
  const to = data.to.trim()
  if (!to) errors.to = 'Recipient is missing.'
  else if (!EMAIL_RE.test(to)) errors.to = 'Invalid email address.'
  const params: string[] = []
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`)
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`)
  const payload = `mailto:${to}${params.length ? '?' + params.join('&') : ''}`
  return result(payload, errors)
}

// ------------------------------------------------------- WhatsApp / SMS

export function buildMessage(data: MessageData): BuildResult {
  const errors: FieldErrors = {}
  const raw = data.phone.trim()
  let digits = raw.replace(/\D/g, '')
  if (raw.startsWith('00')) digits = digits.slice(2)
  const international = raw.startsWith('+') || raw.startsWith('00')
  if (!digits) errors.phone = 'Phone number is missing.'
  else if (!international) errors.phone = 'Please include the country code (e.g. +49 170 1234567).'
  else if (digits.length < 7 || digits.length > 15) errors.phone = 'Invalid phone number.'

  let payload: string
  if (data.mode === 'whatsapp') {
    payload = `https://wa.me/${digits}${data.message ? `?text=${encodeURIComponent(data.message)}` : ''}`
  } else {
    payload = `SMSTO:+${digits}:${data.message}`
  }
  return result(payload, errors)
}

// ------------------------------------------------------------------- SEPA

const IBAN_LENGTHS: Record<string, number> = {
  AT: 20, BE: 16, BG: 22, CH: 21, CY: 28, CZ: 24, DE: 22, DK: 18, EE: 20, ES: 24, FI: 18,
  FR: 27, GB: 22, GR: 27, HR: 21, HU: 28, IE: 22, IS: 26, IT: 27, LI: 21, LT: 20, LU: 20,
  LV: 21, MC: 27, MT: 31, NL: 18, NO: 15, PL: 28, PT: 25, RO: 24, SE: 24, SI: 19, SK: 24,
  SM: 27,
}

/** Removes whitespace and converts to uppercase. */
export function normalizeIban(iban: string): string {
  return iban.replace(/\s+/g, '').toUpperCase()
}

/** Groups an IBAN into blocks of four. */
export function formatIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})/g, '$1 ').trim()
}

/** Checks format, country-specific length and checksum (ISO 7064 mod 97-10). */
export function isValidIban(input: string): boolean {
  const iban = normalizeIban(input)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false
  const expected = IBAN_LENGTHS[iban.slice(0, 2)]
  if (expected && iban.length !== expected) return false
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let remainder = 0
  for (const ch of rearranged) {
    const v = ch >= 'A' ? String(ch.charCodeAt(0) - 55) : ch
    for (const d of v) remainder = (remainder * 10 + Number(d)) % 97
  }
  return remainder === 1
}

export function isValidBic(bic: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.replace(/\s+/g, '').toUpperCase())
}

/** Parses "12,5" / "12.50" to "12.50"; null if invalid or outside 0.01–999999999.99. */
export function normalizeAmount(input: string): string | null {
  const v = input.trim().replace(',', '.')
  const m = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(v)
  if (!m) return null
  const text = `${Number(m[1])}.${(m[2] ?? '').padEnd(2, '0')}`
  return Number(text) >= 0.01 ? text : null
}

/** EPC069-12 (GiroCode), Version 002, UTF-8, SEPA Credit Transfer. */
export function buildSepa(data: SepaData): BuildResult {
  const errors: FieldErrors = {}
  const name = data.name.trim()
  const bic = data.bic.replace(/\s+/g, '').toUpperCase()
  if (!name) errors.name = 'Recipient name is missing.'
  else if (name.length > 70) errors.name = 'Maximum 70 characters.'
  if (!data.iban.trim()) errors.iban = 'IBAN is missing.'
  else if (!isValidIban(data.iban)) errors.iban = 'Invalid IBAN (format, length or checksum).'
  if (bic && !isValidBic(bic)) errors.bic = 'Invalid BIC (8 or 11 characters).'
  let amount = ''
  if (data.amount.trim()) {
    const a = normalizeAmount(data.amount)
    if (!a) errors.amount = 'Amount must be between 0.01 and 999,999,999.99.'
    else amount = `EUR${a}`
  }
  const purpose = data.purpose.trim().replace(/\s*\r?\n\s*/g, ' ')
  if (purpose.length > 140) errors.purpose = 'Maximum 140 characters.'

  const payload = [
    'BCD', '002', '1', 'SCT', bic, name, normalizeIban(data.iban), amount, '', '', purpose,
  ].join('\n')
  return result(payload, errors)
}

// --------------------------------------------------------------- Kalender

/** "2026-03-05T14:30" -> "20260305T143000" (floating local time); null if invalid. */
export function toIcsDateTime(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(local)
  return m ? `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}${m[6] ?? '00'}` : null
}

export function buildEvent(data: EventData): BuildResult {
  const errors: FieldErrors = {}
  if (!data.title.trim()) errors.title = 'Title is missing.'
  const start = toIcsDateTime(data.start)
  const end = data.end ? toIcsDateTime(data.end) : null
  if (!start) errors.start = 'Start date and time are missing.'
  if (data.end && !end) errors.end = 'Invalid end date.'
  if (start && end && end < start) errors.end = 'End is before the start.'

  const lines = ['BEGIN:VEVENT', `SUMMARY:${escapeIcsText(data.title.trim())}`]
  if (start) lines.push(`DTSTART:${start}`)
  if (end) lines.push(`DTEND:${end}`)
  if (data.location.trim()) lines.push(`LOCATION:${escapeIcsText(data.location.trim())}`)
  if (data.description.trim()) lines.push(`DESCRIPTION:${escapeIcsText(data.description.trim())}`)
  lines.push('END:VEVENT')
  return result(lines.join('\r\n'), errors)
}

// --------------------------------------------------------------- Freitext

export function buildText(data: TextData): BuildResult {
  const errors: FieldErrors = {}
  if (!data.text.trim()) errors.text = 'Please enter some text.'
  else if (data.text.length > MAX_TEXT_LENGTH) errors.text = `Maximum ${MAX_TEXT_LENGTH} characters.`
  return result(data.text, errors)
}

// --------------------------------------------------------------- Dispatch

export function buildPayload(type: QrType, state: QrFormState): BuildResult {
  switch (type) {
    case 'url': return buildUrl(state.url)
    case 'wifi': return buildWifi(state.wifi)
    case 'vcard': return buildVCard(state.vcard)
    case 'social': return buildSocial(state.social)
    case 'email': return buildEmail(state.email)
    case 'message': return buildMessage(state.message)
    case 'sepa': return buildSepa(state.sepa)
    case 'event': return buildEvent(state.event)
    case 'text': return buildText(state.text)
  }
}
