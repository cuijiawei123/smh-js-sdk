/**
 * SearchApi - searchFsStats 集成测试
 * 验证搜索目录与文件统计功能
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

describe.skipIf(shouldSkip)('SearchApi - searchFsStats 集成测试', () => {
  let client: SMHClient;
  const searchKeyword = `sdkstats${Date.now()}`;
  const testFilePaths: string[] = [];
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      // Create test files with different extensions for aggregation testing
      const files = [
        { name: `${searchKeyword}_1.txt`, ext: '.txt' },
        { name: `${searchKeyword}_2.txt`, ext: '.txt' },
        { name: `${searchKeyword}_3.pdf`, ext: '.pdf' },
      ];

      for (const f of files) {
        const fp = uniquePath(`stats_${searchKeyword}_${f.ext.replace('.', '')}`, f.ext);
        testFilePaths.push(fp);
        const content = Buffer.from(`stats content ${searchKeyword} ${f.name}`);
        const file = createMockFile(f.name, content);
        const uploader = client.createUploadTask({ file, filePath: fp });
        const endPromise = waitForUploadEnd(uploader);
        uploader.start();
        await endPromise;
      }
      // Wait for search index to be updated
      await sleep(3000);
    } catch (e: any) {
      console.log('searchFsStats 环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    for (const fp of testFilePaths) {
      try { await client.file.deleteFile({ filePath: fp }); } catch { /* ignore */ }
    }
  });

  describe('基本聚合统计', () => {
    it('应支持 count 聚合操作', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            { field: 'size', operation: 'count' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });

    it('应支持 group 聚合操作（按文件后缀分组）', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            { field: 'extName', operation: 'group' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });

    it('应支持 sum 聚合操作（文件大小求和）', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            { field: 'size', operation: 'sum' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });

    it('应支持 distinct 聚合操作', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            { field: 'extName', operation: 'distinct' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });

    it('应支持 min/max/average 聚合操作', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            { field: 'size', operation: 'min' },
            { field: 'size', operation: 'max' },
            { field: 'size', operation: 'average' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toHaveLength(3);
    });
  });

  describe('多聚合项组合', () => {
    it('应支持同时传入多个聚合项', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            { field: 'extName', operation: 'group' },
            { field: 'size', operation: 'sum' },
            { field: 'size', operation: 'count' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toHaveLength(3);
    });
  });

  describe('子聚合（嵌套聚合）', () => {
    it('应支持 group + 子聚合（按后缀分组并统计大小总和）', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            {
              field: 'extName',
              operation: 'group',
              subAggregations: [
                { field: 'size', operation: 'sum' },
              ],
            },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });

    it('应支持 group + 多个子聚合', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            {
              field: 'extName',
              operation: 'group',
              subAggregations: [
                { field: 'size', operation: 'sum' },
                { field: 'size', operation: 'count' },
                { field: 'size', operation: 'average' },
              ],
            },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });
  });

  describe('搜索条件筛选', () => {
    it('应支持按文件后缀筛选后统计', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          inExtnames: ['.txt'],
          aggregations: [
            { field: 'size', operation: 'count' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });

    it('应支持按搜索范围 scope 筛选后统计', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          scope: getTestRootDir(),
          aggregations: [
            { field: 'extName', operation: 'group' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });

    it('应支持按文件类型筛选后统计', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          fileTypes: ['file'],
          aggregations: [
            { field: 'size', operation: 'sum' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });

    it('应支持 excludeExtnames 排除后统计', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          excludeExtnames: ['.pdf'],
          aggregations: [
            { field: 'size', operation: 'count' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });
  });

  describe('可选参数', () => {
    it('应支持显式传入 userId', async () => {
      assertSetupReady(setupFailed);
      const userId = process.env.SMH_USER_ID;
      const res = await client.search.searchFsStats({
        userId,
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            { field: 'size', operation: 'count' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持不传 keywords（全量统计）', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          scope: getTestRootDir(),
          aggregations: [
            { field: 'extName', operation: 'group' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.aggregations).toBeDefined();
    });
  });

  describe('isTruncated 字段', () => {
    it('应返回 isTruncated 字段', async () => {
      assertSetupReady(setupFailed);
      const res = await client.search.searchFsStats({
        searchFsStatsRequest: {
          keywords: [searchKeyword],
          aggregations: [
            { field: 'extName', operation: 'group' },
          ],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      // isTruncated should be a boolean (false for small datasets)
      expect(typeof res.data.isTruncated).toBe('boolean');
    });
  });
});
