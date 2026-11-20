<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <footer class="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
    <p class="flex items-center justify-center gap-1.5">
      <ShieldCheck :size="14" /> 100% local in your browser – no server transfer, no cookies, no tracking.
    </p>
    <p class="mt-1">QR-Code Generator - TD · All data remains on your device.</p>
    <p class="mt-1">© 2026 Taha Darende · Released under the <a href="https://opensource.org/license/mit" target="_blank" rel="noopener noreferrer" class="underline hover:text-indigo-500">MIT License</a>.</p>
  </footer>
</template>
