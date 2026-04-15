/**
 * ShareApi 补充集成测试
 * 覆盖搜索分享、marker 分页、withFileInfo 参数、排序等场景
 * 原 share-api.test.ts 已覆盖：创建、列表、详情、更新、启用/禁用、删除
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  GetShareDetailDetailEnum,
  ListSharesOrderByEnum,
  ListSharesOrderByTypeEnum,
  ListSharesWithFileInfoEnum,
} from '../../apis/share-api';
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

describe.skipIf(shouldSkip)('ShareApi 补充集成测试', () => {
  let client: SMHClient;
  const testFilePaths: string[] = [];
  const shareIds: string[] = [];
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      // Create multiple files and shares for testing pagination and search
      for (let i = 0; i < 3; i++) {
        const fp = uniquePath(`share_extra_${i}`, '.txt');
        testFilePaths.push(fp);
        const content = Buffer.from(`share extra content ${Date.now()} ${i}`);
        const file = createMockFile(`share_extra_${i}.txt`, content);
        const uploader = client.createUploadTask({ file, filePath: fp });
        const endPromise = waitForUploadEnd(uploader);
        uploader.start();
        await endPromise;
      }
      await sleep(1000);

      // Create shares for each file
      for (let i = 0; i < testFilePaths.length; i++) {
        const expireTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const res = await client.share.createShare({
          createShareRequest: {
            name: `sdk_extra_share_${Date.now()}_${i}`,
            filePath: [testFilePaths[i]],
            config: {
              isPermanent: false,
              expireTime,
              canPreview: true,
              canDownload: true,
            },
          },
        });
        const id = (res.data as any)?.id || (res.data as any)?.shareId;
        if (id) shareIds.push(id);
      }
      await sleep(1000);
    } catch (e: any) {
      console.log('ShareApi 补充测试环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    // Clean up shares
    for (const id of shareIds) {
      try { await client.share.deleteShare({ shareId: id }); } catch { /* ignore */ }
    }
    // Clean up files
    for (const fp of testFilePaths) {
      try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
    }
  });

  describe('listShares - marker 分页', () => {
    it('应支持 marker 翻页', async () => {
      assertSetupReady(setupFailed);
      const firstPage = await client.share.listShares({
        limit: 1,
      });
      expect(firstPage.status).toBe(200);

      const nextMarker = (firstPage.data as any)?.nextMarker;
      if (nextMarker) {
        const secondPage = await client.share.listShares({
          marker: nextMarker,
          limit: 1,
        });
        expect(secondPage.status).toBe(200);
      }
    });
  });

  describe('listShares - withFileInfo', () => {
    it('应支持返回文件信息', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.share.listShares({
          withFileInfo: ListSharesWithFileInfoEnum.NUMBER_1,
          limit: 5,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`withFileInfo 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });

  describe('listShares - 排序组合', () => {
    it('应支持按过期时间降序排列', async () => {
      assertSetupReady(setupFailed);
      const res = await client.share.listShares({
        orderBy: ListSharesOrderByEnum.ExpireTime,
        orderByType: ListSharesOrderByTypeEnum.Desc,
        limit: 10,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持按名称升序排列', async () => {
      assertSetupReady(setupFailed);
      const res = await client.share.listShares({
        orderBy: ListSharesOrderByEnum.Name,
        orderByType: ListSharesOrderByTypeEnum.Asc,
        limit: 10,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('searchShares - 搜索分享', () => {
    it('应能按名称搜索分享', async () => {
      assertSetupReady(setupFailed);
      const res = await client.share.searchShares({
        searchSharesRequest: {
          name: 'sdk_extra_share',
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持搜索分页', async () => {
      assertSetupReady(setupFailed);
      const res = await client.share.searchShares({
        limit: 1,
        searchSharesRequest: {
          name: 'sdk_extra_share',
        },
      });
      expect(res.status).toBe(200);

      const nextMarker = (res.data as any)?.nextMarker;
      if (nextMarker) {
        const secondPage = await client.share.searchShares({
          marker: nextMarker,
          limit: 1,
          searchSharesRequest: {
            name: 'sdk_extra_share',
          },
        });
        expect(secondPage.status).toBe(200);
      }
    });

    it('应支持按创建时间范围搜索', async () => {
      assertSetupReady(setupFailed);
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const res = await client.share.searchShares({
        searchSharesRequest: {
          createTimeStart: oneHourAgo,
          createTimeEnd: now.toISOString(),
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('getShareDetail - 补充场景', () => {
    it('应能获取多个分享的详情', async () => {
      assertSetupReady(setupFailed);
      for (const id of shareIds) {
        const res = await client.share.getShareDetail({
          shareId: id,
          detail: GetShareDetailDetailEnum.NUMBER_1,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      }
    });
  });

  describe('createShare - 带提取码', () => {
    let shareWithCodeId: string | undefined;

    afterAll(async () => {
      if (shareWithCodeId) {
        try { await client.share.deleteShare({ shareId: shareWithCodeId }); } catch { /* ignore */ }
      }
    });

    it('应能创建带提取码的分享', async () => {
      assertSetupReady(setupFailed);
      if (testFilePaths.length === 0) {
        console.log('跳过：无可用的测试文件');
        return;
      }

      const expireTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await client.share.createShare({
        createShareRequest: {
          name: `sdk_code_share_${Date.now()}`,
          filePath: [testFilePaths[0]],
          config: {
            isPermanent: false,
            expireTime,
            extractionCode: 'ab12',
            canPreview: true,
            canDownload: true,
          },
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      shareWithCodeId = (res.data as any)?.id || (res.data as any)?.shareId;
    });
  });

  describe('createShare - 永久有效', () => {
    let permanentShareId: string | undefined;

    afterAll(async () => {
      if (permanentShareId) {
        try { await client.share.deleteShare({ shareId: permanentShareId }); } catch { /* ignore */ }
      }
    });

    it('应能创建永久有效的分享', async () => {
      assertSetupReady(setupFailed);
      if (testFilePaths.length === 0) {
        console.log('跳过：无可用的测试文件');
        return;
      }

      const res = await client.share.createShare({
        createShareRequest: {
          name: `sdk_permanent_share_${Date.now()}`,
          filePath: [testFilePaths[0]],
          config: {
            isPermanent: true,
            canPreview: true,
            canDownload: false,
            canSaveToNetdisk: false,
          },
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      permanentShareId = (res.data as any)?.id || (res.data as any)?.shareId;
    });
  });
});
