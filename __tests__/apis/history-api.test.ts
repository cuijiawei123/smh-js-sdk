import { describe, it, expect } from 'vitest';
import { HistoryApiAxiosParamCreator, ListHistoryOrderByEnum, ListHistoryOrderByTypeEnum } from '../../apis/history-api';

const paramCreator = HistoryApiAxiosParamCreator();

describe('HistoryApi', () => {
  describe('deleteHistory', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.deleteHistory('lib-1', 'space-1', 'token-123', ['history-id-1', 'history-id-2']);

      expect(result.url).toContain('/api/v1/directory-history/lib-1/space-1/delete');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.deleteHistory(null as any, 'space-1', 'token-123', [])).rejects.toThrow('libraryId');
      await expect(paramCreator.deleteHistory('lib-1', null as any, 'token-123', [])).rejects.toThrow('spaceId');
      await expect(paramCreator.deleteHistory('lib-1', 'space-1', null as any, [])).rejects.toThrow('accessToken');
      await expect(paramCreator.deleteHistory('lib-1', 'space-1', 'token-123', null as any)).rejects.toThrow('requestBody');
    });
  });

  describe('emptyHistory', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.emptyHistory('lib-1', 'token-123');

      expect(result.url).toContain('/api/v1/directory-history/lib-1/library-history');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('DELETE');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.emptyHistory(null as any, 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.emptyHistory('lib-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('getHistoryConfig', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.getHistoryConfig('lib-1', 'token-123');

      expect(result.url).toContain('/api/v1/directory-history/lib-1/library-history');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.getHistoryConfig(null as any, 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.getHistoryConfig('lib-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('listHistory', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.listHistory('lib-1', 'space-1', 'foo/bar.txt', 'token-123');

      expect(result.url).toContain('/api/v1/directory-history/lib-1/space-1/history-list/foo%2Fbar.txt');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional pagination and sorting params', async () => {
      const result = await paramCreator.listHistory('lib-1', 'space-1', 'test.txt', 'token-123', 'marker-1', 50, 2, 30, ListHistoryOrderByEnum.CreationTime, ListHistoryOrderByTypeEnum.Asc);

      expect(result.url).toContain('marker=marker-1');
      expect(result.url).toContain('limit=50');
      expect(result.url).toContain('page=2');
      expect(result.url).toContain('page_size=30');
      expect(result.url).toContain('order_by=creationTime');
      expect(result.url).toContain('order_by_type=asc');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.listHistory(null as any, 'space-1', 'test.txt', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.listHistory('lib-1', null as any, 'test.txt', 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.listHistory('lib-1', 'space-1', null as any, 'token-123')).rejects.toThrow('filePath');
      await expect(paramCreator.listHistory('lib-1', 'space-1', 'test.txt', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('setHistoryConfig', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.setHistoryConfig('lib-1', 'token-123', { enableFileHistory: true } as any);

      expect(result.url).toContain('/api/v1/directory-history/lib-1/library-history');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.setHistoryConfig(null as any, 'token-123', {} as any)).rejects.toThrow('libraryId');
      await expect(paramCreator.setHistoryConfig('lib-1', null as any, {} as any)).rejects.toThrow('accessToken');
      await expect(paramCreator.setHistoryConfig('lib-1', 'token-123', null as any)).rejects.toThrow('setHistoryConfigRequest');
    });
  });

  describe('setHistoryLatest', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.setHistoryLatest('lib-1', 'space-1', 'history-42', 'token-123');

      expect(result.url).toContain('/api/v1/directory-history/lib-1/space-1/latest-version/history-42');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.setHistoryLatest(null as any, 'space-1', 'h-1', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.setHistoryLatest('lib-1', null as any, 'h-1', 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.setHistoryLatest('lib-1', 'space-1', null as any, 'token-123')).rejects.toThrow('historyId');
      await expect(paramCreator.setHistoryLatest('lib-1', 'space-1', 'h-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('enums', () => {
    it('should have correct enum values', () => {
      expect(ListHistoryOrderByEnum.Id).toBe('id');
      expect(ListHistoryOrderByEnum.CreationTime).toBe('creationTime');
      expect(ListHistoryOrderByTypeEnum.Asc).toBe('asc');
      expect(ListHistoryOrderByTypeEnum.Desc).toBe('desc');
    });
  });
});
