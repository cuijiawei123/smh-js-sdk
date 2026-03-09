/// <reference types="node" />
/**
 * async 工具函数集成测试
 * 覆盖：parallelLimit、delay、withRetry 各种分支
 */
import { describe, it, expect, vi } from 'vitest';
import { parallelLimit, delay, withRetry } from '../../utils/async';
import { skipIfNoConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('async 工具函数', () => {

  // ─── parallelLimit ─────────────────────────────────────

  describe('parallelLimit', () => {
    it('空任务列表应返回空数组', async () => {
      const results = await parallelLimit([], 3, async (x) => x);
      expect(results).toEqual([]);
    });

    it('应正确执行所有任务并返回结果', async () => {
      const tasks = [1, 2, 3, 4, 5];
      const results = await parallelLimit(tasks, 2, async (n) => n * 10);
      expect(results).toEqual([10, 20, 30, 40, 50]);
    });

    it('结果顺序应与任务顺序一致', async () => {
      const tasks = [3, 1, 2];
      const results = await parallelLimit(tasks, 1, async (n) => {
        await delay(n * 10);
        return n;
      });
      expect(results).toEqual([3, 1, 2]);
    });

    it('应限制并发数', async () => {
      let maxConcurrent = 0;
      let currentConcurrent = 0;
      const tasks = [1, 2, 3, 4, 5, 6];

      await parallelLimit(tasks, 2, async () => {
        currentConcurrent++;
        if (currentConcurrent > maxConcurrent) {
          maxConcurrent = currentConcurrent;
        }
        await delay(50);
        currentConcurrent--;
      });

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });

    it('limit=1 应串行执行', async () => {
      const order: number[] = [];
      const tasks = [1, 2, 3];
      await parallelLimit(tasks, 1, async (n) => {
        order.push(n);
        await delay(10);
        return n;
      });
      expect(order).toEqual([1, 2, 3]);
    });

    it('shouldStop 应阻止新任务启动', async () => {
      let count = 0;
      const tasks = [1, 2, 3, 4, 5];

      await parallelLimit(
        tasks,
        1,
        async (n) => {
          count++;
          await delay(10);
          return n;
        },
        { shouldStop: () => count >= 2 }
      );

      expect(count).toBeLessThanOrEqual(3); // 可能第 3 个已启动
    });

    it('任务抛异常应传播错误', async () => {
      const tasks = [1, 2, 3];
      await expect(
        parallelLimit(tasks, 2, async (n) => {
          if (n === 2) throw new Error('task 2 failed');
          return n;
        })
      ).rejects.toThrow('task 2 failed');
    });
  });

  // ─── delay ─────────────────────────────────────────────

  describe('delay', () => {
    it('应等待指定毫秒', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(80); // 允许一点误差
    });

    it('delay(0) 应立即解析', async () => {
      const start = Date.now();
      await delay(0);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50);
    });
  });

  // ─── withRetry ─────────────────────────────────────────

  describe('withRetry', () => {
    it('首次成功应直接返回', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      const result = await withRetry(fn, 3, 10);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('失败后重试并最终成功', async () => {
      let attempt = 0;
      const result = await withRetry(
        async () => {
          attempt++;
          if (attempt < 3) throw new Error('not yet');
          return 'done';
        },
        3,
        10
      );
      expect(result).toBe('done');
      expect(attempt).toBe(3);
    });

    it('超过最大重试次数应抛错', async () => {
      await expect(
        withRetry(
          async () => { throw new Error('always fails'); },
          2,
          10
        )
      ).rejects.toThrow('always fails');
    });

    it('shouldRetry 返回 false 应立即停止重试', async () => {
      let attempts = 0;
      await expect(
        withRetry(
          async () => {
            attempts++;
            throw new Error('fail');
          },
          5,
          10,
          (_err, attempt) => attempt < 1 // 只允许重试 1 次
        )
      ).rejects.toThrow('fail');
      expect(attempts).toBe(2); // 初始 + 1 次重试
    });

    it('重试应有指数退避延迟', async () => {
      const start = Date.now();
      let attempts = 0;

      await withRetry(
        async () => {
          attempts++;
          if (attempts < 3) throw new Error('retry');
          return 'ok';
        },
        3,
        50 // 基础延迟 50ms
      ).catch(() => {});

      const elapsed = Date.now() - start;
      // 第1次重试延迟 50ms，第2次延迟 100ms => 至少 ~150ms
      // 但因为第3次成功了，实际等待 50 + 100 = 150ms 左右
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });

    it('maxRetries=0 应不重试', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(withRetry(fn, 0, 10)).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
