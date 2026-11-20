<script setup lang="ts">
import type { FieldErrors, TextData } from '../../types/qr'
import { MAX_TEXT_LENGTH } from '../../types/qr'
import FormField from '../FormField.vue'
defineProps<{ data: TextData; errors: FieldErrors }>()
</script>

<template>
  <FormField label="Text / Note" id="tx" :error="errors.text">
    <textarea id="tx" v-model="data.text" class="input" rows="6" />
    <p class="mt-1 text-right text-xs" :class="data.text.length > MAX_TEXT_LENGTH ? 'text-red-500' : 'text-slate-500'">
      {{ data.text.length }} / {{ MAX_TEXT_LENGTH }}
    </p>
  </FormField>
</template>
