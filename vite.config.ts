import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

const target = process.env.BUILD_TARGET || 'sidepanel'

const configs = {
  sidepanel: {
    root: 'src/sidepanel',
    base: './',
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'src/sidepanel/sidepanel.html'),
      },
    },
    publicDir: resolve(__dirname, 'public'),
  },
  content: {
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/content/index.ts'),
        formats: ['iife' as const],
        fileName: () => 'content.js',
        name: 'JluContentScript',
      },
    },
  },
  background: {
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/background/index.ts'),
        formats: ['es' as const],
        fileName: () => 'background.js',
      },
    },
  },
}

export default defineConfig(({ mode }) => {
  const basePlugins = mode === 'production'
    ? [react(), tailwindcss()]
    : [react(), tailwindcss()]

  const targetConfig = configs[target as keyof typeof configs] || configs.sidepanel

  return {
    plugins: basePlugins,
    ...targetConfig,
    css: {
      // Ensure Tailwind processes all source files
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  }
})
