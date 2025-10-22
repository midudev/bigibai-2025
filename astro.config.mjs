// @ts-check
import path from 'node:path'

import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

import tailwindcss from '@tailwindcss/vite'

import vercel from '@astrojs/vercel'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.bigibai.com',
  adapter: vercel(),
  integrations: [sitemap()],
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
})
