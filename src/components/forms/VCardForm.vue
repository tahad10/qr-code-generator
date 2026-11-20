<script setup lang="ts">
import type { FieldErrors, VCardData } from '../../types/qr'
import FormField from '../FormField.vue'
defineProps<{ data: VCardData; errors: FieldErrors }>()
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
    <FormField label="First name" id="vc-fn"><input id="vc-fn" v-model="data.firstName" class="input" autocomplete="off" /></FormField>
    <FormField label="Last name" id="vc-ln" :error="errors.lastName"><input id="vc-ln" v-model="data.lastName" class="input" autocomplete="off" /></FormField>
    <FormField label="Organization / Company" id="vc-org" optional><input id="vc-org" v-model="data.organization" class="input" autocomplete="off" /></FormField>
    <FormField label="Job title" id="vc-title" optional><input id="vc-title" v-model="data.title" class="input" autocomplete="off" /></FormField>
    <FormField label="Phone (mobile)" id="vc-mob" optional><input id="vc-mob" v-model="data.phoneMobile" class="input" type="tel" autocomplete="off" /></FormField>
    <FormField label="Phone (work)" id="vc-work" optional><input id="vc-work" v-model="data.phoneWork" class="input" type="tel" autocomplete="off" /></FormField>
    <FormField label="Email" id="vc-mail" :error="errors.email" optional><input id="vc-mail" v-model="data.email" class="input" type="email" autocomplete="off" /></FormField>
    <FormField label="Website" id="vc-web" :error="errors.website" optional><input id="vc-web" v-model="data.website" class="input" inputmode="url" autocomplete="off" /></FormField>
    <div class="sm:col-span-2 md:col-span-1 lg:col-span-2">
      <FormField label="Street & number" id="vc-street" optional><input id="vc-street" v-model="data.street" class="input" autocomplete="off" /></FormField>
    </div>
    <FormField label="ZIP code" id="vc-zip" optional><input id="vc-zip" v-model="data.zip" class="input" autocomplete="off" /></FormField>
    <FormField label="City" id="vc-city" optional><input id="vc-city" v-model="data.city" class="input" autocomplete="off" /></FormField>
    <FormField label="Country" id="vc-country" optional><input id="vc-country" v-model="data.country" class="input" autocomplete="off" /></FormField>
  </div>
</template>
