/** All supported QR categories. */
export type QrType =
  | 'url'
  | 'wifi'
  | 'vcard'
  | 'social'
  | 'email'
  | 'message'
  | 'sepa'
  | 'event'
  | 'text'

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass'
export type SocialPlatform = 'linkedin' | 'github' | 'instagram' | 'x' | 'youtube' | 'tiktok'
export type MessageMode = 'whatsapp' | 'sms'

export interface UrlData { url: string }

export interface WifiData {
  ssid: string
  password: string
  encryption: WifiEncryption
  hidden: boolean
}

export interface VCardData {
  firstName: string
  lastName: string
  organization: string
  title: string
  phoneMobile: string
  phoneWork: string
  email: string
  website: string
  street: string
  zip: string
  city: string
  country: string
}

export interface SocialData { platform: SocialPlatform; handle: string }
export interface EmailData { to: string; subject: string; body: string }
export interface MessageData { mode: MessageMode; phone: string; message: string }

export interface SepaData {
  name: string
  iban: string
  bic: string
  /** Amount as text (comma or dot), empty = no amount */
  amount: string
  purpose: string
}

export interface EventData {
  title: string
  location: string
  /** Format of <input type="datetime-local">: YYYY-MM-DDTHH:mm */
  start: string
  end: string
  description: string
}

export interface TextData { text: string }

export interface QrFormState {
  url: UrlData
  wifi: WifiData
  vcard: VCardData
  social: SocialData
  email: EmailData
  message: MessageData
  sepa: SepaData
  event: EventData
  text: TextData
}

/** Errors per field name; empty = valid. */
export type FieldErrors = Record<string, string>

export interface BuildResult {
  /** Final QR content; empty if the input is invalid. */
  payload: string
  errors: FieldErrors
  valid: boolean
}

export type DotStyle = 'square' | 'rounded' | 'dots' | 'classy-rounded'
export type CornerStyle = 'square' | 'extra-rounded' | 'dot'
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H'

export interface QrStyleOptions {
  foreground: string
  background: string
  dotStyle: DotStyle
  cornerStyle: CornerStyle
  errorCorrection: ErrorCorrection
  /** Data URL of the uploaded logo, or null */
  logo: string | null
}

export const MAX_TEXT_LENGTH = 1000

export function createDefaultState(): QrFormState {
  return {
    url: { url: '' },
    wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
    vcard: {
      firstName: '', lastName: '', organization: '', title: '', phoneMobile: '', phoneWork: '',
      email: '', website: '', street: '', zip: '', city: '', country: '',
    },
    social: { platform: 'linkedin', handle: '' },
    email: { to: '', subject: '', body: '' },
    message: { mode: 'whatsapp', phone: '', message: '' },
    sepa: { name: '', iban: '', bic: '', amount: '', purpose: '' },
    event: { title: '', location: '', start: '', end: '', description: '' },
    text: { text: '' },
  }
}

export function createDefaultStyle(): QrStyleOptions {
  return {
    foreground: '#000000',
    background: '#ffffff',
    dotStyle: 'square',
    cornerStyle: 'square',
    errorCorrection: 'M',
    logo: null,
  }
}
