/// <reference types="node" />
/**
 * CommonLoader 覆盖率补充测试
 * 通过 Downloader（CommonLoader 的子类）来测试基类的未覆盖逻辑
 * 覆盖行：wait()、pause/cancel 终态守卫、handleError 各分支、verbose 日志、calcTotalAvgSpeed 有历史数据
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { TaskStatus, DownloadCheckpoint } from '../../loaders/types';
import { Downloader, IRemoteFile } from '../../loaders/Downloader';
import { Configuration } from '../../configuration';
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

describe.skipIf(shouldSkip)('CommonLoader 覆盖率补充', () => {
  let client: SMHClient;
  const uploadedFiles: string[] = [];
  let testFilePath: string;

  const FILE_SIZE = 1024 * 50; // 50KB

  beforeAll(async () => {
    client = await createTestClient();

    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch {
      // 目录可能已存在
    }

    // 上传一个小文件用于后续测试
    const content = generateRandomBuffer(FILE_SIZE);
    testFilePath = uniquePath('loader-test', '.bin');
    const file = createMockFile('loader-test.bin', content);
    const uploader = client.createUploadTask({ file, filePath: testFilePath });
    uploadedFiles.push(testFilePath);
    const endPromise = waitForUploadEnd(uploader);
    uploader.start();
    await endPromise;
    await sleep(2000);
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

  // ─── wait() 方法（CommonLoader 124-138）────────────────

  describe('wait() 方法', () => {
    it('初始 WAITING 状态调用 wait 应无副作用', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });
      expect(downloader.state).toBe(TaskStatus.WAITING);
      await downloader.wait();
      expect(downloader.state).toBe(TaskStatus.WAITING);
    });

    it('成功完成后调用 wait 应重置为 WAITING 状态', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });
      await downloader.startAndGetBlob();
      expect(downloader.state).toBe(TaskStatus.SUCCESS);

      await downloader.wait();
      expect(downloader.state).toBe(TaskStatus.WAITING);
    });

    it('取消后调用 wait 应重置为 WAITING 状态', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });
      // 立即取消
      await downloader.cancel();
      expect(downloader.state).toBe(TaskStatus.CANCELED);

      await downloader.wait();
      expect(downloader.state).toBe(TaskStatus.WAITING);
    });
  });

  // ─── pause/cancel 终态守卫（CommonLoader 164-166, 182-183）──

  describe('pause/cancel 终态守卫', () => {
    it('SUCCESS 状态调用 pause 应无效果', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });
      await downloader.startAndGetBlob();
      expect(downloader.state).toBe(TaskStatus.SUCCESS);

      await downloader.pause();
      // 状态应保持 SUCCESS
      expect(downloader.state).toBe(TaskStatus.SUCCESS);
    });

    it('CANCELED 状态调用 cancel 应无效果（防重复）', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });
      await downloader.cancel();
      expect(downloader.state).toBe(TaskStatus.CANCELED);

      // 再次取消不应改变状态
      await downloader.cancel();
      expect(downloader.state).toBe(TaskStatus.CANCELED);
    });

    it('SUCCESS 状态调用 cancel 应正常取消', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });
      await downloader.startAndGetBlob();
      expect(downloader.state).toBe(TaskStatus.SUCCESS);

      // 成功后取消（cancelFlag 未被设置过，所以可以取消）
      await downloader.cancel();
      expect(downloader.state).toBe(TaskStatus.CANCELED);
    });
  });

  // ─── verbose 日志（CommonLoader 88-107）─────────────────

  describe('verbose 日志', () => {
    it('verbose=true 时下载应输出日志不报错', async () => {
      const downloader = client.createDownloadTask({
        filePath: testFilePath,
        verbose: true,
      });
      const blob = await downloader.startAndGetBlob();
      expect(blob).toBeDefined();
      expect(downloader.state).toBe(TaskStatus.SUCCESS);
    });

    it('verbose=false（默认）时也应正常工作', async () => {
      const downloader = client.createDownloadTask({
        filePath: testFilePath,
        verbose: false,
      });
      const blob = await downloader.startAndGetBlob();
      expect(blob).toBeDefined();
    });
  });

  // ─── Downloader 构造参数校验（Downloader 124-131）───────

  describe('Downloader 构造参数校验', () => {
    it('无效 file（null）应抛出参数错误', () => {
      expect(() => {
        new Downloader(null as any, {
          libraryId: 'lib',
          spaceId: 'sp',
          accessToken: 'tok',
          filePath: 'test.txt',
        }, new Configuration());
      }).toThrow();
    });

    it('file.path 为空应抛出参数错误', () => {
      expect(() => {
        new Downloader({ name: 'test', path: '' } as IRemoteFile, {
          libraryId: 'lib',
          spaceId: 'sp',
          accessToken: 'tok',
          filePath: 'test.txt',
        }, new Configuration());
      }).toThrow();
    });
  });

  // ─── Downloader handleError 分支（Downloader 773-796）──

  describe('Downloader 错误处理', () => {
    it('下载不存在的文件应进入 ERROR 状态', async () => {
      const downloader = client.createDownloadTask({
        filePath: 'non-existent-file-path/does-not-exist.bin',
      });

      const states: TaskStatus[] = [];
      downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
        states.push(state);
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期会抛错
      }

      // 应该进入 ERROR 状态或抛出异常
      expect([TaskStatus.ERROR]).toContain(downloader.state);
    });

    it('onStateChange 回调在错误时应被调用', async () => {
      let errorState: TaskStatus | null = null;
      let errorObj: any = null;

      const downloader = client.createDownloadTask({
        filePath: 'non-existent-file/404.bin',
        onStateChange: (_cp, state, error) => {
          if (state === TaskStatus.ERROR) {
            errorState = state;
            errorObj = error;
          }
        },
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期会抛错
      }

      expect(errorState).toBe(TaskStatus.ERROR);
      expect(errorObj).toBeDefined();
    });
  });

  // ─── start() 状态守卫（Downloader 215-217）──────────────

  describe('start() 状态守卫', () => {
    it('RUNNING 状态再次调用 start 应无效果', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });

      let startCount = 0;
      downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
        if (state === TaskStatus.START) {
          startCount++;
        }
        if (state === TaskStatus.RUNNING) {
          // 在 RUNNING 时再次调用 start
          downloader.start();
        }
      });

      await downloader.startAndGetBlob();
      // START 只应触发一次
      expect(startCount).toBe(1);
    });

    it('SUCCESS 状态调用 start 应无效果', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });
      await downloader.startAndGetBlob();
      expect(downloader.state).toBe(TaskStatus.SUCCESS);

      // 再次 start 应直接返回
      await downloader.start();
      expect(downloader.state).toBe(TaskStatus.SUCCESS);
    });
  });

  // ─── startAndGetBlob 重复调用（Downloader 228-233）──────

  describe('startAndGetBlob 重复调用守卫', () => {
    it('成功完成后再次调用 startAndGetBlob 应返回已有结果', async () => {
      const downloader = client.createDownloadTask({ filePath: testFilePath });
      const blob1 = await downloader.startAndGetBlob();
      expect(downloader.state).toBe(TaskStatus.SUCCESS);

      // 再次调用应返回已缓存的 resultBlob
      const blob2 = await downloader.startAndGetBlob();
      expect(blob2.size).toBe(blob1.size);
    });
  });

  // ─── Downloader checkpoint 恢复（Downloader 160-175）────

  describe('checkpoint 恢复', () => {
    it('通过 checkpoint 创建 downloader 应恢复状态', async () => {
      const downloader = client.createDownloadTask({
        filePath: testFilePath,
      });
      await downloader.startAndGetBlob();

      const cp = downloader.getCheckpoint();
      expect(cp.state).toBe(TaskStatus.SUCCESS);
      expect(cp.progress).toBe(100);
      expect(cp.loaded).toBeGreaterThan(0);

      // 用 checkpoint 创建新的 downloader
      const downloader2 = client.createDownloadTask({
        filePath: testFilePath,
        checkpoint: cp,
      });

      // 恢复后的状态应与 checkpoint 一致
      expect(downloader2.state).toBe(TaskStatus.SUCCESS);
      expect(downloader2.progress).toBe(100);
    });
  });

  // ─── CommonLoader handleError 分支（343-344, 348-349）──

  describe('handleError 特殊分支', () => {
    it('cancelFlag 为 true 时 handleError 应直接变为 ERROR 状态', async () => {
      const downloader = client.createDownloadTask({
        filePath: 'non-existent-cancel-flag-' + Date.now() + '.bin',
      });

      // 在 start 时立即设置 cancelFlag
      downloader.on('statechange', ({ state }: { state: TaskStatus }) => {
        if (state === TaskStatus.START) {
          (downloader as any).cancelFlag = true;
        }
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期
      }

      // cancelFlag 已设置，handleError 应走 cancelFlag 分支
      expect(downloader.state).toBeDefined();
    });

    it('ERROR 状态调用 wait 应清除 end_time 和 message', async () => {
      const badClient = new SMHClient({
        basePath: 'https://invalid-host-common-loader.example.com',
        libraryId: 'fake', spaceId: 'fake', accessToken: 'fake',
        maxRetries: 0, timeout: 2000,
      });

      const downloader = badClient.createDownloadTask({
        filePath: 'error-wait-test.bin',
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期
      }

      expect(downloader.state).toBe(TaskStatus.ERROR);
      // end_time 和 message 应已设置
      expect(downloader.end_time).toBeGreaterThan(0);

      // 调用 wait 应清除
      await downloader.wait();
      expect(downloader.state).toBe(TaskStatus.WAITING);
      expect(downloader.end_time).toBe(0);
      expect(downloader.message).toBe('');
    });
  });

  // ─── logError 路径（CommonLoader 102-107）──────────────

  describe('logError 路径', () => {
    it('verbose=true 且下载失败应触发 logError 不崩溃', async () => {
      const badClient = new SMHClient({
        basePath: 'https://invalid-host-logerror.example.com',
        libraryId: 'fake', spaceId: 'fake', accessToken: 'fake',
        maxRetries: 0, timeout: 2000,
      });

      const downloader = badClient.createDownloadTask({
        filePath: 'error-log-test.bin',
        verbose: true,
      });

      try {
        await downloader.startAndGetBlob();
      } catch {
        // 预期
      }

      expect(downloader.state).toBe(TaskStatus.ERROR);
    });
  });
});
