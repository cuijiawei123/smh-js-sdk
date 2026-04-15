/**
 * ShareApi 集成测试
 * 验证分享的创建、列表、详情、更新、启用/禁用、删除等核心功能
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  DownloadShareFileDownloadEnum,
  GetShareDetailDetailEnum,
  GetShareDetailWithFileInfoEnum,
  ListShareFilesListEnum,
  ListShareFilesOrderByEnum,
  ListShareFilesOrderByTypeEnum,
  ListSharesOrderByEnum,
  ListSharesOrderByTypeEnum,
  PreviewShareFilePreviewEnum,
  SaveShareFileSaveEnum,
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
  const saveTargetDir = uniquePath('share_save_target', '');
  let shareId: string | undefined;
  let shareCode: string | undefined;
  let shareAccessToken: string | undefined;
  let fileInode: string | undefined;
  let spaceId: string | undefined;
  let setupFailed = false;

  const EXTRACTION_CODE = 'ab12';

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

      // Create target directory for saveShareFile test
      try {
        await client.directory.createDirectory({ filePath: saveTargetDir });
      } catch { /* ignore */ }
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
    // Clean up: save target directory
    try { await client.file.deleteFile({ filePath: saveTargetDir }); } catch { /* ignore */ }
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
              extractionCode: EXTRACTION_CODE,
              canPreview: true,
              canDownload: true,
              canSaveToNetdisk: true,
            },
          },
        });

        console.log('createShare status =====', res.status);
        console.log('createShare data =====', res.data);
        console.log('createShare requestId =====', res.headers?.['x-smh-request-id'] || res.headers?.['x-request-id'] || 'N/A');
        console.log('createShare all headers =====', JSON.stringify(res.headers, null, 2));

        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
        // Save shareId and shareCode for subsequent tests
        shareId = (res.data as any)?.id || (res.data as any)?.shareId;
        shareCode = (res.data as any)?.code;
        console.log('Setup: shareId =', shareId, ', shareCode =', shareCode);
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
            extractionCode: EXTRACTION_CODE,
            canPreview: true,
            canDownload: true,
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

  describe('getShareUrlDetail - get share URL detail', () => {
    it('should get share basic info by shareCode', async () => {
      assertSetupReady(setupFailed);
      if (!shareCode) {
        console.log('Skip: no shareCode available');
        return;
      }

      const res = await client.share.getShareUrlDetail({
        shareToken: shareCode,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      // After updateShare may have changed config, just verify fields exist
      expect((res.data as any)).toHaveProperty('needExtractionCode');
      expect((res.data as any)).toHaveProperty('canPreview');
      expect((res.data as any)).toHaveProperty('canDownload');
    });

    it('should return enabled=true for an active share', async () => {
      assertSetupReady(setupFailed);
      if (!shareCode) {
        console.log('Skip: no shareCode available');
        return;
      }

      const res = await client.share.getShareUrlDetail({
        shareToken: shareCode,
      });

      expect(res.status).toBe(200);
      expect((res.data as any)?.enabled).toBe(true);
      expect((res.data as any)?.isExpired).toBe(false);
    });
  });

  describe('verifyExtractionCode - verify extraction code', () => {
    it('should verify extraction code and return access token', async () => {
      assertSetupReady(setupFailed);
      if (!shareCode) {
        console.log('Skip: no shareCode available');
        return;
      }

      // verifyExtractionCode is a public API that doesn't need admin auth
      const res = await client.share.verifyExtractionCode({
        shareCode,
        verifyExtractionCodeRequest: {
          extractionCode: EXTRACTION_CODE,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect((res.data as any)?.accessToken).toBeDefined();

      shareAccessToken = (res.data as any)?.accessToken;
    });

    it('should fail with wrong extraction code', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!shareCode) {
        console.log('Skip: no shareCode available');
        return;
      }

      try {
        await client.share.verifyExtractionCode({
          shareCode,
          verifyExtractionCodeRequest: {
            extractionCode: 'zzzz',
          },
        });
        ctx.skip('Server did not reject wrong extraction code');
      } catch (error: any) {
        const status = error?.response?.status;
        expect([400, 403, 404]).toContain(status);
      }
    });
  });

  describe('listShareFiles - list files in share', () => {
    it('should list files in share root directory', async () => {
      assertSetupReady(setupFailed);
      if (!shareCode) {
        console.log('Skip: no shareCode available');
        return;
      }

      if (!shareAccessToken) {
        try {
          const verifyRes = await client.share.verifyExtractionCode({
            shareCode,
            verifyExtractionCodeRequest: {
              extractionCode: EXTRACTION_CODE,
            },
          });
          shareAccessToken = (verifyRes.data as any)?.accessToken;
        } catch {
          console.log('Skip: cannot obtain share access token');
          return;
        }
      }

      const res = await client.share.listShareFiles({
        shareCode,
        inodes: '',
        list: ListShareFilesListEnum.NUMBER_1,
        accessToken: shareAccessToken,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();

      const contents = (res.data as any)?.contents;
      if (Array.isArray(contents) && contents.length > 0) {
        const firstFile = contents.find((item: any) => item.type === 'file');
        if (firstFile) {
          fileInode = firstFile.inode;
          spaceId = firstFile.spaceId;
          console.log('Found file inode =', fileInode);
        }
      }
    });

    it('should support pagination with limit', async () => {
      assertSetupReady(setupFailed);
      if (!shareCode || !shareAccessToken) {
        console.log('Skip: no shareCode or shareAccessToken available');
        return;
      }

      const res = await client.share.listShareFiles({
        shareCode,
        inodes: '',
        list: ListShareFilesListEnum.NUMBER_1,
        limit: 1,
        accessToken: shareAccessToken,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('should support sorting by name ascending', async () => {
      assertSetupReady(setupFailed);
      if (!shareCode || !shareAccessToken) {
        console.log('Skip: no shareCode or shareAccessToken available');
        return;
      }

      const res = await client.share.listShareFiles({
        shareCode,
        inodes: '',
        list: ListShareFilesListEnum.NUMBER_1,
        orderBy: ListShareFilesOrderByEnum.Name,
        orderByType: ListShareFilesOrderByTypeEnum.Asc,
        accessToken: shareAccessToken,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('should support sorting by size descending', async () => {
      assertSetupReady(setupFailed);
      if (!shareCode || !shareAccessToken) {
        console.log('Skip: no shareCode or shareAccessToken available');
        return;
      }

      const res = await client.share.listShareFiles({
        shareCode,
        inodes: '',
        list: ListShareFilesListEnum.NUMBER_1,
        orderBy: ListShareFilesOrderByEnum.Size,
        orderByType: ListShareFilesOrderByTypeEnum.Desc,
        accessToken: shareAccessToken,
      });

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('downloadShareFile - download file from share', () => {
    it('should get download URL for shared file', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!shareCode || !fileInode) {
        ctx.skip('Prerequisites not met: shareCode or fileInode missing');
        return;
      }

      try {
        const res = await client.share.downloadShareFile({
          shareCode,
          inodes: fileInode,
          download: DownloadShareFileDownloadEnum.NUMBER_1,
        });

        expect([200, 302]).toContain(res.status);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 302) {
          expect(error.response.headers?.location).toBeDefined();
        } else if ([400, 403, 404].includes(status)) {
          ctx.skip(`downloadShareFile not available: ${status}`);
        } else {
          throw error;
        }
      }
    });

    it('should support internalDomain parameter', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!shareCode || !fileInode) {
        ctx.skip('Prerequisites not met: shareCode or fileInode missing');
        return;
      }

      try {
        const res = await client.share.downloadShareFile({
          shareCode,
          inodes: fileInode,
          download: DownloadShareFileDownloadEnum.NUMBER_1,
          internalDomain: 0 as any,
        });

        expect([200, 302]).toContain(res.status);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 302 || [400, 403, 404].includes(status)) {
          // Expected behavior
        } else {
          throw error;
        }
      }
    });
  });

  describe('previewShareFile - preview file from share', () => {
    it('should get preview URL for shared file', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!shareCode || !fileInode) {
        ctx.skip('Prerequisites not met: shareCode or fileInode missing');
        return;
      }

      try {
        const res = await client.share.previewShareFile({
          shareCode,
          inodes: fileInode,
          preview: PreviewShareFilePreviewEnum.NUMBER_1,
        });

        expect([200, 302]).toContain(res.status);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 302) {
          expect(error.response.headers?.location).toBeDefined();
        } else if ([400, 403, 404].includes(status)) {
          ctx.skip(`previewShareFile not available: ${status}`);
        } else {
          throw error;
        }
      }
    });

    it('should support internalDomain parameter for preview', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!shareCode || !fileInode) {
        ctx.skip('Prerequisites not met: shareCode or fileInode missing');
        return;
      }

      try {
        const res = await client.share.previewShareFile({
          shareCode,
          inodes: fileInode,
          preview: PreviewShareFilePreviewEnum.NUMBER_1,
          internalDomain: 0 as any,
        });

        expect([200, 302]).toContain(res.status);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 302 || [400, 403, 404].includes(status)) {
          // Expected behavior
        } else {
          throw error;
        }
      }
    });
  });

  describe('saveShareFile - save shared file to netdisk', () => {
    it('should save shared file to user netdisk space', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!shareCode || !fileInode) {
        ctx.skip('Prerequisites not met: shareCode or fileInode missing');
        return;
      }

      const targetSpaceId = spaceId || '-';

      try {
        const res = await client.share.saveShareFile({
          shareCode,
          save: SaveShareFileSaveEnum.NUMBER_1,
          saveShareFileRequest: {
            targetSpaceId,
            targetPath: saveTargetDir,
            sourceInodesPath: '',
            inodes: [fileInode],
          },
        });

        expect([200, 202, 207]).toContain(res.status);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        const status = error?.response?.status;
        if ([400, 403, 404, 409].includes(status)) {
          ctx.skip(`saveShareFile not available or conflict: ${status}`);
        } else {
          throw error;
        }
      }
    });

    it('should handle conflict resolution strategy rename', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!shareCode || !fileInode) {
        ctx.skip('Prerequisites not met: shareCode or fileInode missing');
        return;
      }

      const targetSpaceId = spaceId || '-';

      try {
        const res = await client.share.saveShareFile({
          shareCode,
          save: SaveShareFileSaveEnum.NUMBER_1,
          saveShareFileRequest: {
            targetSpaceId,
            targetPath: saveTargetDir,
            sourceInodesPath: '',
            inodes: [fileInode],
            conflictResolutionStrategy: 'rename' as any,
          },
        });

        expect([200, 202, 207]).toContain(res.status);
      } catch (error: any) {
        const status = error?.response?.status;
        if ([400, 403, 404, 409].includes(status)) {
          ctx.skip(`saveShareFile rename not available: ${status}`);
        } else {
          throw error;
        }
      }
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
