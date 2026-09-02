import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import glsl from 'vite-plugin-glsl';

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
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
