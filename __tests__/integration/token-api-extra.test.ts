/**
 * TokenApi 补充集成测试
 * 覆盖 deleteUserTokens 方法
 * 原 token-api.test.ts 已覆盖：renewToken
 * 原 space-api-extra.test.ts 已覆盖：deleteToken
 *
 * deleteUserTokens 需要 librarySecret，且操作危险（会删除指定用户所有 token）
 * 这里使用 clientId 参数限定范围，仅删除特定 clientId 的 token
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { CreateTokenGrantEnum } from '../../apis/token-api';
import {
  createTestClient,
  getConfig,
  skipIfNoConfig,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('TokenApi 补充集成测试 - deleteUserTokens', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  describe('deleteUserTokens - 删除特定用户的访问令牌', () => {
    it('应能创建后按 clientId 删除临时 token', async (ctx: any) => {
      const librarySecret = process.env.SMH_LIBRARY_SECRET;
      const userId = process.env.SMH_USER_ID;
      const libraryId = process.env.SMH_LIBRARY_ID;
      const spaceId = process.env.SMH_SPACE_ID;

      if (!librarySecret || !userId || !libraryId || !spaceId) {
        ctx.skip('缺少环境变量，跳过 deleteUserTokens 测试');
        return;
      }

      const testClientId = `sdk_test_${Date.now()}`;

      // 用特定 clientId 签发临时 token
      const createRes = await client.token.createToken({
        libraryId,
        librarySecret,
        spaceId,
        userId,
        grant: CreateTokenGrantEnum.Admin,
        period: 600,
        clientId: testClientId,
      });
      const tempToken = (createRes.data as any)?.accessToken;
      expect(tempToken).toBeTruthy();

      // 按 clientId 删除该用户的 token
      try {
        const res = await client.token.deleteUserTokens({
          libraryId,
          librarySecret,
          userId,
          clientId: testClientId,
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`deleteUserTokens 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('应能按 sessionId 删除 token', async (ctx: any) => {
      const librarySecret = process.env.SMH_LIBRARY_SECRET;
      const userId = process.env.SMH_USER_ID;
      const libraryId = process.env.SMH_LIBRARY_ID;
      const spaceId = process.env.SMH_SPACE_ID;

      if (!librarySecret || !userId || !libraryId || !spaceId) {
        ctx.skip('缺少环境变量');
        return;
      }

      const testSessionId = `sdk_session_${Date.now()}`;

      // 用特定 sessionId 签发临时 token
      await client.token.createToken({
        libraryId,
        librarySecret,
        spaceId,
        userId,
        grant: CreateTokenGrantEnum.Admin,
        period: 600,
        sessionId: testSessionId,
      });

      // 按 sessionId 删除
      try {
        const res = await client.token.deleteUserTokens({
          libraryId,
          librarySecret,
          userId,
          sessionId: testSessionId,
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`按 sessionId 删除不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });
});
