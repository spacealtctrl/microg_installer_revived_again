
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'

const modulePropPath = fileURLToPath(new URL('../module.prop', import.meta.url))
const moduleVersion = (readFileSync(modulePropPath, 'utf-8').match(/^version=(.*)$/m)?.[1] || '').trim()

export default defineConfig({
  define: {
    __MODULE_VERSION__: JSON.stringify(moduleVersion)
  },
  plugins: [
    vue(),
    tailwindcss(),
    ViteMinifyPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: '../webroot',
    emptyOutDir: true
  }
})
