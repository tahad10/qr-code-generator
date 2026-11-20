<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronDown, TriangleAlert, Upload, X } from 'lucide-vue-next'
import type { CornerStyle, DotStyle, ErrorCorrection, QrStyleOptions } from '../types/qr'
import { checkContrast, normalizeHex } from '../utils/contrastChecker'

const style = defineModel<QrStyleOptions>({ required: true })

const open = ref(false)
const logoError = ref('')
const ecNotice = ref('')

const swatches = ['#000000', '#1e293b', '#4f46e5', '#0f766e', '#be123c', '#c2410c', '#ffffff', '#fef3c7']
const dotStyles: { id: DotStyle; label: string }[] = [
  { id: 'square', label: 'Square' }, { id: 'rounded', label: 'Rounded' },
  { id: 'dots', label: 'Dots' }, { id: 'classy-rounded', label: 'Classy' },
]
const cornerStyles: { id: CornerStyle; label: string }[] = [
  { id: 'square', label: 'Square' }, { id: 'extra-rounded', label: 'Extra rounded' }, { id: 'dot', label: 'Dot' },
]
const levels: { id: ErrorCorrection; label: string }[] = [
  { id: 'L', label: 'L (7 %)' }, { id: 'M', label: 'M (15 %)' }, { id: 'Q', label: 'Q (25 %)' }, { id: 'H', label: 'H (30 %)' },
]

const contrast = computed(() => checkContrast(style.value.foreground, style.value.background))

function set<K extends keyof QrStyleOptions>(key: K, value: QrStyleOptions[K]) {
  style.value = { ...style.value, [key]: value }
}

// Hex text fields: only accept valid values
const fgText = ref(style.value.foreground)
const bgText = ref(style.value.background)
watch(() => style.value.foreground, (v) => (fgText.value = v))
watch(() => style.value.background, (v) => (bgText.value = v))
function commitHex(kind: 'foreground' | 'background', text: string) {
  const n = normalizeHex(text)
  if (n) set(kind, n)
}

function onLogo(e: Event) {
  logoError.value = ''
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!/^image\/(png|jpeg|svg\+xml)$/.test(file.type)) { logoError.value = 'Only PNG, JPG or SVG allowed.'; return }
  if (file.size > 2 * 1024 * 1024) { logoError.value = 'File too large (max. 2 MB).'; return }
  const reader = new FileReader()
  reader.onload = () => {
    const next = { ...style.value, logo: String(reader.result) }
    if (next.errorCorrection !== 'H') {
      next.errorCorrection = 'H'
      ecNotice.value = 'Error correction was automatically set to H (30%) for the logo.'
    }
    style.value = next
  }
  reader.readAsDataURL(file)
}
function removeLogo() { ecNotice.value = ''; set('logo', null) }

const optBtn = (active: boolean) =>
  `min-h-[44px] rounded-lg border px-3 text-sm font-medium transition ${active
    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
    : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'}`
</script>

<template>
  <section class="card !p-0">
    <button type="button" class="flex min-h-[56px] w-full items-center justify-between px-4 text-left font-semibold sm:px-6"
      :aria-expanded="open" aria-controls="style-body" @click="open = !open">
      Customize design
      <ChevronDown :size="20" class="transition-transform" :class="open && 'rotate-180'" />
    </button>
    <div v-show="open" id="style-body" class="space-y-6 border-t border-slate-200 p-4 dark:border-slate-800 sm:p-6">
      <!-- Colors -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
        <div v-for="c in [{ k: 'foreground', label: 'Foreground (dots)' }, { k: 'background', label: 'Background' }] as const" :key="c.k">
          <label class="label" :for="`hex-${c.k}`">{{ c.label }}</label>
          <div class="flex gap-2">
            <input type="color" :value="style[c.k]" :aria-label="`${c.label} color picker`"
              class="h-[44px] w-[52px] shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-transparent p-1 dark:border-slate-700"
              @input="set(c.k, ($event.target as HTMLInputElement).value)" />
            <input :id="`hex-${c.k}`" class="input font-mono" maxlength="7" autocomplete="off"
              :value="c.k === 'foreground' ? fgText : bgText"
              @input="(e) => { const v = (e.target as HTMLInputElement).value; if (c.k === 'foreground') fgText = v; else bgText = v; commitHex(c.k, v) }" />
          </div>
          <div class="mt-1 flex flex-wrap">
            <button v-for="s in swatches" :key="s" type="button" :aria-label="`Select ${s}`"
              class="flex h-[44px] w-[44px] items-center justify-center" @click="set(c.k, s)">
              <span class="block h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600"
                :class="style[c.k] === s && 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900'"
                :style="{ backgroundColor: s }" />
            </button>
          </div>
        </div>
      </div>
      <p v-if="contrast.message" role="alert"
        class="flex items-start gap-2 rounded-lg bg-amber-100 p-3 text-sm text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
        <TriangleAlert :size="18" class="mt-0.5 shrink-0" />{{ contrast.message }}
      </p>

      <!-- Shapes -->
      <div>
        <span class="label">Dot style</span>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
          <button v-for="d in dotStyles" :key="d.id" type="button" :class="optBtn(style.dotStyle === d.id)" @click="set('dotStyle', d.id)">{{ d.label }}</button>
        </div>
      </div>
      <div>
        <span class="label">Corner style</span>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="d in cornerStyles" :key="d.id" type="button" :class="optBtn(style.cornerStyle === d.id)" @click="set('cornerStyle', d.id)">{{ d.label }}</button>
        </div>
      </div>

      <!-- Logo -->
      <div>
        <span class="label">Center logo <span class="font-normal text-slate-400">(optional)</span></span>
        <div class="flex flex-wrap items-center gap-3">
          <label class="btn cursor-pointer">
            <Upload :size="16" /> Choose image
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" class="sr-only" @change="onLogo" />
          </label>
          <template v-if="style.logo">
            <img :src="style.logo" alt="Logo preview" class="h-11 w-11 rounded border border-slate-300 object-contain dark:border-slate-700" />
            <button type="button" class="btn" @click="removeLogo"><X :size="16" /> Remove</button>
          </template>
        </div>
        <p v-if="logoError" class="hint">{{ logoError }}</p>
        <p v-if="ecNotice && style.logo" class="mt-1 text-xs text-indigo-600 dark:text-indigo-300">{{ ecNotice }}</p>
        <p v-else-if="style.logo && style.errorCorrection !== 'H'" class="mt-1 text-xs text-amber-600 dark:text-amber-300">
          Error correction H is recommended with a logo.
        </p>
      </div>

      <!-- Error correction -->
      <div>
        <span class="label">Error correction</span>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
          <button v-for="l in levels" :key="l.id" type="button" :class="optBtn(style.errorCorrection === l.id)" @click="set('errorCorrection', l.id)">{{ l.label }}</button>
        </div>
      </div>
    </div>
  </section>
</template>
