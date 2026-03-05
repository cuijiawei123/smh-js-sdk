/**
 * FavoriteApi 集成测试
 * 验证收藏、列出收藏、取消收藏操作
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SMHClient } from '../../interceptor/SmhClient';
import { DeleteFavoriteCancelEnum } from '../../apis/favorite-api';
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

describe.skipIf(shouldSkip)('FavoriteApi 集成测试', () => {
  let client: SMHClient;
  const testFilePath = uniquePath('favorite-test', '.txt');
  let setupFailed = false;

  beforeAll(async () => {
    client = await createTestClient();
    try {
      await client.directory.createDirectory({ filePath: getTestRootDir() });
    } catch { /* ignore */ }

    try {
      const content = Buffer.from(`favorite test ${Date.now()}`);
      const file = createMockFile('fav.txt', content);
      const uploader = client.createUploadTask({ file, filePath: testFilePath });
      const endPromise = waitForUploadEnd(uploader);
      uploader.start();
      await endPromise;
      await sleep(1000);
    } catch (e: any) {
      console.log('FavoriteApi 环境准备失败（可能 token 过期）:', e.message);
      setupFailed = true;
    }
  });

  afterAll(async () => {
    try {
      await client.favorite.deleteFavorite({
        cancel: DeleteFavoriteCancelEnum.NUMBER_1,
        deleteFavoriteRequest: { path: testFilePath },
      });
    } catch { /* ignore */ }

    try { await client.file.deleteFile({ filePath: testFilePath }); } catch { /* ignore */ }
  });

  it('应能收藏文件', async () => {
    assertSetupReady(setupFailed);
    const res = await client.favorite.createFavorite({
      createFavoriteRequest: { path: testFilePath },
    });
    expect([200, 201, 204]).toContain(res.status);
  });

  it('应能列出收藏列表', async () => {
    assertSetupReady(setupFailed);
    const res = await client.favorite.listFavorite({});
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });

  it('应能取消收藏', async () => {
    assertSetupReady(setupFailed);
    const res = await client.favorite.deleteFavorite({
      cancel: DeleteFavoriteCancelEnum.NUMBER_1,
      deleteFavoriteRequest: { path: testFilePath },
    });
    expect([200, 204]).toContain(res.status);
  });
});