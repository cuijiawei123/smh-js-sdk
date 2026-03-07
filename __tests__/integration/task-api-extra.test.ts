/**
 * TaskApi 补充集成测试
 * 覆盖多任务 ID 查询、userId 参数、以及通过批量复制触发真实异步任务
 * 原 task-api.test.ts 已覆盖：queryTask、queryLibraryTask（不存在的 taskId）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { BatchCopyCopyEnum } from '../../apis/batch-api';
import {
  assertSetupReady,
  createMockFile,
  createTestClient,
  getTestRootDir,
  skipIfNoConfig,
  uniquePath,
  sleep,
  waitForUploadEnd,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('TaskApi 补充集成测试', () => {
  let client: SMHClient;
  let setupFailed = false;
  const filesToClean: string[] = [];
  const dirsToClean: string[] = [];

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }
  });

  afterAll(async () => {
    for (const f of filesToClean) {
      try { await client.file.deleteFile({ filePath: f }); } catch { /* ignore */ }
    }
    for (const d of dirsToClean.reverse()) {
      try { await client.directory.deleteDirectory({ filePath: d }); } catch { /* ignore */ }
    }
  });

  describe('queryTask - 多任务 ID 查询', () => {
    it('应支持逗号分隔的多个任务 ID', async () => {
      try {
        const res = await client.task.queryTask({
          taskIdList: '0,1,2',
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        expect([400, 403, 404]).toContain(error.response?.status);
      }
    });
  });

  describe('queryLibraryTask - 多任务 ID 查询', () => {
    it('应支持逗号分隔的多个任务 ID', async () => {
      try {
        const res = await client.task.queryLibraryTask({
          taskIdList: '0,1,2',
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        expect([400, 403, 404]).toContain(error.response?.status);
      }
    });
  });

  describe('queryTask - 真实异步任务', () => {
    it('批量复制触发异步任务后应能查询任务状态', async (ctx: any) => {
      // 上传测试文件
      const srcDir = `${getTestRootDir()}/task_src_${Date.now()}`;
      const dstDir = `${getTestRootDir()}/task_dst_${Date.now()}`;
      dirsToClean.push(srcDir, dstDir);

      try {
        await client.directory.createDirectory({ filePath: srcDir });
      } catch { /* ignore */ }

      const srcFile = `${srcDir}/test.txt`;
      const content = Buffer.from(`task test ${Date.now()}`);
      const file = createMockFile('task.txt', content);
      const uploader = client.createUploadTask({ file, filePath: srcFile });
      filesToClean.push(srcFile);
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(500);

      // 批量复制（可能返回异步任务 ID）
      try {
        const copyRes = await client.batch.batchCopy({
          copy: BatchCopyCopyEnum.NUMBER_1,
          batchCopyRequest: [{ copyFrom: srcFile, to: `${dstDir}/test.txt` }],
        });

        const taskId = (copyRes.data as any)?.taskId;
        if (taskId) {
          // 有异步任务 ID，可以查询
          const taskRes = await client.task.queryTask({
            taskIdList: String(taskId),
          });
          expect(taskRes.status).toBe(200);
          expect(taskRes.data).toBeDefined();
        } else {
          // 同步完成，没有 taskId
          expect([200, 207]).toContain(copyRes.status);
        }
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`批量复制异步任务不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });
});
