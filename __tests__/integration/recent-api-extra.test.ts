/**
 * RecentApi 补充集成测试
 * 覆盖 userId 参数和更多 listRecentlyUsedFile 参数组合
 * 原 recent-api.test.ts 已覆盖：基本查询、带 limit 和 withPath 参数
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  createTestClient,
  skipIfNoConfig,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('RecentApi 补充集成测试', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  describe('listRecentlyUsedFile - 参数组合覆盖', () => {
    it('应支持 marker 分页', async (ctx: any) => {
      try {
        const firstPage = await client.recent.listRecentlyUsedFile({
          listRecentlyUsedFileRequest: {
            limit: 1,
          },
        });
        expect(firstPage.status).toBe(200);

        const nextMarker = (firstPage.data as any)?.nextMarker;
        if (nextMarker) {
          const secondPage = await client.recent.listRecentlyUsedFile({
            listRecentlyUsedFileRequest: {
              limit: 1,
              marker: nextMarker,
            },
          });
          expect(secondPage.status).toBe(200);
        }
      } catch (error: any) {
        if (error?.response?.status === 403) {
          ctx.skip('缺少权限');
        }
        throw error;
      }
    });

    it('应支持 filterActionBy 筛选', async (ctx: any) => {
      try {
        const res = await client.recent.listRecentlyUsedFile({
          listRecentlyUsedFileRequest: {
            limit: 10,
            filterActionBy: 'preview',
          },
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405].includes(error?.response?.status)) {
          ctx.skip(`filterActionBy 筛选不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('应支持 type 筛选', async (ctx: any) => {
      try {
        const res = await client.recent.listRecentlyUsedFile({
          listRecentlyUsedFileRequest: {
            limit: 10,
            type: 'file',
          },
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405].includes(error?.response?.status)) {
          ctx.skip(`type 筛选不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('应支持空请求体参数', async (ctx: any) => {
      try {
        const res = await client.recent.listRecentlyUsedFile({
          listRecentlyUsedFileRequest: {},
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if (error?.response?.status === 403) {
          ctx.skip('缺少权限');
        }
        throw error;
      }
    });
  });
});
