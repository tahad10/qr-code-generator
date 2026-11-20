<script setup lang="ts">
import { Moon, QrCode, ShieldCheck, Sun } from 'lucide-vue-next'
defineProps<{ dark: boolean }>()
defineEmits<{ (e: 'toggle-theme'): void }>()
</script>

<template>
  <header class="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white"><QrCode :size="20" /></span>
        <h1 class="text-lg font-semibold tracking-tight">QR-Code Generator - TD</h1>
      </div>
      <div class="flex items-center gap-2">
        <span class="hidden items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 sm:inline-flex">
          <ShieldCheck :size="14" /> 100% local in your browser – no server transfer
        </span>
        <button type="button" class="btn !px-3" :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="$emit('toggle-theme')">
          <Sun v-if="dark" :size="18" /><Moon v-else :size="18" />
        </button>
      </div>
    </div>
    <p class="flex items-center justify-center gap-1.5 bg-emerald-100 px-4 py-1.5 text-center text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 sm:hidden">
      <ShieldCheck :size="14" /> 100% local in your browser – no server transfer
    </p>
  </header>
</template>
