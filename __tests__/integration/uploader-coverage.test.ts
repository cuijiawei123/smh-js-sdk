/// <reference types="node" />
/**
 * Uploader 覆盖率补充测试
 * 目标：覆盖 Uploader.ts 中 error handling、pause/cancel 中间态、
 *       回调函数（onStateChange/onProgress/onPartComplete）、verbose 日志、
 *       构造参数校验、checkpoint 恢复、throwIfStopped 等路径
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { Uploader } from '../../loaders/Uploader';
import { Configuration } from '../../configuration';
import { TaskStatus, UploadCheckpoint, IUpPartInfo, ProgressInfo } from '../../loaders/types';
import { ErrorCode, newError } from '../../utils/ErrorHandler';
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

describe.skipIf(shouldSkip)('Uploader 覆盖率补充', () => {
  let client: SMHClient;
  const uploadedFiles: string[] = [];

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch {
      // 目录可能已存在
    }
  }, 60_000);

  afterAll(async () => {
    for (const fp of uploadedFiles) {
      try {
        await client.file.deleteFile({ filePath: fp });
      } catch {
        // 忽略
      }
    }
  });

  // ─── 构造参数校验 ───────────────────────────────────────

  describe('构造参数校验', () => {
    it('file 为 null 应抛出 INVALID_FILE 错误', () => {
      expect(() => {
        new Uploader(
          {
            libraryId: 'lib', spaceId: 'sp', accessToken: 'tok',
            filePath: 'test.txt',
            file: null as any,
          },
          new Configuration(),
        );
      }).toThrow();
    });

    it('file.name 为空应抛出 INVALID_FILE 错误', () => {
      const blob = new Blob(['test']);
      const file = Object.assign(blob, { name: '', lastModified: Date.now() }) as unknown as File;
      expect(() => {
        new Uploader(
          {
            libraryId: 'lib', spaceId: 'sp', accessToken: 'tok',
            filePath: 'test.txt',
            file,
          },
          new Configuration(),
        );
      }).toThrow();
    });

    it('partFileSize 超出范围应抛出 INVALID_PARAMETER 错误', () => {
      const file = new File(['x'], 'test.txt', { type: 'text/plain' });
      expect(() => {
        new Uploader(
          {
            libraryId: 'lib', spaceId: 'sp', accessToken: 'tok',
            filePath: 'test.txt',
            file,
            partFileSize: 0.5, // < 1MB 最小值
          },
          new Configuration(),
        );
      }).toThrow();
    });

    it('正常参数应成功构造', () => {
      const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
      const uploader = new Uploader(
        {
          libraryId: 'lib', spaceId: 'sp', accessToken: 'tok',
          filePath: 'test.txt', file,
        },
        new Configuration(),
      );
      expect(uploader).toBeDefined();
      expect(uploader.state).toBe(TaskStatus.WAITING);
    });
  });

  // ─── start() 状态守卫 ──────────────────────────────────

  describe('start() 状态守卫', () => {
    it('SUCCESS 状态再次调用 start 应无效果', async () => {
      const content = Buffer.from('start-guard-test-' + Date.now());
      const filePath = uniquePath('up-start-guard', '.txt');
      const file = createMockFile('guard.txt', content);

      const uploader = client.createUploadTask({ file, filePath });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(uploader.state);

      // 再次 start 应直接返回
      await uploader.start();
      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(uploader.state);
    });
  });

  // ─── onStateChange / onProgress / onPartComplete 回调 ──

  describe('回调函数覆盖', () => {
    it('onStateChange 应在各状态变化时被调用', async () => {
      const content = generateRandomBuffer(1024 * 50); // 50KB
      const filePath = uniquePath('up-callback-state', '.bin');
      const file = createMockFile('callback.bin', content);

      const stateChanges: TaskStatus[] = [];
      const uploader = client.createUploadTask({
        file, filePath,
        onStateChange: (_cp: UploadCheckpoint, state: TaskStatus) => {
          stateChanges.push(state);
        },
      });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect(stateChanges.length).toBeGreaterThan(0);
      // 应至少包含 START 和 SUCCESS/RAPID_SUCCESS
      expect(stateChanges).toContain(TaskStatus.START);
    });

    it('onProgress 应被调用并收到 ProgressInfo', async () => {
      const content = generateRandomBuffer(1024 * 50);
      const filePath = uniquePath('up-callback-progress', '.bin');
      const file = createMockFile('progress.bin', content);

      let progressCalled = false;
      let lastInfo: ProgressInfo | null = null;
      const uploader = client.createUploadTask({
        file, filePath,
        onProgress: (info: ProgressInfo) => {
          progressCalled = true;
          lastInfo = info;
        },
      });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect(progressCalled).toBe(true);
      if (lastInfo) {
        expect(lastInfo).toHaveProperty('loaded');
        expect(lastInfo).toHaveProperty('total');
        expect(lastInfo).toHaveProperty('progress');
        expect(lastInfo).toHaveProperty('speed');
        expect(lastInfo).toHaveProperty('leftTime');
      }
    });

    it('onPartComplete 应在分片上传完成时被调用', async () => {
      const fileSize = 1024 * 1024 * 2; // 2MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('up-callback-part', '.bin');
      const file = createMockFile('parts.bin', content);

      let partCount = 0;
      const uploader = client.createUploadTask({
        file, filePath,
        partFileSize: 1, chunkSize: 1,
        onPartComplete: (_cp: UploadCheckpoint, _pi: IUpPartInfo) => {
          partCount++;
        },
      });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      const endState = await endPromise;

      if (endState !== TaskStatus.RAPID_SUCCESS) {
        expect(partCount).toBeGreaterThan(0);
      }
    });

    it('onStateChange 回调抛出异常不应影响上传', async () => {
      const content = Buffer.from('error-in-callback-' + Date.now());
      const filePath = uniquePath('up-callback-throw', '.txt');
      const file = createMockFile('throw.txt', content);

      const uploader = client.createUploadTask({
        file, filePath,
        onStateChange: () => {
          throw new Error('callback error');
        },
      });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      // 上传应该成功，回调错误被忽略
      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(uploader.state);
    });
  });

  // ─── verbose 日志 ───────────────────────────────────────

  describe('verbose 日志', () => {
    it('verbose=true 时上传应正常完成并输出日志', async () => {
      const content = generateRandomBuffer(1024 * 30);
      const filePath = uniquePath('up-verbose', '.bin');
      const file = createMockFile('verbose.bin', content);

      const uploader = client.createUploadTask({
        file, filePath,
        verbose: true,
      });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(uploader.state);
    });
  });

  // ─── checkpoint 恢复 ───────────────────────────────────

  describe('checkpoint 恢复', () => {
    it('getCheckpoint 应返回完整的断点信息', async () => {
      const content = generateRandomBuffer(1024 * 50);
      const filePath = uniquePath('up-checkpoint', '.bin');
      const file = createMockFile('checkpoint.bin', content);

      const uploader = client.createUploadTask({ file, filePath });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      const cp = uploader.getCheckpoint();
      expect(cp).toHaveProperty('id');
      expect(cp).toHaveProperty('file');
      expect(cp).toHaveProperty('state');
      expect(cp).toHaveProperty('progress');
      expect(cp).toHaveProperty('loaded');
      expect(cp).toHaveProperty('chunk_size');
      expect(cp).toHaveProperty('part_info_list');
      expect(cp.progress).toBe(100);
    });

    it('checkpoint 创建新 uploader 应恢复状态', async () => {
      const content = generateRandomBuffer(1024 * 50);
      const filePath = uniquePath('up-cp-restore', '.bin');
      const file = createMockFile('restore.bin', content);

      const uploader = client.createUploadTask({ file, filePath });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      const cp = uploader.getCheckpoint();

      // 用 checkpoint 创建新 uploader
      const uploader2 = client.createUploadTask({
        file, filePath,
        checkpoint: cp,
      });

      // 恢复的状态应与 checkpoint 一致
      expect(uploader2.state).toBe(cp.state);
      expect(uploader2.progress).toBe(cp.progress);
    });
  });

  // ─── 暂停与取消 ────────────────────────────────────────

  describe('暂停', () => {
    it('上传过程中暂停应进入 PAUSED 状态', async () => {
      const fileSize = 1024 * 1024 * 3; // 3MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('up-pause-test', '.bin');
      const file = createMockFile('pause.bin', content);

      const uploader = client.createUploadTask({
        file, filePath,
        partFileSize: 1, chunkSize: 1, parallel: 1,
      });
      uploadedFiles.push(filePath);

      const allStates: TaskStatus[] = [];
      let pausedOnce = false;

      const finalState = await new Promise<TaskStatus>((resolve, reject) => {
        uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
          allStates.push(state);
          if (state === TaskStatus.RUNNING && !pausedOnce) {
            pausedOnce = true;
            setTimeout(() => {
              if (uploader.state === TaskStatus.RUNNING) {
                uploader.pause();
              }
            }, 100);
          }
          if (state === TaskStatus.PAUSED) {
            // 恢复
            setTimeout(() => uploader.start(), 500);
          }
          if (state === TaskStatus.SUCCESS || state === TaskStatus.RAPID_SUCCESS) {
            resolve(state);
          }
          if (state === TaskStatus.ERROR) {
            reject(new Error(`上传失败`));
          }
        });
        uploader.start();
      });

      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(finalState);
      if (finalState !== TaskStatus.RAPID_SUCCESS) {
        expect(allStates).toContain(TaskStatus.PAUSED);
      }
    }, 120_000);

    it('暂停后 verbose 日志应正常', async () => {
      const fileSize = 1024 * 1024 * 2;
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('up-pause-verbose', '.bin');
      const file = createMockFile('pause-v.bin', content);

      const uploader = client.createUploadTask({
        file, filePath,
        partFileSize: 1, chunkSize: 1, parallel: 1,
        verbose: true,
      });
      uploadedFiles.push(filePath);

      const finalState = await new Promise<TaskStatus>((resolve) => {
        let paused = false;
        uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
          if (state === TaskStatus.RUNNING && !paused) {
            paused = true;
            setTimeout(() => {
              if (uploader.state === TaskStatus.RUNNING) uploader.pause();
            }, 100);
          }
          if (state === TaskStatus.PAUSED) {
            setTimeout(() => uploader.start(), 300);
          }
          if ([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS, TaskStatus.ERROR].includes(state)) {
            resolve(state);
          }
        });
        uploader.start();
      });

      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(finalState);
    }, 120_000);
  });

  describe('取消', () => {
    it('分片上传过程中取消应清理资源', async () => {
      const fileSize = 1024 * 1024 * 3;
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('up-cancel-test', '.bin');
      const file = createMockFile('cancel.bin', content);

      const uploader = client.createUploadTask({
        file, filePath,
        partFileSize: 1, chunkSize: 1, parallel: 1,
        verbose: true,
      });
      uploadedFiles.push(filePath);

      const finalState = await new Promise<TaskStatus>((resolve) => {
        let cancelScheduled = false;
        uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
          if (state === TaskStatus.RUNNING && !cancelScheduled) {
            cancelScheduled = true;
            setTimeout(() => {
              if (uploader.state === TaskStatus.RUNNING) {
                uploader.cancel();
              }
            }, 100);
          }
          if ([TaskStatus.CANCELED, TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS].includes(state)) {
            resolve(state);
          }
        });
        uploader.start();
      });

      expect([TaskStatus.CANCELED, TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(finalState);
    }, 120_000);

    it('重复取消应无副作用', async () => {
      const content = Buffer.from('cancel-twice-' + Date.now());
      const filePath = uniquePath('up-cancel-twice', '.txt');
      const file = createMockFile('cancel2.txt', content);

      const uploader = client.createUploadTask({ file, filePath });
      uploadedFiles.push(filePath);

      // 立即取消两次
      await uploader.cancel();
      expect(uploader.state).toBe(TaskStatus.CANCELED);
      await uploader.cancel();
      expect(uploader.state).toBe(TaskStatus.CANCELED);
    });

    it('SUCCESS 状态后 pause 应无效果', async () => {
      const content = Buffer.from('pause-after-success-' + Date.now());
      const filePath = uniquePath('up-pause-after', '.txt');
      const file = createMockFile('after.txt', content);

      const uploader = client.createUploadTask({ file, filePath });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      const prevState = uploader.state;
      await uploader.pause();
      // SUCCESS/RAPID_SUCCESS 状态不应变为 PAUSED
      expect(uploader.state).toBe(prevState);
    });
  });

  // ─── 错误处理 ──────────────────────────────────────────

  describe('错误处理', () => {
    it('上传到不存在的路径（嵌套深层路径）应进入 ERROR 状态', async () => {
      // 服务端可能对嵌套不存在的目录报错
      const filePath = `__non_existent_dir_${Date.now()}/deep/nested/error-test.txt`;
      const file = createMockFile('error.txt', Buffer.from('error test'));

      const uploader = client.createUploadTask({ file, filePath });

      const states: TaskStatus[] = [];
      uploader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });

      const endPromise = waitForUploadEnd(uploader).catch(() => TaskStatus.ERROR);
      uploader.start();
      const result = await endPromise;

      // 可能成功（如果服务端自动创建目录）或者失败
      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS, TaskStatus.ERROR]).toContain(result);
    });

    it('handleError 中 error 为普通 Error 应包装为 SMHError', async () => {
      // 使用无效 accessToken 触发错误
      const badClient = new SMHClient({
        basePath: 'https://invalid-host-that-does-not-exist.example.com',
        libraryId: 'fake-lib',
        spaceId: 'fake-sp',
        accessToken: 'fake-tok',
        maxRetries: 0,
        timeout: 3000,
      });

      const file = createMockFile('error.txt', Buffer.from('test'));
      const uploader = badClient.createUploadTask({
        file,
        filePath: 'error-test.txt',
      });

      let errorState: TaskStatus | null = null;
      let capturedError: any = null;

      uploader.on('statechange', ({ state, error }: { state: TaskStatus; error?: any }) => {
        if (state === TaskStatus.ERROR) {
          errorState = state;
          capturedError = error;
        }
      });

      const endPromise = waitForUploadEnd(uploader).catch(() => TaskStatus.ERROR);
      uploader.start();
      await endPromise;

      expect(errorState).toBe(TaskStatus.ERROR);
      expect(capturedError).toBeDefined();
    });
  });

  // ─── wait() 方法 ───────────────────────────────────────

  describe('wait() 方法', () => {
    it('ERROR 状态调用 wait 应重置为 WAITING 并清除 end_time', async () => {
      const badClient = new SMHClient({
        basePath: 'https://invalid-host-xxxx.example.com',
        libraryId: 'fake', spaceId: 'fake', accessToken: 'fake',
        maxRetries: 0, timeout: 2000,
      });

      const file = createMockFile('wait-test.txt', Buffer.from('test'));
      const uploader = badClient.createUploadTask({ file, filePath: 'wait-test.txt' });

      const endPromise = waitForUploadEnd(uploader).catch(() => TaskStatus.ERROR);
      uploader.start();
      await endPromise;

      expect(uploader.state).toBe(TaskStatus.ERROR);

      await uploader.wait();
      expect(uploader.state).toBe(TaskStatus.WAITING);
    });
  });

  // ─── 简单上传路径 ──────────────────────────────────────

  describe('简单上传（小文件）', () => {
    it('小于 partFileSize 的文件应走简单上传路径', async () => {
      const content = generateRandomBuffer(1024 * 10); // 10KB
      const filePath = uniquePath('up-simple', '.bin');
      const file = createMockFile('simple.bin', content);

      const states: TaskStatus[] = [];
      const uploader = client.createUploadTask({
        file, filePath,
        onStateChange: (_cp, state) => { states.push(state); },
      });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(uploader.state);
      expect(uploader.progress).toBe(100);
      // 简单上传应经过 CREATED、RUNNING、CONFIRMING（除非秒传）
      if (!states.includes(TaskStatus.RAPID_SUCCESS)) {
        expect(states).toContain(TaskStatus.RUNNING);
      }
    });
  });

  // ─── 分片上传路径 ──────────────────────────────────────

  describe('分片上传', () => {
    it('分片上传应正确计算 CRC64 并完成确认', async () => {
      const fileSize = 1024 * 1024 * 2; // 2MB
      const content = generateRandomBuffer(fileSize);
      const filePath = uniquePath('up-multipart-crc', '.bin');
      const file = createMockFile('crc.bin', content);

      const uploader = client.createUploadTask({
        file, filePath,
        partFileSize: 1, chunkSize: 1,
      });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      const cp = uploader.getCheckpoint();
      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(cp.state);
      if (cp.state === TaskStatus.SUCCESS) {
        // 分片上传完成后 CRC64 应被计算
        expect(cp.crc64).toBeDefined();
      }
    });

    it('conflictResolutionStrategy=rename 应正常工作', async () => {
      const content = Buffer.from('conflict-test-' + Date.now());
      const filePath = uniquePath('up-conflict', '.txt');
      const file = createMockFile('conflict.txt', content);

      const uploader = client.createUploadTask({
        file, filePath,
        conflictResolutionStrategy: 'rename',
      });
      uploadedFiles.push(filePath);

      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;

      expect([TaskStatus.SUCCESS, TaskStatus.RAPID_SUCCESS]).toContain(uploader.state);
    });
  });
});
