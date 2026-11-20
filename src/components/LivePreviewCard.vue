<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { Check, Code, Copy, Download, QrCode } from 'lucide-vue-next'
import type { QrStyleOptions } from '../types/qr'
import { QRCodeStyling, buildQrOptions, downloadBlob, renderQrBlob } from '../utils/qrRender'

const props = defineProps<{ payload: string; qrStyle: QrStyleOptions; filename: string }>()

const host = ref<HTMLDivElement | null>(null)
const sizes = [512, 1024, 2048]
const size = ref(1024)
const showPayload = ref(false)
const status = ref('')
const failed = ref('')
let qr: QRCodeStyling | null = null
let timer: ReturnType<typeof setTimeout> | undefined

function render() {
  const el = host.value
  if (!el || !props.payload) return
  try {
    failed.value = ''
    const opts = buildQrOptions(props.payload, props.qrStyle, 320, 'svg')
    if (!qr) {
      qr = new QRCodeStyling(opts)
      qr.append(el)
    } else {
      qr.update(opts)
    }
  } catch (e) {
    failed.value = e instanceof Error ? e.message : 'The content is too long for a QR code.'
  }
}

// short debounce to keep typing smooth
watch(() => [props.payload, props.qrStyle], () => {
  clearTimeout(timer)
  timer = setTimeout(() => nextTick(render), 80)
}, { deep: true })
watch(() => props.payload, async (p) => {
  if (p) { await nextTick(); render() } else { qr = null; if (host.value) host.value.innerHTML = '' }
})
onMounted(render)

function flash(msg: string) {
  status.value = msg
  setTimeout(() => (status.value = ''), 2500)
}

async function download(format: 'png' | 'svg') {
  try {
    const blob = await renderQrBlob(props.payload, props.qrStyle, size.value, format)
    downloadBlob(blob, `${props.filename}${format === 'png' ? `-${size.value}px` : ''}.${format}`)
  } catch {
    flash('Export failed – content may be too long.')
  }
}

async function copyImage() {
  try {
    const blob = await renderQrBlob(props.payload, props.qrStyle, 1024, 'png')
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    flash('Image copied to clipboard.')
  } catch {
    flash('Copying is not supported by this browser.')
  }
}

async function copyPayload() {
  try {
    await navigator.clipboard.writeText(props.payload)
    flash('Payload copied.')
  } catch {
    flash('Copy not possible.')
  }
}
</script>

<template>
  <section class="card" aria-label="Live preview">
    <div class="mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
      :style="{ backgroundColor: payload ? qrStyle.background : undefined }">
      <div v-show="payload && !failed" ref="host" class="qr-host h-full w-full" />
      <div v-if="!payload || failed" class="flex flex-col items-center gap-2 p-6 text-center text-sm text-slate-500">
        <QrCode :size="40" class="opacity-50" />
        {{ failed || 'Fill in the form to see your QR code.' }}
      </div>
    </div>

    <div class="mt-5 space-y-3">
      <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="PNG resolution">
        <button v-for="s in sizes" :key="s" type="button" role="radio" :aria-checked="size === s"
          class="min-h-[44px] rounded-lg border text-sm font-medium transition"
          :class="size === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'"
          @click="size = s">{{ s }} px</button>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" class="btn btn-primary" :disabled="!payload || !!failed" @click="download('png')"><Download :size="16" /> PNG</button>
        <button type="button" class="btn btn-primary" :disabled="!payload || !!failed" @click="download('svg')"><Download :size="16" /> SVG</button>
      </div>
      <button type="button" class="btn w-full" :disabled="!payload || !!failed" @click="copyImage"><Copy :size="16" /> Copy image to clipboard</button>
      <button type="button" class="btn w-full" :disabled="!payload" :aria-expanded="showPayload" @click="showPayload = !showPayload">
        <Code :size="16" /> {{ showPayload ? 'Hide' : 'Show' }} raw payload
      </button>
      <div v-if="showPayload && payload" class="space-y-2">
        <pre class="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-100 p-3 font-mono text-xs dark:bg-slate-800">{{ payload }}</pre>
        <button type="button" class="btn w-full" @click="copyPayload"><Copy :size="16" /> Copy payload</button>
      </div>
      <p class="flex min-h-[20px] items-center justify-center gap-1 text-center text-xs text-emerald-600 dark:text-emerald-400" role="status">
        <Check v-if="status" :size="14" />{{ status }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.qr-host :deep(svg), .qr-host :deep(canvas) { width: 100%; height: 100%; display: block; }
</style>
