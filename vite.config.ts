import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// On Vercel the page is a static file that server.ts never touches, so __SITE_URL__ is filled at
// build time from the production domain. Elsewhere it stays for server.ts to fill per request.
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const vercelSiteUrl: Plugin | null = vercelDomain
  ? {
      name: 'site-url',
      apply: 'build',
      transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', `https://${vercelDomain}`),
    }
  : null;

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      vercelSiteUrl,
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      // The main chunk is ~1.44 MB (~350 kB gzip), mostly the Thai chapter content the Guide tab
      // renders on first load. Lazy-loading the AI and Quiz tabs only brings it to ~1.26 MB, so the
      // 500 kB default cannot be met without splitting the chapter data. The limit sits just above
      // today's size so real growth still warns.
      chunkSizeWarningLimit: 1500,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
