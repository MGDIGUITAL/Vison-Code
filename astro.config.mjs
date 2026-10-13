import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// Asegurar que @astrojs/vercel genere runtime 'nodejs20.x' compatible con Vercel
Object.defineProperty(process, 'version', {
  value: 'v20.18.0',
  configurable: true,
});

export default defineConfig({
  integrations: [tailwind()],
  output: 'hybrid',
  adapter: vercel(),
});
