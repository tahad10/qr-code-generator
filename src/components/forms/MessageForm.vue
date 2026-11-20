<script setup lang="ts">
import type { FieldErrors, MessageData } from '../../types/qr'
import FormField from '../FormField.vue'
defineProps<{ data: MessageData; errors: FieldErrors }>()
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Service">
      <button v-for="m in [{ id: 'whatsapp', label: 'WhatsApp' }, { id: 'sms', label: 'SMS' }] as const" :key="m.id"
        type="button" role="radio" :aria-checked="data.mode === m.id"
        class="min-h-[44px] rounded-lg border text-sm font-medium transition"
        :class="data.mode === m.id
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
          : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'"
        @click="data.mode = m.id">{{ m.label }}</button>
    </div>
    <FormField label="Phone number with country code" id="ms-phone" :error="errors.phone">
      <input id="ms-phone" v-model="data.phone" class="input" type="tel" autocomplete="off" placeholder="+49 170 1234567" />
    </FormField>
    <FormField label="Pre-filled message" id="ms-text" optional>
      <textarea id="ms-text" v-model="data.message" class="input" rows="3" />
    </FormField>
  </div>
</template>
