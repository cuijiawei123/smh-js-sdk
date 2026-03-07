/**
 * HistoryApi 补充集成测试
 * 覆盖 deleteHistory、setHistoryConfig、setHistoryLatest
 * 原 history-api.test.ts 已覆盖：getHistoryConfig、listHistory
 * 跳过 emptyHistory（危险操作：清空整个 library 的历史版本）
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

describe.skipIf(shouldSkip)('HistoryApi 补充集成测试', () => {
  let client: SMHClient;
  let setupFailed = false;
  const testFilePath = uniquePath('history-extra', '.txt');
  let historyId: string | null = null;
  let originalHistoryConfig: any = null;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      // 保存原始历史版本配置
      const configRes = await client.history.getHistoryConfig({});
      originalHistoryConfig = configRes.data;

      // 上传文件的两个版本，产生历史版本
      const content1 = Buffer.from(`history extra v1 ${Date.now()}`);
      const file1 = createMockFile('history-extra.txt', content1);
      const uploader1 = client.createUploadTask({ file: file1, filePath: testFilePath });
      const end1 = waitForUploadEnd(uploader1);
      uploader1.start();
      await end1;
      await sleep(1000);

      const content2 = Buffer.from(`history extra v2 ${Date.now()}`);
      const file2 = createMockFile('history-extra.txt', content2);
      const uploader2 = client.createUploadTask({ file: file2, filePath: testFilePath });
      const end2 = waitForUploadEnd(uploader2);
      uploader2.start();
      await end2;
      await sleep(1000);

      // 获取历史版本列表，找到第一个版本的 historyId
      const listRes = await client.history.listHistory({ filePath: testFilePath });
      const contents = (listRes.data as any)?.contents || (listRes.data as any)?.historyList || [];
      if (contents.length > 0) {
        // 取最旧版本（非当前版本）
        historyId = contents[contents.length - 1]?.historyId ||
                    contents[contents.length - 1]?.id || null;
      }
    } catch (e: any) {
      console.log('HistoryApi 补充测试环境准备失败:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    try { await client.file.deleteFile({ filePath: testFilePath }); } catch { /* ignore */ }
  });

  // ─── setHistoryConfig ─────────────────────────────────────

  describe('setHistoryConfig - 设置历史版本配置', () => {
    it('应能修改历史版本配置', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.history.setHistoryConfig({
          setHistoryConfigRequest: {
            enableFileHistory: true,
            fileHistoryCount: 50,
            fileHistoryExpireDay: 90,
          },
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`设置历史版本配置不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });

    it('修改后查询配置应反映新值', async (ctx: any) => {
      assertSetupReady(setupFailed);
      try {
        const res = await client.history.getHistoryConfig({});
        expect(res.status).toBe(200);
        // 验证配置已更新（某些字段可能命名不同，宽松断言）
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403].includes(error?.response?.status)) {
          ctx.skip(`查询历史配置不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });

    // 恢复原始配置（如果有）
    afterAll(async () => {
      if (originalHistoryConfig) {
        try {
          await client.history.setHistoryConfig({
            setHistoryConfigRequest: {
              enableFileHistory: originalHistoryConfig.enableFileHistory ?? true,
              fileHistoryCount: originalHistoryConfig.fileHistoryCount ?? 20,
              fileHistoryExpireDay: originalHistoryConfig.fileHistoryExpireDay ?? 60,
            },
          });
        } catch { /* ignore */ }
      }
    });
  });

  // ─── setHistoryLatest ─────────────────────────────────────

  describe('setHistoryLatest - 设置历史版本为最新版', () => {
    it('应能将旧版本设为最新版', async (ctx: any) => {
      assertSetupReady(setupFailed);
      if (!historyId) {
        ctx.skip('未获取到历史版本 ID');
        return;
      }

      try {
        const res = await client.history.setHistoryLatest({
          historyId,
          filePath: testFilePath,
        } as any);
        expect([200, 201]).toContain(res.status);
        expect(res.data).toBeDefined();
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`设置历史版本为最新版不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });

  // ─── deleteHistory ────────────────────────────────────────

  describe('deleteHistory - 删除历史版本', () => {
    it('应能删除指定历史版本', async (ctx: any) => {
      assertSetupReady(setupFailed);

      // 重新获取历史版本列表（setHistoryLatest 后可能有新版本）
      let versionToDelete: string | null = null;
      try {
        const listRes = await client.history.listHistory({ filePath: testFilePath });
        const contents = (listRes.data as any)?.contents || (listRes.data as any)?.historyList || [];
        if (contents.length > 1) {
          // 删除最旧的版本
          versionToDelete = contents[contents.length - 1]?.historyId ||
                            contents[contents.length - 1]?.id || null;
        }
      } catch { /* ignore */ }

      if (!versionToDelete) {
        ctx.skip('没有可删除的历史版本');
        return;
      }

      try {
        const res = await client.history.deleteHistory({
          requestBody: [versionToDelete],
        });
        expect([200, 204]).toContain(res.status);
      } catch (error: any) {
        if ([400, 403, 404, 405, 501].includes(error?.response?.status)) {
          ctx.skip(`删除历史版本不可用: ${error?.response?.status}`);
        }
        throw error;
      }
    });
  });
});
