import { describe, expect, it } from 'vitest'
import {
  buildEmail, buildEvent, buildMessage, buildPayload, buildSepa, buildSocial, buildText, buildUrl,
  buildVCard, buildWifi, escapeWifi, formatIban, isValidIban, normalizeAmount, normalizeUrl,
} from '../qrPayloadBuilder'
import { checkContrast, contrastRatio } from '../contrastChecker'
import { createDefaultState } from '../../types/qr'

describe('URL', () => {
  it('adds https:// when the protocol is missing', () => {
    expect(normalizeUrl('example.com/a')).toBe('https://example.com/a')
    expect(buildUrl({ url: ' example.com ' }).payload).toBe('https://example.com')
  })
  it('keeps existing protocols', () => {
    expect(buildUrl({ url: 'http://example.com' }).payload).toBe('http://example.com')
  })
  it('rejects empty and invalid input', () => {
    expect(buildUrl({ url: '' }).valid).toBe(false)
    expect(buildUrl({ url: 'not a url' }).errors.url).toBeDefined()
  })
})

describe('WLAN', () => {
  it('escapes \\ ; , : in SSID and password', () => {
    expect(escapeWifi('a\\b;c,d:e')).toBe('a\\\\b\\;c\\,d\\:e')
    const r = buildWifi({ ssid: 'My;Net:1', password: 'pa,ss\\word;1', encryption: 'WPA', hidden: false })
    expect(r.payload).toBe('WIFI:T:WPA;S:My\\;Net\\:1;P:pa\\,ss\\\\word\\;1;;')
  })
  it('adds H:true for hidden networks', () => {
    expect(buildWifi({ ssid: 'x', password: '12345678', encryption: 'WPA', hidden: true }).payload)
      .toBe('WIFI:T:WPA;S:x;P:12345678;H:true;;')
  })
  it('omits the password for open networks', () => {
    expect(buildWifi({ ssid: 'Cafe', password: 'ignored', encryption: 'nopass', hidden: false }).payload)
      .toBe('WIFI:T:nopass;S:Cafe;;')
  })
  it('validates required fields and WPA length', () => {
    expect(buildWifi({ ssid: '', password: '12345678', encryption: 'WPA', hidden: false }).errors.ssid).toBeDefined()
    expect(buildWifi({ ssid: 'a', password: 'short', encryption: 'WPA', hidden: false }).errors.password).toBeDefined()
    expect(buildWifi({ ssid: 'a', password: 'short', encryption: 'WEP', hidden: false }).valid).toBe(true)
  })
})

describe('vCard 3.0', () => {
  const base = createDefaultState().vcard
  it('formats a full card with CRLF line endings', () => {
    const r = buildVCard({
      ...base, firstName: 'Max', lastName: 'Mustermann', organization: 'ACME, Inc.', title: 'CTO',
      phoneMobile: '+49 170 1', phoneWork: '+49 711 2', email: 'max@acme.de', website: 'acme.de',
      street: 'Hauptstr. 1', zip: '70173', city: 'Stuttgart', country: 'Deutschland',
    })
    expect(r.valid).toBe(true)
    expect(r.payload.split('\r\n')).toEqual([
      'BEGIN:VCARD', 'VERSION:3.0', 'N:Mustermann;Max;;;', 'FN:Max Mustermann', 'ORG:ACME\\, Inc.', 'TITLE:CTO',
      'TEL;TYPE=CELL:+49 170 1', 'TEL;TYPE=WORK,VOICE:+49 711 2', 'EMAIL;TYPE=INTERNET:max@acme.de',
      'URL:https://acme.de', 'ADR;TYPE=WORK:;;Hauptstr. 1;Stuttgart;;70173;Deutschland', 'END:VCARD',
    ])
  })
  it('requires a name or organization and a valid e-mail', () => {
    expect(buildVCard(base).valid).toBe(false)
    expect(buildVCard({ ...base, firstName: 'A', email: 'nope' }).errors.email).toBeDefined()
  })
  it('omits empty optional fields', () => {
    expect(buildVCard({ ...base, firstName: 'A' }).payload).not.toContain('TEL')
  })
})

describe('Social', () => {
  it('builds profile links from @handles', () => {
    expect(buildSocial({ platform: 'github', handle: '@octocat' }).payload).toBe('https://github.com/octocat')
    expect(buildSocial({ platform: 'linkedin', handle: 'jane-doe' }).payload).toBe('https://www.linkedin.com/in/jane-doe')
    expect(buildSocial({ platform: 'tiktok', handle: '@a.b' }).payload).toBe('https://www.tiktok.com/@a.b')
    expect(buildSocial({ platform: 'x', handle: 'jack' }).payload).toBe('https://x.com/jack')
  })
  it('passes through URLs', () => {
    expect(buildSocial({ platform: 'youtube', handle: 'https://youtube.com/c/foo' }).payload).toBe('https://youtube.com/c/foo')
    expect(buildSocial({ platform: 'instagram', handle: 'instagram.com/foo' }).payload).toBe('https://instagram.com/foo')
  })
  it('rejects empty input', () => {
    expect(buildSocial({ platform: 'x', handle: ' @ ' }).valid).toBe(false)
  })
})

describe('E-Mail', () => {
  it('URL-encodes subject and body', () => {
    expect(buildEmail({ to: 'a@b.de', subject: 'Hallo Welt & Co', body: 'Zeile 1\nZeile 2' }).payload)
      .toBe('mailto:a@b.de?subject=Hallo%20Welt%20%26%20Co&body=Zeile%201%0AZeile%202')
  })
  it('works without params and validates the address', () => {
    expect(buildEmail({ to: 'a@b.de', subject: '', body: '' }).payload).toBe('mailto:a@b.de')
    expect(buildEmail({ to: 'a@', subject: '', body: '' }).valid).toBe(false)
  })
})

describe('WhatsApp / SMS', () => {
  it('builds wa.me links with digits only', () => {
    expect(buildMessage({ mode: 'whatsapp', phone: '+49 170 123-4567', message: 'Hi du!' }).payload)
      .toBe('https://wa.me/491701234567?text=Hi%20du!')
    expect(buildMessage({ mode: 'whatsapp', phone: '0049170123456', message: '' }).payload)
      .toBe('https://wa.me/49170123456')
  })
  it('builds SMSTO', () => {
    expect(buildMessage({ mode: 'sms', phone: '+49 170 1234567', message: 'Hallo' }).payload)
      .toBe('SMSTO:+491701234567:Hallo')
  })
  it('requires a country code', () => {
    expect(buildMessage({ mode: 'sms', phone: '0170 1234567', message: '' }).errors.phone).toBeDefined()
  })
})

describe('SEPA / EPC GiroCode', () => {
  const valid = { name: 'Max Mustermann', iban: 'de89 3704 0044 0532 0130 00', bic: 'COBADEFFXXX', amount: '12,5', purpose: 'Rechnung 42' }
  it('validates IBANs with checksum and country length', () => {
    expect(isValidIban('DE89 3704 0044 0532 0130 00')).toBe(true)
    expect(isValidIban('GB82WEST12345698765432')).toBe(true)
    expect(isValidIban('DE89370400440532013001')).toBe(false)
    expect(isValidIban('DE8937040044053201300')).toBe(false)
    expect(formatIban('DE89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00')
  })
  it('formats according to EPC069-12', () => {
    const r = buildSepa(valid)
    expect(r.valid).toBe(true)
    expect(r.payload).toBe(
      ['BCD', '002', '1', 'SCT', 'COBADEFFXXX', 'Max Mustermann', 'DE89370400440532013000', 'EUR12.50', '', '', 'Rechnung 42'].join('\n'),
    )
  })
  it('allows missing BIC and amount', () => {
    const r = buildSepa({ ...valid, bic: '', amount: '' })
    expect(r.valid).toBe(true)
    expect(r.payload.split('\n').slice(0, 8)).toEqual(['BCD', '002', '1', 'SCT', '', 'Max Mustermann', 'DE89370400440532013000', ''])
  })
  it('normalizes amounts', () => {
    expect(normalizeAmount('1')).toBe('1.00')
    expect(normalizeAmount('1.234,5')).toBeNull()
    expect(normalizeAmount('0')).toBeNull()
    expect(normalizeAmount('0,01')).toBe('0.01')
  })
  it('reports errors', () => {
    const r = buildSepa({ name: '', iban: 'DE00', bic: 'XX', amount: 'abc', purpose: 'x'.repeat(141) })
    expect(Object.keys(r.errors).sort()).toEqual(['amount', 'bic', 'iban', 'name', 'purpose'])
    expect(r.payload).toBe('')
  })
})

describe('iCalendar', () => {
  it('builds a VEVENT with escaped text', () => {
    const r = buildEvent({
      title: 'Treffen; wichtig', location: 'Berlin, Mitte', start: '2026-03-05T14:30', end: '2026-03-05T15:45',
      description: 'Zeile 1\nZeile 2',
    })
    expect(r.payload.split('\r\n')).toEqual([
      'BEGIN:VEVENT', 'SUMMARY:Treffen\\; wichtig', 'DTSTART:20260305T143000', 'DTEND:20260305T154500',
      'LOCATION:Berlin\\, Mitte', 'DESCRIPTION:Zeile 1\\nZeile 2', 'END:VEVENT',
    ])
  })
  it('validates required fields and order', () => {
    expect(buildEvent({ title: '', location: '', start: '', end: '', description: '' }).valid).toBe(false)
    expect(buildEvent({ title: 'x', location: '', start: '2026-03-05T14:30', end: '2026-03-05T13:00', description: '' }).errors.end).toBeDefined()
  })
})

describe('Text & dispatch', () => {
  it('returns text unchanged', () => {
    expect(buildText({ text: ' Hallo\nWelt ' }).payload).toBe(' Hallo\nWelt ')
    expect(buildText({ text: '  ' }).valid).toBe(false)
  })
  it('dispatches by type', () => {
    const s = createDefaultState()
    s.url.url = 'example.org'
    expect(buildPayload('url', s).payload).toBe('https://example.org')
    expect(buildPayload('text', s).valid).toBe(false)
  })
})

describe('contrast checker', () => {
  it('computes WCAG ratios', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 0)
    expect(contrastRatio('#fff', '#fff')).toBeCloseTo(1, 5)
  })
  it('warns for low contrast, inverted and invalid colors', () => {
    expect(checkContrast('#000000', '#ffffff').level).toBe('ok')
    expect(checkContrast('#777777', '#888888').level).toBe('low')
    expect(checkContrast('#ffffff', '#000000').level).toBe('inverted')
    expect(checkContrast('zzz', '#fff').level).toBe('invalid')
  })
})
