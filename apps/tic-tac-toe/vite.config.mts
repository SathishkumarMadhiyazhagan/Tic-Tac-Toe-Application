/// <reference types='vitest' />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin';

const workspaceRoot = path.resolve(import.meta.dirname, '../..');

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/tic-tac-toe',
  server:{
    port: 4200,
    host: 'localhost',
  },
  preview:{
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), nxReadySignal()],
  resolve: {
    alias: {
      '@tic-tac-toe/game-util-game-logic': path.join(
        workspaceRoot,
        'libs/game/util-game-logic/src/index.ts'
      ),
      '@tic-tac-toe/game-data-access': path.join(
        workspaceRoot,
        'libs/game/data-access/src/index.ts'
      ),
      '@tic-tac-toe/game-ui-board': path.join(
        workspaceRoot,
        'libs/game/ui-board/src/index.ts'
      ),
      '@tic-tac-toe/game-feature': path.join(
        workspaceRoot,
        'libs/game/feature-game/src/index.ts'
      ),
      '@tic-tac-toe/scoreboard-feature': path.join(
        workspaceRoot,
        'libs/scoreboard/feature-scoreboard/src/index.ts'
      ),
    },
  },
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: '@tic-tac-toe/tic-tac-toe',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: [
      '{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '../../libs/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    }
  },
}));
