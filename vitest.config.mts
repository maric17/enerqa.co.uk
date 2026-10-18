import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setupTests.ts'],
    globals: true,
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      // Server actions use Payload's Next alias; resolve it before applying their test mocks.
      '@payload-config': path.resolve(import.meta.dirname, './src/payload.config.ts'),
      // Next resolves this marker itself; tests use the installed empty server entry.
      'server-only': path.resolve(import.meta.dirname, './node_modules/next/dist/compiled/server-only/empty.js'),
    },
  },
})
