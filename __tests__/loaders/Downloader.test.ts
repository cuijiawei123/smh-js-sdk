import { describe, it, expect, vi } from 'vitest';
import { Downloader } from '../../loaders/Downloader';
import { Configuration } from '../../configuration';
import { TaskStatus } from '../../loaders/types';
import { ErrorCode } from '../../utils/ErrorHandler';

// Mock FileApi
vi.mock('../../apis/file-api', () => ({
  FileApi: class MockFileApi {
    infoFile = vi.fn();
  },
  FileApiInfoFileRequest: undefined,
}));

const config = new Configuration({ basePath: 'https://test.api.com' });

function createRemoteFile(overrides?: any) {
  return {
    name: 'test.txt',
    size: 2048,
    path: '/test.txt',
    type: 'text/plain',
    ...overrides,
  };
}

function createOptions(overrides?: any) {
  return {
    libraryId: 'lib-1',
    spaceId: 'space-1',
    filePath: '/test.txt',
    accessToken: 'token-123',
    ...overrides,
  };
}

describe('Downloader', () => {
  describe('constructor', () => {
    it('should create downloader with valid params', () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      expect(dl.state).toBe(TaskStatus.WAITING);
      expect(dl.file.name).toBe('test.txt');
      expect(dl.file.size).toBe(2048);
    });

    it('should throw for missing file path', () => {
      expect(() => new Downloader(
        { name: 'test.txt', size: 100, path: '' },
        createOptions(),
        config
      )).toThrow('Invalid remote file');
    });

    it('should throw for null file', () => {
      expect(() => new Downloader(
        null as any,
        createOptions(),
        config
      )).toThrow('Invalid remote file');
    });

    it('should default size to 0 when not provided', () => {
      const dl = new Downloader(
        { name: 'test.txt', path: '/test.txt' },
        createOptions(),
        config
      );
      expect(dl.file.size).toBe(0);
    });

    it('should use default chunkSize of 5MB', () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      const cp = dl.getCheckpoint();
      expect(cp.chunk_size).toBe(5 * 1024 * 1024);
    });

    it('should accept custom chunkSize', () => {
      const dl = new Downloader(
        createRemoteFile(),
        createOptions({ chunkSize: 10 }),
        config
      );
      const cp = dl.getCheckpoint();
      expect(cp.chunk_size).toBe(10 * 1024 * 1024);
    });

    it('should use default partFileSize threshold of 32MB', () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      // Access private field through type casting
      expect((dl as any).MULTIPART_THRESHOLD).toBe(32 * 1024 * 1024);
    });
  });

  describe('getCheckpoint', () => {
    it('should return complete checkpoint', () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      const cp = dl.getCheckpoint();
      expect(cp).toEqual(expect.objectContaining({
        id: expect.stringContaining('download_'),
        file: { name: 'test.txt', size: 2048, type: 'text/plain' },
        state: TaskStatus.WAITING,
        progress: 0,
        loaded: 0,
        chunk_size: 5 * 1024 * 1024,
        part_info_list: [],
        is_multipart: false,
      }));
    });
  });

  describe('restoreCheckpoint', () => {
    it('should restore from checkpoint', () => {
      const checkpoint = {
        id: 'download_123',
        file: { name: 'test.txt', size: 2048 },
        state: TaskStatus.PAUSED,
        progress: 50,
        loaded: 1024,
        download_url: 'https://cos.example.com/file',
        chunk_size: 5 * 1024 * 1024,
        part_info_list: [
          { part_number: 1, start: 0, end: 1023, size: 1024, done: true, crc64: '123' },
          { part_number: 2, start: 1024, end: 2047, size: 1024, done: false },
        ],
        remote_crc64: '456789',
        is_multipart: true,
      };

      const dl = new Downloader(
        createRemoteFile(),
        createOptions({ checkpoint }),
        config
      );

      expect(dl.state).toBe(TaskStatus.PAUSED);
      expect(dl.progress).toBe(50);
      expect(dl.loaded).toBe(1024);

      const cp = dl.getCheckpoint();
      expect(cp.download_url).toBe('https://cos.example.com/file');
      expect(cp.part_info_list).toHaveLength(2);
      expect(cp.remote_crc64).toBe('456789');
      expect(cp.is_multipart).toBe(true);
    });
  });

  describe('state management', () => {
    it('should not start if already running', async () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      (dl as any).state = TaskStatus.RUNNING;
      const handler = vi.fn();
      dl.on('statechange', handler);
      await dl.start();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not start if already SUCCESS', async () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      (dl as any).state = TaskStatus.SUCCESS;
      const handler = vi.fn();
      dl.on('statechange', handler);
      await dl.start();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should transition to PAUSED', async () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      (dl as any).state = TaskStatus.RUNNING;
      await dl.pause();
      expect(dl.state).toBe(TaskStatus.PAUSED);
    });
  });

  describe('cancel', () => {
    it('should transition to CANCELED and clean up', async () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      (dl as any).state = TaskStatus.RUNNING;
      await dl.cancel();
      expect(dl.state).toBe(TaskStatus.CANCELED);
      expect(dl.loaded).toBe(0);
      expect(dl.progress).toBe(0);
      expect(dl.getResult()).toBeUndefined();
    });

    it('should clean up multipart data on cancel', async () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      (dl as any).state = TaskStatus.RUNNING;
      (dl as any).is_multipart = true;
      (dl as any).part_info_list = [
        { part_number: 1, start: 0, end: 1023, size: 1024, done: true, blob: new Blob(['test']) },
      ];
      await dl.cancel();
      expect((dl as any).part_info_list[0].blob).toBeUndefined();
      expect((dl as any).part_info_list[0].done).toBe(false);
    });
  });

  describe('getResult', () => {
    it('should return undefined before download completes', () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      expect(dl.getResult()).toBeUndefined();
    });
  });

  describe('startAndGetBlob', () => {
    it('should throw if already in progress with no result', async () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      (dl as any).state = TaskStatus.RUNNING;
      await expect(dl.startAndGetBlob()).rejects.toThrow('Download already in progress');
    });

    it('should return existing blob if available', async () => {
      const dl = new Downloader(createRemoteFile(), createOptions(), config);
      (dl as any).state = TaskStatus.RUNNING;
      const blob = new Blob(['test']);
      (dl as any).resultBlob = blob;
      const result = await dl.startAndGetBlob();
      expect(result).toBe(blob);
    });
  });

  describe('callbacks', () => {
    it('should invoke onStateChange callback', async () => {
      const onStateChange = vi.fn();
      const dl = new Downloader(
        createRemoteFile(),
        createOptions({ onStateChange }),
        config
      );

      (dl as any).state = TaskStatus.RUNNING;
      await dl.pause();
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
      const dl = new Downloader(
        createRemoteFile(),
        createOptions({ onStateChange }),
        config
      );

      (dl as any).state = TaskStatus.RUNNING;
      await expect(dl.pause()).resolves.not.toThrow();
    });
  });
});
