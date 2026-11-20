<script setup lang="ts">
import { CalendarDays, Contact, FileText, Landmark, Link, Mail, MessageCircle, Share2, Wifi } from 'lucide-vue-next'
import type { QrType } from '../types/qr'

defineProps<{ modelValue: QrType }>()
defineEmits<{ (e: 'update:modelValue', v: QrType): void }>()

const types = [
  { id: 'url', label: 'URL', icon: Link },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'vcard', label: 'Business card', icon: Contact },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'message', label: 'WhatsApp / SMS', icon: MessageCircle },
  { id: 'sepa', label: 'SEPA', icon: Landmark },
  { id: 'event', label: 'Event', icon: CalendarDays },
  { id: 'text', label: 'Text', icon: FileText },
] as const
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-5" role="tablist" aria-label="QR code type">
    <button v-for="t in types" :key="t.id" type="button" role="tab" :aria-selected="modelValue === t.id"
      class="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      :class="modelValue === t.id
        ? 'border-indigo-500 bg-indigo-600 text-white shadow'
        : 'border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'"
      @click="$emit('update:modelValue', t.id)">
      <component :is="t.icon" :size="20" />{{ t.label }}
    </button>
  </div>
</template>
