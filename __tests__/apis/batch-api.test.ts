import { describe, it, expect } from 'vitest';
import { BatchApiAxiosParamCreator, BatchCopyCopyEnum, BatchDeleteDeleteEnum, BatchMoveMoveEnum } from '../../apis/batch-api';

const paramCreator = BatchApiAxiosParamCreator();

describe('BatchApi', () => {
  describe('batchCopy', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.batchCopy('lib-1', 'space-1', BatchCopyCopyEnum.NUMBER_1, 'token-123', [{ from: '/a', to: '/b' }] as any);

      expect(result.url).toContain('/api/v1/batch/lib-1/space-1');
      expect(result.url).toContain('copy=1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should include userId when provided', async () => {
      const result = await paramCreator.batchCopy('lib-1', 'space-1', BatchCopyCopyEnum.NUMBER_1, 'token-123', [], 'user-1');

      expect(result.url).toContain('user_id=user-1');
    });

    it('should throw when libraryId is missing', async () => {
      await expect(paramCreator.batchCopy(null as any, 'space-1', BatchCopyCopyEnum.NUMBER_1, 'token-123', [])).rejects.toThrow('libraryId');
    });

    it('should throw when spaceId is missing', async () => {
      await expect(paramCreator.batchCopy('lib-1', null as any, BatchCopyCopyEnum.NUMBER_1, 'token-123', [])).rejects.toThrow('spaceId');
    });

    it('should throw when accessToken is missing', async () => {
      await expect(paramCreator.batchCopy('lib-1', 'space-1', BatchCopyCopyEnum.NUMBER_1, null as any, [])).rejects.toThrow('accessToken');
    });

    it('should throw when batchCopyRequest is missing', async () => {
      await expect(paramCreator.batchCopy('lib-1', 'space-1', BatchCopyCopyEnum.NUMBER_1, 'token-123', null as any)).rejects.toThrow('batchCopyRequest');
    });
  });

  describe('batchDelete', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.batchDelete('lib-1', 'space-1', BatchDeleteDeleteEnum.NUMBER_1, 'token-123', [{ path: '/a' }] as any);

      expect(result.url).toContain('/api/v1/batch/lib-1/space-1');
      expect(result.url).toContain('delete=1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.batchDelete(null as any, 'space-1', BatchDeleteDeleteEnum.NUMBER_1, 'token-123', [])).rejects.toThrow('libraryId');
      await expect(paramCreator.batchDelete('lib-1', null as any, BatchDeleteDeleteEnum.NUMBER_1, 'token-123', [])).rejects.toThrow('spaceId');
      await expect(paramCreator.batchDelete('lib-1', 'space-1', null as any, 'token-123', [])).rejects.toThrow('_delete');
      await expect(paramCreator.batchDelete('lib-1', 'space-1', BatchDeleteDeleteEnum.NUMBER_1, null as any, [])).rejects.toThrow('accessToken');
      await expect(paramCreator.batchDelete('lib-1', 'space-1', BatchDeleteDeleteEnum.NUMBER_1, 'token-123', null as any)).rejects.toThrow('batchDeleteRequest');
    });
  });

  describe('batchMove', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.batchMove('lib-1', 'space-1', BatchMoveMoveEnum.NUMBER_1, 'token-123', [{ from: '/a', to: '/b' }] as any);

      expect(result.url).toContain('/api/v1/batch/lib-1/space-1');
      expect(result.url).toContain('move=1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.batchMove(null as any, 'space-1', BatchMoveMoveEnum.NUMBER_1, 'token-123', [])).rejects.toThrow('libraryId');
      await expect(paramCreator.batchMove('lib-1', null as any, BatchMoveMoveEnum.NUMBER_1, 'token-123', [])).rejects.toThrow('spaceId');
      await expect(paramCreator.batchMove('lib-1', 'space-1', null as any, 'token-123', [])).rejects.toThrow('move');
      await expect(paramCreator.batchMove('lib-1', 'space-1', BatchMoveMoveEnum.NUMBER_1, null as any, [])).rejects.toThrow('accessToken');
    });
  });

  describe('enums', () => {
    it('should have correct enum values', () => {
      expect(BatchCopyCopyEnum.NUMBER_1).toBe(1);
      expect(BatchDeleteDeleteEnum.NUMBER_1).toBe(1);
      expect(BatchMoveMoveEnum.NUMBER_1).toBe(1);
    });
  });
});
