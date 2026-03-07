/**
 * DirectoryApi 补充集成测试
 * 覆盖 copyDirectory、listDirectoryByPage、checkDirectoryStatus、
 * infoFileOrDirectory、updateDirectoryLabels
 * 原 directory.test.ts 已覆盖：createDirectory、listDirectory、deleteDirectory、moveDirectory
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  InfoFileOrDirectoryInfoEnum,
  ListDirectoryByPageByPageEnum,
} from '../../apis/directory-api';
import {
  createTestClient,
  getTestRootDir,
  skipIfNoConfig,
  sleep,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('DirectoryApi 补充集成测试', () => {
  let client: SMHClient;
  const testDirBase = `${getTestRootDir()}/dir_extra_${Date.now()}`;
  const createdDirs: string[] = [];

  beforeAll(async () => {
    client = await createTestClient();
    // 创建测试根目录
    try {
      await client.directory.createDirectory({ filePath: testDirBase });
    } catch { /* ignore */ }

    // 创建几个子目录用于测试
    const subDirs = ['sub-a', 'sub-b', 'sub-c'];
    for (const d of subDirs) {
      const path = `${testDirBase}/${d}`;
      createdDirs.push(path);
      try {
        await client.directory.createDirectory({ filePath: path });
      } catch { /* ignore */ }
    }
    await sleep(500);
  });

  afterAll(async () => {
    for (const dir of createdDirs.reverse()) {
      try { await client.directory.deleteDirectory({ filePath: dir }); } catch { /* ignore */ }
    }
    try { await client.directory.deleteDirectory({ filePath: testDirBase }); } catch { /* ignore */ }
  });

  // ─── copyDirectory ────────────────────────────────────────

  describe('copyDirectory - 复制目录', () => {
    it('应能复制目录到新路径', async (ctx: any) => {
      const destPath = `${testDirBase}/sub-a-copy`;
      createdDirs.push(destPath);

      try {
        const res = await client.directory.copyDirectory({
          filePath: destPath,
          copyDirectoryRequest: { copyFrom: `${testDirBase}/sub-a` },
          conflictResolutionStrategy: 'rename' as any,
        });
        // 小目录同步完成返回 200，大目录异步返回 202
        expect([200, 201, 202]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`目录复制能力不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });

  // ─── listDirectoryByPage ──────────────────────────────────

  describe('listDirectoryByPage - 分页列出目录内容', () => {
    it('应能按页码列出目录内容', async () => {
      const res = await client.directory.listDirectoryByPage({
        filePath: testDirBase,
        byPage: ListDirectoryByPageByPageEnum.NUMBER_1,
        page: 1,
        pageSize: 10,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持排序参数', async () => {
      const res = await client.directory.listDirectoryByPage({
        filePath: testDirBase,
        byPage: ListDirectoryByPageByPageEnum.NUMBER_1,
        page: 1,
        pageSize: 10,
        orderBy: 'name' as any,
        orderByType: 'asc' as any,
      });
      expect(res.status).toBe(200);
    });
  });

  // ─── checkDirectoryStatus ─────────────────────────────────

  describe('checkDirectoryStatus - 检查目录状态', () => {
    it('已存在的目录应返回成功', async () => {
      const res = await client.directory.checkDirectoryStatus({
        filePath: testDirBase,
      });
      expect([200, 204]).toContain(res.status);
    });

    it('不存在的目录应返回 404', async () => {
      const result = await client.directory.checkDirectoryStatus({
        filePath: `${getTestRootDir()}/non-existent-dir-${Date.now()}`,
      })
        .then(res => ({ ok: true as const, res }))
        .catch((error: any) => ({ ok: false as const, error }));

      if (result.ok) {
        expect(result.res.status).toBe(404);
      } else {
        expect(result.error.response?.status).toBe(404);
      }
    });
  });

  // ─── infoFileOrDirectory ──────────────────────────────────

  describe('infoFileOrDirectory - 查询目录/文件信息', () => {
    it('应能查询目录详情', async () => {
      const res = await client.directory.infoFileOrDirectory({
        filePath: testDirBase,
        info: InfoFileOrDirectoryInfoEnum.NUMBER_1,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  // ─── updateDirectoryLabels ────────────────────────────────

  describe('updateDirectoryLabels - 更新目录标签', () => {
    it('应能为目录设置标签', async (ctx: any) => {
      try {
        const res = await client.directory.updateDirectoryLabels({
          filePath: `${testDirBase}/sub-a`,
          update: 1 as any,
          updateDirectoryLabelsRequest: { labels: ['sdk-test', 'integration'] },
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`更新目录标签不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });
});
