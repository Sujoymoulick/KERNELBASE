import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { ALL_DOC_PAGES } from './src/data/pages';
import { writeSitemapAndRobots } from './src/utils/sitemapGenerator';

function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap-and-robots',
    buildStart() {
      try {
        writeSitemapAndRobots(ALL_DOC_PAGES);
      } catch (err) {
        console.warn('[sitemap-plugin] Generation warning:', err);
      }
    },
  };
}

function removeCrossoriginPlugin(): Plugin {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html) {
      return html.replace(/ crossorigin/g, '');
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    build: {
      modulePreload: false,
    },
    plugins: [react(), tailwindcss(), sitemapPlugin(), removeCrossoriginPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
