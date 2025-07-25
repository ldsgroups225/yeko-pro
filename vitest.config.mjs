import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve('.', './'),
    },
  },
})
