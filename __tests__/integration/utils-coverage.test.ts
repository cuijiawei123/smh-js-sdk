/// <reference types="node" />
/**
 * 工具函数覆盖率补充测试
 * 覆盖：crc64（combineCRC64 各分支、calculateBlobCRC64 进度回调）、
 *       hash（sha256、beginningHash onProgress）、
 *       async（parallelLimit shouldStop 在 fn 内触发）
 */
import { describe, it, expect, vi } from 'vitest';
import {
  updateCRC64,
  finalizeCRC64,
  combineCRC64,
  combinePartsCRC64,
  calculateBlobCRC64,
  calculateBufferCRC64,
  CRC64_INIT_VALUE,
} from '../../utils/crc64';
import {
  calculateBeginningHash,
  calculateFullHash,
  sha256,
} from '../../utils/hash';
import { parallelLimit, delay, withRetry } from '../../utils/async';
import { skipIfNoConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('工具函数覆盖率补充', () => {

  // ─── crc64 补充 ────────────────────────────────────────

  describe('crc64 补充', () => {

    it('combineCRC64 当 len2=0 时应返回 crc1', () => {
      const crc1 = '12345678901234567';
      const result = combineCRC64(crc1, '999', 0);
      expect(result).toBe(crc1);
    });

    it('combineCRC64 正常合并两个分片的 CRC64', () => {
      const data1 = new Uint8Array([1, 2, 3, 4, 5]);
      const data2 = new Uint8Array([6, 7, 8, 9, 10]);

      // 分别计算
      const crc1Bigint = updateCRC64(CRC64_INIT_VALUE, data1);
      const crc1 = finalizeCRC64(crc1Bigint);

      const crc2Bigint = updateCRC64(CRC64_INIT_VALUE, data2);
      const crc2 = finalizeCRC64(crc2Bigint);

      // 合并
      const combined = combineCRC64(crc1, crc2, data2.length);

      // 完整计算
      const fullData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const fullCrc = calculateBufferCRC64(fullData.buffer);

      expect(combined).toBe(fullCrc);
    });

    it('combinePartsCRC64 空数组应返回初始值', () => {
      const result = combinePartsCRC64([]);
      expect(result).toBe(finalizeCRC64(CRC64_INIT_VALUE));
    });

    it('combinePartsCRC64 单个分片应返回该分片的 CRC64', () => {
      const data = new Uint8Array([1, 2, 3]);
      const crc = calculateBufferCRC64(data.buffer);
      const result = combinePartsCRC64([{ crc64: crc, size: 3 }]);
      expect(result).toBe(crc);
    });

    it('combinePartsCRC64 多个分片合并应等于完整数据的 CRC64', () => {
      const part1 = new Uint8Array(100);
      const part2 = new Uint8Array(200);
      const part3 = new Uint8Array(150);

      // 填充随机数据
      for (let i = 0; i < part1.length; i++) part1[i] = i % 256;
      for (let i = 0; i < part2.length; i++) part2[i] = (i * 3) % 256;
      for (let i = 0; i < part3.length; i++) part3[i] = (i * 7) % 256;

      const crc1 = calculateBufferCRC64(part1.buffer);
      const crc2 = calculateBufferCRC64(part2.buffer);
      const crc3 = calculateBufferCRC64(part3.buffer);

      const combined = combinePartsCRC64([
        { crc64: crc1, size: 100 },
        { crc64: crc2, size: 200 },
        { crc64: crc3, size: 150 },
      ]);

      // 拼接完整数据
      const full = new Uint8Array(450);
      full.set(part1, 0);
      full.set(part2, 100);
      full.set(part3, 300);
      const fullCrc = calculateBufferCRC64(full.buffer);

      expect(combined).toBe(fullCrc);
    });

    it('calculateBlobCRC64 应触发进度回调', async () => {
      const data = new Uint8Array(1024 * 1024 * 2); // 2MB
      for (let i = 0; i < data.length; i++) data[i] = i % 256;
      const blob = new Blob([data]);

      const progressValues: number[] = [];
      const crc = await calculateBlobCRC64(blob, (p) => {
        progressValues.push(p);
      });

      expect(crc).toBeDefined();
      expect(progressValues.length).toBeGreaterThan(0);
      // 最后一个进度应为 100
      expect(progressValues[progressValues.length - 1]).toBe(100);
      // 进度应单调递增
      for (let i = 1; i < progressValues.length; i++) {
        expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
      }
    });

    it('calculateBlobCRC64 无进度回调也应正常工作', async () => {
      const data = new Uint8Array([10, 20, 30, 40, 50]);
      const blob = new Blob([data]);
      const crc = await calculateBlobCRC64(blob);
      const expected = calculateBufferCRC64(data.buffer);
      expect(crc).toBe(expected);
    });

    it('updateCRC64 接受 ArrayBuffer 参数', () => {
      const data = new Uint8Array([1, 2, 3]).buffer;
      const crc = updateCRC64(CRC64_INIT_VALUE, data);
      expect(crc).toBeDefined();
    });
  });

  // ─── hash 补充 ─────────────────────────────────────────

  describe('hash 补充', () => {

    it('sha256 应计算 ArrayBuffer 的哈希', async () => {
      const data = new TextEncoder().encode('hello world');
      const hash = await sha256(data.buffer);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA256 hex 长度
      // 已知值验证
      expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    });

    it('calculateBeginningHash 应触发 onProgress 回调', async () => {
      const content = new Uint8Array(1024 * 100); // 100KB
      for (let i = 0; i < content.length; i++) content[i] = i % 256;
      const blob = new Blob([content]);
      const file = Object.assign(blob, {
        name: 'test.bin',
        lastModified: Date.now(),
      }) as unknown as File;

      let progressCalled = false;
      const hash = await calculateBeginningHash(file, content.length, (progress) => {
        progressCalled = true;
        expect(progress).toBe(100);
      });

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
      expect(progressCalled).toBe(true);
    });

    it('calculateFullHash 应对大文件分块链式计算', async () => {
      const size = 1024 * 1024 * 2 + 100; // 2MB + 100B，确保多块
      const content = new Uint8Array(size);
      for (let i = 0; i < size; i++) content[i] = (i * 13) % 256;
      const blob = new Blob([content]);
      const file = Object.assign(blob, {
        name: 'large.bin',
        lastModified: Date.now(),
      }) as unknown as File;

      const progressValues: number[] = [];
      const hash = await calculateFullHash(file, size, (progress) => {
        progressValues.push(progress);
      });

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
      expect(progressValues.length).toBeGreaterThan(1); // 多个块
      // 最后的进度应为 100
      expect(progressValues[progressValues.length - 1]).toBe(100);
    });

    it('calculateFullHash 对单块文件也应正常工作', async () => {
      const content = new Uint8Array(100);
      for (let i = 0; i < 100; i++) content[i] = i;
      const blob = new Blob([content]);
      const file = Object.assign(blob, {
        name: 'small.bin',
        lastModified: Date.now(),
      }) as unknown as File;

      const hash = await calculateFullHash(file, 100);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });

  // ─── async 补充 ────────────────────────────────────────

  describe('async 补充', () => {

    it('parallelLimit shouldStop 在任务执行中变为 true 应停止后续任务', async () => {
      let count = 0;
      let stopFlag = false;
      const tasks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const results = await parallelLimit(
        tasks,
        2,
        async (n) => {
          count++;
          if (count === 3) {
            stopFlag = true;
          }
          await delay(10);
          return n * 2;
        },
        { shouldStop: () => stopFlag }
      );

      // 被停止后不应执行所有 10 个任务
      expect(count).toBeLessThan(10);
      // 结果数组长度仍为 10（未执行的为 undefined）
      expect(results.length).toBe(10);
    });

    it('parallelLimit limit > tasks.length 应正常工作', async () => {
      const tasks = [1, 2];
      const results = await parallelLimit(tasks, 100, async (n) => n * 3);
      expect(results).toEqual([3, 6]);
    });

    it('withRetry 最后一次尝试成功应返回结果', async () => {
      let attempt = 0;
      const result = await withRetry(
        async () => {
          attempt++;
          if (attempt <= 3) throw new Error('not yet');
          return 'finally';
        },
        3, // maxRetries=3, 总共 4 次尝试（0,1,2,3）
        10
      );
      expect(result).toBe('finally');
      expect(attempt).toBe(4);
    });

    it('withRetry shouldRetry 控制重试行为', async () => {
      let attempts = 0;
      try {
        await withRetry(
          async () => {
            attempts++;
            throw new Error(`fail-${attempts}`);
          },
          10,
          10,
          (err, attempt) => {
            // 只在 attempt < 2 时重试
            return attempt < 2;
          }
        );
      } catch (e: any) {
        expect(e.message).toBe('fail-3');
      }
      expect(attempts).toBe(3); // 初始 + 2 次重试
    });
  });
});
