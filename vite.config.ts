import { resolve } from 'node:path';
import fs from 'node:fs';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import glsl from 'vite-plugin-glsl';

function copyStaticAssets(): Plugin {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const folders = ['js', 'css', 'assets'];
      for (const folder of folders) {
        const src = resolve(__dirname, 'frontend', folder);
        const dest = resolve(__dirname, 'dist', folder);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true, force: true });
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  root: './frontend',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  plugins: [
    react(),
    tsconfigPaths(),
    // Inlines `#include` directives in .glsl / .wgsl shader files at build time
    glsl({
      warnDuplicatedImports: true,
      removeDuplicatedImports: true,
    }),
    copyStaticAssets(),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        about: resolve(__dirname, 'frontend/about/index.html'),
        problem: resolve(__dirname, 'frontend/problem/index.html'),
        simulator: resolve(__dirname, 'frontend/simulator/index.html'),
      },
    },
  },
});

