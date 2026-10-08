// @ts-check
import sitemap from '@astrojs/sitemap';
import vercelAdapter from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://karol-rutkowski.com',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    icon(),
    sitemap({
      // Match the canonical URLs (no trailing slash) emitted by Layout.astro.
      serialize(item) {
        item.url = item.url.replace(/(?<=[^/])\/$/, '').replace(/^(https:\/\/[^/]+)$/, '$1/');
        return item;
      },
    }),
  ],
  adapter: vercelAdapter(),
  output: 'server',
});