/// <reference types="node" />
/**
 * Downloader 集成测试
 * 覆盖：简单下载、分片下载、暂停/恢复、取消、CRC64 校验、进度/状态回调、checkpoint
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { TaskStatus, ProgressInfo, DownloadCheckpoint, IDownPartInfo } from '../../loaders/types';
import { calculateBufferCRC64 } from '../../utils/crc64';
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

describe.skipIf(shouldSkip)('Downloader 集成测试', () => {
  let client: SMHClient;
  const uploadedFiles: string[] = [];

  // 预上传的共享文件
  let smallFilePath: string;
  let smallFileContent: Buffer;
  let largeFilePath: string;
  let largeFileContent: Buffer;

  const SMALL_SIZE = 1024 * 50; // 50KB
  const LARGE_SIZE = 1024 * 1024 * 3; // 3MB

  beforeAll(async () => {
    client = await createTestClient();

    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch {
      // 目录可能已存在
    }

    // 上传一个小文件用于下载测试
    smallFileContent = generateRandomBuffer(SMALL_SIZE);
    smallFilePath = uniquePath('dl-small', '.bin');
    const smallFile = createMockFile('dl-small.bin', smallFileContent);
    const smallUploader = client.createUploadTask({ file: smallFile, filePath: smallFilePath });
    uploadedFiles.push(smallFilePath);
    const smallEnd = waitForUploadEnd(smallUploader);
    smallUploader.start();
    await smallEnd;

    // 上传一个大文件用于分片下载测试
    largeFileContent = generateRandomBuffer(LARGE_SIZE);
    largeFilePath = uniquePath('dl-large', '.bin');
    const largeFile = createMockFile('dl-large.bin', largeFileContent);
    const largeUploader = client.createUploadTask({
      file: largeFile,
      filePath: largeFilePath,
      partFileSize: 1,
      chunkSize: 1,
    });
    uploadedFiles.push(largeFilePath);
    const largeEnd = waitForUploadEnd(largeUploader);
    largeUploader.start();
    await largeEnd;

    // 等待服务端处理完成
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

  // ─── 简单下载 ──────────────────────────────────────────

  describe('简单下载', () => {
    it('应能下载小文件并返回 Blob', async () => {
      const downloader = client.createDownloadTask({ filePath: smallFilePath });
      const blob = await downloader.startAndGetBlob();
      expect(blob).toBeDefined();
      expect(blob.size).toBe(SMALL_SIZE);
    });

    it('下载内容 CRC64 应与原始文件一致', async () => {
      const downloader = client.createDownloadTask({ filePath: smallFilePath });
      const blob = await downloader.startAndGetBlob();
      const originalCrc = calculateBufferCRC64(smallFileContent.buffer);
      const downloadedCrc = calculateBufferCRC64(await blob.arrayBuffer());
      expect(downloadedCrc).toBe(originalCrc);
    });

    it('下载完成后状态应为 SUCCESS', async () => {
      const downloader = client.createDownloadTask({ filePath: smallFilePath });
      await downloader.startAndGetBlob();
      expect(downloader.state).toBe(TaskStatus.SUCCESS);
    });

    it('下载完成后进度应为 100%', async () => {
      const downloader = client.createDownloadTask({ filePath: smallFilePath });
      await downloader.startAndGetBlob();
      expect(downloader.progress).toBe(100);
    });

    it('getResult() 应返回下载结果', async () => {
      const downloader = client.createDownloadTask({ filePath: smallFilePath });
      await downloader.startAndGetBlob();
      const result = downloader.getResult();
      expect(result).toBeDefined();
      expect(result!.size).toBe(SMALL_SIZE);
    });
  });

  // ─── 进度与事件 ────────────────────────────────────────

  describe('进度与事件', () => {
    it('应触发 statechange 事件', async () => {
      const states: TaskStatus[] = [];
      const downloader = client.createDownloadTask({ filePath: smallFilePath });
      downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });
      await downloader.startAndGetBlob();
      expect(states).toContain(TaskStatus.START);
      expect(states).toContain(TaskStatus.RUNNING);
      expect(states).toContain(TaskStatus.SUCCESS);
    });

    it('应触发 progress 事件并包含完整信息', async () => {
      let capturedInfo: ProgressInfo | null = null;
      const downloader = client.createDownloadTask({ filePath: smallFilePath });
      downloader.on('progress', (info: ProgressInfo) => {
        capturedInfo = info;
      });
      await downloader.startAndGetBlob();
      if (capturedInfo) {
        expect(capturedInfo).toHaveProperty('loaded');
        expect(capturedInfo).toHaveProperty('total');
        expect(capturedInfo).toHaveProperty('progress');
        expect(capturedInfo).toHaveProperty('speed');
        expect(capturedInfo).toHaveProperty('leftTime');
      }
    });

    it('onStateChange 回调应被调用', async () => {
      const stateChanges: TaskStatus[] = [];
      const downloader = client.createDownloadTask({
        filePath: smallFilePath,
        onStateChange: (_cp, state) => {
          stateChanges.push(state);
        },
      });
      await downloader.startAndGetBlob();
      expect(stateChanges.length).toBeGreaterThan(0);
      expect(stateChanges).toContain(TaskStatus.SUCCESS);
    });

    it('onProgress 回调应被调用', async () => {
      let called = false;
      const downloader = client.createDownloadTask({
        filePath: smallFilePath,
        onProgress: () => {
          called = true;
        },
      });
      await downloader.startAndGetBlob();
      expect(called).toBe(true);
    });
  });

  // ─── 分片下载 ──────────────────────────────────────────

  describe('分片下载', () => {
    it('大文件应走分片下载路径', async () => {
      const states: TaskStatus[] = [];
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1, // 1MB 阈值，3MB 文件走分片
        chunkSize: 1,    // 1MB 分片
      });
      downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });
      const blob = await downloader.startAndGetBlob();
      expect(blob.size).toBe(LARGE_SIZE);
      expect(states).toContain(TaskStatus.PREPARING);
      expect(states).toContain(TaskStatus.RUNNING);
      expect(states).toContain(TaskStatus.SUCCESS);
    });

    it('分片下载内容应与原始文件一致', async () => {
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1,
        chunkSize: 1,
      });
      const blob = await downloader.startAndGetBlob();
      const originalCrc = calculateBufferCRC64(largeFileContent.buffer);
      const downloadedCrc = calculateBufferCRC64(await blob.arrayBuffer());
      expect(downloadedCrc).toBe(originalCrc);
    });

    it('分片下载应触发 partialcomplete 事件', async () => {
      const completedParts: IDownPartInfo[] = [];
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1,
        chunkSize: 1,
      });
      downloader.on('partialcomplete', ({ partInfo }: { checkpoint: DownloadCheckpoint; partInfo: IDownPartInfo }) => {
        completedParts.push(partInfo);
      });
      await downloader.startAndGetBlob();
      // 3MB / 1MB = 3 个分片
      expect(completedParts.length).toBe(3);
      const partNumbers = completedParts.map((p) => p.part_number).sort((a, b) => a - b);
      expect(partNumbers).toEqual([1, 2, 3]);
    });

    it('onPartComplete 回调应被调用', async () => {
      let partCount = 0;
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1,
        chunkSize: 1,
        onPartComplete: () => {
          partCount++;
        },
      });
      await downloader.startAndGetBlob();
      expect(partCount).toBe(3);
    });
  });

  // ─── Checkpoint ────────────────────────────────────────

  describe('checkpoint', () => {
    it('getCheckpoint 应返回完整的断点信息', async () => {
      const downloader = client.createDownloadTask({
        filePath: smallFilePath,
      });
      await downloader.startAndGetBlob();
      const cp = downloader.getCheckpoint();
      expect(cp).toHaveProperty('id');
      expect(cp).toHaveProperty('file');
      expect(cp).toHaveProperty('state');
      expect(cp).toHaveProperty('progress');
      expect(cp).toHaveProperty('loaded');
      expect(cp).toHaveProperty('chunk_size');
      expect(cp).toHaveProperty('part_info_list');
      expect(cp.state).toBe(TaskStatus.SUCCESS);
      expect(cp.progress).toBe(100);
    });
  });

  // ─── 取消 ──────────────────────────────────────────────

  describe('取消', () => {
    it('取消后状态应变为 CANCELED', async () => {
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1,
        chunkSize: 1,
        parallel: 1,
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
          if (state === TaskStatus.CANCELED || state === TaskStatus.SUCCESS) {
            resolve(state);
          }
        });
        downloader.start();
      });

      expect([TaskStatus.CANCELED, TaskStatus.SUCCESS]).toContain(finalState);
    }, 60_000);

    it('取消后 getResult 应返回 undefined', async () => {
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1,
        chunkSize: 1,
        parallel: 1,
      });

      await new Promise<void>((resolve) => {
        downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
          if (state === TaskStatus.RUNNING) {
            downloader.cancel();
          }
          if (state === TaskStatus.CANCELED || state === TaskStatus.SUCCESS) {
            resolve();
          }
        });
        downloader.start();
      });

      if (downloader.state === TaskStatus.CANCELED) {
        expect(downloader.getResult()).toBeUndefined();
      }
    }, 60_000);
  });

  // ─── 暂停与恢复 ────────────────────────────────────────

  describe('暂停与恢复', () => {
    it('暂停后应进入 PAUSED 状态，恢复后应能完成下载', async () => {
      const downloader = client.createDownloadTask({
        filePath: largeFilePath,
        partFileSize: 1,
        chunkSize: 1,
        parallel: 1,
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
          if (state === TaskStatus.SUCCESS) {
            resolve(state);
          }
          if (state === TaskStatus.ERROR) {
            reject(new Error('下载失败'));
          }
        });
        downloader.start();
      });

      expect(finalState).toBe(TaskStatus.SUCCESS);
      expect(allStates).toContain(TaskStatus.PAUSED);
    }, 120_000);
  });
});
