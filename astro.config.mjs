// @ts-check
import sitemap from '@astrojs/sitemap';
import vercelAdapter from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: import.meta.env.SITE_URL || 'https://www.rutkowski-software.com',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [icon(), sitemap()],
  adapter: vercelAdapter(),
  output: 'server',
});