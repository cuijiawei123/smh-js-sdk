import { describe, it, expect } from 'vitest';
import { SearchApiAxiosParamCreator, SearchFsWithFavoriteStatusEnum } from '../../apis/search-api';

const paramCreator = SearchApiAxiosParamCreator();

describe('SearchApi', () => {
  describe('searchFs', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.searchFs('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('/api/v1/search/lib-1/space-1/search-fs');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should include optional userId', async () => {
      const result = await paramCreator.searchFs('lib-1', 'space-1', 'token-123', 'user-1');

      expect(result.url).toContain('user_id=user-1');
    });

    it('should include optional marker and limit', async () => {
      const result = await paramCreator.searchFs('lib-1', 'space-1', 'token-123', undefined, 'next-marker', 50);

      expect(result.url).toContain('marker=next-marker');
      expect(result.url).toContain('limit=50');
    });

    it('should include withFavoriteStatus param', async () => {
      const result = await paramCreator.searchFs('lib-1', 'space-1', 'token-123', undefined, undefined, undefined, SearchFsWithFavoriteStatusEnum.NUMBER_1);

      expect(result.url).toContain('with_favorite_status=1');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.searchFs(null as any, 'space-1', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.searchFs('lib-1', null as any, 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.searchFs('lib-1', 'space-1', null as any)).rejects.toThrow('accessToken');
    });

    it('should encode path params', async () => {
      const result = await paramCreator.searchFs('lib/1', 'space/1', 'token-123');

      expect(result.url).toContain('lib%2F1');
      expect(result.url).toContain('space%2F1');
    });
  });

  describe('enums', () => {
    it('should have correct enum values', () => {
      expect(SearchFsWithFavoriteStatusEnum.NUMBER_0).toBe(0);
      expect(SearchFsWithFavoriteStatusEnum.NUMBER_1).toBe(1);
    });
  });
});
