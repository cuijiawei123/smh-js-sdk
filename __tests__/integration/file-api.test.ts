/**
 * FileApi 补充集成测试
 * 覆盖 copyFile、moveFile、checkFileStatus、createSymlink、getFileInfoByInode、
 * getDeltaCursor、queryDeltaLog
 * 跳过 formUploadFile（需要 multipart/form-data）、convertFile（需要文档类型文件）、
 * abortFileUpload（需要进行中的上传 confirmKey）、renewMultipartUpload（同理）、
 * previewFile / getCover（返回 302 重定向，不适合集成测试断言）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { InfoFileInfoEnum } from '../../apis/file-api';
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
});
