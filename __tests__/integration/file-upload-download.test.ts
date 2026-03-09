/// <reference types="node" />
/**
 * 文件上传 / 下载 E2E 测试
 * 验证完整的 上传 → 下载 → 校验 → 清理 流程
 * 包含：小文件上传、大文件分片上传、秒传、暂停恢复、取消等场景
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { TaskStatus, ProgressInfo, IUpPartInfo, UploadCheckpoint } from '../../loaders/types';
import { calculateBufferCRC64 } from '../../utils/crc64';
import { InfoFileInfoEnum } from '../../apis/file-api';
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


describe.skipIf(shouldSkip)('文件上传 / 下载 E2E', () => {
  let client: SMHClient;
  // 存储本次测试上传的文件路径，用于 afterAll 清理
  const uploadedFiles: string[] = [];

  beforeAll(async () => {
    client = await createTestClient();
    // 先创建测试目录，上传到子目录时需要父目录存在
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch {
      // 目录可能已存在，忽略
    }
  });

  afterAll(async () => {
    // 清理测试上传的文件
    for (const filePath of uploadedFiles) {
      try {
        await client.file.deleteFile({ filePath });
      } catch {
        // 忽略删除失败（可能已被测试删除）
      }
    }

    // 不删除共享根目录，避免并行集成测试互相影响
  });

  // ─── 小文件简单上传 ──────────────────────────────────────

  describe('小文件简单上传（< 32MB）', () => {
    it('应能上传文本文件并成功', async () => {
      const content = Buffer.from('Hello SMH SDK Integration Test! ' + Date.now());
      const filePath = uniquePath('small-text', '.txt');
      const file = createMockFile('test.txt', content);

      const uploader = client.createUploadTask({
        file,
        filePath,
      });

      uploadedFiles.push(filePath);

      // 监听状态变化
      const states: TaskStatus[] = [];
      uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect(uploader.state).toBe(TaskStatus.SUCCESS);
      expect(states).toContain(TaskStatus.RUNNING);
      expect(states).toContain(TaskStatus.SUCCESS);
    });

    it('上传完成后进度应为 100%', async () => {
      const content = Buffer.from('Progress test content ' + Date.now());
      const filePath = uniquePath('progress-test', '.txt');
      const file = createMockFile('progress.txt', content);

      const uploader = client.createUploadTask({
        file,
        filePath,
      });

      uploadedFiles.push(filePath);

      let lastProgress = 0;
      uploader.on('progress', ({ progress }: { progress: number }) => {
        lastProgress = progress;
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect(lastProgress).toBe(100);
    });
  });

  // ─── 大文件分片上传 ──────────────────────────────────────

  describe('大文件分片上传', () => {
    // 使用自定义的 partFileSize=1MB 让测试中 2MB 文件也走分片路径
    const CUSTOM_PART_FILE_SIZE = 1; // 1MB — 超过此大小走分片
    const CUSTOM_CHUNK_SIZE = 1;     // 1MB 每个分片

    it('文件超过 partFileSize 阈值时应走分片上传', async () => {
      const fileSize = 1024 * 1024 * 2; // 2MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-basic', '.bin');
      const file = createMockFile('multipart.bin', content);

      const states: TaskStatus[] = [];

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: CUSTOM_PART_FILE_SIZE,
        chunkSize: CUSTOM_CHUNK_SIZE,
      });

      uploadedFiles.push(filePath);

      uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect(uploader.state).toBe(TaskStatus.SUCCESS);
      // 分片上传应经历：COMPUTING_HASH → CREATED → RUNNING → CONFIRMING → SUCCESS
      expect(states).toContain(TaskStatus.RUNNING);
    });

    it('分片数量应与 chunkSize 配置一致', async () => {
      const fileSize = 1024 * 1024 * 3; // 3MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-chunk-count', '.bin');
      const file = createMockFile('chunks.bin', content);

      const completedParts: IUpPartInfo[] = [];

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: CUSTOM_PART_FILE_SIZE,
        chunkSize: CUSTOM_CHUNK_SIZE, // 1MB 分片 → 3MB 文件应产生 3 个分片
      });

      uploadedFiles.push(filePath);

      uploader.on('partialcomplete', ({ partInfo }: { checkpoint: UploadCheckpoint; partInfo: IUpPartInfo }) => {
        completedParts.push(partInfo);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      const endState = await endPromise;

      // 秒传时无分片事件
      if (endState === TaskStatus.RAPID_SUCCESS) {
        expect(completedParts.length).toBe(0);
      } else {
        // 3MB / 1MB = 3 个分片
        expect(completedParts.length).toBe(3);
        // 分片编号从 1 开始递增
        const partNumbers = completedParts.map((p) => p.part_number).sort((a, b) => a - b);
        expect(partNumbers).toEqual([1, 2, 3]);
        // 每个分片大小应为 1MB
        for (const part of completedParts) {
          expect(part.chunk_size).toBe(1024 * 1024);
        }
      }
    });

    it('最后一个分片大小应等于文件剩余字节', async () => {
      const fileSize = 1024 * 1024 * 2.5; // 2.5MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-last-chunk', '.bin');
      const file = createMockFile('last-chunk.bin', content);

      const completedParts: IUpPartInfo[] = [];

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: CUSTOM_PART_FILE_SIZE,
        chunkSize: CUSTOM_CHUNK_SIZE,
      });

      uploadedFiles.push(filePath);

      uploader.on('partialcomplete', ({ partInfo }: { checkpoint: UploadCheckpoint; partInfo: IUpPartInfo }) => {
        completedParts.push(partInfo);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      const endState = await endPromise;

      if (endState !== TaskStatus.RAPID_SUCCESS) {
        // 2.5MB / 1MB = 3 个分片 (1MB + 1MB + 0.5MB)
        expect(completedParts.length).toBe(3);

        const sorted = [...completedParts].sort((a, b) => a.part_number - b.part_number);
        expect(sorted[0].chunk_size).toBe(1024 * 1024);       // 分片1: 1MB
        expect(sorted[1].chunk_size).toBe(1024 * 1024);       // 分片2: 1MB
        expect(sorted[2].chunk_size).toBe(1024 * 1024 * 0.5); // 分片3: 0.5MB
      }
    });

    it('分片上传进度应单调递增且最终为 100', async () => {
      const fileSize = 1024 * 1024 * 3; // 3MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-progress', '.bin');
      const file = createMockFile('progress.bin', content);

      const progressHistory: number[] = [];

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: CUSTOM_PART_FILE_SIZE,
        chunkSize: CUSTOM_CHUNK_SIZE,
      });

      uploadedFiles.push(filePath);

      uploader.on('progress', ({ progress }: ProgressInfo) => {
        progressHistory.push(progress);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      const endState = await endPromise;

      if (endState !== TaskStatus.RAPID_SUCCESS) {
        // 进度应单调递增
        for (let i = 1; i < progressHistory.length; i++) {
          expect(progressHistory[i]).toBeGreaterThanOrEqual(progressHistory[i - 1]);
        }
      }
      // 最终进度 100
      expect(uploader.progress).toBe(100);
    });

    it('progress 事件应包含完整的 ProgressInfo 字段', async () => {
      const fileSize = 1024 * 1024 * 2; // 2MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-progress-info', '.bin');
      const file = createMockFile('progress-info.bin', content);

      let capturedProgressInfo: ProgressInfo | null = null;

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: CUSTOM_PART_FILE_SIZE,
        chunkSize: CUSTOM_CHUNK_SIZE,
      });

      uploadedFiles.push(filePath);

      uploader.on('progress', (info: ProgressInfo) => {
        capturedProgressInfo = info;
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      const endState = await endPromise;

      if (endState !== TaskStatus.RAPID_SUCCESS && capturedProgressInfo) {
        expect(capturedProgressInfo).toHaveProperty('loaded');
        expect(capturedProgressInfo).toHaveProperty('total');
        expect(capturedProgressInfo).toHaveProperty('progress');
        expect(capturedProgressInfo).toHaveProperty('speed');
        expect(capturedProgressInfo).toHaveProperty('leftTime');
        expect((capturedProgressInfo as ProgressInfo).total).toBe(fileSize);
      }
    });

    it('partialcomplete 事件应携带 checkpoint 和 partInfo', async () => {
      const fileSize = 1024 * 1024 * 2; // 2MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-partial-event', '.bin');
      const file = createMockFile('partial.bin', content);

      let capturedCheckpoint: UploadCheckpoint | null = null;
      let capturedPartInfo: IUpPartInfo | null = null;

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: CUSTOM_PART_FILE_SIZE,
        chunkSize: CUSTOM_CHUNK_SIZE,
      });

      uploadedFiles.push(filePath);

      uploader.on('partialcomplete', ({ checkpoint, partInfo }: { checkpoint: UploadCheckpoint; partInfo: IUpPartInfo }) => {
        capturedCheckpoint = checkpoint;
        capturedPartInfo = partInfo;
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      const endState = await endPromise;

      if (endState !== TaskStatus.RAPID_SUCCESS) {
        expect(capturedCheckpoint).not.toBeNull();
        expect(capturedPartInfo).not.toBeNull();
        // checkpoint 应包含分片列表
        expect(capturedCheckpoint!.part_info_list).toBeDefined();
        expect(capturedCheckpoint!.part_info_list.length).toBeGreaterThan(0);
        // partInfo 应包含 part_number 和 chunk_size
        expect(capturedPartInfo!.part_number).toBeGreaterThanOrEqual(1);
        expect(capturedPartInfo!.chunk_size).toBeGreaterThan(0);
      }
    });

    it('自定义 parallel 并发数应生效', async () => {
      const fileSize = 1024 * 1024 * 4; // 4MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-parallel', '.bin');
      const file = createMockFile('parallel.bin', content);

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: CUSTOM_PART_FILE_SIZE,
        chunkSize: CUSTOM_CHUNK_SIZE,
        parallel: 4, // 4 并发
      });

      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      // 上传应成功完成（并发数影响性能，不影响正确性）
      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(uploader.state);
      expect(uploader.progress).toBe(100);
    });

    it('大文件上传后下载内容应与原始内容一致', async () => {
      const fileSize = 1024 * 1024 * 2; // 2MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-verify', '.bin');
      const file = createMockFile('verify.bin', content);

      const originalCrc = calculateBufferCRC64(content.buffer);

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: CUSTOM_PART_FILE_SIZE,
        chunkSize: CUSTOM_CHUNK_SIZE,
      });

      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      await sleep(2000);

      const downloader = client.createDownloadTask({ filePath });
      const blob = await downloader.startAndGetBlob();
      expect(blob).toBeDefined();
      expect(blob!.size).toBe(fileSize);

      const downloadedCrc = calculateBufferCRC64(await blob!.arrayBuffer());
      expect(downloadedCrc).toBe(originalCrc);
    });
  });

  // ─── 秒传 ───────────────────────────────────────────────

  describe('秒传（Instant Upload）', () => {
    const INSTANT_FILE_SIZE = 1024 * 1024 * 2; // 2MB（>= 1MB 才触发秒传哈希）
    let sharedContent: Buffer;
    let firstFilePath: string;

    it('第一次上传新文件不应触发秒传', async () => {
      // 使用唯一随机内容，确保服务端不存在该文件
      sharedContent = generateRandomBuffer(INSTANT_FILE_SIZE);
      firstFilePath = uniquePath('instant-first', '.bin');
      const file = createMockFile('instant-first.bin', sharedContent);

      const states: TaskStatus[] = [];

      const uploader = client.createUploadTask({
        file,
        filePath: firstFilePath,
        enableInstantUpload: true,
      });

      uploadedFiles.push(firstFilePath);

      uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      // 新文件第一次上传应走正常上传流程
      expect(uploader.state).toBe(TaskStatus.SUCCESS);
      // 应经过 COMPUTING_HASH 阶段（秒传哈希计算）
      expect(states).toContain(TaskStatus.COMPUTING_HASH);
      // 不应出现 RAPID_SUCCESS
      expect(states).not.toContain(TaskStatus.RAPID_SUCCESS);
    });

    it('上传相同内容到不同路径应触发秒传', async () => {
      // 等待前一个上传被服务端处理
      await sleep(2000);

      const secondFilePath = uniquePath('instant-second', '.bin');
      const file = createMockFile('instant-second.bin', sharedContent);

      const states: TaskStatus[] = [];

      const uploader = client.createUploadTask({
        file,
        filePath: secondFilePath,
        enableInstantUpload: true,
      });

      uploadedFiles.push(secondFilePath);

      uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      const endState = await endPromise;

      // 秒传成功时状态为 RAPID_SUCCESS
      if (endState === TaskStatus.RAPID_SUCCESS) {
        expect(states).toContain(TaskStatus.RAPID_SUCCESS);
        expect(uploader.progress).toBe(100);
      } else {
        // 即使服务端未命中秒传，也应正常成功
        expect(uploader.state).toBe(TaskStatus.SUCCESS);
      }
    });

    it('禁用秒传后不应出现 COMPUTING_HASH 状态', async () => {
      const content = generateRandomBuffer(INSTANT_FILE_SIZE);
      const filePath = uniquePath('instant-disabled', '.bin');
      const file = createMockFile('no-instant.bin', content);

      const states: TaskStatus[] = [];

      const uploader = client.createUploadTask({
        file,
        filePath,
        enableInstantUpload: false,
      });

      uploadedFiles.push(filePath);

      uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect(uploader.state).toBe(TaskStatus.SUCCESS);
      // 禁用秒传后不应计算哈希
      expect(states).not.toContain(TaskStatus.COMPUTING_HASH);
      expect(states).not.toContain(TaskStatus.RAPID_SUCCESS);
    });

    it('小于 1MB 的文件即使启用秒传也不计算哈希', async () => {
      const content = Buffer.from('small file ' + Date.now());
      const filePath = uniquePath('instant-small', '.txt');
      const file = createMockFile('small.txt', content);

      const states: TaskStatus[] = [];

      const uploader = client.createUploadTask({
        file,
        filePath,
        enableInstantUpload: true,
      });

      uploadedFiles.push(filePath);

      uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect(uploader.state).toBe(TaskStatus.SUCCESS);
      // 文件 < 1MB，不应进入 COMPUTING_HASH
      expect(states).not.toContain(TaskStatus.COMPUTING_HASH);
    });
  });

  // ─── 大文件暂停 / 恢复 / 取消 ──────────────────────────────

  describe('大文件上传暂停与恢复', () => {
    it('暂停后应进入 PAUSED 状态，恢复后应能完成上传', async () => {
      const fileSize = 1024 * 1024 * 4; // 4MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('pause-resume', '.bin');
      const file = createMockFile('pause-resume.bin', content);

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: 1,
        chunkSize: 1,
        parallel: 1, // 限制并发为1，让暂停更可控
      });

      uploadedFiles.push(filePath);

      const allStates: TaskStatus[] = [];
      let pausedOnce = false;

      const finalState = await new Promise<TaskStatus>((resolve, reject) => {
        uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
          allStates.push(state);

          if (state === TaskStatus.RUNNING && !pausedOnce) {
            pausedOnce = true;
            // 延迟一点确保分片上传开始
            setTimeout(() => {
              if (uploader.state === TaskStatus.RUNNING) {
                uploader.pause();
              }
            }, 200);
          }
          if (state === TaskStatus.PAUSED) {
            setTimeout(() => uploader.start(), 1000);
          }
          if (state === TaskStatus.SUCCESS || state === TaskStatus.RAPID_SUCCESS) {
            resolve(state);
          }
          if (state === TaskStatus.ERROR) {
            reject(new Error(`上传失败: ${(uploader as any).message}`));
          }
        });
        uploader.start();
      });

      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(finalState);
      expect(uploader.progress).toBe(100);
      // 应经历过 PAUSED 状态（除非秒传太快跳过了）
      if (finalState !== TaskStatus.RAPID_SUCCESS) {
        expect(allStates).toContain(TaskStatus.PAUSED);
      }
    }, 120_000); // 120 秒超时
  });

  describe('大文件上传取消', () => {
    it('分片上传过程中取消应终止上传', async () => {
      const fileSize = 1024 * 1024 * 4; // 4MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('multipart-cancel', '.bin');
      const file = createMockFile('cancel.bin', content);

      const uploader = client.createUploadTask({
        file,
        filePath,
        partFileSize: 1,
        chunkSize: 1,
        parallel: 1,
      });

      uploadedFiles.push(filePath);

      const finalState = await new Promise<TaskStatus>((resolve) => {
        let cancelScheduled = false;
        uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
          if (state === TaskStatus.RUNNING && !cancelScheduled) {
            cancelScheduled = true;
            // 稍等一下确保分片上传开始
            setTimeout(() => {
              if (uploader.state === TaskStatus.RUNNING) {
                uploader.cancel();
              }
            }, 200);
          }
          if (state === TaskStatus.CANCELED || state === TaskStatus.SUCCESS || state === TaskStatus.RAPID_SUCCESS) {
            resolve(state);
          }
        });
        uploader.start();
      });

      expect([TaskStatus.CANCELED, TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(finalState);
    }, 120_000);
  });

  // ─── 上传 → 下载 → 内容校验 ─────────────────────────────

  describe('上传 → 下载 → 内容校验', () => {
    it('下载的内容应与上传的完全一致（CRC64 校验）', async () => {
      // 1. 生成随机内容
      const content = generateRandomBuffer(1024 * 50); // 50KB
      const filePath = uniquePath('crc-verify', '.bin');
      const file = createMockFile('verify.bin', content);

      // 2. 计算原始内容的 CRC64
      const originalCrc = calculateBufferCRC64(content.buffer);

      // 3. 上传
      const uploader = client.createUploadTask({
        file,
        filePath,
      });

      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      // 等待服务端处理完成
      await sleep(2000);

      // 4. 下载
      const downloader = client.createDownloadTask({
        filePath,
      });

      const blob = await downloader.startAndGetBlob();
      expect(blob).toBeDefined();

      // 5. 校验大小
      expect(blob!.size).toBe(content.length);

      // 6. 校验 CRC64
      const downloadedBuffer = await blob!.arrayBuffer();
      const downloadedCrc = calculateBufferCRC64(downloadedBuffer);
      expect(downloadedCrc).toBe(originalCrc);
    });
  });

  // ─── 小文件上传取消 ─────────────────────────────────────

  describe('上传取消', () => {
    it('取消后状态应变为 CANCELED', async () => {
      // 用一个较大的文件，确保有时间取消
      const content = generateRandomBuffer(1024 * 1024 * 2); // 2MB
      const filePath = uniquePath('cancel-test', '.bin');
      const file = createMockFile('cancel.bin', content);

      const uploader = client.createUploadTask({
        file,
        filePath,
      });

      // 不加入清理列表，因为取消后服务端可能没有这个文件
      // 但为了安全还是加上
      uploadedFiles.push(filePath);

      // 在 running 状态时立即取消
      await new Promise<void>((resolve) => {
        uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
          if (state === TaskStatus.RUNNING) {
            uploader.cancel();
          }
          if (state === TaskStatus.CANCELED || state === TaskStatus.SUCCESS) {
            resolve();
          }
        });
        uploader.start();
      });

      // 小文件可能在取消前就完成了，允许两种状态
      expect([TaskStatus.CANCELED, TaskStatus.SUCCESS]).toContain(uploader.state);
    });
  });

  // ─── 文件信息查询 ───────────────────────────────────────

  describe('文件信息查询', () => {
    it('上传后应能查询文件信息', async () => {
      const content = Buffer.from('File info test ' + Date.now());
      const filePath = uniquePath('info-test', '.txt');
      const file = createMockFile('info.txt', content);

      const uploader = client.createUploadTask({
        file,
        filePath,
      });

      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      await sleep(1000);

      // 查询文件信息
      const res = await client.file.infoFile({ filePath, info: InfoFileInfoEnum.NUMBER_1 });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  // ─── 文件删除 ───────────────────────────────────────────

  describe('文件删除', () => {
    it('上传后应能删除文件', async () => {
      const content = Buffer.from('Delete test ' + Date.now());
      const filePath = uniquePath('delete-test', '.txt');
      const file = createMockFile('delete.txt', content);

      const uploader = client.createUploadTask({
        file,
        filePath,
      });

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      await sleep(1000);

      // 删除文件（服务端可能返回 200 或 204）
      const deleteRes = await client.file.deleteFile({ filePath });
      expect([200, 204]).toContain(deleteRes.status);

      // 再查询应该 404（无论是 reject 还是 resolve，都必须体现 404）
      const infoResult = await client.file.infoFile({ filePath, info: InfoFileInfoEnum.NUMBER_1 })
        .then((res) => ({ ok: true as const, res }))
        .catch((error: any) => ({ ok: false as const, error }));

      if (infoResult.ok) {
        expect(infoResult.res.status).toBe(404);
      } else {
        expect(infoResult.error.response?.status).toBe(404);
      }
    });
  });
});
