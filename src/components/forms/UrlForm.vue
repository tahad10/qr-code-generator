<script setup lang="ts">
import type { FieldErrors, UrlData } from '../../types/qr'
import FormField from '../FormField.vue'
defineProps<{ data: UrlData; errors: FieldErrors }>()
</script>

<template>
  <FormField label="Website address" id="url" :error="errors.url">
    <input id="url" v-model="data.url" class="input" type="text" inputmode="url" autocomplete="off"
      placeholder="example.com or https://example.com" />
    <p class="mt-1 text-xs text-slate-500">If the protocol is missing, https:// is added automatically.</p>
  </FormField>
</template>
