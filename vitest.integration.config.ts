import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
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
  },
});
