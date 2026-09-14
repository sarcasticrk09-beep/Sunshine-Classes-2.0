import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    define: {
      'import.meta.env.VITE_APP_ENV': JSON.stringify(process.env.APP_ENV || 'staging'),
      'import.meta.env.VITE_STAGING_SUPABASE_URL': JSON.stringify(process.env.STAGING_SUPABASE_URL || ''),
      'import.meta.env.VITE_STAGING_SUPABASE_ANON_KEY': JSON.stringify(process.env.STAGING_SUPABASE_ANON_KEY || ''),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
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
