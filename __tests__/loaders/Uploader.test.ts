import { describe, it, expect, vi } from 'vitest';
import { Uploader } from '../../loaders/Uploader';
import { Configuration } from '../../configuration';
import { TaskStatus } from '../../loaders/types';

// Mock FileApi to avoid real network calls
vi.mock('../../apis/file-api', () => ({
  FileApi: class MockFileApi {
    simpleUploadFile = vi.fn();
    multipartUploadFile = vi.fn();
    completeFileUpload = vi.fn();
    abortFileUpload = vi.fn();
    renewMultipartUpload = vi.fn();
  },
}));

function createMockFile(name: string, size: number, type: string = 'text/plain'): File {
  // Create a minimal File-like object for testing
  const content = new Uint8Array(Math.min(size, 1024));
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  
  // Override size for large file testing without allocating memory
  if (size > 1024) {
    Object.defineProperty(file, 'size', { value: size, writable: false });
  }
  
  return file;
}

const config = new Configuration({ basePath: 'https://test.api.com' });

describe('Uploader', () => {
  describe('constructor', () => {
    it('should create uploader with valid options', () => {
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
      }, config);

      expect(uploader.state).toBe(TaskStatus.WAITING);
      expect(uploader.file.name).toBe('test.txt');
      expect(uploader.file.size).toBe(100);
    });

    it('should throw for file with NaN size', () => {
      const file = createMockFile('test.txt', 100);
      Object.defineProperty(file, 'size', { value: NaN, writable: false });

      expect(() => new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
      }, config)).toThrow('Invalid file');
    });

    it('should throw for invalid partFileSize (too small)', () => {
      const file = createMockFile('test.txt', 100);
      expect(() => new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
        partFileSize: 0.5,
      }, config)).toThrow('partFileSize must be between');
    });

    it('should throw for invalid partFileSize (too large)', () => {
      const file = createMockFile('test.txt', 100);
      expect(() => new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
        partFileSize: 6000,
      }, config)).toThrow('partFileSize must be between');
    });

    it('should use default chunkSize of 5MB', () => {
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
      }, config);

      const checkpoint = uploader.getCheckpoint();
      expect(checkpoint.chunk_size).toBe(5 * 1024 * 1024);
    });

    it('should accept custom chunkSize', () => {
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
        chunkSize: 10,
      }, config);

      const checkpoint = uploader.getCheckpoint();
      expect(checkpoint.chunk_size).toBe(10 * 1024 * 1024);
    });
  });

  describe('getCheckpoint', () => {
    it('should return complete checkpoint object', () => {
      const file = createMockFile('test.txt', 2048);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
      }, config);

      const cp = uploader.getCheckpoint();
      expect(cp).toEqual(expect.objectContaining({
        id: expect.stringContaining('upload_'),
        file: { name: 'test.txt', size: 2048, type: 'text/plain' },
        state: TaskStatus.WAITING,
        progress: 0,
        loaded: 0,
        chunk_size: 5 * 1024 * 1024,
        part_info_list: [],
        rapid_upload: false,
      }));
    });
  });

  describe('restoreCheckpoint', () => {
    it('should restore from checkpoint', () => {
      const file = createMockFile('test.txt', 1000);
      const checkpoint = {
        id: 'upload_123',
        file: { name: 'test.txt', size: 1000 },
        state: TaskStatus.PAUSED,
        progress: 50,
        loaded: 500,
        upload_id: 'uid-1',
        confirm_key: 'ck-1',
        bucket: 'my-bucket',
        region: 'ap-guangzhou',
        key: 'files/test.txt',
        chunk_size: 5 * 1024 * 1024,
        part_info_list: [
          { part_number: 1, chunk_size: 500, from: 0, to: 500, etag: 'etag1' },
          { part_number: 2, chunk_size: 500, from: 500, to: 1000 },
        ],
      };

      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
        checkpoint: checkpoint as any,
      }, config);

      expect(uploader.state).toBe(TaskStatus.PAUSED);
      expect(uploader.progress).toBe(50);
      expect(uploader.loaded).toBe(500);

      const cp = uploader.getCheckpoint();
      expect(cp.upload_id).toBe('uid-1');
      expect(cp.confirm_key).toBe('ck-1');
      expect(cp.part_info_list).toHaveLength(2);
    });
  });

  describe('start', () => {
    it('should not start if already running', async () => {
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
      }, config);

      // Change state to running manually
      (uploader as any).state = TaskStatus.RUNNING;
      const stateHandler = vi.fn();
      uploader.on('statechange', stateHandler);
      await uploader.start();
      expect(stateHandler).not.toHaveBeenCalled();
    });

    it('should not start if already SUCCESS', async () => {
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
      }, config);

      (uploader as any).state = TaskStatus.SUCCESS;
      const stateHandler = vi.fn();
      uploader.on('statechange', stateHandler);
      await uploader.start();
      expect(stateHandler).not.toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should emit statechange to paused', async () => {
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
      }, config);

      (uploader as any).state = TaskStatus.RUNNING;
      await uploader.pause();
      expect(uploader.state).toBe(TaskStatus.PAUSED);
    });
  });

  describe('cancel', () => {
    it('should not cancel twice', async () => {
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
      }, config);

      (uploader as any).state = TaskStatus.RUNNING;
      await uploader.cancel();
      expect(uploader.state).toBe(TaskStatus.CANCELED);

      const handler = vi.fn();
      uploader.on('statechange', handler);
      await uploader.cancel();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('should invoke onStateChange callback', async () => {
      const onStateChange = vi.fn();
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
        onStateChange,
      }, config);

      (uploader as any).state = TaskStatus.RUNNING;
      await uploader.pause();
      expect(onStateChange).toHaveBeenCalledWith(
        expect.any(Object),
        TaskStatus.PAUSED,
        undefined
      );
    });

    it('should not throw if onStateChange callback throws', async () => {
      const onStateChange = vi.fn().mockImplementation(() => {
        throw new Error('callback error');
      });
      const file = createMockFile('test.txt', 100);
      const uploader = new Uploader({
        libraryId: 'lib-1',
        spaceId: 'space-1',
        filePath: '/test.txt',
        file,
        accessToken: 'token-123',
        onStateChange,
      }, config);

      (uploader as any).state = TaskStatus.RUNNING;
      await expect(uploader.pause()).resolves.not.toThrow();
    });
  });
});
