/**
 * TokenApi 集成测试
 * 验证令牌续期操作
 * 跳过 createToken（需要 librarySecret）
 * 跳过 deleteToken/deleteUserTokens（会导致当前令牌失效）
 *
 * 注意：SmhClient 的 wrapApi 对 renewToken 不自动注入 libraryId，
 * 因此需要显式传入 libraryId 和 accessToken。
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  createTestClient,
  getConfig,
  skipIfNoConfig,
} from './helpers';

const shouldSkip = skipIfNoConfig();

function skipOnForbidden(ctx: any, error: any, action: string): never {
  if (error?.response?.status === 403) {
    ctx.skip(`缺少权限：${action}`);
  }
  throw error;
}

describe.skipIf(shouldSkip)('TokenApi 集成测试', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  describe('renewToken - 续期访问令牌', () => {
    it('应能续期当前访问令牌', async (ctx: any) => {
      try {
        const cfg = await getConfig();
        const res = await client.token.renewToken({
          libraryId: cfg.libraryId,
          accessToken: cfg.accessToken,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        // token 已过期或权限不足时返回 403，显式跳过
        skipOnForbidden(ctx, error, '续期访问令牌');
      }
    });
  });
});
