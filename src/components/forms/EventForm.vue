<script setup lang="ts">
import type { EventData, FieldErrors } from '../../types/qr'
import FormField from '../FormField.vue'
defineProps<{ data: EventData; errors: FieldErrors }>()
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
    <div class="sm:col-span-2 md:col-span-1 lg:col-span-2">
      <FormField label="Title" id="ev-title" :error="errors.title"><input id="ev-title" v-model="data.title" class="input" autocomplete="off" /></FormField>
    </div>
    <div class="sm:col-span-2 md:col-span-1 lg:col-span-2">
      <FormField label="Location" id="ev-loc" optional><input id="ev-loc" v-model="data.location" class="input" autocomplete="off" /></FormField>
    </div>
    <FormField label="Start" id="ev-start" :error="errors.start"><input id="ev-start" v-model="data.start" class="input" type="datetime-local" /></FormField>
    <FormField label="End" id="ev-end" :error="errors.end" optional><input id="ev-end" v-model="data.end" class="input" type="datetime-local" /></FormField>
    <div class="sm:col-span-2 md:col-span-1 lg:col-span-2">
      <FormField label="Description" id="ev-desc" optional><textarea id="ev-desc" v-model="data.description" class="input" rows="3" /></FormField>
    </div>
  </div>
</template>
