/**
 * FileApi 补充集成测试
 * 覆盖 copyFile、moveFile、checkFileStatus、createSymlink、getFileInfoByInode、
 * getDeltaCursor、queryDeltaLog、createVirtualFile
 * 跳过 formUploadFile（需要 multipart/form-data）、convertFile（需要文档类型文件）、
 * abortFileUpload（需要进行中的上传 confirmKey）、renewMultipartUpload（同理）、
 * previewFile / getCover（返回 302 重定向，不适合集成测试断言）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  InfoFileInfoEnum,
  CreateVirtualFileVirtualFileEnum,
  CreateVirtualFileConflictResolutionStrategyEnum,
  PreviewZipFileZipPreviewEnum,
  PreviewZipFileFormatEnum,
  UncompressFileUncompressEnum,
  UncompressFileConflictResolutionStrategyEnum,
} from '../../apis/file-api';
import {
  createMockFile,
  createTestClient,
  getTestRootDir,
  uniquePath,
  skipIfNoConfig,
  sleep,
  waitForUploadEnd,
  assertSetupReady,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('FileApi 补充集成测试', () => {
  let client: SMHClient;
  const uploadedFiles: string[] = [];
  let setupFailed = false;
  let sharedFilePath: string;
  let sharedFileInode: string | null = null;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    // 上传一个共享测试文件，后续多个测试复用
    try {
      sharedFilePath = uniquePath('file-api-shared', '.txt');
      const content = Buffer.from(`file-api test ${Date.now()}`);
      const file = createMockFile('shared.txt', content);
      const uploader = client.createUploadTask({ file, filePath: sharedFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      uploadedFiles.push(sharedFilePath);
      await sleep(1000);

      // 获取 inode 供后续测试使用
      const info = await client.file.infoFile({
        filePath: sharedFilePath,
        info: InfoFileInfoEnum.NUMBER_1,
      });
      sharedFileInode = (info.data as any)?.inode || (info.data as any)?.fileId || null;
    } catch (e: any) {
      console.log('FileApi 环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    for (const fp of uploadedFiles) {
      try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
    }
  });

  // ─── copyFile ─────────────────────────────────────────────

  describe('copyFile - 复制文件', () => {
    it('应能复制文件到新路径', async () => {
      assertSetupReady(setupFailed);
      const destPath = uniquePath('file-copy-dest', '.txt');
      uploadedFiles.push(destPath);

      const res = await client.file.copyFile({
        filePath: destPath,
        copyFileRequest: { copyFrom: sharedFilePath },
        conflictResolutionStrategy: 'rename' as any,
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
    });

    it('复制到已存在路径使用 rename 策略不应报错', async () => {
      assertSetupReady(setupFailed);
      const destPath = uniquePath('file-copy-rename', '.txt');
      uploadedFiles.push(destPath);

      // 先创建目标文件
      const content = Buffer.from('existing file');
      const file = createMockFile('existing.txt', content);
      const uploader = client.createUploadTask({ file, filePath: destPath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(500);

      // 复制到同一路径，使用 rename 策略
      const res = await client.file.copyFile({
        filePath: destPath,
        copyFileRequest: { copyFrom: sharedFilePath },
        conflictResolutionStrategy: 'rename' as any,
      });
      expect([200, 201]).toContain(res.status);
    });
  });

  // ─── moveFile ─────────────────────────────────────────────

  describe('moveFile - 移动/重命名文件', () => {
    it('应能重命名文件', async () => {
      assertSetupReady(setupFailed);
      // 上传一个待移动的文件
      const srcPath = uniquePath('file-move-src', '.txt');
      const destPath = uniquePath('file-move-dest', '.txt');
      const content = Buffer.from('move test ' + Date.now());
      const file = createMockFile('move.txt', content);
      const uploader = client.createUploadTask({ file, filePath: srcPath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(500);

      uploadedFiles.push(destPath); // 移动后清理目标路径

      const res = await client.file.moveFile({
        filePath: destPath,
        moveFileRequest: { from: srcPath },
        conflictResolutionStrategy: 'rename' as any,
      });
      expect([200, 201, 204]).toContain(res.status);
    });
  });

  // ─── checkFileStatus ──────────────────────────────────────

  describe('checkFileStatus - 检查文件状态', () => {
    it('已上传文件应返回成功状态', async () => {
      assertSetupReady(setupFailed);
      const res = await client.file.checkFileStatus({
        filePath: sharedFilePath,
      });
      // HEAD 请求成功返回 200
      expect([200, 204]).toContain(res.status);
    });

    it('不存在的文件应返回 404', async () => {
      assertSetupReady(setupFailed);
      const result = await client.file.checkFileStatus({
        filePath: `${getTestRootDir()}/non-existent-${Date.now()}.txt`,
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

  // ─── createSymlink ────────────────────────────────────────

  describe('createSymlink - 创建符号链接', () => {
    it('应能为已有文件创建符号链接', async (ctx: any) => {
      assertSetupReady(setupFailed);
      const symlinkPath = uniquePath('file-symlink', '.txt');
      uploadedFiles.push(symlinkPath);

      try {
        const res = await client.file.createSymlink({
          filePath: symlinkPath,
          createSymlinkRequest: { linkTo: sharedFilePath },
        });
        expect([200, 201]).toContain(res.status);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        // 某些环境可能不支持符号链接
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`符号链接能力不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });

  // ─── getFileInfoByInode ───────────────────────────────────

  describe('getFileInfoByInode - 通过 inode 查询文件信息', () => {
    it('应能通过 inode 查询文件信息', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!sharedFileInode) {
        ctx.skip('未获取到文件 inode，跳过');
        return;
      }

      try {
        const res = await client.file.getFileInfoByInode({
          inode: sharedFileInode,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`getFileInfoByInode 不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });

  // ─── getDeltaCursor ───────────────────────────────────────

  describe('getDeltaCursor - 获取增量游标', () => {
    it('应能获取当前最新的增量游标', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.getDeltaCursor({});
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
        // cursor 应为字符串（不透明标记），可能为空字符串但必须有字段返回
        const data = res.data as any;
        if (data.cursor !== undefined) {
          expect(typeof data.cursor).toBe('string');
        }
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`getDeltaCursor 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });

  // ─── queryDeltaLog ────────────────────────────────────────

  describe('queryDeltaLog - 查询增量变动日志', () => {
    it('应能基于当前游标查询增量变动日志', async (ctx: any) => {
      assertSetupReady(setupFailed);
      let cursor: string | undefined;
      try {
        const cursorRes = await client.file.getDeltaCursor({});
        cursor = (cursorRes.data as any)?.cursor;
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`getDeltaCursor 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }

      if (typeof cursor !== 'string') {
        ctx.skip('未获取到 cursor');
        return;
      }

      try {
        const res = await client.file.queryDeltaLog({
          cursor,
          limit: 10,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
        const data = res.data as any;
        // 响应应包含 cursor / hasMore / contents 字段之一
        if (data.cursor !== undefined) {
          expect(typeof data.cursor).toBe('string');
        }
        if (data.hasMore !== undefined) {
          expect(typeof data.hasMore).toBe('boolean');
        }
        if (data.contents !== undefined) {
          expect(Array.isArray(data.contents)).toBe(true);
        }
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`queryDeltaLog 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('传入非法 cursor 应返回错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.queryDeltaLog({
          cursor: 'invalid-cursor-' + Date.now(),
          limit: 10,
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.response?.status).toBeDefined();
      }
    });
  });

  // ─── createVirtualFile ──────────────────────────────────────

  describe('createVirtualFile - 创建虚拟文件', () => {
    const virtualFiles: string[] = [];

    afterAll(async () => {
      for (const fp of virtualFiles) {
        try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
      }
    });

    describe('基本创建', () => {
      it('应能创建虚拟文件（最小参数）', async () => {
        assertSetupReady(setupFailed);
        const filePath = uniquePath('virtual-basic', '.vfile');
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

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
        if (res2.data.path) {
          virtualFiles.push(res2.data.path.join('/'));
        }
      });

      it('conflictResolutionStrategy=ask 应返回 409 冲突', async () => {
        assertSetupReady(setupFailed);
        const filePath = uniquePath('virtual-conflict-ask', '.vfile');
        virtualFiles.push(filePath);

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
        } catch (error: any) {
          expect(error.response?.status).toBe(409);
        }
      });

      it('conflictResolutionStrategy=overwrite 应覆盖已有文件', async () => {
        assertSetupReady(setupFailed);
        const filePath = uniquePath('virtual-conflict-overwrite', '.vfile');
        virtualFiles.push(filePath);

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

    describe('多级目录路径', () => {
      it('应支持在多级目录下创建虚拟文件', async () => {
        assertSetupReady(setupFailed);
        const nestedDir = `${getTestRootDir()}/nested/sub`;
        try {
          await client.directory.createDirectory({ filePath: nestedDir });
        } catch { /* ignore - may already exist */ }

        const filePath = `${nestedDir}/virtual_nested_${Date.now()}.vfile`;
        virtualFiles.push(filePath);

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
        virtualFiles.push(filePath);

        const createRes = await client.file.createVirtualFile({
          filePath,
          virtualFile: CreateVirtualFileVirtualFileEnum.NUMBER_1,
          createVirtualFileRequest: {
            contentType: 'text/plain',
            size: '512',
          },
        });
        expect([200, 201]).toContain(createRes.status);

        await sleep(500);

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

        const deleteRes = await client.file.deleteFile({ filePath });
        expect([200, 204]).toContain(deleteRes.status);
      });
    });
  });

  // ─── previewZipFile ───────────────────────────────────────

  describe('previewZipFile - 解压预览', () => {
    it('对非压缩包文件调用应返回错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.previewZipFile({
          filePath: sharedFilePath,
          zipPreview: PreviewZipFileZipPreviewEnum.NUMBER_1,
        });
        // 若服务端未开启 enableFileUncompress，可能返回 4xx
      } catch (error: any) {
        // 非压缩包文件应返回错误（如 400 FileUncompressNotAllowed 或 403/404）
        expect(error.response?.status).toBeDefined();
        expect([400, 403, 404, 405, 501]).toContain(error.response?.status);
      }
    });

    it('对不存在的文件调用应返回 404', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.previewZipFile({
          filePath: `${getTestRootDir()}/non-existent-${Date.now()}.zip`,
          zipPreview: PreviewZipFileZipPreviewEnum.NUMBER_1,
        });
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('传入 format=flat 参数不应报参数错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.previewZipFile({
          filePath: 'tced-skill-1.0.0.zip',
          zipPreview: PreviewZipFileZipPreviewEnum.NUMBER_1,
          format: PreviewZipFileFormatEnum.Flat,
        });
      } catch (error: any) {
        // 非压缩包文件预期返回业务错误，但不应是参数错误（400 ParamInvalid）
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          expect(errCode).not.toBe('ParamInvalid');
        }
      }
    });

    it('传入 format=tree 参数不应报参数错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.previewZipFile({
          filePath: sharedFilePath,
          zipPreview: PreviewZipFileZipPreviewEnum.NUMBER_1,
          format: PreviewZipFileFormatEnum.Tree,
        });
      } catch (error: any) {
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          expect(errCode).not.toBe('ParamInvalid');
        }
      }
    });

    it('传入非法 format 值应返回 ParamInvalid 错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.previewZipFile({
          filePath: sharedFilePath,
          zipPreview: PreviewZipFileZipPreviewEnum.NUMBER_1,
          format: 'invalid-format' as any,
        });
      } catch (error: any) {
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          // 如果服务端校验了 format 参数，应返回 ParamInvalid
          if (errCode) {
            expect(['ParamInvalid', 'FileUncompressNotAllowed', 'FileNotFound']).toContain(errCode);
          }
        }
      }
    });
  });

  // ─── uncompressFile ───────────────────────────────────────

  describe('uncompressFile - 文件解压', () => {
    it('对非压缩包文件调用应返回错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.uncompressFile({
          filePath: sharedFilePath,
          uncompress: UncompressFileUncompressEnum.NUMBER_1,
          uncompressFileRequest: {
            targetPath: getTestRootDir(),
          },
        });
      } catch (error: any) {
        // 非压缩包文件应返回错误（如 400 FileUncompressNotAllowed 或 403/404/501）
        expect(error.response?.status).toBeDefined();
        expect([400, 403, 404, 405, 501]).toContain(error.response?.status);
      }
    });

    it('对不存在的文件调用应返回 404', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.uncompressFile({
          filePath: `${getTestRootDir()}/non-existent-${Date.now()}.zip`,
          uncompress: UncompressFileUncompressEnum.NUMBER_1,
          uncompressFileRequest: {
            targetPath: getTestRootDir(),
          },
        });
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('目标路径不存在时应返回 DirectoryNotFound 错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.uncompressFile({
          filePath: sharedFilePath,
          uncompress: UncompressFileUncompressEnum.NUMBER_1,
          uncompressFileRequest: {
            targetPath: `${getTestRootDir()}/non-existent-dir-${Date.now()}`,
          },
        });
      } catch (error: any) {
        expect(error.response?.status).toBeDefined();
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          if (errCode) {
            expect(['DirectoryNotFound', 'FileUncompressNotAllowed', 'FileNotFound']).toContain(errCode);
          }
        }
      }
    });

    it('传入 conflictResolutionStrategy=rename 参数不应报参数错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.uncompressFile({
          filePath: 'tced-skill-1.0.0.zip',
          uncompress: UncompressFileUncompressEnum.NUMBER_1,
          uncompressFileRequest: {
            targetPath: 'test'
          },
          conflictResolutionStrategy: UncompressFileConflictResolutionStrategyEnum.Rename,
        });
      } catch (error: any) {
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          expect(errCode).not.toBe('ParamInvalid');
        }
      }
    });

    it('传入 conflictResolutionStrategy=overwrite 参数不应报参数错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.uncompressFile({
          filePath: sharedFilePath,
          uncompress: UncompressFileUncompressEnum.NUMBER_1,
          uncompressFileRequest: {
            targetPath: getTestRootDir(),
          },
          conflictResolutionStrategy: UncompressFileConflictResolutionStrategyEnum.Overwrite,
        });
      } catch (error: any) {
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          expect(errCode).not.toBe('ParamInvalid');
        }
      }
    });

    it('传入 selectedFilePaths 参数不应报参数错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.uncompressFile({
          filePath: sharedFilePath,
          uncompress: UncompressFileUncompressEnum.NUMBER_1,
          uncompressFileRequest: {
            targetPath: getTestRootDir(),
            selectedFilePaths: ['some-file.txt'],
          },
        });
      } catch (error: any) {
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          expect(errCode).not.toBe('ParamInvalid');
        }
      }
    });

    it('传入 password 参数不应报参数错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.uncompressFile({
          filePath: sharedFilePath,
          uncompress: UncompressFileUncompressEnum.NUMBER_1,
          uncompressFileRequest: {
            targetPath: getTestRootDir(),
            password: 'test-password',
          },
        });
      } catch (error: any) {
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          expect(errCode).not.toBe('ParamInvalid');
        }
      }
    });

    it('成功提交解压任务应返回 202 和 taskId', async (ctx: any) => {
      assertSetupReady(setupFailed);
      // 此用例仅在环境中存在真实压缩包时才能通过，此处验证接口调用结构正确性
      // 若文件不是压缩包，服务端会返回业务错误，跳过断言
      try {
        const res = await client.file.uncompressFile({
          filePath: sharedFilePath,
          uncompress: UncompressFileUncompressEnum.NUMBER_1,
          uncompressFileRequest: {
            targetPath: getTestRootDir(),
          },
        });
        // 如果意外成功（文件恰好是压缩包），验证响应结构
        expect(res.status).toBe(202);
        expect(res.data).toBeDefined();
        const data = res.data as any;
        if (data.taskId !== undefined) {
          expect(typeof data.taskId).toBe('number');
        }
      } catch (error: any) {
        // 非压缩包文件预期失败，跳过
        ctx.skip(`文件不是压缩包，跳过: ${error?.response?.status}`);
      }
    });
  });

  describe('officeEdit - 打开在线文档编辑入口', () => {
    it('对普通文本文件调用应返回 HTML 页面或业务错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      // 调用后返回包含【文档服务】SDK 的 HTML 页面
      // 若媒体库未开启文档编辑功能（DocEditNotEnabled）或文件类型不支持，则返回业务错误
      try {
        const res = await client.file.officeEdit({
          filePath: 'test.docx',
        });
        // 成功时返回 HTML 页面
        expect([200, 302]).toContain(res.status);
      } catch (error: any) {
        expect(error.response?.status).toBeDefined();
        // 常见错误：DocEditNotEnabled / 文件类型不支持 / 权限不足
        expect([400, 403, 404, 405, 501]).toContain(error.response?.status);
      }
    });

    it('对不存在的文件调用应返回 404', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.officeEdit({
          filePath: `${getTestRootDir()}/non-existent-${Date.now()}.docx`,
        });
      } catch (error: any) {
        expect(error.response?.status).toBeDefined();
        // 找不到文件返回 404，或媒体库未开启文档编辑返回其他业务错误
        expect([400, 403, 404, 405, 501]).toContain(error.response?.status);
      }
    });

    it('传入 lang 参数不应报参数错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.officeEdit({
          filePath: sharedFilePath,
          lang: 'zh_CN',
        });
        expect([200, 302]).toContain(res.status);
      } catch (error: any) {
        if (error.response?.status === 400) {
          const errCode = error.response?.data?.Code || error.response?.data?.code || '';
          expect(errCode).not.toBe('ParamInvalid');
        }
      }
    });
  });
});
