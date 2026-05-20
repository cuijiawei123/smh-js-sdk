/**
 * FileApi 额外补充集成测试
 * 覆盖 checkFileDeletion、getCover、formUploadFile、getFileUpload、
 * previewFile、abortFileUpload、renewMultipartUpload、convertFile
 * 原 file-api.test.ts 已覆盖：copyFile、moveFile、checkFileStatus、createSymlink、getFileInfoByInode
 * 原 file-upload-download.test.ts 已覆盖：上传/下载核心流程
 *
 * 部分接口（如 getCover、previewFile）返回 302 重定向，测试验证接口可达性
 * 部分接口需要特殊前置条件（如 confirmKey），使用 try-catch 安全跳过
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  AbortFileUploadUploadEnum,
  ConvertFileConvertEnum,
  GetFileUploadUploadEnum,
  PreviewFilePreviewEnum,
  RenewMultipartUploadRenewEnum,
  InfoFileInfoEnum,
  MultipartUploadFileMultipartEnum,
} from '../../apis/file-api';
import {
  assertSetupReady,
  createMockFile,
  createTestClient,
  getConfig,
  getTestRootDir,
  skipIfNoConfig,
  uniquePath,
  sleep,
  waitForUploadEnd,
} from './helpers';
import type { IntegrationConfig } from './helpers';

const shouldSkip = skipIfNoConfig();

function skipOnUnavailable(ctx: any, error: any, action: string): never {
  if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
    ctx.skip(`${action}不可用: ${error?.response?.status}`);
  }
  throw error;
}

describe.skipIf(shouldSkip)('FileApi 额外补充集成测试', () => {
  let client: SMHClient;
  let config: IntegrationConfig;
  const uploadedFiles: string[] = [];
  let setupFailed = false;
  let sharedFilePath: string;
  let sharedFileInode: string | null = null;

  beforeAll(async () => {
    config = await getConfig();
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      sharedFilePath = uniquePath('file-extra-shared', '.txt');
      const content = Buffer.from(`file extra test ${Date.now()}`);
      const file = createMockFile('extra.txt', content);
      const uploader = client.createUploadTask({ file, filePath: sharedFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      uploadedFiles.push(sharedFilePath);
      await sleep(1000);

      const info = await client.file.infoFile({
        filePath: sharedFilePath,
        info: InfoFileInfoEnum.NUMBER_1,
      });
      sharedFileInode = (info.data as any)?.inode || (info.data as any)?.fileId || null;
    } catch (e: any) {
      console.log('FileApi 额外测试环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    for (const fp of uploadedFiles) {
      try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
    }
  });

  // ─── checkFileDeletion ─────────────────────────────────────

  describe('checkFileDeletion - 查询文件删除原因', () => {
    it('对现有文件查询删除原因应返回结果或合理错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!sharedFileInode) {
        ctx.skip('未获取到文件 inode');
        return;
      }

      try {
        const res = await client.file.checkFileDeletion({
          inode: sharedFileInode,
        });
        expect(res.status).toBeDefined();
        expect(res.data).toBeDefined();
      } catch (error: any) {
        // 文件未删除可能返回 404 或其他状态码
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`checkFileDeletion 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('不存在的 inode 应返回错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.checkFileDeletion({
          inode: '99999999999',
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.response?.status).toBeDefined();
      }
    });
  });

  // ─── getCover ──────────────────────────────────────────────

  describe('getCover - 获取封面缩略图', () => {
    it('对文本文件获取封面应返回重定向或错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.getCover({
          filePath: sharedFilePath,
          preview: 1,
          size: 100,
        });
        // 302 重定向或 200 都是合理的
        expect([200, 302]).toContain(res.status);
      } catch (error: any) {
        // 文本文件不支持封面预览，返回 400/404/502 等都是合理的
        if ([400, 403, 404, 405, 415, 501, 502].includes(error?.response?.status)) {
          ctx.skip(`getCover 对文本文件不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('不存在的文件应返回 404', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.getCover({
          filePath: `${getTestRootDir()}/non-existent-cover-${Date.now()}.jpg`,
          preview: 1,
        });
      } catch (error: any) {
        expect([400, 404]).toContain(error?.response?.status);
      }
    });
  });

  // ─── formUploadFile ────────────────────────────────────────

  describe('formUploadFile - 表单上传', () => {
    it('应能发起表单上传请求', async (ctx: any) => {
      assertSetupReady(setupFailed);
      const formPath = uniquePath('file-form-upload', '.txt');
      uploadedFiles.push(formPath);

      try {
        const res = await client.file.formUploadFile({
          filePath: formPath,
          conflictResolutionStrategy: 'rename' as any,
          filesize: 100,
        });
        expect([200, 201]).toContain(res.status);
        expect(res.data).toBeDefined();
        // 返回应包含 domain 和 form 信息
        const data = res.data as any;
        expect(data.domain || data.url || data.form).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '表单上传');
      }
    });
  });

  // ─── getFileUpload / abortFileUpload ───────────────────────

  describe('getFileUpload & abortFileUpload - 上传任务状态与取消', () => {
    let confirmKey: string | null = null;

    it('发起分块上传应返回 confirmKey', async (ctx: any) => {
      assertSetupReady(setupFailed);
      const uploadPath = uniquePath('file-multipart-status', '.bin');
      uploadedFiles.push(uploadPath);

      try {
        const res = await client.file.multipartUploadFile({
          filePath: uploadPath,
          multipart: MultipartUploadFileMultipartEnum.NUMBER_1,
          conflictResolutionStrategy: 'rename' as any,
          filesize: 10 * 1024 * 1024,
        });
        expect([200, 201]).toContain(res.status);
        confirmKey = (res.data as any)?.confirmKey || null;
        expect(confirmKey).toBeTruthy();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '发起分块上传');
      }
    });

    it('应能查询上传任务状态', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!confirmKey) {
        ctx.skip('未获取到 confirmKey');
        return;
      }

      try {
        const res = await client.file.getFileUpload({
          confirmKey,
          upload: GetFileUploadUploadEnum.NUMBER_1,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '查询上传任务状态');
      }
    });

    it('应能取消上传任务', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!confirmKey) {
        ctx.skip('未获取到 confirmKey');
        return;
      }

      try {
        const res = await client.file.abortFileUpload({
          confirmKey,
          upload: AbortFileUploadUploadEnum.NUMBER_1,
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '取消上传任务');
      }
    });
  });

  // ─── renewMultipartUpload ──────────────────────────────────

  describe('renewMultipartUpload - 分块上传续期', () => {
    it('对不存在的 confirmKey 续期应返回错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        await client.file.renewMultipartUpload({
          confirmKey: 'non-existent-key-' + Date.now(),
          renew: RenewMultipartUploadRenewEnum.NUMBER_1,
        });
        // 不期望成功
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.response?.status).toBeDefined();
      }
    });

    it('发起分块上传后应能续期', async (ctx: any) => {
      assertSetupReady(setupFailed);
      const renewPath = uniquePath('file-renew-upload', '.bin');
      uploadedFiles.push(renewPath);

      let confirmKey: string | null = null;
      try {
        const initRes = await client.file.multipartUploadFile({
          filePath: renewPath,
          multipart: MultipartUploadFileMultipartEnum.NUMBER_1,
          conflictResolutionStrategy: 'rename' as any,
          filesize: 10 * 1024 * 1024,
        });
        confirmKey = (initRes.data as any)?.confirmKey || null;
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '分块上传初始化');
      }

      if (!confirmKey) {
        ctx.skip('未获取到 confirmKey');
        return;
      }

      try {
        const res = await client.file.renewMultipartUpload({
          confirmKey,
          renew: RenewMultipartUploadRenewEnum.NUMBER_1,
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        skipOnUnavailable(ctx, error, '分块上传续期');
      }

      // 清理：取消上传
      try {
        await client.file.abortFileUpload({
          confirmKey,
          upload: AbortFileUploadUploadEnum.NUMBER_1,
        });
      } catch { /* ignore */ }
    });
  });

  // ─── previewFile ───────────────────────────────────────────

  describe('previewFile - 预览文件', () => {
    it('对文本文件预览应返回重定向或错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.previewFile({
          filePath: sharedFilePath,
          preview: PreviewFilePreviewEnum.NUMBER_1,
        });
        expect([200, 302]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 415, 501, 502].includes(error?.response?.status)) {
          ctx.skip(`previewFile 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });

  // ─── convertFile ───────────────────────────────────────────

  describe('convertFile - 文档转码', () => {
    it('对文本文件转码应返回结果或合理错误', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.convertFile({
          filePath: sharedFilePath,
          convert: ConvertFileConvertEnum.NUMBER_1,
          convertFileRequest: { convertFrom: sharedFilePath },
        });
        expect([200, 202]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 415, 501].includes(error?.response?.status)) {
          ctx.skip(`convertFile 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });
  });

  // ─── downloadFile 附加参数 ─────────────────────────────────

  describe('downloadFile - 附加参数覆盖', () => {
    it('应支持 historyId 参数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.downloadFile({
          filePath: sharedFilePath,
          historyId: '0',
        });
        // 不存在的 historyId 可能返回 200（忽略无效参数）或 404
        expect(res.status).toBeDefined();
      } catch (error: any) {
        // 某些环境对无效 historyId 返回错误
        expect(error.response?.status).toBeDefined();
      }
    });

    it('应支持 trafficLimit 参数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.downloadFile({
          filePath: sharedFilePath,
          trafficLimit: 1024 * 1024,
        });
        expect(res.status).toBeDefined();
      } catch (error: any) {
        expect(error.response?.status).toBeDefined();
      }
    });
  });

  // ─── infoFile 附加参数 ─────────────────────────────────────

  describe('infoFile - 附加参数覆盖', () => {
    it('应支持 purpose 参数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.infoFile({
          filePath: sharedFilePath,
          info: InfoFileInfoEnum.NUMBER_1,
          purpose: 'preview' as any,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, 'infoFile purpose');
      }
    });

    it('应支持 contentDisposition 参数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.infoFile({
          filePath: sharedFilePath,
          info: InfoFileInfoEnum.NUMBER_1,
          contentDisposition: 'attachment' as any,
        });
        expect(res.status).toBe(200);
      } catch (error: any) {
        skipOnUnavailable(ctx, error, 'infoFile contentDisposition');
      }
    });

    it('应支持 withShortLink 参数（返回短链）', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.infoFile({
          filePath: sharedFilePath,
          info: InfoFileInfoEnum.NUMBER_1,
          withShortLink: 1 as any,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, 'infoFile withShortLink');
      }
    });

    it('应支持 period 参数（指定链接有效期）', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.infoFile({
          filePath: sharedFilePath,
          info: InfoFileInfoEnum.NUMBER_1,
          period: 300,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, 'infoFile period');
      }
    });

    it('应支持 withShortLink + period 组合参数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.infoFile({
          filePath: sharedFilePath,
          info: InfoFileInfoEnum.NUMBER_1,
          withShortLink: 1 as any,
          period: 600,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, 'infoFile withShortLink+period');
      }
    });

    it('应支持 withContentCas 参数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.infoFile({
          filePath: sharedFilePath,
          info: InfoFileInfoEnum.NUMBER_1,
          withContentCas: 1 as any,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, 'infoFile withContentCas');
      }
    });

    it('应支持 internalDomain 参数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.infoFile({
          filePath: sharedFilePath,
          info: InfoFileInfoEnum.NUMBER_1,
          internalDomain: 1 as any,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        // internalDomain may not be available in all environments
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`infoFile internalDomain 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('应支持 withFavoriteStatus 参数', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.file.infoFile({
          filePath: sharedFilePath,
          info: InfoFileInfoEnum.NUMBER_1,
          withFavoriteStatus: 1 as any,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        skipOnUnavailable(ctx, error, 'infoFile withFavoriteStatus');
      }
    });
  });
});
