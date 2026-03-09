import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // SDK 主测试入口：真实环境集成测试
    globals: true,
    environment: 'node',
    include: ['__tests__/integration/**/*.test.ts'],
    testTimeout: 60000, // 集成测试需要更长超时（网络请求）
    hookTimeout: 30000,
    // 串行执行，避免并发操作同一个 space 产生冲突
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    coverage: {
      provider: 'v8',
      include: ['apis/**/*.ts', 'interceptor/**/*.ts', 'loaders/**/*.ts', 'utils/**/*.ts'],
      exclude: ['**/*.test.ts', '**/index.ts'],
      reportsDirectory: './coverage',
      cleanOnRerun: true,
    },
  },
});
