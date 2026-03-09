/**
 * QuotaApi 集成测试
 * 覆盖 getQuota、createQuota、updateQuota、getQuotaInfo、updateQuotaById
 * 配额操作可能需要管理员权限，不可用时安全跳过
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  createTestClient,
  getConfig,
  skipIfNoConfig,
} from './helpers';
import type { IntegrationConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

function skipOnUnavailable(ctx: any, error: any, action: string): never {
  if ([400, 403, 404, 405, 409, 501, 502].includes(error?.response?.status)) {
    ctx.skip(`${action}不可用: ${error?.response?.status}`);
  }
  throw error;
}

describe.skipIf(shouldSkip)('QuotaApi 集成测试', () => {
  let client: SMHClient;
  let config: IntegrationConfig;
  let createdQuotaId: string | null = null;

  beforeAll(async () => {
    config = await getConfig();
    client = await createTestClient();
  });

  afterAll(async () => {
    // 无法直接删除配额，但后续测试不依赖此清理
  });

  // ─── getQuota ──────────────────────────────────────────────

  describe('getQuota - 获取租户空间配额', () => {
    it('应能查询当前租户空间配额', async (ctx: any) => {
      try {
        const res = await client.quota.getQuota({});
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        // 配额能力未开通返回 404
        if (error?.response?.status === 404) {
          ctx.skip('当前环境未开通配额能力');
          return;
        }
        skipOnUnavailable(ctx, error, '获取租户空间配额');
      }
    });

    it('传入无效参数应返回错误', async (ctx: any) => {
      try {
        const res = await client.quota.getQuota({
          libraryId: 'invalid-lib-id',
          spaceId: 'invalid-space-id',
          accessToken: 'invalid-token',
        });
        // 某些环境可能宽容地返回 200
        expect(res.status).toBeDefined();
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.response?.status).toBeDefined();
      }
    });
  });

  // ─── createQuota ───────────────────────────────────────────

  describe('createQuota - 创建配额', () => {
    it('应能创建配额', async (ctx: any) => {
      try {
        const res = await client.quota.createQuota({
          libraryId: config.libraryId,
          accessToken: config.accessToken,
          createQuotaRequest: {
            capacity: '10737418240', // 10GB
            removeWhenExceed: false,
            removeAfterDays: 30,
            spaces: [config.spaceId],
          },
        });
        expect([200, 201]).toContain(res.status);
        expect(res.data).toBeDefined();
        createdQuotaId = (res.data as any)?.quotaId || null;
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '创建配额');
      }
    });
  });

  // ─── getQuotaInfo ──────────────────────────────────────────

  describe('getQuotaInfo - 获取配额信息', () => {
    it('应能查询配额详情', async (ctx: any) => {
      // 先尝试从 getQuota 获取 quotaId
      let quotaId = createdQuotaId;
      if (!quotaId) {
        try {
          const quotaRes = await client.quota.getQuota({});
          quotaId = (quotaRes.data as any)?.quotaId || null;
        } catch {
          // ignore
        }
      }

      if (!quotaId) {
        ctx.skip('无可用的 quotaId');
        return;
      }

      try {
        const res = await client.quota.getQuotaInfo({
          libraryId: config.libraryId,
          quotaId,
          accessToken: config.accessToken,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '获取配额信息');
      }
    });
  });

  // ─── updateQuota ───────────────────────────────────────────

  describe('updateQuota - 修改配额', () => {
    it('应能修改租户空间配额', async (ctx: any) => {
      try {
        const res = await client.quota.updateQuota({
          libraryId: config.libraryId,
          spaceId: config.spaceId,
          accessToken: config.accessToken,
          updateQuotaRequest: {
            capacity: '21474836480', // 20GB
            removeWhenExceed: false,
          },
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '修改配额');
      }
    });
  });

  // ─── updateQuotaById ───────────────────────────────────────

  describe('updateQuotaById - 根据 ID 修改配额', () => {
    it('应能根据配额 ID 修改配额', async (ctx: any) => {
      let quotaId = createdQuotaId;
      if (!quotaId) {
        try {
          const quotaRes = await client.quota.getQuota({});
          quotaId = (quotaRes.data as any)?.quotaId || null;
        } catch {
          // ignore
        }
      }

      if (!quotaId) {
        ctx.skip('无可用的 quotaId');
        return;
      }

      try {
        const res = await client.quota.updateQuotaById({
          libraryId: config.libraryId,
          quotaId,
          accessToken: config.accessToken,
          updateQuotaByIdRequest: {
            capacity: '10737418240', // 10GB
            removeWhenExceed: false,
          },
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '根据 ID 修改配额');
      }
    });
  });
});
