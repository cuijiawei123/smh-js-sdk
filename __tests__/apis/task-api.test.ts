import { describe, it, expect } from 'vitest';
import { TaskApiAxiosParamCreator } from '../../apis/task-api';

const paramCreator = TaskApiAxiosParamCreator();

describe('TaskApi', () => {
  describe('queryLibraryTask', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.queryLibraryTask('lib-1', '10,12,13', 'token-123');

      expect(result.url).toContain('/api/v1/task/lib-1/10%2C12%2C13');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional userId', async () => {
      const result = await paramCreator.queryLibraryTask('lib-1', '10', 'token-123', 'user-1');

      expect(result.url).toContain('user_id=user-1');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.queryLibraryTask(null as any, '10', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.queryLibraryTask('lib-1', null as any, 'token-123')).rejects.toThrow('taskIdList');
      await expect(paramCreator.queryLibraryTask('lib-1', '10', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('queryTask', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.queryTask('lib-1', 'space-1', '10,12', 'token-123');

      expect(result.url).toContain('/api/v1/task/lib-1/space-1/10%2C12');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional userId', async () => {
      const result = await paramCreator.queryTask('lib-1', 'space-1', '10', 'token-123', 'user-1');

      expect(result.url).toContain('user_id=user-1');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.queryTask(null as any, 'space-1', '10', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.queryTask('lib-1', null as any, '10', 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.queryTask('lib-1', 'space-1', null as any, 'token-123')).rejects.toThrow('taskIdList');
      await expect(paramCreator.queryTask('lib-1', 'space-1', '10', null as any)).rejects.toThrow('accessToken');
    });
  });
});
