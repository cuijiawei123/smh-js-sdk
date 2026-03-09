/**
 * HistoryApi 集成测试
 * 验证历史版本配置查询、历史版本列表
 * 跳过 emptyHistory（危险操作）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  assertSetupReady,
  createMockFile,
  createTestClient,
  getTestRootDir,
  skipIfNoConfig,
  uniquePath,
  sleep,
  waitForUploadEnd,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('HistoryApi 集成测试', () => {
  let client: SMHClient;
  const testFilePath = uniquePath('history-test', '.txt');
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      const content = Buffer.from(`history test v1 ${Date.now()}`);
      const file = createMockFile('history.txt', content);
      const uploader = client.createUploadTask({ file, filePath: testFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(1000);

      const content2 = Buffer.from(`history test v2 ${Date.now()}`);
      const file2 = createMockFile('history.txt', content2);
      const uploader2 = client.createUploadTask({ file: file2, filePath: testFilePath });
      const endPromise2 = waitForUploadEnd(uploader2);
      uploader2.start();
      await endPromise2;
      await sleep(1000);
    } catch (e: any) {
      console.log('HistoryApi 环境准备失败（可能 token 过期）:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    try { await client.file.deleteFile({ filePath: testFilePath }); } catch { /* ignore */ }
  });

  describe('getHistoryConfig - 查询历史版本配置', () => {
    it('应能查询历史版本配置', async () => {
      assertSetupReady(setupFailed);
      const res = await client.history.getHistoryConfig({});
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  describe('listHistory - 查看历史版本列表', () => {
    it('应能列出文件的历史版本', async () => {
      assertSetupReady(setupFailed);
      const res = await client.history.listHistory({
        filePath: testFilePath,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });
});