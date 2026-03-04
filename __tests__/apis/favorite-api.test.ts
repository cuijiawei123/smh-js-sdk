import { describe, it, expect } from 'vitest';
import { FavoriteApiAxiosParamCreator, DeleteFavoriteCancelEnum, ListFavoriteOrderByEnum, ListFavoriteOrderByTypeEnum } from '../../apis/favorite-api';

const paramCreator = FavoriteApiAxiosParamCreator();

describe('FavoriteApi', () => {
  describe('createFavorite', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.createFavorite('lib-1', 'space-1', 'token-123', { path: '/test.txt' } as any);

      expect(result.url).toContain('/api/v1/favorite/lib-1/space-1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.createFavorite(null as any, 'space-1', 'token-123', {} as any)).rejects.toThrow('libraryId');
      await expect(paramCreator.createFavorite('lib-1', null as any, 'token-123', {} as any)).rejects.toThrow('spaceId');
      await expect(paramCreator.createFavorite('lib-1', 'space-1', null as any, {} as any)).rejects.toThrow('accessToken');
      await expect(paramCreator.createFavorite('lib-1', 'space-1', 'token-123', null as any)).rejects.toThrow('createFavoriteRequest');
    });
  });

  describe('deleteFavorite', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.deleteFavorite('lib-1', 'space-1', 'token-123', DeleteFavoriteCancelEnum.NUMBER_1, { path: '/test.txt' } as any);

      expect(result.url).toContain('/api/v1/favorite/lib-1/space-1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.url).toContain('cancel=1');
      expect(result.options.method).toBe('POST');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.deleteFavorite(null as any, 'space-1', 'token-123', DeleteFavoriteCancelEnum.NUMBER_1, {} as any)).rejects.toThrow('libraryId');
      await expect(paramCreator.deleteFavorite('lib-1', 'space-1', null as any, DeleteFavoriteCancelEnum.NUMBER_1, {} as any)).rejects.toThrow('accessToken');
      await expect(paramCreator.deleteFavorite('lib-1', 'space-1', 'token-123', null as any, {} as any)).rejects.toThrow('cancel');
    });
  });

  describe('listFavorite', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.listFavorite('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('/api/v1/favorite/lib-1/space-1/list');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional pagination params', async () => {
      const result = await paramCreator.listFavorite('lib-1', 'space-1', 'token-123', 'marker-1', 50);

      expect(result.url).toContain('marker=marker-1');
      expect(result.url).toContain('limit=50');
    });

    it('should include page-based pagination params', async () => {
      const result = await paramCreator.listFavorite('lib-1', 'space-1', 'token-123', undefined, undefined, 2, 30);

      expect(result.url).toContain('page=2');
      expect(result.url).toContain('page_size=30');
    });

    it('should include sorting params', async () => {
      const result = await paramCreator.listFavorite('lib-1', 'space-1', 'token-123', undefined, undefined, undefined, undefined, ListFavoriteOrderByEnum.FavoriteTime, ListFavoriteOrderByTypeEnum.Desc);

      expect(result.url).toContain('order_by=favoriteTime');
      expect(result.url).toContain('order_by_type=desc');
    });

    it('should include withPath param', async () => {
      const result = await paramCreator.listFavorite('lib-1', 'space-1', 'token-123', undefined, undefined, undefined, undefined, undefined, undefined, true);

      expect(result.url).toContain('with_path=true');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.listFavorite(null as any, 'space-1', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.listFavorite('lib-1', null as any, 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.listFavorite('lib-1', 'space-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('enums', () => {
    it('should have correct enum values', () => {
      expect(DeleteFavoriteCancelEnum.NUMBER_1).toBe(1);
      expect(ListFavoriteOrderByEnum.FavoriteTime).toBe('favoriteTime');
      expect(ListFavoriteOrderByTypeEnum.Asc).toBe('asc');
      expect(ListFavoriteOrderByTypeEnum.Desc).toBe('desc');
    });
  });
});
