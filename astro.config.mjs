// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  // D10 (see docs/arch-rules.md): Keystatic's GitHub-mode OAuth token
  // exchange has to happen server-side, so the integration's /keystatic
  // and /api/keystatic routes are rendered on demand. The adapter only
  // powers those two routes; every other page is still prerendered to
  // static HTML at build time.
  adapter: node({ mode: 'standalone' }),

  // TODO: replace with the real domain once bound
  site: 'https://example.com',

  integrations: [mdx(), react(), keystatic()],

  // D3 + D10: 'manual' turns off Astro's built-in locale gate, which
  // would 404 Keystatic's unprefixed /keystatic page (its path is
  // hardcoded in Keystatic's UI and OAuth redirects). The same
  // prefix-always gate is re-applied in src/middleware.ts for every
  // other route.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: 'manual',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
