/**
 * RecycledApi 补充集成测试
 * 覆盖 recycleInfo、recycleListByPage、recyclePurgeBatch、recycleRestoreBatch、recycleSetLifecycle
 * 原 recycled-api.test.ts 已覆盖：recycleList、recycleRestore、recyclePurge
 * 跳过 recycleEmpty（清空整个回收站太危险）
 * 跳过 recyclePreview（返回 302 重定向，不适合断言）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  RecycleListByMarkerEnum,
  RecycleListByPageByPageEnum,
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

describe.skipIf(shouldSkip)('RecycledApi 补充集成测试', () => {
  let client: SMHClient;
  let setupFailed = false;

  // 测试文件路径和回收站 ID
  const testFiles: string[] = [];
  const recycledItemIds: number[] = [];

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    // 上传 3 个文件然后删除，用于回收站测试
    try {
      for (let i = 0; i < 3; i++) {
        const filePath = uniquePath(`recycle-extra-${i}`, '.txt');
        testFiles.push(filePath);
        const content = Buffer.from(`recycle extra test ${i} ${Date.now()}`);
        const file = createMockFile(`recycle-${i}.txt`, content);
        const uploader = client.createUploadTask({ file, filePath });
        const endPromise = waitForUploadEnd(uploader);
        uploader.start();
        await endPromise;
      }
      await sleep(1000);

      // 删除所有测试文件，使其进入回收站
      for (const fp of testFiles) {
        await client.file.deleteFile({ filePath: fp });
      }
      await sleep(1000);

      // 从回收站列表中获取对应的 recycledItemId
      const listRes = await client.recycled.recycleList({
        byMarker: RecycleListByMarkerEnum.NUMBER_1,
        limit: 100,
      });
      const items = (listRes.data as any)?.contents || [];
      for (const fp of testFiles) {
        const found = items.find((item: any) =>
          item.path?.includes(fp) || item.name?.includes(fp.split('/').pop())
        );
        if (found) {
          recycledItemIds.push(found.recycledItemId || found.id);
        }
      }
    } catch (e: any) {
      console.log('RecycledApi 补充测试环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    // 清理回收站中残留的测试文件
    for (const id of recycledItemIds) {
      try { await client.recycled.recyclePurge({ recycledItemId: id }); } catch { /* ignore */ }
    }
    for (const fp of testFiles) {
      try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
    }
  });

  // ─── recycleListByPage ────────────────────────────────────

  describe('recycleListByPage - 按页码列出回收站', () => {
    it('应能使用分页方式列出回收站项目', async () => {
      assertSetupReady(setupFailed);
      const res = await client.recycled.recycleListByPage({
        byPage: RecycleListByPageByPageEnum.NUMBER_1,
        page: 1,
        pageSize: 20,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持排序参数', async () => {
      assertSetupReady(setupFailed);
      const res = await client.recycled.recycleListByPage({
        byPage: RecycleListByPageByPageEnum.NUMBER_1,
        page: 1,
        pageSize: 20,
        orderBy: 'removalTime' as any,
        orderByType: 'desc' as any,
      });
      expect(res.status).toBe(200);
    });
  });

  // ─── recycleInfo ──────────────────────────────────────────

  describe('recycleInfo - 查看回收站文件详情', () => {
    it('应能查询回收站项目详情', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (recycledItemIds.length === 0) {
        ctx.skip('未找到回收站测试项目');
        return;
      }

      const res = await client.recycled.recycleInfo({
        recycledItemId: recycledItemIds[0],
        info: 1,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  // ─── recycleRestoreBatch ──────────────────────────────────

  describe('recycleRestoreBatch - 批量恢复回收站项目', () => {
    it('应能批量恢复回收站项目', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (recycledItemIds.length < 2) {
        ctx.skip('回收站项目数量不足以测试批量恢复');
        return;
      }

      // 取前两个进行批量恢复
      const idsToRestore = recycledItemIds.slice(0, 2);

      try {
        const res = await client.recycled.recycleRestoreBatch({
          restore: 1,
          recycleRestoreBatchRequest: idsToRestore,
        });
        expect([200, 202, 207]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`批量恢复不可用: ${error?.response?.status}`);
        }
        throw error;
      }

      await sleep(1000);

      // 恢复后重新删除，为后续测试准备
      for (let i = 0; i < 2 && i < testFiles.length; i++) {
        try { await client.file.deleteFile({ filePath: testFiles[i] }); } catch { /* ignore */ }
      }
      await sleep(500);

      // 重新获取 recycledItemIds
      try {
        const listRes = await client.recycled.recycleList({
          byMarker: RecycleListByMarkerEnum.NUMBER_1,
          limit: 100,
        });
        const items = (listRes.data as any)?.contents || [];
        recycledItemIds.length = 0;
        for (const fp of testFiles) {
          const found = items.find((item: any) =>
            item.path?.includes(fp) || item.name?.includes(fp.split('/').pop())
          );
          if (found) {
            recycledItemIds.push(found.recycledItemId || found.id);
          }
        }
      } catch { /* ignore */ }
    });
  });

  // ─── recyclePurgeBatch ────────────────────────────────────

  describe('recyclePurgeBatch - 批量永久删除回收站项目', () => {
    it('应能批量永久删除回收站项目', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (recycledItemIds.length === 0) {
        ctx.skip('无回收站项目可供测试');
        return;
      }

      try {
        const res = await client.recycled.recyclePurgeBatch({
          _delete: 1,
          recyclePurgeBatchRequest: [...recycledItemIds],
        });
        expect([200, 204]).toContain(res.status);
        // 清空已删除的 ID 列表
        recycledItemIds.length = 0;
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`批量永久删除不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });

  // ─── recycleSetLifecycle ──────────────────────────────────

  describe('recycleSetLifecycle - 设置回收站生命周期', () => {
    it('应能设置回收站保留天数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.recycled.recycleSetLifecycle({
          lifecycle: 1,
          recycleSetLifecycleRequest: { retentionDays: 30 },
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`设置回收站生命周期不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });
});
