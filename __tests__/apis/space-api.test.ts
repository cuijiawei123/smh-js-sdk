import { describe, it, expect } from 'vitest';
import {
  SpaceApiAxiosParamCreator,
  DeleteSpaceForceEnum,
  GetContentsViewFilterEnum,
  GetContentsViewOrderByEnum,
  GetContentsViewOrderByTypeEnum,
} from '../../apis/space-api';

const paramCreator = SpaceApiAxiosParamCreator();

describe('SpaceApi', () => {
  describe('createSpace', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.createSpace('lib-1', 'token-123');

      expect(result.url).toContain('/api/v1/space/lib-1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should include optional userId', async () => {
      const result = await paramCreator.createSpace('lib-1', 'token-123', 'user-1');

      expect(result.url).toContain('user_id=user-1');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.createSpace(null as any, 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.createSpace('lib-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('deleteSpace', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.deleteSpace('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('/api/v1/space/lib-1/space-1');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('DELETE');
    });

    it('should include force param', async () => {
      const result = await paramCreator.deleteSpace('lib-1', 'space-1', 'token-123', undefined, DeleteSpaceForceEnum.NUMBER_1);

      expect(result.url).toContain('force=1');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.deleteSpace(null as any, 'space-1', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.deleteSpace('lib-1', null as any, 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.deleteSpace('lib-1', 'space-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('getContentsView', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.getContentsView('lib-1', 'space-1', GetContentsViewFilterEnum.OnlyFile);

      expect(result.url).toContain('/api/v1/space/lib-1/space-1/contents-view');
      expect(result.url).toContain('filter=onlyFile');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional params', async () => {
      const result = await paramCreator.getContentsView(
        'lib-1', 'space-1', GetContentsViewFilterEnum.OnlyDir,
        'marker-1', 50, GetContentsViewOrderByEnum.Size, GetContentsViewOrderByTypeEnum.Desc,
        true, 'token-123', 'user-1', 'doc',
      );

      expect(result.url).toContain('marker=marker-1');
      expect(result.url).toContain('limit=50');
      expect(result.url).toContain('order_by=size');
      expect(result.url).toContain('order_by_type=desc');
      expect(result.url).toContain('with_path=true');
      expect(result.url).toContain('access_token=token-123');
      expect(result.url).toContain('user_id=user-1');
      expect(result.url).toContain('category=doc');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.getContentsView(null as any, 'space-1', GetContentsViewFilterEnum.OnlyFile)).rejects.toThrow('libraryId');
      await expect(paramCreator.getContentsView('lib-1', null as any, GetContentsViewFilterEnum.OnlyFile)).rejects.toThrow('spaceId');
      await expect(paramCreator.getContentsView('lib-1', 'space-1', null as any)).rejects.toThrow('filter');
    });
  });

  describe('getFileCountInSpace', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.getFileCountInSpace('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('/api/v1/space/lib-1/space-1/file-count');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.getFileCountInSpace(null as any, 'space-1', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.getFileCountInSpace('lib-1', null as any, 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.getFileCountInSpace('lib-1', 'space-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('getLibrarySpaceCount', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.getLibrarySpaceCount('lib-1', 'token-123');

      expect(result.url).toContain('/api/v1/space/lib-1/count');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.getLibrarySpaceCount(null as any, 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.getLibrarySpaceCount('lib-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('getSpaceExtension', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.getSpaceExtension('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('/api/v1/space/lib-1/space-1/extension');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });
  });

  describe('getSpaceSize', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.getSpaceSize('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('/api/v1/space/lib-1/space-1/size');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('GET');
    });
  });

  describe('listSpace', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.listSpace('lib-1');

      expect(result.url).toContain('/api/v1/space/lib-1/list');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional params', async () => {
      const result = await paramCreator.listSpace('lib-1', 'token-123', 'user-1', 'marker-1', 50);

      expect(result.url).toContain('access_token=token-123');
      expect(result.url).toContain('user_id=user-1');
      expect(result.url).toContain('marker=marker-1');
      expect(result.url).toContain('limit=50');
    });

    it('should throw when libraryId is missing', async () => {
      await expect(paramCreator.listSpace(null as any)).rejects.toThrow('libraryId');
    });
  });

  describe('setSpaceTrafficLimit', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.setSpaceTrafficLimit('lib-1', 'space-1', 'token-123', { trafficLimit: 1024 } as any);

      expect(result.url).toContain('/api/v1/space/lib-1/space-1/traffic-limit');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
      expect(result.options.headers?.['Content-Type']).toBe('application/json');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.setSpaceTrafficLimit(null as any, 'space-1', 'token-123', {} as any)).rejects.toThrow('libraryId');
      await expect(paramCreator.setSpaceTrafficLimit('lib-1', 'space-1', null as any, {} as any)).rejects.toThrow('accessToken');
      await expect(paramCreator.setSpaceTrafficLimit('lib-1', 'space-1', 'token-123', null as any)).rejects.toThrow('setSpaceTrafficLimitRequest');
    });
  });

  describe('updateSpaceExtension', () => {
    it('should construct correct URL and params', async () => {
      const result = await paramCreator.updateSpaceExtension('lib-1', 'space-1', 'token-123');

      expect(result.url).toContain('/api/v1/space/lib-1/space-1/extension');
      expect(result.url).toContain('access_token=token-123');
      expect(result.options.method).toBe('POST');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.updateSpaceExtension(null as any, 'space-1', 'token-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.updateSpaceExtension('lib-1', null as any, 'token-123')).rejects.toThrow('spaceId');
      await expect(paramCreator.updateSpaceExtension('lib-1', 'space-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('enums', () => {
    it('should have correct enum values', () => {
      expect(DeleteSpaceForceEnum.NUMBER_0).toBe(0);
      expect(DeleteSpaceForceEnum.NUMBER_1).toBe(1);
      expect(GetContentsViewFilterEnum.OnlyDir).toBe('onlyDir');
      expect(GetContentsViewFilterEnum.OnlyFile).toBe('onlyFile');
      expect(GetContentsViewOrderByEnum.Name).toBe('name');
      expect(GetContentsViewOrderByEnum.ModificationTime).toBe('modificationTime');
      expect(GetContentsViewOrderByEnum.Size).toBe('size');
      expect(GetContentsViewOrderByEnum.CreationTime).toBe('creationTime');
      expect(GetContentsViewOrderByEnum.UploadTime).toBe('uploadTime');
      expect(GetContentsViewOrderByTypeEnum.Asc).toBe('asc');
      expect(GetContentsViewOrderByTypeEnum.Desc).toBe('desc');
    });
  });
});
