<script setup lang="ts">
import type { FieldErrors, SepaData } from '../../types/qr'
import { formatIban } from '../../utils/qrPayloadBuilder'
import FormField from '../FormField.vue'
const props = defineProps<{ data: SepaData; errors: FieldErrors }>()

/** Formats the IBAN into groups of four when the field loses focus. */
function formatOnBlur() {
  props.data.iban = formatIban(props.data.iban)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
    <div class="sm:col-span-2 md:col-span-1 lg:col-span-2">
      <FormField label="Recipient name" id="sp-name" :error="errors.name">
        <input id="sp-name" v-model="data.name" class="input" maxlength="70" autocomplete="off" />
      </FormField>
    </div>
    <div class="sm:col-span-2 md:col-span-1 lg:col-span-2">
      <FormField label="IBAN" id="sp-iban" :error="errors.iban">
        <input id="sp-iban" v-model="data.iban" class="input font-mono uppercase" autocomplete="off" autocapitalize="characters"
          placeholder="DE89 3704 0044 0532 0130 00" @blur="formatOnBlur" />
      </FormField>
    </div>
    <FormField label="BIC" id="sp-bic" :error="errors.bic" optional>
      <input id="sp-bic" v-model="data.bic" class="input font-mono uppercase" autocomplete="off" autocapitalize="characters" />
    </FormField>
    <FormField label="Amount in EUR" id="sp-amount" :error="errors.amount" optional>
      <input id="sp-amount" v-model="data.amount" class="input" inputmode="decimal" autocomplete="off" placeholder="12,50" />
    </FormField>
    <div class="sm:col-span-2 md:col-span-1 lg:col-span-2">
      <FormField label="Payment reference" id="sp-purpose" :error="errors.purpose" optional>
        <input id="sp-purpose" v-model="data.purpose" class="input" maxlength="140" autocomplete="off" />
      </FormField>
    </div>
  </div>
</template>
