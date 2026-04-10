/**
 * SearchApi 集成测试
 * 验证文件搜索功能
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

describe.skipIf(shouldSkip)('SearchApi 集成测试', () => {
  let client: SMHClient;
  const searchKeyword = `sdktest${Date.now()}`;
  const testFilePath = uniquePath(`search_${searchKeyword}`, '.txt');
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      const content = Buffer.from(`search content ${searchKeyword}`);
      const file = createMockFile(`${searchKeyword}.txt`, content);
      const uploader = client.createUploadTask({ file, filePath: testFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(3000);
    } catch (e: any) {
      console.log('SearchApi 环境准备失败（可能 token 过期）:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    try { await client.file.deleteFile({ filePath: testFilePath }); } catch { /* ignore */ }
  });

  it('应能搜索文件', async () => {
    assertSetupReady(setupFailed);
    const res = await client.search.searchFs({
      searchFsRequest: {
        keywords: [searchKeyword],
      },
    });
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });

  it('应支持按文件类型筛选', async () => {
    assertSetupReady(setupFailed);
    const res = await client.search.searchFs({
      searchFsRequest: {
        keywords: [searchKeyword],
        inExtnames: ['.txt'],
      },
    });
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });

  it('应支持分页参数', async () => {
    assertSetupReady(setupFailed);
    const res = await client.search.searchFs({
      limit: 5,
      searchFsRequest: {
        keywords: [searchKeyword],
      },
    });
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });
});