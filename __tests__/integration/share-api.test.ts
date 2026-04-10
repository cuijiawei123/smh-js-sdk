/**
 * ShareApi 集成测试
 * 验证分享的创建、列表、详情、更新、启用/禁用、删除等核心功能
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  GetShareDetailDetailEnum,
  GetShareDetailWithFileInfoEnum,
  ListSharesOrderByEnum,
  ListSharesOrderByTypeEnum,
  SetShareEnabledSetEnabledEnum,
  UpdateShareUpdateEnum,
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

describe.skipIf(shouldSkip)('ShareApi 集成测试', () => {
  let client: SMHClient;
  const testFilePath = uniquePath('share_test', '.txt');
  let shareId: string | undefined;
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      // Upload a test file to share
      const content = Buffer.from(`share test content ${Date.now()}`);
      const file = createMockFile('share_test.txt', content);
      const uploader = client.createUploadTask({ file, filePath: testFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(1000);
    } catch (e: any) {
      console.log('ShareApi 环境准备失败（可能 token 过期）:', e.message);
      // Don't block createShare test, let it try anyway
      // setupFailed = true;
    }
  });

  afterAll(async () => {
    // Clean up: delete share if created
    if (shareId) {
      try { await client.share.deleteShare({ shareId }); } catch { /* ignore */ }
    }
    // Clean up: delete test file
    try { await client.file.deleteFile({ filePath: testFilePath }); } catch { /* ignore */ }
  });

  describe('createShare - 创建分享', () => {
    it('应能创建文件分享链接', async () => {
      assertSetupReady(setupFailed);
      const expireTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      try {
        const res = await client.share.createShare({
          createShareRequest: {
            name: `sdk_test_share_${Date.now()}`,
            filePath: [testFilePath],
            config: {
              isPermanent: false,
              expireTime,
              canPreview: true,
              canDownload: true,
            },
          },
        });

        console.log('createShare status =====', res.status);
        console.log('createShare data =====', res.data);
        console.log('createShare requestId =====', res.headers?.['x-smh-request-id'] || res.headers?.['x-request-id'] || 'N/A');
        console.log('createShare all headers =====', JSON.stringify(res.headers, null, 2));

        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
        // Save shareId for subsequent tests
        shareId = (res.data as any)?.id || (res.data as any)?.shareId;
      } catch (error: any) {
        const resp = error?.response;
        console.log('createShare error status =====', resp?.status);
        console.log('createShare error data =====', resp?.data);
        console.log('createShare error requestId =====', resp?.headers?.['x-smh-request-id'] || resp?.headers?.['x-request-id'] || 'N/A');
        console.log('createShare error all headers =====', JSON.stringify(resp?.headers, null, 2));
        throw error;
      }
    });
  });

  describe('listShares - 列出分享列表', () => {
    it('应能列出分享列表', async () => {
      assertSetupReady(setupFailed);
      const res = await client.share.listShares({});

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持分页参数', async () => {
      assertSetupReady(setupFailed);
      const res = await client.share.listShares({
        limit: 5,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持排序参数', async () => {
      assertSetupReady(setupFailed);
      const res = await client.share.listShares({
        orderBy: ListSharesOrderByEnum.CreateTime,
        orderByType: ListSharesOrderByTypeEnum.Desc,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('getShareDetail - 获取分享详情', () => {
    it('应能获取分享详情', async () => {
      assertSetupReady(setupFailed);
      if (!shareId) {
        console.log('跳过：无可用的 shareId');
        return;
      }

      const res = await client.share.getShareDetail({
        shareId,
        detail: GetShareDetailDetailEnum.NUMBER_1,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持返回文件信息', async () => {
      assertSetupReady(setupFailed);
      if (!shareId) {
        console.log('跳过：无可用的 shareId');
        return;
      }

      const res = await client.share.getShareDetail({
        shareId,
        detail: GetShareDetailDetailEnum.NUMBER_1,
        withFileInfo: GetShareDetailWithFileInfoEnum.NUMBER_1,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('updateShare - 更新分享', () => {
    it('应能更新分享设置', async () => {
      assertSetupReady(setupFailed);
      if (!shareId) {
        console.log('跳过：无可用的 shareId');
        return;
      }

      const newExpireTime = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const res = await client.share.updateShare({
        shareId,
        update: UpdateShareUpdateEnum.NUMBER_1,
        updateShareRequest: {
          name: `sdk_test_share_updated_${Date.now()}`,
          config: {
            isPermanent: false,
            expireTime: newExpireTime,
            canPreview: true,
            canDownload: false,
          },
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('setShareEnabled - 启用/禁用分享', () => {
    it('应能禁用分享', async () => {
      assertSetupReady(setupFailed);
      if (!shareId) {
        console.log('跳过：无可用的 shareId');
        return;
      }

      const res = await client.share.setShareEnabled({
        shareId,
        setEnabled: SetShareEnabledSetEnabledEnum.NUMBER_1,
        setShareEnabledRequest: {
          ownerEnabled: false,
        },
      });

      expect(res.status).toBe(204);
    });

    it('应能重新启用分享', async () => {
      assertSetupReady(setupFailed);
      if (!shareId) {
        console.log('跳过：无可用的 shareId');
        return;
      }

      const res = await client.share.setShareEnabled({
        shareId,
        setEnabled: SetShareEnabledSetEnabledEnum.NUMBER_1,
        setShareEnabledRequest: {
          ownerEnabled: true,
        },
      });

      expect(res.status).toBe(204);
    });
  });

  describe('deleteShare - 删除分享', () => {
    it('应能删除分享', async () => {
      assertSetupReady(setupFailed);
      if (!shareId) {
        console.log('跳过：无可用的 shareId');
        return;
      }

      const res = await client.share.deleteShare({
        shareId,
      });

      expect(res.status).toBe(204);
      // Clear shareId so afterAll won't try to delete again
      shareId = undefined;
    });
  });
});
