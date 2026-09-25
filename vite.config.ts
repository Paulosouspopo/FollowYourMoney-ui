/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import pkg from './package.json' with { type: 'json' }

// Fuseau fixe pour les tests : les dates « heure locale » du formulaire sont
// vérifiées en France, quel que soit le fuseau de la machine (CI en UTC).
process.env.TZ = 'Europe/Paris'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Tests de formulaires (saisie clavier simulée) : lents sur une machine chargée
    testTimeout: 15_000,
  },
})
