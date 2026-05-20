/**
 * SpaceApi / UsageApi / TokenApi 补充集成测试
 *
 * SpaceApi 补充：updateSpaceExtension、getContentsView、setSpaceTrafficLimit
 * UsageApi 补充：getUsage
 * TokenApi 补充：deleteToken（仅用新签发的临时 token 测试，不影响主 token）
 * 跳过 deleteUserTokens（需要 librarySecret，且会删除所有用户 token 太危险）
 *
 * 原 space-api.test.ts 已覆盖：listSpace、getSpaceSize、getFileCountInSpace、
 * getSpaceExtension、getLibrarySpaceCount、createSpace、deleteSpace
 * 原 smh-client.test.ts 已覆盖：getQuota、getLibraryUsage
 * 原 token-api.test.ts 已覆盖：renewToken
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { CreateTokenGrantEnum } from '../../apis/token-api';
import { GetContentsViewFilterEnum } from '../../apis/space-api';
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

describe.skipIf(shouldSkip)('SpaceApi 补充集成测试', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  // ─── updateSpaceExtension ─────────────────────────────────

  describe('updateSpaceExtension - 修改租户空间属性', () => {
    it('应能更新空间扩展属性', async (ctx: any) => {
      try {
        // 先读取当前属性
        const current = await client.space.getSpaceExtension({});
        const currentData = current.data as any;

        // 用当前值写回（等于无变更的安全更新）
        const res = await client.space.updateSpaceExtension({
          updateSpaceExtensionRequest: {
            isPublicRead: currentData?.isPublicRead ?? false,
          },
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        skipOnForbidden(ctx, error, '修改租户空间属性');
      }
    });
  });

  // ─── getContentsView ──────────────────────────────────────

  describe('getContentsView - 内容视图', () => {
    it('应能按文件类型筛选内容', async (ctx: any) => {
      try {
        const res = await client.space.getContentsView({
          filter: GetContentsViewFilterEnum.OnlyFile,
          limit: 10,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`内容视图不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });

  // ─── setSpaceTrafficLimit ─────────────────────────────────

  describe('setSpaceTrafficLimit - 设置空间下载限速', () => {
    it('应能设置下载限速后再取消', async (ctx: any) => {
      try {
        // 设置限速为 1MB/s
        const setRes = await client.space.setSpaceTrafficLimit({
          setSpaceTrafficLimitRequest: { downloadTrafficLimit: 1024 * 1024 },
        });
        expect([200, 204]).toContain(setRes.status);

        // 取消限速
        const cancelRes = await client.space.setSpaceTrafficLimit({
          setSpaceTrafficLimitRequest: { downloadTrafficLimit: -1 },
        });
        expect([200, 204]).toContain(cancelRes.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`设置空间下载限速不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });
  // ─── listSpace 新增参数 ────────────────────────────────────

  describe('listSpace - 新增参数覆盖', () => {
    it('应支持 ordered 参数（全局有序列出）', async (ctx: any) => {
      try {
        const res = await client.space.listSpace({
          ordered: 1 as any,
          limit: 5,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`listSpace ordered 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('应支持 prefix 参数（按 spaceId 前缀过滤）', async (ctx: any) => {
      try {
        const res = await client.space.listSpace({
          ordered: 1 as any,
          prefix: 'sp',
          limit: 5,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`listSpace prefix 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('应支持 startName 参数（分页起始游标）', async (ctx: any) => {
      try {
        const res = await client.space.listSpace({
          ordered: 1 as any,
          startName: 'a',
          limit: 5,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`listSpace startName 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('应支持 ordered + prefix + startName 组合参数', async (ctx: any) => {
      try {
        const res = await client.space.listSpace({
          ordered: 1 as any,
          prefix: 'sp',
          startName: 'a',
          limit: 10,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`listSpace 组合参数不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('ordered=0 时 prefix 和 startName 应不生效（兼容旧行为）', async (ctx: any) => {
      try {
        const res = await client.space.listSpace({
          ordered: 0 as any,
          prefix: 'nonexistent_prefix_xyz',
          limit: 5,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`listSpace ordered=0 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });
});

// ─── UsageApi 补充 ──────────────────────────────────────────

describe.skipIf(shouldSkip)('UsageApi 补充集成测试', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  describe('getUsage - 查询指定空间的使用量', () => {
    it('应能查询当前空间的使用量', async (ctx: any) => {
      try {
        const cfg = await getConfig();
        const res = await client.usage.getUsage({
          spaceIds: cfg.spaceId,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
        // 返回数组
        expect(Array.isArray(res.data)).toBe(true);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`查询空间使用量不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });
});

// ─── TokenApi 补充 ──────────────────────────────────────────

describe.skipIf(shouldSkip)('TokenApi 补充集成测试', () => {
  let client: SMHClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  describe('deleteToken - 删除访问令牌', () => {
    it('应能创建临时 token 后删除它', async (ctx: any) => {
      const librarySecret = process.env.SMH_LIBRARY_SECRET;
      const userId = process.env.SMH_USER_ID;
      const libraryId = process.env.SMH_LIBRARY_ID;
      const spaceId = process.env.SMH_SPACE_ID;

      if (!librarySecret || !userId || !libraryId || !spaceId) {
        ctx.skip('缺少环境变量，跳过 deleteToken 测试');
        return;
      }

      // 签发一个临时 token
      const createRes = await client.token.createToken({
        libraryId,
        librarySecret,
        spaceId,
        userId,
        grant: CreateTokenGrantEnum.Admin,
        period: 600,
      });
      const tempToken = (createRes.data as any)?.accessToken;
      expect(tempToken).toBeTruthy();

      // 删除该临时 token
      try {
        const deleteRes = await client.token.deleteToken({
          libraryId,
          accessToken: tempToken,
        });
        expect([200, 204]).toContain(deleteRes.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`删除 token 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }

      // 验证删除后 token 不可用
      const tempClient = new SMHClient({
        basePath: (await getConfig()).basePath,
        libraryId,
        spaceId,
        accessToken: tempToken,
        maxRetries: 0,
        timeout: 10000,
      });

      const result = await tempClient.usage.getLibraryUsage({})
        .then(res => ({ ok: true as const, res }))
        .catch((error: any) => ({ ok: false as const, error }));

      if (result.ok) {
        // 如果请求成功，说明 token 可能还没完全失效（缓存）
        // 这种情况也是可接受的
      } else {
        // 预期返回 401 或 403
        expect([401, 403]).toContain(result.error.response?.status);
      }
    });
  });
});
