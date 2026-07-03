// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from 'astro-sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// Ver ADR-001: Astro 7 estático, pnpm, deploy Vercel.
// Ver ADR-005: iconos vía astro-icon, sets simple-icons + local.
export default defineConfig({
  site: 'https://carlosquiroz.dev', // TODO: ajustar al dominio real
  trailingSlash: 'never',
  i18n: {
    // El bilingüe se maneja con data-lang en el DOM (ADR-003),
    // no con rutas i18n. Astro pide el campo igual para evitar warnings.
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    icon({
      iconDir: 'src/icons',
    }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
