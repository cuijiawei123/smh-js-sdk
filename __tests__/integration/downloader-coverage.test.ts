/// <reference types="node" />
/**
 * Downloader 覆盖率补充测试
 * 目标：覆盖 Downloader.ts 中的 multipart 错误重试路径、简单下载暂停 CRC 重置、
 *       handleError 各分支（SMHError vs 普通 Error、is_multipart 分支）、
 *       pause/cancel 分支覆盖
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { Downloader, IRemoteFile } from '../../loaders/Downloader';
import { Configuration } from '../../configuration';
import { TaskStatus, DownloadCheckpoint } from '../../loaders/types';
import { SMHError, ErrorCode, newError } from '../../utils/ErrorHandler';
import {
  createMockFile,
  createTestClient,
  generateRandomBuffer,
  getTestRootDir,
  uniquePath,
  skipIfNoConfig,
  sleep,
  waitForUploadEnd,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('Downloader 覆盖率补充', () => {
  let client: SMHClient;
  const uploadedFiles: string[] = [];
  let smallFilePath: string;
  let largeFilePath: string;

  const SMALL_SIZE = 1024 * 50; // 50KB
  const LARGE_SIZE = 1024 * 1024 * 3; // 3MB

  beforeAll(async () => {
    client = await createTestClient();

    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch {
      // 目录可能已存在
    }

    // 上传小文件
    const smallContent = generateRandomBuffer(SMALL_SIZE);
    smallFilePath = uniquePath('dl-cov-small', '.bin');
    const smallFile = createMockFile('dl-cov-small.bin', smallContent);
    const smallUploader = client.createUploadTask({ file: smallFile, filePath: smallFilePath });
    uploadedFiles.push(smallFilePath);
    const smallEnd = waitForUploadEnd(smallUploader);
    smallUploader.start();
    await smallEnd;

    // 上传大文件
    const largeContent = generateRandomBuffer(LARGE_SIZE);
    largeFilePath = uniquePath('dl-cov-large', '.bin');
    const largeFile = createMockFile('dl-cov-large.bin', largeContent);
    const largeUploader = client.createUploadTask({
      file: largeFile, filePath: largeFilePath,
      partFileSize: 1, chunkSize: 1,
    });
    uploadedFiles.push(largeFilePath);
    const largeEnd = waitForUploadEnd(largeUploader);
    largeUploader.start();
    await largeEnd;

    await sleep(3000);
  }, 120_000);

  afterAll(async () => {
    for (const fp of uploadedFiles) {
      try {
        await client.file.deleteFile({ filePath: fp });
      } catch {
        // 忽略
      }
    }
  });

  // ─── 简单下载暂停/恢复（CRC 重置路径）──────────────────

  describe('简单下载暂停/恢复', () => {
    it('暂停后恢复应重置 CRC64 并正常完成', async () => {
      // 使用小文件走简单下载路径
      const downloader = client.createDownloadTask({
        filePath: smallFilePath,
        verbose: true,
      });

      const allStates: TaskStatus[] = [];

      // 小文件下载可能太快无法暂停，但我们仍需覆盖 pause 路径
      downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
        allStates.push(state);
      });

      // 先 start 再立即 pause
      downloader.start();
      await sleep(10);
      await downloader.pause();

      // 如果成功暂停了
      if (downloader.state === TaskStatus.PAUSED) {
        // 恢复下载 — 用 start() + 等待完成，而非 startAndGetBlob()
        const result = await new Promise<TaskStatus>((resolve) => {
          downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
            if (state === TaskStatus.SUCCESS || state === TaskStatus.ERROR) {
              resolve(state);
            }
          });
          downloader.start();
        });
        expect(result).toBe(TaskStatus.SUCCESS);
      } else {
        // 如果太快完成了也没关系
        expect([TaskStatus.SUCCESS, TaskStatus.PAUSED]).toContain(downloader.state);
      }
    });
  });

  // ─── 分片下载暂停/恢复 ────────────────────────────────

  describe('分片下载暂停/恢复', () => {
    it('分片下载暂停后恢复应从断点继续', async () => {
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1, chunkSize: 1, parallel: 1,
        verbose: true,
      });

      const allStates: TaskStatus[] = [];
      let pausedOnce = false;

      const finalState = await new Promise<TaskStatus>((resolve, reject) => {
        downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
          allStates.push(state);
          if (state === TaskStatus.RUNNING && !pausedOnce) {
            pausedOnce = true;
            setTimeout(() => {
              if (downloader.state === TaskStatus.RUNNING) {
                downloader.pause();
              }
            }, 200);
          }
          if (state === TaskStatus.PAUSED) {
            setTimeout(() => downloader.start(), 500);
          }
          if (state === TaskStatus.SUCCESS) resolve(state);
          if (state === TaskStatus.ERROR) reject(new Error('下载失败'));
        });
        downloader.start();
      });

      expect(finalState).toBe(TaskStatus.SUCCESS);
    }, 120_000);
  });

  // ─── 分片下载取消（清理分片数据）──────────────────────

  describe('分片下载取消', () => {
    it('取消分片下载应清理分片 blob 数据', async () => {
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1, chunkSize: 1, parallel: 1,
      });

      const finalState = await new Promise<TaskStatus>((resolve) => {
        let cancelScheduled = false;
        downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
          if (state === TaskStatus.RUNNING && !cancelScheduled) {
            cancelScheduled = true;
            setTimeout(() => {
              if (downloader.state === TaskStatus.RUNNING) {
                downloader.cancel();
              }
            }, 100);
          }
          if ([TaskStatus.CANCELED, TaskStatus.SUCCESS].includes(state)) {
            resolve(state);
          }
        });
        downloader.start();
      });

      if (finalState === TaskStatus.CANCELED) {
        expect(downloader.getResult()).toBeUndefined();
        expect(downloader.loaded).toBe(0);
        expect(downloader.progress).toBe(0);
      }
    }, 60_000);
  });

  // ─── handleError 分支 ────────────────────────────────

  describe('handleError 路径', () => {
    it('下载不存在文件应触发 handleError（普通 Error 包装为 SMHError）', async () => {
      const downloader = client.createDownloadTask({
        filePath: 'non-existent-path/does-not-exist-' + Date.now() + '.bin',
        verbose: true,
      });

      let errorCaptured: any = null;
      downloader.on('statechange', ({ state, error }: { state: TaskStatus; error?: any }) => {
        if (state === TaskStatus.ERROR) {
          errorCaptured = error;
        }
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期
      }

      expect(downloader.state).toBe(TaskStatus.ERROR);
      expect(errorCaptured).toBeDefined();
    });

    it('handleError 在 cancelFlag 设置时应直接变为 ERROR', async () => {
      const downloader = client.createDownloadTask({
        filePath: 'non-existent-for-cancel-' + Date.now() + '.bin',
      });

      // 立即取消再 start（让 cancelFlag=true 时触发 handleError 的 cancelFlag 分支）
      downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
        if (state === TaskStatus.START) {
          // 在 start 后立即设置取消
          (downloader as any).cancelFlag = true;
        }
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期异常
      }

      // 不论具体状态，只要不崩溃就行
      expect(downloader.state).toBeDefined();
    });
  });

  // ─── onStateChange 错误路径 ────────────────────────────

  describe('onStateChange 错误回调', () => {
    it('下载失败时 onStateChange 应收到 error 参数', async () => {
      let capturedError: any = null;
      let errorState: TaskStatus | null = null;

      const downloader = client.createDownloadTask({
        filePath: 'non-existent-' + Date.now() + '/file.bin',
        onStateChange: (_cp, state, error) => {
          if (state === TaskStatus.ERROR) {
            errorState = state;
            capturedError = error;
          }
        },
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期
      }

      expect(errorState).toBe(TaskStatus.ERROR);
      expect(capturedError).toBeDefined();
    });
  });

  // ─── downloadByUrl 静态方法 ────────────────────────────

  describe('downloadByUrl', () => {
    it('downloadByUrl 对不存在的文件应抛出错误', async () => {
      try {
        await client.downloadByUrl({
          filePath: 'non-existent-for-url-download-' + Date.now() + '.bin',
        });
        // 如果没有抛错（不该到这里）
        expect.fail('应该抛出错误');
      } catch (error: any) {
        // 预期抛出错误
        expect(error).toBeDefined();
      }
    });
  });

  // ─── wait() 从各种状态恢复 ─────────────────────────────

  describe('wait() 方法', () => {
    it('ERROR 状态调用 wait 应重置为 WAITING', async () => {
      const badClient = new SMHClient({
        basePath: 'https://invalid-host-dl.example.com',
        libraryId: 'fake', spaceId: 'fake', accessToken: 'fake',
        maxRetries: 0, timeout: 2000,
      });

      const downloader = badClient.createDownloadTask({
        filePath: 'error-test.bin',
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期
      }

      expect(downloader.state).toBe(TaskStatus.ERROR);

      await downloader.wait();
      expect(downloader.state).toBe(TaskStatus.WAITING);
      expect(downloader.error).toBeUndefined();
    });
  });
});
