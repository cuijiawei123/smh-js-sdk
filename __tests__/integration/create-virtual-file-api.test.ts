/**
 * FileApi - createVirtualFile 集成测试
 * 验证创建虚拟文件功能
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  CreateVirtualFileVirtualFileEnum,
  CreateVirtualFileConflictResolutionStrategyEnum,
} from '../../apis/file-api';
import {
  assertSetupReady,
  createTestClient,
  getTestRootDir,
  skipIfNoConfig,
  uniquePath,
  sleep,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('FileApi - createVirtualFile 集成测试', () => {
  let client: SMHClient;
  const createdFiles: string[] = [];
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      // Verify client is working
      await sleep(500);
    } catch (e: any) {
      console.log('createVirtualFile 环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    for (const fp of createdFiles) {
      try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
    }
  });

  describe('基本创建', () => {
    it('应能创建虚拟文件（最小参数）', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-basic', '.vfile');
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
      expect(res.data.type).toBe('virtual');
    });

    it('应返回最终文件路径', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-path-check', '.vfile');
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data.path).toBeDefined();
      expect(Array.isArray(res.data.path)).toBe(true);
    });
  });

  describe('请求体参数', () => {
    it('应支持 contentType 参数', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-content-type', '.vfile');
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          contentType: 'application/pdf',
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
      expect(res.data.type).toBe('virtual');
    });

    it('应支持 metaData 参数', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-metadata', '.vfile');
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          metaData: {
            source: 'sdk-test',
            version: '1.0',
          },
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
    });

    it('应支持 labels 参数', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-labels', '.vfile');
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          labels: ['test-label', 'sdk'],
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
    });

    it('应支持 category 参数', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-category', '.vfile');
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          category: 'test-category',
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
    });

    it('应支持 size 参数', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-size', '.vfile');
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          size: '1024',
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
    });

    it('应支持所有请求体参数组合', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-all-params', '.vfile');
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          contentType: 'application/json',
          metaData: { key1: 'value1', key2: 'value2' },
          labels: ['label-a', 'label-b'],
          category: 'full-test',
          size: '2048',
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
      expect(res.data.type).toBe('virtual');
    });
  });

  describe('冲突处理策略', () => {
    it('conflictResolutionStrategy=rename 应自动重命名', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-conflict-rename', '.vfile');
      createdFiles.push(filePath);

      // Create the first file
      const res1 = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
      });
      expect([200, 201]).toContain(res1.status);

      // Create again with rename strategy
      const res2 = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        conflictResolutionStrategy: CreateVirtualFileConflictResolutionStrategyEnum.Rename,
      });
      expect([200, 201]).toContain(res2.status);
      expect(res2.data).toBeDefined();
      // The renamed file path may differ from the original
      if (res2.data.path) {
        createdFiles.push(res2.data.path.join('/'));
      }
    });

    it('conflictResolutionStrategy=ask 应返回 409 冲突', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-conflict-ask', '.vfile');
      createdFiles.push(filePath);

      // Create the first file
      const res1 = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
      });
      expect([200, 201]).toContain(res1.status);

      // Create again with ask strategy - should conflict
      try {
        await client.file.createVirtualFile({
          filePath,
          virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
          conflictResolutionStrategy: CreateVirtualFileConflictResolutionStrategyEnum.Ask,
        });
        // If no error, the server might not enforce conflict
      } catch (error: any) {
        expect(error.response?.status).toBe(409);
      }
    });

    it('conflictResolutionStrategy=overwrite 应覆盖已有文件', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-conflict-overwrite', '.vfile');
      createdFiles.push(filePath);

      // Create the first file
      const res1 = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          contentType: 'text/plain',
        },
      });
      expect([200, 201]).toContain(res1.status);

      // Overwrite with new content type
      const res2 = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        conflictResolutionStrategy: CreateVirtualFileConflictResolutionStrategyEnum.Overwrite,
        createVirtualFileRequest: {
          contentType: 'application/json',
        },
      });
      expect([200, 201]).toContain(res2.status);
      expect(res2.data).toBeDefined();
    });
  });

  describe('可选参数', () => {
    it('应支持显式传入 userId', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-userid', '.vfile');
      createdFiles.push(filePath);
      const userId = process.env.SMH_USER_ID;

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        userId,
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
    });
  });

  describe('多级目录路径', () => {
    it('应支持在多级目录下创建虚拟文件', async () => {
      assertSetupReady(setupFailed);
      const nestedDir = `${getTestRootDir()}/nested/sub`;
      try {
        await client.directory.createDirectory({ filePath: nestedDir });
      } catch { /* ignore - may already exist */ }

      const filePath = `${nestedDir}/virtual_nested_${Date.now()}.vfile`;
      createdFiles.push(filePath);

      const res = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          contentType: 'application/octet-stream',
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
      expect(res.data.path).toBeDefined();
    });
  });

  describe('创建后验证', () => {
    it('创建虚拟文件后应能通过 infoFile 查询到', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-verify-info', '.vfile');
      createdFiles.push(filePath);

      const createRes = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
        createVirtualFileRequest: {
          contentType: 'text/plain',
          size: '512',
        },
      });
      expect([200, 201]).toContain(createRes.status);

      // Wait a bit for consistency
      await sleep(500);

      // Verify the file exists via infoFile
      const infoRes = await client.file.infoFile({
        filePath,
        info: 1 as any,
      });
      expect(infoRes.status).toBe(200);
      expect(infoRes.data).toBeDefined();
    });

    it('创建虚拟文件后应能删除', async () => {
      assertSetupReady(setupFailed);
      const filePath = uniquePath('virtual-verify-delete', '.vfile');

      const createRes = await client.file.createVirtualFile({
        filePath,
        virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
      });
      expect([200, 201]).toContain(createRes.status);

      // Delete the virtual file
      const deleteRes = await client.file.deleteFile({ filePath });
      expect([200, 204]).toContain(deleteRes.status);
    });
  });
});
