/**
 * SpaceApi 集成测试
 * 验证空间查询与管理操作
 * 写操作：创建空间 → 查询 → 删除空间（仅操作自己创建的空间）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { DeleteSpaceForceEnum } from '../../apis/space-api';
import { CreateTokenGrantEnum } from '../../apis/token-api';
import {
  createTestClient,
  skipIfNoConfig,
} from './helpers';

const shouldSkip = skipIfNoConfig();
const enableSpaceWriteTests = process.env.SMH_ENABLE_SPACE_WRITE_TESTS === '1';

function getRequestIdFromHeaders(headers: any): string | undefined {
  if (!headers) {
    return undefined;
  }
  const candidates = ['x-smh-request-id', 'x-request-id', 'requestid', 'request-id'];
  for (const key of Object.keys(headers)) {
    const lowerKey = key.toLowerCase();
    if (candidates.includes(lowerKey)) {
      const value = headers[key];
      return Array.isArray(value) ? value[0] : value;
    }
  }
  return undefined;
}

function skipOnForbidden(ctx: any, error: any, action: string): never {
  if (error?.response?.status === 403) {
    ctx.skip(`缺少权限：${action}`);
  }
  throw error;
}

/**
 * 为指定 spaceId 签发新的 accessToken
 */
async function createTokenForSpace(client: SMHClient, spaceId: string): Promise<string> {
  const librarySecret = process.env.SMH_LIBRARY_SECRET;
  const userId = process.env.SMH_USER_ID;
  if (!librarySecret || !userId) {
    throw new Error('缺少 SMH_LIBRARY_SECRET 或 SMH_USER_ID 环境变量');
  }
  const res = await client.token.createToken({
    libraryId: process.env.SMH_LIBRARY_ID!,
    librarySecret,
    spaceId,
    userId,
    grant: CreateTokenGrantEnum.Admin,
  });
  const accessToken = res.data?.accessToken;
  if (!accessToken) {
    throw new Error(`为 spaceId=${spaceId} 签发 accessToken 失败`);
  }
  return accessToken;
}

describe.skipIf(shouldSkip)('SpaceApi 集成测试', () => {
  let client: SMHClient;
  let createdSpaceId: string | null = null;

  beforeAll(async () => {
    client = await createTestClient();
  });

  afterAll(async () => {
    // 清理测试创建的空间
    if (createdSpaceId) {
      try {
        const newToken = await createTokenForSpace(client, createdSpaceId);
        const res = await client.space.deleteSpace({
          spaceId: createdSpaceId,
          accessToken: newToken,
          force: DeleteSpaceForceEnum.NUMBER_1,
        });
        console.log('[space.deleteSpace][afterAll] requestId:', getRequestIdFromHeaders((res as any)?.headers));
      } catch (error: any) {
        console.log('[space.deleteSpace][afterAll][error] requestId:', getRequestIdFromHeaders(error?.response?.headers));
      }
    }
  });

  describe('只读查询', () => {
    it('应能列出租户空间', async (ctx: any) => {
      try {
        const res = await client.space.listSpace({});
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnForbidden(ctx, error, '列出租户空间');
      }
    });

    it('应能查询空间大小', async (ctx: any) => {
      try {
        const res = await client.space.getSpaceSize({});
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnForbidden(ctx, error, '查询空间大小');
      }
    });

    it('应能查询空间文件数量', async (ctx: any) => {
      try {
        const res = await client.space.getFileCountInSpace({});
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnForbidden(ctx, error, '查询空间文件数量');
      }
    });

    it('应能查询空间属性', async (ctx: any) => {
      try {
        const res = await client.space.getSpaceExtension({});
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnForbidden(ctx, error, '查询空间属性');
      }
    });

    it('应能查询媒体库租户空间数量', async (ctx: any) => {
      try {
        const res = await client.space.getLibrarySpaceCount({});
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnForbidden(ctx, error, '查询媒体库租户空间数量');
      }
    });
  });

  describe.skipIf(!enableSpaceWriteTests)('创建与删除空间', () => {
    it('应能创建新空间', async () => {
      const res = await client.space.createSpace({
        createSpaceRequest: {
          spaceTag: 'sdk_test',
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
      // 记录创建的 spaceId 以便清理
      createdSpaceId = (res.data as any)?.spaceId || (res.data as any)?.id || null;
      expect(createdSpaceId).toBeTruthy();
    });

    it('应能删除自己创建的空间', async () => {
      expect(createdSpaceId).toBeTruthy();

      // 为新创建的 spaceId 签发专属 accessToken
      const newToken = await createTokenForSpace(client, createdSpaceId!);
      console.log('[space.deleteSpace] 为新空间签发 token 成功, spaceId:', createdSpaceId);

      try {
        const res = await client.space.deleteSpace({
          spaceId: createdSpaceId!,
          accessToken: newToken,
          force: DeleteSpaceForceEnum.NUMBER_1,
        });
        console.log('[space.deleteSpace][test] requestId:', getRequestIdFromHeaders((res as any)?.headers));
        expect([200, 204]).toContain(res.status);
        createdSpaceId = null; // 已删除
      } catch (error: any) {
        console.log('[space.deleteSpace][test][error] requestId:', getRequestIdFromHeaders(error?.response?.headers));
        throw error;
      }
    });
  });
});
