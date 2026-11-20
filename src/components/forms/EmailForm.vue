<script setup lang="ts">
import type { EmailData, FieldErrors } from '../../types/qr'
import FormField from '../FormField.vue'
defineProps<{ data: EmailData; errors: FieldErrors }>()
</script>

<template>
  <div class="space-y-4">
    <FormField label="Recipient" id="em-to" :error="errors.to">
      <input id="em-to" v-model="data.to" class="input" type="email" autocomplete="off" placeholder="name@example.com" />
    </FormField>
    <FormField label="Subject" id="em-sub" optional><input id="em-sub" v-model="data.subject" class="input" autocomplete="off" /></FormField>
    <FormField label="Message" id="em-body" optional><textarea id="em-body" v-model="data.body" class="input" rows="4" /></FormField>
  </div>
</template>
