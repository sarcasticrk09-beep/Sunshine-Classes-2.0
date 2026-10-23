import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Plugin to ensure production dependencies and package manifest are retained in the output directory
function productionDependenciesPlugin(): Plugin {
  return {
    name: 'production-dependencies-plugin',
    closeBundle() {
      try {
        const rootPkgPath = path.resolve(__dirname, 'package.json');
        if (fs.existsSync(rootPkgPath)) {
          const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
          const prodPkg = {
            name: rootPkg.name || 'sunshine-erp',
            version: rootPkg.version || '1.0.0',
            private: true,
            type: rootPkg.type || 'module',
            scripts: {
              start: 'node server.cjs'
            },
            dependencies: rootPkg.dependencies || {},
          };

          const targetDirs = [
            path.resolve(__dirname, 'dist'),
            path.resolve(__dirname, 'build'),
          ];

          for (const targetDir of targetDirs) {
            if (fs.existsSync(targetDir)) {
              fs.writeFileSync(
                path.join(targetDir, 'package.json'),
                JSON.stringify(prodPkg, null, 2),
                'utf-8'
              );
            }
          }
        }
      } catch (err) {
        console.warn('[productionDependenciesPlugin] Non-blocking notice syncing output package.json:', err);
      }
    }
  };
}

export default defineConfig(() => {
  return {
    define: {
      'import.meta.env.VITE_APP_ENV': JSON.stringify(process.env.VITE_APP_ENV || (process.env.VITE_SUPABASE_URL ? 'production' : (process.env.APP_ENV || 'production'))),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_STAGING_SUPABASE_URL': JSON.stringify(process.env.STAGING_SUPABASE_URL || ''),
      'import.meta.env.VITE_STAGING_SUPABASE_ANON_KEY': JSON.stringify(process.env.STAGING_SUPABASE_ANON_KEY || ''),
    },
    plugins: [react(), tailwindcss(), productionDependenciesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'motion',
        '@supabase/supabase-js',
      ],
      // Exclude sharp from client dependency pre-bundling to prevent native module errors
      exclude: ['sharp'],
    },
    ssr: {
      // Externalize sharp in server-side/SSR contexts
      external: ['sharp'],
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 2500,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        external: ['sharp'],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('motion')) return 'vendor-motion';
              if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('dompurify')) return 'vendor-pdf';
              if (id.includes('@supabase')) return 'vendor-supabase';
            }
          }
        }
      }
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
