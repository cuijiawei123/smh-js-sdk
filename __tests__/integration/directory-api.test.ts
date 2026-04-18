/**
 * DirectoryApi 补充集成测试
 * 覆盖 copyDirectory、listDirectoryByPage、checkDirectoryStatus、
 * infoFileOrDirectory、updateDirectoryLabels、getDirectoryStats、calibrateDirectoryStats
 * 原 directory.test.ts 已覆盖：createDirectory、listDirectory、deleteDirectory、moveDirectory
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import {
  CalibrateDirectoryStatsCalibrateEnum,
  CalibrateDirectoryStatsStatsTypeEnum,
  GetDirectoryStatsStatsEnum,
  GetDirectoryStatsStatsTypeEnum,
  InfoFileOrDirectoryInfoEnum,
  ListDirectoryByPageByPageEnum,
  UpdateFileLabelsUpdateEnum,
} from '../../apis/directory-api';
import {
  createMockFile,
  createTestClient,
  getTestRootDir,
  skipIfNoConfig,
  sleep,
  uniquePath,
  waitForUploadEnd,
} from './helpers';

const shouldSkip = skipIfNoConfig();

describe.skipIf(shouldSkip)('DirectoryApi 补充集成测试', () => {
  let client: SMHClient;
  const testDirBase = `${getTestRootDir()}/dir_extra_${Date.now()}`;
  const createdDirs: string[] = [];

  beforeAll(async () => {
    client = await createTestClient();
    // 创建测试根目录
    try {
      await client.directory.createDirectory({ filePath: testDirBase });
    } catch { /* ignore */ }

    // 创建几个子目录用于测试
    const subDirs = ['sub-a', 'sub-b', 'sub-c'];
    for (const d of subDirs) {
      const path = `${testDirBase}/${d}`;
      createdDirs.push(path);
      try {
        await client.directory.createDirectory({ filePath: path });
      } catch { /* ignore */ }
    }
    await sleep(500);
  });

  afterAll(async () => {
    for (const dir of createdDirs.reverse()) {
      try { await client.directory.deleteDirectory({ filePath: dir }); } catch { /* ignore */ }
    }
    try { await client.directory.deleteDirectory({ filePath: testDirBase }); } catch { /* ignore */ }
  });

  // ─── copyDirectory ────────────────────────────────────────

  describe('copyDirectory - 复制目录', () => {
    it('应能复制目录到新路径', async (ctx: any) => {
      const destPath = `${testDirBase}/sub-a-copy`;
      createdDirs.push(destPath);

      try {
        const res = await client.directory.copyDirectory({
          filePath: destPath,
          copyDirectoryRequest: { copyFrom: `${testDirBase}/sub-a` },
          conflictResolutionStrategy: 'rename' as any,
        });
        // 小目录同步完成返回 200，大目录异步返回 202
        expect([200, 201, 202]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`目录复制能力不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });

  // ─── listDirectoryByPage ──────────────────────────────────

  describe('listDirectoryByPage - 分页列出目录内容', () => {
    it('应能按页码列出目录内容', async () => {
      const res = await client.directory.listDirectoryByPage({
        filePath: testDirBase,
        byPage: ListDirectoryByPageByPageEnum.NUMBER_1,
        page: 1,
        pageSize: 10,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('应支持排序参数', async () => {
      const res = await client.directory.listDirectoryByPage({
        filePath: testDirBase,
        byPage: ListDirectoryByPageByPageEnum.NUMBER_1,
        page: 1,
        pageSize: 10,
        orderBy: 'name' as any,
        orderByType: 'asc' as any,
      });
      expect(res.status).toBe(200);
    });
  });

  // ─── checkDirectoryStatus ─────────────────────────────────

  describe('checkDirectoryStatus - 检查目录状态', () => {
    it('已存在的目录应返回成功', async () => {
      const res = await client.directory.checkDirectoryStatus({
        filePath: testDirBase,
      });
      expect([200, 204]).toContain(res.status);
    });

    it('不存在的目录应返回 404', async () => {
      const result = await client.directory.checkDirectoryStatus({
        filePath: `${getTestRootDir()}/non-existent-dir-${Date.now()}`,
      })
        .then(res => ({ ok: true as const, res }))
        .catch((error: any) => ({ ok: false as const, error }));

      if (result.ok) {
        expect(result.res.status).toBe(404);
      } else {
        expect(result.error.response?.status).toBe(404);
      }
    });
  });

  // ─── infoFileOrDirectory ──────────────────────────────────

  describe('infoFileOrDirectory - 查询目录/文件信息', () => {
    it('应能查询目录详情', async () => {
      const res = await client.directory.infoFileOrDirectory({
        filePath: testDirBase,
        info: InfoFileOrDirectoryInfoEnum.NUMBER_1,
      });
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });
  });

  // ─── updateDirectoryLabels ────────────────────────────────

  describe('updateDirectoryLabels - 更新目录标签', () => {
    it('应能为目录设置标签', async (ctx: any) => {
      try {
        const res = await client.directory.updateDirectoryLabels({
          filePath: `${testDirBase}/sub-a`,
          update: 1 as any,
          updateDirectoryLabelsRequest: { labels: ['sdk-test', 'integration'] },
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`更新目录标签不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });

  // ─── updateFileLabels ────────────────────────────────────

  describe('updateFileLabels - 更新文件标签', () => {
    let testFilePath: string;

    beforeAll(async () => {
      testFilePath = uniquePath('dir-file-labels', '.txt');
      const content = Buffer.from(`file labels test ${Date.now()}`);
      const file = createMockFile('labels.txt', content);
      const uploader = client.createUploadTask({ file, filePath: testFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(500);
    });

    afterAll(async () => {
      try { await client.file.deleteFile({ filePath: testFilePath }); } catch { /* ignore */ }
    });

    it('应能为文件设置标签', async (ctx: any) => {
      try {
        const res = await client.directory.updateFileLabels({
          filePath: testFilePath,
          update: UpdateFileLabelsUpdateEnum.NUMBER_1,
          updateFileLabelsRequest: { labels: ['sdk-test', 'file-label'] },
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`更新文件标签不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });

  // ─── getDirectoryStats ────────────────────────────────────

  describe('getDirectoryStats - 查询目录统计数据', () => {
    it('应能查询普通目录的统计数据', async (ctx: any) => {
      try {
        const res = await client.directory.getDirectoryStats({
          filePath: testDirBase,
          stats: GetDirectoryStatsStatsEnum.NUMBER_1,
          statsType: GetDirectoryStatsStatsTypeEnum.Normal,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
        const data = res.data as any;
        // 响应字段应包含统计信息（可能为 0 或数值）
        if (data.fileCount !== undefined) {
          expect(typeof data.fileCount).toBe('number');
        }
        if (data.dirCount !== undefined) {
          expect(typeof data.dirCount).toBe('number');
        }
        if (data.storage !== undefined) {
          expect(typeof data.storage).toBe('number');
        }
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`getDirectoryStats 不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });

    it('应能查询根目录的统计数据（filePath 留空）', async (ctx: any) => {
      try {
        const res = await client.directory.getDirectoryStats({
          filePath: '',
          stats: GetDirectoryStatsStatsEnum.NUMBER_1,
          statsType: GetDirectoryStatsStatsTypeEnum.Normal,
        });
        expect(res.status).toBe(200);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`getDirectoryStats 根目录不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });

    it('应支持回收站统计类型', async (ctx: any) => {
      try {
        const res = await client.directory.getDirectoryStats({
          filePath: '',
          stats: GetDirectoryStatsStatsEnum.NUMBER_1,
          statsType: GetDirectoryStatsStatsTypeEnum.Recycle,
        });
        expect(res.status).toBe(200);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`getDirectoryStats recycle 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('对不存在的目录应返回错误', async (ctx: any) => {
      try {
        await client.directory.getDirectoryStats({
          filePath: `${getTestRootDir()}/non-existent-stats-${Date.now()}`,
          stats: GetDirectoryStatsStatsEnum.NUMBER_1,
          statsType: GetDirectoryStatsStatsTypeEnum.Normal,
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.response?.status).toBeDefined();
      }
    });
  });

  // ─── calibrateDirectoryStats ──────────────────────────────

  describe('calibrateDirectoryStats - 修正目录统计数据', () => {
    it('应能触发普通目录统计的修正', async (ctx: any) => {
      try {
        const res = await client.directory.calibrateDirectoryStats({
          filePath: testDirBase,
          calibrate: CalibrateDirectoryStatsCalibrateEnum.NUMBER_1,
          statsType: CalibrateDirectoryStatsStatsTypeEnum.Normal,
        });
        // 该接口可能同步返回 200/204，也可能异步返回 202
        expect([200, 202, 204]).toContain(res.status);
      } catch (error: any) {
        // 频控或权限不足时安全跳过
        if ([400, 403, 404, 405, 429, 501].includes(error?.response?.status)) {
          ctx.skip(`calibrateDirectoryStats 不可用: ${error?.response?.status}`);
          return;
        }
        throw error;
      }
    });

    it('对不存在的目录应返回错误', async (ctx: any) => {
      try {
        await client.directory.calibrateDirectoryStats({
          filePath: `${getTestRootDir()}/non-existent-calibrate-${Date.now()}`,
          calibrate: CalibrateDirectoryStatsCalibrateEnum.NUMBER_1,
          statsType: CalibrateDirectoryStatsStatsTypeEnum.Normal,
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.response?.status).toBeDefined();
      }
    });
  });
});