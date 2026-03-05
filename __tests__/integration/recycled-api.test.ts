/**
 * RecycledApi 集成测试
 * 验证回收站列表、恢复、永久删除等操作
 * 所有操作仅针对测试自身创建并删除的文件
 * 跳过 recycleEmpty（清空整个回收站太危险）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  RecycleListByMarkerEnum,
  RecycleRestoreRestoreEnum,
} from '../../apis/recycled-api';
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

describe.skipIf(shouldSkip)('RecycledApi 集成测试', () => {
  let client: SMHClient;
  const testFilePath = uniquePath('recycle-test', '.txt');
  let recycledItemId: number | null = null;
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      const content = Buffer.from(`recycle test ${Date.now()}`);
      const file = createMockFile('recycle.txt', content);
      const uploader = client.createUploadTask({ file, filePath: testFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(1000);

      await client.file.deleteFile({ filePath: testFilePath });
      await sleep(1000);
    } catch (e: any) {
      console.log('RecycledApi 环境准备失败（可能 token 过期）:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    if (recycledItemId != null) {
      try {
        await client.recycled.recyclePurge({ recycledItemId });
      } catch { /* ignore */ }
    }
    try { await client.file.deleteFile({ filePath: testFilePath }); } catch { /* ignore */ }
  });

  describe('recycleList - 列出回收站', () => {
    it('应能列出回收站项目', async () => {
      assertSetupReady(setupFailed);
      const res = await client.recycled.recycleList({
        byMarker: RecycleListByMarkerEnum.NUMBER_1,
        limit: 50,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();

      const items = (res.data as any)?.contents || (res.data as any)?.data || [];
      expect(Array.isArray(items)).toBe(true);
      const found = items.find((item: any) =>
        item.path === testFilePath ||
        item.path?.includes(testFilePath) ||
        item.name?.includes('recycle-test')
      );
      expect(found).toBeDefined();
      recycledItemId = found?.recycledItemId || found?.id || null;
      expect(recycledItemId).not.toBeNull();
    });
  });

  describe('recycleRestore - 恢复回收站项目', () => {
    it('应能恢复回收站中的文件', async () => {
      assertSetupReady(setupFailed);
      expect(recycledItemId).not.toBeNull();

      const res = await client.recycled.recycleRestore({
        recycledItemId: recycledItemId as number,
        restore: RecycleRestoreRestoreEnum.NUMBER_1,
      });
      expect([200, 204]).toContain(res.status);

      await sleep(1000);

      try {
        await client.file.deleteFile({ filePath: testFilePath });
        recycledItemId = null;
      } catch { /* ignore */ }
    });
  });
});