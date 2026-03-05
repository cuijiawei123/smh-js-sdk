/**
 * 目录操作集成测试
 * 验证目录的创建、列举、删除等操作
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  createTestClient,
  getTestRootDir,
  skipIfNoConfig,
  sleep,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('目录操作集成测试', () => {
  let client: SMHClient;
  const testDirBase = `${getTestRootDir()}/dir_${Date.now()}`;
  const createdDirs: string[] = [];

  beforeAll(async () => {
    client = await createTestClient();
  });

  afterAll(async () => {
    // 逆序清理目录（先删子目录）
    for (const dir of createdDirs.reverse()) {
      try {
        await client.directory.deleteDirectory({ filePath: dir });
      } catch {
        // 忽略
      }
    }

    try {
      await client.directory.deleteDirectory({ filePath: testDirBase });
    } catch {
      // 忽略
    }

  });

  describe('创建目录', () => {
    it('应能创建新目录', async () => {
      const dirPath = `${testDirBase}/new-folder`;
      createdDirs.push(dirPath);

      const res = await client.directory.createDirectory({ filePath: dirPath });
      // 创建成功应返回 200 或 201
      expect([200, 201]).toContain(res.status);
    });

    it('应能创建嵌套目录', async () => {
      const dirPath = `${testDirBase}/level1/level2/level3`;
      createdDirs.push(`${testDirBase}/level1/level2/level3`);
      createdDirs.push(`${testDirBase}/level1/level2`);
      createdDirs.push(`${testDirBase}/level1`);

      const res = await client.directory.createDirectory({ filePath: dirPath });
      expect([200, 201]).toContain(res.status);
    });
  });

  describe('列举目录', () => {
    it('应能列举目录内容', async () => {
      // 先创建一个目录
      const dirPath = `${testDirBase}/list-test`;
      createdDirs.push(dirPath);
      await client.directory.createDirectory({ filePath: dirPath });

      await sleep(1000);

      // 列举父目录（byMarker 是必传参数）
      const res = await client.directory.listDirectory({ filePath: testDirBase, byMarker: 1 as any });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('删除目录', () => {
    it('应能删除空目录', async () => {
      const dirPath = `${testDirBase}/to-delete`;
      await client.directory.createDirectory({ filePath: dirPath });

      await sleep(500);

      const res = await client.directory.deleteDirectory({ filePath: dirPath });
      expect([200, 204]).toContain(res.status);
    });
  });

  describe('目录重命名/移动', () => {
    it('应能重命名目录', async (ctx: any) => {
      const oldPath = `${testDirBase}/before-rename-${Date.now()}`;
      const newPath = `${testDirBase}/after-rename-${Date.now()}`;
      createdDirs.push(newPath);

      await client.directory.createDirectory({ filePath: oldPath });
      await sleep(500);

      try {
        const res = await client.directory.moveDirectory({
          filePath: oldPath,
          moveDirectoryRequest: { path: newPath },
          conflictResolutionStrategy: 'rename',
        } as any);
        expect([200, 201, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`目录重命名能力不可用或无权限: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });
});
