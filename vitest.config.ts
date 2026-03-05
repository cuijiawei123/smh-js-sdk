import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 仅用于轻量单测（不包含 integration）
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    exclude: ['__tests__/integration/**'],
    coverage: {
      provider: 'v8',
      include: ['utils/**/*.ts', 'loaders/**/*.ts'],
      exclude: ['**/*.test.ts', '**/index.ts'],
    },
    testTimeout: 10000,
  },
});
