<script setup lang="ts">
import { computed, reactive, ref, type Component } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import type { QrFormState, QrType } from './types/qr'
import { createDefaultState, createDefaultStyle } from './types/qr'
import { buildPayload } from './utils/qrPayloadBuilder'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import TypeSelector from './components/TypeSelector.vue'
import StylingPanel from './components/StylingPanel.vue'
import LivePreviewCard from './components/LivePreviewCard.vue'
import UrlForm from './components/forms/UrlForm.vue'
import WifiForm from './components/forms/WifiForm.vue'
import VCardForm from './components/forms/VCardForm.vue'
import SocialForm from './components/forms/SocialForm.vue'
import EmailForm from './components/forms/EmailForm.vue'
import MessageForm from './components/forms/MessageForm.vue'
import SepaForm from './components/forms/SepaForm.vue'
import EventForm from './components/forms/EventForm.vue'
import TextForm from './components/forms/TextForm.vue'

const forms: Record<QrType, Component> = {
  url: UrlForm, wifi: WifiForm, vcard: VCardForm, social: SocialForm, email: EmailForm,
  message: MessageForm, sepa: SepaForm, event: EventForm, text: TextForm,
}

const type = ref<QrType>('url')
const state = reactive<QrFormState>(createDefaultState())
const style = ref(createDefaultStyle())

const dark = ref(document.documentElement.classList.contains('dark'))
function toggleTheme() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
  try { localStorage.setItem('theme', dark.value ? 'dark' : 'light') } catch { /* ignore */ }
}

const result = computed(() => buildPayload(type.value, state))

/** Only show errors for fields that already have a value. */
const visibleErrors = computed(() => {
  const data = state[type.value] as unknown as Record<string, unknown>
  return Object.fromEntries(
    Object.entries(result.value.errors).filter(([field]) => String(data[field] ?? '').trim() !== ''),
  )
})

function reset() {
  Object.assign(state, createDefaultState())
}
</script>

<template>
  <div class="min-h-screen">
    <AppHeader :dark="dark" @toggle-theme="toggleTheme" />
    <main class="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_360px]">
      <div class="min-w-0 space-y-6">
        <TypeSelector v-model="type" />
        <section class="card">
          <component :is="forms[type]" :data="state[type]" :errors="visibleErrors" />
          <div class="mt-6">
            <button type="button" class="btn" @click="reset"><RotateCcw :size="16" /> Reset form</button>
          </div>
        </section>
        <StylingPanel v-model="style" />
      </div>
      <aside class="min-w-0 md:sticky md:top-6 md:self-start">
        <LivePreviewCard :payload="result.payload" :qr-style="style" :filename="`qr-${type}`" />
      </aside>
    </main>
    <AppFooter />
  </div>
</template>
