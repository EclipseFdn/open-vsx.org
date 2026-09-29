import path from 'node:path';
import react from '@vitejs/plugin-react';
import webfontDownload from 'vite-plugin-webfont-dl';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';

const outRootDir = path.join(import.meta.dirname, 'dist');

export default defineConfig(() => ({
  plugins: [react(), webfontDownload(), visualizer() as PluginOption],
  server: {
    host: true,
    port: 3000
  },
  preview: {
    port: 3000
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
      // @mui/icons-material's deep imports (e.g. '@mui/icons-material/Menu') resolve to
      // CJS files that Rolldown's dep optimizer/bundler unwraps incorrectly, yielding the
      // module's exports object instead of the icon component (React error #130). The
      // 'esm/' subpath ships genuine ESM sources that don't hit that interop path.
      { find: /^@mui\/icons-material\/(?!esm\/|utils\/)(.+)$/, replacement: '@mui/icons-material/esm/$1' }
    ]
  },
  publicDir: 'static',
  build: {
    target: 'es2020',
    minify: true,
    sourcemap: true,
    outDir: outRootDir,
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        entryFileNames: 'bundle-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: 'chunk-[name]-[hash].js'
      }
    }
  }
}));
