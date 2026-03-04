import { describe, it, expect } from 'vitest';
import { RecentApiAxiosParamCreator } from '../../apis/recent-api';

const paramCreator = RecentApiAxiosParamCreator();

describe('RecentApi', () => {
  describe('listRecentlyUsedFile', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.listRecentlyUsedFile('lib-1', 'space-1');

      expect(result.url).toContain('/api/v1/recent/lib-1/space-1/recently-used-file');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should include accessToken when provided', async () => {
      const result = await paramCreator.listRecentlyUsedFile('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('access_token=token-123');
    });

    it('should not include accessToken when not provided', async () => {
      const result = await paramCreator.listRecentlyUsedFile('lib-1', 'space-1');

      expect(result.url).not.toContain('access_token');
    });

    it('should encode path params', async () => {
      const result = await paramCreator.listRecentlyUsedFile('lib/1', 'space/1');

      expect(result.url).toContain('lib%2F1');
      expect(result.url).toContain('space%2F1');
    });

    it('should throw when libraryId is missing', async () => {
      await expect(paramCreator.listRecentlyUsedFile(null as any, 'space-1')).rejects.toThrow('libraryId');
    });

    it('should throw when spaceId is missing', async () => {
      await expect(paramCreator.listRecentlyUsedFile('lib-1', null as any)).rejects.toThrow('spaceId');
    });
  });
});
