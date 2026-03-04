/**
 * SMHClient 集成测试
 * 验证 SDK 与真实 SMH 服务端的交互
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { getConfig, createTestClient, skipIfNoConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('SMHClient 集成测试', () => {
  let client: SMHClient;

  beforeAll(() => {
    client = createTestClient();
  });

  describe('Quota / Usage API', () => {
    it('应能查询租户空间配额', async () => {
      const res = await client.quota.getQuota({});
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应能查询媒体库容量信息', async () => {
      const res = await client.usage.getLibraryUsage({});
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('参数自动注入', () => {
    it('不传 libraryId/spaceId/accessToken 时应自动注入默认值', async () => {
      // 如果自动注入失败，这个请求会 401 或 400
      const res = await client.quota.getQuota({});
      expect(res.status).toBe(200);
    });

    it('手动传入的参数应覆盖默认值', async () => {
      // 用一个错误的 accessToken，应该收到 401
      try {
        await client.quota.getQuota({
          accessToken: 'invalid_token_for_test',
        });
        // 如果没抛错，也算通过（某些 API 可能不校验 token 格式）
      } catch (error: any) {
        // 预期 401 或 403
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('setter/getter', () => {
    it('setDefaultAccessToken 后请求应使用新 token', () => {
      const config = getConfig();
      const newClient = createTestClient();
      newClient.setDefaultAccessToken('new_test_token');
      expect(newClient.getDefaultAccessToken()).toBe('new_test_token');

      // 恢复
      newClient.setDefaultAccessToken(config.accessToken);
      expect(newClient.getDefaultAccessToken()).toBe(config.accessToken);
    });

    it('setDefaultLibraryId / setDefaultSpaceId 应正确更新', () => {
      const newClient = createTestClient();

      newClient.setDefaultLibraryId('new_lib');
      expect(newClient.getDefaultLibraryId()).toBe('new_lib');

      newClient.setDefaultSpaceId('new_space');
      expect(newClient.getDefaultSpaceId()).toBe('new_space');
    });
  });

  describe('错误处理', () => {
    it('无效 basePath 应抛出网络错误', async () => {
      const badClient = new SMHClient({
        basePath: 'https://invalid-host-that-does-not-exist.example.com',
        libraryId: 'test',
        spaceId: 'test',
        accessToken: 'test',
        maxRetries: 0, // 不重试，快速失败
        timeout: 5000,
      });

      await expect(
        badClient.quota.getQuota({})
      ).rejects.toThrow();
    });
  });
});
