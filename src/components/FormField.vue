<script setup lang="ts">
defineProps<{ label: string; id: string; error?: string; optional?: boolean }>()
</script>

<template>
  <div>
    <label :for="id" class="label">
      {{ label }}<span v-if="optional" class="ml-1 font-normal text-slate-400">(optional)</span>
    </label>
    <slot />
    <p v-if="error" class="hint" role="alert">{{ error }}</p>
  </div>
</template>
