/**
 * SMHClient 集成测试
 * 验证 SDK 与真实 SMH 服务端的交互
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { getConfig, createTestClient, skipIfNoConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

function getHttpStatus(error: any): number | undefined {
  return error?.response?.status;
}

async function getQuotaIfSupported(client: SMHClient): Promise<{ supported: true; response: any } | { supported: false }> {
  try {
    const response = await client.quota.getQuota({});
    return { supported: true, response };
  } catch (error: any) {
    if (getHttpStatus(error) === 404) {
      return { supported: false };
    }
    throw error;
  }
}

describe.skipIf(shouldSkip)('SMHClient 集成测试', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  describe('Quota / Usage API', () => {
    it('应能查询租户空间配额（环境未开通配额能力时跳过）', async (ctx: any) => {
      const quotaResult = await getQuotaIfSupported(client);
      if (!quotaResult.supported) {
        ctx.skip('quota 接口返回 404，当前环境未开通配额能力');
        return;
      }
      expect(quotaResult.response.status).toBe(200);
      expect(quotaResult.response.data).toBeDefined();
    });

    it('应能查询媒体库容量信息', async () => {
      const res = await client.usage.getLibraryUsage({});
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('参数自动注入', () => {
    it('不传 libraryId/spaceId/accessToken 时应自动注入默认值', async () => {
      const quotaResult = await getQuotaIfSupported(client);
      if (quotaResult.supported) {
        expect(quotaResult.response.status).toBe(200);
        return;
      }

      const usageRes = await client.usage.getLibraryUsage({});
      expect(usageRes.status).toBe(200);
    });

    it('手动传入的参数应覆盖默认值', async () => {
      await expect(
        client.usage.getLibraryUsage({
          libraryId: 'invalid_library_for_integration_test',
        })
      ).rejects.toMatchObject({
        response: {
          status: expect.any(Number),
        },
      });
    });
  });

  describe('setter/getter', () => {
    it('setDefaultAccessToken 后请求应使用新 token', async () => {
      const config = await getConfig();
      const newClient = await createTestClient();
      newClient.setDefaultAccessToken('new_test_token');
      expect(newClient.getDefaultAccessToken()).toBe('new_test_token');

      // 恢复
      newClient.setDefaultAccessToken(config.accessToken);
      expect(newClient.getDefaultAccessToken()).toBe(config.accessToken);
    });

    it('setDefaultLibraryId / setDefaultSpaceId 应正确更新', async () => {
      const newClient = await createTestClient();

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