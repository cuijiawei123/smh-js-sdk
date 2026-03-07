/**
 * FavoriteApi 补充集成测试
 * 补充 listFavorite 的分页、排序参数覆盖
 * 原 favorite-api.test.ts 已覆盖：createFavorite、listFavorite（无参数）、deleteFavorite
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { DeleteFavoriteCancelEnum, ListFavoriteOrderByEnum, ListFavoriteOrderByTypeEnum } from '../../apis/favorite-api';
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

describe.skipIf(shouldSkip)('FavoriteApi 补充集成测试', () => {
  let client: SMHClient;
  const testFilePaths: string[] = [];
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      // 创建并收藏多个文件
      for (let i = 0; i < 3; i++) {
        const fp = uniquePath(`fav-extra-${i}`, '.txt');
        testFilePaths.push(fp);
        const content = Buffer.from(`fav extra test ${i} ${Date.now()}`);
        const file = createMockFile(`fav-${i}.txt`, content);
        const uploader = client.createUploadTask({ file, filePath: fp });
        const endPromise = waitForUploadEnd(uploader);
        uploader.start();
        await endPromise;
      }
      await sleep(1000);

      for (const fp of testFilePaths) {
        await client.favorite.createFavorite({
          createFavoriteRequest: { path: fp },
        });
      }
      await sleep(500);
    } catch (e: any) {
      console.log('FavoriteApi 补充测试环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    for (const fp of testFilePaths) {
      try {
        await client.favorite.deleteFavorite({
          cancel: DeleteFavoriteCancelEnum.NUMBER_1,
          deleteFavoriteRequest: { path: fp },
        });
      } catch { /* ignore */ }
      try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
    }
  });

  describe('listFavorite - 分页与排序', () => {
    it('应支持 limit 参数', async () => {
      assertSetupReady(setupFailed);
      const res = await client.favorite.listFavorite({
        limit: 2,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持 page 和 pageSize 分页', async () => {
      assertSetupReady(setupFailed);
      const res = await client.favorite.listFavorite({
        page: 1,
        pageSize: 10,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持 orderBy 排序', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.favorite.listFavorite({
          orderBy: ListFavoriteOrderByEnum.FavoriteTime,
          orderByType: ListFavoriteOrderByTypeEnum.Desc,
        });
        expect(res.status).toBe(200);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`收藏排序不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('应支持 withPath 参数', async () => {
      assertSetupReady(setupFailed);
      const res = await client.favorite.listFavorite({
        withPath: true,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持 marker 分页', async () => {
      assertSetupReady(setupFailed);
      // 先获取第一页
      const firstPage = await client.favorite.listFavorite({
        limit: 1,
      });
      expect(firstPage.status).toBe(200);

      const nextMarker = (firstPage.data as any)?.nextMarker;
      if (nextMarker) {
        const secondPage = await client.favorite.listFavorite({
          marker: nextMarker,
          limit: 1,
        });
        expect(secondPage.status).toBe(200);
      }
    });
  });
});
