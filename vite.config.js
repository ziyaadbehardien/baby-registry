import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { apiDevServer } from './scripts/viteApiDev.js';

export default defineConfig({
  plugins: [react(), apiDevServer()],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'assets'),
      components: path.resolve(__dirname, 'src/components'),
      layout: path.resolve(__dirname, 'src/layout'),
      routes: path.resolve(__dirname, 'src/routes'),
      features: path.resolve(__dirname, 'src/features'),
    },
  },
  server: { port: 3000 },
  build: { outDir: './build' },
  test: {
    include: ['api/**/*.test.js', 'src/**/*.test.{js,jsx}'],
  },
});
