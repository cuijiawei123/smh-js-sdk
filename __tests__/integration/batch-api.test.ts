/**
 * BatchApi 集成测试
 * 验证批量复制、移动、删除操作
 * 所有写操作仅针对测试自身创建的文件
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { BatchCopyCopyEnum, BatchDeleteDeleteEnum, BatchMoveMoveEnum } from '../../apis/batch-api';
import {
  assertSetupReady,
  createMockFile,
  createTestClient,
  getTestRootDir,
  skipIfNoConfig,
  sleep,
  waitForUploadEnd,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('BatchApi 集成测试', () => {
  let client: SMHClient;
  const testDir = `${getTestRootDir()}/batch_${Date.now()}`;
  const filesToClean: string[] = [];
  const dirsToClean: string[] = [];
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }
    try {
      await client.directory.createDirectory({ filePath: testDir });
      dirsToClean.push(testDir);
    } catch (e: any) {
      console.log('BatchApi 环境准备失败（可能 token 过期）:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    for (const f of filesToClean) {
      try { await client.file.deleteFile({ filePath: f }); } catch { /* ignore */ }
    }
    for (const d of dirsToClean.reverse()) {
      try { await client.directory.deleteDirectory({ filePath: d }); } catch { /* ignore */ }
    }
  });

  async function uploadTestFile(filePath: string): Promise<void> {
    const content = Buffer.from(`batch test ${Date.now()} ${Math.random()}`);
    const file = createMockFile('test.txt', content);
    const uploader = client.createUploadTask({ file, filePath });
    filesToClean.push(filePath);
    const endPromise = waitForUploadEnd(uploader);
    uploader.start();
    await endPromise;
    await sleep(1000);
  }

  describe('batchCopy - 批量复制', () => {
    it('应能批量复制文件', async () => {
      assertSetupReady(setupFailed);
      const srcPath = `${testDir}/copy_src_${Date.now()}.txt`;
      const dstPath = `${testDir}/copy_dst_${Date.now()}.txt`;
      await uploadTestFile(srcPath);
      filesToClean.push(dstPath);

      const res = await client.batch.batchCopy({
        copy: BatchCopyCopyEnum.NUMBER_1,
        batchCopyRequest: [{ copyFrom: srcPath, to: dstPath }],
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('batchMove - 批量移动', () => {
    it('应能批量移动/重命名文件', async () => {
      assertSetupReady(setupFailed);
      const srcPath = `${testDir}/move_src_${Date.now()}.txt`;
      const dstPath = `${testDir}/move_dst_${Date.now()}.txt`;
      await uploadTestFile(srcPath);
      filesToClean.push(dstPath);

      const res = await client.batch.batchMove({
        move: BatchMoveMoveEnum.NUMBER_1,
        batchMoveRequest: [{ from: srcPath, to: dstPath }],
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      const idx = filesToClean.indexOf(srcPath);
      if (idx !== -1) filesToClean.splice(idx, 1);
    });
  });

  describe('batchDelete - 批量删除', () => {
    it('应能批量删除文件', async () => {
      assertSetupReady(setupFailed);
      const filePath = `${testDir}/delete_${Date.now()}.txt`;
      await uploadTestFile(filePath);

      const res = await client.batch.batchDelete({
        _delete: BatchDeleteDeleteEnum.NUMBER_1,
        batchDeleteRequest: [{ path: filePath }],
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      const idx = filesToClean.indexOf(filePath);
      if (idx !== -1) filesToClean.splice(idx, 1);
    });
  });
});