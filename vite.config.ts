/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base './' keeps the build relocatable (GitHub Pages, any sub-path).
export default defineConfig({
  base: './',
  plugins: [vue()],
  test: { environment: 'node', include: ['src/**/*.spec.ts'] },
})
