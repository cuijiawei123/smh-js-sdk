/**
 * RecentApi 集成测试
 * 验证最近使用文件列表查询
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  createTestClient,
  skipIfNoConfig,
} from './helpers';

const shouldSkip = skipIfNoConfig();

function skipOnForbidden(ctx: any, error: any, action: string): never {
  if (error?.response?.status === 403) {
    ctx.skip(`缺少权限：${action}`);
  }
  throw error;
}

describe.skipIf(shouldSkip)('RecentApi 集成测试', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  it('应能查询最近使用文件列表', async (ctx: any) => {
    try {
      const res = await client.recent.listRecentlyUsedFile({});
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    } catch (error: any) {
      skipOnForbidden(ctx, error, '查询最近使用文件列表');
    }
  });

  it('应支持传入请求体参数', async (ctx: any) => {
    try {
      const res = await client.recent.listRecentlyUsedFile({
        listRecentlyUsedFileRequest: {
          limit: 5,
          withPath: true,
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    } catch (error: any) {
      skipOnForbidden(ctx, error, '查询最近使用文件列表（带参数）');
    }
  });
});
