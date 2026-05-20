/**
 * SearchApi 集成测试
 * 验证文件搜索功能，包括：
 * - searchFs type=filename（默认，按文件名检索）
 * - searchFs type=filecontent（全文关键字检索）
 * - searchFs withInode 参数
 * - searchFs 新增响应字段（fileType, localCreationTime, localModificationTime）
 * - searchAI（混合语义检索：文搜文档 / 文搜图）
 * - searchFsStats（搜索聚合统计：count/group/sum/distinct/min/max/average + 子聚合）
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { SearchFsWithInodeEnum } from '../../apis/search-api';
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
      const content = Buffer.from(`search content ${searchKeyword} for full-text search testing. It also mentions quarterly revenue data and analysis results.`);
      const file = createMockFile(`${searchKeyword}.txt`, content);
      const uploader = client.createUploadTask({ file, filePath: testFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(5000);
    } catch (e: any) {
      console.log('SearchApi 环境准备失败（可能 token 过期）:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    try { await client.file.deleteFile({ filePath: testFilePath }); } catch { /* ignore */ }
  });

  // ========== searchFs - type=filename (默认) ==========

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

  it('应支持显式指定 type=filename', async () => {
    assertSetupReady(setupFailed);
    const res = await client.search.searchFs({
      searchFsRequest: {
        type: 'filename',
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

  // ========== searchFs - withInode 参数 ==========

  it('应支持 withInode=1 返回 inode 字段', async () => {
    assertSetupReady(setupFailed);
    const res = await client.search.searchFs({
      withInode: SearchFsWithInodeEnum.NUMBER_1,
      searchFsRequest: {
        keywords: [searchKeyword],
      },
    });
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
    if (res.data.contents && res.data.contents.length > 0) {
      const item = res.data.contents[0] as any;
      expect(item.inode).toBeDefined();
      expect(typeof item.inode).toBe('string');
    }
  });

  it('应支持 withInode=0 不返回 inode 字段', async () => {
    assertSetupReady(setupFailed);
    const res = await client.search.searchFs({
      withInode: SearchFsWithInodeEnum.NUMBER_0,
      searchFsRequest: {
        keywords: [searchKeyword],
      },
    });
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
    if (res.data.contents && res.data.contents.length > 0) {
      const item = res.data.contents[0] as any;
      expect(item.inode).toBeUndefined();
    }
  });

  // ========== searchFs - type=filecontent（全文关键字检索） ==========

  it('应支持 type=filecontent 全文关键字检索', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchFs({
        searchFsRequest: {
          type: 'filecontent',
          keywords: [searchKeyword],
        },
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      if (res.data.contents && res.data.contents.length > 0) {
        const item = res.data.contents[0] as any;
        expect(item).toHaveProperty('name');
      }
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`type=filecontent 不可用 (需开通全文索引白名单): ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  it('应在 type=filecontent 模式下返回 text 和 textPage 字段', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchFs({
        searchFsRequest: {
          type: 'filecontent',
          keywords: [searchKeyword],
          inExtnames: ['.txt'],
        },
      });
      expect(res.status).toBe(200);
      if (res.data.contents && res.data.contents.length > 0) {
        const item = res.data.contents[0] as any;
        if (item.text !== undefined) {
          expect(typeof item.text).toBe('string');
        }
        if (item.textPage !== undefined) {
          expect(typeof item.textPage).toBe('number');
        }
      }
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`type=filecontent 不可用: ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  it('应在 type=filecontent 模式下返回 searchScore 字段', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchFs({
        searchFsRequest: {
          type: 'filecontent',
          keywords: [searchKeyword],
        },
      });
      expect(res.status).toBe(200);
      if (res.data.contents && res.data.contents.length > 0) {
        const item = res.data.contents[0] as any;
        if (item.searchScore !== undefined) {
          expect(typeof item.searchScore).toBe('number');
        }
      }
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`type=filecontent 不可用: ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  it('应在 type=filecontent 模式下返回 contentHighlight 字段', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchFs({
        searchFsRequest: {
          type: 'filecontent',
          keywords: [searchKeyword],
        },
      });
      expect(res.status).toBe(200);
      if (res.data.contents && res.data.contents.length > 0) {
        const item = res.data.contents[0] as any;
        if (item.contentHighlight !== undefined) {
          expect(item.contentHighlight).toHaveProperty('fragments');
          expect(Array.isArray(item.contentHighlight.fragments)).toBe(true);
        }
      }
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`type=filecontent 不可用: ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  // ========== searchFs - 新增响应字段 ==========

  it('应返回 fileType 字段', async () => {
    assertSetupReady(setupFailed);
    const res = await client.search.searchFs({
      searchFsRequest: {
        keywords: [searchKeyword],
        fileTypes: ['file'],
      },
    });
    expect(res.status).toBe(200);
    if (res.data.contents && res.data.contents.length > 0) {
      const item = res.data.contents[0] as any;
      if (item.fileType !== undefined) {
        expect(typeof item.fileType).toBe('string');
      }
    }
  });

  it('应返回 localCreationTime 和 localModificationTime 字段', async () => {
    assertSetupReady(setupFailed);
    const res = await client.search.searchFs({
      searchFsRequest: {
        keywords: [searchKeyword],
      },
    });
    expect(res.status).toBe(200);
    if (res.data.contents && res.data.contents.length > 0) {
      const item = res.data.contents[0] as any;
      if (item.localCreationTime !== undefined) {
        expect(typeof item.localCreationTime).toBe('string');
      }
      if (item.localModificationTime !== undefined) {
        expect(typeof item.localModificationTime).toBe('string');
      }
    }
  });

  // ========== searchAI - 混合检索 ==========

  it('应支持 searchAI type=text 文搜文档', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchAI({
        searchAIRequest: {
          type: 'text',
          keywords: searchKeyword,
        },
        limit: 10,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.contents).toBeDefined();
      expect(Array.isArray(res.data.contents)).toBe(true);
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`searchAI 不可用 (需开通白名单): ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  it('应支持 searchAI type=pic 文搜图', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchAI({
        searchAIRequest: {
          type: 'pic',
          keywords: '测试图片',
        },
        limit: 5,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.contents).toBeDefined();
      expect(Array.isArray(res.data.contents)).toBe(true);
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`searchAI type=pic 不可用: ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  it('应支持 searchAI 带 inExtnames 过滤', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchAI({
        searchAIRequest: {
          type: 'text',
          keywords: searchKeyword,
          inExtnames: ['.txt', '.pdf'],
        },
        limit: 10,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`searchAI 不可用: ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  it('应支持 searchAI 带时间范围过滤', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchAI({
        searchAIRequest: {
          type: 'text',
          keywords: searchKeyword,
          modificationTimeStart: '2024-01-01T00:00:00.000Z',
          modificationTimeEnd: '2026-12-31T23:59:59.000Z',
        },
        limit: 5,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`searchAI 不可用: ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  it('searchAI type=text 响应应包含 inode 和 score 字段', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchAI({
        searchAIRequest: {
          type: 'text',
          keywords: searchKeyword,
        },
        limit: 10,
      });
      expect(res.status).toBe(200);
      if (res.data.contents && res.data.contents.length > 0) {
        const item = res.data.contents[0];
        expect(item.inode).toBeDefined();
        expect(item.score).toBeDefined();
        expect(typeof item.score).toBe('number');
      }
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`searchAI 不可用: ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  it('searchAI type=text 响应应包含 text 和 textPage 字段', async (ctx: any) => {
    assertSetupReady(setupFailed);
    try {
      const res = await client.search.searchAI({
        searchAIRequest: {
          type: 'text',
          keywords: searchKeyword,
        },
        limit: 10,
      });
      expect(res.status).toBe(200);
      if (res.data.contents && res.data.contents.length > 0) {
        const item = res.data.contents[0];
        if (item.text !== undefined) {
          expect(typeof item.text).toBe('string');
        }
        if (item.textPage !== undefined) {
          expect(typeof item.textPage).toBe('number');
        }
      }
    } catch (error: any) {
      if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
        ctx.skip(`searchAI 不可用: ${error?.response?.status}`);
        return;
      }
      throw error;
    }
  });

  // ========== searchFsStats - 搜索聚合统计 ==========

  describe('searchFsStats - 基本聚合统计', () => {
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

  describe('searchFsStats - 多聚合项组合', () => {
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

  describe('searchFsStats - 子聚合（嵌套聚合）', () => {
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

  describe('searchFsStats - 搜索条件筛选', () => {
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

  describe('searchFsStats - 可选参数', () => {
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

  describe('searchFsStats - isTruncated 字段', () => {
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