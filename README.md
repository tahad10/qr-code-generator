# QR Code Generator - TD

A modern, free QR code generator that runs **100% in your browser**. Nothing you type is ever sent to a server – no backend, no tracking, no cookies, no external fonts.

## How to use it

1. **Pick a type** at the top: URL, Wi-Fi, business card, social media, email, WhatsApp/SMS, SEPA payment, calendar event or plain text.
2. **Fill in the form.** The QR code on the right updates live while you type. Errors (e.g. an invalid IBAN) are shown next to the field.
3. **Customize the design** (optional) in *Customize design*: colors, dot and corner shapes, a logo in the center and the error-correction level. A warning appears if the contrast is too low to scan reliably.
4. **Download or copy** the result:
   - **PNG** in 512, 1024 or 2048 px, or **SVG** (scalable, ideal for print)
   - **Copy image to clipboard**
   - **Show raw payload** to see (and copy) the exact text stored in the code
5. Use **Reset form** to start over, and the sun/moon button to switch between dark and light mode.

### Tips

- Always **test-scan** the code with your phone before printing it.
- Keep a strong contrast: dark code on a light background scans best.
- When you add a logo, error correction is switched to **H (30%)** automatically so the code stays readable. Keep logos small and simple.
- Wi-Fi codes let guests join your network by scanning – the password is stored in the code, so only share it with people you trust.
- WhatsApp/SMS numbers need the country code, e.g. `+49 170 1234567`.

## Supported QR types

| Type | What the code does when scanned |
|---|---|
| URL | Opens a website (`https://` is added if missing) |
| Wi-Fi | Joins a network (WPA/WPA2, WEP or open, optionally hidden) |
| Business card | Adds a contact (vCard 3.0) |
| Social media | Opens a LinkedIn, GitHub, Instagram, X, YouTube or TikTok profile |
| Email | Opens a pre-filled email (`mailto:`) |
| WhatsApp / SMS | Opens a chat or text message with a pre-filled message |
| SEPA transfer | Pre-fills a bank transfer (EPC069-12 "GiroCode") in supported banking apps |
| Calendar event | Adds an event (iCalendar) |
| Text | Shows any text up to 1000 characters |

## Privacy

Everything – QR generation, export, clipboard access and logo handling – happens locally in your browser. No data is transmitted anywhere, and the app works offline once loaded.

## Tech stack

Vue 3 (`<script setup>`, Composition API) · TypeScript (strict) · Vite · Tailwind CSS · [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling) · [`lucide-vue-next`](https://lucide.dev) · Vitest

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev      # start the dev server
npm run test     # run unit tests (Vitest)
npm run build    # type-check and create a production build in dist/
npm run preview  # preview the production build
```

## Deployment

`vite.config.ts` uses `base: './'`, so the contents of `dist/` can be hosted on any static host, including GitHub Pages.

## License

Released under the [MIT License](LICENSE) – © 2026 Taha Darende.
