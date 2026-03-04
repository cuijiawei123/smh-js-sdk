import { describe, it, expect } from 'vitest';
import { TokenApiAxiosParamCreator, CreateTokenGrantEnum } from '../../apis/token-api';

const paramCreator = TokenApiAxiosParamCreator();

describe('TokenApi', () => {
  describe('createToken', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.createToken('lib-1', 'secret-123');

      expect(result.url).toContain('/api/v1/token');
      expect(result.url).toContain('library_id=lib-1');
      expect(result.url).toContain('library_secret=secret-123');
      expect(result.options.method).toBe('GET');
    });

    it('should include optional params', async () => {
      const result = await paramCreator.createToken('lib-1', 'secret-123', 'space-1', 'user-1', 'client-1', 'session-1', 3600, CreateTokenGrantEnum.Admin);

      expect(result.url).toContain('space_id=space-1');
      expect(result.url).toContain('user_id=user-1');
      expect(result.url).toContain('client_id=client-1');
      expect(result.url).toContain('session_id=session-1');
      expect(result.url).toContain('period=3600');
      expect(result.url).toContain('grant=admin');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.createToken(null as any, 'secret-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.createToken('lib-1', null as any)).rejects.toThrow('librarySecret');
    });
  });

  describe('deleteToken', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.deleteToken('lib-1', 'token-abc');

      expect(result.url).toContain('/api/v1/token/lib-1/token-abc');
      expect(result.options.method).toBe('DELETE');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.deleteToken(null as any, 'token-abc')).rejects.toThrow('libraryId');
      await expect(paramCreator.deleteToken('lib-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('deleteUserTokens', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.deleteUserTokens('lib-1', 'secret-123');

      expect(result.url).toContain('/api/v1/token/lib-1');
      expect(result.url).toContain('library_secret=secret-123');
      expect(result.options.method).toBe('DELETE');
    });

    it('should include optional params', async () => {
      const result = await paramCreator.deleteUserTokens('lib-1', 'secret-123', 'user-1', 'client-1,client-2', 'session-1');

      expect(result.url).toContain('user_id=user-1');
      expect(result.url).toContain('client_id=client-1%2Cclient-2');
      expect(result.url).toContain('session_id=session-1');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.deleteUserTokens(null as any, 'secret-123')).rejects.toThrow('libraryId');
      await expect(paramCreator.deleteUserTokens('lib-1', null as any)).rejects.toThrow('librarySecret');
    });
  });

  describe('renewToken', () => {
    it('should construct correct URL with required params', async () => {
      const result = await paramCreator.renewToken('lib-1', 'token-abc');

      expect(result.url).toContain('/api/v1/token/lib-1/token-abc');
      expect(result.options.method).toBe('POST');
    });

    it('should throw when required params are missing', async () => {
      await expect(paramCreator.renewToken(null as any, 'token-abc')).rejects.toThrow('libraryId');
      await expect(paramCreator.renewToken('lib-1', null as any)).rejects.toThrow('accessToken');
    });
  });

  describe('enums', () => {
    it('should have correct grant enum values', () => {
      expect(CreateTokenGrantEnum.Admin).toBe('admin');
      expect(CreateTokenGrantEnum.CreateSpace).toBe('create_space');
      expect(CreateTokenGrantEnum.DeleteSpace).toBe('delete_space');
      expect(CreateTokenGrantEnum.SpaceAdmin).toBe('space_admin');
      expect(CreateTokenGrantEnum.UploadFile).toBe('upload_file');
      expect(CreateTokenGrantEnum.DeleteFile).toBe('delete_file');
      expect(CreateTokenGrantEnum.MoveFile).toBe('move_file');
      expect(CreateTokenGrantEnum.CopyFile).toBe('copy_file');
      expect(CreateTokenGrantEnum.DeleteRecycled).toBe('delete_recycled');
      expect(CreateTokenGrantEnum.RestoreRecycled).toBe('restore_recycled');
    });
  });
});
