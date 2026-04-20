import { describe, it, expect, vi } from 'vitest';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { Configuration } from '../../configuration';
import {
  HistoryApi,
  HistoryApiAxiosParamCreator,
  ListHistoryOrderByEnum,
  ListHistoryOrderByTypeEnum,
} from '../../apis/history-api';
import {
  QuotaApi,
  QuotaApiAxiosParamCreator,
} from '../../apis/quota-api';
import {
  RecycledApi,
  RecycledApiAxiosParamCreator,
  RecycleListByMarkerEnum,
  RecycleListOrderByEnum,
  RecycleListOrderByTypeEnum,
  RecycleListByPageByPageEnum,
  RecycleListByPageOrderByEnum,
  RecycleListByPageOrderByTypeEnum,
  RecycleRestoreRestoreEnum,
  RecycleRestoreConflictResolutionStrategyEnum,
  RecycleRestoreRestorePathStrategyEnum,
  RecycleRestoreBatchRestorePathStrategyEnum,
} from '../../apis/recycled-api';

function createMockAxios(): AxiosInstance {
  const mockResponse: AxiosResponse = {
    data: { ok: true },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
  const instance = vi.fn().mockResolvedValue(mockResponse) as any;
  instance.request = vi.fn().mockResolvedValue(mockResponse);
  instance.get = vi.fn().mockResolvedValue(mockResponse);
  instance.post = vi.fn().mockResolvedValue(mockResponse);
  instance.put = vi.fn().mockResolvedValue(mockResponse);
  instance.delete = vi.fn().mockResolvedValue(mockResponse);
  instance.patch = vi.fn().mockResolvedValue(mockResponse);
  instance.defaults = { headers: { common: {} } };
  return instance;
}

const BASE = 'https://mock.smh.test';
const config = new Configuration({
  basePath: BASE,
  baseOptions: { headers: { 'X-From-BaseOptions': '1' } },
  serverIndex: 0,
});

describe('API OOP + ParamCreator 覆盖补充', () => {
  describe('HistoryApi', () => {
    it('HistoryApiAxiosParamCreator.listHistory 应覆盖全部可选查询参数', async () => {
      const creator = HistoryApiAxiosParamCreator(config);
      const req = await creator.listHistory(
        'lib-1',
        'space-1',
        'a/b.txt',
        'm1',
        9,
        2,
        50,
        ListHistoryOrderByEnum.CreationTime,
        ListHistoryOrderByTypeEnum.Asc,
        'token-1',
        'secret-1',
        { headers: { 'X-Custom': '2' } },
      );

      expect(req.url).toContain('marker=m1');
      expect(req.url).toContain('limit=9');
      expect(req.url).toContain('page=2');
      expect(req.url).toContain('page_size=50');
      expect(req.url).toContain('order_by=creationTime');
      expect(req.url).toContain('order_by_type=asc');
      expect(req.url).toContain('access_token=token-1');
      expect(req.url).toContain('library_secret=secret-1');
      expect(req.options.headers).toMatchObject({
        'X-From-BaseOptions': '1',
        'X-Custom': '2',
      });
    });

    it('HistoryApi OOP 方法应全部可调用', async () => {
      const mockAxios = createMockAxios();
      const api = new HistoryApi(config, BASE, mockAxios);

      await expect(api.deleteHistory({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        accessToken: 'token-1',
        requestBody: ['h-1'],
      })).resolves.toBeDefined();

      await expect(api.emptyHistory({ libraryId: 'lib-1', accessToken: 'token-1' })).resolves.toBeDefined();
      await expect(api.getHistoryConfig({ libraryId: 'lib-1', accessToken: 'token-1' })).resolves.toBeDefined();
      await expect(api.listHistory({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: 'a/b.txt',
        accessToken: 'token-1',
      })).resolves.toBeDefined();
      await expect(api.setHistoryConfig({
        libraryId: 'lib-1',
        accessToken: 'token-1',
        setHistoryConfigRequest: { enableFileHistory: true } as any,
      })).resolves.toBeDefined();
      await expect(api.setHistoryLatest({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        historyId: 'h-1',
        accessToken: 'token-1',
      })).resolves.toBeDefined();
    });
  });

  describe('QuotaApi', () => {
    it('QuotaApiAxiosParamCreator 应覆盖 userId 可选参数分支', async () => {
      const creator = QuotaApiAxiosParamCreator(config);

      const createReq = await creator.createQuota(
        'lib-1',
        { capacity: '1024', removeWhenExceed: false, removeAfterDays: 7, spaces: ['space-1'] } as any,
        'token-1',
        'secret-1',
        'user-1',
      );
      expect(createReq.url).toContain('access_token=token-1');
      expect(createReq.url).toContain('library_secret=secret-1');
      expect(createReq.url).toContain('user_id=user-1');

      const getReq = await creator.getQuota('lib-1', 'space-1', 'token-1', 'secret-1', 'user-1');
      expect(getReq.url).toContain('user_id=user-1');

      const infoReq = await creator.getQuotaInfo('lib-1', 'q-1', 'token-1', 'secret-1', 'user-1');
      expect(infoReq.url).toContain('user_id=user-1');

      const updateReq = await creator.updateQuota('lib-1', 'space-1', { capacity: '2048' } as any, 'token-1', 'secret-1', 'user-1');
      expect(updateReq.url).toContain('user_id=user-1');

      const updateByIdReq = await creator.updateQuotaById('lib-1', 'q-1', { capacity: '2048' } as any, 'token-1', 'secret-1', 'user-1');
      expect(updateByIdReq.url).toContain('user_id=user-1');
    });

    it('QuotaApi OOP 方法应全部可调用', async () => {
      const mockAxios = createMockAxios();
      const api = new QuotaApi(config, BASE, mockAxios);

      await expect(api.createQuota({
        libraryId: 'lib-1',
        accessToken: 'token-1',
        createQuotaRequest: { capacity: '1024', removeWhenExceed: false, removeAfterDays: 7, spaces: ['space-1'] } as any,
        userId: 'user-1',
      })).resolves.toBeDefined();

      await expect(api.getQuota({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        accessToken: 'token-1',
        userId: 'user-1',
      })).resolves.toBeDefined();

      await expect(api.getQuotaInfo({
        libraryId: 'lib-1',
        quotaId: 'q-1',
        accessToken: 'token-1',
        userId: 'user-1',
      })).resolves.toBeDefined();

      await expect(api.updateQuota({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        accessToken: 'token-1',
        updateQuotaRequest: { capacity: '2048' } as any,
        userId: 'user-1',
      })).resolves.toBeDefined();

      await expect(api.updateQuotaById({
        libraryId: 'lib-1',
        quotaId: 'q-1',
        accessToken: 'token-1',
        updateQuotaByIdRequest: { capacity: '2048' } as any,
        userId: 'user-1',
      })).resolves.toBeDefined();
    });
  });

  describe('RecycledApi', () => {
    it('RecycledApiAxiosParamCreator 应覆盖可选查询参数分支', async () => {
      const creator = RecycledApiAxiosParamCreator(config);

      const listReq = await creator.recycleList(
        'lib-1',
        'space-1',
        RecycleListByMarkerEnum.NUMBER_1,
        'm1',
        20,
        RecycleListOrderByEnum.RemovalTime,
        RecycleListOrderByTypeEnum.Desc,
        'token-1',
        'secret-1',
        'user-1',
      );
      expect(listReq.url).toContain('by-marker=1');
      expect(listReq.url).toContain('marker=m1');
      expect(listReq.url).toContain('limit=20');
      expect(listReq.url).toContain('order_by=removalTime');
      expect(listReq.url).toContain('order_by_type=desc');
      expect(listReq.url).toContain('access_token=token-1');
      expect(listReq.url).toContain('library_secret=secret-1');
      expect(listReq.url).toContain('user_id=user-1');

      const listByPageReq = await creator.recycleListByPage(
        'lib-1',
        'space-1',
        RecycleListByPageByPageEnum.NUMBER_1,
        2,
        50,
        RecycleListByPageOrderByEnum.Size,
        RecycleListByPageOrderByTypeEnum.Asc,
        'token-1',
        'secret-1',
        'user-1',
      );
      expect(listByPageReq.url).toContain('by-page=1');
      expect(listByPageReq.url).toContain('page=2');
      expect(listByPageReq.url).toContain('page_size=50');
      expect(listByPageReq.url).toContain('order_by=size');
      expect(listByPageReq.url).toContain('order_by_type=asc');

      const previewReq = await creator.recyclePreview(
        'lib-1',
        'space-1',
        11,
        1,
        'pic',
        120,
        80,
        600,
        400,
        2,
        'token-1',
      );
      expect(previewReq.url).toContain('preview=1');
      expect(previewReq.url).toContain('type=pic');
      expect(previewReq.url).toContain('size=120');
      expect(previewReq.url).toContain('scale=80');
      expect(previewReq.url).toContain('width_size=600');
      expect(previewReq.url).toContain('height_size=400');
      expect(previewReq.url).toContain('frame_number=2');

      const restoreReq = await creator.recycleRestore(
        'lib-1',
        'space-1',
        11,
        RecycleRestoreRestoreEnum.NUMBER_1,
        RecycleRestoreConflictResolutionStrategyEnum.Overwrite,
        'token-1',
        'secret-1',
        'user-1',
        RecycleRestoreRestorePathStrategyEnum.FallbackToRoot,
      );
      expect(restoreReq.url).toContain('restore=1');
      expect(restoreReq.url).toContain('conflict_resolution_strategy=overwrite');
      expect(restoreReq.url).toContain('restore_path_strategy=fallbackToRoot');

      const restoreBatchReq = await creator.recycleRestoreBatch(
        'lib-1',
        'space-1',
        1,
        [1, 2],
        'token-1',
        'secret-1',
        'user-1',
        RecycleRestoreBatchRestorePathStrategyEnum.FallbackToRoot,
      );
      expect(restoreBatchReq.url).toContain('restore=1');
      expect(restoreBatchReq.url).toContain('user_id=user-1');
      expect(restoreBatchReq.url).toContain('restore_path_strategy=fallbackToRoot');
    });

    it('RecycledApi OOP 方法应全部可调用', async () => {
      const mockAxios = createMockAxios();
      const api = new RecycledApi(config, BASE, mockAxios);

      await expect(api.recycleEmpty({ libraryId: 'lib-1', spaceId: 'space-1', accessToken: 'token-1', userId: 'user-1' })).resolves.toBeDefined();
      await expect(api.recycleInfo({ libraryId: 'lib-1', spaceId: 'space-1', recycledItemId: 11, info: 1, accessToken: 'token-1' })).resolves.toBeDefined();
      await expect(api.recycleList({ libraryId: 'lib-1', spaceId: 'space-1', byMarker: RecycleListByMarkerEnum.NUMBER_1, accessToken: 'token-1' })).resolves.toBeDefined();
      await expect(api.recycleListByPage({ libraryId: 'lib-1', spaceId: 'space-1', byPage: RecycleListByPageByPageEnum.NUMBER_1, accessToken: 'token-1' })).resolves.toBeDefined();
      await expect(api.recyclePreview({ libraryId: 'lib-1', spaceId: 'space-1', recycledItemId: 11, preview: 1, accessToken: 'token-1' })).resolves.toBeDefined();
      await expect(api.recyclePurge({ libraryId: 'lib-1', spaceId: 'space-1', recycledItemId: 11, accessToken: 'token-1', userId: 'user-1' })).resolves.toBeDefined();
      await expect(api.recyclePurgeBatch({ libraryId: 'lib-1', spaceId: 'space-1', _delete: 1, accessToken: 'token-1', recyclePurgeBatchRequest: [1, 2], userId: 'user-1' })).resolves.toBeDefined();
      await expect(api.recycleRestore({ libraryId: 'lib-1', spaceId: 'space-1', recycledItemId: 11, restore: RecycleRestoreRestoreEnum.NUMBER_1, accessToken: 'token-1', userId: 'user-1' })).resolves.toBeDefined();
      await expect(api.recycleRestoreBatch({ libraryId: 'lib-1', spaceId: 'space-1', restore: 1, accessToken: 'token-1', recycleRestoreBatchRequest: [1, 2], userId: 'user-1' })).resolves.toBeDefined();
      await expect(api.recycleSetLifecycle({ libraryId: 'lib-1', spaceId: 'space-1', lifecycle: 1, accessToken: 'token-1', recycleSetLifecycleRequest: { retentionDays: 30 } as any })).resolves.toBeDefined();
    });
  });
});
