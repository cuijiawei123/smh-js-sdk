/**
 * SearchApi 补充集成测试
 * 覆盖 marker 分页、withFavoriteStatus 参数
 * 原 search-api.test.ts 已覆盖：基本搜索、按类型筛选、limit 参数
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { SearchFsWithFavoriteStatusEnum } from '../../apis/search-api';
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

describe.skipIf(shouldSkip)('SearchApi 补充集成测试', () => {
  let client: SMHClient;
  const searchKeyword = `sdkextra${Date.now()}`;
  const testFilePaths: string[] = [];
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      // 创建几个文件用于搜索
      for (let i = 0; i < 3; i++) {
        const fp = uniquePath(`search_${searchKeyword}_${i}`, '.txt');
        testFilePaths.push(fp);
        const content = Buffer.from(`search extra content ${searchKeyword} ${i}`);
        const file = createMockFile(`${searchKeyword}_${i}.txt`, content);
        const uploader = client.createUploadTask({ file, filePath: fp });
        const endPromise = waitForUploadEnd(uploader);
        uploader.start();
        await endPromise;
      }
      await sleep(3000); // 等待索引
    } catch (e: any) {
      console.log('SearchApi 补充测试环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    for (const fp of testFilePaths) {
      try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
    }
  });

  describe('searchFs - marker 分页', () => {
    it('应支持 marker 翻页', async () => {
      assertSetupReady(setupFailed);
      const firstPage = await client.search.searchFs({
        limit: 1,
        searchFsRequest: {
          keyword: [searchKeyword],
        },
      });
      expect(firstPage.status).toBe(200);

      const nextMarker = (firstPage.data as any)?.nextMarker;
      if (nextMarker) {
        const secondPage = await client.search.searchFs({
          marker: nextMarker,
          limit: 1,
          searchFsRequest: {
            keyword: [searchKeyword],
          },
        });
        expect(secondPage.status).toBe(200);
      }
    });
  });

  describe('searchFs - withFavoriteStatus', () => {
    it('应支持返回收藏状态', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.search.searchFs({
          withFavoriteStatus: SearchFsWithFavoriteStatusEnum.NUMBER_1,
          searchFsRequest: {
            keyword: [searchKeyword],
          },
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`withFavoriteStatus 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });

  describe('searchFs - userId 参数', () => {
    it('应支持显式传入 userId', async () => {
      assertSetupReady(setupFailed);
      const userId = process.env.SMH_USER_ID;
      const res = await client.search.searchFs({
        userId,
        searchFsRequest: {
          keyword: [searchKeyword],
        },
      });
      expect(res.status).toBe(200);
    });
  });
});
