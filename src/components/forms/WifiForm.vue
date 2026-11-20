<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import type { FieldErrors, WifiData } from '../../types/qr'
import FormField from '../FormField.vue'
defineProps<{ data: WifiData; errors: FieldErrors }>()
const show = ref(false)
</script>

<template>
  <div class="space-y-4">
    <FormField label="Network name (SSID)" id="ssid" :error="errors.ssid">
      <input id="ssid" v-model="data.ssid" class="input" type="text" autocomplete="off" />
    </FormField>
    <FormField v-if="data.encryption !== 'nopass'" label="Password" id="wifi-pw" :error="errors.password">
      <div class="relative">
        <input id="wifi-pw" v-model="data.password" class="input pr-12" :type="show ? 'text' : 'password'"
          autocomplete="off" />
        <button type="button" class="absolute right-0 top-0 flex h-[44px] w-[44px] items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          :aria-label="show ? 'Hide password' : 'Show password'" @click="show = !show">
          <EyeOff v-if="show" :size="20" /><Eye v-else :size="20" />
        </button>
      </div>
    </FormField>
    <FormField label="Encryption" id="enc">
      <select id="enc" v-model="data.encryption" class="input">
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">None / Open</option>
      </select>
    </FormField>
    <label class="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
      <input v-model="data.hidden" type="checkbox" class="h-5 w-5 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500" />
      Hidden network
    </label>
  </div>
</template>
