import { describe, it, expect } from 'vitest';
import {
  RecycledApiAxiosParamCreator,
  RecycleListByMarkerEnum,
  RecycleListOrderByEnum,
  RecycleListOrderByTypeEnum,
  RecycleListByPageByPageEnum,
  RecycleRestoreRestoreEnum,
  RecycleRestoreConflictResolutionStrategyEnum,
  RecycleRestoreRestorePathStrategyEnum,
  RecycleRestoreBatchRestorePathStrategyEnum,
} from '../../apis/recycled-api';

const paramCreator = RecycledApiAxiosParamCreator();

describe('RecycledApi', () => {
  describe('recycleEmpty', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.recycleEmpty('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('DELETE');
    });

    it('should include userId when provided', async () => {
      const result = await paramCreator.recycleEmpty('lib-1', 'space-1', 'token-123', 'user-1');

      expect(result.url).toContain('user_id=user-1');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.recycleEmpty(null as any, 'space-1', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.recycleEmpty('lib-1', null as any, 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.recycleEmpty('lib-1', 'space-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('recycleInfo', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.recycleInfo('lib-1', 'space-1', 42, 1);

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1/42');
      expect(result.url).toContain('info=1');
      expect(result.options.method).toBe('GET');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.recycleInfo(null as any, 'space-1', 42, 1)).rejects.toThrow('libraryId');
      await expect(paramCreator.recycleInfo('lib-1', null as any, 42, 1)).rejects.toThrow('spaceId');
      await expect(paramCreator.recycleInfo('lib-1', 'space-1', null as any, 1)).rejects.toThrow('recycledItemId');
      await expect(paramCreator.recycleInfo('lib-1', 'space-1', 42, null as any)).rejects.toThrow('info');
    });
  });

  describe('recycleList', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.recycleList('lib-1', 'space-1', RecycleListByMarkerEnum.NUMBER_1);

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1');
      expect(result.url).toContain('by-marker=1');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional params', async () => {
      const result = await paramCreator.recycleList('lib-1', 'space-1', RecycleListByMarkerEnum.NUMBER_1, 'marker-1', 50, RecycleListOrderByEnum.RemovalTime, RecycleListOrderByTypeEnum.Desc, 'token-123', 'user-1');

      expect(result.url).toContain('marker=marker-1');
      expect(result.url).toContain('limit=50');
      expect(result.url).toContain('order_by=removalTime');
      expect(result.url).toContain('order_by_type=desc');
      expect(result.url).toContain('access_token=token-123');
      expect(result.url).toContain('user_id=user-1');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.recycleList(null as any, 'space-1', RecycleListByMarkerEnum.NUMBER_1)).rejects.toThrow('libraryId');
      await expect(paramCreator.recycleList('lib-1', null as any, RecycleListByMarkerEnum.NUMBER_1)).rejects.toThrow('spaceId');
      await expect(paramCreator.recycleList('lib-1', 'space-1', null as any)).rejects.toThrow('byMarker');
    });
  });

  describe('recycleListByPage', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.recycleListByPage('lib-1', 'space-1', RecycleListByPageByPageEnum.NUMBER_1);

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1');
      expect(result.url).toContain('by-page=1');
      expect(result.options.method).toBe('GET');
    });

    it('should include page params', async () => {
      const result = await paramCreator.recycleListByPage('lib-1', 'space-1', RecycleListByPageByPageEnum.NUMBER_1, 3, 50);

      expect(result.url).toContain('page=3');
      expect(result.url).toContain('page_size=50');
    });
  });

  describe('recyclePreview', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.recyclePreview('lib-1', 'space-1', 42, 1);

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1/42');
      expect(result.url).toContain('preview=1');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional preview params', async () => {
      const result = await paramCreator.recyclePreview('lib-1', 'space-1', 42, 1, 'pic', 200, 50, 800, 600, 10, 'token-123');

      expect(result.url).toContain('type=pic');
      expect(result.url).toContain('size=200');
      expect(result.url).toContain('scale=50');
      expect(result.url).toContain('width_size=800');
      expect(result.url).toContain('height_size=600');
      expect(result.url).toContain('frame_number=10');
      expect(result.url).toContain('access_token=token-123');
    });
  });

  describe('recyclePurge', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.recyclePurge('lib-1', 'space-1', 42, 'token-123');

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1/42');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('DELETE');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.recyclePurge(null as any, 'space-1', 42, 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.recyclePurge('lib-1', 'space-1', null as any, 'token-123')).rejects.toThrow('recycledItemId');
      await expect(paramCreator.recyclePurge('lib-1', 'space-1', 42, null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('recyclePurgeBatch', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.recyclePurgeBatch('lib-1', 'space-1', 1, 'token-123', [1, 2, 3]);

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1');
      expect(result.url).toContain('delete=1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });
  });

  describe('recycleRestore', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.recycleRestore('lib-1', 'space-1', 42, RecycleRestoreRestoreEnum.NUMBER_1, 'token-123');

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1/42');
      expect(result.url).toContain('restore=1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
    });

    it('should include optional conflict and path strategy params', async () => {
      const result = await paramCreator.recycleRestore('lib-1', 'space-1', 42, RecycleRestoreRestoreEnum.NUMBER_1, 'token-123', RecycleRestoreConflictResolutionStrategyEnum.Rename, 'user-1', RecycleRestoreRestorePathStrategyEnum.FallbackToRoot);

      expect(result.url).toContain('conflict_resolution_strategy=rename');
      expect(result.url).toContain('user_id=user-1');
      expect(result.url).toContain('restore_path_strategy=fallbackToRoot');
    });
  });

  describe('recycleRestoreBatch', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.recycleRestoreBatch('lib-1', 'space-1', 1, 'token-123', [1, 2, 3]);

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1');
      expect(result.url).toContain('restore=1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
    });

    it('should include restorePathStrategy when provided', async () => {
      const result = await paramCreator.recycleRestoreBatch('lib-1', 'space-1', 1, 'token-123', [1], 'user-1', RecycleRestoreBatchRestorePathStrategyEnum.OriginalPath);

      expect(result.url).toContain('restore_path_strategy=originalPath');
    });
  });

  describe('recycleSetLifecycle', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.recycleSetLifecycle('lib-1', 'space-1', 1, 'token-123', { recycleDays: 30 } as any);

      expect(result.url).toContain('/api/v1/recycled/lib-1/space-1');
      expect(result.url).toContain('lifecycle=1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.recycleSetLifecycle(null as any, 'space-1', 1, 'token-123', {} as any)).rejects.toThrow('libraryId');
      await expect(paramCreator.recycleSetLifecycle('lib-1', 'space-1', null as any, 'token-123', {} as any)).rejects.toThrow('lifecycle');
      await expect(paramCreator.recycleSetLifecycle('lib-1', 'space-1', 1, null as any, {} as any)).rejects.toThrow('accessToken');
      await expect(paramCreator.recycleSetLifecycle('lib-1', 'space-1', 1, 'token-123', null as any)).rejects.toThrow('recycleSetLifecycleRequest');
    });
  });

  describe('enums', () => {
    it('should have correct enum values', () => {
      expect(RecycleListByMarkerEnum.NUMBER_1).toBe(1);
      expect(RecycleListByPageByPageEnum.NUMBER_1).toBe(1);
      expect(RecycleListOrderByEnum.Name).toBe('name');
      expect(RecycleListOrderByEnum.RemovalTime).toBe('removalTime');
      expect(RecycleListOrderByEnum.RemainingTime).toBe('remainingTime');
      expect(RecycleRestoreRestoreEnum.NUMBER_1).toBe(1);
      expect(RecycleRestoreConflictResolutionStrategyEnum.Ask).toBe('ask');
      expect(RecycleRestoreConflictResolutionStrategyEnum.Rename).toBe('rename');
      expect(RecycleRestoreConflictResolutionStrategyEnum.Overwrite).toBe('overwrite');
      expect(RecycleRestoreRestorePathStrategyEnum.OriginalPath).toBe('originalPath');
      expect(RecycleRestoreRestorePathStrategyEnum.FallbackToRoot).toBe('fallbackToRoot');
    });
  });
});
