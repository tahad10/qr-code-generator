<script setup lang="ts">
import { computed } from 'vue'
import { Github, Instagram, Linkedin, Music2, Twitter, Youtube } from 'lucide-vue-next'
import type { FieldErrors, SocialData, SocialPlatform } from '../../types/qr'
import { SOCIAL_BASE, buildSocialUrl } from '../../utils/qrPayloadBuilder'
import FormField from '../FormField.vue'

const props = defineProps<{ data: SocialData; errors: FieldErrors }>()

const platforms: { id: SocialPlatform; icon: typeof Github }[] = [
  { id: 'linkedin', icon: Linkedin },
  { id: 'github', icon: Github },
  { id: 'instagram', icon: Instagram },
  { id: 'x', icon: Twitter },
  { id: 'youtube', icon: Youtube },
  { id: 'tiktok', icon: Music2 },
]
const link = computed(() => buildSocialUrl(props.data.platform, props.data.handle))
</script>

<template>
  <div class="space-y-4">
    <div>
      <span class="label">Platform</span>
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-6" role="radiogroup" aria-label="Platform">
        <button v-for="p in platforms" :key="p.id" type="button" role="radio" :aria-checked="data.platform === p.id"
          class="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-lg border px-1 text-xs font-medium transition"
          :class="data.platform === p.id
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
            : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'"
          @click="data.platform = p.id">
          <component :is="p.icon" :size="20" />{{ SOCIAL_BASE[p.id].label }}
        </button>
      </div>
    </div>
    <FormField label="@username or profile URL" id="handle" :error="errors.handle">
      <input id="handle" v-model="data.handle" class="input" autocomplete="off" autocapitalize="off" placeholder="@username" />
      <p v-if="link" class="mt-1 break-all text-xs text-slate-500">→ {{ link }}</p>
    </FormField>
  </div>
</template>
