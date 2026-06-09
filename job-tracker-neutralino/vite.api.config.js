import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/neutralino-api/index.js'),
      formats: ['iife'],
      name: 'JobTrackerAPI',
      fileName: () => 'api.js',
    },
    outDir: 'resources/js',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
})
