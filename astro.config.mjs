// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  // D10 (see docs/arch-rules.md): Keystatic's GitHub-mode OAuth token
  // exchange has to happen server-side, so /en/keystatic and
  // /api/keystatic (see those pages) carry `prerender: false`. The
  // adapter only powers those two routes on demand; every other page is
  // still prerendered to static HTML at build time, same as before.
  //
  // We don't use the @keystatic/astro integration itself — it
  // auto-injects an unprefixed /keystatic page, which Astro's own i18n
  // router (prefixDefaultLocale: true, see D3) treats as a 404 for any
  // non-"/en/.../ru/"-prefixed "page"-type route. Mounting the admin
  // page manually under /en/keystatic sidesteps that; see D10.
  adapter: node({ mode: 'standalone' }),

  // TODO: replace with the real domain once bound
  site: 'https://example.com',

  integrations: [mdx(), react()],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});