// @ts-check
import path from 'node:path'

import { defineConfig, envField } from 'astro/config'
import sitemap from '@astrojs/sitemap'

import tailwindcss from '@tailwindcss/vite'

import cloudflare from '@astrojs/cloudflare'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.bigibai.com',
  // 'compile': imágenes optimizadas en build, sin binding de Cloudflare Images
  adapter: cloudflare({ imageService: 'compile' }),
  // No usamos Astro.session: evita que el adapter cree un KV para sesiones
  session: false,
  integrations: [sitemap({
    filter: (page) => !page.includes('/admin')
  })],
  output: 'server',
  // Se leen al ejecutar (secrets del Worker; en local, .env.local), así que no acaban en el bundle
  env: {
    schema: {
      PUBLIC_SUPABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      PUBLIC_SUPABASE_KEY: envField.string({ context: 'server', access: 'secret' }),
      SUPABASE_ADMIN_KEY: envField.string({ context: 'server', access: 'secret' }),
      COUPON_HMAC_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      ENCRYPTION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      SALT_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_USERS_IDS: envField.string({ context: 'server', access: 'secret', default: '' }),
      TOTAL_COUPONS: envField.number({ context: 'server', access: 'secret', default: 0 }),
      EXPERIENCE_ENABLED: envField.boolean({ context: 'server', access: 'secret', default: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
})
